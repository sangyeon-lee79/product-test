-- 0035: Pet type full seed expansion (L2 pet types + L3 breeds/types)
-- Source of truth: user-provided seed list

-- Ensure category active
UPDATE master_categories
SET status = 'active', updated_at = datetime('now')
WHERE code = 'pet_type';

-- 1) L2 Pet Types
WITH pet_types(id, code, sort_order) AS (
  VALUES
    ('mi-ptype-dog', 'dog', 1),
    ('mi-ptype-cat', 'cat', 2),
    ('mi-ptype-bird', 'bird', 3),
    ('mi-ptype-rabbit', 'rabbit', 4),
    ('mi-ptype-reptile', 'reptile', 5),
    ('mi-ptype-other', 'other', 6)
)
INSERT OR IGNORE INTO master_items (
  id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at
)
SELECT
  p.id,
  c.id,
  NULL,
  p.code,
  p.sort_order,
  'active',
  '{}',
  datetime('now'),
  datetime('now')
FROM pet_types p
JOIN master_categories c ON c.code = 'pet_type';

UPDATE master_items
SET parent_item_id = NULL, updated_at = datetime('now')
WHERE category_id = (SELECT id FROM master_categories WHERE code = 'pet_type' LIMIT 1)
  AND code IN ('dog','cat','bird','rabbit','reptile','other');

