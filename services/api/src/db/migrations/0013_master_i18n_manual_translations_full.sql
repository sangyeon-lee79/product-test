-- Migration 0013: Master Data 수동 번역 2차 완성본 (0010 seed 전체 커버)
-- 목적: 0012 이후 남은 seed 항목을 사람 검수 번역으로 100% 채움

INSERT INTO i18n_translations (
  id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at
) VALUES
-- Category (remaining)
(lower(hex(randomblob(16))), 'master.medication_status', 'master', '복용 약물 상태', 'Medication Status', '服薬状態', '用药状态', '用藥狀態', 'Estado de medicación', 'Statut médicamenteux', 'Medikationsstatus', 'Status de medicação', 'Tình trạng dùng thuốc', 'สถานะการใช้ยา', 'Status pengobatan', 'حالة الدواء', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.weight_unit', 'master', '체중 단위', 'Weight Unit', '体重単位', '体重单位', '體重單位', 'Unidad de peso', 'Unité de poids', 'Gewichtseinheit', 'Unidade de peso', 'Đơn vị cân nặng', 'หน่วยน้ำหนัก', 'Satuan berat', 'وحدة الوزن', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.health_condition_level', 'master', '건강 상태 요약', 'Health Condition Level', '健康状態レベル', '健康状况等级', '健康狀況等級', 'Nivel de condición de salud', 'Niveau de condition de santé', 'Gesundheitszustand', 'Nível de condição de saúde', 'Mức độ tình trạng sức khỏe', 'ระดับสุขภาพ', 'Tingkat kondisi kesehatan', 'مستوى الحالة الصحية', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.activity_level', 'master', '활동량', 'Activity Level', '活動量', '活动量', '活動量', 'Nivel de actividad', 'Niveau d''activité', 'Aktivitätsniveau', 'Nível de atividade', 'Mức độ hoạt động', 'ระดับกิจกรรม', 'Tingkat aktivitas', 'مستوى النشاط', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.diet_type', 'master', '식사 유형', 'Diet Type', '食事タイプ', '饮食类型', '飲食類型', 'Tipo de dieta', 'Type d''alimentation', 'Ernährungsart', 'Tipo de dieta', 'Loại thức ăn', 'ประเภทอาหาร', 'Jenis makanan', 'نوع النظام الغذائي', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.living_style', 'master', '실내/실외 여부', 'Living Style', '飼育環境', '生活方式', '生活方式', 'Estilo de vida', 'Mode de vie', 'Lebensstil', 'Estilo de vida', 'Môi trường sống', 'รูปแบบการอยู่อาศัย', 'Gaya hidup', 'نمط المعيشة', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.ownership_type', 'master', '보호 상태/입양 형태', 'Ownership Type', '飼育形態', '饲养类型', '飼養類型', 'Tipo de tenencia', 'Type de prise en charge', 'Haltungsart', 'Tipo de guarda', 'Hình thức chăm sóc', 'รูปแบบการดูแล', 'Jenis kepemilikan', 'نوع الرعاية', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.coat_length', 'master', '털 길이', 'Coat Length', '被毛の長さ', '毛发长度', '毛髮長度', 'Longitud del pelaje', 'Longueur du pelage', 'Felllänge', 'Comprimento da pelagem', 'Độ dài lông', 'ความยาวขน', 'Panjang bulu', 'طول الفراء', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.coat_type', 'master', '털 타입', 'Coat Type', '被毛タイプ', '毛发类型', '毛髮類型', 'Tipo de pelaje', 'Type de pelage', 'Felltyp', 'Tipo de pelagem', 'Kiểu lông', 'ประเภทขน', 'Jenis bulu', 'نوع الفراء', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.grooming_cycle', 'master', '미용 주기', 'Grooming Cycle', 'グルーミング周期', '美容周期', '美容週期', 'Frecuencia de peluquería', 'Cycle de toilettage', 'Pflegeintervall', 'Ciclo de tosa', 'Chu kỳ chăm sóc lông', 'รอบการตัดแต่งขน', 'Siklus grooming', 'دورة العناية', 1, datetime('now'), datetime('now')),

-- Medication Status
(lower(hex(randomblob(16))), 'master.medication_status.none', 'master', '없음', 'None', 'なし', '无', '無', 'Ninguno', 'Aucun', 'Keine', 'Nenhum', 'Không', 'ไม่มี', 'Tidak ada', 'لا يوجد', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.medication_status.ongoing', 'master', '복용 중', 'Ongoing', '服用中', '持续用药', '持續用藥', 'En curso', 'En cours', 'Laufend', 'Em andamento', 'Đang dùng', 'กำลังใช้อยู่', 'Sedang berlangsung', 'مستمر', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.medication_status.temporary', 'master', '일시 복용', 'Temporary', '一時的', '临时', '臨時', 'Temporal', 'Temporaire', 'Vorübergehend', 'Temporário', 'Tạm thời', 'ชั่วคราว', 'Sementara', 'مؤقت', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.medication_status.as_needed', 'master', '필요 시', 'As Needed', '必要時', '按需', '按需', 'Según necesidad', 'Au besoin', 'Bei Bedarf', 'Conforme necessário', 'Khi cần', 'ตามความจำเป็น', 'Sesuai kebutuhan', 'عند الحاجة', 1, datetime('now'), datetime('now')),

-- Weight Unit
(lower(hex(randomblob(16))), 'master.weight_unit.kg', 'master', '킬로그램', 'kg', 'kg', '千克', '公斤', 'kg', 'kg', 'kg', 'kg', 'kg', 'กก.', 'kg', 'كغ', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.weight_unit.lb', 'master', '파운드', 'lb', 'lb', '磅', '磅', 'lb', 'lb', 'lb', 'lb', 'lb', 'ปอนด์', 'lb', 'رطل', 1, datetime('now'), datetime('now')),

-- Health Condition Level
(lower(hex(randomblob(16))), 'master.health_condition_level.healthy', 'master', '건강함', 'Healthy', '健康', '健康', '健康', 'Saludable', 'En bonne santé', 'Gesund', 'Saudável', 'Khỏe mạnh', 'สุขภาพดี', 'Sehat', 'صحي', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.health_condition_level.monitoring', 'master', '관찰 필요', 'Monitoring', '経過観察', '需观察', '需觀察', 'Monitoreo', 'Sous surveillance', 'Beobachtung', 'Monitoramento', 'Cần theo dõi', 'ต้องติดตาม', 'Perlu dipantau', 'تحت المراقبة', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.health_condition_level.needs_care', 'master', '관리 필요', 'Needs Care', '要ケア', '需护理', '需護理', 'Necesita cuidado', 'Nécessite des soins', 'Pflegebedürftig', 'Precisa de cuidados', 'Cần chăm sóc', 'ต้องดูแล', 'Perlu perawatan', 'يحتاج رعاية', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.health_condition_level.chronic_condition', 'master', '만성 질환', 'Chronic Condition', '慢性疾患', '慢性病', '慢性病', 'Condición crónica', 'Affection chronique', 'Chronische Erkrankung', 'Condição crônica', 'Bệnh mạn tính', 'ภาวะเรื้อรัง', 'Kondisi kronis', 'حالة مزمنة', 1, datetime('now'), datetime('now')),

-- Activity Level
(lower(hex(randomblob(16))), 'master.activity_level.low', 'master', '낮음', 'Low', '低い', '低', '低', 'Bajo', 'Faible', 'Niedrig', 'Baixo', 'Thấp', 'ต่ำ', 'Rendah', 'منخفض', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.activity_level.normal', 'master', '보통', 'Normal', '普通', '正常', '正常', 'Normal', 'Normal', 'Normal', 'Normal', 'Bình thường', 'ปกติ', 'Normal', 'طبيعي', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.activity_level.high', 'master', '높음', 'High', '高い', '高', '高', 'Alto', 'Élevé', 'Hoch', 'Alto', 'Cao', 'สูง', 'Tinggi', 'مرتفع', 1, datetime('now'), datetime('now')),

-- Diet Type
(lower(hex(randomblob(16))), 'master.diet_type.dry_food', 'master', '건식 사료', 'Dry Food', 'ドライフード', '干粮', '乾糧', 'Comida seca', 'Nourriture sèche', 'Trockenfutter', 'Ração seca', 'Thức ăn khô', 'อาหารแห้ง', 'Makanan kering', 'طعام جاف', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.diet_type.wet_food', 'master', '습식 사료', 'Wet Food', 'ウェットフード', '湿粮', '濕糧', 'Comida húmeda', 'Nourriture humide', 'Nassfutter', 'Ração úmida', 'Thức ăn ướt', 'อาหารเปียก', 'Makanan basah', 'طعام رطب', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.diet_type.raw_food', 'master', '생식', 'Raw Food', '生食', '生食', '生食', 'Comida cruda', 'Alimentation crue', 'Rohfutter', 'Comida crua', 'Thức ăn sống', 'อาหารดิบ', 'Makanan mentah', 'طعام نيء', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.diet_type.prescription_diet', 'master', '처방식', 'Prescription Diet', '療法食', '处方粮', '處方糧', 'Dieta prescrita', 'Alimentation thérapeutique', 'Diätfutter', 'Dieta terapêutica', 'Thức ăn theo chỉ định', 'อาหารตามใบสั่ง', 'Diet resep', 'نظام غذائي علاجي', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.diet_type.mixed', 'master', '혼합식', 'Mixed', 'ミックス', '混合', '混合', 'Mixto', 'Mixte', 'Gemischt', 'Misto', 'Hỗn hợp', 'แบบผสม', 'Campuran', 'مختلط', 1, datetime('now'), datetime('now')),

-- Living Style
(lower(hex(randomblob(16))), 'master.living_style.indoor', 'master', '실내', 'Indoor', '室内', '室内', '室內', 'Interior', 'Intérieur', 'Innenhaltung', 'Interno', 'Trong nhà', 'ในร่ม', 'Dalam ruangan', 'داخلي', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.living_style.outdoor', 'master', '실외', 'Outdoor', '屋外', '室外', '室外', 'Exterior', 'Extérieur', 'Außenhaltung', 'Externo', 'Ngoài trời', 'กลางแจ้ง', 'Luar ruangan', 'خارجي', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.living_style.mixed', 'master', '혼합', 'Mixed', '混合', '混合', '混合', 'Mixto', 'Mixte', 'Gemischt', 'Misto', 'Kết hợp', 'แบบผสม', 'Campuran', 'مختلط', 1, datetime('now'), datetime('now')),

-- Ownership Type
(lower(hex(randomblob(16))), 'master.ownership_type.owned', 'master', '보호 중', 'Owned', '飼育中', '已饲养', '已飼養', 'Propio', 'Possédé', 'Eigentum', 'Próprio', 'Đang nuôi', 'เป็นเจ้าของ', 'Milik sendiri', 'مملوك', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.ownership_type.fostered', 'master', '임시 보호', 'Fostered', '一時預かり', '临时寄养', '臨時寄養', 'Acogido temporalmente', 'Accueil temporaire', 'Pflege', 'Lar temporário', 'Chăm sóc tạm thời', 'อุปถัมภ์ชั่วคราว', 'Asuh sementara', 'رعاية مؤقتة', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.ownership_type.rescued', 'master', '구조됨', 'Rescued', '保護済み', '已救助', '已救助', 'Rescatado', 'Secouru', 'Gerettet', 'Resgatado', 'Được cứu hộ', 'ได้รับการช่วยเหลือ', 'Diselamatkan', 'تم إنقاذه', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.ownership_type.temporary_care', 'master', '임시 돌봄', 'Temporary Care', '一時ケア', '临时照护', '臨時照護', 'Cuidado temporal', 'Soins temporaires', 'Temporäre Betreuung', 'Cuidados temporários', 'Chăm sóc tạm thời', 'ดูแลชั่วคราว', 'Perawatan sementara', 'رعاية مؤقتة', 1, datetime('now'), datetime('now')),

-- Coat Length
(lower(hex(randomblob(16))), 'master.coat_length.hairless', 'master', '무모', 'Hairless', '無毛', '无毛', '無毛', 'Sin pelo', 'Sans poil', 'Haarlos', 'Sem pelo', 'Không lông', 'ไร้ขน', 'Tanpa bulu', 'عديم الشعر', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.coat_length.short', 'master', '단모', 'Short', '短毛', '短毛', '短毛', 'Corto', 'Court', 'Kurz', 'Curto', 'Lông ngắn', 'ขนสั้น', 'Pendek', 'قصير', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.coat_length.medium', 'master', '중모', 'Medium', '中毛', '中毛', '中毛', 'Medio', 'Moyen', 'Mittel', 'Médio', 'Lông trung bình', 'ขนปานกลาง', 'Sedang', 'متوسط', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.coat_length.long', 'master', '장모', 'Long', '長毛', '长毛', '長毛', 'Largo', 'Long', 'Lang', 'Longo', 'Lông dài', 'ขนยาว', 'Panjang', 'طويل', 1, datetime('now'), datetime('now')),

-- Coat Type
(lower(hex(randomblob(16))), 'master.coat_type.straight', 'master', '직모', 'Straight', '直毛', '直毛', '直毛', 'Liso', 'Droit', 'Glatt', 'Liso', 'Lông thẳng', 'ขนตรง', 'Lurus', 'مستقيم', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.coat_type.curly', 'master', '곱슬', 'Curly', '巻き毛', '卷毛', '捲毛', 'Rizado', 'Frisé', 'Lockig', 'Cacheado', 'Lông xoăn', 'ขนหยิก', 'Keriting', 'مجعد', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.coat_type.double_coat', 'master', '이중모', 'Double Coat', 'ダブルコート', '双层被毛', '雙層被毛', 'Doble capa', 'Double pelage', 'Doppelfell', 'Pelagem dupla', 'Lông hai lớp', 'ขนสองชั้น', 'Bulu ganda', 'فراء مزدوج', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.coat_type.wiry', 'master', '강모', 'Wiry', '剛毛', '刚毛', '剛毛', 'Áspero', 'Rêche', 'Drahthaarig', 'Áspero', 'Lông cứng', 'ขนแข็ง', 'Bulu kasar', 'خشن', 1, datetime('now'), datetime('now')),

-- Grooming Cycle
(lower(hex(randomblob(16))), 'master.grooming_cycle.weekly', 'master', '매주', 'Weekly', '毎週', '每周', '每週', 'Semanal', 'Hebdomadaire', 'Wöchentlich', 'Semanal', 'Hàng tuần', 'รายสัปดาห์', 'Mingguan', 'أسبوعي', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.grooming_cycle.biweekly', 'master', '격주', 'Biweekly', '隔週', '每两周', '每兩週', 'Quincenal', 'Bimensuel', 'Zweiwöchentlich', 'Quinzenal', 'Hai tuần một lần', 'ทุกสองสัปดาห์', 'Dua mingguan', 'كل أسبوعين', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.grooming_cycle.monthly', 'master', '매월', 'Monthly', '毎月', '每月', '每月', 'Mensual', 'Mensuel', 'Monatlich', 'Mensal', 'Hàng tháng', 'รายเดือน', 'Bulanan', 'شهري', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.grooming_cycle.as_needed', 'master', '필요 시', 'As Needed', '必要時', '按需', '按需', 'Según necesidad', 'Au besoin', 'Bei Bedarf', 'Conforme necessário', 'Khi cần', 'ตามความจำเป็น', 'Sesuai kebutuhan', 'عند الحاجة', 1, datetime('now'), datetime('now'))
ON CONFLICT(key) DO UPDATE SET
  ko = excluded.ko,
  en = excluded.en,
  ja = excluded.ja,
  zh_cn = excluded.zh_cn,
  zh_tw = excluded.zh_tw,
  es = excluded.es,
  fr = excluded.fr,
  de = excluded.de,
  pt = excluded.pt,
  vi = excluded.vi,
  th = excluded.th,
  id_lang = excluded.id_lang,
  ar = excluded.ar,
  updated_at = datetime('now');

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0013_master_i18n_manual_translations_full');
