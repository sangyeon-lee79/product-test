import { loadScript } from './scriptLoader';
import { api, type PublicGoogleConfig } from './api';
import { buildOAuthState, type OAuthMode } from './oauthRedirect';

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            ux_mode?: 'popup' | 'redirect';
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: Record<string, string | number | boolean>,
          ) => void;
        };
      };
      maps?: {
        places?: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: Record<string, unknown>,
          ) => {
            addListener: (eventName: string, handler: () => void) => { remove: () => void };
            getPlace: () => {
              formatted_address?: string;
              place_id?: string;
              geometry?: {
                location?: {
                  lat: () => number;
                  lng: () => number;
                };
              };
            };
          };
        };
      };
    };
  }
}

let googleConfigCache: Promise<PublicGoogleConfig> | null = null;

export function getGoogleConfig(): Promise<PublicGoogleConfig> {
  if (!googleConfigCache) {
    googleConfigCache = api.platformSettings.googlePublicConfig();
  }
  return googleConfigCache;
}

// ─── Google Places (unchanged) ──────────────────────────────────────────────

export async function ensureGoogleIdentityScript(): Promise<PublicGoogleConfig> {
  const config = await getGoogleConfig();
  await testGoogleIdentityClient(config.google_oauth_client_id);
  return config;
}

export async function ensureGooglePlacesScript(): Promise<PublicGoogleConfig> {
  const config = await getGoogleConfig();
  await testGooglePlacesKey(config.google_places_api_key);
  return config;
}

export async function testGoogleIdentityClient(clientId: string): Promise<void> {
  if (!clientId.trim()) {
    throw new Error('Google OAuth Client ID가 설정되지 않았습니다.');
  }
  await loadScript('https://accounts.google.com/gsi/client');
  const googleId = window.google?.accounts?.id;
  if (!googleId) {
    throw new Error('Google 로그인 스크립트를 불러오지 못했습니다.');
  }
  googleId.initialize({
    client_id: clientId,
    callback: () => undefined,
    ux_mode: 'popup',
  });
}

export async function testGooglePlacesKey(apiKey: string): Promise<void> {
  if (!apiKey.trim()) {
    throw new Error('Google Places API Key가 설정되지 않았습니다.');
  }
  const src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
  await loadScript(src);
  if (!window.google?.maps?.places?.Autocomplete) {
    throw new Error('Google Places 스크립트 로드에 실패했습니다.');
  }
}

// ─── Google OAuth Redirect (authorization code flow) ────────────────────────

export async function loginWithGoogle(mode: OAuthMode = 'login'): Promise<void> {
  const config = await getGoogleConfig();
  if (!config.google_oauth_client_id) {
    throw new Error('Google OAuth Client ID가 설정되지 않았습니다.');
  }
  if (!config.google_oauth_redirect_uri) {
    throw new Error('Google OAuth Redirect URI가 설정되지 않았습니다.');
  }

  const params = new URLSearchParams({
    client_id: config.google_oauth_client_id,
    redirect_uri: config.google_oauth_redirect_uri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    state: buildOAuthState('google', mode),
    prompt: 'select_account',
  });

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
