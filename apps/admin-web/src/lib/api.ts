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
  const res = await fetch(url, { ...options, headers });

  const contentType = res.headers.get('content-type') || '';
  const raw = await res.text();
  let json: { success?: boolean; data?: T; error?: string } | null = null;
  if (raw) {
    if (contentType.includes('application/json')) {
      try {
        json = JSON.parse(raw) as { success?: boolean; data?: T; error?: string };
      } catch {
        throw new Error(`API JSON 파싱 실패 (${res.status}) - ${url}`);
      }
    } else {
      throw new Error(`API 응답 형식 오류 (${res.status}) - ${url}`);
    }
  }

  if (res.status === 401) {
    clearTokens();
    window.location.href = '/#/login';
    throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
  }

  if (!res.ok) {
    throw new Error(json?.error || `HTTP ${res.status} - ${url}`);
  }
  if (!json) {
    throw new Error(`API 빈 응답 (${res.status}) - ${url}`);
  }
  if (!json.success) throw new Error(json.error || `HTTP ${res.status} - ${url}`);
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
    categories: {
      list: () => request<MasterCategory[]>('/api/v1/admin/master/categories'),
      create: (data: { sort_order?: number; translations?: Record<string, string> }) =>
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
