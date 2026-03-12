-- =============================================================================
-- 005: Store + Ad dummy cards for feed card settings
-- Adds 'store' card_type, 70 store dummy cards, 10 ad dummy cards, i18n keys
-- =============================================================================

BEGIN;

-- ─── 1. Add 'store' card_type to feed_card_settings ─────────────────────────
INSERT INTO feed_card_settings (id, card_type, is_enabled, interval_n, sort_order, rotation_order)
VALUES (gen_random_uuid()::text, 'store', true, 7, 4, 0)
ON CONFLICT (card_type) DO NOTHING;

-- ─── 2. Store dummy cards (70 = 7 categories × 10) ─────────────────────────
-- tab_type='store', badge_text=category key, metadata has category + review_count

-- grooming (미용) ×10
INSERT INTO feed_dummy_cards (id, tab_type, title, subtitle, badge_text, score, region, description, display_name, metadata, is_active, sort_order, created_at, updated_at) VALUES
(gen_random_uuid()::text, 'store', '강남 해피독 미용실', '미용', 'grooming', 48, '서울 강남구', '역삼동 123-4 2층', 'Happy Dog Grooming', '{"category":"grooming","review_count":156}', true, 1, now(), now()),
(gen_random_uuid()::text, 'store', '펫스타일 도곡점', '미용', 'grooming', 47, '서울 강남구', '도곡동 45-2', 'Pet Style Dogok', '{"category":"grooming","review_count":89}', true, 2, now(), now()),
(gen_random_uuid()::text, 'store', '뽀삐네 미용실', '미용', 'grooming', 49, '서울 마포구', '연남동 56-1', 'Poppy Grooming', '{"category":"grooming","review_count":234}', true, 3, now(), now()),
(gen_random_uuid()::text, 'store', '러브펫 그루밍', '미용', 'grooming', 45, '서울 서초구', '서초동 789-3', 'Love Pet Grooming', '{"category":"grooming","review_count":67}', true, 4, now(), now()),
(gen_random_uuid()::text, 'store', '멍멍살롱 홍대점', '미용', 'grooming', 46, '서울 마포구', '서교동 33-8', 'Mung Mung Salon', '{"category":"grooming","review_count":142}', true, 5, now(), now()),
(gen_random_uuid()::text, 'store', '도그마스터 미용', '미용', 'grooming', 50, '부산 해운대구', '우동 456-7', 'Dog Master Grooming', '{"category":"grooming","review_count":198}', true, 6, now(), now()),
(gen_random_uuid()::text, 'store', '캣앤독 뷰티', '미용', 'grooming', 44, '대구 수성구', '범어동 12-5', 'Cat & Dog Beauty', '{"category":"grooming","review_count":53}', true, 7, now(), now()),
(gen_random_uuid()::text, 'store', '펫뷰티 분당점', '미용', 'grooming', 47, '경기 성남시', '정자동 88-2', 'Pet Beauty Bundang', '{"category":"grooming","review_count":112}', true, 8, now(), now()),
(gen_random_uuid()::text, 'store', '럭셔리펫 강서점', '미용', 'grooming', 46, '서울 강서구', '화곡동 234-1', 'Luxury Pet Gangseo', '{"category":"grooming","review_count":78}', true, 9, now(), now()),
(gen_random_uuid()::text, 'store', '쁘띠쁘띠 그루밍', '미용', 'grooming', 48, '인천 연수구', '송도동 5-3', 'Petit Petit Grooming', '{"category":"grooming","review_count":91}', true, 10, now(), now());

