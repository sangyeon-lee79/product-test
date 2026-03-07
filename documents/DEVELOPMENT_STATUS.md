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
  - Master 6-level UI fixed text converted to i18n keys.
  - L1~L5 label rendering uses translated value, not raw key.
  - Missing translation state shown in UI (no raw key fallback for item labels).

## New Guardrails (Translation Required)
- Master category/item save is no longer key-only.
  - Save requires Korean display name + complete i18n payload.
  - Save proceeds only after i18n record generation/verification is complete.
- New item creation flow (required):
  - Korean label input
  - key generation (item key is server-generated)
  - i18n record generation
  - auto-translation based on Korean
  - save
- Seed data policy (required):
  - key + Korean label + parent relation + level-consistent hierarchy
  - no hardcoded option arrays in UI/backend
- Deployment gate added:
  - Run master i18n validation before deploy.
  - If missing translations/hierarchy violations are found, deployment must fail.

## Recently Added Migrations
- `0022_restore_bangul_sample.sql`
- `0023_disease_management_foundation.sql`
- `0024_admin_master_disease_tree_i18n.sql`
- `0025_backfill_master_category_i18n.sql`
- `0040_master_i18n_backfill_labels.sql`
- `0041_admin_master_6level_i18n_full.sql`

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
3. `cd services/api && npm run check:i18n:master`
4. `cd services/api && npx wrangler deploy --config wrangler.jsonc` (or `npm run deploy:guarded`)
5. Verify:
   - Guardian login shows sample pet `방울`.
   - Master disease tree renders in Admin.
   - Master category create requires `key` and Korean name.
   - Master/public disease APIs return data.
