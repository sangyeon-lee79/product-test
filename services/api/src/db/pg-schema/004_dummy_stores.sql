-- 004: Dummy provider stores — tables, seed data (70 stores), i18n keys
-- Categories: grooming, hospital, hotel, training, shop, cafe, photo (10 each)

-- ═══════════════════════════════════════════════════════════════════════
-- 1. TABLES
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS dummy_stores (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category      VARCHAR(50) NOT NULL,
  name          JSONB NOT NULL,
  description   JSONB,
  address       JSONB,
  rating        NUMERIC(2,1),
  review_count  INT DEFAULT 0,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dummy_store_services (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dummy_store_id  UUID REFERENCES dummy_stores(id) ON DELETE CASCADE,
  name            JSONB NOT NULL,
  price           NUMERIC(10,2),
  duration_min    INT,
  is_active       BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_dummy_stores_category ON dummy_stores(category);
CREATE INDEX IF NOT EXISTS idx_dummy_stores_active ON dummy_stores(is_active);
CREATE INDEX IF NOT EXISTS idx_dummy_store_services_store ON dummy_store_services(dummy_store_id);

-- ═══════════════════════════════════════════════════════════════════════
-- 2. SEED DATA — 70 dummy stores (7 categories × 10)
-- ═══════════════════════════════════════════════════════════════════════

-- ─── grooming (10) ──────────────────────────────────────────────────
INSERT INTO dummy_stores (category, name, description, address, rating, review_count) VALUES
('grooming', '{"ko":"강남 해피독 미용실","en":"Gangnam Happy Dog Grooming"}', '{"ko":"프리미엄 반려동물 미용 전문점","en":"Premium pet grooming salon"}', '{"state_code":"서울","city_code":"강남구","detail":"역삼동 123-4"}', 4.8, 156),
('grooming', '{"ko":"펫뷰티 살롱","en":"Pet Beauty Salon"}', '{"ko":"소형견 전문 미용","en":"Small dog grooming specialist"}', '{"state_code":"서울","city_code":"서초구","detail":"서초동 45-6"}', 4.6, 89),
('grooming', '{"ko":"도그스파 하우스","en":"Dog Spa House"}', '{"ko":"스파 & 미용 올인원","en":"Spa & grooming all-in-one"}', '{"state_code":"서울","city_code":"마포구","detail":"합정동 78-9"}', 4.9, 234),
('grooming', '{"ko":"캣앤독 그루밍","en":"Cat & Dog Grooming"}', '{"ko":"고양이, 강아지 전문 미용","en":"Cat and dog grooming expert"}', '{"state_code":"부산","city_code":"해운대구","detail":"우동 33-1"}', 4.5, 67),
('grooming', '{"ko":"쁘띠 펫 미용실","en":"Petit Pet Salon"}', '{"ko":"귀여운 스타일링 전문","en":"Cute styling specialist"}', '{"state_code":"서울","city_code":"송파구","detail":"잠실동 56-7"}', 4.7, 112),
('grooming', '{"ko":"로열 펫 그루밍","en":"Royal Pet Grooming"}', '{"ko":"대형견 전문 미용실","en":"Large dog grooming specialist"}', '{"state_code":"경기","city_code":"성남시","detail":"분당구 정자동 88"}', 4.4, 45),
('grooming', '{"ko":"해피테일 미용","en":"Happy Tail Grooming"}', '{"ko":"꼬리 흔드는 미용실","en":"The tail-wagging salon"}', '{"state_code":"인천","city_code":"연수구","detail":"송도동 12-3"}', 4.6, 78),
('grooming', '{"ko":"펫 글래머","en":"Pet Glamour"}', '{"ko":"트렌디한 펫 스타일링","en":"Trendy pet styling"}', '{"state_code":"대구","city_code":"수성구","detail":"범어동 44-5"}', 4.3, 34),
('grooming', '{"ko":"바우와우 살롱","en":"Bow Wow Salon"}', '{"ko":"10년 경력 전문 미용사","en":"10 years experienced groomer"}', '{"state_code":"서울","city_code":"강동구","detail":"천호동 90-1"}', 4.8, 189),
('grooming', '{"ko":"퍼피러브 그루밍","en":"Puppy Love Grooming"}', '{"ko":"강아지 전문 케어","en":"Puppy specialized care"}', '{"state_code":"서울","city_code":"용산구","detail":"이태원동 22-3"}', 4.5, 56);

-- ─── hospital (10) ──────────────────────────────────────────────────
INSERT INTO dummy_stores (category, name, description, address, rating, review_count) VALUES
('hospital', '{"ko":"스마트 동물병원","en":"Smart Animal Hospital"}', '{"ko":"24시간 응급 진료","en":"24-hour emergency care"}', '{"state_code":"서울","city_code":"강남구","detail":"논현동 55-6"}', 4.9, 312),
('hospital', '{"ko":"해피펫 동물의료센터","en":"Happy Pet Medical Center"}', '{"ko":"종합 건강검진 전문","en":"Comprehensive health checkup"}', '{"state_code":"서울","city_code":"서초구","detail":"반포동 11-2"}', 4.7, 198),
('hospital', '{"ko":"펫닥터 클리닉","en":"Pet Doctor Clinic"}', '{"ko":"피부과 전문","en":"Dermatology specialist"}', '{"state_code":"서울","city_code":"마포구","detail":"연남동 34-5"}', 4.6, 145),
('hospital', '{"ko":"우리동물병원","en":"Woori Animal Hospital"}', '{"ko":"내과, 외과 전문","en":"Internal medicine & surgery"}', '{"state_code":"부산","city_code":"남구","detail":"대연동 78-9"}', 4.8, 267),
('hospital', '{"ko":"24시 펫케어","en":"24Hr Pet Care"}', '{"ko":"야간 응급 전문","en":"Night emergency specialist"}', '{"state_code":"서울","city_code":"송파구","detail":"문정동 23-4"}', 4.5, 89),
('hospital', '{"ko":"리틀앤젤 동물병원","en":"Little Angel Vet"}', '{"ko":"소동물 전문 병원","en":"Small animal specialist"}', '{"state_code":"경기","city_code":"용인시","detail":"수지구 죽전동 56"}', 4.4, 67),
('hospital', '{"ko":"펫메디컬센터","en":"Pet Medical Center"}', '{"ko":"CT, MRI 정밀검사","en":"CT and MRI diagnostics"}', '{"state_code":"서울","city_code":"강서구","detail":"등촌동 45-6"}', 4.7, 134),
('hospital', '{"ko":"굿프렌드 동물병원","en":"Good Friend Vet"}', '{"ko":"예방접종, 건강관리","en":"Vaccination & health management"}', '{"state_code":"대전","city_code":"유성구","detail":"봉명동 12-3"}', 4.3, 45),
('hospital', '{"ko":"센트럴 동물의료원","en":"Central Vet Hospital"}', '{"ko":"대학병원급 시설","en":"University hospital-level facilities"}', '{"state_code":"서울","city_code":"중구","detail":"을지로 67-8"}', 4.9, 356),
('hospital', '{"ko":"미래 동물병원","en":"Future Animal Hospital"}', '{"ko":"최신 의료장비 보유","en":"Latest medical equipment"}', '{"state_code":"경기","city_code":"수원시","detail":"영통구 매탄동 33"}', 4.6, 112);

-- ─── hotel (10) ─────────────────────────────────────────────────────
INSERT INTO dummy_stores (category, name, description, address, rating, review_count) VALUES
('hotel', '{"ko":"펫파라다이스 호텔","en":"Pet Paradise Hotel"}', '{"ko":"5성급 반려동물 호텔","en":"5-star pet hotel"}', '{"state_code":"서울","city_code":"강남구","detail":"청담동 88-9"}', 4.9, 234),
('hotel', '{"ko":"해피독 유치원","en":"Happy Dog Daycare"}', '{"ko":"종일반 전문 유치원","en":"Full-day daycare specialist"}', '{"state_code":"서울","city_code":"서초구","detail":"방배동 45-6"}', 4.7, 178),
('hotel', '{"ko":"펫스테이 하우스","en":"Pet Stay House"}', '{"ko":"가정식 돌봄 서비스","en":"Home-style care service"}', '{"state_code":"서울","city_code":"마포구","detail":"서교동 23-4"}', 4.6, 89),
('hotel', '{"ko":"도그빌리지 리조트","en":"Dog Village Resort"}', '{"ko":"넓은 운동장 보유","en":"Large playground available"}', '{"state_code":"경기","city_code":"파주시","detail":"문산읍 광탄로 55"}', 4.8, 156),
('hotel', '{"ko":"캣하우스 호텔","en":"Cat House Hotel"}', '{"ko":"고양이 전문 호텔","en":"Cat-only hotel"}', '{"state_code":"서울","city_code":"종로구","detail":"혜화동 12-3"}', 4.5, 67),
('hotel', '{"ko":"펫빌라 돌봄센터","en":"Pet Villa Care Center"}', '{"ko":"개별 객실 돌봄","en":"Private room care"}', '{"state_code":"부산","city_code":"수영구","detail":"광안동 34-5"}', 4.4, 45),
('hotel', '{"ko":"퍼피하우스 유치원","en":"Puppy House Daycare"}', '{"ko":"사회화 교육 포함","en":"Socialization training included"}', '{"state_code":"서울","city_code":"영등포구","detail":"여의도동 67-8"}', 4.7, 123),
('hotel', '{"ko":"라온펫 호텔","en":"Raon Pet Hotel"}', '{"ko":"CCTV 실시간 모니터링","en":"Real-time CCTV monitoring"}', '{"state_code":"인천","city_code":"남동구","detail":"논현동 90-1"}', 4.6, 98),
('hotel', '{"ko":"숲속 펫리조트","en":"Forest Pet Resort"}', '{"ko":"자연 속 힐링 돌봄","en":"Nature healing care"}', '{"state_code":"경기","city_code":"양평군","detail":"서종면 북한강로 22"}', 4.8, 201),
('hotel', '{"ko":"스마트독 유치원","en":"Smart Dog Daycare"}', '{"ko":"훈련 + 돌봄 통합","en":"Training + care integrated"}', '{"state_code":"서울","city_code":"성북구","detail":"성북동 44-5"}', 4.5, 76);

-- ─── training (10) ──────────────────────────────────────────────────
INSERT INTO dummy_stores (category, name, description, address, rating, review_count) VALUES
('training', '{"ko":"도그마스터 훈련소","en":"Dog Master Training"}', '{"ko":"복종 훈련 전문","en":"Obedience training specialist"}', '{"state_code":"서울","city_code":"강남구","detail":"삼성동 12-3"}', 4.8, 189),
('training', '{"ko":"펫스쿨 아카데미","en":"Pet School Academy"}', '{"ko":"행동교정 프로그램","en":"Behavior correction program"}', '{"state_code":"서울","city_code":"서초구","detail":"잠원동 56-7"}', 4.6, 112),
('training', '{"ko":"굿보이 트레이닝","en":"Good Boy Training"}', '{"ko":"긍정 강화 훈련법","en":"Positive reinforcement method"}', '{"state_code":"경기","city_code":"고양시","detail":"일산동구 중산동 33"}', 4.7, 145),
('training', '{"ko":"스마트독 훈련센터","en":"Smart Dog Training Center"}', '{"ko":"맞춤형 1:1 훈련","en":"Customized 1:1 training"}', '{"state_code":"부산","city_code":"동래구","detail":"온천동 45-6"}', 4.5, 78),
('training', '{"ko":"캐나인 클래스","en":"Canine Class"}', '{"ko":"그룹 레슨 전문","en":"Group lesson specialist"}', '{"state_code":"서울","city_code":"마포구","detail":"상수동 78-9"}', 4.4, 56),
('training', '{"ko":"퍼피 트레이너","en":"Puppy Trainer"}', '{"ko":"강아지 기초 훈련","en":"Puppy basic training"}', '{"state_code":"서울","city_code":"용산구","detail":"한남동 23-4"}', 4.6, 90),
('training', '{"ko":"도그어질리티 센터","en":"Dog Agility Center"}', '{"ko":"어질리티 전문","en":"Agility training specialist"}', '{"state_code":"경기","city_code":"남양주시","detail":"별내면 청학로 11"}', 4.8, 167),
('training', '{"ko":"반려견 행동연구소","en":"Dog Behavior Lab"}', '{"ko":"문제행동 전문 상담","en":"Problem behavior consultation"}', '{"state_code":"서울","city_code":"강동구","detail":"길동 34-5"}', 4.3, 34),
('training', '{"ko":"펫 리더십 스쿨","en":"Pet Leadership School"}', '{"ko":"보호자 교육 병행","en":"Guardian education included"}', '{"state_code":"대구","city_code":"달서구","detail":"월성동 56-7"}', 4.5, 67),
('training', '{"ko":"해피퍼피 트레이닝","en":"Happy Puppy Training"}', '{"ko":"놀이 기반 교육","en":"Play-based education"}', '{"state_code":"서울","city_code":"송파구","detail":"가락동 89-0"}', 4.7, 134);

-- ─── shop (10) ──────────────────────────────────────────────────────
INSERT INTO dummy_stores (category, name, description, address, rating, review_count) VALUES
('shop', '{"ko":"펫마트 프리미엄","en":"Pet Mart Premium"}', '{"ko":"프리미엄 사료, 용품 전문","en":"Premium food & supplies"}', '{"state_code":"서울","city_code":"강남구","detail":"신사동 45-6"}', 4.7, 234),
('shop', '{"ko":"해피펫 스토어","en":"Happy Pet Store"}', '{"ko":"자연주의 펫 용품","en":"Natural pet supplies"}', '{"state_code":"서울","city_code":"서초구","detail":"서초동 78-9"}', 4.5, 123),
('shop', '{"ko":"도그앤캣 마켓","en":"Dog & Cat Market"}', '{"ko":"온라인 최저가 보장","en":"Online lowest price guarantee"}', '{"state_code":"서울","city_code":"마포구","detail":"홍대입구 12-3"}', 4.6, 189),
('shop', '{"ko":"펫츠 파라다이스","en":"Pets Paradise"}', '{"ko":"이색 펫 용품 전문","en":"Unique pet supplies"}', '{"state_code":"부산","city_code":"중구","detail":"남포동 34-5"}', 4.4, 67),
('shop', '{"ko":"바우와우 샵","en":"Bow Wow Shop"}', '{"ko":"수제 간식 전문점","en":"Handmade treats specialist"}', '{"state_code":"서울","city_code":"종로구","detail":"삼청동 56-7"}', 4.8, 278),
('shop', '{"ko":"펫프렌즈 마트","en":"Pet Friends Mart"}', '{"ko":"대용량 할인 매장","en":"Bulk discount store"}', '{"state_code":"경기","city_code":"화성시","detail":"동탄2동 88-9"}', 4.3, 45),
('shop', '{"ko":"럭키펫 용품점","en":"Lucky Pet Supplies"}', '{"ko":"정기배송 서비스","en":"Regular delivery service"}', '{"state_code":"서울","city_code":"영등포구","detail":"당산동 23-4"}', 4.5, 90),
('shop', '{"ko":"내추럴펫 스토어","en":"Natural Pet Store"}', '{"ko":"유기농 펫 푸드 전문","en":"Organic pet food specialist"}', '{"state_code":"서울","city_code":"성동구","detail":"성수동 67-8"}', 4.7, 156),
('shop', '{"ko":"캣타워 전문점","en":"Cat Tower Shop"}', '{"ko":"고양이 가구 전문","en":"Cat furniture specialist"}', '{"state_code":"인천","city_code":"부평구","detail":"부평동 44-5"}', 4.4, 34),
('shop', '{"ko":"토이펫 샵","en":"Toy Pet Shop"}', '{"ko":"장난감, 의류 전문","en":"Toys & clothing specialist"}', '{"state_code":"서울","city_code":"광진구","detail":"자양동 11-2"}', 4.6, 112);

-- ─── cafe (10) ──────────────────────────────────────────────────────
INSERT INTO dummy_stores (category, name, description, address, rating, review_count) VALUES
('cafe', '{"ko":"멍멍카페","en":"Mung Mung Cafe"}', '{"ko":"강아지와 함께하는 카페","en":"Cafe with dogs"}', '{"state_code":"서울","city_code":"강남구","detail":"압구정동 34-5"}', 4.7, 198),
('cafe', '{"ko":"냥이네 카페","en":"Kitty Cafe"}', '{"ko":"고양이 전문 카페","en":"Cat-only cafe"}', '{"state_code":"서울","city_code":"서초구","detail":"교대동 12-3"}', 4.8, 256),
('cafe', '{"ko":"펫카페 라온","en":"Pet Cafe Raon"}', '{"ko":"대형견 동반 가능","en":"Large dogs welcome"}', '{"state_code":"서울","city_code":"마포구","detail":"연남동 56-7"}', 4.5, 89),
('cafe', '{"ko":"도그파크 카페","en":"Dog Park Cafe"}', '{"ko":"실내 운동장 겸 카페","en":"Indoor playground & cafe"}', '{"state_code":"경기","city_code":"성남시","detail":"분당구 서현동 78"}', 4.6, 134),
('cafe', '{"ko":"포포 펫카페","en":"Popo Pet Cafe"}', '{"ko":"디저트 전문 펫카페","en":"Dessert specialty pet cafe"}', '{"state_code":"서울","city_code":"종로구","detail":"익선동 23-4"}', 4.4, 56),
('cafe', '{"ko":"해피포 카페","en":"Happy Paw Cafe"}', '{"ko":"반려동물 생일파티 가능","en":"Pet birthday party available"}', '{"state_code":"부산","city_code":"해운대구","detail":"좌동 45-6"}', 4.7, 145),
('cafe', '{"ko":"퍼피라떼 카페","en":"Puppy Latte Cafe"}', '{"ko":"스페셜티 커피 + 펫","en":"Specialty coffee + pets"}', '{"state_code":"서울","city_code":"성동구","detail":"성수동 89-0"}', 4.5, 78),
('cafe', '{"ko":"캣치미 카페","en":"Catch Me Cafe"}', '{"ko":"이색 고양이 체험","en":"Unique cat experience"}', '{"state_code":"서울","city_code":"중구","detail":"명동 11-2"}', 4.3, 34),
('cafe', '{"ko":"펫앤커피","en":"Pet & Coffee"}', '{"ko":"프리미엄 원두 + 펫 케어","en":"Premium beans + pet care"}', '{"state_code":"서울","city_code":"용산구","detail":"경리단길 33-4"}', 4.8, 212),
('cafe', '{"ko":"도그브런치 카페","en":"Dog Brunch Cafe"}', '{"ko":"브런치 전문 펫카페","en":"Brunch specialty pet cafe"}', '{"state_code":"제주","city_code":"제주시","detail":"애월읍 한림로 55"}', 4.6, 98);

-- ─── photo (10) ─────────────────────────────────────────────────────
INSERT INTO dummy_stores (category, name, description, address, rating, review_count) VALUES
('photo', '{"ko":"펫포토 스튜디오","en":"Pet Photo Studio"}', '{"ko":"반려동물 전문 촬영","en":"Professional pet photography"}', '{"state_code":"서울","city_code":"강남구","detail":"논현동 22-3"}', 4.9, 189),
('photo', '{"ko":"멍스냅 사진관","en":"Mung Snap Studio"}', '{"ko":"자연광 스튜디오","en":"Natural light studio"}', '{"state_code":"서울","city_code":"서초구","detail":"서초동 44-5"}', 4.7, 134),
('photo', '{"ko":"포포 스냅","en":"Paw Paw Snap"}', '{"ko":"야외 촬영 전문","en":"Outdoor photography specialist"}', '{"state_code":"서울","city_code":"마포구","detail":"합정동 67-8"}', 4.6, 89),
('photo', '{"ko":"캣앤독 포토","en":"Cat & Dog Photo"}', '{"ko":"반려동물 + 가족 촬영","en":"Pet + family photography"}', '{"state_code":"부산","city_code":"해운대구","detail":"우동 12-3"}', 4.5, 56),
('photo', '{"ko":"펫라이프 사진관","en":"Pet Life Photo"}', '{"ko":"일상 기록 촬영","en":"Daily life documentation"}', '{"state_code":"서울","city_code":"송파구","detail":"석촌동 34-5"}', 4.8, 167),
('photo', '{"ko":"스튜디오 바우","en":"Studio Bow"}', '{"ko":"컨셉 촬영 전문","en":"Concept photography specialist"}', '{"state_code":"경기","city_code":"성남시","detail":"분당구 판교동 56"}', 4.4, 45),
('photo', '{"ko":"해피모먼트 사진관","en":"Happy Moment Studio"}', '{"ko":"기념일 촬영 패키지","en":"Anniversary photo package"}', '{"state_code":"서울","city_code":"강동구","detail":"길동 78-9"}', 4.7, 112),
('photo', '{"ko":"퍼피포트레이트","en":"Puppy Portrait"}', '{"ko":"강아지 초상화 촬영","en":"Puppy portrait photography"}', '{"state_code":"서울","city_code":"용산구","detail":"한남동 89-0"}', 4.3, 34),
('photo', '{"ko":"원더펫 스튜디오","en":"Wonder Pet Studio"}', '{"ko":"SNS용 프로필 촬영","en":"SNS profile photography"}', '{"state_code":"서울","city_code":"중구","detail":"을지로 55-6"}', 4.6, 78),
('photo', '{"ko":"펫메모리 촬영소","en":"Pet Memory Studio"}', '{"ko":"무지개다리 기념 촬영","en":"Memorial photography"}', '{"state_code":"인천","city_code":"연수구","detail":"송도동 11-2"}', 4.9, 201);

-- ═══════════════════════════════════════════════════════════════════════
-- 3. SEED SERVICES (3~5 per store, representative samples)
-- ═══════════════════════════════════════════════════════════════════════

-- grooming services (for first 3 stores as sample — others follow same pattern)
INSERT INTO dummy_store_services (dummy_store_id, name, price, duration_min) VALUES
((SELECT id FROM dummy_stores WHERE name->>'ko' = '강남 해피독 미용실'), '{"ko":"전체 미용","en":"Full Grooming"}', 80000, 120),
((SELECT id FROM dummy_stores WHERE name->>'ko' = '강남 해피독 미용실'), '{"ko":"부분 미용","en":"Partial Grooming"}', 40000, 60),
((SELECT id FROM dummy_stores WHERE name->>'ko' = '강남 해피독 미용실'), '{"ko":"목욕 + 드라이","en":"Bath + Dry"}', 30000, 45),
((SELECT id FROM dummy_stores WHERE name->>'ko' = '강남 해피독 미용실'), '{"ko":"발톱 관리","en":"Nail Care"}', 15000, 15),
((SELECT id FROM dummy_stores WHERE name->>'ko' = '펫뷰티 살롱'), '{"ko":"소형견 미용","en":"Small Dog Grooming"}', 50000, 90),
((SELECT id FROM dummy_stores WHERE name->>'ko' = '펫뷰티 살롱'), '{"ko":"위생 미용","en":"Hygiene Grooming"}', 25000, 30),
((SELECT id FROM dummy_stores WHERE name->>'ko' = '펫뷰티 살롱'), '{"ko":"스파 패키지","en":"Spa Package"}', 70000, 120),
((SELECT id FROM dummy_stores WHERE name->>'ko' = '도그스파 하우스'), '{"ko":"풀 스파 코스","en":"Full Spa Course"}', 120000, 180),
((SELECT id FROM dummy_stores WHERE name->>'ko' = '도그스파 하우스'), '{"ko":"아로마 목욕","en":"Aroma Bath"}', 50000, 60),
((SELECT id FROM dummy_stores WHERE name->>'ko' = '도그스파 하우스'), '{"ko":"피부 관리","en":"Skin Care"}', 60000, 90),
-- hospital services
((SELECT id FROM dummy_stores WHERE name->>'ko' = '스마트 동물병원'), '{"ko":"기본 진료","en":"Basic Consultation"}', 30000, 30),
((SELECT id FROM dummy_stores WHERE name->>'ko' = '스마트 동물병원'), '{"ko":"종합 건강검진","en":"Comprehensive Checkup"}', 150000, 120),
((SELECT id FROM dummy_stores WHERE name->>'ko' = '스마트 동물병원'), '{"ko":"예방접종","en":"Vaccination"}', 40000, 15),
((SELECT id FROM dummy_stores WHERE name->>'ko' = '스마트 동물병원'), '{"ko":"치과 스케일링","en":"Dental Scaling"}', 200000, 60),
((SELECT id FROM dummy_stores WHERE name->>'ko' = '해피펫 동물의료센터'), '{"ko":"건강검진 기본","en":"Basic Health Checkup"}', 80000, 60),
((SELECT id FROM dummy_stores WHERE name->>'ko' = '해피펫 동물의료센터'), '{"ko":"혈액 검사","en":"Blood Test"}', 50000, 30),
((SELECT id FROM dummy_stores WHERE name->>'ko' = '해피펫 동물의료센터'), '{"ko":"X-Ray 검사","en":"X-Ray Exam"}', 60000, 20),
-- hotel services
((SELECT id FROM dummy_stores WHERE name->>'ko' = '펫파라다이스 호텔'), '{"ko":"1박 숙박 (소형)","en":"1 Night Stay (Small)"}', 50000, NULL),
((SELECT id FROM dummy_stores WHERE name->>'ko' = '펫파라다이스 호텔'), '{"ko":"1박 숙박 (대형)","en":"1 Night Stay (Large)"}', 80000, NULL),
((SELECT id FROM dummy_stores WHERE name->>'ko' = '펫파라다이스 호텔'), '{"ko":"종일 돌봄","en":"Full Day Care"}', 40000, 480),
((SELECT id FROM dummy_stores WHERE name->>'ko' = '해피독 유치원'), '{"ko":"반일반","en":"Half Day"}', 25000, 240),
((SELECT id FROM dummy_stores WHERE name->>'ko' = '해피독 유치원'), '{"ko":"종일반","en":"Full Day"}', 40000, 480),
((SELECT id FROM dummy_stores WHERE name->>'ko' = '해피독 유치원'), '{"ko":"주 5일 패키지","en":"5-Day Package"}', 160000, NULL),
-- training services
((SELECT id FROM dummy_stores WHERE name->>'ko' = '도그마스터 훈련소'), '{"ko":"기초 복종 훈련","en":"Basic Obedience"}', 200000, 60),
((SELECT id FROM dummy_stores WHERE name->>'ko' = '도그마스터 훈련소'), '{"ko":"행동 교정","en":"Behavior Correction"}', 300000, 90),
((SELECT id FROM dummy_stores WHERE name->>'ko' = '도그마스터 훈련소'), '{"ko":"산책 훈련","en":"Walk Training"}', 100000, 60),
-- shop services
((SELECT id FROM dummy_stores WHERE name->>'ko' = '펫마트 프리미엄'), '{"ko":"사료 정기배송","en":"Regular Food Delivery"}', 0, NULL),
((SELECT id FROM dummy_stores WHERE name->>'ko' = '펫마트 프리미엄'), '{"ko":"맞춤 사료 상담","en":"Custom Food Consultation"}', 0, 30),
((SELECT id FROM dummy_stores WHERE name->>'ko' = '펫마트 프리미엄'), '{"ko":"펫 용품 큐레이션","en":"Pet Supply Curation"}', 0, 20),
-- cafe services
((SELECT id FROM dummy_stores WHERE name->>'ko' = '멍멍카페'), '{"ko":"음료 주문","en":"Beverage Order"}', 6000, NULL),
((SELECT id FROM dummy_stores WHERE name->>'ko' = '멍멍카페'), '{"ko":"펫 케이크","en":"Pet Cake"}', 15000, NULL),
((SELECT id FROM dummy_stores WHERE name->>'ko' = '멍멍카페'), '{"ko":"생일 파티 패키지","en":"Birthday Party Package"}', 50000, 120),
-- photo services
((SELECT id FROM dummy_stores WHERE name->>'ko' = '펫포토 스튜디오'), '{"ko":"기본 촬영 패키지","en":"Basic Photo Package"}', 150000, 60),
((SELECT id FROM dummy_stores WHERE name->>'ko' = '펫포토 스튜디오'), '{"ko":"프리미엄 촬영","en":"Premium Photo Shoot"}', 300000, 120),
((SELECT id FROM dummy_stores WHERE name->>'ko' = '펫포토 스튜디오'), '{"ko":"액자 포함 패키지","en":"Frame Included Package"}', 400000, 120);

-- ═══════════════════════════════════════════════════════════════════════
-- 4. I18N KEYS (15 keys × 13 languages)
-- ═══════════════════════════════════════════════════════════════════════

INSERT INTO i18n_translations (id, key, page,
  ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES
('dummy_store_manage', 'dummy.store_manage', 'admin',
 '더미 매장 관리', 'Dummy Store Management', 'ダミー店舗管理', '虚拟店铺管理', '虛擬店鋪管理',
 'Gestionar tiendas ficticias', 'Gestion des boutiques fictives', 'Dummy-Shop-Verwaltung', 'Gerenciar lojas fictícias',
 'Quản lý cửa hàng giả lập', 'จัดการร้านค้าจำลอง', 'Kelola Toko Dummy', 'إدارة المتاجر التجريبية'),

('dummy_store_add', 'dummy.store_add', 'admin',
 '더미 추가', 'Add Dummy', 'ダミー追加', '添加虚拟', '新增虛擬',
 'Agregar ficticio', 'Ajouter fictif', 'Dummy hinzufügen', 'Adicionar fictício',
 'Thêm giả lập', 'เพิ่มจำลอง', 'Tambah Dummy', 'إضافة تجريبي'),

('dummy_store_edit', 'dummy.store_edit', 'admin',
 '더미 수정', 'Edit Dummy', 'ダミー編集', '编辑虚拟', '編輯虛擬',
 'Editar ficticio', 'Modifier fictif', 'Dummy bearbeiten', 'Editar fictício',
 'Sửa giả lập', 'แก้ไขจำลอง', 'Edit Dummy', 'تعديل تجريبي'),

('dummy_store_active', 'dummy.store_active', 'admin',
 '활성', 'Active', 'アクティブ', '活跃', '啟用',
 'Activo', 'Actif', 'Aktiv', 'Ativo',
 'Hoạt động', 'ใช้งาน', 'Aktif', 'نشط'),

('dummy_store_inactive', 'dummy.store_inactive', 'admin',
 '비활성', 'Inactive', '非アクティブ', '停用', '停用',
 'Inactivo', 'Inactif', 'Inaktiv', 'Inativo',
 'Không hoạt động', 'ไม่ใช้งาน', 'Nonaktif', 'غير نشط'),

('dummy_store_toggle', 'dummy.store_toggle', 'admin',
 '상태 변경', 'Toggle Status', 'ステータス切替', '切换状态', '切換狀態',
 'Cambiar estado', 'Changer le statut', 'Status ändern', 'Alterar status',
 'Đổi trạng thái', 'เปลี่ยนสถานะ', 'Ubah Status', 'تبديل الحالة'),

('dummy_cat_grooming', 'dummy.category_grooming', 'admin',
 '미용', 'Grooming', 'トリミング', '美容', '美容',
 'Peluquería', 'Toilettage', 'Pflege', 'Tosa',
 'Cắt tỉa', 'ตัดขน', 'Grooming', 'تجميل'),

('dummy_cat_hospital', 'dummy.category_hospital', 'admin',
 '동물병원', 'Hospital', '動物病院', '动物医院', '動物醫院',
 'Hospital', 'Hôpital', 'Tierklinik', 'Hospital',
 'Bệnh viện', 'โรงพยาบาล', 'Rumah Sakit', 'مستشفى'),

('dummy_cat_hotel', 'dummy.category_hotel', 'admin',
 '호텔/유치원', 'Hotel/Daycare', 'ホテル/幼稚園', '酒店/托管', '飯店/托管',
 'Hotel/Guardería', 'Hôtel/Garderie', 'Hotel/Betreuung', 'Hotel/Creche',
 'Khách sạn/Nhà trẻ', 'โรงแรม/เนอสเซอรี่', 'Hotel/Penitipan', 'فندق/حضانة'),

('dummy_cat_training', 'dummy.category_training', 'admin',
 '훈련소', 'Training', 'トレーニング', '训练', '訓練',
 'Entrenamiento', 'Dressage', 'Training', 'Treinamento',
 'Huấn luyện', 'ฝึกสอน', 'Pelatihan', 'تدريب'),

('dummy_cat_shop', 'dummy.category_shop', 'admin',
 '펫샵', 'Pet Shop', 'ペットショップ', '宠物店', '寵物店',
 'Tienda', 'Animalerie', 'Tierhandlung', 'Pet Shop',
 'Cửa hàng', 'ร้านสัตว์เลี้ยง', 'Pet Shop', 'متجر'),

('dummy_cat_cafe', 'dummy.category_cafe', 'admin',
 '펫카페', 'Pet Cafe', 'ペットカフェ', '宠物咖啡', '寵物咖啡',
 'Café de mascotas', 'Café pour animaux', 'Tiercafé', 'Pet Café',
 'Quán cà phê', 'คาเฟ่สัตว์เลี้ยง', 'Kafe Hewan', 'مقهى'),

('dummy_cat_photo', 'dummy.category_photo', 'admin',
 '사진관', 'Photo Studio', 'フォトスタジオ', '照相馆', '照相館',
 'Estudio fotográfico', 'Studio photo', 'Fotostudio', 'Estúdio fotográfico',
 'Studio ảnh', 'สตูดิโอถ่ายรูป', 'Studio Foto', 'استوديو تصوير'),

('dummy_total_count', 'dummy.total_count', 'admin',
 '전체', 'Total', '合計', '总计', '總計',
 'Total', 'Total', 'Gesamt', 'Total',
 'Tổng', 'ทั้งหมด', 'Total', 'الإجمالي'),

('dummy_active_count', 'dummy.active_count', 'admin',
 '활성', 'Active', 'アクティブ', '活跃', '啟用',
 'Activos', 'Actifs', 'Aktiv', 'Ativos',
 'Hoạt động', 'ใช้งาน', 'Aktif', 'نشط')

ON CONFLICT (key) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de, pt = EXCLUDED.pt,
  vi = EXCLUDED.vi, th = EXCLUDED.th, id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  updated_at = CURRENT_TIMESTAMP;
