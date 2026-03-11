import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type Booking, type ProviderProfile, type Store } from '../lib/api';
import { logout } from '../lib/auth';
import { useI18n, useT } from '../lib/i18n';

type BookingFilter = 'all' | Booking['status'];
type BookingStatusAction = 'created' | 'in_progress' | 'service_completed' | 'publish_requested' | 'publish_approved' | 'publish_rejected' | 'cancelled';

const STATUS_META: Record<string, { labelKey: string; badge: string }> = {
  created: { labelKey: 'admin.provider.booking.status.created', badge: 'badge-blue' },
  in_progress: { labelKey: 'admin.provider.booking.status.in_progress', badge: 'badge-amber' },
  service_completed: { labelKey: 'admin.provider.booking.status.service_completed', badge: 'badge-green' },
  publish_requested: { labelKey: 'admin.provider.booking.status.publish_requested', badge: 'badge-blue' },
  publish_approved: { labelKey: 'admin.provider.booking.status.publish_approved', badge: 'badge-green' },
  publish_rejected: { labelKey: 'admin.provider.booking.status.publish_rejected', badge: 'badge-red' },
  cancelled: { labelKey: 'admin.provider.booking.status.cancelled', badge: 'badge-gray' },
};

const LANG_TO_LOCALE: Record<string, string> = {
  ko: 'ko-KR', en: 'en-US', ja: 'ja-JP', zh_cn: 'zh-CN', zh_tw: 'zh-TW',
  es: 'es-ES', fr: 'fr-FR', de: 'de-DE', pt: 'pt-PT', vi: 'vi-VN',
  th: 'th-TH', id_lang: 'id-ID', ar: 'ar-SA',
};

function decodeToken(): { sub?: string; email?: string } {
  const token = localStorage.getItem('access_token');
  if (!token) return {};
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return {};
    let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4 !== 0) b64 += '=';
    return JSON.parse(atob(b64)) as { sub?: string; email?: string };
  } catch {
    return {};
  }
}

function fmtDateTime(value?: string | null, time?: string | null): string {
  if (!value) return '-';
  if (!time) return value;
  return `${value} ${time}`;
}

function fmtRelativeDate(value: string | null | undefined, locale: string): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).format(date);
}

