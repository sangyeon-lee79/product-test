#!/bin/bash
# D1 마스터데이터 전체 덤프 스크립트
set -e

export CLOUDFLARE_API_TOKEN="WzXKNgYZ-CeHTmrvy6d-xo2y5tjJ1hwPsHCcpMuL"
DB="pet-life-db"
OUT_DIR="/home/user/product-test/scripts/d1-backup"

# 마스터데이터 테이블 목록 (사용자 데이터 제외)
TABLES=(
  master_categories
  master_items
  i18n_translations
  device_types
  device_manufacturers
  device_brands
  device_models
  device_brand_manufacturer_map
  device_manufacturer_type_map
  device_model_brand_map
  measurement_units
  measurement_ranges
  countries
  currencies
  country_currency_map
  disease_symptom_map
  symptom_metric_map
  metric_unit_map
  metric_logtype_map
  disease_judgement_rules
  feed_manufacturers
  feed_brands
  feed_models
  feed_brand_manufacturer_map
  feed_manufacturer_type_map
  feed_model_brand_map
  feed_nutrient_types
  feed_nutrition
  feed_nutrition_units
  feed_nutrition_basis_types
  feed_model_nutrients
  ad_config
  ad_slots
  platform_settings
)

for tbl in "${TABLES[@]}"; do
  echo "Dumping $tbl..."
  npx wrangler d1 execute "$DB" --remote --command "SELECT * FROM $tbl;" --json 2>/dev/null | \
    node -e "
      const data = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
      const results = data[0]?.results || [];
      console.log(JSON.stringify(results, null, 2));
    " > "$OUT_DIR/${tbl}.json" 2>/dev/null || echo "[]" > "$OUT_DIR/${tbl}.json"
  count=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$OUT_DIR/${tbl}.json','utf8')).length)")
  echo "  → $count rows"
done

echo "Done! Backup saved to $OUT_DIR/"
