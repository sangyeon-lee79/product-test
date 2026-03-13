import { useEffect, useState, useMemo } from 'react';
import { api, type Appointment, type AppointmentReview } from '../../lib/api';
import GroomingCompleteModal from './GroomingCompleteModal';

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';

const APT_STATUS_META: Record<string, { key: string; badge: string }> = {
  pending: { key: 'supplier.appointment.status.pending', badge: 'badge-amber' },
  confirmed: { key: 'supplier.appointment.status.confirmed', badge: 'badge-blue' },
  rejected: { key: 'supplier.appointment.status.rejected', badge: 'badge-red' },
  completed: { key: 'supplier.appointment.status.completed', badge: 'badge-green' },
  cancelled: { key: 'supplier.appointment.status.cancelled', badge: 'badge-gray' },
};

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  grooming: 'booking.business.grooming',
  hospital: 'booking.business.hospital',
  hotel: 'booking.business.hotel',
  training: 'booking.business.training',
  shop: 'booking.business.shop',
  cafe: 'booking.business.cafe',
  photo: 'booking.business.photo',
};

interface Props {
  t: (key: string, fallback?: string) => string;
  locale: string;
}

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfWeek(y: number, m: number) { return new Date(y, m, 1).getDay(); }
function pad2(n: number) { return String(n).padStart(2, '0'); }

