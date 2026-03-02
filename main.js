// Universal Language Conversion v2 + Master Admin System
let dictionary = {};
let textEntities = {};
let currentLang = localStorage.getItem('lang') || 'ko';
let currentRole = 'user';

const LANGS = ['ko', 'en', 'ja', 'vi', 'id', 'zh', 'th', 'es', 'fr', 'de', 'it', 'pt', 'ar'];

// Master Data Storage
const masterRegistry = {
    breed: [],
    condition: [],
    industry: [],
    food: []
};

const registeredShops = [];

async function initSystem() {
    const dictResponse = await fetch('shared/dictionary/dictionary_values.json');
    dictionary = await dictResponse.json();
    
    // Seed initial Master Data
    seedMasterData();
    renderAll();
}

function seedMasterData() {
    const initialBreeds = [
        { id: 'm-breed-001', code: 'GOLDEN', name: 'Golden Retriever' },
        { id: 'm-breed-002', code: 'POODLE', name: 'Poodle' }
    ];
    
    initialBreeds.forEach(b => {
        textEntities[b.id] = {
            id: b.id,
            domain: 'breed',
            original_text: b.name,
            converted_json: { ko: b.name === 'Poodle' ? '푸들' : '골든 리트리버', en: b.name }
        };
        masterRegistry.breed.push(b.id);
    });
}

function t(domain, key, entityId = null) {
    if (entityId && textEntities[entityId]) {
        return textEntities[entityId].converted_json[currentLang] || textEntities[entityId].original_text;
    }
    try {
        return dictionary[domain][key][currentLang] || dictionary[domain][key]['en'] || key;
    } catch (e) {
        return key;
    }
}

// 🧭 Admin & Registration Logic
const adminMasterInput = document.getElementById('admin-master-input');
const adminConvertBtn = document.getElementById('admin-convert-btn');
const adminPreviewArea = document.getElementById('admin-conversion-preview');
const adminGridItems = document.getElementById('admin-grid-items');
const domainSelector = document.getElementById('master-domain-selector');

let adminTempConverted = {};

adminConvertBtn.addEventListener('click', () => {
    const text = adminMasterInput.value.trim();
    if (!text) return;
    adminTempConverted = {};
    LANGS.forEach(lang => {
        adminTempConverted[lang] = lang === 'ko' ? text : `${text} (${lang.toUpperCase()})`;
    });
    renderAdminGrid();
    adminPreviewArea.classList.remove('hidden');
});

function renderAdminGrid() {
    adminGridItems.innerHTML = LANGS.map(lang => `
        <div class="grid-item">
            <span>${lang.toUpperCase()}</span>
            <input type="text" data-lang="${lang}" value="${adminTempConverted[lang]}">
        </div>
    `).join('');
}

document.getElementById('save-admin-master-btn').addEventListener('click', () => {
    const entityId = `m-${domainSelector.value}-${Date.now()}`;
    const finalConverted = {};
    adminGridItems.querySelectorAll('input').forEach(input => {
        finalConverted[input.dataset.lang] = input.value;
    });

    textEntities[entityId] = {
        id: entityId,
        domain: domainSelector.value,
        original_text: adminMasterInput.value,
        converted_json: finalConverted,
        auto_generated: false
    };

    masterRegistry[domainSelector.value].push(entityId);
    
    adminMasterInput.value = '';
    adminPreviewArea.classList.add('hidden');
    renderAll();
    alert(`Published ${entityId} to global registry!`);
});

// Role Management
document.getElementById('role-selector').addEventListener('change', (e) => {
    currentRole = e.target.value;
    document.getElementById('admin-view').classList.toggle('hidden', currentRole !== 'admin');
    document.getElementById('registration-view').classList.toggle('hidden', currentRole !== 'provider');
    document.getElementById('user-view').classList.toggle('hidden', currentRole !== 'user');
    renderAll();
});

// UI Rendering
function renderMasterTable() {
    const table = document.getElementById('master-items-table');
    const domain = domainSelector.value;
    
    table.innerHTML = `
        <div class="table-row header">
            <span>Domain</span><span>Name (${currentLang.toUpperCase()})</span><span>Status</span>
        </div>
        ${masterRegistry[domain].map(id => `
            <div class="table-row">
                <span>${domain.toUpperCase()}</span>
                <span>${t(domain, '', id)}</span>
                <span style="color:var(--training)">ACTIVE</span>
            </div>
        `).join('')}
    `;
}

function renderUserView() {
    const filterNav = document.getElementById('master-category-list');
    filterNav.innerHTML = `
        <button class="active">All</button>
        ${masterRegistry.industry.map(id => `<button>${t('industry', '', id)}</button>`).join('')}
    `;

    const feed = document.getElementById('timeline-feed');
    feed.innerHTML = registeredShops.map(shopId => `
        <div class="timeline-event event-shop">
            <div class="timeline-dot"></div>
            <div class="timeline-card">
                <div class="event-header">
                    <span class="event-date">2024-03-02</span>
                    <span class="verified-badge">✓ Verified Provider</span>
                </div>
                <h3>${t('shop', '', shopId)}</h3>
                <p>Provider registered via Master Registry.</p>
            </div>
        </div>
    `).join('');
}

function renderAll() {
    if (currentRole === 'admin') renderMasterTable();
    if (currentRole === 'user') renderUserView();
}

// Listeners
document.getElementById('lang-selector').addEventListener('change', (e) => {
    currentLang = e.target.value;
    localStorage.setItem('lang', currentLang);
    renderAll();
});

domainSelector.addEventListener('change', renderMasterTable);

initSystem();
