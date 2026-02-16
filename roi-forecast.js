// ============================================
// ROI & PAYBACK FORECAST ENGINE (UPGRADED)
// ============================================
// SINGLE SOURCE OF TRUTH: dashboardState
// ALL values auto-update on ANY input change
// ============================================

console.log('💰 ROI Forecast Engine Loading (Upgraded)...');

/**
 * ROI Forecast Configuration
 * Calculates multi-year return on investment and payback period
 */
const roiForecastEngine = {
    // Base assumptions
    config: {
        baseSunHoursPerDay: 5,
        daysPerYear: 365,
        defaultDegradationRate: 0.005,  // 0.5% per year
        defaultTariffIncrease: 0.04,    // 4% per year
        maintenanceBoost: {
            "Self Maintenance": 1.05,    // 5% boost
            "Service": 1.08,             // 8% boost
            "Premium Service": 1.10      // 10% boost
        },
        forecastYears: 25
    },
    
    // City solar factors (from weather engine)
    citySolarFactors: {
        "Surat": 1.0,
        "Mumbai": 0.9,
        "Delhi": 0.95,
        "Jaipur": 1.05,
        "Pune": 0.95,
        "Ahmedabad": 1.0,
        "Bangalore": 0.9,
        "Chennai": 1.0,
        "Hyderabad": 0.95,
        "Kolkata": 0.85
    },
    
    /**
     * ============================================
     * SINGLE SOURCE OF TRUTH: recalculateROIForecast()
     * ============================================
     * This is the ONLY function that calculates ROI
     * All other functions read from dashboardState.roiForecast
     * 
     * Triggered by:
     * - Profile changes (system size, tariff, cost, state, city)
     * - Subsidy changes (central, state, total)
     * - Loan changes (enabled, amount, EMI, tenure)
     */
    recalculateROIForecast() {
        console.log('🔄 ============================================');
        console.log('🔄 RECALCULATING ROI FORECAST (SINGLE SOURCE OF TRUTH)');
        console.log('🔄 ============================================');
        
        // Validate dashboard state exists
        if (!window.dashboardState) {
            console.error('❌ Dashboard state not available');
            return null;
        }
        
        const { profile, subsidy, loan } = window.dashboardState;
        
        // ============================================
        // STEP 1: DETERMINE NET INVESTMENT COST
        // ============================================
        let netInvestmentCost = profile.installationCost || 500000;
        
        // Apply subsidy if enabled
        if (subsidy && subsidy.enabled && subsidy.totalSubsidy > 0) {
            netInvestmentCost = subsidy.netCost || (netInvestmentCost - subsidy.totalSubsidy);
            console.log(`💰 Subsidy applied: ₹${subsidy.totalSubsidy.toLocaleString('en-IN')}`);
            console.log(`💰 Net cost after subsidy: ₹${netInvestmentCost.toLocaleString('en-IN')}`);
        }
        
        // ============================================
        // STEP 2: DETERMINE EFFECTIVE INVESTMENT
        // ============================================
        let effectiveInvestment = netInvestmentCost;
        let monthlyEMI = 0;
        let loanTenureMonths = 0;
        let totalInterest = 0;
        
        // If loan is enabled, effective investment = down payment
        // But we need to account for EMI payments
        if (loan && loan.enabled) {
            effectiveInvestment = loan.downPayment || 0;
            loanTenureMonths = (loan.tenureYears || 5) * 12;
            
            // Calculate EMI if loan calculator is available
            if (window.loanEMICalculator && window.loanEMICalculator.emiData) {
                monthlyEMI = window.loanEMICalculator.emiData.monthlyEMI || 0;
                totalInterest = window.loanEMICalculator.emiData.totalInterest || 0;
                console.log(`💳 Loan enabled: Down payment ₹${effectiveInvestment.toLocaleString('en-IN')}`);
                console.log(`💳 Monthly EMI: ₹${monthlyEMI.toLocaleString('en-IN')} for ${loanTenureMonths} months`);
            }
        }
        
        console.log(`📊 Effective Investment: ₹${effectiveInvestment.toLocaleString('en-IN')}`);
        
        // ============================================
        // STEP 3: CALCULATE BASE ANNUAL GENERATION
        // ============================================
        const systemSize = profile.systemSize || 10;
        const city = profile.city || profile.location?.split(',')[0]?.trim() || "Surat";
        const cityFactor = this.citySolarFactors[city] || 1.0;
        const sunHours = this.config.baseSunHoursPerDay;
        const days = this.config.daysPerYear;
        
        const baseAnnualGeneration = systemSize * sunHours * days * cityFactor;
        console.log(`⚡ Base annual generation: ${baseAnnualGeneration.toFixed(0)} kWh (${systemSize} kW × ${sunHours}h × ${days}d × ${cityFactor})`);
        
        // ============================================
        // STEP 4: CALCULATE YEAR-BY-YEAR FORECAST
        // ============================================
        const baseTariff = profile.tariff || 8;
        const degradationRate = this.config.defaultDegradationRate;
        const tariffIncrease = this.config.defaultTariffIncrease;
        const maintenanceMode = "Self Maintenance"; // Can be made dynamic later
        const maintenanceBoost = this.config.maintenanceBoost[maintenanceMode] || 1.0;
        
        const years = [];
        let cumulativeSavings = 0;
        let cumulativeEMIPaid = 0;
        let paybackYear = 0;
        let breakEvenMonth = 0;
        
        for (let year = 1; year <= this.config.forecastYears; year++) {
            // Calculate generation for this year (with degradation)
            const degradationFactor = Math.pow(1 - degradationRate, year - 1);
            const yearGeneration = baseAnnualGeneration * degradationFactor * maintenanceBoost;
            
            // Calculate tariff for this year (with increase)
            const yearTariff = baseTariff * Math.pow(1 + tariffIncrease, year - 1);
            
            // Calculate gross savings for this year
            const yearGrossSavings = yearGeneration * yearTariff;
            
            // Calculate EMI paid this year (if loan enabled)
            let yearEMIPaid = 0;
            if (loan && loan.enabled && year <= loan.tenureYears) {
                yearEMIPaid = monthlyEMI * 12;
                cumulativeEMIPaid += yearEMIPaid;
            }
            
            // Net savings = Gross savings - EMI paid
            const yearNetSavings = yearGrossSavings - yearEMIPaid;
            
            // Add to cumulative savings
            cumulativeSavings += yearNetSavings;
            
            // Check if payback achieved
            // For cash: cumulative savings >= net investment cost
            // For loan: cumulative savings >= down payment (EMI already deducted)
            if (paybackYear === 0 && cumulativeSavings >= effectiveInvestment) {
                paybackYear = year;
                
                // Calculate approximate month of payback
                const previousCumulative = cumulativeSavings - yearNetSavings;
                const remainingAmount = effectiveInvestment - previousCumulative;
                const monthlyNetSavings = yearNetSavings / 12;
                breakEvenMonth = monthlyNetSavings > 0 ? Math.ceil(remainingAmount / monthlyNetSavings) : 0;
                
                console.log(`🎯 Payback achieved in Year ${paybackYear}, Month ${breakEvenMonth}`);
            }
            
            // Store year data
            years.push({
                year: year,
                generation: Math.round(yearGeneration),
                tariff: parseFloat(yearTariff.toFixed(2)),
                grossSavings: Math.round(yearGrossSavings),
                emiPaid: Math.round(yearEMIPaid),
                netSavings: Math.round(yearNetSavings),
                cumulativeSavings: Math.round(cumulativeSavings),
                degradationFactor: parseFloat(degradationFactor.toFixed(4)),
                isPaybackYear: year === paybackYear
            });
        }
        
        // ============================================
        // STEP 5: CALCULATE SUMMARY STATISTICS
        // ============================================
        const totalSavings10 = years[9]?.cumulativeSavings || 0;
        const totalSavings15 = years[14]?.cumulativeSavings || 0;
        const totalSavings25 = years[24]?.cumulativeSavings || 0;
        
        // Net profit = Total savings - Effective investment
        const netProfit10 = totalSavings10 - effectiveInvestment;
        const netProfit25 = totalSavings25 - effectiveInvestment;
        
        // ROI % = (Net profit / Effective investment) × 100
        const roiPercent10 = effectiveInvestment > 0 ? 
            Math.round((netProfit10 / effectiveInvestment) * 100) : 0;
        const roiPercent25 = effectiveInvestment > 0 ? 
            Math.round((netProfit25 / effectiveInvestment) * 100) : 0;
        
        // ============================================
        // STEP 6: STORE IN DASHBOARD STATE
        // ============================================
        if (!window.dashboardState.roiForecast) {
            window.dashboardState.roiForecast = {};
        }
        
        window.dashboardState.roiForecast = {
            // Investment details
            installationCost: profile.installationCost || 500000,
            subsidyAmount: (subsidy && subsidy.enabled) ? subsidy.totalSubsidy : 0,
            netCost: netInvestmentCost,
            effectiveInvestment: effectiveInvestment,
            
            // Loan details
            loanEnabled: loan && loan.enabled,
            downPayment: loan && loan.enabled ? loan.downPayment : 0,
            monthlyEMI: monthlyEMI,
            loanTenureMonths: loanTenureMonths,
            totalInterest: totalInterest,
            
            // Generation details
            baseAnnualGeneration: Math.round(baseAnnualGeneration),
            systemSize: systemSize,
            city: city,
            cityFactor: cityFactor,
            
            // Tariff details
            baseTariff: baseTariff,
            tariffIncrease: tariffIncrease,
            
            // Year-by-year data
            years: years,
            
            // Payback details
            paybackYear: paybackYear,
            breakEvenMonth: breakEvenMonth,
            
            // Summary statistics
            totalSavings10: totalSavings10,
            totalSavings15: totalSavings15,
            totalSavings25: totalSavings25,
            netProfit10: netProfit10,
            netProfit25: netProfit25,
            roiPercent10: roiPercent10,
            roiPercent25: roiPercent25,
            
            // Metadata
            lastCalculated: new Date().toISOString()
        };
        
        console.log('✅ ROI Forecast calculated and stored in dashboardState.roiForecast');
        console.log(`📊 Payback: ${paybackYear} years, ${breakEvenMonth} months`);
        console.log(`📊 25-year savings: ₹${(totalSavings25 / 100000).toFixed(1)}L`);
        console.log(`📊 25-year net profit: ₹${(netProfit25 / 100000).toFixed(1)}L`);
        console.log(`📊 25-year ROI: ${roiPercent25}%`);
        
        // Save to localStorage
        if (window.saveStateToStorage) {
            window.saveStateToStorage();
        }
        
        return window.dashboardState.roiForecast;
    },
    
    /**
     * Get ROI forecast data (reads from dashboardState)
     */
    getForecastData() {
        if (!window.dashboardState || !window.dashboardState.roiForecast) {
            console.warn('⚠️ ROI forecast not calculated yet, calculating now...');
            return this.recalculateROIForecast();
        }
        return window.dashboardState.roiForecast;
    },
    
    /**
     * Generate ROI insights (reads from dashboardState)
     */
    generateInsights() {
        const data = this.getForecastData();
        if (!data) return [];
        
        const insights = [];
        
        // Insight 1: Investment context
        const investmentText = data.loanEnabled ? 
            `Down payment: ₹${(data.downPayment / 100000).toFixed(1)}L + EMI ₹${data.monthlyEMI.toLocaleString('en-IN')}/month` :
            `Solar installation cost: ₹${(data.netCost / 100000).toFixed(1)}L`;
        
        insights.push({
            type: 'info',
            icon: '💰',
            title: 'Initial Investment',
            message: investmentText,
            detail: data.subsidyAmount > 0 ? 
                `After ₹${(data.subsidyAmount / 100000).toFixed(1)}L subsidy` : 
                'This investment will be recovered through electricity savings'
        });
        
        // Insight 2: Payback period
        if (data.paybackYear > 0) {
            const monthText = data.breakEvenMonth > 0 ? ` and ${data.breakEvenMonth} months` : '';
            insights.push({
                type: 'positive',
                icon: '🎯',
                title: 'Payback Period',
                message: `Your solar system will recover its cost in ${data.paybackYear} years${monthText}`,
                detail: `After this point, all savings become pure profit`
            });
        } else {
            insights.push({
                type: 'warning',
                icon: '⏳',
                title: 'Extended Payback',
                message: `Payback period exceeds ${this.config.forecastYears} years`,
                detail: 'Consider reviewing installation cost or system size'
            });
        }
        
        // Insight 3: Net profit after 25 years
        insights.push({
            type: 'positive',
            icon: '📈',
            title: 'Lifetime Net Profit',
            message: `Estimated lifetime profit after 25 years: ₹${(data.netProfit25 / 100000).toFixed(1)}L`,
            detail: `Total savings (₹${(data.totalSavings25 / 100000).toFixed(1)}L) minus investment (₹${(data.effectiveInvestment / 100000).toFixed(1)}L)`
        });
        
        // Insight 4: 10-year projection
        if (data.netProfit10 > 0) {
            insights.push({
                type: 'positive',
                icon: '💵',
                title: '10-Year Net Profit',
                message: `After 10 years, net profit: ₹${(data.netProfit10 / 100000).toFixed(1)}L`,
                detail: `ROI: ${data.roiPercent10}% over initial investment`
            });
        } else {
            insights.push({
                type: 'info',
                icon: '⏱️',
                title: '10-Year Status',
                message: `After 10 years, recovered: ₹${(data.totalSavings10 / 100000).toFixed(1)}L`,
                detail: `Still recovering initial investment of ₹${(data.effectiveInvestment / 100000).toFixed(1)}L`
            });
        }
        
        // Insight 5: Tariff impact
        const tariffImpact = data.tariffIncrease * 100;
        insights.push({
            type: 'info',
            icon: '⚡',
            title: 'Tariff Growth Impact',
            message: `${tariffImpact.toFixed(1)}% annual tariff increase significantly improves ROI`,
            detail: 'Rising electricity costs make solar more valuable over time'
        });
        
        // Insight 6: Subsidy impact (if applicable)
        if (data.subsidyAmount > 0) {
            const subsidyPercent = ((data.subsidyAmount / data.installationCost) * 100).toFixed(1);
            insights.push({
                type: 'positive',
                icon: '🎁',
                title: 'Subsidy Benefit',
                message: `Government subsidy of ₹${(data.subsidyAmount / 100000).toFixed(1)}L (${subsidyPercent}%) reduced your payback period`,
                detail: 'Subsidy makes solar investment more attractive'
            });
        }
        
        return insights;
    },
    
    /**
     * Get forecast data for chart (reads from dashboardState)
     */
    getChartData() {
        const data = this.getForecastData();
        if (!data) return null;
        
        const years = data.years;
        const effectiveInvestment = data.effectiveInvestment;
        
        return {
            labels: years.map(y => `Year ${y.year}`),
            cumulativeSavings: years.map(y => y.cumulativeSavings),
            investmentLine: Array(years.length).fill(effectiveInvestment),
            paybackYear: data.paybackYear
        };
    },
    
    /**
     * Get summary statistics (reads from dashboardState)
     */
    getSummary() {
        const data = this.getForecastData();
        if (!data) return null;
        
        return {
            installationCost: data.installationCost,
            subsidyAmount: data.subsidyAmount,
            netCost: data.netCost,
            effectiveInvestment: data.effectiveInvestment,
            paybackYears: data.paybackYear,
            paybackMonths: data.breakEvenMonth,
            savings10Years: data.totalSavings10,
            savings15Years: data.totalSavings15,
            savings25Years: data.totalSavings25,
            netProfit10: data.netProfit10,
            netProfit25: data.netProfit25,
            roi10Years: data.roiPercent10,
            roi25Years: data.roiPercent25,
            baseGeneration: data.baseAnnualGeneration,
            loanEnabled: data.loanEnabled,
            monthlyEMI: data.monthlyEMI
        };
    },
    
    /**
     * Recalculate forecast (alias for backward compatibility)
     * This is the main entry point for updates
     */
    recalculate() {
        console.log('🔄 ROI Forecast recalculate() called');
        const result = this.recalculateROIForecast();
        
        // Update UI if render function exists
        if (window.renderROISection) {
            console.log('🎨 Triggering UI update...');
            window.renderROISection();
        }
        
        return result;
    },
    
    /**
     * Initialize ROI forecast engine
     */
    init() {
        console.log('💰 Initializing ROI Forecast Engine...');
        
        // Calculate initial forecast
        this.recalculateROIForecast();
        
        console.log('✅ ROI Forecast Engine initialized');
    }
};

