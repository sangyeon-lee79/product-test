import { loadScript } from './scriptLoader';
import { api, type PublicKakaoConfig } from './api';
import { buildOAuthState, type OAuthMode } from './oauthRedirect';

declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean;
      init: (key: string) => void;
      Auth?: {
        authorize: (options: { redirectUri: string; scope?: string; state?: string }) => void;
      };
    };
  }
}

const KAKAO_SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js';

let kakaoConfigCache: Promise<PublicKakaoConfig> | null = null;

export function getKakaoConfig(): Promise<PublicKakaoConfig> {
  if (!kakaoConfigCache) {
    kakaoConfigCache = api.platformSettings.kakaoPublicConfig();
  }
  return kakaoConfigCache;
}

export async function ensureKakaoSdk(): Promise<PublicKakaoConfig> {
  const config = await getKakaoConfig();
  if (!config.kakao_javascript_key) {
    throw new Error('Kakao JavaScript Key is not configured');
  }

  await loadScript(KAKAO_SDK_URL);
  const kakao = window.Kakao;
  if (!kakao) throw new Error('Failed to load Kakao SDK');

  if (!kakao.isInitialized()) {
    kakao.init(config.kakao_javascript_key);
  }

  return config;
}

export async function loginWithKakao(mode: OAuthMode = 'login'): Promise<void> {
  const config = await ensureKakaoSdk();
  if (!config.kakao_redirect_uri) {
    throw new Error('Kakao Redirect URI is not configured');
  }

  window.Kakao?.Auth?.authorize({
    redirectUri: config.kakao_redirect_uri,
    scope: 'profile_nickname,profile_image,account_email',
    state: buildOAuthState('kakao', mode),
  });
}
