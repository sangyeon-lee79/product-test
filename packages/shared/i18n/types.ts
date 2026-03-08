/**
 * @petfolio/shared/i18n/types.ts
 * 다국어 관련 타입 정의
 */
import { Lang } from './constants';

export * from './constants';

// DB 기반 번역 스키마 (API 및 shared에서 공통 사용)
export interface I18nTranslation {
  id: string;
  key: string;
  page?: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
  // 각 언어별 필드
  ko: string | null;
  en: string | null;
  ja: string | null;
  zh_cn: string | null;
  zh_tw: string | null;
  es: string | null;
  fr: string | null;
  de: string | null;
  pt: string | null;
  vi: string | null;
  th: string | null;
  id_lang: string | null;
  ar: string | null;
}

// 번역 데이터 맵 (API 응답 형식)
export type TranslationData = Record<string, string>;

// i18n 컨텍스트 인터페이스 (Frontend용)
export interface I18nContextType {
  t: (key: string, fallback?: string) => string;
  lang: Lang;
  setLang: (lang: Lang) => void;
  isLoaded: boolean;
}
