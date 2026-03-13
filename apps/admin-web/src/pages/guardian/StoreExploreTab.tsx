import { useCallback, useEffect, useState } from 'react';
import { api, type Appointment, type Pet, type Store, type StoreService } from '../../lib/api';
import { useI18n, useT } from '../../lib/i18n';
import { BCP47_LOCALE_MAP, type Lang } from '@petfolio/shared';
import StoreDetailModal from './StoreDetailModal';
import StepBookingModal from './StepBookingModal';
import ReviewWriteModal from './ReviewWriteModal';
import { formatDate } from './guardianTypes';

/* ─── Constants ────────────────────────────────────────────────────────── */

const KOREAN_STATES = [
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
  '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
];

const CATEGORY_CHIPS: { key: string; i18nKey: string }[] = [
  { key: '', i18nKey: 'guardian.store.filter.all_categories' },
  { key: 'grooming', i18nKey: 'guardian.store.filter.grooming' },
  { key: 'hospital', i18nKey: 'guardian.store.filter.hospital' },
  { key: 'hotel', i18nKey: 'guardian.store.filter.hotel' },
  { key: 'training', i18nKey: 'guardian.store.filter.training' },
  { key: 'shop', i18nKey: 'guardian.store.filter.shop' },
  { key: 'cafe', i18nKey: 'guardian.store.filter.cafe' },
  { key: 'photo', i18nKey: 'guardian.store.filter.photo' },
];

/* ─── Display store type ──────────────────────────────────────────────── */

export interface DisplayStore {
  id: string;
  displayName: string;
  displayDescription: string;
  category: string;
  addressText: string;
  rating: number;
  reviewCount: number;
  isDemo: false;
  avatarUrl?: string | null;
  services: { id: string; displayName: string; price: number | null; durationMin: number | null }[];
  supplierId: string;
  storeId: string;
  operatingHours?: Record<string, { open: string; close: string; closed?: boolean }> | null;
}

function storeToDisplay(s: Store, services: StoreService[]): DisplayStore {
  return {
    id: s.id,
    displayName: s.display_name || s.name || '',
    displayDescription: s.display_description || s.description || '',
    category: s.business_type || '',
    addressText: s.address || [s.address_state_code, s.address_city_code, s.address_detail].filter(Boolean).join(' '),
    rating: 0,
    reviewCount: 0,
    isDemo: false,
    avatarUrl: s.avatar_url,
    services: services.map(svc => ({
      id: svc.id,
      displayName: svc.display_name || svc.name || '',
      price: svc.price ?? null,
      durationMin: svc.duration_minutes ?? null,
    })),
    supplierId: s.owner_id,
    storeId: s.id,
    operatingHours: s.operating_hours || null,
  };
}

/* ─── Props ────────────────────────────────────────────────────────────── */

interface Props {
  pets: Pet[];
  selectedPet: Pet | null;
  appointments: Appointment[];
  onOpenGroomingApproval: (apt: Appointment) => void;
  onRefresh: () => void;
}

/* ─── Category emoji ──────────────────────────────────────────────────── */

const catEmoji: Record<string, string> = {
  grooming: '\u2702\uFE0F', hospital: '\uD83C\uDFE5', hotel: '\uD83C\uDFE8',
  training: '\uD83C\uDFAF', shop: '\uD83D\uDED2', cafe: '\u2615', photo: '\uD83D\uDCF7',
};

/* ─── Component ────────────────────────────────────────────────────────── */

