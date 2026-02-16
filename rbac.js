// ============================================
// ROLE-BASED ACCESS CONTROL (RBAC)
// ============================================

console.log('🛡️ RBAC Module Loading...');

/**
 * Section Access Control
 * Defines which roles can access which sections
 */
const SECTION_ACCESS = {
    // Customer Sections
    'overview': ['admin', 'customer'],
    'analysis': ['admin', 'customer'],
    'performance': ['admin', 'customer'],
    'maintenance': ['admin', 'customer'],
    'finance': ['admin', 'customer'],
    'roi': ['admin', 'customer'],
    'reports': ['admin', 'customer'],
    'profile': ['admin', 'customer'],
    'settings': ['admin', 'customer'],
    
    // Admin-Only Sections
    'admin-dashboard': ['admin'],
    'admin-customers': ['admin'],
    'admin-systems': ['admin'],
    'admin-complaints': ['admin'],
    'admin-leads': ['admin'],
    'admin-reports': ['admin'],
    'admin-settings': ['admin']
};

/**
 * Sidebar Configuration by Role
 */
const SIDEBAR_CONFIG = {
    customer: [
        { id: 'overview', icon: '📊', text: 'Overview' },
        { id: 'analysis', icon: '📈', text: 'Analysis' },
        { id: 'performance', icon: '⚡', text: 'Performance' },
        { id: 'maintenance', icon: '🔧', text: 'Support' },
        { id: 'finance', icon: '💰', text: 'Finance' },
        { id: 'roi', icon: '📊', text: 'ROI Forecast' },
        { id: 'reports', icon: '📄', text: 'Reports' },
        { id: 'profile', icon: '👤', text: 'Profile' },
        { id: 'settings', icon: '⚙️', text: 'Settings' }
    ],
    admin: [
        { id: 'admin-dashboard', icon: '🏠', text: 'Admin Dashboard' },
        { id: 'admin-customers', icon: '👥', text: 'Customers' },
        { id: 'admin-systems', icon: '⚡', text: 'Systems' },
        { id: 'admin-complaints', icon: '🛠️', text: 'Complaints' },
        { id: 'admin-leads', icon: '📊', text: 'Leads' },
        { id: 'admin-reports', icon: '📈', text: 'Reports' },
        { id: 'admin-settings', icon: '⚙️', text: 'Settings' }
    ]
};

/**
 * Check if User Can Access Section
 * @param {string} sectionId - Section ID
 * @returns {boolean}
 */
function canAccessSection(sectionId) {
    const session = window.getUserSession();
    if (!session) return false;
    
    const allowedRoles = SECTION_ACCESS[sectionId];
    if (!allowedRoles) {
        console.warn(`⚠️ Section "${sectionId}" not defined in access control`);
        return false;
    }
    
    const hasAccess = allowedRoles.includes(session.role);
    
    if (!hasAccess) {
        console.log(`🚫 Access denied to "${sectionId}" for role "${session.role}"`);
    }
    
    return hasAccess;
}

/**
 * Render Sidebar Based on Role
 */
function renderRoleBasedSidebar() {
    const session = window.getUserSession();
    if (!session) return;
    
    const sidebarNav = document.querySelector('.sidebar-nav');
    if (!sidebarNav) return;
    
    const config = SIDEBAR_CONFIG[session.role];
    if (!config) {
        console.error(`❌ No sidebar config for role: ${session.role}`);
        return;
    }
    
    // Clear existing nav items
    sidebarNav.innerHTML = '';
    
    // Render nav items for this role
    config.forEach((item, index) => {
        const button = document.createElement('button');
        button.className = 'nav-link';
        button.setAttribute('data-section', item.id);
        
        // First item is active by default
        if (index === 0) {
            button.classList.add('active');
        }
        
        button.innerHTML = `
            <span class="nav-icon">${item.icon}</span>
            <span class="nav-text">${item.text}</span>
        `;
        
        sidebarNav.appendChild(button);
    });
    
    console.log(`✅ Sidebar rendered for role: ${session.role}`);
}

