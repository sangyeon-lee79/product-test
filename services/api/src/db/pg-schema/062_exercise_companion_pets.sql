-- 062: Exercise companion pets + modal UI i18n keys
-- Depends on: 057_exercise_logs.sql

-- ── 1. Add companion_pet_ids column ─────────────────────────────────────────
ALTER TABLE pet_exercise_logs
  ADD COLUMN IF NOT EXISTS companion_pet_ids JSONB DEFAULT '[]'::jsonb;

-- ── 2. i18n: new UI keys for exercise modal enhancements ──────────────────
INSERT INTO i18n_translations (id, key, page, is_active,
  ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar,
  created_at, updated_at)
VALUES
  ('i18n-ex-ui-companion-search', 'guardian.exercise.companion_search', 'guardian', true,
   '친구 반려동물 검색...', 'Search friend''s pet...', '友達のペットを検索...', '搜索好友宠物...', '搜尋好友寵物...',
   'Buscar mascota de amigo...', 'Chercher animal d''ami...', 'Haustier eines Freundes suchen...', 'Buscar pet de amigo....',
   'Tìm thú cưng bạn bè...', 'ค้นหาสัตว์เลี้ยงของเพื่อน...', 'Cari hewan teman...', 'البحث عن حيوان صديق...',
   NOW(), NOW()),
  ('i18n-ex-ui-no-friends', 'guardian.exercise.no_friends', 'guardian', true,
   '연결된 친구가 없습니다', 'No connected friends', '接続された友達がいません', '没有好友', '沒有好友',
   'Sin amigos conectados', 'Aucun ami connecté', 'Keine verbundenen Freunde', 'Sem amigos conectados',
   'Không có bạn bè kết nối', 'ไม่มีเพื่อนที่เชื่อมต่อ', 'Tidak ada teman terhubung', 'لا يوجد أصدقاء متصلون',
   NOW(), NOW()),
  ('i18n-ex-ui-map-coming', 'guardian.exercise.map_coming_soon', 'guardian', true,
   '지도 검색 (준비 중)', 'Map Search (Coming Soon)', 'マップ検索（近日公開）', '地图搜索（即将推出）', '地圖搜尋（即將推出）',
   'Búsqueda en mapa (Próximamente)', 'Recherche sur carte (Bientôt)', 'Kartensuche (Demnächst)', 'Busca no mapa (Em breve)',
   'Tìm trên bản đồ (Sắp ra mắt)', 'ค้นหาแผนที่ (เร็วๆ นี้)', 'Cari peta (Segera)', 'البحث على الخريطة (قريبًا)',
   NOW(), NOW()),
  ('i18n-ex-ui-duration-unit', 'guardian.exercise.duration_unit', 'guardian', true,
   '분', 'min', '分', '分钟', '分鐘',
   'min', 'min', 'Min', 'min',
   'phút', 'นาที', 'mnt', 'دقيقة',
   NOW(), NOW()),
  ('i18n-ex-ui-companion-pets', 'guardian.exercise.companion_pets', 'guardian', true,
   '함께 운동한 반려동물', 'Companion Pets', '一緒に運動したペット', '同伴宠物', '同伴寵物',
   'Mascotas compañeras', 'Animaux compagnons', 'Begleittiere', 'Pets companheiros',
   'Thú cưng đồng hành', 'สัตว์เลี้ยงร่วม', 'Hewan pendamping', 'حيوانات مرافقة',
   NOW(), NOW()),
  ('i18n-ex-ui-companion-remove', 'guardian.exercise.companion_remove', 'guardian', true,
   '제거', 'Remove', '削除', '移除', '移除',
   'Eliminar', 'Supprimer', 'Entfernen', 'Remover',
   'Xóa', 'ลบ', 'Hapus', 'إزالة',
   NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
