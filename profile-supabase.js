// ============================================
// PROFILE SUPABASE INTEGRATION
// Connects Profile section to Supabase backend
// ============================================

console.log('💾 Profile Supabase Integration Loading...');

/**
 * ============================================
 * INITIALIZATION
 * ============================================
 */

/**
 * Initialize Profile Page
 * Called when dashboard loads
 */
async function initializeProfilePage() {
    console.log('🚀 Initializing Profile page...');
    
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
        console.error('❌ User not authenticated');
        redirectToLogin();
        return;
    }
    
    console.log('✅ User authenticated:', user.email);
    
    // Load profile data from Supabase
    await loadProfileFromSupabase();
    
    // Setup form event listeners
    setupProfileFormListeners();
    
    console.log('✅ Profile page initialized');
}

/**
 * ============================================
 * USER AUTHENTICATION
 * ============================================
 */

/**
 * Get Current Authenticated User
 * @returns {Promise<Object|null>} User object or null
 */
async function getCurrentUser() {
    if (!window.supabaseAuth || !window.supabaseAuth.isAvailable()) {
        console.warn('⚠️ Supabase not available, using demo mode');
        // Return demo user for testing
        return {
            id: 'demo-user-id',
            email: 'demo@example.com',
            role: 'customer'
        };
    }
    
    try {
        const user = await window.supabaseAuth.getCurrentUser();
        return user;
    } catch (error) {
        console.error('❌ Error getting current user:', error);
        return null;
    }
}

/**
 * Redirect to Login Page
 */
function redirectToLogin() {
    console.log('🔄 Redirecting to login...');
    window.location.href = 'login.html';
}

/**
 * ============================================
 * LOAD PROFILE FROM SUPABASE
 * ============================================
 */

/**
 * Load User Profile from Supabase
 * Fetches profile data and populates form fields
 */
async function loadProfileFromSupabase() {
    console.log('📥 Loading profile from Supabase...');
    
    try {
        // Get current user
        const user = await getCurrentUser();
        if (!user) {
            console.error('❌ No user found');
            return;
        }
        
        // Fetch profile from Supabase
        let profile = null;
        
        if (window.supabaseBackend && window.supabaseBackend.getUserProfile) {
            profile = await window.supabaseBackend.getUserProfile();
        }
        
        if (profile) {
            console.log('✅ Profile loaded from Supabase');
            populateProfileForm(profile);
        } else {
            console.log('ℹ️ No profile found, showing empty form');
            // Show empty form for new profile
            populateProfileForm({});
        }
    } catch (error) {
        console.error('❌ Error loading profile:', error);
        showNotification('Failed to load profile data', 'error');
    }
}

/**
 * Populate Profile Form with Data
 * @param {Object} profile - Profile data object
 */
function populateProfileForm(profile) {
    console.log('📝 Populating profile form...');
    
    // Basic Information
    setInputValue('profileName', profile.name);
    setInputValue('profileEmail', profile.email);
    setInputValue('profilePhone', profile.phone);
    
    // Location
    setInputValue('profileState', profile.state);
    setInputValue('profileCity', profile.city);
    setInputValue('profileAddress', profile.address);
    
    // System Details
    setInputValue('profilePlantName', profile.plant_name);
    setInputValue('profileSystemSize', profile.system_size);
    
    // Installation Type
    const installationType = profile.installation_type || 'rooftop';
    setRadioValue('installationType', installationType);
    
    // Purchase Type
    const purchaseType = profile.purchase_type || 'cash';
    setRadioValue('purchaseType', purchaseType);
    
    // Financial
    setInputValue('profileTariff', profile.tariff);
    
    // Loan Details (if purchase type is loan)
    if (purchaseType === 'loan') {
        setInputValue('loanAmount', profile.loan_amount);
        setInputValue('loanTenure', profile.loan_tenure);
        setInputValue('loanInterestRate', profile.interest_rate);
    }
    
    console.log('✅ Profile form populated');
}

/**
 * Helper: Set Input Value
 * @param {string} id - Input element ID
 * @param {any} value - Value to set
 */
function setInputValue(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.value = value || '';
    }
}

/**
 * Helper: Set Radio Button Value
 * @param {string} name - Radio group name
 * @param {string} value - Value to select
 */
function setRadioValue(name, value) {
    const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (radio) {
        radio.checked = true;
    }
}

/**
 * ============================================
 * SAVE PROFILE TO SUPABASE
 * ============================================
 */

/**
 * Save Profile to Supabase
 * Collects form data and saves to database
 */
