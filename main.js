// 방울아놀자 Integrated Logic: Master Menu & Dropdown Language System
let dictionary = {};
let textEntities = {};
let currentLang = localStorage.getItem('lang') || 'ko';
let currentRole = 'user';
let userApiKey = localStorage.getItem('google_api_key') || '';

const LANGS = ['ko', 'en', 'ja', 'vi', 'id', 'zh', 'th', 'es', 'fr', 'de', 'it', 'pt', 'ar'];

// 1. Master Menu Data Model (Rule 5)
const masterRegistry = {
    industry: [], // [id1, id2, ...]
    breed: [],
    service: [],
    condition: [],
    food: [],
    sns_tag: []
};

const registeredShops = []; // Stores { id, name_entity_id, industry_item_id }

async function initSystem() {
    const dictResponse = await fetch('shared/dictionary/dictionary_values.json');
    dictionary = await dictResponse.json();
    seedInitialMasterData();
    setupEventListeners();
    renderAll();
}

// Rule 2: Seed Initial Master Items
function seedInitialMasterData() {
    // Labels
    const labels = {
        'm-menu-001': { ko: '마스터 관리 제어', en: 'Master Admin Control' },
        'm-label-studio': { ko: '마스터 메뉴 관리', en: 'Master Menu Management' },
        'm-label-provider': { ko: '공급자 대시보드', en: 'Provider Dashboard' },
        'm-label-user': { ko: '유저 타임라인', en: 'User Timeline' }
    };
    Object.entries(labels).forEach(([id, vals]) => {
        textEntities[id] = { domain: 'system', original_text: vals.en, converted_json: vals };
    });

    // Seed Industries (관리자가 등록한 마스터 데이터)
    registerMasterItem('industry', 'Hospital', { ko: '동물병원', en: 'Animal Hospital', vi: 'Bệnh viện thú y' });
    registerMasterItem('industry', 'Grooming', { ko: '애견미용', en: 'Dog Grooming', vi: 'Làm đẹp chó' });
    
    // Seed Breeds
    registerMasterItem('breed', 'Golden Retriever', { ko: '골든 리트리버', en: 'Golden Retriever' });
    registerMasterItem('breed', 'Poodle', { ko: '푸들', en: 'Poodle' });
}

