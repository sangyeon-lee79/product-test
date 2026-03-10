-- 혼합급여 즐겨찾기 i18n 키 (7 keys × 13 languages)
INSERT OR IGNORE INTO i18n_translations (id, key, page, is_active, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, created_at, updated_at)
VALUES
('i18n_fmf_001', 'guardian.feeding.favorites', 'guardian', 1,
 '즐겨찾기', 'Favorites', 'お気に入り', '收藏夹', '收藏夾', 'Favoritos', 'Favoris', 'Favoriten', 'Favoritos', 'Yêu thích', 'รายการโปรด', 'Favorit', 'المفضلة',
 datetime('now'), datetime('now')),

('i18n_fmf_002', 'guardian.feeding.save_favorite', 'guardian', 1,
 '즐겨찾기 저장', 'Save Favorite', 'お気に入り保存', '保存收藏', '儲存收藏', 'Guardar favorito', 'Enregistrer le favori', 'Favorit speichern', 'Salvar favorito', 'Lưu yêu thích', 'บันทึกรายการโปรด', 'Simpan favorit', 'حفظ المفضلة',
 datetime('now'), datetime('now')),

('i18n_fmf_003', 'guardian.feeding.favorite_name', 'guardian', 1,
 '즐겨찾기 이름', 'Favorite Name', 'お気に入り名', '收藏名称', '收藏名稱', 'Nombre del favorito', 'Nom du favori', 'Favoritenname', 'Nome do favorito', 'Tên yêu thích', 'ชื่อรายการโปรด', 'Nama favorit', 'اسم المفضلة',
 datetime('now'), datetime('now')),

('i18n_fmf_004', 'guardian.feeding.favorite_name_placeholder', 'guardian', 1,
 '예: 방울이 아침 식단', 'e.g., Morning diet', '例: 朝の食事', '例：早餐食谱', '例：早餐食譜', 'ej., Dieta matutina', 'ex., Régime du matin', 'z.B., Morgendiät', 'ex., Dieta matinal', 'VD: Chế độ ăn sáng', 'เช่น อาหารเช้า', 'cth., Diet pagi', 'مثال: نظام الصباح',
 datetime('now'), datetime('now')),

('i18n_fmf_005', 'guardian.feeding.load_favorite', 'guardian', 1,
 '즐겨찾기 불러오기', 'Load Favorite', 'お気に入りを読み込む', '加载收藏', '載入收藏', 'Cargar favorito', 'Charger le favori', 'Favorit laden', 'Carregar favorito', 'Tải yêu thích', 'โหลดรายการโปรด', 'Muat favorit', 'تحميل المفضلة',
 datetime('now'), datetime('now')),

('i18n_fmf_006', 'guardian.feeding.delete_favorite', 'guardian', 1,
 '즐겨찾기 삭제', 'Delete Favorite', 'お気に入りを削除', '删除收藏', '刪除收藏', 'Eliminar favorito', 'Supprimer le favori', 'Favorit löschen', 'Excluir favorito', 'Xóa yêu thích', 'ลบรายการโปรด', 'Hapus favorit', 'حذف المفضلة',
 datetime('now'), datetime('now')),

('i18n_fmf_007', 'guardian.feeding.no_favorites', 'guardian', 1,
 '저장된 즐겨찾기가 없습니다', 'No saved favorites', 'お気に入りはありません', '没有保存的收藏', '沒有儲存的收藏', 'No hay favoritos guardados', 'Aucun favori enregistré', 'Keine gespeicherten Favoriten', 'Nenhum favorito salvo', 'Không có yêu thích đã lưu', 'ไม่มีรายการโปรดที่บันทึก', 'Tidak ada favorit tersimpan', 'لا توجد مفضلات محفوظة',
 datetime('now'), datetime('now'));
