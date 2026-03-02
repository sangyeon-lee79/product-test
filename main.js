// Phase 1: Pet Health Core with Full SNS Feed & Filter
let dictionary = {};
let currentLang = localStorage.getItem('lang') || 'ko';
let currentFilter = 'all';

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

// Structured Pet Data
const currentPet = {
    name: '방울이 (Bang-ul)',
    breed_code: 'breed_golden_retriever',
    sex: 'sex_male',
    birthdate: '2021-05-12',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop'
};

// Timeline Events
const timelineData = [
    { id: 1, date: "2024-03-01", category: "medical", title: "정기 예방 접종", content: "종합백신(DHPPL) 및 광견병 예방 접종 완료.", source: "서울 동물 의료센터", isVerified: true },
    { id: 2, date: "2024-02-25", category: "grooming", title: "전신 미용 & 스파", content: "가위컷 미용 및 머드 스파 진행.", source: "해피퍼피 그루밍샵", isVerified: true },
    { id: 3, date: "2024-02-15", category: "training", title: "사회성 교육", content: "다른 강아지와의 인사법 교육 중.", source: "도그 마스터 훈련소", isVerified: true },
    { id: 4, date: "2024-02-10", category: "shop", title: "유기농 사료 구매", content: "나우 프레쉬 퍼피 5kg 구매.", source: "펫월드 강남점", isVerified: false },
    { id: 5, date: "2024-01-20", category: "hotel", title: "설 연휴 위탁", content: "3박 4일 호텔 투숙 완료.", source: "스테이 펫 호텔", isVerified: true }
];

function renderPetProfile() {
    const container = document.getElementById('pet-profile-container');
    container.innerHTML = `
        <div class="profile-card">
            <div class="profile-img">
                <img src="${currentPet.photo}" alt="Pet">
            </div>
            <div class="profile-info">
                <h2>${currentPet.name}</h2>
                <p>${t('pet', currentPet.breed_code)} • ${t('pet', currentPet.sex)}</p>
                <p>${currentPet.birthdate}</p>
            </div>
        </div>
    `;
}

function renderTimeline() {
    const feed = document.getElementById('timeline-feed');
    const filtered = currentFilter === 'all' 
        ? timelineData 
        : timelineData.filter(item => item.category === currentFilter);

    feed.innerHTML = filtered.map(event => `
        <div class="timeline-event event-${event.category}">
            <div class="timeline-dot"></div>
            <div class="timeline-card">
                <div class="event-header">
                    <span class="event-date">${event.date}</span>
                    ${event.isVerified ? '<span class="verified-badge">✓ Verified</span>' : ''}
                </div>
                <h3>${event.title}</h3>
                <p>${event.content}</p>
                <div class="event-source">📍 ${event.source}</div>
            </div>
        </div>
    `).join('');
}

function renderAll() {
    renderPetProfile();
    renderTimeline();
    
    // Static translations
    document.querySelectorAll('[data-t-key]').forEach(el => {
        el.textContent = t(el.dataset.tDomain, el.dataset.tKey);
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

document.querySelectorAll('.category-filter button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.category-filter button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.category;
        renderTimeline();
    });
});

// Init
initDictionary();
