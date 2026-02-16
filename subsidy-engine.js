// ============================================
// AUTOMATIC SUBSIDY ENGINE
// ============================================
// Central + State Government Subsidy Rules
// Auto-applies based on location & system size
// ============================================

console.log('🎁 Subsidy Engine Loading...');

/**
 * STATE SUBSIDY RULES DATABASE
 * Define state-specific subsidy policies
 */
const STATE_SUBSIDY_RULES = {
    "Gujarat": { 
        percent: 10, 
        maxAmount: 30000,
        description: "Gujarat Solar Policy 2025"
    },
    "Rajasthan": { 
        percent: 15, 
        maxAmount: 40000,
        description: "Rajasthan Renewable Energy Subsidy"
    },
    "Maharashtra": { 
        percent: 0, 
        maxAmount: 0,
        description: "No state subsidy available"
    },
    "Delhi": { 
        percent: 20, 
        maxAmount: 60000,
        description: "Delhi Solar Policy 2025"
    },
    "Karnataka": { 
        percent: 12, 
        maxAmount: 35000,
        description: "Karnataka Solar Subsidy Scheme"
    },
    "Tamil Nadu": { 
        percent: 8, 
        maxAmount: 25000,
        description: "Tamil Nadu Solar Energy Policy"
    },
    "Uttar Pradesh": { 
        percent: 10, 
        maxAmount: 30000,
        description: "UP Solar Rooftop Scheme"
    },
    "West Bengal": { 
        percent: 5, 
        maxAmount: 20000,
        description: "West Bengal Solar Subsidy"
    },
    "Punjab": { 
        percent: 15, 
        maxAmount: 45000,
        description: "Punjab Solar Power Subsidy"
    },
    "Haryana": { 
        percent: 12, 
        maxAmount: 35000,
        description: "Haryana Solar Rooftop Policy"
    },
    "Madhya Pradesh": { 
        percent: 10, 
        maxAmount: 30000,
        description: "MP Solar Subsidy Scheme"
    },
    "Telangana": { 
        percent: 8, 
        maxAmount: 25000,
        description: "Telangana Solar Policy"
    },
    "Andhra Pradesh": { 
        percent: 10, 
        maxAmount: 30000,
        description: "AP Solar Rooftop Subsidy"
    },
    "Kerala": { 
        percent: 12, 
        maxAmount: 35000,
        description: "Kerala Solar Energy Policy"
    },
    "Odisha": { 
        percent: 8, 
        maxAmount: 25000,
        description: "Odisha Solar Subsidy"
    }
};

/**
 * INDIAN STATES LIST
 * For dropdown population
 */
const INDIAN_STATES = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Delhi",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal"
];

/**
 * SUBSIDY ENGINE CLASS
 */
class SubsidyEngine {
    constructor() {
        this.centralSubsidy = 0;
        this.stateSubsidy = 0;
        this.totalSubsidy = 0;
        this.appliedRules = [];
        this.eligible = false;
        this.eligibilityReason = '';
        
        console.log('✅ Subsidy Engine initialized');
    }
    
