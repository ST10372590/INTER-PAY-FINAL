const Transaction = require('../models/Transaction')
const Customer = require('../models/Customer')
const {validate} = require ('../utils/validation') 

//POST api/customer/payment
const createPayment = async (req, res) =>{
    try{
        const {
          amount,
          currency,
          provider,
          beneficiary_name,
          beneficiary_account_number,
          swift_code,
          bank_name,
          bank_address,
          bank_country 
        } = req.body

//Validate the required fields
        if(!amount || !currency || !provider || !beneficiary_name || !beneficiary_account_number ||
            !swift_code || !bank_name || !bank_address || !bank_country){
                return res.status(400).json({
                    success: false,
                    message: 'All required fields must be provided',
                    required_fields: ['amount','currency','provider','beneficiary_name','beneficiary_account_number',
                        'swift_code','bank_name','bank_address','bank_country']
                });
            }


            //validate amount format
        if (typeof amount === 'undefined' || amount === null) {
           return res.status(400).json({
              success: false,
              message: 'Amount is required'
         });
        }

//validate amount format            
        const amountValidation = validate (amount.toString(), 'amount');
        if(!amountValidation.isValid){
            return res.status(400).json({
                success: false,
                message: 'Invalid amount format',
                error: amountValidation.error
            });
        }

//amount is positive
        const numAmount = parseFloat(amount);
        if (numAmount <= 0){
            return res.status(400).json({
                success:false,
                message: 'Amount must be greater than zero'
            });
        }
//amount does not exceed transaction limmit
        if (numAmount>1000000){
            return res.status(400).json({
                success:false,
                message: 'Amount exceeds transaction limit of 1,000,000'
            });
        }

//Validate the currency
const currencyVlidation = validate(currency.toUpperCase(),'currency');
if (!currencyVlidation.isValid){
    return res.status(400).json({
        success: false,
        message:'invalid currency code',
        error:currencyVlidation.error,
        supported_currencies: ['USD','EUR','GBP','ZAR','JPY','CNYT','AUD','CAD']
    });
}

//Validate swift code
const swiftValidation = validate(swift_code.toUpperCase(),'swiftCode');
if(!swiftValidation.isValid){
    return res.status(400).json({
        success: false,
        message: 'Invalid SWIFT code format',
        error: swiftValidation.error,
        format: 'SWIFT code must be 8 or 11 characters'
    });
}

//Validate beneficiary account number
const accountValidation = validate(beneficiary_account_number, 'beneficiaryAccount');
if (!accountValidation.isValid){  // Changed from beneficiary_account_number.isValid
    return res.status(400).json({
        success: false,
        message: 'invalid beneficiary account number format',
        error: accountValidation.error,
        format: 'Account number must be 8 to 34 numeric characters'  // Updated message
    });
}


const nameValidation =  validate(beneficiary_name, 'beneficiaryName');
if (!nameValidation.isValid){
    return res.status(400).json({
        success:false,
        message: 'invalid beneficiary name',
        error: nameValidation.error
    });
}

// Step 8: Verify customer exists and is active
 const customer = await Customer.findById(req.user.id);
 if (!customer) {
 return res.status(404).json({
 success: false,
 message: 'Customer not found'
 });
 }

 if (!customer.is_active) {
 return res.status(403).json({
 success: false,
 message: 'Account is not active'
 });
 }

 // Step 9: Create transaction
console.log('Creating transaction with data:', {
    customer_id: req.user.id,
    amount: numAmount,
    currency: currency.toUpperCase(),
    provider: provider || 'SWIFT',
    beneficiary_account_number: beneficiary_account_number,
    beneficiary_name: beneficiary_name.trim(),
    swift_code: swift_code.toUpperCase(),
    bank_name: bank_name.trim(),
    bank_address: bank_address?.trim() || '',
    bank_country: bank_country.trim(),
    status: 'pending'
});

 const transaction = await Transaction.create({
 customer_id: req.user.id,
 amount: numAmount,
 currency: currency.toUpperCase(),
 provider: provider || 'SWIFT',
 beneficiary_account_number: beneficiary_account_number.toUpperCase(),
 beneficiary_name: beneficiary_name.trim(),
 swift_code: swift_code.toUpperCase(),
 bank_name: bank_name.trim(),
 bank_address: bank_address?.trim() || '',
 bank_country: bank_country.trim(),
 status: 'pending'
 });

 console.log('Transaction created:', transaction)

 // Step 10: Populate customer info for response
 await transaction.populate('customer_id', 'full_name');

 // Step 11: Return success response
 res.status(201).json({
 success: true,
 message: 'Payment created successfully',
 data: {
 transaction_id: transaction._id,
 amount: transaction.amount,
 currency: transaction.currency,
 beneficiary_name: transaction.beneficiary_name,
 beneficiary_account: transaction.beneficiary_account_number,
 swift_code: transaction.swift_code,
 bank_name: transaction.bank_name,  
 bank_address: transaction.bank_address,  
 bank_country: transaction.bank_country, 
 status: transaction.status,
 created_at: transaction.createdAt
 }
 });

 } catch (error) {
 console.error('Payment creation error:', error);

 // Handle validation errors from Mongoose
 if (error.name === 'ValidationError') {
 const errors = Object.values(error.errors).map(err => err.message);
 return res.status(400).json({
 success: false,
 message: 'Validation failed',
 errors
 });
 }

 res.status(500).json({
 success: false,
 message: 'Error creating payment',
 error: process.env.NODE_ENV === 'development' ? error.message : undefined
 });
 }
};


