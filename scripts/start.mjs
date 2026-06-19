import { execSync } from "node:child_process";

function run(command) {
  console.log(`> ${command}`);
  execSync(command, { stdio: "inherit", env: process.env });
}

if (process.env.RUN_SEED === "true") {
  run("npx tsx prisma/seed.ts");
}

run("next start");
