# STEVIE-WEB-ROUTER-001 — Repository Audit

**Sprint:** 1  
**Audit date:** 2026-11-20 (America/New_York)  
**Auditor:** Cursor cloud agent (local/nonproduction scope only)  
**Workspace:** `HIP-HOP-PEOPLES-DAO-LLC/hiphoppeoples-architecture`  
**Base commit at inspection:** `4e4ed619e1aa6a02f1f996cc9f04bcaf19fcb45a` (`main`)

## 1. What this workspace contains

| Check | Finding |
|---|---|
| Package manifests (`package.json`, `Cargo.toml`, etc.) | **Absent on `main`.** Docs-only tree. |
| Application source (React, Agents SDK, ChatKit) | **Absent on `main`.** |
| Supabase migrations on `main` | **Absent.** |
| Automated test suite on `main` | **Absent.** |
| Nature of repository | Public architecture / governance / transparency documentation. |

**Verdict:** On `main`, this repository holds architecture documentation only. It does **not** contain a production STEVIE Web Kit implementation. Related application code lives in other repositories and in unmerged feature branches of this repo.

## 2. Related repositories inspected (accessible accounts)

| Target named in directive | Best match found | Evidence | Notes |
|---|---|---|---|
| STEVIE AI engine | `affishaul/dynasty-os-gateway` (`stevie_core.py`) | MCP gateway over Airtable (labor, FN ledger, Ministry ID). **Not** ChatKit / Agents SDK merchant intake. | Separate product surface. |
| STEVIE UI credit / bail SaaS | `affishaul/suretytech` | `components/StevieChat.tsx` + Next.js AI routes; description mentions Stevie AI + Supabase. | Domain is SuretyTech compliance chat, not Emerald City XP. |
| Greater Good Enterprises website | `affishaul/greatergoodenterprise` | Static HTML: `/`, `/mart`, `/partner`, `/emerald-city`, `/holiday-quest-intake`. | Live storefront brand: **Blockchain Mini Mart**; footer credit: **Powered by Stevie AI**. |
| Emerald City 252 guest experience | Same GGE site + branch `feature/emerald-city-member-hub-20261109` in this repo | `emerald-city.html` posts to Supabase RPC `ec_join_v2`; member-hub branch documents passport RPCs. | Free join is human-reviewed expression of interest only. |
| Hip Hop Peoples portal | Not found as a dedicated accessible GitHub repo named “portal” | Public URLs referenced: `hiphoppeoples.com`, People’s Pass pages. | Portal host/repo not confirmed in accessible SCM inventory. |
| HHP Peoples Feed | Supabase project nickname recorded on prior branch README: `hhp-peoples-feed` / project ref `jvbwmffnopwcypjrokex` | Documented in `feature/emerald-city-member-hub-20261109` README; GGE pages call that project’s REST RPCs. | **No local schema dump or credentials in this workspace.** |

Additional related systems (not STEVIE Web Kit, but adjacent intake):

- `affishaul/ggts-ai-os` — FastAPI autopilot with Jotform/Stripe webhooks (youth services).
- `affishaul/hhhi-partner-hub` — HHHI partner hub (`partners.hiphophealinginstitute.com`).
- GitLab `hiphoppeoplesdao-llc/rd-evidence-ledger` — private R&D evidence ledger (patterns/CSVs; not STEVIE app code).
- GitLab `hiphoppeoplesdao-llc/ccos-mvp`, `field-log`, `freedom-notes-ledger`, `hhhi-workforce-system` — operational/private systems.

**Not invented:** No repository was fabricated when a name did not resolve. “Hip Hop Peoples portal” and a dedicated “STEVIE AI engine” ChatKit service were **not** located as standalone accessible repos under those exact names.

## 3. Existing STEVIE / merchant / XP / intake components (remote + branch inventory)

### 3.1 Live GGE surfaces (read-only inspection via GitHub)

| Surface | Behavior observed |
|---|---|
| `/emerald-city` | Client form → Supabase RPC `ec_join_v2`; consent checkbox required; honeypot; adult attestation; “Powered by Stevie AI”. |
| `/holiday-quest-intake` | Client form → Supabase RPC `quest_submit_intake`; merchant fields + authorization checkbox; XP described as non-cash game score. |
| `/partner` | **Jotform fallback** iframe `form.jotform.com/263012280194045`; human-approval language; retains Holiday Quest intake as separate path. |

### 3.2 Unmerged branches on this repository

| Branch | Contents relevant to Sprint 1 |
|---|---|
| `feature/emerald-city-member-hub-20261109` | Static member hub; documents existing `profiles`, `member_passports`, RPCs `passport_*`; education-only District 00 (no persisted XP). |
| `feature/holiday-quest-dlq-alert-20261109` | Staged DLQ SQL (ops schema, **not applied**); Jotform normalizer; n8n dry-run; inventory note that `quest_merchant_intake` exists (0 rows) and `quest_merchants` has 1 demo merchant. |
| `greatergood-site-assets` | CDN assets referenced by GGE (`holiday-quest-ad.jpg`, etc.). |

### 3.3 Naming collision / existing table inventory (from prior staged docs only)

Documented as existing in Supabase project `jvbwmffnopwcypjrokex` (not re-verified live in this run — **no service-role credentials available**):

- `public.quest_merchant_intake`
- `public.quest_merchants`
- `public.profiles`
- `public.member_passports`
- RPCs: `ec_join_v2`, `quest_submit_intake`, `passport_apply`, `passport_queue`, `passport_review`, `passport_check`

Documented as **not** existing (prior staging note):

- `public.quest_pilot_inquiries`
- `public.intake_dlq_log`

**Not located in accessible code:** `quest_events`, `award_xp`, ChatKit merchant intake orchestration, Agents SDK server package for Stevie Web Kit.

## 4. Correct implementation placement for Sprint 1

| Layer | Safe placement chosen | Why |
|---|---|---|
| Reusable Stevie Web Kit (conversation + deterministic XP) | **New package** `packages/stevie-web-kit/` in this architecture repo | Avoids overwriting `greatergoodenterprise`, `suretytech`, or live Supabase. Provides testable vertical slice + migration candidates. |
| Production HTML storefront | Remain in `affishaul/greatergoodenterprise` | Do not overwrite. |
| Live database changes | **Not applied** | Directive: no production migration until explicitly approved. |

## 5. Credentials / infrastructure availability (this environment)

| Resource | Status |
|---|---|
| Supabase service-role key | **Unavailable** — not present in workspace; must not be invented. |
| OpenAI / ChatKit credentials | **Unavailable**. |
| Ability to apply SQL to `jvbwmffnopwcypjrokex` | **Unavailable** in this agent session. |
| Local Node.js | Available (`v22.23.4`) for unit/integration harness. |

## 6. Branding controls preserved

- Public storefront brand: **Blockchain Mini-Mart** / Blockchain Mini Mart Express.
- Technology credit: **Powered by Stevie AI**.
- Quest XP: non-cash, non-transferable, non-redeemable game score (per GGE copy and Sprint 1 game-layer rules).

## 7. Audit conclusion

Implement Sprint 1 as a **new, isolated package + candidate migrations + local tests + §41 evidence docs** in this repository. Treat live Supabase and GGE site as external systems to integrate later under human approval — not as writable targets in this run.
