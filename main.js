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
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                    animation: fadeIn 0.5s ease;
                }
            </style>
            <div>${number}</div>
        `;
    }

    getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
}

customElements.define('lotto-ball', LottoBall);


function generateLottoNumbers() {
    const numbersContainer = document.getElementById('lotto-numbers');
    numbersContainer.innerHTML = '';
    const numbers = new Set();
    while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }

    for (const number of numbers) {
        const lottoBall = document.createElement('lotto-ball');
        lottoBall.setAttribute('number', number);
        numbersContainer.appendChild(lottoBall);
    }
}

document.getElementById('generate-btn').addEventListener('click', generateLottoNumbers);