-- hospital (동물병원) ×10
INSERT INTO feed_dummy_cards (id, tab_type, title, subtitle, badge_text, score, region, description, display_name, metadata, is_active, sort_order, created_at, updated_at) VALUES
(gen_random_uuid()::text, 'store', '서울동물병원', '동물병원', 'hospital', 49, '서울 강남구', '신사동 567-2', 'Seoul Animal Hospital', '{"category":"hospital","review_count":312}', true, 1, now(), now()),
(gen_random_uuid()::text, 'store', '해피펫 동물의료센터', '동물병원', 'hospital', 48, '서울 송파구', '잠실동 89-1', 'Happy Pet Medical', '{"category":"hospital","review_count":267}', true, 2, now(), now()),
(gen_random_uuid()::text, 'store', '24시 사랑동물병원', '동물병원', 'hospital', 50, '서울 관악구', '신림동 345-6', '24h Love Animal Hospital', '{"category":"hospital","review_count":445}', true, 3, now(), now()),
(gen_random_uuid()::text, 'store', '닥터펫 노원점', '동물병원', 'hospital', 47, '서울 노원구', '상계동 112-3', 'Dr. Pet Nowon', '{"category":"hospital","review_count":178}', true, 4, now(), now()),
(gen_random_uuid()::text, 'store', '그린동물병원', '동물병원', 'hospital', 46, '경기 수원시', '영통동 88-9', 'Green Animal Hospital', '{"category":"hospital","review_count":134}', true, 5, now(), now()),
(gen_random_uuid()::text, 'store', '부산펫 동물의료센터', '동물병원', 'hospital', 48, '부산 수영구', '광안동 234-5', 'Busan Pet Medical', '{"category":"hospital","review_count":223}', true, 6, now(), now()),
(gen_random_uuid()::text, 'store', '참좋은 동물병원', '동물병원', 'hospital', 45, '대전 유성구', '봉명동 56-7', 'Chamjoeun Animal Hospital', '{"category":"hospital","review_count":98}', true, 7, now(), now()),
(gen_random_uuid()::text, 'store', '이웃동물병원', '동물병원', 'hospital', 47, '서울 영등포구', '여의동 78-3', 'Neighbor Animal Hospital', '{"category":"hospital","review_count":187}', true, 8, now(), now()),
(gen_random_uuid()::text, 'store', '펫닥터스 분당', '동물병원', 'hospital', 49, '경기 성남시', '서현동 234-8', 'Pet Doctors Bundang', '{"category":"hospital","review_count":356}', true, 9, now(), now()),
(gen_random_uuid()::text, 'store', '아이펫 동물병원', '동물병원', 'hospital', 46, '인천 남동구', '구월동 456-1', 'iPet Animal Hospital', '{"category":"hospital","review_count":112}', true, 10, now(), now());

-- hotel (호텔) ×10
INSERT INTO feed_dummy_cards (id, tab_type, title, subtitle, badge_text, score, region, description, display_name, metadata, is_active, sort_order, created_at, updated_at) VALUES
(gen_random_uuid()::text, 'store', '펫호텔 강남', '호텔', 'hotel', 47, '서울 강남구', '논현동 234-5', 'Pet Hotel Gangnam', '{"category":"hotel","review_count":89}', true, 1, now(), now()),
(gen_random_uuid()::text, 'store', '도그빌라 리조트', '호텔', 'hotel', 49, '경기 가평군', '청평면 12-3', 'Dog Villa Resort', '{"category":"hotel","review_count":234}', true, 2, now(), now()),
(gen_random_uuid()::text, 'store', '해피스테이 펫호텔', '호텔', 'hotel', 46, '서울 서초구', '반포동 567-8', 'Happy Stay Pet Hotel', '{"category":"hotel","review_count":67}', true, 3, now(), now()),
(gen_random_uuid()::text, 'store', '펫프렌즈 하우스', '호텔', 'hotel', 48, '서울 마포구', '합정동 89-2', 'Pet Friends House', '{"category":"hotel","review_count":145}', true, 4, now(), now()),
(gen_random_uuid()::text, 'store', '댕댕이네 호텔', '호텔', 'hotel', 45, '서울 송파구', '문정동 45-6', 'Daeng Daeng Hotel', '{"category":"hotel","review_count":56}', true, 5, now(), now()),
(gen_random_uuid()::text, 'store', '럭셔리펫 호텔', '호텔', 'hotel', 50, '부산 해운대구', '중동 789-1', 'Luxury Pet Hotel', '{"category":"hotel","review_count":189}', true, 6, now(), now()),
(gen_random_uuid()::text, 'store', '마이펫 게스트하우스', '호텔', 'hotel', 44, '제주 제주시', '노형동 34-5', 'My Pet Guesthouse', '{"category":"hotel","review_count":78}', true, 7, now(), now()),
(gen_random_uuid()::text, 'store', '펫파라다이스', '호텔', 'hotel', 47, '경기 용인시', '수지구 23-4', 'Pet Paradise', '{"category":"hotel","review_count":123}', true, 8, now(), now()),
(gen_random_uuid()::text, 'store', '우리집 펫호텔', '호텔', 'hotel', 46, '대구 달서구', '월성동 56-7', 'Woori Pet Hotel', '{"category":"hotel","review_count":91}', true, 9, now(), now()),
(gen_random_uuid()::text, 'store', '코지펫 호텔 일산', '호텔', 'hotel', 48, '경기 고양시', '일산동구 345-2', 'Cozy Pet Hotel Ilsan', '{"category":"hotel","review_count":167}', true, 10, now(), now());

