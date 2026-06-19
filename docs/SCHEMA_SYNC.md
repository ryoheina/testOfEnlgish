# Railway Schema Sync Guide

## ORM

This project uses **Prisma ORM** with **PostgreSQL**.

Schema definition: `prisma/schema.prisma`  
Migrations: `prisma/migrations/`

## Why the schema became inconsistent

1. **Multiple deploy attempts** created tables with different column sets (email vs username, missing `percentage`, legacy `audio_id` / `vocabulary_score`).
2. **Runtime bootstrap used `CREATE TABLE IF NOT EXISTS`** — existing old tables were kept, missing new columns were never added.
3. **`prisma migrate deploy` was not applied reliably** on Railway release phase.
4. **Code evolved** (removed student email, added username, csrf_token, percentage) but the production DB was never migrated.

## Current schema (code expects)

| Table | Required columns |
|-------|------------------|
| `admins` | id, username, password_hash, name, created_at, updated_at |
| `students` | id, full_name, student_id, created_at (no email) |
| `test_results` | id, student_id, score, total, **percentage**, passed, time_taken, ip_address, answers, created_at |
| `questions` | id, question_text, option_a–d, correct_answer, category, difficulty, is_active, created_at, updated_at (no audio_id) |
| `test_config` | question_count, pass_percentage, timer settings, etc. |
| `test_progress` | session_id, **csrf_token**, student_data, answers, question_ids, expires_at |
| `downloadable_files` | file metadata columns |

## Fix applied in code

New migration: `prisma/migrations/20250621000000_sync_production_schema/migration.sql`

This migration is **idempotent** and:
- Adds all missing columns with `ADD COLUMN IF NOT EXISTS`
- Migrates `admins.email` → `admins.username`
- Backfills `test_results.percentage` from score/total
- Drops legacy columns: `email`, `vocabulary_score`, `audio_id`
- Preserves existing row data

Updated files:
- `src/lib/migrate-schema.ts` — runs all migration SQL files in order
- `src/lib/db-bootstrap.ts` — syncs schema before API requests
- `scripts/ensure-db.mjs` — runs `prisma migrate deploy` on Railway release

## Railway production commands

Run these in **Railway Shell** on your app service (or redeploy after pushing code):

```bash
# 1. Apply all Prisma migrations (recommended)
npx prisma migrate deploy

# 2. If migrate deploy fails due to drift, force sync:
npx prisma db push --accept-data-loss

# 3. Seed admin + sample questions (first time or reset)
RUN_SEED=true npx tsx prisma/seed.ts

# 4. Verify schema
npx prisma db pull --print
```

### One-command fix (Railway shell)

```bash
npx prisma migrate deploy && npx tsx prisma/seed.ts
```

### After pushing latest code

1. Set `RUN_SEED=true` in Railway variables (first deploy only)
2. Redeploy the app service
3. Check logs for `[db] Schema sync complete.` and `[db] Ready.`
4. Test: `GET /api/health` → 200
5. Test: `POST /api/admin/auth/login` with your credentials → 200
6. Test: `POST /api/test/start` → 200 with questions
7. Set `RUN_SEED=false` and redeploy

## Required Railway environment variables

```
DATABASE_URL=<from PostgreSQL plugin>
JWT_SECRET=<random 32+ chars>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<your password>
RUN_SEED=true   # first deploy only
NODE_ENV=production
```

## Data preservation

The sync migration:
- Does **not** drop tables
- Backfills `percentage` from existing score/total
- Renames/migrates admin email → username
- Only drops unused legacy columns (`email`, `audio_id`, `vocabulary_score`) that are not in current code
