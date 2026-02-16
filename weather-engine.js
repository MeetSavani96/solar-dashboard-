// ============================================
// WEATHER-BASED SOLAR GENERATION ENGINE
// ============================================

console.log('🌤️ Weather Engine Loading...');

/**
 * Weather Engine Configuration
 * Simulates realistic weather patterns for different cities
 */
const weatherEngine = {
    // Weather patterns by city (cycles through these)
    weatherByCity: {
        "Surat": ["Sunny", "Partly Cloudy", "Sunny", "Clear", "Sunny"],
        "Mumbai": ["Cloudy", "Rainy", "Partly Cloudy", "Cloudy", "Rainy"],
        "Delhi": ["Haze", "Sunny", "Partly Cloudy", "Haze", "Clear"],
        "Jaipur": ["Sunny", "Sunny", "Clear", "Sunny", "Partly Cloudy"],
        "Pune": ["Sunny", "Partly Cloudy", "Clear", "Sunny"],
        "Ahmedabad": ["Sunny", "Clear", "Sunny", "Partly Cloudy"],
        "Bangalore": ["Partly Cloudy", "Cloudy", "Sunny", "Clear"],
        "Chennai": ["Sunny", "Clear", "Partly Cloudy", "Sunny"],
        "Hyderabad": ["Sunny", "Clear", "Partly Cloudy", "Sunny"],
        "Kolkata": ["Cloudy", "Partly Cloudy", "Rainy", "Cloudy"]
    },
    
    // Weather impact factors on solar generation
    weatherFactors: {
        "Sunny": 1.0,           // 100% generation
        "Clear": 0.95,          // 95% generation
        "Partly Cloudy": 0.8,   // 80% generation
        "Cloudy": 0.6,          // 60% generation
        "Rainy": 0.4,           // 40% generation
        "Haze": 0.7             // 70% generation
    },
    
    // Weather icons
    weatherIcons: {
        "Sunny": "☀️",
        "Clear": "🌤️",
        "Partly Cloudy": "⛅",
        "Cloudy": "☁️",
        "Rainy": "🌧️",
        "Haze": "🌫️"
    },
    
    // City solar factors (based on average solar irradiance)
    citySolarFactors: {
        "Surat": 1.0,
        "Mumbai": 0.9,
        "Delhi": 0.95,
        "Jaipur": 1.05,
        "Pune": 0.95,
        "Ahmedabad": 1.0,
        "Bangalore": 0.9,
        "Chennai": 1.0,
        "Hyderabad": 0.95,
        "Kolkata": 0.85
    },
    
    // Current state
    currentWeather: "Sunny",
    currentWeatherIndex: 0,
    weatherChangeInterval: null,
    generationUpdateInterval: null,
    
    /**
     * Initialize weather engine
     */
    init() {
        console.log('🌤️ Initializing Weather Engine...');
        
        // Set initial weather based on city
        this.updateWeather();
        
        // Start weather change cycle (every 30-60 seconds)
        this.startWeatherCycle();
        
        // Start generation update cycle (every 5 seconds for smooth updates)
        this.startGenerationCycle();
        
        console.log('✅ Weather Engine initialized');
    },
    
    /**
     * Get current city from dashboard state
     */
    getCurrentCity() {
        if (window.dashboardState && window.dashboardState.profile) {
            const location = window.dashboardState.profile.location;
            // Extract city name (handle "City, State" format)
            const city = location.split(',')[0].trim();
            return city;
        }
        return "Surat"; // Default
    },
    
    /**
     * Get weather pattern for current city
     */
    getWeatherPattern(city) {
        return this.weatherByCity[city] || this.weatherByCity["Surat"];
    },
    
    /**
     * Update current weather
     */
    updateWeather() {
        const city = this.getCurrentCity();
        const pattern = this.getWeatherPattern(city);
        
        // Cycle through weather pattern
        this.currentWeatherIndex = (this.currentWeatherIndex + 1) % pattern.length;
        this.currentWeather = pattern[this.currentWeatherIndex];
        
        console.log(`🌤️ Weather updated: ${this.currentWeather} in ${city}`);
        
        // Update UI
        this.updateWeatherUI();
        
        // Recalculate generation
        this.calculateGeneration();
    },
    
    /**
     * Get time of day factor (0 at night, 1 at peak)
     */
    getTimeOfDayFactor() {
        const now = new Date();
        const hour = now.getHours();
        
        // Night time (6 PM to 6 AM) = 0
        if (hour < 6 || hour >= 18) {
            return 0;
        }
        
        // Morning ramp up (6 AM to 10 AM)
        if (hour >= 6 && hour < 10) {
            return (hour - 6) / 4; // 0 to 1
        }
        
        // Peak hours (10 AM to 4 PM)
        if (hour >= 10 && hour < 16) {
            return 1.0;
        }
        
        // Evening ramp down (4 PM to 6 PM)
        if (hour >= 16 && hour < 18) {
            return (18 - hour) / 2; // 1 to 0
        }
        
        return 0;
    },
    
    /**
     * Calculate live power generation
     */
    calculateGeneration() {
        if (!window.dashboardState) return;
        
        const systemSize = window.dashboardState.profile.systemSize || 10;
        const city = this.getCurrentCity();
        const cityFactor = this.citySolarFactors[city] || 1.0;
        const weatherFactor = this.weatherFactors[this.currentWeather] || 1.0;
        const timeOfDayFactor = this.getTimeOfDayFactor();
        
        // Calculate live power
        const livePower = systemSize * cityFactor * weatherFactor * timeOfDayFactor;
        
        // Add small random variation (±5%)
        const variation = 0.95 + (Math.random() * 0.1);
        const finalPower = Math.max(0, livePower * variation);
        
        // Update dashboard state
        window.dashboardState.metrics.livePower = parseFloat(finalPower.toFixed(2));
        
        // Calculate today's generation (accumulate over time)
        this.updateTodayGeneration(finalPower);
        
        console.log(`⚡ Generation: ${finalPower.toFixed(2)} kW (Weather: ${this.currentWeather}, Time: ${timeOfDayFactor.toFixed(2)})`);
        
        // Update dashboard
        if (window.updateDashboardFromProfile) {
            window.updateDashboardFromProfile();
        }
        
        return finalPower;
    },
    
    /**
     * Update today's generation (accumulate)
     */
    updateTodayGeneration(currentPower) {
        if (!window.dashboardState) return;
        
        // Simulate accumulation (5 seconds = 5/3600 hours)
        const incrementalGeneration = currentPower * (5 / 3600);
        
        // Add to today's generation
        const currentGeneration = window.dashboardState.metrics.todayGeneration || 0;
        window.dashboardState.metrics.todayGeneration = parseFloat(
            (currentGeneration + incrementalGeneration).toFixed(2)
        );
        
        // Reset at midnight (check if new day)
        const now = new Date();
        if (now.getHours() === 0 && now.getMinutes() === 0) {
            window.dashboardState.metrics.todayGeneration = 0;
        }
    },
    
    /**
     * Update weather UI
     */
    updateWeatherUI() {
        const weatherBadge = document.getElementById('weatherBadge');
        const weatherIcon = document.getElementById('weatherIcon');
        const weatherLabel = document.getElementById('weatherLabel');
        
        if (weatherBadge && weatherIcon && weatherLabel) {
            const icon = this.weatherIcons[this.currentWeather] || "🌤️";
            
            weatherIcon.textContent = icon;
            weatherLabel.textContent = this.currentWeather;
            
            // Add animation
            weatherBadge.style.animation = 'weatherPulse 0.5s ease';
            setTimeout(() => {
                weatherBadge.style.animation = '';
            }, 500);
        }
        
        // Update weather impact insight
        this.updateWeatherInsight();
    },
    
    /**
     * Generate weather-based performance insight
     */
    updateWeatherInsight() {
        const city = this.getCurrentCity();
        const weatherFactor = this.weatherFactors[this.currentWeather];
        const impactPercentage = Math.round(weatherFactor * 100);
        
        let insightMessage = '';
        let insightType = 'info';
        
        if (weatherFactor >= 0.95) {
            insightMessage = `Excellent production under ${this.currentWeather.toLowerCase()} weather in ${city}`;
            insightType = 'positive';
        } else if (weatherFactor >= 0.8) {
            insightMessage = `Good production with ${this.currentWeather.toLowerCase()} conditions in ${city}`;
            insightType = 'positive';
        } else if (weatherFactor >= 0.6) {
            insightMessage = `Moderate output due to ${this.currentWeather.toLowerCase()} conditions in ${city}`;
            insightType = 'warning';
        } else {
            insightMessage = `Lower output due to ${this.currentWeather.toLowerCase()} conditions in ${city}`;
            insightType = 'warning';
        }
        
        // Store weather insight
        if (window.weatherInsight) {
            window.weatherInsight.message = insightMessage;
            window.weatherInsight.type = insightType;
            window.weatherInsight.impact = impactPercentage;
        } else {
            window.weatherInsight = {
                message: insightMessage,
                type: insightType,
                impact: impactPercentage
            };
        }
    },
    
    /**
     * Start weather change cycle
     */
    startWeatherCycle() {
        // Change weather every 30-60 seconds
        const changeWeather = () => {
            this.updateWeather();
            
            // Random interval between 30-60 seconds
            const nextInterval = 30000 + Math.random() * 30000;
            this.weatherChangeInterval = setTimeout(changeWeather, nextInterval);
        };
        
        // Start first cycle
        const initialInterval = 30000 + Math.random() * 30000;
        this.weatherChangeInterval = setTimeout(changeWeather, initialInterval);
        
        console.log('🔄 Weather cycle started');
    },
    
    /**
     * Start generation update cycle
     */
    startGenerationCycle() {
        // Update generation every 5 seconds
        this.generationUpdateInterval = setInterval(() => {
            this.calculateGeneration();
        }, 5000);
        
        console.log('⚡ Generation cycle started');
    },
    
    /**
     * Stop all cycles (for cleanup)
     */
    stop() {
        if (this.weatherChangeInterval) {
            clearTimeout(this.weatherChangeInterval);
        }
        if (this.generationUpdateInterval) {
            clearInterval(this.generationUpdateInterval);
        }
        console.log('🛑 Weather Engine stopped');
    },
    
    /**
     * Get weather statistics for current month
     */
    getMonthlyWeatherStats() {
        const city = this.getCurrentCity();
        const pattern = this.getWeatherPattern(city);
        
        // Calculate average weather factor
        let totalFactor = 0;
        pattern.forEach(weather => {
            totalFactor += this.weatherFactors[weather];
        });
        const avgWeatherFactor = totalFactor / pattern.length;
        
        // Find best weather
        let bestWeather = pattern[0];
        let bestFactor = this.weatherFactors[bestWeather];
        pattern.forEach(weather => {
            if (this.weatherFactors[weather] > bestFactor) {
                bestWeather = weather;
                bestFactor = this.weatherFactors[weather];
            }
        });
        
        return {
            averageFactor: avgWeatherFactor,
            averagePercentage: Math.round(avgWeatherFactor * 100),
            bestWeather: bestWeather,
            bestWeatherIcon: this.weatherIcons[bestWeather],
            currentWeather: this.currentWeather,
            currentIcon: this.weatherIcons[this.currentWeather],
            currentFactor: this.weatherFactors[this.currentWeather]
        };
    },
    
    /**
     * Generate weather-based insights for Analysis section
     */
    generateWeatherInsights() {
        const stats = this.getMonthlyWeatherStats();
        const city = this.getCurrentCity();
        const insights = [];
        
        // Current weather impact
        const currentImpact = Math.round(stats.currentFactor * 100);
        insights.push({
            type: stats.currentFactor >= 0.8 ? 'positive' : 'warning',
            icon: stats.currentIcon,
            message: `Current weather: ${this.currentWeather} (${currentImpact}% efficiency)`,
            detail: `Real-time generation adjusted for ${city} weather conditions`
        });
        
        // Monthly average weather
        insights.push({
            type: 'info',
            icon: '📊',
            message: `Average weather efficiency: ${stats.averagePercentage}% this month`,
            detail: `Based on typical weather patterns in ${city}`
        });
        
        // Best weather day
        insights.push({
            type: 'positive',
            icon: stats.bestWeatherIcon,
            message: `Best production during ${stats.bestWeather} conditions`,
            detail: `Optimal weather provides ${Math.round(this.weatherFactors[stats.bestWeather] * 100)}% generation capacity`
        });
        
        return insights;
    }
};

/**
 * Initialize weather engine when dashboard state is ready
 */
function initWeatherEngine() {
    console.log('🌤️ Checking if Weather Engine can start...');
    
    if (window.dashboardState) {
        weatherEngine.init();
    } else {
        console.log('⏳ Waiting for dashboard state...');
        setTimeout(initWeatherEngine, 1000);
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initWeatherEngine, 2000);
    });
} else {
    setTimeout(initWeatherEngine, 2000);
}

// Export for global use
window.weatherEngine = weatherEngine;
window.initWeatherEngine = initWeatherEngine;

console.log('✅ Weather Engine Module Loaded');
