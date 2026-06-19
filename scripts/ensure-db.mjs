import { PrismaClient } from "@prisma/client";
import { execSync } from "node:child_process";

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

  console.log("Running database migrations...");
  const migrated = runSafe("npx prisma migrate deploy");
  if (!migrated) {
    runSafe("npx prisma db push --accept-data-loss");
  }

  console.log("Seeding database if needed...");
  runSafe("npx tsx prisma/seed.ts");

  console.log("Release phase complete.");
}

main().catch((error) => {
  console.error("Release setup failed:", error);
  process.exit(1);
});
