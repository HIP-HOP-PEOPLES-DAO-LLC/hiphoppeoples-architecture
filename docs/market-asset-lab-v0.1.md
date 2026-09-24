# Hip-Hop Peoples Market & Asset Lab — Implementation Brief v0.1

**Status:** Draft implementation architecture  
**Date:** 2026-09-19  
**Maintained by:** Hip-Hop Peoples DAO LLC  
**System designation:** Powered by Stevie AI  
**Supervisory function:** Stevie AI Native Market Sentinel

---

## 1. Objective

Add a controlled Web3 operating layer to HipHopPeoples.com without converting the ecosystem into a speculative-token project.

The first release will connect:

**Web2 Front Door → People’s Pass → Wallet/Account → District Routing → Verified Participation → Commerce/Receipts → Optional Onchain Proof**

A separate Market & Asset Lab will provide read-only discovery and diligence for Base-native markets. Any future transferable, yield-bearing, revenue-sharing, ownership, debt, royalty, or investment-like asset remains outside Release 1 and requires a separate legal/compliance gate before deployment.

---

## 2. Non-Negotiable Existing Rules

This implementation extends, and does not replace, the current Ecosystem Routing Map.

1. GitLab remains the private system of record for money, eligibility, policy, safety incidents, compliance evidence, participant records, and operational controls.
2. GitHub remains a public transparency layer containing patterns, not records.
3. HipHopPeoples.com remains the public front door.
4. HipHopPeoples.dao remains the governance-visibility surface.
5. Public chain activity contains no names, participant records, health information, court information, addresses, photos, case notes, or other PII/PHI.
6. Freedom Notes™ remain non-monetary, non-transferable participation/governance credits. They are not a cryptocurrency, cash-equivalent, investment, ownership interest, or tradable asset.

---

## 3. Product Architecture

### District 05 — Market & Asset Lab

User-facing sequence:

**Discover → Verify → Create → Prove → Activate → Liquidity Gate**

Release 1 stops before permissionless liquidity activation.

### Core surfaces

- **People’s Pass**
  - member identity and consent state
  - wallet/account connection
  - district eligibility/routing
  - privacy-preserving public identifier

- **My Progress**
  - missions completed
  - credentials/attestations
  - participation receipts
  - Freedom Notes balance displayed only within the existing non-monetary governance model

- **Market Radar**
  - read-only discovery of Base-native tokens/pools/protocols
  - contract and liquidity metadata
  - risk flags
  - source links
  - no auto-buy, auto-swap, treasury execution, or personalized investment recommendation

- **Asset Registry**
  - catalog of HHP utility assets and proofs
  - examples: membership passes, event access, studio entitlements, credentials, digital collectibles, policy/snapshot hashes
  - every asset assigned a classification and human approval state before any onchain action

- **Commerce**
  - optional USDC/Base Pay checkout for ecosystem goods and services
  - merchant/entity attribution
  - receipt ID and transaction hash linkage
  - no custody of user funds by HHP in Release 1

---

## 4. Asset Classification Gate

Every proposed asset must be classified before deployment.

### Class A — Proof / Attestation
Examples:
- policy hash
- ledger snapshot hash
- credential proof
- completion receipt

Default: non-transferable or hash-only.

### Class B — Utility / Access
Examples:
- membership pass
- event ticket
- studio-use entitlement
- digital access credential

Default: practical-use design; no promised profit, passive yield, ownership, or revenue rights.

### Class C — Commerce
Examples:
- USDC purchase
- service payment
- creator merchandise transaction

Default: payment/settlement rail only. HHP should avoid taking custody or intermediating exchange activity unless separately reviewed.

### Class D — Financial / RWA / Investment-Like
Examples:
- equity
- debt
- royalty participation
- film revenue participation
- real-estate interest
- transferable profit-sharing token
- liquidity-pool launch for an HHP-issued financial asset

