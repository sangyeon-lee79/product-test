// S2: 마스터 데이터 API — LLD §4.2 master_categories, master_items
// GET  /api/v1/master/categories              — 카테고리 목록 (공개)
// GET  /api/v1/master/items?category_key=     — 아이템 목록 (공개)
// CRUD /api/v1/admin/master/categories        — Admin
// CRUD /api/v1/admin/master/items             — Admin

import type { Env } from '../types';
import { ok, created, err, newId, now } from '../types';
import { requireAuth, requireRole } from '../middleware/auth';
import type { JwtPayload } from '../types';

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
        const rows = await env.DB.prepare('SELECT * FROM master_categories ORDER BY sort_order, key').all();
        return ok(rows.results);
      }
      if (request.method === 'GET' && id) {
        const row = await env.DB.prepare('SELECT * FROM master_categories WHERE id = ?').bind(id).first();
        if (!row) return err('Not found', 404);
        return ok(row);
      }
      if (request.method === 'POST') {
        let body: { key: string; sort_order?: number };
        try { body = await request.json() as { key: string; sort_order?: number }; } catch { return err('Invalid JSON'); }
        if (!body.key) return err('key required');
        const exists = await env.DB.prepare('SELECT id FROM master_categories WHERE key = ?').bind(body.key).first();
        if (exists) return err('key already exists', 409, 'duplicate_key');
        const row = { id: newId(), key: body.key, sort_order: body.sort_order ?? 0, is_active: 1, created_at: now(), updated_at: now() };
        await env.DB.prepare(
          'INSERT INTO master_categories (id,key,sort_order,is_active,created_at,updated_at) VALUES (?,?,?,?,?,?)'
        ).bind(row.id, row.key, row.sort_order, row.is_active, row.created_at, row.updated_at).run();
        return created(row);
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
        let body: { category_id: string; key: string; parent_id?: string; sort_order?: number; metadata?: Record<string, unknown> };
        try { body = await request.json() as typeof body; } catch { return err('Invalid JSON'); }
        if (!body.category_id || !body.key) return err('category_id and key required');
        const exists = await env.DB.prepare('SELECT id FROM master_items WHERE category_id = ? AND key = ?').bind(body.category_id, body.key).first();
        if (exists) return err('key already exists in this category', 409, 'duplicate_key');
        const row = {
          id: newId(), category_id: body.category_id, key: body.key,
          parent_id: body.parent_id ?? null, sort_order: body.sort_order ?? 0,
          is_active: 1, metadata: JSON.stringify(body.metadata ?? {}),
          created_at: now(), updated_at: now(),
        };
        await env.DB.prepare(
          'INSERT INTO master_items (id,category_id,key,parent_id,sort_order,is_active,metadata,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)'
        ).bind(row.id, row.category_id, row.key, row.parent_id, row.sort_order, row.is_active, row.metadata, row.created_at, row.updated_at).run();
        return created({ ...row, metadata: body.metadata ?? {} });
      }
      if (request.method === 'PUT' && id) {
        let body: { key?: string; sort_order?: number; is_active?: boolean; metadata?: Record<string, unknown>; parent_id?: string | null };
        try { body = await request.json() as typeof body; } catch { return err('Invalid JSON'); }
        const sets: string[] = ['updated_at = ?'];
        const vals: (string | number | null)[] = [now()];
        if (body.key !== undefined) { sets.push('key = ?'); vals.push(body.key); }
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
        await env.DB.prepare('UPDATE master_items SET is_active = 0, updated_at = ? WHERE id = ?').bind(now(), id).run();
        return ok({ id, is_active: false });
      }
    }
  }

  return err('Not found', 404);
}
