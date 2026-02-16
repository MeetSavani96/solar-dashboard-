// ============================================
// SIMPLE DASHBOARD NAVIGATION WITH RBAC
// ============================================

console.log('🌞 Simple Dashboard Script Loaded');

document.addEventListener("DOMContentLoaded", function () {
    console.log('🚀 Dashboard initializing...');
    
    // Initialize RBAC first
    if (typeof window.initializeRBAC === 'function') {
        window.initializeRBAC();
    }
    
    const sections = document.querySelectorAll(".page-section");
    
    console.log(`📋 Found ${sections.length} sections`);
    
    // Log all sections
    sections.forEach(section => {
        console.log(`📄 Section found: ${section.id}`);
    });
    
    /**
     * Open section function with RBAC
     * @param {string} sectionId - ID of section to open
     */
    function openSection(sectionId) {
        console.log(`🔄 Switching to section: ${sectionId}`);
        
        // Check access permission
        if (typeof window.guardSectionAccess === 'function') {
            if (!window.guardSectionAccess(sectionId)) {
                console.log(`🚫 Access denied to: ${sectionId}`);
                return;
            }
        }
        
        // Hide all sections
        sections.forEach(sec => {
            sec.classList.remove("active-section");
        });
        
        // Remove active from all buttons
        const navLinks = document.querySelectorAll(".nav-link");
        navLinks.forEach(btn => {
            btn.classList.remove("active");
        });
        
        // Find target section
        const target = document.getElementById(sectionId);
        
        if (!target) {
            console.error("❌ Section not found:", sectionId);
            return;
        }
        
        // Show target section
        target.classList.add("active-section");
        console.log(`  ✅ Showing section: ${sectionId}`);
        
        // Highlight active button
        navLinks.forEach(btn => {
            if (btn.dataset.section === sectionId) {
                btn.classList.add("active");
            }
        });
        
        // Render section data based on section ID
        renderSectionContent(sectionId);
        
        console.log(`✅ Section switched to: ${sectionId}`);
    }
    
    /**
     * Render Section Content
     * @param {string} sectionId - Section ID
     */
    function renderSectionContent(sectionId) {
        // Customer sections
        if (sectionId === 'analysis' && typeof window.renderAnalysisSection === 'function') {
            window.renderAnalysisSection();
        }
        if (sectionId === 'roi' && typeof window.renderROISection === 'function') {
            window.renderROISection();
        }
        
        // Admin sections
        if (sectionId === 'admin-dashboard' && typeof window.renderAdminDashboard === 'function') {
            window.renderAdminDashboard();
        }
        if (sectionId === 'admin-customers' && typeof window.renderAdminCustomers === 'function') {
            window.renderAdminCustomers();
        }
        if (sectionId === 'admin-systems' && typeof window.renderAdminSystems === 'function') {
            window.renderAdminSystems();
        }
        if (sectionId === 'admin-complaints' && typeof window.renderAdminComplaints === 'function') {
            window.renderAdminComplaints();
        }
        if (sectionId === 'admin-leads' && typeof window.renderAdminLeads === 'function') {
            window.renderAdminLeads();
        }
        if (sectionId === 'admin-reports' && typeof window.renderAdminReports === 'function') {
            window.renderAdminReports();
        }
        if (sectionId === 'admin-settings' && typeof window.renderAdminSettings === 'function') {
            window.renderAdminSettings();
        }
    }
    
    // Add click handlers to nav links (will be rendered by RBAC)
    function setupNavigation() {
        const navLinks = document.querySelectorAll(".nav-link");
        navLinks.forEach(btn => {
            btn.addEventListener("click", function (e) {
                e.preventDefault();
                const sectionId = this.dataset.section;
                console.log(`🖱️ Button clicked: ${sectionId}`);
                openSection(sectionId);
            });
        });
    }
    
    // Setup navigation after RBAC renders sidebar
    setTimeout(() => {
        setupNavigation();
        
        // Set default section based on role
        const defaultSection = typeof window.getDefaultSection === 'function' 
            ? window.getDefaultSection() 
            : 'overview';
        
        console.log('📍 Setting default section:', defaultSection);
        openSection(defaultSection);
        
        // Trigger initial dashboard update from profile
        if (typeof window.updateDashboardFromProfile === 'function') {
            console.log('🔄 Initial dashboard update from profile...');
            window.updateDashboardFromProfile();
        }
    }, 100);
    
    console.log('✅ Dashboard initialized successfully!');
    
    // Export functions for global use
    window.openSection = openSection;
    window.navigateToSection = openSection;
});
