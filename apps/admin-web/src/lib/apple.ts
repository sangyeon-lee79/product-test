import { api, type PublicAppleConfig } from './api';
import { buildOAuthState, type OAuthMode } from './oauthRedirect';

let appleConfigCache: Promise<PublicAppleConfig> | null = null;

export function getAppleConfig(): Promise<PublicAppleConfig> {
  if (!appleConfigCache) {
    appleConfigCache = api.platformSettings.applePublicConfig();
  }
  return appleConfigCache;
}

// ─── Apple OAuth Redirect (authorization code flow) ─────────────────────────

export async function loginWithApple(mode: OAuthMode = 'login'): Promise<void> {
  const config = await getAppleConfig();
  if (!config.apple_service_id) {
    throw new Error('Apple Service ID가 설정되지 않았습니다.');
  }
  if (!config.apple_redirect_uri) {
    throw new Error('Apple Redirect URI가 설정되지 않았습니다.');
  }

  const params = new URLSearchParams({
    client_id: config.apple_service_id,
    redirect_uri: config.apple_redirect_uri,
    response_type: 'code',
    response_mode: 'query',
    scope: 'name email',
    state: buildOAuthState('apple', mode),
  });

  window.location.href = `https://appleid.apple.com/auth/authorize?${params.toString()}`;
}
