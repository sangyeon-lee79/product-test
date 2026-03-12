// Admin Dummy Store Management — 공급자 더미 매장 관리
import { useState, useEffect, useCallback } from 'react';
import { api, type DummyStore } from '../lib/api';
import { useT, useI18n } from '../lib/i18n';
import { type Lang } from '@petfolio/shared';

type Category = '' | 'grooming' | 'hospital' | 'hotel' | 'training' | 'shop' | 'cafe' | 'photo';
type ActiveFilter = '' | 'true' | 'false';

const CATEGORIES: { key: Category; emoji: string; i18nKey: string }[] = [
  { key: '', emoji: '', i18nKey: '' },
  { key: 'grooming', emoji: '✂️', i18nKey: 'dummy.category_grooming' },
  { key: 'hospital', emoji: '🏥', i18nKey: 'dummy.category_hospital' },
  { key: 'hotel', emoji: '🏨', i18nKey: 'dummy.category_hotel' },
  { key: 'training', emoji: '🎓', i18nKey: 'dummy.category_training' },
  { key: 'shop', emoji: '🛍', i18nKey: 'dummy.category_shop' },
  { key: 'cafe', emoji: '☕', i18nKey: 'dummy.category_cafe' },
  { key: 'photo', emoji: '📷', i18nKey: 'dummy.category_photo' },
];

function getCategoryEmoji(cat: string): string {
  return CATEGORIES.find((c) => c.key === cat)?.emoji || '🏪';
}

interface ModalState {
  mode: 'create' | 'edit';
  store?: DummyStore;
}

