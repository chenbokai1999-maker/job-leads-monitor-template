---
name: monitor-internship-leads
description: Monitor public, indexable internship and early-career job leads against a local candidate configuration, classify source trust, deduplicate results, update a static JSON-backed dashboard, and validate scan history. Use when Codex needs to create, run, repair, or review a recurring public-job-lead monitor or its GitHub Pages dashboard.
---

# Monitor Internship Leads

Maintain a static internship-lead dashboard while keeping personal criteria local and enforcing conservative source verification.

## Resolve the project

1. Locate the project root containing `docs/data/leads.json`, `docs/data/scan-history.json`, and `scripts/validate-data.mjs`.
2. Read `config/candidate.local.yml`. If it is missing, stop and ask the user to copy `config/candidate.example.yml`; never infer personal details from usernames, Git history, or unrelated files.
3. Treat `candidate.local.yml` as private. Confirm it is ignored by Git before any publish action.
4. Read [references/data-schema.md](references/data-schema.md) before changing JSON.

## Scan public sources

- Search only pages available without login: public company posts, indexed social/community posts, public job pages, and public recruiting articles.
- Do not bypass login, CAPTCHA, paywalls, robots, rate limits, or anti-automation controls.
- Record restricted pages only as `需人工打开`; do not claim to have verified unseen text.
- Do not message, apply, add contacts, pay fees, or act as the candidate.
- Do not store personal recruiter phone numbers, private social handles, QR codes, cookies, tokens, or full copied job descriptions.

## Classify and select

- Assign `A` only when the publishing identity or company-controlled application path is independently verifiable and currently open.
- Assign `B` only when company/team, city, duties, attendance requirements, date, and source URL are complete; state the unresolved publishing or process risk.
- Reject anything below B, including fee-based referrals, deposits, guaranteed offers, unnamed employers or locations, abnormal compensation, unknown short links, bulk reposting, or missing formal process.
- Apply the local candidate criteria after trust screening. Do not loosen requirements to fill the dashboard.

## Update data

1. Preserve existing entries. Mark unavailable posts `closed` or `needs_recheck` and add the reason instead of deleting history.
2. Deduplicate normalized URLs and normalized `company + title + city` keys.
3. Update only `docs/data/leads.json` and `docs/data/scan-history.json` unless the user explicitly requests a layout change.
4. Add one history record per run. Keep at most 30 records and require `scanned = accepted + filtered`.
5. When no lead qualifies, write `本轮无新增可信社媒线索`.

## Validate and publish

Run from the project root:

```bash
node scripts/validate-data.mjs
```

Fix validation failures before finishing. Commit or push only when the user has authorized GitHub writes and the configured remote is unambiguous. Never store credentials in the repository. Explain that GitHub Pages displays pushed data but does not perform the scan; local scheduled tasks require the computer and desktop app to remain available.

