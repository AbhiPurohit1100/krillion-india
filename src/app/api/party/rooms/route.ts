import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateRoomCode } from "@/lib/party/roomService";
import { isRateLimited } from "@/lib/rateLimit";

const CreateRoomSchema = z.object({
  hostAnonId: z.string().min(1),
  nickname: z.string().min(1).max(25),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local_client";
    const rateCheck = isRateLimited(`create_party_${ip}`, 10, 60 * 1000);
    if (rateCheck.limited) {
      return NextResponse.json(
        { error: "Too many room creation attempts. Please slow down." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = CreateRoomSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { hostAnonId, nickname } = parsed.data;

    // Generate unique room code
    let code = generateRoomCode();
    let attempts = 0;
    while (attempts < 5) {
      const existing = await prisma.pufferRoom.findUnique({ where: { code } });
      if (!existing) break;
      code = generateRoomCode();
      attempts++;
    }

    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

    // Create room with host as player 1
    const room = await prisma.pufferRoom.create({
      data: {
        code,
        host_id: hostAnonId,
        status: "WAITING",
        max_players: 8,
        total_rounds: 5,
        current_round: 0,
        expires_at: expiresAt,
        players: {
          create: {
            anon_id: hostAnonId,
            nickname: nickname.trim(),
            is_host: true,
            total_score: 0,
            is_active: true,
          },
        },
      },
      include: {
        players: true,
      },
    });

    return NextResponse.json({
      success: true,
      roomCode: room.code,
      roomId: room.id,
      player: room.players[0],
    });
  } catch (err: any) {
    console.error("Create room error:", err);
    return NextResponse.json(
      { error: "Failed to create room", details: err?.message },
      { status: 500 }
    );
  }
}

