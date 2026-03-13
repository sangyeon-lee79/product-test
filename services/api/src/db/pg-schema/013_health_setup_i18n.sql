-- =============================================================================
-- 013: Health Setup Banner i18n keys (4 keys × 13 languages)
-- =============================================================================

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'health.setup.title', 'guardian', '장비·사료를 먼저 등록해주세요', 'Register your equipment & food first', '機器とフードを先に登録してください', '请先注册设备和食品', '請先註冊設備和食品', 'Registre primero su equipo y alimentos', 'Enregistrez d''abord votre équipement et nourriture', 'Registrieren Sie zuerst Ihre Geräte und Futter', 'Registre primeiro seus equipamentos e alimentos', 'Hãy đăng ký thiết bị và thức ăn trước', 'ลงทะเบียนอุปกรณ์และอาหารก่อน', 'Daftarkan peralatan & makanan terlebih dahulu', 'سجّل معداتك وطعامك أولاً')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'health.setup.desc', 'guardian', '등록 후 급여·약품 기록 시 자동 연결돼 더 정확해져요.', 'Records link automatically after registration.', '登録後、記録が自動的にリンクされます。', '注册后记录将自动关联。', '註冊後記錄將自動關聯。', 'Los registros se vinculan automáticamente después del registro.', 'Les enregistrements se lient automatiquement après l''inscription.', 'Einträge werden nach der Registrierung automatisch verknüpft.', 'Os registros são vinculados automaticamente após o cadastro.', 'Hồ sơ sẽ tự động liên kết sau khi đăng ký.', 'บันทึกจะเชื่อมต่ออัตโนมัติหลังลงทะเบียน', 'Catatan akan terhubung otomatis setelah pendaftaran.', 'ستُربط السجلات تلقائيًا بعد التسجيل.')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'health.setup.equip', 'guardian', '장비 등록', 'Equipment', '機器登録', '设备注册', '設備註冊', 'Equipo', 'Équipement', 'Geräte', 'Equipamento', 'Thiết bị', 'อุปกรณ์', 'Peralatan', 'المعدات')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'health.setup.food', 'guardian', '사료 등록', 'Food & Supplements', 'フード・サプリ登録', '食品与补充剂', '食品與補充劑', 'Alimentación', 'Alimentation', 'Futter & Ergänzungen', 'Ração e Suplementos', 'Thức ăn & Bổ sung', 'อาหารและอาหารเสริม', 'Makanan & Suplemen', 'الطعام والمكملات')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'health.setup.done_title', 'guardian', '장비·사료 관리', 'Equipment & Food', '機器・フード管理', '设备与食品管理', '設備與食品管理', 'Equipo y alimentos', 'Équipement et alimentation', 'Geräte & Futter', 'Equipamentos e alimentos', 'Thiết bị & Thức ăn', 'อุปกรณ์และอาหาร', 'Peralatan & Makanan', 'المعدات والطعام')
ON CONFLICT (key) DO NOTHING;

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
VALUES (gen_random_uuid()::text, 'health.setup.done_desc', 'guardian', '장비 {0}개 · 사료 {1}개 등록됨', '{0} devices · {1} feeds registered', '機器{0}件・フード{1}件登録済み', '已注册{0}个设备 · {1}个食品', '已註冊{0}個設備 · {1}個食品', '{0} equipos · {1} alimentos registrados', '{0} équipements · {1} aliments enregistrés', '{0} Geräte · {1} Futter registriert', '{0} equipamentos · {1} alimentos cadastrados', '{0} thiết bị · {1} thức ăn đã đăng ký', 'ลงทะเบียน {0} อุปกรณ์ · {1} อาหาร', '{0} peralatan · {1} makanan terdaftar', '{0} معدات · {1} طعام مسجل')
ON CONFLICT (key) DO NOTHING;
