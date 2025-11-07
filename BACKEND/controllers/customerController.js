const Customer = require('../models/Customer');
const Role = require('../models/Role');
const { hashPassword, comparePassword, encrypt } = require('../utils/encryption'); //Passwording hashing, etc.
const { validateMultiple, checkPasswordStrength } = require('../utils/validation'); //using RegEx validation
const { generateToken } = require('../utils/jwt'); // using JWT Authentication
const { handleLoginAttempt } = require('../middleware/auth'); //to handle permissons

//route: POST /api/customer/register
//this the API that creates a new customer registration
const registerCustomer = async (req, res) => {
  try {
    const { full_name, id_number, account_number, username, password } = req.body;

    // here we are first validating the inputs with RegEx, using the function validateMultiple 
    const validation = validateMultiple(
      { full_name, id_number, account_number, username, password },
      ['full_name', 'id_number', 'account_number', 'username', 'password']
    );
    //return error
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // after that the system must check the password strength and provides feeback
    const passwordCheck = checkPasswordStrength(password);
    if (!passwordCheck.isStrong) {
      return res.status(400).json({
        success: false,
        message: 'Password is not strong enough',
        feedback: passwordCheck.feedback
      });
    }

    // checks if the username already exists in the database
    const existingUsername = await Customer.findOne({ 
      username: username.toLowerCase() 
    });

    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists'
      });
    }

      // Generate unique customer_id
    const lastCustomer = await Customer.findOne().sort({ createdAt: -1 });
    let newCustomerId;
    
    if (lastCustomer && lastCustomer.customer_id) {
      const lastIdNumber = parseInt(lastCustomer.customer_id.replace('CUST', ''));
      const nextIdNumber = lastIdNumber + 1;
      newCustomerId = `CUST${nextIdNumber.toString().padStart(4, '0')}`;
    } else {
      newCustomerId = 'CUST0001'; // First customer
    }

    // it then fetches data from the role table to assign the customer role to the new user
    const customerRole = await Role.findOne({ role_name: 'customer' });
    if (!customerRole) {
      return res.status(500).json({
        success: false,
        message: 'Customer role not found. Please run database seeding.'
      });
    }

    // hashing and salting the password before saving it to the database
    const password_hash = await hashPassword(password);

    //saves the data into the DB and encrypts the id number and account number
   const customer = await Customer.create({
      customer_id: newCustomerId, // FIXED: Added customer_id
      full_name,
      id_number,  // Will be encrypted by schema setter
      account_number,  // Will be encrypted by schema setter
      username: username.toLowerCase(),
      password_hash,
      role_id: customerRole._id
    });

     console.log('Customer registered successfully:', newCustomerId);

     // Return success message
    res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      data: {
        customer_id: customer.customer_id,
        full_name: customer.full_name,
        username: customer.username,
        created_at: customer.createdAt
      }
    });

  } catch (error) {
     console.error('Registration error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `${field} already exists`
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error registering customer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; //(Didin, 2025)

//POST /api/customer/login
//this the API that logs a user in.
const loginCustomer = async (req, res) => {
  try {
    const { username, account_number, password } = req.body;
    console.log('Login attempt:', { username, account_number: account_number.substring(0, 3) + '***' });

    // makes sure there arent empty fields
    if (!username || !account_number || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, account number, and password'
      });
    }

    // finding the customer inside the db by username.
    const customer = await Customer.findOne({ 
      username: username.toLowerCase() 
    })
      .select('+password_hash') //making the hashed password available to authenticate customer.
      .populate('role_id', 'role_name permissions'); //fetchs the details customers role and permissions.

       console.log('Customer found:', customer ? 'Yes' : 'No');

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });  //(Devrani, 2025)
    }

    // decrypting the account number inside db and compare it, to validate.
    const decryptedAccountNumber = customer.getDecryptedAccountNumber();
     console.log('Account number match:', decryptedAccountNumber === account_number);
    if (decryptedAccountNumber !== account_number) {
      
      await handleLoginAttempt(customer, false); //increments if user failed a login attempt
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

   

    // verifying the  password
    const isPasswordValid = await comparePassword(password, customer.password_hash);
     console.log('Password valid:', isPasswordValid);
    if (!isPasswordValid) {
      //increment the failed login attempt
      await handleLoginAttempt(customer, false);
      
      const remainingAttempts = 5 - customer.failed_login_attempts;
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        remaining_attempts: remainingAttempts > 0 ? remainingAttempts : 0
      });
    }

    //checking if the account is locked for the brute protection 
    if (customer.is_locked && customer.locked_until) {
      const now = new Date();
      if (now < customer.locked_until) {
        const remainingTime = Math.ceil((customer.locked_until - now) / 60000);
        return res.status(403).json({
          success: false,
          message: `Account is locked. Try again in ${remainingTime} minutes.`
        });
      }
    }

    // if login was successful we reset failed attempts to 0
    await handleLoginAttempt(customer, true);

    // after that we get the JWT token
    const token = generateToken({
      id: customer._id,
      username: customer.username,
      role: customer.role_id.role_name,
      userType: 'customer'
    });

    // retrun success message with token
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        customer_id: customer._id,
        full_name: customer.full_name,
        username: customer.username,
        role: customer.role_id.role_name,
        last_login: customer.last_login
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error logging in',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; //(Patel, 2024)


//GET /api/customer/profile
//show the customer their personal infor, without reveal sensitive info
const getCustomerProfile = async (req, res) => { 
  try {
    const customer = await Customer.findById(req.user.id) //finds the customer by using req.user.id in the auth.js).
      .populate('role_id', 'role_name permissions');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    //returns the customer information
    res.status(200).json({
      success: true,
      data: {
        customer_id: customer._id,
        full_name: customer.full_name,
        username: customer.username,
        masked_account_number: customer.masked_account_number,
        role: customer.role_id.role_name,
        is_active: customer.is_active,
        last_login: customer.last_login,
        created_at: customer.createdAt
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


//POST /api/customer/logout
//logout is handled in the frontend by deleting the token so this function only return suceess/failure messages
const logoutCustomer = async (req, res) => {
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





module.exports = {
  registerCustomer,
  loginCustomer,
  getCustomerProfile,
  logoutCustomer
}; //making the functions available


/*
References:
Patel, R. 2024. Building a Secure User Registration and Login API with Express.js ,MongoDB and JWT, 13 March 2024. [Online]. Available at: https://medium.com/@finnkumar6/mastering-user-authentication-building-a-secure-user-schema-with-mongoose-and-bcrypt-539b9394e5d9 [Accessed 2 October 2025].
Devrani, R. 2025. Node Js: Jwt Authentication and refresh token, 21 July 2025. [Online]. Available at: https://javascript.plainenglish.io/node-js-jwt-authentication-and-refresh-token-437f4cef20f6 [Accessed 2 October 2025].
Didin, J. 2025. Build a Secure REST API with Node.js, Express, MongoDB, and JWT, 16 May 2025. [Online]. Available at: https://www.djamware.com/post/6826fc85f9614f0a093d9cba/build-a-secure-rest-api-with-nodejs-express-mongodb-and-jwt [Accessed 2 October 2025].
*/