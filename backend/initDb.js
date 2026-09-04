/**
 * DevilCart - Safe Database Initialization & Migration Script (38 Products)
 * File: backend/initDb.js
 * 
 * Safety Guarantee:
 * - NEVER DROPS TABLES
 * - NEVER RUNS 'DELETE FROM products'
 * - Uses CREATE TABLE IF NOT EXISTS
 * - Uses INSERT IGNORE to ensure all 38 products across 6 categories exist
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
const { initialProducts } = require('./config/db');

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT, 10) || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '';
const DB_NAME = process.env.DB_NAME || 'ecommerce_db';
const DB_SSL = process.env.DB_SSL === 'true' || process.env.DB_SSL === '1' ||
  Boolean(DB_HOST && (DB_HOST.includes('aivencloud') || DB_HOST.includes('clever-cloud') || DB_HOST.includes('planetscale') || DB_HOST.includes('tidbcloud')));

async function initDb() {
  console.log('====================================================');
  console.log('  🛡️ DEVILCART - SAFE DATABASE INITIALIZATION       ');
  console.log('====================================================');

  let connection;
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
    connection = await mysql.createConnection(connConfig);

    console.log(`✔ Connected to MySQL on ${DB_HOST}:${DB_PORT}`);

    // Safe database creation
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`✔ Database "${DB_NAME}" confirmed.`);

    await connection.changeUser({ database: DB_NAME });

    // Safe table creations (CREATE TABLE IF NOT EXISTS)
    const createProductsTable = `
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    const createUsersTable = `
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
    `;

    const createOrdersTable = `
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    await connection.query(createProductsTable);
    await connection.query(createUsersTable);
    await connection.query(createOrdersTable);
    console.log('✔ Tables (products, users, orders) verified.');

    // Ensure columns exist if created under older schema
    const [existingCols] = await connection.query('DESCRIBE products');
    const colNames = existingCols.map(c => c.Field.toLowerCase());
    if (!colNames.includes('category')) {
      await connection.query("ALTER TABLE products ADD COLUMN category VARCHAR(100) NOT NULL DEFAULT 'General'");
    }
    if (!colNames.includes('description')) {
      await connection.query('ALTER TABLE products ADD COLUMN description TEXT');
    }
    if (!colNames.includes('rating')) {
      await connection.query('ALTER TABLE products ADD COLUMN rating DECIMAL(3,1) DEFAULT 4.8');
    }
    if (!colNames.includes('stock')) {
      await connection.query('ALTER TABLE products ADD COLUMN stock INT DEFAULT 20');
    }
    if (!colNames.includes('created_at')) {
      await connection.query('ALTER TABLE products ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    }

    // Update existing 5 products
    for (const p of initialProducts) {
      if (p.id <= 5) {
        await connection.query(
          'UPDATE products SET category = ?, description = ?, rating = ?, stock = ? WHERE id = ?',
          [p.category, p.description, p.rating, p.stock, p.id]
        );
      }
    }

    // Safe incremental insertion using INSERT IGNORE - Preserves existing records!
    for (const p of initialProducts) {
      await connection.query(
        `INSERT IGNORE INTO products (id, name, price, image, category, description, rating, stock)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.id, p.name, p.price, p.image, p.category, p.description, p.rating, p.stock]
      );
    }

    const [rows] = await connection.query('SELECT COUNT(*) AS total FROM products');
    const totalCount = rows[0] ? (rows[0].total || rows[0]['COUNT(*)']) : 0;
    console.log(`✔ MySQL products table contains ${totalCount} products across all categories.`);

    const [categoryRows] = await connection.query('SELECT category, COUNT(*) AS count FROM products GROUP BY category');
    console.log('Category breakdown in MySQL:');
    console.table(categoryRows);

    console.log('====================================================');
    console.log('  🎉 SAFE INITIALIZATION COMPLETE - ALL CATEGORIES ACTIVE ');
    console.log('====================================================');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Initialization note: ${error.message}`);
    if (connection) await connection.end();
    process.exit(1);
  }
}

initDb();
