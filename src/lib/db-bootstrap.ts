import prisma from "./prisma";
import { applyInitialSchema, schemaIsReady } from "./migrate-schema";
import { seedDatabase } from "./seed-data";
import { ApiError } from "./api-error";

let ready = false;
let bootPromise: Promise<void> | null = null;

async function bootstrap(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new ApiError(
      503,
      "DATABASE_URL is not set. Add PostgreSQL on Railway and link it to this service.",
      "DB_NOT_CONFIGURED"
    );
  }

  await prisma.$queryRaw`SELECT 1`;

  const hasSchema = await schemaIsReady(prisma);
  if (!hasSchema) {
    console.log("[db] Schema missing, applying migration SQL...");
    await applyInitialSchema(prisma);
  }

  const [questionCount, adminCount] = await Promise.all([
    prisma.question.count(),
    prisma.admin.count(),
  ]);

  if (
    questionCount === 0 ||
    adminCount === 0 ||
    process.env.RUN_SEED === "true"
  ) {
    console.log("[db] Seeding database...");
    await seedDatabase(prisma);
  }

  ready = true;
  console.log("[db] Ready.");
}

export async function ensureDatabaseReady(): Promise<void> {
  if (ready) return;

  if (!bootPromise) {
    bootPromise = bootstrap().catch((error) => {
      bootPromise = null;
      throw error;
    });
  }

  await bootPromise;
}

export function resetDatabaseReadyCache(): void {
  ready = false;
  bootPromise = null;
}
