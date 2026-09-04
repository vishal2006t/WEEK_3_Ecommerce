/**
 * DevilCart - Checkout & Order Processing Logic (Indian INR Currency)
 * Handles real-time form validation, payment selection, order summary, and API submission in INR.
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

// Render Order Summary in Sticky Sidebar
function renderCheckoutSummary() {
  const cart = getCart();
  const appliedPromo = localStorage.getItem('devilcart_promo') || '';
  const listEl = document.getElementById('checkoutItemList');

  if (cart.length === 0) {
    window.location.href = 'cart.html';
    return;
  }

  if (listEl) {
    listEl.innerHTML = cart.map(item => `
      <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
        <img src="${resolveProductImage(item.image)}" alt="${item.name}" style="width: 48px; height: 48px; border-radius: var(--radius-sm); object-fit: cover; border: 1px solid var(--border-subtle);" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'">
        <div style="flex: 1; font-size: 0.85rem;">
          <div style="font-weight: 600; color: #fff; line-height: 1.2;">${item.name}</div>
          <div style="color: var(--text-muted); font-size: 0.75rem;">Qty: ${item.quantity} &times; ${formatINR(item.price)}</div>
        </div>
        <div style="font-weight: 700; color: var(--accent-hover); font-size: 0.9rem;">
          ${formatINR(parseFloat(item.price) * item.quantity)}
        </div>
      </div>
    `).join('');
  }

  // Compute Subtotal in INR
  let subtotal = 0;
  cart.forEach(item => {
    subtotal += parseFloat(item.price) * (item.quantity || 1);
  });

  const shipping = subtotal >= 999 ? 0.00 : 99.00;
  let discount = 0;
  if (appliedPromo === 'DEVIL20') discount = subtotal * 0.20;
  else if (appliedPromo === 'ACADEMIA10') discount = subtotal * 0.10;

  const grandTotal = Math.max(0, subtotal - discount + shipping);

  document.getElementById('summarySubtotal').textContent = `${formatINR(subtotal)}`;
  document.getElementById('summaryShipping').innerHTML = shipping === 0 ? '<span style="color:#34d399; font-weight:600;">FREE</span>' : `${formatINR(shipping)}`;

  const discountRow = document.getElementById('discountRow');
  const discountVal = document.getElementById('summaryDiscount');
  if (discount > 0) {
    discountRow.style.display = 'flex';
    discountVal.textContent = `-${formatINR(discount)} (${appliedPromo})`;
  } else {
    discountRow.style.display = 'none';
  }

  document.getElementById('summaryTotal').textContent = `${formatINR(grandTotal)}`;
}

// Payment Selection
function initPaymentOptions() {
  const cards = document.querySelectorAll('.payment-method-card');
  const hiddenInput = document.getElementById('selectedPaymentMethod');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      if (hiddenInput) {
        hiddenInput.value = card.dataset.method;
      }
    });
  });
}

// Field Validation
function validateForm() {
  let isValid = true;

  const fields = [
    { id: 'fullName', validator: val => val.trim().length >= 2 },
    { id: 'email', validator: val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()) },
    { id: 'phone', validator: val => val.trim().length >= 10 },
    { id: 'address', validator: val => val.trim().length >= 5 },
    { id: 'city', validator: val => val.trim().length >= 2 },
    { id: 'pincode', validator: val => /^\d{6}$/.test(val.trim()) || val.trim().length >= 3 }
  ];

  fields.forEach(({ id, validator }) => {
    const input = document.getElementById(id);
    if (input) {
      if (!validator(input.value)) {
        input.classList.add('error');
        isValid = false;
      } else {
        input.classList.remove('error');
      }
    }
  });

  return isValid;
}

// Order Submission Handler
async function handleCheckoutSubmit(e) {
  e.preventDefault();

  if (!validateForm()) {
    showToast('Please fill all required delivery details properly.', 'fa-circle-exclamation');
    return;
  }

  const cart = getCart();
  if (cart.length === 0) {
    showToast('Your cart is empty!', 'fa-triangle-exclamation');
    setTimeout(() => { window.location.href = 'cart.html'; }, 1000);
    return;
  }

  const submitBtn = document.getElementById('placeOrderBtn');
  const originalBtnContent = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing Order...`;

  const appliedPromo = localStorage.getItem('devilcart_promo') || '';
  const payload = {
    name: document.getElementById('fullName').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    address: document.getElementById('address').value.trim(),
    city: document.getElementById('city').value.trim(),
    pincode: document.getElementById('pincode').value.trim(),
    payment_method: document.getElementById('selectedPaymentMethod').value,
    promo_code: appliedPromo,
    items: cart.map(item => ({ id: item.id, quantity: item.quantity || 1 }))
  };

  try {
    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok && data.success) {
      localStorage.setItem('devilcart_last_order', JSON.stringify(data.order));
      localStorage.removeItem('devilcart_cart');
      localStorage.removeItem('devilcart_promo');

      window.location.href = `success.html?orderId=${encodeURIComponent(data.order.orderCode)}`;
    } else {
      throw new Error(data.message || 'Order creation failed');
    }
  } catch (error) {
    console.error('Checkout error:', error);
    showToast(`Order Error: ${error.message}`, 'fa-triangle-exclamation');
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnContent;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  renderCheckoutSummary();
  initPaymentOptions();

  const form = document.getElementById('checkoutForm');
  if (form) {
    form.addEventListener('submit', handleCheckoutSubmit);

    const inputs = form.querySelectorAll('.form-control');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        if (input.value.trim().length > 0) {
          input.classList.remove('error');
        }
      });
    });
  }
});
