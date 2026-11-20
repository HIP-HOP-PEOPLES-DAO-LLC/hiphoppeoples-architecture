-- STEVIE-WEB-ROUTER-001 Sprint 1 — CANDIDATE MIGRATION ONLY
-- DO NOT APPLY TO PRODUCTION without explicit human approval.
-- Target project (documented externally): jvbwmffnopwcypjrokex (hhp-peoples-feed)
-- Collision review (from prior staged inventory, not re-applied here):
--   EXISTS: public.quest_merchant_intake, public.quest_merchants,
--           public.profiles, public.member_passports
--   NEW (this file): schema emerald + ec_* objects — names chosen to avoid collisions.

BEGIN;

CREATE SCHEMA IF NOT EXISTS emerald;
REVOKE ALL ON SCHEMA emerald FROM PUBLIC;
-- Callers need schema USAGE to resolve emerald.award_xp; table privileges stay revoked.
GRANT USAGE ON SCHEMA emerald TO authenticated;

CREATE TABLE IF NOT EXISTS emerald.quest_definitions (
  quest_id text PRIMARY KEY,
  tenant_id text NOT NULL DEFAULT 'global',
  title text NOT NULL,
  xp_reward integer NOT NULL CHECK (xp_reward > 0 AND xp_reward <= 10000),
  store_code text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  cash_redeemable boolean NOT NULL DEFAULT false CHECK (cash_redeemable = false),
  transferable boolean NOT NULL DEFAULT false CHECK (transferable = false),
  purchasable boolean NOT NULL DEFAULT false CHECK (purchasable = false),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS emerald.xp_events (
  event_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  tenant_id text NOT NULL,
  player_id uuid NOT NULL,
  quest_id text NOT NULL REFERENCES emerald.quest_definitions(quest_id),
  amount integer NOT NULL CHECK (amount > 0),
  idempotency_key text NOT NULL,
  source text NOT NULL DEFAULT 'server_verified_quest'
    CHECK (source = 'server_verified_quest'),
  CONSTRAINT xp_events_idempotency UNIQUE (idempotency_key),
  -- Completion uniqueness is independent of caller-supplied idempotency keys.
  CONSTRAINT xp_events_one_completion_per_player_quest UNIQUE (tenant_id, player_id, quest_id)
);

-- No UPDATE/DELETE grants will be issued to clients; append-only by privilege design.
CREATE TABLE IF NOT EXISTS emerald.xp_balances (
  player_id uuid PRIMARY KEY,
  tenant_id text NOT NULL,
  balance integer NOT NULL DEFAULT 0 CHECK (balance >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE emerald.quest_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE emerald.xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE emerald.xp_balances ENABLE ROW LEVEL SECURITY;

-- Deny-by-default: no policies for anon direct table access.
REVOKE ALL ON ALL TABLES IN SCHEMA emerald FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION emerald.award_xp(
  p_player_id uuid,
  p_quest_id text,
  p_tenant_id text,
  p_proof_code text,
  p_idempotency_key text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_quest emerald.quest_definitions%ROWTYPE;
  v_key text;
  v_existing emerald.xp_events%ROWTYPE;
  v_event_id uuid;
  v_balance integer;
  v_auth uuid := auth.uid();
BEGIN
  IF v_auth IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'UNAUTHORIZED');
  END IF;

  -- Never trust client-supplied player IDs that disagree with the authenticated user.
  IF p_player_id IS DISTINCT FROM v_auth THEN
    RETURN jsonb_build_object('ok', false, 'code', 'PLAYER_MISMATCH');
  END IF;

  IF p_proof_code IS NULL OR length(trim(p_proof_code)) = 0 THEN
    RETURN jsonb_build_object('ok', false, 'code', 'INVALID_PROOF');
  END IF;

  SELECT * INTO v_quest
  FROM emerald.quest_definitions q
  WHERE q.quest_id = p_quest_id AND q.active = true
  FOR SHARE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'code', 'QUEST_NOT_FOUND');
  END IF;

  IF v_quest.tenant_id <> 'global' AND v_quest.tenant_id <> p_tenant_id THEN
    RETURN jsonb_build_object('ok', false, 'code', 'CROSS_TENANT');
  END IF;

  IF v_quest.store_code <> p_proof_code THEN
    RETURN jsonb_build_object('ok', false, 'code', 'PROOF_FAILED');
  END IF;

  -- Amount comes ONLY from quest definition — never from client arguments.
  v_key := coalesce(nullif(trim(p_idempotency_key), ''), p_tenant_id || ':' || p_player_id::text || ':' || p_quest_id);

  -- Prefer completion uniqueness over rotating request keys.
  SELECT * INTO v_existing
  FROM emerald.xp_events e
  WHERE e.tenant_id = p_tenant_id
    AND e.player_id = p_player_id
    AND e.quest_id = p_quest_id;
  IF FOUND THEN
    SELECT balance INTO v_balance FROM emerald.xp_balances WHERE player_id = p_player_id;
    RETURN jsonb_build_object(
      'ok', true,
      'duplicate', true,
      'awarded', 0,
      'balance', coalesce(v_balance, 0),
      'event_id', v_existing.event_id
    );
  END IF;

  SELECT * INTO v_existing FROM emerald.xp_events e WHERE e.idempotency_key = v_key;
  IF FOUND THEN
    SELECT balance INTO v_balance FROM emerald.xp_balances WHERE player_id = p_player_id;
    RETURN jsonb_build_object(
      'ok', true,
      'duplicate', true,
      'awarded', 0,
      'balance', coalesce(v_balance, 0),
      'event_id', v_existing.event_id
    );
  END IF;

  INSERT INTO emerald.xp_events (tenant_id, player_id, quest_id, amount, idempotency_key)
  VALUES (p_tenant_id, p_player_id, p_quest_id, v_quest.xp_reward, v_key)
  RETURNING event_id INTO v_event_id;

  INSERT INTO emerald.xp_balances (player_id, tenant_id, balance, updated_at)
  VALUES (p_player_id, p_tenant_id, v_quest.xp_reward, now())
  ON CONFLICT (player_id) DO UPDATE
    SET balance = emerald.xp_balances.balance + EXCLUDED.balance,
        updated_at = now()
  RETURNING balance INTO v_balance;

  RETURN jsonb_build_object(
    'ok', true,
    'duplicate', false,
    'awarded', v_quest.xp_reward,
    'balance', v_balance,
    'event_id', v_event_id
  );
EXCEPTION WHEN unique_violation THEN
  -- Concurrent award with same completion or idempotency key.
  SELECT * INTO v_existing
  FROM emerald.xp_events e
  WHERE (e.tenant_id = p_tenant_id AND e.player_id = p_player_id AND e.quest_id = p_quest_id)
     OR e.idempotency_key = v_key
  ORDER BY e.created_at ASC
  LIMIT 1;
  SELECT balance INTO v_balance FROM emerald.xp_balances WHERE player_id = p_player_id;
  RETURN jsonb_build_object(
    'ok', true,
    'duplicate', true,
    'awarded', 0,
    'balance', coalesce(v_balance, 0),
    'event_id', v_existing.event_id
  );
END;
$$;

REVOKE ALL ON FUNCTION emerald.award_xp(uuid, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION emerald.award_xp(uuid, text, text, text, text) TO authenticated;

-- Block direct client writes; balances/events only via award_xp.
CREATE OR REPLACE FUNCTION emerald.reject_client_xp_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'UNAUTHORIZED_DIRECT_WRITE: emerald XP tables are append-only via award_xp'
    USING ERRCODE = '42501';
END;
$$;

-- Triggers apply to roles that somehow obtain table privileges; defense in depth.
DROP TRIGGER IF EXISTS trg_reject_xp_events_upd ON emerald.xp_events;
CREATE TRIGGER trg_reject_xp_events_upd
  BEFORE UPDATE OR DELETE ON emerald.xp_events
  FOR EACH ROW EXECUTE FUNCTION emerald.reject_client_xp_mutation();

COMMIT;

-- Rollout checklist (human):
-- 1) Review collision with quest_merchants / quest_merchant_intake / member_passports.
-- 2) Apply to nonproduction first.
-- 3) Never expose service_role to browser or model tools.
-- 4) Do not enable purchasable/transferable/cash XP.