-- training (훈련) ×10
INSERT INTO feed_dummy_cards (id, tab_type, title, subtitle, badge_text, score, region, description, display_name, metadata, is_active, sort_order, created_at, updated_at) VALUES
(gen_random_uuid()::text, 'store', '도그스쿨 서울', '훈련', 'training', 48, '서울 강남구', '대치동 123-4', 'Dog School Seoul', '{"category":"training","review_count":145}', true, 1, now(), now()),
(gen_random_uuid()::text, 'store', '펫트레이닝 센터', '훈련', 'training', 47, '서울 종로구', '혜화동 56-2', 'Pet Training Center', '{"category":"training","review_count":89}', true, 2, now(), now()),
(gen_random_uuid()::text, 'store', '스마트독 아카데미', '훈련', 'training', 49, '서울 서초구', '서초동 789-3', 'Smart Dog Academy', '{"category":"training","review_count":234}', true, 3, now(), now()),
(gen_random_uuid()::text, 'store', '강아지 놀이학교', '훈련', 'training', 46, '경기 성남시', '분당구 45-6', 'Puppy Play School', '{"category":"training","review_count":67}', true, 4, now(), now()),
(gen_random_uuid()::text, 'store', '펫에듀 강서점', '훈련', 'training', 45, '서울 강서구', '화곡동 234-1', 'Pet Edu Gangseo', '{"category":"training","review_count":53}', true, 5, now(), now()),
(gen_random_uuid()::text, 'store', '도그맘 트레이닝', '훈련', 'training', 48, '부산 수영구', '민락동 78-9', 'Dog Mom Training', '{"category":"training","review_count":112}', true, 6, now(), now()),
(gen_random_uuid()::text, 'store', '반려견 행동교정', '훈련', 'training', 50, '서울 마포구', '연남동 12-3', 'Pet Behavior Correction', '{"category":"training","review_count":267}', true, 7, now(), now()),
(gen_random_uuid()::text, 'store', '해피독 유치원', '훈련', 'training', 47, '서울 용산구', '이태원동 56-7', 'Happy Dog Daycare', '{"category":"training","review_count":98}', true, 8, now(), now()),
(gen_random_uuid()::text, 'store', '펫클래스 대전', '훈련', 'training', 44, '대전 서구', '둔산동 89-1', 'Pet Class Daejeon', '{"category":"training","review_count":45}', true, 9, now(), now()),
(gen_random_uuid()::text, 'store', '프로독 트레이닝', '훈련', 'training', 46, '인천 서구', '검단동 345-2', 'Pro Dog Training', '{"category":"training","review_count":78}', true, 10, now(), now());

