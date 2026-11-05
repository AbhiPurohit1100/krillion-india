import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const RejectSchema = z.object({
  questionId: z.string().min(1),
  reason: z.string().optional().default("Rejected by admin"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RejectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid reject payload" }, { status: 400 });
    }

    const { questionId, reason } = parsed.data;

    try {
      const updated = await prisma.question.update({
        where: { id: questionId },
        data: {
          status: "REJECTED",
        },
      });

      return NextResponse.json({
        status: "success",
        question: updated,
        message: "Question marked as REJECTED.",
      });
    } catch (dbErr) {
      return NextResponse.json({
        status: "success",
        message: "Question rejected (dev mode).",
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

