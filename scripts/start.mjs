import { execSync } from "node:child_process";

function run(command, optional = false) {
  console.log(`> ${command}`);
  try {
    execSync(command, {
      stdio: "inherit",
      env: process.env,
    });
  } catch (error) {
    if (optional) {
      console.warn(`[warn] optional step failed: ${command}`);
      return;
    }
    throw error;
  }
}

if (!process.env.DATABASE_URL) {
  console.error(
    "\n[FATAL] DATABASE_URL is not set.\n" +
      "In Railway: click + New → Database → PostgreSQL, then redeploy.\n"
  );
  process.exit(1);
}

console.log("Setting up database...");
try {
  run("npx prisma migrate deploy");
} catch {
  console.log("migrate deploy failed, falling back to db push...");
  run("npx prisma db push");
}

if (process.env.RUN_SEED === "true") {
  console.log("Seeding database...");
  run("npx tsx prisma/seed.ts", true);
}

const port = process.env.PORT || "3000";
console.log(`Starting server on 0.0.0.0:${port}...`);
run(`npx next start -H 0.0.0.0 -p ${port}`);
