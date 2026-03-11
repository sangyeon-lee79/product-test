-- 061: Dashboard analytics i18n keys
-- Admin dashboard statistics labels for all 13 languages

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active)
VALUES
-- Filter
(gen_random_uuid()::text, 'admin.dashboard.filter.period', 'admin', '기간', 'Period', '期間', '期间', '期間', 'Período', 'Période', 'Zeitraum', 'Período', 'Khoảng thời gian', 'ช่วงเวลา', 'Periode', 'الفترة', true),
(gen_random_uuid()::text, 'admin.dashboard.filter.today', 'admin', '오늘', 'Today', '今日', '今天', '今天', 'Hoy', 'Aujourd''hui', 'Heute', 'Hoje', 'Hôm nay', 'วันนี้', 'Hari ini', 'اليوم', true),
(gen_random_uuid()::text, 'admin.dashboard.filter.7d', 'admin', '7일', '7 Days', '7日間', '7天', '7天', '7 días', '7 jours', '7 Tage', '7 dias', '7 ngày', '7 วัน', '7 hari', '7 أيام', true),
(gen_random_uuid()::text, 'admin.dashboard.filter.30d', 'admin', '30일', '30 Days', '30日間', '30天', '30天', '30 días', '30 jours', '30 Tage', '30 dias', '30 ngày', '30 วัน', '30 hari', '30 يومًا', true),
(gen_random_uuid()::text, 'admin.dashboard.filter.3m', 'admin', '3개월', '3 Months', '3ヶ月', '3个月', '3個月', '3 meses', '3 mois', '3 Monate', '3 meses', '3 tháng', '3 เดือน', '3 bulan', '3 أشهر', true),
(gen_random_uuid()::text, 'admin.dashboard.filter.custom', 'admin', '직접입력', 'Custom', 'カスタム', '自定义', '自訂', 'Personalizado', 'Personnalisé', 'Benutzerdefiniert', 'Personalizado', 'Tùy chỉnh', 'กำหนดเอง', 'Kustom', 'مخصص', true),
(gen_random_uuid()::text, 'admin.dashboard.filter.pet_type', 'admin', '펫 종류', 'Pet Type', 'ペット種類', '宠物类型', '寵物類型', 'Tipo de mascota', 'Type d''animal', 'Tierart', 'Tipo de pet', 'Loại thú cưng', 'ประเภทสัตว์เลี้ยง', 'Jenis hewan', 'نوع الحيوان', true),
(gen_random_uuid()::text, 'admin.dashboard.filter.all', 'admin', '전체', 'All', 'すべて', '全部', '全部', 'Todos', 'Tous', 'Alle', 'Todos', 'Tất cả', 'ทั้งหมด', 'Semua', 'الكل', true),
(gen_random_uuid()::text, 'admin.dashboard.filter.dog', 'admin', '개', 'Dog', '犬', '狗', '狗', 'Perro', 'Chien', 'Hund', 'Cachorro', 'Chó', 'สุนัข', 'Anjing', 'كلب', true),
(gen_random_uuid()::text, 'admin.dashboard.filter.cat', 'admin', '고양이', 'Cat', '猫', '猫', '貓', 'Gato', 'Chat', 'Katze', 'Gato', 'Mèo', 'แมว', 'Kucing', 'قطة', true),
(gen_random_uuid()::text, 'admin.dashboard.filter.other', 'admin', '기타', 'Other', 'その他', '其他', '其他', 'Otro', 'Autre', 'Andere', 'Outro', 'Khác', 'อื่น ๆ', 'Lainnya', 'أخرى', true),

