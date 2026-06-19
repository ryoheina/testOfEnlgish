# Admin Setup Guide

## Initial Admin Account

During database seeding, a default admin account is created using environment variables:

| Variable | Default Value |
|----------|--------------|
| `ADMIN_EMAIL` | admin@example.com |
| `ADMIN_PASSWORD` | Admin@123456 |

These are set in your `.env` file before running `npm run db:seed`.

## First Login

1. Navigate to `/admin/login`
2. Enter your admin email and password
3. You will be redirected to the dashboard

## Security Checklist

After first login, complete these steps:

- [ ] Change the default admin password (update in `.env` and re-seed, or add a password change feature)
- [ ] Set strong `JWT_SECRET` and `CSRF_SECRET` values in `.env`
- [ ] Configure `ADMIN_EMAIL` to your organization's email
- [ ] Review rate limiting settings
- [ ] Upload your downloadable file for post-test delivery
- [ ] Configure test settings (question count, pass percentage, timer)

## Admin Panel Sections

### Dashboard
- View total participants, average/highest/lowest scores
- Score distribution bar chart
- Pass/fail rate pie chart

### Results
- Search by name, email, or student ID
- Sort by score, date, or name
- Filter by date range
- Delete individual or bulk results
- Export to CSV or Excel

### Questions
- Add, edit, and delete questions manually
- Import questions from CSV file
- Each question requires: text, 4 options (A-D), correct answer, optional category and difficulty

#### CSV Import Format

```csv
question,optionA,optionB,optionC,optionD,correctAnswer,category,difficulty
"She walks to school.",walks,walk,walking,walked,A,Grammar,easy
```

A sample file is available at `public/sample-questions.csv`.

### Files
- Upload files for automatic download after test submission
- Toggle files active/inactive
- Only the most recent active file is served to students

### Settings
- **Question Count:** 20–100 questions per test
- **Pass Percentage:** Minimum score to pass (default 60%)
- **Timer:** Enable/disable with configurable duration
- **Randomize Questions:** Shuffle question order per test session
- **Randomize Answers:** Shuffle answer options per question

## Adding Additional Admins

Currently, admins are managed via the database. To add a new admin:

```bash
npx tsx -e "
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
bcrypt.hash('NewPassword123!', 12).then(hash => {
  prisma.admin.create({
    data: { email: 'newadmin@example.com', passwordHash: hash, name: 'New Admin' }
  }).then(() => { console.log('Admin created'); prisma.\$disconnect(); });
});
"
```

## Session Management

- Admin sessions expire after 8 hours
- JWT tokens are stored in HTTP-only cookies
- Logout clears the session cookie immediately

## IP Address Collection

Student IP addresses are collected during test submission for audit purposes. This is stored in the `test_results.ip_address` field. Ensure your privacy policy covers this data collection in accordance with local regulations (GDPR, etc.).
