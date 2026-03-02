// Universal Language Conversion v2 + Master Admin System
let dictionary = {};
let textEntities = {};
let currentLang = localStorage.getItem('lang') || 'ko';
let currentRole = 'user';

const LANGS = ['ko', 'en', 'ja', 'vi', 'id', 'zh', 'th', 'es', 'fr', 'de', 'it', 'pt', 'ar'];

// Master Data & Shop Data Storage
const masterRegistry = { breed: [], condition: [], industry: [], food: [] };
const registeredShops = [];

async function initSystem() {
    const dictResponse = await fetch('shared/dictionary/dictionary_values.json');
    dictionary = await dictResponse.json();
    seedMasterData();
    setupEventListeners();
    renderAll();
}

function seedMasterData() {
    const initialBreeds = [
        { id: 'm-breed-001', name: 'Golden Retriever', ko: '골든 리트리버' },
        { id: 'm-breed-002', name: 'Poodle', ko: '푸들' }
    ];
    initialBreeds.forEach(b => {
        textEntities[b.id] = {
            id: b.id,
            domain: 'breed',
            original_text: b.name,
            original_lang: 'en',
            converted_json: { ko: b.ko, en: b.name }
        };
        masterRegistry.breed.push(b.id);
    });
}

function t(domain, key, entityId = null) {
    if (entityId && textEntities[entityId]) {
        const entity = textEntities[entityId];
        // 1. 현재 선택된 언어의 값이 있으면 반환
        if (entity.converted_json[currentLang]) return entity.converted_json[currentLang];
        // 2. 없으면 원본 텍스트 반환
        return entity.original_text;
    }
    try {
        return dictionary[domain][key][currentLang] || dictionary[domain][key]['en'] || key;
    } catch (e) {
        return key;
    }
}

// 🌐 Universal Conversion Engine (Context-Aware Mock)
function generateMockTranslations(text, sourceLang) {
    const mock = {};
    LANGS.forEach(lang => {
        if (lang === sourceLang) {
            mock[lang] = text; // 현재 선택된 언어가 원본
        } else {
            // 다른 언어들은 [Source -> Target] 형태로 시뮬레이션
            mock[lang] = `${text} [${sourceLang.toUpperCase()}→${lang.toUpperCase()}]`; 
        }
    });
    return mock;
}

function renderConversionGrid(containerId, data) {
    const container = document.getElementById(containerId);
    container.innerHTML = LANGS.map(lang => `
        <div class="grid-item ${lang === currentLang ? 'source-lang' : ''}">
            <span>${lang.toUpperCase()}${lang === currentLang ? ' (ORG)' : ''}</span>
            <input type="text" data-lang="${lang}" value="${data[lang]}">
        </div>
    `).join('');
}

function setupEventListeners() {
    // 1. Admin Master Registration
    const adminInput = document.getElementById('admin-master-input');
    const adminConvertBtn = document.getElementById('admin-convert-btn');
    const adminPreview = document.getElementById('admin-conversion-preview');
    
    if(adminConvertBtn) {
        adminConvertBtn.addEventListener('click', () => {
            const text = adminInput.value.trim();
            if (!text) return;
            // 현재 선택된 currentLang을 원본 언어로 전달
            const translations = generateMockTranslations(text, currentLang);
            renderConversionGrid('admin-grid-items', translations);
            adminPreview.classList.remove('hidden');
        });
    }

    const saveAdminBtn = document.getElementById('save-admin-master-btn');
    if(saveAdminBtn) {
        saveAdminBtn.addEventListener('click', () => {
            const domain = document.getElementById('master-domain-selector').value;
            const entityId = `m-${domain}-${Date.now()}`;
            const converted = {};
            document.querySelectorAll('#admin-grid-items input').forEach(input => {
                converted[input.dataset.lang] = input.value;
            });

            textEntities[entityId] = { 
                id: entityId, 
                domain, 
                original_text: adminInput.value, 
                original_lang: currentLang, // 원본 언어 저장
                converted_json: converted, 
                auto_generated: false 
            };
            masterRegistry[domain].push(entityId);
            adminInput.value = '';
            adminPreview.classList.add('hidden');
            renderAll();
            alert(`Saved! Original Language: ${currentLang.toUpperCase()}`);
        });
    }

    // 2. Provider Shop Registration
    const shopInput = document.getElementById('master-input');
    const shopConvertBtn = document.getElementById('convert-btn');
    const shopPreview = document.getElementById('conversion-preview');

    if(shopConvertBtn) {
        shopConvertBtn.addEventListener('click', () => {
            const text = shopInput.value.trim();
            if (!text) return;
            const translations = generateMockTranslations(text, currentLang);
            renderConversionGrid('conversion-grid-items', translations);
            shopPreview.classList.remove('hidden');
        });
    }

    const saveShopBtn = document.getElementById('save-master-btn');
    if(saveShopBtn) {
        saveShopBtn.addEventListener('click', () => {
            const entityId = `shop-${Date.now()}`;
            const converted = {};
            document.querySelectorAll('#conversion-grid-items input').forEach(input => {
                converted[input.dataset.lang] = input.value;
            });

            textEntities[entityId] = { 
                id: entityId, 
                domain: 'shop', 
                original_text: shopInput.value, 
                original_lang: currentLang, // 원본 언어 저장
                converted_json: converted, 
                auto_generated: false 
            };
            registeredShops.push(entityId);
            shopInput.value = '';
            shopPreview.classList.add('hidden');
            renderAll();
            alert(`Shop Registered! (Base: ${currentLang.toUpperCase()})`);
        });
    }

    // 3. Selectors
    document.getElementById('role-selector').addEventListener('change', (e) => {
        currentRole = e.target.value;
        document.getElementById('admin-view').classList.toggle('hidden', currentRole !== 'admin');
        document.getElementById('registration-view').classList.toggle('hidden', currentRole !== 'provider');
        document.getElementById('user-view').classList.toggle('hidden', currentRole !== 'user');
        renderAll();
    });

    document.getElementById('lang-selector').addEventListener('change', (e) => {
        currentLang = e.target.value;
        localStorage.setItem('lang', currentLang);
        renderAll();
    });

    document.getElementById('master-domain-selector').addEventListener('change', renderAll);
}

function renderAll() {
    if (currentRole === 'admin') {
        const table = document.getElementById('master-items-table');
        const domain = document.getElementById('master-domain-selector').value;
        table.innerHTML = `
            <div class="table-row header"><span>Domain</span><span>Name (${currentLang.toUpperCase()})</span><span>Status</span></div>
            ${masterRegistry[domain].map(id => `<div class="table-row"><span>${domain.toUpperCase()}</span><span>${t(domain, '', id)}</span><span style="color:var(--training)">ACTIVE</span></div>`).join('')}
        `;
    }
    
    if (currentRole === 'user') {
        const feed = document.getElementById('timeline-feed');
        feed.innerHTML = registeredShops.map(shopId => `
            <div class="timeline-event event-shop">
                <div class="timeline-dot"></div>
                <div class="timeline-card">
                    <div class="event-header"><span class="event-date">2024-03-02</span><span class="verified-badge">✓ Verified Provider</span></div>
                    <h3>${t('shop', '', shopId)}</h3>
                    <p>Global Shop Profile (Base: ${textEntities[shopId].original_lang.toUpperCase()})</p>
                </div>
            </div>
        `).join('') || '<p style="text-align:center; color:var(--text-dim)">No shops registered yet.</p>';
    }
}

document.getElementById('theme-toggle').addEventListener('click', () => document.body.classList.toggle('light-mode'));

initSystem();
