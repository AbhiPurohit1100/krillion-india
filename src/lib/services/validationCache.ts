import { LLMAnswerValidation } from "@/lib/ai/schemas";

// In-memory cache for ultra-fast lookup (serverless/dev)
const memoryCache = new Map<string, { result: LLMAnswerValidation; expiresAt: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function getCachedValidation(
  questionId: string,
  normalizedAnswer: string
): LLMAnswerValidation | null {
  const key = `${questionId}:${normalizedAnswer}`;
  const entry = memoryCache.get(key);

  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }

  return entry.result;
}

export function setCachedValidation(
  questionId: string,
  normalizedAnswer: string,
  result: LLMAnswerValidation
): void {
  const key = `${questionId}:${normalizedAnswer}`;
  memoryCache.set(key, {
    result,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

