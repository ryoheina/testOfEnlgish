import { execSync } from "node:child_process";

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

console.log("Running Prisma migrations...");
try {
  run("npx prisma migrate deploy");
} catch (error) {
  console.error("migrate deploy failed:", error);
  console.log("Falling back to db push...");
  run("npx prisma db push --accept-data-loss");
}

console.log("Seeding database if needed...");
try {
  run("npx tsx prisma/seed.ts");
} catch (error) {
  console.error("Seed failed (non-fatal if data exists):", error);
}

console.log("Release phase complete.");
