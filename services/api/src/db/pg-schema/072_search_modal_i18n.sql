-- 072_search_modal_i18n.sql — 사료/영양제/장비 추가 모달 검색 UI i18n

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES
-- Feed search
(gen_random_uuid(), 'guardian.feed.search_label', 'guardian', '사료명 검색', 'Search Feed', 'フード名検索', '搜索饲料', '搜尋飼料', 'Buscar alimento', 'Rechercher aliment', 'Futter suchen', 'Buscar ração', 'Tìm thức ăn', 'ค้นหาอาหาร', 'Cari Pakan', 'بحث طعام', true, NOW(), NOW()),
(gen_random_uuid(), 'guardian.feed.search_placeholder', 'guardian', '사료를 검색하세요...', 'Search for feed...', 'フードを検索...', '搜索饲料...', '搜尋飼料...', 'Buscar alimento...', 'Rechercher un aliment...', 'Futter suchen...', 'Buscar ração...', 'Tìm thức ăn...', 'ค้นหาอาหาร...', 'Cari pakan...', 'بحث عن طعام...', true, NOW(), NOW()),

-- Supplement search
(gen_random_uuid(), 'guardian.supplement.search_label', 'guardian', '영양제명 검색', 'Search Supplement', 'サプリメント名検索', '搜索营养品', '搜尋營養品', 'Buscar suplemento', 'Rechercher supplément', 'Ergänzung suchen', 'Buscar suplemento', 'Tìm thực phẩm chức năng', 'ค้นหาอาหารเสริม', 'Cari Suplemen', 'بحث مكمل', true, NOW(), NOW()),
(gen_random_uuid(), 'guardian.supplement.search_placeholder', 'guardian', '영양제를 검색하세요...', 'Search for supplement...', 'サプリメントを検索...', '搜索营养品...', '搜尋營養品...', 'Buscar suplemento...', 'Rechercher un supplément...', 'Ergänzung suchen...', 'Buscar suplemento...', 'Tìm thực phẩm chức năng...', 'ค้นหาอาหารเสริม...', 'Cari suplemen...', 'بحث عن مكمل...', true, NOW(), NOW()),

-- Device search
(gen_random_uuid(), 'guardian.device.search_label', 'guardian', '장비명 검색', 'Search Device', 'デバイス名検索', '搜索设备', '搜尋設備', 'Buscar dispositivo', 'Rechercher appareil', 'Gerät suchen', 'Buscar dispositivo', 'Tìm thiết bị', 'ค้นหาอุปกรณ์', 'Cari Perangkat', 'بحث جهاز', true, NOW(), NOW()),
(gen_random_uuid(), 'guardian.device.search_placeholder', 'guardian', '장비를 검색하세요...', 'Search for device...', 'デバイスを検索...', '搜索设备...', '搜尋設備...', 'Buscar dispositivo...', 'Rechercher un appareil...', 'Gerät suchen...', 'Buscar dispositivo...', 'Tìm thiết bị...', 'ค้นหาอุปกรณ์...', 'Cari perangkat...', 'بحث عن جهاز...', true, NOW(), NOW()),

-- Common
(gen_random_uuid(), 'guardian.catalog.no_results', 'guardian', '검색 결과가 없습니다', 'No results found', '検索結果なし', '无搜索结果', '無搜尋結果', 'Sin resultados', 'Aucun résultat', 'Keine Ergebnisse', 'Nenhum resultado', 'Không có kết quả', 'ไม่พบผลลัพธ์', 'Tidak ada hasil', 'لا توجد نتائج', true, NOW(), NOW()),
(gen_random_uuid(), 'guardian.catalog.loading_models', 'guardian', '제품 목록 불러오는 중...', 'Loading products...', '製品一覧を読み込み中...', '加载产品列表...', '載入產品列表...', 'Cargando productos...', 'Chargement des produits...', 'Produkte laden...', 'Carregando produtos...', 'Đang tải sản phẩm...', 'กำลังโหลดสินค้า...', 'Memuat produk...', 'جاري تحميل المنتجات...', true, NOW(), NOW())
ON CONFLICT (key) DO NOTHING;
