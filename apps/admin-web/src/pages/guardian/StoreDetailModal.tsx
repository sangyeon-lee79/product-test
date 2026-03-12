import { useState } from 'react';
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
  const [tab, setTab] = useState<'services' | 'info'>('services');

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
