// ============================================
// LOADER - HIDE WHEN PAGE LOADS
// ============================================

/**
 * Hide loader when page is fully loaded
 * Then trigger intro animation for home section
 */
window.addEventListener('load', function() {
    const loader = document.getElementById('loader');
    const homeSection = document.getElementById('home');
    
    if (loader) {
        // Add 'hidden' class to trigger fade-out animation
        loader.classList.add('hidden');
        
        // Remove loader from DOM and trigger intro after fade-out completes
        setTimeout(function() {
            loader.style.display = 'none';
            
            // Trigger intro animation for home section
            if (homeSection) {
                homeSection.classList.add('intro-active');
                console.log('✨ Intro animation started');
            }
        }, 600); // Match CSS transition duration (0.6s)
    }
    
    console.log('✅ Page loaded - Loader hidden');
});

// ============================================
// SECTION SWITCHING WITH SMOOTH ANIMATIONS
// ============================================

/**
 * Show selected section and hide all others with smooth animation
 * @param {string} sectionId - The ID of the section to show
 */
function showSection(sectionId) {
    // Get all sections
    const sections = document.querySelectorAll('.page-section');
    
    // Hide all sections with fade-out animation
    sections.forEach(section => {
        // Remove active class to hide section
        section.classList.remove('active-section');
        // Remove fade-out class if it exists
        section.classList.remove('fade-out');
    });
    
    // Show selected section with fade-in animation
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        // Add active class to show section (triggers fadeInUp animation)
        targetSection.classList.add('active-section');
        
        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * Update active state of navigation links
 * @param {string} sectionId - The ID of the active section
 */
function updateActiveNav(sectionId) {
    // Get all nav links
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Remove active class from all links
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to clicked link
    const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// ============================================
// NAVIGATION CLICK HANDLERS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Get all navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Add click event to each nav link
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Get section ID from data attribute
            const sectionId = link.getAttribute('data-section');
            
            // Show selected section
            showSection(sectionId);
            
            // Update active nav link
            updateActiveNav(sectionId);
            
            // Close mobile menu if open
            closeMobileMenu();
        });
    });
    
    // Hero button - Calculate Savings
    const calculateBtn = document.querySelector('.btn-primary[data-section]');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', () => {
            showSection('calculator');
            updateActiveNav('calculator');
            closeMobileMenu();
        });
    }
});

// ============================================
// MOBILE MENU TOGGLE
// ============================================

const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

/**
 * Close mobile menu
 */
function closeMobileMenu() {
    if (hamburger && navMenu) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (navMenu && hamburger) {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            closeMobileMenu();
        }
    }
});

// ============================================
// SOLAR CALCULATOR LOGIC
// ============================================

const solarForm = document.getElementById('solarForm');

if (solarForm) {
    solarForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form values (IDs ready for Supabase)
        const name = document.getElementById('calc-name').value.trim();
        const contact = document.getElementById('calc-contact').value.trim();
        const city = document.getElementById('calc-city').value.trim();
        const bill = parseFloat(document.getElementById('calc-bill').value);
        
        // Validate bill amount
        if (bill <= 0 || isNaN(bill)) {
            alert('Please enter a valid bill amount');
            return;
        }
        
        // Calculate solar values
        // Formula: capacity = bill / 1000
        const capacity = (bill / 1000).toFixed(1);
        
        // Formula: cost = capacity * 50000
        const cost = (capacity * 50000).toFixed(0);
        
        // Payback period: 4-6 years
        const payback = '4-6';
        
        // Prepare data object for Supabase
        const calculationData = {
            name: name,
            contact: contact,
            city: city,
            monthly_bill: bill,
            solar_capacity_kw: parseFloat(capacity),
            estimated_cost: parseInt(cost),
            payback_period: payback,
            created_at: new Date().toISOString()
        };
        
        console.log('📊 Calculator Data:', calculationData);
        
        // ============================================
        // SAVE LEAD TO SUPABASE (SILENT)
        // ============================================
        if (window.leadTracker) {
            const leadData = {
                name: name || null,
                phone: contact || null,
                city: city,
                systemSize: parseFloat(capacity),
                monthlyBill: bill,
                estimatedCost: parseInt(cost),
                paybackYears: 5, // Average of 4-6
                purchaseType: null // Can be added if calculator has purchase type field
            };
            
            // Save lead silently (don't block UI)
            window.leadTracker.saveCalculatorLead(leadData).then(result => {
                if (result.success) {
                    console.log('✅ Lead saved successfully:', result.leadId);
                } else if (!result.demo) {
                    console.warn('⚠️ Lead not saved:', result.error);
                }
            }).catch(error => {
                console.error('❌ Error saving lead:', error);
                // Silent error - don't block user experience
            });
        }
        
        // Update result cards with animation
        setTimeout(() => {
            document.getElementById('capacityValue').textContent = capacity;
            document.getElementById('capacityCard').style.opacity = '1';
        }, 100);
        
        setTimeout(() => {
            document.getElementById('costValue').textContent = parseInt(cost).toLocaleString('en-IN');
            document.getElementById('costCard').style.opacity = '1';
        }, 300);
        
        setTimeout(() => {
            document.getElementById('paybackValue').textContent = payback;
            document.getElementById('paybackCard').style.opacity = '1';
        }, 500);
        
        // Show friendly thank you message after results
        setTimeout(() => {
            if (name || contact) {
                // User-friendly message (not technical)
                alert('Thanks! Your solar estimate is ready.\n\nOur team may contact you to assist further.');
            }
        }, 1000);
    });
}

