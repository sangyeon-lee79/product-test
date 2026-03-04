-- Migration 0004: Guardian 프로필 + 펫 (S6)
-- D1(SQLite) 호환 — LLD §4.3
-- 변경 순서: user_profiles → pets → pet_diseases

-- ─────────────────────────────────────────────────────────
-- S6-1: user_profiles (Guardian 프로필, users 1:1)
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_profiles (
    id                  TEXT PRIMARY KEY,
    user_id             TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    handle              TEXT UNIQUE,                        -- @handle (NULL 허용, 이후 설정)
    display_name        TEXT,
    avatar_url          TEXT,
    bio                 TEXT,
    bio_translations    TEXT NOT NULL DEFAULT '{}',         -- JSON {"en":"...","ja":"..."}
    country_id          TEXT REFERENCES countries(id),
    language            TEXT NOT NULL DEFAULT 'ko',
    timezone            TEXT NOT NULL DEFAULT 'Asia/Seoul',
    interests           TEXT NOT NULL DEFAULT '[]',         -- JSON [master_item_id, ...]
    created_at          TEXT NOT NULL,
    updated_at          TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user   ON user_profiles(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_handle ON user_profiles(handle);

-- ─────────────────────────────────────────────────────────
-- S6-1: pets (펫 정보)
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pets (
    id              TEXT PRIMARY KEY,
    guardian_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    species         TEXT NOT NULL DEFAULT 'dog',    -- 'dog' | 'cat' | 'other'
    breed_id        TEXT REFERENCES master_items(id),
    birth_date      TEXT,                           -- YYYY-MM-DD
    gender          TEXT,                           -- 'male' | 'female' | 'unknown'
    weight_kg       REAL,
    is_neutered     INTEGER NOT NULL DEFAULT 0,     -- 0=false, 1=true
    microchip_no    TEXT,
    avatar_url      TEXT,
    status          TEXT NOT NULL DEFAULT 'active', -- 'active' | 'deleted'
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pets_guardian ON pets(guardian_id);

-- ─────────────────────────────────────────────────────────
-- S6-1: pet_diseases (펫-질병 연결, 복수 가능)
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pet_diseases (
    id              TEXT PRIMARY KEY,
    pet_id          TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    disease_id      TEXT NOT NULL REFERENCES master_items(id),
    diagnosed_at    TEXT,                           -- YYYY-MM-DD
    notes           TEXT,
    is_active       INTEGER NOT NULL DEFAULT 1,     -- 0=false, 1=true
    created_at      TEXT NOT NULL,
    UNIQUE(pet_id, disease_id)
);

CREATE INDEX IF NOT EXISTS idx_pet_diseases_pet ON pet_diseases(pet_id);

-- ─────────────────────────────────────────────────────────
-- S6-3: i18n 키 등록 (하드코딩 제로 원칙 — UI 전에 키 등록)
-- page: guardian.profile / guardian.pet
-- ─────────────────────────────────────────────────────────

INSERT OR IGNORE INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at) VALUES
-- Guardian 프로필 페이지
('i18n-gp-001', 'guardian.profile.title',             'guardian.profile', '내 프로필',          'My Profile',           'マイプロフィール',              '我的资料',            '我的資料',         'Mi perfil',         'Mon profil',        'Mein Profil',          'Meu perfil',         'Hồ sơ của tôi',     'โปรไฟล์ของฉัน',        'Profil saya',       'ملفي الشخصي',       1, datetime('now'), datetime('now')),
('i18n-gp-002', 'guardian.profile.handle',            'guardian.profile', '핸들',               'Handle',               'ハンドル',                      '用户名',              '用戶名',           'Apodo',             'Pseudo',            'Benutzername',         'Apelido',            'Tên người dùng',    'ชื่อผู้ใช้',            'Nama pengguna',     'اسم المستخدم',      1, datetime('now'), datetime('now')),
('i18n-gp-003', 'guardian.profile.display_name',      'guardian.profile', '표시 이름',          'Display Name',         '表示名',                        '显示名称',            '顯示名稱',         'Nombre visible',    'Nom affiché',       'Anzeigename',          'Nome exibido',       'Tên hiển thị',      'ชื่อที่แสดง',           'Nama tampilan',     'الاسم المعروض',     1, datetime('now'), datetime('now')),
('i18n-gp-004', 'guardian.profile.bio',               'guardian.profile', '자기소개',           'Bio',                  '自己紹介',                      '个人简介',            '個人簡介',         'Biografía',         'Biographie',        'Biografie',            'Biografia',          'Giới thiệu',        'ข้อมูลส่วนตัว',         'Tentang saya',      'نبذة عني',          1, datetime('now'), datetime('now')),
('i18n-gp-005', 'guardian.profile.country',           'guardian.profile', '국가',               'Country',              '国',                            '国家',                '國家',             'País',              'Pays',              'Land',                 'País',               'Quốc gia',          'ประเทศ',               'Negara',            'الدولة',            1, datetime('now'), datetime('now')),
('i18n-gp-006', 'guardian.profile.language',          'guardian.profile', '언어',               'Language',             '言語',                          '语言',                '語言',             'Idioma',            'Langue',            'Sprache',              'Idioma',             'Ngôn ngữ',          'ภาษา',                 'Bahasa',            'اللغة',             1, datetime('now'), datetime('now')),
('i18n-gp-007', 'guardian.profile.interests',         'guardian.profile', '관심사',             'Interests',            '興味',                          '兴趣',                '興趣',             'Intereses',         'Intérêts',          'Interessen',           'Interesses',         'Sở thích',          'ความสนใจ',             'Minat',             'الاهتمامات',        1, datetime('now'), datetime('now')),
('i18n-gp-008', 'guardian.profile.save',              'guardian.profile', '저장',               'Save',                 '保存',                          '保存',                '儲存',             'Guardar',           'Enregistrer',       'Speichern',            'Salvar',             'Lưu',               'บันทึก',               'Simpan',            'حفظ',               1, datetime('now'), datetime('now')),
('i18n-gp-009', 'guardian.profile.handle_available',  'guardian.profile', '사용 가능한 핸들',   'Handle available',     '利用可能なハンドル',            '用户名可用',          '用戶名可用',       'Apodo disponible',  'Pseudo disponible', 'Benutzername verfügbar','Apelido disponível', 'Tên khả dụng',      'ชื่อผู้ใช้ว่าง',       'Nama tersedia',     'الاسم متاح',        1, datetime('now'), datetime('now')),
('i18n-gp-010', 'guardian.profile.handle_taken',      'guardian.profile', '이미 사용 중인 핸들','Handle taken',          '既に使用中のハンドル',          '用户名已被使用',      '用戶名已被使用',   'Apodo no disponible','Pseudo indisponible','Benutzername vergeben',  'Apelido indisponível','Tên đã được dùng',  'ชื่อผู้ใช้ถูกใช้แล้ว', 'Nama sudah dipakai','الاسم مستخدم',      1, datetime('now'), datetime('now')),
-- 펫 관리 페이지
('i18n-pet-001', 'guardian.pet.title',                'guardian.pet', '내 반려동물',           'My Pets',              'わたしのペット',                '我的宠物',            '我的寵物',         'Mis mascotas',      'Mes animaux',       'Meine Haustiere',      'Meus pets',          'Thú cưng của tôi',  'สัตว์เลี้ยงของฉัน',    'Hewan peliharaan',  'حيواناتي الأليفة',  1, datetime('now'), datetime('now')),
('i18n-pet-002', 'guardian.pet.add',                  'guardian.pet', '반려동물 추가',         'Add Pet',              'ペットを追加',                  '添加宠物',            '新增寵物',         'Agregar mascota',   'Ajouter un animal', 'Haustier hinzufügen',  'Adicionar pet',      'Thêm thú cưng',     'เพิ่มสัตว์เลี้ยง',    'Tambah hewan',      'إضافة حيوان',       1, datetime('now'), datetime('now')),
('i18n-pet-003', 'guardian.pet.name',                 'guardian.pet', '이름',                  'Name',                 '名前',                          '名字',                '名字',             'Nombre',            'Nom',               'Name',                 'Nome',               'Tên',               'ชื่อ',                 'Nama',              'الاسم',             1, datetime('now'), datetime('now')),
('i18n-pet-004', 'guardian.pet.species',              'guardian.pet', '종류',                  'Species',              '種類',                          '种类',                '種類',             'Especie',           'Espèce',            'Art',                  'Espécie',            'Loài',              'ประเภท',               'Jenis',             'النوع',             1, datetime('now'), datetime('now')),
('i18n-pet-005', 'guardian.pet.breed',                'guardian.pet', '품종',                  'Breed',                '犬種',                          '品种',                '品種',             'Raza',              'Race',              'Rasse',                'Raça',               'Giống',             'สายพันธุ์',            'Ras',               'السلالة',           1, datetime('now'), datetime('now')),
('i18n-pet-006', 'guardian.pet.birth_date',           'guardian.pet', '생년월일',              'Date of Birth',        '生年月日',                      '生日',                '生日',             'Fecha de nacimiento','Date de naissance', 'Geburtsdatum',         'Data de nascimento', 'Ngày sinh',         'วันเกิด',              'Tanggal lahir',     'تاريخ الميلاد',     1, datetime('now'), datetime('now')),
('i18n-pet-007', 'guardian.pet.gender',               'guardian.pet', '성별',                  'Gender',               '性別',                          '性别',                '性別',             'Género',            'Genre',             'Geschlecht',           'Gênero',             'Giới tính',         'เพศ',                  'Jenis kelamin',     'الجنس',             1, datetime('now'), datetime('now')),
('i18n-pet-008', 'guardian.pet.weight',               'guardian.pet', '체중 (kg)',             'Weight (kg)',          '体重 (kg)',                     '体重 (kg)',           '體重 (kg)',        'Peso (kg)',         'Poids (kg)',        'Gewicht (kg)',         'Peso (kg)',          'Cân nặng (kg)',     'น้ำหนัก (kg)',         'Berat (kg)',        'الوزن (كجم)',       1, datetime('now'), datetime('now')),
('i18n-pet-009', 'guardian.pet.neutered',             'guardian.pet', '중성화 여부',           'Neutered',             '去勢/避妊',                     '是否绝育',            '是否結紮',         'Esterilizado',      'Stérilisé',        'Kastriert',            'Castrado',           'Đã triệt sản',      'ทำหมัน',               'Dikebiri',          'تعقيم',             1, datetime('now'), datetime('now')),
('i18n-pet-010', 'guardian.pet.microchip',            'guardian.pet', '마이크로칩 번호',       'Microchip No.',        'マイクロチップ番号',            '芯片号码',            '晶片號碼',         'Núm. microchip',    'N° micropuce',      'Microchip-Nr.',        'Nº microchip',       'Số chip',           'หมายเลขไมโครชิป',     'No. microchip',     'رقم الرقاقة',       1, datetime('now'), datetime('now')),
('i18n-pet-011', 'guardian.pet.diseases',             'guardian.pet', '지병',                  'Diseases',             '持病',                          '疾病',                '疾病',             'Enfermedades',      'Maladies',          'Krankheiten',          'Doenças',            'Bệnh',              'โรค',                  'Penyakit',          'الأمراض',           1, datetime('now'), datetime('now')),
('i18n-pet-012', 'guardian.pet.dog',                  'guardian.pet', '강아지',                'Dog',                  '犬',                            '狗',                  '狗',               'Perro',             'Chien',             'Hund',                 'Cachorro',           'Chó',               'สุนัข',                'Anjing',            'كلب',               1, datetime('now'), datetime('now')),
('i18n-pet-013', 'guardian.pet.cat',                  'guardian.pet', '고양이',                'Cat',                  '猫',                            '猫',                  '貓',               'Gato',              'Chat',              'Katze',                'Gato',               'Mèo',               'แมว',                  'Kucing',            'قطة',               1, datetime('now'), datetime('now')),
('i18n-pet-014', 'guardian.pet.other',                'guardian.pet', '기타',                  'Other',                'その他',                        '其他',                '其他',             'Otro',              'Autre',             'Andere',               'Outro',              'Khác',              'อื่นๆ',                'Lainnya',           'أخرى',              1, datetime('now'), datetime('now')),
('i18n-pet-015', 'guardian.pet.male',                 'guardian.pet', '수컷',                  'Male',                 'オス',                          '公',                  '公',               'Macho',             'Mâle',              'Männlich',             'Macho',              'Đực',               'เพศผู้',               'Jantan',            'ذكر',               1, datetime('now'), datetime('now')),
('i18n-pet-016', 'guardian.pet.female',               'guardian.pet', '암컷',                  'Female',               'メス',                          '母',                  '母',               'Hembra',            'Femelle',           'Weiblich',             'Fêmea',              'Cái',               'เพศเมีย',              'Betina',            'أنثى',              1, datetime('now'), datetime('now')),
('i18n-pet-017', 'guardian.pet.save',                 'guardian.pet', '저장',                  'Save',                 '保存',                          '保存',                '儲存',             'Guardar',           'Enregistrer',       'Speichern',            'Salvar',             'Lưu',               'บันทึก',               'Simpan',            'حفظ',               1, datetime('now'), datetime('now')),
('i18n-pet-018', 'guardian.pet.delete',               'guardian.pet', '삭제',                  'Delete',               '削除',                          '删除',                '刪除',             'Eliminar',          'Supprimer',         'Löschen',              'Excluir',            'Xóa',               'ลบ',                   'Hapus',             'حذف',               1, datetime('now'), datetime('now')),
('i18n-pet-019', 'guardian.pet.no_pets',              'guardian.pet', '등록된 반려동물이 없습니다','No pets registered',  'ペットが登録されていません',    '没有注册宠物',        '尚未登錄寵物',     'Sin mascotas',      'Aucun animal',      'Keine Haustiere',      'Sem pets',           'Chưa có thú cưng',  'ยังไม่มีสัตว์เลี้ยง', 'Belum ada hewan',   'لا توجد حيوانات',   1, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0004_guardian_pet');
