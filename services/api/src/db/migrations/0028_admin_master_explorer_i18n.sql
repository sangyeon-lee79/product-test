INSERT OR REPLACE INTO i18n_translations
  (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES
  ('i28-admin-master-001', 'admin.master.items', 'admin.master', '아이템', 'Items', 'アイテム', '项目', '項目', 'Ítems', 'Éléments', 'Elemente', 'Itens', 'Mục', 'รายการ', 'Item', 'العناصر', 1, datetime('now'), datetime('now')),
  ('i28-admin-master-002', 'admin.master.sub_items', 'admin.master', '하위 아이템', 'Sub Items', 'サブアイテム', '子项目', '子項目', 'Subítems', 'Sous-éléments', 'Unterelemente', 'Subitens', 'Mục con', 'รายการย่อย', 'Sub item', 'العناصر الفرعية', 1, datetime('now'), datetime('now')),
  ('i28-admin-master-003', 'admin.master.add_sub_item', 'admin.master', '+ 하위아이템 추가', '+ Add Sub Item', '+ サブアイテム追加', '+ 添加子项目', '+ 新增子項目', '+ Agregar subítem', '+ Ajouter un sous-élément', '+ Unterelement hinzufügen', '+ Adicionar subitem', '+ Thêm mục con', '+ เพิ่มรายการย่อย', '+ Tambah sub item', '+ إضافة عنصر فرعي', 1, datetime('now'), datetime('now')),
  ('i28-admin-master-004', 'admin.master.select_item_first', 'admin.master', '아이템을 먼저 선택하세요', 'Select an item first', '先にアイテムを選択してください', '请先选择项目', '請先選擇項目', 'Selecciona primero un ítem', 'Sélectionnez d''abord un élément', 'Wählen Sie zuerst ein Element aus', 'Selecione um item primeiro', 'Hãy chọn mục trước', 'กรุณาเลือกรายการก่อน', 'Pilih item terlebih dahulu', 'يرجى تحديد عنصر أولاً', 1, datetime('now'), datetime('now')),
  ('i28-admin-master-005', 'admin.master.category_options', 'admin.master', '카테고리 설정', 'Category Options', 'カテゴリ設定', '分类设置', '分類設定', 'Opciones de categoría', 'Options de catégorie', 'Kategorieoptionen', 'Opções da categoria', 'Tùy chọn danh mục', 'ตัวเลือกหมวดหมู่', 'Opsi kategori', 'خيارات الفئة', 1, datetime('now'), datetime('now')),
  ('i28-admin-master-006', 'admin.master.options', 'admin.master', '기타', 'Options', 'オプション', '选项', '選項', 'Opciones', 'Options', 'Optionen', 'Opções', 'Tùy chọn', 'ตัวเลือก', 'Opsi', 'الخيارات', 1, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0028_admin_master_explorer_i18n');
