# Ecosystem Routing Map v1.0

**Hip-Hop Peoples / HHHI / GGHP / Krafty Academy — Evidence, Governance, and Transparency**

**Maintained by:** Hip-Hop Peoples DAO LLC  
**Last updated:** 2026-02-07

---

## Purpose

We operate multiple programs and entities across behavioral health, workforce, media, and community economic development.  
To protect participants, maintain compliance, and preserve mission integrity, we route information into the correct "layer" by default.

### Golden Rule

> If it touches **money, eligibility, policy, safety incidents, or compliance evidence** — it goes to **GitLab first**.  
> Public systems show summaries and patterns, not participant data.

---

## The 5-Layer Stack

### 1) GitLab (Private) — System of Record 🔒

**Used for:** operations, compliance trails, audit defense, internal governance records.

**Contains (examples):**

- `rd-evidence-ledger` — R&D documentation: issues, experiments, ledger CSVs, schemas, evidence index.
- `freedom-notes-ledger` — Freedom Notes allocations, internal identifiers, full policies and enforcement notes.
- `field-log` / `crisis-capture` — Phone-first disruption / incident / case / event captures.

**Never in GitHub / public:**

- Participant names or IDs linked to personal data
- Freedom Notes balances per person
- Disputes, case details, detailed incident evidence
- Internal controls and enforcement procedures

---

### 2) GitHub (Public) — Education & Transparency Window 🌍

**Used for:** public trust, recruitment, partner clarity, open templates.

**Contains (examples):**

- Public READMEs that describe the architecture at a high level
- Redacted templates and "how-to" guides
- Sanitized tooling and demo examples
- Public policy summaries (e.g., `docs/freedom-notes-overview.md`)

**Rule:** GitHub holds **patterns, not records**. No live ledgers, no case details.

---

### 3) hiphoppeoples.com — Front Door (Programs & Participation) 🚪

**Used for:** public-facing program navigation and onboarding.

**Contains:**

- "Get Support" (HHHI)
- "Build Skills" (Krafty Academy)
- "Create & Earn" (studio, vendors, talent pathways)
- "Tech & Transparency" page linking to GitHub public repos and hiphoppeoples.dao governance portal

**Rule:** The website explains what we do and how to engage, **not** internal operations or case histories.

---

### 4) hiphoppeoples.dao — Governance Surface 🧭

**Used for:** ecosystem-wide governance visibility.

**Contains:**

- "How Governance Works"
- "What Freedom Notes Are / Are Not" (public summary)
- Proposals, decisions, and committee roles (at a summary level)
- "Evidence Policy: hashes only, never names" (if using chain anchors)

**Rule:** Decisions that affect the ecosystem are visible here, even when underlying evidence remains protected in GitLab.

---

### 5) Chain (Optional) — Proof Only ⛓️

**Used for:** proving "this policy / ledger schema / snapshot existed at this time".

**Contains:**

- Quarterly hashes of schema versions, policy baselines, and ledger export fingerprints (no PII/PHI)

**Never on-chain:** Names, participant records, case notes, addresses, photos, health or court details.

---

## Daily Operating Workflow

### Step 1 — Field Capture (Staff, Phone-First) 📱

Staff create a GitLab issue in `field-log` / `crisis-capture` using a template:

- What happened (1–3 sentences)
- When / where / program
- Roles (or initials), not full names if unsafe
- Attachments (photo / video / screenshot)

No classification required in the field.

---

### Step 2 — Weekly Steward Pass (System Steward) 🧰

The System Steward:

- Tags the issue with a business component code (from Business Components Map) and lane (R&D / operational / community / contractor)
- Creates ledger entries: R&D entry → `rd-evidence-ledger`, Freedom Notes entry → `freedom-notes-ledger`, or both if needed

---

### Step 3 — Monthly Close (Finance & Compliance) 📊

- Validate ledgers against finance and program records
- Generate exports for accounting / CPA
- Optionally anchor quarterly hash on-chain (proof only)

---

## Routing Rules (At a Glance)

| Destination | What Goes There |
|---|---|
| **GitLab (private)** | Incidents, disruptions, crises, court-related disruptions; eligibility decisions; Freedom Notes balances / allocations / enforcement; internal policies and manuals; R&D experiments, uncertainties, ADRs, time allocations; evidence files (photos, screenshots, logs) |
| **GitHub (public)** | Sanitized templates; architecture explainers; public "Freedom Notes Overview"; toolkits and educational materials; public repo code with no participant data |
| **hiphoppeoples.com** | Program descriptions; onboarding flows; partner-facing transparency page (links only) |
| **hiphoppeoples.dao** | Governance rules summary; committee roles and processes; proposals + vote outcomes (summary level); public evidence policy (hash-only) |
| **On-chain (optional)** | Hashes of quarterly snapshots (schemas, manual versions, export fingerprints) — never raw records |

---

## Roles (Who Touches What)

- **Field Staff** – capture issues only (no complex classification)
- **System Steward** – classification, ledger entries, evidence linking
- **Finance / Compliance** – monthly close, exports, sponsor separation checks
- **DAO Governance** – proposals and decisions published on hiphoppeoples.dao

---

## Safety & Privacy Defaults

- Use initials / roles instead of full names in field issues where needed
- No PHI/PII in GitHub or other public systems
- Evidence is stored in private GitLab and referenced by ID
- Public systems show structures and patterns only

---

## Canonical References

- Business Components Map: `rd-evidence-ledger/docs/business_components.md`
- Crisis Capture Template: `field-log/.gitlab/issue_templates/Crisis_Disruption.md`
- Freedom Notes Manual (full): `freedom-notes-ledger/policies/FN-Manual_v1.0.md`
- Freedom Notes Overview (public): [`docs/freedom-notes-overview.md`](freedom-notes-overview.md) and hiphoppeoples.com / hiphoppeoples.dao

---

## Two Habits That Make This Work

1. **Capture first, classify later** — no one waits for the perfect form to log reality.
2. **Monthly close is non-negotiable** — if it isn't closed, it isn't real.
