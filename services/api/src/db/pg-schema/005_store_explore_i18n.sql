-- =============================================================================
-- 005: i18n keys for Guardian Store Exploration + Booking UI
-- ~50 keys, 13 languages (ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar)
-- page = 'guardian'
-- =============================================================================

INSERT INTO i18n_translations (id, key, page,
  ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active)
VALUES

-- ═══════════════════════════════════════════════════════════════════
-- 1. Filter bar
-- ═══════════════════════════════════════════════════════════════════

(gen_random_uuid()::text, 'guardian.store.filter.state', 'guardian',
  '시/도', 'Province', '都道府県', '省/市', '省/市',
  'Provincia', 'Province', 'Bundesland', 'Estado',
  'Tỉnh/Thành', 'จังหวัด', 'Provinsi', 'المحافظة', true),

(gen_random_uuid()::text, 'guardian.store.filter.city', 'guardian',
  '시/군/구', 'City', '市区町村', '市/区', '市/區',
  'Ciudad', 'Ville', 'Stadt', 'Cidade',
  'Quận/Huyện', 'อำเภอ/เขต', 'Kota', 'المدينة', true),

(gen_random_uuid()::text, 'guardian.store.filter.all_areas', 'guardian',
  '전체 지역', 'All Areas', '全地域', '所有地区', '所有地區',
  'Todas las áreas', 'Toutes les zones', 'Alle Gebiete', 'Todas as áreas',
  'Tất cả khu vực', 'ทุกพื้นที่', 'Semua Area', 'جميع المناطق', true),

(gen_random_uuid()::text, 'guardian.store.filter.all_categories', 'guardian',
  '전체', 'All', '全て', '全部', '全部',
  'Todos', 'Tous', 'Alle', 'Todos',
  'Tất cả', 'ทั้งหมด', 'Semua', 'الكل', true),

(gen_random_uuid()::text, 'guardian.store.filter.search', 'guardian',
  '매장 검색...', 'Search stores...', '店舗を検索...', '搜索店铺...', '搜尋店鋪...',
  'Buscar tiendas...', 'Rechercher...', 'Geschäfte suchen...', 'Pesquisar lojas...',
  'Tìm cửa hàng...', 'ค้นหาร้าน...', 'Cari toko...', 'البحث عن متاجر...', true),

(gen_random_uuid()::text, 'guardian.store.filter.grooming', 'guardian',
  '미용', 'Grooming', 'トリミング', '美容', '美容',
  'Peluquería', 'Toilettage', 'Pflege', 'Tosa',
  'Cắt tỉa', 'ตัดขน', 'Grooming', 'تجميل', true),

(gen_random_uuid()::text, 'guardian.store.filter.hospital', 'guardian',
  '동물병원', 'Hospital', '動物病院', '动物医院', '動物醫院',
  'Hospital', 'Hôpital', 'Tierklinik', 'Hospital',
  'Bệnh viện', 'โรงพยาบาล', 'Rumah Sakit', 'مستشفى', true),

(gen_random_uuid()::text, 'guardian.store.filter.hotel', 'guardian',
  '호텔/유치원', 'Hotel/Daycare', 'ホテル/保育園', '酒店/托管', '飯店/托管',
  'Hotel/Guardería', 'Hôtel/Garderie', 'Hotel/Betreuung', 'Hotel/Creche',
  'Khách sạn/Nhà trẻ', 'โรงแรม/เนอสเซอรี่', 'Hotel/Penitipan', 'فندق/حضانة', true),

(gen_random_uuid()::text, 'guardian.store.filter.training', 'guardian',
  '훈련소', 'Training', 'トレーニング', '训练', '訓練',
  'Entrenamiento', 'Dressage', 'Training', 'Treinamento',
  'Huấn luyện', 'ฝึกสอน', 'Pelatihan', 'تدريب', true),

(gen_random_uuid()::text, 'guardian.store.filter.shop', 'guardian',
  '펫샵', 'Pet Shop', 'ペットショップ', '宠物店', '寵物店',
  'Tienda', 'Animalerie', 'Tierhandlung', 'Pet Shop',
  'Cửa hàng', 'ร้านสัตว์เลี้ยง', 'Pet Shop', 'متجر حيوانات', true),

