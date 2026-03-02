// Universal Language Conversion v2 - Logic
let dictionary = {};
let textEntities = {};
let currentLang = localStorage.getItem('lang') || 'ko';
let currentRole = 'user';

const LANGS = ['ko', 'en', 'ja', 'vi', 'id', 'zh', 'th', 'es', 'fr', 'de', 'it', 'pt', 'ar'];

// Mock Data Storage for Demo
const masterCategories = []; // Admin registered
const registeredShops = []; // Provider registered
let timelineEvents = [];

async function initSystem() {
    const dictResponse = await fetch('shared/dictionary/dictionary_values.json');
    dictionary = await dictResponse.json();
    
    // Default Master Data (Admin-like registration)
    await registerMasterData('Medical', 'pet', 'filter_medical');
    await registerMasterData('Grooming', 'pet', 'filter_grooming');
    await registerMasterData('Shop', 'pet', 'filter_shop');

    renderAll();
}

async function registerMasterData(original, domain, key) {
    const entityId = `cat-${domain}-${key}`;
    textEntities[entityId] = {
        id: entityId,
        domain,
        original_text: original,
        converted_json: dictionary.pet[key] // dictionary에서 가져옴
    };
    masterCategories.push(entityId);
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

// 🌐 Registration Logic
const masterInput = document.getElementById('master-input');
const convertBtn = document.getElementById('convert-btn');
const previewArea = document.getElementById('conversion-preview');
const gridItems = document.getElementById('conversion-grid-items');
let tempConverted = {};

convertBtn.addEventListener('click', () => {
    const text = masterInput.value.trim();
    if (!text) return;
    tempConverted = {};
    LANGS.forEach(lang => {
        tempConverted[lang] = lang === 'ko' ? text : `${text} (${lang.toUpperCase()})`;
    });
    renderGrid();
    previewArea.classList.remove('hidden');
});

function renderGrid() {
    gridItems.innerHTML = LANGS.map(lang => `
        <div class="grid-item">
            <span>${lang.toUpperCase()}</span>
            <input type="text" data-lang="${lang}" value="${tempConverted[lang]}">
        </div>
    `).join('');
}

document.getElementById('save-master-btn').addEventListener('click', () => {
    const entityId = `entity-${Date.now()}`;
    const finalConverted = {};
    gridItems.querySelectorAll('input').forEach(input => {
        finalConverted[input.dataset.lang] = input.value;
    });

    textEntities[entityId] = {
        id: entityId,
        domain: currentRole === 'admin' ? 'master' : 'shop',
        original_text: masterInput.value,
        converted_json: finalConverted,
        auto_generated: false
    };

    if (currentRole === 'admin') {
        masterCategories.push(entityId);
        alert('Master Category Registered!');
    } else {
        registeredShops.push(entityId);
        alert('Shop Registered!');
    }

    masterInput.value = '';
    previewArea.classList.add('hidden');
    renderAll();
});

// Role Switcher
document.getElementById('role-selector').addEventListener('change', (e) => {
    currentRole = e.target.value;
    const regView = document.getElementById('registration-view');
    const userView = document.getElementById('user-view');
    const regTitle = document.getElementById('reg-title');

    if (currentRole === 'user') {
        regView.classList.add('hidden');
        userView.classList.remove('hidden');
    } else {
        regView.classList.remove('hidden');
        userView.classList.add('hidden');
        regTitle.textContent = currentRole === 'admin' ? 'Admin: Register Master Data' : 'Provider: Register Your Shop';
    }
});

// UI Rendering
function renderUserView() {
    // 1. Render Category Filter (Selection-Based)
    const filterNav = document.getElementById('master-category-list');
    filterNav.innerHTML = `
        <button class="active">All</button>
        ${masterCategories.map(catId => `
            <button>${t('master', '', catId)}</button>
        `).join('')}
    `;

    // 2. Render Timeline (Consumption)
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
                <p>New shop registered in the global network.</p>
            </div>
        </div>
    `).join('');
}

function renderAll() {
    renderUserView();
}

// Global Event Listeners
document.getElementById('lang-selector').addEventListener('change', (e) => {
    currentLang = e.target.value;
    localStorage.setItem('lang', currentLang);
    renderAll();
});

initSystem();
