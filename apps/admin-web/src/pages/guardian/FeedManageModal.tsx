// 사료/영양제 관리 모달 — 탭 전환, 등록/수정/삭제 + 등록 요청
import { useEffect, useMemo, useState, useCallback } from 'react';
import { api, type FeedBrand, type FeedManufacturer, type FeedModel, type FeedNutrition, type FeedRegistrationRequest, type FeedType, type Pet, type PetFeed } from '../../lib/api';
import type { Lang } from '../../lib/i18n';
import { uiErrorMessage } from './guardianTypes';

interface Props {
  open: boolean;
  selectedPet: Pet | null;
  lang: Lang;
  t: (key: string, fallback?: string) => string;
  setError: (msg: string) => void;
  onClose: () => void;
  onChanged: (feeds: PetFeed[]) => void;
  onSupplementsChanged?: (supplements: PetFeed[]) => void;
}

type Tab = 'feed' | 'supplement';

const EMPTY_FORM = {
  feed_type_item_id: '',
  manufacturer_id: '',
  brand_id: '',
  model_id: '',
  nickname: '',
  is_primary: false,
};

const EMPTY_REQUEST_FORM = {
  feed_name: '', manufacturer_name: '', manufacturer_id: '', brand_name: '', brand_id: '',
  feed_type_item_id: '', feed_type_custom: false, manufacturer_custom: false, brand_custom: false,
  calories_per_100g: '', protein_pct: '', fat_pct: '', fiber_pct: '', moisture_pct: '',
  ash_pct: '', calcium_pct: '', phosphorus_pct: '', omega3_pct: '', omega6_pct: '',
  carbohydrate_pct: '', serving_size_g: '', ingredients_text: '',
  reference_url: '', memo: '',
};

function parseSupplementMeta(f: PetFeed): { ingredients?: string; dosage_unit?: string; calories_per_serving?: number; species_key?: string; prescribed?: boolean } {
  try {
    const desc = (f as unknown as Record<string, unknown>).model_description;
    if (desc && typeof desc === 'string') return JSON.parse(desc);
  } catch { /* ignore */ }
  return {};
}

