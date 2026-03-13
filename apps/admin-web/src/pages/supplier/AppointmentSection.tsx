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
      setError(e instanceof Error ? e.message : 'Failed to load');
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

  async function handleConfirm(id: string) {
    setBusyId(id);
    setMessage('');
    try {
      await api.appointments.confirm(id);
      setMessage(t('supplier.appointment.status.confirmed', 'Confirmed'));
      await loadAppointments({ silent: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
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
      setMessage(t('supplier.appointment.status.rejected', 'Rejected'));
      await loadAppointments({ silent: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusyId('');
    }
  }

  async function handleSendReport(id: string) {
    setBusyId(id);
    try {
      await api.appointments.sendReport(id);
      setMessage(t('booking.report_sent', 'Health report sent'));
      await loadAppointments({ silent: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
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
      setMessage(t('booking.review.submitted', 'Review submitted'));
      await loadAppointments({ silent: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
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

  if (loading) return <div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>;

  return (
    <div>
      {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}
      {message && <div className="alert alert-success" style={{ marginBottom: 12 }}>{message}</div>}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {(['all', 'pending', 'confirmed', 'completed', 'rejected', 'cancelled'] as StatusFilter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
          >
            {f === 'all' ? t('common.all', 'All') : t(APT_STATUS_META[f]?.key || f, f)}
            {f !== 'all' && ` (${appointments.filter(a => a.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.1fr) minmax(300px, 0.9fr)', gap: 16, alignItems: 'start' }}>
        {/* Left: list */}
        <div className="card">
          {filtered.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)' }}>{t('common.empty', 'No data')}</div>}
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
                    {apt.is_overtime && <span className="gm-overtime-badge" style={{ marginLeft: 6, fontSize: 10, padding: '1px 5px' }}>{t('booking.slot.overtime', 'OT')}</span>}
                  </span>
                  {meta && <span className={`badge ${meta.badge}`} style={{ fontSize: 11 }}>{t(meta.key, apt.status)}</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                  {apt.pet_name && <span>{apt.pet_name} · </span>}
                  {apt.service_type && <span>{apt.service_type} · </span>}
                  {fmtDate(apt.scheduled_at)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: detail */}
        <div className="card">
          {!selected ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>{t('common.select_item', 'Select an item')}</div>
          ) : (
            <div style={{ padding: 16 }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h4 style={{ margin: 0 }}>{selected.guardian_name || selected.guardian_email}</h4>
                <span className={`badge ${APT_STATUS_META[selected.status]?.badge || ''}`}>
                  {t(APT_STATUS_META[selected.status]?.key || selected.status, selected.status)}
                </span>
              </div>

              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: 13, marginBottom: 16 }}>
                <div><strong>{t('booking.pet_select', 'Pet')}:</strong> {selected.pet_name || '-'}</div>
                <div><strong>{t('booking.service_type', 'Service')}:</strong> {selected.service_type || '-'}</div>
                <div><strong>{t('booking.date_select', 'Date')}:</strong> {fmtDate(selected.scheduled_at)}</div>
                <div><strong>{t('booking.duration', 'Duration')}:</strong> {selected.duration_minutes ? `${selected.duration_minutes}${t('booking.minutes', 'min')}` : '-'}</div>
                <div><strong>{t('booking.price', 'Price')}:</strong> {selected.price ? selected.price.toLocaleString() : '-'}</div>
                {selected.business_type && (
                  <div><strong>{t('booking.business_type', 'Type')}:</strong> {t(BUSINESS_TYPE_LABELS[selected.business_type] || selected.business_type, selected.business_type)}</div>
                )}
              </div>

              {/* Overtime info */}
              {selected.is_overtime && (
                <div className="gm-overtime-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  {t('booking.overtime_warning', 'Overtime Booking')}
                  {selected.overtime_fee > 0 && <span>+{selected.overtime_fee.toLocaleString()}</span>}
                </div>
              )}

              {/* Extra data */}
              {selected.extra_data && Object.keys(selected.extra_data).length > 0 && (
                <div style={{ padding: 10, background: '#FFFBEB', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
                  <strong style={{ fontSize: 12, color: '#92400e' }}>{t('booking.extra_info', 'Additional Info')}</strong>
                  <div style={{ marginTop: 4, display: 'grid', gap: 4 }}>
                    {Object.entries(selected.extra_data).map(([k, v]) => (
                      <div key={k}>
                        <span style={{ color: 'var(--text-muted)' }}>{t(`booking.field.${k}`, k)}: </span>
                        <span>{typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Request note */}
              {selected.request_note && (
                <div style={{ padding: 10, background: 'var(--bg)', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
                  <strong>{t('booking.request_note', 'Request Note')}:</strong>
                  <p style={{ margin: '4px 0 0' }}>{selected.request_note}</p>
                </div>
              )}

              {/* Rejected/Cancelled reason */}
              {selected.status === 'rejected' && selected.rejected_reason && (
                <div style={{ padding: 10, background: '#FEF2F2', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
                  <strong>{t('supplier.appointment.reject_reason', 'Rejection Reason')}:</strong>
                  <p style={{ margin: '4px 0 0' }}>{selected.rejected_reason}</p>
                </div>
              )}
              {selected.status === 'cancelled' && selected.cancelled_reason && (
                <div style={{ padding: 10, background: '#f3f4f6', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
                  <strong>{t('booking.cancel_reason', 'Cancel Reason')}:</strong>
                  <p style={{ margin: '4px 0 0' }}>{selected.cancelled_reason}</p>
                </div>
              )}

              {/* Health report */}
              {selected.status === 'completed' && selected.pet_report_period && !selected.pet_report_sent && (
                <div style={{ padding: 10, background: '#EEF3FF', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
                  <strong>{t('booking.report_title', 'Health Report')}: </strong>
                  <span>{t(`booking.report_${selected.pet_report_period}`, selected.pet_report_period)}</span>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ marginLeft: 8 }}
                    disabled={busyId === selected.id}
                    onClick={() => handleSendReport(selected.id)}
                  >
                    {t('booking.report_send_btn', 'Send Report')}
                  </button>
                </div>
              )}
              {selected.pet_report_sent && (
                <div style={{ fontSize: 12, color: '#065f46', marginBottom: 12 }}>
                  {t('booking.report_sent', 'Health report sent')}
                </div>
              )}

              {/* Review indicator */}
              {selected.status === 'completed' && (
                <div style={{ fontSize: 12, marginBottom: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span>{t('booking.review.title', 'Reviews')}: </span>
                  {selected.has_supplier_review ? (
                    <span style={{ color: '#065f46' }}>{t('booking.review.written', 'Written')}</span>
                  ) : (
                    <button className="btn btn-secondary btn-sm" onClick={() => { setReviewModalAptId(selected.id); setReviewRating(0); setReviewContent(''); }}>
                      {t('booking.review.write_btn', 'Write Review')}
                    </button>
                  )}
                  <button className="btn btn-secondary btn-sm" onClick={() => handleViewReviews(selected.id)}>
                    {t('booking.review.view_btn', 'View')}
                  </button>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {selected.status === 'pending' && (
                  <>
                    <button className="btn btn-primary btn-sm" disabled={busyId === selected.id} onClick={() => handleConfirm(selected.id)}>
                      {t('supplier.appointment.confirm_btn', 'Accept')}
                    </button>
                    <button className="btn btn-danger btn-sm" disabled={busyId === selected.id} onClick={() => { setRejectModalId(selected.id); setRejectReason(''); }}>
                      {t('supplier.appointment.reject_btn', 'Reject')}
                    </button>
                  </>
                )}
                {selected.status === 'confirmed' && (
                  <button className="btn btn-primary btn-sm" onClick={() => setGroomingModalApt(selected)}>
                    {t('supplier.appointment.complete_btn', 'Complete')}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reject reason modal */}
      {rejectModalId && (
        <div className="modal-overlay" onClick={() => setRejectModalId('')}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{t('supplier.appointment.reject_reason', 'Rejection Reason')}</h3>
              <button className="modal-close" onClick={() => setRejectModalId('')}>&times;</button>
            </div>
            <div className="modal-body">
              <textarea className="form-input" rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setRejectModalId('')}>{t('common.cancel', 'Cancel')}</button>
              <button className="btn btn-danger" disabled={!!busyId} onClick={handleReject}>
                {busyId ? '...' : t('supplier.appointment.reject_btn', 'Reject')}
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
              <h3 className="modal-title">{t('booking.review.write_title', 'Write a Review')}</h3>
              <button className="modal-close" onClick={() => setReviewModalAptId('')}>&times;</button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <p style={{ fontSize: 13, marginBottom: 8 }}>{t('booking.review.rating_label', 'Rating')}</p>
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
                placeholder={t('booking.review.content_placeholder', 'Share your experience...')}
                value={reviewContent}
                onChange={e => setReviewContent(e.target.value)}
              />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                {t('booking.review.mutual_notice', 'Both reviews must be written to see each other\'s review')}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setReviewModalAptId('')}>{t('common.cancel', 'Cancel')}</button>
              <button className="btn btn-primary" disabled={savingReview || reviewRating < 0.5} onClick={handleSubmitReview}>
                {savingReview ? '...' : t('booking.review.submit_btn', 'Submit')}
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
              <h3 className="modal-title">{t('booking.review.title', 'Reviews')}</h3>
              <button className="modal-close" onClick={() => setViewReviewAptId('')}>&times;</button>
            </div>
            <div className="modal-body">
              {myReview && (
                <div className="gm-review-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <strong style={{ fontSize: 13 }}>{t('booking.review.my_review', 'My Review')}</strong>
                    {renderStars(myReview.rating)}
                  </div>
                  {myReview.content && <p style={{ fontSize: 13, margin: '4px 0' }}>{myReview.content}</p>}
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(myReview.created_at).toLocaleDateString()}</div>
                </div>
              )}
              {otherReview ? (
                <div className="gm-review-card" style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <strong style={{ fontSize: 13 }}>{otherReview.author_name || t('booking.review.other_review', 'Their Review')}</strong>
                    {renderStars(otherReview.rating)}
                  </div>
                  {otherReview.content && <p style={{ fontSize: 13, margin: '4px 0' }}>{otherReview.content}</p>}
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(otherReview.created_at).toLocaleDateString()}</div>
                </div>
              ) : (
                <div style={{ padding: 16, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', background: 'var(--bg)', borderRadius: 8, marginTop: 8 }}>
                  {myReview
                    ? t('booking.review.waiting_other', 'Waiting for the other party\'s review')
                    : t('booking.review.none', 'No reviews yet')
                  }
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setViewReviewAptId('')}>{t('common.ok', 'OK')}</button>
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
