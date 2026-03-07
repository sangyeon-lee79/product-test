-- Master L2 restructure and pet_type->pet_breed seed reinforcement

-- 1) Remove indoor/outdoor category from top-level usage
UPDATE master_categories
SET status = 'inactive', updated_at = datetime('now')
WHERE code = 'living_style';

-- 2) Keep moved categories active for L2 usage
UPDATE master_categories
SET status = 'active', updated_at = datetime('now')
WHERE code IN ('grooming_cycle', 'weight_unit', 'pet_breed');

-- 3) Normalize moved category items to root (UI fallback L2 source)
UPDATE master_items
SET parent_item_id = NULL, updated_at = datetime('now')
WHERE category_id IN (
  SELECT id FROM master_categories WHERE code IN ('grooming_cycle', 'weight_unit')
);

-- 4) Ensure pet_breed items are linked under pet_type parents (dog/cat/bird/rabbit/reptile)
UPDATE master_items
SET
  parent_item_id = CASE
    WHEN code IN ('maltese','poodle','pomeranian','bichon_frise','shih_tzu','golden_retriever','labrador_retriever','welsh_corgi','chihuahua','yorkshire_terrier','jindo','french_bulldog','dachshund','beagle','samoyed','mixed_dog','dog_other')
      THEN (SELECT id FROM master_items WHERE category_id = (SELECT id FROM master_categories WHERE code = 'pet_type' LIMIT 1) AND code = 'dog' LIMIT 1)
    WHEN code IN ('korean_shorthair','russian_blue','persian','british_shorthair','scottish_fold','munchkin','siamese','norwegian_forest','bengal','ragdoll','sphynx','mixed_cat','cat_other')
      THEN (SELECT id FROM master_items WHERE category_id = (SELECT id FROM master_categories WHERE code = 'pet_type' LIMIT 1) AND code = 'cat' LIMIT 1)
    WHEN code IN ('parrot','canary','java_sparrow','budgerigar','lovebird','cockatiel','bird_other')
      THEN (SELECT id FROM master_items WHERE category_id = (SELECT id FROM master_categories WHERE code = 'pet_type' LIMIT 1) AND code = 'bird' LIMIT 1)
    WHEN code IN ('lionhead','rex','holland_lop','netherland_dwarf','mini_lop','rabbit_other')
      THEN (SELECT id FROM master_items WHERE category_id = (SELECT id FROM master_categories WHERE code = 'pet_type' LIMIT 1) AND code = 'rabbit' LIMIT 1)
    WHEN code IN ('lizard','turtle','iguana','gecko','snake','chameleon','reptile_other')
      THEN (SELECT id FROM master_items WHERE category_id = (SELECT id FROM master_categories WHERE code = 'pet_type' LIMIT 1) AND code = 'reptile' LIMIT 1)
    ELSE parent_item_id
  END,
  updated_at = datetime('now')
WHERE category_id = (SELECT id FROM master_categories WHERE code = 'pet_type' LIMIT 1)
  AND code IN (
    'maltese','poodle','pomeranian','bichon_frise','shih_tzu','golden_retriever','labrador_retriever','welsh_corgi','chihuahua','yorkshire_terrier','jindo','french_bulldog','dachshund','beagle','samoyed','mixed_dog','dog_other',
    'korean_shorthair','russian_blue','persian','british_shorthair','scottish_fold','munchkin','siamese','norwegian_forest','bengal','ragdoll','sphynx','mixed_cat','cat_other',
    'parrot','canary','java_sparrow','budgerigar','lovebird','cockatiel','bird_other',
    'lionhead','rex','holland_lop','netherland_dwarf','mini_lop','rabbit_other',
    'lizard','turtle','iguana','gecko','snake','chameleon','reptile_other'
  );

-- 5) Reinforce i18n for pet_type breed keys (ko/en at minimum, keep existing other locale values)
WITH breed_i18n(code, ko, en) AS (
  VALUES
    ('maltese', '말티즈', 'Maltese'),
    ('poodle', '푸들', 'Poodle'),
    ('pomeranian', '포메라니안', 'Pomeranian'),
    ('bichon_frise', '비숑프리제', 'Bichon Frise'),
    ('shih_tzu', '시츄', 'Shih Tzu'),
    ('golden_retriever', '골든리트리버', 'Golden Retriever'),
    ('labrador_retriever', '래브라도 리트리버', 'Labrador Retriever'),
    ('welsh_corgi', '웰시코기', 'Welsh Corgi'),
    ('chihuahua', '치와와', 'Chihuahua'),
    ('yorkshire_terrier', '요크셔테리어', 'Yorkshire Terrier'),
    ('jindo', '진돗개', 'Jindo'),
    ('french_bulldog', '프렌치불독', 'French Bulldog'),
    ('dachshund', '닥스훈트', 'Dachshund'),
    ('beagle', '비글', 'Beagle'),
    ('samoyed', '사모예드', 'Samoyed'),
    ('mixed_dog', '믹스견', 'Mixed Dog'),
    ('dog_other', '기타', 'Other'),
    ('korean_shorthair', '코리안숏헤어', 'Korean Shorthair'),
    ('russian_blue', '러시안블루', 'Russian Blue'),
    ('persian', '페르시안', 'Persian'),
    ('british_shorthair', '브리티시숏헤어', 'British Shorthair'),
    ('scottish_fold', '스코티시폴드', 'Scottish Fold'),
    ('munchkin', '먼치킨', 'Munchkin'),
    ('siamese', '샴', 'Siamese'),
    ('norwegian_forest', '노르웨이숲', 'Norwegian Forest'),
    ('bengal', '벵갈', 'Bengal'),
    ('ragdoll', '랙돌', 'Ragdoll'),
    ('sphynx', '스핑크스', 'Sphynx'),
    ('mixed_cat', '믹스묘', 'Mixed Cat'),
    ('cat_other', '기타', 'Other'),
    ('parrot', '앵무새', 'Parrot'),
    ('canary', '카나리아', 'Canary'),
    ('java_sparrow', '문조', 'Java Sparrow'),
    ('budgerigar', '잉꼬', 'Budgerigar'),
    ('lovebird', '사랑앵무', 'Lovebird'),
    ('cockatiel', '코카틸', 'Cockatiel'),
    ('bird_other', '기타', 'Other'),
    ('lionhead', '라이언헤드', 'Lionhead'),
    ('rex', '렉스', 'Rex'),
    ('holland_lop', '홀랜드롭', 'Holland Lop'),
    ('netherland_dwarf', '네더랜드드워프', 'Netherland Dwarf'),
    ('mini_lop', '미니롭', 'Mini Lop'),
    ('rabbit_other', '기타', 'Other'),
    ('lizard', '도마뱀', 'Lizard'),
    ('turtle', '거북이', 'Turtle'),
    ('iguana', '이구아나', 'Iguana'),
    ('gecko', '게코', 'Gecko'),
    ('snake', '뱀', 'Snake'),
    ('chameleon', '카멜레온', 'Chameleon'),
    ('reptile_other', '기타', 'Other')
)
INSERT INTO i18n_translations
  (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
SELECT
  lower(hex(randomblob(16))),
  'master.pet_type.' || code,
  'master',
  ko,
  en,
  en,
  en,
  en,
  en,
  en,
  en,
  en,
  en,
  en,
  en,
  en,
  1,
  datetime('now'),
  datetime('now')
FROM breed_i18n
ON CONFLICT(key) DO UPDATE SET
  ko = excluded.ko,
  en = excluded.en,
  updated_at = datetime('now');
