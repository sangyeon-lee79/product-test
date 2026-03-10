// Glucose logs + generic health measurement logs
// GET/POST/PUT/DELETE /api/v1/pets/:id/glucose-logs
// GET/POST/PUT/DELETE /api/v1/pets/:id/health-measurements
import type { Env, JwtPayload } from '../../types';
import { ok, created, err, newId, now } from '../../types';
import {
  assertPetOwner, hasColumn, hasTable, normalizeMeasuredAt, parseOptionalNumber,
  rangeStartByKey, resolveMasterItemId,
} from './helpers';

async function resolveGlucoseJudgement(
  env: Env,
  petId: string,
  diseaseItemId: string,
  value: number,
  unitItemId: string,
  contextItemId: string | null,
): Promise<{ level: string | null; label: string | null }> {
  if (!(await hasTable(env, 'disease_judgement_rules'))) return { level: null, label: null };
  const measurementItemId = await resolveMasterItemId(env, 'disease_measurement_type', 'glucose_value');
  if (!measurementItemId) return { level: null, label: null };
  const pet = await env.DB.prepare(`SELECT pet_type_id FROM pets WHERE id = ?`).bind(petId).first<{ pet_type_id: string | null }>();
  const rows = await env.DB.prepare(
    `SELECT judgement_level, judgement_label
     FROM disease_judgement_rules
     WHERE disease_item_id = ?
       AND measurement_item_id = ?
       AND unit_item_id = ?
       AND status = 'active'
       AND (CAST(? AS TEXT) IS NULL OR context_item_id = ? OR context_item_id IS NULL)
       AND (species_item_id IS NULL OR species_item_id = ?)
       AND (min_value IS NULL OR ? >= min_value)
       AND (max_value IS NULL OR ? <= max_value)
     ORDER BY
       CASE WHEN context_item_id = ? THEN 0 WHEN context_item_id IS NULL THEN 1 ELSE 2 END,
       CASE WHEN species_item_id = ? THEN 0 WHEN species_item_id IS NULL THEN 1 ELSE 2 END,
       sort_order ASC
     LIMIT 1`
  ).bind(
    diseaseItemId,
    measurementItemId,
    unitItemId,
    contextItemId,
    contextItemId,
    pet?.pet_type_id ?? null,
    value,
    value,
    contextItemId,
    pet?.pet_type_id ?? null,
  ).first<{ judgement_level: string; judgement_label: string | null }>();
  return { level: rows?.judgement_level ?? null, label: rows?.judgement_label ?? null };
}

async function resolveMeasurementJudgement(
  env: Env,
  petId: string,
  diseaseItemId: string,
  measurementItemId: string,
  value: number,
  unitItemId: string | null,
  contextItemId: string | null,
): Promise<{ level: string | null; label: string | null }> {
  if (!(await hasTable(env, 'disease_judgement_rules')) || !unitItemId) return { level: null, label: null };
  const pet = await env.DB.prepare(`SELECT pet_type_id FROM pets WHERE id = ?`).bind(petId).first<{ pet_type_id: string | null }>();
  const row = await env.DB.prepare(
    `SELECT judgement_level, judgement_label
     FROM disease_judgement_rules
     WHERE disease_item_id = ?
       AND measurement_item_id = ?
       AND unit_item_id = ?
       AND status = 'active'
       AND (CAST(? AS TEXT) IS NULL OR context_item_id = ? OR context_item_id IS NULL)
       AND (species_item_id IS NULL OR species_item_id = ?)
       AND (min_value IS NULL OR ? >= min_value)
       AND (max_value IS NULL OR ? <= max_value)
     ORDER BY
       CASE WHEN context_item_id = ? THEN 0 WHEN context_item_id IS NULL THEN 1 ELSE 2 END,
       CASE WHEN species_item_id = ? THEN 0 WHEN species_item_id IS NULL THEN 1 ELSE 2 END,
       sort_order ASC
     LIMIT 1`
  ).bind(
    diseaseItemId,
    measurementItemId,
    unitItemId,
    contextItemId,
    contextItemId,
    pet?.pet_type_id ?? null,
    value,
    value,
    contextItemId,
    pet?.pet_type_id ?? null,
  ).first<{ judgement_level: string; judgement_label: string | null }>();
  return { level: row?.judgement_level ?? null, label: row?.judgement_label ?? null };
}

