// S3: 질병 연결 매핑 API — LLD §4.2 매핑 4테이블
// GET  /api/v1/master/disease-map?disease_id=   — 공개 트리 응답
// CRUD /api/v1/admin/master/disease-maps/*       — Admin 매핑 관리

import type { Env } from '../types';
import { ok, created, err, newId } from '../types';
import { requireAuth, requireRole } from '../middleware/auth';
import type { JwtPayload } from '../types';

// ─── 공개: 질병 연결 트리 ─────────────────────────────────────────────────────
// Response: Disease → Symptoms[] → Metrics[] → Units[] + LogTypes[]
async function getDiseaseTree(diseaseId: string, env: Env) {
  // 1. disease → symptoms
  const symptomsRows = await env.DB.prepare(`
    SELECT dsm.id as map_id, dsm.is_required, dsm.sort_order, dsm.is_active,
           mi.id, mi.key
    FROM disease_symptom_map dsm
    JOIN master_items mi ON dsm.symptom_id = mi.id
    WHERE dsm.disease_id = ? AND dsm.is_active = 1 AND mi.is_active = 1
    ORDER BY dsm.sort_order, mi.key
  `).bind(diseaseId).all<{ map_id: string; is_required: number; sort_order: number; is_active: number; id: string; key: string }>();

  const symptoms = await Promise.all((symptomsRows.results ?? []).map(async (s) => {
    // 2. symptom → metrics
    const metricsRows = await env.DB.prepare(`
      SELECT smm.id as map_id, smm.is_required, smm.sort_order,
             mi.id, mi.key
      FROM symptom_metric_map smm
      JOIN master_items mi ON smm.metric_id = mi.id
      WHERE smm.symptom_id = ? AND smm.is_active = 1 AND mi.is_active = 1
      ORDER BY smm.sort_order, mi.key
    `).bind(s.id).all<{ map_id: string; is_required: number; sort_order: number; id: string; key: string }>();

    const metrics = await Promise.all((metricsRows.results ?? []).map(async (m) => {
      // 3. metric → units
      const unitsRows = await env.DB.prepare(`
        SELECT mum.id as map_id, mum.is_default, mum.sort_order,
               mi.id, mi.key
        FROM metric_unit_map mum
        JOIN master_items mi ON mum.unit_id = mi.id
        WHERE mum.metric_id = ? AND mum.is_active = 1 AND mi.is_active = 1
        ORDER BY mum.sort_order, mi.key
      `).bind(m.id).all<{ map_id: string; is_default: number; sort_order: number; id: string; key: string }>();

      // 4. metric → log_types
      const logTypesRows = await env.DB.prepare(`
        SELECT mlm.id as map_id, mlm.is_default, mlm.sort_order,
               mi.id, mi.key
        FROM metric_logtype_map mlm
        JOIN master_items mi ON mlm.logtype_id = mi.id
        WHERE mlm.metric_id = ? AND mlm.is_active = 1 AND mi.is_active = 1
        ORDER BY mlm.sort_order, mi.key
      `).bind(m.id).all<{ map_id: string; is_default: number; sort_order: number; id: string; key: string }>();

      return {
        id: m.id, key: m.key, map_id: m.map_id,
        is_required: m.is_required === 1,
        units: (unitsRows.results ?? []).map(u => ({ id: u.id, key: u.key, map_id: u.map_id, is_default: u.is_default === 1 })),
        log_types: (logTypesRows.results ?? []).map(l => ({ id: l.id, key: l.key, map_id: l.map_id, is_default: l.is_default === 1 })),
      };
    }));

    return { id: s.id, key: s.key, map_id: s.map_id, is_required: s.is_required === 1, metrics };
  }));

  return symptoms;
}

