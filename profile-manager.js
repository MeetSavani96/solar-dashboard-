// ============================================
// USER PROFILE MANAGEMENT SYSTEM
// ============================================

/**
 * Profile Manager - Centralized user profile and dashboard state management
 * All dashboard sections read data from this centralized state
 */
const ProfileManager = {
    // Centralized Dashboard State
    dashboardState: {
        userProfile: null,
        plantData: null,
        chartsData: null,
        maintenanceData: null,
        financeData: null
    },

    // Mock User Profiles (Replace with Supabase data later)
    mockProfiles: {
        admin: {
            userId: 'admin-001',
            name: 'Rajesh Kumar',
            email: 'rajesh@akvenergy.com',
            phone: '+91 98765 43210',
            role: 'admin',
            plantId: 'plant-001',
            plantName: 'AKVENERGY HQ Solar Plant',
            systemSize: 15,
            location: {
                city: 'Mumbai',
                state: 'Maharashtra',
                address: '123 Solar Street, Andheri'
            },
            installationDate: '2020-03-15',
            tariffPerUnit: 8.5,
            profilePhoto: null,
            permissions: ['view_all', 'edit_all', 'switch_profiles']
        },
        operator: {
            userId: 'operator-001',
            name: 'Priya Sharma',
            email: 'priya@akvenergy.com',
            phone: '+91 98765 43211',
            role: 'operator',
            plantId: 'plant-002',
            plantName: 'Commercial Solar Plant - Pune',
            systemSize: 25,
            location: {
                city: 'Pune',
                state: 'Maharashtra',
                address: '456 Industrial Area, Hinjewadi'
            },
            installationDate: '2021-06-20',
            tariffPerUnit: 7.8,
            profilePhoto: null,
            permissions: ['view_limited', 'edit_limited']
        },
        customer: {
            userId: 'customer-001',
            name: 'Amit Patel',
            email: 'amit.patel@gmail.com',
            phone: '+91 98765 43212',
            role: 'customer',
            plantId: 'plant-003',
            plantName: 'Residential Solar System',
            systemSize: 10,
            location: {
                city: 'Ahmedabad',
                state: 'Gujarat',
                address: '789 Green Colony, Satellite'
            },
            installationDate: '2022-01-10',
            tariffPerUnit: 9.2,
            profilePhoto: null,
            permissions: ['view_own']
        }
    },

    /**
     * Initialize Profile Manager
     */
    init() {
        console.log('👤 Profile Manager initialized');
        
        // Load profile from localStorage or use default
        this.loadProfile();
        
        // Setup profile switcher (for admin)
        this.setupProfileSwitcher();
        
        // Update dashboard with profile data
        this.updateDashboardFromProfile();
    },

    /**
     * Load user profile from localStorage or use default
     */
    loadProfile() {
        try {
            const savedProfile = localStorage.getItem('userProfile');
            if (savedProfile) {
                this.dashboardState.userProfile = JSON.parse(savedProfile);
                console.log('✅ Profile loaded from localStorage:', this.dashboardState.userProfile.name);
            } else {
                // Default to customer profile
                this.setProfile('customer');
            }
        } catch (e) {
            console.warn('⚠️ Could not load profile, using default');
            this.setProfile('customer');
        }
    },

    /**
     * Set active profile
     * @param {string} profileKey - Profile key (admin, operator, customer)
     */
    setProfile(profileKey) {
        if (!this.mockProfiles[profileKey]) {
            console.error('❌ Invalid profile key:', profileKey);
            return;
        }
        
        this.dashboardState.userProfile = { ...this.mockProfiles[profileKey] };
        
        // Generate plant data based on profile
        this.generatePlantData();
        
        // Save to localStorage
        this.saveProfile();
        
        console.log('✅ Profile set:', this.dashboardState.userProfile.name);
        console.log('📊 Role:', this.dashboardState.userProfile.role);
    },

    /**
     * Save profile to localStorage
     */
    saveProfile() {
        try {
            localStorage.setItem('userProfile', JSON.stringify(this.dashboardState.userProfile));
        } catch (e) {
            console.warn('⚠️ Could not save profile');
        }
    },

    /**
     * Update profile data
     * @param {Object} updates - Profile fields to update
     */
    updateProfile(updates) {
        if (!this.dashboardState.userProfile) return;
        
        // Merge updates
        this.dashboardState.userProfile = {
            ...this.dashboardState.userProfile,
            ...updates
        };
        
        // Save to localStorage
        this.saveProfile();
        
        // Update dashboard
        this.updateDashboardFromProfile();
        
        // Show toast notification
        this.showToast('Profile updated successfully!');
        
        console.log('✅ Profile updated:', updates);
    },

    /**
     * Generate plant data based on user profile
     */
    generatePlantData() {
        const profile = this.dashboardState.userProfile;
        if (!profile) return;
        
        // Generate realistic data based on system size
        const systemSize = profile.systemSize;
        const tariff = profile.tariffPerUnit;
        
        this.dashboardState.plantData = {
            capacity: systemSize,
            totalYield: Math.round(systemSize * 1420), // ~1420 kWh per kW per year
            consumption: Math.round(systemSize * 25), // Monthly consumption
            livePower: (systemSize * 10.09).toFixed(1), // Current power
            powerChange: 12,
            panels: this.generatePanelData(systemSize)
        };
        
        this.dashboardState.chartsData = {
            monthlyGeneration: this.generateMonthlyData(systemSize),
            energyProduced: this.generateEnergyData(systemSize, 'produced'),
            energyConsumed: this.generateEnergyData(systemSize, 'consumed')
        };
        
        this.dashboardState.maintenanceData = {
            mode: profile.role === 'customer' ? 'Self Maintenance' : 'Service Contract',
            lastCleaning: '2025-11-15',
            nextRecommended: '2026-02-15',
            serviceHistory: []
        };
        
        this.dashboardState.financeData = {
            totalInvestment: systemSize * 50000,
            recovered: Math.round(systemSize * 50000 * 0.42),
            monthlySavings: Math.round(systemSize * 854),
            tariffPerUnit: tariff,
            paybackProgress: 42
        };
        
        console.log('📊 Plant data generated for:', profile.plantName);
    },

    /**
     * Generate panel data based on system size
     * @param {number} systemSize - System size in kW
     * @returns {Array} Panel data
     */
    generatePanelData(systemSize) {
        const panels = [];
        const panelCount = Math.ceil(systemSize / 5); // ~5kW per array
        
        for (let i = 0; i < Math.min(panelCount, 3); i++) {
            panels.push({
                name: i === 0 ? 'Rooftop Array A' : i === 1 ? 'Rooftop Array B' : 'Ground Mount',
                status: i % 2 === 0 ? 'active' : 'charging',
                value: (systemSize / panelCount * (0.8 + Math.random() * 0.4)).toFixed(1)
            });
        }
        
        return panels;
    },

    /**
     * Generate monthly generation data
     * @param {number} systemSize - System size in kW
     * @returns {Array} Monthly data
     */
    generateMonthlyData(systemSize) {
        const months = ['September', 'October', 'November', 'December'];
        const icons = ['🌤️', '☀️', '🌞', '⛅'];
        
        return months.map((month, i) => ({
            month,
            icon: icons[i],
            value: Math.round(systemSize * (120 + Math.random() * 40))
        }));
    },

    /**
     * Generate energy chart data
     * @param {number} systemSize - System size in kW
     * @param {string} type - 'produced' or 'consumed'
     * @returns {Array} Energy data
     */
    generateEnergyData(systemSize, type) {
        const data = [];
        const multiplier = type === 'produced' ? 1 : 0.85;
        
        for (let i = 0; i < 6; i++) {
            data.push(Math.round(systemSize * (110 + Math.random() * 40) * multiplier));
        }
        
        return data;
    },

    /**
     * Update entire dashboard based on active profile
     */
    updateDashboardFromProfile() {
        const profile = this.dashboardState.userProfile;
        if (!profile) return;
        
        console.log('🔄 Updating dashboard from profile...');
        
        // Update header
        this.updateHeader();
        
        // Trigger dashboard refresh if section is loaded
        if (window.SectionLoader && window.SectionLoader.currentSection) {
            const currentSection = window.SectionLoader.currentSection;
            window.SectionLoader.loadedSections.delete(currentSection);
            window.SectionLoader.loadSection(currentSection);
        }
        
        console.log('✅ Dashboard updated');
    },

    /**
     * Update header with profile data
     */
    updateHeader() {
        const profile = this.dashboardState.userProfile;
        const plantData = this.dashboardState.plantData;
        
        if (!profile || !plantData) return;
        
        // Update system size in header
        const sizeElement = document.getElementById('headerSystemSize');
        if (sizeElement) {
            sizeElement.textContent = `${plantData.capacity} kW`;
        }
    },

    /**
     * Setup profile switcher for admin users
     */
    setupProfileSwitcher() {
        const profile = this.dashboardState.userProfile;
        if (!profile) return;
        
        // Show profile switcher only for admin
        if (profile.role === 'admin') {
            const switcher = document.getElementById('profileSwitcher');
            const select = document.getElementById('profileSelect');
            
            if (switcher && select) {
                switcher.style.display = 'block';
                
                // Populate options
                select.innerHTML = '<option value="">Switch Profile...</option>';
                Object.keys(this.mockProfiles).forEach(key => {
                    const p = this.mockProfiles[key];
                    const option = document.createElement('option');
                    option.value = key;
                    option.textContent = `${p.name} (${p.role})`;
                    if (key === profile.role) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                });
                
                // Handle profile switch
                select.addEventListener('change', (e) => {
                    const newProfile = e.target.value;
                    if (newProfile && newProfile !== profile.role) {
                        this.switchProfile(newProfile);
                    }
                });
            }
        }
    },

    /**
     * Switch to different profile (admin only)
     * @param {string} profileKey - Profile key to switch to
     */
    switchProfile(profileKey) {
        console.log('🔄 Switching profile to:', profileKey);
        
        this.setProfile(profileKey);
        this.updateDashboardFromProfile();
        this.showToast(`Switched to ${this.dashboardState.userProfile.name}'s profile`);
        
        // Reload profile switcher
        this.setupProfileSwitcher();
    },

    /**
     * Show toast notification
     * @param {string} message - Toast message
     */
    showToast(message) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        if (toast && toastMessage) {
            toastMessage.textContent = message;
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    },

    /**
     * Get current profile
     * @returns {Object} Current user profile
     */
    getProfile() {
        return this.dashboardState.userProfile;
    },

    /**
     * Get plant data
     * @returns {Object} Plant data
     */
    getPlantData() {
        return this.dashboardState.plantData;
    },

    /**
     * Get charts data
     * @returns {Object} Charts data
     */
    getChartsData() {
        return this.dashboardState.chartsData;
    },

    /**
     * Get maintenance data
     * @returns {Object} Maintenance data
     */
    getMaintenanceData() {
        return this.dashboardState.maintenanceData;
    },

    /**
     * Get finance data
     * @returns {Object} Finance data
     */
    getFinanceData() {
        return this.dashboardState.financeData;
    },

    /**
     * Check if user has permission
     * @param {string} permission - Permission to check
     * @returns {boolean} Has permission
     */
    hasPermission(permission) {
        const profile = this.dashboardState.userProfile;
        return profile && profile.permissions.includes(permission);
    }
};

