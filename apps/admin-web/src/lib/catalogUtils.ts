// Device/Feed 카탈로그 페이지 공통 유틸리티
// DevicePage.tsx / FeedPage.tsx 공유

import { api } from './api';
import type { I18nRow } from '../types/api';
import { SUPPORTED_LANGS } from '@petfolio/shared';

export const emptyTrans = (): Record<string, string> =>
  Object.fromEntries(SUPPORTED_LANGS.map((l) => [l, ''])) as Record<string, string>;

export function findMissingTranslationLangs(translations: Record<string, string>): string[] {
  return SUPPORTED_LANGS.filter((lang) => !(translations[lang] || '').trim());
}

export function itemLabel(item?: {
  display_label?: string | null;
  name_en?: string | null;
  name_ko?: string | null;
  key?: string | null;
  model_count?: number;
} | null): string {
  if (!item) return '-';
  const display = (item.display_label || '').trim();
  const base = display || item.name_en || item.name_ko || item.key || '-';
  const count = typeof item.model_count === 'number' ? item.model_count : null;
  return count === null ? base : `${base} [ ${count} ]`;
}

export function sortByModelCountDesc<T extends { model_count?: number; sort_order?: number }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const ac = typeof a.model_count === 'number' ? a.model_count : 0;
    const bc = typeof b.model_count === 'number' ? b.model_count : 0;
    if (bc !== ac) return bc - ac;
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });
}

export function i18nRowToTranslations(row: I18nRow): Record<string, string> {
  return {
    ko: row.ko ?? '',
    en: row.en ?? '',
    ja: row.ja ?? '',
    zh_cn: row.zh_cn ?? '',
    zh_tw: row.zh_tw ?? '',
    es: row.es ?? '',
    fr: row.fr ?? '',
    de: row.de ?? '',
    pt: row.pt ?? '',
    vi: row.vi ?? '',
    th: row.th ?? '',
    id_lang: row.id_lang ?? '',
    ar: row.ar ?? '',
  };
}

export async function autoTranslate(
  koText: string,
  current: Record<string, string>,
  setTrans: (t: Record<string, string>) => void,
  setTranslating: (b: boolean) => void,
  setError: (msg: string) => void,
): Promise<void> {
  if (!koText) return;
  setTranslating(true);
  try {
    const result = await api.i18n.translate(koText, current);
    const merged: Record<string, string> = { ...current, ko: koText };
    for (const langCode of SUPPORTED_LANGS) {
      if (langCode === 'ko') continue;
      if ((current[langCode] || '').trim()) continue;
      const translated = result.translations[langCode];
      if (translated) merged[langCode] = translated;
    }
    setTrans(merged);
  } catch (e) {
    setError(e instanceof Error ? e.message : String(e));
  } finally {
    setTranslating(false);
  }
}
