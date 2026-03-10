-- 사료 등록 요청 UX 개선 i18n 키
INSERT OR IGNORE INTO i18n_translations (id, key, page, ko, en, is_active, created_at, updated_at) VALUES
-- 직접 입력 토글 문구
(lower(hex(randomblob(16))), 'guardian.feed.custom_manufacturer', 'guardian', '찾는 제조사가 없으신가요? 직접 입력하기', 'Can''t find it? Enter manually', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'guardian.feed.custom_brand', 'guardian', '찾는 브랜드가 없으신가요? 직접 입력하기', 'Can''t find it? Enter manually', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'guardian.feed.custom_feed_type', 'guardian', '찾는 종류가 없으신가요? 직접 입력하기', 'Can''t find it? Enter manually', 1, datetime('now'), datetime('now')),
-- Wizard step 라벨
(lower(hex(randomblob(16))), 'guardian.feed.nutr_step1', 'guardian', '기본 영양소', 'Basic Nutrients', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'guardian.feed.nutr_step2', 'guardian', '상세 영양소', 'Detailed Nutrients', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'guardian.feed.nutr_step3', 'guardian', '미네랄/기타', 'Minerals & Others', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'guardian.feed.nutr_step4', 'guardian', '원재료', 'Ingredients', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'guardian.feed.nutr_prev', 'guardian', '이전', 'Previous', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'guardian.feed.nutr_next', 'guardian', '다음', 'Next', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'guardian.feed.nutr_done', 'guardian', '완료', 'Done', 1, datetime('now'), datetime('now'));
