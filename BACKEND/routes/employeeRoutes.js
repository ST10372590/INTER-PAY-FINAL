// this is the express router file for handling employee authentication and profile.
const express = require('express');
const router = express.Router();
const {
  loginEmployee,
  getEmployeeProfile,
  logoutEmployee,
  getDashboardStats, 
  getPendingTransactions,
  getTransactionById,
  verifyTransaction,
  rejectTransaction,
  submitToSwift,
  getAllTransactions
} = require('../controllers/employeeController');
const { authenticate, isEmployee, hasPermission } = require('../middleware/auth');

//public routes to allow employee to login
//POST /api/employee/login
router.post('/login', loginEmployee);

//these routes below are not public so they require authentication to be used
//GET /api/employee/profile
router.get('/profile', authenticate, isEmployee, getEmployeeProfile);


//POST /api/employee/logout
router.post('/logout', authenticate, isEmployee, logoutEmployee);

//GET /api/employee/dashboard
router.get('/dashboard', getDashboardStats);

//GET /api/employee/pending-transactions
router.get('/pending-transactions', getPendingTransactions);

//GET /api/employee/transaction/:id
router.get('/transaction/:id', getTransactionById);

// PUT /api/employee/verify-transaction/:id
router.put('/verify-transaction/:id', authenticate, isEmployee,  hasPermission('verify_transactions'), verifyTransaction);

// PUT /api/employee/reject-transaction/:id
router.put('/reject-transaction/:id', authenticate, isEmployee, hasPermission('verify_transactions'), rejectTransaction);

//POST /api/employee/submit-to-swift
router.post('/submit-to-swift', authenticate, isEmployee, hasPermission('submit_to_swift'), submitToSwift);

// GET /api/employee/transactions
router.get('/transactions', authenticate, isEmployee, hasPermission('view_all_transactions'), getAllTransactions);
module.exports = router;



/*

// this is the express router file for handling employee authentication and profile.
const express = require('express');
const router = express.Router();
const {
  loginEmployee,
  getEmployeeProfile,
  logoutEmployee,
  getDashboardStats, 
  getPendingTransactions,
  getTransactionById,
  verifyTransaction,
  rejectTransaction
} = require('../controllers/employeeController');
const { authenticate, isEmployee, hasPermission } = require('../middleware/auth');

//public routes to allow employee to login
//POST /api/employee/login
router.post('/login', loginEmployee);

//these routes below are not public so they require authentication to be used
//GET /api/employee/profile
router.get('/profile', authenticate, isEmployee, getEmployeeProfile);


//POST /api/employee/logout
router.post('/logout', authenticate, isEmployee, logoutEmployee);

//GET /api/employee/dashboard
router.get('/dashboard', getDashboardStats);

//GET /api/employee/pending-transactions
router.get('/pending-transactions', getPendingTransactions);

//GET /api/employee/transaction/:id
router.get('/transaction/:id', getTransactionById);

// PUT /api/employee/verify-transaction/:id
router.put('/verify-transaction/:id', authenticate, isEmployee,  hasPermission('verify_transactions'), verifyTransaction);

// PUT /api/employee/reject-transaction/:id
router.put('/reject-transaction/:id', authenticate, isEmployee, hasPermission('verify_transactions'), rejectTransaction);


module.exports = router;
*/