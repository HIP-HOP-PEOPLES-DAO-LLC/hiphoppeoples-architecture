# Holiday Quest — Jotform → Airtable commercial intake mapping

**State:** connector-verified data model; deployment code staged in PR #7. **No live n8n integration is active.**

## Verified inputs
- Jotform enabled, **0 completed submissions** at inspection: https://form.jotform.com/263122907625052 (merchant & sponsor inquiry).
- This form's questions use a Name field, email, business name, location, inquiry type, opportunity categories, budget, contact preference, a required specific contact-permission field, and a separate optional marketing opt-in.
- Prior MCP test-submission attempts **did not create a record**: the Jotform tool reported required structured fields missing. Do not treat those attempts as real inbound leads; no outreach.
- Airtable canonical table already exists: **Stevie AI Control Plane Execution Register** base `appapW5T6q04dK6n4`, table **Leads Attribution** `tblcKNPZrIJO8hx1a`.
- Do not route merchant leads to `WORKFORCE` or invent `TBL-01 Intake Master` in `appxLObzREOlRGDww`.
- Proposed `public.quest_merchant_intake` Supabase table requires signer/business fields absent from this form. It does **not** automatically receive Jotform data. No 2nd inquiry table created.

## Canonical commercial data
Pipeline:
```
Jotform merchant form
    → n8n Jotform submission notification (contains submissionID)
    → authenticated Jotform API GET /submission/{submissionID}
    → confirm returned formID == 263122907625052, contact consent
    → normalize-verified-jotform.js
    → synthetic QA quarantine / real lead branch
    → Airtable Leads Attribution find by exact Lead_ID
    → if absent, create record in this commercial table; save event receipt
    → optional internal staff-alert test (separate human release)
```

**Do not trust the webhook's unverified rawRequest for database writes.** Fetch the authoritative Jotform submission through a scoped Jotform credential in n8n; verify form ID and submission ID match the webhook.

The normalize function outputs an allowlisted `airtable_fields` object for:
- `Lead_ID = JOTFORM_HQ_{submissionID}` (stable idempotency key; check for existing records before writing).
- `Contact_Name`, `Organization`, `Email`, `Phone` (only after affirmative specific contact consent).
- `Source_Method = CRM Source` (existing single-select choice).
- `Source_Value = Jotform Holiday Quest | {reported acquisition source}`.
- `Lead_Status = New` and `Consent_Status = Documented` (both are existing single-select choices).
- `Notes`: strict merchant tag, location/interest/timeline/preferred method, marketing flag, and canonical Jotform submission ID.

**Not an invoice.** No package reservation, contract, campaign opt-in, profile activation, referral payment, workforce enrollment, merchant verification or credit grant is implied by an inquiry.

## Real n8n deployment gates
1. Set up a private Jotform API credential in n8n; do not paste tokens into code, tool outputs or chat.
2. Set up n8n Airtable credential on the verified Stevie AI base; restrict access to `Leads Attribution`.
3. Configure a POST webhook in Jotform's Settings → Integrations → Webhooks with a long random route secret or an authenticated verification step. **Webhook notifications alone are not signed verification.**
4. Use the verified Jotform API object from the HTTP request, not a guessed `q3` / `q4` map.
5. Normalize; when `skip_crm_write=true`, quarantine QA and do not create a business lead.
6. For real leads, search Airtable exact `Lead_ID` first, create only when absent; document race/concurrency handling. No automatic GHL/HubSpot outbound sync.
7. Log per-destination errors in a private metadata-only DLQ, with bounded retries. The separate abandoned-alert workflow is in this PR, not activated.
8. Confirm with **one consented non-synthetic merchant submission**: receipt in Jotform, verified API response, one Airtable lead, a staff review entry, and an observed delivered internal alert. Do not enable marketing or invoice until evidence passes.

## HHHI firewall (distinct website copy task)
The user-supplied HHHI About page text says HHHI "provides Medicaid-billable Peer Support Services." The controlled October 22 provider separation record says HHHI is **nonclinical** and should not bill; a separate enrolled qualified provider must hold Medicaid service authority. Do **not** publish that wording as proof HHHI has Medicaid billing authority. NC Medicaid revised CCP 8G effective September 1, 2026; confirm current qualifications with the actual provider before any clinical website copy or referral trigger.