    /**
     * Check subsidy eligibility
     * Returns eligibility status and reason
     */
    checkEligibility(installationType, systemSize, state) {
        console.log('🔍 Checking subsidy eligibility...');
        console.log(`   Installation Type: ${installationType}`);
        console.log(`   System Size: ${systemSize} kW`);
        console.log(`   State: ${state}`);
        
        // Check 1: Must be residential
        if (installationType !== 'residential') {
            this.eligible = false;
            this.eligibilityReason = 'Subsidy not available for commercial installations. Only residential rooftop systems are eligible for government subsidies.';
            console.log('❌ Not eligible: Commercial installation');
            return {
                eligible: false,
                reason: this.eligibilityReason
            };
        }
        
        // Check 2: System size must be <= 10 kW for central subsidy
        // Note: State subsidy may still apply for larger systems
        if (systemSize > 10) {
            this.eligible = false;
            this.eligibilityReason = 'Central government subsidy not applicable for systems above 10 kW. State subsidy may still apply based on state policy.';
            console.log('⚠️ Partially eligible: System > 10 kW (no central subsidy)');
            
            // Check if state has subsidy
            const stateRule = STATE_SUBSIDY_RULES[state];
            if (stateRule && stateRule.percent > 0) {
                this.eligible = true;
                this.eligibilityReason = `Central subsidy not available (system > 10 kW), but ${state} state subsidy applies.`;
                console.log('✅ Eligible for state subsidy only');
                return {
                    eligible: true,
                    reason: this.eligibilityReason,
                    partial: true
                };
            }
            
            return {
                eligible: false,
                reason: this.eligibilityReason
            };
        }
        
        // Check 3: State must have active subsidy policy
        const stateRule = STATE_SUBSIDY_RULES[state];
        const hasCentralSubsidy = systemSize <= 10;
        const hasStateSubsidy = stateRule && stateRule.percent > 0;
        
        if (!hasCentralSubsidy && !hasStateSubsidy) {
            this.eligible = false;
            this.eligibilityReason = `No subsidy available. ${state} does not have an active state subsidy policy and system exceeds central subsidy limit.`;
            console.log('❌ Not eligible: No subsidies available');
            return {
                eligible: false,
                reason: this.eligibilityReason
            };
        }
        
        // Eligible!
        this.eligible = true;
        
        if (hasCentralSubsidy && hasStateSubsidy) {
            this.eligibilityReason = `Eligible for both Central and ${state} State subsidies. Your residential rooftop system (${systemSize} kW) qualifies for government support.`;
        } else if (hasCentralSubsidy) {
            this.eligibilityReason = `Eligible for Central government subsidy. Your residential rooftop system (${systemSize} kW) qualifies. ${state} does not offer additional state subsidy.`;
        } else if (hasStateSubsidy) {
            this.eligibilityReason = `Eligible for ${state} State subsidy only. Central subsidy not available for systems above 10 kW.`;
        }
        
        console.log('✅ Eligible for subsidy');
        return {
            eligible: true,
            reason: this.eligibilityReason
        };
    }
    
    /**
     * Calculate Central Government Subsidy
     * Based on MNRE (Ministry of New and Renewable Energy) guidelines
     * 
     * Rules:
     * - Up to 3 kW: 40% subsidy
     * - 3 kW to 10 kW: 40% for first 3 kW, 20% for remaining
     * - Above 10 kW: No central subsidy
     * - Only for residential rooftop installations
     */
    calculateCentralSubsidy(systemSize, installationCost, installationType = 'residential') {
        console.log(`🏛️ Calculating Central Subsidy for ${systemSize} kW system...`);
        
        // No subsidy for commercial or systems > 10 kW
        if (installationType !== 'residential' || systemSize > 10) {
            console.log('❌ No central subsidy: System > 10 kW or non-residential');
            this.appliedRules.push({
                type: 'central',
                rule: 'No subsidy',
                reason: systemSize > 10 ? 'System size exceeds 10 kW limit' : 'Non-residential installation'
            });
            return 0;
        }
        
        let subsidyAmount = 0;
        const costPerKW = installationCost / systemSize;
        
        if (systemSize <= 3) {
            // Up to 3 kW: 40% subsidy
            subsidyAmount = installationCost * 0.40;
            this.appliedRules.push({
                type: 'central',
                rule: '40% subsidy',
                reason: `System size ${systemSize} kW ≤ 3 kW`,
                calculation: `40% of ₹${installationCost.toLocaleString('en-IN')}`
            });
            console.log(`✅ Central Subsidy (≤3 kW): 40% = ₹${subsidyAmount.toLocaleString('en-IN')}`);
        } else {
            // 3 kW to 10 kW: 40% for first 3 kW, 20% for remaining
            const first3kWCost = costPerKW * 3;
            const remainingCost = costPerKW * (systemSize - 3);
            
            const subsidy3kW = first3kWCost * 0.40;
            const subsidyRemaining = remainingCost * 0.20;
            
            subsidyAmount = subsidy3kW + subsidyRemaining;
            
            this.appliedRules.push({
                type: 'central',
                rule: '40% for first 3 kW + 20% for remaining',
                reason: `System size ${systemSize} kW (3-10 kW range)`,
                calculation: `(40% × ₹${first3kWCost.toLocaleString('en-IN')}) + (20% × ₹${remainingCost.toLocaleString('en-IN')})`
            });
            console.log(`✅ Central Subsidy (3-10 kW): ₹${subsidyAmount.toLocaleString('en-IN')}`);
        }
        
        // Ensure subsidy doesn't exceed installation cost
        if (subsidyAmount > installationCost) {
            subsidyAmount = installationCost;
            console.log('⚠️ Subsidy capped at installation cost');
        }
        
        this.centralSubsidy = Math.round(subsidyAmount);
        return this.centralSubsidy;
    }
    
