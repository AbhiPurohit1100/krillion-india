import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getFullRoomState } from "@/lib/party/roomService";

const LeaveRoomSchema = z.object({
  anonId: z.string().min(1),
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
    const parsed = LeaveRoomSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { anonId } = parsed.data;

    const room = await prisma.pufferRoom.findUnique({
      where: { code },
      include: { players: true },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const leavingPlayer = room.players.find((p) => p.anon_id === anonId);
    if (!leavingPlayer) {
      return NextResponse.json({ error: "Player not in room" }, { status: 404 });
    }

    // Mark player inactive
    await prisma.pufferPlayer.update({
      where: { id: leavingPlayer.id },
      data: { is_active: false },
    });

    // If leaving player was host, transfer host to next active player
    if (leavingPlayer.is_host) {
      const remainingActive = room.players.filter(
        (p) => p.is_active && p.id !== leavingPlayer.id
      );

      if (remainingActive.length > 0) {
        const nextHost = remainingActive[0];
        await prisma.$transaction([
          prisma.pufferPlayer.update({
            where: { id: leavingPlayer.id },
            data: { is_host: false },
          }),
          prisma.pufferPlayer.update({
            where: { id: nextHost.id },
            data: { is_host: true },
          }),
          prisma.pufferRoom.update({
            where: { id: room.id },
            data: { host_id: nextHost.anon_id },
          }),
        ]);
      } else {
        // No one left in room -> cancel room
        await prisma.pufferRoom.update({
          where: { id: room.id },
          data: { status: "CANCELLED" },
        });
      }
    }

    const updatedState = await getFullRoomState(code);
    return NextResponse.json({ success: true, room: updatedState });
  } catch (err: any) {
    console.error("Leave room error:", err);
    return NextResponse.json(
      { error: "Failed to leave room", details: err?.message },
      { status: 500 }
    );
  }
}

