/**
 * DevilCart - Single Product Details Logic (Indian INR Catalog)
 * Features dynamic fetching by ID, stock indicator, quantity adjuster,
 * and related products carousel in INR (₹).
 */

// Centralized Configurable API URL (Uses config.js when loaded, with resilient fallback)
const API_BASE = (typeof window !== 'undefined' && typeof window.getApiBaseUrl === 'function')
  ? window.getApiBaseUrl()
  : (function() {
      if (typeof window !== 'undefined' && window.location) {
        if (window.location.port === '5000') return '/api';
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') return 'http://localhost:5000/api';
      }
      return 'https://devilcart-backend.onrender.com/api';
    })();

// Indian Rupee (₹) Currency Formatter
function formatINR(price) {
  const num = Number(price) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

// Product Image Resolver (Supports local filenames & external URLs)
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
  }, 3200);
}

// Extract Product ID from URL parameters
function getProductId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

// Render Single Product View
async function loadProductDetail() {
  const productId = getProductId();
  const container = document.getElementById('productDetailContainer');

  if (!productId) {
    container.innerHTML = `
      <div class="no-products">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <h3>No Product Specified</h3>
        <p>Please select a product from our catalog.</p>
        <a href="index.html" class="btn-primary" style="margin-top: 1rem;">
          <i class="fa-solid fa-shop"></i> Return to Catalog
        </a>
      </div>
    `;
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/products/${productId}`);
    if (!response.ok) {
      throw new Error(`Product not found (Status: ${response.status})`);
    }

    const data = await response.json();
    const product = data.product || data;

    // Update document title and breadcrumb
    document.title = `${product.name} — DevilCart India`;
    const catBreadcrumb = document.getElementById('breadcrumbCategory');
    const nameBreadcrumb = document.getElementById('breadcrumbProduct');
    if (catBreadcrumb) catBreadcrumb.textContent = product.category;
    if (nameBreadcrumb) nameBreadcrumb.textContent = product.name;

    const ratingVal = parseFloat(product.rating) || 4.8;
    const stockCount = product.stock !== undefined ? product.stock : 20;

    container.innerHTML = `
      <div class="product-detail-grid">
        <!-- Product Image Showcase -->
        <div class="product-gallery">
          <div class="main-image-wrap">
            <img id="detailMainImg" src="${resolveProductImage(product.image)}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'">
            <span class="detail-category-badge">${product.category}</span>
          </div>
        </div>

        <!-- Product Details & Actions -->
        <div class="product-meta">
          <div class="product-rating" style="margin-bottom: 0.5rem;">
            <span class="star-icon"><i class="fa-solid fa-star"></i></span>
            <span class="rating-val">${ratingVal.toFixed(1)} / 5.0</span>
            <span class="rating-count">&bull; 100% Genuine Certified</span>
          </div>

          <h1 class="detail-title">${product.name}</h1>

          <div class="detail-price-box">
            <div class="detail-price">${formatINR(product.price)}</div>
            <div class="detail-stock ${stockCount > 0 ? 'in-stock' : 'out-of-stock'}">
              <i class="fa-solid ${stockCount > 0 ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>
              ${stockCount > 0 ? `In Stock (${stockCount} units available)` : 'Out of Stock'}
            </div>
          </div>

          <div class="detail-description">
            <p>${product.description || 'Premium Indian e-commerce item with verified quality assurance and official manufacturer warranty.'}</p>
          </div>

          <div class="guarantee-box">
            <div class="guarantee-item">
              <i class="fa-solid fa-truck-fast"></i>
              <span>Free Delivery across India above ₹999</span>
            </div>
            <div class="guarantee-item">
              <i class="fa-solid fa-shield-halved"></i>
              <span>Official 1-Year Manufacturer Warranty</span>
            </div>
            <div class="guarantee-item">
              <i class="fa-solid fa-rotate-left"></i>
              <span>7-Day Hassle-Free Replacement</span>
            </div>
          </div>

          <!-- Quantity Stepper & Add to Cart -->
          <div class="detail-actions">
            <div class="quantity-control">
              <button class="qty-btn" id="qtyMinus" title="Decrease quantity"><i class="fa-solid fa-minus"></i></button>
              <input type="number" id="detailQty" class="qty-input" value="1" min="1" max="${stockCount}">
              <button class="qty-btn" id="qtyPlus" title="Increase quantity"><i class="fa-solid fa-plus"></i></button>
            </div>

            <button class="btn-primary" id="detailAddToCartBtn" style="flex: 1; padding: 0.95rem 1.75rem; font-size: 1.05rem;">
              <i class="fa-solid fa-cart-plus"></i> Add to Cart
            </button>
          </div>
        </div>
      </div>
    `;

    // Hook Quantity Steppers
    const qtyInput = document.getElementById('detailQty');
    document.getElementById('qtyMinus').addEventListener('click', () => {
      let val = parseInt(qtyInput.value, 10) || 1;
      if (val > 1) qtyInput.value = val - 1;
    });

    document.getElementById('qtyPlus').addEventListener('click', () => {
      let val = parseInt(qtyInput.value, 10) || 1;
      if (val < stockCount) qtyInput.value = val + 1;
    });

    // Hook Add to Cart Button
    document.getElementById('detailAddToCartBtn').addEventListener('click', () => {
      const quantity = parseInt(qtyInput.value, 10) || 1;
      const cart = getCart();
      const existing = cart.find(i => i.id === product.id);

      if (existing) {
        existing.quantity += quantity;
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
      showToast(`Added ${quantity} &times; "${product.name}" to cart!`, 'fa-cart-plus');
    });

    // Load related products in the same category
    loadRelatedProducts(product.category, product.id);

  } catch (error) {
    console.error('Error loading product details:', error);
    container.innerHTML = `
      <div class="no-products">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <h3>Unable to Load Product</h3>
        <p>${error.message}</p>
        <a href="index.html" class="btn-primary" style="margin-top: 1rem;">
          <i class="fa-solid fa-shop"></i> Back to Catalog
        </a>
      </div>
    `;
  }
}

// Fetch and render related products
async function loadRelatedProducts(category, currentId) {
  try {
    const response = await fetch(`${API_BASE}/products?category=${encodeURIComponent(category)}`);
    const data = await response.json();
    const products = data.products || (Array.isArray(data) ? data : []);

    const related = products.filter(p => p.id !== currentId).slice(0, 4);

    const relatedSec = document.getElementById('relatedSection');
    const relatedGrid = document.getElementById('relatedGrid');

    if (related.length > 0 && relatedGrid && relatedSec) {
      relatedSec.style.display = 'block';
      relatedGrid.innerHTML = related.map(p => `
        <article class="product-card" data-id="${p.id}">
          <div class="product-image-wrap">
            <img src="${resolveProductImage(p.image)}" alt="${p.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'">
            <span class="product-category-tag">${p.category}</span>
          </div>
          <div class="product-info">
            <h3 class="product-title"><a href="product.html?id=${p.id}">${p.name}</a></h3>
            <div class="product-card-footer">
              <div class="product-price-wrap">
                <span class="price-symbol">${formatINR(p.price)}</span>
              </div>
              <a href="product.html?id=${p.id}" class="btn-view" style="width: auto; padding: 0.4rem 0.8rem;">
                <i class="fa-solid fa-eye"></i> Details
              </a>
            </div>
          </div>
        </article>
      `).join('');
    }
  } catch (e) {
    console.error('Failed to load related products:', e);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  loadProductDetail();
});
