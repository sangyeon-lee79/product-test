import { useCallback, useEffect, useState } from 'react';
import { api, type Appointment, type DummyStore, type Pet, type Store, type StoreService } from '../../lib/api';
import { useI18n, useT } from '../../lib/i18n';
import { BCP47_LOCALE_MAP, type Lang } from '@petfolio/shared';
import StoreDetailModal from './StoreDetailModal';
import StepBookingModal from './StepBookingModal';
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

/* ─── Unified display store ───────────────────────────────────────────── */

interface DisplayStore {
  id: string;
  displayName: string;
  displayDescription: string;
  category: string;
  addressText: string;
  rating: number;
  reviewCount: number;
  isDemo: boolean;
  avatarUrl?: string | null;
  services: { id: string; displayName: string; price: number | null; durationMin: number | null }[];
  // For real store booking
  supplierId?: string;
  storeId?: string;
}

function realToDisplay(s: Store, services: StoreService[]): DisplayStore {
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
      durationMin: null,
    })),
    supplierId: s.owner_id,
    storeId: s.id,
  };
}

function dummyToDisplay(d: DummyStore): DisplayStore {
  const addr = d.address;
  return {
    id: d.id,
    displayName: d.display_name || '',
    displayDescription: d.display_description || '',
    category: d.category || '',
    addressText: addr ? [addr.state_code, addr.city_code, addr.detail].filter(Boolean).join(' ') : '',
    rating: d.rating || 0,
    reviewCount: d.review_count || 0,
    isDemo: true,
    avatarUrl: null,
    services: (d.services || []).map(svc => ({
      id: svc.id,
      displayName: svc.display_name || '',
      price: svc.price,
      durationMin: svc.duration_min,
    })),
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
  const [loading, setLoading] = useState(false);
  const [, setIsUsingDummy] = useState(false);

  // Detail modal
  const [detailStore, setDetailStore] = useState<DisplayStore | null>(null);

  // Booking modal
  const [bookingStore, setBookingStore] = useState<DisplayStore | null>(null);
  const [bookingService, setBookingService] = useState<{ id: string; displayName: string; price: number | null; durationMin: number | null } | null>(null);

  // Appointments collapse
  const [aptCollapsed, setAptCollapsed] = useState(false);

  // Fetch stores
  const loadStores = useCallback(async () => {
    setLoading(true);
    try {
      // Try real stores first
      const res = await api.stores.list({
        lang,
        limit: 50,
        q: keyword || undefined,
        address_state_code: stateCode || undefined,
        address_city_code: cityCode || undefined,
      });
      const realStores = res.items || [];

      if (realStores.length > 0) {
        // Fetch services for each store in parallel
        const withServices = await Promise.all(
          realStores.map(async (store) => {
            try {
              const svcRes = await api.stores.services.list(store.id, lang);
              return realToDisplay(store, svcRes.items || []);
            } catch {
              return realToDisplay(store, []);
            }
          }),
        );
        // Filter by category client-side if needed
        const filtered = category
          ? withServices.filter(s => s.category.toLowerCase().includes(category.toLowerCase()))
          : withServices;
        setStores(filtered);
        setIsUsingDummy(false);
      } else {
        // Fallback to dummy stores
        const dummyRes = await api.dummyStores.list({
          lang,
          limit: 50,
          category: category || undefined,
          state_code: stateCode || undefined,
          city_code: cityCode || undefined,
          q: keyword || undefined,
        });
        setStores((dummyRes.items || []).map(dummyToDisplay));
        setIsUsingDummy(true);
      }
    } catch {
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

  // Category emoji map
  const catEmoji: Record<string, string> = {
    grooming: '\u2702\uFE0F', hospital: '\uD83C\uDFE5', hotel: '\uD83C\uDFE8',
    training: '\uD83C\uDFAF', shop: '\uD83D\uDED2', cafe: '\u2615', photo: '\uD83D\uDCF7',
  };

  function openDetail(store: DisplayStore) {
    setDetailStore(store);
  }

  function openBooking(store: DisplayStore, service?: typeof bookingService) {
    setBookingStore(store);
    setBookingService(service || null);
  }

  const filteredAppointments = appointments
    .filter(a => !selectedPet || !a.pet_id || a.pet_id === selectedPet.id)
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
            <div className="pf-gd-section-body">
              {filteredAppointments.map(apt => (
                <div
                  key={apt.id}
                  className="pf-gd-tl-card"
                  style={{ cursor: apt.status === 'completed' ? 'pointer' : undefined }}
                  onClick={() => { if (apt.status === 'completed') onOpenGroomingApproval(apt); }}
                >
                  <div className="pf-gd-tl-icon">{apt.status === 'completed' ? '\u2702\uFE0F' : '\uD83D\uDCC5'}</div>
                  <div className="pf-gd-tl-body">
                    <span>{apt.supplier_name || apt.supplier_id.slice(0, 8)}</span>
                    <span className="pf-gd-tl-sep">&middot;</span>
                    <span style={{ fontWeight: 500 }}>{t(`supplier.appointment.status.${apt.status}`, apt.status)}</span>
                    {apt.service_type && <><span className="pf-gd-tl-sep">&middot;</span><span>{apt.service_type}</span></>}
                    <span className="pf-gd-tl-sep">&middot;</span>
                    <span className="pf-gd-tl-time">{formatDate(apt.scheduled_at, '-', locale)}</span>
                    {apt.status === 'completed' && (
                      <span style={{ marginLeft: 6, fontSize: 11, color: '#E87C2B', fontWeight: 600 }}>{t('grooming.guardian.noti_title', 'Review')}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Filter Bar ── */}
      <div className="gm-store-filter-bar">
        {/* Region selectors */}
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

        {/* Category chips */}
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
      <div className="pf-gd-section" style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}>
        {loading ? (
          <div className="pf-gd-empty" style={{ padding: '40px 0' }}>
            <p>{t('common.loading', 'Loading...')}</p>
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
                    {store.isDemo && (
                      <span className="gm-store-card-demo-badge">{t('guardian.store.card.demo', 'Demo')}</span>
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
                    disabled={store.isDemo}
                    onClick={e => {
                      e.stopPropagation();
                      if (!store.isDemo) openBooking(store);
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
            setDetailStore(null);
            openBooking(detailStore, service);
          }}
        />
      )}

      {/* ── Step Booking Modal ── */}
      {bookingStore && !bookingStore.isDemo && (
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
