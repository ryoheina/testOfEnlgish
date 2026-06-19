# Installation Guide

## System Requirements

| Requirement | Minimum Version |
|-------------|----------------|
| Node.js | 18.x or later |
| npm | 9.x or later |
| PostgreSQL | 14.x or later |

## Step-by-Step Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up PostgreSQL

Create a new PostgreSQL database:

```sql
CREATE DATABASE english_test;
CREATE USER english_test_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE english_test TO english_test_user;
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
DATABASE_URL="postgresql://english_test_user:your_secure_password@localhost:5432/english_test?schema=public"
JWT_SECRET="generate-a-random-32-character-string-here"
CSRF_SECRET="generate-another-random-string-here"
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="YourSecurePassword123!"
```

Generate secure secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data (admin account + 25 questions)
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at:
- **Test Platform:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin/login

### 6. Verify Installation

1. Visit the landing page and click "Start English Test"
2. Fill in student information and complete a test
3. Log in to the admin panel with your configured credentials
4. Verify the test result appears in the dashboard

## Troubleshooting

### Database Connection Failed

- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL format and credentials
- Ensure the database exists and user has permissions

### Prisma Generate Failed

```bash
npx prisma generate
```

### Port Already in Use

```bash
# Use a different port
PORT=3001 npm run dev
```

### Missing Questions Error

Run the seed script to populate sample questions:

```bash
npm run db:seed
```

Or import questions via the admin panel using the sample CSV at `public/sample-questions.csv`.

## Production Build

```bash
npm run build
npm start
```

See [Deployment Guide](DEPLOYMENT.md) for production deployment instructions.