-- Feeding stats
(gen_random_uuid()::text, 'admin.dashboard.feeding.title', 'admin', '급여 통계', 'Feeding Stats', '給餌統計', '喂食统计', '餵食統計', 'Estadísticas de alimentación', 'Statistiques d''alimentation', 'Fütterungsstatistik', 'Estatísticas de alimentação', 'Thống kê cho ăn', 'สถิติการให้อาหาร', 'Statistik pemberian makan', 'إحصائيات التغذية', true),
(gen_random_uuid()::text, 'admin.dashboard.feeding.top5_feed', 'admin', '사료 TOP 5', 'Top 5 Feeds', 'フードTOP 5', '饲料TOP 5', '飼料TOP 5', 'Top 5 alimentos', 'Top 5 aliments', 'Top 5 Futter', 'Top 5 rações', 'Top 5 thức ăn', 'อาหาร 5 อันดับ', 'Top 5 pakan', 'أفضل 5 أعلاف', true),
(gen_random_uuid()::text, 'admin.dashboard.feeding.manufacturer_ratio', 'admin', '제조사별 사용 비율', 'Manufacturer Ratio', 'メーカー別比率', '厂商比例', '廠商比例', 'Ratio por fabricante', 'Ratio par fabricant', 'Herstelleranteil', 'Proporção por fabricante', 'Tỷ lệ nhà sản xuất', 'สัดส่วนผู้ผลิต', 'Rasio produsen', 'نسبة الشركة المصنعة', true),
(gen_random_uuid()::text, 'admin.dashboard.feeding.type_distribution', 'admin', '사료유형별 분포', 'Feed Type Distribution', 'フードタイプ分布', '饲料类型分布', '飼料類型分布', 'Distribución por tipo', 'Distribution par type', 'Futtertyp-Verteilung', 'Distribuição por tipo', 'Phân bố loại thức ăn', 'การกระจายประเภทอาหาร', 'Distribusi jenis pakan', 'توزيع نوع العلف', true),
(gen_random_uuid()::text, 'admin.dashboard.feeding.supplement_category', 'admin', '영양제 카테고리별 빈도', 'Supplement Category Freq.', 'サプリカテゴリ頻度', '营养品分类频率', '營養品分類頻率', 'Frecuencia por categoría de suplemento', 'Fréquence par catégorie de supplément', 'Supplement-Kategorie Häufigkeit', 'Frequência por categoria de suplemento', 'Tần suất danh mục thực phẩm bổ sung', 'ความถี่หมวดอาหารเสริม', 'Frekuensi kategori suplemen', 'تردد فئة المكملات', true),
(gen_random_uuid()::text, 'admin.dashboard.feeding.prescribed_ratio', 'admin', '처방 영양제 비율', 'Prescribed Supplement Ratio', '処方サプリ比率', '处方营养品比例', '處方營養品比例', 'Ratio de suplemento prescrito', 'Ratio supplément prescrit', 'Verschriebener Anteil', 'Proporção prescrita', 'Tỷ lệ kê đơn', 'สัดส่วนยาตามใบสั่ง', 'Rasio resep', 'نسبة المكملات الموصوفة', true),
(gen_random_uuid()::text, 'admin.dashboard.feeding.daily_calories', 'admin', '일평균 칼로리', 'Avg Daily Calories', '日平均カロリー', '日均卡路里', '日均卡路里', 'Calorías diarias promedio', 'Calories moy. quotidiennes', 'Ø Tägliche Kalorien', 'Calorias médias diárias', 'Calo trung bình hàng ngày', 'แคลอรี่เฉลี่ยต่อวัน', 'Kalori harian rata-rata', 'السعرات الحرارية اليومية', true),

