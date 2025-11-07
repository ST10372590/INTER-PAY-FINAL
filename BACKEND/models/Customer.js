const mongoose = require('mongoose'); //this is the library that helps us to interact with mongodb
const { encrypt, decrypt } = require('../utils/encryption');

const customerSchema = new mongoose.Schema({
    customer_id: {
    type: String,
    required: [true, 'Customer ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^CUST[0-9]{4,6}$/, 'Customer ID must be in format CUST followed by 4-6 digits']
  },

  full_name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters'],
    maxlength: [100, 'Full name cannot exceed 100 characters'],
    match: [/^[a-zA-Z\s\-']+$/, 'Full name can only contain letters, spaces, hyphens, and apostrophes']
  },
  id_number: {
    type: String,
    required: [true, 'ID number is required'],
    unique: true,
    // encrypted
    set: function(value) {
      try {
        // Only encrypt if value is not already encrypted
        if (value && typeof value === 'string' && !value.includes(':')) {
          const encrypted = encrypt(value);
          console.log('Encrypted id_number successfully');
          return encrypted;
        }
        return value;
      } catch (error) {
        console.error('Error encrypting id_number:', error);
        throw new Error('Failed to encrypt ID number');
      }
    }
  },
  account_number: {
    type: String,
    required: [true, 'Account number is required'],
    unique: true,
     set: function(value) {
      try {
        // Only encrypt if value is not already encrypted
        if (value && typeof value === 'string' && !value.includes(':')) {
          const encrypted = encrypt(value);
          console.log('Encrypted account_number successfully');
          return encrypted;
        }
        return value;
      } catch (error) {
        console.error('Error encrypting account_number:', error);
        throw new Error('Failed to encrypt account number');
      }
    }
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  password_hash: {
    type: String,
    required: [true, 'Password is required'],
    select: false // password must not be shown by default
  },
  role_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
   // these fields are for brute force protection 
  is_active: {
    type: Boolean,
    default: true
  },
  is_locked: {
    type: Boolean,
    default: false
  },
  locked_until: {
    type: Date,
    default: null
  },
  failed_login_attempts: {
    type: Number,
    default: 0
  },
  last_login: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

//(Patel, 2024)

// makes sure that the system is fast when lookinh for these fields
customerSchema.index({ username: 1 });
customerSchema.index({ account_number: 1 });
customerSchema.index({ role_id: 1 });
customerSchema.index({ customer_id: 1 });

// decrypting the id number for when it is needed
customerSchema.methods.getDecryptedIdNumber = function() {
  return decrypt(this.id_number);
};

// decrypting the acc number for when it is needed
customerSchema.methods.getDecryptedAccountNumber = function() {
  return decrypt(this.account_number);
};

// this is virtual method for making the account numbers to only show the last four digits 
// in the ui 
customerSchema.virtual('masked_account_number').get(function() {
  try {
    const decrypted = decrypt(this.account_number);
    const lastFour = decrypted.slice(-4);
    return '****' + lastFour;
  } catch (error) {
    console.error('Error masking account number:', error.message);
    return '****XXXX';
  }
});

const Customer = mongoose.model('Customer', customerSchema); //creating the table

module.exports = Customer; //accessible to all files in project

/*
References:
Patel, R. 2024. Building a Secure User Registration and Login API with Express.js ,MongoDB and JWT, 13 March 2024. [Online]. Available at: https://medium.com/@finnkumar6/mastering-user-authentication-building-a-secure-user-schema-with-mongoose-and-bcrypt-539b9394e5d9 [Accessed 2 October 2025].
*/

