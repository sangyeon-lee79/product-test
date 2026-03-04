// i18n 유틸 — DB 기반 번역 (하드코딩 제로 원칙)
// GET /api/v1/i18n?lang=ko&prefix=admin → { [key]: value }
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787';

type TFunc = (key: string, fallback?: string) => string;

const I18nContext = createContext<TFunc>((_key, fb) => fb ?? '');

export function useT(): TFunc {
  return useContext(I18nContext);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [trans, setTrans] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/i18n?lang=ko&prefix=admin`)
      .then(r => r.json() as Promise<{ success: boolean; data: Record<string, string> }>)
      .then(json => { if (json.success) setTrans(json.data); })
      .catch(() => {}); // 실패 시 fallback 값 사용
  }, []);

  const t: TFunc = (key, fallback) => trans[key] || fallback || key;

  return <I18nContext.Provider value={t}>{children}</I18nContext.Provider>;
}
