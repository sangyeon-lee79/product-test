import { useEffect, useState, useCallback } from 'react';
import { api, type FeedType, type FeedManufacturer, type FeedBrand, type FeedModel, type FeedNutrition } from '../lib/api';
import { useI18n, useT, SUPPORTED_LANGS, LANG_LABELS } from '../lib/i18n';
import { emptyTrans, itemLabel, sortCatalog, i18nRowToTranslations, autoTranslate, findMissingTranslationLangs, type CatalogSortMode } from '../lib/catalogUtils';
import { TranslationFields } from '../components/TranslationFields';
import { CatalogCol, CatalogStatusBadge, CatalogModelDetail, CatalogListThumb, type ModelDetailField } from '../components/CatalogGrid';

type ModalTarget = 'manufacturer' | 'brand' | 'model';

export default function SupplementPage() {
  const t = useT();
  const { lang } = useI18n();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [types, setTypes] = useState<FeedType[]>([]);
  const [manufacturers, setManufacturers] = useState<FeedManufacturer[]>([]);
  const [brands, setBrands] = useState<FeedBrand[]>([]);
  const [models, setModels] = useState<FeedModel[]>([]);

  const [selectedType, setSelectedType] = useState<FeedType | null>(null);
  const [selectedMfr, setSelectedMfr] = useState<FeedManufacturer | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<FeedBrand | null>(null);
  const [selectedModel, setSelectedModel] = useState<FeedModel | null>(null);

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
  const [mfrParentTypeIds, setMfrParentTypeIds] = useState<string[]>([]);
  const [brandParentTypeIds, setBrandParentTypeIds] = useState<string[]>([]);
  const [brandParentMfrIds, setBrandParentMfrIds] = useState<string[]>([]);
  const [modelParentTypeIds, setModelParentTypeIds] = useState<string[]>([]);
  const [modelParentMfrId, setModelParentMfrId] = useState<string>('');
  const [modelParentBrandIds, setModelParentBrandIds] = useState<string[]>([]);

  // Nutrition state
  const [, setNutrition] = useState<FeedNutrition | null>(null);
  const [nutritionForm, setNutritionForm] = useState<Record<string, string>>({});
  const [nutritionSaving, setNutritionSaving] = useState(false);

  const loadTypes = useCallback(async () => {
    try {
      const rows = await api.supplementCatalog.types.list(lang);
      setTypes(sortCatalog(rows, typeSort));
    } catch (e) {
      setError(String(e));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const loadManufacturers = useCallback(async (typeId?: string) => {
    try {
      const rows = await api.supplementCatalog.manufacturers.list(lang, typeId);
      setManufacturers(sortCatalog(rows, mfrSort));
    } catch (e) {
      setError(String(e));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const loadBrands = useCallback(async (mfrId?: string, typeId?: string) => {
    try {
      const rows = await api.supplementCatalog.brands.list(mfrId, typeId);
      setBrands(sortCatalog(rows, brandSort));
    } catch (e) {
      setError(String(e));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadModels = useCallback(async (filters?: { feed_type_id?: string; manufacturer_id?: string; brand_id?: string }) => {
    try {
      setModels(await api.supplementCatalog.models.list(filters));
    } catch (e) {
      setError(String(e));
    }
  }, []);

  useEffect(() => { void loadTypes(); }, [loadTypes]);

  useEffect(() => { setTypes(prev => prev.length ? sortCatalog(prev, typeSort) : prev); }, [typeSort]);
  useEffect(() => { setManufacturers(prev => prev.length ? sortCatalog(prev, mfrSort) : prev); }, [mfrSort]);
  useEffect(() => { setBrands(prev => prev.length ? sortCatalog(prev, brandSort) : prev); }, [brandSort]);

  useEffect(() => {
    if (!selectedType) {
      setManufacturers([]); setSelectedMfr(null); setSelectedBrand(null); setSelectedModel(null);
      return;
    }
    void loadManufacturers(selectedType.id);
    setSelectedMfr(null); setSelectedBrand(null); setSelectedModel(null);
  }, [selectedType, loadManufacturers]);

  useEffect(() => {
    if (!selectedMfr) {
      setBrands([]); setSelectedBrand(null); setSelectedModel(null);
      return;
    }
    void loadBrands(selectedMfr.id, selectedType?.id);
    setSelectedBrand(null); setSelectedModel(null);
  }, [selectedMfr, selectedType?.id, loadBrands]);

  useEffect(() => {
    if (!selectedType || !selectedMfr || !selectedBrand) {
      setModels([]); setSelectedModel(null);
      return;
    }
    void loadModels({ feed_type_id: selectedType.id, manufacturer_id: selectedMfr.id, brand_id: selectedBrand.id });
    setSelectedModel(null);
  }, [selectedType, selectedMfr, selectedBrand, loadModels]);

  // Load nutrition when model selected
  useEffect(() => {
    if (!selectedModel?.id) { setNutrition(null); setNutritionForm({}); return; }
    const run = async () => {
      try {
        const data = await api.supplementCatalog.nutrition.get(selectedModel.id);
        setNutrition(data);
        if (data) {
          const f: Record<string, string> = {};
          const keys = ['calories_per_100g', 'protein_pct', 'fat_pct', 'fiber_pct', 'moisture_pct', 'ash_pct', 'calcium_pct', 'phosphorus_pct', 'omega3_pct', 'omega6_pct', 'carbohydrate_pct', 'serving_size_g'] as const;
          for (const k of keys) f[k] = data[k] != null ? String(data[k]) : '';
          f.ingredients_text = data.ingredients_text || '';
          f.notes = data.notes || '';
          setNutritionForm(f);
        } else {
          setNutritionForm({});
        }
      } catch { setNutrition(null); setNutritionForm({}); }
    };
    void run();
  }, [selectedModel?.id]);

  async function handleSaveNutrition() {
    if (!selectedModel?.id) return;
    setNutritionSaving(true);
    try {
      const payload: Record<string, number | string | null> = {};
      const numKeys = ['calories_per_100g', 'protein_pct', 'fat_pct', 'fiber_pct', 'moisture_pct', 'ash_pct', 'calcium_pct', 'phosphorus_pct', 'omega3_pct', 'omega6_pct', 'carbohydrate_pct', 'serving_size_g'];
      for (const k of numKeys) payload[k] = nutritionForm[k] ? Number(nutritionForm[k]) : null;
      payload.ingredients_text = nutritionForm.ingredients_text || null;
      payload.notes = nutritionForm.notes || null;
      const data = await api.supplementCatalog.nutrition.upsert(selectedModel.id, payload as Partial<FeedNutrition>);
      setNutrition(data);
      flash(t('nutrition.save_success', 'Nutrition info saved'));
    } catch (e) {
      setError(String(e));
    } finally {
      setNutritionSaving(false);
    }
  }

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

  function openEditMfr(item: FeedManufacturer) {
    const fallback = { ...emptyTrans(), ko: item.name_ko || '', en: item.name_en || '' };
    setMfrForm({ key: item.key || '', country: item.country || '', sort_order: String(item.sort_order || 0) });
    setMfrTrans(fallback);
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

  function openEditBrand(item: FeedBrand) {
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

  function openEditModel(item: FeedModel) {
    setModelForm({ key: item.key || '', sort_order: String(item.sort_order || 0), model_code: item.model_code ?? '', description: item.description ?? '' });
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
        if (mode === 'create') await api.supplementCatalog.manufacturers.create(payload);
        else if (id) await api.supplementCatalog.manufacturers.update(id, payload);
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
        if (mode === 'create') await api.supplementCatalog.brands.create(payload);
        else if (id) await api.supplementCatalog.brands.update(id, payload);
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
          feed_type_id: modelParentTypeIds[0],
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
        if (mode === 'create') await api.supplementCatalog.models.create(payload);
        else if (id) await api.supplementCatalog.models.update(id, payload);
        const filters: { feed_type_id?: string; manufacturer_id?: string; brand_id?: string } = {};
        filters.feed_type_id = modelParentTypeIds[0] || selectedType?.id;
        filters.manufacturer_id = modelParentMfrId || selectedMfr?.id;
        filters.brand_id = modelParentBrandIds[0] || selectedBrand?.id;
        await loadModels(filters);
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
        await api.supplementCatalog.manufacturers.delete(id);
        await loadManufacturers();
      }
      if (target === 'brand') {
        await api.supplementCatalog.brands.delete(id);
        await loadBrands(selectedMfr?.id, selectedType?.id);
      }
      if (target === 'model') {
        await api.supplementCatalog.models.delete(id);
        const f: { feed_type_id?: string; manufacturer_id?: string; brand_id?: string } = {};
        if (selectedType) f.feed_type_id = selectedType.id;
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
      const presigned = await api.storage.presignedUrl({ type: 'product_image', ext, subdir: `supplement/${selectedModel.id}` });
      await fetch(presigned.upload_url, { method: 'PUT', headers: { 'Content-Type': file.type || 'application/octet-stream' }, body: file });
      await api.supplementCatalog.models.update(selectedModel.id, { image_url: presigned.public_url });
      setSelectedModel({ ...selectedModel, image_url: presigned.public_url });
      setModels((prev) => prev.map((m) => m.id === selectedModel.id ? { ...m, image_url: presigned.public_url } : m));
    } catch (e) { setError(String(e)); }
  }

  async function handleModelImageRemove() {
    if (!selectedModel) return;
    try {
      await api.supplementCatalog.models.update(selectedModel.id, { image_url: null });
      setSelectedModel({ ...selectedModel, image_url: null });
      setModels((prev) => prev.map((m) => m.id === selectedModel.id ? { ...m, image_url: null } : m));
    } catch (e) { setError(String(e)); }
  }

  async function handleModelImageUrlChange(url: string) {
    if (!selectedModel) return;
    try {
      await api.supplementCatalog.models.update(selectedModel.id, { image_url: url });
      setSelectedModel({ ...selectedModel, image_url: url });
      setModels((prev) => prev.map((m) => m.id === selectedModel.id ? { ...m, image_url: url } : m));
    } catch (e) { setError(String(e)); }
  }

  const SUPPLEMENT_PLACEHOLDER = '/assets/images/placeholder_supplement.svg';
  const addLabel = t('admin.master.btn_add');
  function SBadge({ status }: { status: string }) { return <CatalogStatusBadge status={status} t={t} />; }

  // Parse supplement-specific metadata from model description (JSON)
  function parseModelMeta(model: FeedModel): { ingredients?: string; dosage_unit?: string; calories_per_serving?: number; species_key?: string; prescribed?: boolean } {
    try {
      if (model.description) return JSON.parse(model.description);
    } catch { /* ignore */ }
    return {};
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">{t('admin.supplement.title', 'Supplement Catalog')}</div>
      </div>
      <div className="content">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="alert" style={{ marginBottom: 12 }}>{t('admin.supplement.guide', 'Manage supplement catalog: Type > Manufacturer > Brand > Model')}</div>

        <div className="master-explorer-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
          <CatalogCol title={t('admin.supplement.types', 'Supplement Types')} sortMode={typeSort} onSortChange={setTypeSort}>
            {types.length === 0 && <div className="master-empty">{t('admin.feed.empty')}</div>}
            {types.map((item) => (
              <button
                key={item.id}
                className={`master-row-btn ${selectedType?.id === item.id ? 'active' : ''}`}
                onClick={() => setSelectedType(item)}
              >
                <div>
                  <div className="master-row-title">{itemLabel(item)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.key}</div>
                </div>
                <SBadge status={item.status} />
              </button>
            ))}
          </CatalogCol>

          <CatalogCol title={t('admin.supplement.manufacturers', 'Manufacturers')} onAdd={openCreateMfr} addLabel={addLabel} sortMode={mfrSort} onSortChange={setMfrSort}>
            {manufacturers.length === 0 && <div className="master-empty">{t('admin.feed.empty')}</div>}
            {manufacturers.map((item) => (
              <button key={item.id} className={`master-row-btn ${selectedMfr?.id === item.id ? 'active' : ''}`} onClick={() => { setSelectedMfr(item); setSelectedBrand(null); setSelectedModel(null); }}>
                <div>
                  <div className="master-row-title">{itemLabel(item)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.country ?? ''}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                  <SBadge status={item.status} />
                  <button className="btn btn-secondary btn-sm" style={{ fontSize: 10, padding: '1px 6px' }} title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')} onClick={(e) => { e.stopPropagation(); openEditMfr(item); }}>&#9998;</button>
                </div>
              </button>
            ))}
          </CatalogCol>

          <CatalogCol title={t('admin.supplement.brands', 'Brands')} onAdd={openCreateBrand} addLabel={addLabel} sortMode={brandSort} onSortChange={setBrandSort}>
            {!selectedMfr && <div className="master-empty">{t('admin.feed.select_manufacturer')}</div>}
            {selectedMfr && brands.length === 0 && <div className="master-empty">{t('admin.feed.empty')}</div>}
            {selectedMfr && brands.map((item) => (
              <button key={item.id} className={`master-row-btn ${selectedBrand?.id === item.id ? 'active' : ''}`} onClick={() => { setSelectedBrand(item); setSelectedModel(null); }}>
                <div>
                  <div className="master-row-title">{itemLabel(item)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.name_ko}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                  <SBadge status={item.status} />
                  <button className="btn btn-secondary btn-sm" style={{ fontSize: 10, padding: '1px 6px' }} title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')} onClick={(e) => { e.stopPropagation(); openEditBrand(item); }}>&#9998;</button>
                </div>
              </button>
            ))}
          </CatalogCol>

          <CatalogCol title={t('admin.supplement.models', 'Supplement Models')} onAdd={openCreateModel} addLabel={addLabel}>
            {!selectedType && <div className="master-empty">{t('admin.feed.select_type')}</div>}
            {selectedType && models.length === 0 && <div className="master-empty">{t('admin.feed.empty')}</div>}
            {selectedType && models.map((item) => {
              const meta = parseModelMeta(item);
              return (
                <button key={item.id} className={`master-row-btn ${selectedModel?.id === item.id ? 'active' : ''}`} onClick={() => setSelectedModel(item)}>
                  <CatalogListThumb src={item.image_url} fallbackSrc={SUPPLEMENT_PLACEHOLDER} alt={item.model_name} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="master-row-title">{item.model_display_label || item.model_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {meta.dosage_unit ?? ''} {meta.species_key ? `(${meta.species_key})` : ''}
                      {meta.prescribed ? ' Rx' : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                    <SBadge status={item.status} />
                    <button className="btn btn-secondary btn-sm" style={{ fontSize: 10, padding: '1px 6px' }} title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')} onClick={(e) => { e.stopPropagation(); openEditModel(item); }}>&#9998;</button>
                  </div>
                </button>
              );
            })}
          </CatalogCol>
        </div>

        {/* Model detail */}
        {selectedModel && (() => {
          const meta = parseModelMeta(selectedModel);
          return (
            <CatalogModelDetail
              title={selectedModel.model_display_label || selectedModel.model_name}
              onEdit={() => openEditModel(selectedModel)}
              onDelete={() => void handleDelete('model', selectedModel.id)}
              editLabel="&#9998;"
              deleteLabel="&#128465;"
              imageUrl={selectedModel.image_url}
              fallbackImageSrc={SUPPLEMENT_PLACEHOLDER}
              onImageUpload={(file) => void handleModelImageUpload(file)}
              onImageRemove={() => void handleModelImageRemove()}
              onImageUrlChange={(url) => void handleModelImageUrlChange(url)}
              t={t}
              fields={[
                { label: t('admin.supplement.type', 'Type'), value: selectedModel.type_display_label || selectedModel.type_name_en || selectedModel.type_name_ko || '-' },
                { label: t('admin.supplement.manufacturer', 'Manufacturer'), value: selectedModel.mfr_display_label || selectedModel.mfr_name_en || selectedModel.mfr_name_ko || '-' },
                { label: t('admin.supplement.brand', 'Brand'), value: selectedModel.brand_display_label || selectedModel.brand_name_en || selectedModel.brand_name_ko || '-' },
                ...(meta.ingredients ? [{ label: t('admin.supplement.ingredients', 'Ingredients'), value: meta.ingredients } satisfies ModelDetailField] : []),
                ...(meta.dosage_unit ? [{ label: t('admin.supplement.dosage_unit', 'Dosage Unit'), value: meta.dosage_unit } satisfies ModelDetailField] : []),
                ...(meta.calories_per_serving != null ? [{ label: t('admin.supplement.calories_serving', 'kcal/serving'), value: String(meta.calories_per_serving) } satisfies ModelDetailField] : []),
                ...(meta.species_key ? [{ label: t('admin.supplement.species', 'Species'), value: meta.species_key } satisfies ModelDetailField] : []),
                ...(meta.prescribed ? [{ label: t('admin.supplement.prescribed', 'Prescribed'), value: 'Yes' } satisfies ModelDetailField] : []),
              ]}
            />
          );
        })()}

        {/* Nutrition panel */}
        {selectedModel && (
          <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 style={{ margin: 0, fontSize: 15 }}>{t('nutrition.title', 'Nutrition Info')}</h4>
              <button className="btn btn-primary btn-sm" disabled={nutritionSaving} onClick={() => void handleSaveNutrition()}>
                {t('common.save', 'Save')}
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {([
                ['calories_per_100g', t('nutrition.calories', 'Calories/100g')],
                ['protein_pct', t('nutrition.protein', 'Protein (%)')],
                ['fat_pct', t('nutrition.fat', 'Fat (%)')],
                ['fiber_pct', t('nutrition.fiber', 'Fiber (%)')],
                ['moisture_pct', t('nutrition.moisture', 'Moisture (%)')],
                ['ash_pct', t('nutrition.ash', 'Ash (%)')],
                ['calcium_pct', t('nutrition.calcium', 'Calcium (%)')],
                ['phosphorus_pct', t('nutrition.phosphorus', 'Phosphorus (%)')],
                ['omega3_pct', t('nutrition.omega3', 'Omega-3 (%)')],
                ['omega6_pct', t('nutrition.omega6', 'Omega-6 (%)')],
                ['carbohydrate_pct', t('nutrition.carbohydrate', 'Carbohydrate (%)')],
                ['serving_size_g', t('nutrition.serving_size', 'Serving Size (g)')],
              ] as const).map(([key, label]) => (
                <div key={key} className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: 11 }}>{label}</label>
                  <input
                    className="form-input"
                    type="number"
                    step="0.01"
                    style={{ fontSize: 13 }}
                    value={nutritionForm[key] || ''}
                    onChange={(e) => setNutritionForm((p) => ({ ...p, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <div className="form-group" style={{ marginTop: 8, marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: 11 }}>{t('nutrition.ingredients', 'Ingredients')}</label>
              <textarea
                className="form-input"
                rows={2}
                style={{ fontSize: 13 }}
                value={nutritionForm.ingredients_text || ''}
                onChange={(e) => setNutritionForm((p) => ({ ...p, ingredients_text: e.target.value }))}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Create/Edit Modal ── */}
      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <div className="modal-title">
                {modal.mode === 'create' ? t('admin.master.btn_add') : t('admin.master.btn_edit')} {' — '}
                {modal.target === 'manufacturer' && t('admin.supplement.manufacturers', 'Manufacturers')}
                {modal.target === 'brand' && t('admin.supplement.brands', 'Brands')}
                {modal.target === 'model' && t('admin.supplement.models', 'Supplement Models')}
              </div>
              <button className="modal-close" onClick={() => setModal(null)}>&times;</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {error && <div className="alert alert-error" style={{ marginBottom: 8 }}>{error}</div>}

              {modal.target === 'manufacturer' && (
                <>
                  <div className="form-group">
                    <label className="form-label">{t('admin.supplement.type', 'Supplement Type')} *</label>
                    <div style={{ display: 'grid', gap: 6, maxHeight: 140, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
                      {types.map((row) => (
                        <label key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                          <input type="checkbox" checked={mfrParentTypeIds.includes(row.id)} onChange={(e) => setMfrParentTypeIds((prev) => e.target.checked ? [...new Set([...prev, row.id])] : prev.filter((id) => id !== row.id))} />
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
                    <label className="form-label">{t('admin.feed.country')}</label>
                    <input className="form-input" value={mfrForm.country} onChange={(e) => setMfrForm((f) => ({ ...f, country: e.target.value }))} placeholder="US" />
                  </div>
                  <TranslationFields translations={mfrTrans} onChange={setMfrTrans} translating={translating} onAutoTranslate={() => void autoTranslate(mfrTrans.ko, mfrTrans, setMfrTrans, setTranslating, setError)} t={t} />
                </>
              )}

              {modal.target === 'brand' && (
                <>
                  <div className="form-group">
                    <label className="form-label">{t('admin.supplement.type', 'Supplement Type')} *</label>
                    <div style={{ display: 'grid', gap: 6, maxHeight: 140, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
                      {types.map((row) => (
                        <label key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                          <input type="checkbox" checked={brandParentTypeIds.includes(row.id)} onChange={(e) => setBrandParentTypeIds((prev) => e.target.checked ? [...new Set([...prev, row.id])] : prev.filter((id) => id !== row.id))} />
                          <span>{itemLabel(row)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.supplement.manufacturer', 'Manufacturer')} *</label>
                    <div style={{ display: 'grid', gap: 6, maxHeight: 140, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
                      {manufacturers.map((row) => (
                        <label key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                          <input type="checkbox" checked={brandParentMfrIds.includes(row.id)} onChange={(e) => setBrandParentMfrIds((prev) => e.target.checked ? [...new Set([...prev, row.id])] : prev.filter((id) => id !== row.id))} />
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
                    <label className="form-label">{t('admin.supplement.type', 'Supplement Type')} *</label>
                    <div style={{ display: 'grid', gap: 6, maxHeight: 120, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
                      {types.map((row) => (
                        <label key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                          <input type="checkbox" checked={modelParentTypeIds.includes(row.id)} onChange={(e) => setModelParentTypeIds((prev) => e.target.checked ? [...new Set([...prev, row.id])] : prev.filter((id) => id !== row.id))} />
                          <span>{itemLabel(row)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.supplement.manufacturer', 'Manufacturer')} *</label>
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
                      <option value="">{t('admin.feed.select_manufacturer')}</option>
                      {manufacturers.map((row) => <option key={row.id} value={row.id}>{itemLabel(row)}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.supplement.brand', 'Brand')} *</label>
                    <div style={{ display: 'grid', gap: 6, maxHeight: 120, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
                      {brands.map((row) => (
                        <label key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                          <input type="checkbox" checked={modelParentBrandIds.includes(row.id)} onChange={(e) => setModelParentBrandIds((prev) => e.target.checked ? [...new Set([...prev, row.id])] : prev.filter((id) => id !== row.id))} />
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
                    <label className="form-label">{t('admin.feed.model_code')}</label>
                    <input className="form-input font-mono" value={modelForm.model_code} onChange={(e) => setModelForm((f) => ({ ...f, model_code: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.feed.description')}</label>
                    <input className="form-input" value={modelForm.description} onChange={(e) => setModelForm((f) => ({ ...f, description: e.target.value }))} />
                  </div>
                  <TranslationFields translations={modelTrans} onChange={setModelTrans} translating={translating} onAutoTranslate={() => void autoTranslate(modelTrans.ko, modelTrans, setModelTrans, setTranslating, setError)} t={t} />
                </>
              )}
            </div>
            <div className="modal-footer">
              {modal.mode === 'edit' && modal.id && (
                <button className="btn btn-danger" style={{ marginRight: 'auto' }} title={t('common.delete', 'Delete')} aria-label={t('common.delete', 'Delete')} onClick={() => void handleDelete(modal.target, modal.id!).then(() => setModal(null))}>&#128465;</button>
              )}
              <button className="btn" onClick={() => setModal(null)}>{t('common.cancel', 'Cancel')}</button>
              <button className="btn btn-primary" disabled={saving} onClick={() => void handleSave()}>
                {saving ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
