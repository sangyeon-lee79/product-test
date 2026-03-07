#!/usr/bin/env bash
set -euo pipefail

DB_NAME="${DB_NAME:-pet-life-db}"
CONFIG_PATH="${CONFIG_PATH:-wrangler.jsonc}"
REMOTE_FLAG="${REMOTE_FLAG:---remote}"
SQL_FILE="src/db/queries/verify_master_i18n_gate.sql"

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required for pre-deploy i18n check."
  exit 1
fi

echo "[i18n-gate] Running master i18n validation..."
RESULT_JSON="$(npx wrangler d1 execute "$DB_NAME" "$REMOTE_FLAG" --config "$CONFIG_PATH" --json --file "$SQL_FILE")"

FAIL_COUNT="$(echo "$RESULT_JSON" | jq -r '.[0].results[0].fail_count // 999999')"

if [[ "$FAIL_COUNT" =~ ^[0-9]+$ ]] && [[ "$FAIL_COUNT" -eq 0 ]]; then
  echo "[i18n-gate] PASS: no missing translations or hierarchy violations."
  exit 0
fi

echo "[i18n-gate] FAIL: deployment blocked."
echo "$RESULT_JSON" | jq '.[0].results[0]'
exit 1