    /**
     * Calculate State Government Subsidy
     * Based on state-specific policies
     */
    calculateStateSubsidy(state, installationCost) {
        console.log(`🏛️ Calculating State Subsidy for ${state}...`);
        
        // Get state rules
        const stateRule = STATE_SUBSIDY_RULES[state];
        
        if (!stateRule || stateRule.percent === 0) {
            console.log(`❌ No state subsidy available for ${state}`);
            this.appliedRules.push({
                type: 'state',
                rule: 'No subsidy',
                reason: `${state} does not offer state subsidy`
            });
            return 0;
        }
        
        // Calculate percentage-based subsidy
        let subsidyAmount = installationCost * (stateRule.percent / 100);
        
        // Apply cap
        if (subsidyAmount > stateRule.maxAmount) {
            subsidyAmount = stateRule.maxAmount;
            this.appliedRules.push({
                type: 'state',
                rule: `${stateRule.percent}% (capped)`,
                reason: stateRule.description,
                calculation: `${stateRule.percent}% of ₹${installationCost.toLocaleString('en-IN')} = ₹${(installationCost * stateRule.percent / 100).toLocaleString('en-IN')} (capped at ₹${stateRule.maxAmount.toLocaleString('en-IN')})`
            });
            console.log(`✅ State Subsidy (capped): ₹${subsidyAmount.toLocaleString('en-IN')}`);
        } else {
            this.appliedRules.push({
                type: 'state',
                rule: `${stateRule.percent}% subsidy`,
                reason: stateRule.description,
                calculation: `${stateRule.percent}% of ₹${installationCost.toLocaleString('en-IN')}`
            });
            console.log(`✅ State Subsidy: ₹${subsidyAmount.toLocaleString('en-IN')}`);
        }
        
        this.stateSubsidy = Math.round(subsidyAmount);
        return this.stateSubsidy;
    }
    
