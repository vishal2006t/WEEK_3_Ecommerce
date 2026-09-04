/**
 * DevilCart - Complete Catalog & E-Commerce Workflow Verification Test
 */

const http = require('http');
const db = require('../backend/config/db');

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('  🧪 DEVILCART - COMPREHENSIVE CATALOG & FLOW TEST  ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`\x1b[32m✔ [PASS]\x1b[0m ${name}`);
      passed++;
    } else {
      console.error(`\x1b[31m✖ [FAIL]\x1b[0m ${name}`);
      failed++;
    }
  }

  // 1. MySQL Direct Verification
  console.log('--- 1. MySQL Database Verification ---');
  const pool = db.getPool();
  const conn = await pool.getConnection();

  const [totalRows] = await conn.query('SELECT COUNT(*) as total FROM products');
  const totalCount = totalRows[0].total;
  assert(totalCount >= 30, `Total products in MySQL is ${totalCount} (Target: >= 30)`);

  const [catRows] = await conn.query(
    'SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY count DESC'
  );
  console.log('MySQL Category Distribution:');
  console.table(catRows);

  const catMap = {};
  catRows.forEach(r => { catMap[r.category.toLowerCase()] = r.count; });

  assert(catMap['fashion'] >= 5, `Fashion category has ${catMap['fashion']} products (Target: >= 5)`);
  assert(catMap['dresses'] >= 5, `Dresses category has ${catMap['dresses']} products (Target: >= 5)`);
  assert(catMap['phones'] >= 5, `Phones category has ${catMap['phones']} products (Target: >= 5)`);
  assert(catMap['laptops'] >= 5, `Laptops category has ${catMap['laptops']} products (Target: >= 5)`);
  assert(catMap['electronics'] >= 5, `Electronics category has ${catMap['electronics']} products (Target: >= 5)`);
  assert(catMap['accessories'] >= 5, `Accessories category has ${catMap['accessories']} products (Target: >= 5)`);

  // Verify existing 5 products
  const [existing5] = await conn.query('SELECT id, name, price, image, category FROM products WHERE id <= 5 ORDER BY id ASC');
  console.log('\nExisting 5 Products in MySQL:');
  console.table(existing5);
  assert(existing5.length === 5, 'Existing 5 products are all preserved');
  assert(existing5.some(p => p.name === 'Wireless Headphones' && p.id === 1), 'Product #1 Wireless Headphones intact');
  assert(existing5.some(p => p.name === 'Smart Watch' && p.id === 2), 'Product #2 Smart Watch intact');
  assert(existing5.some(p => p.name === 'Gaming Mouse' && p.id === 3), 'Product #3 Gaming Mouse intact');
  assert(existing5.some(p => p.name === 'Mechanical Keyboard' && p.id === 4), 'Product #4 Mechanical Keyboard intact');
  assert(existing5.some(p => p.name === 'Bluetooth Speaker' && p.id === 5), 'Product #5 Bluetooth Speaker intact');

  conn.release();

  // 2. API Endpoints Testing
  console.log('\n--- 2. REST API Endpoints Testing ---');
  
  // GET /api/products (ALL)
  const allRes = await makeRequest('/api/products');
  assert(allRes.status === 200 && allRes.body.success, 'GET /api/products returns 200 OK');
  assert(allRes.body.products.length >= 30, `GET /api/products returns ${allRes.body.products.length} products`);

  // Category Filtering via API
  const testCategories = ['Fashion', 'Dresses', 'Phones', 'Laptops', 'Electronics', 'Accessories'];
  for (const cat of testCategories) {
    const catRes = await makeRequest(`/api/products?category=${encodeURIComponent(cat)}`);
    assert(
      catRes.status === 200 && catRes.body.products.length >= 5,
      `API filter for category "${cat}" returned ${catRes.body.products.length} products (Target: >= 5)`
    );
  }

  // Search API
  const searchRes = await makeRequest('/api/products?search=galaxy');
  assert(
    searchRes.status === 200 && searchRes.body.products.length > 0 && searchRes.body.products[0].name.includes('Galaxy'),
    'API search for "galaxy" returned matching product'
  );

  // Single Product API
  const singleRes = await makeRequest('/api/products/1');
  assert(
    singleRes.status === 200 && singleRes.body.product.name === 'Wireless Headphones',
    'GET /api/products/1 returns Wireless Headphones details'
  );

  // 3. Checkout & Order Creation Flow
  console.log('\n--- 3. Checkout & MySQL Order Creation Flow ---');
  const testOrderData = {
    customer: {
      name: 'Priya Sharma',
      email: `priya.catalog.test_${Date.now()}@devilcart.in`,
      phone: '9876543210',
      address: '404 Cyber City, DLF Phase 2',
      city: 'Gurugram',
      pincode: '122002'
    },
    items: [
      { id: 10, name: "Men's Casual Slim-Fit Cotton Shirt", price: 1299, quantity: 2 },
      { id: 22, name: 'Samsung Galaxy S24 Ultra 5G', price: 129999, quantity: 1 }
    ],
    summary: {
      subtotal: 132597,
      shipping: 0,
      discount: 0,
      total: 132597
    },
    paymentMethod: 'UPI / Cards / COD'
  };

  const orderRes = await makeRequest('/api/orders', 'POST', testOrderData);
  assert(
    orderRes.status === 201 && orderRes.body.success,
    `POST /api/orders created order successfully: ${orderRes.body.order_code || orderRes.body.message}`
  );

  const userId = orderRes.body.order ? orderRes.body.order.userId : orderRes.body.user_id;
  const pool2 = db.getPool();
  const conn2 = await pool2.getConnection();
  const [createdOrders] = await conn2.query('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC', [userId]);
  assert(createdOrders.length >= 2, `MySQL orders table contains inserted order items (count: ${createdOrders.length})`);
  conn2.release();

  console.log('\n====================================================');
  console.log(`  🎉 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
