// Pet Report aggregation endpoint
// GET /api/v1/pets/:petId/report?period=7d&lang=ko
import type { Env, JwtPayload } from '../../types';
import { ok, err } from '../../types';
import { assertPetOwner, rangeStartByKey } from './helpers';

type Row = Record<string, unknown>;

function periodDays(period: string): number {
  if (period === 'today') return 1;
  if (period === '7d') return 7;
  if (period === '30d') return 30;
  if (period === '3m') return 90;
  return 7;
}

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getPetReport(env: Env, payload: JwtPayload, petId: string, url: URL): Promise<Response> {
  const pet = await assertPetOwner(env, payload, petId);
  if (!pet) return err('Pet not found', 404, 'not_found');

  const period = (url.searchParams.get('period') || '7d').trim();
  const days = periodDays(period);
  const rangeStart = rangeStartByKey(period === 'today' ? '7d' : period) || new Date(Date.now() - 7 * 86400000).toISOString();
  const todayStart = dateStr(new Date());

  // Fetch pet basic info
  const petRow = await env.DB.prepare(
    `SELECT id, name, weight_kg AS current_weight FROM pets WHERE id = ?`
  ).bind(petId).first<Row>();

  const petTypeRow = await env.DB.prepare(
    `SELECT mi.code AS pet_type_code FROM pets p LEFT JOIN master_items mi ON mi.id = p.pet_type_id WHERE p.id = ?`
  ).bind(petId).first<{ pet_type_code: string | null }>();

  // ── Parallel aggregation ──────────────────────────────────────────
  const [
    todayCaloriesResult,
    targetCaloriesResult,
    weeklyCaloriesResult,
    nutrientRatioResult,
    top3FeedsResult,
    supplementsResult,
    exerciseWeekResult,
    exerciseCalendarResult,
    exerciseTypeResult,
    exerciseMonthlyResult,
    exerciseRecentResult,
    weightTrendResult,
    measurementTrendsResult,
    healthRecentResult,
    prevWeekCaloriesResult,
    prevExerciseCountResult,
    prevWeightResult,
    noExerciseDaysResult,
  ] = await Promise.all([

    // ── Feeding: today's calories ──
    env.DB.prepare(`
      SELECT COALESCE(SUM(
        CASE WHEN fl.is_mixed THEN (
          SELECT COALESCE(SUM(li.amount_g * COALESCE(fn2.calories_per_100g, 0) / 100.0), 0)
          FROM pet_feeding_log_items li
          LEFT JOIN pet_feeds pf2 ON pf2.id = li.pet_feed_id
          LEFT JOIN feed_nutrition fn2 ON fn2.feed_model_id = COALESCE(li.feed_model_id, pf2.feed_model_id)
          WHERE li.feeding_log_id = fl.id
        )
        ELSE COALESCE(fl.amount_g, 0) * COALESCE(fn.calories_per_100g, 0) / 100.0
        END
      ), 0) AS total
      FROM pet_feeding_logs fl
      LEFT JOIN pet_feeds pf ON pf.id = fl.pet_feed_id
      LEFT JOIN feed_nutrition fn ON fn.feed_model_id = COALESCE(fl.feed_model_id, pf.feed_model_id)
      WHERE fl.pet_id = ? AND fl.status = 'active'
        AND fl.created_at::date = ?::date
    `).bind(petId, todayStart).first<{ total: number }>(),

    // ── Feeding: target calories ──
    env.DB.prepare(`
      SELECT SUM(COALESCE(pf.daily_amount_g, 0) * COALESCE(fn.calories_per_100g, 0) / 100.0) AS target
      FROM pet_feeds pf
      LEFT JOIN feed_nutrition fn ON fn.feed_model_id = pf.feed_model_id
      WHERE pf.pet_id = ? AND pf.is_primary = true AND pf.status = 'active'
    `).bind(petId).first<{ target: number | null }>(),

    // ── Feeding: weekly calories by day ──
    env.DB.prepare(`
      SELECT fl.created_at::date AS date,
        SUM(
          CASE WHEN fl.is_mixed THEN (
            SELECT COALESCE(SUM(li.amount_g * COALESCE(fn2.calories_per_100g, 0) / 100.0), 0)
            FROM pet_feeding_log_items li
            LEFT JOIN pet_feeds pf2 ON pf2.id = li.pet_feed_id
            LEFT JOIN feed_nutrition fn2 ON fn2.feed_model_id = COALESCE(li.feed_model_id, pf2.feed_model_id)
            WHERE li.feeding_log_id = fl.id
          )
          ELSE COALESCE(fl.amount_g, 0) * COALESCE(fn.calories_per_100g, 0) / 100.0
          END
        ) AS calories
      FROM pet_feeding_logs fl
      LEFT JOIN pet_feeds pf ON pf.id = fl.pet_feed_id
      LEFT JOIN feed_nutrition fn ON fn.feed_model_id = COALESCE(fl.feed_model_id, pf.feed_model_id)
      WHERE fl.pet_id = ? AND fl.status = 'active' AND fl.created_at >= ?
      GROUP BY fl.created_at::date
      ORDER BY date
    `).bind(petId, rangeStart).all<Row>(),

    // ── Feeding: nutrient ratio (avg across period) ──
    env.DB.prepare(`
      SELECT
        AVG(fn.protein_pct) AS protein,
        AVG(fn.fat_pct) AS fat,
        AVG(fn.carbohydrate_pct) AS carbs,
        AVG(fn.fiber_pct) AS fiber
      FROM pet_feeding_logs fl
      LEFT JOIN pet_feeds pf ON pf.id = fl.pet_feed_id
      LEFT JOIN feed_nutrition fn ON fn.feed_model_id = COALESCE(fl.feed_model_id, pf.feed_model_id)
      WHERE fl.pet_id = ? AND fl.status = 'active' AND fl.created_at >= ?
        AND fn.feed_model_id IS NOT NULL
    `).bind(petId, rangeStart).first<Row>(),

    // ── Feeding: top 3 feeds ──
    env.DB.prepare(`
      SELECT fm.model_name AS name, COUNT(*) AS count
      FROM pet_feeding_logs fl
      LEFT JOIN pet_feeds pf ON pf.id = fl.pet_feed_id
      LEFT JOIN feed_models fm ON fm.id = COALESCE(fl.feed_model_id, pf.feed_model_id)
      WHERE fl.pet_id = ? AND fl.status = 'active' AND fl.created_at >= ?
        AND fm.id IS NOT NULL
      GROUP BY fm.id, fm.model_name
      ORDER BY count DESC
      LIMIT 3
    `).bind(petId, rangeStart).all<Row>(),

    // ── Feeding: supplements ──
    env.DB.prepare(`
      SELECT pf.id, fm.model_name AS name,
        CASE WHEN pf.disease_item_id IS NOT NULL THEN true ELSE false END AS is_prescribed,
        EXISTS(
          SELECT 1 FROM pet_feeding_logs fl
          WHERE fl.pet_feed_id = pf.id AND fl.status = 'active'
            AND fl.created_at::date = ?::date
        ) AS taken_today
      FROM pet_feeds pf
      JOIN feed_models fm ON fm.id = pf.feed_model_id
      WHERE pf.pet_id = ? AND pf.status = 'active'
        AND COALESCE(pf.category_type, 'feed') = 'supplement'
    `).bind(todayStart, petId).all<Row>(),

    // ── Exercise: week summary ──
    env.DB.prepare(`
      SELECT COUNT(*) AS count,
        COALESCE(SUM(duration_min), 0) AS total_min,
        CASE WHEN COUNT(*) > 0 THEN
          ROUND(SUM(CASE intensity WHEN 'low' THEN 1 WHEN 'medium' THEN 2 WHEN 'high' THEN 3 ELSE 2 END)::numeric / COUNT(*), 1)
        ELSE 0 END AS avg_intensity
      FROM pet_exercise_logs
      WHERE pet_id = ? AND exercise_date >= ?
    `).bind(petId, rangeStart).first<Row>(),

    // ── Exercise: weekly calendar (7 days) ──
    env.DB.prepare(`
      SELECT exercise_date::date AS date, true AS exercised
      FROM pet_exercise_logs
      WHERE pet_id = ? AND exercise_date >= (NOW() - INTERVAL '7 days')
      GROUP BY exercise_date::date
    `).bind(petId).all<Row>(),

    // ── Exercise: type ratio ──
    env.DB.prepare(`
      SELECT exercise_type AS type, COUNT(*) AS count
      FROM pet_exercise_logs
      WHERE pet_id = ? AND exercise_date >= ?
      GROUP BY exercise_type
      ORDER BY count DESC
    `).bind(petId, rangeStart).all<Row>(),

    // ── Exercise: monthly trend (last 6 months) ──
    env.DB.prepare(`
      SELECT TO_CHAR(exercise_date, 'YYYY-MM') AS month,
        COALESCE(SUM(duration_min), 0) AS total_min
      FROM pet_exercise_logs
      WHERE pet_id = ? AND exercise_date >= (NOW() - INTERVAL '6 months')
      GROUP BY month
      ORDER BY month
    `).bind(petId).all<Row>(),

    // ── Exercise: recent 5 ──
    env.DB.prepare(`
      SELECT exercise_date AS date, exercise_type AS type,
        duration_min, intensity
      FROM pet_exercise_logs
      WHERE pet_id = ?
      ORDER BY exercise_date DESC, created_at DESC
      LIMIT 5
    `).bind(petId).all<Row>(),

    // ── Health: weight trend ──
    env.DB.prepare(`
      SELECT measured_at::date AS date, weight_value AS weight
      FROM pet_weight_logs
      WHERE pet_id = ? AND measured_at >= ?
      ORDER BY measured_at
    `).bind(petId, rangeStart).all<Row>(),

    // ── Health: measurement trends grouped by metric ──
    env.DB.prepare(`
      SELECT measurement_item_id AS metric, measured_at::date AS date, value
      FROM pet_health_measurement_logs
      WHERE pet_id = ? AND measured_at >= ?
      ORDER BY measurement_item_id, measured_at
    `).bind(petId, rangeStart).all<Row>(),

    // ── Health: recent 5 records (weight + measurements combined) ──
    env.DB.prepare(`
      (SELECT measured_at::date AS date, 'weight' AS type, weight_value AS value
       FROM pet_weight_logs WHERE pet_id = ? ORDER BY measured_at DESC LIMIT 5)
      UNION ALL
      (SELECT measured_at::date AS date, 'measurement' AS type, value
       FROM pet_health_measurement_logs WHERE pet_id = ? ORDER BY measured_at DESC LIMIT 5)
      ORDER BY date DESC LIMIT 5
    `).bind(petId, petId).all<Row>(),

    // ── Weekly summary: prev week calories ──
    env.DB.prepare(`
      SELECT COALESCE(SUM(
        CASE WHEN fl.is_mixed THEN (
          SELECT COALESCE(SUM(li.amount_g * COALESCE(fn2.calories_per_100g, 0) / 100.0), 0)
          FROM pet_feeding_log_items li
          LEFT JOIN pet_feeds pf2 ON pf2.id = li.pet_feed_id
          LEFT JOIN feed_nutrition fn2 ON fn2.feed_model_id = COALESCE(li.feed_model_id, pf2.feed_model_id)
          WHERE li.feeding_log_id = fl.id
        )
        ELSE COALESCE(fl.amount_g, 0) * COALESCE(fn.calories_per_100g, 0) / 100.0
        END
      ), 0) / GREATEST(1, (SELECT COUNT(DISTINCT fl2.created_at::date) FROM pet_feeding_logs fl2
        WHERE fl2.pet_id = ? AND fl2.status = 'active'
          AND fl2.created_at >= (NOW() - INTERVAL '14 days') AND fl2.created_at < (NOW() - INTERVAL '7 days'))
      ) AS avg_cal
      FROM pet_feeding_logs fl
      LEFT JOIN pet_feeds pf ON pf.id = fl.pet_feed_id
      LEFT JOIN feed_nutrition fn ON fn.feed_model_id = COALESCE(fl.feed_model_id, pf.feed_model_id)
      WHERE fl.pet_id = ? AND fl.status = 'active'
        AND fl.created_at >= (NOW() - INTERVAL '14 days') AND fl.created_at < (NOW() - INTERVAL '7 days')
    `).bind(petId, petId).first<{ avg_cal: number }>(),

    // ── Weekly summary: prev week exercise count ──
    env.DB.prepare(`
      SELECT COUNT(*) AS count
      FROM pet_exercise_logs
      WHERE pet_id = ? AND exercise_date >= (NOW() - INTERVAL '14 days') AND exercise_date < (NOW() - INTERVAL '7 days')
    `).bind(petId).first<{ count: number }>(),

    // ── Weekly summary: prev weight ──
    env.DB.prepare(`
      SELECT weight_value AS weight
      FROM pet_weight_logs
      WHERE pet_id = ? AND measured_at < (NOW() - INTERVAL '7 days')
      ORDER BY measured_at DESC
      LIMIT 1
    `).bind(petId).first<{ weight: number | null }>(),

    // ── Alerts: days since last exercise ──
    env.DB.prepare(`
      SELECT (CURRENT_DATE - MAX(exercise_date::date)) AS gap_days
      FROM pet_exercise_logs
      WHERE pet_id = ?
    `).bind(petId).first<{ gap_days: number | null }>(),
  ]);

  // ── Build response ────────────────────────────────────────────────

  const currentWeight = petRow?.current_weight != null ? Number(petRow.current_weight) : null;
  const weightTrendRows = weightTrendResult.results;
  const firstWeight = weightTrendRows.length > 0 ? Number(weightTrendRows[0].weight) : null;
  const lastWeight = weightTrendRows.length > 0 ? Number(weightTrendRows[weightTrendRows.length - 1].weight) : null;
  const weightDelta = firstWeight != null && lastWeight != null ? Math.round((lastWeight - firstWeight) * 100) / 100 : null;

  // Build measurement_trends grouped by metric
  const metricsMap = new Map<string, { date: string; value: number }[]>();
  for (const row of measurementTrendsResult.results) {
    const metric = String(row.metric);
    if (!metricsMap.has(metric)) metricsMap.set(metric, []);
    metricsMap.get(metric)!.push({ date: String(row.date), value: Number(row.value) });
  }
  const measurementTrends = Array.from(metricsMap.entries()).map(([metric, data]) => ({ metric, data }));

  // Build exercise weekly calendar (7 days)
  const exercisedDates = new Set(exerciseCalendarResult.results.map(r => String(r.date)));
  const weeklyCalendar: { date: string; exercised: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const ds = dateStr(d);
    weeklyCalendar.push({ date: ds, exercised: exercisedDates.has(ds) });
  }

  // Nutrient ratio
  const nr = nutrientRatioResult || {};
  const nutrients = [
    { nutrient: 'protein', pct: Number((nr as Row).protein) || 0 },
    { nutrient: 'fat', pct: Number((nr as Row).fat) || 0 },
    { nutrient: 'carbs', pct: Number((nr as Row).carbs) || 0 },
    { nutrient: 'fiber', pct: Number((nr as Row).fiber) || 0 },
  ];
  const nutrientTotal = nutrients.reduce((s, n) => s + n.pct, 0);
  const nutrientRatio = nutrientTotal > 0
    ? nutrients.map(n => ({ nutrient: n.nutrient, pct: Math.round(n.pct / nutrientTotal * 100) }))
    : nutrients;

  // Weekly summary
  const weekExercise = exerciseWeekResult || { count: 0, total_min: 0 };
  const currentAvgCal = weeklyCaloriesResult.results.length > 0
    ? weeklyCaloriesResult.results.reduce((s, r) => s + Number(r.calories), 0) / weeklyCaloriesResult.results.length
    : 0;
  const prevAvgCal = Number(prevWeekCaloriesResult?.avg_cal) || 0;
  const calDelta = prevAvgCal > 0 ? Math.round((currentAvgCal - prevAvgCal) / prevAvgCal * 100) : 0;

  const currentExCount = Number(weekExercise.count) || 0;
  const prevExCount = Number(prevExerciseCountResult?.count) || 0;

  const prevWeight = prevWeightResult?.weight != null ? Number(prevWeightResult.weight) : null;
  const weightCardDelta = prevWeight != null && currentWeight != null
    ? Math.round((currentWeight - prevWeight) * 100) / 100
    : null;

  // Alerts
  const alerts: { type: string; message_key: string; severity: string }[] = [];
  const gapDays = noExerciseDaysResult?.gap_days;
  if (gapDays != null && gapDays >= 3) {
    alerts.push({ type: 'no_exercise', message_key: 'guardian.report.alert.no_exercise', severity: gapDays >= 7 ? 'critical' : 'warning' });
  }
  if (weightDelta != null && firstWeight != null && Math.abs(weightDelta / firstWeight) >= 0.10) {
    alerts.push({ type: 'weight_spike', message_key: 'guardian.report.alert.weight_spike', severity: 'warning' });
  }

  const report = {
    pet: {
      id: petId,
      name: petRow?.name || '',
      pet_type_code: petTypeRow?.pet_type_code || null,
      current_weight: currentWeight,
    },
    period,
    feeding: {
      today_calories: Math.round(Number(todayCaloriesResult?.total) || 0),
      target_calories: targetCaloriesResult?.target != null ? Math.round(Number(targetCaloriesResult.target)) : null,
      weekly_calories: weeklyCaloriesResult.results.map(r => ({
        date: String(r.date),
        calories: Math.round(Number(r.calories)),
      })),
      nutrient_ratio: nutrientRatio,
      top3_feeds: top3FeedsResult.results.map(r => ({
        name: String(r.name || ''),
        count: Number(r.count),
      })),
      supplements: supplementsResult.results.map(r => ({
        name: String(r.name || ''),
        is_prescribed: Boolean(r.is_prescribed),
        taken_today: Boolean(r.taken_today),
      })),
    },
    exercise: {
      week_summary: {
        count: Number(weekExercise.count) || 0,
        total_min: Number(weekExercise.total_min) || 0,
        avg_intensity: Number(weekExercise.avg_intensity) || 0,
      },
      weekly_calendar: weeklyCalendar,
      type_ratio: exerciseTypeResult.results.map(r => ({
        type: String(r.type),
        count: Number(r.count),
      })),
      monthly_trend: exerciseMonthlyResult.results.map(r => ({
        month: String(r.month),
        total_min: Number(r.total_min),
      })),
      recent: exerciseRecentResult.results.map(r => ({
        date: String(r.date),
        type: String(r.type),
        duration_min: Number(r.duration_min),
        intensity: String(r.intensity),
      })),
    },
    health: {
      weight_trend: weightTrendRows.map(r => ({
        date: String(r.date),
        weight: Number(r.weight),
      })),
      current_weight: currentWeight,
      weight_delta: weightDelta,
      measurement_trends: measurementTrends,
      recent_records: (healthRecentResult.results).map(r => ({
        date: String(r.date),
        type: String(r.type),
        value: Number(r.value),
      })),
    },
    weekly_summary: {
      feeding_card: {
        avg_calories: Math.round(currentAvgCal),
        prev_avg_calories: Math.round(prevAvgCal),
        delta_pct: calDelta,
      },
      exercise_card: {
        count: currentExCount,
        prev_count: prevExCount,
        delta: currentExCount - prevExCount,
      },
      health_card: {
        weight: currentWeight,
        prev_weight: prevWeight,
        delta: weightCardDelta,
      },
      alerts,
    },
  };

  return ok(report);
}
