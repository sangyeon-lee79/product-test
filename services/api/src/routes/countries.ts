// S4: 국가/통화 API — LLD §4.2 countries, currencies, country_currency_map
// GET  /api/v1/countries                     — 국가+통화 목록 (공개)
// CRUD /api/v1/admin/countries               — Admin
// CRUD /api/v1/admin/currencies              — Admin
// POST /api/v1/admin/countries/:id/currencies — 국가-통화 매핑

import type { Env } from '../types';
import { ok, created, err, newId, now } from '../types';
import { requireAuth, requireRole } from '../middleware/auth';
import type { JwtPayload } from '../types';
import { SUPPORTED_LANGS as LANGS } from '@petfolio/shared';

const CURRENCY_CATALOG: Record<string, { symbol: string; decimal_places: number }> = {
  KRW: { symbol: '₩', decimal_places: 0 },
  USD: { symbol: '$', decimal_places: 2 },
  JPY: { symbol: '¥', decimal_places: 0 },
  VND: { symbol: '₫', decimal_places: 0 },
  IDR: { symbol: 'Rp', decimal_places: 0 },
  EUR: { symbol: '€', decimal_places: 2 },
  SGD: { symbol: 'S$', decimal_places: 2 },
  THB: { symbol: '฿', decimal_places: 2 },
  CNY: { symbol: '¥', decimal_places: 2 },
  TWD: { symbol: 'NT$', decimal_places: 2 },
  MYR: { symbol: 'RM', decimal_places: 2 },
  PHP: { symbol: '₱', decimal_places: 2 },
  GBP: { symbol: '£', decimal_places: 2 },
  AUD: { symbol: 'A$', decimal_places: 2 },
  CAD: { symbol: 'C$', decimal_places: 2 },
};

