// ============================================
// DASHBOARD DATA - CENTRALIZED STATE
// ============================================

/**
 * Centralized Dashboard Data Object
 * All sections read data from this object
 */
const dashboardData = {
    overview: {
        systemStatus: 'Online',
        systemSize: 10, // kW
        livePower: 5.6, // kW
        totalEnergyGenerated: 14200, // kWh
        todayGeneration: 42, // kWh
        consumption: 18, // kWh
        healthScore: 96, // %
        lastUpdated: new Date().toISOString()
    },
    
    analysis: {
        // Daily data (last 7 days)
        dailyData: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            produced: [38, 42, 45, 40, 43, 41, 39],
            consumed: [16, 18, 20, 17, 19, 15, 14]
        },
        // Weekly data (last 8 weeks)
        weeklyData: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
            produced: [280, 295, 310, 285, 300, 290, 305, 288],
            consumed: [120, 130, 135, 125, 140, 115, 128, 122]
        },
        // Monthly data (last 6 months)
        monthlyData: {
            labels: ['July', 'August', 'September', 'October', 'November', 'December'],
            produced: [1150, 1280, 1240, 1380, 1520, 1180],
            consumed: [980, 1050, 1020, 1100, 1180, 950]
        },
        // Current filter
        currentFilter: 'monthly',
        // Overview metrics
        averageDailyGeneration: 42.5, // kWh
        averageDailyConsumption: 18.2, // kWh
        peakPower: 6.1, // kW
        systemEfficiency: 94.5, // %
        // Monthly breakdown
        monthlyBreakdown: [
            { month: 'December', produced: 1180, consumed: 950, surplus: 230, efficiency: 95 },
            { month: 'November', produced: 1520, consumed: 1180, surplus: 340, efficiency: 96 },
            { month: 'October', produced: 1380, consumed: 1100, surplus: 280, efficiency: 95 }
        ],
        // Performance insights
        insights: [
            { type: 'positive', message: 'Energy production increased by 12% compared to last month', icon: '📈' },
            { type: 'info', message: 'Peak production hours: 10:00 AM - 3:00 PM', icon: '☀️' },
            { type: 'positive', message: 'System efficiency is above 94% for 3 consecutive months', icon: '⚡' }
        ]
    },
    
    performance: {
        panelGroups: [
            {
                name: 'Rooftop Array A',
                status: 'active',
                currentPower: 3.2, // kW
                efficiency: 96, // %
                totalPanels: 12
            },
            {
                name: 'Rooftop Array B',
                status: 'active',
                currentPower: 2.1, // kW
                efficiency: 94, // %
                totalPanels: 8
            },
            {
                name: 'Ground Mount',
                status: 'idle',
                currentPower: 0.3, // kW
                efficiency: 88, // %
                totalPanels: 5
            }
        ],
        overallEfficiency: 94.5, // %
        dailyOutput: 42.5, // kWh
        performanceScore: 96 // out of 100
    },
    
    maintenance: {
        mode: 'Self Maintenance',
        lastCleaning: '2025-11-15',
        nextRecommended: '2026-02-15',
        totalVisits: 8,
        alerts: [
            {
                type: 'info',
                message: 'Panel cleaning recommended in 30 days',
                date: '2025-12-14'
            }
        ],
        serviceHistory: [
            { date: '2025-11-15', type: 'Cleaning', technician: 'Rajesh Kumar', status: 'Completed' },
            { date: '2025-08-10', type: 'Inspection', technician: 'Priya Sharma', status: 'Completed' },
            { date: '2025-05-20', type: 'Cleaning', technician: 'Amit Patel', status: 'Completed' }
        ]
    },
    
    finance: {
        totalSavings: 210000, // ₹
        monthlySavings: 8540, // ₹
        tariffPerUnit: 8.5, // ₹/kWh
        totalInvestment: 500000, // ₹
        recovered: 210000, // ₹
        paybackProgress: 42, // %
        estimatedPaybackYear: 2028,
        monthlySavingsHistory: [
            { month: 'Jul', amount: 7200 },
            { month: 'Aug', amount: 7850 },
            { month: 'Sep', amount: 7640 },
            { month: 'Oct', amount: 8120 },
            { month: 'Nov', amount: 8540 },
            { month: 'Dec', amount: 7380 }
        ]
    },
    
    reports: {
        monthlyReports: [
            {
                month: 'November 2025',
                generation: 1520, // kWh
                consumption: 1180, // kWh
                savings: 8540, // ₹
                efficiency: 96, // %
                available: true
            },
            {
                month: 'October 2025',
                generation: 1380, // kWh
                consumption: 1100, // kWh
                savings: 8120, // ₹
                efficiency: 95, // %
                available: true
            },
            {
                month: 'September 2025',
                generation: 1240, // kWh
                consumption: 1020, // kWh
                savings: 7640, // ₹
                efficiency: 94, // %
                available: true
            }
        ],
        yearlySummary: {
            year: 2025,
            totalGeneration: 14200, // kWh
            totalConsumption: 11500, // kWh
            totalSavings: 95000, // ₹
            averageEfficiency: 95 // %
        }
    },
    
    settings: {
        systemName: 'AKVENERGY Solar System',
        location: {
            city: 'Mumbai',
            state: 'Maharashtra',
            address: '123 Solar Street, Andheri'
        },
        tariffPerUnit: 8.5, // ₹/kWh
        notifications: true,
        theme: 'dark',
        timezone: 'IST (UTC+5:30)',
        language: 'English'
    }
};