export default function StoreExploreTab({ pets, selectedPet, appointments, onOpenGroomingApproval, onRefresh }: Props) {
  const t = useT();
  const { lang } = useI18n();
  const locale = BCP47_LOCALE_MAP[lang as Lang] || 'en-US';

  // Filter state
  const [stateCode, setStateCode] = useState('');
  const [cityCode, setCityCode] = useState('');
  const [category, setCategory] = useState('');
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Data state
  const [stores, setStores] = useState<DisplayStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Detail modal
  const [detailStore, setDetailStore] = useState<DisplayStore | null>(null);

  // Booking modal
  const [bookingStore, setBookingStore] = useState<DisplayStore | null>(null);
  const [bookingService, setBookingService] = useState<DisplayStore['services'][0] | null>(null);

  // Appointments collapse
  const [aptCollapsed, setAptCollapsed] = useState(false);
  const [cancellingId, setCancellingId] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [cancelModalId, setCancelModalId] = useState('');
  const [reviewApt, setReviewApt] = useState<Appointment | null>(null);

  // Fetch real stores only
  const loadStores = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.stores.list({
        lang,
        limit: 50,
        q: keyword || undefined,
        address_state_code: stateCode || undefined,
        address_city_code: cityCode || undefined,
      });
      const realStores = res.items || [];

      // Fetch services for each store in parallel
      const withServices = await Promise.all(
        realStores.map(async (store) => {
          try {
            const svcRes = await api.stores.services.list(store.id, lang);
            return storeToDisplay(store, svcRes.items || []);
          } catch {
            return storeToDisplay(store, []);
          }
        }),
      );

      // Filter by category client-side if needed
      const filtered = category
        ? withServices.filter(s => s.category.toLowerCase().includes(category.toLowerCase()))
        : withServices;

      setStores(filtered);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, [lang, keyword, stateCode, cityCode, category]);

  useEffect(() => { void loadStores(); }, [loadStores]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => setKeyword(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  function handleStateChange(val: string) {
    setStateCode(val);
    setCityCode('');
  }

  function openDetail(store: DisplayStore) {
    setDetailStore(store);
  }

  function openBooking(store: DisplayStore, service?: DisplayStore['services'][0] | null) {
    setBookingStore(store);
    setBookingService(service || null);
  }

  async function handleCancel() {
    if (!cancelModalId) return;
    setCancellingId(cancelModalId);
    try {
      await api.appointments.cancel(cancelModalId, cancelReason || undefined);
      setCancelModalId('');
      setCancelReason('');
      onRefresh();
    } catch {
      // silently fail
    } finally {
      setCancellingId('');
    }
  }

  const statusIcon: Record<string, string> = {
    pending: '\uD83D\uDD52', confirmed: '\u2705', completed: '\u2702\uFE0F',
    rejected: '\u274C', cancelled: '\u26D4',
  };

  const filteredAppointments = appointments
    .filter(a => !selectedPet || !a.pet_id || a.pet_id === selectedPet.id)
    .filter(a => !a.deleted_at)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <>
      {/* ── My Bookings (collapsible) ── */}
      {filteredAppointments.length > 0 && (
        <div className="pf-gd-section">
          <div className="pf-gd-section-header" style={{ cursor: 'pointer' }} onClick={() => setAptCollapsed(!aptCollapsed)}>
            <span>{t('guardian.store.my_bookings', 'My Bookings')} ({filteredAppointments.length})</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{aptCollapsed ? '\u25BC' : '\u25B2'}</span>
          </div>
          {!aptCollapsed && (
            <div className="pf-gd-section-body" style={{ display: 'grid', gap: 8 }}>
              {filteredAppointments.map(apt => (
                <div key={apt.id} className="gm-apt-card">
                  <div className="gm-apt-card-icon">{statusIcon[apt.status] || '\uD83D\uDCC5'}</div>
                  <div className="gm-apt-card-body">
                    <div className="gm-apt-card-header">
                      <span className="gm-apt-card-title">{apt.store_name || apt.supplier_name || apt.supplier_id.slice(0, 8)}</span>
                      <span className={`gm-status-badge ${apt.status}`}>{t(`supplier.appointment.status.${apt.status}`, apt.status)}</span>
                    </div>
                    <div className="gm-apt-card-meta">
                      {apt.service_type && <span>{apt.service_type}</span>}
                      <span>{formatDate(apt.scheduled_at, '-', locale)}</span>
                      {apt.is_overtime && <span className="gm-overtime-badge" style={{ fontSize: 10, padding: '1px 6px' }}>{t('booking.slot.overtime', 'OT')}</span>}
                      {apt.price != null && apt.price > 0 && <span>{apt.price.toLocaleString()}</span>}
                    </div>
                    <div className="gm-apt-card-actions">
                      {apt.status === 'completed' && (
                        <button className="btn btn-primary btn-sm" onClick={() => onOpenGroomingApproval(apt)}>
                          {t('grooming.guardian.noti_title', 'View Report')}
                        </button>
                      )}
                      {(apt.status === 'completed') && !apt.has_guardian_review && (
                        <button className="btn btn-secondary btn-sm" onClick={() => setReviewApt(apt)}>
                          {t('booking.review.write_btn', 'Write Review')}
                        </button>
                      )}
                      {apt.status === 'completed' && !!apt.has_guardian_review && (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', alignSelf: 'center' }}>{t('booking.review.written', 'Review Written')}</span>
                      )}
                      {(apt.status === 'pending' || apt.status === 'confirmed') && (
                        <button className="btn btn-danger btn-sm" onClick={() => { setCancelModalId(apt.id); setCancelReason(''); }}>
                          {t('booking.cancel_btn', 'Cancel')}
                        </button>
                      )}
                    </div>
                    {apt.cancelled_reason && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                        {t('booking.cancel_reason', 'Reason')}: {apt.cancelled_reason}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cancel confirmation modal */}
      {cancelModalId && (
        <div className="modal-overlay" onClick={() => setCancelModalId('')}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{t('booking.cancel_confirm_title', 'Cancel Booking?')}</h3>
              <button className="modal-close" onClick={() => setCancelModalId('')}>&times;</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>{t('booking.cancel_confirm_desc', 'This action cannot be undone.')}</p>
              <textarea
                className="form-input"
                rows={2}
                placeholder={t('booking.cancel_reason', 'Reason (optional)')}
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setCancelModalId('')}>{t('common.cancel', 'Cancel')}</button>
              <button className="btn btn-danger" disabled={!!cancellingId} onClick={handleCancel}>
                {cancellingId ? '...' : t('booking.cancel_btn', 'Cancel Booking')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review write modal */}
      {reviewApt && (
        <ReviewWriteModal
          appointment={reviewApt}
          onClose={() => setReviewApt(null)}
          onSuccess={() => { setReviewApt(null); onRefresh(); }}
        />
      )}

      {/* ── Filter Bar ── */}
      <div className="gm-store-filter-bar">
        <div className="gm-store-filter-row">
          <select
            className="gm-store-filter-select"
            value={stateCode}
            onChange={e => handleStateChange(e.target.value)}
          >
            <option value="">{t('guardian.store.filter.all_areas', 'All Areas')}</option>
            {KOREAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {stateCode && (
            <input
              className="gm-store-filter-select"
              placeholder={t('guardian.store.filter.city', 'City')}
              value={cityCode}
              onChange={e => setCityCode(e.target.value)}
              style={{ flex: 1 }}
            />
          )}
          <div className="gm-store-filter-search-wrap">
            <input
              className="gm-store-filter-search"
              placeholder={t('guardian.store.filter.search', 'Search stores...')}
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button className="gm-store-filter-clear" onClick={() => { setSearchInput(''); setKeyword(''); }}>&times;</button>
            )}
          </div>
        </div>

        <div className="gm-store-category-chips">
          {CATEGORY_CHIPS.map(chip => (
            <button
              key={chip.key}
              className={`gm-store-category-chip${category === chip.key ? ' active' : ''}`}
              onClick={() => setCategory(chip.key)}
            >
              {chip.key && catEmoji[chip.key] ? `${catEmoji[chip.key]} ` : ''}{t(chip.i18nKey, chip.key || 'All')}
            </button>
          ))}
        </div>
      </div>

      {/* ── Store Cards ── */}
      <div style={{ marginTop: 8 }}>
        {loading ? (
          <div className="pf-gd-empty" style={{ padding: '40px 0' }}>
            <p>{t('common.loading', 'Loading...')}</p>
          </div>
        ) : error ? (
          <div className="pf-gd-empty" style={{ padding: '40px 0' }}>
            <div className="pf-gd-empty-icon">{'\u26A0\uFE0F'}</div>
            <p style={{ fontWeight: 600, color: '#ef4444' }}>{error}</p>
            <button className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={() => void loadStores()}>
              {t('common.retry', 'Retry')}
            </button>
          </div>
        ) : stores.length === 0 ? (
          <div className="pf-gd-empty" style={{ padding: '40px 0' }}>
            <div className="pf-gd-empty-icon">{'\uD83C\uDFEA'}</div>
            <p style={{ fontWeight: 600 }}>{t('guardian.store.card.no_results', 'No stores found')}</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t('guardian.store.card.no_results_desc', 'Try adjusting your filters')}</p>
          </div>
        ) : (
          <div className="gm-store-list">
            {stores.map(store => (
              <div key={store.id} className="gm-store-explore-card" onClick={() => openDetail(store)}>
                <div className="gm-store-card-photo">
                  {store.avatarUrl ? (
                    <img src={store.avatarUrl} alt="" />
                  ) : (
                    <div className="gm-store-card-photo-placeholder">
                      {catEmoji[store.category] || '\uD83C\uDFEA'}
                    </div>
                  )}
                </div>
                <div className="gm-store-card-info">
                  <div className="gm-store-card-title-row">
                    <strong className="gm-store-card-name">{store.displayName}</strong>
                    {store.category && (
                      <span className="gm-store-card-badge">{t(`guardian.store.filter.${store.category}`, store.category)}</span>
                    )}
                  </div>
                  {store.addressText && (
                    <div className="gm-store-card-address">{store.addressText}</div>
                  )}
                  <div className="gm-store-card-meta">
                    {store.rating > 0 && (
                      <span className="gm-store-card-rating">
                        {'\u2B50'} {store.rating.toFixed(1)}
                        <span className="gm-store-card-reviews">({store.reviewCount} {t('guardian.store.card.reviews', 'reviews')})</span>
                      </span>
                    )}
                    {store.services.length > 0 && (
                      <span className="gm-store-card-service-count">
                        {store.services.length} {t('guardian.store.detail.tab_services', 'Services')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="gm-store-card-action">
                  <button
                    className="btn btn-primary btn-sm gm-store-book-btn"
                    onClick={e => {
                      e.stopPropagation();
                      openBooking(store);
                    }}
                  >
                    {t('guardian.store.card.book_btn', 'Book Now')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Store Detail Modal ── */}
      {detailStore && (
        <StoreDetailModal
          store={detailStore}
          onClose={() => setDetailStore(null)}
          onBook={(service) => {
            const ds = detailStore;
            setDetailStore(null);
            openBooking(ds, service);
          }}
        />
      )}

      {/* ── Step Booking Modal ── */}
      {bookingStore && (
        <StepBookingModal
          store={bookingStore}
          initialService={bookingService}
          pets={pets}
          onClose={() => { setBookingStore(null); setBookingService(null); }}
          onSuccess={() => {
            setBookingStore(null);
            setBookingService(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