-- 2) L3 Breeds / Types by pet_type parent
WITH breed_seed(id, parent_code, code, sort_order, ko, en) AS (
  VALUES
    -- Dog
    ('mi-breed-poodle', 'dog', 'poodle', 1, '푸들', 'Poodle'),
    ('mi-breed-dog-maltese', 'dog', 'maltese', 2, '말티즈', 'Maltese'),
    ('mi-breed-dog-shih-tzu', 'dog', 'shih_tzu', 3, '시추', 'Shih Tzu'),
    ('mi-breed-dog-chihuahua', 'dog', 'chihuahua', 4, '치와와', 'Chihuahua'),
    ('mi-breed-pomeranian', 'dog', 'pomeranian', 5, '포메라니안', 'Pomeranian'),
    ('mi-breed-dog-bichon-frise', 'dog', 'bichon_frise', 6, '비숑 프리제', 'Bichon Frise'),
    ('mi-breed-golden', 'dog', 'golden_retriever', 7, '골든 리트리버', 'Golden Retriever'),
    ('mi-breed-dog-labrador', 'dog', 'labrador_retriever', 8, '래브라도 리트리버', 'Labrador Retriever'),
    ('mi-breed-dog-french-bulldog', 'dog', 'french_bulldog', 9, '프렌치 불독', 'French Bulldog'),
    ('mi-breed-dog-bulldog', 'dog', 'bulldog', 10, '불독', 'Bulldog'),
    ('mi-breed-dog-corgi', 'dog', 'corgi', 11, '웰시 코기', 'Welsh Corgi'),
    ('mi-breed-dog-beagle', 'dog', 'beagle', 12, '비글', 'Beagle'),
    ('mi-breed-dog-dachshund', 'dog', 'dachshund', 13, '닥스훈트', 'Dachshund'),
    ('mi-breed-dog-schnauzer', 'dog', 'schnauzer', 14, '슈나우저', 'Schnauzer'),
    ('mi-breed-dog-yorkshire-terrier', 'dog', 'yorkshire_terrier', 15, '요크셔 테리어', 'Yorkshire Terrier'),
    ('mi-breed-dog-samoyed', 'dog', 'samoyed', 16, '사모예드', 'Samoyed'),
    ('mi-breed-dog-husky', 'dog', 'husky', 17, '시베리안 허스키', 'Siberian Husky'),
    ('mi-breed-dog-shiba-inu', 'dog', 'shiba_inu', 18, '시바견', 'Shiba Inu'),
    ('mi-breed-dog-akita', 'dog', 'akita', 19, '아키타', 'Akita'),
    ('mi-breed-dog-chow-chow', 'dog', 'chow_chow', 20, '차우차우', 'Chow Chow'),

    -- Cat
    ('mi-breed-persian', 'cat', 'persian', 1, '페르시안', 'Persian'),
    ('mi-breed-cat-siamese', 'cat', 'siamese', 2, '샴', 'Siamese'),
    ('mi-breed-cat-maine-coon', 'cat', 'maine_coon', 3, '메인쿤', 'Maine Coon'),
    ('mi-breed-cat-ragdoll', 'cat', 'ragdoll', 4, '랙돌', 'Ragdoll'),
    ('mi-breed-cat-british-shorthair', 'cat', 'british_shorthair', 5, '브리티시 쇼트헤어', 'British Shorthair'),
    ('mi-breed-cat-scottish-fold', 'cat', 'scottish_fold', 6, '스코티시 폴드', 'Scottish Fold'),
    ('mi-breed-cat-bengal', 'cat', 'bengal', 7, '벵갈', 'Bengal'),
    ('mi-breed-cat-sphynx', 'cat', 'sphynx', 8, '스핑크스', 'Sphynx'),
    ('mi-breed-rblue', 'cat', 'russian_blue', 9, '러시안 블루', 'Russian Blue'),
    ('mi-breed-cat-american-shorthair', 'cat', 'american_shorthair', 10, '아메리칸 쇼트헤어', 'American Shorthair'),
    ('mi-breed-cat-norwegian-forest', 'cat', 'norwegian_forest', 11, '노르웨이 숲 고양이', 'Norwegian Forest Cat'),
    ('mi-breed-cat-abyssinian', 'cat', 'abyssinian', 12, '아비시니안', 'Abyssinian'),
    ('mi-breed-cat-birman', 'cat', 'birman', 13, '버만', 'Birman'),
    ('mi-breed-cat-burmese', 'cat', 'burmese', 14, '버미즈', 'Burmese'),
    ('mi-breed-cat-oriental-shorthair', 'cat', 'oriental_shorthair', 15, '오리엔탈 쇼트헤어', 'Oriental Shorthair'),

    -- Bird
    ('mi-breed-bird-budgerigar', 'bird', 'budgerigar', 1, '잉꼬', 'Budgerigar'),
    ('mi-breed-bird-cockatiel', 'bird', 'cockatiel', 2, '왕관앵무', 'Cockatiel'),
    ('mi-breed-bird-lovebird', 'bird', 'lovebird', 3, '모란앵무', 'Lovebird'),
    ('mi-breed-bird-african-grey', 'bird', 'african_grey', 4, '아프리카 회색 앵무', 'African Grey Parrot'),
    ('mi-breed-bird-macaw', 'bird', 'macaw', 5, '마코앵무', 'Macaw'),
    ('mi-breed-bird-canary', 'bird', 'canary', 6, '카나리아', 'Canary'),
    ('mi-breed-bird-finch', 'bird', 'finch', 7, '핀치', 'Finch'),
    ('mi-breed-bird-conure', 'bird', 'conure', 8, '코뉴어', 'Conure'),
    ('mi-breed-bird-parrotlet', 'bird', 'parrotlet', 9, '패럿렛', 'Parrotlet'),
    ('mi-breed-bird-eclectus', 'bird', 'eclectus', 10, '에클렉투스 앵무', 'Eclectus Parrot'),

    -- Rabbit
    ('mi-breed-rabbit-holland-lop', 'rabbit', 'holland_lop', 1, '홀랜드 롭', 'Holland Lop'),
    ('mi-breed-rabbit-mini-lop', 'rabbit', 'mini_lop', 2, '미니 롭', 'Mini Lop'),
    ('mi-breed-rabbit-lionhead', 'rabbit', 'lionhead', 3, '라이언헤드', 'Lionhead'),
    ('mi-breed-rabbit-netherland-dwarf', 'rabbit', 'netherland_dwarf', 4, '네덜란드 드워프', 'Netherland Dwarf'),
    ('mi-breed-rabbit-rex-rabbit', 'rabbit', 'rex_rabbit', 5, '렉스 토끼', 'Rex Rabbit'),
    ('mi-breed-rabbit-mini-rex', 'rabbit', 'mini_rex', 6, '미니 렉스', 'Mini Rex'),
    ('mi-breed-rabbit-english-lop', 'rabbit', 'english_lop', 7, '잉글리시 롭', 'English Lop'),
    ('mi-breed-rabbit-dwarf-hotot', 'rabbit', 'dwarf_hotot', 8, '드워프 호토', 'Dwarf Hotot'),

    -- Reptile
    ('mi-breed-reptile-bearded-dragon', 'reptile', 'bearded_dragon', 1, '비어디드 드래곤', 'Bearded Dragon'),
    ('mi-breed-reptile-leopard-gecko', 'reptile', 'leopard_gecko', 2, '레오파드 게코', 'Leopard Gecko'),
    ('mi-breed-reptile-crested-gecko', 'reptile', 'crested_gecko', 3, '크레스티드 게코', 'Crested Gecko'),
    ('mi-breed-reptile-ball-python', 'reptile', 'ball_python', 4, '볼 파이톤', 'Ball Python'),
    ('mi-breed-reptile-corn-snake', 'reptile', 'corn_snake', 5, '콘 스네이크', 'Corn Snake'),
    ('mi-breed-reptile-king-snake', 'reptile', 'king_snake', 6, '킹 스네이크', 'King Snake'),
    ('mi-breed-reptile-iguana', 'reptile', 'iguana', 7, '이구아나', 'Iguana'),
    ('mi-breed-reptile-chameleon', 'reptile', 'chameleon', 8, '카멜레온', 'Chameleon'),
    ('mi-breed-reptile-red-eared-slider', 'reptile', 'red_eared_slider', 9, '붉은귀거북', 'Red-eared Slider'),

    -- Other pets
    ('mi-breed-other-hamster', 'other', 'hamster', 1, '햄스터', 'Hamster'),
    ('mi-breed-other-guinea-pig', 'other', 'guinea_pig', 2, '기니피그', 'Guinea Pig'),
    ('mi-breed-other-ferret', 'other', 'ferret', 3, '페럿', 'Ferret'),
    ('mi-breed-other-hedgehog', 'other', 'hedgehog', 4, '고슴도치', 'Hedgehog'),
    ('mi-breed-other-sugar-glider', 'other', 'sugar_glider', 5, '슈가 글라이더', 'Sugar Glider'),
    ('mi-breed-other-chinchilla', 'other', 'chinchilla', 6, '친칠라', 'Chinchilla')
)
INSERT OR IGNORE INTO master_items (
  id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at
)
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
JOIN master_items p
  ON p.category_id = c.id
 AND p.code = s.parent_code;

