-- pet_breed 독립 카테고리를 pet_type 하위 구조로 통합
-- 기존 breed id를 최대한 유지하고, 누락 품종을 pet_type 하위 item으로 추가한다.

-- 1) 기존 breed item을 pet_type 하위로 이동 (기존 pet 참조 유지 목적)
UPDATE master_items
SET
  category_id = (SELECT id FROM master_categories WHERE code = 'pet_type' LIMIT 1),
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
  status = 'active',
  updated_at = datetime('now')
WHERE category_id = (SELECT id FROM master_categories WHERE code = 'pet_breed' LIMIT 1);

-- 2) 품종 seed 추가 (pet_type 하위)
WITH breed_seed(id, parent_code, code, sort_order, ko, en) AS (
  VALUES
    ('mi-breed-dog-maltese', 'dog', 'maltese', 1, '말티즈', 'Maltese'),
    ('mi-breed-poodle', 'dog', 'poodle', 2, '푸들', 'Poodle'),
    ('mi-breed-pomeranian', 'dog', 'pomeranian', 3, '포메라니안', 'Pomeranian'),
    ('mi-breed-dog-bichon-frise', 'dog', 'bichon_frise', 4, '비숑프리제', 'Bichon Frise'),
    ('mi-breed-dog-shih-tzu', 'dog', 'shih_tzu', 5, '시츄', 'Shih Tzu'),
    ('mi-breed-golden', 'dog', 'golden_retriever', 6, '골든리트리버', 'Golden Retriever'),
    ('mi-breed-dog-labrador', 'dog', 'labrador_retriever', 7, '래브라도 리트리버', 'Labrador Retriever'),
    ('mi-breed-dog-welsh-corgi', 'dog', 'welsh_corgi', 8, '웰시코기', 'Welsh Corgi'),
    ('mi-breed-dog-chihuahua', 'dog', 'chihuahua', 9, '치와와', 'Chihuahua'),
    ('mi-breed-dog-yorkshire-terrier', 'dog', 'yorkshire_terrier', 10, '요크셔테리어', 'Yorkshire Terrier'),
    ('mi-breed-dog-jindo', 'dog', 'jindo', 11, '진돗개', 'Jindo'),
    ('mi-breed-dog-french-bulldog', 'dog', 'french_bulldog', 12, '프렌치불독', 'French Bulldog'),
    ('mi-breed-dog-dachshund', 'dog', 'dachshund', 13, '닥스훈트', 'Dachshund'),
    ('mi-breed-dog-beagle', 'dog', 'beagle', 14, '비글', 'Beagle'),
    ('mi-breed-dog-samoyed', 'dog', 'samoyed', 15, '사모예드', 'Samoyed'),
    ('mi-breed-dog-mixed', 'dog', 'mixed_dog', 16, '믹스견', 'Mixed Dog'),
    ('mi-breed-dog-other', 'dog', 'dog_other', 17, '기타', 'Other'),

    ('mi-breed-ksh', 'cat', 'korean_shorthair', 1, '코리안숏헤어', 'Korean Shorthair'),
    ('mi-breed-rblue', 'cat', 'russian_blue', 2, '러시안블루', 'Russian Blue'),
    ('mi-breed-persian', 'cat', 'persian', 3, '페르시안', 'Persian'),
    ('mi-breed-cat-british-shorthair', 'cat', 'british_shorthair', 4, '브리티시숏헤어', 'British Shorthair'),
    ('mi-breed-cat-scottish-fold', 'cat', 'scottish_fold', 5, '스코티시폴드', 'Scottish Fold'),
    ('mi-breed-cat-munchkin', 'cat', 'munchkin', 6, '먼치킨', 'Munchkin'),
    ('mi-breed-cat-siamese', 'cat', 'siamese', 7, '샴', 'Siamese'),
    ('mi-breed-cat-norwegian-forest', 'cat', 'norwegian_forest', 8, '노르웨이숲', 'Norwegian Forest'),
    ('mi-breed-cat-bengal', 'cat', 'bengal', 9, '벵갈', 'Bengal'),
    ('mi-breed-cat-ragdoll', 'cat', 'ragdoll', 10, '랙돌', 'Ragdoll'),
    ('mi-breed-cat-sphynx', 'cat', 'sphynx', 11, '스핑크스', 'Sphynx'),
    ('mi-breed-cat-mixed', 'cat', 'mixed_cat', 12, '믹스묘', 'Mixed Cat'),
    ('mi-breed-cat-other', 'cat', 'cat_other', 13, '기타', 'Other'),

    ('mi-breed-bird-parrot', 'bird', 'parrot', 1, '앵무새', 'Parrot'),
    ('mi-breed-bird-canary', 'bird', 'canary', 2, '카나리아', 'Canary'),
    ('mi-breed-bird-java-sparrow', 'bird', 'java_sparrow', 3, '문조', 'Java Sparrow'),
    ('mi-breed-bird-budgerigar', 'bird', 'budgerigar', 4, '잉꼬', 'Budgerigar'),
    ('mi-breed-bird-lovebird', 'bird', 'lovebird', 5, '사랑앵무', 'Lovebird'),
    ('mi-breed-bird-cockatiel', 'bird', 'cockatiel', 6, '코카틸', 'Cockatiel'),
    ('mi-breed-bird-other', 'bird', 'bird_other', 7, '기타', 'Other'),

    ('mi-breed-rabbit-lionhead', 'rabbit', 'lionhead', 1, '라이언헤드', 'Lionhead'),
    ('mi-breed-rabbit-rex', 'rabbit', 'rex', 2, '렉스', 'Rex'),
    ('mi-breed-rabbit-holland-lop', 'rabbit', 'holland_lop', 3, '홀랜드롭', 'Holland Lop'),
    ('mi-breed-rabbit-netherland-dwarf', 'rabbit', 'netherland_dwarf', 4, '네더랜드드워프', 'Netherland Dwarf'),
    ('mi-breed-rabbit-mini-lop', 'rabbit', 'mini_lop', 5, '미니롭', 'Mini Lop'),
    ('mi-breed-rabbit-other', 'rabbit', 'rabbit_other', 6, '기타', 'Other'),

    ('mi-breed-reptile-lizard', 'reptile', 'lizard', 1, '도마뱀', 'Lizard'),
    ('mi-breed-reptile-turtle', 'reptile', 'turtle', 2, '거북이', 'Turtle'),
    ('mi-breed-reptile-iguana', 'reptile', 'iguana', 3, '이구아나', 'Iguana'),
    ('mi-breed-reptile-gecko', 'reptile', 'gecko', 4, '게코', 'Gecko'),
    ('mi-breed-reptile-snake', 'reptile', 'snake', 5, '뱀', 'Snake'),
    ('mi-breed-reptile-chameleon', 'reptile', 'chameleon', 6, '카멜레온', 'Chameleon'),
    ('mi-breed-reptile-other', 'reptile', 'reptile_other', 7, '기타', 'Other')
)
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT
  s.id,
  c.id,
  p.id,
  s.code,
  s.sort_order,
  'active',
  '{}',
  datetime('now'),
  datetime('now')