/**
 * Render ROI Forecast Section
 * Reads ALL data from dashboardState.roiForecast
 */
function renderROISection() {
    console.log('💰 Rendering ROI Forecast section...');
    
    // Ensure forecast is calculated
    if (!window.dashboardState || !window.dashboardState.roiForecast) {
        console.log('📊 ROI forecast not found, calculating...');
        roiForecastEngine.recalculateROIForecast();
    }
    
    // Render all components
    renderROISummary();
    renderForecastTable();
    renderROIChart();
    renderROIInsights();
    
    console.log('✅ ROI Forecast section rendered');
}

/**
 * Render ROI summary cards
 * Reads from dashboardState.roiForecast
 */
function renderROISummary() {
    const summary = roiForecastEngine.getSummary();
    if (!summary) {
        console.warn('⚠️ No summary data available');
        return;
    }
    
    // Installation cost (or net cost after subsidy)
    const installationCostEl = document.getElementById('roiInstallationCost');
    if (installationCostEl) {
        const displayCost = summary.subsidyAmount > 0 ? summary.netCost : summary.installationCost;
        installationCostEl.textContent = `₹${(displayCost / 100000).toFixed(1)}L`;
    }
    
    // Payback period
    const paybackYearsEl = document.getElementById('roiPaybackYears');
    if (paybackYearsEl) {
        if (summary.paybackYears > 0) {
            const monthText = summary.paybackMonths > 0 ? `.${summary.paybackMonths}` : '';
            paybackYearsEl.textContent = `${summary.paybackYears}${monthText}`;
        } else {
            paybackYearsEl.textContent = '25+';
        }
    }
    
    // 10-year savings
    const savings10El = document.getElementById('roiSavings10');
    if (savings10El) {
        savings10El.textContent = `₹${(summary.savings10Years / 100000).toFixed(1)}L`;
    }
    
    // 25-year net profit
    const netProfit25El = document.getElementById('roiNetProfit25');
    if (netProfit25El) {
        netProfit25El.textContent = `₹${(summary.netProfit25 / 100000).toFixed(1)}L`;
    }
    
    // 25-year total savings
    const savings25El = document.getElementById('roiSavings25');
    if (savings25El) {
        savings25El.textContent = `₹${(summary.savings25Years / 100000).toFixed(1)}L`;
    }
    
    // ROI percentage
    const roiPercentEl = document.getElementById('roiPercent25');
    if (roiPercentEl) {
        roiPercentEl.textContent = summary.roi25Years;
    }
    
    console.log('✅ ROI summary cards updated');
}

