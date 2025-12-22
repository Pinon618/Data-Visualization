let conversionChartInstance = null;
let personChartInstance = null;
let flowChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    const selector = document.getElementById('sheetSelector');
    
    // ডাটা আছে কিনা চেক
    if (typeof allSheetsData === 'undefined') return;

    // ড্রপডাউন লোড
    const sheetNames = Object.keys(allSheetsData);
    selector.innerHTML = '';
    sheetNames.forEach((name, index) => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        if(index === 0) option.selected = true;
        selector.appendChild(option);
    });

    // প্রথম শিট লোড
    if (sheetNames.length > 0) loadDashboard(allSheetsData[sheetNames[0]]);

    // চেঞ্জ ইভেন্ট
    selector.addEventListener('change', (e) => {
        loadDashboard(allSheetsData[e.target.value]);
    });
});

function loadDashboard(data) {
    updateTable(data);
    updateCards(data);
    renderCharts(data);
    feather.replace();
}

// ১. টেবিল (হুবহু স্ক্রিনশটের মতো)
function updateTable(data) {
    const tableBody = document.getElementById('transactionTable');
    tableBody.innerHTML = ''; 

    data.forEach(item => {
        const row = `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.date}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.description}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-bold">
                    ${item.amount.toLocaleString()} ${item.currency}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.person || '-'}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

function updateCards(data) {
    const cards = document.querySelectorAll('custom-summary-card');
    
    // ১. Total USD Received
    const totalReceived = data
        .filter(item => item.description.toLowerCase().includes('received'))
        .reduce((sum, item) => sum + item.amount, 0);

    // ২. Total Conversion Calculation
    // USD Converted (Source Amount)
    const totalUSDConverted = data
        .filter(item => item.description.toLowerCase().includes('conversion'))
        .reduce((sum, item) => sum + item.amount, 0);

    // BDT Converted (Target Amount)
    const totalBDTConverted = data
        .filter(item => item.description.toLowerCase().includes('conversion'))
        .reduce((sum, item) => sum + item.bdtAmount, 0);

    // ৩. Total Sent Calculation
    // USD Sent
    const totalUSDSent = data
        .filter(item => item.description.toLowerCase().includes('sent') && item.currency === 'USD')
        .reduce((sum, item) => sum + item.amount, 0);

    // BDT Sent
    const totalBDTSent = data
        .filter(item => item.description.toLowerCase().includes('sent') && item.currency === 'BDT')
        .reduce((sum, item) => sum + item.amount, 0);

    // ৪. FINAL BALANCE CALCULATION
    // USD Balance = Received - Converted - Sent(USD)
    
    const remainingUSD = totalReceived - totalUSDConverted - totalUSDSent;

    // BDT Balance = Converted(BDT) - Sent(BDT)
    const remainingBDT = totalBDTConverted - totalBDTSent;

    // কার্ডে ভ্যালু বসানো
    
    if(cards.length >= 3) {
        // Card 1: Total Received
        cards[0].setAttribute('value', `$${totalReceived.toLocaleString(undefined, {minimumFractionDigits: 2})}`);
        
        // Card 2: Total BDT Conversion
        cards[1].setAttribute('value', `${totalBDTConverted.toLocaleString(undefined, {minimumFractionDigits: 2})}৳`);
        
        const usdText = `<div class="text-base">USD: $${remainingUSD.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>`;
        const bdtText = `<div class="text-base mt-1">BDT: ${remainingBDT.toLocaleString(undefined, {minimumFractionDigits: 2})}৳</div>`;
        
        cards[2].setAttribute('value', usdText + bdtText);
    }
}


// ৩. চার্টস (স্ক্রিনশটের স্টাইল)
function renderCharts(data) {
    // --- Chart 1: USD to BDT Conversions (Bar Chart) ---
    const ctxConversion = document.getElementById('conversionChart');
    if (conversionChartInstance) conversionChartInstance.destroy();

    const conversionData = data.filter(item => item.description.toLowerCase().includes('conversion'));

    conversionChartInstance = new Chart(ctxConversion, {
        type: 'bar',
        data: {
            labels: conversionData.map(item => item.date),
            datasets: [{
                label: 'USD Converted', // চার্টের বারের নাম
                data: conversionData.map(item => item.amount), // এখানে USD প্লট করা হচ্ছে
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        // ১. প্রথম লাইন (USD) সুন্দর করে ফরম্যাট করা
                        label: function(context) {
                            let value = context.parsed.y;
                            return ` USD: $${value.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
                        },
                        // ২. দ্বিতীয় লাইন (BDT) - যা আপনি চেয়েছেন
                        afterLabel: function(context) {
                            // ইনডেক্স দিয়ে মূল ডাটা থেকে BDT বের করা
                            const item = conversionData[context.dataIndex];
                            const bdt = item.bdtAmount.toLocaleString(undefined, {minimumFractionDigits: 2});
                            const rate = item.rate || 0;
                            return ` BDT Received: ${bdt}৳ (Rate: ${rate})`;
                        }
                    }
                }
            }
        }
    });

    // --- Chart 2: Person Wise Sent (Doughnut) ---
    const ctxPerson = document.getElementById('personChart');
    if (personChartInstance) personChartInstance.destroy();

    const persons = {};
    data.forEach(item => {
        if (item.description.toLowerCase().includes('sent') && item.person) {
            let val = item.amount;
            if(item.currency === 'USD') val = val * 125; 
            persons[item.person] = (persons[item.person] || 0) + val;
        }
    });

    personChartInstance = new Chart(ctxPerson, {
        type: 'doughnut',
        data: {
            labels: Object.keys(persons),
            datasets: [{
                data: Object.values(persons),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
            }]
        },
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let value = context.parsed;
                            return ` ${context.label}: ${value.toLocaleString()}৳ (Approx)`;
                        }
                    }
                }
            }
        }
    });

    // --- Chart 3: Daily Flow (Line Chart) ---
    const ctxFlow = document.getElementById('flowChart');
    if (flowChartInstance) flowChartInstance.destroy();

    flowChartInstance = new Chart(ctxFlow, {
        type: 'line',
        data: {
            labels: data.map(item => item.date),
            datasets: [{
                label: 'Transaction Amount',
                data: data.map(item => item.amount),
                borderColor: '#6366F1',
                tension: 0.3
            }]
        }
    });
}