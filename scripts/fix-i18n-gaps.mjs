#!/usr/bin/env node
// Fix all i18n translation gaps in Neon after D1→PG migration

import pg from 'pg';
import crypto from 'crypto';

const NEON_URL = 'postgresql://neondb_owner:npg_G03iUyefITHm@ep-plain-feather-a1yj4peb.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const LANGS = ['ko','en','ja','zh_cn','zh_tw','es','fr','de','pt','vi','th','id_lang','ar'];
const newId = () => crypto.randomUUID().replace(/-/g, '');
const now = () => new Date().toISOString();

const client = new pg.Client(NEON_URL);
await client.connect();

let created = 0, updated = 0;

// Helper: upsert i18n entry
async function ensureI18n(key, page, translations) {
  const existing = await client.query('SELECT id FROM i18n_translations WHERE key = $1', [key]);

  if (existing.rows.length === 0) {
    // INSERT new
    const id = newId();
    const ts = now();
    await client.query(
      `INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,true,$17,$18)`,
      [id, key, page,
       translations.ko || translations.en || key,
       translations.en || translations.ko || key,
       translations.ja || translations.en || translations.ko || '',
       translations.zh_cn || translations.en || '',
       translations.zh_tw || translations.en || '',
       translations.es || translations.en || '',
       translations.fr || translations.en || '',
       translations.de || translations.en || '',
       translations.pt || translations.en || '',
       translations.vi || translations.en || '',
       translations.th || translations.en || '',
       translations.id_lang || translations.en || '',
       translations.ar || translations.en || '',
       ts, ts]
    );
    created++;
    console.log(`  CREATE: ${key}`);
  } else {
    // UPDATE empty language columns
    const row = await client.query('SELECT * FROM i18n_translations WHERE key = $1', [key]);
    const r = row.rows[0];
    const updates = [];
    const vals = [];
    let idx = 1;

    for (const lang of LANGS) {
      const val = r[lang];
      if (!val || val.trim() === '') {
        const fallback = translations[lang] || translations.en || translations.ko || r.en || r.ko || '';
        if (fallback) {
          updates.push(`${lang} = $${idx}`);
          vals.push(fallback);
          idx++;
        }
      }
    }

    if (updates.length > 0) {
      updates.push(`updated_at = $${idx}`);
      vals.push(now());
      await client.query(
        `UPDATE i18n_translations SET ${updates.join(', ')} WHERE key = $${idx + 1}`,
        [...vals, key]
      );
      updated++;
      console.log(`  UPDATE: ${key} (${updates.length - 1} langs filled)`);
    }
  }
}

