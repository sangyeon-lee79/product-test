// Phase 1: Pet Health Core Implementation
// Rule 0.1: Alignment with PPD.md / LLD.md

let dictionary = {};
let currentLang = localStorage.getItem('lang') || 'ko';

// Rule 4: Language Conversion System (Patent Style)
async function initDictionary() {
    const response = await fetch('shared/dictionary/dictionary_values.json');
    dictionary = await response.json();
    renderAll();
}

function t(domain, key) {
    try {
        return dictionary[domain][key][currentLang] || dictionary[domain][key]['en'] || key;
    } catch (e) {
        return key;
    }
}

// Phase 1 Core Data (Pet-Centric)
const currentPet = {
    id: 'uuid-coco-001',
    name: '방울이 (Bang-ul)',
    breed_code: 'breed_golden_retriever',
    sex: 'sex_male',
    birthdate: '2021-05-12',
    weight_kg: 28.5,
    conditions: [
        { code: 'healthy', diagnosed_date: '2024-01-01', status: 'active' }
    ],
    metrics: [
        { code: 'weight', value: 28.5, unit: 'kg', recorded_at: '2024-03-01' },
        { code: 'activity', value: 8500, unit: 'steps', recorded_at: '2024-03-01' }
    ]
};

// Phase 1 Timeline (Auto-Cumulative)
const timelineEvents = [
    { type: 'metric', ref: 'weight', value: '28.5kg', time: '2024-03-01' },
    { type: 'condition', ref: 'healthy', time: '2024-01-01' }
];

function renderPetHeader() {
    const container = document.getElementById('pet-profile-container');
    container.innerHTML = `
        <div class="pet-card">
            <h2>${currentPet.name}</h2>
            <p>${t('pet', currentPet.breed_code)} • ${t('pet', currentPet.sex)}</p>
            <p>${currentPet.birthdate} (${calculateAge(currentPet.birthdate)})</p>
        </div>
    `;
}

function renderStats() {
    const metricsView = document.getElementById('metrics-view');
    metricsView.innerHTML = currentPet.metrics.map(m => `
        <div class="metric-item">
            <span>${m.code}:</span> <strong>${m.value}${m.unit}</strong>
        </div>
    `).join('');

    const conditionsList = document.getElementById('conditions-list');
    conditionsList.innerHTML = currentPet.conditions.map(c => `
        <div class="condition-badge ${c.code}">
            ${t('condition', c.code)}
        </div>
    `).join('');
}

function renderTimeline() {
    const feed = document.getElementById('timeline-feed');
    feed.innerHTML = timelineEvents.map(e => `
        <div class="timeline-event ${e.type}">
            <span class="time">${e.time}</span>
            <span class="type">[${e.type}]</span>
            <span class="desc">${e.type === 'condition' ? t('condition', e.ref) : e.ref + ': ' + e.value}</span>
        </div>
    `).join('');
}

function renderAll() {
    renderPetHeader();
    renderStats();
    renderTimeline();
    
    // Update static translations
    document.querySelectorAll('[data-t-key]').forEach(el => {
        const domain = el.getAttribute('data-t-domain');
        const key = el.getAttribute('data-t-key');
        el.textContent = t(domain, key);
    });
}

function calculateAge(birthdate) {
    const birth = new Date(birthdate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age + ' yrs';
}

// Event Listeners
document.getElementById('lang-selector').value = currentLang;
document.getElementById('lang-selector').addEventListener('change', (e) => {
    currentLang = e.target.value;
    localStorage.setItem('lang', currentLang);
    renderAll();
});

// Init
initDictionary();
