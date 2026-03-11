import { useEffect, useState, useCallback } from 'react';
import { api, type FeedType, type FeedManufacturer, type FeedBrand, type FeedModel, type FeedNutrition } from '../lib/api';
import { useI18n, useT, SUPPORTED_LANGS, LANG_LABELS } from '../lib/i18n';
import { emptyTrans, sortCatalog, i18nRowToTranslations, autoTranslate, findMissingTranslationLangs, type CatalogSortMode } from '../lib/catalogUtils';
import type { CatalogStats } from '../types/api';

export type ModalTarget = 'manufacturer' | 'brand' | 'model';

/* ── Catalog API shape ── */
interface CatalogApiShape {
  stats: () => Promise<CatalogStats>;
  types: { list: (lang?: string) => Promise<FeedType[]> };
  manufacturers: {
    list: (lang?: string, typeItemId?: string) => Promise<FeedManufacturer[]>;
    create: (data: Record<string, unknown>) => Promise<FeedManufacturer>;
    update: (id: string, data: Record<string, unknown>) => Promise<FeedManufacturer>;
    delete: (id: string) => Promise<{ id: string; deleted: boolean }>;
  };
  brands: {
    list: (manufacturerId?: string, typeItemId?: string) => Promise<FeedBrand[]>;
    create: (data: Record<string, unknown>) => Promise<FeedBrand>;
    update: (id: string, data: Record<string, unknown>) => Promise<FeedBrand>;
    delete: (id: string) => Promise<{ id: string; deleted: boolean }>;
  };
  models: {
    list: (filters?: { feed_type_id?: string; manufacturer_id?: string; brand_id?: string }) => Promise<FeedModel[]>;
    create: (data: Record<string, unknown>) => Promise<FeedModel>;
    update: (id: string, data: Record<string, unknown>) => Promise<FeedModel>;
    delete: (id: string) => Promise<{ id: string; deleted: boolean }>;
  };
  nutrition?: {
    get: (modelId: string) => Promise<FeedNutrition | null>;
    upsert: (modelId: string, data: Partial<FeedNutrition>) => Promise<FeedNutrition>;
  };
}

export interface UseCatalogPageConfig {
  catalogApi: CatalogApiShape;
  imageSubdir: string;        // 'feed' | 'supplement' | 'medicine'
  loadStats?: boolean;        // default true
}

