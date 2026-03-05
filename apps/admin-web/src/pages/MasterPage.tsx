import { useEffect, useState, useCallback } from 'react';
import { api, type MasterCategory, type MasterItem } from '../lib/api';
import { useT, SUPPORTED_LANGS, LANG_LABELS } from '../lib/i18n';

const emptyTrans = () => Object.fromEntries(SUPPORTED_LANGS.map(l => [l, ''])) as Record<string, string>;

export default function MasterPage() {
  const t = useT();
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [items, setItems] = useState<MasterItem[]>([]);
  const [selectedCat, setSelectedCat] = useState<MasterCategory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Category modal
  const [catModal, setCatModal] = useState<'create' | 'edit' | null>(null);
  const [catForm, setCatForm] = useState<{ key: string; sort_order: string }>({ key: '', sort_order: '0' });
  const [catTrans, setCatTrans] = useState<Record<string, string>>(emptyTrans());
  const [catSaving, setCatSaving] = useState(false);

  // Item modal
  type ItemForm = { id?: string; key: string; sort_order: string; is_active?: number };
  const [itemModal, setItemModal] = useState<'create' | 'edit' | null>(null);
  const [itemForm, setItemForm] = useState<ItemForm>({ key: '', sort_order: '0' });
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

  useEffect(() => { void loadCategories(); }, [loadCategories]);
  useEffect(() => {
    if (selectedCat) void loadItems(selectedCat.key);
    else setItems([]);
  }, [selectedCat, loadItems]);

  function flash(msg: string) { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); }

  // 자동번역
  async function autoTranslate(koText: string, setTrans: (t: Record<string, string>) => void, current: Record<string, string>) {
    if (!koText) return;
    setTranslating(true);
    try {
      const result = await api.i18n.translate(koText);
      setTrans({ ...current, ...result.translations, ko: koText });
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setTranslating(false); }
  }

  // Category CRUD
  async function handleCatSave() {
    setCatSaving(true); setError('');
    try {
      if (catModal === 'create') {
        await api.master.categories.create({ key: catForm.key, sort_order: parseInt(catForm.sort_order), translations: catTrans });
        flash(t('admin.master.success_cat_add', '카테고리가 추가되었습니다.'));
      } else if (catModal === 'edit' && selectedCat) {
        await api.master.categories.update(selectedCat.id, { key: catForm.key, sort_order: parseInt(catForm.sort_order) });
        flash(t('admin.master.success_cat_edit', '카테고리가 수정되었습니다.'));
      }
      setCatModal(null);
      await loadCategories();
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setCatSaving(false); }
  }

  async function handleCatDelete(cat: MasterCategory) {
    if (!confirm(`"${cat.key}" ${t('admin.master.confirm_delete_cat', '카테고리를 삭제하시겠습니까? 아이템이 있으면 비활성화됩니다.')}`)) return;
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
        await api.master.items.create({ category_id: selectedCat.id, key: itemForm.key, sort_order: parseInt(itemForm.sort_order), translations: itemTrans });
        flash(t('admin.master.success_item_add', '아이템이 추가되었습니다.'));
      } else if (itemModal === 'edit' && itemForm.id) {
        await api.master.items.update(itemForm.id, { key: itemForm.key, sort_order: parseInt(itemForm.sort_order) });
        flash(t('admin.master.success_item_edit', '아이템이 수정되었습니다.'));
      }
      setItemModal(null);
      await loadItems(selectedCat.key);
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setItemSaving(false); }
  }

  async function handleItemDeactivate(item: MasterItem) {
    if (!confirm(`"${item.key}" ${t('admin.master.confirm_deactivate_item', '아이템을 비활성화하시겠습니까?')}`)) return;
    try {
      await api.master.items.deactivate(item.id);
      flash(t('admin.master.success_done', '처리되었습니다.'));
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

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
          {/* 카테고리 패널 */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">{t('admin.master.categories', '카테고리')}</div>
              <button className="btn btn-primary btn-sm" onClick={() => { setCatForm({ key: '', sort_order: '0' }); setCatTrans(emptyTrans()); setCatModal('create'); }}>{t('admin.master.add_category', '+ 추가')}</button>
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
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{cat.key}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>sort: {cat.sort_order}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <span className={`badge ${cat.is_active ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: 10 }}>
                        {cat.is_active ? t('admin.common.active', '활성') : t('admin.common.inactive', '비활성')}
                      </span>
                      <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); setCatForm({ key: cat.key, sort_order: String(cat.sort_order) }); setSelectedCat(cat); setCatModal('edit'); }}>✏</button>
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
              <div className="card-title">{selectedCat ? `${selectedCat.key} 아이템` : t('admin.master.select_hint', '카테고리를 선택하세요')}</div>
              {selectedCat && (
                <button className="btn btn-primary btn-sm" onClick={() => { setItemForm({ key: '', sort_order: '0' }); setItemTrans(emptyTrans()); setItemModal('create'); }}>{t('admin.master.add_item', '+ 아이템 추가')}</button>
              )}
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{t('admin.common.key', '키')}</th>
                    <th>Sort</th>
                    <th>{t('admin.common.status', '상태')}</th>
                    <th>{t('admin.common.action', '작업')}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td><span className="font-mono" style={{ fontSize: 12 }}>{item.key}</span></td>
                      <td>{item.sort_order}</td>
                      <td><span className={`badge ${item.is_active ? 'badge-green' : 'badge-gray'}`}>{item.is_active ? t('admin.common.active', '활성') : t('admin.common.inactive', '비활성')}</span></td>
                      <td>
                        <div className="td-actions">
                          <button className="btn btn-secondary btn-sm" onClick={() => { setItemForm({ id: item.id, key: item.key, sort_order: String(item.sort_order), is_active: item.is_active }); setItemModal('edit'); }}>{t('admin.common.edit', '편집')}</button>
                          {item.is_active ? <button className="btn btn-danger btn-sm" onClick={() => handleItemDeactivate(item)}>{t('admin.common.deactivate', '비활성화')}</button> : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && selectedCat && (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>{t('admin.master.no_item', '아이템이 없습니다')}</td></tr>
                  )}
                  {!selectedCat && (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>← {t('admin.master.select_hint', '카테고리를 선택하세요')}</td></tr>
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
              <div className="form-group">
                <label className="form-label">{t('admin.common.key', '키')} *</label>
                <input className="form-input font-mono" value={catForm.key} onChange={e => setCatForm(f => ({ ...f, key: e.target.value }))} placeholder="breed, disease, ..." />
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin.common.sort_order', '정렬 순서')}</label>
                <input className="form-input" type="number" value={catForm.sort_order} onChange={e => setCatForm(f => ({ ...f, sort_order: e.target.value }))} />
              </div>
              {catModal === 'create' && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{t('admin.master.translations', '표시명 (13개국어)')}</div>
                    <button className="btn btn-secondary btn-sm" onClick={() => autoTranslate(catTrans.ko, setCatTrans, catTrans)} disabled={translating || !catTrans.ko}>
                      {translating ? '...' : t('admin.master.auto_translate', '🌐 한국어 기준 자동번역')}
                    </button>
                  </div>
                  {catForm.key && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, fontFamily: 'monospace' }}>
                      i18n key: master.{catForm.key}
                    </div>
                  )}
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
              )}
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
              <div className="modal-title">{itemModal === 'create' ? `${selectedCat?.key} — ${t('admin.master.modal_create_item', '아이템 추가')}` : t('admin.master.modal_edit_item', '아이템 수정')}</div>
              <button className="modal-close" onClick={() => setItemModal(null)}>×</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {error && <div className="alert alert-error">{error}</div>}
              <div className="form-group">
                <label className="form-label">{t('admin.common.key', '키')} *</label>
                <input className="form-input font-mono" value={itemForm.key} onChange={e => setItemForm(f => ({ ...f, key: e.target.value }))} placeholder="pomeranian, diabetes, ..." />
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin.common.sort_order', '정렬 순서')}</label>
                <input className="form-input" type="number" value={itemForm.sort_order} onChange={e => setItemForm(f => ({ ...f, sort_order: e.target.value }))} />
              </div>
              {itemModal === 'create' && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{t('admin.master.translations', '표시명 (13개국어)')}</div>
                    <button className="btn btn-secondary btn-sm" onClick={() => autoTranslate(itemTrans.ko, setItemTrans, itemTrans)} disabled={translating || !itemTrans.ko}>
                      {translating ? '...' : t('admin.master.auto_translate', '🌐 한국어 기준 자동번역')}
                    </button>
                  </div>
                  {itemForm.key && selectedCat && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, fontFamily: 'monospace' }}>
                      i18n key: master.{selectedCat.key}.{itemForm.key}
                    </div>
                  )}
                  {SUPPORTED_LANGS.map(lang => (
                    <div key={lang} className="form-group" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <label style={{ fontSize: 12, width: 110, flexShrink: 0, color: lang === 'ko' ? 'var(--text)' : 'var(--text-muted)' }}>
                        {LANG_LABELS[lang]}{lang === 'ko' ? ' *' : ''}
                      </label>
                      <input
                        className="form-input"
                        style={{ fontSize: 13 }}
                        value={itemTrans[lang] ?? ''}
                        onChange={e => setItemTrans(f => ({ ...f, [lang]: e.target.value }))}
                        placeholder={lang === 'ko' ? '한국어 표시명 입력 후 자동번역' : ''}
                      />
                    </div>
                  ))}
                </div>
              )}
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