/**
 * Guard Section Access
 * Prevents unauthorized access to sections
 * @param {string} sectionId - Section ID to access
 * @returns {boolean} - True if access allowed
 */
function guardSectionAccess(sectionId) {
    if (!canAccessSection(sectionId)) {
        console.log(`🚫 Blocking access to: ${sectionId}`);
        
        // Show access denied message
        showAccessDeniedMessage(sectionId);
        
        // Redirect to default section
        redirectToDefaultSection();
        
        return false;
    }
    
    return true;
}

/**
 * Show Access Denied Message
 * @param {string} sectionId - Section that was blocked
 */
function showAccessDeniedMessage(sectionId) {
    const session = window.getUserSession();
    
    // Create toast notification
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (toast && toastMessage) {
        toastMessage.textContent = `Access Denied: You don't have permission to access "${sectionId}"`;
        toast.style.background = 'rgba(244, 67, 54, 0.9)';
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
            toast.style.background = '';
        }, 3000);
    } else {
        alert(`Access Denied\n\nYou don't have permission to access this section.\n\nRole: ${session.role}`);
    }
}

/**
 * Redirect to Default Section
 */
function redirectToDefaultSection() {
    const session = window.getUserSession();
    if (!session) return;
    
    const defaultSection = SIDEBAR_CONFIG[session.role][0].id;
    
    // Use the existing navigation system
    if (window.navigateToSection) {
        window.navigateToSection(defaultSection);
    }
}

/**
 * Get Default Section for Role
 * @returns {string} - Default section ID
 */
function getDefaultSection() {
    const session = window.getUserSession();
    if (!session) return 'overview';
    
    const config = SIDEBAR_CONFIG[session.role];
    return config ? config[0].id : 'overview';
}

/**
 * Initialize RBAC System
 */
function initializeRBAC() {
    console.log('🛡️ Initializing RBAC...');
    
    // Check authentication
    if (!window.requireAuth()) return;
    
    const session = window.getUserSession();
    console.log(`👤 Current user: ${session.name} (${session.role})`);
    
    // Render role-based sidebar
    renderRoleBasedSidebar();
    
    // Update user info in header
    updateUserInfo();
    
    // Setup logout button
    setupLogoutButton();
    
    console.log('✅ RBAC initialized');
}

/**
 * Update User Info in Header
 */
function updateUserInfo() {
    const session = window.getUserSession();
    if (!session) return;
    
    // Update page title
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle && session.role === 'admin') {
        pageTitle.textContent = 'Admin Dashboard';
    }
    
    // Add user name to header if element exists
    const headerRight = document.querySelector('.header-right');
    if (headerRight && !document.getElementById('userInfo')) {
        const userInfo = document.createElement('div');
        userInfo.id = 'userInfo';
        userInfo.className = 'status-item';
        userInfo.innerHTML = `
            <span class="status-label">Logged in as</span>
            <span class="status-value">${session.name}</span>
        `;
        headerRight.insertBefore(userInfo, headerRight.firstChild);
    }
}

/**
 * Setup Logout Button
 */
function setupLogoutButton() {
    // Add logout button to sidebar if not exists
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar || document.getElementById('logoutButton')) return;
    
    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'logoutButton';
    logoutBtn.className = 'nav-link logout-btn';
    logoutBtn.innerHTML = `
        <span class="nav-icon">🚪</span>
        <span class="nav-text">Logout</span>
    `;
    logoutBtn.onclick = () => {
        if (confirm('Are you sure you want to logout?')) {
            window.logout();
        }
    };
    
    sidebar.appendChild(logoutBtn);
}

// Export functions for global use
window.canAccessSection = canAccessSection;
window.guardSectionAccess = guardSectionAccess;
window.getDefaultSection = getDefaultSection;
window.initializeRBAC = initializeRBAC;
window.renderRoleBasedSidebar = renderRoleBasedSidebar;

console.log('✅ RBAC Module Loaded');
