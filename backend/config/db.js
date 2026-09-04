/**
 * DevilCart - Centralized MySQL Database Connection & Query Pool (38 Indian Products)
 * File: backend/config/db.js
 * Package: mysql2/promise
 * 
 * Provides:
 * - pool: MySQL Connection Pool
 * - query(sql, params): Parameterized query executor with memory fallback when offline
 * - testConnection(): Diagnostic connection test
 * - initDatabase(): Safe schema initialization (CREATE TABLE IF NOT EXISTS, NO destructive DROPs/DELETEs)
 * - getPool(): Returns active pool instance
 * - getIsConnected(): Returns current MySQL connection status
 * - initialProducts: 38 products across Fashion, Dresses, Phones, Laptops, Electronics, Accessories
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend/.env or root .env
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '.env') });

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT, 10) || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '';
const DB_NAME = process.env.DB_NAME || 'ecommerce_db';
const DB_SSL = process.env.DB_SSL === 'true' || process.env.DB_SSL === '1' ||
  Boolean(DB_HOST && (DB_HOST.includes('aivencloud') || DB_HOST.includes('clever-cloud') || DB_HOST.includes('planetscale') || DB_HOST.includes('tidbcloud')));


// 38 Realistic Indian E-Commerce Products across 6 Categories (5+ per category)
const initialProducts = [
  // --- 1. ELECTRONICS (6 Products) ---
  {
    id: 1,
    name: 'Wireless Headphones',
    price: 1499.00,
    image: 'headphones.jpg',
    category: 'Electronics',
    description: 'High-definition wireless audio over-ear headphones with deep bass, ergonomic cushioned earcups, and 30-hour battery life.',
    rating: 4.8,
    stock: 35
  },
  {
    id: 5,
    name: 'Bluetooth Speaker',
    price: 1299.00,
    image: 'speaker.jpg',
    category: 'Electronics',
    description: 'Portable 16W stereo Bluetooth speaker with dual bass radiators, punchy sound, IPX7 water resistance, and 12-hour continuous playtime.',
    rating: 4.8,
    stock: 30
  },
  {
    id: 6,
    name: 'Sony Bravia 43-inch 4K Ultra HD Smart Google TV',
    price: 39990.00,
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80',
    category: 'Electronics',
    description: '4K HDR Processor X1, Dolby Vision & Atmos, Motionflow XR 200, 20W Open Baffle Speaker, and hands-free voice search.',
    rating: 4.9,
    stock: 15
  },
  {
    id: 7,
    name: 'Apple iPad 10th Gen 10.9-inch Liquid Retina',
    price: 34900.00,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
    category: 'Electronics',
    description: 'A14 Bionic chip, 10.9-inch Liquid Retina display with True Tone, 12MP Ultra-Wide front camera with Center Stage, and Wi-Fi 6.',
    rating: 4.9,
    stock: 20
  },
  {
    id: 8,
    name: 'Mi 20000mAh 50W HyperCharge Power Bank',
    price: 2999.00,
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80',
    category: 'Electronics',
    description: 'Triple port output with 50W super fast charging for laptops, tablets, and smartphones, with 16-layer circuit protection.',
    rating: 4.7,
    stock: 45
  },
  {
    id: 9,
    name: 'OnePlus Nord Buds 2r True Wireless Earbuds',
    price: 1999.00,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
    category: 'Electronics',
    description: '12.4mm Extra Large titanium drivers, 38 hours playback, Dual Mic AI clear call noise cancellation, and IP55 water resistance.',
    rating: 4.6,
    stock: 50
  },

  // --- 2. FASHION (6 Products) ---
  {
    id: 10,
    name: "Men's Casual Slim-Fit Cotton Shirt",
    price: 1299.00,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    category: 'Fashion',
    description: '100% premium breathable cotton spread collar casual shirt in midnight black. Perfect for office and evening casuals.',
    rating: 4.7,
    stock: 45
  },
  {
    id: 11,
    name: "Men's Dark Indigo Stretch Slim Jeans",
    price: 1999.00,
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
    category: 'Fashion',
    description: 'Comfort-stretch tapered fit denim jeans in midnight dark indigo wash with reinforced bar tacks and branded metal rivets.',
    rating: 4.6,
    stock: 35
  },
  {
    id: 12,
    name: "Men's Classic Solid Polo T-Shirt",
    price: 799.00,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    category: 'Fashion',
    description: '240 GSM heavy combed cotton polo t-shirt with ribbed collar, bio-washed fabric, and anti-fading colors.',
    rating: 4.8,
    stock: 60
  },
  {
    id: 13,
    name: "Women's Embroidered Chanderi Silk Kurti",
    price: 1499.00,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    category: 'Fashion',
    description: 'Pure Chanderi silk straight flare kurti crafted with intricate gold Zari thread work and three-quarter sleeves.',
    rating: 4.9,
    stock: 30
  },
  {
    id: 14,
    name: "Men's Heavyweight Fleece Pullover Hoodie",
    price: 1799.00,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    category: 'Fashion',
    description: '360 GSM brushed fleece warm hoodie with kangaroo pocket, double-lined hood, and matching ribbed cuffs.',
    rating: 4.7,
    stock: 40
  },
  {
    id: 15,
    name: 'Urban Classic High-Top Black Sneakers',
    price: 3499.00,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
    category: 'Fashion',
    description: 'Full-grain leather high-top street sneakers with cushioned air-sole unit, crimson accents, and heavy-duty durability.',
    rating: 4.8,
    stock: 22
  },

  // --- 3. DRESSES (6 Products) ---
  {
    id: 16,
    name: "Women's Floral Summer A-Line Georgette Dress",
    price: 1699.00,
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    category: 'Dresses',
    description: 'Lightweight georgette A-line dress with subtle botanical print, V-neckline, puff sleeves, and tiered hemline.',
    rating: 4.7,
    stock: 25
  },
  {
    id: 17,
    name: 'Crimson Velvet Evening Party Maxi Dress',
    price: 3499.00,
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
    category: 'Dresses',
    description: 'Flattering royal velvet maxi gown featuring a dramatic sweetheart neckline, thigh-high slit, and comfortable stretch inner lining.',
    rating: 4.9,
    stock: 18
  },
  {
    id: 18,
    name: "Women's Elegant Fit & Flare Midi Dress",
    price: 1899.00,
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
    category: 'Dresses',
    description: 'Premium rayon blend solid black fit-and-flare midi dress with self-tie waist belt and elegant square neckline.',
    rating: 4.8,
    stock: 30
  },
  {
    id: 19,
    name: 'Pure Banarasi Art Silk Traditional Saree',
    price: 3299.00,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    category: 'Dresses',
    description: 'Traditional Banarasi woven art silk saree in rich crimson red with golden Zari floral border and unstitched blouse piece.',
    rating: 4.9,
    stock: 20
  },
  {
    id: 20,
    name: "Women's Gold Zari Embroidered Anarkali Gown",
    price: 2799.00,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    category: 'Dresses',
    description: 'Floor-length festive Anarkali gown with intricate golden resham thread work, matching dupatta, and santoon inner lining.',
    rating: 4.8,
    stock: 25
  },
  {
    id: 21,
    name: 'Gothic Tiered Chiffon Cocktail Dress',
    price: 2999.00,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
    category: 'Dresses',
    description: 'Dark academia cocktail dress crafted from tiered chiffon with lace trim inserts and corseted waist structure.',
    rating: 4.9,
    stock: 15
  },

  // --- 4. PHONES (6 Products) ---
  {
    id: 22,
    name: 'Samsung Galaxy S24 Ultra 5G (Titanium Black, 256GB)',
    price: 129999.00,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
    category: 'Phones',
    description: 'Flagship 200MP camera smartphone featuring Snapdragon 8 Gen 3, Titanium frame, built-in S-Pen, and 6.8-inch Dynamic AMOLED 2X 120Hz display.',
    rating: 4.9,
    stock: 12
  },
  {
    id: 23,
    name: 'OnePlus 12R 5G (Cool Blue, 256GB)',
    price: 42999.00,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
    category: 'Phones',
    description: 'Snapdragon 8 Gen 2, 100W SUPERVOOC fast charging, 5500mAh battery, 120Hz ProXDR 1.5K display, and Sony 50MP IMX890 OIS camera.',
    rating: 4.8,
    stock: 25
  },
  {
    id: 24,
    name: 'Redmi Note 13 Pro+ 5G (Fusion Black, 256GB)',
    price: 29999.00,
    image: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?auto=format&fit=crop&w=800&q=80',
    category: 'Phones',
    description: '3D Curved 1.5K AMOLED 120Hz display, 200MP ultra-clear camera with OIS, MediaTek Dimensity 7200-Ultra, IP68 water resistance, and 120W HyperCharge.',
    rating: 4.7,
    stock: 30
  },
  {
    id: 25,
    name: 'Realme 12 Pro+ 5G (Submarine Blue, 256GB)',
    price: 27999.00,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    category: 'Phones',
    description: '64MP Periscope Portrait camera with 3x optical zoom, luxury watch inspired vegan leather design, Snapdragon 7s Gen 2, and 67W SUPERVOOC.',
    rating: 4.6,
    stock: 25
  },
  {
    id: 26,
    name: 'Motorola Edge 50 Pro 5G (Black Beauty, 256GB)',
    price: 31999.00,
    image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80',
    category: 'Phones',
    description: '144Hz 1.5K pOLED curved display with Pantone validated colors, 50MP AI camera system with OIS, 125W TurboPower charging, and IP68 underwater rating.',
    rating: 4.8,
    stock: 18
  },
  {
    id: 27,
    name: 'Vivo V30 Pro 5G (Classic Black, 512GB)',
    price: 41999.00,
    image: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=800&q=80',
    category: 'Phones',
    description: 'Co-engineered with ZEISS professional portrait camera system, Studio Aura Light, MediaTek Dimensity 8200 4nm chip, and 80W FlashCharge.',
    rating: 4.7,
    stock: 15
  },

  // --- 5. LAPTOPS (6 Products) ---
  {
    id: 28,
    name: 'ASUS ROG Strix G16 Gaming Laptop (RTX 4060)',
    price: 114990.00,
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
    category: 'Laptops',
    description: 'Intel Core i7-13650HX 13th Gen, NVIDIA GeForce RTX 4060 8GB GDDR6, 16GB DDR5 RAM, 1TB PCIe 4.0 SSD, 16-inch 165Hz FHD+ IPS display.',
    rating: 4.9,
    stock: 10
  },
  {
    id: 29,
    name: 'HP Pavilion 15 (13th Gen Core i5, 16GB RAM)',
    price: 58990.00,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
    category: 'Laptops',
    description: 'Intel Core i5-1335U, 16GB DDR4, 512GB NVMe SSD, 15.6-inch FHD Micro-Edge Display, B&O Audio, Backlit Keyboard, Windows 11 Home.',
    rating: 4.6,
    stock: 20
  },
  {
    id: 30,
    name: 'Dell G15 5530 Gaming Laptop (Core i5, RTX 3050)',
    price: 74990.00,
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
    category: 'Laptops',
    description: '13th Gen Intel Core i5-13450HX, NVIDIA RTX 3050 6GB GDDR6, 16GB DDR5, 512GB SSD, Alienware-inspired thermal cooling architecture.',
    rating: 4.7,
    stock: 14
  },
  {
    id: 31,
    name: 'Lenovo Legion Slim 5 (AMD Ryzen 7, RTX 4050)',
    price: 89990.00,
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80',
    category: 'Laptops',
    description: 'AMD Ryzen 7 7840HS, NVIDIA RTX 4050 6GB, 16GB DDR5, 1TB SSD, 16-inch WQXGA 165Hz 100% sRGB display with AI Engine+.',
    rating: 4.8,
    stock: 12
  },
  {
    id: 32,
    name: 'Acer Nitro V15 Gaming Laptop (RTX 4050 6GB)',
    price: 66990.00,
    image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80',
    category: 'Laptops',
    description: '13th Gen Intel Core i5-13420H, RTX 4050 6GB, 16GB DDR5, 512GB Gen 4 SSD, 144Hz IPS display with dual-fan cooling system.',
    rating: 4.7,
    stock: 16
  },
  {
    id: 33,
    name: 'Apple MacBook Air M2 (8GB RAM, 256GB SSD, Midnight)',
    price: 92990.00,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    category: 'Laptops',
    description: 'Apple M2 chip with 8-core CPU and 8-core GPU, 13.6-inch Liquid Retina display, 18-hour battery life, 1080p FaceTime HD camera.',
    rating: 4.9,
    stock: 15
  },

  // --- 6. ACCESSORIES (8 Products) ---
  {
    id: 2,
    name: 'Smart Watch',
    price: 2499.00,
    image: 'smartwatch.jpg',
    category: 'Accessories',
    description: 'Full-touch AMOLED fitness smartwatch with real-time heart rate tracking, SpO2 sensor, Bluetooth calling, and IP68 waterproof rating.',
    rating: 4.7,
    stock: 40
  },
  {
    id: 3,
    name: 'Gaming Mouse',
    price: 899.00,
    image: 'mouse.jpg',
    category: 'Accessories',
    description: 'Ergonomic 7200 DPI optical gaming mouse with dynamic RGB chroma backlight, 6 programmable macro buttons, and braided cable.',
    rating: 4.6,
    stock: 50
  },
  {
    id: 4,
    name: 'Mechanical Keyboard',
    price: 1999.00,
    image: 'keyboard.jpg',
    category: 'Accessories',
    description: 'Custom tactile mechanical switches, anti-ghosting 87-key compact layout, customizable RGB illumination, and durable aluminum top plate.',
    rating: 4.9,
    stock: 25
  },
  {
    id: 34,
    name: 'Arctic Fox Anti-Theft Waterproof Laptop Backpack 30L',
    price: 1899.00,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    category: 'Accessories',
    description: 'Water-repellent ballistic nylon backpack with hidden zipper pockets, integrated USB charging port, padded 16-inch laptop compartment.',
    rating: 4.7,
    stock: 35
  },
  {
    id: 35,
    name: 'SanDisk Extreme 1TB Portable External NVMe SSD',
    price: 9999.00,
    image: 'https://images.unsplash.com/photo-1628135200361-9c6a5c760148?auto=format&fit=crop&w=800&q=80',
    category: 'Accessories',
    description: 'Up to 1050MB/s read and 1000MB/s write speeds, rugged IP55 water and dust resistance, 2-meter drop protection, USB-C 3.2 Gen 2.',
    rating: 4.9,
    stock: 22
  },
  {
    id: 36,
    name: 'Anker 65W GaN II 3-Port Fast Wall Charger',
    price: 2999.00,
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80',
    category: 'Accessories',
    description: 'Ultra-compact high-speed USB-C charger for MacBook, Dell XPS, iPhone, Galaxy, and laptops with GaN II power efficiency.',
    rating: 4.8,
    stock: 35
  },
  {
    id: 37,
    name: 'Spigen Rugged Armor Magnetic Matte Phone Case',
    price: 1299.00,
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=800&q=80',
    category: 'Accessories',
    description: 'Air Cushion Technology shock absorption with carbon fiber detailing, tactile buttons, and MagSafe wireless charging compatibility.',
    rating: 4.6,
    stock: 45
  },
  {
    id: 38,
    name: 'Belkin 15W MagSafe 3-in-1 Fast Wireless Charging Pad',
    price: 3999.00,
    image: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=800&q=80',
    category: 'Accessories',
    description: 'Simultaneous fast wireless charging for iPhone, Apple Watch, and AirPods with official MagSafe magnetic alignment.',
    rating: 4.8,
    stock: 20
  }
];

// In-Memory Dev Fallback Store (Used only if MySQL connection is unreachable during initial local setup)
const memoryStore = {
  products: [...initialProducts],
  users: [],
  orders: [],
  order_items: []
};

let pool = null;
let isConnected = false;

// Create MySQL Connection Pool with dynamic configuration
try {
  const poolOptions = {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  };

  if (DB_SSL) {
    poolOptions.ssl = { rejectUnauthorized: false };
  }

  pool = mysql.createPool(poolOptions);
} catch (err) {
  console.warn(`⚠ Could not instantiate MySQL pool: ${err.message}`);
}

/**
 * Test MySQL connection and return boolean
 */
