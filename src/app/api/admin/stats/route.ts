import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function getScoreRange(percentage: number): string {
  if (percentage >= 90) return "90-100";
  if (percentage >= 80) return "80-89";
  if (percentage >= 70) return "70-79";
  if (percentage >= 60) return "60-69";
  return "0-59";
}

export async function GET() {
  try {
    const [totalParticipants, avgScore, highestScore, lowestScore, passCount, recentResults, allPercentages] =
      await Promise.all([
        prisma.testResult.count(),
        prisma.testResult.aggregate({ _avg: { percentage: true } }),
        prisma.testResult.aggregate({ _max: { percentage: true } }),
        prisma.testResult.aggregate({ _min: { percentage: true } }),
        prisma.testResult.count({ where: { passed: true } }),
        prisma.testResult.findMany({
          take: 7,
          orderBy: { createdAt: "desc" },
          select: {
            percentage: true,
            createdAt: true,
            student: { select: { fullName: true } },
          },
        }),
        prisma.testResult.findMany({ select: { percentage: true } }),
      ]);

    const passRate =
      totalParticipants > 0 ? (passCount / totalParticipants) * 100 : 0;

    const rangeCounts = new Map<string, number>();
    for (const range of ["90-100", "80-89", "70-79", "60-69", "0-59"]) {
      rangeCounts.set(range, 0);
    }
    for (const { percentage } of allPercentages) {
      const range = getScoreRange(percentage);
      rangeCounts.set(range, (rangeCounts.get(range) || 0) + 1);
    }

    const scoreDistribution = Array.from(rangeCounts.entries())
      .map(([range, count]) => ({ range, count }))
      .sort((a, b) => b.range.localeCompare(a.range));

    return NextResponse.json({
      totalParticipants,
      averageScore: avgScore._avg.percentage || 0,
      highestScore: highestScore._max.percentage || 0,
      lowestScore: lowestScore._min.percentage || 0,
      passRate,
      passCount,
      failCount: totalParticipants - passCount,
      scoreDistribution,
      recentResults,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 });
  }
}
