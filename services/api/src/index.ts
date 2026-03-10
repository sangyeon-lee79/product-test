// Pet Life API — Cloudflare Workers
// LLD §6.3 미들웨어 체인: CORS → Rate Limit → JWT → Role Guard → Handler

import type { Env } from './types';
import { err } from './types';
import { handleCors, corsHeaders } from './middleware/cors';
import { checkRateLimit } from './middleware/rateLimit';
import { handleHealth } from './routes/health';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);

      // 1. CORS preflight
      const corsResult = handleCors(request, env);
      if (corsResult) return corsResult;

      // 2. Rate Limit
      if (!await checkRateLimit(request, env)) {
        return addCors(err('Too Many Requests', 429, 'rate_limit'), request, env);
      }

      // 3. Route dispatch
      let response: Response;
      try {
        response = await dispatch(request, env, url);
      } catch {
        response = err('Internal Server Error', 500, 'internal_error');
      }

      // 4. CORS 헤더 부착
      return addCors(response, request, env);
    } catch {
      // Top-level safety: always return CORS headers even on catastrophic failure
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': request.headers.get('Origin') || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Vary': 'Origin',
      };
      return new Response(JSON.stringify({ success: false, error: 'Internal Server Error' }), { status: 500, headers });
    }
  },
} satisfies ExportedHandler<Env>;

function addCors(response: Response, request: Request, env: Env): Response {
  const headers = new Headers(response.headers);
  const cors = corsHeaders(request, env);
  for (const [k, v] of Object.entries(cors)) {
    if (v) headers.set(k, v);
  }
  return new Response(response.body, { status: response.status, headers });
}

async function dispatch(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname;

  // ─── 공개 엔드포인트 ───────────────────────────────────────────────
  // S0-3: Health Check
  if (path === '/api/v1/health' && request.method === 'GET') {
    return handleHealth(request, env);
  }

  // S1: i18n (공개)
  if (path.startsWith('/api/v1/i18n')) {
    const { handleI18n } = await import('./routes/i18n');
    return handleI18n(request, env, url);
  }

  // S2: 마스터 데이터 (공개)
  if (path.startsWith('/api/v1/master')) {
    const { handleMaster } = await import('./routes/master');
    return handleMaster(request, env, url);
  }

  // S4: 국가/통화 (공개)
  if (path.startsWith('/api/v1/countries')) {
    const { handleCountries } = await import('./routes/countries');
    return handleCountries(request, env, url);
  }

  // S11: 광고 설정 (공개)
  if (path.startsWith('/api/v1/ads')) {
    const { handleAds } = await import('./routes/ads');
    return handleAds(request, env, url);
  }

  // ─── 인증 필요 엔드포인트 ──────────────────────────────────────────
  // S5: 인증
  if (path.startsWith('/api/v1/auth')) {
    const { handleAuth } = await import('./routes/auth');
    return handleAuth(request, env, url);
  }

  // S5: 스토리지 (presigned URL)
  if (path.startsWith('/api/v1/storage')) {
    const { handleStorage } = await import('./routes/storage');
    return handleStorage(request, env, url);
  }

  // S6: Guardian 프로필
  if (path.startsWith('/api/v1/guardians')) {
    const { handleGuardians } = await import('./routes/guardians');
    return handleGuardians(request, env, url);
  }

  // S6~S7: 펫 + 기록
  if (path.startsWith('/api/v1/pets')) {
    const { handlePets } = await import('./routes/pets');
    return handlePets(request, env, url);
  }

  // S10: 피드
  if (path.startsWith('/api/v1/feeds')) {
    const { handleFeeds } = await import('./routes/feeds');
    return handleFeeds(request, env, url);
  }

  // S9: Provider (매장/서비스)
  if (path.startsWith('/api/v1/stores') || path.startsWith('/api/v1/services')) {
    const { handleProviders } = await import('./routes/providers');
    return handleProviders(request, env, url);
  }

  // S10: 예약
  if (path.startsWith('/api/v1/bookings')) {
    const { handleBookings } = await import('./routes/bookings');
    return handleBookings(request, env, url);
  }

  // S10: 친구/연결
  if (path.startsWith('/api/v1/friends')) {
    const { handleFriends } = await import('./routes/friends');
    return handleFriends(request, env, url);
  }

  // S10: Pet Album
  if (path.startsWith('/api/v1/pet-album')) {
    const { handlePetAlbum } = await import('./routes/petAlbum');
    return handlePetAlbum(request, env, url);
  }

  if (path.startsWith('/api/v1/account')) {
    const { handleMembers } = await import('./routes/members');
    return handleMembers(request, env, url);
  }

  // Device Management (public)
  if (path.startsWith('/api/v1/devices')) {
    const { handleDevices } = await import('./routes/devices');
    return handleDevices(request, env, url);
  }

  // Feed Catalog Management (public)
  if (path.startsWith('/api/v1/feed-catalog')) {
    const { handleFeedCatalog } = await import('./routes/feedCatalog');
    return handleFeedCatalog(request, env, url);
  }

  // ─── Admin 전용 (/api/v1/admin/*) ─────────────────────────────────
  if (path.startsWith('/api/v1/admin')) {
    return dispatchAdmin(request, env, url, path);
  }

  return err('Not Found', 404, 'not_found');
}

async function dispatchAdmin(request: Request, env: Env, url: URL, path: string): Promise<Response> {
  if (path.startsWith('/api/v1/admin/devices')) {
    const { handleDevices } = await import('./routes/devices');
    return handleDevices(request, env, url);
  }
  if (path.startsWith('/api/v1/admin/feed-catalog')) {
    const { handleFeedCatalog } = await import('./routes/feedCatalog');
    return handleFeedCatalog(request, env, url);
  }
  if (path.startsWith('/api/v1/admin/master')) {
    const { handleMaster } = await import('./routes/master');
    return handleMaster(request, env, url);
  }
  if (path.startsWith('/api/v1/admin/i18n')) {
    const { handleI18n } = await import('./routes/i18n');
    return handleI18n(request, env, url);
  }
  if (path.startsWith('/api/v1/admin/countries') || path.startsWith('/api/v1/admin/currencies')) {
    const { handleCountries } = await import('./routes/countries');
    return handleCountries(request, env, url);
  }
  if (path.startsWith('/api/v1/admin/ads')) {
    const { handleAds } = await import('./routes/ads');
    return handleAds(request, env, url);
  }
  if (path.startsWith('/api/v1/admin/members') || path.startsWith('/api/v1/admin/role-applications')) {
    const { handleMembers } = await import('./routes/members');
    return handleMembers(request, env, url);
  }
  if (path.startsWith('/api/v1/admin/settings/google')) {
    const { handlePlatformSettings } = await import('./routes/platformSettings');
    return handlePlatformSettings(request, env, url);
  }
  return err('Not Found', 404, 'not_found');
}
