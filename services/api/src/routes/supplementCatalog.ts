import type { Env } from '../types';
import { createCatalogHandler } from './catalogFactory';

async function supplementStatsExtras(env: Env, _cfBare: string) {
  const [userRegRow, usageRow, prescribedRow] = await Promise.all([
    env.DB.prepare(`SELECT COUNT(*) AS cnt FROM pet_feeds WHERE category_type = 'supplement' AND status = 'active'`).first<{ cnt: number }>(),
    env.DB.prepare(
      `SELECT COUNT(*) AS cnt FROM pet_feeding_logs pfl
       JOIN pet_feeds pf ON pf.id = pfl.pet_feed_id
       WHERE pf.category_type = 'supplement'
         AND pfl.created_at >= NOW() - INTERVAL '30 days'`
    ).first<{ cnt: number }>(),
    env.DB.prepare(`SELECT COUNT(*) AS cnt FROM pet_feeds WHERE category_type = 'supplement' AND disease_item_id IS NOT NULL AND status = 'active'`).first<{ cnt: number }>(),
  ]);
  return {
    user_registered: userRegRow?.cnt || 0,
    actual_usage: usageRow?.cnt || 0,
    prescribed: prescribedRow?.cnt || 0,
  };
}

export const handleSupplementCatalog = createCatalogHandler({
  categoryType: 'supplement',
  masterCategoryCode: 'supplement_type',
  urlPrefix: '/api/v1/supplement-catalog',
  adminUrlPrefix: '/api/v1/admin/supplement-catalog',
  i18nPage: 'supplement',
  keyPrefix: { mfr: 'suppl_mfr_', brand: 'suppl_brand_', model: 'suppl_model_' },
  hasNutrition: true,
  setCategoryTypeOnInsert: true,
  statsExtras: supplementStatsExtras,
});
