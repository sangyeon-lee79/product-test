import { useEffect, useState, useCallback, useMemo } from 'react';
import { api, type MasterCategory, type MasterItem } from '../lib/api';
import { useT, SUPPORTED_LANGS, LANG_LABELS } from '../lib/i18n';

const emptyTrans = () => Object.fromEntries(SUPPORTED_LANGS.map(l => [l, ''])) as Record<string, string>;

export default function MasterPage() {
  const t = useT();
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [items, setItems] = useState<MasterItem[]>([]);
  const [selectedCat, setSelectedCat] = useState<MasterCategory | null>(null);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedSubItemId, setSelectedSubItemId] = useState('');
  const [parentItems, setParentItems] = useState<MasterItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Category modal
  const [catModal, setCatModal] = useState<'create' | 'edit' | null>(null);
  const [catForm, setCatForm] = useState<{ key: string; sort_order: string }>({ key: '', sort_order: '0' });
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
  const diseaseCategoryOrder = useMemo(
    () => [
      'disease_group',
      'disease_measurement_type',
      'disease_measurement',
      'disease_device_type',
      'disease_device',
      'disease_measurement_context',
      'disease_judgement_rule_type',
      'disease_judgement_rule',
    ],
    [],
  );
  const hiddenCategoryKeys = useMemo(
    () => new Set([
      'pet_breed',
      'life_stage',
      'diet_subtype',
      'disease_type',
    ]),
    [],
  );
  const visibleCategories = useMemo(
    () => categories
      .filter((cat) => !hiddenCategoryKeys.has(normalizeCategoryKey(cat.key)))
      .sort((a, b) => {
        const aKey = normalizeCategoryKey(a.key);
        const bKey = normalizeCategoryKey(b.key);
        const aIdx = diseaseCategoryOrder.indexOf(aKey);
        const bIdx = diseaseCategoryOrder.indexOf(bKey);
        const aPriority = aIdx === -1 ? 999 : aIdx + 1;
        const bPriority = bIdx === -1 ? 999 : bIdx + 1;
        if (aPriority !== bPriority) return aPriority - bPriority;
        return (a.sort_order ?? 0) - (b.sort_order ?? 0) || aKey.localeCompare(bKey);
      }),
    [categories, normalizeCategoryKey, diseaseCategoryOrder, hiddenCategoryKeys],
  );

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

  useEffect(() => { void loadCategories(); }, [loadCategories]);
  useEffect(() => {
    if (selectedCat) void loadItems(selectedCat.key);
    else setItems([]);
  }, [selectedCat, loadItems]);

  useEffect(() => {
    setSelectedItemId('');
    setSelectedSubItemId('');
  }, [selectedCat?.id]);


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
  function getCategoryLabel(cat: MasterCategory) {
    const translated = t(`master.${cat.key.replace(/^master\./, '')}`, '');
    return cat.ko_name?.trim() || translated || t('admin.master.unnamed_category', '이름 없음');
  }
  function getItemLabel(item: MasterItem) { return item.ko_name?.trim() || item.ko?.trim() || item.key; }
  function openEditItem(item: MasterItem) {
    setItemForm({ id: item.id, key: item.key, sort_order: String(item.sort_order), is_active: item.is_active, parent_id: item.parent_id });
    setItemModal('edit');
    setItemTrans(itemToTranslations(item));
  }

  async function toggleItemActive(item: MasterItem) {
    if (!selectedCat) return;
    try {
      await api.master.items.update(item.id, { is_active: item.is_active ? 0 : 1 });
      await loadItems(selectedCat.key);
      flash(t('admin.master.success_done', '처리되었습니다.'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    }
  }

  async function toggleCategoryActive(cat: MasterCategory) {
    try {
      await api.master.categories.update(cat.id, { is_active: cat.is_active ? 0 : 1 });
      await loadCategories();
      flash(t('admin.master.success_done', '처리되었습니다.'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    }
  }
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
        const key = (catForm.key || '').trim().replace(/^master\./, '');
        if (!key) throw new Error('Key는 필수입니다.');
        if (!/^[a-z0-9_]+$/.test(key)) throw new Error('Key는 소문자/숫자/언더스코어만 허용됩니다.');
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

        await api.master.categories.create({ key, sort_order: parseInt(catForm.sort_order), translations });
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

  const hasExternalParentCategory = useMemo(
    () => Boolean(getParentCategoryKey(selectedCat?.key || '')),
    [getParentCategoryKey, selectedCat?.key],
  );
  const topLevelItems = useMemo(() => {
    if (hasExternalParentCategory) return parentItems;
    return items.filter((item) => !item.parent_id);
  }, [hasExternalParentCategory, items, parentItems]);
  const selectedItem = useMemo(
    () => topLevelItems.find((item) => item.id === selectedItemId) || null,
    [topLevelItems, selectedItemId],
  );
  const subItems = useMemo(() => {
    if (!selectedItem) return [];
    return items.filter((item) => item.parent_id === selectedItem.id);
  }, [items, selectedItem]);
  const selectedSubItem = useMemo(
    () => subItems.find((item) => item.id === selectedSubItemId) || null,
    [subItems, selectedSubItemId],
  );
  const optionTarget = selectedSubItem || selectedItem;

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">🗂 {t('admin.master.title', '마스터 데이터 관리')}</div>
      </div>
      <div className="content">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <div className="alert" style={{ marginBottom: 12 }}>
          질병군 → 질병측정항목 → 질병장치 → 질병측정컨텍스트 → 기타
        </div>

        <div className="master-explorer-grid">
          <div className="card">
            <div className="card-header">
              <div className="card-title">{t('admin.master.categories', '카테고리')}</div>
              <button className="btn btn-primary btn-sm" onClick={() => { setCatForm({ key: '', sort_order: '0' }); setCatTrans(emptyTrans()); setCatModal('create'); }}>{t('admin.master.add_category', '+ 카테고리 추가')}</button>
            </div>
            {loading ? <div className="loading-center"><span className="spinner" /></div> : (
              <div className="master-column-list">
                {visibleCategories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`master-row-btn ${selectedCat?.id === cat.id ? 'active' : ''}`}
                    onClick={() => setSelectedCat(cat)}
                  >
                    <div>
                      <div className="master-row-title">{getCategoryLabel(cat)}</div>
                      <div className="master-row-sub font-mono">{cat.key}</div>
                    </div>
                    <span className={`badge ${cat.is_active ? 'badge-green' : 'badge-gray'}`}>{cat.is_active ? t('admin.common.active', '활성') : t('admin.common.inactive', '비활성')}</span>
                  </button>
                ))}
                {visibleCategories.length === 0 && <div className="master-empty">{t('admin.master.no_category', '카테고리 없음')}</div>}
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">{selectedCat ? t('admin.master.items', '아이템') : t('admin.master.select_hint', '카테고리를 선택하세요')}</div>
              {selectedCat && (
                <button
                  className="btn btn-primary btn-sm"
                  disabled={hasExternalParentCategory && !selectedItem}
                  onClick={() => {
                    const parent = hasExternalParentCategory ? selectedItem?.id || null : null;
                    setItemForm({ sort_order: '0', parent_id: parent });
                    setItemTrans(emptyTrans());
                    setItemModal('create');
                  }}
                >
                  {t('admin.master.add_item', '+ 아이템 추가')}
                </button>
              )}
            </div>
            <div className="master-column-list">
              {!selectedCat && <div className="master-empty">← {t('admin.master.select_hint', '카테고리를 선택하세요')}</div>}
              {selectedCat && topLevelItems.map((item) => (
                <button
                  key={item.id}
                  className={`master-row-btn ${selectedItemId === item.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedItemId(item.id);
                    setSelectedSubItemId('');
                  }}
                >
                  <div>
                    <div className="master-row-title">{getItemLabel(item)}</div>
                    <div className="master-row-sub font-mono">{item.key}</div>
                  </div>
                  <span className={`badge ${item.is_active ? 'badge-green' : 'badge-gray'}`}>{item.is_active ? t('admin.common.active', '활성') : t('admin.common.inactive', '비활성')}</span>
                </button>
              ))}
              {selectedCat && topLevelItems.length === 0 && <div className="master-empty">{t('admin.master.no_item', '아이템이 없습니다')}</div>}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">{t('admin.master.sub_items', '하위 아이템')}</div>
              {selectedCat && selectedItem && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setItemForm({ sort_order: '0', parent_id: selectedItem.id });
                    setItemTrans(emptyTrans());
                    setItemModal('create');
                  }}
                >
                  {t('admin.master.add_sub_item', '+ 하위아이템 추가')}
                </button>
              )}
            </div>
            <div className="master-column-list">
              {!selectedItem && <div className="master-empty">{t('admin.master.select_item_first', '아이템을 먼저 선택하세요')}</div>}
              {selectedItem && subItems.map((item) => (
                <button
                  key={item.id}
                  className={`master-row-btn ${selectedSubItemId === item.id ? 'active' : ''}`}
                  onClick={() => setSelectedSubItemId(item.id)}
                >
                  <div>
                    <div className="master-row-title">{getItemLabel(item)}</div>
                    <div className="master-row-sub font-mono">{item.key}</div>
                  </div>
                  <span className={`badge ${item.is_active ? 'badge-green' : 'badge-gray'}`}>{item.is_active ? t('admin.common.active', '활성') : t('admin.common.inactive', '비활성')}</span>
                </button>
              ))}
              {selectedItem && subItems.length === 0 && <div className="master-empty">{t('admin.master.no_sub_item', '하위 아이템이 없습니다')}</div>}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">{t('admin.master.detail', '세부')}</div>
            </div>
            <div className="master-option-panel">
              {!selectedCat && <div className="master-empty">{t('admin.master.select_hint', '카테고리를 선택하세요')}</div>}
              {selectedCat && !optionTarget && <div className="master-empty">{t('admin.master.select_item_first', '아이템을 먼저 선택하세요')}</div>}
              {optionTarget && (
                <>
                  <div className="master-option-row">
                    <div className="master-row-sub">{t('admin.master.item_name', '아이템명')}</div>
                    <div className="master-row-title">{getItemLabel(optionTarget)}</div>
                  </div>
                  <div className="master-option-row">
                    <div className="master-row-sub">{t('admin.common.key', '키')}</div>
                    <div className="master-row-title font-mono">{optionTarget.key}</div>
                  </div>
                  <div className="master-option-row">
                    <div className="master-row-sub">{t('admin.master.parent', '부모')}</div>
                    <div className="master-row-title">{parentLabel(optionTarget.parent_id)}</div>
                  </div>
                  <div className="master-option-row">
                    <div className="master-row-sub">{t('admin.common.sort_order', '정렬')}</div>
                    <div className="master-row-title">{optionTarget.sort_order}</div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">{t('admin.master.options', '기타')}</div>
            </div>
            <div className="master-option-panel">
              {!selectedCat && <div className="master-empty">{t('admin.master.select_hint', '카테고리를 선택하세요')}</div>}
              {selectedCat && !optionTarget && (
                <div className="master-empty">{t('admin.master.select_item_first', '아이템을 먼저 선택하세요')}</div>
              )}
              {selectedCat && optionTarget && (
                <>
                  <label className="master-toggle-row">
                    <span>{t('admin.common.status', '상태')}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(optionTarget.is_active)}
                      onChange={() => void toggleItemActive(optionTarget)}
                    />
                  </label>
                  <div className="td-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => openEditItem(optionTarget)}>{t('admin.common.edit', '편집')}</button>
                    <button className="btn btn-danger btn-sm" onClick={() => void handleItemDelete(optionTarget)}>{t('admin.common.delete', '삭제')}</button>
                  </div>
                </>
              )}
              {selectedCat && (
                <div className="master-option-cat">
                  <div className="master-row-sub">{t('admin.master.category_options', '카테고리 설정')}</div>
                  <div className="td-actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setCatForm({ key: selectedCat.key, sort_order: String(selectedCat.sort_order) });
                        setCatTrans(categoryToTranslations(selectedCat));
                        setCatModal('edit');
                      }}
                    >
                      {t('admin.common.edit', '편집')}
                    </button>
                    <label className="master-toggle-row compact">
                      <span>{t('admin.common.status', '상태')}</span>
                      <input type="checkbox" checked={Boolean(selectedCat.is_active)} onChange={() => void toggleCategoryActive(selectedCat)} />
                    </label>
                    <button className="btn btn-danger btn-sm" onClick={() => void handleCatDelete(selectedCat)}>{t('admin.common.delete', '삭제')}</button>
                  </div>
                </div>
              )}
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
              {catModal === 'create' && (
                <div className="form-group">
                  <label className="form-label">Key *</label>
                  <input
                    className="form-input font-mono"
                    value={catForm.key}
                    onChange={e => setCatForm(f => ({ ...f, key: e.target.value }))}
                    placeholder="예: disease_device_type"
                  />
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
