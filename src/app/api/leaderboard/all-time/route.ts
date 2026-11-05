import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const scores = await prisma.score.findMany({
      include: {
        player: true,
      },
      orderBy: { altitude: "desc" },
      take: 50,
    });

    if (scores.length > 0) {
      // Group by player to get all-time apex flight
      const playerMap = new Map<
        string,
        {
          nickname: string;
          peakAltitude: number;
          totalAltitude: number;
          gamesPlayed: number;
          bestScore: number;
        }
      >();

      for (const sc of scores) {
        const pId = sc.player_id;
        const existing = playerMap.get(pId);
        if (!existing) {
          playerMap.set(pId, {
            nickname: sc.player.nickname,
            peakAltitude: sc.altitude,
            totalAltitude: sc.altitude,
            gamesPlayed: 1,
            bestScore: sc.total_score,
          });
        } else {
          existing.gamesPlayed += 1;
          existing.totalAltitude += sc.altitude;
          existing.peakAltitude = Math.max(existing.peakAltitude, sc.altitude);
          existing.bestScore = Math.max(existing.bestScore, sc.total_score);
        }
      }

      const allTimeRankings = Array.from(playerMap.values())
        .sort((a, b) => b.peakAltitude - a.peakAltitude)
        .map((entry, idx) => ({
          rank: idx + 1,
          nickname: entry.nickname,
          altitude: entry.peakAltitude,
          totalScore: entry.bestScore,
          gamesPlayed: entry.gamesPlayed,
          completedAt: "All-Time Record",
        }));

      return NextResponse.json({
        source: "database",
        entries: allTimeRankings,
      });
    }
  } catch (err) {}

  // Fallback All-Time Legends
  const fallbackAllTime = [
    { rank: 1, nickname: "DelhiKeDabbang", altitude: 9850, totalScore: 5920, completedAt: "Legend" },
    { rank: 2, nickname: "KiteRunnerAhmedabad", altitude: 9620, totalScore: 5740, completedAt: "Legend" },
    { rank: 3, nickname: "SachinStan10", altitude: 9450, totalScore: 5560, completedAt: "Legend" },
    { rank: 4, nickname: "MasalaChaiLover", altitude: 9210, totalScore: 5310, completedAt: "Legend" },
    { rank: 5, nickname: "KolKataKnight", altitude: 8980, totalScore: 5120, completedAt: "Legend" },
    { rank: 6, nickname: "NammaBengaluru", altitude: 8740, totalScore: 4950, completedAt: "Legend" },
  ];

  return NextResponse.json({
    source: "seed",
    entries: fallbackAllTime,
  });
}

