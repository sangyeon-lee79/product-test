// Bang-ul Play: Master Management System Integration
let currentLang = localStorage.getItem('lang') || 'ko';
let currentRole = 'user';

// --- DATA REGISTRIES (Mock DB) ---
let masterCategories = [
    { id: 'cat-1', category_key: 'industry', is_active: true },
    { id: 'cat-2', category_key: 'breed', is_active: true }
];

let masterItems = [
    { id: 'item-1', category_id: 'cat-1', item_key: 'grooming', sort_order: 1, is_active: true },
    { id: 'item-2', category_id: 'cat-1', item_key: 'medical', sort_order: 2, is_active: true },
    { id: 'item-3', category_id: 'cat-2', item_key: 'poodle', sort_order: 1, is_active: true }
];

let languages = [
    { code: 'ko', name: '한국어', is_active: true },
    { code: 'en', name: 'English', is_active: true },
    { code: 'ja', name: '日本語', is_active: true },
    { code: 'vi', name: 'Tiếng Việt', is_active: true }
];

let translations = {
    // UI Key Mapping
    'ui.app_logo': { ko: '방울아놀자', en: 'Bang-ul Play', ja: 'バングルプレイ', vi: 'Bang-ul Play' },
    'ui.menu_admin': { ko: '관리자 센터', en: 'Admin Center' },
    'ui.tab_master': { ko: '마스터 데이터', en: 'Master Data' },
    'ui.tab_lang': { ko: '언어 관리', en: 'Language' },
    'ui.tab_country': { ko: '국가/통화', en: 'Country' },
    'ui.btn_save': { ko: '저장', en: 'Save', ja: '保存', vi: 'Lưu' },
    'ui.btn_add': { ko: '추가', en: 'Add', ja: '追加', vi: 'Thêm' },
    
    // Master Item Mapping
    'master.industry.grooming': { ko: '애견미용', en: 'Grooming', ja: 'トリミング', vi: 'Làm đẹp' },
    'master.industry.medical': { ko: '동물병원', en: 'Medical', ja: '動物病院', vi: 'Y tế' },
    'master.breed.poodle': { ko: '푸들', en: 'Poodle', ja: 'プードル', vi: 'Poodle' }
};

let countries = [
    { id: 'cnt-1', country_code: 'KR', is_active: true }
];

let currencies = [
    { code: 'KRW', symbol: '₩', is_active: true },
    { code: 'USD', symbol: '$', is_active: true }
];

let countryCurrencyMap = [
    { country_id: 'cnt-1', currency_code: 'KRW', is_default: true }
];

let registeredShops = [];
let currentStore = null;

// --- CORE TRANSLATION ENGINE ---
function t(key) {
    const entry = translations[key];
    if (!entry) return key;
    return entry[currentLang] || entry['ko'] || key;
}

// --- ADMIN SCREEN STATE ---
let activeAdminTab = 'master'; // master, lang, country
let selectedCategoryId = null;

async function initSystem() {
    setupEventListeners();
    initTheme();
    renderAll();
}

function setupEventListeners() {
    document.getElementById('theme-toggle').addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
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
    // 1. Role Views
    document.querySelectorAll('.role-view').forEach(v => v.classList.add('hidden'));
    document.getElementById(`${currentRole}-view`).classList.remove('hidden');

    // 2. Header Translation
    document.querySelector('.logo').textContent = t('ui.app_logo');
    
    // 3. Admin Tabs Translation
    if (currentRole === 'admin') renderAdmin();
    if (currentRole === 'provider') renderProvider();
    if (currentRole === 'user') renderUser();
}

// --- ADMIN RENDERERS ---
function renderAdmin() {
    const container = document.getElementById('admin-content');
    container.innerHTML = `
        <div class="admin-tabs">
            <button class="${activeAdminTab === 'master' ? 'active' : ''}" onclick="switchAdminTab('master')">${t('ui.tab_master')}</button>
            <button class="${activeAdminTab === 'lang' ? 'active' : ''}" onclick="switchAdminTab('lang')">${t('ui.tab_lang')}</button>
            <button class="${activeAdminTab === 'country' ? 'active' : ''}" onclick="switchAdminTab('country')">${t('ui.tab_country')}</button>
        </div>
        <div id="admin-sub-content"></div>
    `;
    
    if (activeAdminTab === 'master') renderMasterAdmin();
    else if (activeAdminTab === 'lang') renderLanguageAdmin();
    else if (activeAdminTab === 'country') renderCountryAdmin();
}

