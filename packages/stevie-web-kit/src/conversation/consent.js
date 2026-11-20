/**
 * Consent must be captured before conversational intake proceeds.
 */
export function assertConsent(gates) {
  if (!gates || gates.consentAccepted !== true) {
    return {
      ok: false,
      code: 'CONSENT_REQUIRED',
      message: 'Consent must be accepted before conversational merchant intake begins.',
    };
  }
  if (!gates.consentVersion || typeof gates.consentVersion !== 'string') {
    return {
      ok: false,
      code: 'CONSENT_VERSION_REQUIRED',
      message: 'A consent notice version is required.',
    };
  }
  return {
    ok: true,
    capturedAt: gates.consentCapturedAt || new Date().toISOString(),
    version: gates.consentVersion,
  };
}