// ============================================
// RENDER FUNCTIONS FOR EACH SECTION
// ============================================

/**
 * Render Overview Section
 */
function renderOverview() {
    console.log('📊 Rendering Overview section...');
    
    const data = dashboardData.overview;
    
    // Update system status with smart messaging
    updateSystemStatus(data.systemStatus, data.livePower);
    
    // Update live power with visual bar and insight
    updateLivePower(data.livePower, data.systemSize);
    
    // Update energy generation
    updateElement('todayGeneration', `${data.todayGeneration} kWh`);
    updateElement('totalEnergy', `${data.totalEnergyGenerated.toLocaleString()} kWh`);
    
    // Update consumption with insight
    updateConsumption(data.consumption, data.todayGeneration);
    
    // Update health score with visual ring
    updateHealthScore(data.healthScore);
    
    // Update overview insights
    updateOverviewInsights(data);
    
    console.log('✅ Overview rendered');
}

/**
 * Update System Status with smart messaging
 * @param {string} status - System status (Online/Offline)
 * @param {number} livePower - Current power generation
 */
function updateSystemStatus(status, livePower) {
    const statusText = document.getElementById('systemStatusText');
    const statusBadge = document.getElementById('systemStatus');
    const statusBadgeLarge = document.getElementById('systemStatusBadge');
    const statusExplanation = document.getElementById('statusExplanation');
    const statusIcon = document.getElementById('statusIcon');
    const statusPulse = document.getElementById('statusPulse');
    
    if (!statusText || !statusBadge || !statusExplanation) return;
    
    // Determine actual status based on power generation
    const isGenerating = livePower > 0;
    const currentHour = new Date().getHours();
    const isDaytime = currentHour >= 6 && currentHour < 19;
    
    let displayStatus = '';
    let explanation = '';
    let icon = '';
    let badgeClass = '';
    
    if (status === 'Online' && isGenerating) {
        displayStatus = 'Online';
        explanation = 'Your solar panels are actively generating power right now';
        icon = '⚡';
        badgeClass = 'online';
    } else if (status === 'Online' && !isGenerating && !isDaytime) {
        displayStatus = 'Online';
        explanation = 'System is online and ready. No generation at night';
        icon = '🌙';
        badgeClass = 'online';
    } else if (status === 'Online' && !isGenerating && isDaytime) {
        displayStatus = 'Online';
        explanation = 'System is online but not generating. Check weather conditions';
        icon = '☁️';
        badgeClass = 'warning';
    } else {
        displayStatus = 'Offline';
        explanation = 'System is not responding. Please check your connection';
        icon = '⚠️';
        badgeClass = 'offline';
    }
    
    // Update UI
    statusText.textContent = displayStatus;
    statusBadge.textContent = displayStatus;
    statusExplanation.textContent = explanation;
    if (statusIcon) statusIcon.textContent = icon;
    
    // Update badge styling
    if (statusBadgeLarge) {
        statusBadgeLarge.className = `status-badge-large ${badgeClass}`;
    }
    
    // Update pulse animation
    if (statusPulse) {
        if (isGenerating) {
            statusPulse.style.display = 'block';
        } else {
            statusPulse.style.display = 'none';
        }
    }
}

/**
 * Update Live Power with visual bar and insight
 * @param {number} power - Current power in kW
 * @param {number} systemSize - System size in kW
 */
