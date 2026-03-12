-- =============================================================================
-- 006: Ranking dummy cards + test banner + AdSense i18n keys
-- Adds 20 ranking cards (4 types x 5) + 14 i18n keys
-- =============================================================================

BEGIN;

-- ─── 1. weekly_health_king — 5 cards ──────────────────────────────────────────
INSERT INTO feed_dummy_cards (id, tab_type, title, subtitle, badge_text, score, region, description, display_name, avatar_url, metadata, is_active, sort_order, created_at, updated_at) VALUES
(gen_random_uuid()::text, 'weekly_health_king', '뽀삐', '말티즈 · 3세', 'weekly_health', 95, NULL, '이번 주 건강 점수 1위! 매일 산책 + 정기 검진 꾸준히 중', '뽀삐맘', 'https://placehold.co/80/FFF8E1/f59e0b?text=1', '{"icon":"🏆","bg_color":"#FFF8E1","pet_name":"뽀삐","breed":"말티즈","rank":1}', true, 1, now(), now()),
(gen_random_uuid()::text, 'weekly_health_king', '코코', '푸들 · 5세', 'weekly_health', 92, NULL, '체중 관리 우수! 사료+운동 기록 꼼꼼', '코코아빠', 'https://placehold.co/80/FFF8E1/f59e0b?text=2', '{"icon":"🏆","bg_color":"#FFF8E1","pet_name":"코코","breed":"푸들","rank":2}', true, 2, now(), now()),
(gen_random_uuid()::text, 'weekly_health_king', '몽이', '시츄 · 2세', 'weekly_health', 88, NULL, '예방접종 완료! 건강 기록 매주 업데이트', '몽이엄마', 'https://placehold.co/80/FFF8E1/f59e0b?text=3', '{"icon":"🏆","bg_color":"#FFF8E1","pet_name":"몽이","breed":"시츄","rank":3}', true, 3, now(), now()),
(gen_random_uuid()::text, 'weekly_health_king', '초코', '포메라니안 · 4세', 'weekly_health', 85, NULL, '정기 건강검진 A+! 치석 관리 꾸준', '초코네', 'https://placehold.co/80/FFF8E1/f59e0b?text=4', '{"icon":"🏆","bg_color":"#FFF8E1","pet_name":"초코","breed":"포메라니안","rank":4}', true, 4, now(), now()),
(gen_random_uuid()::text, 'weekly_health_king', '하루', '비숑프리제 · 1세', 'weekly_health', 80, NULL, '성장기 건강 관리 우수! 체중 증가 정상 범위', '하루맘', 'https://placehold.co/80/FFF8E1/f59e0b?text=5', '{"icon":"🏆","bg_color":"#FFF8E1","pet_name":"하루","breed":"비숑프리제","rank":5}', true, 5, now(), now());

-- ─── 2. breed_health_king — 5 cards ──────────────────────────────────────────
INSERT INTO feed_dummy_cards (id, tab_type, title, subtitle, badge_text, score, region, description, display_name, avatar_url, metadata, is_active, sort_order, created_at, updated_at) VALUES
(gen_random_uuid()::text, 'breed_health_king', '두부', '푸들 · 3세', 'breed_health', 97, NULL, '푸들 중 건강 점수 최고! 피부 관리 A+', '두부엄마', 'https://placehold.co/80/F3E5F5/9b5de5?text=1', '{"icon":"🐕","bg_color":"#F3E5F5","pet_name":"두부","breed":"푸들","rank":1}', true, 1, now(), now()),
(gen_random_uuid()::text, 'breed_health_king', '달이', '골든리트리버 · 5세', 'breed_health', 93, NULL, '대형견 관절 관리 모범! 수영 운동 꾸준', '달이아빠', 'https://placehold.co/80/F3E5F5/9b5de5?text=2', '{"icon":"🐕","bg_color":"#F3E5F5","pet_name":"달이","breed":"골든리트리버","rank":2}', true, 2, now(), now()),
(gen_random_uuid()::text, 'breed_health_king', '보리', '시바이누 · 4세', 'breed_health', 90, NULL, '시바이누 건강왕! 알러지 관리 완벽', '보리네', 'https://placehold.co/80/F3E5F5/9b5de5?text=3', '{"icon":"🐕","bg_color":"#F3E5F5","pet_name":"보리","breed":"시바이누","rank":3}', true, 3, now(), now()),
(gen_random_uuid()::text, 'breed_health_king', '망고', '웰시코기 · 2세', 'breed_health', 87, NULL, '코기 체중 관리 우수! 허리 건강 A+', '망고네', 'https://placehold.co/80/F3E5F5/9b5de5?text=4', '{"icon":"🐕","bg_color":"#F3E5F5","pet_name":"망고","breed":"웰시코기","rank":4}', true, 4, now(), now()),
(gen_random_uuid()::text, 'breed_health_king', '콩이', '치와와 · 6세', 'breed_health', 83, NULL, '소형견 치아 관리 모범! 스케일링 정기적', '콩이맘', 'https://placehold.co/80/F3E5F5/9b5de5?text=5', '{"icon":"🐕","bg_color":"#F3E5F5","pet_name":"콩이","breed":"치와와","rank":5}', true, 5, now(), now());

