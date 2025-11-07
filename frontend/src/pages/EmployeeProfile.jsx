import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async' // (React Helmet Async Documentation, 2024)
import { getEmployeeProfile } from '../services/authService'
import { User, Shield, Calendar, CreditCard, AlertCircle } from 'lucide-react' // (Lucide React Icons, 2024)

const EmployeeProfile = () => {
  // State variables for managing profile data, loading, and error (React Documentation, 2024)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load profile on component mount (React Documentation, 2024)
  useEffect(() => {
    loadProfile()
  }, [])

  // Fetch employee profile securely from backend API (OWASP Foundation, 2024)
  const loadProfile = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await getEmployeeProfile()

      if (response.success && response.data) {
        setProfile(response.data)
      } else {
        setError('Invalid profile data received')
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
      setError(error.response?.data?.message || error.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  // Format dates to readable strings (MDN Web Docs, 2024)
  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Display a loading spinner (Google Material Design, 2024)
  if (loading) {
    return (
      <div style={styles.loading}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <div style={{ marginTop: 16 }}>Loading profile...</div>
      </div>
    )
  }

  // Display error card if data fails to load (OWASP Foundation, 2024)
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <AlertCircle size={48} color="#e63946" />
          <h2 style={{ fontSize: 24, marginTop: 16 }}>Failed to Load Profile</h2>
          <p style={{ color: '#555', marginTop: 8 }}>{error}</p>
          <button onClick={loadProfile} style={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Display a fallback message if no profile is found
  if (!profile) {
    return (
      <div style={styles.error}>
        <div>No profile data available</div>
      </div>
    )
  }

  return (
    <>
      {/* Helmet sets page title for SEO and user clarity (React Helmet Async Documentation, 2024) */}
      <Helmet>
        <title>Employee Profile - International Payments Portal</title>
      </Helmet>

      <div style={styles.container}>
        {/* Header section (Google Material Design, 2024) */}
        <div style={styles.header}>
          <h1 style={styles.title}>Employee Profile</h1>
          <p style={styles.subtitle}>Manage your employee account information</p>
        </div>

        <div style={styles.profileGrid}>
          {/* ===================== PERSONAL INFORMATION ===================== */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <User size={24} color="#2563eb" />
              <h2 style={styles.sectionTitle}>Personal Information</h2>
            </div>

            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <label style={styles.infoLabel}>Full Name</label>
                <div style={styles.infoValue}>{profile.full_name || 'N/A'}</div>
              </div>

              <div style={styles.infoItem}>
                <label style={styles.infoLabel}>Username</label>
                <div style={styles.infoValue}>{profile.username || 'N/A'}</div>
              </div>

              <div style={styles.infoItem}>
                <label style={styles.infoLabel}>Employee ID</label>
                <div style={styles.infoValue}>{profile.employee_id || 'N/A'}</div>
              </div>

              <div style={styles.infoItem}>
                <label style={styles.infoLabel}>Email</label>
                <div style={styles.infoValue}>{profile.email || 'N/A'}</div>
              </div>

              <div style={styles.infoItem}>
                <label style={styles.infoLabel}>Date Joined</label>
                <div style={styles.infoValue}>
                  <Calendar size={16} style={{ marginRight: 8 }} />
                  {formatDate(profile.created_at || profile.createdAt)}
                </div>
              </div>
            </div>
          </div>

          {/* ===================== ACCOUNT STATUS ===================== */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <Shield size={24} color="#2563eb" />
              <h2 style={styles.sectionTitle}>Account Status</h2>
            </div>

            <div style={styles.statusGrid}>
              <div style={styles.statusItem}>
                <div style={styles.statusLabel}>Account Status</div>
                <div
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: profile.is_active
                      ? 'rgba(34,197,94,0.15)'
                      : 'rgba(239,68,68,0.15)',
                    color: profile.is_active ? '#16a34a' : '#dc2626',
                  }}
                >
                  {profile.is_active ? '✓ Active' : '✗ Inactive'}
                </div>
              </div>

              <div style={styles.statusItem}>
                <div style={styles.statusLabel}>Last Login</div>
                <div style={styles.statusValue}>
                  <Calendar size={16} style={{ marginRight: 8 }} />
                  {formatDate(profile.last_login)}
                </div>
              </div>

              <div style={styles.statusItem}>
                <div style={styles.statusLabel}>Account Age</div>
                <div style={styles.statusValue}>
                  {profile.created_at
                    ? `${Math.floor(
                        (Date.now() -
                          new Date(profile.created_at).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )} days`
                    : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* ===================== ROLE & ACCESS ===================== */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <CreditCard size={24} color="#2563eb" />
              <h2 style={styles.sectionTitle}>Role & Access</h2>
            </div>

            <div style={styles.roleInfo}>
              <div style={styles.roleItem}>
                <label style={styles.roleLabel}>Role</label>
                <div style={styles.roleBadge}>{profile.role || 'Employee'}</div>
              </div>

              <div style={styles.accessInfo}>
                <h4 style={styles.accessTitle}>Access Features:</h4>
                <ul style={styles.featuresList}>
                  <li>✓ View assigned tasks</li>
                  <li>✓ Manage customer transactions</li>
                  <li>✓ Update account information</li>
                  <li>✓ Access secure employee portal</li>
                </ul>
              </div>
            </div>
          </div>

          {/* ===================== SECURITY INFORMATION ===================== */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <Shield size={24} color="#2563eb" />
              <h2 style={styles.sectionTitle}>Security Information</h2>
            </div>

            <div style={styles.securityInfo}>
              <div style={styles.securityNotice}>
                <p style={styles.noticeText}>
                  Your account is protected with industry-standard security
                  measures.
                </p>
              </div>

              <div style={styles.securityTips}>
                <h4 style={styles.tipsTitle}>Security Best Practices:</h4>
                <ul style={styles.tipsList}>
                  <li>Use a strong, unique password</li>
                  <li>Never share your credentials</li>
                  <li>Always log out after use</li>
                  <li>Report suspicious activity</li>
                  <li>Keep contact info up to date</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  header: {
    marginBottom: '40px',
    textAlign: 'center',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: 'var(--text-primary)',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '18px',
    color: 'var(--text-secondary)',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh',
    fontSize: '18px',
    color: 'var(--text-secondary)',
  },
  error: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh',
    fontSize: '18px',
    color: 'var(--error-color)',
  },
  errorCard: {
    background: 'var(--surface-color)',
    padding: '48px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
    maxWidth: '500px',
    margin: '0 auto',
  },
  retryButton: {
    marginTop: '24px',
    padding: '12px 24px',
    backgroundColor: 'var(--accent-color)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  profileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px',
  },
  section: {
    background: 'var(--surface-color)',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '2px solid var(--border-color)',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'var(--text-primary)',
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid var(--border-color)',
  },
  infoLabel: {
    fontWeight: '600',
    color: 'var(--text-secondary)',
    fontSize: '14px',
  },
  infoValue: {
    color: 'var(--text-primary)',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
  },
  statusGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  statusItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid var(--border-color)',
  },
  statusLabel: {
    fontWeight: '600',
    color: 'var(--text-secondary)',
    fontSize: '14px',
  },
  statusValue: {
    fontSize: '14px',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
  },
  statusBadge: {
    fontSize: '14px',
    fontWeight: '600',
    padding: '6px 12px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  roleInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  roleItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid var(--border-color)',
  },
  roleLabel: {
    fontWeight: '600',
    color: 'var(--text-secondary)',
    fontSize: '14px',
  },
  roleBadge: {
    backgroundColor: 'rgba(49, 130, 206, 0.1)',
    color: 'var(--accent-color)',
    padding: '6px 16px',
    borderRadius: '16px',
    fontSize: '14px',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  accessInfo: {
    marginTop: 8,
  },
  accessTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    color: 'var(--text-primary)',
  },
  featuresList: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    paddingLeft: 0,
    listStyle: 'none',
    lineHeight: 2,
  },
  securityInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  securityNotice: {
    padding: 16,
    backgroundColor: 'rgba(56, 161, 105, 0.05)',
    borderRadius: 6,
    border: '1px solid rgba(56, 161, 105, 0.2)',
  },
  noticeText: {
    fontSize: 14,
    color: 'var(--text-primary)',
    margin: 0,
  },
  securityTips: {
    padding: 16,
    backgroundColor: 'rgba(49, 130, 206, 0.05)',
    borderRadius: 6,
    border: '1px solid rgba(49, 130, 206, 0.2)',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    color: 'var(--text-primary)',
  },
  tipsList: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    paddingLeft: 20,
    lineHeight: 1.8,
    margin: 0,
  },
}

export default EmployeeProfile

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
