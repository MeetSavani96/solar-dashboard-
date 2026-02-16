// ============================================
// DASHBOARD STATE MANAGEMENT
// ============================================

console.log('📦 Dashboard State Manager Loading...');

/**
 * Central Dashboard State
 * All dashboard data is stored here
 */
const dashboardState = {
    profile: {
        name: "Rahul Patel",
        email: "rahul@email.com",
        plantName: "Home Rooftop Solar",
        systemSize: 10,        // kW
        location: "Surat",
        state: "Gujarat",      // State for subsidy calculation
        city: "Surat",         // City
        tariff: 8,             // ₹ per unit
        installationCost: 500000,  // ₹ (5 lakhs)
        installationType: "residential",  // "residential" or "commercial"
        purchaseType: "cash"   // "cash" or "loan"
    },
    metrics: {
        totalGeneration: 14200,    // kWh
        todayGeneration: 42,       // kWh
        livePower: 5.6,            // kW (real-time, updated by weather engine)
        consumption: 18,           // kWh
        healthScore: 96,           // %
        monthlyGeneration: [1150, 1280, 1240, 1380, 1520, 1180], // Last 6 months
        monthlyConsumption: [980, 1050, 1020, 1100, 1180, 950]
    },
    calculated: {
        totalSavings: 0,
        monthlySavings: 0,
        paybackProgress: 0,
        totalInvestment: 500000    // ₹
    },
    subsidy: {
        eligible: false,           // Auto-determined eligibility
        eligibilityReason: '',     // Reason for eligibility status
        autoApply: true,           // Always true - subsidy is automatic
        centralSubsidy: 0,         // Central govt subsidy
        stateSubsidy: 0,           // State govt subsidy
        totalSubsidy: 0,           // Total subsidy
        netCost: 500000,           // Net cost after subsidy
        appliedRules: []           // Rules that were applied
    },
    loan: {
        enabled: false,
        installationCost: 0,
        downPayment: 0,
        interestRate: 9.5,
        tenureYears: 5,
        // Silent calculated values (not shown in Profile UI)
        loanAmount: 0,
        monthlyEMI: 0,
        totalInterest: 0,
        totalPayment: 0,
        netSystemCost: 0
    }
};

/**
 * Load state from localStorage
 */
function loadStateFromStorage() {
    console.log('📂 Loading state from localStorage...');
    
    try {
        const savedState = localStorage.getItem('dashboardState');
        
        if (savedState) {
            const parsed = JSON.parse(savedState);
            
            // Merge saved state with default state
            Object.assign(dashboardState.profile, parsed.profile || {});
            Object.assign(dashboardState.metrics, parsed.metrics || {});
            Object.assign(dashboardState.calculated, parsed.calculated || {});
            
            console.log('✅ State loaded from localStorage');
        } else {
            console.log('ℹ️ No saved state found, using defaults');
        }
    } catch (error) {
        console.error('❌ Error loading state:', error);
    }
    
    // Calculate derived values
    calculateDerivedMetrics();
}

/**
 * Save state to localStorage
 */
function saveStateToStorage() {
    console.log('💾 Saving state to localStorage...');
    
    try {
        localStorage.setItem('dashboardState', JSON.stringify(dashboardState));
        console.log('✅ State saved to localStorage');
    } catch (error) {
        console.error('❌ Error saving state:', error);
    }
}

/**
 * Calculate subsidy amount using automatic subsidy engine
 * Subsidy is automatically applied based on eligibility
 */
function calculateSubsidyAmount() {
    const { subsidy, profile } = dashboardState;
    
    // Always check eligibility - subsidy is automatic
    // Use subsidy engine if available
    if (window.subsidyEngine) {
        const result = window.subsidyEngine.calculateTotalSubsidy(
            profile.state || 'Gujarat',
            profile.systemSize || 10,
            profile.installationCost || 500000,
            profile.installationType || 'residential'
        );
        
        // Update subsidy state
        subsidy.eligible = result.eligible;
        subsidy.eligibilityReason = result.eligibilityReason;
        subsidy.centralSubsidy = result.centralSubsidy;
        subsidy.stateSubsidy = result.stateSubsidy;
        subsidy.totalSubsidy = result.totalSubsidy;
        subsidy.netCost = result.netCost;
        subsidy.appliedRules = result.appliedRules;
        
        if (result.eligible) {
            console.log(`✅ Subsidy auto-applied: ₹${result.totalSubsidy.toLocaleString('en-IN')}`);
        } else {
            console.log(`❌ Not eligible for subsidy: ${result.eligibilityReason}`);
        }
        
        return result.totalSubsidy;
    }
    
    // Fallback if engine not loaded
    console.warn('⚠️ Subsidy engine not loaded, using fallback');
    subsidy.eligible = false;
    subsidy.eligibilityReason = 'Subsidy engine not available';
    subsidy.totalSubsidy = 0;
    return 0;
}

