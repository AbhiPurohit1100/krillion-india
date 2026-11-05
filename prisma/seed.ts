import { PrismaClient, QuestionStatus, GameStatus } from "@prisma/client";
import { SEED_QUESTIONS } from "../src/lib/seed-data";
import { normalizeAnswer } from "../src/lib/normalization";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log("Starting Krillion India fast concurrent database seed...");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Create or upsert today's Daily Game
  const dailyGame = await prisma.dailyGame.upsert({
    where: { game_date: today },
    update: { status: GameStatus.ACTIVE },
    create: {
      game_date: today,
      status: GameStatus.ACTIVE,
      published_at: new Date(),
    },
  });

  console.log(`Daily Game ready for ${today.toDateString()} (ID: ${dailyGame.id})`);

  for (const qData of SEED_QUESTIONS) {
    console.log(`Processing Q${qData.order}/7: ${qData.category}...`);

    // 2. Upsert Question
    const question = await prisma.question.upsert({
      where: { id: qData.id },
      update: {
        question_text: qData.questionText,
        category: qData.category,
        subcategory: qData.subcategory,
        difficulty: qData.difficulty,
        explanation: qData.explanation,
        status: QuestionStatus.PUBLISHED,
      },
      create: {
        id: qData.id,
        question_text: qData.questionText,
        category: qData.category,
        subcategory: qData.subcategory,
        difficulty: qData.difficulty,
        explanation: qData.explanation,
        status: QuestionStatus.PUBLISHED,
      },
    });

    // 3. Link to Daily Game
    await prisma.dailyGameQuestion.upsert({
      where: {
        daily_game_id_question_order: {
          daily_game_id: dailyGame.id,
          question_order: qData.order,
        },
      },
      update: {
        question_id: question.id,
      },
      create: {
        daily_game_id: dailyGame.id,
        question_id: question.id,
        question_order: qData.order,
      },
    });

    // 4. Seed entities in parallel for this question
    await Promise.all(
      qData.entities.map(async (entData) => {
        let entity = await prisma.entity.findFirst({
          where: { canonical_name: entData.canonicalName },
        });

        if (!entity) {
          entity = await prisma.entity.create({
            data: {
              canonical_name: entData.canonicalName,
              entity_type: entData.entityType,
              metadata: { prior_frequency: entData.priorFrequency },
              aliases: {
                create: [
                  {
                    alias: entData.canonicalName,
                    normalized_alias: normalizeAnswer(entData.canonicalName),
                  },
                  ...entData.aliases.map((a) => ({
                    alias: a,
                    normalized_alias: normalizeAnswer(a),
                  })),
                ],
              },
            },
          });
        }

        // Link to question
        await prisma.questionValidEntity.upsert({
          where: {
            question_id_entity_id: {
              question_id: question.id,
              entity_id: entity.id,
            },
          },
          update: {},
          create: {
            question_id: question.id,
            entity_id: entity.id,
          },
        });

        // Snapshot record
        await prisma.raritySnapshot.upsert({
          where: {
            question_id_entity_id_scoring_version: {
              question_id: question.id,
              entity_id: entity.id,
              scoring_version: "v1.0",
            },
          },
          update: {
            estimated_frequency: entData.priorFrequency,
            final_frequency: entData.priorFrequency,
          },
          create: {
            question_id: question.id,
            entity_id: entity.id,
            estimated_frequency: entData.priorFrequency,
            observed_frequency: 0,
            final_frequency: entData.priorFrequency,
            scoring_version: "v1.0",
          },
        });
      })
    );

    console.log(`✓ Completed Question ${qData.order}/7: ${qData.category}`);
  }

  console.log("🎉 Seeding complete! All 7 questions and canonical entities are in Supabase.");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
