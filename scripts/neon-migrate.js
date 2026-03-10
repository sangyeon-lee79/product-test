#!/usr/bin/env node
/**
 * Neon DB 초기화 및 마스터데이터 마이그레이션 스크립트
 *
 * 1. Neon DB 전체 테이블 DROP
 * 2. 001_init.sql 적용 (스키마 재생성)
 * 3. 002_seed.sql 적용 (기본 시드)
 * 4. 003_master_data_seed.sql 적용 (D1 마스터데이터)
 * 5. 데이터 정합성 검증
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL || process.argv[2];

if (!DATABASE_URL) {
  console.error('Usage: DATABASE_URL=... node neon-migrate.js');
  console.error('   or: node neon-migrate.js <connection-string>');
  process.exit(1);
}

const PG_SCHEMA_DIR = path.join(__dirname, '..', 'services', 'api', 'src', 'db', 'pg-schema');

async function run() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Neon DB...');
    await client.connect();
    console.log('Connected!\n');

    const mode = process.argv[3] || 'full';

    if (mode === 'status') {
      await showStatus(client);
      return;
    }

    if (mode === 'full') {
      // Step 1: Drop all tables
      console.log('=== Step 1: DROP ALL TABLES ===');
      await dropAllTables(client);

      // Step 2: Apply 001_init.sql
      console.log('\n=== Step 2: Apply 001_init.sql (schema) ===');
      await applySqlFile(client, path.join(PG_SCHEMA_DIR, '001_init.sql'));

      // Step 3: Apply 002_seed.sql
      console.log('\n=== Step 3: Apply 002_seed.sql (base seed) ===');
      await applySqlFile(client, path.join(PG_SCHEMA_DIR, '002_seed.sql'));

      // Step 4: Apply 003_master_data_seed.sql
      console.log('\n=== Step 4: Apply 003_master_data_seed.sql (D1 master data) ===');
      await applySqlFile(client, path.join(PG_SCHEMA_DIR, '003_master_data_seed.sql'));

      // Step 5: Verify
      console.log('\n=== Step 5: Data Verification ===');
      await showStatus(client);
    }

    if (mode === 'seed-only') {
      console.log('=== Apply 003_master_data_seed.sql only ===');
      await applySqlFile(client, path.join(PG_SCHEMA_DIR, '003_master_data_seed.sql'));
      await showStatus(client);
    }

  } catch (err) {
    console.error('ERROR:', err.message);
    if (err.detail) console.error('Detail:', err.detail);
    if (err.where) console.error('Where:', err.where);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\nConnection closed.');
  }
}

async function dropAllTables(client) {
  // Get all tables (exclude system tables)
  const { rows } = await client.query(`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `);

  if (rows.length === 0) {
    console.log('  No tables found. Clean database.');
    return;
  }

  console.log(`  Found ${rows.length} tables. Dropping all...`);

  // Use CASCADE to handle FK dependencies
  for (const row of rows) {
    await client.query(`DROP TABLE IF EXISTS "${row.tablename}" CASCADE;`);
    process.stdout.write('.');
  }
  console.log(`\n  Dropped ${rows.length} tables.`);
}

async function applySqlFile(client, filePath) {
  const fileName = path.basename(filePath);
  console.log(`  Applying ${fileName}...`);

  const sql = fs.readFileSync(filePath, 'utf8');

  try {
    await client.query(sql);
    console.log(`  ${fileName} applied successfully.`);
  } catch (err) {
    console.error(`  ERROR in ${fileName}:`);
    console.error(`    ${err.message}`);
    if (err.position) {
      const pos = parseInt(err.position);
      const context = sql.substring(Math.max(0, pos - 100), pos + 100);
      console.error(`    Near position ${pos}: ...${context}...`);
    }
    throw err;
  }
}

async function showStatus(client) {
  // Master data tables to verify
  const tables = [
    'master_categories', 'master_items', 'i18n_translations',
    'device_types', 'device_manufacturers', 'device_brands', 'device_models',
    'device_manufacturer_type_map', 'device_brand_manufacturer_map', 'device_model_brand_map',
    'measurement_units', 'measurement_ranges',
    'countries', 'currencies', 'country_currency_map',
    'disease_symptom_map', 'symptom_metric_map', 'metric_unit_map', 'metric_logtype_map',
    'disease_judgement_rules',
    'feed_manufacturers', 'feed_brands', 'feed_models',
    'feed_manufacturer_type_map', 'feed_brand_manufacturer_map', 'feed_model_brand_map',
    'feed_nutrient_types', 'feed_nutrition', 'feed_nutrition_units',
    'feed_nutrition_basis_types', 'feed_model_nutrients',
    'platform_settings', 'ad_config', 'ad_slots',
    'users'
  ];

  console.log('\n  Table                          | Neon DB | D1 DB');
  console.log('  -------------------------------|--------|------');

  // D1 expected counts
  const d1Counts = {
    master_categories: 34, master_items: 490, i18n_translations: 1263,
    device_types: 5, device_manufacturers: 4, device_brands: 4, device_models: 6,
    device_manufacturer_type_map: 3, device_brand_manufacturer_map: 4, device_model_brand_map: 6,
    measurement_units: 11, measurement_ranges: 0,
    countries: 13, currencies: 10, country_currency_map: 13,
    disease_symptom_map: 0, symptom_metric_map: 0, metric_unit_map: 0, metric_logtype_map: 0,
    disease_judgement_rules: 10,
    feed_manufacturers: 6, feed_brands: 11, feed_models: 26,
    feed_manufacturer_type_map: 18, feed_brand_manufacturer_map: 11, feed_model_brand_map: 26,
    feed_nutrient_types: 19, feed_nutrition: 25, feed_nutrition_units: 6,
    feed_nutrition_basis_types: 4, feed_model_nutrients: 37,
    platform_settings: 3, ad_config: 0, ad_slots: 0,
    users: '-'
  };

  let allMatch = true;
  for (const table of tables) {
    try {
      const { rows } = await client.query(`SELECT COUNT(*) as cnt FROM "${table}"`);
      const neonCount = parseInt(rows[0].cnt);
      const d1Count = d1Counts[table];
      const d1Str = d1Count === '-' ? '-' : String(d1Count);
      const match = d1Count === '-' || neonCount >= d1Count ? '' : ' ← MISMATCH';
      if (match) allMatch = false;
      console.log(`  ${table.padEnd(32)}| ${String(neonCount).padStart(6)} | ${d1Str.padStart(5)}${match}`);
    } catch (err) {
      console.log(`  ${table.padEnd(32)}| ERROR  | ${d1Counts[table] || '?'}`);
      allMatch = false;
    }
  }

  console.log('  -------------------------------|--------|------');
  console.log(allMatch ? '  ✓ All master data counts match!' : '  ✗ Some counts do not match.');
}

run();
