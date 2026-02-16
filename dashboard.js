// ============================================
// SOLAR MONITORING DASHBOARD - JAVASCRIPT
// ============================================

console.log('🌞 Solar Dashboard Loaded');

// ============================================
// SIDEBAR NAVIGATION & SECTION SWITCHING
// ============================================

/**
 * Section titles and subtitles for each menu item
 */
const sectionInfo = {
    overview: {
        title: 'Overview',
        subtitle: 'Monitor your solar system performance'
    },
    analysis: {
        title: 'Analysis',
        subtitle: 'Detailed energy production and consumption analytics'
    },
    performance: {
        title: 'Performance',
        subtitle: 'Real-time system performance metrics'
    },
    maintenance: {
        title: 'Maintenance',
        subtitle: 'Schedule and track system maintenance'
    },
    finance: {
        title: 'Finance',
        subtitle: 'Track savings and return on investment'
    },
    reports: {
        title: 'Reports',
        subtitle: 'Generate and download system reports'
    },
    profile: {
        title: 'Profile',
        subtitle: 'Manage your account and plant information'
    },
    settings: {
        title: 'Settings',
        subtitle: 'Configure your system preferences'
    }
};

/**
 * Show selected section and hide all others
 * @param {string} sectionId - The ID of the section to show
 */
