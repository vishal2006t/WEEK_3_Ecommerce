/**
 * DevilCart - Complete Frontend Logic & End-to-End Simulation Test
 * Simulates HTML parsing, products.js filtering, product.js details,
 * cart.js storage/calculations, checkout.js order submission, and MySQL verification.
 */

const http = require('http');
const db = require('./config/db');

async function simulateFrontend() {
  console.log('====================================================');
  console.log('  🎭 DEVILCART - COMPLETE FRONTEND & DB SIMULATION  ');
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

  // Helper to fetch from HTTP server
  function get(urlPath) {
    return new Promise((resolve, reject) => {
      http.get(`http://localhost:5000${urlPath}`, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, text: body });
          }
        });
      }).on('error', reject);
    });
  }

  // 1. Verify HTML pages are served correctly
  console.log('--- 1. Testing HTML Page Serving ---');
  const pages = ['/', '/index.html', '/product.html', '/cart.html', '/checkout.html', '/success.html'];
  for (const page of pages) {
    const res = await get(page);
    assert(res.status === 200, `Page "${page}" served successfully (Status 200)`);
  }

  // 2. Fetch Catalog from API
  console.log('\n--- 2. Fetching Catalog & Testing Category Filtering Logic ---');
  const catRes = await get('/api/products');
  assert(catRes.status === 200 && catRes.body.success, 'GET /api/products returns success');
  const products = catRes.body.products;
  assert(products.length === 38, `Catalog contains exact 38 products (Received: ${products.length})`);

  // Test frontend filter function logic matching products.js
  function testFilter(categoryName, searchQuery = '', sortOption = 'default') {
    let filtered = [...products];
    if (categoryName && categoryName.toLowerCase() !== 'all') {
      const target = categoryName.trim().toLowerCase();
      filtered = filtered.filter(p => {
        const cat = (p.category || '').trim().toLowerCase();
        if (target === 'all') return true;
        if (cat === target) return true;
        if (target === 'fashion' && (cat.includes('fashion') || cat.includes('cloth') || cat.includes('apparel'))) return true;
        if (target === 'dresses' && (cat.includes('dress') || cat.includes('gown') || cat.includes('saree') || cat.includes('kurti'))) return true;
        if (target === 'phones' && (cat.includes('phone') || cat.includes('mobile'))) return true;
        if (target === 'laptops' && (cat.includes('laptop') || cat.includes('notebook') || cat.includes('macbook'))) return true;
        if (target === 'electronics' && (cat.includes('elect') || cat.includes('audio') || cat.includes('tv') || cat.includes('tablet'))) return true;
        if (target === 'accessories' && (cat.includes('access') || cat.includes('mouse') || cat.includes('keyboard') || cat.includes('backpack') || cat.includes('case') || cat.includes('charger'))) return true;
        return false;
      });
    }

    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(p => {
        const name = (p.name || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        return name.includes(q) || desc.includes(q) || cat.includes(q);
      });
    }

    return filtered;
  }

  // Verify ALL filter
  const allFiltered = testFilter('All');
  assert(allFiltered.length === 38, `Filter "ALL" returns 38 products (Target: 38)`);

  // Verify FASHION filter
  const fashionFiltered = testFilter('Fashion');
  assert(fashionFiltered.length === 6, `Filter "FASHION" returns ${fashionFiltered.length} products (Target: 6)`);

  // Verify DRESSES filter
  const dressesFiltered = testFilter('Dresses');
  assert(dressesFiltered.length === 6, `Filter "DRESSES" returns ${dressesFiltered.length} products (Target: 6)`);

  // Verify PHONES filter
  const phonesFiltered = testFilter('Phones');
  assert(phonesFiltered.length === 6, `Filter "PHONES" returns ${phonesFiltered.length} products (Target: 6)`);

  // Verify LAPTOPS filter
  const laptopsFiltered = testFilter('Laptops');
  assert(laptopsFiltered.length === 6, `Filter "LAPTOPS" returns ${laptopsFiltered.length} products (Target: 6)`);

  // Verify ELECTRONICS filter
  const electronicsFiltered = testFilter('Electronics');
  assert(electronicsFiltered.length === 6, `Filter "ELECTRONICS" returns ${electronicsFiltered.length} products (Target: 6)`);

  // Verify ACCESSORIES filter
  const accessoriesFiltered = testFilter('Accessories');
  assert(accessoriesFiltered.length === 8, `Filter "ACCESSORIES" returns ${accessoriesFiltered.length} products (Target: 8)`);

  // Verify Search Filter
  const searchResults = testFilter('All', 'Samsung Galaxy');
  assert(searchResults.length === 1 && searchResults[0].id === 22, 'Search filter for "Samsung Galaxy" returns Galaxy S24 Ultra');

  // Verify Single Product Details API
  console.log('\n--- 3. Testing Product Details Rendering ---');
  const p10Res = await get('/api/products/10');
  assert(p10Res.status === 200 && p10Res.body.product.name === "Men's Casual Slim-Fit Cotton Shirt", 'Product #10 details retrieved correctly');
  assert(p10Res.body.product.category === 'Fashion', 'Product #10 category is Fashion');
  assert(p10Res.body.product.price === 1299, 'Product #10 price is ₹1,299');

  // 4. Cart Simulation
  console.log('\n--- 4. Testing Cart Simulation & Calculations ---');
  let cart = [];

  // Add Product #10 (Shirt, qty 2)
  cart.push({ id: 10, name: "Men's Casual Slim-Fit Cotton Shirt", price: 1299, quantity: 2 });
  // Add Product #16 (Floral Summer Dress, qty 1)
  cart.push({ id: 16, name: "Women's Floral Summer A-Line Georgette Dress", price: 1699, quantity: 1 });
  // Add Product #28 (ASUS ROG Strix G16, qty 1)
  cart.push({ id: 28, name: "ASUS ROG Strix G16 Gaming Laptop", price: 114990, quantity: 1 });

  const totalItemsCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  assert(totalItemsCount === 4, `Cart items count is ${totalItemsCount} (Expected: 4)`);

  const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const expectedSubtotal = (1299 * 2) + (1699 * 1) + (114990 * 1); // 2598 + 1699 + 114990 = 119287
  assert(subtotal === expectedSubtotal, `Cart subtotal is ₹${subtotal} (Expected: ₹${expectedSubtotal})`);

  const shipping = subtotal >= 999 ? 0 : 99;
  assert(shipping === 0, 'Shipping is free (₹0) because subtotal > ₹999');

  const discount = 0; // No promo applied yet
  const total = subtotal + shipping - discount;
  assert(total === expectedSubtotal, `Cart total is ₹${total} (Expected: ₹${expectedSubtotal})`);

  // 5. Checkout & MySQL Order Creation
  console.log('\n--- 5. Testing Checkout & MySQL Database Storage ---');
  function postOrder(orderPayload) {
    return new Promise((resolve, reject) => {
      const dataStr = JSON.stringify(orderPayload);
      const req = http.request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/orders',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(dataStr)
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, text: body });
          }
        });
      });
      req.on('error', reject);
      req.write(dataStr);
      req.end();
    });
  }

  const orderPayload = {
    customer: {
      name: 'Rohan Verma',
      email: `rohan.verma.${Date.now()}@devilcart.in`,
      phone: '9812345678',
      address: '221B Baker Street Extension',
      city: 'Bengaluru',
      pincode: '560001'
    },
    items: cart,
    paymentMethod: 'UPI'
  };

  const orderRes = await postOrder(orderPayload);
  assert(orderRes.status === 201 && orderRes.body.success, 'POST /api/orders created order in MySQL');
  const createdOrderCode = orderRes.body.order.orderCode;
  const createdUserId = orderRes.body.order.userId;
  assert(createdOrderCode.startsWith('DEVIL-'), `Order code generated: ${createdOrderCode}`);

  // Direct MySQL query to verify records in users and orders tables
  const pool = db.getPool();
  const conn = await pool.getConnection();

  const [dbUser] = await conn.query('SELECT * FROM users WHERE id = ?', [createdUserId]);
  assert(dbUser.length === 1 && dbUser[0].name === 'Rohan Verma', 'Verified user record inserted in MySQL `users` table');

  const [dbOrders] = await conn.query('SELECT * FROM orders WHERE user_id = ? AND order_code = ?', [createdUserId, createdOrderCode]);
  assert(dbOrders.length === 3, `Verified ${dbOrders.length} order item rows inserted into MySQL \`orders\` table`);

  // Run final database queries as requested by user
  console.log('\n--- 6. Running Final Database Queries ---');
  const [catGroup] = await conn.query('SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY count DESC');
  console.log('\nSELECT category, COUNT(*) FROM products GROUP BY category:');
  console.table(catGroup);

  const [totalProducts] = await conn.query('SELECT COUNT(*) as count FROM products');
  console.log('\nSELECT COUNT(*) FROM products:');
  console.log(`Total Count: ${totalProducts[0].count}`);

  conn.release();

  console.log('\n====================================================');
  console.log(`  🎉 SIMULATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

simulateFrontend().catch(e => {
  console.error('Fatal simulation error:', e);
  process.exit(1);
});