(gen_random_uuid()::text, 'guardian.store.filter.cafe', 'guardian',
  '펫카페', 'Pet Cafe', 'ペットカフェ', '宠物咖啡厅', '寵物咖啡廳',
  'Café de mascotas', 'Café pour animaux', 'Tiercafé', 'Pet Café',
  'Quán cà phê thú cưng', 'คาเฟ่สัตว์เลี้ยง', 'Kafe Hewan', 'مقهى حيوانات', true),

(gen_random_uuid()::text, 'guardian.store.filter.photo', 'guardian',
  '사진관', 'Photo Studio', 'フォトスタジオ', '照相馆', '照相館',
  'Estudio fotográfico', 'Studio photo', 'Fotostudio', 'Estúdio fotográfico',
  'Studio ảnh', 'สตูดิโอถ่ายรูป', 'Studio Foto', 'استوديو تصوير', true),

-- ═══════════════════════════════════════════════════════════════════
-- 2. Store card
-- ═══════════════════════════════════════════════════════════════════

(gen_random_uuid()::text, 'guardian.store.card.reviews', 'guardian',
  '리뷰', 'reviews', 'レビュー', '评价', '評價',
  'reseñas', 'avis', 'Bewertungen', 'avaliações',
  'đánh giá', 'รีวิว', 'ulasan', 'مراجعات', true),

(gen_random_uuid()::text, 'guardian.store.card.open_now', 'guardian',
  '영업중', 'Open now', '営業中', '营业中', '營業中',
  'Abierto', 'Ouvert', 'Geöffnet', 'Aberto',
  'Đang mở', 'เปิดอยู่', 'Buka', 'مفتوح الآن', true),

(gen_random_uuid()::text, 'guardian.store.card.closed', 'guardian',
  '영업종료', 'Closed', '閉店', '已打烊', '已打烊',
  'Cerrado', 'Fermé', 'Geschlossen', 'Fechado',
  'Đã đóng', 'ปิดแล้ว', 'Tutup', 'مغلق', true),

(gen_random_uuid()::text, 'guardian.store.card.book_btn', 'guardian',
  '예약하기', 'Book Now', '予約する', '立即预约', '立即預約',
  'Reservar', 'Réserver', 'Buchen', 'Reservar',
  'Đặt lịch', 'จองเลย', 'Pesan Sekarang', 'احجز الآن', true),

(gen_random_uuid()::text, 'guardian.store.card.demo', 'guardian',
  '데모', 'Demo', 'デモ', '演示', '演示',
  'Demo', 'Démo', 'Demo', 'Demo',
  'Demo', 'สาธิต', 'Demo', 'تجريبي', true),

(gen_random_uuid()::text, 'guardian.store.card.no_results', 'guardian',
  '검색 결과 없음', 'No stores found', '検索結果なし', '没有找到店铺', '沒有找到店鋪',
  'No se encontraron tiendas', 'Aucun magasin trouvé', 'Keine Geschäfte gefunden', 'Nenhuma loja encontrada',
  'Không tìm thấy cửa hàng', 'ไม่พบร้านค้า', 'Tidak ada toko ditemukan', 'لم يتم العثور على متاجر', true),

(gen_random_uuid()::text, 'guardian.store.card.no_results_desc', 'guardian',
  '검색 조건을 변경해보세요', 'Try adjusting your filters', '検索条件を変更してみてください', '请尝试修改筛选条件', '請嘗試修改篩選條件',
  'Intenta ajustar los filtros', 'Essayez de modifier vos filtres', 'Passen Sie Ihre Filter an', 'Tente ajustar seus filtros',
  'Hãy thử thay đổi bộ lọc', 'ลองปรับตัวกรองของคุณ', 'Coba sesuaikan filter Anda', 'حاول تعديل عوامل التصفية', true),

-- ═══════════════════════════════════════════════════════════════════
-- 3. Store detail
-- ═══════════════════════════════════════════════════════════════════

