#!/usr/bin/env bash
set -euo pipefail

DB_NAME="${DB_NAME:-pet-life-db}"
CONFIG_PATH="${CONFIG_PATH:-wrangler.jsonc}"
REMOTE_FLAG="${REMOTE_FLAG:---remote}"
SQL_FILE="src/db/queries/verify_master_i18n_gate.sql"
AUDIT_SQL_FILE="src/db/queries/audit_i18n_quality.sql"

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required for pre-deploy i18n check."
  exit 1
fi

echo "[i18n-gate] Running master i18n validation..."
RESULT_JSON="$(npx wrangler d1 execute "$DB_NAME" "$REMOTE_FLAG" --config "$CONFIG_PATH" --json --file "$SQL_FILE")"
AUDIT_JSON="$(npx wrangler d1 execute "$DB_NAME" "$REMOTE_FLAG" --config "$CONFIG_PATH" --json --file "$AUDIT_SQL_FILE")"

FAIL_COUNT="$(echo "$RESULT_JSON" | jq -r '.[0].results[0].fail_count // 999999')"
AUDIT_FAIL_COUNT="$(echo "$AUDIT_JSON" | jq -r '.[0].results[0].fail_count // 999999')"

if [[ "$FAIL_COUNT" =~ ^[0-9]+$ ]] && [[ "$FAIL_COUNT" -eq 0 ]] && [[ "$AUDIT_FAIL_COUNT" =~ ^[0-9]+$ ]] && [[ "$AUDIT_FAIL_COUNT" -eq 0 ]]; then
  echo "[i18n-gate] PASS: no missing translations or hierarchy violations."
  exit 0
fi

echo "[i18n-gate] FAIL: deployment blocked."
echo "[i18n-gate] verify_master_i18n_gate result:"
echo "$RESULT_JSON" | jq '.[0].results[0]'
echo "[i18n-gate] audit_i18n_quality result:"
echo "$AUDIT_JSON" | jq '.[0].results[0]'
exit 1