-- ─── 3. new_registration — 5 cards ──────────────────────────────────────────
INSERT INTO feed_dummy_cards (id, tab_type, title, subtitle, badge_text, score, region, description, display_name, avatar_url, metadata, is_active, sort_order, created_at, updated_at) VALUES
(gen_random_uuid()::text, 'new_registration', '별이', '말티푸 · 6개월', 'new_member', 0, '서울 마포구', '안녕하세요! 별이와 함께 가입했어요 🐶', '별이맘', 'https://placehold.co/80/E8F5E9/4caf50?text=NEW', '{"icon":"👋","bg_color":"#E8F5E9","pet_name":"별이","breed":"말티푸","joined":"2026-03-10"}', true, 1, now(), now()),
(gen_random_uuid()::text, 'new_registration', '구름', '러시안블루 · 1세', 'new_member', 0, '서울 강남구', '고양이 구름이의 일상을 기록합니다 🐱', '구름아빠', 'https://placehold.co/80/E8F5E9/4caf50?text=NEW', '{"icon":"👋","bg_color":"#E8F5E9","pet_name":"구름","breed":"러시안블루","joined":"2026-03-09"}', true, 2, now(), now()),
(gen_random_uuid()::text, 'new_registration', '루디', '래브라도 · 2세', 'new_member', 0, '경기 성남시', '루디의 건강 포트폴리오 시작! 💪', '루디네', 'https://placehold.co/80/E8F5E9/4caf50?text=NEW', '{"icon":"👋","bg_color":"#E8F5E9","pet_name":"루디","breed":"래브라도","joined":"2026-03-08"}', true, 3, now(), now()),
(gen_random_uuid()::text, 'new_registration', '나비', '스코티시폴드 · 3세', 'new_member', 0, '부산 해운대구', '나비의 귀여운 모습 많이 올릴게요 😺', '나비엄마', 'https://placehold.co/80/E8F5E9/4caf50?text=NEW', '{"icon":"👋","bg_color":"#E8F5E9","pet_name":"나비","breed":"스코티시폴드","joined":"2026-03-07"}', true, 4, now(), now()),
(gen_random_uuid()::text, 'new_registration', '토리', '요크셔테리어 · 4세', 'new_member', 0, '대전 서구', '토리의 건강 기록 시작합니다 📝', '토리맘', 'https://placehold.co/80/E8F5E9/4caf50?text=NEW', '{"icon":"👋","bg_color":"#E8F5E9","pet_name":"토리","breed":"요크셔테리어","joined":"2026-03-06"}', true, 5, now(), now());

-- ─── 4. local_health_king — 5 cards ──────────────────────────────────────────
INSERT INTO feed_dummy_cards (id, tab_type, title, subtitle, badge_text, score, region, description, display_name, avatar_url, metadata, is_active, sort_order, created_at, updated_at) VALUES
(gen_random_uuid()::text, 'local_health_king', '찰리', '비글 · 3세', 'local_health', 96, '서울 강남구', '강남구 건강왕! 매일 한강 산책 3km', '찰리네', 'https://placehold.co/80/E3F2FD/2196f3?text=1', '{"icon":"📍","bg_color":"#E3F2FD","pet_name":"찰리","breed":"비글","region":"서울 강남구","rank":1}', true, 1, now(), now()),
(gen_random_uuid()::text, 'local_health_king', '밀키', '사모예드 · 2세', 'local_health', 91, '서울 마포구', '마포구 1위! 털 관리+운동 모범', '밀키아빠', 'https://placehold.co/80/E3F2FD/2196f3?text=2', '{"icon":"📍","bg_color":"#E3F2FD","pet_name":"밀키","breed":"사모예드","region":"서울 마포구","rank":2}', true, 2, now(), now()),
(gen_random_uuid()::text, 'local_health_king', '모카', '닥스훈트 · 5세', 'local_health', 88, '경기 성남시', '분당 건강왕! 허리 건강 관리 꾸준', '모카엄마', 'https://placehold.co/80/E3F2FD/2196f3?text=3', '{"icon":"📍","bg_color":"#E3F2FD","pet_name":"모카","breed":"닥스훈트","region":"경기 성남시","rank":3}', true, 3, now(), now()),
(gen_random_uuid()::text, 'local_health_king', '라떼', '스피츠 · 1세', 'local_health', 84, '부산 해운대구', '해운대구 최고! 성장기 관리 완벽', '라떼네', 'https://placehold.co/80/E3F2FD/2196f3?text=4', '{"icon":"📍","bg_color":"#E3F2FD","pet_name":"라떼","breed":"스피츠","region":"부산 해운대구","rank":4}', true, 4, now(), now()),
(gen_random_uuid()::text, 'local_health_king', '쿠키', '슈나우저 · 7세', 'local_health', 81, '인천 연수구', '연수구 건강왕! 노령견 건강 관리 A+', '쿠키맘', 'https://placehold.co/80/E3F2FD/2196f3?text=5', '{"icon":"📍","bg_color":"#E3F2FD","pet_name":"쿠키","breed":"슈나우저","region":"인천 연수구","rank":5}', true, 5, now(), now());

