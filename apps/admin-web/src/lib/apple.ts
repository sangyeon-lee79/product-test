import { loadScript } from './scriptLoader';
import { api, type PublicAppleConfig } from './api';

declare global {
  interface Window {
    AppleID?: {
      auth: {
        init: (config: {
          clientId: string;
          scope: string;
          redirectURI: string;
          usePopup: boolean;
        }) => void;
        signIn: () => Promise<{
          authorization?: {
            id_token?: string;
            code?: string;
          };
          user?: {
            name?: { firstName?: string; lastName?: string };
            email?: string;
          };
        }>;
      };
    };
  }
}

const APPLE_JS_URL = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';

let appleConfigCache: Promise<PublicAppleConfig> | null = null;

export function getAppleConfig(): Promise<PublicAppleConfig> {
  if (!appleConfigCache) {
    appleConfigCache = api.platformSettings.applePublicConfig();
  }
  return appleConfigCache;
}

export async function ensureAppleSdk(): Promise<PublicAppleConfig> {
  const config = await getAppleConfig();
  if (!config.apple_service_id) {
    throw new Error('Apple Service ID is not configured');
  }

  await loadScript(APPLE_JS_URL);
  if (!window.AppleID) throw new Error('Failed to load Apple Sign In JS');

  window.AppleID.auth.init({
    clientId: config.apple_service_id,
    scope: 'name email',
    redirectURI: config.apple_redirect_uri || window.location.origin,
    usePopup: true,
  });

  return config;
}

export async function loginWithApple(): Promise<{ id_token: string; user_name?: string }> {
  await ensureAppleSdk();

  const result = await window.AppleID!.auth.signIn();
  const idToken = result.authorization?.id_token;
  if (!idToken) throw new Error('Apple Sign In did not return an id_token');

  const firstName = result.user?.name?.firstName || '';
  const lastName = result.user?.name?.lastName || '';
  const userName = [firstName, lastName].filter(Boolean).join(' ') || undefined;

  return { id_token: idToken, user_name: userName };
}
