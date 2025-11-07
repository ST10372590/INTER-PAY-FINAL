import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { paymentService } from '../services/api'
import { Plus, History, User, TrendingUp } from 'lucide-react'

const CustomerDashboard = () => {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalTransactions: 0,
    pendingTransactions: 0,
    verifiedTransactions: 0,
    totalAmount: 0
  })

  useEffect(() => {
  const storedUser = user || JSON.parse(localStorage.getItem('user'))
  loadTransactions()
}, [user])


  const loadTransactions = async () => {
    try {
      const response = await paymentService.getTransactions()
      const data = response.data || []

      // Update transactions and stats (MDN Web Docs, 2024)
      setTransactions(data.slice(0, 5))
      const total = data.length
      const pending = data.filter((t) => t.status === 'pending').length
      const verified = data.filter((t) => t.status === 'verified').length
      const totalAmount = data.reduce((sum, t) => sum + (t.amount || 0), 0)

      setStats({
        totalTransactions: total,
        pendingTransactions: pending,
        verifiedTransactions: verified,
        totalAmount
      })
    } catch (error) {
      console.error('Failed to load transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'var(--success-color)'
      case 'pending':
        return 'var(--warning-color)'
      case 'failed':
        return 'var(--error-color)'
      default:
        return 'var(--text-secondary)'
    }
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - International Payments Portal</title>
      </Helmet>

      <div style={styles.container}>
        {/* Header Section (React Documentation, 2024) */}
        <div style={styles.header}>
          <h1 style={styles.title}>Welcome back!</h1>
          <p style={styles.subtitle}>Manage your international payments</p>
        </div>

        {/* Quick Stats (Google Material Design, 2024) */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              <TrendingUp size={24} />
            </div>
            <div style={styles.statContent}>
              <div style={styles.statNumber}>{stats.totalTransactions}</div>
              <div style={styles.statLabel}>Total Transactions</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div
              style={{
                ...styles.statIcon,
                backgroundColor: 'rgba(255, 213, 0, 0.1)',
                color: 'var(--warning-color)'
              }}
            >
              <History size={24} />
            </div>
            <div style={styles.statContent}>
              <div style={styles.statNumber}>{stats.pendingTransactions}</div>
              <div style={styles.statLabel}>Pending</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div
              style={{
                ...styles.statIcon,
                backgroundColor: 'rgba(30, 255, 0, 0.1)',
                color: 'var(--success-color)'
              }}
            >
              <History size={24} />
            </div>
            <div style={styles.statContent}>
              <div style={styles.statNumber}>{stats.verifiedTransactions}</div>
              <div style={styles.statLabel}>Verified</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div
              style={{
                ...styles.statIcon,
                backgroundColor: 'rgba(10, 0, 210, 0.1)',
                color: 'var(--accent-color)'
              }}
            >
              <User size={24} />
            </div>
            <div style={styles.statContent}>
              <div style={styles.statNumber}>
                ${stats.totalAmount.toLocaleString()}
              </div>
              <div style={styles.statLabel}>Total Sent</div>
            </div>
          </div>
        </div>

        {/* Quick Actions (Google Material Design, 2024; Lucide React Icons, 2024) */}
        <div style={styles.actionsGrid}>
          <Link to="/make-payment" style={styles.actionCard}>
            <div style={styles.actionIcon}>
              <Plus size={32} />
            </div>
            <h3 style={styles.actionTitle}>Make Payment</h3>
            <p style={styles.actionDescription}>
              Create a new international payment
            </p>
          </Link>

          <Link to="/transaction-history" style={styles.actionCard}>
            <div style={styles.actionIcon}>
              <History size={32} />
            </div>
            <h3 style={styles.actionTitle}>Transaction History</h3>
            <p style={styles.actionDescription}>
              View all your past transactions
            </p>
          </Link>
        </div>

        {/* Recent Transactions (Google Material Design, 2024; MDN Web Docs, 2024) */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Recent Transactions</h2>
            <Link to="/transaction-history" style={styles.viewAllLink}>
              View All
            </Link>
          </div>

          {loading ? (
            <div style={styles.loading}>Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No transactions yet</p>
              <Link to="/make-payment" style={styles.ctaLink}>
                Make your first payment
              </Link>
            </div>
          ) : (
            <div style={styles.transactionsList}>
              {transactions.map((transaction) => (
                <div
                  key={
                    transaction._id ||
                    transaction.id ||
                    transaction.transaction_id
                  }
                  style={styles.transactionCard}
                >
                  <div style={styles.transactionHeader}>
                    <div style={styles.transactionDate}>
                      {new Date(
                        transaction.createdAt ||
                          transaction.date_created ||
                          transaction.timestamp ||
                          Date.now()
                      ).toLocaleString()}
                    </div>
                    <div
                      style={{
                        ...styles.transactionStatus,
                        color: getStatusColor(transaction.status)
                      }}
                    >
                      {transaction.status}
                    </div>
                  </div>

                  <div style={styles.transactionBody}>
                    <div style={styles.transactionField}>
                      <strong>Currency:</strong> {transaction.currency || 'N/A'}
                    </div>
                    <div style={styles.transactionField}>
                      <strong>Amount:</strong>{' '}
                      {transaction.amount
                        ? transaction.amount.toLocaleString()
                        : '0.00'}
                    </div>
                    <div style={styles.transactionField}>
                      <strong>Beneficiary:</strong>{' '}
                      {transaction.beneficiary_name || 'Unknown'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}


// (Google Material Design, 2024)
const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
  header: { marginBottom: '40px', textAlign: 'center' },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: 'var(--text-primary)',
    marginBottom: '8px'
  },
  subtitle: { fontSize: '18px', color: 'var(--text-secondary)' },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
    marginBottom: '40px'
  },
  statCard: {
    background: 'var(--surface-color)',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  statIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '8px',
    backgroundColor: 'rgba(49, 130, 206, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--accent-color)'
  },
  statContent: { flex: 1 },
  statNumber: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: 'var(--text-primary)',
    marginBottom: '4px'
  },
  statLabel: { color: 'var(--text-secondary)', fontSize: '14px' },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '40px'
  },
  actionCard: {
    background: 'var(--surface-color)',
    padding: '32px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'transform 0.3s, box-shadow 0.3s',
    textAlign: 'center'
  },
  actionIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: 'rgba(49, 130, 206, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    color: 'var(--accent-color)'
  },
  actionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: 'var(--text-primary)'
  },
  actionDescription: { color: 'var(--text-secondary)', lineHeight: '1.5' },
  section: {
    background: 'var(--surface-color)',
    padding: '32px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'var(--text-primary)'
  },
  viewAllLink: {
    color: 'var(--accent-color)',
    textDecoration: 'none',
    fontWeight: '600'
  },
  loading: { textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--text-secondary)'
  },
  ctaLink: {
    color: 'var(--accent-color)',
    textDecoration: 'none',
    fontWeight: '600',
    marginTop: '8px',
    display: 'inline-block'
  },
  transactionsList: { display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' },
  transactionCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    padding: '16px 20px',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    border: '1px solid #eaeaea'
  },
  transactionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    fontSize: '0.9rem',
    color: '#666'
  },
  transactionBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '0.95rem',
    color: '#333'
  },
  transactionField: { marginBottom: '4px' },
  transactionDate: { color: 'var(--text-secondary)', fontSize: '14px' },
  transactionStatus: { fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }
}

export default CustomerDashboard

/*
----------------------------------
Reference List
----------------------------------

Google Material Design. 2024. Visual hierarchy and layout design principles. [online]. Available at: https://m3.material.io/ [3 October 2025]
Lucide React Icons. 2024. Lucide React Icon Components (Plus, History, User, TrendingUp). [online]. Available at: https://lucide.dev/docs/lucide-react [3 October 2025]
MDN Web Docs. 2024. Using the Fetch API and Promises in JavaScript. [online]. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch [3 October 2025]
MDN Web Docs. 2024. Array.prototype.map(), filter(), reduce() methods. [online]. Available at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array [5 October 2025]
OWASP Foundation. 2024. Secure data handling and API integration best practices. [online]. Available at: https://owasp.org/ [3 October 2025]
React Documentation. 2024. React – A JavaScript library for building user interfaces. [online]. Available at: https://react.dev [5 October 2025]
React Helmet Async Documentation. 2024. Managing document head with react-helmet-async. [online]. Available at: https://github.com/staylor/react-helmet-async [5 October 2025]
React Router Documentation. 2024. Link component and routing navigation. [online]. Available at: https://reactrouter.com/en/main [29 October 2025]

*/
