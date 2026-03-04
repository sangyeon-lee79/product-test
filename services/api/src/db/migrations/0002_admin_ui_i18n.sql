-- Migration 0002: Admin UI i18n 키 등록 (하드코딩 제로 원칙)
-- PLAN §0: UI 만들기 전 i18n 키 먼저 DB에 등록
-- 페이지: admin (네비/공통/로그인/대시보드/i18n/마스터/질병매핑)

-- ─── 공통 ───────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO i18n_translations (id, key, page, ko, en) VALUES
  (lower(hex(randomblob(16))), 'admin.common.save',       'admin', '저장',      'Save'),
  (lower(hex(randomblob(16))), 'admin.common.cancel',     'admin', '취소',      'Cancel'),
  (lower(hex(randomblob(16))), 'admin.common.add',        'admin', '추가',      'Add'),
  (lower(hex(randomblob(16))), 'admin.common.edit',       'admin', '편집',      'Edit'),
  (lower(hex(randomblob(16))), 'admin.common.deactivate', 'admin', '비활성화',  'Deactivate'),
  (lower(hex(randomblob(16))), 'admin.common.disconnect', 'admin', '연결해제',  'Disconnect'),
  (lower(hex(randomblob(16))), 'admin.common.active',     'admin', '활성',      'Active'),
  (lower(hex(randomblob(16))), 'admin.common.inactive',   'admin', '비활성',    'Inactive'),
  (lower(hex(randomblob(16))), 'admin.common.required',   'admin', '필수',      'Required'),
  (lower(hex(randomblob(16))), 'admin.common.default',    'admin', '기본',      'Default'),
  (lower(hex(randomblob(16))), 'admin.common.loading',    'admin', '로딩 중...','Loading...'),
  (lower(hex(randomblob(16))), 'admin.common.saving',     'admin', '저장중...', 'Saving...'),
  (lower(hex(randomblob(16))), 'admin.common.logout',     'admin', '로그아웃',  'Logout'),
  (lower(hex(randomblob(16))), 'admin.common.no_data',    'admin', '데이터가 없습니다', 'No data'),
  (lower(hex(randomblob(16))), 'admin.common.select',     'admin', '선택...',   'Select...'),
  (lower(hex(randomblob(16))), 'admin.common.sort_order', 'admin', '정렬 순서', 'Sort order'),
  (lower(hex(randomblob(16))), 'admin.common.key',        'admin', '키',        'Key'),
  (lower(hex(randomblob(16))), 'admin.common.status',     'admin', '상태',      'Status'),
  (lower(hex(randomblob(16))), 'admin.common.action',     'admin', '작업',      'Action'),
  (lower(hex(randomblob(16))), 'admin.common.prev',       'admin', '이전',      'Prev'),
  (lower(hex(randomblob(16))), 'admin.common.next',       'admin', '다음',      'Next');

-- ─── 네비게이션 ──────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO i18n_translations (id, key, page, ko, en) VALUES
  (lower(hex(randomblob(16))), 'admin.section.dashboard',  'admin', '대시보드',    'Dashboard'),
  (lower(hex(randomblob(16))), 'admin.section.data',       'admin', '데이터 관리', 'Data Management'),
  (lower(hex(randomblob(16))), 'admin.section.ads',        'admin', '광고 / 운영', 'Ads / Operations'),
  (lower(hex(randomblob(16))), 'admin.nav.dashboard',      'admin', '분석 대시보드',   'Analytics Dashboard'),
  (lower(hex(randomblob(16))), 'admin.nav.i18n',           'admin', '언어 관리',       'Language'),
  (lower(hex(randomblob(16))), 'admin.nav.master',         'admin', '마스터 데이터',   'Master Data'),
  (lower(hex(randomblob(16))), 'admin.nav.countries',      'admin', '국가 / 통화',     'Countries / Currencies'),
  (lower(hex(randomblob(16))), 'admin.nav.disease_maps',   'admin', '질병 연결 매핑',  'Disease Mapping'),
  (lower(hex(randomblob(16))), 'admin.nav.ads',            'admin', '광고 설정',       'Ads Settings');