/**
 * Get net system cost after subsidy
 */
function getNetSystemCost() {
    const installationCost = dashboardState.profile.installationCost || 0;
    const subsidyAmount = calculateSubsidyAmount();
    const netCost = installationCost - subsidyAmount;
    
    console.log(`📊 Net System Cost: ₹${netCost.toLocaleString('en-IN')} (Installation: ₹${installationCost.toLocaleString('en-IN')} - Subsidy: ₹${subsidyAmount.toLocaleString('en-IN')})`);
    
    return netCost;
}

/**
 * Calculate derived metrics based on profile
 */
function calculateDerivedMetrics() {
    console.log('🧮 Calculating derived metrics...');
    
    const { totalGeneration } = dashboardState.metrics;
    const { tariff } = dashboardState.profile;
    
    // Calculate subsidy amount
    calculateSubsidyAmount();
    
    // Get net system cost
    const netSystemCost = getNetSystemCost();
    
    // Calculate total savings
    dashboardState.calculated.totalSavings = Math.round(totalGeneration * tariff);
    
    // Calculate monthly savings (average)
    const avgMonthlyGeneration = dashboardState.metrics.monthlyGeneration.reduce((a, b) => a + b, 0) / 
                                  dashboardState.metrics.monthlyGeneration.length;
    dashboardState.calculated.monthlySavings = Math.round(avgMonthlyGeneration * tariff);
    
    // Update total investment (use net cost after subsidy)
    dashboardState.calculated.totalInvestment = netSystemCost;
    
    // Calculate payback progress
    dashboardState.calculated.paybackProgress = Math.round(
        (dashboardState.calculated.totalSavings / netSystemCost) * 100
    );
    
    console.log('✅ Derived metrics calculated:', dashboardState.calculated);
}

/**
 * Update profile data
 * @param {Object} newProfile - New profile data
 */
function updateProfile(newProfile) {
    console.log('🔄 Updating profile...', newProfile);
    
    // Validate inputs
    if (!newProfile.name || newProfile.name.trim() === '') {
        console.error('❌ Name is required');
        return false;
    }
    
    if (!newProfile.systemSize || newProfile.systemSize <= 0) {
        console.error('❌ System size must be greater than 0');
        return false;
    }
    
    if (!newProfile.tariff || newProfile.tariff <= 0) {
        console.error('❌ Tariff must be greater than 0');
        return false;
    }
    
    if (!newProfile.installationCost || newProfile.installationCost <= 0) {
        console.error('❌ Installation cost must be greater than 0');
        return false;
    }
    
    // Update profile
    Object.assign(dashboardState.profile, newProfile);
    
    // Recalculate derived metrics
    calculateDerivedMetrics();
    
    // Save to localStorage
    saveStateToStorage();
    
    // Trigger dashboard update
    updateDashboardFromProfile();
    
    // ============================================
    // TRIGGER ROI RECALCULATION (CRITICAL!)
    // ============================================
    if (window.roiForecastEngine) {
        console.log('🔄 Triggering ROI recalculation from profile update...');
        window.roiForecastEngine.recalculate();
    }
    
    console.log('✅ Profile updated successfully');
    return true;
}

/**
 * Update entire dashboard based on profile changes
 */
function updateDashboardFromProfile() {
    console.log('🔄 Updating dashboard from profile...');
    
    // Update header
    updateDashboardHeader();
    
    // Update all sections
    updateOverviewSection();
    updateFinanceSection();
    updateAnalysisSection();
    updateSettingsSection();
    
    console.log('✅ Dashboard updated from profile');
}

