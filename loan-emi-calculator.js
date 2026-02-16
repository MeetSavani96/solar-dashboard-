// ============================================
// LOAN / EMI BASED ROI CALCULATOR
// ============================================

console.log('💳 Loan/EMI Calculator Loading...');

/**
 * Loan/EMI Calculator Engine
 * Calculates ROI for both cash and loan purchase scenarios
 */
const loanEMICalculator = {
    // Loan configuration
    loanConfig: {
        loanAmount: 400000,      // ₹
        interestRate: 9.5,       // % per year
        tenureYears: 5,          // Years
        downPayment: 100000,     // ₹
        enabled: false           // Loan mode toggle
    },
    
    // Calculated EMI data
    emiData: {
        monthlyEMI: 0,
        totalInterest: 0,
        totalPayment: 0,
        effectiveCost: 0,
        loanPrincipal: 0
    },
    
    // Cash flow analysis
    cashFlowData: {
        months: [],
        cashPositiveMonth: 0,
        loanPaybackYear: 0
    },
    
    // Comparison data
    comparisonData: {
        cash: {},
        loan: {}
    },
    
    /**
     * Initialize loan calculator
     */
    init() {
        console.log('💳 Initializing Loan/EMI Calculator...');
        
        // Load loan config from localStorage if exists
        this.loadLoanConfig();
        
        // Calculate EMI
        this.calculateEMI();
        
        console.log('✅ Loan/EMI Calculator initialized');
    },
    
    /**
     * Load loan configuration from localStorage
     */
    loadLoanConfig() {
        try {
            const saved = localStorage.getItem('loanConfig');
            if (saved) {
                Object.assign(this.loanConfig, JSON.parse(saved));
                console.log('📂 Loan config loaded from storage');
            }
        } catch (error) {
            console.error('❌ Error loading loan config:', error);
        }
    },
    
    /**
     * Save loan configuration to localStorage
     */
    saveLoanConfig() {
        try {
            localStorage.setItem('loanConfig', JSON.stringify(this.loanConfig));
            console.log('💾 Loan config saved to storage');
        } catch (error) {
            console.error('❌ Error saving loan config:', error);
        }
    },
    
    /**
     * Update loan configuration
     */
    updateLoanConfig(newConfig) {
        console.log('🔄 Updating loan config...', newConfig);
        
        Object.assign(this.loanConfig, newConfig);
        this.saveLoanConfig();
        this.calculateEMI();
        
        // Trigger ROI recalculation
        if (window.roiForecastEngine) {
            window.roiForecastEngine.recalculate();
        }
        
        console.log('✅ Loan config updated');
    },
    
    /**
     * Calculate monthly EMI using standard formula
     */
    calculateEMI() {
        const { loanAmount, interestRate, tenureYears, downPayment } = this.loanConfig;
        
        // Loan principal (after down payment)
        const principal = loanAmount - downPayment;
        
        // Monthly interest rate
        const monthlyRate = interestRate / (12 * 100);
        
        // Total months
        const totalMonths = tenureYears * 12;
        
        // EMI Formula: [P × r × (1 + r)^n] / [(1 + r)^n − 1]
        let monthlyEMI = 0;
        
        if (monthlyRate > 0 && totalMonths > 0) {
            const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths);
            const denominator = Math.pow(1 + monthlyRate, totalMonths) - 1;
            monthlyEMI = numerator / denominator;
        } else {
            // If no interest or tenure, EMI is just principal divided by months
            monthlyEMI = totalMonths > 0 ? principal / totalMonths : 0;
        }
        
        // Total payment over loan tenure
        const totalPayment = monthlyEMI * totalMonths;
        
        // Total interest paid
        const totalInterest = totalPayment - principal;
        
        // Effective system cost (installation + interest)
        const installationCost = window.dashboardState?.profile?.installationCost || 500000;
        const effectiveCost = installationCost + totalInterest;
        
        // Store calculated values
        this.emiData = {
            monthlyEMI: Math.round(monthlyEMI),
            totalInterest: Math.round(totalInterest),
            totalPayment: Math.round(totalPayment),
            effectiveCost: Math.round(effectiveCost),
            loanPrincipal: principal
        };
        
        console.log('💰 EMI calculated:', this.emiData);
        
        return this.emiData;
    },
    
    /**
     * Calculate monthly cash flow analysis
     */
    calculateMonthlyCashFlow() {
        console.log('📊 Calculating monthly cash flow...');
        
        if (!window.roiForecastEngine) {
            console.warn('⚠️ ROI Forecast Engine not available');
            return;
        }
        
        const forecast = window.roiForecastEngine.forecastData;
        const { monthlyEMI } = this.emiData;
        const { tenureYears } = this.loanConfig;
        const loanMonths = tenureYears * 12;
        
        const months = [];
        let cumulativeCashFlow = 0;
        let cashPositiveMonth = 0;
        
        // Calculate for each month over 25 years
        for (let month = 1; month <= 300; month++) { // 25 years = 300 months
            const year = Math.ceil(month / 12);
            const yearData = forecast.years[year - 1];
            
            if (!yearData) continue;
            
            // Monthly solar savings (yearly savings / 12)
            const monthlySavings = yearData.savings / 12;
            
            // EMI outflow (only during loan tenure)
            const emiOutflow = month <= loanMonths ? monthlyEMI : 0;
            
            // Net monthly benefit
            const netBenefit = monthlySavings - emiOutflow;
            
            // Cumulative cash flow
            cumulativeCashFlow += netBenefit;
            
            // Track when cash flow becomes positive
            if (cashPositiveMonth === 0 && cumulativeCashFlow >= 0) {
                cashPositiveMonth = month;
            }
            
            months.push({
                month: month,
                year: year,
                monthlySavings: Math.round(monthlySavings),
                emiOutflow: Math.round(emiOutflow),
                netBenefit: Math.round(netBenefit),
                cumulativeCashFlow: Math.round(cumulativeCashFlow),
                isEMIPeriod: month <= loanMonths
            });
        }
        
        // Calculate loan-adjusted payback year
        const { downPayment } = this.loanConfig;
        let loanPaybackYear = 0;
        
        for (let i = 0; i < months.length; i++) {
            if (months[i].cumulativeCashFlow >= downPayment) {
                loanPaybackYear = Math.ceil(months[i].month / 12);
                break;
            }
        }
        
        this.cashFlowData = {
            months: months,
            cashPositiveMonth: cashPositiveMonth,
            loanPaybackYear: loanPaybackYear
        };
        
        console.log(`✅ Cash flow calculated: Cash positive at month ${cashPositiveMonth}`);
        
        return this.cashFlowData;
    },
    
    /**
     * Calculate comparison between cash and loan purchase
     */
    calculateComparison() {
        console.log('🔄 Calculating cash vs loan comparison...');
        
        if (!window.roiForecastEngine) {
            console.warn('⚠️ ROI Forecast Engine not available');
            return;
        }
        
        const cashForecast = window.roiForecastEngine.getSummary();
        const { monthlyEMI, totalInterest, effectiveCost } = this.emiData;
        const { downPayment, tenureYears } = this.loanConfig;
        
        // Calculate loan-based ROI
        const loanSavings25 = cashForecast.savings25Years;
        const loanNetProfit25 = loanSavings25 - effectiveCost;
        const loanROI25 = Math.round(((loanSavings25 - effectiveCost) / effectiveCost) * 100);
        
        // Calculate monthly savings during EMI period
        const avgMonthlySavings = cashForecast.savings10Years / (10 * 12);
        const netMonthlySavings = avgMonthlySavings - monthlyEMI;
        
        this.comparisonData = {
            cash: {
                installationCost: cashForecast.installationCost,
                downPayment: 0,
                monthlyEMI: 0,
                totalInterest: 0,
                effectiveCost: cashForecast.installationCost,
                paybackYears: cashForecast.paybackYears,
                savings25Years: cashForecast.savings25Years,
                netProfit25: cashForecast.savings25Years - cashForecast.installationCost,
                roi25: cashForecast.roi25Years
            },
            loan: {
                installationCost: cashForecast.installationCost,
                downPayment: downPayment,
                monthlyEMI: monthlyEMI,
                totalInterest: totalInterest,
                effectiveCost: effectiveCost,
                paybackYears: this.cashFlowData.loanPaybackYear || 0,
                savings25Years: loanSavings25,
                netProfit25: loanNetProfit25,
                roi25: loanROI25,
                loanTenure: tenureYears,
                netMonthlySavings: Math.round(netMonthlySavings),
                cashPositiveMonth: this.cashFlowData.cashPositiveMonth
            }
        };
        
        console.log('✅ Comparison calculated');
        
        return this.comparisonData;
    },
    
    /**
     * Generate loan-based insights
     */
    generateLoanInsights() {
        const comparison = this.comparisonData;
        const { monthlyEMI, totalInterest } = this.emiData;
        const { tenureYears } = this.loanConfig;
        const insights = [];
        
        // Insight 1: Monthly savings during EMI
        if (comparison.loan.netMonthlySavings > 0) {
            insights.push({
                type: 'positive',
                icon: '💰',
                title: 'Positive Monthly Cash Flow',
                message: `Even with EMI, you save ₹${comparison.loan.netMonthlySavings.toLocaleString('en-IN')} per month`,
                detail: `Solar savings exceed EMI payments from day one`
            });
        } else {
            const deficit = Math.abs(comparison.loan.netMonthlySavings);
            insights.push({
                type: 'warning',
                icon: '⚠️',
                title: 'EMI Exceeds Monthly Savings',
                message: `Monthly deficit of ₹${deficit.toLocaleString('en-IN')} during EMI period`,
                detail: `Consider lower loan amount or longer tenure`
            });
        }
        
        // Insight 2: Cash positive timeline
        const cashPositiveYears = Math.floor(comparison.loan.cashPositiveMonth / 12);
        const cashPositiveMonths = comparison.loan.cashPositiveMonth % 12;
        insights.push({
            type: 'info',
            icon: '📈',
            title: 'Cash Positive Timeline',
            message: `Cumulative cash flow turns positive in ${cashPositiveYears} years ${cashPositiveMonths} months`,
            detail: `After this point, you're in net profit territory`
        });
        
        // Insight 3: Interest impact
        const interestPercent = Math.round((totalInterest / comparison.cash.installationCost) * 100);
        insights.push({
            type: 'info',
            icon: '💳',
            title: 'Interest Cost Impact',
            message: `Total interest: ₹${(totalInterest / 100000).toFixed(1)}L (${interestPercent}% of system cost)`,
            detail: `Loan increases payback period by ${comparison.loan.paybackYears - comparison.cash.paybackYears} years`
        });
        
        // Insight 4: ROI comparison
        const roiDifference = comparison.cash.roi25 - comparison.loan.roi25;
        insights.push({
            type: 'info',
            icon: '📊',
            title: 'ROI Comparison',
            message: `Loan ROI: ${comparison.loan.roi25}% vs Cash ROI: ${comparison.cash.roi25}%`,
            detail: `Interest reduces ROI by ${roiDifference} percentage points`
        });
        
        // Insight 5: Post-EMI benefits
        insights.push({
            type: 'positive',
            icon: '🎯',
            title: 'Post-EMI Benefits',
            message: `After ${tenureYears} years, full solar savings with no EMI`,
            detail: `Remaining ${25 - tenureYears} years generate pure profit`
        });
        
        // Insight 6: Tariff growth advantage
        insights.push({
            type: 'positive',
            icon: '⚡',
            title: 'Tariff Growth Advantage',
            message: `Rising electricity costs offset EMI burden over time`,
            detail: `Higher future tariffs improve loan scenario viability`
        });
        
        return insights;
    },
    
    /**
     * Get chart data for cash vs loan comparison
     */
    getComparisonChartData() {
        if (!window.roiForecastEngine) return null;
        
        const cashForecast = window.roiForecastEngine.forecastData;
        const loanCashFlow = this.cashFlowData;
        const { downPayment } = this.loanConfig;
        
        // Prepare data for 25 years
        const labels = [];
        const cashCumulative = [];
        const loanCumulative = [];
        
        for (let year = 1; year <= 25; year++) {
            labels.push(`Year ${year}`);
            
            // Cash purchase cumulative (savings - initial cost)
            const cashYearData = cashForecast.years[year - 1];
            if (cashYearData) {
                cashCumulative.push(cashYearData.cumulativeSavings - cashForecast.installationCost);
            }
            
            // Loan purchase cumulative (cash flow - down payment)
            const monthIndex = year * 12 - 1;
            if (loanCashFlow.months[monthIndex]) {
                loanCumulative.push(loanCashFlow.months[monthIndex].cumulativeCashFlow - downPayment);
            }
        }
        
        return {
            labels: labels,
            cashCumulative: cashCumulative,
            loanCumulative: loanCumulative,
            loanTenureYears: this.loanConfig.tenureYears
        };
    },
    
    /**
     * Recalculate everything
     */
    recalculate() {
        console.log('🔄 Recalculating loan/EMI data...');
        
        this.calculateEMI();
        this.calculateMonthlyCashFlow();
        this.calculateComparison();
        
        // Update UI if render function exists
        if (window.renderLoanComparison) {
            window.renderLoanComparison();
        }
        
        console.log('✅ Loan/EMI recalculation complete');
    }
};

