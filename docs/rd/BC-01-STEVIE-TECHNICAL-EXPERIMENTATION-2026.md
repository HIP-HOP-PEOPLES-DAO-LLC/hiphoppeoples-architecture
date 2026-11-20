# BC-01 — STEVIE Technical Experimentation Log (2026)

**Business component ID:** BC-01-STEVIE  
**Title:** Stevie Web Kit merchant intake + Emerald City deterministic XP engine  
**Document status:** Contemporaneous engineering evidence for IRC §41 *analysis* — **not** a claim that a credit or §174A deduction has been approved.  
**Taxpayer attribution (working label only):** Mid-Atlantic Enterprises / Hip Hop Peoples DAO LLC / Greater Good Enterprise — **ownership and controlled-group membership remain unresolved pending source records** (see evidence-request matrix).  
**Repository:** `HIP-HOP-PEOPLES-DAO-LLC/hiphoppeoples-architecture`  
**Branch:** `cursor/stevie-web-router-001-sprint1-1812`  
**Package:** `packages/stevie-web-kit`

## Financial / payroll gates preserved (do not activate)

| Control | Status |
|---|---|
| 2021 MAE Form 1065 gross receipts (reported figure in directive) | $1,116,000 — **source transcript not attached in this repo** |
| 2026–2027 §41(h) QSB payroll eligibility | **Unresolved** |
| Form 8974 usable offset | **$0** |
| Payroll activation | **HOLD** |
| Ordinary §41 research credit | Separate evidence track |
| §174A treatment | Requires separate classification — **not asserted here** |
| Controlled-group membership | Must be determined from actual ownership/attribution records |

**Do not** automatically classify developer wages, API spending, cloud fees, or contractors as qualified research expenditures based on this document alone.

---

## Experiment E1 — Repository placement & reusable kit boundary

| Field | Content |
|---|---|
| Date (America/New_York) | 2026-11-20 |
| Technical uncertainty at start | Whether STEVIE Web Kit / Emerald City XP already existed as implementable code in this workspace vs architecture-only docs; which remote repo is canonical for ChatKit intake vs GGE static forms vs Dynasty `stevie_core`. |
| Hypothesis | `main` of hiphoppeoples-architecture is docs-only; live intake is on GGE + Supabase RPCs; Sprint 1 should add an isolated package rather than overwrite GGE. |
| Alternatives considered | (A) Implement inside `affishaul/greatergoodenterprise`; (B) Extend `suretytech` StevieChat; (C) New package in architecture repo; (D) Write directly to production Supabase. |
| Selected alternative | (C) — smallest safe slice without overwriting apps or applying production migrations. |
| Work performed | Repo audit; package scaffold; conversation + game layers; candidate SQL; local tests. |
| Measured outcome | Audit recorded; package created; tests executed locally (see E3). Production DB unchanged. |
| Failures | Live schema re-verification impossible (no DB credentials). Portal / dedicated STEVIE ChatKit service repos not located under exact names. |
| Commit hash | `8e799f1d6f8555f901b666c9ede1a6cedc62e330` |
| Local test summary (E3 shared) | 19/19 PASS via `npm run test:report` on 2026-11-20; artifact `artifacts/test-runs/stevie-web-kit-sprint1.txt`. |

---

## Experiment E2 — Deterministic XP vs LLM-awarded XP

| Field | Content |
|---|---|
| Date (America/New_York) | 2026-11-20 |
| Technical uncertainty at start | Whether quest completion and XP can be awarded safely if any LLM path proposes amounts; how to enforce append-only + idempotency without colliding with `quest_merchants` / `quest_merchant_intake`. |
| Hypothesis | XP must come only from server quest definitions after verified proof; client amounts/player IDs rejected; new `emerald` schema avoids name collisions. |
| Alternatives considered | (A) LLM tool `award_xp` with model-chosen amounts; (B) Client posts XP to table with RLS only; (C) SECURITY DEFINER `award_xp` reading reward from `quest_definitions` + idempotency unique constraint. |
| Selected alternative | (C) + local `XpEngine` mirror. |
| Work performed | `src/game/xp-engine.js`; migration `20261120_stevie_web_router_001_sprint1.sql` (+ down). |
| Measured outcome | Local tests: replay, concurrent idempotency, unauthorized write, append-only, cross-tenant rejection — **PASS** (see test artifact). |
| Failures | SQL not executed against Supabase (credentials unavailable / production apply forbidden). |
| Commit hash | `8e799f1d6f8555f901b666c9ede1a6cedc62e330` |
| Local test summary | XP suite PASS (replay, concurrent idempotency, unauthorized write, append-only, cross-tenant, cash-redeemable refusal). |

