import React, { useEffect, useState } from 'react'; // React core library and hooks (React, 2025)
import { Helmet } from 'react-helmet-async'; // Helmet for dynamic document head (react-helmet-async, 2024)
import { useAuth } from '../contexts/AuthContext';
import { paymentService } from '../services/api';

export default function TransactionHistory() {
    // Access authentication token from AuthContext (React Context API, 2024)
    const { token } = useAuth();

    // State variables for managing transactions, loading state, and errors
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // useEffect runs when the component mounts or when token changes (React, 2025)
    useEffect(() => {
        if (token) {
            // Fetch transactions only if user is authenticated
            fetchTransactions();
        } else {
            // Show error message if user is not logged in
            setError('Please login to view transactions');
            setLoading(false);
        }
    }, [token]);

    // Function to fetch transactions from the backend API
    const fetchTransactions = async () => {
        try {
            setLoading(true);
            setError('');

            // Fetch transactions via paymentService API call (REST API concepts, 2025)
            const response = await paymentService.getTransactions();

            // Extract transaction data safely
            const transactionsData = response.data || response.transactions || response;

            // Ensure transactionsData is an array before setting state
            setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
        } catch (err) {
            // Handle and log any API or network errors
            console.error('Error fetching transactions:', err);
            setError(err.response?.data?.message || err.message || 'Failed to fetch transactions');
        } finally {
            // Stop loading spinner once data or error is handled
            setLoading(false);
        }
    };

    // Function to return dynamic CSS classes for different transaction statuses (CSS styling, 2023)
    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'status status-pending';
            case 'verified': return 'status status-verified';
            case 'completed': return 'status status-completed';
            case 'submitted': return 'status status-submitted';
            case 'failed': return 'status status-failed';
            default: return 'status status-default';
        }
    };

    return (
        <>
            {/* Helmet dynamically sets the page title in the browser tab (react-helmet-async, 2024) */}
            <Helmet>
                <title>Transaction History - International Payments Portal</title>
            </Helmet>

            <div className="history-container">
                {/* Neat Header Section */}
                <div className="header" style={headerStyles.container}>
                    <h2 style={headerStyles.title}>
                        Transaction History
                    </h2>
                    <p style={headerStyles.subtitle}>
                        Review and manage all your payment transactions below
                    </p>
                    <hr style={headerStyles.divider} />
                </div>

                {/* Loading State Section */}
                {loading && (
                    <div className="loading-section">
                        <div className="loader"></div>
                        <p>Loading transactions...</p>
                    </div>
                )}

                {/* Error Message Section */}
                {error && (
                    <div className="error-message">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {/* No Transactions Found Section */}
                {!loading && !error && transactions.length === 0 && (
                    <div className="no-transactions">
                        <p>No transactions found.</p>
                        {/* Button to redirect users to make a payment */}
                        <a href="/make-payment" className="make-payment-btn">
                            Make Your First Payment
                        </a>
                    </div>
                )}

                {/* Transactions Table Section */}
                {!loading && !error && transactions.length > 0 && (
                    <div className="table-container">
                        <table className="transaction-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Currency</th>
                                    <th>Beneficiary</th>
                                    <th>Provider</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Render each transaction as a table row */}
                                {transactions.map((tx, index) => (
                                    <tr key={tx._id || `tx-${index}`}>
                                        {/* Transaction Date */}
                                        <td>{new Date(tx.createdAt || Date.now()).toLocaleString()}</td>

                                        {/* Transaction Amount */}
                                        <td><strong>{parseFloat(tx.amount || 0).toFixed(2)}</strong></td>

                                        {/* Transaction Currency */}
                                        <td>{tx.currency || 'USD'}</td>

                                        {/* Beneficiary Details */}
                                        <td>
                                            <div>{tx.beneficiary_name || 'Unknown'}</div>
                                            <small>{tx.beneficiary_account_number || ''}</small>
                                        </td>

                                        {/* Payment Provider */}
                                        <td>{tx.provider || 'SWIFT'}</td>

                                        {/* Transaction Status with Dynamic Class */}
                                        <td>
                                            <span className={getStatusClass(tx.status)}>
                                                {tx.status ? tx.status.charAt(0).toUpperCase() + tx.status.slice(1) : 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Summary Section showing number of transactions */}
                        <div className="summary">
                            Showing <strong>{transactions.length}</strong> transaction(s)
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

const headerStyles = {
    container: {
        marginBottom: '30px',
        textAlign: 'center',
        color: 'var(--text-primary)',
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: '700',
        marginBottom: '8px',
    },
    subtitle: {
        fontSize: '1.125rem',
        fontWeight: '400',
        color: 'var(--text-secondary)',
        marginBottom: '12px',
    },
    divider: {
        width: '60px',
        height: '3px',
        backgroundColor: 'var(--accent-color)',
        border: 'none',
        margin: '0 auto',
        borderRadius: '2px',
    },
};

/* 
------------------------------------------------------------
References
------------------------------------------------------------
CSS Styling. 2023. CSS Basics. W3Schools, n.d. [Online]. Available at: https://www.w3schools.com/css/ [Accessed 8 October 2025]
React. 2025. React documentation. Meta Platforms, Inc, n.d. [Online]. Available at: https://react.dev [Accessed 8 October 2025]
React Context API. 2024. Context API documentation. Meta Platforms, Inc, n.d. [Online]. Available at: https://react.dev/learn/passing-data-deeply [Accessed 8 October 2025]
react-helmet-async. 2024. React Helmet Async GitHub repository, n.d. [Online]. Available at: https://github.com/staylor/react-helmet-async [Accessed 8 October 2025]
REST API concepts. 2025. REST API tutorial, n.d. [Online]. Available at: https://restfulapi.net/ [Accessed 8 October 2025]
*/
