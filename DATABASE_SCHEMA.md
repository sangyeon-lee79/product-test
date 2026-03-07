# Petfolio
Your pet's life portfolio

Database schema and migrations are maintained under:
- `services/api/src/db/schema.ts`
- `services/api/src/db/migrations/`

## Recent Migrations (2026-03-07)
- `0022_restore_bangul_sample.sql`
  - Restores guardian sample pet `방울` and related sample records.
- `0023_disease_management_foundation.sql`
  - Adds disease/diet/allergy master extensions.
  - Adds diabetes judgement rule structure and seed.
  - Adds `pet_disease_histories`, `pet_disease_devices`, `pet_glucose_logs`.
  - FK-safe seed logic updated to code-based lookup.
- `0024_admin_master_disease_tree_i18n.sql`
  - Adds i18n keys for Admin Master disease tree/quick navigation UI.
- `0025_backfill_master_category_i18n.sql`
  - Backfills missing category translations for key disease/diet/allergy categories.

## New Core Tables
- `disease_judgement_rules`
- `pet_disease_histories`
- `pet_disease_devices`
- `pet_glucose_logs`

## Operational Notes
- Apply remote migrations with config:
  - `npx wrangler d1 migrations apply pet-life-db --remote --config services/api/wrangler.jsonc`
- Deploy API after migration:
  - `cd services/api && npx wrangler deploy --config wrangler.jsonc`
