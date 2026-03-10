-- ============================================================================
-- 048_feed_catalog_global_brands_seed.sql
-- 글로벌 반려동물 사료 브랜드 Seed 데이터 확장
-- 8개 제조사, 23개 브랜드, 60개 모델, 60개 영양성분 + 매핑 + i18n
-- 모든 ID는 md5() 기반 deterministic — 재실행 안전 (ON CONFLICT DO NOTHING)
-- ============================================================================

-- ===== 1. MANUFACTURERS (8개 추가) =====
INSERT INTO feed_manufacturers (id, key, name_key, name_ko, name_en, country, status, sort_order, created_at, updated_at)
VALUES
  ('476b962c359dda630049651411ec9e4d', 'purina',            'feed.manufacturer.purina',            '퓨리나',                 'Purina',                'US', 'active', 6,  '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('06673cf5dae74f914f48fdd8b50bdd89', 'farmina',           'feed.manufacturer.farmina',           '파미나',                 'Farmina',               'IT', 'active', 7,  '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('39cbbd36828b7da0ccd468ab464c4f30', 'ziwi_peak',         'feed.manufacturer.ziwi_peak',         '지위피크',               'Ziwi Peak',             'NZ', 'active', 8,  '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('e5b41993f1398b638b1a4556f9174a5a', 'instinct',          'feed.manufacturer.instinct',          '인스팅트',               'Instinct',              'US', 'active', 9,  '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('6ccb2c570fcaece15ae8443e19329bc0', 'stella_chewys',     'feed.manufacturer.stella_chewys',     '스텔라앤츄이스',         'Stella & Chewy''s',     'US', 'active', 10, '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('eb10275f315c4dfb3354ba61f600d467', 'open_farm',         'feed.manufacturer.open_farm',         '오픈팜',                 'Open Farm',             'CA', 'active', 11, '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('15676dee8b459d96462223c7d9d83f85', 'wellness',          'feed.manufacturer.wellness',          '웰니스',                 'Wellness',              'US', 'active', 12, '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('649b829a0c2a938a7eebf2dc1cee5b7d', 'taste_of_the_wild', 'feed.manufacturer.taste_of_the_wild', '테이스트오브더와일드',   'Taste of the Wild',     'US', 'active', 13, '2026-03-10 12:00:00', '2026-03-10 12:00:00')
ON CONFLICT (id) DO NOTHING;

-- ===== 2. BRANDS (23개 추가) =====
INSERT INTO feed_brands (id, manufacturer_id, name_key, name_ko, name_en, status, created_at, updated_at)
VALUES
  -- Purina (4 brands)
  ('dd954b2665fa3138b3117e6471a0e2bb', '476b962c359dda630049651411ec9e4d', 'feed.brand.purina_pro_plan',              '프로플랜',               'Pro Plan',              'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('75544ca70091537f8b1524d4e2259b7d', '476b962c359dda630049651411ec9e4d', 'feed.brand.purina_one',                   '퓨리나 원',              'Purina ONE',            'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('83eccf3ff482c8b5d549d66a735e1d0a', '476b962c359dda630049651411ec9e4d', 'feed.brand.purina_fancy_feast',           '팬시피스트',             'Fancy Feast',           'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('18362c3e02fb2ab642764e2e1b3b956f', '476b962c359dda630049651411ec9e4d', 'feed.brand.purina_beyond',                '퓨리나 비욘드',          'Beyond',                'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- Farmina (3 brands)
  ('dff31f99993693fcbf58824bcf7982f5', '06673cf5dae74f914f48fdd8b50bdd89', 'feed.brand.farmina_nd',                   'N&D',                    'N&D Natural & Delicious', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('33d190deb6f33bc6c84d51bcc525abfb', '06673cf5dae74f914f48fdd8b50bdd89', 'feed.brand.farmina_vet_life',             '벳라이프',               'Vet Life',              'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('d7a23f1132dccbd42ec3dc660632f506', '06673cf5dae74f914f48fdd8b50bdd89', 'feed.brand.farmina_team_breeder',         '팀브리더',               'Team Breeder',          'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- Ziwi Peak (2 brands)
  ('1b7710a4cba75aa58b3fbbdecdd78dda', '39cbbd36828b7da0ccd468ab464c4f30', 'feed.brand.ziwi_air_dried',               '에어드라이드',           'Air-Dried',             'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('3c08d5ba434035f914ed97424c52c2f0', '39cbbd36828b7da0ccd468ab464c4f30', 'feed.brand.ziwi_canned',                  '캔드',                   'Canned',                'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- Instinct (3 brands)
  ('f41075d09e643d874e280e59fe3eca37', 'e5b41993f1398b638b1a4556f9174a5a', 'feed.brand.instinct_original',            '오리지널',               'Original',              'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('85fa2e2552f11a9e790592185a3e642c', 'e5b41993f1398b638b1a4556f9174a5a', 'feed.brand.instinct_raw_boost',           '로부스트',               'Raw Boost',             'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('1645582d1852e222bbd564f8c4193479', 'e5b41993f1398b638b1a4556f9174a5a', 'feed.brand.instinct_limited_ingredient',  '리미티드 인그리디언트',  'Limited Ingredient',    'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- Stella & Chewy's (3 brands)
  ('01cb8956706445dc4cad5c6a27210680', '6ccb2c570fcaece15ae8443e19329bc0', 'feed.brand.stella_fd_raw',                '프리즈드라이 로우',      'Freeze-Dried Raw',      'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('bc13d239fbd9e8fb182349017b79eb5f', '6ccb2c570fcaece15ae8443e19329bc0', 'feed.brand.stella_stews',                 '스튜',                   'Stews',                 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('75d2514ec31f9b65c21c07e1cf6bfbf4', '6ccb2c570fcaece15ae8443e19329bc0', 'feed.brand.stella_meal_mixers',           '밀믹서',                 'Meal Mixers',           'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- Open Farm (3 brands)
  ('997d1465b131c0947190a53651646ad7', 'eb10275f315c4dfb3354ba61f600d467', 'feed.brand.open_farm_dry',                '드라이 푸드',            'Dry Food',              'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('4d064e9c28ed2106c1d22a8a4615d616', 'eb10275f315c4dfb3354ba61f600d467', 'feed.brand.open_farm_wet',                '웻 푸드',                'Wet Food',              'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('e4138f0562c824d9061f72af41d3eed7', 'eb10275f315c4dfb3354ba61f600d467', 'feed.brand.open_farm_fd_raw',             '프리즈드라이 로우',      'Freeze-Dried Raw',      'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- Wellness (3 brands)
  ('a0f1437cb5abab6ee1af7ec19d10d503', '15676dee8b459d96462223c7d9d83f85', 'feed.brand.wellness_complete_health',     '컴플리트 헬스',          'Complete Health',       'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('f92eda25811ccc90f73d395e6bcfb3d6', '15676dee8b459d96462223c7d9d83f85', 'feed.brand.wellness_core',                '코어',                   'CORE',                  'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('8ba98bde827f31bfe92251a89b15a2bc', '15676dee8b459d96462223c7d9d83f85', 'feed.brand.wellness_simple',              '심플',                   'Simple',                'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- Taste of the Wild (2 brands)
  ('f7be0ddbf6b588a98f8c0cf9ada080c8', '649b829a0c2a938a7eebf2dc1cee5b7d', 'feed.brand.totw_dry',                     '드라이',                 'Dry',                   'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('d7f4bc8d3ccf103cd2a42eed54585740', '649b829a0c2a938a7eebf2dc1cee5b7d', 'feed.brand.totw_wet',                     '웻',                     'Wet',                   'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00')
ON CONFLICT (id) DO NOTHING;

-- ===== 3. MODELS (60개 추가) =====
INSERT INTO feed_models (id, feed_type_item_id, manufacturer_id, brand_id, name_key, model_name, model_code, description, status, created_at, updated_at)
VALUES
  -- ── Purina · Pro Plan (4) ──
  ('17ea8ef3e7f5f076fdd54dfed49df10b', 'mi-diet-feed-dry-food-core',            '476b962c359dda630049651411ec9e4d', 'dd954b2665fa3138b3117e6471a0e2bb', 'feed.model.pp_adult_chicken_rice_dry_dog',            '퓨리나 프로플랜 어덜트 치킨&라이스 드라이 47lb',                '', '{"package_weight_value":47,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}',            'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('3755cbaf184e271c80caedbcf5d39b49', 'mi-diet-feed-dry-food-core',            '476b962c359dda630049651411ec9e4d', 'dd954b2665fa3138b3117e6471a0e2bb', 'feed.model.pp_puppy_chicken_rice_dry_dog',            '퓨리나 프로플랜 퍼피 치킨&라이스 드라이 34lb',                  '', '{"package_weight_value":34,"package_weight_unit":"lb","life_stage_key":"puppy","species_key":"dog"}',            'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('91e9c2941b8cc6dace8143cab8b23662', 'mi-diet-feed-dry-food-core',            '476b962c359dda630049651411ec9e4d', 'dd954b2665fa3138b3117e6471a0e2bb', 'feed.model.pp_senior_chicken_rice_dry_dog',           '퓨리나 프로플랜 시니어 7+ 치킨&라이스 드라이 34lb',             '', '{"package_weight_value":34,"package_weight_unit":"lb","life_stage_key":"senior","species_key":"dog"}',           'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('10aff4e46f39c6a6e339f3a39929af7b', 'mi-diet-feed-high-protein-dry-core',    '476b962c359dda630049651411ec9e4d', 'dd954b2665fa3138b3117e6471a0e2bb', 'feed.model.pp_sport_all_stages_dry_dog',              '퓨리나 프로플랜 스포츠 올라이프 퍼포먼스 드라이 50lb',          '', '{"package_weight_value":50,"package_weight_unit":"lb","life_stage_key":"all_life_stages","species_key":"dog"}',  'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- ── Purina · ONE (2) ──
  ('7430219be817b4cc0508c25b819f6fad', 'mi-diet-feed-dry-food-core',            '476b962c359dda630049651411ec9e4d', '75544ca70091537f8b1524d4e2259b7d', 'feed.model.one_smartblend_chicken_rice_dry_dog',      '퓨리나 원 스마트블렌드 치킨&라이스 드라이 40lb',                '', '{"package_weight_value":40,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}',            'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('6712854ae6d740287020ddc6decc1026', 'mi-diet-feed-grain-free-dry-food-core',  '476b962c359dda630049651411ec9e4d', '75544ca70091537f8b1524d4e2259b7d', 'feed.model.one_gf_ocean_whitefish_dry_cat',           '퓨리나 원 그레인프리 오션화이트피쉬 드라이 캣 14.4lb',          '', '{"package_weight_value":14.4,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"cat"}',          'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- ── Purina · Fancy Feast (2) ──
  ('8234b3c212815ea5dd4b79eaf1e4ae07', 'mi-diet-feed-pate-food-core',           '476b962c359dda630049651411ec9e4d', '83eccf3ff482c8b5d549d66a735e1d0a', 'feed.model.ff_classic_pate_whitefish_cat',            '팬시피스트 클래식 파테 오션화이트피쉬 캣 3oz',                  '', '{"package_weight_value":3,"package_weight_unit":"oz","life_stage_key":"adult","species_key":"cat"}',             'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('9fad8776c5ce7c4de47abb046aa5bab2', 'mi-diet-feed-wet-food-core',            '476b962c359dda630049651411ec9e4d', '83eccf3ff482c8b5d549d66a735e1d0a', 'feed.model.ff_medleys_chicken_primavera_cat',         '팬시피스트 메들리 치킨 프리마베라 캣 3oz',                      '', '{"package_weight_value":3,"package_weight_unit":"oz","life_stage_key":"adult","species_key":"cat"}',             'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- ── Purina · Beyond (2) ──
  ('c4d4c39e2aa49f44c8b8ee00de4a089c', 'mi-diet-feed-dry-food-core',            '476b962c359dda630049651411ec9e4d', '18362c3e02fb2ab642764e2e1b3b956f', 'feed.model.beyond_chicken_brown_rice_dry_dog',        '퓨리나 비욘드 내추럴 치킨&브라운라이스 드라이 14.5lb',          '', '{"package_weight_value":14.5,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}',          'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('296a517c041a3844a0ac48c97fe29d4b', 'mi-diet-feed-dry-food-core',            '476b962c359dda630049651411ec9e4d', '18362c3e02fb2ab642764e2e1b3b956f', 'feed.model.beyond_indoor_salmon_egg_dry_cat',         '퓨리나 비욘드 인도어 살몬&에그 드라이 캣 5lb',                  '', '{"package_weight_value":5,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"cat"}',             'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),

  -- ── Farmina · N&D (4) ──
  ('a222a3e206be321a755f7a09d722b90e', 'mi-diet-feed-grain-free-dry-food-core',  '06673cf5dae74f914f48fdd8b50bdd89', 'dff31f99993693fcbf58824bcf7982f5', 'feed.model.nd_pumpkin_chicken_pomegranate_mini_dry',  'N&D 펌킨 치킨&석류 어덜트 미니 드라이 5.5lb',                  '', '{"package_weight_value":5.5,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}',           'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('49b192ab24358b3adf3f62561b1d063e', 'mi-diet-feed-grain-free-dry-food-core',  '06673cf5dae74f914f48fdd8b50bdd89', 'dff31f99993693fcbf58824bcf7982f5', 'feed.model.nd_quinoa_skin_coat_venison_dry',          'N&D 퀴노아 스킨&코트 베니슨 드라이 5.5lb',                     '', '{"package_weight_value":5.5,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}',           'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('ae7796ba4e6c36ec1d6c059f1b1f0c1e', 'mi-diet-feed-grain-free-dry-food-core',  '06673cf5dae74f914f48fdd8b50bdd89', 'dff31f99993693fcbf58824bcf7982f5', 'feed.model.nd_prime_chicken_pomegranate_cat_dry',     'N&D 프라임 치킨&석류 캣 드라이 3.3lb',                          '', '{"package_weight_value":3.3,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"cat"}',           'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('407b22f1bf5f4e18a7d4d7cb65588731', 'mi-diet-feed-grain-free-dry-food-core',  '06673cf5dae74f914f48fdd8b50bdd89', 'dff31f99993693fcbf58824bcf7982f5', 'feed.model.nd_pumpkin_lamb_blueberry_medmaxi_dry',   'N&D 펌킨 램&블루베리 미디엄맥시 드라이 5.5lb',                  '', '{"package_weight_value":5.5,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}',           'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- ── Farmina · Vet Life (2) ──
  ('483f37ea5b818c866114da813c5497b0', 'mi-diet-feed-prescription-diet-core',    '06673cf5dae74f914f48fdd8b50bdd89', '33d190deb6f33bc6c84d51bcc525abfb', 'feed.model.vl_gastrointestinal_dry_dog',              '파미나 벳라이프 가스트로인테스티널 드라이 독 8.8lb',            '', '{"package_weight_value":8.8,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}',           'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('2b86dec7031ec44e70c9039909740576', 'mi-diet-feed-prescription-diet-core',    '06673cf5dae74f914f48fdd8b50bdd89', '33d190deb6f33bc6c84d51bcc525abfb', 'feed.model.vl_renal_dry_cat',                         '파미나 벳라이프 리날 드라이 캣 4.4lb',                          '', '{"package_weight_value":4.4,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"cat"}',           'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- ── Farmina · Team Breeder (1) ──
  ('3e102724fa0b4a08384a662899c92bef', 'mi-diet-feed-grain-free-dry-food-core',  '06673cf5dae74f914f48fdd8b50bdd89', 'd7a23f1132dccbd42ec3dc660632f506', 'feed.model.tb_gf_chicken_puppy_dry',                  '파미나 팀브리더 그레인프리 치킨 퍼피 드라이 44lb',              '', '{"package_weight_value":44,"package_weight_unit":"lb","life_stage_key":"puppy","species_key":"dog"}',            'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),

  -- ── Ziwi Peak · Air-Dried (4) ──
  ('9672e57c6f881678119fff4d3527b8bf', 'mi-diet-feed-dry-food-core',            '39cbbd36828b7da0ccd468ab464c4f30', '1b7710a4cba75aa58b3fbbdecdd78dda', 'feed.model.ziwi_ad_venison_dog',                      '지위피크 에어드라이드 베니슨 독 2.2lb',                          '', '{"package_weight_value":2.2,"package_weight_unit":"lb","life_stage_key":"all_life_stages","species_key":"dog"}', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('5b71b6f3b7d0919b8e6f9e60cf01e78b', 'mi-diet-feed-dry-food-core',            '39cbbd36828b7da0ccd468ab464c4f30', '1b7710a4cba75aa58b3fbbdecdd78dda', 'feed.model.ziwi_ad_beef_dog',                         '지위피크 에어드라이드 비프 독 2.2lb',                            '', '{"package_weight_value":2.2,"package_weight_unit":"lb","life_stage_key":"all_life_stages","species_key":"dog"}', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('e748349522542456e93ff18d6288a334', 'mi-diet-feed-dry-food-core',            '39cbbd36828b7da0ccd468ab464c4f30', '1b7710a4cba75aa58b3fbbdecdd78dda', 'feed.model.ziwi_ad_lamb_cat',                         '지위피크 에어드라이드 램 캣 14oz',                               '', '{"package_weight_value":14,"package_weight_unit":"oz","life_stage_key":"all_life_stages","species_key":"cat"}',  'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('b6b6c790635e5161294c648a777aeee6', 'mi-diet-feed-dry-food-core',            '39cbbd36828b7da0ccd468ab464c4f30', '1b7710a4cba75aa58b3fbbdecdd78dda', 'feed.model.ziwi_ad_mackerel_lamb_dog',                '지위피크 에어드라이드 고등어&램 독 2.2lb',                       '', '{"package_weight_value":2.2,"package_weight_unit":"lb","life_stage_key":"all_life_stages","species_key":"dog"}', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- ── Ziwi Peak · Canned (2) ──
  ('993e41c020bfd1a8c397da49b71275c3', 'mi-diet-feed-wet-food-core',            '39cbbd36828b7da0ccd468ab464c4f30', '3c08d5ba434035f914ed97424c52c2f0', 'feed.model.ziwi_can_venison_dog',                     '지위피크 캔드 베니슨 독 13.75oz',                               '', '{"package_weight_value":13.75,"package_weight_unit":"oz","life_stage_key":"all_life_stages","species_key":"dog"}','active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('8f142f025ee8d9b57bf647e3dd09cc5a', 'mi-diet-feed-wet-food-core',            '39cbbd36828b7da0ccd468ab464c4f30', '3c08d5ba434035f914ed97424c52c2f0', 'feed.model.ziwi_can_beef_cat',                        '지위피크 캔드 비프 캣 6.5oz',                                   '', '{"package_weight_value":6.5,"package_weight_unit":"oz","life_stage_key":"all_life_stages","species_key":"cat"}', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),

  -- ── Instinct · Original (2) ──
  ('ce588ad3a5418b2642161d144d0a4cc7', 'mi-diet-feed-grain-free-dry-food-core',  'e5b41993f1398b638b1a4556f9174a5a', 'f41075d09e643d874e280e59fe3eca37', 'feed.model.inst_orig_gf_chicken_dry_dog',             '인스팅트 오리지널 그레인프리 치킨 드라이 독 22.5lb',             '', '{"package_weight_value":22.5,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}',          'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('269c2f2dc1577b0fc25148d10e93db88', 'mi-diet-feed-grain-free-dry-food-core',  'e5b41993f1398b638b1a4556f9174a5a', 'f41075d09e643d874e280e59fe3eca37', 'feed.model.inst_orig_gf_chicken_dry_cat',             '인스팅트 오리지널 그레인프리 치킨 드라이 캣 11lb',               '', '{"package_weight_value":11,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"cat"}',            'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- ── Instinct · Raw Boost (2) ──
  ('c0784008debc7961c18b9a61998190ba', 'mi-diet-feed-freeze-dried-complete-core','e5b41993f1398b638b1a4556f9174a5a', '85fa2e2552f11a9e790592185a3e642c', 'feed.model.inst_rb_mixers_chicken_fd_dog',            '인스팅트 로부스트 믹서 치킨 프리즈드라이 독 14oz',               '', '{"package_weight_value":14,"package_weight_unit":"oz","life_stage_key":"all_life_stages","species_key":"dog"}',  'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('7f78ce93709749277b979e2fc172c044', 'mi-diet-feed-dry-food-core',            'e5b41993f1398b638b1a4556f9174a5a', '85fa2e2552f11a9e790592185a3e642c', 'feed.model.inst_rb_whole_grain_chicken_dry_dog',      '인스팅트 로부스트 홀그레인 치킨 드라이 독 20lb',                 '', '{"package_weight_value":20,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}',            'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- ── Instinct · Limited Ingredient (3) ──
  ('e956f106a32360ed3d2162d61d9fcb43', 'mi-diet-feed-dry-food-core',            'e5b41993f1398b638b1a4556f9174a5a', '1645582d1852e222bbd564f8c4193479', 'feed.model.inst_li_turkey_dry_dog',                   '인스팅트 리미티드 인그리디언트 터키 드라이 독 20lb',             '', '{"package_weight_value":20,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}',            'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('778b158a713929bfa40085ae0b875997', 'mi-diet-feed-dry-food-core',            'e5b41993f1398b638b1a4556f9174a5a', '1645582d1852e222bbd564f8c4193479', 'feed.model.inst_li_salmon_dry_cat',                   '인스팅트 리미티드 인그리디언트 살몬 드라이 캣 4.5lb',            '', '{"package_weight_value":4.5,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"cat"}',           'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('35da7d1a3f81edf65b8ffc078529c153', 'mi-diet-feed-dry-food-core',            'e5b41993f1398b638b1a4556f9174a5a', '1645582d1852e222bbd564f8c4193479', 'feed.model.inst_li_lamb_dry_dog',                     '인스팅트 리미티드 인그리디언트 램 드라이 독 20lb',               '', '{"package_weight_value":20,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}',            'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),

  -- ── Stella & Chewy''s · Freeze-Dried Raw (4) ──
  ('11ae3e0c4d9f8f1b16d2f35fd99fb63e', 'mi-diet-feed-freeze-dried-complete-core','6ccb2c570fcaece15ae8443e19329bc0', '01cb8956706445dc4cad5c6a27210680', 'feed.model.sc_fd_chicken_patties_dog',                '스텔라앤츄이스 치킨 디너 패티 독 25oz',                          '', '{"package_weight_value":25,"package_weight_unit":"oz","life_stage_key":"all_life_stages","species_key":"dog"}',  'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('0c1b0c2a90846e41794cd26d51246d37', 'mi-diet-feed-freeze-dried-complete-core','6ccb2c570fcaece15ae8443e19329bc0', '01cb8956706445dc4cad5c6a27210680', 'feed.model.sc_fd_duck_goose_patties_dog',             '스텔라앤츄이스 덕덕구스 디너 패티 독 25oz',                      '', '{"package_weight_value":25,"package_weight_unit":"oz","life_stage_key":"all_life_stages","species_key":"dog"}',  'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('60d29ed1f5d83a7219e4a9a1cead2bab', 'mi-diet-feed-freeze-dried-complete-core','6ccb2c570fcaece15ae8443e19329bc0', '01cb8956706445dc4cad5c6a27210680', 'feed.model.sc_fd_rabbit_cat',                         '스텔라앤츄이스 앱솔루틀리 래빗 디너 캣 18oz',                    '', '{"package_weight_value":18,"package_weight_unit":"oz","life_stage_key":"all_life_stages","species_key":"cat"}',  'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('46e11adbafeb4deaacd31929fa220e91', 'mi-diet-feed-freeze-dried-complete-core','6ccb2c570fcaece15ae8443e19329bc0', '01cb8956706445dc4cad5c6a27210680', 'feed.model.sc_fd_beef_patties_dog',                   '스텔라앤츄이스 슈퍼비프 디너 패티 독 25oz',                      '', '{"package_weight_value":25,"package_weight_unit":"oz","life_stage_key":"all_life_stages","species_key":"dog"}',  'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- ── Stella & Chewy''s · Stews (2) ──
  ('eb75683d1e60943dbc14ba2e902b7285', 'mi-diet-feed-stew-food-core',           '6ccb2c570fcaece15ae8443e19329bc0', 'bc13d239fbd9e8fb182349017b79eb5f', 'feed.model.sc_stew_red_meat_dog',                     '스텔라앤츄이스 레드미트 메들리 스튜 독 11oz',                    '', '{"package_weight_value":11,"package_weight_unit":"oz","life_stage_key":"adult","species_key":"dog"}',            'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('82da76d9ea6624255ac39b078d2562fe', 'mi-diet-feed-stew-food-core',           '6ccb2c570fcaece15ae8443e19329bc0', 'bc13d239fbd9e8fb182349017b79eb5f', 'feed.model.sc_stew_chicken_dog',                      '스텔라앤츄이스 케이지프리 치킨 스튜 독 11oz',                    '', '{"package_weight_value":11,"package_weight_unit":"oz","life_stage_key":"adult","species_key":"dog"}',            'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- ── Stella & Chewy''s · Meal Mixers (2) ──
  ('0aec0fdc0175819d0084ab7bab957ae5', 'mi-diet-feed-freeze-dried-complete-core','6ccb2c570fcaece15ae8443e19329bc0', '75d2514ec31f9b65c21c07e1cf6bfbf4', 'feed.model.sc_mixer_beef_dog',                        '스텔라앤츄이스 슈퍼비프 밀믹서 독 18oz',                         '', '{"package_weight_value":18,"package_weight_unit":"oz","life_stage_key":"all_life_stages","species_key":"dog"}',  'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('9cafb48adbb64e1b74728d47f0b1ed4d', 'mi-diet-feed-freeze-dried-complete-core','6ccb2c570fcaece15ae8443e19329bc0', '75d2514ec31f9b65c21c07e1cf6bfbf4', 'feed.model.sc_mixer_chicken_cat',                     '스텔라앤츄이스 츄이스 치킨 밀믹서 캣 8oz',                       '', '{"package_weight_value":8,"package_weight_unit":"oz","life_stage_key":"all_life_stages","species_key":"cat"}',   'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),

  -- ── Open Farm · Dry Food (3) ──
  ('0046e91d388d408bade4b3f4beeeae7c', 'mi-diet-feed-dry-food-core',            'eb10275f315c4dfb3354ba61f600d467', '997d1465b131c0947190a53651646ad7', 'feed.model.of_beef_dry_dog',                          '오픈팜 그래스피드 비프 드라이 독 22lb',                           '', '{"package_weight_value":22,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}',            'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('48127bf9d2dec249afbd5f4bd8c7ce8c', 'mi-diet-feed-dry-food-core',            'eb10275f315c4dfb3354ba61f600d467', '997d1465b131c0947190a53651646ad7', 'feed.model.of_salmon_dry_dog',                        '오픈팜 와일드캐치 살몬 드라이 독 22lb',                           '', '{"package_weight_value":22,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}',            'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('94169fbc2e383f20276187cdf7c1e1e5', 'mi-diet-feed-dry-food-core',            'eb10275f315c4dfb3354ba61f600d467', '997d1465b131c0947190a53651646ad7', 'feed.model.of_turkey_chicken_dry_cat',                '오픈팜 홈스테드 터키&치킨 드라이 캣 8lb',                         '', '{"package_weight_value":8,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"cat"}',             'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- ── Open Farm · Wet Food (2) ──
  ('0ec264997135ba6d89157eec7e4a4828', 'mi-diet-feed-wet-food-core',            'eb10275f315c4dfb3354ba61f600d467', '4d064e9c28ed2106c1d22a8a4615d616', 'feed.model.of_beef_rustic_wet_dog',                   '오픈팜 그래스피드 비프 러스틱 블렌드 웻 독 12.5oz',              '', '{"package_weight_value":12.5,"package_weight_unit":"oz","life_stage_key":"adult","species_key":"dog"}',          'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('de2e838c42fe30971b87d14745c592f6', 'mi-diet-feed-wet-food-core',            'eb10275f315c4dfb3354ba61f600d467', '4d064e9c28ed2106c1d22a8a4615d616', 'feed.model.of_chicken_stew_wet_cat',                  '오픈팜 하베스트 치킨 러스틱 스튜 웻 캣 5.5oz',                   '', '{"package_weight_value":5.5,"package_weight_unit":"oz","life_stage_key":"adult","species_key":"cat"}',           'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- ── Open Farm · Freeze-Dried Raw (2) ──
  ('f8a01aa98b208ec3796660df6b343a1c', 'mi-diet-feed-freeze-dried-complete-core','eb10275f315c4dfb3354ba61f600d467', 'e4138f0562c824d9061f72af41d3eed7', 'feed.model.of_beef_fd_raw_dog',                       '오픈팜 그래스피드 비프 프리즈드라이 로우 독 13.5oz',             '', '{"package_weight_value":13.5,"package_weight_unit":"oz","life_stage_key":"all_life_stages","species_key":"dog"}','active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('30061a1576b029cf42a47bea8fddc9e4', 'mi-diet-feed-freeze-dried-complete-core','eb10275f315c4dfb3354ba61f600d467', 'e4138f0562c824d9061f72af41d3eed7', 'feed.model.of_surf_turf_fd_raw_dog',                  '오픈팜 서프앤터프 프리즈드라이 로우 독 13.5oz',                  '', '{"package_weight_value":13.5,"package_weight_unit":"oz","life_stage_key":"all_life_stages","species_key":"dog"}','active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),

  -- ── Wellness · Complete Health (3) ──
  ('f33c85ac3ae831b5574556766da338e5', 'mi-diet-feed-dry-food-core',            '15676dee8b459d96462223c7d9d83f85', 'a0f1437cb5abab6ee1af7ec19d10d503', 'feed.model.wn_ch_adult_chicken_oatmeal_dry_dog',      '웰니스 컴플리트 헬스 어덜트 치킨&오트밀 드라이 독 30lb',        '', '{"package_weight_value":30,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}',            'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('22165166695274ccb72396c3d5328ddf', 'mi-diet-feed-dry-food-core',            '15676dee8b459d96462223c7d9d83f85', 'a0f1437cb5abab6ee1af7ec19d10d503', 'feed.model.wn_ch_indoor_cat_dry',                     '웰니스 컴플리트 헬스 인도어 헬시웨이트 드라이 캣 12lb',         '', '{"package_weight_value":12,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"cat"}',            'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('46992bf015a7f5bbb06b0756879c2aa3', 'mi-diet-feed-dry-food-core',            '15676dee8b459d96462223c7d9d83f85', 'a0f1437cb5abab6ee1af7ec19d10d503', 'feed.model.wn_ch_small_breed_turkey_dry_dog',         '웰니스 컴플리트 헬스 스몰브리드 터키&오트밀 드라이 독 12lb',    '', '{"package_weight_value":12,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}',            'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- ── Wellness · CORE (3) ──
  ('42fcf6f8dc310296aa9f394e73a28531', 'mi-diet-feed-high-protein-dry-core',    '15676dee8b459d96462223c7d9d83f85', 'f92eda25811ccc90f73d395e6bcfb3d6', 'feed.model.wn_core_original_turkey_dry_dog',          '웰니스 코어 오리지널 터키&치킨 드라이 독 26lb',                  '', '{"package_weight_value":26,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}',            'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('4a95414c6e8e866b154ac4a8a8c5b6f6', 'mi-diet-feed-high-protein-dry-core',    '15676dee8b459d96462223c7d9d83f85', 'f92eda25811ccc90f73d395e6bcfb3d6', 'feed.model.wn_core_indoor_cat_dry',                   '웰니스 코어 인도어 드라이 캣 11lb',                               '', '{"package_weight_value":11,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"cat"}',            'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('e67508bf3e5d2ac0e1b1231a83c5af04', 'mi-diet-feed-high-protein-dry-core',    '15676dee8b459d96462223c7d9d83f85', 'f92eda25811ccc90f73d395e6bcfb3d6', 'feed.model.wn_core_small_breed_dry_dog',              '웰니스 코어 스몰브리드 드라이 독 12lb',                           '', '{"package_weight_value":12,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}',            'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- ── Wellness · Simple (2) ──
  ('ff94ff550b82522411b477eea53745a0', 'mi-diet-feed-dry-food-core',            '15676dee8b459d96462223c7d9d83f85', '8ba98bde827f31bfe92251a89b15a2bc', 'feed.model.wn_simple_salmon_potato_dry_dog',          '웰니스 심플 살몬&포테이토 드라이 독 24lb',                       '', '{"package_weight_value":24,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}',            'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('57c54c08fdd95e8b74f6580b2ea2a637', 'mi-diet-feed-dry-food-core',            '15676dee8b459d96462223c7d9d83f85', '8ba98bde827f31bfe92251a89b15a2bc', 'feed.model.wn_simple_turkey_potato_dry_dog',          '웰니스 심플 터키&포테이토 드라이 독 24lb',                       '', '{"package_weight_value":24,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}',            'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),

  -- ── Taste of the Wild · Dry (5) ──
  ('6c804a7b2780448828aea10909347857', 'mi-diet-feed-grain-free-dry-food-core',  '649b829a0c2a938a7eebf2dc1cee5b7d', 'f7be0ddbf6b588a98f8c0cf9ada080c8', 'feed.model.totw_high_prairie_bison_dry_dog',          '테이스트오브더와일드 하이프레리 바이슨&베니슨 드라이 독 28lb',  '', '{"package_weight_value":28,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}',            'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('14a41da81206c9e83cf494ee6b02e6db', 'mi-diet-feed-grain-free-dry-food-core',  '649b829a0c2a938a7eebf2dc1cee5b7d', 'f7be0ddbf6b588a98f8c0cf9ada080c8', 'feed.model.totw_pacific_stream_salmon_dry_dog',      '테이스트오브더와일드 퍼시픽스트림 훈제연어 드라이 독 28lb',     '', '{"package_weight_value":28,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}',            'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('e72d44d4c8a64994dfe2087c8e9981bf', 'mi-diet-feed-grain-free-dry-food-core',  '649b829a0c2a938a7eebf2dc1cee5b7d', 'f7be0ddbf6b588a98f8c0cf9ada080c8', 'feed.model.totw_canyon_river_cat_dry',                '테이스트오브더와일드 캐년리버 송어&훈제연어 드라이 캣 14lb',    '', '{"package_weight_value":14,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"cat"}',            'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('ccc361475ea6ebed7e6ce7858b77123e', 'mi-diet-feed-grain-free-dry-food-core',  '649b829a0c2a938a7eebf2dc1cee5b7d', 'f7be0ddbf6b588a98f8c0cf9ada080c8', 'feed.model.totw_sierra_mountain_lamb_dry_dog',       '테이스트오브더와일드 시에라마운틴 램 드라이 독 28lb',            '', '{"package_weight_value":28,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}',            'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('c3da05176ece3791c93eebbd238a5f33', 'mi-diet-feed-grain-free-dry-food-core',  '649b829a0c2a938a7eebf2dc1cee5b7d', 'f7be0ddbf6b588a98f8c0cf9ada080c8', 'feed.model.totw_wetlands_fowl_dry_dog',              '테이스트오브더와일드 웻랜드 로스티드파울 드라이 독 28lb',        '', '{"package_weight_value":28,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}',            'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- ── Taste of the Wild · Wet (2) ──
  ('5f1613fb343b8291f36528a4c074f57e', 'mi-diet-feed-wet-food-core',            '649b829a0c2a938a7eebf2dc1cee5b7d', 'd7f4bc8d3ccf103cd2a42eed54585740', 'feed.model.totw_high_prairie_can_dog',                '테이스트오브더와일드 하이프레리 캔 독 13.2oz',                   '', '{"package_weight_value":13.2,"package_weight_unit":"oz","life_stage_key":"adult","species_key":"dog"}',          'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('86e8ee0bc8548d37a19273b16d6c56ac', 'mi-diet-feed-wet-food-core',            '649b829a0c2a938a7eebf2dc1cee5b7d', 'd7f4bc8d3ccf103cd2a42eed54585740', 'feed.model.totw_pacific_stream_can_dog',              '테이스트오브더와일드 퍼시픽스트림 캔 독 13.2oz',                 '', '{"package_weight_value":13.2,"package_weight_unit":"oz","life_stage_key":"adult","species_key":"dog"}',          'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00')
ON CONFLICT (id) DO NOTHING;

-- ===== 4. NUTRITION (60개 — GA 기반) =====
-- (id, feed_model_id, calories_per_100g, protein_pct, fat_pct, fiber_pct, moisture_pct, ash_pct, calcium_pct, phosphorus_pct, omega3_pct, omega6_pct, carbohydrate_pct, serving_size_g, ingredients_text, notes, status, created_at, updated_at)
INSERT INTO feed_nutrition (id, feed_model_id, calories_per_100g, protein_pct, fat_pct, fiber_pct, moisture_pct, ash_pct, calcium_pct, phosphorus_pct, omega3_pct, omega6_pct, carbohydrate_pct, serving_size_g, ingredients_text, notes, status, created_at, updated_at)
VALUES
  -- Purina Pro Plan
  ('c17c5bf86ed7a5da366b9f15100bc164', '17ea8ef3e7f5f076fdd54dfed49df10b', 378, 26, 16, 4,   12, 7.5, 1.0, 0.8, 0.25, 2.5, 34.5, 113, 'Chicken, rice, whole grain wheat, poultry by-product meal, soybean meal', 'GA: Purina Pro Plan official', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('f559cc072682140def8154b31aa6102e', '3755cbaf184e271c80caedbcf5d39b49', 387, 28, 18, 3,   12, 7.0, 1.2, 1.0, 0.3,  2.8, 32,   85,  'Chicken, rice, whole grain wheat, poultry by-product meal, corn gluten meal', 'GA: Pro Plan Puppy', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('62c20c536746abb39e2259c92b53b935', '91e9c2941b8cc6dace8143cab8b23662', 360, 27, 14, 4.5, 12, 7.0, 1.0, 0.8, 0.25, 2.4, 35.5, 113, 'Chicken, rice, whole grain wheat, corn gluten meal, poultry by-product meal', 'GA: Pro Plan Senior 7+', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('a40604d0fd56183805f77d8387426449', '10aff4e46f39c6a6e339f3a39929af7b', 400, 30, 20, 3,   12, 8.0, 1.3, 1.0, 0.4,  2.8, 27,   170, 'Chicken, corn gluten meal, whole grain wheat, poultry by-product meal, animal fat', 'GA: Pro Plan Sport 30/20', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- Purina ONE
  ('cdd5c5c82fe1ff53fae82153576ba384', '7430219be817b4cc0508c25b819f6fad', 368, 26, 16, 3,   12, 7.0, 1.0, 0.8, 0.2,  2.3, 36,   56,  'Chicken, rice flour, whole grain corn, poultry by-product meal, soy protein isolate', 'GA: Purina ONE SmartBlend', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('4041bed2a211406ac50afcbe7a77177f', '6712854ae6d740287020ddc6decc1026', 380, 34, 14, 2.5, 12, 7.0, 1.1, 0.9, 0.5,  3.0, 30.5, 43,  'Ocean whitefish, pea protein, cassava root flour, chicken fat, soy protein isolate', 'GA: Purina ONE GF Cat', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- Fancy Feast
  ('7cc5f5a09d59ff3e3605547ad6d14481', '8234b3c212815ea5dd4b79eaf1e4ae07', 105, 11, 7,  1.5, 78, 2.5, 0.25, 0.2,  0.05, 0.3,  0,    85,  'Ocean whitefish, liver, meat by-products, fish broth, artificial and natural flavors', 'GA: Fancy Feast Classic Pate', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('3489486611188b937684f4cba6035e95', '9fad8776c5ce7c4de47abb046aa5bab2', 90,  10, 5,  1.5, 80, 2.5, 0.2,  0.18, 0.04, 0.25, 1,    85,  'Chicken, meat broth, liver, wheat gluten, carrots, tomatoes', 'GA: Fancy Feast Medleys', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- Beyond
  ('1759fb50f748693d76be459f0ce46743', 'c4d4c39e2aa49f44c8b8ee00de4a089c', 365, 26, 15, 4,   12, 6.5, 1.0, 0.8, 0.2,  2.2, 36.5, 56,  'Chicken, brown rice, oat meal, barley, chicken meal', 'GA: Beyond Simply Natural', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('370a6988249ab15baa256d16463f07be', '296a517c041a3844a0ac48c97fe29d4b', 375, 32, 14, 4,   12, 7.0, 1.0, 0.8, 0.5,  2.8, 31,   43,  'Salmon, brown rice, oat meal, egg product, pea fiber', 'GA: Beyond Indoor Cat', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),

  -- Farmina N&D
  ('a4e9f03c39239775bf5ef0ed05591f20', 'a222a3e206be321a755f7a09d722b90e', 396, 30, 18, 2.4, 8,  8.2, 1.3, 0.9, 0.5,  3.0, 33.4, 55,  'Fresh deboned chicken, dehydrated chicken, pumpkin, chicken fat, dehydrated pomegranate', 'GA: Farmina N&D official', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('a28bbcedf6a8fa725f6ac2d50e99339a', '49b192ab24358b3adf3f62561b1d063e', 378, 26, 16, 1.8, 8,  7.5, 1.1, 0.8, 0.8,  3.5, 40.7, 55,  'Fresh deboned venison, dehydrated venison, quinoa, fish oil, dried coconut', 'GA: Farmina N&D Quinoa', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('571fdec2ae3d420b179d3226358f5e9b', 'ae7796ba4e6c36ec1d6c059f1b1f0c1e', 410, 44, 20, 1.8, 8,  8.5, 1.3, 1.0, 0.5,  3.2, 17.7, 36,  'Fresh deboned chicken, dehydrated chicken, chicken fat, dried pomegranate, pea fibre', 'GA: Farmina N&D Prime Cat', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('5f11f41c5ea3a4c88999a92d2393d112', '407b22f1bf5f4e18a7d4d7cb65588731', 385, 26, 16, 2.6, 8,  8.0, 1.6, 1.0, 0.4,  2.8, 39.4, 120, 'Fresh deboned lamb, dehydrated lamb, pumpkin, lamb fat, dried blueberries', 'GA: Farmina N&D Pumpkin Lamb', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- Farmina Vet Life
  ('bee587861f882303e6f8cdae28bdeb18', '483f37ea5b818c866114da813c5497b0', 365, 25, 12, 1.5, 8,  7.0, 1.0, 0.7, 0.3,  2.0, 46.5, 80,  'Rice, dehydrated fish, animal fat, dried beet pulp, fish oil', 'GA: Farmina Vet Life GI', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('c98c5f024eab7e26d4f595799dee4504', '2b86dec7031ec44e70c9039909740576', 395, 26, 18, 2.2, 8,  6.0, 0.6, 0.4, 0.4,  2.2, 39.8, 36,  'Rice, dehydrated chicken, animal fat, corn gluten, flaxseed', 'GA: Farmina Vet Life Renal Cat', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- Farmina Team Breeder
  ('cb745ef2b6461f9bb0d5db2ad5666ce3', '3e102724fa0b4a08384a662899c92bef', 395, 32, 20, 2,   8,  8.0, 1.4, 1.0, 0.4,  3.0, 30,   85,  'Dehydrated chicken, fresh deboned chicken, chicken fat, pea starch, dried beet pulp', 'GA: Farmina TB GF Puppy', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),

  -- Ziwi Peak Air-Dried
  ('d5f293993f1dd8ee4ecea9dcdf3e5939', '9672e57c6f881678119fff4d3527b8bf', 560, 45, 28, 2,   14, 10.0, 2.5, 1.8, 0.3,  1.0, 1,    28,  'Venison, venison tripe, venison heart, venison liver, venison kidney, venison bone', 'GA: Ziwi Peak official — 96% meat', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('e2da80c2aebf72397f4f7606ae5e3d1f', '5b71b6f3b7d0919b8e6f9e60cf01e78b', 550, 38, 30, 2,   14, 12.0, 2.0, 1.5, 0.2,  1.2, 4,    28,  'Beef, beef tripe, beef heart, beef liver, beef kidney, beef lung, beef bone', 'GA: Ziwi Peak Beef', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('9bb3faf9cb83a7b2c0d38dc516026077', 'e748349522542456e93ff18d6288a334', 480, 36, 28, 2,   14, 9.0,  2.0, 1.5, 0.5,  1.5, 11,   14,  'Lamb, lamb tripe, lamb heart, lamb liver, lamb lung, lamb kidney, lamb bone', 'GA: Ziwi Peak Lamb Cat', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('9035185c45c31e95162d9c4dfbf01693', 'b6b6c790635e5161294c648a777aeee6', 520, 35, 30, 2,   14, 11.0, 2.2, 1.6, 1.5,  1.0, 8,    28,  'Mackerel, lamb, lamb tripe, lamb heart, lamb liver, lamb bone, mackerel broth', 'GA: Ziwi Peak Mackerel Lamb', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- Ziwi Peak Canned
  ('a34376dbb8e1be1679dafe587541b624', '993e41c020bfd1a8c397da49b71275c3', 105, 10, 4,  2,   78, 3.0,  0.8, 0.5, 0.1,  0.3, 3,    390, 'Venison, venison tripe, venison heart, venison liver, venison bone, chickpeas', 'GA: Ziwi Peak Canned Venison', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('1c345dcd3c17ec7a50763d17a2f56e2f', '8f142f025ee8d9b57bf647e3dd09cc5a', 110, 9,  6,  2,   78, 3.0,  0.5, 0.4, 0.1,  0.4, 2,    185, 'Beef, beef tripe, beef heart, beef liver, beef bone, chickpeas', 'GA: Ziwi Peak Canned Beef Cat', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),

  -- Instinct Original
  ('f0e4869a976eb4fb49a68c14b97a95f4', 'ce588ad3a5418b2642161d144d0a4cc7', 430, 37, 22.5, 3.5, 10, 8.5, 1.5, 1.1, 0.5,  3.2, 18.5, 120, 'Chicken, chicken meal, turkey meal, menhaden fish meal, peas, chicken fat', 'GA: Instinct Original GF Dog', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('9f283283194683021a438a5d348682dd', '269c2f2dc1577b0fc25148d10e93db88', 440, 40.5, 21, 3,  10, 9.0, 1.6, 1.2, 0.5,  3.5, 16.5, 43,  'Chicken, chicken meal, turkey meal, menhaden fish meal, peas, chicken fat', 'GA: Instinct Original GF Cat', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- Instinct Raw Boost
  ('0055cb3635e353189b934c029ca74977', 'c0784008debc7961c18b9a61998190ba', 430, 42, 25, 3,   5,  10.0, 2.0, 1.4, 0.5,  2.5, 15,   14,  'Chicken, chicken liver, chicken heart, ground chicken bone, salmon oil', 'GA: Instinct Raw Boost Mixers', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('6e1b7d3c7b208f97a03ce1660968cbd9', '7f78ce93709749277b979e2fc172c044', 390, 33, 18, 4,   10, 7.5, 1.3, 1.0, 0.3,  2.8, 27.5, 120, 'Chicken, chicken meal, whole grain brown rice, whole grain barley, oatmeal', 'GA: Instinct Raw Boost WG Dog', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- Instinct Limited Ingredient
  ('0cafe3c2cd531297325933b913ec6781', 'e956f106a32360ed3d2162d61d9fcb43', 410, 30, 20, 4,   10, 8.0, 1.2, 0.9, 0.3,  2.5, 28,   120, 'Turkey, turkey meal, peas, tapioca, canola oil', 'GA: Instinct LID Turkey Dog', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('8f55d45b87aca942acf7abc7c0378c51', '778b158a713929bfa40085ae0b875997', 420, 35, 18, 3,   10, 8.0, 1.3, 1.0, 1.0,  3.0, 26,   43,  'Salmon, salmon meal, peas, tapioca, canola oil', 'GA: Instinct LID Salmon Cat', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('0b6a4a90955f4ae16d4e52bc64425c6e', '35da7d1a3f81edf65b8ffc078529c153', 400, 28, 18, 4.5, 10, 8.0, 1.3, 0.9, 0.3,  2.5, 31.5, 120, 'Lamb, lamb meal, peas, tapioca, canola oil', 'GA: Instinct LID Lamb Dog', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),

  -- Stella & Chewy's FD Raw
  ('35446da6faeb9241dd4ceac6c9f53c8d', '11ae3e0c4d9f8f1b16d2f35fd99fb63e', 432, 42, 25, 4,   5,  9.0, 2.0, 1.4, 0.4,  2.0, 15,   28,  'Chicken with ground bone, chicken liver, chicken gizzard, pumpkin seed, organic cranberries', 'GA: S&C Chicken Patties', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('7e8453d6125791a54d4cf2767e3c19a6', '0c1b0c2a90846e41794cd26d51246d37', 445, 40, 28, 4,   5,  9.0, 2.2, 1.5, 0.5,  2.2, 14,   28,  'Duck with ground bone, duck liver, duck gizzard, goose with ground bone, goose liver', 'GA: S&C Duck Duck Goose', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('69ac1adccdf888b3b91e84bc3f24dd74', '60d29ed1f5d83a7219e4a9a1cead2bab', 415, 44, 22, 4,   5,  10.0, 2.5, 1.6, 0.3,  1.8, 15,   14,  'Rabbit with ground bone, rabbit liver, olive oil, pumpkin seed, organic cranberries', 'GA: S&C Absolutely Rabbit Cat', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('7dcc4d3746a1051cf7178e9d8d44e9e3', '46e11adbafeb4deaacd31929fa220e91', 440, 41, 27, 4,   5,  9.5, 2.0, 1.4, 0.3,  2.0, 13.5, 28,  'Beef with ground bone, beef liver, beef kidney, pumpkin seed, organic cranberries', 'GA: S&C Super Beef Patties', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- Stella & Chewy's Stews
  ('7e81f75fac425359424bd39ad78b9a13', 'eb75683d1e60943dbc14ba2e902b7285', 100, 10, 5,  1,   80, 2.5, 0.4, 0.3, 0.1,  0.4, 1.5,  312, 'Beef, beef bone broth, pork, lamb, carrots, peas', 'GA: S&C Red Meat Stew', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('bdcddd6e253e1ebe3262f41ae9161a22', '82da76d9ea6624255ac39b078d2562fe', 95,  9,  4.5, 1,   82, 2.5, 0.35, 0.25, 0.1, 0.3, 1,   312, 'Chicken, chicken bone broth, chicken liver, carrots, peas, spinach', 'GA: S&C Chicken Stew', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- Stella & Chewy's Meal Mixers
  ('93f0dfe8a2f4f14b90a9c5a9e7e10128', '0aec0fdc0175819d0084ab7bab957ae5', 440, 40, 26, 4,   5,  10.0, 2.0, 1.4, 0.3,  2.0, 15,   28,  'Beef, beef liver, beef kidney, beef bone, pumpkin seed, organic cranberries', 'GA: S&C Super Beef Mixer', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('112d73fb3c6912da7cd959e12e399f7a', '9cafb48adbb64e1b74728d47f0b1ed4d', 425, 42, 24, 4,   5,  10.0, 2.2, 1.5, 0.4,  2.0, 15,   14,  'Chicken, chicken liver, chicken gizzard, chicken bone, organic cranberries', 'GA: S&C Chicken Mixer Cat', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),

  -- Open Farm Dry
  ('c8476b30801cccce0652ac565a3045bd', '0046e91d388d408bade4b3f4beeeae7c', 375, 27, 15, 4.5, 10, 7.0, 1.2, 0.9, 0.3,  2.5, 36.5, 120, 'Grass-fed beef, ocean whitefish meal, chickpeas, peas, lentils', 'GA: Open Farm Beef official', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('79667c115ab9751d787cac2ce9d76f38', '48127bf9d2dec249afbd5f4bd8c7ce8c', 380, 27, 16, 4,   10, 7.5, 1.2, 0.9, 0.8,  2.2, 35.5, 120, 'Wild-caught salmon, ocean whitefish meal, chickpeas, peas, lentils', 'GA: Open Farm Salmon', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('4ab75c1753242ea854c507db14f17f83', '94169fbc2e383f20276187cdf7c1e1e5', 390, 36, 17, 3,   10, 7.5, 1.3, 1.0, 0.4,  3.0, 26.5, 43,  'Turkey, chicken, ocean whitefish meal, chickpeas, lentils', 'GA: Open Farm Turkey Cat', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- Open Farm Wet
  ('d0c2488e6015307cf822030afc99d53d', '0ec264997135ba6d89157eec7e4a4828', 115, 10, 6,  1.5, 78, 2.5, 0.4, 0.3, 0.1,  0.4, 2,    354, 'Grass-fed beef, beef bone broth, carrots, spinach, pumpkin', 'GA: Open Farm Beef Rustic', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('2afb5b0157c51183858b4b33e972a084', 'de2e838c42fe30971b87d14745c592f6', 100, 9,  5,  1,   80, 2.5, 0.3, 0.25, 0.08, 0.3, 2.5,  156, 'Chicken, chicken bone broth, carrots, peas, cranberries', 'GA: Open Farm Chicken Cat', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- Open Farm FD Raw
  ('fe02f3dc87b8dcae9925eb882132f76d', 'f8a01aa98b208ec3796660df6b343a1c', 430, 38, 26, 4,   5,  9.0, 2.0, 1.5, 0.3,  2.0, 18,   28,  'Grass-fed beef, beef liver, beef heart, beef bone, pumpkin, coconut oil', 'GA: Open Farm FD Beef', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('31683abcba0abb6395fb6acb29803cd1', '30061a1576b029cf42a47bea8fddc9e4', 420, 40, 24, 4,   5,  10.0, 2.2, 1.5, 1.0,  2.0, 17,   28,  'Grass-fed beef, wild-caught salmon, beef liver, beef bone, coconut oil', 'GA: Open Farm FD Surf Turf', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),

  -- Wellness Complete Health
  ('11e5a016e8b15b6b726b26d675265af1', 'f33c85ac3ae831b5574556766da338e5', 366, 24, 12, 4,   10, 7.2, 1.2, 0.9, 0.3,  2.5, 42.8, 120, 'Deboned chicken, chicken meal, oatmeal, ground barley, peas', 'GA: Wellness CH Adult Dog', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('636cd1c94ff9a537192997811623ea88', '22165166695274ccb72396c3d5328ddf', 352, 30, 10, 5.5, 10, 7.0, 1.0, 0.8, 0.3,  2.5, 37.5, 43,  'Deboned chicken, chicken meal, rice, peas, ground barley', 'GA: Wellness CH Indoor Cat', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('35305ae5e44dbf5f1a81f60e47e9ffdd', '46992bf015a7f5bbb06b0756879c2aa3', 370, 28, 15, 4,   10, 6.5, 1.0, 0.8, 0.25, 2.5, 36.5, 56,  'Deboned turkey, chicken meal, oatmeal, peas, ground barley', 'GA: Wellness CH Small Breed Dog', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- Wellness CORE
  ('e3b5bd6b427476203e1089714f0fac41', '42fcf6f8dc310296aa9f394e73a28531', 396, 34, 16, 4,   10, 8.5, 1.5, 1.1, 0.5,  3.0, 27.5, 120, 'Deboned turkey, turkey meal, chicken meal, peas, potatoes, chicken fat', 'GA: Wellness CORE Original Dog', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('b1bcb4be211d96a923f543a11a094949', '4a95414c6e8e866b154ac4a8a8c5b6f6', 400, 38, 13.5, 5, 10, 9.0, 1.3, 1.0, 0.5,  3.2, 24.5, 43,  'Deboned turkey, turkey meal, chicken meal, peas, chicken fat', 'GA: Wellness CORE Indoor Cat', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('c0336b9909bf4fca31e1d7f016c1928c', 'e67508bf3e5d2ac0e1b1231a83c5af04', 392, 36, 16, 4,   10, 8.5, 1.4, 1.1, 0.5,  3.0, 25.5, 56,  'Deboned turkey, turkey meal, chicken meal, peas, lentils, chicken fat', 'GA: Wellness CORE Small Breed Dog', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- Wellness Simple
  ('baf66704b5d6484ef077776761cbee90', 'ff94ff550b82522411b477eea53745a0', 365, 25, 12, 4.5, 10, 7.0, 1.0, 0.8, 0.5,  2.0, 41.5, 120, 'Salmon, salmon meal, potatoes, peas, canola oil, ground flaxseed', 'GA: Wellness Simple Salmon Dog', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('2467a929c2eff31245fb21797f49ea62', '57c54c08fdd95e8b74f6580b2ea2a637', 362, 24, 12, 4.5, 10, 7.0, 1.0, 0.8, 0.25, 2.2, 42.5, 120, 'Turkey, turkey meal, potatoes, peas, canola oil, ground flaxseed', 'GA: Wellness Simple Turkey Dog', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),

  -- Taste of the Wild Dry
  ('2477b37dab8f9c913afeea34194717c7', '6c804a7b2780448828aea10909347857', 370, 32, 18, 3,   10, 7.5, 1.4, 1.0, 0.3,  2.8, 29.5, 120, 'Buffalo, lamb meal, chicken meal, sweet potatoes, peas, chicken fat', 'GA: TOTW High Prairie', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('45cff34cd32a0ee0c4502bb670dbbdef', '14a41da81206c9e83cf494ee6b02e6db', 360, 25, 15, 3,   10, 7.5, 1.2, 0.9, 0.5,  2.4, 39.5, 120, 'Salmon, ocean fish meal, sweet potatoes, potatoes, peas, canola oil', 'GA: TOTW Pacific Stream', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('593dc512b3ecfee1d05032e5fcdebdb3', 'e72d44d4c8a64994dfe2087c8e9981bf', 375, 32, 16, 3,   10, 7.5, 1.4, 1.0, 0.5,  3.0, 31.5, 43,  'Trout, ocean fish meal, sweet potatoes, potatoes, peas, chicken fat', 'GA: TOTW Canyon River Cat', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('ebb5ec10cd1f2e52959776adc1f053e3', 'ccc361475ea6ebed7e6ce7858b77123e', 368, 25, 15, 3,   10, 7.5, 1.4, 1.0, 0.3,  2.6, 39.5, 120, 'Lamb meal, sweet potatoes, peas, lamb, egg product, chicken fat', 'GA: TOTW Sierra Mountain', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('5cccd87d7710060bf667641fd85a3ed0', 'c3da05176ece3791c93eebbd238a5f33', 375, 32, 18, 3,   10, 7.5, 1.4, 1.0, 0.4,  2.8, 29.5, 120, 'Duck, duck meal, chicken meal, sweet potatoes, peas, chicken fat', 'GA: TOTW Wetlands', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- Taste of the Wild Wet
  ('e459b271d0f1fc23865cf97eb0457331', '5f1613fb343b8291f36528a4c074f57e', 95,  8,  3.5, 1,   82, 3.0, 0.3, 0.25, 0.05, 0.3, 2.5,  374, 'Beef, lamb, beef broth, ocean fish, dried egg product, sweet potatoes', 'GA: TOTW High Prairie Can', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('f71cae40bdcf1aa5ef05dac4cb9b711b', '86e8ee0bc8548d37a19273b16d6c56ac', 90,  8,  3.5, 1,   82, 3.0, 0.4, 0.3,  0.1,  0.3, 2.5,  374, 'Salmon, ocean fish, salmon broth, sweet potatoes, potatoes, dried egg product', 'GA: TOTW Pacific Stream Can', 'active', '2026-03-10 12:00:00', '2026-03-10 12:00:00')
ON CONFLICT (id) DO NOTHING;

-- ===== 5. MAPPING TABLES =====

-- 5-A. feed_manufacturer_type_map (제조사 ↔ feed type)
INSERT INTO feed_manufacturer_type_map (id, manufacturer_id, type_item_id, created_at)
VALUES
  -- Purina: dry, wet, grain-free, pate, high-protein
  ('d7e123386f47f76420104cabf7449038', '476b962c359dda630049651411ec9e4d', 'mi-diet-feed-dry-food-core',              '2026-03-10 12:00:00'),
  ('5e3fb928e1ee5c81a8c698437e8c4589', '476b962c359dda630049651411ec9e4d', 'mi-diet-feed-wet-food-core',              '2026-03-10 12:00:00'),
  ('d21804a9aaebe0dc818755db3744ae46', '476b962c359dda630049651411ec9e4d', 'mi-diet-feed-grain-free-dry-food-core',   '2026-03-10 12:00:00'),
  (md5('feed_mfr_type_purina_pate'),    '476b962c359dda630049651411ec9e4d', 'mi-diet-feed-pate-food-core',             '2026-03-10 12:00:00'),
  (md5('feed_mfr_type_purina_hp'),      '476b962c359dda630049651411ec9e4d', 'mi-diet-feed-high-protein-dry-core',      '2026-03-10 12:00:00'),
  -- Farmina: grain-free, prescription
  ('7d1baf424dd1bc53424e573ddb9f81b3', '06673cf5dae74f914f48fdd8b50bdd89', 'mi-diet-feed-grain-free-dry-food-core',   '2026-03-10 12:00:00'),
  ('f25a4551e9237fc72e8c47f187c4f5b5', '06673cf5dae74f914f48fdd8b50bdd89', 'mi-diet-feed-prescription-diet-core',     '2026-03-10 12:00:00'),
  -- Ziwi Peak: dry (air-dried), wet
  ('138ed443c28afeed14a580b708b37eaa', '39cbbd36828b7da0ccd468ab464c4f30', 'mi-diet-feed-dry-food-core',              '2026-03-10 12:00:00'),
  ('5032019f7ea7c6d957f71509f3d9d12a', '39cbbd36828b7da0ccd468ab464c4f30', 'mi-diet-feed-wet-food-core',              '2026-03-10 12:00:00'),
  -- Instinct: grain-free, dry, freeze-dried
  ('186e17e8a7efb7ba849b7f4c02ba99af', 'e5b41993f1398b638b1a4556f9174a5a', 'mi-diet-feed-dry-food-core',              '2026-03-10 12:00:00'),
  ('a5d2332605d900a4ead2e33835afa616', 'e5b41993f1398b638b1a4556f9174a5a', 'mi-diet-feed-grain-free-dry-food-core',   '2026-03-10 12:00:00'),
  ('0fdc140af40752717bdf4e1899535683', 'e5b41993f1398b638b1a4556f9174a5a', 'mi-diet-feed-freeze-dried-complete-core', '2026-03-10 12:00:00'),
  -- Stella & Chewy's: freeze-dried, stew
  ('86eca260b22936e6bde4ede52fa3b658', '6ccb2c570fcaece15ae8443e19329bc0', 'mi-diet-feed-freeze-dried-complete-core', '2026-03-10 12:00:00'),
  ('bed6fbefa8860215073c6c035c6c6ed0', '6ccb2c570fcaece15ae8443e19329bc0', 'mi-diet-feed-stew-food-core',             '2026-03-10 12:00:00'),
  -- Open Farm: dry, wet, freeze-dried
  ('b97e3334a67bff900326401b8748adbb', 'eb10275f315c4dfb3354ba61f600d467', 'mi-diet-feed-dry-food-core',              '2026-03-10 12:00:00'),
  ('cef02a1d5340dd44eb7aa019ed582558', 'eb10275f315c4dfb3354ba61f600d467', 'mi-diet-feed-wet-food-core',              '2026-03-10 12:00:00'),
  ('919c1abc7268415cf30b42494d320037', 'eb10275f315c4dfb3354ba61f600d467', 'mi-diet-feed-freeze-dried-complete-core', '2026-03-10 12:00:00'),
  -- Wellness: dry, high-protein
  ('f80824d8f4745524169519c1762e0bc0', '15676dee8b459d96462223c7d9d83f85', 'mi-diet-feed-dry-food-core',              '2026-03-10 12:00:00'),
  ('d6294c385a68ded0518a75fd7013a462', '15676dee8b459d96462223c7d9d83f85', 'mi-diet-feed-high-protein-dry-core',      '2026-03-10 12:00:00'),
  -- Taste of the Wild: grain-free, wet
  ('30e5b24e4cbb816b3a89eb675afbdb16', '649b829a0c2a938a7eebf2dc1cee5b7d', 'mi-diet-feed-grain-free-dry-food-core',  '2026-03-10 12:00:00'),
  ('4ba9a987f45a19e429a99fb757cc4c26', '649b829a0c2a938a7eebf2dc1cee5b7d', 'mi-diet-feed-wet-food-core',              '2026-03-10 12:00:00')
ON CONFLICT DO NOTHING;

-- 5-B. feed_brand_manufacturer_map (브랜드 ↔ 제조사)
INSERT INTO feed_brand_manufacturer_map (id, brand_id, manufacturer_id, created_at)
VALUES
  ('c1d09da27234733859820b51ac37abf4', 'dd954b2665fa3138b3117e6471a0e2bb', '476b962c359dda630049651411ec9e4d', '2026-03-10 12:00:00'),
  ('58f6016121e49ab7130a76bc1ccab253', '75544ca70091537f8b1524d4e2259b7d', '476b962c359dda630049651411ec9e4d', '2026-03-10 12:00:00'),
  ('c36084d60c187afebee88e53fbe6fc77', '83eccf3ff482c8b5d549d66a735e1d0a', '476b962c359dda630049651411ec9e4d', '2026-03-10 12:00:00'),
  ('f0a73843c99330f99b27ef9f2e9dfbcf', '18362c3e02fb2ab642764e2e1b3b956f', '476b962c359dda630049651411ec9e4d', '2026-03-10 12:00:00'),
  ('b74f556b783a8efc32af26c3d870bc5c', 'dff31f99993693fcbf58824bcf7982f5', '06673cf5dae74f914f48fdd8b50bdd89', '2026-03-10 12:00:00'),
  ('756f4591454eccf9af9fa0979a207f42', '33d190deb6f33bc6c84d51bcc525abfb', '06673cf5dae74f914f48fdd8b50bdd89', '2026-03-10 12:00:00'),
  ('99db4ec5f0328e6747f21b1bebd60a79', 'd7a23f1132dccbd42ec3dc660632f506', '06673cf5dae74f914f48fdd8b50bdd89', '2026-03-10 12:00:00'),
  ('932b7f5575ec1cda9d7bd7cf6e351671', '1b7710a4cba75aa58b3fbbdecdd78dda', '39cbbd36828b7da0ccd468ab464c4f30', '2026-03-10 12:00:00'),
  ('4bdcb3fea49eeb6ab227fb13d325f386', '3c08d5ba434035f914ed97424c52c2f0', '39cbbd36828b7da0ccd468ab464c4f30', '2026-03-10 12:00:00'),
  ('53d2dbe2df44cc3722b561ff7e7a8fee', 'f41075d09e643d874e280e59fe3eca37', 'e5b41993f1398b638b1a4556f9174a5a', '2026-03-10 12:00:00'),
  ('4b110cca50cd7cf74609ccba7e09ed00', '85fa2e2552f11a9e790592185a3e642c', 'e5b41993f1398b638b1a4556f9174a5a', '2026-03-10 12:00:00'),
  ('b609fb5681beeff23ca6eee50a664892', '1645582d1852e222bbd564f8c4193479', 'e5b41993f1398b638b1a4556f9174a5a', '2026-03-10 12:00:00'),
  ('c05404fccbf7e6b49bca16bd35c07395', '01cb8956706445dc4cad5c6a27210680', '6ccb2c570fcaece15ae8443e19329bc0', '2026-03-10 12:00:00'),
  ('ada79fe629f1b3eaf6424583f1fff67c', 'bc13d239fbd9e8fb182349017b79eb5f', '6ccb2c570fcaece15ae8443e19329bc0', '2026-03-10 12:00:00'),
  ('77eabb4b63aa5c2d382bf7189d936fdc', '75d2514ec31f9b65c21c07e1cf6bfbf4', '6ccb2c570fcaece15ae8443e19329bc0', '2026-03-10 12:00:00'),
  ('32e807382144aa62fc7f0e1d4b37a6a7', '997d1465b131c0947190a53651646ad7', 'eb10275f315c4dfb3354ba61f600d467', '2026-03-10 12:00:00'),
  ('8456375d2180fed56ca4cfcb1a4d186f', '4d064e9c28ed2106c1d22a8a4615d616', 'eb10275f315c4dfb3354ba61f600d467', '2026-03-10 12:00:00'),
  ('b12854edce5ad4fd8c0115fb7014c3fa', 'e4138f0562c824d9061f72af41d3eed7', 'eb10275f315c4dfb3354ba61f600d467', '2026-03-10 12:00:00'),
  ('3d854232a897e4a03bc87cbb8394cd62', 'a0f1437cb5abab6ee1af7ec19d10d503', '15676dee8b459d96462223c7d9d83f85', '2026-03-10 12:00:00'),
  ('3ce4ebdcd2b1b3b94894b38385421825', 'f92eda25811ccc90f73d395e6bcfb3d6', '15676dee8b459d96462223c7d9d83f85', '2026-03-10 12:00:00'),
  ('4baff28d7a2b4eccbe4660d6f8d35f6c', '8ba98bde827f31bfe92251a89b15a2bc', '15676dee8b459d96462223c7d9d83f85', '2026-03-10 12:00:00'),
  ('1cd1a5efaa517dfdf3d278d07367b89b', 'f7be0ddbf6b588a98f8c0cf9ada080c8', '649b829a0c2a938a7eebf2dc1cee5b7d', '2026-03-10 12:00:00'),
  ('66aeec3847d1c8b548cb45a59f509976', 'd7f4bc8d3ccf103cd2a42eed54585740', '649b829a0c2a938a7eebf2dc1cee5b7d', '2026-03-10 12:00:00')
ON CONFLICT DO NOTHING;

-- 5-C. feed_model_brand_map (모델 ↔ 브랜드)
INSERT INTO feed_model_brand_map (id, model_id, brand_id, created_at)
VALUES
  -- Purina
  ('aaf3f730b5b7e8aadda6b0e5da270218', '17ea8ef3e7f5f076fdd54dfed49df10b', 'dd954b2665fa3138b3117e6471a0e2bb', '2026-03-10 12:00:00'),
  ('475ad057f36df4caa942cf561cb931b9', '3755cbaf184e271c80caedbcf5d39b49', 'dd954b2665fa3138b3117e6471a0e2bb', '2026-03-10 12:00:00'),
  ('bd87d285a07c3670d20adf5b0f76f64d', '91e9c2941b8cc6dace8143cab8b23662', 'dd954b2665fa3138b3117e6471a0e2bb', '2026-03-10 12:00:00'),
  ('905495d690de493abe16aee5fc361da6', '10aff4e46f39c6a6e339f3a39929af7b', 'dd954b2665fa3138b3117e6471a0e2bb', '2026-03-10 12:00:00'),
  ('5877e57fea31c8737c5bc8a5bc449357', '7430219be817b4cc0508c25b819f6fad', '75544ca70091537f8b1524d4e2259b7d', '2026-03-10 12:00:00'),
  ('00f9a1040796b099ec3b39b8bdcdea2b', '6712854ae6d740287020ddc6decc1026', '75544ca70091537f8b1524d4e2259b7d', '2026-03-10 12:00:00'),
  ('f240016a6d20f535c0ee1329d9e70802', '8234b3c212815ea5dd4b79eaf1e4ae07', '83eccf3ff482c8b5d549d66a735e1d0a', '2026-03-10 12:00:00'),
  ('65878acaa1cdd20a4fdf0a3b9fe8e7c9', '9fad8776c5ce7c4de47abb046aa5bab2', '83eccf3ff482c8b5d549d66a735e1d0a', '2026-03-10 12:00:00'),
  ('e533ec28833dc57f249abfb9af72c250', 'c4d4c39e2aa49f44c8b8ee00de4a089c', '18362c3e02fb2ab642764e2e1b3b956f', '2026-03-10 12:00:00'),
  ('9e6506d308946bb54fae5684f97d9ce1', '296a517c041a3844a0ac48c97fe29d4b', '18362c3e02fb2ab642764e2e1b3b956f', '2026-03-10 12:00:00'),
  -- Farmina
  ('a18737d45e1fff7aafba3e65ee001516', 'a222a3e206be321a755f7a09d722b90e', 'dff31f99993693fcbf58824bcf7982f5', '2026-03-10 12:00:00'),
  ('6d4b938a4ee93c1d871195c411119a2c', '49b192ab24358b3adf3f62561b1d063e', 'dff31f99993693fcbf58824bcf7982f5', '2026-03-10 12:00:00'),
  ('9bbbbc0f01e1e46c0fc730fcf2fce4ae', 'ae7796ba4e6c36ec1d6c059f1b1f0c1e', 'dff31f99993693fcbf58824bcf7982f5', '2026-03-10 12:00:00'),
  ('1e513d7ed811de0c26da27da543dd736', '407b22f1bf5f4e18a7d4d7cb65588731', 'dff31f99993693fcbf58824bcf7982f5', '2026-03-10 12:00:00'),
  ('23ca831880da0abd8590547e3810a6bb', '483f37ea5b818c866114da813c5497b0', '33d190deb6f33bc6c84d51bcc525abfb', '2026-03-10 12:00:00'),
  ('bd43d626198fdf6fecba53d538e6e05d', '2b86dec7031ec44e70c9039909740576', '33d190deb6f33bc6c84d51bcc525abfb', '2026-03-10 12:00:00'),
  ('99c39827c3a90b6453969ee4c9faf613', '3e102724fa0b4a08384a662899c92bef', 'd7a23f1132dccbd42ec3dc660632f506', '2026-03-10 12:00:00'),
  -- Ziwi Peak
  ('19b642ee26084856ba2bffbb84303beb', '9672e57c6f881678119fff4d3527b8bf', '1b7710a4cba75aa58b3fbbdecdd78dda', '2026-03-10 12:00:00'),
  ('5be99c4b186f0c46c0ace2f08d6edcfa', '5b71b6f3b7d0919b8e6f9e60cf01e78b', '1b7710a4cba75aa58b3fbbdecdd78dda', '2026-03-10 12:00:00'),
  ('a3bfe0e317d169f6f2c3fffb9302a07b', 'e748349522542456e93ff18d6288a334', '1b7710a4cba75aa58b3fbbdecdd78dda', '2026-03-10 12:00:00'),
  ('cfff31ddccf1ae8b4b8c6108073f1615', 'b6b6c790635e5161294c648a777aeee6', '1b7710a4cba75aa58b3fbbdecdd78dda', '2026-03-10 12:00:00'),
  ('2d4da32f74fc62267205ac32014721bc', '993e41c020bfd1a8c397da49b71275c3', '3c08d5ba434035f914ed97424c52c2f0', '2026-03-10 12:00:00'),
  ('cf81399e6f4c19eda66a4d5a9c0dcdbd', '8f142f025ee8d9b57bf647e3dd09cc5a', '3c08d5ba434035f914ed97424c52c2f0', '2026-03-10 12:00:00'),
  -- Instinct
  ('4d4c5278b46ceeb9e1b5bdf9baf719c2', 'ce588ad3a5418b2642161d144d0a4cc7', 'f41075d09e643d874e280e59fe3eca37', '2026-03-10 12:00:00'),
  ('28af4197ecc4ab076d7331727ce47302', '269c2f2dc1577b0fc25148d10e93db88', 'f41075d09e643d874e280e59fe3eca37', '2026-03-10 12:00:00'),
  ('6af47e82312048c4c66cc56cfd6bd378', 'c0784008debc7961c18b9a61998190ba', '85fa2e2552f11a9e790592185a3e642c', '2026-03-10 12:00:00'),
  ('d5c6e588a04163a7e9f94ff71295cd43', '7f78ce93709749277b979e2fc172c044', '85fa2e2552f11a9e790592185a3e642c', '2026-03-10 12:00:00'),
  ('95fc5093238c33bad97890c3da250ed2', 'e956f106a32360ed3d2162d61d9fcb43', '1645582d1852e222bbd564f8c4193479', '2026-03-10 12:00:00'),
  ('b60e92859898b31437a8d0b3bca457d0', '778b158a713929bfa40085ae0b875997', '1645582d1852e222bbd564f8c4193479', '2026-03-10 12:00:00'),
  ('c52e99cc4af6faa16b8f2f7cfbcda90b', '35da7d1a3f81edf65b8ffc078529c153', '1645582d1852e222bbd564f8c4193479', '2026-03-10 12:00:00'),
  -- Stella & Chewy's
  ('831f66051529b2cbb8b84057c2a22626', '11ae3e0c4d9f8f1b16d2f35fd99fb63e', '01cb8956706445dc4cad5c6a27210680', '2026-03-10 12:00:00'),
  ('ec0d3ad6b0704018bf14e3c516b00dc0', '0c1b0c2a90846e41794cd26d51246d37', '01cb8956706445dc4cad5c6a27210680', '2026-03-10 12:00:00'),
  ('c62ababf0453b9a468db293bed5f4bae', '60d29ed1f5d83a7219e4a9a1cead2bab', '01cb8956706445dc4cad5c6a27210680', '2026-03-10 12:00:00'),
  ('2c444732bc5f6afbd44473b4cc88646f', '46e11adbafeb4deaacd31929fa220e91', '01cb8956706445dc4cad5c6a27210680', '2026-03-10 12:00:00'),
  ('0e944864530dd2241869dc24267a51e0', 'eb75683d1e60943dbc14ba2e902b7285', 'bc13d239fbd9e8fb182349017b79eb5f', '2026-03-10 12:00:00'),
  ('4fb6b71e77ed065f4bf9a807f89626a3', '82da76d9ea6624255ac39b078d2562fe', 'bc13d239fbd9e8fb182349017b79eb5f', '2026-03-10 12:00:00'),
  ('088cd3de2cacc2cf1269ee8194f7f988', '0aec0fdc0175819d0084ab7bab957ae5', '75d2514ec31f9b65c21c07e1cf6bfbf4', '2026-03-10 12:00:00'),
  ('eeea682d2fa4265ca021535b5a4ce159', '9cafb48adbb64e1b74728d47f0b1ed4d', '75d2514ec31f9b65c21c07e1cf6bfbf4', '2026-03-10 12:00:00'),
  -- Open Farm
  ('6fd94d235b4c340188f893ddf782f99d', '0046e91d388d408bade4b3f4beeeae7c', '997d1465b131c0947190a53651646ad7', '2026-03-10 12:00:00'),
  ('456a0b106275002320c2ac1cd8925a1f', '48127bf9d2dec249afbd5f4bd8c7ce8c', '997d1465b131c0947190a53651646ad7', '2026-03-10 12:00:00'),
  ('41f7dcc25d616f9b9811bfc15c3d735c', '94169fbc2e383f20276187cdf7c1e1e5', '997d1465b131c0947190a53651646ad7', '2026-03-10 12:00:00'),
  ('f37e3a8105b453d7fc7c259ca6632f13', '0ec264997135ba6d89157eec7e4a4828', '4d064e9c28ed2106c1d22a8a4615d616', '2026-03-10 12:00:00'),
  ('4f1783ba2eb1a20f050ee55025cb2170', 'de2e838c42fe30971b87d14745c592f6', '4d064e9c28ed2106c1d22a8a4615d616', '2026-03-10 12:00:00'),
  ('3e54cf2c2d857b78830a1c427e4f0612', 'f8a01aa98b208ec3796660df6b343a1c', 'e4138f0562c824d9061f72af41d3eed7', '2026-03-10 12:00:00'),
  ('1e7761bf41b153e6990408f5db970872', '30061a1576b029cf42a47bea8fddc9e4', 'e4138f0562c824d9061f72af41d3eed7', '2026-03-10 12:00:00'),
  -- Wellness
  ('9fd13b1ff6c83b3a40f79ea29251e632', 'f33c85ac3ae831b5574556766da338e5', 'a0f1437cb5abab6ee1af7ec19d10d503', '2026-03-10 12:00:00'),
  ('c68b55898660233b223c6a52478d0f66', '22165166695274ccb72396c3d5328ddf', 'a0f1437cb5abab6ee1af7ec19d10d503', '2026-03-10 12:00:00'),
  ('3f00a71d98162ab5c6897b6acf1a9b68', '46992bf015a7f5bbb06b0756879c2aa3', 'a0f1437cb5abab6ee1af7ec19d10d503', '2026-03-10 12:00:00'),
  ('986825fa0341ef5d28f266e1fea6f81b', '42fcf6f8dc310296aa9f394e73a28531', 'f92eda25811ccc90f73d395e6bcfb3d6', '2026-03-10 12:00:00'),
  ('cb08c191c16c214e64395a2becfd2239', '4a95414c6e8e866b154ac4a8a8c5b6f6', 'f92eda25811ccc90f73d395e6bcfb3d6', '2026-03-10 12:00:00'),
  ('409ea96a0baa5034fe5bb42e864dd3e5', 'e67508bf3e5d2ac0e1b1231a83c5af04', 'f92eda25811ccc90f73d395e6bcfb3d6', '2026-03-10 12:00:00'),
  ('b9753e957fed7423b67b1390ed96b3d9', 'ff94ff550b82522411b477eea53745a0', '8ba98bde827f31bfe92251a89b15a2bc', '2026-03-10 12:00:00'),
  ('02b88c0a1a5452f90ecf1866cffe5f82', '57c54c08fdd95e8b74f6580b2ea2a637', '8ba98bde827f31bfe92251a89b15a2bc', '2026-03-10 12:00:00'),
  -- Taste of the Wild
  ('63b8250f781ba0c0698f1de84e539f8f', '6c804a7b2780448828aea10909347857', 'f7be0ddbf6b588a98f8c0cf9ada080c8', '2026-03-10 12:00:00'),
  ('74c3fe65a40186e801f1835e759bba1f', '14a41da81206c9e83cf494ee6b02e6db', 'f7be0ddbf6b588a98f8c0cf9ada080c8', '2026-03-10 12:00:00'),
  ('9382078df784c9c11abe3e42eb88a406', 'e72d44d4c8a64994dfe2087c8e9981bf', 'f7be0ddbf6b588a98f8c0cf9ada080c8', '2026-03-10 12:00:00'),
  ('39296fc7e7466c869a864dd02241f36b', 'ccc361475ea6ebed7e6ce7858b77123e', 'f7be0ddbf6b588a98f8c0cf9ada080c8', '2026-03-10 12:00:00'),
  ('76ab742cef94f48d5ae2e4ec334e9784', 'c3da05176ece3791c93eebbd238a5f33', 'f7be0ddbf6b588a98f8c0cf9ada080c8', '2026-03-10 12:00:00'),
  ('2849c4ea2e78bf0ccec5b266a550e2d2', '5f1613fb343b8291f36528a4c074f57e', 'd7f4bc8d3ccf103cd2a42eed54585740', '2026-03-10 12:00:00'),
  ('02167d3aae4c5b550c15ddc1f83d71a4', '86e8ee0bc8548d37a19273b16d6c56ac', 'd7f4bc8d3ccf103cd2a42eed54585740', '2026-03-10 12:00:00')
ON CONFLICT DO NOTHING;

-- ===== 6. I18N TRANSLATIONS (제조사 8 + 브랜드 23 = 31 rows, ko/en only, 나머지 NULL) =====
INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES
  -- Manufacturers
  ('f6503f9dc63047738509ae3967650b42', 'feed.manufacturer.purina',            'feed', '퓨리나',                 'Purina',                NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('69dccbccbd8296c72c2abe9c550a50a5', 'feed.manufacturer.farmina',           'feed', '파미나',                 'Farmina',               NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('e159d2765afb4171cc402d9743d09ac5', 'feed.manufacturer.ziwi_peak',         'feed', '지위피크',               'Ziwi Peak',             NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('ae34c4706d62c9066616ca43cfb2fb2c', 'feed.manufacturer.instinct',          'feed', '인스팅트',               'Instinct',              NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('167a6782ac016986052e38808a2ddf7d', 'feed.manufacturer.stella_chewys',     'feed', '스텔라앤츄이스',         'Stella & Chewy''s',     NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('6df809f2358dca1178d36ee7ca88d44b', 'feed.manufacturer.open_farm',         'feed', '오픈팜',                 'Open Farm',             NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('235488354e978d1ec4a08cfd263c576e', 'feed.manufacturer.wellness',          'feed', '웰니스',                 'Wellness',              NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('4a89eb088bf14782abbfeccf7d8d7b49', 'feed.manufacturer.taste_of_the_wild', 'feed', '테이스트오브더와일드',   'Taste of the Wild',     NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  -- Brands
  ('606248736f78f37b5899f5f551f53b05', 'feed.brand.purina_pro_plan',              'feed', '프로플랜',               'Pro Plan',              NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('e58303026a468a814aae13971e6e32dc', 'feed.brand.purina_one',                   'feed', '퓨리나 원',              'Purina ONE',            NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('7cc6bee966d3da9829b344aef2fcb675', 'feed.brand.purina_fancy_feast',           'feed', '팬시피스트',             'Fancy Feast',           NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('fc1a968af6dc04a002ff11b2462ed82d', 'feed.brand.purina_beyond',                'feed', '퓨리나 비욘드',          'Beyond',                NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('931ca45d95eca75d2b94e25a667bdbe3', 'feed.brand.farmina_nd',                   'feed', 'N&D',                    'N&D Natural & Delicious', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('42ee8820999d301d6de9777473f31fbd', 'feed.brand.farmina_vet_life',             'feed', '벳라이프',               'Vet Life',              NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('d652b3d57fdcb0c8b54a648c42cb4c39', 'feed.brand.farmina_team_breeder',         'feed', '팀브리더',               'Team Breeder',          NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('8f288fbec674e42f9315a29923365cc7', 'feed.brand.ziwi_air_dried',               'feed', '에어드라이드',           'Air-Dried',             NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('2defa7c14c74c85c95260411e409190d', 'feed.brand.ziwi_canned',                  'feed', '캔드',                   'Canned',                NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('32c9b412f691ad02213660c9427382f2', 'feed.brand.instinct_original',            'feed', '오리지널',               'Original',              NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('85340e19e4ddc4e1ac9179f4408678e3', 'feed.brand.instinct_raw_boost',           'feed', '로부스트',               'Raw Boost',             NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('c813a11840867a5a9b3ecf23dc50fa9a', 'feed.brand.instinct_limited_ingredient',  'feed', '리미티드 인그리디언트',  'Limited Ingredient',    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('1dcaca4e23b6efd565d8a9ebaa45bff1', 'feed.brand.stella_fd_raw',                'feed', '프리즈드라이 로우',      'Freeze-Dried Raw',      NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('0d4d412418939b566ea9a1b211f4927b', 'feed.brand.stella_stews',                 'feed', '스튜',                   'Stews',                 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('4fa8bd9a12dfee7edb78f94242ac9e8c', 'feed.brand.stella_meal_mixers',           'feed', '밀믹서',                 'Meal Mixers',           NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('c3b24a34f107931769f3ca3270fa4aad', 'feed.brand.open_farm_dry',                'feed', '드라이 푸드',            'Dry Food',              NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('5bd9cc532f77786e241df93836cc1297', 'feed.brand.open_farm_wet',                'feed', '웻 푸드',                'Wet Food',              NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('b81fc828812d1ea0719d02dc61998c21', 'feed.brand.open_farm_fd_raw',             'feed', '프리즈드라이 로우',      'Freeze-Dried Raw',      NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('2db11af3d3b6d25f294dbf8167e0bc42', 'feed.brand.wellness_complete_health',     'feed', '컴플리트 헬스',          'Complete Health',       NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('6e4c8cf9d535a45c94db4f35110ecd45', 'feed.brand.wellness_core',                'feed', '코어',                   'CORE',                  NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('4587ab22793f82a94990d13d44c12b91', 'feed.brand.wellness_simple',              'feed', '심플',                   'Simple',                NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('d345a80718110cbaa108677d6f749844', 'feed.brand.totw_dry',                     'feed', '드라이',                 'Dry',                   NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-03-10 12:00:00', '2026-03-10 12:00:00'),
  ('1b6308e4d71fb8b54e38b9812ee7e001', 'feed.brand.totw_wet',                     'feed', '웻',                     'Wet',                   NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-03-10 12:00:00', '2026-03-10 12:00:00')
ON CONFLICT (key) DO NOTHING;