async function upsertI18n(env: Env, i18nKey: string, translations: Record<string, string>) {
  const existing = await env.DB.prepare('SELECT id FROM i18n_translations WHERE key = ?').bind(i18nKey).first<{ id: string }>();
  const lv = LANGS.map(l => translations[l] ?? null);
  if (existing) {
    const sets: string[] = ['updated_at = ?'];
    const vals: (string | null)[] = [now()];
    for (const l of LANGS) {
      if ((translations[l] || '').trim()) { sets.push(`${l} = COALESCE(${l}, ?)`); vals.push(translations[l]); }
    }
    vals.push(existing.id);
    await env.DB.prepare(`UPDATE i18n_translations SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
  } else {
    await env.DB.prepare(
      `INSERT INTO i18n_translations (id,key,page,ko,en,ja,zh_cn,zh_tw,es,fr,de,pt,vi,th,id_lang,ar,is_active,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(newId(), i18nKey, 'country', ...lv, true, now(), now()).run();
  }
}

async function getNextCountrySortOrder(env: Env): Promise<number> {
  const row = await env.DB.prepare('SELECT COALESCE(MAX(sort_order), 0) as max_sort FROM countries').first<{ max_sort: number }>();
  return (row?.max_sort ?? 0) + 1;
}

async function setDefaultCurrency(env: Env, countryId: string, currencyId: string): Promise<void> {
  await env.DB.prepare('UPDATE country_currency_map SET is_default = false WHERE country_id = ?').bind(countryId).run();
  const mapId = newId();
  await env.DB.prepare(
    `INSERT INTO country_currency_map (id,country_id,currency_id,is_default) VALUES (?,?,?,true)
     ON CONFLICT (country_id, currency_id) DO UPDATE SET is_default = true`
  ).bind(mapId, countryId, currencyId).run();
}

async function ensureCurrencyByCode(env: Env, currencyCode: string): Promise<string> {
  const code = currencyCode.toUpperCase();
  const existing = await env.DB.prepare('SELECT id FROM currencies WHERE code = ?').bind(code).first<{ id: string }>();
  if (existing?.id) return existing.id;

  const preset = CURRENCY_CATALOG[code] ?? { symbol: code, decimal_places: 2 };
  const id = newId();
  await env.DB.prepare(
    'INSERT INTO currencies (id,code,symbol,name_key,decimal_places,is_active,created_at) VALUES (?,?,?,?,?,?,?)'
  ).bind(id, code, preset.symbol, `currency.${code.toLowerCase()}`, preset.decimal_places, true, now()).run();
  return id;
}

async function fetchCountryById(env: Env, id: string) {
  return env.DB.prepare(`
    SELECT
      c.*,
      tr.ko as ko_name,
      tr.en, tr.ja, tr.zh_cn, tr.zh_tw, tr.es, tr.fr, tr.de, tr.pt, tr.vi, tr.th, tr.id_lang, tr.ar,
      cur.id as default_currency_id,
      cur.code as default_currency_code
    FROM countries c
    LEFT JOIN i18n_translations tr ON tr.key = c.name_key
    LEFT JOIN country_currency_map ccm ON c.id = ccm.country_id AND ccm.is_default = true
    LEFT JOIN currencies cur ON ccm.currency_id = cur.id
    WHERE c.id = ?
  `).bind(id).first();
}

export async function handleCountries(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname;
  const isAdmin = path.startsWith('/api/v1/admin/');

  // ─── 공개: 국가 + 통화 매핑 목록 ─────────────────────────────────────────
  if (!isAdmin && path === '/api/v1/countries' && request.method === 'GET') {
    const rows = await env.DB.prepare(`
      SELECT c.*, cur.id as currency_id, cur.code as currency_code,
             cur.symbol as currency_symbol, cur.name_key as currency_name_key,
             cur.decimal_places
      FROM countries c
      LEFT JOIN country_currency_map ccm ON c.id = ccm.country_id AND ccm.is_default = true
      LEFT JOIN currencies cur ON ccm.currency_id = cur.id
      WHERE c.is_active = true ORDER BY c.sort_order, c.code
    `).all();
    return ok(rows.results);
  }

  // ─── Admin 전용 ───────────────────────────────────────────────────────────
  if (isAdmin) {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    const roleErr = requireRole(auth as JwtPayload, ['admin']);
    if (roleErr) return roleErr;

    // ─── 국가 CRUD ──────────────────────────────────────────────────────────
    if (path.startsWith('/api/v1/admin/countries')) {
      const idMatch = path.match(/\/countries\/([^/]+?)(?:\/currencies)?$/);
      const id = idMatch?.[1];
      const isCurrencyMap = path.endsWith('/currencies');

      if (request.method === 'GET' && !id) {
        const rows = await env.DB.prepare(`
          SELECT
            c.*,
            tr.ko as ko_name,
            tr.en, tr.ja, tr.zh_cn, tr.zh_tw, tr.es, tr.fr, tr.de, tr.pt, tr.vi, tr.th, tr.id_lang, tr.ar,
            cur.id as default_currency_id,
            cur.code as default_currency_code
          FROM countries c
          LEFT JOIN i18n_translations tr ON tr.key = c.name_key
          LEFT JOIN country_currency_map ccm ON c.id = ccm.country_id AND ccm.is_default = true
          LEFT JOIN currencies cur ON ccm.currency_id = cur.id
          ORDER BY c.sort_order, c.code
        `).all();
        return ok(rows.results);
      }
      if (request.method === 'GET' && id && !isCurrencyMap) {
        const row = await fetchCountryById(env, id);
        if (!row) return err('Not found', 404);
        return ok(row);
      }
      if (request.method === 'POST' && !id) {
        let body: { code: string; translations?: Record<string, string>; default_currency_code?: string };
        try { body = await request.json() as typeof body; } catch { return err('Invalid JSON'); }
        const code = (body.code || '').trim().toUpperCase();
        if (!/^[A-Z]{2}$/.test(code)) return err('code must be ISO 3166-1 alpha-2');
        const koName = body.translations?.ko?.trim();
        if (!koName) return err('ko translation required');
        const defaultCurrencyCode = (body.default_currency_code || '').trim().toUpperCase();
        if (!/^[A-Z]{3}$/.test(defaultCurrencyCode)) return err('default_currency_code required (ISO 4217)');

        const nameKey = `country.${code.toLowerCase()}`;
        const sortOrder = await getNextCountrySortOrder(env);
        const row = { id: newId(), code, name_key: nameKey, is_active: true, sort_order: sortOrder, created_at: now() };
        await env.DB.prepare('INSERT INTO countries (id,code,name_key,is_active,sort_order,created_at) VALUES (?,?,?,?,?,?)')
          .bind(row.id, row.code, row.name_key, row.is_active, row.sort_order, row.created_at).run();
        if (body.translations) await upsertI18n(env, nameKey, body.translations);
        const currencyId = await ensureCurrencyByCode(env, defaultCurrencyCode);
        await setDefaultCurrency(env, row.id, currencyId);
        return created(await fetchCountryById(env, row.id));
      }
      if (request.method === 'PUT' && id && !isCurrencyMap) {
        let body: { sort_order?: number; is_active?: boolean; translations?: Record<string, string>; default_currency_code?: string };
        try { body = await request.json() as typeof body; } catch { return err('Invalid JSON'); }
        const sets: string[] = [];
        const vals: (string | number | boolean)[] = [];
        if (body.sort_order !== undefined) { sets.push('sort_order = ?'); vals.push(body.sort_order); }
        if (body.is_active !== undefined) { sets.push('is_active = ?'); vals.push(body.is_active ? true : false); }
        if (sets.length > 0) {
          vals.push(id);
          await env.DB.prepare(`UPDATE countries SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
        }
        if (body.translations && Object.values(body.translations).some(v => v)) {
          const country = await env.DB.prepare('SELECT name_key FROM countries WHERE id = ?').bind(id).first<{ name_key: string }>();
          if (country) await upsertI18n(env, country.name_key, body.translations);
        }
        if (body.default_currency_code) {
          const currencyCode = body.default_currency_code.toUpperCase();
          if (!/^[A-Z]{3}$/.test(currencyCode)) return err('default_currency_code must be ISO 4217');
          const currencyId = await ensureCurrencyByCode(env, currencyCode);
          await setDefaultCurrency(env, id, currencyId);
        }
        return ok(await fetchCountryById(env, id));
      }
      if (request.method === 'DELETE' && id && !isCurrencyMap) {
        await env.DB.prepare('UPDATE countries SET is_active = false WHERE id = ?').bind(id).run();
        return ok({ id, is_active: false });
      }
      // 국가-통화 매핑 추가
      if (request.method === 'POST' && id && isCurrencyMap) {
        let body: { currency_id: string; is_default?: boolean };
        try { body = await request.json() as typeof body; } catch { return err('Invalid JSON'); }
        if (!body.currency_id) return err('currency_id required');
        if (body.is_default) {
          await env.DB.prepare('UPDATE country_currency_map SET is_default = false WHERE country_id = ?').bind(id).run();
        }
        const mapId = newId();
        await env.DB.prepare(
          `INSERT INTO country_currency_map (id,country_id,currency_id,is_default) VALUES (?,?,?,?)
           ON CONFLICT (country_id, currency_id) DO UPDATE SET is_default = excluded.is_default`
        ).bind(mapId, id, body.currency_id, body.is_default ? true : false).run();
        return created({ id: mapId, country_id: id, currency_id: body.currency_id, is_default: body.is_default ?? false });
      }
    }

    // ─── 통화 CRUD ──────────────────────────────────────────────────────────
    if (path.startsWith('/api/v1/admin/currencies')) {
      const idMatch = path.match(/\/currencies\/([^/]+)$/);
      const id = idMatch?.[1];

      if (request.method === 'GET' && !id) {
        const rows = await env.DB.prepare('SELECT * FROM currencies ORDER BY code').all();
        return ok(rows.results);
      }
      if (request.method === 'GET' && id) {
        const row = await env.DB.prepare('SELECT * FROM currencies WHERE id = ?').bind(id).first();
        if (!row) return err('Not found', 404);
        return ok(row);
      }
      if (request.method === 'POST') {
        let body: { code: string; symbol: string; name_key: string; decimal_places?: number };
        try { body = await request.json() as typeof body; } catch { return err('Invalid JSON'); }
        if (!body.code || !body.symbol || !body.name_key) return err('code, symbol, name_key required');
        const row = { id: newId(), code: body.code.toUpperCase(), symbol: body.symbol, name_key: body.name_key, decimal_places: body.decimal_places ?? 2, is_active: true, created_at: now() };
        await env.DB.prepare('INSERT INTO currencies (id,code,symbol,name_key,decimal_places,is_active,created_at) VALUES (?,?,?,?,?,?,?)')
          .bind(row.id, row.code, row.symbol, row.name_key, row.decimal_places, row.is_active, row.created_at).run();
        return created(row);
      }
      if (request.method === 'PUT' && id) {
        let body: { symbol?: string; name_key?: string; decimal_places?: number; is_active?: boolean };
        try { body = await request.json() as typeof body; } catch { return err('Invalid JSON'); }
        const sets: string[] = [];
        const vals: (string | number | boolean)[] = [];
        if (body.symbol !== undefined) { sets.push('symbol = ?'); vals.push(body.symbol); }
        if (body.name_key !== undefined) { sets.push('name_key = ?'); vals.push(body.name_key); }
        if (body.decimal_places !== undefined) { sets.push('decimal_places = ?'); vals.push(body.decimal_places); }
        if (body.is_active !== undefined) { sets.push('is_active = ?'); vals.push(body.is_active ? true : false); }
        if (sets.length === 0) return err('Nothing to update');
        vals.push(id);
        await env.DB.prepare(`UPDATE currencies SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
        return ok(await env.DB.prepare('SELECT * FROM currencies WHERE id = ?').bind(id).first());
      }
      if (request.method === 'DELETE' && id) {
        await env.DB.prepare('UPDATE currencies SET is_active = false WHERE id = ?').bind(id).run();
        return ok({ id, is_active: false });
      }
    }
  }

  return err('Not found', 404);
}
