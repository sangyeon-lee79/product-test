#!/usr/bin/env node
/**
 * D1 JSON backup → PostgreSQL INSERT 문 생성
 *
 * D1에서 덤프한 JSON 파일들을 읽어 PostgreSQL INSERT 문으로 변환합니다.
 *
 * 주요 변환:
 * - SQLite INTEGER boolean (0/1) → PostgreSQL BOOLEAN (true/false)
 * - NULL 값 처리
 * - 문자열 이스케이프 (single quote)
 * - FK 순서 보장 (부모 테이블 먼저)
 */

const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, 'd1-backup');
const OUTPUT_FILE = path.join(__dirname, '..', 'services', 'api', 'src', 'db', 'pg-schema', '003_master_data_seed.sql');

// Boolean 컬럼 매핑 (SQLite INTEGER 0/1 → PG BOOLEAN)
const BOOLEAN_COLUMNS = new Set([
  'is_active', 'is_default', 'global_enabled', 'is_enabled', 'no_health_zone'
]);

// 테이블 삽입 순서 (FK 의존성 반영)
const TABLE_ORDER = [
  // 1. 독립 테이블 (FK 없음)
  'master_categories',
  'device_types',
  'currencies',
  'countries',

  // 2. master_categories에 의존
  'master_items',

  // 3. master_items에 의존
  'disease_symptom_map',
  'symptom_metric_map',
  'metric_unit_map',
  'metric_logtype_map',
  'measurement_units',
  'measurement_ranges',
  'disease_judgement_rules',

  // 4. countries/currencies에 의존
  'country_currency_map',

  // 5. device 계층
  'device_manufacturers',
  'device_brands',
  'device_models',
  'device_manufacturer_type_map',
  'device_brand_manufacturer_map',
  'device_model_brand_map',

  // 6. feed 계층
  'feed_manufacturers',
  'feed_brands',
  'feed_models',
  'feed_manufacturer_type_map',
  'feed_brand_manufacturer_map',
  'feed_model_brand_map',

  // 7. feed nutrition
  'feed_nutrient_types',
  'feed_nutrition_units',
  'feed_nutrition_basis_types',
  'feed_nutrition',
  'feed_model_nutrients',

  // 8. i18n (마지막 - 가장 많은 데이터)
  'i18n_translations',

  // 9. 설정 (002_seed.sql과 중복 가능 → ON CONFLICT 사용)
  'platform_settings',
  'ad_config',
  'ad_slots',
];

// PostgreSQL 컬럼 정의 (D1과 다른 경우만 명시)
// D1에는 있지만 PG에는 없는 컬럼 등
const COLUMN_OVERRIDES = {};

// Simple UUID v4 generator (no dependency needed)
function uuid() {
  const hex = '0123456789abcdef';
  let s = '';
  for (let i = 0; i < 32; i++) {
    s += hex[Math.floor(Math.random() * 16)];
  }
  return s.slice(0,8)+s.slice(8,12)+s.slice(12,16)+s.slice(16,20)+s.slice(20);
}

