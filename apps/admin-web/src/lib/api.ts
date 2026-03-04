// Admin Web API 클라이언트

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787';

function getToken(): string | null {
  return localStorage.getItem('access_token');
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
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

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearTokens();
    window.location.href = '/#/login';
    throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
  }

  const json = await res.json() as { success: boolean; data?: T; error?: string };
  if (!json.success) throw new Error(json.error || `HTTP ${res.status}`);
  return json.data as T;
}

export const api = {
  // Auth
  testLogin: (email: string, role = 'admin') =>
    request<{ user_id: string; role: string; access_token: string; refresh_token: string }>
      ('/api/v1/auth/test-login', { method: 'POST', body: JSON.stringify({ email, role }) }),

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
    translate: (text: string) =>
      request<{ translations: Record<string, string> }>('/api/v1/admin/i18n/translate', { method: 'POST', body: JSON.stringify({ text }) }),
  },

  // Master
  master: {
    categories: {
      list: () => request<MasterCategory[]>('/api/v1/admin/master/categories'),
      create: (data: { key: string; sort_order?: number }) =>
        request<MasterCategory>('/api/v1/admin/master/categories', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: Partial<MasterCategory>) =>
        request<MasterCategory>(`/api/v1/admin/master/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) =>
        request<{ id: string; deleted: boolean }>(`/api/v1/admin/master/categories/${id}`, { method: 'DELETE' }),
    },
    items: {
      list: (categoryKey?: string) => {
        const q = categoryKey ? `?category_key=${encodeURIComponent(categoryKey)}` : '';
        return request<MasterItem[]>(`/api/v1/admin/master/items${q}`);
      },
      create: (data: { category_id: string; key: string; sort_order?: number; metadata?: Record<string, unknown> }) =>
        request<MasterItem>('/api/v1/admin/master/items', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: Partial<MasterItem>) =>
        request<MasterItem>(`/api/v1/admin/master/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      deactivate: (id: string) =>
        request<{ id: string; is_active: boolean }>(`/api/v1/admin/master/items/${id}`, { method: 'DELETE' }),
    },
  },

  // Disease Maps (S3)
  diseaseMaps: {
    tree: (diseaseId: string) =>
      request<DiseaseTree>(`/api/v1/master/disease-map?disease_id=${diseaseId}`),
    addSymptom: (data: { disease_id: string; symptom_id: string; is_required?: boolean; sort_order?: number }) =>
      request('/api/v1/admin/master/disease-maps/disease-symptom', { method: 'POST', body: JSON.stringify(data) }),
    removeSymptom: (id: string) =>
      request(`/api/v1/admin/master/disease-maps/disease-symptom/${id}`, { method: 'DELETE' }),
    addMetric: (data: { symptom_id: string; metric_id: string; is_required?: boolean; sort_order?: number }) =>
      request('/api/v1/admin/master/disease-maps/symptom-metric', { method: 'POST', body: JSON.stringify(data) }),
    removeMetric: (id: string) =>
      request(`/api/v1/admin/master/disease-maps/symptom-metric/${id}`, { method: 'DELETE' }),
    addUnit: (data: { metric_id: string; unit_id: string; is_default?: boolean; sort_order?: number }) =>
      request('/api/v1/admin/master/disease-maps/metric-unit', { method: 'POST', body: JSON.stringify(data) }),
    removeUnit: (id: string) =>
      request(`/api/v1/admin/master/disease-maps/metric-unit/${id}`, { method: 'DELETE' }),
    addLogtype: (data: { metric_id: string; logtype_id: string; is_default?: boolean; sort_order?: number }) =>
      request('/api/v1/admin/master/disease-maps/metric-logtype', { method: 'POST', body: JSON.stringify(data) }),
    removeLogtype: (id: string) =>
      request(`/api/v1/admin/master/disease-maps/metric-logtype/${id}`, { method: 'DELETE' }),
  },

  // Countries
  countries: {
    list: () => request<Country[]>('/api/v1/admin/countries'),
    create: (data: { code: string; name_key: string; sort_order?: number }) =>
      request<Country>('/api/v1/admin/countries', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Country>) =>
      request<Country>(`/api/v1/admin/countries/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    mapCurrency: (countryId: string, currencyId: string, isDefault: boolean) =>
      request(`/api/v1/admin/countries/${countryId}/currencies`, {
        method: 'POST', body: JSON.stringify({ currency_id: currencyId, is_default: isDefault }),
      }),
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
  created_at: string; updated_at: string;
}

export interface MasterItem {
  id: string; category_id: string; key: string; parent_id: string | null;
  sort_order: number; is_active: number; metadata: string;
  created_at: string; updated_at: string; category_key?: string;
}

export interface Country {
  id: string; code: string; name_key: string; is_active: number;
  sort_order: number; created_at: string;
}

export interface DiseaseTree {
  disease: { id: string; key: string };
  symptoms: Array<{
    id: string; key: string; map_id: string; is_required: boolean;
    metrics: Array<{
      id: string; key: string; map_id: string; is_required: boolean;
      units: Array<{ id: string; key: string; map_id: string; is_default: boolean }>;
      log_types: Array<{ id: string; key: string; map_id: string; is_default: boolean }>;
    }>;
  }>;
}

export interface Currency {
  id: string; code: string; symbol: string; name_key: string;
  decimal_places: number; is_active: number; created_at: string;
}
