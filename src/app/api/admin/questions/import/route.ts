import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parse } from "csv-parse/sync";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "CSV file is required" }, { status: 400 });
    }

    const text = await file.text();
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, string>[];

    const questions = [];
    const errors = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const questionText = row.question || row.questionText || row.Question;
      const optionA = row.optionA || row.option_a || row.A;
      const optionB = row.optionB || row.option_b || row.B;
      const optionC = row.optionC || row.option_c || row.C;
      const optionD = row.optionD || row.option_d || row.D;
      const correctAnswer = (row.correctAnswer || row.correct_answer || row.Answer || "").toUpperCase();

      if (!questionText || !optionA || !optionB || !optionC || !optionD) {
        errors.push(`Row ${i + 2}: Missing required fields`);
        continue;
      }

      if (!["A", "B", "C", "D"].includes(correctAnswer)) {
        errors.push(`Row ${i + 2}: Invalid correct answer (must be A, B, C, or D)`);
        continue;
      }

      questions.push({
        questionText,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer,
        category: row.category || row.Category || null,
        difficulty: (row.difficulty || row.Difficulty || "medium").toLowerCase(),
      });
    }

    if (questions.length === 0) {
      return NextResponse.json(
        { error: "No valid questions found", details: errors },
        { status: 400 }
      );
    }

    const created = await prisma.question.createMany({ data: questions });

    return NextResponse.json({
      success: true,
      imported: created.count,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("CSV import error:", error);
    return NextResponse.json({ error: "Failed to import questions" }, { status: 500 });
  }
}
