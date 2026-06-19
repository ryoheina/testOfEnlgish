import { execSync } from "node:child_process";

console.log("Preparing database...");
execSync("node scripts/ensure-db.mjs", { stdio: "inherit", env: process.env });

const port = process.env.PORT || "3000";
const command = `npx next start -H 0.0.0.0 -p ${port}`;

console.log(`Starting server: ${command}`);
execSync(command, { stdio: "inherit", env: process.env });
