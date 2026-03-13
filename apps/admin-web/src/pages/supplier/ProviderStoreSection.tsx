import { useEffect, useState, useCallback, useMemo } from 'react';
import { api } from '../../lib/api';
import type { Store, StoreService, ServiceDiscount, StoreIndustry, Country } from '../../types/api';
import { useI18n, useT } from '../../lib/i18n';
import { BUSINESS_CATEGORIES, BUSINESS_MAP } from '../../data/businessCategories';
import { COUNTRY_REGIONS } from '../../data/countryRegions';
import { TranslationPopup } from '../../components/TranslationPopup';
import { emptyTrans } from '../../lib/catalogUtils';

type Modal = 'store' | 'service' | 'discount' | null;
type ModalMode = 'create' | 'edit';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const DAY_LABELS: Record<string, string> = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
type DayHours = { open: string; close: string; closed?: boolean };
type OperatingHours = Record<string, DayHours>;

const DEFAULT_HOURS: OperatingHours = Object.fromEntries(
  DAYS.map(d => [d, d === 'sun' ? { open: '09:00', close: '21:00', closed: true } : { open: '09:00', close: '21:00' }])
);

const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:00`);
  TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:30`);
}

export default function ProviderStoreSection() {
  const t = useT();
  const { lang } = useI18n();

  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<(Store & { industries: StoreIndustry[]; services: StoreService[] }) | null>(null);
  const [discounts, setDiscounts] = useState<Record<string, ServiceDiscount[]>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal state
  const [modal, setModal] = useState<Modal>(null);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [saving, setSaving] = useState(false);

  // Store form
  const [storeForm, setStoreForm] = useState({
    name: '', description: '', address: '', phone: '',
    country_id: '', currency_id: '', latitude: '', longitude: '', avatar_url: '',
    business_type: '', business_subtype: '',
    address_state_code: '', address_city_code: '', address_detail: '',
  });
  const [storeNameTrans, setStoreNameTrans] = useState<Record<string, string>>(emptyTrans());
  const [storeDescTrans, setStoreDescTrans] = useState<Record<string, string>>(emptyTrans());
  const [storeHours, setStoreHours] = useState<OperatingHours>({ ...DEFAULT_HOURS });
  const [selectedIndustryIds, setSelectedIndustryIds] = useState<string[]>([]);
  const [editStoreId, setEditStoreId] = useState('');

  // Service form
  const [serviceForm, setServiceForm] = useState({ name: '', description: '', price: '', sort_order: '0', duration_minutes: '' });
  const [serviceNameTrans, setServiceNameTrans] = useState<Record<string, string>>(emptyTrans());
  const [serviceDescTrans, setServiceDescTrans] = useState<Record<string, string>>(emptyTrans());
  const [editServiceId, setEditServiceId] = useState('');

  // Discount form
  const [discountForm, setDiscountForm] = useState({ discount_rate: '', start_date: '', end_date: '' });
  const [discountServiceId, setDiscountServiceId] = useState('');

  // Reference data
  const [countries, setCountries] = useState<Country[]>([]);

  // Business type L2 options (derived from L1 selection)
  const businessSubOptions = useMemo(() => {
    const cat = BUSINESS_MAP[storeForm.business_type];
    return cat ? cat.subs : [];
  }, [storeForm.business_type]);

  // Address: resolve region/city options from selected country
  const selectedCountryCode = useMemo(() => {
    if (!storeForm.country_id) return '';
    const c = countries.find(x => x.id === storeForm.country_id);
    return c?.code || '';
  }, [storeForm.country_id, countries]);

  const regionOptions = useMemo(() => {
    if (!selectedCountryCode) return [];
    return COUNTRY_REGIONS[selectedCountryCode] || [];
  }, [selectedCountryCode]);

  const cityOptions = useMemo(() => {
    if (!storeForm.address_state_code || regionOptions.length === 0) return [];
    const region = regionOptions.find(r => r.name === storeForm.address_state_code);
    return region?.cities || [];
  }, [storeForm.address_state_code, regionOptions]);

  useEffect(() => {
    api.countries.publicList().then(setCountries).catch(() => {});
  }, [lang]);

  const loadStores = useCallback(async () => {
    try {
      const res = await api.stores.my(lang);
      setStores(res.items || []);
    } catch (e) { setError(String(e)); }
  }, [lang]);

  useEffect(() => { loadStores(); }, [loadStores]);

  const selectStore = useCallback(async (id: string) => {
    try {
      const detail = await api.stores.get(id, lang);
      setSelectedStore(detail);
      const discMap: Record<string, ServiceDiscount[]> = {};
      for (const svc of detail.services || []) {
        try {
          const res = await api.stores.discounts.list(svc.id);
          discMap[svc.id] = res.items;
        } catch { /* ignore */ }
      }
      setDiscounts(discMap);
    } catch (e) { setError(String(e)); }
  }, [lang]);

  const flash = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };

  // ─── Helpers: resolve display labels ────────────────────────────────
  const getBusinessLabel = (type?: string | null, subtype?: string | null) => {
    if (!type) return '';
    const cat = BUSINESS_MAP[type];
    if (!cat) return type;
    const l1 = t(cat.i18nKey, type);
    if (!subtype) return l1;
    const sub = cat.subs.find(s => s.code === subtype);
    return sub ? `${l1} > ${t(sub.i18nKey, subtype)}` : l1;
  };

  const getAddressLabel = (store: Store) => {
    const parts: string[] = [];
    if (store.address_state_code) parts.push(store.address_state_code);
    if (store.address_city_code) parts.push(store.address_city_code);
    if (store.address_detail) parts.push(store.address_detail);
    return parts.length > 0 ? parts.join(' ') : (store.address || '-');
  };

  // ─── Store CRUD ───────────────────────────────────────────────────────
  const openStoreModal = (mode: ModalMode, store?: Store & { industries?: StoreIndustry[] }) => {
    setModalMode(mode);
    setModal('store');
    if (mode === 'edit' && store) {
      setEditStoreId(store.id);
      setStoreForm({
        name: store.name || '', description: store.description || '',
        address: store.address || '', phone: store.phone || '',
        country_id: store.country_id || '', currency_id: store.currency_id || '',
        latitude: store.latitude != null ? String(store.latitude) : '',
        longitude: store.longitude != null ? String(store.longitude) : '',
        avatar_url: store.avatar_url || '',
        business_type: store.business_type || '',
        business_subtype: store.business_subtype || '',
        address_state_code: store.address_state_code || '',
        address_city_code: store.address_city_code || '',
        address_detail: store.address_detail || '',
      });
      setStoreNameTrans({ ...emptyTrans(), ...(store.name_translations || {}) });
      setStoreDescTrans({ ...emptyTrans(), ...(store.description_translations || {}) });
      setStoreHours(store.operating_hours ? { ...DEFAULT_HOURS, ...store.operating_hours } : { ...DEFAULT_HOURS });
      setSelectedIndustryIds((store.industries || []).map(i => i.industry_id));
    } else {
      setEditStoreId('');
      setStoreForm({
        name: '', description: '', address: '', phone: '',
        country_id: '', currency_id: '', latitude: '', longitude: '', avatar_url: '',
        business_type: '', business_subtype: '',
        address_state_code: '', address_city_code: '', address_detail: '',
      });
      setStoreNameTrans(emptyTrans());
      setStoreDescTrans(emptyTrans());
      setStoreHours({ ...DEFAULT_HOURS });
      setSelectedIndustryIds([]);
    }
  };

  const saveStore = async () => {
    if (!storeForm.name.trim()) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: storeForm.name.trim(),
        name_translations: storeNameTrans,
        description: storeForm.description || undefined,
        description_translations: storeDescTrans,
        address: storeForm.address || undefined,
        phone: storeForm.phone || undefined,
        country_id: storeForm.country_id || undefined,
        currency_id: storeForm.currency_id || undefined,
        latitude: storeForm.latitude ? parseFloat(storeForm.latitude) : undefined,
        longitude: storeForm.longitude ? parseFloat(storeForm.longitude) : undefined,
        avatar_url: storeForm.avatar_url || undefined,
        industry_ids: selectedIndustryIds,
        operating_hours: storeHours,
        business_type: storeForm.business_type || undefined,
        business_subtype: storeForm.business_subtype || undefined,
        address_state_code: storeForm.address_state_code || undefined,
        address_city_code: storeForm.address_city_code || undefined,
        address_detail: storeForm.address_detail || undefined,
      };
      if (modalMode === 'edit') {
        await api.stores.update(editStoreId, payload);
        flash(t('provider.store.alert.updated', 'Store updated'));
      } else {
        await api.stores.create(payload);
        flash(t('provider.store.alert.created', 'Store created'));
      }
      setModal(null);
      await loadStores();
      if (editStoreId) selectStore(editStoreId);
    } catch (e) { setError(String(e)); }
    setSaving(false);
  };

  const handleDeleteStore = async (id: string) => {
    if (!confirm(t('provider.store.delete_confirm', 'Delete this store?'))) return;
    try {
      await api.stores.delete(id);
      flash(t('provider.store.alert.deleted', 'Store deleted'));
      await loadStores();
      if (selectedStore?.id === id) setSelectedStore(null);
    } catch (e) { setError(String(e)); }
  };

  // ─── Service CRUD ─────────────────────────────────────────────────────
  const openServiceModal = (mode: ModalMode, svc?: StoreService) => {
    setModalMode(mode);
    setModal('service');
    if (mode === 'edit' && svc) {
      setEditServiceId(svc.id);
      setServiceForm({
        name: svc.name || '', description: svc.description || '',
        price: svc.price != null ? String(svc.price) : '', sort_order: String(svc.sort_order || 0),
        duration_minutes: svc.duration_minutes != null ? String(svc.duration_minutes) : '',
      });
      setServiceNameTrans({ ...emptyTrans(), ...(svc.name_translations || {}) });
      setServiceDescTrans({ ...emptyTrans(), ...(svc.description_translations || {}) });
    } else {
      setEditServiceId('');
      setServiceForm({ name: '', description: '', price: '', sort_order: '0', duration_minutes: '' });
      setServiceNameTrans(emptyTrans());
      setServiceDescTrans(emptyTrans());
    }
  };

  const saveService = async () => {
    if (!selectedStore || !serviceForm.name.trim()) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: serviceForm.name.trim(),
        name_translations: serviceNameTrans,
        description: serviceForm.description || undefined,
        description_translations: serviceDescTrans,
        price: serviceForm.price ? parseFloat(serviceForm.price) : undefined,
        duration_minutes: serviceForm.duration_minutes ? parseInt(serviceForm.duration_minutes) : undefined,
        sort_order: parseInt(serviceForm.sort_order) || 0,
      };
      if (modalMode === 'edit') {
        await api.stores.services.update(editServiceId, payload);
        flash(t('provider.store.service.edit', 'Service updated'));
      } else {
        await api.stores.services.create(selectedStore.id, payload);
        flash(t('provider.store.service.add', 'Service added'));
      }
      setModal(null);
      selectStore(selectedStore.id);
    } catch (e) { setError(String(e)); }
    setSaving(false);
  };

  const deleteService = async (serviceId: string) => {
    if (!selectedStore) return;
    try {
      await api.stores.services.delete(serviceId);
      flash(t('admin.service.alert.deleted', 'Service deleted'));
      selectStore(selectedStore.id);
    } catch (e) { setError(String(e)); }
  };

  // ─── Discount CRUD ────────────────────────────────────────────────────
  const openDiscountModal = (serviceId: string) => {
    setDiscountServiceId(serviceId);
    setDiscountForm({ discount_rate: '', start_date: '', end_date: '' });
    setModal('discount');
  };

  const saveDiscount = async () => {
    if (!discountForm.discount_rate) return;
    setSaving(true);
    try {
      await api.stores.discounts.create(discountServiceId, {
        discount_rate: parseFloat(discountForm.discount_rate),
        start_date: discountForm.start_date || undefined,
        end_date: discountForm.end_date || undefined,
      });
      flash(t('provider.store.discount.add', 'Discount added'));
      setModal(null);
      if (selectedStore) selectStore(selectedStore.id);
    } catch (e) { setError(String(e)); }
    setSaving(false);
  };

  const deleteDiscount = async (discountId: string) => {
    try {
      await api.stores.discounts.delete(discountId);
      flash(t('admin.discount.alert.deleted', 'Discount deleted'));
      if (selectedStore) selectStore(selectedStore.id);
    } catch (e) { setError(String(e)); }
  };

  return (
    <section className="card">
      <div className="card-header">
        <div className="card-title">{t('provider.store.my_stores', 'My Stores')}</div>
        <button className="btn btn-primary btn-sm" onClick={() => openStoreModal('create')}>
          + {t('provider.store.create', 'Add Store')}
        </button>
      </div>
      <div className="card-body" style={{ display: 'grid', gap: 16 }}>
        {error && <div className="alert alert-error">{error} <button onClick={() => setError('')} style={{ float: 'right', border: 0, background: 'none', cursor: 'pointer' }}>x</button></div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, minHeight: 300 }}>
          {/* ─── Left: Store List ─── */}
          <div style={{ borderRight: '1px solid var(--border)', paddingRight: 16 }}>
            {stores.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{t('provider.store.no_stores', 'No stores yet')}</p>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {stores.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => selectStore(s.id)}
                    style={{
                      border: selectedStore?.id === s.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                      borderRadius: 8, padding: 12, textAlign: 'left', cursor: 'pointer',
                      background: selectedStore?.id === s.id ? '#fff7ed' : 'var(--surface)',
                    }}
                  >
                    <strong>{s.display_name || s.name}</strong>
                    <div className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>
                      {getAddressLabel(s)}
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
                      <span className={`badge ${s.status === 'active' ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: 10 }}>
                        {s.status}
                      </span>
                      {s.business_type && (
                        <span className="badge badge-amber" style={{ fontSize: 10 }}>
                          {getBusinessLabel(s.business_type, s.business_subtype)}
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {t('provider.store.services_count', '{count} services').replace('{count}', String(s.service_count || 0))}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Right: Store Detail ─── */}
          <div>
            {!selectedStore ? (
              <div style={{ color: 'var(--text-muted)', padding: 24, textAlign: 'center' }}>
                {t('provider.store.select_store', 'Select a store')}
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 16 }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{selectedStore.display_name || selectedStore.name}</h3>
                    <div className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>
                      {getAddressLabel(selectedStore)} &middot; {selectedStore.phone || '-'}
                    </div>
                    <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {selectedStore.business_type && (
                        <span className="badge badge-amber" style={{ fontSize: 10 }}>
                          {getBusinessLabel(selectedStore.business_type, selectedStore.business_subtype)}
                        </span>
                      )}
                      {selectedStore.industries?.length > 0 && selectedStore.industries.map(ind => (
                        <span key={ind.industry_id} className="badge badge-amber" style={{ fontSize: 10 }}>
                          {ind.display_label || ind.industry_key}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openStoreModal('edit', selectedStore)}>
                      {t('provider.store.edit', 'Edit')}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => void handleDeleteStore(selectedStore.id)}>
                      {t('admin.common.delete', 'Delete')}
                    </button>
                  </div>
                </div>

                {/* Services */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <strong>{t('admin.store.form.services', 'Services')}</strong>
                    <button className="btn btn-secondary btn-sm" onClick={() => openServiceModal('create')}>
                      + {t('provider.store.service.add', 'Add Service')}
                    </button>
                  </div>
                  {(selectedStore.services || []).length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t('provider.store.no_services', 'No services yet')}</p>
                  ) : (
                    <div style={{ display: 'grid', gap: 8 }}>
                      {selectedStore.services.map(svc => (
                        <div key={svc.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <strong>{svc.display_name || svc.name}</strong>
                              {svc.duration_minutes != null && (
                                <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                                  {svc.duration_minutes}{t('booking.minutes', 'min')}
                                </span>
                              )}
                              {svc.price != null && (
                                <span style={{ marginLeft: 8, color: 'var(--primary)', fontWeight: 600 }}>
                                  {svc.currency_code || ''} {svc.price.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button className="btn btn-secondary btn-sm" onClick={() => openServiceModal('edit', svc)}>
                                {t('provider.store.service.edit', 'Edit')}
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => void deleteService(svc.id)}>x</button>
                            </div>
                          </div>
                          {svc.display_description && (
                            <div className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>{svc.display_description}</div>
                          )}
                          {/* Discounts */}
                          <div style={{ marginTop: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
                                {t('admin.store.form.discounts', 'Discounts')}
                              </span>
                              <button
                                className="btn btn-secondary"
                                style={{ fontSize: 10, padding: '2px 6px' }}
                                onClick={() => openDiscountModal(svc.id)}
                              >
                                + {t('provider.store.discount.add', 'Add')}
                              </button>
                            </div>
                            {(discounts[svc.id] || []).map(disc => (
                              <div key={disc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, fontSize: 12 }}>
                                <span>{disc.discount_rate}% &middot; {disc.start_date || '?'} ~ {disc.end_date || '?'}</span>
                                <button className="btn btn-danger" style={{ fontSize: 10, padding: '1px 4px' }} onClick={() => void deleteDiscount(disc.id)}>x</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Modals ─── */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Store Modal */}
            {modal === 'store' && (
              <>
                <div className="modal-header">
                  <div className="modal-title">
                    {modalMode === 'edit' ? t('provider.store.edit', 'Edit Store') : t('provider.store.create', 'Add Store')}
                  </div>
                  <button className="modal-close" onClick={() => setModal(null)}>x</button>
                </div>
                <div className="modal-body" style={{ display: 'grid', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">
                      {t('admin.store.form.name', 'Name')} *
                      <TranslationPopup label={t('admin.store.form.name', 'Name')} sourceText={storeForm.name} translations={storeNameTrans} onChange={setStoreNameTrans} t={t} />
                    </label>
                    <input className="form-input" value={storeForm.name} onChange={e => setStoreForm({ ...storeForm, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      {t('admin.store.form.description', 'Description')}
                      <TranslationPopup label={t('admin.store.form.description', 'Description')} sourceText={storeForm.description} translations={storeDescTrans} onChange={setStoreDescTrans} t={t} />
                    </label>
                    <textarea className="form-textarea" value={storeForm.description} onChange={e => setStoreForm({ ...storeForm, description: e.target.value })} />
                  </div>

                  {/* ─── Business Type L1/L2 ─── */}
                  <div className="form-row col2">
                    <div className="form-group">
                      <label className="form-label">{t('store.business.type', 'Business Type')}</label>
                      <select className="form-select" value={storeForm.business_type}
                        onChange={e => setStoreForm({ ...storeForm, business_type: e.target.value, business_subtype: '' })}>
                        <option value="">{t('store.business.select_type', 'Select Type')}</option>
                        {BUSINESS_CATEGORIES.map(c => (
                          <option key={c.code} value={c.code}>{t(c.i18nKey, c.code)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('store.business.subtype', 'Sub Category')}</label>
                      <select className="form-select" value={storeForm.business_subtype}
                        onChange={e => setStoreForm({ ...storeForm, business_subtype: e.target.value })}
                        disabled={!storeForm.business_type}>
                        <option value="">{t('store.business.select_subtype', 'Select Sub Type')}</option>
                        {businessSubOptions.map(s => (
                          <option key={s.code} value={s.code}>{t(s.i18nKey, s.code)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* ─── Country + Phone ─── */}
                  <div className="form-row col2">
                    <div className="form-group">
                      <label className="form-label">{t('admin.store.form.country', 'Country')}</label>
                      <select className="form-select" value={storeForm.country_id}
                        onChange={e => setStoreForm({ ...storeForm, country_id: e.target.value, address_state_code: '', address_city_code: '' })}>
                        <option value="">-</option>
                        {countries.map(c => <option key={c.id} value={c.id}>{c.ko_name || c.name_key}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('admin.store.form.phone', 'Phone')}</label>
                      <input className="form-input" value={storeForm.phone} onChange={e => setStoreForm({ ...storeForm, phone: e.target.value })} />
                    </div>
                  </div>

                  {/* ─── Address: State/City/Detail ─── */}
                  {regionOptions.length > 0 ? (
                    <>
                      <div className="form-row col2">
                        <div className="form-group">
                          <label className="form-label">{t('store.address.state', 'State/Province')}</label>
                          <select className="form-select" value={storeForm.address_state_code}
                            onChange={e => setStoreForm({ ...storeForm, address_state_code: e.target.value, address_city_code: '' })}>
                            <option value="">{t('store.address.select_state', 'Select State')}</option>
                            {regionOptions.map(r => (
                              <option key={r.name} value={r.name}>{r.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">{t('store.address.city', 'City/District')}</label>
                          {cityOptions.length > 0 ? (
                            <select className="form-select" value={storeForm.address_city_code}
                              onChange={e => setStoreForm({ ...storeForm, address_city_code: e.target.value })}
                              disabled={!storeForm.address_state_code}>
                              <option value="">{t('store.address.select_city', 'Select City')}</option>
                              {cityOptions.map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          ) : (
                            <input className="form-input" value={storeForm.address_city_code}
                              onChange={e => setStoreForm({ ...storeForm, address_city_code: e.target.value })}
                              placeholder={t('store.address.select_city', 'City/District')}
                              disabled={!storeForm.address_state_code} />
                          )}
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">{t('store.address.detail', 'Detail Address')}</label>
                        <input className="form-input" value={storeForm.address_detail}
                          onChange={e => setStoreForm({ ...storeForm, address_detail: e.target.value })}
                          placeholder={t('store.address.detail_placeholder', 'Enter detail address')} />
                      </div>
                    </>
                  ) : (
                    <div className="form-group">
                      <label className="form-label">{t('admin.store.form.address', 'Address')}</label>
                      <input className="form-input" value={storeForm.address} onChange={e => setStoreForm({ ...storeForm, address: e.target.value })} />
                    </div>
                  )}

                  {/* ─── Operating Hours ─── */}
                  <div className="form-group">
                    <label className="form-label">{t('supplier.settings.hours_title', 'Operating Hours')}</label>
                    <div className="sp-hours-grid">
                      {DAYS.map(day => {
                        const h = storeHours[day] || { open: '09:00', close: '21:00' };
                        const isClosed = !!h.closed;
                        return (
                          <div key={day} className={`sp-hours-row${isClosed ? ' closed' : ''}`}>
                            <input
                              type="checkbox"
                              checked={!isClosed}
                              onChange={e => setStoreHours(prev => ({ ...prev, [day]: { ...prev[day], closed: !e.target.checked } }))}
                              style={{ accentColor: 'var(--primary)' }}
                            />
                            <span className="sp-hours-day">{DAY_LABELS[day]}</span>
                            {isClosed ? (
                              <span className="sp-hours-closed-label">{t('supplier.settings.closed', 'Closed')}</span>
                            ) : (
                              <div className="sp-hours-time">
                                <select value={h.open} onChange={e => setStoreHours(prev => ({ ...prev, [day]: { ...prev[day], open: e.target.value } }))}>
                                  {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <span className="sp-hours-separator">~</span>
                                <select value={h.close} onChange={e => setStoreHours(prev => ({ ...prev, [day]: { ...prev[day], close: e.target.value } }))}>
                                  {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t('admin.store.form.avatar', 'Avatar URL')}</label>
                    <input className="form-input" value={storeForm.avatar_url} onChange={e => setStoreForm({ ...storeForm, avatar_url: e.target.value })} />
                  </div>
                  <button className="btn btn-primary" onClick={() => void saveStore()} disabled={saving}>
                    {saving ? '...' : t('admin.common.save', 'Save')}
                  </button>
                </div>
              </>
            )}

            {/* Service Modal */}
            {modal === 'service' && (
              <>
                <div className="modal-header">
                  <div className="modal-title">
                    {modalMode === 'edit' ? t('provider.store.service.edit', 'Edit Service') : t('provider.store.service.add', 'Add Service')}
                  </div>
                  <button className="modal-close" onClick={() => setModal(null)}>x</button>
                </div>
                <div className="modal-body" style={{ display: 'grid', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">
                      {t('admin.service.form.name', 'Name')} *
                      <TranslationPopup label={t('admin.service.form.name', 'Name')} sourceText={serviceForm.name} translations={serviceNameTrans} onChange={setServiceNameTrans} t={t} />
                    </label>
                    <input className="form-input" value={serviceForm.name} onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      {t('admin.service.form.description', 'Description')}
                      <TranslationPopup label={t('admin.service.form.description', 'Description')} sourceText={serviceForm.description} translations={serviceDescTrans} onChange={setServiceDescTrans} t={t} />
                    </label>
                    <textarea className="form-textarea" value={serviceForm.description} onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">{t('admin.service.form.price', 'Price')}</label>
                      <input className="form-input" type="number" value={serviceForm.price} onChange={e => setServiceForm({ ...serviceForm, price: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('booking.duration', 'Duration (min)')}</label>
                      <input className="form-input" type="number" placeholder="60" value={serviceForm.duration_minutes} onChange={e => setServiceForm({ ...serviceForm, duration_minutes: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('admin.service.form.sort_order', 'Sort Order')}</label>
                      <input className="form-input" type="number" value={serviceForm.sort_order} onChange={e => setServiceForm({ ...serviceForm, sort_order: e.target.value })} />
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={() => void saveService()} disabled={saving}>
                    {saving ? '...' : t('admin.common.save', 'Save')}
                  </button>
                </div>
              </>
            )}

            {/* Discount Modal */}
            {modal === 'discount' && (
              <>
                <div className="modal-header">
                  <div className="modal-title">{t('provider.store.discount.add', 'Add Discount')}</div>
                  <button className="modal-close" onClick={() => setModal(null)}>x</button>
                </div>
                <div className="modal-body" style={{ display: 'grid', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">{t('admin.discount.form.rate', 'Discount Rate (%)')} *</label>
                    <input className="form-input" type="number" min="1" max="100" value={discountForm.discount_rate}
                      onChange={e => setDiscountForm({ ...discountForm, discount_rate: e.target.value })} />
                  </div>
                  <div className="form-row col2">
                    <div className="form-group">
                      <label className="form-label">{t('admin.discount.form.start_date', 'Start Date')}</label>
                      <input className="form-input" type="date" value={discountForm.start_date}
                        onChange={e => setDiscountForm({ ...discountForm, start_date: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('admin.discount.form.end_date', 'End Date')}</label>
                      <input className="form-input" type="date" value={discountForm.end_date}
                        onChange={e => setDiscountForm({ ...discountForm, end_date: e.target.value })} />
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={() => void saveDiscount()} disabled={saving}>
                    {saving ? '...' : t('admin.common.save', 'Save')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
