import { useEffect, useState, useCallback } from 'react';
import { api, type DeviceType, type DeviceManufacturer, type DeviceBrand, type DeviceModel, type MeasurementUnit } from '../lib/api';
import { useT } from '../lib/i18n';

type Tab = 'devices' | 'units';

export default function DevicePage() {
  const t = useT();
  const [activeTab, setActiveTab] = useState<Tab>('devices');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ── Data ──────────────────────────────────────────────────────────────────
  const [types, setTypes] = useState<DeviceType[]>([]);
  const [manufacturers, setManufacturers] = useState<DeviceManufacturer[]>([]);
  const [brands, setBrands] = useState<DeviceBrand[]>([]);
  const [models, setModels] = useState<DeviceModel[]>([]);
  const [units, setUnits] = useState<MeasurementUnit[]>([]);

  // ── Selections ────────────────────────────────────────────────────────────
  const [selectedType, setSelectedType] = useState<DeviceType | null>(null);
  const [selectedMfr, setSelectedMfr] = useState<DeviceManufacturer | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<DeviceBrand | null>(null);
  const [selectedModel, setSelectedModel] = useState<DeviceModel | null>(null);

  // ── Modals ────────────────────────────────────────────────────────────────
  type ModalTarget = 'type' | 'manufacturer' | 'brand' | 'model' | 'unit';
  const [modal, setModal] = useState<{ target: ModalTarget; mode: 'create' | 'edit'; id?: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const [typeForm, setTypeForm] = useState({ key: '', name_ko: '', name_en: '', sort_order: '0' });
  const [mfrForm, setMfrForm] = useState({ key: '', name_ko: '', name_en: '', country: '', sort_order: '0' });
  const [brandForm, setBrandForm] = useState({ name_ko: '', name_en: '' });
  const [modelForm, setModelForm] = useState({ model_name: '', model_code: '', description: '' });
  const [unitForm, setUnitForm] = useState({ key: '', name: '', symbol: '', sort_order: '0' });

  // ── Loaders ───────────────────────────────────────────────────────────────
  const loadTypes = useCallback(async () => {
    try { setTypes(await api.devices.types.list()); } catch (e) { setError(String(e)); }
  }, []);

  const loadManufacturers = useCallback(async () => {
    try { setManufacturers(await api.devices.manufacturers.list()); } catch (e) { setError(String(e)); }
  }, []);

  const loadBrands = useCallback(async (mfrId?: string) => {
    try { setBrands(await api.devices.brands.list(mfrId)); } catch (e) { setError(String(e)); }
  }, []);

  const loadModels = useCallback(async (filters?: { device_type_id?: string; manufacturer_id?: string; brand_id?: string }) => {
    try { setModels(await api.devices.models.list(filters)); } catch (e) { setError(String(e)); }
  }, []);

  const loadUnits = useCallback(async () => {
    try { setUnits(await api.devices.units.list()); } catch (e) { setError(String(e)); }
  }, []);

  useEffect(() => {
    void loadTypes();
    void loadManufacturers();
    void loadUnits();
  }, [loadTypes, loadManufacturers, loadUnits]);

  useEffect(() => {
    void loadBrands(selectedMfr?.id);
    setSelectedBrand(null);
    setSelectedModel(null);
  }, [selectedMfr?.id, loadBrands]);

  useEffect(() => {
    const filters: { device_type_id?: string; manufacturer_id?: string; brand_id?: string } = {};
    if (selectedType) filters.device_type_id = selectedType.id;
    if (selectedMfr) filters.manufacturer_id = selectedMfr.id;
    if (selectedBrand) filters.brand_id = selectedBrand.id;
    void loadModels(filters);
    setSelectedModel(null);
  }, [selectedType?.id, selectedMfr?.id, selectedBrand?.id, loadModels]);

  function flash(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  }

  // ── Open modal helpers ────────────────────────────────────────────────────
  function openCreateType() {
    setTypeForm({ key: '', name_ko: '', name_en: '', sort_order: '0' });
    setModal({ target: 'type', mode: 'create' });
  }
  function openEditType(item: DeviceType) {
    setTypeForm({ key: item.key, name_ko: item.name_ko, name_en: item.name_en, sort_order: String(item.sort_order) });
    setModal({ target: 'type', mode: 'edit', id: item.id });
  }
  function openCreateMfr() {
    setMfrForm({ key: '', name_ko: '', name_en: '', country: '', sort_order: '0' });
    setModal({ target: 'manufacturer', mode: 'create' });
  }
  function openEditMfr(item: DeviceManufacturer) {
    setMfrForm({ key: item.key, name_ko: item.name_ko, name_en: item.name_en, country: item.country ?? '', sort_order: String(item.sort_order) });
    setModal({ target: 'manufacturer', mode: 'edit', id: item.id });
  }
  function openCreateBrand() {
    if (!selectedMfr) { setError(t('admin.device.select_manufacturer')); return; }
    setBrandForm({ name_ko: '', name_en: '' });
    setModal({ target: 'brand', mode: 'create' });
  }
  function openEditBrand(item: DeviceBrand) {
    setBrandForm({ name_ko: item.name_ko, name_en: item.name_en });
    setModal({ target: 'brand', mode: 'edit', id: item.id });
  }
  function openCreateModel() {
    if (!selectedType) { setError(t('admin.device.select_type')); return; }
    if (!selectedMfr) { setError(t('admin.device.select_manufacturer')); return; }
    setModelForm({ model_name: '', model_code: '', description: '' });
    setModal({ target: 'model', mode: 'create' });
  }
  function openEditModel(item: DeviceModel) {
    setModelForm({ model_name: item.model_name, model_code: item.model_code ?? '', description: item.description ?? '' });
    setModal({ target: 'model', mode: 'edit', id: item.id });
  }
  function openCreateUnit() {
    setUnitForm({ key: '', name: '', symbol: '', sort_order: '0' });
    setModal({ target: 'unit', mode: 'create' });
  }
  function openEditUnit(item: MeasurementUnit) {
    setUnitForm({ key: item.key, name: item.name, symbol: item.symbol ?? '', sort_order: String(item.sort_order) });
    setModal({ target: 'unit', mode: 'edit', id: item.id });
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!modal) return;
    setSaving(true);
    setError('');
    try {
      const { target, mode, id } = modal;

      if (target === 'type') {
        if (!typeForm.name_ko || !typeForm.name_en) throw new Error('name_ko and name_en required');
        if (mode === 'create') {
          await api.devices.types.create({ key: typeForm.key || undefined, name_ko: typeForm.name_ko, name_en: typeForm.name_en, sort_order: parseInt(typeForm.sort_order, 10) });
        } else if (id) {
          await api.devices.types.update(id, { name_ko: typeForm.name_ko, name_en: typeForm.name_en, sort_order: parseInt(typeForm.sort_order, 10) });
        }
        await loadTypes();
      }

      if (target === 'manufacturer') {
        if (!mfrForm.name_ko || !mfrForm.name_en) throw new Error('name_ko and name_en required');
        if (mode === 'create') {
          await api.devices.manufacturers.create({ key: mfrForm.key || undefined, name_ko: mfrForm.name_ko, name_en: mfrForm.name_en, country: mfrForm.country || undefined, sort_order: parseInt(mfrForm.sort_order, 10) });
        } else if (id) {
          await api.devices.manufacturers.update(id, { name_ko: mfrForm.name_ko, name_en: mfrForm.name_en, country: mfrForm.country || undefined, sort_order: parseInt(mfrForm.sort_order, 10) });
        }
        await loadManufacturers();
      }

      if (target === 'brand') {
        if (!brandForm.name_ko || !brandForm.name_en) throw new Error('name_ko and name_en required');
        if (mode === 'create' && selectedMfr) {
          await api.devices.brands.create({ manufacturer_id: selectedMfr.id, name_ko: brandForm.name_ko, name_en: brandForm.name_en });
        } else if (id) {
          await api.devices.brands.update(id, { name_ko: brandForm.name_ko, name_en: brandForm.name_en });
        }
        await loadBrands(selectedMfr?.id);
      }

      if (target === 'model') {
        if (!modelForm.model_name) throw new Error('model_name required');
        if (mode === 'create' && selectedType && selectedMfr) {
          await api.devices.models.create({ device_type_id: selectedType.id, manufacturer_id: selectedMfr.id, brand_id: selectedBrand?.id, model_name: modelForm.model_name, model_code: modelForm.model_code || undefined, description: modelForm.description || undefined });
        } else if (id) {
          await api.devices.models.update(id, { model_name: modelForm.model_name, model_code: modelForm.model_code || undefined, description: modelForm.description || undefined });
        }
        const filters: { device_type_id?: string; manufacturer_id?: string; brand_id?: string } = {};
        if (selectedType) filters.device_type_id = selectedType.id;
        if (selectedMfr) filters.manufacturer_id = selectedMfr.id;
        if (selectedBrand) filters.brand_id = selectedBrand.id;
        await loadModels(filters);
      }

      if (target === 'unit') {
        if (!unitForm.key || !unitForm.name) throw new Error('key and name required');
        if (mode === 'create') {
          await api.devices.units.create({ key: unitForm.key, name: unitForm.name, symbol: unitForm.symbol || undefined, sort_order: parseInt(unitForm.sort_order, 10) });
        } else if (id) {
          await api.devices.units.update(id, { name: unitForm.name, symbol: unitForm.symbol || undefined, sort_order: parseInt(unitForm.sort_order, 10) });
        }
        await loadUnits();
      }

      flash(t('admin.master.msg_success'));
      setModal(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(target: ModalTarget, id: string) {
    if (!confirm('삭제(비활성)하시겠습니까?')) return;
    try {
      if (target === 'type') { await api.devices.types.delete(id); await loadTypes(); }
      if (target === 'manufacturer') { await api.devices.manufacturers.delete(id); await loadManufacturers(); }
      if (target === 'brand') { await api.devices.brands.delete(id); await loadBrands(selectedMfr?.id); }
      if (target === 'model') { await api.devices.models.delete(id); const f: { device_type_id?: string; manufacturer_id?: string; brand_id?: string } = {}; if (selectedType) f.device_type_id = selectedType.id; if (selectedMfr) f.manufacturer_id = selectedMfr.id; if (selectedBrand) f.brand_id = selectedBrand.id; await loadModels(f); }
      flash(t('admin.master.msg_success'));
    } catch (e) { setError(String(e)); }
  }

  // ── Render helpers ────────────────────────────────────────────────────────
  function StatusBadge({ status }: { status: string }) {
    return <span className={`badge ${status === 'active' ? 'badge-green' : 'badge-gray'}`}>{status === 'active' ? t('admin.master.active') : t('admin.master.inactive')}</span>;
  }

  function Col({ title, onAdd, children }: { title: string; onAdd: () => void; children: React.ReactNode }) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-title">{title}</div>
          <button className="btn btn-primary btn-sm" onClick={onAdd}>+ {t('admin.master.btn_add')}</button>
        </div>
        <div className="master-column-list">{children}</div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="topbar">
        <div className="topbar-title">🔬 {t('admin.device.title')}</div>
      </div>
      <div className="content">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button className={`btn ${activeTab === 'devices' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('devices')}>{t('admin.device.title')}</button>
          <button className={`btn ${activeTab === 'units' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('units')}>{t('admin.device.units')}</button>
        </div>

        {activeTab === 'devices' && (
          <>
            <div className="alert" style={{ marginBottom: 12 }}>{t('admin.device.guide')}</div>
            <div className="master-explorer-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
              {/* Column 1: Device Types */}
              <Col title={t('admin.device.types')} onAdd={openCreateType}>
                {types.length === 0 && <div className="master-empty">{t('admin.device.empty')}</div>}
                {types.map(item => (
                  <button key={item.id}
                    className={`master-row-btn ${selectedType?.id === item.id ? 'active' : ''}`}
                    onClick={() => { setSelectedType(item); setSelectedMfr(null); setSelectedBrand(null); setSelectedModel(null); }}
                  >
                    <div>
                      <div className="master-row-title">{item.name_ko}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.name_en}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                      <StatusBadge status={item.status} />
                      <button className="btn btn-secondary btn-sm" style={{ fontSize: 10, padding: '1px 6px' }}
                        onClick={(e) => { e.stopPropagation(); openEditType(item); }}>
                        {t('admin.master.btn_edit')}
                      </button>
                    </div>
                  </button>
                ))}
              </Col>

              {/* Column 2: Manufacturers */}
              <Col title={t('admin.device.manufacturers')} onAdd={openCreateMfr}>
                {manufacturers.length === 0 && <div className="master-empty">{t('admin.device.empty')}</div>}
                {manufacturers.map(item => (
                  <button key={item.id}
                    className={`master-row-btn ${selectedMfr?.id === item.id ? 'active' : ''}`}
                    onClick={() => { setSelectedMfr(item); setSelectedBrand(null); setSelectedModel(null); }}
                  >
                    <div>
                      <div className="master-row-title">{item.name_ko}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.country ?? ''}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                      <StatusBadge status={item.status} />
                      <button className="btn btn-secondary btn-sm" style={{ fontSize: 10, padding: '1px 6px' }}
                        onClick={(e) => { e.stopPropagation(); openEditMfr(item); }}>
                        {t('admin.master.btn_edit')}
                      </button>
                    </div>
                  </button>
                ))}
              </Col>

              {/* Column 3: Brands */}
              <Col title={t('admin.device.brands')} onAdd={openCreateBrand}>
                {!selectedMfr && <div className="master-empty">{t('admin.device.select_manufacturer')}</div>}
                {selectedMfr && brands.length === 0 && <div className="master-empty">{t('admin.device.empty')}</div>}
                {selectedMfr && brands.map(item => (
                  <button key={item.id}
                    className={`master-row-btn ${selectedBrand?.id === item.id ? 'active' : ''}`}
                    onClick={() => { setSelectedBrand(item); setSelectedModel(null); }}
                  >
                    <div>
                      <div className="master-row-title">{item.name_ko}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.name_en}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                      <StatusBadge status={item.status} />
                      <button className="btn btn-secondary btn-sm" style={{ fontSize: 10, padding: '1px 6px' }}
                        onClick={(e) => { e.stopPropagation(); openEditBrand(item); }}>
                        {t('admin.master.btn_edit')}
                      </button>
                    </div>
                  </button>
                ))}
              </Col>

              {/* Column 4: Models */}
              <Col title={t('admin.device.models')} onAdd={openCreateModel}>
                {!selectedType && <div className="master-empty">{t('admin.device.select_type')}</div>}
                {selectedType && models.length === 0 && <div className="master-empty">{t('admin.device.empty')}</div>}
                {selectedType && models.map(item => (
                  <button key={item.id}
                    className={`master-row-btn ${selectedModel?.id === item.id ? 'active' : ''}`}
                    onClick={() => setSelectedModel(item)}
                  >
                    <div>
                      <div className="master-row-title">{item.model_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.model_code ?? ''} {item.mfr_name_en ?? ''}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                      <StatusBadge status={item.status} />
                      <button className="btn btn-secondary btn-sm" style={{ fontSize: 10, padding: '1px 6px' }}
                        onClick={(e) => { e.stopPropagation(); openEditModel(item); }}>
                        {t('admin.master.btn_edit')}
                      </button>
                    </div>
                  </button>
                ))}
              </Col>
            </div>

            {/* Detail panel */}
            {selectedModel && (
              <div className="card" style={{ marginTop: 12 }}>
                <div className="card-header">
                  <div className="card-title">{selectedModel.model_name}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEditModel(selectedModel)}>{t('admin.master.btn_edit')}</button>
                    <button className="btn btn-danger btn-sm" onClick={() => void handleDelete('model', selectedModel.id)}>{t('admin.master.btn_delete')}</button>
                  </div>
                </div>
                <div style={{ padding: '8px 12px', fontSize: 13, color: 'var(--text-muted)' }}>
                  <div>{t('admin.device.device_type')}: {selectedModel.type_name_ko ?? '—'}</div>
                  <div>{t('admin.device.manufacturer')}: {selectedModel.mfr_name_ko ?? '—'}</div>
                  <div>{t('admin.device.brand')}: {selectedModel.brand_name_ko ?? '—'}</div>
                  {selectedModel.model_code && <div>{t('admin.device.model_code')}: {selectedModel.model_code}</div>}
                  {selectedModel.description && <div>{t('admin.device.description')}: {selectedModel.description}</div>}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'units' && (
          <div className="card">
            <div className="card-header">
              <div className="card-title">{t('admin.device.units')}</div>
              <button className="btn btn-primary btn-sm" onClick={openCreateUnit}>+ {t('admin.master.btn_add')}</button>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>{t('admin.device.key')}</th>
                  <th>{t('admin.device.model_name')}</th>
                  <th>{t('admin.device.symbol')}</th>
                  <th>{t('admin.master.field_sort')}</th>
                  <th>{t('admin.master.active')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {units.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{u.key}</td>
                    <td>{u.name}</td>
                    <td>{u.symbol ?? '—'}</td>
                    <td>{u.sort_order}</td>
                    <td><StatusBadge status={u.status} /></td>
                    <td><button className="btn btn-secondary btn-sm" onClick={() => openEditUnit(u)}>{t('admin.master.btn_edit')}</button></td>
                  </tr>
                ))}
                {units.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 16 }}>{t('admin.device.empty')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <div className="modal-title">
                {modal.mode === 'create' ? t('admin.master.btn_add') : t('admin.master.btn_edit')}
                {' — '}
                {modal.target === 'type' && t('admin.device.types')}
                {modal.target === 'manufacturer' && t('admin.device.manufacturers')}
                {modal.target === 'brand' && t('admin.device.brands')}
                {modal.target === 'model' && t('admin.device.models')}
                {modal.target === 'unit' && t('admin.device.units')}
              </div>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-error" style={{ marginBottom: 8 }}>{error}</div>}

              {modal.target === 'type' && (
                <>
                  {modal.mode === 'create' && (
                    <div className="form-group">
                      <label className="form-label">{t('admin.device.key')}</label>
                      <input className="form-input font-mono" value={typeForm.key} onChange={e => setTypeForm(f => ({ ...f, key: e.target.value }))} placeholder="glucose_meter" />
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">{t('admin.device.name_ko')} *</label>
                    <input className="form-input" value={typeForm.name_ko} onChange={e => setTypeForm(f => ({ ...f, name_ko: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.device.name_en')} *</label>
                    <input className="form-input" value={typeForm.name_en} onChange={e => setTypeForm(f => ({ ...f, name_en: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.master.field_sort')}</label>
                    <input className="form-input" type="number" value={typeForm.sort_order} onChange={e => setTypeForm(f => ({ ...f, sort_order: e.target.value }))} />
                  </div>
                </>
              )}

              {modal.target === 'manufacturer' && (
                <>
                  {modal.mode === 'create' && (
                    <div className="form-group">
                      <label className="form-label">{t('admin.device.key')}</label>
                      <input className="form-input font-mono" value={mfrForm.key} onChange={e => setMfrForm(f => ({ ...f, key: e.target.value }))} placeholder="abbott" />
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">{t('admin.device.name_ko')} *</label>
                    <input className="form-input" value={mfrForm.name_ko} onChange={e => setMfrForm(f => ({ ...f, name_ko: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.device.name_en')} *</label>
                    <input className="form-input" value={mfrForm.name_en} onChange={e => setMfrForm(f => ({ ...f, name_en: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.device.country')}</label>
                    <input className="form-input" value={mfrForm.country} onChange={e => setMfrForm(f => ({ ...f, country: e.target.value }))} placeholder="US" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.master.field_sort')}</label>
                    <input className="form-input" type="number" value={mfrForm.sort_order} onChange={e => setMfrForm(f => ({ ...f, sort_order: e.target.value }))} />
                  </div>
                </>
              )}

              {modal.target === 'brand' && (
                <>
                  <div className="form-group">
                    <label className="form-label">{t('admin.device.manufacturer')}</label>
                    <input className="form-input" value={selectedMfr?.name_ko ?? ''} readOnly />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.device.name_ko')} *</label>
                    <input className="form-input" value={brandForm.name_ko} onChange={e => setBrandForm(f => ({ ...f, name_ko: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.device.name_en')} *</label>
                    <input className="form-input" value={brandForm.name_en} onChange={e => setBrandForm(f => ({ ...f, name_en: e.target.value }))} />
                  </div>
                </>
              )}

              {modal.target === 'model' && (
                <>
                  <div className="form-group">
                    <label className="form-label">{t('admin.device.device_type')}</label>
                    <input className="form-input" value={selectedType?.name_ko ?? ''} readOnly />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.device.manufacturer')}</label>
                    <input className="form-input" value={selectedMfr?.name_ko ?? ''} readOnly />
                  </div>
                  {selectedBrand && (
                    <div className="form-group">
                      <label className="form-label">{t('admin.device.brand')}</label>
                      <input className="form-input" value={selectedBrand.name_ko} readOnly />
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">{t('admin.device.model_name')} *</label>
                    <input className="form-input" value={modelForm.model_name} onChange={e => setModelForm(f => ({ ...f, model_name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.device.model_code')}</label>
                    <input className="form-input font-mono" value={modelForm.model_code} onChange={e => setModelForm(f => ({ ...f, model_code: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.device.description')}</label>
                    <input className="form-input" value={modelForm.description} onChange={e => setModelForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                </>
              )}

              {modal.target === 'unit' && (
                <>
                  {modal.mode === 'create' && (
                    <div className="form-group">
                      <label className="form-label">{t('admin.device.key')} *</label>
                      <input className="form-input font-mono" value={unitForm.key} onChange={e => setUnitForm(f => ({ ...f, key: e.target.value }))} placeholder="mg_dl" />
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">{t('admin.device.model_name')} *</label>
                    <input className="form-input" value={unitForm.name} onChange={e => setUnitForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.device.symbol')}</label>
                    <input className="form-input" value={unitForm.symbol} onChange={e => setUnitForm(f => ({ ...f, symbol: e.target.value }))} placeholder="mg/dL" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.master.field_sort')}</label>
                    <input className="form-input" type="number" value={unitForm.sort_order} onChange={e => setUnitForm(f => ({ ...f, sort_order: e.target.value }))} />
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              {modal.mode === 'edit' && modal.id && modal.target !== 'unit' && (
                <button className="btn btn-danger" style={{ marginRight: 'auto' }}
                  onClick={() => void handleDelete(modal.target, modal.id!).then(() => setModal(null))}>
                  {t('admin.master.btn_delete')}
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => setModal(null)}>{t('admin.master.btn_cancel')}</button>
              <button className="btn btn-primary" onClick={() => void handleSave()} disabled={saving}>{t('admin.master.btn_save')}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
