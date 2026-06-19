# Railway Deployment Guide

Deploy the English Test Platform to [Railway](https://railway.com) in a few minutes.

## Prerequisites

- A [Railway](https://railway.com) account
- This project pushed to GitHub (or deploy via Railway CLI)

## Step 1: Create a New Project

1. Go to [railway.com/new](https://railway.com/new)
2. Choose **Deploy from GitHub repo** and select this repository
3. Railway will auto-detect Next.js via `railway.toml`

## Step 2: Add PostgreSQL

1. In your Railway project, click **+ New**
2. Select **Database → PostgreSQL**
3. Railway automatically creates `DATABASE_URL` and links it to your app

> **Important:** The app requires PostgreSQL. SQLite does not work on Railway.

## Step 3: Set Environment Variables

In your app service → **Variables**, add:

| Variable | Value | Required |
|----------|-------|----------|
| `JWT_SECRET` | Random 32+ char string | Yes |
| `CSRF_SECRET` | Random 32+ char string | Yes |
| `ADMIN_USERNAME` | `admin` | Yes |
| `ADMIN_PASSWORD` | Your secure password | Yes |
| `RUN_SEED` | `true` (first deploy only) | First deploy |
| `NODE_ENV` | `production` | Yes |
| `UPLOAD_DIR` | `/app/data/uploads` | If using volume |

Generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`DATABASE_URL` is set automatically when you add PostgreSQL.

## Step 4: First Deploy

1. Push your code — Railway builds automatically
2. Build runs: `prisma generate && next build`
3. Release runs: `prisma migrate deploy` (creates tables)
4. Start runs: database setup + `next start`

## Step 5: Seed Database (First Time)

After the first successful deploy, run once in Railway shell:

```bash
railway run npm run db:seed
```

Or set `RUN_SEED=true` before the first deploy, then set it back to `false`.

This creates:
- Admin account
- 25 sample questions
- Default test configuration

## Step 6: Generate Public URL

1. Open your app service → **Settings → Networking**
2. Click **Generate Domain**
3. Your site is live at `https://your-app.up.railway.app`

## Optional: Persistent File Uploads

Uploaded files are lost on redeploy unless you add a volume:

1. App service → **Settings → Volumes**
2. Mount path: `/app/data/uploads`
3. Set variable: `UPLOAD_DIR=/app/data/uploads`

## Environment Variables Reference

```env
DATABASE_URL=          # Auto-set by Railway PostgreSQL
JWT_SECRET=            # Required — random secret
CSRF_SECRET=           # Required — random secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=        # Your password
RUN_SEED=false         # true on first deploy only
NODE_ENV=production
UPLOAD_DIR=/app/data/uploads
PORT=                  # Auto-set by Railway
```

## Local Development with PostgreSQL

Use Docker for a local database matching production:

```bash
docker compose up -d db
```

Then set in `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/english_test?schema=public"
```

```bash
npm run db:setup
npm run db:seed
npm run dev
```

## Troubleshooting

### Build fails on Prisma
Ensure `DATABASE_URL` is set before build. Railway links PostgreSQL before building.

### 500 errors after deploy
Check deploy logs. Run migrations manually:
```bash
railway run npx prisma migrate deploy
```

### Admin login fails
Re-seed the admin account:
```bash
railway run npm run db:seed
```

### Files disappear after redeploy
Add a Railway volume at `/app/data/uploads` and set `UPLOAD_DIR`.

## Cost Estimate

Railway Hobby plan (~$5/month) covers a small-to-medium test platform with PostgreSQL included.