/* ─── Profile Edit Form (pending/rejected) ─── */
function ProfileEditSection({
  profile, onSaved,
}: { profile: ProviderProfile | null; onSaved: () => void }) {
  const t = useT();
  const [regNo, setRegNo] = useState(profile?.business_registration_no || '');
  const [hours, setHours] = useState(profile?.operating_hours || '');
  const [certs, setCerts] = useState((profile?.certifications || []).join(', '));
  const [address, setAddress] = useState(profile?.address_line || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    setRegNo(profile?.business_registration_no || '');
    setHours(profile?.operating_hours || '');
    setCerts((profile?.certifications || []).join(', '));
    setAddress(profile?.address_line || '');
  }, [profile]);

  async function handleSave() {
    setSaving(true);
    setMsg('');
    setErrMsg('');
    try {
      await api.providers.updateMe({
        business_registration_no: regNo.trim() || null,
        operating_hours: hours.trim() || null,
        certifications: certs.split(',').map((s) => s.trim()).filter(Boolean),
        address_line: address.trim() || null,
      });
      setMsg(t('admin.provider.profile.saved'));
      onSaved();
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : t('admin.provider.profile.save_failed'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">{t('admin.provider.profile.title')}</div>
      </div>
      <div className="card-body" style={{ display: 'grid', gap: 16 }}>
        {msg && <div className="alert alert-success">{msg}</div>}
        {errMsg && <div className="alert alert-error">{errMsg}</div>}

        {/* 현재 업종 (읽기전용 — 수정은 Admin에서) */}
        {profile && (profile.business_l1_label || profile.business_l2_label || profile.business_l3_label) && (
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t('admin.provider.profile.business_category')}</label>
            <div style={{ color: 'var(--text)', fontSize: 14 }}>
              {[profile.business_l1_label, profile.business_l2_label, profile.business_l3_label].filter(Boolean).join(' > ') || '-'}
            </div>
          </div>
        )}

        {profile && (profile.pet_type_l1_label || profile.pet_type_l2_label) && (
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t('admin.provider.profile.pet_type')}</label>
            <div style={{ color: 'var(--text)', fontSize: 14 }}>
              {[profile.pet_type_l1_label, profile.pet_type_l2_label].filter(Boolean).join(' > ') || '-'}
            </div>
          </div>
        )}

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">{t('admin.provider.profile.registration_no')}</label>
          <input className="form-input" value={regNo} onChange={(e) => setRegNo(e.target.value)} />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">{t('admin.provider.profile.operating_hours')}</label>
          <input className="form-input" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="09:00 - 18:00" />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">{t('admin.provider.profile.certifications')}</label>
          <input className="form-input" value={certs} onChange={(e) => setCerts(e.target.value)} placeholder="Cert1, Cert2" />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">{t('admin.provider.profile.address')}</label>
          <input className="form-input" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={() => void handleSave()} disabled={saving}>
          {saving ? '...' : t('admin.provider.profile.save')}
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function SupplierDashboardPage() {
  const navigate = useNavigate();
  const t = useT();
  const { lang } = useI18n();

  // Approval state
  const [approvalStatus, setApprovalStatus] = useState<string>('loading');
  const [providerProfile, setProviderProfile] = useState<ProviderProfile | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Booking state (used only when approved)
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState<BookingFilter>('all');
  const [selectedId, setSelectedId] = useState('');
  const [completionMemo, setCompletionMemo] = useState('');
  const [completionMedia, setCompletionMedia] = useState('');
  const [myStores, setMyStores] = useState<Store[]>([]);

  const me = useMemo(() => decodeToken(), []);
  const locale = LANG_TO_LOCALE[lang] || 'en-US';
  const statusOptions = useMemo(
    () => Object.entries(STATUS_META).map(([value, meta]) => ({ value, label: t(meta.labelKey) })),
    [t],
  );

  async function loadApprovalStatus() {
    try {
      const data = await api.providers.me();
      setApprovalStatus(data.approval_status || 'pending');
      setProviderProfile(data.profile);
      setRejectionReason(data.rejection_reason || '');
    } catch {
      setApprovalStatus('pending');
    }
  }

  async function loadBookings(opts?: { silent?: boolean }) {
    if (!opts?.silent) setLoading(true);
    setError('');
    try {
      const data = await api.bookings.list();
      setBookings(data.bookings || []);
      if (!selectedId && data.bookings?.length) {
        setSelectedId(data.bookings[0].id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('admin.provider.alert.load_failed'));
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }

  useEffect(() => {
    void loadApprovalStatus();
  }, []);

  // Load bookings + stores only when approved
  useEffect(() => {
    if (approvalStatus === 'approved') {
      void loadBookings();
      api.stores.my(lang).then(res => setMyStores(res.items || [])).catch(() => {});
    }
  }, [approvalStatus, lang]);

  const filteredBookings = useMemo(() => {
    const sorted = [...bookings].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    return filter === 'all' ? sorted : sorted.filter((booking) => booking.status === filter);
  }, [bookings, filter]);

  const selectedBooking = useMemo(
    () => filteredBookings.find((booking) => booking.id === selectedId) || filteredBookings[0] || null,
    [filteredBookings, selectedId],
  );

  useEffect(() => {
    if (selectedBooking && selectedBooking.id !== selectedId) {
      setSelectedId(selectedBooking.id);
    }
  }, [selectedBooking, selectedId]);

  useEffect(() => {
    if (!selectedBooking) {
      setCompletionMemo('');
      setCompletionMedia('');
      return;
    }
    setCompletionMemo(selectedBooking.notes || '');
    setCompletionMedia('');
  }, [selectedBooking?.id]);

  const stats = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter((booking) => booking.status === 'created').length,
    active: bookings.filter((booking) => booking.status === 'in_progress').length,
    approval: bookings.filter((booking) => booking.status === 'publish_requested').length,
  }), [bookings]);

  async function changeStatus(bookingId: string, status: BookingStatusAction) {
    setBusyId(bookingId);
    setMessage('');
    setError('');
    try {
      await api.bookings.updateStatus(bookingId, status);
      setMessage(t('admin.provider.alert.status_updated'));
      await loadBookings({ silent: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : t('admin.provider.alert.status_update_failed'));
    } finally {
      setBusyId('');
    }
  }

  async function requestCompletion() {
    if (!selectedBooking) return;
    const mediaUrls = completionMedia.split('\n').map((v) => v.trim()).filter(Boolean);
    setBusyId(selectedBooking.id);
    setMessage('');
    setError('');
    try {
      await api.bookings.requestCompletion(selectedBooking.id, {
        completion_memo: completionMemo.trim() || null,
        media_urls: mediaUrls,
        business_category_id: selectedBooking.business_category_id ?? null,
      });
      setMessage(t('admin.provider.alert.completion_requested'));
      await loadBookings({ silent: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : t('admin.provider.alert.completion_request_failed'));
    } finally {
      setBusyId('');
    }
  }

  function handleLogout() {
    logout();
    navigate('/', { replace: true });
  }

  /* ─── Loading state ─── */
  if (approvalStatus === 'loading') {
    return (
      <div className="provider-page" style={{ padding: 24, display: 'grid', gap: 20 }}>
        <div className="card"><div className="card-body" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>...</div></div>
      </div>
    );
  }

  /* ─── Pending / Rejected state ─── */
  if (approvalStatus !== 'approved') {
    const isPending = approvalStatus === 'pending';
    return (
      <div className="provider-page" style={{ padding: 24, display: 'grid', gap: 20, maxWidth: 720, margin: '0 auto' }}>
        {/* Header */}
        <section className="card" style={{ overflow: 'hidden' }}>
          <div className="card-body" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 60%, #fef3c7 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <p className="hero-eyebrow">{t('admin.provider.hero.eyebrow')}</p>
                <h2 style={{ fontSize: 26, lineHeight: 1.1, marginBottom: 8 }}>{t('admin.provider.hero.title')}</h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{me.email || ''}</div>
                <button className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={handleLogout}>
                  {t('admin.common.logout', '로그아웃')}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Approval status banner */}
        <section className="card" style={{ border: isPending ? '2px solid #f59e0b' : '2px solid #ef4444' }}>
          <div className="card-body" style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{isPending ? '\u23f3' : '\u274c'}</div>
            <h3 style={{ fontSize: 22, marginBottom: 12, color: isPending ? '#b45309' : '#dc2626' }}>
              {t(isPending ? 'admin.provider.approval.pending_title' : 'admin.provider.approval.rejected_title')}
            </h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
              {t(isPending ? 'admin.provider.approval.pending_description' : 'admin.provider.approval.rejected_description')}
            </p>
            {!isPending && rejectionReason && (
              <div style={{ marginTop: 16, padding: 12, background: '#fef2f2', borderRadius: 8, color: '#991b1b', fontSize: 14 }}>
                {rejectionReason}
              </div>
            )}
          </div>
        </section>

        {/* Profile edit form */}
        <ProfileEditSection profile={providerProfile} onSaved={() => void loadApprovalStatus()} />
      </div>
    );
  }

  /* ─── Approved: full dashboard ─── */
  return (
    <div className="provider-page" style={{ padding: 24, display: 'grid', gap: 20 }}>
      <section className="card" style={{ overflow: 'hidden' }}>
        <div className="card-body" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 60%, #fef3c7 100%)' }}>
          <p className="hero-eyebrow">{t('admin.provider.hero.eyebrow')}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ fontSize: 30, lineHeight: 1.1, marginBottom: 8 }}>{t('admin.provider.hero.title')}</h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: 720 }}>
                {t('admin.provider.hero.description')}
              </p>
            </div>
            <div style={{ minWidth: 240, padding: 16, background: 'rgba(255,255,255,0.8)', border: '1px solid var(--border)', borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{t('admin.provider.account.current')}</div>
              <div style={{ fontWeight: 700 }}>{me.email || t('admin.provider.account.fallback_email')}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{t('admin.provider.account.supplier_id')}: {me.sub || '-'}</div>
              <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={handleLogout}>
                {t('admin.common.logout', '로그아웃')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {message ? <div className="alert alert-success">{message}</div> : null}

      <section className="provider-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <div className="card"><div className="card-body"><div className="text-muted">{t('admin.provider.stats.total')}</div><div style={{ fontSize: 28, fontWeight: 700 }}>{stats.total}</div></div></div>
        <div className="card"><div className="card-body"><div className="text-muted">{t('admin.provider.stats.pending')}</div><div style={{ fontSize: 28, fontWeight: 700 }}>{stats.pending}</div></div></div>
        <div className="card"><div className="card-body"><div className="text-muted">{t('admin.provider.stats.active')}</div><div style={{ fontSize: 28, fontWeight: 700 }}>{stats.active}</div></div></div>
        <div className="card"><div className="card-body"><div className="text-muted">{t('admin.provider.stats.approval')}</div><div style={{ fontSize: 28, fontWeight: 700 }}>{stats.approval}</div></div></div>
      </section>

      {/* My Stores */}
      <section className="card">
        <div className="card-header">
          <div className="card-title">{t('provider.store.my_stores', 'My Stores')}</div>
        </div>
        <div className="card-body">
          {myStores.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{t('provider.store.no_stores', 'No stores yet.')}</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
              {myStores.map(s => (
                <div key={s.id} className="card" style={{ padding: 12, border: '1px solid var(--border)' }}>
                  <strong>{s.display_name || s.name}</strong>
                  <div className="text-muted" style={{ fontSize: 12 }}>
                    {s.address || '-'} &middot; {t('provider.store.services_count', '{count} services').replace('{count}', String(s.service_count || 0))}
                  </div>
                  <span className={`badge ${s.status === 'active' ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: 10, marginTop: 4 }}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="provider-booking-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(360px, 1.1fr) minmax(320px, 0.9fr)', gap: 20, alignItems: 'start' }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">{t('admin.provider.list.title')}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value as BookingFilter)} style={{ minWidth: 160 }}>
                <option value="all">{t('admin.provider.filter.all')}</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <button className="btn btn-secondary btn-sm" onClick={() => void loadBookings()} disabled={loading}>{t('admin.provider.action.refresh')}</button>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {loading ? (
              <div style={{ padding: 20, color: 'var(--text-muted)' }}>{t('admin.provider.list.loading')}</div>
            ) : filteredBookings.length === 0 ? (
              <div style={{ padding: 20, color: 'var(--text-muted)' }}>{t('admin.provider.list.empty')}</div>
            ) : (
              <div style={{ display: 'grid' }}>
                {filteredBookings.map((booking) => {
                  const meta = STATUS_META[booking.status] || { labelKey: 'admin.provider.booking.status.unknown', badge: 'badge-gray' };
                  const active = booking.id === selectedBooking?.id;
                  return (
                    <button
                      key={booking.id}
                      type="button"
                      onClick={() => setSelectedId(booking.id)}
                      style={{
                        border: 0,
                        background: active ? '#fff7ed' : 'transparent',
                        borderBottom: '1px solid var(--border)',
                        padding: 18,
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 10, alignItems: 'center' }}>
                        <strong>{booking.id}</strong>
                        <span className={`badge ${meta.badge}`}>{t(meta.labelKey)}</span>
                      </div>
                      <div style={{ display: 'grid', gap: 4, color: 'var(--text-muted)', fontSize: 13 }}>
                        <div>{t('admin.provider.list.guardian')}: {booking.guardian_id}</div>
                        <div>{t('admin.provider.list.pet')}: {booking.pet_id || '-'}</div>
                        <div>{t('admin.provider.list.requested_at')}: {fmtDateTime(booking.requested_date, booking.requested_time)}</div>
                        <div>{t('admin.provider.list.updated_at')}: {fmtRelativeDate(booking.updated_at, locale)}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">{t('admin.provider.detail.title')}</div>
          </div>
          <div className="card-body" style={{ display: 'grid', gap: 16 }}>
            {!selectedBooking ? (
              <div style={{ color: 'var(--text-muted)' }}>{t('admin.provider.detail.empty')}</div>
            ) : (
              <>
                <div style={{ display: 'grid', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: 18 }}>{selectedBooking.id}</strong>
                    <span className={`badge ${(STATUS_META[selectedBooking.status] || STATUS_META.cancelled).badge}`}>
                      {t((STATUS_META[selectedBooking.status] || { labelKey: 'admin.provider.booking.status.unknown' }).labelKey)}
                    </span>
                  </div>
                  <div className="form-row col2">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <div className="form-label">{t('admin.provider.detail.guardian_id')}</div>
                      <div>{selectedBooking.guardian_id}</div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <div className="form-label">{t('admin.provider.detail.pet_id')}</div>
                      <div>{selectedBooking.pet_id || '-'}</div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <div className="form-label">{t('admin.provider.detail.requested_at')}</div>
                      <div>{fmtDateTime(selectedBooking.requested_date, selectedBooking.requested_time)}</div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <div className="form-label">{t('admin.provider.detail.business_category')}</div>
                      <div>{selectedBooking.business_category_id || '-'}</div>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <div className="form-label">{t('admin.provider.detail.guardian_note')}</div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{selectedBooking.notes || '-'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => void changeStatus(selectedBooking.id, 'in_progress')}
                    disabled={busyId === selectedBooking.id || !['created', 'in_progress'].includes(selectedBooking.status)}
                  >
                    {t('admin.provider.action.start_progress')}
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => void changeStatus(selectedBooking.id, 'service_completed')}
                    disabled={busyId === selectedBooking.id || !['in_progress', 'service_completed', 'publish_rejected'].includes(selectedBooking.status)}
                  >
                    {t('admin.provider.action.complete_service')}
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => void changeStatus(selectedBooking.id, 'cancelled')}
                    disabled={busyId === selectedBooking.id || selectedBooking.status === 'cancelled'}
                  >
                    {t('admin.provider.action.cancel_booking')}
                  </button>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'grid', gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{t('admin.provider.completion.title')}</div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      {t('admin.provider.completion.description')}
                    </p>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">{t('admin.provider.completion.memo')}</label>
                    <textarea
                      className="form-textarea"
                      value={completionMemo}
                      onChange={(e) => setCompletionMemo(e.target.value)}
                      placeholder={t('admin.provider.completion.memo_placeholder')}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">{t('admin.provider.completion.media_urls')}</label>
                    <textarea
                      className="form-textarea"
                      value={completionMedia}
                      onChange={(e) => setCompletionMedia(e.target.value)}
                      placeholder={t('admin.provider.completion.media_placeholder')}
                    />
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => void requestCompletion()}
                    disabled={busyId === selectedBooking.id || !['service_completed', 'publish_rejected', 'publish_requested'].includes(selectedBooking.status)}
                  >
                    {t('admin.provider.action.request_completion')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
