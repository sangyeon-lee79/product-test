-- 094_feed_card_settings_i18n.sql
-- i18n keys for feed card settings admin page (13 languages)

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES

-- Sidebar / Navigation
(gen_random_uuid(), 'admin.nav.feed_card_settings', 'admin',
 '피드 카드 설정', 'Feed Card Settings', 'フィードカード設定', '信息流卡片设置', '動態卡片設定', 'Config. tarjetas de feed', 'Paramètres cartes de flux', 'Feed-Karten-Einstellungen', 'Config. cartões de feed', 'Cài đặt thẻ nguồn cấp', 'ตั้งค่าการ์ดฟีด', 'Pengaturan kartu feed', 'إعدادات بطاقات الخلاصة', true, NOW(), NOW()),

-- Tab labels
(gen_random_uuid(), 'admin.feed_card.tab_settings', 'admin',
 '설정', 'Settings', '設定', '设置', '設定', 'Configuración', 'Paramètres', 'Einstellungen', 'Configurações', 'Cài đặt', 'การตั้งค่า', 'Pengaturan', 'الإعدادات', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.tab_dummy_data', 'admin',
 '더미 데이터', 'Dummy Data', 'ダミーデータ', '虚拟数据', '虛擬資料', 'Datos ficticios', 'Données factices', 'Testdaten', 'Dados fictícios', 'Dữ liệu mẫu', 'ข้อมูลจำลอง', 'Data dummy', 'بيانات تجريبية', true, NOW(), NOW()),

-- Card type labels
(gen_random_uuid(), 'admin.feed_card.type_ranking', 'admin',
 '랭킹 카드', 'Ranking Card', 'ランキングカード', '排名卡片', '排名卡片', 'Tarjeta de ranking', 'Carte classement', 'Ranking-Karte', 'Cartão de ranking', 'Thẻ xếp hạng', 'การ์ดอันดับ', 'Kartu peringkat', 'بطاقة التصنيف', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.type_recommended', 'admin',
 '추천 카드', 'Recommended Card', 'おすすめカード', '推荐卡片', '推薦卡片', 'Tarjeta recomendada', 'Carte recommandée', 'Empfohlene Karte', 'Cartão recomendado', 'Thẻ đề xuất', 'การ์ดแนะนำ', 'Kartu rekomendasi', 'بطاقة مُوصى بها', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.type_ad', 'admin',
 '광고 카드', 'Ad Card', '広告カード', '广告卡片', '廣告卡片', 'Tarjeta de anuncio', 'Carte publicitaire', 'Werbekarte', 'Cartão de anúncio', 'Thẻ quảng cáo', 'การ์ดโฆษณา', 'Kartu iklan', 'بطاقة إعلانية', true, NOW(), NOW()),

-- Settings panel labels
(gen_random_uuid(), 'admin.feed_card.enabled', 'admin',
 '활성화', 'Enabled', '有効', '启用', '啟用', 'Activado', 'Activé', 'Aktiviert', 'Ativado', 'Đã bật', 'เปิดใช้งาน', 'Diaktifkan', 'مُفعّل', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.disabled', 'admin',
 '비활성화', 'Disabled', '無効', '禁用', '停用', 'Desactivado', 'Désactivé', 'Deaktiviert', 'Desativado', 'Đã tắt', 'ปิดใช้งาน', 'Dinonaktifkan', 'مُعطّل', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.interval', 'admin',
 '삽입 간격 (N개마다)', 'Insert Interval (every N posts)', '挿入間隔（N件ごと）', '插入间隔（每N篇）', '插入間隔（每N篇）', 'Intervalo (cada N publicaciones)', 'Intervalle (tous les N posts)', 'Intervall (alle N Beiträge)', 'Intervalo (a cada N posts)', 'Khoảng cách (mỗi N bài)', 'ช่วง (ทุก N โพสต์)', 'Interval (setiap N pos)', 'الفاصل (كل N منشور)', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.rotation_order', 'admin',
 '순환 순서', 'Rotation Order', 'ローテーション順序', '轮换顺序', '輪換順序', 'Orden de rotación', 'Ordre de rotation', 'Rotationsreihenfolge', 'Ordem de rotação', 'Thứ tự xoay', 'ลำดับการหมุน', 'Urutan rotasi', 'ترتيب الدوران', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.sort_order', 'admin',
 '우선순위', 'Priority', '優先順位', '优先级', '優先順序', 'Prioridad', 'Priorité', 'Priorität', 'Prioridade', 'Ưu tiên', 'ลำดับความสำคัญ', 'Prioritas', 'الأولوية', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.move_up', 'admin',
 '위로', 'Move Up', '上へ', '上移', '上移', 'Subir', 'Monter', 'Nach oben', 'Mover acima', 'Lên', 'ขึ้น', 'Naik', 'لأعلى', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.move_down', 'admin',
 '아래로', 'Move Down', '下へ', '下移', '下移', 'Bajar', 'Descendre', 'Nach unten', 'Mover abaixo', 'Xuống', 'ลง', 'Turun', 'لأسفل', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.save', 'admin',
 '저장', 'Save', '保存', '保存', '儲存', 'Guardar', 'Enregistrer', 'Speichern', 'Salvar', 'Lưu', 'บันทึก', 'Simpan', 'حفظ', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.save_success', 'admin',
 '설정이 저장되었습니다', 'Settings saved successfully', '設定が保存されました', '设置已保存', '設定已儲存', 'Configuración guardada', 'Paramètres enregistrés', 'Einstellungen gespeichert', 'Configurações salvas', 'Đã lưu cài đặt', 'บันทึกการตั้งค่าแล้ว', 'Pengaturan tersimpan', 'تم حفظ الإعدادات', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.save_error', 'admin',
 '저장에 실패했습니다', 'Failed to save settings', '保存に失敗しました', '保存失败', '儲存失敗', 'Error al guardar', 'Échec de l''enregistrement', 'Speichern fehlgeschlagen', 'Falha ao salvar', 'Lưu thất bại', 'บันทึกล้มเหลว', 'Gagal menyimpan', 'فشل في الحفظ', true, NOW(), NOW()),

