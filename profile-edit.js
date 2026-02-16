// ============================================
// PROFILE EDIT SYSTEM
// ============================================

console.log('👤 Profile Edit System Loading...');

/**
 * Load profile data into form
 */
function loadProfileForm() {
    console.log('📝 Loading profile form...');
    
    if (!window.dashboardState) {
        console.error('❌ Dashboard state not available');
        return;
    }
    
    const { profile, loan, subsidy } = window.dashboardState;
    
    // Populate form fields
    document.getElementById('profileName').value = profile.name || '';
    document.getElementById('profileEmail').value = profile.email || '';
    document.getElementById('profilePlantName').value = profile.plantName || '';
    document.getElementById('profileSystemSize').value = profile.systemSize || '';
    
    // Populate state dropdown
    const stateSelect = document.getElementById('profileState');
    if (stateSelect && window.INDIAN_STATES) {
        stateSelect.innerHTML = '<option value="">Select State</option>';
        window.INDIAN_STATES.forEach(state => {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            if (state === profile.state) {
                option.selected = true;
            }
            stateSelect.appendChild(option);
        });
    }
    
    document.getElementById('profileCity').value = profile.city || '';
    document.getElementById('profileLocation').value = profile.location || '';
    document.getElementById('profileTariff').value = profile.tariff || '';
    document.getElementById('profileInstallationCost').value = profile.installationCost || '';
    
    // Set installation type
    const installationType = profile.installationType || 'residential';
    if (installationType === 'residential') {
        document.getElementById('installationTypeResidential').checked = true;
    } else {
        document.getElementById('installationTypeCommercial').checked = true;
    }
    
    // Set purchase type
    const purchaseType = profile.purchaseType || 'cash';
    if (purchaseType === 'cash') {
        document.getElementById('purchaseTypeCash').checked = true;
    } else {
        document.getElementById('purchaseTypeLoan').checked = true;
    }
    if (purchaseType === 'cash') {
        // Load cash purchase fields
        const cashInstallationCost = document.getElementById('cashInstallationCost');
        const cashMaintenanceCost = document.getElementById('cashMaintenanceCost');
        const cashLoanAmount = document.getElementById('cashLoanAmount');
        
        if (cashInstallationCost) cashInstallationCost.value = profile.installationCost || '';
        if (cashMaintenanceCost) cashMaintenanceCost.value = profile.maintenanceCost || '';
        if (cashLoanAmount) cashLoanAmount.value = profile.cashLoanAmount || 0;
        
        updateCashSummary();
    } else {
        // Load loan fields
        const loanInstallationCost = document.getElementById('loanInstallationCost');
        const loanDownPayment = document.getElementById('loanDownPayment');
        const loanInterestRate = document.getElementById('loanInterestRate');
        const loanTenure = document.getElementById('loanTenure');
        
        if (loanInstallationCost) loanInstallationCost.value = profile.installationCost || '';
        if (loan && loan.enabled) {
            if (loanDownPayment) loanDownPayment.value = loan.downPayment || '';
            if (loanInterestRate) loanInterestRate.value = loan.interestRate || 9.5;
            if (loanTenure) loanTenure.value = loan.tenureYears || 5;
        }
        
        calculateLoanEMI();
    }
    
    // Load purchase type specific fields
    if (purchaseType === 'cash') {
        // Load cash purchase fields
        const cashInstallationCost = document.getElementById('cashInstallationCost');
        const cashMaintenanceCost = document.getElementById('cashMaintenanceCost');
        const cashLoanAmount = document.getElementById('cashLoanAmount');
        
        if (cashInstallationCost) cashInstallationCost.value = profile.installationCost || '';
        if (cashMaintenanceCost) cashMaintenanceCost.value = profile.maintenanceCost || '';
        if (cashLoanAmount) cashLoanAmount.value = profile.cashLoanAmount || 0;
        
        updateCashSummary();
    } else {
        // Load loan fields
        const loanInstallationCost = document.getElementById('loanInstallationCost');
        const loanDownPayment = document.getElementById('loanDownPayment');
        const loanInterestRate = document.getElementById('loanInterestRate');
        const loanTenure = document.getElementById('loanTenure');
        
        if (loanInstallationCost) loanInstallationCost.value = profile.installationCost || '';
        if (loan && loan.enabled) {
            if (loanDownPayment) loanDownPayment.value = loan.downPayment || '';
            if (loanInterestRate) loanInterestRate.value = loan.interestRate || 9.5;
            if (loanTenure) loanTenure.value = loan.tenureYears || 5;
        }
        
        calculateLoanEMI();
    }
    
    // Show/hide sections based on selections
    togglePurchaseTypeSections(purchaseType);
    
    // Calculate subsidy silently (no UI update)
    calculateSubsidySilently();
    
    // Update summary
    updateProfileSummary();
    
    console.log('✅ Profile form loaded');
}

