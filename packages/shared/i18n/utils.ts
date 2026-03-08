/**
 * @petfolio/shared/i18n/utils.ts
 * 다국어 관련 유틸리티 함수
 */
import { Lang, SUPPORTED_LANGS, DEFAULT_LANG } from './constants';

/**
 * 브라우저 환경에서 초기 언어 설정 감지
 */
export function getInitialLang(storageKey: string): Lang {
  if (typeof window === 'undefined') return DEFAULT_LANG;

  const stored = localStorage.getItem(storageKey) as Lang;
  if (SUPPORTED_LANGS.includes(stored)) return stored;

  // 브라우저 언어 자동 감지 및 매핑
  const browser = navigator.language.toLowerCase().replace('-', '_');
  
  // zh_cn, zh_tw 등 특수 처리
  if (browser.startsWith('zh_cn') || browser.startsWith('zh-cn')) return 'zh_cn';
  if (browser.startsWith('zh_tw') || browser.startsWith('zh-tw') || browser.startsWith('zh_hk') || browser.startsWith('zh-hk')) return 'zh_tw';
  
  const match = SUPPORTED_LANGS.find(l => 
    browser.startsWith(l.replace('_lang', '').replace('_', '-'))
  );
  
  return match ?? DEFAULT_LANG;
}

/**
 * 번역 키가 유효한지 검증하는 패턴 (API 및 Admin에서 사용)
 */
export const KEY_LITERAL_PATTERN = /^(master|admin|platform|guardian|common|public)\.[a-z0-9_.-]+$/i;

/**
 * 번역 누락 시 기본값 처리
 */
export function getTranslation(
  trans: Record<string, string>,
  key: string,
  lang: Lang,
  missingMap: Record<Lang, string>,
  fallback?: string
): string {
  const value = trans[key];
  if (value !== undefined && value !== null && String(value).trim() !== '') {
    return value;
  }
  return fallback ?? missingMap[lang] ?? 'Missing translation';
}
