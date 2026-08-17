# Adaptive needs intake

Use this reference for first-time setup, unconfirmed or incomplete profiles, requested direction changes, and repeated low-fit results.

## Conversation rules

- Ask at most three questions per round and skip facts already known.
- Start with decisions that change the search space most. Follow up only where the answer affects eligibility, ranking, or safety.
- Let the user say “不确定”. Record unknowns explicitly and help narrow them; never convert uncertainty into a hard preference.
- Label every criterion as `must`, `prefer`, or `explore`. A negative criterion is an exclusion only when the user confirms it.
- Explain any inferred transferable skill and ask the user to verify it.

## Phase 1: Define the search boundary

Establish:

1. Job types: internship, graduate/campus, full-time, part-time, contract, or exploratory career switch.
2. Locations and remote policy: required cities/regions, preferred cities, commute or relocation limits, onsite/hybrid/remote/flexible.
3. Timing: desired start, graduation or eligibility window when relevant, internship days per week and duration when relevant.

## Phase 2: Understand direction

Ask what the user wants to do, what they do not want, and what adjacent paths they would consider. Capture:

- `must`: roles the search must include.
- `prefer`: strong preferences that may be ranked below hard matches.
- `explore`: plausible transitions that need broader keyword coverage and an explanation.
- Preferred or excluded industries.
- Work-content exclusions such as pure cold calling, commission-only work, shift schedules, or travel limits.

If the user cannot name target roles, ask for projects, responsibilities they enjoyed, tools, domain knowledge, and evidence of strengths. Propose three to five role families only after that evidence is available. For each proposal, state the matching evidence and the main gap or tradeoff.

## Phase 3: Check feasibility

Collect only facts relevant to screening:

- Education level, field, and graduation window when listings use them as gates.
- Concise experience evidence and transferable skills; avoid employer-confidential information.
- Languages, certifications, portfolio/tool capability, and work authorization only when relevant.
- Availability and other hard constraints.

Do not ask for or store the user's name, contact details, ID number, full address, cookies, tokens, private social accounts, or full resume. If a resume is supplied, summarize only job-matching evidence into the local profile.

## Confirmation gate

Present one compact profile card before the first scan or a material revision:

- Search goal
- Job types
- Required/preferred locations and remote policy
- Must/prefer/explore role families with keywords and reasons
- Preferred/excluded industries
- Relevant background evidence
- Availability
- Hard constraints, softer preferences, and exclusions
- Open questions and assumptions

Ask for explicit confirmation. Until confirmed, keep `profileConfirmed: false`, do not run a scan, do not update scan history, and do not schedule the recurring task. After confirmation, set `lastConfirmed`, keep `trialStatus: not_run`, run `node scripts/validate-profile.mjs --allow-trial`, and proceed only if it passes.

## Trial gate

Run a small, diverse preview across confirmed `must`, `prefer`, and `explore` directions. Keep the preview in the private conversation; do not update dashboard JSON, GitHub, or scan history. Ask whether the scope is directionally correct, too broad, or too narrow.

- If approved, set `trialStatus: approved`, add `trialReviewedAt`, and run `node scripts/validate-profile.mjs`.
- If changes are requested, revise the smallest relevant fields, increment `profileVersion`, reset `profileConfirmed: false` and `trialStatus: not_run`, then reconfirm and repeat the trial.
- Never schedule an hourly task until the normal validator passes without `--allow-trial`.

## Recalibration

Return to intake mode when the user changes goals or repeatedly marks leads unsuitable for the same reason. Show the observed mismatch, propose the smallest profile change, and require confirmation plus a new trial. Do not silently rewrite preferences based on one rejected lead.
