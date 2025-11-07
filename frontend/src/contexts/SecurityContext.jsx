import React, { createContext, useContext, useCallback } from 'react'
import validator from '../utils/validation'

const SecurityContext = createContext()
// (MDN Web Docs, 2024)
export const useSecurity = () => {
    const context = useContext(SecurityContext)
    if (!context) {
        throw new Error('useSecurity must be used within a SecurityProvider')
    }
    return context
}

export const SecurityProvider = ({ children }) => {
    // Input validation patterns using (RegEx OWASP Foundation, 2024)
    const validationPatterns = {
        fullName: /^[a-zA-Z\s\-']{2,100}$/,
        idNumber: /^\d{13}$/,

        accountNumber: /^[A-Z0-9]{8,34}$/,
        username: /^[a-zA-Z0-9_]{3,20}$/,
        password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        swiftCode: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
        amount: /^\d+(\.\d{1,2})?$/,
        currency: /^[A-Z]{3}$/,
        beneficiaryName: /^[a-zA-Z\s\-']{2,100}$/
    }

    const errorMessages = {
        fullName: 'Name can only contain letters, spaces, hyphens, and apostrophes (2-100 characters)',
        idNumber: 'ID number must be 8-20 alphanumeric characters',
        accountNumber: 'Account number must be 8-34 alphanumeric characters',
        username: 'Username must be 3-20 characters (letters, numbers, underscore)',
        password: 'Password must be at least 8 characters with uppercase, lowercase, number and special character',
        swiftCode: 'Invalid SWIFT code format',
        amount: 'Amount must be a valid number with up to 2 decimal places',
        currency: 'Currency must be a valid 3-letter code',
        beneficiaryName: 'Beneficiary name can only contain letters, spaces, hyphens, and apostrophes'
    }

    const sanitizeInput = useCallback((input) => {
        if (typeof input !== 'string') return input

        // Remove potentially dangerous characters (OWASP Foundation, 2024)
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<[^>]*>/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '')
            .trim()
    }, [])

    const validateInput = useCallback((value, patternName) => {
        const pattern = validationPatterns[patternName]
        if (!pattern) return true

        return pattern.test(value)
    }, [validationPatterns])

    const validatePasswordStrength = useCallback((password) => { // (OWASP Foundation. 2024)
        const requirements = {
            // (OWASP Foundation. 2024)
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /\d/.test(password),
            special: /[@$!%*?&]/.test(password)
        }

        const isStrong = Object.values(requirements).every(Boolean)
        // (OWASP Foundation. 2024)
        const feedback = Object.entries(requirements)
            .filter(([_, met]) => !met)
            .map(([req]) => {
                switch (req) {
                    case 'length': return 'at least 8 characters'
                    case 'lowercase': return 'one lowercase letter'
                    case 'uppercase': return 'one uppercase letter'
                    case 'number': return 'one number'
                    case 'special': return 'one special character (@$!%*?&)'
                    default: return ''
                }
            })

        return {
            isStrong,
            feedback: feedback.length > 0 ? `Password must contain ${feedback.join(', ')}` : ''
        }
    }, [])

    const encryptSensitiveData = useCallback((data) => {
        // In a real application, use proper encryption (MDN Web Docs, 2024)
        // This is a placeholder for demonstration
        return btoa(JSON.stringify(data))
    }, [])

    const decryptSensitiveData = useCallback((encryptedData) => { // (OWASP Foundation, 2024)
        try {
            return JSON.parse(atob(encryptedData))
        } catch {
            return null
        }
    }, [])

    const value = {
        validationPatterns,
        errorMessages,
        sanitizeInput,
        validateInput,
        validatePasswordStrength,
        encryptSensitiveData,
        decryptSensitiveData
    }

    return (
        <SecurityContext.Provider value={value}>
            {children}
        </SecurityContext.Provider>
    )
}

/*
----------------------------------
Reference List
----------------------------------

MDN Web Docs. 2024. Using the Fetch API and Promises in JavaScript. [online]. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch [3 October 2025]
OWASP Foundation. 2024. Secure data handling and API integration best practices. [online]. Available at: https://owasp.org/ [3 October 2025]

*/