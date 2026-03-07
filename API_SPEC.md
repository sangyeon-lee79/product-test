# Petfolio
Your pet's life portfolio

API specifications are maintained in:
- `documents/PRD.md`
- `documents/LLD.md`
- `services/api/src/routes/`

## Recent Implemented APIs (2026-03-07)

### Master (public)
- `GET /api/v1/master/disease-groups`
- `GET /api/v1/master/diseases?group_id=...`
- `GET /api/v1/master/disease-devices?disease_id=...`
- `GET /api/v1/master/disease-measurements?disease_id=...`
- `GET /api/v1/master/disease-judgement-rules?disease_id=...`
- `GET /api/v1/master/diet-types`
- `GET /api/v1/master/diet-subtypes?parent_id=...`
- `GET /api/v1/master/allergy-groups`
- `GET /api/v1/master/allergies?group_id=...`

### Pets (guardian auth required)
- `GET /api/v1/pets/:id/diseases`
- `POST /api/v1/pets/:id/diseases`
- `PUT /api/v1/pets/:id/diseases/:history_id`
- `DELETE /api/v1/pets/:id/diseases/:history_id`
- `GET /api/v1/pets/:id/disease-devices`
- `POST /api/v1/pets/:id/disease-devices`
- `GET /api/v1/pets/:id/glucose-logs?range=1w|1m|3m|6m|1y|all`
- `POST /api/v1/pets/:id/glucose-logs`
- `PUT /api/v1/pets/:id/glucose-logs/:log_id`
- `DELETE /api/v1/pets/:id/glucose-logs/:log_id`

## Master Category Create Rule (Updated)
- `POST /api/v1/admin/master/categories` now requires:
  - `key` (required, snake_case)
  - `translations.ko` (required)
  - `sort_order` (optional, default 0)
- Duplicate category key is rejected (`409`, `duplicate_key`).
- Category i18n key is stored as `master.<key>`.
