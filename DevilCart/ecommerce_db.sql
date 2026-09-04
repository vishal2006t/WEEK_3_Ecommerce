-- ====================================================================
-- Database: ecommerce_db
-- Full-Stack E-Commerce Project Database Schema & Sample Products
-- DBMS: MySQL 8.0+ / MariaDB
-- Contains 38 Products across Fashion, Dresses, Phones, Laptops, Electronics, Accessories
-- ====================================================================

-- 1. Create Database if not exists
CREATE DATABASE IF NOT EXISTS `ecommerce_db` 
    DEFAULT CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE `ecommerce_db`;

-- 2. Safe Table Creations (IF NOT EXISTS - Will not drop or destroy existing tables)

-- 3. Products Table
CREATE TABLE IF NOT EXISTS `products` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `image` VARCHAR(500) NOT NULL,
    `category` VARCHAR(100) NOT NULL DEFAULT 'General',
    `description` TEXT,
    `rating` DECIMAL(3, 1) DEFAULT 4.8,
    `stock` INT DEFAULT 20,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Users Table
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(50) NULL,
    `address` TEXT NULL,
    `city` VARCHAR(100) NULL,
    `pincode` VARCHAR(20) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Orders Table (Contains user_id, product_id, quantity with Foreign Keys)
CREATE TABLE IF NOT EXISTS `orders` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `order_code` VARCHAR(50) NULL,
    `user_id` INT NOT NULL,
    `product_id` INT NOT NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    `total_amount` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `shipping_amount` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `discount_amount` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `payment_method` VARCHAR(100) NULL DEFAULT 'UPI / Cards / COD',
    `status` VARCHAR(50) NULL DEFAULT 'Confirmed',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_orders_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Insert Sample Products (Safe INSERT IGNORE - 38 Products in INR ₹)
