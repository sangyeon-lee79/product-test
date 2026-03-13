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
