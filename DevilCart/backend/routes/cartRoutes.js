/**
 * DevilCart - Cart Routes (INR Pricing)
 * Handles cart calculation, validation against database products, and price summaries in INR.
 */

const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /api/cart - Validate cart items and calculate verified totals in INR
router.post('/', async (req, res) => {
  try {
    const { items = [], promoCode = '' } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.json({
        success: true,
        items: [],
        subtotal: 0,
        shipping: 0,
        discount: 0,
        total: 0,
        itemCount: 0
      });
    }

    const validatedItems = [];
    let subtotal = 0;
    let totalQuantity = 0;

    for (const item of items) {
      const productId = parseInt(item.id, 10);
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);

      const products = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
      if (products && products.length > 0) {
        const prod = products[0];
        const itemTotal = parseFloat(prod.price) * qty;
        subtotal += itemTotal;
        totalQuantity += qty;

        validatedItems.push({
          id: prod.id,
          name: prod.name,
          price: parseFloat(prod.price),
          image: prod.image,
          category: prod.category,
          quantity: qty,
          itemTotal: parseFloat(itemTotal.toFixed(2)),
          stock: prod.stock
        });
      }
    }

    // Shipping rule in INR: Free shipping for orders above ₹999, else ₹99 standard delivery
    let shipping = subtotal > 0 ? (subtotal >= 999 ? 0.00 : 99.00) : 0.00;

    // Promo code rule: "DEVIL20" gives 20% discount, "ACADEMIA10" gives 10%
    let discount = 0;
    let appliedPromo = null;
    if (promoCode && typeof promoCode === 'string') {
      const cleanCode = promoCode.trim().toUpperCase();
      if (cleanCode === 'DEVIL20') {
        discount = subtotal * 0.20;
        appliedPromo = { code: 'DEVIL20', rate: '20% OFF' };
      } else if (cleanCode === 'ACADEMIA10') {
        discount = subtotal * 0.10;
        appliedPromo = { code: 'ACADEMIA10', rate: '10% OFF' };
      }
    }

    const total = Math.max(0, subtotal - discount + shipping);

    res.json({
      success: true,
      currency: 'INR',
      symbol: '₹',
      items: validatedItems,
      itemCount: totalQuantity,
      subtotal: parseFloat(subtotal.toFixed(2)),
      shipping: parseFloat(shipping.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      appliedPromo
    });
  } catch (error) {
    console.error('Error calculating cart:', error);
    res.status(500).json({ success: false, message: 'Cart calculation failed' });
  }
});

// GET /api/cart - Return standard cart meta
router.get('/', (req, res) => {
  res.json({
    success: true,
    currency: 'INR',
    symbol: '₹',
    freeShippingThreshold: 999,
    standardShippingFee: 99,
    message: 'DevilCart Cart Session Active',
    supportedPromoCodes: ['DEVIL20', 'ACADEMIA10']
  });
});

module.exports = router;
