// S4: 국가/통화 API — LLD §4.2 countries, currencies, country_currency_map
// GET  /api/v1/countries                     — 국가+통화 목록 (공개)
// CRUD /api/v1/admin/countries               — Admin
// CRUD /api/v1/admin/currencies              — Admin
// POST /api/v1/admin/countries/:id/currencies — 국가-통화 매핑

import type { Env } from '../types';
import { ok, created, err, newId, now } from '../types';
import { requireAuth, requireRole } from '../middleware/auth';
import type { JwtPayload } from '../types';

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
      LEFT JOIN country_currency_map ccm ON c.id = ccm.country_id AND ccm.is_default = 1
      LEFT JOIN currencies cur ON ccm.currency_id = cur.id
      WHERE c.is_active = 1 ORDER BY c.sort_order, c.code
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
        const rows = await env.DB.prepare('SELECT * FROM countries ORDER BY sort_order, code').all();
        return ok(rows.results);
      }
      if (request.method === 'GET' && id && !isCurrencyMap) {
        const row = await env.DB.prepare(`
          SELECT c.*, json_group_array(json_object(
            'currency_id', cur.id, 'code', cur.code, 'symbol', cur.symbol,
            'is_default', ccm.is_default
          )) as currencies
          FROM countries c
          LEFT JOIN country_currency_map ccm ON c.id = ccm.country_id
          LEFT JOIN currencies cur ON ccm.currency_id = cur.id
          WHERE c.id = ? GROUP BY c.id
        `).bind(id).first();
        if (!row) return err('Not found', 404);
        return ok(row);
      }
      if (request.method === 'POST' && !id) {
        let body: { code: string; name_key: string; sort_order?: number };
        try { body = await request.json() as typeof body; } catch { return err('Invalid JSON'); }
        if (!body.code || !body.name_key) return err('code and name_key required');
        const row = { id: newId(), code: body.code.toUpperCase(), name_key: body.name_key, is_active: 1, sort_order: body.sort_order ?? 0, created_at: now() };
        await env.DB.prepare('INSERT INTO countries (id,code,name_key,is_active,sort_order,created_at) VALUES (?,?,?,?,?,?)')
          .bind(row.id, row.code, row.name_key, row.is_active, row.sort_order, row.created_at).run();
        return created(row);
      }
      if (request.method === 'PUT' && id && !isCurrencyMap) {
        let body: { name_key?: string; sort_order?: number; is_active?: boolean };
        try { body = await request.json() as typeof body; } catch { return err('Invalid JSON'); }
        const sets: string[] = [];
        const vals: (string | number)[] = [];
        if (body.name_key !== undefined) { sets.push('name_key = ?'); vals.push(body.name_key); }
        if (body.sort_order !== undefined) { sets.push('sort_order = ?'); vals.push(body.sort_order); }
        if (body.is_active !== undefined) { sets.push('is_active = ?'); vals.push(body.is_active ? 1 : 0); }
        if (sets.length === 0) return err('Nothing to update');
        vals.push(id);
        await env.DB.prepare(`UPDATE countries SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
        return ok(await env.DB.prepare('SELECT * FROM countries WHERE id = ?').bind(id).first());
      }
      if (request.method === 'DELETE' && id && !isCurrencyMap) {
        await env.DB.prepare('UPDATE countries SET is_active = 0 WHERE id = ?').bind(id).run();
        return ok({ id, is_active: false });
      }
      // 국가-통화 매핑 추가
      if (request.method === 'POST' && id && isCurrencyMap) {
        let body: { currency_id: string; is_default?: boolean };
        try { body = await request.json() as typeof body; } catch { return err('Invalid JSON'); }
        if (!body.currency_id) return err('currency_id required');
        if (body.is_default) {
          await env.DB.prepare('UPDATE country_currency_map SET is_default = 0 WHERE country_id = ?').bind(id).run();
        }
        const mapId = newId();
        await env.DB.prepare('INSERT OR REPLACE INTO country_currency_map (id,country_id,currency_id,is_default) VALUES (?,?,?,?)')
          .bind(mapId, id, body.currency_id, body.is_default ? 1 : 0).run();
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
        const row = { id: newId(), code: body.code.toUpperCase(), symbol: body.symbol, name_key: body.name_key, decimal_places: body.decimal_places ?? 2, is_active: 1, created_at: now() };
        await env.DB.prepare('INSERT INTO currencies (id,code,symbol,name_key,decimal_places,is_active,created_at) VALUES (?,?,?,?,?,?,?)')
          .bind(row.id, row.code, row.symbol, row.name_key, row.decimal_places, row.is_active, row.created_at).run();
        return created(row);
      }
      if (request.method === 'PUT' && id) {
        let body: { symbol?: string; name_key?: string; decimal_places?: number; is_active?: boolean };
        try { body = await request.json() as typeof body; } catch { return err('Invalid JSON'); }
        const sets: string[] = [];
        const vals: (string | number)[] = [];
        if (body.symbol !== undefined) { sets.push('symbol = ?'); vals.push(body.symbol); }
        if (body.name_key !== undefined) { sets.push('name_key = ?'); vals.push(body.name_key); }
        if (body.decimal_places !== undefined) { sets.push('decimal_places = ?'); vals.push(body.decimal_places); }
        if (body.is_active !== undefined) { sets.push('is_active = ?'); vals.push(body.is_active ? 1 : 0); }
        if (sets.length === 0) return err('Nothing to update');
        vals.push(id);
        await env.DB.prepare(`UPDATE currencies SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
        return ok(await env.DB.prepare('SELECT * FROM currencies WHERE id = ?').bind(id).first());
      }
      if (request.method === 'DELETE' && id) {
        await env.DB.prepare('UPDATE currencies SET is_active = 0 WHERE id = ?').bind(id).run();
        return ok({ id, is_active: false });
      }
    }
  }

  return err('Not found', 404);
}
