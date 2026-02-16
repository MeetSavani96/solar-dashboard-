// ============================================
// ADMIN LEADS MANAGEMENT MODULE
// ============================================

console.log('📊 Admin Leads Module Loading...');

/**
 * Render Admin Leads Section
 */
async function renderAdminLeads() {
    console.log('📊 Rendering Admin Leads...');
    
    const container = document.getElementById('adminLeadsContent');
    if (!container) return;
    
    // Show loading state
    container.innerHTML = '<div class="loading-state">Loading leads...</div>';
    
    // Get leads from Supabase
    const leads = await window.leadTracker.getAllLeads();
    const stats = await window.leadTracker.getLeadStatistics();
    
    if (!leads || leads.length === 0) {
        container.innerHTML = `
            <div class="admin-section-card">
                <div class="admin-section-header">
                    <h3>Sales Leads</h3>
                </div>
                <div class="empty-state">
                    <div class="empty-icon">📊</div>
                    <h3>No Leads Yet</h3>
                    <p>Calculator submissions will appear here automatically</p>
                </div>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    // Statistics Cards
    if (stats) {
        html += `
            <div class="leads-stats-grid">
                <div class="lead-stat-card">
                    <div class="lead-stat-icon">📊</div>
                    <div class="lead-stat-content">
                        <div class="lead-stat-value">${stats.total}</div>
                        <div class="lead-stat-label">Total Leads</div>
                    </div>
                </div>
                
                <div class="lead-stat-card new">
                    <div class="lead-stat-icon">🆕</div>
                    <div class="lead-stat-content">
                        <div class="lead-stat-value">${stats.new}</div>
                        <div class="lead-stat-label">New Leads</div>
                    </div>
                </div>
                
                <div class="lead-stat-card contacted">
                    <div class="lead-stat-icon">📞</div>
                    <div class="lead-stat-content">
                        <div class="lead-stat-value">${stats.contacted}</div>
                        <div class="lead-stat-label">Contacted</div>
                    </div>
                </div>
                
                <div class="lead-stat-card converted">
                    <div class="lead-stat-icon">✅</div>
                    <div class="lead-stat-content">
                        <div class="lead-stat-value">${stats.converted}</div>
                        <div class="lead-stat-label">Converted</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Leads Table
    html += `
        <div class="admin-section-card">
            <div class="admin-section-header">
                <h3>All Leads (${leads.length})</h3>
                <div class="leads-filters">
                    <select class="filter-select" id="statusFilter" onchange="filterLeadsByStatus(this.value)">
                        <option value="all">All Status</option>
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="proposal_sent">Proposal Sent</option>
                        <option value="converted">Converted</option>
                        <option value="lost">Lost</option>
                    </select>
                </div>
            </div>
            <div class="admin-table-container">
                <table class="admin-table leads-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Name</th>
                            <th>Contact</th>
                            <th>City</th>
                            <th>System Size</th>
                            <th>Purchase Type</th>
                            <th>Est. Cost</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="leadsTableBody">
                        ${renderLeadsTableRows(leads)}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    console.log('✅ Admin Leads rendered');
}

/**
 * Render Leads Table Rows
 */
function renderLeadsTableRows(leads) {
    if (!leads || leads.length === 0) {
        return '<tr><td colspan="9" style="text-align: center; padding: 2rem;">No leads found</td></tr>';
    }
    
    let html = '';
    leads.forEach(lead => {
        const date = new Date(lead.created_at).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const statusClass = getStatusClass(lead.status);
        const statusText = getStatusText(lead.status);
        
        html += `
            <tr class="lead-row" data-lead-id="${lead.id}">
                <td>${date}</td>
                <td>
                    <div class="lead-name-cell">
                        <strong>${lead.name || 'Anonymous'}</strong>
                        ${lead.source === 'calculator' ? '<span class="source-badge">Calculator</span>' : ''}
                    </div>
                </td>
                <td>
                    ${lead.phone ? `<a href="tel:${lead.phone}" class="contact-link">📞 ${lead.phone}</a>` : '-'}
                    ${lead.email ? `<br><a href="mailto:${lead.email}" class="contact-link">✉️ ${lead.email}</a>` : ''}
                </td>
                <td>${lead.city || '-'}</td>
                <td><strong>${lead.system_size} kW</strong></td>
                <td>${lead.purchase_type ? `<span class="purchase-badge ${lead.purchase_type}">${lead.purchase_type}</span>` : '-'}</td>
                <td>${lead.estimated_cost ? `₹${lead.estimated_cost.toLocaleString('en-IN')}` : '-'}</td>
                <td>
                    <select class="status-select ${statusClass}" onchange="updateLeadStatusFromSelect('${lead.id}', this.value)">
                        <option value="new" ${lead.status === 'new' ? 'selected' : ''}>New</option>
                        <option value="contacted" ${lead.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                        <option value="qualified" ${lead.status === 'qualified' ? 'selected' : ''}>Qualified</option>
                        <option value="proposal_sent" ${lead.status === 'proposal_sent' ? 'selected' : ''}>Proposal Sent</option>
                        <option value="converted" ${lead.status === 'converted' ? 'selected' : ''}>Converted</option>
                        <option value="lost" ${lead.status === 'lost' ? 'selected' : ''}>Lost</option>
                    </select>
                </td>
                <td>
                    <button class="admin-btn-small" onclick="viewLeadDetails('${lead.id}')">View</button>
                </td>
            </tr>
        `;
    });
    
    return html;
}

/**
 * Get Status Class
 */
function getStatusClass(status) {
    const classes = {
        'new': 'status-new',
        'contacted': 'status-contacted',
        'qualified': 'status-qualified',
        'proposal_sent': 'status-proposal',
        'converted': 'status-converted',
        'lost': 'status-lost'
    };
    return classes[status] || 'status-new';
}

/**
 * Get Status Text
 */
function getStatusText(status) {
    const texts = {
        'new': 'New',
        'contacted': 'Contacted',
        'qualified': 'Qualified',
        'proposal_sent': 'Proposal Sent',
        'converted': 'Converted',
        'lost': 'Lost'
    };
    return texts[status] || status;
}

/**
 * Update Lead Status from Select
 */
async function updateLeadStatusFromSelect(leadId, newStatus) {
    console.log('Updating lead status:', leadId, newStatus);
    
    const result = await window.leadTracker.updateLeadStatus(leadId, newStatus);
    
    if (result.success) {
        console.log('✅ Lead status updated');
        // Show success message
        if (window.showToast) {
            window.showToast('Lead status updated successfully');
        }
    } else {
        console.error('❌ Failed to update lead status:', result.error);
        alert('Failed to update lead status: ' + result.error);
        // Reload to reset
        renderAdminLeads();
    }
}

/**
 * Filter Leads by Status
 */
function filterLeadsByStatus(status) {
    const rows = document.querySelectorAll('.lead-row');
    
    rows.forEach(row => {
        const select = row.querySelector('.status-select');
        const currentStatus = select.value;
        
        if (status === 'all' || currentStatus === status) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

/**
 * View Lead Details
 */
function viewLeadDetails(leadId) {
    console.log('Viewing lead details:', leadId);
    alert('Lead details view coming soon!\n\nLead ID: ' + leadId);
}

// Export functions for global use
window.renderAdminLeads = renderAdminLeads;
window.updateLeadStatusFromSelect = updateLeadStatusFromSelect;
window.filterLeadsByStatus = filterLeadsByStatus;
window.viewLeadDetails = viewLeadDetails;

console.log('✅ Admin Leads Module Loaded');
