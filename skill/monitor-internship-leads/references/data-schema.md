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
  "city": "City",
  "platform": "Source platform",
  "date": "YYYY-MM-DD or a clearly labelled approximate date",
  "checked": "YYYY-MM-DD",
  "summary": "Concise paraphrase of duties and requirements.",
  "risks": ["Items the candidate must verify"],
  "url": "https://original-public-source.example/job",
  "status": "open"
}
```

Allowed values:

- `trust`: `A`, `B`
- `status`: `open`, `needs_recheck`, `closed`

Use stable IDs. Do not derive IDs from private contact information. Normalize URL fragments and trailing slashes for comparison. Also reject duplicate normalized `company + title + city` combinations.

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

Repository data may contain public company/role facts and original public URLs. Keep names of candidates, personal contact details, complete resumes, browser application status, cookies, tokens, and private recruiter contact data out of version control.
