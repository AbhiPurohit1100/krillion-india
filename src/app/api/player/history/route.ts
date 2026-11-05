import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const playerId = searchParams.get("playerId");

  if (!playerId) {
    return NextResponse.json({ error: "playerId is required" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { anonymous_player_id: playerId },
      include: {
        scores: {
          include: { daily_game: true },
          orderBy: { completed_at: "desc" },
        },
      },
    });

    if (user) {
      const history = user.scores.map((sc) => ({
        gameDate: sc.daily_game.game_date,
        totalScore: sc.total_score,
        altitude: sc.altitude,
        completedAt: sc.completed_at,
      }));

      return NextResponse.json({
        nickname: user.nickname,
        gamesPlayed: history.length,
        peakAltitude: history.reduce((max, h) => Math.max(max, h.altitude), 0),
        history,
      });
    }
  } catch (err) {}

  return NextResponse.json({
    nickname: "Guest Pilot",
    gamesPlayed: 0,
    peakAltitude: 0,
    history: [],
  });
}