// ============================================
// CONTACT FORM HANDLER
// ============================================

const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values (IDs ready for Supabase)
        const name = document.getElementById('contact-name').value.trim();
        const phone = document.getElementById('contact-phone').value.trim();
        const message = document.getElementById('contact-message').value.trim();
        
        // Prepare data object for future Supabase integration
        const contactData = {
            name: name,
            phone: phone,
            message: message,
            status: 'new',
            created_at: new Date().toISOString()
        };
        
        // TODO: Save to Supabase when connected
        console.log('📧 Contact Form Data (Ready for Supabase):', contactData);
        
        // Show success message
        alert('Thank you for contacting us! We will get back to you soon.');
        
        // Reset form
        contactForm.reset();
    });
}

// ============================================
// SUPABASE INTEGRATION PLACEHOLDERS
// ============================================

/**
 * TODO: Initialize Supabase client
 * Uncomment when ready to connect
 */
/*
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'
const supabase = createClient(supabaseUrl, supabaseKey)
*/

/**
 * Save solar calculation to Supabase
 * @param {Object} data - Calculation data
 */
async function saveSolarCalculation(data) {
    // TODO: Implement Supabase insert
    /*
    const { data: result, error } = await supabase
        .from('solar_calculations')
        .insert([data])
    
    if (error) {
        console.error('Error saving calculation:', error);
        return { success: false, error };
    }
    
    return { success: true, data: result };
    */
    
    console.log('💾 Ready to save to Supabase:', data);
    return { success: true, data };
}

/**
 * Save contact form to Supabase
 * @param {Object} data - Contact form data
 */
async function saveContactForm(data) {
    // TODO: Implement Supabase insert
    /*
    const { data: result, error } = await supabase
        .from('contact_submissions')
        .insert([data])
    
    if (error) {
        console.error('Error saving contact:', error);
        return { success: false, error };
    }
    
    return { success: true, data: result };
    */
    
    console.log('💾 Ready to save to Supabase:', data);
    return { success: true, data };
}

// ============================================
// INITIALIZE
// ============================================

console.log('🚀 AKVENERGY Website Loaded');
console.log('✅ Section switching enabled');
console.log('✅ Calculator ready');
console.log('✅ Contact form ready');
console.log('✅ Ripple effect enabled');
console.log('⚠️  Supabase integration pending');

// ============================================
// RIPPLE EFFECT FOR ALL BUTTONS
// ============================================

/**
 * Create ripple effect on button click
 * @param {Event} event - Click event
 */
function createRipple(event) {
    const button = event.currentTarget;
    
    // Create ripple element
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    
    // Get button dimensions and position
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    // Set ripple size and position
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    // Add ripple to button
    button.appendChild(ripple);
    
    // Remove ripple after animation completes
    setTimeout(() => {
        ripple.remove();
    }, 600); // Match animation duration
}

/**
 * Add ripple effect to all buttons
 */
function initRippleEffect() {
    // Get all buttons
    const buttons = document.querySelectorAll('.btn, .calculate-btn, .submit-btn, button');
    
    // Add click event listener to each button
    buttons.forEach(button => {
        button.addEventListener('click', createRipple);
    });
    
    console.log(`✨ Ripple effect added to ${buttons.length} buttons`);
}

// Initialize ripple effect when DOM is ready
document.addEventListener('DOMContentLoaded', initRippleEffect);

// ============================================
// NAVBAR ANIMATIONS
// ============================================

/**
 * Navbar slide down animation on page load
 */
window.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('.header');
    
    // Slide navbar down after a short delay
    setTimeout(function() {
        if (header) {
            header.classList.add('nav-visible');
        }
    }, 100); // Small delay for smooth appearance
});

/**
 * Add shadow to navbar on scroll
 */
let lastScrollTop = 0;

window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Add shadow when scrolled down
    if (scrollTop > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    lastScrollTop = scrollTop;
});