function switchAdminTab(tab) {
    activeAdminTab = tab;
    renderAdmin();
}

// 1) Master Data Admin
function renderMasterAdmin() {
    const sub = document.getElementById('admin-sub-content');
    if (!selectedCategoryId) {
        // Category List
        sub.innerHTML = `
            <div class="card">
                <h3>Categories <button class="mini-add-btn" onclick="addCategory()">+</button></h3>
                <div class="list-container">
                    ${masterCategories.map(cat => `
                        <div class="list-item clickable" onclick="selectCategory('${cat.id}')">
                            <span>${cat.category_key}</span>
                            <span class="status-badge ${cat.is_active ? 'active' : ''}"></span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } else {
        // Item List within Category
        const cat = masterCategories.find(c => c.id === selectedCategoryId);
        const items = masterItems.filter(i => i.category_id === selectedCategoryId);
        sub.innerHTML = `
            <div class="card">
                <h3><button class="back-btn" onclick="selectCategory(null)">←</button> Items in ${cat.category_key}</h3>
                <div class="list-container">
                    ${items.map(item => `
                        <div class="list-item">
                            <span>${item.item_key} [${t(`master.${cat.category_key}.${item.item_key}`)}]</span>
                            <button class="edit-btn" onclick="editItem('${item.id}')">Edit</button>
                        </div>
                    `).join('')}
                    <button class="add-btn" onclick="addItem('${cat.id}')">+ Add New Item</button>
                </div>
            </div>
        `;
    }
}

function selectCategory(id) { selectedCategoryId = id; renderMasterAdmin(); }

// 2) Language Admin
function renderLanguageAdmin() {
    const sub = document.getElementById('admin-sub-content');
    sub.innerHTML = `
        <div class="card overflow-x">
            <h3>Translation Dictionary</h3>
            <table class="translation-table">
                <thead>
                    <tr>
                        <th>Key</th>
                        ${languages.map(l => `<th>${l.code.toUpperCase()}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${Object.keys(translations).map(key => `
                        <tr>
                            <td class="key-cell">${key}</td>
                            ${languages.map(l => `
                                <td><input type="text" value="${translations[key][l.code] || ''}" onchange="updateTranslation('${key}', '${l.code}', this.value)"></td>
                            `).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function updateTranslation(key, lang, val) {
    translations[key][lang] = val;
    console.log(`Updated ${key}.${lang} to ${val}`);
}

// 3) Country Admin
function renderCountryAdmin() {
    const sub = document.getElementById('admin-sub-content');
    sub.innerHTML = `
        <div class="card">
            <h3>Country-Currency Mapping</h3>
            <div class="list-container">
                ${countries.map(c => {
                    const map = countryCurrencyMap.find(m => m.country_id === c.id);
                    return `
                        <div class="list-item">
                            <span>${c.country_code} → ${map ? map.currency_code : 'N/A'}</span>
                            <span class="status-badge active"></span>
                        </div>
                    `;
                }).join('')}
                <button class="add-btn">+ Add New Country</button>
            </div>
        </div>
    `;
}

// --- PROVIDER RENDERER (Country -> Currency Sync) ---
function renderProvider() {
    const container = document.getElementById('provider-content');
    if (!currentStore) {
        container.innerHTML = `
            <div class="card">
                <h3>Store Profile</h3>
                <div class="input-container">
                    <label>Country</label>
                    <select id="p-country" onchange="onCountryChange(this.value)">
                        <option value="">-- Select --</option>
                        ${countries.map(c => `<option value="${c.id}">${c.country_code}</option>`).join('')}
                    </select>
                </div>
                <div class="input-container">
                    <label>Currency (Auto)</label>
                    <input type="text" id="p-currency" readonly placeholder="Select country first">
                </div>
                <button class="save-btn" onclick="saveStore()">Save Store</button>
            </div>
        `;
    }
}

function onCountryChange(countryId) {
    const map = countryCurrencyMap.find(m => m.country_id === countryId);
    const display = document.getElementById('p-currency');
    if (map) display.value = map.currency_code;
}

function initTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') document.body.classList.add('light-mode');
}

initSystem();
window.switchAdminTab = switchAdminTab;
window.selectCategory = selectCategory;
window.updateTranslation = updateTranslation;
window.onCountryChange = onCountryChange;
