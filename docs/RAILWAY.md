# Railway Deployment — READ THIS

### Why healthcheck failed

The old start script ran **database migrations before starting the web server**. Railway's healthcheck timed out (~90s) waiting for a response because `next start` never ran in time.

**Fixed:** migrations run in `release` phase; `start` only launches the server immediately.

### Deploy checklist (do ALL steps)

### 1. Push latest code to GitHub
Make sure Railway deploys the newest commit (not just "first commit").

### 2. Add PostgreSQL (REQUIRED)
```
Railway project → + New → Database → PostgreSQL
```
Then open your **app service** → Variables → confirm `DATABASE_URL` exists (Railway adds it when you reference the database).

To link database to app:
```
App service → Variables → + New Variable → Add Reference → DATABASE_URL
```

### 3. Set these variables on the APP service

| Variable | Value |
|----------|-------|
| `JWT_SECRET` | any random 32+ character string |
| `CSRF_SECRET` | any random 32+ character string |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | your password |
| `RUN_SEED` | `true` (first deploy only) |
| `NODE_ENV` | `production` |

Generate a secret:
```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Redeploy
Click **Redeploy** on the app service (or push a new commit).

### 5. Expose the site
```
App service → Settings → Networking → Generate Domain
```

### 6. After first successful deploy
Set `RUN_SEED` back to `false` and redeploy.

## Verify it works

Visit: `https://your-domain.up.railway.app/api/health`

Should return: `{"ok":true,"status":"healthy"}`

## Still crashing?

Open **Deployments → View Logs** and check for:

| Log message | Fix |
|-------------|-----|
| `DATABASE_URL is not set` | Add PostgreSQL database |
| `Can't reach database` | Link DATABASE_URL to app service |
| `JWT_SECRET` errors | Add JWT_SECRET variable |
| Build errors about tailwind | Push latest code (this is fixed) |

## Manual seed (if needed)

```bash
railway run npm run db:seed
```