async function testConnection() {
  if (!pool) return false;
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    isConnected = true;
    console.log(`\x1b[32m✔ [MySQL] Successfully connected to database "${DB_NAME}" on ${DB_HOST}:${DB_PORT} as user "${DB_USER}"\x1b[0m`);
    connection.release();
    return true;
  } catch (error) {
    isConnected = false;
    console.error(`\x1b[31m✖ [MySQL Connection Error] Could not connect to MySQL: ${error.message}\x1b[0m`);
    console.warn(`\x1b[33mℹ Please check DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME in .env\x1b[0m`);
    return false;
  }
}

/**
 * Execute a SQL query with parameters against MySQL pool, with memory fallback if offline
 * @param {string} sql 
 * @param {Array} params 
 * @returns {Promise<Array>}
 */
async function query(sql, params = []) {
  if (pool && isConnected) {
    try {
      const [results] = await pool.query(sql, params);
      return results;
    } catch (error) {
      console.error(`[MySQL Query Error] "${sql}":`, error.message);
      throw error;
    }
  }

  // Attempt live connection if not marked connected
  if (pool) {
    try {
      const [results] = await pool.query(sql, params);
      isConnected = true;
      return results;
    } catch (dbError) {
      if (dbError.code !== 'ECONNREFUSED' && dbError.code !== 'ER_ACCESS_DENIED_ERROR' && dbError.code !== 'ENOTFOUND') {
        throw dbError;
      }
      isConnected = false;
    }
  }

  // Fallback to memory store simulation when database is offline
  return executeMemoryQuery(sql, params);
}

