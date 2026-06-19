import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

function runSafe(command) {
  console.log(`> ${command}`);
  try {
    execSync(command, { stdio: "inherit", env: process.env });
    return true;
  } catch (error) {
    console.error(`[warn] command failed: ${command}`);
    if (error instanceof Error) console.error(error.message);
    return false;
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error(
      "\n[FATAL] DATABASE_URL is not set.\n" +
        "Railway: + New → Database → PostgreSQL\n" +
        "Then: App → Variables → Reference → DATABASE_URL\n"
    );
    process.exit(1);
  }

  console.log("Syncing database schema...");
  const migrated = runSafe("npx prisma migrate deploy");
  if (!migrated) {
    runSafe("npx prisma db push --accept-data-loss");
  }

  const prisma = new PrismaClient();

  try {
    let questionCount = 0;
    let adminCount = 0;

    try {
      questionCount = await prisma.question.count();
      adminCount = await prisma.admin.count();
    } catch {
      console.log("Tables not ready yet, will seed...");
    }

    if (
      questionCount === 0 ||
      adminCount === 0 ||
      process.env.RUN_SEED === "true"
    ) {
      console.log("Seeding database...");
      runSafe("npx tsx prisma/seed.ts");
    } else {
      console.log(
        `Database ready (${questionCount} questions, ${adminCount} admin).`
      );
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log("Database setup complete.");
}

main().catch((error) => {
  console.error("Database setup error:", error);
  // Do not crash deploy — runtime bootstrap will retry
  process.exit(0);
});
