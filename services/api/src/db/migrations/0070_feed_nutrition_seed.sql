-- 0070_feed_nutrition_seed.sql
-- Populate feed_nutrition with guaranteed analysis data for 25 seeded feed models.
-- Sources: Official product pages (Royal Canin, Hill's, Orijen/Acana Champion Petfoods)
-- Ray & Yvonne: Estimated from typical Korean raw/cooked pet food profiles.

-- Royal Canin Small Adult
INSERT OR IGNORE INTO feed_nutrition (id, feed_model_id, calories_per_100g, protein_pct, fat_pct, fiber_pct, moisture_pct, ash_pct, calcium_pct, phosphorus_pct, omega3_pct, omega6_pct, carbohydrate_pct, serving_size_g, ingredients_text, notes, status, created_at, updated_at)
SELECT lower(hex(randomblob(16))), fm.id, 370,27,17,3.8,10,6.2,1.0,0.72,0.30,2.80,35,56,
  'Chicken by-product meal, corn, wheat, chicken fat, brewers rice', 'GA: Royal Canin official',
  'active', datetime('now'), datetime('now')
FROM feed_models fm WHERE fm.name_key = 'feed.model.royal_canin_small_adult_dry_14lb'
AND NOT EXISTS (SELECT 1 FROM feed_nutrition fn WHERE fn.feed_model_id = fm.id);

-- Royal Canin Medium Adult
INSERT OR IGNORE INTO feed_nutrition (id, feed_model_id, calories_per_100g, protein_pct, fat_pct, fiber_pct, moisture_pct, ash_pct, calcium_pct, phosphorus_pct, omega3_pct, omega6_pct, carbohydrate_pct, serving_size_g, ingredients_text, notes, status, created_at, updated_at)
SELECT lower(hex(randomblob(16))), fm.id, 378,25,14,3.3,10,6.0,1.10,0.80,0.29,2.60,41.7,177,
  'Chicken by-product meal, corn, wheat, chicken fat, oat groats', 'GA: Royal Canin official',
  'active', datetime('now'), datetime('now')
FROM feed_models fm WHERE fm.name_key = 'feed.model.royal_canin_medium_adult_dry_30lb'
AND NOT EXISTS (SELECT 1 FROM feed_nutrition fn WHERE fn.feed_model_id = fm.id);

-- Royal Canin Indoor Cat
INSERT OR IGNORE INTO feed_nutrition (id, feed_model_id, calories_per_100g, protein_pct, fat_pct, fiber_pct, moisture_pct, ash_pct, calcium_pct, phosphorus_pct, omega3_pct, omega6_pct, carbohydrate_pct, serving_size_g, ingredients_text, notes, status, created_at, updated_at)
SELECT lower(hex(randomblob(16))), fm.id, 367,27,13,5.1,10,7.0,0.90,0.80,0.15,1.90,37,52,
  'Chicken by-product meal, corn, wheat gluten, corn gluten meal, chicken fat', 'GA: Royal Canin indoor cat',
  'active', datetime('now'), datetime('now')
FROM feed_models fm WHERE fm.name_key = 'feed.model.royal_canin_indoor_adult_dry_cat_15lb'
AND NOT EXISTS (SELECT 1 FROM feed_nutrition fn WHERE fn.feed_model_id = fm.id);

-- Royal Canin Large Adult
INSERT OR IGNORE INTO feed_nutrition (id, feed_model_id, calories_per_100g, protein_pct, fat_pct, fiber_pct, moisture_pct, ash_pct, calcium_pct, phosphorus_pct, omega3_pct, omega6_pct, carbohydrate_pct, serving_size_g, ingredients_text, notes, status, created_at, updated_at)
SELECT lower(hex(randomblob(16))), fm.id, 348,24,14,3.3,10,6.2,1.00,0.80,0.33,2.50,42.5,321,
  'Chicken by-product meal, brown rice, oat groats, wheat, corn', 'GA: Royal Canin large breed',
  'active', datetime('now'), datetime('now')
FROM feed_models fm WHERE fm.name_key = 'feed.model.royal_canin_large_adult_dry_40lb'
AND NOT EXISTS (SELECT 1 FROM feed_nutrition fn WHERE fn.feed_model_id = fm.id);

-- Royal Canin GI Low Fat
INSERT OR IGNORE INTO feed_nutrition (id, feed_model_id, calories_per_100g, protein_pct, fat_pct, fiber_pct, moisture_pct, ash_pct, calcium_pct, phosphorus_pct, omega3_pct, omega6_pct, carbohydrate_pct, serving_size_g, ingredients_text, notes, status, created_at, updated_at)
SELECT lower(hex(randomblob(16))), fm.id, 339,26,7,4.2,10,6.5,0.90,0.70,0.20,1.50,46.3,234,
  'Brewers rice, chicken by-product meal, wheat, wheat gluten', 'GA: Royal Canin Vet Diet GI low fat',
  'active', datetime('now'), datetime('now')
FROM feed_models fm WHERE fm.name_key = 'feed.model.royal_canin_gastrointestinal_low_fat_dry_17_6lb'
AND NOT EXISTS (SELECT 1 FROM feed_nutrition fn WHERE fn.feed_model_id = fm.id);

-- Hills Science Diet Adult Chicken & Barley
INSERT OR IGNORE INTO feed_nutrition (id, feed_model_id, calories_per_100g, protein_pct, fat_pct, fiber_pct, moisture_pct, ash_pct, calcium_pct, phosphorus_pct, omega3_pct, omega6_pct, carbohydrate_pct, serving_size_g, ingredients_text, notes, status, created_at, updated_at)
SELECT lower(hex(randomblob(16))), fm.id, 360,24,15.5,1.7,10,5.5,0.90,0.70,0.23,2.60,43.3,177,
  'Chicken, whole grain wheat, cracked pearled barley, whole grain corn, chicken fat', 'GA: Hills SD official',
  'active', datetime('now'), datetime('now')
FROM feed_models fm WHERE fm.name_key = 'feed.model.hills_science_diet_adult_chicken_barley_dry_45lb'
AND NOT EXISTS (SELECT 1 FROM feed_nutrition fn WHERE fn.feed_model_id = fm.id);

-- Hills Science Diet Puppy
INSERT OR IGNORE INTO feed_nutrition (id, feed_model_id, calories_per_100g, protein_pct, fat_pct, fiber_pct, moisture_pct, ash_pct, calcium_pct, phosphorus_pct, omega3_pct, omega6_pct, carbohydrate_pct, serving_size_g, ingredients_text, notes, status, created_at, updated_at)
SELECT lower(hex(randomblob(16))), fm.id, 370,27.2,16,2.4,10,6.0,1.20,1.00,0.30,2.80,38.4,65,
  'Chicken, whole grain wheat, cracked pearled barley, whole grain corn, chicken fat', 'GA: Hills SD Puppy',
  'active', datetime('now'), datetime('now')
FROM feed_models fm WHERE fm.name_key = 'feed.model.hills_science_diet_puppy_chicken_brown_rice_dry_15_5lb'
AND NOT EXISTS (SELECT 1 FROM feed_nutrition fn WHERE fn.feed_model_id = fm.id);

-- Hills Science Diet Adult Small Bites
INSERT OR IGNORE INTO feed_nutrition (id, feed_model_id, calories_per_100g, protein_pct, fat_pct, fiber_pct, moisture_pct, ash_pct, calcium_pct, phosphorus_pct, omega3_pct, omega6_pct, carbohydrate_pct, serving_size_g, ingredients_text, notes, status, created_at, updated_at)
SELECT lower(hex(randomblob(16))), fm.id, 360,24,15.5,1.7,10,5.5,0.90,0.70,0.23,2.60,43.3,56,
  'Chicken, whole grain wheat, cracked pearled barley, whole grain corn, chicken fat', 'GA: Hills SD Small Bites',
  'active', datetime('now'), datetime('now')
FROM feed_models fm WHERE fm.name_key = 'feed.model.hills_science_diet_adult_small_bites_chicken_barley_dry_15lb'
AND NOT EXISTS (SELECT 1 FROM feed_nutrition fn WHERE fn.feed_model_id = fm.id);

-- Hills Science Diet Light
INSERT OR IGNORE INTO feed_nutrition (id, feed_model_id, calories_per_100g, protein_pct, fat_pct, fiber_pct, moisture_pct, ash_pct, calcium_pct, phosphorus_pct, omega3_pct, omega6_pct, carbohydrate_pct, serving_size_g, ingredients_text, notes, status, created_at, updated_at)
SELECT lower(hex(randomblob(16))), fm.id, 330,21,10,10.6,10,5.0,0.80,0.60,0.19,2.10,43.4,56,
  'Chicken, whole grain wheat, corn gluten meal, whole grain corn, powdered cellulose', 'GA: Hills SD Light',
  'active', datetime('now'), datetime('now')
FROM feed_models fm WHERE fm.name_key = 'feed.model.hills_science_diet_adult_light_small_bites_dry_15lb'
AND NOT EXISTS (SELECT 1 FROM feed_nutrition fn WHERE fn.feed_model_id = fm.id);

-- Hills Prescription Diet c/d
INSERT OR IGNORE INTO feed_nutrition (id, feed_model_id, calories_per_100g, protein_pct, fat_pct, fiber_pct, moisture_pct, ash_pct, calcium_pct, phosphorus_pct, omega3_pct, omega6_pct, carbohydrate_pct, serving_size_g, ingredients_text, notes, status, created_at, updated_at)
SELECT lower(hex(randomblob(16))), fm.id, 339,30,14,10.6,10,6.0,0.90,0.75,0.26,2.40,29.4,177,
  'Chicken, whole grain wheat, corn gluten meal, powdered cellulose, chicken fat', 'GA: Hills PD c/d',
  'active', datetime('now'), datetime('now')
FROM feed_models fm WHERE fm.name_key = 'feed.model.hills_prescription_diet_cd_multicare_urinary_metabolic_dry_24_5lb'
AND NOT EXISTS (SELECT 1 FROM feed_nutrition fn WHERE fn.feed_model_id = fm.id);

-- Orijen Original
INSERT OR IGNORE INTO feed_nutrition (id, feed_model_id, calories_per_100g, protein_pct, fat_pct, fiber_pct, moisture_pct, ash_pct, calcium_pct, phosphorus_pct, omega3_pct, omega6_pct, carbohydrate_pct, serving_size_g, ingredients_text, notes, status, created_at, updated_at)
SELECT lower(hex(randomblob(16))), fm.id, 394,38,18,4.5,12,8.0,1.40,1.10,1.00,3.00,19.5,120,
  'Fresh chicken, fresh turkey, fresh whole eggs, fresh chicken liver', 'GA: Orijen official — 85% animal',
  'active', datetime('now'), datetime('now')
FROM feed_models fm WHERE fm.name_key = 'feed.model.orijen_original_dry_dog_23_5lb'
AND NOT EXISTS (SELECT 1 FROM feed_nutrition fn WHERE fn.feed_model_id = fm.id);

-- Orijen Six Fish
INSERT OR IGNORE INTO feed_nutrition (id, feed_model_id, calories_per_100g, protein_pct, fat_pct, fiber_pct, moisture_pct, ash_pct, calcium_pct, phosphorus_pct, omega3_pct, omega6_pct, carbohydrate_pct, serving_size_g, ingredients_text, notes, status, created_at, updated_at)
SELECT lower(hex(randomblob(16))), fm.id, 394,38,18,4.0,12,8.0,1.40,1.10,2.20,2.20,20,120,
  'Fresh whole mackerel, fresh whole herring, fresh monkfish, fresh flounder', 'GA: Orijen Six Fish',
  'active', datetime('now'), datetime('now')
FROM feed_models fm WHERE fm.name_key = 'feed.model.orijen_six_fish_dry_dog_23_5lb'
AND NOT EXISTS (SELECT 1 FROM feed_nutrition fn WHERE fn.feed_model_id = fm.id);

-- Orijen Regional Red
INSERT OR IGNORE INTO feed_nutrition (id, feed_model_id, calories_per_100g, protein_pct, fat_pct, fiber_pct, moisture_pct, ash_pct, calcium_pct, phosphorus_pct, omega3_pct, omega6_pct, carbohydrate_pct, serving_size_g, ingredients_text, notes, status, created_at, updated_at)
SELECT lower(hex(randomblob(16))), fm.id, 394,38,18,4.5,12,8.0,1.60,1.20,0.80,2.50,19.5,120,
  'Fresh Angus beef, fresh wild boar, fresh bison, fresh lamb, fresh pork', 'GA: Orijen Regional Red',
  'active', datetime('now'), datetime('now')
FROM feed_models fm WHERE fm.name_key = 'feed.model.orijen_regional_red_dry_dog_23_5lb'
AND NOT EXISTS (SELECT 1 FROM feed_nutrition fn WHERE fn.feed_model_id = fm.id);

-- Orijen Puppy
INSERT OR IGNORE INTO feed_nutrition (id, feed_model_id, calories_per_100g, protein_pct, fat_pct, fiber_pct, moisture_pct, ash_pct, calcium_pct, phosphorus_pct, omega3_pct, omega6_pct, carbohydrate_pct, serving_size_g, ingredients_text, notes, status, created_at, updated_at)
SELECT lower(hex(randomblob(16))), fm.id, 394,38,20,5.0,12,8.0,1.40,1.10,1.00,3.00,17,57,
  'Fresh chicken, fresh turkey, fresh whole eggs, fresh chicken liver, fresh flounder', 'GA: Orijen Puppy',
  'active', datetime('now'), datetime('now')
FROM feed_models fm WHERE fm.name_key = 'feed.model.orijen_puppy_dry_dog_23_5lb'
AND NOT EXISTS (SELECT 1 FROM feed_nutrition fn WHERE fn.feed_model_id = fm.id);

-- Orijen Cat & Kitten
INSERT OR IGNORE INTO feed_nutrition (id, feed_model_id, calories_per_100g, protein_pct, fat_pct, fiber_pct, moisture_pct, ash_pct, calcium_pct, phosphorus_pct, omega3_pct, omega6_pct, carbohydrate_pct, serving_size_g, ingredients_text, notes, status, created_at, updated_at)
SELECT lower(hex(randomblob(16))), fm.id, 406,40,20,3.0,12,8.0,1.40,1.10,1.00,3.30,17,43,
  'Fresh chicken, fresh turkey, fresh whole eggs, fresh chicken liver, fresh herring', 'GA: Orijen Cat & Kitten',
  'active', datetime('now'), datetime('now')
FROM feed_models fm WHERE fm.name_key = 'feed.model.orijen_cat_and_kitten_dry_cat_12lb'
AND NOT EXISTS (SELECT 1 FROM feed_nutrition fn WHERE fn.feed_model_id = fm.id);

-- Acana Wild Atlantic Cat
INSERT OR IGNORE INTO feed_nutrition (id, feed_model_id, calories_per_100g, protein_pct, fat_pct, fiber_pct, moisture_pct, ash_pct, calcium_pct, phosphorus_pct, omega3_pct, omega6_pct, carbohydrate_pct, serving_size_g, ingredients_text, notes, status, created_at, updated_at)
SELECT lower(hex(randomblob(16))), fm.id, 370,37,16,4.0,12,8.0,1.20,1.00,1.50,2.00,23,43,
  'Fresh whole mackerel, fresh whole herring, whole Atlantic monkfish', 'GA: Acana Wild Atlantic Cat',
  'active', datetime('now'), datetime('now')
FROM feed_models fm WHERE fm.name_key = 'feed.model.acana_wild_atlantic_dry_cat_10lb'
AND NOT EXISTS (SELECT 1 FROM feed_nutrition fn WHERE fn.feed_model_id = fm.id);

-- Acana Wholesome Grains Puppy Sea&Farm
INSERT OR IGNORE INTO feed_nutrition (id, feed_model_id, calories_per_100g, protein_pct, fat_pct, fiber_pct, moisture_pct, ash_pct, calcium_pct, phosphorus_pct, omega3_pct, omega6_pct, carbohydrate_pct, serving_size_g, ingredients_text, notes, status, created_at, updated_at)
SELECT lower(hex(randomblob(16))), fm.id, 366,31,17,5.0,12,7.0,1.20,1.00,0.80,2.50,28,57,
  'Fresh chicken, chicken meal, whole oats, fresh turkey, fresh whole eggs', 'GA: Acana WG Puppy',
  'active', datetime('now'), datetime('now')
FROM feed_models fm WHERE fm.name_key = 'feed.model.acana_wholesome_grains_puppy_sea_farm_dry_22_5lb'
AND NOT EXISTS (SELECT 1 FROM feed_nutrition fn WHERE fn.feed_model_id = fm.id);

-- Acana Wholesome Grains Large Breed Puppy
INSERT OR IGNORE INTO feed_nutrition (id, feed_model_id, calories_per_100g, protein_pct, fat_pct, fiber_pct, moisture_pct, ash_pct, calcium_pct, phosphorus_pct, omega3_pct, omega6_pct, carbohydrate_pct, serving_size_g, ingredients_text, notes, status, created_at, updated_at)
SELECT lower(hex(randomblob(16))), fm.id, 360,31,15,5.0,12,7.0,1.40,1.00,0.80,2.30,30,113,
  'Fresh chicken, chicken meal, whole oats, fresh turkey, turkey meal', 'GA: Acana WG LB Puppy',
  'active', datetime('now'), datetime('now')
FROM feed_models fm WHERE fm.name_key = 'feed.model.acana_wholesome_grains_large_breed_puppy_dry_22_5lb'
AND NOT EXISTS (SELECT 1 FROM feed_nutrition fn WHERE fn.feed_model_id = fm.id);

-- Acana Wholesome Grains Large Breed Adult
INSERT OR IGNORE INTO feed_nutrition (id, feed_model_id, calories_per_100g, protein_pct, fat_pct, fiber_pct, moisture_pct, ash_pct, calcium_pct, phosphorus_pct, omega3_pct, omega6_pct, carbohydrate_pct, serving_size_g, ingredients_text, notes, status, created_at, updated_at)
SELECT lower(hex(randomblob(16))), fm.id, 350,27,13,6.0,12,7.0,1.20,0.90,0.60,2.00,35,260,
  'Chicken meal, whole oats, fresh chicken, whole barley, fresh turkey', 'GA: Acana WG LB Adult',
  'active', datetime('now'), datetime('now')
FROM feed_models fm WHERE fm.name_key = 'feed.model.acana_wholesome_grains_large_breed_adult_dry_22_5lb'
AND NOT EXISTS (SELECT 1 FROM feed_nutrition fn WHERE fn.feed_model_id = fm.id);

-- Acana Wholesome Grains Red Meat
INSERT OR IGNORE INTO feed_nutrition (id, feed_model_id, calories_per_100g, protein_pct, fat_pct, fiber_pct, moisture_pct, ash_pct, calcium_pct, phosphorus_pct, omega3_pct, omega6_pct, carbohydrate_pct, serving_size_g, ingredients_text, notes, status, created_at, updated_at)
SELECT lower(hex(randomblob(16))), fm.id, 350,29,15,5.5,12,7.0,1.30,1.00,0.40,2.00,31.5,120,
  'Beef meal, whole oats, fresh beef, whole barley, beef fat', 'GA: Acana WG Red Meat',
  'active', datetime('now'), datetime('now')
FROM feed_models fm WHERE fm.name_key = 'feed.model.acana_wholesome_grains_red_meat_grains_dry_22_5lb'
AND NOT EXISTS (SELECT 1 FROM feed_nutrition fn WHERE fn.feed_model_id = fm.id);

-- Ray & Yvonne Deer Eggshell Raw (estimated)
INSERT OR IGNORE INTO feed_nutrition (id, feed_model_id, calories_per_100g, protein_pct, fat_pct, fiber_pct, moisture_pct, ash_pct, calcium_pct, phosphorus_pct, omega3_pct, omega6_pct, carbohydrate_pct, serving_size_g, ingredients_text, notes, status, created_at, updated_at)
SELECT lower(hex(randomblob(16))), fm.id, 120,16,6,0.5,72,2.5,0.80,0.50,0.15,0.60,3,200,
  'Deer meat, eggshell powder, sweet potato, broccoli, carrot', 'Estimated — Korean raw deer',
  'active', datetime('now'), datetime('now')
FROM feed_models fm WHERE fm.name_key = 'feed.model.ray_yvonne_deer_eggshell_raw_9p'
AND NOT EXISTS (SELECT 1 FROM feed_nutrition fn WHERE fn.feed_model_id = fm.id);

-- Ray & Yvonne Lamb Bone Raw (estimated)
INSERT OR IGNORE INTO feed_nutrition (id, feed_model_id, calories_per_100g, protein_pct, fat_pct, fiber_pct, moisture_pct, ash_pct, calcium_pct, phosphorus_pct, omega3_pct, omega6_pct, carbohydrate_pct, serving_size_g, ingredients_text, notes, status, created_at, updated_at)
SELECT lower(hex(randomblob(16))), fm.id, 130,17,7,0.5,68,3.0,1.20,0.80,0.20,0.50,4.5,200,
  'Lamb meat with bone, sweet potato, pumpkin, spinach', 'Estimated — Korean raw lamb',
  'active', datetime('now'), datetime('now')
FROM feed_models fm WHERE fm.name_key = 'feed.model.ray_yvonne_lamb_bone_raw_12p'
AND NOT EXISTS (SELECT 1 FROM feed_nutrition fn WHERE fn.feed_model_id = fm.id);

-- Ray & Yvonne Beef Cooked (estimated)
INSERT OR IGNORE INTO feed_nutrition (id, feed_model_id, calories_per_100g, protein_pct, fat_pct, fiber_pct, moisture_pct, ash_pct, calcium_pct, phosphorus_pct, omega3_pct, omega6_pct, carbohydrate_pct, serving_size_g, ingredients_text, notes, status, created_at, updated_at)
SELECT lower(hex(randomblob(16))), fm.id, 140,15,8,1.0,65,2.0,0.40,0.30,0.10,0.50,9,200,
  'Beef, brown rice, sweet potato, carrot, egg', 'Estimated — Korean cooked beef',
  'active', datetime('now'), datetime('now')
FROM feed_models fm WHERE fm.name_key = 'feed.model.ray_yvonne_beef_cooked_12p'
AND NOT EXISTS (SELECT 1 FROM feed_nutrition fn WHERE fn.feed_model_id = fm.id);

-- Ray & Yvonne Chicken Renal Care (estimated)
INSERT OR IGNORE INTO feed_nutrition (id, feed_model_id, calories_per_100g, protein_pct, fat_pct, fiber_pct, moisture_pct, ash_pct, calcium_pct, phosphorus_pct, omega3_pct, omega6_pct, carbohydrate_pct, serving_size_g, ingredients_text, notes, status, created_at, updated_at)
SELECT lower(hex(randomblob(16))), fm.id, 110,12,6,0.5,70,2.0,0.30,0.20,0.10,0.40,9.5,200,
  'Chicken breast, egg white, white rice, pumpkin', 'Estimated — renal care',
  'active', datetime('now'), datetime('now')
FROM feed_models fm WHERE fm.name_key = 'feed.model.ray_yvonne_chicken_renal_care_12p'
AND NOT EXISTS (SELECT 1 FROM feed_nutrition fn WHERE fn.feed_model_id = fm.id);

-- Ray & Yvonne Chicken Pancreas Care (estimated)
INSERT OR IGNORE INTO feed_nutrition (id, feed_model_id, calories_per_100g, protein_pct, fat_pct, fiber_pct, moisture_pct, ash_pct, calcium_pct, phosphorus_pct, omega3_pct, omega6_pct, carbohydrate_pct, serving_size_g, ingredients_text, notes, status, created_at, updated_at)
SELECT lower(hex(randomblob(16))), fm.id, 105,14,4,0.5,72,2.0,0.30,0.25,0.10,0.35,7.5,200,
  'Chicken breast, white rice, sweet potato, broccoli', 'Estimated — pancreas care low fat',
  'active', datetime('now'), datetime('now')
FROM feed_models fm WHERE fm.name_key = 'feed.model.ray_yvonne_chicken_pancreas_care_12p'
AND NOT EXISTS (SELECT 1 FROM feed_nutrition fn WHERE fn.feed_model_id = fm.id);
