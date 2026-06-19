import { execSync } from "node:child_process";
import prisma from "./prisma";

let ready = false;
let bootPromise: Promise<void> | null = null;

function runSafe(command: string) {
  try {
    execSync(command, { stdio: "pipe", env: process.env });
    return true;
  } catch {
    return false;
  }
}

async function bootstrap() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }

  console.log("[db] Ensuring schema...");
  const migrated = runSafe("npx prisma migrate deploy");
  if (!migrated) {
    runSafe("npx prisma db push --accept-data-loss");
  }

  let questionCount = 0;
  let adminCount = 0;

  try {
    questionCount = await prisma.question.count();
    adminCount = await prisma.admin.count();
  } catch (error) {
    console.error("[db] Table check failed, pushing schema again...", error);
    runSafe("npx prisma db push --accept-data-loss");
    questionCount = await prisma.question.count();
    adminCount = await prisma.admin.count();
  }

  if (
    questionCount === 0 ||
    adminCount === 0 ||
    process.env.RUN_SEED === "true"
  ) {
    console.log("[db] Seeding...");
    runSafe("npx tsx prisma/seed.ts");
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
