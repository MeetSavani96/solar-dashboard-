// ============================================
// ENHANCED ANALYSIS SECTION
// ============================================

console.log('📈 Enhanced Analysis Module Loading...');

/**
 * Analysis Data Structure
 * Contains monthly breakdown and calculated insights
 */
const analysisData = {
    // Monthly breakdown for last 6 months
    monthlyBreakdown: [
        { month: "July", generation: 1150, consumption: 980, efficiency: 94 },
        { month: "August", generation: 1280, consumption: 1050, efficiency: 96 },
        { month: "September", generation: 1240, consumption: 1020, efficiency: 95 },
        { month: "October", generation: 1380, consumption: 1100, efficiency: 97 },
        { month: "November", generation: 1520, consumption: 1180, efficiency: 96 },
        { month: "December", generation: 1180, consumption: 950, efficiency: 95 }
    ],
    
    // Overview metrics
    avgDailyGeneration: 42.5,
    avgDailyConsumption: 18.2,
    peakPower: 6.1,
    systemEfficiency: 94.5
};

/**
 * Calculate savings for each month based on tariff
 * @param {number} generation - Energy generated in kWh
 * @returns {number} Savings in ₹
 */
function calculateSavings(generation) {
    const tariff = window.dashboardState ? window.dashboardState.profile.tariff : 8;
    return Math.round(generation * tariff);
}

/**
 * Calculate trend indicator (up/down/stable)
 * @param {number} current - Current month value
 * @param {number} previous - Previous month value
 * @returns {Object} Trend object with direction and percentage
 */
function calculateTrend(current, previous) {
    if (!previous) return { direction: 'stable', percentage: 0 };
    
    const change = current - previous;
    const percentage = Math.round((change / previous) * 100);
    
    if (percentage > 2) {
        return { direction: 'up', percentage: Math.abs(percentage) };
    } else if (percentage < -2) {
        return { direction: 'down', percentage: Math.abs(percentage) };
    } else {
        return { direction: 'stable', percentage: 0 };
    }
}

/**
 * Find best performing month
 * @returns {Object} Best month data
 */
function findBestMonth() {
    let bestMonth = analysisData.monthlyBreakdown[0];
    
    analysisData.monthlyBreakdown.forEach(month => {
        if (month.generation > bestMonth.generation) {
            bestMonth = month;
        }
    });
    
    return bestMonth;
}

/**
 * Generate performance insights based on data
 * @returns {Array} Array of insight objects
 */
