# PricedIn

Niche job board for pricing, monetization, revenue strategy and commercial strategy professionals. Live at pricedin.co (Vercel, auto-deploys `main` to Production). Owner runs commercial/operational work separately; this repo is the website.

## Stack

- Next.js 14 (App Router, TypeScript), React 18, Tailwind 3 (+ typography plugin), Geist font
- Database: **Turso (libSQL)** via Drizzle ORM (`@libsql/client`). Not local SQLite — the README is outdated on this.
- Validation: Zod. Excel bulk upload: `xlsx`.
- Path alias: `@/` → `src/`

## Commands

```bash
npm install
npm run dev          # local dev server on :3000
npm run typecheck    # tsc --noEmit
npm test             # unit tests (node:test via tsx), src/**/*.test.ts
npm run build        # must pass before opening a PR
npm run db:push      # push schema to the Turso DB in .env.local
npm run db:seed      # seed sample jobs (WRITES to the DB in .env.local)
```

CI (.github/workflows/ci.yml) runs typecheck, tests and build on every PR and on pushes to main, with throwaway env values. `npm run lint` is not configured (it prompts for ESLint setup), so do not rely on it. Add a `*.test.ts` next to the code for any bug fix or pure-logic change; also load affected pages in the browser.

## Environment

`.env.local` (gitignored; template in `.env.example`): `ADMIN_PASSWORD`, `NEXT_PUBLIC_SITE_URL`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`.
**Assume `.env.local` may point at the production Turso database.** Never run `db:push`, `db:seed`, `db:migrate`, or any destructive query without asking first. Never print or commit secrets.

## Layout

```
src/app/                     pages + route handlers
  page.tsx                   homepage (featured jobs)
  jobs/page.tsx              listing + filters (query params, force-dynamic)
  jobs/[slug]/page.tsx       job detail (+ JSON-LD)
  post-job/                  public submission form -> status 'pending'
  admin/page.tsx             single-file admin dashboard (client component)
  api/jobs                   public job submission (rate limited)
  api/admin/{auth,jobs,jobs/upload,jobs/template}   cookie-protected admin APIs
  api/analytics/{view,click} counters
  api/newsletter             subscriber capture
  sitemap.ts, robots.ts      SEO
src/components/              Header, Footer, JobCard, JobFilters, Modal, JobDetailModal, ...
src/lib/constants.ts         single source for categories, seniority, regions, currencies, etc.
src/lib/validations.ts       Zod schemas (job form, newsletter)
src/lib/db/schema.ts         Drizzle schema: `jobs`, `subscribers`
src/lib/utils.ts             slug, salary/date formatting, sanitizeHtml, cn
```

Design tokens live in `tailwind.config.ts`: `brand-*` (neutral slate) and `accent-*` (Stripe-style purple, `accent-500` is the primary CTA). Reuse these; don't introduce new colours.

## Conventions

- Enum-like values (category, seniority, region, location type, currency) are defined in `src/lib/constants.ts` **and** duplicated as enums in `src/lib/db/schema.ts`. Change both together, plus any form/filter that lists them.
- New user input goes through a Zod schema in `src/lib/validations.ts`; reuse `jobFormSchema` for anything that creates jobs.
- Job lifecycle: `pending` → `approved` | `rejected` → `expired` (30 days after approval, see `getExpirationDate`). Public pages only show `approved`.
- Admin routes check the `admin_auth` cookie; every new admin route must do the same.
- Match the existing style: 2-space indent, no semicolons, single quotes, Tailwind utility classes inline.

## Workflow

1. Work on a branch `feat/…`, `fix/…` or `chore/…`; never commit directly to `main` (a push to `main` deploys to production).
2. Small, focused commits with descriptive messages (what and why), not "Update X".
3. Before opening a PR: `npm run typecheck`, `npm test` and `npm run build` pass, and the change was checked in the browser. Wait for the CI check to be green before merging.
4. Open a PR with `gh pr create`; Vercel posts a preview URL. The owner reviews and merges.
5. For changes touching the DB schema, auth, or more than ~3 files, outline the plan and get approval before coding.
6. Tasks come from GitHub Issues (`gh issue list`). Reference the issue in the PR (`Closes #n`).

## Known issues

Tracked as GitHub Issues; see `gh issue list`. Do not "fix on the way" unrelated items — raise or reference the issue instead.
