# Backlog

Priority order. Add the GitHub issue number to each item once it exists.

- [x] GA4 analytics + privacy page (`NEXT_PUBLIC_GA_ID`; events: `apply_click`, `job_view`, `newsletter_signup`)
- [x] Search Console: verify domain (DNS TXT) and submit sitemap (domain verified, sitemap submitted, homepage indexing requested; `NEXT_PUBLIC_SITE_URL` fixed to `https://pricedin.co`. Follow-up: confirm sitemap status turns to Success)
- [ ] Verify JobPosting structured data on every listing (code fixed: country/remote fields, no nulls, directApply=false, HTML description; still to do: run a live URL through Google's Rich Results Test; see expired-jobs issue below)
- [ ] Expire jobs automatically: all 17 live listings have `expiresAt` in March 2026 but are still shown as approved, which makes JobPosting `validThrough` dates stale
- [ ] Salary data pages from existing listings

## Ticket: Job import queue (paste links, review, publish)

**Problem:** Jobs are found manually (LinkedIn feed) and entering each one by hand or via Excel is slow, so inventory won't scale.

**Scope**
- Admin page: paste a batch of employer/ATS apply URLs (not LinkedIn pages; no scraping of LinkedIn).
- Server fetches each page and uses the Claude API to fill the existing job fields from `src/lib/constants.ts` enums; salary only if explicitly stated.
- Duplicate check (company + title + location, apply URL) and basic spam/off-topic flag.
- Results saved with status `pending` so the existing review flow applies; bulk approve in admin.
- Possible `source` column on `jobs` (needs owner approval: schema change).

**Acceptance criteria**
- Pasting 10 URLs yields pending jobs with a per-row error for any that fail.
- Duplicates and unreachable URLs are reported, not inserted.
- Nothing goes live without approval.
- Claude API key only in Vercel env vars; cost per job logged, well within the €50/month cap.

**Out of scope:** LinkedIn scraping, auto-approval, direct ATS feeds and SerpAPI discovery (later phases).
