# ☀️ Solar Dashboard - Complete Solar Energy Management Platform

A full-featured solar energy monitoring and management platform with customer dashboard, admin analytics, and lead tracking system.

![Status](https://img.shields.io/badge/status-production--ready-green)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🎯 Features

### For Customers
- ☀️ **Solar Calculator** - Calculate ROI and savings without login
- 📊 **Personal Dashboard** - Real-time monitoring and analytics
- 👤 **Profile Management** - Manage system details and preferences
- 💰 **ROI Forecasting** - 10 & 25-year projections with loan support
- 🔧 **Complaint System** - Submit and track support requests
- 📱 **Mobile Responsive** - Works on all devices

### For Admins
- 📈 **Analytics Dashboard** - Comprehensive business insights
- 👥 **Lead Management** - Track calculator submissions
- 🎯 **Customer Management** - View all customer data
- 📊 **KPI Tracking** - Real-time business metrics
- 🔍 **Time Filtering** - 7/30/90 day views
- 🛠️ **Complaint Tracking** - Manage support tickets

---

## 🏗️ Tech Stack

**Frontend:**
- HTML5, CSS3, Vanilla JavaScript
- Chart.js for data visualization
- Responsive design (mobile-first)

**Backend:**
- Supabase (PostgreSQL)
- Supabase Auth (authentication)
- Row Level Security (RLS)

**Hosting:**
- Static hosting (Netlify/Vercel/GitHub Pages)
- HTTPS enabled
- CDN delivery

---

## 🚀 Quick Start

### Prerequisites
- Supabase account (free tier works)
- Netlify/Vercel account (free tier works)
- Text editor

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/solar-dashboard.git
cd solar-dashboard
```

### 2. Setup Supabase
1. Create a new Supabase project
2. Run the SQL setup:
   - Open `supabase-complete-backend.sql`
   - Copy contents to Supabase SQL Editor
   - Execute query

### 3. Configure Application
1. Get your Supabase credentials:
   - Go to Settings → API
   - Copy Project URL and anon public key

2. Update `js/supabase-config.js`:
```javascript
const SUPABASE_URL = "your-project-url";
const SUPABASE_ANON_KEY = "your-anon-key";
```

### 4. Deploy
**Option A: Netlify (Recommended)**
1. Go to https://app.netlify.com
2. Drag project folder to deploy
3. Copy your URL

**Option B: Vercel**
1. Push to GitHub
2. Import to Vercel
3. Deploy

### 5. Configure Supabase URLs
1. Go to Supabase → Authentication → URL Configuration
2. Set Site URL to your deployment URL
3. Add Redirect URLs

### 6. Create Admin User
1. Sign up on your site
2. Verify email
3. Run SQL:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

**Done! 🎉**

---

## 📁 Project Structure

```
solar-dashboard/
├── index.html              # Home page with calculator
├── login.html              # Login page
├── signup.html             # Signup page
├── dashboard.html          # Main dashboard
├── css/                    # Stylesheets
│   ├── style.css
│   ├── dashboard.css
│   ├── admin-leads.css
│   └── admin-analytics.css
├── js/                     # JavaScript modules
│   ├── supabase-config.js
│   ├── supabase-auth.js
│   ├── supabase-backend.js
│   └── ... (24 modules)
└── docs/                   # Documentation
    ├── DEPLOY-NOW.md
    ├── DEPLOYMENT-GUIDE.md
    └── ... (9 guides)
```

---

## 📚 Documentation

### Quick Guides
- **[DEPLOY-NOW.md](docs/DEPLOY-NOW.md)** - 15-minute deployment
- **[DEPLOYMENT-QUICK-START.md](docs/DEPLOYMENT-QUICK-START.md)** - 30-minute guide

### Complete Guides
- **[DEPLOYMENT-GUIDE.md](docs/DEPLOYMENT-GUIDE.md)** - Full deployment manual
- **[FINAL-LAUNCH-CHECKLIST.md](docs/FINAL-LAUNCH-CHECKLIST.md)** - Pre-launch verification
- **[TESTING-CHECKLIST.md](docs/TESTING-CHECKLIST.md)** - 200+ test cases

### Database
- **[SUPABASE-COMPLETE-SETUP.md](docs/SUPABASE-COMPLETE-SETUP.md)** - Database setup
- **supabase-complete-backend.sql** - SQL schema

---

## 🔐 Security

- ✅ Supabase Auth integration
- ✅ Row Level Security (RLS)
- ✅ Role-based access control (RBAC)
- ✅ Email verification
- ✅ Secure session management
- ✅ HTTPS enforcement
- ✅ Input validation
- ✅ XSS prevention

---

## 🧪 Testing

Run through the testing checklist:
```bash
# See docs/TESTING-CHECKLIST.md for complete tests
```

**Test Coverage:**
- Authentication (10+ tests)
- Authorization (8+ tests)
- Profile Management (15+ tests)
- ROI Calculations (10+ tests)
- Admin Dashboard (20+ tests)
- Mobile Responsive (10+ tests)

---

## 📊 Database Schema

**6 Tables:**
- `users` - User accounts and roles
- `user_profiles` - Customer profile data
- `roi_data` - ROI calculations
- `leads` - Calculator submissions
- `complaints` - Support tickets
- `system_data` - System metrics

**30+ RLS Policies** for data security

---

## 🎨 Features in Detail

### Solar Calculator
- No login required
- Real-time ROI calculations
- Cash vs Loan comparison
- Automatic subsidy calculation
- Lead capture for admin

### Customer Dashboard
- Real-time monitoring
- Profile management
- ROI forecasting (10 & 25 years)
- Complaint submission
- System health tracking

### Admin Dashboard
- Overview KPIs (6 cards)
- Lead analytics with charts
- ROI & financial analytics
- Customer segmentation
- Complaint management
- Time-based filtering

---

## 🚀 Deployment

**Supported Platforms:**
- ✅ Netlify (Recommended)
- ✅ Vercel
- ✅ GitHub Pages
- ✅ Any static hosting

**Requirements:**
- HTTPS enabled
- Supabase project
- Email verification setup

---

## 🔧 Configuration

### Environment Variables
Update `js/supabase-config.js`:
```javascript
const SUPABASE_URL = "your-url";
const SUPABASE_ANON_KEY = "your-key";
```

### Supabase Settings
- Enable email verification
- Configure redirect URLs
- Set site URL
- Enable RLS on all tables

---

## 📱 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

MIT License - feel free to use for personal or commercial projects.

---

## 🆘 Support

### Documentation
- Check `docs/` folder for guides
- See `docs/DEPLOYMENT-TROUBLESHOOTING.md` for common issues

### Common Issues
- **"Supabase is not defined"** → Check script order in HTML
- **"Invalid API key"** → Verify anon key in config
- **"Access denied"** → Check RLS policies

### External Resources
- [Supabase Docs](https://supabase.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- [Chart.js Docs](https://www.chartjs.org/docs)

---

## 🎉 Credits

Built with:
- [Supabase](https://supabase.com) - Backend & Auth
- [Chart.js](https://www.chartjs.org) - Data visualization
- [Netlify](https://netlify.com) - Hosting

---

## 📞 Contact

For questions or support:
- Open an issue on GitHub
- Check documentation in `docs/` folder

---

## ✅ Status

**Production Ready** - Fully tested and deployed

**Version:** 1.0.0
**Last Updated:** February 2026

---

**⭐ Star this repo if you find it helpful!**

**🚀 Ready to deploy? See [DEPLOY-NOW.md](docs/DEPLOY-NOW.md)**
