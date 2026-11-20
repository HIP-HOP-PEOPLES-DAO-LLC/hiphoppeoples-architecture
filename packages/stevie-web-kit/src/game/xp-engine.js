/**
 * Deterministic Emerald City XP engine (local reference implementation).
 * Mirrors candidate SQL semantics in migrations/ — no LLM XP, no client amounts.
 */

export class XpEngine {
  constructor() {
    /** @type {Map<string, object>} questId -> definition */
    this.quests = new Map();
    /** @type {Array<object>} append-only */
    this.ledger = [];
    /** @type {Map<string, number>} playerId -> balance */
    this.balances = new Map();
    /** @type {Set<string>} request idempotency keys */
    this.seen = new Set();
    /** @type {Set<string>} completion keys: tenant:player:quest */
    this.completions = new Set();
    this._appendOnly = true;
  }

  defineQuest(quest) {
    if (!quest?.questId || !Number.isInteger(quest.xpReward) || quest.xpReward <= 0) {
      throw new Error('quest requires questId and positive integer xpReward');
    }
    if (quest.cashRedeemable || quest.transferable || quest.purchasable) {
      throw new Error('XP rewards must not be purchasable, transferable, or cash-redeemable');
    }
    this.quests.set(quest.questId, {
      questId: quest.questId,
      title: quest.title || quest.questId,
      xpReward: quest.xpReward,
      tenantId: quest.tenantId || 'global',
      active: quest.active !== false,
      storeCode: quest.storeCode || `VERIFY-${quest.questId}`,
    });
    return this.quests.get(quest.questId);
  }

  /**
   * Server-verified completion proof. Client XP amounts are ignored/rejected.
   */
  verifyCompletion({ playerId, questId, tenantId, proof }) {
    if (!playerId || typeof playerId !== 'string') {
      return { ok: false, code: 'UNAUTHORIZED', message: 'Verified player identity required.' };
    }
    if (!proof || proof.kind !== 'store_code' || !proof.code) {
      return { ok: false, code: 'INVALID_PROOF', message: 'Quest proof missing or invalid.' };
    }
    if (proof.claimedXp !== undefined) {
      return { ok: false, code: 'CLIENT_XP_FORBIDDEN', message: 'Client-supplied XP amounts are rejected.' };
    }
    if (proof.claimedPlayerId && proof.claimedPlayerId !== playerId) {
      return { ok: false, code: 'PLAYER_MISMATCH', message: 'Client-supplied player IDs are rejected.' };
    }
    const quest = this.quests.get(questId);
    if (!quest || !quest.active) return { ok: false, code: 'QUEST_NOT_FOUND' };
    if (quest.tenantId !== 'global' && quest.tenantId !== tenantId) {
      return { ok: false, code: 'CROSS_TENANT', message: 'Quest does not belong to tenant.' };
    }
    // Deterministic proof: code must equal reverse of questId hash stub for local tests,
    // or an explicitly registered store code on the quest.
    const expected = quest.storeCode || `VERIFY-${quest.questId}`;
    if (String(proof.code) !== expected) {
      return { ok: false, code: 'PROOF_FAILED' };
    }
    return { ok: true, quest };
  }

  /**
   * Idempotent award. Completion uniqueness is (tenant, player, quest) and cannot
   * be bypassed by rotating a caller-supplied idempotency key.
   */
  awardXp({ playerId, questId, tenantId, proof, idempotencyKey }) {
    const verified = this.verifyCompletion({ playerId, questId, tenantId, proof });
    if (!verified.ok) return verified;

    const completionKey = `${tenantId}:${playerId}:${questId}`;
    const requestKey = idempotencyKey || completionKey;

    const priorByCompletion = this.ledger.find((e) => e.completionKey === completionKey);
    if (priorByCompletion || this.completions.has(completionKey)) {
      return {
        ok: true,
        duplicate: true,
        awarded: 0,
        balance: this.balances.get(playerId) || 0,
        event: priorByCompletion || this.ledger.find((e) => e.idempotencyKey === requestKey),
      };
    }

    if (this.seen.has(requestKey)) {
      const prior = this.ledger.find((e) => e.idempotencyKey === requestKey);
      return {
        ok: true,
        duplicate: true,
        awarded: 0,
        balance: this.balances.get(playerId) || 0,
        event: prior,
      };
    }

    const amount = verified.quest.xpReward;
    const event = Object.freeze({
      eventId: crypto.randomUUID(),
      playerId,
      questId,
      tenantId,
      amount,
      idempotencyKey: requestKey,
      completionKey,
      createdAt: new Date().toISOString(),
      source: 'server_verified_quest',
    });

    this.seen.add(requestKey);
    this.completions.add(completionKey);
    this.ledger.push(event);
    this.balances.set(playerId, (this.balances.get(playerId) || 0) + amount);
    return {
      ok: true,
      duplicate: false,
      awarded: amount,
      balance: this.balances.get(playerId),
      event,
    };
  }

  /** Append-only enforcement for local engine. */
  mutateLedger() {
    if (this._appendOnly) {
      return { ok: false, code: 'APPEND_ONLY', message: 'Direct ledger mutation is forbidden.' };
    }
    return { ok: true };
  }

  tryDirectWrite() {
    return {
      ok: false,
      code: 'UNAUTHORIZED_DIRECT_WRITE',
      message: 'XP mutation is restricted to awardXp with verified identity and quest proof.',
    };
  }

  getLedger() {
    return [...this.ledger];
  }

  getBalance(playerId) {
    return this.balances.get(playerId) || 0;
  }
}
