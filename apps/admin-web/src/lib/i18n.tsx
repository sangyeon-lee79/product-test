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
    // 병합이 필요한 프리픽스 정의
    const prefixes = ['admin', 'master', 'platform', 'guardian', 'common', 'public'];
    
    Promise.all(
      prefixes.map(prefix => 
        fetch(`${API_BASE}/api/v1/i18n?lang=${lang}&prefix=${prefix}`)
          .then(r => r.json() as Promise<{ success: boolean; data: Record<string, string> }>)
          .catch(() => ({ success: false, data: {} }))
      )
    )
      .then(results => {
        const merged: Record<string, string> = {};
        results.forEach(res => {
          if (res.success) Object.assign(merged, res.data);
        });
        setTrans(merged);
        initApiTranslator((key, fb) => getTranslation(merged, key, lang, MISSING_TRANSLATION_MAP, fb));
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
    return getTranslation(trans, key, lang, MISSING_TRANSLATION_MAP, fallback);
  };

  return (
    <I18nContext.Provider value={{ t, lang, setLang, isLoaded }}>
      {children}
    </I18nContext.Provider>
  );
}