-- ─── 로그인 ──────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO i18n_translations (id, key, page, ko, en) VALUES
  (lower(hex(randomblob(16))), 'admin.login.app_name',   'admin.login', '방울아 놀자',                          'Bang-ul Play'),
  (lower(hex(randomblob(16))), 'admin.login.console',    'admin.login', 'Admin Console',                        'Admin Console'),
  (lower(hex(randomblob(16))), 'admin.login.email',      'admin.login', '이메일 (테스트 로그인)',               'Email (Test Login)'),
  (lower(hex(randomblob(16))), 'admin.login.submit',     'admin.login', '로그인',                               'Login'),
  (lower(hex(randomblob(16))), 'admin.login.loading',    'admin.login', '로그인 중...',                         'Logging in...'),
  (lower(hex(randomblob(16))), 'admin.login.dev_note',   'admin.login', '개발용 테스트 로그인 (OAuth는 S12에서 구현)', 'Dev test login (OAuth in S12)'),
  (lower(hex(randomblob(16))), 'admin.login.error',      'admin.login', '로그인 실패',                          'Login failed');

-- ─── 대시보드 ─────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO i18n_translations (id, key, page, ko, en) VALUES
  (lower(hex(randomblob(16))), 'admin.dashboard.title',       'admin.dashboard', '분석 대시보드',         'Analytics Dashboard'),
  (lower(hex(randomblob(16))), 'admin.dashboard.api_status',  'admin.dashboard', 'API 상태',              'API Status'),
  (lower(hex(randomblob(16))), 'admin.dashboard.env',         'admin.dashboard', '환경',                  'Environment'),
  (lower(hex(randomblob(16))), 'admin.dashboard.db',          'admin.dashboard', 'DB',                    'DB'),
  (lower(hex(randomblob(16))), 'admin.dashboard.status_ok',   'admin.dashboard', '정상',                  'OK'),
  (lower(hex(randomblob(16))), 'admin.dashboard.status_error','admin.dashboard', '오류',                  'Error'),
  (lower(hex(randomblob(16))), 'admin.dashboard.checking',    'admin.dashboard', '확인중...',             'Checking...'),
  (lower(hex(randomblob(16))), 'admin.dashboard.connecting',  'admin.dashboard', '연결중...',             'Connecting...'),
  (lower(hex(randomblob(16))), 'admin.dashboard.progress',    'admin.dashboard', '개발 진행 현황 (PLAN.md)', 'Development Progress (PLAN.md)');

