-- Reversal candidate for Sprint 1 emerald XP objects.
-- DO NOT RUN against production without explicit approval and backup verification.
-- Drops ONLY objects introduced by 20261120_stevie_web_router_001_sprint1.sql.
-- Does NOT touch public.quest_merchant_intake, public.quest_merchants,
-- public.member_passports, public.profiles, or passport_* / ec_join_v2 / quest_submit_intake RPCs.

BEGIN;

DROP TRIGGER IF EXISTS trg_reject_xp_events_upd ON emerald.xp_events;
DROP FUNCTION IF EXISTS emerald.reject_client_xp_mutation();
DROP FUNCTION IF EXISTS emerald.award_xp(uuid, text, text, text, text);
DROP TABLE IF EXISTS emerald.xp_balances;
DROP TABLE IF EXISTS emerald.xp_events;
DROP TABLE IF EXISTS emerald.quest_definitions;
DROP SCHEMA IF EXISTS emerald;

COMMIT;