//GET /api/customer/transactions
const getCustomerTransactions = async (req, res) => {
 try {
 // Get query parameters for filtering
 const { status, limit = 10, page = 1, sort = '-createdAt' } = req.query;

 // Build filter query
 const filter = { customer_id: req.user.id };

 // Add status filter if provided
 if (status) {
 const validStatuses = ['pending', 'verified', 'submitted', 'rejected', 'failed'];
 if (validStatuses.includes(status.toLowerCase())) {
 filter.status = status.toLowerCase();
 } else {
 return res.status(400).json({
 success: false,
 message: 'Invalid status filter',
 valid_statuses: validStatuses
 });
 }
 }

 // Fetch transactions with pagination
 const transactions = await Transaction.find(filter)
 .populate('verified_by', 'employee_name employee_id')
 .sort(sort);


 // Format transactions for response
 const formattedTransactions = transactions.map(txn => ({
 transaction_id: txn._id,
 amount: txn.amount,
 currency: txn.currency,
 beneficiary_name: txn.beneficiary_name,
 beneficiary_account: txn.beneficiary_account_number,
 swift_code: txn.swift_code,
 bank_name: txn.bank_name,  
 bank_address: txn.bank_address,  
 bank_country: txn.bank_country,
 status: txn.status,
 verified_by: txn.verified_by ? {
 name: txn.verified_by.employee_name,
 id: txn.verified_by.employee_id
 } : null,
 created_at: txn.createdAt,
 verified_at: txn.verified_at,
 submitted_at: txn.submitted_at
 }));

 res.status(200).json({
 success: true,
 data: formattedTransactions
 });

 } catch (error) {
 console.error('Fetch transactions error:', error);
 res.status(500).json({
 success: false,
 message: 'Error fetching transactions',
 error: process.env.NODE_ENV === 'development' ? error.message : undefined
 });
 }
};


//GET /api/customer/transactions/:id
const getTransactionById = async (req, res) => {
 try {
 const { id } = req.params;

 // Find transaction and verify it belongs to this customer
 const transaction = await Transaction.findOne({
 _id: id,
 customer_id: req.user.id
 }).populate('verified_by', 'employee_name employee_id');

 if (!transaction) {
 return res.status(404).json({
 success: false,
 message: 'Transaction not found'
 });
 }

 res.status(200).json({
 success: true,
 data: {
 transaction_id: transaction._id,
 amount: transaction.amount,
 currency: transaction.currency,
 provider: transaction.provider,
 beneficiary_name: transaction.beneficiary_name,
 beneficiary_account: transaction.beneficiary_account_number,
 swift_code: transaction.swift_code,
 bank_name: transaction.bank_name,
 bank_address: transaction.bank_address,
 bank_country: transaction.bank_country,
 status: transaction.status,
 verified_by: transaction.verified_by ? {
 name: transaction.verified_by.employee_name,
 id: transaction.verified_by.employee_id
 } : null,
 employee_notes: transaction.employee_notes,
 rejection_reason: transaction.rejection_reason,
 created_at: transaction.createdAt,
 verified_at: transaction.verified_at,
 submitted_at: transaction.submitted_at
 }
 });

 } catch (error) {
 console.error('Fetch transaction error:', error);
 res.status(500).json({
 success: false,
 message: 'Error fetching transaction',
 error: process.env.NODE_ENV === 'development' ? error.message : undefined
 });
 }
};

 
module.exports = {
 createPayment,
 getCustomerTransactions,
 getTransactionById
};