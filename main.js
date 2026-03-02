// Bang-ul Play: Ultimate MVP Integration Logic
let uiDictionary = {};
let uiKeyPages = {};
let masterRegistry = { breed: [], industry: [], country: [], product: [] };
let textEntities = {};
let registeredShops = [];
let currentStore = null; 

let currentLang = localStorage.getItem('lang') || 'ko';
let currentRole = 'user';
let uiViewMode = 'all';
let selectedUIPage = 'index';

const LANGS = ['ko', 'en', 'ja', 'vi', 'id', 'zh', 'th', 'es', 'fr', 'de', 'it', 'pt', 'ar'];
const PAGES = ['index', 'pet', 'provider', 'admin', 'feed', 'booking', 'settings'];

async function initSystem() {
    uiDictionary = {
        'app_logo': { ko: '방울아놀자', en: 'Bang-ul Play' },
        'role_user': { ko: '보호자', en: 'User' },
        'role_provider': { ko: '공급자', en: 'Provider' },
        'role_admin': { ko: '관리자', en: 'Admin' },
        'btn_save': { ko: '저장', en: 'Save' },
        'label_master_studio': { ko: '마스터 데이터 관리', en: 'Master Data Studio' },
        'label_ui_studio': { ko: 'UI 사전 관리', en: 'UI Dictionary Studio' },
        'label_shop_profile': { ko: '상점 프로필', en: 'Store Profile' },
        'label_inventory': { ko: '재고/상품 관리', en: 'Inventory' },
        'label_services': { ko: '서비스 관리', en: 'Services' },
        'label_reservations': { ko: '예약 현황', en: 'Reservations' },
        'label_timeline': { ko: '생애 타임라인', en: 'Pet Timeline' },
        'placeholder_search': { ko: '검색어를 입력하세요', en: 'Search...' }
    };

    seedInitialData();
    setupEventListeners();
    initTheme();
    renderAll();
}

function seedInitialData() {
    // 1. Countries (Admin Master)
    registerCountry('South Korea', 'KRW', '₩', { ko: '대한민국', en: 'South Korea' });
    registerCountry('Vietnam', 'VND', '₫', { ko: '베트남', en: 'Vietnam' });

    // 2. Industries (Admin Master)
    registerMasterItem('industry', 'Grooming', { ko: '애견미용', en: 'Grooming' });
    registerMasterItem('industry', 'Hospital', { ko: '동물병원', en: 'Animal Hospital' });

    // 3. Master Products (Admin Master)
    registerMasterItem('product', 'Organic Kibble', { ko: '유기농 사료', en: 'Organic Kibble' });
}

function registerMasterItem(domain, original, translations) {
    const id = `m-${domain}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    textEntities[id] = { source: 'master', domain, original_text: original, converted_json: translations };
    masterRegistry[domain].push(id);
    return id;
}

function registerCountry(name, currency, symbol, translations) {
    const id = registerMasterItem('country', name, translations);
    textEntities[id].currency_code = currency;
    textEntities[id].currency_symbol = symbol;
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

// 🌐 Translation Helper
async function getTranslations(text, sourceLang) {
    const results = {};
    LANGS.forEach(l => {
        results[l] = l === sourceLang ? text : `${text} [${sourceLang.toUpperCase()}→${l.toUpperCase()}]`;
    });
    return results;
}

function setupEventListeners() {
    document.getElementById('theme-toggle').addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });

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
    // Role Views Toggle
    document.querySelectorAll('.role-view').forEach(v => v.classList.add('hidden'));
    document.getElementById(`${currentRole}-view`).classList.remove('hidden');

    // Sync UI Labels
    document.querySelectorAll('[data-ui-key]').forEach(el => {
        const key = el.getAttribute('data-ui-key');
        el.textContent = t('ui', key);
    });

    // Sub-renderers
    if (currentRole === 'admin') renderAdminDashboard();
    if (currentRole === 'provider') renderProviderDashboard();
    if (currentRole === 'user') renderUserDashboard();
}

// --- ADMIN RENDERER ---
function renderAdminDashboard() {
    const container = document.getElementById('admin-content');
    container.innerHTML = `
        <div class="card">
            <h3 data-ui-key="label_master_studio"></h3>
            <select id="admin-master-domain" onchange="renderAdminMasterList()">
                <option value="industry">Industries</option>
                <option value="country">Countries</option>
                <option value="breed">Breeds</option>
                <option value="product">Products</option>
            </select>
            <div id="admin-master-list" class="master-list-container"></div>
            <button class="save-btn" onclick="showMasterCreateForm()">+ Add New</button>
        </div>
    `;
    renderAdminMasterList();
}

function renderAdminMasterList() {
    const domain = document.getElementById('admin-master-domain').value;
    const list = document.getElementById('admin-master-list');
    list.innerHTML = masterRegistry[domain].map(id => `
        <div class="list-item">
            <span>${t('master', '', id)}</span>
            <button onclick="openUniversalEditor('master', '', '${id}')">📝</button>
        </div>
    `).join('');
}

// --- PROVIDER RENDERER ---
function renderProviderDashboard() {
    const container = document.getElementById('provider-content');
    if (!currentStore) {
        container.innerHTML = `
            <div class="card">
                <h3>Create Store Profile</h3>
                <div class="input-container"><label>Store Name</label><input type="text" id="p-name"></div>
                <div class="input-container"><label>Country</label>
                    <select id="p-country" onchange="updateProviderCurrency(this.value)">
                        <option value="">-- Select --</option>
                        ${masterRegistry.country.map(id => `<option value="${id}">${t('master', '', id)}</option>`).join('')}
                    </select>
                </div>
                <div class="input-container"><label>Currency</label><input type="text" id="p-currency" readonly></div>
                <button class="save-btn" onclick="saveStoreProfile()">Create Profile</button>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="card">
                <h3>${t('entity', '', currentStore.name_id)} [${currentStore.currency}]</h3>
                <nav class="tab-nav">
                    <button onclick="renderProviderInventory()">Inventory</button>
                    <button onclick="renderProviderServices()">Services</button>
                </nav>
                <div id="provider-module-content"></div>
            </div>
        `;
    }
}

function updateProviderCurrency(countryId) {
    const display = document.getElementById('p-currency');
    if (countryId && textEntities[countryId]) {
        display.value = textEntities[countryId].currency_code;
    }
}

async function saveStoreProfile() {
    const name = document.getElementById('p-name').value;
    const countryId = document.getElementById('p-country').value;
    if (!name || !countryId) return alert('Required fields!');

    const nameId = `entity-name-${Date.now()}`;
    const translations = await getTranslations(name, currentLang);
    textEntities[nameId] = { domain: 'shop', original_text: name, converted_json: translations };

    currentStore = {
        name_id: nameId,
        country_id: countryId,
        currency: textEntities[countryId].currency_code,
        industries: []
    };
    renderAll();
}

// --- USER RENDERER ---
function renderUserDashboard() {
    const container = document.getElementById('user-content');
    container.innerHTML = `
        <div class="timeline-container">
            <h2 data-ui-key="label_timeline"></h2>
            <div id="timeline-feed">
                <p style="text-align:center; color:var(--md-on-surface-variant)">Login to view community feed.</p>
            </div>
        </div>
    `;
}

function initTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') document.body.classList.add('light-mode');
}

initSystem();
window.renderAdminMasterList = renderAdminMasterList;
window.updateProviderCurrency = updateProviderCurrency;
window.saveStoreProfile = saveStoreProfile;
