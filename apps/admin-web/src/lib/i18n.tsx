// i18n 유틸 — DB 기반 다국어 (하드코딩 제로 원칙)
// GET /api/v1/i18n?lang={lang}&prefix=admin → { [key]: value }
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getApiBase } from './apiBase';

const API_BASE = getApiBase();

export const SUPPORTED_LANGS = ['ko','en','ja','zh_cn','zh_tw','es','fr','de','pt','vi','th','id_lang','ar'] as const;
export type Lang = typeof SUPPORTED_LANGS[number];

export const LANG_LABELS: Record<Lang, string> = {
  ko:      '한국어',
  en:      'English',
  ja:      '日本語',
  zh_cn:   '中文(简)',
  zh_tw:   '中文(繁)',
  es:      'Español',
  fr:      'Français',
  de:      'Deutsch',
  pt:      'Português',
  vi:      'Tiếng Việt',
  th:      'ภาษาไทย',
  id_lang: 'Bahasa Indonesia',
  ar:      'العربية',
};

interface I18nCtx {
  t: (key: string, fallback?: string) => string;
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const I18nContext = createContext<I18nCtx>({
  t: (_k, fb) => fb ?? '',
  lang: 'ko',
  setLang: () => {},
});

const STORAGE_KEY = 'admin_lang';

function getInitialLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY) as Lang;
  if (SUPPORTED_LANGS.includes(stored)) return stored;
  // 브라우저 언어 자동 감지
  const browser = navigator.language.toLowerCase().replace('-', '_');
  const match = SUPPORTED_LANGS.find(l => browser.startsWith(l.replace('_lang', '')));
  return match ?? 'ko';
}

export function useT() {
  return useContext(I18nContext).t;
}

export function useI18n() {
  return useContext(I18nContext);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);
  const [trans, setTrans] = useState<Record<string, string>>({});

  useEffect(() => {
    setTrans({}); // 언어 전환 시 이전 텍스트 클리어
    fetch(`${API_BASE}/api/v1/i18n?lang=${lang}&prefix=admin`)
      .then(r => r.json() as Promise<{ success: boolean; data: Record<string, string> }>)
      .then(json => { if (json.success) setTrans(json.data); })
      .catch(() => {});
  }, [lang]);

  const setLang = (l: Lang) => {
    localStorage.setItem(STORAGE_KEY, l);
    setLangState(l);
  };

  const t = (key: string, fallback?: string) => trans[key] || fallback || key;

  return (
    <I18nContext.Provider value={{ t, lang, setLang }}>
      {children}
    </I18nContext.Provider>
  );
}
