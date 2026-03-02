// 방울아놀자 Integrated System: UI Dictionary + Master Menu + Dashboards + Universal Edit
let uiDictionary = {};
let uiKeyPages = {};
let masterRegistry = { breed: [], industry: [], country: [] };
let textEntities = {};
let registeredShops = []; // Stores { id, store_name_id, address_id, phone, country_id, currency, industries: [] }
let currentStore = null; // Currently logged in provider's store

let currentLang = localStorage.getItem('lang') || 'ko';
let currentRole = 'user';
let uiViewMode = 'all';
let selectedUIPage = 'index';

const LANGS = ['ko', 'en', 'ja', 'vi', 'id', 'zh', 'th', 'es', 'fr', 'de', 'it', 'pt', 'ar'];

async function initSystem() {
    uiDictionary = {
        'app_title': { ko: '방울아놀자 - Global Pet Platform', en: 'Bang-ul Play' },
        'app_logo': { ko: '방울아놀자', en: 'Bang-ul Play' },
        'role_user': { ko: '보호자 모드', en: 'User Dashboard' },
        'role_provider': { ko: '공급자 모드', en: 'Provider Dashboard' },
        'role_admin': { ko: '마스터 관리자', en: 'Master Admin' },
        'settings_title': { ko: '개인 번역 설정', en: 'Translation Settings' },
        'btn_save': { ko: '저장', en: 'Save' },
        'label_ui_dictionary': { ko: 'UI 사전 스튜디오', en: 'UI Dictionary Studio' },
        'label_master_studio': { ko: '마스터 데이터 스튜디오', en: 'Master Data Studio' },
        'label_shop_profile': { ko: '상점 프로필 관리', en: 'Shop Profile Management' },
        'label_store_name': { ko: '상점명', en: 'Shop Name' },
        'label_address': { ko: '주소', en: 'Address' },
        'label_phone': { ko: '전화번호', en: 'Phone Number' },
        'label_country': { ko: '국가', en: 'Country' },
        'label_currency': { ko: '통화', en: 'Currency' },
        'label_industries': { ko: '업종 (다중 선택)', en: 'Industries (Multi-select)' },
        'btn_create_profile': { ko: '프로필 생성', en: 'Create Profile' },
        'btn_edit_profile': { ko: '프로필 수정', en: 'Edit Profile' },
        'modal_edit_title': { ko: '🌐 번역 편집', en: '🌐 Edit Translations' },
        'btn_save_changes': { ko: '저장', en: 'Save' },
        'btn_cancel': { ko: '취소', en: 'Cancel' }
    };

    seedInitialData();
    setupEventListeners();
    initTheme();
    renderAll();
}

function seedInitialData() {
    // Industries
    registerMasterItem('industry', 'Grooming', { ko: '애견미용', en: 'Dog Grooming' });
    registerMasterItem('industry', 'Hospital', { ko: '동물병원', en: 'Animal Hospital' });
    registerMasterItem('industry', 'Hotel', { ko: '애견호텔', en: 'Pet Hotel' });

    // Countries & Currencies
    registerCountry('South Korea', 'KRW', '₩', { ko: '대한민국', en: 'South Korea' });
    registerCountry('USA', 'USD', '$', { ko: '미국', en: 'USA' });
    registerCountry('Vietnam', 'VND', '₫', { ko: '베트남', en: 'Vietnam' });
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

// 🌓 Theme Logic
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') document.body.classList.add('light-mode');
}

