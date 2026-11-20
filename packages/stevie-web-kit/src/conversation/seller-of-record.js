/**
 * Seller-of-Record acknowledgment gate.
 * Does not resolve conflicting bank/entity mappings — that remains a human HOLD.
 */
export function assertSellerOfRecordAck(gates) {
  if (!gates || gates.sellerOfRecordAcknowledged !== true) {
    return {
      ok: false,
      code: 'SOR_ACK_REQUIRED',
      message: 'Seller-of-Record acknowledgment is required before intake can enter the approval queue.',
    };
  }
  if (!gates.sellerOfRecordNamedParty || typeof gates.sellerOfRecordNamedParty !== 'string') {
    return {
      ok: false,
      code: 'SOR_PARTY_REQUIRED',
      message: 'Named Seller-of-Record party must be recorded on the acknowledgment.',
    };
  }
  return {
    ok: true,
    party: gates.sellerOfRecordNamedParty.trim(),
    acknowledgedAt: gates.sellerOfRecordAcknowledgedAt || new Date().toISOString(),
  };
}
