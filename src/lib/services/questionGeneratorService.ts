import { prisma } from "@/lib/prisma";
import { groqClient } from "@/lib/ai/groqClient";
import { LLMCandidateQuestion } from "@/lib/ai/schemas";
import { similarityRatio } from "@/lib/fuzzy";
import { normalizeAnswer } from "@/lib/normalization";
import { sendTelegramCandidateNotification } from "./telegramService";

const FALLBACK_CANDIDATES: LLMCandidateQuestion[] = [
  {
    question: "Name an Indian female athlete who has won an individual Olympic medal.",
    category: "Indian Sports",
    subcategory: "Olympics",
    difficulty: "medium",
    language: "en",
    accepted_answers: [
      { canonical_name: "Karnam Malleswari", prior_frequency: 0.08, aliases: ["Malleswari"] },
      { canonical_name: "Saina Nehwal", prior_frequency: 0.32, aliases: ["Saina"] },
      { canonical_name: "Mary Kom", prior_frequency: 0.30, aliases: ["MC Mary Kom", "Magnificent Mary"] },
      { canonical_name: "PV Sindhu", prior_frequency: 0.40, aliases: ["Sindhu", "Pusarla Venkata Sindhu"] },
      { canonical_name: "Sakshi Malik", prior_frequency: 0.18, aliases: ["Sakshi"] },
      { canonical_name: "Lovlina Borgohain", prior_frequency: 0.06, aliases: ["Lovlina"] },
      { canonical_name: "Mirabai Chanu", prior_frequency: 0.22, aliases: ["Saikhom Mirabai Chanu"] },
      { canonical_name: "Manu Bhaker", prior_frequency: 0.35, aliases: ["Manu"] },
    ],
    explanation: "Indian women have clinched historic Olympic medals across weightlifting, badminton, boxing, and shooting.",
    sources: [{ title: "Olympic Committee India", url: "https://olympics.com" }],
  },
  {
    question: "Name an Indian musical instrument classified under the Tat Vadya (stringed) family.",
    category: "Indian Classical Music",
    subcategory: "Musical Instruments",
    difficulty: "medium",
    language: "en",
    accepted_answers: [
      { canonical_name: "Sitar", prior_frequency: 0.42, aliases: ["Seetar"] },
      { canonical_name: "Sarod", prior_frequency: 0.20, aliases: ["Sarode"] },
      { canonical_name: "Veena", prior_frequency: 0.28, aliases: ["Rudra Veena", "Saraswati Veena"] },
      { canonical_name: "Santoor", prior_frequency: 0.16, aliases: ["Shata Tantri Veena"] },
      { canonical_name: "Sarangi", prior_frequency: 0.12, aliases: ["Saranji"] },
      { canonical_name: "Dilruba", prior_frequency: 0.04, aliases: ["Esraj"] },
      { canonical_name: "Surbahar", prior_frequency: 0.02, aliases: ["Bass Sitar"] },
    ],
    explanation: "Ancient Indian Natya Shastra classifies acoustic instruments into Tat, Sushir, Avanaddha, and Ghan.",
    sources: [{ title: "Sangeet Natak Akademi", url: "https://sangeetnatak.gov.in" }],
  },
  {
    question: "Name an Indian National Park that is home to wild Royal Bengal Tigers.",
    category: "Wildlife & Geography",
    subcategory: "Tiger Reserves",
    difficulty: "easy",
    language: "en",
    accepted_answers: [
      { canonical_name: "Jim Corbett National Park", prior_frequency: 0.38, aliases: ["Corbett", "Jim Corbett"] },
      { canonical_name: "Ranthambore National Park", prior_frequency: 0.34, aliases: ["Ranthambhore"] },
      { canonical_name: "Kaziranga National Park", prior_frequency: 0.25, aliases: ["Kaziranga"] },
      { canonical_name: "Sundarbans National Park", prior_frequency: 0.30, aliases: ["Sundarbans", "Sunderbans"] },
      { canonical_name: "Bandhavgarh National Park", prior_frequency: 0.15, aliases: ["Bandhavgarh"] },
      { canonical_name: "Kanha National Park", prior_frequency: 0.12, aliases: ["Kanha"] },
      { canonical_name: "Tadoba Andhari Tiger Reserve", prior_frequency: 0.08, aliases: ["Tadoba"] },
      { canonical_name: "Periyar National Park", prior_frequency: 0.10, aliases: ["Periyar"] },
    ],
    explanation: "Project Tiger protects Bengal tigers across over 50 designated reserves across India.",
    sources: [{ title: "National Tiger Conservation Authority", url: "https://ntca.gov.in" }],
  },
];

export async function generateDailyCandidates(): Promise<any[]> {
  console.log("Generating 3 candidate trivia questions...");

  let candidates: LLMCandidateQuestion[] = [];
  try {
    candidates = await groqClient.generateCandidateQuestions();
  } catch (err) {
    console.warn("Groq generation failed, using curated candidates:", err);
  }

  if (candidates.length === 0) {
    candidates = FALLBACK_CANDIDATES;
  }

  const createdQuestions = [];

  for (const cand of candidates) {
    try {
      // 1. Duplicate Detection Check
      const existing = await prisma.question.findMany({ select: { id: true, question_text: true } });
      const isDuplicate = existing.some(
        (eq) => similarityRatio(eq.question_text.toLowerCase(), cand.question.toLowerCase()) > 0.8
      );

      if (isDuplicate) {
        console.log(`Skipping duplicate candidate: "${cand.question}"`);
        continue;
      }

      // 2. Create Question in PENDING_APPROVAL status
      const q = await prisma.question.create({
        data: {
          question_text: cand.question,
          category: cand.category,
          subcategory: cand.subcategory,
          difficulty: cand.difficulty,
          language: cand.language,
          explanation: cand.explanation,
          status: "PENDING_APPROVAL",
        },
      });

      // 3. Create Valid Entities & Aliases
      for (const ans of cand.accepted_answers) {
        let ent = await prisma.entity.findFirst({
          where: { canonical_name: ans.canonical_name },
        });

        if (!ent) {
          ent = await prisma.entity.create({
            data: {
              canonical_name: ans.canonical_name,
              entity_type: cand.subcategory || "general",
              metadata: { prior_frequency: ans.prior_frequency },
            },
          });
        }

        await prisma.questionValidEntity.create({
          data: {
            question_id: q.id,
            entity_id: ent.id,
          },
        });

        // Add normalized aliases
        for (const aliasStr of ans.aliases) {
          const norm = normalizeAnswer(aliasStr);
          await prisma.entityAlias.create({
            data: {
              entity_id: ent.id,
              alias: aliasStr,
              normalized_alias: norm,
            },
          });
        }
      }

      // 4. Send Telegram Notification
      await sendTelegramCandidateNotification({
        questionId: q.id,
        questionText: q.question_text,
        category: q.category,
        difficulty: q.difficulty,
        acceptedAnswersCount: cand.accepted_answers.length,
      });

      createdQuestions.push(q);
    } catch (e) {
      console.error("Failed to store candidate in database:", e);
      createdQuestions.push({
        id: "cand_" + Math.random().toString(36).substring(2, 9),
        question_text: cand.question,
        category: cand.category,
        subcategory: cand.subcategory,
        difficulty: cand.difficulty,
        explanation: cand.explanation,
        status: "PENDING_APPROVAL",
        accepted_answers: cand.accepted_answers,
      });
    }
  }

  return createdQuestions;
}

