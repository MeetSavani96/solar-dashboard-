// ============================================
// ADMIN CENTRAL DATA STORE
// ============================================

console.log('🗄️ Admin Store Module Loading...');

/**
 * Central Admin Store
 * Stores all user data for admin access
 * In production, this would be in a database with RLS
 */
const adminStore = {
    users: [],
    lastUpdated: null
};

/**
 * Initialize Admin Store with Demo Data
 */
function initializeAdminStore() {
    console.log('🗄️ Initializing Admin Store...');
    
    // Check if data exists in localStorage
    const storedData = localStorage.getItem('adminStore');
    
    if (storedData) {
        try {
            const parsed = JSON.parse(storedData);
            adminStore.users = parsed.users || [];
            adminStore.lastUpdated = parsed.lastUpdated;
            console.log(`✅ Loaded ${adminStore.users.length} users from storage`);
            return;
        } catch (e) {
            console.error('Error parsing admin store:', e);
        }
    }
    
    // Initialize with demo data if no stored data
    adminStore.users = [
        {
            id: 'USR-CUST-001',
            email: 'customer@example.com',
            role: 'customer',
            profile: {
                name: 'Meet Patel',
                email: 'customer@example.com',
                phone: '+91 98765 43210',
                plantName: 'Home Rooftop Solar',
                systemSize: 10,
                state: 'Gujarat',
                city: 'Surat',
                location: 'Surat',
                tariff: 8,
                installationCost: 500000,
                purchaseType: 'loan',
                downPayment: 100000,
                interestRate: 9.5,
                loanTenure: 10
            },
            system: {
                systemId: 'SYS-001',
                status: 'active',
                installDate: '2024-01-15',
                totalGeneration: 14200,
                todayGeneration: 42,
                livePower: 5.6,
                consumption: 18,
                healthScore: 96,
                efficiency: 94.5
            },
            roi: {
                paybackYears: 5.2,
                savings10Years: 850000,
                savings25Years: 3500000,
                netProfit25Years: 3000000,
                roiPercent25: 600
            },
            complaints: [
                {
                    id: 'C-2026-001',
                    type: 'performance',
                    priority: 'high',
                    status: 'in-progress',
                    description: 'System generating only 60% of expected power',
                    date: '2026-02-12',
                    assignedTo: 'Rajesh Kumar'
                }
            ],
            lastUpdated: new Date().toISOString()
        },
        {
            id: 'USR-CUST-002',
            email: 'priya@example.com',
            role: 'customer',
            profile: {
                name: 'Priya Sharma',
                email: 'priya@example.com',
                phone: '+91 98765 43211',
                plantName: 'Commercial Solar Plant',
                systemSize: 15,
                state: 'Gujarat',
                city: 'Ahmedabad',
                location: 'Ahmedabad',
                tariff: 9,
                installationCost: 750000,
                purchaseType: 'cash',
                downPayment: 0,
                interestRate: 0,
                loanTenure: 0
            },
            system: {
                systemId: 'SYS-002',
                status: 'active',
                installDate: '2023-11-20',
                totalGeneration: 21500,
                todayGeneration: 63,
                livePower: 8.4,
                consumption: 25,
                healthScore: 94,
                efficiency: 93.2
            },
            roi: {
                paybackYears: 4.8,
                savings10Years: 1275000,
                savings25Years: 5250000,
                netProfit25Years: 4500000,
                roiPercent25: 600
            },
            complaints: [],
            lastUpdated: new Date().toISOString()
        },
        {
            id: 'USR-CUST-003',
            email: 'rajesh@example.com',
            role: 'customer',
            profile: {
                name: 'Rajesh Kumar',
                email: 'rajesh@example.com',
                phone: '+91 98765 43212',
                plantName: 'Residential Solar',
                systemSize: 8,
                state: 'Maharashtra',
                city: 'Mumbai',
                location: 'Mumbai',
                tariff: 10,
                installationCost: 400000,
                purchaseType: 'loan',
                downPayment: 80000,
                interestRate: 8.5,
                loanTenure: 8
            },
            system: {
                systemId: 'SYS-003',
                status: 'active',
                installDate: '2024-03-10',
                totalGeneration: 9800,
                todayGeneration: 34,
                livePower: 4.5,
                consumption: 15,
                healthScore: 98,
                efficiency: 96.1
            },
            roi: {
                paybackYears: 4.5,
                savings10Years: 680000,
                savings25Years: 2800000,
                netProfit25Years: 2400000,
                roiPercent25: 600
            },
            complaints: [],
            lastUpdated: new Date().toISOString()
        }
    ];
    
    adminStore.lastUpdated = new Date().toISOString();
    
    // Save to localStorage
    saveAdminStore();
    
    console.log(`✅ Admin Store initialized with ${adminStore.users.length} users`);
}

