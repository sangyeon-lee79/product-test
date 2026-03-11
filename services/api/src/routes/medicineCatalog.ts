import { createCatalogHandler } from './catalogFactory';

export const handleMedicineCatalog = createCatalogHandler({
  categoryType: 'medicine',
  masterCategoryCode: 'medicine_category',
  urlPrefix: '/api/v1/medicine-catalog',
  adminUrlPrefix: '/api/v1/admin/medicine-catalog',
  i18nPage: 'medicine',
  keyPrefix: { mfr: 'med_mfr_', brand: 'med_brand_', model: 'med_model_' },
  hasNutrition: false,
  setCategoryTypeOnInsert: true,
  // medicine: no extra stats (only total + active from base)
});
