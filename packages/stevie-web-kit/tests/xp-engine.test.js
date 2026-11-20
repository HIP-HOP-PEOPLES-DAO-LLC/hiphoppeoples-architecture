import { test } from 'node:test';
import assert from 'node:assert/strict';
import { XpEngine } from '../src/game/xp-engine.js';

function primed() {
  const xp = new XpEngine();
  xp.defineQuest({
    questId: 'hq-stop-1',
    title: 'Holiday Quest Stop 1',
    xpReward: 50,
    tenantId: 'tenant-a',
    storeCode: 'VERIFY-hq-stop-1',
  });
  xp.defineQuest({
    questId: 'hq-stop-b',
    title: 'Other tenant quest',
    xpReward: 25,
    tenantId: 'tenant-b',
    storeCode: 'VERIFY-hq-stop-b',
  });
  return xp;
}

test('XP replay / idempotent award collapses duplicates', () => {
  const xp = primed();
  const proof = { kind: 'store_code', code: 'VERIFY-hq-stop-1' };
  const first = xp.awardXp({
    playerId: 'player-1',
    questId: 'hq-stop-1',
    tenantId: 'tenant-a',
    proof,
    idempotencyKey: 'k1',
  });
  const second = xp.awardXp({
    playerId: 'player-1',
    questId: 'hq-stop-1',
    tenantId: 'tenant-a',
    proof,
    idempotencyKey: 'k1',
  });
  assert.equal(first.ok, true);
  assert.equal(first.duplicate, false);
  assert.equal(first.awarded, 50);
  assert.equal(second.ok, true);
  assert.equal(second.duplicate, true);
  assert.equal(second.awarded, 0);
  assert.equal(xp.getBalance('player-1'), 50);
  assert.equal(xp.getLedger().length, 1);
});

test('concurrent-award simulation with same idempotency key yields one ledger event', async () => {
  const xp = primed();
  const proof = { kind: 'store_code', code: 'VERIFY-hq-stop-1' };
  const jobs = Array.from({ length: 20 }, () =>
    Promise.resolve(
      xp.awardXp({
        playerId: 'player-conc',
        questId: 'hq-stop-1',
        tenantId: 'tenant-a',
        proof,
        idempotencyKey: 'concurrent-1',
      }),
    ),
  );
  const results = await Promise.all(jobs);
  const successes = results.filter((r) => r.ok);
  assert.equal(successes.length, 20);
  assert.equal(results.filter((r) => r.duplicate).length, 19);
  assert.equal(results.filter((r) => !r.duplicate).length, 1);
  assert.equal(xp.getLedger().length, 1);
  assert.equal(xp.getBalance('player-conc'), 50);
});

test('unauthorized direct database-write attempt is rejected', () => {
  const xp = primed();
  const denied = xp.tryDirectWrite();
  assert.equal(denied.ok, false);
  assert.equal(denied.code, 'UNAUTHORIZED_DIRECT_WRITE');
});

test('append-only ledger enforcement blocks mutation helper', () => {
  const xp = primed();
  const denied = xp.mutateLedger();
  assert.equal(denied.ok, false);
  assert.equal(denied.code, 'APPEND_ONLY');
});

test('client-supplied XP amount is rejected', () => {
  const xp = primed();
  const bad = xp.awardXp({
    playerId: 'player-1',
    questId: 'hq-stop-1',
    tenantId: 'tenant-a',
    proof: { kind: 'store_code', code: 'VERIFY-hq-stop-1', claimedXp: 9999 },
  });
  assert.equal(bad.ok, false);
  assert.equal(bad.code, 'CLIENT_XP_FORBIDDEN');
});

test('cross-tenant quest award is rejected', () => {
  const xp = primed();
  const bad = xp.awardXp({
    playerId: 'player-1',
    questId: 'hq-stop-b',
    tenantId: 'tenant-a',
    proof: { kind: 'store_code', code: 'VERIFY-hq-stop-b' },
  });
  assert.equal(bad.ok, false);
  assert.equal(bad.code, 'CROSS_TENANT');
});

test('quest definition refuses cash-redeemable rewards', () => {
  const xp = new XpEngine();
  assert.throws(() =>
    xp.defineQuest({
      questId: 'bad',
      xpReward: 10,
      cashRedeemable: true,
    }),
  );
});

test('rotating idempotency keys cannot remint the same quest completion', () => {
  const xp = primed();
  const proof = { kind: 'store_code', code: 'VERIFY-hq-stop-1' };
  const first = xp.awardXp({
    playerId: 'player-1',
    questId: 'hq-stop-1',
    tenantId: 'tenant-a',
    proof,
    idempotencyKey: 'key-a',
  });
  const second = xp.awardXp({
    playerId: 'player-1',
    questId: 'hq-stop-1',
    tenantId: 'tenant-a',
    proof,
    idempotencyKey: 'key-b',
  });
  assert.equal(first.ok, true);
  assert.equal(first.duplicate, false);
  assert.equal(second.ok, true);
  assert.equal(second.duplicate, true);
  assert.equal(second.awarded, 0);
  assert.equal(xp.getBalance('player-1'), 50);
  assert.equal(xp.getLedger().length, 1);
});

test('configured storeCode is preserved and verified', () => {
  const xp = new XpEngine();
  xp.defineQuest({
    questId: 'q',
    xpReward: 10,
    tenantId: 'tenant-a',
    storeCode: 'SECRET-123',
  });
  const bad = xp.awardXp({
    playerId: 'player-1',
    questId: 'q',
    tenantId: 'tenant-a',
    proof: { kind: 'store_code', code: 'VERIFY-q' },
  });
  const good = xp.awardXp({
    playerId: 'player-1',
    questId: 'q',
    tenantId: 'tenant-a',
    proof: { kind: 'store_code', code: 'SECRET-123' },
  });
  assert.equal(bad.ok, false);
  assert.equal(bad.code, 'PROOF_FAILED');
  assert.equal(good.ok, true);
  assert.equal(good.awarded, 10);
});