export default function AppointmentSection({ t, locale }: Props) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [selectedId, setSelectedId] = useState('');
  const [busyId, setBusyId] = useState('');
  const [rejectModalId, setRejectModalId] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [groomingModalApt, setGroomingModalApt] = useState<Appointment | null>(null);

  // View mode: calendar or list
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const now = useMemo(() => new Date(), []);
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [selectedCalDate, setSelectedCalDate] = useState('');

  // Review state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewModalAptId, setReviewModalAptId] = useState('');
  const [savingReview, setSavingReview] = useState(false);
  const [myReview, setMyReview] = useState<AppointmentReview | null>(null);
  const [otherReview, setOtherReview] = useState<AppointmentReview | null>(null);
  const [viewReviewAptId, setViewReviewAptId] = useState('');

  async function loadAppointments(opts?: { silent?: boolean }) {
    if (!opts?.silent) setLoading(true);
    setError('');
    try {
      const res = await api.appointments.list();
      setAppointments((res.appointments || []).filter(a => !a.deleted_at));
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.err.failed'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadAppointments(); }, []);

  const filtered = useMemo(() => {
    const sorted = [...appointments].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return filter === 'all' ? sorted : sorted.filter(a => a.status === filter);
  }, [appointments, filter]);

  const selected = useMemo(() => filtered.find(a => a.id === selectedId) || filtered[0] || null, [filtered, selectedId]);

  // Calendar helpers
  const appointmentsByDate = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    for (const apt of appointments) {
      if (!apt.scheduled_at) continue;
      const dateKey = apt.scheduled_at.slice(0, 10);
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(apt);
    }
    return map;
  }, [appointments]);

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfWeek(calYear, calMonth);
  const todayStr = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;

  const calendarDayAppointments = useMemo(() => {
    if (!selectedCalDate) return [];
    return (appointmentsByDate[selectedCalDate] || [])
      .sort((a, b) => new Date(a.scheduled_at || 0).getTime() - new Date(b.scheduled_at || 0).getTime());
  }, [appointmentsByDate, selectedCalDate]);

  function prevMonth() {
    if (calMonth === 0) { setCalYear(calYear - 1); setCalMonth(11); }
    else setCalMonth(calMonth - 1);
    setSelectedCalDate('');
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear(calYear + 1); setCalMonth(0); }
    else setCalMonth(calMonth + 1);
    setSelectedCalDate('');
  }

  async function handleConfirm(id: string) {
    setBusyId(id);
    setMessage('');
    try {
      await api.appointments.confirm(id);
      setMessage(t('supplier.appointment.status.confirmed'));
      await loadAppointments({ silent: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.err.failed'));
    } finally {
      setBusyId('');
    }
  }

  async function handleReject() {
    if (!rejectModalId) return;
    setBusyId(rejectModalId);
    try {
      await api.appointments.reject(rejectModalId, rejectReason);
      setRejectModalId('');
      setRejectReason('');
      setMessage(t('supplier.appointment.status.rejected'));
      await loadAppointments({ silent: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.err.failed'));
    } finally {
      setBusyId('');
    }
  }

  async function handleSendReport(id: string) {
    setBusyId(id);
    try {
      await api.appointments.sendReport(id);
      setMessage(t('booking.report_sent'));
      await loadAppointments({ silent: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.err.failed'));
    } finally {
      setBusyId('');
    }
  }

  async function handleSubmitReview() {
    if (!reviewModalAptId || reviewRating < 0.5) return;
    setSavingReview(true);
    try {
      await api.appointments.reviews.create(reviewModalAptId, { rating: reviewRating, content: reviewContent || undefined });
      setReviewModalAptId('');
      setReviewRating(0);
      setReviewContent('');
      setMessage(t('booking.review.submitted'));
      await loadAppointments({ silent: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.err.failed'));
    } finally {
      setSavingReview(false);
    }
  }

  async function handleViewReviews(aptId: string) {
    try {
      const res = await api.appointments.reviews.get(aptId);
      setMyReview(res.my_review);
      setOtherReview(res.other_review);
      setViewReviewAptId(aptId);
    } catch {
      // ignore
    }
  }

  function fmtDate(iso: string | null) {
    if (!iso) return '-';
    return new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
  }

  function fmtTime(iso: string | null) {
    if (!iso) return '';
    return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
  }

  function renderStars(value: number) {
    return (
      <span style={{ fontSize: 14, letterSpacing: 2 }}>
        {[0, 1, 2, 3, 4].map(i => (
          <span key={i} style={{ color: value >= i + 1 ? '#f59e0b' : value >= i + 0.5 ? '#f59e0b' : '#d1d5db' }}>
            {value >= i + 1 ? '\u2605' : value >= i + 0.5 ? '\u2BEA' : '\u2606'}
          </span>
        ))}
        <span style={{ marginLeft: 4, fontSize: 12, fontWeight: 600 }}>{value.toFixed(1)}</span>
      </span>
    );
  }

  // Service display helpers
  function svcName(apt: Appointment) { return apt.service_name || apt.service_type || '-'; }
  function svcDuration(apt: Appointment) {
    const d = apt.duration_minutes || apt.service_duration;
    return d ? `${d}${t('booking.minutes', 'min')}` : '-';
  }
  function svcPrice(apt: Appointment) {
    const p = apt.price || apt.service_price;
    return p ? Number(p).toLocaleString() : '-';
  }

  if (loading) return <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>...</div>;

  return (
    <div>
      {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}
      {message && <div className="alert alert-success" style={{ marginBottom: 12 }}>{message}</div>}

      {/* Top bar: Filters + View toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['all', 'pending', 'confirmed', 'completed', 'rejected', 'cancelled'] as StatusFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            >
              {f === 'all' ? t('common.all', 'All') : t(APT_STATUS_META[f]?.key || f)}
              {f !== 'all' && ` (${appointments.filter(a => a.status === f).length})`}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            className={`btn btn-sm ${viewMode === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('calendar')}
            title={t('supplier.appointments.view.calendar', 'Calendar')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ verticalAlign: 'middle' }}>
              <rect x="1" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <line x1="1" y1="7" x2="15" y2="7" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="5" y1="1" x2="5" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="11" y1="1" x2="11" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <button
            className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('list')}
            title={t('supplier.appointments.view.list', 'List')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ verticalAlign: 'middle' }}>
              <line x1="5" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="5" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="5" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="2.5" cy="4" r="1" fill="currentColor"/>
              <circle cx="2.5" cy="8" r="1" fill="currentColor"/>
              <circle cx="2.5" cy="12" r="1" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ─── Calendar View ─── */}
      {viewMode === 'calendar' && (
        <div>
          {/* Month navigation */}
          <div className="gm-cal-nav">
            <button className="gm-cal-nav-btn" onClick={prevMonth}>&lsaquo;</button>
            <span className="gm-cal-month">
              {new Date(calYear, calMonth).toLocaleDateString(locale, { year: 'numeric', month: 'long' })}
            </span>
            <button className="gm-cal-nav-btn" onClick={nextMonth}>&rsaquo;</button>
          </div>

          {/* Calendar grid */}
          <div className="gm-cal-grid">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className="gm-cal-header">{d}</div>
            ))}
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`e-${i}`} className="gm-cal-day empty" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const ds = `${calYear}-${pad2(calMonth + 1)}-${pad2(day)}`;
              const isToday = ds === todayStr;
              const isSelected = ds === selectedCalDate;
              const dayApts = appointmentsByDate[ds] || [];

              return (
                <button
                  key={day}
                  className={`gm-cal-day${isSelected ? ' selected' : ''}${isToday ? ' today' : ''}`}
                  onClick={() => setSelectedCalDate(ds)}
                >
                  {day}
                  {dayApts.length > 0 && (
                    <div className="sp-cal-dots">
                      {dayApts.some(a => a.status === 'pending') && <span className="sp-cal-dot dot-pending" />}
                      {dayApts.some(a => a.status === 'confirmed') && <span className="sp-cal-dot dot-confirmed" />}
                      {dayApts.some(a => a.status === 'completed') && <span className="sp-cal-dot dot-completed" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected date appointments */}
          <div style={{ marginTop: 16 }}>
            {selectedCalDate ? (
              <>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>
                  {new Date(selectedCalDate + 'T00:00:00').toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
                </div>
                {calendarDayAppointments.length > 0 ? (
                  <div className="card" style={{ overflow: 'hidden' }}>
                    {calendarDayAppointments.map(apt => {
                      const meta = APT_STATUS_META[apt.status];
                      return (
                        <div
                          key={apt.id}
                          className="sp-cal-apt-row"
                          onClick={() => { setSelectedId(apt.id); setViewMode('list'); }}
                        >
                          <span style={{ fontWeight: 600, fontSize: 13, minWidth: 50 }}>{fmtTime(apt.scheduled_at)}</span>
                          <span style={{ flex: 1, fontSize: 13 }}>
                            {apt.guardian_name || apt.guardian_email || '-'}
                            <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>
                              {apt.pet_name && `${apt.pet_name} · `}{svcName(apt)}
                            </span>
                          </span>
                          {meta && <span className={`badge ${meta.badge}`} style={{ fontSize: 10 }}>{t(meta.key)}</span>}
                          {apt.status === 'pending' && (
                            <span style={{ display: 'flex', gap: 4 }}>
                              <button className="btn btn-primary" style={{ fontSize: 11, padding: '2px 8px' }} disabled={busyId === apt.id} onClick={e => { e.stopPropagation(); handleConfirm(apt.id); }}>
                                {t('supplier.appointment.confirm_btn', 'Accept')}
                              </button>
                              <button className="btn btn-danger" style={{ fontSize: 11, padding: '2px 8px' }} disabled={busyId === apt.id} onClick={e => { e.stopPropagation(); setRejectModalId(apt.id); setRejectReason(''); }}>
                                {t('supplier.appointment.reject_btn', 'Reject')}
                              </button>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                    {t('supplier.appointments.date_none', 'No appointments on this date')}
                  </div>
                )}
              </>
            ) : (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                {t('supplier.appointments.select_date', 'Select a date')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── List View ─── */}
      {viewMode === 'list' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.1fr) minmax(300px, 0.9fr)', gap: 16, alignItems: 'start' }}>
          {/* Left: list */}
          <div className="card">
            {filtered.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)' }}>{t('common.empty')}</div>}
            {filtered.map(apt => {
              const active = selected?.id === apt.id;
              const meta = APT_STATUS_META[apt.status];
              return (
                <button
                  key={apt.id}
                  onClick={() => setSelectedId(apt.id)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '12px 14px', cursor: 'pointer',
                    background: active ? '#FFF7ED' : 'transparent',
                    borderBottom: '1px solid var(--border)', border: 'none', borderLeft: active ? '3px solid #E87C2B' : '3px solid transparent',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>
                      {apt.guardian_name || apt.guardian_email || apt.guardian_id.slice(0, 8)}
                      {apt.is_overtime && <span className="gm-overtime-badge" style={{ marginLeft: 6, fontSize: 10, padding: '1px 5px' }}>{t('booking.slot.overtime')}</span>}
                    </span>
                    {meta && <span className={`badge ${meta.badge}`} style={{ fontSize: 11 }}>{t(meta.key)}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                    {apt.pet_name && <span>{apt.pet_name} · </span>}
                    <span>{svcName(apt)} · </span>
                    {fmtDate(apt.scheduled_at)}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: detail */}
          <div className="card">
            {!selected ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>{t('common.select_item')}</div>
            ) : (
              <div style={{ padding: 16 }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h4 style={{ margin: 0 }}>{selected.guardian_name || selected.guardian_email}</h4>
                  <span className={`badge ${APT_STATUS_META[selected.status]?.badge || ''}`}>
                    {t(APT_STATUS_META[selected.status]?.key || selected.status)}
                  </span>
                </div>

                {/* Info grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: 13, marginBottom: 16 }}>
                  <div><strong>{t('booking.pet_select')}:</strong> {selected.pet_name || '-'}</div>
                  <div><strong>{t('booking.service_type')}:</strong> {svcName(selected)}</div>
                  <div><strong>{t('booking.date_select')}:</strong> {fmtDate(selected.scheduled_at)}</div>
                  <div><strong>{t('booking.duration')}:</strong> {svcDuration(selected)}</div>
                  <div><strong>{t('booking.price')}:</strong> {svcPrice(selected)}</div>
                  {selected.business_type && (
                    <div><strong>{t('booking.business_type')}:</strong> {t(BUSINESS_TYPE_LABELS[selected.business_type] || selected.business_type, selected.business_type)}</div>
                  )}
                </div>

                {/* Overtime info */}
                {selected.is_overtime && (
                  <div className="gm-overtime-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    {t('booking.overtime_warning')}
                    {selected.overtime_fee > 0 && <span>+{selected.overtime_fee.toLocaleString()}</span>}
                  </div>
                )}

                {/* Extra data */}
                {selected.extra_data && Object.keys(selected.extra_data).length > 0 && (
                  <div style={{ padding: 10, background: '#FFFBEB', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
                    <strong style={{ fontSize: 12, color: '#92400e' }}>{t('booking.extra_info')}</strong>
                    <div style={{ marginTop: 4, display: 'grid', gap: 4 }}>
                      {Object.entries(selected.extra_data).map(([k, v]) => (
                        <div key={k}>
                          <span style={{ color: 'var(--text-muted)' }}>{t(`booking.field.${k}`, k)}: </span>
                          <span>{typeof v === 'boolean' ? (v ? t('common.yes') : t('common.no')) : String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Request note */}
                {selected.request_note && (
                  <div style={{ padding: 10, background: 'var(--bg)', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
                    <strong>{t('booking.request_note')}:</strong>
                    <p style={{ margin: '4px 0 0' }}>{selected.request_note}</p>
                  </div>
                )}

                {/* Rejected/Cancelled reason */}
                {selected.status === 'rejected' && selected.rejected_reason && (
                  <div style={{ padding: 10, background: '#FEF2F2', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
                    <strong>{t('supplier.appointment.reject_reason')}:</strong>
                    <p style={{ margin: '4px 0 0' }}>{selected.rejected_reason}</p>
                  </div>
                )}
                {selected.status === 'cancelled' && selected.cancelled_reason && (
                  <div style={{ padding: 10, background: '#f3f4f6', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
                    <strong>{t('booking.cancel_reason')}:</strong>
                    <p style={{ margin: '4px 0 0' }}>{selected.cancelled_reason}</p>
                  </div>
                )}

                {/* Health report */}
                {selected.status === 'completed' && selected.pet_report_period && !selected.pet_report_sent && (
                  <div style={{ padding: 10, background: '#EEF3FF', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
                    <strong>{t('booking.report_title')}: </strong>
                    <span>{t(`booking.report_${selected.pet_report_period}`)}</span>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ marginLeft: 8 }}
                      disabled={busyId === selected.id}
                      onClick={() => handleSendReport(selected.id)}
                    >
                      {t('booking.report_send_btn')}
                    </button>
                  </div>
                )}
                {selected.pet_report_sent && (
                  <div style={{ fontSize: 12, color: '#065f46', marginBottom: 12 }}>
                    {t('booking.report_sent')}
                  </div>
                )}

                {/* Review indicator */}
                {selected.status === 'completed' && (
                  <div style={{ fontSize: 12, marginBottom: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span>{t('booking.review.title')}: </span>
                    {selected.has_supplier_review ? (
                      <span style={{ color: '#065f46' }}>{t('booking.review.written')}</span>
                    ) : (
                      <button className="btn btn-secondary btn-sm" onClick={() => { setReviewModalAptId(selected.id); setReviewRating(0); setReviewContent(''); }}>
                        {t('booking.review.write_btn')}
                      </button>
                    )}
                    <button className="btn btn-secondary btn-sm" onClick={() => handleViewReviews(selected.id)}>
                      {t('booking.review.view_btn')}
                    </button>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {selected.status === 'pending' && (
                    <>
                      <button className="btn btn-primary btn-sm" disabled={busyId === selected.id} onClick={() => handleConfirm(selected.id)}>
                        {t('supplier.appointment.confirm_btn')}
                      </button>
                      <button className="btn btn-danger btn-sm" disabled={busyId === selected.id} onClick={() => { setRejectModalId(selected.id); setRejectReason(''); }}>
                        {t('supplier.appointment.reject_btn')}
                      </button>
                    </>
                  )}
                  {selected.status === 'confirmed' && (
                    <button className="btn btn-primary btn-sm" onClick={() => setGroomingModalApt(selected)}>
                      {t('supplier.appointment.complete_btn')}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject reason modal */}
      {rejectModalId && (
        <div className="modal-overlay" onClick={() => setRejectModalId('')}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{t('supplier.appointment.reject_reason')}</h3>
              <button className="modal-close" onClick={() => setRejectModalId('')}>&times;</button>
            </div>
            <div className="modal-body">
              <textarea className="form-input" rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setRejectModalId('')}>{t('common.cancel')}</button>
              <button className="btn btn-danger" disabled={!!busyId} onClick={handleReject}>
                {busyId ? '...' : t('supplier.appointment.reject_btn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supplier review write modal */}
      {reviewModalAptId && (
        <div className="modal-overlay" onClick={() => setReviewModalAptId('')}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{t('booking.review.write_title')}</h3>
              <button className="modal-close" onClick={() => setReviewModalAptId('')}>&times;</button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <p style={{ fontSize: 13, marginBottom: 8 }}>{t('booking.review.rating_label')}</p>
                <div style={{ fontSize: 28 }}>
                  {[0, 1, 2, 3, 4].map(i => (
                    <span
                      key={i}
                      style={{ cursor: 'pointer', color: reviewRating >= i + 1 ? '#f59e0b' : '#d1d5db' }}
                      onClick={() => setReviewRating(i + 1)}
                    >
                      {reviewRating >= i + 1 ? '\u2605' : '\u2606'}
                    </span>
                  ))}
                  <span style={{ fontSize: 14, marginLeft: 6 }}>{reviewRating.toFixed(1)}</span>
                </div>
              </div>
              <textarea
                className="form-input"
                rows={3}
                placeholder={t('booking.review.content_placeholder')}
                value={reviewContent}
                onChange={e => setReviewContent(e.target.value)}
              />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                {t('booking.review.mutual_notice')}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setReviewModalAptId('')}>{t('common.cancel')}</button>
              <button className="btn btn-primary" disabled={savingReview || reviewRating < 0.5} onClick={handleSubmitReview}>
                {savingReview ? '...' : t('booking.review.submit_btn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View reviews modal */}
      {viewReviewAptId && (
        <div className="modal-overlay" onClick={() => setViewReviewAptId('')}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{t('booking.review.title')}</h3>
              <button className="modal-close" onClick={() => setViewReviewAptId('')}>&times;</button>
            </div>
            <div className="modal-body">
              {myReview && (
                <div className="gm-review-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <strong style={{ fontSize: 13 }}>{t('booking.review.my_review')}</strong>
                    {renderStars(myReview.rating)}
                  </div>
                  {myReview.content && <p style={{ fontSize: 13, margin: '4px 0' }}>{myReview.content}</p>}
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(myReview.created_at).toLocaleDateString()}</div>
                </div>
              )}
              {otherReview ? (
                <div className="gm-review-card" style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <strong style={{ fontSize: 13 }}>{otherReview.author_name || t('booking.review.other_review')}</strong>
                    {renderStars(otherReview.rating)}
                  </div>
                  {otherReview.content && <p style={{ fontSize: 13, margin: '4px 0' }}>{otherReview.content}</p>}
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(otherReview.created_at).toLocaleDateString()}</div>
                </div>
              ) : (
                <div style={{ padding: 16, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', background: 'var(--bg)', borderRadius: 8, marginTop: 8 }}>
                  {myReview
                    ? t('booking.review.waiting_other')
                    : t('booking.review.none')
                  }
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setViewReviewAptId('')}>{t('common.ok')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Grooming complete modal */}
      {groomingModalApt && (
        <GroomingCompleteModal
          open={!!groomingModalApt}
          appointment={groomingModalApt}
          t={t}
          onClose={() => setGroomingModalApt(null)}
          onSuccess={() => void loadAppointments({ silent: true })}
        />
      )}
    </div>
  );
}
