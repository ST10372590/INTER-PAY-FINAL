import React, { useState } from 'react' 
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { loginCustomer, loginEmployee } from '../../services/authService'
import { sanitizeInput, validateInput } from '../../utils/validation'
import { Eye, EyeOff, User, CreditCard } from 'lucide-react'

const LoginForm = () => { // (React Router Documentation, 2024)
    const navigate = useNavigate()
    const location = useLocation()

    const [formData, setFormData] = useState({
        username: '',
        account_number: '',
        password: '',
        userType: 'customer'  // default to customer
    })

     // (React Documentation, 2024)
    const [errors, setErrors] = useState({})
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const message = location.state?.message

    const errorMessages = {
        username: 'Username must be 3-20 characters (letters, numbers, underscore only)',
        account_number: 'Account number must be 10-12 digits'
    }

    const handleChange = (e) => { // (MDN Web Docs, 2024)
        const { name, value } = e.target
        const sanitizedValue = sanitizeInput(value) // (OWASP Foundation, 2024)

        setFormData(prev => ({
            ...prev,
            [name]: sanitizedValue
        })) // (React Documentation, 2024)


        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        } // (React Documentation, 2024)

    }

    const validateForm = () => {
        const newErrors = {}

        if (formData.userType === 'customer') {
            if (!formData.username) {
                newErrors.username = 'Username is required' // (OWASP Foundation, 2024)
            } else if (!validateInput('username', formData.username)) {
                newErrors.username = errorMessages.username
            }

            if (!formData.account_number) {
                newErrors.account_number = 'Account number is required' // (OWASP Foundation, 2024)
            } else if (!validateInput('accountNumber', formData.account_number)) {
                newErrors.account_number = errorMessages.account_number
            }
        } else {
            if (!formData.username) {
                newErrors.username = 'Username or Employee ID is required'
            }
        }

        if (!formData.password) {
            newErrors.password = 'Password is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault() // (ECMAScript International, 2024)

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)
        setErrors({})

        try {
            console.log('Attempting login...', { 
                userType: formData.userType,
                username: formData.username 
            })

            let response

            if (formData.userType === 'customer') { // (MDN Web Docs, 2024)
                response = await loginCustomer({
                    username: formData.username,
                    accountNumber: formData.account_number,
                    password: formData.password
                })
                // Save userType explicitly to localStorage // (MDN Web Docs, 2024)
                localStorage.setItem('userType', 'customer')
            } else {
                response = await loginEmployee({
                    username: formData.username,
                    password: formData.password
                })
                localStorage.setItem('userType', 'employee') // (MDN Web Docs, 2024)
            }

            console.log('Response received:', response)

            const token = localStorage.getItem('token')
            const userType = localStorage.getItem('userType')
            const user = localStorage.getItem('user')

            console.log('Checking localStorage:', { // (MDN Web Docs, 2024)
                hasToken: !!token,
                userType,
                hasUser: !!user
            })

            if (!token) {
                throw new Error('Authentication token not received. Please try again.')
            }

            console.log('Login successful!')
            // (MDN Web Docs, 2024)
            const redirectPath = userType === 'employee' 
                ? '/employee/dashboard' 
                : '/dashboard'

            console.log('Redirecting to:', redirectPath) // (React Documentation, 2024)
            navigate(redirectPath)

        } catch (error) {
            console.error('Login failed:', error)

            let errorMessage = 'Login failed. Please check your credentials.' // (React Documentation, 2024)

            if (error.message) {
                errorMessage = error.message
            } else if (error.error) {
                errorMessage = error.error
            } else if (typeof error === 'string') {
                errorMessage = error
            }

            setErrors({ submit: errorMessage })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Login to Portal</h2>

                {message && (
                    <div style={styles.successMessage}>
                        {message}
                    </div>
                )}

                <div style={styles.userTypeSelector}>
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ 
                            ...prev, 
                            userType: 'customer',
                            account_number: '' // Clear account number when switching
                        }))}
                        style={{
                            ...styles.userTypeButton,
                            ...(formData.userType === 'customer' && styles.userTypeButtonActive)
                        }}
                    >
                        <User size={20} />
                        Customer
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ 
                            ...prev, 
                            userType: 'employee',
                            account_number: '' // Clear account number when switching
                        }))}
                        style={{
                            ...styles.userTypeButton,
                            ...(formData.userType === 'employee' && styles.userTypeButtonActive)
                        }}
                    >
                        <CreditCard size={20} />
                        Employee
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label htmlFor="username" style={styles.label}>
                            {formData.userType === 'employee' ? 'Username or Employee ID *' : 'Username *'}
                        </label>
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
                            placeholder={formData.userType === 'employee' ? 'e.g., john.smith or EMP0001' : 'Enter your username'}
                            required
                        />
                        {errors.username && (
                            <span style={styles.error}>{errors.username}</span>
                        )}
                    </div>

                    {formData.userType === 'customer' && (
                        <div style={styles.formGroup}>
                            <label htmlFor="account_number" style={styles.label}>
                                Account Number *
                            </label>
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
                                placeholder="Enter your account number"
                                inputMode="numeric"
                                required
                            />
                            {errors.account_number && (
                                <span style={styles.error}>{errors.account_number}</span>
                            )}
                        </div>
                    )}

                    <div style={styles.formGroup}>
                        <label htmlFor="password" style={styles.label}>
                            Password *
                        </label>
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
                                placeholder="Enter your password"
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
                        {errors.password && (
                            <span style={styles.error}>{errors.password}</span>
                        )}
                    </div>

                    {errors.submit && (
                        <div style={styles.submitError}>{errors.submit}</div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            ...styles.submitButton,
                            ...(isSubmitting && styles.submitButtonDisabled)
                        }}
                    >
                        {isSubmitting ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                {formData.userType === 'customer' && (
                    <div style={styles.registerLink}>
                        <span>Don't have an account? </span>
                        <Link to="/register" style={styles.link}>Register here</Link>
                    </div>
                )}
            </div>
        </div>
    )
}

// (Google Material Design, 2024)
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
        maxWidth: '440px'
    },
    title: {
        textAlign: 'center',
        marginBottom: '32px',
        color: 'var(--text-primary)',
        fontSize: '28px',
        fontWeight: 'bold'
    },
    successMessage: {
        backgroundColor: 'rgba(56, 161, 105, 0.1)',
        color: 'var(--success-color)',
        padding: '12px',
        borderRadius: '6px',
        marginBottom: '20px',
        textAlign: 'center'
    },
    userTypeSelector: {
        display: 'flex',
        gap: '12px',
        marginBottom: '24px'
    },
    userTypeButton: {
        flex: 1,
        padding: '12px',
        border: '2px solid var(--border-color)',
        borderRadius: '6px',
        background: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'all 0.3s'
    },
    userTypeButtonActive: {
        borderColor: 'var(--accent-color)',
        backgroundColor: 'rgba(49, 130, 206, 0.1)'
    },
    form: {
        display: 'flex',
        flexDirection: 'column'
    },
    formGroup: {
        marginBottom: '20px'
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
        backgroundColor: '#28a745',
        color: '#fff',
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
    registerLink: {
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

export default LoginForm

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