    /**
     * Calculate Total Subsidy
     * Combines central + state subsidies
     * Automatically checks eligibility first
     */
    calculateTotalSubsidy(state, systemSize, installationCost, installationType = 'residential') {
        console.log('🎁 Calculating Total Subsidy...');
        console.log(`   State: ${state}`);
        console.log(`   System Size: ${systemSize} kW`);
        console.log(`   Installation Cost: ₹${installationCost.toLocaleString('en-IN')}`);
        console.log(`   Type: ${installationType}`);
        
        // Reset
        this.centralSubsidy = 0;
        this.stateSubsidy = 0;
        this.totalSubsidy = 0;
        this.appliedRules = [];
        this.eligible = false;
        this.eligibilityReason = '';
        
        // Validate inputs
        if (!state || !systemSize || !installationCost) {
            console.error('❌ Invalid inputs for subsidy calculation');
            return {
                eligible: false,
                eligibilityReason: 'Invalid input data. Please ensure all fields are filled correctly.',
                centralSubsidy: 0,
                stateSubsidy: 0,
                totalSubsidy: 0,
                netCost: installationCost,
                appliedRules: []
            };
        }
        
        // Check eligibility first
        const eligibilityCheck = this.checkEligibility(installationType, systemSize, state);
        
        if (!eligibilityCheck.eligible) {
            console.log('❌ Not eligible for subsidy');
            return {
                eligible: false,
                eligibilityReason: eligibilityCheck.reason,
                centralSubsidy: 0,
                stateSubsidy: 0,
                totalSubsidy: 0,
                netCost: installationCost,
                appliedRules: []
            };
        }
        
        // Calculate central subsidy (if eligible)
        if (systemSize <= 10 && installationType === 'residential') {
            this.calculateCentralSubsidy(systemSize, installationCost, installationType);
        }
        
        // Calculate state subsidy (if available)
        this.calculateStateSubsidy(state, installationCost);
        
        // Total subsidy
        this.totalSubsidy = this.centralSubsidy + this.stateSubsidy;
        
        // Ensure total subsidy doesn't exceed installation cost
        if (this.totalSubsidy > installationCost) {
            console.log('⚠️ Total subsidy exceeds installation cost, capping...');
            this.totalSubsidy = installationCost;
        }
        
        // Net cost after subsidy
        const netCost = installationCost - this.totalSubsidy;
        
        console.log('✅ Subsidy Calculation Complete:');
        console.log(`   Eligible: ${this.eligible}`);
        console.log(`   Central Subsidy: ₹${this.centralSubsidy.toLocaleString('en-IN')}`);
        console.log(`   State Subsidy: ₹${this.stateSubsidy.toLocaleString('en-IN')}`);
        console.log(`   Total Subsidy: ₹${this.totalSubsidy.toLocaleString('en-IN')}`);
        console.log(`   Net Cost: ₹${netCost.toLocaleString('en-IN')}`);
        
        return {
            eligible: this.eligible,
            eligibilityReason: this.eligibilityReason,
            centralSubsidy: this.centralSubsidy,
            stateSubsidy: this.stateSubsidy,
            totalSubsidy: this.totalSubsidy,
            netCost: netCost,
            appliedRules: this.appliedRules
        };
    }
    
    /**
     * Get subsidy insights
     * Generate human-readable insights
     */
    getSubsidyInsights(subsidyData) {
        const insights = [];
        
        if (subsidyData.centralSubsidy > 0) {
            insights.push({
                icon: '🏛️',
                text: `Central subsidy reduced your cost by ₹${subsidyData.centralSubsidy.toLocaleString('en-IN')}`
            });
        } else {
            insights.push({
                icon: '❌',
                text: 'No central subsidy available for your system configuration'
            });
        }
        
        if (subsidyData.stateSubsidy > 0) {
            insights.push({
                icon: '🏛️',
                text: `State subsidy applied successfully: ₹${subsidyData.stateSubsidy.toLocaleString('en-IN')}`
            });
        }
        
        if (subsidyData.totalSubsidy > 0) {
            const savingsPercent = ((subsidyData.totalSubsidy / (subsidyData.netCost + subsidyData.totalSubsidy)) * 100).toFixed(1);
            insights.push({
                icon: '💰',
                text: `Total subsidy saved you ₹${subsidyData.totalSubsidy.toLocaleString('en-IN')} (${savingsPercent}% of installation cost)`
            });
            
            // Calculate payback reduction (rough estimate)
            const avgMonthlySavings = 8500; // Approximate
            const monthsReduced = Math.round(subsidyData.totalSubsidy / avgMonthlySavings);
            const yearsReduced = (monthsReduced / 12).toFixed(1);
            
            if (yearsReduced > 0.5) {
                insights.push({
                    icon: '⏱️',
                    text: `Subsidy reduced payback period by approximately ${yearsReduced} years`
                });
            }
        }
        
        return insights;
    }
}

// Create global instance
window.subsidyEngine = new SubsidyEngine();

// Export state list
window.INDIAN_STATES = INDIAN_STATES;
window.STATE_SUBSIDY_RULES = STATE_SUBSIDY_RULES;

console.log('✅ Subsidy Engine Loaded');
