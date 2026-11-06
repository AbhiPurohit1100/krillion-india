import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { advanceTurnOrRound, getFullRoomState } from "@/lib/party/roomService";

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code?.toUpperCase();
    if (!code) {
      return NextResponse.json({ error: "Missing room code" }, { status: 400 });
    }

    const room = await prisma.pufferRoom.findUnique({
      where: { code },
      include: {
        players: true,
        rounds: {
          orderBy: { round_number: "asc" },
          include: { submissions: true },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const now = new Date();

    // Case 1: Room is in PLAYER_TURN and active turn deadline expired
    if (room.status === "PLAYER_TURN" || (room.status as string) === "IN_PROGRESS") {
      // ONLY advance if deadline has ACTUALLY expired on the server!
      if (room.round_deadline && now.getTime() < new Date(room.round_deadline).getTime()) {
        const remainingMs = new Date(room.round_deadline).getTime() - now.getTime();
        return NextResponse.json({
          success: false,
          message: `Turn timer has not expired yet (${Math.ceil(remainingMs / 1000)}s remaining).`,
        });
      }

      const turnOrder = room.turn_order ? room.turn_order.split(",") : [];
      const activePlayerId = turnOrder[room.active_turn_index];
      const currentRound = room.rounds.find((r) => r.round_number === room.current_round);

      if (currentRound && activePlayerId) {
        // Record zero-point timeout submission if not already recorded
        const hasSub = currentRound.submissions.some((s) => s.player_id === activePlayerId);
        if (!hasSub) {
          await prisma.pufferSubmission.create({
            data: {
              round_id: currentRound.id,
              player_id: activePlayerId,
              raw_answer: "",
              normalized_answer: "",
              is_valid: false,
              round_points: 0,
            },
          });
        }
      }

      // Advance turn or round
      const updatedState = await advanceTurnOrRound(code);
      return NextResponse.json({ success: true, room: updatedState });
    }


    // Case 2: Room is in ROUND_RESULTS -> advance to next round
    if (room.status === "ROUND_RESULTS") {
      const nextRoundNumber = room.current_round + 1;

      if (nextRoundNumber > room.total_rounds) {
        await prisma.pufferRoom.update({
          where: { id: room.id },
          data: { status: "FINAL_RESULTS" },
        });
      } else {
        const nextRound = room.rounds.find((r) => r.round_number === nextRoundNumber);
        const deadline = new Date(now.getTime() + 30 * 1000);

        // Reshuffle or preserve turn order for next round
        const activePlayerIds = room.players
          .filter((p) => p.is_active)
          .sort(() => 0.5 - Math.random())
          .map((p) => p.id);

        if (nextRound) {
          await prisma.pufferRound.update({
            where: { id: nextRound.id },
            data: {
              status: "ACTIVE",
              started_at: now,
              deadline,
            },
          });
        }

        await prisma.pufferRoom.update({
          where: { id: room.id },
          data: {
            status: "PLAYER_TURN",
            current_round: nextRoundNumber,
            round_deadline: deadline,
            turn_order: activePlayerIds.join(","),
            active_turn_index: 0,
          },
        });
      }
    }

    const updatedState = await getFullRoomState(code);
    return NextResponse.json({ success: true, room: updatedState });
  } catch (err: any) {
    console.error("Advance turn/round error:", err);
    return NextResponse.json(
      { error: "Failed to advance turn or round", details: err?.message },
      { status: 500 }
    );
  }
}
