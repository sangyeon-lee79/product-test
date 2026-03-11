// Admin Dashboard Stats — GET /api/v1/admin/dashboard/stats
import type { Env } from '../types';
import { ok, err } from '../types';
import { requireAuth, requireRole } from '../middleware/auth';

export async function handleDashboard(request: Request, env: Env, url: URL): Promise<Response> {
  // Admin only
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  const denied = requireRole(auth, ['admin']);
  if (denied) return denied;

  if (request.method !== 'GET') return err('Method Not Allowed', 405);

  const period = url.searchParams.get('period') || '7d';
  const petType = url.searchParams.get('pet_type') || 'all';
  const lang = url.searchParams.get('lang') || 'ko';

  // Build date filter
  const intervalMap: Record<string, string> = {
    today: '1 day',
    '7d': '7 days',
    '30d': '30 days',
    '3m': '3 months',
  };
  const interval = intervalMap[period];
  // If no matching interval (custom), don't filter by date
  const dateFilter = interval ? `AND created_at >= NOW() - INTERVAL '${interval}'` : '';
  const dateFilterMeasured = interval ? `AND measured_at >= NOW() - INTERVAL '${interval}'` : '';
  const dateFilterExercise = interval ? `AND exercise_date >= NOW() - INTERVAL '${interval}'` : '';

  // Pet type filter
  let petTypeJoin = '';
  let petTypeWhere = '';
  if (petType !== 'all') {
    petTypeJoin = `JOIN pets pt_filter ON pt_filter.id = t.pet_id`;
    petTypeWhere = `AND pt_filter.pet_type_id IN (
      SELECT mi.id FROM master_items mi
      JOIN master_categories mc ON mc.id = mi.category_id
      WHERE mc.code = 'pet_type' AND mi.code LIKE '${petType}%'
    )`;
  }

  // Language column for labels
  const langCol = ['ko','en','ja','zh_cn','zh_tw','es','fr','de','pt','vi','th','id_lang','ar'].includes(lang) ? lang : 'ko';

  const db = env.DB;

  try {
    const [
      feedingData,
      exerciseData,
      healthData,
      memberData,
    ] = await Promise.all([
      fetchFeedingStats(db, dateFilter, petType, langCol),
      fetchExerciseStats(db, dateFilterExercise, petType, langCol),
      fetchHealthStats(db, dateFilterMeasured, petType, langCol),
      fetchMemberStats(db, interval),
    ]);

    return ok({
      feeding: feedingData,
      exercise: exerciseData,
      health: healthData,
      members: memberData,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return err(`Dashboard stats error: ${msg}`, 500);
  }
}

// ─── Feeding Stats ──────────────────────────────────────────────────────
async function fetchFeedingStats(
  db: Env['DB'], dateFilter: string, petType: string, langCol: string,
) {
  const ptJoin = petType !== 'all'
    ? `JOIN pets pt_f ON pt_f.id = pf.pet_id`
    : '';
  const ptWhere = petType !== 'all'
    ? `AND pt_f.pet_type_id IN (SELECT mi.id FROM master_items mi JOIN master_categories mc ON mc.id = mi.category_id WHERE mc.code = 'pet_type' AND mi.code LIKE '${petType}%')`
    : '';

  const feedDateFilter = dateFilter.replace('created_at', 'pf.created_at');

  // Top 5 feeds by usage count
  const top5Feeds = db.prepare(`
    SELECT fm.model_name AS name, COUNT(*) AS count
    FROM pet_feeds pf
    JOIN feed_models fm ON fm.id = pf.feed_model_id
    ${ptJoin}
    WHERE pf.status = 'active' AND COALESCE(fm.category_type, 'feed') = 'feed'
    ${feedDateFilter} ${ptWhere}
    GROUP BY fm.model_name ORDER BY count DESC LIMIT 5
  `).all();

  // Manufacturer ratio
  const mfrRatio = db.prepare(`
    SELECT fmfr.name_${langCol} AS name, COUNT(*) AS value
    FROM pet_feeds pf
    JOIN feed_models fm ON fm.id = pf.feed_model_id
    JOIN feed_manufacturers fmfr ON fmfr.id = fm.manufacturer_id
    ${ptJoin}
    WHERE pf.status = 'active' AND COALESCE(fm.category_type, 'feed') = 'feed'
    ${feedDateFilter} ${ptWhere}
    GROUP BY fmfr.name_${langCol} ORDER BY value DESC LIMIT 10
  `).all();

  // Feed type distribution (dry/wet/etc via master_items)
  const typeDist = db.prepare(`
    SELECT COALESCE(i18n.${langCol}, mi.code) AS type, COUNT(*) AS count
    FROM pet_feeds pf
    JOIN feed_models fm ON fm.id = pf.feed_model_id
    JOIN master_items mi ON mi.id = fm.feed_type_item_id
    LEFT JOIN i18n_translations i18n ON i18n.key = 'master.' || mi.code
    ${ptJoin}
    WHERE pf.status = 'active' AND COALESCE(fm.category_type, 'feed') = 'feed'
    ${feedDateFilter} ${ptWhere}
    GROUP BY COALESCE(i18n.${langCol}, mi.code) ORDER BY count DESC
  `).all();

  // Supplement category frequency
  const suppCat = db.prepare(`
    SELECT COALESCE(i18n.${langCol}, mi.code) AS category, COUNT(*) AS count
    FROM pet_feeds pf
    JOIN feed_models fm ON fm.id = pf.feed_model_id
    JOIN master_items mi ON mi.id = fm.feed_type_item_id
    LEFT JOIN i18n_translations i18n ON i18n.key = 'master.' || mi.code
    ${ptJoin}
    WHERE pf.status = 'active' AND COALESCE(fm.category_type, 'supplement') = 'supplement'
    ${feedDateFilter} ${ptWhere}
    GROUP BY COALESCE(i18n.${langCol}, mi.code) ORDER BY count DESC
  `).all();

  // Prescribed ratio
  const prescribedQ = db.prepare(`
    SELECT
      COUNT(*) FILTER (WHERE pf.disease_item_id IS NOT NULL) AS prescribed,
      COUNT(*) AS total
    FROM pet_feeds pf
    JOIN feed_models fm ON fm.id = pf.feed_model_id
    ${ptJoin}
    WHERE pf.status = 'active' AND COALESCE(fm.category_type, 'feed') = 'supplement'
    ${feedDateFilter} ${ptWhere}
  `).all();

  // Average daily calories
  const caloriesQ = db.prepare(`
    SELECT AVG(fn.calories_per_100g) AS avg_cal
    FROM pet_feeds pf
    JOIN feed_models fm ON fm.id = pf.feed_model_id
    JOIN feed_nutrition fn ON fn.feed_model_id = fm.id
    ${ptJoin}
    WHERE pf.status = 'active' AND COALESCE(fm.category_type, 'feed') = 'feed'
    AND fn.calories_per_100g IS NOT NULL AND fn.calories_per_100g > 0
    ${feedDateFilter} ${ptWhere}
  `).all();

  const [top5R, mfrR, typeR, suppR, prescR, calR] = await Promise.all([
    top5Feeds, mfrRatio, typeDist, suppCat, prescribedQ, caloriesQ,
  ]);

  const prescRow = prescR.results?.[0] as Record<string, number> | undefined;
  const calRow = calR.results?.[0] as Record<string, number> | undefined;

  return {
    top5_feeds: (top5R.results || []) as { name: string; count: number }[],
    manufacturer_ratio: (mfrR.results || []) as { name: string; value: number }[],
    type_distribution: (typeR.results || []) as { type: string; count: number }[],
    supplement_category: (suppR.results || []) as { category: string; count: number }[],
    prescribed_ratio: {
      prescribed: Number(prescRow?.prescribed ?? 0),
      total: Number(prescRow?.total ?? 0),
    },
    avg_daily_calories: calRow?.avg_cal ? Math.round(Number(calRow.avg_cal)) : null,
  };
}

// ─── Exercise Stats ─────────────────────────────────────────────────────
async function fetchExerciseStats(
  db: Env['DB'], dateFilter: string, petType: string, langCol: string,
) {
  const ptJoin = petType !== 'all'
    ? `JOIN pets pt_f ON pt_f.id = t.pet_id`
    : '';
  const ptWhere = petType !== 'all'
    ? `AND pt_f.pet_type_id IN (SELECT mi.id FROM master_items mi JOIN master_categories mc ON mc.id = mi.category_id WHERE mc.code = 'pet_type' AND mi.code LIKE '${petType}%')`
    : '';
  const ef = dateFilter.replace('exercise_date', 't.exercise_date');

  const typeCount = db.prepare(`
    SELECT t.exercise_type AS type, COUNT(*) AS count
    FROM pet_exercise_logs t ${ptJoin}
    WHERE 1=1 ${ef} ${ptWhere}
    GROUP BY t.exercise_type ORDER BY count DESC
  `).all();

  const avgDuration = db.prepare(`
    SELECT t.exercise_type AS type, ROUND(AVG(t.duration_min)) AS avg_min
    FROM pet_exercise_logs t ${ptJoin}
    WHERE 1=1 ${ef} ${ptWhere}
    GROUP BY t.exercise_type ORDER BY avg_min DESC
  `).all();

  const intensityDist = db.prepare(`
    SELECT t.intensity, COUNT(*) AS count
    FROM pet_exercise_logs t ${ptJoin}
    WHERE 1=1 ${ef} ${ptWhere}
    GROUP BY t.intensity ORDER BY count DESC
  `).all();

  const locationDist = db.prepare(`
    SELECT COALESCE(t.location_type, 'outdoor') AS location, COUNT(*) AS count
    FROM pet_exercise_logs t ${ptJoin}
    WHERE 1=1 ${ef} ${ptWhere}
    GROUP BY COALESCE(t.location_type, 'outdoor') ORDER BY count DESC
  `).all();

  const monthlyTrend = db.prepare(`
    SELECT TO_CHAR(t.exercise_date, 'YYYY-MM') AS month, COUNT(*) AS count
    FROM pet_exercise_logs t ${ptJoin}
    WHERE 1=1 ${ptWhere}
    GROUP BY TO_CHAR(t.exercise_date, 'YYYY-MM')
    ORDER BY month DESC LIMIT 12
  `).all();

  const petTypeCompare = db.prepare(`
    SELECT COALESCE(i18n.${langCol}, mi.code) AS pet_type, t.exercise_type, COUNT(*) AS count
    FROM pet_exercise_logs t
    JOIN pets p ON p.id = t.pet_id
    JOIN master_items mi ON mi.id = p.pet_type_id
    LEFT JOIN i18n_translations i18n ON i18n.key = 'master.' || mi.code
    WHERE 1=1 ${ef}
    GROUP BY COALESCE(i18n.${langCol}, mi.code), t.exercise_type
    ORDER BY count DESC LIMIT 20
  `).all();

  const [tcR, adR, idR, ldR, mtR, ptcR] = await Promise.all([
    typeCount, avgDuration, intensityDist, locationDist, monthlyTrend, petTypeCompare,
  ]);

  return {
    type_count: (tcR.results || []) as { type: string; count: number }[],
    avg_duration: (adR.results || []) as { type: string; avg_min: number }[],
    intensity_dist: (idR.results || []) as { intensity: string; count: number }[],
    location_dist: (ldR.results || []) as { location: string; count: number }[],
    monthly_trend: ((mtR.results || []) as { month: string; count: number }[]).reverse(),
    pet_type_compare: (ptcR.results || []) as { pet_type: string; exercise_type: string; count: number }[],
  };
}

// ─── Health Stats ───────────────────────────────────────────────────────
async function fetchHealthStats(
  db: Env['DB'], dateFilter: string, petType: string, langCol: string,
) {
  const ptJoin = petType !== 'all'
    ? `JOIN pets pt_f ON pt_f.id = t.pet_id`
    : '';
  const ptWhere = petType !== 'all'
    ? `AND pt_f.pet_type_id IN (SELECT mi.id FROM master_items mi JOIN master_categories mc ON mc.id = mi.category_id WHERE mc.code = 'pet_type' AND mi.code LIKE '${petType}%')`
    : '';

  const wf = dateFilter.replace('measured_at', 't.measured_at');

  // Weight trend (monthly avg)
  const weightTrend = db.prepare(`
    SELECT TO_CHAR(t.measured_at, 'YYYY-MM') AS date, ROUND(AVG(t.weight_value)::numeric, 2) AS avg_weight
    FROM pet_weight_logs t ${ptJoin}
    WHERE 1=1 ${wf} ${ptWhere}
    GROUP BY TO_CHAR(t.measured_at, 'YYYY-MM')
    ORDER BY date DESC LIMIT 12
  `).all();

  // Weight by body size
  const weightBySize = db.prepare(`
    SELECT COALESCE(i18n.${langCol}, mi.code) AS size, ROUND(AVG(t.weight_value)::numeric, 2) AS avg_weight
    FROM pet_weight_logs t
    JOIN pets p ON p.id = t.pet_id
    LEFT JOIN master_items mi ON mi.id = p.body_size_id
    LEFT JOIN i18n_translations i18n ON i18n.key = 'master.' || mi.code
    WHERE mi.id IS NOT NULL ${wf}
    GROUP BY COALESCE(i18n.${langCol}, mi.code)
    ORDER BY avg_weight DESC
  `).all();

  // Top 5 health measurements
  const top5Measurements = db.prepare(`
    SELECT COALESCE(i18n.${langCol}, mi.code) AS name, COUNT(*) AS count
    FROM pet_health_measurement_logs t
    JOIN master_items mi ON mi.id = t.measurement_item_id
    LEFT JOIN i18n_translations i18n ON i18n.key = 'master.' || mi.code
    ${ptJoin}
    WHERE 1=1 ${wf} ${ptWhere}
    GROUP BY COALESCE(i18n.${langCol}, mi.code) ORDER BY count DESC LIMIT 5
  `).all();

  // Weight change distribution
  const weightChangeDist = db.prepare(`
    WITH ranked AS (
      SELECT t.pet_id, t.weight_value,
        LAG(t.weight_value) OVER (PARTITION BY t.pet_id ORDER BY t.measured_at) AS prev_weight
      FROM pet_weight_logs t ${ptJoin}
      WHERE 1=1 ${wf} ${ptWhere}
    )
    SELECT
      CASE
        WHEN weight_value > prev_weight THEN 'increase'
        WHEN weight_value < prev_weight THEN 'decrease'
        ELSE 'maintain'
      END AS direction,
      COUNT(*) AS count
    FROM ranked WHERE prev_weight IS NOT NULL
    GROUP BY direction
  `).all();

  const [wtR, wbsR, t5R, wcdR] = await Promise.all([
    weightTrend, weightBySize, top5Measurements, weightChangeDist,
  ]);

  return {
    weight_trend: ((wtR.results || []) as { date: string; avg_weight: number }[]).reverse(),
    weight_by_size: (wbsR.results || []) as { size: string; avg_weight: number }[],
    top5_measurements: (t5R.results || []) as { name: string; count: number }[],
    weight_change_dist: (wcdR.results || []) as { direction: string; count: number }[],
  };
}

// ─── Member Stats ───────────────────────────────────────────────────────
async function fetchMemberStats(db: Env['DB'], interval: string | undefined) {
  const dateFilter = interval ? `AND created_at >= NOW() - INTERVAL '${interval}'` : '';

  const totalUsers = db.prepare(`SELECT COUNT(*) AS cnt FROM users WHERE status = 'active'`).all();

  const byOauth = db.prepare(`
    SELECT COALESCE(oauth_provider, 'email') AS provider, COUNT(*) AS count
    FROM users WHERE status = 'active' ${dateFilter}
    GROUP BY COALESCE(oauth_provider, 'email') ORDER BY count DESC
  `).all();

  const signupTrend = db.prepare(`
    SELECT TO_CHAR(created_at, 'YYYY-MM') AS month, COUNT(*) AS count
    FROM users WHERE status = 'active'
    GROUP BY TO_CHAR(created_at, 'YYYY-MM')
    ORDER BY month DESC LIMIT 12
  `).all();

  // Active guardians: distinct users who recorded any data in last 30d
  const activeGuardians = db.prepare(`
    SELECT COUNT(DISTINCT user_id) AS cnt FROM (
      SELECT recorded_by_user_id AS user_id FROM pet_weight_logs WHERE measured_at >= NOW() - INTERVAL '30 days'
      UNION
      SELECT recorded_by_user_id AS user_id FROM pet_exercise_logs WHERE exercise_date >= NOW() - INTERVAL '30 days'
      UNION
      SELECT recorded_by_user_id AS user_id FROM pet_health_measurement_logs WHERE measured_at >= NOW() - INTERVAL '30 days'
    ) active
  `).all();

  // Feature usage: count records per feature
  const featureUsage = db.prepare(`
    SELECT feature, COUNT(*) AS count FROM (
      SELECT 'feeding' AS feature FROM pet_feeding_logs WHERE status = 'active' ${dateFilter}
      UNION ALL
      SELECT 'exercise' AS feature FROM pet_exercise_logs WHERE 1=1 ${dateFilter}
      UNION ALL
      SELECT 'health' AS feature FROM pet_weight_logs WHERE 1=1 ${dateFilter.replace('created_at', 'measured_at')}
    ) f
    GROUP BY feature ORDER BY count DESC
  `).all();

  // Pet type distribution
  const petTypeDist = db.prepare(`
    SELECT COALESCE(mi.code, 'unknown') AS type, COUNT(*) AS count
    FROM pets p
    LEFT JOIN master_items mi ON mi.id = p.pet_type_id
    WHERE p.status = 'active'
    GROUP BY COALESCE(mi.code, 'unknown') ORDER BY count DESC
  `).all();

  // Top 10 breeds
  const top10Breeds = db.prepare(`
    SELECT COALESCE(mi.name, mi.code, 'unknown') AS name, COUNT(*) AS count
    FROM pets p
    JOIN master_items mi ON mi.id = p.breed_id
    WHERE p.status = 'active'
    GROUP BY COALESCE(mi.name, mi.code, 'unknown') ORDER BY count DESC LIMIT 10
  `).all();

  const [tuR, boR, stR, agR, fuR, ptdR, tbR] = await Promise.all([
    totalUsers, byOauth, signupTrend, activeGuardians, featureUsage, petTypeDist, top10Breeds,
  ]);

  const tuRow = tuR.results?.[0] as Record<string, number> | undefined;
  const agRow = agR.results?.[0] as Record<string, number> | undefined;

  return {
    total_users: Number(tuRow?.cnt ?? 0),
    by_oauth: (boR.results || []) as { provider: string; count: number }[],
    signup_trend: ((stR.results || []) as { month: string; count: number }[]).reverse(),
    active_guardians_30d: Number(agRow?.cnt ?? 0),
    feature_usage: (fuR.results || []) as { feature: string; count: number }[],
    pet_type_dist: (ptdR.results || []) as { type: string; count: number }[],
    top10_breeds: (tbR.results || []) as { name: string; count: number }[],
  };
}