/**
 * Render loan comparison section
 */
function renderLoanComparison() {
    console.log('💳 Rendering loan comparison...');
    
    // Calculate latest data
    loanEMICalculator.calculateMonthlyCashFlow();
    loanEMICalculator.calculateComparison();
    
    // Render comparison table
    renderComparisonTable();
    
    // Render comparison chart
    renderComparisonChart();
    
    // Render loan insights
    renderLoanInsights();
    
    // Render EMI details
    renderEMIDetails();
    
    console.log('✅ Loan comparison rendered');
}

/**
 * Render comparison table
 */
function renderComparisonTable() {
    const container = document.getElementById('loanComparisonTable');
    if (!container) return;
    
    const comparison = loanEMICalculator.comparisonData;
    
    let html = '<div class="comparison-table-wrapper">';
    html += '<table class="comparison-table">';
    html += '<thead><tr>';
    html += '<th>Metric</th>';
    html += '<th class="cash-column">💵 Cash Purchase</th>';
    html += '<th class="loan-column">💳 Loan Purchase</th>';
    html += '</tr></thead>';
    html += '<tbody>';
    
    // Installation Cost
    html += '<tr>';
    html += '<td class="metric-label">Installation Cost</td>';
    html += `<td class="cash-column">₹${(comparison.cash.installationCost / 100000).toFixed(1)}L</td>`;
    html += `<td class="loan-column">₹${(comparison.loan.installationCost / 100000).toFixed(1)}L</td>`;
    html += '</tr>';
    
    // Down Payment
    html += '<tr>';
    html += '<td class="metric-label">Down Payment</td>';
    html += `<td class="cash-column">₹${(comparison.cash.installationCost / 100000).toFixed(1)}L (100%)</td>`;
    html += `<td class="loan-column">₹${(comparison.loan.downPayment / 100000).toFixed(1)}L</td>`;
    html += '</tr>';
    
    // Monthly EMI
    html += '<tr>';
    html += '<td class="metric-label">Monthly EMI</td>';
    html += `<td class="cash-column">–</td>`;
    html += `<td class="loan-column">₹${comparison.loan.monthlyEMI.toLocaleString('en-IN')} × ${comparison.loan.loanTenure} years</td>`;
    html += '</tr>';
    
    // Total Interest
    html += '<tr>';
    html += '<td class="metric-label">Total Interest Paid</td>';
    html += `<td class="cash-column">₹0</td>`;
    html += `<td class="loan-column">₹${(comparison.loan.totalInterest / 100000).toFixed(1)}L</td>`;
    html += '</tr>';
    
    // Effective Cost
    html += '<tr class="highlight-row">';
    html += '<td class="metric-label">Effective System Cost</td>';
    html += `<td class="cash-column">₹${(comparison.cash.effectiveCost / 100000).toFixed(1)}L</td>`;
    html += `<td class="loan-column">₹${(comparison.loan.effectiveCost / 100000).toFixed(1)}L</td>`;
    html += '</tr>';
    
    // Payback Period
    html += '<tr>';
    html += '<td class="metric-label">Payback Period</td>';
    html += `<td class="cash-column">${comparison.cash.paybackYears} years</td>`;
    html += `<td class="loan-column">${comparison.loan.paybackYears} years</td>`;
    html += '</tr>';
    
    // 25-Year Savings
    html += '<tr>';
    html += '<td class="metric-label">Total Savings (25 years)</td>';
    html += `<td class="cash-column">₹${(comparison.cash.savings25Years / 100000).toFixed(1)}L</td>`;
    html += `<td class="loan-column">₹${(comparison.loan.savings25Years / 100000).toFixed(1)}L</td>`;
    html += '</tr>';
    
    // Net Profit
    html += '<tr class="highlight-row">';
    html += '<td class="metric-label">Net Profit (25 years)</td>';
    html += `<td class="cash-column">₹${(comparison.cash.netProfit25 / 100000).toFixed(1)}L</td>`;
    html += `<td class="loan-column">₹${(comparison.loan.netProfit25 / 100000).toFixed(1)}L</td>`;
    html += '</tr>';
    
    // ROI
    html += '<tr class="highlight-row">';
    html += '<td class="metric-label">ROI (25 years)</td>';
    html += `<td class="cash-column">${comparison.cash.roi25}%</td>`;
    html += `<td class="loan-column">${comparison.loan.roi25}%</td>`;
    html += '</tr>';
    
    html += '</tbody></table>';
    html += '</div>';
    
    container.innerHTML = html;
}