-- shop (샵) ×10
INSERT INTO feed_dummy_cards (id, tab_type, title, subtitle, badge_text, score, region, description, display_name, metadata, is_active, sort_order, created_at, updated_at) VALUES
(gen_random_uuid()::text, 'store', '펫마트 강남점', '샵', 'shop', 47, '서울 강남구', '역삼동 234-5', 'Pet Mart Gangnam', '{"category":"shop","review_count":312}', true, 1, now(), now()),
(gen_random_uuid()::text, 'store', '반려동물백화점', '샵', 'shop', 48, '서울 송파구', '잠실동 567-8', 'Pet Department Store', '{"category":"shop","review_count":445}', true, 2, now(), now()),
(gen_random_uuid()::text, 'store', '도그앤캣 스토어', '샵', 'shop', 46, '서울 마포구', '상수동 89-2', 'Dog & Cat Store', '{"category":"shop","review_count":178}', true, 3, now(), now()),
(gen_random_uuid()::text, 'store', '펫라이프 용산점', '샵', 'shop', 45, '서울 용산구', '한남동 123-4', 'Pet Life Yongsan', '{"category":"shop","review_count":67}', true, 4, now(), now()),
(gen_random_uuid()::text, 'store', '해피펫 매장', '샵', 'shop', 49, '부산 해운대구', '해운대동 45-6', 'Happy Pet Store', '{"category":"shop","review_count":234}', true, 5, now(), now()),
(gen_random_uuid()::text, 'store', '멍냥샵 판교', '샵', 'shop', 47, '경기 성남시', '판교동 789-1', 'MungNyang Shop', '{"category":"shop","review_count":145}', true, 6, now(), now()),
(gen_random_uuid()::text, 'store', '프리미엄 펫샵', '샵', 'shop', 50, '서울 서초구', '방배동 34-5', 'Premium Pet Shop', '{"category":"shop","review_count":389}', true, 7, now(), now()),
(gen_random_uuid()::text, 'store', '러블리펫 인천점', '샵', 'shop', 44, '인천 연수구', '송도동 56-7', 'Lovely Pet Incheon', '{"category":"shop","review_count":56}', true, 8, now(), now()),
(gen_random_uuid()::text, 'store', '올펫 스토어', '샵', 'shop', 46, '대구 수성구', '만촌동 234-8', 'All Pet Store', '{"category":"shop","review_count":98}', true, 9, now(), now()),
(gen_random_uuid()::text, 'store', '도그월드 제주', '샵', 'shop', 48, '제주 제주시', '이도동 12-3', 'Dog World Jeju', '{"category":"shop","review_count":167}', true, 10, now(), now());

-- cafe (카페) ×10
INSERT INTO feed_dummy_cards (id, tab_type, title, subtitle, badge_text, score, region, description, display_name, metadata, is_active, sort_order, created_at, updated_at) VALUES
(gen_random_uuid()::text, 'store', '멍멍카페 연남', '카페', 'cafe', 48, '서울 마포구', '연남동 234-5', 'MungMung Cafe Yeonnam', '{"category":"cafe","review_count":278}', true, 1, now(), now()),
(gen_random_uuid()::text, 'store', '도그카페 라떼', '카페', 'cafe', 47, '서울 강남구', '신사동 567-8', 'Dog Cafe Latte', '{"category":"cafe","review_count":189}', true, 2, now(), now()),
(gen_random_uuid()::text, 'store', '캣카페 니야옹', '카페', 'cafe', 49, '서울 종로구', '삼청동 89-2', 'Cat Cafe Nyaong', '{"category":"cafe","review_count":345}', true, 3, now(), now()),
(gen_random_uuid()::text, 'store', '펫프렌들리 카페', '카페', 'cafe', 46, '서울 서초구', '서초동 123-4', 'Pet Friendly Cafe', '{"category":"cafe","review_count":134}', true, 4, now(), now()),
(gen_random_uuid()::text, 'store', '바우와우 카페', '카페', 'cafe', 45, '서울 송파구', '가락동 45-6', 'Bow Wow Cafe', '{"category":"cafe","review_count":67}', true, 5, now(), now()),
(gen_random_uuid()::text, 'store', '댕댕이 라운지', '카페', 'cafe', 50, '부산 해운대구', '중동 789-1', 'DaengDaeng Lounge', '{"category":"cafe","review_count":412}', true, 6, now(), now()),
(gen_random_uuid()::text, 'store', '퍼피카페 수원', '카페', 'cafe', 44, '경기 수원시', '인계동 34-5', 'Puppy Cafe Suwon', '{"category":"cafe","review_count":45}', true, 7, now(), now()),
(gen_random_uuid()::text, 'store', '냥이네 카페', '카페', 'cafe', 47, '서울 성동구', '성수동 56-7', 'Nyangi Cafe', '{"category":"cafe","review_count":156}', true, 8, now(), now()),
(gen_random_uuid()::text, 'store', '도그파크 카페', '카페', 'cafe', 48, '경기 고양시', '일산서구 234-8', 'Dog Park Cafe', '{"category":"cafe","review_count":198}', true, 9, now(), now()),
(gen_random_uuid()::text, 'store', '애견카페 제주', '카페', 'cafe', 46, '제주 서귀포시', '서홍동 12-3', 'Pet Cafe Jeju', '{"category":"cafe","review_count":89}', true, 10, now(), now());

