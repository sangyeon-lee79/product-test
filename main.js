// Bang-ul Play: Phase 2 Core - Domain Master & Analytics
let currentLang = localStorage.getItem('lang') || 'ko';
let currentRole = 'user';

// --- DATA REGISTRIES ---
let masterCategories = [
    { id: 'cat-1', category_key: 'industry', is_active: true },
    { id: 'cat-2', category_key: 'breed', is_active: true },
    { id: 'cat-3', category_key: 'disease', is_active: true },
    { id: 'cat-4', category_key: 'product_category', is_active: true }
];

let masterItems = [
    { id: 'item-1', category_id: 'cat-1', item_key: 'grooming', is_active: true },
    { id: 'item-2', category_id: 'cat-1', item_key: 'medical', is_active: false },
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
    'ui.add_category': { ko: '새 카테고리 추가', en: 'Add New Category' },
    'ui.category_key': { ko: '카테고리 키', en: 'Category Key' },
    'ui.add_item': { ko: '새 아이템 추가', en: 'Add New Item' },
    'ui.item_key': { ko: '아이템 키', en: 'Item Key' },
    'ui.add': { ko: '추가', en: 'Add' },
    'ui.edit': { ko: '수정', en: 'Edit' },
    'ui.activate': { ko: '활성화', en: 'Activate' },
    'ui.deactivate': { ko: '비활성화', en: 'Deactivate' },
    'ui.items': { ko: '아이템', en: 'Items' },
    'ui.master_domains': { ko: '마스터 도메인', en: 'Master Domains' },

    // Master Data
    'master.breed.golden_retriever': { ko: '골든 리트리버', en: 'Golden Retriever' },
    'master.breed.poodle': { ko: '푸들', en: 'Poodle' },
    'master.disease.diabetes': { ko: '당뇨병', en: 'Diabetes' },
    'master.product.indigenous_adult': { ko: '인디지너스 어덜트', en: 'Indigenous Adult' },
    'master.industry.grooming': { ko: '미용', en: 'Grooming' },
    'master.industry.medical': { ko: '의료', en: 'Medical' },
    'master.product_category.food_kibble': { ko: '사료', en: 'Kibble' },

    // Analytics
    'ui.stat_users': { ko: '총 사용자', en: 'Total Users' },
    'ui.stat_pets': { ko: '총 반려동물', en: 'Total Pets' },
    'ui.stat_bookings': { ko: '예약 건수', en: 'Bookings' }
};

let activeAdminTab = 'master';
let selectedCategoryId = null;

// --- 1. CORE ENGINE ---
const t = (key) => (translations[key] && translations[key][currentLang]) || (translations[key] && translations[key]['ko']) || key;

const render = () => {
    document.querySelectorAll('.role-view').forEach(v => v.classList.add('hidden'));
    document.getElementById(`${currentRole}-view`).classList.remove('hidden');
    document.querySelector('.logo').textContent = t('ui.app_logo');
    if (currentRole === 'admin') renderAdmin();
}

const init = () => {
    document.getElementById('theme-toggle').addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
    });
    document.getElementById('role-selector').addEventListener('change', (e) => { currentRole = e.target.value; render(); });
    document.getElementById('lang-selector').addEventListener('change', (e) => { currentLang = e.target.value; localStorage.setItem('lang', currentLang); render(); });
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') document.body.classList.add('light-mode');
    
    render();
}

// --- 2. ADMIN FEATURES ---
const switchAdminTab = (tab) => { activeAdminTab = tab; renderAdmin(); };

const renderAdmin = () => {
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
    
    const subContent = {
        'analytics': renderAnalytics,
        'master': renderMasterAdmin,
        // 'lang': renderLanguageAdmin, // To be implemented
        // 'country': renderCountryAdmin // To be implemented
    };
    if (subContent[activeAdminTab]) subContent[activeAdminTab]();
}

const renderAnalytics = () => {
    const sub = document.getElementById('admin-sub-content');
    sub.innerHTML = `
        <div class="stats-grid"> <div class="stat-card"> <span class="label">${t('ui.stat_users')}</span> <span class="value">1,248</span> <span class="trend up">+12%</span> </div> <div class="stat-card"> <span class="label">${t('ui.stat_pets')}</span> <span class="value">856</span> <span class="trend up">+5%</span> </div> <div class="stat-card"> <span class="label">${t('ui.stat_bookings')}</span> <span class="value">342</span> <span class="trend down">-2%</span> </div> </div>
        <div class="card chart-placeholder"> <h3>Growth Trends</h3> <div class="mock-chart"> <div class="bar" style="height: 40%"></div> <div class="bar" style="height: 60%"></div> <div class="bar" style="height: 80%"></div> <div class="bar" style="height: 70%"></div> <div class="bar" style="height: 90%"></div> </div> </div>
    `;
};

const renderMasterAdmin = () => {
    const sub = document.getElementById('admin-sub-content');
    selectedCategoryId ? renderItemView(sub) : renderCategoryView(sub);
}

