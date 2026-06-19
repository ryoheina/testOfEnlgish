# Deployment Guide

## Production Checklist

- [ ] Set strong secrets in environment variables
- [ ] Configure production PostgreSQL database
- [ ] Run database migrations
- [ ] Seed admin account with secure credentials
- [ ] Upload downloadable file via admin panel
- [ ] Configure test settings
- [ ] Import or verify question bank (minimum 20 active questions)
- [ ] Enable HTTPS
- [ ] Review rate limiting settings

## Environment Variables (Production)

```env
DATABASE_URL="postgresql://user:password@host:5432/english_test?schema=public&sslmode=require"
JWT_SECRET="<64-char-random-hex>"
CSRF_SECRET="<64-char-random-hex>"
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="<strong-password>"
NODE_ENV="production"
NEXT_PUBLIC_PASS_PERCENTAGE=60
NEXT_PUBLIC_DEFAULT_QUESTION_COUNT=20
NEXT_PUBLIC_ENABLE_TIMER=true
NEXT_PUBLIC_TIMER_MINUTES=30
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
MAX_FILE_SIZE_MB=10
```

## Deployment Options

### Option 1: Vercel + External PostgreSQL

1. **Database:** Use [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app) for PostgreSQL.

2. **Deploy to Vercel:**

```bash
npm i -g vercel
vercel
```

3. **Set environment variables** in the Vercel dashboard.

4. **Run migrations** against production database:

```bash
DATABASE_URL="your-production-url" npx prisma db push
DATABASE_URL="your-production-url" npx tsx prisma/seed.ts
```

5. **Configure custom domain** in Vercel settings.

> Note: File uploads are stored in `public/uploads/`. For Vercel, use cloud storage (S3, Cloudinary) for persistent file storage, as serverless functions have ephemeral filesystems.

### Option 2: Docker + VPS

#### Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
EXPOSE 3000
CMD ["node", "server.js"]
```

Add to `next.config.ts` for standalone output:

```typescript
const nextConfig: NextConfig = {
  output: "standalone",
  // ... existing config
};
```

#### docker-compose.yml

```yaml
version: "3.8"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/english_test
      JWT_SECRET: ${JWT_SECRET}
      CSRF_SECRET: ${CSRF_SECRET}
      ADMIN_EMAIL: ${ADMIN_EMAIL}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD}
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - uploads:/app/public/uploads

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: english_test
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
  uploads:
```

Deploy:

```bash
docker compose up -d
docker compose exec app npx prisma db push
docker compose exec app npx tsx prisma/seed.ts
```

### Option 3: Railway (All-in-One)

1. Connect your GitHub repository to [Railway](https://railway.app).
2. Add a PostgreSQL service.
3. Set environment variables.
4. Railway auto-detects Next.js and deploys.

Build command: `npx prisma generate && npm run build`
Start command: `npm start`

## Reverse Proxy (Nginx)

```nginx
server {
    listen 443 ssl http2;
    server_name test.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/test.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/test.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    client_max_body_size 10M;
}
```

## Post-Deployment

1. Log in to admin panel and change default password
2. Upload downloadable file
3. Configure test settings
4. Run a test submission to verify end-to-end flow
5. Set up database backups
6. Monitor error logs

## Backup Strategy

```bash
# PostgreSQL backup
pg_dump -h localhost -U postgres english_test > backup_$(date +%Y%m%d).sql

# Restore
psql -h localhost -U postgres english_test < backup_20260620.sql
```

## Monitoring

- Monitor application logs for errors
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Monitor database connection pool usage
- Track rate limit hits in logs

## Scaling Considerations

- PostgreSQL connection pooling via PgBouncer for high traffic
- CDN for static assets
- Cloud storage for uploaded files (S3, GCS)
- Redis for rate limiting and CSRF tokens in multi-instance deployments
