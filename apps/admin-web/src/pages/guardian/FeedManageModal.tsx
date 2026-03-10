// 사료 관리 모달 — 등록된 사료 목록, 추가, 수정, 삭제 + 등록 요청
import { useEffect, useMemo, useState } from 'react';
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
}

const EMPTY_FORM = {
  feed_type_item_id: '',
  manufacturer_id: '',
  brand_id: '',
  model_id: '',
  nickname: '',
  is_primary: false,
};

export default function FeedManageModal({
  open, selectedPet,
  lang, t, setError, onClose, onChanged,
}: Props) {
  const [feeds, setFeeds] = useState<PetFeed[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // cascade state
  const [feedTypes, setFeedTypes] = useState<FeedType[]>([]);
  const [manufacturers, setManufacturers] = useState<FeedManufacturer[]>([]);
  const [brands, setBrands] = useState<FeedBrand[]>([]);
  const [models, setModels] = useState<FeedModel[]>([]);
  const [nutrition, setNutrition] = useState<FeedNutrition | null>(null);

  // Registration request state
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({
    feed_name: '', manufacturer_name: '', manufacturer_id: '', brand_name: '', brand_id: '',
    feed_type_item_id: '', feed_type_custom: false, manufacturer_custom: false, brand_custom: false,
    calories_per_100g: '', protein_pct: '', fat_pct: '', fiber_pct: '', moisture_pct: '',
    ash_pct: '', calcium_pct: '', phosphorus_pct: '', omega3_pct: '', omega6_pct: '',
    carbohydrate_pct: '', serving_size_g: '', ingredients_text: '',
    reference_url: '', memo: '',
  });
  const [requestSaving, setRequestSaving] = useState(false);
  const [myRequests, setMyRequests] = useState<FeedRegistrationRequest[]>([]);
  const [showMyRequests, setShowMyRequests] = useState(false);
  const [showNutritionFields, setShowNutritionFields] = useState(false);
  // All manufacturers/brands for request form dropdowns
  const [allManufacturers, setAllManufacturers] = useState<FeedManufacturer[]>([]);
  const [allBrands, setAllBrands] = useState<FeedBrand[]>([]);

  const petId = selectedPet?.id;

  async function loadMyRequests() {
    try {
      const rows = await api.feedRequests.list();
      setMyRequests(rows);
    } catch { /* ignore */ }
  }

  const EMPTY_REQUEST_FORM = {
    feed_name: '', manufacturer_name: '', manufacturer_id: '', brand_name: '', brand_id: '',
    feed_type_item_id: '', feed_type_custom: false, manufacturer_custom: false, brand_custom: false,
    calories_per_100g: '', protein_pct: '', fat_pct: '', fiber_pct: '', moisture_pct: '',
    ash_pct: '', calcium_pct: '', phosphorus_pct: '', omega3_pct: '', omega6_pct: '',
    carbohydrate_pct: '', serving_size_g: '', ingredients_text: '',
    reference_url: '', memo: '',
  };

  async function loadRequestDropdowns() {
    try {
      const mfrs = await api.feedCatalog.public.manufacturers();
      setAllManufacturers(mfrs);
    } catch { setAllManufacturers([]); }
    try {
      const brs = await api.feedCatalog.public.brands();
      setAllBrands(brs);
    } catch { setAllBrands([]); }
  }

  const numOrUndef = (v: string) => v ? Number(v) : undefined;

  async function handleSubmitRequest() {
    const feedName = requestForm.feed_name.trim();
    if (!feedName) { setError(t('guardian.feed.request_name', 'Feed Name') + ' required'); return; }
    // Resolve manufacturer name: if dropdown selected, use its label
    let mfrName = requestForm.manufacturer_name || undefined;
    if (requestForm.manufacturer_id && !requestForm.manufacturer_custom) {
      const m = allManufacturers.find((x) => x.id === requestForm.manufacturer_id);
      if (m) mfrName = m.name_ko || m.name_en || m.key;
    }
    let brandName = requestForm.brand_name || undefined;
    if (requestForm.brand_id && !requestForm.brand_custom) {
      const b = allBrands.find((x) => x.id === requestForm.brand_id);
      if (b) brandName = b.name_ko || b.name_en || b.id;
    }
    setRequestSaving(true);
    try {
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
      setShowRequestForm(false);
      setRequestForm(EMPTY_REQUEST_FORM);
      setShowNutritionFields(false);
      alert(t('guardian.feed.request_submitted', 'Registration request submitted.'));
      void loadMyRequests();
    } catch (e) {
      setError(uiErrorMessage(e, t('common.err.save', 'Failed to save.')));
    } finally {
      setRequestSaving(false);
    }
  }

  async function loadFeeds() {
    if (!petId) return;
    setLoading(true);
    try {
      const res = await api.pets.petFeeds.list(petId);
      setFeeds(res.feeds);
      onChanged(res.feeds);
    } catch (e) {
      setError(uiErrorMessage(e, t('common.err.network', 'Failed to load data.')));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open && petId) void loadFeeds();
    if (open) void loadMyRequests();
  }, [open, petId]);

  // Load feed types
  useEffect(() => {
    if (!open) return;
    const run = async () => {
      try {
        const types = await api.feedCatalog.public.types(lang);
        setFeedTypes(types);
      } catch { setFeedTypes([]); }
    };
    void run();
  }, [open, lang]);

  // Load manufacturers when feed type changes
  useEffect(() => {
    if (!open || !showForm) return;
    if (!form.feed_type_item_id) { setManufacturers([]); return; }
    const run = async () => {
      try {
        const rows = await api.feedCatalog.public.manufacturers(form.feed_type_item_id || undefined);
        setManufacturers(rows);
      } catch { setManufacturers([]); }
    };
    void run();
  }, [open, showForm, form.feed_type_item_id]);

  // Load brands when manufacturer changes
  useEffect(() => {
    if (!open || !showForm || !form.manufacturer_id) { setBrands([]); return; }
    const run = async () => {
      try {
        const rows = await api.feedCatalog.public.brands(form.manufacturer_id, form.feed_type_item_id || undefined);
        setBrands(rows);
      } catch { setBrands([]); }
    };
    void run();
  }, [open, showForm, form.manufacturer_id]);

  // Load models when filter changes
  useEffect(() => {
    if (!open || !showForm) return;
    if (!form.feed_type_item_id && !form.manufacturer_id && !form.brand_id) { setModels([]); return; }
    const run = async () => {
      try {
        const rows = await api.feedCatalog.public.models({
          feed_type_id: form.feed_type_item_id || undefined,
          manufacturer_id: form.manufacturer_id || undefined,
          brand_id: form.brand_id || undefined,
        });
        setModels(rows);
      } catch { setModels([]); }
    };
    void run();
  }, [open, showForm, form.feed_type_item_id, form.manufacturer_id, form.brand_id]);

  // Load nutrition when model changes
  useEffect(() => {
    if (!form.model_id) { setNutrition(null); return; }
    const run = async () => {
      try {
        const data = await api.feedCatalog.public.nutrition(form.model_id);
        setNutrition(data);
      } catch { setNutrition(null); }
    };
    void run();
  }, [form.model_id]);

  // Feed type options: only types with model_count > 0 (for catalog select)
  const feedTypeOptions = useMemo(
    () => feedTypes
      .filter((ft) => (ft.model_count ?? 0) > 0)
      .map((ft) => ({
        id: ft.id,
        key: ft.key,
        label: `${(ft.display_label || ft.key).trim()} (${ft.model_count})`,
      })),
    [feedTypes],
  );

  // All feed types for registration request (including zero-model types)
  const allFeedTypeOptions = useMemo(
    () => feedTypes.map((ft) => ({
      id: ft.id,
      key: ft.key,
      label: (ft.display_label || ft.key).trim(),
    })),
    [feedTypes],
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
    () => manufacturers.filter((r) => r.status === 'active').map((r) => ({
      id: r.id, key: r.key,
      label: (r.display_label || '').trim() || (lang === 'ko' ? (r.name_ko || r.name_en || r.key) : (r.name_en || r.name_ko || r.key)),
    })),
    [manufacturers, lang],
  );

  const brandOptions = useMemo(
    () => brands.filter((r) => r.status === 'active').map((r) => ({
      id: r.id, key: r.name_en || r.name_ko || r.id,
      label: lang === 'ko' ? (r.name_ko || r.name_en || r.id) : (r.name_en || r.name_ko || r.id),
    })),
    [brands, lang],
  );

  const modelOptions = useMemo(
    () => models.filter((r) => r.status === 'active').map((r) => ({
      id: r.id, key: r.model_code || r.model_name || r.id,
      label: r.model_display_label || r.model_name || r.model_code || r.id,
    })),
    [models],
  );

  function renderSelect(label: string, value: string, options: Array<{ id: string; key: string; label: string }>, onChange: (v: string) => void, required = false, name?: string) {
    return (
      <div className="form-group">
        <label className="form-label" htmlFor={name}>{label}{required ? ' *' : ''}</label>
        <select id={name} name={name} className="form-select" value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">{t('common.select', 'Select')}</option>
          {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
      </div>
    );
  }

  function openAddForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEditForm(f: PetFeed) {
    setEditingId(f.id);
    setForm({
      feed_type_item_id: '',
      manufacturer_id: '',
      brand_id: '',
      model_id: f.feed_model_id,
      nickname: f.nickname || '',
      is_primary: !!f.is_primary,
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!petId) return;
    if (!editingId && !form.model_id) { setError(t('guardian.feed.model_required', 'Please select a feed product.')); return; }
    try {
      if (editingId) {
        await api.pets.petFeeds.update(petId, editingId, {
          nickname: form.nickname,
          is_primary: form.is_primary,
        });
      } else {
        await api.pets.petFeeds.create(petId, {
          feed_model_id: form.model_id,
          nickname: form.nickname || undefined,
          is_primary: form.is_primary,
        });
      }
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      setNutrition(null);
      await loadFeeds();
    } catch (e) {
      setError(uiErrorMessage(e, t('common.err.save', 'Failed to save.')));
    }
  }

  async function handleDelete(id: string) {
    if (!petId) return;
    if (!confirm(t('guardian.feed.delete_confirm', 'Delete this feed?'))) return;
    try {
      await api.pets.petFeeds.remove(petId, id);
      await loadFeeds();
    } catch (e) {
      setError(uiErrorMessage(e, t('common.err.save', 'Failed to delete.')));
    }
  }

  async function handleSetPrimary(id: string) {
    if (!petId) return;
    try {
      await api.pets.petFeeds.update(petId, id, { is_primary: true });
      await loadFeeds();
    } catch (e) {
      setError(uiErrorMessage(e, t('common.err.save', 'Failed to set primary.')));
    }
  }

  function feedLabel(f: PetFeed): string {
    return f.model_display_label || f.model_name || f.model_code || f.feed_model_id;
  }

  function feedSubLabel(f: PetFeed): string {
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

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <h3 className="modal-title">{t('guardian.feed.manage_title', '사료 관리')}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {loading && <p className="text-sm text-muted">{t('common.loading', 'Loading...')}</p>}

          {!loading && feeds.length === 0 && !showForm && !showRequestForm && (
            <p className="text-sm text-muted" style={{ textAlign: 'center', padding: '24px 0' }}>
              {t('guardian.feed.no_feeds', '등록된 사료가 없습니다')}
            </p>
          )}

          {!showForm && !showRequestForm && feeds.map((f) => (
            <div key={f.id} style={{
              border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', marginBottom: 8,
              background: f.is_primary ? 'var(--primary-light, #fffbeb)' : 'var(--surface)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>
                    {feedLabel(f)}
                    {f.nickname && <span style={{ fontWeight: 400, color: 'var(--text-secondary)', marginLeft: 8 }}>({f.nickname})</span>}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{feedSubLabel(f)}</div>
                  {f.calories_per_100g != null && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {f.calories_per_100g} kcal/100g
                      {f.protein_pct != null && ` · P${f.protein_pct}%`}
                      {f.fat_pct != null && ` · F${f.fat_pct}%`}
                    </div>
                  )}
                  {!!f.is_primary && (
                    <span style={{ display: 'inline-block', marginTop: 4, fontSize: 11, background: 'var(--primary)', color: '#fff', borderRadius: 4, padding: '1px 6px' }}>
                      {t('guardian.feed.is_primary', '기본 사료')}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  {!f.is_primary && (
                    <button className="btn btn-sm" style={{ fontSize: 12 }} onClick={() => void handleSetPrimary(f.id)}>
                      {t('guardian.feed.set_primary', '기본 설정')}
                    </button>
                  )}
                  <button className="btn btn-sm" style={{ fontSize: 12 }} title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')} onClick={() => openEditForm(f)}>✏️</button>
                  <button className="btn btn-sm btn-danger" style={{ fontSize: 12 }} title={t('common.delete', 'Delete')} aria-label={t('common.delete', 'Delete')} onClick={() => void handleDelete(f.id)}>🗑️</button>
                </div>
              </div>
            </div>
          ))}

          {showForm && (
            <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 14, background: 'var(--surface)' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 15 }}>
                {editingId ? t('guardian.feed.edit', '사료 수정') : t('guardian.feed.add', '사료 추가')}
              </h4>
              {!editingId && (
                <>
                  {renderSelect(t('admin.feed.type', '사료 유형'), form.feed_type_item_id, feedTypeOptions, (v) => setForm((p) => ({
                    ...p, feed_type_item_id: v, manufacturer_id: '', brand_id: '', model_id: '',
                  })), true, 'feed-type')}
                  {renderSelect(t('admin.feed.manufacturer', '제조사'), form.manufacturer_id, mfrOptions, (v) => setForm((p) => ({
                    ...p, manufacturer_id: v, brand_id: '', model_id: '',
                  })), false, 'feed-manufacturer')}
                  {renderSelect(t('admin.feed.brand', '브랜드'), form.brand_id, brandOptions, (v) => setForm((p) => ({
                    ...p, brand_id: v, model_id: '',
                  })), false, 'feed-brand')}
                  {renderSelect(t('admin.feed.models', '제품'), form.model_id, modelOptions, (v) => setForm((p) => ({ ...p, model_id: v })), true, 'feed-model')}
                </>
              )}
              <div className="form-group">
                <label className="form-label" htmlFor="feed-nickname">{t('guardian.feed.nickname', '별명')}</label>
                <input
                  id="feed-nickname"
                  name="feed-nickname"
                  className="form-input"
                  value={form.nickname}
                  placeholder={t('guardian.feed.nickname_placeholder', '예: 방울이 처방식')}
                  onChange={(e) => setForm((p) => ({ ...p, nickname: e.target.value }))}
                />
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
                    {nutrition.ash_pct != null && <span>{t('nutrition.ash', '조회분')}: {nutrition.ash_pct}%</span>}
                    {nutrition.calcium_pct != null && <span>{t('nutrition.calcium', '칼슘')}: {nutrition.calcium_pct}%</span>}
                    {nutrition.phosphorus_pct != null && <span>{t('nutrition.phosphorus', '인')}: {nutrition.phosphorus_pct}%</span>}
                    {nutrition.omega3_pct != null && <span>{t('nutrition.omega3', '오메가3')}: {nutrition.omega3_pct}%</span>}
                    {nutrition.omega6_pct != null && <span>{t('nutrition.omega6', '오메가6')}: {nutrition.omega6_pct}%</span>}
                    {nutrition.serving_size_g != null && <span>{t('nutrition.serving_size', '1회급여량')}: {nutrition.serving_size_g}g</span>}
                  </div>
                  {nutrition.ingredients_text && (
                    <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                      <span style={{ fontWeight: 600 }}>{t('nutrition.ingredients', '성분')}: </span>{nutrition.ingredients_text}
                    </div>
                  )}
                </div>
              )}
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, marginTop: 8, cursor: 'pointer' }}>
                <input
                  name="feed-is-primary"
                  type="checkbox"
                  checked={form.is_primary}
                  onChange={(e) => setForm((p) => ({ ...p, is_primary: e.target.checked }))}
                />
                {t('guardian.feed.set_primary', '기본 사료로 설정')}
              </label>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => { setShowForm(false); setEditingId(null); }}>
                  {t('common.cancel', 'Cancel')}
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => void handleSave()}>
                  {t('common.save', 'Save')}
                </button>
              </div>
            </div>
          )}
          {/* ── Feed Registration Request ────────────────────────── */}
          {!showForm && !showRequestForm && (
            <div style={{ margin: '16px 0 8px', border: '2px dashed var(--border)', borderRadius: 8, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{t('guardian.feed.request_btn', 'Request Feed Registration')}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{t('guardian.feed.request_desc', "Can't find your feed? Request registration.")}</div>
                </div>
                <button className="btn btn-sm btn-primary" onClick={() => { setShowRequestForm(true); void loadRequestDropdowns(); }}>+</button>
              </div>
            </div>
          )}
          {!showForm && showRequestForm && (
            <div style={{ border: '2px solid var(--primary)', borderRadius: 8, padding: 14, background: 'var(--surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h4 style={{ margin: 0, fontSize: 15 }}>{t('guardian.feed.request_btn', 'Request Feed Registration')}</h4>
                <button className="btn btn-sm btn-secondary" onClick={() => { setShowRequestForm(false); setRequestForm(EMPTY_REQUEST_FORM); setShowNutritionFields(false); }}>
                  {t('common.cancel', 'Cancel')}
                </button>
              </div>
              <div className="form-group">
                <label className="form-label">{t('guardian.feed.request_name', 'Feed Name')} *</label>
                <input className="form-input" value={requestForm.feed_name} onChange={(e) => setRequestForm((p) => ({ ...p, feed_name: e.target.value }))} />
              </div>
              {/* Feed Type: dropdown or custom */}
              <div className="form-group">
                <label className="form-label">{t('guardian.feed.request_type', 'Feed Type')}</label>
                <select className="form-select" value={requestForm.feed_type_item_id} onChange={(e) => setRequestForm((p) => ({ ...p, feed_type_item_id: e.target.value }))}>
                  <option value="">{t('common.select', 'Select')}</option>
                  {allFeedTypeOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </div>
              {/* Manufacturer: dropdown + custom toggle */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>{t('guardian.feed.request_manufacturer', 'Manufacturer')}</label>
                  <button className="btn btn-sm" style={{ fontSize: 11, padding: '1px 8px' }}
                    onClick={() => setRequestForm((p) => ({ ...p, manufacturer_custom: !p.manufacturer_custom, manufacturer_id: '', manufacturer_name: '' }))}>
                    {requestForm.manufacturer_custom ? t('guardian.feed.select_existing', 'Select Existing') : t('guardian.feed.enter_custom', 'Enter Custom')}
                  </button>
                </div>
                {requestForm.manufacturer_custom ? (
                  <input className="form-input" placeholder={t('guardian.feed.request_manufacturer', 'Manufacturer')}
                    value={requestForm.manufacturer_name} onChange={(e) => setRequestForm((p) => ({ ...p, manufacturer_name: e.target.value, manufacturer_id: '' }))} />
                ) : (
                  <select className="form-select" value={requestForm.manufacturer_id}
                    onChange={(e) => {
                      const id = e.target.value;
                      const m = allMfrOptions.find((x) => x.id === id);
                      setRequestForm((p) => ({ ...p, manufacturer_id: id, manufacturer_name: m?.label || '' }));
                    }}>
                    <option value="">{t('common.select', 'Select')}</option>
                    {allMfrOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                  </select>
                )}
              </div>
              {/* Brand: dropdown + custom toggle */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>{t('guardian.feed.request_brand', 'Brand')}</label>
                  <button className="btn btn-sm" style={{ fontSize: 11, padding: '1px 8px' }}
                    onClick={() => setRequestForm((p) => ({ ...p, brand_custom: !p.brand_custom, brand_id: '', brand_name: '' }))}>
                    {requestForm.brand_custom ? t('guardian.feed.select_existing', 'Select Existing') : t('guardian.feed.enter_custom', 'Enter Custom')}
                  </button>
                </div>
                {requestForm.brand_custom ? (
                  <input className="form-input" placeholder={t('guardian.feed.request_brand', 'Brand')}
                    value={requestForm.brand_name} onChange={(e) => setRequestForm((p) => ({ ...p, brand_name: e.target.value, brand_id: '' }))} />
                ) : (
                  <select className="form-select" value={requestForm.brand_id}
                    onChange={(e) => {
                      const id = e.target.value;
                      const b = allBrandOptions.find((x) => x.id === id);
                      setRequestForm((p) => ({ ...p, brand_id: id, brand_name: b?.label || '' }));
                    }}>
                    <option value="">{t('common.select', 'Select')}</option>
                    {allBrandOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                  </select>
                )}
              </div>
              {/* Nutrition fields (13 total) */}
              <button className="btn btn-sm" style={{ fontSize: 12, marginBottom: 8 }} onClick={() => setShowNutritionFields(!showNutritionFields)}>
                {showNutritionFields ? '▼' : '▶'} {t('guardian.feed.request_nutrition', 'Nutrition Info (Optional)')}
              </button>
              {showNutritionFields && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {([
                      ['calories_per_100g', t('nutrition.calories', 'kcal/100g')],
                      ['protein_pct', t('nutrition.protein', 'Protein') + ' %'],
                      ['fat_pct', t('nutrition.fat', 'Fat') + ' %'],
                      ['fiber_pct', t('nutrition.fiber', 'Fiber') + ' %'],
                      ['moisture_pct', t('nutrition.moisture', 'Moisture') + ' %'],
                      ['ash_pct', t('nutrition.ash', 'Ash') + ' %'],
                      ['calcium_pct', t('nutrition.calcium', 'Calcium') + ' %'],
                      ['phosphorus_pct', t('nutrition.phosphorus', 'Phosphorus') + ' %'],
                      ['omega3_pct', t('nutrition.omega3', 'Omega-3') + ' %'],
                      ['omega6_pct', t('nutrition.omega6', 'Omega-6') + ' %'],
                      ['carbohydrate_pct', t('nutrition.carbohydrate', 'Carbohydrate') + ' %'],
                      ['serving_size_g', t('nutrition.serving_size', 'Serving Size') + ' (g)'],
                    ] as const).map(([key, label]) => (
                      <div key={key} className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: 11 }}>{label}</label>
                        <input className="form-input" type="number" step="0.1" value={(requestForm as unknown as Record<string, string>)[key] || ''} onChange={(e) => setRequestForm((p) => ({ ...p, [key]: e.target.value }))} />
                      </div>
                    ))}
                  </div>
                  <div className="form-group" style={{ marginTop: 6 }}>
                    <label className="form-label" style={{ fontSize: 11 }}>{t('nutrition.ingredients', 'Ingredients')}</label>
                    <textarea className="form-input" rows={2} value={requestForm.ingredients_text} onChange={(e) => setRequestForm((p) => ({ ...p, ingredients_text: e.target.value }))} />
                  </div>
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
          {!showForm && !showRequestForm && myRequests.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <button className="btn btn-sm" style={{ fontSize: 12, marginBottom: 8 }} onClick={() => setShowMyRequests(!showMyRequests)}>
                {showMyRequests ? '▼' : '▶'} {t('guardian.feed.my_requests', 'My Requests')} ({myRequests.length})
              </button>
              {showMyRequests && myRequests.map((r) => (
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
          {!showForm && (
            <button className="btn btn-primary" onClick={openAddForm}>
              + {t('guardian.feed.add', '사료 추가')}
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>{t('common.close', 'Close')}</button>
        </div>
      </div>
    </div>
  );
}