-- Preview section
(gen_random_uuid(), 'admin.feed_card.preview_title', 'admin',
 '피드 미리보기', 'Feed Preview', 'フィードプレビュー', '信息流预览', '動態預覽', 'Vista previa del feed', 'Aperçu du flux', 'Feed-Vorschau', 'Pré-visualização do feed', 'Xem trước nguồn cấp', 'ตัวอย่างฟีด', 'Pratinjau feed', 'معاينة الخلاصة', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.preview_post', 'admin',
 '일반 게시물', 'Regular Post', '通常投稿', '普通帖子', '一般貼文', 'Publicación normal', 'Publication normale', 'Normaler Beitrag', 'Publicação normal', 'Bài viết thường', 'โพสต์ปกติ', 'Pos biasa', 'منشور عادي', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.preview_ranking', 'admin',
 '랭킹 카드', 'Ranking Card', 'ランキングカード', '排名卡片', '排名卡片', 'Tarjeta de ranking', 'Carte classement', 'Ranking-Karte', 'Cartão de ranking', 'Thẻ xếp hạng', 'การ์ดอันดับ', 'Kartu peringkat', 'بطاقة التصنيف', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.preview_recommended', 'admin',
 '추천 카드', 'Recommended Card', 'おすすめカード', '推荐卡片', '推薦卡片', 'Tarjeta recomendada', 'Carte recommandée', 'Empfohlene Karte', 'Cartão recomendado', 'Thẻ đề xuất', 'การ์ดแนะนำ', 'Kartu rekomendasi', 'بطاقة مُوصى بها', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.preview_ad', 'admin',
 '광고 카드', 'Ad Card', '広告カード', '广告卡片', '廣告卡片', 'Tarjeta de anuncio', 'Carte publicitaire', 'Werbekarte', 'Cartão de anúncio', 'Thẻ quảng cáo', 'การ์ดโฆษณา', 'Kartu iklan', 'بطاقة إعلانية', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.preview_position', 'admin',
 '위치', 'Position', '位置', '位置', '位置', 'Posición', 'Position', 'Position', 'Posição', 'Vị trí', 'ตำแหน่ง', 'Posisi', 'الموضع', true, NOW(), NOW()),

-- Dummy data sub-tabs
(gen_random_uuid(), 'admin.feed_card.dummy_tab_weekly_health_king', 'admin',
 '주간 건강왕', 'Weekly Health King', '週間ヘルスキング', '每周健康王', '每週健康王', 'Rey semanal de salud', 'Roi santé hebdo', 'Wöchentlicher Gesundheitskönig', 'Rei da saúde semanal', 'Vua sức khỏe tuần', 'ราชาสุขภาพประจำสัปดาห์', 'Raja kesehatan mingguan', 'ملك الصحة الأسبوعي', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_tab_breed_health_king', 'admin',
 '견종 건강왕', 'Breed Health King', '犬種ヘルスキング', '品种健康王', '品種健康王', 'Rey de salud de raza', 'Roi santé de race', 'Rasse-Gesundheitskönig', 'Rei da saúde da raça', 'Vua sức khỏe giống', 'ราชาสุขภาพสายพันธุ์', 'Raja kesehatan ras', 'ملك صحة السلالة', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_tab_new_registration', 'admin',
 '신규 가입', 'New Registration', '新規登録', '新注册', '新註冊', 'Nuevo registro', 'Nouvelle inscription', 'Neue Registrierung', 'Novo cadastro', 'Đăng ký mới', 'ลงทะเบียนใหม่', 'Pendaftaran baru', 'تسجيل جديد', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_tab_local_health_king', 'admin',
 '지역 건강왕', 'Local Health King', '地域ヘルスキング', '地区健康王', '地區健康王', 'Rey de salud local', 'Roi santé local', 'Lokaler Gesundheitskönig', 'Rei da saúde local', 'Vua sức khỏe địa phương', 'ราชาสุขภาพท้องถิ่น', 'Raja kesehatan lokal', 'ملك الصحة المحلي', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_tab_recommended_user', 'admin',
 '추천 유저', 'Recommended User', 'おすすめユーザー', '推荐用户', '推薦用戶', 'Usuario recomendado', 'Utilisateur recommandé', 'Empfohlener Benutzer', 'Usuário recomendado', 'Người dùng đề xuất', 'ผู้ใช้แนะนำ', 'Pengguna rekomendasi', 'مستخدم مُوصى به', true, NOW(), NOW()),

