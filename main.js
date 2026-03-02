// Bang-ul Play: Phase 2 Core - Domain Master & Analytics
let currentLang = localStorage.getItem('lang') || 'ko';
let currentRole = 'user';

// --- 확장된 DATA REGISTRIES (Phase 2) ---
let masterCategories = [
    { id: 'cat-1', category_key: 'industry', is_active: true },
    { id: 'cat-2', category_key: 'breed', is_active: true },
    { id: 'cat-3', category_key: 'disease', is_active: true },
    { id: 'cat-4', category_key: 'product_category', is_active: true }
];

let masterItems = [
    { id: 'item-1', category_id: 'cat-1', item_key: 'grooming', is_active: true },
    { id: 'item-2', category_id: 'cat-1', item_key: 'medical', is_active: true },
    { id: 'item-3', category_id: 'cat-2', item_key: 'golden_retriever', is_active: true },
    { id: 'item-4', category_id: 'cat-2', item_key: 'poodle', is_active: true },
    { id: 'item-5', category_id: 'cat-3', item_key: 'diabetes', is_active: true },
    { id: 'item-6', category_id: 'cat-4', item_key: 'food_kibble', is_active: true }
];

let masterProducts = [
    { id: 'prod-1', category_item_id: 'item-6', manufacturer: 'Royal Canin', product_key: 'indigenous_adult', is_active: true }
];

let translations = {
    // UI Labels
    'ui.app_logo': { ko: '방울아놀자', en: 'Bang-ul Play' },
    'ui.tab_master': { ko: '마스터 데이터', en: 'Master Data' },
    'ui.tab_lang': { ko: '언어 관리', en: 'Language' },
    'ui.tab_country': { ko: '국가/통화', en: 'Country' },
    'ui.tab_analytics': { ko: '분석 대시보드', en: 'Analytics' },
    
    // Master Breeds
    'master.breed.golden_retriever': { ko: '골든 리트리버', en: 'Golden Retriever' },
    'master.breed.poodle': { ko: '푸들', en: 'Poodle' },
    
    // Master Diseases
    'master.disease.diabetes': { ko: '당뇨병', en: 'Diabetes' },
    
    // Master Products
    'master.product.indigenous_adult': { ko: '인디지너스 어덜트', en: 'Indigenous Adult' },
    
    // Analytics
    'ui.stat_users': { ko: '총 사용자', en: 'Total Users' },
    'ui.stat_pets': { ko: '총 반려동물', en: 'Total Pets' },
    'ui.stat_bookings': { ko: '예약 건수', en: 'Bookings' }
};

let activeAdminTab = 'analytics'; // Phase 2 마무리용 기본 탭
let selectedCategoryId = null;

// --- 핵심 엔진 ---
function t(key) {
    const entry = translations[key];
    if (!entry) return key;
    return entry[currentLang] || entry['ko'] || key;
}

function initSystem() {
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
    document.querySelectorAll('.role-view').forEach(v => v.classList.add('hidden'));
    document.getElementById(`${currentRole}-view`).classList.remove('hidden');
    document.querySelector('.logo').textContent = t('ui.app_logo');
    
    if (currentRole === 'admin') renderAdmin();
}

// --- ADMIN RENDERER ---
function renderAdmin() {
    const container = document.getElementById('admin-content');
    container.innerHTML = `
        <div class="admin-tabs">
            <button class="${activeAdminTab === 'analytics' ? 'active' : ''}" onclick="switchAdminTab('analytics')">${t('ui.tab_analytics')}</button>
            <button class="${activeAdminTab === 'master' ? 'active' : ''}" onclick="switchAdminTab('master')">${t('ui.tab_master')}</button>
            <button class="${activeAdminTab === 'lang' ? 'active' : ''}" onclick="switchAdminTab('lang')">${t('ui.tab_lang')}</button>
            <button class="${activeAdminTab === 'country' ? 'active' : ''}" onclick="switchAdminTab('country')">${t('ui.tab_country')}</button>
        </div>
        <div id="admin-sub-content"></div>
    `;
    
    if (activeAdminTab === 'analytics') renderAnalytics();
    else if (activeAdminTab === 'master') renderMasterAdmin();
    else if (activeAdminTab === 'lang') renderLanguageAdmin();
    else if (activeAdminTab === 'country') renderCountryAdmin();
}

function switchAdminTab(tab) {
    activeAdminTab = tab;
    renderAdmin();
}

// 4) Analytics Dashboard (Phase 2 New)
function renderAnalytics() {
    const sub = document.getElementById('admin-sub-content');
    sub.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <span class="label">${t('ui.stat_users')}</span>
                <span class="value">1,248</span>
                <span class="trend up">+12%</span>
            </div>
            <div class="stat-card">
                <span class="label">${t('ui.stat_pets')}</span>
                <span class="value">856</span>
                <span class="trend up">+5%</span>
            </div>
            <div class="stat-card">
                <span class="label">${t('ui.stat_bookings')}</span>
                <span class="value">342</span>
                <span class="trend down">-2%</span>
            </div>
        </div>
        <div class="card chart-placeholder">
            <h3>Growth Trends</h3>
            <div class="mock-chart">
                <!-- 실제 차트 라이브러리 연동 전 시각화 -->
                <div class="bar" style="height: 40%"></div>
                <div class="bar" style="height: 60%"></div>
                <div class="bar" style="height: 80%"></div>
                <div class="bar" style="height: 70%"></div>
                <div class="bar" style="height: 90%"></div>
            </div>
        </div>
    `;
}

// 기존 관리 함수들 (보존 및 확장)
function renderMasterAdmin() {
    const sub = document.getElementById('admin-sub-content');
    if (!selectedCategoryId) {
        sub.innerHTML = `
            <div class="card">
                <h3>Master Domains</h3>
                <div class="list-container">
                    ${masterCategories.map(cat => `
                        <div class="list-item clickable" onclick="selectCategory('${cat.id}')">
                            <span>${cat.category_key.toUpperCase()}</span>
                            <span>${masterItems.filter(i => i.category_id === cat.id).length} Items</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } else {
        const cat = masterCategories.find(c => c.id === selectedCategoryId);
        sub.innerHTML = `
            <div class="card">
                <h3><button class="back-btn" onclick="selectCategory(null)">←</button> ${cat.category_key.toUpperCase()} Items</h3>
                <div class="list-container">
                    ${masterItems.filter(i => i.category_id === selectedCategoryId).map(item => `
                        <div class="list-item">
                            <span>${t(`master.${cat.category_key}.${item.item_key}`)}</span>
                            <span class="key-label">${item.item_key}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

function selectCategory(id) { selectedCategoryId = id; renderMasterAdmin(); }

function initTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') document.body.classList.add('light-mode');
}

initSystem();
window.switchAdminTab = switchAdminTab;
window.selectCategory = selectCategory;
