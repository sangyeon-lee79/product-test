import type { Env, JwtPayload } from '../types';
import { ok, created, err, newId, now } from '../types';
import { requireAuth, requireRole, verifyJwt } from '../middleware/auth';
import { hasTable, hasColumn } from '../helpers/sqlHelpers';
import { SUPPORTED_LANGS } from '@petfolio/shared';

type FeedRow = Record<string, unknown>;

function toJsonArray(value: unknown): string {
  if (!Array.isArray(value)) return '[]';
  return JSON.stringify(value.filter((x) => typeof x === 'string').map((x) => (x as string).trim()).filter(Boolean));
}

function parseJsonArray(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((x) => typeof x === 'string') as string[];
  if (typeof raw !== 'string' || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => typeof x === 'string') as string[];
  } catch {
    return [];
  }
}

async function optionalAuth(request: Request, env: Env): Promise<JwtPayload | null> {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    return await verifyJwt(auth.slice(7), env.JWT_SECRET);
  } catch {
    return null;
  }
}

async function friendSet(env: Env, userId: string): Promise<Set<string>> {
  const rows = await env.DB.prepare(
    `SELECT user_a_id, user_b_id FROM friendships
     WHERE status = 'active' AND (user_a_id = ? OR user_b_id = ?)`
  ).bind(userId, userId).all<{ user_a_id: string; user_b_id: string }>();
  const set = new Set<string>();
  for (const r of rows.results) {
    set.add(r.user_a_id === userId ? r.user_b_id : r.user_a_id);
  }
  return set;
}

function canViewFeed(row: FeedRow, me: JwtPayload | null, friends: Set<string>): boolean {
  const status = String(row.status || '');
  if (status !== 'published') return false;
  const isPublic = Number(row.is_public || 0) === 1;
  const visibility = String(row.visibility_scope || 'public');
  const author = String(row.author_user_id || '');

  if (!me) return isPublic;
  if (author === me.sub) return true;
  if (visibility === 'public' && isPublic) return true;
  if (visibility === 'friends_only' && friends.has(author)) return true;
  if (visibility === 'connected_only' && friends.has(author)) return true;
  if (visibility === 'booking_related_only') {
    const bookingGuardian = String(row.booking_guardian_id || '');
    const bookingSupplier = String(row.booking_supplier_id || '');
    if (bookingGuardian === me.sub || bookingSupplier === me.sub) return true;
    if (friends.has(author)) return true;
  }
  return false;
}

function normalizeFeedRow(row: FeedRow): FeedRow {
  return {
    ...row,
    media_urls: parseJsonArray(row.media_urls),
    tags: parseJsonArray(row.tags),
  };
}

function normalizeAlbumVisibilityFromFeed(visibility: string): string {
  if (visibility === 'connected_only') return 'guardian_supplier_only';
  if (visibility === 'booking_related_only') return 'booking_related';
  return visibility;
}

function inferAlbumSourceType(feedType: string, tags: string[]): string {
  if (feedType === 'booking_completed') return 'booking_completed';
  if (feedType === 'health_update') return 'health_record';
  const sourceTag = tags.find((tag) => tag.startsWith('source:'));
  if (!sourceTag) return 'feed';
  const value = sourceTag.replace('source:', '').trim();
  if (value === 'profile') return 'profile';
  if (value === 'manual_upload') return 'manual_upload';
  if (value === 'health_record') return 'health_record';
  if (value === 'booking_completed') return 'booking_completed';
  return 'feed';
}

function inferMediaType(url: string): 'image' | 'video' {
  const value = url.toLowerCase();
  if (/(\.mp4|\.mov|\.webm|\.mkv|\.avi)(\?|$)/.test(value)) return 'video';
  return 'image';
}

function inferAlbumStatus(feedStatus: string, publishRequestStatus: string): 'active' | 'pending' | 'hidden' {
  if (publishRequestStatus === 'pending') return 'pending';
  if (feedStatus === 'published') return 'active';
  return 'hidden';
}

type LegacyFeedCompat = {
  hasBusinessCategoryId: boolean;
  hasPetTypeId: boolean;
};

async function getLegacyFeedCompat(env: Env): Promise<LegacyFeedCompat> {
  const [hasBusinessCategoryId, hasPetTypeId] = await Promise.all([
    hasColumn(env, 'feeds', 'business_category_id'),
    hasColumn(env, 'feeds', 'pet_type_id'),
  ]);
  return { hasBusinessCategoryId, hasPetTypeId };
}

function legacyFeedInsertParts(
  compat: LegacyFeedCompat,
  values: {
    id: string;
    feedType: string;
    authorUserId: string;
    authorRole: string;
    petId: unknown;
    businessCategoryId: unknown;
    petTypeId: unknown;
    visibilityScope: string;
    bookingId: unknown;
    supplierId: unknown;
    relatedServiceId: unknown;
    caption: string | null;
    mediaUrls: string;
    tags: string;
    publishRequestStatus: string;
    isPublic: boolean;
    status: string;
    createdAt: string;
    updatedAt: string;
  },
): { sql: string; bindings: unknown[] } {
  const columns = [
    'id',
    'feed_type',
    'author_user_id',
    'author_role',
    'pet_id',
  ];
  const bindings: unknown[] = [
    values.id,
    values.feedType,
    values.authorUserId,
    values.authorRole,
    values.petId ?? null,
  ];

  if (compat.hasBusinessCategoryId) {
    columns.push('business_category_id');
    bindings.push(values.businessCategoryId ?? null);
  }
  if (compat.hasPetTypeId) {
    columns.push('pet_type_id');
    bindings.push(values.petTypeId ?? null);
  }

  columns.push(
    'visibility_scope',
    'booking_id',
    'supplier_id',
    'related_service_id',
    'caption',
    'media_urls',
    'tags',
    'publish_request_status',
    'is_public',
    'status',
    'created_at',
    'updated_at',
  );
  bindings.push(
    values.visibilityScope,
    values.bookingId ?? null,
    values.supplierId ?? null,
    values.relatedServiceId ?? null,
    values.caption,
    values.mediaUrls,
    values.tags,
    values.publishRequestStatus,
    values.isPublic,
    values.status,
    values.createdAt,
    values.updatedAt,
  );

  const placeholders = columns.map(() => '?').join(', ');
  return {
    sql: `INSERT INTO feeds (${columns.join(', ')}) VALUES (${placeholders})`,
    bindings,
  };
}

