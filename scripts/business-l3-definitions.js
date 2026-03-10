/**
 * Business Category L3 (Service Style) Definitions
 *
 * Single source-of-truth for L3 items under mc-business-category.
 * Each L3 item = a specific service style for [business_type, pet_type, breed].
 *
 * Format per style: [slug, ko, en, ja]
 *   - slug becomes part of id/code
 *   - ko/en/ja are manual translations; other 10 languages default to en
 */

// ─── Dog Breeds (24) ────────────────────────────────────────────────
const DOG_BREEDS = [
  ['mi-breed-poodle',                'poodle'],
  ['mi-breed-dog-maltese',           'maltese'],
  ['mi-breed-dog-bichon-frise',      'bichon-frise'],
  ['mi-breed-dog-shih-tzu',          'shih-tzu'],
  ['mi-breed-dog-yorkshire-terrier', 'yorkshire-terrier'],
  ['mi-breed-pomeranian',            'pomeranian'],
  ['mi-breed-dog-chihuahua',         'chihuahua'],
  ['mi-breed-golden',                'golden'],
  ['mi-breed-dog-labrador',          'labrador'],
  ['mi-breed-dog-welsh-corgi',       'welsh-corgi'],
  ['mi-breed-dog-corgi',             'corgi'],
  ['mi-breed-dog-french-bulldog',    'french-bulldog'],
  ['mi-breed-dog-bulldog',           'bulldog'],
  ['mi-breed-dog-dachshund',         'dachshund'],
  ['mi-breed-dog-beagle',            'beagle'],
  ['mi-breed-dog-schnauzer',         'schnauzer'],
  ['mi-breed-dog-jindo',             'jindo'],
  ['mi-breed-dog-shiba-inu',         'shiba-inu'],
  ['mi-breed-dog-husky',             'husky'],
  ['mi-breed-dog-samoyed',           'samoyed'],
  ['mi-breed-dog-akita',             'akita'],
  ['mi-breed-dog-chow-chow',        'chow-chow'],
  ['mi-breed-dog-mixed',             'mixed-dog'],
  ['mi-breed-dog-other',             'other-dog'],
];

// ─── Cat Breeds (19) ────────────────────────────────────────────────
const CAT_BREEDS = [
  ['mi-breed-ksh',                     'ksh'],
  ['mi-breed-rblue',                   'rblue'],
  ['mi-breed-persian',                 'persian'],
  ['mi-breed-cat-british-shorthair',   'british-sh'],
  ['mi-breed-cat-scottish-fold',       'scottish-fold'],
  ['mi-breed-cat-munchkin',            'munchkin'],
  ['mi-breed-cat-siamese',             'siamese'],
  ['mi-breed-cat-norwegian-forest',    'norwegian-forest'],
  ['mi-breed-cat-bengal',              'bengal'],
  ['mi-breed-cat-ragdoll',             'ragdoll'],
  ['mi-breed-cat-sphynx',             'sphynx'],
  ['mi-breed-cat-maine-coon',          'maine-coon'],
  ['mi-breed-cat-american-shorthair',  'american-sh'],
  ['mi-breed-cat-abyssinian',          'abyssinian'],
  ['mi-breed-cat-birman',              'birman'],
  ['mi-breed-cat-burmese',             'burmese'],
  ['mi-breed-cat-oriental-shorthair',  'oriental-sh'],
  ['mi-breed-cat-mixed',               'mixed-cat'],
  ['mi-breed-cat-other',               'other-cat'],
];

