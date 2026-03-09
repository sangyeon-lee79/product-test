import { useEffect, useMemo, useState, useCallback } from 'react';
import { api, type MasterCategory, type MasterItem, type DeviceType } from '../lib/api';
import { useT, useI18n, SUPPORTED_LANGS, LANG_LABELS } from '../lib/i18n';
import { autoTranslate, emptyTrans, findMissingTranslationLangs } from '../lib/catalogUtils';
import { TranslationFields } from '../components/TranslationFields';

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
  const { lang } = useI18n();
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
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [itemDeviceTypeId, setItemDeviceTypeId] = useState<string>('');

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
        'pet_color',
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
    if (key === 'pet_gender' || key === 'gender') return ['pet_gender', 'pet_color', null, null, null];
    if (key === 'body_size') return ['body_size', 'weight_unit', null, null, null];
    if (key === 'diet_type') return ['diet_type', 'diet_subtype', 'diet_feed_type', null, null];
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
    void api.devices.public.types().then(setDeviceTypes).catch(() => {/* non-critical */});
  }, [loadCategories]);

  useEffect(() => {
    setSelectedIds(Array(MAX_LEVEL).fill(''));
    void loadChainItems();
  }, [selectedCat?.id, loadChainItems]);

  function getCategoryLabel(cat: MasterCategory) {
    const translated = t(`master.${normalizeCategoryKey(cat.key)}`, '').trim();
    if (translated) return translated;

    const localized = (cat as unknown as Record<string, string | undefined | null>)[lang];
    if (localized && localized.trim()) return localized.trim();

    const ko = cat.ko_name?.trim() || cat.ko?.trim();
    if (ko) return ko;

    return t('admin.master.missing_translation');
  }

  function getItemLabel(item: MasterItem, preferredCategoryKey?: string | null) {
    const preferred = (preferredCategoryKey || '').trim();
    if (preferred) {
      const translated = t(`master.${preferred}.${item.key}`, '');
      if (translated) return translated;
    }

    if (item.category_id) {
      const targetCat = categories.find((c) => c.id === item.category_id);
      if (targetCat) {
        const itemCatKey = normalizeCategoryKey(targetCat.key);
        const translated = t(`master.${itemCatKey}.${item.key}`, '');
        if (translated) return translated;
      }
    }

    const localized = (item as unknown as Record<string, string | undefined | null>)[lang];
    if (localized && localized.trim()) return localized.trim();

    const ko = item.ko_name?.trim() || item.ko?.trim();
    if (ko) return ko;

    return t('admin.master.missing_translation');
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

  async function handleCatSave() {
    setCatSaving(true);
    setError('');
    try {
      if (catModal === 'create') {
        const key = (catForm.key || '').trim().replace(/^master\./, '');
        if (key && !/^[a-z0-9_]+$/.test(key)) throw new Error(t('admin.master.err_key_fmt'));
        const ko = (catTrans.ko || '').trim();
        if (!ko) throw new Error(t('admin.master.err_required'));

        let translations: Record<string, string> = { ...catTrans, ko };
        const hasMissing = SUPPORTED_LANGS.some((lang) => lang !== 'ko' && !(translations[lang] || '').trim());
        if (hasMissing) {
          const result = await api.i18n.translate(ko, translations);
          translations = { ...result.translations, ...translations, ko };
        }
        const missingLangs = findMissingTranslationLangs(translations);
        if (missingLangs.length > 0) {
          throw new Error(t('admin.master.err_trans_missing').replace('{langs}', missingLangs.map((lang) => (LANG_LABELS as Record<string, string>)[lang] || lang).join(', ')));
        }

        await api.master.categories.create({
          key: key || undefined,
          sort_order: parseInt(catForm.sort_order, 10),
          translations,
        });
        flash(t('admin.master.msg_success'));
      } else if (catModal === 'edit' && selectedCat) {
        const ko = (catTrans.ko || '').trim();
        if (!ko) throw new Error(t('admin.master.err_required'));

        let translations: Record<string, string> = { ...catTrans, ko };
        const hasMissing = SUPPORTED_LANGS.some((lang) => lang !== 'ko' && !(translations[lang] || '').trim());
        if (hasMissing) {
          const result = await api.i18n.translate(ko, translations);
          translations = { ...result.translations, ...translations, ko };
        }
        const missingLangs = findMissingTranslationLangs(translations);
        if (missingLangs.length > 0) {
          throw new Error(t('admin.master.err_trans_missing').replace('{langs}', missingLangs.map((lang) => (LANG_LABELS as Record<string, string>)[lang] || lang).join(', ')));
        }

        await api.master.categories.update(selectedCat.id, {
          sort_order: parseInt(catForm.sort_order, 10),
          translations,
        });
        flash(t('admin.master.msg_success'));
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
    if (!confirm(`"${getCategoryLabel(cat)}" ${t('admin.master.msg_confirm_delete')}`)) return;
    try {
      await api.master.categories.delete(cat.id);
      flash(t('admin.master.msg_success'));
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
      flash(t('admin.master.msg_success'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    }
  }

  function openCreateAtLevel(level: number) {
    const key = categoryChain[level];
    if (!key) return;
    const category = categoryMapByKey.get(key) || null;
    if (!category) {
      setError(t('admin.master.error_target_cat_not_found'));
      return;
    }
    if (level > 0 && !selectedIds[level - 1]) {
      setError(t('admin.master.select_parent_req'));
      return;
    }

    const parentId = level > 0 ? selectedIds[level - 1] : null;
    setItemTargetCategory(category);
    setItemParentCandidates(level > 0 ? levelItems[level - 1] : []);
    setItemForm({ sort_order: '0', parent_id: parentId });
    setItemTrans(emptyTrans());
    setItemDeviceTypeId('');
    setItemModal('create');
  }

  function openEditSelectedItem() {
    if (!selectedNode || !selectedNodeCategoryKey) return;
    const category = categoryMapByKey.get(selectedNodeCategoryKey) || null;
    if (!category) {
      setError(t('admin.master.error_target_cat_not_found'));
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
    setItemDeviceTypeId((selectedNode as unknown as Record<string, string>).device_type_id ?? '');
    setItemModal('edit');
  }

  async function handleItemSave() {
    if (!itemTargetCategory) return;
    setItemSaving(true);
    setError('');
    try {
      const ko = (itemTrans.ko || '').trim();
      if (!ko) throw new Error(t('admin.master.err_required'));

      let translations: Record<string, string> = { ...itemTrans, ko };
      const hasMissing = SUPPORTED_LANGS.some((lang) => lang !== 'ko' && !(translations[lang] || '').trim());
      if (hasMissing) {
        const result = await api.i18n.translate(ko, translations);
        translations = { ...result.translations, ...translations, ko };
      }
      const missingLangs = findMissingTranslationLangs(translations);
      if (missingLangs.length > 0) {
        throw new Error(t('admin.master.err_trans_missing').replace('{langs}', missingLangs.map((lang) => (LANG_LABELS as Record<string, string>)[lang] || lang).join(', ')));
      }

      const isDeviceTypeCategory = itemTargetCategory && normalizeCategoryKey(itemTargetCategory.key) === 'disease_device_type';
      if (itemModal === 'create') {
        await api.master.items.create({
          category_id: itemTargetCategory.id,
          sort_order: parseInt(itemForm.sort_order, 10),
          translations,
          parent_id: itemForm.parent_id || undefined,
          device_type_id: isDeviceTypeCategory && itemDeviceTypeId ? itemDeviceTypeId : undefined,
        });
        flash(t('admin.master.msg_success'));
      } else if (itemModal === 'edit' && itemForm.id) {
        await api.master.items.update(itemForm.id, {
          sort_order: parseInt(itemForm.sort_order, 10),
          parent_id: itemForm.parent_id,
          translations,
          device_type_id: isDeviceTypeCategory ? (itemDeviceTypeId || null) : undefined,
        });
        flash(t('admin.master.msg_success'));
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
    if (!confirm(`"${getItemLabel(selectedNode, selectedNodeCategoryKey)}" ${t('admin.master.msg_confirm_delete')}`)) return;
    try {
      await api.master.items.delete(selectedNode.id);
      flash(t('admin.master.msg_success'));
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
      flash(t('admin.master.msg_success'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    }
  }

  function levelTitle(level: number): string {
    const catKey = categoryChain[level];
    if (!catKey) return t('admin.master.level_title').replace('{level}', String(level + 1));
    const cat = categoryMapByKey.get(catKey);
    if (cat) {
      return t('admin.master.level_title_named')
        .replace('{level}', String(level + 1))
        .replace('{name}', getCategoryLabel(cat));
    }
    return t('admin.master.level_title').replace('{level}', String(level + 1));
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">🗂 {t('admin.master.title')}</div>
      </div>
      <div className="content">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <div className="alert" style={{ marginBottom: 12 }}>{t('admin.master.guide')}</div>

        <div className="master-explorer-grid" style={{ gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">{t('admin.master.cat_list')}</div>
              <button className="btn btn-primary btn-sm" onClick={() => { setCatForm({ key: '', sort_order: '0' }); setCatTrans(emptyTrans()); setCatModal('create'); }}>{t('admin.master.btn_add')}</button>
            </div>
            {loading ? (
              <div className="loading-center"><span className="spinner" /></div>
            ) : (
              <div className="master-column-list">
                {visibleCategories.map((cat) => (
                  <button key={cat.id} className={`master-row-btn ${selectedCat?.id === cat.id ? 'active' : ''}`} onClick={() => setSelectedCat(cat)}>
                    <div><div className="master-row-title">{getCategoryLabel(cat)}</div></div>
                    <span className={`badge ${cat.is_active ? 'badge-green' : 'badge-gray'}`}>{cat.is_active ? t('admin.master.active') : t('admin.master.inactive')}</span>
                  </button>
                ))}
                {visibleCategories.length === 0 && <div className="master-empty">{t('admin.master.empty_cat')}</div>}
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
                  {canAdd && <button className="btn btn-primary btn-sm" onClick={() => openCreateAtLevel(level)}>+ {t('admin.master.btn_add')}</button>}
                </div>
                <div className="master-column-list">
                  {!selectedCat && <div className="master-empty">{t('admin.master.empty_cat')}</div>}
                  {selectedCat && level > 0 && !selectedIds[level - 1] && <div className="master-empty">{t('admin.master.level_select_required').replace('{level}', String(level))}</div>}
                  {selectedCat && (level === 0 || selectedIds[level - 1]) && items.map((item) => (
                    <button key={item.id} className={`master-row-btn ${selectedId === item.id ? 'active' : ''}`} onClick={() => selectLevelItem(level, item.id)}>
                      <div><div className="master-row-title">{getItemLabel(item, categoryChain[level])}</div></div>
                      <span className={`badge ${item.is_active ? 'badge-green' : 'badge-gray'}`}>{item.is_active ? t('admin.master.active') : t('admin.master.inactive')}</span>
                    </button>
                  ))}
                  {selectedCat && (level === 0 || selectedIds[level - 1]) && items.length === 0 && <div className="master-empty">{t('admin.master.empty_item')}</div>}
                </div>
              </div>
            );
          })}
        </div>

        {selectedCat && (
          <div className="card" style={{ marginTop: 12 }}>
            <div className="card-header">
              <div className="card-title">{t('admin.master.item_detail')}</div>
            </div>
            <div className="table-wrap" style={{ padding: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {!selectedNode && <div className="master-empty">{t('admin.master.empty_item')}</div>}
              {selectedNode && (
                <>
                  <div className="master-row-title">{getItemLabel(selectedNode, selectedNodeCategoryKey)}</div>
                  <label className="master-toggle-row compact">
                    <span>{t('admin.master.active')}</span>
                    <input type="checkbox" checked={Boolean(selectedNode.is_active)} onChange={() => void toggleSelectedItemActive()} />
                  </label>
                  <button className="btn btn-secondary btn-sm" title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')} onClick={openEditSelectedItem}>✏️</button>
                  <button className="btn btn-danger btn-sm" title={t('common.delete', 'Delete')} aria-label={t('common.delete', 'Delete')} onClick={() => void handleDeleteSelectedItem()}>🗑️</button>
                </>
              )}
              {selectedCat && (
                <>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setCatForm({ key: selectedCat.key, sort_order: String(selectedCat.sort_order) }); setCatTrans(categoryToTranslations(selectedCat)); setCatModal('edit'); }}>{t('admin.master.cat_edit')}</button>
                  <label className="master-toggle-row compact">
                    <span>{t('admin.master.active')}</span>
                    <input type="checkbox" checked={Boolean(selectedCat.is_active)} onChange={() => void toggleCategoryActive(selectedCat)} />
                  </label>
                  <button className="btn btn-danger btn-sm" title={t('common.delete', 'Delete')} aria-label={t('common.delete', 'Delete')} onClick={() => void handleCatDelete(selectedCat)}>🗑️</button>
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
              <div className="modal-title">{catModal === 'create' ? t('admin.master.cat_create') : t('admin.master.cat_edit')}</div>
              <button className="modal-close" onClick={() => setCatModal(null)}>×</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {catModal === 'create' && (
                <div className="form-group">
                  <label className="form-label">{t('admin.master.field_key')}</label>
                  <input className="form-input font-mono" value={catForm.key} onChange={(e) => setCatForm((f) => ({ ...f, key: e.target.value }))} placeholder={t('admin.master.ph_key')} />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">{t('admin.master.field_sort')}</label>
                <input className="form-input" type="number" value={catForm.sort_order} onChange={(e) => setCatForm((f) => ({ ...f, sort_order: e.target.value }))} />
              </div>
              <TranslationFields translations={catTrans} onChange={setCatTrans} translating={translating} onAutoTranslate={() => void autoTranslate(catTrans.ko, catTrans, setCatTrans, setTranslating, setError)} t={t} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setCatModal(null)}>{t('admin.master.btn_cancel')}</button>
              <button className="btn btn-primary" onClick={() => void handleCatSave()} disabled={catSaving}>{t('admin.master.btn_save')}</button>
            </div>
          </div>
        </div>
      )}

      {itemModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setItemModal(null)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <div className="modal-title">{itemModal === 'create' ? t('admin.master.item_create') : t('admin.master.item_edit')}</div>
              <button className="modal-close" onClick={() => setItemModal(null)}>×</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div className="form-group">
                <label className="form-label">{t('admin.master.field_category')}</label>
                <input className="form-input" value={itemTargetCategory ? getCategoryLabel(itemTargetCategory) : ''} readOnly />
              </div>
              {itemModal === 'edit' && itemForm.key && (
                <div className="form-group">
                  <label className="form-label">{t('admin.master.field_key')}</label>
                  <input className="form-input font-mono" value={itemForm.key} readOnly />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">{t('admin.master.field_parent')}</label>
                <select className="form-input" value={itemForm.parent_id || ''} onChange={(e) => setItemForm((f) => ({ ...f, parent_id: e.target.value || null }))}>
                  <option value="">{t('admin.master.opt_none')}</option>
                  {itemParentCandidates.filter((i) => i.id !== itemForm.id).map((i) => <option key={i.id} value={i.id}>{getItemLabel(i, itemTargetCategory ? normalizeCategoryKey(itemTargetCategory.key) : null)}</option>)}
                </select>
              </div>
              {itemTargetCategory && normalizeCategoryKey(itemTargetCategory.key) === 'disease_device_type' && (
                <div className="form-group">
                  <label className="form-label">{t('admin.device.device_type', '장치 유형')}</label>
                  <select className="form-input" value={itemDeviceTypeId} onChange={(e) => {
                    const dtId = e.target.value;
                    setItemDeviceTypeId(dtId);
                    const dt = deviceTypes.find(d => d.id === dtId);
                    if (dt && !itemTrans.ko) setItemTrans(f => ({ ...f, ko: dt.name_ko ?? '', en: dt.name_en ?? '' }));
                  }}>
                    <option value="">{t('admin.device.select_type', '유형을 선택하세요')}</option>
                    {deviceTypes.map(dt => <option key={dt.id} value={dt.id}>{(dt.display_label || dt.name_en || dt.name_ko || dt.key)} ({dt.key})</option>)}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">{t('admin.master.field_sort')}</label>
                <input className="form-input" type="number" value={itemForm.sort_order} onChange={(e) => setItemForm((f) => ({ ...f, sort_order: e.target.value }))} />
              </div>
              <TranslationFields translations={itemTrans} onChange={setItemTrans} translating={translating} onAutoTranslate={() => void autoTranslate(itemTrans.ko, itemTrans, setItemTrans, setTranslating, setError)} t={t} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setItemModal(null)}>{t('admin.master.btn_cancel')}</button>
              <button className="btn btn-primary" onClick={() => void handleItemSave()} disabled={itemSaving}>{t('admin.master.btn_save')}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
