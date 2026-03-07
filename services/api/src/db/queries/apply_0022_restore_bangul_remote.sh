#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$ROOT_DIR"

echo "[1/3] Apply migration SQL 0022 to remote D1"
npx wrangler d1 execute pet-life-db --remote --file src/db/migrations/0022_restore_bangul_sample.sql

echo "[2/3] Verify migration marker"
npx wrangler d1 execute pet-life-db --remote --command "SELECT version FROM schema_migrations WHERE version='0022_restore_bangul_sample';"

echo "[3/3] Verify Bangul sample rows"
npx wrangler d1 execute pet-life-db --remote --command "SELECT u.email, p.id, p.name, p.microchip_no, p.birthday, p.current_weight FROM users u JOIN pets p ON p.guardian_id=u.id WHERE u.email='guardian@petlife.com' AND p.name='방울' AND p.status!='deleted';"

echo "Done."
