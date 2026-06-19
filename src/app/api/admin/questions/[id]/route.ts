import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { questionSchema } from "@/lib/validations";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = questionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid question data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const question = await prisma.question.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ question });
  } catch (error) {
    console.error("Question update error:", error);
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.question.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Question delete error:", error);
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
  }
}