-- Dummy data form labels
(gen_random_uuid(), 'admin.feed_card.dummy_title', 'admin',
 '제목', 'Title', 'タイトル', '标题', '標題', 'Título', 'Titre', 'Titel', 'Título', 'Tiêu đề', 'ชื่อ', 'Judul', 'العنوان', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_subtitle', 'admin',
 '부제목', 'Subtitle', 'サブタイトル', '副标题', '副標題', 'Subtítulo', 'Sous-titre', 'Untertitel', 'Subtítulo', 'Phụ đề', 'ชื่อรอง', 'Subjudul', 'العنوان الفرعي', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_description', 'admin',
 '설명', 'Description', '説明', '描述', '描述', 'Descripción', 'Description', 'Beschreibung', 'Descrição', 'Mô tả', 'คำอธิบาย', 'Deskripsi', 'الوصف', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_image_url', 'admin',
 '이미지 URL', 'Image URL', '画像URL', '图片URL', '圖片URL', 'URL de imagen', 'URL de l''image', 'Bild-URL', 'URL da imagem', 'URL hình ảnh', 'URL รูปภาพ', 'URL gambar', 'رابط الصورة', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_display_name', 'admin',
 '표시 이름', 'Display Name', '表示名', '显示名称', '顯示名稱', 'Nombre a mostrar', 'Nom affiché', 'Anzeigename', 'Nome de exibição', 'Tên hiển thị', 'ชื่อที่แสดง', 'Nama tampilan', 'اسم العرض', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_badge_text', 'admin',
 '뱃지 텍스트', 'Badge Text', 'バッジテキスト', '徽章文字', '徽章文字', 'Texto de insignia', 'Texte du badge', 'Badge-Text', 'Texto do emblema', 'Văn bản huy hiệu', 'ข้อความเหรียญ', 'Teks lencana', 'نص الشارة', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_score', 'admin',
 '점수', 'Score', 'スコア', '分数', '分數', 'Puntuación', 'Score', 'Punktzahl', 'Pontuação', 'Điểm', 'คะแนน', 'Skor', 'النقاط', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_region', 'admin',
 '지역', 'Region', '地域', '地区', '地區', 'Región', 'Région', 'Region', 'Região', 'Khu vực', 'ภูมิภาค', 'Wilayah', 'المنطقة', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_breed_info', 'admin',
 '견종 정보', 'Breed Info', '犬種情報', '品种信息', '品種資訊', 'Info de raza', 'Info de race', 'Rasseninfo', 'Info da raça', 'Thông tin giống', 'ข้อมูลสายพันธุ์', 'Info ras', 'معلومات السلالة', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_pet_type', 'admin',
 '동물 종류', 'Pet Type', 'ペット種類', '宠物类型', '寵物類型', 'Tipo de mascota', 'Type d''animal', 'Haustierart', 'Tipo de pet', 'Loại thú cưng', 'ประเภทสัตว์เลี้ยง', 'Jenis hewan', 'نوع الحيوان', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_link_url', 'admin',
 '링크 URL', 'Link URL', 'リンクURL', '链接URL', '連結URL', 'URL del enlace', 'URL du lien', 'Link-URL', 'URL do link', 'URL liên kết', 'URL ลิงก์', 'URL tautan', 'رابط URL', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_avatar_url', 'admin',
 '아바타 URL', 'Avatar URL', 'アバターURL', '头像URL', '頭像URL', 'URL del avatar', 'URL de l''avatar', 'Avatar-URL', 'URL do avatar', 'URL avatar', 'URL อวาตาร์', 'URL avatar', 'رابط الصورة الرمزية', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_start_date', 'admin',
 '시작일', 'Start Date', '開始日', '开始日期', '開始日期', 'Fecha de inicio', 'Date de début', 'Startdatum', 'Data de início', 'Ngày bắt đầu', 'วันเริ่มต้น', 'Tanggal mulai', 'تاريخ البداية', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_end_date', 'admin',
 '종료일', 'End Date', '終了日', '结束日期', '結束日期', 'Fecha de fin', 'Date de fin', 'Enddatum', 'Data de término', 'Ngày kết thúc', 'วันสิ้นสุด', 'Tanggal selesai', 'تاريخ النهاية', true, NOW(), NOW()),

