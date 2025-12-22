class CustomSummaryCard extends HTMLElement {
    static get observedAttributes() {
        return ['value'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'value' && oldValue !== newValue) {
            const valueElement = this.querySelector('h3');
            if (valueElement) {
                // আপডেট: textContent এর বদলে innerHTML ব্যবহার করা হলো যাতে লাইন ব্রেক কাজ করে
                valueElement.innerHTML = newValue;
            } else {
                this.render();
            }
        }
    }

    render() {
        const title = this.getAttribute('title') || '';
        const value = this.getAttribute('value') || '';
        const icon = this.getAttribute('icon') || 'dollar-sign';
        const color = this.getAttribute('color') || 'bg-blue-500';
        
        this.innerHTML = `
            <style>
                .card { transition: all 0.3s ease; }
                .card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); }
            </style>
            <div class="card ${color} text-white rounded-lg p-6 shadow-md">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-sm font-medium opacity-80">${title}</p>
                        <h3 class="text-xl font-bold mt-1 leading-snug">${value}</h3>
                    </div>
                    <div class="p-3 rounded-full bg-white bg-opacity-20">
                        <i data-feather="${icon}"></i>
                    </div>
                </div>
            </div>
        `;
        
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }
}

customElements.define('custom-summary-card', CustomSummaryCard);    