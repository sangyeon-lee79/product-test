# Development Status (2026-03-07)

## Completed
- Guardian/Public fetch error hardening
  - Raw network errors are no longer shown directly as `Failed to fetch`.
  - User-facing fallback messages are used for API/network failures.
- Sample data recovery
  - `방울` seed data restored and validated on remote DB.
- Pet Gallery integration
  - Pet profile/gallery/feed/booking/health/manual media linkage paths aligned.
- My Pet direct input expansion
  - Birthday field support.
  - Weight history model and APIs aligned.
- Disease management foundation
  - Master category/item hierarchy for disease/diet/allergy.
  - Diabetes device/measurement/context/judgement seed structure.
  - Glucose logs and judgement calculation APIs.
- Admin Master improvements
  - Disease group > disease > device tree view.
  - Category create rule updated: `key + ko translation` required.

## Recently Added Migrations
- `0022_restore_bangul_sample.sql`
- `0023_disease_management_foundation.sql`
- `0024_admin_master_disease_tree_i18n.sql`
- `0025_backfill_master_category_i18n.sql`

## Policy Applied
- No hardcoded business options for new domain data.
- New selectable data must be managed via:
  - `master_categories`
  - `master_items`
  - parent-child relation
  - i18n translations
- Storage uses `item_id/code`, not localized label text.

## Deployment Checklist
1. `git pull origin main`
2. `npx wrangler d1 migrations apply pet-life-db --remote --config services/api/wrangler.jsonc`
3. `cd services/api && npx wrangler deploy --config wrangler.jsonc`
4. Verify:
   - Guardian login shows sample pet `방울`.
   - Master disease tree renders in Admin.
   - Master category create requires `key` and Korean name.
   - Master/public disease APIs return data.
