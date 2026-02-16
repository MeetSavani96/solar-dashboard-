// ============================================
// SUPABASE BACKEND INTEGRATION MODULE
// Complete database operations for Solar Dashboard
// ============================================

console.log('💾 Supabase Backend Module Loading...');

/**
 * ============================================
 * USER PROFILE OPERATIONS
 * ============================================
 */

/**
 * Get Current User Profile
 * @returns {Promise<Object>} User profile data
 */
async function getUserProfile() {
    if (!window.supabaseAuth || !window.supabaseAuth.isAvailable()) {
        console.warn('⚠️ Supabase not available');
        return null;
    }
    
    try {
        const user = await window.supabaseAuth.getCurrentUser();
        if (!user) return null;
        
        const { data, error } = await window.supabaseAuth.client
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                // No profile exists yet
                console.log('ℹ️ No profile found for user');
                return null;
            }
            throw error;
        }
        
        console.log('✅ User profile loaded');
        return data;
    } catch (error) {
        console.error('❌ Error loading profile:', error);
        return null;
    }
}

/**
 * Create User Profile
 * @param {Object} profileData - Profile data
 * @returns {Promise<Object>} Created profile
 */
async function createUserProfile(profileData) {
    if (!window.supabaseAuth || !window.supabaseAuth.isAvailable()) {
        return { success: false, error: 'Supabase not available' };
    }
    
    try {
        const user = await window.supabaseAuth.getCurrentUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }
        
        const { data, error } = await window.supabaseAuth.client
            .from('user_profiles')
            .insert([{
                user_id: user.id,
                ...profileData
            }])
            .select()
            .single();
        
        if (error) throw error;
        
        console.log('✅ Profile created successfully');
        return { success: true, data };
    } catch (error) {
        console.error('❌ Error creating profile:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update User Profile
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} Update result
 */
async function updateUserProfile(profileData) {
    if (!window.supabaseAuth || !window.supabaseAuth.isAvailable()) {
        return { success: false, error: 'Supabase not available' };
    }
    
    try {
        const user = await window.supabaseAuth.getCurrentUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }
        
        const { data, error } = await window.supabaseAuth.client
            .from('user_profiles')
            .update(profileData)
            .eq('user_id', user.id)
            .select()
            .single();
        
        if (error) throw error;
        
        console.log('✅ Profile updated successfully');
        return { success: true, data };
    } catch (error) {
        console.error('❌ Error updating profile:', error);
        return { success: false, error: error.message };
    }
}

/**
 * ============================================
 * ROI DATA OPERATIONS
 * ============================================
 */

/**
 * Get User ROI Data
 * @returns {Promise<Object>} ROI data
 */
async function getUserROI() {
    if (!window.supabaseAuth || !window.supabaseAuth.isAvailable()) {
        return null;
    }
    
    try {
        const user = await window.supabaseAuth.getCurrentUser();
        if (!user) return null;
        
        const { data, error } = await window.supabaseAuth.client
            .from('roi_data')
            .select('*')
            .eq('user_id', user.id)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                return null; // No ROI data yet
            }
            throw error;
        }
        
        console.log('✅ ROI data loaded');
        return data;
    } catch (error) {
        console.error('❌ Error loading ROI:', error);
        return null;
    }
}

/**
 * Save or Update ROI Data
 * @param {Object} roiData - ROI calculation data
 * @returns {Promise<Object>} Save result
 */
async function saveUserROI(roiData) {
    if (!window.supabaseAuth || !window.supabaseAuth.isAvailable()) {
        return { success: false, error: 'Supabase not available' };
    }
    
    try {
        const user = await window.supabaseAuth.getCurrentUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }
        
        // Check if ROI data exists
        const existing = await getUserROI();
        
        if (existing) {
            // Update existing
            const { data, error } = await window.supabaseAuth.client
                .from('roi_data')
                .update({
                    ...roiData,
                    calculated_at: new Date().toISOString()
                })
                .eq('user_id', user.id)
                .select()
                .single();
            
            if (error) throw error;
            console.log('✅ ROI data updated');
            return { success: true, data };
        } else {
            // Insert new
            const { data, error } = await window.supabaseAuth.client
                .from('roi_data')
                .insert([{
                    user_id: user.id,
                    ...roiData,
                    calculated_at: new Date().toISOString()
                }])
                .select()
                .single();
            
            if (error) throw error;
            console.log('✅ ROI data created');
            return { success: true, data };
        }
    } catch (error) {
        console.error('❌ Error saving ROI:', error);
        return { success: false, error: error.message };
    }
}

