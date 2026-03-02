// 방울아놀자 Integrated System: UI Dictionary + Master Menu + Dashboards + Universal Edit
let uiDictionary = {};
let uiKeyPages = {};
let masterRegistry = { breed: [], industry: [] };
let textEntities = {};
let registeredShops = [];

let currentLang = localStorage.getItem('lang') || 'ko';
let currentRole = 'user';
let uiViewMode = 'all';
let selectedUIPage = 'index';

const LANGS = ['ko', 'en', 'ja', 'vi', 'id', 'zh', 'th', 'es', 'fr', 'de', 'it', 'pt', 'ar'];
const PAGES = ['index', 'login', 'signup', 'dashboard_user', 'dashboard_provider', 'dashboard_admin', 'pet_profile', 'settings', 'feed', 'reservation', 'shop_profile'];

async function initSystem() {
    // 1. UI Dictionary Data
    uiDictionary = {
        'app_title': { ko: '방울아놀자 - Global Pet Platform', en: 'Bang-ul Play' },
        'app_logo': { ko: '방울아놀자', en: 'Bang-ul Play' },
        'role_user': { ko: '보호자 모드', en: 'User Dashboard' },
        'role_provider': { ko: '공급자 모드', en: 'Provider Dashboard' },
        'role_admin': { ko: '마스터 관리자', en: 'Master Admin' },
        'settings_title': { ko: '개인 번역 설정', en: 'Translation Settings' },
        'api_key_placeholder': { ko: 'Google API 키 입력', en: 'Enter API Key' },
        'btn_save': { ko: '저장', en: 'Save' },
        'label_ui_dictionary': { ko: 'UI 사전 스튜디오', en: 'UI Dictionary Studio' },
        'view_mode_all': { ko: '전체 키', en: 'All Keys' },
        'view_mode_page': { ko: '페이지별', en: 'By Page' },
        'label_master_studio': { ko: '마스터 데이터 스튜디오', en: 'Master Data Studio' },
        'domain_breed': { ko: '품종', en: 'Breeds' },
        'domain_industry': { ko: '업종', en: 'Industries' },
        'btn_add_translate': { ko: '추가 및 번역', en: 'Add & Translate' },
        'label_shop_reg': { ko: '샵 프로필 등록', en: 'Shop Registration' },
        'label_industry': { ko: '업종 카테고리', en: 'Industry Category' },
        'btn_translate': { ko: '번역', en: 'Translate' },
        'btn_publish_shop': { ko: '공개', en: 'Publish' },
        'label_user_timeline': { ko: '생애 타임라인', en: 'Pet Timeline' },
        'modal_edit_title': { ko: '🌐 번역 편집', en: '🌐 Edit Translations' },
        'btn_save_changes': { ko: '저장', en: 'Save' },
        'btn_cancel': { ko: '취소', en: 'Cancel' }
    };

    uiKeyPages = {
        'app_title': ['index', 'login'],
        'app_logo': ['index'],
        'role_user': ['index'],
        'role_provider': ['index'],
        'role_admin': ['index']
    };

    seedInitialData();
    setupEventListeners();
    initTheme(); // 테마 초기화
    renderAll();
}

function seedInitialData() {
    registerMasterItem('industry', 'Grooming', { ko: '애견미용', en: 'Dog Grooming' });
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
        return entry ? (entry[currentLang] || entry['ko'] || '—') : key;
    }
    if (id && textEntities[id]) {
        return textEntities[id].converted_json[currentLang] || textEntities[id].original_text;
    }
    return key;
}

// 🌓 Theme Logic
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') document.body.classList.add('light-mode');
}