---

## Experiment E3 — Merchant intake gates (consent, SoR, approval, FAQ)

| Field | Content |
|---|---|
| Date (America/New_York) | 2026-11-20 |
| Technical uncertainty at start | Whether conversational intake can enforce consent + Seller-of-Record acknowledgment + human approval before any transmission while retaining Jotform fallback and session usage caps without live ChatKit credentials. |
| Hypothesis | A deterministic orchestrator can validate the Sprint 1 control surface; live Agents SDK/ChatKit is a later wiring step. |
| Alternatives considered | (A) Wait for OpenAI credentials before any code; (B) Deterministic orchestrator + schema/FAQ now; (C) Only document controls. |
| Selected alternative | (B). |
| Commands run | See § Test commands. |
| Measured outcome | Ten synthetic intakes; duplicate idempotency; cross-tenant isolation; consent/SoR rejection; FAQ routing; usage/cost estimate — **PASS** locally. |
| Failures / not run | Live ChatKit session; live Jotform write; live `quest_submit_intake` call (intentionally not transmitted). |

---

## Test commands and dates

**Environment:** Cursor cloud agent VM, Node `v22.23.4`, America/New_York calendar date **2026-11-20**.

```bash
cd packages/stevie-web-kit
npm test
# evidence capture:
npm run test:report
```

**Artifact path:** `artifacts/test-runs/stevie-web-kit-sprint1.txt` (created when report script runs).

### Result classification

| Suite | Result | Evidence |
|---|---|---|
| Ten synthetic merchant intakes | PASS (local) | `tests/merchant-intake.test.js` |
| Duplicate intake | PASS (local) | same |
| Cross-tenant isolation | PASS (local) | same |
| Consent rejection | PASS (local) | same |
| Seller-of-Record acknowledgment | PASS (local) | same |
| Static FAQ routing | PASS (local) | same |
| Token/cost estimate per intake | PASS (local synthetic rates) | same |
| XP replay / concurrent award | PASS (local) | `tests/xp-engine.test.js` |
| Unauthorized direct write | PASS (local) | same |
| Append-only ledger | PASS (local) | same |
| Apply migration to production Supabase | **NOT RUN** | No credentials; forbidden by directive |
| Live ChatKit/Agents SDK intake | **NOT RUN** | No `OPENAI_API_KEY` |
| Live unauthorized Postgres write against hosted DB | **NOT RUN** | No DB URL |

---

## Developer work dates / time records

| Date (America/New_York) | Actor | Activity | Duration record |
|---|---|---|---|
| 2026-11-20 | Cursor cloud agent (unattended) | Discovery, implementation, tests, evidence docs | Agent wall-clock for this run — **not a wage QRE**. Do not treat as employee hours without payroll/timekeeping source. |

Human developer wage hours, contractor invoices, and API invoices are **not recorded here** and must come from restricted finance systems.

---

## Funding, ownership, and IP questions (open)

1. Which legal entity owns STEVIE Web Kit IP and bears economic risk of the research?
2. Is Greater Good Enterprise, Hip Hop Peoples DAO LLC, Mid-Atlantic Enterprises, or another party the contracting Seller-of-Record for Holiday Quest pilots? (Prior staging notes flagged bank/seller mapping conflict — **HOLD**.)
3. Are any costs funded by grants or reimbursements that would require exclusion / double-counting review?
4. Controlled-group aggregation for gross-receipts tests — see `BC-01-CONTROLLED-GROUP-EVIDENCE-MATRIX.md`.

---

## Explicit non-claims

- This file does **not** assert that tests were performed against production unless an artifact proves it.
- This file does **not** assert IRS approval of a §41 credit or §174A deduction.
- This file does **not** authorize payroll-tax offset activation (Form 8974 usable offset remains $0; payroll activation HOLD).