/**
 * Toggle purchase type sections (Only Loan section - Cash is automatic)
 */
function togglePurchaseTypeSections(purchaseType) {
    console.log('🔄 togglePurchaseTypeSections called with:', purchaseType);
    
    const loanSection = document.getElementById('loanPurchaseSection');
    
    console.log('Loan section found:', !!loanSection);
    
    if (purchaseType === 'loan') {
        if (loanSection) {
            loanSection.style.display = 'block';
            console.log('✅ Loan section display set to block');
        }
        console.log('💳 Loan/EMI section shown');
    } else {
        // Cash purchase - hide loan section
        if (loanSection) {
            loanSection.style.display = 'none';
            console.log('✅ Loan section display set to none');
        }
        console.log('💵 Cash Purchase selected (no additional section needed)');
    }
}

/**
 * Calculate and update loan EMI (silent - no UI update)
 * All values calculated internally and used only for ROI
 */
function calculateLoanEMI() {
    const installationCost = parseFloat(document.getElementById('loanInstallationCost')?.value) || 0;
    const downPayment = parseFloat(document.getElementById('loanDownPayment')?.value) || 0;
    const interestRate = parseFloat(document.getElementById('loanInterestRate')?.value) || 0;
    const tenureYears = parseInt(document.getElementById('loanTenure')?.value) || 0;
    
    // Get subsidy amount if eligible
    let subsidyAmount = 0;
    if (window.dashboardState && window.dashboardState.subsidy && window.dashboardState.subsidy.eligible) {
        subsidyAmount = window.dashboardState.subsidy.totalSubsidy || 0;
    }
    
    // Calculate loan amount: Installation Cost - Down Payment - Subsidy
    const loanAmount = Math.max(0, installationCost - downPayment - subsidyAmount);
    
    // Update hidden loan amount field (for internal use only)
    const loanAmountEl = document.getElementById('loanAmount');
    if (loanAmountEl) {
        loanAmountEl.value = loanAmount;
    }
    
    // Calculate EMI if all values are valid
    let monthlyEMI = 0;
    let totalInterest = 0;
    let totalPayment = 0;
    
    if (loanAmount > 0 && interestRate > 0 && tenureYears > 0) {
        const monthlyRate = interestRate / 12 / 100;
        const numPayments = tenureYears * 12;
        
        // EMI formula: P × r × (1 + r)^n / ((1 + r)^n - 1)
        const emiNumerator = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments);
        const emiDenominator = Math.pow(1 + monthlyRate, numPayments) - 1;
        monthlyEMI = emiNumerator / emiDenominator;
        
        totalPayment = monthlyEMI * numPayments;
        totalInterest = totalPayment - loanAmount;
    }
    
    // Update hidden EMI field (for internal use only)
    const emiEl = document.getElementById('loanEMI');
    if (emiEl) {
        emiEl.value = Math.round(monthlyEMI);
    }
    
    // Store in dashboard state for ROI calculations
    if (window.dashboardState) {
        window.dashboardState.loan = {
            enabled: true,
            installationCost: installationCost,
            downPayment: downPayment,
            interestRate: interestRate,
            tenureYears: tenureYears,
            loanAmount: loanAmount,
            monthlyEMI: Math.round(monthlyEMI),
            totalInterest: Math.round(totalInterest),
            totalPayment: Math.round(totalPayment),
            netSystemCost: installationCost - subsidyAmount
        };
    }
    
    console.log('💳 Loan calculated (silent):', {
        loanAmount: Math.round(loanAmount),
        monthlyEMI: Math.round(monthlyEMI),
        totalInterest: Math.round(totalInterest)
    });
    
    return {
        loanAmount: loanAmount,
        monthlyEMI: Math.round(monthlyEMI),
        totalInterest: Math.round(totalInterest),
        totalPayment: Math.round(totalPayment)
    };
}

/**
 * Update loan summary display (DEPRECATED - UI hidden)
 * Kept for backward compatibility but no longer displays in UI
 */