function registerMasterItem(domain, original, translations) {
    const id = `m-${domain}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    textEntities[id] = { domain, original_text: original, converted_json: translations };
    masterRegistry[domain].push(id);
}

function t(domain, key, entityId = null) {
    if (entityId && textEntities[entityId]) {
        return textEntities[entityId].converted_json[currentLang] || textEntities[entityId].original_text;
    }
    try {
        return dictionary[domain][key][currentLang] || dictionary[domain][key]['en'] || key;
    } catch (e) { return key; }
}

// Rule 3: Populate Dropdown from Master Menu
function renderDropdown(domain, elementId, placeholder = "Select...") {
    const select = document.getElementById(elementId);
    if (!select) return;
    
    select.innerHTML = `<option value="">-- ${placeholder} --</option>` + 
        masterRegistry[domain].map(id => `
            <option value="${id}">${t(domain, '', id)}</option>
        `).join('');
}

// 🌐 Universal Translation Engine
async function translateText(text, sourceLang) {
    const results = {};
    LANGS.forEach(lang => {
        results[lang] = lang === sourceLang ? text : `${text} [${sourceLang.toUpperCase()}→${lang.toUpperCase()}]`;
    });
    return results;
}

function openUniversalEditor(entityId) {
    const entity = textEntities[entityId];
    const modal = document.getElementById('universal-modal');
    const grid = document.getElementById('modal-grid-items');
    grid.innerHTML = LANGS.map(lang => `
        <div class="grid-item"><span>${lang.toUpperCase()}</span><input type="text" data-lang="${lang}" value="${entity.converted_json[lang] || ''}"></div>
    `).join('');
    document.getElementById('save-modal-btn').onclick = () => {
        grid.querySelectorAll('input').forEach(input => { entity.converted_json[input.dataset.lang] = input.value; });
        modal.classList.add('hidden');
        renderAll();
    };
    modal.classList.remove('hidden');
}

function setupEventListeners() {
    // Role Switching
    document.getElementById('role-selector').addEventListener('change', (e) => {
        currentRole = e.target.value;
        document.querySelectorAll('.role-view').forEach(v => v.classList.add('hidden'));
        document.getElementById(`${currentRole}-view`).classList.remove('hidden');
        renderAll();
    });

    // Language Switching
    document.getElementById('lang-selector').addEventListener('change', (e) => {
        currentLang = e.target.value;
        renderAll();
    });

    // Admin: Add Master Item
    document.getElementById('admin-convert-btn').addEventListener('click', async () => {
        const input = document.getElementById('admin-master-input');
        const domain = document.getElementById('master-domain-selector').value;
        if (!input.value.trim()) return;
        const converted = await translateText(input.value, currentLang);
        registerMasterItem(domain, input.value, converted);
        input.value = '';
        renderAll();
    });

    // Provider: Shop Registration (Rule 3: Dropdown for Industry)
    document.getElementById('provider-convert-btn').addEventListener('click', async () => {
        const text = document.getElementById('provider-shop-input').value.trim();
        if (!text) return;
        const converted = await translateText(text, currentLang);
        const grid = document.getElementById('provider-grid-items');
        grid.innerHTML = LANGS.map(lang => `
            <div class="grid-item"><span>${lang.toUpperCase()}</span><input type="text" data-lang="${lang}" value="${converted[lang]}"></div>
        `).join('');
        document.getElementById('provider-conversion-preview').classList.remove('hidden');
    });

    document.getElementById('save-shop-btn').addEventListener('click', () => {
        const industryId = document.getElementById('provider-industry-select').value;
        if (!industryId) return alert('Please select an Industry!');
        
        const entityId = `shop-${Date.now()}`;
        const converted = {};
        document.querySelectorAll('#provider-grid-items input').forEach(input => { converted[input.dataset.lang] = input.value; });
        textEntities[entityId] = { domain: 'shop', original_text: 'New Shop', converted_json: converted };
        
        registeredShops.push({ id: entityId, industry_item_id: industryId });
        document.getElementById('provider-conversion-preview').classList.add('hidden');
        document.getElementById('provider-shop-input').value = '';
        renderAll();
        alert('Shop Registered successfully!');
    });
}

function renderAll() {
    // 1. Update Labels
    document.querySelectorAll('[data-entity-id]').forEach(el => {
        const id = el.getAttribute('data-entity-id');
        el.innerHTML = `${t('', '', id)} <button class="mini-edit-btn" onclick="openUniversalEditor('${id}')">📝</button>`;
    });

    // 2. Admin: Render Master List by Domain
    if (currentRole === 'admin') {
        const domain = document.getElementById('master-domain-selector').value;
        const table = document.getElementById('master-items-table');
        table.innerHTML = masterRegistry[domain].map(id => `
            <div class="table-row"><span>${t(domain, '', id)}</span><button onclick="openUniversalEditor('${id}')">🌐 Edit</button></div>
        `).join('');
    }

    // 3. Provider: Populate Industry Dropdown
    if (currentRole === 'provider') {
        renderDropdown('industry', 'provider-industry-select', 'Choose Industry');
    }

    // 4. User: Feed with Master Industry Icons/Labels
    if (currentRole === 'user') {
        const feed = document.getElementById('timeline-feed');
        feed.innerHTML = registeredShops.map(shop => `
            <div class="timeline-event event-shop">
                <div class="timeline-dot"></div>
                <div class="timeline-card">
                    <div class="event-header">
                        <span class="event-date">2024-03-02</span>
                        <span class="industry-tag">${t('industry', '', shop.industry_item_id)}</span>
                    </div>
                    <h3>${t('shop', '', shop.id)}</h3>
                </div>
            </div>
        `).join('') || '<p style="text-align:center; color:var(--text-dim)">No items yet.</p>';
    }
}

document.getElementById('theme-toggle').addEventListener('click', () => document.body.classList.toggle('light-mode'));
initSystem();
window.openUniversalEditor = openUniversalEditor;
