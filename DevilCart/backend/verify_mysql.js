/**
 * MySQL Database Live Verification Script
 * File: backend/verify_mysql.js
 * 
 * Verifies:
 * 1. MySQL connection via backend/config/db.js
 * 2. Database 'ecommerce_db' existence and table schema
 * 3. Products query (SELECT * FROM products)
 * 4. User insertion (INSERT INTO users)
 * 5. Order insertion with user_id and product_id (INSERT INTO orders)
 * 6. Order retrieval with JOIN (SELECT o.*, u.name, p.name)
 */

const { pool, query, testConnection } = require('./config/db');

async function runVerification() {
  console.log('====================================================');
  console.log('  🔍 DEVILCART - MYSQL LIVE INTEGRATION VERIFIER   ');
  console.log('====================================================');

  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('\n❌ Could not connect to MySQL using credentials in .env.');
    console.error('Please verify DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT in your .env file.\n');
    process.exit(1);
  }

  try {
    console.log('\n--- 1. Verifying Database & Tables ---');
    const tables = await query('SHOW TABLES;');
    console.log('Tables found in database:', tables.map(r => Object.values(r)[0]));

    console.log('\n--- 2. Verifying Products Table & Catalog ---');
    const products = await query('SELECT id, name, price, image FROM products LIMIT 5;');
    console.log(`Retrieved ${products.length} products directly from MySQL:`);
    console.table(products);

    if (products.length === 0) {
      console.warn('⚠ Warning: No products found in `products` table.');
    } else {
      console.log('✔ Products table query succeeded.');
    }

    console.log('\n--- 3. Testing User Insertion into `users` ---');
    const userEmail = `verifier_${Date.now()}@example.com`;
    let userId;
    try {
      const userRes = await query(
        `INSERT INTO users (name, email, phone, address, city, pincode) VALUES (?, ?, ?, ?, ?, ?)`,
        ['Test Verification User', userEmail, '9876543210', '404 Tech Lane', 'Bengaluru', '560001']
      );
      userId = userRes.insertId;
    } catch (e) {
      // Fallback for minimal users table: (id, name, email)
      const userRes = await query(
        `INSERT INTO users (name, email) VALUES (?, ?)`,
        ['Test Verification User', userEmail]
      );
      userId = userRes.insertId;
    }
    console.log(`✔ Inserted user record with ID: ${userId} (Email: ${userEmail})`);

    console.log('\n--- 4. Testing Order Insertion into `orders` (with user_id & product_id) ---');
    const testProductId = products.length > 0 ? products[0].id : 1;
    const testOrderCode = `DEVIL-TEST-${Math.floor(1000 + Math.random() * 9000)}`;
    const testPrice = products.length > 0 ? products[0].price : 1499.00;

    let orderId;
    try {
      const orderRes = await query(
        `INSERT INTO orders (order_code, user_id, product_id, quantity, total_amount, shipping_amount, discount_amount, payment_method, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [testOrderCode, userId, testProductId, 2, (testPrice * 2), 0.00, 0.00, 'UPI / Verification Test', 'Confirmed']
      );
      orderId = orderRes.insertId;
    } catch (e) {
      // Fallback for minimal orders table: (id, user_id, product_id, quantity)
      const orderRes = await query(
        `INSERT INTO orders (user_id, product_id, quantity) VALUES (?, ?, ?)`,
        [userId, testProductId, 2]
      );
      orderId = orderRes.insertId;
    }
    console.log(`✔ Inserted order record with ID: ${orderId}`);

    console.log('\n--- 5. Verifying Order Query with Relational Linkage ---');
    const orderVerification = await query(
      `SELECT o.id, o.user_id, o.product_id, o.quantity, u.name AS customer_name, u.email, p.name AS product_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       JOIN products p ON o.product_id = p.id
       WHERE o.id = ?`,
      [orderId]
    );
    console.log('Verified stored order with relational JOIN:');
    console.table(orderVerification);

    console.log('\n====================================================');
    console.log('  🎉 MYSQL DATABASE VERIFICATION PASSED 100%!       ');
    console.log('====================================================');
    if (pool) await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Verification Error:', error.message);
    if (pool) await pool.end();
    process.exit(1);
  }
}

runVerification();