/**
 * Render forecast table
 * Reads from dashboardState.roiForecast
 */
function renderForecastTable() {
    const container = document.getElementById('forecastTable');
    if (!container) return;
    
    const data = roiForecastEngine.getForecastData();
    if (!data) {
        console.warn('⚠️ No forecast data available');
        return;
    }
    
    const years = data.years;
    const effectiveInvestment = data.effectiveInvestment;
    
    let html = '<div class="forecast-table-wrapper">';
    html += '<table class="forecast-table">';
    html += '<thead><tr>';
    html += '<th>Year</th>';
    html += '<th>Generation (kWh)</th>';
    html += '<th>Tariff (₹/kWh)</th>';
    
    // Show EMI column if loan enabled
    if (data.loanEnabled) {
        html += '<th>Gross Savings (₹)</th>';
        html += '<th>EMI Paid (₹)</th>';
        html += '<th>Net Savings (₹)</th>';
    } else {
        html += '<th>Savings (₹)</th>';
    }
    
    html += '<th>Cumulative (₹)</th>';
    html += '<th>Status</th>';
    html += '</tr></thead>';
    html += '<tbody>';
    
    // Show first 10 years, then every 5 years
    const displayYears = years.filter((y, i) => i < 10 || (i + 1) % 5 === 0);
    
    displayYears.forEach(year => {
        const isPayback = year.isPaybackYear;
        const isProfitable = year.cumulativeSavings >= effectiveInvestment;
        const rowClass = isPayback ? 'payback-row' : (isProfitable ? 'profitable-row' : '');
        
        html += `<tr class="${rowClass}">`;
        html += `<td class="year-cell">${year.year}${isPayback ? ' 🎯' : ''}</td>`;
        html += `<td>${year.generation.toLocaleString('en-IN')}</td>`;
        html += `<td>₹${year.tariff.toFixed(2)}</td>`;
        
        if (data.loanEnabled) {
            html += `<td>₹${year.grossSavings.toLocaleString('en-IN')}</td>`;
            html += `<td class="emi-cell">₹${year.emiPaid.toLocaleString('en-IN')}</td>`;
            html += `<td>₹${year.netSavings.toLocaleString('en-IN')}</td>`;
        } else {
            html += `<td>₹${year.netSavings.toLocaleString('en-IN')}</td>`;
        }
        
        html += `<td class="cumulative-cell">₹${year.cumulativeSavings.toLocaleString('en-IN')}</td>`;
        html += `<td class="status-cell">`;
        if (isPayback) {
            html += '<span class="status-badge payback">Break Even</span>';
        } else if (isProfitable) {
            html += '<span class="status-badge profitable">Profitable</span>';
        } else {
            html += '<span class="status-badge recovering">Recovering</span>';
        }
        html += '</td>';
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    html += '</div>';
    
    container.innerHTML = html;
    console.log('✅ Forecast table updated');
}

/**
 * Render ROI chart
 * Reads from dashboardState.roiForecast
 */
let roiChartInstance = null;

function renderROIChart() {
    const canvas = document.getElementById('roiChart');
    if (!canvas) return;
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('❌ Chart.js is not loaded');
        return;
    }
    
    const chartData = roiForecastEngine.getChartData();
    if (!chartData) {
        console.warn('⚠️ No chart data available');
        return;
    }
    
    // Destroy existing chart
    if (roiChartInstance) {
        roiChartInstance.destroy();
    }
    
    // Create new chart
    const ctx = canvas.getContext('2d');
    roiChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [
                {
                    label: 'Cumulative Savings',
                    data: chartData.cumulativeSavings,
                    borderColor: '#00d9a3',
                    backgroundColor: 'rgba(0, 217, 163, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#00d9a3',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                },
                {
                    label: 'Investment',
                    data: chartData.investmentLine,
                    borderColor: '#ff9800',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0,
                    fill: false,
                    pointRadius: 0
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
                    displayColors: true,
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
                    beginAtZero: true,
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
                duration: 750,
                easing: 'easeInOutQuart'
            }
        }
    });
    
    console.log('✅ ROI chart updated');
}

/**
 * Render ROI insights
 * Reads from dashboardState.roiForecast
 */
function renderROIInsights() {
    const container = document.getElementById('roiInsights');
    if (!container) return;
    
    const insights = roiForecastEngine.generateInsights();
    if (!insights || insights.length === 0) {
        console.warn('⚠️ No insights available');
        return;
    }
    
    let html = '<div class="roi-insights-grid">';
    
    insights.forEach(insight => {
        html += `
            <div class="roi-insight-card insight-${insight.type}">
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
    console.log('✅ ROI insights updated');
}

/**
 * Initialize ROI forecast engine when dashboard state is ready
 */
function initROIForecast() {
    console.log('💰 Checking if ROI Forecast can start...');
    
    if (window.dashboardState) {
        roiForecastEngine.init();
    } else {
        console.log('⏳ Waiting for dashboard state...');
        setTimeout(initROIForecast, 1000);
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initROIForecast, 2000);
    });
} else {
    setTimeout(initROIForecast, 2000);
}

// Export for global use
window.roiForecastEngine = roiForecastEngine;
window.renderROISection = renderROISection;
window.initROIForecast = initROIForecast;

console.log('✅ ROI Forecast Engine Module Loaded');