async function saveProfileToSupabase() {
    console.log('💾 Saving profile to Supabase...');
    
    try {
        // Get current user
        const user = await getCurrentUser();
        if (!user) {
            showNotification('Please login to save profile', 'error');
            return;
        }
        
        // Collect form data
        const profileData = collectProfileFormData();
        
        // Validate required fields
        if (!validateProfileData(profileData)) {
            return;
        }
        
        // Save to Supabase
        let result = null;
        
        if (window.supabaseBackend && window.supabaseBackend.updateUserProfile) {
            // Try to update existing profile
            result = await window.supabaseBackend.updateUserProfile(profileData);
            
            // If update fails (no profile exists), create new profile
            if (!result.success && window.supabaseBackend.createUserProfile) {
                console.log('ℹ️ Profile not found, creating new profile...');
                result = await window.supabaseBackend.createUserProfile(profileData);
            }
        }
        
        if (result && result.success) {
            console.log('✅ Profile saved successfully');
            showNotification('Profile updated successfully. Calculations refreshed.', 'success');
            
            // Trigger ROI recalculation
            await recalculateROI(profileData);
            
            // Update dashboard state if available
            if (window.updateDashboardFromProfile) {
                window.updateDashboardFromProfile();
            }
        } else {
            throw new Error(result?.error || 'Failed to save profile');
        }
    } catch (error) {
        console.error('❌ Error saving profile:', error);
        showNotification('Failed to save profile: ' + error.message, 'error');
    }
}

/**
 * Collect Profile Form Data
 * @returns {Object} Profile data object
 */
function collectProfileFormData() {
    const data = {
        // Basic Information
        name: getInputValue('profileName'),
        email: getInputValue('profileEmail'),
        phone: getInputValue('profilePhone'),
        
        // Location
        state: getInputValue('profileState'),
        city: getInputValue('profileCity'),
        address: getInputValue('profileAddress'),
        
        // System Details
        plant_name: getInputValue('profilePlantName'),
        system_size: parseFloat(getInputValue('profileSystemSize')) || 0,
        
        // Installation Type
        installation_type: getRadioValue('installationType') || 'rooftop',
        
        // Purchase Type
        purchase_type: getRadioValue('purchaseType') || 'cash',
        
        // Financial
        tariff: parseFloat(getInputValue('profileTariff')) || 0
    };
    
    // Add loan details if purchase type is loan
    if (data.purchase_type === 'loan') {
        data.loan_amount = parseFloat(getInputValue('loanAmount')) || 0;
        data.loan_tenure = parseInt(getInputValue('loanTenure')) || 0;
        data.interest_rate = parseFloat(getInputValue('loanInterestRate')) || 0;
    }
    
    console.log('📋 Collected profile data:', data);
    return data;
}

/**
 * Helper: Get Input Value
 * @param {string} id - Input element ID
 * @returns {string} Input value
 */
function getInputValue(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : '';
}

/**
 * Helper: Get Radio Button Value
 * @param {string} name - Radio group name
 * @returns {string} Selected value
 */
function getRadioValue(name) {
    const radio = document.querySelector(`input[name="${name}"]:checked`);
    return radio ? radio.value : '';
}

/**
 * Validate Profile Data
 * @param {Object} data - Profile data
 * @returns {boolean} True if valid
 */
function validateProfileData(data) {
    // Required fields
    if (!data.name) {
        showNotification('Please enter your name', 'error');
        return false;
    }
    
    if (!data.city) {
        showNotification('Please enter your city', 'error');
        return false;
    }
    
    if (!data.system_size || data.system_size <= 0) {
        showNotification('Please enter a valid system size', 'error');
        return false;
    }
    
    if (!data.tariff || data.tariff <= 0) {
        showNotification('Please enter a valid electricity tariff', 'error');
        return false;
    }
    
    // Validate loan fields if purchase type is loan
    if (data.purchase_type === 'loan') {
        if (!data.loan_amount || data.loan_amount <= 0) {
            showNotification('Please enter a valid loan amount', 'error');
            return false;
        }
        
        if (!data.loan_tenure || data.loan_tenure <= 0) {
            showNotification('Please enter a valid loan tenure', 'error');
            return false;
        }
        
        if (!data.interest_rate || data.interest_rate <= 0) {
            showNotification('Please enter a valid interest rate', 'error');
            return false;
        }
    }
    
    return true;
}

/**
 * ============================================
 * ROI RECALCULATION
 * ============================================
 */

/**
 * Recalculate ROI Based on Profile Data
 * @param {Object} profileData - Profile data
 */
async function recalculateROI(profileData) {
    console.log('🔄 Recalculating ROI...');
    
    try {
        // Calculate ROI metrics
        const roiData = calculateROIMetrics(profileData);
        
        // Save ROI to Supabase
        if (window.supabaseBackend && window.supabaseBackend.saveUserROI) {
            const result = await window.supabaseBackend.saveUserROI(roiData);
            
            if (result.success) {
                console.log('✅ ROI data saved to Supabase');
            } else {
                console.warn('⚠️ Failed to save ROI data:', result.error);
            }
        }
    } catch (error) {
        console.error('❌ Error recalculating ROI:', error);
    }
}

/**
 * Calculate ROI Metrics
 * @param {Object} profileData - Profile data
 * @returns {Object} ROI metrics
 */
