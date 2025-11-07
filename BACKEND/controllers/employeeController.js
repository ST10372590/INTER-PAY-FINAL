const Employee = require('../models/Employee');
const { comparePassword } = require('../utils/encryption'); //checks if the entered password matches.
const { generateToken } = require('../utils/jwt'); // creates token for authentication
const { handleLoginAttempt } = require('../middleware/auth'); //keeps track of failed login attempts
const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');


//POST /api/employee/login
// function to login the employee
const loginEmployee = async (req, res) => {
  try {
    const { username, password } = req.body; //gets the username and password

    //makes sure there arent any empty fields inputs
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }

    // finding the employee by id or username
    const employee = await Employee.findOne({
      $or: [
        { username: username.toLowerCase() },
        { employee_id: username.toUpperCase() }
      ]
    })
      .select('+password_hash')
      .populate('role_id', 'role_name permissions');

    if (!employee) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // checks if the employee account active
    if (!employee.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    // checks if account is locked and displays a message if it is
    if (employee.is_locked && employee.locked_until) {
      const now = new Date();
      if (now < employee.locked_until) {
        const remainingTime = Math.ceil((employee.locked_until - now) / 60000);
        return res.status(403).json({
          success: false,
          message: `Account is locked. Try again in ${remainingTime} minutes.`
        });
      }
    }

    // verifying and comparing the password
    const isPasswordValid = await comparePassword(password, employee.password_hash);
    
    if (!isPasswordValid) {
      
      await handleLoginAttempt(employee, false);
      
      const remainingAttempts = 5 - employee.failed_login_attempts;
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        remaining_attempts: remainingAttempts > 0 ? remainingAttempts : 0
      });
    }

    // if login was successful we reset failed attempts to 0
    await handleLoginAttempt(employee, true);

    // Step 7: Generate JWT token
    const token = generateToken({
      id: employee._id,
      username: employee.username,
      employee_id: employee.employee_id,
      role: employee.role_id.role_name,
      userType: 'employee',
      department: employee.department,
      permissions: employee.role_id.permissions
    });

    // after that we get the JWT token
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        employee_id: employee._id,
        employee_name: employee.employee_name,
        username: employee.username,
        emp_id: employee.employee_id,
        role: employee.role_id.role_name,
        department: employee.department,
        permissions: employee.role_id.permissions,
        last_login: employee.last_login
      }
    });

  } catch (error) {
    console.error('Employee login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error logging in',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



//GET /api/employee/profile
//show the employee their personal infor, without reveal sensitive info
const getEmployeeProfile = async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.id) //finds the employee by using req.user.id in the auth.js).
      .populate('role_id', 'role_name permissions');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    //returns the employee information
    res.status(200).json({
      success: true,
      data: {
        employee_id: employee._id,
        employee_name: employee.employee_name,
        username: employee.username,
        emp_id: employee.employee_id,
        role: employee.role_id.role_name,
        permissions: employee.role_id.permissions,
        is_active: employee.is_active,
        last_login: employee.last_login,
        created_at: employee.createdAt
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
};

//POST /api/employee/logout
//logout is handled in the frontend by deleting the token so this function only return suceess/failure messages
const logoutEmployee = async (req, res) => {
  try {
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging out'
    });
  }
};


// GET /api/employee/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const pendingCount = await Transaction.countDocuments({ status: 'Pending' });
    const verifiedCount = await Transaction.countDocuments({ status: 'Verified' });
    const submittedToday = await Transaction.countDocuments({
      status: 'Submitted',
      submittedAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    });

    // Get recent pending transactions (last 5)
    const recentPending = await Transaction.find({ status: 'Pending' })
      .populate('customerId', 'full_name account_number')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('amount currency beneficiaryName createdAt referenceNumber');

    res.status(200).json({
      success: true,
      data: {
        stats: {
          pendingTransactions: pendingCount,
          verifiedTransactions: verifiedCount,
          submittedToday: submittedToday
        },
        recentPending
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
};

//GET /api/employee/pending-transactions
const getPendingTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const transactions = await Transaction.find({ status: 'Pending' })
      .populate('customer_id', 'full_name account_number username')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments({ status: 'Pending' });

    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalTransactions: total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get pending transactions error:', error);
    console.error('Full error:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending transactions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// GET /api/employee/transaction/:id
const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('customer_id', 'full_name account_number username id_number')
      .populate('verified_by', 'employee_name username');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });

  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction details'
    });
  }
};