function legacyFeedUpdateParts(
  compat: LegacyFeedCompat,
  values: {
    petId: unknown;
    businessCategoryId: unknown;
    petTypeId: unknown;
    caption: string | null;
    mediaUrls: string;
    updatedAt: string;
    id: string;
  },
): { sql: string; bindings: unknown[] } {
  const setClauses = ['pet_id = COALESCE(?, pet_id)'];
  const bindings: unknown[] = [values.petId ?? null];

  if (compat.hasBusinessCategoryId) {
    setClauses.push('business_category_id = COALESCE(?, business_category_id)');
    bindings.push(values.businessCategoryId ?? null);
  }
  if (compat.hasPetTypeId) {
    setClauses.push('pet_type_id = COALESCE(?, pet_type_id)');
    bindings.push(values.petTypeId ?? null);
  }

  setClauses.push(
    'caption = ?',
    'media_urls = ?',
    `publish_request_status = 'pending'`,
    `visibility_scope = 'connected_only'`,
    'is_public = false',
    `status = 'hidden'`,
    'updated_at = ?',
  );
  bindings.push(values.caption, values.mediaUrls, values.updatedAt, values.id);

  return {
    sql: `UPDATE feeds SET ${setClauses.join(', ')} WHERE id = ?`,
    bindings,
  };
}

async function upsertAlbumFromFeed(env: Env, params: {
  feedId: string;
  petId: string | null;
  bookingId?: string | null;
  feedType: string;
  mediaUrls: string[];
  caption: string | null;
  tags: string[];
  authorUserId: string;
  visibilityScope: string;
  feedStatus: string;
  publishRequestStatus: string;
  createdAt: string;
  updatedAt: string;
}): Promise<void> {
  if (!params.petId) return;
  if (!params.mediaUrls.length) return;

  const sourceType = inferAlbumSourceType(params.feedType, params.tags);
  const visibility = normalizeAlbumVisibilityFromFeed(params.visibilityScope);
  const status = inferAlbumStatus(params.feedStatus, params.publishRequestStatus);
  const tagsJson = JSON.stringify(params.tags);

  for (let index = 0; index < params.mediaUrls.length; index += 1) {
    const mediaUrl = (params.mediaUrls[index] || '').trim();
    if (!mediaUrl) continue;
    await env.DB.prepare(
      `INSERT INTO pet_album_media (
        id, pet_id, source_type, source_id, booking_id,
        media_type, media_url, thumbnail_url, caption, tags,
        uploaded_by_user_id, visibility_scope, is_primary,
        sort_order, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(pet_id, source_type, source_id, media_url)
      DO UPDATE SET
        booking_id = excluded.booking_id,
        media_type = excluded.media_type,
        thumbnail_url = excluded.thumbnail_url,
        caption = excluded.caption,
        tags = excluded.tags,
        uploaded_by_user_id = excluded.uploaded_by_user_id,
        visibility_scope = excluded.visibility_scope,
        sort_order = excluded.sort_order,
        status = excluded.status,
        updated_at = excluded.updated_at`
    ).bind(
      newId(),
      params.petId,
      sourceType,
      params.feedId,
      params.bookingId ?? null,
      inferMediaType(mediaUrl),
      mediaUrl,
      mediaUrl,
      params.caption,
      tagsJson,
      params.authorUserId,
      visibility,
      sourceType === 'profile' && index === 0,
      index,
      status,
      params.createdAt,
      params.updatedAt,
    ).run();
  }

  if (sourceType === 'profile') {
    await env.DB.prepare(
      `UPDATE pet_album_media
       SET is_primary = CASE WHEN id = (
         SELECT id FROM pet_album_media
         WHERE pet_id = ? AND source_type = 'profile' AND status = 'active'
         ORDER BY created_at DESC, id DESC
         LIMIT 1
       ) THEN true ELSE false END,
       updated_at = ?
       WHERE pet_id = ? AND source_type = 'profile'`
    ).bind(params.petId, now(), params.petId).run();
  }
}

async function feedFilters(request: Request, env: Env, url: URL): Promise<Response> {
  const lang = (url.searchParams.get('lang') || 'ko').trim();
  const langCol = (SUPPORTED_LANGS as readonly string[]).includes(lang) ? lang : 'ko';
  const hasProviderProfiles = await hasTable(env, 'provider_profiles');
  const hasPets = await hasTable(env, 'pets');

  // Business categories: distinct L1 from provider_profiles
  const bizRows = hasProviderProfiles
    ? await env.DB.prepare(
      `SELECT DISTINCT mi.id, mi.code, mi.sort_order,
         'master.' || mc.code || '.' || mi.code AS i18n_key,
         COALESCE(it.${langCol}, it.ko, mi.code) AS label
       FROM provider_profiles pp
       JOIN master_items mi ON mi.id = pp.business_category_l1_id
       JOIN master_categories mc ON mc.id = mi.category_id
       LEFT JOIN i18n_translations it
         ON it.key = 'master.' || mc.code || '.' || mi.code
       WHERE pp.business_category_l1_id IS NOT NULL
         AND mi.status = 'active'
       ORDER BY mi.sort_order, mi.code`
    ).all<{ id: string; code: string; i18n_key: string; label: string }>()
    : { results: [] as Array<{ id: string; code: string; i18n_key: string; label: string }> };

  // Pet types: distinct L1 from pets table
  const petRows = hasPets
    ? await env.DB.prepare(
      `SELECT DISTINCT mi.id, mi.code, mi.sort_order,
         'master.' || mc.code || '.' || mi.code AS i18n_key,
         COALESCE(it.${langCol}, it.ko, mi.code) AS label
       FROM pets p
       JOIN master_items mi ON mi.id = p.pet_type_id
       JOIN master_categories mc ON mc.id = mi.category_id
       LEFT JOIN i18n_translations it
         ON it.key = 'master.' || mc.code || '.' || mi.code
       WHERE p.pet_type_id IS NOT NULL
         AND p.status = 'active'
         AND mi.status = 'active'
       ORDER BY mi.sort_order, mi.code`
    ).all<{ id: string; code: string; i18n_key: string; label: string }>()
    : { results: [] as Array<{ id: string; code: string; i18n_key: string; label: string }> };

  return ok({
    business_categories: bizRows.results,
    pet_types: petRows.results,
  });
}

// ─── Feed Card Injection ─────────────────────────────────────────────────────
// Reads feed_card_settings + feed_dummy_cards and injects dummy cards at intervals

interface DummyCard {
  id: string;
  tab_type: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  avatar_url: string | null;
  display_name: string | null;
  badge_text: string | null;
  score: number;
  region: string | null;
  metadata: string | null;
  is_active: boolean;
}

interface CardSetting {
  card_type: string;
  interval_n: number;
  sort_order: number;
  metadata: string | null;
}

