class LottoBall extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const number = this.getAttribute('number');
        const color = this.getRandomColor();
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: ${color};
                    color: white;
                    font-size: 1.5rem;
                    font-weight: bold;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                    animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }

                @keyframes popIn {
                    0% { transform: scale(0); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
            </style>
            <div>${number}</div>
        `;
    }

    getRandomColor() {
        const colors = [
            '#f1c40f', '#e67e22', '#e74c3c', '#3498db', '#2ecc71', 
            '#9b59b6', '#1abc9c', '#34495e', '#d35400', '#c0392b'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}

if (!customElements.get('lotto-ball')) {
    customElements.define('lotto-ball', LottoBall);
}

// Lotto Generation Logic
function generateLottoNumbers() {
    const numbersContainer = document.getElementById('lotto-numbers');
    numbersContainer.innerHTML = '';
    const numbers = new Set();
    while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }

    const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);

    sortedNumbers.forEach((number, index) => {
        setTimeout(() => {
            const lottoBall = document.createElement('lotto-ball');
            lottoBall.setAttribute('number', number);
            numbersContainer.appendChild(lottoBall);
        }, index * 100);
    });
}

// Theme Toggle Logic
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

function setTheme(theme) {
    if (theme === 'light') {
        body.classList.add('light-mode');
        themeToggle.querySelector('.icon').textContent = '🌞';
    } else {
        body.classList.remove('light-mode');
        themeToggle.querySelector('.icon').textContent = '🌓';
    }
    localStorage.setItem('theme', theme);
}

themeToggle.addEventListener('click', () => {
    const isLight = body.classList.contains('light-mode');
    setTheme(isLight ? 'dark' : 'light');
});

// Initialize Theme
const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
setTheme(savedTheme);

// Event Listeners
document.getElementById('generate-btn').addEventListener('click', generateLottoNumbers);
