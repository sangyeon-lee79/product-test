// Phase 1 + Language Conversion v2 (Universal Text Conversion)
let dictionary = {};
let textEntities = {}; 
let currentLang = localStorage.getItem('lang') || 'ko';

const LANGS = ['ko', 'en', 'ja', 'vi', 'id', 'zh', 'th', 'es', 'fr', 'de', 'it', 'pt', 'ar'];

async function initSystem() {
    const dictResponse = await fetch('shared/dictionary/dictionary_values.json');
    dictionary = await dictResponse.json();
    seedTextEntities();
    renderAll();
}

function t(domain, key, entityId = null) {
    if (entityId && textEntities[entityId]) {
        const entity = textEntities[entityId];
        return entity.converted_json[currentLang] || entity.original_text;
    }
    try {
        return dictionary[domain][key][currentLang] || dictionary[domain][key]['en'] || key;
    } catch (e) {
        return key;
    }
}

// UI State
const currentPet = { name_entity_id: 'pet-name-001', breed_code: 'breed_golden_retriever', sex: 'sex_male', birthdate: '2021-05-12', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop' };
let timelineData = [
    { id: 1, date: "2024-03-01", category: "medical", title_entity_id: 'title-001', source_entity_id: 'shop-name-001', isVerified: true }
];

function seedTextEntities() {
    textEntities['pet-name-001'] = { id: 'pet-name-001', domain: 'pet', original_text: '방울이', converted_json: { ko: '방울이', en: 'Bang-ul', ja: 'バングル', vi: 'Bang-ul', id: 'Bang-ul', zh: '小铃铛', th: 'บังอุล', es: 'Bang-ul', fr: 'Bang-ul', de: 'Bang-ul', it: 'Bang-ul', pt: 'Bang-ul', ar: 'بانغ يول' } };
    textEntities['shop-name-001'] = { id: 'shop-name-001', domain: 'shop', original_text: '서울 동물 의료센터', converted_json: { ko: '서울 동물 의료센터', en: 'Seoul Animal Medical Center', ja: 'ソウル動物医療センター' } };
    textEntities['title-001'] = { id: 'title-001', domain: 'medical', original_text: '정기 예방 접종', converted_json: { ko: '정기 예방 접종', en: 'Regular Vaccination', ja: '定期予防接種' } };
}

// Conversion Logic
const recordInput = document.getElementById('record-input');
const convertBtn = document.getElementById('convert-btn');
const previewGrid = document.getElementById('conversion-preview');
const gridItems = document.getElementById('conversion-grid-items');
let tempConverted = {};

convertBtn.addEventListener('click', () => {
    const text = recordInput.value.trim();
    if (!text) return;

    // Mock 13-lang conversion
    tempConverted = {};
    LANGS.forEach(lang => {
        tempConverted[lang] = lang === 'ko' ? text : `${text} (${lang.toUpperCase()})`;
    });

    renderGrid();
    previewGrid.classList.remove('hidden');
});

function renderGrid() {
    gridItems.innerHTML = LANGS.map(lang => `
        <div class="grid-item">
            <span>${lang.toUpperCase()}</span>
            <input type="text" data-lang="${lang}" value="${tempConverted[lang]}">
        </div>
    `).join('');
}

document.getElementById('save-record-btn').addEventListener('click', () => {
    const entityId = `entity-${Date.now()}`;
    const finalConverted = {};
    
    gridItems.querySelectorAll('input').forEach(input => {
        finalConverted[input.dataset.lang] = input.value;
    });

    textEntities[entityId] = {
        id: entityId,
        domain: 'feed',
        original_text: recordInput.value,
        converted_json: finalConverted,
        auto_generated: false // User edited
    };

    timelineData.unshift({
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        category: 'feed',
        title_entity_id: entityId,
        source_entity_id: null,
        isVerified: false
    });

    recordInput.value = '';
    previewGrid.classList.add('hidden');
    renderTimeline();
});

function renderPetProfile() {
    const container = document.getElementById('pet-profile-container');
    container.innerHTML = `
        <div class="profile-card">
            <div class="profile-img">
                <img src="${currentPet.photo}" alt="Pet">
            </div>
            <div class="profile-info">
                <h2>${t('pet', '', currentPet.name_entity_id)}</h2>
                <p>${t('pet', currentPet.breed_code)} • ${t('pet', currentPet.sex)}</p>
                <p>${currentPet.birthdate}</p>
            </div>
        </div>
    `;
}

function renderTimeline() {
    const feed = document.getElementById('timeline-feed');
    feed.innerHTML = `
        <div class="timeline-container">
            <div class="timeline-line"></div>
            ${timelineData.map(event => `
                <div class="timeline-event event-${event.category}">
                    <div class="timeline-dot"></div>
                    <div class="timeline-card">
                        <div class="event-header">
                            <span class="event-date">${event.date}</span>
                            ${event.isVerified ? '<span class="verified-badge">✓ Verified</span>' : ''}
                        </div>
                        <h3>${t(event.category, '', event.title_entity_id)}</h3>
                        ${event.source_entity_id ? `<div class="event-source">📍 ${t('shop', '', event.source_entity_id)}</div>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderAll() {
    renderPetProfile();
    renderTimeline();
    document.querySelectorAll('[data-t-key]').forEach(el => {
        el.textContent = t(el.dataset.tDomain, el.dataset.tKey);
    });
}

document.getElementById('lang-selector').addEventListener('change', (e) => {
    currentLang = e.target.value;
    localStorage.setItem('lang', currentLang);
    renderAll();
});

document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
});

initSystem();
