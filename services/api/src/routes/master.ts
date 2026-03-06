// S2: 마스터 데이터 API — LLD §4.2 master_categories, master_items
// GET  /api/v1/master/categories              — 카테고리 목록 (공개)
// GET  /api/v1/master/items?category_key=     — 아이템 목록 (공개)
// CRUD /api/v1/admin/master/categories        — Admin
// CRUD /api/v1/admin/master/items             — Admin

import type { Env } from '../types';
import { ok, created, err, newId, now } from '../types';
import { requireAuth, requireRole } from '../middleware/auth';
import type { JwtPayload } from '../types';

const LANGS = ['ko','en','ja','zh_cn','zh_tw','es','fr','de','pt','vi','th','id_lang','ar'] as const;

function randomToken(length = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < length; i++) out += chars[bytes[i] % chars.length];
  return out;
}

async function generateCategoryKey(env: Env): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const candidate = `master.${randomToken(6)}`;
    const exists = await env.DB.prepare('SELECT id FROM master_categories WHERE key = ?').bind(candidate).first();
    if (!exists) return candidate;
  }
  throw new Error('Failed to generate unique category key');
}

async function generateItemKey(env: Env, categoryId: string): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const candidate = `master_item.${randomToken(6)}`;
    const exists = await env.DB.prepare(
      'SELECT id FROM master_items WHERE category_id = ? AND key = ?'
    ).bind(categoryId, candidate).first();
    if (!exists) return candidate;
  }
  throw new Error('Failed to generate unique item key');
}

function categoryI18nKey(categoryKey: string): string {
  return categoryKey.startsWith('master.') ? categoryKey : `master.${categoryKey}`;
}

function itemI18nKey(categoryKey: string, itemKey: string): string {
  return categoryKey.startsWith('master.')
    ? `${categoryKey}.${itemKey}`
    : `master.${categoryKey}.${itemKey}`;
}