/**
 * Render comparison chart
 */
let comparisonChartInstance = null;

function renderComparisonChart() {
    const canvas = document.getElementById('loanComparisonChart');
    if (!canvas) return;
    
    if (typeof Chart === 'undefined') {
        console.error('❌ Chart.js is not loaded');
        return;
    }
    
    const chartData = loanEMICalculator.getComparisonChartData();
    if (!chartData) return;
    
    // Destroy existing chart
    if (comparisonChartInstance) {
        comparisonChartInstance.destroy();
    }
    
    // Create new chart
    const ctx = canvas.getContext('2d');
    comparisonChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [
                {
                    label: 'Cash Purchase (Net Profit)',
                    data: chartData.cashCumulative,
                    borderColor: '#00d9a3',
                    backgroundColor: 'rgba(0, 217, 163, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 6
                },
                {
                    label: 'Loan Purchase (Net Cash Flow)',
                    data: chartData.loanCumulative,
                    borderColor: '#2196f3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2.5,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: { size: 12, weight: '500' },
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            const label = context.dataset.label;
                            return `${label}: ₹${(value / 100000).toFixed(1)}L`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.5)',
                        font: { size: 10 },
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.5)',
                        font: { size: 11 },
                        callback: function(value) {
                            return '₹' + (value / 100000).toFixed(0) + 'L';
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });
    
    console.log('📊 Comparison chart created');
}

