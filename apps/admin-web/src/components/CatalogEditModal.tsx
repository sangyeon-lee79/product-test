import type { FeedType, FeedManufacturer, FeedBrand } from '../lib/api';
import { itemLabel } from '../lib/catalogUtils';
import { autoTranslate } from '../lib/catalogUtils';
import { TranslationFields } from './TranslationFields';

interface CatalogEditModalProps {
  modal: { target: 'manufacturer' | 'brand' | 'model'; mode: 'create' | 'edit'; id?: string };
  onClose: () => void;
  onSave: () => void;
  onDelete: (target: 'manufacturer' | 'brand' | 'model', id: string) => Promise<void>;
  saving: boolean;
  translating: boolean;
  error: string;
  t: (key: string, fallback?: string) => string;
  // i18n labels
  i18n: { type: string; manufacturer: string; brand: string; manufacturers: string; brands: string; models: string };
  // Data
  types: FeedType[];
  manufacturers: FeedManufacturer[];
  brands: FeedBrand[];
  // Manufacturer form
  mfrForm: { key: string; country: string; sort_order: string };
  setMfrForm: React.Dispatch<React.SetStateAction<{ key: string; country: string; sort_order: string }>>;
  mfrTrans: Record<string, string>;
  setMfrTrans: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  mfrParentTypeIds: string[];
  setMfrParentTypeIds: React.Dispatch<React.SetStateAction<string[]>>;
  // Brand form
  brandForm: { key: string; sort_order: string };
  setBrandForm: React.Dispatch<React.SetStateAction<{ key: string; sort_order: string }>>;
  brandTrans: Record<string, string>;
  setBrandTrans: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  brandParentTypeIds: string[];
  setBrandParentTypeIds: React.Dispatch<React.SetStateAction<string[]>>;
  brandParentMfrIds: string[];
  setBrandParentMfrIds: React.Dispatch<React.SetStateAction<string[]>>;
  // Model form
  modelForm: { key: string; sort_order: string; model_code: string; description: string };
  setModelForm: React.Dispatch<React.SetStateAction<{ key: string; sort_order: string; model_code: string; description: string }>>;
  modelTrans: Record<string, string>;
  setModelTrans: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  modelParentTypeIds: string[];
  setModelParentTypeIds: React.Dispatch<React.SetStateAction<string[]>>;
  modelParentMfrId: string;
  setModelParentMfrId: React.Dispatch<React.SetStateAction<string>>;
  modelParentBrandIds: string[];
  setModelParentBrandIds: React.Dispatch<React.SetStateAction<string[]>>;
  // For model form: reload brands when manufacturer changes
  selectedType: FeedType | null;
  loadBrands: (mfrId?: string, typeId?: string) => Promise<void>;
  setTranslating: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string>>;
}

