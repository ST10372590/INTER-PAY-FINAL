require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');

/**
 * Create HTTPS server with SSL certificates
 * @param {Object} app - Express app instance
 * @returns {Object} - HTTPS server instance or null
 */
const createHttpsServer = (app) => {
  try {
    // Check if SSL is enabled
    if (process.env.SSL_ENABLED !== 'true') {
      console.log('ℹ️  SSL is disabled. Running HTTP only.');
      return null;
    }

    // Get certificate paths (resolve from the config directory)
    const keyPath = path.resolve(__dirname, '..', process.env.SSL_KEY_PATH);
    const certPath = path.resolve(__dirname, '..', process.env.SSL_CERT_PATH);

    console.log('🔍 Looking for SSL key at:', keyPath);
    console.log('🔍 Looking for SSL cert at:', certPath);

    // Check if certificate files exist
    if (!fs.existsSync(keyPath)) {
      console.error(`❌ SSL key file not found: ${keyPath}`);
      console.log('ℹ️  Running HTTP only.');
      return null;
    }

    if (!fs.existsSync(certPath)) {
      console.error(`❌ SSL certificate file not found: ${certPath}`);
      console.log('ℹ️  Running HTTP only.');
      return null;
    }

    // Read certificate files
    const privateKey = fs.readFileSync(keyPath, 'utf8');
    const certificate = fs.readFileSync(certPath, 'utf8');

    const credentials = {
      key: privateKey,
      cert: certificate
    };

    // Create HTTPS server
    const httpsServer = https.createServer(credentials, app);

    console.log('✅ HTTPS server configured successfully');
    return httpsServer;

  } catch (error) {
    console.error('❌ Error creating HTTPS server:', error.message);
    console.log('ℹ️  Falling back to HTTP only.');
    return null;
  }
};

module.exports = { createHttpsServer };