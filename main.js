// 방울아놀자 Global Text System: UI Dictionary + Master Data + Text Entity Separation
let uiDictionary = {};
let masterRegistry = { breed: [], industry: [] };
let textEntities = {};
let currentLang = localStorage.getItem('lang') || 'ko';
let currentRole = 'user';

const LANGS = ['ko', 'en', 'ja', 'vi', 'id', 'zh', 'th', 'es', 'fr', 'de', 'it', 'pt', 'ar'];

async function initSystem() {
    // Load UI Dictionary from separate source or initial seed
    uiDictionary = {
        'app_title': { ko: '방울아놀자 - Global Pet Platform', en: 'Bang-ul Play - Global Pet Platform' },
        'app_logo': { ko: '방울아놀자', en: 'Bang-ul Play' },
        'role_user': { ko: '유저 대시보드', en: 'User Dashboard' },
        'role_provider': { ko: '공급자 대시보드', en: 'Provider Dashboard' },
        'role_admin': { ko: '마스터 관리 제어', en: 'Master Admin Control' },
        'settings_title': { ko: '개인 번역 설정', en: 'Personal Translation Settings' },
        'api_key_placeholder': { ko: '구글 API 키를 입력하세요', en: 'Enter your Google Cloud API Key' },
        'btn_save': { ko: '저장', en: 'Save' },
        'menu_admin_control': { ko: '마스터 관리 센터', en: 'Master Control Center' },
        'stat_total_users': { ko: '총 사용자', en: 'Total Users' },
        'stat_total_pets': { ko: '등록된 반려동물', en: 'Total Pets' },
        'stat_total_bookings': { ko: '예약 건수', en: 'Total Bookings' },
        'label_ui_dictionary': { ko: 'UI 사전 스튜디오', en: 'UI Dictionary Studio' },
        'label_master_studio': { ko: '마스터 데이터 스튜디오', en: 'Master Data Studio' },
        'domain_breed': { ko: '품종', en: 'Breeds' },
        'domain_industry': { ko: '업종', en: 'Industries' },
        'new_item_placeholder': { ko: '새 항목 이름...', en: 'New Item Name...' },
        'btn_add_translate': { ko: '추가 및 번역', en: 'Add & Translate' },
        'label_shop_reg': { ko: '업체 프로필 등록', en: 'Shop Profile Registration' },
        'label_industry': { ko: '업종 카테고리', en: 'Industry Category' },
        'shop_name_placeholder': { ko: '샵 이름을 입력하세요', en: 'Enter your shop name...' },
        'btn_translate': { ko: '번역하기', en: 'Translate' },
        'btn_publish_shop': { ko: '샵 프로필 공개', en: 'Publish Shop Profile' },
        'label_user_timeline': { ko: '반려견 생애 타임라인', en: 'Pet Life Timeline' },
        'modal_edit_title': { ko: '🌐 범용 번역 편집 (13개 국어)', en: '🌐 Edit Universal Translations' },
        'btn_save_changes': { ko: '변경사항 저장', en: 'Save Changes' },
        'btn_cancel': { ko: '취소', en: 'Cancel' }
    };

    seedInitialMasterData();
    setupEventListeners();
    renderAll();
}

function seedInitialMasterData() {
    // Master Items (Source: Master Data)
    registerMasterItem('industry', 'Hospital', { ko: '동물병원', en: 'Animal Hospital' });
    registerMasterItem('breed', 'Golden Retriever', { ko: '골든 리트리버', en: 'Golden Retriever' });
}

function registerMasterItem(domain, original, translations) {
    const id = `m-${domain}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    textEntities[id] = { source: 'master', domain, original_text: original, converted_json: translations };
    masterRegistry[domain].push(id);
}

// 🌐 Unified Translation Engine
function t(source, key, id = null) {
    if (source === 'ui') {
        return uiDictionary[key] ? (uiDictionary[key][currentLang] || uiDictionary[key]['en']) : key;
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

    // Admin: Master Item Add
    document.getElementById('admin-convert-btn').addEventListener('click', async () => {
        const input = document.getElementById('admin-master-input');
        const domain = document.getElementById('master-domain-selector').value;
        if (!input.value.trim()) return;
        
        // Mock translation
        const converted = {};
        LANGS.forEach(l => converted[l] = l === currentLang ? input.value : `${input.value} [${l.toUpperCase()}]`);
        
        registerMasterItem(domain, input.value, converted);
        input.value = '';
        renderAll();
    });
}

function renderAll() {
    // 1. Render all UI strings
    document.querySelectorAll('[data-ui-key]').forEach(el => {
        const key = el.getAttribute('data-ui-key');
        el.innerHTML = `${t('ui', key)} <button class="mini-edit-btn" onclick="openUniversalEditor('ui', '${key}')">📝</button>`;
    });

    // 2. Update Placeholders
    document.querySelectorAll('[data-ui-placeholder]').forEach(el => {
        el.placeholder = t('ui', el.getAttribute('data-ui-placeholder'));
    });

    // 3. Admin: Master List
    if (currentRole === 'admin') {
        const domain = document.getElementById('master-domain-selector').value;
        const table = document.getElementById('master-items-table');
        table.innerHTML = masterRegistry[domain].map(id => `
            <div class="table-row">
                <span>${t('master', '', id)}</span>
                <button onclick="openUniversalEditor('master', '', '${id}')">🌐 Edit</button>
            </div>
        `).join('');

        // UI Dictionary Table (New)
        const uiTable = document.getElementById('ui-dictionary-table');
        uiTable.innerHTML = Object.keys(uiDictionary).slice(0, 10).map(key => `
            <div class="table-row">
                <span>${key}</span>
                <button onclick="openUniversalEditor('ui', '${key}')">🌐 Edit UI</button>
            </div>
        `).join('') + '<p style="padding:10px; font-size:0.8rem">Showing top 10 keys...</p>';
    }

    // 4. Provider: Industry Dropdown
    if (currentRole === 'provider') {
        const select = document.getElementById('provider-industry-select');
        select.innerHTML = masterRegistry.industry.map(id => `
            <option value="${id}">${t('master', '', id)}</option>
        `).join('');
    }
}

document.getElementById('theme-toggle').addEventListener('click', () => document.body.classList.toggle('light-mode'));

initSystem();
window.openUniversalEditor = openUniversalEditor;
