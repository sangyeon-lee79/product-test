-- 0060_feed_type_l3_mapping_normalization_phase1.sql
-- Normalize manufacturer/model feed type mapping to valid diet_feed_type (L3) codes.
-- Scope: phase1 manufacturers (royal_canin, hills, orijen, acana, ray_n_yvonne)

-- ---------------------------------------------------------------------------
-- 1) Allowed manufacturer -> feed_type(L3) mapping (phase1 canonical)
-- ---------------------------------------------------------------------------
WITH allowed(mfr_key, feed_type_code) AS (
  VALUES
    ('royal_canin', 'dry_food_core'),
    ('royal_canin', 'wet_food_core'),
    ('royal_canin', 'prescription_diet_core'),

    ('hills', 'dry_food_core'),
    ('hills', 'wet_food_core'),
    ('hills', 'prescription_diet_core'),

    ('orijen', 'dry_food_core'),
    ('orijen', 'wet_food_core'),
    ('orijen', 'freeze_dried_complete_core'),

    ('acana', 'dry_food_core'),
    ('acana', 'wet_food_core'),
    ('acana', 'freeze_dried_complete_core'),

    ('ray_n_yvonne', 'raw_frozen_food_core'),
    ('ray_n_yvonne', 'wet_food_core'),
    ('ray_n_yvonne', 'prescription_diet_core'),
    ('ray_n_yvonne', 'snack_treat_core')
)
DELETE FROM feed_manufacturer_type_map
WHERE manufacturer_id IN (
    SELECT id FROM feed_manufacturers
    WHERE key IN ('royal_canin', 'hills', 'orijen', 'acana', 'ray_n_yvonne')
  )
  AND type_item_id IN (
    SELECT mi.id
    FROM master_items mi
    JOIN master_categories mc ON mc.id = mi.category_id
    WHERE mc.code = 'diet_feed_type'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM allowed a
    JOIN feed_manufacturers m ON m.key = a.mfr_key
    JOIN master_items mi
      ON mi.code = a.feed_type_code
     AND mi.category_id = (SELECT id FROM master_categories WHERE code = 'diet_feed_type' LIMIT 1)
    WHERE m.id = feed_manufacturer_type_map.manufacturer_id
      AND mi.id = feed_manufacturer_type_map.type_item_id
  );

WITH allowed(mfr_key, feed_type_code) AS (
  VALUES
    ('royal_canin', 'dry_food_core'),
    ('royal_canin', 'wet_food_core'),
    ('royal_canin', 'prescription_diet_core'),
    ('hills', 'dry_food_core'),
    ('hills', 'wet_food_core'),
    ('hills', 'prescription_diet_core'),
    ('orijen', 'dry_food_core'),
    ('orijen', 'wet_food_core'),
    ('orijen', 'freeze_dried_complete_core'),
    ('acana', 'dry_food_core'),
    ('acana', 'wet_food_core'),
    ('acana', 'freeze_dried_complete_core'),
    ('ray_n_yvonne', 'raw_frozen_food_core'),
    ('ray_n_yvonne', 'wet_food_core'),
    ('ray_n_yvonne', 'prescription_diet_core'),
    ('ray_n_yvonne', 'snack_treat_core')
)
INSERT OR IGNORE INTO feed_manufacturer_type_map (id, manufacturer_id, type_item_id, created_at)
SELECT
  lower(hex(randomblob(16))),
  m.id,
  mi.id,
  datetime('now')
FROM allowed a
JOIN feed_manufacturers m ON m.key = a.mfr_key
JOIN master_items mi
  ON mi.code = a.feed_type_code
 AND mi.category_id = (SELECT id FROM master_categories WHERE code = 'diet_feed_type' LIMIT 1);

-- ---------------------------------------------------------------------------
-- 2) Normalize phase1 model -> feed_type(L3) mapping
--    (prevents legacy keys like adult_daily_formula / puppy_small_breed_formula)
-- ---------------------------------------------------------------------------
WITH model_target(name_key, feed_type_code) AS (
  VALUES
    ('feed.model.royal_canin_small_adult_dry_14lb', 'dry_food_core'),
    ('feed.model.royal_canin_medium_adult_dry_30lb', 'dry_food_core'),
    ('feed.model.royal_canin_indoor_adult_dry_cat_15lb', 'dry_food_core'),
    ('feed.model.royal_canin_large_adult_dry_40lb', 'dry_food_core'),
    ('feed.model.royal_canin_gastrointestinal_low_fat_dry_17_6lb', 'prescription_diet_core'),

    ('feed.model.hills_science_diet_adult_chicken_barley_dry_45lb', 'dry_food_core'),
    ('feed.model.hills_science_diet_puppy_chicken_brown_rice_dry_15_5lb', 'dry_food_core'),
    ('feed.model.hills_science_diet_adult_small_bites_chicken_barley_dry_15lb', 'dry_food_core'),
    ('feed.model.hills_science_diet_adult_light_small_bites_dry_15lb', 'dry_food_core'),
    ('feed.model.hills_prescription_diet_cd_multicare_urinary_metabolic_dry_24_5lb', 'prescription_diet_core'),

    ('feed.model.orijen_original_dry_dog_23_5lb', 'dry_food_core'),
    ('feed.model.orijen_six_fish_dry_dog_23_5lb', 'dry_food_core'),
    ('feed.model.orijen_regional_red_dry_dog_23_5lb', 'dry_food_core'),
    ('feed.model.orijen_puppy_dry_dog_23_5lb', 'dry_food_core'),
    ('feed.model.orijen_cat_and_kitten_dry_cat_12lb', 'dry_food_core'),

    ('feed.model.acana_wild_atlantic_dry_cat_10lb', 'dry_food_core'),
    ('feed.model.acana_wholesome_grains_puppy_sea_farm_dry_22_5lb', 'dry_food_core'),
    ('feed.model.acana_wholesome_grains_large_breed_puppy_dry_22_5lb', 'dry_food_core'),
    ('feed.model.acana_wholesome_grains_large_breed_adult_dry_22_5lb', 'dry_food_core'),
    ('feed.model.acana_wholesome_grains_red_meat_grains_dry_22_5lb', 'dry_food_core'),

    ('feed.model.ray_yvonne_deer_eggshell_raw_9p', 'raw_frozen_food_core'),
    ('feed.model.ray_yvonne_lamb_bone_raw_12p', 'raw_frozen_food_core'),
    ('feed.model.ray_yvonne_beef_cooked_12p', 'wet_food_core'),
    ('feed.model.ray_yvonne_chicken_renal_care_12p', 'prescription_diet_core'),
    ('feed.model.ray_yvonne_chicken_pancreas_care_12p', 'prescription_diet_core')
)
UPDATE feed_models
SET
  feed_type_item_id = (
    SELECT mi.id
    FROM model_target mt
    JOIN master_items mi
      ON mi.code = mt.feed_type_code
     AND mi.category_id = (SELECT id FROM master_categories WHERE code = 'diet_feed_type' LIMIT 1)
    WHERE mt.name_key = feed_models.name_key
  ),
  updated_at = datetime('now')
WHERE name_key IN (SELECT name_key FROM model_target);

INSERT OR IGNORE INTO schema_migrations (version)
VALUES ('0060_feed_type_l3_mapping_normalization_phase1');