-- ─── 언어 관리 (i18n) ─────────────────────────────────────────────────────────
INSERT OR IGNORE INTO i18n_translations (id, key, page, ko, en) VALUES
  (lower(hex(randomblob(16))), 'admin.i18n.title',             'admin.i18n', '언어 관리 (i18n)',          'Language Management'),
  (lower(hex(randomblob(16))), 'admin.i18n.add_btn',           'admin.i18n', '+ 번역 키 추가',            '+ Add Key'),
  (lower(hex(randomblob(16))), 'admin.i18n.search_prefix',     'admin.i18n', '키 접두사 검색',            'Search by prefix'),
  (lower(hex(randomblob(16))), 'admin.i18n.active_only',       'admin.i18n', '활성만 보기',               'Active only'),
  (lower(hex(randomblob(16))), 'admin.i18n.col_key',           'admin.i18n', '키',                        'Key'),
  (lower(hex(randomblob(16))), 'admin.i18n.col_page',          'admin.i18n', '페이지',                    'Page'),
  (lower(hex(randomblob(16))), 'admin.i18n.col_ko',            'admin.i18n', '한국어',                    'Korean'),
  (lower(hex(randomblob(16))), 'admin.i18n.col_en',            'admin.i18n', 'English',                   'English'),
  (lower(hex(randomblob(16))), 'admin.i18n.modal_create',      'admin.i18n', '번역 키 추가',              'Add Translation Key'),
  (lower(hex(randomblob(16))), 'admin.i18n.modal_edit',        'admin.i18n', '번역 수정',                 'Edit Translation'),
  (lower(hex(randomblob(16))), 'admin.i18n.field_key',         'admin.i18n', '키 *',                      'Key *'),
  (lower(hex(randomblob(16))), 'admin.i18n.field_page',        'admin.i18n', '페이지',                    'Page'),
  (lower(hex(randomblob(16))), 'admin.i18n.field_active',      'admin.i18n', '활성화',                    'Active'),
  (lower(hex(randomblob(16))), 'admin.i18n.confirm_deactivate','admin.i18n', '이 번역 키를 비활성화하시겠습니까?', 'Deactivate this key?'),
  (lower(hex(randomblob(16))), 'admin.i18n.success_create',    'admin.i18n', '번역 키가 추가되었습니다.',  'Key added.'),
  (lower(hex(randomblob(16))), 'admin.i18n.success_edit',      'admin.i18n', '번역이 수정되었습니다.',     'Translation updated.'),
  (lower(hex(randomblob(16))), 'admin.i18n.success_deactivate','admin.i18n', '비활성화되었습니다.',        'Deactivated.');

-- ─── 마스터 데이터 ────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO i18n_translations (id, key, page, ko, en) VALUES
  (lower(hex(randomblob(16))), 'admin.master.title',           'admin.master', '마스터 데이터 관리',       'Master Data'),
  (lower(hex(randomblob(16))), 'admin.master.categories',      'admin.master', '카테고리',                 'Categories'),
  (lower(hex(randomblob(16))), 'admin.master.add_category',    'admin.master', '+ 추가',                   '+ Add'),
  (lower(hex(randomblob(16))), 'admin.master.add_item',        'admin.master', '+ 아이템 추가',            '+ Add Item'),
  (lower(hex(randomblob(16))), 'admin.master.select_hint',     'admin.master', '카테고리를 선택하세요',    'Select a category'),
  (lower(hex(randomblob(16))), 'admin.master.no_category',     'admin.master', '카테고리 없음',            'No categories'),
  (lower(hex(randomblob(16))), 'admin.master.no_item',         'admin.master', '아이템이 없습니다',        'No items'),
  (lower(hex(randomblob(16))), 'admin.master.modal_create_cat','admin.master', '카테고리 추가',            'Add Category'),
  (lower(hex(randomblob(16))), 'admin.master.modal_edit_cat',  'admin.master', '카테고리 수정',            'Edit Category'),
  (lower(hex(randomblob(16))), 'admin.master.modal_edit_item', 'admin.master', '아이템 수정',              'Edit Item'),
  (lower(hex(randomblob(16))), 'admin.master.success_cat_add', 'admin.master', '카테고리가 추가되었습니다.','Category added.'),
  (lower(hex(randomblob(16))), 'admin.master.success_cat_edit','admin.master', '카테고리가 수정되었습니다.','Category updated.'),
  (lower(hex(randomblob(16))), 'admin.master.success_item_add','admin.master', '아이템이 추가되었습니다.', 'Item added.'),
  (lower(hex(randomblob(16))), 'admin.master.success_item_edit','admin.master','아이템이 수정되었습니다.', 'Item updated.'),
  (lower(hex(randomblob(16))), 'admin.master.success_done',    'admin.master', '처리되었습니다.',           'Done.');