const renderCategoryView = (container) => {
    container.innerHTML = `
        <div class="card">
            <h3>${t('ui.master_domains')}</h3>
            <div class="list-container">
                ${masterCategories.map(cat => `
                    <div class="list-item clickable ${!cat.is_active ? 'inactive' : ''}" onclick="selectCategory('${cat.id}')">
                        <div>
                           <span class="key-label">${cat.category_key.toUpperCase()}</span>
                        </div>
                        <div class="actions">
                           <span>${masterItems.filter(i => i.category_id === cat.id).length} ${t('ui.items')}</span>
                           <button class="toggle-btn" onclick="event.stopPropagation(); toggleCategoryActive('${cat.id}')">${cat.is_active ? t('ui.deactivate') : t('ui.activate')}</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="card">
            <h3>${t('ui.add_category')}</h3>
            <form class="input-form" onsubmit="addCategory(event)">
                <input type="text" name="key" placeholder="${t('ui.category_key')}" required>
                <button type="submit">${t('ui.add')}</button>
            </form>
        </div>
    `;
}

const renderItemView = (container) => {
    const cat = masterCategories.find(c => c.id === selectedCategoryId);
    if (!cat) { selectedCategoryId = null; renderMasterAdmin(); return; }

    container.innerHTML = `
        <div class="card">
            <h3><button class="back-btn" onclick="selectCategory(null)">←</button> ${cat.category_key.toUpperCase()} ${t('ui.items')}</h3>
            <div class="list-container">
                ${masterItems.filter(i => i.category_id === selectedCategoryId).map(item => `
                    <div class="list-item ${!item.is_active ? 'inactive' : ''}">
                        <div>
                           <span class="key-label">${item.item_key}</span>
                           <small>(${t(`master.${cat.category_key}.${item.item_key}`)})</small>
                        </div>
                        <div class="actions">
                            <button class="edit-btn" onclick="editItem('${item.id}')">${t('ui.edit')}</button>
                            <button class="toggle-btn" onclick="toggleItemActive('${item.id}')">${item.is_active ? t('ui.deactivate') : t('ui.activate')}</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
         <div class="card">
            <h3>${t('ui.add_item')}</h3>
            <form class="input-form" onsubmit="addItem(event)">
                <input type="text" name="key" placeholder="${t('ui.item_key')}" required>
                <button type="submit">${t('ui.add')}</button>
            </form>
        </div>
    `;
}

// --- 3. CRUD & State Logics ---
const selectCategory = (id) => { selectedCategoryId = id; renderMasterAdmin(); }

const addCategory = (event) => {
    event.preventDefault();
    const form = event.target;
    const newKey = form.key.value.trim().toLowerCase().replace(/\s+/g, '_');
    if (newKey && !masterCategories.some(c => c.category_key === newKey)) {
        masterCategories.push({ id: `cat-${Date.now()}`, category_key: newKey, is_active: true });
        form.reset();
        renderMasterAdmin();
    }
}

const addItem = (event) => {
    event.preventDefault();
    const form = event.target;
    const newKey = form.key.value.trim().toLowerCase().replace(/\s+/g, '_');
    if (newKey && selectedCategoryId && !masterItems.some(i => i.category_id === selectedCategoryId && i.item_key === newKey)) {
        masterItems.push({ id: `item-${Date.now()}`, category_id: selectedCategoryId, item_key: newKey, is_active: true });
        form.reset();
        renderMasterAdmin();
    }
}

const editItem = (id) => {
    const item = masterItems.find(i => i.id === id);
    const cat = masterCategories.find(c => c.id === item.category_id);
    const newKey = prompt(`Enter new key for ${item.item_key}:`, item.item_key);
    if (newKey && newKey.trim() !== '' && !masterItems.some(i => i.category_id === item.category_id && i.item_key === newKey)) {
        // Also update translation key if it exists
        const oldTKey = `master.${cat.category_key}.${item.item_key}`;
        const newTKey = `master.${cat.category_key}.${newKey}`;
        if(translations[oldTKey]) {
            translations[newTKey] = translations[oldTKey];
            delete translations[oldTKey];
        }
        item.item_key = newKey.trim().toLowerCase().replace(/\s+/g, '_');
        renderMasterAdmin();
    }
}

const toggleItemActive = (id) => {
    const item = masterItems.find(i => i.id === id);
    if(item) item.is_active = !item.is_active;
    renderMasterAdmin();
}

const toggleCategoryActive = (id) => {
    const cat = masterCategories.find(c => c.id === id);
    if(cat) cat.is_active = !cat.is_active;
    renderMasterAdmin();
}

// --- 4. INITIALIZATION ---
init();
window.switchAdminTab = switchAdminTab;
window.selectCategory = selectCategory;
window.addCategory = addCategory;
window.addItem = addItem;
window.editItem = editItem;
window.toggleItemActive = toggleItemActive;
window.toggleCategoryActive = toggleCategoryActive;
