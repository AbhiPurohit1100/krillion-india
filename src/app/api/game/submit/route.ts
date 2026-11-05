import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { resolveAnswer } from "@/lib/services/resolutionService";
import { calculateRarityScore } from "@/lib/services/scoringService";
import { normalizeAnswer } from "@/lib/normalization";
import { enqueueUnseenAnswer } from "@/lib/queue/validationQueue";
import { SEED_QUESTIONS } from "@/lib/seed-data";
import { isRateLimited } from "@/lib/rateLimit";
import { logEvent } from "@/lib/logger";

export const dynamic = "force-dynamic";

const SubmitAnswerSchema = z.object({
  questionId: z.string().min(1),
  rawAnswer: z.string(),
  playerId: z.string().min(1),
  nickname: z.string().optional().default("Guest"),
  dailyGameId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local_client";
    const rateCheck = isRateLimited(`submit_${ip}`, 25, 60 * 1000);
    if (rateCheck.limited) {
      logEvent("warn", "Rate limit exceeded on answer submission", { ip });
      return NextResponse.json(
        { error: "Too many submissions. Please wait a moment before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = SubmitAnswerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid submission payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { questionId, rawAnswer, playerId, nickname, dailyGameId } = parsed.data;

    // 1. Resolve Answer via Normalization, Canonical & Alias Matching, and Fuzzy Matching
    const resolution = await resolveAnswer(questionId, rawAnswer);

    // 2. Calculate Server-Side Rarity & Altitude Score
    const scoreCalc = calculateRarityScore(
      resolution.isValid,
      resolution.priorFrequency,
      0, // observedCount
      0, // totalObserved
      Number(process.env.PRIOR_STRENGTH || 1000)
    );

    // 3. Persist to PostgreSQL / Supabase if connected
    try {
      // Upsert player user record
      const user = await prisma.user.upsert({
        where: { anonymous_player_id: playerId },
        update: { nickname },
        create: {
          anonymous_player_id: playerId,
          nickname,
        },
      });

      // Check if user already submitted for this question (prevent duplicate submissions)
      const existingSubmission = await prisma.submission.findFirst({
        where: {
          player_id: user.id,
          question_id: questionId,
          ...(dailyGameId ? { daily_game_id: dailyGameId } : {}),
        },
      });

      if (!existingSubmission) {
        const sub = await prisma.submission.create({
          data: {
            player_id: user.id,
            question_id: questionId,
            daily_game_id: dailyGameId || null,
            raw_answer: rawAnswer,
            normalized_answer: normalizeAnswer(rawAnswer),
            canonical_entity_id: resolution.canonicalEntityId || null,
            validation_status: resolution.isValid ? "VALID" : "PENDING",
            rarity_score: scoreCalc.rarityScore,
          },
        });

        // If answer was unresolved, enqueue for AI verification
        if (!resolution.isValid && rawAnswer.trim().length > 1) {
          const qText = SEED_QUESTIONS.find((q) => q.id === questionId)?.questionText || "";
          await enqueueUnseenAnswer({
            submissionId: sub.id,
            questionId,
            questionText: qText,
            rawAnswer,
            normalizedAnswer: normalizeAnswer(rawAnswer),
          });
        }
      }
    } catch (dbError) {
      // Continue smoothly if DB is not yet connected
    }

    // 4. Return result to client
    return NextResponse.json({
      questionId,
      rawAnswer,
      canonicalName: resolution.canonicalName || undefined,
      isValid: resolution.isValid,
      matchType: resolution.matchType,
      rarityTier: scoreCalc.rarityTier,
      rarityScore: scoreCalc.rarityScore,
      altitudeGained: scoreCalc.altitudeGain,
      explanation: resolution.explanation,
    });
  } catch (error: any) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { error: "Internal server error processing answer", message: error?.message },
      { status: 500 }
    );
  }
}

