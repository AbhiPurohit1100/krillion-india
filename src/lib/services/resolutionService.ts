import { prisma } from "../prisma";
import { normalizeAnswer } from "../normalization";
import { findBestFuzzyMatch } from "../fuzzy";
import { SEED_QUESTIONS } from "../seed-data";

export interface ResolutionResult {
  isValid: boolean;
  canonicalEntityId?: string;
  canonicalName?: string;
  matchType: "canonical" | "alias" | "fuzzy" | "unresolved";
  matchConfidence: number;
  priorFrequency: number;
  explanation?: string;
}

/**
 * Resolves a player submission against valid canonical entities and aliases for a question.
 * Supports direct PostgreSQL/Supabase queries with fallback to the seed bank if database is empty/connecting.
 */
export async function resolveAnswer(
  questionId: string,
  rawAnswer: string
): Promise<ResolutionResult> {
  const normalized = normalizeAnswer(rawAnswer);

  if (!normalized || normalized.length < 2) {
    return {
      isValid: false,
      matchType: "unresolved",
      matchConfidence: 0,
      priorFrequency: 1.0,
      explanation: "Answer was empty or too short to evaluate.",
    };
  }

  // Attempt database query first
  try {
    const validEntities = await prisma.questionValidEntity.findMany({
      where: { question_id: questionId },
      include: {
        entity: {
          include: {
            aliases: true,
            snapshots: {
              where: { scoring_version: "v1.0" },
              take: 1,
            },
          },
        },
      },
    });

    if (validEntities.length > 0) {
      // 1. Exact Canonical Match
      for (const ve of validEntities) {
        const ent = ve.entity;
        const normCanonical = normalizeAnswer(ent.canonical_name);
        if (normalized === normCanonical) {
          const prior = ent.snapshots[0]?.final_frequency || 0.15;
          return {
            isValid: true,
            canonicalEntityId: ent.id,
            canonicalName: ent.canonical_name,
            matchType: "canonical",
            matchConfidence: 1.0,
            priorFrequency: prior,
          };
        }
      }

      // 2. Exact Alias Match
      for (const ve of validEntities) {
        const ent = ve.entity;
        for (const al of ent.aliases) {
          if (normalized === al.normalized_alias) {
            const prior = ent.snapshots[0]?.final_frequency || 0.15;
            return {
              isValid: true,
              canonicalEntityId: ent.id,
              canonicalName: ent.canonical_name,
              matchType: "alias",
              matchConfidence: 0.98,
              priorFrequency: prior,
            };
          }
        }
      }

      // 3. Fuzzy Match
      // Build lookup map from string -> entity
      const candidateMap = new Map<string, typeof validEntities[0]["entity"]>();
      const targets: string[] = [];

      for (const ve of validEntities) {
        const ent = ve.entity;
        const normCanonical = normalizeAnswer(ent.canonical_name);
        candidateMap.set(normCanonical, ent);
        targets.push(normCanonical);

        for (const al of ent.aliases) {
          candidateMap.set(al.normalized_alias, ent);
          targets.push(al.normalized_alias);
        }
      }

      const fuzzyResult = findBestFuzzyMatch(normalized, targets, 0.82);
      if (fuzzyResult) {
        const matchedEnt = candidateMap.get(fuzzyResult.matchedTarget);
        if (matchedEnt) {
          const prior = matchedEnt.snapshots[0]?.final_frequency || 0.15;
          return {
            isValid: true,
            canonicalEntityId: matchedEnt.id,
            canonicalName: matchedEnt.canonical_name,
            matchType: "fuzzy",
            matchConfidence: fuzzyResult.score,
            priorFrequency: prior,
          };
        }
      }
    }
  } catch (error) {
    // If DB is offline / not yet seeded, continue seamlessly to seed bank fallback
  }

  // Fallback to Seed Bank Data (zero-downtime, fully resilient)
  const seedQuestion = SEED_QUESTIONS.find((q) => q.id === questionId);
  if (!seedQuestion) {
    return {
      isValid: false,
      matchType: "unresolved",
      matchConfidence: 0,
      priorFrequency: 1.0,
      explanation: "Question not recognized.",
    };
  }

  // 1. Seed Exact Canonical Match
  for (const ent of seedQuestion.entities) {
    if (normalized === normalizeAnswer(ent.canonicalName)) {
      return {
        isValid: true,
        canonicalName: ent.canonicalName,
        matchType: "canonical",
        matchConfidence: 1.0,
        priorFrequency: ent.priorFrequency,
        explanation: seedQuestion.explanation,
      };
    }
  }

  // 2. Seed Exact Alias Match
  for (const ent of seedQuestion.entities) {
    for (const al of ent.aliases) {
      if (normalized === normalizeAnswer(al)) {
        return {
          isValid: true,
          canonicalName: ent.canonicalName,
          matchType: "alias",
          matchConfidence: 0.98,
          priorFrequency: ent.priorFrequency,
          explanation: seedQuestion.explanation,
        };
      }
    }
  }

  // 3. Seed Fuzzy Match
  const candidateMap = new Map<string, typeof seedQuestion.entities[0]>();
  const targets: string[] = [];

  for (const ent of seedQuestion.entities) {
    const normCanonical = normalizeAnswer(ent.canonicalName);
    candidateMap.set(normCanonical, ent);
    targets.push(normCanonical);

    for (const al of ent.aliases) {
      const normAlias = normalizeAnswer(al);
      candidateMap.set(normAlias, ent);
      targets.push(normAlias);
    }
  }

  const fuzzyResult = findBestFuzzyMatch(normalized, targets, 0.82);
  if (fuzzyResult) {
    const matchedEnt = candidateMap.get(fuzzyResult.matchedTarget);
    if (matchedEnt) {
      return {
        isValid: true,
        canonicalName: matchedEnt.canonicalName,
        matchType: "fuzzy",
        matchConfidence: fuzzyResult.score,
        priorFrequency: matchedEnt.priorFrequency,
        explanation: seedQuestion.explanation,
      };
    }
  }

  // Unresolved Answer (Candidate for Groq AI validation in Phase 5)
  return {
    isValid: false,
    matchType: "unresolved",
    matchConfidence: 0,
    priorFrequency: 1.0,
    explanation: "This answer could not be verified in the canonical question bank.",
  };
}
