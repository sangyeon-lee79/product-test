import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type Booking } from '../lib/api';
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
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  zh_cn: 'zh-CN',
  zh_tw: 'zh-TW',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  pt: 'pt-PT',
  vi: 'vi-VN',
  th: 'th-TH',
  id_lang: 'id-ID',
  ar: 'ar-SA',
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
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function SupplierDashboardPage() {
  const navigate = useNavigate();
  const t = useT();
  const { lang } = useI18n();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState<BookingFilter>('all');
  const [selectedId, setSelectedId] = useState('');
  const [completionMemo, setCompletionMemo] = useState('');
  const [completionMedia, setCompletionMedia] = useState('');

  const me = useMemo(() => decodeToken(), []);
  const locale = LANG_TO_LOCALE[lang] || 'en-US';
  const statusOptions = useMemo(
    () => Object.entries(STATUS_META).map(([value, meta]) => ({ value, label: t(meta.labelKey) })),
    [t],
  );

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
    void loadBookings();
  }, []);

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
    const mediaUrls = completionMedia
      .split('\n')
      .map((value) => value.trim())
      .filter(Boolean);

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
    navigate('/login', { replace: true });
  }

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
