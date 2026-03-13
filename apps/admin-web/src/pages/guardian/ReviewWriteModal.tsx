import { useState } from 'react';
import { api, type Appointment, type AppointmentReview } from '../../lib/api';
import { useT } from '../../lib/i18n';

interface Props {
  appointment: Appointment;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewWriteModal({ appointment, onClose, onSuccess }: Props) {
  const t = useT();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  // View mode state
  const [myReview, setMyReview] = useState<AppointmentReview | null>(null);
  const [otherReview, setOtherReview] = useState<AppointmentReview | null>(null);
  const [viewMode, setViewMode] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);

  async function handleSubmit() {
    if (rating < 0.5) return;
    setSaving(true);
    setError('');
    try {
      await api.appointments.reviews.create(appointment.id, { rating, content: content || undefined });
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.err.save', 'Failed'));
    } finally {
      setSaving(false);
    }
  }

  async function loadReviews() {
    setLoadingReviews(true);
    try {
      const res = await api.appointments.reviews.get(appointment.id);
      setMyReview(res.my_review);
      setOtherReview(res.other_review);
      setViewMode(true);
    } catch {
      // ignore
    } finally {
      setLoadingReviews(false);
    }
  }

  // 0.5 star increments using half-star clicking
  function handleStarClick(starIndex: number, isHalf: boolean) {
    setRating(isHalf ? starIndex + 0.5 : starIndex + 1);
  }

  function renderStars(value: number, interactive: boolean) {
    return (
      <div className="gm-star-row" style={{ fontSize: interactive ? 28 : 18 }}>
        {[0, 1, 2, 3, 4].map(i => {
          const display = interactive ? (hoverRating || value) : value;
          const full = display >= i + 1;
          const half = !full && display >= i + 0.5;
          return (
            <span
              key={i}
              className={`gm-star${full ? ' full' : ''}${half ? ' half' : ''}`}
              style={interactive ? { cursor: 'pointer', position: 'relative' } : undefined}
              onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
            >
              {interactive ? (
                <>
                  {/* Left half */}
                  <span
                    style={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '100%', zIndex: 1 }}
                    onMouseEnter={() => setHoverRating(i + 0.5)}
                    onClick={() => handleStarClick(i, true)}
                  />
                  {/* Right half */}
                  <span
                    style={{ position: 'absolute', right: 0, top: 0, width: '50%', height: '100%', zIndex: 1 }}
                    onMouseEnter={() => setHoverRating(i + 1)}
                    onClick={() => handleStarClick(i, false)}
                  />
                </>
              ) : null}
              {full ? '\u2605' : half ? '\u2BEA' : '\u2606'}
            </span>
          );
        })}
        <span style={{ marginLeft: 6, fontSize: interactive ? 16 : 13, fontWeight: 600, color: 'var(--text)' }}>
          {(interactive ? (hoverRating || value) : value).toFixed(1)}
        </span>
      </div>
    );
  }

  if (done) {
    return (
      <div className="modal-overlay" onClick={onSuccess}>
        <div className="modal" style={{ maxWidth: 400, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
          <div className="modal-body" style={{ padding: '40px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{'\u2705'}</div>
            <h3 style={{ margin: '0 0 8px' }}>{t('booking.review.submitted', 'Review Submitted!')}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {t('booking.review.mutual_notice', 'Both reviews must be written to see each other\'s review')}
            </p>
            <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={loadReviews} disabled={loadingReviews}>
              {loadingReviews ? '...' : t('booking.review.view_btn', 'View Reviews')}
            </button>
            <button className="btn btn-primary" style={{ marginTop: 8, marginLeft: 8 }} onClick={onSuccess}>
              {t('common.ok', 'OK')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // View mode: show reviews
  if (viewMode) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">{t('booking.review.title', 'Reviews')}</h3>
            <button className="modal-close" onClick={onClose}>&times;</button>
          </div>
          <div className="modal-body">
            {/* My review */}
            {myReview && (
              <div className="gm-review-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <strong style={{ fontSize: 13 }}>{t('booking.review.my_review', 'My Review')}</strong>
                  {renderStars(myReview.rating, false)}
                </div>
                {myReview.content && <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{myReview.content}</p>}
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  {new Date(myReview.created_at).toLocaleDateString()}
                </div>
              </div>
            )}
            {/* Other review */}
            {otherReview ? (
              <div className="gm-review-card" style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <strong style={{ fontSize: 13 }}>{otherReview.author_name || t('booking.review.other_review', 'Their Review')}</strong>
                  {renderStars(otherReview.rating, false)}
                </div>
                {otherReview.content && <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{otherReview.content}</p>}
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  {new Date(otherReview.created_at).toLocaleDateString()}
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 12, padding: '16px', background: 'var(--bg)', borderRadius: 8, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                {t('booking.review.waiting_other', 'Waiting for the other party to write their review')}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-primary" onClick={onClose}>{t('common.ok', 'OK')}</button>
          </div>
        </div>
      </div>
    );
  }

  // Write mode
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{t('booking.review.write_title', 'Write a Review')}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}

          {/* Appointment summary */}
          <div style={{ padding: '10px 14px', background: 'var(--bg)', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
            <strong>{appointment.store_name || appointment.supplier_name}</strong>
            {appointment.service_type && <span style={{ color: 'var(--text-muted)' }}> &middot; {appointment.service_type}</span>}
          </div>

          {/* Star rating */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>{t('booking.review.rating_label', 'How was your experience?')}</p>
            {renderStars(rating, true)}
          </div>

          {/* Content */}
          <div className="form-group">
            <label className="form-label">{t('booking.review.content_label', 'Review (optional)')}</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder={t('booking.review.content_placeholder', 'Share your experience...')}
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>

          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
            {t('booking.review.mutual_notice', 'Both reviews must be written to see each other\'s review')}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>{t('common.cancel', 'Cancel')}</button>
          <button className="btn btn-primary" disabled={saving || rating < 0.5} onClick={handleSubmit}>
            {saving ? '...' : t('booking.review.submit_btn', 'Submit Review')}
          </button>
        </div>
      </div>
    </div>
  );
}