function updateLoanSummary(downPayment, loanAmount, monthlyEMI, totalInterest, installationCost, subsidyAmount) {
    // This function is deprecated as loan summary is now hidden from UI
    // All calculations are done silently in calculateLoanEMI()
    // Values are used directly in ROI calculations
    console.log('📝 Loan summary (internal only - not displayed in UI)');
}

/**
 * Update cash purchase summary (DEPRECATED - Cash section removed)
 */
function updateCashSummary() {
    // Cash section has been removed from UI
    // Purchase type selection is now automatic
    console.log('💵 Cash purchase selected (automatic)');
}

/**
 * Calculate subsidy silently (no UI update)
 * Subsidy is calculated in background and used only for ROI/EMI
 */
function calculateSubsidySilently() {
    if (!window.dashboardState || !window.subsidyEngine) {
        console.log('⚠️ Dashboard state or subsidy engine not available');
        return;
    }
    
    const { profile } = window.dashboardState;
    
    // Get values from form
    const state = document.getElementById('profileState')?.value || profile.state || 'Gujarat';
    const systemSize = parseFloat(document.getElementById('profileSystemSize')?.value) || profile.systemSize || 10;
    const installationCost = parseFloat(document.getElementById('profileInstallationCost')?.value) || profile.installationCost || 500000;
    const installationType = document.querySelector('input[name="installationType"]:checked')?.value || profile.installationType || 'residential';
    
    // Calculate subsidy (includes eligibility check)
    const result = window.subsidyEngine.calculateTotalSubsidy(
        state,
        systemSize,
        installationCost,
        installationType
    );
    
    // Store in dashboard state (no UI update)
    window.dashboardState.subsidy = {
        eligible: result.eligible,
        eligibilityReason: result.eligibilityReason,
        centralSubsidy: result.centralSubsidy,
        stateSubsidy: result.stateSubsidy,
        totalSubsidy: result.totalSubsidy,
        netCost: result.netCost,
        appliedRules: result.appliedRules,
        autoApply: true
    };
    
    console.log('🎁 Subsidy calculated (silent):', {
        eligible: result.eligible,
        totalSubsidy: result.totalSubsidy,
        netCost: result.netCost
    });
}

/**
 * Update profile summary display
 */
function updateProfileSummary() {
    if (!window.dashboardState) return;
    
    const { profile, subsidy } = window.dashboardState;
    
    // Update summary fields
    const summaryName = document.getElementById('summaryName');
    if (summaryName) summaryName.textContent = profile.name;
    
    const summaryEmail = document.getElementById('summaryEmail');
    if (summaryEmail) summaryEmail.textContent = profile.email;
    
    const summaryPlantName = document.getElementById('summaryPlantName');
    if (summaryPlantName) summaryPlantName.textContent = profile.plantName;
    
    const summarySystemSize = document.getElementById('summarySystemSize');
    if (summarySystemSize) summarySystemSize.textContent = `${profile.systemSize} kW`;
    
    const summaryState = document.getElementById('summaryState');
    if (summaryState) summaryState.textContent = profile.state || 'Not set';
    
    const summaryCity = document.getElementById('summaryCity');
    if (summaryCity) summaryCity.textContent = profile.city || 'Not set';
    
    const summaryLocation = document.getElementById('summaryLocation');
    if (summaryLocation) summaryLocation.textContent = profile.location;
    
    const summaryTariff = document.getElementById('summaryTariff');
    if (summaryTariff) summaryTariff.textContent = `₹${profile.tariff}/kWh`;
    
    const summaryInstallationCost = document.getElementById('summaryInstallationCost');
    if (summaryInstallationCost) {
        summaryInstallationCost.textContent = `₹${(profile.installationCost || 0).toLocaleString('en-IN')}`;
    }
    
    // Update purchase type
    const summaryPurchaseType = document.getElementById('summaryPurchaseType');
    if (summaryPurchaseType) {
        const purchaseType = profile.purchaseType || 'cash';
        summaryPurchaseType.textContent = purchaseType === 'cash' ? '💵 Cash Purchase' : '💳 Loan / EMI';
    }
    
    // Update subsidy information (automatic - always show if eligible)
    const subsidyRow = document.getElementById('summarySubsidyRow');
    const stateSubsidyRow = document.getElementById('summaryStateSubsidyRow');
    const totalSubsidyRow = document.getElementById('summaryTotalSubsidyRow');
    const summaryCentralSubsidy = document.getElementById('summaryCentralSubsidy');
    const summaryStateSubsidy = document.getElementById('summaryStateSubsidy');
    const summaryTotalSubsidy = document.getElementById('summaryTotalSubsidy');
    const netCostRow = document.getElementById('summaryNetCostRow');
    const summaryNetCost = document.getElementById('summaryNetCost');
    
    if (subsidy && subsidy.eligible && subsidy.totalSubsidy > 0) {
        // Show subsidy rows
        if (subsidyRow) subsidyRow.style.display = 'flex';
        if (stateSubsidyRow) stateSubsidyRow.style.display = 'flex';
        if (totalSubsidyRow) totalSubsidyRow.style.display = 'flex';
        
        if (summaryCentralSubsidy) {
            summaryCentralSubsidy.textContent = `₹${(subsidy.centralSubsidy || 0).toLocaleString('en-IN')}`;
        }
        
        if (summaryStateSubsidy) {
            summaryStateSubsidy.textContent = `₹${(subsidy.stateSubsidy || 0).toLocaleString('en-IN')}`;
        }
        
        if (summaryTotalSubsidy) {
            summaryTotalSubsidy.textContent = `🎁 ₹${(subsidy.totalSubsidy || 0).toLocaleString('en-IN')}`;
        }
        
        // Show net cost row
        if (netCostRow) netCostRow.style.display = 'flex';
        if (summaryNetCost) {
            summaryNetCost.textContent = `₹${(subsidy.netCost || profile.installationCost).toLocaleString('en-IN')}`;
        }
    } else {
        // Hide subsidy and net cost rows when not eligible
        if (subsidyRow) subsidyRow.style.display = 'none';
        if (stateSubsidyRow) stateSubsidyRow.style.display = 'none';
        if (totalSubsidyRow) totalSubsidyRow.style.display = 'none';
        if (netCostRow) netCostRow.style.display = 'none';
    }
}

