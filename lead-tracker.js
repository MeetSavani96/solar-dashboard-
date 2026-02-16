// ============================================
// LEAD TRACKING SYSTEM
// ============================================

console.log('📊 Lead Tracker Module Loading...');

/**
 * Save Lead to Supabase
 * @param {Object} leadData - Lead data object
 * @returns {Promise<Object>} - { success, leadId, error }
 */
async function saveLead(leadData) {
    console.log('💾 Saving lead...', leadData);
    
    // Check if Supabase is available
    if (!window.supabaseAuth || !window.supabaseAuth.isAvailable()) {
        console.warn('⚠️ Supabase not available, lead not saved');
        return { 
            success: false, 
            error: 'Supabase not configured',
            demo: true 
        };
    }
    
    try {
        const { data, error } = await window.supabaseAuth.client
            .from('leads')
            .insert([leadData])
            .select()
            .single();
        
        if (error) {
            console.error('❌ Error saving lead:', error.message);
            return { 
                success: false, 
                error: error.message 
            };
        }
        
        console.log('✅ Lead saved successfully:', data.id);
        return { 
            success: true, 
            leadId: data.id,
            data: data
        };
    } catch (error) {
        console.error('❌ Exception saving lead:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
}

/**
 * Save Calculator Lead
 * Called when user completes calculator
 * @param {Object} calculatorData - Calculator form data
 * @returns {Promise<Object>} - Save result
 */
async function saveCalculatorLead(calculatorData) {
    const leadData = {
        name: calculatorData.name || null,
        phone: calculatorData.phone || calculatorData.contact || null,
        email: calculatorData.email || null,
        city: calculatorData.city,
        state: calculatorData.state || null,
        system_size: parseFloat(calculatorData.systemSize) || parseFloat(calculatorData.capacity),
        monthly_bill: parseFloat(calculatorData.monthlyBill) || parseFloat(calculatorData.bill) || null,
        purchase_type: calculatorData.purchaseType || null,
        estimated_cost: parseFloat(calculatorData.estimatedCost) || null,
        estimated_savings: parseFloat(calculatorData.estimatedSavings) || null,
        payback_years: parseFloat(calculatorData.paybackYears) || null,
        source: 'calculator',
        status: 'new'
    };
    
    return await saveLead(leadData);
}

/**
 * Save Contact Form Lead
 * @param {Object} contactData - Contact form data
 * @returns {Promise<Object>} - Save result
 */
async function saveContactLead(contactData) {
    const leadData = {
        name: contactData.name,
        phone: contactData.phone || null,
        email: contactData.email,
        city: contactData.city || 'Not specified',
        state: contactData.state || null,
        system_size: 0, // Default for contact form
        source: 'contact_form',
        status: 'new',
        notes: contactData.message || null
    };
    
    return await saveLead(leadData);
}

/**
 * Get All Leads (Admin Only)
 * @returns {Promise<Array>} - Array of leads
 */
async function getAllLeads() {
    if (!window.supabaseAuth || !window.supabaseAuth.isAvailable()) {
        console.warn('⚠️ Supabase not available');
        return [];
    }
    
    try {
        const { data, error } = await window.supabaseAuth.client
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('❌ Error fetching leads:', error.message);
            return [];
        }
        
        console.log(`✅ Fetched ${data.length} leads`);
        return data;
    } catch (error) {
        console.error('❌ Exception fetching leads:', error);
        return [];
    }
}

/**
 * Update Lead Status (Admin Only)
 * @param {string} leadId - Lead ID
 * @param {string} status - New status
 * @param {Object} additionalData - Additional data to update
 * @returns {Promise<Object>} - Update result
 */
async function updateLeadStatus(leadId, status, additionalData = {}) {
    if (!window.supabaseAuth || !window.supabaseAuth.isAvailable()) {
        return { success: false, error: 'Supabase not available' };
    }
    
    try {
        const updateData = {
            status: status,
            ...additionalData
        };
        
        // Add timestamp for status changes
        if (status === 'contacted' && !updateData.contacted_at) {
            updateData.contacted_at = new Date().toISOString();
        }
        if (status === 'converted' && !updateData.converted_at) {
            updateData.converted_at = new Date().toISOString();
        }
        
        const { data, error } = await window.supabaseAuth.client
            .from('leads')
            .update(updateData)
            .eq('id', leadId)
            .select()
            .single();
        
        if (error) {
            console.error('❌ Error updating lead:', error.message);
            return { success: false, error: error.message };
        }
        
        console.log('✅ Lead updated successfully:', leadId);
        return { success: true, data: data };
    } catch (error) {
        console.error('❌ Exception updating lead:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get Lead Statistics (Admin Only)
 * @returns {Promise<Object>} - Lead statistics
 */
async function getLeadStatistics() {
    if (!window.supabaseAuth || !window.supabaseAuth.isAvailable()) {
        return null;
    }
    
    try {
        const leads = await getAllLeads();
        
        const stats = {
            total: leads.length,
            new: leads.filter(l => l.status === 'new').length,
            contacted: leads.filter(l => l.status === 'contacted').length,
            qualified: leads.filter(l => l.status === 'qualified').length,
            proposalSent: leads.filter(l => l.status === 'proposal_sent').length,
            converted: leads.filter(l => l.status === 'converted').length,
            lost: leads.filter(l => l.status === 'lost').length,
            byCity: {},
            avgSystemSize: 0,
            totalPotentialRevenue: 0
        };
        
        // Calculate by city
        leads.forEach(lead => {
            if (lead.city) {
                stats.byCity[lead.city] = (stats.byCity[lead.city] || 0) + 1;
            }
        });
        
        // Calculate averages
        if (leads.length > 0) {
            stats.avgSystemSize = leads.reduce((sum, l) => sum + (l.system_size || 0), 0) / leads.length;
            stats.totalPotentialRevenue = leads.reduce((sum, l) => sum + (l.estimated_cost || 0), 0);
        }
        
        return stats;
    } catch (error) {
        console.error('❌ Error calculating statistics:', error);
        return null;
    }
}

/**
 * Delete Lead (Admin Only)
 * @param {string} leadId - Lead ID
 * @returns {Promise<Object>} - Delete result
 */
async function deleteLead(leadId) {
    if (!window.supabaseAuth || !window.supabaseAuth.isAvailable()) {
        return { success: false, error: 'Supabase not available' };
    }
    
    try {
        const { error } = await window.supabaseAuth.client
            .from('leads')
            .delete()
            .eq('id', leadId);
        
        if (error) {
            console.error('❌ Error deleting lead:', error.message);
            return { success: false, error: error.message };
        }
        
        console.log('✅ Lead deleted successfully:', leadId);
        return { success: true };
    } catch (error) {
        console.error('❌ Exception deleting lead:', error);
        return { success: false, error: error.message };
    }
}

// Export functions for global use
window.leadTracker = {
    saveLead: saveLead,
    saveCalculatorLead: saveCalculatorLead,
    saveContactLead: saveContactLead,
    getAllLeads: getAllLeads,
    updateLeadStatus: updateLeadStatus,
    getLeadStatistics: getLeadStatistics,
    deleteLead: deleteLead
};

console.log('✅ Lead Tracker Module Loaded');
