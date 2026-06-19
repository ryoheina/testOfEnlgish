import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { progressSaveSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = progressSaveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { sessionId, answers, currentIndex } = parsed.data;

    const progress = await prisma.testProgress.findUnique({
      where: { sessionId },
    });

    if (!progress) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (new Date() > progress.expiresAt) {
      return NextResponse.json({ error: "Session expired" }, { status: 410 });
    }

    await prisma.testProgress.update({
      where: { sessionId },
      data: { answers, currentIndex },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Progress save error:", error);
    return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  const progress = await prisma.testProgress.findUnique({
    where: { sessionId },
  });

  if (!progress) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({
    answers: progress.answers,
    currentIndex: progress.currentIndex,
    studentData: progress.studentData,
  });
}
