# PricedIn — Pricing & Revenue Strategy Job Board

A niche job board for pricing, monetization, revenue strategy, and commercial strategy professionals.

## Features

- 🔍 **Smart Search & Filters** — Search by title, company, location with filters for category, seniority, location type, region, salary range, industry, and posting age
- 📝 **Easy Job Posting** — Simple form with preview before submission
- ✅ **Admin Moderation** — Protected admin dashboard to approve/reject jobs
- 📊 **Analytics** — Track views and apply clicks per job
- 📧 **Newsletter** — Email capture for job alerts
- 🔎 **SEO Optimized** — Sitemap, robots.txt, JSON-LD structured data, Open Graph

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: SQLite + Drizzle ORM
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **Deployment**: Vercel (recommended)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
ADMIN_PASSWORD=your-secure-password-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Initialize Database

```bash
npm run db:seed
```

This creates the SQLite database and seeds it with 10 sample jobs.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Key URLs

| URL | Description |
|-----|-------------|
| `/` | Homepage with featured jobs |
| `/jobs` | Job listings with filters |
| `/jobs/[slug]` | Job detail page |
| `/post-job` | Post a new job |
| `/admin` | Admin dashboard (password protected) |

## Admin Access

1. Navigate to `/admin`
2. Enter the password from `ADMIN_PASSWORD` env var (default: `pricedin-admin-2024`)
3. Approve/reject pending jobs
4. Feature jobs to highlight them
5. View analytics (views & clicks)

## Deployment to Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables:
   - `ADMIN_PASSWORD` — your secure admin password
   - `NEXT_PUBLIC_SITE_URL` — your production URL (e.g., https://pricedin.vercel.app)
4. Deploy

**Note:** For production with persistent data, consider using Turso (SQLite edge), PlanetScale, or Neon.

## License

MIT
