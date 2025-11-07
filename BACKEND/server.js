require('dotenv').config();
const express = require('express');
const http = require('http');
const helmet = require('helmet'); // security headers
const cors = require('cors');
const rateLimit = require('express-rate-limit'); //Prevent DDoS, brute force
const connectDB = require('./config/database');
const { createHttpsServer } = require('./config/https');


// creates express application
const app = express();

// connect to Database
connectDB();

// CORS Configuration - SINGLE unified configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or same-origin)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'https://localhost:3000',
      process.env.FRONTEND_URL
    ].filter(Boolean); // Remove undefined values
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));


// this sets important HTTP security headers
app.use(helmet());
app.use(helmet.hsts({ //forces HTTPS
  maxAge: 31536000,
  includeSubDomains: true,
  preload: true
}));
app.use(helmet.frameguard({ action: 'deny' })); // this prevents clickjacking
app.use(helmet.contentSecurityPolicy({ //prevents XSS attacks
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", 'data:', 'https:'],
  }
}));

// CORS Configuration, for establishing communication of frontend with backend.
//this makes sure that the frontend requests are allowed.


// using rate limiting to protect against bots, spam, and hackers.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limiting each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true
});

// allows the server to read JSON reques
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Redirect HTTP to HTTPS (if SSL is enabled)
if (process.env.SSL_ENABLED === 'true') {
  app.use((req, res, next) => {
    if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
      // Set CORS headers before redirect
      res.header('Access-Control-Allow-Origin', req.headers.origin || 'https://localhost:3000');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
      
      const httpsUrl = `https://${req.headers.host.replace(/:\d+$/, '')}:${process.env.HTTPS_PORT || 5443}${req.url}`;
      return res.redirect(301, httpsUrl);
    }
    next();
  });
}

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    protocol: req.protocol,
    secure: req.secure,
    timestamp: new Date().toISOString()
  });
});


// shows the API information
app.get('/', (req, res) => {
  res.json({
    message: 'Customer International Payments Portal API',
    version: '1.0.0',
    status: 'Active'
  });
});


// API routes
const customerRoutes = require("./routes/customerRoutes");
app.use("/api/customer", customerRoutes);

const employeeRoutes = require('./routes/employeeRoutes');
app.use('/api/employee', employeeRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});


app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(err.status || 500).json({
    success: false,
    message: errorMessage,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});


// Start Servers
const HTTPS_PORT = process.env.HTTPS_PORT || 5443;

// Create and start HTTPS server only
const httpsServer = createHttpsServer(app);
if (httpsServer) {
  httpsServer.listen(HTTPS_PORT, () => {
    console.log(`\n🔒 HTTPS Server running on port ${HTTPS_PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 HTTPS: https://localhost:${HTTPS_PORT}`);
    console.log(`💚 Health Check: https://localhost:${HTTPS_PORT}/health\n`);
  });
} else {
  console.error('❌ HTTPS server creation failed!');
  process.exit(1);
}


process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // close server & exit process
  process.exit(1);
});
