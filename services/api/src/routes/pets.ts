// S6: 펫 + 펫 질병 API — LLD §5.4
// GET    /api/v1/pets                         내 펫 목록 (질병 포함)
// POST   /api/v1/pets                         펫 등록
// GET    /api/v1/pets/:id                     펫 상세
// PUT    /api/v1/pets/:id                     펫 수정
// DELETE /api/v1/pets/:id                     펫 삭제 (soft delete)
// GET    /api/v1/pets/check-microchip         마이크로칩 중복 확인
// POST   /api/v1/pets/:id/diseases            질병 연결
// DELETE /api/v1/pets/:id/diseases/:diseaseId 질병 연결 해제

import type { Env, JwtPayload } from '../types';
import { ok, created, err, newId, now } from '../types';
import { requireAuth } from '../middleware/auth';

const ARRAY_COLUMNS = [
  'color_ids',
  'allergy_ids',
  'disease_history_ids',
  'symptom_tag_ids',
  'vaccination_ids',
  'temperament_ids',
] as const;

function parseIdArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((x) => (typeof x === 'string' ? x.trim() : ''))
    .filter(Boolean);
}

function normalizeMicrochip(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parseJsonArrayString(value: unknown): string[] {
  if (Array.isArray(value)) return parseIdArray(value);
  if (typeof value !== 'string' || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return parseIdArray(parsed);
  } catch {
    return [];
  }
}

async function findMicrochipOwner(env: Env, microchipNo: string, excludePetId?: string) {
  const baseQuery = "SELECT id, guardian_id FROM pets WHERE microchip_no = ? AND status != 'deleted'";
  if (excludePetId) {
    return env.DB.prepare(`${baseQuery} AND id != ? LIMIT 1`).bind(microchipNo, excludePetId).first<{ id: string; guardian_id: string }>();
  }
  return env.DB.prepare(`${baseQuery} LIMIT 1`).bind(microchipNo).first<{ id: string; guardian_id: string }>();
}

function normalizePetRecord(pet: Record<string, unknown>) {
  const out: Record<string, unknown> = { ...pet };
  for (const col of ARRAY_COLUMNS) {
    out[col] = parseJsonArrayString(pet[col]);
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────

export async function handlePets(request: Request, env: Env, url: URL): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  const payload = auth as JwtPayload;

  const sub = url.pathname.replace('/api/v1/pets', '');

  if ((sub === '/check-microchip' || sub === '/check-microchip/') && request.method === 'GET') {
    return checkMicrochip(env, payload, url);
  }

  // /pets
  if (sub === '' || sub === '/') {
    if (request.method === 'GET') return listPets(env, payload);
    if (request.method === 'POST') return createPet(request, env, payload);
  }

  // /pets/:id
  const singleMatch = sub.match(/^\/([^/]+)$/);
  if (singleMatch) {
    const petId = singleMatch[1];
    if (request.method === 'GET') return getPet(env, payload, petId);
    if (request.method === 'PUT') return updatePet(request, env, payload, petId);
    if (request.method === 'DELETE') return deletePet(env, payload, petId);
  }

  // /pets/:id/diseases
  const diseaseListMatch = sub.match(/^\/([^/]+)\/diseases$/);
  if (diseaseListMatch) {
    const petId = diseaseListMatch[1];
    if (request.method === 'POST') return addDisease(request, env, payload, petId);
  }

  // /pets/:id/diseases/:diseaseId
  const diseaseItemMatch = sub.match(/^\/([^/]+)\/diseases\/([^/]+)$/);
  if (diseaseItemMatch) {
    const [, petId, diseaseId] = diseaseItemMatch;
    if (request.method === 'DELETE') return removeDisease(env, payload, petId, diseaseId);
  }

  return err('Not found', 404);
}

// ─── GET /pets/check-microchip ───────────────────────────────────────────────

async function checkMicrochip(env: Env, payload: JwtPayload, url: URL): Promise<Response> {
  const microchipNo = normalizeMicrochip(url.searchParams.get('microchip_no'));
  const excludePetId = (url.searchParams.get('exclude_pet_id') || '').trim() || undefined;

  if (!microchipNo) return err('microchip_no required');

  const owner = await findMicrochipOwner(env, microchipNo, excludePetId);
  if (!owner) return ok({ available: true });

  const mine = owner.guardian_id === payload.sub;
  return ok({
    available: false,
    reason: mine ? '이미 등록된 마이크로칩 번호입니다.' : '다른 반려동물에 연결된 번호입니다.',
    pet_id: owner.id,
  });
}

// ─── GET /pets ────────────────────────────────────────────────────────────────

async function listPets(env: Env, payload: JwtPayload): Promise<Response> {
  const pets = await env.DB.prepare(
    "SELECT * FROM pets WHERE guardian_id = ? AND status != 'deleted' ORDER BY created_at ASC"
  ).bind(payload.sub).all<Record<string, unknown>>();

  const result = await Promise.all(
    pets.results.map(async (pet) => attachDiseases(env, normalizePetRecord(pet)))
  );
  return ok({ pets: result });
}

// ─── POST /pets ───────────────────────────────────────────────────────────────

async function createPet(request: Request, env: Env, payload: JwtPayload): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return err('Invalid JSON body');
  }

  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) return err('name required');
  if (!body.pet_type_id || typeof body.pet_type_id !== 'string') return err('pet_type_id required');

  const microchipNo = normalizeMicrochip(body.microchip_no);
  if (microchipNo) {
    const dup = await findMicrochipOwner(env, microchipNo);
    if (dup) return err('이미 등록된 마이크로칩 번호입니다.', 409, 'microchip_duplicate');
  }

  const id = newId();
  const ts = now();
  const species = typeof body.species === 'string' ? body.species : 'other';

  await env.DB.prepare(`
    INSERT INTO pets (
      id, guardian_id, name, species, pet_type_id, breed_id, gender_id, neuter_status_id,
      life_stage_id, body_size_id, country_id, medication_status_id, weight_unit_id,
      health_condition_level_id, activity_level_id, diet_type_id, living_style_id,
      ownership_type_id, coat_length_id, coat_type_id, grooming_cycle_id,
      color_ids, allergy_ids, disease_history_ids, symptom_tag_ids, vaccination_ids,
      temperament_ids, notes, intro_text, birth_date, weight_kg, microchip_no,
      avatar_url, is_neutered, status, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, 'active', ?, ?
    )
  `).bind(
    id,
    payload.sub,
    String(body.name).trim(),
    species,
    body.pet_type_id,
    body.breed_id ?? null,
    body.gender_id ?? null,
    body.neuter_status_id ?? null,
    body.life_stage_id ?? null,
    body.body_size_id ?? null,
    body.country_id ?? null,
    body.medication_status_id ?? null,
    body.weight_unit_id ?? null,
    body.health_condition_level_id ?? null,
    body.activity_level_id ?? null,
    body.diet_type_id ?? null,
    body.living_style_id ?? null,
    body.ownership_type_id ?? null,
    body.coat_length_id ?? null,
    body.coat_type_id ?? null,
    body.grooming_cycle_id ?? null,
    JSON.stringify(parseIdArray(body.color_ids)),
    JSON.stringify(parseIdArray(body.allergy_ids)),
    JSON.stringify(parseIdArray(body.disease_history_ids)),
    JSON.stringify(parseIdArray(body.symptom_tag_ids)),
    JSON.stringify(parseIdArray(body.vaccination_ids)),
    JSON.stringify(parseIdArray(body.temperament_ids)),
    typeof body.notes === 'string' ? body.notes.trim() : null,
    typeof body.intro_text === 'string' ? body.intro_text.trim() : null,
    body.birth_date ?? null,
    body.weight_kg ?? null,
    microchipNo,
    body.avatar_url ?? null,
    body.is_neutered ? 1 : 0,
    ts,
    ts,
  ).run();

  const pet = await env.DB.prepare('SELECT * FROM pets WHERE id = ?').bind(id).first<Record<string, unknown>>();
  return created({ pet: await attachDiseases(env, normalizePetRecord(pet!)) });
}

