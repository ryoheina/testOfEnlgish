import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stringify } from "csv-stringify/sync";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
  try {
    const format = request.nextUrl.searchParams.get("format") || "csv";
    const dateFrom = request.nextUrl.searchParams.get("dateFrom");
    const dateTo = request.nextUrl.searchParams.get("dateTo");

    const where: Record<string, unknown> = {};
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        (where.createdAt as Record<string, Date>).gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        (where.createdAt as Record<string, Date>).lte = endDate;
      }
    }

    const results = await prisma.testResult.findMany({
      where,
      include: {
        student: {
          select: { fullName: true, studentId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const rows = results.map((r) => ({
      Name: r.student.fullName,
      "Student ID": r.student.studentId || "",
      Score: `${r.score}/${r.total}`,
      Percentage: r.percentage.toFixed(1) + "%",
      Status: r.passed ? "Pass" : "Fail",
      "Time Taken (sec)": r.timeTaken || "",
      "IP Address": r.ipAddress || "",
      Date: new Date(r.createdAt).toISOString(),
    }));

    if (format === "xlsx") {
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Results");
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      return new NextResponse(buffer, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="test-results.xlsx"',
        },
      });
    }

    const csv = stringify(rows, { header: true });
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="test-results.csv"',
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to export results" }, { status: 500 });
  }
}
