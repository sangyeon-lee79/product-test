// S1: 언어관리 API — LLD §4.2 i18n_translations, §5.1, §5.7
// GET    /api/v1/i18n                    — 전체 조회 (공개, ?lang=ko&prefix=)
// GET    /api/v1/admin/i18n              — Admin 목록 (?page=&prefix=&active_only=)
// POST   /api/v1/admin/i18n              — 새 키 추가
// PUT    /api/v1/admin/i18n/:id          — 번역값 수정
// DELETE /api/v1/admin/i18n/:id          — 삭제 (비활성화)

import type { Env } from '../types';
import { ok, created, err, newId, now } from '../types';
import { requireAuth, requireRole } from '../middleware/auth';
import type { JwtPayload } from '../types';

const LANGS = ['ko','en','ja','zh_cn','zh_tw','es','fr','de','pt','vi','th','id_lang','ar'] as const;
type Lang = typeof LANGS[number];
type TargetLang = Exclude<Lang, 'ko'>;

const TARGET_LANGS = LANGS.filter((l): l is TargetLang => l !== 'ko');
const GOOGLE_LANG_MAP: Record<TargetLang, string> = {
  en: 'en',
  ja: 'ja',
  zh_cn: 'zh-CN',
  zh_tw: 'zh-TW',
  es: 'es',
  fr: 'fr',
  de: 'de',
  pt: 'pt',
  vi: 'vi',
  th: 'th',
  id_lang: 'id',
  ar: 'ar',
};

const DEFAULT_RPM_LIMIT = 60;
const DEFAULT_DAILY_CHAR_LIMIT = 200000;
const GOOGLE_TOKEN_AUDIENCE = 'https://oauth2.googleapis.com/token';
const GOOGLE_TRANSLATE_SCOPE = 'https://www.googleapis.com/auth/cloud-translation';
const KEY_LITERAL_PATTERN = /^(master|admin)\.[a-z0-9_.-]+$/i;

type TranslationMap = Record<TargetLang, string>;

interface TranslationMemoryRow {
  source_ko: string;
  en: string | null;
  ja: string | null;
  zh_cn: string | null;
  zh_tw: string | null;
  es: string | null;
  fr: string | null;
  de: string | null;
  pt: string | null;
  vi: string | null;
  th: string | null;
  id_lang: string | null;
  ar: string | null;
}

let googleTokenCache: { email: string; token: string; expiresAt: number } | null = null;

function toInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function charLength(input: string): number {
  return Array.from(input).length;
}

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlEncodeJson(value: unknown): string {
  const json = JSON.stringify(value);
  return base64UrlEncodeBytes(new TextEncoder().encode(json));
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const body = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s+/g, '');
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function normalizePrivateKey(raw: string): string {
  return raw.replace(/\\n/g, '\n').trim();
}

function getMinuteBucket(iso: string): string {
  return `minute:${iso.slice(0, 16)}`;
}

function getDayBucket(iso: string): string {
  return `day:${iso.slice(0, 10)}`;
}

async function consumeTranslateQuota(env: Env, chars: number): Promise<Response | null> {
  const rpmLimit = toInt(env.GOOGLE_TRANSLATE_RPM_LIMIT, DEFAULT_RPM_LIMIT);
  const dailyLimit = toInt(env.GOOGLE_TRANSLATE_DAILY_CHAR_LIMIT, DEFAULT_DAILY_CHAR_LIMIT);
  const currentIso = now();

  const minuteBucket = getMinuteBucket(currentIso);
  const dayBucket = getDayBucket(currentIso);

  const [minuteUsage, dayUsage] = await Promise.all([
    env.DB.prepare('SELECT request_count FROM translation_quota_usage WHERE bucket_key = ?')
      .bind(minuteBucket)
      .first<{ request_count: number }>(),
    env.DB.prepare('SELECT char_count FROM translation_quota_usage WHERE bucket_key = ?')
      .bind(dayBucket)
      .first<{ char_count: number }>(),
  ]);

  if ((minuteUsage?.request_count ?? 0) + 1 > rpmLimit) {
    return err('Translation quota exceeded: requests per minute', 429, 'translate_rpm_quota');
  }

  if ((dayUsage?.char_count ?? 0) + chars > dailyLimit) {
    return err('Translation quota exceeded: daily characters', 429, 'translate_daily_quota');
  }

  await Promise.all([
    env.DB.prepare(
      `INSERT INTO translation_quota_usage (bucket_key, request_count, char_count, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(bucket_key) DO UPDATE SET
         request_count = request_count + excluded.request_count,
         char_count = char_count + excluded.char_count,
         updated_at = excluded.updated_at`
    ).bind(minuteBucket, 1, chars, currentIso).run(),
    env.DB.prepare(
      `INSERT INTO translation_quota_usage (bucket_key, request_count, char_count, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(bucket_key) DO UPDATE SET
         request_count = request_count + excluded.request_count,
         char_count = char_count + excluded.char_count,
         updated_at = excluded.updated_at`
    ).bind(dayBucket, 1, chars, currentIso).run(),
  ]);

  return null;
}

