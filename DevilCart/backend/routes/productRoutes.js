/**
 * DevilCart - Product Routes (MySQL Direct Integration)
 * File: backend/routes/productRoutes.js
 * 
 * Handles fetching all products, single product by ID, and categories directly from MySQL.
 */

const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Helper to infer category if not present in basic schema
function inferCategory(name = '') {
  const n = name.toLowerCase();
  if (n.includes('headphone') || n.includes('speaker') || n.includes('audio') || n.includes('buds')) return 'Electronics';
  if (n.includes('watch') || n.includes('mouse') || n.includes('keyboard') || n.includes('ssd') || n.includes('charger')) return 'Accessories';
  if (n.includes('phone') || n.includes('galaxy') || n.includes('oneplus') || n.includes('redmi') || n.includes('vivo')) return 'Phones';
  if (n.includes('laptop') || n.includes('gaming') || n.includes('rog') || n.includes('legion') || n.includes('pavilion')) return 'Laptops';
  if (n.includes('dress') || n.includes('gown') || n.includes('maxi') || n.includes('cocktail')) return 'Dresses';
  if (n.includes('shirt') || n.includes('t-shirt') || n.includes('jeans') || n.includes('kurti') || n.includes('saree') || n.includes('sneaker') || n.includes('shoes')) return 'Fashion';
  return 'General';
}

// Helper to infer description if not present in basic schema
function inferDescription(name = '', price = 0) {
  return `Premium quality ${name} featuring authentic build quality, top-tier performance, and official manufacturer warranty. Available now in DevilCart Vault.`;
}

// Format product row safely
function formatProduct(p) {
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    price: parseFloat(p.price),
    image: p.image,
    category: p.category || inferCategory(p.name),
    description: p.description || inferDescription(p.name, p.price),
    rating: parseFloat(p.rating) || 4.8,
    stock: (p.stock !== undefined && p.stock !== null) ? parseInt(p.stock, 10) : 25
  };
}

// GET /api/products/categories - List distinct product categories
router.get('/categories', async (req, res) => {
  try {
    const results = await db.query('SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category ASC');
    let categories = results.map(row => row.category).filter(Boolean);
    if (!categories || categories.length === 0) {
      categories = ['Fashion', 'Dresses', 'Phones', 'Laptops', 'Electronics', 'Accessories'];
    }
    res.json({ success: true, categories });
  } catch (error) {
    res.json({
      success: true,
      categories: ['Fashion', 'Dresses', 'Phones', 'Laptops', 'Electronics', 'Accessories']
    });
  }
});

// GET /api/products - Get all products with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let sql = 'SELECT * FROM products';
    const params = [];
    const conditions = [];

    if (category && category.trim().toLowerCase() !== 'all') {
      conditions.push('LOWER(category) = LOWER(?)');
      params.push(category.trim());
    }

    if (search && search.trim() !== '') {
      conditions.push('(LOWER(name) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))');
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    if (sort === 'price-low') {
      sql += ' ORDER BY price ASC';
    } else if (sort === 'price-high') {
      sql += ' ORDER BY price DESC';
    } else {
      sql += ' ORDER BY id ASC';
    }

    const rows = await db.query(sql, params);
    const products = rows.map(formatProduct);

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('[API Error] Fetch products failed:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch products from database' });
  }
});

// GET /api/products/:id - Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const results = await db.query('SELECT * FROM products WHERE id = ?', [id]);

    if (!results || results.length === 0) {
      return res.status(404).json({ success: false, message: `Product #${id} not found in database inventory` });
    }

    res.json({
      success: true,
      product: formatProduct(results[0])
    });
  } catch (error) {
    console.error(`[API Error] Fetch product #${req.params.id} failed:`, error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch product details from database' });
  }
});

module.exports = router;
