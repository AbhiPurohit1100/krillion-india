import { NextResponse } from "next/server";
import { generateDailyCandidates } from "@/lib/services/questionGeneratorService";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const candidates = await generateDailyCandidates();
    return NextResponse.json({
      status: "success",
      generatedCount: candidates.length,
      candidates,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

