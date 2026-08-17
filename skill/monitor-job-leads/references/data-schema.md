# Data schema

## `docs/data/leads.json`

The root is an array. Every lead requires:

```json
{
  "id": "platform-company-role-stable-id",
  "trust": "A",
  "trustReason": "Why the publishing identity and application path are verifiable.",
  "company": "Company name",
  "title": "Role title",
  "jobType": "Internship, graduate, full-time, part-time, contract, or another confirmed type",
  "roleFamily": "A confirmed must, prefer, or explore role family",
  "city": "City or remote region",
  "platform": "Source platform",
  "date": "YYYY-MM-DD or a clearly labelled approximate date",
  "checked": "YYYY-MM-DD",
  "summary": "Concise job-centric paraphrase of duties and requirements.",
  "risks": ["Items the candidate must verify"],
  "url": "https://original-public-source.example/job",
  "status": "open"
}
```

Allowed values:

- `trust`: `A`, `B`
- `status`: `open`, `needs_recheck`, `closed`

Use stable IDs. Do not derive IDs from private contact information. Normalize URL fragments and trailing slashes for comparison. Also reject duplicate normalized `company + title + city` combinations.

`jobType` and `roleFamily` support public dashboard filtering. They may reflect the user's confirmed search categories, but must not reveal private background, constraints, or personalized matching rationale.

## `docs/data/scan-history.json`

```json
{
  "scanMeta": {
    "lastChecked": "YYYY-MM-DD HH:mm",
    "filteredTotal": 0,
    "note": "Short latest-run summary"
  },
  "history": [
    {
      "time": "YYYY-MM-DD HH:mm",
      "scanned": 0,
      "accepted": 0,
      "filtered": 0,
      "note": "Short run summary"
    }
  ]
}
```

Keep only the latest 30 history items. Counts must be non-negative integers, and every entry must satisfy `scanned = accepted + filtered`.

## Privacy boundary

Repository data may contain public company/role facts and original public URLs. Keep candidate profiles, names, personal contact details, complete resumes, browser application status, cookies, tokens, and private recruiter contact data out of version control.
