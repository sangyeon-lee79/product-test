// Shared helper functions for pets sub-routes
import type { Env, JwtPayload } from '../../types';
import { newId, now } from '../../types';
import { hasTable, hasColumn } from '../../helpers/sqlHelpers';
export { hasTable, hasColumn };

export const ARRAY_COLUMNS = [
  'color_ids',
  'allergy_ids',
  'disease_history_ids',
  'symptom_tag_ids',
  'vaccination_ids',
  'temperament_ids',
] as const;

export function parseIdArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((x) => (typeof x === 'string' ? x.trim() : ''))
    .filter(Boolean);
}

export function normalizeMicrochip(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().replace(/\s+/g, '');
  return trimmed ? trimmed : null;
}

export function normalizeCountryCode(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(normalized) ? normalized : null;
}

export function normalizeMicrochipWithCountry(value: unknown, countryCode?: unknown): string | null {
  const normalized = normalizeMicrochip(value);
  if (!normalized) return null;

  const prefixed = normalized.match(/^([A-Za-z]{2})(.+)$/);
  if (prefixed) {
    return `${prefixed[1].toUpperCase()}${prefixed[2]}`;
  }

  const fallbackCountryCode = normalizeCountryCode(countryCode);
  if (!fallbackCountryCode) return normalized;
  return `${fallbackCountryCode}${normalized}`;
}

export function parseJsonArrayString(value: unknown): string[] {
  if (Array.isArray(value)) return parseIdArray(value);
  if (typeof value !== 'string' || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return parseIdArray(parsed);
  } catch {
    return [];
  }
}

export function parseOptionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return num;
}

export function normalizeMeasuredAt(value: unknown): string {
  if (typeof value === 'string' && value.trim()) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  return now();
}

export function rangeStartByKey(range: string): string | null {
  const current = new Date();
  if (range === '7d') current.setDate(current.getDate() - 7);
  else if (range === '15d') current.setDate(current.getDate() - 15);
  else if (range === '1w') current.setDate(current.getDate() - 7);
  else if (range === '1m') current.setMonth(current.getMonth() - 1);
  else if (range === '3m') current.setMonth(current.getMonth() - 3);
  else if (range === '6m') current.setMonth(current.getMonth() - 6);
  else if (range === '1y') current.setFullYear(current.getFullYear() - 1);
  else return null;
  return current.toISOString();
}