export default function FeedManageModal({
  open, selectedPet,
  lang, t, setError: _setError, onClose, onChanged, onSupplementsChanged,
}: Props) {
  void _setError; // kept for interface compatibility
  const [activeTab, setActiveTab] = useState<Tab>('feed');

  // --- Feed state ---
  const [feeds, setFeeds] = useState<PetFeed[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);

  // --- Supplement state ---
  const [supplements, setSupplements] = useState<PetFeed[]>([]);
  const [suppLoading, setSuppLoading] = useState(false);

  // --- Broken image tracking ---
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const handleImgError = useCallback((id: string) => {
    setBrokenImages((prev) => { const next = new Set(prev); next.add(id); return next; });
  }, []);

  // --- Shared form state ---
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  // cascade state
  const [feedTypes, setFeedTypes] = useState<FeedType[]>([]);
  const [suppTypes, setSuppTypes] = useState<FeedType[]>([]);
  const [manufacturers, setManufacturers] = useState<FeedManufacturer[]>([]);
  const [brands, setBrands] = useState<FeedBrand[]>([]);
  const [nutrition, setNutrition] = useState<FeedNutrition | null>(null);

  // Search-first state
  const [searchTerm, setSearchTerm] = useState('');
  const [allModels, setAllModels] = useState<FeedModel[]>([]);
  const [allModelsLoading, setAllModelsLoading] = useState(false);

  // Registration request state
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState(EMPTY_REQUEST_FORM);
  const [requestSaving, setRequestSaving] = useState(false);
  const [myRequests, setMyRequests] = useState<FeedRegistrationRequest[]>([]);
  const [suppRequests, setSuppRequests] = useState<FeedRegistrationRequest[]>([]);
  const [showMyRequests, setShowMyRequests] = useState(false);
  const [showNutritionFields, setShowNutritionFields] = useState(false);
  const [nutritionStep, setNutritionStep] = useState(0);
  // All manufacturers/brands for request form dropdowns
  const [allManufacturers, setAllManufacturers] = useState<FeedManufacturer[]>([]);
  const [allBrands, setAllBrands] = useState<FeedBrand[]>([]);

  const petId = selectedPet?.id;
  const isFeed = activeTab === 'feed';
  const items = isFeed ? feeds : supplements;
  const loading = isFeed ? feedLoading : suppLoading;
  const currentRequests = isFeed ? myRequests : suppRequests;
  const currentTypes = isFeed ? feedTypes : suppTypes;

  // --- Catalog API helpers ---
  const catalogApi = isFeed ? api.feedCatalog.public : api.supplementCatalog.public;
  const itemApi = isFeed ? api.pets.petFeeds : api.pets.petSupplements;

  // --- Load data ---
  async function loadFeeds() {
    if (!petId) return;
    setFeedLoading(true);
    try {
      const res = await api.pets.petFeeds.list(petId);
      setFeeds(res.feeds);
      onChanged(res.feeds);
    } catch (e) {
      setModalError(uiErrorMessage(e, t('common.err.network', 'Failed to load data.')));
    } finally {
      setFeedLoading(false);
    }
  }

  async function loadSupplements() {
    if (!petId) return;
    setSuppLoading(true);
    try {
      const res = await api.pets.petSupplements.list(petId);
      setSupplements(res.feeds);
    } catch (e) {
      setModalError(uiErrorMessage(e, t('common.err.network', 'Failed to load data.')));
    } finally {
      setSuppLoading(false);
    }
  }

  async function loadMyRequests() {
    try {
      const rows = await api.feedRequests.list();
      setMyRequests(rows);
    } catch { /* ignore */ }
  }

  async function loadSuppRequests() {
    try {
      const rows = await api.supplementRequests.list();
      setSuppRequests(rows);
    } catch { /* ignore */ }
  }

  async function loadRequestDropdowns() {
    const pub = isFeed ? api.feedCatalog.public : api.supplementCatalog.public;
    try {
      const mfrs = await pub.manufacturers();
      setAllManufacturers(mfrs);
    } catch { setAllManufacturers([]); }
    try {
      const brs = await pub.brands();
      setAllBrands(brs);
    } catch { setAllBrands([]); }
  }

  useEffect(() => {
    if (open && petId) {
      void loadFeeds();
      void loadSupplements();
    }
    if (open) {
      void loadMyRequests();
      void loadSuppRequests();
    }
  }, [open, petId]);

  // Load feed types
  useEffect(() => {
    if (!open) return;
    const run = async () => {
      try { setFeedTypes(await api.feedCatalog.public.types(lang)); } catch { setFeedTypes([]); }
      try { setSuppTypes(await api.supplementCatalog.public.types(lang)); } catch { setSuppTypes([]); }
    };
    void run();
  }, [open, lang]);

  // Load ALL models + manufacturers + brands when add form opens (search-first)
  useEffect(() => {
    if (!open || !showForm || editingId) return;
    setAllModelsLoading(true);
    void (async () => {
      try {
        const [m, mfrs, brs] = await Promise.all([
          catalogApi.models({}, lang),
          catalogApi.manufacturers(undefined, lang),
          catalogApi.brands(),
        ]);
        setAllModels(m);
        setManufacturers(mfrs);
        setBrands(brs);
      } catch { setAllModels([]); setManufacturers([]); setBrands([]); }
      finally { setAllModelsLoading(false); }
    })();
  }, [open, showForm, editingId, activeTab, lang]);

  // Client-side filtered models
  const filteredModels = useMemo(() => {
    let result = allModels;
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      result = result.filter((m) =>
        [m.model_display_label, m.model_name, m.model_code, m.mfr_display_label, m.brand_display_label]
          .some(s => s?.toLowerCase().includes(term))
      );
    }
    if (form.feed_type_item_id) result = result.filter(m => m.feed_type_item_id === form.feed_type_item_id);
    if (form.manufacturer_id) result = result.filter(m => m.manufacturer_id === form.manufacturer_id);
    if (form.brand_id) result = result.filter(m => m.brand_id === form.brand_id);
    return result;
  }, [allModels, searchTerm, form.feed_type_item_id, form.manufacturer_id, form.brand_id]);

  function handleSelectModel(model: FeedModel) {
    if (form.model_id === model.id) {
      // Deselect
      setForm(p => ({ ...p, model_id: '', feed_type_item_id: '', manufacturer_id: '', brand_id: '' }));
    } else {
      // Select → auto-fill
      setForm(p => ({
        ...p, model_id: model.id,
        feed_type_item_id: model.feed_type_item_id || '',
        manufacturer_id: model.manufacturer_id || '',
        brand_id: model.brand_id || '',
      }));
    }
  }

  // Load nutrition when model changes
  useEffect(() => {
    if (!form.model_id) { setNutrition(null); return; }
    const run = async () => {
      try {
        setNutrition(await catalogApi.nutrition(form.model_id));
      } catch { setNutrition(null); }
    };
    void run();
  }, [form.model_id, activeTab]);

  // --- Options ---
  const typeOptions = useMemo(
    () => currentTypes
      .filter((ft) => (ft.model_count ?? 0) > 0)
      .map((ft) => ({ id: ft.id, key: ft.key, label: `${(ft.display_label || ft.key).trim()} (${ft.model_count})` })),
    [currentTypes],
  );

  const allTypeOptions = useMemo(
    () => currentTypes.map((ft) => ({ id: ft.id, key: ft.key, label: (ft.display_label || ft.key).trim() })),
    [currentTypes],
  );

  const allMfrOptions = useMemo(
    () => allManufacturers.filter((r) => r.status === 'active').map((r) => ({
      id: r.id,
      label: (r.display_label || '').trim() || (lang === 'ko' ? (r.name_ko || r.name_en || r.key) : (r.name_en || r.name_ko || r.key)),
    })),
    [allManufacturers, lang],
  );

  const allBrandOptions = useMemo(
    () => allBrands.filter((r) => r.status === 'active').map((r) => ({
      id: r.id,
      label: lang === 'ko' ? (r.name_ko || r.name_en || r.id) : (r.name_en || r.name_ko || r.id),
    })),
    [allBrands, lang],
  );

  const mfrOptions = useMemo(
    () => manufacturers
      .filter((r) => r.status === 'active' && (r.model_count ?? 0) > 0)
      .map((r) => ({
        id: r.id, key: r.key,
        label: `${((r.display_label || '').trim() || (lang === 'ko' ? (r.name_ko || r.name_en || r.key) : (r.name_en || r.name_ko || r.key)))} (${r.model_count ?? 0})`,
      })),
    [manufacturers, lang],
  );

  const brandOptions = useMemo(
    () => brands
      .filter((r) => r.status === 'active' && (r.model_count ?? 0) > 0)
      .map((r) => ({
        id: r.id, key: r.name_en || r.name_ko || r.id,
        label: `${((r.display_label || '').trim() || (lang === 'ko' ? (r.name_ko || r.name_en || r.id) : (r.name_en || r.name_ko || r.id)))} (${r.model_count ?? 0})`,
      })),
    [brands, lang],
  );


  // --- Helpers ---
  function renderSelect(
    label: string, value: string, options: Array<{ id: string; key: string; label: string }>,
    onChange: (v: string) => void, required = false, name?: string, placeholder?: string, disabled = false,
  ) {
    return (
      <div className="form-group">
        <label className="form-label" htmlFor={name}>{label}{required ? ' *' : ''}</label>
        <select id={name} name={name} className="form-select" value={value}
          onChange={(e) => onChange(e.target.value)} disabled={disabled}>
          <option value="">{placeholder || t('common.select', 'Select')}</option>
          {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
      </div>
    );
  }

  function resetFormState() {
    setShowForm(false);
    setShowRequestForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setRequestForm(EMPTY_REQUEST_FORM);
    setShowNutritionFields(false);
    setNutrition(null);
    setShowMyRequests(false);
    setSearchTerm('');
    setAllModels([]);
  }

  function switchTab(tab: Tab) {
    resetFormState();
    setActiveTab(tab);
  }

  function openAddForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEditForm(f: PetFeed) {
    setEditingId(f.id);
    setForm({ feed_type_item_id: '', manufacturer_id: '', brand_id: '', model_id: f.feed_model_id, nickname: f.nickname || '', is_primary: !!f.is_primary });
    setShowForm(true);
  }

  async function handleSave() {
    if (!petId || saving) return;
    setModalError('');
    const modelRequiredMsg = isFeed
      ? t('guardian.feed.model_required', 'Please select a feed product.')
      : t('guardian.supplement.model_required', 'Please select a supplement product.');
    if (!editingId && !form.model_id) { setModalError(modelRequiredMsg); return; }
    setSaving(true);
    try {
      if (editingId) {
        await itemApi.update(petId, editingId, { nickname: form.nickname, is_primary: form.is_primary });
        // Optimistic update for edit
        const updater = (prev: PetFeed[]) => prev.map((f) =>
          f.id === editingId
            ? { ...f, nickname: form.nickname, is_primary: form.is_primary }
            : form.is_primary ? { ...f, is_primary: false } : f,
        );
        if (isFeed) { setFeeds(updater); onChanged(updater(feeds)); } else { const next = updater(supplements); setSupplements(next); onSupplementsChanged?.(next); }
      } else {
        const res = await itemApi.create(petId, { feed_model_id: form.model_id, nickname: form.nickname || undefined, is_primary: form.is_primary });
        // Optimistic update — build item from cascade data so it shows immediately
        const selectedModel = allModels.find((m) => m.id === form.model_id);
        const selectedType = currentTypes.find((ft) => ft.id === form.feed_type_item_id);
        const selectedMfr = manufacturers.find((m) => m.id === form.manufacturer_id);
        const selectedBrand = brands.find((b) => b.id === form.brand_id);
        const optimistic: PetFeed = {
          id: res.id, pet_id: petId, feed_model_id: form.model_id,
          nickname: form.nickname || null, is_primary: form.is_primary,
          status: 'active', category_type: isFeed ? 'feed' : 'supplement',
          model_name: selectedModel?.model_name || '', model_code: selectedModel?.model_code || '',
          model_display_label: selectedModel?.model_display_label || selectedModel?.model_name || '',
          type_display_label: selectedType?.display_label || '',
          mfr_display_label: selectedMfr?.display_label || '', mfr_name_ko: null, mfr_name_en: null,
          brand_display_label: selectedBrand?.display_label || '', brand_name_ko: null, brand_name_en: null,
          created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        } as PetFeed;
        if (isFeed) {
          const next = form.is_primary ? [optimistic, ...feeds.map((f) => ({ ...f, is_primary: false }))] : [optimistic, ...feeds];
          setFeeds(next);
          onChanged(next);
        } else {
          const next = form.is_primary ? [optimistic, ...supplements.map((f) => ({ ...f, is_primary: false }))] : [optimistic, ...supplements];
          setSupplements(next);
          onSupplementsChanged?.(next);
        }
      }
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      setNutrition(null);
    } catch (e) {
      setModalError(uiErrorMessage(e, t('common.err.save', 'Failed to save.')));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!petId || saving) return;
    setModalError('');
    const msg = isFeed ? t('guardian.feed.delete_confirm', 'Delete this feed?') : t('guardian.supplement.delete_confirm', 'Delete this supplement?');
    if (!confirm(msg)) return;
    setSaving(true);
    try {
      await itemApi.remove(petId, id);
      // Optimistic remove — update local state immediately
      if (isFeed) {
        const next = feeds.filter((f) => f.id !== id);
        setFeeds(next);
        onChanged(next);
      } else {
        const next = supplements.filter((f) => f.id !== id);
        setSupplements(next);
        onSupplementsChanged?.(next);
      }
    } catch (e) {
      setModalError(uiErrorMessage(e, t('common.err.save', 'Failed to delete.')));
    } finally {
      setSaving(false);
    }
  }

  async function handleSetPrimary(id: string) {
    if (!petId || saving) return;
    setModalError('');
    setSaving(true);
    try {
      await itemApi.update(petId, id, { is_primary: true });
      // Optimistic update
      const updater = (prev: PetFeed[]) => prev.map((f) => ({ ...f, is_primary: f.id === id }));
      if (isFeed) { const next = updater(feeds); setFeeds(next); onChanged(next); } else { const next = updater(supplements); setSupplements(next); onSupplementsChanged?.(next); }
    } catch (e) {
      setModalError(uiErrorMessage(e, t('common.err.save', 'Failed to set primary.')));
    } finally {
      setSaving(false);
    }
  }

  const numOrUndef = (v: string) => v ? Number(v) : undefined;

  async function handleSubmitRequest() {
    const feedName = requestForm.feed_name.trim();
    const nameLabel = isFeed ? t('guardian.feed.request_name', 'Feed Name') : t('guardian.supplement.request_name', 'Supplement Name');
    if (!feedName) { setModalError(nameLabel + ' required'); return; }
    let mfrName = requestForm.manufacturer_name || undefined;
    if (requestForm.manufacturer_id && !requestForm.manufacturer_custom) {
      const m = allMfrOptions.find((x) => x.id === requestForm.manufacturer_id);
      if (m) mfrName = m.label;
    }
    let brandName = requestForm.brand_name || undefined;
    if (requestForm.brand_id && !requestForm.brand_custom) {
      const b = allBrandOptions.find((x) => x.id === requestForm.brand_id);
      if (b) brandName = b.label;
    }
    setRequestSaving(true);
    try {
      if (isFeed) {
        await api.feedRequests.create({
          feed_name: feedName,
          pet_id: petId || undefined,
          feed_type_item_id: requestForm.feed_type_item_id || undefined,
          manufacturer_name: mfrName,
          brand_name: brandName,
          calories_per_100g: numOrUndef(requestForm.calories_per_100g),
          protein_pct: numOrUndef(requestForm.protein_pct),
          fat_pct: numOrUndef(requestForm.fat_pct),
          fiber_pct: numOrUndef(requestForm.fiber_pct),
          moisture_pct: numOrUndef(requestForm.moisture_pct),
          ash_pct: numOrUndef(requestForm.ash_pct),
          calcium_pct: numOrUndef(requestForm.calcium_pct),
          phosphorus_pct: numOrUndef(requestForm.phosphorus_pct),
          omega3_pct: numOrUndef(requestForm.omega3_pct),
          omega6_pct: numOrUndef(requestForm.omega6_pct),
          carbohydrate_pct: numOrUndef(requestForm.carbohydrate_pct),
          serving_size_g: numOrUndef(requestForm.serving_size_g),
          ingredients_text: requestForm.ingredients_text || undefined,
          reference_url: requestForm.reference_url || undefined,
          memo: requestForm.memo || undefined,
        });
      } else {
        await api.supplementRequests.create({
          feed_name: feedName,
          pet_id: petId || undefined,
          feed_type_item_id: requestForm.feed_type_item_id || undefined,
          manufacturer_name: mfrName,
          brand_name: brandName,
          reference_url: requestForm.reference_url || undefined,
          memo: requestForm.memo || undefined,
        });
      }
      setShowRequestForm(false);
      setRequestForm(EMPTY_REQUEST_FORM);
      setShowNutritionFields(false);
      alert(t('guardian.feed.request_submitted', 'Registration request submitted.'));
      if (isFeed) void loadMyRequests(); else void loadSuppRequests();
    } catch (e) {
      setModalError(uiErrorMessage(e, t('common.err.save', 'Failed to save.')));
    } finally {
      setRequestSaving(false);
    }
  }

  function itemLabel(f: PetFeed): string {
    return f.model_display_label || f.model_name || f.model_code || f.feed_model_id;
  }

  function itemSubLabel(f: PetFeed): string {
    const parts: string[] = [];
    const typeName = f.type_display_label || '';
    if (typeName) parts.push(typeName);
    const mfr = f.mfr_display_label || f.mfr_name_ko || f.mfr_name_en || '';
    const brand = f.brand_display_label || f.brand_name_ko || f.brand_name_en || '';
    if (mfr && brand) parts.push(`${mfr} > ${brand}`);
    else if (mfr) parts.push(mfr);
    else if (brand) parts.push(brand);
    return parts.join(' · ');
  }


  // --- Labels per tab ---
  const tabLabels = isFeed
    ? {
        emptyIcon: '🥣',
        emptyTitle: t('guardian.feed.empty_title', '아직 등록된 사료가 없어요.'),
        emptyDesc: t('guardian.feed.empty_desc', '반려동물의 사료를 추가해보세요!'),
        addBtn: t('guardian.feed.add', '사료 추가'),
        editBtn: t('guardian.feed.edit', '사료 수정'),
        primaryLabel: t('guardian.feed.is_primary', '기본 사료'),
        setPrimary: t('guardian.feed.set_primary', '기본 설정'),
        nicknameLabel: t('guardian.feed.nickname', '별명'),
        nicknamePlaceholder: t('guardian.feed.nickname_placeholder', '예: 방울이 처방식'),
        typeLabel: t('admin.feed.type', '사료 유형'),
        searchLabel: t('guardian.feed.search_label', '사료명 검색'),
        searchPlaceholder: t('guardian.feed.search_placeholder', '사료를 검색하세요...'),
        requestBtn: t('guardian.feed.request_btn', 'Request Feed Registration'),
        requestDesc: t('guardian.feed.request_desc', "Can't find your feed? Request registration."),
        requestNameLabel: t('guardian.feed.request_name', 'Feed Name'),
      }
    : {
        emptyIcon: '💊',
        emptyTitle: t('guardian.supplement.empty_title', '아직 등록된 영양제가 없어요.'),
        emptyDesc: t('guardian.supplement.empty_desc', '반려동물의 영양제를 추가해보세요!'),
        addBtn: t('guardian.supplement.add', '영양제 추가'),
        editBtn: t('guardian.supplement.edit', '영양제 수정'),
        primaryLabel: t('guardian.supplement.is_primary', '기본 영양제'),
        setPrimary: t('guardian.supplement.set_primary', '기본 설정'),
        nicknameLabel: t('guardian.supplement.nickname', '별명'),
        nicknamePlaceholder: t('guardian.supplement.nickname_placeholder', '예: 방울이 관절 영양제'),
        typeLabel: t('guardian.supplement.type', '영양제 유형'),
        searchLabel: t('guardian.supplement.search_label', '영양제명 검색'),
        searchPlaceholder: t('guardian.supplement.search_placeholder', '영양제를 검색하세요...'),
        requestBtn: t('guardian.supplement.request_btn', 'Request Supplement Registration'),
        requestDesc: t('guardian.supplement.request_desc', "Can't find your supplement? Request registration."),
        requestNameLabel: t('guardian.supplement.request_name', 'Supplement Name'),
      };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <h3 className="modal-title">{t('guardian.supplement.manage_title', '사료 / 영양제 관리')}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {/* ── Tab Bar ──────────────────────────────────────────── */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--bg)', borderRadius: 8, padding: 3 }}>
            {([
              { key: 'feed' as Tab, icon: '🥣', label: t('guardian.modal.tab_feed', '사료') },
              { key: 'supplement' as Tab, icon: '💊', label: t('guardian.modal.tab_supplement', '영양제') },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => switchTab(tab.key)}
                style={{
                  flex: 1, padding: '8px 0', border: 'none', borderRadius: 6, cursor: 'pointer',
                  fontSize: 14, fontWeight: activeTab === tab.key ? 600 : 400,
                  background: activeTab === tab.key ? 'var(--primary)' : 'transparent',
                  color: activeTab === tab.key ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.2s',
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* ── Error Banner ─────────────────────────────────────── */}
          {modalError && (
            <div className="alert alert-error" style={{ margin: '0 0 12px', padding: '8px 12px', fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{modalError}</span>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: '0 4px', color: 'inherit' }} onClick={() => setModalError('')}>&times;</button>
            </div>
          )}

          {loading && <p className="text-sm text-muted">{t('common.loading', 'Loading...')}</p>}

          {/* ── Empty State ──────────────────────────────────────── */}
          {!loading && items.length === 0 && !showForm && !showRequestForm && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>{tabLabels.emptyIcon}</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                {tabLabels.emptyTitle}
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
                {tabLabels.emptyDesc}
              </div>
              <button
                className="btn btn-primary"
                style={{ fontSize: 15, padding: '10px 28px', borderRadius: 8 }}
                onClick={openAddForm}
              >
                + {tabLabels.addBtn}
              </button>
            </div>
          )}

          {/* ── Item List ────────────────────────────────────────── */}
          {!showForm && !showRequestForm && items.map((f) => {
            const meta = !isFeed ? parseSupplementMeta(f) : null;
            return (
              <div key={f.id} style={{
                border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', marginBottom: 8,
                background: f.is_primary ? 'var(--primary-light, #fffbeb)' : 'var(--surface)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  {f.image_url && !brokenImages.has(f.id) ? (
                    <img src={f.image_url} alt="" className="gm-feed-card-thumb" onError={() => handleImgError(f.id)} />
                  ) : (
                    <div className="gm-feed-card-thumb-placeholder">{isFeed ? '\u{1F37D}' : '\u{1F48A}'}</div>
                  )}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>
                      {itemLabel(f)}
                      {f.nickname && <span style={{ fontWeight: 400, color: 'var(--text-secondary)', marginLeft: 8 }}>({f.nickname})</span>}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{itemSubLabel(f)}</div>
                    {/* Feed: nutrition summary */}
                    {isFeed && f.calories_per_100g != null && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {f.calories_per_100g} kcal/100g
                        {f.protein_pct != null && ` · P${f.protein_pct}%`}
                        {f.fat_pct != null && ` · F${f.fat_pct}%`}
                      </div>
                    )}
                    {/* Supplement: meta info */}
                    {!isFeed && meta && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {meta.dosage_unit && <span>{meta.dosage_unit}</span>}
                        {meta.species_key && <span> · {meta.species_key}</span>}
                        {meta.ingredients && <span> · {meta.ingredients}</span>}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                      {!!f.is_primary && (
                        <span style={{ display: 'inline-block', fontSize: 11, background: 'var(--primary)', color: '#fff', borderRadius: 4, padding: '1px 6px' }}>
                          {tabLabels.primaryLabel}
                        </span>
                      )}
                      {!isFeed && meta?.prescribed && (
                        <span style={{ display: 'inline-block', fontSize: 11, background: '#e53935', color: '#fff', borderRadius: 4, padding: '1px 6px' }}>
                          {t('guardian.supplement.prescribed_badge', '처방')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    {!f.is_primary && (
                      <button className="btn btn-sm" style={{ fontSize: 12 }} disabled={saving} onClick={() => void handleSetPrimary(f.id)}>
                        {tabLabels.setPrimary}
                      </button>
                    )}
                    <button className="btn btn-sm" style={{ fontSize: 12 }} disabled={saving} title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')} onClick={() => openEditForm(f)}>✏️</button>
                    <button className="btn btn-sm btn-danger" style={{ fontSize: 12 }} disabled={saving} title={t('common.delete', 'Delete')} aria-label={t('common.delete', 'Delete')} onClick={() => void handleDelete(f.id)}>🗑️</button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* ── Add/Edit Form ────────────────────────────────────── */}
          {showForm && (
            <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 14, background: 'var(--surface)' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 15 }}>
                {editingId ? tabLabels.editBtn : tabLabels.addBtn}
              </h4>
              {!editingId && (
                <>
                  {/* Search input */}
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <label className="form-label" htmlFor="model-search">{tabLabels.searchLabel} *</label>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {t('common.total', 'Total')} {filteredModels.length}
                      </span>
                    </div>
                    <input
                      id="model-search" className="form-input" type="text"
                      value={searchTerm} placeholder={`🔍 ${tabLabels.searchPlaceholder}`}
                      onChange={(e) => setSearchTerm(e.target.value)} autoFocus
                    />
                  </div>

                  {/* Results list */}
                  {allModelsLoading ? (
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '8px 0' }}>{t('guardian.catalog.loading_models', '제품 목록 불러오는 중...')}</p>
                  ) : (
                    <div style={{ maxHeight: 240, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, marginBottom: 12 }}>
                      {filteredModels.length === 0 ? (
                        <div style={{ padding: '20px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                          {t('guardian.catalog.no_results', '검색 결과가 없습니다')}
                        </div>
                      ) : (
                        filteredModels.map((m) => {
                          const isSelected = form.model_id === m.id;
                          const label = m.model_display_label || m.model_name || m.model_code || m.id;
                          const sub = [m.type_display_label, [m.mfr_display_label, m.brand_display_label].filter(Boolean).join(' > ')].filter(Boolean).join(' · ');
                          return (
                            <div key={m.id} onClick={() => handleSelectModel(m)} style={{
                              padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)',
                              background: isSelected ? 'var(--primary-light, #fffbeb)' : 'transparent',
                              display: 'flex', alignItems: 'center', gap: 8,
                            }}>
                              <span style={{ fontSize: 16, flexShrink: 0, width: 20, textAlign: 'center' }}>{isSelected ? '✓' : ''}</span>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: isSelected ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
                                {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{sub}</div>}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* Filter dropdowns (auto-filled & disabled when model selected) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {renderSelect(tabLabels.typeLabel, form.feed_type_item_id, typeOptions,
                      (v) => { if (!form.model_id) setForm(p => ({ ...p, feed_type_item_id: v })); },
                      false, 'cat-type', undefined, !!form.model_id)}
                    {renderSelect(t('admin.feed.manufacturer', '제조사'), form.manufacturer_id, mfrOptions,
                      (v) => { if (!form.model_id) setForm(p => ({ ...p, manufacturer_id: v })); },
                      false, 'cat-manufacturer', undefined, !!form.model_id)}
                  </div>
                  {renderSelect(t('admin.feed.brand', '브랜드'), form.brand_id, brandOptions,
                    (v) => { if (!form.model_id) setForm(p => ({ ...p, brand_id: v })); },
                    false, 'cat-brand', undefined, !!form.model_id)}
                </>
              )}
              <div className="form-group">
                <label className="form-label" htmlFor="item-nickname">{tabLabels.nicknameLabel}</label>
                <input id="item-nickname" name="item-nickname" className="form-input"
                  value={form.nickname} placeholder={tabLabels.nicknamePlaceholder}
                  onChange={(e) => setForm((p) => ({ ...p, nickname: e.target.value }))} />
              </div>
              {/* Nutrition info (read-only, shown when model selected) */}
              {nutrition && (
                <div style={{ margin: '8px 0', padding: '10px 12px', background: 'var(--bg)', borderRadius: 6, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{t('nutrition.title', '영양 정보')}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px 12px', fontSize: 12, color: 'var(--text-secondary)' }}>
                    {nutrition.calories_per_100g != null && <span>{t('nutrition.calories', '칼로리')}: {nutrition.calories_per_100g} kcal</span>}
                    {nutrition.protein_pct != null && <span>{t('nutrition.protein', '단백질')}: {nutrition.protein_pct}%</span>}
                    {nutrition.fat_pct != null && <span>{t('nutrition.fat', '지방')}: {nutrition.fat_pct}%</span>}
                    {nutrition.fiber_pct != null && <span>{t('nutrition.fiber', '식이섬유')}: {nutrition.fiber_pct}%</span>}
                    {nutrition.moisture_pct != null && <span>{t('nutrition.moisture', '수분')}: {nutrition.moisture_pct}%</span>}
                    {nutrition.carbohydrate_pct != null && <span>{t('nutrition.carbohydrate', '탄수화물')}: {nutrition.carbohydrate_pct}%</span>}
                  </div>
                  {nutrition.ingredients_text && (
                    <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                      <span style={{ fontWeight: 600 }}>{t('nutrition.ingredients', '성분')}: </span>{nutrition.ingredients_text}
                    </div>
                  )}
                </div>
              )}
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, marginTop: 8, cursor: 'pointer' }}>
                <input name="item-is-primary" type="checkbox" checked={form.is_primary}
                  onChange={(e) => setForm((p) => ({ ...p, is_primary: e.target.checked }))} />
                {tabLabels.setPrimary}
              </label>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
                <button className="btn btn-secondary btn-sm" disabled={saving} onClick={() => { setShowForm(false); setEditingId(null); }}>
                  {t('common.cancel', 'Cancel')}
                </button>
                <button className="btn btn-primary btn-sm" disabled={saving} onClick={() => void handleSave()}>
                  {saving ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
                </button>
              </div>
            </div>
          )}

          {/* ── Registration Request ─────────────────────────────── */}
          {!showForm && !showRequestForm && (
            <div style={{ margin: '16px 0 8px', border: '2px dashed var(--border)', borderRadius: 8, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{tabLabels.requestBtn}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{tabLabels.requestDesc}</div>
                </div>
                <button className="btn btn-sm btn-primary" onClick={() => { setShowRequestForm(true); void loadRequestDropdowns(); }}>+</button>
              </div>
            </div>
          )}

          {!showForm && showRequestForm && (
            <div style={{ border: '2px solid var(--primary)', borderRadius: 8, padding: 14, background: 'var(--surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h4 style={{ margin: 0, fontSize: 15 }}>{tabLabels.requestBtn}</h4>
                <button className="btn btn-sm btn-secondary" onClick={() => { setShowRequestForm(false); setRequestForm(EMPTY_REQUEST_FORM); setShowNutritionFields(false); }}>
                  {t('common.cancel', 'Cancel')}
                </button>
              </div>
              <div className="form-group">
                <label className="form-label">{tabLabels.requestNameLabel} *</label>
                <input className="form-input" value={requestForm.feed_name} onChange={(e) => setRequestForm((p) => ({ ...p, feed_name: e.target.value }))} />
              </div>
              {/* Type: dropdown */}
              <div className="form-group">
                <label className="form-label">{tabLabels.typeLabel}</label>
                <select className="form-select" value={requestForm.feed_type_item_id} onChange={(e) => setRequestForm((p) => ({ ...p, feed_type_item_id: e.target.value }))}>
                  <option value="">{t('common.select', 'Select')}</option>
                  {allTypeOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </div>
              {/* Manufacturer: dropdown + custom toggle */}
              <div className="form-group">
                <label className="form-label" style={{ marginBottom: 4 }}>{t('guardian.feed.request_manufacturer', 'Manufacturer')}</label>
                {!requestForm.manufacturer_custom ? (
                  <>
                    <select className="form-select" value={requestForm.manufacturer_id}
                      onChange={(e) => {
                        const id = e.target.value;
                        const m = allMfrOptions.find((x) => x.id === id);
                        setRequestForm((p) => ({ ...p, manufacturer_id: id, manufacturer_name: m?.label || '' }));
                      }}>
                      <option value="">{t('common.select', 'Select')}</option>
                      {allMfrOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>
                    <button type="button" style={{ background: 'none', border: 'none', padding: '4px 0 0', fontSize: 12, color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer', textAlign: 'left' }}
                      onClick={() => setRequestForm((p) => ({ ...p, manufacturer_custom: true, manufacturer_id: '', manufacturer_name: '' }))}>
                      {t('guardian.feed.custom_manufacturer', '찾는 제조사가 없으신가요? 직접 입력하기')}
                    </button>
                  </>
                ) : (
                  <>
                    <input className="form-input" placeholder={t('guardian.feed.request_manufacturer', 'Manufacturer')}
                      value={requestForm.manufacturer_name} onChange={(e) => setRequestForm((p) => ({ ...p, manufacturer_name: e.target.value, manufacturer_id: '' }))} />
                    <button type="button" style={{ background: 'none', border: 'none', padding: '4px 0 0', fontSize: 12, color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer', textAlign: 'left' }}
                      onClick={() => setRequestForm((p) => ({ ...p, manufacturer_custom: false, manufacturer_id: '', manufacturer_name: '' }))}>
                      {t('guardian.feed.select_existing', 'Select Existing')}
                    </button>
                  </>
                )}
              </div>
              {/* Brand: dropdown + custom toggle */}
              <div className="form-group">
                <label className="form-label" style={{ marginBottom: 4 }}>{t('guardian.feed.request_brand', 'Brand')}</label>
                {!requestForm.brand_custom ? (
                  <>
                    <select className="form-select" value={requestForm.brand_id}
                      onChange={(e) => {
                        const id = e.target.value;
                        const b = allBrandOptions.find((x) => x.id === id);
                        setRequestForm((p) => ({ ...p, brand_id: id, brand_name: b?.label || '' }));
                      }}>
                      <option value="">{t('common.select', 'Select')}</option>
                      {allBrandOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>
                    <button type="button" style={{ background: 'none', border: 'none', padding: '4px 0 0', fontSize: 12, color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer', textAlign: 'left' }}
                      onClick={() => setRequestForm((p) => ({ ...p, brand_custom: true, brand_id: '', brand_name: '' }))}>
                      {t('guardian.feed.custom_brand', '찾는 브랜드가 없으신가요? 직접 입력하기')}
                    </button>
                  </>
                ) : (
                  <>
                    <input className="form-input" placeholder={t('guardian.feed.request_brand', 'Brand')}
                      value={requestForm.brand_name} onChange={(e) => setRequestForm((p) => ({ ...p, brand_name: e.target.value, brand_id: '' }))} />
                    <button type="button" style={{ background: 'none', border: 'none', padding: '4px 0 0', fontSize: 12, color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer', textAlign: 'left' }}
                      onClick={() => setRequestForm((p) => ({ ...p, brand_custom: false, brand_id: '', brand_name: '' }))}>
                      {t('guardian.feed.select_existing', 'Select Existing')}
                    </button>
                  </>
                )}
              </div>
              {/* Nutrition fields — Feed only (4-step Wizard) */}
              {isFeed && (
                <>
                  {!showNutritionFields ? (
                    <button className="btn btn-sm" style={{ fontSize: 12, marginBottom: 8 }} onClick={() => { setShowNutritionFields(true); setNutritionStep(0); }}>
                      ▶ {t('guardian.feed.request_nutrition', 'Nutrition Info (Optional)')}
                    </button>
                  ) : (
                    <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12, marginBottom: 8, background: 'var(--bg)' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{t('guardian.feed.request_nutrition', 'Nutrition Info (Optional)')}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 4, marginBottom: 12 }}>
                        {[
                          t('guardian.feed.nutr_step1', '기본 영양소'),
                          t('guardian.feed.nutr_step2', '상세 영양소'),
                          t('guardian.feed.nutr_step3', '미네랄/기타'),
                          t('guardian.feed.nutr_step4', '원재료'),
                        ].map((label, i) => (
                          <button key={i} type="button" onClick={() => setNutritionStep(i)}
                            style={{
                              padding: '4px 0', fontSize: 11, fontWeight: nutritionStep === i ? 700 : 400, textAlign: 'center',
                              border: 'none', borderRadius: 4, cursor: 'pointer',
                              background: nutritionStep === i ? 'var(--primary)' : 'var(--surface)',
                              color: nutritionStep === i ? '#fff' : 'var(--text-secondary)',
                            }}>
                            {label}
                          </button>
                        ))}
                      </div>
                      {nutritionStep === 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                          {(['calories_per_100g', 'protein_pct', 'fat_pct', 'carbohydrate_pct'] as const).map((key) => {
                            const labels: Record<string, string> = {
                              calories_per_100g: t('nutrition.calories', 'kcal/100g'),
                              protein_pct: t('nutrition.protein', 'Protein') + ' %',
                              fat_pct: t('nutrition.fat', 'Fat') + ' %',
                              carbohydrate_pct: t('nutrition.carbohydrate', 'Carbohydrate') + ' %',
                            };
                            return (
                              <div key={key} className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" style={{ fontSize: 11 }}>{labels[key]}</label>
                                <input className="form-input" type="number" step="0.1" value={(requestForm as unknown as Record<string, string>)[key] || ''} onChange={(e) => setRequestForm((p) => ({ ...p, [key]: e.target.value }))} />
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {nutritionStep === 1 && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                          {(['fiber_pct', 'moisture_pct', 'ash_pct', 'serving_size_g'] as const).map((key) => {
                            const labels: Record<string, string> = {
                              fiber_pct: t('nutrition.fiber', 'Fiber') + ' %',
                              moisture_pct: t('nutrition.moisture', 'Moisture') + ' %',
                              ash_pct: t('nutrition.ash', 'Ash') + ' %',
                              serving_size_g: t('nutrition.serving_size', 'Serving Size') + ' (g)',
                            };
                            return (
                              <div key={key} className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" style={{ fontSize: 11 }}>{labels[key]}</label>
                                <input className="form-input" type="number" step="0.1" value={(requestForm as unknown as Record<string, string>)[key] || ''} onChange={(e) => setRequestForm((p) => ({ ...p, [key]: e.target.value }))} />
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {nutritionStep === 2 && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                          {(['calcium_pct', 'phosphorus_pct', 'omega3_pct', 'omega6_pct'] as const).map((key) => {
                            const labels: Record<string, string> = {
                              calcium_pct: t('nutrition.calcium', 'Calcium') + ' %',
                              phosphorus_pct: t('nutrition.phosphorus', 'Phosphorus') + ' %',
                              omega3_pct: t('nutrition.omega3', 'Omega-3') + ' %',
                              omega6_pct: t('nutrition.omega6', 'Omega-6') + ' %',
                            };
                            return (
                              <div key={key} className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" style={{ fontSize: 11 }}>{labels[key]}</label>
                                <input className="form-input" type="number" step="0.1" value={(requestForm as unknown as Record<string, string>)[key] || ''} onChange={(e) => setRequestForm((p) => ({ ...p, [key]: e.target.value }))} />
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {nutritionStep === 3 && (
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: 11 }}>{t('nutrition.ingredients', 'Ingredients')}</label>
                          <textarea className="form-input" rows={3} value={requestForm.ingredients_text} onChange={(e) => setRequestForm((p) => ({ ...p, ingredients_text: e.target.value }))} />
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                        <div>
                          {nutritionStep > 0 && (
                            <button className="btn btn-sm btn-secondary" onClick={() => setNutritionStep((s) => s - 1)}>
                              {t('guardian.feed.nutr_prev', '이전')}
                            </button>
                          )}
                        </div>
                        <div>
                          {nutritionStep < 3 ? (
                            <button className="btn btn-sm btn-primary" onClick={() => setNutritionStep((s) => s + 1)}>
                              {t('guardian.feed.nutr_next', '다음')}
                            </button>
                          ) : (
                            <button className="btn btn-sm btn-primary" onClick={() => { setShowNutritionFields(false); setNutritionStep(0); }}>
                              {t('guardian.feed.nutr_done', '완료')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div className="form-group" style={{ marginTop: 8 }}>
                <label className="form-label">{t('guardian.feed.request_url', 'Reference URL')}</label>
                <input className="form-input" value={requestForm.reference_url} placeholder="https://..." onChange={(e) => setRequestForm((p) => ({ ...p, reference_url: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('guardian.feed.request_memo', 'Memo')}</label>
                <textarea className="form-input" rows={2} value={requestForm.memo} onChange={(e) => setRequestForm((p) => ({ ...p, memo: e.target.value }))} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <button className="btn btn-primary btn-sm" disabled={requestSaving} onClick={() => void handleSubmitRequest()}>
                  {t('common.save', 'Save')}
                </button>
              </div>
            </div>
          )}

          {/* ── My Requests ──────────────────────────────────────── */}
          {!showForm && !showRequestForm && currentRequests.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <button className="btn btn-sm" style={{ fontSize: 12, marginBottom: 8 }} onClick={() => setShowMyRequests(!showMyRequests)}>
                {showMyRequests ? '▼' : '▶'} {t('guardian.feed.my_requests', 'My Requests')} ({currentRequests.length})
              </button>
              {showMyRequests && currentRequests.map((r) => (
                <div key={r.id} style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px', marginBottom: 6, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>{r.feed_name}</span>
                    <span style={{
                      fontSize: 11, padding: '1px 8px', borderRadius: 4, fontWeight: 600,
                      background: r.status === 'approved' ? '#e8f5e9' : r.status === 'rejected' ? '#ffebee' : '#fff8e1',
                      color: r.status === 'approved' ? '#2e7d32' : r.status === 'rejected' ? '#c62828' : '#f57f17',
                    }}>
                      {r.status === 'approved' ? t('guardian.feed.request_status_approved', 'Approved')
                        : r.status === 'rejected' ? t('guardian.feed.request_status_rejected', 'Rejected')
                        : t('guardian.feed.request_status_pending', 'Pending')}
                    </span>
                  </div>
                  {(r.manufacturer_name || r.brand_name) && (
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {[r.manufacturer_name, r.brand_name].filter(Boolean).join(' > ')}
                    </div>
                  )}
                  {r.review_note && (
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, fontStyle: 'italic' }}>
                      {t('guardian.feed.request_review_note', 'Admin Note')}: {r.review_note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="modal-footer">
          {!showForm && items.length > 0 && (
            <button className="btn btn-primary" onClick={openAddForm}>
              + {tabLabels.addBtn}
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>{t('common.close', 'Close')}</button>
        </div>
      </div>
    </div>
  );
}
