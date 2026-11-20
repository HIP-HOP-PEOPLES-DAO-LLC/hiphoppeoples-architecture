import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MerchantIntakeOrchestrator, createChatKitClientConfig } from '../src/conversation/orchestrator.js';
import { freshStack, gatedSession, sampleMerchant } from './helpers.js';

test('ten synthetic merchant intakes enter human approval queue without transmission', () => {
  const { orchestrator } = freshStack();
  const ids = [];
  for (let i = 1; i <= 10; i += 1) {
    const sessionId = gatedSession(orchestrator, 'tenant-synth');
    const result = orchestrator.submitIntake(sessionId, sampleMerchant(i));
    assert.equal(result.ok, true, `intake ${i} should succeed`);
    assert.equal(result.duplicate, false);
    assert.equal(result.transmitted, false);
    assert.equal(result.status, 'pending_human_approval');
    assert.ok(result.applicationId);
    ids.push(result.applicationId);
  }
  assert.equal(ids.length, 10);
  assert.equal(new Set(ids).size, 10);
  assert.equal(orchestrator.queue.listForTenant('tenant-synth').length, 10);
});

test('duplicate intake submission is idempotent per tenant fingerprint', () => {
  const { orchestrator } = freshStack();
  const payload = sampleMerchant(42);
  const s1 = gatedSession(orchestrator, 'tenant-dup');
  const first = orchestrator.submitIntake(s1, payload);
  const s2 = gatedSession(orchestrator, 'tenant-dup');
  const second = orchestrator.submitIntake(s2, payload);
  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.equal(second.duplicate, true);
  assert.equal(second.applicationId, first.applicationId);
  assert.equal(orchestrator.queue.listForTenant('tenant-dup').length, 1);
});

test('cross-tenant isolation: tenants cannot list each other queues', () => {
  const { orchestrator } = freshStack();
  const a = gatedSession(orchestrator, 'tenant-a');
  const b = gatedSession(orchestrator, 'tenant-b');
  orchestrator.submitIntake(a, sampleMerchant(1));
  orchestrator.submitIntake(b, sampleMerchant(2));
  assert.equal(orchestrator.queue.listForTenant('tenant-a').length, 1);
  assert.equal(orchestrator.queue.listForTenant('tenant-b').length, 1);
  assert.equal(orchestrator.queue.listForTenant('tenant-a')[0].tenantId, 'tenant-a');
  assert.notEqual(
    orchestrator.queue.listForTenant('tenant-a')[0].id,
    orchestrator.queue.listForTenant('tenant-b')[0].id,
  );
});

test('consent rejection blocks chat and submit', () => {
  const orchestrator = new MerchantIntakeOrchestrator();
  const started = orchestrator.startSession({ tenantId: 'tenant-consent' });
  const denied = orchestrator.captureGates(started.sessionId, {
    consentAccepted: false,
    sellerOfRecordAcknowledged: true,
    sellerOfRecordNamedParty: 'Example Party',
  });
  assert.equal(denied.ok, false);
  assert.equal(denied.code, 'CONSENT_REQUIRED');

  const msg = orchestrator.handleMessage(started.sessionId, 'hello');
  assert.equal(msg.ok, false);
  assert.equal(msg.code, 'CONSENT_REQUIRED');
});

test('Seller-of-Record acknowledgment rejection blocks gate capture', () => {
  const orchestrator = new MerchantIntakeOrchestrator();
  const started = orchestrator.startSession({ tenantId: 'tenant-sor' });
  const denied = orchestrator.captureGates(started.sessionId, {
    consentAccepted: true,
    consentVersion: 'v1',
    sellerOfRecordAcknowledged: false,
  });
  assert.equal(denied.ok, false);
  assert.equal(denied.code, 'SOR_ACK_REQUIRED');
});

test('static FAQ routing is deterministic', () => {
  const { orchestrator } = freshStack();
  const sessionId = gatedSession(orchestrator);
  const res = orchestrator.handleMessage(sessionId, 'Can I redeem XP for cash?');
  assert.equal(res.ok, true);
  assert.equal(res.type, 'faq');
  assert.match(res.answer, /non-cash/i);
});

test('schema rejects client-supplied XP fields', () => {
  const { orchestrator } = freshStack();
  const sessionId = gatedSession(orchestrator);
  const bad = orchestrator.submitIntake(sessionId, { ...sampleMerchant(9), xp_amount: 999 });
  assert.equal(bad.ok, false);
  assert.equal(bad.code, 'SCHEMA_INVALID');
});

test('schema rejects whitespace-only required fields', () => {
  const { orchestrator } = freshStack();
  const sessionId = gatedSession(orchestrator);
  const bad = orchestrator.submitIntake(sessionId, {
    ...sampleMerchant(11),
    legal_name: '   ',
    address: '\t',
  });
  assert.equal(bad.ok, false);
  assert.equal(bad.code, 'SCHEMA_INVALID');
  assert.ok(bad.errors.some((e) => e.includes('legal_name')));
});

test('ChatKit client config refuses service_role material', () => {
  assert.throws(() => createChatKitClientConfig({ publishableKey: 'service_role_xxx', sessionId: 's' }));
  const cfg = createChatKitClientConfig({ publishableKey: 'sb_publishable_test', sessionId: 's' });
  assert.ok(!cfg.allowedClientTools.includes('award_xp'));
  assert.ok(cfg.forbiddenClientTools.includes('service_role'));
});

test('token consumption and estimated cost recorded per completed intake', () => {
  const { orchestrator } = freshStack();
  const sessionId = gatedSession(orchestrator);
  orchestrator.handleMessage(sessionId, 'What is the jotform fallback?');
  const result = orchestrator.submitIntake(sessionId, sampleMerchant(7));
  assert.equal(result.ok, true);
  assert.ok(result.usage.turns >= 2);
  assert.ok(result.usage.promptTokens > 0);
  assert.ok(result.usage.estimatedCostUsd >= 0);
  // Record for evidence packet (stdout captured by test report).
  console.log(
    JSON.stringify({
      evidence: 'intake_token_cost',
      turns: result.usage.turns,
      promptTokens: result.usage.promptTokens,
      completionTokens: result.usage.completionTokens,
      estimatedCostUsd: result.usage.estimatedCostUsd,
    }),
  );
});