-- photo (사진) ×10
INSERT INTO feed_dummy_cards (id, tab_type, title, subtitle, badge_text, score, region, description, display_name, metadata, is_active, sort_order, created_at, updated_at) VALUES
(gen_random_uuid()::text, 'store', '펫포토 스튜디오', '사진', 'photo', 49, '서울 강남구', '청담동 234-5', 'Pet Photo Studio', '{"category":"photo","review_count":267}', true, 1, now(), now()),
(gen_random_uuid()::text, 'store', '멍멍 스냅사진', '사진', 'photo', 47, '서울 마포구', '합정동 567-8', 'MungMung Snap', '{"category":"photo","review_count":134}', true, 2, now(), now()),
(gen_random_uuid()::text, 'store', '도그포토그래피', '사진', 'photo', 48, '서울 서초구', '방배동 89-2', 'Dog Photography', '{"category":"photo","review_count":189}', true, 3, now(), now()),
(gen_random_uuid()::text, 'store', '펫라이프 사진관', '사진', 'photo', 46, '서울 종로구', '평창동 123-4', 'Pet Life Photo', '{"category":"photo","review_count":78}', true, 4, now(), now()),
(gen_random_uuid()::text, 'store', '캣스냅 스튜디오', '사진', 'photo', 50, '서울 성동구', '성수동 45-6', 'Cat Snap Studio', '{"category":"photo","review_count":345}', true, 5, now(), now()),
(gen_random_uuid()::text, 'store', '펫메모리 부산', '사진', 'photo', 45, '부산 수영구', '남천동 789-1', 'Pet Memory Busan', '{"category":"photo","review_count":56}', true, 6, now(), now()),
(gen_random_uuid()::text, 'store', '아이펫 포토', '사진', 'photo', 47, '경기 성남시', '야탑동 34-5', 'iPet Photo', '{"category":"photo","review_count":112}', true, 7, now(), now()),
(gen_random_uuid()::text, 'store', '위드펫 스냅', '사진', 'photo', 48, '서울 영등포구', '여의동 56-7', 'With Pet Snap', '{"category":"photo","review_count":198}', true, 8, now(), now()),
(gen_random_uuid()::text, 'store', '펫프레임 대구', '사진', 'photo', 44, '대구 중구', '삼덕동 234-8', 'Pet Frame Daegu', '{"category":"photo","review_count":45}', true, 9, now(), now()),
(gen_random_uuid()::text, 'store', '러브샷 펫포토', '사진', 'photo', 46, '인천 연수구', '동춘동 12-3', 'Love Shot Pet Photo', '{"category":"photo","review_count":91}', true, 10, now(), now());