function toggleTheme() {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

// 🌐 Universal Editor
function openUniversalEditor(source, key, id = null) {
    const target = source === 'ui' ? uiDictionary[key] : textEntities[id].converted_json;
    const modal = document.getElementById('universal-modal');
    const grid = document.getElementById('modal-grid-items');
    grid.innerHTML = LANGS.map(lang => `
        <div class="grid-item"><span>${lang.toUpperCase()}</span><input type="text" data-lang="${lang}" value="${target[lang] || ''}"></div>
    `).join('');
    document.getElementById('save-modal-btn').onclick = () => {
        grid.querySelectorAll('input').forEach(input => { target[input.dataset.lang] = input.value; });
        modal.classList.add('hidden');
        renderAll();
    };
    modal.classList.remove('hidden');
}

function setupEventListeners() {
    // Theme Toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

    // Role Switching
    document.getElementById('role-selector').addEventListener('change', (e) => {
        currentRole = e.target.value;
        document.querySelectorAll('.role-view').forEach(v => v.classList.add('hidden'));
        document.getElementById(`${currentRole}-view`).classList.remove('hidden');
        renderAll();
    });

    // Lang Switching
    document.getElementById('lang-selector').addEventListener('change', (e) => {
        currentLang = e.target.value;
        localStorage.setItem('lang', currentLang);
        renderAll();
    });

    // Admin: Add Master Item
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

    // Provider: Shop Registration
    document.getElementById('provider-convert-btn').addEventListener('click', () => {
        const input = document.getElementById('provider-shop-input');
        if (!input.value.trim()) return;
        const converted = {};
        LANGS.forEach(l => converted[l] = l === currentLang ? input.value : `${input.value} [${l.toUpperCase()}]`);
        const grid = document.getElementById('provider-grid-items');
        grid.innerHTML = LANGS.map(l => `<div class="grid-item"><span>${l.toUpperCase()}</span><input type="text" data-lang="${l}" value="${converted[l]}"></div>`).join('');
        document.getElementById('provider-conversion-preview').classList.remove('hidden');
    });

    document.getElementById('save-shop-btn').addEventListener('click', () => {
        const entityId = `shop-${Date.now()}`;
        const converted = {};
        document.querySelectorAll('#provider-grid-items input').forEach(input => { converted[input.dataset.lang] = input.value; });
        textEntities[entityId] = { domain: 'shop', original_text: 'Shop', converted_json: converted };
        registeredShops.push({ id: entityId, industry_item_id: document.getElementById('provider-industry-select').value });
        document.getElementById('provider-conversion-preview').classList.add('hidden');
        renderAll();
        alert('Shop Registered!');
    });

    // UI View Mode Toggle
    document.querySelectorAll('input[name="ui-view-mode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            uiViewMode = e.target.value;
            document.getElementById('ui-page-selector').classList.toggle('hidden', uiViewMode === 'all');
            renderAll();
        });
    });
}

function renderAll() {
    // 1. Static UI Sync
    document.querySelectorAll('[data-ui-key]').forEach(el => {
        const key = el.getAttribute('data-ui-key');
        el.innerHTML = `${t('ui', key)} <button class="mini-edit-btn" onclick="openUniversalEditor('ui', '${key}')">📝</button>`;
    });

    // 2. Admin Table
    if (currentRole === 'admin') {
        const table = document.getElementById('ui-dictionary-table');
        let keys = Object.keys(uiDictionary);
        if (uiViewMode === 'page') keys = keys.filter(k => uiKeyPages[k] && uiKeyPages[k].includes(selectedUIPage));
        table.innerHTML = keys.map(key => `
            <div class="table-row"><span class="key-name">${key}</span><span class="current-val">[${t('ui', key)}]</span><button onclick="openUniversalEditor('ui', '${key}')">Edit UI</button></div>
        `).join('');

        const masterTable = document.getElementById('master-items-table');
        const domain = document.getElementById('master-domain-selector').value;
        masterTable.innerHTML = masterRegistry[domain].map(id => `
            <div class="table-row"><span>${t('master', '', id)}</span><button onclick="openUniversalEditor('master', '', '${id}')">🌐 Edit</button></div>
        `).join('');
    }

    // 3. Provider Dropdown
    if (currentRole === 'provider') {
        const select = document.getElementById('provider-industry-select');
        select.innerHTML = masterRegistry.industry.map(id => `<option value="${id}">${t('master', '', id)}</option>`).join('');
    }

    // 4. User Feed
    if (currentRole === 'user') {
        const feed = document.getElementById('timeline-feed');
        feed.innerHTML = registeredShops.map(shop => `
            <div class="timeline-event event-shop"><div class="timeline-dot"></div><div class="timeline-card"><div class="event-header"><span class="event-date">2024-03-02</span><span class="industry-tag">${t('master', '', shop.industry_item_id)}</span></div><h3>${t('shop', '', shop.id)}</h3></div></div>
        `).join('') || '<p style="text-align:center; color:var(--text-dim)">No items yet.</p>';
    }
}

initSystem();
window.openUniversalEditor = openUniversalEditor;
