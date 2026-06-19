import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureDatabaseReady } from "@/lib/db-bootstrap";
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/utils";
import { generateCsrfToken } from "@/lib/csrf";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request) || "unknown";
  const limit = rateLimit(`test-start:${ip}`, 10, 3600000);

  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many test attempts. Please try again later." },
      { status: 429, headers: getRateLimitHeaders(limit) }
    );
  }

  try {
    await ensureDatabaseReady();

    const body = await request.json();
    const { fullName, studentId } = body;

    if (!fullName) {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 }
      );
    }

    let config = await prisma.testConfig.findFirst();
    if (!config) {
      config = await prisma.testConfig.create({
        data: {
          questionCount: parseInt(process.env.NEXT_PUBLIC_DEFAULT_QUESTION_COUNT || "20", 10),
          passPercentage: parseInt(process.env.NEXT_PUBLIC_PASS_PERCENTAGE || "60", 10),
          timerEnabled: process.env.NEXT_PUBLIC_ENABLE_TIMER !== "false",
          timerMinutes: parseInt(process.env.NEXT_PUBLIC_TIMER_MINUTES || "30", 10),
          randomizeQuestions: true,
          randomizeAnswers: true,
        },
      });
    }

    const activeQuestions = await prisma.question.findMany({
      where: { isActive: true },
      select: {
        id: true,
        questionText: true,
        optionA: true,
        optionB: true,
        optionC: true,
        optionD: true,
        category: true,
        difficulty: true,
      },
    });

    if (activeQuestions.length < config.questionCount) {
      return NextResponse.json(
        {
          error: `Not enough questions available. Need ${config.questionCount}, have ${activeQuestions.length}`,
        },
        { status: 400 }
      );
    }

    let selectedQuestions = [...activeQuestions];
    if (config.randomizeQuestions) {
      for (let i = selectedQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [selectedQuestions[i], selectedQuestions[j]] = [
          selectedQuestions[j],
          selectedQuestions[i],
        ];
      }
    }
    selectedQuestions = selectedQuestions.slice(0, config.questionCount);

    const sessionId = randomUUID();
    const csrfToken = generateCsrfToken();
    const expiresAt = new Date(Date.now() + config.timerMinutes * 60 * 1000 + 600000);

    await prisma.testProgress.create({
      data: {
        sessionId,
        csrfToken,
        studentData: { fullName, studentId: studentId || null },
        questionIds: selectedQuestions.map((q) => q.id),
        answers: {},
        currentIndex: 0,
        expiresAt,
      },
    });

    const questionsForClient = selectedQuestions.map((q) => {
      const options = [
        { key: "A", text: q.optionA },
        { key: "B", text: q.optionB },
        { key: "C", text: q.optionC },
        { key: "D", text: q.optionD },
      ];

      let shuffledOptions = options;
      if (config!.randomizeAnswers) {
        shuffledOptions = [...options];
        for (let i = shuffledOptions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledOptions[i], shuffledOptions[j]] = [
            shuffledOptions[j],
            shuffledOptions[i],
          ];
        }
      }

      return {
        id: q.id,
        questionText: q.questionText,
        options: shuffledOptions,
        category: q.category,
        difficulty: q.difficulty,
      };
    });

    return NextResponse.json({
      sessionId,
      csrfToken,
      questions: questionsForClient,
      config: {
        questionCount: config.questionCount,
        passPercentage: config.passPercentage,
        timerEnabled: config.timerEnabled,
        timerMinutes: config.timerMinutes,
      },
    });
  } catch (error) {
    console.error("Test start error:", error);
    return NextResponse.json({ error: "Failed to start test" }, { status: 500 });
  }
}
