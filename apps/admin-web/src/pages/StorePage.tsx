import { useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';
import type { Store, StoreService, ServiceDiscount, StoreIndustry, Country, MasterItem } from '../types/api';
import { useI18n, useT } from '../lib/i18n';
import { SUPPORTED_LANGS, LANG_LABELS } from '@petfolio/shared';

type Modal = 'store' | 'service' | 'discount' | null;
type ModalMode = 'create' | 'edit';

const emptyTrans = (): Record<string, string> => Object.fromEntries(SUPPORTED_LANGS.map(l => [l, '']));

export default function StorePage() {
  const t = useT();
  const { lang } = useI18n();

  const [stores, setStores] = useState<Store[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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
  });
  const [storeNameTrans, setStoreNameTrans] = useState<Record<string, string>>(emptyTrans());
  const [storeDescTrans, setStoreDescTrans] = useState<Record<string, string>>(emptyTrans());
  const [selectedIndustryIds, setSelectedIndustryIds] = useState<string[]>([]);
  const [editStoreId, setEditStoreId] = useState('');

  // Service form
  const [serviceForm, setServiceForm] = useState({ name: '', description: '', price: '', sort_order: '0' });
  const [serviceNameTrans, setServiceNameTrans] = useState<Record<string, string>>(emptyTrans());
  const [serviceDescTrans, setServiceDescTrans] = useState<Record<string, string>>(emptyTrans());
  const [editServiceId, setEditServiceId] = useState('');

  // Discount form
  const [discountForm, setDiscountForm] = useState({ discount_rate: '', start_date: '', end_date: '' });
  const [discountServiceId, setDiscountServiceId] = useState('');

  // Reference data
  const [countries, setCountries] = useState<Country[]>([]);
  const [industries, setIndustries] = useState<MasterItem[]>([]);

  // Load reference data
  useEffect(() => {
    api.countries.list().then(setCountries).catch(() => {});
    api.master.public.items('business_category', undefined, lang).then(setIndustries).catch(() => {});
  }, [lang]);

  const loadStores = useCallback(async () => {
    try {
      const res = await api.stores.admin.list({ q: search || undefined, status: statusFilter || undefined, lang });
      setStores(res.items);
      setTotal(res.total);
    } catch (e) { setError(String(e)); }
  }, [search, statusFilter, lang]);

  useEffect(() => { loadStores(); }, [loadStores]);

  const selectStore = useCallback(async (id: string) => {
    try {
      const detail = await api.stores.admin.get(id, lang);
      setSelectedStore(detail);
      // Load discounts for each service
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

  // ─── Store CRUD ───────────────────────────────────────────────────────────
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
      });
      setStoreNameTrans({ ...emptyTrans(), ...(store.name_translations || {}) });
      setStoreDescTrans({ ...emptyTrans(), ...(store.description_translations || {}) });
      setSelectedIndustryIds((store.industries || []).map(i => i.industry_id));
    } else {
      setEditStoreId('');
      setStoreForm({ name: '', description: '', address: '', phone: '', country_id: '', currency_id: '', latitude: '', longitude: '', avatar_url: '' });
      setStoreNameTrans(emptyTrans());
      setStoreDescTrans(emptyTrans());
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
      };
      if (modalMode === 'edit') {
        await api.stores.admin.update(editStoreId, payload);
        flash(t('admin.store.alert.updated', 'Store updated'));
      } else {
        await api.stores.create(payload);
        flash(t('admin.store.alert.created', 'Store created'));
      }
      setModal(null);
      loadStores();
      if (editStoreId) selectStore(editStoreId);
    } catch (e) { setError(String(e)); }
    setSaving(false);
  };

  const deleteStore = async (id: string) => {
    if (!confirm(t('admin.store.action.delete', 'Deactivate Store') + '?')) return;
    try {
      await api.stores.admin.delete(id);
      flash(t('admin.store.alert.deleted', 'Store deactivated'));
      loadStores();
      if (selectedStore?.id === id) setSelectedStore(null);
    } catch (e) { setError(String(e)); }
  };

  // ─── Service CRUD ─────────────────────────────────────────────────────────
  const openServiceModal = (mode: ModalMode, svc?: StoreService) => {
    setModalMode(mode);
    setModal('service');
    if (mode === 'edit' && svc) {
      setEditServiceId(svc.id);
      setServiceForm({
        name: svc.name || '', description: svc.description || '',
        price: svc.price != null ? String(svc.price) : '', sort_order: String(svc.sort_order || 0),
      });
      setServiceNameTrans({ ...emptyTrans(), ...(svc.name_translations || {}) });
      setServiceDescTrans({ ...emptyTrans(), ...(svc.description_translations || {}) });
    } else {
      setEditServiceId('');
      setServiceForm({ name: '', description: '', price: '', sort_order: '0' });
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
        sort_order: parseInt(serviceForm.sort_order) || 0,
      };
      if (modalMode === 'edit') {
        await api.stores.services.update(editServiceId, payload);
        flash(t('admin.service.alert.updated', 'Service updated'));
      } else {
        await api.stores.services.create(selectedStore.id, payload);
        flash(t('admin.service.alert.created', 'Service created'));
      }
      setModal(null);
      selectStore(selectedStore.id);
    } catch (e) { setError(String(e)); }
    setSaving(false);
  };

  const deleteService = async (serviceId: string) => {
    if (!selectedStore || !confirm(t('admin.service.action.delete', 'Delete Service') + '?')) return;
    try {
      await api.stores.services.delete(serviceId);
      flash(t('admin.service.alert.deleted', 'Service deleted'));
      selectStore(selectedStore.id);
    } catch (e) { setError(String(e)); }
  };

  // ─── Discount CRUD ────────────────────────────────────────────────────────
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
      flash(t('admin.discount.alert.created', 'Discount created'));
      setModal(null);
      if (selectedStore) selectStore(selectedStore.id);
    } catch (e) { setError(String(e)); }
    setSaving(false);
  };

  const deleteDiscount = async (discountId: string) => {
    if (!confirm(t('admin.discount.action.delete', 'Delete Discount') + '?')) return;
    try {
      await api.stores.discounts.delete(discountId);
      flash(t('admin.discount.alert.deleted', 'Discount deleted'));
      if (selectedStore) selectStore(selectedStore.id);
    } catch (e) { setError(String(e)); }
  };

  const toggleIndustry = (id: string) => {
    setSelectedIndustryIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>{t('admin.store.page_title', 'Store Management')}</h2>

      {error && <div className="alert alert-danger" style={{ marginBottom: 12 }}>{error} <button onClick={() => setError('')}>x</button></div>}
      {success && <div className="alert alert-success" style={{ marginBottom: 12 }}>{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* ─── Left: Store List ─────────────────────────────────────────── */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>{t('admin.store.list.title', 'Store List')} ({total})</h3>
            <button className="btn btn-primary btn-sm" onClick={() => openStoreModal('create')}>
              + {t('admin.store.action.create', 'Create Store')}
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              className="form-input"
              placeholder={t('admin.store.list.search', 'Search stores...')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1 }}
            />
            <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 120 }}>
              <option value="">{t('admin.store.status.active', 'Active')} + {t('admin.store.status.inactive', 'Inactive')}</option>
              <option value="active">{t('admin.store.status.active', 'Active')}</option>
              <option value="inactive">{t('admin.store.status.inactive', 'Inactive')}</option>
            </select>
          </div>

          {stores.length === 0 && <p className="text-muted">{t('admin.store.list.empty', 'No stores registered')}</p>}

          <div className="master-column-list">
            {stores.map(s => (
              <div
                key={s.id}
                className={`master-column-item${selectedStore?.id === s.id ? ' active' : ''}`}
                onClick={() => selectStore(s.id)}
                style={{ cursor: 'pointer', padding: '8px 12px', borderBottom: '1px solid var(--border)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{s.display_name || s.name}</strong>
                    {s.owner_email && <span className="text-muted" style={{ fontSize: 12, marginLeft: 8 }}>{s.owner_email}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <span className={`badge ${s.status === 'active' ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: 11 }}>
                      {s.status === 'active' ? t('admin.store.status.active', 'Active') : t('admin.store.status.inactive', 'Inactive')}
                    </span>
                    <span className="text-muted" style={{ fontSize: 11 }}>{s.service_count || 0}</span>
                  </div>
                </div>
                {s.address && <div className="text-muted" style={{ fontSize: 12 }}>{s.address}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* ─── Right: Store Detail ─────────────────────────────────────── */}
        <div className="card" style={{ padding: 16 }}>
          {!selectedStore ? (
            <p className="text-muted" style={{ textAlign: 'center', marginTop: 40 }}>
              {t('admin.store.list.empty', 'Select a store')}
            </p>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0 }}>{selectedStore.display_name || selectedStore.name}</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-sm" onClick={() => openStoreModal('edit', selectedStore)}>
                    {t('admin.store.action.edit', 'Edit')}
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => deleteStore(selectedStore.id)}>
                    {t('admin.store.action.delete', 'Deactivate')}
                  </button>
                </div>
              </div>

              {/* Store info */}
              <div style={{ marginBottom: 16, fontSize: 14 }}>
                {selectedStore.address && <div><strong>{t('admin.store.form.address', 'Address')}:</strong> {selectedStore.address}</div>}
                {selectedStore.phone && <div><strong>{t('admin.store.form.phone', 'Phone')}:</strong> {selectedStore.phone}</div>}
                {selectedStore.country_name && <div><strong>{t('admin.store.form.country', 'Country')}:</strong> {selectedStore.country_name}</div>}
                {selectedStore.currency_code && <div><strong>{t('admin.store.form.currency', 'Currency')}:</strong> {selectedStore.currency_code}</div>}
                {selectedStore.owner_email && <div><strong>Owner:</strong> {selectedStore.owner_name || selectedStore.owner_email}</div>}
              </div>

              {/* Industries */}
              {selectedStore.industries && selectedStore.industries.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <strong>{t('admin.store.form.industries', 'Industries')}:</strong>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                    {selectedStore.industries.map(ind => (
                      <span key={ind.industry_id} className="badge badge-blue" style={{ fontSize: 11 }}>{ind.display_label}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Services */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <h4 style={{ margin: 0 }}>{t('admin.service.list.title', 'Services')}</h4>
                  <button className="btn btn-sm btn-primary" onClick={() => openServiceModal('create')}>
                    + {t('admin.service.action.create', 'Add Service')}
                  </button>
                </div>

                {(!selectedStore.services || selectedStore.services.length === 0) ? (
                  <p className="text-muted" style={{ fontSize: 13 }}>{t('admin.service.list.empty', 'No services')}</p>
                ) : (
                  <div>
                    {selectedStore.services.map(svc => (
                      <div key={svc.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong>{svc.display_name || svc.name}</strong>
                            {svc.price != null && (
                              <span className="text-muted" style={{ marginLeft: 8 }}>
                                {Number(svc.price).toLocaleString()} {svc.currency_code || ''}
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button className="btn btn-xs" onClick={() => openDiscountModal(svc.id)}>%</button>
                            <button className="btn btn-xs" onClick={() => openServiceModal('edit', svc)}>
                              {t('admin.service.action.edit', 'Edit')}
                            </button>
                            <button className="btn btn-xs btn-danger" onClick={() => deleteService(svc.id)}>
                              {t('admin.service.action.delete', 'Del')}
                            </button>
                          </div>
                        </div>
                        {svc.display_description && (
                          <div className="text-muted" style={{ fontSize: 12 }}>{svc.display_description}</div>
                        )}
                        {/* Discounts for this service */}
                        {discounts[svc.id] && discounts[svc.id].length > 0 && (
                          <div style={{ marginTop: 4 }}>
                            {discounts[svc.id].map(d => (
                              <span key={d.id} className="badge badge-orange" style={{ fontSize: 10, marginRight: 4 }}>
                                -{d.discount_rate}%
                                {d.start_date && ` ${d.start_date}`}
                                {d.end_date && `~${d.end_date}`}
                                <button
                                  style={{ marginLeft: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 10, padding: 0 }}
                                  onClick={(e) => { e.stopPropagation(); deleteDiscount(d.id); }}
                                >x</button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ─── Modals ────────────────────────────────────────────────────── */}
      {modal === 'store' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 600, maxHeight: '90vh', overflow: 'auto' }}>
            <h3>{modalMode === 'edit' ? t('admin.store.action.edit', 'Edit Store') : t('admin.store.action.create', 'Create Store')}</h3>

            <label className="form-label">{t('admin.store.form.name', 'Store Name')} *</label>
            <input className="form-input" value={storeForm.name} onChange={e => setStoreForm(f => ({ ...f, name: e.target.value }))} />

            <details style={{ marginTop: 8, marginBottom: 8 }}>
              <summary style={{ cursor: 'pointer', fontSize: 13 }}>{t('admin.store.form.name', 'Name')} — translations</summary>
              <div style={{ marginTop: 4 }}>
                {SUPPORTED_LANGS.map(l => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                    <label style={{ width: 60, fontSize: 11 }}>{LANG_LABELS[l]}</label>
                    <input className="form-input" style={{ flex: 1, fontSize: 12, padding: '2px 4px' }}
                      value={storeNameTrans[l] || ''} onChange={e => setStoreNameTrans(p => ({ ...p, [l]: e.target.value }))} />
                  </div>
                ))}
              </div>
            </details>

            <label className="form-label">{t('admin.store.form.description', 'Description')}</label>
            <textarea className="form-input" rows={2} value={storeForm.description} onChange={e => setStoreForm(f => ({ ...f, description: e.target.value }))} />

            <details style={{ marginTop: 8, marginBottom: 8 }}>
              <summary style={{ cursor: 'pointer', fontSize: 13 }}>{t('admin.store.form.description', 'Description')} — translations</summary>
              <div style={{ marginTop: 4 }}>
                {SUPPORTED_LANGS.map(l => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                    <label style={{ width: 60, fontSize: 11 }}>{LANG_LABELS[l]}</label>
                    <input className="form-input" style={{ flex: 1, fontSize: 12, padding: '2px 4px' }}
                      value={storeDescTrans[l] || ''} onChange={e => setStoreDescTrans(p => ({ ...p, [l]: e.target.value }))} />
                  </div>
                ))}
              </div>
            </details>

            <label className="form-label">{t('admin.store.form.address', 'Address')}</label>
            <input className="form-input" value={storeForm.address} onChange={e => setStoreForm(f => ({ ...f, address: e.target.value }))} />

            <label className="form-label">{t('admin.store.form.phone', 'Phone')}</label>
            <input className="form-input" value={storeForm.phone} onChange={e => setStoreForm(f => ({ ...f, phone: e.target.value }))} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label className="form-label">{t('admin.store.form.country', 'Country')}</label>
                <select className="form-select" value={storeForm.country_id} onChange={e => setStoreForm(f => ({ ...f, country_id: e.target.value }))}>
                  <option value="">--</option>
                  {countries.map(c => <option key={c.id} value={c.id}>{c.ko_name || c.code}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">{t('admin.store.form.currency', 'Currency')}</label>
                <input className="form-input" value={storeForm.currency_id}
                  onChange={e => setStoreForm(f => ({ ...f, currency_id: e.target.value }))}
                  placeholder="auto from country" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label className="form-label">{t('admin.store.form.latitude', 'Latitude')}</label>
                <input className="form-input" value={storeForm.latitude} onChange={e => setStoreForm(f => ({ ...f, latitude: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">{t('admin.store.form.longitude', 'Longitude')}</label>
                <input className="form-input" value={storeForm.longitude} onChange={e => setStoreForm(f => ({ ...f, longitude: e.target.value }))} />
              </div>
            </div>

            <label className="form-label">{t('admin.store.form.avatar', 'Store Image')} (URL)</label>
            <input className="form-input" value={storeForm.avatar_url} onChange={e => setStoreForm(f => ({ ...f, avatar_url: e.target.value }))} />

            <label className="form-label">{t('admin.store.form.industries', 'Industries')}</label>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
              {industries.map(ind => (
                <label key={ind.id} style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}>
                  <input type="checkbox" checked={selectedIndustryIds.includes(ind.id)} onChange={() => toggleIndustry(ind.id)} />
                  {ind.display_label || ind.key}
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn" onClick={() => setModal(null)}>{t('admin.store.action.cancel', 'Cancel')}</button>
              <button className="btn btn-primary" onClick={saveStore} disabled={saving || !storeForm.name.trim()}>
                {saving ? '...' : t('admin.store.action.save', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === 'service' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500, maxHeight: '90vh', overflow: 'auto' }}>
            <h3>{modalMode === 'edit' ? t('admin.service.action.edit', 'Edit Service') : t('admin.service.action.create', 'Add Service')}</h3>

            <label className="form-label">{t('admin.service.form.name', 'Service Name')} *</label>
            <input className="form-input" value={serviceForm.name} onChange={e => setServiceForm(f => ({ ...f, name: e.target.value }))} />

            <details style={{ marginTop: 8, marginBottom: 8 }}>
              <summary style={{ cursor: 'pointer', fontSize: 13 }}>{t('admin.service.form.name', 'Name')} — translations</summary>
              <div style={{ marginTop: 4 }}>
                {SUPPORTED_LANGS.map(l => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                    <label style={{ width: 60, fontSize: 11 }}>{LANG_LABELS[l]}</label>
                    <input className="form-input" style={{ flex: 1, fontSize: 12, padding: '2px 4px' }}
                      value={serviceNameTrans[l] || ''} onChange={e => setServiceNameTrans(p => ({ ...p, [l]: e.target.value }))} />
                  </div>
                ))}
              </div>
            </details>

            <label className="form-label">{t('admin.service.form.description', 'Description')}</label>
            <textarea className="form-input" rows={2} value={serviceForm.description} onChange={e => setServiceForm(f => ({ ...f, description: e.target.value }))} />

            <details style={{ marginTop: 8, marginBottom: 8 }}>
              <summary style={{ cursor: 'pointer', fontSize: 13 }}>{t('admin.service.form.description', 'Description')} — translations</summary>
              <div style={{ marginTop: 4 }}>
                {SUPPORTED_LANGS.map(l => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                    <label style={{ width: 60, fontSize: 11 }}>{LANG_LABELS[l]}</label>
                    <input className="form-input" style={{ flex: 1, fontSize: 12, padding: '2px 4px' }}
                      value={serviceDescTrans[l] || ''} onChange={e => setServiceDescTrans(p => ({ ...p, [l]: e.target.value }))} />
                  </div>
                ))}
              </div>
            </details>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label className="form-label">{t('admin.service.form.price', 'Price')}</label>
                <input className="form-input" type="number" value={serviceForm.price} onChange={e => setServiceForm(f => ({ ...f, price: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">{t('admin.service.form.sort_order', 'Sort Order')}</label>
                <input className="form-input" type="number" value={serviceForm.sort_order} onChange={e => setServiceForm(f => ({ ...f, sort_order: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn" onClick={() => setModal(null)}>{t('admin.store.action.cancel', 'Cancel')}</button>
              <button className="btn btn-primary" onClick={saveService} disabled={saving || !serviceForm.name.trim()}>
                {saving ? '...' : t('admin.store.action.save', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === 'discount' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <h3>{t('admin.discount.action.create', 'Add Discount')}</h3>

            <label className="form-label">{t('admin.discount.form.rate', 'Discount Rate (%)')} *</label>
            <input className="form-input" type="number" min="0" max="100" step="0.01"
              value={discountForm.discount_rate} onChange={e => setDiscountForm(f => ({ ...f, discount_rate: e.target.value }))} />

            <label className="form-label">{t('admin.discount.form.start_date', 'Start Date')}</label>
            <input className="form-input" type="date" value={discountForm.start_date} onChange={e => setDiscountForm(f => ({ ...f, start_date: e.target.value }))} />

            <label className="form-label">{t('admin.discount.form.end_date', 'End Date')}</label>
            <input className="form-input" type="date" value={discountForm.end_date} onChange={e => setDiscountForm(f => ({ ...f, end_date: e.target.value }))} />

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn" onClick={() => setModal(null)}>{t('admin.store.action.cancel', 'Cancel')}</button>
              <button className="btn btn-primary" onClick={saveDiscount} disabled={saving || !discountForm.discount_rate}>
                {saving ? '...' : t('admin.store.action.save', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