/**
 * Save Admin Store to localStorage
 */
function saveAdminStore() {
    try {
        localStorage.setItem('adminStore', JSON.stringify(adminStore));
        console.log('💾 Admin Store saved to localStorage');
    } catch (e) {
        console.error('❌ Error saving admin store:', e);
    }
}

/**
 * Get All Users (Admin Only)
 * @returns {Array} All users
 */
function getAllUsers() {
    // Security check
    if (!window.isAdmin || !window.isAdmin()) {
        console.error('🚫 Access denied: Admin only');
        return [];
    }
    
    return adminStore.users;
}

/**
 * Get User by ID (Admin Only)
 * @param {string} userId - User ID
 * @returns {Object|null} User object or null
 */
function getUserById(userId) {
    // Security check
    if (!window.isAdmin || !window.isAdmin()) {
        console.error('🚫 Access denied: Admin only');
        return null;
    }
    
    return adminStore.users.find(u => u.id === userId) || null;
}

/**
 * Get Current User's Data
 * @returns {Object|null} Current user's data
 */
function getCurrentUserData() {
    const session = window.getUserSession();
    if (!session) return null;
    
    // Find user in admin store
    let user = adminStore.users.find(u => u.id === session.id);
    
    // If not found, create new user entry
    if (!user) {
        user = createUserEntry(session);
    }
    
    return user;
}

/**
 * Create New User Entry
 * @param {Object} session - User session
 * @returns {Object} New user object
 */
function createUserEntry(session) {
    console.log('➕ Creating new user entry:', session.id);
    
    const newUser = {
        id: session.id,
        email: session.email,
        role: session.role,
        profile: {
            name: session.name,
            email: session.email,
            phone: '',
            plantName: '',
            systemSize: session.systemSize || 10,
            state: '',
            city: '',
            location: '',
            tariff: 8,
            installationCost: 500000,
            purchaseType: 'cash',
            downPayment: 0,
            interestRate: 0,
            loanTenure: 0
        },
        system: {
            systemId: session.systemId || `SYS-${Date.now()}`,
            status: 'active',
            installDate: new Date().toISOString().split('T')[0],
            totalGeneration: 0,
            todayGeneration: 0,
            livePower: 0,
            consumption: 0,
            healthScore: 100,
            efficiency: 95
        },
        roi: {
            paybackYears: 0,
            savings10Years: 0,
            savings25Years: 0,
            netProfit25Years: 0,
            roiPercent25: 0
        },
        complaints: [],
        lastUpdated: new Date().toISOString()
    };
    
    adminStore.users.push(newUser);
    saveAdminStore();
    
    return newUser;
}

/**
 * Update User Profile
 * @param {string} userId - User ID
 * @param {Object} profileData - Profile data to update
 */
function updateUserProfile(userId, profileData) {
    const session = window.getUserSession();
    if (!session) return;
    
    // Security check: Users can only update their own profile
    if (session.role !== 'admin' && session.id !== userId) {
        console.error('🚫 Access denied: Cannot update other user\'s profile');
        return;
    }
    
    const user = adminStore.users.find(u => u.id === userId);
    if (!user) {
        console.error('❌ User not found:', userId);
        return;
    }
    
    // Update profile
    user.profile = { ...user.profile, ...profileData };
    user.lastUpdated = new Date().toISOString();
    
    // Save to store
    saveAdminStore();
    
    console.log('✅ User profile updated:', userId);
}

/**
 * Update User System Data
 * @param {string} userId - User ID
 * @param {Object} systemData - System data to update
 */
function updateUserSystem(userId, systemData) {
    const session = window.getUserSession();
    if (!session) return;
    
    // Security check
    if (session.role !== 'admin' && session.id !== userId) {
        console.error('🚫 Access denied: Cannot update other user\'s system');
        return;
    }
    
    const user = adminStore.users.find(u => u.id === userId);
    if (!user) return;
    
    user.system = { ...user.system, ...systemData };
    user.lastUpdated = new Date().toISOString();
    
    saveAdminStore();
    
    console.log('✅ User system updated:', userId);
}