-- Parent re-link (existing rows)
WITH breed_seed(parent_code, code) AS (
  VALUES
    ('dog','poodle'),('dog','maltese'),('dog','shih_tzu'),('dog','chihuahua'),('dog','pomeranian'),('dog','bichon_frise'),('dog','golden_retriever'),('dog','labrador_retriever'),('dog','french_bulldog'),('dog','bulldog'),('dog','corgi'),('dog','beagle'),('dog','dachshund'),('dog','schnauzer'),('dog','yorkshire_terrier'),('dog','samoyed'),('dog','husky'),('dog','shiba_inu'),('dog','akita'),('dog','chow_chow'),
    ('cat','persian'),('cat','siamese'),('cat','maine_coon'),('cat','ragdoll'),('cat','british_shorthair'),('cat','scottish_fold'),('cat','bengal'),('cat','sphynx'),('cat','russian_blue'),('cat','american_shorthair'),('cat','norwegian_forest'),('cat','abyssinian'),('cat','birman'),('cat','burmese'),('cat','oriental_shorthair'),
    ('bird','budgerigar'),('bird','cockatiel'),('bird','lovebird'),('bird','african_grey'),('bird','macaw'),('bird','canary'),('bird','finch'),('bird','conure'),('bird','parrotlet'),('bird','eclectus'),
    ('rabbit','holland_lop'),('rabbit','mini_lop'),('rabbit','lionhead'),('rabbit','netherland_dwarf'),('rabbit','rex_rabbit'),('rabbit','mini_rex'),('rabbit','english_lop'),('rabbit','dwarf_hotot'),
    ('reptile','bearded_dragon'),('reptile','leopard_gecko'),('reptile','crested_gecko'),('reptile','ball_python'),('reptile','corn_snake'),('reptile','king_snake'),('reptile','iguana'),('reptile','chameleon'),('reptile','red_eared_slider'),
    ('other','hamster'),('other','guinea_pig'),('other','ferret'),('other','hedgehog'),('other','sugar_glider'),('other','chinchilla')
)
UPDATE master_items
SET
  parent_item_id = (
    SELECT p.id
    FROM master_items p
    WHERE p.category_id = (SELECT id FROM master_categories WHERE code = 'pet_type' LIMIT 1)
      AND p.code = (SELECT s.parent_code FROM breed_seed s WHERE s.code = master_items.code)
    LIMIT 1
  ),
  updated_at = datetime('now')