async function loadTranslationMemory(env: Env, sourceKo: string): Promise<TranslationMemoryRow | null> {
  return env.DB.prepare(
    `SELECT source_ko,en,ja,zh_cn,zh_tw,es,fr,de,pt,vi,th,id_lang,ar
     FROM translation_memory
     WHERE source_ko = ?`
  ).bind(sourceKo).first<TranslationMemoryRow>();
}

async function touchTranslationMemory(env: Env, sourceKo: string): Promise<void> {
  await env.DB.prepare(
    `UPDATE translation_memory
     SET last_used_at = ?, use_count = use_count + 1
     WHERE source_ko = ?`
  ).bind(now(), sourceKo).run();
}

async function upsertTranslationMemory(env: Env, sourceKo: string, translations: Partial<TranslationMap>): Promise<void> {
  const timestamp = now();
  await env.DB.prepare(
    `INSERT INTO translation_memory
      (id, source_ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, created_at, updated_at, last_used_at, use_count)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(source_ko) DO UPDATE SET
       en = COALESCE(translation_memory.en, excluded.en),
       ja = COALESCE(translation_memory.ja, excluded.ja),
       zh_cn = COALESCE(translation_memory.zh_cn, excluded.zh_cn),
       zh_tw = COALESCE(translation_memory.zh_tw, excluded.zh_tw),
       es = COALESCE(translation_memory.es, excluded.es),
       fr = COALESCE(translation_memory.fr, excluded.fr),
       de = COALESCE(translation_memory.de, excluded.de),
       pt = COALESCE(translation_memory.pt, excluded.pt),
       vi = COALESCE(translation_memory.vi, excluded.vi),
       th = COALESCE(translation_memory.th, excluded.th),
       id_lang = COALESCE(translation_memory.id_lang, excluded.id_lang),
       ar = COALESCE(translation_memory.ar, excluded.ar),
       updated_at = excluded.updated_at,
       last_used_at = excluded.last_used_at,
       use_count = translation_memory.use_count + 1`
  ).bind(
    newId(),
    sourceKo,
    translations.en ?? null,
    translations.ja ?? null,
    translations.zh_cn ?? null,
    translations.zh_tw ?? null,
    translations.es ?? null,
    translations.fr ?? null,
    translations.de ?? null,
    translations.pt ?? null,
    translations.vi ?? null,
    translations.th ?? null,
    translations.id_lang ?? null,
    translations.ar ?? null,
    timestamp,
    timestamp,
    timestamp,
    1,
  ).run();
}