/**
 * Handle profile form submission
 */
function handleProfileSubmit(event) {
    event.preventDefault();
    
    console.log('💾 Saving profile...');
    
    // Get purchase type
    const purchaseType = document.querySelector('input[name="purchaseType"]:checked').value;
    
    // Get installation type
    const installationType = document.querySelector('input[name="installationType"]:checked')?.value || 'residential';
    
    // Get form values based on purchase type
    let installationCost = 0;
    let maintenanceCost = 0;
    let cashLoanAmount = 0;
    
    if (purchaseType === 'cash') {
        installationCost = parseFloat(document.getElementById('cashInstallationCost').value);
        maintenanceCost = parseFloat(document.getElementById('cashMaintenanceCost').value) || 0;
        cashLoanAmount = parseFloat(document.getElementById('cashLoanAmount').value) || 0;
    } else {
        installationCost = parseFloat(document.getElementById('loanInstallationCost').value);
    }
    
    // Get form values
    const newProfile = {
        name: document.getElementById('profileName').value.trim(),
        email: document.getElementById('profileEmail').value.trim(),
        plantName: document.getElementById('profilePlantName').value.trim(),
        systemSize: parseFloat(document.getElementById('profileSystemSize').value),
        state: document.getElementById('profileState').value,
        city: document.getElementById('profileCity').value.trim(),
        location: document.getElementById('profileLocation').value.trim(),
        tariff: parseFloat(document.getElementById('profileTariff').value),
        installationCost: installationCost,
        maintenanceCost: maintenanceCost,
        cashLoanAmount: cashLoanAmount,
        installationType: installationType,
        purchaseType: purchaseType
    };
    
    // Validate
    if (!newProfile.name) {
        alert('Please enter your name');
        return;
    }
    
    if (!newProfile.email) {
        alert('Please enter your email');
        return;
    }
    
    if (!newProfile.plantName) {
        alert('Please enter plant name');
        return;
    }
    
    if (!newProfile.systemSize || newProfile.systemSize <= 0) {
        alert('Please enter a valid system size');
        return;
    }
    
    if (!newProfile.state) {
        alert('Please select a state');
        return;
    }
    
    if (!newProfile.city) {
        alert('Please enter a city');
        return;
    }
    
    if (!newProfile.location) {
        alert('Please enter location');
        return;
    }
    
    if (!newProfile.tariff || newProfile.tariff <= 0) {
        alert('Please enter a valid tariff rate');
        return;
    }
    
    if (!newProfile.installationCost || newProfile.installationCost <= 0) {
        alert('Please enter a valid installation cost');
        return;
    }
    
    // Get loan configuration if loan is selected
    let loanConfig = {
        enabled: false,
        loanAmount: 0,
        downPayment: 0,
        interestRate: 0,
        tenureYears: 0,
        monthlyEMI: 0
    };
    
    if (purchaseType === 'loan') {
        const downPayment = parseFloat(document.getElementById('loanDownPayment').value) || 0;
        const interestRate = parseFloat(document.getElementById('loanInterestRate').value) || 0;
        const tenureYears = parseInt(document.getElementById('loanTenure').value) || 0;
        const loanAmount = parseFloat(document.getElementById('loanAmount').value) || 0;
        const monthlyEMI = parseFloat(document.getElementById('loanEMI').value) || 0;
        
        // Validate loan fields
        if (downPayment < 0) {
            alert('Please enter a valid down payment');
            return;
        }
        
        if (downPayment >= installationCost) {
            alert('Down payment must be less than installation cost');
            return;
        }
        
        if (interestRate <= 0 || interestRate > 20) {
            alert('Please enter a valid interest rate (0.1% - 20%)');
            return;
        }
        
        if (tenureYears <= 0 || tenureYears > 25) {
            alert('Please enter a valid loan tenure (1-25 years)');
            return;
        }
        
        loanConfig = {
            enabled: true,
            loanAmount: loanAmount,
            downPayment: downPayment,
            interestRate: interestRate,
            tenureYears: tenureYears,
            monthlyEMI: monthlyEMI
        };
        
        console.log('💳 Loan configuration:', loanConfig);
    } else {
        console.log('💵 Cash purchase selected');
    }
    
    // Update profile using global function
    if (window.updateProfile) {
        const success = window.updateProfile(newProfile);
        
        if (success) {
            // Update loan configuration in state
            window.dashboardState.loan = loanConfig;
            
            // Recalculate subsidy (automatic - always runs)
            if (window.calculateSubsidyAmount) {
                window.calculateSubsidyAmount();
            }
            
            // ============================================
            // TRIGGER ROI RECALCULATION (CRITICAL!)
            // ============================================
            // ROI must recalculate when subsidy changes
            if (window.roiForecastEngine) {
                console.log('🔄 Triggering ROI recalculation from subsidy change...');
                window.roiForecastEngine.recalculate();
            }
            
            // ============================================
            // SYNC TO ADMIN STORE (TASK 12)
            // ============================================
            // Save user data to admin store for admin access
            if (window.syncDashboardStateToStore) {
                window.syncDashboardStateToStore();
                console.log('🔄 Profile synced to admin store');
            }
            
            // Save to localStorage
            if (window.saveStateToStorage) {
                window.saveStateToStorage();
            }
            
            // Update loan calculator if available
            if (window.loanEMICalculator && loanConfig.enabled) {
                window.loanEMICalculator.updateLoanConfig(loanConfig);
            }
            
            // Update summary
            updateProfileSummary();
            
            // Show success toast
            if (window.showToast) {
                window.showToast('✅ Profile updated successfully!');
            }
            
            console.log('✅ Profile saved successfully');
        } else {
            alert('Failed to update profile. Please check the console for errors.');
        }
    } else {
        console.error('❌ updateProfile function not available');
        alert('Profile update function not available');
    }
}

