// 사료 관리 모달 — 등록된 사료 목록, 추가, 수정, 삭제
import { useEffect, useMemo, useState } from 'react';
import { api, type FeedBrand, type FeedManufacturer, type FeedModel, type FeedNutrition, type FeedType, type Pet, type PetFeed } from '../../lib/api';
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

  const petId = selectedPet?.id;

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

  // Feed type options: only types with model_count > 0
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

          {!loading && feeds.length === 0 && !showForm && (
            <p className="text-sm text-muted" style={{ textAlign: 'center', padding: '24px 0' }}>
              {t('guardian.feed.no_feeds', '등록된 사료가 없습니다')}
            </p>
          )}

          {!showForm && feeds.map((f) => (
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
                  <button className="btn btn-sm" style={{ fontSize: 12 }} onClick={() => openEditForm(f)}>
                    {t('guardian.feed.edit', '수정')}
                  </button>
                  <button className="btn btn-sm btn-danger" style={{ fontSize: 12 }} onClick={() => void handleDelete(f.id)}>
                    {t('common.delete', 'Delete')}
                  </button>
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
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{t('admin.feed.nutrition', 'Nutrition')}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px 12px', fontSize: 12, color: 'var(--text-secondary)' }}>
                    {nutrition.calories_per_100g != null && <span>{t('admin.feed.calories', 'Calories')}: {nutrition.calories_per_100g} kcal</span>}
                    {nutrition.protein_pct != null && <span>{t('admin.feed.protein', 'Protein')}: {nutrition.protein_pct}%</span>}
                    {nutrition.fat_pct != null && <span>{t('admin.feed.fat', 'Fat')}: {nutrition.fat_pct}%</span>}
                    {nutrition.fiber_pct != null && <span>{t('admin.feed.fiber', 'Fiber')}: {nutrition.fiber_pct}%</span>}
                    {nutrition.moisture_pct != null && <span>{t('admin.feed.moisture', 'Moisture')}: {nutrition.moisture_pct}%</span>}
                    {nutrition.carbohydrate_pct != null && <span>{t('admin.feed.carbohydrate', 'Carbs')}: {nutrition.carbohydrate_pct}%</span>}
                  </div>
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
