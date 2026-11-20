import { recordUsage } from '../shared/usage.js';

export function createSession({ tenantId, maxTurns = 24, maxTokens = 12000 } = {}) {
  if (!tenantId || typeof tenantId !== 'string') {
    throw new Error('tenantId is required');
  }
  return {
    sessionId: crypto.randomUUID(),
    tenantId,
    createdAt: new Date().toISOString(),
    maxTurns,
    maxTokens,
    consent: null,
    sellerOfRecord: null,
    closed: false,
    usage: { promptTokens: 0, completionTokens: 0, turns: 0, estimatedCostUsd: 0 },
  };
}

export function assertSessionAllowsTurn(session, tokenBudget = 0) {
  if (!session || session.closed) {
    return { ok: false, code: 'SESSION_CLOSED', message: 'Session is closed.' };
  }
  if (session.usage.turns >= session.maxTurns) {
    return { ok: false, code: 'TURN_LIMIT', message: 'Per-session turn limit reached.' };
  }
  const projected =
    session.usage.promptTokens + session.usage.completionTokens + Math.max(0, Number(tokenBudget) || 0);
  if (projected > session.maxTokens) {
    return { ok: false, code: 'TOKEN_LIMIT', message: 'Server-side session token budget exceeded.' };
  }
  return { ok: true };
}

export function consumeTurn(session, usageDelta) {
  const gate = assertSessionAllowsTurn(session, (usageDelta?.promptTokens || 0) + (usageDelta?.completionTokens || 0));
  if (!gate.ok) return gate;
  recordUsage(session, usageDelta);
  return { ok: true, usage: session.usage };
}
