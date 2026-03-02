// Bang-ul Play: SNS UI Restoration + 100% Translation Integration
let uiDictionary = {};
let masterRegistry = { breed: [], industry: [], country: [] };
let textEntities = {};
let registeredShops = [];
let currentStore = null;

let currentLang = localStorage.getItem('lang') || 'ko';
let currentRole = 'user';

const LANGS = ['ko', 'en', 'ja', 'vi', 'id', 'zh', 'th', 'es', 'fr', 'de', 'it', 'pt', 'ar'];

async function initSystem() {
    uiDictionary = {
        'app_title': { ko: '방울아놀자', en: 'Bang-ul Play' },
        'app_logo': { ko: '방울아놀자', en: 'Bang-ul Play' },
        'role_user': { ko: '보호자', en: 'Pet Owner' },
        'role_provider': { ko: '공급자', en: 'Provider' },
        'role_admin': { ko: '관리자', en: 'Admin' },
        'btn_save': { ko: '저장', en: 'Save' },
        'btn_add_new': { ko: '새 항목 추가', en: 'Add New' },
        'label_master_studio': { ko: '마스터 데이터 관리', en: 'Master Data Studio' },
        'domain_industry': { ko: '업종', en: 'Industries' },
        'domain_country': { ko: '국가', en: 'Countries' },
        'domain_breed': { ko: '견종', en: 'Breeds' },
        'modal_edit_title': { ko: '🌐 번역 편집 (13개 국어)', en: '🌐 Edit Translations' },
        'btn_cancel': { ko: '취소', en: 'Cancel' },
        'label_shop_reg': { ko: '상점 프로필', en: 'Shop Profile' },
        'label_industry_cat': { ko: '업종 선택', en: 'Select Industry' }
    };

    seedData();
    setupEventListeners();
    renderAll();
}

function seedData() {
    registerMasterItem('industry', 'Grooming', { ko: '애견미용', en: 'Grooming' });
    registerMasterItem('industry', 'Medical', { ko: '동물병원', en: 'Medical' });
    
    // Seed a shop for SNS feed
    const sId = `shop-${Date.now()}`;
    textEntities[sId] = { domain: 'shop', original_text: 'Happy Paws', converted_json: { ko: '해피퍼피', en: 'Happy Paws' } };
    registeredShops.push({ id: sId, industry_id: masterRegistry.industry[0] });
}

function registerMasterItem(domain, original, translations) {
    const id = `m-${domain}-${Date.now()}`;
    textEntities[id] = { source: 'master', domain, original_text: original, converted_json: translations };
    masterRegistry[domain].push(id);
    return id;
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

// 🌐 Translation Engine
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

    document.getElementById('theme-toggle').addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
    });
}

function renderAll() {
    document.querySelectorAll('.role-view').forEach(v => v.classList.add('hidden'));
    document.getElementById(`${currentRole}-view`).classList.remove('hidden');

    // UI Key Sync (100% translation)
    document.querySelectorAll('[data-ui-key]').forEach(el => {
        const key = el.getAttribute('data-ui-key');
        el.textContent = t('ui', key);
    });

    if (currentRole === 'user') renderSNSFeed();
    if (currentRole === 'admin') renderAdmin();
    if (currentRole === 'provider') renderProvider();
}

function renderSNSFeed() {
    // Pet Profile Card
    const profile = document.getElementById('pet-profile-area');
    profile.innerHTML = `
        <div class="profile-card">
            <div class="profile-img"><img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200" alt="Pet"></div>
            <div class="profile-info">
                <h2>Coco <button class="mini-edit-btn">📝</button></h2>
                <p>Golden Retriever • Male • 3 yrs</p>
            </div>
        </div>
    `;

    // Category Filter
    const filter = document.getElementById('category-filter');
    filter.innerHTML = `<button class="active">All</button>` + 
        masterRegistry.industry.map(id => `<button>${t('master', '', id)}</button>`).join('');

    // Feed Items
    const feed = document.getElementById('timeline-feed');
    feed.innerHTML = registeredShops.map(shop => `
        <div class="timeline-event">
            <div class="timeline-dot"></div>
            <div class="timeline-card">
                <div class="event-header">
                    <span class="industry-tag">${t('master', '', shop.industry_id)}</span>
                    <span class="event-date">JUST NOW</span>
                </div>
                <h3>${t('entity', '', shop.id)}</h3>
                <p>Welcome to our new global provider!</p>
            </div>
        </div>
    `).join('');
}

function renderAdmin() {
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
    const profile = document.getElementById('provider-profile-area');
    profile.innerHTML = `
        <div class="card">
            <h3>${t('ui', 'label_shop_reg')}</h3>
            <div class="input-container">
                <label>${t('ui', 'label_industry_cat')}</label>
                <select>${masterRegistry.industry.map(id => `<option value="${id}">${t('master', '', id)}</option>`).join('')}</select>
            </div>
            <button class="save-btn">${t('ui', 'btn_save')}</button>
        </div>
    `;
}

initSystem();
window.showMasterCreateForm = showMasterCreateForm;
window.renderAdminList = renderAdmin;
window.openUniversalEditor = openUniversalEditor;
