# Holiday Quest intake — privacy-safe DLQ alert (staged only)
Status: **SOURCE STAGED / NO LIVE n8n WORKFLOW / NO DATABASE MIGRATION** (2026-11-09)

## Verified live inventory
- Supabase: `public.quest_merchant_intake` exists (0 rows); `public.quest_merchants` has only 1 demonstration merchant. The proposed `public.quest_pilot_inquiries` and `public.intake_dlq_log` DO NOT exist. No new database tables have been created.
- Airtable base `appxLObzREOlRGDww` is named Executive Command Center, has 35 tables, but no `TBL-01 Intake Master`. Do not send payloads to imaginary fields. Commercial leads should be routed by verified owner-approved commercial taxonomy, not automatically `WORKFORCE`.
- Connected Mercury readback shows account ••0399 is **Mid Atlantic Enterprises, LLC**. The Holiday Quest Track 1 legal-draft seller is **Hip Hop Peoples DAO LLC**, so the cited seller-bank mapping is CONFLICTED; payment and invoice gate remains HOLD.
- Proposal price `$350 Local Business Spotlight` is NOT a guaranteed included video shoot. Voice AI `from $500` is a quoted setup starting price, not an authorized flat all-inclusive agreement. No checkout enabled.

## Implementation
1. Capture reviewed inquiries via the existing /partner route and `quest_merchant_intake` endpoint (independent end-to-end test pending). Store original source ID and separate UTM fields. Intake form should say *Request information*, not *Reserve your spot*, because no inventory is reserved.
2. After verifying the actual canonical Airtable target schema, write/upsert one commercial-intake event, save its real Airtable ID, preserve the original Supabase intake record. CRM sync is optional and must not run without permissions and valid GHL/HubSpot mappings.
3. Use an authenticated n8n server-side Postgres credential against a PRIVATE DLQ metadata table; the SQL schema here is a candidate, **not applied**. Never store raw payloads, arbitrary exception traces, service tokens or applicant contact details in the DLQ.
4. On each destination error, perform a bounded idempotent retry; at attempt limit, mark only that destination's DLQ record abandoned. Only then claim an unsent alert transactionally, pass rows to the `build-alert.js` n8n Code node (Run Once for All Items), send via Gmail with approved staff credential, and set `alert_sent_at` only when Gmail reports a successful send.
5. Gmail node: resource `message`; operation `send`; sendTo `={{$json.staff_recipient}}`; subject `={{$json.subject}}`; message `={{$json.body}}`; emailType `text`. Add a separate n8n workflow-level Error Trigger for unhandled workflow failures; it is not the same as the DLQ abandoned alert.
6. Recovery is *at least once*, not cross-system exactly once. The `idempotency_key` in the metadata helps reviewers deduplicate.

## Acceptance and safety gates
- [ ] Sign off real commercial Airtable intake table and field types.
- [ ] Approve private DB schema and worker grants after staging QA, not blindly in production.
- [ ] Restore n8n instance and verify Gmail OAuth and Postgres connection.
- [ ] One consented visitor test -> source row -> Airtable record -> n8n execution -> staff Gmail message.
- [ ] Verify failed destination retry, 5th attempt abandonment, duplicate suppression, PII redaction, email-send failure behavior.
- [ ] Keep public merchant offers inquiry-only; bank/seller/signature gates separate.

Artifact zip and test harness also saved in the current HHP Google Drive operational folder:
https://drive.google.com/drive/folders/1bAP3q4pmxY5jfoIifFAyWeJ9sw89JX3U
