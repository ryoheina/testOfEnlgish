import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const where: Record<string, unknown> = {};

    if (search) {
      where.student = {
        OR: [
          { fullName: { contains: search, mode: "insensitive" } },
          { studentId: { contains: search, mode: "insensitive" } },
        ],
      };
    }

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

    const orderBy: Record<string, string> = {};
    if (sortBy === "score" || sortBy === "percentage") {
      orderBy[sortBy] = sortOrder;
    } else if (sortBy === "name") {
      orderBy.student = "fullName";
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [results, total] = await Promise.all([
      prisma.testResult.findMany({
        where,
        include: {
          student: {
            select: { fullName: true, studentId: true },
          },
        },
        orderBy:
          sortBy === "name"
            ? { student: { fullName: sortOrder as "asc" | "desc" } }
            : (orderBy as never),
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.testResult.count({ where }),
    ]);

    return NextResponse.json({
      results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Results fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body as { ids: string[] };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Result IDs required" }, { status: 400 });
    }

    await prisma.testResult.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({ success: true, deleted: ids.length });
  } catch (error) {
    console.error("Results delete error:", error);
    return NextResponse.json({ error: "Failed to delete results" }, { status: 500 });
  }
}