(gen_random_uuid()::text, 'guardian.store.detail.tab_services', 'guardian',
  '서비스', 'Services', 'サービス', '服务', '服務',
  'Servicios', 'Services', 'Dienstleistungen', 'Serviços',
  'Dịch vụ', 'บริการ', 'Layanan', 'الخدمات', true),

(gen_random_uuid()::text, 'guardian.store.detail.tab_info', 'guardian',
  '매장정보', 'Store Info', '店舗情報', '店铺信息', '店鋪資訊',
  'Información', 'Informations', 'Geschäftsinfo', 'Informações',
  'Thông tin cửa hàng', 'ข้อมูลร้าน', 'Info Toko', 'معلومات المتجر', true),

(gen_random_uuid()::text, 'guardian.store.detail.duration', 'guardian',
  '소요시간', 'Duration', '所要時間', '所需时间', '所需時間',
  'Duración', 'Durée', 'Dauer', 'Duração',
  'Thời gian', 'ระยะเวลา', 'Durasi', 'المدة', true),

(gen_random_uuid()::text, 'guardian.store.detail.price', 'guardian',
  '가격', 'Price', '料金', '价格', '價格',
  'Precio', 'Prix', 'Preis', 'Preço',
  'Giá', 'ราคา', 'Harga', 'السعر', true),

(gen_random_uuid()::text, 'guardian.store.detail.hours', 'guardian',
  '영업시간', 'Business Hours', '営業時間', '营业时间', '營業時間',
  'Horario', 'Horaires', 'Öffnungszeiten', 'Horário',
  'Giờ mở cửa', 'เวลาเปิดทำการ', 'Jam Buka', 'ساعات العمل', true),

(gen_random_uuid()::text, 'guardian.store.detail.address', 'guardian',
  '주소', 'Address', '住所', '地址', '地址',
  'Dirección', 'Adresse', 'Adresse', 'Endereço',
  'Địa chỉ', 'ที่อยู่', 'Alamat', 'العنوان', true),

(gen_random_uuid()::text, 'guardian.store.detail.phone', 'guardian',
  '전화', 'Phone', '電話', '电话', '電話',
  'Teléfono', 'Téléphone', 'Telefon', 'Telefone',
  'Điện thoại', 'โทรศัพท์', 'Telepon', 'الهاتف', true),

(gen_random_uuid()::text, 'guardian.store.detail.about', 'guardian',
  '매장 소개', 'About', '紹介', '关于', '關於',
  'Acerca de', 'À propos', 'Über uns', 'Sobre',
  'Giới thiệu', 'เกี่ยวกับ', 'Tentang', 'حول المتجر', true),

(gen_random_uuid()::text, 'guardian.store.detail.map_link', 'guardian',
  '지도 보기', 'View on Map', '地図で見る', '查看地图', '查看地圖',
  'Ver en mapa', 'Voir sur la carte', 'Auf Karte anzeigen', 'Ver no mapa',
  'Xem trên bản đồ', 'ดูแผนที่', 'Lihat di Peta', 'عرض على الخريطة', true),

(gen_random_uuid()::text, 'guardian.store.detail.no_services', 'guardian',
  '등록된 서비스 없음', 'No services available', '登録サービスなし', '暂无服务', '暫無服務',
  'Sin servicios', 'Aucun service', 'Keine Dienste verfügbar', 'Sem serviços',
  'Không có dịch vụ', 'ไม่มีบริการ', 'Tidak ada layanan', 'لا توجد خدمات', true),

(gen_random_uuid()::text, 'guardian.store.detail.minutes', 'guardian',
  '분', 'min', '分', '分钟', '分鐘',
  'min', 'min', 'Min', 'min',
  'phút', 'นาที', 'mnt', 'دقيقة', true),

-- ═══════════════════════════════════════════════════════════════════
-- 4. Booking steps
-- ═══════════════════════════════════════════════════════════════════

