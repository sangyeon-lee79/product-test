// Admin Web API 클라이언트

import { getApiBase } from './apiBase';
export type {
  I18nRow, MasterCategory, MasterItem, Country, Currency,
  Pet, PetWeightLog, WeightSummary,
  PetDiseaseHistory, PetDiseaseDevice,
  PetGlucoseLog, GlucoseSummary,
  PetHealthMeasurementLog, HealthMeasurementSummary,
  PetExerciseLog, ExerciseSummary, FriendPet,
  Booking, FeedPost, FeedComment, PetAlbumMedia,
  FriendRequest, FriendConnection,
  DeviceType, DeviceManufacturer, DeviceBrand, DeviceModel, MeasurementUnit, GuardianDevice,
  FeedType, FeedManufacturer, FeedBrand, FeedModel,
  PetFeed, FeedNutrition, FeedingLog, FeedingMixFavorite,
  FeedRegistrationRequest,
  PetLog, GlucoseAlert, MemberSummary, MemberRecord, GoogleSettingItem, PublicGoogleConfig, OAuthLoginResponse,
  PublicKakaoConfig, PublicAppleConfig, PlatformSettingItem,
  ProviderProfile, DashboardStats, PetReport,
} from '../types/api';
import type {
  I18nRow, MasterCategory, MasterItem, Country, Currency,
  Pet, PetWeightLog, WeightSummary,
  PetDiseaseHistory, PetDiseaseDevice,
  PetGlucoseLog, GlucoseSummary,
  PetHealthMeasurementLog, HealthMeasurementSummary,
  PetExerciseLog, ExerciseSummary, FriendPet,
  Booking, FeedPost, FeedComment, PetAlbumMedia,
  FriendRequest, FriendConnection,
  DeviceType, DeviceManufacturer, DeviceBrand, DeviceModel, MeasurementUnit, GuardianDevice,
  FeedType, FeedManufacturer, FeedBrand, FeedModel,
  PetFeed, FeedNutrition, FeedingLog, FeedingMixFavorite,
  FeedRegistrationRequest,
  PetLog, GlucoseAlert, MemberSummary, MemberRecord, GoogleSettingItem, PublicGoogleConfig, OAuthLoginResponse,
  PublicKakaoConfig, PublicAppleConfig, PlatformSettingItem,
  ProviderProfile, DashboardStats, PetReport,
} from '../types/api';

const API_BASE = getApiBase();
const TIMEOUT_MS = 15_000;

// i18n translator — I18nProvider가 로드된 후 initApiTranslator()로 주입됨
// 주입 전에는 한국어 fallback 문자열 그대로 사용
type TFn = (key: string, fallback?: string) => string;
let _t: TFn = (_key, fb) => fb ?? _key;
export function initApiTranslator(fn: TFn) { _t = fn; }

function getToken(): string | null {
  return localStorage.getItem('access_token');
}

function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4 !== 0) b64 += '=';
    const payload = JSON.parse(atob(b64)) as { exp: number };
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
}

export function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_role');
}

export function isLoggedIn(): boolean {
  const token = getToken();
  if (!token) return false;
  if (isTokenExpired(token)) {
    clearTokens();
    return false;
  }
  return true;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const url = `${API_BASE}${path}`;
  let res: Response;
  try {
    res = await fetch(url, { ...options, headers, signal: controller.signal });
  } catch (e) {
    clearTimeout(timer);
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new Error(_t('common.err.server', '서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.'));
    }
    throw new Error(_t('common.err.network', '데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'));
  }
  clearTimeout(timer);

  const contentType = res.headers.get('content-type') || '';
  const raw = await res.text();
  let json: { success?: boolean; data?: T; error?: string } | null = null;
  if (raw) {
    if (contentType.includes('application/json')) {
      try {
        json = JSON.parse(raw) as { success?: boolean; data?: T; error?: string };
      } catch {
        throw new Error(_t('common.err.parse', '서버 응답을 해석하지 못했습니다. 잠시 후 다시 시도해주세요.'));
      }
    } else {
      throw new Error(_t('common.err.content_type', '서버 응답 형식이 올바르지 않습니다. 잠시 후 다시 시도해주세요.'));
    }
  }

  if (res.status === 401) {
    clearTokens();
    window.location.href = '/#/';
    throw new Error(_t('common.err.session_expired', '세션이 만료되었습니다. 다시 로그인해주세요.'));
  }

  if (!res.ok) {
    if (json?.error) throw new Error(json.error);
    if (res.status >= 500) throw new Error(_t('common.err.server', '서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.'));
    if (res.status === 404) throw new Error(_t('common.err.not_found', '요청한 데이터를 찾을 수 없습니다.'));
    if (res.status === 403) throw new Error(_t('common.err.forbidden', '해당 작업 권한이 없습니다.'));
    throw new Error(_t('common.err.request_failed', '요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.'));
  }
  if (!json) {
    throw new Error(_t('common.err.no_response', '서버 응답 형식을 확인하지 못했습니다.'));
  }
  if (!json.success) throw new Error(json.error || _t('common.err.general', '요청 처리에 실패했습니다.'));
  return json.data as T;
}

function buildQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== false && v !== '' && v !== 0) q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : '';
}