// =====================================================================
//  GROOMING + DOG  (~80 items)
// =====================================================================
const GROOMING_DOG = {
  business: ['mi-business-grooming', 'grooming'],
  pet:      ['mi-ptype-dog', 'dog'],
  items: {
    'poodle': [
      ['continental-clip',  '콘티넨탈 클립',    'Continental Clip',   'コンチネンタルクリップ'],
      ['teddy-bear-cut',    '테디베어 컷',      'Teddy Bear Cut',     'テディベアカット'],
      ['lamb-clip',         '램 클립',          'Lamb Clip',          'ラムクリップ'],
      ['puppy-cut',         '퍼피 컷',          'Puppy Cut',          'パピーカット'],
    ],
    'maltese': [
      ['puppy-cut',         '퍼피 컷',          'Puppy Cut',          'パピーカット'],
      ['top-knot-cut',      '탑노트 컷',        'Top Knot Cut',       'トップノットカット'],
      ['show-cut',          '쇼 컷',            'Show Cut',           'ショーカット'],
    ],
    'bichon-frise': [
      ['powder-puff-cut',   '파우더 퍼프 컷',    'Powder Puff Cut',    'パウダーパフカット'],
      ['puppy-cut',         '퍼피 컷',          'Puppy Cut',          'パピーカット'],
      ['short-trim',        '숏 트리밍',         'Short Trim',         'ショートトリム'],
    ],
    'shih-tzu': [
      ['puppy-cut',         '퍼피 컷',          'Puppy Cut',          'パピーカット'],
      ['teddy-bear-cut',    '테디베어 컷',      'Teddy Bear Cut',     'テディベアカット'],
      ['top-knot-cut',      '탑노트 컷',        'Top Knot Cut',       'トップノットカット'],
    ],
    'yorkshire-terrier': [
      ['puppy-cut',         '퍼피 컷',          'Puppy Cut',          'パピーカット'],
      ['top-knot-cut',      '탑노트 컷',        'Top Knot Cut',       'トップノットカット'],
      ['show-cut',          '쇼 컷',            'Show Cut',           'ショーカット'],
    ],
    'pomeranian': [
      ['teddy-bear-cut',    '테디베어 컷',      'Teddy Bear Cut',     'テディベアカット'],
      ['lion-cut',          '라이온 컷',         'Lion Cut',           'ライオンカット'],
      ['fox-cut',           '폭스 컷',          'Fox Cut',            'フォックスカット'],
      ['puppy-cut',         '퍼피 컷',          'Puppy Cut',          'パピーカット'],
    ],
    'chihuahua': [
      ['bath-and-brush',    '목욕 & 브러싱',     'Bath & Brush',       'バス＆ブラッシング'],
      ['puppy-cut',         '퍼피 컷',          'Puppy Cut',          'パピーカット'],
      ['short-trim',        '숏 트리밍',         'Short Trim',         'ショートトリム'],
    ],
    'golden': [
      ['breed-standard',    '견종 표준 미용',     'Breed Standard Trim', 'スタンダードトリム'],
      ['summer-trim',       '서머 트리밍',       'Summer Trim',        'サマートリム'],
      ['feathering-trim',   '페더링 트리밍',     'Feathering Trim',    'フェザリングトリム'],
      ['bath-and-deshed',   '목욕 & 언더코트 제거','Bath & Deshed',     'バス＆アンダーコート除去'],
    ],
    'labrador': [
      ['bath-and-deshed',   '목욕 & 언더코트 제거','Bath & Deshed',     'バス＆アンダーコート除去'],
      ['summer-trim',       '서머 트리밍',       'Summer Trim',        'サマートリム'],
      ['sanitary-trim',     '위생 미용',         'Sanitary Trim',      'サニタリートリム'],
    ],
    'welsh-corgi': [
      ['bath-and-deshed',   '목욕 & 언더코트 제거','Bath & Deshed',     'バス＆アンダーコート除去'],
      ['summer-trim',       '서머 트리밍',       'Summer Trim',        'サマートリム'],
      ['sanitary-trim',     '위생 미용',         'Sanitary Trim',      'サニタリートリム'],
    ],
    'corgi': [
      ['bath-and-deshed',   '목욕 & 언더코트 제거','Bath & Deshed',     'バス＆アンダーコート除去'],
      ['summer-trim',       '서머 트리밍',       'Summer Trim',        'サマートリム'],
      ['sanitary-trim',     '위생 미용',         'Sanitary Trim',      'サニタリートリム'],
    ],
    'french-bulldog': [
      ['bath-and-brush',    '목욕 & 브러싱',     'Bath & Brush',       'バス＆ブラッシング'],
      ['wrinkle-care',      '주름 관리',         'Wrinkle Care',       'しわケア'],
      ['short-trim',        '숏 트리밍',         'Short Trim',         'ショートトリム'],
    ],
    'bulldog': [
      ['bath-and-brush',    '목욕 & 브러싱',     'Bath & Brush',       'バス＆ブラッシング'],
      ['wrinkle-care',      '주름 관리',         'Wrinkle Care',       'しわケア'],
      ['short-trim',        '숏 트리밍',         'Short Trim',         'ショートトリム'],
    ],
    'dachshund': [
      ['bath-and-brush',    '목욕 & 브러싱',     'Bath & Brush',       'バス＆ブラッシング'],
      ['wire-stripping',    '와이어 스트리핑',    'Wire Coat Stripping','ワイヤーストリッピング'],
      ['short-trim',        '숏 트리밍',         'Short Trim',         'ショートトリム'],
    ],
    'beagle': [
      ['bath-and-brush',    '목욕 & 브러싱',     'Bath & Brush',       'バス＆ブラッシング'],
      ['deshedding',        '언더코트 제거',     'Deshedding',         'アンダーコート除去'],
      ['short-trim',        '숏 트리밍',         'Short Trim',         'ショートトリム'],
    ],
    'schnauzer': [
      ['breed-standard',    '견종 표준 미용',     'Breed Standard Trim', 'スタンダードトリム'],
      ['puppy-cut',         '퍼피 컷',          'Puppy Cut',          'パピーカット'],
      ['summer-cut',        '서머 컷',           'Summer Cut',         'サマーカット'],
      ['wire-stripping',    '와이어 스트리핑',    'Wire Coat Stripping','ワイヤーストリッピング'],
    ],
    'jindo': [
      ['bath-and-deshed',   '목욕 & 언더코트 제거','Bath & Deshed',     'バス＆アンダーコート除去'],
      ['summer-trim',       '서머 트리밍',       'Summer Trim',        'サマートリム'],
      ['sanitary-trim',     '위생 미용',         'Sanitary Trim',      'サニタリートリム'],
    ],
    'shiba-inu': [
      ['bath-and-deshed',   '목욕 & 언더코트 제거','Bath & Deshed',     'バス＆アンダーコート除去'],
      ['summer-trim',       '서머 트리밍',       'Summer Trim',        'サマートリム'],
      ['sanitary-trim',     '위생 미용',         'Sanitary Trim',      'サニタリートリム'],
    ],
    'husky': [
      ['bath-and-deshed',   '목욕 & 언더코트 제거','Bath & Deshed',     'バス＆アンダーコート除去'],
      ['line-trim',         '라인 트리밍',       'Line Trim',          'ライントリム'],
      ['sanitary-trim',     '위생 미용',         'Sanitary Trim',      'サニタリートリム'],
    ],
    'samoyed': [
      ['bath-and-deshed',   '목욕 & 언더코트 제거','Bath & Deshed',     'バス＆アンダーコート除去'],
      ['line-trim',         '라인 트리밍',       'Line Trim',          'ライントリム'],
      ['teddy-bear-cut',    '테디베어 컷',      'Teddy Bear Cut',     'テディベアカット'],
    ],
    'akita': [
      ['bath-and-deshed',   '목욕 & 언더코트 제거','Bath & Deshed',     'バス＆アンダーコート除去'],
      ['line-trim',         '라인 트리밍',       'Line Trim',          'ライントリム'],
      ['sanitary-trim',     '위생 미용',         'Sanitary Trim',      'サニタリートリム'],
    ],
    'chow-chow': [
      ['teddy-bear-cut',    '테디베어 컷',      'Teddy Bear Cut',     'テディベアカット'],
      ['lion-cut',          '라이온 컷',         'Lion Cut',           'ライオンカット'],
      ['bath-and-deshed',   '목욕 & 언더코트 제거','Bath & Deshed',     'バス＆アンダーコート除去'],
    ],
    'mixed-dog': [
      ['puppy-cut',         '퍼피 컷',          'Puppy Cut',          'パピーカット'],
      ['short-trim',        '숏 트리밍',         'Short Trim',         'ショートトリム'],
      ['summer-cut',        '서머 컷',           'Summer Cut',         'サマーカット'],
    ],
    'other-dog': [
      ['puppy-cut',         '퍼피 컷',          'Puppy Cut',          'パピーカット'],
      ['short-trim',        '숏 트리밍',         'Short Trim',         'ショートトリム'],
      ['summer-cut',        '서머 컷',           'Summer Cut',         'サマーカット'],
    ],
  },
};

