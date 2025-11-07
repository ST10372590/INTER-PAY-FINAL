const jwt = require('jsonwebtoken'); //this is used to used to transfer data between the frontend and backend.

//this function creates a JWT token for users when they login
const generateToken = (payload, expiresIn = null) => { //takes in the user data
  const secret = process.env.JWT_SECRET; //retrieving from env file.
  
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const options = {
    expiresIn: process.env.JWT_EXPIRES_IN 
  };

  return jwt.sign(payload, secret, options); //returns the token
};

//this function checks if the token is valid
const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  try {
    return jwt.verify(token, secret); //checks if the token signature matches
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

//this function reads the token payload without checking if it’s valid.
const decodeToken = (token) => {
  return jwt.decode(token);
};


//gets the token from the header
const extractToken = (authHeader) => {
  if (!authHeader) {
    return null;
  }

  // when the token starts with "Bearer" it should extract the next 7 characters after that
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }


  return authHeader; //returns the token
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
  extractToken
}; //making the functions accessible to all files.