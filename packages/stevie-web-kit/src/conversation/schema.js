const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG_RE = /^[a-z0-9-]{3,50}$/;

/**
 * Strict JSON schema validation for merchant intake payloads.
 * Rejects unknown keys and client-supplied xp/player fields.
 */
export function validateMerchantIntake(payload, manifest) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { ok: false, errors: ['payload must be an object'] };
  }

  const forbidden = ['xp', 'xp_amount', 'player_id', 'auth_user_id', 'service_role_key'];
  for (const key of forbidden) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      return { ok: false, errors: [`forbidden client field: ${key}`] };
    }
  }

  const allowed = new Set(manifest.fields.map((f) => f.id));
  const errors = [];
  for (const key of Object.keys(payload)) {
    if (!allowed.has(key)) errors.push(`unknown field: ${key}`);
  }

  const normalized = {};
  for (const field of manifest.fields) {
    const raw = payload[field.id];
    if (raw === undefined || raw === null) {
      if (field.required) errors.push(`missing required field: ${field.id}`);
      continue;
    }
    const value = String(raw).trim();
    if (value === '') {
      if (field.required) errors.push(`missing required field: ${field.id}`);
      continue;
    }
    if (field.max && value.length > field.max) {
      errors.push(`${field.id} exceeds max length ${field.max}`);
      continue;
    }
    if (field.type === 'email' && !EMAIL_RE.test(value.toLowerCase())) {
      errors.push(`${field.id} must be a valid email`);
      continue;
    }
    if (field.type === 'slug' && !SLUG_RE.test(value)) {
      errors.push(`${field.id} must match slug pattern`);
      continue;
    }
    if ((field.type === 'enum' || field.values) && field.values && !field.values.includes(value)) {
      errors.push(`${field.id} must be one of: ${field.values.join(', ')}`);
      continue;
    }
    normalized[field.id] = field.type === 'email' ? value.toLowerCase() : value;
  }

  return errors.length ? { ok: false, errors } : { ok: true, value: normalized };
}