async function getGoogleAccessToken(env: Env): Promise<string> {
  const serviceAccountEmail = env.GOOGLE_TRANSLATE_SERVICE_ACCOUNT_EMAIL?.trim();
  const rawPrivateKey = env.GOOGLE_TRANSLATE_SERVICE_ACCOUNT_PRIVATE_KEY?.trim();
  if (!serviceAccountEmail || !rawPrivateKey) {
    throw new Error('Google service account credentials are not configured');
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (
    googleTokenCache &&
    googleTokenCache.email === serviceAccountEmail &&
    googleTokenCache.expiresAt > nowSec + 30
  ) {
    return googleTokenCache.token;
  }

  const privateKeyPem = normalizePrivateKey(rawPrivateKey);
  const signingKey = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(privateKeyPem),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const payload = {
    iss: serviceAccountEmail,
    scope: GOOGLE_TRANSLATE_SCOPE,
    aud: GOOGLE_TOKEN_AUDIENCE,
    iat: nowSec,
    exp: nowSec + 3600,
  };
  const header = { alg: 'RS256', typ: 'JWT' };
  const unsigned = `${base64UrlEncodeJson(header)}.${base64UrlEncodeJson(payload)}`;
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    signingKey,
    new TextEncoder().encode(unsigned),
  );
  const assertion = `${unsigned}.${base64UrlEncodeBytes(new Uint8Array(signature))}`;

  const tokenResponse = await fetch(GOOGLE_TOKEN_AUDIENCE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  const tokenJson = await tokenResponse.json() as {
    access_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };

  if (!tokenResponse.ok || !tokenJson.access_token) {
    throw new Error(tokenJson.error_description || tokenJson.error || `Google OAuth HTTP ${tokenResponse.status}`);
  }

  const expiresIn = tokenJson.expires_in ?? 3600;
  googleTokenCache = {
    email: serviceAccountEmail,
    token: tokenJson.access_token,
    expiresAt: nowSec + expiresIn,
  };
  return tokenJson.access_token;
}

async function translateWithGoogle(env: Env, sourceKo: string, target: TargetLang): Promise<string> {
  const quotaErr = await consumeTranslateQuota(env, charLength(sourceKo));
  if (quotaErr) throw quotaErr;

  const accessToken = await getGoogleAccessToken(env);
  const endpoint = 'https://translation.googleapis.com/language/translate/v2';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      q: sourceKo,
      source: 'ko',
      target: GOOGLE_LANG_MAP[target],
      format: 'text',
    }),
  });

  const json = await response.json() as {
    data?: { translations?: Array<{ translatedText?: string }> };
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(json.error?.message || `Google Translate HTTP ${response.status}`);
  }

  const translated = json.data?.translations?.[0]?.translatedText?.trim();
  if (!translated) throw new Error('Google Translate returned empty text');
  return translated;
}