-- Exercise stats
(gen_random_uuid()::text, 'admin.dashboard.exercise.title', 'admin', '운동 통계', 'Exercise Stats', '運動統計', '运动统计', '運動統計', 'Estadísticas de ejercicio', 'Statistiques d''exercice', 'Bewegungsstatistik', 'Estatísticas de exercício', 'Thống kê vận động', 'สถิติการออกกำลังกาย', 'Statistik olahraga', 'إحصائيات التمارين', true),
(gen_random_uuid()::text, 'admin.dashboard.exercise.type_count', 'admin', '운동 종류별 기록 건수', 'Records by Exercise Type', '種類別記録件数', '各类运动记录数', '各類運動記錄數', 'Registros por tipo', 'Enregistrements par type', 'Einträge pro Typ', 'Registros por tipo', 'Số bản ghi theo loại', 'บันทึกตามประเภท', 'Catatan per jenis', 'السجلات حسب النوع', true),
(gen_random_uuid()::text, 'admin.dashboard.exercise.avg_duration', 'admin', '평균 운동 시간', 'Avg Duration', '平均運動時間', '平均运动时间', '平均運動時間', 'Duración promedio', 'Durée moyenne', 'Ø Dauer', 'Duração média', 'Thời gian trung bình', 'ระยะเวลาเฉลี่ย', 'Durasi rata-rata', 'المدة المتوسطة', true),
(gen_random_uuid()::text, 'admin.dashboard.exercise.intensity_dist', 'admin', '강도 분포', 'Intensity Distribution', '強度分布', '强度分布', '強度分布', 'Distribución de intensidad', 'Distribution d''intensité', 'Intensitätsverteilung', 'Distribuição de intensidade', 'Phân bố cường độ', 'การกระจายความเข้มข้น', 'Distribusi intensitas', 'توزيع الشدة', true),
(gen_random_uuid()::text, 'admin.dashboard.exercise.location_dist', 'admin', '장소 분포', 'Location Distribution', '場所分布', '场所分布', '場所分布', 'Distribución por lugar', 'Distribution par lieu', 'Ortsverteilung', 'Distribuição por local', 'Phân bố địa điểm', 'การกระจายสถานที่', 'Distribusi lokasi', 'توزيع المواقع', true),
(gen_random_uuid()::text, 'admin.dashboard.exercise.monthly_trend', 'admin', '월별 운동 기록 추이', 'Monthly Exercise Trend', '月別運動推移', '月度运动趋势', '月度運動趨勢', 'Tendencia mensual', 'Tendance mensuelle', 'Monatlicher Trend', 'Tendência mensal', 'Xu hướng hàng tháng', 'แนวโน้มรายเดือน', 'Tren bulanan', 'الاتجاه الشهري', true),
(gen_random_uuid()::text, 'admin.dashboard.exercise.pet_type_compare', 'admin', '펫 종별 운동 패턴 비교', 'Exercise Pattern by Pet Type', 'ペット種別運動パターン', '宠物种类运动模式', '寵物種類運動模式', 'Patrón por tipo de mascota', 'Modèle par type d''animal', 'Muster nach Tierart', 'Padrão por tipo de pet', 'Mẫu theo loại thú cưng', 'รูปแบบตามสัตว์เลี้ยง', 'Pola per jenis hewan', 'نمط حسب نوع الحيوان', true),

-- Health stats
(gen_random_uuid()::text, 'admin.dashboard.health.title', 'admin', '건강 수치', 'Health Metrics', '健康指標', '健康指标', '健康指標', 'Métricas de salud', 'Métriques de santé', 'Gesundheitsmetriken', 'Métricas de saúde', 'Chỉ số sức khỏe', 'ตัวชี้วัดสุขภาพ', 'Metrik kesehatan', 'مقاييس الصحة', true),
(gen_random_uuid()::text, 'admin.dashboard.health.weight_trend', 'admin', '전체 평균 체중 추이', 'Avg Weight Trend', '平均体重推移', '平均体重趋势', '平均體重趨勢', 'Tendencia de peso promedio', 'Tendance de poids moyen', 'Ø Gewichtstrend', 'Tendência de peso médio', 'Xu hướng cân nặng trung bình', 'แนวโน้มน้ำหนักเฉลี่ย', 'Tren berat rata-rata', 'اتجاه الوزن المتوسط', true),
(gen_random_uuid()::text, 'admin.dashboard.health.weight_by_size', 'admin', '펫 종/사이즈별 평균 체중', 'Weight by Size', 'サイズ別平均体重', '按体型平均体重', '按體型平均體重', 'Peso por tamaño', 'Poids par taille', 'Gewicht nach Größe', 'Peso por tamanho', 'Cân nặng theo kích cỡ', 'น้ำหนักตามขนาด', 'Berat per ukuran', 'الوزن حسب الحجم', true),
(gen_random_uuid()::text, 'admin.dashboard.health.top5_measurements', 'admin', '건강 수치 기록 빈도 TOP 5', 'Top 5 Measurements', '健康指標記録頻度TOP 5', '健康指标记录频率TOP 5', '健康指標記錄頻率TOP 5', 'Top 5 mediciones', 'Top 5 mesures', 'Top 5 Messungen', 'Top 5 medições', 'Top 5 phép đo', '5 อันดับการวัด', 'Top 5 pengukuran', 'أفضل 5 قياسات', true),
(gen_random_uuid()::text, 'admin.dashboard.health.weight_change_dist', 'admin', '체중 변화 분포', 'Weight Change Distribution', '体重変化分布', '体重变化分布', '體重變化分布', 'Distribución de cambio de peso', 'Distribution de changement de poids', 'Gewichtsänderungs-Verteilung', 'Distribuição de mudança de peso', 'Phân bố thay đổi cân nặng', 'การกระจายการเปลี่ยนแปลงน้ำหนัก', 'Distribusi perubahan berat', 'توزيع تغير الوزن', true),

