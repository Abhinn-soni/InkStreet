# InkStreet - Gen-Z Streetwear Ecommerce Platform

> Modern, cyberpunk-themed ecommerce platform for streetwear and anime apparel with 3D experiences, real-time reviews, and advanced ecommerce features.

![InkStreet](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)

## 🚀 Features

### Customer-Facing Features
- **3D Product Previews** - Interactive 3D models with real-time color/size changes
- **Custom Design Studio** - Upload designs and preview on 3D apparel
- **Scroll-Triggered Animations** - GSAP-powered unfolding T-shirt hero
- **Product Reviews & Ratings** - 5-star system with photo uploads & verified buyers
- **Discount Coupons** - Apply promo codes at checkout
- **Limited Edition Drops** - Countdown timers and stock indicators
- **AI Customer Support** - GPT-5.2 powered chatbot
- **Wishlist & Cart** - Save favorites and manage purchases
- **Real-time Payment** - Razorpay integration (UPI, Cards, COD)

### Admin Dashboard
- Product Management (add/edit/delete with limited edition settings)
- Category Management
- Order Tracking & Fulfillment
- Review Moderation
- Coupon Creation & Management
- Abandoned Cart Recovery
- Customer Analytics
- Inventory Management

### Design & UX
- **Cyberpunk Aesthetic** - Neon cyan (#00F0FF) theme with sharp edges
- **3D Background Effects** - Floating particles, holographic shapes
- **Animated Loading Screen** - Neon logo with pulse effects
- **Mobile Responsive** - Optimized for all devices
- **Performance Optimized** - Lazy loading, code splitting

## 📁 Project Structure

```
/app/
├── backend/                    # FastAPI Backend
│   ├── server.py              # Main API server
│   ├── seed_data.py           # Initial data seeder
│   ├── seed_reviews.py        # Review data seeder
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
│
├── frontend/                   # React Frontend
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── CyberButton.js
│   │   │   ├── Navigation.js
│   │   │   ├── Footer.js
│   │   │   ├── ProductCard.js
│   │   │   ├── ChatWidget.js
│   │   │   ├── LoadingScreen.js
│   │   │   ├── CyberParticles.js
│   │   │   ├── Hero3DScrollScene.js
│   │   │   ├── Product3DPreview.js
│   │   │   ├── CustomDesign3D.js
│   │   │   ├── ReviewSection.js
│   │   │   ├── CouponInput.js
│   │   │   └── LimitedEditionBadge.js
│   │   │
│   │   ├── pages/             # Page components
│   │   │   ├── Home.js
│   │   │   ├── Shop.js
│   │   │   ├── ProductDetail.js
│   │   │   ├── CustomDesign.js
│   │   │   ├── Cart.js
│   │   │   ├── Wishlist.js
│   │   │   ├── Checkout.js
│   │   │   ├── Login.js
│   │   │   ├── Account.js
│   │   │   ├── Policy.js
│   │   │   └── Admin.js
│   │   │
│   │   ├── App.js             # Main app component
│   │   ├── App.css            # Global styles
│   │   ├── index.js           # Entry point
│   │   └── index.css          # Tailwind imports
│   │
│   ├── package.json           # Node dependencies
│   ├── tailwind.config.js     # Tailwind configuration
│   └── .env                   # Frontend environment variables
│
└── README.md                   # This file
```

## 🛠️ Technology Stack

### Backend
- **FastAPI** - High-performance Python API framework
- **MongoDB** - NoSQL database
- **Motor** - Async MongoDB driver
- **JWT** - Authentication
- **Razorpay** - Payment gateway
- **Emergent Integrations** - LLM (GPT-5.2)

### Frontend
- **React 18.3.1** - UI library
- **GSAP** - Scroll animations
- **Three.js** - 3D rendering
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations

## 📦 Installation

### Prerequisites
- Node.js 18+, Yarn
- Python 3.9+
- MongoDB 4.4+

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python seed_data.py
python seed_reviews.py
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend Setup

```bash
cd frontend
yarn install
yarn start
```

## 🔐 Environment Variables

### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=inkstreet_db
JWT_SECRET=your_secret_key
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
EMERGENT_LLM_KEY=your_llm_key
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

## 👤 Default Credentials

**Admin:**
- Email: admin@inkstreet.com
- Password: admin123

**Demo User:**
- Email: demo@inkstreet.com
- Password: demo123

## 🚀 Deployment

See full deployment guide in README.md

## 📝 License

Proprietary © 2026 InkStreet

---

Version: 1.0.0 | Built for Gen-Z