export async function handleDiseaseMaps(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname;

  // ─── 공개: 질병 트리 조회 ──────────────────────────────────────────────────
  if (path === '/api/v1/master/disease-map' && request.method === 'GET') {
    const diseaseId = url.searchParams.get('disease_id');
    if (!diseaseId) return err('disease_id required');
    const disease = await env.DB.prepare('SELECT id, key FROM master_items WHERE id = ?').bind(diseaseId).first<{ id: string; key: string }>();
    if (!disease) return err('Disease not found', 404);
    const symptoms = await getDiseaseTree(diseaseId, env);
    return ok({ disease, symptoms });
  }

  // ─── Admin 전용 ───────────────────────────────────────────────────────────
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  const roleErr = requireRole(auth as JwtPayload, ['admin']);
  if (roleErr) return roleErr;

  // ─── Admin: disease-symptom 연결 ──────────────────────────────────────────
  if (path.startsWith('/api/v1/admin/master/disease-maps/disease-symptom')) {
    const idMatch = path.match(/\/disease-symptom\/([^/]+)$/);
    const id = idMatch?.[1];

    if (request.method === 'GET') {
      const diseaseId = url.searchParams.get('disease_id');
      if (!diseaseId) return err('disease_id required');
      const rows = await env.DB.prepare(`
        SELECT dsm.*, mi.key as symptom_key
        FROM disease_symptom_map dsm
        JOIN master_items mi ON dsm.symptom_id = mi.id
        WHERE dsm.disease_id = ?
        ORDER BY dsm.sort_order, mi.key
      `).bind(diseaseId).all();
      return ok(rows.results);
    }
    if (request.method === 'POST') {
      let body: { disease_id: string; symptom_id: string; is_required?: boolean; sort_order?: number };
      try { body = await request.json() as typeof body; } catch { return err('Invalid JSON'); }
      if (!body.disease_id || !body.symptom_id) return err('disease_id and symptom_id required');
      const exists = await env.DB.prepare('SELECT id FROM disease_symptom_map WHERE disease_id = ? AND symptom_id = ?').bind(body.disease_id, body.symptom_id).first();
      if (exists) return err('Mapping already exists', 409, 'duplicate');
      const row = { id: newId(), disease_id: body.disease_id, symptom_id: body.symptom_id, is_required: body.is_required ? 1 : 0, sort_order: body.sort_order ?? 0, is_active: 1 };
      await env.DB.prepare('INSERT INTO disease_symptom_map (id,disease_id,symptom_id,is_required,sort_order,is_active) VALUES (?,?,?,?,?,?)').bind(row.id, row.disease_id, row.symptom_id, row.is_required, row.sort_order, row.is_active).run();
      return created(row);
    }
    if (request.method === 'PUT' && id) {
      let body: { is_required?: boolean; sort_order?: number; is_active?: boolean };
      try { body = await request.json() as typeof body; } catch { return err('Invalid JSON'); }
      const sets: string[] = []; const vals: (string | number)[] = [];
      if (body.is_required !== undefined) { sets.push('is_required = ?'); vals.push(body.is_required ? 1 : 0); }
      if (body.sort_order !== undefined) { sets.push('sort_order = ?'); vals.push(body.sort_order); }
      if (body.is_active !== undefined) { sets.push('is_active = ?'); vals.push(body.is_active ? 1 : 0); }
      if (sets.length === 0) return err('Nothing to update');
      vals.push(id);
      await env.DB.prepare(`UPDATE disease_symptom_map SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
      return ok(await env.DB.prepare('SELECT * FROM disease_symptom_map WHERE id = ?').bind(id).first());
    }
    if (request.method === 'DELETE' && id) {
      await env.DB.prepare('UPDATE disease_symptom_map SET is_active = 0 WHERE id = ?').bind(id).run();
      return ok({ id, is_active: false });
    }
  }

  // ─── Admin: symptom-metric 연결 ───────────────────────────────────────────
  if (path.startsWith('/api/v1/admin/master/disease-maps/symptom-metric')) {
    const idMatch = path.match(/\/symptom-metric\/([^/]+)$/);
    const id = idMatch?.[1];

    if (request.method === 'GET') {
      const symptomId = url.searchParams.get('symptom_id');
      if (!symptomId) return err('symptom_id required');
      const rows = await env.DB.prepare(`
        SELECT smm.*, mi.key as metric_key
        FROM symptom_metric_map smm
        JOIN master_items mi ON smm.metric_id = mi.id
        WHERE smm.symptom_id = ?
        ORDER BY smm.sort_order, mi.key
      `).bind(symptomId).all();
      return ok(rows.results);
    }
    if (request.method === 'POST') {
      let body: { symptom_id: string; metric_id: string; is_required?: boolean; sort_order?: number };
      try { body = await request.json() as typeof body; } catch { return err('Invalid JSON'); }
      if (!body.symptom_id || !body.metric_id) return err('symptom_id and metric_id required');
      const exists = await env.DB.prepare('SELECT id FROM symptom_metric_map WHERE symptom_id = ? AND metric_id = ?').bind(body.symptom_id, body.metric_id).first();
      if (exists) return err('Mapping already exists', 409, 'duplicate');
      const row = { id: newId(), symptom_id: body.symptom_id, metric_id: body.metric_id, is_required: body.is_required ? 1 : 0, sort_order: body.sort_order ?? 0, is_active: 1 };
      await env.DB.prepare('INSERT INTO symptom_metric_map (id,symptom_id,metric_id,is_required,sort_order,is_active) VALUES (?,?,?,?,?,?)').bind(row.id, row.symptom_id, row.metric_id, row.is_required, row.sort_order, row.is_active).run();
      return created(row);
    }
    if (request.method === 'PUT' && id) {
      let body: { is_required?: boolean; sort_order?: number; is_active?: boolean };
      try { body = await request.json() as typeof body; } catch { return err('Invalid JSON'); }
      const sets: string[] = []; const vals: (string | number)[] = [];
      if (body.is_required !== undefined) { sets.push('is_required = ?'); vals.push(body.is_required ? 1 : 0); }
      if (body.sort_order !== undefined) { sets.push('sort_order = ?'); vals.push(body.sort_order); }
      if (body.is_active !== undefined) { sets.push('is_active = ?'); vals.push(body.is_active ? 1 : 0); }
      if (sets.length === 0) return err('Nothing to update');
      vals.push(id);
      await env.DB.prepare(`UPDATE symptom_metric_map SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
      return ok(await env.DB.prepare('SELECT * FROM symptom_metric_map WHERE id = ?').bind(id).first());
    }
    if (request.method === 'DELETE' && id) {
      await env.DB.prepare('UPDATE symptom_metric_map SET is_active = 0 WHERE id = ?').bind(id).run();
      return ok({ id, is_active: false });
    }
  }

  // ─── Admin: metric-unit 연결 ──────────────────────────────────────────────
  if (path.startsWith('/api/v1/admin/master/disease-maps/metric-unit')) {
    const idMatch = path.match(/\/metric-unit\/([^/]+)$/);
    const id = idMatch?.[1];

    if (request.method === 'GET') {
      const metricId = url.searchParams.get('metric_id');
      if (!metricId) return err('metric_id required');
      const rows = await env.DB.prepare(`
        SELECT mum.*, mi.key as unit_key
        FROM metric_unit_map mum
        JOIN master_items mi ON mum.unit_id = mi.id
        WHERE mum.metric_id = ?
        ORDER BY mum.sort_order, mi.key
      `).bind(metricId).all();
      return ok(rows.results);
    }
    if (request.method === 'POST') {
      let body: { metric_id: string; unit_id: string; is_default?: boolean; sort_order?: number };
      try { body = await request.json() as typeof body; } catch { return err('Invalid JSON'); }
      if (!body.metric_id || !body.unit_id) return err('metric_id and unit_id required');
      const exists = await env.DB.prepare('SELECT id FROM metric_unit_map WHERE metric_id = ? AND unit_id = ?').bind(body.metric_id, body.unit_id).first();
      if (exists) return err('Mapping already exists', 409, 'duplicate');
      const row = { id: newId(), metric_id: body.metric_id, unit_id: body.unit_id, is_default: body.is_default ? 1 : 0, sort_order: body.sort_order ?? 0, is_active: 1 };
      await env.DB.prepare('INSERT INTO metric_unit_map (id,metric_id,unit_id,is_default,sort_order,is_active) VALUES (?,?,?,?,?,?)').bind(row.id, row.metric_id, row.unit_id, row.is_default, row.sort_order, row.is_active).run();
      return created(row);
    }
    if (request.method === 'PUT' && id) {
      let body: { is_default?: boolean; sort_order?: number; is_active?: boolean };
      try { body = await request.json() as typeof body; } catch { return err('Invalid JSON'); }
      const sets: string[] = []; const vals: (string | number)[] = [];
      if (body.is_default !== undefined) { sets.push('is_default = ?'); vals.push(body.is_default ? 1 : 0); }
      if (body.sort_order !== undefined) { sets.push('sort_order = ?'); vals.push(body.sort_order); }
      if (body.is_active !== undefined) { sets.push('is_active = ?'); vals.push(body.is_active ? 1 : 0); }
      if (sets.length === 0) return err('Nothing to update');
      vals.push(id);
      await env.DB.prepare(`UPDATE metric_unit_map SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
      return ok(await env.DB.prepare('SELECT * FROM metric_unit_map WHERE id = ?').bind(id).first());
    }
    if (request.method === 'DELETE' && id) {
      await env.DB.prepare('UPDATE metric_unit_map SET is_active = 0 WHERE id = ?').bind(id).run();
      return ok({ id, is_active: false });
    }
  }

  // ─── Admin: metric-logtype 연결 ───────────────────────────────────────────
  if (path.startsWith('/api/v1/admin/master/disease-maps/metric-logtype')) {
    const idMatch = path.match(/\/metric-logtype\/([^/]+)$/);
    const id = idMatch?.[1];

    if (request.method === 'GET') {
      const metricId = url.searchParams.get('metric_id');
      if (!metricId) return err('metric_id required');
      const rows = await env.DB.prepare(`
        SELECT mlm.*, mi.key as logtype_key
        FROM metric_logtype_map mlm
        JOIN master_items mi ON mlm.logtype_id = mi.id
        WHERE mlm.metric_id = ?
        ORDER BY mlm.sort_order, mi.key
      `).bind(metricId).all();
      return ok(rows.results);
    }
    if (request.method === 'POST') {
      let body: { metric_id: string; logtype_id: string; is_default?: boolean; sort_order?: number };
      try { body = await request.json() as typeof body; } catch { return err('Invalid JSON'); }
      if (!body.metric_id || !body.logtype_id) return err('metric_id and logtype_id required');
      const exists = await env.DB.prepare('SELECT id FROM metric_logtype_map WHERE metric_id = ? AND logtype_id = ?').bind(body.metric_id, body.logtype_id).first();
      if (exists) return err('Mapping already exists', 409, 'duplicate');
      const row = { id: newId(), metric_id: body.metric_id, logtype_id: body.logtype_id, is_default: body.is_default ? 1 : 0, sort_order: body.sort_order ?? 0, is_active: 1 };
      await env.DB.prepare('INSERT INTO metric_logtype_map (id,metric_id,logtype_id,is_default,sort_order,is_active) VALUES (?,?,?,?,?,?)').bind(row.id, row.metric_id, row.logtype_id, row.is_default, row.sort_order, row.is_active).run();
      return created(row);
    }
    if (request.method === 'PUT' && id) {
      let body: { is_default?: boolean; sort_order?: number; is_active?: boolean };
      try { body = await request.json() as typeof body; } catch { return err('Invalid JSON'); }
      const sets: string[] = []; const vals: (string | number)[] = [];
      if (body.is_default !== undefined) { sets.push('is_default = ?'); vals.push(body.is_default ? 1 : 0); }
      if (body.sort_order !== undefined) { sets.push('sort_order = ?'); vals.push(body.sort_order); }
      if (body.is_active !== undefined) { sets.push('is_active = ?'); vals.push(body.is_active ? 1 : 0); }
      if (sets.length === 0) return err('Nothing to update');
      vals.push(id);
      await env.DB.prepare(`UPDATE metric_logtype_map SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
      return ok(await env.DB.prepare('SELECT * FROM metric_logtype_map WHERE id = ?').bind(id).first());
    }
    if (request.method === 'DELETE' && id) {
      await env.DB.prepare('UPDATE metric_logtype_map SET is_active = 0 WHERE id = ?').bind(id).run();
      return ok({ id, is_active: false });
    }
  }

  return err('Not found', 404);
}
