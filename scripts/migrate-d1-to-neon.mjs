#!/usr/bin/env node
// Migrate data from local D1 (SQLite) to Neon PostgreSQL
// Multi-pass approach: retry failed inserts until FK deps resolve

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const NEON_URL = 'postgresql://neondb_owner:npg_G03iUyefITHm@ep-plain-feather-a1yj4peb.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

// Step 1: Extract INSERT statements from D1
console.log('Step 1: Extracting D1 data...');
const output = execSync(`python3 ${join(__dirname, 'extract-d1.py')}`, {
  encoding: 'utf-8',
  maxBuffer: 50 * 1024 * 1024,
});

const stmts = output.split('\n').filter(s => s.trim() && !s.startsWith('--'));
console.log(`  → ${stmts.length} INSERT statements generated`);

// Step 2: Connect and truncate
console.log('Step 2: Connecting to Neon...');
const client = new pg.Client(NEON_URL);
await client.connect();

try {
  // Drop all FK constraints, then re-add after import
  console.log('  Dropping FK constraints...');
  const { rows: fks } = await client.query(`
    SELECT tc.constraint_name, tc.table_name
    FROM information_schema.table_constraints tc
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
  `);

  // Save FK definitions for re-creation
  const fkDefs = [];
  for (const fk of fks) {
    const { rows: [def] } = await client.query(`
      SELECT pg_get_constraintdef(c.oid) as def
      FROM pg_constraint c
      JOIN pg_namespace n ON n.oid = c.connamespace
      WHERE c.conname = $1 AND n.nspname = 'public'
    `, [fk.constraint_name]);
    if (def) {
      fkDefs.push({
        table: fk.table_name,
        name: fk.constraint_name,
        def: def.def
      });
    }
    await client.query(`ALTER TABLE "${fk.table_name}" DROP CONSTRAINT "${fk.constraint_name}"`);
  }
  console.log(`  Dropped ${fkDefs.length} FK constraints`);

  // Truncate all tables
  const { rows: tables } = await client.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != 'schema_migrations'"
  );
  for (const { tablename } of tables) {
    await client.query(`TRUNCATE TABLE "${tablename}" CASCADE`);
  }
  console.log(`  Truncated ${tables.length} tables`);

  // Insert all data
  console.log('  Inserting data...');
  let ok = 0, fail = 0;
  const errors = [];

  for (const stmt of stmts) {
    try {
      await client.query(stmt);
      ok++;
    } catch (e) {
      fail++;
      if (errors.length < 20) {
        errors.push({ stmt: stmt.substring(0, 150), error: e.message });
      }
    }
  }

  console.log(`\n  Insert results: ${ok} ok, ${fail} failed`);
  if (errors.length > 0) {
    console.log('\n  Sample failures:');
    for (const e of errors.slice(0, 5)) {
      console.log(`    ${e.stmt.substring(0, 100)}`);
      console.log(`    → ${e.error}\n`);
    }
  }

  // Re-add FK constraints
  console.log('  Re-adding FK constraints...');
  let fkOk = 0, fkFail = 0;
  for (const fk of fkDefs) {
    try {
      await client.query(`ALTER TABLE "${fk.table}" ADD CONSTRAINT "${fk.name}" ${fk.def}`);
      fkOk++;
    } catch (e) {
      fkFail++;
      console.log(`    FK fail: ${fk.table}.${fk.name} → ${e.message}`);
    }
  }
  console.log(`  FK constraints restored: ${fkOk} ok, ${fkFail} failed`);

  console.log(`\nDone! ${ok}/${stmts.length} rows migrated`);
} finally {
  await client.end();
}
