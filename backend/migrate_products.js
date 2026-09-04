/**
 * DevilCart - Safe MySQL Schema Migration & Product Catalog Seeding
 * Safely adds category, description, rating, stock columns to products table if missing.
 * Updates the 5 existing products and inserts 33 new products (IDs 6..38).
 */

const { getPool, initialProducts } = require('./config/db');

async function migrate() {
  console.log('----------------------------------------------------');
  console.log('  🛡️ DEVILCART - SAFE MYSQL MIGRATION & SEEDING     ');
  console.log('----------------------------------------------------');

  const pool = getPool();
  if (!pool) {
    console.error('MySQL connection pool not available.');
    process.exit(1);
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // 1. Check existing columns in products table
    const [existingCols] = await conn.query('DESCRIBE products');
    const colNames = existingCols.map(c => c.Field.toLowerCase());
    console.log('Existing columns in products table:', colNames.join(', '));

    // 2. Safely add missing columns to products
    if (!colNames.includes('category')) {
      console.log('Adding column: category...');
      await conn.query("ALTER TABLE products ADD COLUMN category VARCHAR(100) NOT NULL DEFAULT 'General'");
    }
    if (!colNames.includes('description')) {
      console.log('Adding column: description...');
      await conn.query('ALTER TABLE products ADD COLUMN description TEXT');
    }
    if (!colNames.includes('rating')) {
      console.log('Adding column: rating...');
      await conn.query('ALTER TABLE products ADD COLUMN rating DECIMAL(3,1) DEFAULT 4.8');
    }
    if (!colNames.includes('stock')) {
      console.log('Adding column: stock...');
      await conn.query('ALTER TABLE products ADD COLUMN stock INT DEFAULT 20');
    }
    if (!colNames.includes('created_at')) {
      console.log('Adding column: created_at...');
      await conn.query('ALTER TABLE products ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    }

    // 2b. Safely add missing columns to users
    const [userCols] = await conn.query('DESCRIBE users');
    const uColNames = userCols.map(c => c.Field.toLowerCase());
    if (!uColNames.includes('phone')) await conn.query('ALTER TABLE users ADD COLUMN phone VARCHAR(50) NULL');
    if (!uColNames.includes('address')) await conn.query('ALTER TABLE users ADD COLUMN address TEXT NULL');
    if (!uColNames.includes('city')) await conn.query('ALTER TABLE users ADD COLUMN city VARCHAR(100) NULL');
    if (!uColNames.includes('pincode')) await conn.query('ALTER TABLE users ADD COLUMN pincode VARCHAR(20) NULL');
    if (!uColNames.includes('created_at')) await conn.query('ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

    // 2c. Safely add missing columns to orders
    const [orderCols] = await conn.query('DESCRIBE orders');
    const oColNames = orderCols.map(c => c.Field.toLowerCase());
    if (!oColNames.includes('order_code')) await conn.query('ALTER TABLE orders ADD COLUMN order_code VARCHAR(50) NULL');
    if (!oColNames.includes('total_amount')) await conn.query('ALTER TABLE orders ADD COLUMN total_amount DECIMAL(10,2) NULL DEFAULT 0.00');
    if (!oColNames.includes('shipping_amount')) await conn.query('ALTER TABLE orders ADD COLUMN shipping_amount DECIMAL(10,2) NULL DEFAULT 0.00');
    if (!oColNames.includes('discount_amount')) await conn.query('ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10,2) NULL DEFAULT 0.00');
    if (!oColNames.includes('payment_method')) await conn.query("ALTER TABLE orders ADD COLUMN payment_method VARCHAR(100) NULL DEFAULT 'UPI / Cards / COD'");
    if (!oColNames.includes('status')) await conn.query("ALTER TABLE orders ADD COLUMN status VARCHAR(50) NULL DEFAULT 'Confirmed'");
    if (!oColNames.includes('created_at')) await conn.query('ALTER TABLE orders ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

    // 3. Update existing 5 products with category and details
    for (const p of initialProducts) {
      if (p.id <= 5) {
        await conn.query(
          'UPDATE products SET category = ?, description = ?, rating = ?, stock = ? WHERE id = ?',
          [p.category, p.description, p.rating, p.stock, p.id]
        );
      }
    }
    console.log('✔ Updated existing 5 products (IDs 1-5) with categories & metadata.');

    // 4. Safely insert all other products (IDs 6-38) using INSERT IGNORE
    for (const p of initialProducts) {
      await conn.query(
        'INSERT IGNORE INTO products (id, name, price, image, category, description, rating, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [p.id, p.name, p.price, p.image, p.category, p.description, p.rating, p.stock]
      );
    }
    console.log(`✔ Catalog seeding complete (Total target: ${initialProducts.length} products).`);

    // 5. Verify Total Count
    const [totalRows] = await conn.query('SELECT COUNT(*) AS total FROM products');
    const totalCount = totalRows[0].total;
    console.log('\n====================================================');
    console.log(`  📊 TOTAL PRODUCTS IN MYSQL: ${totalCount}`);
    console.log('====================================================');

    // 6. Verify Category Counts
    const [catRows] = await conn.query(
      'SELECT category, COUNT(*) AS count FROM products GROUP BY category ORDER BY count DESC'
    );
    console.log('\nCategory Breakdown in MySQL:');
    console.table(catRows);

    conn.release();
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    if (conn) conn.release();
    process.exit(1);
  }
}

migrate();
