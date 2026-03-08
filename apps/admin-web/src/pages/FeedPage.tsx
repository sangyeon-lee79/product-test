import { useEffect, useState, useCallback } from 'react';
import { api, type FeedType, type FeedManufacturer, type FeedBrand, type FeedModel } from '../lib/api';
import { useI18n, useT } from '../lib/i18n';

type ModalTarget = 'manufacturer' | 'brand' | 'model';

export default function FeedPage() {
  const t = useT();
  const { lang } = useI18n();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [types, setTypes] = useState<FeedType[]>([]);
  const [manufacturers, setManufacturers] = useState<FeedManufacturer[]>([]);
  const [brands, setBrands] = useState<FeedBrand[]>([]);
  const [models, setModels] = useState<FeedModel[]>([]);

  const [selectedType, setSelectedType] = useState<FeedType | null>(null);
  const [selectedMfr, setSelectedMfr] = useState<FeedManufacturer | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<FeedBrand | null>(null);
  const [selectedModel, setSelectedModel] = useState<FeedModel | null>(null);

  const [modal, setModal] = useState<{ target: ModalTarget; mode: 'create' | 'edit'; id?: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const [mfrForm, setMfrForm] = useState({ name_ko: '', country: '', sort_order: '0' });
  const [brandForm, setBrandForm] = useState({ name_ko: '' });
  const [modelForm, setModelForm] = useState({ name_ko: '', model_code: '', description: '' });
  const [mfrParentTypeIds, setMfrParentTypeIds] = useState<string[]>([]);
  const [brandParentMfrIds, setBrandParentMfrIds] = useState<string[]>([]);
  const [modelParentBrandIds, setModelParentBrandIds] = useState<string[]>([]);

  const typeLabel = (item?: FeedType | null): string => {
    if (!item) return emptyLabel;
    const display = (item.display_label || '').trim();
    if (display) return display;
    return item.name_en || item.name_ko || item.key || emptyLabel;
  };

  const mfrLabel = (item?: FeedManufacturer | null): string => {
    if (!item) return emptyLabel;
    const display = (item.display_label || '').trim();
    if (display) return display;
    return item.name_en || item.name_ko || item.key || emptyLabel;
  };

  const brandLabel = (item?: FeedBrand | null): string => {
    if (!item) return emptyLabel;
    const display = (item.display_label || '').trim();
    if (display) return display;
    return item.name_en || item.name_ko || emptyLabel;
  };

  const modelLabel = (item?: FeedModel | null): string => {
    if (!item) return emptyLabel;
    const display = (item.model_display_label || '').trim();
    if (display) return display;
    return item.model_name || emptyLabel;
  };

  const emptyLabel = t('admin.feed.none', '없음');

  const loadTypes = useCallback(async () => {
    try {
      setTypes(await api.feedCatalog.types.list(lang));
    } catch (e) {
      setError(String(e));
    }
  }, [lang]);

  const loadManufacturers = useCallback(async (feedTypeId?: string) => {
    try {
      setManufacturers(await api.feedCatalog.manufacturers.list({ lang, feed_type_id: feedTypeId }));
    } catch (e) {
      setError(String(e));
    }
  }, [lang]);

  const loadBrands = useCallback(async (mfrId?: string) => {
    try {
      setBrands(await api.feedCatalog.brands.list(mfrId, lang));
    } catch (e) {
      setError(String(e));
    }
  }, [lang]);

  const loadModels = useCallback(async (filters?: { feed_type_id?: string; manufacturer_id?: string; brand_id?: string }) => {
    try {
      setModels(await api.feedCatalog.models.list(filters, lang));
    } catch (e) {
      setError(String(e));
    }
  }, [lang]);

  useEffect(() => {
    void loadTypes();
  }, [loadTypes]);

  useEffect(() => {
    void loadManufacturers(selectedType?.id);
    setSelectedMfr(null);
    setSelectedBrand(null);
    setSelectedModel(null);
  }, [selectedType?.id, loadManufacturers]);

  useEffect(() => {
    void loadBrands(selectedMfr?.id);
    setSelectedBrand(null);
    setSelectedModel(null);
  }, [selectedMfr?.id, loadBrands]);

  useEffect(() => {
    const filters: { feed_type_id?: string; manufacturer_id?: string; brand_id?: string } = {};
    if (selectedType) filters.feed_type_id = selectedType.id;
    if (selectedMfr) filters.manufacturer_id = selectedMfr.id;
    if (selectedBrand) filters.brand_id = selectedBrand.id;
    void loadModels(filters);
    setSelectedModel(null);
  }, [selectedType?.id, selectedMfr?.id, selectedBrand?.id, loadModels]);

  function flash(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  }

  async function buildTranslations(ko: string): Promise<Record<string, string>> {
    const base = ko.trim();
    const result = await api.i18n.translate(base, { ko: base });
    return { ...result.translations, ko: base };
  }

  async function handleSave() {
    if (!modal) return;
    setSaving(true);
    setError('');
    try {
      const { target, mode, id } = modal;
      if (target === 'manufacturer') {
        if (!mfrForm.name_ko) throw new Error(t('admin.feed.err_name_ko_required', '한국어 이름을 입력해주세요.'));
        const translations = await buildTranslations(mfrForm.name_ko);
        const parentTypeIds = mfrParentTypeIds.length > 0
          ? mfrParentTypeIds
          : (selectedType ? [selectedType.id] : []);
        const payload = {
          name_ko: mfrForm.name_ko,
          country: mfrForm.country || undefined,
          sort_order: parseInt(mfrForm.sort_order, 10) || 0,
          parent_type_ids: parentTypeIds,
          translations,
        };
        if (mode === 'create') await api.feedCatalog.manufacturers.create(payload);
        else if (id) await api.feedCatalog.manufacturers.update(id, payload);
        await loadManufacturers(selectedType?.id);
      }

      if (target === 'brand') {
        if (!brandForm.name_ko) throw new Error(t('admin.feed.err_name_ko_required', '한국어 이름을 입력해주세요.'));
        if (!selectedMfr && mode === 'create') throw new Error(t('admin.feed.select_manufacturer', '제조사를 먼저 선택하세요.'));
        const translations = await buildTranslations(brandForm.name_ko);
        const manufacturerIds = brandParentMfrIds.length > 0
          ? brandParentMfrIds
          : (selectedMfr ? [selectedMfr.id] : []);
        if (mode === 'create' && selectedMfr) {
          await api.feedCatalog.brands.create({
            manufacturer_id: selectedMfr.id,
            manufacturer_ids: manufacturerIds,
            name_ko: brandForm.name_ko,
            translations,
          });
        } else if (id) {
          await api.feedCatalog.brands.update(id, {
            name_ko: brandForm.name_ko,
            manufacturer_ids: manufacturerIds,
            translations,
          });
        }
        await loadBrands(selectedMfr?.id);
      }

      if (target === 'model') {
        if (!modelForm.name_ko) throw new Error(t('admin.feed.err_name_ko_required', '한국어 이름을 입력해주세요.'));
        const translations = await buildTranslations(modelForm.name_ko);
        const brandIds = modelParentBrandIds.length > 0
          ? modelParentBrandIds
          : (selectedBrand ? [selectedBrand.id] : []);
        if (mode === 'create' && selectedType && selectedMfr) {
          await api.feedCatalog.models.create({
            feed_type_id: selectedType.id,
            manufacturer_id: selectedMfr.id,
            brand_id: selectedBrand?.id,
            brand_ids: brandIds,
            model_name: modelForm.name_ko,
            name_ko: modelForm.name_ko,
            translations,
            model_code: modelForm.model_code || undefined,
            description: modelForm.description || undefined,
          });
        } else if (id) {
          await api.feedCatalog.models.update(id, {
            feed_type_id: selectedType?.id,
            model_name: modelForm.name_ko,
            name_ko: modelForm.name_ko,
            brand_ids: brandIds,
            translations,
            model_code: modelForm.model_code || undefined,
            description: modelForm.description || undefined,
          });
        }
        const filters: { feed_type_id?: string; manufacturer_id?: string; brand_id?: string } = {};
        if (selectedType) filters.feed_type_id = selectedType.id;
        if (selectedMfr) filters.manufacturer_id = selectedMfr.id;
        if (selectedBrand) filters.brand_id = selectedBrand.id;
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
        await loadManufacturers(selectedType?.id);
      }
      if (target === 'brand') {
        await api.feedCatalog.brands.delete(id);
        await loadBrands(selectedMfr?.id);
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

  function StatusBadge({ status }: { status: string }) {
    return <span className={`badge ${status === 'active' ? 'badge-green' : 'badge-gray'}`}>{status === 'active' ? t('admin.master.active') : t('admin.master.inactive')}</span>;
  }

  function Col({ title, onAdd, children }: { title: string; onAdd?: () => void; children: React.ReactNode }) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-title">{title}</div>
          {onAdd && <button className="btn btn-primary btn-sm" onClick={onAdd}>+ {t('admin.master.btn_add')}</button>}
        </div>
        <div className="master-column-list">{children}</div>
      </div>
    );
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">{t('admin.feed.title', '사료 관리')}</div>
      </div>
      <div className="content">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <div className="alert" style={{ marginBottom: 12 }}>{t('admin.feed.guide', '사료유형은 식단유형 L3(diet_feed_type) 마스터를 참조합니다.')}</div>

        <div className="master-explorer-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
          <Col title={t('admin.feed.types', '사료유형 (L3)')}>
            {types.length === 0 && <div className="master-empty">{t('admin.feed.empty', '데이터가 없습니다.')}</div>}
            {types.map((item) => (
              <button
                key={item.id}
                className={`master-row-btn ${selectedType?.id === item.id ? 'active' : ''}`}
                onClick={() => { setSelectedType(item); setSelectedMfr(null); setSelectedBrand(null); setSelectedModel(null); }}
              >
                <div>
                  <div className="master-row-title">{typeLabel(item)}</div>
                </div>
                <StatusBadge status={item.status} />
              </button>
            ))}
          </Col>

          <Col title={t('admin.feed.manufacturers', '제조사')} onAdd={() => { setMfrForm({ name_ko: '', country: '', sort_order: '0' }); setMfrParentTypeIds(selectedType ? [selectedType.id] : []); setModal({ target: 'manufacturer', mode: 'create' }); }}>
            {manufacturers.length === 0 && <div className="master-empty">{t('admin.feed.empty', '데이터가 없습니다.')}</div>}
            {manufacturers.map((item) => (
              <button key={item.id} className={`master-row-btn ${selectedMfr?.id === item.id ? 'active' : ''}`} onClick={() => { setSelectedMfr(item); setSelectedBrand(null); setSelectedModel(null); }}>
                <div>
                  <div className="master-row-title">{mfrLabel(item)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.country ?? emptyLabel}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                  <StatusBadge status={item.status} />
                  <button className="btn btn-secondary btn-sm" style={{ fontSize: 10, padding: '1px 6px' }} onClick={(e) => { e.stopPropagation(); setMfrForm({ name_ko: item.name_ko || '', country: item.country || '', sort_order: String(item.sort_order || 0) }); setMfrParentTypeIds((item.parent_type_ids || '').split(',').map((v) => v.trim()).filter(Boolean)); setModal({ target: 'manufacturer', mode: 'edit', id: item.id }); }}>{t('admin.master.btn_edit')}</button>
                </div>
              </button>
            ))}
          </Col>

          <Col title={t('admin.feed.brands', '브랜드')} onAdd={() => {
            if (!selectedMfr) return setError(t('admin.feed.select_manufacturer', '제조사를 먼저 선택하세요.'));
            setBrandForm({ name_ko: '' });
            setBrandParentMfrIds([selectedMfr.id]);
            setModal({ target: 'brand', mode: 'create' });
          }}>
            {!selectedMfr && <div className="master-empty">{t('admin.feed.select_manufacturer', '제조사를 먼저 선택하세요.')}</div>}
            {selectedMfr && brands.length === 0 && <div className="master-empty">{t('admin.feed.empty', '데이터가 없습니다.')}</div>}
            {selectedMfr && brands.map((item) => (
              <button key={item.id} className={`master-row-btn ${selectedBrand?.id === item.id ? 'active' : ''}`} onClick={() => { setSelectedBrand(item); setSelectedModel(null); }}>
                <div>
                  <div className="master-row-title">{brandLabel(item)}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                  <StatusBadge status={item.status} />
                  <button className="btn btn-secondary btn-sm" style={{ fontSize: 10, padding: '1px 6px' }} onClick={(e) => { e.stopPropagation(); setBrandForm({ name_ko: item.name_ko }); setBrandParentMfrIds((item.parent_manufacturer_ids || '').split(',').map((v) => v.trim()).filter(Boolean)); setModal({ target: 'brand', mode: 'edit', id: item.id }); }}>{t('admin.master.btn_edit')}</button>
                </div>
              </button>
            ))}
          </Col>

          <Col title={t('admin.feed.models', '사료모델')} onAdd={() => {
            if (!selectedType) return setError(t('admin.feed.select_type', '사료유형을 먼저 선택하세요.'));
            if (!selectedMfr) return setError(t('admin.feed.select_manufacturer', '제조사를 먼저 선택하세요.'));
            setModelForm({ name_ko: '', model_code: '', description: '' });
            setModelParentBrandIds(selectedBrand ? [selectedBrand.id] : []);
            setModal({ target: 'model', mode: 'create' });
          }}>
            {!selectedType && <div className="master-empty">{t('admin.feed.select_type', '사료유형을 먼저 선택하세요.')}</div>}
            {selectedType && models.length === 0 && <div className="master-empty">{t('admin.feed.empty', '데이터가 없습니다.')}</div>}
            {selectedType && models.map((item) => (
              <button key={item.id} className={`master-row-btn ${selectedModel?.id === item.id ? 'active' : ''}`} onClick={() => setSelectedModel(item)}>
                <div>
                  <div className="master-row-title">{modelLabel(item)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {item.model_code || emptyLabel}
                    {' · '}
                    {item.mfr_display_label || item.mfr_name_en || item.mfr_name_ko || emptyLabel}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                  <StatusBadge status={item.status} />
                  <button className="btn btn-secondary btn-sm" style={{ fontSize: 10, padding: '1px 6px' }} onClick={(e) => { e.stopPropagation(); setModelForm({ name_ko: item.model_name, model_code: item.model_code ?? '', description: item.description ?? '' }); setModelParentBrandIds((item.parent_brand_ids || '').split(',').map((v) => v.trim()).filter(Boolean)); setModal({ target: 'model', mode: 'edit', id: item.id }); }}>{t('admin.master.btn_edit')}</button>
                </div>
              </button>
            ))}
          </Col>
        </div>

        {selectedModel && (
          <div className="card" style={{ marginTop: 12 }}>
            <div className="card-header">
              <div className="card-title">{selectedModel.model_display_label || selectedModel.model_name}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setModal({ target: 'model', mode: 'edit', id: selectedModel.id })}>{t('admin.master.btn_edit')}</button>
                <button className="btn btn-danger btn-sm" onClick={() => void handleDelete('model', selectedModel.id)}>{t('admin.master.btn_delete')}</button>
              </div>
            </div>
            <div style={{ padding: '8px 12px', fontSize: 13, color: 'var(--text-muted)' }}>
              <div>{t('admin.feed.type', '사료유형')}: {selectedModel.type_display_label || selectedModel.type_name_en || selectedModel.type_name_ko || emptyLabel}</div>
              <div>{t('admin.feed.manufacturer', '제조사')}: {selectedModel.mfr_display_label || selectedModel.mfr_name_en || selectedModel.mfr_name_ko || emptyLabel}</div>
              <div>{t('admin.feed.brand', '브랜드')}: {selectedModel.brand_display_label || selectedModel.brand_name_en || selectedModel.brand_name_ko || emptyLabel}</div>
              {selectedModel.model_code && <div>{t('admin.feed.model_code', '모델코드')}: {selectedModel.model_code}</div>}
              {selectedModel.description && <div>{t('admin.feed.description', '설명')}: {selectedModel.description}</div>}
            </div>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <div className="modal-title">
                {modal.mode === 'create' ? t('admin.master.btn_add') : t('admin.master.btn_edit')} {' / '}
                {modal.target === 'manufacturer' && t('admin.feed.manufacturers', '제조사')}
                {modal.target === 'brand' && t('admin.feed.brands', '브랜드')}
                {modal.target === 'model' && t('admin.feed.models', '사료모델')}
              </div>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-error" style={{ marginBottom: 8 }}>{error}</div>}

              {modal.target === 'manufacturer' && (
                <>
                  <div className="form-group">
                    <label className="form-label">{t('admin.feed.name_ko', '한국어 이름')} *</label>
                    <input className="form-input" value={mfrForm.name_ko} onChange={(e) => setMfrForm((f) => ({ ...f, name_ko: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.feed.type', '사료유형')}</label>
                    <div style={{ display: 'grid', gap: 6, maxHeight: 140, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
                      {types.map((row) => (
                        <label key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                          <input
                            type="checkbox"
                            checked={mfrParentTypeIds.includes(row.id)}
                            onChange={(e) => setMfrParentTypeIds((prev) => e.target.checked ? [...new Set([...prev, row.id])] : prev.filter((id) => id !== row.id))}
                          />
                          <span>{typeLabel(row)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.feed.country', '국가')}</label>
                    <input className="form-input" value={mfrForm.country} onChange={(e) => setMfrForm((f) => ({ ...f, country: e.target.value }))} placeholder={t('admin.feed.country_placeholder', '국가 코드 (예: KR)')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.master.field_sort')}</label>
                    <input className="form-input" type="number" value={mfrForm.sort_order} onChange={(e) => setMfrForm((f) => ({ ...f, sort_order: e.target.value }))} />
                  </div>
                </>
              )}

              {modal.target === 'brand' && (
                <>
                  <div className="form-group">
                    <label className="form-label">{t('admin.feed.manufacturer', '제조사')}</label>
                    <input className="form-input" value={mfrLabel(selectedMfr)} readOnly />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.feed.name_ko', '한국어 이름')} *</label>
                    <input className="form-input" value={brandForm.name_ko} onChange={(e) => setBrandForm((f) => ({ ...f, name_ko: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.feed.manufacturer', '제조사')}</label>
                    <div style={{ display: 'grid', gap: 6, maxHeight: 140, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
                      {manufacturers.map((row) => (
                        <label key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                          <input
                            type="checkbox"
                            checked={brandParentMfrIds.includes(row.id)}
                            onChange={(e) => setBrandParentMfrIds((prev) => e.target.checked ? [...new Set([...prev, row.id])] : prev.filter((id) => id !== row.id))}
                          />
                          <span>{mfrLabel(row)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {modal.target === 'model' && (
                <>
                  <div className="form-group">
                    <label className="form-label">{t('admin.feed.type', '사료유형')}</label>
                    <input className="form-input" value={typeLabel(selectedType)} readOnly />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.feed.manufacturer', '제조사')}</label>
                    <input className="form-input" value={mfrLabel(selectedMfr)} readOnly />
                  </div>
                  {selectedBrand && (
                    <div className="form-group">
                      <label className="form-label">{t('admin.feed.brand', '브랜드')}</label>
                      <input className="form-input" value={brandLabel(selectedBrand)} readOnly />
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">{t('admin.feed.name_ko', '한국어 이름')} *</label>
                    <input className="form-input" value={modelForm.name_ko} onChange={(e) => setModelForm((f) => ({ ...f, name_ko: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.feed.brand', '브랜드')}</label>
                    <div style={{ display: 'grid', gap: 6, maxHeight: 140, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
                      {brands.map((row) => (
                        <label key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                          <input
                            type="checkbox"
                            checked={modelParentBrandIds.includes(row.id)}
                            onChange={(e) => setModelParentBrandIds((prev) => e.target.checked ? [...new Set([...prev, row.id])] : prev.filter((id) => id !== row.id))}
                          />
                          <span>{brandLabel(row)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.feed.model_code', '모델코드')}</label>
                    <input className="form-input font-mono" value={modelForm.model_code} onChange={(e) => setModelForm((f) => ({ ...f, model_code: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.feed.description', '설명')}</label>
                    <input className="form-input" value={modelForm.description} onChange={(e) => setModelForm((f) => ({ ...f, description: e.target.value }))} />
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              {modal.mode === 'edit' && modal.id && (
                <button className="btn btn-danger" style={{ marginRight: 'auto' }} onClick={() => void handleDelete(modal.target, modal.id!).then(() => setModal(null))}>
                  {t('admin.master.btn_delete')}
                </button>
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
