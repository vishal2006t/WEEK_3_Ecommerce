/**
 * DevilCart - Order Routes (INR Pricing)
 * Handles order creation, database storage, order confirmation lookups, and receipts in INR.
 */

const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/orders - Place a new order in INR
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      phone = '',
      address,
      city,
      pincode,
      payment_method = 'Credit / Debit Card',
      promo_code = '',
      items = []
    } = req.body;

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

    // 2. Fetch verified product data from database and calculate totals
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
          category: prod.category,
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

    // 3. Insert User into `users` table
    const userResult = await db.query(
      `INSERT INTO users (name, email, phone, address, city, pincode)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name.trim(), email.trim(), phone.trim(), address.trim(), city.trim(), pincode.trim()]
    );
    const userId = userResult.insertId || 1;

    // 4. Generate unique Order Code (e.g. DEVIL-98421)
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderCode = `DEVIL-${randomSuffix}`;

    // 5. Insert into `orders` table
    const orderResult = await db.query(
      `INSERT INTO orders (order_code, user_id, total_amount, shipping_amount, discount_amount, payment_method, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [orderCode, userId, totalAmount, shippingAmount, discountAmount, payment_method, 'Confirmed']
    );
    const orderId = orderResult.insertId || 1;

    // 6. Insert items into `order_items` table
    for (const item of validatedItems) {
      await db.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.productId, item.name, item.quantity, item.price]
      );
    }

    // 7. Return success response
    res.status(201).json({
      success: true,
      currency: 'INR',
      symbol: '₹',
      message: 'Order Placed Successfully in DevilCart Vault!',
      order: {
        id: orderId,
        orderCode: orderCode,
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
    console.error('Error placing order:', error);
    res.status(500).json({ success: false, message: 'Failed to process and store order in database' });
  }
});

// GET /api/orders/:id - Fetch order details by ID or order_code
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
      return res.status(404).json({ success: false, message: 'Order record not found' });
    }

    const order = orderRows[0];

    const userRows = await db.query('SELECT * FROM users WHERE id = ?', [order.user_id]);
    const user = userRows && userRows.length > 0 ? userRows[0] : {};

    const itemRows = await db.query(
      `SELECT oi.*, p.image, p.category 
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [order.id]
    );

    res.json({
      success: true,
      currency: 'INR',
      symbol: '₹',
      order: {
        id: order.id,
        orderCode: order.order_code,
        totalAmount: parseFloat(order.total_amount),
        shippingAmount: parseFloat(order.shipping_amount || 0),
        discountAmount: parseFloat(order.discount_amount || 0),
        paymentMethod: order.payment_method,
        status: order.status,
        createdAt: order.created_at,
        customer: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          city: user.city,
          pincode: user.pincode
        },
        items: itemRows
      }
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order details' });
  }
});

// GET /api/orders - List recent orders
router.get('/', async (req, res) => {
  try {
    const orders = await db.query('SELECT * FROM orders ORDER BY id DESC LIMIT 20');
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error('Error listing orders:', error);
    res.status(500).json({ success: false, message: 'Failed to list orders' });
  }
});

module.exports = router;
