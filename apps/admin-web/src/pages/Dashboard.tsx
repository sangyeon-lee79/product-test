import { useEffect, useState, type ReactNode } from 'react';
import { api } from '../lib/api';
import type { DashboardStats, StoreStats } from '../types/api';
import { useT, useI18n } from '../lib/i18n';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
// Pie label render props — use explicit type to avoid recharts type mismatch


const COLORS = ['#D97706', '#F59E0B', '#92400E', '#78716C', '#38A169', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
const PERIODS = ['today', '7d', '30d', '3m'] as const;
const PET_TYPES = ['all', 'dog', 'cat', 'other'] as const;

export default function Dashboard() {
  const t = useT();
  const { lang } = useI18n();
  const [period, setPeriod] = useState<string>('7d');
  const [petType, setPetType] = useState<string>('all');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [health, setHealth] = useState<{ status: string; environment: string; services: Record<string, string> } | null>(null);
  const [storeStats, setStoreStats] = useState<StoreStats | null>(null);

  useEffect(() => {
    api.health().then(setHealth).catch(() => {});
    api.stores.admin.stats().then(setStoreStats).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    api.dashboard.stats({ period, pet_type: petType, lang })
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [period, petType, lang]);

  const healthCards = [
    { label: t('admin.dashboard.api_status', 'API'), value: health?.status === 'ok' ? 'OK' : health ? 'ERR' : '...', color: health?.status === 'ok' ? '#38a169' : '#e53e3e' },
    { label: t('admin.dashboard.env', 'ENV'), value: health?.environment || '-', color: '#1a73e8' },
    { label: t('admin.dashboard.db', 'DB'), value: health?.services?.db === 'connected' ? 'OK' : '...', color: health?.services?.db === 'connected' ? '#38a169' : '#d69e2e' },
  ];

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Petfolio · {t('admin.dashboard.title', '분석 대시보드')}</div>
      </div>
      <div className="content">
        {/* Filter bar */}
        <div className="form-row col2 mb-4">
          <label className="form-label">
            {t('admin.dashboard.filter.period', '기간')}
            <select className="form-select" value={period} onChange={e => setPeriod(e.target.value)}>
              {PERIODS.map(p => (
                <option key={p} value={p}>{t(`admin.dashboard.filter.${p}`, p)}</option>
              ))}
            </select>
          </label>
          <label className="form-label">
            {t('admin.dashboard.filter.pet_type', '펫 종류')}
            <select className="form-select" value={petType} onChange={e => setPetType(e.target.value)}>
              {PET_TYPES.map(pt => (
                <option key={pt} value={pt}>{t(`admin.dashboard.filter.${pt}`, pt)}</option>
              ))}
            </select>
          </label>
        </div>

        {/* System status */}
        <div className="form-row col3 mb-4">
          {healthCards.map(s => (
            <div className="card" key={s.label}>
              <div className="card-body" style={{ textAlign: 'center', padding: '16px' }}>
                <div style={{ fontSize: 11, color: '#718096', textTransform: 'uppercase', letterSpacing: '.5px' }}>{s.label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {error && <div className="alert alert-error mb-4">{error}</div>}
        {loading && <div style={{ textAlign: 'center', padding: 32, color: '#718096' }}>Loading...</div>}

        {stats && !loading && (
          <>
            {/* Section 1: Feeding */}
            <SectionCard title={t('admin.dashboard.feeding.title', '급여 통계')}>
              <div className="form-row col2 mb-4">
                <ChartCard title={t('admin.dashboard.feeding.top5_feed', '사료 TOP 5')}>
                  {stats.feeding.top5_feeds.length > 0
                    ? <RBar data={stats.feeding.top5_feeds} xKey="name" yKey="count" />
                    : <NoData t={t} />}
                </ChartCard>
                <ChartCard title={t('admin.dashboard.feeding.manufacturer_ratio', '제조사별 사용 비율')}>
                  {stats.feeding.manufacturer_ratio.length > 0
                    ? <RPie data={stats.feeding.manufacturer_ratio} nameKey="name" valueKey="value" />
                    : <NoData t={t} />}
                </ChartCard>
              </div>
              <div className="form-row col3">
                <ChartCard title={t('admin.dashboard.feeding.type_distribution', '사료유형별 분포')}>
                  {stats.feeding.type_distribution.length > 0
                    ? <RPie data={stats.feeding.type_distribution} nameKey="type" valueKey="count" />
                    : <NoData t={t} />}
                </ChartCard>
                <ChartCard title={t('admin.dashboard.feeding.supplement_category', '영양제 카테고리별 빈도')}>
                  {stats.feeding.supplement_category.length > 0
                    ? <RBar data={stats.feeding.supplement_category} xKey="category" yKey="count" />
                    : <NoData t={t} />}
                </ChartCard>
                <ChartCard title={t('admin.dashboard.feeding.daily_calories', '일평균 칼로리')}>
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#D97706' }}>
                      {stats.feeding.avg_daily_calories ?? '-'}
                    </div>
                    <div style={{ fontSize: 12, color: '#718096', marginTop: 4 }}>{t('admin.dashboard.kcal', 'kcal')}</div>
                    <div style={{ fontSize: 12, color: '#718096', marginTop: 8 }}>
                      {t('admin.dashboard.feeding.prescribed_ratio', '처방 영양제 비율')}: {stats.feeding.prescribed_ratio.total > 0
                        ? `${Math.round(stats.feeding.prescribed_ratio.prescribed / stats.feeding.prescribed_ratio.total * 100)}%`
                        : '-'}
                    </div>
                  </div>
                </ChartCard>
              </div>
            </SectionCard>

            {/* Section 2: Exercise */}
            <SectionCard title={t('admin.dashboard.exercise.title', '운동 통계')}>
              <div className="form-row col2 mb-4">
                <ChartCard title={t('admin.dashboard.exercise.type_count', '운동 종류별 기록 건수')}>
                  {stats.exercise.type_count.length > 0
                    ? <RBar data={stats.exercise.type_count} xKey="type" yKey="count" />
                    : <NoData t={t} />}
                </ChartCard>
                <ChartCard title={t('admin.dashboard.exercise.avg_duration', '평균 운동 시간')}>
                  {stats.exercise.avg_duration.length > 0
                    ? <RBar data={stats.exercise.avg_duration} xKey="type" yKey="avg_min" color="#38A169" />
                    : <NoData t={t} />}
                </ChartCard>
              </div>
              <div className="form-row col2 mb-4">
                <ChartCard title={t('admin.dashboard.exercise.intensity_dist', '강도 분포')}>
                  {stats.exercise.intensity_dist.length > 0
                    ? <RPie data={stats.exercise.intensity_dist} nameKey="intensity" valueKey="count" />
                    : <NoData t={t} />}
                </ChartCard>
                <ChartCard title={t('admin.dashboard.exercise.location_dist', '장소 분포')}>
                  {stats.exercise.location_dist.length > 0
                    ? <RPie data={stats.exercise.location_dist} nameKey="location" valueKey="count" />
                    : <NoData t={t} />}
                </ChartCard>
              </div>
              <ChartCard title={t('admin.dashboard.exercise.monthly_trend', '월별 운동 기록 추이')}>
                {stats.exercise.monthly_trend.length > 0
                  ? <RLine data={stats.exercise.monthly_trend} xKey="month" yKey="count" />
                  : <NoData t={t} />}
              </ChartCard>
              <div style={{ marginTop: 12 }}>
                <ChartCard title={t('admin.dashboard.exercise.pet_type_compare', '펫 종별 운동 패턴 비교')}>
                  {stats.exercise.pet_type_compare.length > 0
                    ? <RBar data={stats.exercise.pet_type_compare.map(d => ({
                        name: `${d.pet_type} - ${d.exercise_type}`,
                        count: d.count,
                      }))} xKey="name" yKey="count" color="#8B5CF6" />
                    : <NoData t={t} />}
                </ChartCard>
              </div>
            </SectionCard>

            {/* Section 3: Health */}
            <SectionCard title={t('admin.dashboard.health.title', '건강 수치')}>
              <ChartCard title={t('admin.dashboard.health.weight_trend', '전체 평균 체중 추이')}>
                {stats.health.weight_trend.length > 0
                  ? <RLine data={stats.health.weight_trend} xKey="date" yKey="avg_weight" color="#D97706" />
                  : <NoData t={t} />}
              </ChartCard>
              <div className="form-row col2" style={{ marginTop: 12 }}>
                <ChartCard title={t('admin.dashboard.health.weight_by_size', '펫 종/사이즈별 평균 체중')}>
                  {stats.health.weight_by_size.length > 0
                    ? <RBar data={stats.health.weight_by_size} xKey="size" yKey="avg_weight" color="#92400E" />
                    : <NoData t={t} />}
                </ChartCard>
                <ChartCard title={t('admin.dashboard.health.top5_measurements', '건강 수치 기록 빈도 TOP 5')}>
                  {stats.health.top5_measurements.length > 0
                    ? <RBar data={stats.health.top5_measurements} xKey="name" yKey="count" color="#38A169" />
                    : <NoData t={t} />}
                </ChartCard>
              </div>
              <div style={{ marginTop: 12 }}>
                <ChartCard title={t('admin.dashboard.health.weight_change_dist', '체중 변화 분포')}>
                  {stats.health.weight_change_dist.length > 0
                    ? <RPie data={stats.health.weight_change_dist.map(d => ({
                        name: d.direction === 'increase' ? t('admin.dashboard.weight_increase', '증가')
                            : d.direction === 'decrease' ? t('admin.dashboard.weight_decrease', '감소')
                            : t('admin.dashboard.weight_maintain', '유지'),
                        value: d.count,
                      }))} nameKey="name" valueKey="value" />
                    : <NoData t={t} />}
                </ChartCard>
              </div>
            </SectionCard>

            {/* Section 4: Members */}
            <SectionCard title={t('admin.dashboard.member.title', '회원 활동')}>
              <div className="form-row col3 mb-4">
                <ChartCard title={t('admin.dashboard.member.total_users', '전체 회원수')}>
                  <KpiValue value={stats.members.total_users} unit={t('admin.dashboard.people', '명')} />
                </ChartCard>
                <ChartCard title={t('admin.dashboard.member.active_guardians', '활성 가디언 수')}>
                  <KpiValue value={stats.members.active_guardians_30d} unit={t('admin.dashboard.people', '명')} color="#38A169" />
                </ChartCard>
                <ChartCard title={t('admin.dashboard.member.oauth_dist', '가입방식별 비율')}>
                  {stats.members.by_oauth.length > 0
                    ? <RPie data={stats.members.by_oauth} nameKey="provider" valueKey="count" />
                    : <NoData t={t} />}
                </ChartCard>
              </div>
              <ChartCard title={t('admin.dashboard.member.signup_trend', '신규 가입 추이')}>
                {stats.members.signup_trend.length > 0
                  ? <RLine data={stats.members.signup_trend} xKey="month" yKey="count" color="#3B82F6" />
                  : <NoData t={t} />}
              </ChartCard>
              <div className="form-row col2" style={{ marginTop: 12 }}>
                <ChartCard title={t('admin.dashboard.member.feature_usage', '기능별 사용률')}>
                  {stats.members.feature_usage.length > 0
                    ? <RBar data={stats.members.feature_usage.map(d => ({
                        name: d.feature === 'feeding' ? t('admin.dashboard.feeding_feature', '급여')
                            : d.feature === 'exercise' ? t('admin.dashboard.exercise_feature', '운동')
                            : t('admin.dashboard.health_feature', '건강'),
                        count: d.count,
                      }))} xKey="name" yKey="count" color="#F59E0B" />
                    : <NoData t={t} />}
                </ChartCard>
                <ChartCard title={t('admin.dashboard.member.pet_type_dist', '반려동물 종별 분포')}>
                  {stats.members.pet_type_dist.length > 0
                    ? <RPie data={stats.members.pet_type_dist} nameKey="type" valueKey="count" />
                    : <NoData t={t} />}
                </ChartCard>
              </div>
              <div style={{ marginTop: 12 }}>
                <ChartCard title={t('admin.dashboard.member.top10_breeds', '품종 TOP 10')}>
                  {stats.members.top10_breeds.length > 0
                    ? <RBar data={stats.members.top10_breeds} xKey="name" yKey="count" color="#D97706" />
                    : <NoData t={t} />}
                </ChartCard>
              </div>
            </SectionCard>

            {/* Section 5: Store Stats */}
            {storeStats && (
              <SectionCard title={t('admin.dashboard.stores.title', '매장 통계')}>
                <div className="form-row col3">
                  <ChartCard title={t('admin.dashboard.stores.total', '전체 매장')}>
                    <KpiValue value={storeStats.total} unit={t('admin.dashboard.stores_unit', '개')} />
                  </ChartCard>
                  <ChartCard title={t('admin.dashboard.stores.active', '활성 매장')}>
                    <KpiValue value={storeStats.active} unit={t('admin.dashboard.stores_unit', '개')} color="#38A169" />
                  </ChartCard>
                  <ChartCard title={t('admin.dashboard.stores.new', '신규 매장 (30일)')}>
                    <KpiValue value={storeStats.new_30d} unit={t('admin.dashboard.stores_unit', '개')} color="#3B82F6" />
                  </ChartCard>
                </div>
              </SectionCard>
            )}
          </>
        )}
      </div>
    </>
  );
}

// ─── Reusable Chart Wrappers ──────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="card mb-4">
      <div className="card-header"><div className="card-title">{title}</div></div>
      <div className="card-body">{children}</div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)', padding: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

function NoData({ t }: { t: (k: string, fb?: string) => string }) {
  return (
    <div style={{ textAlign: 'center', padding: '24px 0', color: '#a0aec0', fontSize: 13 }}>
      {t('admin.dashboard.no_data', '데이터 없음')}
    </div>
  );
}

function KpiValue({ value, unit, color = '#D97706' }: { value: number; unit: string; color?: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value.toLocaleString()}</div>
      <div style={{ fontSize: 12, color: '#718096', marginTop: 4 }}>{unit}</div>
    </div>
  );
}

// ─── Recharts Wrappers ────────────────────────────────────────────────

function RBar({ data, xKey, yKey, color = '#D97706' }: { data: Record<string, unknown>[]; xKey: string; yKey: string; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={50} />
        <YAxis tick={{ fontSize: 11 }} width={40} />
        <Tooltip contentStyle={{ fontSize: 12 }} />
        <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function RPie({ data, nameKey, valueKey }: { data: Record<string, unknown>[]; nameKey: string; valueKey: string }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} dataKey={valueKey} nameKey={nameKey} cx="50%" cy="50%"
          outerRadius={70} innerRadius={35} paddingAngle={2}
          label={((props: { name?: string; percent?: number }) => `${props.name ?? ''} ${((props.percent ?? 0) * 100).toFixed(0)}%`) as unknown as boolean}
          labelLine={false} style={{ fontSize: 10 }}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function RLine({ data, xKey, yKey, color = '#D97706' }: { data: Record<string, unknown>[]; xKey: string; yKey: string; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} width={40} />
        <Tooltip contentStyle={{ fontSize: 12 }} />
        <Legend />
        <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
