-- Feed + Friendship + Booking Publish Workflow Verification Queries
-- 대상 마이그레이션: 0016_feed_friendship_booking_core
-- DB: SQLite/D1 호환

-- -----------------------------------------------------------------------------
-- Q1) 0016 마이그레이션 적용 여부
-- -----------------------------------------------------------------------------
SELECT version, applied_at
FROM schema_migrations
WHERE version = '0016_feed_friendship_booking_core';

-- -----------------------------------------------------------------------------
-- Q2) 필수 테이블 생성 여부
-- -----------------------------------------------------------------------------
SELECT name
FROM sqlite_master
WHERE type = 'table'
  AND name IN (
    'bookings',
    'booking_completion_contents',
    'feeds',
    'feed_likes',
    'feed_comments',
    'friend_requests',
    'friendships'
  )
ORDER BY name;

-- -----------------------------------------------------------------------------
-- Q3) feed_type/visibility/status 분포 확인
-- -----------------------------------------------------------------------------
SELECT
  feed_type,
  visibility_scope,
  status,
  publish_request_status,
  COUNT(*) AS cnt
FROM feeds
GROUP BY feed_type, visibility_scope, status, publish_request_status
ORDER BY cnt DESC, feed_type;

-- -----------------------------------------------------------------------------
-- Q4) booking_completed 게시물 중 공개 노출 규칙 위반 탐지
-- 규칙: publish_request_status='approved'가 아니면 공개(is_public=1, status='published')되면 안 됨
-- -----------------------------------------------------------------------------
SELECT id, booking_id, publish_request_status, is_public, status, updated_at
FROM feeds
WHERE feed_type = 'booking_completed'
  AND (is_public = 1 OR status = 'published')
  AND publish_request_status <> 'approved'
ORDER BY updated_at DESC;

-- -----------------------------------------------------------------------------
-- Q5) booking 상태와 completion publish 상태 불일치 탐지
-- approved/rejected 일치 여부 확인
-- -----------------------------------------------------------------------------
SELECT
  b.id AS booking_id,
  b.status AS booking_status,
  c.publish_status,
  c.responded_at,
  c.updated_at
FROM bookings b
LEFT JOIN booking_completion_contents c ON c.booking_id = b.id
WHERE b.status IN ('publish_approved', 'publish_rejected')
  AND (
    c.booking_id IS NULL OR
    (b.status = 'publish_approved' AND c.publish_status <> 'approved') OR
    (b.status = 'publish_rejected' AND c.publish_status <> 'rejected')
  )
ORDER BY b.updated_at DESC;

-- -----------------------------------------------------------------------------
-- Q6) 친구 요청 중 self-request / 중복 active friendship 탐지
-- -----------------------------------------------------------------------------
SELECT id, requester_user_id, receiver_user_id, status, created_at
FROM friend_requests
WHERE requester_user_id = receiver_user_id;

SELECT user_a_id, user_b_id, COUNT(*) AS duplicate_count
FROM friendships
WHERE status = 'active'
GROUP BY user_a_id, user_b_id
HAVING COUNT(*) > 1;

-- -----------------------------------------------------------------------------
-- Q7) 댓글 상태 요약 + 삭제된 댓글 노출 여부(활성 조회 API 기준) 점검용
-- -----------------------------------------------------------------------------
SELECT status, COUNT(*) AS cnt
FROM feed_comments
GROUP BY status
ORDER BY cnt DESC;

SELECT post_id, id, author_user_id, status, content, updated_at
FROM feed_comments
WHERE status = 'deleted'
ORDER BY updated_at DESC
LIMIT 100;

-- -----------------------------------------------------------------------------
-- Q8) 좋아요 중복 방지(UNIQUE(feed_id, user_id)) 위반 탐지
-- -----------------------------------------------------------------------------
SELECT feed_id, user_id, COUNT(*) AS dup_count
FROM feed_likes
GROUP BY feed_id, user_id
HAVING COUNT(*) > 1;

-- -----------------------------------------------------------------------------
-- Q9) 메인 피드 필터 키 연결성 점검 (business_category_id/pet_type_id 유효성)
-- -----------------------------------------------------------------------------
SELECT f.id, f.business_category_id
FROM feeds f
LEFT JOIN master_items mi ON mi.id = f.business_category_id
WHERE f.business_category_id IS NOT NULL
  AND mi.id IS NULL
ORDER BY f.created_at DESC;

SELECT f.id, f.pet_type_id
FROM feeds f
LEFT JOIN master_items mi ON mi.id = f.pet_type_id
WHERE f.pet_type_id IS NOT NULL
  AND mi.id IS NULL
ORDER BY f.created_at DESC;

-- -----------------------------------------------------------------------------
-- Q10) 최근 50건 운영 점검 뷰 (피드 + 예약 + 승인상태)
-- -----------------------------------------------------------------------------
SELECT
  f.id AS feed_id,
  f.feed_type,
  f.status AS feed_status,
  f.publish_request_status,
  f.visibility_scope,
  f.is_public,
  f.booking_id,
  b.status AS booking_status,
  c.publish_status,
  f.created_at,
  f.updated_at
FROM feeds f
LEFT JOIN bookings b ON b.id = f.booking_id
LEFT JOIN booking_completion_contents c ON c.booking_id = f.booking_id
ORDER BY f.created_at DESC
LIMIT 50;
