import { useEffect, useState, useCallback, useMemo } from 'react';
import { api } from '../../lib/api';
import type { Store, StoreService, ServiceDiscount, StoreIndustry, Country, MasterItem } from '../../types/api';
import { useI18n, useT } from '../../lib/i18n';
import { BUSINESS_CATEGORIES, BUSINESS_MAP } from '../../data/businessCategories';
import { COUNTRY_REGIONS } from '../../data/countryRegions';
import { TranslationPopup } from '../../components/TranslationPopup';
import { emptyTrans } from '../../lib/catalogUtils';
import WizardModal from '../../components/WizardModal';

type Modal = 'store' | 'service' | 'discount' | null;
type ModalMode = 'create' | 'edit';

const PET_EMOJI: Record<string, string> = {
  dog: '\uD83D\uDC15', cat: '\uD83D\uDC08', bird: '\uD83D\uDC26',
  rabbit: '\uD83D\uDC07', reptile: '\uD83E\uDD8E', other: '\uD83D\uDC3E',
};

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
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
  const [wizardStep, setWizardStep] = useState(0);
  const [petL1Items, setPetL1Items] = useState<{ id: string; code: string; label: string }[]>([]);
  const [supportedPetL1Ids, setSupportedPetL1Ids] = useState<string[]>([]);
  const [supportedPetL2Ids, setSupportedPetL2Ids] = useState<string[]>([]);

  // Service form
  const [serviceForm, setServiceForm] = useState({
    name: '', description: '', price: '', sort_order: '0', duration_minutes: '',
    pet_type_l2_id: '', service_category_l3_id: '', is_active: true,
  });
  const [serviceNameTrans, setServiceNameTrans] = useState<Record<string, string>>(emptyTrans());
  const [serviceDescTrans, setServiceDescTrans] = useState<Record<string, string>>(emptyTrans());
  const [editServiceId, setEditServiceId] = useState('');

  // Pet breeds + cut styles for service form
  const [petBreeds, setPetBreeds] = useState<{ id: string; code: string; label: string; parent_id: string }[]>([]);
  const [cutStyles, setCutStyles] = useState<{ id: string; code: string; label: string }[]>([]);

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
    api.petBreeds.list({ lang }).then(r => setPetBreeds(r.items)).catch(() => {});
    api.master.public.items('pet-type', null, lang, { item_level: '1' }).then((items: MasterItem[]) => {
      setPetL1Items(items.map(i => ({ id: i.id, code: i.key || '', label: i.display_label || i.key || '' })));
    }).catch(() => {});
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
    setWizardStep(0);
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
      const l1 = Array.isArray(store.supported_pet_l1_ids) ? store.supported_pet_l1_ids : [];
      const l2 = Array.isArray(store.supported_pet_l2_ids) ? store.supported_pet_l2_ids : [];
      setSupportedPetL1Ids(l1);
      setSupportedPetL2Ids(l2);
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
      setSupportedPetL1Ids([]);
      setSupportedPetL2Ids([]);
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
        supported_pet_l1_ids: supportedPetL1Ids,
        supported_pet_l2_ids: supportedPetL2Ids,
      };
      if (modalMode === 'edit') {
        await api.stores.update(editStoreId, payload);
        flash(t('provider.store.alert.updated'));
      } else {
        await api.stores.create(payload);
        flash(t('provider.store.alert.created'));
      }
      setModal(null);
      await loadStores();
      if (editStoreId) selectStore(editStoreId);
    } catch (e) { setError(String(e)); }
    setSaving(false);
  };

  const handleDeleteStore = async (id: string) => {
    if (!confirm(t('provider.store.delete_confirm'))) return;
    try {
      await api.stores.delete(id);
      flash(t('provider.store.alert.deleted'));
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
        pet_type_l2_id: svc.pet_type_l2_id || '',
        service_category_l3_id: svc.service_category_l3_id || '',
        is_active: svc.is_active !== false,
      });
      setServiceNameTrans({ ...emptyTrans(), ...(svc.name_translations || {}) });
      setServiceDescTrans({ ...emptyTrans(), ...(svc.description_translations || {}) });
      // Load cut styles for the selected pet type
      if (svc.pet_type_l2_id && selectedStore) {
        api.serviceCuts.list({ pet_type_l2_id: svc.pet_type_l2_id, store_id: selectedStore.id, lang }).then(r => setCutStyles(r.items)).catch(() => {});
      }
    } else {
      setEditServiceId('');
      setServiceForm({
        name: '', description: '', price: '', sort_order: '0', duration_minutes: '',
        pet_type_l2_id: '', service_category_l3_id: '', is_active: true,
      });
      setServiceNameTrans(emptyTrans());
      setServiceDescTrans(emptyTrans());
      setCutStyles([]);
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
        pet_type_l2_id: serviceForm.pet_type_l2_id || null,
        service_category_l3_id: serviceForm.service_category_l3_id || null,
        is_active: serviceForm.is_active,
      };
      if (modalMode === 'edit') {
        await api.stores.services.update(editServiceId, payload);
        flash(t('supplier.service.save_success'));
      } else {
        await api.stores.services.create(selectedStore.id, payload);
        flash(t('supplier.service.save_success'));
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
      flash(t('admin.service.alert.deleted'));
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
      flash(t('provider.store.discount.add'));
      setModal(null);
      if (selectedStore) selectStore(selectedStore.id);
    } catch (e) { setError(String(e)); }
    setSaving(false);
  };

  // Pet support helpers
  const togglePetL1 = (id: string) => {
    setSupportedPetL1Ids(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      // Remove L2 items that belong to deselected L1
      if (!next.includes(id)) {
        const l2ToRemove = new Set(petBreeds.filter(b => b.parent_id === id).map(b => b.id));
        setSupportedPetL2Ids(prev2 => prev2.filter(x => !l2ToRemove.has(x)));
      }
      return next;
    });
  };

  const togglePetL2 = (id: string) => {
    setSupportedPetL2Ids(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAllL2ForL1 = (l1Id: string) => {
    const childIds = petBreeds.filter(b => b.parent_id === l1Id).map(b => b.id);
    const allSelected = childIds.every(id => supportedPetL2Ids.includes(id));
    if (allSelected) {
      setSupportedPetL2Ids(prev => prev.filter(x => !childIds.includes(x)));
    } else {
      setSupportedPetL2Ids(prev => [...new Set([...prev, ...childIds])]);
    }
  };

  const wizardSteps = useMemo(() => [
    { title: t('supplier.wizard.step1_title', 'Basic Info') },
    { title: t('supplier.wizard.step2_title', 'Business & Pet Types') },
    { title: t('supplier.wizard.step3_title', 'Address & Hours') },
  ], [t]);

  const deleteDiscount = async (discountId: string) => {
    try {
      await api.stores.discounts.delete(discountId);
      flash(t('admin.discount.alert.deleted'));
      if (selectedStore) selectStore(selectedStore.id);
    } catch (e) { setError(String(e)); }
  };

  return (
    <section className="card">
      <div className="card-header">
        <div className="card-title">{t('provider.store.my_stores')}</div>
        <button className="btn btn-primary btn-sm" onClick={() => openStoreModal('create')}>
          + {t('provider.store.create')}
        </button>
      </div>
      <div className="card-body" style={{ display: 'grid', gap: 16 }}>
        {error && <div className="alert alert-error">{error} <button onClick={() => setError('')} style={{ float: 'right', border: 0, background: 'none', cursor: 'pointer' }}>x</button></div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, minHeight: 300 }}>
          {/* ─── Left: Store List ─── */}
          <div style={{ borderRight: '1px solid var(--border)', paddingRight: 16 }}>
            {stores.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{t('provider.store.no_stores')}</p>
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
                        {t('provider.store.services_count').replace('{count}', String(s.service_count || 0))}
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
                {t('provider.store.select_store')}
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
                      {t('provider.store.edit')}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => void handleDeleteStore(selectedStore.id)}>
                      {t('admin.common.delete')}
                    </button>
                  </div>
                </div>

                {/* Services */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <strong>{t('admin.store.form.services')}</strong>
                    <button className="btn btn-secondary btn-sm" onClick={() => openServiceModal('create')}>
                      + {t('supplier.service.add_btn')}
                    </button>
                  </div>
                  {(selectedStore.services || []).length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t('guardian.service.no_services')}</p>
                  ) : (
                    <div style={{ display: 'grid', gap: 10 }}>
                      {selectedStore.services.map(svc => (
                        <div key={svc.id} className="sp-svc-card" style={{
                          border: '1px solid var(--border)', borderRadius: 12, padding: 16,
                          opacity: svc.is_active === false ? 0.5 : 1,
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <strong style={{ fontSize: 15 }}>{svc.display_name || svc.name}</strong>
                              {/* Pet type + cut style info */}
                              <div style={{ marginTop: 4, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                                {svc.pet_type_l2_label && (
                                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                    {svc.pet_type_l2_label}
                                  </span>
                                )}
                                {svc.cut_l3_label && (
                                  <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
                                    {svc.cut_l3_label}
                                  </span>
                                )}
                              </div>
                              {/* Duration + Price */}
                              <div style={{ marginTop: 6, display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-muted)' }}>
                                {svc.duration_minutes != null && svc.duration_minutes > 0 && (
                                  <span>{svc.duration_minutes}{t('supplier.service.duration_unit')}</span>
                                )}
                                {svc.price != null && svc.price > 0 && (
                                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                                    {Number(svc.price).toLocaleString()}{t('supplier.service.price_unit')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                              <span className={`badge ${svc.is_active !== false ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: 10 }}>
                                {svc.is_active !== false ? t('supplier.service.active_label') : 'OFF'}
                              </span>
                              <button className="btn btn-secondary btn-sm" onClick={() => openServiceModal('edit', svc)}>
                                {t('provider.store.service.edit')}
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => {
                                if (confirm(t('supplier.service.delete_confirm'))) void deleteService(svc.id);
                              }}>x</button>
                            </div>
                          </div>
                          {/* Discounts */}
                          <div style={{ marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 6 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
                                {t('admin.store.form.discounts')}
                              </span>
                              <button
                                className="btn btn-secondary"
                                style={{ fontSize: 10, padding: '2px 6px' }}
                                onClick={() => openDiscountModal(svc.id)}
                              >
                                + {t('provider.store.discount.add')}
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

      {/* ─── Store Wizard Modal ─── */}
      {modal === 'store' && (
        <WizardModal
          steps={wizardSteps}
          currentStep={wizardStep}
          onStepChange={setWizardStep}
          onClose={() => setModal(null)}
          onSave={() => void saveStore()}
          saving={saving}
          title={modalMode === 'edit' ? t('provider.store.edit') : t('provider.store.create')}
          t={t}
        >
          {/* Step 1 — Basic Info */}
          {wizardStep === 0 && (
            <div style={{ display: 'grid', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">
                  {t('admin.store.form.name')} *
                  <TranslationPopup label={t('admin.store.form.name')} sourceText={storeForm.name} translations={storeNameTrans} onChange={setStoreNameTrans} t={t} />
                </label>
                <input className="form-input" value={storeForm.name} onChange={e => setStoreForm({ ...storeForm, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">
                  {t('admin.store.form.description')}
                  <TranslationPopup label={t('admin.store.form.description')} sourceText={storeForm.description} translations={storeDescTrans} onChange={setStoreDescTrans} t={t} />
                </label>
                <textarea className="form-textarea" value={storeForm.description} onChange={e => setStoreForm({ ...storeForm, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin.store.form.phone')}</label>
                <input className="form-input" value={storeForm.phone} onChange={e => setStoreForm({ ...storeForm, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin.store.form.avatar')}</label>
                <input className="form-input" value={storeForm.avatar_url} onChange={e => setStoreForm({ ...storeForm, avatar_url: e.target.value })} />
              </div>
            </div>
          )}

          {/* Step 2 — Business & Pet Types */}
          {wizardStep === 1 && (
            <div style={{ display: 'grid', gap: 16 }}>
              {/* Business Type L1/L2 */}
              <div className="form-row col2">
                <div className="form-group">
                  <label className="form-label">{t('store.business.type')}</label>
                  <select className="form-select" value={storeForm.business_type}
                    onChange={e => setStoreForm({ ...storeForm, business_type: e.target.value, business_subtype: '' })}>
                    <option value="">{t('store.business.select_type')}</option>
                    {BUSINESS_CATEGORIES.map(c => (
                      <option key={c.code} value={c.code}>{t(c.i18nKey, c.code)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('store.business.subtype')}</label>
                  <select className="form-select" value={storeForm.business_subtype}
                    onChange={e => setStoreForm({ ...storeForm, business_subtype: e.target.value })}
                    disabled={!storeForm.business_type}>
                    <option value="">{t('store.business.select_subtype')}</option>
                    {businessSubOptions.map(s => (
                      <option key={s.code} value={s.code}>{t(s.i18nKey, s.code)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pet L1 — Animal Category */}
              <div className="form-group">
                <label className="form-label">{t('supplier.wizard.pet_support_title', 'Supported Pet Types')}</label>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 8px' }}>
                  {t('supplier.wizard.pet_support_desc', 'Select pet types this store supports')}
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {petL1Items.map(item => {
                    const selected = supportedPetL1Ids.includes(item.id);
                    const emoji = PET_EMOJI[item.code] || PET_EMOJI.other || '\uD83D\uDC3E';
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`wiz-pet-chip${selected ? ' selected' : ''}`}
                        onClick={() => togglePetL1(item.id)}
                      >
                        <span className="emoji">{emoji}</span>
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pet L2 — Specific Breeds (filtered by selected L1) */}
              {supportedPetL1Ids.length > 0 && (
                <div className="form-group">
                  <label className="form-label">{t('supplier.wizard.pet_l2_label', 'Specific Breeds')}</label>
                  {supportedPetL1Ids.map(l1Id => {
                    const l1 = petL1Items.find(x => x.id === l1Id);
                    const children = petBreeds.filter(b => b.parent_id === l1Id);
                    if (children.length === 0) return null;
                    const allSelected = children.every(c => supportedPetL2Ids.includes(c.id));
                    return (
                      <div key={l1Id} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <strong style={{ fontSize: 13 }}>
                            {PET_EMOJI[l1?.code || ''] || '\uD83D\uDC3E'} {l1?.label}
                          </strong>
                          <button
                            type="button"
                            className={`btn btn-sm ${allSelected ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ fontSize: 11, padding: '2px 8px' }}
                            onClick={() => toggleAllL2ForL1(l1Id)}
                          >
                            {t('supplier.wizard.pet_l2_all', 'All Breeds')}
                          </button>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {children.map(breed => {
                            const sel = supportedPetL2Ids.includes(breed.id);
                            return (
                              <button
                                key={breed.id}
                                type="button"
                                className={`wiz-pet-chip${sel ? ' selected' : ''}`}
                                onClick={() => togglePetL2(breed.id)}
                                style={{ fontSize: 12, padding: '5px 10px' }}
                              >
                                {breed.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 3 — Address & Hours */}
          {wizardStep === 2 && (
            <div style={{ display: 'grid', gap: 12 }}>
              {/* Country */}
              <div className="form-row col2">
                <div className="form-group">
                  <label className="form-label">{t('admin.store.form.country')}</label>
                  <select className="form-select" value={storeForm.country_id}
                    onChange={e => setStoreForm({ ...storeForm, country_id: e.target.value, address_state_code: '', address_city_code: '' })}>
                    <option value="">-</option>
                    {countries.map(c => <option key={c.id} value={c.id}>{c.ko_name || c.name_key}</option>)}
                  </select>
                </div>
                <div className="form-group" />
              </div>

              {/* Address: State/City/Detail */}
              {regionOptions.length > 0 ? (
                <>
                  <div className="form-row col2">
                    <div className="form-group">
                      <label className="form-label">{t('store.address.state')}</label>
                      <select className="form-select" value={storeForm.address_state_code}
                        onChange={e => setStoreForm({ ...storeForm, address_state_code: e.target.value, address_city_code: '' })}>
                        <option value="">{t('store.address.select_state')}</option>
                        {regionOptions.map(r => (
                          <option key={r.name} value={r.name}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('store.address.city')}</label>
                      {cityOptions.length > 0 ? (
                        <select className="form-select" value={storeForm.address_city_code}
                          onChange={e => setStoreForm({ ...storeForm, address_city_code: e.target.value })}
                          disabled={!storeForm.address_state_code}>
                          <option value="">{t('store.address.select_city')}</option>
                          {cityOptions.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      ) : (
                        <input className="form-input" value={storeForm.address_city_code}
                          onChange={e => setStoreForm({ ...storeForm, address_city_code: e.target.value })}
                          placeholder={t('store.address.select_city')}
                          disabled={!storeForm.address_state_code} />
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('store.address.detail')}</label>
                    <input className="form-input" value={storeForm.address_detail}
                      onChange={e => setStoreForm({ ...storeForm, address_detail: e.target.value })}
                      placeholder={t('store.address.detail_placeholder')} />
                  </div>
                </>
              ) : (
                <div className="form-group">
                  <label className="form-label">{t('admin.store.form.address')}</label>
                  <input className="form-input" value={storeForm.address} onChange={e => setStoreForm({ ...storeForm, address: e.target.value })} />
                </div>
              )}

              {/* Operating Hours */}
              <div className="form-group">
                <label className="form-label">{t('supplier.settings.hours_title')}</label>
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
                        <span className="sp-hours-day">{t(`supplier.settings.day.${day}`)}</span>
                        {isClosed ? (
                          <span className="sp-hours-closed-label">{t('supplier.settings.closed')}</span>
                        ) : (
                          <div className="sp-hours-time">
                            <select value={h.open} onChange={e => setStoreHours(prev => ({ ...prev, [day]: { ...prev[day], open: e.target.value } }))}>
                              {TIME_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                            <span className="sp-hours-separator">~</span>
                            <select value={h.close} onChange={e => setStoreHours(prev => ({ ...prev, [day]: { ...prev[day], close: e.target.value } }))}>
                              {TIME_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </WizardModal>
      )}

      {/* ─── Service / Discount Modals ─── */}
      {(modal === 'service' || modal === 'discount') && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Service Modal */}
            {modal === 'service' && (
              <>
                <div className="modal-header">
                  <div className="modal-title">
                    {modalMode === 'edit' ? t('supplier.service.edit_title') : t('supplier.service.add_title')}
                  </div>
                  <button className="modal-close" onClick={() => setModal(null)}>x</button>
                </div>
                <div className="modal-body" style={{ display: 'grid', gap: 12 }}>
                  {/* Service Name */}
                  <div className="form-group">
                    <label className="form-label">
                      {t('supplier.service.name_label')} *
                      <TranslationPopup label={t('supplier.service.name_label')} sourceText={serviceForm.name} translations={serviceNameTrans} onChange={setServiceNameTrans} t={t} />
                    </label>
                    <input className="form-input" value={serviceForm.name}
                      placeholder={t('supplier.service.name_placeholder')}
                      onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })} />
                  </div>

                  {/* Pet Type (L2 breed) */}
                  <div className="form-group">
                    <label className="form-label">{t('supplier.service.pet_label')}</label>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className={`btn btn-sm ${!serviceForm.pet_type_l2_id ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => {
                          setServiceForm({ ...serviceForm, pet_type_l2_id: '', service_category_l3_id: '' });
                          setCutStyles([]);
                        }}
                      >
                        {t('common.all')}
                      </button>
                      {petBreeds.map(b => (
                        <button
                          key={b.id}
                          type="button"
                          className={`btn btn-sm ${serviceForm.pet_type_l2_id === b.id ? 'btn-primary' : 'btn-secondary'}`}
                          onClick={() => {
                            setServiceForm({ ...serviceForm, pet_type_l2_id: b.id, service_category_l3_id: '' });
                            if (selectedStore) {
                              api.serviceCuts.list({ pet_type_l2_id: b.id, store_id: selectedStore.id, lang })
                                .then(r => setCutStyles(r.items)).catch(() => setCutStyles([]));
                            }
                          }}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cut Style (L3, filtered by pet + store available_cuts) */}
                  <div className="form-group">
                    <label className="form-label">{t('supplier.service.cut_label')}</label>
                    {!serviceForm.pet_type_l2_id ? (
                      <select className="form-select" disabled>
                        <option>{t('supplier.service.pet_select_first')}</option>
                      </select>
                    ) : (
                      <select className="form-select"
                        value={serviceForm.service_category_l3_id}
                        onChange={e => setServiceForm({ ...serviceForm, service_category_l3_id: e.target.value })}>
                        <option value="">{t('supplier.service.cut_none')}</option>
                        {cutStyles.map(c => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Price + Duration */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">{t('supplier.service.price_label')}</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input className="form-input" type="number" value={serviceForm.price}
                          placeholder={t('supplier.service.price_placeholder')}
                          onChange={e => setServiceForm({ ...serviceForm, price: e.target.value })}
                          style={{ flex: 1 }} />
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t('supplier.service.price_unit')}</span>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('supplier.service.duration_label')}</label>
                      <select className="form-select" value={serviceForm.duration_minutes}
                        onChange={e => setServiceForm({ ...serviceForm, duration_minutes: e.target.value })}>
                        <option value="">{t('supplier.service.duration_select')}</option>
                        {[30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360, 390, 420, 450, 480].map(m => (
                          <option key={m} value={String(m)}>{m}{t('supplier.service.duration_unit')}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Active toggle */}
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" checked={serviceForm.is_active}
                      onChange={e => setServiceForm({ ...serviceForm, is_active: e.target.checked })}
                      style={{ accentColor: 'var(--primary)', width: 18, height: 18 }} />
                    <label className="form-label" style={{ margin: 0 }}>{t('supplier.service.active_label')}</label>
                  </div>

                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" onClick={() => setModal(null)}>
                      {t('common.cancel', 'Cancel')}
                    </button>
                    <button className="btn btn-primary" onClick={() => void saveService()} disabled={saving}>
                      {saving ? '...' : t('supplier.service.save_btn')}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Discount Modal */}
            {modal === 'discount' && (
              <>
                <div className="modal-header">
                  <div className="modal-title">{t('provider.store.discount.add')}</div>
                  <button className="modal-close" onClick={() => setModal(null)}>x</button>
                </div>
                <div className="modal-body" style={{ display: 'grid', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">{t('admin.discount.form.rate')} *</label>
                    <input className="form-input" type="number" min="1" max="100" value={discountForm.discount_rate}
                      onChange={e => setDiscountForm({ ...discountForm, discount_rate: e.target.value })} />
                  </div>
                  <div className="form-row col2">
                    <div className="form-group">
                      <label className="form-label">{t('admin.discount.form.start_date')}</label>
                      <input className="form-input" type="date" value={discountForm.start_date}
                        onChange={e => setDiscountForm({ ...discountForm, start_date: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('admin.discount.form.end_date')}</label>
                      <input className="form-input" type="date" value={discountForm.end_date}
                        onChange={e => setDiscountForm({ ...discountForm, end_date: e.target.value })} />
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={() => void saveDiscount()} disabled={saving}>
                    {saving ? '...' : t('admin.common.save')}
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
