/**
 * DevilCart - Order Routes (MySQL Direct Integration)
 * File: backend/routes/orderRoutes.js
 * 
 * Handles order checkout, MySQL user & order table insertions,
 * and order confirmation receipts in INR.
 */

const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /api/orders - Place a new order and save directly in MySQL
router.post('/', async (req, res) => {
  try {
    const cust = req.body.customer || {};
    const name = (req.body.name !== undefined ? req.body.name : cust.name) || '';
    const email = (req.body.email !== undefined ? req.body.email : cust.email) || '';
    const phone = (req.body.phone !== undefined ? req.body.phone : cust.phone) || '';
    const address = (req.body.address !== undefined ? req.body.address : cust.address) || '';
    const city = (req.body.city !== undefined ? req.body.city : cust.city) || '';
    const pincode = (req.body.pincode !== undefined ? req.body.pincode : cust.pincode) || '';
    const payment_method = req.body.payment_method || req.body.paymentMethod || 'UPI / Cards / COD';
    const promo_code = req.body.promo_code || req.body.promoCode || '';
    const items = req.body.items || [];

    // 1. Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }
    if (!email || !email.trim() || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'A valid email address is required' });
    }
    if (!address || !address.trim()) {
      return res.status(400).json({ success: false, message: 'Delivery address is required' });
    }
    if (!city || !city.trim()) {
      return res.status(400).json({ success: false, message: 'City is required' });
    }
    if (!pincode || !pincode.trim()) {
      return res.status(400).json({ success: false, message: 'Pincode is required' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart cannot be empty when placing an order' });
    }

    // 2. Fetch verified product data from MySQL and calculate subtotal
    const validatedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const pid = parseInt(item.id, 10);
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);

      const prods = await db.query('SELECT * FROM products WHERE id = ?', [pid]);
      if (prods && prods.length > 0) {
        const prod = prods[0];
        const lineTotal = parseFloat(prod.price) * qty;
        subtotal += lineTotal;
        validatedItems.push({
          productId: prod.id,
          name: prod.name,
          price: parseFloat(prod.price),
          image: prod.image,
          category: prod.category || 'General',
          quantity: qty,
          lineTotal
        });
      }
    }

    if (validatedItems.length === 0) {
      return res.status(400).json({ success: false, message: 'None of the items in the order were found in inventory' });
    }

    // Shipping in INR: Free above ₹999, else ₹99
    const shippingAmount = subtotal >= 999 ? 0.00 : 99.00;
    let discountAmount = 0.00;
    if (promo_code) {
      const cleanCode = promo_code.trim().toUpperCase();
      if (cleanCode === 'DEVIL20') discountAmount = subtotal * 0.20;
      else if (cleanCode === 'ACADEMIA10') discountAmount = subtotal * 0.10;
    }

    const totalAmount = parseFloat(Math.max(0, subtotal - discountAmount + shippingAmount).toFixed(2));

    // 3. Insert User into MySQL `users` table
    let userId;
    try {
      const userResult = await db.query(
        `INSERT INTO users (name, email, phone, address, city, pincode) VALUES (?, ?, ?, ?, ?, ?)`,
        [name.trim(), email.trim(), phone.trim(), address.trim(), city.trim(), pincode.trim()]
      );
      userId = userResult.insertId;
    } catch (err) {
      // Fallback for minimal users table: (id, name, email)
      const userResult = await db.query(
        `INSERT INTO users (name, email) VALUES (?, ?)`,
        [name.trim(), email.trim()]
      );
      userId = userResult.insertId;
    }

    // 4. Generate unique Order Code (e.g. DEVIL-98421)
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderCode = `DEVIL-${randomSuffix}`;

    // 5. Insert into MySQL `orders` table (with user_id, product_id, quantity)
    let orderId = null;
    for (const item of validatedItems) {
      try {
        const orderResult = await db.query(
          `INSERT INTO orders (order_code, user_id, product_id, quantity, total_amount, shipping_amount, discount_amount, payment_method, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [orderCode, userId, item.productId, item.quantity, totalAmount, shippingAmount, discountAmount, payment_method, 'Confirmed']
        );
        if (!orderId) orderId = orderResult.insertId;
      } catch (err) {
        // Fallback for minimal orders table: (id, user_id, product_id, quantity)
        const orderResult = await db.query(
          `INSERT INTO orders (user_id, product_id, quantity) VALUES (?, ?, ?)`,
          [userId, item.productId, item.quantity]
        );
        if (!orderId) orderId = orderResult.insertId;
      }
    }

    // 6. Return verified order confirmation
    res.status(201).json({
      success: true,
      currency: 'INR',
      symbol: '₹',
      message: 'Order Placed Successfully and Saved in MySQL Database!',
      order: {
        id: orderId,
        orderCode: orderCode,
        userId: userId,
        totalAmount: totalAmount,
        subtotal: parseFloat(subtotal.toFixed(2)),
        shippingAmount: parseFloat(shippingAmount.toFixed(2)),
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        paymentMethod: payment_method,
        status: 'Confirmed',
        createdAt: new Date().toISOString(),
        customer: {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          pincode: pincode.trim()
        },
        items: validatedItems
      }
    });
  } catch (error) {
    console.error('[API Error] Place order failed:', error);
    res.status(500).json({ success: false, message: 'Failed to process and save order in MySQL database' });
  }
});

// GET /api/orders/:id - Fetch order details by ID or order_code from MySQL
router.get('/:id', async (req, res) => {
  try {
    const param = req.params.id;
    let orderRows = [];

    if (param.startsWith('DEVIL-')) {
      orderRows = await db.query('SELECT * FROM orders WHERE order_code = ?', [param]);
    } else {
      orderRows = await db.query('SELECT * FROM orders WHERE id = ?', [param]);
    }

    if (!orderRows || orderRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order record not found in database' });
    }

    const order = orderRows[0];
    const userRows = await db.query('SELECT * FROM users WHERE id = ?', [order.user_id]);
    const user = userRows && userRows.length > 0 ? userRows[0] : {};

    res.json({
      success: true,
      currency: 'INR',
      symbol: '₹',
      order: {
        id: order.id,
        orderCode: order.order_code || `DEVIL-${order.id}`,
        userId: order.user_id,
        productId: order.product_id,
        quantity: order.quantity,
        totalAmount: parseFloat(order.total_amount || 0),
        paymentMethod: order.payment_method || 'UPI / Cards / COD',
        status: order.status || 'Confirmed',
        createdAt: order.created_at,
        customer: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          city: user.city,
          pincode: user.pincode
        }
      }
    });
  } catch (error) {
    console.error(`[API Error] Fetch order #${req.params.id} failed:`, error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch order details' });
  }
});

module.exports = router;
