/**
 * DevilCart - Shopping Cart Manager (Indian INR Currency)
 * Handles item listing, quantity increments/decrements, item removal,
 * promo code calculation, free shipping rule (>= ₹999), and checkout redirection.
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
  renderCart();
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

function updateQuantity(productId, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);

  if (item) {
    item.quantity = (item.quantity || 1) + delta;
    if (item.quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    saveCart(cart);
  }
}

function removeFromCart(productId) {
  let cart = getCart();
  const removedItem = cart.find(i => i.id === productId);
  cart = cart.filter(i => i.id !== productId);
  saveCart(cart);
  if (removedItem) {
    showToast(`Removed "${removedItem.name}" from cart`, 'fa-trash-can');
  }
}

function applyCoupon() {
  const input = document.getElementById('promoInput');
  if (!input) return;

  const code = input.value.trim().toUpperCase();
  if (!code) {
    showToast('Please enter a coupon code.', 'fa-circle-exclamation');
    return;
  }

  if (code === 'DEVIL20') {
    localStorage.setItem('devilcart_promo', 'DEVIL20');
    showToast('Success! 20% discount coupon applied.', 'fa-fire');
    renderCart();
  } else if (code === 'ACADEMIA10') {
    localStorage.setItem('devilcart_promo', 'ACADEMIA10');
    showToast('Success! 10% discount coupon applied.', 'fa-fire');
    renderCart();
  } else {
    showToast('Invalid Coupon Code! Try DEVIL20 or ACADEMIA10', 'fa-triangle-exclamation');
  }
}

function removeCoupon() {
  localStorage.removeItem('devilcart_promo');
  showToast('Coupon removed.', 'fa-tag');
  renderCart();
}

function renderCart() {
  const cart = getCart();
  const container = document.getElementById('cartContainer');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-state">
        <div class="empty-icon"><i class="fa-solid fa-cart-arrow-down"></i></div>
        <h3>Your DevilCart is currently empty</h3>
        <p>Explore our catalog of smartphones, laptops, electronics, and fashion.</p>
        <a href="index.html#products-section" class="btn-primary" style="margin-top: 1.5rem; display: inline-flex;">
          <i class="fa-solid fa-bag-shopping"></i> Start Shopping Now
        </a>
      </div>
    `;
    return;
  }

  // Calculate pricing in INR
  let subtotal = 0;
  cart.forEach(item => {
    subtotal += parseFloat(item.price) * (item.quantity || 1);
  });

  const appliedPromo = localStorage.getItem('devilcart_promo') || '';
  let discount = 0;
  if (appliedPromo === 'DEVIL20') {
    discount = subtotal * 0.20;
  } else if (appliedPromo === 'ACADEMIA10') {
    discount = subtotal * 0.10;
  }

  const shipping = subtotal >= 999 ? 0.00 : 99.00;
  const grandTotal = Math.max(0, subtotal - discount + shipping);

  container.innerHTML = `
    <div class="cart-layout-grid">
      <!-- Left Column: Item List Table -->
      <div class="cart-items-wrapper">
        <div class="cart-items-header">
          <span>Product</span>
          <span>Price</span>
          <span>Quantity</span>
          <span>Total</span>
          <span></span>
        </div>

        <div class="cart-items-body">
          ${cart.map(item => {
            const itemTotal = parseFloat(item.price) * (item.quantity || 1);
            return `
              <div class="cart-item-row" data-id="${item.id}">
                <div class="cart-item-info">
                  <img src="${resolveProductImage(item.image)}" alt="${item.name}" class="cart-item-img" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'">
                  <div class="cart-item-meta">
                    <h4><a href="product.html?id=${item.id}">${item.name}</a></h4>
                    <span class="cart-item-category">${item.category}</span>
                  </div>
                </div>

                <div class="cart-item-unit-price">
                  ${formatINR(item.price)}
                </div>

                <div class="cart-item-qty">
                  <div class="quantity-control small">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)" title="Decrease"><i class="fa-solid fa-minus"></i></button>
                    <input type="number" class="qty-input" value="${item.quantity || 1}" readonly>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)" title="Increase"><i class="fa-solid fa-plus"></i></button>
                  </div>
                </div>

                <div class="cart-item-total-price">
                  ${formatINR(itemTotal)}
                </div>

                <div class="cart-item-action">
                  <button class="btn-remove" onclick="removeFromCart(${item.id})" title="Remove Item">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="cart-table-footer">
          <a href="index.html#products-section" class="btn-secondary" style="padding: 0.6rem 1.2rem; font-size: 0.9rem;">
            <i class="fa-solid fa-arrow-left"></i> Continue Shopping
          </a>
          <button class="btn-secondary" onclick="localStorage.removeItem('devilcart_cart'); renderCart(); updateCartBadge(); showToast('Cart cleared!');" style="padding: 0.6rem 1.2rem; font-size: 0.9rem;">
            <i class="fa-solid fa-trash-arrow-up"></i> Clear Cart
          </button>
        </div>
      </div>

      <!-- Right Column: Order Summary Card -->
      <div class="cart-summary-wrapper">
        <div class="summary-card">
          <h3>Order Summary</h3>
          
          <div class="summary-line">
            <span>Subtotal (${cart.reduce((s, i) => s + (i.quantity || 1), 0)} items)</span>
            <span>${formatINR(subtotal)}</span>
          </div>

          ${discount > 0 ? `
            <div class="summary-line discount-line">
              <span>Coupon Discount (${appliedPromo})</span>
              <span>-${formatINR(discount)}</span>
            </div>
          ` : ''}

          <div class="summary-line">
            <span>Estimated Delivery</span>
            <span>${shipping === 0 ? '<span style="color:#34d399; font-weight: 600;">FREE (Orders above ₹999)</span>' : formatINR(shipping)}</span>
          </div>

          <div class="summary-divider"></div>

          <!-- Promo Code Section -->
          <div class="promo-box">
            ${appliedPromo ? `
              <div class="applied-promo-tag">
                <span><i class="fa-solid fa-tag"></i> <strong>${appliedPromo}</strong> applied</span>
                <button class="btn-remove-promo" onclick="removeCoupon()"><i class="fa-solid fa-xmark"></i></button>
              </div>
            ` : `
              <div class="promo-input-group">
                <input type="text" id="promoInput" placeholder="Enter coupon code (e.g. DEVIL20)" autocomplete="off">
                <button type="button" class="btn-apply-promo" onclick="applyCoupon()">Apply</button>
              </div>
            `}
          </div>

          <div class="summary-divider"></div>

          <div class="summary-total">
            <span>Total Amount</span>
            <span class="summary-total-val">${formatINR(grandTotal)}</span>
          </div>

          <a href="checkout.html" class="btn-primary" style="width: 100%; text-align: center; margin-top: 1.25rem; padding: 1rem;">
            <i class="fa-solid fa-shield-halved"></i> Proceed to Checkout
          </a>

          <div class="summary-trust-badge">
            <i class="fa-solid fa-lock"></i> 100% Safe &amp; Secure Indian Checkout (UPI / Cards / COD)
          </div>
        </div>
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  renderCart();
});
