import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getFullRoomState } from "@/lib/party/roomService";

const JoinRoomSchema = z.object({
  anonId: z.string().min(1),
  nickname: z.string().min(1).max(25),
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
    const parsed = JoinRoomSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { anonId, nickname } = parsed.data;

    const room = await prisma.pufferRoom.findUnique({
      where: { code },
      include: { players: true },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found. Check your 6-character code." }, { status: 404 });
    }

    // Check if player is already in this room (reconnection)
    const existingPlayer = room.players.find((p) => p.anon_id === anonId);
    if (existingPlayer) {
      // Reconnect player, update nickname and active status
      await prisma.pufferPlayer.update({
        where: { id: existingPlayer.id },
        data: {
          is_active: true,
          nickname: nickname.trim(),
          last_seen: new Date(),
        },
      });

      const updatedState = await getFullRoomState(code);
      return NextResponse.json({
        success: true,
        player: { ...existingPlayer, is_active: true, nickname: nickname.trim() },
        room: updatedState,
      });
    }

    // Cannot join if game has already started and you weren't an existing player
    if (room.status !== "WAITING") {
      return NextResponse.json(
        { error: "Game has already started. You cannot join mid-game." },
        { status: 403 }
      );
    }

    // Enforce 8-player maximum
    const activeCount = room.players.filter((p) => p.is_active).length;
    if (activeCount >= room.max_players) {
      return NextResponse.json(
        { error: "Room is full (max 8 players reached)." },
        { status: 403 }
      );
    }

    // Check for duplicate nickname
    const trimmedNick = nickname.trim();
    const duplicateNick = room.players.some(
      (p) => p.nickname.toLowerCase() === trimmedNick.toLowerCase() && p.is_active
    );
    const finalNickname = duplicateNick ? `${trimmedNick} (${activeCount + 1})` : trimmedNick;

    // Add player
    const newPlayer = await prisma.pufferPlayer.create({
      data: {
        room_id: room.id,
        anon_id: anonId,
        nickname: finalNickname,
        is_host: false,
        total_score: 0,
        is_active: true,
      },
    });

    const updatedState = await getFullRoomState(code);

    return NextResponse.json({
      success: true,
      player: newPlayer,
      room: updatedState,
    });
  } catch (err: any) {
    console.error("Join room error:", err);
    return NextResponse.json(
      { error: "Failed to join room", details: err?.message },
      { status: 500 }
    );
  }
}

