-- 0057_admin_feed_mgmt_i18n_additional_keys.sql
-- Additional i18n keys for feed management UI hardcoded-text removal

INSERT OR IGNORE INTO i18n_translations (
  id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at
) VALUES
  (
    lower(hex(randomblob(16))),
    'admin.feed.none',
    'admin',
    '없음',
    'None',
    'なし',
    '无',
    '無',
    'Ninguno',
    'Aucun',
    'Keine',
    'Nenhum',
    'Không có',
    'ไม่มี',
    'Tidak ada',
    'لا يوجد',
    1,
    datetime('now'),
    datetime('now')
  ),
  (
    lower(hex(randomblob(16))),
    'admin.feed.country_placeholder',
    'admin',
    '국가 코드 (예: KR)',
    'Country code (e.g. KR)',
    '国コード（例: KR）',
    '国家代码（例如：KR）',
    '國家代碼（例如：KR）',
    'Código de país (ej.: KR)',
    'Code pays (ex. : KR)',
    'Ländercode (z. B. KR)',
    'Código do país (ex.: KR)',
    'Mã quốc gia (ví dụ: KR)',
    'รหัสประเทศ (เช่น KR)',
    'Kode negara (mis: KR)',
    'رمز الدولة (مثال: KR)',
    1,
    datetime('now'),
    datetime('now')
  ),
  (
    lower(hex(randomblob(16))),
    'admin.feed.err_name_ko_required',
    'admin',
    '한국어 이름을 입력해주세요.',
    'Please enter a Korean name.',
    '韓国語名を入力してください。',
    '请输入韩文名称。',
    '請輸入韓文名稱。',
    'Ingrese el nombre en coreano.',
    'Veuillez saisir le nom coréen.',
    'Bitte geben Sie den koreanischen Namen ein.',
    'Informe o nome em coreano.',
    'Vui lòng nhập tên tiếng Hàn.',
    'กรุณากรอกชื่อภาษาเกาหลี',
    'Masukkan nama Korea.',
    'يرجى إدخال الاسم الكوري.',
    1,
    datetime('now'),
    datetime('now')
  );