Default: **HOLD**. Requires written legal/compliance review, entity determination, offering/market structure, KYC/AML analysis where applicable, tax/accounting treatment, custody analysis, and explicit Human Gateway approval.

---

## 5. Stevie AI Native Market Sentinel

### Purpose

Create a supervisory research layer that finds and evaluates early Base-native markets without autonomously deploying ecosystem capital.

### Inputs

- token contract
- chain and deployment time
- pool address
- paired asset
- DEX/venue
- liquidity
- 24h/7d volume
- holder concentration
- LP concentration
- ownership/admin permissions
- proxy/upgradeability status
- verified source-code status when available
- liquidity lock status where available
- token supply and FDV
- price impact/slippage samples
- project identity and public sources
- audit information
- sanctions/scam/risk flags from approved data sources

### Sentinel statuses

- **PASS — Observe:** sufficient data quality for monitoring
- **WATCH:** incomplete or elevated-risk signals
- **HOLD:** material diligence, legal, identity, liquidity, contract-control, or data-quality concern
- **ESCALATE:** requires named human authority or specialist review

### Hard blocks

Sentinel may not:
- execute a trade
- connect or sign with a treasury wallet
- move customer/user funds
- recommend a token as guaranteed or “the next XRP”
- approve an HHP-issued financial asset
- override the Human Gateway
- treat social-media popularity as diligence
- publish private participant or treasury information

---

## 6. Initial Data Model

The application backend should maintain the following logical objects.

### Identity and routing
- users
- peoples_passes
- wallet_links
- consent_events
- districts
- memberships
- routes

### Participation and proof
- missions
- mission_completions
- credentials
- attestations
- proof_anchors
- freedom_note_events

### Market intelligence
- market_assets
- market_pools
- market_snapshots
- contract_risk_flags
- source_evidence
- sentinel_reviews
- human_decisions

### Asset factory
- asset_proposals
- asset_classifications
- asset_rights
- asset_deployments
- asset_approvals

### Commerce
- merchants
- offers
- orders
- payment_intents
- payment_receipts

### Governance and audit
- approval_requests
- approval_events
- policy_versions
- audit_events

All public-facing records should use public IDs that cannot be used to reconstruct protected participant data.

---

## 7. Technical Direction

### Front end
- HipHopPeoples.com Web2 experience remains the primary interface.
- Add People’s Pass and District 05 as progressive Web3 features.
- Wallet connection should be optional for ordinary browsing.
- Use plain-language UX: “Sign in / connect,” “My Pass,” “My Progress,” “Pay,” and “Verify,” rather than forcing users to understand wallets, gas, or contract terminology.

### Onchain network
- Base is the initial target network.
- Use established account/wallet tooling rather than custom key custody.
- Release 1 should favor account abstraction / smart-account UX and sponsored or simplified transaction flows when appropriate.

### Backend/control plane
- Stevie AI maintains policy, evidence, classifications, Sentinel outputs, and Human Gateway state offchain.
- Supabase may serve application data/auth/event functions where compatible with privacy and system-of-record rules.
- Private compliance/participant evidence remains routed according to the existing GitLab-first policy.

### Chain writes
Release 1 permits only approved:
- proof hashes
- attestations
- access/utility objects
- payment transactions initiated by users

Release 1 does not permit:
- ecosystem treasury trading
- automatic swaps
- user-fund custody
- HHP investment-token launch
- liquidity-pool creation for an HHP-issued financial asset

---

## 8. Release Plan

### R0 — Architecture & Controls
Deliverables:
- this implementation brief
- asset-classification schema
- Sentinel decision schema
- Human Gateway approval schema
- privacy/data-routing map
- environment inventory

Exit criteria:
- no conflict with the existing Routing Map or Freedom Notes policy
- every onchain action has a named authority and evidence trail

### R1 — People’s Pass + Wallet-Aware Routing
Deliverables:
- Web2 onboarding
- optional wallet/account connection
- public member ID
- consent record
- district routing
- basic “My Progress” page