export async function handleI18n(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname;
  const isAdmin = path.startsWith('/api/v1/admin/i18n');

  // ─── 공개: GET /api/v1/i18n ───────────────────────────────────────────────
  if (!isAdmin && request.method === 'GET') {
    const lang = url.searchParams.get('lang') || 'ko';
    const prefix = url.searchParams.get('prefix') || '';
    if (!LANGS.includes(lang as Lang)) return err('Unsupported lang');

    const col = lang as string;
    let query = `SELECT key, ${col} as value FROM i18n_translations WHERE is_active = 1`;
    const params: string[] = [];
    if (prefix) { query += ' AND key LIKE ?'; params.push(`${prefix}%`); }
    query += ' ORDER BY key';

    const rows = await env.DB.prepare(query).bind(...params).all<{ key: string; value: string }>();
    const result: Record<string, string> = {};
    for (const r of rows.results) result[r.key] = r.value ?? '';
    return ok(result);
  }

  // ─── Admin 전용 ───────────────────────────────────────────────────────────
  if (isAdmin) {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    const roleErr = requireRole(auth as JwtPayload, ['admin']);
    if (roleErr) return roleErr;

    const idMatch = path.match(/\/api\/v1\/admin\/i18n\/([^/]+)$/);
    const id = idMatch?.[1];

    // 자동 번역 API (한국어 -> 나머지 언어)
    if (request.method === 'POST' && path.endsWith('/translate')) {
      let body: { text: string; existing?: Partial<Record<TargetLang, string>> };
      try { body = await request.json() as typeof body; } catch { return err('Invalid JSON'); }

      const sourceKo = body.text?.trim();
      if (!sourceKo) return err('text required');
      if (KEY_LITERAL_PATTERN.test(sourceKo)) {
        return err('translation source must be korean label, not key', 400, 'invalid_translate_source');
      }

      const existing = body.existing ?? {};
      const translations = {} as TranslationMap;
      const generated: Partial<TranslationMap> = {};
      let reusedCount = 0;
      let translatedCount = 0;

      const memory = await loadTranslationMemory(env, sourceKo);

      for (const lang of TARGET_LANGS) {
        const adminValue = (existing[lang] || '').trim();
        if (adminValue) {
          if (KEY_LITERAL_PATTERN.test(adminValue)) {
            return err(`invalid translation value for ${lang}: key pattern not allowed`, 400, 'invalid_translate_value');
          }
          translations[lang] = adminValue;
          continue;
        }

        const cached = (memory?.[lang] || '').trim();
        if (cached) {
          translations[lang] = cached;
          reusedCount += 1;
          continue;
        }

        try {
          const translated = await translateWithGoogle(env, sourceKo, lang);
          translations[lang] = translated;
          generated[lang] = translated;
          translatedCount += 1;
        } catch (translateError) {
          if (translateError instanceof Response) return translateError;
          translations[lang] = '';
        }
      }

      if (Object.keys(generated).length > 0) {
        await upsertTranslationMemory(env, sourceKo, generated);
      } else if (memory) {
        await touchTranslationMemory(env, sourceKo);
      }

      return ok({
        translations,
        meta: {
          source: 'ko',
          reused_count: reusedCount,
          translated_count: translatedCount,
          cache_hit: reusedCount > 0,
        },
      });
    }

    // 번역 품질 감사 API
    if (request.method === 'GET' && path.endsWith('/audit')) {
      const scopePrefix = (url.searchParams.get('prefix') || 'master.').trim();
      const likePattern = `${scopePrefix}%`;
      const missingRows = await env.DB.prepare(
        `SELECT COUNT(*) AS c
         FROM i18n_translations
         WHERE key LIKE ?
           AND (
             TRIM(COALESCE(ko, '')) = '' OR
             TRIM(COALESCE(en, '')) = '' OR
             TRIM(COALESCE(ja, '')) = '' OR
             TRIM(COALESCE(zh_cn, '')) = '' OR
             TRIM(COALESCE(zh_tw, '')) = '' OR
             TRIM(COALESCE(es, '')) = '' OR
             TRIM(COALESCE(fr, '')) = '' OR
             TRIM(COALESCE(de, '')) = '' OR
             TRIM(COALESCE(pt, '')) = '' OR
             TRIM(COALESCE(vi, '')) = '' OR
             TRIM(COALESCE(th, '')) = '' OR
             TRIM(COALESCE(id_lang, '')) = '' OR
             TRIM(COALESCE(ar, '')) = ''
           )`
      ).bind(likePattern).first<{ c: number }>();

      const keyLiteralRows = await env.DB.prepare(
        `SELECT COUNT(*) AS c
         FROM i18n_translations
         WHERE key LIKE ?
           AND (
             ko = key OR en = key OR ja = key OR zh_cn = key OR zh_tw = key OR
             es = key OR fr = key OR de = key OR pt = key OR vi = key OR
             th = key OR id_lang = key OR ar = key OR
             ko LIKE 'master.%' OR en LIKE 'master.%' OR ja LIKE 'master.%' OR
             zh_cn LIKE 'master.%' OR zh_tw LIKE 'master.%' OR es LIKE 'master.%' OR
             fr LIKE 'master.%' OR de LIKE 'master.%' OR pt LIKE 'master.%' OR
             vi LIKE 'master.%' OR th LIKE 'master.%' OR id_lang LIKE 'master.%' OR ar LIKE 'master.%'
           )`
      ).bind(likePattern).first<{ c: number }>();

      const patternRows = await env.DB.prepare(
        `SELECT COUNT(*) AS c
         FROM i18n_translations
         WHERE key LIKE ?
           AND (
             ko LIKE '%.disease_%' OR en LIKE '%.disease_%' OR ja LIKE '%.disease_%' OR
             zh_cn LIKE '%.disease_%' OR zh_tw LIKE '%.disease_%' OR es LIKE '%.disease_%' OR
             fr LIKE '%.disease_%' OR de LIKE '%.disease_%' OR pt LIKE '%.disease_%' OR
             vi LIKE '%.disease_%' OR th LIKE '%.disease_%' OR id_lang LIKE '%.disease_%' OR ar LIKE '%.disease_%'
           )`
      ).bind(likePattern).first<{ c: number }>();

      const samples = await env.DB.prepare(
        `SELECT key, ko, en, ja
         FROM i18n_translations
         WHERE key LIKE ?
           AND (
             ko = key OR en = key OR ja = key OR zh_cn = key OR zh_tw = key OR
             es = key OR fr = key OR de = key OR pt = key OR vi = key OR
             th = key OR id_lang = key OR ar = key OR
             ko LIKE 'master.%' OR en LIKE 'master.%' OR ja LIKE 'master.%' OR
             zh_cn LIKE 'master.%' OR zh_tw LIKE 'master.%' OR es LIKE 'master.%' OR
             fr LIKE 'master.%' OR de LIKE 'master.%' OR pt LIKE 'master.%' OR
             vi LIKE 'master.%' OR th LIKE 'master.%' OR id_lang LIKE 'master.%' OR ar LIKE 'master.%'
           )
         ORDER BY updated_at DESC
         LIMIT 30`
      ).bind(likePattern).all<{ key: string; ko: string | null; en: string | null; ja: string | null }>();

      return ok({
        scope_prefix: scopePrefix,
        summary: {
          missing_translation_rows: missingRows?.c ?? 0,
          key_literal_rows: keyLiteralRows?.c ?? 0,
          disease_pattern_rows: patternRows?.c ?? 0,
        },
        samples: samples.results,
      });
    }

    // GET 목록
    if (request.method === 'GET' && !id) {
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
      const offset = (page - 1) * limit;
      const prefix = url.searchParams.get('prefix') || '';
      const activeOnly = url.searchParams.get('active_only') === 'true';

      let query = 'SELECT * FROM i18n_translations WHERE 1=1';
      const params: (string | number)[] = [];
      if (prefix) { query += ' AND key LIKE ?'; params.push(`${prefix}%`); }
      if (activeOnly) { query += ' AND is_active = 1'; }
      query += ' ORDER BY key LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const [rows, total] = await Promise.all([
        env.DB.prepare(query).bind(...params).all(),
        env.DB.prepare('SELECT COUNT(*) as c FROM i18n_translations WHERE 1=1'
          + (prefix ? ' AND key LIKE ?' : '')
          + (activeOnly ? ' AND is_active = 1' : ''))
          .bind(...(prefix ? [`${prefix}%`] : [])).first<{ c: number }>(),
      ]);

      return ok({ items: rows.results, total: total?.c ?? 0, page, limit });
    }

    // POST 새 키
    if (request.method === 'POST' && !id) {
      let body: Record<string, string>;
      try { body = await request.json() as Record<string, string>; } catch { return err('Invalid JSON'); }
      if (!body.key) return err('key required');

      const existing = await env.DB.prepare('SELECT id FROM i18n_translations WHERE key = ?').bind(body.key).first();
      if (existing) return err('key already exists', 409, 'duplicate_key');

      const langVals = Object.fromEntries(LANGS.map(l => [l, body[l] ?? null])) as Record<string, string | null>;
      const newRow = {
        id: newId(), key: body.key, page: body.page ?? null,
        is_active: 1, created_at: now(), updated_at: now(),
        ...langVals,
      };
      await env.DB.prepare(
        `INSERT INTO i18n_translations (id,key,page,ko,en,ja,zh_cn,zh_tw,es,fr,de,pt,vi,th,id_lang,ar,is_active,created_at,updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
      ).bind(
        newRow.id, newRow.key, newRow.page,
        langVals.ko, langVals.en, langVals.ja, langVals.zh_cn, langVals.zh_tw,
        langVals.es, langVals.fr, langVals.de, langVals.pt, langVals.vi, langVals.th, langVals.id_lang, langVals.ar,
        newRow.is_active, newRow.created_at, newRow.updated_at,
      ).run();
      return created(newRow);
    }

    // PUT 수정
    if (request.method === 'PUT' && id) {
      let body: Record<string, string | number | boolean>;
      try { body = await request.json() as Record<string, string | number | boolean>; } catch { return err('Invalid JSON'); }

      const sets: string[] = ['updated_at = ?'];
      const vals: (string | number | null)[] = [now()];
      if (body.page !== undefined) { sets.push('page = ?'); vals.push(body.page as string); }
      if (body.is_active !== undefined) { sets.push('is_active = ?'); vals.push(body.is_active ? 1 : 0); }
      for (const l of LANGS) {
        if (body[l] !== undefined) { sets.push(`${l} = ?`); vals.push(body[l] as string); }
      }
      vals.push(id);

      const result = await env.DB.prepare(
        `UPDATE i18n_translations SET ${sets.join(', ')} WHERE id = ?`
      ).bind(...vals).run();
      if (result.meta.changes === 0) return err('Not found', 404);

      const row = await env.DB.prepare('SELECT * FROM i18n_translations WHERE id = ?').bind(id).first();
      return ok(row);
    }

    // DELETE (비활성화)
    if (request.method === 'DELETE' && id) {
      const result = await env.DB.prepare(
        'UPDATE i18n_translations SET is_active = 0, updated_at = ? WHERE id = ?'
      ).bind(now(), id).run();
      if (result.meta.changes === 0) return err('Not found', 404);
      return ok({ id, is_active: false });
    }
  }

  return err('Not found', 404);
}
