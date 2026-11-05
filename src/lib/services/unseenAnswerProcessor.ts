import { prisma } from "@/lib/prisma";
import { groqClient } from "@/lib/ai/groqClient";
import { getCachedValidation, setCachedValidation } from "./validationCache";
import { UnseenAnswerJobData } from "../queue/validationQueue";
import { logEvent } from "../logger";

/**
 * Core processor for evaluating unseen answers.
 * Can be called by:
 * 1. BullMQ worker (when Redis is available)
 * 2. Directly in background (when hosted on Vercel/Supabase without Redis)
 */
export async function processUnseenAnswer(data: UnseenAnswerJobData): Promise<void> {
  const { submissionId, questionId, questionText, rawAnswer, normalizedAnswer } = data;

  try {
    // 1. Check cache first to prevent repeated LLM calls
    let validation = getCachedValidation(questionId, normalizedAnswer);

    // 2. Query Groq LLM if not cached
    if (!validation) {
      logEvent("info", `Querying Groq for unseen answer: "${rawAnswer}"`, { questionId });
      validation = await groqClient.validateAnswer(questionText, rawAnswer);
      if (validation) {
        setCachedValidation(questionId, normalizedAnswer, validation);
      }
    }

    if (!validation) return;

    // 3. Update Database records
    if (validation.is_valid && validation.confidence >= 0.75) {
      // High-confidence valid answer -> link or create canonical entity
      let entity = await prisma.entity.findFirst({
        where: { canonical_name: validation.canonical_name },
      });

      if (!entity) {
        entity = await prisma.entity.create({
          data: {
            canonical_name: validation.canonical_name,
            entity_type: validation.entity_type || "general",
            metadata: {
              prior_frequency: 0.04, // Newly discovered valid answers are rare!
              ai_discovered: true,
            },
          },
        });

        // Link to question
        await prisma.questionValidEntity.create({
          data: {
            question_id: questionId,
            entity_id: entity.id,
          },
        });
      }

      // Update player submission
      if (submissionId) {
        await prisma.submission.update({
          where: { id: submissionId },
          data: {
            validation_status: "VALID",
            canonical_entity_id: entity.id,
            rarity_score: 750, // reward points for discovering valid rare answer
          },
        });
      }
    } else if (validation.is_valid && validation.confidence < 0.75) {
      // Uncertain answer -> mark for manual review
      if (submissionId) {
        await prisma.submission.update({
          where: { id: submissionId },
          data: { validation_status: "MANUAL_REVIEW" },
        });
      }
    } else {
      // Invalid answer
      if (submissionId) {
        await prisma.submission.update({
          where: { id: submissionId },
          data: { validation_status: "INVALID" },
        });
      }
    }
  } catch (err: any) {
    logEvent("error", `Failed to process unseen answer: ${err?.message}`, { rawAnswer });
  }
}