// 값 이스케이프
function escapeValue(val, colName) {
  // Auto-generate ID for null primary keys
  if (colName === 'id' && (val === null || val === undefined)) {
    return `'${uuid()}'`;
  }
  if (val === null || val === undefined) return 'NULL';

  // Boolean 변환
  if (BOOLEAN_COLUMNS.has(colName)) {
    return val ? 'true' : 'false';
  }

  // 숫자
  if (typeof val === 'number') return String(val);

  // 문자열
  const escaped = String(val).replace(/'/g, "''");
  return `'${escaped}'`;
}

// ON CONFLICT 키 매핑
const CONFLICT_KEYS = {
  'master_categories': 'code',
  'master_items': 'category_id, code',
  'i18n_translations': 'key',
  'device_types': 'id',
  'device_manufacturers': 'id',
  'device_brands': 'id',
  'device_models': 'id',
  'measurement_units': 'id',
  'measurement_ranges': 'id',
  'countries': 'id',
  'currencies': 'id',
  'country_currency_map': 'id',
  'disease_symptom_map': 'id',
  'symptom_metric_map': 'id',
  'metric_unit_map': 'id',
  'metric_logtype_map': 'id',
  'disease_judgement_rules': 'id',
  'device_manufacturer_type_map': 'id',
  'device_brand_manufacturer_map': 'id',
  'device_model_brand_map': 'id',
  'feed_manufacturers': 'id',
  'feed_brands': 'id',
  'feed_models': 'id',
  'feed_manufacturer_type_map': 'id',
  'feed_brand_manufacturer_map': 'id',
  'feed_model_brand_map': 'id',
  'feed_nutrient_types': 'id',
  'feed_nutrition': 'id',
  'feed_nutrition_units': 'id',
  'feed_nutrition_basis_types': 'id',
  'feed_model_nutrients': 'id',
  'platform_settings': 'setting_key',
  'ad_config': 'id',
  'ad_slots': 'id',
};

// Topological sort for self-referencing tables
function topoSort(rows, idCol, parentCol) {
  const idSet = new Set(rows.map(r => r[idCol]));
  const childrenOf = {};
  const roots = [];

  for (const row of rows) {
    const pid = row[parentCol];
    if (!pid || !idSet.has(pid)) {
      roots.push(row);
    } else {
      if (!childrenOf[pid]) childrenOf[pid] = [];
      childrenOf[pid].push(row);
    }
  }

  const sorted = [];
  const queue = [...roots];
  while (queue.length > 0) {
    const node = queue.shift();
    sorted.push(node);
    const children = childrenOf[node[idCol]] || [];
    queue.push(...children);
  }

  // Append any remaining orphans (shouldn't happen but safety net)
  const sortedIds = new Set(sorted.map(r => r[idCol]));
  for (const row of rows) {
    if (!sortedIds.has(row[idCol])) sorted.push(row);
  }

  return sorted;
}

// Tables with self-referencing parent columns
const SELF_REF_TABLES = {
  'master_categories': { id: 'id', parent: 'parent_id' },
  'master_items': { id: 'id', parent: 'parent_item_id' },
};

function generateSQL() {
  const lines = [];

  lines.push('-- =============================================================================');
  lines.push('-- Petfolio — Master Data Seed (migrated from Cloudflare D1)');
  lines.push(`-- Generated: ${new Date().toISOString()}`);
  lines.push('-- =============================================================================');
  lines.push('-- All statements use ON CONFLICT DO NOTHING for idempotency.');
  lines.push('-- Apply after 001_init.sql + 002_seed.sql');
  lines.push('-- =============================================================================');
  lines.push('');
  lines.push('BEGIN;');
  lines.push('');

  let totalRows = 0;

  for (const table of TABLE_ORDER) {
    const jsonFile = path.join(BACKUP_DIR, `${table}.json`);

    if (!fs.existsSync(jsonFile)) {
      lines.push(`-- SKIP: ${table} (no backup file)`);
      lines.push('');
      continue;
    }

    let rows = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));

    // Topological sort for self-referencing tables
    if (SELF_REF_TABLES[table]) {
      const { id, parent } = SELF_REF_TABLES[table];
      rows = topoSort(rows, id, parent);
    }

    if (rows.length === 0) {
      lines.push(`-- SKIP: ${table} (0 rows)`);
      lines.push('');
      continue;
    }

    lines.push(`-- ---------------------------------------------------------------------------`);
    lines.push(`-- ${table} (${rows.length} rows)`);
    lines.push(`-- ---------------------------------------------------------------------------`);

    // 컬럼 목록 (첫 번째 row 기준)
    const columns = Object.keys(rows[0]);
    const conflictKey = CONFLICT_KEYS[table] || 'id';

    // 배치 INSERT (50행씩)
    const batchSize = 50;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);

      lines.push(`INSERT INTO ${table} (${columns.join(', ')})`);
      lines.push('VALUES');

      const valueParts = batch.map(row => {
        const vals = columns.map(col => escapeValue(row[col], col));
        return `  (${vals.join(', ')})`;
      });

      lines.push(valueParts.join(',\n'));
      lines.push(`ON CONFLICT (${conflictKey}) DO NOTHING;`);
      lines.push('');
    }

    totalRows += rows.length;
  }

  lines.push('-- ---------------------------------------------------------------------------');
  lines.push('-- Record migration');
  lines.push('-- ---------------------------------------------------------------------------');
  lines.push("INSERT INTO schema_migrations (version)");
  lines.push("VALUES ('pg_003_master_data_seed')");
  lines.push('ON CONFLICT DO NOTHING;');
  lines.push('');
  lines.push('COMMIT;');
  lines.push('');
  lines.push(`-- Total: ${totalRows} rows across ${TABLE_ORDER.length} tables`);

  return lines.join('\n');
}

// 실행
const sql = generateSQL();
fs.writeFileSync(OUTPUT_FILE, sql, 'utf8');

// 통계 출력
console.log(`Generated: ${OUTPUT_FILE}`);
console.log(`Size: ${(Buffer.byteLength(sql) / 1024).toFixed(1)} KB`);

// 테이블별 row count
for (const table of TABLE_ORDER) {
  const jsonFile = path.join(BACKUP_DIR, `${table}.json`);
  if (fs.existsSync(jsonFile)) {
    const rows = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
    if (rows.length > 0) {
      console.log(`  ${table}: ${rows.length} rows`);
    }
  }
}