export function CatalogEditModal(props: CatalogEditModalProps) {
  const {
    modal, onClose, onSave, onDelete, saving, translating, error, t, i18n,
    types, manufacturers, brands,
    mfrForm, setMfrForm, mfrTrans, setMfrTrans, mfrParentTypeIds, setMfrParentTypeIds,
    brandForm, setBrandForm, brandTrans, setBrandTrans, brandParentTypeIds, setBrandParentTypeIds, brandParentMfrIds, setBrandParentMfrIds,
    modelForm, setModelForm, modelTrans, setModelTrans, modelParentTypeIds, setModelParentTypeIds, modelParentMfrId, setModelParentMfrId, modelParentBrandIds, setModelParentBrandIds,
    selectedType, loadBrands, setTranslating, setError,
  } = props;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 460 }}>
        <div className="modal-header">
          <div className="modal-title">
            {modal.mode === 'create' ? t('admin.master.btn_add') : t('admin.master.btn_edit')} {' — '}
            {modal.target === 'manufacturer' && i18n.manufacturers}
            {modal.target === 'brand' && i18n.brands}
            {modal.target === 'model' && i18n.models}
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {error && <div className="alert alert-error" style={{ marginBottom: 8 }}>{error}</div>}

          {modal.target === 'manufacturer' && (
            <>
              <div className="form-group">
                <label className="form-label">{i18n.type} *</label>
                <div style={{ display: 'grid', gap: 6, maxHeight: 140, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
                  {types.map(row => (
                    <label key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                      <input type="checkbox" checked={mfrParentTypeIds.includes(row.id)} onChange={e => setMfrParentTypeIds(prev => e.target.checked ? [...new Set([...prev, row.id])] : prev.filter(id => id !== row.id))} />
                      <span>{itemLabel(row)}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin.master.field_key')}</label>
                {modal.mode === 'create' ? (
                  <input className="form-input font-mono" value={mfrForm.key} onChange={e => setMfrForm(f => ({ ...f, key: e.target.value }))} placeholder={t('admin.master.ph_key')} />
                ) : (
                  <input className="form-input font-mono" value={mfrForm.key} readOnly />
                )}
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin.master.field_sort')}</label>
                <input className="form-input" type="number" value={mfrForm.sort_order} onChange={e => setMfrForm(f => ({ ...f, sort_order: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin.feed.country')}</label>
                <input className="form-input" value={mfrForm.country} onChange={e => setMfrForm(f => ({ ...f, country: e.target.value }))} placeholder="US" />
              </div>
              <TranslationFields translations={mfrTrans} onChange={setMfrTrans} translating={translating} onAutoTranslate={() => void autoTranslate(mfrTrans.ko, mfrTrans, setMfrTrans, setTranslating, setError)} t={t} />
            </>
          )}

          {modal.target === 'brand' && (
            <>
              <div className="form-group">
                <label className="form-label">{i18n.type} *</label>
                <div style={{ display: 'grid', gap: 6, maxHeight: 140, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
                  {types.map(row => (
                    <label key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                      <input type="checkbox" checked={brandParentTypeIds.includes(row.id)} onChange={e => setBrandParentTypeIds(prev => e.target.checked ? [...new Set([...prev, row.id])] : prev.filter(id => id !== row.id))} />
                      <span>{itemLabel(row)}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{i18n.manufacturer} *</label>
                <div style={{ display: 'grid', gap: 6, maxHeight: 140, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
                  {manufacturers.map(row => (
                    <label key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                      <input type="checkbox" checked={brandParentMfrIds.includes(row.id)} onChange={e => setBrandParentMfrIds(prev => e.target.checked ? [...new Set([...prev, row.id])] : prev.filter(id => id !== row.id))} />
                      <span>{itemLabel(row)}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin.master.field_key')}</label>
                {modal.mode === 'create' ? (
                  <input className="form-input font-mono" value={brandForm.key} onChange={e => setBrandForm(f => ({ ...f, key: e.target.value }))} placeholder={t('admin.master.ph_key')} />
                ) : (
                  <input className="form-input font-mono" value={brandForm.key} readOnly />
                )}
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin.master.field_sort')}</label>
                <input className="form-input" type="number" value={brandForm.sort_order} onChange={e => setBrandForm(f => ({ ...f, sort_order: e.target.value }))} />
              </div>
              <TranslationFields translations={brandTrans} onChange={setBrandTrans} translating={translating} onAutoTranslate={() => void autoTranslate(brandTrans.ko, brandTrans, setBrandTrans, setTranslating, setError)} t={t} />
            </>
          )}

          {modal.target === 'model' && (
            <>
              <div className="form-group">
                <label className="form-label">{i18n.type} *</label>
                <div style={{ display: 'grid', gap: 6, maxHeight: 120, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
                  {types.map(row => (
                    <label key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                      <input type="checkbox" checked={modelParentTypeIds.includes(row.id)} onChange={e => setModelParentTypeIds(prev => e.target.checked ? [...new Set([...prev, row.id])] : prev.filter(id => id !== row.id))} />
                      <span>{itemLabel(row)}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{i18n.manufacturer} *</label>
                <select
                  className="form-input"
                  value={modelParentMfrId}
                  onChange={e => {
                    const mfrId = e.target.value;
                    setModelParentMfrId(mfrId);
                    setModelParentBrandIds([]);
                    if (mfrId) void loadBrands(mfrId, selectedType?.id);
                  }}
                >
                  <option value="">{t('admin.feed.select_manufacturer')}</option>
                  {manufacturers.map(row => <option key={row.id} value={row.id}>{itemLabel(row)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{i18n.brand} *</label>
                <div style={{ display: 'grid', gap: 6, maxHeight: 120, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
                  {brands.map(row => (
                    <label key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                      <input type="checkbox" checked={modelParentBrandIds.includes(row.id)} onChange={e => setModelParentBrandIds(prev => e.target.checked ? [...new Set([...prev, row.id])] : prev.filter(id => id !== row.id))} />
                      <span>{itemLabel(row)}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin.master.field_key')}</label>
                {modal.mode === 'create' ? (
                  <input className="form-input font-mono" value={modelForm.key} onChange={e => setModelForm(f => ({ ...f, key: e.target.value }))} placeholder={t('admin.master.ph_key')} />
                ) : (
                  <input className="form-input font-mono" value={modelForm.key} readOnly />
                )}
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin.master.field_sort')}</label>
                <input className="form-input" type="number" value={modelForm.sort_order} onChange={e => setModelForm(f => ({ ...f, sort_order: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin.feed.model_code')}</label>
                <input className="form-input font-mono" value={modelForm.model_code} onChange={e => setModelForm(f => ({ ...f, model_code: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin.feed.description')}</label>
                <input className="form-input" value={modelForm.description} onChange={e => setModelForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <TranslationFields translations={modelTrans} onChange={setModelTrans} translating={translating} onAutoTranslate={() => void autoTranslate(modelTrans.ko, modelTrans, setModelTrans, setTranslating, setError)} t={t} />
            </>
          )}
        </div>
        <div className="modal-footer">
          {modal.mode === 'edit' && modal.id && (
            <button className="btn btn-danger" style={{ marginRight: 'auto' }} title={t('common.delete', 'Delete')} aria-label={t('common.delete', 'Delete')} onClick={() => void onDelete(modal.target, modal.id!).then(onClose)}>&#128465;</button>
          )}
          <button className="btn" onClick={onClose}>{t('common.cancel', 'Cancel')}</button>
          <button className="btn btn-primary" disabled={saving} onClick={onSave}>
            {saving ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
          </button>
        </div>
      </div>
    </div>
  );
}
