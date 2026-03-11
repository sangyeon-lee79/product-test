import { useEffect, useState, useCallback } from 'react';
import { api, type DeviceType, type DeviceManufacturer, type DeviceBrand, type DeviceModel, type MeasurementUnit } from '../lib/api';
import { useI18n, useT, LANG_LABELS, SUPPORTED_LANGS } from '../lib/i18n';
import { emptyTrans, itemLabel, sortCatalog, i18nRowToTranslations, autoTranslate, findMissingTranslationLangs, type CatalogSortMode } from '../lib/catalogUtils';
import { TranslationFields } from '../components/TranslationFields';
import { CatalogCol, CatalogStatusBadge, CatalogModelDetail, CatalogListThumb, type ModelDetailField } from '../components/CatalogGrid';

type Tab = 'devices' | 'units';
type ModalTarget = 'manufacturer' | 'brand' | 'model' | 'unit';

export default function DevicePage() {
  const t = useT();
  const { lang } = useI18n();
  const [activeTab, setActiveTab] = useState<Tab>('devices');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [types, setTypes] = useState<DeviceType[]>([]);
  const [manufacturers, setManufacturers] = useState<DeviceManufacturer[]>([]);
  const [brands, setBrands] = useState<DeviceBrand[]>([]);
  const [models, setModels] = useState<DeviceModel[]>([]);
  const [units, setUnits] = useState<MeasurementUnit[]>([]);

  const [selectedType, setSelectedType] = useState<DeviceType | null>(null);
  const [selectedMfr, setSelectedMfr] = useState<DeviceManufacturer | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<DeviceBrand | null>(null);
  const [selectedModel, setSelectedModel] = useState<DeviceModel | null>(null);

  const [typeSort, setTypeSort] = useState<CatalogSortMode>('count_desc');
  const [mfrSort, setMfrSort] = useState<CatalogSortMode>('count_desc');
  const [brandSort, setBrandSort] = useState<CatalogSortMode>('count_desc');

  const [modal, setModal] = useState<{ target: ModalTarget; mode: 'create' | 'edit'; id?: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);

  const [mfrForm, setMfrForm] = useState({ key: '', country: '', sort_order: '0' });
  const [mfrTrans, setMfrTrans] = useState<Record<string, string>>(emptyTrans());
  const [brandForm, setBrandForm] = useState({ key: '', sort_order: '0' });
  const [brandTrans, setBrandTrans] = useState<Record<string, string>>(emptyTrans());
  const [modelForm, setModelForm] = useState({ key: '', sort_order: '0', model_code: '', description: '' });
  const [modelTrans, setModelTrans] = useState<Record<string, string>>(emptyTrans());
  const [unitForm, setUnitForm] = useState({ key: '', name: '', symbol: '', sort_order: '0' });
  const [mfrParentTypeIds, setMfrParentTypeIds] = useState<string[]>([]);
  const [brandParentTypeIds, setBrandParentTypeIds] = useState<string[]>([]);
  const [brandParentMfrIds, setBrandParentMfrIds] = useState<string[]>([]);
  const [modelParentTypeIds, setModelParentTypeIds] = useState<string[]>([]);
  const [modelParentMfrId, setModelParentMfrId] = useState<string>('');
  const [modelParentBrandIds, setModelParentBrandIds] = useState<string[]>([]);

  const loadTypes = useCallback(async () => {
    try {
      const rows = await api.devices.types.list(lang);
      setTypes(sortCatalog(rows, typeSort));
    } catch (e) {
      setError(String(e));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const loadManufacturers = useCallback(async (typeId?: string) => {
    try {
      const rows = await api.devices.manufacturers.list(lang, typeId);
      setManufacturers(sortCatalog(rows, mfrSort));
    } catch (e) {
      setError(String(e));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const loadBrands = useCallback(async (mfrId?: string, typeId?: string) => {
    try {
      const rows = await api.devices.brands.list(mfrId, typeId);
      setBrands(sortCatalog(rows, brandSort));
    } catch (e) {
      setError(String(e));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadModels = useCallback(async (filters?: { device_type_id?: string; manufacturer_id?: string; brand_id?: string }) => {
    try {
      setModels(await api.devices.models.list(filters));
    } catch (e) {
      setError(String(e));
    }
  }, []);

  const loadUnits = useCallback(async () => {
    try {
      setUnits(await api.devices.units.list());
    } catch (e) {
      setError(String(e));
    }
  }, []);

  useEffect(() => {
    void loadTypes();
    void loadUnits();
  }, [loadTypes, loadUnits]);

  // Re-sort in place when sort mode changes (no re-fetch)
  useEffect(() => { setTypes(prev => prev.length ? sortCatalog(prev, typeSort) : prev); }, [typeSort]);
  useEffect(() => { setManufacturers(prev => prev.length ? sortCatalog(prev, mfrSort) : prev); }, [mfrSort]);
  useEffect(() => { setBrands(prev => prev.length ? sortCatalog(prev, brandSort) : prev); }, [brandSort]);

  useEffect(() => {
    void loadManufacturers(selectedType?.id);
    setSelectedMfr(null);
    setSelectedBrand(null);
    setSelectedModel(null);
  }, [selectedType?.id, loadManufacturers]);

  useEffect(() => {
    void loadBrands(selectedMfr?.id, selectedType?.id);
    setSelectedBrand(null);
    setSelectedModel(null);
  }, [selectedMfr?.id, selectedType?.id, loadBrands]);

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

  function openCreateMfr() {
    setMfrForm({ key: '', country: '', sort_order: '0' });
    setMfrTrans(emptyTrans());
    setMfrParentTypeIds(selectedType ? [selectedType.id] : []);
    setModal({ target: 'manufacturer', mode: 'create' });
  }

  function openEditMfr(item: DeviceManufacturer) {
    setMfrForm({
      key: item.key || '',
      country: item.country || '',
      sort_order: String(item.sort_order || 0),
    });
    setMfrTrans({ ...emptyTrans(), ko: item.name_ko || '', en: item.name_en || '' });
    setMfrParentTypeIds((item.parent_type_ids || '').split(',').map((v) => v.trim()).filter(Boolean));
    setModal({ target: 'manufacturer', mode: 'edit', id: item.id });
    if (item.name_key) {
      void api.i18n.list({ prefix: item.name_key, limit: 50 }).then((res) => {
        const row = res.items.find((it) => it.key === item.name_key);
        if (row) setMfrTrans(i18nRowToTranslations(row));
      }).catch(() => {});
    }
  }

  function openCreateBrand() {
    setBrandForm({ key: '', sort_order: '0' });
    setBrandTrans(emptyTrans());
    setBrandParentTypeIds(selectedType ? [selectedType.id] : []);
    setBrandParentMfrIds(selectedMfr ? [selectedMfr.id] : []);
    if (manufacturers.length === 0) void loadManufacturers();
    setModal({ target: 'brand', mode: 'create' });
  }

  function openEditBrand(item: DeviceBrand) {
    setBrandForm({ key: item.key || '', sort_order: String(item.sort_order || 0) });
    setBrandTrans({ ...emptyTrans(), ko: item.name_ko || '', en: item.name_en || '' });
    setBrandParentTypeIds((item.parent_type_ids || '').split(',').map((v) => v.trim()).filter(Boolean));
    const parentIds = (item.parent_mfr_ids || '').split(',').map((v) => v.trim()).filter(Boolean);
    setBrandParentMfrIds(parentIds.length > 0 ? parentIds : selectedMfr ? [selectedMfr.id] : []);
    setModal({ target: 'brand', mode: 'edit', id: item.id });
    if (item.name_key) {
      void api.i18n.list({ prefix: item.name_key, limit: 50 }).then((res) => {
        const row = res.items.find((it) => it.key === item.name_key);
        if (row) setBrandTrans(i18nRowToTranslations(row));
      }).catch(() => {});
    }
    if (manufacturers.length === 0) void loadManufacturers();
  }

  function openCreateModel() {
    setModelForm({ key: '', sort_order: '0', model_code: '', description: '' });
    setModelTrans(emptyTrans());
    setModelParentTypeIds(selectedType ? [selectedType.id] : []);
    setModelParentMfrId(selectedMfr?.id || '');
    setModelParentBrandIds(selectedBrand ? [selectedBrand.id] : []);
    if (manufacturers.length === 0) void loadManufacturers();
    setModal({ target: 'model', mode: 'create' });
  }

  function openEditModel(item: DeviceModel) {
    setModelForm({
      key: item.key || '',
      sort_order: String(item.sort_order || 0),
      model_code: item.model_code ?? '',
      description: item.description ?? '',
    });
    setModelTrans({ ...emptyTrans(), ko: item.model_name || '', en: item.model_name || '' });
    setModelParentTypeIds((item.parent_type_ids || '').split(',').map((v) => v.trim()).filter(Boolean));
    setModelParentMfrId(item.manufacturer_id || selectedMfr?.id || '');
    const parentIds = (item.parent_brand_ids || '').split(',').map((v) => v.trim()).filter(Boolean);
    setModelParentBrandIds(parentIds.length > 0 ? parentIds : selectedBrand ? [selectedBrand.id] : []);
    setModal({ target: 'model', mode: 'edit', id: item.id });
    if (item.name_key) {
      void api.i18n.list({ prefix: item.name_key, limit: 50 }).then((res) => {
        const row = res.items.find((it) => it.key === item.name_key);
        if (row) setModelTrans(i18nRowToTranslations(row));
      }).catch(() => {});
    }
    if (item.manufacturer_id) void loadBrands(item.manufacturer_id, selectedType?.id);
    else if (manufacturers.length === 0) void loadManufacturers();
  }

  function openCreateUnit() {
    setUnitForm({ key: '', name: '', symbol: '', sort_order: '0' });
    setModal({ target: 'unit', mode: 'create' });
  }

  function openEditUnit(item: MeasurementUnit) {
    setUnitForm({ key: item.key, name: item.name, symbol: item.symbol ?? '', sort_order: String(item.sort_order) });
    setModal({ target: 'unit', mode: 'edit', id: item.id });
  }

  async function handleSave() {
    if (!modal) return;
    setSaving(true);
    setError('');
    try {
      const { target, mode, id } = modal;

      if (target === 'manufacturer') {
        if (mfrParentTypeIds.length === 0) throw new Error(t('admin.master.err_required'));
        const ko = (mfrTrans.ko || '').trim();
        if (!ko) throw new Error(t('admin.master.err_required'));
        const key = (mfrForm.key || '').trim().replace(/^master\./, '');
        if (key && !/^[a-z0-9_]+$/.test(key)) throw new Error(t('admin.master.err_key_fmt'));
        let translations: Record<string, string> = { ...mfrTrans, ko };
        const hasMissing = SUPPORTED_LANGS.some((langCode) => langCode !== 'ko' && !(translations[langCode] || '').trim());
        if (hasMissing) {
          const result = await api.i18n.translate(ko, translations);
          translations = { ...result.translations, ...translations, ko };
        }
        const missingLangs = findMissingTranslationLangs(translations);
        if (missingLangs.length > 0) {
          throw new Error(t('admin.master.err_trans_missing').replace('{langs}', missingLangs.map((langCode) => (LANG_LABELS as Record<string, string>)[langCode] || langCode).join(', ')));
        }
        const payload = {
          key: mode === 'create' ? key || undefined : undefined,
          name_ko: ko,
          name_en: translations.en || undefined,
          country: mfrForm.country || undefined,
          sort_order: parseInt(mfrForm.sort_order, 10) || 0,
          parent_type_ids: mfrParentTypeIds,
          translations,
        };
        if (mode === 'create') {
          await api.devices.manufacturers.create(payload);
        } else if (id) {
          await api.devices.manufacturers.update(id, payload);
        }
        await loadManufacturers();
      }

      if (target === 'brand') {
        if (brandParentTypeIds.length === 0 || brandParentMfrIds.length === 0) throw new Error(t('admin.master.err_required'));
        const ko = (brandTrans.ko || '').trim();
        if (!ko) throw new Error(t('admin.master.err_required'));
        const key = (brandForm.key || '').trim().replace(/^master\./, '');
        if (key && !/^[a-z0-9_]+$/.test(key)) throw new Error(t('admin.master.err_key_fmt'));
        let translations: Record<string, string> = { ...brandTrans, ko };
        const hasMissing = SUPPORTED_LANGS.some((langCode) => langCode !== 'ko' && !(translations[langCode] || '').trim());
        if (hasMissing) {
          const result = await api.i18n.translate(ko, translations);
          translations = { ...result.translations, ...translations, ko };
        }
        const missingLangs = findMissingTranslationLangs(translations);
        if (missingLangs.length > 0) {
          throw new Error(t('admin.master.err_trans_missing').replace('{langs}', missingLangs.map((langCode) => (LANG_LABELS as Record<string, string>)[langCode] || langCode).join(', ')));
        }
        const payload = {
          key: mode === 'create' ? key || undefined : undefined,
          name_ko: ko,
          name_en: translations.en || undefined,
          manufacturer_id: brandParentMfrIds[0],
          manufacturer_ids: brandParentMfrIds,
          parent_type_ids: brandParentTypeIds,
          sort_order: parseInt(brandForm.sort_order, 10) || 0,
          translations,
        };
        if (mode === 'create') {
          await api.devices.brands.create(payload);
        } else if (id) {
          await api.devices.brands.update(id, payload);
        }
        await loadBrands(brandParentMfrIds[0] || selectedMfr?.id, selectedType?.id);
      }

      if (target === 'model') {
        if (modelParentTypeIds.length === 0 || !modelParentMfrId || modelParentBrandIds.length === 0) throw new Error(t('admin.master.err_required'));
        const ko = (modelTrans.ko || '').trim();
        if (!ko) throw new Error(t('admin.master.err_required'));
        const key = (modelForm.key || '').trim().replace(/^master\./, '');
        if (key && !/^[a-z0-9_]+$/.test(key)) throw new Error(t('admin.master.err_key_fmt'));
        let translations: Record<string, string> = { ...modelTrans, ko };
        const hasMissing = SUPPORTED_LANGS.some((langCode) => langCode !== 'ko' && !(translations[langCode] || '').trim());
        if (hasMissing) {
          const result = await api.i18n.translate(ko, translations);
          translations = { ...result.translations, ...translations, ko };
        }
        const missingLangs = findMissingTranslationLangs(translations);
        if (missingLangs.length > 0) {
          throw new Error(t('admin.master.err_trans_missing').replace('{langs}', missingLangs.map((langCode) => (LANG_LABELS as Record<string, string>)[langCode] || langCode).join(', ')));
        }
        const payload = {
          key: mode === 'create' ? key || undefined : undefined,
          device_type_id: modelParentTypeIds[0],
          parent_type_ids: modelParentTypeIds,
          manufacturer_id: modelParentMfrId,
          brand_id: modelParentBrandIds[0],
          brand_ids: modelParentBrandIds,
          model_name: ko,
          name_ko: ko,
          name_en: translations.en || undefined,
          sort_order: parseInt(modelForm.sort_order, 10) || 0,
          translations,
          model_code: modelForm.model_code || undefined,
          description: modelForm.description || undefined,
        };
        if (mode === 'create') {
          await api.devices.models.create(payload);
        } else if (id) {
          await api.devices.models.update(id, payload);
        }
        const filters: { device_type_id?: string; manufacturer_id?: string; brand_id?: string } = {};
        filters.device_type_id = modelParentTypeIds[0] || selectedType?.id;
        filters.manufacturer_id = modelParentMfrId || selectedMfr?.id;
        filters.brand_id = modelParentBrandIds[0] || selectedBrand?.id;
        await loadModels(filters);
      }

      if (target === 'unit') {
        if (!unitForm.key || !unitForm.name) throw new Error('key and name required');
        if (mode === 'create') {
          await api.devices.units.create({ key: unitForm.key, name: unitForm.name, symbol: unitForm.symbol || undefined, sort_order: parseInt(unitForm.sort_order, 10) || 0 });
        } else if (id) {
          await api.devices.units.update(id, { name: unitForm.name, symbol: unitForm.symbol || undefined, sort_order: parseInt(unitForm.sort_order, 10) || 0 });
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
    if (!confirm(t('admin.master.msg_confirm_delete', 'Delete this item?'))) return;
    try {
      if (target === 'manufacturer') {
        await api.devices.manufacturers.delete(id);
        await loadManufacturers();
      }
      if (target === 'brand') {
        await api.devices.brands.delete(id);
        await loadBrands(selectedMfr?.id, selectedType?.id);
      }
      if (target === 'model') {
        await api.devices.models.delete(id);
        const f: { device_type_id?: string; manufacturer_id?: string; brand_id?: string } = {};
        if (selectedType) f.device_type_id = selectedType.id;
        if (selectedMfr) f.manufacturer_id = selectedMfr.id;
        if (selectedBrand) f.brand_id = selectedBrand.id;
        await loadModels(f);
      }
      flash(t('admin.master.msg_success'));
    } catch (e) {
      setError(String(e));
    }
  }

  async function handleModelImageUpload(file: File) {
    if (!selectedModel) return;
    try {
      const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
      const presigned = await api.storage.presignedUrl({ type: 'product_image', ext, subdir: `device/${selectedModel.id}` });
      await fetch(presigned.upload_url, { method: 'PUT', headers: { 'Content-Type': file.type || 'application/octet-stream' }, body: file });
      await api.devices.models.update(selectedModel.id, { image_url: presigned.public_url });
      setSelectedModel({ ...selectedModel, image_url: presigned.public_url });
      setModels((prev) => prev.map((m) => m.id === selectedModel.id ? { ...m, image_url: presigned.public_url } : m));
    } catch (e) { setError(String(e)); }
  }

  async function handleModelImageRemove() {
    if (!selectedModel) return;
    try {
      await api.devices.models.update(selectedModel.id, { image_url: null });
      setSelectedModel({ ...selectedModel, image_url: null });
      setModels((prev) => prev.map((m) => m.id === selectedModel.id ? { ...m, image_url: null } : m));
    } catch (e) { setError(String(e)); }
  }

  async function handleModelImageUrlChange(url: string) {
    if (!selectedModel) return;
    try {
      await api.devices.models.update(selectedModel.id, { image_url: url });
      setSelectedModel({ ...selectedModel, image_url: url });
      setModels((prev) => prev.map((m) => m.id === selectedModel.id ? { ...m, image_url: url } : m));
    } catch (e) { setError(String(e)); }
  }

  const DEVICE_PLACEHOLDER = '/assets/images/placeholder_device.svg';
  const addLabel = t('admin.master.btn_add');
  function SBadge({ status }: { status: string }) { return <CatalogStatusBadge status={status} t={t} />; }

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">🔬 {t('admin.device.title')}</div>
      </div>
      <div className="content">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button className={`btn ${activeTab === 'devices' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('devices')}>{t('admin.device.title')}</button>
          <button className={`btn ${activeTab === 'units' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('units')}>{t('admin.device.units')}</button>
        </div>

        {activeTab === 'devices' && (
          <>
            <div className="alert" style={{ marginBottom: 12 }}>{t('admin.device.guide')}</div>
            <div className="master-explorer-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
              <CatalogCol title={t('admin.device.types')} sortMode={typeSort} onSortChange={setTypeSort}>
                {types.length === 0 && <div className="master-empty">{t('admin.device.empty')}</div>}
                {types.map((item) => (
                  <button
                    key={item.id}
                    className={`master-row-btn ${selectedType?.id === item.id ? 'active' : ''}`}
                    onClick={() => { setSelectedType(item); setSelectedMfr(null); setSelectedBrand(null); setSelectedModel(null); }}
                  >
                    <div>
                      <div className="master-row-title">{itemLabel(item)}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.key}</div>
                    </div>
                    <SBadge status={item.status} />
                  </button>
                ))}
              </CatalogCol>

              <CatalogCol title={t('admin.device.manufacturers')} onAdd={openCreateMfr} addLabel={addLabel} sortMode={mfrSort} onSortChange={setMfrSort}>
                {manufacturers.length === 0 && <div className="master-empty">{t('admin.device.empty')}</div>}
                {manufacturers.map((item) => (
                  <button
                    key={item.id}
                    className={`master-row-btn ${selectedMfr?.id === item.id ? 'active' : ''}`}
                    onClick={() => { setSelectedMfr(item); setSelectedBrand(null); setSelectedModel(null); }}
                  >
                    <div>
                      <div className="master-row-title">{itemLabel(item)}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.country ?? ''}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                      <SBadge status={item.status} />
                      <button className="btn btn-secondary btn-sm" style={{ fontSize: 10, padding: '1px 6px' }} title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')} onClick={(e) => { e.stopPropagation(); openEditMfr(item); }}>✏️</button>
                    </div>
                  </button>
                ))}
              </CatalogCol>

              <CatalogCol title={t('admin.device.brands')} onAdd={openCreateBrand} addLabel={addLabel} sortMode={brandSort} onSortChange={setBrandSort}>
                {!selectedMfr && <div className="master-empty">{t('admin.device.select_manufacturer')}</div>}
                {selectedMfr && brands.length === 0 && <div className="master-empty">{t('admin.device.empty')}</div>}
                {selectedMfr && brands.map((item) => (
                  <button key={item.id} className={`master-row-btn ${selectedBrand?.id === item.id ? 'active' : ''}`} onClick={() => { setSelectedBrand(item); setSelectedModel(null); }}>
                    <div>
                      <div className="master-row-title">{itemLabel(item)}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.name_ko}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                      <SBadge status={item.status} />
                      <button className="btn btn-secondary btn-sm" style={{ fontSize: 10, padding: '1px 6px' }} title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')} onClick={(e) => { e.stopPropagation(); openEditBrand(item); }}>✏️</button>
                    </div>
                  </button>
                ))}
              </CatalogCol>

              <CatalogCol title={t('admin.device.models')} onAdd={openCreateModel} addLabel={addLabel}>
                {!selectedType && <div className="master-empty">{t('admin.device.select_type')}</div>}
                {selectedType && models.length === 0 && <div className="master-empty">{t('admin.device.empty')}</div>}
                {selectedType && models.map((item) => (
                  <button key={item.id} className={`master-row-btn ${selectedModel?.id === item.id ? 'active' : ''}`} onClick={() => setSelectedModel(item)}>
                    <CatalogListThumb src={item.image_url} fallbackSrc={DEVICE_PLACEHOLDER} alt={item.model_name} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="master-row-title">{item.model_display_label || item.model_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.model_code ?? ''} {item.mfr_display_label ?? item.mfr_name_en ?? ''}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                      <SBadge status={item.status} />
                      <button className="btn btn-secondary btn-sm" style={{ fontSize: 10, padding: '1px 6px' }} title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')} onClick={(e) => { e.stopPropagation(); openEditModel(item); }}>✏️</button>
                    </div>
                  </button>
                ))}
              </CatalogCol>
            </div>

            {selectedModel && (
              <CatalogModelDetail
                title={selectedModel.model_display_label || selectedModel.model_name}
                onEdit={() => openEditModel(selectedModel)}
                onDelete={() => void handleDelete('model', selectedModel.id)}
                editLabel="✏️"
                deleteLabel="🗑️"
                imageUrl={selectedModel.image_url}
                fallbackImageSrc={DEVICE_PLACEHOLDER}
                onImageUpload={(file) => void handleModelImageUpload(file)}
                onImageRemove={() => void handleModelImageRemove()}
                onImageUrlChange={(url) => void handleModelImageUrlChange(url)}
                t={t}
                fields={[
                  { label: t('admin.device.device_type'), value: selectedModel.type_display_label || selectedModel.type_name_en || selectedModel.type_name_ko || '—' },
                  { label: t('admin.device.manufacturer'), value: selectedModel.mfr_display_label || selectedModel.mfr_name_en || selectedModel.mfr_name_ko || '—' },
                  { label: t('admin.device.brand'), value: selectedModel.brand_display_label || selectedModel.brand_name_en || selectedModel.brand_name_ko || '—' },
                  ...(selectedModel.model_code ? [{ label: t('admin.device.model_code'), value: selectedModel.model_code } satisfies ModelDetailField] : []),
                  ...(selectedModel.description ? [{ label: t('admin.device.description'), value: selectedModel.description } satisfies ModelDetailField] : []),
                ]}
              />
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
                {units.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{u.key}</td>
                    <td>{u.name}</td>
                    <td>{u.symbol ?? '—'}</td>
                    <td>{u.sort_order}</td>
                    <td><CatalogStatusBadge status={u.status} t={t} /></td>
                    <td><button className="btn btn-secondary btn-sm" title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')} onClick={() => openEditUnit(u)}>✏️</button></td>
                  </tr>
                ))}
                {units.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 16 }}>{t('admin.device.empty')}</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <div className="modal-title">
                {modal.mode === 'create' ? t('admin.master.btn_add') : t('admin.master.btn_edit')} {' — '}
                {modal.target === 'manufacturer' && t('admin.device.manufacturers')}
                {modal.target === 'brand' && t('admin.device.brands')}
                {modal.target === 'model' && t('admin.device.models')}
                {modal.target === 'unit' && t('admin.device.units')}
              </div>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {error && <div className="alert alert-error" style={{ marginBottom: 8 }}>{error}</div>}

              {modal.target === 'manufacturer' && (
                <>
                  <div className="form-group">
                    <label className="form-label">{t('admin.device.device_type')} *</label>
                    <div style={{ display: 'grid', gap: 6, maxHeight: 140, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
                      {types.map((row) => (
                        <label key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                          <input
                            type="checkbox"
                            checked={mfrParentTypeIds.includes(row.id)}
                            onChange={(e) => setMfrParentTypeIds((prev) => e.target.checked ? [...new Set([...prev, row.id])] : prev.filter((id) => id !== row.id))}
                          />
                          <span>{itemLabel(row)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.master.field_key')}</label>
                    {modal.mode === 'create' ? (
                      <input className="form-input font-mono" value={mfrForm.key} onChange={(e) => setMfrForm((f) => ({ ...f, key: e.target.value }))} placeholder={t('admin.master.ph_key')} />
                    ) : (
                      <input className="form-input font-mono" value={mfrForm.key} readOnly />
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.master.field_sort')}</label>
                    <input className="form-input" type="number" value={mfrForm.sort_order} onChange={(e) => setMfrForm((f) => ({ ...f, sort_order: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.device.country')}</label>
                    <input className="form-input" value={mfrForm.country} onChange={(e) => setMfrForm((f) => ({ ...f, country: e.target.value }))} placeholder="US" />
                  </div>
                  <TranslationFields translations={mfrTrans} onChange={setMfrTrans} translating={translating} onAutoTranslate={() => void autoTranslate(mfrTrans.ko, mfrTrans, setMfrTrans, setTranslating, setError)} t={t} />
                </>
              )}

              {modal.target === 'brand' && (
                <>
                  <div className="form-group">
                    <label className="form-label">{t('admin.device.device_type')} *</label>
                    <div style={{ display: 'grid', gap: 6, maxHeight: 140, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
                      {types.map((row) => (
                        <label key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                          <input
                            type="checkbox"
                            checked={brandParentTypeIds.includes(row.id)}
                            onChange={(e) => setBrandParentTypeIds((prev) => e.target.checked ? [...new Set([...prev, row.id])] : prev.filter((id) => id !== row.id))}
                          />
                          <span>{itemLabel(row)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.device.manufacturer')} *</label>
                    <div style={{ display: 'grid', gap: 6, maxHeight: 140, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
                      {manufacturers.map((row) => (
                        <label key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                          <input
                            type="checkbox"
                            checked={brandParentMfrIds.includes(row.id)}
                            onChange={(e) => setBrandParentMfrIds((prev) => e.target.checked ? [...new Set([...prev, row.id])] : prev.filter((id) => id !== row.id))}
                          />
                          <span>{itemLabel(row)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.master.field_key')}</label>
                    {modal.mode === 'create' ? (
                      <input className="form-input font-mono" value={brandForm.key} onChange={(e) => setBrandForm((f) => ({ ...f, key: e.target.value }))} placeholder={t('admin.master.ph_key')} />
                    ) : (
                      <input className="form-input font-mono" value={brandForm.key} readOnly />
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.master.field_sort')}</label>
                    <input className="form-input" type="number" value={brandForm.sort_order} onChange={(e) => setBrandForm((f) => ({ ...f, sort_order: e.target.value }))} />
                  </div>
                  <TranslationFields translations={brandTrans} onChange={setBrandTrans} translating={translating} onAutoTranslate={() => void autoTranslate(brandTrans.ko, brandTrans, setBrandTrans, setTranslating, setError)} t={t} />
                </>
              )}

              {modal.target === 'model' && (
                <>
                  <div className="form-group">
                    <label className="form-label">{t('admin.device.device_type')} *</label>
                    <div style={{ display: 'grid', gap: 6, maxHeight: 120, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
                      {types.map((row) => (
                        <label key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                          <input
                            type="checkbox"
                            checked={modelParentTypeIds.includes(row.id)}
                            onChange={(e) => setModelParentTypeIds((prev) => e.target.checked ? [...new Set([...prev, row.id])] : prev.filter((id) => id !== row.id))}
                          />
                          <span>{itemLabel(row)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.device.manufacturer')} *</label>
                    <select
                      className="form-input"
                      value={modelParentMfrId}
                      onChange={(e) => {
                        const mfrId = e.target.value;
                        setModelParentMfrId(mfrId);
                        setModelParentBrandIds([]);
                        if (mfrId) void loadBrands(mfrId, selectedType?.id);
                      }}
                    >
                      <option value="">{t('admin.device.select_manufacturer')}</option>
                      {manufacturers.map((row) => <option key={row.id} value={row.id}>{itemLabel(row)}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.device.brand')} *</label>
                    <div style={{ display: 'grid', gap: 6, maxHeight: 120, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
                      {brands.map((row) => (
                        <label key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                          <input
                            type="checkbox"
                            checked={modelParentBrandIds.includes(row.id)}
                            onChange={(e) => setModelParentBrandIds((prev) => e.target.checked ? [...new Set([...prev, row.id])] : prev.filter((id) => id !== row.id))}
                          />
                          <span>{itemLabel(row)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.master.field_key')}</label>
                    {modal.mode === 'create' ? (
                      <input className="form-input font-mono" value={modelForm.key} onChange={(e) => setModelForm((f) => ({ ...f, key: e.target.value }))} placeholder={t('admin.master.ph_key')} />
                    ) : (
                      <input className="form-input font-mono" value={modelForm.key} readOnly />
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.master.field_sort')}</label>
                    <input className="form-input" type="number" value={modelForm.sort_order} onChange={(e) => setModelForm((f) => ({ ...f, sort_order: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.device.model_code')}</label>
                    <input className="form-input font-mono" value={modelForm.model_code} onChange={(e) => setModelForm((f) => ({ ...f, model_code: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.device.description')}</label>
                    <input className="form-input" value={modelForm.description} onChange={(e) => setModelForm((f) => ({ ...f, description: e.target.value }))} />
                  </div>
                  <TranslationFields translations={modelTrans} onChange={setModelTrans} translating={translating} onAutoTranslate={() => void autoTranslate(modelTrans.ko, modelTrans, setModelTrans, setTranslating, setError)} t={t} />
                </>
              )}

              {modal.target === 'unit' && (
                <>
                  {modal.mode === 'create' && (
                    <div className="form-group">
                      <label className="form-label">{t('admin.device.key')} *</label>
                      <input className="form-input font-mono" value={unitForm.key} onChange={(e) => setUnitForm((f) => ({ ...f, key: e.target.value }))} placeholder="mg_dl" />
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">{t('admin.device.model_name')} *</label>
                    <input className="form-input" value={unitForm.name} onChange={(e) => setUnitForm((f) => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.device.symbol')}</label>
                    <input className="form-input" value={unitForm.symbol} onChange={(e) => setUnitForm((f) => ({ ...f, symbol: e.target.value }))} placeholder="mg/dL" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.master.field_sort')}</label>
                    <input className="form-input" type="number" value={unitForm.sort_order} onChange={(e) => setUnitForm((f) => ({ ...f, sort_order: e.target.value }))} />
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              {modal.mode === 'edit' && modal.id && modal.target !== 'unit' && (
                <button className="btn btn-danger" style={{ marginRight: 'auto' }} title={t('common.delete', 'Delete')} aria-label={t('common.delete', 'Delete')} onClick={() => void handleDelete(modal.target, modal.id!).then(() => setModal(null))}>🗑️</button>
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
