// 방울아놀자 Global Text System: UI Dictionary Page Management
let uiDictionary = {};
let uiKeyPages = {}; // { key: [page1, page2] }
let masterRegistry = { breed: [], industry: [] };
let textEntities = {};
let currentLang = localStorage.getItem('lang') || 'ko';
let currentRole = 'user';
let uiViewMode = 'all'; // 'all' or 'page'
let selectedUIPage = 'index';

const LANGS = ['ko', 'en', 'ja', 'vi', 'id', 'zh', 'th', 'es', 'fr', 'de', 'it', 'pt', 'ar'];
const PAGES = ['index', 'login', 'signup', 'dashboard_user', 'dashboard_provider', 'dashboard_admin', 'pet_profile', 'settings', 'feed', 'reservation', 'shop_profile'];

async function initSystem() {
    uiDictionary = {
        'app_title': { ko: '방울아놀자 - Global Pet Platform', en: 'Bang-ul Play' },
        'app_logo': { ko: '방울아놀자', en: 'Bang-ul Play' },
        'role_user': { ko: '유저 대시보드', en: 'User Dashboard' },
        'role_provider': { ko: '공급자 대시보드', en: 'Provider Dashboard' },
        'role_admin': { ko: '마스터 관리 제어', en: 'Master Admin Control' },
        'settings_title': { ko: '개인 번역 설정', en: 'Personal Translation Settings' },
        'api_key_placeholder': { ko: '구글 API 키를 입력하세요', en: 'Enter API Key' },
        'btn_save': { ko: '저장', en: 'Save' },
        'label_ui_dictionary': { ko: 'UI 사전 스튜디오', en: 'UI Dictionary Studio' },
        'view_mode_all': { ko: '전체 UI 키', en: 'All UI Keys' },
        'view_mode_page': { ko: '페이지별', en: 'By Page' },
        'label_master_studio': { ko: '마스터 데이터 스튜디오', en: 'Master Data Studio' },
        'domain_breed': { ko: '품종', en: 'Breeds' },
        'domain_industry': { ko: '업종', en: 'Industries' },
        'btn_add_translate': { ko: '추가 및 번역', en: 'Add & Translate' },
        'label_shop_reg': { ko: '샵 등록', en: 'Shop Registration' },
        'label_industry': { ko: '업종', en: 'Industry' },
        'btn_translate': { ko: '번역', en: 'Translate' },
        'btn_publish_shop': { ko: '공개', en: 'Publish' },
        'label_user_timeline': { ko: '타임라인', en: 'Timeline' },
        'modal_edit_title': { ko: '🌐 번역 편집', en: '🌐 Edit Translations' },
        'btn_save_changes': { ko: '저장', en: 'Save' },
        'btn_cancel': { ko: '취소', en: 'Cancel' }
    };

    // Initial Page Mapping (Rule 5 & 9)
    uiKeyPages = {
        'app_title': ['index', 'login'],
        'app_logo': ['index'],
        'role_user': ['index'],
        'role_provider': ['index'],
        'role_admin': ['index'],
        'settings_title': ['settings'],
        'btn_save': ['settings', 'dashboard_provider', 'dashboard_admin']
    };

    seedInitialMasterData();
    setupEventListeners();
    populatePageSelector();
    renderAll();
}

function populatePageSelector() {
    const selector = document.getElementById('ui-page-selector');
    selector.innerHTML = PAGES.map(p => `<option value="${p}">${p}</option>`).join('');
    selector.value = selectedUIPage;
}

function seedInitialMasterData() {
    registerMasterItem('industry', 'Hospital', { ko: '동물병원', en: 'Animal Hospital' });
    registerMasterItem('breed', 'Golden Retriever', { ko: '골든 리트리버', en: 'Golden Retriever' });
}