export function useCatalogPage(config: UseCatalogPageConfig) {
  const t = useT();
  const { lang } = useI18n();
  const { catalogApi, imageSubdir, loadStats = true } = config;

  /* ── State ── */
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

  // Nutrition
  const [, setNutrition] = useState<FeedNutrition | null>(null);
  const [nutritionForm, setNutritionForm] = useState<Record<string, string>>({});
  const [nutritionSaving, setNutritionSaving] = useState(false);

  // Stats
  const [stats, setStats] = useState<CatalogStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsFilter, setStatsFilter] = useState<string | null>(null);

  /* ── Load functions ── */
  const loadTypes = useCallback(async () => {
    try {
      const rows = await catalogApi.types.list(lang);
      setTypes(sortCatalog(rows, typeSort));
    } catch (e) { setError(String(e)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const loadManufacturers = useCallback(async (typeId?: string) => {
    try {
      const rows = await catalogApi.manufacturers.list(lang, typeId);
      setManufacturers(sortCatalog(rows, mfrSort));
    } catch (e) { setError(String(e)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const loadBrands = useCallback(async (mfrId?: string, typeId?: string) => {
    try {
      const rows = await catalogApi.brands.list(mfrId, typeId);
      setBrands(sortCatalog(rows, brandSort));
    } catch (e) { setError(String(e)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadModels = useCallback(async (filters?: { feed_type_id?: string; manufacturer_id?: string; brand_id?: string }) => {
    try {
      setModels(await catalogApi.models.list(filters));
    } catch (e) { setError(String(e)); }
  }, []);

  /* ── Effects ── */
  useEffect(() => {
    void loadTypes();
    if (loadStats) {
      void (async () => {
        try { setStats(await catalogApi.stats()); } catch { /* ignore */ } finally { setStatsLoading(false); }
      })();
    }
  }, [loadTypes, loadStats]);

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
    if (!catalogApi.nutrition || !selectedModel?.id) { setNutrition(null); setNutritionForm({}); return; }
    const nutritionApi = catalogApi.nutrition;
    void (async () => {
      try {
        const data = await nutritionApi.get(selectedModel.id);
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
    })();
  }, [selectedModel?.id]);

  /* ── Helpers ── */
  function flash(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  }

  /* ── Open/Edit handlers ── */
  function openCreateMfr() {
    setMfrForm({ key: '', country: '', sort_order: '0' });
    setMfrTrans(emptyTrans());
    setMfrParentTypeIds(selectedType ? [selectedType.id] : []);
    setModal({ target: 'manufacturer', mode: 'create' });
  }

  function openEditMfr(item: FeedManufacturer) {
    setMfrForm({ key: item.key || '', country: item.country || '', sort_order: String(item.sort_order || 0) });
    setMfrTrans({ ...emptyTrans(), ko: item.name_ko || '', en: item.name_en || '' });
    setMfrParentTypeIds((item.parent_type_ids || '').split(',').map(v => v.trim()).filter(Boolean));
    setModal({ target: 'manufacturer', mode: 'edit', id: item.id });
    if (item.name_key) {
      void api.i18n.list({ prefix: item.name_key, limit: 50 }).then(res => {
        const row = res.items.find(it => it.key === item.name_key);
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
    setBrandParentTypeIds((item.parent_type_ids || '').split(',').map(v => v.trim()).filter(Boolean));
    const parentIds = (item.parent_mfr_ids || '').split(',').map(v => v.trim()).filter(Boolean);
    setBrandParentMfrIds(parentIds.length > 0 ? parentIds : selectedMfr ? [selectedMfr.id] : []);
    setModal({ target: 'brand', mode: 'edit', id: item.id });
    if (item.name_key) {
      void api.i18n.list({ prefix: item.name_key, limit: 50 }).then(res => {
        const row = res.items.find(it => it.key === item.name_key);
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
    setModelParentTypeIds((item.parent_type_ids || '').split(',').map(v => v.trim()).filter(Boolean));
    setModelParentMfrId(item.manufacturer_id || selectedMfr?.id || '');
    const parentIds = (item.parent_brand_ids || '').split(',').map(v => v.trim()).filter(Boolean);
    setModelParentBrandIds(parentIds.length > 0 ? parentIds : selectedBrand ? [selectedBrand.id] : []);
    setModal({ target: 'model', mode: 'edit', id: item.id });
    if (item.name_key) {
      void api.i18n.list({ prefix: item.name_key, limit: 50 }).then(res => {
        const row = res.items.find(it => it.key === item.name_key);
        if (row) setModelTrans(i18nRowToTranslations(row));
      }).catch(() => {});
    }
    if (item.manufacturer_id) void loadBrands(item.manufacturer_id, selectedType?.id);
    else if (manufacturers.length === 0) void loadManufacturers();
  }

  /* ── Save handler ── */
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
        if (SUPPORTED_LANGS.some(lc => lc !== 'ko' && !(translations[lc] || '').trim())) {
          const result = await api.i18n.translate(ko, translations);
          translations = { ...result.translations, ...translations, ko };
        }
        const missingLangs = findMissingTranslationLangs(translations);
        if (missingLangs.length > 0) {
          throw new Error(t('admin.master.err_trans_missing').replace('{langs}', missingLangs.map(lc => (LANG_LABELS as Record<string, string>)[lc] || lc).join(', ')));
        }
        const payload = {
          key: mode === 'create' ? key || undefined : undefined,
          name_ko: ko, name_en: translations.en || undefined,
          country: mfrForm.country || undefined,
          sort_order: parseInt(mfrForm.sort_order, 10) || 0,
          parent_type_ids: mfrParentTypeIds, translations,
        };
        if (mode === 'create') await catalogApi.manufacturers.create(payload);
        else if (id) await catalogApi.manufacturers.update(id, payload);
        await loadManufacturers();
      }

      if (target === 'brand') {
        if (brandParentTypeIds.length === 0 || brandParentMfrIds.length === 0) throw new Error(t('admin.master.err_required'));
        const ko = (brandTrans.ko || '').trim();
        if (!ko) throw new Error(t('admin.master.err_required'));
        const key = (brandForm.key || '').trim().replace(/^master\./, '');
        if (key && !/^[a-z0-9_]+$/.test(key)) throw new Error(t('admin.master.err_key_fmt'));
        let translations: Record<string, string> = { ...brandTrans, ko };
        if (SUPPORTED_LANGS.some(lc => lc !== 'ko' && !(translations[lc] || '').trim())) {
          const result = await api.i18n.translate(ko, translations);
          translations = { ...result.translations, ...translations, ko };
        }
        const missingLangs = findMissingTranslationLangs(translations);
        if (missingLangs.length > 0) {
          throw new Error(t('admin.master.err_trans_missing').replace('{langs}', missingLangs.map(lc => (LANG_LABELS as Record<string, string>)[lc] || lc).join(', ')));
        }
        const payload = {
          key: mode === 'create' ? key || undefined : undefined,
          name_ko: ko, name_en: translations.en || undefined,
          manufacturer_id: brandParentMfrIds[0], manufacturer_ids: brandParentMfrIds,
          parent_type_ids: brandParentTypeIds,
          sort_order: parseInt(brandForm.sort_order, 10) || 0, translations,
        };
        if (mode === 'create') await catalogApi.brands.create(payload);
        else if (id) await catalogApi.brands.update(id, payload);
        await loadBrands(brandParentMfrIds[0] || selectedMfr?.id, selectedType?.id);
      }

      if (target === 'model') {
        if (modelParentTypeIds.length === 0 || !modelParentMfrId || modelParentBrandIds.length === 0) throw new Error(t('admin.master.err_required'));
        const ko = (modelTrans.ko || '').trim();
        if (!ko) throw new Error(t('admin.master.err_required'));
        const key = (modelForm.key || '').trim().replace(/^master\./, '');
        if (key && !/^[a-z0-9_]+$/.test(key)) throw new Error(t('admin.master.err_key_fmt'));
        let translations: Record<string, string> = { ...modelTrans, ko };
        if (SUPPORTED_LANGS.some(lc => lc !== 'ko' && !(translations[lc] || '').trim())) {
          const result = await api.i18n.translate(ko, translations);
          translations = { ...result.translations, ...translations, ko };
        }
        const missingLangs = findMissingTranslationLangs(translations);
        if (missingLangs.length > 0) {
          throw new Error(t('admin.master.err_trans_missing').replace('{langs}', missingLangs.map(lc => (LANG_LABELS as Record<string, string>)[lc] || lc).join(', ')));
        }
        const payload = {
          key: mode === 'create' ? key || undefined : undefined,
          feed_type_id: modelParentTypeIds[0], parent_type_ids: modelParentTypeIds,
          manufacturer_id: modelParentMfrId,
          brand_id: modelParentBrandIds[0], brand_ids: modelParentBrandIds,
          model_name: ko, name_ko: ko, name_en: translations.en || undefined,
          sort_order: parseInt(modelForm.sort_order, 10) || 0, translations,
          model_code: modelForm.model_code || undefined,
          description: modelForm.description || undefined,
        };
        if (mode === 'create') await catalogApi.models.create(payload);
        else if (id) await catalogApi.models.update(id, payload);
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

  /* ── Delete handler ── */
  async function handleDelete(target: ModalTarget, id: string) {
    if (!confirm(t('admin.master.msg_confirm_delete', 'Delete this item?'))) return;
    try {
      if (target === 'manufacturer') {
        await catalogApi.manufacturers.delete(id);
        await loadManufacturers();
      }
      if (target === 'brand') {
        await catalogApi.brands.delete(id);
        await loadBrands(selectedMfr?.id, selectedType?.id);
      }
      if (target === 'model') {
        await catalogApi.models.delete(id);
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

  /* ── Image handlers ── */
  async function handleModelImageUpload(file: File) {
    if (!selectedModel) return;
    try {
      const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
      const presigned = await api.storage.presignedUrl({ type: 'product_image', ext, subdir: `${imageSubdir}/${selectedModel.id}` });
      await fetch(presigned.upload_url, { method: 'PUT', headers: { 'Content-Type': file.type || 'application/octet-stream' }, body: file });
      await catalogApi.models.update(selectedModel.id, { image_url: presigned.public_url });
      setSelectedModel({ ...selectedModel, image_url: presigned.public_url });
      setModels(prev => prev.map(m => m.id === selectedModel.id ? { ...m, image_url: presigned.public_url } : m));
    } catch (e) { setError(String(e)); }
  }

  async function handleModelImageRemove() {
    if (!selectedModel) return;
    try {
      await catalogApi.models.update(selectedModel.id, { image_url: null });
      setSelectedModel({ ...selectedModel, image_url: null });
      setModels(prev => prev.map(m => m.id === selectedModel.id ? { ...m, image_url: null } : m));
    } catch (e) { setError(String(e)); }
  }

  async function handleModelImageUrlChange(url: string) {
    if (!selectedModel) return;
    try {
      await catalogApi.models.update(selectedModel.id, { image_url: url });
      setSelectedModel({ ...selectedModel, image_url: url });
      setModels(prev => prev.map(m => m.id === selectedModel.id ? { ...m, image_url: url } : m));
    } catch (e) { setError(String(e)); }
  }

  /* ── Nutrition save ── */
  async function handleSaveNutrition() {
    if (!selectedModel?.id || !catalogApi.nutrition) return;
    setNutritionSaving(true);
    try {
      const payload: Record<string, number | string | null> = {};
      const numKeys = ['calories_per_100g', 'protein_pct', 'fat_pct', 'fiber_pct', 'moisture_pct', 'ash_pct', 'calcium_pct', 'phosphorus_pct', 'omega3_pct', 'omega6_pct', 'carbohydrate_pct', 'serving_size_g'];
      for (const k of numKeys) payload[k] = nutritionForm[k] ? Number(nutritionForm[k]) : null;
      payload.ingredients_text = nutritionForm.ingredients_text || null;
      payload.notes = nutritionForm.notes || null;
      const data = await catalogApi.nutrition.upsert(selectedModel.id, payload as Partial<FeedNutrition>);
      setNutrition(data);
      flash(t('nutrition.save_success', 'Nutrition info saved'));
    } catch (e) {
      setError(String(e));
    } finally {
      setNutritionSaving(false);
    }
  }

  return {
    t, lang,
    error, setError, success,
    types, manufacturers, brands, models,
    selectedType, setSelectedType,
    selectedMfr, setSelectedMfr,
    selectedBrand, setSelectedBrand,
    selectedModel, setSelectedModel,
    typeSort, setTypeSort, mfrSort, setMfrSort, brandSort, setBrandSort,
    modal, setModal, saving, translating, setTranslating,
    mfrForm, setMfrForm, mfrTrans, setMfrTrans,
    brandForm, setBrandForm, brandTrans, setBrandTrans,
    modelForm, setModelForm, modelTrans, setModelTrans,
    mfrParentTypeIds, setMfrParentTypeIds,
    brandParentTypeIds, setBrandParentTypeIds,
    brandParentMfrIds, setBrandParentMfrIds,
    modelParentTypeIds, setModelParentTypeIds,
    modelParentMfrId, setModelParentMfrId,
    modelParentBrandIds, setModelParentBrandIds,
    nutritionForm, setNutritionForm, nutritionSaving,
    stats, statsLoading, statsFilter, setStatsFilter,
    loadTypes, loadManufacturers, loadBrands, loadModels,
    openCreateMfr, openEditMfr,
    openCreateBrand, openEditBrand,
    openCreateModel, openEditModel,
    handleSave, handleDelete,
    handleModelImageUpload, handleModelImageRemove, handleModelImageUrlChange,
    handleSaveNutrition,
    flash,
  };
}
