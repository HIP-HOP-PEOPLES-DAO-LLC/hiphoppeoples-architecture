# Stevie Web Kit — Sprint 1

Reusable, locally testable vertical slice for:

1. **Conversation layer** — manifest-driven merchant intake with consent, Seller-of-Record acknowledgment, JSON schema validation, human approval queue, session turn limits, FAQ routing, and Jotform fallback pointer.
2. **Deterministic game layer** — quest definitions + append-only XP ledger + idempotent `award_xp` (no LLM-generated XP).

## Branding

- Public storefront: **Blockchain Mini-Mart**
- Technology credit: **Powered by Stevie AI**

## Safety gates

- No service-role key in browser or model tools.
- Client-supplied XP amounts and player IDs are rejected.
- Candidate SQL migrations are **not** applied to production by this package.
- Merchant applications stop at human-approval queue (no transmission).

## Run tests

```bash
cd packages/stevie-web-kit
npm test
```

## Production targets (external; not mutated here)

Documented separately in `docs/STEVIE-WEB-ROUTER-001-REPO-AUDIT.md`.