async function injectCards(env: Env, feeds: FeedRow[]): Promise<FeedRow[]> {
  try {
    // 1. Get enabled card settings
    const settingsRows = await env.DB.prepare(
      `SELECT card_type, interval_n, sort_order, metadata
       FROM feed_card_settings
       WHERE is_enabled = true AND interval_n > 0
       ORDER BY sort_order`
    ).all<CardSetting>();

    const settings = settingsRows.results;
    if (!settings.length) return feeds;

    // 2. Map card_type → tab_types for dummy card selection
    const typeToTabs: Record<string, string[]> = {
      ranking: ['weekly_health_king', 'breed_health_king', 'local_health_king'],
      recommended: ['new_registration', 'recommended_user'],
      ad: ['ad'],
      store: ['store'],
    };

    // 3. Fetch random active dummy cards for each enabled type
    const cardPool: Record<string, DummyCard[]> = {};
    for (const s of settings) {
      const tabs = typeToTabs[s.card_type];
      if (!tabs?.length) continue;
      const placeholders = tabs.map(() => '?').join(',');
      const rows = await env.DB.prepare(
        `SELECT id, tab_type, title, subtitle, description, image_url, link_url,
                avatar_url, display_name, badge_text, score, region, metadata, is_active
         FROM feed_dummy_cards
         WHERE tab_type IN (${placeholders}) AND is_active = true
         ORDER BY random()
         LIMIT 20`
      ).bind(...tabs).all<DummyCard>();
      if (rows.results.length) {
        cardPool[s.card_type] = rows.results;
      }
    }

    if (!Object.keys(cardPool).length) return feeds;

    // 4. Build merged feed with cards inserted at interval positions
    const result: FeedRow[] = [];
    const counters: Record<string, number> = {};
    let postIdx = 0;

    for (let pos = 0; result.length < feeds.length + 30 && postIdx <= feeds.length; pos++) {
      let inserted = false;

      for (const s of settings) {
        const pool = cardPool[s.card_type];
        if (!pool?.length) continue;
        if ((pos + 1) > 0 && (pos + 1) % s.interval_n === 0) {
          const idx = (counters[s.card_type] || 0) % pool.length;
          counters[s.card_type] = idx + 1;
          const card = pool[idx];

          let meta: Record<string, unknown> = {};
          try { meta = card.metadata ? JSON.parse(card.metadata) : {}; } catch { /* */ }

          // For ad cards, merge settings metadata (ad_source, adsense_* config)
          if (s.card_type === 'ad' && s.metadata) {
            try {
              const settingsMeta = JSON.parse(s.metadata) as Record<string, unknown>;
              meta = { ...meta, ...settingsMeta };
            } catch { /* */ }
          }

          result.push({
            id: `card_${card.id}`,
            feed_type: 'card',
            card_type: s.card_type,
            tab_type: card.tab_type,
            card_title: card.title,
            card_subtitle: card.subtitle,
            card_description: card.description,
            card_image_url: card.image_url,
            card_link_url: card.link_url,
            card_avatar_url: card.avatar_url,
            card_display_name: card.display_name,
            card_badge_text: card.badge_text,
            card_score: card.score,
            card_region: card.region,
            card_metadata: meta,
            created_at: now(),
          } as unknown as FeedRow);
          inserted = true;
          break; // only one card per position
        }
      }

      if (!inserted && postIdx < feeds.length) {
        result.push(feeds[postIdx]);
        postIdx++;
      }

      // Stop if all posts placed
      if (postIdx >= feeds.length && !inserted) break;
    }

    // Append remaining posts
    while (postIdx < feeds.length) {
      result.push(feeds[postIdx++]);
    }

    return result;
  } catch {
    return feeds; // fallback: return original feeds on error
  }
}

