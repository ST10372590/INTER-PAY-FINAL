import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { LogOut, User, Shield } from 'lucide-react'

const Header = () => {
    const { user, logout, userType } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <header style={styles.header}>
            <div style={styles.container}>
                <Link to="/" style={styles.logo}>
                    <Shield size={32} />
                    <span>International Payments</span>
                </Link>

                <nav style={styles.nav}>
                    {user ? (
                        <>
                            <span style={styles.welcome}>
                                Welcome, {user.full_name || user.employee_name}
                            </span>
                            <Link to="/profile" style={styles.navLink}>
                                <User size={16} />
                                Profile
                            </Link>
                            <button onClick={handleLogout} style={styles.logoutBtn}>
                                <LogOut size={16} />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={styles.navLink}>Login</Link>
                            <Link to="/register" style={styles.navLink}>Register</Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    )
}

const styles = {
    header: {
        backgroundColor: 'var(--primary-color)',
        color: 'white',
        padding: '16px 0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: 'white',
        textDecoration: 'none',
        fontSize: '20px',
        fontWeight: 'bold'
    },
    nav: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
    },
    welcome: {
        fontSize: '14px',
        opacity: 0.9
    },
    navLink: {
        color: 'white',
        textDecoration: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        transition: 'background-color 0.3s',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    logoutBtn: {
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.3)',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'background-color 0.3s'
    }
}

export default Header