const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0'],
    validate: {
      validator: function(value) {
        return /^\d+(\.\d{1,2})?$/.test(value.toString());
      },
      message: 'Amount must have maximum 2 decimal places'
    }
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    enum: ['USD', 'EUR', 'GBP', 'AUD','JPY', 'CNY', 'CAD'],
    uppercase: true,
    match: [/^[A-Z]{3}$/, 'Currency must be a valid 3-letter code']
  },
  provider: {
    type: String,
    required: [true, 'Provider is required'],
    enum: ['SWIFT'],
    default: 'SWIFT',
    uppercase: true
  },
  beneficiary_account_number: {
    type: String,
    required: [true, 'Beneficiary account number is required'],
    trim: true,
    minlength: [8, 'Account number must be at least 8 characters'],
    maxlength: [34, 'Account number cannot exceed 34 characters'],
    match: [/^[A-Z0-9]+$/, 'Account number can only contain uppercase letters and numbers']
  },
  beneficiary_name: {
    type: String,
    required: [true, 'Beneficiary name is required'],
    trim: true,
    minlength: [2, 'Beneficiary name must be at least 2 characters'],
    maxlength: [100, 'Beneficiary name cannot exceed 100 characters'],
    match: [/^[a-zA-Z\s\-']+$/, 'Beneficiary name can only contain letters, spaces, hyphens, and apostrophes']
  },
  swift_code: {
    type: String,
    required: [true, 'SWIFT code is required'],
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, 'Invalid SWIFT code format']
  },
  bank_name: {
    type: String,
    required: [true, 'Bank name is required'],
    trim: true
  },
  bank_address: {
    type: String,
    trim: true
  },
  bank_country: {
    type: String,
    required: [true, 'Bank country is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'submitted', 'rejected'],
    default: 'pending',
    lowercase: true
  },
  verified_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  },
  verified_at: {
    type: Date,
    default: null
  },
  submitted_at: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for performance
transactionSchema.index({ customer_id: 1, status: 1 });
transactionSchema.index({ status: 1, createdAt: -1 });
transactionSchema.index({ verified_by: 1 });
transactionSchema.index({ transaction_reference: 1 });

// method to update status
transactionSchema.methods.updateStatus = async function(newStatus) {
  // Prevent reverting to 'pending' once 'verified' or 'rejected'
  if (this.status !== 'pending' && newStatus === 'pending') {
    throw new Error(`Cannot revert status from '${this.status}' back to 'pending'.`);
  }

  this.status = newStatus;

  if (newStatus === 'verified') {
    this.verified_at = new Date();
  }

  if (newStatus === 'submitted') {
    this.submitted_at = new Date();
  }

  return this.save();
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