// =====================================================================
//  GROOMING + CAT  (~50 items)
// =====================================================================
const GROOMING_CAT = {
  business: ['mi-business-grooming', 'grooming'],
  pet:      ['mi-ptype-cat', 'cat'],
  items: {
    'ksh': [
      ['bath-and-brush',    '목욕 & 브러싱',     'Bath & Brush',       'バス＆ブラッシング'],
      ['sanitary-trim',     '위생 미용',         'Sanitary Trim',      'サニタリートリム'],
      ['short-trim',        '숏 트리밍',         'Short Trim',         'ショートトリム'],
    ],
    'rblue': [
      ['bath-and-brush',    '목욕 & 브러싱',     'Bath & Brush',       'バス＆ブラッシング'],
      ['sanitary-trim',     '위생 미용',         'Sanitary Trim',      'サニタリートリム'],
      ['short-trim',        '숏 트리밍',         'Short Trim',         'ショートトリム'],
    ],
    'persian': [
      ['lion-cut',          '라이온 컷',         'Lion Cut',           'ライオンカット'],
      ['teddy-bear-cut',    '테디베어 컷',      'Teddy Bear Cut',     'テディベアカット'],
      ['comb-cut',          '콤 컷',            'Comb Cut',           'コームカット'],
      ['sanitary-trim',     '위생 미용',         'Sanitary Trim',      'サニタリートリム'],
    ],
    'british-sh': [
      ['bath-and-brush',    '목욕 & 브러싱',     'Bath & Brush',       'バス＆ブラッシング'],
      ['sanitary-trim',     '위생 미용',         'Sanitary Trim',      'サニタリートリム'],
      ['short-trim',        '숏 트리밍',         'Short Trim',         'ショートトリム'],
    ],
    'scottish-fold': [
      ['bath-and-brush',    '목욕 & 브러싱',     'Bath & Brush',       'バス＆ブラッシング'],
      ['sanitary-trim',     '위생 미용',         'Sanitary Trim',      'サニタリートリム'],
      ['short-trim',        '숏 트리밍',         'Short Trim',         'ショートトリム'],
    ],
    'munchkin': [
      ['bath-and-brush',    '목욕 & 브러싱',     'Bath & Brush',       'バス＆ブラッシング'],
      ['sanitary-trim',     '위생 미용',         'Sanitary Trim',      'サニタリートリム'],
      ['belly-trim',        '복부 미용',         'Belly Trim',         'ベリートリム'],
    ],
    'siamese': [
      ['bath-and-brush',    '목욕 & 브러싱',     'Bath & Brush',       'バス＆ブラッシング'],
      ['sanitary-trim',     '위생 미용',         'Sanitary Trim',      'サニタリートリム'],
      ['short-trim',        '숏 트리밍',         'Short Trim',         'ショートトリム'],
    ],
    'norwegian-forest': [
      ['lion-cut',          '라이온 컷',         'Lion Cut',           'ライオンカット'],
      ['comb-cut',          '콤 컷',            'Comb Cut',           'コームカット'],
      ['sanitary-trim',     '위생 미용',         'Sanitary Trim',      'サニタリートリム'],
    ],
    'bengal': [
      ['bath-and-brush',    '목욕 & 브러싱',     'Bath & Brush',       'バス＆ブラッシング'],
      ['short-trim',        '숏 트리밍',         'Short Trim',         'ショートトリム'],
    ],
    'ragdoll': [
      ['lion-cut',          '라이온 컷',         'Lion Cut',           'ライオンカット'],
      ['comb-cut',          '콤 컷',            'Comb Cut',           'コームカット'],
      ['sanitary-trim',     '위생 미용',         'Sanitary Trim',      'サニタリートリム'],
    ],
    'sphynx': [
      ['bath-and-skin-care','목욕 & 피부 관리',   'Bath & Skin Care',   'バス＆スキンケア'],
      ['nail-care',         '발톱 관리',         'Nail Care',          'ネイルケア'],
    ],
    'maine-coon': [
      ['lion-cut',          '라이온 컷',         'Lion Cut',           'ライオンカット'],
      ['comb-cut',          '콤 컷',            'Comb Cut',           'コームカット'],
      ['belly-trim',        '복부 미용',         'Belly Trim',         'ベリートリム'],
    ],
    'american-sh': [
      ['bath-and-brush',    '목욕 & 브러싱',     'Bath & Brush',       'バス＆ブラッシング'],
      ['sanitary-trim',     '위생 미용',         'Sanitary Trim',      'サニタリートリム'],
      ['short-trim',        '숏 트리밍',         'Short Trim',         'ショートトリム'],
    ],
    'abyssinian': [
      ['bath-and-brush',    '목욕 & 브러싱',     'Bath & Brush',       'バス＆ブラッシング'],
      ['short-trim',        '숏 트리밍',         'Short Trim',         'ショートトリム'],
    ],
    'birman': [
      ['comb-cut',          '콤 컷',            'Comb Cut',           'コームカット'],
      ['sanitary-trim',     '위생 미용',         'Sanitary Trim',      'サニタリートリム'],
      ['lion-cut',          '라이온 컷',         'Lion Cut',           'ライオンカット'],
    ],
    'burmese': [
      ['bath-and-brush',    '목욕 & 브러싱',     'Bath & Brush',       'バス＆ブラッシング'],
      ['short-trim',        '숏 트리밍',         'Short Trim',         'ショートトリム'],
    ],
    'oriental-sh': [
      ['bath-and-brush',    '목욕 & 브러싱',     'Bath & Brush',       'バス＆ブラッシング'],
      ['short-trim',        '숏 트리밍',         'Short Trim',         'ショートトリム'],
    ],
    'mixed-cat': [
      ['lion-cut',          '라이온 컷',         'Lion Cut',           'ライオンカット'],
      ['sanitary-trim',     '위생 미용',         'Sanitary Trim',      'サニタリートリム'],
      ['short-trim',        '숏 트리밍',         'Short Trim',         'ショートトリム'],
    ],
    'other-cat': [
      ['lion-cut',          '라이온 컷',         'Lion Cut',           'ライオンカット'],
      ['sanitary-trim',     '위생 미용',         'Sanitary Trim',      'サニタリートリム'],
      ['short-trim',        '숏 트리밍',         'Short Trim',         'ショートトリム'],
    ],
  },
};