FROM breed_seed s
JOIN master_categories c ON c.code = 'pet_type'
JOIN master_items p ON p.category_id = c.id AND p.code = s.parent_code;

-- 3) 카테고리/아이템 i18n key 등록 (master.pet_type.{breed_code})
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
INSERT OR IGNORE INTO i18n_translations
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
FROM breed_i18n;

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
UPDATE i18n_translations
SET
  ko = (SELECT t.ko FROM breed_i18n t WHERE ('master.pet_type.' || t.code) = i18n_translations.key),
  en = (SELECT t.en FROM breed_i18n t WHERE ('master.pet_type.' || t.code) = i18n_translations.key),
  ja = COALESCE(NULLIF(ja, ''), en),
  zh_cn = COALESCE(NULLIF(zh_cn, ''), en),
  zh_tw = COALESCE(NULLIF(zh_tw, ''), en),
  es = COALESCE(NULLIF(es, ''), en),
  fr = COALESCE(NULLIF(fr, ''), en),
  de = COALESCE(NULLIF(de, ''), en),
  pt = COALESCE(NULLIF(pt, ''), en),
  vi = COALESCE(NULLIF(vi, ''), en),
  th = COALESCE(NULLIF(th, ''), en),
  id_lang = COALESCE(NULLIF(id_lang, ''), en),
  ar = COALESCE(NULLIF(ar, ''), en),
  updated_at = datetime('now')
WHERE key IN (SELECT 'master.pet_type.' || code FROM breed_i18n);

-- 4) legacy pet_breed 카테고리 비활성화 (관리 화면 노출 억제)
UPDATE master_categories
SET status = 'inactive', updated_at = datetime('now')
WHERE code = 'pet_breed';

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0029_pet_type_breed_hierarchy_seed');