async function listFeeds(request: Request, env: Env, url: URL): Promise<Response> {
  const me = await optionalAuth(request, env);
  const friends = me ? await friendSet(env, me.sub) : new Set<string>();

  const feedType = (url.searchParams.get('feed_type') || '').trim();
  const businessCategoryId = (url.searchParams.get('business_category_id') || '').trim();
  const petTypeId = (url.searchParams.get('pet_type_id') || '').trim();
  const tab = (url.searchParams.get('tab') || 'all').trim();
  const isMineTab = tab === 'mine';
  const isFriendsTab = tab === 'friends';
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') || 30)));

  const hasFeedPosts = await hasTable(env, 'feed_posts');
  const hasBookings = await hasTable(env, 'bookings');
  const hasFeedPostBookingId = hasFeedPosts && await hasColumn(env, 'feed_posts', 'booking_id');
  if (hasFeedPosts) {
    const where: string[] = [];
    const params: (string | number)[] = [];
    if (feedType) { where.push('f.feed_type = ?'); params.push(feedType); }
    if (isMineTab) {
      if (!me) return ok({ feeds: [], filters: { feed_type: feedType || null, business_category_id: businessCategoryId || null, pet_type_id: petTypeId || null, tab } });
      where.push('f.author_user_id = ?');
      params.push(me.sub);
    } else if (isFriendsTab) {
      if (!me || friends.size === 0) return ok({ feeds: [], filters: { feed_type: feedType || null, business_category_id: businessCategoryId || null, pet_type_id: petTypeId || null, tab } });
      const placeholders = Array.from(friends).map(() => '?').join(',');
      where.push(`f.author_user_id IN (${placeholders})`);
      where.push(`f.visibility_scope IN ('public', 'friends_only')`);
      params.push(...Array.from(friends));
    }
    const rows = await env.DB.prepare(
      `SELECT
        f.*,
        u.email as author_email,
        p.name as pet_name,
        NULL as business_category_key,
        NULL as pet_type_key,
        NULL as business_category_ko,
        NULL as pet_type_ko,
        NULL as booking_guardian_email,
        NULL as booking_supplier_email,
        ${hasBookings && hasFeedPostBookingId ? 'b.guardian_id' : 'NULL'} as booking_guardian_id,
        ${hasBookings && hasFeedPostBookingId ? 'b.supplier_id' : 'NULL'} as booking_supplier_id,
        CASE WHEN CAST(? AS TEXT) IS NULL THEN false ELSE EXISTS(
          SELECT 1 FROM feed_likes fl2 WHERE fl2.post_id = f.id AND fl2.user_id = ?
        ) END as liked_by_me,
        (SELECT COUNT(*) FROM feed_likes fl WHERE fl.post_id = f.id) as like_count,
        (SELECT COUNT(*) FROM feed_comments fc WHERE fc.post_id = f.id AND fc.status = 'active') as comment_count,
        CASE WHEN f.visibility_scope = 'public' THEN 1 ELSE 0 END as is_public,
        COALESCE((SELECT json_agg(fm.media_url ORDER BY fm.sort_order) FROM feed_media fm WHERE fm.post_id = f.id)::text, '[]') as media_urls,
        '[]' as tags,
        'none' as publish_request_status
       FROM feed_posts f
       LEFT JOIN users u ON u.id = f.author_user_id
       LEFT JOIN pets p ON p.id = (
         SELECT fp2.pet_id
         FROM feed_post_pets fp2
         WHERE fp2.post_id = f.id
         ORDER BY fp2.sort_order ASC, fp2.id ASC
         LIMIT 1
       )
       ${hasBookings && hasFeedPostBookingId ? 'LEFT JOIN bookings b ON b.id = f.booking_id' : ''}
       ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
       ORDER BY f.created_at DESC
       LIMIT ?`
    ).bind(me?.sub ?? null, me?.sub ?? null, ...params, limit).all<FeedRow>();

    const data = rows.results.map(normalizeFeedRow).filter((r) => canViewFeed(r, me, friends));
    const merged = isMineTab || isFriendsTab ? data : await injectCards(env, data);
    return ok({ feeds: merged, filters: { feed_type: feedType || null, business_category_id: businessCategoryId || null, pet_type_id: petTypeId || null, tab } });
  }

  const where: string[] = [];
  const params: (string | number)[] = [];
  const legacyCompat = await getLegacyFeedCompat(env);
  if (feedType) { where.push('f.feed_type = ?'); params.push(feedType); }
  if (businessCategoryId) {
    if (!legacyCompat.hasBusinessCategoryId) return ok({ feeds: [], filters: { feed_type: feedType || null, business_category_id: businessCategoryId || null, pet_type_id: petTypeId || null, tab } });
    where.push('f.business_category_id = ?');
    params.push(businessCategoryId);
  }
  if (petTypeId) {
    if (!legacyCompat.hasPetTypeId) return ok({ feeds: [], filters: { feed_type: feedType || null, business_category_id: businessCategoryId || null, pet_type_id: petTypeId || null, tab } });
    where.push('f.pet_type_id = ?');
    params.push(petTypeId);
  }
  if (isMineTab) {
    if (!me) return ok({ feeds: [], filters: { feed_type: feedType || null, business_category_id: businessCategoryId || null, pet_type_id: petTypeId || null, tab } });
    where.push('f.author_user_id = ?');
    params.push(me.sub);
  } else if (isFriendsTab) {
    if (!me || friends.size === 0) return ok({ feeds: [], filters: { feed_type: feedType || null, business_category_id: businessCategoryId || null, pet_type_id: petTypeId || null, tab } });
    const placeholders = Array.from(friends).map(() => '?').join(',');
    where.push(`f.author_user_id IN (${placeholders})`);
    where.push(`f.visibility_scope IN ('public', 'friends_only')`);
    params.push(...Array.from(friends));
  }

  const rows = await env.DB.prepare(
    `SELECT
      f.*,
      u.email as author_email,
      p.name as pet_name,
      ${legacyCompat.hasBusinessCategoryId ? 'bc.key' : 'NULL'} as business_category_key,
      ${legacyCompat.hasPetTypeId ? 'pt.key' : 'NULL'} as pet_type_key,
      ${legacyCompat.hasBusinessCategoryId ? 'bct.ko' : 'NULL'} as business_category_ko,
      ${legacyCompat.hasPetTypeId ? 'ptt.ko' : 'NULL'} as pet_type_ko,
      ${hasBookings ? 'bg.email' : 'NULL'} as booking_guardian_email,
      ${hasBookings ? 'bs.email' : 'NULL'} as booking_supplier_email,
      ${hasBookings ? 'b.guardian_id' : 'NULL'} as booking_guardian_id,
      ${hasBookings ? 'b.supplier_id' : 'NULL'} as booking_supplier_id,
      CASE WHEN CAST(? AS TEXT) IS NULL THEN false ELSE EXISTS(
        SELECT 1 FROM feed_likes fl2 WHERE fl2.feed_id = f.id AND fl2.user_id = ?
      ) END as liked_by_me,
      (SELECT COUNT(*) FROM feed_likes fl WHERE fl.feed_id = f.id) as like_count,
      (SELECT COUNT(*) FROM feed_comments fc WHERE fc.post_id = f.id AND fc.status = 'active') as comment_count
     FROM feeds f
     LEFT JOIN users u ON u.id = f.author_user_id
     LEFT JOIN pets p ON p.id = f.pet_id
     ${legacyCompat.hasBusinessCategoryId ? 'LEFT JOIN master_items bc ON bc.id = f.business_category_id' : ''}
     ${legacyCompat.hasPetTypeId ? 'LEFT JOIN master_items pt ON pt.id = f.pet_type_id' : ''}
     ${hasBookings ? 'LEFT JOIN bookings b ON b.id = f.booking_id' : ''}
     ${hasBookings ? 'LEFT JOIN users bg ON bg.id = b.guardian_id' : ''}
     ${hasBookings ? 'LEFT JOIN users bs ON bs.id = b.supplier_id' : ''}
     ${legacyCompat.hasBusinessCategoryId ? 'LEFT JOIN master_categories bcc ON bcc.id = bc.category_id' : ''}
     ${legacyCompat.hasBusinessCategoryId ? `LEFT JOIN i18n_translations bct
       ON bct.key = CASE
         WHEN bcc.key LIKE 'master.%' THEN (bcc.key || '.' || bc.key)
         ELSE ('master.' || bcc.key || '.' || bc.key)
       END` : ''}
     ${legacyCompat.hasPetTypeId ? 'LEFT JOIN master_categories ptc ON ptc.id = pt.category_id' : ''}
     ${legacyCompat.hasPetTypeId ? `LEFT JOIN i18n_translations ptt
       ON ptt.key = CASE
         WHEN ptc.key LIKE 'master.%' THEN (ptc.key || '.' || pt.key)
         ELSE ('master.' || ptc.key || '.' || pt.key)
       END` : ''}
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY f.created_at DESC
     LIMIT ?`
  ).bind(me?.sub ?? null, me?.sub ?? null, ...params, limit).all<FeedRow>();

  const data = rows.results.map(normalizeFeedRow).filter((r) => canViewFeed(r, me, friends));
  const merged = isMineTab || isFriendsTab ? data : await injectCards(env, data);

  return ok({ feeds: merged, filters: { feed_type: feedType || null, business_category_id: businessCategoryId || null, pet_type_id: petTypeId || null, tab } });
}

