/**
 * STEVIE-WEB-ROUTER-001: Supabase Auth social-login adapter.
 * Non-production component. No service-role key, payment, or XP writer.
 * OAuth provider credentials and redirect allowlists must be configured
 * separately in Supabase Auth; this module cannot enable providers.
 */
const PROVIDERS = new Set(['google', 'apple']);

/** Build a redirect URL from the trusted application's configured origin. */
export function buildOAuthRedirect(siteOrigin, callbackPath = '/emerald-city/') {
  if (typeof siteOrigin !== 'string') throw new TypeError('Site origin required');
  const url = new URL(siteOrigin);
  if (url.origin !== siteOrigin.replace(/\/$/, '')) {
    throw new Error('Use only a site origin (no path, query, credentials, or fragment)');
  }
  const isLocal = ['localhost', '127.0.0.1'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(isLocal && url.protocol === 'http:')) {
    throw new Error('OAuth redirect must use HTTPS outside localhost');
  }
  if (typeof callbackPath !== 'string' || !callbackPath.startsWith('/') ||
      callbackPath.startsWith('//') || callbackPath.includes('\\') || callbackPath.includes('?') || callbackPath.includes('#')) {
    throw new Error('Unsafe OAuth callback path');
  }
  return new URL(callbackPath, `${url.origin}/`).toString();
}

/** Start Google or Apple OAuth. Call only after the player selects the provider. */
export async function startSocialSignIn({ supabase, provider, siteOrigin, callbackPath }) {
  if (!PROVIDERS.has(provider)) return { ok: false, code: 'PROVIDER_NOT_ALLOWED' };
  if (typeof supabase?.auth?.signInWithOAuth !== 'function') {
    return { ok: false, code: 'AUTH_CLIENT_UNAVAILABLE' };
  }
  let redirectTo;
  try { redirectTo = buildOAuthRedirect(siteOrigin, callbackPath); }
  catch { return { ok: false, code: 'REDIRECT_NOT_ALLOWED' }; }
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    if (error) return { ok: false, code: 'OAUTH_FAILED' };
    return { ok: true, provider, redirectStarted: true, url: data?.url ?? null };
  } catch {
    return { ok: false, code: 'OAUTH_FAILED' };
  }
}

/**
 * Read confirmed Supabase Auth identity, never client-provided player IDs.
 * The game server MUST independently validate the access JWT and quest proof
 * before awarding persistent XP; success here alone NEVER authorizes XP.
 */
export async function getSignedInPlayer({ supabase }) {
  if (typeof supabase?.auth?.getUser !== 'function') return { ok: false, code: 'AUTH_CLIENT_UNAVAILABLE' };
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user?.id) return { ok: false, code: 'NOT_SIGNED_IN' };
    return {
      ok: true,
      playerId: data.user.id,
      email: data.user.email ?? null,
      emailVerified: !!data.user.email_confirmed_at,
    };
  } catch { return { ok: false, code: 'AUTH_CHECK_FAILED' }; }
}

/** Optional guest mode remains local-only and awards no permanent server XP. */
export function createGuestSession() {
  return Object.freeze({ ok: true, mode: 'local_guest', permanentXpEnabled: false });
}