function registerMasterItem(domain, original, translations) {
    const id = `m-${domain}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    textEntities[id] = { source: 'master', domain, original_text: original, converted_json: translations };
    masterRegistry[domain].push(id);
}

function t(source, key, id = null) {
    if (source === 'ui') {
        const entry = uiDictionary[key];
        if (!entry) return key;
        // Priority Rule (Rule 10): 1. Target -> 2. KO -> 3. "-"
        return entry[currentLang] || entry['ko'] || '—';
    }
    if (id && textEntities[id]) {
        return textEntities[id].converted_json[currentLang] || textEntities[id].original_text;
    }
    return key;
}

function openUniversalEditor(source, key, id = null) {
    const target = source === 'ui' ? uiDictionary[key] : textEntities[id].converted_json;
    const modal = document.getElementById('universal-modal');
    const grid = document.getElementById('modal-grid-items');
    
    grid.innerHTML = LANGS.map(lang => `
        <div class="grid-item">
            <span>${lang.toUpperCase()}</span>
            <input type="text" data-lang="${lang}" value="${target[lang] || ''}">
        </div>
    `).join('');
    
    document.getElementById('save-modal-btn').onclick = () => {
        grid.querySelectorAll('input').forEach(input => {
            target[input.dataset.lang] = input.value;
        });
        modal.classList.add('hidden');
        renderAll();
    };
    modal.classList.remove('hidden');
}

function setupEventListeners() {
    // Role & Lang
    document.getElementById('role-selector').addEventListener('change', (e) => {
        currentRole = e.target.value;
        document.querySelectorAll('.role-view').forEach(v => v.classList.add('hidden'));
        document.getElementById(`${currentRole}-view`).classList.remove('hidden');
        renderAll();
    });

    document.getElementById('lang-selector').addEventListener('change', (e) => {
        currentLang = e.target.value;
        renderAll();
    });

    // View Mode Toggle (Rule 4)
    document.querySelectorAll('input[name="ui-view-mode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            uiViewMode = e.target.value;
            document.getElementById('ui-page-selector').classList.toggle('hidden', uiViewMode === 'all');
            renderAll();
        });
    });

    document.getElementById('ui-page-selector').addEventListener('change', (e) => {
        selectedUIPage = e.target.value;
        renderAll();
    });

    // Admin: Master Item Add
    document.getElementById('admin-convert-btn').addEventListener('click', async () => {
        const input = document.getElementById('admin-master-input');
        const domain = document.getElementById('master-domain-selector').value;
        if (!input.value.trim()) return;
        const converted = {};
        LANGS.forEach(l => converted[l] = l === currentLang ? input.value : `${input.value} [${l.toUpperCase()}]`);
        registerMasterItem(domain, input.value, converted);
        input.value = '';
        renderAll();
    });
}

function renderAll() {
    // 1. Static UI Sync
    document.querySelectorAll('[data-ui-key]').forEach(el => {
        const key = el.getAttribute('data-ui-key');
        el.innerHTML = `${t('ui', key)} <button class="mini-edit-btn" onclick="openUniversalEditor('ui', '${key}')">📝</button>`;
    });

    // 2. UI Dictionary Table (Rule 2, 3, 7)
    if (currentRole === 'admin') {
        const table = document.getElementById('ui-dictionary-table');
        let keys = Object.keys(uiDictionary);
        
        if (uiViewMode === 'page') {
            keys = keys.filter(k => uiKeyPages[k] && uiKeyPages[k].includes(selectedUIPage));
        }

        table.innerHTML = keys.map(key => `
            <div class="table-row">
                <span class="key-name">${key}</span>
                <span class="current-val">[${t('ui', key)}]</span>
                <button onclick="openUniversalEditor('ui', '${key}')">Edit UI</button>
            </div>
        `).join('') || '<p style="padding:20px; color:var(--text-dim)">No keys mapped to this page.</p>';

        // Master Data Table
        const domain = document.getElementById('master-domain-selector').value;
        const masterTable = document.getElementById('master-items-table');
        masterTable.innerHTML = masterRegistry[domain].map(id => `
            <div class="table-row">
                <span>${t('master', '', id)}</span>
                <button onclick="openUniversalEditor('master', '', '${id}')">🌐 Edit</button>
            </div>
        `).join('');
    }

    // Provider & User view logic...
    if (currentRole === 'provider') {
        const select = document.getElementById('provider-industry-select');
        select.innerHTML = masterRegistry.industry.map(id => `<option value="${id}">${t('master', '', id)}</option>`).join('');
    }
}

document.getElementById('theme-toggle').addEventListener('click', () => document.body.classList.toggle('light-mode'));

initSystem();
window.openUniversalEditor = openUniversalEditor;
