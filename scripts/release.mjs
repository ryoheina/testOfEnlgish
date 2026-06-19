import { execSync } from "node:child_process";

function run(command) {
  console.log(`> ${command}`);
  execSync(command, { stdio: "inherit", env: process.env });
}

if (!process.env.DATABASE_URL) {
  console.error(
    "\n[ERROR] DATABASE_URL is not set.\n" +
      "Add PostgreSQL in Railway: + New → Database → PostgreSQL\n" +
      "Then link it: App → Variables → Reference → DATABASE_URL\n"
  );
  process.exit(1);
}

console.log("Running database migrations...");
try {
  run("npx prisma migrate deploy");
} catch {
  console.log("migrate deploy failed, trying db push...");
  run("npx prisma db push");
}

if (process.env.RUN_SEED === "true") {
  console.log("Seeding database...");
  run("npx tsx prisma/seed.ts");
}

console.log("Release phase complete.");