export const api = {
  // Auth
  testLogin: (email: string) =>
    request<{ user_id: string; role: string; access_token: string; refresh_token: string }>
      ('/api/v1/auth/test-login', { method: 'POST', body: JSON.stringify({ email }) }),
  login: (email: string, password: string) =>
    request<{ user_id: string; role: string; access_token: string; refresh_token: string }>
      ('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  oauthLogin: (provider: 'google' | 'kakao' | 'apple', credential: string, extra?: { user_name?: string }) =>
    request<OAuthLoginResponse>('/api/v1/auth/oauth', {
      method: 'POST',
      body: JSON.stringify({
        provider,
        ...(provider === 'kakao' ? { code: credential } : { id_token: credential }),
        ...(extra?.user_name ? { user_name: extra.user_name } : {}),
      }),
    }),
  signup: (payload: { email: string; role: string; display_name: string; country_code: string; language?: string; timezone?: string }) =>
    request<{
      user_id: string;
      role: string;
      access_token: string;
      refresh_token: string;
      onboarding: {
        country_code: string;
        default_language: string;
        default_currency_code: string | null;
        profile_created: boolean;
      };
    }>('/api/v1/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  signupV2: (payload: {
    email: string;
    password: string;
    display_name: string;
    nickname?: string;
    phone?: string;
    address_line?: string;
    address_place_id?: string;
    address_lat?: number;
    address_lng?: number;
    country_code: string;
    language?: string;
    timezone?: string;
    has_pets?: boolean;
    pet_count?: number;
    interested_pet_types?: string[];
    notifications_booking?: boolean;
    notifications_health?: boolean;
    marketing_opt_in?: boolean;
    terms_agreed?: boolean;
    public_profile?: boolean;
    public_id?: string;
    role_application?: {
      requested_role?: 'provider';
      business_category_l1_id?: string | null;
      business_category_l2_id?: string | null;
      business_category_l3_id?: string | null;
      pet_type_l1_id?: string | null;
      pet_type_l2_id?: string | null;
      business_registration_no?: string | null;
      operating_hours?: string | null;
      certifications?: string[];
      supported_pet_types?: string[];
      address_line?: string | null;
      address_place_id?: string | null;
      address_lat?: number | null;
      address_lng?: number | null;
    };
  }) =>
    request<{
      user_id: string;
      role: string;
      access_token: string;
      refresh_token: string;
      onboarding: {
        country_code: string;
        default_language: string;
        default_currency_code: string | null;
        profile_created: boolean;
      };
    }>('/api/v1/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  applyRole: (payload: {
    requested_role: 'provider';
    business_category_l1_id: string;
    business_category_l2_id?: string | null;
    business_category_l3_id?: string | null;
    pet_type_l1_id?: string | null;
    pet_type_l2_id?: string | null;
    business_registration_no?: string | null;
    operating_hours?: string | null;
    certifications?: string[];
    supported_pet_types?: string[];
    address_line?: string | null;
    address_place_id?: string | null;
    address_lat?: number | null;
    address_lng?: number | null;
  }) => request<{ id: string; status: string }>('/api/v1/account/role-applications', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  // Health
  health: () => request<{ status: string; environment: string; version?: string; timestamp?: string; services: Record<string, string> }>('/api/v1/health'),

  // i18n
  i18n: {
    list: (params?: { page?: number; prefix?: string; limit?: number; active_only?: boolean }) =>
      request<{ items: I18nRow[]; total: number; page: number; limit: number }>(
        `/api/v1/admin/i18n${buildQuery({ page: params?.page, prefix: params?.prefix, limit: params?.limit, active_only: params?.active_only })}`,
      ),
    create: (data: Partial<I18nRow>) =>
      request<I18nRow>('/api/v1/admin/i18n', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<I18nRow>) =>
      request<I18nRow>(`/api/v1/admin/i18n/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deactivate: (id: string) =>
      request<{ id: string; is_active: boolean }>(`/api/v1/admin/i18n/${id}`, { method: 'DELETE' }),
    translate: (text: string, existing?: Record<string, string>) =>
      request<{ translations: Record<string, string>; meta?: Record<string, unknown> }>(
        '/api/v1/admin/i18n/translate',
        { method: 'POST', body: JSON.stringify({ text, existing }) },
      ),
  },

  // Master
  master: {
    public: {
      categories: () => request<Array<{ id: string; key: string; sort_order: number; is_active: number }>>('/api/v1/master/categories'),
      diseaseGroups: (lang?: string) =>
        request<MasterItem[]>(`/api/v1/master/disease-groups${buildQuery({ lang })}`),
      diseases: (groupId?: string | null, lang?: string) =>
        request<MasterItem[]>(`/api/v1/master/diseases${buildQuery({ group_id: groupId, lang })}`),
      allergyGroups: (lang?: string) =>
        request<MasterItem[]>(`/api/v1/master/allergy-groups${buildQuery({ lang })}`),
      allergies: (groupId?: string | null, lang?: string) =>
        request<MasterItem[]>(`/api/v1/master/allergies${buildQuery({ group_id: groupId, lang })}`),
      items: (
        categoryKey: string,
        parentId?: string | null,
        lang?: string,
        filters?: {
          item_level?: string;
          business_category_l1_id?: string | null;
          pet_type_l1_id?: string | null;
          pet_type_l2_id?: string | null;
        },
      ) =>
        request<MasterItem[]>(`/api/v1/master/items${buildQuery({
          category_key: categoryKey,
          parent_id: parentId,
          lang,
          item_level: filters?.item_level,
          business_category_l1_id: filters?.business_category_l1_id,
          pet_type_l1_id: filters?.pet_type_l1_id,
          pet_type_l2_id: filters?.pet_type_l2_id,
        })}`),
    },
    categories: {
      list: () => request<MasterCategory[]>('/api/v1/admin/master/categories'),
      create: (data: { key?: string; sort_order?: number; translations?: Record<string, string> }) =>
        request<MasterCategory>('/api/v1/admin/master/categories', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: { sort_order?: number; is_active?: number; translations?: Record<string, string> }) =>
        request<MasterCategory>(`/api/v1/admin/master/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) =>
        request<{ id: string; deleted: boolean }>(`/api/v1/admin/master/categories/${id}`, { method: 'DELETE' }),
    },
    items: {
      list: (categoryKey?: string) =>
        request<MasterItem[]>(`/api/v1/admin/master/items${buildQuery({ category_key: categoryKey })}`),
      create: (data: { category_id: string; sort_order?: number; metadata?: Record<string, unknown>; translations?: Record<string, string>; parent_id?: string | null; device_type_id?: string | null }) =>
        request<MasterItem>('/api/v1/admin/master/items', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: { sort_order?: number; parent_id?: string | null; is_active?: number; metadata?: Record<string, unknown>; translations?: Record<string, string>; device_type_id?: string | null }) =>
        request<MasterItem>(`/api/v1/admin/master/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) =>
        request<{ id: string; deleted: boolean; message?: string }>(`/api/v1/admin/master/items/${id}`, { method: 'DELETE' }),
    },
  },

  // Countries
  countries: {
    list: () => request<Country[]>('/api/v1/admin/countries'),
    create: (data: { code: string; translations: Record<string, string>; default_currency_code: string }) =>
      request<Country>('/api/v1/admin/countries', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: { sort_order?: number; is_active?: number; translations?: Record<string, string>; default_currency_code?: string }) =>
      request<Country>(`/api/v1/admin/countries/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    mapCurrency: (countryId: string, currencyId: string, isDefault: boolean) =>
      request(`/api/v1/admin/countries/${countryId}/currencies`, {
        method: 'POST', body: JSON.stringify({ currency_id: currencyId, is_default: isDefault }),
      }),
  },
  feeds: {
    list: (params?: { feed_type?: string; business_category_id?: string; pet_type_id?: string; tab?: string; limit?: number }) =>
      request<{ feeds: FeedPost[] }>(`/api/v1/feeds${buildQuery({ feed_type: params?.feed_type, business_category_id: params?.business_category_id, pet_type_id: params?.pet_type_id, tab: params?.tab, limit: params?.limit })}`),
    filters: (lang?: string) =>
      request<{ business_categories: { id: string; code: string; i18n_key: string; label: string }[]; pet_types: { id: string; code: string; i18n_key: string; label: string }[] }>(`/api/v1/feeds/filters${buildQuery({ lang })}`),
    like: (feedId: string) =>
      request<{ liked: boolean }>(`/api/v1/feeds/${feedId}/like`, { method: 'POST' }),
    unlike: (feedId: string) =>
      request<{ liked: boolean }>(`/api/v1/feeds/${feedId}/like`, { method: 'DELETE' }),
    create: (data: {
      feed_type: 'guardian_post' | 'health_update' | 'pet_milestone' | 'supplier_story';
      visibility_scope: 'public' | 'friends_only' | 'private' | 'connected_only' | 'booking_related_only';
      caption: string;
      tags?: string[];
      media_urls?: string[];
      pet_id?: string | null;
      booking_id?: string | null;
      supplier_id?: string | null;
      business_category_id?: string | null;
      pet_type_id?: string | null;
      related_service_id?: string | null;
    }) =>
      request<{ id: string }>('/api/v1/feeds', { method: 'POST', body: JSON.stringify(data) }),
    remove: (feedId: string) =>
      request<{ deleted: boolean; id: string }>(`/api/v1/feeds/${feedId}`, { method: 'DELETE' }),
    comments: {
      list: (feedId: string) =>
        request<{ comments: FeedComment[] }>(`/api/v1/feeds/${feedId}/comments`),
      create: (feedId: string, content: string, parent_comment_id?: string | null) =>
        request<{ id: string }>(`/api/v1/feeds/${feedId}/comments`, {
          method: 'POST',
          body: JSON.stringify({ content, parent_comment_id: parent_comment_id ?? null }),
        }),
      update: (feedId: string, commentId: string, content: string) =>
        request<{ updated: boolean }>(`/api/v1/feeds/${feedId}/comments/${commentId}`, {
          method: 'PUT',
          body: JSON.stringify({ content }),
        }),
      remove: (feedId: string, commentId: string) =>
        request<{ deleted: boolean }>(`/api/v1/feeds/${feedId}/comments/${commentId}`, { method: 'DELETE' }),
    },
  },
  friends: {
    list: () =>
      request<{ friends: FriendConnection[] }>('/api/v1/friends'),
    pets: () =>
      request<{ pets: FriendPet[] }>('/api/v1/friends/pets'),
    requests: {
      list: (scope: 'inbox' | 'outbox' | 'all' = 'inbox') =>
        request<{ requests: FriendRequest[]; scope: string }>(`/api/v1/friends/requests?scope=${scope}`),
      create: (data: { receiver_user_id?: string; receiver_email?: string }) =>
        request<{ request_id: string | null; status: string }>('/api/v1/friends/requests', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      respond: (requestId: string, action: 'accept' | 'reject' | 'block') =>
        request<{ request_id: string; status: string }>(`/api/v1/friends/requests/${requestId}/respond`, {
          method: 'POST',
          body: JSON.stringify({ action }),
        }),
    },
  },
  pets: {
    list: () => request<{ pets: Pet[] }>('/api/v1/pets'),
    detail: (id: string) => request<{ pet: Pet }>(`/api/v1/pets/${id}`),
    create: (data: Partial<Pet>) => request<{ pet: Pet }>('/api/v1/pets', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Pet>) => request<{ pet: Pet }>(`/api/v1/pets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id: string) => request<{ deleted: boolean }>(`/api/v1/pets/${id}`, { method: 'DELETE' }),
    weightLogs: {
      list: (petId: string, params?: { range?: '7d' | '15d' | '1m' | '3m' | '6m' | '1y' | 'all' }) =>
        request<{ logs: PetWeightLog[]; range: string; summary: WeightSummary }>(`/api/v1/pets/${petId}/weight-logs${buildQuery({ range: params?.range })}`),
      create: (petId: string, data: {
        weight_value: number;
        weight_unit_id?: string | null;
        measured_at?: string;
        notes?: string | null;
      }) => request<{ id: string }>(`/api/v1/pets/${petId}/weight-logs`, { method: 'POST', body: JSON.stringify(data) }),
      update: (petId: string, logId: string, data: Partial<{
        weight_value: number;
        weight_unit_id: string | null;
        measured_at: string;
        notes: string | null;
      }>) => request<{ updated: boolean; id: string }>(`/api/v1/pets/${petId}/weight-logs/${logId}`, { method: 'PUT', body: JSON.stringify(data) }),
      remove: (petId: string, logId: string) => request<{ deleted: boolean; id: string }>(`/api/v1/pets/${petId}/weight-logs/${logId}`, { method: 'DELETE' }),
    },
    diseases: {
      list: (petId: string) => request<{ diseases: PetDiseaseHistory[] }>(`/api/v1/pets/${petId}/diseases`),
      create: (petId: string, data: {
        disease_group_item_id?: string;
        disease_item_id: string;
        diagnosed_at?: string;
        notes?: string | null;
        is_active?: boolean;
      }) => request<{ history_id?: string; created?: boolean }>(`/api/v1/pets/${petId}/diseases`, { method: 'POST', body: JSON.stringify(data) }),
      update: (petId: string, historyId: string, data: Partial<{
        disease_group_item_id: string | null;
        disease_item_id: string;
        diagnosed_at: string | null;
        notes: string | null;
        is_active: boolean;
      }>) => request<{ updated: boolean; history_id: string }>(`/api/v1/pets/${petId}/diseases/${historyId}`, { method: 'PUT', body: JSON.stringify(data) }),
      remove: (petId: string, historyId: string) => request<{ deleted: boolean; history_id?: string; disease_id?: string }>(`/api/v1/pets/${petId}/diseases/${historyId}`, { method: 'DELETE' }),
    },
    diseaseDevices: {
      list: (petId: string) => request<{ devices: PetDiseaseDevice[] }>(`/api/v1/pets/${petId}/disease-devices`),
      create: (petId: string, data: {
        disease_item_id: string;
        device_item_id: string;
        serial_number?: string | null;
        nickname?: string | null;
        notes?: string | null;
      }) => request<{ id: string }>(`/api/v1/pets/${petId}/disease-devices`, { method: 'POST', body: JSON.stringify(data) }),
    },
    glucoseLogs: {
      list: (petId: string, params?: { range?: '1w' | '1m' | '3m' | '6m' | '1y' | 'all' }) =>
        request<{ logs: PetGlucoseLog[]; summary: GlucoseSummary | null; range: string }>(`/api/v1/pets/${petId}/glucose-logs${buildQuery({ range: params?.range })}`),
      create: (petId: string, data: {
        disease_item_id?: string;
        device_item_id?: string | null;
        glucose_value: number;
        glucose_unit_item_id?: string;
        measured_at?: string;
        measured_context_item_id?: string | null;
        notes?: string | null;
      }) => request<{ id: string; judgement: { level: string | null; label: string | null } }>(`/api/v1/pets/${petId}/glucose-logs`, { method: 'POST', body: JSON.stringify(data) }),
      update: (petId: string, logId: string, data: Partial<{
        disease_item_id: string;
        device_item_id: string | null;
        glucose_value: number;
        glucose_unit_item_id: string;
        measured_at: string;
        measured_context_item_id: string | null;
        notes: string | null;
      }>) => request<{ updated: boolean; id: string; judgement: { level: string | null; label: string | null } }>(`/api/v1/pets/${petId}/glucose-logs/${logId}`, { method: 'PUT', body: JSON.stringify(data) }),
      remove: (petId: string, logId: string) => request<{ deleted: boolean; id: string }>(`/api/v1/pets/${petId}/glucose-logs/${logId}`, { method: 'DELETE' }),
    },
    healthMeasurements: {
      list: (petId: string, params?: { range?: '7d' | '15d' | '1m' | '3m' | '6m' | '1y' | 'all' }) =>
        request<{ logs: PetHealthMeasurementLog[]; summary: HealthMeasurementSummary | null; range: string }>(`/api/v1/pets/${petId}/health-measurements${buildQuery({ range: params?.range })}`),
      create: (petId: string, data: {
        disease_item_id: string;
        device_type_item_id?: string | null;
        device_model_id?: string | null;
        guardian_device_id?: string | null;
        measurement_item_id: string;
        measurement_context_id?: string | null;
        value: number;
        unit_item_id?: string | null;
        measured_at?: string;
        memo?: string | null;
      }) => request<{ id: string; judgement: { level: string | null; label: string | null } }>(`/api/v1/pets/${petId}/health-measurements`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
      update: (petId: string, logId: string, data: Partial<{
        disease_item_id: string;
        device_type_item_id: string | null;
        device_model_id: string | null;
        measurement_item_id: string;
        measurement_context_id: string | null;
        value: number;
        unit_item_id: string | null;
        measured_at: string;
        memo: string | null;
      }>) => request<{ updated: boolean; id: string; judgement: { level: string | null; label: string | null } }>(`/api/v1/pets/${petId}/health-measurements/${logId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
      remove: (petId: string, logId: string) => request<{ deleted: boolean; id: string }>(`/api/v1/pets/${petId}/health-measurements/${logId}`, {
        method: 'DELETE',
      }),
    },
    petFeeds: {
      list: (petId: string) =>
        request<{ feeds: PetFeed[] }>(`/api/v1/pets/${petId}/pet-feeds`),
      create: (petId: string, data: {
        feed_model_id: string; disease_item_id?: string; nickname?: string;
        daily_amount_g?: number; daily_amount_unit?: string; feeding_frequency?: number;
        start_date?: string; end_date?: string; notes?: string; is_primary?: boolean;
      }) => request<{ id: string }>(`/api/v1/pets/${petId}/pet-feeds`, { method: 'POST', body: JSON.stringify(data) }),
      update: (petId: string, feedId: string, data: Partial<{
        nickname: string; disease_item_id: string; daily_amount_g: number;
        daily_amount_unit: string; feeding_frequency: number; start_date: string;
        end_date: string; notes: string; is_primary: boolean;
      }>) => request<{ id: string; updated: boolean }>(`/api/v1/pets/${petId}/pet-feeds/${feedId}`, { method: 'PUT', body: JSON.stringify(data) }),
      remove: (petId: string, feedId: string) =>
        request<{ id: string; deleted: boolean }>(`/api/v1/pets/${petId}/pet-feeds/${feedId}`, { method: 'DELETE' }),
    },
    petSupplements: {
      list: (petId: string) =>
        request<{ feeds: PetFeed[] }>(`/api/v1/pets/${petId}/pet-supplements`),
      create: (petId: string, data: {
        feed_model_id: string; nickname?: string; is_primary?: boolean;
      }) => request<{ id: string }>(`/api/v1/pets/${petId}/pet-supplements`, { method: 'POST', body: JSON.stringify(data) }),
      update: (petId: string, id: string, data: Partial<{
        nickname: string; is_primary: boolean;
      }>) => request<{ id: string; updated: boolean }>(`/api/v1/pets/${petId}/pet-supplements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      remove: (petId: string, id: string) =>
        request<{ id: string; deleted: boolean }>(`/api/v1/pets/${petId}/pet-supplements/${id}`, { method: 'DELETE' }),
    },
    feedingLogs: {
      list: (petId: string) =>
        request<{ logs: FeedingLog[] }>(`/api/v1/pets/${petId}/feeding-logs`),
      create: (petId: string, data: {
        pet_feed_id?: string; feed_model_id?: string; amount_g?: number;
        amount_unit?: string; frequency?: number; feeding_time?: string; memo?: string;
        is_mixed?: boolean; items?: Array<{ pet_feed_id: string; amount_g?: number; ratio_pct?: number }>;
      }) => request<{ id: string }>(`/api/v1/pets/${petId}/feeding-logs`, { method: 'POST', body: JSON.stringify(data) }),
      update: (petId: string, logId: string, data: Partial<{
        pet_feed_id: string; feed_model_id: string; amount_g: number;
        amount_unit: string; frequency: number; feeding_time: string; memo: string;
        is_mixed: boolean; items: Array<{ pet_feed_id: string; amount_g?: number; ratio_pct?: number }>;
      }>) => request<{ id: string; updated: boolean }>(`/api/v1/pets/${petId}/feeding-logs/${logId}`, { method: 'PUT', body: JSON.stringify(data) }),
      remove: (petId: string, logId: string) =>
        request<{ id: string; deleted: boolean }>(`/api/v1/pets/${petId}/feeding-logs/${logId}`, { method: 'DELETE' }),
    },
    exerciseLogs: {
      list: (petId: string, params?: { range?: '7d' | '15d' | '1m' | '3m' | '6m' | '1y' | 'all' }) =>
        request<{ logs: PetExerciseLog[]; range: string; summary: ExerciseSummary }>(`/api/v1/pets/${petId}/exercise-logs${buildQuery({ range: params?.range })}`),
      create: (petId: string, data: {
        exercise_type: string; exercise_subtype: string; exercise_date?: string;
        duration_min: number; distance_km?: number | null; intensity?: string;
        leash?: boolean | null; location_type?: string; with_other_pets?: boolean;
        companion_pet_ids?: string[]; note?: string | null;
      }) => request<{ id: string }>(`/api/v1/pets/${petId}/exercise-logs`, { method: 'POST', body: JSON.stringify(data) }),
      update: (petId: string, logId: string, data: Partial<{
        exercise_type: string; exercise_subtype: string; exercise_date: string;
        duration_min: number; distance_km: number | null; intensity: string;
        leash: boolean | null; location_type: string; with_other_pets: boolean;
        companion_pet_ids: string[]; note: string | null;
      }>) => request<{ updated: boolean; id: string }>(`/api/v1/pets/${petId}/exercise-logs/${logId}`, { method: 'PUT', body: JSON.stringify(data) }),
      remove: (petId: string, logId: string) =>
        request<{ deleted: boolean; id: string }>(`/api/v1/pets/${petId}/exercise-logs/${logId}`, { method: 'DELETE' }),
    },
    feedingMixFavorites: {
      list: (petId: string) =>
        request<{ favorites: FeedingMixFavorite[] }>(`/api/v1/pets/${petId}/feeding-mix-favorites`),
      create: (petId: string, data: { name: string; items: Array<{ pet_feed_id: string; amount_g?: number }> }) =>
        request<{ id: string }>(`/api/v1/pets/${petId}/feeding-mix-favorites`, { method: 'POST', body: JSON.stringify(data) }),
      remove: (petId: string, favId: string) =>
        request<{ deleted: boolean; id: string }>(`/api/v1/pets/${petId}/feeding-mix-favorites/${favId}`, { method: 'DELETE' }),
    },
    report: {
      get: (petId: string, params?: { period?: 'today' | '7d' | '30d' | '3m'; lang?: string }) =>
        request<PetReport>(`/api/v1/pets/${petId}/report${buildQuery({ period: params?.period, lang: params?.lang })}`),
    },
    guardianDevices: {
      list: (petId: string) =>
        request<{ devices: GuardianDevice[] }>(`/api/v1/pets/${petId}/guardian-devices`),
      create: (petId: string, data: { device_model_id: string; disease_item_id?: string; is_default?: boolean; nickname?: string; serial_number?: string; start_date?: string; notes?: string }) =>
        request<{ id: string }>(`/api/v1/pets/${petId}/guardian-devices`, { method: 'POST', body: JSON.stringify(data) }),
      update: (petId: string, deviceId: string, data: Partial<{ nickname: string; serial_number: string; notes: string; start_date: string; disease_item_id: string; is_default: boolean }>) =>
        request<{ id: string; updated: boolean }>(`/api/v1/pets/${petId}/guardian-devices/${deviceId}`, { method: 'PUT', body: JSON.stringify(data) }),
      remove: (petId: string, deviceId: string) =>
        request<{ id: string; deleted: boolean }>(`/api/v1/pets/${petId}/guardian-devices/${deviceId}`, { method: 'DELETE' }),
    },
    logs: {
      list: (petId: string, params?: { logtype_id?: string; date_from?: string; date_to?: string; limit?: number; offset?: number }) =>
        request<{ logs: PetLog[]; total: number }>(`/api/v1/pets/${petId}/logs${buildQuery({ logtype_id: params?.logtype_id, date_from: params?.date_from, date_to: params?.date_to, limit: params?.limit, offset: params?.offset })}`),
      create: (petId: string, data: {
        logtype_id: string;
        event_date: string;
        event_time?: string | null;
        title?: string | null;
        notes?: string | null;
        metadata?: Record<string, unknown>;
        values?: Array<{ metric_id: string; unit_id: string; numeric_value?: number | null; text_value?: string | null }>;
        media?: Array<{ media_url: string; media_type?: string; thumbnail_url?: string | null }>;
      }) => request<PetLog & { alert?: GlucoseAlert | null }>(`/api/v1/pets/${petId}/logs`, { method: 'POST', body: JSON.stringify(data) }),
      update: (petId: string, logId: string, data: Partial<{
        event_date: string;
        event_time: string | null;
        title: string | null;
        notes: string | null;
        metadata: Record<string, unknown>;
      }>) => request<{ updated: boolean; id: string }>(`/api/v1/pets/${petId}/logs/${logId}`, { method: 'PUT', body: JSON.stringify(data) }),
      remove: (petId: string, logId: string) => request<{ deleted: boolean; id: string }>(`/api/v1/pets/${petId}/logs/${logId}`, { method: 'DELETE' }),
    },
    checkMicrochip: (microchipNo: string, excludePetId?: string, countryCode?: string) =>
      request<{ available: boolean; reason?: string; pet_id?: string }>(`/api/v1/pets/check-microchip${buildQuery({ microchip_no: microchipNo, exclude_pet_id: excludePetId, country_code: countryCode })}`),
  },
  storage: {
    presignedUrl: (params: { type: 'user_avatar' | 'pet_avatar' | 'log_media' | 'feed_media' | 'completion_photo' | 'store_photo' | 'service_photo' | 'product_image'; ext: string; subdir?: string }) =>
      request<{ upload_url: string; file_key: string; public_url: string; expires_in: number }>(`/api/v1/storage/presigned-url${buildQuery({ type: params.type, ext: params.ext, subdir: params.subdir })}`),
  },
  providers: {
    me: () => request<{ approval_status: string; role_application_status?: string; rejection_reason?: string; profile: ProviderProfile | null }>('/api/v1/providers/me'),
    updateMe: (data: {
      business_category_l1_id?: string | null;
      business_category_l2_id?: string | null;
      business_category_l3_id?: string | null;
      pet_type_l1_id?: string | null;
      pet_type_l2_id?: string | null;
      business_registration_no?: string | null;
      operating_hours?: string | null;
      certifications?: string[];
      address_line?: string | null;
    }) => request<{ updated: boolean }>('/api/v1/providers/me', { method: 'PUT', body: JSON.stringify(data) }),
  },
  bookings: {
    list: () => request<{ bookings: Booking[] }>('/api/v1/bookings'),
    updateStatus: (bookingId: string, status: 'created' | 'in_progress' | 'service_completed' | 'publish_requested' | 'publish_approved' | 'publish_rejected' | 'cancelled') =>
      request<{ id: string; status: string }>(`/api/v1/bookings/${bookingId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
    requestCompletion: (bookingId: string, data: {
      media_urls?: string[];
      completion_memo?: string | null;
      business_category_id?: string | null;
      pet_type_id?: string | null;
    }) =>
      request<{ booking_id: string; feed_id: string; status: string }>(`/api/v1/bookings/${bookingId}/completion-request`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  petAlbum: {
    list: (params?: {
      pet_id?: string;
      source_type?: string;
      media_type?: 'image' | 'video';
      sort?: 'latest' | 'oldest';
      include_pending?: boolean;
      limit?: number;
    }) =>
      request<{ media: PetAlbumMedia[] }>(`/api/v1/pet-album${buildQuery({ pet_id: params?.pet_id, source_type: params?.source_type, media_type: params?.media_type, sort: params?.sort, include_pending: params?.include_pending, limit: params?.limit })}`),
    detail: (id: string) => request<{ media: PetAlbumMedia }>(`/api/v1/pet-album/${id}`),
    create: (data: {
      pet_id: string;
      source_type: 'profile' | 'feed' | 'booking_completed' | 'health_record' | 'manual_upload';
      source_id?: string | null;
      booking_id?: string | null;
      media_type?: 'image' | 'video';
      media_url: string;
      thumbnail_url?: string | null;
      caption?: string | null;
      tags?: string[];
      visibility_scope?: 'public' | 'friends_only' | 'private' | 'guardian_supplier_only' | 'booking_related';
      is_primary?: boolean;
      sort_order?: number;
      status?: 'active' | 'pending' | 'hidden';
    }) => request<{ media: PetAlbumMedia }>('/api/v1/pet-album', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<{
      caption: string | null;
      thumbnail_url: string | null;
      tags: string[];
      visibility_scope: 'public' | 'friends_only' | 'private' | 'guardian_supplier_only' | 'booking_related';
      is_primary: boolean;
      sort_order: number;
      status: 'active' | 'pending' | 'hidden' | 'deleted';
    }>) => request<{ media: PetAlbumMedia }>(`/api/v1/pet-album/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id: string) => request<{ deleted: boolean; id: string }>(`/api/v1/pet-album/${id}`, { method: 'DELETE' }),
  },
  currencies: {
    list: () => request<Currency[]>('/api/v1/admin/currencies'),
    create: (data: { code: string; symbol: string; name_key: string; decimal_places?: number }) =>
      request<Currency>('/api/v1/admin/currencies', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Currency>) =>
      request<Currency>(`/api/v1/admin/currencies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  members: {
    list: (params?: { q?: string; role?: string; date_from?: string; date_to?: string }) =>
      request<{ summary: MemberSummary; members: MemberRecord[] }>(`/api/v1/admin/members${buildQuery(params || {})}`),
    update: (memberId: string, data: {
      role?: 'guardian' | 'provider' | 'admin';
      full_name?: string | null;
      nickname?: string | null;
      phone?: string | null;
      address_line?: string | null;
      region_text?: string | null;
      preferred_language?: string | null;
      business_category_l1_id?: string | null;
      business_category_l2_id?: string | null;
      business_category_l3_id?: string | null;
      pet_type_l1_id?: string | null;
      pet_type_l2_id?: string | null;
      business_registration_no?: string | null;
      operating_hours?: string | null;
      certifications?: string[];
      provider_approval_status?: string;
    }) => request<{ updated: boolean; member_id: string }>(`/api/v1/admin/members/${memberId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (memberId: string) =>
      request<{ action: string; member_id: string }>(`/api/v1/admin/members/${memberId}`, { method: 'DELETE' }),
    decideRoleApplication: (applicationId: string, action: 'approve' | 'reject') =>
      request<{ id: string; status: string }>(`/api/v1/admin/role-applications/${applicationId}/decision`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      }),
  },
  platformSettings: {
    googlePublicConfig: () =>
      request<PublicGoogleConfig>('/api/v1/google/config'),
    kakaoPublicConfig: () =>
      request<PublicKakaoConfig>('/api/v1/kakao/config'),
    applePublicConfig: () =>
      request<PublicAppleConfig>('/api/v1/apple/config'),
    google: {
      get: () =>
        request<{ settings: Record<string, GoogleSettingItem> }>('/api/v1/admin/settings/google'),
      update: (data: {
        google_places_api_key?: string;
        google_oauth_client_id?: string;
        google_oauth_redirect_uri?: string;
        google_translate_service_account_json?: string;
        google_translate_service_account_email?: string;
        google_translate_service_account_private_key?: string;
        google_places_verified_at?: string;
        google_oauth_verified_at?: string;
        google_translate_verified_at?: string;
      }) =>
        request<{ updated: boolean; updated_at: string }>('/api/v1/admin/settings/google', {
          method: 'PUT',
          body: JSON.stringify(data),
        }),
      testTranslate: (data: {
        google_translate_service_account_json?: string;
        google_translate_service_account_email: string;
        google_translate_service_account_private_key: string;
        text?: string;
      }) =>
        request<{ ok: boolean; translated_text: string }>('/api/v1/admin/settings/google/test-translate', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
    },
    kakao: {
      get: () =>
        request<{ settings: Record<string, PlatformSettingItem> }>('/api/v1/admin/settings/kakao'),
      update: (data: {
        kakao_rest_api_key?: string;
        kakao_javascript_key?: string;
        kakao_redirect_uri?: string;
        kakao_verified_at?: string;
      }) =>
        request<{ updated: boolean; updated_at: string }>('/api/v1/admin/settings/kakao', {
          method: 'PUT',
          body: JSON.stringify(data),
        }),
      test: () =>
        request<{ ok: boolean; verified_at: string }>('/api/v1/admin/settings/kakao/test', {
          method: 'POST',
          body: '{}',
        }),
    },
    apple: {
      get: () =>
        request<{ settings: Record<string, PlatformSettingItem> }>('/api/v1/admin/settings/apple'),
      update: (data: {
        apple_service_id?: string;
        apple_team_id?: string;
        apple_key_id?: string;
        apple_private_key?: string;
        apple_redirect_uri?: string;
        apple_verified_at?: string;
      }) =>
        request<{ updated: boolean; updated_at: string }>('/api/v1/admin/settings/apple', {
          method: 'PUT',
          body: JSON.stringify(data),
        }),
      test: () =>
        request<{ ok: boolean; verified_at: string }>('/api/v1/admin/settings/apple/test', {
          method: 'POST',
          body: '{}',
        }),
    },
  },
  devices: {
    types: {
      list: (lang?: string) => {
        const q = lang ? `?lang=${encodeURIComponent(lang)}` : '';
        return request<DeviceType[]>(`/api/v1/admin/devices/types${q}`);
      },
      create: (data: { key?: string; name_ko: string; name_en: string; sort_order?: number }) =>
        request<DeviceType>('/api/v1/admin/devices/types', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: Partial<{ name_ko: string; name_en: string; sort_order: number; status: string }>) =>
        request<DeviceType>(`/api/v1/admin/devices/types/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) =>
        request<{ id: string; deleted: boolean }>(`/api/v1/admin/devices/types/${id}`, { method: 'DELETE' }),
    },
    manufacturers: {
      list: (lang?: string, typeItemId?: string) =>
        request<DeviceManufacturer[]>(`/api/v1/admin/devices/manufacturers${buildQuery({ lang, type_item_id: typeItemId })}`),
      create: (data: { key?: string; country?: string; sort_order?: number; name_ko: string; name_en?: string; parent_type_ids?: string[]; translations?: Record<string, string> }) =>
        request<DeviceManufacturer>('/api/v1/admin/devices/manufacturers', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: Partial<{ key: string; name_ko: string; name_en: string; country: string; sort_order: number; status: string; parent_type_ids: string[]; translations: Record<string, string> }>) =>
        request<DeviceManufacturer>(`/api/v1/admin/devices/manufacturers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) =>
        request<{ id: string; deleted: boolean }>(`/api/v1/admin/devices/manufacturers/${id}`, { method: 'DELETE' }),
    },
    brands: {
      list: (manufacturerId?: string, typeItemId?: string) =>
        request<DeviceBrand[]>(`/api/v1/admin/devices/brands${buildQuery({ manufacturer_id: manufacturerId, type_item_id: typeItemId })}`),
      create: (data: { key?: string; manufacturer_id?: string; manufacturer_ids?: string[]; parent_type_ids?: string[]; sort_order?: number; name_ko: string; name_en?: string; translations?: Record<string, string> }) =>
        request<DeviceBrand>('/api/v1/admin/devices/brands', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: Partial<{ key: string; name_ko: string; name_en: string; status: string; manufacturer_id: string; manufacturer_ids: string[]; parent_type_ids: string[]; sort_order: number; translations: Record<string, string> }>) =>
        request<DeviceBrand>(`/api/v1/admin/devices/brands/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) =>
        request<{ id: string; deleted: boolean }>(`/api/v1/admin/devices/brands/${id}`, { method: 'DELETE' }),
    },
    models: {
      list: (filters?: { device_type_id?: string; manufacturer_id?: string; brand_id?: string }) =>
        request<DeviceModel[]>(`/api/v1/admin/devices/models${buildQuery({ device_type_id: filters?.device_type_id, manufacturer_id: filters?.manufacturer_id, brand_id: filters?.brand_id })}`),
      create: (data: { key?: string; device_type_id: string; parent_type_ids?: string[]; manufacturer_id: string; brand_id?: string; brand_ids?: string[]; model_name?: string; model_code?: string; description?: string; image_url?: string; sort_order?: number; name_ko?: string; name_en?: string; translations?: Record<string, string> }) =>
        request<DeviceModel>('/api/v1/admin/devices/models', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: Partial<{ key: string; model_name: string; model_code: string; description: string; image_url: string | null; status: string; device_type_id: string; parent_type_ids: string[]; manufacturer_id: string; brand_id: string | null; brand_ids: string[]; sort_order: number; name_ko: string; name_en: string; translations: Record<string, string> }>) =>
        request<DeviceModel>(`/api/v1/admin/devices/models/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) =>
        request<{ id: string; deleted: boolean }>(`/api/v1/admin/devices/models/${id}`, { method: 'DELETE' }),
    },
    units: {
      list: () => request<MeasurementUnit[]>('/api/v1/admin/devices/units'),
      create: (data: { key: string; name: string; symbol?: string; sort_order?: number }) =>
        request<MeasurementUnit>('/api/v1/admin/devices/units', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: Partial<{ name: string; symbol: string; sort_order: number; status: string }>) =>
        request<MeasurementUnit>(`/api/v1/admin/devices/units/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    },
    public: {
      types: (lang?: string) => {
        const q = lang ? `?lang=${encodeURIComponent(lang)}` : '';
        return request<DeviceType[]>(`/api/v1/devices/types${q}`);
      },
      manufacturers: (deviceTypeId?: string, lang?: string) =>
        request<DeviceManufacturer[]>(`/api/v1/devices/manufacturers${buildQuery({ device_type_id: deviceTypeId, lang })}`),
      brands: (manufacturerId?: string, deviceTypeId?: string) =>
        request<DeviceBrand[]>(`/api/v1/devices/brands${buildQuery({ manufacturer_id: manufacturerId, device_type_id: deviceTypeId })}`),
      models: (filters?: { device_type_id?: string; manufacturer_id?: string; brand_id?: string }, lang?: string) =>
        request<DeviceModel[]>(`/api/v1/devices/models${buildQuery({ device_type_id: filters?.device_type_id, manufacturer_id: filters?.manufacturer_id, brand_id: filters?.brand_id, lang })}`),
      units: () => request<MeasurementUnit[]>('/api/v1/devices/units'),
    },
  },
  feedCatalog: {
    types: {
      list: (lang?: string) => {
        const q = lang ? `?lang=${encodeURIComponent(lang)}` : '';
        return request<FeedType[]>(`/api/v1/admin/feed-catalog/types${q}`);
      },
    },
    manufacturers: {
      list: (lang?: string, typeItemId?: string) =>
        request<FeedManufacturer[]>(`/api/v1/admin/feed-catalog/manufacturers${buildQuery({ lang, type_item_id: typeItemId })}`),
      create: (data: { key?: string; country?: string; sort_order?: number; name_ko: string; name_en?: string; parent_type_ids?: string[]; translations?: Record<string, string> }) =>
        request<FeedManufacturer>('/api/v1/admin/feed-catalog/manufacturers', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: Partial<{ key: string; name_ko: string; name_en: string; country: string; sort_order: number; status: string; parent_type_ids: string[]; translations: Record<string, string> }>) =>
        request<FeedManufacturer>(`/api/v1/admin/feed-catalog/manufacturers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) =>
        request<{ id: string; deleted: boolean }>(`/api/v1/admin/feed-catalog/manufacturers/${id}`, { method: 'DELETE' }),
    },
    brands: {
      list: (manufacturerId?: string, typeItemId?: string) =>
        request<FeedBrand[]>(`/api/v1/admin/feed-catalog/brands${buildQuery({ manufacturer_id: manufacturerId, type_item_id: typeItemId })}`),
      create: (data: { key?: string; manufacturer_id?: string; manufacturer_ids?: string[]; parent_type_ids?: string[]; sort_order?: number; name_ko: string; name_en?: string; translations?: Record<string, string> }) =>
        request<FeedBrand>('/api/v1/admin/feed-catalog/brands', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: Partial<{ key: string; name_ko: string; name_en: string; status: string; manufacturer_id: string; manufacturer_ids: string[]; parent_type_ids: string[]; sort_order: number; translations: Record<string, string> }>) =>
        request<FeedBrand>(`/api/v1/admin/feed-catalog/brands/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) =>
        request<{ id: string; deleted: boolean }>(`/api/v1/admin/feed-catalog/brands/${id}`, { method: 'DELETE' }),
    },
    models: {
      list: (filters?: { feed_type_id?: string; manufacturer_id?: string; brand_id?: string }) =>
        request<FeedModel[]>(`/api/v1/admin/feed-catalog/models${buildQuery({ feed_type_id: filters?.feed_type_id, manufacturer_id: filters?.manufacturer_id, brand_id: filters?.brand_id })}`),
      create: (data: { key?: string; feed_type_id: string; parent_type_ids?: string[]; manufacturer_id: string; brand_id?: string; brand_ids?: string[]; model_name?: string; model_code?: string; description?: string; image_url?: string; sort_order?: number; name_ko?: string; name_en?: string; translations?: Record<string, string> }) =>
        request<FeedModel>('/api/v1/admin/feed-catalog/models', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: Partial<{ key: string; model_name: string; model_code: string; description: string; image_url: string | null; status: string; feed_type_id: string; parent_type_ids: string[]; manufacturer_id: string; brand_id: string | null; brand_ids: string[]; sort_order: number; name_ko: string; name_en: string; translations: Record<string, string> }>) =>
        request<FeedModel>(`/api/v1/admin/feed-catalog/models/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) =>
        request<{ id: string; deleted: boolean }>(`/api/v1/admin/feed-catalog/models/${id}`, { method: 'DELETE' }),
    },
    nutrition: {
      get: (modelId: string) =>
        request<FeedNutrition | null>(`/api/v1/admin/feed-catalog/models/${modelId}/nutrition`),
      upsert: (modelId: string, data: Partial<Omit<FeedNutrition, 'id' | 'feed_model_id' | 'status' | 'created_at' | 'updated_at'>>) =>
        request<FeedNutrition>(`/api/v1/admin/feed-catalog/models/${modelId}/nutrition`, { method: 'PUT', body: JSON.stringify(data) }),
    },
    public: {
      types: (lang?: string) => {
        const q = lang ? `?lang=${encodeURIComponent(lang)}` : '';
        return request<FeedType[]>(`/api/v1/feed-catalog/types${q}`);
      },
      manufacturers: (feedTypeId?: string, lang?: string) =>
        request<FeedManufacturer[]>(`/api/v1/feed-catalog/manufacturers${buildQuery({ feed_type_id: feedTypeId, lang })}`),
      brands: (manufacturerId?: string, feedTypeId?: string) =>
        request<FeedBrand[]>(`/api/v1/feed-catalog/brands${buildQuery({ manufacturer_id: manufacturerId, feed_type_id: feedTypeId })}`),
      models: (filters?: { feed_type_id?: string; manufacturer_id?: string; brand_id?: string }, lang?: string) =>
        request<FeedModel[]>(`/api/v1/feed-catalog/models${buildQuery({ feed_type_id: filters?.feed_type_id, manufacturer_id: filters?.manufacturer_id, brand_id: filters?.brand_id, lang })}`),
      nutrition: (modelId: string) =>
        request<FeedNutrition | null>(`/api/v1/feed-catalog/models/${modelId}/nutrition`),
    },
  },

  supplementCatalog: {
    types: {
      list: (lang?: string) => {
        const q = lang ? `?lang=${encodeURIComponent(lang)}` : '';
        return request<FeedType[]>(`/api/v1/admin/supplement-catalog/types${q}`);
      },
    },
    manufacturers: {
      list: (lang?: string, typeItemId?: string) =>
        request<FeedManufacturer[]>(`/api/v1/admin/supplement-catalog/manufacturers${buildQuery({ lang, type_item_id: typeItemId })}`),
      create: (data: { key?: string; country?: string; sort_order?: number; name_ko: string; name_en?: string; parent_type_ids?: string[]; translations?: Record<string, string> }) =>
        request<FeedManufacturer>('/api/v1/admin/supplement-catalog/manufacturers', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: Partial<{ key: string; name_ko: string; name_en: string; country: string; sort_order: number; status: string; parent_type_ids: string[]; translations: Record<string, string> }>) =>
        request<FeedManufacturer>(`/api/v1/admin/supplement-catalog/manufacturers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) =>
        request<{ id: string; deleted: boolean }>(`/api/v1/admin/supplement-catalog/manufacturers/${id}`, { method: 'DELETE' }),
    },
    brands: {
      list: (manufacturerId?: string, typeItemId?: string) =>
        request<FeedBrand[]>(`/api/v1/admin/supplement-catalog/brands${buildQuery({ manufacturer_id: manufacturerId, type_item_id: typeItemId })}`),
      create: (data: { key?: string; manufacturer_id?: string; manufacturer_ids?: string[]; parent_type_ids?: string[]; sort_order?: number; name_ko: string; name_en?: string; translations?: Record<string, string> }) =>
        request<FeedBrand>('/api/v1/admin/supplement-catalog/brands', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: Partial<{ key: string; name_ko: string; name_en: string; status: string; manufacturer_id: string; manufacturer_ids: string[]; parent_type_ids: string[]; sort_order: number; translations: Record<string, string> }>) =>
        request<FeedBrand>(`/api/v1/admin/supplement-catalog/brands/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) =>
        request<{ id: string; deleted: boolean }>(`/api/v1/admin/supplement-catalog/brands/${id}`, { method: 'DELETE' }),
    },
    models: {
      list: (filters?: { feed_type_id?: string; manufacturer_id?: string; brand_id?: string }) =>
        request<FeedModel[]>(`/api/v1/admin/supplement-catalog/models${buildQuery({ feed_type_id: filters?.feed_type_id, manufacturer_id: filters?.manufacturer_id, brand_id: filters?.brand_id })}`),
      create: (data: { key?: string; feed_type_id: string; parent_type_ids?: string[]; manufacturer_id: string; brand_id?: string; brand_ids?: string[]; model_name?: string; model_code?: string; description?: string; image_url?: string; sort_order?: number; name_ko?: string; name_en?: string; translations?: Record<string, string> }) =>
        request<FeedModel>('/api/v1/admin/supplement-catalog/models', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: Partial<{ key: string; model_name: string; model_code: string; description: string; image_url: string | null; status: string; feed_type_id: string; parent_type_ids: string[]; manufacturer_id: string; brand_id: string | null; brand_ids: string[]; sort_order: number; name_ko: string; name_en: string; translations: Record<string, string> }>) =>
        request<FeedModel>(`/api/v1/admin/supplement-catalog/models/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) =>
        request<{ id: string; deleted: boolean }>(`/api/v1/admin/supplement-catalog/models/${id}`, { method: 'DELETE' }),
    },
    nutrition: {
      get: (modelId: string) =>
        request<FeedNutrition | null>(`/api/v1/admin/supplement-catalog/models/${modelId}/nutrition`),
      upsert: (modelId: string, data: Partial<Omit<FeedNutrition, 'id' | 'feed_model_id' | 'status' | 'created_at' | 'updated_at'>>) =>
        request<FeedNutrition>(`/api/v1/admin/supplement-catalog/models/${modelId}/nutrition`, { method: 'PUT', body: JSON.stringify(data) }),
    },
    public: {
      types: (lang?: string) => {
        const q = lang ? `?lang=${encodeURIComponent(lang)}` : '';
        return request<FeedType[]>(`/api/v1/supplement-catalog/types${q}`);
      },
      manufacturers: (feedTypeId?: string, lang?: string) =>
        request<FeedManufacturer[]>(`/api/v1/supplement-catalog/manufacturers${buildQuery({ feed_type_id: feedTypeId, lang })}`),
      brands: (manufacturerId?: string, feedTypeId?: string) =>
        request<FeedBrand[]>(`/api/v1/supplement-catalog/brands${buildQuery({ manufacturer_id: manufacturerId, feed_type_id: feedTypeId })}`),
      models: (filters?: { feed_type_id?: string; manufacturer_id?: string; brand_id?: string }, lang?: string) =>
        request<FeedModel[]>(`/api/v1/supplement-catalog/models${buildQuery({ feed_type_id: filters?.feed_type_id, manufacturer_id: filters?.manufacturer_id, brand_id: filters?.brand_id, lang })}`),
      nutrition: (modelId: string) =>
        request<FeedNutrition | null>(`/api/v1/supplement-catalog/models/${modelId}/nutrition`),
    },
  },

  feedRequests: {
    create: (data: {
      feed_name: string; pet_id?: string; feed_type_item_id?: string;
      manufacturer_name?: string; brand_name?: string;
      calories_per_100g?: number; protein_pct?: number; fat_pct?: number;
      fiber_pct?: number; moisture_pct?: number;
      ash_pct?: number; calcium_pct?: number; phosphorus_pct?: number;
      omega3_pct?: number; omega6_pct?: number; carbohydrate_pct?: number;
      serving_size_g?: number; ingredients_text?: string;
      reference_url?: string; memo?: string;
    }) =>
      request<FeedRegistrationRequest>('/api/v1/feed-requests', { method: 'POST', body: JSON.stringify(data) }),
    list: () =>
      request<FeedRegistrationRequest[]>('/api/v1/feed-requests'),
    admin: {
      list: (params?: { status?: string }) =>
        request<FeedRegistrationRequest[]>(`/api/v1/admin/feed-requests${buildQuery({ status: params?.status })}`),
      get: (id: string) =>
        request<FeedRegistrationRequest>(`/api/v1/admin/feed-requests/${id}`),
      approve: (id: string, data?: { manufacturer_id?: string; brand_id?: string; feed_type_item_id?: string }) =>
        request<FeedRegistrationRequest>(`/api/v1/admin/feed-requests/${id}/approve`, { method: 'POST', body: JSON.stringify(data || {}) }),
      reject: (id: string, data: { review_note?: string }) =>
        request<FeedRegistrationRequest>(`/api/v1/admin/feed-requests/${id}/reject`, { method: 'POST', body: JSON.stringify(data) }),
    },
  },

  dashboard: {
    stats: (params?: { period?: string; pet_type?: string; lang?: string }) =>
      request<DashboardStats>(`/api/v1/admin/dashboard/stats${buildQuery(params || {})}`),
  },

  supplementRequests: {
    create: (data: {
      feed_name: string; pet_id?: string; feed_type_item_id?: string;
      manufacturer_name?: string; brand_name?: string;
      reference_url?: string; memo?: string;
    }) =>
      request<FeedRegistrationRequest>('/api/v1/feed-requests', { method: 'POST', body: JSON.stringify({ ...data, category_type: 'supplement' }) }),
    list: () =>
      request<FeedRegistrationRequest[]>('/api/v1/feed-requests?category_type=supplement'),
  },
};
