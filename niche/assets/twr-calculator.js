document.addEventListener('DOMContentLoaded', () => {
    const startDateInput = document.getElementById('start-date');
    const startBalanceInput = document.getElementById('start-balance');
    const cashFlowsContainer = document.getElementById('cash-flows-container');
    const addFlowBtn = document.getElementById('add-flow-btn');
    const calculateBtn = document.getElementById('calculate-btn');
    const resetBtn = document.getElementById('reset-btn');
    const twrChartCanvas = document.getElementById('twr-chart');
    const resultsContainer = document.getElementById('results-container');
    const resultsPlaceholder = document.getElementById('results-placeholder');

    let twrChart; // To hold the Chart.js instance

    // Helper to format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    };

    // Helper to format percentage
    const formatPercentage = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    // TWR Calculation Logic (Enhanced)
    function calculateTWR(initialBalance, cashFlows) {
        cashFlows.sort((a, b) => new Date(a.date) - new Date(b.date));

        let currentBalance = initialBalance;
        let lastDate = new Date(startDateInput.value);
        let totalReturnProduct = 1;
        let chartDataPoints = [{ x: lastDate, y: initialBalance }];
        let simpleReturnNumerator = 0;

        for (const flow of cashFlows) {
            const flowDate = new Date(flow.date);
            const flowAmount = parseFloat(flow.amount);

            // Calculate return for the period up to this cash flow
            // This is a simplified TWR calculation. A truly accurate TWR requires market values
            // at each cash flow date. For this simulation, we assume the balance just before
            // the cash flow is the 'market value' for the period calculation.
            if (flowDate > lastDate) {
                const periodReturn = (currentBalance - chartDataPoints[chartDataPoints.length - 1].y) / chartDataPoints[chartDataPoints.length - 1].y;
                totalReturnProduct *= (1 + periodReturn);
            }

            // Apply the cash flow
            currentBalance += flowAmount;
            chartDataPoints.push({ x: flowDate, y: currentBalance });
            lastDate = flowDate;

            // For simple return calculation
            simpleReturnNumerator += flowAmount;
        }

        // Final period calculation
        if (cashFlows.length > 0 && currentBalance !== chartDataPoints[chartDataPoints.length - 1].y) {
            const periodReturn = (currentBalance - chartDataPoints[chartDataPoints.length - 1].y) / chartDataPoints[chartDataPoints.length - 1].y;
            totalReturnProduct *= (1 + periodReturn);
        } else if (cashFlows.length === 0 && initialBalance !== 0) {
            totalReturnProduct = 1;
        }

        const twr = totalReturnProduct - 1;
        const simpleReturn = (currentBalance - initialBalance - simpleReturnNumerator) / initialBalance;
        const totalGainLoss = currentBalance - initialBalance - simpleReturnNumerator;

        return { twr, simpleReturn, totalGainLoss, endBalance: currentBalance, chartDataPoints };
    }

    // Chart Rendering with Enhancements
    function renderChart(dataPoints) {
        if (twrChart) {
            twrChart.destroy();
        }

        const ctx = twrChartCanvas.getContext('2d');
        const labels = dataPoints.map(dp => dp.x);
        const values = dataPoints.map(dp => dp.y);

        // Determine colors for profit/loss
        const pointBackgroundColors = values.map((value, index) => {
            if (index === 0) return 'var(--niche-text)'; // Starting point
            return value >= values[index - 1] ? '#a6e3a1' : '#f38ba8'; // Green for profit, Red for loss
        });

        twrChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Portfolio Value',
                    data: values,
                    borderColor: 'var(--niche-accent)',
                    backgroundColor: (context) => {
                        const chart = context.chart;
                        const { ctx, chartArea } = chart;
                        if (!chartArea) {
                            return null;
                        }
                        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                        gradient.addColorStop(0, 'rgba(137, 180, 250, 0)');
                        gradient.addColorStop(1, 'rgba(137, 180, 250, 0.3)');
                        return gradient;
                    },
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: pointBackgroundColors,
                    pointBorderColor: 'var(--niche-bg)',
                    pointBorderWidth: 2,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'var(--niche-surface)',
                        titleColor: 'var(--niche-accent)',
                        bodyColor: 'var(--niche-text)',
                        borderColor: 'var(--niche-card)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        padding: 12,
                        callbacks: {
                            title: function(context) {
                                return new Date(context[0].label).toLocaleDateString();
                            },
                            label: function(context) {
                                return 'Value: ' + formatCurrency(context.raw);
                            },
                            afterLabel: function(context) {
                                const index = context.dataIndex;
                                if (index > 0) {
                                    const previousValue = values[index - 1];
                                    const currentValue = values[index];
                                    const change = currentValue - previousValue;
                                    const percentageChange = (change / previousValue) * 100;
                                    const sign = change >= 0 ? '+' : '';
                                    const color = change >= 0 ? '#a6e3a1' : '#f38ba8';
                                    return `Change: ${sign}${formatCurrency(change)} (${sign}${percentageChange.toFixed(2)}%)`;
                                }
                                return '';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            tooltipFormat: 'MMM D, YYYY',
                            displayFormats: {
                                day: 'MMM D'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Date',
                            color: 'var(--niche-subtext)',
                            font: { size: 14, weight: 'bold' }
                        },
                        ticks: {
                            color: 'var(--niche-subtext)',
                            font: { size: 12 }
                        },
                        grid: {
                            color: 'var(--niche-card)',
                            drawBorder: false,
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Value ($)',
                            color: 'var(--niche-subtext)',
                            font: { size: 14, weight: 'bold' }
                        },
                        ticks: {
                            color: 'var(--niche-subtext)',
                            font: { size: 12 },
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        },
                        grid: {
                            color: 'var(--niche-card)',
                            drawBorder: false,
                        }
                    }
                }
            }
        });
    }

    // Event Listeners
    calculateBtn.addEventListener('click', () => {
        const initialBalance = parseFloat(startBalanceInput.value);
        const cashFlows = getCashFlows();
        
        if (isNaN(initialBalance) || !startDateInput.value) {
            alert('Please enter a valid start date and starting balance.');
            return;
        }

        const { twr, simpleReturn, totalGainLoss, endBalance, chartDataPoints } = calculateTWR(initialBalance, cashFlows);
        
        document.getElementById('twr-result').textContent = formatPercentage(twr);
        document.getElementById('simple-return').textContent = formatPercentage(simpleReturn);
        document.getElementById('total-gain').textContent = formatCurrency(totalGainLoss);
        document.getElementById('end-balance').textContent = formatCurrency(endBalance);

        resultsContainer.classList.remove('results-hidden');
        resultsPlaceholder.style.display = 'none';
        renderChart(chartDataPoints);
    });

    resetBtn.addEventListener('click', () => {
        startDateInput.value = '';
        startBalanceInput.value = '';
        cashFlowsContainer.innerHTML = '';
        resultsContainer.classList.add('results-hidden');
        resultsPlaceholder.style.display = 'block';
        if (twrChart) {
            twrChart.destroy();
        }
    });

    // Initial cash flow input (will be moved to dynamic handling)
    addFlowBtn.addEventListener('click', () => {
        const flowCount = cashFlowsContainer.children.length;
        const newFlowHtml = `
            <div class="form-group cash-flow-item">
                <input type="date" class="cash-flow-date" placeholder=" " />
                <label>Date</label>
                <input type="number" class="cash-flow-amount" placeholder=" " step="0.01" />
                <label>Amount ($)</label>
                <button class="remove-flow-btn">Remove</button>
            </div>
        `;
        cashFlowsContainer.insertAdjacentHTML('beforeend', newFlowHtml);
    });
