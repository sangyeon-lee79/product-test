import { useEffect, useState, useCallback } from 'react';
import { api, type FeedType, type FeedManufacturer, type FeedBrand, type FeedModel, type FeedNutrition, type FeedRegistrationRequest } from '../lib/api';
import { useI18n, useT, SUPPORTED_LANGS, LANG_LABELS } from '../lib/i18n';
import { emptyTrans, itemLabel, sortCatalog, i18nRowToTranslations, autoTranslate, findMissingTranslationLangs, type CatalogSortMode } from '../lib/catalogUtils';
import { TranslationFields } from '../components/TranslationFields';
import { CatalogCol, CatalogStatusBadge, CatalogModelDetail, CatalogListThumb, type ModelDetailField } from '../components/CatalogGrid';
import { CatalogStatsBar } from '../components/CatalogStatsBar';
import type { CatalogStats } from '../types/api';

type ModalTarget = 'manufacturer' | 'brand' | 'model';
type FeedPageTab = 'catalog' | 'requests';

export default function FeedPage() {
  const t = useT();
  const { lang } = useI18n();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pageTab, setPageTab] = useState<FeedPageTab>('catalog');

  // ── Request Management State ──
  const [requests, setRequests] = useState<FeedRegistrationRequest[]>([]);
  const [requestFilter, setRequestFilter] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<FeedRegistrationRequest | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [requestProcessing, setRequestProcessing] = useState(false);

  // Review state for admin approval overrides
  type ReviewDecision = 'ok' | 'existing';
  const [reviewMfr, setReviewMfr] = useState<{ decision: ReviewDecision; existingId: string }>({ decision: 'ok', existingId: '' });
  const [reviewBrand, setReviewBrand] = useState<{ decision: ReviewDecision; existingId: string }>({ decision: 'ok', existingId: '' });
  const [reviewFeedType, setReviewFeedType] = useState(''); // override feed_type_item_id
  // Dropdown data for requests tab
  const [reqMfrs, setReqMfrs] = useState<FeedManufacturer[]>([]);
  const [reqBrands, setReqBrands] = useState<FeedBrand[]>([]);
  const [reqFeedTypes, setReqFeedTypes] = useState<FeedType[]>([]);

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const [stats, setStats] = useState<CatalogStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsFilter, setStatsFilter] = useState<string | null>(null);

  const loadRequests = useCallback(async (status?: string) => {
    try {
      const rows = await api.feedRequests.admin.list(status ? { status } : undefined);
      setRequests(rows);
    } catch (e) {
      setError(String(e));
    }
  }, []);

  useEffect(() => {
    if (pageTab === 'requests') {
      void loadRequests(requestFilter || undefined);
      // Load dropdown data for review
      void (async () => {
        try { setReqMfrs(await api.feedCatalog.public.manufacturers()); } catch { /* ignore */ }
        try { setReqBrands(await api.feedCatalog.public.brands()); } catch { /* ignore */ }
        try { setReqFeedTypes(await api.feedCatalog.public.types(lang)); } catch { /* ignore */ }
      })();
    }
  }, [pageTab, requestFilter, loadRequests, lang]);

  // Load pending count + stats on mount
  useEffect(() => {
    void (async () => {
      try {
        const rows = await api.feedRequests.admin.list({ status: 'pending' });
        setRequests((prev) => prev.length ? prev : rows);
      } catch { /* ignore */ }
    })();
    void (async () => {
      try { setStats(await api.feedCatalog.stats()); } catch { /* ignore */ } finally { setStatsLoading(false); }
    })();
  }, []);

  function resetReviewState() {
    setReviewMfr({ decision: 'ok', existingId: '' });
    setReviewBrand({ decision: 'ok', existingId: '' });
    setReviewFeedType('');
    setShowRejectForm(false);
    setRejectNote('');
  }

  async function handleApprove(id: string) {
    if (!confirm(t('admin.feed.approve_confirm', 'Register this feed to the catalog?'))) return;
    setRequestProcessing(true);
    try {
      const overrides: { manufacturer_id?: string; brand_id?: string; feed_type_item_id?: string } = {};
      if (reviewMfr.decision === 'existing' && reviewMfr.existingId) overrides.manufacturer_id = reviewMfr.existingId;
      if (reviewBrand.decision === 'existing' && reviewBrand.existingId) overrides.brand_id = reviewBrand.existingId;
      if (reviewFeedType) overrides.feed_type_item_id = reviewFeedType;
      await api.feedRequests.admin.approve(id, Object.keys(overrides).length ? overrides : undefined);
      flash(t('admin.feed.approved_success', 'Approved and registered to catalog.'));
      void loadRequests(requestFilter || undefined);
      setSelectedRequest(null);
      resetReviewState();
    } catch (e) {
      setError(String(e));
    } finally {
      setRequestProcessing(false);
    }
  }

  async function handleReject(id: string) {
    setRequestProcessing(true);
    try {
      await api.feedRequests.admin.reject(id, { review_note: rejectNote });
      flash(t('admin.feed.rejected_success', 'Request rejected.'));
      setRejectNote('');
      setShowRejectForm(false);
      void loadRequests(requestFilter || undefined);
      setSelectedRequest(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setRequestProcessing(false);
    }
  }

  const filteredRequests = requestFilter ? requests.filter((r) => r.status === requestFilter) : requests;

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
      const rows = await api.feedCatalog.types.list(lang);
      setTypes(sortCatalog(rows, typeSort));
    } catch (e) {
      setError(String(e));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const loadManufacturers = useCallback(async (typeId?: string) => {
    try {
      const rows = await api.feedCatalog.manufacturers.list(lang, typeId);
      setManufacturers(sortCatalog(rows, mfrSort));
    } catch (e) {
      setError(String(e));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const loadBrands = useCallback(async (mfrId?: string, typeId?: string) => {
    try {
      const rows = await api.feedCatalog.brands.list(mfrId, typeId);
      setBrands(sortCatalog(rows, brandSort));
    } catch (e) {
      setError(String(e));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadModels = useCallback(async (filters?: { feed_type_id?: string; manufacturer_id?: string; brand_id?: string }) => {
    try {
      setModels(await api.feedCatalog.models.list(filters));
    } catch (e) {
      setError(String(e));
    }
  }, []);

  useEffect(() => {
    void loadTypes();
  }, [loadTypes]);

  // Re-sort in place when sort mode changes (no re-fetch)
  useEffect(() => { setTypes(prev => prev.length ? sortCatalog(prev, typeSort) : prev); }, [typeSort]);
  useEffect(() => { setManufacturers(prev => prev.length ? sortCatalog(prev, mfrSort) : prev); }, [mfrSort]);
  useEffect(() => { setBrands(prev => prev.length ? sortCatalog(prev, brandSort) : prev); }, [brandSort]);

  useEffect(() => {
    if (!selectedType) {
      setManufacturers([]);
      setSelectedMfr(null);
      setSelectedBrand(null);
      setSelectedModel(null);
      return;
    }
    void loadManufacturers(selectedType.id);
    setSelectedMfr(null);
    setSelectedBrand(null);
    setSelectedModel(null);
  }, [selectedType, loadManufacturers]);

  useEffect(() => {
    if (!selectedMfr) {
      setBrands([]);
      setSelectedBrand(null);
      setSelectedModel(null);
      return;
    }
    void loadBrands(selectedMfr.id, selectedType?.id);
    setSelectedBrand(null);
    setSelectedModel(null);
  }, [selectedMfr, selectedType?.id, loadBrands]);

  useEffect(() => {
    if (!selectedType || !selectedMfr || !selectedBrand) {
      setModels([]);
      setSelectedModel(null);
      return;
    }
    const filters: { feed_type_id?: string; manufacturer_id?: string; brand_id?: string } = {
      feed_type_id: selectedType.id,
      manufacturer_id: selectedMfr.id,
      brand_id: selectedBrand.id,
    };
    void loadModels(filters);
    setSelectedModel(null);
  }, [selectedType, selectedMfr, selectedBrand, loadModels]);

  // Load nutrition when model selected
  useEffect(() => {
    if (!selectedModel?.id) { setNutrition(null); setNutritionForm({}); return; }
    const run = async () => {
      try {
        const data = await api.feedCatalog.nutrition.get(selectedModel.id);
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
      const data = await api.feedCatalog.nutrition.upsert(selectedModel.id, payload as Partial<FeedNutrition>);
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
        if (mode === 'create') await api.feedCatalog.manufacturers.create(payload);
        else if (id) await api.feedCatalog.manufacturers.update(id, payload);
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
          await api.feedCatalog.brands.create(payload);
        } else if (id) {
          await api.feedCatalog.brands.update(id, payload);
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
        if (mode === 'create') {
          await api.feedCatalog.models.create(payload);
        } else if (id) {
          await api.feedCatalog.models.update(id, payload);
        }
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
        await api.feedCatalog.manufacturers.delete(id);
        await loadManufacturers();
      }
      if (target === 'brand') {
        await api.feedCatalog.brands.delete(id);
        await loadBrands(selectedMfr?.id, selectedType?.id);
      }
      if (target === 'model') {
        await api.feedCatalog.models.delete(id);
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
      const presigned = await api.storage.presignedUrl({ type: 'product_image', ext, subdir: `feed/${selectedModel.id}` });
      await fetch(presigned.upload_url, { method: 'PUT', headers: { 'Content-Type': file.type || 'application/octet-stream' }, body: file });
      await api.feedCatalog.models.update(selectedModel.id, { image_url: presigned.public_url });
      setSelectedModel({ ...selectedModel, image_url: presigned.public_url });
      setModels((prev) => prev.map((m) => m.id === selectedModel.id ? { ...m, image_url: presigned.public_url } : m));
    } catch (e) { setError(String(e)); }
  }

  async function handleModelImageRemove() {
    if (!selectedModel) return;
    try {
      await api.feedCatalog.models.update(selectedModel.id, { image_url: null });
      setSelectedModel({ ...selectedModel, image_url: null });
      setModels((prev) => prev.map((m) => m.id === selectedModel.id ? { ...m, image_url: null } : m));
    } catch (e) { setError(String(e)); }
  }

  async function handleModelImageUrlChange(url: string) {
    if (!selectedModel) return;
    try {
      await api.feedCatalog.models.update(selectedModel.id, { image_url: url });
      setSelectedModel({ ...selectedModel, image_url: url });
      setModels((prev) => prev.map((m) => m.id === selectedModel.id ? { ...m, image_url: url } : m));
    } catch (e) { setError(String(e)); }
  }

  const FEED_PLACEHOLDER = '/assets/images/placeholder_feed.svg';
  const addLabel = t('admin.master.btn_add');
  function SBadge({ status }: { status: string }) { return <CatalogStatusBadge status={status} t={t} />; }

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">🥣 {t('admin.feed.title')}</div>
      </div>
      <div className="content">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <CatalogStatsBar loading={statsLoading} cards={[
          { label: t('admin.catalog.stats.total_models', '전체 모델'), value: stats?.total_models ?? 0, desc: t('admin.catalog.stats.total_models_desc', '등록된 모델'), active: statsFilter === 'total', onClick: () => setStatsFilter(statsFilter === 'total' ? null : 'total') },
          { label: t('admin.catalog.stats.active', '활성'), value: stats?.active_models ?? 0, desc: t('admin.catalog.stats.active_desc', '활성 모델'), active: statsFilter === 'active', onClick: () => setStatsFilter(statsFilter === 'active' ? null : 'active') },
          { label: t('admin.catalog.stats.user_registered', '유저 등록'), value: stats?.user_registered ?? 0, desc: t('admin.catalog.stats.user_registered_feed_desc', '등록된 급여 수'), active: statsFilter === 'registered', onClick: () => setStatsFilter(statsFilter === 'registered' ? null : 'registered') },
          { label: t('admin.catalog.stats.actual_usage', '실사용'), value: stats?.actual_usage ?? 0, desc: t('admin.catalog.stats.actual_usage_feed_desc', '최근 30일 급여 기록'), active: statsFilter === 'usage', onClick: () => setStatsFilter(statsFilter === 'usage' ? null : 'usage') },
        ]} />

        {/* ── Tab Bar ── */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '2px solid var(--border)', paddingBottom: 0 }}>
          <button
            style={{ padding: '8px 16px', fontWeight: pageTab === 'catalog' ? 700 : 400, borderBottom: pageTab === 'catalog' ? '2px solid var(--primary)' : '2px solid transparent', background: 'none', border: 'none', borderBottomWidth: 2, borderBottomStyle: 'solid', borderBottomColor: pageTab === 'catalog' ? 'var(--primary)' : 'transparent', cursor: 'pointer', fontSize: 14 }}
            onClick={() => setPageTab('catalog')}
          >
            {t('admin.feed.catalog_tab', 'Feed Catalog')}
          </button>
          <button
            style={{ padding: '8px 16px', fontWeight: pageTab === 'requests' ? 700 : 400, background: 'none', border: 'none', borderBottomWidth: 2, borderBottomStyle: 'solid', borderBottomColor: pageTab === 'requests' ? 'var(--primary)' : 'transparent', cursor: 'pointer', fontSize: 14, position: 'relative' }}
            onClick={() => setPageTab('requests')}
          >
            {t('admin.feed.requests_tab', 'Requests')}
            {pendingCount > 0 && (
              <span style={{ position: 'absolute', top: 2, right: -2, background: '#e53935', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 10, padding: '1px 6px', minWidth: 18, textAlign: 'center' }}>{pendingCount}</span>
            )}
          </button>
        </div>

        {/* ── Requests Tab ── */}
        {pageTab === 'requests' && (
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {['', 'pending', 'approved', 'rejected'].map((s) => (
                <button key={s} className={`btn btn-sm ${requestFilter === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setRequestFilter(s)}>
                  {s === '' ? t('common.all', 'All') : s === 'pending' ? t('guardian.feed.request_status_pending', 'Pending') : s === 'approved' ? t('guardian.feed.request_status_approved', 'Approved') : t('guardian.feed.request_status_rejected', 'Rejected')}
                </button>
              ))}
            </div>
            {filteredRequests.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>{t('admin.feed.no_requests', 'No registration requests.')}</div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: selectedRequest ? '1fr 1fr' : '1fr', gap: 16 }}>
              {filteredRequests.length > 0 && (
                <div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                        <th style={{ padding: '8px 6px' }}>{t('admin.feed.requester', 'Requester')}</th>
                        <th style={{ padding: '8px 6px' }}>{t('guardian.feed.request_name', 'Feed Name')}</th>
                        <th style={{ padding: '8px 6px' }}>{t('guardian.feed.request_manufacturer', 'Manufacturer')}</th>
                        <th style={{ padding: '8px 6px' }}>{t('admin.feed.request_date', 'Request Date')}</th>
                        <th style={{ padding: '8px 6px' }}>{t('common.status', 'Status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map((r) => (
                        <tr key={r.id} onClick={() => { setSelectedRequest(r); resetReviewState(); }} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', background: selectedRequest?.id === r.id ? 'var(--primary-light, #fffbeb)' : 'transparent' }}>
                          <td style={{ padding: '8px 6px' }}>{r.requester_email || r.requester_user_id.slice(0, 8)}</td>
                          <td style={{ padding: '8px 6px', fontWeight: 600 }}>{r.feed_name}</td>
                          <td style={{ padding: '8px 6px' }}>{r.manufacturer_name || '—'}</td>
                          <td style={{ padding: '8px 6px' }}>{r.created_at?.slice(0, 10)}</td>
                          <td style={{ padding: '8px 6px' }}>
                            <span style={{
                              fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 600,
                              background: r.status === 'approved' ? '#e8f5e9' : r.status === 'rejected' ? '#ffebee' : '#fff8e1',
                              color: r.status === 'approved' ? '#2e7d32' : r.status === 'rejected' ? '#c62828' : '#f57f17',
                            }}>
                              {r.status === 'approved' ? t('guardian.feed.request_status_approved', 'Approved') : r.status === 'rejected' ? t('guardian.feed.request_status_rejected', 'Rejected') : t('guardian.feed.request_status_pending', 'Pending')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {selectedRequest && (
                <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: 16 }}>{selectedRequest.feed_name}</h4>
                  <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div><strong>{t('admin.feed.requester', 'Requester')}:</strong> {selectedRequest.requester_email || selectedRequest.requester_user_id.slice(0, 8)}</div>
                    <div><strong>{t('admin.feed.request_date', 'Date')}:</strong> {selectedRequest.created_at?.slice(0, 10)}</div>
                  </div>

                  {/* ── Per-field Review (pending only) ── */}
                  {selectedRequest.status === 'pending' ? (
                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                      {/* Manufacturer review */}
                      <div style={{ padding: '8px 10px', background: 'var(--bg)', borderRadius: 6, border: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{t('guardian.feed.request_manufacturer', 'Manufacturer')}</div>
                        <div style={{ marginBottom: 6, color: 'var(--text-secondary)' }}>{selectedRequest.manufacturer_name || '—'}</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                            <input type="radio" name="review-mfr" checked={reviewMfr.decision === 'ok'} onChange={() => setReviewMfr({ decision: 'ok', existingId: '' })} />
                            {t('admin.feed.review_ok', 'OK (create new)')}
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                            <input type="radio" name="review-mfr" checked={reviewMfr.decision === 'existing'} onChange={() => setReviewMfr({ decision: 'existing', existingId: '' })} />
                            {t('admin.feed.review_use_existing', 'Use existing')}
                          </label>
                        </div>
                        {reviewMfr.decision === 'existing' && (
                          <select className="form-select" style={{ marginTop: 6, fontSize: 12 }} value={reviewMfr.existingId}
                            onChange={(e) => setReviewMfr((p) => ({ ...p, existingId: e.target.value }))}>
                            <option value="">{t('common.select', 'Select')}</option>
                            {reqMfrs.filter((m) => m.status === 'active').map((m) => (
                              <option key={m.id} value={m.id}>{itemLabel(m)}</option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Brand review */}
                      <div style={{ padding: '8px 10px', background: 'var(--bg)', borderRadius: 6, border: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{t('guardian.feed.request_brand', 'Brand')}</div>
                        <div style={{ marginBottom: 6, color: 'var(--text-secondary)' }}>{selectedRequest.brand_name || '—'}</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                            <input type="radio" name="review-brand" checked={reviewBrand.decision === 'ok'} onChange={() => setReviewBrand({ decision: 'ok', existingId: '' })} />
                            {t('admin.feed.review_ok', 'OK (create new)')}
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                            <input type="radio" name="review-brand" checked={reviewBrand.decision === 'existing'} onChange={() => setReviewBrand({ decision: 'existing', existingId: '' })} />
                            {t('admin.feed.review_use_existing', 'Use existing')}
                          </label>
                        </div>
                        {reviewBrand.decision === 'existing' && (
                          <select className="form-select" style={{ marginTop: 6, fontSize: 12 }} value={reviewBrand.existingId}
                            onChange={(e) => setReviewBrand((p) => ({ ...p, existingId: e.target.value }))}>
                            <option value="">{t('common.select', 'Select')}</option>
                            {reqBrands.filter((b) => b.status === 'active').map((b) => (
                              <option key={b.id} value={b.id}>{b.name_ko || b.name_en || b.id}</option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Feed Type review */}
                      <div style={{ padding: '8px 10px', background: 'var(--bg)', borderRadius: 6, border: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{t('guardian.feed.request_type', 'Feed Type')}</div>
                        <div style={{ marginBottom: 6, color: 'var(--text-secondary)' }}>
                          {selectedRequest.feed_type_item_id
                            ? reqFeedTypes.find((ft) => ft.id === selectedRequest.feed_type_item_id)?.display_label || selectedRequest.feed_type_item_id
                            : '—'}
                        </div>
                        <select className="form-select" style={{ fontSize: 12 }} value={reviewFeedType}
                          onChange={(e) => setReviewFeedType(e.target.value)}>
                          <option value="">{t('admin.feed.review_keep_original', 'Keep original')}</option>
                          {reqFeedTypes.map((ft) => (
                            <option key={ft.id} value={ft.id}>{ft.display_label || ft.key}</option>
                          ))}
                        </select>
                      </div>

                      {/* Feed Name (read-only) */}
                      <div style={{ padding: '8px 10px', background: 'var(--bg)', borderRadius: 6, border: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{t('guardian.feed.request_name', 'Feed Name')}</div>
                        <div>{selectedRequest.feed_name}</div>
                      </div>

                      {/* Nutrition info (read-only, all 13 fields) */}
                      <div style={{ padding: '8px 10px', background: 'var(--bg)', borderRadius: 6, border: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>{t('nutrition.title', 'Nutrition Info')}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: 12, color: 'var(--text-secondary)' }}>
                          {selectedRequest.calories_per_100g != null && <span>{t('nutrition.calories', 'Calories')}: {selectedRequest.calories_per_100g} kcal</span>}
                          {selectedRequest.protein_pct != null && <span>{t('nutrition.protein', 'Protein')}: {selectedRequest.protein_pct}%</span>}
                          {selectedRequest.fat_pct != null && <span>{t('nutrition.fat', 'Fat')}: {selectedRequest.fat_pct}%</span>}
                          {selectedRequest.fiber_pct != null && <span>{t('nutrition.fiber', 'Fiber')}: {selectedRequest.fiber_pct}%</span>}
                          {selectedRequest.moisture_pct != null && <span>{t('nutrition.moisture', 'Moisture')}: {selectedRequest.moisture_pct}%</span>}
                          {selectedRequest.ash_pct != null && <span>{t('nutrition.ash', 'Ash')}: {selectedRequest.ash_pct}%</span>}
                          {selectedRequest.calcium_pct != null && <span>{t('nutrition.calcium', 'Calcium')}: {selectedRequest.calcium_pct}%</span>}
                          {selectedRequest.phosphorus_pct != null && <span>{t('nutrition.phosphorus', 'Phosphorus')}: {selectedRequest.phosphorus_pct}%</span>}
                          {selectedRequest.omega3_pct != null && <span>{t('nutrition.omega3', 'Omega-3')}: {selectedRequest.omega3_pct}%</span>}
                          {selectedRequest.omega6_pct != null && <span>{t('nutrition.omega6', 'Omega-6')}: {selectedRequest.omega6_pct}%</span>}
                          {selectedRequest.carbohydrate_pct != null && <span>{t('nutrition.carbohydrate', 'Carbohydrate')}: {selectedRequest.carbohydrate_pct}%</span>}
                          {selectedRequest.serving_size_g != null && <span>{t('nutrition.serving_size', 'Serving Size')}: {selectedRequest.serving_size_g}g</span>}
                        </div>
                        {selectedRequest.ingredients_text && (
                          <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                            <span style={{ fontWeight: 600 }}>{t('nutrition.ingredients', 'Ingredients')}: </span>{selectedRequest.ingredients_text}
                          </div>
                        )}
                      </div>

                      {selectedRequest.reference_url && (
                        <div style={{ fontSize: 13 }}>
                          <strong>{t('guardian.feed.request_url', 'URL')}:</strong>{' '}
                          <a href={selectedRequest.reference_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>{selectedRequest.reference_url}</a>
                        </div>
                      )}
                      {selectedRequest.memo && (
                        <div style={{ fontSize: 13 }}><strong>{t('guardian.feed.request_memo', 'Memo')}:</strong> {selectedRequest.memo}</div>
                      )}

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                        <button className="btn btn-primary btn-sm" disabled={requestProcessing} onClick={() => void handleApprove(selectedRequest.id)}>
                          {t('admin.feed.final_approve', 'Final Approve')}
                        </button>
                        {!showRejectForm ? (
                          <button className="btn btn-danger btn-sm" onClick={() => setShowRejectForm(true)}>
                            {t('admin.feed.reject', 'Reject')}
                          </button>
                        ) : (
                          <div style={{ flex: '1 1 100%' }}>
                            <textarea
                              className="form-input"
                              rows={2}
                              placeholder={t('admin.feed.reject_reason', 'Rejection Reason')}
                              value={rejectNote}
                              onChange={(e) => setRejectNote(e.target.value)}
                              style={{ marginBottom: 8, fontSize: 13 }}
                            />
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-danger btn-sm" disabled={requestProcessing} onClick={() => void handleReject(selectedRequest.id)}>
                                {t('admin.feed.reject', 'Reject')}
                              </button>
                              <button className="btn btn-sm" onClick={() => { setShowRejectForm(false); setRejectNote(''); }}>
                                {t('common.cancel', 'Cancel')}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Non-pending: read-only detail */
                    <div style={{ marginTop: 12, fontSize: 13, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {selectedRequest.manufacturer_name && <div><strong>{t('guardian.feed.request_manufacturer', 'Manufacturer')}:</strong> {selectedRequest.manufacturer_name}</div>}
                      {selectedRequest.brand_name && <div><strong>{t('guardian.feed.request_brand', 'Brand')}:</strong> {selectedRequest.brand_name}</div>}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                        {selectedRequest.calories_per_100g != null && <span>{t('nutrition.calories', 'Calories')}: {selectedRequest.calories_per_100g} kcal</span>}
                        {selectedRequest.protein_pct != null && <span>{t('nutrition.protein', 'Protein')}: {selectedRequest.protein_pct}%</span>}
                        {selectedRequest.fat_pct != null && <span>{t('nutrition.fat', 'Fat')}: {selectedRequest.fat_pct}%</span>}
                        {selectedRequest.fiber_pct != null && <span>{t('nutrition.fiber', 'Fiber')}: {selectedRequest.fiber_pct}%</span>}
                        {selectedRequest.moisture_pct != null && <span>{t('nutrition.moisture', 'Moisture')}: {selectedRequest.moisture_pct}%</span>}
                        {selectedRequest.ash_pct != null && <span>{t('nutrition.ash', 'Ash')}: {selectedRequest.ash_pct}%</span>}
                        {selectedRequest.calcium_pct != null && <span>{t('nutrition.calcium', 'Calcium')}: {selectedRequest.calcium_pct}%</span>}
                        {selectedRequest.phosphorus_pct != null && <span>{t('nutrition.phosphorus', 'Phosphorus')}: {selectedRequest.phosphorus_pct}%</span>}
                        {selectedRequest.omega3_pct != null && <span>{t('nutrition.omega3', 'Omega-3')}: {selectedRequest.omega3_pct}%</span>}
                        {selectedRequest.omega6_pct != null && <span>{t('nutrition.omega6', 'Omega-6')}: {selectedRequest.omega6_pct}%</span>}
                        {selectedRequest.carbohydrate_pct != null && <span>{t('nutrition.carbohydrate', 'Carbohydrate')}: {selectedRequest.carbohydrate_pct}%</span>}
                        {selectedRequest.serving_size_g != null && <span>{t('nutrition.serving_size', 'Serving Size')}: {selectedRequest.serving_size_g}g</span>}
                      </div>
                      {selectedRequest.ingredients_text && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                          <span style={{ fontWeight: 600 }}>{t('nutrition.ingredients', 'Ingredients')}: </span>{selectedRequest.ingredients_text}
                        </div>
                      )}
                      {selectedRequest.reference_url && (
                        <div style={{ marginTop: 4 }}>
                          <strong>{t('guardian.feed.request_url', 'URL')}:</strong>{' '}
                          <a href={selectedRequest.reference_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>{selectedRequest.reference_url}</a>
                        </div>
                      )}
                      {selectedRequest.memo && (
                        <div style={{ marginTop: 4 }}><strong>{t('guardian.feed.request_memo', 'Memo')}:</strong> {selectedRequest.memo}</div>
                      )}
                      {selectedRequest.review_note && (
                        <div style={{ marginTop: 4, fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                          <strong>{t('admin.feed.reject_reason', 'Rejection Reason')}:</strong> {selectedRequest.review_note}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Catalog Tab (existing content) ── */}
        {pageTab === 'catalog' && <>
        <div className="alert" style={{ marginBottom: 12 }}>{t('admin.feed.guide')}</div>

        <div className="master-explorer-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
          <CatalogCol title={t('admin.feed.types')} sortMode={typeSort} onSortChange={setTypeSort}>
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

          <CatalogCol title={t('admin.feed.manufacturers')} onAdd={openCreateMfr} addLabel={addLabel} sortMode={mfrSort} onSortChange={setMfrSort}>
            {manufacturers.length === 0 && <div className="master-empty">{t('admin.feed.empty')}</div>}
            {manufacturers.map((item) => (
              <button key={item.id} className={`master-row-btn ${selectedMfr?.id === item.id ? 'active' : ''}`} onClick={() => { setSelectedMfr(item); setSelectedBrand(null); setSelectedModel(null); }}>
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

          <CatalogCol title={t('admin.feed.brands')} onAdd={openCreateBrand} addLabel={addLabel} sortMode={brandSort} onSortChange={setBrandSort}>
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
                  <button className="btn btn-secondary btn-sm" style={{ fontSize: 10, padding: '1px 6px' }} title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')} onClick={(e) => { e.stopPropagation(); openEditBrand(item); }}>✏️</button>
                </div>
              </button>
            ))}
          </CatalogCol>

          <CatalogCol title={t('admin.feed.models')} onAdd={openCreateModel} addLabel={addLabel}>
            {!selectedType && <div className="master-empty">{t('admin.feed.select_type')}</div>}
            {selectedType && models.length === 0 && <div className="master-empty">{t('admin.feed.empty')}</div>}
            {selectedType && models.map((item) => (
              <button key={item.id} className={`master-row-btn ${selectedModel?.id === item.id ? 'active' : ''}`} onClick={() => setSelectedModel(item)}>
                <CatalogListThumb src={item.image_url} fallbackSrc={FEED_PLACEHOLDER} alt={item.model_name} />
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
            fallbackImageSrc={FEED_PLACEHOLDER}
            onImageUpload={(file) => void handleModelImageUpload(file)}
            onImageRemove={() => void handleModelImageRemove()}
            onImageUrlChange={(url) => void handleModelImageUrlChange(url)}
            t={t}
            fields={[
              { label: t('admin.feed.type'), value: selectedModel.type_display_label || selectedModel.type_name_en || selectedModel.type_name_ko || '—' },
              { label: t('admin.feed.manufacturer'), value: selectedModel.mfr_display_label || selectedModel.mfr_name_en || selectedModel.mfr_name_ko || '—' },
              { label: t('admin.feed.brand'), value: selectedModel.brand_display_label || selectedModel.brand_name_en || selectedModel.brand_name_ko || '—' },
              ...(selectedModel.model_code ? [{ label: t('admin.feed.model_code'), value: selectedModel.model_code } satisfies ModelDetailField] : []),
              ...(selectedModel.description ? [{ label: t('admin.feed.description'), value: selectedModel.description } satisfies ModelDetailField] : []),
            ]}
          />
        )}

        {selectedModel && (
          <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 style={{ margin: 0, fontSize: 15 }}>{t('nutrition.title', 'Nutrition Info')}</h4>
              <button
                className="btn btn-primary btn-sm"
                disabled={nutritionSaving}
                onClick={() => void handleSaveNutrition()}
              >
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
      </>}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <div className="modal-title">
                {modal.mode === 'create' ? t('admin.master.btn_add') : t('admin.master.btn_edit')} {' — '}
                {modal.target === 'manufacturer' && t('admin.feed.manufacturers')}
                {modal.target === 'brand' && t('admin.feed.brands')}
                {modal.target === 'model' && t('admin.feed.models')}
              </div>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {error && <div className="alert alert-error" style={{ marginBottom: 8 }}>{error}</div>}

              {modal.target === 'manufacturer' && (
                <>
                  <div className="form-group">
                    <label className="form-label">{t('admin.feed.type')} *</label>
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
                    <label className="form-label">{t('admin.feed.country')}</label>
                    <input className="form-input" value={mfrForm.country} onChange={(e) => setMfrForm((f) => ({ ...f, country: e.target.value }))} placeholder="US" />
                  </div>
                  <TranslationFields translations={mfrTrans} onChange={setMfrTrans} translating={translating} onAutoTranslate={() => void autoTranslate(mfrTrans.ko, mfrTrans, setMfrTrans, setTranslating, setError)} t={t} />
                </>
              )}

              {modal.target === 'brand' && (
                <>
                  <div className="form-group">
                    <label className="form-label">{t('admin.feed.type')} *</label>
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
                    <label className="form-label">{t('admin.feed.manufacturer')} *</label>
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
                    <label className="form-label">{t('admin.feed.type')} *</label>
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
                    <label className="form-label">{t('admin.feed.manufacturer')} *</label>
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
                    <label className="form-label">{t('admin.feed.brand')} *</label>
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
