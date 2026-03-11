import { api, type FeedModel } from '../lib/api';
import { itemLabel } from '../lib/catalogUtils';
import { CatalogCol, CatalogStatusBadge, CatalogModelDetail, CatalogListThumb, type ModelDetailField } from '../components/CatalogGrid';
import { CatalogStatsBar } from '../components/CatalogStatsBar';
import { CatalogEditModal } from '../components/CatalogEditModal';
import { NutritionPanel } from '../components/NutritionPanel';
import { useCatalogPage } from '../hooks/useCatalogPage';

const SUPPLEMENT_PLACEHOLDER = '/assets/images/placeholder_supplement.svg';
const I18N = {
  type: 'admin.supplement.type', manufacturer: 'admin.supplement.manufacturer', brand: 'admin.supplement.brand',
  types: 'admin.supplement.types', manufacturers: 'admin.supplement.manufacturers', brands: 'admin.supplement.brands', models: 'admin.supplement.models',
};

function parseModelMeta(model: FeedModel): { ingredients?: string; dosage_unit?: string; calories_per_serving?: number; species_key?: string; prescribed?: boolean } {
  try { if (model.description) return JSON.parse(model.description); } catch { /* ignore */ }
  return {};
}

export default function SupplementPage() {
  const h = useCatalogPage({ catalogApi: api.supplementCatalog, imageSubdir: 'supplement' });
  const { t } = h;
  const addLabel = t('admin.master.btn_add');
  function SBadge({ status }: { status: string }) { return <CatalogStatusBadge status={status} t={t} />; }

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">{t('admin.supplement.title', 'Supplement Catalog')}</div>
      </div>
      <div className="content">
        {h.error && <div className="alert alert-error">{h.error}</div>}
        {h.success && <div className="alert alert-success">{h.success}</div>}

        <CatalogStatsBar loading={h.statsLoading} cards={[
          { label: t('admin.catalog.stats.total_models', 'Total'), value: h.stats?.total_models ?? 0, desc: t('admin.catalog.stats.total_models_desc', 'Registered models'), active: h.statsFilter === 'total', onClick: () => h.setStatsFilter(h.statsFilter === 'total' ? null : 'total') },
          { label: t('admin.catalog.stats.active', 'Active'), value: h.stats?.active_models ?? 0, desc: t('admin.catalog.stats.active_desc', 'Active models'), active: h.statsFilter === 'active', onClick: () => h.setStatsFilter(h.statsFilter === 'active' ? null : 'active') },
          { label: t('admin.catalog.stats.user_registered', 'Registered'), value: h.stats?.user_registered ?? 0, desc: t('admin.catalog.stats.user_registered_feed_desc', 'User registered'), active: h.statsFilter === 'registered', onClick: () => h.setStatsFilter(h.statsFilter === 'registered' ? null : 'registered') },
          { label: t('admin.catalog.stats.actual_usage', 'Usage'), value: h.stats?.actual_usage ?? 0, desc: t('admin.catalog.stats.actual_usage_feed_desc', 'Last 30d usage'), active: h.statsFilter === 'usage', onClick: () => h.setStatsFilter(h.statsFilter === 'usage' ? null : 'usage') },
          { label: t('admin.catalog.stats.prescribed', 'Prescribed'), value: h.stats?.prescribed ?? 0, desc: t('admin.catalog.stats.prescribed_desc', 'Prescribed items'), active: h.statsFilter === 'prescribed', onClick: () => h.setStatsFilter(h.statsFilter === 'prescribed' ? null : 'prescribed') },
        ]} />

        <div className="alert" style={{ marginBottom: 12 }}>{t('admin.supplement.guide', 'Manage supplement catalog: Type > Manufacturer > Brand > Model')}</div>

        <div className="master-explorer-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
          <CatalogCol title={t(I18N.types, 'Supplement Types')} sortMode={h.typeSort} onSortChange={h.setTypeSort}>
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

          <CatalogCol title={t(I18N.models, 'Supplement Models')} onAdd={h.openCreateModel} addLabel={addLabel}>
            {!h.selectedType && <div className="master-empty">{t('admin.feed.select_type')}</div>}
            {h.selectedType && h.models.length === 0 && <div className="master-empty">{t('admin.feed.empty')}</div>}
            {h.selectedType && h.models.map(item => {
              const meta = parseModelMeta(item);
              return (
                <button key={item.id} className={`master-row-btn ${h.selectedModel?.id === item.id ? 'active' : ''}`} onClick={() => h.setSelectedModel(item)}>
                  <CatalogListThumb src={item.image_url} fallbackSrc={SUPPLEMENT_PLACEHOLDER} alt={item.model_name} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="master-row-title">{item.model_display_label || item.model_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {meta.dosage_unit ?? ''} {meta.species_key ? `(${meta.species_key})` : ''}
                      {meta.prescribed ? ' Rx' : ''}
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
          return (
            <CatalogModelDetail
              title={h.selectedModel.model_display_label || h.selectedModel.model_name}
              onEdit={() => h.openEditModel(h.selectedModel!)}
              onDelete={() => void h.handleDelete('model', h.selectedModel!.id)}
              editLabel="&#9998;" deleteLabel="&#128465;"
              imageUrl={h.selectedModel.image_url}
              fallbackImageSrc={SUPPLEMENT_PLACEHOLDER}
              onImageUpload={file => void h.handleModelImageUpload(file)}
              onImageRemove={() => void h.handleModelImageRemove()}
              onImageUrlChange={url => void h.handleModelImageUrlChange(url)}
              t={t}
              fields={[
                { label: t(I18N.type, 'Type'), value: h.selectedModel.type_display_label || h.selectedModel.type_name_en || h.selectedModel.type_name_ko || '-' },
                { label: t(I18N.manufacturer, 'Manufacturer'), value: h.selectedModel.mfr_display_label || h.selectedModel.mfr_name_en || h.selectedModel.mfr_name_ko || '-' },
                { label: t(I18N.brand, 'Brand'), value: h.selectedModel.brand_display_label || h.selectedModel.brand_name_en || h.selectedModel.brand_name_ko || '-' },
                ...(meta.ingredients ? [{ label: t('admin.supplement.ingredients', 'Ingredients'), value: meta.ingredients } satisfies ModelDetailField] : []),
                ...(meta.dosage_unit ? [{ label: t('admin.supplement.dosage_unit', 'Dosage Unit'), value: meta.dosage_unit } satisfies ModelDetailField] : []),
                ...(meta.calories_per_serving != null ? [{ label: t('admin.supplement.calories_serving', 'kcal/serving'), value: String(meta.calories_per_serving) } satisfies ModelDetailField] : []),
                ...(meta.species_key ? [{ label: t('admin.supplement.species', 'Species'), value: meta.species_key } satisfies ModelDetailField] : []),
                ...(meta.prescribed ? [{ label: t('admin.supplement.prescribed', 'Prescribed'), value: 'Yes' } satisfies ModelDetailField] : []),
              ]}
            />
          );
        })()}

        {h.selectedModel && (
          <NutritionPanel
            nutritionForm={h.nutritionForm} setNutritionForm={h.setNutritionForm}
            nutritionSaving={h.nutritionSaving} onSave={() => void h.handleSaveNutrition()} t={t}
          />
        )}
      </div>

      {h.modal && (
        <CatalogEditModal
          modal={h.modal} onClose={() => h.setModal(null)} onSave={() => void h.handleSave()} onDelete={h.handleDelete}
          saving={h.saving} translating={h.translating} error={h.error} t={t}
          i18n={{ type: t(I18N.type, 'Type'), manufacturer: t(I18N.manufacturer, 'Manufacturer'), brand: t(I18N.brand, 'Brand'), manufacturers: t(I18N.manufacturers, 'Manufacturers'), brands: t(I18N.brands, 'Brands'), models: t(I18N.models, 'Models') }}
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
