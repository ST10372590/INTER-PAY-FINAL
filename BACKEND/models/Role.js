const mongoose = require('mongoose'); //this is the library that helps us to interact with mongodb

const roleSchema = new mongoose.Schema({ //this is the table name in db
  role_name: { //the first field inside the db
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    enum: ['customer', 'employee'], 
    trim: true,
    lowercase: true
  },
  permissions: [{
    type: String,
    enum: [ //this is a array of the list of things that the users can do in the website
      'create_payment',
      'view_own_transactions',
      'verify_transactions',
      'submit_to_swift',
      'view_all_transactions'
    ]
  }],
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
roleSchema.index({ role_name: 1 });

const Role = mongoose.model('Role', roleSchema); //here we are creating the table

module.exports = Role; //makes it accessible to other files in the system.