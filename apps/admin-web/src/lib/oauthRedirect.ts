/**
 * Shared OAuth redirect utilities.
 * All OAuth providers (Google, Kakao, Apple) use the same pattern:
 *   1. Frontend redirects to provider with state=<provider>:<mode>
 *   2. Provider redirects back with ?code=xxx&state=<provider>:<mode>
 *   3. Frontend extracts code and calls API to exchange
 */

export type OAuthProvider = 'google' | 'kakao' | 'apple';
export type OAuthMode = 'login' | 'signup';

export type OAuthRedirectResult = {
  provider: OAuthProvider;
  mode: OAuthMode;
  code: string;
};

export function buildOAuthState(provider: OAuthProvider, mode: OAuthMode): string {
  return `${provider}:${mode}`;
}

/**
 * Check if the current URL has an OAuth redirect result.
 * URL looks like: https://domain/?code=xxx&state=google:login#/
 */
export function getOAuthRedirectResult(): OAuthRedirectResult | null {
  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');
  if (!code) return null;

  const state = url.searchParams.get('state') || '';
  const [provider, mode] = state.split(':');

  if (provider !== 'google' && provider !== 'kakao' && provider !== 'apple') {
    // Legacy Kakao redirect (no state) — assume login
    return { provider: 'kakao', mode: 'login', code };
  }
  return {
    provider: provider as OAuthProvider,
    mode: (mode === 'signup' ? 'signup' : 'login') as OAuthMode,
    code,
  };
}

/** Remove ?code= and ?state= from URL without page reload */
export function clearOAuthRedirectParams(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('code');
  url.searchParams.delete('state');
  window.history.replaceState({}, '', url.toString());
}
