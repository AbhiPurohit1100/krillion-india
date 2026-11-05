import { prisma } from "@/lib/prisma";

export interface SnapshotCalculation {
  questionId: string;
  entityId: string;
  canonicalName: string;
  priorFrequency: number;
  observedCount: number;
  totalObserved: number;
  observedFrequency: number;
  finalFrequency: number;
}

/**
 * Aggregates player submissions for a daily game and creates a fixed Rarity Snapshot
 * using Bayesian blending.
 */
export async function generateDailyRaritySnapshots(
  dailyGameId: string,
  scoringVersion: string = "v1.0",
  priorStrength: number = 1000
): Promise<SnapshotCalculation[]> {
  const results: SnapshotCalculation[] = [];

  try {
    // 1. Fetch all questions linked to this daily game
    const gameQuestions = await prisma.dailyGameQuestion.findMany({
      where: { daily_game_id: dailyGameId },
      include: {
        question: {
          include: {
            valid_entities: {
              include: { entity: true },
            },
          },
        },
      },
    });

    for (const gq of gameQuestions) {
      const q = gq.question;

      // 2. Count total valid submissions for this question in this daily game
      const validSubmissions = await prisma.submission.findMany({
        where: {
          question_id: q.id,
          daily_game_id: dailyGameId,
          validation_status: "VALID",
          canonical_entity_id: { not: null },
        },
      });

      const totalValid = validSubmissions.length;

      // Count occurrences per canonical entity
      const countsByEntity = new Map<string, number>();
      for (const sub of validSubmissions) {
        if (sub.canonical_entity_id) {
          const current = countsByEntity.get(sub.canonical_entity_id) || 0;
          countsByEntity.set(sub.canonical_entity_id, current + 1);
        }
      }

      // 3. For each accepted entity, calculate Bayesian snapshot
      for (const ve of q.valid_entities) {
        const ent = ve.entity;
        const observedCount = countsByEntity.get(ent.id) || 0;
        const observedFreq = totalValid > 0 ? observedCount / totalValid : 0;

        // Extract prior from entity metadata or fallback
        const metadata = (ent.metadata as any) || {};
        const priorShare = typeof metadata.prior_frequency === "number" ? metadata.prior_frequency : 0.15;

        // Bayesian formula: (prior_share * prior_strength + observed_count) / (prior_strength + total_observed)
        const finalFreq =
          (priorShare * priorStrength + observedCount) /
          (priorStrength + totalValid);

        // Upsert snapshot
        const snapshot = await prisma.raritySnapshot.upsert({
          where: {
            question_id_entity_id_scoring_version: {
              question_id: q.id,
              entity_id: ent.id,
              scoring_version: scoringVersion,
            },
          },
          update: {
            estimated_frequency: priorShare,
            observed_frequency: observedFreq,
            final_frequency: finalFreq,
          },
          create: {
            question_id: q.id,
            entity_id: ent.id,
            estimated_frequency: priorShare,
            observed_frequency: observedFreq,
            final_frequency: finalFreq,
            scoring_version: scoringVersion,
          },
        });

        results.push({
          questionId: q.id,
          entityId: ent.id,
          canonicalName: ent.canonical_name,
          priorFrequency: priorShare,
          observedCount,
          totalObserved: totalValid,
          observedFrequency: observedFreq,
          finalFrequency: finalFreq,
        });
      }
    }
  } catch (err) {
    console.warn("Unable to generate DB snapshots (offline mode):", err);
  }

  return results;
}

