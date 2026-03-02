// Bang-ul Play: Refined MVP Logic (Fix: Admin Add New & 100% Translation)
let uiDictionary = {};
let masterRegistry = { breed: [], industry: [], country: [], product: [] };
let textEntities = {};
let currentStore = null; 

let currentLang = localStorage.getItem('lang') || 'ko';
let currentRole = 'user';

const LANGS = ['ko', 'en', 'ja', 'vi', 'id', 'zh', 'th', 'es', 'fr', 'de', 'it', 'pt', 'ar'];

async function initSystem() {
    uiDictionary = {
        'app_logo': { ko: '방울아놀자', en: 'Bang-ul Play' },
        'role_user': { ko: '보호자', en: 'Pet Owner' },
        'role_provider': { ko: '공급자', en: 'Provider' },
        'role_admin': { ko: '관리자', en: 'Admin' },
        'btn_save': { ko: '저장', en: 'Save' },
        'btn_add_new': { ko: '새 항목 추가', en: 'Add New' },
        'label_master_studio': { ko: '마스터 데이터 관리', en: 'Master Data Studio' },
        'label_shop_profile': { ko: '상점 프로필', en: 'Store Profile' },
        'label_industry_cat': { ko: '업종 카테고리', en: 'Industry Category' },
        'modal_master_title': { ko: '🌐 새 마스터 항목 등록', en: '🌐 Register Master Item' }
    };

    seedInitialData();
    setupEventListeners();
    renderAll();
}

function seedInitialData() {
    registerMasterItem('industry', 'Grooming', { ko: '애견미용', en: 'Grooming' });
    registerCountry('South Korea', 'KRW', '₩', { ko: '대한민국', en: 'South Korea' });
}

function registerMasterItem(domain, original, translations) {
    const id = `m-${domain}-${Date.now()}`;
    textEntities[id] = { source: 'master', domain, original_text: original, converted_json: translations };
    masterRegistry[domain].push(id);
    return id;
}

function registerCountry(name, currency, symbol, translations) {
    const id = registerMasterItem('country', name, translations);
    textEntities[id].currency_code = currency;
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

// 🌐 Translation Engine (Simulation)
async function getTranslations(text, sourceLang) {
    const results = {};
    LANGS.forEach(l => {
        results[l] = l === sourceLang ? text : `${text} [${l.toUpperCase()}]`;
    });
    return results;
}

// --- MASTER ADMIN: CREATE FLOW (FIXED) ---
async function showMasterCreateForm() {
    const domain = document.getElementById('admin-master-domain').value;
    const name = prompt(`Enter new ${domain} name:`);
    if (!name) return;

    const translations = await getTranslations(name, currentLang);
    
    // Open Universal Editor for inspection before saving
    const tempId = `temp-${Date.now()}`;
    textEntities[tempId] = { domain, original_text: name, converted_json: translations };
    
    openUniversalEditor('master', '', tempId, () => {
        const finalItem = textEntities[tempId];
        registerMasterItem(domain, finalItem.original_text, finalItem.converted_json);
        delete textEntities[tempId];
        renderAll();
    });
}

function openUniversalEditor(source, key, id = null, saveCallback = null) {
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
        if (saveCallback) saveCallback();
        renderAll();
    };
    modal.classList.remove('hidden');
}

function setupEventListeners() {
    document.getElementById('role-selector').addEventListener('change', (e) => {
        currentRole = e.target.value;
        renderAll();
    });

    document.getElementById('lang-selector').addEventListener('change', (e) => {
        currentLang = e.target.value;
        localStorage.setItem('lang', currentLang);
        renderAll();
    });
}

function renderAll() {
    document.querySelectorAll('.role-view').forEach(v => v.classList.add('hidden'));
    document.getElementById(`${currentRole}-view`).classList.remove('hidden');

    // UI Key Sync (Includes Roles)
    document.querySelectorAll('[data-ui-key]').forEach(el => {
        const key = el.getAttribute('data-ui-key');
        el.textContent = t('ui', key);
    });

    if (currentRole === 'admin') renderAdmin();
    if (currentRole === 'provider') renderProvider();
}

function renderAdmin() {
    const container = document.getElementById('admin-content');
    container.innerHTML = `
        <div class="card">
            <h3 data-ui-key="label_master_studio">${t('ui', 'label_master_studio')}</h3>
            <div class="studio-actions">
                <select id="admin-master-domain" onchange="renderAdminList()">
                    <option value="industry">Industries</option>
                    <option value="country">Countries</option>
                </select>
                <button class="save-btn" onclick="showMasterCreateForm()">+ ${t('ui', 'btn_add_new')}</button>
            </div>
            <div id="admin-master-list" class="list-container"></div>
        </div>
    `;
    renderAdminList();
}

function renderAdminList() {
    const domain = document.getElementById('admin-master-domain').value;
    const list = document.getElementById('admin-master-list');
    list.innerHTML = masterRegistry[domain].map(id => `
        <div class="list-item">
            <span>${t('master', '', id)}</span>
            <button onclick="openUniversalEditor('master', '', '${id}')">🌐 Edit</button>
        </div>
    `).join('');
}

function renderProvider() {
    const container = document.getElementById('provider-content');
    if (!currentStore) {
        container.innerHTML = `
            <div class="card">
                <h3>${t('ui', 'label_shop_reg')}</h3>
                <div class="input-container"><label>${t('ui', 'label_industry_cat')}</label>
                    <select id="p-industry">
                        ${masterRegistry.industry.map(id => `<option value="${id}">${t('master', '', id)}</option>`).join('')}
                    </select>
                </div>
                <button class="save-btn">Create</button>
            </div>
        `;
    }
}

initSystem();
window.showMasterCreateForm = showMasterCreateForm;
window.renderAdminList = renderAdminList;
window.openUniversalEditor = openUniversalEditor;