// =====================================================================
//  HOSPITAL + DOG  (~60 items)
// =====================================================================
const HOSPITAL_DOG = {
  business: ['mi-business-hospital', 'hospital'],
  pet:      ['mi-ptype-dog', 'dog'],
  items: {
    'poodle': [
      ['eye-care',          '안과 검진',         'Eye Care',               '眼科検診'],
      ['dental-scaling',    '치석 제거',         'Dental Scaling',         '歯石除去'],
      ['hip-screening',     '고관절 검사',       'Hip Dysplasia Screening','股関節形成不全検査'],
    ],
    'maltese': [
      ['dental-scaling',    '치석 제거',         'Dental Scaling',         '歯石除去'],
      ['patella-check',     '슬개골 탈구 검사',   'Patella Luxation Check', '膝蓋骨脱臼検査'],
      ['eye-care',          '안과 검진',         'Eye Care',               '眼科検診'],
    ],
    'bichon-frise': [
      ['dental-scaling',    '치석 제거',         'Dental Scaling',         '歯石除去'],
      ['patella-check',     '슬개골 탈구 검사',   'Patella Luxation Check', '膝蓋骨脱臼検査'],
      ['allergy-treatment', '피부 알러지 치료',   'Skin Allergy Treatment', '皮膚アレルギー治療'],
    ],
    'shih-tzu': [
      ['eye-care',          '안과 검진',         'Eye Care',               '眼科検診'],
      ['dental-scaling',    '치석 제거',         'Dental Scaling',         '歯石除去'],
      ['respiratory-check', '호흡기 검사',       'Respiratory Check',      '呼吸器検査'],
    ],
    'yorkshire-terrier': [
      ['dental-scaling',    '치석 제거',         'Dental Scaling',         '歯石除去'],
      ['patella-check',     '슬개골 탈구 검사',   'Patella Luxation Check', '膝蓋骨脱臼検査'],
      ['trachea-check',     '기관 협착 검사',    'Tracheal Collapse Check','気管虚脱検査'],
    ],
    'pomeranian': [
      ['patella-check',     '슬개골 탈구 검사',   'Patella Luxation Check', '膝蓋骨脱臼検査'],
      ['dental-scaling',    '치석 제거',         'Dental Scaling',         '歯石除去'],
      ['trachea-check',     '기관 협착 검사',    'Tracheal Collapse Check','気管虚脱検査'],
    ],
    'chihuahua': [
      ['dental-scaling',    '치석 제거',         'Dental Scaling',         '歯石除去'],
      ['patella-check',     '슬개골 탈구 검사',   'Patella Luxation Check', '膝蓋骨脱臼検査'],
      ['eye-care',          '안과 검진',         'Eye Care',               '眼科検診'],
    ],
    'golden': [
      ['hip-screening',     '고관절 검사',       'Hip Dysplasia Screening','股関節形成不全検査'],
      ['cancer-screening',  '종양 검진',         'Cancer Screening',       '腫瘍検診'],
      ['allergy-treatment', '피부 알러지 치료',   'Skin Allergy Treatment', '皮膚アレルギー治療'],
    ],
    'labrador': [
      ['hip-screening',     '고관절 검사',       'Hip Dysplasia Screening','股関節形成不全検査'],
      ['obesity-mgmt',      '비만 관리',         'Obesity Management',     '肥満管理'],
      ['eye-care',          '안과 검진',         'Eye Care',               '眼科検診'],
    ],
    'welsh-corgi': [
      ['hip-screening',     '고관절 검사',       'Hip Dysplasia Screening','股関節形成不全検査'],
      ['spinal-screening',  '척추 검사',         'Spinal Screening',       '脊椎検査'],
      ['obesity-mgmt',      '비만 관리',         'Obesity Management',     '肥満管理'],
    ],
    'corgi': [
      ['hip-screening',     '고관절 검사',       'Hip Dysplasia Screening','股関節形成不全検査'],
      ['spinal-screening',  '척추 검사',         'Spinal Screening',       '脊椎検査'],
      ['obesity-mgmt',      '비만 관리',         'Obesity Management',     '肥満管理'],
    ],
    'french-bulldog': [
      ['brachy-airway',     '단두종 기도 검사',   'Brachycephalic Airway Check', '短頭種気道検査'],
      ['skin-fold-care',    '피부 주름 관리',    'Skin Fold Care',         '皮膚ヒダケア'],
      ['spinal-screening',  '척추 검사',         'Spinal Screening',       '脊椎検査'],
    ],
    'bulldog': [
      ['brachy-airway',     '단두종 기도 검사',   'Brachycephalic Airway Check', '短頭種気道検査'],
      ['skin-fold-care',    '피부 주름 관리',    'Skin Fold Care',         '皮膚ヒダケア'],
      ['joint-care',        '관절 관리',         'Joint Care',             '関節ケア'],
    ],
    'dachshund': [
      ['ivdd-screening',    'IVDD 척추 검사',    'IVDD Spinal Screening',  'IVDD脊椎検査'],
      ['obesity-mgmt',      '비만 관리',         'Obesity Management',     '肥満管理'],
      ['dental-scaling',    '치석 제거',         'Dental Scaling',         '歯石除去'],
    ],
    'beagle': [
      ['ear-care',          '귀 관리',           'Ear Care',               '耳ケア'],
      ['obesity-mgmt',      '비만 관리',         'Obesity Management',     '肥満管理'],
      ['epilepsy-check',    '간질 검사',         'Epilepsy Screening',     'てんかん検査'],
    ],
    'schnauzer': [
      ['pancreatitis-chk',  '췌장염 검사',       'Pancreatitis Screening', '膵炎検査'],
      ['eye-care',          '안과 검진',         'Eye Care',               '眼科検診'],
      ['allergy-treatment', '피부 알러지 치료',   'Skin Allergy Treatment', '皮膚アレルギー治療'],
    ],
    'jindo': [
      ['allergy-treatment', '피부 알러지 치료',   'Skin Allergy Treatment', '皮膚アレルギー治療'],
      ['hip-screening',     '고관절 검사',       'Hip Dysplasia Screening','股関節形成不全検査'],
    ],
    'shiba-inu': [
      ['allergy-treatment', '피부 알러지 치료',   'Skin Allergy Treatment', '皮膚アレルギー治療'],
      ['eye-care',          '안과 검진',         'Eye Care',               '眼科検診'],
      ['patella-check',     '슬개골 탈구 검사',   'Patella Luxation Check', '膝蓋骨脱臼検査'],
    ],
    'husky': [
      ['hip-screening',     '고관절 검사',       'Hip Dysplasia Screening','股関節形成不全検査'],
      ['eye-care',          '안과 검진',         'Eye Care',               '眼科検診'],
      ['thyroid-check',     '갑상선 검사',       'Thyroid Check',          '甲状腺検査'],
    ],
    'samoyed': [
      ['hip-screening',     '고관절 검사',       'Hip Dysplasia Screening','股関節形成不全検査'],
      ['cardiac-screening', '심장 검진',         'Cardiac Screening',      '心臓検診'],
      ['eye-care',          '안과 검진',         'Eye Care',               '眼科検診'],
    ],
    'akita': [
      ['hip-screening',     '고관절 검사',       'Hip Dysplasia Screening','股関節形成不全検査'],
      ['thyroid-check',     '갑상선 검사',       'Thyroid Check',          '甲状腺検査'],
      ['eye-care',          '안과 검진',         'Eye Care',               '眼科検診'],
    ],
    'chow-chow': [
      ['hip-screening',     '고관절 검사',       'Hip Dysplasia Screening','股関節形成不全検査'],
      ['eye-care',          '안과 검진',         'Eye Care',               '眼科検診'],
      ['thyroid-check',     '갑상선 검사',       'Thyroid Check',          '甲状腺検査'],
    ],
    'mixed-dog': [
      ['health-screening',  '건강 검진',         'Health Screening',       '健康診断'],
      ['dental-scaling',    '치석 제거',         'Dental Scaling',         '歯石除去'],
    ],
    'other-dog': [
      ['health-screening',  '건강 검진',         'Health Screening',       '健康診断'],
      ['dental-scaling',    '치석 제거',         'Dental Scaling',         '歯石除去'],
    ],
  },
};