/**
 * Update User ROI Data
 * @param {string} userId - User ID
 * @param {Object} roiData - ROI data to update
 */
function updateUserROI(userId, roiData) {
    const session = window.getUserSession();
    if (!session) return;
    
    // Security check
    if (session.role !== 'admin' && session.id !== userId) {
        console.error('🚫 Access denied: Cannot update other user\'s ROI');
        return;
    }
    
    const user = adminStore.users.find(u => u.id === userId);
    if (!user) return;
    
    user.roi = { ...user.roi, ...roiData };
    user.lastUpdated = new Date().toISOString();
    
    saveAdminStore();
    
    console.log('✅ User ROI updated:', userId);
}

/**
 * Add User Complaint
 * @param {string} userId - User ID
 * @param {Object} complaint - Complaint data
 */
function addUserComplaint(userId, complaint) {
    const session = window.getUserSession();
    if (!session) return;
    
    // Security check
    if (session.role !== 'admin' && session.id !== userId) {
        console.error('🚫 Access denied: Cannot add complaint for other user');
        return;
    }
    
    const user = adminStore.users.find(u => u.id === userId);
    if (!user) return;
    
    if (!user.complaints) {
        user.complaints = [];
    }
    
    user.complaints.push(complaint);
    user.lastUpdated = new Date().toISOString();
    
    saveAdminStore();
    
    console.log('✅ Complaint added for user:', userId);
}

/**
 * Update Complaint Status (Admin Only)
 * @param {string} userId - User ID
 * @param {string} complaintId - Complaint ID
 * @param {string} status - New status
 * @param {string} assignedTo - Assigned technician (optional)
 */
function updateComplaintStatus(userId, complaintId, status, assignedTo = null) {
    // Security check: Admin only
    if (!window.isAdmin || !window.isAdmin()) {
        console.error('🚫 Access denied: Admin only');
        return;
    }
    
    const user = adminStore.users.find(u => u.id === userId);
    if (!user || !user.complaints) return;
    
    const complaint = user.complaints.find(c => c.id === complaintId);
    if (!complaint) return;
    
    complaint.status = status;
    if (assignedTo) {
        complaint.assignedTo = assignedTo;
    }
    
    user.lastUpdated = new Date().toISOString();
    
    saveAdminStore();
    
    console.log('✅ Complaint status updated:', complaintId, status);
}

/**
 * Sync Dashboard State to Admin Store
 * Called when user updates their profile/data
 */
function syncDashboardStateToStore() {
    const session = window.getUserSession();
    if (!session || session.role === 'admin') return;
    
    const userId = session.id;
    
    // Get current dashboard state
    if (!window.dashboardState) return;
    
    const state = window.dashboardState;
    
    // Update user data in admin store
    updateUserProfile(userId, state.profile);
    updateUserSystem(userId, state.metrics);
    
    // Update ROI if available
    if (state.roi) {
        updateUserROI(userId, state.roi);
    }
    
    console.log('🔄 Dashboard state synced to admin store');
}

/**
 * Load User Data from Admin Store
 * Loads user's data into dashboardState
 */
function loadUserDataFromStore() {
    const session = window.getUserSession();
    if (!session || session.role === 'admin') return;
    
    const userData = getCurrentUserData();
    if (!userData) return;
    
    // Load into dashboardState if it exists
    if (window.dashboardState) {
        window.dashboardState.profile = { ...window.dashboardState.profile, ...userData.profile };
        window.dashboardState.metrics = { ...window.dashboardState.metrics, ...userData.system };
        
        console.log('✅ User data loaded from admin store');
    }
}

// Initialize admin store on load
initializeAdminStore();

// Export functions for global use
window.adminStore = adminStore;
window.getAllUsers = getAllUsers;
window.getUserById = getUserById;
window.getCurrentUserData = getCurrentUserData;
window.updateUserProfile = updateUserProfile;
window.updateUserSystem = updateUserSystem;
window.updateUserROI = updateUserROI;
window.addUserComplaint = addUserComplaint;
window.updateComplaintStatus = updateComplaintStatus;
window.syncDashboardStateToStore = syncDashboardStateToStore;
window.loadUserDataFromStore = loadUserDataFromStore;

console.log('✅ Admin Store Module Loaded');
