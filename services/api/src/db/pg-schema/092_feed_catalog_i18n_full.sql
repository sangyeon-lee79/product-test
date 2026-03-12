-- 092: Feed catalog i18n — 048에서 ko/en만 있던 제조사(8)+브랜드(23) 총 31 키에 13개국어 보충
-- 브랜드명은 고유명사이므로 대부분 원어 유지, 한중일 음역 제공

-- ===== MANUFACTURERS (8) =====
UPDATE i18n_translations SET
  ja = 'ピュリナ', zh_cn = '普瑞纳', zh_tw = '普瑞納',
  es = 'Purina', fr = 'Purina', de = 'Purina', pt = 'Purina',
  vi = 'Purina', th = 'เพียวริน่า', id_lang = 'Purina', ar = 'بورينا',
  updated_at = NOW()
WHERE key = 'feed.manufacturer.purina' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'ファルミナ', zh_cn = 'Farmina', zh_tw = 'Farmina',
  es = 'Farmina', fr = 'Farmina', de = 'Farmina', pt = 'Farmina',
  vi = 'Farmina', th = 'ฟาร์มิน่า', id_lang = 'Farmina', ar = 'فارمينا',
  updated_at = NOW()
WHERE key = 'feed.manufacturer.farmina' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'ジウィピーク', zh_cn = 'Ziwi Peak', zh_tw = 'Ziwi Peak',
  es = 'Ziwi Peak', fr = 'Ziwi Peak', de = 'Ziwi Peak', pt = 'Ziwi Peak',
  vi = 'Ziwi Peak', th = 'ซีวี่พีค', id_lang = 'Ziwi Peak', ar = 'زيوي بيك',
  updated_at = NOW()
WHERE key = 'feed.manufacturer.ziwi_peak' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'インスティンクト', zh_cn = 'Instinct', zh_tw = 'Instinct',
  es = 'Instinct', fr = 'Instinct', de = 'Instinct', pt = 'Instinct',
  vi = 'Instinct', th = 'อินสติงค์', id_lang = 'Instinct', ar = 'إنستينكت',
  updated_at = NOW()
WHERE key = 'feed.manufacturer.instinct' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'ステラ&チューイーズ', zh_cn = 'Stella & Chewy''s', zh_tw = 'Stella & Chewy''s',
  es = 'Stella & Chewy''s', fr = 'Stella & Chewy''s', de = 'Stella & Chewy''s', pt = 'Stella & Chewy''s',
  vi = 'Stella & Chewy''s', th = 'สเตลล่า แอนด์ ชิวอี้ส์', id_lang = 'Stella & Chewy''s', ar = 'ستيلا آند تشويز',
  updated_at = NOW()
WHERE key = 'feed.manufacturer.stella_chewys' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'オープンファーム', zh_cn = 'Open Farm', zh_tw = 'Open Farm',
  es = 'Open Farm', fr = 'Open Farm', de = 'Open Farm', pt = 'Open Farm',
  vi = 'Open Farm', th = 'โอเพ่นฟาร์ม', id_lang = 'Open Farm', ar = 'أوبن فارم',
  updated_at = NOW()
WHERE key = 'feed.manufacturer.open_farm' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'ウェルネス', zh_cn = 'Wellness', zh_tw = 'Wellness',
  es = 'Wellness', fr = 'Wellness', de = 'Wellness', pt = 'Wellness',
  vi = 'Wellness', th = 'เวลเนส', id_lang = 'Wellness', ar = 'ويلنس',
  updated_at = NOW()
WHERE key = 'feed.manufacturer.wellness' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'テイスト・オブ・ザ・ワイルド', zh_cn = 'Taste of the Wild', zh_tw = 'Taste of the Wild',
  es = 'Taste of the Wild', fr = 'Taste of the Wild', de = 'Taste of the Wild', pt = 'Taste of the Wild',
  vi = 'Taste of the Wild', th = 'เทสต์ออฟเดอะไวลด์', id_lang = 'Taste of the Wild', ar = 'تيست أوف ذا وايلد',
  updated_at = NOW()
WHERE key = 'feed.manufacturer.taste_of_the_wild' AND ja IS NULL;

-- ===== BRANDS (23) =====
-- Purina brands
UPDATE i18n_translations SET
  ja = 'プロプラン', zh_cn = 'Pro Plan', zh_tw = 'Pro Plan',
  es = 'Pro Plan', fr = 'Pro Plan', de = 'Pro Plan', pt = 'Pro Plan',
  vi = 'Pro Plan', th = 'โปรแพลน', id_lang = 'Pro Plan', ar = 'برو بلان',
  updated_at = NOW()
WHERE key = 'feed.brand.purina_pro_plan' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'ピュリナ ワン', zh_cn = 'Purina ONE', zh_tw = 'Purina ONE',
  es = 'Purina ONE', fr = 'Purina ONE', de = 'Purina ONE', pt = 'Purina ONE',
  vi = 'Purina ONE', th = 'เพียวริน่า วัน', id_lang = 'Purina ONE', ar = 'بورينا وان',
  updated_at = NOW()
