#!/usr/bin/env bash
set -euo pipefail

DB_NAME="${1:-pet-life-db}"
CFG="${2:-wrangler.jsonc}"

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "CLOUDFLARE_API_TOKEN is not set."
  exit 1
fi

echo "[1/4] Drop all tables on remote: ${DB_NAME}"
npx wrangler d1 execute "${DB_NAME}" --remote --config "${CFG}" --file src/db/queries/reset_all_tables.sql

echo "[2/4] Re-apply migrations"
for file in $(ls src/db/migrations/*.sql | sort); do
  echo "  - applying ${file}"
  npx wrangler d1 execute "${DB_NAME}" --remote --config "${CFG}" --file "${file}"
done

echo "[3/4] Verify migration 0022"
npx wrangler d1 execute "${DB_NAME}" --remote --config "${CFG}" --command "SELECT version FROM schema_migrations WHERE version='0022_restore_bangul_sample';"

echo "[4/4] Verify Bangul sample"
npx wrangler d1 execute "${DB_NAME}" --remote --config "${CFG}" --command "SELECT p.id, p.name, p.microchip_number, p.status, u.email FROM pets p JOIN users u ON u.id=p.guardian_user_id WHERE p.name='방울';"

echo "Done."
