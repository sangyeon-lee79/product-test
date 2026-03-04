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

export async function handleI18n(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname;
  const isAdmin = path.startsWith('/api/v1/admin/i18n');

  // ─── 공개: GET /api/v1/i18n ───────────────────────────────────────────────
  if (!isAdmin && request.method === 'GET') {
    const lang = url.searchParams.get('lang') || 'ko';
    const prefix = url.searchParams.get('prefix') || '';
    if (!LANGS.includes(lang as typeof LANGS[number])) return err('Unsupported lang');

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
      let body: { text: string };
      try { body = await request.json() as { text: string }; } catch { return err('Invalid JSON'); }
      if (!body.text) return err('text required');

      // TODO: 실제 서비스 시 Cloudflare Workers AI 또는 Google Translate API 연동
      // 현재는 시뮬레이션: [언어코드] + 원문 형태의 mock 데이터 반환
      const translations: Record<string, string> = {};
      const mockPrefixes: Record<string, string> = {
        en: '[EN]', ja: '[JA]', zh_cn: '[ZH-CN]', zh_tw: '[ZH-TW]', es: '[ES]',
        fr: '[FR]', de: '[DE]', pt: '[PT]', vi: '[VI]', th: '[TH]', id_lang: '[ID]', ar: '[AR]'
      };
      
      for (const lang of LANGS) {
        if (lang === 'ko') continue;
        translations[lang] = `${mockPrefixes[lang] || `[${lang}]`} ${body.text}`;
      }

      return ok({ translations });
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
