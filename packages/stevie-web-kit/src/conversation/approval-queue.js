/**
 * In-memory human approval queue.
 * Submissions are never transmitted to merchants/processors from this layer.
 */
export class ApprovalQueue {
  constructor() {
    /** @type {Map<string, object>} */
    this.byId = new Map();
    /** @type {Map<string, string>} */
    this.idempotency = new Map();
  }

  _fingerprint(tenantId, payload) {
    const key = JSON.stringify({
      tenantId,
      legal_name: payload.legal_name,
      contact_email: payload.contact_email,
      requested_slug: payload.requested_slug,
      package: payload.package,
    });
    return key;
  }

  enqueue({ tenantId, payload, consent, sellerOfRecord, sessionId }) {
    if (!tenantId) throw new Error('tenantId required');
    const fp = this._fingerprint(tenantId, payload);
    if (this.idempotency.has(fp)) {
      const existingId = this.idempotency.get(fp);
      return {
        ok: true,
        duplicate: true,
        application: this.byId.get(existingId),
      };
    }

    const id = crypto.randomUUID();
    const application = {
      id,
      tenantId,
      sessionId,
      status: 'pending_human_approval',
      payload: { ...payload },
      consent,
      sellerOfRecord,
      createdAt: new Date().toISOString(),
      transmitted: false,
    };
    this.byId.set(id, application);
    this.idempotency.set(fp, id);
    return { ok: true, duplicate: false, application };
  }

  listForTenant(tenantId) {
    return [...this.byId.values()].filter((a) => a.tenantId === tenantId);
  }

  get(id) {
    return this.byId.get(id) || null;
  }

  /**
   * Human gate only — does not call external APIs.
   */
  approve(id, reviewerId) {
    const app = this.byId.get(id);
    if (!app) return { ok: false, code: 'NOT_FOUND' };
    if (app.tenantId && reviewerId === `cross-tenant:${app.tenantId}`) {
      return { ok: false, code: 'FORBIDDEN' };
    }
    app.status = 'approved_held';
    app.reviewedAt = new Date().toISOString();
    app.reviewerId = reviewerId;
    app.transmitted = false;
    return { ok: true, application: app };
  }
}