// PUT /api/employee/verify-transaction/:id
//https://localhost:5443/api/employee/verify-transaction/690c66eb41645e62084627d7
const verifyTransaction = async (req, res) => {
  try {
    const { verification_notes } = req.body;

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Transaction cannot be verified. Current status: ${transaction.status}`
      });
    }

    transaction.status = 'Verified';
    transaction.verified_by = req.user.id;
    transaction.verified_at = Date.now();
    
    if (verification_notes) {
      transaction.verification_notes = verification_notes;
    }

    await transaction.save();

    const updatedTransaction = await Transaction.findById(transaction._id)
      .populate('customer_id', 'full_name account_number')
      .populate('verified_by', 'employee_name username');

    res.status(200).json({
      success: true,
      message: 'Transaction verified successfully',
      data: updatedTransaction
    });

  } catch (error) {
    console.error('Verify transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying transaction'
    });
  }
};

// PUT /api/employee/reject-transaction/:id
const rejectTransaction = async (req, res) => {
  try {
    const { rejection_reason } = req.body;

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (transaction.status === 'submitted' ) {
      return res.status(400).json({
        success: false,
        message: 'Transaction cannot be rejected at this stage'
      });
    }

    transaction.status = 'rejected';
    transaction.verified_by = req.user.id;
    transaction.rejection_reason = rejection_reason;
    transaction.verified_at = Date.now();

    await transaction.save();

    const updatedTransaction = await Transaction.findById(transaction._id)
      .populate('customer_id', 'full_name account_number')
      .populate('verified_by', 'employee_name username');

    res.status(200).json({
      success: true,
      message: 'Transaction rejected',
      data: updatedTransaction
    });

  } catch (error) {
    console.error('Reject transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting transaction'
    });
  }
};

const submitToSwift = async (req, res ) => {
  try{
    const { transaction_ids } = req.body;

    
    if (!transaction_ids || !Array.isArray(transaction_ids) || transaction_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "transaction_ids array is required and must not be empty"
      });
    }

    const transactions = await Transaction.find({
      _id: { $in: transaction_ids },
      status: 'verified'
    });

    if (transactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No verified transactions found'
      });
    }

    if (transactions.length !== transaction_ids.length) {
      const foundIds = transactions.map(t => t._id.toString());
      const notFoundIds = transaction_ids.filter(id => !foundIds.includes(id));
      
      return res.status(400).json({
        success: false,
        message: 'Some transactions are not in verified status or do not exist',
        notFoundIds: notFoundIds
      });
    }

    const submitted_at = Date.now();
    
   await Transaction.updateMany(
      { _id: { $in: transaction_ids } },
      {
        $set: {
          status: 'submitted',
          submitted_at: submitted_at
        }
      }
    );
  

  res.status(200).json({
      success: true,
      message: `${transactions.length} transaction(s) submitted to SWIFT successfully`,
      data: {
        submittedCount: transactions.length,
        submitted_at: submitted_at,
        transaction_ids: transaction_ids
      }
    });

  } catch (error) {
    console.error('Submit to SWIFT error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting transactions to SWIFT',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// GET /api/employee/transactions
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('customer_id', 'full_name account_number username')
      .populate('verified_by', 'employee_name username')
      .sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      data: {
        transactions,
        total: transactions.length
      }
    });

  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
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
}; //making the functions available






/*

const Employee = require('../models/Employee');
const { comparePassword } = require('../utils/encryption'); //checks if the entered password matches.
const { generateToken } = require('../utils/jwt'); // creates token for authentication
const { handleLoginAttempt } = require('../middleware/auth'); //keeps track of failed login attempts
const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');


//POST /api/employee/login
// function to login the employee
const loginEmployee = async (req, res) => {
  try {
    const { username, password } = req.body; //gets the username and password

    //makes sure there arent any empty fields inputs
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }

    // finding the employee by id or username
    const employee = await Employee.findOne({
      $or: [
        { username: username.toLowerCase() },
        { employee_id: username.toUpperCase() }
      ]
    })
      .select('+password_hash')
      .populate('role_id', 'role_name permissions');

    if (!employee) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // checks if the employee account active
    if (!employee.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    // checks if account is locked and displays a message if it is
    if (employee.is_locked && employee.locked_until) {
      const now = new Date();
      if (now < employee.locked_until) {
        const remainingTime = Math.ceil((employee.locked_until - now) / 60000);
        return res.status(403).json({
          success: false,
          message: `Account is locked. Try again in ${remainingTime} minutes.`
        });
      }
    }

    // verifying and comparing the password
    const isPasswordValid = await comparePassword(password, employee.password_hash);
    
    if (!isPasswordValid) {
      
      await handleLoginAttempt(employee, false);
      
      const remainingAttempts = 5 - employee.failed_login_attempts;
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        remaining_attempts: remainingAttempts > 0 ? remainingAttempts : 0
      });
    }

    // if login was successful we reset failed attempts to 0
    await handleLoginAttempt(employee, true);

    // Step 7: Generate JWT token
    const token = generateToken({
      id: employee._id,
      username: employee.username,
      employee_id: employee.employee_id,
      role: employee.role_id.role_name,
      userType: 'employee',
      department: employee.department,
      permissions: employee.role_id.permissions
    });

    // after that we get the JWT token
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        employee_id: employee._id,
        employee_name: employee.employee_name,
        username: employee.username,
        emp_id: employee.employee_id,
        role: employee.role_id.role_name,
        department: employee.department,
        permissions: employee.role_id.permissions,
        last_login: employee.last_login
      }
    });

  } catch (error) {
    console.error('Employee login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error logging in',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



//GET /api/employee/profile
//show the employee their personal infor, without reveal sensitive info
const getEmployeeProfile = async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.id) //finds the employee by using req.user.id in the auth.js).
      .populate('role_id', 'role_name permissions');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    //returns the employee information
    res.status(200).json({
      success: true,
      data: {
        employee_id: employee._id,
        employee_name: employee.employee_name,
        username: employee.username,
        emp_id: employee.employee_id,
        role: employee.role_id.role_name,
        permissions: employee.role_id.permissions,
        is_active: employee.is_active,
        last_login: employee.last_login,
        created_at: employee.createdAt
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
};

//POST /api/employee/logout
//logout is handled in the frontend by deleting the token so this function only return suceess/failure messages
const logoutEmployee = async (req, res) => {
  try {
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging out'
    });
  }
};


// GET /api/employee/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const pendingCount = await Transaction.countDocuments({ status: 'pending' });
    const verifiedCount = await Transaction.countDocuments({ status: 'verified' });
    const rejectedCount = await Transaction.countDocuments({ status: 'rejected' });

    const recentPending = await Transaction.find({ status: 'pending' })
      .populate('customerId', 'full_name account_number')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('amount currency beneficiaryName createdAt referenceNumber');

    res.status(200).json({
      success: true,
      data: {
        stats: {
          pendingTransactions: pendingCount,
          verifiedTransactions: verifiedCount,
          rejectedTransactions: rejectedCount,
        },
        recentPending,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
    });
  }
};


//GET /api/employee/pending-transactions
const getPendingTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const transactions = await Transaction.find({ status: 'Pending' })
      .populate('customer_id', 'full_name account_number username')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments({ status: 'Pending' });

    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalTransactions: total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get pending transactions error:', error);
    console.error('Full error:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending transactions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// GET /api/employee/transaction/:id
const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('customer_id', 'full_name account_number username id_number')
      .populate('verified_by', 'employee_name username');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });

  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction details'
    });
  }
};


// PUT /api/employee/verify-transaction/:id
//https://localhost:5443/api/employee/verify-transaction/690c66eb41645e62084627d7
const verifyTransaction = async (req, res) => {
  try {
    const { verification_notes } = req.body;

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Transaction cannot be verified. Current status: ${transaction.status}`
      });
    }

    transaction.status = 'Verified';
    transaction.verified_by = req.user.id;
    transaction.verified_at = Date.now();
    
    if (verification_notes) {
      transaction.verification_notes = verification_notes;
    }

    await transaction.save();

    const updatedTransaction = await Transaction.findById(transaction._id)
      .populate('customer_id', 'full_name account_number')
      .populate('verified_by', 'employee_name username');

    res.status(200).json({
      success: true,
      message: 'Transaction verified successfully',
      data: updatedTransaction
    });

  } catch (error) {
    console.error('Verify transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying transaction'
    });
  }
};

// PUT /api/employee/reject-transaction/:id
const rejectTransaction = async (req, res) => {
  try {
    const { rejection_reason } = req.body;

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (transaction.status === 'submitted' ) {
      return res.status(400).json({
        success: false,
        message: 'Transaction cannot be rejected at this stage'
      });
    }

    transaction.status = 'rejected';
    transaction.verified_by = req.user.id;
    transaction.rejection_reason = rejection_reason;
    transaction.verified_at = Date.now();

    await transaction.save();

    const updatedTransaction = await Transaction.findById(transaction._id)
      .populate('customer_id', 'full_name account_number')
      .populate('verified_by', 'employee_name username');

    res.status(200).json({
      success: true,
      message: 'Transaction rejected',
      data: updatedTransaction
    });

  } catch (error) {
    console.error('Reject transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting transaction'
    });
  }
};


module.exports = {
  loginEmployee,
  getEmployeeProfile,
  logoutEmployee, 
  getDashboardStats,
  getPendingTransactions,
  getTransactionById,
  verifyTransaction,
  rejectTransaction
}; //making the functions available
*/