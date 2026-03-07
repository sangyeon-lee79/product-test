// Device Management API
// Admin: /api/v1/admin/devices/types|manufacturers|brands|models|units
// Public: /api/v1/devices/types|manufacturers|brands|models|units
// Guardian: /api/v1/pets/:petId/guardian-devices

import type { Env } from '../types';
import { ok, created, err, newId, now } from '../types';
import { requireAuth, requireRole } from '../middleware/auth';
import type { JwtPayload } from '../types';

// ─── Helpers ───────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text.trim().toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

// ─── Main Handler ───────────────────────────────────────────────────────────

export async function handleDevices(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname;
  const method = request.method;
  const isAdmin = path.startsWith('/api/v1/admin/');

  // ─── Public endpoints ────────────────────────────────────────────────────

  if (!isAdmin && !path.startsWith('/api/v1/pets/')) {
    // GET /api/v1/devices/types
    if (path === '/api/v1/devices/types' && method === 'GET') {
      const rows = await env.DB.prepare(
        `SELECT * FROM device_types WHERE status = 'active' ORDER BY sort_order, name_ko`
      ).all();
      return ok(rows.results);
    }

    // GET /api/v1/devices/manufacturers?device_type_id=
    if (path === '/api/v1/devices/manufacturers' && method === 'GET') {
      const rows = await env.DB.prepare(
        `SELECT * FROM device_manufacturers WHERE status = 'active' ORDER BY sort_order, name_ko`
      ).all();
      return ok(rows.results);
    }

    // GET /api/v1/devices/brands?manufacturer_id=
    if (path === '/api/v1/devices/brands' && method === 'GET') {
      const manufacturerId = url.searchParams.get('manufacturer_id');
      let q = `SELECT * FROM device_brands WHERE status = 'active'`;
      const binds: string[] = [];
      if (manufacturerId) { q += ' AND manufacturer_id = ?'; binds.push(manufacturerId); }
      q += ' ORDER BY name_ko';
      const rows = await env.DB.prepare(q).bind(...binds).all();
      return ok(rows.results);
    }

    // GET /api/v1/devices/models?device_type_id=&manufacturer_id=&brand_id=
    if (path === '/api/v1/devices/models' && method === 'GET') {
      const typeId = url.searchParams.get('device_type_id');
      const mfrId = url.searchParams.get('manufacturer_id');
      const brandId = url.searchParams.get('brand_id');
      const binds: string[] = [];
      let where = `WHERE m.status = 'active'`;
      if (typeId) { where += ' AND m.device_type_id = ?'; binds.push(typeId); }
      if (mfrId) { where += ' AND m.manufacturer_id = ?'; binds.push(mfrId); }
      if (brandId) { where += ' AND m.brand_id = ?'; binds.push(brandId); }
      const rows = await env.DB.prepare(
        `SELECT m.*, dt.name_ko as type_name_ko, dt.name_en as type_name_en,
                mfr.name_ko as mfr_name_ko, mfr.name_en as mfr_name_en,
                b.name_ko as brand_name_ko, b.name_en as brand_name_en
         FROM device_models m
         LEFT JOIN device_types dt ON dt.id = m.device_type_id
         LEFT JOIN device_manufacturers mfr ON mfr.id = m.manufacturer_id
         LEFT JOIN device_brands b ON b.id = m.brand_id
         ${where}
         ORDER BY m.model_name`
      ).bind(...binds).all();
      return ok(rows.results);
    }

    // GET /api/v1/devices/units
    if (path === '/api/v1/devices/units' && method === 'GET') {
      const rows = await env.DB.prepare(
        `SELECT * FROM measurement_units WHERE status = 'active' ORDER BY sort_order, name`
      ).all();
      return ok(rows.results);
    }

    return err('Not Found', 404, 'not_found');
  }

  // ─── Guardian: /api/v1/pets/:petId/guardian-devices ──────────────────────

  if (path.startsWith('/api/v1/pets/')) {
    const authResult = await requireAuth(request, env);
    if (authResult instanceof Response) return authResult;
    const user = authResult as JwtPayload;

    const petMatch = path.match(/^\/api\/v1\/pets\/([^/]+)\/guardian-devices(?:\/([^/]+))?$/);
    if (!petMatch) return err('Not Found', 404, 'not_found');
    const petId = petMatch[1];
    const deviceId = petMatch[2];

    // Verify pet belongs to guardian
    const pet = await env.DB.prepare(
      `SELECT id FROM pets WHERE id = ? AND guardian_id = ? AND status != 'deleted'`
    ).bind(petId, user.sub).first<{ id: string }>();
    if (!pet) return err('Pet not found', 404, 'not_found');

    // GET list
    if (!deviceId && method === 'GET') {
      const rows = await env.DB.prepare(
        `SELECT gd.*, dm.model_name, dm.model_code,
                dt.name_ko as type_name_ko, dt.name_en as type_name_en, dt.key as type_key,
                mfr.name_ko as mfr_name_ko, mfr.name_en as mfr_name_en,
                b.name_ko as brand_name_ko, b.name_en as brand_name_en
         FROM guardian_devices gd
         JOIN device_models dm ON dm.id = gd.device_model_id
         LEFT JOIN device_types dt ON dt.id = dm.device_type_id
         LEFT JOIN device_manufacturers mfr ON mfr.id = dm.manufacturer_id
         LEFT JOIN device_brands b ON b.id = dm.brand_id
         WHERE gd.pet_id = ? AND gd.status != 'deleted'
         ORDER BY gd.created_at DESC`
      ).bind(petId).all();
      return ok({ devices: rows.results });
    }

    // POST create
    if (!deviceId && method === 'POST') {
      const body = await request.json<{ device_model_id: string; nickname?: string; serial_number?: string; start_date?: string; notes?: string }>();
      if (!body.device_model_id) return err('device_model_id required', 400, 'missing_field');

      const model = await env.DB.prepare(`SELECT id FROM device_models WHERE id = ? AND status = 'active'`).bind(body.device_model_id).first<{ id: string }>();
      if (!model) return err('Device model not found', 404, 'not_found');

      const id = newId();
      await env.DB.prepare(
        `INSERT INTO guardian_devices (id, pet_id, device_model_id, nickname, serial_number, start_date, notes, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`
      ).bind(id, petId, body.device_model_id, body.nickname ?? null, body.serial_number ?? null, body.start_date ?? null, body.notes ?? null, now(), now()).run();

      return created({ id });
    }

    // PUT update
    if (deviceId && method === 'PUT') {
      const body = await request.json<{ nickname?: string; serial_number?: string; notes?: string; start_date?: string }>();
      const sets: string[] = ['updated_at = ?'];
      const vals: (string | null)[] = [now()];
      if ('nickname' in body) { sets.push('nickname = ?'); vals.push(body.nickname ?? null); }
      if ('serial_number' in body) { sets.push('serial_number = ?'); vals.push(body.serial_number ?? null); }
      if ('notes' in body) { sets.push('notes = ?'); vals.push(body.notes ?? null); }
      if ('start_date' in body) { sets.push('start_date = ?'); vals.push(body.start_date ?? null); }
      vals.push(deviceId, petId);
      await env.DB.prepare(`UPDATE guardian_devices SET ${sets.join(', ')} WHERE id = ? AND pet_id = ?`).bind(...vals).run();
      return ok({ id: deviceId, updated: true });
    }

    // DELETE (soft)
    if (deviceId && method === 'DELETE') {
      await env.DB.prepare(
        `UPDATE guardian_devices SET status = 'deleted', updated_at = ? WHERE id = ? AND pet_id = ?`
      ).bind(now(), deviceId, petId).run();
      return ok({ id: deviceId, deleted: true });
    }

    return err('Method Not Allowed', 405, 'method_not_allowed');
  }

  // ─── Admin endpoints ─────────────────────────────────────────────────────

  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) return authResult;
  const roleResult = requireRole(authResult as JwtPayload, ['admin']);
  if (roleResult instanceof Response) return roleResult;

  // ── Device Types ──────────────────────────────────────────────────────────
  if (path === '/api/v1/admin/devices/types' && method === 'GET') {
    const rows = await env.DB.prepare(`SELECT * FROM device_types ORDER BY sort_order, name_ko`).all();
    return ok(rows.results);
  }
  if (path === '/api/v1/admin/devices/types' && method === 'POST') {
    const body = await request.json<{ key?: string; name_ko: string; name_en: string; sort_order?: number }>();
    if (!body.name_ko || !body.name_en) return err('name_ko and name_en required', 400, 'missing_field');
    const key = (body.key || slugify(body.name_ko)).toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const id = newId();
    await env.DB.prepare(
      `INSERT INTO device_types (id, key, name_ko, name_en, status, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'active', ?, ?, ?)`
    ).bind(id, key, body.name_ko, body.name_en, body.sort_order ?? 0, now(), now()).run();
    const row = await env.DB.prepare(`SELECT * FROM device_types WHERE id = ?`).bind(id).first();
    return created(row);
  }

  const typeIdMatch = path.match(/^\/api\/v1\/admin\/devices\/types\/([^/]+)$/);
  if (typeIdMatch) {
    const typeId = typeIdMatch[1];
    if (method === 'PUT') {
      const body = await request.json<{ name_ko?: string; name_en?: string; sort_order?: number; status?: string }>();
      const sets: string[] = ['updated_at = ?'];
      const vals: (string | number | null)[] = [now()];
      if (body.name_ko) { sets.push('name_ko = ?'); vals.push(body.name_ko); }
      if (body.name_en) { sets.push('name_en = ?'); vals.push(body.name_en); }
      if (body.sort_order != null) { sets.push('sort_order = ?'); vals.push(body.sort_order); }
      if (body.status) { sets.push('status = ?'); vals.push(body.status); }
      vals.push(typeId);
      await env.DB.prepare(`UPDATE device_types SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
      return ok(await env.DB.prepare(`SELECT * FROM device_types WHERE id = ?`).bind(typeId).first());
    }
    if (method === 'DELETE') {
      await env.DB.prepare(`UPDATE device_types SET status = 'inactive', updated_at = ? WHERE id = ?`).bind(now(), typeId).run();
      return ok({ id: typeId, deleted: true });
    }
  }

  // ── Manufacturers ─────────────────────────────────────────────────────────
  if (path === '/api/v1/admin/devices/manufacturers' && method === 'GET') {
    const rows = await env.DB.prepare(`SELECT * FROM device_manufacturers ORDER BY sort_order, name_ko`).all();
    return ok(rows.results);
  }
  if (path === '/api/v1/admin/devices/manufacturers' && method === 'POST') {
    const body = await request.json<{ key?: string; name_ko: string; name_en: string; country?: string; sort_order?: number }>();
    if (!body.name_ko || !body.name_en) return err('name_ko and name_en required', 400, 'missing_field');
    const key = (body.key || slugify(body.name_en)).toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const id = newId();
    await env.DB.prepare(
      `INSERT INTO device_manufacturers (id, key, name_ko, name_en, country, status, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?)`
    ).bind(id, key, body.name_ko, body.name_en, body.country ?? null, body.sort_order ?? 0, now(), now()).run();
    return created(await env.DB.prepare(`SELECT * FROM device_manufacturers WHERE id = ?`).bind(id).first());
  }

  const mfrIdMatch = path.match(/^\/api\/v1\/admin\/devices\/manufacturers\/([^/]+)$/);
  if (mfrIdMatch) {
    const mfrId = mfrIdMatch[1];
    if (method === 'PUT') {
      const body = await request.json<{ name_ko?: string; name_en?: string; country?: string; sort_order?: number; status?: string }>();
      const sets: string[] = ['updated_at = ?'];
      const vals: (string | number | null)[] = [now()];
      if (body.name_ko) { sets.push('name_ko = ?'); vals.push(body.name_ko); }
      if (body.name_en) { sets.push('name_en = ?'); vals.push(body.name_en); }
      if ('country' in body) { sets.push('country = ?'); vals.push(body.country ?? null); }
      if (body.sort_order != null) { sets.push('sort_order = ?'); vals.push(body.sort_order); }
      if (body.status) { sets.push('status = ?'); vals.push(body.status); }
      vals.push(mfrId);
      await env.DB.prepare(`UPDATE device_manufacturers SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
      return ok(await env.DB.prepare(`SELECT * FROM device_manufacturers WHERE id = ?`).bind(mfrId).first());
    }
    if (method === 'DELETE') {
      await env.DB.prepare(`UPDATE device_manufacturers SET status = 'inactive', updated_at = ? WHERE id = ?`).bind(now(), mfrId).run();
      return ok({ id: mfrId, deleted: true });
    }
  }

  // ── Brands ────────────────────────────────────────────────────────────────
  if (path === '/api/v1/admin/devices/brands' && method === 'GET') {
    const manufacturerId = url.searchParams.get('manufacturer_id');
    let q = `SELECT b.*, m.name_ko as mfr_name_ko FROM device_brands b JOIN device_manufacturers m ON m.id = b.manufacturer_id`;
    const binds: string[] = [];
    if (manufacturerId) { q += ' WHERE b.manufacturer_id = ?'; binds.push(manufacturerId); }
    q += ' ORDER BY b.name_ko';
    const rows = await env.DB.prepare(q).bind(...binds).all();
    return ok(rows.results);
  }
  if (path === '/api/v1/admin/devices/brands' && method === 'POST') {
    const body = await request.json<{ manufacturer_id: string; name_ko: string; name_en: string }>();
    if (!body.manufacturer_id || !body.name_ko || !body.name_en) return err('manufacturer_id, name_ko, name_en required', 400, 'missing_field');
    const id = newId();
    await env.DB.prepare(
      `INSERT INTO device_brands (id, manufacturer_id, name_ko, name_en, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'active', ?, ?)`
    ).bind(id, body.manufacturer_id, body.name_ko, body.name_en, now(), now()).run();
    return created(await env.DB.prepare(`SELECT * FROM device_brands WHERE id = ?`).bind(id).first());
  }

  const brandIdMatch = path.match(/^\/api\/v1\/admin\/devices\/brands\/([^/]+)$/);
  if (brandIdMatch) {
    const brandId = brandIdMatch[1];
    if (method === 'PUT') {
      const body = await request.json<{ name_ko?: string; name_en?: string; status?: string }>();
      const sets: string[] = ['updated_at = ?'];
      const vals: (string | null)[] = [now()];
      if (body.name_ko) { sets.push('name_ko = ?'); vals.push(body.name_ko); }
      if (body.name_en) { sets.push('name_en = ?'); vals.push(body.name_en); }
      if (body.status) { sets.push('status = ?'); vals.push(body.status); }
      vals.push(brandId);
      await env.DB.prepare(`UPDATE device_brands SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
      return ok(await env.DB.prepare(`SELECT * FROM device_brands WHERE id = ?`).bind(brandId).first());
    }
    if (method === 'DELETE') {
      await env.DB.prepare(`UPDATE device_brands SET status = 'inactive', updated_at = ? WHERE id = ?`).bind(now(), brandId).run();
      return ok({ id: brandId, deleted: true });
    }
  }

  // ── Models ────────────────────────────────────────────────────────────────
  if (path === '/api/v1/admin/devices/models' && method === 'GET') {
    const typeId = url.searchParams.get('device_type_id');
    const mfrId = url.searchParams.get('manufacturer_id');
    const brandId = url.searchParams.get('brand_id');
    const binds: string[] = [];
    let where = `WHERE 1=1`;
    if (typeId) { where += ' AND m.device_type_id = ?'; binds.push(typeId); }
    if (mfrId) { where += ' AND m.manufacturer_id = ?'; binds.push(mfrId); }
    if (brandId) { where += ' AND m.brand_id = ?'; binds.push(brandId); }
    const rows = await env.DB.prepare(
      `SELECT m.*, dt.name_ko as type_name_ko, mfr.name_ko as mfr_name_ko, b.name_ko as brand_name_ko
       FROM device_models m
       LEFT JOIN device_types dt ON dt.id = m.device_type_id
       LEFT JOIN device_manufacturers mfr ON mfr.id = m.manufacturer_id
       LEFT JOIN device_brands b ON b.id = m.brand_id
       ${where} ORDER BY m.model_name`
    ).bind(...binds).all();
    return ok(rows.results);
  }
  if (path === '/api/v1/admin/devices/models' && method === 'POST') {
    const body = await request.json<{ device_type_id: string; manufacturer_id: string; brand_id?: string; model_name: string; model_code?: string; description?: string }>();
    if (!body.device_type_id || !body.manufacturer_id || !body.model_name) return err('device_type_id, manufacturer_id, model_name required', 400, 'missing_field');
    const id = newId();
    await env.DB.prepare(
      `INSERT INTO device_models (id, device_type_id, manufacturer_id, brand_id, model_name, model_code, description, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`
    ).bind(id, body.device_type_id, body.manufacturer_id, body.brand_id ?? null, body.model_name, body.model_code ?? null, body.description ?? null, now(), now()).run();
    return created(await env.DB.prepare(
      `SELECT m.*, dt.name_ko as type_name_ko, mfr.name_ko as mfr_name_ko, b.name_ko as brand_name_ko
       FROM device_models m
       LEFT JOIN device_types dt ON dt.id = m.device_type_id
       LEFT JOIN device_manufacturers mfr ON mfr.id = m.manufacturer_id
       LEFT JOIN device_brands b ON b.id = m.brand_id
       WHERE m.id = ?`
    ).bind(id).first());
  }

  const modelIdMatch = path.match(/^\/api\/v1\/admin\/devices\/models\/([^/]+)$/);
  if (modelIdMatch) {
    const modelId = modelIdMatch[1];
    if (method === 'PUT') {
      const body = await request.json<{ model_name?: string; model_code?: string; description?: string; status?: string; device_type_id?: string; manufacturer_id?: string; brand_id?: string | null }>();
      const sets: string[] = ['updated_at = ?'];
      const vals: (string | null)[] = [now()];
      if (body.model_name) { sets.push('model_name = ?'); vals.push(body.model_name); }
      if ('model_code' in body) { sets.push('model_code = ?'); vals.push(body.model_code ?? null); }
      if ('description' in body) { sets.push('description = ?'); vals.push(body.description ?? null); }
      if (body.status) { sets.push('status = ?'); vals.push(body.status); }
      if (body.device_type_id) { sets.push('device_type_id = ?'); vals.push(body.device_type_id); }
      if (body.manufacturer_id) { sets.push('manufacturer_id = ?'); vals.push(body.manufacturer_id); }
      if ('brand_id' in body) { sets.push('brand_id = ?'); vals.push(body.brand_id ?? null); }
      vals.push(modelId);
      await env.DB.prepare(`UPDATE device_models SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
      return ok(await env.DB.prepare(`SELECT * FROM device_models WHERE id = ?`).bind(modelId).first());
    }
    if (method === 'DELETE') {
      await env.DB.prepare(`UPDATE device_models SET status = 'inactive', updated_at = ? WHERE id = ?`).bind(now(), modelId).run();
      return ok({ id: modelId, deleted: true });
    }
  }

  // ── Measurement Units ─────────────────────────────────────────────────────
  if (path === '/api/v1/admin/devices/units' && method === 'GET') {
    const rows = await env.DB.prepare(`SELECT * FROM measurement_units ORDER BY sort_order, name`).all();
    return ok(rows.results);
  }
  if (path === '/api/v1/admin/devices/units' && method === 'POST') {
    const body = await request.json<{ key: string; name: string; symbol?: string; sort_order?: number }>();
    if (!body.key || !body.name) return err('key and name required', 400, 'missing_field');
    const id = newId();
    await env.DB.prepare(
      `INSERT INTO measurement_units (id, key, name, symbol, status, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'active', ?, ?, ?)`
    ).bind(id, body.key, body.name, body.symbol ?? null, body.sort_order ?? 0, now(), now()).run();
    return created(await env.DB.prepare(`SELECT * FROM measurement_units WHERE id = ?`).bind(id).first());
  }

  const unitIdMatch = path.match(/^\/api\/v1\/admin\/devices\/units\/([^/]+)$/);
  if (unitIdMatch) {
    const unitId = unitIdMatch[1];
    if (method === 'PUT') {
      const body = await request.json<{ name?: string; symbol?: string; sort_order?: number; status?: string }>();
      const sets: string[] = ['updated_at = ?'];
      const vals: (string | number | null)[] = [now()];
      if (body.name) { sets.push('name = ?'); vals.push(body.name); }
      if ('symbol' in body) { sets.push('symbol = ?'); vals.push(body.symbol ?? null); }
      if (body.sort_order != null) { sets.push('sort_order = ?'); vals.push(body.sort_order); }
      if (body.status) { sets.push('status = ?'); vals.push(body.status); }
      vals.push(unitId);
      await env.DB.prepare(`UPDATE measurement_units SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
      return ok(await env.DB.prepare(`SELECT * FROM measurement_units WHERE id = ?`).bind(unitId).first());
    }
  }

  return err('Not Found', 404, 'not_found');
}
