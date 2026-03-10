-- 056: i18n keys for Gallery panel + misc hardcoded Korean strings

INSERT INTO i18n_translations (id, key, page, is_active,
  ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar,
  created_at, updated_at)
VALUES
-- Gallery source labels
(gen_random_uuid()::text, 'guardian.gallery.source.profile', 'guardian', true,
 '프로필', 'Profile', 'プロフィール', '个人资料', '個人資料',
 'Perfil', 'Profil', 'Profil', 'Perfil',
 'Hồ sơ', 'โปรไฟล์', 'Profil', 'الملف الشخصي',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.source.feed', 'guardian', true,
 '피드', 'Feed', 'フィード', '动态', '動態',
 'Feed', 'Flux', 'Feed', 'Feed',
 'Bảng tin', 'ฟีด', 'Umpan', 'التغذية',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.source.booking_completed', 'guardian', true,
 '예약완료', 'Booking', '予約完了', '预约完成', '預約完成',
 'Reserva', 'Réservation', 'Buchung', 'Reserva',
 'Đặt lịch', 'การจอง', 'Pemesanan', 'الحجز',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.source.health_record', 'guardian', true,
 '건강기록', 'Health', '健康記録', '健康记录', '健康紀錄',
 'Salud', 'Santé', 'Gesundheit', 'Saúde',
 'Sức khỏe', 'สุขภาพ', 'Kesehatan', 'الصحة',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.source.manual_upload', 'guardian', true,
 '수동업로드', 'Upload', '手動アップロード', '手动上传', '手動上傳',
 'Subida', 'Téléchargement', 'Upload', 'Upload',
 'Tải lên', 'อัปโหลด', 'Unggahan', 'رفع',
 now(), now()),

-- Gallery filter/sort
(gen_random_uuid()::text, 'guardian.gallery.filter.all', 'guardian', true,
 '전체', 'All', 'すべて', '全部', '全部',
 'Todos', 'Tout', 'Alle', 'Todos',
 'Tất cả', 'ทั้งหมด', 'Semua', 'الكل',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.filter.image_only', 'guardian', true,
 '사진만', 'Photos', '写真のみ', '仅照片', '僅照片',
 'Fotos', 'Photos', 'Fotos', 'Fotos',
 'Ảnh', 'รูปภาพ', 'Foto', 'صور',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.filter.video_only', 'guardian', true,
 '영상만', 'Videos', '動画のみ', '仅视频', '僅影片',
 'Videos', 'Vidéos', 'Videos', 'Vídeos',
 'Video', 'วิดีโอ', 'Video', 'فيديو',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.filter.all_media', 'guardian', true,
 '영상포함', 'All', 'すべて', '包含视频', '包含影片',
 'Todos', 'Tout', 'Alle', 'Todos',
 'Tất cả', 'ทั้งหมด', 'Semua', 'الكل',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.sort.latest', 'guardian', true,
 '최신순', 'Latest', '新しい順', '最新', '最新',
 'Más reciente', 'Plus récent', 'Neueste', 'Mais recente',
 'Mới nhất', 'ล่าสุด', 'Terbaru', 'الأحدث',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.sort.oldest', 'guardian', true,
 '오래된순', 'Oldest', '古い順', '最早', '最早',
 'Más antiguo', 'Plus ancien', 'Älteste', 'Mais antigo',
 'Cũ nhất', 'เก่าสุด', 'Terlama', 'الأقدم',
 now(), now()),

-- Gallery empty states
(gen_random_uuid()::text, 'guardian.gallery.empty.title', 'guardian', true,
 '아직 사진이 없습니다.', 'No photos yet.', 'まだ写真がありません。', '还没有照片。', '還沒有照片。',
 'Aún no hay fotos.', 'Pas encore de photos.', 'Noch keine Fotos.', 'Nenhuma foto ainda.',
 'Chưa có ảnh.', 'ยังไม่มีรูปภาพ', 'Belum ada foto.', 'لا توجد صور بعد.',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.empty.desc', 'guardian', true,
 '첫 프로필 사진이나 반려동물 사진을 업로드해보세요.', 'Upload your first profile or pet photo.', '最初のプロフィールまたはペットの写真をアップロードしましょう。', '上传您的第一张个人资料或宠物照片。', '上傳您的第一張個人資料或寵物照片。',
 'Sube tu primera foto de perfil o mascota.', 'Téléchargez votre première photo de profil ou d''animal.', 'Laden Sie Ihr erstes Profil- oder Haustierfoto hoch.', 'Envie sua primeira foto de perfil ou pet.',
 'Tải lên ảnh hồ sơ hoặc thú cưng đầu tiên.', 'อัปโหลดรูปโปรไฟล์หรือรูปสัตว์เลี้ยงแรกของคุณ', 'Unggah foto profil atau hewan peliharaan pertama Anda.', 'قم بتحميل أول صورة شخصية أو صورة حيوانك الأليف.',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.empty.filtered', 'guardian', true,
 '선택한 유형의 사진이 없습니다.', 'No photos for the selected type.', '選択した種類の写真がありません。', '所选类型没有照片。', '所選類型沒有照片。',
 'No hay fotos del tipo seleccionado.', 'Aucune photo pour le type sélectionné.', 'Keine Fotos für den ausgewählten Typ.', 'Nenhuma foto para o tipo selecionado.',
 'Không có ảnh cho loại đã chọn.', 'ไม่มีรูปภาพสำหรับประเภทที่เลือก', 'Tidak ada foto untuk jenis yang dipilih.', 'لا توجد صور للنوع المحدد.',
 now(), now()),

