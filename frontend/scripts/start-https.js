// frontend/scripts/start-https.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Set environment variables for HTTPS
process.env.HTTPS = 'true';
process.env.SSL_CRT_FILE = path.resolve(__dirname, '../../certificates/server.crt');
process.env.SSL_KEY_FILE = path.resolve(__dirname, '../../certificates/server.key');

// Check if certificate files exist
if (!fs.existsSync(process.env.SSL_CRT_FILE)) {
  console.error('SSL certificate not found:', process.env.SSL_CRT_FILE);
  console.log('Run: npm run start (for HTTP)');
  process.exit(1);
}

if (!fs.existsSync(process.env.SSL_KEY_FILE)) {
  console.error('SSL key not found:', process.env.SSL_KEY_FILE);
  console.log('Run: npm run start (for HTTP)');
  process.exit(1);
}

console.log('Starting React with HTTPS...');
console.log('Certificate:', process.env.SSL_CRT_FILE);
console.log('Key:', process.env.SSL_KEY_FILE);

// Start react-scripts
require('react-scripts/scripts/start');