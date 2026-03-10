#!/usr/bin/env node
/**
 * Generate Business Category L3 (Service Style) seed data
 *
 * Reads definitions from business-l3-definitions.js and appends entries to:
 *   - scripts/d1-backup/master_items.json
 *   - scripts/d1-backup/i18n_translations.json
 *
 * Usage:
 *   node scripts/generate-business-l3-seed.js          # append to JSON
 *   node scripts/generate-business-l3-seed.js --dry-run # preview counts only
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DOG_BREEDS, CAT_BREEDS, GROUPS } = require('./business-l3-definitions');

// ─── Paths ──────────────────────────────────────────────────────────
const BACKUP_DIR = path.join(__dirname, 'd1-backup');
const MASTER_ITEMS_PATH = path.join(BACKUP_DIR, 'master_items.json');
const I18N_PATH = path.join(BACKUP_DIR, 'i18n_translations.json');

// ─── Constants ──────────────────────────────────────────────────────
const TIMESTAMP = '2026-03-10 12:00:00';
const CATEGORY_ID = 'mc-business-category';
const I18N_PAGE = 'master';

// L1 business → L2 parent mapping (L3 items are children of L2 professional roles)
const BIZ_L2_PARENT = {
  grooming: 'mi-business-groomer',
  hospital: 'mi-business-doctor',
  training: 'mi-business-trainer',
};

// Build breed lookup: breedSlug -> breedId
const BREED_LOOKUP = {};
for (const [id, slug] of DOG_BREEDS) BREED_LOOKUP[slug] = id;
for (const [id, slug] of CAT_BREEDS) BREED_LOOKUP[slug] = id;

// ─── Helpers ────────────────────────────────────────────────────────
function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

function slugToUnderscore(slug) {
  return slug.replace(/-/g, '_');
}

function validateNoDashes(value, context) {
  if (typeof value === 'string' && value.includes('--')) {
    throw new Error(`"--" found in ${context}: "${value}"`);
  }
}

// ─── Generate ───────────────────────────────────────────────────────
function generate() {
  const masterItems = [];
  const i18nEntries = [];
  let sortBase = 10000; // start sort_order for L3 items

  for (const group of GROUPS) {
    const [bizId, bizSlug] = group.business;
    const [petId, petSlug] = group.pet;

    // Determine breed list for this pet type
    const breedList = petSlug === 'dog' ? DOG_BREEDS : CAT_BREEDS;
    let breedIndex = 0;

    for (const [breedMasterId, breedSlug] of breedList) {
      const styles = group.items[breedSlug];
      if (!styles) continue; // breed not defined for this group

      breedIndex++;
      let styleIndex = 0;

      for (const [styleSlug, ko, en, ja] of styles) {
        styleIndex++;

        // Validate no "--"
        validateNoDashes(ko, `ko for ${bizSlug}/${petSlug}/${breedSlug}/${styleSlug}`);
        validateNoDashes(en, `en for ${bizSlug}/${petSlug}/${breedSlug}/${styleSlug}`);
        validateNoDashes(ja, `ja for ${bizSlug}/${petSlug}/${breedSlug}/${styleSlug}`);

        // Build identifiers
        const id = `mi-svc-${bizSlug}-${petSlug}-${breedSlug}-${styleSlug}`;
        const code = slugToUnderscore(`${bizSlug}_${petSlug}_${breedSlug}_${styleSlug}`);
        const i18nKey = `master.business_category.${code}`;
        const sortOrder = sortBase + breedIndex * 100 + styleIndex;

        // Metadata
        const metadata = JSON.stringify({
          item_level: 'l3',
          business_category_l1_id: bizId,
          pet_type_l1_id: petId,
          pet_type_l2_id: breedMasterId,
        });

        // L3 parent = L2 professional role
        const parentItemId = BIZ_L2_PARENT[bizSlug] || null;

        // master_items entry
        masterItems.push({
          id,
          category_id: CATEGORY_ID,
          parent_item_id: parentItemId,
          code,
          name: null,
          description: null,
          sort_order: sortOrder,
          status: 'active',
          metadata,
          created_at: TIMESTAMP,
          updated_at: TIMESTAMP,
          device_type_id: null,
        });

        // i18n entry (13 languages, non-ko/en/ja default to en)
        i18nEntries.push({
          id: md5(i18nKey),
          key: i18nKey,
          page: I18N_PAGE,
          ko,
          en,
          ja,
          zh_cn: en,
          zh_tw: en,
          es: en,
          fr: en,
          de: en,
          pt: en,
          vi: en,
          th: en,
          id_lang: en,
          ar: en,
          is_active: 1,
          created_at: TIMESTAMP,
          updated_at: TIMESTAMP,
        });
      }
    }

    sortBase += 10000; // next business type group
  }

  return { masterItems, i18nEntries };
}

// ─── Main ───────────────────────────────────────────────────────────
function main() {
  const dryRun = process.argv.includes('--dry-run');
  const { masterItems, i18nEntries } = generate();

  console.log(`Generated ${masterItems.length} master_items (L3 service styles)`);
  console.log(`Generated ${i18nEntries.length} i18n_translations`);

  // Count by group
  const groupCounts = {};
  for (const item of masterItems) {
    const meta = JSON.parse(item.metadata);
    const bizId = meta.business_category_l1_id;
    const petId = meta.pet_type_l1_id;
    const key = `${bizId} + ${petId}`;
    groupCounts[key] = (groupCounts[key] || 0) + 1;
  }
  console.log('\nBreakdown:');
  for (const [key, count] of Object.entries(groupCounts)) {
    console.log(`  ${key}: ${count}`);
  }

  if (dryRun) {
    console.log('\n(dry-run mode, no files modified)');
    return;
  }

  // Check for duplicate IDs
  const existingMaster = JSON.parse(fs.readFileSync(MASTER_ITEMS_PATH, 'utf-8'));
  const existingI18n = JSON.parse(fs.readFileSync(I18N_PATH, 'utf-8'));

  const existingMasterIds = new Set(existingMaster.map(r => r.id));
  const existingI18nIds = new Set(existingI18n.map(r => r.id));

  const dupeItems = masterItems.filter(r => existingMasterIds.has(r.id));
  const dupeI18n = i18nEntries.filter(r => existingI18nIds.has(r.id));

  if (dupeItems.length > 0) {
    console.log(`\nRemoving ${dupeItems.length} duplicate master_items (already exist)`);
  }
  if (dupeI18n.length > 0) {
    console.log(`Removing ${dupeI18n.length} duplicate i18n entries (already exist)`);
  }

  const newItems = masterItems.filter(r => !existingMasterIds.has(r.id));
  const newI18n = i18nEntries.filter(r => !existingI18nIds.has(r.id));

  if (newItems.length === 0 && newI18n.length === 0) {
    console.log('\nNo new entries to add. All items already exist.');
    return;
  }

  // Append
  const mergedMaster = [...existingMaster, ...newItems];
  const mergedI18n = [...existingI18n, ...newI18n];

  fs.writeFileSync(MASTER_ITEMS_PATH, JSON.stringify(mergedMaster, null, 2) + '\n');
  fs.writeFileSync(I18N_PATH, JSON.stringify(mergedI18n, null, 2) + '\n');

  console.log(`\nAppended ${newItems.length} master_items to ${path.relative(process.cwd(), MASTER_ITEMS_PATH)}`);
  console.log(`Appended ${newI18n.length} i18n entries to ${path.relative(process.cwd(), I18N_PATH)}`);
  console.log('\nNext: run  node scripts/generate-pg-seed.js  to regenerate SQL');
}

main();
