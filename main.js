// Phase 1: Pet Health Core with SNS-style Feed UI
let dictionary = {};
let currentLang = localStorage.getItem('lang') || 'ko';

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

// Structured Pet Data (Pet-Centric)
const currentPet = {
    name: '방울이 (Bang-ul)',
    breed_code: 'breed_golden_retriever',
    sex: 'sex_male',
    birthdate: '2021-05-12'
};

// Timeline Events (SNS Feed Style)
const timelineEvents = [
    {
        id: 1,
        date: "2024-03-01",
        category: "medical",
        title: "정기 예방 접종",
        content: "종합백신(DHPPL) 및 광견병 예방 접종 완료.",
        source: "서울 동물 의료센터",
        isVerified: true
    },
    {
        id: 2,
        date: "2024-02-25",
        category: "grooming",
        title: "전신 미용 & 스파",
        content: "가위컷 미용 및 머드 스파 진행. 피부 상태 양호.",
        source: "해피퍼피 그루밍샵",
        isVerified: true
    },
    {
        id: 3,
        date: "2024-02-10",
        category: "shop",
        title: "유기농 사료 구매",
        content: "나우 프레쉬 퍼피 5kg 구매.",
        source: "펫월드 강남점",
        isVerified: false
    }
];

function renderPetHeader() {
    const container = document.getElementById('pet-profile-container');
    container.innerHTML = `
        <div class="pet-card">
            <h2>${currentPet.name}</h2>
            <p>${t('pet', currentPet.breed_code)} • ${t('pet', currentPet.sex)}</p>
            <p>${currentPet.birthdate}</p>
        </div>
    `;
}

function renderTimeline() {
    const feed = document.getElementById('timeline-feed');
    feed.innerHTML = `
        <div class="timeline-container">
            <div class="timeline-line"></div>
            ${timelineEvents.map(event => `
                <div class="timeline-event event-${event.category}">
                    <div class="timeline-dot"></div>
                    <div class="timeline-card">
                        <div class="event-header">
                            <span class="event-date">${event.date}</span>
                            ${event.isVerified ? '<span class="verified-badge">✓ Verified</span>' : ''}
                        </div>
                        <h3 class="event-title">${event.title}</h3>
                        <p class="event-content">${event.content}</p>
                        <div class="event-source">📍 ${event.source}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderAll() {
    renderPetHeader();
    renderTimeline();
    
    // Update static translations
    document.querySelectorAll('[data-t-key]').forEach(el => {
        const domain = el.getAttribute('data-t-domain');
        const key = el.getAttribute('data-t-key');
        el.textContent = t(domain, key);
    });
}

// Event Listeners
document.getElementById('lang-selector').addEventListener('change', (e) => {
    currentLang = e.target.value;
    localStorage.setItem('lang', currentLang);
    renderAll();
});

document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
});

// Init
initDictionary();
