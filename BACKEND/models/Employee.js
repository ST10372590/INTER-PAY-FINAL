const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({

  employee_id: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^EMP[0-9]{4,6}$/, 'Employee ID must be in format EMP followed by 4-6 digits']
  },
  employee_name: {
    type: String,
    required: [true, 'Employee name is required'],
    trim: true,
    minlength: [2, 'Employee name must be at least 2 characters'],
    maxlength: [100, 'Employee name cannot exceed 100 characters'],
    match: [/^[a-zA-Z\s\-']+$/, 'Employee name can only contain letters, spaces, hyphens, and apostrophes']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    match: [/^[a-zA-Z0-9._]{3,20}$/, 'Username must be letters, numbers, underscore, dot']
  },
  password_hash: {
    type: String,
    required: [true, 'Password is required'],
    select: false // Don't return password in queries by default
  },
  role_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  is_active: {
    type: Boolean,
    default: true
  },
  last_login: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// makes sure that the system is fast when looking for these fields
employeeSchema.index({ username: 1 });
employeeSchema.index({ employee_id: 1 });
employeeSchema.index({ role_id: 1 });
employeeSchema.index({ is_active: 1 });

const Employee = mongoose.model('Employee', employeeSchema);//creates table

module.exports = Employee; //accessible to all files