-- ─── 5. i18n keys (4 ranking titles + 1 test banner + 9 AdSense) ─────────────
INSERT INTO i18n_translations (id, key, page, is_active, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, created_at, updated_at) VALUES
-- Ranking titles
(gen_random_uuid()::text, 'dummy.weekly_health_title', 'feed', true,
 '이번 주 건강왕', 'Weekly Health King', '今週の健康王', '本周健康王', '本週健康王', 'Rey de salud semanal', 'Roi santé de la semaine', 'Gesundheitskönig der Woche', 'Rei da saúde semanal', 'Vua sức khỏe tuần', 'ราชาสุขภาพประจำสัปดาห์', 'Raja Kesehatan Mingguan', 'ملك الصحة الأسبوعي',
 now(), now()),
(gen_random_uuid()::text, 'dummy.breed_health_title', 'feed', true,
 '견종별 건강왕', 'Breed Health King', '犬種別健康王', '犬种健康王', '犬種健康王', 'Rey de salud por raza', 'Roi santé par race', 'Gesundheitskönig nach Rasse', 'Rei da saúde por raça', 'Vua sức khỏe theo giống', 'ราชาสุขภาพตามสายพันธุ์', 'Raja Kesehatan per Ras', 'ملك الصحة حسب السلالة',
 now(), now()),
(gen_random_uuid()::text, 'dummy.new_member_title', 'feed', true,
 '새로 가입한 친구들', 'Newly Joined Friends', '新しく参加した友達', '新加入的朋友', '新加入的朋友', 'Nuevos amigos', 'Nouveaux amis', 'Neue Freunde', 'Novos amigos', 'Bạn mới tham gia', 'เพื่อนที่เข้าร่วมใหม่', 'Teman Baru Bergabung', 'أصدقاء جدد',
 now(), now()),
(gen_random_uuid()::text, 'dummy.local_health_title', 'feed', true,
 '우리 지역 건강왕', 'Local Health King', '地域の健康王', '本地健康王', '本地健康王', 'Rey de salud local', 'Roi santé local', 'Lokaler Gesundheitskönig', 'Rei da saúde local', 'Vua sức khỏe địa phương', 'ราชาสุขภาพท้องถิ่น', 'Raja Kesehatan Lokal', 'ملك الصحة المحلي',
 now(), now()),
-- Test banner
(gen_random_uuid()::text, 'dummy.test_banner_title', 'admin', true,
 '이 데이터는 테스트용 더미 데이터입니다. 실제 서비스에서는 실시간 데이터로 대체됩니다.',
 'This is test dummy data. It will be replaced with live data in production.',
 'これはテスト用ダミーデータです。本番では実データに置き換わります。',
 '这是测试用的虚拟数据。正式上线后将替换为实时数据。',
 '這是測試用的虛擬資料。正式上線後將替換為即時資料。',
 'Estos son datos de prueba. Se reemplazarán con datos reales en producción.',
 'Ce sont des données de test. Elles seront remplacées par des données réelles en production.',
 'Dies sind Testdaten. Sie werden in der Produktion durch Echtzeitdaten ersetzt.',
 'Estes são dados de teste. Serão substituídos por dados reais em produção.',
 'Đây là dữ liệu thử nghiệm. Sẽ được thay thế bằng dữ liệu thực tế khi ra mắt.',
 'นี่คือข้อมูลทดสอบ จะถูกแทนที่ด้วยข้อมูลจริงเมื่อเปิดใช้งาน',
 'Ini adalah data uji coba. Akan diganti dengan data langsung di produksi.',
 'هذه بيانات اختبارية. سيتم استبدالها ببيانات حقيقية في الإنتاج.',
 now(), now()),