-- Member stats
(gen_random_uuid()::text, 'admin.dashboard.member.title', 'admin', '회원 활동', 'Member Activity', '会員活動', '会员活动', '會員活動', 'Actividad de miembros', 'Activité des membres', 'Mitgliederaktivität', 'Atividade dos membros', 'Hoạt động thành viên', 'กิจกรรมสมาชิก', 'Aktivitas anggota', 'نشاط الأعضاء', true),
(gen_random_uuid()::text, 'admin.dashboard.member.total_users', 'admin', '전체 회원수', 'Total Users', '総会員数', '总会员数', '總會員數', 'Usuarios totales', 'Utilisateurs totaux', 'Gesamtbenutzer', 'Total de usuários', 'Tổng người dùng', 'ผู้ใช้ทั้งหมด', 'Total pengguna', 'إجمالي المستخدمين', true),
(gen_random_uuid()::text, 'admin.dashboard.member.signup_trend', 'admin', '신규 가입 추이', 'Signup Trend', '新規登録推移', '新注册趋势', '新註冊趨勢', 'Tendencia de registro', 'Tendance d''inscription', 'Registrierungstrend', 'Tendência de cadastro', 'Xu hướng đăng ký', 'แนวโน้มการลงทะเบียน', 'Tren pendaftaran', 'اتجاه التسجيل', true),
(gen_random_uuid()::text, 'admin.dashboard.member.active_guardians', 'admin', '활성 가디언 수', 'Active Guardians', 'アクティブガーディアン', '活跃监护人', '活躍監護人', 'Guardianes activos', 'Gardiens actifs', 'Aktive Guardians', 'Guardiões ativos', 'Người giám hộ hoạt động', 'ผู้ดูแลที่ใช้งาน', 'Guardian aktif', 'أولياء الأمور النشطون', true),
(gen_random_uuid()::text, 'admin.dashboard.member.feature_usage', 'admin', '기능별 사용률', 'Feature Usage', '機能別使用率', '功能使用率', '功能使用率', 'Uso por función', 'Utilisation par fonction', 'Funktionsnutzung', 'Uso por funcionalidade', 'Sử dụng tính năng', 'การใช้งานฟีเจอร์', 'Penggunaan fitur', 'استخدام الميزات', true),
(gen_random_uuid()::text, 'admin.dashboard.member.pet_type_dist', 'admin', '반려동물 종별 분포', 'Pet Type Distribution', 'ペット種類分布', '宠物种类分布', '寵物種類分布', 'Distribución por tipo de mascota', 'Distribution par type d''animal', 'Verteilung nach Tierart', 'Distribuição por tipo de pet', 'Phân bố loại thú cưng', 'การกระจายประเภทสัตว์เลี้ยง', 'Distribusi jenis hewan', 'توزيع نوع الحيوان', true),
(gen_random_uuid()::text, 'admin.dashboard.member.top10_breeds', 'admin', '품종 TOP 10', 'Top 10 Breeds', '犬種TOP 10', '品种TOP 10', '品種TOP 10', 'Top 10 razas', 'Top 10 races', 'Top 10 Rassen', 'Top 10 raças', 'Top 10 giống', '10 อันดับสายพันธุ์', 'Top 10 ras', 'أفضل 10 سلالات', true),
(gen_random_uuid()::text, 'admin.dashboard.member.oauth_dist', 'admin', '가입방식별 비율', 'Signup Method Ratio', '登録方法別比率', '注册方式比例', '註冊方式比例', 'Ratio por método de registro', 'Ratio par méthode d''inscription', 'Registrierungsmethode', 'Proporção por método', 'Tỷ lệ phương thức đăng ký', 'สัดส่วนวิธีการลงทะเบียน', 'Rasio metode pendaftaran', 'نسبة طريقة التسجيل', true),