WHERE key = 'feed.brand.purina_one' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'ファンシーフィースト', zh_cn = 'Fancy Feast', zh_tw = 'Fancy Feast',
  es = 'Fancy Feast', fr = 'Fancy Feast', de = 'Fancy Feast', pt = 'Fancy Feast',
  vi = 'Fancy Feast', th = 'แฟนซีฟีสต์', id_lang = 'Fancy Feast', ar = 'فانسي فيست',
  updated_at = NOW()
WHERE key = 'feed.brand.purina_fancy_feast' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'ビヨンド', zh_cn = 'Beyond', zh_tw = 'Beyond',
  es = 'Beyond', fr = 'Beyond', de = 'Beyond', pt = 'Beyond',
  vi = 'Beyond', th = 'บียอนด์', id_lang = 'Beyond', ar = 'بيوند',
  updated_at = NOW()
WHERE key = 'feed.brand.purina_beyond' AND ja IS NULL;

-- Farmina brands
UPDATE i18n_translations SET
  ja = 'N&D ナチュラル&デリシャス', zh_cn = 'N&D 天然美味', zh_tw = 'N&D 天然美味',
  es = 'N&D Natural & Delicious', fr = 'N&D Natural & Delicious', de = 'N&D Natural & Delicious', pt = 'N&D Natural & Delicious',
  vi = 'N&D Natural & Delicious', th = 'เอ็นแอนด์ดี', id_lang = 'N&D Natural & Delicious', ar = 'إن آند دي',
  updated_at = NOW()
WHERE key = 'feed.brand.farmina_nd' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'ベットライフ', zh_cn = '兽医生活', zh_tw = '獸醫生活',
  es = 'Vet Life', fr = 'Vet Life', de = 'Vet Life', pt = 'Vet Life',
  vi = 'Vet Life', th = 'เว็ทไลฟ์', id_lang = 'Vet Life', ar = 'فيت لايف',
  updated_at = NOW()
WHERE key = 'feed.brand.farmina_vet_life' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'チームブリーダー', zh_cn = 'Team Breeder', zh_tw = 'Team Breeder',
  es = 'Team Breeder', fr = 'Team Breeder', de = 'Team Breeder', pt = 'Team Breeder',
  vi = 'Team Breeder', th = 'ทีมบรีดเดอร์', id_lang = 'Team Breeder', ar = 'تيم بريدر',
  updated_at = NOW()
WHERE key = 'feed.brand.farmina_team_breeder' AND ja IS NULL;

-- Ziwi Peak brands
UPDATE i18n_translations SET
  ja = 'エアドライ', zh_cn = '风干', zh_tw = '風乾',
  es = 'Secado al aire', fr = 'Séché à l''air', de = 'Luftgetrocknet', pt = 'Secagem ao ar',
  vi = 'Sấy khô', th = 'อบแห้ง', id_lang = 'Kering Udara', ar = 'مجفف بالهواء',
  updated_at = NOW()
WHERE key = 'feed.brand.ziwi_air_dried' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = '缶詰', zh_cn = '罐头', zh_tw = '罐頭',
  es = 'Enlatado', fr = 'En conserve', de = 'Dose', pt = 'Enlatado',
  vi = 'Đồ hộp', th = 'กระป๋อง', id_lang = 'Kalengan', ar = 'معلب',
  updated_at = NOW()
WHERE key = 'feed.brand.ziwi_canned' AND ja IS NULL;

-- Instinct brands
UPDATE i18n_translations SET
  ja = 'オリジナル', zh_cn = '原味', zh_tw = '原味',
  es = 'Original', fr = 'Original', de = 'Original', pt = 'Original',
  vi = 'Original', th = 'ออริจินอล', id_lang = 'Original', ar = 'أوريجينال',
  updated_at = NOW()
WHERE key = 'feed.brand.instinct_original' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'ロウブースト', zh_cn = 'Raw Boost', zh_tw = 'Raw Boost',
  es = 'Raw Boost', fr = 'Raw Boost', de = 'Raw Boost', pt = 'Raw Boost',
  vi = 'Raw Boost', th = 'รอว์บูสต์', id_lang = 'Raw Boost', ar = 'رو بوست',
  updated_at = NOW()
WHERE key = 'feed.brand.instinct_raw_boost' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'リミテッド・イングリディエント', zh_cn = '限定原料', zh_tw = '限定原料',
  es = 'Ingrediente Limitado', fr = 'Ingrédient Limité', de = 'Begrenzte Zutaten', pt = 'Ingrediente Limitado',
  vi = 'Nguyên liệu hạn chế', th = 'ลิมิเต็ด อินกรีเดียนท์', id_lang = 'Bahan Terbatas', ar = 'مكونات محدودة',
  updated_at = NOW()
WHERE key = 'feed.brand.instinct_limited_ingredient' AND ja IS NULL;

