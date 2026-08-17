---
name: monitor-job-leads
description: Understand and confirm an individual user's job-search needs through adaptive intake, keep the resulting non-sensitive profile local, then monitor public indexable internship, graduate, full-time, part-time, or exploratory job leads; classify source trust, deduplicate results, update a static JSON-backed dashboard, and recalibrate when results are repeatedly irrelevant. Use when Codex needs to set up, run, repair, review, or retune a personalized public-job-lead monitor or its GitHub Pages dashboard.
---

# Monitor Job Leads

Understand the user before searching. Separate source trust from candidate fit, keep personal criteria local, and never reuse another person's profile.

## Resolve the project and mode

1. Locate the project root containing `docs/data/leads.json`, `docs/data/scan-history.json`, and `scripts/validate-data.mjs`.
2. Use `config/candidate.local.json` as the private profile. Confirm it is ignored by Git before writing or publishing.
3. Enter **intake mode** when the profile is missing, unconfirmed, incomplete, the user asks to change direction, or repeated results are irrelevant. Read [references/intake.md](references/intake.md) completely.
4. Enter **trial mode** after profile confirmation and `node scripts/validate-profile.mjs --allow-trial` succeeds. Preview a small, diverse sample without publishing it.
5. Enter **scheduled scan mode** only after the user approves the trial and `node scripts/validate-profile.mjs` succeeds.
6. Read [references/data-schema.md](references/data-schema.md) before changing dashboard JSON.

## Build and confirm the profile

- Ask no more than three concise questions per round. Reuse information already given in the conversation; do not make the user repeat it.
- Distinguish hard constraints, preferences, and exploratory directions. Preserve uncertainty as an open question instead of guessing.
- If the user is unsure about roles, first elicit non-sensitive background evidence, then propose three to five plausible role families with a short rationale and tradeoff for each. Ask the user to rank, reject, or keep them exploratory.
- Never infer criteria from usernames, Git history, another candidate's data, or unrelated files.
- Do not request or store names, phone numbers, email addresses, ID numbers, home addresses, cookies, tokens, private social handles, or a complete resume. If the user provides a resume, extract only relevant screening criteria and evidence into the local profile; do not copy the resume into the repository.
- Create `config/candidate.local.json` from `config/candidate.example.json`. Show a concise confirmation card covering job types, locations/remote policy, target/preferred/exploratory roles, background evidence, availability, hard constraints, exclusions, and open questions.
- Set `profileConfirmed` to `true` and add `lastConfirmed` only after explicit user confirmation. Set `trialStatus` to `not_run`, run `node scripts/validate-profile.mjs --allow-trial`, and preview a small sample across must/prefer/explore directions.
- Ask whether the sample is directionally correct, too broad, or too narrow. Do not update the public dashboard or schedule recurring scans during the trial. Set `trialStatus` to `approved` and add `trialReviewedAt` only after approval; otherwise revise, reconfirm, and repeat the trial.

## Scan public sources

- Apply the confirmed job types, locations, role priorities, industries, background, availability, constraints, exclusions, date window, and trust levels.
- Search only pages available without login: public company posts, indexed social/community posts, public job pages, and public recruiting articles.
- Do not bypass login, CAPTCHA, paywalls, robots, rate limits, or anti-automation controls.
- Record restricted pages only as `需人工打开`; do not claim to have verified unseen text.
- Do not message, apply, add contacts, pay fees, or act as the candidate.
- Do not store personal recruiter phone numbers, private social handles, QR codes, cookies, tokens, or full copied job descriptions.

## Classify source trust and candidate fit

- Assign `A` only when the publishing identity or company-controlled application path is independently verifiable and currently open.
- Assign `B` only when company/team, location, duties, applicable work or attendance requirements, date, and source URL are complete; state the unresolved publishing or process risk.
- Reject anything below B, including fee-based referrals, deposits, guaranteed offers, unnamed employers or locations, abnormal compensation, unknown short links, bulk reposting, or missing formal process.
- Apply hard constraints after trust screening. Rank preferred roles ahead of exploratory roles. Explain fit privately in the run report, but keep candidate background and personalized matching rationale out of public dashboard JSON.
- Never loosen requirements to fill the dashboard. Do not silently change the profile during a scheduled run.

## Update data

1. Preserve existing entries. Mark unavailable posts `closed` or `needs_recheck` and add the reason instead of deleting history.
2. Deduplicate normalized URLs and normalized `company + title + city` keys.
3. Update only `docs/data/leads.json` and `docs/data/scan-history.json` unless the user explicitly requests a layout change.
4. Add one history record per run. Keep at most 30 records and require `scanned = accepted + filtered`.
5. When no lead qualifies, write `本轮无新增可信岗位线索`.
6. If the user rejects several leads for the same fit reason, summarize the pattern and offer intake-mode recalibration. Keep the current confirmed profile until the user approves a revision.

## Validate and publish

Run from the project root:

```bash
node scripts/validate-profile.mjs
node scripts/validate-data.mjs
```

Fix validation failures before finishing. Commit or push only when the user has authorized GitHub writes and the configured remote is unambiguous. Never store credentials in the repository. Explain that GitHub Pages displays pushed data but does not perform the scan; local scheduled tasks require the computer and desktop app to remain available.