/**
 * Execute simulated query in memory for offline development
 */
function executeMemoryQuery(sql, params) {
  const normalizedSql = sql.trim().toUpperCase();

  if (normalizedSql.startsWith('SELECT * FROM PRODUCTS WHERE ID =') || normalizedSql.startsWith('SELECT * FROM PRODUCTS WHERE ID=')) {
    const id = parseInt(params[0], 10);
    const item = memoryStore.products.find(p => p.id === id);
    return item ? [item] : [];
  }

  if (normalizedSql.startsWith('SELECT DISTINCT CATEGORY FROM PRODUCTS')) {
    const cats = [...new Set(memoryStore.products.map(p => p.category || 'General'))];
    return cats.map(c => ({ category: c }));
  }

  if (normalizedSql.startsWith('SELECT * FROM PRODUCTS') || normalizedSql.startsWith('SELECT ID, NAME, PRICE')) {
    return [...memoryStore.products];
  }

  if (normalizedSql.startsWith('INSERT INTO USERS')) {
    const newId = memoryStore.users.length + 1;
    const user = {
      id: newId,
      name: params[0],
      email: params[1],
      phone: params[2] || '',
      address: params[3] || '',
      city: params[4] || '',
      pincode: params[5] || '',
      created_at: new Date().toISOString()
    };
    memoryStore.users.push(user);
    return { insertId: newId };
  }

  if (normalizedSql.startsWith('INSERT INTO ORDERS')) {
    const newId = memoryStore.orders.length + 1;
    const isFullSchema = params.length > 5;
    const order = {
      id: newId,
      order_code: isFullSchema ? params[0] : `DEVIL-${1000 + newId}`,
      user_id: isFullSchema ? params[1] : params[0],
      product_id: isFullSchema ? params[2] : params[1],
      quantity: isFullSchema ? params[3] : params[2],
      total_amount: isFullSchema ? params[4] : 1499.00,
      payment_method: isFullSchema ? params[7] : 'UPI / COD',
      status: 'Confirmed',
      created_at: new Date().toISOString()
    };
    memoryStore.orders.push(order);
    return { insertId: newId };
  }

  if (normalizedSql.startsWith('SELECT * FROM ORDERS WHERE ORDER_CODE =') || normalizedSql.startsWith('SELECT * FROM ORDERS WHERE ID =')) {
    const key = params[0];
    const order = memoryStore.orders.find(o => o.id === parseInt(key, 10) || o.order_code === key);
    return order ? [order] : [];
  }

  if (normalizedSql.startsWith('SELECT * FROM USERS WHERE ID =')) {
    const id = parseInt(params[0], 10);
    const user = memoryStore.users.find(u => u.id === id);
    return user ? [user] : [];
  }

  return [];
}

