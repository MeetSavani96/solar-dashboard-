// ============================================
// SUPABASE AUTHENTICATION MODULE
// ============================================

console.log('🔐 Supabase Auth Module Loading...');

/**
 * SUPABASE CONFIGURATION
 * Replace these with your actual Supabase credentials
 */
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase client
let supabase = null;

/**
 * Initialize Supabase Client
 */
function initializeSupabase() {
    // Check if Supabase library is loaded
    if (typeof window.supabase === 'undefined') {
        console.error('❌ Supabase library not loaded. Please include the Supabase CDN script.');
        return false;
    }
    
    // Check if credentials are configured
    if (SUPABASE_URL === 'YOUR_SUPABASE_PROJECT_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
        console.warn('⚠️ Supabase credentials not configured. Using demo mode.');
        return false;
    }
    
    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase client initialized');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize Supabase:', error);
        return false;
    }
}

/**
 * Check if Supabase is Available
 * @returns {boolean}
 */
function isSupabaseAvailable() {
    return supabase !== null;
}

/**
 * Sign In with Email and Password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - { success, user, error }
 */
async function signInWithEmail(email, password) {
    if (!isSupabaseAvailable()) {
        return { success: false, error: 'Supabase not configured' };
    }
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            console.error('❌ Sign in error:', error.message);
            return { success: false, error: error.message };
        }
        
        console.log('✅ Sign in successful:', data.user.email);
        
        // Get user role from metadata or database
        const role = await getUserRole(data.user.id);
        
        return {
            success: true,
            user: {
                id: data.user.id,
                email: data.user.email,
                role: role,
                metadata: data.user.user_metadata
            }
        };
    } catch (error) {
        console.error('❌ Sign in exception:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Sign Up with Email and Password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {Object} metadata - User metadata (name, role, etc.)
 * @returns {Promise<Object>} - { success, user, error }
 */
async function signUpWithEmail(email, password, metadata = {}) {
    if (!isSupabaseAvailable()) {
        return { success: false, error: 'Supabase not configured' };
    }
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: metadata
            }
        });
        
        if (error) {
            console.error('❌ Sign up error:', error.message);
            return { success: false, error: error.message };
        }
        
        console.log('✅ Sign up successful:', data.user.email);
        
        return {
            success: true,
            user: {
                id: data.user.id,
                email: data.user.email,
                metadata: data.user.user_metadata
            }
        };
    } catch (error) {
        console.error('❌ Sign up exception:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Sign Out
 * @returns {Promise<Object>} - { success, error }
 */
async function signOut() {
    if (!isSupabaseAvailable()) {
        return { success: false, error: 'Supabase not configured' };
    }
    
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            console.error('❌ Sign out error:', error.message);
            return { success: false, error: error.message };
        }
        
        console.log('✅ Sign out successful');
        return { success: true };
    } catch (error) {
        console.error('❌ Sign out exception:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get Current Session
 * @returns {Promise<Object|null>} - Session object or null
 */
async function getCurrentSession() {
    if (!isSupabaseAvailable()) {
        return null;
    }
    
    try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('❌ Get session error:', error.message);
            return null;
        }
        
        return data.session;
    } catch (error) {
        console.error('❌ Get session exception:', error);
        return null;
    }
}

/**
 * Get Current User
 * @returns {Promise<Object|null>} - User object or null
 */
async function getCurrentUser() {
    if (!isSupabaseAvailable()) {
        return null;
    }
    
    try {
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
            console.error('❌ Get user error:', error.message);
            return null;
        }
        
        if (!data.user) {
            return null;
        }
        
        // Get user role
        const role = await getUserRole(data.user.id);
        
        return {
            id: data.user.id,
            email: data.user.email,
            role: role,
            metadata: data.user.user_metadata
        };
    } catch (error) {
        console.error('❌ Get user exception:', error);
        return null;
    }
}

/**
 * Get User Role from Database
 * @param {string} userId - User ID
 * @returns {Promise<string>} - User role (admin/customer)
 */
async function getUserRole(userId) {
    if (!isSupabaseAvailable()) {
        return 'customer'; // Default role
    }
    
    try {
        // Query users table for role
        const { data, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', userId)
            .single();
        
        if (error) {
            console.warn('⚠️ Could not fetch user role:', error.message);
            return 'customer'; // Default to customer
        }
        
        return data.role || 'customer';
    } catch (error) {
        console.error('❌ Get user role exception:', error);
        return 'customer';
    }
}

/**
 * Update User Profile in Database
 * @param {string} userId - User ID
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} - { success, error }
 */
async function updateUserProfile(userId, profileData) {
    if (!isSupabaseAvailable()) {
        return { success: false, error: 'Supabase not configured' };
    }
    
    try {
        const { error } = await supabase
            .from('users')
            .update(profileData)
            .eq('id', userId);
        
        if (error) {
            console.error('❌ Update profile error:', error.message);
            return { success: false, error: error.message };
        }
        
        console.log('✅ Profile updated successfully');
        return { success: true };
    } catch (error) {
        console.error('❌ Update profile exception:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Reset Password
 * @param {string} email - User email
 * @returns {Promise<Object>} - { success, error }
 */
async function resetPassword(email) {
    if (!isSupabaseAvailable()) {
        return { success: false, error: 'Supabase not configured' };
    }
    
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password.html`
        });
        
        if (error) {
            console.error('❌ Reset password error:', error.message);
            return { success: false, error: error.message };
        }
        
        console.log('✅ Password reset email sent');
        return { success: true };
    } catch (error) {
        console.error('❌ Reset password exception:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Listen to Auth State Changes
 * @param {Function} callback - Callback function (event, session)
 */
function onAuthStateChange(callback) {
    if (!isSupabaseAvailable()) {
        console.warn('⚠️ Supabase not available for auth state listener');
        return;
    }
    
    supabase.auth.onAuthStateChange((event, session) => {
        console.log('🔄 Auth state changed:', event);
        callback(event, session);
    });
}

// Initialize Supabase on load
const supabaseInitialized = initializeSupabase();

// Export functions for global use
window.supabaseAuth = {
    isAvailable: isSupabaseAvailable,
    signIn: signInWithEmail,
    signUp: signUpWithEmail,
    signOut: signOut,
    getCurrentSession: getCurrentSession,
    getCurrentUser: getCurrentUser,
    getUserRole: getUserRole,
    updateUserProfile: updateUserProfile,
    resetPassword: resetPassword,
    onAuthStateChange: onAuthStateChange,
    client: supabase
};

console.log('✅ Supabase Auth Module Loaded');
console.log(`📡 Supabase Status: ${supabaseInitialized ? 'Connected' : 'Demo Mode'}`);

