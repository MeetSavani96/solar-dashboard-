// ============================================
// ADMIN ANALYTICS DASHBOARD MODULE
// Comprehensive analytics for business insights
// ============================================

console.log('📊 Admin Analytics Module Loading...');

// Global state for analytics
const analyticsState = {
    timeFilter: 30, // Default: Last 30 days
    charts: {},
    data: {
        customers: [],
        leads: [],
        roiData: [],
        complaints: []
    }
};

/**
 * Initialize Admin Analytics Dashboard
 */
async function initAdminAnalytics() {
    console.log('📊 Initializing Admin Analytics...');
    
    // Show loading state
    showAnalyticsLoader();
    
    try {
        // Fetch all required data
        await loadAnalyticsData();
        
        // Render all sections
        renderOverviewKPIs();
        renderLeadAnalytics();
        renderROIAnalytics();
        renderCustomerAnalytics();
        renderComplaintInsights();
        
        // Hide loader
        hideAnalyticsLoader();
        
        console.log('✅ Admin Analytics initialized');
    } catch (error) {
        console.error('❌ Error initializing analytics:', error);
        showAnalyticsError();
    }
}

/**
 * Load All Analytics Data
 */
async function loadAnalyticsData() {
    if (!window.supabaseAuth || !window.supabaseAuth.isAvailable()) {
        console.warn('⚠️ Supabase not available');
        return;
    }

    
    try {
        // Calculate date range based on filter
        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - analyticsState.timeFilter);
        
        // Fetch customers with profiles and ROI data
        const { data: customers, error: customersError } = await window.supabaseAuth.client
            .from('users')
            .select(`
                *,
                user_profiles(*),
                roi_data(*),
                system_data(*)
            `)
            .eq('role', 'customer')
            .order('created_at', { ascending: false });
        
        if (customersError) throw customersError;
        analyticsState.data.customers = customers || [];
        
        // Fetch leads
        const { data: leads, error: leadsError } = await window.supabaseAuth.client
            .from('leads')
            .select('*')
            .gte('created_at', dateFrom.toISOString())
            .order('created_at', { ascending: false });
        
        if (leadsError) throw leadsError;
        analyticsState.data.leads = leads || [];
        
        // Fetch complaints
        const { data: complaints, error: complaintsError } = await window.supabaseAuth.client
            .from('complaints')
            .select('*')
            .gte('created_at', dateFrom.toISOString())
            .order('created_at', { ascending: false });
        
        if (complaintsError) throw complaintsError;
        analyticsState.data.complaints = complaints || [];
        
        console.log('✅ Analytics data loaded:', {
            customers: analyticsState.data.customers.length,
            leads: analyticsState.data.leads.length,
            complaints: analyticsState.data.complaints.length
        });
    } catch (error) {
        console.error('❌ Error loading analytics data:', error);
        throw error;
    }
}

/**
 * Render Overview KPI Cards
 */
