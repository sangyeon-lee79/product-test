/**
 * Address regions for all registered countries.
 * Structure: country code → array of regions (state/province level).
 * If a region has `cities`, the UI shows a cascade dropdown.
 * If no cities, the UI shows a text input for city/district.
 *
 * Registered countries: KR, US, VN, JP, CN, TW, ES, FR, DE, PT, TH, ID, SA
 */

export interface Region {
  name: string;
  cities?: string[];
}

export const COUNTRY_REGIONS: Record<string, Region[]> = {
  // ═══════════════════════════════════════════════════════════
  // KR — South Korea (17 시/도, full city cascade)
  // ═══════════════════════════════════════════════════════════
  KR: [
    { name: '서울특별시', cities: ['강남구','강동구','강북구','강서구','관악구','광진구','구로구','금천구','노원구','도봉구','동대문구','동작구','마포구','서대문구','서초구','성동구','성북구','송파구','양천구','영등포구','용산구','은평구','종로구','중구','중랑구'] },
    { name: '부산광역시', cities: ['강서구','금정구','기장군','남구','동구','동래구','부산진구','북구','사상구','사하구','서구','수영구','연제구','영도구','중구','해운대구'] },
    { name: '대구광역시', cities: ['남구','달서구','달성군','동구','북구','서구','수성구','중구'] },
    { name: '인천광역시', cities: ['강화군','계양구','남동구','동구','미추홀구','부평구','서구','연수구','옹진군','중구'] },
    { name: '광주광역시', cities: ['광산구','남구','동구','북구','서구'] },
    { name: '대전광역시', cities: ['대덕구','동구','서구','유성구','중구'] },
    { name: '울산광역시', cities: ['남구','동구','북구','울주군','중구'] },
    { name: '세종특별자치시', cities: ['세종시'] },
    { name: '경기도', cities: ['가평군','고양시','과천시','광명시','광주시','구리시','군포시','김포시','남양주시','동두천시','부천시','성남시','수원시','시흥시','안산시','안성시','안양시','양주시','양평군','여주시','연천군','오산시','용인시','의왕시','의정부시','이천시','파주시','평택시','포천시','하남시','화성시'] },
    { name: '강원특별자치도', cities: ['강릉시','고성군','동해시','삼척시','속초시','양구군','양양군','영월군','원주시','인제군','정선군','철원군','춘천시','태백시','평창군','홍천군','화천군','횡성군'] },
    { name: '충청북도', cities: ['괴산군','단양군','보은군','영동군','옥천군','음성군','제천시','증평군','진천군','청주시','충주시'] },
    { name: '충청남도', cities: ['계룡시','공주시','금산군','논산시','당진시','보령시','부여군','서산시','서천군','아산시','예산군','천안시','청양군','태안군','홍성군'] },
    { name: '전북특별자치도', cities: ['고창군','군산시','김제시','남원시','무주군','부안군','순창군','완주군','익산시','임실군','장수군','전주시','정읍시','진안군'] },
    { name: '전라남도', cities: ['강진군','고흥군','곡성군','광양시','구례군','나주시','담양군','목포시','무안군','보성군','순천시','신안군','여수시','영광군','영암군','완도군','장성군','장흥군','진도군','함평군','해남군','화순군'] },
    { name: '경상북도', cities: ['경산시','경주시','고령군','구미시','군위군','김천시','문경시','봉화군','상주시','성주군','안동시','영덕군','영양군','영주시','영천시','예천군','울릉군','울진군','의성군','청도군','청송군','칠곡군','포항시'] },
    { name: '경상남도', cities: ['거제시','거창군','고성군','김해시','남해군','밀양시','사천시','산청군','양산시','의령군','진주시','창녕군','창원시','통영시','하동군','함안군','함양군','합천군'] },
    { name: '제주특별자치도', cities: ['제주시','서귀포시'] },
  ],

  // ═══════════════════════════════════════════════════════════
  // US — United States (50 states + DC)
  // ═══════════════════════════════════════════════════════════
  US: [
    { name: 'Alabama' }, { name: 'Alaska' }, { name: 'Arizona' }, { name: 'Arkansas' },
    { name: 'California' }, { name: 'Colorado' }, { name: 'Connecticut' }, { name: 'Delaware' },
    { name: 'District of Columbia' }, { name: 'Florida' }, { name: 'Georgia' }, { name: 'Hawaii' },
    { name: 'Idaho' }, { name: 'Illinois' }, { name: 'Indiana' }, { name: 'Iowa' },
    { name: 'Kansas' }, { name: 'Kentucky' }, { name: 'Louisiana' }, { name: 'Maine' },
    { name: 'Maryland' }, { name: 'Massachusetts' }, { name: 'Michigan' }, { name: 'Minnesota' },
    { name: 'Mississippi' }, { name: 'Missouri' }, { name: 'Montana' }, { name: 'Nebraska' },
    { name: 'Nevada' }, { name: 'New Hampshire' }, { name: 'New Jersey' }, { name: 'New Mexico' },
    { name: 'New York' }, { name: 'North Carolina' }, { name: 'North Dakota' }, { name: 'Ohio' },
    { name: 'Oklahoma' }, { name: 'Oregon' }, { name: 'Pennsylvania' }, { name: 'Rhode Island' },
    { name: 'South Carolina' }, { name: 'South Dakota' }, { name: 'Tennessee' }, { name: 'Texas' },
    { name: 'Utah' }, { name: 'Vermont' }, { name: 'Virginia' }, { name: 'Washington' },
    { name: 'West Virginia' }, { name: 'Wisconsin' }, { name: 'Wyoming' },
  ],

  // ═══════════════════════════════════════════════════════════
  // JP — Japan (47 prefectures)
  // ═══════════════════════════════════════════════════════════
  JP: [
    { name: '北海道' }, { name: '青森県' }, { name: '岩手県' }, { name: '宮城県' },
    { name: '秋田県' }, { name: '山形県' }, { name: '福島県' }, { name: '茨城県' },
    { name: '栃木県' }, { name: '群馬県' }, { name: '埼玉県' }, { name: '千葉県' },
    { name: '東京都' }, { name: '神奈川県' }, { name: '新潟県' }, { name: '富山県' },
    { name: '石川県' }, { name: '福井県' }, { name: '山梨県' }, { name: '長野県' },
    { name: '岐阜県' }, { name: '静岡県' }, { name: '愛知県' }, { name: '三重県' },
    { name: '滋賀県' }, { name: '京都府' }, { name: '大阪府' }, { name: '兵庫県' },
    { name: '奈良県' }, { name: '和歌山県' }, { name: '鳥取県' }, { name: '島根県' },
    { name: '岡山県' }, { name: '広島県' }, { name: '山口県' }, { name: '徳島県' },
    { name: '香川県' }, { name: '愛媛県' }, { name: '高知県' }, { name: '福岡県' },
    { name: '佐賀県' }, { name: '長崎県' }, { name: '熊本県' }, { name: '大分県' },
    { name: '宮崎県' }, { name: '鹿児島県' }, { name: '沖縄県' },
  ],

  // ═══════════════════════════════════════════════════════════
  // CN — China (31 provinces/municipalities/regions)
  // ═══════════════════════════════════════════════════════════
  CN: [
    { name: '北京市' }, { name: '天津市' }, { name: '河北省' }, { name: '山西省' },
    { name: '内蒙古自治区' }, { name: '辽宁省' }, { name: '吉林省' }, { name: '黑龙江省' },
    { name: '上海市' }, { name: '江苏省' }, { name: '浙江省' }, { name: '安徽省' },
    { name: '福建省' }, { name: '江西省' }, { name: '山东省' }, { name: '河南省' },
    { name: '湖北省' }, { name: '湖南省' }, { name: '广东省' }, { name: '广西壮族自治区' },
    { name: '海南省' }, { name: '重庆市' }, { name: '四川省' }, { name: '贵州省' },
    { name: '云南省' }, { name: '西藏自治区' }, { name: '陕西省' }, { name: '甘肃省' },
    { name: '青海省' }, { name: '宁夏回族自治区' }, { name: '新疆维吾尔自治区' },
  ],

  // ═══════════════════════════════════════════════════════════
  // TW — Taiwan (22 cities/counties)
  // ═══════════════════════════════════════════════════════════
  TW: [
    { name: '臺北市' }, { name: '新北市' }, { name: '桃園市' }, { name: '臺中市' },
    { name: '臺南市' }, { name: '高雄市' }, { name: '基隆市' }, { name: '新竹市' },
    { name: '嘉義市' }, { name: '新竹縣' }, { name: '苗栗縣' }, { name: '彰化縣' },
    { name: '南投縣' }, { name: '雲林縣' }, { name: '嘉義縣' }, { name: '屏東縣' },
    { name: '宜蘭縣' }, { name: '花蓮縣' }, { name: '臺東縣' }, { name: '澎湖縣' },
    { name: '金門縣' }, { name: '連江縣' },
  ],

  // ═══════════════════════════════════════════════════════════
  // VN — Vietnam (63 provinces/cities)
  // ═══════════════════════════════════════════════════════════
  VN: [
    { name: 'An Giang' }, { name: 'Bà Rịa–Vũng Tàu' }, { name: 'Bắc Giang' },
    { name: 'Bắc Kạn' }, { name: 'Bạc Liêu' }, { name: 'Bắc Ninh' },
    { name: 'Bến Tre' }, { name: 'Bình Định' }, { name: 'Bình Dương' },
    { name: 'Bình Phước' }, { name: 'Bình Thuận' }, { name: 'Cà Mau' },
    { name: 'Cần Thơ' }, { name: 'Cao Bằng' }, { name: 'Đà Nẵng' },
    { name: 'Đắk Lắk' }, { name: 'Đắk Nông' }, { name: 'Điện Biên' },
    { name: 'Đồng Nai' }, { name: 'Đồng Tháp' }, { name: 'Gia Lai' },
    { name: 'Hà Giang' }, { name: 'Hà Nam' }, { name: 'Hà Nội' },
    { name: 'Hà Tĩnh' }, { name: 'Hải Dương' }, { name: 'Hải Phòng' },
    { name: 'Hậu Giang' }, { name: 'Hòa Bình' }, { name: 'Hồ Chí Minh' },
    { name: 'Hưng Yên' }, { name: 'Khánh Hòa' }, { name: 'Kiên Giang' },
    { name: 'Kon Tum' }, { name: 'Lai Châu' }, { name: 'Lâm Đồng' },
    { name: 'Lạng Sơn' }, { name: 'Lào Cai' }, { name: 'Long An' },
    { name: 'Nam Định' }, { name: 'Nghệ An' }, { name: 'Ninh Bình' },
    { name: 'Ninh Thuận' }, { name: 'Phú Thọ' }, { name: 'Phú Yên' },
    { name: 'Quảng Bình' }, { name: 'Quảng Nam' }, { name: 'Quảng Ngãi' },
    { name: 'Quảng Ninh' }, { name: 'Quảng Trị' }, { name: 'Sóc Trăng' },
    { name: 'Sơn La' }, { name: 'Tây Ninh' }, { name: 'Thái Bình' },
    { name: 'Thái Nguyên' }, { name: 'Thanh Hóa' }, { name: 'Thừa Thiên Huế' },
    { name: 'Tiền Giang' }, { name: 'Trà Vinh' }, { name: 'Tuyên Quang' },
    { name: 'Vĩnh Long' }, { name: 'Vĩnh Phúc' }, { name: 'Yên Bái' },
  ],

  // ═══════════════════════════════════════════════════════════
  // TH — Thailand (77 provinces)
  // ═══════════════════════════════════════════════════════════
  TH: [
    { name: 'กรุงเทพมหานคร' }, { name: 'กระบี่' }, { name: 'กาญจนบุรี' },
    { name: 'กาฬสินธุ์' }, { name: 'กำแพงเพชร' }, { name: 'ขอนแก่น' },
    { name: 'จันทบุรี' }, { name: 'ฉะเชิงเทรา' }, { name: 'ชลบุรี' },
    { name: 'ชัยนาท' }, { name: 'ชัยภูมิ' }, { name: 'ชุมพร' },
    { name: 'เชียงราย' }, { name: 'เชียงใหม่' }, { name: 'ตรัง' },
    { name: 'ตราด' }, { name: 'ตาก' }, { name: 'นครนายก' },
    { name: 'นครปฐม' }, { name: 'นครพนม' }, { name: 'นครราชสีมา' },
    { name: 'นครศรีธรรมราช' }, { name: 'นครสวรรค์' }, { name: 'นนทบุรี' },
    { name: 'นราธิวาส' }, { name: 'น่าน' }, { name: 'บึงกาฬ' },
    { name: 'บุรีรัมย์' }, { name: 'ปทุมธานี' }, { name: 'ประจวบคีรีขันธ์' },
    { name: 'ปราจีนบุรี' }, { name: 'ปัตตานี' }, { name: 'พระนครศรีอยุธยา' },
    { name: 'พะเยา' }, { name: 'พังงา' }, { name: 'พัทลุง' },
    { name: 'พิจิตร' }, { name: 'พิษณุโลก' }, { name: 'เพชรบุรี' },
    { name: 'เพชรบูรณ์' }, { name: 'แพร่' }, { name: 'ภูเก็ต' },
    { name: 'มหาสารคาม' }, { name: 'มุกดาหาร' }, { name: 'แม่ฮ่องสอน' },
    { name: 'ยโสธร' }, { name: 'ยะลา' }, { name: 'ร้อยเอ็ด' },
    { name: 'ระนอง' }, { name: 'ระยอง' }, { name: 'ราชบุรี' },
    { name: 'ลพบุรี' }, { name: 'ลำปาง' }, { name: 'ลำพูน' },
    { name: 'เลย' }, { name: 'ศรีสะเกษ' }, { name: 'สกลนคร' },
    { name: 'สงขลา' }, { name: 'สตูล' }, { name: 'สมุทรปราการ' },
    { name: 'สมุทรสงคราม' }, { name: 'สมุทรสาคร' }, { name: 'สระแก้ว' },
    { name: 'สระบุรี' }, { name: 'สิงห์บุรี' }, { name: 'สุโขทัย' },
    { name: 'สุพรรณบุรี' }, { name: 'สุราษฎร์ธานี' }, { name: 'สุรินทร์' },
    { name: 'หนองคาย' }, { name: 'หนองบัวลำภู' }, { name: 'อ่างทอง' },
    { name: 'อำนาจเจริญ' }, { name: 'อุดรธานี' }, { name: 'อุตรดิตถ์' },
    { name: 'อุทัยธานี' }, { name: 'อุบลราชธานี' },
  ],

  // ═══════════════════════════════════════════════════════════
  // ID — Indonesia (38 provinces)
  // ═══════════════════════════════════════════════════════════
  ID: [
    { name: 'Aceh' }, { name: 'Sumatera Utara' }, { name: 'Sumatera Barat' },
    { name: 'Riau' }, { name: 'Jambi' }, { name: 'Sumatera Selatan' },
    { name: 'Bengkulu' }, { name: 'Lampung' }, { name: 'Kepulauan Bangka Belitung' },
    { name: 'Kepulauan Riau' }, { name: 'DKI Jakarta' }, { name: 'Jawa Barat' },
    { name: 'Jawa Tengah' }, { name: 'DI Yogyakarta' }, { name: 'Jawa Timur' },
    { name: 'Banten' }, { name: 'Bali' }, { name: 'Nusa Tenggara Barat' },
    { name: 'Nusa Tenggara Timur' }, { name: 'Kalimantan Barat' },
    { name: 'Kalimantan Tengah' }, { name: 'Kalimantan Selatan' },
    { name: 'Kalimantan Timur' }, { name: 'Kalimantan Utara' },
    { name: 'Sulawesi Utara' }, { name: 'Sulawesi Tengah' },
    { name: 'Sulawesi Selatan' }, { name: 'Sulawesi Tenggara' },
    { name: 'Gorontalo' }, { name: 'Sulawesi Barat' },
    { name: 'Maluku' }, { name: 'Maluku Utara' },
    { name: 'Papua' }, { name: 'Papua Barat' },
    { name: 'Papua Tengah' }, { name: 'Papua Pegunungan' },
    { name: 'Papua Selatan' }, { name: 'Papua Barat Daya' },
  ],

  // ═══════════════════════════════════════════════════════════
  // DE — Germany (16 Bundesländer)
  // ═══════════════════════════════════════════════════════════
  DE: [
    { name: 'Baden-Württemberg' }, { name: 'Bayern' }, { name: 'Berlin' },
    { name: 'Brandenburg' }, { name: 'Bremen' }, { name: 'Hamburg' },
    { name: 'Hessen' }, { name: 'Mecklenburg-Vorpommern' },
    { name: 'Niedersachsen' }, { name: 'Nordrhein-Westfalen' },
    { name: 'Rheinland-Pfalz' }, { name: 'Saarland' },
    { name: 'Sachsen' }, { name: 'Sachsen-Anhalt' },
    { name: 'Schleswig-Holstein' }, { name: 'Thüringen' },
  ],

  // ═══════════════════════════════════════════════════════════
  // FR — France (18 regions)
  // ═══════════════════════════════════════════════════════════
  FR: [
    { name: 'Auvergne-Rhône-Alpes' }, { name: 'Bourgogne-Franche-Comté' },
    { name: 'Bretagne' }, { name: 'Centre-Val de Loire' },
    { name: 'Corse' }, { name: 'Grand Est' },
    { name: 'Hauts-de-France' }, { name: 'Île-de-France' },
    { name: 'Normandie' }, { name: 'Nouvelle-Aquitaine' },
    { name: 'Occitanie' }, { name: 'Pays de la Loire' },
    { name: "Provence-Alpes-Côte d'Azur" },
    { name: 'Guadeloupe' }, { name: 'Martinique' },
    { name: 'Guyane' }, { name: 'La Réunion' }, { name: 'Mayotte' },
  ],

  // ═══════════════════════════════════════════════════════════
  // ES — Spain (17 comunidades + 2 ciudades autónomas)
  // ═══════════════════════════════════════════════════════════
  ES: [
    { name: 'Andalucía' }, { name: 'Aragón' }, { name: 'Asturias' },
    { name: 'Islas Baleares' }, { name: 'Canarias' }, { name: 'Cantabria' },
    { name: 'Castilla-La Mancha' }, { name: 'Castilla y León' },
    { name: 'Cataluña' }, { name: 'Comunidad Valenciana' },
    { name: 'Extremadura' }, { name: 'Galicia' },
    { name: 'Comunidad de Madrid' }, { name: 'Región de Murcia' },
    { name: 'Navarra' }, { name: 'País Vasco' }, { name: 'La Rioja' },
    { name: 'Ceuta' }, { name: 'Melilla' },
  ],

  // ═══════════════════════════════════════════════════════════
  // PT — Portugal (18 districts + 2 autonomous regions)
  // ═══════════════════════════════════════════════════════════
  PT: [
    { name: 'Aveiro' }, { name: 'Beja' }, { name: 'Braga' },
    { name: 'Bragança' }, { name: 'Castelo Branco' }, { name: 'Coimbra' },
    { name: 'Évora' }, { name: 'Faro' }, { name: 'Guarda' },
    { name: 'Leiria' }, { name: 'Lisboa' }, { name: 'Portalegre' },
    { name: 'Porto' }, { name: 'Santarém' }, { name: 'Setúbal' },
    { name: 'Viana do Castelo' }, { name: 'Vila Real' }, { name: 'Viseu' },
    { name: 'Região Autónoma dos Açores' }, { name: 'Região Autónoma da Madeira' },
  ],

  // ═══════════════════════════════════════════════════════════
  // SA — Saudi Arabia (13 regions)
  // ═══════════════════════════════════════════════════════════
  SA: [
    { name: 'الرياض' }, { name: 'مكة المكرمة' }, { name: 'المدينة المنورة' },
    { name: 'القصيم' }, { name: 'المنطقة الشرقية' }, { name: 'عسير' },
    { name: 'تبوك' }, { name: 'حائل' }, { name: 'الحدود الشمالية' },
    { name: 'جازان' }, { name: 'نجران' }, { name: 'الباحة' }, { name: 'الجوف' },
  ],
};