/**
 * Initialize profile edit system
 */
function initProfileEdit() {
    console.log('🚀 Initializing profile edit system...');
    
    // Wait for dashboard state to be ready
    const checkState = setInterval(() => {
        if (window.dashboardState) {
            clearInterval(checkState);
            
            // Load profile form
            loadProfileForm();
            
            // Attach form submit handler
            const profileForm = document.getElementById('profileForm');
            if (profileForm) {
                profileForm.addEventListener('submit', handleProfileSubmit);
                console.log('✅ Profile form submit handler attached');
            }
            
            // Attach purchase type change handlers
            const cashRadio = document.getElementById('purchaseTypeCash');
            const loanRadio = document.getElementById('purchaseTypeLoan');
            
            console.log('Purchase type radios found:', {
                cashRadio: !!cashRadio,
                loanRadio: !!loanRadio
            });
            
            if (cashRadio) {
                cashRadio.addEventListener('change', function() {
                    console.log('💵 Cash radio changed, checked:', this.checked);
                    if (this.checked) {
                        togglePurchaseTypeSections('cash');
                        updateCashSummary();
                        console.log('� Switched to Cash Purchase');
                    }
                });
                console.log('✅ Cash radio event listener attached');
            }
            
            if (loanRadio) {
                loanRadio.addEventListener('change', function() {
                    console.log('💳 Loan radio changed, checked:', this.checked);
                    if (this.checked) {
                        togglePurchaseTypeSections('loan');
                        calculateLoanEMI();
                        console.log('💳 Switched to Loan/EMI');
                    }
                });
                console.log('✅ Loan radio event listener attached');
            }
            
            // Attach real-time update handlers for Cash Purchase
            const cashInstallationCost = document.getElementById('cashInstallationCost');
            const cashMaintenanceCost = document.getElementById('cashMaintenanceCost');
            const cashLoanAmount = document.getElementById('cashLoanAmount');
            
            if (cashInstallationCost) {
                cashInstallationCost.addEventListener('input', function() {
                    // Update profile installation cost
                    if (window.dashboardState) {
                        window.dashboardState.profile.installationCost = parseFloat(this.value) || 0;
                    }
                    updateCashSummary();
                    calculateSubsidySilently();
                });
            }
            
            if (cashMaintenanceCost) {
                cashMaintenanceCost.addEventListener('input', function() {
                    if (window.dashboardState) {
                        window.dashboardState.profile.maintenanceCost = parseFloat(this.value) || 0;
                    }
                });
            }
            
            if (cashLoanAmount) {
                cashLoanAmount.addEventListener('input', function() {
                    updateCashSummary();
                });
            }
            
            // Attach real-time update handlers for Loan Purchase
            const loanInstallationCost = document.getElementById('loanInstallationCost');
            const loanDownPayment = document.getElementById('loanDownPayment');
            const loanInterestRate = document.getElementById('loanInterestRate');
            const loanTenure = document.getElementById('loanTenure');
            
            if (loanInstallationCost) {
                loanInstallationCost.addEventListener('input', function() {
                    // Update profile installation cost
                    if (window.dashboardState) {
                        window.dashboardState.profile.installationCost = parseFloat(this.value) || 0;
                    }
                    calculateLoanEMI();
                    calculateSubsidySilently();
                });
            }
            
            if (loanDownPayment) {
                loanDownPayment.addEventListener('input', function() {
                    calculateLoanEMI();
                });
            }
            
            if (loanInterestRate) {
                loanInterestRate.addEventListener('input', function() {
                    calculateLoanEMI();
                });
            }
            
            if (loanTenure) {
                loanTenure.addEventListener('input', function() {
                    calculateLoanEMI();
                });
            }
            
            // Attach auto-recalculation handlers for subsidy (automatic)
            const stateSelect = document.getElementById('profileState');
            const systemSizeInput = document.getElementById('profileSystemSize');
            const installationCostInput = document.getElementById('profileInstallationCost');
            const installationTypeRadios = document.querySelectorAll('input[name="installationType"]');
            
            if (stateSelect) {
                stateSelect.addEventListener('change', function() {
                    console.log('📍 State changed:', this.value);
                    calculateSubsidySilently();
                });
            }
            
            if (systemSizeInput) {
                systemSizeInput.addEventListener('input', function() {
                    calculateSubsidySilently();
                });
            }
            
            if (installationCostInput) {
                installationCostInput.addEventListener('input', function() {
                    calculateSubsidySilently();
                });
            }
            
            installationTypeRadios.forEach(radio => {
                radio.addEventListener('change', function() {
                    console.log('🏠 Installation type changed:', this.value);
                    calculateSubsidySilently();
                });
            });
            
            console.log('✅ Profile edit system initialized');
        }
    }, 100);
    
    // Timeout after 5 seconds
    setTimeout(() => {
        clearInterval(checkState);
    }, 5000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfileEdit);
} else {
    initProfileEdit();
}

// Export functions
window.loadProfileForm = loadProfileForm;
window.updateProfileSummary = updateProfileSummary;
window.calculateSubsidySilently = calculateSubsidySilently;
window.togglePurchaseTypeSections = togglePurchaseTypeSections;
window.calculateLoanEMI = calculateLoanEMI;
window.updateCashSummary = updateCashSummary;

console.log('✅ Profile Edit System Loaded');