function renderOverviewKPIs() {
    const container = document.getElementById('analyticsOverviewKPIs');
    if (!container) return;
    
    const customers = analyticsState.data.customers;
    const leads = analyticsState.data.leads;
    const complaints = analyticsState.data.complaints;
    
    // Calculate KPIs
    const totalCustomers = customers.length;
    const totalCapacity = customers.reduce((sum, c) => {
        return sum + (c.user_profiles?.[0]?.system_size || 0);
    }, 0);
    const totalLeads = leads.length;
    const convertedLeads = leads.filter(l => l.status === 'converted').length;
    const activeComplaints = complaints.filter(c => c.status === 'new' || c.status === 'in_progress').length;
    const avgROI = customers.length > 0 
        ? customers.reduce((sum, c) => sum + (c.roi_data?.[0]?.roi_percent || 0), 0) / customers.length
        : 0;
    
    container.innerHTML = `
        <div class="analytics-kpi-grid">
            <div class="analytics-kpi-card kpi-primary">
                <div class="kpi-icon-large">👥</div>
                <div class="kpi-content-large">
                    <div class="kpi-value-huge">${totalCustomers}</div>
                    <div class="kpi-label-large">Total Customers</div>
                    <div class="kpi-helper">Active solar installations</div>
                </div>
            </div>
            
            <div class="analytics-kpi-card kpi-secondary">
                <div class="kpi-icon-large">⚡</div>
                <div class="kpi-content-large">
                    <div class="kpi-value-huge">${totalCapacity.toFixed(1)} kW</div>
                    <div class="kpi-label-large">Total Capacity</div>
                    <div class="kpi-helper">Installed solar power</div>
                </div>
            </div>
            
            <div class="analytics-kpi-card kpi-accent">
                <div class="kpi-icon-large">📊</div>
                <div class="kpi-content-large">
                    <div class="kpi-value-huge">${totalLeads}</div>
                    <div class="kpi-label-large">Calculator Leads</div>
                    <div class="kpi-helper">Last ${analyticsState.timeFilter} days</div>
                </div>
            </div>
            
            <div class="analytics-kpi-card kpi-success">
                <div class="kpi-icon-large">✅</div>
                <div class="kpi-content-large">
                    <div class="kpi-value-huge">${convertedLeads}</div>
                    <div class="kpi-label-large">Converted Leads</div>
                    <div class="kpi-helper">${totalLeads > 0 ? ((convertedLeads/totalLeads)*100).toFixed(1) : 0}% conversion rate</div>
                </div>
            </div>
            
            <div class="analytics-kpi-card kpi-warning">
                <div class="kpi-icon-large">🛠️</div>
                <div class="kpi-content-large">
                    <div class="kpi-value-huge">${activeComplaints}</div>
                    <div class="kpi-label-large">Active Complaints</div>
                    <div class="kpi-helper">Pending resolution</div>
                </div>
            </div>
            
            <div class="analytics-kpi-card kpi-info">
                <div class="kpi-icon-large">💰</div>
                <div class="kpi-content-large">
                    <div class="kpi-value-huge">${avgROI.toFixed(1)}%</div>
                    <div class="kpi-label-large">Average ROI</div>
                    <div class="kpi-helper">Customer returns</div>
                </div>
            </div>
        </div>
    `;
}


/**
 * Render Lead Analytics Section
 */