function updateLivePower(power, systemSize) {
    const powerValue = document.getElementById('livePower');
    const powerBar = document.getElementById('powerBarFill');
    const powerInsight = document.getElementById('livePowerInsight');
    const systemSizeEl = document.getElementById('systemSize');
    
    if (!powerValue) return;
    
    // Update power value
    powerValue.textContent = power.toFixed(1);
    
    // Update system size
    if (systemSizeEl) {
        systemSizeEl.textContent = `${systemSize} kW`;
    }
    
    // Update power bar
    if (powerBar) {
        const percentage = (power / systemSize) * 100;
        powerBar.style.width = `${Math.min(percentage, 100)}%`;
    }
    
    // Generate smart insight
    if (powerInsight) {
        const homesEquivalent = Math.floor(power / 1);
        let insightText = '';
        
        if (power > systemSize * 0.8) {
            insightText = `🔥 Excellent! Generating at ${Math.round((power/systemSize)*100)}% capacity`;
        } else if (power > systemSize * 0.5) {
            insightText = `☀️ Generating enough to power ${homesEquivalent}-${homesEquivalent+1} homes right now`;
        } else if (power > 0) {
            insightText = `🌤️ Moderate generation - weather may be affecting output`;
        } else {
            insightText = `🌙 No generation - system is idle (nighttime or cloudy)`;
        }
        
        powerInsight.innerHTML = `
            <span class="insight-icon-small">${insightText.substring(0, 2)}</span>
            <span class="insight-text-small">${insightText.substring(3)}</span>
        `;
    }
}

/**
 * Update Consumption with insight
 * @param {number} consumption - Today's consumption in kWh
 * @param {number} generation - Today's generation in kWh
 */
function updateConsumption(consumption, generation) {
    const consumptionEl = document.getElementById('consumption');
    const insightEl = document.getElementById('consumptionInsight');
    
    if (!consumptionEl) return;
    
    consumptionEl.textContent = consumption;
    
    // Generate insight
    if (insightEl) {
        const surplus = generation - consumption;
        let insightText = '';
        
        if (surplus > 0) {
            insightText = `✅ Using less than you're generating (+${surplus} kWh surplus)`;
        } else if (surplus === 0) {
            insightText = `⚖️ Perfectly balanced usage and generation`;
        } else {
            insightText = `⚠️ Using more than generating (${Math.abs(surplus)} kWh deficit)`;
        }
        
        insightEl.textContent = insightText;
    }
}

/**
 * Update Health Score with visual ring
 * @param {number} score - Health score (0-100)
 */
function updateHealthScore(score) {
    const scoreValue = document.getElementById('healthScore');
    const scoreCircle = document.getElementById('healthProgressCircle');
    const statusLabel = document.getElementById('healthStatusLabel');
    
    if (!scoreValue) return;
    
    // Update score value
    scoreValue.textContent = score;
    
    // Update circle progress (251 is circumference for r=40)
    if (scoreCircle) {
        const circumference = 251;
        const offset = circumference - (score / 100) * circumference;
        scoreCircle.style.strokeDashoffset = offset;
    }
    
    // Determine status
    if (statusLabel) {
        let status = '';
        if (score >= 95) status = 'Excellent';
        else if (score >= 85) status = 'Very Good';
        else if (score >= 70) status = 'Good';
        else status = 'Needs Attention';
        
        statusLabel.textContent = status;
    }
}

/**
 * Update Overview Insights
 * @param {Object} data - Overview data
 */