/**
 * ============================================
 * SYSTEM DATA OPERATIONS
 * ============================================
 */

/**
 * Get User System Data
 * @returns {Promise<Object>} System data
 */
async function getUserSystemData() {
    if (!window.supabaseAuth || !window.supabaseAuth.isAvailable()) {
        return null;
    }
    
    try {
        const user = await window.supabaseAuth.getCurrentUser();
        if (!user) return null;
        
        const { data, error } = await window.supabaseAuth.client
            .from('system_data')
            .select('*')
            .eq('user_id', user.id)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                return null; // No system data yet
            }
            throw error;
        }
        
        return data;
    } catch (error) {
        console.error('❌ Error loading system data:', error);
        return null;
    }
}

/**
 * Update System Data
 * @param {Object} systemData - System metrics
 * @returns {Promise<Object>} Update result
 */
async function updateSystemData(systemData) {
    if (!window.supabaseAuth || !window.supabaseAuth.isAvailable()) {
        return { success: false, error: 'Supabase not available' };
    }
    
    try {
        const user = await window.supabaseAuth.getCurrentUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }
        
        // Check if system data exists
        const existing = await getUserSystemData();
        
        if (existing) {
            // Update existing
            const { data, error } = await window.supabaseAuth.client
                .from('system_data')
                .update({
                    ...systemData,
                    last_updated: new Date().toISOString()
                })
                .eq('user_id', user.id)
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data };
        } else {
            // Insert new
            const { data, error } = await window.supabaseAuth.client
                .from('system_data')
                .insert([{
                    user_id: user.id,
                    ...systemData,
                    last_updated: new Date().toISOString()
                }])
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data };
        }
    } catch (error) {
        console.error('❌ Error updating system data:', error);
        return { success: false, error: error.message };
    }
}

/**
 * ============================================
 * COMPLAINT OPERATIONS
 * ============================================
 */

/**
 * Get User Complaints
 * @returns {Promise<Array>} Array of complaints
 */
async function getUserComplaints() {
    if (!window.supabaseAuth || !window.supabaseAuth.isAvailable()) {
        return [];
    }
    
    try {
        const user = await window.supabaseAuth.getCurrentUser();
        if (!user) return [];
        
        const { data, error } = await window.supabaseAuth.client
            .from('complaints')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        console.log(`✅ Loaded ${data.length} complaints`);
        return data;
    } catch (error) {
        console.error('❌ Error loading complaints:', error);
        return [];
    }
}

/**
 * Create Complaint
 * @param {Object} complaintData - Complaint details
 * @returns {Promise<Object>} Created complaint
 */
async function createComplaint(complaintData) {
    if (!window.supabaseAuth || !window.supabaseAuth.isAvailable()) {
        return { success: false, error: 'Supabase not available' };
    }
    
    try {
        const user = await window.supabaseAuth.getCurrentUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }
        
        const { data, error } = await window.supabaseAuth.client
            .from('complaints')
            .insert([{
                user_id: user.id,
                ...complaintData,
                status: 'new'
            }])
            .select()
            .single();
        
        if (error) throw error;
        
        console.log('✅ Complaint created successfully');
        return { success: true, data };
    } catch (error) {
        console.error('❌ Error creating complaint:', error);
        return { success: false, error: error.message };
    }
}

/**
 * ============================================
 * ADMIN OPERATIONS
 * ============================================
 */

/**
 * Get All Customers (Admin Only)
 * @returns {Promise<Array>} Array of customers
 */
async function getAllCustomers() {
    if (!window.supabaseAuth || !window.supabaseAuth.isAvailable()) {
        return [];
    }
    
    try {
        const { data, error } = await window.supabaseAuth.client
            .from('users')
            .select(`
                *,
                user_profiles(*),
                roi_data(*),
                system_data(*)
            `)
            .eq('role', 'customer')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        console.log(`✅ Loaded ${data.length} customers`);
        return data;
    } catch (error) {
        console.error('❌ Error loading customers:', error);
        return [];
    }
}

/**
 * Get All Complaints (Admin Only)
 * @returns {Promise<Array>} Array of all complaints
 */