/**
 * Render loan insights
 */
function renderLoanInsights() {
    const container = document.getElementById('loanInsights');
    if (!container) return;
    
    const insights = loanEMICalculator.generateLoanInsights();
    
    let html = '<div class="loan-insights-grid">';
    
    insights.forEach(insight => {
        html += `
            <div class="loan-insight-card insight-${insight.type}">
                <div class="insight-header">
                    <span class="insight-icon">${insight.icon}</span>
                    <h4 class="insight-title">${insight.title}</h4>
                </div>
                <p class="insight-message">${insight.message}</p>
                <p class="insight-detail">${insight.detail}</p>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

/**
 * Render EMI details
 */
function renderEMIDetails() {
    const emiData = loanEMICalculator.emiData;
    const loanConfig = loanEMICalculator.loanConfig;
    
    // Monthly EMI
    const monthlyEMIEl = document.getElementById('monthlyEMI');
    if (monthlyEMIEl) {
        monthlyEMIEl.textContent = `₹${emiData.monthlyEMI.toLocaleString('en-IN')}`;
    }
    
    // Total Interest
    const totalInterestEl = document.getElementById('totalInterest');
    if (totalInterestEl) {
        totalInterestEl.textContent = `₹${(emiData.totalInterest / 100000).toFixed(1)}L`;
    }
    
    // Loan Tenure
    const loanTenureEl = document.getElementById('loanTenure');
    if (loanTenureEl) {
        loanTenureEl.textContent = `${loanConfig.tenureYears} Years`;
    }
    
    // Effective Cost
    const effectiveCostEl = document.getElementById('effectiveCost');
    if (effectiveCostEl) {
        effectiveCostEl.textContent = `₹${(emiData.effectiveCost / 100000).toFixed(1)}L`;
    }
}

/**
 * Initialize loan calculator when dashboard state is ready
 */
function initLoanCalculator() {
    console.log('💳 Checking if Loan Calculator can start...');
    
    if (window.dashboardState && window.roiForecastEngine) {
        loanEMICalculator.init();
    } else {
        console.log('⏳ Waiting for dependencies...');
        setTimeout(initLoanCalculator, 1000);
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initLoanCalculator, 3000);
    });
} else {
    setTimeout(initLoanCalculator, 3000);
}

// Export for global use
window.loanEMICalculator = loanEMICalculator;
window.renderLoanComparison = renderLoanComparison;
window.initLoanCalculator = initLoanCalculator;

console.log('✅ Loan/EMI Calculator Module Loaded');
