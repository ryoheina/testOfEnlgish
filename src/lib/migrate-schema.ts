import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { PrismaClient } from "@prisma/client";

const MIGRATION_FILE = join(
  process.cwd(),
  "prisma",
  "migrations",
  "20250620000000_init",
  "migration.sql"
);

function splitSqlStatements(sql: string): string[] {
  return sql
    .split(/;\s*\n/)
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0 && !statement.startsWith("--"));
}

export async function applyInitialSchema(client: PrismaClient): Promise<void> {
  const sql = readFileSync(MIGRATION_FILE, "utf8");
  const statements = splitSqlStatements(sql);

  for (const statement of statements) {
    try {
      await client.$executeRawUnsafe(`${statement};`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (
        message.includes("already exists") ||
        message.includes("duplicate key")
      ) {
        continue;
      }
      throw error;
    }
  }

  console.log("[db] Initial schema applied.");
}

export async function schemaIsReady(client: PrismaClient): Promise<boolean> {
  try {
    await client.admin.findFirst({ select: { id: true } });
    return true;
  } catch {
    return false;
  }
}