-- AdSense i18n keys
(gen_random_uuid()::text, 'feed.ad_source', 'admin', true,
 '광고 소스', 'Ad Source', '広告ソース', '广告来源', '廣告來源', 'Fuente de anuncios', 'Source publicitaire', 'Anzeigenquelle', 'Fonte do anúncio', 'Nguồn quảng cáo', 'แหล่งโฆษณา', 'Sumber Iklan', 'مصدر الإعلان',
 now(), now()),
(gen_random_uuid()::text, 'feed.ad_dummy', 'admin', true,
 '더미 광고 (테스트용)', 'Dummy Ads (Test)', 'ダミー広告（テスト）', '虚拟广告（测试）', '虛擬廣告（測試）', 'Anuncios ficticios (prueba)', 'Annonces fictives (test)', 'Dummy-Anzeigen (Test)', 'Anúncios fictícios (teste)', 'Quảng cáo giả (thử nghiệm)', 'โฆษณาจำลอง (ทดสอบ)', 'Iklan Dummy (Uji Coba)', 'إعلانات وهمية (اختبار)',
 now(), now()),
(gen_random_uuid()::text, 'feed.ad_adsense', 'admin', true,
 'Google AdSense 연동', 'Google AdSense Integration', 'Google AdSense連携', 'Google AdSense集成', 'Google AdSense整合', 'Integración Google AdSense', 'Intégration Google AdSense', 'Google AdSense Integration', 'Integração Google AdSense', 'Tích hợp Google AdSense', 'เชื่อมต่อ Google AdSense', 'Integrasi Google AdSense', 'تكامل Google AdSense',
 now(), now()),
(gen_random_uuid()::text, 'feed.ad_publisher_id', 'admin', true,
 'Publisher ID', 'Publisher ID', 'パブリッシャーID', '发布者ID', '發布者ID', 'ID de editor', 'ID éditeur', 'Publisher-ID', 'ID do editor', 'ID nhà xuất bản', 'รหัสผู้เผยแพร่', 'ID Penerbit', 'معرّف الناشر',
 now(), now()),
(gen_random_uuid()::text, 'feed.ad_slot_id', 'admin', true,
 'Ad Slot ID', 'Ad Slot ID', '広告スロットID', '广告位ID', '廣告位ID', 'ID de espacio', 'ID emplacement', 'Anzeigenplatz-ID', 'ID do slot', 'ID vị trí QC', 'รหัสช่องโฆษณา', 'ID Slot Iklan', 'معرّف موضع الإعلان',
 now(), now()),
(gen_random_uuid()::text, 'feed.ad_format', 'admin', true,
 'Ad Format', 'Ad Format', '広告フォーマット', '广告格式', '廣告格式', 'Formato de anuncio', 'Format publicitaire', 'Anzeigenformat', 'Formato do anúncio', 'Định dạng QC', 'รูปแบบโฆษณา', 'Format Iklan', 'شكل الإعلان',
 now(), now()),
(gen_random_uuid()::text, 'feed.ad_test_btn', 'admin', true,
 '연동 테스트', 'Test Connection', '接続テスト', '连接测试', '連接測試', 'Probar conexión', 'Tester la connexion', 'Verbindung testen', 'Testar conexão', 'Kiểm tra kết nối', 'ทดสอบการเชื่อมต่อ', 'Tes Koneksi', 'اختبار الاتصال',
 now(), now()),
(gen_random_uuid()::text, 'feed.ad_test_ok', 'admin', true,
 '연동 확인됨', 'Connection verified', '接続確認済み', '连接已验证', '連接已驗證', 'Conexión verificada', 'Connexion vérifiée', 'Verbindung bestätigt', 'Conexão verificada', 'Đã xác minh kết nối', 'ยืนยันการเชื่อมต่อแล้ว', 'Koneksi terverifikasi', 'تم التحقق من الاتصال',
 now(), now()),
(gen_random_uuid()::text, 'feed.ad_test_fail', 'admin', true,
 'ID를 확인해주세요', 'Please check the IDs', 'IDを確認してください', '请检查ID', '請檢查ID', 'Verifique los IDs', 'Vérifiez les IDs', 'Bitte IDs prüfen', 'Verifique os IDs', 'Vui lòng kiểm tra ID', 'กรุณาตรวจสอบ ID', 'Silakan periksa ID', 'يرجى التحقق من المعرّفات',
 now(), now())
ON CONFLICT (key) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw, es = EXCLUDED.es,
  fr = EXCLUDED.fr, de = EXCLUDED.de, pt = EXCLUDED.pt,
  vi = EXCLUDED.vi, th = EXCLUDED.th, id_lang = EXCLUDED.id_lang,
  ar = EXCLUDED.ar;

COMMIT;
