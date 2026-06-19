# English Test Platform

A modern, professional English proficiency testing platform with a premium dark-themed UI, comprehensive admin dashboard, and secure backend.

## Features

- **Landing Page** — Modern hero section with glassmorphism and gradient effects
- **English Test System** — Multiple-choice questions (20–100), progress bar, timer, auto-scoring
- **Student Information** — Collects name and optional student ID before test
- **Score Submission** — Saves results to PostgreSQL with IP address tracking
- **Automatic File Download** — Configurable post-submission file download
- **Admin Dashboard** — Secure panel with statistics, charts, search, sort, filter, export
- **Question Management** — Add, edit, delete, and CSV import questions
- **Security** — JWT auth, bcrypt hashing, rate limiting, CSRF protection, input validation

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS 4, Framer Motion |
| Backend | Next.js API Routes |
| Database | PostgreSQL with Prisma ORM |
| Auth | JWT (jose) + bcrypt |
| Charts | Recharts |

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Installation

```bash
# 1. Clone and install
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your database URL and secrets

# 3. Start PostgreSQL (Docker) and set up database
docker compose up -d db
npm run db:setup
npm run db:seed

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the test platform.
Open [http://localhost:3000/admin/login](http://localhost:3000/admin/login) for the admin panel.

### Default Admin Credentials

- **Username:** admin
- **Password:** Admin@123456

> Change these immediately in production. See [Admin Setup Guide](docs/ADMIN_SETUP.md).

## Documentation

- [Installation Guide](docs/INSTALLATION.md)
- [Admin Setup Guide](docs/ADMIN_SETUP.md)
- [API Documentation](docs/API.md)
- [Railway Deployment](docs/RAILWAY.md)
- [Database Schema](docs/DATABASE.md)

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── test/                 # Student info & test taking
│   ├── results/              # Score display page
│   ├── admin/                # Admin dashboard pages
│   └── api/                  # API routes
├── components/ui/            # Reusable UI components
├── lib/                      # Utilities, auth, validation
└── middleware.ts             # Route protection
prisma/
├── schema.prisma             # Database schema
└── seed.ts                   # Sample data seeder
docs/                         # Documentation
public/uploads/               # Downloadable files storage
```

## Deployment

- **[Railway (recommended)](docs/RAILWAY.md)** — step-by-step guide for railway.com
- [General deployment guide](docs/DEPLOYMENT.md)

## License

Private — All rights reserved.
