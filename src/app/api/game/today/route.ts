import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SEED_QUESTIONS } from "@/lib/seed-data";
import { GameQuestion } from "@/types/game";

export const dynamic = "force-dynamic";

/**
 * Deterministic PRNG seeded with day integer so all players on a given calendar day
 * get the exact same rotating 7 questions across the 57-question bank.
 */
function getDailySeed(date: Date): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

function seededShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array];
  let m = result.length;
  let t: T;
  let i: number;
  let s = seed;

  while (m) {
    s = (s * 9301 + 49297) % 233280;
    i = Math.floor((s / 233280) * m--);
    t = result[m];
    result[m] = result[i];
    result[i] = t;
  }
  return result;
}

export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dailySeed = getDailySeed(today);

  try {
    // 1. Check if an active DailyGame exists for today
    let dailyGame = await prisma.dailyGame.findFirst({
      where: {
        game_date: today,
      },
      include: {
        questions: {
          orderBy: { question_order: "asc" },
          take: 7,
          include: {
            question: true,
          },
        },
      },
    });

    // 2. If no daily game exists, or if it has fewer than 7 questions,
    // generate a fresh 7-question rotation from the 57 questions in database
    if (!dailyGame || dailyGame.questions.length < 7) {
      const allDbQuestions = await prisma.question.findMany({
        where: { status: "PUBLISHED" },
      });

      if (allDbQuestions.length >= 7) {
        // Pick 7 questions rotated by daily seed
        const selected = seededShuffle(allDbQuestions, dailySeed).slice(0, 7);

        // Upsert DailyGame
        dailyGame = await prisma.dailyGame.upsert({
          where: { game_date: today },
          update: { status: "ACTIVE" },
          create: {
            game_date: today,
            status: "ACTIVE",
            published_at: new Date(),
          },
          include: {
            questions: {
              include: { question: true },
            },
          },
        });

        // Delete any existing game questions for today to avoid stale order
        await prisma.dailyGameQuestion.deleteMany({
          where: { daily_game_id: dailyGame.id },
        });

        // Insert new 7 questions
        for (let idx = 0; idx < selected.length; idx++) {
          await prisma.dailyGameQuestion.create({
            data: {
              daily_game_id: dailyGame.id,
              question_id: selected[idx].id,
              question_order: idx + 1,
            },
          });
        }

        // Refetch with new questions
        dailyGame = await prisma.dailyGame.findUnique({
          where: { id: dailyGame.id },
          include: {
            questions: {
              orderBy: { question_order: "asc" },
              take: 7,
              include: { question: true },
            },
          },
        });
      }
    }

    if (dailyGame && dailyGame.questions.length > 0) {
      // SECURITY: Strip all answers/entities before sending to client!
      const questions: GameQuestion[] = dailyGame.questions.slice(0, 7).map((dgq) => ({
        id: dgq.question.id,
        order: dgq.question_order,
        questionText: dgq.question.question_text,
        category: dgq.question.category,
        subcategory: dgq.question.subcategory || undefined,
        difficulty: (dgq.question.difficulty as any) || "medium",
        explanation: dgq.question.explanation || undefined,
      }));

      return NextResponse.json({
        gameId: dailyGame.id,
        date: dailyGame.game_date,
        totalQuestions: questions.length,
        questions,
      });
    }
  } catch (error) {
    console.error("Error retrieving today's daily game:", error);
  }

  // Fallback: Deterministically rotate 7 questions from SEED_QUESTIONS by daily seed
  const shuffledSeed = seededShuffle(SEED_QUESTIONS, dailySeed).slice(0, 7);
  const questions: GameQuestion[] = shuffledSeed.map((q, idx) => ({
    id: q.id,
    order: idx + 1,
    questionText: q.questionText,
    category: q.category,
    subcategory: q.subcategory,
    difficulty: q.difficulty,
    explanation: q.explanation,
  }));

  return NextResponse.json({
    gameId: "daily-default",
    date: new Date().toISOString(),
    totalQuestions: questions.length,
    questions,
  });
}
