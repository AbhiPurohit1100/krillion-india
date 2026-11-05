import { Worker, Job } from "bullmq";
import Redis from "ioredis";
import { processUnseenAnswer } from "../lib/services/unseenAnswerProcessor";
import { UnseenAnswerJobData } from "../lib/queue/validationQueue";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
});

console.log("Starting Patang Trivia Answer Validation Worker...");

export const worker = new Worker<UnseenAnswerJobData>(
  "unseen-answers",
  async (job: Job<UnseenAnswerJobData>) => {
    await processUnseenAnswer(job.data);
  },
  {
    connection,
    concurrency: 5,
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully.`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed with error:`, err);
});
