// Universal Language Conversion v2 + Master Admin + Distributed API Model
let dictionary = {};
let textEntities = {};
let currentLang = localStorage.getItem('lang') || 'ko';
let currentRole = 'user';
let userApiKey = localStorage.getItem('google_api_key') || ''; // Distributed API

const LANGS = ['ko', 'en', 'ja', 'vi', 'id', 'zh', 'th', 'es', 'fr', 'de', 'it', 'pt', 'ar'];

// Master Data & Menu Storage
const masterRegistry = { breed: [], condition: [], industry: [], food: [] };
const menuEntities = {
    'menu-studio': 'm-menu-001',
    'menu-users': 'm-menu-002',
    'menu-pets': 'm-menu-003'
};

async function initSystem() {
    const dictResponse = await fetch('shared/dictionary/dictionary_values.json');
    dictionary = await dictResponse.json();
    seedInitialData();
    setupEventListeners();
    renderAll();
}

function seedInitialData() {
    // 1. Menu Labels as Entities
    textEntities['m-menu-001'] = { domain: 'menu', original_text: 'Master Data Studio', converted_json: { ko: '마스터 데이터 스튜디오', en: 'Master Data Studio' } };
    textEntities['m-menu-002'] = { domain: 'menu', original_text: 'Users', converted_json: { ko: '사용자 관리', en: 'Users' } };
    textEntities['m-menu-003'] = { domain: 'menu', original_text: 'Pets', converted_json: { ko: '반려동물 관리', en: 'Pets' } };

    // 2. Initial Breeds
    const bId = 'm-breed-001';
    textEntities[bId] = { domain: 'breed', original_text: 'Golden Retriever', converted_json: { ko: '골든 리트리버', en: 'Golden Retriever' } };
    masterRegistry.breed.push(bId);
}

function t(domain, key, entityId = null) {
    if (entityId && textEntities[entityId]) {
        return textEntities[entityId].converted_json[currentLang] || textEntities[entityId].original_text;
    }
    try {
        return dictionary[domain][key][currentLang] || dictionary[domain][key]['en'] || key;
    } catch (e) { return key; }
}

// 🌐 Universal Editor (Distributed API)
async function performTranslation(text, sourceLang) {
    if (!userApiKey) {
        console.warn("No API Key provided. Using Mock mode.");
    }
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
        <div class="grid-item">
            <span>${lang.toUpperCase()}</span>
            <input type="text" data-lang="${lang}" value="${entity.converted_json[lang] || ''}">
        </div>
    `).join('');
    
    document.getElementById('save-modal-btn').onclick = () => {
        grid.querySelectorAll('input').forEach(input => {
            entity.converted_json[input.dataset.lang] = input.value;
        });
        modal.classList.add('hidden');
        renderAll();
    };
    
    modal.classList.remove('hidden');
}

function setupEventListeners() {
    // Admin: New Item
    const adminConvertBtn = document.getElementById('admin-convert-btn');
    if(adminConvertBtn) {
        adminConvertBtn.addEventListener('click', async () => {
            const text = document.getElementById('admin-master-input').value;
            const converted = await performTranslation(text, currentLang);
            const entityId = `m-item-${Date.now()}`;
            textEntities[entityId] = { domain: 'master', original_text: text, converted_json: converted };
            const domain = document.getElementById('master-domain-selector').value;
            masterRegistry[domain].push(entityId);
            renderAll();
        });
    }

    // Settings: Save API Key
    const saveApiKeyBtn = document.getElementById('save-api-key-btn');
    if(saveApiKeyBtn) {
        saveApiKeyBtn.addEventListener('click', () => {
            userApiKey = document.getElementById('user-api-key').value;
            localStorage.setItem('google_api_key', userApiKey);
            alert('Personal API Key Saved!');
        });
    }

    document.getElementById('role-selector').addEventListener('change', (e) => {
        currentRole = e.target.value;
        document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
        if (currentRole === 'admin') document.getElementById('admin-view').classList.remove('hidden');
        else if (currentRole === 'user') document.getElementById('user-view').classList.remove('hidden');
        renderAll();
    });

    document.getElementById('lang-selector').addEventListener('change', (e) => {
        currentLang = e.target.value;
        renderAll();
    });
}

function renderAll() {
    // Render Menu Labels
    document.querySelectorAll('[data-entity-id]').forEach(el => {
        const id = el.getAttribute('data-entity-id');
        el.innerHTML = `${t('', '', id)} <button class="mini-edit-btn" onclick="openUniversalEditor('${id}')">📝</button>`;
    });

    if (currentRole === 'admin') {
        const domain = document.getElementById('master-domain-selector').value;
        const table = document.getElementById('master-items-table');
        table.innerHTML = masterRegistry[domain].map(id => `
            <div class="table-row">
                <span>${t('', '', id)}</span>
                <button onclick="openUniversalEditor('${id}')">🌐 Edit</button>
            </div>
        `).join('');
    }
}

// Initialize
initSystem();
window.openUniversalEditor = openUniversalEditor; // Global for inline onclick
