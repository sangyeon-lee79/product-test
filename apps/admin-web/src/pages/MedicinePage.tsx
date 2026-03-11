import { api, type FeedModel } from '../lib/api';
import { itemLabel } from '../lib/catalogUtils';
import { CatalogCol, CatalogStatusBadge, CatalogModelDetail, CatalogListThumb, type ModelDetailField } from '../components/CatalogGrid';
import { CatalogEditModal } from '../components/CatalogEditModal';
import { useCatalogPage } from '../hooks/useCatalogPage';

const MEDICINE_PLACEHOLDER = '/assets/images/placeholder_medicine.svg';
const I18N = {
  type: 'admin.medicine.type', manufacturer: 'admin.medicine.manufacturer', brand: 'admin.medicine.brand',
  types: 'admin.medicine.types', manufacturers: 'admin.medicine.manufacturers', brands: 'admin.medicine.brands', models: 'admin.medicine.models',
};

function parseModelMeta(model: FeedModel): {
  administration_route?: string; dosage_unit?: string; species?: string;
  disease_tags?: Record<string, boolean>; prescribed?: boolean;
  storage_condition?: string; warnings?: string;
} {
  try { if (model.description) return JSON.parse(model.description); } catch { /* ignore */ }
  return {};
}

function StorageBadge({ condition, t }: { condition?: string; t: (k: string, f?: string) => string }) {
  if (!condition) return null;
  if (condition === 'refrigerated') return <span style={{ background: '#e0f7fa', color: '#00838f', padding: '1px 6px', borderRadius: 4, fontSize: 10, whiteSpace: 'nowrap' }}>{t('admin.medicine.refrigerated_badge', 'Refrigerated')}</span>;
  if (condition === 'frozen') return <span style={{ background: '#e3f2fd', color: '#1565c0', padding: '1px 6px', borderRadius: 4, fontSize: 10, whiteSpace: 'nowrap' }}>{t('admin.medicine.frozen_badge', 'Frozen')}</span>;
  return null;
}