-- ─── 3. Ad dummy cards (10) — Google Ads format ─────────────────────────────
INSERT INTO feed_dummy_cards (id, tab_type, title, subtitle, badge_text, score, region, description, display_name, image_url, link_url, metadata, is_active, sort_order, created_at, updated_at) VALUES
(gen_random_uuid()::text, 'ad', '프리미엄 반려동물 사료 최대 40% 할인', '로얄캐닌', 'AD', 0, NULL, '수의사 추천 프리미엄 사료, 지금 특별 할인 중! 무료 배송 혜택까지.', 'Royal Canin', 'https://placehold.co/600x300/f59e0b/fff?text=Royal+Canin+Ad', 'https://example.com/royal-canin', '{"ad_format":"banner","cta":"지금 구매하기","advertiser":"Royal Canin Korea"}', true, 1, now(), now()),
(gen_random_uuid()::text, 'ad', '우리 아이 건강검진, 이제 집에서!', '펫닥', 'AD', 0, NULL, '앱으로 간편하게 수의사 상담. 첫 상담 무료! 24시간 언제든 가능.', 'PetDoc', 'https://placehold.co/600x300/3b82f6/fff?text=PetDoc+Ad', 'https://example.com/petdoc', '{"ad_format":"banner","cta":"무료 상담 받기","advertiser":"PetDoc Inc."}', true, 2, now(), now()),
(gen_random_uuid()::text, 'ad', '강아지 보험 월 9,900원부터', '펫보험플러스', 'AD', 0, NULL, '수술비, 입원비, 통원치료까지 보장! 가입 즉시 보장 시작.', 'Pet Insurance Plus', 'https://placehold.co/600x300/10b981/fff?text=Pet+Insurance+Ad', 'https://example.com/pet-insurance', '{"ad_format":"banner","cta":"보험료 확인","advertiser":"펫보험플러스"}', true, 3, now(), now()),
(gen_random_uuid()::text, 'ad', '천연 유기농 간식 출시!', '바우와우 트릿', 'AD', 0, NULL, '100% 국내산 유기농 원재료. 인공 첨가물 ZERO. 지금 런칭 기념 1+1!', 'BowWow Treats', 'https://placehold.co/600x300/9b5de5/fff?text=BowWow+Treats', 'https://example.com/bowwow', '{"ad_format":"banner","cta":"1+1 혜택 받기","advertiser":"바우와우 코리아"}', true, 4, now(), now()),
(gen_random_uuid()::text, 'ad', '스마트 펫 카메라 PIBO 출시', '파이보', 'AD', 0, NULL, '집에 혼자 있는 우리 아이, AI가 지켜봐요. 양방향 음성, 간식 투하 기능.', 'PIBO', 'https://placehold.co/600x300/ef4444/fff?text=PIBO+Camera', 'https://example.com/pibo', '{"ad_format":"banner","cta":"제품 보러가기","advertiser":"파이보 테크"}', true, 5, now(), now()),
(gen_random_uuid()::text, 'ad', '반려동물 동반 호텔 예약', '펫스테이', 'AD', 0, NULL, '전국 200+ 반려동물 동반 숙소. 실시간 예약, 후기 확인. 특별 할인 진행 중.', 'PetStay', 'https://placehold.co/600x300/f59e0b/fff?text=PetStay+Hotel', 'https://example.com/petstay', '{"ad_format":"banner","cta":"숙소 검색하기","advertiser":"펫스테이"}', true, 6, now(), now()),
(gen_random_uuid()::text, 'ad', '자동 급식기 & 급수기 세트', '펫테크', 'AD', 0, NULL, '앱으로 원격 조절! 사료량 자동 계산, 급수량 모니터링. 세트 할인 20%.', 'PetTech', 'https://placehold.co/600x300/3b82f6/fff?text=PetTech+Feeder', 'https://example.com/pettech', '{"ad_format":"banner","cta":"세트 구매하기","advertiser":"펫테크 주식회사"}', true, 7, now(), now()),
(gen_random_uuid()::text, 'ad', '강아지 미용 첫 방문 50% 할인', '펫스타일', 'AD', 0, NULL, '전문 미용사의 프리미엄 그루밍 서비스. 첫 고객 특별 할인 + 무료 목욕.', 'PetStyle', 'https://placehold.co/600x300/10b981/fff?text=PetStyle+Grooming', 'https://example.com/petstyle', '{"ad_format":"banner","cta":"예약하기","advertiser":"펫스타일 그루밍"}', true, 8, now(), now()),
(gen_random_uuid()::text, 'ad', 'GPS 스마트 목줄 런칭', '트래커펫', 'AD', 0, NULL, '실시간 위치 추적, 산책 기록, 활동량 분석. 분실 방지 알림까지.', 'TrackerPet', 'https://placehold.co/600x300/9b5de5/fff?text=TrackerPet+GPS', 'https://example.com/trackerpet', '{"ad_format":"banner","cta":"자세히 보기","advertiser":"트래커펫"}', true, 9, now(), now()),
(gen_random_uuid()::text, 'ad', '반려동물 DNA 검사 키트', '마이펫진', 'AD', 0, NULL, '집에서 간편하게! 품종, 건강 위험도, 유전 질환 분석. 결과 2주 내 제공.', 'MyPetGene', 'https://placehold.co/600x300/ef4444/fff?text=MyPetGene+DNA', 'https://example.com/mypetgene', '{"ad_format":"banner","cta":"검사 신청","advertiser":"마이펫진 바이오"}', true, 10, now(), now());