async function createGuardianPost(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  const me = auth as JwtPayload;

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return err('Invalid JSON'); }

  const feedType = (String(body.feed_type || 'guardian_post')).trim();
  const visibility = (String(body.visibility_scope || 'public')).trim();
  const caption = typeof body.caption === 'string' ? body.caption.trim() : null;
  const mediaUrls = toJsonArray(body.media_urls);
  const tags = toJsonArray(body.tags);

  if (!['guardian_post', 'health_update', 'supplier_story', 'pet_milestone', 'supplier_post'].includes(feedType)) {
    return err('invalid feed_type');
  }

  const postType = (String(body.post_type || 'GENERAL')).trim().toUpperCase();
  if (!['GENERAL', 'NEWS', 'PRODUCT', 'EVENT', 'HIRING'].includes(postType)) {
    return err('invalid post_type');
  }

  const id = newId();
  const publicVisible = visibility === 'public';
  const timestamp = now();
  if (await hasTable(env, 'feed_posts')) {
    const hasPostType = await hasColumn(env, 'feed_posts', 'post_type');
    if (hasPostType) {
      await env.DB.prepare(
        `INSERT INTO feed_posts (
          id, author_user_id, author_role, feed_type, visibility_scope, caption, post_type, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?, ?)`
      ).bind(
        id, me.sub, me.role, feedType, visibility, caption, postType, timestamp, timestamp,
      ).run();
    } else {
      await env.DB.prepare(
        `INSERT INTO feed_posts (
          id, author_user_id, author_role, feed_type, visibility_scope, caption, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'published', ?, ?)`
      ).bind(
        id, me.sub, me.role, feedType, visibility, caption, timestamp, timestamp,
      ).run();
    }
    const petId = (body.pet_id as string | null) ?? null;
    if (petId) {
      await env.DB.prepare(
        `INSERT INTO feed_post_pets (id, post_id, pet_id, sort_order)
         VALUES (?, ?, ?, 0) ON CONFLICT DO NOTHING`
      ).bind(newId(), id, petId).run();
    }
    for (const [index, url] of parseJsonArray(mediaUrls).entries()) {
      await env.DB.prepare(
        `INSERT INTO feed_media (id, post_id, media_type, media_url, thumbnail_url, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(newId(), id, inferMediaType(url), url, url, index).run();
    }
  } else {
    const compat = await getLegacyFeedCompat(env);
    const legacyInsert = legacyFeedInsertParts(compat, {
      id,
      feedType,
      authorUserId: me.sub,
      authorRole: me.role,
      petId: body.pet_id ?? null,
      businessCategoryId: body.business_category_id ?? null,
      petTypeId: body.pet_type_id ?? null,
      visibilityScope: visibility,
      bookingId: body.booking_id ?? null,
      supplierId: body.supplier_id ?? null,
      relatedServiceId: body.related_service_id ?? null,
      caption,
      mediaUrls,
      tags,
      publishRequestStatus: 'none',
      isPublic: publicVisible,
      status: 'published',
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    await env.DB.prepare(legacyInsert.sql).bind(...legacyInsert.bindings).run();
  }

  await upsertAlbumFromFeed(env, {
    feedId: id,
    petId: (body.pet_id as string | null) ?? null,
    bookingId: (body.booking_id as string | null) ?? null,
    feedType,
    mediaUrls: parseJsonArray(mediaUrls),
    caption,
    tags: parseJsonArray(tags),
    authorUserId: me.sub,
    visibilityScope: visibility,
    feedStatus: 'published',
    publishRequestStatus: 'none',
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  return created({ id });
}

async function shareFromCompletion(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  const me = auth as JwtPayload;
  const roleErr = requireRole(me, ['guardian']);
  if (roleErr) return roleErr;

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return err('Invalid JSON'); }

  const completionId = String(body.completion_id || '').trim();
  const bookingId = String(body.booking_id || '').trim();
  if (!completionId && !bookingId) return err('completion_id or booking_id required');
  if (!await hasTable(env, 'bookings')) return err('booking feature unavailable', 503);

  const normalized = await hasTable(env, 'feed_publish_requests');
  const completion = normalized
    ? (completionId
      ? await env.DB.prepare(
        `SELECT
           fpr.id,
           fpr.booking_id,
           fpr.supplier_id,
           fpr.guardian_id,
           b.pet_id,
           b.service_id,
           fpr.media_urls,
           fpr.content AS completion_memo,
           CASE fpr.status
             WHEN 'approved' THEN 'approved'
             WHEN 'rejected' THEN 'rejected'
             ELSE 'pending'
           END AS publish_status
         FROM feed_publish_requests fpr
         INNER JOIN bookings b ON b.id = fpr.booking_id
         WHERE fpr.id = ?`
      ).bind(completionId).first<Record<string, unknown>>()
      : await env.DB.prepare(
        `SELECT
           fpr.id,
           fpr.booking_id,
           fpr.supplier_id,
           fpr.guardian_id,
           b.pet_id,
           b.service_id,
           fpr.media_urls,
           fpr.content AS completion_memo,
           CASE fpr.status
             WHEN 'approved' THEN 'approved'
             WHEN 'rejected' THEN 'rejected'
             ELSE 'pending'
           END AS publish_status
         FROM feed_publish_requests fpr
         INNER JOIN bookings b ON b.id = fpr.booking_id
         WHERE fpr.booking_id = ?
         ORDER BY fpr.created_at DESC
         LIMIT 1`
      ).bind(bookingId).first<Record<string, unknown>>())
    : (completionId
      ? await env.DB.prepare(
        `SELECT c.*, b.id AS booking_id, b.guardian_id, b.supplier_id, b.pet_id, b.service_id
         FROM booking_completion_contents c
         INNER JOIN bookings b ON b.id = c.booking_id
         WHERE c.id = ?`
      ).bind(completionId).first<Record<string, unknown>>()
      : await env.DB.prepare(
        `SELECT c.*, b.id AS booking_id, b.guardian_id, b.supplier_id, b.pet_id, b.service_id
         FROM booking_completion_contents c
         INNER JOIN bookings b ON b.id = c.booking_id
         WHERE c.booking_id = ?`
      ).bind(bookingId).first<Record<string, unknown>>());

  if (!completion) return err('completion not found', 404);
  if (String(completion.guardian_id || '') !== me.sub) return err('forbidden', 403);
  if (String(completion.publish_status || '') !== 'approved') {
    return err('completion must be approved first');
  }

  const mediaUrls = parseJsonArray(completion.media_urls);
  if (!mediaUrls.length) return err('completion has no media');

  const caption = typeof body.caption === 'string'
    ? body.caption.trim()
    : (typeof completion.completion_memo === 'string' ? completion.completion_memo : null);
  const visibility = (String(body.visibility_scope || 'public')).trim();
  if (!['public', 'friends_only', 'private'].includes(visibility)) return err('invalid visibility_scope');

  const inputTags = parseJsonArray(body.tags);
  const tags = Array.from(new Set([
    ...inputTags,
    'source:booking_completed',
    `completion:${String(completion.id || '')}`,
  ].filter(Boolean)));
  const tagsJson = JSON.stringify(tags);

  const id = newId();
  const timestamp = now();
  if (await hasTable(env, 'feed_posts')) {
    await env.DB.prepare(
      `INSERT INTO feed_posts (
        id, author_user_id, author_role, feed_type, visibility_scope, caption, status, created_at, updated_at
      ) VALUES (?, ?, 'guardian', 'guardian_post', ?, ?, 'published', ?, ?)`
    ).bind(id, me.sub, visibility, caption, timestamp, timestamp).run();
    if (completion.pet_id) {
      await env.DB.prepare(
        `INSERT INTO feed_post_pets (id, post_id, pet_id, sort_order)
         VALUES (?, ?, ?, 0) ON CONFLICT DO NOTHING`
      ).bind(newId(), id, completion.pet_id).run();
    }
    for (const [index, mediaUrl] of mediaUrls.entries()) {
      await env.DB.prepare(
        `INSERT INTO feed_media (id, post_id, media_type, media_url, thumbnail_url, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(newId(), id, inferMediaType(mediaUrl), mediaUrl, mediaUrl, index).run();
    }
  } else {
    const compat = await getLegacyFeedCompat(env);
    const legacyInsert = legacyFeedInsertParts(compat, {
      id,
      feedType: 'guardian_post',
      authorUserId: me.sub,
      authorRole: 'guardian',
      petId: completion.pet_id ?? null,
      businessCategoryId: body.business_category_id ?? null,
      petTypeId: body.pet_type_id ?? null,
      visibilityScope: visibility,
      bookingId: completion.booking_id ?? null,
      supplierId: completion.supplier_id ?? null,
      relatedServiceId: completion.service_id ?? null,
      caption,
      mediaUrls: JSON.stringify(mediaUrls),
      tags: tagsJson,
      publishRequestStatus: 'none',
      isPublic: visibility === 'public',
      status: 'published',
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    await env.DB.prepare(legacyInsert.sql).bind(...legacyInsert.bindings).run();
  }

  await upsertAlbumFromFeed(env, {
    feedId: id,
    petId: (completion.pet_id as string | null) ?? null,
    bookingId: (completion.booking_id as string | null) ?? null,
    feedType: 'guardian_post',
    mediaUrls,
    caption,
    tags,
    authorUserId: me.sub,
    visibilityScope: visibility,
    feedStatus: 'published',
    publishRequestStatus: 'none',
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  return created({ id, source: 'booking_completion', booking_id: completion.booking_id ?? null });
}

async function requestBookingCompletedFeed(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  const me = auth as JwtPayload;
  const roleErr = requireRole(me, ['provider']);
  if (roleErr) return roleErr;

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return err('Invalid JSON'); }
  const bookingId = String(body.booking_id || '').trim();
  if (!bookingId) return err('booking_id required');
  if (!await hasTable(env, 'bookings')) return err('booking feature unavailable', 503);

  const booking = await env.DB.prepare(
    `SELECT * FROM bookings WHERE id = ? AND supplier_id = ?`
  ).bind(bookingId, me.sub).first<Record<string, unknown>>();
  if (!booking) return err('booking not found', 404);
  if (!['service_completed', 'publish_requested', 'publish_rejected'].includes(String(booking.status || ''))) {
    return err('booking must be service_completed before publish request');
  }

  const normalized = await hasTable(env, 'feed_publish_requests');
  const completionId = newId();
  const mediaUrls = toJsonArray(body.media_urls);
  const memo = typeof body.completion_memo === 'string' ? body.completion_memo.trim() : null;
  const timestamp = now();

  if (normalized) {
    const existing = await env.DB.prepare(
      `SELECT id FROM feed_publish_requests
       WHERE booking_id = ?
       ORDER BY created_at DESC
       LIMIT 1`
    ).bind(bookingId).first<{ id: string }>();
    if (existing?.id) {
      await env.DB.prepare(
        `UPDATE feed_publish_requests
         SET supplier_id = ?, guardian_id = ?, content = ?, media_urls = ?, status = 'pending', created_at = ?
         WHERE id = ?`
      ).bind(me.sub, booking.guardian_id, memo, mediaUrls, timestamp, existing.id).run();
    } else {
      await env.DB.prepare(
        `INSERT INTO feed_publish_requests (
          id, booking_id, supplier_id, guardian_id, content, media_urls, status, created_at, approved_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, NULL)`
      ).bind(completionId, bookingId, me.sub, booking.guardian_id, memo, mediaUrls, timestamp).run();
    }
  } else {
    await env.DB.prepare(
      `INSERT INTO booking_completion_contents (
        id, booking_id, supplier_id, media_urls, completion_memo, publish_status, requested_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?)
      ON CONFLICT(booking_id) DO UPDATE SET
        media_urls = excluded.media_urls,
        completion_memo = excluded.completion_memo,
        publish_status = 'pending',
        requested_at = excluded.requested_at,
        updated_at = excluded.updated_at`
    ).bind(completionId, bookingId, me.sub, mediaUrls, memo, timestamp, timestamp, timestamp).run();
  }

  let feed = await env.DB.prepare(
    `SELECT id FROM feeds WHERE booking_id = ? AND feed_type = 'booking_completed'`
  ).bind(bookingId).first<{ id: string }>();

  if (!feed) {
    const feedId = newId();
    const compat = await getLegacyFeedCompat(env);
    const legacyInsert = legacyFeedInsertParts(compat, {
      id: feedId,
      feedType: 'booking_completed',
      authorUserId: me.sub,
      authorRole: 'provider',
      petId: booking.pet_id ?? null,
      businessCategoryId: body.business_category_id ?? booking.business_category_id ?? null,
      petTypeId: body.pet_type_id ?? null,
      visibilityScope: 'connected_only',
      bookingId,
      supplierId: me.sub,
      relatedServiceId: booking.service_id ?? null,
      caption: memo,
      mediaUrls,
      tags: '[]',
      publishRequestStatus: 'pending',
      isPublic: false,
      status: 'hidden',
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    await env.DB.prepare(legacyInsert.sql).bind(...legacyInsert.bindings).run();
    feed = { id: feedId };
  } else {
    const compat = await getLegacyFeedCompat(env);
    const legacyUpdate = legacyFeedUpdateParts(compat, {
      petId: booking.pet_id ?? null,
      businessCategoryId: body.business_category_id ?? booking.business_category_id ?? null,
      petTypeId: body.pet_type_id ?? null,
      caption: memo,
      mediaUrls,
      updatedAt: timestamp,
      id: feed.id,
    });
    await env.DB.prepare(legacyUpdate.sql).bind(...legacyUpdate.bindings).run();
  }

  await env.DB.prepare(`UPDATE bookings SET status = 'publish_requested', updated_at = ? WHERE id = ?`).bind(timestamp, bookingId).run();

  await upsertAlbumFromFeed(env, {
    feedId: feed.id,
    petId: (booking.pet_id as string | null) ?? null,
    bookingId,
    feedType: 'booking_completed',
    mediaUrls: parseJsonArray(mediaUrls),
    caption: memo,
    tags: [],
    authorUserId: me.sub,
    visibilityScope: 'connected_only',
    feedStatus: 'hidden',
    publishRequestStatus: 'pending',
    createdAt: String(booking.created_at || timestamp),
    updatedAt: timestamp,
  });

  return ok({ feed_id: feed.id, booking_id: bookingId, publish_request_status: 'pending' });
}

async function approveBookingCompletedFeed(request: Request, env: Env, feedId: string): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  const me = auth as JwtPayload;
  const roleErr = requireRole(me, ['guardian']);
  if (roleErr) return roleErr;

  let body: { approved?: boolean; action?: string; visibility_scope?: string };
  try { body = await request.json() as { approved?: boolean; action?: string; visibility_scope?: string }; }
  catch { return err('Invalid JSON'); }
  if (!await hasTable(env, 'bookings')) return err('booking feature unavailable', 503);

  const normalized = await hasTable(env, 'feed_publish_requests');
  if (normalized) {
    const req = await env.DB.prepare(
      `SELECT fpr.*, b.pet_id, b.service_id, b.guardian_id, b.supplier_id
       FROM feed_publish_requests fpr
       JOIN bookings b ON b.id = fpr.booking_id
       WHERE fpr.id = ?`
    ).bind(feedId).first<Record<string, unknown>>();
    if (!req) return err('publish request not found', 404);
    if (String(req.guardian_id) !== me.sub) return err('forbidden', 403);

    const approved = body.action ? body.action === 'approve' : !!body.approved;
    const timestamp = now();
    if (approved) {
      const visibility = (body.visibility_scope || 'public').trim();
      const postId = `booking-post-${feedId}`;
      await env.DB.prepare(
        `INSERT INTO feed_posts (
          id, author_user_id, author_role, feed_type, visibility_scope, caption, status, created_at, updated_at
        ) VALUES (?, ?, 'provider', 'booking_completed', ?, ?, 'published', ?, ?)
        ON CONFLICT (id) DO UPDATE SET
          author_user_id = excluded.author_user_id, author_role = excluded.author_role,
          feed_type = excluded.feed_type, visibility_scope = excluded.visibility_scope,
          caption = excluded.caption, status = excluded.status,
          created_at = excluded.created_at, updated_at = excluded.updated_at`
      ).bind(postId, req.supplier_id, visibility, req.content ?? null, timestamp, timestamp).run();
      if (req.pet_id) {
        await env.DB.prepare(
          `INSERT INTO feed_post_pets (id, post_id, pet_id, sort_order)
           VALUES (?, ?, ?, 0)
           ON CONFLICT (id) DO UPDATE SET post_id = excluded.post_id, pet_id = excluded.pet_id, sort_order = excluded.sort_order`
        ).bind(`fpp-${postId}`, postId, req.pet_id).run();
      }
      const mediaUrls = parseJsonArray(req.media_urls);
      for (const [index, mediaUrl] of mediaUrls.entries()) {
        await env.DB.prepare(
          `INSERT INTO feed_media (id, post_id, media_type, media_url, thumbnail_url, sort_order)
           VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT (id) DO UPDATE SET post_id = excluded.post_id, media_type = excluded.media_type,
             media_url = excluded.media_url, thumbnail_url = excluded.thumbnail_url, sort_order = excluded.sort_order`
        ).bind(`${postId}-m-${index}`, postId, inferMediaType(mediaUrl), mediaUrl, mediaUrl, index).run();
      }
      await env.DB.prepare(
        `UPDATE feed_publish_requests SET status = 'approved', approved_at = ? WHERE id = ?`
      ).bind(timestamp, feedId).run();
      await env.DB.prepare(
        `UPDATE bookings SET status = 'publish_approved', updated_at = ? WHERE id = ?`
      ).bind(timestamp, req.booking_id).run();

      await upsertAlbumFromFeed(env, {
        feedId: postId,
        petId: (req.pet_id as string | null) ?? null,
        bookingId: (req.booking_id as string | null) ?? null,
        feedType: 'booking_completed',
        mediaUrls,
        caption: (req.content as string | null) ?? null,
        tags: ['source:booking_completed'],
        authorUserId: String(req.supplier_id),
        visibilityScope: visibility,
        feedStatus: 'published',
        publishRequestStatus: 'approved',
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      return ok({ approved: true, feed_id: postId, publish_request_id: feedId });
    }

    await env.DB.prepare(
      `UPDATE feed_publish_requests SET status = 'rejected', approved_at = ? WHERE id = ?`
    ).bind(timestamp, feedId).run();
    await env.DB.prepare(
      `UPDATE bookings SET status = 'publish_rejected', updated_at = ? WHERE id = ?`
    ).bind(timestamp, req.booking_id).run();
    return ok({ approved: false, publish_request_id: feedId });
  }

  const feed = await env.DB.prepare(`SELECT * FROM feeds WHERE id = ? AND feed_type = 'booking_completed'`).bind(feedId).first<Record<string, unknown>>();
  if (!feed) return err('feed not found', 404);

  const booking = await env.DB.prepare(`SELECT * FROM bookings WHERE id = ?`).bind(feed.booking_id ?? null).first<Record<string, unknown>>();
  if (!booking) return err('booking not found', 404);
  if (String(booking.guardian_id) !== me.sub) return err('forbidden', 403);

  const approved = body.action ? body.action === 'approve' : !!body.approved;
  if (approved) {
    const visibility = (body.visibility_scope || 'public').trim();
    const albumVisibility = normalizeAlbumVisibilityFromFeed(visibility);
    const timestamp = now();
    await env.DB.prepare(
      `UPDATE feeds
       SET publish_request_status = 'approved',
           visibility_scope = ?,
           is_public = CASE WHEN ? = 'public' THEN true ELSE false END,
           status = 'published',
           updated_at = ?
       WHERE id = ?`
    ).bind(visibility, visibility, timestamp, feedId).run();

    await env.DB.prepare(
      `UPDATE booking_completion_contents
       SET publish_status = 'approved', responded_at = ?, responded_by_guardian_id = ?, updated_at = ?
       WHERE booking_id = ?`
    ).bind(timestamp, me.sub, timestamp, booking.id).run();

    await env.DB.prepare(`UPDATE bookings SET status = 'publish_approved', updated_at = ? WHERE id = ?`).bind(timestamp, booking.id).run();
    await env.DB.prepare(
      `UPDATE pet_album_media
       SET status = 'active', visibility_scope = ?, updated_at = ?
       WHERE source_type = 'booking_completed' AND source_id = ?`
    ).bind(albumVisibility, timestamp, feedId).run();
    return ok({ approved: true, feed_id: feedId });
  }

  const timestamp = now();
  await env.DB.prepare(
    `UPDATE feeds
     SET publish_request_status = 'rejected', is_public = false, status = 'hidden', updated_at = ?
     WHERE id = ?`
  ).bind(timestamp, feedId).run();

  await env.DB.prepare(
    `UPDATE booking_completion_contents
     SET publish_status = 'rejected', responded_at = ?, responded_by_guardian_id = ?, updated_at = ?
     WHERE booking_id = ?`
  ).bind(timestamp, me.sub, timestamp, booking.id).run();

  await env.DB.prepare(`UPDATE bookings SET status = 'publish_rejected', updated_at = ? WHERE id = ?`).bind(timestamp, booking.id).run();
  await env.DB.prepare(
    `UPDATE pet_album_media
     SET status = 'hidden', updated_at = ?
     WHERE source_type = 'booking_completed' AND source_id = ?`
  ).bind(timestamp, feedId).run();
  return ok({ approved: false, feed_id: feedId });
}

async function likeFeed(request: Request, env: Env, feedId: string): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  const me = auth as JwtPayload;

  const likeKey = await hasColumn(env, 'feed_likes', 'post_id') ? 'post_id' : 'feed_id';
  if (request.method === 'POST') {
    await env.DB.prepare(`INSERT INTO feed_likes (id, ${likeKey}, user_id, created_at) VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING`)
      .bind(newId(), feedId, me.sub, now()).run();
    return ok({ liked: true });
  }

  await env.DB.prepare(`DELETE FROM feed_likes WHERE ${likeKey} = ? AND user_id = ?`).bind(feedId, me.sub).run();
  return ok({ liked: false });
}

async function listComments(env: Env, feedId: string): Promise<Response> {
  const rows = await env.DB.prepare(
    `SELECT fc.*, u.email as author_email
     FROM feed_comments fc
     LEFT JOIN users u ON u.id = fc.author_user_id
     WHERE fc.post_id = ? AND fc.status = 'active'
     ORDER BY fc.created_at ASC`
  ).bind(feedId).all<Record<string, unknown>>();
  return ok({ comments: rows.results });
}

async function createComment(request: Request, env: Env, feedId: string): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  const me = auth as JwtPayload;

  let body: { content?: string; parent_comment_id?: string | null };
  try { body = await request.json() as { content?: string; parent_comment_id?: string | null }; }
  catch { return err('Invalid JSON'); }

  const content = (body.content || '').trim();
  if (!content) return err('content required');

  const id = newId();
  await env.DB.prepare(
    `INSERT INTO feed_comments (id, post_id, author_user_id, parent_comment_id, content, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'active', ?, ?)`
  ).bind(id, feedId, me.sub, body.parent_comment_id ?? null, content, now(), now()).run();

  return created({ id });
}

async function updateComment(request: Request, env: Env, feedId: string, commentId: string): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  const me = auth as JwtPayload;

  const row = await env.DB.prepare(`SELECT author_user_id FROM feed_comments WHERE id = ? AND post_id = ?`).bind(commentId, feedId).first<{ author_user_id: string }>();
  if (!row) return err('comment not found', 404);
  if (row.author_user_id !== me.sub) return err('forbidden', 403);

  let body: { content?: string };
  try { body = await request.json() as { content?: string }; } catch { return err('Invalid JSON'); }
  const content = (body.content || '').trim();
  if (!content) return err('content required');

  await env.DB.prepare(`UPDATE feed_comments SET content = ?, updated_at = ? WHERE id = ?`).bind(content, now(), commentId).run();
  return ok({ updated: true });
}

async function deleteComment(request: Request, env: Env, feedId: string, commentId: string): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  const me = auth as JwtPayload;

  const row = await env.DB.prepare(`SELECT author_user_id FROM feed_comments WHERE id = ? AND post_id = ?`).bind(commentId, feedId).first<{ author_user_id: string }>();
  if (!row) return err('comment not found', 404);
  if (row.author_user_id !== me.sub) return err('forbidden', 403);

  await env.DB.prepare(`UPDATE feed_comments SET status = 'deleted', updated_at = ? WHERE id = ?`).bind(now(), commentId).run();
  return ok({ deleted: true });
}

async function deleteFeed(request: Request, env: Env, feedId: string): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  const me = auth as JwtPayload;

  const timestamp = now();
  const hasFeedPosts = await hasTable(env, 'feed_posts');
  if (hasFeedPosts) {
    const post = await env.DB.prepare(
      `SELECT id, author_user_id FROM feed_posts WHERE id = ?`
    ).bind(feedId).first<{ id: string; author_user_id: string }>();
    if (!post) return err('feed not found', 404);
    if (post.author_user_id !== me.sub && me.role !== 'admin') return err('forbidden', 403);

    await env.DB.prepare(
      `UPDATE feed_posts SET status = 'deleted', updated_at = ? WHERE id = ?`
    ).bind(timestamp, feedId).run();

    if (await hasColumn(env, 'feed_media', 'status')) {
      await env.DB.prepare(
        `UPDATE feed_media SET status = 'deleted' WHERE post_id = ?`
      ).bind(feedId).run();
    }
  } else {
    const legacy = await env.DB.prepare(
      `SELECT id, author_user_id FROM feeds WHERE id = ?`
    ).bind(feedId).first<{ id: string; author_user_id: string }>();
    if (!legacy) return err('feed not found', 404);
    if (legacy.author_user_id !== me.sub && me.role !== 'admin') return err('forbidden', 403);

    await env.DB.prepare(
      `UPDATE feeds SET status = 'deleted', updated_at = ? WHERE id = ?`
    ).bind(timestamp, feedId).run();
  }

  const likeKey = await hasColumn(env, 'feed_likes', 'post_id') ? 'post_id' : 'feed_id';
  await env.DB.prepare(`DELETE FROM feed_likes WHERE ${likeKey} = ?`).bind(feedId).run();
  await env.DB.prepare(`UPDATE feed_comments SET status = 'deleted', updated_at = ? WHERE post_id = ?`).bind(timestamp, feedId).run();
  await env.DB.prepare(
    `UPDATE pet_album_media
     SET status = 'deleted', updated_at = ?
     WHERE source_id = ? AND source_type IN ('feed', 'profile', 'health_record', 'manual_upload', 'booking_completed')`
  ).bind(timestamp, feedId).run();

  return ok({ deleted: true, id: feedId });
}

export async function handleFeeds(request: Request, env: Env, url: URL): Promise<Response> {
  const sub = url.pathname.replace('/api/v1/feeds', '');

  if ((sub === '' || sub === '/') && request.method === 'GET') return listFeeds(request, env, url);
  if ((sub === '/filters' || sub === '/filters/') && request.method === 'GET') return feedFilters(request, env, url);
  if ((sub === '' || sub === '/') && request.method === 'POST') return createGuardianPost(request, env);
  if ((sub === '/from-completion' || sub === '/from-completion/') && request.method === 'POST') {
    return shareFromCompletion(request, env);
  }

  if ((sub === '/booking-completed/request' || sub === '/booking-completed/request/') && request.method === 'POST') {
    return requestBookingCompletedFeed(request, env);
  }

  const approveMatch = sub.match(/^\/([^/]+)\/approve$/);
  if (approveMatch && request.method === 'POST') {
    return approveBookingCompletedFeed(request, env, approveMatch[1]);
  }

  const likeMatch = sub.match(/^\/([^/]+)\/like$/);
  if (likeMatch && (request.method === 'POST' || request.method === 'DELETE')) {
    return likeFeed(request, env, likeMatch[1]);
  }

  const feedItemMatch = sub.match(/^\/([^/]+)$/);
  if (feedItemMatch && request.method === 'DELETE') {
    return deleteFeed(request, env, feedItemMatch[1]);
  }

  const commentsMatch = sub.match(/^\/([^/]+)\/comments$/);
  if (commentsMatch && request.method === 'GET') return listComments(env, commentsMatch[1]);
  if (commentsMatch && request.method === 'POST') return createComment(request, env, commentsMatch[1]);

  const commentItemMatch = sub.match(/^\/([^/]+)\/comments\/([^/]+)$/);
  if (commentItemMatch && request.method === 'PUT') return updateComment(request, env, commentItemMatch[1], commentItemMatch[2]);
  if (commentItemMatch && request.method === 'DELETE') return deleteComment(request, env, commentItemMatch[1], commentItemMatch[2]);

  return err('Not found', 404);
}
