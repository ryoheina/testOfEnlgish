import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

function run(command) {
  console.log(`> ${command}`);
  execSync(command, { stdio: "inherit", env: process.env });
}

if (!process.env.DATABASE_URL) {
  console.error(
    "\n[FATAL] DATABASE_URL is not set.\n" +
      "Railway: + New → Database → PostgreSQL\n" +
      "Then: App → Variables → Reference → DATABASE_URL\n"
  );
  process.exit(1);
}

console.log("Syncing database schema...");
run("npx prisma db push --skip-generate");

const prisma = new PrismaClient();

try {
  const [questionCount, adminCount] = await Promise.all([
    prisma.question.count(),
    prisma.admin.count(),
  ]);

  if (
    questionCount === 0 ||
    adminCount === 0 ||
    process.env.RUN_SEED === "true"
  ) {
    console.log("Seeding database...");
    run("npx tsx prisma/seed.ts");
  } else {
    console.log(
      `Database ready (${questionCount} questions, ${adminCount} admin account).`
    );
  }
} catch (error) {
  console.error("Database check failed:", error);
  console.log("Attempting seed as recovery...");
  run("npx tsx prisma/seed.ts");
} finally {
  await prisma.$disconnect();
}

console.log("Database setup complete.");
