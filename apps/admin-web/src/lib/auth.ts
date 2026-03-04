import { isLoggedIn, clearTokens } from './api';

export { isLoggedIn };

export function logout() {
  clearTokens();
  window.location.href = '/login';
}

export function getStoredRole(): string {
  return localStorage.getItem('user_role') || 'admin';
}

export function storeRole(role: string) {
  localStorage.setItem('user_role', role);
}