// ─── Glucose Logs ─────────────────────────────────────────────────────────────

export async function listGlucoseLogs(env: Env, payload: JwtPayload, petId: string, url: URL): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');
  if (!(await hasTable(env, 'pet_glucose_logs'))) return ok({ logs: [], summary: null, range: 'all' });
  const range = (url.searchParams.get('range') || 'all').trim();
  const start = rangeStartByKey(range === '1w' ? '1m' : range);
  const where = ['pet_id = ?'];
  const vals: Array<string | number> = [petId];
  if (start) { where.push('measured_at >= ?'); vals.push(start); }
  const rows = await env.DB.prepare(
    `SELECT * FROM pet_glucose_logs
     WHERE ${where.join(' AND ')}
     ORDER BY measured_at DESC, created_at DESC`
  ).bind(...vals).all<Record<string, unknown>>();
  const latest = rows.results[0] || null;
  return ok({
    logs: rows.results,
    range,
    summary: latest ? {
      latest_value: latest.glucose_value ?? null,
      latest_measured_at: latest.measured_at ?? null,
      latest_judgement_level: latest.judgement_level ?? null,
      latest_judgement_label: latest.judgement_label ?? null,
    } : null,
  });
}

export async function createGlucoseLog(request: Request, env: Env, payload: JwtPayload, petId: string): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');
  if (!(await hasTable(env, 'pet_glucose_logs'))) return err('not supported', 400);
  let body: {
    disease_item_id?: string;
    device_item_id?: string | null;
    glucose_value?: number;
    glucose_unit_item_id?: string;
    measured_at?: string;
    measured_context_item_id?: string | null;
    notes?: string | null;
  };
  try { body = await request.json() as typeof body; } catch { return err('Invalid JSON body'); }
  const defaultDiseaseId = await resolveMasterItemId(env, 'disease_type', 'diabetes');
  const diseaseItemId = (body.disease_item_id || '').trim() || defaultDiseaseId || '';
  if (!diseaseItemId) return err('disease_item_id required');
  const value = parseOptionalNumber(body.glucose_value);
  if (value === null) return err('glucose_value required');
  const defaultUnitId = await resolveMasterItemId(env, 'weight_unit', 'mg_dl');
  const unitId = (body.glucose_unit_item_id || '').trim() || defaultUnitId || '';
  if (!unitId) return err('glucose_unit_item_id required');
  const contextId = body.measured_context_item_id ? String(body.measured_context_item_id).trim() : null;
  const judgement = await resolveGlucoseJudgement(env, petId, diseaseItemId, value, unitId, contextId);
  const id = newId();
  await env.DB.prepare(
    `INSERT INTO pet_glucose_logs (
      id, pet_id, disease_item_id, device_item_id, glucose_value, glucose_unit_item_id,
      measured_at, measured_context_item_id, notes, recorded_by_user_id,
      judgement_level, judgement_label, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    petId,
    diseaseItemId,
    body.device_item_id ?? null,
    value,
    unitId,
    normalizeMeasuredAt(body.measured_at),
    contextId,
    body.notes ?? null,
    payload.sub,
    judgement.level,
    judgement.label,
    now(),
    now(),
  ).run();
  return created({ id, judgement });
}

export async function updateGlucoseLog(request: Request, env: Env, payload: JwtPayload, petId: string, logId: string): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');
  if (!(await hasTable(env, 'pet_glucose_logs'))) return err('not supported', 400);
  const existing = await env.DB.prepare(`SELECT * FROM pet_glucose_logs WHERE id = ? AND pet_id = ?`).bind(logId, petId).first<Record<string, unknown>>();
  if (!existing) return err('Glucose log not found', 404, 'not_found');
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return err('Invalid JSON body'); }
  const value = Object.prototype.hasOwnProperty.call(body, 'glucose_value')
    ? parseOptionalNumber(body.glucose_value)
    : parseOptionalNumber(existing.glucose_value);
  if (value === null) return err('invalid glucose_value');
  const defaultDiseaseId = await resolveMasterItemId(env, 'disease_type', 'diabetes');
  const defaultUnitId = await resolveMasterItemId(env, 'weight_unit', 'mg_dl');
  const diseaseItemId = String(body.disease_item_id ?? existing.disease_item_id ?? defaultDiseaseId ?? '');
  const unitId = String(body.glucose_unit_item_id ?? existing.glucose_unit_item_id ?? defaultUnitId ?? '');
  if (!diseaseItemId) return err('disease_item_id required');
  if (!unitId) return err('glucose_unit_item_id required');
  const contextId = (body.measured_context_item_id ?? existing.measured_context_item_id ?? null) as string | null;
  const judgement = await resolveGlucoseJudgement(env, petId, diseaseItemId, value, unitId, contextId);
  await env.DB.prepare(
    `UPDATE pet_glucose_logs
     SET disease_item_id = ?, device_item_id = ?, glucose_value = ?, glucose_unit_item_id = ?,
         measured_at = ?, measured_context_item_id = ?, notes = ?,
         judgement_level = ?, judgement_label = ?, updated_at = ?
     WHERE id = ? AND pet_id = ?`
  ).bind(
    diseaseItemId,
    body.device_item_id ?? existing.device_item_id ?? null,
    value,
    unitId,
    normalizeMeasuredAt(body.measured_at ?? existing.measured_at),
    contextId,
    body.notes ?? existing.notes ?? null,
    judgement.level,
    judgement.label,
    now(),
    logId,
    petId,
  ).run();
  return ok({ updated: true, id: logId, judgement });
}

export async function deleteGlucoseLog(env: Env, payload: JwtPayload, petId: string, logId: string): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');
  await env.DB.prepare(`DELETE FROM pet_glucose_logs WHERE id = ? AND pet_id = ?`).bind(logId, petId).run();
  return ok({ deleted: true, id: logId });
}

// ─── Generic Health Measurement Logs ─────────────────────────────────────────

export async function listHealthMeasurementLogs(env: Env, payload: JwtPayload, petId: string, url: URL): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');
  if (!(await hasTable(env, 'pet_health_measurement_logs'))) return ok({ logs: [], range: 'all', summary: null });

  const range = (url.searchParams.get('range') || '1m').trim();
  const start = rangeStartByKey(range);
  const where = ['pet_id = ?'];
  const vals: Array<string | number> = [petId];
  if (start) {
    where.push('measured_at >= ?');
    vals.push(start);
  }
  const rows = await env.DB.prepare(
    `SELECT *
     FROM pet_health_measurement_logs
     WHERE ${where.join(' AND ')}
     ORDER BY measured_at DESC, created_at DESC, id DESC`
  ).bind(...vals).all<Record<string, unknown>>();

  const latest = rows.results[0] || null;
  return ok({
    logs: rows.results,
    range,
    summary: latest ? {
      latest_value: latest.value ?? null,
      latest_measured_at: latest.measured_at ?? null,
      latest_judgement_level: latest.judgement_level ?? null,
      latest_judgement_label: latest.judgement_label ?? null,
      latest_measurement_item_id: latest.measurement_item_id ?? null,
    } : null,
  });
}

export async function createHealthMeasurementLog(request: Request, env: Env, payload: JwtPayload, petId: string): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');
  if (!(await hasTable(env, 'pet_health_measurement_logs'))) return err('not supported', 400);

  let body: {
    disease_item_id?: string;
    device_type_item_id?: string | null;
    device_model_id?: string | null;
    guardian_device_id?: string | null;
    measurement_item_id?: string;
    measurement_context_id?: string | null;
    value?: number;
    unit_item_id?: string | null;
    measured_at?: string;
    memo?: string | null;
  };
  try { body = await request.json() as typeof body; } catch { return err('Invalid JSON body'); }

  // If guardian_device_id is provided, auto-resolve device fields from registered device
  let resolvedDiseaseItemId = (body.disease_item_id || '').trim();
  let resolvedDeviceTypeItemId = body.device_type_item_id ? String(body.device_type_item_id).trim() : null;
  let resolvedDeviceModelId = body.device_model_id ?? null;
  const guardianDeviceId = body.guardian_device_id ? String(body.guardian_device_id).trim() : null;

  if (guardianDeviceId) {
    try {
      // Guard: device_type_item_id may not exist on device_models in older DBs
      const hasDmCol = await hasColumn(env, 'device_models', 'device_type_item_id');
      const dmSelect = hasDmCol ? 'dm.device_type_item_id' : 'NULL as device_type_item_id';
      const gd = await env.DB.prepare(
        `SELECT gd.disease_item_id, gd.device_model_id, ${dmSelect}
         FROM guardian_devices gd
         LEFT JOIN device_models dm ON dm.id = gd.device_model_id
         WHERE gd.id = ? AND gd.pet_id = ? AND gd.status != 'deleted'`
      ).bind(guardianDeviceId, petId).first<{ disease_item_id: string | null; device_model_id: string; device_type_item_id: string | null }>();
      if (!gd) return err('Guardian device not found', 404, 'not_found');
      if (!resolvedDiseaseItemId && gd.disease_item_id) resolvedDiseaseItemId = gd.disease_item_id;
      if (!resolvedDeviceTypeItemId && gd.device_type_item_id) resolvedDeviceTypeItemId = gd.device_type_item_id;
      if (!resolvedDeviceModelId && gd.device_model_id) resolvedDeviceModelId = gd.device_model_id;
    } catch { /* guardian device resolution failed — continue with body values */ }
  }

  const measurementItemId = (body.measurement_item_id || '').trim();
  const value = parseOptionalNumber(body.value);
  if (!resolvedDiseaseItemId) return err('disease_item_id required');
  if (!measurementItemId) return err('measurement_item_id required');
  if (value === null) return err('value required');

  const contextId = body.measurement_context_id ? String(body.measurement_context_id).trim() : null;
  let unitItemId = body.unit_item_id ? String(body.unit_item_id).trim() : null;

  // Validate FK references: nullable FK columns must exist in master_items or be set to NULL
  async function validateMasterItemFK(id: string | null): Promise<string | null> {
    if (!id) return null;
    const exists = await env.DB.prepare(`SELECT id FROM master_items WHERE id = ?`).bind(id).first<{ id: string }>();
    return exists ? id : null;
  }
  unitItemId = await validateMasterItemFK(unitItemId);
  const validContextId = await validateMasterItemFK(contextId);
  if (resolvedDeviceTypeItemId) resolvedDeviceTypeItemId = await validateMasterItemFK(resolvedDeviceTypeItemId);

  const judgement = await resolveMeasurementJudgement(env, petId, resolvedDiseaseItemId, measurementItemId, value, unitItemId, validContextId);

  // Auto-register disease-device mapping (soft — ignore errors)
  try {
    if (resolvedDeviceTypeItemId && (await hasTable(env, 'pet_disease_devices'))) {
      const existingDevice = await env.DB.prepare(
        `SELECT id FROM pet_disease_devices WHERE pet_id = ? AND disease_item_id = ? AND device_item_id = ? LIMIT 1`
      ).bind(petId, resolvedDiseaseItemId, resolvedDeviceTypeItemId).first<{ id: string }>();
      if (!existingDevice) {
        await env.DB.prepare(
          `INSERT INTO pet_disease_devices (id, pet_id, disease_item_id, device_item_id, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)`
        ).bind(newId(), petId, resolvedDiseaseItemId, resolvedDeviceTypeItemId, now(), now()).run();
      }
    }
  } catch { /* disease-device mapping is non-critical */ }

  const hasGdCol = await hasColumn(env, 'pet_health_measurement_logs', 'guardian_device_id');
  const hasDtiCol = await hasColumn(env, 'pet_health_measurement_logs', 'device_type_item_id');
  const hasDmIdCol = await hasColumn(env, 'pet_health_measurement_logs', 'device_model_id');
  const id = newId();
  const cols = ['id', 'pet_id', 'disease_item_id', 'measurement_item_id', 'measurement_context_id', 'value', 'unit_item_id',
    'measured_at', 'memo', 'recorded_by_user_id', 'judgement_level', 'judgement_label', 'created_at', 'updated_at'];
  const binds: (string | number | null)[] = [
    id, petId, resolvedDiseaseItemId, measurementItemId, validContextId, value, unitItemId,
    normalizeMeasuredAt(body.measured_at), body.memo ?? null, payload.sub,
    judgement.level, judgement.label, now(), now(),
  ];
  if (hasDtiCol) { cols.push('device_type_item_id'); binds.push(resolvedDeviceTypeItemId); }
  if (hasDmIdCol) { cols.push('device_model_id'); binds.push(resolvedDeviceModelId); }
  if (hasGdCol && guardianDeviceId) { cols.push('guardian_device_id'); binds.push(guardianDeviceId); }

  try {
    await env.DB.prepare(
      `INSERT INTO pet_health_measurement_logs (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`
    ).bind(...binds).run();
  } catch (e) {
    return err(`DB insert failed: ${e instanceof Error ? e.message : String(e)}`, 500, 'db_error');
  }
  return created({ id, judgement });
}

export async function updateHealthMeasurementLog(request: Request, env: Env, payload: JwtPayload, petId: string, logId: string): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');
  if (!(await hasTable(env, 'pet_health_measurement_logs'))) return err('not supported', 400);
  const existing = await env.DB.prepare(
    `SELECT * FROM pet_health_measurement_logs WHERE id = ? AND pet_id = ?`
  ).bind(logId, petId).first<Record<string, unknown>>();
  if (!existing) return err('Health measurement log not found', 404, 'not_found');

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return err('Invalid JSON body'); }

  const diseaseItemId = String(body.disease_item_id ?? existing.disease_item_id ?? '');
  const measurementItemId = String(body.measurement_item_id ?? existing.measurement_item_id ?? '');
  const value = Object.prototype.hasOwnProperty.call(body, 'value')
    ? parseOptionalNumber(body.value)
    : parseOptionalNumber(existing.value);
  if (!diseaseItemId) return err('disease_item_id required');
  if (!measurementItemId) return err('measurement_item_id required');
  if (value === null) return err('invalid value');

  const contextId = String(body.measurement_context_id ?? existing.measurement_context_id ?? '').trim() || null;
  const unitItemId = String(body.unit_item_id ?? existing.unit_item_id ?? '').trim() || null;
  const judgement = await resolveMeasurementJudgement(env, petId, diseaseItemId, measurementItemId, value, unitItemId, contextId);

  await env.DB.prepare(
    `UPDATE pet_health_measurement_logs
     SET disease_item_id = ?, device_type_item_id = ?, device_model_id = ?,
         measurement_item_id = ?, measurement_context_id = ?, value = ?, unit_item_id = ?,
         measured_at = ?, memo = ?, judgement_level = ?, judgement_label = ?, updated_at = ?
     WHERE id = ? AND pet_id = ?`
  ).bind(
    diseaseItemId,
    body.device_type_item_id ?? existing.device_type_item_id ?? null,
    body.device_model_id ?? existing.device_model_id ?? null,
    measurementItemId,
    contextId,
    value,
    unitItemId,
    normalizeMeasuredAt(body.measured_at ?? existing.measured_at),
    body.memo ?? existing.memo ?? null,
    judgement.level,
    judgement.label,
    now(),
    logId,
    petId,
  ).run();
  return ok({ updated: true, id: logId, judgement });
}

export async function deleteHealthMeasurementLog(env: Env, payload: JwtPayload, petId: string, logId: string): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');
  if (!(await hasTable(env, 'pet_health_measurement_logs'))) return err('not supported', 400);
  await env.DB.prepare(`DELETE FROM pet_health_measurement_logs WHERE id = ? AND pet_id = ?`).bind(logId, petId).run();
  return ok({ deleted: true, id: logId });
}
