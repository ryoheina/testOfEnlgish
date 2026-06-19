# Database Schema

## Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────┐       ┌──────────────┐
│   admins    │       │   students   │       │  questions   │
├─────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)     │       │ id (PK)      │       │ id (PK)      │
│ email       │       │ full_name    │       │ question_text│
│ password_hash│      │ email        │       │ option_a-d   │
│ name        │       │ student_id   │       │ correct_answer│
│ created_at  │       │ created_at   │       │ category     │
│ updated_at  │       └──────┬───────┘       │ difficulty   │
└─────────────┘              │               │ is_active    │
                             │ 1:N           │ created_at   │
                             ▼               │ updated_at   │
                      ┌──────────────┐       └──────────────┘
                      │ test_results │
                      ├──────────────┤
                      │ id (PK)      │
                      │ student_id(FK)│
                      │ score        │
                      │ total        │
                      │ percentage   │
                      │ passed       │
                      │ time_taken   │
                      │ ip_address   │
                      │ answers (JSON)│
                      │ created_at   │
                      └──────────────┘

┌──────────────────┐  ┌──────────────┐  ┌──────────────────┐
│ downloadable_files│  │ test_config  │  │  test_progress   │
├──────────────────┤  ├──────────────┤  ├──────────────────┤
│ id (PK)          │  │ id (PK)      │  │ id (PK)          │
│ file_name        │  │ question_count│ │ session_id       │
│ file_path        │  │ pass_percentage│ session_id (UQ) │
│ mime_type        │  │ timer_enabled│  │ student_data(JSON)│
│ file_size        │  │ timer_minutes│  │ answers (JSON)   │
│ description      │  │ randomize_q  │  │ current_index    │
│ is_active        │  │ randomize_a  │  │ question_ids(JSON)│
│ created_at       │  │ updated_at   │  │ started_at       │
│ updated_at       │  └──────────────┘  │ expires_at       │
└──────────────────┘                    └──────────────────┘
```

## Tables

### admins

Administrator accounts for the admin panel.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid() |
| email | VARCHAR | UNIQUE, NOT NULL |
| password_hash | VARCHAR | NOT NULL |
| name | VARCHAR | NOT NULL |
| created_at | TIMESTAMP | DEFAULT now() |
| updated_at | TIMESTAMP | AUTO UPDATE |

### students

Student information collected before test.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| full_name | VARCHAR | NOT NULL |
| email | VARCHAR | NOT NULL, INDEXED |
| student_id | VARCHAR | NULLABLE |
| created_at | TIMESTAMP | DEFAULT now() |

### test_results

Test submission results linked to students.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| student_id | UUID | FOREIGN KEY → students.id, CASCADE |
| score | INTEGER | NOT NULL |
| total | INTEGER | NOT NULL |
| percentage | FLOAT | NOT NULL, INDEXED |
| passed | BOOLEAN | NOT NULL |
| time_taken | INTEGER | NULLABLE (seconds) |
| ip_address | VARCHAR | NULLABLE |
| answers | JSON | NOT NULL |
| created_at | TIMESTAMP | DEFAULT now(), INDEXED |

### questions

Test question bank.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| question_text | TEXT | NOT NULL |
| option_a | VARCHAR | NOT NULL |
| option_b | VARCHAR | NOT NULL |
| option_c | VARCHAR | NOT NULL |
| option_d | VARCHAR | NOT NULL |
| correct_answer | VARCHAR | NOT NULL (A/B/C/D) |
| category | VARCHAR | NULLABLE |
| difficulty | VARCHAR | DEFAULT 'medium' |
| is_active | BOOLEAN | DEFAULT true, INDEXED |
| created_at | TIMESTAMP | DEFAULT now() |
| updated_at | TIMESTAMP | AUTO UPDATE |

### downloadable_files

Files served to students after test completion.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| file_name | VARCHAR | NOT NULL |
| file_path | VARCHAR | NOT NULL |
| mime_type | VARCHAR | NOT NULL |
| file_size | INTEGER | NOT NULL |
| description | VARCHAR | NULLABLE |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMP | DEFAULT now() |
| updated_at | TIMESTAMP | AUTO UPDATE |

### test_config

Global test configuration (single row).

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| question_count | INTEGER | DEFAULT 20 |
| pass_percentage | INTEGER | DEFAULT 60 |
| timer_enabled | BOOLEAN | DEFAULT true |
| timer_minutes | INTEGER | DEFAULT 30 |
| randomize_questions | BOOLEAN | DEFAULT true |
| randomize_answers | BOOLEAN | DEFAULT true |
| updated_at | TIMESTAMP | AUTO UPDATE |

### test_progress

Temporary test session progress for auto-save.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| session_id | UUID | UNIQUE |
| student_data | JSON | NOT NULL |
| answers | JSON | DEFAULT {} |
| current_index | INTEGER | DEFAULT 0 |
| question_ids | JSON | NOT NULL |
| started_at | TIMESTAMP | DEFAULT now() |
| expires_at | TIMESTAMP | NOT NULL, INDEXED |

## Migrations

Using Prisma, run migrations with:

```bash
# Development (push schema directly)
npm run db:push

# Production (create migration files)
npm run db:migrate
```

## Indexes

- `students.email` — Fast lookup by email
- `test_results.created_at` — Date filtering and sorting
- `test_results.percentage` — Score sorting
- `questions.is_active` — Active question filtering
- `test_progress.expires_at` — Session cleanup

## Data Retention

- `test_progress` records expire based on `expires_at` (timer + 10 min buffer)
- Consider implementing a cron job to clean expired progress records
- Test results and student data persist until manually deleted by admin
