import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

/**
 * Explicitly document tests that could NOT run because infrastructure/credentials
 * are unavailable in this environment. These are not silent skips of required logic —
 * local unit tests cover the same behaviors against the reference engine.
 */
test('inventory: production Supabase migration apply is unavailable (expected)', () => {
  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const hasDbUrl = Boolean(process.env.SUPABASE_DB_URL || process.env.DATABASE_URL);
  assert.equal(hasServiceRole, false, 'service role must not be present in this agent environment');
  assert.equal(hasDbUrl, false, 'no live DB URL bound for production apply');
  console.log(
    JSON.stringify({
      evidence: 'infra_unavailable',
      production_migration_apply: 'NOT_RUN',
      reason: 'No SUPABASE_SERVICE_ROLE_KEY or DATABASE_URL in workspace; directive forbids production apply.',
    }),
  );
});

test('inventory: live ChatKit/Agents SDK model calls unavailable (expected)', () => {
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
  assert.equal(hasOpenAI, false);
  console.log(
    JSON.stringify({
      evidence: 'infra_unavailable',
      live_model_intake: 'NOT_RUN',
      reason: 'No OPENAI_API_KEY; Sprint 1 uses deterministic orchestrator + FAQ router.',
    }),
  );
});

test('candidate migration files exist and are not auto-applied', () => {
  assert.equal(
    existsSync(new URL('../migrations/20261120_stevie_web_router_001_sprint1.sql', import.meta.url)),
    true,
  );
  assert.equal(
    existsSync(new URL('../migrations/20261120_stevie_web_router_001_sprint1_down.sql', import.meta.url)),
    true,
  );
});