-- Common
(gen_random_uuid()::text, 'admin.dashboard.no_data', 'admin', '데이터 없음', 'No Data', 'データなし', '暂无数据', '暫無資料', 'Sin datos', 'Aucune donnée', 'Keine Daten', 'Sem dados', 'Không có dữ liệu', 'ไม่มีข้อมูล', 'Tidak ada data', 'لا توجد بيانات', true),
(gen_random_uuid()::text, 'admin.dashboard.weight_increase', 'admin', '증가', 'Increase', '増加', '增加', '增加', 'Aumento', 'Augmentation', 'Zunahme', 'Aumento', 'Tăng', 'เพิ่ม', 'Naik', 'زيادة', true),
(gen_random_uuid()::text, 'admin.dashboard.weight_decrease', 'admin', '감소', 'Decrease', '減少', '减少', '減少', 'Disminución', 'Diminution', 'Abnahme', 'Diminuição', 'Giảm', 'ลด', 'Turun', 'انخفاض', true),
(gen_random_uuid()::text, 'admin.dashboard.weight_maintain', 'admin', '유지', 'Maintain', '維持', '维持', '維持', 'Mantener', 'Maintien', 'Halten', 'Manter', 'Duy trì', 'คงที่', 'Tetap', 'ثبات', true),
(gen_random_uuid()::text, 'admin.dashboard.kcal', 'admin', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', true),
(gen_random_uuid()::text, 'admin.dashboard.minutes', 'admin', '분', 'min', '分', '分钟', '分鐘', 'min', 'min', 'Min', 'min', 'phút', 'นาที', 'menit', 'دقيقة', true),
(gen_random_uuid()::text, 'admin.dashboard.count_unit', 'admin', '건', 'records', '件', '条', '筆', 'registros', 'enregistrements', 'Einträge', 'registros', 'bản ghi', 'รายการ', 'catatan', 'سجلات', true),
(gen_random_uuid()::text, 'admin.dashboard.people', 'admin', '명', 'people', '人', '人', '人', 'personas', 'personnes', 'Personen', 'pessoas', 'người', 'คน', 'orang', 'أشخاص', true),
(gen_random_uuid()::text, 'admin.dashboard.feeding_feature', 'admin', '급여', 'Feeding', '給餌', '喂食', '餵食', 'Alimentación', 'Alimentation', 'Fütterung', 'Alimentação', 'Cho ăn', 'ให้อาหาร', 'Pemberian makan', 'تغذية', true),
(gen_random_uuid()::text, 'admin.dashboard.exercise_feature', 'admin', '운동', 'Exercise', '運動', '运动', '運動', 'Ejercicio', 'Exercice', 'Bewegung', 'Exercício', 'Vận động', 'ออกกำลังกาย', 'Olahraga', 'تمارين', true),
(gen_random_uuid()::text, 'admin.dashboard.health_feature', 'admin', '건강', 'Health', '健康', '健康', '健康', 'Salud', 'Santé', 'Gesundheit', 'Saúde', 'Sức khỏe', 'สุขภาพ', 'Kesehatan', 'صحة', true)
ON CONFLICT (key) DO UPDATE SET
  ko = EXCLUDED.ko, en = EXCLUDED.en, ja = EXCLUDED.ja,
  zh_cn = EXCLUDED.zh_cn, zh_tw = EXCLUDED.zh_tw, es = EXCLUDED.es,
  fr = EXCLUDED.fr, de = EXCLUDED.de, pt = EXCLUDED.pt,
  vi = EXCLUDED.vi, th = EXCLUDED.th, id_lang = EXCLUDED.id_lang,
  ar = EXCLUDED.ar, is_active = true;