function showSection(sectionId) {
    console.log('🔄 Switching to section:', sectionId);
    
    // Validate section ID
    if (!sectionId) {
        console.error('❌ Section ID is required');
        return;
    }
    
    // Get all sections
    const sections = document.querySelectorAll('.page-section');
    
    if (sections.length === 0) {
        console.error('❌ No sections found with class .page-section');
        return;
    }
    
    // Hide all sections
    sections.forEach(section => {
        section.classList.remove('active-section');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    
    if (targetSection) {
        // Add active class to show section
        targetSection.classList.add('active-section');
        
        // Update page title and subtitle
        updatePageHeader(sectionId);
        
        // Render section data
        if (window.renderSection) {
            window.renderSection(sectionId);
        }
        
        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        console.log('✅ Section switched to:', sectionId);
    } else {
        console.error('❌ Section not found with ID:', sectionId);
        console.log('Available sections:', Array.from(sections).map(s => s.id));
    }
}

/**
 * Update page header title and subtitle
 * @param {string} sectionId - The ID of the active section
 */
function updatePageHeader(sectionId) {
    const titleElement = document.getElementById('pageTitle');
    const subtitleElement = document.getElementById('pageSubtitle');
    
    if (titleElement && subtitleElement && sectionInfo[sectionId]) {
        titleElement.textContent = sectionInfo[sectionId].title;
        subtitleElement.textContent = sectionInfo[sectionId].subtitle;
    }
}

/**
 * Update active state of navigation items
 * @param {string} sectionId - The ID of the active section
 */
function updateActiveNav(sectionId) {
    // Get all nav items (both nav-item and nav-link)
    const navItems = document.querySelectorAll('.nav-item, .nav-link');
    
    // Remove active class from all items
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to clicked item
    const activeItem = document.querySelector(`[data-section="${sectionId}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

/**
 * Handle sidebar navigation clicks
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Dashboard initializing...');
    
    // Get all nav items (both nav-item and nav-link)
    const navItems = document.querySelectorAll('.nav-item, .nav-link');
    
    // Validate sections exist
    const sections = document.querySelectorAll('.page-section');
    console.log(`📋 Found ${sections.length} sections`);
    
    // Log all section IDs for debugging
    sections.forEach(section => {
        console.log(`📄 Section found: ${section.id}`);
    });
    
    // Add click event to each nav item
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Get section ID from data attribute
            const sectionId = item.getAttribute('data-section');
            
            if (sectionId) {
                console.log(`🖱️ Clicked: ${sectionId}`);
                
                // Show selected section
                showSection(sectionId);
                
                // Update active nav item
                updateActiveNav(sectionId);
                
                // Close mobile menu if open
                closeMobileMenu();
            } else {
                console.error('❌ No data-section attribute found on nav item');
            }
        });
    });
    
    // Set default section to overview
    showSection('overview');
    updateActiveNav('overview');
    
    // Initialize sidebar toggle
    initSidebarToggle();
    
    // Initialize mobile menu
    initMobileMenu();
    
    console.log('✅ Sidebar navigation initialized');
    console.log('📍 Default section: Overview');
});

// ============================================
// SIDEBAR TOGGLE (Desktop)
// ============================================

/**
 * Initialize sidebar toggle functionality
 */
function initSidebarToggle() {
    const toggleBtn = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (!toggleBtn || !sidebar) return;
    
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        console.log('🔄 Sidebar toggled');
    });
}

// ============================================
// MOBILE MENU
// ============================================

/**
 * Initialize mobile menu functionality
 */
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (!mobileMenuBtn || !sidebar || !overlay) return;
    
    // Open mobile menu
    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.add('mobile-open');
        overlay.classList.add('active');
        console.log('📱 Mobile menu opened');
    });
    
    // Close mobile menu when clicking overlay
    overlay.addEventListener('click', closeMobileMenu);
}

/**
 * Close mobile menu
 */
function closeMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (overlay) overlay.classList.remove('active');
}

// ============================================
// LIVE POWER ANIMATION (COUNT UP)
// ============================================

/**
 * Animate number count up effect
 * @param {string} elementId - ID of element to animate
 * @param {number} target - Target number
 * @param {number} duration - Animation duration in ms
 */
function animateValue(elementId, target, duration = 2000) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const start = 0;
    const increment = target / (duration / 16); // 60fps
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = current.toFixed(1);
    }, 16);
}

// Start live power animation on load
window.addEventListener('load', () => {
    animateValue('livePower', 100.9, 2000);
    animateValue('liveSavings', 8540, 2000);
    animateValue('healthValue', 96, 2000);
});

// ============================================
// SYSTEM HEALTH CIRCLE ANIMATION
// ============================================

/**
 * Animate circular progress bar
 */
function animateHealthCircle() {
    const circle = document.getElementById('healthCircle');
    if (!circle) return;
    
    const percentage = 96;
    const circumference = 2 * Math.PI * 80; // radius = 80
    const offset = circumference - (percentage / 100) * circumference;
    
    // Animate after a short delay
    setTimeout(() => {
        circle.style.strokeDashoffset = offset;
    }, 500);
}

window.addEventListener('load', animateHealthCircle);

// ============================================
// LAST UPDATED TIME
// ============================================

/**
 * Update last updated time
 */
function updateLastUpdatedTime() {
    const element = document.getElementById('lastUpdated');
    if (!element) return;
    
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    element.textContent = `${hours}:${minutes}`;
}

// Update time on load and every minute
updateLastUpdatedTime();
setInterval(updateLastUpdatedTime, 60000);

// ============================================
// ENERGY CHART (PRODUCED VS CONSUMED)
// ============================================

/**
 * Create energy production vs consumption chart
 */
function createEnergyChart() {
    const ctx = document.getElementById('energyChart');
    if (!ctx) return;
    
    // Dummy data for last 6 months
    const labels = ['July', 'August', 'September', 'October', 'November', 'December'];
    const producedData = [1150, 1280, 1240, 1380, 1520, 1180];
    const consumedData = [980, 1050, 1020, 1100, 1180, 950];
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Energy Produced',
                    data: producedData,
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
                    data: consumedData,
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
                duration: 2000,
                easing: 'easeInOutQuart'
            }
        }
    });
    
    console.log('📊 Energy chart created');
}

// ============================================
// MONTHLY SAVINGS CHART
// ============================================

/**
 * Create monthly savings bar chart
 */
function createSavingsChart() {
    const ctx = document.getElementById('savingsChart');
    if (!ctx) return;
    
    // Dummy data for last 6 months
    const labels = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const savingsData = [7200, 7850, 7640, 8120, 8540, 7380];
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Monthly Savings (₹)',
                data: savingsData,
                backgroundColor: 'rgba(0, 217, 163, 0.6)',
                borderColor: '#00d9a3',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.5,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return '₹' + context.parsed.y.toLocaleString('en-IN');
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false,
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
                            return '₹' + (value / 1000) + 'k';
                        }
                    }
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeInOutQuart'
            }
        }
    });
    
    console.log('💰 Savings chart created');
}

// ============================================
// INITIALIZE CHARTS
// ============================================

/**
 * Initialize all charts when DOM is ready
 */
window.addEventListener('load', () => {
    // Wait for Chart.js to load
    if (typeof Chart !== 'undefined') {
        createEnergyChart();
        createSavingsChart();
    } else {
        console.error('❌ Chart.js not loaded');
    }
});

// ============================================
// MONTH ITEM CLICK HANDLER
// ============================================

/**
 * Handle month item selection
 */
document.addEventListener('DOMContentLoaded', () => {
    const monthItems = document.querySelectorAll('.month-item');
    
    monthItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all items
            monthItems.forEach(month => month.classList.remove('active'));
            
            // Add active class to clicked item
            item.classList.add('active');
            
            const monthName = item.querySelector('.month-name').textContent;
            console.log('📅 Selected month:', monthName);
        });
    });
});

// ============================================
// SIMULATE LIVE DATA UPDATES
// ============================================

/**
 * Simulate live power updates every 5 seconds
 */
function simulateLiveUpdates() {
    setInterval(() => {
        const livePowerElement = document.getElementById('livePower');
        if (!livePowerElement) return;
        
        // Generate random power value between 95 and 105
        const newPower = (95 + Math.random() * 10).toFixed(1);
        livePowerElement.textContent = newPower;
        
        // Add pulse animation
        livePowerElement.style.transform = 'scale(1.1)';
        setTimeout(() => {
            livePowerElement.style.transform = 'scale(1)';
        }, 200);
        
    }, 5000);
}

// Start live updates
simulateLiveUpdates();

// ============================================
// CONSOLE LOGS
// ============================================

console.log('✅ Dashboard initialized');
console.log('✅ Navigation active');
console.log('✅ Charts ready');
console.log('✅ Live updates enabled');
console.log('✅ Animations loaded');

// ============================================
// DUMMY DATA FOR FUTURE BACKEND INTEGRATION
// ============================================

/**
 * Sample data structure for backend integration
 */
const dashboardData = {
    system: {
        status: 'online',
        capacity: 10, // kW
        size: '10 kW',
        lastUpdated: new Date().toISOString()
    },
    monitoring: {
        status: 'active',
        capacity: 10,
        totalYield: 14200,
        consumption: 250,
        livePower: 100.9,
        powerChange: 12 // percentage
    },
    monthlyGeneration: [
        { month: 'September', icon: '🌤️', value: 1240 },
        { month: 'October', icon: '☀️', value: 1380 },
        { month: 'November', icon: '🌞', value: 1520 },
        { month: 'December', icon: '⛅', value: 1180 }
    ],
    energyChart: {
        labels: ['July', 'August', 'September', 'October', 'November', 'December'],
        produced: [1150, 1280, 1240, 1380, 1520, 1180],
        consumed: [980, 1050, 1020, 1100, 1180, 950]
    },
    systemHealth: {
        score: 96,
        status: 'Excellent Condition'
    },
    maintenance: {
        mode: 'Self Maintenance',
        lastCleaning: '2025-11-15',
        nextRecommended: '2026-02-15'
    },
    panelPoints: [
        { name: 'Rooftop Array A', status: 'active', value: 45.2 },
        { name: 'Rooftop Array B', status: 'charging', value: 38.7 },
        { name: 'Ground Mount', status: 'active', value: 17.0 }
    ],
    savings: {
        live: 8540,
        monthly: [7200, 7850, 7640, 8120, 8540, 7380]
    },
    payback: {
        progress: 42,
        totalInvestment: 500000,
        recovered: 210000,
        remaining: 290000,
        estimatedYear: 2028
    }
};

console.log('📦 Sample data structure ready for backend:', dashboardData);

// ============================================
// PLACEHOLDER FUNCTIONS FOR BACKEND
// ============================================

/**
 * Fetch dashboard data from backend
 * TODO: Implement API call
 */
async function fetchDashboardData() {
    // TODO: Replace with actual API call
    /*
    const response = await fetch('/api/dashboard');
    const data = await response.json();
    return data;
    */
    
    console.log('🔄 Fetching dashboard data...');
    return dashboardData;
}

/**
 * Update dashboard with new data
 * TODO: Implement data binding
 */
function updateDashboard(data) {
    // TODO: Update all dashboard elements with new data
    console.log('🔄 Updating dashboard with new data:', data);
}

// Export for future use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        dashboardData,
        fetchDashboardData,
        updateDashboard
    };
}


// ============================================
// INITIALIZE PROFILE MANAGER
// ============================================

/**
 * Initialize Profile Manager on page load
 */
window.addEventListener('DOMContentLoaded', () => {
    if (window.ProfileManager) {
        window.ProfileManager.init();
        console.log('✅ Profile Manager initialized');
    }
});
