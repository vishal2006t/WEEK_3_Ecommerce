# 📊 DEVILCART — E-COMMERCE WEB APPLICATION
## DG Interns Hub — Week 3 Internship Viva Presentation

---

### 🖥️ SLIDE 1: TITLE & PROJECT OVERVIEW
```
┌─────────────────────────────────────────────────────────────┐
│                       DEVILCART                             │
│             "Shop Beyond the Ordinary."                     │
│                                                             │
│   Full-Stack E-Commerce Web Application Development         │
│   DG Interns Hub — Week 3 Web Development Internship        │
│                                                             │
│   Presenter: Full-Stack Web Development Intern              │
│   Domain: Web Application Development                       │
│   Tech Stack: Node.js • Express.js • MySQL • Vanilla JS     │
└─────────────────────────────────────────────────────────────┘
```
**Talking Points:**
- Welcome the evaluators.
- Introduce DevilCart: A modern, high-performance, dark-academia-themed e-commerce platform built from scratch with pure HTML/CSS/JS frontend and Node.js + Express + MySQL backend.

---

### 🎯 SLIDE 2: PROJECT OBJECTIVES & SCOPE
**Key Goals:**
1. Build an interactive, multi-page e-commerce website with real-time product discovery.
2. Interface the frontend with a RESTful Express.js backend.
3. Persist product inventory, customer delivery details, and order transactions into a real MySQL database (`ecommerce_db`).
4. Implement essential commerce logic: Add to Cart, quantity adjusters, coupon discounts (`DEVIL20`), delivery fee threshold, and order confirmation receipts.
5. Create a distinctive, responsive Dark Academia UI with glassmorphism and subtle glowing red accents.

---

### 🛠️ SLIDE 3: TECHNOLOGY STACK & TOOLS
- **Frontend Layer:**
  - **HTML5:** Semantic, accessible layout.
  - **Vanilla CSS3:** Custom property design system, CSS Grid/Flexbox, Glassmorphism, animations.
  - **Vanilla JavaScript (ES6+):** Asynchronous Fetch API, DOM manipulation, LocalStorage session management.
- **Backend Layer:**
  - **Node.js (v18+):** Asynchronous event-driven runtime.
  - **Express.js (v4.19):** RESTful API routes, middleware pipeline, static hosting.
  - **CORS & Dotenv:** Security and environment configuration.
- **Database Layer:**
  - **MySQL 8.0+ / MariaDB:** Relational database with foreign key constraints.
  - **`mysql2/promise`:** Connection pooling and parameterized SQL queries.

---

### 🏛️ SLIDE 4: SYSTEM ARCHITECTURE & PIPELINE
```
+-------------------------------------------------------------+
|                     CLIENT BROWSER                          |
|  [Home/Catalog]  [Product Details]  [Cart]  [Checkout]      |
+------------------------------+------------------------------+
                               | Asynchronous REST API (Fetch)
                               v
+-------------------------------------------------------------+
|                 NODE.JS + EXPRESS.JS SERVER                 |
|  ├── /api/products  (GET all & by ID)                       |
|  ├── /api/cart      (POST validate & calculate)             |
|  └── /api/orders    (POST checkout & create)                |
+------------------------------+------------------------------+
                               | Connection Pool (mysql2)
                               v
+-------------------------------------------------------------+
|                    MYSQL DATABASE ENGINE                    |
|                        (ecommerce_db)                       |
|  ├── products  (id, name, price, image, category, stock)    |
|  ├── users     (id, name, email, phone, address, pincode)   |
|  └── orders    (id, user_id, product_id, quantity, total)   |
+-------------------------------------------------------------+
```

---

### 🗄️ SLIDE 5: DATABASE RELATIONAL DESIGN (MYSQL)
**Database:** `ecommerce_db`

1. **`products` Table:**
   - Primary Key: `id`
   - Fields: `name`, `price`, `image`, `category`, `description`, `rating`, `stock`
2. **`users` Table:**
   - Primary Key: `id`
   - Fields: `name`, `email`, `phone`, `address`, `city`, `pincode`
3. **`orders` Table:**
   - Primary Key: `id`
   - Foreign Keys: `user_id` $\rightarrow$ `users(id)`, `product_id` $\rightarrow$ `products(id)`
   - Fields: `order_code`, `user_id`, `product_id`, `quantity`, `total_amount`, `payment_method`, `status`

---

### ✨ SLIDE 6: CORE FEATURES & USER JOURNEY
1. **Catalog Browsing:** 32 dynamic products with INR (`₹`) prices, star ratings, and stock badges.
2. **Search & Filter:** Instant real-time search across title/description and category chips (*Fashion, Phones, Laptops, Dresses, Electronics, Accessories*).
3. **Product Details:** Dedicated page with specifications, warranty guarantees, and quantity selector.
4. **Shopping Cart:** Quantity stepper (+/-), remove item, coupon engine (`DEVIL20` 20% off), and free delivery calculation (free > ₹999).
5. **Checkout:** Customer delivery form validation with Indian payment modes (UPI / Cards / COD).
6. **Order Confirmation:** Real-time database insertion, unique tracking code (`#DEVIL-XXXXX`), and printable GST invoice.

---

### 📸 SLIDE 7: SCREENSHOTS & LIVE DEMO
- **Slide Visual 1:** Home page catalog with Dark Academia theme (`screenshots/01_home_catalog.jpg`).
- **Slide Visual 2:** Product details view with stock badge and stepper (`screenshots/02_product_details.jpg`).
- **Slide Visual 3:** Interactive shopping cart with applied discount (`screenshots/03_cart_view.jpg`).
- **Slide Visual 4:** Validated checkout delivery form & payment method selector (`screenshots/04_checkout_form.jpg`).
- **Slide Visual 5:** Order confirmation seal with Tracking ID (`screenshots/05_order_confirmation.jpg`).

---

### 🏁 SLIDE 8: CONCLUSION & KEY LEARNINGS
**Key Takeaways:**
- Mastered full-stack asynchronous data flow from browser Fetch to MySQL database.
- Implemented robust server-side validation and secure database connection pooling.
- Designed an original, modern dark aesthetic without relying on heavy frameworks.
- Successfully verified the complete e-commerce lifecycle with zero errors.

**Future Scope:**
- Integration of Razorpay / Stripe payment gateway webhooks.
- JWT user authentication & customer order history dashboard.
- Merchant admin inventory management panel.

**Thank you! Any questions?**