(gen_random_uuid()::text, 'guardian.booking.step.date', 'guardian',
  '날짜', 'Date', '日付', '日期', '日期',
  'Fecha', 'Date', 'Datum', 'Data',
  'Ngày', 'วันที่', 'Tanggal', 'التاريخ', true),

(gen_random_uuid()::text, 'guardian.booking.step.time', 'guardian',
  '시간', 'Time', '時間', '时间', '時間',
  'Hora', 'Heure', 'Uhrzeit', 'Horário',
  'Giờ', 'เวลา', 'Waktu', 'الوقت', true),

(gen_random_uuid()::text, 'guardian.booking.step.pet', 'guardian',
  '반려동물', 'Pet', 'ペット', '宠物', '寵物',
  'Mascota', 'Animal', 'Haustier', 'Pet',
  'Thú cưng', 'สัตว์เลี้ยง', 'Hewan Peliharaan', 'حيوان أليف', true),

(gen_random_uuid()::text, 'guardian.booking.step.confirm', 'guardian',
  '확인', 'Confirm', '確認', '确认', '確認',
  'Confirmar', 'Confirmer', 'Bestätigen', 'Confirmar',
  'Xác nhận', 'ยืนยัน', 'Konfirmasi', 'تأكيد', true),

(gen_random_uuid()::text, 'guardian.booking.prev', 'guardian',
  '이전', 'Previous', '前へ', '上一步', '上一步',
  'Anterior', 'Précédent', 'Zurück', 'Anterior',
  'Trước', 'ก่อนหน้า', 'Sebelumnya', 'السابق', true),

(gen_random_uuid()::text, 'guardian.booking.next', 'guardian',
  '다음', 'Next', '次へ', '下一步', '下一步',
  'Siguiente', 'Suivant', 'Weiter', 'Próximo',
  'Tiếp', 'ถัดไป', 'Selanjutnya', 'التالي', true),

(gen_random_uuid()::text, 'guardian.booking.calendar.select_date', 'guardian',
  '날짜를 선택하세요', 'Select a date', '日付を選択してください', '请选择日期', '請選擇日期',
  'Seleccione una fecha', 'Sélectionnez une date', 'Wählen Sie ein Datum', 'Selecione uma data',
  'Chọn ngày', 'เลือกวันที่', 'Pilih tanggal', 'اختر تاريخًا', true),

(gen_random_uuid()::text, 'guardian.booking.time.select_time', 'guardian',
  '시간을 선택하세요', 'Select a time', '時間を選択してください', '请选择时间', '請選擇時間',
  'Seleccione una hora', 'Sélectionnez une heure', 'Wählen Sie eine Uhrzeit', 'Selecione um horário',
  'Chọn giờ', 'เลือกเวลา', 'Pilih waktu', 'اختر وقتًا', true),

(gen_random_uuid()::text, 'guardian.booking.pet.select_pet', 'guardian',
  '반려동물을 선택하세요', 'Select your pet', 'ペットを選択してください', '请选择宠物', '請選擇寵物',
  'Seleccione su mascota', 'Sélectionnez votre animal', 'Wählen Sie Ihr Haustier', 'Selecione seu pet',
  'Chọn thú cưng', 'เลือกสัตว์เลี้ยง', 'Pilih hewan peliharaan', 'اختر حيوانك الأليف', true),

(gen_random_uuid()::text, 'guardian.booking.confirm.title', 'guardian',
  '예약 확인', 'Booking Confirmation', '予約確認', '预约确认', '預約確認',
  'Confirmación de reserva', 'Confirmation de réservation', 'Buchungsbestätigung', 'Confirmação de reserva',
  'Xác nhận đặt lịch', 'ยืนยันการจอง', 'Konfirmasi Pemesanan', 'تأكيد الحجز', true),

(gen_random_uuid()::text, 'guardian.booking.confirm.store', 'guardian',
  '매장', 'Store', '店舗', '店铺', '店鋪',
  'Tienda', 'Magasin', 'Geschäft', 'Loja',
  'Cửa hàng', 'ร้าน', 'Toko', 'المتجر', true),

