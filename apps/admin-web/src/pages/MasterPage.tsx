import { useEffect, useMemo, useState, useCallback } from 'react';
import { api, type MasterCategory, type MasterItem } from '../lib/api';
import { useT, SUPPORTED_LANGS, LANG_LABELS } from '../lib/i18n';

const emptyTrans = () => Object.fromEntries(SUPPORTED_LANGS.map((l) => [l, ''])) as Record<string, string>;
const MAX_LEVEL = 5;

function normalizeCategoryKey(key: string): string {
  return key.replace(/^master\./, '');
}

function sortByOrderAndLabel(a: MasterItem, b: MasterItem) {
  const bySort = (a.sort_order ?? 0) - (b.sort_order ?? 0);
  if (bySort !== 0) return bySort;
  return (a.ko_name || a.ko || a.key).localeCompare(b.ko_name || b.ko || b.key, 'ko');
}

export default function MasterPage() {
  const t = useT();
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [itemsByCategory, setItemsByCategory] = useState<Record<string, MasterItem[]>>({});
  const [selectedCat, setSelectedCat] = useState<MasterCategory | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>(Array(MAX_LEVEL).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [catModal, setCatModal] = useState<'create' | 'edit' | null>(null);
  const [catForm, setCatForm] = useState<{ key: string; sort_order: string }>({ key: '', sort_order: '0' });
  const [catTrans, setCatTrans] = useState<Record<string, string>>(emptyTrans());
  const [catSaving, setCatSaving] = useState(false);

  const [itemModal, setItemModal] = useState<'create' | 'edit' | null>(null);
  const [itemForm, setItemForm] = useState<{ id?: string; key?: string; sort_order: string; parent_id?: string | null }>({ sort_order: '0', parent_id: null });
  const [itemTrans, setItemTrans] = useState<Record<string, string>>(emptyTrans());
  const [itemSaving, setItemSaving] = useState(false);
  const [itemTargetCategory, setItemTargetCategory] = useState<MasterCategory | null>(null);
  const [itemParentCandidates, setItemParentCandidates] = useState<MasterItem[]>([]);
  const [translating, setTranslating] = useState(false);

  const hiddenCategoryKeys = useMemo(
    () =>
      new Set([
        'pet_breed',
        'life_stage',
        'diet_subtype',
        'disease_type',
        'disease_device_type',
        'disease_measurement_type',
        'disease_measurement_context',
        'disease_judgement_rule_type',
        'allergy_group',
        'allergy_type',
        'medication_status',
        'coat_type',
        'activity_level',
        'neuter_status',
        'living_style',
        'grooming_cycle',
        'weight_unit',
      ]),
    [],
  );

  const diseaseCategoryOrder = useMemo(
    () => ['disease_group', 'diet_type', 'allergy_group'],
    [],
  );

  const visibleCategories = useMemo(
    () =>
      categories
        .filter((cat) => !hiddenCategoryKeys.has(normalizeCategoryKey(cat.key)))
        .sort((a, b) => {
          const aKey = normalizeCategoryKey(a.key);
          const bKey = normalizeCategoryKey(b.key);
          const aIdx = diseaseCategoryOrder.indexOf(aKey);
          const bIdx = diseaseCategoryOrder.indexOf(bKey);
          const ap = aIdx === -1 ? 999 : aIdx + 1;
          const bp = bIdx === -1 ? 999 : bIdx + 1;
          if (ap !== bp) return ap - bp;
          return (a.sort_order ?? 0) - (b.sort_order ?? 0) || aKey.localeCompare(bKey);
        }),
    [categories, hiddenCategoryKeys, diseaseCategoryOrder],
  );

  const categoryChain = useMemo(() => {
    const key = normalizeCategoryKey(selectedCat?.key || '');
    if (key === 'disease_group') {
      return [
        'disease_group',
        'disease_type',
        'disease_device_type',
        'disease_measurement_type',
        'disease_measurement_context',
      ];
    }
    if (key === 'pet_type') return ['pet_type', 'pet_type', null, null, null];
    if (key === 'coat_length') return ['coat_length', 'grooming_cycle', null, null, null];
    if (key === 'temperament_type') return ['temperament_type', 'activity_level', null, null, null];
    if (key === 'gender') return ['gender', 'neuter_status', null, null, null];
    if (key === 'body_size') return ['body_size', 'weight_unit', null, null, null];
    if (key === 'diet_type') return ['diet_type', 'diet_subtype', null, null, null];
    if (key === 'allergy_group') return ['allergy_group', 'allergy_type', null, null, null];
    if (!key) return [null, null, null, null, null];
    return [key, null, null, null, null];
  }, [selectedCat?.key]);

  const categoryMapByKey = useMemo(() => {
    const map = new Map<string, MasterCategory>();
    for (const cat of categories) map.set(normalizeCategoryKey(cat.key), cat);
    return map;
  }, [categories]);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.master.categories.list();
      setCategories(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadChainItems = useCallback(async () => {
    const keys = categoryChain.filter((k): k is string => Boolean(k));
    if (keys.length === 0) {
      setItemsByCategory({});
      return;
    }
    try {
      const entries = await Promise.all(
        Array.from(new Set(keys)).map(async (key) => [key, await api.master.items.list(key)] as const),
      );
      setItemsByCategory(Object.fromEntries(entries));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    }
  }, [categoryChain]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    setSelectedIds(Array(MAX_LEVEL).fill(''));
    void loadChainItems();
  }, [selectedCat?.id, loadChainItems]);

  function getCategoryLabel(cat: MasterCategory) {
    const translated = t(`master.${normalizeCategoryKey(cat.key)}`, '');
    return cat.ko_name?.trim() || translated || t('admin.master.unnamed_category', '이름 없음');
  }

  function getItemLabel(item: MasterItem) {
    return item.ko_name?.trim() || item.ko?.trim() || item.key;
  }

  function flash(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  }

  function getLevelItems(level: number): MasterItem[] {
    const key = categoryChain[level];
    if (!key) return [];
    const all = (itemsByCategory[key] || []).slice().sort(sortByOrderAndLabel);
    if (level === 0) return all.filter((it) => !it.parent_id);

    const parentId = selectedIds[level - 1];
    if (!parentId) return [];

    let list = all.filter((it) => it.parent_id === parentId);
    if (list.length === 0) {
      list = all.filter((it) => !it.parent_id);
    }

    if (normalizeCategoryKey(selectedCat?.key || '') === 'disease_group') {
      if (level === 3 && list.length === 0) {
        const diseaseId = selectedIds[1];
        if (diseaseId) list = all.filter((it) => it.parent_id === diseaseId);
      }
      if (level === 4 && list.length === 0) {
        const measurementId = selectedIds[3];
        if (measurementId) list = all.filter((it) => it.parent_id === measurementId);
      }
    }

    return list;
  }

  const l1Items = useMemo(() => getLevelItems(0), [itemsByCategory, categoryChain, selectedIds, selectedCat?.key]);
  const l2Items = useMemo(() => getLevelItems(1), [itemsByCategory, categoryChain, selectedIds, selectedCat?.key]);
  const l3Items = useMemo(() => getLevelItems(2), [itemsByCategory, categoryChain, selectedIds, selectedCat?.key]);
  const l4Items = useMemo(() => getLevelItems(3), [itemsByCategory, categoryChain, selectedIds, selectedCat?.key]);
  const l5Items = useMemo(() => getLevelItems(4), [itemsByCategory, categoryChain, selectedIds, selectedCat?.key]);
  const levelItems = [l1Items, l2Items, l3Items, l4Items, l5Items];

  const selectedNodes = [
    l1Items.find((x) => x.id === selectedIds[0]) || null,
    l2Items.find((x) => x.id === selectedIds[1]) || null,
    l3Items.find((x) => x.id === selectedIds[2]) || null,
    l4Items.find((x) => x.id === selectedIds[3]) || null,
    l5Items.find((x) => x.id === selectedIds[4]) || null,
  ];

  const activeLevel = useMemo(() => {
    for (let i = MAX_LEVEL - 1; i >= 0; i -= 1) {
      if (selectedNodes[i]) return i;
    }
    return -1;
  }, [selectedNodes]);

  const selectedNode = activeLevel >= 0 ? selectedNodes[activeLevel] : null;
  const selectedNodeCategoryKey = activeLevel >= 0 ? categoryChain[activeLevel] : null;

  function selectLevelItem(level: number, id: string) {
    const next = [...selectedIds];
    next[level] = id;
    for (let i = level + 1; i < MAX_LEVEL; i += 1) next[i] = '';
    setSelectedIds(next);
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
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setTranslating(false);
    }
  }

  async function handleCatSave() {
    setCatSaving(true);
    setError('');
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
          translations = { ...result.translations, ...translations, ko };
        }

        await api.master.categories.create({ key, sort_order: parseInt(catForm.sort_order, 10), translations });
        flash(t('admin.master.success_cat_add', '카테고리가 추가되었습니다.'));
      } else if (catModal === 'edit' && selectedCat) {
        const ko = (catTrans.ko || '').trim();
        if (!ko) throw new Error('한국어 표시명은 필수입니다.');

        let translations: Record<string, string> = { ...catTrans, ko };
        const hasMissing = SUPPORTED_LANGS.some((lang) => lang !== 'ko' && !(translations[lang] || '').trim());
        if (hasMissing) {
          const result = await api.i18n.translate(ko, translations);
          translations = { ...result.translations, ...translations, ko };
        }

        await api.master.categories.update(selectedCat.id, {
          sort_order: parseInt(catForm.sort_order, 10),
          translations,
        });
        flash(t('admin.master.success_cat_edit', '카테고리가 수정되었습니다.'));
      }
      setCatModal(null);
      await loadCategories();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setCatSaving(false);
    }
  }

  async function handleCatDelete(cat: MasterCategory) {
    if (!confirm(`"${getCategoryLabel(cat)}" ${t('admin.master.confirm_delete_cat', '카테고리를 삭제하시겠습니까? 아이템이 있으면 비활성화됩니다.')}`)) return;
    try {
      await api.master.categories.delete(cat.id);
      flash(t('admin.master.success_done', '처리되었습니다.'));
      if (selectedCat?.id === cat.id) setSelectedCat(null);
      await loadCategories();
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

  function openCreateAtLevel(level: number) {
    const key = categoryChain[level];
    if (!key) return;
    const category = categoryMapByKey.get(key) || null;
    if (!category) {
      setError('대상 카테고리를 찾을 수 없습니다.');
      return;
    }
    if (level > 0 && !selectedIds[level - 1]) {
      setError('상위 레벨을 먼저 선택해주세요.');
      return;
    }

    const parentId = level > 0 ? selectedIds[level - 1] : null;
    setItemTargetCategory(category);
    setItemParentCandidates(level > 0 ? levelItems[level - 1] : []);
    setItemForm({ sort_order: '0', parent_id: parentId });
    setItemTrans(emptyTrans());
    setItemModal('create');
  }

  function openEditSelectedItem() {
    if (!selectedNode || !selectedNodeCategoryKey) return;
    const category = categoryMapByKey.get(selectedNodeCategoryKey) || null;
    if (!category) {
      setError('대상 카테고리를 찾을 수 없습니다.');
      return;
    }
    const parentLevel = activeLevel - 1;
    setItemTargetCategory(category);
    setItemParentCandidates(parentLevel >= 0 ? levelItems[parentLevel] : []);
    setItemForm({
      id: selectedNode.id,
      key: selectedNode.key,
      sort_order: String(selectedNode.sort_order),
      parent_id: selectedNode.parent_id,
    });
    setItemTrans(itemToTranslations(selectedNode));
    setItemModal('edit');
  }

  async function handleItemSave() {
    if (!itemTargetCategory) return;
    setItemSaving(true);
    setError('');
    try {
      const ko = (itemTrans.ko || '').trim();
      if (!ko) throw new Error('한국어 표시명은 필수입니다.');

      let translations: Record<string, string> = { ...itemTrans, ko };
      const hasMissing = SUPPORTED_LANGS.some((lang) => lang !== 'ko' && !(translations[lang] || '').trim());
      if (hasMissing) {
        const result = await api.i18n.translate(ko, translations);
        translations = { ...result.translations, ...translations, ko };
      }

      if (itemModal === 'create') {
        await api.master.items.create({
          category_id: itemTargetCategory.id,
          sort_order: parseInt(itemForm.sort_order, 10),
          translations,
          parent_id: itemForm.parent_id || undefined,
        });
        flash(t('admin.master.success_item_add', '아이템이 추가되었습니다.'));
      } else if (itemModal === 'edit' && itemForm.id) {
        await api.master.items.update(itemForm.id, {
          sort_order: parseInt(itemForm.sort_order, 10),
          parent_id: itemForm.parent_id,
          translations,
        });
        flash(t('admin.master.success_item_edit', '아이템이 수정되었습니다.'));
      }

      setItemModal(null);
      await loadChainItems();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setItemSaving(false);
    }
  }

  async function handleDeleteSelectedItem() {
    if (!selectedNode) return;
    if (!confirm(`"${getItemLabel(selectedNode)}" ${t('admin.master.confirm_delete_item', '아이템을 삭제하시겠습니까?')}`)) return;
    try {
      const res = await api.master.items.delete(selectedNode.id);
      flash(res.deleted ? t('admin.master.success_done', '삭제되었습니다.') : t('admin.master.success_deactivated', '다른 데이터에서 사용 중이라 비활성화되었습니다.'));
      await loadChainItems();
      setSelectedIds(Array(MAX_LEVEL).fill(''));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    }
  }

  async function toggleSelectedItemActive() {
    if (!selectedNode) return;
    try {
      await api.master.items.update(selectedNode.id, { is_active: selectedNode.is_active ? 0 : 1 });
      await loadChainItems();
      flash(t('admin.master.success_done', '처리되었습니다.'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    }
  }

  function levelTitle(level: number): string {
    const catKey = categoryChain[level];
    if (!catKey) return `L${level + 1}`;
    const cat = categoryMapByKey.get(catKey);
    if (cat) return `L${level + 1} · ${getCategoryLabel(cat)}`;
    return `L${level + 1}`;
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">🗂 {t('admin.master.title', '마스터 데이터 관리')}</div>
      </div>
      <div className="content">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <div className="alert" style={{ marginBottom: 12 }}>
          Category → L1 → L2 → L3(Test Method) → L4(Measurement) → L5(Context)
        </div>

        <div className="master-explorer-grid" style={{ gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">{t('admin.master.categories', '카테고리')}</div>
              <button className="btn btn-primary btn-sm" onClick={() => { setCatForm({ key: '', sort_order: '0' }); setCatTrans(emptyTrans()); setCatModal('create'); }}>{t('admin.master.add_category', '+ 카테고리 추가')}</button>
            </div>
            {loading ? (
              <div className="loading-center"><span className="spinner" /></div>
            ) : (
              <div className="master-column-list">
                {visibleCategories.map((cat) => (
                  <button key={cat.id} className={`master-row-btn ${selectedCat?.id === cat.id ? 'active' : ''}`} onClick={() => setSelectedCat(cat)}>
                    <div><div className="master-row-title">{getCategoryLabel(cat)}</div></div>
                    <span className={`badge ${cat.is_active ? 'badge-green' : 'badge-gray'}`}>{cat.is_active ? t('admin.common.active', '활성') : t('admin.common.inactive', '비활성')}</span>
                  </button>
                ))}
                {visibleCategories.length === 0 && <div className="master-empty">{t('admin.master.no_category', '카테고리 없음')}</div>}
              </div>
            )}
          </div>

          {[0, 1, 2, 3, 4].map((level) => {
            const items = levelItems[level];
            const selectedId = selectedIds[level];
            const canAdd = Boolean(categoryChain[level]) && (level === 0 || Boolean(selectedIds[level - 1]));
            return (
              <div className="card" key={`level-${level}`}>
                <div className="card-header">
                  <div className="card-title">{levelTitle(level)}</div>
                  {canAdd && <button className="btn btn-primary btn-sm" onClick={() => openCreateAtLevel(level)}>+ {t('admin.master.add_item', '아이템 추가')}</button>}
                </div>
                <div className="master-column-list">
                  {!selectedCat && <div className="master-empty">{t('admin.master.select_hint', '카테고리를 선택하세요')}</div>}
                  {selectedCat && level > 0 && !selectedIds[level - 1] && <div className="master-empty">L{level} 선택 필요</div>}
                  {selectedCat && (level === 0 || selectedIds[level - 1]) && items.map((item) => (
                    <button key={item.id} className={`master-row-btn ${selectedId === item.id ? 'active' : ''}`} onClick={() => selectLevelItem(level, item.id)}>
                      <div><div className="master-row-title">{getItemLabel(item)}</div></div>
                      <span className={`badge ${item.is_active ? 'badge-green' : 'badge-gray'}`}>{item.is_active ? t('admin.common.active', '활성') : t('admin.common.inactive', '비활성')}</span>
                    </button>
                  ))}
                  {selectedCat && (level === 0 || selectedIds[level - 1]) && items.length === 0 && <div className="master-empty">{t('admin.master.no_item', '아이템이 없습니다')}</div>}
                </div>
              </div>
            );
          })}
        </div>

        {selectedCat && (
          <div className="card" style={{ marginTop: 12 }}>
            <div className="card-header">
              <div className="card-title">{t('admin.master.options', '선택 항목 설정')}</div>
            </div>
            <div className="table-wrap" style={{ padding: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {!selectedNode && <div className="master-empty">{t('admin.master.select_item_first', '아이템을 먼저 선택하세요')}</div>}
              {selectedNode && (
                <>
                  <div className="master-row-title">{getItemLabel(selectedNode)}</div>
                  <label className="master-toggle-row compact">
                    <span>{t('admin.common.status', '상태')}</span>
                    <input type="checkbox" checked={Boolean(selectedNode.is_active)} onChange={() => void toggleSelectedItemActive()} />
                  </label>
                  <button className="btn btn-secondary btn-sm" onClick={openEditSelectedItem}>{t('admin.common.edit', '편집')}</button>
                  <button className="btn btn-danger btn-sm" onClick={() => void handleDeleteSelectedItem()}>{t('admin.common.delete', '삭제')}</button>
                </>
              )}
              {selectedCat && (
                <>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setCatForm({ key: selectedCat.key, sort_order: String(selectedCat.sort_order) }); setCatTrans(categoryToTranslations(selectedCat)); setCatModal('edit'); }}>{t('admin.common.edit', '카테고리 편집')}</button>
                  <label className="master-toggle-row compact">
                    <span>{t('admin.common.status', '상태')}</span>
                    <input type="checkbox" checked={Boolean(selectedCat.is_active)} onChange={() => void toggleCategoryActive(selectedCat)} />
                  </label>
                  <button className="btn btn-danger btn-sm" onClick={() => void handleCatDelete(selectedCat)}>{t('admin.common.delete', '카테고리 삭제')}</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {catModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setCatModal(null)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <div className="modal-title">{catModal === 'create' ? t('admin.master.modal_create_cat', '카테고리 추가') : t('admin.master.modal_edit_cat', '카테고리 수정')}</div>
              <button className="modal-close" onClick={() => setCatModal(null)}>×</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {catModal === 'create' && (
                <div className="form-group">
                  <label className="form-label">Key *</label>
                  <input className="form-input font-mono" value={catForm.key} onChange={(e) => setCatForm((f) => ({ ...f, key: e.target.value }))} placeholder="예: disease_device_type" />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">{t('admin.common.sort_order', '정렬 순서')}</label>
                <input className="form-input" type="number" value={catForm.sort_order} onChange={(e) => setCatForm((f) => ({ ...f, sort_order: e.target.value }))} />
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{t('admin.master.translations', '표시명 (13개국어)')}</div>
                  <button className="btn btn-secondary btn-sm" onClick={() => autoTranslate(catTrans.ko, setCatTrans, catTrans)} disabled={translating || !catTrans.ko}>{translating ? '...' : t('admin.master.auto_translate', '🌐 한국어 기준 자동번역')}</button>
                </div>
                {SUPPORTED_LANGS.map((lang) => (
                  <div key={lang} className="form-group" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label style={{ fontSize: 12, width: 110, flexShrink: 0, color: lang === 'ko' ? 'var(--text)' : 'var(--text-muted)' }}>
                      {LANG_LABELS[lang]}{lang === 'ko' ? ' *' : ''}
                    </label>
                    <input className="form-input" style={{ fontSize: 13 }} value={catTrans[lang] ?? ''} onChange={(e) => setCatTrans((f) => ({ ...f, [lang]: e.target.value }))} />
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setCatModal(null)}>{t('admin.common.cancel', '취소')}</button>
              <button className="btn btn-primary" onClick={() => void handleCatSave()} disabled={catSaving}>{t('admin.common.save', '저장')}</button>
            </div>
          </div>
        </div>
      )}

      {itemModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setItemModal(null)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <div className="modal-title">{itemModal === 'create' ? t('admin.master.modal_create_item', '아이템 추가') : t('admin.master.modal_edit_item', '아이템 수정')}</div>
              <button className="modal-close" onClick={() => setItemModal(null)}>×</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div className="form-group">
                <label className="form-label">{t('admin.master.categories', '카테고리')}</label>
                <input className="form-input" value={itemTargetCategory ? getCategoryLabel(itemTargetCategory) : ''} readOnly />
              </div>
              {itemModal === 'edit' && itemForm.key && (
                <div className="form-group">
                  <label className="form-label">{t('admin.common.key', '키')}</label>
                  <input className="form-input font-mono" value={itemForm.key} readOnly />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">{t('admin.master.parent_item', '부모 아이템')}</label>
                <select className="form-input" value={itemForm.parent_id || ''} onChange={(e) => setItemForm((f) => ({ ...f, parent_id: e.target.value || null }))}>
                  <option value="">-- {t('admin.common.none', '없음')} --</option>
                  {itemParentCandidates.filter((i) => i.id !== itemForm.id).map((i) => <option key={i.id} value={i.id}>{getItemLabel(i)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin.common.sort_order', '정렬 순서')}</label>
                <input className="form-input" type="number" value={itemForm.sort_order} onChange={(e) => setItemForm((f) => ({ ...f, sort_order: e.target.value }))} />
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{t('admin.master.translations', '표시명 (13개국어)')}</div>
                  <button className="btn btn-secondary btn-sm" onClick={() => autoTranslate(itemTrans.ko, setItemTrans, itemTrans)} disabled={translating || !itemTrans.ko}>{translating ? '...' : t('admin.master.auto_translate', '🌐 한국어 기준 자동번역')}</button>
                </div>
                {SUPPORTED_LANGS.map((lang) => (
                  <div key={lang} className="form-group" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label style={{ fontSize: 12, width: 110, flexShrink: 0, color: lang === 'ko' ? 'var(--text)' : 'var(--text-muted)' }}>
                      {LANG_LABELS[lang]}{lang === 'ko' ? ' *' : ''}
                    </label>
                    <input className="form-input" style={{ fontSize: 13 }} value={itemTrans[lang] ?? ''} onChange={(e) => setItemTrans((f) => ({ ...f, [lang]: e.target.value }))} />
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setItemModal(null)}>{t('admin.common.cancel', '취소')}</button>
              <button className="btn btn-primary" onClick={() => void handleItemSave()} disabled={itemSaving}>{t('admin.common.save', '저장')}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