-- ─── 4. i18n keys ────────────────────────────────────────────────────────────
INSERT INTO i18n_translations (id, key, page, is_active, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, created_at, updated_at) VALUES
(gen_random_uuid()::text, 'admin.feed_card.type_store', 'admin', true, '공급자', 'Store', '店舗', '店铺', '店鋪', 'Tienda', 'Magasin', 'Geschäft', 'Loja', 'Cửa hàng', 'ร้านค้า', 'Toko', 'متجر', now(), now()),
(gen_random_uuid()::text, 'admin.feed_card.dummy_tab_store', 'admin', true, '공급자 매장', 'Store', '店舗', '店铺', '店鋪', 'Tiendas', 'Magasins', 'Geschäfte', 'Lojas', 'Cửa hàng', 'ร้านค้า', 'Toko', 'المتاجر', now(), now()),
(gen_random_uuid()::text, 'admin.feed_card.dummy_tab_ad', 'admin', true, '광고', 'Ads', '広告', '广告', '廣告', 'Anuncios', 'Publicités', 'Anzeigen', 'Anúncios', 'Quảng cáo', 'โฆษณา', 'Iklan', 'إعلانات', now(), now()),
(gen_random_uuid()::text, 'admin.feed_card.store_category', 'admin', true, '업종', 'Category', 'カテゴリ', '分类', '分類', 'Categoría', 'Catégorie', 'Kategorie', 'Categoria', 'Danh mục', 'หมวดหมู่', 'Kategori', 'الفئة', now(), now()),
(gen_random_uuid()::text, 'admin.feed_card.store_cat_all', 'admin', true, '전체', 'All', 'すべて', '全部', '全部', 'Todos', 'Tous', 'Alle', 'Todos', 'Tất cả', 'ทั้งหมด', 'Semua', 'الكل', now(), now()),
(gen_random_uuid()::text, 'admin.feed_card.store_cat_grooming', 'admin', true, '미용', 'Grooming', 'グルーミング', '美容', '美容', 'Peluquería', 'Toilettage', 'Pflege', 'Banho e Tosa', 'Chăm sóc lông', 'ตัดขน', 'Grooming', 'تجميل', now(), now()),
(gen_random_uuid()::text, 'admin.feed_card.store_cat_hospital', 'admin', true, '동물병원', 'Hospital', '動物病院', '动物医院', '動物醫院', 'Hospital', 'Hôpital', 'Tierklinik', 'Hospital', 'Bệnh viện', 'โรงพยาบาล', 'Rumah Sakit', 'مستشفى', now(), now()),
(gen_random_uuid()::text, 'admin.feed_card.store_cat_hotel', 'admin', true, '호텔', 'Hotel', 'ホテル', '酒店', '飯店', 'Hotel', 'Hôtel', 'Hotel', 'Hotel', 'Khách sạn', 'โรงแรม', 'Hotel', 'فندق', now(), now()),
(gen_random_uuid()::text, 'admin.feed_card.store_cat_training', 'admin', true, '훈련', 'Training', 'トレーニング', '训练', '訓練', 'Entrenamiento', 'Entraînement', 'Training', 'Treinamento', 'Huấn luyện', 'ฝึกสอน', 'Pelatihan', 'تدريب', now(), now()),
(gen_random_uuid()::text, 'admin.feed_card.store_cat_shop', 'admin', true, '샵', 'Shop', 'ショップ', '商店', '商店', 'Tienda', 'Boutique', 'Shop', 'Loja', 'Cửa hàng', 'ร้าน', 'Toko', 'متجر', now(), now()),
(gen_random_uuid()::text, 'admin.feed_card.store_cat_cafe', 'admin', true, '카페', 'Café', 'カフェ', '咖啡馆', '咖啡館', 'Café', 'Café', 'Café', 'Café', 'Quán cà phê', 'คาเฟ่', 'Kafe', 'مقهى', now(), now()),
(gen_random_uuid()::text, 'admin.feed_card.store_cat_photo', 'admin', true, '사진', 'Photo', 'フォト', '摄影', '攝影', 'Foto', 'Photo', 'Foto', 'Foto', 'Ảnh', 'ถ่ายรูป', 'Foto', 'تصوير', now(), now())
ON CONFLICT (key) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw, es = EXCLUDED.es,
  fr = EXCLUDED.fr, de = EXCLUDED.de, pt = EXCLUDED.pt,
  vi = EXCLUDED.vi, th = EXCLUDED.th, id_lang = EXCLUDED.id_lang,
  ar = EXCLUDED.ar;

COMMIT;
