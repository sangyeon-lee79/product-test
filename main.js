// Timeline Data with Authentication Info and Translations
const timelineData = [
    {
        id: 1,
        date: "2024-03-01",
        category: "medical",
        title: "정기 예방 접종",
        content: "종합백신(DHPPL) 및 광견병 예방 접종 완료. 다음 접종은 1년 후입니다.",
        translation: "Annual Vaccination (DHPPL & Rabies) completed. Next due in 1 year.",
        institution: "서울 동물 의료센터",
        isVerified: true
    },
    {
        id: 2,
        date: "2024-02-25",
        category: "grooming",
        title: "전신 미용 & 스파",
        content: "가위컷 미용 및 머드 스파 진행. 피부 상태 양호함.",
        translation: "Full grooming & Mud spa. Skin condition is healthy.",
        institution: "해피퍼피 그루밍샵",
        isVerified: true
    },
    {
        id: 3,
        date: "2024-02-15",
        category: "training",
        title: "사회성 교육 5회차",
        content: "다른 강아지와의 인사법 교육 중. 집중력이 매우 좋아짐.",
        translation: "Socialization Session #5. Greeting other dogs. Focus significantly improved.",
        institution: "도그 마스터 훈련소",
        isVerified: true
    },
    {
        id: 4,
        date: "2024-02-10",
        category: "shop",
        title: "유기농 사료 구매",
        content: "나우 프레쉬 퍼피 5kg 구매. 기호성 테스트 통과.",
        translation: "Purchased Now Fresh Puppy 5kg. Passed palatability test.",
        institution: "펫월드 강남점",
        isVerified: false
    },
    {
        id: 5,
        date: "2024-01-20",
        category: "hotel",
        title: "설 연휴 위탁 관리",
        content: "3박 4일 호텔 투숙. 식사 및 배변 상태 정상, 활동량 많음.",
        translation: "3-night stay during Lunar New Year. Normal appetite and bowel movements.",
        institution: "스테이 펫 호텔",
        isVerified: true
    }
];

// State Management
let currentFilter = 'all';
let isTranslated = false;

// DOM Elements
const feedContainer = document.getElementById('timeline-feed');
const themeToggle = document.getElementById('theme-toggle');
const translateToggle = document.getElementById('translate-toggle');
const filterButtons = document.querySelectorAll('.category-filter button');

// Render Feed
function renderFeed() {
    feedContainer.innerHTML = '';
    
    const filteredData = currentFilter === 'all' 
        ? timelineData 
        : timelineData.filter(item => item.category === currentFilter);

    filteredData.forEach(item => {
        const timelineItem = document.createElement('div');
        timelineItem.className = `timeline-item ${item.category}`;
        
        timelineItem.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="timeline-card">
                <p class="date">${item.date}</p>
                <h3>
                    ${item.title}
                    ${item.isVerified ? '<span class="verified-badge">✓ Verified</span>' : ''}
                </h3>
                <p class="content">${isTranslated ? item.translation : item.content}</p>
                ${isTranslated ? '<p class="translated-label">✨ Auto-translated</p>' : ''}
                <p class="institution" style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 1rem;">
                    📍 ${item.institution}
                </p>
            </div>
        `;
        feedContainer.appendChild(timelineItem);
    });
}

// Theme Handling
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.className = savedTheme + '-mode';
}

themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-mode');
    const newTheme = isDark ? 'light' : 'dark';
    document.body.className = newTheme + '-mode';
    localStorage.setItem('theme', newTheme);
});

// Translation Handling
translateToggle.addEventListener('click', () => {
    isTranslated = !isTranslated;
    translateToggle.style.color = isTranslated ? 'var(--accent-hotel)' : 'inherit';
    renderFeed();
});

// Filter Handling
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.category;
        renderFeed();
    });
});

// Initialize
initTheme();
renderFeed();
