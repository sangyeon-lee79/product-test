/**
 * apps/admin-web/src/lib/i18n.tsx
 * 공유 i18n 모듈을 사용하는 Admin 다국어 유틸리티
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getApiBase } from './apiBase';
import { initApiTranslator } from './api';
import { 
  SUPPORTED_LANGS, 
  LANG_LABELS, 
  getInitialLang as getInitialLangFromShared,
  getTranslation,
  MISSING_TRANSLATION_MAP,
  type Lang 
} from '@petfolio/shared';

const API_BASE = getApiBase();
const STORAGE_KEY = 'admin_lang';
const IS_DEV = import.meta.env.DEV;
const _warnedKeys = new Set<string>();

interface I18nCtx {
  t: (key: string, fallback?: string) => string;
  lang: Lang;
  setLang: (lang: Lang) => void;
  isLoaded: boolean;
}

const I18nContext = createContext<I18nCtx>({
  t: (_k, fb) => fb ?? '',
  lang: 'ko',
  setLang: () => {},
  isLoaded: false,
});

export { SUPPORTED_LANGS, LANG_LABELS };
export type { Lang };

export function useT() {
  return useContext(I18nContext).t;
}

export function useI18n() {
  return useContext(I18nContext);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => getInitialLangFromShared(STORAGE_KEY));
  const [trans, setTrans] = useState<Record<string, string>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    // prefix 없이 전체 번역 로드 — 누락 prefix 방지
    fetch(`${API_BASE}/api/v1/i18n?lang=${lang}`)
      .then(r => r.json() as Promise<{ success: boolean; data: Record<string, string> }>)
      .then(res => {
        const data = res.success ? res.data : {};
        setTrans(data);
        initApiTranslator((key, fb) => getTranslation(data, key, lang, MISSING_TRANSLATION_MAP, fb));
        setIsLoaded(true);
      })
      .catch(() => {
        setIsLoaded(true);
      });
  }, [lang]);

  const setLang = (l: Lang) => {
    localStorage.setItem(STORAGE_KEY, l);
    setLangState(l);
  };

  const t = (key: string, fallback?: string) => {
    if (IS_DEV && isLoaded && !(key in trans) && !_warnedKeys.has(key)) {
      _warnedKeys.add(key);
      console.warn(`[i18n] missing key: "${key}"${fallback ? ` (fallback: "${fallback}")` : ''}`);
    }
    return getTranslation(trans, key, lang, MISSING_TRANSLATION_MAP, fallback);
  };

  return (
    <I18nContext.Provider value={{ t, lang, setLang, isLoaded }}>
      {children}
    </I18nContext.Provider>
  );
}
