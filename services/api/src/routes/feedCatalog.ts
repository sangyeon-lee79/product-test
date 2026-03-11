import type { Env } from '../types';
import { createCatalogHandler } from './catalogFactory';

async function feedStatsExtras(env: Env, _cfBare: string) {
  const [userRegRow, usageRow] = await Promise.all([
    env.DB.prepare(`SELECT COUNT(*) AS cnt FROM pet_feeds WHERE COALESCE(category_type, 'feed') = 'feed' AND status = 'active'`).first<{ cnt: number }>(),
    env.DB.prepare(
      `SELECT COUNT(*) AS cnt FROM pet_feeding_logs pfl
       JOIN pet_feeds pf ON pf.id = pfl.pet_feed_id
       WHERE COALESCE(pf.category_type, 'feed') = 'feed'
         AND pfl.created_at >= NOW() - INTERVAL '30 days'`
    ).first<{ cnt: number }>(),
  ]);
  return {
    user_registered: userRegRow?.cnt || 0,
    actual_usage: usageRow?.cnt || 0,
  };
}

export const handleFeedCatalog = createCatalogHandler({
  categoryType: 'feed',
  masterCategoryCode: 'diet_feed_type',
  urlPrefix: '/api/v1/feed-catalog',
  adminUrlPrefix: '/api/v1/admin/feed-catalog',
  i18nPage: 'feed',
  keyPrefix: { mfr: 'mfr_', brand: 'brand_', model: 'model_' },
  hasNutrition: true,
  setCategoryTypeOnInsert: false,
  statsExtras: feedStatsExtras,
});
