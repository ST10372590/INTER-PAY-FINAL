import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import './App.css'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/CustomerDashboard'
import MakePayment from './pages/MakePayment'
import TransactionHistory from './pages/TransactionHistory'
import Profile from './pages/Profile'
import EmployeeDashboard from './pages/EmployeeDashboard'
import EmployeeProfile from './pages/EmployeeProfile'
import EmployeeViewTransactions from './pages/EmployeeViewTransactions'
import Navbar from './components/Navbar'
import Footer from './components/Layout/Footer'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { SecurityProvider } from './contexts/SecurityContext'
import { HelmetProvider } from 'react-helmet-async'

function AppContent() {
  const location = useLocation()
  const { userType, isAuthenticated } = useAuth()

  const customerNavbarRoutes = [
    '/dashboard',
    '/make-payment',
    '/transaction-history',
    '/profile',
  ]

  const employeeNavbarRoutes = [
    '/employee/dashboard',
    '/employee/profile',
    '/employee/transactions', 
  ]

  const shouldShowNavbar =
    (userType === 'customer' && customerNavbarRoutes.includes(location.pathname)) ||
    (userType === 'employee' && employeeNavbarRoutes.includes(location.pathname))

  // Redirect unauthenticated users to login
  if (!isAuthenticated && location.pathname !== '/login' && location.pathname !== '/register') {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {shouldShowNavbar && <Navbar />}
      <main className="flex-grow container mx-auto px-4 py-6">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Customer routes */}
          {userType === 'customer' && (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/make-payment" element={<MakePayment />} />
              <Route path="/transaction-history" element={<TransactionHistory />} />
              <Route path="/profile" element={<Profile />} />
            </>
          )}

          {/* Employee routes */}
          {userType === 'employee' && (
            <>
              <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
              <Route path="/employee/profile" element={<EmployeeProfile />} />
              <Route path="/employee/transactions" element={<EmployeeViewTransactions />} />
            </>
          )}

          {/* Fallback route */}
          <Route
            path="*"
            element={
              <Navigate
                to={userType === 'employee' ? '/employee/dashboard' : '/dashboard'}
                replace
              />
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <SecurityProvider>
        <HelmetProvider>
          <Router>
            <AppContent />
          </Router>
        </HelmetProvider>
      </SecurityProvider>
    </AuthProvider>
  )
}

export default App