Exit criteria:
- a user can join without crypto knowledge
- wallet linking can be removed/revoked
- no sensitive data is written onchain

### R2 — Market Radar (Read Only)
Deliverables:
- Base-native asset watchlist
- pool/contract data ingestion
- Sentinel PASS/WATCH/HOLD/ESCALATE state
- evidence/source drawer
- human review queue

Exit criteria:
- every displayed risk conclusion has source evidence
- no trade/execution action exists in the product

### R3 — Utility Asset Registry + Proof Anchors
Deliverables:
- asset proposal workflow
- Class A/B review
- approved attestations/proof anchors
- public verification view

Exit criteria:
- asset classification is mandatory
- Class D automatically routes to HOLD
- no PII/PHI/case data onchain

### R4 — Commerce
Deliverables:
- USDC/Base payment option for approved goods/services
- entity/merchant attribution
- payment receipt reconciliation
- refund/support workflow

Exit criteria:
- user controls the payment
- no pooled customer balances
- accounting export is reproducible

### R5 — RWA / Native Liquidity Research
Deliverables:
- separate legal/compliance design
- issuer/venue/custody/KYC/AML/tax analysis
- approved instrument economics
- market/liquidity plan

Exit criteria:
- no deployment without written Human Gateway authorization
- no assumption that permissionless technical deployment equals legal authorization

---

## 9. 30-Day MVP Backlog

### Week 1
- inventory current HipHopPeoples.com stack
- confirm backend project
- define public/private data boundaries
- implement database schema in development
- establish RLS/authorization policy
- establish chain/testnet configuration

### Week 2
- implement People’s Pass
- implement wallet/account linking
- implement consent events
- implement district routing
- create My Progress shell

### Week 3
- implement Market Radar ingestion
- implement source-evidence records
- implement Sentinel review logic
- implement review dashboard
- test with synthetic/watch-only assets

### Week 4
- implement asset proposal/classification workflow
- create proof-anchor test flow
- security/RLS review
- testnet end-to-end demonstration
- Human Gateway acceptance review

---

## 10. Initial Acceptance Tests

1. New user can join without a wallet.
2. Existing user can connect a wallet/account without exposing private profile data onchain.
3. District routing works independently of wallet balance.
4. Freedom Notes cannot be transferred or converted to cash through the app.
5. Sensitive records never appear in public GitHub, public API responses, or chain payloads.
6. A watched Base asset receives a Sentinel state plus source evidence.
7. Sentinel cannot initiate a transaction.
8. Class D asset proposal automatically enters HOLD.
9. Human approval is logged before any approved chain write.
10. Every chain write can be reconciled to an internal approval/evidence record.

---

## 11. Immediate Infrastructure Gate

A connected Supabase project named `stevi-engine-v1` exists but is currently inactive.

Before database implementation:
- confirm whether this remains the authorized Stevie AI application backend;
- restore/reactivate it only with human authorization because reactivation can have operational/billing implications;
- inspect existing schema before creating any new objects;
- use a development branch/environment where available before production changes.

No duplicate backend should be created until this decision is resolved.

---

## 12. External Technology/Regulatory References

- Base 2026 strategy: https://blog.base.org/2026-mission-vision-and-strategy
- Base Account SDK: https://github.com/base/account-sdk
- Aerodrome documentation: https://aerodrome.finance/docs
- Aerodrome Launcher: https://aerodrome.finance/docs/launcher
- SEC — Crypto Assets and Federal Securities Laws: https://www.sec.gov/resources-small-businesses/capital-raising-building-blocks/crypto-assets-federal-securities-laws
- FinCEN — Virtual Currency Guidance: https://www.fincen.gov/resources/statutes-regulations/guidance/application-fincens-regulations-persons-administering

---

## 13. Controlling Principle

**Own the front door, verify the activity, preserve privacy, separate utility from investment, and make liquidity the last gate—not the first.**
