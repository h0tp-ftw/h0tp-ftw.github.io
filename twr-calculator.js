// ============================================
// TWR CALCULATOR LOGIC
// ============================================

let cashFlows = [];
let flowCounter = 0;

// DOM Elements
const startDateInput = document.getElementById('start-date');
const startBalanceInput = document.getElementById('start-balance');
const cashFlowsContainer = document.getElementById('cash-flows-container');
const addFlowBtn = document.getElementById('add-flow-btn');
const calculateBtn = document.getElementById('calculate-btn');
const resetBtn = document.getElementById('reset-btn');
const exportBtn = document.getElementById('export-btn');

const resultsContainer = document.getElementById('results-container');
const resultsPlaceholder = document.getElementById('results-placeholder');

// Set default date to today
startDateInput.valueAsDate = new Date();

// Add Cash Flow
addFlowBtn.addEventListener('click', () => {
    addCashFlow();
});

function addCashFlow(date = '', amount = '', balance = '') {
    const flowId = flowCounter++;

    const flowDiv = document.createElement('div');
    flowDiv.className = 'cash-flow-item';
    flowDiv.dataset.flowId = flowId;

    flowDiv.innerHTML = `
        <div class="flow-inputs">
            <input type="date" class="calc-input flow-date" placeholder="Date" value="${date}">
            <input type="number" class="calc-input flow-amount" placeholder="Amount (+/-)" step="0.01" value="${amount}">
            <input type="number" class="calc-input flow-balance" placeholder="Balance After" step="0.01" value="${balance}">
            <button class="remove-flow-btn" onclick="removeCashFlow(${flowId})">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>
    `;

    cashFlowsContainer.appendChild(flowDiv);
}

function removeCashFlow(flowId) {
    const flowDiv = document.querySelector(`[data-flow-id="${flowId}"]`);
    if (flowDiv) {
        flowDiv.remove();
    }
}

// Calculate TWR
calculateBtn.addEventListener('click', () => {
    try {
        const startBalance = parseFloat(startBalanceInput.value);
        const startDate = new Date(startDateInput.value);

        if (!startBalance || isNaN(startBalance) || startBalance <= 0) {
            alert('Please enter a valid starting balance');
            return;
        }

        // Gather cash flows
        cashFlows = [];
        const flowElements = document.querySelectorAll('.cash-flow-item');

        flowElements.forEach(element => {
            const date = element.querySelector('.flow-date').value;
            const amount = parseFloat(element.querySelector('.flow-amount').value);
            const balanceAfter = parseFloat(element.querySelector('.flow-balance').value);

            if (date && !isNaN(amount) && !isNaN(balanceAfter)) {
                cashFlows.push({
                    date: new Date(date),
                    amount: amount,
                    balanceAfter: balanceAfter
                });
            }
        });

        // Sort by date
        cashFlows.sort((a, b) => a.date - b.date);

        // Calculate returns
        const results = calculateTWR(startBalance, cashFlows);

        // Display results
        displayResults(results, startBalance);

    } catch (error) {
        console.error('Calculation error:', error);
        alert('Error calculating returns. Please check your inputs.');
    }
});

function calculateTWR(startBalance, flows) {
    let periods = [];
    let currentBalance = startBalance;
    let currentDate = new Date(startDateInput.value);

    // Create periods between cash flows
    flows.forEach((flow, index) => {
        const periodReturn = (flow.balanceAfter - flow.amount - currentBalance) / currentBalance;

        periods.push({
            startDate: currentDate,
            endDate: flow.date,
            startBalance: currentBalance,
            endBalance: flow.balanceAfter,
            cashFlow: flow.amount,
            return: periodReturn
        });

        currentBalance = flow.balanceAfter;
        currentDate = flow.date;
    });

    // Calculate TWR
    let twrProduct = 1;
    periods.forEach(period => {
        twrProduct *= (1 + period.return);
    });

    const twr = (twrProduct - 1) * 100;

    // Calculate simple return
    const endBalance = flows.length > 0 ? flows[flows.length - 1].balanceAfter : startBalance;
    const totalCashFlows = flows.reduce((sum, f) => sum + f.amount, 0);
    const simpleReturn = ((endBalance - startBalance - totalCashFlows) / startBalance) * 100;

    const totalGain = endBalance - startBalance - totalCashFlows;

    return {
        twr: twr,
        simpleReturn: simpleReturn,
        totalGain: totalGain,
        endBalance: endBalance,
        periods: periods
    };
}

function displayResults(results, startBalance) {
    // Show results container
    resultsContainer.classList.remove('results-hidden');
    resultsPlaceholder.style.display = 'none';

    // Update values
    document.getElementById('twr-result').textContent = results.twr.toFixed(2) + '%';
    document.getElementById('twr-result').style.color = results.twr >= 0 ? '#a6d189' : '#e78284';

    document.getElementById('simple-return').textContent = results.simpleReturn.toFixed(2) + '%';
    document.getElementById('end-balance').textContent = '$' + results.endBalance.toFixed(2);
    document.getElementById('total-gain').textContent = '$' + results.totalGain.toFixed(2);
    document.getElementById('total-gain').style.color = results.totalGain >= 0 ? '#a6d189' : '#e78284';

    // Create chart
    createTWRChart(startBalance, cashFlows, results.endBalance);
}

function createTWRChart(startBalance, flows, endBalance) {
    const canvas = document.getElementById('twr-chart');
    const ctx = canvas.getContext('2d');

    // Destroy existing chart
    if (window.twrChart) {
        window.twrChart.destroy();
    }

    // Prepare data
    const labels = ['Start'];
    const data = [startBalance];

    flows.forEach((flow, index) => {
        labels.push(`Flow ${index + 1}`);
        data.push(flow.balanceAfter);
    });

    // Create chart
    window.twrChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Portfolio Value ($)',
                data: data,
                borderColor: '#ca9ee6',
                backgroundColor: 'rgba(202, 158, 230, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: '#ca9ee6',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#303446',
                    titleColor: '#c6d0f5',
                    bodyColor: '#c6d0f5',
                    borderColor: '#ca9ee6',
                    borderWidth: 2,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return 'Balance: $' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        color: '#a5adce',
                        callback: function(value) {
                            return '$' + value.toFixed(0);
                        }
                    },
                    grid: {
                        color: '#414559'
                    }
                },
                x: {
                    ticks: {
                        color: '#a5adce'
                    },
                    grid: {
                        color: '#414559'
                    }
                }
            }
        }
    });
}

// Reset
resetBtn.addEventListener('click', () => {
    startBalanceInput.value = '';
    cashFlowsContainer.innerHTML = '';
    resultsContainer.classList.add('results-hidden');
    resultsPlaceholder.style.display = 'flex';
    flowCounter = 0;
    cashFlows = [];

    if (window.twrChart) {
        window.twrChart.destroy();
    }
});

// Export to CSV
exportBtn.addEventListener('click', () => {
    let csv = 'Date,Amount,Balance After\n';
    csv += `${startDateInput.value},Start,${startBalanceInput.value}\n`;

    cashFlows.forEach(flow => {
        const dateStr = flow.date.toISOString().split('T')[0];
        csv += `${dateStr},${flow.amount},${flow.balanceAfter}\n`;
    });

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'twr-calculation.csv';
    a.click();
    window.URL.revokeObjectURL(url);
});

// Add one default cash flow on load
addCashFlow();