// ============================================
// SUPABASE INTEGRATION PLACEHOLDERS
// ============================================

/**
 * Load user profile from Supabase
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User profile
 */
async function loadUserProfile(userId) {
    // TODO: Implement Supabase query
    /*
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
    
    if (error) throw error;
    return data;
    */
    
    console.log('📦 loadUserProfile() ready for Supabase integration');
    return ProfileManager.mockProfiles.customer;
}

/**
 * Update user profile in Supabase
 * @param {string} userId - User ID
 * @param {Object} updates - Profile updates
 * @returns {Promise<Object>} Updated profile
 */
async function updateUserProfile(userId, updates) {
    // TODO: Implement Supabase update
    /*
    const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userId)
        .single();
    
    if (error) throw error;
    return data;
    */
    
    console.log('📦 updateUserProfile() ready for Supabase integration');
    return { ...ProfileManager.dashboardState.userProfile, ...updates };
}

/**
 * Load plant data from Supabase
 * @param {string} plantId - Plant ID
 * @returns {Promise<Object>} Plant data
 */
async function loadPlantData(plantId) {
    // TODO: Implement Supabase query
    /*
    const { data, error } = await supabase
        .from('plant_data')
        .select('*')
        .eq('plant_id', plantId)
        .single();
    
    if (error) throw error;
    return data;
    */
    
    console.log('📦 loadPlantData() ready for Supabase integration');
    return ProfileManager.dashboardState.plantData;
}

// Export for use in other modules
window.ProfileManager = ProfileManager;

console.log('📦 profile-manager.js loaded');