function updateOverviewInsights(data) {
    const container = document.getElementById('overviewInsightContent');
    if (!container) return;
    
    const surplus = data.todayGeneration - data.consumption;
    const tariff = 8; // ₹ per kWh (could be from profile)
    const savings = Math.round(data.todayGeneration * tariff);
    const offsetPercentage = Math.round((data.todayGeneration / data.consumption) * 100);
    
    let html = `
        <div class="insight-point">
            <span class="point-icon">☀️</span>
            <p class="point-text">Your system is generating <strong>${surplus > 0 ? surplus : 0} kWh more</strong> than you're using today</p>
        </div>
        <div class="insight-point">
            <span class="point-icon">💰</span>
            <p class="point-text">You're saving approximately <strong>₹${savings.toLocaleString('en-IN')}</strong> on electricity today</p>
        </div>
        <div class="insight-point">
            <span class="point-icon">🌱</span>
            <p class="point-text">Your solar panels are offsetting <strong>${offsetPercentage}% of your usage</strong></p>
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Render Analysis Section
 */
function renderAnalysis() {
    console.log('📈 Rendering Analysis section...');
    
    const data = dashboardData.analysis;
    
    // Update overview cards
    updateElement('avgDailyGeneration', `${data.averageDailyGeneration} kWh`);
    updateElement('avgDailyConsumption', `${data.averageDailyConsumption} kWh`);
    updateElement('peakPowerGenerated', `${data.peakPower} kW`);
    updateElement('systemEfficiencyAnalysis', `${data.systemEfficiency}%`);
    
    // Create or update chart
    createAnalysisChart(data.currentFilter);
    
    // Render monthly breakdown
    renderMonthlyBreakdown(data.monthlyBreakdown);
    
    // Render performance insights
    renderPerformanceInsights(data.insights);
    
    console.log('✅ Analysis rendered');
}

/**
 * Render Performance Section
 */
function renderPerformance() {
    console.log('⚡ Rendering Performance section...');
    
    const data = dashboardData.performance;
    
    // Update performance score with circular progress
    updatePerformanceScore(data.performanceScore);
    
    // Update metrics
    updateElement('overallEfficiency', `${data.overallEfficiency}%`);
    updateElement('dailyOutput', `${data.dailyOutput} kWh`);
    
    // Calculate peak power (max from panel groups)
    const peakPower = Math.max(...data.panelGroups.map(g => g.currentPower));
    updateElement('peakPower', `${peakPower.toFixed(1)} kW`);
    
    // Render panel groups with new design
    renderPanelGroupsEnhanced(data.panelGroups);
    
    console.log('✅ Performance rendered');
}

/**
 * Update Performance Score with circular progress and insight
 * @param {number} score - Performance score (0-100)
 */
function updatePerformanceScore(score) {
    const scoreValue = document.getElementById('performanceScoreValue');
    const scoreStatus = document.getElementById('performanceStatus');
    const scoreCircle = document.getElementById('scoreProgressCircle');
    const insightText = document.getElementById('performanceInsightText');
    
    if (!scoreValue || !scoreStatus || !scoreCircle || !insightText) return;
    
    // Update score value
    scoreValue.textContent = score;
    
    // Calculate circle progress (534 is circumference for r=85)
    const circumference = 534;
    const offset = circumference - (score / 100) * circumference;
    scoreCircle.style.strokeDashoffset = offset;
    
    // Determine status and color
    let status = '';
    let statusClass = '';
    let insight = '';
    
    if (score >= 95) {
        status = 'Excellent';
        statusClass = 'excellent';
        insight = 'Your system is performing exceptionally well. All panels are generating power efficiently with no issues detected.';
    } else if (score >= 85) {
        status = 'Very Good';
        statusClass = 'good';
        insight = 'Your system is performing very well. Minor variations are normal and your panels are operating efficiently.';
    } else if (score >= 70) {
        status = 'Good';
        statusClass = 'fair';
        insight = 'Your system is performing adequately. Consider checking for any shading or cleaning needs to optimize performance.';
    } else {
        status = 'Needs Attention';
        statusClass = 'poor';
        insight = 'Your system performance is below optimal. We recommend scheduling a maintenance check to identify any issues.';
    }
    
    // Update UI
    scoreStatus.textContent = status;
    scoreStatus.className = `score-status ${statusClass}`;
    scoreCircle.classList.add(statusClass);
    insightText.textContent = insight;
}

/**
 * Render Panel Groups with enhanced design
 * @param {Array} groups - Panel group data
 */
function renderPanelGroupsEnhanced(groups) {
    const container = document.getElementById('panelGroupsList');
    if (!container) return;
    
    let html = '';
    groups.forEach(group => {
        const statusClass = group.status === 'active' ? 'active' : 'idle';
        const statusText = group.status === 'active' ? 'Active' : 'Idle';
        
        html += `
            <div class="panel-group-card">
                <div class="panel-group-header">
                    <h4 class="panel-group-name">${group.name}</h4>
                    <span class="panel-status-badge ${statusClass}">${statusText}</span>
                </div>
                <div class="panel-group-stats">
                    <div class="panel-stat">
                        <span class="panel-stat-label">Power</span>
                        <span class="panel-stat-value highlight">${group.currentPower} kW</span>
                    </div>
                    <div class="panel-stat">
                        <span class="panel-stat-label">Efficiency</span>
                        <span class="panel-stat-value">${group.efficiency}%</span>
                    </div>
                    <div class="panel-stat">
                        <span class="panel-stat-label">Panels</span>
                        <span class="panel-stat-value">${group.totalPanels}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

/**
 * Render Maintenance/Support Section
 */
function renderMaintenance() {
    console.log('🛠️ Rendering Support section...');
    
    // Render complaints list
    renderComplaintsList();
    
    // Setup form submission
    setupComplaintForm();
    
    console.log('✅ Support section rendered');
}

/**
 * Setup Complaint Form Submission
 */
function setupComplaintForm() {
    const form = document.getElementById('complaintForm');
    if (!form) return;
    
    // Remove existing listener if any
    form.onsubmit = null;
    
    form.onsubmit = function(e) {
        e.preventDefault();
        submitComplaint();
    };
}

/**
 * Submit Complaint (Frontend only - dummy submission)
 */
function submitComplaint() {
    const type = document.getElementById('complaintType').value;
    const priority = document.getElementById('complaintPriority').value;
    const description = document.getElementById('complaintDescription').value;
    
    if (!type || !priority) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Generate reference ID
    const refId = `C-2026-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    // ============================================
    // SAVE TO ADMIN STORE (TASK 12)
    // ============================================
    // Create complaint object
    const complaint = {
        id: refId,
        type: type,
        priority: priority,
        status: 'open',
        description: description,
        date: new Date().toISOString().split('T')[0],
        assignedTo: null
    };
    
    // Save to admin store if user is logged in
    const session = window.getUserSession ? window.getUserSession() : null;
    if (session && window.addUserComplaint) {
        window.addUserComplaint(session.id, complaint);
        console.log('💾 Complaint saved to admin store:', refId);
    }
    
    // Hide form, show success message
    const form = document.getElementById('complaintForm');
    const successMsg = document.getElementById('successMessage');
    
    if (form) form.style.display = 'none';
    if (successMsg) {
        successMsg.style.display = 'flex';
        
        // Set response time based on priority
        const responseTime = document.getElementById('responseTime');
        if (responseTime) {
            switch(priority) {
                case 'urgent':
                    responseTime.textContent = '2 hours';
                    break;
                case 'high':
                    responseTime.textContent = '24 hours';
                    break;
                case 'medium':
                    responseTime.textContent = '2-3 days';
                    break;
                default:
                    responseTime.textContent = '3-5 days';
            }
        }
        
        // Set reference ID
        const refEl = document.getElementById('complaintRef');
        if (refEl) {
            refEl.textContent = `#${refId}`;
        }
    }
    
    // Scroll to success message
    if (successMsg) {
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    console.log('✅ Complaint submitted:', { type, priority, description, refId });
}

