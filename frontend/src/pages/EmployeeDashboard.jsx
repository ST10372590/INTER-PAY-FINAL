import React, { useEffect, useState } from 'react'; // (React Documentation, 2024)
import { Link } from 'react-router-dom'; // (React Router Documentation, 2024)
import { employeeService } from '../services/api';
import { getCurrentUser } from '../services/authService';
import { User, History, TrendingUp, CheckCircle } from 'lucide-react'; // (Lucide React Icons, 2024)

const EmployeeDashboard = () => {
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    pendingTransactions: 0,
    verifiedTransactions: 0,
    rejectedTransactions: 0,
  });
  const [pendingTransactions, setPendingTransactions] = useState([]);

  useEffect(() => {
    const user = getCurrentUser();
    setFullName(user?.full_name || user?.username || 'Employee');
    fetchTransactionsAndCount();
  }, []);

  const fetchTransactionsAndCount = async () => {
    setLoading(true);
    try {
      const response = await employeeService.getAllTransactions(); // (OWASP Foundation, 2024)
      // Support response shape: response.transactions or response.data.transactions (MDN Web Docs, 2024)
      const transactions = response.transactions || response.data?.transactions || [];

      // Count transactions based on their status using Array.prototype.reduce() (MDN Web Docs, 2024)
      const counts = transactions.reduce(
        (acc, t) => {
          const status = t.status?.toLowerCase() || '';
          if (status === 'pending') acc.pending++;
          else if (status === 'verified') acc.verified++;
          else if (status === 'rejected') acc.rejected++;
          return acc;
        },
        { pending: 0, verified: 0, rejected: 0 }
      );

      setStats({
        totalTransactions: transactions.length,
        pendingTransactions: counts.pending,
        verifiedTransactions: counts.verified,
        rejectedTransactions: counts.rejected,
      });

      // Filter pending transactions and display first five for review (MDN Web Docs, 2024)
      const pending = transactions.filter(t => (t.status?.toLowerCase() === 'pending')).slice(0, 5);
      setPendingTransactions(pending);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: 80 }}>Loading dashboard...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Header Section (Google Material Design, 2024) */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          Welcome, <span style={styles.accent}>{fullName}</span>
        </h1>
        <p style={styles.subtitle}>Here’s an overview of your employee account.</p>
      </div>

      {/* Stats Section (Google Material Design, 2024) */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
          <TrendingUp size={26} color="white" />
          <div style={styles.statNumber}>{stats.totalTransactions}</div>
          <div style={styles.statLabel}>Total Transactions</div>
        </div>

        <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)' }}>
          <History size={26} color="white" />
          <div style={styles.statNumber}>{stats.pendingTransactions}</div>
          <div style={styles.statLabel}>Pending Review</div>
        </div>

        <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
          <CheckCircle size={26} color="white" />
          <div style={styles.statNumber}>{stats.verifiedTransactions}</div>
          <div style={styles.statLabel}>Verified</div>
        </div>

        <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #f85032 0%, #e73827 100%)' }}>
          <History size={26} color="white" />
          <div style={styles.statNumber}>{stats.rejectedTransactions}</div>
          <div style={styles.statLabel}>Rejected</div>
        </div>
      </div>

      {/* To Be Reviewed Section (Google Material Design, 2024) */}
      <div style={styles.reviewSection}>
        <h2 style={styles.reviewTitle}>To Be Reviewed</h2>
        {pendingTransactions.length === 0 ? (
          <p>No pending transactions to review.</p>
        ) : (
          <ul style={styles.transactionList}>
            {pendingTransactions.map(t => (
              <li key={t._id || t.id} style={styles.transactionItem}>
                <div>
                  <strong>{t.beneficiary_name || 'Unknown Beneficiary'}</strong> — {t.amount?.toLocaleString()} {t.currency}
                </div>
                <div style={styles.transactionDate}>
                  {new Date(t.createdAt || t.date).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        )}
        <Link to="/employee/transactions" style={styles.viewAllLink}>
          View All Transactions
        </Link>
      </div>

      {/* Actions Section (React Router Documentation, 2024) */}
      <div style={styles.actionsGrid}>
        <Link to="/employee/profile" style={styles.actionCard}>
          <User size={20} /> Profile
        </Link>
        <Link to="/employee/transactions" style={styles.actionCard}>
          <History size={20} /> Transactions
        </Link>
      </div>
    </div>
  );
};

// (Google Material Design, 2024)
const styles = {
  container: {
    padding: '40px 20px',
    maxWidth: 1100,
    margin: 'auto',
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    textAlign: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 6,
    color: '#222',
  },
  accent: {
    color: '#007bff',
  },
  subtitle: {
    color: '#555',
    fontSize: 16,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 20,
    marginBottom: 40,
  },
  statCard: {
    borderRadius: 16,
    padding: '25px 20px',
    textAlign: 'center',
    color: 'white',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'default',
  },
  statNumber: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 15,
    opacity: 0.9,
    marginTop: 4,
  },
  reviewSection: {
    marginBottom: 40,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  reviewTitle: {
    fontSize: 22,
    fontWeight: 600,
    marginBottom: 15,
    color: '#333',
  },
  transactionList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  transactionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #ddd',
    fontSize: 15,
    color: '#444',
  },
  transactionDate: {
    fontStyle: 'italic',
    color: '#666',
  },
  viewAllLink: {
    display: 'inline-block',
    marginTop: 12,
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: 600,
    cursor: 'pointer',
  },
  actionsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
  actionCard: {
    flex: '1 1 250px',
    backgroundColor: '#f4f4f4',
    padding: '18px 15px',
    borderRadius: 10,
    textDecoration: 'none',
    fontWeight: 600,
    color: '#222',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'background-color 0.2s ease, transform 0.2s ease',
  },
  actionCardHover: {
    backgroundColor: '#eaeaea',
    transform: 'translateY(-2px)',
  },
};

export default EmployeeDashboard;

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

