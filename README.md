# PricedIn — Pricing & Revenue Strategy Job Board

A niche job board for pricing, monetization, revenue strategy, and commercial strategy professionals. Live at [pricedin.co](https://pricedin.co).

## Features

- **Search & filters** — title/company/keyword search; filters for category, seniority, location type, region, salary range, industry and posting age
- **Job posting** — public form with preview; submissions wait for moderation
- **Admin dashboard** — approve/reject/feature/expire jobs, add jobs manually, bulk upload from Excel
- **Analytics** — views and apply clicks per job
- **Newsletter** — email capture for job alerts
- **SEO** — sitemap, robots.txt, JSON-LD `JobPosting` structured data, Open Graph
- **Abuse protection** — database-backed rate limits on submissions, newsletter signup and admin login

## Tech stack

- **Framework:** Next.js 15 (App Router) + React 19, TypeScript
- **Database:** [Turso](https://turso.tech) (libSQL/SQLite) via Drizzle ORM
- **Styling:** Tailwind CSS 3
- **Validation:** Zod
- **Hosting:** Vercel (pushes to `main` deploy to production)

## Local development

### 1. Install

```bash
npm install
```

### 2. Environment

```bash
cp .env.example .env.local
```

| Variable | Required | Purpose |
|---|---|---|
| `TURSO_DATABASE_URL` | yes | Database URL. Use a local file for development, e.g. `file:./local.db` |
| `TURSO_AUTH_TOKEN` | for remote Turso | Auth token for a hosted Turso database (not needed for `file:` URLs) |
| `ADMIN_PASSWORD` | yes | Password for `/admin`. There is no default; choose a strong one |
| `ADMIN_SESSION_SECRET` | no | Key used to sign admin session cookies (falls back to `ADMIN_PASSWORD`) |
| `NEXT_PUBLIC_SITE_URL` | yes | Public site URL, used for the sitemap, canonical/OG URLs. `http://localhost:3000` locally, `https://pricedin.co` in production |

> **Careful:** a hosted `TURSO_DATABASE_URL` in `.env.local` means the commands below act on that database. Prefer `file:./local.db` for development.

### 3. Create the schema and seed sample data

```bash
npm run db:push    # creates/updates tables from src/lib/db/schema.ts
npm run db:seed    # inserts 10 sample jobs
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Unit tests (Node's test runner via `tsx`) |
| `npm run db:push` | Sync the schema to the database in `TURSO_DATABASE_URL` |
| `npm run db:seed` | Seed sample jobs |

CI (`.github/workflows/ci.yml`) runs typecheck, tests and build on every pull request and on pushes to `main`.

## Key URLs

| URL | Description |
|---|---|
| `/` | Homepage with featured jobs |
| `/jobs` | Listings with filters |
| `/jobs/[slug]` | Job detail page |
| `/post-job` | Submit a job |
| `/admin` | Admin dashboard (password protected) |
| `/sitemap.xml`, `/robots.txt` | SEO |

## Admin

1. Go to `/admin` and sign in with `ADMIN_PASSWORD`.
2. Review pending jobs: approve, reject, feature or expire them.
3. **Bulk upload:** download the `.xlsx` template from the dashboard, fill it in and upload it. Only `.xlsx` files are accepted (max 2 MB, 500 rows); uploaded jobs are approved immediately and invalid rows are reported with their spreadsheet row number.
4. After 5 failed sign-ins from one IP address, login is blocked for 15 minutes.

## Deployment (Vercel)

1. Import the GitHub repository into Vercel.
2. Set the environment variables above for **Production** (and Preview if you want preview deploys to work). `NEXT_PUBLIC_SITE_URL` must be the public domain (`https://pricedin.co`) and is read at build time, so redeploy after changing it.
3. Push to `main` to deploy. Work happens on branches and pull requests; Vercel builds a preview for each.

The rate-limit table (`rate_limits`) is created automatically on first use; no manual migration is needed.

## Project notes for contributors

See [CLAUDE.md](CLAUDE.md) for architecture, conventions and the development workflow.

## License

MIT
