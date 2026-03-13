#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const PG_SCHEMA_DIR = path.join(ROOT, 'services', 'api', 'src', 'db', 'pg-schema');
const BACKUP_JSON = path.join(ROOT, 'scripts', 'd1-backup', 'i18n_translations.json');
const LANGS = ['ko', 'en', 'ja', 'zh_cn', 'zh_tw', 'es', 'fr', 'de', 'pt', 'vi', 'th', 'id_lang', 'ar'];
const NON_KO_LANGS = LANGS.filter((lang) => lang !== 'ko');
const WRITE = process.argv.includes('--write');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function scanSqlFiles() {
  const files = fs.readdirSync(PG_SCHEMA_DIR)
    .filter((name) => name.endsWith('.sql'))
    .sort();

  return files.map((name) => {
    const fullPath = path.join(PG_SCHEMA_DIR, name);
    const content = fs.readFileSync(fullPath, 'utf8');
    return {
      name,
      hasI18n: content.includes('i18n_translations'),
      inserts: (content.match(/INSERT\s+INTO\s+i18n_translations/gi) || []).length,
      updates: (content.match(/UPDATE\s+i18n_translations/gi) || []).length,
    };
  }).filter((file) => file.hasI18n);
}

function fillRow(row) {
  const next = { ...row };
  const ko = String(row.ko ?? '').trim();
  const en = String(row.en ?? '').trim();
  const koFallback = ko || en || String(row.key ?? '').trim();

  if (!ko && koFallback) next.ko = koFallback;
  if (!en && koFallback) next.en = koFallback;

  for (const lang of NON_KO_LANGS) {
    if (!String(row[lang] ?? '').trim()) {
      next[lang] = koFallback;
    }
  }

  return next;
}

function auditBackupRows(rows) {
  const missingByLang = Object.fromEntries(LANGS.map((lang) => [lang, 0]));
  let rowsWithMissing = 0;
  let suspiciousKeyLiteral = 0;

  for (const row of rows) {
    let hasMissing = false;
    for (const lang of LANGS) {
      const value = String(row[lang] ?? '').trim();
      if (!value) {
        missingByLang[lang] += 1;
        hasMissing = true;
      }
      if (value && value === String(row.key ?? '').trim()) {
        suspiciousKeyLiteral += 1;
      }
    }
    if (hasMissing) rowsWithMissing += 1;
  }

  return { missingByLang, rowsWithMissing, suspiciousKeyLiteral };
}

const sqlFiles = scanSqlFiles();
console.log('SQL i18n sources:');
for (const file of sqlFiles) {
  console.log(`- ${file.name}: insert=${file.inserts}, update=${file.updates}`);
}

const rows = readJson(BACKUP_JSON);
const before = auditBackupRows(rows);
console.log('\nBackup JSON audit (before):');
console.log(JSON.stringify(before, null, 2));

if (WRITE) {
  const nextRows = rows.map(fillRow);
  fs.writeFileSync(BACKUP_JSON, `${JSON.stringify(nextRows, null, 2)}\n`, 'utf8');
  const after = auditBackupRows(nextRows);
  console.log('\nBackup JSON audit (after):');
  console.log(JSON.stringify(after, null, 2));
}