// ─── GET /pets/:id ────────────────────────────────────────────────────────────

async function getPet(env: Env, payload: JwtPayload, petId: string): Promise<Response> {
  const pet = await env.DB.prepare(
    "SELECT * FROM pets WHERE id = ? AND guardian_id = ? AND status != 'deleted'"
  ).bind(petId, payload.sub).first<Record<string, unknown>>();
  if (!pet) return err('Pet not found', 404, 'not_found');
  return ok({ pet: await attachDiseases(env, normalizePetRecord(pet)) });
}

// ─── PUT /pets/:id ────────────────────────────────────────────────────────────

async function updatePet(request: Request, env: Env, payload: JwtPayload, petId: string): Promise<Response> {
  const pet = await env.DB.prepare(
    "SELECT id FROM pets WHERE id = ? AND guardian_id = ? AND status != 'deleted'"
  ).bind(petId, payload.sub).first();
  if (!pet) return err('Pet not found', 404, 'not_found');

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return err('Invalid JSON body');
  }

  const microchipNo = normalizeMicrochip(body.microchip_no);
  if (microchipNo) {
    const dup = await findMicrochipOwner(env, microchipNo, petId);
    if (dup) return err('이미 등록된 마이크로칩 번호입니다.', 409, 'microchip_duplicate');
  }

  const sets: string[] = ['updated_at = ?'];
  const vals: unknown[] = [now()];

  const scalarMap: Record<string, string> = {
    name: 'name',
    species: 'species',
    pet_type_id: 'pet_type_id',
    breed_id: 'breed_id',
    gender_id: 'gender_id',
    neuter_status_id: 'neuter_status_id',
    life_stage_id: 'life_stage_id',
    body_size_id: 'body_size_id',
    country_id: 'country_id',
    medication_status_id: 'medication_status_id',
    weight_unit_id: 'weight_unit_id',
    health_condition_level_id: 'health_condition_level_id',
    activity_level_id: 'activity_level_id',
    diet_type_id: 'diet_type_id',
    living_style_id: 'living_style_id',
    ownership_type_id: 'ownership_type_id',
    coat_length_id: 'coat_length_id',
    coat_type_id: 'coat_type_id',
    grooming_cycle_id: 'grooming_cycle_id',
    notes: 'notes',
    intro_text: 'intro_text',
    birth_date: 'birth_date',
    weight_kg: 'weight_kg',
    avatar_url: 'avatar_url',
  };

  for (const [inputKey, column] of Object.entries(scalarMap)) {
    if (Object.prototype.hasOwnProperty.call(body, inputKey)) {
      sets.push(`${column} = ?`);
      const value = body[inputKey];
      vals.push(typeof value === 'string' ? value.trim() || null : value ?? null);
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'microchip_no')) {
    sets.push('microchip_no = ?');
    vals.push(microchipNo);
  }
  if (Object.prototype.hasOwnProperty.call(body, 'is_neutered')) {
    sets.push('is_neutered = ?');
    vals.push(body.is_neutered ? 1 : 0);
  }

  for (const col of ARRAY_COLUMNS) {
    if (Object.prototype.hasOwnProperty.call(body, col)) {
      sets.push(`${col} = ?`);
      vals.push(JSON.stringify(parseIdArray(body[col])));
    }
  }

  vals.push(petId);
  await env.DB.prepare(`UPDATE pets SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();

  return getPet(env, payload, petId);
}

// ─── DELETE /pets/:id (soft delete) ──────────────────────────────────────────

async function deletePet(env: Env, payload: JwtPayload, petId: string): Promise<Response> {
  const pet = await env.DB.prepare(
    "SELECT id FROM pets WHERE id = ? AND guardian_id = ? AND status != 'deleted'"
  ).bind(petId, payload.sub).first();
  if (!pet) return err('Pet not found', 404, 'not_found');

  await env.DB.prepare(
    "UPDATE pets SET status = 'deleted', updated_at = ? WHERE id = ?"
  ).bind(now(), petId).run();
  return ok({ deleted: true });
}

// ─── POST /pets/:id/diseases ──────────────────────────────────────────────────

async function addDisease(request: Request, env: Env, payload: JwtPayload, petId: string): Promise<Response> {
  const pet = await env.DB.prepare(
    "SELECT id FROM pets WHERE id = ? AND guardian_id = ? AND status != 'deleted'"
  ).bind(petId, payload.sub).first();
  if (!pet) return err('Pet not found', 404, 'not_found');

  let body: { disease_id: string; diagnosed_at?: string; notes?: string };
  try {
    body = await request.json() as typeof body;
  } catch {
    return err('Invalid JSON body');
  }
  if (!body.disease_id) return err('disease_id required');

  const id = newId();
  try {
    await env.DB.prepare(`
      INSERT INTO pet_diseases (id, pet_id, disease_id, diagnosed_at, notes, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, 1, ?)
    `).bind(id, petId, body.disease_id, body.diagnosed_at ?? null, body.notes ?? null, now()).run();
  } catch {
    await env.DB.prepare(`
      UPDATE pet_diseases SET is_active = 1, diagnosed_at = COALESCE(?, diagnosed_at), notes = COALESCE(?, notes)
      WHERE pet_id = ? AND disease_id = ?
    `).bind(body.diagnosed_at ?? null, body.notes ?? null, petId, body.disease_id).run();
  }

  return getPet(env, payload, petId);
}

// ─── DELETE /pets/:id/diseases/:diseaseId ─────────────────────────────────────

async function removeDisease(env: Env, payload: JwtPayload, petId: string, diseaseId: string): Promise<Response> {
  const pet = await env.DB.prepare(
    "SELECT id FROM pets WHERE id = ? AND guardian_id = ? AND status != 'deleted'"
  ).bind(petId, payload.sub).first();
  if (!pet) return err('Pet not found', 404, 'not_found');

  await env.DB.prepare(
    'DELETE FROM pet_diseases WHERE pet_id = ? AND disease_id = ?'
  ).bind(petId, diseaseId).run();
  return getPet(env, payload, petId);
}

// ─── 유틸: 펫에 질병 목록 첨부 ──────────────────────────────────────────────

async function attachDiseases(env: Env, pet: Record<string, unknown>) {
  const diseases = await env.DB.prepare(`
    SELECT pd.id, pd.disease_id, pd.diagnosed_at, pd.notes, pd.is_active,
           mi.key AS disease_key,
           tr.ko AS disease_ko_name
    FROM pet_diseases pd
    LEFT JOIN master_items mi ON mi.id = pd.disease_id
    LEFT JOIN master_categories mc ON mc.id = mi.category_id
    LEFT JOIN i18n_translations tr
      ON tr.key = CASE
        WHEN mc.key LIKE 'master.%' THEN (mc.key || '.' || mi.key)
        ELSE ('master.' || mc.key || '.' || mi.key)
      END
    WHERE pd.pet_id = ?
    ORDER BY pd.created_at ASC
  `).bind(pet.id).all<Record<string, unknown>>();
  return { ...pet, diseases: diseases.results };
}
