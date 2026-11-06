import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getFullRoomState, pickFiveQuestions } from "@/lib/party/roomService";

const StartGameSchema = z.object({
  hostAnonId: z.string().min(1),
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
    const parsed = StartGameSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { hostAnonId } = parsed.data;

    const room = await prisma.pufferRoom.findUnique({
      where: { code },
      include: { players: true, rounds: true },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.host_id !== hostAnonId) {
      return NextResponse.json({ error: "Only the host can start the game." }, { status: 403 });
    }

    const activePlayers = room.players.filter((p) => p.is_active);
    if (activePlayers.length < 2) {
      return NextResponse.json(
        { error: "Need at least 2 players to start a Puffer Party." },
        { status: 400 }
      );
    }

    // Pick 5 questions for the 5 rounds
    const questions = await pickFiveQuestions();

    // 1. Randomly assign a playing order when match starts
    const shuffledPlayerIds = [...activePlayers]
      .sort(() => 0.5 - Math.random())
      .map((p) => p.id);

    // Turn 1 deadline: 30 seconds from now
    const now = new Date();
    const firstTurnDeadline = new Date(now.getTime() + 30 * 1000);

    // Create 5 rounds in DB & initialize round 1 turn 1
    await prisma.$transaction(async (tx) => {
      // Clear any existing rounds if restarting
      await tx.pufferSubmission.deleteMany({
        where: { round: { room_id: room.id } },
      });
      await tx.pufferRound.deleteMany({
        where: { room_id: room.id },
      });

      // Reset players' scores to 0
      await tx.pufferPlayer.updateMany({
        where: { room_id: room.id },
        data: { total_score: 0 },
      });

      // Create all 5 rounds
      for (let i = 0; i < 5; i++) {
        const q = questions[i];
        await tx.pufferRound.create({
          data: {
            room_id: room.id,
            round_number: i + 1,
            question_id: q.id,
            status: "ACTIVE",
            started_at: now,
            deadline: firstTurnDeadline,
          },
        });
      }

      // Update room state to PLAYER_TURN with turn order
      await tx.pufferRoom.update({
        where: { id: room.id },
        data: {
          status: "PLAYER_TURN",
          current_round: 1,
          round_deadline: firstTurnDeadline,
          turn_order: shuffledPlayerIds.join(","),
          active_turn_index: 0,
        },
      });
    });

    const updatedState = await getFullRoomState(code);
    return NextResponse.json({ success: true, room: updatedState });
  } catch (err: any) {
    console.error("Start game error:", err);
    return NextResponse.json(
      { error: "Failed to start game", details: err?.message },
      { status: 500 }
    );
  }
}