WHERE category_id = (SELECT id FROM master_categories WHERE code = 'pet_type' LIMIT 1)
  AND code IN (SELECT code FROM breed_seed);

-- 3) i18n (ko/en base + propagate to other locales when empty)
WITH t(key, ko, en) AS (
  VALUES
    ('master.pet_type.dog', '강아지', 'Dog'),
    ('master.pet_type.cat', '고양이', 'Cat'),
    ('master.pet_type.bird', '새', 'Bird'),
    ('master.pet_type.rabbit', '토끼', 'Rabbit'),
    ('master.pet_type.reptile', '파충류', 'Reptile'),
    ('master.pet_type.other', '기타', 'Other'),

    ('master.pet_type.poodle', '푸들', 'Poodle'),
    ('master.pet_type.maltese', '말티즈', 'Maltese'),
    ('master.pet_type.shih_tzu', '시추', 'Shih Tzu'),
    ('master.pet_type.chihuahua', '치와와', 'Chihuahua'),
    ('master.pet_type.pomeranian', '포메라니안', 'Pomeranian'),
    ('master.pet_type.bichon_frise', '비숑 프리제', 'Bichon Frise'),
    ('master.pet_type.golden_retriever', '골든 리트리버', 'Golden Retriever'),
    ('master.pet_type.labrador_retriever', '래브라도 리트리버', 'Labrador Retriever'),
    ('master.pet_type.french_bulldog', '프렌치 불독', 'French Bulldog'),
    ('master.pet_type.bulldog', '불독', 'Bulldog'),
    ('master.pet_type.corgi', '웰시 코기', 'Welsh Corgi'),
    ('master.pet_type.beagle', '비글', 'Beagle'),
    ('master.pet_type.dachshund', '닥스훈트', 'Dachshund'),
    ('master.pet_type.schnauzer', '슈나우저', 'Schnauzer'),
    ('master.pet_type.yorkshire_terrier', '요크셔 테리어', 'Yorkshire Terrier'),
    ('master.pet_type.samoyed', '사모예드', 'Samoyed'),
    ('master.pet_type.husky', '시베리안 허스키', 'Siberian Husky'),
    ('master.pet_type.shiba_inu', '시바견', 'Shiba Inu'),
    ('master.pet_type.akita', '아키타', 'Akita'),
    ('master.pet_type.chow_chow', '차우차우', 'Chow Chow'),

    ('master.pet_type.persian', '페르시안', 'Persian'),
    ('master.pet_type.siamese', '샴', 'Siamese'),
    ('master.pet_type.maine_coon', '메인쿤', 'Maine Coon'),
    ('master.pet_type.ragdoll', '랙돌', 'Ragdoll'),
    ('master.pet_type.british_shorthair', '브리티시 쇼트헤어', 'British Shorthair'),
    ('master.pet_type.scottish_fold', '스코티시 폴드', 'Scottish Fold'),
    ('master.pet_type.bengal', '벵갈', 'Bengal'),
    ('master.pet_type.sphynx', '스핑크스', 'Sphynx'),
    ('master.pet_type.russian_blue', '러시안 블루', 'Russian Blue'),
    ('master.pet_type.american_shorthair', '아메리칸 쇼트헤어', 'American Shorthair'),
    ('master.pet_type.norwegian_forest', '노르웨이 숲 고양이', 'Norwegian Forest Cat'),
    ('master.pet_type.abyssinian', '아비시니안', 'Abyssinian'),
    ('master.pet_type.birman', '버만', 'Birman'),
    ('master.pet_type.burmese', '버미즈', 'Burmese'),
    ('master.pet_type.oriental_shorthair', '오리엔탈 쇼트헤어', 'Oriental Shorthair'),

    ('master.pet_type.budgerigar', '잉꼬', 'Budgerigar'),
    ('master.pet_type.cockatiel', '왕관앵무', 'Cockatiel'),
    ('master.pet_type.lovebird', '모란앵무', 'Lovebird'),
    ('master.pet_type.african_grey', '아프리카 회색 앵무', 'African Grey Parrot'),
    ('master.pet_type.macaw', '마코앵무', 'Macaw'),
    ('master.pet_type.canary', '카나리아', 'Canary'),
    ('master.pet_type.finch', '핀치', 'Finch'),
    ('master.pet_type.conure', '코뉴어', 'Conure'),
    ('master.pet_type.parrotlet', '패럿렛', 'Parrotlet'),
    ('master.pet_type.eclectus', '에클렉투스 앵무', 'Eclectus Parrot'),

    ('master.pet_type.holland_lop', '홀랜드 롭', 'Holland Lop'),
    ('master.pet_type.mini_lop', '미니 롭', 'Mini Lop'),
    ('master.pet_type.lionhead', '라이언헤드', 'Lionhead'),
    ('master.pet_type.netherland_dwarf', '네덜란드 드워프', 'Netherland Dwarf'),
    ('master.pet_type.rex_rabbit', '렉스 토끼', 'Rex Rabbit'),
    ('master.pet_type.mini_rex', '미니 렉스', 'Mini Rex'),
    ('master.pet_type.english_lop', '잉글리시 롭', 'English Lop'),
    ('master.pet_type.dwarf_hotot', '드워프 호토', 'Dwarf Hotot'),

    ('master.pet_type.bearded_dragon', '비어디드 드래곤', 'Bearded Dragon'),
    ('master.pet_type.leopard_gecko', '레오파드 게코', 'Leopard Gecko'),
    ('master.pet_type.crested_gecko', '크레스티드 게코', 'Crested Gecko'),
    ('master.pet_type.ball_python', '볼 파이톤', 'Ball Python'),
    ('master.pet_type.corn_snake', '콘 스네이크', 'Corn Snake'),
    ('master.pet_type.king_snake', '킹 스네이크', 'King Snake'),
    ('master.pet_type.iguana', '이구아나', 'Iguana'),
    ('master.pet_type.chameleon', '카멜레온', 'Chameleon'),
    ('master.pet_type.red_eared_slider', '붉은귀거북', 'Red-eared Slider'),

    ('master.pet_type.hamster', '햄스터', 'Hamster'),
    ('master.pet_type.guinea_pig', '기니피그', 'Guinea Pig'),
    ('master.pet_type.ferret', '페럿', 'Ferret'),
    ('master.pet_type.hedgehog', '고슴도치', 'Hedgehog'),
    ('master.pet_type.sugar_glider', '슈가 글라이더', 'Sugar Glider'),
    ('master.pet_type.chinchilla', '친칠라', 'Chinchilla')
)
INSERT OR IGNORE INTO i18n_translations (
  id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at
)
SELECT
  lower(hex(randomblob(16))),
  t.key,
  'master',
  t.ko,
  t.en,
  t.en,
  t.en,
  t.en,
  t.en,
  t.en,
  t.en,
  t.en,
  t.en,
  t.en,
  t.en,
  t.en,
  1,
  datetime('now'),
  datetime('now')
