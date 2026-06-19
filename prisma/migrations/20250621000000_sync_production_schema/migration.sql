-- Sync production database to current Prisma schema (idempotent, preserves data)
-- Handles legacy columns: email, vocabulary_score, audio_id from earlier deploy attempts

-- ─── ADMINS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "admins" (
    "id" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "admins" ADD COLUMN IF NOT EXISTS "username" TEXT;
ALTER TABLE "admins" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'admins' AND column_name = 'email'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'admins' AND column_name = 'username'
  ) THEN
    UPDATE "admins" SET "username" = "email" WHERE "username" IS NULL OR "username" = '';
    ALTER TABLE "admins" DROP COLUMN IF EXISTS "email";
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'admins' AND column_name = 'email'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'admins' AND column_name = 'username'
  ) THEN
    ALTER TABLE "admins" RENAME COLUMN "email" TO "username";
  END IF;
END $$;

ALTER TABLE "admins" DROP COLUMN IF EXISTS "email";

UPDATE "admins" SET "username" = 'admin' WHERE "username" IS NULL OR "username" = '';

CREATE UNIQUE INDEX IF NOT EXISTS "admins_username_key" ON "admins"("username");

-- ─── STUDENTS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "students" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "student_id" TEXT;
ALTER TABLE "students" DROP COLUMN IF EXISTS "email";

-- ─── TEST RESULTS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "test_results" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "test_results_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "test_results" ADD COLUMN IF NOT EXISTS "percentage" DOUBLE PRECISION;
ALTER TABLE "test_results" ADD COLUMN IF NOT EXISTS "passed" BOOLEAN DEFAULT false;
ALTER TABLE "test_results" ADD COLUMN IF NOT EXISTS "time_taken" INTEGER;
ALTER TABLE "test_results" ADD COLUMN IF NOT EXISTS "ip_address" TEXT;
ALTER TABLE "test_results" ADD COLUMN IF NOT EXISTS "answers" JSONB;

ALTER TABLE "test_results" DROP COLUMN IF EXISTS "email";
ALTER TABLE "test_results" DROP COLUMN IF EXISTS "vocabulary_score";

UPDATE "test_results"
SET "percentage" = CASE
  WHEN "total" > 0 THEN ("score"::double precision / "total"::double precision) * 100
  ELSE 0
END
WHERE "percentage" IS NULL;

UPDATE "test_results" SET "passed" = false WHERE "passed" IS NULL;
UPDATE "test_results" SET "answers" = '{}'::jsonb WHERE "answers" IS NULL;

ALTER TABLE "test_results" ALTER COLUMN "percentage" SET NOT NULL;
ALTER TABLE "test_results" ALTER COLUMN "passed" SET NOT NULL;
ALTER TABLE "test_results" ALTER COLUMN "answers" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "test_results_created_at_idx" ON "test_results"("created_at");
CREATE INDEX IF NOT EXISTS "test_results_percentage_idx" ON "test_results"("percentage");

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'test_results_student_id_fkey'
  ) THEN
    ALTER TABLE "test_results"
      ADD CONSTRAINT "test_results_student_id_fkey"
      FOREIGN KEY ("student_id") REFERENCES "students"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ─── QUESTIONS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "questions" (
    "id" TEXT NOT NULL,
    "question_text" TEXT NOT NULL,
    "option_a" TEXT NOT NULL,
    "option_b" TEXT NOT NULL,
    "option_c" TEXT NOT NULL,
    "option_d" TEXT NOT NULL,
    "correct_answer" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "category" TEXT;
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "difficulty" TEXT NOT NULL DEFAULT 'medium';
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "questions" DROP COLUMN IF EXISTS "audio_id";
ALTER TABLE "questions" DROP COLUMN IF EXISTS "vocabulary_score";

CREATE INDEX IF NOT EXISTS "questions_is_active_idx" ON "questions"("is_active");

-- ─── DOWNLOADABLE FILES ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "downloadable_files" (
    "id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "downloadable_files_pkey" PRIMARY KEY ("id")
);

-- ─── TEST CONFIG ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "test_config" (
    "id" TEXT NOT NULL,
    "question_count" INTEGER NOT NULL DEFAULT 20,
    "pass_percentage" INTEGER NOT NULL DEFAULT 60,
    "timer_enabled" BOOLEAN NOT NULL DEFAULT true,
    "timer_minutes" INTEGER NOT NULL DEFAULT 30,
    "randomize_questions" BOOLEAN NOT NULL DEFAULT true,
    "randomize_answers" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "test_config_pkey" PRIMARY KEY ("id")
);

-- ─── TEST PROGRESS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "test_progress" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "student_data" JSONB NOT NULL,
    "answers" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "current_index" INTEGER NOT NULL DEFAULT 0,
    "question_ids" JSONB NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "test_progress_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "test_progress" ADD COLUMN IF NOT EXISTS "csrf_token" TEXT;

UPDATE "test_progress"
SET "csrf_token" = md5(random()::text || clock_timestamp()::text)
WHERE "csrf_token" IS NULL OR "csrf_token" = '';

ALTER TABLE "test_progress" ALTER COLUMN "csrf_token" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "test_progress_session_id_key" ON "test_progress"("session_id");
CREATE INDEX IF NOT EXISTS "test_progress_expires_at_idx" ON "test_progress"("expires_at");
