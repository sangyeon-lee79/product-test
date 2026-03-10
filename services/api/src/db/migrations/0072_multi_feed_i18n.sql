-- 0072_multi_feed_i18n.sql
-- i18n keys for multi-feed mixing UI

INSERT OR IGNORE INTO i18n_translations (key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, created_at, updated_at)
VALUES
  ('guardian.feeding.mixed_feed', 'guardian',
   '혼합급여', 'Mixed Feed', '混合給餌', '混合喂食', '混合餵食',
   'Alimentación mixta', 'Alimentation mixte', 'Mischfütterung', 'Alimentação mista',
   'Cho ăn hỗn hợp', 'อาหารผสม', 'Pakan campuran', 'تغذية مختلطة',
   datetime('now'), datetime('now')),

  ('guardian.feeding.add_feed_row', 'guardian',
   '사료 추가', 'Add Feed', '飼料追加', '添加饲料', '添加飼料',
   'Añadir pienso', 'Ajouter aliment', 'Futter hinzufügen', 'Adicionar ração',
   'Thêm thức ăn', 'เพิ่มอาหาร', 'Tambah pakan', 'إضافة علف',
   datetime('now'), datetime('now')),

  ('guardian.feeding.remove_feed_row', 'guardian',
   '사료 삭제', 'Remove Feed', '飼料削除', '删除饲料', '刪除飼料',
   'Eliminar pienso', 'Supprimer aliment', 'Futter entfernen', 'Remover ração',
   'Xóa thức ăn', 'ลบอาหาร', 'Hapus pakan', 'حذف علف',
   datetime('now'), datetime('now')),

  ('guardian.feeding.ratio', 'guardian',
   '비율 (%)', 'Ratio (%)', '割合 (%)', '比例 (%)', '比例 (%)',
   'Proporción (%)', 'Proportion (%)', 'Anteil (%)', 'Proporção (%)',
   'Tỷ lệ (%)', 'สัดส่วน (%)', 'Rasio (%)', 'نسبة (%)',
   datetime('now'), datetime('now')),

  ('guardian.feeding.total_amount', 'guardian',
   '총 급여량', 'Total Amount', '合計給餌量', '总喂食量', '總餵食量',
   'Cantidad total', 'Quantité totale', 'Gesamtmenge', 'Quantidade total',
   'Tổng lượng', 'ปริมาณรวม', 'Total jumlah', 'الكمية الإجمالية',
   datetime('now'), datetime('now')),

  ('guardian.feeding.total_calories', 'guardian',
   '총 칼로리', 'Total Calories', '合計カロリー', '总卡路里', '總卡路里',
   'Calorías totales', 'Calories totales', 'Gesamtkalorien', 'Calorias totais',
   'Tổng calo', 'แคลอรี่รวม', 'Total kalori', 'إجمالي السعرات',
   datetime('now'), datetime('now')),

  ('nutrition.total', 'guardian',
   '총 영양 합계', 'Total Nutrition', '合計栄養', '总营养合计', '總營養合計',
   'Nutrición total', 'Nutrition totale', 'Gesamternährung', 'Nutrição total',
   'Tổng dinh dưỡng', 'โภชนาการรวม', 'Total nutrisi', 'إجمالي التغذية',
   datetime('now'), datetime('now')),

  ('guardian.feeding.single_mode', 'guardian',
   '단일 사료', 'Single Feed', '単一飼料', '单一饲料', '單一飼料',
   'Pienso único', 'Aliment unique', 'Einzelfutter', 'Ração única',
   'Một loại', 'อาหารชนิดเดียว', 'Pakan tunggal', 'علف واحد',
   datetime('now'), datetime('now')),

  ('guardian.feeding.per_row_cal', 'guardian',
   '칼로리', 'Cal', 'カロリー', '卡路里', '卡路里',
   'Cal', 'Cal', 'Kal', 'Cal',
   'Cal', 'แคล', 'Kal', 'سعر',
   datetime('now'), datetime('now'));
