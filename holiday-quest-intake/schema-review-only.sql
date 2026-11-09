-- REVIEW ONLY. No production migration authorized by this file.
-- Database target: Supabase project jvbwmffnopwcypjrokex, subject to independent change gate.
BEGIN;
CREATE SCHEMA IF NOT EXISTS ops;
REVOKE ALL ON SCHEMA ops FROM PUBLIC, anon, authenticated;
CREATE TABLE IF NOT EXISTS ops.intake_sync_dlq (
  dlq_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  event_id text NOT NULL,
  source_reference text,
  airtable_record_id text,
  target_system text NOT NULL CHECK (target_system IN ('GHL','GoHighLevel','HubSpot','Airtable','Gmail','n8n','Supabase')),
  error_code text,
  retry_count int NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
  max_retries int NOT NULL DEFAULT 5 CHECK (max_retries BETWEEN 1 AND 10),
  status text NOT NULL DEFAULT 'pending_retry' CHECK (status IN ('pending_retry','resolved','abandoned')),
  next_retry_at timestamptz,
  alert_claim_token uuid,
  alert_claimed_at timestamptz,
  alert_sent_at timestamptz,
  UNIQUE (event_id,target_system)
);
ALTER TABLE ops.intake_sync_dlq ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE ops.intake_sync_dlq FROM PUBLIC, anon, authenticated;
CREATE INDEX IF NOT EXISTS intake_dlq_retry_idx ON ops.intake_sync_dlq(next_retry_at) WHERE status='pending_retry';
CREATE INDEX IF NOT EXISTS intake_dlq_alert_idx ON ops.intake_sync_dlq(created_at) WHERE status='abandoned' AND alert_sent_at IS NULL;
CREATE OR REPLACE FUNCTION ops.claim_abandoned_dlq_alerts(p_limit int DEFAULT 10)
RETURNS SETOF ops.intake_sync_dlq
LANGUAGE sql SECURITY INVOKER SET search_path = ''
AS $$
 WITH picked AS (
   SELECT dlq_id FROM ops.intake_sync_dlq
   WHERE status='abandoned' AND retry_count>=max_retries
     AND alert_sent_at IS NULL
     AND (alert_claimed_at IS NULL OR alert_claimed_at < now() - interval '15 minutes')
   ORDER BY created_at ASC
   LIMIT greatest(1,least(coalesce(p_limit,10),25)) FOR UPDATE SKIP LOCKED
 )
 UPDATE ops.intake_sync_dlq AS d
 SET alert_claim_token=gen_random_uuid(),alert_claimed_at=now(),updated_at=now()
 FROM picked WHERE d.dlq_id=picked.dlq_id
 RETURNING d.*;
$$;
REVOKE ALL ON FUNCTION ops.claim_abandoned_dlq_alerts(int) FROM PUBLIC, anon, authenticated;
COMMIT;
-- Do not add ops to Data API exposed schemas.
-- Select a least-privileged n8n worker role and apply explicit grants after review.
-- Gmail send SUCCESS alone can authorize:
-- UPDATE ops.intake_sync_dlq SET alert_sent_at=now(),updated_at=now()
-- WHERE dlq_id=$1::uuid AND alert_claim_token=$2::uuid
--   AND status='abandoned' AND alert_sent_at IS NULL RETURNING dlq_id;
