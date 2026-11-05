import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  let dbStatus = "disconnected";
  let dbError = null;

  try {
    // Attempt a light query to verify DB availability
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch (error: any) {
    dbError = error?.message || "Unable to reach database";
  }

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "krillion-india",
    database: {
      status: dbStatus,
      error: dbError,
    },
    version: "0.1.0",
  });
}

