/**
 * @petfolio/shared/i18n/constants.ts
 * 전역 다국어 상수 정의 (Single Source of Truth)
 */

export const SUPPORTED_LANGS = [
  'ko', 'en', 'ja', 'zh_cn', 'zh_tw', 'es', 'fr', 'de', 'pt', 'vi', 'th', 'id_lang', 'ar'
] as const;

export type Lang = typeof SUPPORTED_LANGS[number];

export const LANG_LABELS: Record<Lang, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  zh_cn: '中文(简体)',
  zh_tw: '中文(繁體)',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  vi: 'Tiếng Việt',
  th: 'ภาษาไทย',
  id_lang: 'Bahasa Indonesia',
  ar: 'العربية',
};

// Google Translate API 매핑 (API에서 사용)
export const GOOGLE_LANG_MAP: Record<Exclude<Lang, 'ko'>, string> = {
  en: 'en',
  ja: 'ja',
  zh_cn: 'zh-CN',
  zh_tw: 'zh-TW',
  es: 'es',
  fr: 'fr',
  de: 'de',
  pt: 'pt',
  vi: 'vi',
  th: 'th',
  id_lang: 'id',
  ar: 'ar',
};

export const DEFAULT_LANG: Lang = 'ko';

/** BCP-47 locale strings for Intl / toLocaleString */
export const BCP47_LOCALE_MAP: Record<Lang, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  zh_cn: 'zh-CN',
  zh_tw: 'zh-TW',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  pt: 'pt-BR',
  vi: 'vi-VN',
  th: 'th-TH',
  id_lang: 'id-ID',
  ar: 'ar-SA',
};

export const MISSING_TRANSLATION_MAP: Record<Lang, string> = {
  ko: '번역 누락',
  en: 'Missing translation',
  ja: '翻訳不足',
  zh_cn: '缺少翻译',
  zh_tw: '缺少翻譯',
  es: 'Falta traducción',
  fr: 'Traduction manquante',
  de: 'Fehlende Übersetzung',
  pt: 'Tradução ausente',
  vi: 'Thiếu bản dịch',
  th: 'ไม่มีคำแปล',
  id_lang: 'Terjemahan tidak ada',
  ar: 'ترجمة مفقودة',
};
