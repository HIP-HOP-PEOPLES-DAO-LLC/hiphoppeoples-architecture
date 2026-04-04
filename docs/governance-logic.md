# Stevie AI Governance Logic — Street Credit → Freedom Notes Engine

**Version:** 1.0
**Date:** April 4, 2026
**Repository Path:** docs/governance-logic.md

---

## Core Principle

Street Credit is the behavioral merit ledger. Freedom Notes (FN) are the internal accounting units of effort issued as rewards for verified participation. Stevie AI is the sole enforcement and issuance engine.

---

## 1. Input Sources

- Soul-Bound Ministry ID (verified member)
- BlackCoins NFT (zone / tier access)
- Physical activity on land (Freedom Grid sensor / manual log)
- Kiosk task completion
- Film production milestone
- Bail/surety stabilization service
- Community contribution (Healing Gardens, Education Zone, etc.)

---

## 2. Street Credit Calculation Formula

```
Street Credit = Base + Activity Multiplier + Tenure Bonus + Compliance Modifier
```

| Component | Value |
|---|---|
| **Base** | 10 points per verified hour of participation |
| **Core Hub work** | ×1.2 multiplier |
| **Education / Training** | ×1.5 multiplier |
| **Healing Gardens** | ×1.8 multiplier |
| **Infrastructure maintenance** | ×1.3 multiplier |
| **Tenure Bonus** | +5 points per 30 days of continuous good standing |
| **Perfect compliance modifier** | +15% |
| **Minor violation modifier** | -20% |
| **Major violation modifier** | -50% + temporary suspension |

---

## 3. Freedom Notes Issuance Rules

```
FN = Street Credit × Conversion Rate (current rate = 1.0)
```

### Advance Rate Caps (Behavioral Credit Engine)

| Tier | Prestige Range | Max FN Advance % of Street Credit |
|---|---|---|
| T1 | < 55 | 25–35% |
| T2 | 55–70 | 40–65% |
| T3 | 70–85 | 65–85% |
| T4 | 85+ | 85–95% |

### Throttling Rules

- Liquidity Ratio < 1.2 → All advances reduced by 20%
- Multiple high-value requests in 24h → Queue for Executive Clearinghouse review
- Violation detected → FN issuance blocked until PMA resolution

---

## 4. Violation & Enforcement Logic

| Violation Level | Trigger | Consequence |
|---|---|---|
| **Minor** | Late check-in, rule reminder | -20% Street Credit, warning issued |
| **Major** | Unauthorized zone entry, damage to grid | -50% Street Credit, NFT access suspended 7–30 days |
| **Critical** | PMA rule breach, safety risk | Full revocation + Council review |

Stevie AI logs every decision with timestamp and blockchain hash.

---

## 5. Settlement Flow

```
Revenue Event (rebate, grant, contract payment)
  → Match against open FN liabilities
  → Burn corresponding WCU
  → Capture spread to Dynasty Reserve (10%)
```

---

## 6. Audit Trail

Every action is written to:

- `MASPT_Stevie_Tracking_2026` Master Ledger
- On-chain evidence hash
- PDF compliance report for Trust records

---

This logic is the enforceable bridge between physical land activity and internal economic rewards.
