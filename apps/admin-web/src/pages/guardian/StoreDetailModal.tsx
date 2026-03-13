import { useEffect, useState } from 'react';
import { api, type AppointmentReview } from '../../lib/api';
import { useT } from '../../lib/i18n';

interface StoreService {
  id: string;
  displayName: string;
  price: number | null;
  durationMin: number | null;
}

interface DisplayStore {
  id: string;
  displayName: string;
  displayDescription: string;
  category: string;
  addressText: string;
  rating: number;
  reviewCount: number;
  avatarUrl?: string | null;
  services: StoreService[];
  storeId?: string;
}

interface Props {
  store: DisplayStore;
  onClose: () => void;
  onBook: (service?: StoreService) => void;
}

const catEmoji: Record<string, string> = {
  grooming: '\u2702\uFE0F', hospital: '\uD83C\uDFE5', hotel: '\uD83C\uDFE8',
  training: '\uD83C\uDFAF', shop: '\uD83D\uDED2', cafe: '\u2615', photo: '\uD83D\uDCF7',
};

export default function StoreDetailModal({ store, onClose, onBook }: Props) {
  const t = useT();
  const [tab, setTab] = useState<'services' | 'info' | 'reviews'>('services');

  // Reviews state
  const [reviews, setReviews] = useState<AppointmentReview[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (tab !== 'reviews' || !store.storeId) return;
    setLoadingReviews(true);
    api.stores.reviews(store.storeId, { limit: 20 })
      .then(res => {
        setReviews(res.reviews || []);
        setAvgRating(res.avg_rating || 0);
        setReviewTotal(res.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoadingReviews(false));
  }, [tab, store.storeId]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal gm-store-detail-modal" onClick={e => e.stopPropagation()}>
        {/* Header photo */}
        <div className="gm-store-detail-hero">
          {store.avatarUrl ? (
            <img src={store.avatarUrl} alt="" className="gm-store-detail-hero-img" />
          ) : (
            <div className="gm-store-detail-hero-placeholder">
              <span>{catEmoji[store.category] || '\uD83C\uDFEA'}</span>
            </div>
          )}
          <button className="gm-store-detail-close" onClick={onClose}>&times;</button>
        </div>

        {/* Store name & meta */}
        <div className="gm-store-detail-header">
          <div className="gm-store-detail-title-row">
            <h3 className="gm-store-detail-name">{store.displayName}</h3>
            {store.category && (
              <span className="gm-store-card-badge">{t(`guardian.store.filter.${store.category}`, store.category)}</span>
            )}
          </div>
          {store.rating > 0 && (
            <div className="gm-store-detail-rating">
              {'\u2B50'} {store.rating.toFixed(1)}
              <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>({store.reviewCount} {t('guardian.store.card.reviews', 'reviews')})</span>
            </div>
          )}
        </div>

        {/* Tab bar */}
        <div className="gm-store-detail-tabs">
          <button
            className={`gm-store-detail-tab${tab === 'services' ? ' active' : ''}`}
            onClick={() => setTab('services')}
          >
            {t('guardian.store.detail.tab_services', 'Services')}
          </button>
          <button
            className={`gm-store-detail-tab${tab === 'info' ? ' active' : ''}`}
            onClick={() => setTab('info')}
          >
            {t('guardian.store.detail.tab_info', 'Store Info')}
          </button>
          <button
            className={`gm-store-detail-tab${tab === 'reviews' ? ' active' : ''}`}
            onClick={() => setTab('reviews')}
          >
            {t('booking.review.title', 'Reviews')}
          </button>
        </div>

        {/* Tab content */}
        <div className="gm-store-detail-body">
          {tab === 'services' && (
            <div className="gm-store-detail-services">
              {store.services.length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  {t('guardian.store.detail.no_services', 'No services available')}
                </div>
              ) : (
                store.services.map(svc => (
                  <div key={svc.id} className="gm-store-service-card">
                    <div className="gm-store-service-info">
                      <div className="gm-store-service-name">{svc.displayName}</div>
                      <div className="gm-store-service-meta">
                        {svc.durationMin != null && (
                          <span>{svc.durationMin}{t('guardian.store.detail.minutes', 'min')}</span>
                        )}
                        {svc.price != null && (
                          <span style={{ fontWeight: 600 }}>{svc.price.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    <button
                      className="btn btn-primary btn-sm gm-store-book-btn"
                      onClick={() => onBook(svc)}
                    >
                      {t('guardian.store.card.book_btn', 'Book Now')}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'info' && (
            <div className="gm-store-detail-info">
              {store.addressText && (
                <div className="gm-store-info-row">
                  <div className="gm-store-info-label">{t('guardian.store.detail.address', 'Address')}</div>
                  <div className="gm-store-info-value">{store.addressText}</div>
                </div>
              )}
              {store.displayDescription && (
                <div className="gm-store-info-row">
                  <div className="gm-store-info-label">{t('guardian.store.detail.about', 'About')}</div>
                  <div className="gm-store-info-value">{store.displayDescription}</div>
                </div>
              )}
            </div>
          )}

          {tab === 'reviews' && (
            <div className="gm-store-detail-info">
              {loadingReviews ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>{t('common.loading', 'Loading...')}</div>
              ) : reviews.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  {t('booking.review.none', 'No reviews yet')}
                </div>
              ) : (
                <>
                  <div style={{ padding: '12px 16px', background: 'var(--bg)', borderRadius: 8, marginBottom: 12, textAlign: 'center' }}>
                    <span style={{ fontSize: 24, fontWeight: 700 }}>{avgRating.toFixed(1)}</span>
                    <span style={{ fontSize: 18, marginLeft: 6, color: '#f59e0b' }}>{'\u2605'}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 8 }}>({reviewTotal} {t('guardian.store.card.reviews', 'reviews')})</span>
                  </div>
                  {reviews.map(r => (
                    <div key={r.id} className="gm-review-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <strong style={{ fontSize: 13 }}>{r.author_name || t('booking.review.anonymous', 'User')}</strong>
                        <span style={{ fontSize: 13 }}>
                          {[0, 1, 2, 3, 4].map(i => (
                            <span key={i} style={{ color: r.rating >= i + 1 ? '#f59e0b' : r.rating >= i + 0.5 ? '#f59e0b' : '#d1d5db' }}>
                              {r.rating >= i + 1 ? '\u2605' : r.rating >= i + 0.5 ? '\u2BEA' : '\u2606'}
                            </span>
                          ))}
                          <span style={{ marginLeft: 4, fontWeight: 600 }}>{r.rating.toFixed(1)}</span>
                        </span>
                      </div>
                      {r.content && <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5, margin: '4px 0' }}>{r.content}</p>}
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(r.created_at).toLocaleDateString()}</div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer: book entire store */}
        <div className="gm-store-detail-footer">
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => onBook()}>
            {t('guardian.store.card.book_btn', 'Book Now')}
          </button>
        </div>
      </div>
    </div>
  );
}