function generatePerformanceInsights() {
    const insights = [];
    const breakdown = analysisData.monthlyBreakdown;
    const currentMonth = breakdown[breakdown.length - 1];
    const previousMonth = breakdown[breakdown.length - 2];
    const bestMonth = findBestMonth();
    
    // Weather-based insight (if weather engine is available)
    if (window.weatherEngine && window.weatherInsight) {
        insights.push({
            type: window.weatherInsight.type,
            icon: window.weatherEngine.weatherIcons[window.weatherEngine.currentWeather] || '🌤️',
            message: window.weatherInsight.message,
            detail: `Current generation efficiency: ${window.weatherInsight.impact}%`
        });
    }
    
    // Insight 1: Month-over-month comparison
    if (currentMonth && previousMonth) {
        const trend = calculateTrend(currentMonth.generation, previousMonth.generation);
        
        if (trend.direction === 'up') {
            insights.push({
                type: 'positive',
                icon: '📈',
                message: `Production increased by ${trend.percentage}% compared to last month`,
                detail: `${currentMonth.month}: ${currentMonth.generation} kWh vs ${previousMonth.month}: ${previousMonth.generation} kWh`
            });
        } else if (trend.direction === 'down') {
            insights.push({
                type: 'warning',
                icon: '📉',
                message: `Production decreased by ${trend.percentage}% compared to last month`,
                detail: `${currentMonth.month}: ${currentMonth.generation} kWh vs ${previousMonth.month}: ${previousMonth.generation} kWh`
            });
        } else {
            insights.push({
                type: 'info',
                icon: '➡️',
                message: `Production remained stable compared to last month`,
                detail: `Consistent performance around ${currentMonth.generation} kWh`
            });
        }
    }
    
    // Insight 2: System efficiency
    const avgEfficiency = breakdown.reduce((sum, m) => sum + m.efficiency, 0) / breakdown.length;
    
    if (avgEfficiency >= 95) {
        insights.push({
            type: 'positive',
            icon: '⚡',
            message: `System efficiency is excellent at ${avgEfficiency.toFixed(1)}%`,
            detail: `Consistently above 95% efficiency threshold`
        });
    } else if (avgEfficiency >= 90) {
        insights.push({
            type: 'info',
            icon: '🎯',
            message: `System efficiency is good at ${avgEfficiency.toFixed(1)}%`,
            detail: `Performing within normal range`
        });
    } else {
        insights.push({
            type: 'warning',
            icon: '⚠️',
            message: `System efficiency could be improved (${avgEfficiency.toFixed(1)}%)`,
            detail: `Consider maintenance or panel cleaning`
        });
    }
    
    // Insight 3: Best performing month
    insights.push({
        type: 'info',
        icon: '🏆',
        message: `Peak generation occurred in ${bestMonth.month}`,
        detail: `Generated ${bestMonth.generation} kWh with ${bestMonth.efficiency}% efficiency`
    });
    
    // Insight 4: Energy surplus
    const totalGeneration = breakdown.reduce((sum, m) => sum + m.generation, 0);
    const totalConsumption = breakdown.reduce((sum, m) => sum + m.consumption, 0);
    const surplus = totalGeneration - totalConsumption;
    const surplusPercentage = Math.round((surplus / totalGeneration) * 100);
    
    if (surplusPercentage > 20) {
        insights.push({
            type: 'positive',
            icon: '💡',
            message: `Generating ${surplusPercentage}% more energy than consumed`,
            detail: `Surplus of ${surplus.toLocaleString()} kWh over 6 months`
        });
    }
    
    return insights;
}

/**
 * Render Monthly Breakdown section
 */
function renderMonthlyBreakdown() {
    console.log('📊 Rendering Monthly Breakdown...');
    
    const container = document.getElementById('monthlyBreakdown');
    if (!container) {
        console.warn('⚠️ Monthly breakdown container not found');
        return;
    }
    
    // Get current month data (last month in array)
    const breakdown = analysisData.monthlyBreakdown;
    const currentMonth = breakdown[breakdown.length - 1];
    
    const totalGeneration = currentMonth.generation;
    const totalConsumption = currentMonth.consumption;
    const surplus = totalGeneration - totalConsumption;
    
    const tariff = window.dashboardState ? window.dashboardState.profile.tariff : 8;
    const savings = Math.round(totalGeneration * tariff);
    
    let html = `
        <div class="summary-stat">
            <span class="summary-label">Generated</span>
            <span class="summary-value">${totalGeneration.toLocaleString()} kWh</span>
        </div>
        <div class="summary-stat">
            <span class="summary-label">Consumed</span>
            <span class="summary-value">${totalConsumption.toLocaleString()} kWh</span>
        </div>
        <div class="summary-stat highlight">
            <span class="summary-label">Net Surplus</span>
            <span class="summary-value">${surplus.toLocaleString()} kWh</span>
        </div>
        <div class="summary-stat">
            <span class="summary-label">Savings</span>
            <span class="summary-value">₹${savings.toLocaleString('en-IN')}</span>
        </div>
    `;
    
    container.innerHTML = html;
    console.log('✅ Monthly Breakdown rendered');
}

/**
 * Render Performance Insights section
 */