-- Gallery detail meta
(gen_random_uuid()::text, 'guardian.gallery.title', 'guardian', true,
 'Gallery', 'Gallery', 'ギャラリー', '相册', '相簿',
 'Galería', 'Galerie', 'Galerie', 'Galeria',
 'Thư viện', 'แกลเลอรี', 'Galeri', 'معرض',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.photo_count', 'guardian', true,
 '사진', 'Photos', '写真', '照片', '照片',
 'Fotos', 'Photos', 'Fotos', 'Fotos',
 'Ảnh', 'รูปภาพ', 'Foto', 'صور',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.video_count', 'guardian', true,
 '영상', 'Videos', '動画', '视频', '影片',
 'Videos', 'Vidéos', 'Videos', 'Vídeos',
 'Video', 'วิดีโอ', 'Video', 'فيديو',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.last_update', 'guardian', true,
 '최근 업데이트', 'Last update', '最終更新', '最近更新', '最近更新',
 'Última actualización', 'Dernière mise à jour', 'Letztes Update', 'Última atualização',
 'Cập nhật cuối', 'อัปเดตล่าสุด', 'Pembaruan terakhir', 'آخر تحديث',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.meta.upload_type', 'guardian', true,
 '업로드 유형', 'Upload type', 'アップロード種類', '上传类型', '上傳類型',
 'Tipo de carga', 'Type de téléchargement', 'Upload-Typ', 'Tipo de upload',
 'Loại tải lên', 'ประเภทอัปโหลด', 'Jenis unggahan', 'نوع الرفع',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.meta.upload_date', 'guardian', true,
 '업로드 날짜', 'Upload date', 'アップロード日', '上传日期', '上傳日期',
 'Fecha de carga', 'Date de téléchargement', 'Upload-Datum', 'Data de upload',
 'Ngày tải lên', 'วันที่อัปโหลด', 'Tanggal unggahan', 'تاريخ الرفع',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.meta.uploader', 'guardian', true,
 '업로드자', 'Uploader', 'アップロード者', '上传者', '上傳者',
 'Cargado por', 'Téléchargeur', 'Hochgeladen von', 'Enviado por',
 'Người tải lên', 'ผู้อัปโหลด', 'Pengunggah', 'الرافع',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.meta.visibility', 'guardian', true,
 '공개 범위', 'Visibility', '公開範囲', '公开范围', '公開範圍',
 'Visibilidad', 'Visibilité', 'Sichtbarkeit', 'Visibilidade',
 'Phạm vi', 'ขอบเขตการมองเห็น', 'Visibilitas', 'الرؤية',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.meta.booking_status', 'guardian', true,
 '예약 상태', 'Booking status', '予約状態', '预约状态', '預約狀態',
 'Estado de reserva', 'Statut de réservation', 'Buchungsstatus', 'Status da reserva',
 'Trạng thái đặt lịch', 'สถานะการจอง', 'Status pemesanan', 'حالة الحجز',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.meta.no_booking', 'guardian', true,
 '예약 정보 없음', 'No booking info', '予約情報なし', '无预约信息', '無預約資訊',
 'Sin información de reserva', 'Pas d''info de réservation', 'Keine Buchungsinformationen', 'Sem informação de reserva',
 'Không có thông tin đặt lịch', 'ไม่มีข้อมูลการจอง', 'Tidak ada info pemesanan', 'لا توجد معلومات حجز',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.meta.current_profile', 'guardian', true,
 '현재 프로필', 'Current profile', '現在のプロフィール', '当前资料', '目前個人資料',
 'Perfil actual', 'Profil actuel', 'Aktuelles Profil', 'Perfil atual',
 'Hồ sơ hiện tại', 'โปรไฟล์ปัจจุบัน', 'Profil saat ini', 'الملف الشخصي الحالي',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.view_original', 'guardian', true,
 '원본 피드 보기', 'View original feed', '元のフィードを見る', '查看原始动态', '查看原始動態',
 'Ver feed original', 'Voir le flux original', 'Original-Feed anzeigen', 'Ver feed original',
 'Xem bài gốc', 'ดูฟีดต้นฉบับ', 'Lihat umpan asli', 'عرض التغذية الأصلية',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.confirm_delete', 'guardian', true,
 '이 미디어를 삭제할까요?', 'Delete this media?', 'このメディアを削除しますか？', '删除此媒体？', '刪除此媒體？',
 '¿Eliminar este medio?', 'Supprimer ce média ?', 'Dieses Medium löschen?', 'Excluir esta mídia?',
 'Xóa phương tiện này?', 'ลบสื่อนี้?', 'Hapus media ini?', 'حذف هذا الوسائط؟',
 now(), now()),

(gen_random_uuid()::text, 'guardian.gallery.delete_failed', 'guardian', true,
 '삭제에 실패했습니다.', 'Failed to delete.', '削除に失敗しました。', '删除失败。', '刪除失敗。',
 'Error al eliminar.', 'Échec de la suppression.', 'Löschen fehlgeschlagen.', 'Falha ao excluir.',
 'Xóa thất bại.', 'ลบไม่สำเร็จ', 'Gagal menghapus.', 'فشل الحذف.',
 now(), now())

ON CONFLICT (key) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de, pt = EXCLUDED.pt,
  vi = EXCLUDED.vi, th = EXCLUDED.th, id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  updated_at = now();
