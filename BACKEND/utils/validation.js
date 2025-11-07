//RegEx patterns for input validation (whitelist)
// for validating user input, sanitize it to prevent attacks and check password strength.
 

//this method uses regex to make sure input rules are applied.
const patterns = {
  // Customer Registration
  full_name: /^[a-zA-Z\s\-']{2,100}$/,
  id_number: /^\d{13}$/,
  account_number: /^\d{10,12}$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
  
  // Payment fields
  amount: /^\d+(\.\d{1,2})?$/, 
  currency: /^(USD|EUR|GBP|JPY|CNY|AUD|CAD)$/,
  swiftCode: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
  beneficiaryAccount: /^\d{8,34}$/,
  beneficiaryName: /^[a-zA-Z\s\-']{2,100}$/,
  
  // Customer fields
  customerId: /^CUST[0-9]{4,6}$/,

  // Employee fields
  employeeId: /^EMP[0-9]{4,6}$/,
  
}; //(Wentz, 2023)

//this method checks every input one by one against the regex patterns above.
const validate = (input, field) => {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      error: `${field} is required and must be a string`
    };
  }

  const pattern = patterns[field];
  if (!pattern) {
    return {
      isValid: false,
      error: `No validation pattern found for ${field}`
    };
  }

  const isValid = pattern.test(input.trim());
  
  return {
    isValid,
    error: isValid ? null : `Invalid ${field} format`
  };
}; //(Wentz, 2023)


//checks everything all at once, recieves an array of required fields and data to check.
const validateMultiple = (data, requiredFields) => { 
  const errors = [];

  requiredFields.forEach(field => {
    const result = validate(data[field], field);
    if (!result.isValid) {
      errors.push({
        field,
        message: result.error
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};


//this prevents XSS(Cross-site Scripting) attacks.
const sanitize = (input) => {
  if (typeof input !== 'string') return input;
  
  //trims and removes < and >, javascript protocols, event handlers 
  return input
    .trim()
    .replace(/[<>]/g, '') 
    .replace(/javascript:/gi, '') 
    .replace(/on\w+\s*=/gi, ''); 
};

//takes in data and specific fields and cleans it so it doesn’t 
// contain unwanted content.
const validateAndSanitize = (data, fields) => {
  const sanitized = {}; //creates a object
  
  fields.forEach(field => {
    if (data[field] !== undefined) {
      sanitized[field] = sanitize(data[field]);
    }
  });
  
  return sanitized;
};

//this makes sure that users enter stronger passwords
const checkPasswordStrength = (password) => {
  const feedback = [];
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&#]/.test(password)) score++;

  if (password.length < 8) feedback.push('Password must be at least 8 characters');
  if (!/[a-z]/.test(password)) feedback.push('Include at least one lowercase letter');
  if (!/[A-Z]/.test(password)) feedback.push('Include at least one uppercase letter');
  if (!/\d/.test(password)) feedback.push('Include at least one number');
  if (!/[@$!%*?&#]/.test(password)) feedback.push('Include at least one special character');

  return {
    isStrong: score >= 5,
    score,
    feedback
  };
};

module.exports = {
  patterns,
  validate,
  validateMultiple,
  sanitize,
  validateAndSanitize,
  checkPasswordStrength
}; //makes functions accessible

/*
References: 
Wentz, A. 2023. Username and Password Validation Using Regex, 24 June 2023. [Online]. Available at: https://dev.to/fromwentzitcame/username-and-password-validation-using-regex-2175 [Accessed 2 October 2025].
*/