function renderPerformanceInsights() {
    console.log('💡 Rendering Performance Insights...');
    
    const container = document.getElementById('performanceInsights');
    if (!container) {
        console.warn('⚠️ Performance insights container not found');
        return;
    }
    
    // Calculate insights based on current data
    const breakdown = analysisData.monthlyBreakdown;
    const currentMonth = breakdown[breakdown.length - 1];
    
    const totalGeneration = breakdown.reduce((sum, m) => sum + m.generation, 0);
    const totalConsumption = breakdown.reduce((sum, m) => sum + m.consumption, 0);
    const avgDailyGen = (totalGeneration / (breakdown.length * 30)).toFixed(1);
    const avgDailyCons = (totalConsumption / (breakdown.length * 30)).toFixed(1);
    const surplus = parseFloat(avgDailyGen) - parseFloat(avgDailyCons);
    const offsetPercentage = Math.round((parseFloat(avgDailyGen) / parseFloat(avgDailyCons)) * 100);
    
    const tariff = window.dashboardState ? window.dashboardState.profile.tariff : 8;
    const dailySavings = Math.round(parseFloat(avgDailyGen) * tariff);
    
    let html = `
        <div class="insight-item">
            <span class="insight-emoji">✅</span>
            <p class="insight-text">Your system is producing <strong>${surplus.toFixed(1)} kWh more</strong> than you're using daily</p>
        </div>
        <div class="insight-item">
            <span class="insight-emoji">💰</span>
            <p class="insight-text">You're saving approximately <strong>₹${dailySavings.toLocaleString('en-IN')}/day</strong> on electricity</p>
        </div>
        <div class="insight-item">
            <span class="insight-emoji">🌱</span>
            <p class="insight-text">Your solar system is offsetting <strong>${offsetPercentage}% of your usage</strong></p>
        </div>
    `;
    
    container.innerHTML = html;
    console.log('✅ Performance Insights rendered');
}

/**
 * Update analysis overview metrics
 */
function updateAnalysisOverview() {
    console.log('🔄 Updating Analysis Overview...');
    
    // Calculate metrics from monthly data
    const breakdown = analysisData.monthlyBreakdown;
    const totalGeneration = breakdown.reduce((sum, m) => sum + m.generation, 0);
    const avgMonthlyGeneration = totalGeneration / breakdown.length;
    const avgDailyGeneration = (avgMonthlyGeneration / 30).toFixed(1);
    
    const totalConsumption = breakdown.reduce((sum, m) => sum + m.consumption, 0);
    const avgMonthlyConsumption = totalConsumption / breakdown.length;
    const avgDailyConsumption = (avgMonthlyConsumption / 30).toFixed(1);
    
    const avgEfficiency = breakdown.reduce((sum, m) => sum + m.efficiency, 0) / breakdown.length;
    
    // Update overview cards
    const avgDailyGenEl = document.getElementById('avgDailyGeneration');
    if (avgDailyGenEl) avgDailyGenEl.textContent = `${avgDailyGeneration} kWh`;
    
    const avgDailyConsEl = document.getElementById('avgDailyConsumption');
    if (avgDailyConsEl) avgDailyConsEl.textContent = `${avgDailyConsumption} kWh`;
    
    const efficiencyEl = document.getElementById('systemEfficiencyAnalysis');
    if (efficiencyEl) efficiencyEl.textContent = `${avgEfficiency.toFixed(1)}%`;
    
    console.log('✅ Analysis Overview updated');
}

/**
 * Main render function for Analysis section
 * Called when Analysis section is opened
 */
function renderAnalysisSection() {
    console.log('📈 Rendering Analysis Section...');
    
    // Update overview metrics
    updateAnalysisOverview();
    
    // Render monthly breakdown
    renderMonthlyBreakdown();
    
    // Render performance insights
    renderPerformanceInsights();
    
    console.log('✅ Analysis Section rendered');
}

/**
 * Update analysis data when profile changes
 * This allows real-time updates when tariff changes
 */
function updateAnalysisFromProfile() {
    console.log('🔄 Updating Analysis from profile...');
    
    // Recalculate savings based on new tariff
    // Monthly breakdown will use new tariff when rendered
    
    // Re-render if Analysis section is active
    const analysisSection = document.getElementById('analysis');
    if (analysisSection && analysisSection.classList.contains('active-section')) {
        renderAnalysisSection();
    }
    
    console.log('✅ Analysis updated from profile');
}

// Export functions for global use
window.renderAnalysisSection = renderAnalysisSection;
window.renderMonthlyBreakdown = renderMonthlyBreakdown;
window.renderPerformanceInsights = renderPerformanceInsights;
window.updateAnalysisFromProfile = updateAnalysisFromProfile;
window.analysisData = analysisData;

console.log('✅ Enhanced Analysis Module Loaded');
