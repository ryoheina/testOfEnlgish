import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function logError(context: string, error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error(`[${context}] Prisma ${error.code}:`, error.message);
    return;
  }
  if (error instanceof Prisma.PrismaClientInitializationError) {
    console.error(`[${context}] Prisma init:`, error.message);
    return;
  }
  if (error instanceof ApiError) {
    console.error(`[${context}] ApiError ${error.status}:`, error.message);
    return;
  }
  console.error(`[${context}]`, error);
}

export function handleApiError(context: string, error: unknown): NextResponse {
  logError(context, error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status }
    );
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return NextResponse.json(
      {
        error: "Database is not configured. Set DATABASE_URL on Railway.",
        code: "DB_NOT_CONFIGURED",
      },
      { status: 503 }
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P1001":
      case "P1002":
      case "P1003":
        return NextResponse.json(
          {
            error: "Cannot connect to the database. Check DATABASE_URL.",
            code: error.code,
          },
          { status: 503 }
        );
      case "P2021":
        return NextResponse.json(
          {
            error: "Database tables are missing. Redeploy or run db setup.",
            code: error.code,
          },
          { status: 503 }
        );
      default:
        return NextResponse.json(
          { error: "Database error occurred.", code: error.code },
          { status: 500 }
        );
    }
  }

  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}

export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new ApiError(
      503,
      `Missing required environment variable: ${name}`,
      "ENV_MISSING"
    );
  }
  return value;
}
