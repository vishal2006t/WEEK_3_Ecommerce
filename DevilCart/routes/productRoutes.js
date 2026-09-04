/**
 * DevilCart - Product Routes (Indian Catalog)
 * Handles fetching all products, single product details, categories, and search/filters in INR.
 */

const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/products/categories - List distinct product categories
router.get('/categories', async (req, res) => {
  try {
    const results = await db.query('SELECT DISTINCT category FROM products ORDER BY category ASC');
    let categories = results.map(row => row.category);
    if (!categories || categories.length === 0) {
      categories = ['Fashion', 'Dresses', 'Phones', 'Laptops', 'Electronics', 'Accessories'];
    }
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

// GET /api/products - Get all products with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category && category.trim().toLowerCase() !== 'all') {
      sql += ' AND LOWER(category) = LOWER(?)';
      params.push(category.trim());
    }

    if (search && search.trim() !== '') {
      sql += ' AND (LOWER(name) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?) OR LOWER(category) LIKE LOWER(?))';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (sort === 'price-low') {
      sql += ' ORDER BY price ASC';
    } else if (sort === 'price-high') {
      sql += ' ORDER BY price DESC';
    } else if (sort === 'rating') {
      sql += ' ORDER BY rating DESC';
    } else {
      sql += ' ORDER BY id ASC';
    }

    let products = await db.query(sql, params);

    // If in memory fallback and filters were passed
    if (!db.getIsConnected()) {
      if (category && category.trim().toLowerCase() !== 'all') {
        const targetCat = category.trim().toLowerCase();
        products = products.filter(p => (p.category || '').toLowerCase() === targetCat);
      }
      if (search && search.trim() !== '') {
        const q = search.trim().toLowerCase();
        products = products.filter(p => 
          (p.name && p.name.toLowerCase().includes(q)) || 
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q))
        );
      }
      if (sort === 'price-low') {
        products.sort((a, b) => a.price - b.price);
      } else if (sort === 'price-high') {
        products.sort((a, b) => b.price - a.price);
      } else if (sort === 'rating') {
        products.sort((a, b) => b.rating - a.rating);
      }
    }

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});

// GET /api/products/:id - Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const results = await db.query('SELECT * FROM products WHERE id = ?', [id]);

    if (!results || results.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found in DevilCart inventory' });
    }

    res.json({
      success: true,
      product: results[0]
    });
  } catch (error) {
    console.error(`Error fetching product ${req.params.id}:`, error);
    res.status(500).json({ success: false, message: 'Failed to fetch product details' });
  }
});

module.exports = router;