/**
 * Update dashboard header
 */
function updateDashboardHeader() {
    const { plantName, systemSize } = dashboardState.profile;
    
    // Update system size in header
    const headerSystemSize = document.getElementById('headerSystemSize');
    if (headerSystemSize) {
        animateNumberChange(headerSystemSize, systemSize, ' kW');
    }
    
    // Update page title if needed
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle && pageTitle.textContent === 'Profile') {
        // Don't change title on other pages
    }
    
    console.log('✅ Header updated');
}

/**
 * Update Overview section
 */
function updateOverviewSection() {
    const { systemSize } = dashboardState.profile;
    const { totalGeneration, todayGeneration, consumption, healthScore, livePower } = dashboardState.metrics;
    
    // Update system size
    const systemSizeEl = document.getElementById('systemSize');
    if (systemSizeEl) {
        animateNumberChange(systemSizeEl, systemSize, ' kW');
    }
    
    // Update live power (from weather engine)
    const livePowerEl = document.getElementById('livePower');
    if (livePowerEl) {
        animateNumberChange(livePowerEl, livePower || 0, ' kW');
    }
    
    // Update total energy
    const totalEnergyEl = document.getElementById('totalEnergy');
    if (totalEnergyEl) {
        animateNumberChange(totalEnergyEl, totalGeneration, ' kWh', true);
    }
    
    // Update today's generation
    const todayGenEl = document.getElementById('todayGeneration');
    if (todayGenEl) {
        animateNumberChange(todayGenEl, todayGeneration, ' kWh');
    }
    
    // Update consumption
    const consumptionEl = document.getElementById('consumption');
    if (consumptionEl) {
        animateNumberChange(consumptionEl, consumption, ' kWh');
    }
    
    // Update health score
    const healthScoreEl = document.getElementById('healthScore');
    if (healthScoreEl) {
        animateNumberChange(healthScoreEl, healthScore, '%');
    }
    
    // Update last updated timestamp
    const lastUpdatedEl = document.getElementById('lastUpdated');
    if (lastUpdatedEl) {
        lastUpdatedEl.textContent = 'Just now';
    }
    
    console.log('✅ Overview section updated');
}

/**
 * Update Finance section
 */
function updateFinanceSection() {
    const { tariff } = dashboardState.profile;
    const { totalSavings, monthlySavings, paybackProgress, totalInvestment } = dashboardState.calculated;
    
    // Update total savings
    const totalSavingsEl = document.getElementById('totalSavings');
    if (totalSavingsEl) {
        animateNumberChange(totalSavingsEl, totalSavings, '', true, '₹');
    }
    
    // Update monthly savings
    const monthlySavingsEl = document.getElementById('monthlySavings');
    if (monthlySavingsEl) {
        animateNumberChange(monthlySavingsEl, monthlySavings, '', true, '₹');
    }
    
    // Update tariff rate
    const tariffRateEl = document.getElementById('tariffRate');
    if (tariffRateEl) {
        tariffRateEl.textContent = `₹${tariff}/kWh`;
    }
    
    // Update payback progress
    const paybackProgressEl = document.getElementById('paybackProgress');
    if (paybackProgressEl) {
        animateNumberChange(paybackProgressEl, paybackProgress, '%');
    }
    
    // Update payback bar
    const paybackBar = document.getElementById('paybackBar');
    if (paybackBar) {
        paybackBar.style.width = `${paybackProgress}%`;
    }
    
    // Update investment breakdown
    const totalInvestmentEl = document.getElementById('totalInvestment');
    if (totalInvestmentEl) {
        totalInvestmentEl.textContent = `₹${totalInvestment.toLocaleString('en-IN')}`;
    }
    
    const amountRecoveredEl = document.getElementById('amountRecovered');
    if (amountRecoveredEl) {
        amountRecoveredEl.textContent = `₹${totalSavings.toLocaleString('en-IN')}`;
    }
    
    const amountRemainingEl = document.getElementById('amountRemaining');
    if (amountRemainingEl) {
        const remaining = totalInvestment - totalSavings;
        amountRemainingEl.textContent = `₹${remaining.toLocaleString('en-IN')}`;
    }
    
    console.log('✅ Finance section updated');
}

/**
 * Update Analysis section
 */