async function getAllComplaints() {
    if (!window.supabaseAuth || !window.supabaseAuth.isAvailable()) {
        return [];
    }
    
    try {
        const { data, error } = await window.supabaseAuth.client
            .from('complaints')
            .select(`
                *,
                users(name, email, phone)
            `)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        console.log(`✅ Loaded ${data.length} complaints`);
        return data;
    } catch (error) {
        console.error('❌ Error loading complaints:', error);
        return [];
    }
}

/**
 * Update Complaint Status (Admin Only)
 * @param {string} complaintId - Complaint ID
 * @param {string} status - New status
 * @param {Object} additionalData - Additional data (admin_notes, etc.)
 * @returns {Promise<Object>} Update result
 */
async function updateComplaintStatus(complaintId, status, additionalData = {}) {
    if (!window.supabaseAuth || !window.supabaseAuth.isAvailable()) {
        return { success: false, error: 'Supabase not available' };
    }
    
    try {
        const updateData = {
            status,
            ...additionalData
        };
        
        // Add resolved timestamp if status is resolved
        if (status === 'resolved' && !updateData.resolved_at) {
            updateData.resolved_at = new Date().toISOString();
            const user = await window.supabaseAuth.getCurrentUser();
            if (user) {
                updateData.resolved_by = user.id;
            }
        }
        
        const { data, error } = await window.supabaseAuth.client
            .from('complaints')
            .update(updateData)
            .eq('id', complaintId)
            .select()
            .single();
        
        if (error) throw error;
        
        console.log('✅ Complaint status updated');
        return { success: true, data };
    } catch (error) {
        console.error('❌ Error updating complaint:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get Customer by ID (Admin Only)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Customer data
 */
async function getCustomerById(userId) {
    if (!window.supabaseAuth || !window.supabaseAuth.isAvailable()) {
        return null;
    }
    
    try {
        const { data, error } = await window.supabaseAuth.client
            .from('users')
            .select(`
                *,
                user_profiles(*),
                roi_data(*),
                system_data(*),
                complaints(*)
            `)
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        
        console.log('✅ Customer data loaded');
        return data;
    } catch (error) {
        console.error('❌ Error loading customer:', error);
        return null;
    }
}

/**
 * ============================================
 * STATISTICS & ANALYTICS
 * ============================================
 */

/**
 * Get Admin Dashboard Statistics
 * @returns {Promise<Object>} Dashboard statistics
 */
async function getAdminStatistics() {
    if (!window.supabaseAuth || !window.supabaseAuth.isAvailable()) {
        return null;
    }
    
    try {
        // Get counts
        const [customersResult, leadsResult, complaintsResult] = await Promise.all([
            window.supabaseAuth.client.from('users').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
            window.supabaseAuth.client.from('leads').select('id', { count: 'exact', head: true }),
            window.supabaseAuth.client.from('complaints').select('id', { count: 'exact', head: true })
        ]);
        
        // Get new leads (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { count: newLeadsCount } = await window.supabaseAuth.client
            .from('leads')
            .select('id', { count: 'exact', head: true })
            .gte('created_at', sevenDaysAgo.toISOString());
        
        // Get open complaints
        const { count: openComplaintsCount } = await window.supabaseAuth.client
            .from('complaints')
            .select('id', { count: 'exact', head: true })
            .in('status', ['new', 'in_progress']);
        
        const stats = {
            totalCustomers: customersResult.count || 0,
            totalLeads: leadsResult.count || 0,
            totalComplaints: complaintsResult.count || 0,
            newLeads: newLeadsCount || 0,
            openComplaints: openComplaintsCount || 0
        };
        
        console.log('✅ Admin statistics loaded');
        return stats;
    } catch (error) {
        console.error('❌ Error loading statistics:', error);
        return null;
    }
}

/**
 * ============================================
 * EXPORT FUNCTIONS
 * ============================================
 */

window.supabaseBackend = {
    // Profile operations
    getUserProfile,
    createUserProfile,
    updateUserProfile,
    
    // ROI operations
    getUserROI,
    saveUserROI,
    
    // System data operations
    getUserSystemData,
    updateSystemData,
    
    // Complaint operations
    getUserComplaints,
    createComplaint,
    
    // Admin operations
    getAllCustomers,
    getAllComplaints,
    updateComplaintStatus,
    getCustomerById,
    getAdminStatistics
};

console.log('✅ Supabase Backend Module Loaded');