try {
  // ═══════════════════════════════════════════════════════════════════
  // 1. Missing master_categories i18n
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n1. Missing master_categories i18n...');
  const cats = await client.query('SELECT id, code FROM master_categories');
  for (const c of cats.rows) {
    const key = `master.${c.code}`;
    await ensureI18n(key, 'master', {
      ko: c.code, en: c.code  // will be updated later with proper labels
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // 2. Missing master_items i18n
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n2. Missing master_items i18n...');
  const items = await client.query(`
    SELECT mi.id, mc.code as cat_code, mi.code as item_code
    FROM master_items mi
    JOIN master_categories mc ON mi.category_id = mc.id
  `);

  // Korean labels for known items
  const LABELS = {
    'diet_type.freeze_dried_food': { ko: '동결건조사료', en: 'Freeze-Dried Food' },
    'diet_type.prescription_food': { ko: '처방식', en: 'Prescription Food' },
    'diet_type.snack': { ko: '간식', en: 'Snack' },
    'diet_subtype.adult_dry_food': { ko: '성견 건사료', en: 'Adult Dry Food' },
    'diet_subtype.canned_food': { ko: '캔 사료', en: 'Canned Food' },
    'diet_subtype.raw_meat': { ko: '생육', en: 'Raw Meat' },
    'diet_subtype.freeze_dried_complete': { ko: '동결건조 완전식', en: 'Freeze-Dried Complete' },
    'diet_subtype.freeze_dried_snack': { ko: '동결건조 간식', en: 'Freeze-Dried Snack' },
    'diet_subtype.kidney_diet': { ko: '신장 처방식', en: 'Kidney Diet' },
    'diet_subtype.training_snack': { ko: '훈련용 간식', en: 'Training Snack' },
    // Category labels
    'diet_subtype': { ko: '식사 세부유형', en: 'Diet Subtype' },
    'diet_feed_type': { ko: '사료 유형', en: 'Feed Type' },
  };

  for (const item of items.rows) {
    const itemKey = `${item.cat_code}.${item.item_code}`;
    const i18nKey = `master.${itemKey}`;
    const labels = LABELS[itemKey] || { ko: item.item_code.replace(/_/g, ' '), en: item.item_code.replace(/_/g, ' ') };
    await ensureI18n(i18nKey, 'master', labels);
  }

  // Also ensure category-level keys
  for (const [catCode, labels] of Object.entries(LABELS)) {
    if (!catCode.includes('.')) {
      await ensureI18n(`master.${catCode}`, 'master', labels);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 3. Missing country/currency name_key i18n
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n3. Missing country/currency i18n...');

  const COUNTRY_LABELS = {
    'country.gb': { ko: '영국', en: 'United Kingdom', ja: 'イギリス', zh_cn: '英国', zh_tw: '英國', es: 'Reino Unido', fr: 'Royaume-Uni', de: 'Vereinigtes Königreich', pt: 'Reino Unido', vi: 'Vương quốc Anh', th: 'สหราชอาณาจักร', id_lang: 'Britania Raya', ar: 'المملكة المتحدة' },
    'country.br': { ko: '브라질', en: 'Brazil', ja: 'ブラジル', zh_cn: '巴西', zh_tw: '巴西', es: 'Brasil', fr: 'Brésil', de: 'Brasilien', pt: 'Brasil', vi: 'Brazil', th: 'บราซิล', id_lang: 'Brasil', ar: 'البرازيل' },
  };

  const CURRENCY_LABELS = {
    'currency.gbp': { ko: '영국 파운드', en: 'British Pound', ja: '英ポンド', zh_cn: '英镑', zh_tw: '英鎊', es: 'Libra esterlina', fr: 'Livre sterling', de: 'Pfund Sterling', pt: 'Libra esterlina', vi: 'Bảng Anh', th: 'ปอนด์สเตอร์ลิง', id_lang: 'Poundsterling', ar: 'جنيه إسترليني' },
    'currency.brl': { ko: '브라질 헤알', en: 'Brazilian Real', ja: 'ブラジルレアル', zh_cn: '巴西雷亚尔', zh_tw: '巴西雷亞爾', es: 'Real brasileño', fr: 'Réal brésilien', de: 'Brasilianischer Real', pt: 'Real brasileiro', vi: 'Real Brasil', th: 'เรียลบราซิล', id_lang: 'Real Brasil', ar: 'ريال برازيلي' },
  };

  for (const [key, labels] of Object.entries(COUNTRY_LABELS)) {
    await ensureI18n(key, 'country', labels);
  }
  for (const [key, labels] of Object.entries(CURRENCY_LABELS)) {
    await ensureI18n(key, 'currency', labels);
  }

  // ═══════════════════════════════════════════════════════════════════
  // 4. Fill incomplete translations (6 keys missing non-ko/en)
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n4. Filling incomplete translations...');

  const DEVICE_LABELS = {
    'device.manufacturer.abbott': { ko: 'Abbott', en: 'Abbott' },
    'device.manufacturer.lifescan': { ko: 'LifeScan', en: 'LifeScan' },
    'device.manufacturer.omron': { ko: 'Omron', en: 'Omron' },
    'device.manufacturer.roche': { ko: 'Roche', en: 'Roche' },
    'platform.name': { ko: '펫폴리오', en: 'Petfolio' },
    'platform.tagline': {
      ko: '반려동물의 삶을 기록하는 포트폴리오 플랫폼',
      en: "Your pet's life portfolio",
      ja: 'ペットの生涯ポートフォリオ',
      zh_cn: '记录宠物一生的作品集平台',
      zh_tw: '記錄寵物一生的作品集平台',
      es: 'Portafolio de vida de tu mascota',
      fr: 'Portfolio de vie de votre animal',
      de: 'Das Lebensportfolio Ihres Haustieres',
      pt: 'Portfólio de vida do seu pet',
      vi: 'Hồ sơ cuộc đời thú cưng',
      th: 'พอร์ตโฟลิโอชีวิตสัตว์เลี้ยง',
      id_lang: 'Portofolio kehidupan hewan peliharaan',
      ar: 'محفظة حياة حيوانك الأليف'
    },
  };

  for (const [key, labels] of Object.entries(DEVICE_LABELS)) {
    await ensureI18n(key, key.startsWith('device') ? 'device' : 'platform', labels);
  }

  // ═══════════════════════════════════════════════════════════════════
  // 5. Scan ALL i18n for any remaining empty language columns
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n5. Scanning for any remaining empty translations...');

  const allRows = await client.query(
    'SELECT * FROM i18n_translations WHERE is_active = true'
  );

  let emptyCount = 0;
  for (const row of allRows.rows) {
    const updates = [];
    const vals = [];
    let idx = 1;

    for (const lang of LANGS) {
      if (!row[lang] || row[lang].trim() === '') {
        // Use en fallback, then ko fallback
        const fallback = row.en || row.ko || row.key;
        updates.push(`${lang} = $${idx}`);
        vals.push(fallback);
        idx++;
        emptyCount++;
      }
    }

    if (updates.length > 0) {
      updates.push(`updated_at = $${idx}`);
      vals.push(now());
      await client.query(
        `UPDATE i18n_translations SET ${updates.join(', ')} WHERE id = $${idx + 1}`,
        [...vals, row.id]
      );
    }
  }
  console.log(`  Filled ${emptyCount} empty language cells with fallback values`);

  // ═══════════════════════════════════════════════════════════════════
  // Final verification
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n=== Final Verification ===');
  const total = await client.query('SELECT COUNT(*) as c FROM i18n_translations WHERE is_active = true');
  console.log(`Total active i18n entries: ${total.rows[0].c}`);

  for (const lang of LANGS) {
    const missing = await client.query(
      `SELECT COUNT(*) as c FROM i18n_translations WHERE is_active = true AND (${lang} IS NULL OR TRIM(${lang}) = '')`
    );
    if (parseInt(missing.rows[0].c) > 0) {
      console.log(`  ${lang}: ${missing.rows[0].c} still missing`);
    }
  }

  console.log(`\nSummary: ${created} created, ${updated} updated`);

} finally {
  await client.end();
}