/**
 * Reset Complaint Form
 */
function resetComplaintForm() {
    const form = document.getElementById('complaintForm');
    const successMsg = document.getElementById('successMessage');
    
    if (form) {
        form.reset();
        form.style.display = 'flex';
    }
    
    if (successMsg) {
        successMsg.style.display = 'none';
    }
}

/**
 * Render Complaints List with dummy data
 */
function renderComplaintsList() {
    const container = document.getElementById('complaintsList');
    if (!container) return;
    
    // Dummy complaints data
    const complaints = [
        {
            id: 'C-2026-001',
            type: 'performance',
            typeIcon: '⚡',
            typeText: 'Low Power Generation',
            status: 'in-progress',
            statusText: 'In Progress',
            priority: 'high',
            priorityText: 'High',
            description: 'System generating only 60% of expected power for the past 3 days. Weather has been clear.',
            date: '2026-02-12',
            assignedTo: 'Rajesh Kumar'
        },
        {
            id: 'C-2026-002',
            type: 'cleaning',
            typeIcon: '🧹',
            typeText: 'Panel Cleaning Needed',
            status: 'open',
            statusText: 'Open',
            priority: 'medium',
            priorityText: 'Medium',
            description: 'Panels have accumulated dust. Requesting cleaning service.',
            date: '2026-02-10',
            assignedTo: null
        },
        {
            id: 'C-2025-089',
            type: 'technical',
            typeIcon: '🔧',
            typeText: 'Technical Issue',
            status: 'resolved',
            statusText: 'Resolved',
            priority: 'high',
            priorityText: 'High',
            description: 'Inverter showing error code E03. System not generating power.',
            date: '2025-12-15',
            assignedTo: 'Priya Sharma',
            resolvedDate: '2025-12-16'
        },
        {
            id: 'C-2025-067',
            type: 'billing',
            typeIcon: '💰',
            typeText: 'Billing Question',
            status: 'closed',
            statusText: 'Closed',
            priority: 'low',
            priorityText: 'Low',
            description: 'Question about net metering credit calculation.',
            date: '2025-11-20',
            assignedTo: 'Amit Patel',
            resolvedDate: '2025-11-21'
        }
    ];
    
    if (complaints.length === 0) {
        container.innerHTML = `
            <div class="complaints-empty">
                <div class="empty-icon">📋</div>
                <h3 class="empty-title">No Complaints Yet</h3>
                <p class="empty-text">You haven't submitted any complaints. If you need help, use the form above.</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    complaints.forEach(complaint => {
        html += `
            <div class="complaint-item" onclick="viewComplaintDetails('${complaint.id}')">
                <div class="complaint-item-header">
                    <div class="complaint-item-left">
                        <div class="complaint-item-title">
                            <span class="complaint-type-icon">${complaint.typeIcon}</span>
                            <span class="complaint-type-text">${complaint.typeText}</span>
                        </div>
                        <div class="complaint-ref">
                            <strong>${complaint.id}</strong> • Submitted ${formatDate(complaint.date)}
                        </div>
                    </div>
                    <span class="complaint-status-badge status-${complaint.status}">
                        ${complaint.statusText}
                    </span>
                </div>
                
                <div class="complaint-item-body">
                    <p class="complaint-description">${complaint.description}</p>
                </div>
                
                <div class="complaint-item-footer">
                    <div class="complaint-meta">
                        ${complaint.assignedTo ? `
                            <div class="meta-item">
                                <span class="meta-icon">👤</span>
                                <span>Assigned to ${complaint.assignedTo}</span>
                            </div>
                        ` : ''}
                        ${complaint.resolvedDate ? `
                            <div class="meta-item">
                                <span class="meta-icon">✅</span>
                                <span>Resolved ${formatDate(complaint.resolvedDate)}</span>
                            </div>
                        ` : ''}
                    </div>
                    <span class="complaint-priority priority-${complaint.priority}">
                        ${complaint.priorityText} Priority
                    </span>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

/**
 * Filter Complaints by Status
 */
function filterComplaints(status) {
    console.log('Filtering complaints by:', status);
    // In a real app, this would filter the complaints
    // For now, just re-render (all complaints shown)
    renderComplaintsList();
}

/**
 * View Complaint Details (placeholder)
 */
function viewComplaintDetails(id) {
    console.log('Viewing complaint details:', id);
    alert(`Complaint Details: ${id}\n\nIn a full implementation, this would show detailed information, updates, and communication history.`);
}

// Export functions for global use
window.resetComplaintForm = resetComplaintForm;
window.filterComplaints = filterComplaints;
window.viewComplaintDetails = viewComplaintDetails;

/**
 * Render Finance Section
 */
function renderFinance() {
    console.log('💰 Rendering Finance section...');
    
    const data = dashboardData.finance;
    
    // Update financial metrics
    updateElement('totalSavings', `₹${data.totalSavings.toLocaleString('en-IN')}`);
    updateElement('monthlySavings', `₹${data.monthlySavings.toLocaleString('en-IN')}`);
    updateElement('tariffRate', `₹${data.tariffPerUnit}/kWh`);
    updateElement('paybackProgress', `${data.paybackProgress}%`);
    updateElement('paybackYear', data.estimatedPaybackYear);
    
    // Update progress bar
    updateProgressBar('paybackBar', data.paybackProgress);
    
    // Update investment breakdown
    updateElement('totalInvestment', `₹${data.totalInvestment.toLocaleString('en-IN')}`);
    updateElement('amountRecovered', `₹${data.recovered.toLocaleString('en-IN')}`);
    updateElement('amountRemaining', `₹${(data.totalInvestment - data.recovered).toLocaleString('en-IN')}`);
    
    console.log('✅ Finance rendered');
}

/**
 * Render Reports Section
 */
function renderReports() {
    console.log('📄 Rendering Reports section...');
    
    const data = dashboardData.reports;
    
    // Render monthly reports list
    renderReportsList(data.monthlyReports);
    
    // Update yearly summary
    const summary = data.yearlySummary;
    updateElement('yearlyGeneration', `${summary.totalGeneration.toLocaleString()} kWh`);
    updateElement('yearlyConsumption', `${summary.totalConsumption.toLocaleString()} kWh`);
    updateElement('yearlySavings', `₹${summary.totalSavings.toLocaleString('en-IN')}`);
    updateElement('yearlyEfficiency', `${summary.averageEfficiency}%`);
    
    console.log('✅ Reports rendered');
}

/**
 * Render Settings Section
 */
function renderSettings() {
    console.log('⚙️ Rendering Settings section...');
    
    const data = dashboardData.settings;
    
    // Update settings info
    updateElement('systemName', data.systemName);
    updateElement('locationCity', data.location.city);
    updateElement('locationState', data.location.state);
    updateElement('settingsTariff', `₹${data.tariffPerUnit}/kWh`);
    updateElement('timezone', data.timezone);
    updateElement('language', data.language);
    
    // Update toggles
    updateToggle('notificationsToggle', data.notifications);
    updateToggle('themeToggle', data.theme === 'dark');
    
    console.log('✅ Settings rendered');
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Update element text content safely
 * @param {string} id - Element ID
 * @param {string} value - Value to set
 */
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    } else {
        console.warn(`⚠️ Element not found: ${id}`);
    }
}

/**
 * Update progress bar width
 * @param {string} id - Progress bar ID
 * @param {number} percentage - Progress percentage
 */
function updateProgressBar(id, percentage) {
    const bar = document.getElementById(id);
    if (bar) {
        bar.style.width = `${percentage}%`;
    }
}

/**
 * Update toggle state
 * @param {string} id - Toggle ID
 * @param {boolean} state - Toggle state
 */
function updateToggle(id, state) {
    const toggle = document.getElementById(id);
    if (toggle) {
        toggle.checked = state;
    }
}

/**
 * Format date string
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

/**
 * Render monthly data table
 * @param {Array} data - Monthly generation data
 */
function renderMonthlyTable(data) {
    const container = document.getElementById('monthlyTable');
    if (!container) return;
    
    let html = '<table class="data-table"><thead><tr><th>Month</th><th>Produced (kWh)</th><th>Consumed (kWh)</th><th>Surplus</th></tr></thead><tbody>';
    
    data.forEach(item => {
        const surplus = item.produced - item.consumed;
        html += `
            <tr>
                <td>${item.month}</td>
                <td>${item.produced}</td>
                <td>${item.consumed}</td>
                <td class="${surplus > 0 ? 'positive' : 'negative'}">${surplus > 0 ? '+' : ''}${surplus}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

/**
 * Create Analysis Chart with Chart.js
 * @param {string} filter - Time filter (daily, weekly, monthly)
 */
let analysisChartInstance = null;

function createAnalysisChart(filter = 'monthly') {
    const canvas = document.getElementById('analysisChart');
    if (!canvas) {
        console.warn('⚠️ Analysis chart canvas not found');
        return;
    }
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('❌ Chart.js is not loaded');
        return;
    }
    
    const data = dashboardData.analysis;
    let chartData;
    
    // Select data based on filter
    switch(filter) {
        case 'daily':
            chartData = data.dailyData;
            break;
        case 'weekly':
            chartData = data.weeklyData;
            break;
        case 'monthly':
        default:
            chartData = data.monthlyData;
            break;
    }
    
    // Destroy existing chart if it exists
    if (analysisChartInstance) {
        analysisChartInstance.destroy();
    }
    
    // Create new chart
    const ctx = canvas.getContext('2d');
    analysisChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [
                {
                    label: 'Energy Produced',
                    data: chartData.produced,
                    borderColor: '#ff9800',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#ff9800',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                },
                {
                    label: 'Energy Consumed',
                    data: chartData.consumed,
                    borderColor: '#2196f3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#2196f3',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2.5,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            size: 12,
                            weight: '500'
                        },
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y + ' kWh';
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.5)',
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.5)',
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return value + ' kWh';
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });
    
    console.log(`📊 Analysis chart created with ${filter} data`);
}

/**
 * Switch analysis time filter
 * @param {string} filter - Time filter (daily, weekly, monthly)
 */
function switchAnalysisFilter(filter) {
    console.log(`🔄 Switching analysis filter to: ${filter}`);
    
    // Update active button state
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === filter) {
            btn.classList.add('active');
        }
    });
    
    // Update current filter in data
    dashboardData.analysis.currentFilter = filter;
    
    // Recreate chart with new data
    createAnalysisChart(filter);
}

/**
 * Render monthly breakdown
 * @param {Array} breakdown - Monthly breakdown data
 */
function renderMonthlyBreakdown(breakdown) {
    const container = document.getElementById('monthlyBreakdown');
    if (!container) return;
    
    let html = '';
    breakdown.forEach(item => {
        const surplusClass = item.surplus > 0 ? 'positive' : 'negative';
        html += `
            <div class="breakdown-item">
                <div class="breakdown-header">
                    <h4>${item.month}</h4>
                    <span class="efficiency-badge">${item.efficiency}% Efficiency</span>
                </div>
                <div class="breakdown-stats">
                    <div class="breakdown-stat">
                        <span class="stat-label">Produced</span>
                        <span class="stat-value">${item.produced} kWh</span>
                    </div>
                    <div class="breakdown-stat">
                        <span class="stat-label">Consumed</span>
                        <span class="stat-value">${item.consumed} kWh</span>
                    </div>
                    <div class="breakdown-stat">
                        <span class="stat-label">Surplus</span>
                        <span class="stat-value ${surplusClass}">${item.surplus > 0 ? '+' : ''}${item.surplus} kWh</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

/**
 * Render performance insights
 * @param {Array} insights - Performance insights data
 */
function renderPerformanceInsights(insights) {
    const container = document.getElementById('performanceInsights');
    if (!container) return;
    
    let html = '<div class="insights-list">';
    insights.forEach(insight => {
        const typeClass = insight.type === 'positive' ? 'insight-positive' : 'insight-info';
        html += `
            <div class="insight-item ${typeClass}">
                <span class="insight-icon">${insight.icon}</span>
                <p class="insight-message">${insight.message}</p>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

/**
 * Render panel groups
 * @param {Array} groups - Panel group data
 */
function renderPanelGroups(groups) {
    const container = document.getElementById('panelGroupsList');
    if (!container) return;
    
    let html = '';
    groups.forEach(group => {
        const statusClass = group.status === 'active' ? 'status-active' : 'status-idle';
        html += `
            <div class="panel-group-item">
                <div class="panel-group-header">
                    <h4>${group.name}</h4>
                    <span class="status-badge ${statusClass}">${group.status}</span>
                </div>
                <div class="panel-group-stats">
                    <div class="stat">
                        <span class="stat-label">Current Power</span>
                        <span class="stat-value">${group.currentPower} kW</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Efficiency</span>
                        <span class="stat-value">${group.efficiency}%</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Panels</span>
                        <span class="stat-value">${group.totalPanels}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

/**
 * Render maintenance alerts
 * @param {Array} alerts - Alert data
 */
function renderAlerts(alerts) {
    const container = document.getElementById('maintenanceAlerts');
    if (!container) return;
    
    if (alerts.length === 0) {
        container.innerHTML = '<p class="no-alerts">No alerts at this time</p>';
        return;
    }
    
    let html = '';
    alerts.forEach(alert => {
        html += `
            <div class="alert alert-${alert.type}">
                <span class="alert-icon">ℹ️</span>
                <div class="alert-content">
                    <p>${alert.message}</p>
                    <span class="alert-date">${formatDate(alert.date)}</span>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

/**
 * Render service history
 * @param {Array} history - Service history data
 */
function renderServiceHistory(history) {
    const container = document.getElementById('serviceHistory');
    if (!container) return;
    
    let html = '<table class="data-table"><thead><tr><th>Date</th><th>Type</th><th>Technician</th><th>Status</th></tr></thead><tbody>';
    
    history.forEach(item => {
        html += `
            <tr>
                <td>${formatDate(item.date)}</td>
                <td>${item.type}</td>
                <td>${item.technician}</td>
                <td><span class="status-badge status-${item.status.toLowerCase()}">${item.status}</span></td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

/**
 * Render reports list
 * @param {Array} reports - Reports data
 */
function renderReportsList(reports) {
    const container = document.getElementById('reportsList');
    if (!container) return;
    
    let html = '';
    reports.forEach(report => {
        html += `
            <div class="report-item">
                <div class="report-info">
                    <h4>${report.month}</h4>
                    <div class="report-stats">
                        <span>Generation: ${report.generation} kWh</span>
                        <span>Savings: ₹${report.savings.toLocaleString('en-IN')}</span>
                        <span>Efficiency: ${report.efficiency}%</span>
                    </div>
                </div>
                <button class="download-btn" onclick="downloadReport('${report.month}')">
                    📥 Download
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

/**
 * Download report (UI only)
 * @param {string} month - Report month
 */
function downloadReport(month) {
    alert(`Downloading report for ${month}...\n(This is a UI demo - no actual file will be downloaded)`);
    console.log('📥 Download report:', month);
}

// ============================================
// SECTION RENDER DISPATCHER
// ============================================

/**
 * Render section based on section ID
 * @param {string} sectionId - Section ID
 */
function renderSection(sectionId) {
    console.log(`🎨 Rendering section: ${sectionId}`);
    
    switch(sectionId) {
        case 'overview':
            renderOverview();
            break;
        case 'analysis':
            renderAnalysis();
            break;
        case 'performance':
            renderPerformance();
            break;
        case 'maintenance':
            renderMaintenance();
            break;
        case 'finance':
            renderFinance();
            break;
        case 'reports':
            renderReports();
            break;
        case 'settings':
            renderSettings();
            break;
        case 'profile':
            // Profile is handled by profile-manager.js
            console.log('👤 Profile section (handled by ProfileManager)');
            break;
        default:
            console.warn(`⚠️ No render function for section: ${sectionId}`);
    }
}

// Export for use in other modules
window.dashboardData = dashboardData;
window.renderSection = renderSection;
window.downloadReport = downloadReport;
window.switchAnalysisFilter = switchAnalysisFilter;

console.log('📦 dashboard-data.js loaded');
console.log('📊 Dashboard data initialized');