/**
 * Safe Database Schema Migration / Initialization
 * Creates database and tables IF NOT EXISTS.
 * Safely alters tables if columns are missing.
 * Safely inserts missing products via INSERT IGNORE without touching existing data.
 */
async function initDatabase() {
  try {
    try {
      const connConfig = {
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD
      };
      if (DB_SSL) {
        connConfig.ssl = { rejectUnauthorized: false };
      }
      const rootConnection = await mysql.createConnection(connConfig);
      await rootConnection.query(
        `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
      );
      await rootConnection.end();
    } catch (dbCreateErr) {
      // Non-fatal on managed cloud databases where database is pre-created (e.g. Railway, PlanetScale)
    }

    // Test connection pool
    const connected = await testConnection();
    if (!connected) return false;

    // Safe Table Creations (IF NOT EXISTS)
    await query(`
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
    `);

    // Ensure columns exist on products if created with older schema
    try {
      const cols = await query('DESCRIBE products');
      const colNames = cols.map(c => c.Field.toLowerCase());
      if (!colNames.includes('category')) {
        await query("ALTER TABLE products ADD COLUMN category VARCHAR(100) NOT NULL DEFAULT 'General'");
      }
      if (!colNames.includes('description')) {
        await query('ALTER TABLE products ADD COLUMN description TEXT');
      }
      if (!colNames.includes('rating')) {
        await query('ALTER TABLE products ADD COLUMN rating DECIMAL(3,1) DEFAULT 4.8');
      }
      if (!colNames.includes('stock')) {
        await query('ALTER TABLE products ADD COLUMN stock INT DEFAULT 20');
      }
      if (!colNames.includes('created_at')) {
        await query('ALTER TABLE products ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
      }
    } catch (colErr) {
      // ignore
    }

    await query(`
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
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_code VARCHAR(50) NULL,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        total_amount DECIMAL(10, 2) NULL DEFAULT 0.00,
        shipping_amount DECIMAL(10, 2) NULL DEFAULT 0.00,
        discount_amount DECIMAL(10, 2) NULL DEFAULT 0.00,
        payment_method VARCHAR(100) NULL DEFAULT 'UPI / Cards / COD',
        status VARCHAR(50) NULL DEFAULT 'Confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Update existing 5 products' categories & metadata
    for (const p of initialProducts) {
      if (p.id <= 5) {
        await query(
          'UPDATE products SET category = ?, description = ?, rating = ?, stock = ? WHERE id = ?',
          [p.category, p.description, p.rating, p.stock, p.id]
        );
      }
    }

    // Safe incremental product insertion (INSERT IGNORE) - NEVER deletes existing products!
    for (const p of initialProducts) {
      await query(
        `INSERT IGNORE INTO products (id, name, price, image, category, description, rating, stock)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.id, p.name, p.price, p.image, p.category, p.description, p.rating, p.stock]
      );
    }
    console.log(`✔ Verified and ensured all 38 products across 6 categories exist in MySQL database.`);

    return true;
  } catch (error) {
    console.warn(`[Safe Init Note] Schema check encountered: ${error.message}`);
    return false;
  }
}

module.exports = {
  pool,
  query,
  testConnection,
  initDatabase,
  getPool: () => pool,
  getIsConnected: () => isConnected,
  initialProducts
};