// =====================================================================
//  HOSPITAL + CAT  (~40 items)
// =====================================================================
const HOSPITAL_CAT = {
  business: ['mi-business-hospital', 'hospital'],
  pet:      ['mi-ptype-cat', 'cat'],
  items: {
    'ksh': [
      ['dental-care',       '치과 관리',         'Dental Care',            '歯科ケア'],
      ['kidney-check',      '신장 검진',         'Kidney Health Check',    '腎臓検診'],
    ],
    'rblue': [
      ['kidney-check',      '신장 검진',         'Kidney Health Check',    '腎臓検診'],
      ['urinary-care',      '비뇨기 관리',       'Urinary Tract Care',     '泌尿器ケア'],
    ],
    'persian': [
      ['eye-care',          '안과 검진',         'Eye Care',               '眼科検診'],
      ['respiratory-check', '호흡기 검사',       'Respiratory Check',      '呼吸器検査'],
      ['kidney-check',      '신장 검진',         'Kidney Health Check',    '腎臓検診'],
    ],
    'british-sh': [
      ['cardiac-screening', '심장 검진',         'Cardiac Screening (HCM)','心臓検診(HCM)'],
      ['kidney-check',      '신장 검진',         'Kidney Health Check',    '腎臓検診'],
    ],
    'scottish-fold': [
      ['joint-care',        '관절 관리',         'Joint Care (Osteochondrodysplasia)', '関節ケア(骨軟骨異形成)'],
      ['cardiac-screening', '심장 검진',         'Cardiac Screening (HCM)','心臓検診(HCM)'],
    ],
    'munchkin': [
      ['spinal-screening',  '척추 검사',         'Spinal Screening',       '脊椎検査'],
      ['joint-care',        '관절 관리',         'Joint Care',             '関節ケア'],
    ],
    'siamese': [
      ['dental-care',       '치과 관리',         'Dental Care',            '歯科ケア'],
      ['respiratory-check', '호흡기 검사',       'Respiratory Check',      '呼吸器検査'],
      ['eye-care',          '안과 검진',         'Eye Care',               '眼科検診'],
    ],
    'norwegian-forest': [
      ['cardiac-screening', '심장 검진',         'Cardiac Screening (HCM)','心臓検診(HCM)'],
      ['kidney-check',      '신장 검진',         'Kidney Health Check',    '腎臓検診'],
      ['joint-care',        '관절 관리',         'Joint Care',             '関節ケア'],
    ],
    'bengal': [
      ['cardiac-screening', '심장 검진',         'Cardiac Screening (HCM)','心臓検診(HCM)'],
      ['dental-care',       '치과 관리',         'Dental Care',            '歯科ケア'],
    ],
    'ragdoll': [
      ['cardiac-screening', '심장 검진',         'Cardiac Screening (HCM)','心臓検診(HCM)'],
      ['kidney-check',      '신장 검진',         'Kidney Health Check',    '腎臓検診'],
    ],
    'sphynx': [
      ['skin-care',         '피부 관리',         'Skin Care',              'スキンケア'],
      ['cardiac-screening', '심장 검진',         'Cardiac Screening (HCM)','心臓検診(HCM)'],
      ['ear-care',          '귀 관리',           'Ear Care',               '耳ケア'],
    ],
    'maine-coon': [
      ['cardiac-screening', '심장 검진',         'Cardiac Screening (HCM)','心臓検診(HCM)'],
      ['hip-screening',     '고관절 검사',       'Hip Dysplasia Screening','股関節形成不全検査'],
      ['joint-care',        '관절 관리',         'Joint Care',             '関節ケア'],
    ],
    'american-sh': [
      ['dental-care',       '치과 관리',         'Dental Care',            '歯科ケア'],
      ['obesity-mgmt',      '비만 관리',         'Obesity Management',     '肥満管理'],
    ],
    'abyssinian': [
      ['kidney-check',      '신장 검진',         'Kidney Health Check',    '腎臓検診'],
      ['dental-care',       '치과 관리',         'Dental Care',            '歯科ケア'],
    ],
    'birman': [
      ['cardiac-screening', '심장 검진',         'Cardiac Screening (HCM)','心臓検診(HCM)'],
      ['kidney-check',      '신장 검진',         'Kidney Health Check',    '腎臓検診'],
    ],
    'burmese': [
      ['dental-care',       '치과 관리',         'Dental Care',            '歯科ケア'],
      ['diabetes-check',    '당뇨 검사',         'Diabetes Screening',     '糖尿病検査'],
    ],
    'oriental-sh': [
      ['dental-care',       '치과 관리',         'Dental Care',            '歯科ケア'],
      ['cardiac-screening', '심장 검진',         'Cardiac Screening (HCM)','心臓検診(HCM)'],
    ],
    'mixed-cat': [
      ['health-screening',  '건강 검진',         'Health Screening',       '健康診断'],
      ['dental-care',       '치과 관리',         'Dental Care',            '歯科ケア'],
    ],
    'other-cat': [
      ['health-screening',  '건강 검진',         'Health Screening',       '健康診断'],
      ['dental-care',       '치과 관리',         'Dental Care',            '歯科ケア'],
    ],
  },
};

