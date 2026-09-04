/**
 * DevilCart - Homepage & Product Catalog Management (38 Indian INR Products)
 * File: frontend/js/products.js
 * 
 * Dynamically fetches products from GET /api/products, handles search/filter across
 * Fashion, Dresses, Phones, Laptops, Electronics, and Accessories,
 * and renders rich product cards with instant cart integration.
 */

// Centralized Configurable API URL (Uses config.js when loaded, with resilient fallback)
const API_BASE = (typeof window !== 'undefined' && typeof window.getApiBaseUrl === 'function')
  ? window.getApiBaseUrl()
  : (function() {
      if (typeof window !== 'undefined' && window.location) {
        if (window.location.port === '5000') return '/api';
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') return 'http://localhost:5000/api';
      }
      return 'https://YOUR-RENDER-BACKEND-URL.onrender.com/api';
    })();

// Global state - Default to 'All' so ALL products show on initial load
let allProducts = [];
let currentCategory = 'All';
let currentSearch = '';
let currentSort = 'default';

// Indian Rupee (₹) Currency Formatter
function formatINR(price) {
  const num = Number(price) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

// Product Image Resolver (Supports local filenames like 'headphones.jpg' & external CDN URLs)
function resolveProductImage(img) {
  if (!img) return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';
  if (img.startsWith('http://') || img.startsWith('https://')) return img;
  const lower = img.toLowerCase();
  if (lower.includes('headphone')) return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';
  if (lower.includes('watch') || lower.includes('smartwatch')) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
  if (lower.includes('mouse')) return 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80';
  if (lower.includes('keyboard')) return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80';
  if (lower.includes('speaker')) return 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80';
  return img;
}

// Helper to infer category if not present or general
function inferCategory(name = '', category = '') {
  if (category && category.trim() && category.toLowerCase() !== 'general') {
    return category.trim();
  }
  const n = (name || '').toLowerCase();
  if (n.includes('headphone') || n.includes('speaker') || n.includes('audio') || n.includes('tv') || n.includes('ipad') || n.includes('tablet') || n.includes('power bank') || n.includes('earbud') || n.includes('buds')) return 'Electronics';
  if (n.includes('backpack') || n.includes('ssd') || n.includes('charger') || n.includes('case') || n.includes('pad') || n.includes('strap') || n.includes('mouse') || n.includes('keyboard') || n.includes('watch')) return 'Accessories';
  if (n.includes('phone') || n.includes('galaxy') || n.includes('nord') || n.includes('redmi') || n.includes('realme') || n.includes('vivo') || n.includes('edge')) return 'Phones';
  if (n.includes('laptop') || n.includes('gaming') || n.includes('rog') || n.includes('nitro') || n.includes('legion') || n.includes('pavilion') || n.includes('ideapad') || n.includes('macbook')) return 'Laptops';
  if (n.includes('dress') || n.includes('gown') || n.includes('maxi') || n.includes('cocktail') || n.includes('saree')) return 'Dresses';
  if (n.includes('shirt') || n.includes('t-shirt') || n.includes('jeans') || n.includes('kurti') || n.includes('hoodie') || n.includes('sneaker') || n.includes('shoes')) return 'Fashion';
  return 'General';
}

// Shopping Cart Utilities
function getCart() {
  try {
    const data = localStorage.getItem('devilcart_cart');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('devilcart_cart', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const cart = getCart();
  const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const badges = document.querySelectorAll('#navCartCount, .cart-badge');
  badges.forEach(badge => {
    if (badge) badge.textContent = totalCount;
  });
}

function showToast(message, icon = 'fa-skull') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 300);
  }, 3000);
}

function addToCart(productId, quantity = 1) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) {
    showToast('Product not found in catalog!', 'fa-circle-exclamation');
    return;
  }

  const cart = getCart();
  const existingIndex = cart.findIndex(item => item.id === productId);

  if (existingIndex > -1) {
    cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image: product.image,
      category: product.category,
      stock: product.stock,
      quantity: quantity
    });
  }

  saveCart(cart);
  showToast(`Added "${product.name}" to cart!`, 'fa-cart-plus');
}

// Fetch products from backend API (GET /api/products)
async function loadProducts() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  grid.innerHTML = `
    <div class="loading-spinner-wrap">
      <div class="devil-spinner"></div>
      <p>Loading DevilCart products from MySQL database...</p>
    </div>
  `;

  try {
    const response = await fetch(`${API_BASE}/products`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Support { success: true, products: [...] } and raw array [...]
    if (data && Array.isArray(data.products)) {
      allProducts = data.products;
    } else if (Array.isArray(data)) {
      allProducts = data;
    } else {
      allProducts = [];
    }

    renderFilteredProducts();
  } catch (error) {
    console.error('Error fetching products from API:', error);
    grid.innerHTML = `
      <div class="no-products" style="text-align: center; padding: 3rem 1rem; grid-column: 1 / -1;">
        <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; color: var(--accent-hover); margin-bottom: 1rem;"></i>
        <h3>Unable to load products</h3>
        <p style="color: var(--text-muted); margin: 0.5rem 0 1.5rem;">Could not connect to backend API at <code>${API_BASE}/products</code>.</p>
        <button class="btn-primary" onclick="loadProducts()">
          <i class="fa-solid fa-rotate"></i> Retry Connection
        </button>
      </div>
    `;
  }
}

