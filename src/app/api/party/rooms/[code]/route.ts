import { NextRequest, NextResponse } from "next/server";
import { getFullRoomState } from "@/lib/party/roomService";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code?.toUpperCase();
    if (!code) {
      return NextResponse.json({ error: "Missing room code" }, { status: 400 });
    }

    const state = await getFullRoomState(code);
    if (!state) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, room: state });
  } catch (err: any) {
    console.error("Get room state error:", err);
    return NextResponse.json(
      { error: "Failed to fetch room state", details: err?.message },
      { status: 500 }
    );
  }
}