// =====================================================================
//  TRAINING + DOG  (~50 items)
// =====================================================================
const TRAINING_DOG = {
  business: ['mi-business-training', 'training'],
  pet:      ['mi-ptype-dog', 'dog'],
  items: {
    'poodle': [
      ['agility',           '어질리티 훈련',     'Agility Training',       'アジリティトレーニング'],
      ['trick-training',    '트릭 훈련',         'Trick Training',         'トリックトレーニング'],
    ],
    'maltese': [
      ['socialization',     '사회화 훈련',       'Socialization',          '社会化トレーニング'],
      ['trick-training',    '트릭 훈련',         'Trick Training',         'トリックトレーニング'],
    ],
    'bichon-frise': [
      ['socialization',     '사회화 훈련',       'Socialization',          '社会化トレーニング'],
      ['trick-training',    '트릭 훈련',         'Trick Training',         'トリックトレーニング'],
    ],
    'shih-tzu': [
      ['socialization',     '사회화 훈련',       'Socialization',          '社会化トレーニング'],
      ['basic-obedience',   '기본 복종 훈련',    'Basic Obedience',        '基本服従訓練'],
    ],
    'yorkshire-terrier': [
      ['socialization',     '사회화 훈련',       'Socialization',          '社会化トレーニング'],
      ['basic-obedience',   '기본 복종 훈련',    'Basic Obedience',        '基本服従訓練'],
    ],
    'pomeranian': [
      ['socialization',     '사회화 훈련',       'Socialization',          '社会化トレーニング'],
      ['trick-training',    '트릭 훈련',         'Trick Training',         'トリックトレーニング'],
    ],
    'chihuahua': [
      ['socialization',     '사회화 훈련',       'Socialization',          '社会化トレーニング'],
      ['behavior-mod',      '행동 교정',         'Behavior Modification',  '行動矯正'],
    ],
    'golden': [
      ['retriever-training','리트리버 훈련',     'Retriever Training',     'レトリーバートレーニング'],
      ['therapy-dog',       '테라피독 훈련',     'Therapy Dog Training',   'セラピードッグ訓練'],
      ['agility',           '어질리티 훈련',     'Agility Training',       'アジリティトレーニング'],
    ],
    'labrador': [
      ['retriever-training','리트리버 훈련',     'Retriever Training',     'レトリーバートレーニング'],
      ['scent-work',        '노즈워크',          'Scent Work',             'セントワーク'],
      ['service-dog',       '서비스독 훈련',     'Service Dog Training',   '介助犬訓練'],
    ],
    'welsh-corgi': [
      ['herding',           '허딩 훈련',         'Herding Training',       'ハーディングトレーニング'],
      ['agility',           '어질리티 훈련',     'Agility Training',       'アジリティトレーニング'],
    ],
    'corgi': [
      ['herding',           '허딩 훈련',         'Herding Training',       'ハーディングトレーニング'],
      ['agility',           '어질리티 훈련',     'Agility Training',       'アジリティトレーニング'],
    ],
    'french-bulldog': [
      ['socialization',     '사회화 훈련',       'Socialization',          '社会化トレーニング'],
      ['basic-obedience',   '기본 복종 훈련',    'Basic Obedience',        '基本服従訓練'],
    ],
    'bulldog': [
      ['socialization',     '사회화 훈련',       'Socialization',          '社会化トレーニング'],
      ['basic-obedience',   '기본 복종 훈련',    'Basic Obedience',        '基本服従訓練'],
    ],
    'dachshund': [
      ['recall-training',   '리콜 훈련',         'Recall Training',        'リコールトレーニング'],
      ['socialization',     '사회화 훈련',       'Socialization',          '社会化トレーニング'],
    ],
    'beagle': [
      ['scent-work',        '노즈워크',          'Scent Work',             'セントワーク'],
      ['recall-training',   '리콜 훈련',         'Recall Training',        'リコールトレーニング'],
    ],
    'schnauzer': [
      ['basic-obedience',   '기본 복종 훈련',    'Basic Obedience',        '基本服従訓練'],
      ['agility',           '어질리티 훈련',     'Agility Training',       'アジリティトレーニング'],
    ],
    'jindo': [
      ['recall-training',   '리콜 훈련',         'Recall Training',        'リコールトレーニング'],
      ['socialization',     '사회화 훈련',       'Socialization',          '社会化トレーニング'],
      ['behavior-mod',      '행동 교정',         'Behavior Modification',  '行動矯正'],
    ],
    'shiba-inu': [
      ['recall-training',   '리콜 훈련',         'Recall Training',        'リコールトレーニング'],
      ['socialization',     '사회화 훈련',       'Socialization',          '社会化トレーニング'],
    ],
    'husky': [
      ['recall-training',   '리콜 훈련',         'Recall Training',        'リコールトレーニング'],
      ['mushing',           '썰매 훈련',         'Mushing Training',       'マッシングトレーニング'],
    ],
    'samoyed': [
      ['basic-obedience',   '기본 복종 훈련',    'Basic Obedience',        '基本服従訓練'],
      ['socialization',     '사회화 훈련',       'Socialization',          '社会化トレーニング'],
    ],
    'akita': [
      ['basic-obedience',   '기본 복종 훈련',    'Basic Obedience',        '基本服従訓練'],
      ['protection',        '경비 훈련',         'Protection Training',    'プロテクショントレーニング'],
    ],
    'chow-chow': [
      ['socialization',     '사회화 훈련',       'Socialization',          '社会化トレーニング'],
      ['basic-obedience',   '기본 복종 훈련',    'Basic Obedience',        '基本服従訓練'],
    ],
    'mixed-dog': [
      ['basic-obedience',   '기본 복종 훈련',    'Basic Obedience',        '基本服従訓練'],
      ['socialization',     '사회화 훈련',       'Socialization',          '社会化トレーニング'],
    ],
    'other-dog': [
      ['basic-obedience',   '기본 복종 훈련',    'Basic Obedience',        '基本服従訓練'],
      ['socialization',     '사회화 훈련',       'Socialization',          '社会化トレーニング'],
    ],
  },
};

// ─── Exports ────────────────────────────────────────────────────────
module.exports = {
  DOG_BREEDS,
  CAT_BREEDS,
  GROUPS: [GROOMING_DOG, GROOMING_CAT, HOSPITAL_DOG, HOSPITAL_CAT, TRAINING_DOG],
};