// Filter and Render Products into #productGrid
function renderFilteredProducts() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  let filtered = [...allProducts];

  // 1. Category Filter (Case-insensitive matching; "All" shows everything)
  if (currentCategory && currentCategory.toLowerCase() !== 'all') {
    const targetCat = currentCategory.trim().toLowerCase();
    filtered = filtered.filter(p => {
      const cat = (p.category || inferCategory(p.name, p.category)).trim().toLowerCase();
      
      if (targetCat === 'all') return true;
      if (cat === targetCat) return true;
      if (targetCat === 'fashion' && (cat.includes('fashion') || cat.includes('cloth') || cat.includes('apparel'))) return true;
      if (targetCat === 'dresses' && (cat.includes('dress') || cat.includes('gown') || cat.includes('saree') || cat.includes('kurti'))) return true;
      if (targetCat === 'phones' && (cat.includes('phone') || cat.includes('mobile'))) return true;
      if (targetCat === 'laptops' && (cat.includes('laptop') || cat.includes('notebook') || cat.includes('macbook'))) return true;
      if (targetCat === 'electronics' && (cat.includes('elect') || cat.includes('audio') || cat.includes('tv') || cat.includes('tablet'))) return true;
      if (targetCat === 'accessories' && (cat.includes('access') || cat.includes('mouse') || cat.includes('keyboard') || cat.includes('backpack') || cat.includes('case') || cat.includes('charger'))) return true;
      
      return false;
    });
  }

  // 2. Search Query Filter
  if (currentSearch && currentSearch.trim() !== '') {
    const query = currentSearch.trim().toLowerCase();
    filtered = filtered.filter(p => {
      const name = (p.name || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      return name.includes(query) || desc.includes(query) || cat.includes(query);
    });
  }

  // 3. Sorting
  if (currentSort === 'price-low') {
    filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  } else if (currentSort === 'price-high') {
    filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
  } else if (currentSort === 'rating') {
    filtered.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
  }

  // Empty state handling
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="no-products" style="text-align: center; padding: 4rem 1rem; grid-column: 1 / -1;">
        <i class="fa-solid fa-box-open" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
        <h3>No Products Found in "${currentCategory}"</h3>
        <p style="color: var(--text-muted); margin: 0.5rem 0 1.5rem;">There are currently no items matching this filter.</p>
        <button class="btn-primary" onclick="resetFilters()">
          <i class="fa-solid fa-rotate-left"></i> View All Products
        </button>
      </div>
    `;
    return;
  }

  // Render Product Cards
  grid.innerHTML = filtered.map(product => {
    const ratingVal = parseFloat(product.rating) || 4.8;
    const stockCount = product.stock !== undefined ? parseInt(product.stock, 10) : 25;
    const categoryName = product.category || inferCategory(product.name, product.category);
    const desc = product.description || `Authentic ${product.name} with official manufacturer guarantee.`;

    return `
      <article class="product-card" data-id="${product.id}">
        <!-- Product Thumbnail & Badges -->
        <div class="product-thumb-wrap">
          <img src="${resolveProductImage(product.image)}" alt="${product.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'">
          <span class="product-category-tag">${categoryName}</span>
          <div class="product-rating">
            <i class="fa-solid fa-star"></i>
            <span>${ratingVal.toFixed(1)}</span>
          </div>
          <span class="product-stock-tag ${stockCount < 15 ? 'low-stock' : ''}">
            ${stockCount < 15 ? `Only ${stockCount} left` : `In Stock (${stockCount})`}
          </span>
        </div>
        
        <!-- Product Content & Details -->
        <div class="product-content">
          <h3 class="product-title" title="${product.name}">
            <a href="product.html?id=${product.id}">${product.name}</a>
          </h3>

          <p class="product-desc-snippet">${desc}</p>

          <div class="product-card-footer">
            <div class="product-price">${formatINR(product.price)}</div>
            
            <div class="card-action-btns">
              <a href="product.html?id=${product.id}" class="btn-card-view" title="View details of ${product.name}">
                <i class="fa-solid fa-eye"></i> Details
              </a>
              <button class="btn-add-cart-sm" onclick="addToCart(${product.id})" title="Add ${product.name} to Cart">
                <i class="fa-solid fa-cart-plus"></i> Add to Cart
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// Reset all filters and search input
function resetFilters() {
  currentCategory = 'All';
  currentSearch = '';
  currentSort = 'default';

  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';

  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) sortSelect.value = 'default';

  const chips = document.querySelectorAll('.chip-btn');
  chips.forEach(chip => {
    if (chip.dataset.category && chip.dataset.category.toLowerCase() === 'all') {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });

  renderFilteredProducts();
}

// Setup Event Listeners
function initEvents() {
  // Category Chips Click Handler
  const categoryContainer = document.getElementById('categoryChips');
  if (categoryContainer) {
    categoryContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip-btn');
      if (!chip) return;

      document.querySelectorAll('.chip-btn').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      currentCategory = chip.dataset.category || 'All';
      renderFilteredProducts();
    });
  }

  // Live Search Input Handler
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      renderFilteredProducts();
    });
  }

  // Sorting Dropdown Handler
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderFilteredProducts();
    });
  }
}

// Programmatic category filter helper (used in footer links)
function filterByCategory(categoryName) {
  currentCategory = categoryName;
  currentSearch = '';

  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';

  const chips = document.querySelectorAll('.chip-btn');
  chips.forEach(chip => {
    if (chip.dataset.category && chip.dataset.category.toLowerCase() === categoryName.toLowerCase()) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });

  renderFilteredProducts();

  const sec = document.getElementById('products-section');
  if (sec) sec.scrollIntoView({ behavior: 'smooth' });
}

// Global Window Bindings for inline HTML onclick handlers
window.addToCart = addToCart;
window.resetFilters = resetFilters;
window.loadProducts = loadProducts;
window.filterByCategory = filterByCategory;
window.renderFilteredProducts = renderFilteredProducts;

// Initialization on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  initEvents();
  loadProducts();
});