export async function replaceRelationRows(
  env: Env,
  petId: string,
  table: string,
  idColumn: string,
  itemColumn: string,
  itemIds: string[],
): Promise<void> {
  if (!(await hasTable(env, table))) return;
  await env.DB.prepare(`DELETE FROM ${table} WHERE pet_id = ?`).bind(petId).run();
  for (const itemId of itemIds) {
    await env.DB.prepare(
      `INSERT INTO ${table} (${idColumn}, pet_id, ${itemColumn}, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(newId(), petId, itemId, now(), now()).run();
  }
}

export async function ensurePetItemRelationTable(_env: Env, _table: string, _itemColumn: string): Promise<void> {
  // No-op: pet_allergies, pet_symptoms, pet_vaccinations, pet_colors,
  // pet_temperaments, pet_grooming_cycles already exist in the PG schema.
  // Dynamic CREATE TABLE at runtime is not compatible with PostgreSQL managed migrations.
}

export async function upsertSinglePetItemRelation(
  env: Env,
  table: string,
  itemColumn: string,
  petId: string,
  itemId: string | null,
): Promise<void> {
  await ensurePetItemRelationTable(env, table, itemColumn);
  await env.DB.prepare(`DELETE FROM ${table} WHERE pet_id = ?`).bind(petId).run();
  if (!itemId) return;
  await env.DB.prepare(
    `INSERT INTO ${table} (id, pet_id, ${itemColumn}, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(newId(), petId, itemId, now(), now()).run();
}

export async function replaceDiseaseHistory(env: Env, petId: string, userId: string, diseaseIds: string[], note?: string | null): Promise<void> {
  await env.DB.prepare(
    `DELETE FROM health_records
     WHERE pet_id = ? AND record_type = 'disease'`
  ).bind(petId).run();

  for (const diseaseId of diseaseIds) {
    await env.DB.prepare(
      `INSERT INTO health_records (
        id, pet_id, record_type, disease_id, description, recorded_at, created_by_user_id, created_at
      ) VALUES (?, ?, 'disease', ?, ?, ?, ?, ?)`
    ).bind(
      newId(),
      petId,
      diseaseId,
      note ?? null,
      now(),
      userId,
      now(),
    ).run();
  }
}

export async function replaceDiseaseSelections(
  env: Env,
  petId: string,
  userId: string,
  diseaseIds: string[],
  note?: string | null,
): Promise<void> {
  if (await hasTable(env, 'pet_disease_histories')) {
    await env.DB.prepare(`DELETE FROM pet_disease_histories WHERE pet_id = ?`).bind(petId).run();
    for (const diseaseItemId of diseaseIds) {
      const parent = await env.DB.prepare(
        `SELECT parent_item_id FROM master_items WHERE id = ?`
      ).bind(diseaseItemId).first<{ parent_item_id: string | null }>();
      await env.DB.prepare(
        `INSERT INTO pet_disease_histories (
          id, pet_id, disease_group_item_id, disease_item_id, diagnosed_at, notes, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`
      ).bind(
        newId(),
        petId,
        parent?.parent_item_id ?? null,
        diseaseItemId,
        now(),
        note ?? null,
        now(),
        now(),
      ).run();
    }
    return;
  }
  await replaceDiseaseHistory(env, petId, userId, diseaseIds, note);
}

export async function selectRelationIds(env: Env, petId: string, table: string, itemColumn: string): Promise<string[]> {
  if (!(await hasTable(env, table))) return [];
  const rows = await env.DB.prepare(
    `SELECT ${itemColumn} AS item_id FROM ${table} WHERE pet_id = ? ORDER BY created_at ASC, ${itemColumn} ASC`
  ).bind(petId).all<{ item_id: string }>();
  return rows.results.map((r) => r.item_id).filter(Boolean);
}

export async function resolveMasterItemId(env: Env, categoryCode: string, itemCode: string): Promise<string | null> {
  const row = await env.DB.prepare(
    `SELECT mi.id
     FROM master_items mi
     JOIN master_categories mc ON mc.id = mi.category_id
     WHERE mc.code = ?
       AND mi.code = ?
       AND mc.status = 'active'
       AND mi.status = 'active'
     LIMIT 1`
  ).bind(categoryCode, itemCode).first<{ id: string }>();
  return row?.id ?? null;
}

export async function findMicrochipOwner(env: Env, microchipNo: string, excludePetId?: string) {
  const baseQuery = "SELECT id, guardian_user_id AS guardian_id FROM pets WHERE microchip_number = ? AND status != 'deleted'";
  if (excludePetId) {
    return env.DB.prepare(`${baseQuery} AND id != ? LIMIT 1`).bind(microchipNo, excludePetId).first<{ id: string; guardian_id: string }>();
  }
  return env.DB.prepare(`${baseQuery} LIMIT 1`).bind(microchipNo).first<{ id: string; guardian_id: string }>();
}

export function normalizePetRecord(pet: Record<string, unknown>) {
  const out: Record<string, unknown> = { ...pet };
  for (const col of ARRAY_COLUMNS) {
    out[col] = parseJsonArrayString(pet[col]);
  }
  out.microchip_no = (pet.microchip_no as string | null) || (pet.microchip_number as string | null) || null;
  out.health_condition_level_id = pet.health_condition_level_id ?? pet.health_level_id ?? null;
  out.birthday = (pet.birthday as string | null) || (pet.birth_date as string | null) || null;
  out.current_weight = pet.current_weight ?? pet.weight_kg ?? null;
  return out;
}

export async function assertPetOwner(env: Env, payload: JwtPayload, petId: string) {
  return env.DB.prepare(
    "SELECT id, guardian_user_id AS guardian_id, NULL AS weight_unit_id FROM pets WHERE id = ? AND guardian_user_id = ? AND status != 'deleted'"
  ).bind(petId, payload.sub).first<{ id: string; guardian_id: string; weight_unit_id: string | null }>();
}

export async function syncPetCurrentWeightFromLogs(env: Env, petId: string): Promise<void> {
  const latest = await env.DB.prepare(
    `SELECT weight_value, weight_unit_id
     FROM pet_weight_logs
     WHERE pet_id = ?
     ORDER BY measured_at DESC, created_at DESC, id DESC
     LIMIT 1`
  ).bind(petId).first<{ weight_value: number; weight_unit_id: string | null }>();

  await env.DB.prepare(
    `UPDATE pets
     SET weight_kg = ?, updated_at = ?
     WHERE id = ?`
  ).bind(
    latest?.weight_value ?? null,
    now(),
    petId,
  ).run();
}