function updateAnalysisSection() {
    const { systemSize } = dashboardState.profile;
    const { monthlyGeneration } = dashboardState.metrics;
    
    // Calculate average daily generation
    const avgMonthly = monthlyGeneration.reduce((a, b) => a + b, 0) / monthlyGeneration.length;
    const avgDaily = (avgMonthly / 30).toFixed(1);
    
    const avgDailyGenEl = document.getElementById('avgDailyGeneration');
    if (avgDailyGenEl) {
        animateNumberChange(avgDailyGenEl, parseFloat(avgDaily), ' kWh');
    }
    
    // Update system efficiency based on system size
    const efficiency = Math.min(95, 85 + (systemSize / 2));
    const efficiencyEl = document.getElementById('systemEfficiencyAnalysis');
    if (efficiencyEl) {
        animateNumberChange(efficiencyEl, efficiency.toFixed(1), '%');
    }
    
    console.log('✅ Analysis section updated');
}

/**
 * Update Settings section
 */
function updateSettingsSection() {
    const { plantName, location, tariff } = dashboardState.profile;
    
    // Update system name
    const systemNameEl = document.getElementById('systemName');
    if (systemNameEl) {
        systemNameEl.textContent = plantName;
    }
    
    // Update location (if it has city/state split)
    const locationParts = location.split(',');
    const locationCityEl = document.getElementById('locationCity');
    if (locationCityEl) {
        locationCityEl.textContent = locationParts[0].trim();
    }
    
    // Update tariff in settings
    const settingsTariffEl = document.getElementById('settingsTariff');
    if (settingsTariffEl) {
        settingsTariffEl.textContent = `₹${tariff}/kWh`;
    }
    
    console.log('✅ Settings section updated');
}

/**
 * Animate number change with smooth transition
 * @param {HTMLElement} element - Element to update
 * @param {number} targetValue - Target value
 * @param {string} suffix - Suffix to add (e.g., ' kW', '%')
 * @param {boolean} useComma - Use comma separator for thousands
 * @param {string} prefix - Prefix to add (e.g., '₹')
 */
function animateNumberChange(element, targetValue, suffix = '', useComma = false, prefix = '') {
    if (!element) return;
    
    // Get current value
    const currentText = element.textContent.replace(/[^0-9.]/g, '');
    const currentValue = parseFloat(currentText) || 0;
    
    // If values are the same, no animation needed
    if (currentValue === targetValue) return;
    
    // Add highlight animation
    element.style.transition = 'all 0.3s ease';
    element.style.transform = 'scale(1.1)';
    element.style.color = '#00d9a3';
    
    // Animate number
    const duration = 500; // ms
    const steps = 20;
    const stepValue = (targetValue - currentValue) / steps;
    const stepDuration = duration / steps;
    
    let currentStep = 0;
    
    const interval = setInterval(() => {
        currentStep++;
        const newValue = currentValue + (stepValue * currentStep);
        
        let displayValue;
        if (useComma) {
            displayValue = Math.round(newValue).toLocaleString('en-IN');
        } else {
            displayValue = newValue.toFixed(suffix.includes('%') || suffix.includes('kW') ? 1 : 0);
        }
        
        element.textContent = `${prefix}${displayValue}${suffix}`;
        
        if (currentStep >= steps) {
            clearInterval(interval);
            
            // Reset styles
            setTimeout(() => {
                element.style.transform = 'scale(1)';
                element.style.color = '';
            }, 200);
        }
    }, stepDuration);
}

/**
 * Show success toast notification
 * @param {string} message - Message to display
 */
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    console.log('📢 Toast:', message);
}

// Initialize state on load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing dashboard state...');
    loadStateFromStorage();
    console.log('✅ Dashboard state initialized');
});

// Export functions for global use
window.dashboardState = dashboardState;
window.updateProfile = updateProfile;
window.updateDashboardFromProfile = updateDashboardFromProfile;
window.showToast = showToast;
window.loadStateFromStorage = loadStateFromStorage;
window.saveStateToStorage = saveStateToStorage;
window.calculateSubsidyAmount = calculateSubsidyAmount;
window.getNetSystemCost = getNetSystemCost;

console.log('✅ Dashboard State Manager Loaded');
