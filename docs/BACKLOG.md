# Backlog

Priority order. Add the GitHub issue number to each item once it exists.

- [x] GA4 analytics + privacy page (`NEXT_PUBLIC_GA_ID`; events: `apply_click`, `job_view`, `newsletter_signup`)
- [x] Search Console: verify domain (DNS TXT) and submit sitemap (domain verified, sitemap submitted, homepage indexing requested; `NEXT_PUBLIC_SITE_URL` fixed to `https://pricedin.co`. Follow-up: confirm sitemap status turns to Success)
- [ ] Verify JobPosting structured data on every listing (code fixed: country/remote fields, no nulls, directApply=false, HTML description; still to do: run a live URL through Google's Rich Results Test; see expired-jobs issue below)
- [ ] Expire jobs automatically: all 17 live listings have `expiresAt` in March 2026 but are still shown as approved, which makes JobPosting `validThrough` dates stale
- [ ] Salary data pages from existing listings

## Ticket: Job import queue (Google Sheet links, review, publish)

**Problem:** Jobs are found manually (LinkedIn feed) and entering each one by hand or via Excel is slow, so inventory won't scale.

**Scope**
- Owner keeps a Google Sheet with a `link` column (employer/ATS apply URLs, not LinkedIn pages; no scraping of LinkedIn). Sheet is published as CSV.
- Admin page: "Import from sheet" button (sheet CSV URL in env var `JOB_IMPORT_SHEET_URL`) plus a paste-links box as fallback.
- No paid API. For each link the server fetches the page and reads its schema.org JobPosting data (title, company, location, salary, description). Category, seniority and region come from keyword rules and a country lookup (reuse `src/lib/job-posting.ts` location parsing). Salary only if explicitly stated.
- Fields that cannot be determined are left blank and flagged for review; nothing is guessed.
- Already imported links (matched on apply URL) and duplicates (company + title + location) are skipped, so the whole sheet can be re-imported safely.
- Results are saved with status `pending`; admin gets a review list with flags and bulk approve.
- Stores the source link in an existing field (no schema change) unless the owner approves a `source` column.

**Acceptance criteria**
- Importing a sheet of 10 links yields pending jobs, with a per-row reason for any that fail or are skipped.
- Re-running the import creates no duplicates.
- Nothing goes live without approval.
- No new recurring cost; no secrets in the repo.

**Out of scope:** LinkedIn scraping, Claude API classification (possible later fallback), auto-approval, direct ATS feeds and SerpAPI discovery.
