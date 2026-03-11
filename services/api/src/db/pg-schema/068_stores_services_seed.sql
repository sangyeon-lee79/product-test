-- 068_stores_services_seed.sql — S9: 테스트 매장/서비스/할인 시드 데이터
-- Prerequisites: 066_stores_services.sql tables, users with provider role

-- Only insert if no stores exist yet (idempotent)
DO $$
DECLARE
  v_provider_id TEXT;
  v_store_id TEXT;
  v_service_id TEXT;
  v_country_id TEXT;
  v_currency_id TEXT;
  v_industry_id TEXT;
BEGIN
  -- Skip if stores already exist
  IF EXISTS (SELECT 1 FROM stores LIMIT 1) THEN
    RAISE NOTICE 'Stores already seeded, skipping';
    RETURN;
  END IF;

  -- Find a provider user (or skip)
  SELECT id INTO v_provider_id FROM users WHERE role = 'provider' AND status = 'active' LIMIT 1;
  IF v_provider_id IS NULL THEN
    RAISE NOTICE 'No active provider found, skipping seed';
    RETURN;
  END IF;

  -- Find Korea + KRW
  SELECT id INTO v_country_id FROM countries WHERE code = 'KR' LIMIT 1;
  SELECT id INTO v_currency_id FROM currencies WHERE code = 'KRW' LIMIT 1;

  -- Find grooming industry (business_category L1)
  SELECT mi.id INTO v_industry_id
  FROM master_items mi
  JOIN master_categories mc ON mc.id = mi.category_id
  WHERE mc.code = 'business_category' AND mi.code = 'grooming'
  LIMIT 1;

  -- 1. Create store: 해피 펫 미용실
  v_store_id := gen_random_uuid()::TEXT;
  INSERT INTO stores (id, owner_id, name, name_translations, description, description_translations,
    address, phone, country_id, currency_id, latitude, longitude, status, created_at, updated_at)
  VALUES (
    v_store_id, v_provider_id,
    '해피 펫 미용실',
    '{"ko":"해피 펫 미용실","en":"Happy Pet Grooming","ja":"ハッピーペットグルーミング","zh_cn":"快乐宠物美容","zh_tw":"快樂寵物美容","es":"Happy Pet Grooming","fr":"Happy Pet Toilettage","de":"Happy Pet Pflege","pt":"Happy Pet Grooming","vi":"Happy Pet Grooming","th":"Happy Pet Grooming","id_lang":"Happy Pet Grooming","ar":"هابي بت جرومينج"}'::JSONB,
    '전문 반려동물 미용 서비스',
    '{"ko":"전문 반려동물 미용 서비스","en":"Professional pet grooming services","ja":"プロのペットグルーミングサービス","zh_cn":"专业宠物美容服务","zh_tw":"專業寵物美容服務","es":"Servicios profesionales de aseo de mascotas","fr":"Services professionnels de toilettage pour animaux","de":"Professionelle Tierpflegedienste","pt":"Serviços profissionais de higiene pet","vi":"Dịch vụ chăm sóc thú cưng chuyên nghiệp","th":"บริการตัดแต่งขนสัตว์เลี้ยงมืออาชีพ","id_lang":"Layanan grooming hewan peliharaan profesional","ar":"خدمات العناية بالحيوانات الأليفة الاحترافية"}'::JSONB,
    '서울시 강남구 역삼동 123-45', '02-1234-5678',
    v_country_id, v_currency_id,
    37.4979, 127.0276,
    'active', NOW(), NOW()
  );

  -- 2. Link industry
  IF v_industry_id IS NOT NULL THEN
    INSERT INTO store_industries (id, store_id, industry_id, created_at)
    VALUES (gen_random_uuid()::TEXT, v_store_id, v_industry_id, NOW())
    ON CONFLICT DO NOTHING;
  END IF;

  -- 3. Create service: 전체 미용
  v_service_id := gen_random_uuid()::TEXT;
  INSERT INTO services (id, store_id, name, name_translations, description, description_translations,
    price, currency_id, sort_order, is_active, created_at, updated_at)
  VALUES (
    v_service_id, v_store_id,
    '전체 미용',
    '{"ko":"전체 미용","en":"Full Grooming","ja":"フルグルーミング","zh_cn":"全套美容","zh_tw":"全套美容","es":"Aseo completo","fr":"Toilettage complet","de":"Vollpflege","pt":"Higiene completa","vi":"Chăm sóc toàn diện","th":"ตัดแต่งขนเต็มรูปแบบ","id_lang":"Grooming lengkap","ar":"العناية الكاملة"}'::JSONB,
    '목욕, 드라이, 클리핑, 귀청소, 발톱 정리 포함',
    '{"ko":"목욕, 드라이, 클리핑, 귀청소, 발톱 정리 포함","en":"Includes bath, dry, clipping, ear cleaning, nail trimming","ja":"入浴、ドライ、クリッピング、耳掃除、爪切り含む","zh_cn":"包含洗澡、吹干、修剪、耳朵清洁、指甲修剪","zh_tw":"包含洗澡、吹乾、修剪、耳朵清潔、指甲修剪","es":"Incluye baño, secado, corte, limpieza de oídos, corte de uñas","fr":"Comprend bain, séchage, tonte, nettoyage oreilles, coupe ongles","de":"Inklusive Bad, Trocknen, Scheren, Ohrenreinigung, Krallenpflege","pt":"Inclui banho, secagem, tosa, limpeza de ouvidos, corte de unhas","vi":"Bao gồm tắm, sấy, cắt tỉa, vệ sinh tai, cắt móng","th":"รวมอาบน้ำ เป่าแห้ง ตัดขน ทำความสะอาดหู ตัดเล็บ","id_lang":"Termasuk mandi, keringkan, potong bulu, bersihkan telinga, potong kuku","ar":"يشمل الاستحمام والتجفيف والقص وتنظيف الأذن وتقليم الأظافر"}'::JSONB,
    50000, v_currency_id,
    1, true, NOW(), NOW()
  );

  -- 4. Create discount: 10% off
  INSERT INTO service_discounts (id, service_id, discount_rate, start_date, end_date, is_active, created_at)
  VALUES (
    gen_random_uuid()::TEXT, v_service_id,
    10.00, '2026-03-01', '2026-12-31',
    true, NOW()
  );

  RAISE NOTICE 'Seed complete: store=%, service=%, discount created', v_store_id, v_service_id;
END $$;