-- Stella & Chewy's brands
UPDATE i18n_translations SET
  ja = 'フリーズドライ・ロウ', zh_cn = '冻干生食', zh_tw = '凍乾生食',
  es = 'Crudo Liofilizado', fr = 'Cru Lyophilisé', de = 'Gefriergetrocknet Roh', pt = 'Cru Liofilizado',
  vi = 'Sấy thăng hoa', th = 'ฟรีซดราย ดิบ', id_lang = 'Kering Beku Mentah', ar = 'مجفف بالتجميد خام',
  updated_at = NOW()
WHERE key = 'feed.brand.stella_fd_raw' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'シチュー', zh_cn = '炖菜', zh_tw = '燉菜',
  es = 'Guisos', fr = 'Ragoûts', de = 'Eintöpfe', pt = 'Ensopados',
  vi = 'Hầm', th = 'สตูว์', id_lang = 'Semur', ar = 'يخنة',
  updated_at = NOW()
WHERE key = 'feed.brand.stella_stews' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'ミールミキサー', zh_cn = '拌餐粉', zh_tw = '拌餐粉',
  es = 'Mezcladores de Comida', fr = 'Mélangeurs de Repas', de = 'Mahlzeitmischer', pt = 'Misturadores de Refeição',
  vi = 'Trộn cơm', th = 'มีลมิกเซอร์', id_lang = 'Pencampur Makanan', ar = 'خلاطات الوجبات',
  updated_at = NOW()
WHERE key = 'feed.brand.stella_meal_mixers' AND ja IS NULL;

-- Open Farm brands
UPDATE i18n_translations SET
  ja = 'ドライフード', zh_cn = '干粮', zh_tw = '乾糧',
  es = 'Alimento Seco', fr = 'Nourriture Sèche', de = 'Trockenfutter', pt = 'Ração Seca',
  vi = 'Thức ăn khô', th = 'อาหารเม็ด', id_lang = 'Makanan Kering', ar = 'طعام جاف',
  updated_at = NOW()
WHERE key = 'feed.brand.open_farm_dry' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'ウェットフード', zh_cn = '湿粮', zh_tw = '濕糧',
  es = 'Alimento Húmedo', fr = 'Nourriture Humide', de = 'Nassfutter', pt = 'Ração Úmida',
  vi = 'Thức ăn ướt', th = 'อาหารเปียก', id_lang = 'Makanan Basah', ar = 'طعام رطب',
  updated_at = NOW()
WHERE key = 'feed.brand.open_farm_wet' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'フリーズドライ・ロウ', zh_cn = '冻干生食', zh_tw = '凍乾生食',
  es = 'Crudo Liofilizado', fr = 'Cru Lyophilisé', de = 'Gefriergetrocknet Roh', pt = 'Cru Liofilizado',
  vi = 'Sấy thăng hoa', th = 'ฟรีซดราย ดิบ', id_lang = 'Kering Beku Mentah', ar = 'مجفف بالتجميد خام',
  updated_at = NOW()
WHERE key = 'feed.brand.open_farm_fd_raw' AND ja IS NULL;

-- Wellness brands
UPDATE i18n_translations SET
  ja = 'コンプリートヘルス', zh_cn = '完整健康', zh_tw = '完整健康',
  es = 'Salud Completa', fr = 'Santé Complète', de = 'Komplette Gesundheit', pt = 'Saúde Completa',
  vi = 'Sức khỏe hoàn chỉnh', th = 'คอมพลีทเฮลธ์', id_lang = 'Kesehatan Lengkap', ar = 'صحة كاملة',
  updated_at = NOW()
WHERE key = 'feed.brand.wellness_complete_health' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'コア', zh_cn = 'CORE', zh_tw = 'CORE',
  es = 'CORE', fr = 'CORE', de = 'CORE', pt = 'CORE',
  vi = 'CORE', th = 'คอร์', id_lang = 'CORE', ar = 'كور',
  updated_at = NOW()
WHERE key = 'feed.brand.wellness_core' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'シンプル', zh_cn = '简单', zh_tw = '簡單',
  es = 'Simple', fr = 'Simple', de = 'Simple', pt = 'Simple',
  vi = 'Simple', th = 'ซิมเปิล', id_lang = 'Simple', ar = 'سيمبل',
  updated_at = NOW()
WHERE key = 'feed.brand.wellness_simple' AND ja IS NULL;

-- Taste of the Wild brands
UPDATE i18n_translations SET
  ja = 'ドライ', zh_cn = '干粮', zh_tw = '乾糧',
  es = 'Seco', fr = 'Sec', de = 'Trocken', pt = 'Seco',
  vi = 'Khô', th = 'แห้ง', id_lang = 'Kering', ar = 'جاف',
  updated_at = NOW()
WHERE key = 'feed.brand.totw_dry' AND ja IS NULL;

UPDATE i18n_translations SET
  ja = 'ウェット', zh_cn = '湿粮', zh_tw = '濕糧',
  es = 'Húmedo', fr = 'Humide', de = 'Nass', pt = 'Úmido',
  vi = 'Ướt', th = 'เปียก', id_lang = 'Basah', ar = 'رطب',
  updated_at = NOW()
WHERE key = 'feed.brand.totw_wet' AND ja IS NULL;
