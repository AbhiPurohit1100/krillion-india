import { Queue } from "bullmq";
import Redis from "ioredis";
import { processUnseenAnswer } from "../services/unseenAnswerProcessor";

export interface UnseenAnswerJobData {
  submissionId?: string;
  questionId: string;
  questionText: string;
  rawAnswer: string;
  normalizedAnswer: string;
}

let validationQueue: Queue<UnseenAnswerJobData> | null = null;

function getRedisConnection(): Redis | null {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl || redisUrl.trim() === "") return null;

  try {
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
      retryStrategy: () => null, // don't hang if redis is not running
    });
    return client;
  } catch (e) {
    return null;
  }
}

export function getValidationQueue(): Queue<UnseenAnswerJobData> | null {
  if (validationQueue) return validationQueue;

  const redis = getRedisConnection();
  if (!redis) return null;

  try {
    validationQueue = new Queue<UnseenAnswerJobData>("unseen-answers", {
      connection: redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    });
    return validationQueue;
  } catch (err) {
    return null;
  }
}

/**
 * Enqueues an unseen answer for evaluation.
 * - If Redis is configured: enqueues to BullMQ worker.
 * - If Redis is NOT configured (e.g. hosted on Vercel/Supabase without Redis):
 *   processes directly in the background without blocking the player response!
 */
export async function enqueueUnseenAnswer(data: UnseenAnswerJobData): Promise<boolean> {
  const queue = getValidationQueue();

  if (queue) {
    try {
      await queue.add("evaluate-unseen", data, {
        jobId: `${data.questionId}:${data.normalizedAnswer}`,
      });
      return true;
    } catch (err) {
      // Redis connection failed, fallback to direct background processing
    }
  }

  // Zero-Redis Fallback (Perfect for Vercel + Supabase)
  // Execute asynchronously in background without awaiting so the user response is instantaneous
  processUnseenAnswer(data).catch((err) => {
    console.warn("Background answer processing error:", err);
  });

  return true;
}
