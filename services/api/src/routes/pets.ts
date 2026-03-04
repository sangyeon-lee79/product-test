// S6: 펫 + 펫 질병 API — LLD §5.4
// GET    /api/v1/pets                         내 펫 목록 (질병 포함)
// POST   /api/v1/pets                         펫 등록
// GET    /api/v1/pets/:id                     펫 상세
// PUT    /api/v1/pets/:id                     펫 수정
// DELETE /api/v1/pets/:id                     펫 삭제 (soft delete)
// POST   /api/v1/pets/:id/diseases            질병 연결
// DELETE /api/v1/pets/:id/diseases/:diseaseId 질병 연결 해제

import type { Env, JwtPayload } from '../types';
import { ok, created, err, newId, now } from '../types';
import { requireAuth } from '../middleware/auth';

// ─────────────────────────────────────────────────────────────────────────────

export async function handlePets(request: Request, env: Env, url: URL): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  const payload = auth as JwtPayload;

  const sub = url.pathname.replace('/api/v1/pets', '');

  // /pets
  if (sub === '' || sub === '/') {
    if (request.method === 'GET')  return listPets(env, payload);
    if (request.method === 'POST') return createPet(request, env, payload);
  }

  // /pets/:id
  const singleMatch = sub.match(/^\/([^/]+)$/);
  if (singleMatch) {
    const petId = singleMatch[1];
    if (request.method === 'GET')    return getPet(env, payload, petId);
    if (request.method === 'PUT')    return updatePet(request, env, payload, petId);
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

// ─── GET /pets ────────────────────────────────────────────────────────────────

async function listPets(env: Env, payload: JwtPayload): Promise<Response> {
  const pets = await env.DB.prepare(
    "SELECT * FROM pets WHERE guardian_id = ? AND status != 'deleted' ORDER BY created_at ASC"
  ).bind(payload.sub).all<Record<string, unknown>>();

  const result = await Promise.all(
    pets.results.map(pet => attachDiseases(env, pet))
  );
  return ok({ pets: result });
}

// ─── POST /pets ───────────────────────────────────────────────────────────────

async function createPet(request: Request, env: Env, payload: JwtPayload): Promise<Response> {
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return err('Invalid JSON body'); }

  if (!body.name)    return err('name required');
  if (!body.species) return err('species required');
  const validSpecies = ['dog', 'cat', 'other'];
  if (!validSpecies.includes(body.species as string)) return err(`species must be one of: ${validSpecies.join(', ')}`);

  const id = newId();
  await env.DB.prepare(`
    INSERT INTO pets
      (id, guardian_id, name, species, breed_id, birth_date, gender,
       weight_kg, is_neutered, microchip_no, avatar_url, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
  `).bind(
    id,
    payload.sub,
    body.name,
    body.species,
    body.breed_id ?? null,
    body.birth_date ?? null,
    body.gender ?? null,
    body.weight_kg ?? null,
    body.is_neutered ? 1 : 0,
    body.microchip_no ?? null,
    body.avatar_url ?? null,
    now(),
    now(),
  ).run();

  // 질병 연결 (선택)
  if (Array.isArray(body.disease_ids) && body.disease_ids.length > 0) {
    for (const diseaseId of body.disease_ids as string[]) {
      await env.DB.prepare(`
        INSERT OR IGNORE INTO pet_diseases (id, pet_id, disease_id, is_active, created_at)
        VALUES (?, ?, ?, 1, ?)
      `).bind(newId(), id, diseaseId, now()).run();
    }
  }

  const pet = await env.DB.prepare('SELECT * FROM pets WHERE id = ?').bind(id).first<Record<string, unknown>>();
  return created({ pet: await attachDiseases(env, pet!) });
}

// ─── GET /pets/:id ────────────────────────────────────────────────────────────

async function getPet(env: Env, payload: JwtPayload, petId: string): Promise<Response> {
  const pet = await env.DB.prepare(
    "SELECT * FROM pets WHERE id = ? AND guardian_id = ? AND status != 'deleted'"
  ).bind(petId, payload.sub).first<Record<string, unknown>>();
  if (!pet) return err('Pet not found', 404, 'not_found');
  return ok({ pet: await attachDiseases(env, pet) });
}

// ─── PUT /pets/:id ────────────────────────────────────────────────────────────

async function updatePet(request: Request, env: Env, payload: JwtPayload, petId: string): Promise<Response> {
  const pet = await env.DB.prepare(
    "SELECT id FROM pets WHERE id = ? AND guardian_id = ? AND status != 'deleted'"
  ).bind(petId, payload.sub).first();
  if (!pet) return err('Pet not found', 404, 'not_found');

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return err('Invalid JSON body'); }

  await env.DB.prepare(`
    UPDATE pets
    SET name = COALESCE(?, name),
        species = COALESCE(?, species),
        breed_id = COALESCE(?, breed_id),
        birth_date = COALESCE(?, birth_date),
        gender = COALESCE(?, gender),
        weight_kg = COALESCE(?, weight_kg),
        is_neutered = COALESCE(?, is_neutered),
        microchip_no = COALESCE(?, microchip_no),
        avatar_url = COALESCE(?, avatar_url),
        updated_at = ?
    WHERE id = ?
  `).bind(
    body.name ?? null,
    body.species ?? null,
    body.breed_id ?? null,
    body.birth_date ?? null,
    body.gender ?? null,
    body.weight_kg ?? null,
    body.is_neutered !== undefined ? (body.is_neutered ? 1 : 0) : null,
    body.microchip_no ?? null,
    body.avatar_url ?? null,
    now(),
    petId,
  ).run();

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
  try { body = await request.json() as typeof body; }
  catch { return err('Invalid JSON body'); }
  if (!body.disease_id) return err('disease_id required');

  const id = newId();
  try {
    await env.DB.prepare(`
      INSERT INTO pet_diseases (id, pet_id, disease_id, diagnosed_at, notes, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, 1, ?)
    `).bind(id, petId, body.disease_id, body.diagnosed_at ?? null, body.notes ?? null, now()).run();
  } catch {
    // UNIQUE 제약 — 이미 연결된 경우 업데이트
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
           mi.key AS disease_key
    FROM pet_diseases pd
    LEFT JOIN master_items mi ON mi.id = pd.disease_id
    WHERE pd.pet_id = ?
    ORDER BY pd.created_at ASC
  `).bind(pet.id).all<Record<string, unknown>>();
  return { ...pet, diseases: diseases.results };
}
