import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { authService } from '../services/api'

const AuthContext = createContext()

// Custom hook to easily use authentication context (MDN Web Docs, 2024)
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        // Ensure hook is used within the AuthProvider
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

// AuthProvider component that wraps the entire app and provides authentication state
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem('token')) 
    const [loading, setLoading] = useState(false) 
    const [error, setError] = useState('') 

    // Automatically verify token when AuthProvider mounts or token changes (OWASP Foundation, 2024)
    useEffect(() => {
        if (token) {
            verifyToken()
        }
    }, [token])

    // Function to verify and refresh user session based on stored token (MDN Web Docs, 2024)
    const verifyToken = useCallback(async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')

            // If no token is found, logout the user (OWASP Foundation, 2024)
            if (!token) {
                logout()
                return
            }

            // Attempt to load user data from localStorage (for quick UI load)
            const storedUser = localStorage.getItem('user')
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser)
                setUser(parsedUser)
                console.log('User loaded from localStorage:', parsedUser)
            }

            // Then verify token with backend to ensure validity
            const userData = await authService.verifyToken(token)
            setUser(userData)
            console.log('User verified from backend:', userData)

        } catch (error) {
            // If verification fails, clear session (OWASP Foundation, 2024)
            console.error('Token verification failed:', error)
            logout()
        } finally {
            setLoading(false)
        }
    }, [token])

    // Function to log in user with credentials and user type (OWASP Foundation, 2024)
    const login = useCallback(async (loginData, userType) => {
        try {
            setLoading(true)
            setError('')

            // Call backend login service (MDN Web Docs, 2024) 
            const response = await authService.login(loginData, userType)
            const { token: newToken, data } = response

            // Save token and user details to state and localStorage (MDN Web Docs, 2024)
            setToken(newToken)
            setUser(data)
            localStorage.setItem('token', newToken)
            localStorage.setItem('userType', userType)

            return { success: true }
        } catch (error) {
            // Handle and store error message
            const message = error.response?.data?.message || 'Login failed'
            setError(message)
            return { success: false, message }
        } finally {
            setLoading(false)
        }
    }, [])

    // Function to register new users
    const register = useCallback(async (userData) => {
        try {
            setLoading(true)
            setError('')

            // Call backend register service (MDN Web Docs, 2024)
            const response = await authService.register(userData)
            return { success: true, data: response.data }
        } catch (error) {
            // Handle and store registration errors
            const message = error.response?.data?.message || 'Registration failed'
            setError(message)
            return { success: false, message }
        } finally {
            setLoading(false)
        }
    }, [])

    // Function to log out user
    const logout = useCallback(() => {
        // Clear all authentication-related state and localStorage (OWASP Foundation, 2024)
        setUser(null)
        setToken(null)
        setError('')
        localStorage.removeItem('token')
        localStorage.removeItem('userType')

        // Optionally call backend logout API (OWASP Foundation, 2024)
        authService.logout().catch(console.error)
    }, [])

    // Define the values provided to any components consuming this context (OWASP Foundation, 2024)
    const value = {
        user,
        token,
        loading, 
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user && !!token, // Boolean flag for auth status
        userType: user?.userType || localStorage.getItem('userType')
    }

    // Wrap the application with authentication provider 
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

/*
----------------------------------
Reference List
----------------------------------

MDN Web Docs. 2024. Using the Fetch API and Promises in JavaScript. [online]. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch [3 October 2025]
OWASP Foundation. 2024. Secure data handling and API integration best practices. [online]. Available at: https://owasp.org/ [3 October 2025]

*/