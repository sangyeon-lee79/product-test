// Pet Report Tab — feeding/exercise/health/weekly summary charts
import { useEffect, useState } from 'react';
import { api, type Pet, type PetReport } from '../../lib/api';
import type { Lang } from '@petfolio/shared';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

const COLORS = ['#D97706', '#F59E0B', '#92400E', '#78716C', '#38A169'];
const PERIODS = ['today', '7d', '30d', '3m'] as const;
type Period = (typeof PERIODS)[number];

interface Props {
  selectedPet: Pet | null;
  lang: Lang;
  locale: string;
  t: (key: string, fallback?: string) => string;
  setError: (msg: string) => void;
}

export default function PetReportTab({ selectedPet, lang, locale, t, setError }: Props) {
  const [period, setPeriod] = useState<Period>('7d');
  const [report, setReport] = useState<PetReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedPet) return;
    let cancelled = false;
    setLoading(true);
    api.pets.report.get(selectedPet.id, { period, lang })
      .then((data) => { if (!cancelled) setReport(data); })
      .catch((e: unknown) => { if (!cancelled) setError(e instanceof Error ? e.message : t('guardian.report.err_load', 'Failed to load report')); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedPet?.id, period, lang]);

  if (!selectedPet) return null;

  const periodLabel = (p: Period) => {
    const map: Record<Period, string> = {
      today: t('guardian.report.period.today', 'Today'),
      '7d': t('guardian.report.period.7d', '7 Days'),
      '30d': t('guardian.report.period.30d', '30 Days'),
      '3m': t('guardian.report.period.3m', '3 Months'),
    };
    return map[p];
  };

  const fmtDelta = (val: number | null | undefined, unit = '') => {
    if (val == null) return '-';
    const sign = val > 0 ? '+' : '';
    return `${sign}${val}${unit}`;
  };

  const intensityLabel = (avg: number) => {
    if (avg < 1.5) return 'Low';
    if (avg > 2.5) return 'High';
    return 'Medium';
  };

  const r = report;

  return (
    <div className="gm-report-tab">
      {/* Period chips */}
      <div className="gm-period-chips" style={{ padding: '0 0 16px' }}>
        {PERIODS.map((p) => (
          <button key={p} className={`gm-period-chip${period === p ? ' active' : ''}`} onClick={() => setPeriod(p)}>
            {periodLabel(p)}
          </button>
        ))}
      </div>

      {loading && <div className="loading-center"><span className="spinner" /></div>}

      {!loading && r && (
        <>
          {/* Summary text */}
          <div className="gm-section" style={{ marginBottom: 20 }}>
            <div className="gm-section-body" style={{ textAlign: 'center', padding: '16px 12px', fontWeight: 600, fontSize: 15 }}>
              {t('guardian.report.summary_text', '{name}\'s {period} Report')
                .replace('{name}', r.pet.name)
                .replace('{period}', periodLabel(period))}
            </div>
          </div>

          {/* ── Feeding Section ── */}
          <div className="gm-section">
            <div className="gm-section-header">
              <h3 className="gm-section-title">{t('guardian.report.feeding.title', 'Feeding Report')}</h3>
            </div>
            <div className="gm-section-body">
              {/* Calorie gauge */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span>{t('guardian.report.feeding.calorie_gauge', "Today's Calories")}</span>
                  <span style={{ fontWeight: 600 }}>
                    {r.feeding.today_calories} {r.feeding.target_calories != null && `/ ${r.feeding.target_calories}`} {t('guardian.report.feeding.kcal', 'kcal')}
                  </span>
                </div>
                <div style={{ background: 'var(--border)', borderRadius: 6, height: 10, overflow: 'hidden' }}>
                  <div style={{
                    width: `${r.feeding.target_calories ? Math.min(100, r.feeding.today_calories / r.feeding.target_calories * 100) : 50}%`,
                    height: '100%',
                    background: r.feeding.target_calories && r.feeding.today_calories > r.feeding.target_calories ? '#EF4444' : 'var(--primary)',
                    borderRadius: 6,
                    transition: 'width 0.3s',
                  }} />
                </div>
                {r.feeding.target_calories != null && r.feeding.target_calories > 0 && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, textAlign: 'right' }}>
                    {t('guardian.report.feeding.compliance', 'Compliance')}: {Math.round(r.feeding.today_calories / r.feeding.target_calories * 100)}%
                  </div>
                )}
              </div>

              {/* Weekly calorie trend bar chart */}
              {r.feeding.weekly_calories.length > 0 ? (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{t('guardian.report.feeding.weekly_trend', 'Weekly Calorie Trend')}</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={r.feeding.weekly_calories}>
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v: string) => { const d = new Date(v + 'T00:00:00'); return `${d.getMonth() + 1}/${d.getDate()}`; }} />
                      <YAxis tick={{ fontSize: 10 }} width={40} />
                      <Tooltip />
                      <Bar dataKey="calories" fill="#D97706" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <EmptyState t={t} />}

              {/* Nutrient ratio pie */}
              {r.feeding.nutrient_ratio.some(n => n.pct > 0) && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{t('guardian.report.feeding.nutrient_ratio', 'Nutrient Ratio')}</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={r.feeding.nutrient_ratio.map(n => ({
                          name: t(`guardian.report.feeding.${n.nutrient}`, n.nutrient),
                          value: n.pct,
                        }))}
                        cx="50%" cy="50%" outerRadius={70} dataKey="value"
                        label={((props: { name?: string; percent?: number }) =>
                          `${props.name ?? ''} ${((props.percent ?? 0) * 100).toFixed(0)}%`
                        ) as unknown as boolean}
                      >
                        {r.feeding.nutrient_ratio.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Top 3 feeds */}
              {r.feeding.top3_feeds.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{t('guardian.report.feeding.top_feeds', 'Top 3 Feeds')}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {r.feeding.top3_feeds.map((f, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 8px', background: 'var(--surface)', borderRadius: 6 }}>
                        <span>{i + 1}. {f.name}</span>
                        <span style={{ fontWeight: 600 }}>{f.count}x</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Supplements */}
              {r.feeding.supplements.length > 0 && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{t('guardian.report.feeding.supplements', 'Supplements')}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {r.feeding.supplements.map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '4px 8px', background: 'var(--surface)', borderRadius: 6 }}>
                        <span style={{
                          width: 18, height: 18, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          background: s.taken_today ? '#38A169' : 'var(--border)', color: '#fff', fontSize: 11,
                        }}>{s.taken_today ? '\u2713' : ''}</span>
                        <span style={{ flex: 1 }}>{s.name}</span>
                        {s.is_prescribed && <span style={{ fontSize: 10, background: '#D97706', color: '#fff', padding: '1px 6px', borderRadius: 8 }}>{t('guardian.report.feeding.prescribed', 'Prescribed')}</span>}
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {s.taken_today ? t('guardian.report.taken', 'Taken') : t('guardian.report.missed', 'Missed')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Exercise Section ── */}
          <div className="gm-section">
            <div className="gm-section-header">
              <h3 className="gm-section-title">{t('guardian.report.exercise.title', 'Exercise Report')}</h3>
            </div>
            <div className="gm-section-body">
              {/* Week summary cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
                <SummaryCard label={t('guardian.report.exercise.count', 'Count')} value={`${r.exercise.week_summary.count}`} />
                <SummaryCard label={t('guardian.report.exercise.duration', 'Total Time')} value={`${r.exercise.week_summary.total_min}${t('guardian.report.exercise.min_unit', 'min')}`} />
                <SummaryCard label={t('guardian.report.exercise.avg_intensity', 'Avg Intensity')} value={intensityLabel(r.exercise.week_summary.avg_intensity)} />
              </div>

              {/* Weekly calendar dots */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{t('guardian.report.exercise.calendar', 'Exercise Calendar')}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, textAlign: 'center' }}>
                  {r.exercise.weekly_calendar.map((d) => (
                    <div key={d.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        {new Date(d.date + 'T00:00:00').toLocaleDateString(locale, { weekday: 'short' })}
                      </span>
                      <span style={{
                        width: 24, height: 24, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        background: d.exercised ? '#38A169' : 'var(--border)', color: d.exercised ? '#fff' : 'var(--text-muted)',
                        fontSize: 10, fontWeight: 600,
                      }}>
                        {d.date.slice(8)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exercise type ratio pie */}
              {r.exercise.type_ratio.length > 0 ? (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{t('guardian.report.exercise.type_ratio', 'Exercise Type Ratio')}</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={r.exercise.type_ratio.map(tr => ({ name: tr.type, value: tr.count }))}
                        cx="50%" cy="50%" outerRadius={70} dataKey="value"
                        label={((props: { name?: string; percent?: number }) =>
                          `${props.name ?? ''} ${((props.percent ?? 0) * 100).toFixed(0)}%`
                        ) as unknown as boolean}
                      >
                        {r.exercise.type_ratio.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : <EmptyState t={t} />}

              {/* Monthly trend line */}
              {r.exercise.monthly_trend.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{t('guardian.report.exercise.monthly_trend', 'Monthly Trend')}</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={r.exercise.monthly_trend}>
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} width={40} />
                      <Tooltip />
                      <Line type="monotone" dataKey="total_min" stroke="#D97706" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Recent 5 */}
              {r.exercise.recent.length > 0 && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{t('guardian.report.exercise.recent', 'Recent Records')}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {r.exercise.recent.map((ex, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 8px', background: 'var(--surface)', borderRadius: 6 }}>
                        <span>{new Date(ex.date).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}</span>
                        <span>{ex.type}</span>
                        <span>{ex.duration_min}{t('guardian.report.exercise.min_unit', 'min')}</span>
                        <span style={{ textTransform: 'capitalize', color: ex.intensity === 'high' ? '#EF4444' : ex.intensity === 'low' ? '#38A169' : 'var(--text)' }}>{ex.intensity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Health Section ── */}
          <div className="gm-section">
            <div className="gm-section-header">
              <h3 className="gm-section-title">{t('guardian.report.health.title', 'Health Report')}</h3>
            </div>
            <div className="gm-section-body">
              {/* Current weight card */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <SummaryCard
                  label={t('guardian.report.health.current_weight', 'Current Weight')}
                  value={r.health.current_weight != null ? `${r.health.current_weight}${t('guardian.report.health.kg_unit', 'kg')}` : '-'}
                />
                <SummaryCard
                  label={t('guardian.report.health.weight_delta', 'Weight Change')}
                  value={r.health.weight_delta != null ? fmtDelta(r.health.weight_delta, t('guardian.report.health.kg_unit', 'kg')) : '-'}
                  accent={r.health.weight_delta != null ? (r.health.weight_delta > 0 ? '#EF4444' : r.health.weight_delta < 0 ? '#38A169' : undefined) : undefined}
                />
              </div>

              {/* Weight trend line */}
              {r.health.weight_trend.length > 0 ? (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{t('guardian.report.health.weight_trend', 'Weight Trend')}</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={r.health.weight_trend}>
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v: string) => { const d = new Date(v + 'T00:00:00'); return `${d.getMonth() + 1}/${d.getDate()}`; }} />
                      <YAxis tick={{ fontSize: 10 }} width={40} domain={['auto', 'auto']} />
                      <Tooltip />
                      <Line type="monotone" dataKey="weight" stroke="#D97706" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : <EmptyState t={t} />}

              {/* Measurement trends */}
              {r.health.measurement_trends.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{t('guardian.report.health.measurement_trends', 'Measurement Trends')}</div>
                  {r.health.measurement_trends.map((mt) => (
                    <div key={mt.metric} style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{mt.metric}</div>
                      <ResponsiveContainer width="100%" height={120}>
                        <LineChart data={mt.data}>
                          <XAxis dataKey="date" tick={{ fontSize: 9 }} tickFormatter={(v: string) => { const d = new Date(v + 'T00:00:00'); return `${d.getMonth() + 1}/${d.getDate()}`; }} />
                          <YAxis tick={{ fontSize: 9 }} width={35} domain={['auto', 'auto']} />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={2} dot={{ r: 2 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ))}
                </div>
              )}

              {/* Recent health records */}
              {r.health.recent_records.length > 0 && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{t('guardian.report.health.recent', 'Recent Health Records')}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {r.health.recent_records.map((rec, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 8px', background: 'var(--surface)', borderRadius: 6 }}>
                        <span>{new Date(rec.date).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}</span>
                        <span style={{ textTransform: 'capitalize' }}>{rec.type}</span>
                        <span style={{ fontWeight: 600 }}>{rec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Weekly Summary Section ── */}
          <div className="gm-section">
            <div className="gm-section-header">
              <h3 className="gm-section-title">{t('guardian.report.weekly.title', 'Weekly Summary')}</h3>
            </div>
            <div className="gm-section-body">
              {/* 3 comparison cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
                <CompareCard
                  label={t('guardian.report.weekly.feed_card', 'Feeding')}
                  current={`${r.weekly_summary.feeding_card.avg_calories}`}
                  delta={fmtDelta(r.weekly_summary.feeding_card.delta_pct, '%')}
                  positive={r.weekly_summary.feeding_card.delta_pct <= 0}
                  unit={t('guardian.report.feeding.kcal', 'kcal')}
                  prevLabel={t('guardian.report.weekly.vs_prev', 'vs Previous Week')}
                />
                <CompareCard
                  label={t('guardian.report.weekly.exercise_card', 'Exercise')}
                  current={`${r.weekly_summary.exercise_card.count}`}
                  delta={fmtDelta(r.weekly_summary.exercise_card.delta)}
                  positive={r.weekly_summary.exercise_card.delta >= 0}
                  unit={t('guardian.report.exercise.count', 'Count')}
                  prevLabel={t('guardian.report.weekly.vs_prev', 'vs Previous Week')}
                />
                <CompareCard
                  label={t('guardian.report.weekly.health_card', 'Health')}
                  current={r.weekly_summary.health_card.weight != null ? `${r.weekly_summary.health_card.weight}` : '-'}
                  delta={fmtDelta(r.weekly_summary.health_card.delta, t('guardian.report.health.kg_unit', 'kg'))}
                  positive={r.weekly_summary.health_card.delta != null ? r.weekly_summary.health_card.delta <= 0 : true}
                  unit={t('guardian.report.health.kg_unit', 'kg')}
                  prevLabel={t('guardian.report.weekly.vs_prev', 'vs Previous Week')}
                />
              </div>

              {/* Alerts */}
              {r.weekly_summary.alerts.length > 0 && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{t('guardian.report.weekly.alerts', 'Care Alerts')}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {r.weekly_summary.alerts.map((a, i) => (
                      <div key={i} style={{
                        padding: '8px 12px', borderRadius: 8, fontSize: 13,
                        background: a.severity === 'critical' ? '#FEE2E2' : '#FEF3C7',
                        color: a.severity === 'critical' ? '#991B1B' : '#92400E',
                        border: `1px solid ${a.severity === 'critical' ? '#FECACA' : '#FDE68A'}`,
                      }}>
                        {a.severity === 'critical' ? '\u26A0\uFE0F ' : '\u2139\uFE0F '}
                        {t(a.message_key, a.type)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {!loading && !r && <EmptyState t={t} />}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function EmptyState({ t }: { t: (key: string, fallback?: string) => string }) {
  return (
    <div className="gm-empty" style={{ padding: '24px 0' }}>
      <div className="gm-empty-icon" style={{ fontSize: 32 }}>📊</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t('guardian.report.no_data', 'No data recorded for this period')}</div>
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{
      flex: 1, padding: '10px 12px', background: 'var(--surface)', borderRadius: 8,
      textAlign: 'center', border: '1px solid var(--border)',
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: accent || 'var(--text)' }}>{value}</div>
    </div>
  );
}

function CompareCard({ label, current, delta, positive, unit, prevLabel }: {
  label: string; current: string; delta: string; positive: boolean; unit: string; prevLabel: string;
}) {
  return (
    <div style={{
      padding: '10px 8px', background: 'var(--surface)', borderRadius: 8,
      textAlign: 'center', border: '1px solid var(--border)',
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700 }}>{current}<span style={{ fontSize: 10, fontWeight: 400, marginLeft: 2 }}>{unit}</span></div>
      <div style={{ fontSize: 10, color: positive ? '#38A169' : '#EF4444', marginTop: 2 }}>
        {delta} <span style={{ color: 'var(--text-muted)' }}>{prevLabel}</span>
      </div>
    </div>
  );
}
