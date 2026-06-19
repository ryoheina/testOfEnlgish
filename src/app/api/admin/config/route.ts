import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { testConfigSchema } from "@/lib/validations";

export async function GET() {
  try {
    let config = await prisma.testConfig.findFirst();
    if (!config) {
      config = await prisma.testConfig.create({
        data: {
          questionCount: 20,
          passPercentage: 60,
          timerEnabled: true,
          timerMinutes: 30,
          randomizeQuestions: true,
          randomizeAnswers: true,
        },
      });
    }
    return NextResponse.json({ config });
  } catch (error) {
    console.error("Config fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = testConfigSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid config data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    let config = await prisma.testConfig.findFirst();
    if (config) {
      config = await prisma.testConfig.update({
        where: { id: config.id },
        data: parsed.data,
      });
    } else {
      config = await prisma.testConfig.create({ data: parsed.data });
    }

    return NextResponse.json({ config });
  } catch (error) {
    console.error("Config update error:", error);
    return NextResponse.json({ error: "Failed to update config" }, { status: 500 });
  }
}
