// ============================================
// ADMIN DASHBOARD MODULE
// ============================================

console.log('👑 Admin Dashboard Module Loading...');

/**
 * Render Admin Dashboard Overview
 * Now uses comprehensive analytics dashboard
 */
function renderAdminDashboard() {
    console.log('👑 Rendering Admin Dashboard...');
    
    const container = document.getElementById('adminDashboardContent');
    if (!container) return;
    
    // Check if analytics module is available
    if (window.renderAdminAnalyticsDashboard) {
        // Use new comprehensive analytics dashboard
        window.renderAdminAnalyticsDashboard();
    } else {
        // Fallback to simple overview (for demo mode)
        renderSimpleAdminOverview();
    }
    
    console.log('✅ Admin Dashboard rendered');
}

/**
 * Render Simple Admin Overview (Fallback)
 */
function renderSimpleAdminOverview() {
    const container = document.getElementById('adminDashboardContent');
    if (!container) return;
    
    const users = window.getAllUsers ? window.getAllUsers() : [];
    const totalCustomers = users.filter(u => u.role === 'customer').length;
    const totalCapacity = users.reduce((sum, u) => sum + (u.profile?.systemSize || 0), 0);
    const avgHealthScore = users.length > 0 
        ? Math.round(users.reduce((sum, u) => sum + (u.system?.healthScore || 0), 0) / users.length)
        : 0;
    const activeComplaints = users.reduce((sum, u) => sum + (u.complaints?.filter(c => c.status !== 'closed').length || 0), 0);
    
    container.innerHTML = `
        <div class="admin-overview-grid">
            <div class="admin-stat-card">
                <div class="admin-stat-icon">👥</div>
                <div class="admin-stat-content">
                    <div class="admin-stat-value">${totalCustomers}</div>
                    <div class="admin-stat-label">Total Customers</div>
                </div>
            </div>
            
            <div class="admin-stat-card">
                <div class="admin-stat-icon">⚡</div>
                <div class="admin-stat-content">
                    <div class="admin-stat-value">${totalCapacity} kW</div>
                    <div class="admin-stat-label">Total Capacity</div>
                </div>
            </div>
            
            <div class="admin-stat-card">
                <div class="admin-stat-icon">🎯</div>
                <div class="admin-stat-content">
                    <div class="admin-stat-value">${avgHealthScore}%</div>
                    <div class="admin-stat-label">Avg Health Score</div>
                </div>
            </div>
            
            <div class="admin-stat-card">
                <div class="admin-stat-icon">🛠️</div>
                <div class="admin-stat-content">
                    <div class="admin-stat-value">${activeComplaints}</div>
                    <div class="admin-stat-label">Active Complaints</div>
                </div>
            </div>
        </div>
        
        <div class="admin-section-card">
            <div class="admin-section-header">
                <h3>Recent Activity</h3>
            </div>
            <div class="admin-section-content">
                ${renderRecentActivity(users)}
            </div>
        </div>
    `;
}

/**
 * Render Recent Activity
 */
