import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { DashboardStats, StoreStats } from '../types/api';
import { useT, useI18n } from '../lib/i18n';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

const COLORS = ['#F5823A', '#4A7CF7', '#4CAF7D', '#9B5DE5', '#FF4D4D', '#F59E0B', '#14B8A6', '#EC4899', '#6366F1', '#78716C'];
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
  const [bannerDismissed, setBannerDismissed] = useState(false);

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

  const totalUsers = stats?.members?.total_users ?? 0;
  const activeGuardians = stats?.members?.active_guardians_30d ?? 0;
  const totalStores = storeStats?.total ?? 0;
  const newStores = storeStats?.new_30d ?? 0;
  const apiOk = health?.status === 'ok';
  const dbOk = health?.services?.db === 'connected';

  return (
    <div className="content">
      {/* Warning banner */}
      {!bannerDismissed && (
        <div className="ad-banner">
          <span className="ad-banner-icon">⚠️</span>
          <span className="ad-banner-text">
            {t('admin.dashboard.system_notice', 'System running normally. Check the dashboard for latest metrics.')}
          </span>
          <button className="ad-banner-close" onClick={() => setBannerDismissed(true)}>&times;</button>
        </div>
      )}

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <select className="form-select" style={{ width: 'auto', minWidth: 100 }} value={period} onChange={e => setPeriod(e.target.value)}>
          {PERIODS.map(p => <option key={p} value={p}>{t(`admin.dashboard.filter.${p}`, p)}</option>)}
        </select>
        <select className="form-select" style={{ width: 'auto', minWidth: 100 }} value={petType} onChange={e => setPetType(e.target.value)}>
          {PET_TYPES.map(pt => <option key={pt} value={pt}>{t(`admin.dashboard.filter.${pt}`, pt)}</option>)}
        </select>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* ── 4 Stat Cards ── */}
      <div className="ad-stats-row">
        <StatCard
          icon="👥" iconColor="amber"
          label={t('admin.dashboard.member.total_users', 'Total Users')}
          value={totalUsers}
          change={activeGuardians > 0 ? `${activeGuardians} ${t('admin.dashboard.member.active_guardians', 'active')}` : undefined}
          changeType="up"
          color="amber"
        />
        <StatCard
          icon="🐾" iconColor="green"
          label={t('admin.dashboard.registered_pets', 'Registered Pets')}
          value={stats?.members?.pet_type_dist?.reduce((s, d) => s + (d.count as number), 0) ?? 0}
          color="green"
        />
        <StatCard
          icon="🏪" iconColor="blue"
          label={t('admin.dashboard.stores.total', 'Provider Stores')}
          value={totalStores}
          change={newStores > 0 ? `+${newStores} ${t('admin.dashboard.stores.new_short', 'new')}` : undefined}
          changeType="up"
          color="blue"
        />
        <StatCard
          icon="📊" iconColor="purple"
          label={t('admin.dashboard.system_status', 'System Status')}
          value={apiOk && dbOk ? 'OK' : '...'}
          color="purple"
        />
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 40, color: 'var(--mid)' }}>{t('common.loading', 'Loading...')}</div>}

      {stats && !loading && (
        <>
          {/* ── Row 1: Charts 2-col ── */}
          <div className="ad-grid-2">
            {/* Signup trend */}
            <div className="card">
              <div className="card-header"><div className="card-title">{t('admin.dashboard.member.signup_trend', 'New Signups')}</div></div>
              <div className="card-body">
                {stats.members.signup_trend.length > 0
                  ? <RBar data={stats.members.signup_trend} xKey="month" yKey="count" color="#F5823A" />
                  : <NoData t={t} />}
              </div>
            </div>

            {/* User composition */}
            <div className="card">
              <div className="card-header"><div className="card-title">{t('admin.dashboard.member.oauth_dist', 'User Composition')}</div></div>
              <div className="card-body">
                {stats.members.by_oauth.length > 0
                  ? <RPie data={stats.members.by_oauth} nameKey="provider" valueKey="count" />
                  : <NoData t={t} />}
                {/* Conversion progress bars */}
                <div style={{ marginTop: 16 }}>
                  <ProgressBar
                    label={t('admin.dashboard.member.active_ratio', 'Active Users')}
                    value={activeGuardians} max={totalUsers} color="green"
                  />
                  <ProgressBar
                    label={t('admin.dashboard.stores.active', 'Active Stores')}
                    value={storeStats?.active ?? 0} max={totalStores || 1} color="blue"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Row 2: Feeding + Exercise ── */}
          <div className="ad-grid-2">
            <div className="card">
              <div className="card-header"><div className="card-title">{t('admin.dashboard.feeding.title', 'Feeding Statistics')}</div></div>
              <div className="card-body">
                <div className="ad-chart-card" style={{ marginBottom: 12 }}>
                  <div className="ad-chart-title">{t('admin.dashboard.feeding.top5_feed', 'Top 5 Feeds')}</div>
                  {stats.feeding.top5_feeds.length > 0
                    ? <RBar data={stats.feeding.top5_feeds} xKey="name" yKey="count" />
                    : <NoData t={t} />}
                </div>
                <div className="ad-chart-card">
                  <div className="ad-chart-title">{t('admin.dashboard.feeding.type_distribution', 'Type Distribution')}</div>
                  {stats.feeding.type_distribution.length > 0
                    ? <RPie data={stats.feeding.type_distribution} nameKey="type" valueKey="count" />
                    : <NoData t={t} />}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header"><div className="card-title">{t('admin.dashboard.exercise.title', 'Exercise Statistics')}</div></div>
              <div className="card-body">
                <div className="ad-chart-card" style={{ marginBottom: 12 }}>
                  <div className="ad-chart-title">{t('admin.dashboard.exercise.type_count', 'Exercise Types')}</div>
                  {stats.exercise.type_count.length > 0
                    ? <RBar data={stats.exercise.type_count} xKey="type" yKey="count" color="#4CAF7D" />
                    : <NoData t={t} />}
                </div>
                <div className="ad-chart-card">
                  <div className="ad-chart-title">{t('admin.dashboard.exercise.monthly_trend', 'Monthly Trend')}</div>
                  {stats.exercise.monthly_trend.length > 0
                    ? <RLine data={stats.exercise.monthly_trend} xKey="month" yKey="count" color="#4A7CF7" />
                    : <NoData t={t} />}
                </div>
              </div>
            </div>
          </div>

          {/* ── Row 3: Health + Quick Actions ── */}
          <div className="ad-grid-2">
            <div className="card">
              <div className="card-header"><div className="card-title">{t('admin.dashboard.health.title', 'Health Metrics')}</div></div>
              <div className="card-body">
                <div className="ad-chart-card" style={{ marginBottom: 12 }}>
                  <div className="ad-chart-title">{t('admin.dashboard.health.weight_trend', 'Average Weight Trend')}</div>
                  {stats.health.weight_trend.length > 0
                    ? <RLine data={stats.health.weight_trend} xKey="date" yKey="avg_weight" color="#F5823A" />
                    : <NoData t={t} />}
                </div>
                <div className="ad-chart-card">
                  <div className="ad-chart-title">{t('admin.dashboard.health.top5_measurements', 'Top Health Measurements')}</div>
                  {stats.health.top5_measurements.length > 0
                    ? <RBar data={stats.health.top5_measurements} xKey="name" yKey="count" color="#4CAF7D" />
                    : <NoData t={t} />}
                </div>
              </div>
            </div>

            {/* Quick Actions + Activity */}
            <div className="card">
              <div className="card-header"><div className="card-title">{t('admin.dashboard.quick_actions', 'Quick Actions')}</div></div>
              <div className="card-body">
                <div className="ad-quick-grid" style={{ marginBottom: 20 }}>
                  <QuickAction to="/admin/members" icon="👥" label={t('admin.nav.members', 'Members')} />
                  <QuickAction to="/admin/feeds" icon="🥣" label={t('admin.nav.feeds', 'Feeds')} />
                  <QuickAction to="/admin/i18n" icon="🌐" label={t('admin.nav.i18n', 'i18n')} />
                  <QuickAction to="/admin/devices" icon="🔬" label={t('admin.nav.devices', 'Devices')} />
                  <QuickAction to="/admin/master" icon="🗂" label={t('admin.nav.master', 'Master')} />
                  <QuickAction to="/admin/api-connections" icon="⚙️" label={t('admin.nav.api_connections', 'Settings')} />
                </div>

                {/* Recent activity */}
                <div className="ad-chart-title">{t('admin.dashboard.recent_activity', 'Recent Activity')}</div>
                <div className="ad-activity-list">
                  {stats.members.signup_trend.slice(0, 4).map((s, i) => (
                    <div key={i} className="ad-activity-item">
                      <span className={`ad-activity-dot ${['amber', 'green', 'blue', 'purple'][i % 4]}`} />
                      <span className="ad-activity-text">
                        {(s.count as number).toLocaleString()} {t('admin.dashboard.signups_in', 'signups in')} {String(s.month)}
                      </span>
                      <span className="ad-activity-time">{String(s.month)}</span>
                    </div>
                  ))}
                  {stats.members.signup_trend.length === 0 && (
                    <div style={{ padding: '12px 0', color: 'var(--mid)', fontSize: 13 }}>
                      {t('admin.dashboard.no_data', 'No data')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Row 4: System Status + Language + Breed ── */}
          <div className="ad-grid-3">
            {/* System Status */}
            <div className="card">
              <div className="card-header"><div className="card-title">{t('admin.dashboard.system_health', 'System Health')}</div></div>
              <div className="card-body">
                <ProgressBar label="API" value={apiOk ? 100 : 0} max={100} color="green" />
                <ProgressBar label="Database" value={dbOk ? 100 : 0} max={100} color="blue" />
                <ProgressBar label={t('admin.dashboard.env', 'Environment')} value={health ? 100 : 0} max={100} color="purple" />
              </div>
            </div>

            {/* Pet Type Distribution */}
            <div className="card">
              <div className="card-header"><div className="card-title">{t('admin.dashboard.member.pet_type_dist', 'Pet Distribution')}</div></div>
              <div className="card-body">
                {stats.members.pet_type_dist.length > 0
                  ? stats.members.pet_type_dist.map((d, i) => (
                      <ProgressBar
                        key={i}
                        label={String(d.type)}
                        value={d.count as number}
                        max={stats.members.pet_type_dist.reduce((s, x) => s + (x.count as number), 0) || 1}
                        color={['amber', 'green', 'blue', 'purple', 'red'][i % 5] as 'amber'}
                      />
                    ))
                  : <div style={{ padding: '12px 0', color: 'var(--mid)', fontSize: 13 }}>{t('admin.dashboard.no_data', 'No data')}</div>}
              </div>
            </div>

            {/* Top Breeds */}
            <div className="card">
              <div className="card-header"><div className="card-title">{t('admin.dashboard.member.top10_breeds', 'Top Breeds')}</div></div>
              <div className="card-body">
                {stats.members.top10_breeds.length > 0
                  ? stats.members.top10_breeds.slice(0, 6).map((d, i) => (
                      <ProgressBar
                        key={i}
                        label={String(d.name)}
                        value={d.count as number}
                        max={stats.members.top10_breeds[0].count as number || 1}
                        color={['amber', 'blue', 'green', 'purple', 'red'][i % 5] as 'amber'}
                      />
                    ))
                  : <div style={{ padding: '12px 0', color: 'var(--mid)', fontSize: 13 }}>{t('admin.dashboard.no_data', 'No data')}</div>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Components ──────────────────────────────────────────────

function StatCard({ icon, iconColor, label, value, change, changeType, color }: {
  icon: string; iconColor: string; label: string; value: number | string;
  change?: string; changeType?: 'up' | 'down'; color: string;
}) {
  return (
    <div className="ad-stat-card" data-color={color}>
      <div className="ad-stat-header">
        <div className={`ad-stat-icon ${iconColor}`}>{icon}</div>
        {change && (
          <span className={`ad-stat-change ${changeType || 'up'}`}>
            {changeType === 'down' ? '↓' : '↑'} {change}
          </span>
        )}
      </div>
      <div className="ad-stat-value">{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div className="ad-stat-label">{label}</div>
    </div>
  );
}

function ProgressBar({ label, value, max, color }: {
  label: string; value: number; max: number; color: 'amber' | 'green' | 'blue' | 'purple' | 'red';
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="ad-progress-wrap">
      <div className="ad-progress-header">
        <span className="ad-progress-header-label">{label}</span>
        <span className="ad-progress-header-value">{value.toLocaleString()} ({pct}%)</span>
      </div>
      <div className="ad-progress">
        <div className={`ad-progress-fill ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function QuickAction({ to, icon, label }: { to: string; icon: string; label: string }) {
  return (
    <Link to={to} className="ad-quick-btn">
      <span className="ad-quick-btn-icon">{icon}</span>
      <span className="ad-quick-btn-label">{label}</span>
    </Link>
  );
}

function NoData({ t }: { t: (k: string, fb?: string) => string }) {
  return (
    <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--mid)', fontSize: 13 }}>
      {t('admin.dashboard.no_data', 'No data')}
    </div>
  );
}

// ─── Recharts Wrappers ──────────────────────────────────────

function RBar({ data, xKey, yKey, color = '#F5823A' }: { data: Record<string, unknown>[]; xKey: string; yKey: string; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={50} />
        <YAxis tick={{ fontSize: 11 }} width={40} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,.1)' }} />
        <Bar dataKey={yKey} fill={color} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function RPie({ data, nameKey, valueKey }: { data: Record<string, unknown>[]; nameKey: string; valueKey: string }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} dataKey={valueKey} nameKey={nameKey} cx="50%" cy="50%"
          outerRadius={70} innerRadius={38} paddingAngle={3}
          label={((props: { name?: string; percent?: number }) => `${props.name ?? ''} ${((props.percent ?? 0) * 100).toFixed(0)}%`) as unknown as boolean}
          labelLine={false} style={{ fontSize: 10 }}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,.1)' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function RLine({ data, xKey, yKey, color = '#F5823A' }: { data: Record<string, unknown>[]; xKey: string; yKey: string; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} width={40} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,.1)' }} />
        <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
