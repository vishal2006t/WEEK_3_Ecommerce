/**
 * DevilCart - Database Module Re-export
 * File: backend/db.js
 * 
 * Re-exports the unified database pool and query helper from backend/config/db.js
 * to ensure 100% backward and forward compatibility with all scripts and routes.
 */

const dbConfig = require('./config/db');

module.exports = dbConfig;