FROM t;

WITH t(key, ko, en) AS (
  VALUES
    ('master.pet_type.dog', '강아지', 'Dog'),
    ('master.pet_type.cat', '고양이', 'Cat'),
    ('master.pet_type.bird', '새', 'Bird'),
    ('master.pet_type.rabbit', '토끼', 'Rabbit'),
    ('master.pet_type.reptile', '파충류', 'Reptile'),
    ('master.pet_type.other', '기타', 'Other'),
    ('master.pet_type.poodle', '푸들', 'Poodle'),('master.pet_type.maltese', '말티즈', 'Maltese'),('master.pet_type.shih_tzu', '시추', 'Shih Tzu'),('master.pet_type.chihuahua', '치와와', 'Chihuahua'),('master.pet_type.pomeranian', '포메라니안', 'Pomeranian'),('master.pet_type.bichon_frise', '비숑 프리제', 'Bichon Frise'),('master.pet_type.golden_retriever', '골든 리트리버', 'Golden Retriever'),('master.pet_type.labrador_retriever', '래브라도 리트리버', 'Labrador Retriever'),('master.pet_type.french_bulldog', '프렌치 불독', 'French Bulldog'),('master.pet_type.bulldog', '불독', 'Bulldog'),('master.pet_type.corgi', '웰시 코기', 'Welsh Corgi'),('master.pet_type.beagle', '비글', 'Beagle'),('master.pet_type.dachshund', '닥스훈트', 'Dachshund'),('master.pet_type.schnauzer', '슈나우저', 'Schnauzer'),('master.pet_type.yorkshire_terrier', '요크셔 테리어', 'Yorkshire Terrier'),('master.pet_type.samoyed', '사모예드', 'Samoyed'),('master.pet_type.husky', '시베리안 허스키', 'Siberian Husky'),('master.pet_type.shiba_inu', '시바견', 'Shiba Inu'),('master.pet_type.akita', '아키타', 'Akita'),('master.pet_type.chow_chow', '차우차우', 'Chow Chow'),
    ('master.pet_type.persian', '페르시안', 'Persian'),('master.pet_type.siamese', '샴', 'Siamese'),('master.pet_type.maine_coon', '메인쿤', 'Maine Coon'),('master.pet_type.ragdoll', '랙돌', 'Ragdoll'),('master.pet_type.british_shorthair', '브리티시 쇼트헤어', 'British Shorthair'),('master.pet_type.scottish_fold', '스코티시 폴드', 'Scottish Fold'),('master.pet_type.bengal', '벵갈', 'Bengal'),('master.pet_type.sphynx', '스핑크스', 'Sphynx'),('master.pet_type.russian_blue', '러시안 블루', 'Russian Blue'),('master.pet_type.american_shorthair', '아메리칸 쇼트헤어', 'American Shorthair'),('master.pet_type.norwegian_forest', '노르웨이 숲 고양이', 'Norwegian Forest Cat'),('master.pet_type.abyssinian', '아비시니안', 'Abyssinian'),('master.pet_type.birman', '버만', 'Birman'),('master.pet_type.burmese', '버미즈', 'Burmese'),('master.pet_type.oriental_shorthair', '오리엔탈 쇼트헤어', 'Oriental Shorthair'),
    ('master.pet_type.budgerigar', '잉꼬', 'Budgerigar'),('master.pet_type.cockatiel', '왕관앵무', 'Cockatiel'),('master.pet_type.lovebird', '모란앵무', 'Lovebird'),('master.pet_type.african_grey', '아프리카 회색 앵무', 'African Grey Parrot'),('master.pet_type.macaw', '마코앵무', 'Macaw'),('master.pet_type.canary', '카나리아', 'Canary'),('master.pet_type.finch', '핀치', 'Finch'),('master.pet_type.conure', '코뉴어', 'Conure'),('master.pet_type.parrotlet', '패럿렛', 'Parrotlet'),('master.pet_type.eclectus', '에클렉투스 앵무', 'Eclectus Parrot'),
    ('master.pet_type.holland_lop', '홀랜드 롭', 'Holland Lop'),('master.pet_type.mini_lop', '미니 롭', 'Mini Lop'),('master.pet_type.lionhead', '라이언헤드', 'Lionhead'),('master.pet_type.netherland_dwarf', '네덜란드 드워프', 'Netherland Dwarf'),('master.pet_type.rex_rabbit', '렉스 토끼', 'Rex Rabbit'),('master.pet_type.mini_rex', '미니 렉스', 'Mini Rex'),('master.pet_type.english_lop', '잉글리시 롭', 'English Lop'),('master.pet_type.dwarf_hotot', '드워프 호토', 'Dwarf Hotot'),
    ('master.pet_type.bearded_dragon', '비어디드 드래곤', 'Bearded Dragon'),('master.pet_type.leopard_gecko', '레오파드 게코', 'Leopard Gecko'),('master.pet_type.crested_gecko', '크레스티드 게코', 'Crested Gecko'),('master.pet_type.ball_python', '볼 파이톤', 'Ball Python'),('master.pet_type.corn_snake', '콘 스네이크', 'Corn Snake'),('master.pet_type.king_snake', '킹 스네이크', 'King Snake'),('master.pet_type.iguana', '이구아나', 'Iguana'),('master.pet_type.chameleon', '카멜레온', 'Chameleon'),('master.pet_type.red_eared_slider', '붉은귀거북', 'Red-eared Slider'),
    ('master.pet_type.hamster', '햄스터', 'Hamster'),('master.pet_type.guinea_pig', '기니피그', 'Guinea Pig'),('master.pet_type.ferret', '페럿', 'Ferret'),('master.pet_type.hedgehog', '고슴도치', 'Hedgehog'),('master.pet_type.sugar_glider', '슈가 글라이더', 'Sugar Glider'),('master.pet_type.chinchilla', '친칠라', 'Chinchilla')
)
UPDATE i18n_translations
SET
  ko = (SELECT x.ko FROM t x WHERE x.key = i18n_translations.key),
  en = (SELECT x.en FROM t x WHERE x.key = i18n_translations.key),
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
  is_active = 1,
  updated_at = datetime('now')
WHERE key IN (SELECT key FROM t);
