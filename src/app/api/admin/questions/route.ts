import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { questionSchema } from "@/lib/validations";

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Questions fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = questionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid question data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const question = await prisma.question.create({ data: parsed.data });
    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    console.error("Question create error:", error);
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
  }
}
