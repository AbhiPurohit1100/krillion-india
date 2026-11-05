import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SEED_QUESTIONS } from "@/lib/seed-data";
import { GameQuestion } from "@/types/game";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Attempt to fetch today's active questions from database
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeDailyGame = await prisma.dailyGame.findFirst({
      where: {
        game_date: today,
        status: "ACTIVE",
      },
      include: {
        questions: {
          orderBy: { question_order: "asc" },
          include: {
            question: true,
          },
        },
      },
    });

    if (activeDailyGame && activeDailyGame.questions.length > 0) {
      // SECURITY: Strip all answers/entities before sending to client!
      const questions: GameQuestion[] = activeDailyGame.questions.map((dgq) => ({
        id: dgq.question.id,
        order: dgq.question_order,
        questionText: dgq.question.question_text,
        category: dgq.question.category,
        subcategory: dgq.question.subcategory || undefined,
        difficulty: (dgq.question.difficulty as any) || "medium",
        explanation: dgq.question.explanation || undefined,
      }));

      return NextResponse.json({
        gameId: activeDailyGame.id,
        date: activeDailyGame.game_date,
        totalQuestions: questions.length,
        questions,
      });
    }
  } catch (error) {
    // Database connecting/offline; seamlessly return seed questions
  }

  // Fallback: Return seed questions without answer keys
  const questions: GameQuestion[] = SEED_QUESTIONS.map((q) => ({
    id: q.id,
    order: q.order,
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