export default function MedicinePage() {
  const h = useCatalogPage({ catalogApi: api.medicineCatalog, imageSubdir: 'medicine', loadStats: false });
  const { t } = h;
  const addLabel = t('admin.master.btn_add');
  function SBadge({ status }: { status: string }) { return <CatalogStatusBadge status={status} t={t} />; }

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">{t('admin.medicine.title', 'Medicine Catalog')}</div>
      </div>
      <div className="content">
        {h.error && <div className="alert alert-error">{h.error}</div>}
        {h.success && <div className="alert alert-success">{h.success}</div>}

        <div className="alert" style={{ marginBottom: 12 }}>{t('admin.medicine.guide', 'Manage medicine catalog: Type > Manufacturer > Brand > Medicine')}</div>

        <div className="master-explorer-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
          <CatalogCol title={t(I18N.types, 'Medicine Types')} sortMode={h.typeSort} onSortChange={h.setTypeSort}>
            {h.types.length === 0 && <div className="master-empty">{t('admin.feed.empty')}</div>}
            {h.types.map(item => (
              <button key={item.id} className={`master-row-btn ${h.selectedType?.id === item.id ? 'active' : ''}`} onClick={() => h.setSelectedType(item)}>
                <div>
                  <div className="master-row-title">{itemLabel(item)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.key}</div>
                </div>
                <SBadge status={item.status} />
              </button>
            ))}
          </CatalogCol>

          <CatalogCol title={t(I18N.manufacturers, 'Manufacturers')} onAdd={h.openCreateMfr} addLabel={addLabel} sortMode={h.mfrSort} onSortChange={h.setMfrSort}>
            {h.manufacturers.length === 0 && <div className="master-empty">{t('admin.feed.empty')}</div>}
            {h.manufacturers.map(item => (
              <button key={item.id} className={`master-row-btn ${h.selectedMfr?.id === item.id ? 'active' : ''}`} onClick={() => { h.setSelectedMfr(item); h.setSelectedBrand(null); h.setSelectedModel(null); }}>
                <div>
                  <div className="master-row-title">{itemLabel(item)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.country ?? ''}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                  <SBadge status={item.status} />
                  <button className="btn btn-secondary btn-sm" style={{ fontSize: 10, padding: '1px 6px' }} title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')} onClick={e => { e.stopPropagation(); h.openEditMfr(item); }}>&#9998;</button>
                </div>
              </button>
            ))}
          </CatalogCol>

          <CatalogCol title={t(I18N.brands, 'Brands')} onAdd={h.openCreateBrand} addLabel={addLabel} sortMode={h.brandSort} onSortChange={h.setBrandSort}>
            {!h.selectedMfr && <div className="master-empty">{t('admin.feed.select_manufacturer')}</div>}
            {h.selectedMfr && h.brands.length === 0 && <div className="master-empty">{t('admin.feed.empty')}</div>}
            {h.selectedMfr && h.brands.map(item => (
              <button key={item.id} className={`master-row-btn ${h.selectedBrand?.id === item.id ? 'active' : ''}`} onClick={() => { h.setSelectedBrand(item); h.setSelectedModel(null); }}>
                <div>
                  <div className="master-row-title">{itemLabel(item)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.name_ko}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                  <SBadge status={item.status} />
                  <button className="btn btn-secondary btn-sm" style={{ fontSize: 10, padding: '1px 6px' }} title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')} onClick={e => { e.stopPropagation(); h.openEditBrand(item); }}>&#9998;</button>
                </div>
              </button>
            ))}
          </CatalogCol>

          <CatalogCol title={t(I18N.models, 'Medicines')} onAdd={h.openCreateModel} addLabel={addLabel}>
            {!h.selectedType && <div className="master-empty">{t('admin.feed.select_type')}</div>}
            {h.selectedType && h.models.length === 0 && <div className="master-empty">{t('admin.feed.empty')}</div>}
            {h.selectedType && h.models.map(item => {
              const meta = parseModelMeta(item);
              return (
                <button key={item.id} className={`master-row-btn ${h.selectedModel?.id === item.id ? 'active' : ''}`} onClick={() => h.setSelectedModel(item)}>
                  <CatalogListThumb src={item.image_url} fallbackSrc={MEDICINE_PLACEHOLDER} alt={item.model_name} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="master-row-title">{item.model_display_label || item.model_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                      {meta.dosage_unit ?? ''} {meta.species ? `(${meta.species})` : ''}
                      {meta.prescribed && <span style={{ background: '#fff3e0', color: '#e65100', padding: '0 4px', borderRadius: 3, fontSize: 9, fontWeight: 700 }}>Rx</span>}
                      <StorageBadge condition={meta.storage_condition} t={t} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                    <SBadge status={item.status} />
                    <button className="btn btn-secondary btn-sm" style={{ fontSize: 10, padding: '1px 6px' }} title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')} onClick={e => { e.stopPropagation(); h.openEditModel(item); }}>&#9998;</button>
                  </div>
                </button>
              );
            })}
          </CatalogCol>
        </div>

        {h.selectedModel && (() => {
          const meta = parseModelMeta(h.selectedModel);
          const routeLabel = meta.administration_route ? t(`medicine.route.${meta.administration_route}`, meta.administration_route) : '-';
          const storageLabel = meta.storage_condition ? t(`admin.medicine.${meta.storage_condition === 'refrigerated' ? 'refrigerated_badge' : meta.storage_condition === 'frozen' ? 'frozen_badge' : 'room_temp_badge'}`, meta.storage_condition) : '-';
          const diseaseTags = meta.disease_tags ? Object.keys(meta.disease_tags).filter(k => meta.disease_tags![k]).join(', ') : '';
          return (
            <CatalogModelDetail
              title={h.selectedModel.model_display_label || h.selectedModel.model_name}
              onEdit={() => h.openEditModel(h.selectedModel!)}
              onDelete={() => void h.handleDelete('model', h.selectedModel!.id)}
              editLabel="&#9998;" deleteLabel="&#128465;"
              imageUrl={h.selectedModel.image_url}
              fallbackImageSrc={MEDICINE_PLACEHOLDER}
              onImageUpload={file => void h.handleModelImageUpload(file)}
              onImageRemove={() => void h.handleModelImageRemove()}
              onImageUrlChange={url => void h.handleModelImageUrlChange(url)}
              t={t}
              fields={[
                { label: t(I18N.type, 'Type'), value: h.selectedModel.type_display_label || h.selectedModel.type_name_en || h.selectedModel.type_name_ko || '-' },
                { label: t(I18N.manufacturer, 'Manufacturer'), value: h.selectedModel.mfr_display_label || h.selectedModel.mfr_name_en || h.selectedModel.mfr_name_ko || '-' },
                { label: t(I18N.brand, 'Brand'), value: h.selectedModel.brand_display_label || h.selectedModel.brand_name_en || h.selectedModel.brand_name_ko || '-' },
                { label: t('admin.medicine.administration_route', 'Route'), value: routeLabel },
                ...(meta.dosage_unit ? [{ label: t('admin.medicine.dosage_unit', 'Dosage Unit'), value: meta.dosage_unit } satisfies ModelDetailField] : []),
                ...(meta.species ? [{ label: t('admin.medicine.species', 'Species'), value: meta.species } satisfies ModelDetailField] : []),
                { label: t('admin.medicine.prescribed', 'Prescribed'), value: meta.prescribed ? 'Rx' : '-' },
                { label: t('admin.medicine.storage_condition', 'Storage'), value: storageLabel },
                ...(diseaseTags ? [{ label: t('admin.medicine.disease_tags', 'Disease Tags'), value: diseaseTags } satisfies ModelDetailField] : []),
                ...(meta.warnings ? [{ label: t('admin.medicine.warnings', 'Warnings'), value: meta.warnings } satisfies ModelDetailField] : []),
              ]}
            />
          );
        })()}
      </div>

      {h.modal && (
        <CatalogEditModal
          modal={h.modal} onClose={() => h.setModal(null)} onSave={() => void h.handleSave()} onDelete={h.handleDelete}
          saving={h.saving} translating={h.translating} error={h.error} t={t}
          i18n={{ type: t(I18N.type, 'Type'), manufacturer: t(I18N.manufacturer, 'Manufacturer'), brand: t(I18N.brand, 'Brand'), manufacturers: t(I18N.manufacturers, 'Manufacturers'), brands: t(I18N.brands, 'Brands'), models: t(I18N.models, 'Medicines') }}
          types={h.types} manufacturers={h.manufacturers} brands={h.brands}
          mfrForm={h.mfrForm} setMfrForm={h.setMfrForm} mfrTrans={h.mfrTrans} setMfrTrans={h.setMfrTrans} mfrParentTypeIds={h.mfrParentTypeIds} setMfrParentTypeIds={h.setMfrParentTypeIds}
          brandForm={h.brandForm} setBrandForm={h.setBrandForm} brandTrans={h.brandTrans} setBrandTrans={h.setBrandTrans} brandParentTypeIds={h.brandParentTypeIds} setBrandParentTypeIds={h.setBrandParentTypeIds} brandParentMfrIds={h.brandParentMfrIds} setBrandParentMfrIds={h.setBrandParentMfrIds}
          modelForm={h.modelForm} setModelForm={h.setModelForm} modelTrans={h.modelTrans} setModelTrans={h.setModelTrans} modelParentTypeIds={h.modelParentTypeIds} setModelParentTypeIds={h.setModelParentTypeIds} modelParentMfrId={h.modelParentMfrId} setModelParentMfrId={h.setModelParentMfrId} modelParentBrandIds={h.modelParentBrandIds} setModelParentBrandIds={h.setModelParentBrandIds}
          selectedType={h.selectedType} loadBrands={h.loadBrands} setTranslating={h.setTranslating} setError={h.setError}
        />
      )}
    </>
  );
}