function toggleTheme() {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

// 🌐 Universal Editor
function openUniversalEditor(source, key, id = null, callback = null) {
    const target = source === 'ui' ? uiDictionary[key] : textEntities[id].converted_json;
    const modal = document.getElementById('universal-modal');
    const grid = document.getElementById('modal-grid-items');
    grid.innerHTML = LANGS.map(lang => `
        <div class="grid-item"><span>${lang.toUpperCase()}</span><input type="text" data-lang="${lang}" value="${target[lang] || ''}"></div>
    `).join('');
    document.getElementById('save-modal-btn').onclick = () => {
        grid.querySelectorAll('input').forEach(input => { target[input.dataset.lang] = input.value; });
        modal.classList.add('hidden');
        if (callback) callback();
        renderAll();
    };
    modal.classList.remove('hidden');
}

function setupEventListeners() {
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

    document.getElementById('role-selector').addEventListener('change', (e) => {
        currentRole = e.target.value;
        document.querySelectorAll('.role-view').forEach(v => v.classList.add('hidden'));
        document.getElementById(`${currentRole}-view`).classList.remove('hidden');
        renderAll();
    });

    document.getElementById('lang-selector').addEventListener('change', (e) => {
        currentLang = e.target.value;
        localStorage.setItem('lang', currentLang);
        renderAll();
    });

    // Provider Store Profile Logic
    document.getElementById('save-store-btn')?.addEventListener('click', () => {
        const name = document.getElementById('store-name-input').value;
        const address = document.getElementById('store-address-input').value;
        const phone = document.getElementById('store-phone-input').value;
        const countryId = document.getElementById('store-country-select').value;
        const selectedIndustries = Array.from(document.getElementById('store-industry-select').selectedOptions).map(opt => opt.value);

        if (!name || !countryId) return alert('Name and Country are required!');

        // Create Text Entities for name and address
        const nameId = `entity-name-${Date.now()}`;
        const addrId = `entity-addr-${Date.now()}`;
        textEntities[nameId] = { domain: 'shop', original_text: name, converted_json: { [currentLang]: name } };
        textEntities[addrId] = { domain: 'shop', original_text: address, converted_json: { [currentLang]: address } };

        currentStore = {
            id: `store-${Date.now()}`,
            name_id: nameId,
            address_id: addrId,
            phone: phone,
            country_id: countryId,
            currency: textEntities[countryId].currency_code,
            industries: selectedIndustries
        };

        alert('Store Profile Saved!');
        renderAll();
    });
}

function renderAll() {
    // 1. Static UI Sync
    document.querySelectorAll('[data-ui-key]').forEach(el => {
        const key = el.getAttribute('data-ui-key');
        el.innerHTML = `${t('ui', key)} <button class="mini-edit-btn" onclick="openUniversalEditor('ui', '${key}')">📝</button>`;
    });

    // 2. Admin Table
    if (currentRole === 'admin') {
        const table = document.getElementById('ui-dictionary-table');
        let keys = Object.keys(uiDictionary);
        table.innerHTML = keys.map(key => `
            <div class="table-row"><span class="key-name">${key}</span><span class="current-val">[${t('ui', key)}]</span><button onclick="openUniversalEditor('ui', '${key}')">Edit UI</button></div>
        `).join('');
    }

    // 3. Provider View (Fixed Flow)
    if (currentRole === 'provider') {
        renderProviderProfile();
    }

    // 4. User View
    if (currentRole === 'user') {
        const feed = document.getElementById('timeline-feed');
        feed.innerHTML = currentStore ? `
            <div class="timeline-event event-shop"><div class="timeline-dot"></div><div class="timeline-card">
                <div class="event-header"><span class="event-date">JUST NOW</span><span class="industry-tag">${currentStore.industries.map(id => t('master', '', id)).join(', ')}</span></div>
                <h3>${t('entity', '', currentStore.name_id)}</h3>
                <p>${t('entity', '', currentStore.address_id)} | ${currentStore.phone}</p>
                <p>Currency: ${currentStore.currency}</p>
            </div></div>
        ` : '<p style="text-align:center; color:var(--text-dim)">No active store data.</p>';
    }
}

function renderProviderProfile() {
    const container = document.getElementById('provider-profile-area');
    if (!currentStore) {
        // Show Create Form
        container.innerHTML = `
            <div class="card registration-form">
                <h3 data-ui-key="label_shop_reg">${t('ui', 'label_shop_reg')}</h3>
                <div class="input-container">
                    <label>${t('ui', 'label_store_name')}</label>
                    <div class="input-group">
                        <input type="text" id="store-name-input" placeholder="Shop Name">
                        <button class="globe-btn" onclick="alert('Use the editor after saving or implement temporary entity logic')">🌐</button>
                    </div>
                </div>
                <div class="input-container">
                    <label>${t('ui', 'label_address')}</label>
                    <input type="text" id="store-address-input" placeholder="Address">
                </div>
                <div class="input-container">
                    <label>${t('ui', 'label_phone')}</label>
                    <input type="text" id="store-phone-input" placeholder="Phone">
                </div>
                <div class="input-container">
                    <label>${t('ui', 'label_country')}</label>
                    <select id="store-country-select" onchange="onCountryChange(this.value)">
                        <option value="">-- Select Country --</option>
                        ${masterRegistry.country.map(id => `<option value="${id}">${t('master', '', id)}</option>`).join('')}
                    </select>
                </div>
                <div class="input-container">
                    <label>${t('ui', 'label_currency')}</label>
                    <input type="text" id="store-currency-display" readonly placeholder="Auto-derived">
                </div>
                <div class="input-container">
                    <label>${t('ui', 'label_industries')}</label>
                    <select id="store-industry-select" multiple>
                        ${masterRegistry.industry.map(id => `<option value="${id}">${t('master', '', id)}</option>`).join('')}
                    </select>
                </div>
                <button id="save-store-btn" class="save-btn">${t('ui', 'btn_save')}</button>
            </div>
        `;
        // Re-attach event listener because innerHTML wipes them
        document.getElementById('save-store-btn').onclick = () => {
            const name = document.getElementById('store-name-input').value;
            const countryId = document.getElementById('store-country-select').value;
            if(!name || !countryId) return alert('Missing fields');
            
            const nameId = `name-${Date.now()}`;
            textEntities[nameId] = { domain: 'shop', original_text: name, converted_json: { [currentLang]: name } };
            const addrId = `addr-${Date.now()}`;
            textEntities[addrId] = { domain: 'shop', original_text: document.getElementById('store-address-input').value, converted_json: { [currentLang]: document.getElementById('store-address-input').value } };

            currentStore = {
                id: `store-${Date.now()}`,
                name_id: nameId,
                address_id: addrId,
                phone: document.getElementById('store-phone-input').value,
                country_id: countryId,
                currency: textEntities[countryId].currency_code,
                industries: Array.from(document.getElementById('store-industry-select').selectedOptions).map(opt => opt.value)
            };
            renderAll();
        };
    } else {
        // Show Detail/Edit Page
        container.innerHTML = `
            <div class="card">
                <h3>${t('entity', '', currentStore.name_id)} <button onclick="openUniversalEditor('entity', '', '${currentStore.name_id}')">🌐 Edit Name</button></h3>
                <p><strong>Address:</strong> ${t('entity', '', currentStore.address_id)} <button onclick="openUniversalEditor('entity', '', '${currentStore.address_id}')">🌐 Edit Address</button></p>
                <p><strong>Phone:</strong> ${currentStore.phone}</p>
                <p><strong>Country:</strong> ${t('master', '', currentStore.country_id)}</p>
                <p><strong>Currency:</strong> ${currentStore.currency}</p>
                <p><strong>Industries:</strong> ${currentStore.industries.map(id => t('master', '', id)).join(', ')}</p>
                <button class="cancel-btn" onclick="currentStore = null; renderAll();">Reset (Simulate Logout/New)</button>
            </div>
        `;
    }
}

function onCountryChange(val) {
    const display = document.getElementById('store-currency-display');
    if (val && textEntities[val]) {
        display.value = `${textEntities[val].currency_code} (${textEntities[val].currency_symbol})`;
    } else {
        display.value = '';
    }
}

initSystem();
window.openUniversalEditor = openUniversalEditor;
window.onCountryChange = onCountryChange;