-- Dummy data actions
(gen_random_uuid(), 'admin.feed_card.dummy_add', 'admin',
 '카드 추가', 'Add Card', 'カード追加', '添加卡片', '新增卡片', 'Agregar tarjeta', 'Ajouter carte', 'Karte hinzufügen', 'Adicionar cartão', 'Thêm thẻ', 'เพิ่มการ์ด', 'Tambah kartu', 'إضافة بطاقة', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_edit', 'admin',
 '수정', 'Edit', '編集', '编辑', '編輯', 'Editar', 'Modifier', 'Bearbeiten', 'Editar', 'Chỉnh sửa', 'แก้ไข', 'Edit', 'تعديل', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_delete', 'admin',
 '삭제', 'Delete', '削除', '删除', '刪除', 'Eliminar', 'Supprimer', 'Löschen', 'Excluir', 'Xóa', 'ลบ', 'Hapus', 'حذف', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_delete_confirm', 'admin',
 '이 카드를 삭제하시겠습니까?', 'Delete this card?', 'このカードを削除しますか？', '确定删除此卡片吗？', '確定刪除此卡片嗎？', '¿Eliminar esta tarjeta?', 'Supprimer cette carte ?', 'Diese Karte löschen?', 'Excluir este cartão?', 'Xóa thẻ này?', 'ลบการ์ดนี้?', 'Hapus kartu ini?', 'حذف هذه البطاقة؟', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_save_success', 'admin',
 '카드가 저장되었습니다', 'Card saved successfully', 'カードが保存されました', '卡片已保存', '卡片已儲存', 'Tarjeta guardada', 'Carte enregistrée', 'Karte gespeichert', 'Cartão salvo', 'Đã lưu thẻ', 'บันทึกการ์ดแล้ว', 'Kartu tersimpan', 'تم حفظ البطاقة', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_delete_success', 'admin',
 '카드가 삭제되었습니다', 'Card deleted successfully', 'カードが削除されました', '卡片已删除', '卡片已刪除', 'Tarjeta eliminada', 'Carte supprimée', 'Karte gelöscht', 'Cartão excluído', 'Đã xóa thẻ', 'ลบการ์ดแล้ว', 'Kartu dihapus', 'تم حذف البطاقة', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_active', 'admin',
 '활성', 'Active', 'アクティブ', '活跃', '啟用', 'Activo', 'Actif', 'Aktiv', 'Ativo', 'Hoạt động', 'ใช้งาน', 'Aktif', 'نشط', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.dummy_inactive', 'admin',
 '비활성', 'Inactive', '非アクティブ', '不活跃', '停用', 'Inactivo', 'Inactif', 'Inaktiv', 'Inativo', 'Không hoạt động', 'ไม่ได้ใช้งาน', 'Tidak aktif', 'غير نشط', true, NOW(), NOW()),

-- Common / misc
(gen_random_uuid(), 'admin.feed_card.no_cards', 'admin',
 '등록된 카드가 없습니다', 'No cards registered', 'カードが登録されていません', '没有注册的卡片', '沒有註冊的卡片', 'No hay tarjetas registradas', 'Aucune carte enregistrée', 'Keine Karten registriert', 'Nenhum cartão registrado', 'Chưa có thẻ nào', 'ไม่มีการ์ดที่ลงทะเบียน', 'Tidak ada kartu terdaftar', 'لا توجد بطاقات مسجلة', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.cancel', 'admin',
 '취소', 'Cancel', 'キャンセル', '取消', '取消', 'Cancelar', 'Annuler', 'Abbrechen', 'Cancelar', 'Hủy', 'ยกเลิก', 'Batal', 'إلغاء', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.confirm', 'admin',
 '확인', 'Confirm', '確認', '确认', '確認', 'Confirmar', 'Confirmer', 'Bestätigen', 'Confirmar', 'Xác nhận', 'ยืนยัน', 'Konfirmasi', 'تأكيد', true, NOW(), NOW()),

(gen_random_uuid(), 'admin.feed_card.posts_unit', 'admin',
 '개 게시물마다', 'posts', '件ごと', '篇帖子', '篇貼文', 'publicaciones', 'publications', 'Beiträge', 'publicações', 'bài viết', 'โพสต์', 'pos', 'منشورات', true, NOW(), NOW())

ON CONFLICT (key) DO NOTHING;
