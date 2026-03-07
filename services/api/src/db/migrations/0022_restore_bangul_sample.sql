-- Migration 0022: Restore Guardian sample data ("방울") without reset
-- 목적: 기능 확장 이후에도 기존 샘플 데이터가 유지되도록 최소 샘플을 보장한다.

-- 1) Guardian 계정 보장
INSERT OR IGNORE INTO users (id, email, role, created_at, updated_at)
VALUES ('seed-guardian-bangul', 'guardian@petlife.com', 'guardian', datetime('now'), datetime('now'));

UPDATE users
SET role = 'guardian', updated_at = datetime('now')
WHERE email = 'guardian@petlife.com';

-- 2) Guardian 프로필 보장
INSERT OR IGNORE INTO user_profiles (
  id, user_id, handle, display_name, avatar_url, bio, bio_translations,
  country_id, language, timezone, interests, created_at, updated_at
)
SELECT
  'seed-profile-bangul',
  u.id,
  COALESCE((SELECT up.handle FROM user_profiles up WHERE up.user_id = u.id), NULL),
  '방울맘',
  'https://placehold.co/320x320?text=Bangul',
  '방울이와 함께하는 일상 기록',
  '{}',
  NULL,
  'ko',
  'Asia/Seoul',
  '[]',
  datetime('now'),
  datetime('now')
FROM users u
WHERE u.email = 'guardian@petlife.com';

UPDATE user_profiles
SET display_name = COALESCE(display_name, '방울맘'),
    avatar_url = COALESCE(avatar_url, 'https://placehold.co/320x320?text=Bangul'),
    bio = COALESCE(bio, '방울이와 함께하는 일상 기록'),
    updated_at = datetime('now')
WHERE user_id = (SELECT id FROM users WHERE email = 'guardian@petlife.com' LIMIT 1);

-- 3) 방울 펫 보장 (삭제 상태가 아닌 동일 이름/guardian이 없을 때만 신규 생성)
INSERT INTO pets (
  id, guardian_id, name, species, pet_type_id, breed_id, gender_id, neuter_status_id,
  life_stage_id, body_size_id, country_id, medication_status_id, weight_unit_id,
  health_condition_level_id, activity_level_id, diet_type_id, living_style_id,
  ownership_type_id, coat_length_id, coat_type_id, grooming_cycle_id,
  color_ids, allergy_ids, disease_history_ids, symptom_tag_ids, vaccination_ids,
  temperament_ids, notes, intro_text, birthday, birth_date, current_weight, weight_kg, microchip_no,
  avatar_url, is_neutered, status, created_at, updated_at
)
SELECT
  'seed-pet-bangul',
  u.id,
  '방울',
  'dog',
  (SELECT id FROM master_items WHERE key = 'dog' LIMIT 1),
  (SELECT id FROM master_items WHERE key = 'pomeranian' LIMIT 1),
  (SELECT id FROM master_items WHERE key = 'female' LIMIT 1),
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM master_items WHERE key = 'kg' LIMIT 1),
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '[]',
  '[]',
  '[]',
  '[]',
  '[]',
  '[]',
  '샘플 반려동물 데이터',
  '포메라니안 방울이',
  '2021-03-15',
  '2021-03-15',
  4.2,
  4.2,
  'BANGUL-0001',
  'https://placehold.co/600x600?text=Bangul',
  0,
  'active',
  datetime('now'),
  datetime('now')
FROM users u
WHERE u.email = 'guardian@petlife.com'
  AND NOT EXISTS (
    SELECT 1 FROM pets p
    WHERE p.guardian_id = u.id
      AND p.name = '방울'
      AND p.status != 'deleted'
  );

-- 이미 존재하는 방울 레코드에는 핵심 샘플 값 보강
UPDATE pets
SET
  microchip_no = COALESCE(microchip_no, 'BANGUL-0001'),
  avatar_url = COALESCE(avatar_url, 'https://placehold.co/600x600?text=Bangul'),
  birthday = COALESCE(birthday, birth_date, '2021-03-15'),
  birth_date = COALESCE(birth_date, birthday, '2021-03-15'),
  current_weight = COALESCE(current_weight, weight_kg, 4.2),
  weight_kg = COALESCE(weight_kg, current_weight, 4.2),
  notes = COALESCE(notes, '샘플 반려동물 데이터'),
  updated_at = datetime('now')
WHERE id IN (
  SELECT p.id
  FROM pets p
  INNER JOIN users u ON u.id = p.guardian_id
  WHERE u.email = 'guardian@petlife.com'
    AND p.name = '방울'
    AND p.status != 'deleted'
);

-- 4) 몸무게 로그 보장
INSERT OR IGNORE INTO pet_weight_logs (
  id, pet_id, weight_value, weight_unit_id, measured_at, recorded_by_user_id, notes, created_at, updated_at
)
SELECT
  'seed-weightlog-bangul-1',
  p.id,
  COALESCE(p.current_weight, p.weight_kg, 4.2),
  p.weight_unit_id,
  datetime('now'),
  p.guardian_id,
  '샘플 초기 몸무게',
  datetime('now'),
  datetime('now')
FROM pets p
INNER JOIN users u ON u.id = p.guardian_id
WHERE u.email = 'guardian@petlife.com'
  AND p.name = '방울'
  AND p.status != 'deleted'
  AND EXISTS (SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'pet_weight_logs');

-- 5) 프로필 이미지/피드 샘플 보장 (table 존재 시)
INSERT OR IGNORE INTO feeds (
  id, feed_type, author_user_id, author_role, pet_id, business_category_id, pet_type_id,
  visibility_scope, booking_id, supplier_id, related_service_id,
  caption, media_urls, tags, publish_request_status, is_public, status, created_at, updated_at
)
SELECT
  'seed-feed-bangul-intro',
  'guardian_post',
  u.id,
  'guardian',
  p.id,
  NULL,
  p.pet_type_id,
  'public',
  NULL,
  NULL,
  NULL,
  '방울이의 첫 샘플 피드입니다.',
  '["https://placehold.co/1200x900?text=Bangul+Feed"]',
  '["sample","bangul"]',
  'none',
  1,
  'published',
  datetime('now'),
  datetime('now')
FROM users u
INNER JOIN pets p ON p.guardian_id = u.id
WHERE u.email = 'guardian@petlife.com'
  AND p.name = '방울'
  AND p.status != 'deleted'
  AND EXISTS (SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'feeds');

INSERT OR IGNORE INTO pet_album_media (
  id, pet_id, source_type, source_id, booking_id,
  media_type, media_url, thumbnail_url, caption, tags,
  uploaded_by_user_id, visibility_scope, is_primary, sort_order, status, created_at, updated_at
)
SELECT
  'seed-album-bangul-profile',
  p.id,
  'profile',
  p.id,
  NULL,
  'image',
  COALESCE(p.avatar_url, 'https://placehold.co/600x600?text=Bangul'),
  COALESCE(p.avatar_url, 'https://placehold.co/600x600?text=Bangul'),
  '방울 프로필 사진',
  '["sample","profile"]',
  u.id,
  'public',
  1,
  0,
  'active',
  datetime('now'),
  datetime('now')
FROM users u
INNER JOIN pets p ON p.guardian_id = u.id
WHERE u.email = 'guardian@petlife.com'
  AND p.name = '방울'
  AND p.status != 'deleted'
  AND EXISTS (SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'pet_album_media');

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0022_restore_bangul_sample');
