/**
 * Server-side usage accounting for intake sessions.
 * Token estimates are synthetic for local experimentation unless a real model provider is wired.
 */
export function estimateIntakeCostUsd({ promptTokens = 0, completionTokens = 0, ratePer1k = 0.002 } = {}) {
  const total = Number(promptTokens) + Number(completionTokens);
  if (!Number.isFinite(total) || total < 0) {
    throw new Error('Invalid token counts');
  }
  return Number(((total / 1000) * ratePer1k).toFixed(6));
}

export function recordUsage(session, delta) {
  if (!session || typeof session !== 'object') throw new Error('session required');
  const promptTokens = Math.max(0, Number(delta?.promptTokens || 0));
  const completionTokens = Math.max(0, Number(delta?.completionTokens || 0));
  session.usage = session.usage || { promptTokens: 0, completionTokens: 0, turns: 0 };
  session.usage.promptTokens += promptTokens;
  session.usage.completionTokens += completionTokens;
  session.usage.turns += 1;
  session.usage.estimatedCostUsd = estimateIntakeCostUsd(session.usage);
  return session.usage;
}
