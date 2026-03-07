import { useEffect, useState, useCallback } from 'react';
import { api, type MasterCategory, type MasterItem } from '../lib/api';
import { useT, SUPPORTED_LANGS, LANG_LABELS } from '../lib/i18n';

const emptyTrans = () => Object.fromEntries(SUPPORTED_LANGS.map(l => [l, ''])) as Record<string, string>;

export default function MasterPage() {
  const t = useT();
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [items, setItems] = useState<MasterItem[]>([]);
  const [selectedCat, setSelectedCat] = useState<MasterCategory | null>(null);
  const [parentItems, setParentItems] = useState<MasterItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Category modal
  const [catModal, setCatModal] = useState<'create' | 'edit' | null>(null);
  const [catForm, setCatForm] = useState<{ sort_order: string }>({ sort_order: '0' });
  const [catTrans, setCatTrans] = useState<Record<string, string>>(emptyTrans());
  const [catSaving, setCatSaving] = useState(false);

  // Item modal
  type ItemForm = { id?: string; key?: string; sort_order: string; is_active?: number; parent_id?: string | null };
  const [itemModal, setItemModal] = useState<'create' | 'edit' | null>(null);
  const [itemForm, setItemForm] = useState<ItemForm>({ sort_order: '0', parent_id: null });
  const [itemTrans, setItemTrans] = useState<Record<string, string>>(emptyTrans());
  const [itemSaving, setItemSaving] = useState(false);
  const [translating, setTranslating] = useState(false);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.master.categories.list();
      setCategories(data);
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setLoading(false); }
  }, []);

  const loadItems = useCallback(async (catKey: string) => {
    try {
      const data = await api.master.items.list(catKey);
      setItems(data);
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
  }, []);

  const normalizeCategoryKey = useCallback((key: string) => key.replace(/^master\./, ''), []);

  const getParentCategoryKey = useCallback((catKey: string): string | null => {
    const normalized = normalizeCategoryKey(catKey);
    if (normalized === 'disease_type') return 'disease_group';
    if (normalized === 'disease_device_type') return 'disease_type';
    if (normalized === 'disease_measurement_type') return 'disease_type';
    if (normalized === 'disease_measurement_context') return 'disease_measurement_type';
    if (normalized === 'diet_subtype') return 'diet_type';
    if (normalized === 'allergy_type') return 'allergy_group';
    return null;
  }, [normalizeCategoryKey]);

  const findCategoryByKey = useCallback((catKey: string) => {
    const normalized = normalizeCategoryKey(catKey);
    return categories.find((cat) => normalizeCategoryKey(cat.key) === normalized) ?? null;
  }, [categories, normalizeCategoryKey]);

  const jumpToCategory = useCallback((catKey: string) => {
    const target = findCategoryByKey(catKey);
    if (!target) {
      setError(`"${catKey}" 카테고리를 찾지 못했습니다.`);
      return;
    }
    setSelectedCat(target);
  }, [findCategoryByKey]);

  useEffect(() => { void loadCategories(); }, [loadCategories]);
  useEffect(() => {
    if (selectedCat) void loadItems(selectedCat.key);
    else setItems([]);
  }, [selectedCat, loadItems]);

  useEffect(() => {
    async function loadParentItems() {
      if (!selectedCat) {
        setParentItems([]);
        return;
      }
      const parentCategoryKey = getParentCategoryKey(selectedCat.key);
      if (!parentCategoryKey) {
        setParentItems([]);
        return;
      }
      try {
        const data = await api.master.items.list(parentCategoryKey);
        setParentItems(data);
      } catch (e) {
        setParentItems([]);
        setError(e instanceof Error ? e.message : 'Error');
      }
    }
    void loadParentItems();
  }, [selectedCat, getParentCategoryKey]);

  function flash(msg: string) { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); }
  function getCategoryLabel(cat: MasterCategory) { return cat.ko_name?.trim() || cat.key; }
  function getItemLabel(item: MasterItem) { return item.ko_name?.trim() || item.ko?.trim() || item.key; }
  function parentLabel(parentId: string | null | undefined) {
    if (!parentId) return '-';
    const fromCurrent = items.find((i) => i.id === parentId);
    if (fromCurrent) return getItemLabel(fromCurrent);
    const fromParent = parentItems.find((i) => i.id === parentId);
    if (fromParent) return getItemLabel(fromParent);
    return parentId;
  }
  function categoryToTranslations(cat: MasterCategory): Record<string, string> {
    return {
      ko: cat.ko ?? cat.ko_name ?? '',
      en: cat.en ?? '',
      ja: cat.ja ?? '',
      zh_cn: cat.zh_cn ?? '',
      zh_tw: cat.zh_tw ?? '',
      es: cat.es ?? '',
      fr: cat.fr ?? '',
      de: cat.de ?? '',
      pt: cat.pt ?? '',
      vi: cat.vi ?? '',
      th: cat.th ?? '',
      id_lang: cat.id_lang ?? '',
      ar: cat.ar ?? '',
    };
  }
  function itemToTranslations(item: MasterItem): Record<string, string> {
    return {
      ko: item.ko ?? item.ko_name ?? '',
      en: item.en ?? '',
      ja: item.ja ?? '',
      zh_cn: item.zh_cn ?? '',
      zh_tw: item.zh_tw ?? '',
      es: item.es ?? '',
      fr: item.fr ?? '',
      de: item.de ?? '',
      pt: item.pt ?? '',
      vi: item.vi ?? '',
      th: item.th ?? '',
      id_lang: item.id_lang ?? '',
      ar: item.ar ?? '',
    };
  }

  // 자동번역
  async function autoTranslate(koText: string, setTrans: (t: Record<string, string>) => void, current: Record<string, string>) {
    if (!koText) return;
    setTranslating(true);
    try {
      const result = await api.i18n.translate(koText, current);
      const merged: Record<string, string> = { ...current, ko: koText };
      for (const lang of SUPPORTED_LANGS) {
        if (lang === 'ko') continue;
        if ((current[lang] || '').trim()) continue;
        const translated = result.translations[lang];
        if (translated) merged[lang] = translated;
      }
      setTrans(merged);
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setTranslating(false); }
  }

  // Category CRUD
  async function handleCatSave() {
    setCatSaving(true); setError('');
    try {
      if (catModal === 'create') {
        const ko = (catTrans.ko || '').trim();
        if (!ko) throw new Error('한국어 표시명은 필수입니다.');

        let translations: Record<string, string> = { ...catTrans, ko };
        const hasMissing = SUPPORTED_LANGS.some((lang) => lang !== 'ko' && !(translations[lang] || '').trim());
        if (hasMissing) {
          const result = await api.i18n.translate(ko, translations);
          translations = {
            ...result.translations,
            ...translations,
            ko,
          };
        }

        await api.master.categories.create({ sort_order: parseInt(catForm.sort_order), translations });
        flash(t('admin.master.success_cat_add', '카테고리가 추가되었습니다.'));
      } else if (catModal === 'edit' && selectedCat) {
        const ko = (catTrans.ko || '').trim();
        if (!ko) throw new Error('한국어 표시명은 필수입니다.');

        let translations: Record<string, string> = { ...catTrans, ko };
        const hasMissing = SUPPORTED_LANGS.some((lang) => lang !== 'ko' && !(translations[lang] || '').trim());
        if (hasMissing) {
          const result = await api.i18n.translate(ko, translations);
          translations = {
            ...result.translations,
            ...translations,
            ko,
          };
        }

        await api.master.categories.update(selectedCat.id, {
          sort_order: parseInt(catForm.sort_order),
          translations,
        });
        flash(t('admin.master.success_cat_edit', '카테고리가 수정되었습니다.'));
      }
      setCatModal(null);
      await loadCategories();
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setCatSaving(false); }
  }

  async function handleCatDelete(cat: MasterCategory) {
    if (!confirm(`"${getCategoryLabel(cat)}" ${t('admin.master.confirm_delete_cat', '카테고리를 삭제하시겠습니까? 아이템이 있으면 비활성화됩니다.')}`)) return;
    try {
      await api.master.categories.delete(cat.id);
      flash(t('admin.master.success_done', '처리되었습니다.'));
      if (selectedCat?.id === cat.id) setSelectedCat(null);
      await loadCategories();
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
  }

  // Item CRUD
  async function handleItemSave() {
    if (!selectedCat) return;
    setItemSaving(true); setError('');
    try {
      if (itemModal === 'create') {
        const ko = (itemTrans.ko || '').trim();
        if (!ko) throw new Error('한국어 표시명은 필수입니다.');

        let translations: Record<string, string> = { ...itemTrans, ko };
        const hasMissing = SUPPORTED_LANGS.some((lang) => lang !== 'ko' && !(translations[lang] || '').trim());
        if (hasMissing) {
          const result = await api.i18n.translate(ko, translations);
          translations = {
            ...result.translations,
            ...translations,
            ko,
          };
        }

        await api.master.items.create({
          category_id: selectedCat.id,
          sort_order: parseInt(itemForm.sort_order),
          translations,
          parent_id: itemForm.parent_id || undefined,
        });
        flash(t('admin.master.success_item_add', '아이템이 추가되었습니다.'));
      } else if (itemModal === 'edit' && itemForm.id) {
        const ko = (itemTrans.ko || '').trim();
        if (!ko) throw new Error('한국어 표시명은 필수입니다.');

        let translations: Record<string, string> = { ...itemTrans, ko };
        const hasMissing = SUPPORTED_LANGS.some((lang) => lang !== 'ko' && !(translations[lang] || '').trim());
        if (hasMissing) {
          const result = await api.i18n.translate(ko, translations);
          translations = {
            ...result.translations,
            ...translations,
            ko,
          };
        }

        await api.master.items.update(itemForm.id, { sort_order: parseInt(itemForm.sort_order), parent_id: itemForm.parent_id, translations });
        flash(t('admin.master.success_item_edit', '아이템이 수정되었습니다.'));
      }
      setItemModal(null);
      await loadItems(selectedCat.key);
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setItemSaving(false); }
  }

  async function handleItemDelete(item: MasterItem) {
    if (!confirm(`"${getItemLabel(item)}" ${t('admin.master.confirm_delete_item', '아이템을 삭제하시겠습니까?')}`)) return;
    try {
      const res = await api.master.items.delete(item.id);
      if (res.deleted) {
        flash(t('admin.master.success_done', '삭제되었습니다.'));
      } else {
        flash(t('admin.master.success_deactivated', '다른 데이터에서 사용 중이라 비활성화되었습니다.'));
      }
      if (selectedCat) await loadItems(selectedCat.key);
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">🗂 {t('admin.master.title', '마스터 데이터 관리')}</div>
      </div>
      <div className="content">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <div className="card-title">질병/식단/알러지 빠른 이동</div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '12px 16px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => jumpToCategory('disease_group')}>질병군</button>
            <button className="btn btn-secondary btn-sm" onClick={() => jumpToCategory('disease_type')}>질병</button>
            <button className="btn btn-secondary btn-sm" onClick={() => jumpToCategory('disease_device_type')}>질병 장치</button>
            <button className="btn btn-secondary btn-sm" onClick={() => jumpToCategory('disease_measurement_type')}>측정 항목</button>
            <button className="btn btn-secondary btn-sm" onClick={() => jumpToCategory('disease_measurement_context')}>측정 컨텍스트</button>
            <button className="btn btn-secondary btn-sm" onClick={() => jumpToCategory('diet_type')}>식단 상위</button>
            <button className="btn btn-secondary btn-sm" onClick={() => jumpToCategory('diet_subtype')}>식단 하위</button>
            <button className="btn btn-secondary btn-sm" onClick={() => jumpToCategory('allergy_group')}>알러지 그룹</button>
            <button className="btn btn-secondary btn-sm" onClick={() => jumpToCategory('allergy_type')}>알러지 타입</button>
          </div>
          <div style={{ padding: '0 16px 12px', fontSize: 12, color: 'var(--text-muted)' }}>
            질병 장치 등록은 <b>disease_device_type</b>에서 아이템 추가 시 <b>부모 아이템 = 질병(disease_type)</b>으로 지정하면 됩니다.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
          {/* 카테고리 패널 */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">{t('admin.master.categories', '카테고리')}</div>
              <button className="btn btn-primary btn-sm" onClick={() => { setCatForm({ sort_order: '0' }); setCatTrans(emptyTrans()); setCatModal('create'); }}>{t('admin.master.add_category', '+ 추가')}</button>
            </div>
            {loading ? <div className="loading-center"><span className="spinner" /></div> : (
              <div>
                {categories.map(cat => (
                  <div key={cat.id}
                    style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: selectedCat?.id === cat.id ? '#ebf8ff' : 'transparent',
                      borderBottom: '1px solid var(--border)' }}
                    onClick={() => setSelectedCat(cat)}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{getCategoryLabel(cat)}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{cat.key}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>sort: {cat.sort_order}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <span className={`badge ${cat.is_active ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: 10 }}>
                        {cat.is_active ? t('admin.common.active', '활성') : t('admin.common.inactive', '비활성')}
                      </span>
                      <button className="btn btn-secondary btn-sm" onClick={e => {
                        e.stopPropagation();
                        setCatForm({ sort_order: String(cat.sort_order) });
                        setCatTrans(categoryToTranslations(cat));
                        setSelectedCat(cat);
                        setCatModal('edit');
                      }}>✏</button>
                      <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); handleCatDelete(cat); }}>✕</button>
                    </div>
                  </div>
                ))}
                {categories.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>{t('admin.master.no_category', '카테고리 없음')}</div>}
              </div>
            )}
          </div>

          {/* 아이템 패널 */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">{selectedCat ? `${getCategoryLabel(selectedCat)} 아이템` : t('admin.master.select_hint', '카테고리를 선택하세요')}</div>
              {selectedCat && (
                <button className="btn btn-primary btn-sm" onClick={() => { setItemForm({ sort_order: '0', parent_id: null }); setItemTrans(emptyTrans()); setItemModal('create'); }}>{t('admin.master.add_item', '+ 아이템 추가')}</button>
              )}
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{t('admin.master.item_name', '아이템명')}</th>
                    <th>{t('admin.master.parent', '부모')}</th>
                    <th>Sort</th>
                    <th>{t('admin.common.status', '상태')}</th>
                    <th>{t('admin.common.action', '작업')}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{getItemLabel(item)}</div>
                        <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.key}</div>
                      </td>
                      <td><span style={{ fontSize: 11, color: '#666' }}>{parentLabel(item.parent_id)}</span></td>
                      <td>{item.sort_order}</td>
                      <td><span className={`badge ${item.is_active ? 'badge-green' : 'badge-gray'}`}>{item.is_active ? t('admin.common.active', '활성') : t('admin.common.inactive', '비활성')}</span></td>
                      <td>
                        <div className="td-actions">
                          <button className="btn btn-secondary btn-sm" onClick={() => { setItemForm({ id: item.id, key: item.key, sort_order: String(item.sort_order), is_active: item.is_active, parent_id: item.parent_id }); setItemModal('edit'); setItemTrans(itemToTranslations(item)); }}>{t('admin.common.edit', '편집')}</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleItemDelete(item)}>{t('admin.common.delete', '삭제')}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && selectedCat && (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>{t('admin.master.no_item', '아이템이 없습니다')}</td></tr>
                  )}
                  {!selectedCat && (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>← {t('admin.master.select_hint', '카테고리를 선택하세요')}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {catModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setCatModal(null)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <div className="modal-title">{catModal === 'create' ? t('admin.master.modal_create_cat', '카테고리 추가') : t('admin.master.modal_edit_cat', '카테고리 수정')}</div>
              <button className="modal-close" onClick={() => setCatModal(null)}>×</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {error && <div className="alert alert-error">{error}</div>}
              {catModal === 'edit' && selectedCat && (
                <div className="form-group">
                  <label className="form-label">{t('admin.common.key', '키')}</label>
                  <input className="form-input font-mono" value={selectedCat.key} readOnly />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">{t('admin.common.sort_order', '정렬 순서')}</label>
                <input className="form-input" type="number" value={catForm.sort_order} onChange={e => setCatForm(f => ({ ...f, sort_order: e.target.value }))} />
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{t('admin.master.translations', '표시명 (13개국어)')}</div>
                  <button className="btn btn-secondary btn-sm" onClick={() => autoTranslate(catTrans.ko, setCatTrans, catTrans)} disabled={translating || !catTrans.ko}>
                    {translating ? '...' : t('admin.master.auto_translate', '🌐 한국어 기준 자동번역')}
                  </button>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
                  키는 시스템 내부 식별자이며 직접 수정할 수 없습니다.
                </div>
                {SUPPORTED_LANGS.map(lang => (
                  <div key={lang} className="form-group" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label style={{ fontSize: 12, width: 110, flexShrink: 0, color: lang === 'ko' ? 'var(--text)' : 'var(--text-muted)' }}>
                      {LANG_LABELS[lang]}{lang === 'ko' ? ' *' : ''}
                    </label>
                    <input
                      className="form-input"
                      style={{ fontSize: 13 }}
                      value={catTrans[lang] ?? ''}
                      onChange={e => setCatTrans(f => ({ ...f, [lang]: e.target.value }))}
                      placeholder={lang === 'ko' ? '한국어 표시명 입력 후 자동번역' : ''}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setCatModal(null)}>{t('admin.common.cancel', '취소')}</button>
              <button className="btn btn-primary" onClick={handleCatSave} disabled={catSaving}>{t('admin.common.save', '저장')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {itemModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setItemModal(null)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <div className="modal-title">{itemModal === 'create' ? `${selectedCat ? getCategoryLabel(selectedCat) : ''} — ${t('admin.master.modal_create_item', '아이템 추가')}` : t('admin.master.modal_edit_item', '아이템 수정')}</div>
              <button className="modal-close" onClick={() => setItemModal(null)}>×</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {error && <div className="alert alert-error">{error}</div>}
              <div className="form-group">
                <label className="form-label">{t('admin.master.categories', '카테고리')}</label>
                <input className="form-input" value={selectedCat ? getCategoryLabel(selectedCat) : ''} readOnly />
              </div>
              {itemModal === 'edit' && itemForm.key && (
                <div className="form-group">
                  <label className="form-label">{t('admin.common.key', '키')}</label>
                  <input className="form-input font-mono" value={itemForm.key} readOnly />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">{t('admin.master.parent_item', '부모 아이템')}</label>
                <select className="form-input" value={itemForm.parent_id || ''} onChange={e => setItemForm(f => ({ ...f, parent_id: e.target.value || null }))}>
                  <option value="">-- {t('admin.common.none', '없음')} --</option>
                  {(getParentCategoryKey(selectedCat?.key || '') ? parentItems : items).filter(i => i.id !== itemForm.id).map(i => (
                    <option key={i.id} value={i.id}>{getItemLabel(i)}</option>
                  ))}
                </select>
                {getParentCategoryKey(selectedCat?.key || '') && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                    부모는 `{getParentCategoryKey(selectedCat?.key || '')}` 카테고리에서 선택됩니다.
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin.common.sort_order', '정렬 순서')}</label>
                <input className="form-input" type="number" value={itemForm.sort_order} onChange={e => setItemForm(f => ({ ...f, sort_order: e.target.value }))} />
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{t('admin.master.translations', '표시명 (13개국어)')}</div>
                  <button className="btn btn-secondary btn-sm" onClick={() => autoTranslate(itemTrans.ko, setItemTrans, itemTrans)} disabled={translating || !itemTrans.ko}>
                    {translating ? '...' : t('admin.master.auto_translate', '🌐 한국어 기준 자동번역')}
                  </button>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
                  키는 시스템 내부 식별자이며 직접 수정할 수 없습니다.
                </div>
                <div className="form-group" style={{ marginBottom: 10 }}>
                  <label className="form-label">한국어 표시명 *</label>
                  <input
                    className="form-input"
                    style={{ fontSize: 13 }}
                    value={itemTrans.ko ?? ''}
                    onChange={e => setItemTrans(f => ({ ...f, ko: e.target.value }))}
                    placeholder="예: Cafe, Hospital, Restaurant"
                  />
                </div>
                {SUPPORTED_LANGS.filter(lang => lang !== 'ko').map(lang => (
                  <div key={lang} className="form-group" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label style={{ fontSize: 12, width: 110, flexShrink: 0, color: 'var(--text-muted)' }}>
                      {LANG_LABELS[lang]}
                    </label>
                    <input
                      className="form-input"
                      style={{ fontSize: 13 }}
                      value={itemTrans[lang] ?? ''}
                      onChange={e => setItemTrans(f => ({ ...f, [lang]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setItemModal(null)}>{t('admin.common.cancel', '취소')}</button>
              <button className="btn btn-primary" onClick={handleItemSave} disabled={itemSaving}>{t('admin.common.save', '저장')}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
