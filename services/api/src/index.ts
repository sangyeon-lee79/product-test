// Pet Life API — Cloudflare Workers
// LLD §6.3 미들웨어 체인: CORS → Rate Limit → JWT → Role Guard → Handler

import type { Env } from './types';
import { err } from './types';
import { createDbAdapter } from './db/adapter';
import { handleCors, corsHeaders } from './middleware/cors';
import { checkRateLimit } from './middleware/rateLimit';
import { handleHealth } from './routes/health';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      // Initialize DB adapter: Hyperdrive (TCP pool) preferred, DATABASE_URL as fallback
      const connectionString = env.HYPERDRIVE?.connectionString || env.DATABASE_URL;
      if (!connectionString) {
        return err('Database not configured', 500, 'db_config_error');
      }
      const appEnv: Env = { ...env, DB: createDbAdapter(connectionString) };

      const url = new URL(request.url);

      // 1. CORS preflight
      const corsResult = handleCors(request, appEnv);
      if (corsResult) return corsResult;

      // 2. Rate Limit
      if (!await checkRateLimit(request, appEnv)) {
        return addCors(err('Too Many Requests', 429, 'rate_limit'), request, appEnv);
      }

      // 3. Route dispatch
      let response: Response;
      try {
        response = await dispatch(request, appEnv, url);
      } catch (e) {
        const detail = e instanceof Error ? e.message : String(e);
        response = err(`Internal Server Error: ${detail}`, 500, 'internal_error');
      }

      // 4. CORS 헤더 부착
      return addCors(response, request, appEnv);
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
  // Prevent browser from caching API responses (unless endpoint sets its own Cache-Control)
  if (!headers.has('Cache-Control')) {
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
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

  // Platform configs (public: Google/Kakao/Apple)
  if (path === '/api/v1/google/config' || path === '/api/v1/kakao/config' || path === '/api/v1/apple/config') {
    const { handlePlatformSettings } = await import('./routes/platformSettings');
    return handlePlatformSettings(request, env, url);
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

  // Feed Registration Requests (guardian, before /feeds prefix)
  if (path.startsWith('/api/v1/feed-requests')) {
    const { handleFeedRequests } = await import('./routes/feedRequests');
    return handleFeedRequests(request, env, url);
  }

  // S10: 피드
  if (path.startsWith('/api/v1/feeds')) {
    const { handleFeeds } = await import('./routes/feeds');
    return handleFeeds(request, env, url);
  }

  // Dummy Stores (public, demo data)
  if (path.startsWith('/api/v1/dummy-stores')) {
    const { handleDummyStores } = await import('./routes/dummyStores');
    return handleDummyStores(request, env, url);
  }

  // S9: Stores + Services
  if (path.startsWith('/api/v1/stores') || path.startsWith('/api/v1/services')) {
    const { handleStores } = await import('./routes/stores');
    return handleStores(request, env, url);
  }

  // S9: Provider profile
  if (path.startsWith('/api/v1/providers')) {
    const { handleProviders } = await import('./routes/providers');
    return handleProviders(request, env, url);
  }

  // Appointments (grooming booking flow)
  if (path.startsWith('/api/v1/appointments')) {
    const { handleAppointments } = await import('./routes/appointments');
    return handleAppointments(request, env, url);
  }

  // Grooming Records
  if (path.startsWith('/api/v1/grooming-records')) {
    const { handleGroomingRecords } = await import('./routes/groomingRecords');
    return handleGroomingRecords(request, env, url);
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

  // Notifications
  if (path.startsWith('/api/v1/notifications')) {
    const { handleNotifications } = await import('./routes/notifications');
    return handleNotifications(request, env, url);
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

  // Supplement Catalog Management (public)
  if (path.startsWith('/api/v1/supplement-catalog')) {
    const { handleSupplementCatalog } = await import('./routes/supplementCatalog');
    return handleSupplementCatalog(request, env, url);
  }

  // Medicine Catalog Management (public)
  if (path.startsWith('/api/v1/medicine-catalog')) {
    const { handleMedicineCatalog } = await import('./routes/medicineCatalog');
    return handleMedicineCatalog(request, env, url);
  }

  // ─── Admin 전용 (/api/v1/admin/*) ─────────────────────────────────
  if (path.startsWith('/api/v1/admin')) {
    return dispatchAdmin(request, env, url, path);
  }

  return err('Not Found', 404, 'not_found');
}

async function dispatchAdmin(request: Request, env: Env, url: URL, path: string): Promise<Response> {
  if (path.startsWith('/api/v1/admin/dashboard')) {
    const { handleDashboard } = await import('./routes/dashboard');
    return handleDashboard(request, env, url);
  }
  if (path.startsWith('/api/v1/admin/stores')) {
    const { handleStores } = await import('./routes/stores');
    return handleStores(request, env, url);
  }
  if (path.startsWith('/api/v1/admin/devices')) {
    const { handleDevices } = await import('./routes/devices');
    return handleDevices(request, env, url);
  }
  if (path.startsWith('/api/v1/admin/feed-requests')) {
    const { handleFeedRequests } = await import('./routes/feedRequests');
    return handleFeedRequests(request, env, url);
  }
  if (path.startsWith('/api/v1/admin/feed-catalog')) {
    const { handleFeedCatalog } = await import('./routes/feedCatalog');
    return handleFeedCatalog(request, env, url);
  }
  if (path.startsWith('/api/v1/admin/supplement-catalog')) {
    const { handleSupplementCatalog } = await import('./routes/supplementCatalog');
    return handleSupplementCatalog(request, env, url);
  }
  if (path.startsWith('/api/v1/admin/medicine-catalog')) {
    const { handleMedicineCatalog } = await import('./routes/medicineCatalog');
    return handleMedicineCatalog(request, env, url);
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
  if (path.startsWith('/api/v1/admin/feed-card-settings')) {
    const { handleFeedCardSettings } = await import('./routes/feedCardSettings');
    return handleFeedCardSettings(request, env, url);
  }
  if (path.startsWith('/api/v1/admin/settings/')) {
    const { handlePlatformSettings } = await import('./routes/platformSettings');
    return handlePlatformSettings(request, env, url);
  }
  return err('Not Found', 404, 'not_found');
}
