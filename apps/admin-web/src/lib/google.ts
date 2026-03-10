import { api, type PublicGoogleConfig } from './api';

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
const scriptCache = new Map<string, Promise<void>>();

function loadScript(src: string): Promise<void> {
  const existing = scriptCache.get(src);
  if (existing) return existing;

  const promise = new Promise<void>((resolve, reject) => {
    const found = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
    if (found) {
      if (found.dataset.loaded === 'true') {
        resolve();
        return;
      }
      found.addEventListener('load', () => resolve(), { once: true });
      found.addEventListener('error', () => reject(new Error(`Failed to load script: ${src}`)), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      resolve();
    }, { once: true });
    script.addEventListener('error', () => reject(new Error(`Failed to load script: ${src}`)), { once: true });
    document.head.appendChild(script);
  });

  scriptCache.set(src, promise);
  return promise;
}

export function getGoogleConfig(): Promise<PublicGoogleConfig> {
  if (!googleConfigCache) {
    googleConfigCache = api.platformSettings.googlePublicConfig();
  }
  return googleConfigCache;
}

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
