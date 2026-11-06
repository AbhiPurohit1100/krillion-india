import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { resolveAnswer } from "@/lib/services/resolutionService";
import { normalizeAnswer } from "@/lib/normalization";
import { evaluateTurnScore } from "@/lib/party/partyScoring";
import { advanceTurnOrRound, getFullRoomState } from "@/lib/party/roomService";

const SubmitPartyAnswerSchema = z.object({
  playerAnonId: z.string().min(1),
  rawAnswer: z.string(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code?.toUpperCase();
    if (!code) {
      return NextResponse.json({ error: "Missing room code" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = SubmitPartyAnswerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { playerAnonId, rawAnswer } = parsed.data;

    const room = await prisma.pufferRoom.findUnique({
      where: { code },
      include: {
        players: true,
        rounds: {
          where: { status: "ACTIVE" },
          include: { submissions: true },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Must be in active gameplay state
    if (room.status !== "PLAYER_TURN" && room.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Room is not currently in an active player turn." },
        { status: 400 }
      );
    }

    const player = room.players.find((p) => p.anon_id === playerAnonId && p.is_active);
    if (!player) {
      return NextResponse.json({ error: "Player not found or inactive." }, { status: 403 });
    }

    // Check turn order: ONLY the active player can submit
    const turnOrder = room.turn_order ? room.turn_order.split(",") : [];
    const activePlayerId = turnOrder[room.active_turn_index];

    if (activePlayerId !== player.id) {
      return NextResponse.json(
        { error: "It is not your turn to submit." },
        { status: 403 }
      );
    }

    const currentRound = room.rounds.find((r) => r.round_number === room.current_round);
    if (!currentRound) {
      return NextResponse.json({ error: "Current round not found." }, { status: 404 });
    }

    // Check server deadline
    const now = new Date();
    const deadline = room.round_deadline || currentRound.deadline;
    if (now.getTime() > new Date(deadline).getTime() + 1500) {
      return NextResponse.json(
        { error: "Turn timer has expired." },
        { status: 400 }
      );
    }

    // Prevent submitting multiple valid answers in the same turn
    const existingSubmission = currentRound.submissions.find((s) => s.player_id === player.id);
    if (existingSubmission) {
      return NextResponse.json(
        { error: "You have already completed your turn for this round." },
        { status: 400 }
      );
    }

    // 1. Resolve Answer via deterministic & fuzzy matching
    const resolution = await resolveAnswer(currentRound.question_id, rawAnswer);

    // Rule: "Invalid answers allow another attempt while time remains."
    if (!resolution.isValid) {
      return NextResponse.json({
        success: true,
        isValid: false,
        message: "Invalid answer. Try again before time runs out!",
        turnEnded: false,
      });
    }

    // 2. The answer IS valid.
    // Check answer uniqueness against previously accepted answers in this round
    const answerKey = (resolution.canonicalName || normalizeAnswer(rawAnswer)).toLowerCase().trim();
    const existingKeys = currentRound.submissions
      .filter((s) => s.is_valid)
      .map((s) => (s.canonical_name || s.normalized_answer).toLowerCase().trim());

    // Revised scoring: First submission of an answer gets 10 pts, duplicates get 0 pts
    const scoringResult = evaluateTurnScore(true, answerKey, existingKeys);

    // Persist submission atomically
    await prisma.$transaction(async (tx) => {
      await tx.pufferSubmission.create({
        data: {
          round_id: currentRound.id,
          player_id: player.id,
          raw_answer: rawAnswer.trim(),
          normalized_answer: normalizeAnswer(rawAnswer),
          canonical_name: resolution.canonicalName || null,
          is_valid: true,
          round_points: scoringResult.points,
        },
      });

      if (scoringResult.points > 0) {
        await tx.pufferPlayer.update({
          where: { id: player.id },
          data: {
            total_score: { increment: scoringResult.points },
          },
        });
      }
    });

    // Valid answer immediately ends the player's turn! Advance to next player
    const updatedState = await advanceTurnOrRound(code);

    return NextResponse.json({
      success: true,
      isValid: true,
      isDuplicate: scoringResult.isDuplicate,
      pointsEarned: scoringResult.points,
      canonicalName: resolution.canonicalName,
      turnEnded: true,
      room: updatedState,
    });
  } catch (err: any) {
    console.error("Submit party answer error:", err);
    return NextResponse.json(
      { error: "Failed to submit answer", details: err?.message },
      { status: 500 }
    );
  }
}
