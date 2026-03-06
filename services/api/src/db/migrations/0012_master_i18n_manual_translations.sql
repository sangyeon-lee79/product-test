-- Migration 0012: Master Data 수동 검수 다국어 번역 보정
-- 목적: 영어값 복사본을 제거하고, ko 소스를 기준으로 각 언어값을 수동 번역으로 덮어쓰기

INSERT INTO i18n_translations (
  id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at
) VALUES
-- Category
(lower(hex(randomblob(16))), 'master.pet_type', 'master', '펫 종류', 'Pet Type', 'ペットの種類', '宠物类型', '寵物類型', 'Tipo de mascota', 'Type d''animal', 'Haustierart', 'Tipo de pet', 'Loại thú cưng', 'ประเภทสัตว์เลี้ยง', 'Jenis hewan peliharaan', 'نوع الحيوان الأليف', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.pet_breed', 'master', '품종', 'Breed', '品種', '品种', '品種', 'Raza', 'Race', 'Rasse', 'Raça', 'Giống', 'สายพันธุ์', 'Ras', 'السلالة', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.pet_gender', 'master', '성별', 'Gender', '性別', '性别', '性別', 'Género', 'Genre', 'Geschlecht', 'Gênero', 'Giới tính', 'เพศ', 'Jenis kelamin', 'الجنس', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.neuter_status', 'master', '중성화 여부', 'Neutered/Spayed Status', '去勢・避妊状態', '绝育状态', '結紮狀態', 'Estado de esterilización', 'Statut de stérilisation', 'Kastrationsstatus', 'Status de castração', 'Tình trạng triệt sản', 'สถานะทำหมัน', 'Status sterilisasi', 'حالة التعقيم', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.life_stage', 'master', '생애 단계', 'Life Stage', 'ライフステージ', '生命阶段', '生命階段', 'Etapa de vida', 'Stade de vie', 'Lebensphase', 'Fase da vida', 'Giai đoạn sống', 'ช่วงวัย', 'Tahap hidup', 'مرحلة الحياة', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.body_size', 'master', '체형/크기', 'Body Size', '体格/サイズ', '体型/大小', '體型/大小', 'Tamaño corporal', 'Taille corporelle', 'Körpergröße', 'Porte físico', 'Kích thước cơ thể', 'ขนาดตัว', 'Ukuran tubuh', 'حجم الجسم', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.pet_color', 'master', '대표 색상', 'Primary Color', '主な色', '主要颜色', '主要顏色', 'Color principal', 'Couleur principale', 'Primärfarbe', 'Cor principal', 'Màu chủ đạo', 'สีหลัก', 'Warna utama', 'اللون الأساسي', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.allergy_type', 'master', '알러지', 'Allergy', 'アレルギー', '过敏', '過敏', 'Alergia', 'Allergie', 'Allergie', 'Alergia', 'Dị ứng', 'ภูมิแพ้', 'Alergi', 'حساسية', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.disease_type', 'master', '질병 이력', 'Disease History', '疾患歴', '疾病史', '疾病史', 'Historial de enfermedades', 'Historique des maladies', 'Krankheitsverlauf', 'Histórico de doenças', 'Tiền sử bệnh', 'ประวัติโรค', 'Riwayat penyakit', 'السجل المرضي', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.symptom_type', 'master', '증상 태그', 'Symptom', '症状', '症状', '症狀', 'Síntoma', 'Symptôme', 'Symptom', 'Sintoma', 'Triệu chứng', 'อาการ', 'Gejala', 'عرض', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.vaccination_type', 'master', '예방접종', 'Vaccination', '予防接種', '疫苗接种', '疫苗接種', 'Vacunación', 'Vaccination', 'Impfung', 'Vacinação', 'Tiêm chủng', 'การฉีดวัคซีน', 'Vaksinasi', 'التطعيم', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.temperament_type', 'master', '성격/기질', 'Temperament', '性格/気質', '性格/气质', '性格/氣質', 'Temperamento', 'Tempérament', 'Temperament', 'Temperamento', 'Tính cách', 'นิสัย', 'Temperamen', 'الطبع', 1, datetime('now'), datetime('now')),
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

-- Pet Type
(lower(hex(randomblob(16))), 'master.pet_type.dog', 'master', '강아지', 'Dog', '犬', '狗', '狗', 'Perro', 'Chien', 'Hund', 'Cão', 'Chó', 'สุนัข', 'Anjing', 'كلب', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.pet_type.cat', 'master', '고양이', 'Cat', '猫', '猫', '貓', 'Gato', 'Chat', 'Katze', 'Gato', 'Mèo', 'แมว', 'Kucing', 'قطة', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.pet_type.bird', 'master', '새', 'Bird', '鳥', '鸟', '鳥', 'Pájaro', 'Oiseau', 'Vogel', 'Pássaro', 'Chim', 'นก', 'Burung', 'طائر', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.pet_type.rabbit', 'master', '토끼', 'Rabbit', 'ウサギ', '兔子', '兔子', 'Conejo', 'Lapin', 'Kaninchen', 'Coelho', 'Thỏ', 'กระต่าย', 'Kelinci', 'أرنب', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.pet_type.reptile', 'master', '파충류', 'Reptile', '爬虫類', '爬行动物', '爬蟲類', 'Reptil', 'Reptile', 'Reptil', 'Réptil', 'Bò sát', 'สัตว์เลื้อยคลาน', 'Reptil', 'زاحف', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.pet_type.other', 'master', '기타', 'Other', 'その他', '其他', '其他', 'Otro', 'Autre', 'Andere', 'Outro', 'Khác', 'อื่นๆ', 'Lainnya', 'أخرى', 1, datetime('now'), datetime('now')),

-- Breed
(lower(hex(randomblob(16))), 'master.pet_breed.pomeranian', 'master', '포메라니안', 'Pomeranian', 'ポメラニアン', '博美犬', '博美犬', 'Pomerania', 'Poméranien', 'Pomeranian', 'Pomerânia', 'Phốc sóc', 'ปอมเมอเรเนียน', 'Pomeranian', 'بوميرانيان', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.pet_breed.poodle', 'master', '푸들', 'Poodle', 'プードル', '贵宾犬', '貴賓犬', 'Caniche', 'Caniche', 'Pudel', 'Poodle', 'Poodle', 'พุดเดิ้ล', 'Pudel', 'بودل', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.pet_breed.golden_retriever', 'master', '골든 리트리버', 'Golden Retriever', 'ゴールデンレトリバー', '金毛寻回犬', '黃金獵犬', 'Golden retriever', 'Golden retriever', 'Golden Retriever', 'Golden retriever', 'Golden Retriever', 'โกลเด้น รีทรีฟเวอร์', 'Golden Retriever', 'جولدن ريتريفر', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.pet_breed.korean_shorthair', 'master', '코리안 숏헤어', 'Korean Shorthair', 'コリアンショートヘア', '韩国短毛猫', '韓國短毛貓', 'Gato coreano de pelo corto', 'Chat coréen à poil court', 'Koreanisch Kurzhaar', 'Coreano de pelo curto', 'Mèo lông ngắn Hàn Quốc', 'โคเรียนช็อตแฮร์', 'Kucing pendek Korea', 'قط كوري قصير الشعر', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.pet_breed.russian_blue', 'master', '러시안 블루', 'Russian Blue', 'ロシアンブルー', '俄罗斯蓝猫', '俄羅斯藍貓', 'Azul ruso', 'Bleu russe', 'Russisch Blau', 'Azul russo', 'Mèo Nga xanh', 'รัสเซียนบลู', 'Russian Blue', 'روسي أزرق', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.pet_breed.persian', 'master', '페르시안', 'Persian', 'ペルシャ', '波斯猫', '波斯貓', 'Persa', 'Persan', 'Perser', 'Persa', 'Ba Tư', 'เปอร์เซีย', 'Persia', 'فارسي', 1, datetime('now'), datetime('now')),

-- Gender / Neuter / Life Stage / Body Size
(lower(hex(randomblob(16))), 'master.pet_gender.male', 'master', '수컷', 'Male', 'オス', '公', '公', 'Macho', 'Mâle', 'Männlich', 'Macho', 'Đực', 'เพศผู้', 'Jantan', 'ذكر', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.pet_gender.female', 'master', '암컷', 'Female', 'メス', '母', '母', 'Hembra', 'Femelle', 'Weiblich', 'Fêmea', 'Cái', 'เพศเมีย', 'Betina', 'أنثى', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.pet_gender.unknown', 'master', '미상', 'Unknown', '不明', '未知', '未知', 'Desconocido', 'Inconnu', 'Unbekannt', 'Desconhecido', 'Không rõ', 'ไม่ทราบ', 'Tidak diketahui', 'غير معروف', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.neuter_status.yes', 'master', '예', 'Yes', 'はい', '是', '是', 'Sí', 'Oui', 'Ja', 'Sim', 'Có', 'ใช่', 'Ya', 'نعم', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.neuter_status.no', 'master', '아니오', 'No', 'いいえ', '否', '否', 'No', 'Non', 'Nein', 'Não', 'Không', 'ไม่ใช่', 'Tidak', 'لا', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.neuter_status.unknown', 'master', '미상', 'Unknown', '不明', '未知', '未知', 'Desconocido', 'Inconnu', 'Unbekannt', 'Desconhecido', 'Không rõ', 'ไม่ทราบ', 'Tidak diketahui', 'غير معروف', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.life_stage.baby', 'master', '베이비', 'Baby', 'ベビー', '幼年', '幼年', 'Bebé', 'Bébé', 'Baby', 'Bebê', 'Sơ sinh', 'วัยทารก', 'Bayi', 'رضيع', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.life_stage.junior', 'master', '주니어', 'Junior', 'ジュニア', '幼年后期', '幼年後期', 'Júnior', 'Junior', 'Junior', 'Júnior', 'Thiếu niên', 'วัยเยาว์', 'Junior', 'يافع', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.life_stage.adult', 'master', '성체', 'Adult', '成体', '成年', '成年', 'Adulto', 'Adulte', 'Erwachsen', 'Adulto', 'Trưởng thành', 'โตเต็มวัย', 'Dewasa', 'بالغ', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.life_stage.senior', 'master', '시니어', 'Senior', 'シニア', '老年', '老年', 'Senior', 'Senior', 'Senior', 'Sênior', 'Cao tuổi', 'สูงวัย', 'Senior', 'مسن', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.body_size.tiny', 'master', '초소형', 'Tiny', '超小型', '超小型', '超小型', 'Muy pequeño', 'Très petit', 'Sehr klein', 'Muito pequeno', 'Rất nhỏ', 'เล็กมาก', 'Sangat kecil', 'صغير جدا', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.body_size.small', 'master', '소형', 'Small', '小型', '小型', '小型', 'Pequeño', 'Petit', 'Klein', 'Pequeno', 'Nhỏ', 'เล็ก', 'Kecil', 'صغير', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.body_size.medium', 'master', '중형', 'Medium', '中型', '中型', '中型', 'Mediano', 'Moyen', 'Mittel', 'Médio', 'Trung bình', 'กลาง', 'Sedang', 'متوسط', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.body_size.large', 'master', '대형', 'Large', '大型', '大型', '大型', 'Grande', 'Grand', 'Groß', 'Grande', 'Lớn', 'ใหญ่', 'Besar', 'كبير', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.body_size.giant', 'master', '초대형', 'Giant', '超大型', '超大型', '超大型', 'Gigante', 'Géant', 'Riesig', 'Gigante', 'Khổng lồ', 'ยักษ์', 'Raksasa', 'عملاق', 1, datetime('now'), datetime('now')),

-- Colors
(lower(hex(randomblob(16))), 'master.pet_color.white', 'master', '흰색', 'White', '白', '白色', '白色', 'Blanco', 'Blanc', 'Weiß', 'Branco', 'Trắng', 'สีขาว', 'Putih', 'أبيض', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.pet_color.black', 'master', '검정', 'Black', '黒', '黑色', '黑色', 'Negro', 'Noir', 'Schwarz', 'Preto', 'Đen', 'สีดำ', 'Hitam', 'أسود', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.pet_color.brown', 'master', '갈색', 'Brown', '茶色', '棕色', '棕色', 'Marrón', 'Marron', 'Braun', 'Marrom', 'Nâu', 'สีน้ำตาล', 'Cokelat', 'بني', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.pet_color.gray', 'master', '회색', 'Gray', '灰色', '灰色', '灰色', 'Gris', 'Gris', 'Grau', 'Cinza', 'Xám', 'สีเทา', 'Abu-abu', 'رمادي', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.pet_color.cream', 'master', '크림', 'Cream', 'クリーム', '奶油色', '奶油色', 'Crema', 'Crème', 'Creme', 'Creme', 'Màu kem', 'สีครีม', 'Krem', 'كريمي', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.pet_color.orange', 'master', '오렌지', 'Orange', 'オレンジ', '橙色', '橙色', 'Naranja', 'Orange', 'Orange', 'Laranja', 'Cam', 'สีส้ม', 'Oranye', 'برتقالي', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.pet_color.mixed', 'master', '혼합', 'Mixed', 'ミックス', '混合', '混合', 'Mezclado', 'Mélangé', 'Gemischt', 'Misto', 'Hỗn hợp', 'ผสม', 'Campuran', 'مختلط', 1, datetime('now'), datetime('now')),

-- Allergy
(lower(hex(randomblob(16))), 'master.allergy_type.chicken', 'master', '닭고기', 'Chicken', '鶏肉', '鸡肉', '雞肉', 'Pollo', 'Poulet', 'Huhn', 'Frango', 'Thịt gà', 'เนื้อไก่', 'Daging ayam', 'دجاج', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.allergy_type.beef', 'master', '소고기', 'Beef', '牛肉', '牛肉', '牛肉', 'Carne de res', 'Boeuf', 'Rindfleisch', 'Carne bovina', 'Thịt bò', 'เนื้อวัว', 'Daging sapi', 'لحم بقري', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.allergy_type.grain', 'master', '곡물', 'Grain', '穀物', '谷物', '穀物', 'Grano', 'Céréales', 'Getreide', 'Grãos', 'Ngũ cốc', 'ธัญพืช', 'Biji-bijian', 'حبوب', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.allergy_type.dust', 'master', '먼지', 'Dust', 'ほこり', '灰尘', '灰塵', 'Polvo', 'Poussière', 'Staub', 'Poeira', 'Bụi', 'ฝุ่น', 'Debu', 'غبار', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.allergy_type.pollen', 'master', '꽃가루', 'Pollen', '花粉', '花粉', '花粉', 'Polen', 'Pollen', 'Pollen', 'Pólen', 'Phấn hoa', 'เกสรดอกไม้', 'Serbuk sari', 'حبوب اللقاح', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.allergy_type.dairy', 'master', '유제품', 'Dairy', '乳製品', '乳制品', '乳製品', 'Lácteos', 'Produits laitiers', 'Milchprodukte', 'Laticínios', 'Sữa', 'ผลิตภัณฑ์นม', 'Produk susu', 'منتجات الألبان', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.allergy_type.seafood', 'master', '해산물', 'Seafood', '魚介類', '海鲜', '海鮮', 'Mariscos', 'Fruits de mer', 'Meeresfrüchte', 'Frutos do mar', 'Hải sản', 'อาหารทะเล', 'Makanan laut', 'مأكولات بحرية', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.allergy_type.none', 'master', '없음', 'None', 'なし', '无', '無', 'Ninguno', 'Aucun', 'Keine', 'Nenhum', 'Không', 'ไม่มี', 'Tidak ada', 'لا يوجد', 1, datetime('now'), datetime('now')),

-- Disease History
(lower(hex(randomblob(16))), 'master.disease_type.diabetes', 'master', '당뇨', 'Diabetes', '糖尿病', '糖尿病', '糖尿病', 'Diabetes', 'Diabète', 'Diabetes', 'Diabetes', 'Tiểu đường', 'เบาหวาน', 'Diabetes', 'السكري', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.disease_type.arthritis', 'master', '관절염', 'Arthritis', '関節炎', '关节炎', '關節炎', 'Artritis', 'Arthrite', 'Arthritis', 'Artrite', 'Viêm khớp', 'ข้ออักเสบ', 'Radang sendi', 'التهاب المفاصل', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.disease_type.heart_disease', 'master', '심장 질환', 'Heart Disease', '心疾患', '心脏病', '心臟病', 'Enfermedad cardíaca', 'Maladie cardiaque', 'Herzerkrankung', 'Doença cardíaca', 'Bệnh tim', 'โรคหัวใจ', 'Penyakit jantung', 'أمراض القلب', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.disease_type.kidney_disease', 'master', '신장 질환', 'Kidney Disease', '腎臓病', '肾病', '腎臟病', 'Enfermedad renal', 'Maladie rénale', 'Nierenerkrankung', 'Doença renal', 'Bệnh thận', 'โรคไต', 'Penyakit ginjal', 'مرض الكلى', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.disease_type.skin_disease', 'master', '피부 질환', 'Skin Disease', '皮膚病', '皮肤病', '皮膚病', 'Enfermedad de la piel', 'Maladie de la peau', 'Hautkrankheit', 'Doença de pele', 'Bệnh da', 'โรคผิวหนัง', 'Penyakit kulit', 'مرض جلدي', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.disease_type.none', 'master', '없음', 'None', 'なし', '无', '無', 'Ninguno', 'Aucun', 'Keine', 'Nenhum', 'Không', 'ไม่มี', 'Tidak ada', 'لا يوجد', 1, datetime('now'), datetime('now')),

-- Symptom
(lower(hex(randomblob(16))), 'master.symptom_type.vomiting', 'master', '구토', 'Vomiting', '嘔吐', '呕吐', '嘔吐', 'Vómito', 'Vomissement', 'Erbrechen', 'Vômito', 'Nôn mửa', 'อาเจียน', 'Muntah', 'قيء', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.symptom_type.diarrhea', 'master', '설사', 'Diarrhea', '下痢', '腹泻', '腹瀉', 'Diarrea', 'Diarrhée', 'Durchfall', 'Diarreia', 'Tiêu chảy', 'ท้องเสีย', 'Diare', 'إسهال', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.symptom_type.cough', 'master', '기침', 'Cough', '咳', '咳嗽', '咳嗽', 'Tos', 'Toux', 'Husten', 'Tosse', 'Ho', 'ไอ', 'Batuk', 'سعال', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.symptom_type.itching', 'master', '가려움', 'Itching', 'かゆみ', '瘙痒', '搔癢', 'Picazón', 'Démangeaison', 'Juckreiz', 'Coceira', 'Ngứa', 'คัน', 'Gatal', 'حكة', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.symptom_type.weight_loss', 'master', '체중 감소', 'Weight Loss', '体重減少', '体重下降', '體重下降', 'Pérdida de peso', 'Perte de poids', 'Gewichtsverlust', 'Perda de peso', 'Sụt cân', 'น้ำหนักลด', 'Penurunan berat badan', 'فقدان الوزن', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.symptom_type.loss_of_appetite', 'master', '식욕 부진', 'Loss of Appetite', '食欲不振', '食欲不振', '食慾不振', 'Pérdida de apetito', 'Perte d''appétit', 'Appetitlosigkeit', 'Perda de apetite', 'Chán ăn', 'เบื่ออาหาร', 'Kehilangan nafsu makan', 'فقدان الشهية', 1, datetime('now'), datetime('now')),

-- Vaccination
(lower(hex(randomblob(16))), 'master.vaccination_type.rabies', 'master', '광견병', 'Rabies', '狂犬病', '狂犬病', '狂犬病', 'Rabia', 'Rage', 'Tollwut', 'Raiva', 'Dại', 'พิษสุนัขบ้า', 'Rabies', 'داء الكلب', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.vaccination_type.dhpp', 'master', 'DHPP', 'DHPP', 'DHPP', 'DHPP', 'DHPP', 'DHPP', 'DHPP', 'DHPP', 'DHPP', 'DHPP', 'DHPP', 'DHPP', 'DHPP', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.vaccination_type.bordetella', 'master', '보르데텔라', 'Bordetella', 'ボルデテラ', '博德特氏菌', '博德特氏菌', 'Bordetella', 'Bordetella', 'Bordetella', 'Bordetella', 'Bordetella', 'บอร์เดเทลลา', 'Bordetella', 'بورديتيلا', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.vaccination_type.fvrcp', 'master', 'FVRCP', 'FVRCP', 'FVRCP', 'FVRCP', 'FVRCP', 'FVRCP', 'FVRCP', 'FVRCP', 'FVRCP', 'FVRCP', 'FVRCP', 'FVRCP', 'FVRCP', 1, datetime('now'), datetime('now')),

-- Temperament
(lower(hex(randomblob(16))), 'master.temperament_type.friendly', 'master', '사교적', 'Friendly', '友好的', '友好', '友好', 'Amigable', 'Amical', 'Freundlich', 'Amigável', 'Thân thiện', 'เป็นมิตร', 'Ramah', 'ودود', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.temperament_type.sensitive', 'master', '예민함', 'Sensitive', '敏感', '敏感', '敏感', 'Sensible', 'Sensible', 'Empfindlich', 'Sensível', 'Nhạy cảm', 'อ่อนไหว', 'Sensitif', 'حساس', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.temperament_type.aggressive', 'master', '공격적', 'Aggressive', '攻撃的', '攻击性', '攻擊性', 'Agresivo', 'Agressif', 'Aggressiv', 'Agressivo', 'Hung dữ', 'ก้าวร้าว', 'Agresif', 'عدواني', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.temperament_type.calm', 'master', '차분함', 'Calm', '穏やか', '冷静', '冷靜', 'Tranquilo', 'Calme', 'Ruhig', 'Calmo', 'Điềm tĩnh', 'สงบ', 'Tenang', 'هادئ', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.temperament_type.active', 'master', '활발함', 'Active', '活発', '活跃', '活躍', 'Activo', 'Actif', 'Aktiv', 'Ativo', 'Năng động', 'กระฉับกระเฉง', 'Aktif', 'نشيط', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.temperament_type.social', 'master', '사회성 높음', 'Social', '社交的', '社交性高', '社交性高', 'Sociable', 'Sociable', 'Sozial', 'Sociável', 'Hòa đồng', 'เข้าสังคมเก่ง', 'Sosial', 'اجتماعي', 1, datetime('now'), datetime('now')),
(lower(hex(randomblob(16))), 'master.temperament_type.shy', 'master', '소심함', 'Shy', '恥ずかしがり', '害羞', '害羞', 'Tímido', 'Timide', 'Schüchtern', 'Tímido', 'Nhút nhát', 'ขี้อาย', 'Pemalu', 'خجول', 1, datetime('now'), datetime('now'))
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

-- 나머지 master 키에서 영어 복붙/공란 정리
-- 규칙: 비한국어 필드가 en과 완전히 같거나 공란이면 우선 ko로 대체 (관리자가 후속 검수 가능)
UPDATE i18n_translations
SET
  ja      = CASE WHEN ja = en OR ja = '' OR ja IS NULL THEN ko ELSE ja END,
  zh_cn   = CASE WHEN zh_cn = en OR zh_cn = '' OR zh_cn IS NULL THEN ko ELSE zh_cn END,
  zh_tw   = CASE WHEN zh_tw = en OR zh_tw = '' OR zh_tw IS NULL THEN ko ELSE zh_tw END,
  es      = CASE WHEN es = en OR es = '' OR es IS NULL THEN ko ELSE es END,
  fr      = CASE WHEN fr = en OR fr = '' OR fr IS NULL THEN ko ELSE fr END,
  de      = CASE WHEN de = en OR de = '' OR de IS NULL THEN ko ELSE de END,
  pt      = CASE WHEN pt = en OR pt = '' OR pt IS NULL THEN ko ELSE pt END,
  vi      = CASE WHEN vi = en OR vi = '' OR vi IS NULL THEN ko ELSE vi END,
  th      = CASE WHEN th = en OR th = '' OR th IS NULL THEN ko ELSE th END,
  id_lang = CASE WHEN id_lang = en OR id_lang = '' OR id_lang IS NULL THEN ko ELSE id_lang END,
  ar      = CASE WHEN ar = en OR ar = '' OR ar IS NULL THEN ko ELSE ar END,
  updated_at = datetime('now')
WHERE page = 'master' AND key LIKE 'master.%';

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0012_master_i18n_manual_translations');
