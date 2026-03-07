// Admin Web API 클라이언트

import { getApiBase } from './apiBase';

const API_BASE = getApiBase();

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

  const url = `${API_BASE}${path}`;
  let res: Response;
  try {
    res = await fetch(url, { ...options, headers });
  } catch {
    throw new Error('데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
  }

  const contentType = res.headers.get('content-type') || '';
  const raw = await res.text();
  let json: { success?: boolean; data?: T; error?: string } | null = null;
  if (raw) {
    if (contentType.includes('application/json')) {
      try {
        json = JSON.parse(raw) as { success?: boolean; data?: T; error?: string };
      } catch {
        throw new Error('서버 응답을 해석하지 못했습니다. 잠시 후 다시 시도해주세요.');
      }
    } else {
      throw new Error('서버 응답 형식이 올바르지 않습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  if (res.status === 401) {
    clearTokens();
    window.location.href = '/#/login';
    throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
  }

  if (!res.ok) {
    if (json?.error) throw new Error(json.error);
    if (res.status >= 500) throw new Error('서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.');
    if (res.status === 404) throw new Error('요청한 데이터를 찾을 수 없습니다.');
    if (res.status === 403) throw new Error('해당 작업 권한이 없습니다.');
    throw new Error('요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.');
  }
  if (!json) {
    throw new Error('서버 응답 형식을 확인하지 못했습니다.');
  }
  if (!json.success) throw new Error(json.error || '요청 처리에 실패했습니다.');
  return json.data as T;
}

export const api = {
  // Auth
  testLogin: (email: string) =>
    request<{ user_id: string; role: string; access_token: string; refresh_token: string }>
      ('/api/v1/auth/test-login', { method: 'POST', body: JSON.stringify({ email }) }),
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

  // Health
  health: () => request<{ status: string; environment: string; services: Record<string, string> }>('/api/v1/health'),

  // i18n
  i18n: {
    list: (params?: { page?: number; prefix?: string; limit?: number; active_only?: boolean }) => {
      const q = new URLSearchParams();
      if (params?.page) q.set('page', String(params.page));
      if (params?.prefix) q.set('prefix', params.prefix);
      if (params?.limit) q.set('limit', String(params.limit));
      if (params?.active_only) q.set('active_only', 'true');
      return request<{ items: I18nRow[]; total: number; page: number; limit: number }>
        (`/api/v1/admin/i18n?${q}`);
    },
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
      items: (categoryKey: string) =>
        request<MasterItem[]>(`/api/v1/master/items?category_key=${encodeURIComponent(categoryKey)}`),
    },
    categories: {
      list: () => request<MasterCategory[]>('/api/v1/admin/master/categories'),
      create: (data: { key: string; sort_order?: number; translations?: Record<string, string> }) =>
        request<MasterCategory>('/api/v1/admin/master/categories', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: { sort_order?: number; is_active?: number; translations?: Record<string, string> }) =>
        request<MasterCategory>(`/api/v1/admin/master/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) =>
        request<{ id: string; deleted: boolean }>(`/api/v1/admin/master/categories/${id}`, { method: 'DELETE' }),
    },
    items: {
      list: (categoryKey?: string) => {
        const q = categoryKey ? `?category_key=${encodeURIComponent(categoryKey)}` : '';
        return request<MasterItem[]>(`/api/v1/admin/master/items${q}`);
      },
      create: (data: { category_id: string; sort_order?: number; metadata?: Record<string, unknown>; translations?: Record<string, string>; parent_id?: string | null }) =>
        request<MasterItem>('/api/v1/admin/master/items', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: { sort_order?: number; parent_id?: string | null; is_active?: number; metadata?: Record<string, unknown>; translations?: Record<string, string> }) =>
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
    list: (params?: { feed_type?: string; business_category_id?: string; pet_type_id?: string; tab?: string; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.feed_type) q.set('feed_type', params.feed_type);
      if (params?.business_category_id) q.set('business_category_id', params.business_category_id);
      if (params?.pet_type_id) q.set('pet_type_id', params.pet_type_id);
      if (params?.tab) q.set('tab', params.tab);
      if (params?.limit) q.set('limit', String(params.limit));
      const suffix = q.toString() ? `?${q.toString()}` : '';
      return request<{ feeds: FeedPost[] }>(`/api/v1/feeds${suffix}`);
    },
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
      list: (petId: string, params?: { range?: '1m' | '3m' | '6m' | '1y' | 'all' }) => {
        const q = new URLSearchParams();
        if (params?.range) q.set('range', params.range);
        const suffix = q.toString() ? `?${q.toString()}` : '';
        return request<{ logs: PetWeightLog[]; range: string; summary: WeightSummary }>(`/api/v1/pets/${petId}/weight-logs${suffix}`);
      },
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
      list: (petId: string, params?: { range?: '1w' | '1m' | '3m' | '6m' | '1y' | 'all' }) => {
        const q = new URLSearchParams();
        if (params?.range) q.set('range', params.range);
        const suffix = q.toString() ? `?${q.toString()}` : '';
        return request<{ logs: PetGlucoseLog[]; summary: GlucoseSummary | null; range: string }>(`/api/v1/pets/${petId}/glucose-logs${suffix}`);
      },
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
    checkMicrochip: (microchipNo: string, excludePetId?: string) => {
      const q = new URLSearchParams();
      q.set('microchip_no', microchipNo);
      if (excludePetId) q.set('exclude_pet_id', excludePetId);
      return request<{ available: boolean; reason?: string; pet_id?: string }>(`/api/v1/pets/check-microchip?${q.toString()}`);
    },
  },
  storage: {
    presignedUrl: (params: { type: 'user_avatar' | 'pet_avatar' | 'log_media' | 'feed_media' | 'completion_photo' | 'store_photo' | 'service_photo'; ext: string; subdir?: string }) => {
      const q = new URLSearchParams();
      q.set('type', params.type);
      q.set('ext', params.ext);
      if (params.subdir) q.set('subdir', params.subdir);
      return request<{ upload_url: string; file_key: string; public_url: string; expires_in: number }>(`/api/v1/storage/presigned-url?${q.toString()}`);
    },
  },
  bookings: {
    list: () => request<{ bookings: Booking[] }>('/api/v1/bookings'),
  },
  petAlbum: {
    list: (params?: {
      pet_id?: string;
      source_type?: string;
      media_type?: 'image' | 'video';
      sort?: 'latest' | 'oldest';
      include_pending?: boolean;
      limit?: number;
    }) => {
      const q = new URLSearchParams();
      if (params?.pet_id) q.set('pet_id', params.pet_id);
      if (params?.source_type) q.set('source_type', params.source_type);
      if (params?.media_type) q.set('media_type', params.media_type);
      if (params?.sort) q.set('sort', params.sort);
      if (params?.include_pending) q.set('include_pending', 'true');
      if (params?.limit) q.set('limit', String(params.limit));
      const suffix = q.toString() ? `?${q.toString()}` : '';
      return request<{ media: PetAlbumMedia[] }>(`/api/v1/pet-album${suffix}`);
    },
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
};

// Types
export interface I18nRow {
  id: string; key: string; page: string | null; is_active: number;
  ko: string | null; en: string | null; ja: string | null;
  zh_cn: string | null; zh_tw: string | null; es: string | null;
  fr: string | null; de: string | null; pt: string | null;
  vi: string | null; th: string | null; id_lang: string | null; ar: string | null;
  created_at: string; updated_at: string;
}

export interface MasterCategory {
  id: string; key: string; sort_order: number; is_active: number;
  ko_name?: string | null;
  ko?: string | null; en?: string | null; ja?: string | null;
  zh_cn?: string | null; zh_tw?: string | null; es?: string | null;
  fr?: string | null; de?: string | null; pt?: string | null;
  vi?: string | null; th?: string | null; id_lang?: string | null; ar?: string | null;
  created_at: string; updated_at: string;
}

export interface MasterItem {
  id: string; category_id: string; key: string; parent_id: string | null;
  sort_order: number; is_active: number; metadata: string;
  created_at: string; updated_at: string; category_key?: string; ko_name?: string | null;
  ko?: string | null; en?: string | null; ja?: string | null;
  zh_cn?: string | null; zh_tw?: string | null; es?: string | null;
  fr?: string | null; de?: string | null; pt?: string | null;
  vi?: string | null; th?: string | null; id_lang?: string | null; ar?: string | null;
}

export interface Country {
  id: string; code: string; name_key: string; is_active: number;
  sort_order: number; created_at: string;
  ko_name?: string | null;
  default_currency_id?: string | null;
  default_currency_code?: string | null;
  ko?: string | null; en?: string | null; ja?: string | null;
  zh_cn?: string | null; zh_tw?: string | null; es?: string | null;
  fr?: string | null; de?: string | null; pt?: string | null;
  vi?: string | null; th?: string | null; id_lang?: string | null; ar?: string | null;
}

export interface Currency {
  id: string; code: string; symbol: string; name_key: string;
  decimal_places: number; is_active: number; created_at: string;
}

export interface Pet {
  id: string;
  guardian_id: string;
  name: string;
  pet_type_id: string;
  breed_id?: string | null;
  gender_id?: string | null;
  neuter_status_id?: string | null;
  life_stage_id?: string | null;
  body_size_id?: string | null;
  country_id?: string | null;
  medication_status_id?: string | null;
  weight_unit_id?: string | null;
  health_condition_level_id?: string | null;
  activity_level_id?: string | null;
  diet_type_id?: string | null;
  living_style_id?: string | null;
  ownership_type_id?: string | null;
  coat_length_id?: string | null;
  coat_type_id?: string | null;
  grooming_cycle_id?: string | null;
  color_ids?: string[] | string;
  allergy_ids?: string[] | string;
  disease_history_ids?: string[] | string;
  symptom_tag_ids?: string[] | string;
  vaccination_ids?: string[] | string;
  temperament_ids?: string[] | string;
  notes?: string | null;
  intro_text?: string | null;
  birthday?: string | null;
  birth_date?: string | null;
  current_weight?: number | null;
  microchip_no?: string | null;
  weight_kg?: number | null;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PetWeightLog {
  id: string;
  pet_id: string;
  weight_value: number;
  weight_unit_id?: string | null;
  measured_at: string;
  recorded_by_user_id: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeightSummary {
  latest_weight?: number | null;
  latest_measured_at?: string | null;
  min_weight?: number | null;
  max_weight?: number | null;
  delta_from_prev?: number | null;
  weight_unit_id?: string | null;
}

export interface PetDiseaseHistory {
  id: string;
  pet_id: string;
  disease_group_item_id?: string | null;
  disease_item_id: string;
  diagnosed_at?: string | null;
  notes?: string | null;
  is_active: number;
  disease_key?: string | null;
  disease_group_key?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PetDiseaseDevice {
  id: string;
  pet_id: string;
  disease_item_id: string;
  device_item_id: string;
  serial_number?: string | null;
  nickname?: string | null;
  notes?: string | null;
  is_active: number;
  device_key?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface PetGlucoseLog {
  id: string;
  pet_id: string;
  disease_item_id: string;
  device_item_id?: string | null;
  glucose_value: number;
  glucose_unit_item_id: string;
  measured_at: string;
  measured_context_item_id?: string | null;
  notes?: string | null;
  recorded_by_user_id: string;
  judgement_level?: string | null;
  judgement_label?: string | null;
  created_at: string;
  updated_at: string;
}

export interface GlucoseSummary {
  latest_value?: number | null;
  latest_measured_at?: string | null;
  latest_judgement_level?: string | null;
  latest_judgement_label?: string | null;
}

export interface Booking {
  id: string;
  guardian_id: string;
  supplier_id: string;
  pet_id?: string | null;
  service_id?: string | null;
  business_category_id?: string | null;
  status: string;
  requested_date?: string | null;
  requested_time?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeedPost {
  id: string;
  feed_type: string;
  author_user_id: string;
  author_role: string;
  author_email?: string | null;
  pet_id?: string | null;
  pet_name?: string | null;
  business_category_id?: string | null;
  business_category_key?: string | null;
  business_category_ko?: string | null;
  pet_type_id?: string | null;
  pet_type_key?: string | null;
  pet_type_ko?: string | null;
  booking_guardian_email?: string | null;
  booking_supplier_email?: string | null;
  booking_guardian_id?: string | null;
  booking_supplier_id?: string | null;
  visibility_scope: string;
  caption?: string | null;
  media_urls: string[] | string;
  tags: string[] | string;
  like_count?: number;
  comment_count?: number;
  liked_by_me?: number;
  created_at: string;
}

export interface FeedComment {
  id: string;
  post_id: string;
  author_user_id: string;
  author_email?: string | null;
  parent_comment_id?: string | null;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PetAlbumMedia {
  id: string;
  pet_id: string;
  source_type: 'profile' | 'feed' | 'booking_completed' | 'health_record' | 'manual_upload';
  source_id?: string | null;
  booking_id?: string | null;
  media_type: 'image' | 'video';
  media_url: string;
  thumbnail_url?: string | null;
  caption?: string | null;
  tags: string[] | string;
  uploaded_by_user_id: string;
  uploaded_by_email?: string | null;
  visibility_scope: 'public' | 'friends_only' | 'private' | 'guardian_supplier_only' | 'booking_related';
  is_primary?: number;
  sort_order?: number;
  status: 'active' | 'pending' | 'hidden' | 'deleted';
  created_at: string;
  updated_at: string;
}

export interface FriendRequest {
  id: string;
  requester_user_id: string;
  requester_email?: string | null;
  receiver_user_id: string;
  receiver_email?: string | null;
  status: string;
  created_at: string;
  responded_at?: string | null;
}

export interface FriendConnection {
  id: string;
  relation_type: string;
  status: string;
  created_at: string;
  friend_user_id: string;
  friend_email: string;
  friend_role: string;
}
