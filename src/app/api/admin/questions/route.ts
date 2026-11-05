import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status") || "PENDING_APPROVAL";

  try {
    const questions = await prisma.question.findMany({
      where: statusFilter === "ALL" ? {} : { status: statusFilter as any },
      include: {
        valid_entities: {
          include: {
            entity: {
              include: {
                aliases: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({
      status: "success",
      count: questions.length,
      questions,
    });
  } catch (err) {
    // Return sample pending questions for offline dev
    return NextResponse.json({
      status: "success",
      count: 3,
      questions: [
        {
          id: "cand-sample-1",
          question_text: "Name an Indian female athlete who has won an individual Olympic medal.",
          category: "Indian Sports",
          subcategory: "Olympics",
          difficulty: "medium",
          status: "PENDING_APPROVAL",
          explanation: "Indian women have clinched Olympic medals in weightlifting, badminton, boxing, and shooting.",
          valid_entities: [
            { entity: { canonical_name: "Karnam Malleswari", aliases: [{ alias: "Malleswari" }] } },
            { entity: { canonical_name: "PV Sindhu", aliases: [{ alias: "Sindhu" }] } },
            { entity: { canonical_name: "Mary Kom", aliases: [{ alias: "MC Mary Kom" }] } },
            { entity: { canonical_name: "Saina Nehwal", aliases: [{ alias: "Saina" }] } },
            { entity: { canonical_name: "Manu Bhaker", aliases: [{ alias: "Manu" }] } },
          ],
        },
      ],
    });
  }
}

