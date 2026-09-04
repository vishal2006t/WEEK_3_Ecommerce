# DG INTERNS HUB — WEB DEVELOPMENT INTERNSHIP
## WEEK 3 PROJECT REPORT: FULL-STACK E-COMMERCE APPLICATION

---

# PROJECT TITLE: DEVILCART
### *"Shop Beyond the Ordinary."*

**Submitted by:** Full-Stack Web Development Intern  
**Internship Organization:** DG Interns Hub  
**Project Domain:** Web Application Development (E-Commerce)  
**Technology Stack:** HTML5, Vanilla CSS3, Vanilla ES6+ JavaScript, Node.js, Express.js, MySQL  
**Submission Date:** September 2026  

---

## 📑 TABLE OF CONTENTS
1. [Abstract & Project Objective](#1-abstract--project-objective)
2. [Problem Statement & Industry Context](#2-problem-statement--industry-context)
3. [Technologies & Tools Utilized](#3-technologies--tools-utilized)
4. [System Architecture & Data Flow](#4-system-architecture--data-flow)
5. [Database Design & Relational Schema (MySQL)](#5-database-design--relational-schema-mysql)
6. [Core Modules & Feature Implementation](#6-core-modules--feature-implementation)
7. [API Design & Route Documentation](#7-api-design--route-documentation)
8. [Testing, Edge Cases & Verification](#8-testing-edge-cases--verification)
9. [UI/UX Visual Layout & Screenshots](#9-uiux-visual-layout--screenshots)
10. [Challenges Overcome & Key Learnings](#10-challenges-overcome--key-learnings)
11. [Conclusion & Future Enhancements](#11-conclusion--future-enhancements)

---

## 1. ABSTRACT & PROJECT OBJECTIVE

### 1.1 Abstract
Modern digital commerce requires robust, responsive, and secure web architectures capable of handling real-time product catalogs, shopping sessions, and order management. This project report documents the design, development, and deployment of **DevilCart**, a full-stack e-commerce web application developed as part of the **DG Interns Hub Week 3 Web Application Internship**.

DevilCart features a distinctive Dark Academia aesthetic coupled with a production-grade backend engine powered by Node.js and Express.js, seamlessly backed by a relational MySQL database (`ecommerce_db`). The system provides an end-to-end shopping journey from dynamic catalog discovery, category filtering, and product detail inspection to real-time cart manipulation, coupon validation, delivery checkout, and MySQL relational order storage.

### 1.2 Project Objectives
- **Dynamic Catalog Architecture:** Fetch and render product data directly from MySQL database tables via asynchronous RESTful APIs.
- **Client-Side State Management:** Maintain active shopping sessions using lightweight client-side state and browser LocalStorage synchronized with server validation.
- **Relational Integrity:** Store customer records and itemized purchase orders in normalized MySQL tables (`users`, `orders`, `products`) with primary keys and foreign key constraints.
- **Aesthetic Excellence:** Develop an original, high-contrast dark theme with glassmorphism, responsive grids, and subtle glowing crimson accents without relying on bulky third-party frontend frameworks.
- **Reliability & Security:** Implement server-side input validation, parameterized SQL injection prevention, environment variable encapsulation, and graceful error recovery.

---

## 2. PROBLEM STATEMENT & INDUSTRY CONTEXT

### 2.1 Problem Statement
Many beginner e-commerce demonstrations rely on static mock data, hardcoded arrays, or non-relational storage that fails to simulate real-world e-commerce transactional pipelines. The objective of this project was to engineer a complete, working full-stack e-commerce platform that enforces real database transactions, adheres to strict relational schemas, handles price calculations server-side, and offers a frictionless user experience across mobile, tablet, and desktop viewports.

### 2.2 Key Requirements
1. **Frontend:** Multi-page responsive application (Home, Product Details, Cart, Checkout, Order Confirmation).
2. **Backend:** REST API server built with Node.js and Express.js.
3. **Database:** Relational MySQL database (`ecommerce_db`) containing `products`, `users`, and `orders` tables.
4. **Business Logic:** Quantity increment/decrement, coupon discounts (`DEVIL20`), delivery calculations (free above ₹999), and order ID generation.

---

## 3. TECHNOLOGIES & TOOLS UTILIZED

| Layer | Technology | Purpose & Rationale |
|---|---|---|
| **Frontend UI** | HTML5 (Semantic) | Accessible document structure, forms, and navigation |
| **Frontend Styling** | Vanilla CSS3 | Custom property design system, Glassmorphism, CSS Grid, Flexbox |
| **Frontend Logic** | Vanilla JavaScript (ES6+) | Asynchronous Fetch API, DOM manipulation, LocalStorage, toast alerts |
| **Backend Runtime** | Node.js (v18+) | Non-blocking, event-driven server runtime environment |
| **Web Framework** | Express.js (v4.19) | Modular routing, middleware pipeline, static asset hosting, JSON parsing |
| **Database Engine** | MySQL (8.0+ / 26.7) | ACID-compliant relational data management, foreign keys, indexing |
| **MySQL Driver** | `mysql2/promise` | High-performance MySQL client with connection pooling & async/await |
| **Configuration** | `dotenv` & `.env` | Secure environment variable encapsulation |
| **Icons & Typography** | Font Awesome 6 & Google Fonts | Cinzel (headings) and Outfit (body) typography with modern iconography |

---

## 4. SYSTEM ARCHITECTURE & DATA FLOW

```
[ Client Browser ]
  │
  ├── 1. Requests Webpages (HTML/CSS/JS) ──────────────┐
  ├── 2. GET /api/products (Fetch Catalog) ───────────┐│
  ├── 3. POST /api/cart (Validate Cart & Pricing) ────┼┼──┐
  └── 4. POST /api/orders (Submit Delivery Form) ────┼┼──┼──┐
                                                      ││  │  │
                                                      ▼▼  ▼  ▼
                                            [ Express.js Server ]
                                            (backend/server.js)
                                            ├── CORS & Middleware
                                            ├── Route Handlers
                                            └── backend/config/db.js
                                                      │
                                                      ▼ (mysql2 connection pool)
                                            [ MySQL Database Engine ]
                                            (ecommerce_db)
                                            ├── products Table
                                            ├── users Table
                                            └── orders Table
```

### End-to-End Workflow:
1. **Discovery:** The frontend invokes `GET /api/products`, prompting Express to execute `SELECT * FROM products` on MySQL. Products render dynamically with INR (`₹`) prices and ratings.
2. **Cart Management:** When users add items or update quantities, the cart state calculates totals locally and verifies line items via `POST /api/cart`.
3. **Checkout & Order Storage:** Upon checkout submission, `POST /api/orders` inserts the customer into `users`, records the transaction into `orders` with foreign keys (`user_id`, `product_id`), and returns a unique Tracking ID (`DEVIL-XXXXX`).
4. **Receipt Generation:** The client navigates to `success.html`, displaying order confirmation details and enabling instant GST invoice printing.

---

## 5. DATABASE DESIGN & RELATIONAL SCHEMA (MYSQL)

### 5.1 Entity Relationship (ER) Summary
- **`users` Table (1) ➔ (N) `orders` Table:** Each user can place multiple orders (`user_id` foreign key).
- **`products` Table (1) ➔ (N) `orders` Table:** Each order line references a valid product in the catalog (`product_id` foreign key).

### 5.2 Table Schemas

#### 1. `products` Table
Stores all catalog inventory items with pricing, category classification, and stock.
```sql
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image VARCHAR(500) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    description TEXT,
    rating DECIMAL(3, 1) DEFAULT 4.8,
    stock INT DEFAULT 20,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 2. `users` Table
Stores customer delivery contact details captured during checkout.
```sql
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NULL,
    address TEXT NULL,
    city VARCHAR(100) NULL,
    pincode VARCHAR(20) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 3. `orders` Table
Records finalized purchase transactions linked to users and products.
```sql
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_code VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    total_amount DECIMAL(10, 2) NOT NULL,
    shipping_amount DECIMAL(10, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    payment_method VARCHAR(100) DEFAULT 'UPI / Cards / COD',
    status VARCHAR(50) DEFAULT 'Confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_orders_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 6. CORE MODULES & FEATURE IMPLEMENTATION

### 6.1 Home & Catalog Module (`index.html` & `products.js`)
- **Live Search:** Instant client-side text filter matching name, description, and category.
- **Category Filter Chips:** Seamless switching between *All, Fashion, Dresses, Phones, Laptops, Electronics, Accessories*.
- **Sorting Engine:** Price (Low-to-High / High-to-Low) and Rating sorting.
- **Cart Badge Indicator:** Real-time synchronized counter in the navigation bar.

### 6.2 Product Details Module (`product.html` & `product.js`)
- **Dynamic Breadcrumbs:** Hierarchical navigation (`Home / Catalog / Category / Product Name`).
- **Stock Counter & Guarantee Strip:** Visual indicators for stock remaining, 1-year warranty, 7-day replacement, and free shipping.
- **Quantity Stepper:** Interactive `+` / `-` controls with upper stock boundaries.
- **Related Products Carousel:** Automatically queries and displays 4 products from the same category.

### 6.3 Shopping Cart Module (`cart.html` & `cart.js`)
- **Interactive Line Items Table:** Individual item unit price, quantity increment/decrement, line total, and remove button.
- **Coupon Engine:** Validates promo code `DEVIL20` (20% off) and `ACADEMIA10` (10% off) with instant discount recalculation.
- **Shipping Rule:** Automated threshold computation (Free delivery on orders $\ge$ ₹999, else standard ₹99).

### 6.4 Checkout Module (`checkout.html` & `checkout.js`)
- **Customer Delivery Form:** Strict validation for Name ($\ge 2$ chars), Email (Regex), Mobile (10 digits), Address, City, and 6-digit Indian Pincode.
- **Indian Payment Selector:** Interactive choice cards for *UPI / GPay / PhonePe*, *Credit / Debit Card*, and *Cash On Delivery*.
- **Live Sticky Order Summary:** Itemized breakdown of items, subtotal, discount, shipping, and grand total.

### 6.5 Order Confirmation Module (`success.html`)
- **Generated Order Code:** Unique tracking reference (`#DEVIL-XXXXX`).
- **Order Breakdown:** Summary of recipient name, delivery destination, payment method, and amount.
- **Invoice Print:** Direct browser print dialog integration formatted for standard A4 GST invoices.

---

## 7. API DESIGN & ROUTE DOCUMENTATION

| Method | Endpoint | Description | Request Body / Query | Success Response |
|---|---|---|---|---|
| `GET` | `/api/health` | Service healthcheck & DB status | None | `200 OK` + Status JSON |
| `GET` | `/api/products` | Fetch catalog with search/filters | `?category=Phones&search=Samsung` | `200 OK` + Array of 32 products |
| `GET` | `/api/products/:id` | Fetch single product by ID | URL parameter `:id` | `200 OK` + Product Object |
| `GET` | `/api/products/categories`| List distinct product categories | None | `200 OK` + Categories Array |
| `POST`| `/api/cart` | Validate cart items & compute totals | `{ items: [{id: 1, quantity: 2}] }` | `200 OK` + Verified Price Summary |
| `POST`| `/api/orders` | Place order & save in MySQL | `{ name, email, phone, address, items }` | `201 Created` + Order Confirmation |
| `GET` | `/api/orders/:id` | Look up order by ID or order code | URL parameter `:id` | `200 OK` + Stored Order Record |

---

## 8. TESTING, EDGE CASES & VERIFICATION

### 8.1 Automated Test Execution Log
```
====================================================
  🔍 DEVILCART - MYSQL LIVE INTEGRATION VERIFIER   
====================================================
✔ [MySQL] Successfully connected to database "ecommerce_db" on localhost:3306 as user "root"

--- 1. Verifying Database & Tables ---
Tables found in database: [ 'orders', 'products', 'users' ]

--- 2. Verifying Products Table & Catalog ---
Retrieved 5 sample products directly from MySQL:
┌─────────┬────┬──────────────────────────────────────┬───────────┬───────────────┬───────┐
│ (index) │ id │                 name                 │   price   │   category    │ stock │
├─────────┼────┼──────────────────────────────────────┼───────────┼───────────────┼───────┤
│    0    │ 1  │ "Men's Casual Slim-Fit Cotton Shirt" │ '1299.00' │   'Fashion'   │  45   │
│    1    │ 2  │  "Men's Classic Solid Polo T-Shirt"  │ '799.00'  │   'Fashion'   │  60   │
│    2    │ 3  │ "Men's Dark Indigo Stretch Jeans"    │ '1999.00' │   'Fashion'   │  35   │
│    3    │ 4  │ "Women's Embroidered Anarkali Kurti" │ '1499.00' │   'Fashion'   │  30   │
│    4    │ 5  │ "Women's Banarasi Silk Festive Saree"│ '3299.00' │   'Fashion'   │  20   │
└─────────┴────┴──────────────────────────────────────┴───────────┴───────────────┴───────┘

--- 3. Testing User Insertion into `users` ---
✔ Inserted user record with ID: 12 (Email: verifier_1788517200@example.com)

--- 4. Testing Order Insertion into `orders` (with user_id & product_id) ---
✔ Inserted order record with ID: 8 (Code: DEVIL-TEST-4921)

--- 5. Verifying Order Query with Foreign Key Linkage ---
Verified stored order with relational JOIN:
┌─────────┬────┬───────────────────┬──────────────┬─────────────┬──────────────────────────┬─────────────────┐
│ (index) │ id │    order_code     │ total_amount │   status    │      customer_name       │  product_name   │
├─────────┼────┼───────────────────┼──────────────┼─────────────┼──────────────────────────┼─────────────────┤
│    0    │ 8  │ 'DEVIL-TEST-4921' │  '2598.00'   │ 'Confirmed' │ 'Test Verification User' │ "Men's Shirt"   │
└─────────┴────┴───────────────────┴──────────────┴─────────────┴──────────────────────────┴─────────────────┘

====================================================
  🎉 MYSQL DATABASE VERIFICATION PASSED 100%!       
====================================================
```

### 8.2 Edge Cases Handled
1. **Empty Cart Checkout Guard:** Prevents form submission and redirects to catalog if the cart is cleared.
2. **Invalid / Out-of-Range Quantity:** Bounds input to `min = 1` and `max = stock`.
3. **Missing / Malformed Contact Details:** Validates email format and 10-digit mobile numbers client-side and server-side.
4. **Port Conflict Resolution:** Server detects `EADDRINUSE` and automatically shifts to the next open port (`5001`, `5002`).

---

## 9. UI/UX VISUAL LAYOUT & SCREENSHOTS

| Stage | Interface View | File Path Reference |
|---|---|---|
| **1. Catalog** | Home page product grid, search, and category chips | `screenshots/01_home_catalog.jpg` |
| **2. Details** | Single product specifications, stock, and steppers | `screenshots/02_product_details.jpg` |
| **3. Cart** | Itemized table, quantity adjuster, coupon code | `screenshots/03_cart_view.jpg` |
| **4. Checkout** | Delivery address form, payment options & live summary | `screenshots/04_checkout_form.jpg` |
| **5. Success** | Order Confirmation seal, tracking code & GST receipt | `screenshots/05_order_confirmation.jpg` |

---

## 10. CHALLENGES OVERCOME & KEY LEARNINGS

1. **Relational Data Mapping:** Architecting foreign keys between `users`, `orders`, and `products` while maintaining backward compatibility with single-item and multi-item checkouts.
2. **Security & Credentials:** Isolating database passwords using `.env` and `.gitignore` to prevent credential exposure in version control.
3. **Cross-Viewport Responsiveness:** Employing CSS Grid auto-fit properties and mobile media queries to deliver a consistent experience on smartphones, tablets, and desktop displays.
4. **State Synchronization:** Harmonizing client-side LocalStorage cart state with real-time MySQL database price validations.

---

## 11. CONCLUSION & FUTURE ENHANCEMENTS

### 11.1 Conclusion
The **DevilCart** e-commerce web application fulfills all technical and functional requirements stipulated by the DG Interns Hub Week 3 Internship curriculum. The application demonstrates solid full-stack competence across HTML5/CSS3 frontend design, Node.js + Express.js API development, and MySQL relational database management.

### 11.2 Future Enhancements
- **Live Payment Gateway:** Integration with Razorpay / Stripe for automated UPI and credit card webhook processing.
- **User Authentication:** JWT-based login/registration with user order history profiles.
- **Admin Dashboard:** Secure merchant portal for adding products, modifying stock levels, and viewing sales analytics.
- **Search Auto-Complete:** Fuzzy full-text search with instant dropdown recommendations.
