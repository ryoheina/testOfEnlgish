import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { PrismaClient } from "@prisma/client";

const MIGRATIONS_DIR = join(process.cwd(), "prisma", "migrations");

function splitSqlStatements(sql: string): string[] {
  return sql
    .split(/;\s*\n/)
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0 && !statement.startsWith("--"));
}

function isIgnorableError(message: string): boolean {
  return (
    message.includes("already exists") ||
    message.includes("duplicate key") ||
    message.includes("duplicate_column") ||
    message.includes("does not exist") && message.includes("DROP")
  );
}

async function executeSqlFile(
  client: PrismaClient,
  filePath: string
): Promise<void> {
  const sql = readFileSync(filePath, "utf8");
  const statements = splitSqlStatements(sql);

  for (const statement of statements) {
    try {
      await client.$executeRawUnsafe(`${statement};`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (isIgnorableError(message)) continue;
      console.error(`[db] SQL failed: ${statement.slice(0, 120)}...`);
      throw error;
    }
  }
}

export async function applySchemaSync(client: PrismaClient): Promise<void> {
  const migrationDirs = readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const dir of migrationDirs) {
    const migrationFile = join(MIGRATIONS_DIR, dir, "migration.sql");
    try {
      readFileSync(migrationFile, "utf8");
    } catch {
      continue;
    }
    console.log(`[db] Applying migration SQL: ${dir}`);
    await executeSqlFile(client, migrationFile);
  }

  console.log("[db] Schema sync complete.");
}

export async function schemaIsReady(client: PrismaClient): Promise<boolean> {
  try {
    const columns = await client.$queryRaw<
      { table_name: string; column_name: string }[]
    >`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND (
          (table_name = 'admins' AND column_name = 'username')
          OR (table_name = 'test_results' AND column_name = 'percentage')
          OR (table_name = 'test_progress' AND column_name = 'csrf_token')
          OR (table_name = 'questions' AND column_name = 'question_text')
          OR (table_name = 'test_config' AND column_name = 'question_count')
        )
    `;

    const required = new Set([
      "admins:username",
      "test_results:percentage",
      "test_progress:csrf_token",
      "questions:question_text",
      "test_config:question_count",
    ]);

    for (const row of columns) {
      required.delete(`${row.table_name}:${row.column_name}`);
    }

    return required.size === 0;
  } catch {
    return false;
  }
}
