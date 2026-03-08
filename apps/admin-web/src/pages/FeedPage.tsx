import { useEffect, useState, useCallback } from 'react';
import { api, type FeedType, type FeedManufacturer, type FeedBrand, type FeedModel, type I18nRow } from '../lib/api';
import { useI18n, useT, SUPPORTED_LANGS, LANG_LABELS } from '../lib/i18n';

type ModalTarget = 'manufacturer' | 'brand' | 'model';
const emptyTrans = () => Object.fromEntries(SUPPORTED_LANGS.map((l) => [l, ''])) as Record<string, string>;

function findMissingTranslationLangs(translations: Record<string, string>): string[] {
  return SUPPORTED_LANGS.filter((lang) => !(translations[lang] || '').trim());
}

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
  const [translating, setTranslating] = useState(false);

  const [mfrForm, setMfrForm] = useState({ key: '', country: '', sort_order: '0' });
  const [mfrTrans, setMfrTrans] = useState<Record<string, string>>(emptyTrans());
  const [brandForm, setBrandForm] = useState({ key: '', sort_order: '0' });
  const [brandTrans, setBrandTrans] = useState<Record<string, string>>(emptyTrans());
  const [modelForm, setModelForm] = useState({ key: '', sort_order: '0', model_code: '', description: '' });
  const [modelTrans, setModelTrans] = useState<Record<string, string>>(emptyTrans());
  const [mfrParentTypeIds, setMfrParentTypeIds] = useState<string[]>([]);
  const [brandParentTypeIds, setBrandParentTypeIds] = useState<string[]>([]);
  const [brandParentMfrIds, setBrandParentMfrIds] = useState<string[]>([]);
  const [modelParentTypeIds, setModelParentTypeIds] = useState<string[]>([]);
  const [modelParentMfrId, setModelParentMfrId] = useState<string>('');
  const [modelParentBrandIds, setModelParentBrandIds] = useState<string[]>([]);

  const typeLabel = (item?: FeedType | null): string => {
    if (!item) return '-';
    const display = (item.display_label || '').trim();
    if (display) return display;
    return item.name_en || item.name_ko || item.key || '-';
  };

  const mfrLabel = (item?: FeedManufacturer | null): string => {
    if (!item) return '-';
    const display = (item.display_label || '').trim();
    if (display) return display;
    return item.name_en || item.name_ko || item.key || '-';
  };

  const loadTypes = useCallback(async () => {
    try {
      setTypes(await api.feedCatalog.types.list(lang));
    } catch (e) {
      setError(String(e));
    }
  }, [lang]);

  const loadManufacturers = useCallback(async (typeId?: string) => {
    try {
      setManufacturers(await api.feedCatalog.manufacturers.list(lang, typeId));
    } catch (e) {
      setError(String(e));
    }
  }, [lang]);

  const loadBrands = useCallback(async (mfrId?: string) => {
    try {
      setBrands(await api.feedCatalog.brands.list(mfrId));
    } catch (e) {
      setError(String(e));
    }
  }, []);

  const loadModels = useCallback(async (filters?: { feed_type_id?: string; manufacturer_id?: string; brand_id?: string }) => {
    try {
      setModels(await api.feedCatalog.models.list(filters));
    } catch (e) {
      setError(String(e));
    }
  }, []);

  useEffect(() => {
    void loadTypes();
  }, [loadTypes]);

  useEffect(() => {
    if (!selectedType) {
      setManufacturers([]);
      setSelectedMfr(null);
      setSelectedBrand(null);
      setSelectedModel(null);
      return;
    }
    void loadManufacturers(selectedType.id);
    setSelectedMfr(null);
    setSelectedBrand(null);
    setSelectedModel(null);
  }, [selectedType, loadManufacturers]);

  useEffect(() => {
    if (!selectedMfr) {
      setBrands([]);
      setSelectedBrand(null);
      setSelectedModel(null);
      return;
    }
    void loadBrands(selectedMfr.id);
    setSelectedBrand(null);
    setSelectedModel(null);
  }, [selectedMfr, loadBrands]);

  useEffect(() => {
    if (!selectedType || !selectedMfr || !selectedBrand) {
      setModels([]);
      setSelectedModel(null);
      return;
    }
    const filters: { feed_type_id?: string; manufacturer_id?: string; brand_id?: string } = {
      feed_type_id: selectedType.id,
      manufacturer_id: selectedMfr.id,
      brand_id: selectedBrand.id,
    };
    void loadModels(filters);
    setSelectedModel(null);
  }, [selectedType, selectedMfr, selectedBrand, loadModels]);

  function flash(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  }

  function manufacturerToTranslations(item: FeedManufacturer): Record<string, string> {
    return {
      ...emptyTrans(),
      ko: item.name_ko || '',
      en: item.name_en || '',
    };
  }

  function brandToTranslations(item: FeedBrand): Record<string, string> {
    return {
      ...emptyTrans(),
      ko: item.name_ko || '',
      en: item.name_en || '',
    };
  }

  function modelToTranslations(item: FeedModel): Record<string, string> {
    return {
      ...emptyTrans(),
      ko: item.model_name || '',
      en: item.model_name || '',
    };
  }

  function i18nRowToTranslations(row: I18nRow): Record<string, string> {
    return {
      ko: row.ko ?? '',
      en: row.en ?? '',
      ja: row.ja ?? '',
      zh_cn: row.zh_cn ?? '',
      zh_tw: row.zh_tw ?? '',
      es: row.es ?? '',
      fr: row.fr ?? '',
      de: row.de ?? '',
      pt: row.pt ?? '',
      vi: row.vi ?? '',
      th: row.th ?? '',
      id_lang: row.id_lang ?? '',
      ar: row.ar ?? '',
    };
  }

  async function autoTranslate(koText: string, current: Record<string, string>, setTrans: (t: Record<string, string>) => void) {
    if (!koText) return;
    setTranslating(true);
    try {
      const result = await api.i18n.translate(koText, current);
      const merged: Record<string, string> = { ...current, ko: koText };
      for (const langCode of SUPPORTED_LANGS) {
        if (langCode === 'ko') continue;
        if ((current[langCode] || '').trim()) continue;
        const translated = result.translations[langCode];
        if (translated) merged[langCode] = translated;
      }
      setTrans(merged);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setTranslating(false);
    }
  }

  function openCreateMfr() {
    setMfrForm({ key: '', country: '', sort_order: '0' });
    setMfrTrans(emptyTrans());
    setMfrParentTypeIds(selectedType ? [selectedType.id] : []);
    setModal({ target: 'manufacturer', mode: 'create' });
  }

  function openEditMfr(item: FeedManufacturer) {
    const fallback = manufacturerToTranslations(item);
    setMfrForm({ key: item.key || '', country: item.country || '', sort_order: String(item.sort_order || 0) });
    setMfrTrans(fallback);
    setMfrParentTypeIds((item.parent_type_ids || '').split(',').map((v) => v.trim()).filter(Boolean));
    setModal({ target: 'manufacturer', mode: 'edit', id: item.id });
    if (item.name_key) {
      void api.i18n.list({ prefix: item.name_key, limit: 50 }).then((res) => {
        const row = res.items.find((it) => it.key === item.name_key);
        if (row) setMfrTrans(i18nRowToTranslations(row));
      }).catch(() => {});
    }
  }

  function openCreateBrand() {
    setBrandForm({ key: '', sort_order: '0' });
    setBrandTrans(emptyTrans());
    setBrandParentTypeIds(selectedType ? [selectedType.id] : []);
    setBrandParentMfrIds(selectedMfr ? [selectedMfr.id] : []);
    if (manufacturers.length === 0) void loadManufacturers();
    setModal({ target: 'brand', mode: 'create' });
  }

  function openEditBrand(item: FeedBrand) {
    setBrandForm({ key: item.key || '', sort_order: String(item.sort_order || 0) });
    setBrandTrans(brandToTranslations(item));
    setBrandParentTypeIds((item.parent_type_ids || '').split(',').map((v) => v.trim()).filter(Boolean));
    const parentIds = (item.parent_mfr_ids || '').split(',').map((v) => v.trim()).filter(Boolean);
    setBrandParentMfrIds(parentIds.length > 0 ? parentIds : selectedMfr ? [selectedMfr.id] : []);
    setModal({ target: 'brand', mode: 'edit', id: item.id });
    if (item.name_key) {
      void api.i18n.list({ prefix: item.name_key, limit: 50 }).then((res) => {
        const row = res.items.find((it) => it.key === item.name_key);
        if (row) setBrandTrans(i18nRowToTranslations(row));
      }).catch(() => {});
    }
    if (manufacturers.length === 0) void loadManufacturers();
  }

  function openCreateModel() {
    setModelForm({ key: '', sort_order: '0', model_code: '', description: '' });
    setModelTrans(emptyTrans());
    setModelParentTypeIds(selectedType ? [selectedType.id] : []);
    setModelParentMfrId(selectedMfr?.id || '');
    setModelParentBrandIds(selectedBrand ? [selectedBrand.id] : []);
    if (manufacturers.length === 0) void loadManufacturers();
    setModal({ target: 'model', mode: 'create' });
  }

  function openEditModel(item: FeedModel) {
    setModelForm({ key: item.key || '', sort_order: String(item.sort_order || 0), model_code: item.model_code ?? '', description: item.description ?? '' });
    setModelTrans(modelToTranslations(item));
    setModelParentTypeIds((item.parent_type_ids || '').split(',').map((v) => v.trim()).filter(Boolean));
    setModelParentMfrId(item.manufacturer_id || selectedMfr?.id || '');
    const parentIds = (item.parent_brand_ids || '').split(',').map((v) => v.trim()).filter(Boolean);
    setModelParentBrandIds(parentIds.length > 0 ? parentIds : selectedBrand ? [selectedBrand.id] : []);
    setModal({ target: 'model', mode: 'edit', id: item.id });
    if (item.name_key) {
      void api.i18n.list({ prefix: item.name_key, limit: 50 }).then((res) => {
        const row = res.items.find((it) => it.key === item.name_key);
        if (row) setModelTrans(i18nRowToTranslations(row));
      }).catch(() => {});
    }
    if (item.manufacturer_id) void loadBrands(item.manufacturer_id);
    else if (manufacturers.length === 0) void loadManufacturers();
  }

  async function handleSave() {
    if (!modal) return;
    setSaving(true);
    setError('');
    try {
      const { target, mode, id } = modal;
      if (target === 'manufacturer') {
        if (mfrParentTypeIds.length === 0) throw new Error(t('admin.master.err_required'));
        const ko = (mfrTrans.ko || '').trim();
        if (!ko) throw new Error(t('admin.master.err_required'));
        const key = (mfrForm.key || '').trim().replace(/^master\./, '');
        if (key && !/^[a-z0-9_]+$/.test(key)) throw new Error(t('admin.master.err_key_fmt'));
        let translations: Record<string, string> = { ...mfrTrans, ko };
        const hasMissing = SUPPORTED_LANGS.some((langCode) => langCode !== 'ko' && !(translations[langCode] || '').trim());
        if (hasMissing) {
          const result = await api.i18n.translate(ko, translations);
          translations = { ...result.translations, ...translations, ko };
        }
        const missingLangs = findMissingTranslationLangs(translations);
        if (missingLangs.length > 0) {
          throw new Error(t('admin.master.err_trans_missing').replace('{langs}', missingLangs.map((langCode) => (LANG_LABELS as Record<string, string>)[langCode] || langCode).join(', ')));
        }
        const payload = {
          key: mode === 'create' ? key || undefined : undefined,
          name_ko: ko,
          name_en: translations.en || undefined,
          country: mfrForm.country || undefined,
          sort_order: parseInt(mfrForm.sort_order, 10) || 0,
          parent_type_ids: mfrParentTypeIds,
          translations,
        };
        if (mode === 'create') await api.feedCatalog.manufacturers.create(payload);
        else if (id) await api.feedCatalog.manufacturers.update(id, payload);
        await loadManufacturers();
      }

      if (target === 'brand') {
        if (brandParentTypeIds.length === 0 || brandParentMfrIds.length === 0) throw new Error(t('admin.master.err_required'));
        const ko = (brandTrans.ko || '').trim();
        if (!ko) throw new Error(t('admin.master.err_required'));
        const key = (brandForm.key || '').trim().replace(/^master\./, '');
        if (key && !/^[a-z0-9_]+$/.test(key)) throw new Error(t('admin.master.err_key_fmt'));
        let translations: Record<string, string> = { ...brandTrans, ko };
        const hasMissing = SUPPORTED_LANGS.some((langCode) => langCode !== 'ko' && !(translations[langCode] || '').trim());
        if (hasMissing) {
          const result = await api.i18n.translate(ko, translations);
          translations = { ...result.translations, ...translations, ko };
        }
        const missingLangs = findMissingTranslationLangs(translations);
        if (missingLangs.length > 0) {
          throw new Error(t('admin.master.err_trans_missing').replace('{langs}', missingLangs.map((langCode) => (LANG_LABELS as Record<string, string>)[langCode] || langCode).join(', ')));
        }
        const payload = {
          key: mode === 'create' ? key || undefined : undefined,
          name_ko: ko,
          name_en: translations.en || undefined,
          manufacturer_id: brandParentMfrIds[0],
          manufacturer_ids: brandParentMfrIds,
          parent_type_ids: brandParentTypeIds,
          sort_order: parseInt(brandForm.sort_order, 10) || 0,
          translations,
        };
        if (mode === 'create') {
          await api.feedCatalog.brands.create(payload);
        } else if (id) {
          await api.feedCatalog.brands.update(id, payload);
        }
        await loadBrands(brandParentMfrIds[0] || selectedMfr?.id);
      }

      if (target === 'model') {
        if (modelParentTypeIds.length === 0 || !modelParentMfrId || modelParentBrandIds.length === 0) throw new Error(t('admin.master.err_required'));
        const ko = (modelTrans.ko || '').trim();
        if (!ko) throw new Error(t('admin.master.err_required'));
        const key = (modelForm.key || '').trim().replace(/^master\./, '');
        if (key && !/^[a-z0-9_]+$/.test(key)) throw new Error(t('admin.master.err_key_fmt'));
        let translations: Record<string, string> = { ...modelTrans, ko };
        const hasMissing = SUPPORTED_LANGS.some((langCode) => langCode !== 'ko' && !(translations[langCode] || '').trim());
        if (hasMissing) {
          const result = await api.i18n.translate(ko, translations);
          translations = { ...result.translations, ...translations, ko };
        }
        const missingLangs = findMissingTranslationLangs(translations);
        if (missingLangs.length > 0) {
          throw new Error(t('admin.master.err_trans_missing').replace('{langs}', missingLangs.map((langCode) => (LANG_LABELS as Record<string, string>)[langCode] || langCode).join(', ')));
        }
        const payload = {
          key: mode === 'create' ? key || undefined : undefined,
          feed_type_id: modelParentTypeIds[0],
          parent_type_ids: modelParentTypeIds,
          manufacturer_id: modelParentMfrId,
          brand_id: modelParentBrandIds[0],
          brand_ids: modelParentBrandIds,
          model_name: ko,
          name_ko: ko,
          name_en: translations.en || undefined,
          sort_order: parseInt(modelForm.sort_order, 10) || 0,
          translations,
          model_code: modelForm.model_code || undefined,
          description: modelForm.description || undefined,
        };
        if (mode === 'create') {
          await api.feedCatalog.models.create(payload);
        } else if (id) {
          await api.feedCatalog.models.update(id, payload);
        }
        const filters: { feed_type_id?: string; manufacturer_id?: string; brand_id?: string } = {};
        filters.feed_type_id = modelParentTypeIds[0] || selectedType?.id;
        filters.manufacturer_id = modelParentMfrId || selectedMfr?.id;
        filters.brand_id = modelParentBrandIds[0] || selectedBrand?.id;
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
        await loadManufacturers();
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
        <div className="topbar-title">🥣 {t('admin.feed.title')}</div>
      </div>
      <div className="content">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <div className="alert" style={{ marginBottom: 12 }}>{t('admin.feed.guide')}</div>

        <div className="master-explorer-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
          <Col title={t('admin.feed.types')}>
            {types.length === 0 && <div className="master-empty">{t('admin.feed.empty')}</div>}
            {types.map((item) => (
              <button
                key={item.id}
                className={`master-row-btn ${selectedType?.id === item.id ? 'active' : ''}`}
                onClick={() => setSelectedType(item)}
              >
                <div>
                  <div className="master-row-title">{typeLabel(item)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.key}</div>
                </div>
                <StatusBadge status={item.status} />
              </button>
            ))}
          </Col>

          <Col title={t('admin.feed.manufacturers')} onAdd={openCreateMfr}>
            {manufacturers.length === 0 && <div className="master-empty">{t('admin.feed.empty')}</div>}
            {manufacturers.map((item) => (
              <button key={item.id} className={`master-row-btn ${selectedMfr?.id === item.id ? 'active' : ''}`} onClick={() => { setSelectedMfr(item); setSelectedBrand(null); setSelectedModel(null); }}>
                <div>
                  <div className="master-row-title">{mfrLabel(item)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.country ?? ''}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                  <StatusBadge status={item.status} />
                  <button className="btn btn-secondary btn-sm" style={{ fontSize: 10, padding: '1px 6px' }} onClick={(e) => { e.stopPropagation(); openEditMfr(item); }}>{t('admin.master.btn_edit')}</button>
                </div>
              </button>
            ))}
          </Col>

          <Col title={t('admin.feed.brands')} onAdd={openCreateBrand}>
            {!selectedMfr && <div className="master-empty">{t('admin.feed.select_manufacturer')}</div>}
            {selectedMfr && brands.length === 0 && <div className="master-empty">{t('admin.feed.empty')}</div>}
            {selectedMfr && brands.map((item) => (
              <button key={item.id} className={`master-row-btn ${selectedBrand?.id === item.id ? 'active' : ''}`} onClick={() => { setSelectedBrand(item); setSelectedModel(null); }}>
                <div>
                  <div className="master-row-title">{item.display_label || item.name_en || item.name_ko}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.name_ko}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                  <StatusBadge status={item.status} />
                  <button className="btn btn-secondary btn-sm" style={{ fontSize: 10, padding: '1px 6px' }} onClick={(e) => { e.stopPropagation(); openEditBrand(item); }}>{t('admin.master.btn_edit')}</button>
                </div>
              </button>
            ))}
          </Col>

          <Col title={t('admin.feed.models')} onAdd={openCreateModel}>
            {!selectedType && <div className="master-empty">{t('admin.feed.select_type')}</div>}
            {selectedType && models.length === 0 && <div className="master-empty">{t('admin.feed.empty')}</div>}
            {selectedType && models.map((item) => (
              <button key={item.id} className={`master-row-btn ${selectedModel?.id === item.id ? 'active' : ''}`} onClick={() => setSelectedModel(item)}>
                <div>
                  <div className="master-row-title">{item.model_display_label || item.model_name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.model_code ?? ''} {item.mfr_display_label ?? item.mfr_name_en ?? ''}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                  <StatusBadge status={item.status} />
                  <button className="btn btn-secondary btn-sm" style={{ fontSize: 10, padding: '1px 6px' }} onClick={(e) => { e.stopPropagation(); openEditModel(item); }}>{t('admin.master.btn_edit')}</button>
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
                <button className="btn btn-secondary btn-sm" onClick={() => openEditModel(selectedModel)}>{t('admin.master.btn_edit')}</button>
                <button className="btn btn-danger btn-sm" onClick={() => void handleDelete('model', selectedModel.id)}>{t('admin.master.btn_delete')}</button>
              </div>
            </div>
            <div style={{ padding: '8px 12px', fontSize: 13, color: 'var(--text-muted)' }}>
              <div>{t('admin.feed.type')}: {selectedModel.type_display_label || selectedModel.type_name_en || selectedModel.type_name_ko || '—'}</div>
              <div>{t('admin.feed.manufacturer')}: {selectedModel.mfr_display_label || selectedModel.mfr_name_en || selectedModel.mfr_name_ko || '—'}</div>
              <div>{t('admin.feed.brand')}: {selectedModel.brand_display_label || selectedModel.brand_name_en || selectedModel.brand_name_ko || '—'}</div>
              {selectedModel.model_code && <div>{t('admin.feed.model_code')}: {selectedModel.model_code}</div>}
              {selectedModel.description && <div>{t('admin.feed.description')}: {selectedModel.description}</div>}
            </div>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <div className="modal-title">
                {modal.mode === 'create' ? t('admin.master.btn_add') : t('admin.master.btn_edit')} {' — '}
                {modal.target === 'manufacturer' && t('admin.feed.manufacturers')}
                {modal.target === 'brand' && t('admin.feed.brands')}
                {modal.target === 'model' && t('admin.feed.models')}
              </div>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {error && <div className="alert alert-error" style={{ marginBottom: 8 }}>{error}</div>}

              {modal.target === 'manufacturer' && (
                <>
                  <div className="form-group">
                    <label className="form-label">{t('admin.feed.type')} *</label>
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
                    <label className="form-label">{t('admin.master.field_key')}</label>
                    {modal.mode === 'create' ? (
                      <input className="form-input font-mono" value={mfrForm.key} onChange={(e) => setMfrForm((f) => ({ ...f, key: e.target.value }))} placeholder={t('admin.master.ph_key')} />
                    ) : (
                      <input className="form-input font-mono" value={mfrForm.key} readOnly />
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.master.field_sort')}</label>
                    <input className="form-input" type="number" value={mfrForm.sort_order} onChange={(e) => setMfrForm((f) => ({ ...f, sort_order: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.feed.country')}</label>
                    <input className="form-input" value={mfrForm.country} onChange={(e) => setMfrForm((f) => ({ ...f, country: e.target.value }))} placeholder="US" />
                  </div>
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{t('admin.master.btn_trans_auto')}</div>
                      <button className="btn btn-secondary btn-sm" onClick={() => void autoTranslate(mfrTrans.ko, mfrTrans, setMfrTrans)} disabled={translating || !mfrTrans.ko}>
                        {translating ? t('admin.master.loading_trans') : t('admin.master.btn_trans_auto')}
                      </button>
                    </div>
                    {SUPPORTED_LANGS.map((langCode) => (
                      <div key={langCode} className="form-group" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <label style={{ fontSize: 12, width: 110, flexShrink: 0, color: langCode === 'ko' ? 'var(--text)' : 'var(--text-muted)' }}>
                          {LANG_LABELS[langCode]}{langCode === 'ko' ? ' *' : ''}
                        </label>
                        <input className="form-input" style={{ fontSize: 13 }} value={mfrTrans[langCode] ?? ''} onChange={(e) => setMfrTrans((f) => ({ ...f, [langCode]: e.target.value }))} />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {modal.target === 'brand' && (
                <>
                  <div className="form-group">
                    <label className="form-label">{t('admin.feed.type')} *</label>
                    <div style={{ display: 'grid', gap: 6, maxHeight: 140, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
                      {types.map((row) => (
                        <label key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                          <input
                            type="checkbox"
                            checked={brandParentTypeIds.includes(row.id)}
                            onChange={(e) => setBrandParentTypeIds((prev) => e.target.checked ? [...new Set([...prev, row.id])] : prev.filter((id) => id !== row.id))}
                          />
                          <span>{typeLabel(row)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.feed.manufacturer')} *</label>
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
                  <div className="form-group">
                    <label className="form-label">{t('admin.master.field_key')}</label>
                    {modal.mode === 'create' ? (
                      <input className="form-input font-mono" value={brandForm.key} onChange={(e) => setBrandForm((f) => ({ ...f, key: e.target.value }))} placeholder={t('admin.master.ph_key')} />
                    ) : (
                      <input className="form-input font-mono" value={brandForm.key} readOnly />
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.master.field_sort')}</label>
                    <input className="form-input" type="number" value={brandForm.sort_order} onChange={(e) => setBrandForm((f) => ({ ...f, sort_order: e.target.value }))} />
                  </div>
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{t('admin.master.btn_trans_auto')}</div>
                      <button className="btn btn-secondary btn-sm" onClick={() => void autoTranslate(brandTrans.ko, brandTrans, setBrandTrans)} disabled={translating || !brandTrans.ko}>
                        {translating ? t('admin.master.loading_trans') : t('admin.master.btn_trans_auto')}
                      </button>
                    </div>
                    {SUPPORTED_LANGS.map((langCode) => (
                      <div key={langCode} className="form-group" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <label style={{ fontSize: 12, width: 110, flexShrink: 0, color: langCode === 'ko' ? 'var(--text)' : 'var(--text-muted)' }}>
                          {LANG_LABELS[langCode]}{langCode === 'ko' ? ' *' : ''}
                        </label>
                        <input className="form-input" style={{ fontSize: 13 }} value={brandTrans[langCode] ?? ''} onChange={(e) => setBrandTrans((f) => ({ ...f, [langCode]: e.target.value }))} />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {modal.target === 'model' && (
                <>
                  <div className="form-group">
                    <label className="form-label">{t('admin.feed.type')} *</label>
                    <div style={{ display: 'grid', gap: 6, maxHeight: 120, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
                      {types.map((row) => (
                        <label key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                          <input
                            type="checkbox"
                            checked={modelParentTypeIds.includes(row.id)}
                            onChange={(e) => setModelParentTypeIds((prev) => e.target.checked ? [...new Set([...prev, row.id])] : prev.filter((id) => id !== row.id))}
                          />
                          <span>{typeLabel(row)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.feed.manufacturer')} *</label>
                    <select
                      className="form-input"
                      value={modelParentMfrId}
                      onChange={(e) => {
                        const mfrId = e.target.value;
                        setModelParentMfrId(mfrId);
                        setModelParentBrandIds([]);
                        if (mfrId) void loadBrands(mfrId);
                      }}
                    >
                      <option value="">{t('admin.feed.select_manufacturer')}</option>
                      {manufacturers.map((row) => <option key={row.id} value={row.id}>{mfrLabel(row)}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.feed.brand')} *</label>
                    <div style={{ display: 'grid', gap: 6, maxHeight: 120, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
                      {brands.map((row) => (
                        <label key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                          <input
                            type="checkbox"
                            checked={modelParentBrandIds.includes(row.id)}
                            onChange={(e) => setModelParentBrandIds((prev) => e.target.checked ? [...new Set([...prev, row.id])] : prev.filter((id) => id !== row.id))}
                          />
                          <span>{row.display_label || row.name_en || row.name_ko}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.master.field_key')}</label>
                    {modal.mode === 'create' ? (
                      <input className="form-input font-mono" value={modelForm.key} onChange={(e) => setModelForm((f) => ({ ...f, key: e.target.value }))} placeholder={t('admin.master.ph_key')} />
                    ) : (
                      <input className="form-input font-mono" value={modelForm.key} readOnly />
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.master.field_sort')}</label>
                    <input className="form-input" type="number" value={modelForm.sort_order} onChange={(e) => setModelForm((f) => ({ ...f, sort_order: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.feed.model_code')}</label>
                    <input className="form-input font-mono" value={modelForm.model_code} onChange={(e) => setModelForm((f) => ({ ...f, model_code: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.feed.description')}</label>
                    <input className="form-input" value={modelForm.description} onChange={(e) => setModelForm((f) => ({ ...f, description: e.target.value }))} />
                  </div>
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{t('admin.master.btn_trans_auto')}</div>
                      <button className="btn btn-secondary btn-sm" onClick={() => void autoTranslate(modelTrans.ko, modelTrans, setModelTrans)} disabled={translating || !modelTrans.ko}>
                        {translating ? t('admin.master.loading_trans') : t('admin.master.btn_trans_auto')}
                      </button>
                    </div>
                    {SUPPORTED_LANGS.map((langCode) => (
                      <div key={langCode} className="form-group" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <label style={{ fontSize: 12, width: 110, flexShrink: 0, color: langCode === 'ko' ? 'var(--text)' : 'var(--text-muted)' }}>
                          {LANG_LABELS[langCode]}{langCode === 'ko' ? ' *' : ''}
                        </label>
                        <input className="form-input" style={{ fontSize: 13 }} value={modelTrans[langCode] ?? ''} onChange={(e) => setModelTrans((f) => ({ ...f, [langCode]: e.target.value }))} />
                      </div>
                    ))}
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
