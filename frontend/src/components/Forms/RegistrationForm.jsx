import React, { useState } from 'react'  // (React Documentation, 2024)
import { useNavigate, Link } from 'react-router-dom'
import { registerCustomer } from '../../services/authService' 
import { sanitizeInput, validateInput, validatePassword } from '../../utils/validation' 
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'  // (Lucide React Icons, 2024)

const RegistrationForm = () => {
    const navigate = useNavigate()  // (React Router Documentation, 2024)

    const [formData, setFormData] = useState({  
        full_name: '',
        id_number: '',
        account_number: '',
        username: '',
        password: '',
        confirm_password: ''
    })
    // (React Documentation, 2024)
    const [errors, setErrors] = useState({})  
    const [showPassword, setShowPassword] = useState(false) 
    const [passwordStrength, setPasswordStrength] = useState({}) 
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Error messages for validation (OWASP Foundation, 2024)
    const errorMessages = {
        full_name: 'Full name must contain only letters, spaces, hyphens, and apostrophes', 
        id_number: 'ID number must be exactly 13 digits', 
        account_number: 'Account number must be 10-12 digits',
        username: 'Username must be 3-20 characters (letters, numbers, underscore only)',
        password: 'Password does not meet requirements'
    }

    const handleChange = (e) => {
        const { name, value } = e.target  
        const sanitizedValue = sanitizeInput(value)  // (OWASP Foundation, 2024)

        setFormData(prev => ({
            ...prev,
            [name]: sanitizedValue
        }))  // (React Documentation, 2024)

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))  // (React Documentation, 2024)
        }

        // Validate password strength in real-time  (OWASP Foundation, 2024)
        if (name === 'password') {
            const strength = validatePassword(sanitizedValue) 
            setPasswordStrength(strength)
        }
    }

    const validateForm = () => {
        const newErrors = {}

        // Validate full name  (OWASP Foundation, 2024)
        if (!formData.full_name) {
            newErrors.full_name = 'Full name is required'  
        } else if (!validateInput('fullName', formData.full_name)) {
            newErrors.full_name = errorMessages.full_name 
        }

        // Validate ID number  (OWASP Foundation, 2024)
        if (!formData.id_number) {
            newErrors.id_number = 'ID number is required' 
        } else if (!validateInput('idNumber', formData.id_number)) {
            newErrors.id_number = errorMessages.id_number
        }

        // Validate account number  (OWASP Foundation, 2024)
        if (!formData.account_number) {
            newErrors.account_number = 'Account number is required'
        } else if (!validateInput('accountNumber', formData.account_number)) {
            newErrors.account_number = errorMessages.account_number
        }

        // Validate username  (OWASP Foundation, 2024)
        if (!formData.username) {
            newErrors.username = 'Username is required'
        } else if (!validateInput('username', formData.username)) {
            newErrors.username = errorMessages.username 
        }

        // Validate password (OWASP Foundation, 2024)
        if (!formData.password) {
            newErrors.password = 'Password is required'  
        } else {
            const currentPasswordStrength = validatePassword(formData.password)  
            if (!currentPasswordStrength.isValid) {
                newErrors.password = currentPasswordStrength.message 
            }
            setPasswordStrength(currentPasswordStrength)  
        }

        // Validate confirm password (OWASP Foundation, 2024)
        if (!formData.confirm_password) {
            newErrors.confirm_password = 'Please confirm your password' 
        } else if (formData.password !== formData.confirm_password) {
            newErrors.confirm_password = 'Passwords do not match' 
        }

        setErrors(newErrors) 
        return Object.keys(newErrors).length === 0  // (ECMAScript International, 2024)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()  // (MDN Web Docs, 2024)

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)

        try {
            // Call the backend API
            await registerCustomer({  // (MDN Web Docs, 2024)
                fullName: formData.full_name,
                idNumber: formData.id_number,
                accountNumber: formData.account_number,
                username: formData.username,
                password: formData.password
            })

            // If we get here, registration was successful
            // Navigate to login page with success message
            navigate('/login', {  // (React Router Documentation, 2024)
                state: {
                    message: 'Registration successful! Please login to continue.'
                }
            })
        } catch (error) {
            // Log the full error for debugging
            console.error('Registration error:', error)  // (MDN Web Docs, 2024)
            
            // Show error from backend
            setErrors({ 
                submit: error.message || 'Registration failed. Please try again.'  // (React Documentation, 2024)
            })
        } finally {
            setIsSubmitting(false)  
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Create Customer Account</h2>

                <form onSubmit={handleSubmit} style={styles.form}>
                    {/* Full Name */}
                    <div style={styles.formGroup}>
                        <label htmlFor="full_name" style={styles.label}>Full Name *</label>
                        <input
                            type="text"
                            id="full_name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            style={{
                                ...styles.input,
                                ...(errors.full_name && styles.inputError)
                            }}
                            required
                            maxLength={100}
                        />
                        {errors.full_name && <span style={styles.error}>{errors.full_name}</span>}
                    </div>

                     {/* ID Number */}
                    <div style={styles.formGroup}>
                        <label htmlFor="id_number" style={styles.label}>ID Number *</label>
                        <input
                            type="text"
                            id="id_number"
                            name="id_number"
                            value={formData.id_number}
                            onChange={handleChange}
                            style={{
                                ...styles.input,
                                ...(errors.id_number && styles.inputError)
                            }}
                            inputMode="numeric"
                            pattern="\d*"
                            required
                            maxLength={13}
                        />
                        {errors.id_number && <span style={styles.error}>{errors.id_number}</span>}
                    </div>

                    {/* Account Number */}
                    <div style={styles.formGroup}>
                        <label htmlFor="account_number" style={styles.label}>Account Number *</label>
                        <input
                            type="text"
                            id="account_number"
                            name="account_number"
                            value={formData.account_number}
                            onChange={handleChange}
                            style={{
                                ...styles.input,
                                ...(errors.account_number && styles.inputError)
                            }}
                            inputMode="numeric"
                            pattern="\d*"
                            required
                            maxLength={16}
                        />
                        {errors.account_number && <span style={styles.error}>{errors.account_number}</span>}
                    </div>

                    {/* Username */}
                    <div style={styles.formGroup}>
                        <label htmlFor="username" style={styles.label}>Username *</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            style={{
                                ...styles.input,
                                ...(errors.username && styles.inputError)
                            }}
                            required
                            maxLength={20}
                        />
                        {errors.username && <span style={styles.error}>{errors.username}</span>}
                    </div>

                    {/* Password */}
                    <div style={styles.formGroup}>
                        <label htmlFor="password" style={styles.label}>Password *</label>
                        <div style={styles.passwordContainer}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                style={{
                                    ...styles.input,
                                    ...styles.passwordInput,
                                    ...(errors.password && styles.inputError)
                                }}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={styles.passwordToggle}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {formData.password && (
                            <div style={styles.passwordStrength}>
                                <div style={styles.strengthIndicator}>
                                    {passwordStrength.isValid ? (
                                        <>
                                            <CheckCircle size={16} color="var(--success-color)" />
                                            <span style={styles.strengthText}>Strong password</span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle size={16} color="var(--error-color)" />
                                            <span style={styles.strengthText}>
                                                {passwordStrength.message}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                        {errors.password && <span style={styles.error}>{errors.password}</span>}
                    </div>

                    {/* Confirm Password */}
                    <div style={styles.formGroup}>
                        <label htmlFor="confirm_password" style={styles.label}>Confirm Password *</label>
                        <input
                            type="password"
                            id="confirm_password"
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            style={{
                                ...styles.input,
                                ...(errors.confirm_password && styles.inputError)
                            }}
                            required
                        />
                        {errors.confirm_password && (
                            <span style={styles.error}>{errors.confirm_password}</span>
                        )}
                    </div>

                    {/* Submit Error */}
                    {errors.submit && (
                        <div style={styles.submitError}>{errors.submit}</div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            ...styles.submitButton,
                            ...(isSubmitting && styles.submitButtonDisabled)
                        }}
                    >
                        {isSubmitting ? 'Registering...' : 'Register'}
                    </button>
                </form>

                {/* Login Link */}
                <div style={styles.loginLink}>
                    <span>Already have an account? </span>
                    <Link to="/login" style={styles.link}>Login here</Link>
                </div>
            </div>
        </div>
    )
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        padding: '20px'
    },
    card: {
        background: 'var(--surface-color)',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '480px'
    },
    title: {
        textAlign: 'center',
        marginBottom: '32px',
        color: 'var(--text-primary)',
        fontSize: '28px',
        fontWeight: 'bold'
    },
    form: {
        display: 'flex',
        flexDirection: 'column'
    },
    formGroup: {
        marginBottom: '24px'
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '600',
        color: 'var(--text-primary)'
    },
    input: {
        width: '100%',
        padding: '12px 16px',
        border: '2px solid var(--border-color)',
        borderRadius: '6px',
        fontSize: '16px',
        transition: 'border-color 0.3s'
    },
    inputError: {
        borderColor: 'var(--error-color)'
    },
    passwordContainer: {
        position: 'relative'
    },
    passwordInput: {
        paddingRight: '50px'
    },
    passwordToggle: {
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--text-secondary)'
    },
    passwordStrength: {
        marginTop: '8px'
    },
    strengthIndicator: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px'
    },
    strengthText: {
        fontSize: '14px'
    },
    error: {
        color: 'var(--error-color)',
        fontSize: '14px',
        marginTop: '4px',
        display: 'block'
    },
    submitError: {
        backgroundColor: 'rgba(229, 62, 62, 0.1)',
        color: 'var(--error-color)',
        padding: '12px',
        borderRadius: '6px',
        marginBottom: '16px',
        textAlign: 'center'
    },
    submitButton: {
        backgroundColor: '#007BFF',
        color: '#FFFFFF',
        padding: '14px',
        border: 'none',
        borderRadius: '6px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.3s'
    },
    submitButtonDisabled: {
        opacity: 0.6,
        cursor: 'not-allowed'
    },
    loginLink: {
        textAlign: 'center',
        marginTop: '24px',
        color: 'var(--text-secondary)'
    },
    link: {
        color: 'var(--accent-color)',
        textDecoration: 'none',
        fontWeight: '600'
    }
}

export default RegistrationForm

/*
----------------------------------
Reference List
----------------------------------

Google Material Design. 2024. Visual hierarchy and layout design principles. [online]. Available at: https://m3.material.io/ [2 November 2025]
Lucide React Icons. 2024. Lucide React Icon Components (Plus, History, User, TrendingUp). [online]. Available at: https://lucide.dev/docs/lucide-react [2 November 2025]
MDN Web Docs. 2024. Using the Fetch API and Promises in JavaScript. [online]. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch [3 October 2025]
MDN Web Docs. 2024. Array.prototype.map(), filter(), reduce() methods. [online]. Available at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array [5 October 2025]
OWASP Foundation. 2024. Secure data handling and API integration best practices. [online]. Available at: https://owasp.org/ [3 October 2025]
React Documentation. 2024. React – A JavaScript library for building user interfaces. [online]. Available at: https://react.dev [5 October 2025]
React Helmet Async Documentation. 2024. Managing document head with react-helmet-async. [online]. Available at: https://github.com/staylor/react-helmet-async [5 October 2025]
React Router Documentation. 2024. Link component and routing navigation. [online]. Available at: https://reactrouter.com/en/main [29 October 2025]

*/