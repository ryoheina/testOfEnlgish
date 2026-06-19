import { execSync } from "node:child_process";

execSync("node scripts/ensure-db.mjs", { stdio: "inherit", env: process.env });
