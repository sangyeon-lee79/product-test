import { isLoggedIn, clearTokens } from './api';

export { isLoggedIn };

export function logout() {
  clearTokens();
}

export function normalizeRole(raw?: string | null): 'admin' | 'guardian' | 'provider' {
  const role = (raw || '').toLowerCase();
  if (role === 'supplier') return 'provider';
  if (role === 'admin' || role === 'provider' || role === 'guardian') return role;
  return 'guardian';
}

export function getStoredRole(): string {
  const stored = localStorage.getItem('user_role');
  if (stored) return normalizeRole(stored);
  const token = localStorage.getItem('access_token');
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const json = JSON.parse(atob(base64)) as { role?: string };
        return normalizeRole(json.role);
      }
    } catch {
      // ignore decode failures and fallback to default role
    }
  }
  return 'guardian';
}

export function storeRole(role: string) {
  localStorage.setItem('user_role', normalizeRole(role));
}

export function getRoleHomePath(role: string): '/admin' | '/guardian' | '/supplier' {
  const normalized = normalizeRole(role);
  if (normalized === 'admin') return '/admin';
  if (normalized === 'provider') return '/supplier';
  return '/guardian';
}

/* ── Last login method tracking ──────────────────────────── */
export type LoginMethod = 'google' | 'kakao' | 'apple' | 'email';
const LAST_LOGIN_KEY = 'petfolio_last_login';

export function saveLastLoginMethod(method: LoginMethod) {
  localStorage.setItem(LAST_LOGIN_KEY, method);
}

export function getLastLoginMethod(): LoginMethod | null {
  return localStorage.getItem(LAST_LOGIN_KEY) as LoginMethod | null;
}
