// 공통 SQL 헬퍼 함수 — devices.ts / feedCatalog.ts / master.ts 공유
// A-7: hasColumn 결과를 모듈 레벨 Map에 캐싱 (Workers 인스턴스 내 재사용)

import type { Env } from '../types';
import { newId, now } from '../types';
import { SUPPORTED_LANGS as LANGS } from '@petfolio/shared';

// ─── Schema Cache (A-7) ─────────────────────────────────────────────────────
// Cloudflare Workers 인스턴스 내에서 PRAGMA 결과를 재사용해 DB 쿼리 50%+ 절감
const _columnCache = new Map<string, Set<string>>();
const _tableCache = new Map<string, boolean>();

export async function hasColumn(env: Env, table: string, column: string): Promise<boolean> {
  const cacheKey = table;
  if (!_columnCache.has(cacheKey)) {
    const rows = await env.DB.prepare(`PRAGMA table_info(${table})`).all<{ name: string }>();
    _columnCache.set(cacheKey, new Set(rows.results.map((r) => r.name)));
  }
  return _columnCache.get(cacheKey)!.has(column);
}

export async function hasTable(env: Env, table: string): Promise<boolean> {
  if (_tableCache.has(table)) return _tableCache.get(table)!;
  const row = await env.DB.prepare(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1"
  ).bind(table).first<{ name?: string }>();
  const result = Boolean(row?.name);
  _tableCache.set(table, result);
  return result;
}

// ─── Lang ────────────────────────────────────────────────────────────────────

export function resolveLang(url: URL): typeof LANGS[number] {
  const raw = (url.searchParams.get('lang') || 'ko').toLowerCase() as typeof LANGS[number];
  return LANGS.includes(raw) ? raw : 'ko';
}

// ─── Parent Map ──────────────────────────────────────────────────────────────

export async function syncParentMap(
  env: Env,
  table: string,
  childCol: string,
  childId: string,
  parentCol: string,
  parentIds: string[],
): Promise<void> {
  await env.DB.prepare(`DELETE FROM ${table} WHERE ${childCol} = ?`).bind(childId).run();
  for (const parentId of Array.from(new Set(parentIds.filter(Boolean)))) {
    await env.DB.prepare(
      `INSERT OR IGNORE INTO ${table} (id, ${childCol}, ${parentCol}, created_at) VALUES (?, ?, ?, ?)`
    ).bind(newId(), childId, parentId, now()).run();
  }
}

// ─── i18n ────────────────────────────────────────────────────────────────────

export function normalizedTranslations(
  input: Record<string, string> | undefined,
  ko: string,
  en: string,
): Record<string, string> {
  const fallback = en || ko;
  const out: Record<string, string> = {};
  for (const lang of LANGS) {
    const v = (input?.[lang] || '').trim();
    if (v) out[lang] = v;
    else if (lang === 'ko') out[lang] = ko;
    else if (lang === 'en') out[lang] = en;
    else out[lang] = fallback;
  }
  return out;
}

export async function upsertI18n(
  env: Env,
  i18nKey: string,
  translations: Record<string, string>,
  page: string,
): Promise<void> {
  const existing = await env.DB.prepare('SELECT id FROM i18n_translations WHERE key = ?').bind(i18nKey).first<{ id: string }>();
  const values = LANGS.map((lang) => (translations[lang] || '').trim() || null);
  if (existing) {
    await env.DB.prepare(
      `UPDATE i18n_translations
       SET ko = COALESCE(?, ko),
           en = COALESCE(?, en),
           ja = COALESCE(?, ja),
           zh_cn = COALESCE(?, zh_cn),
           zh_tw = COALESCE(?, zh_tw),
           es = COALESCE(?, es),
           fr = COALESCE(?, fr),
           de = COALESCE(?, de),
           pt = COALESCE(?, pt),
           vi = COALESCE(?, vi),
           th = COALESCE(?, th),
           id_lang = COALESCE(?, id_lang),
           ar = COALESCE(?, ar),
           updated_at = ?
       WHERE id = ?`
    ).bind(...values, now(), existing.id).run();
    return;
  }
  await env.DB.prepare(
    `INSERT INTO i18n_translations
      (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`
  ).bind(newId(), i18nKey, page, ...values, now(), now()).run();
}