async function upsertI18n(env: Env, i18nKey: string, translations: Record<string, string>) {
  const existing = await env.DB.prepare('SELECT id FROM i18n_translations WHERE key = ?').bind(i18nKey).first<{ id: string }>();
  const lv = LANGS.map(l => translations[l] ?? null);
  if (existing) {
    // 기존 키가 있으면 빈 값만 채움 (덮어쓰지 않음)
    const sets: string[] = ['updated_at = ?'];
    const vals: (string | null)[] = [now()];
    for (const l of LANGS) {
      if (translations[l]) { sets.push(`${l} = COALESCE(${l}, ?)`); vals.push(translations[l]); }
    }
    vals.push(existing.id);
    await env.DB.prepare(`UPDATE i18n_translations SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
  } else {
    await env.DB.prepare(
      `INSERT INTO i18n_translations (id,key,page,ko,en,ja,zh_cn,zh_tw,es,fr,de,pt,vi,th,id_lang,ar,is_active,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(newId(), i18nKey, 'master', ...lv, 1, now(), now()).run();
  }
}

export async function handleMaster(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname;
  const isAdmin = path.startsWith('/api/v1/admin/master');

  // ─── 공개: 카테고리 목록 ──────────────────────────────────────────────────
  if (!isAdmin && path === '/api/v1/master/categories' && request.method === 'GET') {
    const rows = await env.DB.prepare(
      'SELECT * FROM master_categories WHERE is_active = 1 ORDER BY sort_order, key'
    ).all();
    return ok(rows.results);
  }

  // ─── 공개: 아이템 목록 ────────────────────────────────────────────────────
  if (!isAdmin && path === '/api/v1/master/items' && request.method === 'GET') {
    const categoryKey = url.searchParams.get('category_key');
    if (!categoryKey) return err('category_key required');

    const cat = await env.DB.prepare(
      'SELECT id FROM master_categories WHERE key = ? AND is_active = 1'
    ).bind(categoryKey).first<{ id: string }>();
    if (!cat) return err('Category not found', 404);

    const rows = await env.DB.prepare(
      'SELECT * FROM master_items WHERE category_id = ? AND is_active = 1 ORDER BY sort_order, key'
    ).bind(cat.id).all();
    return ok(rows.results);
  }

  // ─── Admin 전용 ───────────────────────────────────────────────────────────
  if (isAdmin) {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    const roleErr = requireRole(auth as JwtPayload, ['admin']);
    if (roleErr) return roleErr;

    // ─── Admin: 카테고리 CRUD ───────────────────────────────────────────────
    if (path.startsWith('/api/v1/admin/master/categories')) {
      const idMatch = path.match(/\/categories\/([^/]+)$/);
      const id = idMatch?.[1];

      if (request.method === 'GET' && !id) {
        const rows = await env.DB.prepare(
          `SELECT
             mc.*,
             tr.ko AS ko_name
           FROM master_categories mc
           LEFT JOIN i18n_translations tr
             ON tr.key = CASE
               WHEN mc.key LIKE 'master.%' THEN mc.key
               ELSE ('master.' || mc.key)
             END
           ORDER BY mc.sort_order, mc.key`
        ).all();
        return ok(rows.results);
      }
      if (request.method === 'GET' && id) {
        const row = await env.DB.prepare('SELECT * FROM master_categories WHERE id = ?').bind(id).first();
        if (!row) return err('Not found', 404);
        return ok(row);
      }
      if (request.method === 'POST') {
        let body: { sort_order?: number; translations?: Record<string, string> };
        try { body = await request.json() as typeof body; } catch { return err('Invalid JSON'); }
        const koName = body.translations?.ko?.trim();
        if (!koName) return err('ko translation required');

        const autoKey = await generateCategoryKey(env);
        const row = { id: newId(), key: autoKey, sort_order: body.sort_order ?? 0, is_active: 1, created_at: now(), updated_at: now() };
        await env.DB.prepare(
          'INSERT INTO master_categories (id,key,sort_order,is_active,created_at,updated_at) VALUES (?,?,?,?,?,?)'
        ).bind(row.id, row.key, row.sort_order, row.is_active, row.created_at, row.updated_at).run();
        if (body.translations && Object.values(body.translations).some(v => v)) {
          await upsertI18n(env, categoryI18nKey(row.key), body.translations);
        }
        return created({ ...row, ko_name: koName });
      }
      if (request.method === 'PUT' && id) {
        let body: { key?: string; sort_order?: number; is_active?: boolean };
        try { body = await request.json() as { key?: string; sort_order?: number; is_active?: boolean }; } catch { return err('Invalid JSON'); }
        const sets: string[] = ['updated_at = ?'];
        const vals: (string | number)[] = [now()];
        if (body.key !== undefined) { sets.push('key = ?'); vals.push(body.key); }
        if (body.sort_order !== undefined) { sets.push('sort_order = ?'); vals.push(body.sort_order); }
        if (body.is_active !== undefined) { sets.push('is_active = ?'); vals.push(body.is_active ? 1 : 0); }
        vals.push(id);
        const result = await env.DB.prepare(`UPDATE master_categories SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
        if (result.meta.changes === 0) return err('Not found', 404);
        return ok(await env.DB.prepare('SELECT * FROM master_categories WHERE id = ?').bind(id).first());
      }
      if (request.method === 'DELETE' && id) {
        // 사용중이면 비활성화, 아이템 없으면 실제 삭제
        const itemCount = await env.DB.prepare('SELECT COUNT(*) as c FROM master_items WHERE category_id = ?').bind(id).first<{ c: number }>();
        if ((itemCount?.c ?? 0) > 0) {
          await env.DB.prepare('UPDATE master_categories SET is_active = 0, updated_at = ? WHERE id = ?').bind(now(), id).run();
          return ok({ id, deleted: false, message: 'Deactivated (items exist)' });
        }
        await env.DB.prepare('DELETE FROM master_categories WHERE id = ?').bind(id).run();
        return ok({ id, deleted: true });
      }
    }

    // ─── Admin: 아이템 CRUD ────────────────────────────────────────────────
    if (path.startsWith('/api/v1/admin/master/items')) {
      const idMatch = path.match(/\/items\/([^/]+)$/);
      const id = idMatch?.[1];

      if (request.method === 'GET' && !id) {
        const categoryKey = url.searchParams.get('category_key');
        let query = `SELECT mi.*, mc.key as category_key FROM master_items mi
                     JOIN master_categories mc ON mi.category_id = mc.id WHERE 1=1`;
        const params: (string | number)[] = [];
        if (categoryKey) { query += ' AND mc.key = ?'; params.push(categoryKey); }
        query += ' ORDER BY mi.sort_order, mi.key';
        const rows = await env.DB.prepare(query).bind(...params).all();
        return ok(rows.results);
      }
      if (request.method === 'GET' && id) {
        const row = await env.DB.prepare('SELECT * FROM master_items WHERE id = ?').bind(id).first();
        if (!row) return err('Not found', 404);
        return ok(row);
      }
      if (request.method === 'POST') {
        let body: { category_id: string; parent_id?: string; sort_order?: number; metadata?: Record<string, unknown>; translations?: Record<string, string> };
        try { body = await request.json() as typeof body; } catch { return err('Invalid JSON'); }
        if (!body.category_id) return err('category_id required');
        if (!body.translations?.ko?.trim()) return err('ko translation required');

        const autoKey = await generateItemKey(env, body.category_id);
        const row = {
          id: newId(), category_id: body.category_id, key: autoKey,
          parent_id: body.parent_id ?? null, sort_order: body.sort_order ?? 0,
          is_active: 1, metadata: JSON.stringify(body.metadata ?? {}),
          created_at: now(), updated_at: now(),
        };
        await env.DB.prepare(
          'INSERT INTO master_items (id,category_id,key,parent_id,sort_order,is_active,metadata,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)'
        ).bind(row.id, row.category_id, row.key, row.parent_id, row.sort_order, row.is_active, row.metadata, row.created_at, row.updated_at).run();
        if (body.translations && Object.values(body.translations).some(v => v)) {
          const cat = await env.DB.prepare('SELECT key FROM master_categories WHERE id = ?').bind(body.category_id).first<{ key: string }>();
          if (cat) await upsertI18n(env, itemI18nKey(cat.key, row.key), body.translations);
        }
        return created({ ...row, metadata: body.metadata ?? {} });
      }
      if (request.method === 'PUT' && id) {
        let body: { sort_order?: number; is_active?: boolean; metadata?: Record<string, unknown>; parent_id?: string | null };
        try { body = await request.json() as typeof body; } catch { return err('Invalid JSON'); }
        const sets: string[] = ['updated_at = ?'];
        const vals: (string | number | null)[] = [now()];
        if (body.sort_order !== undefined) { sets.push('sort_order = ?'); vals.push(body.sort_order); }
        if (body.is_active !== undefined) { sets.push('is_active = ?'); vals.push(body.is_active ? 1 : 0); }
        if (body.metadata !== undefined) { sets.push('metadata = ?'); vals.push(JSON.stringify(body.metadata)); }
        if (body.parent_id !== undefined) { sets.push('parent_id = ?'); vals.push(body.parent_id); }
        vals.push(id);
        const result = await env.DB.prepare(`UPDATE master_items SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
        if (result.meta.changes === 0) return err('Not found', 404);
        return ok(await env.DB.prepare('SELECT * FROM master_items WHERE id = ?').bind(id).first());
      }
      if (request.method === 'DELETE' && id) {
        // 실제 삭제 시도. 외래 키 제약 조건 등으로 실패할 수 있음.
        try {
          const result = await env.DB.prepare('DELETE FROM master_items WHERE id = ?').bind(id).run();
          if (result.meta.changes === 0) return err('Item not found', 404);
          return ok({ id, deleted: true });
        } catch (e: unknown) {
          // 제약 조건 오류 발생 시 비활성화로 대체
          await env.DB.prepare('UPDATE master_items SET is_active = 0, updated_at = ? WHERE id = ?').bind(now(), id).run();
          return ok({ id, deleted: false, message: 'Deactivated (used in other data)' });
        }
      }
    }
  }

  return err('Not found', 404);
}
