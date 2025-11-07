import validator from 'validator'

const validatorUtils = {
  // Validate email
  isEmail: (email) => {
    return validator.isEmail(email)
  },

  // Validate strong password (customize as needed)
  isStrongPassword: (password) => {
    return validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  },

  // Validate phone number (basic international)
  isMobilePhone: (phone, locale = 'any') => {
    return validator.isMobilePhone(phone, locale)
  },

  // Validate alphanumeric usernames
  isValidUsername: (username) => {
    return validator.isAlphanumeric(username.replace(/_/g, '')) &&
      username.length >= 3 &&
      username.length <= 20
  },

  // Validate currency code (ISO 4217)
  isCurrencyCode: (code) => {
    return /^[A-Z]{3}$/.test(code)
  },

  // Validate amount with up to two decimal places
  isValidAmount: (amount) => {
    return /^\d+(\.\d{1,2})?$/.test(amount)
  },

  // Sanitize input to prevent XSS
  sanitize: (input) => {
    if (typeof input !== 'string') return input
    return validator.escape(input.trim())
  },

  // Check if string is empty after trimming
  isEmpty: (str) => {
    return validator.isEmpty(str.trim())
  },

  // Validate SWIFT/BIC Code (basic format)
  isSwiftCode: (code) => {
    return /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(code)
  }
}

// Sanitize input to prevent XSS
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  return validator.escape(input.trim())
}

// Validate different input types
export const validateInput = (type, value) => {
  switch (type) {
    case 'fullName':
      // Only letters, spaces, hyphens, and apostrophes
      return /^[a-zA-Z\s\-']+$/.test(value) && value.length >= 2
    
    case 'idNumber':
      // Exactly 13 digits
      return /^\d{13}$/.test(value)
    
    case 'accountNumber':
      // 10-12 digits
      return /^\d{10,12}$/.test(value)
    
    case 'username':
      // 3-20 characters, letters, numbers, underscore only
      return /^[a-zA-Z0-9_]{3,20}$/.test(value)
    
    default:
      return false
  }
}

// Validate password strength
export const validatePassword = (password) => {
  const minLength = 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  const missingRequirements = []
  
  if (password.length < minLength) {
    missingRequirements.push(`at least ${minLength} characters`)
  }
  if (!hasUppercase) {
    missingRequirements.push('one uppercase letter')
  }
  if (!hasLowercase) {
    missingRequirements.push('one lowercase letter')
  }
  if (!hasNumber) {
    missingRequirements.push('one number')
  }
  if (!hasSpecialChar) {
    missingRequirements.push('one special character')
  }

  const isValid = missingRequirements.length === 0

  return {
    isValid,
    message: isValid 
      ? 'Strong password' 
      : `Password must contain ${missingRequirements.join(', ')}`
  }
}


export default validatorUtils