INSERT IGNORE INTO `products` (`id`, `name`, `price`, `image`, `category`, `description`, `rating`, `stock`) VALUES
-- 1. ELECTRONICS (6 Products)
(1, 'Wireless Headphones', 1499.00, 'headphones.jpg', 'Electronics', 'High-definition wireless audio over-ear headphones with deep bass, ergonomic cushioned earcups, and 30-hour battery life.', 4.8, 35),
(5, 'Bluetooth Speaker', 1299.00, 'speaker.jpg', 'Electronics', 'Portable 16W stereo Bluetooth speaker with dual bass radiators, punchy sound, IPX7 water resistance, and 12-hour continuous playtime.', 4.8, 30),
(6, 'Sony Bravia 43-inch 4K Ultra HD Smart Google TV', 39990.00, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80', 'Electronics', '4K HDR Processor X1, Dolby Vision & Atmos, Motionflow XR 200, 20W Open Baffle Speaker, and hands-free voice search.', 4.9, 15),
(7, 'Apple iPad 10th Gen 10.9-inch Liquid Retina', 34900.00, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80', 'Electronics', 'A14 Bionic chip, 10.9-inch Liquid Retina display with True Tone, 12MP Ultra-Wide front camera with Center Stage, and Wi-Fi 6.', 4.9, 20),
(8, 'Mi 20000mAh 50W HyperCharge Power Bank', 2999.00, 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80', 'Electronics', 'Triple port output with 50W super fast charging for laptops, tablets, and smartphones, with 16-layer circuit protection.', 4.7, 45),
(9, 'OnePlus Nord Buds 2r True Wireless Earbuds', 1999.00, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80', 'Electronics', '12.4mm Extra Large titanium drivers, 38 hours playback, Dual Mic AI clear call noise cancellation, and IP55 water resistance.', 4.6, 50),

-- 2. FASHION (6 Products)
(10, 'Men\'s Casual Slim-Fit Cotton Shirt', 1299.00, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80', 'Fashion', '100% premium breathable cotton spread collar casual shirt in midnight black. Perfect for office and evening casuals.', 4.7, 45),
(11, 'Men\'s Dark Indigo Stretch Slim Jeans', 1999.00, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80', 'Fashion', 'Comfort-stretch tapered fit denim jeans in midnight dark indigo wash with reinforced bar tacks and branded metal rivets.', 4.6, 35),
(12, 'Men\'s Classic Solid Polo T-Shirt', 799.00, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80', 'Fashion', '240 GSM heavy combed cotton polo t-shirt with ribbed collar, bio-washed fabric, and anti-fading colors.', 4.8, 60),
(13, 'Women\'s Embroidered Chanderi Silk Kurti', 1499.00, 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', 'Fashion', 'Pure Chanderi silk straight flare kurti crafted with intricate gold Zari thread work and three-quarter sleeves.', 4.9, 30),
(14, 'Men\'s Heavyweight Fleece Pullover Hoodie', 1799.00, 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80', 'Fashion', '360 GSM brushed fleece warm hoodie with kangaroo pocket, double-lined hood, and matching ribbed cuffs.', 4.7, 40),
(15, 'Urban Classic High-Top Black Sneakers', 3499.00, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80', 'Fashion', 'Full-grain leather high-top street sneakers with cushioned air-sole unit, crimson accents, and heavy-duty durability.', 4.8, 22),

-- 3. DRESSES (6 Products)
(16, 'Women\'s Floral Summer A-Line Georgette Dress', 1699.00, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80', 'Dresses', 'Lightweight georgette A-line dress with subtle botanical print, V-neckline, puff sleeves, and tiered hemline.', 4.7, 25),
(17, 'Crimson Velvet Evening Party Maxi Dress', 3499.00, 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80', 'Dresses', 'Flattering royal velvet maxi gown featuring a dramatic sweetheart neckline, thigh-high slit, and comfortable stretch inner lining.', 4.9, 18),
(18, 'Women\'s Elegant Fit & Flare Midi Dress', 1899.00, 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80', 'Dresses', 'Premium rayon blend solid black fit-and-flare midi dress with self-tie waist belt and elegant square neckline.', 4.8, 30),
(19, 'Pure Banarasi Art Silk Traditional Saree', 3299.00, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', 'Dresses', 'Traditional Banarasi woven art silk saree in rich crimson red with golden Zari floral border and unstitched blouse piece.', 4.9, 20),
(20, 'Women\'s Gold Zari Embroidered Anarkali Gown', 2799.00, 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', 'Dresses', 'Floor-length festive Anarkali gown with intricate golden resham thread work, matching dupatta, and santoon inner lining.', 4.8, 25),
(21, 'Gothic Tiered Chiffon Cocktail Dress', 2999.00, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80', 'Dresses', 'Dark academia cocktail dress crafted from tiered chiffon with lace trim inserts and corseted waist structure.', 4.9, 15),

-- 4. PHONES (6 Products)
(22, 'Samsung Galaxy S24 Ultra 5G (Titanium Black, 256GB)', 129999.00, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80', 'Phones', 'Flagship 200MP camera smartphone featuring Snapdragon 8 Gen 3, Titanium frame, built-in S-Pen, and 6.8-inch Dynamic AMOLED 2X 120Hz display.', 4.9, 12),
(23, 'OnePlus 12R 5G (Cool Blue, 256GB)', 42999.00, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80', 'Phones', 'Snapdragon 8 Gen 2, 100W SUPERVOOC fast charging, 5500mAh battery, 120Hz ProXDR 1.5K display, and Sony 50MP IMX890 OIS camera.', 4.8, 25),
(24, 'Redmi Note 13 Pro+ 5G (Fusion Black, 256GB)', 29999.00, 'https://images.unsplash.com/photo-1567581935884-3349723552ca?auto=format&fit=crop&w=800&q=80', 'Phones', '3D Curved 1.5K AMOLED 120Hz display, 200MP ultra-clear camera with OIS, MediaTek Dimensity 7200-Ultra, IP68 water resistance, and 120W HyperCharge.', 4.7, 30),
(25, 'Realme 12 Pro+ 5G (Submarine Blue, 256GB)', 27999.00, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80', 'Phones', '64MP Periscope Portrait camera with 3x optical zoom, luxury watch inspired vegan leather design, Snapdragon 7s Gen 2, and 67W SUPERVOOC.', 4.6, 25),
(26, 'Motorola Edge 50 Pro 5G (Black Beauty, 256GB)', 31999.00, 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80', 'Phones', '144Hz 1.5K pOLED curved display with Pantone validated colors, 50MP AI camera system with OIS, 125W TurboPower charging, and IP68 underwater rating.', 4.8, 18),
(27, 'Vivo V30 Pro 5G (Classic Black, 512GB)', 41999.00, 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=800&q=80', 'Phones', 'Co-engineered with ZEISS professional portrait camera system, Studio Aura Light, MediaTek Dimensity 8200 4nm chip, and 80W FlashCharge.', 4.7, 15),

-- 5. LAPTOPS (6 Products)
(28, 'ASUS ROG Strix G16 Gaming Laptop (RTX 4060)', 114990.00, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80', 'Laptops', 'Intel Core i7-13650HX 13th Gen, NVIDIA GeForce RTX 4060 8GB GDDR6, 16GB DDR5 RAM, 1TB PCIe 4.0 SSD, 16-inch 165Hz FHD+ IPS display.', 4.9, 10),
(29, 'HP Pavilion 15 (13th Gen Core i5, 16GB RAM)', 58990.00, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80', 'Laptops', 'Intel Core i5-1335U, 16GB DDR4, 512GB NVMe SSD, 15.6-inch FHD Micro-Edge Display, B&O Audio, Backlit Keyboard, Windows 11 Home.', 4.6, 20),
(30, 'Dell G15 5530 Gaming Laptop (Core i5, RTX 3050)', 74990.00, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80', 'Laptops', '13th Gen Intel Core i5-13450HX, NVIDIA RTX 3050 6GB GDDR6, 16GB DDR5, 512GB SSD, Alienware-inspired thermal cooling architecture.', 4.7, 14),
(31, 'Lenovo Legion Slim 5 (AMD Ryzen 7, RTX 4050)', 89990.00, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80', 'Laptops', 'AMD Ryzen 7 7840HS, NVIDIA RTX 4050 6GB, 16GB DDR5, 1TB SSD, 16-inch WQXGA 165Hz 100% sRGB display with AI Engine+.', 4.8, 12),
(32, 'Acer Nitro V15 Gaming Laptop (RTX 4050 6GB)', 66990.00, 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80', 'Laptops', '13th Gen Intel Core i5-13420H, RTX 4050 6GB, 16GB DDR5, 512GB Gen 4 SSD, 144Hz IPS display with dual-fan cooling system.', 4.7, 16),
(33, 'Apple MacBook Air M2 (8GB RAM, 256GB SSD, Midnight)', 92990.00, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', 'Laptops', 'Apple M2 chip with 8-core CPU and 8-core GPU, 13.6-inch Liquid Retina display, 18-hour battery life, 1080p FaceTime HD camera.', 4.9, 15),

-- 6. ACCESSORIES (8 Products including core items)
(2, 'Smart Watch', 2499.00, 'smartwatch.jpg', 'Accessories', 'Full-touch AMOLED fitness smartwatch with real-time heart rate tracking, SpO2 sensor, Bluetooth calling, and IP68 waterproof rating.', 4.7, 40),
(3, 'Gaming Mouse', 899.00, 'mouse.jpg', 'Accessories', 'Ergonomic 7200 DPI optical gaming mouse with dynamic RGB chroma backlight, 6 programmable macro buttons, and braided cable.', 4.6, 50),
(4, 'Mechanical Keyboard', 1999.00, 'keyboard.jpg', 'Accessories', 'Custom tactile mechanical switches, anti-ghosting 87-key compact layout, customizable RGB illumination, and durable aluminum top plate.', 4.9, 25),
(34, 'Arctic Fox Anti-Theft Waterproof Laptop Backpack 30L', 1899.00, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80', 'Accessories', 'Water-repellent ballistic nylon backpack with hidden zipper pockets, integrated USB charging port, padded 16-inch laptop compartment.', 4.7, 35),
(35, 'SanDisk Extreme 1TB Portable External NVMe SSD', 9999.00, 'https://images.unsplash.com/photo-1628135200361-9c6a5c760148?auto=format&fit=crop&w=800&q=80', 'Accessories', 'Up to 1050MB/s read and 1000MB/s write speeds, rugged IP55 water and dust resistance, 2-meter drop protection, USB-C 3.2 Gen 2.', 4.9, 22),
(36, 'Anker 65W GaN II 3-Port Fast Wall Charger', 2999.00, 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80', 'Accessories', 'Ultra-compact high-speed USB-C charger for MacBook, Dell XPS, iPhone, Galaxy, and laptops with GaN II power efficiency.', 4.8, 35),
(37, 'Spigen Rugged Armor Magnetic Matte Phone Case', 1299.00, 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=800&q=80', 'Accessories', 'Air Cushion Technology shock absorption with carbon fiber detailing, tactile buttons, and MagSafe wireless charging compatibility.', 4.6, 45),
(38, 'Belkin 15W MagSafe 3-in-1 Fast Wireless Charging Pad', 3999.00, 'https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=800&q=80', 'Accessories', 'Simultaneous fast wireless charging for iPhone, Apple Watch, and AirPods with official MagSafe magnetic alignment.', 4.8, 20);