-- ─── 질병 연결 매핑 ───────────────────────────────────────────────────────────
INSERT OR IGNORE INTO i18n_translations (id, key, page, ko, en) VALUES
  (lower(hex(randomblob(16))), 'admin.disease_maps.title',         'admin.disease_maps', '질병 연결 매핑',        'Disease Mapping'),
  (lower(hex(randomblob(16))), 'admin.disease_maps.select_disease','admin.disease_maps', '질병 선택',             'Select Disease'),
  (lower(hex(randomblob(16))), 'admin.disease_maps.no_disease',    'admin.disease_maps', '질병 없음',             'No diseases'),
  (lower(hex(randomblob(16))), 'admin.disease_maps.add_symptom',   'admin.disease_maps', '+ 증상 연결',           '+ Link Symptom'),
  (lower(hex(randomblob(16))), 'admin.disease_maps.add_metric',    'admin.disease_maps', '+ 수치 연결',           '+ Link Metric'),
  (lower(hex(randomblob(16))), 'admin.disease_maps.unit',          'admin.disease_maps', '단위',                  'Unit'),
  (lower(hex(randomblob(16))), 'admin.disease_maps.logtype',       'admin.disease_maps', '기록유형',              'Log Type'),
  (lower(hex(randomblob(16))), 'admin.disease_maps.add_unit',      'admin.disease_maps', '단위 추가',             'Add Unit'),
  (lower(hex(randomblob(16))), 'admin.disease_maps.add_logtype',   'admin.disease_maps', '기록유형 추가',         'Add Log Type'),
  (lower(hex(randomblob(16))), 'admin.disease_maps.select_hint',   'admin.disease_maps', '왼쪽에서 질병을 선택하세요', 'Select a disease'),
  (lower(hex(randomblob(16))), 'admin.disease_maps.mapping',       'admin.disease_maps', '매핑',                  'Mapping');

-- ─── 국가/통화 ────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO i18n_translations (id, key, page, ko, en) VALUES
  (lower(hex(randomblob(16))), 'admin.countries.title',                'admin.countries', '국가 / 통화 관리',                   'Countries / Currencies'),
  (lower(hex(randomblob(16))), 'admin.countries.add_country',          'admin.countries', '+ 국가 추가',                        '+ Add Country'),
  (lower(hex(randomblob(16))), 'admin.countries.add_currency',         'admin.countries', '+ 통화 추가',                        '+ Add Currency'),
  (lower(hex(randomblob(16))), 'admin.countries.tab_countries',        'admin.countries', '국가',                               'Countries'),
  (lower(hex(randomblob(16))), 'admin.countries.tab_currencies',       'admin.countries', '통화',                               'Currencies'),
  (lower(hex(randomblob(16))), 'admin.countries.no_country',           'admin.countries', '국가 없음',                          'No countries'),
  (lower(hex(randomblob(16))), 'admin.countries.no_currency',          'admin.countries', '통화 없음',                          'No currencies'),
  (lower(hex(randomblob(16))), 'admin.countries.modal_create_country', 'admin.countries', '국가 추가',                          'Add Country'),
  (lower(hex(randomblob(16))), 'admin.countries.modal_edit_country',   'admin.countries', '국가 수정',                          'Edit Country'),
  (lower(hex(randomblob(16))), 'admin.countries.modal_create_currency','admin.countries', '통화 추가',                          'Add Currency'),
  (lower(hex(randomblob(16))), 'admin.countries.modal_edit_currency',  'admin.countries', '통화 수정',                          'Edit Currency'),
  (lower(hex(randomblob(16))), 'admin.countries.col_code',             'admin.countries', '코드',                               'Code'),
  (lower(hex(randomblob(16))), 'admin.countries.col_i18n_key',         'admin.countries', 'i18n 키',                            'i18n Key'),
  (lower(hex(randomblob(16))), 'admin.countries.col_symbol',           'admin.countries', '기호',                               'Symbol'),
  (lower(hex(randomblob(16))), 'admin.countries.col_decimal',          'admin.countries', '소수점',                             'Decimal'),
  (lower(hex(randomblob(16))), 'admin.countries.field_country_code',   'admin.countries', '국가 코드 * (ISO 3166-1 alpha-2)',    'Country Code * (ISO 3166-1 alpha-2)'),
  (lower(hex(randomblob(16))), 'admin.countries.field_i18n_key',       'admin.countries', 'i18n 키 *',                          'i18n Key *'),
  (lower(hex(randomblob(16))), 'admin.countries.field_symbol',         'admin.countries', '기호 *',                             'Symbol *'),
  (lower(hex(randomblob(16))), 'admin.countries.field_decimal_places', 'admin.countries', '소수점 자리수',                      'Decimal Places'),
  (lower(hex(randomblob(16))), 'admin.countries.success_add_country',  'admin.countries', '국가가 추가되었습니다.',              'Country added.'),
  (lower(hex(randomblob(16))), 'admin.countries.success_add_currency', 'admin.countries', '통화가 추가되었습니다.',              'Currency added.'),
  (lower(hex(randomblob(16))), 'admin.countries.success_edit',         'admin.countries', '수정되었습니다.',                    'Updated.');

