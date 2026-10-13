# Backlog

Priority order. Add the GitHub issue number to each item once it exists.

- [x] GA4 analytics + privacy page (`NEXT_PUBLIC_GA_ID`; events: `apply_click`, `job_view`, `newsletter_signup`)
- [x] Search Console: verify domain (DNS TXT) and submit sitemap (domain verified, sitemap submitted, homepage indexing requested; `NEXT_PUBLIC_SITE_URL` fixed to `https://pricedin.co`. Follow-up: confirm sitemap status turns to Success)
- [ ] Verify JobPosting structured data on every listing (code fixed: country/remote fields, no nulls, directApply=false, HTML description; still to do: run a live URL through Google's Rich Results Test; see expired-jobs issue below)
- [ ] Expire jobs automatically: all 17 live listings have `expiresAt` in March 2026 but are still shown as approved, which makes JobPosting `validThrough` dates stale
- [ ] Salary data pages from existing listings
