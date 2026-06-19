import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { submitTestSchema } from "@/lib/validations";
import { getClientIp } from "@/lib/utils";
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request) || "unknown";
  const limit = rateLimit(`test-submit:${ip}`, 5, 3600000);

  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429, headers: getRateLimitHeaders(limit) }
    );
  }

  try {
    const body = await request.json();
    const parsed = submitTestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid submission data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { sessionId, answers, timeTaken, csrfToken } = parsed.data;

    const progress = await prisma.testProgress.findUnique({
      where: { sessionId },
    });

    if (!progress) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (progress.csrfToken !== csrfToken) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    }

    if (new Date() > progress.expiresAt) {
      return NextResponse.json({ error: "Session expired" }, { status: 410 });
    }

    const questionIds = progress.questionIds as string[];
    const allAnswered = questionIds.every((id) => answers[id]);
    if (!allAnswered) {
      return NextResponse.json(
        { error: "All questions must be answered before submission" },
        { status: 400 }
      );
    }

    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, correctAnswer: true },
    });

    let score = 0;
    const total = questions.length;
    for (const question of questions) {
      if (answers[question.id] === question.correctAnswer) score++;
    }
    const percentage = total > 0 ? (score / total) * 100 : 0;

    const config = await prisma.testConfig.findFirst();
    const passPercentage = config?.passPercentage ?? parseInt(process.env.NEXT_PUBLIC_PASS_PERCENTAGE || "60", 10);
    const passed = percentage >= passPercentage;

    const studentData = progress.studentData as {
      fullName: string;
      studentId?: string | null;
    };

    const student = await prisma.student.create({
      data: {
        fullName: studentData.fullName,
        studentId: studentData.studentId || null,
      },
    });

    const result = await prisma.testResult.create({
      data: {
        studentId: student.id,
        score,
        total,
        percentage,
        passed,
        timeTaken: timeTaken || null,
        ipAddress: ip !== "unknown" ? ip : null,
        answers,
      },
    });

    await prisma.testProgress.delete({ where: { sessionId } });

    const downloadFile = await prisma.downloadableFile.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      resultId: result.id,
      score,
      total,
      percentage,
      passed,
      studentName: studentData.fullName,
      downloadUrl: downloadFile ? `/api/download/${downloadFile.id}` : null,
      downloadFileName: downloadFile?.fileName || null,
    });
  } catch (error) {
    console.error("Test submit error:", error);
    return NextResponse.json({ error: "Failed to submit test" }, { status: 500 });
  }
}