function renderRecentActivity(users) {
    const recentUsers = users
        .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
        .slice(0, 5);
    
    if (recentUsers.length === 0) {
        return '<p style="color: var(--text-tertiary); text-align: center; padding: 2rem;">No recent activity</p>';
    }
    
    let html = '<div class="activity-list">';
    recentUsers.forEach(user => {
        const timeAgo = getTimeAgo(user.lastUpdated);
        html += `
            <div class="activity-item">
                <div class="activity-icon">👤</div>
                <div class="activity-content">
                    <div class="activity-text"><strong>${user.profile.name}</strong> updated their profile</div>
                    <div class="activity-time">${timeAgo}</div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    return html;
}

/**
 * Render Admin Customers List
 */
function renderAdminCustomers() {
    console.log('👥 Rendering Admin Customers...');
    
    const container = document.getElementById('adminCustomersContent');
    if (!container) return;
    
    const users = window.getAllUsers().filter(u => u.role === 'customer');
    
    let html = `
        <div class="admin-section-card">
            <div class="admin-section-header">
                <h3>All Customers (${users.length})</h3>
            </div>
            <div class="admin-table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>System ID</th>
                            <th>Size</th>
                            <th>Location</th>
                            <th>Health</th>
                            <th>Status</th>
                            <th>Complaints</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    users.forEach(user => {
        const activeComplaints = user.complaints?.filter(c => c.status !== 'closed').length || 0;
        html += `
            <tr>
                <td>
                    <div class="customer-cell">
                        <div class="customer-avatar">👤</div>
                        <div>
                            <div class="customer-name">${user.profile.name}</div>
                            <div class="customer-email">${user.profile.email}</div>
                        </div>
                    </div>
                </td>
                <td>${user.system.systemId}</td>
                <td>${user.profile.systemSize} kW</td>
                <td>${user.profile.city || user.profile.location || 'N/A'}</td>
                <td>
                    <span class="health-badge health-${user.system.healthScore >= 95 ? 'excellent' : 'good'}">
                        ${user.system.healthScore}%
                    </span>
                </td>
                <td>
                    <span class="status-badge status-${user.system.status}">
                        ${user.system.status}
                    </span>
                </td>
                <td>
                    ${activeComplaints > 0 ? `<span class="complaint-count">${activeComplaints}</span>` : '-'}
                </td>
                <td>
                    <button class="admin-btn-small" onclick="viewCustomerDetails('${user.id}')">
                        View Details
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    console.log('✅ Admin Customers rendered');
}

/**
 * View Customer Details
 */
function viewCustomerDetails(userId) {
    const user = window.getUserById(userId);
    if (!user) {
        alert('User not found');
        return;
    }
    
    const container = document.getElementById('adminCustomersContent');
    if (!container) return;
    
    container.innerHTML = `
        <div class="admin-section-card">
            <div class="admin-section-header">
                <button class="admin-btn-small" onclick="renderAdminCustomers()">
                    ← Back to Customers
                </button>
                <h3>Customer Details: ${user.profile.name}</h3>
            </div>
            
            <div class="user-detail-grid">
                <!-- Profile Section -->
                <div class="detail-section">
                    <h4 class="detail-section-title">👤 Profile Information</h4>
                    <div class="detail-content">
                        <div class="detail-row">
                            <span class="detail-label">Name</span>
                            <span class="detail-value">${user.profile.name}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Email</span>
                            <span class="detail-value">${user.profile.email}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Phone</span>
                            <span class="detail-value">${user.profile.phone || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Plant Name</span>
                            <span class="detail-value">${user.profile.plantName || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Location</span>
                            <span class="detail-value">${user.profile.city}, ${user.profile.state}</span>
                        </div>
                    </div>
                </div>
                
                <!-- System Section -->
                <div class="detail-section">
                    <h4 class="detail-section-title">⚡ System Information</h4>
                    <div class="detail-content">
                        <div class="detail-row">
                            <span class="detail-label">System ID</span>
                            <span class="detail-value">${user.system.systemId}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">System Size</span>
                            <span class="detail-value">${user.profile.systemSize} kW</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Install Date</span>
                            <span class="detail-value">${formatDate(user.system.installDate)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Status</span>
                            <span class="status-badge status-${user.system.status}">${user.system.status}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Health Score</span>
                            <span class="health-badge health-${user.system.healthScore >= 95 ? 'excellent' : 'good'}">
                                ${user.system.healthScore}%
                            </span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Efficiency</span>
                            <span class="detail-value">${user.system.efficiency}%</span>
                        </div>
                    </div>
                </div>
                
                <!-- Financial Section -->
                <div class="detail-section">
                    <h4 class="detail-section-title">💰 Financial Information</h4>
                    <div class="detail-content">
                        <div class="detail-row">
                            <span class="detail-label">Installation Cost</span>
                            <span class="detail-value">₹${user.profile.installationCost.toLocaleString('en-IN')}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Purchase Type</span>
                            <span class="detail-value">${user.profile.purchaseType === 'loan' ? 'Loan' : 'Cash'}</span>
                        </div>
                        ${user.profile.purchaseType === 'loan' ? `
                            <div class="detail-row">
                                <span class="detail-label">Down Payment</span>
                                <span class="detail-value">₹${user.profile.downPayment.toLocaleString('en-IN')}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Interest Rate</span>
                                <span class="detail-value">${user.profile.interestRate}%</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Loan Tenure</span>
                                <span class="detail-value">${user.profile.loanTenure} years</span>
                            </div>
                        ` : ''}
                        <div class="detail-row">
                            <span class="detail-label">Tariff Rate</span>
                            <span class="detail-value">₹${user.profile.tariff}/kWh</span>
                        </div>
                    </div>
                </div>
                
                <!-- ROI Section -->
                <div class="detail-section">
                    <h4 class="detail-section-title">📊 ROI Information</h4>
                    <div class="detail-content">
                        <div class="detail-row">
                            <span class="detail-label">Payback Period</span>
                            <span class="detail-value">${user.roi.paybackYears} years</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">10-Year Savings</span>
                            <span class="detail-value">₹${user.roi.savings10Years.toLocaleString('en-IN')}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">25-Year Savings</span>
                            <span class="detail-value">₹${user.roi.savings25Years.toLocaleString('en-IN')}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">25-Year Net Profit</span>
                            <span class="detail-value">₹${user.roi.netProfit25Years.toLocaleString('en-IN')}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">ROI (25 Years)</span>
                            <span class="detail-value">${user.roi.roiPercent25}%</span>
                        </div>
                    </div>
                </div>
                
                <!-- Performance Section -->
                <div class="detail-section">
                    <h4 class="detail-section-title">📈 Performance Data</h4>
                    <div class="detail-content">
                        <div class="detail-row">
                            <span class="detail-label">Total Generation</span>
                            <span class="detail-value">${user.system.totalGeneration.toLocaleString()} kWh</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Today's Generation</span>
                            <span class="detail-value">${user.system.todayGeneration} kWh</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Live Power</span>
                            <span class="detail-value">${user.system.livePower} kW</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Consumption</span>
                            <span class="detail-value">${user.system.consumption} kWh</span>
                        </div>
                    </div>
                </div>
                
                <!-- Complaints Section -->
                <div class="detail-section detail-section-full">
                    <h4 class="detail-section-title">🛠️ Complaints (${user.complaints?.length || 0})</h4>
                    <div class="detail-content">
                        ${renderUserComplaints(user)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render User Complaints
 */
function renderUserComplaints(user) {
    if (!user.complaints || user.complaints.length === 0) {
        return '<p style="color: var(--text-tertiary); padding: 1rem;">No complaints submitted</p>';
    }
    
    let html = '<div class="complaints-detail-list">';
    user.complaints.forEach(complaint => {
        html += `
            <div class="complaint-detail-item">
                <div class="complaint-detail-header">
                    <div>
                        <strong>${complaint.type}</strong>
                        <span class="complaint-ref-small">${complaint.id}</span>
                    </div>
                    <span class="complaint-status-badge status-${complaint.status}">
                        ${complaint.status}
                    </span>
                </div>
                <p class="complaint-detail-desc">${complaint.description}</p>
                <div class="complaint-detail-meta">
                    <span>Priority: <strong>${complaint.priority}</strong></span>
                    <span>Date: ${formatDate(complaint.date)}</span>
                    ${complaint.assignedTo ? `<span>Assigned: ${complaint.assignedTo}</span>` : ''}
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    return html;
}

/**
 * Render Admin Systems List
 */
function renderAdminSystems() {
    console.log('⚡ Rendering Admin Systems...');
    
    const container = document.getElementById('adminSystemsContent');
    if (!container) return;
    
    container.innerHTML = `
        <div class="admin-section-card">
            <div class="admin-section-header">
                <h3>All Solar Systems</h3>
            </div>
            <div class="admin-section-content">
                <p style="color: var(--text-tertiary); text-align: center; padding: 2rem;">
                    System monitoring and management interface will appear here
                </p>
            </div>
        </div>
    `;
    
    console.log('✅ Admin Systems rendered');
}

/**
 * Render Admin Complaints List
 */
function renderAdminComplaints() {
    console.log('🛠️ Rendering Admin Complaints...');
    
    const container = document.getElementById('adminComplaintsContent');
    if (!container) return;
    
    const users = window.getAllUsers();
    const allComplaints = [];
    
    users.forEach(user => {
        if (user.complaints) {
            user.complaints.forEach(complaint => {
                allComplaints.push({
                    ...complaint,
                    userName: user.profile.name,
                    userEmail: user.profile.email,
                    userId: user.id
                });
            });
        }
    });
    
    container.innerHTML = `
        <div class="admin-section-card">
            <div class="admin-section-header">
                <h3>All Customer Complaints (${allComplaints.length})</h3>
            </div>
            <div class="admin-section-content">
                ${allComplaints.length > 0 ? renderComplaintsList(allComplaints) : '<p style="color: var(--text-tertiary); text-align: center; padding: 2rem;">No complaints submitted</p>'}
            </div>
        </div>
    `;
    
    console.log('✅ Admin Complaints rendered');
}

/**
 * Render Complaints List
 */
function renderComplaintsList(complaints) {
    let html = '<div class="admin-complaints-list">';
    
    complaints.forEach(complaint => {
        html += `
            <div class="admin-complaint-item">
                <div class="admin-complaint-header">
                    <div>
                        <strong>${complaint.userName}</strong>
                        <span class="complaint-ref-small">${complaint.id}</span>
                    </div>
                    <span class="complaint-status-badge status-${complaint.status}">
                        ${complaint.status}
                    </span>
                </div>
                <p class="admin-complaint-desc">${complaint.description}</p>
                <div class="admin-complaint-footer">
                    <span>Type: ${complaint.type}</span>
                    <span>Priority: ${complaint.priority}</span>
                    <span>Date: ${formatDate(complaint.date)}</span>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

/**
 * Render Admin Reports
 */
function renderAdminReports() {
    console.log('📊 Rendering Admin Reports...');
    
    const container = document.getElementById('adminReportsContent');
    if (!container) return;
    
    container.innerHTML = `
        <div class="admin-section-card">
            <div class="admin-section-header">
                <h3>System Reports</h3>
            </div>
            <div class="admin-section-content">
                <p style="color: var(--text-tertiary); text-align: center; padding: 2rem;">
                    Analytics and reporting dashboard will appear here
                </p>
            </div>
        </div>
    `;
    
    console.log('✅ Admin Reports rendered');
}

/**
 * Render Admin Settings
 */
function renderAdminSettings() {
    console.log('⚙️ Rendering Admin Settings...');
    
    const container = document.getElementById('adminSettingsContent');
    if (!container) return;
    
    container.innerHTML = `
        <div class="admin-section-card">
            <div class="admin-section-header">
                <h3>Admin Settings</h3>
            </div>
            <div class="admin-section-content">
                <p style="color: var(--text-tertiary); text-align: center; padding: 2rem;">
                    System configuration and admin settings will appear here
                </p>
            </div>
        </div>
    `;
    
    console.log('✅ Admin Settings rendered');
}

/**
 * Format Date
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Get Time Ago
 */
function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
}

// Export functions for global use
window.renderAdminDashboard = renderAdminDashboard;
window.renderAdminCustomers = renderAdminCustomers;
window.renderAdminSystems = renderAdminSystems;
window.renderAdminComplaints = renderAdminComplaints;
window.renderAdminReports = renderAdminReports;
window.renderAdminSettings = renderAdminSettings;
window.viewCustomerDetails = viewCustomerDetails;

console.log('✅ Admin Dashboard Module Loaded');