(gen_random_uuid()::text, 'guardian.booking.confirm.service', 'guardian',
  '서비스', 'Service', 'サービス', '服务', '服務',
  'Servicio', 'Service', 'Dienstleistung', 'Serviço',
  'Dịch vụ', 'บริการ', 'Layanan', 'الخدمة', true),

(gen_random_uuid()::text, 'guardian.booking.confirm.date', 'guardian',
  '날짜', 'Date', '日付', '日期', '日期',
  'Fecha', 'Date', 'Datum', 'Data',
  'Ngày', 'วันที่', 'Tanggal', 'التاريخ', true),

(gen_random_uuid()::text, 'guardian.booking.confirm.time', 'guardian',
  '시간', 'Time', '時間', '时间', '時間',
  'Hora', 'Heure', 'Uhrzeit', 'Horário',
  'Giờ', 'เวลา', 'Waktu', 'الوقت', true),

(gen_random_uuid()::text, 'guardian.booking.confirm.pet', 'guardian',
  '반려동물', 'Pet', 'ペット', '宠物', '寵物',
  'Mascota', 'Animal', 'Haustier', 'Pet',
  'Thú cưng', 'สัตว์เลี้ยง', 'Hewan Peliharaan', 'حيوان أليف', true),

(gen_random_uuid()::text, 'guardian.booking.confirm.submit', 'guardian',
  '예약 확정', 'Confirm Booking', '予約確定', '确认预约', '確認預約',
  'Confirmar reserva', 'Confirmer la réservation', 'Buchung bestätigen', 'Confirmar reserva',
  'Xác nhận đặt lịch', 'ยืนยันการจอง', 'Konfirmasi Pemesanan', 'تأكيد الحجز', true),

(gen_random_uuid()::text, 'guardian.booking.confirm.success', 'guardian',
  '예약이 완료되었습니다!', 'Booking submitted!', '予約が完了しました！', '预约已提交！', '預約已提交！',
  '¡Reserva enviada!', 'Réservation soumise !', 'Buchung eingereicht!', 'Reserva enviada!',
  'Đã gửi đặt lịch!', 'ส่งการจองแล้ว!', 'Pemesanan terkirim!', 'تم تقديم الحجز!', true),

(gen_random_uuid()::text, 'guardian.booking.confirm.success_desc', 'guardian',
  '매장에서 확인 후 알려드릴게요', 'The store will confirm your booking', '店舗が確認後ご連絡します', '店铺确认后会通知您', '店鋪確認後會通知您',
  'La tienda confirmará su reserva', 'Le magasin confirmera votre réservation', 'Das Geschäft wird Ihre Buchung bestätigen', 'A loja confirmará sua reserva',
  'Cửa hàng sẽ xác nhận đặt lịch của bạn', 'ร้านจะยืนยันการจองของคุณ', 'Toko akan mengkonfirmasi pemesanan Anda', 'سيؤكد المتجر حجزك', true),

(gen_random_uuid()::text, 'guardian.booking.request_note', 'guardian',
  '요청사항', 'Request Note (optional)', 'リクエスト事項', '备注', '備註',
  'Nota de solicitud', 'Note de demande', 'Anmerkung', 'Observação',
  'Ghi chú yêu cầu', 'หมายเหตุ', 'Catatan Permintaan', 'ملاحظة الطلب', true),

(gen_random_uuid()::text, 'guardian.store.my_bookings', 'guardian',
  '내 예약', 'My Bookings', 'マイ予約', '我的预约', '我的預約',
  'Mis reservas', 'Mes réservations', 'Meine Buchungen', 'Minhas reservas',
  'Đặt lịch của tôi', 'การจองของฉัน', 'Pemesanan Saya', 'حجوزاتي', true)

ON CONFLICT (key) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw,
  es = EXCLUDED.es, fr = EXCLUDED.fr, de = EXCLUDED.de,
  pt = EXCLUDED.pt, vi = EXCLUDED.vi, th = EXCLUDED.th,
  id_lang = EXCLUDED.id_lang, ar = EXCLUDED.ar,
  is_active = EXCLUDED.is_active;
