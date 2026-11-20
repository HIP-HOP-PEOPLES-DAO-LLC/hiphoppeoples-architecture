import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { STOREFRONT_BRAND, TECHNOLOGY_CREDIT } from '../shared/brands.js';
import { validateMerchantIntake } from './schema.js';
import { assertConsent } from './consent.js';
import { assertSellerOfRecordAck } from './seller-of-record.js';
import { createSession, consumeTurn, assertSessionAllowsTurn } from './session.js';
import { ApprovalQueue } from './approval-queue.js';
import { routeFaq } from './faq-router.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_MANIFEST = JSON.parse(
  readFileSync(join(__dirname, '../../manifests/merchant-intake.v1.json'), 'utf8'),
);

/**
 * Server-side Agents SDK / ChatKit orchestration boundary.
 * Sprint 1 uses a deterministic orchestrator; live model calls require credentials not present here.
 */
export class MerchantIntakeOrchestrator {
  constructor({ manifest = DEFAULT_MANIFEST, queue = new ApprovalQueue() } = {}) {
    this.manifest = manifest;
    this.queue = queue;
    this.sessions = new Map();
  }

  startSession({ tenantId }) {
    const session = createSession({
      tenantId,
      maxTurns: this.manifest.gates.max_turns_per_session,
      maxTokens: this.manifest.gates.max_tokens_per_session,
    });
    this.sessions.set(session.sessionId, session);
    return {
      sessionId: session.sessionId,
      storefrontBrand: STOREFRONT_BRAND,
      technologyCredit: TECHNOLOGY_CREDIT,
      jotformFallback: this.manifest.jotform_fallback,
      requiresConsent: true,
      requiresSellerOfRecordAck: true,
    };
  }

  captureGates(sessionId, gates) {
    const session = this.sessions.get(sessionId);
    if (!session) return { ok: false, code: 'SESSION_NOT_FOUND' };

    const consent = assertConsent(gates);
    if (!consent.ok) return consent;
    const sor = assertSellerOfRecordAck(gates);
    if (!sor.ok) return sor;

    session.consent = consent;
    session.sellerOfRecord = sor;
    return { ok: true, sessionId };
  }

  handleMessage(sessionId, message, usageDelta = { promptTokens: 40, completionTokens: 60 }) {
    const session = this.sessions.get(sessionId);
    if (!session) return { ok: false, code: 'SESSION_NOT_FOUND' };
    if (!session.consent) {
      return { ok: false, code: 'CONSENT_REQUIRED', message: 'Capture consent before chat turns.' };
    }

    const turn = consumeTurn(session, usageDelta);
    if (!turn.ok) return turn;

    const faq = routeFaq(message, this.manifest.static_faq);
    if (faq.matched) {
      return { ok: true, type: 'faq', ...faq, usage: session.usage };
    }

    return {
      ok: true,
      type: 'prompt',
      message:
        'Continue providing merchant intake fields. When complete, call submitIntake with a schema-valid payload. Human approval is required before any transmission.',
      usage: session.usage,
    };
  }

  submitIntake(sessionId, payload) {
    const session = this.sessions.get(sessionId);
    if (!session) return { ok: false, code: 'SESSION_NOT_FOUND' };
    if (!session.consent) return { ok: false, code: 'CONSENT_REQUIRED' };
    if (!session.sellerOfRecord) return { ok: false, code: 'SOR_ACK_REQUIRED' };

    const turnGate = assertSessionAllowsTurn(session, 100);
    if (!turnGate.ok) return turnGate;

    const validated = validateMerchantIntake(payload, this.manifest);
    if (!validated.ok) return { ok: false, code: 'SCHEMA_INVALID', errors: validated.errors };

    const queued = this.queue.enqueue({
      tenantId: session.tenantId,
      payload: validated.value,
      consent: session.consent,
      sellerOfRecord: session.sellerOfRecord,
      sessionId: session.sessionId,
    });

    consumeTurn(session, { promptTokens: 80, completionTokens: 40 });
    session.closed = true;

    return {
      ok: true,
      duplicate: queued.duplicate,
      applicationId: queued.application.id,
      status: queued.application.status,
      transmitted: false,
      humanApprovalRequired: true,
      usage: session.usage,
      jotformFallback: this.manifest.jotform_fallback,
    };
  }
}

/**
 * ChatKit adapter contract — browser never receives service-role material.
 */
export function createChatKitClientConfig({ publishableKey, sessionId }) {
  if (!publishableKey || String(publishableKey).includes('service_role')) {
    throw new Error('Refusing ChatKit client config without a non-service-role publishable key');
  }
  return {
    sessionId,
    technologyCredit: TECHNOLOGY_CREDIT,
    storefrontBrand: STOREFRONT_BRAND,
    // Tools exposed to the model must not include privileged DB writers.
    allowedClientTools: ['submit_field', 'ask_faq', 'request_jotform_fallback'],
    forbiddenClientTools: ['award_xp', 'direct_sql', 'service_role'],
  };
}
