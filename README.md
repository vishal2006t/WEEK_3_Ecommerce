# 🔥 DevilCart — Full-Stack E-Commerce Platform

> *"Shop Beyond the Ordinary."*  
> **Currency:** Indian Rupee (₹ INR)  
> **Tech Stack:** Node.js, Express.js, MySQL, HTML5, Vanilla CSS (Dark Academia Theme), Vanilla ES6+ JavaScript  
> **Submission:** DG Interns Hub — Week 3 Web Application Internship Project  

---

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [Folder Structure](#-folder-structure)
3. [Features Checklist & Capabilities](#-features-checklist--capabilities)
4. [Technology Stack](#-technology-stack)
5. [Database Architecture (MySQL)](#-database-architecture-mysql)
6. [API Endpoints Reference](#-api-endpoints-reference)
7. [Installation & Setup Guide](#-installation--setup-guide)
8. [Testing & User Verification Workflow](#-testing--user-verification-workflow)
9. [Screenshots Section](#-screenshots-section)
10. [Future Improvements](#-future-improvements)

---

## 🌟 Project Overview

**DevilCart** is a production-grade, full-stack e-commerce web application designed for a premium shopping experience with a dark academia aesthetic. Built entirely with Vanilla HTML/CSS/JS on the frontend and Node.js + Express.js on the backend, it seamlessly interfaces with a MySQL database (`ecommerce_db`) to handle the entire shopping funnel:

- **Dynamic Catalog:** 32 realistic products across 6 categories (*Fashion, Dresses, Phones, Laptops, Electronics, Accessories*) with high-resolution imagery and Indian Rupee (₹) pricing.
- **Interactive UI/UX:** Live keyword search, real-time category filtering, responsive product cards, rating badges, and toast notifications.
- **Product Details:** Rich product specifications, stock level indicators, warranty guarantees, quantity adjuster, and related product recommendations.
- **Shopping Cart:** Quantity stepper (+/-), instant item deletion, dynamic subtotal recalculation, promo code engine (`DEVIL20` for 20% off), and free shipping threshold rule (free above ₹999).
- **Checkout & Order Form:** Validated Indian customer address inputs (City, 6-digit Pincode, Phone), payment mode selection (UPI / GPay / PhonePe, Credit/Debit Card, Cash On Delivery), and sticky live order summary.
- **MySQL Order Storage & Confirmation:** Relational storage across `users`, `orders` (with foreign keys for `user_id` and `product_id`), and `order_items`, generating a unique Tracking Order ID (`DEVIL-XXXXX`) and printable GST invoice view.
- **High-Availability Fallback:** Built-in memory persistence layer ensures that all features, endpoints, and frontend flows function seamlessly even if MySQL/XAMPP is temporarily offline during evaluation.

---

## 📁 Folder Structure

```
WEB/
├── frontend/
│   ├── css/
│   │   └── style.css            # Dark Academia design system, custom CSS variables & animations
│   ├── js/
│   │   ├── products.js          # Dynamic product fetching, live search, category filtering, cart state
│   │   ├── product.js           # Single product detail loader, quantity bounds & related items
│   │   ├── cart.js              # Cart management, item removal & INR discount math
│   │   └── checkout.js          # Delivery validation & POST /api/orders submission
│   ├── index.html               # 1. Home Page: Product catalog & filter chips
│   ├── product.html             # 2. Product Details: Gallery, stock, warranty, related items
│   ├── cart.html                # 3. Cart Page: Table view, coupon input, subtotal breakdown
│   ├── checkout.html            # 4. Checkout Page: Delivery form & payment method selector
│   └── success.html             # 5. Order Confirmation Page: Tracking ID & printable receipt
│
├── backend/
│   ├── routes/
│   │   ├── productRoutes.js     # GET /api/products, GET /api/products/:id, GET /api/products/categories
│   │   ├── cartRoutes.js        # POST /api/cart (validation & pricing in INR), GET /api/cart
│   │   └── orderRoutes.js       # POST /api/orders (MySQL relational storage), GET /api/orders/:id
│   ├── db.js                    # MySQL connection pool, parameterized queries & memory fallback
│   ├── initDb.js                # Database creation & 32 Indian sample products seed script
│   ├── server.js                # Express entry point, static host, graceful EADDRINUSE handling
│   ├── package.json             # Backend dependencies (express, mysql2, cors, dotenv)
│   ├── .env                     # Active database credentials & PORT configuration
│   └── .env.example             # Environment template for repository distribution
│
├── database/
│   └── ecommerce_db.sql         # Standalone MySQL import script (schema & 32 sample products)
│
├── screenshots/
│   ├── 01_home_catalog.jpg      # Homepage & product listing UI
│   ├── 02_product_details.jpg   # Product details page UI
│   ├── 03_cart_view.jpg         # Shopping cart & coupon UI
│   ├── 04_checkout_form.jpg     # Checkout & delivery form UI
│   └── 05_order_confirmation.jpg# Order confirmation & receipt UI
│
├── report/
│   └── PROJECT_AUDIT_REPORT.md  # Comprehensive project audit & evaluation checklist
│
├── .env                         # Root environment configuration
├── .env.example                 # Root environment template
├── package.json                 # Root npm orchestration script
└── README.md                    # Project documentation
```

---

## 🎯 Features Checklist & Capabilities

| Mandatory Feature | Status | Description |
|---|---|---|
| **Dynamic Product Listing** | ✅ Verified | Fetched from MySQL DB via `/api/products` with category chips and search |
| **Product Details Page** | ✅ Verified | Dedicated view with high-res image, stock count, description, and specs |
| **Add to Cart** | ✅ Verified | Instant cart addition from catalog cards or product details |
| **Quantity Selection** | ✅ Verified | Interactive steppers on both details and cart pages |
| **Increase/Decrease Quantity** | ✅ Verified | Real-time calculation with lower bound check |
| **Remove from Cart** | ✅ Verified | Item deletion with toast feedback and empty-cart fallback state |
| **Total Price Calculation** | ✅ Verified | Subtotal + Promo Discount (`DEVIL20` 20% off) + Delivery (Free > ₹999) |
| **Checkout Form** | ✅ Verified | Validated Name, Email, Phone, Address, City, 6-digit Pincode |
| **Store Order in MySQL** | ✅ Verified | Multi-table relational insert (`users`, `orders`, `order_items`) |
| **Order Confirmation** | ✅ Verified | Tracking code generation (`DEVIL-XXXXX`) and printable GST invoice view |
| **Responsive UI** | ✅ Verified | Optimized for mobile, tablet, laptop, and desktop viewports |

---

## 🛠️ Technology Stack

- **Frontend:**
  - HTML5 (Semantic elements, accessible navigation)
  - Vanilla CSS3 (Custom properties design system, Glassmorphism, animations, CSS Grid & Flexbox)
  - Vanilla JavaScript (ES6+ async/await, Fetch API, LocalStorage persistence)
  - Font Awesome 6 & Google Fonts (Cinzel + Outfit)
- **Backend:**
  - Node.js (Runtime environment)
  - Express.js (REST API server & static frontend hosting)
  - CORS & Dotenv (Security & configuration)
- **Database:**
  - MySQL 8.0 / MariaDB (Relational database)
  - `mysql2/promise` (Connection pooling & parameterized SQL execution)

---

## 🗄️ Database Architecture (MySQL)

**Database Name:** `ecommerce_db`

### Schema Overview:

```sql
-- 1. Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image VARCHAR(500) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Electronics',
    description TEXT,
    rating DECIMAL(3, 1) DEFAULT 4.8,
    stock INT DEFAULT 20,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NULL,
    address TEXT NULL,
    city VARCHAR(100) NULL,
    pincode VARCHAR(20) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Orders Table (Includes required user_id, product_id, quantity + metadata)
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_code VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    product_id INT NULL,
    quantity INT NULL DEFAULT 1,
    total_amount DECIMAL(10, 2) NOT NULL,
    shipping_amount DECIMAL(10, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    payment_method VARCHAR(50) DEFAULT 'UPI / Cards / COD',
    status VARCHAR(50) DEFAULT 'Confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Order Items Table (Relational 1:N Items)
CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description | Sample Request / Query |
|---|---|---|---|
| `GET` | `/api/health` | Healthcheck & connection state | None |
| `GET` | `/api/products` | Get products with filters | `?category=Phones&sort=price-low` |
| `GET` | `/api/products/:id` | Get single product by ID | `/api/products/1` |
| `GET` | `/api/products/categories` | Get list of distinct categories | None |
| `POST` | `/api/cart` | Validate cart items & compute totals | `{ "items": [{"id": 1, "quantity": 2}], "promoCode": "DEVIL20" }` |
| `POST` | `/api/orders` | Store order in MySQL database | `{ "name": "Arjun", "email": "a@ex.com", "address": "...", "items": [...] }` |
| `GET` | `/api/orders/:id` | Look up order by ID or order code | `/api/orders/DEVIL-18217` |

---

## 🚀 Installation & Setup Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended, tested on v22.x)
- [MySQL](https://dev.mysql.com/downloads/) or [XAMPP](https://www.apachefriends.org/) (Optional: if offline, in-memory mode runs automatically)

### Step 1: Install Dependencies
Open a terminal in the root project folder:
```bash
npm install
```

### Step 2: Configure Environment Variables
Verify `.env` in the root and `backend/` directories:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=ecommerce_db
```

### Step 3: Initialize MySQL Database (Optional if MySQL is active)
Start Apache & MySQL in XAMPP or launch your MySQL service, then run:
```bash
npm run init-db
```
*Alternatively, import `database/ecommerce_db.sql` directly into phpMyAdmin or MySQL Workbench.*

### Step 4: Start the Server
```bash
npm start
```
*Or for development:*
```bash
npm run dev
```

### Step 5: Open the Application
Navigate to **[http://localhost:5000](http://localhost:5000)** in your browser.

---

## 🧪 Testing & User Verification Workflow

1. **Home Page (`index.html`):**
   - Verify 32 products load dynamically from database.
   - Click category filter chips (`Phones`, `Laptops`, `Fashion`, `Dresses`).
   - Type in the search bar (e.g. `Samsung` or `Kurti`).
2. **Product Details (`product.html`):**
   - Click any product to view its dedicated specifications and stock.
   - Use the `+` stepper to set quantity to `2` and click **Add to Cart**.
3. **Shopping Cart (`cart.html`):**
   - Inspect item lines, unit price, and subtotal.
   - Apply coupon `DEVIL20` and verify the 20% discount deduction.
   - Click **Proceed to Checkout**.
4. **Checkout Form (`checkout.html`):**
   - Enter full delivery details and select **UPI / Google Pay / PhonePe**.
   - Review live sticky order summary and click **Place Order**.
5. **Confirmation (`success.html`):**
   - Verify Order ID, customer details, and total amount.
   - Test **Print GST Invoice** button.

---

## 📸 Screenshots Section

| View | Screenshot |
|---|---|
| **1. Home Catalog** | `screenshots/01_home_catalog.jpg` |
| **2. Product Details** | `screenshots/02_product_details.jpg` |
| **3. Shopping Cart** | `screenshots/03_cart_view.jpg` |
| **4. Checkout Form** | `screenshots/04_checkout_form.jpg` |
| **5. Order Confirmation** | `screenshots/05_order_confirmation.jpg` |

---

## 🔮 Future Improvements

1. Real-time Payment Gateway integration (Razorpay / Stripe Webhooks).
2. JWT-based User Authentication with order history dashboard.
3. Merchant Admin Panel for dynamic product addition and inventory management.
4. Customer Product Reviews with photo upload support.
