import { MerchantIntakeOrchestrator } from '../src/conversation/orchestrator.js';
import { XpEngine } from '../src/game/xp-engine.js';

export function sampleMerchant(i = 1) {
  return {
    legal_name: `Synthetic Merchant ${i} LLC`,
    storefront_name: `Synthetic Shop ${i}`,
    address: `${100 + i} Test St, Greenville, NC 27858`,
    requested_slug: `synthetic-shop-${i}-252`,
    contact_name: `Contact ${i}`,
    contact_email: `synthetic${i}@example.test`,
    signer_email: `signer${i}@example.test`,
    mission_type: 'checkin',
    mission_prompt: 'Enter the counter code posted near the register.',
    offer_text: 'Holiday sticker with purchase',
    package: 'holiday_quest_350',
  };
}

export function gatedSession(orchestrator, tenantId = 'tenant-a') {
  const started = orchestrator.startSession({ tenantId });
  const gates = orchestrator.captureGates(started.sessionId, {
    consentAccepted: true,
    consentVersion: 'HHP-MERCHANT-INTAKE-2026-11-20',
    consentCapturedAt: '2026-11-20T14:00:00.000Z',
    sellerOfRecordAcknowledged: true,
    sellerOfRecordNamedParty: 'Hip Hop Peoples DAO LLC (pilot draft — human HOLD on bank mapping)',
    sellerOfRecordAcknowledgedAt: '2026-11-20T14:00:01.000Z',
  });
  if (!gates.ok) throw new Error(`gate failure: ${gates.code}`);
  return started.sessionId;
}

export function freshStack() {
  return {
    orchestrator: new MerchantIntakeOrchestrator(),
    xp: new XpEngine(),
  };
}
