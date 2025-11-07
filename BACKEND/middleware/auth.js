const { verifyToken, extractToken } = require('../utils/jwt'); //using the functions to handle tokens.
//database models to check users account details 
const Customer = require('../models/Customer');
const Employee = require('../models/Employee');


const authenticate = async (req, res, next) => {
  try {
    
    const authHeader = req.headers.authorization; //gets the token from the header in jwt.
  
    console.log('Auth header:', authHeader); // Debug log
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No authentication token found. Please login again.'
            });
        }
  
  
    const token = extractToken(authHeader); //removes the anything before the token and stores just the token.

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // verifying the token with the function in jwt.js.
    const decoded = verifyToken(token);

    // places the user info to req.user
    req.user = {
      id: decoded.id,
      role: decoded.role,
      userType: decoded.userType 
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Invalid or expired token'
    });
  }
}; //(Didin, 2025)

//this checks if the user is a customer or not
const isCustomer = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.userType !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Customer privileges required.'
      });
    }

    //this fetches the full customer record from the db.
    const customer = await Customer.findById(req.user.id)
      .populate('role_id', 'role_name permissions');


    //checks if the customer exists or is active
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (!customer.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    } 

    if (customer.is_locked) {
      return res.status(403).json({
        success: false,
        message: 'Account is locked. Please contact support.'
      });
    }


    // and then stores it to req.customer to use in routes.
    req.customer = customer;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error verifying customer access'
    });
  }
}; //(FreeCodeCamp, 2023)


//checks if user is an employee
const isEmployee = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.userType !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Employee privileges required.'
      });
    }

    // Optionally fetch full employee details
    const employee = await Employee.findById(req.user.id)
      .populate('role_id', 'role_name permissions');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    if (!employee.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    if (employee.is_locked) {
      return res.status(403).json({
        success: false,
        message: 'Account is locked. Please contact administrator.'
      });
    }

    req.employee = employee;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error verifying employee access'
    });
  }
};


//this checks if user has certain permissions in the website 
const hasPermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // getting the user's role and permissions to prepare for website permissions check.
      let userRole;
      if (req.customer) {
        userRole = req.customer.role_id;
      } else if (req.employee) {
        userRole = req.employee.role_id;
      } else {
       
        const userId = req.user.id;
        const userType = req.user.userType;
        
        //using the roles permissions to validate the access.
        if (userType === 'customer') {
          const customer = await Customer.findById(userId).populate('role_id');
          userRole = customer.role_id;
        } else if (userType === 'employee') {
          const employee = await Employee.findById(userId).populate('role_id');
          userRole = employee.role_id;
        }
      }

      if (!userRole || !userRole.permissions) {
        return res.status(403).json({
          success: false,
          message: 'No permissions found for user'
        });
      }

      // checks if the user has the required permissions
      if (!userRole.permissions.includes(permission)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. '${permission}' permission required.`
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error checking permissions'
      });
    }
  };
};


//using brute force protection to handle the number of time users can have login attempts and locking account for 30mins
const handleLoginAttempt = async (user, loginSuccessful) => {
  const MAX_ATTEMPTS = 5;
  const LOCK_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds

  // checks if account is currently locked
  if (user.is_locked && user.locked_until) {
    const now = new Date();
    if (now < user.locked_until) {
      
      const remainingTime = Math.ceil((user.locked_until - now) / 60000);
      throw new Error(`Account is locked. Try again in ${remainingTime} minutes.`);
    } else {
      // when the lock time has expired, unlock account.
      user.is_locked = false;
      user.locked_until = null;
      user.failed_login_attempts = 0;
    }
  }

  if (loginSuccessful) {
   
    user.failed_login_attempts = 0;
    user.is_locked = false;
    user.locked_until = null;
    user.last_login = new Date();
  } else {
    // incrementing failed attempts
    user.failed_login_attempts += 1;

    if (user.failed_login_attempts >= MAX_ATTEMPTS) {
      // here the account gets locked after the max reached of attempts.
      user.is_locked = true;
      user.locked_until = new Date(Date.now() + LOCK_TIME);
      await user.save();
      throw new Error('Too many failed login attempts. Account locked for 30 minutes.');
    }
  }

  await user.save();
};

module.exports = {
  authenticate,
  isCustomer,
  isEmployee,
  hasPermission,
  handleLoginAttempt
}; //making then accessible


/*
References:
Didin, J. 2025. Build a Secure REST API with Node.js, Express, MongoDB, and JWT, 16 May 2025. [Online]. Available at: https://www.djamware.com/post/6826fc85f9614f0a093d9cba/build-a-secure-rest-api-with-nodejs-express-mongodb-and-jwt [Accessed 2 October 2025].
FreeCodeCamp. 2023. How to Secure Your MERN Stack App with JWT-Based User Authentication and Authorization, 15 May 2023. [Online]. Available at: https://www.freecodecamp.org/news/how-to-secure-your-mern-stack-application/ [Accessed 2 October 2025].
*/