export default function DummyStorePage() {
  const t = useT();
  const { lang } = useI18n();

  const [stores, setStores] = useState<DummyStore[]>([]);
  const [total, setTotal] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [categoryFilter, setCategoryFilter] = useState<Category>('');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('');
  const [modal, setModal] = useState<ModalState | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formCategory, setFormCategory] = useState<string>('grooming');
  const [formNameKo, setFormNameKo] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formDescKo, setFormDescKo] = useState('');
  const [formDescEn, setFormDescEn] = useState('');
  const [formState, setFormState] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formDetail, setFormDetail] = useState('');
  const [formRating, setFormRating] = useState('');
  const [formReviewCount, setFormReviewCount] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string> = {};
      if (categoryFilter) params.category = categoryFilter;
      if (activeFilter) params.is_active = activeFilter;
      const res = await api.dummyStores.list(params);
      setStores(res.items);
      setTotal(res.total);
      setActiveCount(res.active_count);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, activeFilter]);

  useEffect(() => { void load(); }, [load]);

  function flash(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  }

  function openCreate() {
    setFormCategory('grooming');
    setFormNameKo('');
    setFormNameEn('');
    setFormDescKo('');
    setFormDescEn('');
    setFormState('');
    setFormCity('');
    setFormDetail('');
    setFormRating('');
    setFormReviewCount('0');
    setModal({ mode: 'create' });
  }

  function openEdit(store: DummyStore) {
    setFormCategory(store.category);
    setFormNameKo(store.name?.ko || '');
    setFormNameEn(store.name?.en || '');
    setFormDescKo(store.description?.ko || '');
    setFormDescEn(store.description?.en || '');
    const addr = store.address;
    setFormState(addr?.state_code || '');
    setFormCity(addr?.city_code || '');
    setFormDetail(addr?.detail || '');
    setFormRating(store.rating != null ? String(store.rating) : '');
    setFormReviewCount(String(store.review_count || 0));
    setModal({ mode: 'edit', store });
  }

  async function handleSave() {
    if (!modal || saving) return;
    if (!formNameKo.trim()) {
      setError(t('common.err.required', 'Required field is empty'));
      return;
    }
    setSaving(true);
    setError('');
    try {
      const data: Partial<DummyStore> = {
        category: formCategory,
        name: { ko: formNameKo.trim(), en: formNameEn.trim() || formNameKo.trim() },
        description: formDescKo.trim() ? { ko: formDescKo.trim(), en: formDescEn.trim() || formDescKo.trim() } : null,
        address: formState.trim() ? { state_code: formState.trim(), city_code: formCity.trim(), detail: formDetail.trim() } : null,
        rating: formRating ? parseFloat(formRating) : null,
        review_count: parseInt(formReviewCount, 10) || 0,
      };

      if (modal.mode === 'create') {
        await api.dummyStores.create(data);
      } else if (modal.store) {
        await api.dummyStores.update(modal.store.id, data);
      }

      setModal(null);
      flash(t('admin.master.msg_success', 'Saved successfully'));
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(store: DummyStore) {
    try {
      const res = await api.dummyStores.toggle(store.id);
      setStores((prev) =>
        prev.map((s) => (s.id === store.id ? { ...s, is_active: res.is_active } : s)),
      );
      // Update counts
      setActiveCount((prev) => prev + (res.is_active ? 1 : -1));
      flash(t('dummy.store_toggle', 'Toggle Status'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Toggle failed');
    }
  }

  async function handleDelete(store: DummyStore) {
    if (!confirm(t('common.confirm_delete', 'Are you sure you want to delete?'))) return;
    try {
      await api.dummyStores.remove(store.id);
      setStores((prev) => prev.filter((s) => s.id !== store.id));
      setTotal((prev) => prev - 1);
      if (store.is_active) setActiveCount((prev) => prev - 1);
      flash(t('common.deleted', 'Deleted'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  }

  function storeName(store: DummyStore): string {
    return store.name?.[lang as Lang] || store.name?.ko || store.name?.en || '—';
  }

  function storeDesc(store: DummyStore): string {
    return store.description?.[lang as Lang] || store.description?.ko || store.description?.en || '';
  }

  function storeAddress(store: DummyStore): string {
    const a = store.address;
    if (!a) return '';
    return [a.state_code, a.city_code, a.detail].filter(Boolean).join(' ');
  }

  const inactiveCount = total - activeCount;

  return (
    <div className="content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>{t('dummy.store_manage', 'Dummy Store Management')}</h2>
        <button className="btn btn-primary" onClick={openCreate}>
          + {t('dummy.store_add', 'Add Dummy')}
        </button>
      </div>

      {/* Alerts */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Stats */}
      <div className="ds-stats">
        <span><strong>{t('dummy.total_count', 'Total')}</strong> {total}</span>
        <span className="ds-stats-sep" />
        <span><strong>{t('dummy.active_count', 'Active')}</strong> {activeCount}</span>
        <span className="ds-stats-sep" />
        <span><strong>{t('dummy.store_inactive', 'Inactive')}</strong> {inactiveCount}</span>
      </div>

      {/* Category filter */}
      <div className="ds-filter-bar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            className={`ds-filter-btn${categoryFilter === cat.key ? ' active' : ''}`}
            onClick={() => setCategoryFilter(cat.key)}
          >
            {cat.key ? `${cat.emoji} ${t(cat.i18nKey, cat.key)}` : t('dummy.total_count', 'Total')}
          </button>
        ))}
      </div>

      {/* Active filter */}
      <div className="ds-filter-bar" style={{ marginTop: 8 }}>
        {(['', 'true', 'false'] as ActiveFilter[]).map((val) => (
          <button
            key={val}
            className={`ds-filter-btn${activeFilter === val ? ' active' : ''}`}
            onClick={() => setActiveFilter(val)}
          >
            {val === '' ? t('dummy.total_count', 'Total') : val === 'true' ? t('dummy.store_active', 'Active') : t('dummy.store_inactive', 'Inactive')}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Loading...</div>}

      {/* Card grid */}
      {!loading && (
        <div className="ds-grid">
          {stores.map((store) => (
            <div key={store.id} className={`ds-card${!store.is_active ? ' ds-card--inactive' : ''}`}>
              <div className="ds-card-header">
                <span className="ds-card-category">
                  {getCategoryEmoji(store.category)}{' '}
                  {t(`dummy.category_${store.category}`, store.category)}
                </span>
                <span className={`badge ${store.is_active ? 'badge-green' : 'badge-gray'}`}>
                  {store.is_active ? t('dummy.store_active', 'Active') : t('dummy.store_inactive', 'Inactive')}
                </span>
              </div>
              <div className="ds-card-name">{storeName(store)}</div>
              {storeDesc(store) && <div className="ds-card-desc">{storeDesc(store)}</div>}
              {storeAddress(store) && (
                <div className="ds-card-address">{storeAddress(store)}</div>
              )}
              <div className="ds-card-meta">
                {store.rating != null && <span>&#11088; {store.rating}</span>}
                {store.review_count > 0 && <span>&#128172; {store.review_count}</span>}
                {store.services && store.services.length > 0 && (
                  <span>{t('admin.master.services', 'Services')} {store.services.length}</span>
                )}
              </div>
              <div className="ds-card-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(store)}>
                  {t('common.edit', 'Edit')}
                </button>
                <button
                  className={`btn btn-sm ${store.is_active ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={() => handleToggle(store)}
                >
                  {store.is_active ? t('dummy.store_inactive', 'Inactive') : t('dummy.store_active', 'Active')}
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(store)}>
                  {t('common.delete', 'Delete')}
                </button>
              </div>
            </div>
          ))}
          {!loading && stores.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              {t('common.no_data', 'No data')}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {modal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                {modal.mode === 'create' ? t('dummy.store_add', 'Add Dummy') : t('dummy.store_edit', 'Edit Dummy')}
              </div>
              <button className="modal-close" onClick={() => setModal(null)}>&times;</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Category */}
              <div className="form-group">
                <label className="form-label">{t('dummy.category_grooming', 'Category')} *</label>
                <select
                  className="form-input"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  disabled={modal.mode === 'edit'}
                >
                  {CATEGORIES.filter((c) => c.key).map((c) => (
                    <option key={c.key} value={c.key}>{c.emoji} {t(c.i18nKey, c.key)}</option>
                  ))}
                </select>
              </div>

              {/* Name (ko/en) */}
              <div className="form-group">
                <label className="form-label">{t('guardian.form.name', 'Name')} (KO) *</label>
                <input className="form-input" value={formNameKo} onChange={(e) => setFormNameKo(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('guardian.form.name', 'Name')} (EN)</label>
                <input className="form-input" value={formNameEn} onChange={(e) => setFormNameEn(e.target.value)} />
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">{t('common.description', 'Description')} (KO)</label>
                <input className="form-input" value={formDescKo} onChange={(e) => setFormDescKo(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('common.description', 'Description')} (EN)</label>
                <input className="form-input" value={formDescEn} onChange={(e) => setFormDescEn(e.target.value)} />
              </div>

              {/* Address */}
              <div style={{ display: 'flex', gap: 8 }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">{t('admin.countries.state', 'State')}</label>
                  <input className="form-input" value={formState} onChange={(e) => setFormState(e.target.value)} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">{t('admin.countries.city', 'City')}</label>
                  <input className="form-input" value={formCity} onChange={(e) => setFormCity(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin.countries.detail', 'Detail')}</label>
                <input className="form-input" value={formDetail} onChange={(e) => setFormDetail(e.target.value)} />
              </div>

              {/* Rating / Review count */}
              <div style={{ display: 'flex', gap: 8 }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">&#11088; {t('common.rating', 'Rating')}</label>
                  <input className="form-input" type="number" step="0.1" min="0" max="5" value={formRating} onChange={(e) => setFormRating(e.target.value)} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">&#128172; {t('common.reviews', 'Reviews')}</label>
                  <input className="form-input" type="number" min="0" value={formReviewCount} onChange={(e) => setFormReviewCount(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>
                {t('common.cancel', 'Cancel')}
              </button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? '...' : t('common.save', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
