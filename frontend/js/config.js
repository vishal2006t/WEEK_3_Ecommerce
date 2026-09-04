/**
 * DevilCart - Centralized API & Cloud Deployment Configuration
 * File: frontend/js/config.js
 * 
 * =========================================================================
 * ⚙️ PRODUCTION DEPLOYMENT INSTRUCTIONS:
 * =========================================================================
 * 1. Deploy your backend to Render.
 * 2. Copy your Render service URL (e.g. https://devilcart-backend.onrender.com).
 * 3. Replace the BACKEND_PROD_URL below with your Render URL + '/api'.
 * 4. Deploy your frontend to Vercel.
 * =========================================================================
 */

const DEVILCART_CONFIG = {
  // Configurable production backend API base URL
  BACKEND_PROD_URL: 'https://devilcart-backend.onrender.com/api'
};

/**
 * Dynamically resolves the API base URL depending on execution environment:
 * - When served directly by the Express backend -> '/api'
 * - When running on local dev machine (Live Server / localhost) -> 'http://localhost:5000/api'
 * - When deployed on Vercel or cloud CDN -> configured DEVILCART_CONFIG.BACKEND_PROD_URL
 */
function getApiBaseUrl() {
  if (typeof window !== 'undefined') {
    // 1. Check if window explicitly sets an override
    if (window.__DEVILCART_API_URL__) {
      return window.__DEVILCART_API_URL__.replace(/\/+$/, '');
    }

    const { hostname, port } = window.location;

    // 2. If running on same port 5000 (Express backend serving static frontend)
    if (port === '5000') {
      return '/api';
    }

    // 3. If running locally (VSCode Live Server, 127.0.0.1, or custom local port)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }

    // 4. Cloud Deployment (Vercel / Netlify / Custom Domain)
    if (DEVILCART_CONFIG.BACKEND_PROD_URL) {
      return DEVILCART_CONFIG.BACKEND_PROD_URL.replace(/\/+$/, '');
    }
  }

  return 'http://localhost:5000/api';
}

// Expose globally
if (typeof window !== 'undefined') {
  window.DEVILCART_CONFIG = DEVILCART_CONFIG;
  window.getApiBaseUrl = getApiBaseUrl;
}
