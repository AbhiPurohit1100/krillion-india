import { z } from "zod";

/**
 * Structured schema for Groq LLM answer validation.
 * Section 7 requirement:
 * - is_valid
 * - canonical_name
 * - entity_type
 * - aliases
 * - confidence
 * - explanation
 * - evidence/source references
 */
export const LLMAnswerValidationSchema = z.object({
  is_valid: z.boolean(),
  canonical_name: z.string(),
  entity_type: z.string(),
  aliases: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1),
  explanation: z.string(),
  sources: z
    .array(
      z.object({
        title: z.string(),
        url: z.string().optional().default(""),
      })
    )
    .default([]),
});

export type LLMAnswerValidation = z.infer<typeof LLMAnswerValidationSchema>;

/**
 * Structured schema for candidate question generation (Section 9)
 */
export const LLMAcceptedAnswerSchema = z.object({
  canonical_name: z.string(),
  prior_frequency: z.number().min(0.001).max(0.5).default(0.1),
  aliases: z.array(z.string()).default([]),
});

export const LLMCandidateQuestionSchema = z.object({
  question: z.string().min(10),
  category: z.string(),
  subcategory: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  language: z.string().default("en"),
  accepted_answers: z.array(LLMAcceptedAnswerSchema).min(3),
  explanation: z.string(),
  sources: z
    .array(
      z.object({
        title: z.string(),
        url: z.string().default(""),
      })
    )
    .default([]),
});

export const LLMQuestionGenerationBatchSchema = z.object({
  candidates: z.array(LLMCandidateQuestionSchema).length(3),
});

export type LLMCandidateQuestion = z.infer<typeof LLMCandidateQuestionSchema>;

