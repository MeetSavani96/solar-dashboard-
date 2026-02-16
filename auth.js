// ============================================
// AUTHENTICATION & ROLE-BASED ACCESS CONTROL
// ============================================

console.log('🔐 Auth Module Loading...');

/**
 * Demo Users Database (Fallback when Supabase not configured)
 * In production, this would be handled by Supabase Auth
 */
const DEMO_USERS = {
    'admin@akvenergy.com': {
        id: 'USR-ADMIN-001',
        email: 'admin@akvenergy.com',
        password: 'admin123', // In production, this would be hashed
        role: 'admin',
        name: 'Admin User',
        company: 'AKVENERGY'
    },
    'customer@example.com': {
        id: 'USR-CUST-001',
        email: 'customer@example.com',
        password: 'customer123',
        role: 'customer',
        name: 'Meet Patel',
        systemId: 'SYS-001',
        systemSize: 10 // kW
    }
};

/**
 * Login Form Handler
 */
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    handleLogin();
});

/**
 * Handle Login (Supabase + Demo Mode)
 */
async function handleLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('loginError');
    const buttonEl = document.getElementById('loginButton');
    
    // Clear previous error
    errorEl.classList.remove('show');
    
    // Disable button during login
    buttonEl.disabled = true;
    buttonEl.textContent = 'Signing in...';
    
    try {
        // Check if Supabase is available
        if (window.supabaseAuth && window.supabaseAuth.isAvailable()) {
            // Use Supabase authentication
            console.log('🔐 Using Supabase authentication...');
            await handleSupabaseLogin(email, password, errorEl, buttonEl);
        } else {
            // Use demo authentication
            console.log('🔐 Using demo authentication...');
            await handleDemoLogin(email, password, errorEl, buttonEl);
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        errorEl.textContent = 'An error occurred. Please try again.';
        errorEl.classList.add('show');
        buttonEl.disabled = false;
        buttonEl.textContent = 'Sign In';
    }
}

/**
 * Handle Supabase Login
 */
async function handleSupabaseLogin(email, password, errorEl, buttonEl) {
    const result = await window.supabaseAuth.signIn(email, password);
    
    if (result.success) {
        console.log('✅ Supabase login successful:', result.user.role);
        
        // Store user session
        const sessionData = {
            id: result.user.id,
            email: result.user.email,
            role: result.user.role,
            name: result.user.metadata?.name || email.split('@')[0],
            systemId: result.user.metadata?.systemId || null,
            systemSize: result.user.metadata?.systemSize || null,
            company: result.user.metadata?.company || null,
            loginTime: new Date().toISOString(),
            authProvider: 'supabase'
        };
        
        storeUserSession(sessionData);
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    } else {
        console.log('❌ Supabase login failed:', result.error);
        errorEl.textContent = result.error || 'Invalid email or password. Please try again.';
        errorEl.classList.add('show');
        buttonEl.disabled = false;
        buttonEl.textContent = 'Sign In';
    }
}

/**
 * Handle Demo Login (Fallback)
 */
async function handleDemoLogin(email, password, errorEl, buttonEl) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check credentials
    const user = DEMO_USERS[email];
    
    if (user && user.password === password) {
        // Login successful
        console.log('✅ Demo login successful:', user.role);
        
        // Store user session
        const sessionData = {
            ...user,
            loginTime: new Date().toISOString(),
            authProvider: 'demo'
        };
        delete sessionData.password; // Don't store password
        
        storeUserSession(sessionData);
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    } else {
        // Login failed
        console.log('❌ Demo login failed');
        errorEl.textContent = 'Invalid email or password. Please try again.';
        errorEl.classList.add('show');
        buttonEl.disabled = false;
        buttonEl.textContent = 'Sign In';
    }
}

/**
 * Store User Session
 * @param {Object} sessionData - Session data object
 */
function storeUserSession(sessionData) {
    // Store in localStorage (in production, use secure httpOnly cookies)
    localStorage.setItem('userSession', JSON.stringify(sessionData));
    
    console.log('💾 Session stored:', sessionData);
}

/**
 * Get Current User Session
 * @returns {Object|null} User session or null
 */
function getUserSession() {
    const sessionData = localStorage.getItem('userSession');
    if (!sessionData) return null;
    
    try {
        return JSON.parse(sessionData);
    } catch (e) {
        console.error('Error parsing session:', e);
        return null;
    }
}

/**
 * Check if User is Logged In
 * @returns {boolean}
 */
function isLoggedIn() {
    return getUserSession() !== null;
}

/**
 * Check if User is Admin
 * @returns {boolean}
 */
function isAdmin() {
    const session = getUserSession();
    return session && session.role === 'admin';
}

/**
 * Check if User is Customer
 * @returns {boolean}
 */
function isCustomer() {
    const session = getUserSession();
    return session && session.role === 'customer';
}

/**
 * Logout User (Supabase + Demo Mode)
 */
async function logout() {
    console.log('👋 Logging out...');
    
    const session = getUserSession();
    
    // If using Supabase, sign out from Supabase
    if (session && session.authProvider === 'supabase' && window.supabaseAuth) {
        await window.supabaseAuth.signOut();
    }
    
    // Clear local session
    localStorage.removeItem('userSession');
    
    // Redirect to login
    window.location.href = 'login.html';
}

/**
 * Require Authentication
 * Redirect to login if not authenticated
 */
function requireAuth() {
    if (!isLoggedIn()) {
        console.log('🚫 Not authenticated, redirecting to login');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

/**
 * Require Admin Role
 * Show access denied if not admin
 */
function requireAdmin() {
    if (!requireAuth()) return false;
    
    if (!isAdmin()) {
        console.log('🚫 Access denied: Admin role required');
        showAccessDenied();
        return false;
    }
    return true;
}

/**
 * Show Access Denied Message
 */
function showAccessDenied() {
    alert('Access Denied\n\nYou do not have permission to access this page.\n\nThis page is restricted to administrators only.');
    
    // Redirect to appropriate dashboard
    if (isCustomer()) {
        window.location.href = 'dashboard.html';
    } else {
        window.location.href = 'login.html';
    }
}

/**
 * Fill Demo Account Credentials
 * @param {string} type - 'admin' or 'customer'
 */
function fillDemoAccount(type) {
    const emailEl = document.getElementById('email');
    const passwordEl = document.getElementById('password');
    
    if (type === 'admin') {
        emailEl.value = 'admin@akvenergy.com';
        passwordEl.value = 'admin123';
    } else {
        emailEl.value = 'customer@example.com';
        passwordEl.value = 'customer123';
    }
    
    // Focus on submit button
    document.getElementById('loginButton').focus();
}

// Export functions for global use
window.getUserSession = getUserSession;
window.isLoggedIn = isLoggedIn;
window.isAdmin = isAdmin;
window.isCustomer = isCustomer;
window.logout = logout;
window.requireAuth = requireAuth;
window.requireAdmin = requireAdmin;
window.fillDemoAccount = fillDemoAccount;

console.log('✅ Auth Module Loaded');