-- ─── 질병매핑 플래시 메시지 ───────────────────────────────────────────────────
INSERT OR IGNORE INTO i18n_translations (id, key, page, ko, en) VALUES
  (lower(hex(randomblob(16))), 'admin.disease_maps.success_add_symptom',    'admin.disease_maps', '증상 연결 완료',      'Symptom linked.'),
  (lower(hex(randomblob(16))), 'admin.disease_maps.success_remove_symptom', 'admin.disease_maps', '증상 연결 해제',      'Symptom unlinked.'),
  (lower(hex(randomblob(16))), 'admin.disease_maps.success_add_metric',     'admin.disease_maps', '수치 연결 완료',      'Metric linked.'),
  (lower(hex(randomblob(16))), 'admin.disease_maps.success_remove_metric',  'admin.disease_maps', '수치 연결 해제',      'Metric unlinked.'),
  (lower(hex(randomblob(16))), 'admin.disease_maps.success_add_unit',       'admin.disease_maps', '단위 연결 완료',      'Unit linked.'),
  (lower(hex(randomblob(16))), 'admin.disease_maps.success_remove_unit',    'admin.disease_maps', '단위 연결 해제',      'Unit unlinked.'),
  (lower(hex(randomblob(16))), 'admin.disease_maps.success_add_logtype',    'admin.disease_maps', '기록유형 연결 완료',  'Log type linked.'),
  (lower(hex(randomblob(16))), 'admin.disease_maps.success_remove_logtype', 'admin.disease_maps', '기록유형 연결 해제',  'Log type unlinked.'),
  (lower(hex(randomblob(16))), 'admin.disease_maps.no_mapping',             'admin.disease_maps', '매핑 데이터 없음',    'No mapping data.'),
  (lower(hex(randomblob(16))), 'admin.disease_maps.symptom',                'admin.disease_maps', '증상',                'Symptom'),
  (lower(hex(randomblob(16))), 'admin.disease_maps.metric',                 'admin.disease_maps', '수치',                'Metric');

-- ─── 추가 공통 / 마스터 ──────────────────────────────────────────────────────
INSERT OR IGNORE INTO i18n_translations (id, key, page, ko, en) VALUES
  (lower(hex(randomblob(16))), 'admin.common.account',                   'admin', '계정',                          'Account'),
  (lower(hex(randomblob(16))), 'admin.master.modal_create_item',         'admin.master', '아이템 추가',             'Add Item'),
  (lower(hex(randomblob(16))), 'admin.master.confirm_delete_cat',        'admin.master', '카테고리를 삭제하시겠습니까? 아이템이 있으면 비활성화됩니다.', 'Delete category? Items will be deactivated.'),
  (lower(hex(randomblob(16))), 'admin.master.confirm_deactivate_item',   'admin.master', '아이템을 비활성화하시겠습니까?', 'Deactivate this item?');

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0002_admin_ui_i18n');
