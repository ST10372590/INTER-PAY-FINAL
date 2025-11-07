import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const ProtectedRoute = ({ children, requiredUserType }) => {
    const { isAuthenticated, userType, loading } = useAuth()

    if (loading) {
        return (
            <div style={styles.loading}>
                <div>Loading...</div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (requiredUserType && userType !== requiredUserType) {
        return <Navigate to="/unauthorized" replace />
    }

    return children
}

const styles = {
    loading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh'
    }
}

export default ProtectedRoute