// Disease history + disease devices for /api/v1/pets/:id/diseases and /disease-devices
import type { Env, JwtPayload } from '../../types';
import { ok, created, err, newId, now } from '../../types';
import { assertPetOwner, hasTable, normalizeMeasuredAt } from './helpers';

export async function listDiseases(env: Env, payload: JwtPayload, petId: string): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');
  const useHistoryTable = await hasTable(env, 'pet_disease_histories');
  if (useHistoryTable) {
    const rows = await env.DB.prepare(
      `SELECT
         h.*,
         d.code AS disease_key,
         g.code AS disease_group_key
       FROM pet_disease_histories h
       LEFT JOIN master_items d ON d.id = h.disease_item_id
       LEFT JOIN master_items g ON g.id = h.disease_group_item_id
       WHERE h.pet_id = ?
       ORDER BY h.is_active DESC, datetime(h.created_at) DESC`
    ).bind(petId).all<Record<string, unknown>>();
    return ok({ diseases: rows.results });
  }

  const rows = await env.DB.prepare(
    `SELECT hr.id, hr.disease_id AS disease_item_id, hr.recorded_at AS diagnosed_at, hr.description AS notes, 1 AS is_active
     FROM health_records hr
     WHERE hr.pet_id = ? AND hr.record_type = 'disease'
     ORDER BY datetime(hr.recorded_at) DESC`
  ).bind(petId).all<Record<string, unknown>>();
  return ok({ diseases: rows.results });
}

export async function addDisease(request: Request, env: Env, payload: JwtPayload, petId: string): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');

  let body: { disease_group_item_id?: string; disease_item_id?: string; disease_id?: string; diagnosed_at?: string; notes?: string; is_active?: boolean };
  try {
    body = await request.json() as typeof body;
  } catch {
    return err('Invalid JSON body');
  }

  const diseaseItemId = (body.disease_item_id || body.disease_id || '').trim();
  if (!diseaseItemId) return err('disease_item_id required');
  const diagnosedAt = body.diagnosed_at ? normalizeMeasuredAt(body.diagnosed_at) : now();
  const notes = typeof body.notes === 'string' ? body.notes.trim() : null;
  const isActive = body.is_active === false ? 0 : 1;
  const useHistoryTable = await hasTable(env, 'pet_disease_histories');

  if (useHistoryTable) {
    let groupId = (body.disease_group_item_id || '').trim();
    if (!groupId) {
      const parent = await env.DB.prepare(
        `SELECT parent_item_id FROM master_items WHERE id = ?`
      ).bind(diseaseItemId).first<{ parent_item_id: string | null }>();
      groupId = parent?.parent_item_id ?? '';
    }
    const historyId = newId();
    await env.DB.prepare(
      `INSERT INTO pet_disease_histories (
        id, pet_id, disease_group_item_id, disease_item_id, diagnosed_at, notes, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      historyId,
      petId,
      groupId || null,
      diseaseItemId,
      diagnosedAt,
      notes,
      isActive,
      now(),
      now(),
    ).run();
    return created({ history_id: historyId });
  }

  await env.DB.prepare(
    `INSERT INTO health_records (id, pet_id, record_type, disease_id, description, recorded_at, created_by_user_id, created_at)
     VALUES (?, ?, 'disease', ?, ?, ?, ?, ?)`
  ).bind(newId(), petId, diseaseItemId, notes, diagnosedAt, payload.sub, now()).run();
  return created({ created: true });
}

export async function updateDisease(request: Request, env: Env, payload: JwtPayload, petId: string, historyId: string): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');
  if (!(await hasTable(env, 'pet_disease_histories'))) return err('not supported', 400);

  let body: { disease_group_item_id?: string | null; disease_item_id?: string; diagnosed_at?: string | null; notes?: string | null; is_active?: boolean };
  try {
    body = await request.json() as typeof body;
  } catch {
    return err('Invalid JSON body');
  }

  const sets: string[] = ['updated_at = ?'];
  const vals: unknown[] = [now()];
  if (Object.prototype.hasOwnProperty.call(body, 'disease_group_item_id')) { sets.push('disease_group_item_id = ?'); vals.push(body.disease_group_item_id ?? null); }
  if (Object.prototype.hasOwnProperty.call(body, 'disease_item_id')) { sets.push('disease_item_id = ?'); vals.push(body.disease_item_id ?? null); }
  if (Object.prototype.hasOwnProperty.call(body, 'diagnosed_at')) { sets.push('diagnosed_at = ?'); vals.push(body.diagnosed_at ? normalizeMeasuredAt(body.diagnosed_at) : null); }
  if (Object.prototype.hasOwnProperty.call(body, 'notes')) { sets.push('notes = ?'); vals.push(body.notes ?? null); }
  if (Object.prototype.hasOwnProperty.call(body, 'is_active')) { sets.push('is_active = ?'); vals.push(body.is_active ? 1 : 0); }
  vals.push(historyId, petId);
  await env.DB.prepare(`UPDATE pet_disease_histories SET ${sets.join(', ')} WHERE id = ? AND pet_id = ?`).bind(...vals).run();
  return ok({ updated: true, history_id: historyId });
}

export async function removeDisease(env: Env, payload: JwtPayload, petId: string, historyId: string): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');
  if (await hasTable(env, 'pet_disease_histories')) {
    await env.DB.prepare(`DELETE FROM pet_disease_histories WHERE id = ? AND pet_id = ?`).bind(historyId, petId).run();
    return ok({ deleted: true, history_id: historyId });
  }
  await env.DB.prepare(
    "DELETE FROM health_records WHERE pet_id = ? AND record_type = 'disease' AND disease_id = ?"
  ).bind(petId, historyId).run();
  return ok({ deleted: true, disease_id: historyId });
}

export async function listDiseaseDevices(env: Env, payload: JwtPayload, petId: string): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');
  if (!(await hasTable(env, 'pet_disease_devices'))) return ok({ devices: [] });
  const rows = await env.DB.prepare(
    `SELECT d.*, mi.code AS device_key
     FROM pet_disease_devices d
     LEFT JOIN master_items mi ON mi.id = d.device_item_id
     WHERE d.pet_id = ?
     ORDER BY d.is_active DESC, datetime(d.created_at) DESC`
  ).bind(petId).all<Record<string, unknown>>();
  return ok({ devices: rows.results });
}

export async function createDiseaseDevice(request: Request, env: Env, payload: JwtPayload, petId: string): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');
  if (!(await hasTable(env, 'pet_disease_devices'))) return err('not supported', 400);
  let body: { disease_item_id?: string; device_item_id?: string; serial_number?: string; nickname?: string; notes?: string };
  try { body = await request.json() as typeof body; } catch { return err('Invalid JSON body'); }
  const diseaseItemId = (body.disease_item_id || '').trim();
  const deviceItemId = (body.device_item_id || '').trim();
  if (!diseaseItemId) return err('disease_item_id required');
  if (!deviceItemId) return err('device_item_id required');
  const id = newId();
  await env.DB.prepare(
    `INSERT INTO pet_disease_devices (
      id, pet_id, disease_item_id, device_item_id, serial_number, nickname, notes, is_active, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`
  ).bind(
    id,
    petId,
    diseaseItemId,
    deviceItemId,
    body.serial_number ?? null,
    body.nickname ?? null,
    body.notes ?? null,
    now(),
    now(),
  ).run();
  return created({ id });
}
