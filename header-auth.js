// ============================================
// HEADER AUTHENTICATION MODULE
// ============================================

console.log('🔐 Header Auth Module Loading...');

/**
 * Check Authentication Status and Update Header
 */
async function checkAuthAndUpdateHeader() {
    const loggedOutEl = document.getElementById('authLoggedOut');
    const loggedInEl = document.getElementById('authLoggedIn');
    
    if (!loggedOutEl || !loggedInEl) {
        console.warn('⚠️ Auth button elements not found');
        return;
    }
    
    // Check if user is logged in (check localStorage first for quick response)
    const localSession = localStorage.getItem('userSession');
    
    if (localSession) {
        try {
            const session = JSON.parse(localSession);
            
            // Show logged in state
            loggedOutEl.style.display = 'none';
            loggedInEl.style.display = 'flex';
            
            console.log('✅ User is logged in:', session.email);
            
            // If Supabase is available, verify session is still valid
            if (window.supabaseAuth && window.supabaseAuth.isAvailable()) {
                verifySupabaseSession();
            }
        } catch (e) {
            console.error('Error parsing session:', e);
            showLoggedOutState();
        }
    } else {
        // No local session, check Supabase
        if (window.supabaseAuth && window.supabaseAuth.isAvailable()) {
            await checkSupabaseSession();
        } else {
            showLoggedOutState();
        }
    }
}

/**
 * Check Supabase Session
 */
async function checkSupabaseSession() {
    const loggedOutEl = document.getElementById('authLoggedOut');
    const loggedInEl = document.getElementById('authLoggedIn');
    
    try {
        const session = await window.supabaseAuth.getCurrentSession();
        
        if (session && session.user) {
            // User is logged in via Supabase
            console.log('✅ Supabase session found:', session.user.email);
            
            // Get user role
            const role = await window.supabaseAuth.getUserRole(session.user.id);
            
            // Store session locally for quick access
            const sessionData = {
                id: session.user.id,
                email: session.user.email,
                role: role,
                name: session.user.user_metadata?.name || session.user.email.split('@')[0],
                loginTime: new Date().toISOString(),
                authProvider: 'supabase'
            };
            
            localStorage.setItem('userSession', JSON.stringify(sessionData));
            
            // Show logged in state
            loggedOutEl.style.display = 'none';
            loggedInEl.style.display = 'flex';
        } else {
            // No Supabase session
            showLoggedOutState();
        }
    } catch (error) {
        console.error('Error checking Supabase session:', error);
        showLoggedOutState();
    }
}

/**
 * Verify Supabase Session is Still Valid
 */
async function verifySupabaseSession() {
    try {
        const session = await window.supabaseAuth.getCurrentSession();
        
        if (!session || !session.user) {
            // Session expired, clear local storage
            console.log('⚠️ Session expired, clearing local storage');
            localStorage.removeItem('userSession');
            showLoggedOutState();
        }
    } catch (error) {
        console.error('Error verifying session:', error);
    }
}

/**
 * Show Logged Out State
 */
function showLoggedOutState() {
    const loggedOutEl = document.getElementById('authLoggedOut');
    const loggedInEl = document.getElementById('authLoggedIn');
    
    if (loggedOutEl && loggedInEl) {
        loggedOutEl.style.display = 'flex';
        loggedInEl.style.display = 'none';
        console.log('👤 User is logged out');
    }
}

/**
 * Handle Logout Button Click
 */
async function handleLogout() {
    console.log('👋 Logging out...');
    
    const session = localStorage.getItem('userSession');
    
    // If using Supabase, sign out from Supabase
    if (session) {
        try {
            const sessionData = JSON.parse(session);
            if (sessionData.authProvider === 'supabase' && window.supabaseAuth) {
                await window.supabaseAuth.signOut();
            }
        } catch (e) {
            console.error('Error parsing session:', e);
        }
    }
    
    // Clear local session
    localStorage.removeItem('userSession');
    
    // Update header to show logged out state
    showLoggedOutState();
    
    // Show success message
    alert('You have been logged out successfully.');
    
    console.log('✅ Logout complete');
}

/**
 * Setup Logout Button
 */
function setupLogoutButton() {
    const logoutBtn = document.getElementById('btnLogout');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            if (confirm('Are you sure you want to logout?')) {
                await handleLogout();
            }
        });
        
        console.log('✅ Logout button setup complete');
    }
}

/**
 * Initialize Header Auth
 */
function initializeHeaderAuth() {
    console.log('🚀 Initializing header auth...');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            checkAuthAndUpdateHeader();
            setupLogoutButton();
        });
    } else {
        checkAuthAndUpdateHeader();
        setupLogoutButton();
    }
    
    // Listen for auth state changes (if Supabase is available)
    if (window.supabaseAuth && window.supabaseAuth.isAvailable()) {
        window.supabaseAuth.onAuthStateChange((event, session) => {
            console.log('🔄 Auth state changed:', event);
            
            if (event === 'SIGNED_IN') {
                checkAuthAndUpdateHeader();
            } else if (event === 'SIGNED_OUT') {
                showLoggedOutState();
            }
        });
    }
}

// Initialize on load
initializeHeaderAuth();

// Export functions for global use
window.checkAuthAndUpdateHeader = checkAuthAndUpdateHeader;
window.handleHeaderLogout = handleLogout;

console.log('✅ Header Auth Module Loaded');