function calculateROIMetrics(profileData) {
    const systemSize = profileData.system_size || 0;
    const tariff = profileData.tariff || 0;
    
    // Estimate annual generation (kWh)
    // Assuming 4-5 sun hours per day on average
    const annualGeneration = systemSize * 4.5 * 365;
    
    // Estimate annual savings
    const annualSavings = annualGeneration * tariff;
    
    // Estimate installation cost (₹50,000 per kW)
    const installationCost = systemSize * 50000;
    
    // Calculate total investment
    let totalInvestment = installationCost;
    if (profileData.purchase_type === 'loan') {
        // Add interest cost for loan
        const loanAmount = profileData.loan_amount || installationCost;
        const interestRate = (profileData.interest_rate || 9.5) / 100;
        const tenure = profileData.loan_tenure || 5;
        const totalInterest = loanAmount * interestRate * tenure;
        totalInvestment = installationCost + totalInterest;
    }
    
    // Calculate payback period
    const paybackYears = totalInvestment / annualSavings;
    
    // Calculate ROI percentage
    const roiPercent = (annualSavings / totalInvestment) * 100;
    
    // Calculate 25-year net profit
    const maintenanceCostAnnual = systemSize * 1000; // ₹1000 per kW per year
    const totalMaintenanceCost = maintenanceCostAnnual * 25;
    const totalSavings25Years = annualSavings * 25;
    const netProfit25Years = totalSavings25Years - totalInvestment - totalMaintenanceCost;
    
    return {
        annual_savings: Math.round(annualSavings),
        roi_percent: Math.round(roiPercent * 100) / 100,
        payback_years: Math.round(paybackYears * 100) / 100,
        net_profit_25_years: Math.round(netProfit25Years),
        annual_generation: Math.round(annualGeneration),
        total_investment: Math.round(totalInvestment),
        installation_cost: Math.round(installationCost),
        maintenance_cost_annual: Math.round(maintenanceCostAnnual)
    };
}

/**
 * ============================================
 * FORM EVENT LISTENERS
 * ============================================
 */

/**
 * Setup Profile Form Event Listeners
 */
function setupProfileFormListeners() {
    console.log('🎧 Setting up form listeners...');
    
    // Save Profile button
    const saveBtn = document.getElementById('saveProfileBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await saveProfileToSupabase();
        });
    }
    
    // Purchase type change
    const purchaseTypeRadios = document.querySelectorAll('input[name="purchaseType"]');
    purchaseTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            togglePurchaseTypeFields();
        });
    });
    
    // System size change - trigger real-time calculation preview
    const systemSizeInput = document.getElementById('profileSystemSize');
    if (systemSizeInput) {
        systemSizeInput.addEventListener('input', () => {
            updateCalculationPreview();
        });
    }
    
    // Tariff change - trigger real-time calculation preview
    const tariffInput = document.getElementById('profileTariff');
    if (tariffInput) {
        tariffInput.addEventListener('input', () => {
            updateCalculationPreview();
        });
    }
    
    console.log('✅ Form listeners setup complete');
}

/**
 * Toggle Purchase Type Fields
 * Show/hide loan fields based on purchase type
 */
function togglePurchaseTypeFields() {
    const purchaseType = getRadioValue('purchaseType');
    
    const loanFields = document.getElementById('loanFields');
    if (loanFields) {
        loanFields.style.display = purchaseType === 'loan' ? 'block' : 'none';
    }
}

/**
 * Update Calculation Preview
 * Show real-time preview of ROI calculations
 */
function updateCalculationPreview() {
    const systemSize = parseFloat(getInputValue('profileSystemSize')) || 0;
    const tariff = parseFloat(getInputValue('profileTariff')) || 0;
    
    if (systemSize > 0 && tariff > 0) {
        const annualGeneration = systemSize * 4.5 * 365;
        const annualSavings = annualGeneration * tariff;
        const estimatedCost = systemSize * 50000;
        
        // Update preview elements if they exist
        const previewElement = document.getElementById('calculationPreview');
        if (previewElement) {
            previewElement.innerHTML = `
                <div class="preview-card">
                    <h4>Quick Preview</h4>
                    <p>Annual Generation: <strong>${Math.round(annualGeneration)} kWh</strong></p>
                    <p>Annual Savings: <strong>₹${Math.round(annualSavings).toLocaleString('en-IN')}</strong></p>
                    <p>Estimated Cost: <strong>₹${Math.round(estimatedCost).toLocaleString('en-IN')}</strong></p>
                </div>
            `;
        }
    }
}

/**
 * ============================================
 * NOTIFICATIONS
 * ============================================
 */

/**
 * Show Notification Message
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success/error/info)
 */
function showNotification(message, type = 'info') {
    console.log(`📢 Notification (${type}): ${message}`);
    
    // Use existing toast notification if available
    if (window.showToast) {
        window.showToast(message);
        return;
    }
    
    // Fallback to alert
    alert(message);
}

/**
 * ============================================
 * EXPORT FUNCTIONS
 * ============================================
 */

// Export functions for global use
window.profileSupabase = {
    initializeProfilePage,
    loadProfileFromSupabase,
    saveProfileToSupabase,
    getCurrentUser
};

console.log('✅ Profile Supabase Integration Loaded');

// Auto-initialize if on profile page
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the profile section
    const profileSection = document.getElementById('profile');
    if (profileSection) {
        console.log('📍 Profile section detected, initializing...');
        // Wait a bit for other scripts to load
        setTimeout(() => {
            initializeProfilePage();
        }, 500);
    }
});