function renderLeadAnalytics() {
    const container = document.getElementById('analyticsLeads');
    if (!container) return;
    
    const leads = analyticsState.data.leads;
    
    // Calculate lead statistics
    const statusBreakdown = {
        new: leads.filter(l => l.status === 'new').length,
        contacted: leads.filter(l => l.status === 'contacted').length,
        qualified: leads.filter(l => l.status === 'qualified').length,
        proposal_sent: leads.filter(l => l.status === 'proposal_sent').length,
        converted: leads.filter(l => l.status === 'converted').length,
        lost: leads.filter(l => l.status === 'lost').length
    };
    
    const purchaseTypeBreakdown = {
        cash: leads.filter(l => l.purchase_type === 'cash').length,
        loan: leads.filter(l => l.purchase_type === 'loan').length,
        unknown: leads.filter(l => !l.purchase_type).length
    };
    
    // Top cities
    const cityCount = {};
    leads.forEach(lead => {
        if (lead.city) {
            cityCount[lead.city] = (cityCount[lead.city] || 0) + 1;
        }
    });
    const topCities = Object.entries(cityCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    container.innerHTML = `
        <div class="analytics-section-card">
            <div class="analytics-section-header">
                <div class="header-content">
                    <h3 class="section-title">📊 Leads & Sales Analytics</h3>
                    <p class="section-subtitle">Lead pipeline and conversion insights</p>
                </div>
            </div>
            
            <div class="analytics-grid-2col">
                <!-- Lead Status Breakdown -->
                <div class="analytics-chart-card">
                    <h4 class="chart-card-title">Leads by Status</h4>
                    <canvas id="leadStatusChart" height="250"></canvas>
                </div>
                
                <!-- Purchase Type Distribution -->
                <div class="analytics-chart-card">
                    <h4 class="chart-card-title">Cash vs Loan</h4>
                    <canvas id="purchaseTypeChart" height="250"></canvas>
                </div>
            </div>
            
            <!-- Top Cities -->
            <div class="analytics-list-card">
                <h4 class="list-card-title">🏙️ Top Cities by Leads</h4>
                <div class="city-list">
                    ${topCities.length > 0 ? topCities.map((city, index) => `
                        <div class="city-item">
                            <div class="city-rank">#${index + 1}</div>
                            <div class="city-name">${city[0]}</div>
                            <div class="city-count">${city[1]} leads</div>
                            <div class="city-bar">
                                <div class="city-bar-fill" style="width: ${(city[1] / topCities[0][1]) * 100}%"></div>
                            </div>
                        </div>
                    `).join('') : '<p class="empty-state">No city data available</p>'}
                </div>
            </div>
        </div>
    `;
    
    // Render charts
    renderLeadStatusChart(statusBreakdown);
    renderPurchaseTypeChart(purchaseTypeBreakdown);
}

/**
 * Render Lead Status Chart
 */
function renderLeadStatusChart(statusBreakdown) {
    const canvas = document.getElementById('leadStatusChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if any
    if (analyticsState.charts.leadStatus) {
        analyticsState.charts.leadStatus.destroy();
    }
    
    analyticsState.charts.leadStatus = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Converted', 'Lost'],
            datasets: [{
                label: 'Number of Leads',
                data: [
                    statusBreakdown.new,
                    statusBreakdown.contacted,
                    statusBreakdown.qualified,
                    statusBreakdown.proposal_sent,
                    statusBreakdown.converted,
                    statusBreakdown.lost
                ],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(251, 191, 36, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderColor: [
                    'rgb(59, 130, 246)',
                    'rgb(251, 191, 36)',
                    'rgb(139, 92, 246)',
                    'rgb(236, 72, 153)',
                    'rgb(34, 197, 94)',
                    'rgb(239, 68, 68)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14 },
                    bodyFont: { size: 13 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

/**
 * Render Purchase Type Chart
 */
function renderPurchaseTypeChart(purchaseTypeBreakdown) {
    const canvas = document.getElementById('purchaseTypeChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if any
    if (analyticsState.charts.purchaseType) {
        analyticsState.charts.purchaseType.destroy();
    }
    
    analyticsState.charts.purchaseType = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Cash', 'Loan', 'Not Specified'],
            datasets: [{
                data: [
                    purchaseTypeBreakdown.cash,
                    purchaseTypeBreakdown.loan,
                    purchaseTypeBreakdown.unknown
                ],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(156, 163, 175, 0.8)'
                ],
                borderColor: [
                    'rgb(34, 197, 94)',
                    'rgb(59, 130, 246)',
                    'rgb(156, 163, 175)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}


/**
 * Render ROI & Financial Analytics Section
 */
function renderROIAnalytics() {
    const container = document.getElementById('analyticsROI');
    if (!container) return;
    
    const customers = analyticsState.data.customers;
    
    // Calculate ROI statistics
    let totalAnnualSavings = 0;
    let totalPaybackYears = 0;
    let highestROI = { roi: 0, systemSize: 0, city: 'N/A' };
    let cashROI = [];
    let loanROI = [];
    let count = 0;
    
    customers.forEach(customer => {
        const profile = customer.user_profiles?.[0];
        const roi = customer.roi_data?.[0];
        
        if (roi && profile) {
            totalAnnualSavings += roi.annual_savings || 0;
            totalPaybackYears += roi.payback_years || 0;
            count++;
            
            // Track highest ROI
            if (roi.roi_percent > highestROI.roi) {
                highestROI = {
                    roi: roi.roi_percent,
                    systemSize: profile.system_size,
                    city: profile.city || 'N/A'
                };
            }
            
            // Separate by purchase type
            if (profile.purchase_type === 'cash') {
                cashROI.push(roi.roi_percent || 0);
            } else if (profile.purchase_type === 'loan') {
                loanROI.push(roi.roi_percent || 0);
            }
        }
    });
    
    const avgAnnualSavings = count > 0 ? totalAnnualSavings / count : 0;
    const avgPaybackYears = count > 0 ? totalPaybackYears / count : 0;
    const avgCashROI = cashROI.length > 0 ? cashROI.reduce((a, b) => a + b, 0) / cashROI.length : 0;
    const avgLoanROI = loanROI.length > 0 ? loanROI.reduce((a, b) => a + b, 0) / loanROI.length : 0;
    
    container.innerHTML = `
        <div class="analytics-section-card">
            <div class="analytics-section-header">
                <div class="header-content">
                    <h3 class="section-title">💰 ROI & Financial Analytics</h3>
                    <p class="section-subtitle">Customer returns and financial performance</p>
                </div>
            </div>
            
            <div class="analytics-grid-3col">
                <!-- Average Annual Savings -->
                <div class="analytics-stat-card stat-primary">
                    <div class="stat-icon">💵</div>
                    <div class="stat-content">
                        <div class="stat-value">₹${avgAnnualSavings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                        <div class="stat-label">Avg Annual Savings</div>
                        <div class="stat-helper">Per customer per year</div>
                    </div>
                </div>
                
                <!-- Average Payback Period -->
                <div class="analytics-stat-card stat-secondary">
                    <div class="stat-icon">⏱️</div>
                    <div class="stat-content">
                        <div class="stat-value">${avgPaybackYears.toFixed(1)} years</div>
                        <div class="stat-label">Avg Payback Period</div>
                        <div class="stat-helper">Time to break even</div>
                    </div>
                </div>
                
                <!-- Highest ROI System -->
                <div class="analytics-stat-card stat-accent">
                    <div class="stat-icon">🏆</div>
                    <div class="stat-content">
                        <div class="stat-value">${highestROI.roi.toFixed(1)}%</div>
                        <div class="stat-label">Highest ROI System</div>
                        <div class="stat-helper">${highestROI.systemSize} kW in ${highestROI.city}</div>
                    </div>
                </div>
            </div>
            
            <!-- Cash vs Loan ROI Comparison -->
            <div class="analytics-chart-card">
                <h4 class="chart-card-title">Cash vs Loan ROI Comparison</h4>
                <canvas id="roiComparisonChart" height="200"></canvas>
            </div>
        </div>
    `;
    
    // Render ROI comparison chart
    renderROIComparisonChart(avgCashROI, avgLoanROI);
}

/**
 * Render ROI Comparison Chart
 */
function renderROIComparisonChart(avgCashROI, avgLoanROI) {
    const canvas = document.getElementById('roiComparisonChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if any
    if (analyticsState.charts.roiComparison) {
        analyticsState.charts.roiComparison.destroy();
    }
    
    analyticsState.charts.roiComparison = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Cash Purchase', 'Loan Purchase'],
            datasets: [{
                label: 'Average ROI (%)',
                data: [avgCashROI, avgLoanROI],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(59, 130, 246, 0.8)'
                ],
                borderColor: [
                    'rgb(34, 197, 94)',
                    'rgb(59, 130, 246)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return `Average ROI: ${context.parsed.y.toFixed(1)}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}


/**
 * Render Customer & System Analytics Section
 */
function renderCustomerAnalytics() {
    const container = document.getElementById('analyticsCustomers');
    if (!container) return;
    
    const customers = analyticsState.data.customers;
    
    // System size ranges
    const sizeRanges = {
        small: 0,    // < 5 kW
        medium: 0,   // 5-10 kW
        large: 0     // > 10 kW
    };
    
    // Installation types
    const installationTypes = {
        residential: 0,
        commercial: 0,
        unknown: 0
    };
    
    // State/City distribution
    const stateCount = {};
    const cityCount = {};
    
    customers.forEach(customer => {
        const profile = customer.user_profiles?.[0];
        if (!profile) return;
        
        // System size categorization
        const size = profile.system_size || 0;
        if (size < 5) {
            sizeRanges.small++;
        } else if (size <= 10) {
            sizeRanges.medium++;
        } else {
            sizeRanges.large++;
        }
        
        // Installation type
        const type = profile.installation_type || 'unknown';
        if (type === 'residential') {
            installationTypes.residential++;
        } else if (type === 'commercial') {
            installationTypes.commercial++;
        } else {
            installationTypes.unknown++;
        }
        
        // State distribution
        if (profile.state) {
            stateCount[profile.state] = (stateCount[profile.state] || 0) + 1;
        }
        
        // City distribution
        if (profile.city) {
            cityCount[profile.city] = (cityCount[profile.city] || 0) + 1;
        }
    });
    
    // Top states and cities
    const topStates = Object.entries(stateCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    const topCities = Object.entries(cityCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    container.innerHTML = `
        <div class="analytics-section-card">
            <div class="analytics-section-header">
                <div class="header-content">
                    <h3 class="section-title">👥 Customer & System Analytics</h3>
                    <p class="section-subtitle">Customer segmentation and system distribution</p>
                </div>
            </div>
            
            <div class="analytics-grid-2col">
                <!-- System Size Distribution -->
                <div class="analytics-chart-card">
                    <h4 class="chart-card-title">System Size Distribution</h4>
                    <canvas id="systemSizeChart" height="250"></canvas>
                </div>
                
                <!-- Installation Type Distribution -->
                <div class="analytics-chart-card">
                    <h4 class="chart-card-title">Residential vs Commercial</h4>
                    <canvas id="installationTypeChart" height="250"></canvas>
                </div>
            </div>
            
            <div class="analytics-grid-2col">
                <!-- Top States -->
                <div class="analytics-list-card">
                    <h4 class="list-card-title">🗺️ Top States</h4>
                    <div class="location-list">
                        ${topStates.length > 0 ? topStates.map((state, index) => `
                            <div class="location-item">
                                <div class="location-rank">#${index + 1}</div>
                                <div class="location-name">${state[0]}</div>
                                <div class="location-count">${state[1]} customers</div>
                            </div>
                        `).join('') : '<p class="empty-state">No state data available</p>'}
                    </div>
                </div>
                
                <!-- Top Cities -->
                <div class="analytics-list-card">
                    <h4 class="list-card-title">🏙️ Top Cities</h4>
                    <div class="location-list">
                        ${topCities.length > 0 ? topCities.map((city, index) => `
                            <div class="location-item">
                                <div class="location-rank">#${index + 1}</div>
                                <div class="location-name">${city[0]}</div>
                                <div class="location-count">${city[1]} customers</div>
                            </div>
                        `).join('') : '<p class="empty-state">No city data available</p>'}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Render charts
    renderSystemSizeChart(sizeRanges);
    renderInstallationTypeChart(installationTypes);
}

/**
 * Render System Size Chart
 */
function renderSystemSizeChart(sizeRanges) {
    const canvas = document.getElementById('systemSizeChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if any
    if (analyticsState.charts.systemSize) {
        analyticsState.charts.systemSize.destroy();
    }
    
    analyticsState.charts.systemSize = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['< 5 kW (Small)', '5-10 kW (Medium)', '> 10 kW (Large)'],
            datasets: [{
                data: [sizeRanges.small, sizeRanges.medium, sizeRanges.large],
                backgroundColor: [
                    'rgba(251, 191, 36, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(139, 92, 246, 0.8)'
                ],
                borderColor: [
                    'rgb(251, 191, 36)',
                    'rgb(59, 130, 246)',
                    'rgb(139, 92, 246)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12
                }
            }
        }
    });
}

/**
 * Render Installation Type Chart
 */
function renderInstallationTypeChart(installationTypes) {
    const canvas = document.getElementById('installationTypeChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if any
    if (analyticsState.charts.installationType) {
        analyticsState.charts.installationType.destroy();
    }
    
    analyticsState.charts.installationType = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Residential', 'Commercial', 'Not Specified'],
            datasets: [{
                data: [
                    installationTypes.residential,
                    installationTypes.commercial,
                    installationTypes.unknown
                ],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(156, 163, 175, 0.8)'
                ],
                borderColor: [
                    'rgb(34, 197, 94)',
                    'rgb(59, 130, 246)',
                    'rgb(156, 163, 175)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12
                }
            }
        }
    });
}


/**
 * Render Complaint Insights Section
 */
function renderComplaintInsights() {
    const container = document.getElementById('analyticsComplaints');
    if (!container) return;
    
    const complaints = analyticsState.data.complaints;
    
    // Calculate complaint statistics
    const totalComplaints = complaints.length;
    const pendingComplaints = complaints.filter(c => c.status === 'new' || c.status === 'in_progress').length;
    const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length;
    
    // Calculate average resolution time
    let totalResolutionTime = 0;
    let resolvedCount = 0;
    
    complaints.forEach(complaint => {
        if (complaint.status === 'resolved' && complaint.resolved_at) {
            const created = new Date(complaint.created_at);
            const resolved = new Date(complaint.resolved_at);
            const diffDays = (resolved - created) / (1000 * 60 * 60 * 24);
            totalResolutionTime += diffDays;
            resolvedCount++;
        }
    });
    
    const avgResolutionTime = resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0;
    
    container.innerHTML = `
        <div class="analytics-section-card">
            <div class="analytics-section-header">
                <div class="header-content">
                    <h3 class="section-title">🛠️ Complaints & Support Insights</h3>
                    <p class="section-subtitle">Customer support performance metrics</p>
                </div>
            </div>
            
            <div class="analytics-grid-3col">
                <!-- Total Complaints -->
                <div class="analytics-stat-card stat-info">
                    <div class="stat-icon">📋</div>
                    <div class="stat-content">
                        <div class="stat-value">${totalComplaints}</div>
                        <div class="stat-label">Total Complaints</div>
                        <div class="stat-helper">Last ${analyticsState.timeFilter} days</div>
                    </div>
                </div>
                
                <!-- Pending Complaints -->
                <div class="analytics-stat-card stat-warning">
                    <div class="stat-icon">⏳</div>
                    <div class="stat-content">
                        <div class="stat-value">${pendingComplaints}</div>
                        <div class="stat-label">Pending Complaints</div>
                        <div class="stat-helper">Awaiting resolution</div>
                    </div>
                </div>
                
                <!-- Average Resolution Time -->
                <div class="analytics-stat-card stat-success">
                    <div class="stat-icon">⚡</div>
                    <div class="stat-content">
                        <div class="stat-value">${avgResolutionTime.toFixed(1)} days</div>
                        <div class="stat-label">Avg Resolution Time</div>
                        <div class="stat-helper">${resolvedComplaints} resolved</div>
                    </div>
                </div>
            </div>
            
            ${totalComplaints === 0 ? `
                <div class="empty-state-large">
                    <div class="empty-icon">✅</div>
                    <h4 class="empty-title">No Complaints</h4>
                    <p class="empty-text">No complaints have been submitted in the last ${analyticsState.timeFilter} days.</p>
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Change Time Filter
 */
async function changeTimeFilter(days) {
    analyticsState.timeFilter = days;
    
    // Update active button
    document.querySelectorAll('.time-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-days="${days}"]`)?.classList.add('active');
    
    // Reload analytics
    await initAdminAnalytics();
}

/**
 * Show Analytics Loader
 */
function showAnalyticsLoader() {
    const sections = [
        'analyticsOverviewKPIs',
        'analyticsLeads',
        'analyticsROI',
        'analyticsCustomers',
        'analyticsComplaints'
    ];
    
    sections.forEach(sectionId => {
        const container = document.getElementById(sectionId);
        if (container) {
            container.innerHTML = `
                <div class="analytics-loader">
                    <div class="loader-spinner"></div>
                    <p>Loading analytics data...</p>
                </div>
            `;
        }
    });
}

/**
 * Hide Analytics Loader
 */
function hideAnalyticsLoader() {
    // Loader is replaced by actual content
}

/**
 * Show Analytics Error
 */
function showAnalyticsError() {
    const container = document.getElementById('adminDashboardContent');
    if (!container) return;
    
    container.innerHTML = `
        <div class="analytics-error">
            <div class="error-icon">⚠️</div>
            <h3 class="error-title">Unable to Load Analytics</h3>
            <p class="error-text">There was an error loading the analytics data. Please try again.</p>
            <button class="btn-retry" onclick="initAdminAnalytics()">Retry</button>
        </div>
    `;
}

/**
 * Render Admin Analytics Dashboard (Main Entry Point)
 */
async function renderAdminAnalyticsDashboard() {
    console.log('📊 Rendering Admin Analytics Dashboard...');
    
    const container = document.getElementById('adminDashboardContent');
    if (!container) return;
    
    // Render dashboard structure
    container.innerHTML = `
        <div class="analytics-dashboard">
            <!-- Time Filter -->
            <div class="analytics-header">
                <div class="header-content">
                    <h2 class="analytics-title">📊 Admin Analytics Dashboard</h2>
                    <p class="analytics-subtitle">Comprehensive business insights and performance metrics</p>
                </div>
                <div class="time-filter-group">
                    <button class="time-filter-btn" data-days="7" onclick="changeTimeFilter(7)">Last 7 Days</button>
                    <button class="time-filter-btn active" data-days="30" onclick="changeTimeFilter(30)">Last 30 Days</button>
                    <button class="time-filter-btn" data-days="90" onclick="changeTimeFilter(90)">Last 90 Days</button>
                </div>
            </div>
            
            <!-- Overview KPIs -->
            <div id="analyticsOverviewKPIs"></div>
            
            <!-- Lead Analytics -->
            <div id="analyticsLeads"></div>
            
            <!-- ROI Analytics -->
            <div id="analyticsROI"></div>
            
            <!-- Customer Analytics -->
            <div id="analyticsCustomers"></div>
            
            <!-- Complaint Insights -->
            <div id="analyticsComplaints"></div>
        </div>
    `;
    
    // Initialize analytics
    await initAdminAnalytics();
    
    console.log('✅ Admin Analytics Dashboard rendered');
}

// Export functions for global use
window.renderAdminAnalyticsDashboard = renderAdminAnalyticsDashboard;
window.changeTimeFilter = changeTimeFilter;
window.initAdminAnalytics = initAdminAnalytics;

console.log('✅ Admin Analytics Module Loaded');
