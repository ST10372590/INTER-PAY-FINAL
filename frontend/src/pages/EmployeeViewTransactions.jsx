import React, { useEffect, useState } from 'react' // (React Documentation, 2024)
import { Link } from 'react-router-dom' // (React Router Documentation, 2024)
import { employeeService } from '../services/api'
import { ArrowLeft, Loader, X } from 'lucide-react' // (Lucide React Icons, 2024)

const EmployeeViewTransactions = () => {

  // State variables (React Documentation, 2024)
  const [transactions, setTransactions] = useState([]) 
  const [filteredTransactions, setFilteredTransactions] = useState([]) 
  const [loading, setLoading] = useState(true) 
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(null) 
  const [submitLoading, setSubmitLoading] = useState(false) 
  const [filterStatus, setFilterStatus] = useState('all') 
  const [filterDate, setFilterDate] = useState('')
  const [filterBeneficiary, setFilterBeneficiary] = useState('')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false) 
  const [detailsError, setDetailsError] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())

  // Lifecycle hooks (React Documentation, 2024)
  useEffect(() => {
    fetchAllTransactions()
  }, [])

  // Reapply filters when transactions or filters change
  useEffect(() => {
    applyFilters(filterStatus, filterDate, filterBeneficiary)
  }, [transactions, filterStatus, filterDate, filterBeneficiary])

  // Keep selection valid when filters change
  useEffect(() => {
    setSelectedIds(prevSelected => {
      const filteredIds = new Set(filteredTransactions.map(t => t._id || t.id))
      const newSelected = new Set([...prevSelected].filter(id => filteredIds.has(id)))
      return newSelected
    })
  }, [filteredTransactions])

  // Fetch all transactions from backend using asynchronous data handling (MDN Web Docs, 2024; OWASP Foundation, 2024)
  const fetchAllTransactions = async () => {
    setLoading(true)
    try {
      const response = await employeeService.getAllTransactions()
      setTransactions(response.transactions || response.data?.transactions || [])
    } catch (err) {
      console.error('Failed to load transactions:', err)
      setError('Failed to load transactions. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  // Apply filters for status, date, and beneficiary (MDN Web Docs, 2024)
  const applyFilters = (status, date, beneficiary) => {
    let filtered = transactions
    if (status !== 'all') filtered = filtered.filter(t => t.status?.toLowerCase() === status)
    if (date) {
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.createdAt || t.date)
        return transactionDate.toISOString().split('T')[0] === date
      })
    }
    if (beneficiary.trim() !== '') {
      const lowerBeneficiary = beneficiary.toLowerCase()
      filtered = filtered.filter(t => (t.beneficiary_name || '').toLowerCase().includes(lowerBeneficiary))
    }
    setFilteredTransactions(filtered)
  }

  // Toggle single transaction selection (React Documentation, 2024)
  const toggleSelectTransaction = (id) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }

  // Toggle select all transactions currently filtered
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredTransactions.length) {
      setSelectedIds(new Set())
    } else {
      const allIds = filteredTransactions.map(t => t._id || t.id)
      setSelectedIds(new Set(allIds))
    }
  }

  // Approve a transaction
  const handleApprove = async (transactionId) => {
    try {
      setActionLoading(transactionId)
      await employeeService.verifyTransaction(transactionId, '')
      setTransactions(prev =>
        prev.map(t =>
          (t._id === transactionId || t.id === transactionId)
            ? { ...t, status: 'verified' }
            : t
        )
      )
      closeDetailsModal()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve transaction. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  // Reject a transaction (OWASP Foundation, 2024)
  const handleReject = async (transactionId) => {
    const reason = prompt('Please enter the reason for rejection:')
    if (!reason?.trim()) return alert('Rejection reason is required.')
    try {
      setActionLoading(transactionId)
      await employeeService.rejectTransaction(transactionId, reason)
      setTransactions(prev =>
        prev.map(t =>
          (t._id === transactionId || t.id === transactionId)
            ? { ...t, status: 'rejected' }
            : t
        )
      )
      closeDetailsModal()
    } catch (err) {
      alert('Failed to reject transaction. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  // Open transaction details modal (Google Material Design, 2024)
  const openDetailsModal = async (transactionId) => {
    setDetailsError('')
    setDetailsLoading(true)
    setShowDetailsModal(true)
    try {
      const data = await employeeService.getTransactionById(transactionId)
      setSelectedTransaction(data.data || null)
    } catch (err) {
      setDetailsError('Failed to load transaction details.')
    } finally {
      setDetailsLoading(false)
    }
  }

  // Close transaction details modal
  const closeDetailsModal = () => {
    setShowDetailsModal(false)
    setSelectedTransaction(null)
  }

  // Submit verified transactions to SWIFT
  const handleSubmitToSwift = async () => {
    console.log('Submit to SWIFT clicked')
    const selectedTransactions = filteredTransactions.filter(t => selectedIds.has(t._id || t.id))
    if (selectedTransactions.length === 0) return alert('Please select at least one transaction to submit.')

    const invalidTransactions = selectedTransactions.filter(t => t.status?.toLowerCase() !== 'verified')
    if (invalidTransactions.length > 0) {
      alert(`Only verified transactions can be submitted to SWIFT.\n${invalidTransactions.length} selected transaction(s) are pending or rejected.`)
      return
    }

    const idsToSubmit = selectedTransactions.map(t => t._id || t.id)

    try {
      setSubmitLoading(true)
      await employeeService.submitToSwift(idsToSubmit)
      alert(`Successfully submitted ${idsToSubmit.length} transaction(s) to SWIFT.`)
      setSelectedIds(new Set())
      fetchAllTransactions()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit transactions to SWIFT. Please try again.')
    } finally {
      setSubmitLoading(false)
    }
  }

  const isActionDisabled = actionLoading || !['pending'].includes(selectedTransaction?.status?.toLowerCase())

  // JSX layout uses Material-inspired hierarchy (Google Material Design, 2024)
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Link to="/employee/dashboard" style={styles.backLink}>
          <ArrowLeft size={20} /> Back to Dashboard
        </Link>
        <h1>Customer Transactions</h1>
      </div>

      {/* Filters Section */}
      <div style={styles.filtersWrapper}>
        <div style={styles.filterContainer}>
          <label style={styles.filterLabel}>Beneficiary:</label>
          <input
            type="text"
            value={filterBeneficiary}
            onChange={(e) => setFilterBeneficiary(e.target.value)}
            placeholder="Enter name"
            style={styles.filterSelect}
          />
        </div>

        <div style={styles.filterContainer}>
          <label style={styles.filterLabel}>Date:</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            style={styles.filterSelect}
          />
        </div>

        <div style={styles.filterContainer}>
          <label style={styles.filterLabel}>Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Selection Summary */}
      {selectedIds.size > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={styles.selectionInfo}>
            {selectedIds.size} transaction{selectedIds.size > 1 ? 's' : ''} selected.
            <button onClick={() => setSelectedIds(new Set())} style={styles.clearSelectionBtn}>
              Clear Selection
            </button>
          </div>

          <button
            onClick={handleSubmitToSwift}
            disabled={
              submitLoading ||
              !filteredTransactions.some(t => selectedIds.has(t._id || t.id) && t.status?.toLowerCase() === 'verified')
            }
            style={{
              ...styles.submitSwiftBtn,
              opacity: submitLoading ? 0.6 : 1,
              cursor: submitLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {submitLoading ? 'Submitting...' : 'Submit to SWIFT'}
          </button>
        </div>
      )}

      {/* Select All Checkbox */}
      <div style={styles.selectAllContainer}>
        <label style={{ cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={selectedIds.size === filteredTransactions.length && filteredTransactions.length > 0}
            onChange={toggleSelectAll}
            style={{ marginRight: 8 }}
          />
          Select All ({filteredTransactions.length} filtered transaction{filteredTransactions.length !== 1 ? 's' : ''})
        </label>
      </div>

      {/* Transactions Grid */}
      {loading ? (
        <div style={styles.loading}><Loader className="spin" size={30} /> <span>Loading...</span></div>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : filteredTransactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <div style={styles.cardsGrid}>
          {filteredTransactions.map((t, i) => {
            const id = t._id || t.id || i
            const isSelected = selectedIds.has(id)
            return (
              <div
                key={id}
                style={{ ...styles.card, ...statusBorder(t.status) }}
                onClick={(e) => {
                  if (e.target.type === 'checkbox') return
                  openDetailsModal(id)
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelectTransaction(id)}
                  onClick={(e) => e.stopPropagation()}
                  style={styles.checkbox}
                />
                <div style={styles.cardHeader}>
                  <strong>{t.beneficiary_name || 'Unknown Beneficiary'}</strong>
                  <span style={{ ...styles.statusBadge, ...statusColor(t.status) }}>{t.status}</span>
                </div>
                <div style={styles.cardBody}>
                  <p><strong>Amount:</strong> {t.amount?.toLocaleString()} {t.currency}</p>
                  <p><strong>Date:</strong> {new Date(t.createdAt || t.date).toLocaleString()}</p>
                  <p><strong>Account:</strong> {t.beneficiary_account_number}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Transaction Details Modal */}
      {showDetailsModal && (
        <div style={styles.modalBackdrop} onClick={closeDetailsModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button onClick={closeDetailsModal} style={styles.modalCloseBtn}><X size={24} /></button>

            {detailsLoading ? (
              <div style={styles.loading}><Loader className="spin" size={30} /> <span>Loading details...</span></div>
            ) : detailsError ? (
              <p style={{ color: 'red' }}>{detailsError}</p>
            ) : selectedTransaction ? (
              <>
                <h2>Transaction Details</h2>
                <table style={{ width: '100%', marginTop: 10 }}>
                  <tbody>
                    {Object.entries({
                      'Transaction ID': selectedTransaction._id,
                      'Date': new Date(selectedTransaction.createdAt).toLocaleString(),
                      'Customer Name': selectedTransaction.customer_id?.full_name || 'N/A',
                      'Beneficiary Name': selectedTransaction.beneficiary_name,
                      'Beneficiary Account': selectedTransaction.beneficiary_account_number,
                      'Amount': `${selectedTransaction.amount.toLocaleString()} ${selectedTransaction.currency}`,
                      'Bank Name': selectedTransaction.bank_name,
                      'Bank Country': selectedTransaction.bank_country,
                      'SWIFT Code': selectedTransaction.swift_code || 'N/A',
                      'Status': selectedTransaction.status
                    }).map(([key, value]) => (
                      <tr key={key}><td><strong>{key}:</strong></td><td>{value}</td></tr>
                    ))}
                  </tbody>
                </table>

                <div style={styles.modalActions}>
                  <button
                    style={{
                      ...styles.approveBtn,
                      backgroundColor: isActionDisabled ? '#aaa' : 'green',
                      cursor: isActionDisabled ? 'not-allowed' : 'pointer',
                    }}
                    onClick={() => handleApprove(selectedTransaction._id)}
                    disabled={isActionDisabled}
                  >
                    {actionLoading ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    style={{
                      ...styles.rejectBtn,
                      backgroundColor: isActionDisabled ? '#aaa' : 'red',
                      cursor: isActionDisabled ? 'not-allowed' : 'pointer',
                    }}
                    onClick={() => handleReject(selectedTransaction._id)}
                    disabled={isActionDisabled}
                  >
                    Reject
                  </button>
                </div>
              </>
            ) : (
              <p>No details found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* Styling section inspired by Material Design principles (Google Material Design, 2024) */
const styles = {
  container: { padding: 20, maxWidth: 1100, margin: 'auto' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backLink: { display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: '#007bff', fontWeight: 'bold' },
  
  // The filtering styling
  filtersWrapper: { display: 'flex', gap: 24, marginBottom: 24, flexWrap: 'wrap' },
  filterContainer: { display: 'flex', alignItems: 'center', gap: 12 },
  filterLabel: { fontWeight: '700', fontSize: 16, color: '#333' },
  filterSelect: { padding: '8px 12px', borderRadius: 6, border: '1.5px solid #bbb', fontSize: 15 },
  
  // The transactions card styling
  cardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 },
  card: { background: '#fff', padding: 16, paddingLeft: 40, borderRadius: 8, boxShadow: '0 2px 5px rgba(0,0,0,0.1)', cursor: 'pointer' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 8 },
  statusBadge: { padding: '2px 8px', borderRadius: 4, fontWeight: 'bold', fontSize: 13 },
  cardBody: { fontSize: 14, color: '#444' },
  loading: { display: 'flex', alignItems: 'center', gap: 10 },
  
  // The transactions details modal styling
  modalBackdrop: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { background: '#fff', borderRadius: 8, maxWidth: 700, maxHeight: '80vh', overflowY: 'auto', padding: 20, position: 'relative' },
  modalCloseBtn: { position: 'absolute', top: 12, right: 12, background: 'transparent', border: 'none', cursor: 'pointer', color: '#999' },
  modalActions: { marginTop: 20, display: 'flex', justifyContent: 'center', gap: 20 },
  approveBtn: { backgroundColor: 'green', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 6, cursor: 'pointer' },
  rejectBtn: { backgroundColor: 'red', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 6, cursor: 'pointer' },
  
  // The checkbox styling
  checkbox: { position: 'absolute', top: 16, left: 12, width: 18, height: 18, cursor: 'pointer' },
  selectAllContainer: { marginBottom: 12, fontSize: 16, fontWeight: '600' },
  selectionInfo: { marginBottom: 12, fontWeight: '600', fontSize: 14, display: 'flex', alignItems: 'center', gap: 12 },
  clearSelectionBtn: { backgroundColor: '#ddd', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontWeight: '600', marginLeft: 12 },
  submitSwiftBtn: { backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 6, fontWeight: '600', cursor: 'pointer', marginTop: 8 },
}

// Status colour and border utilities (MDN Web Docs, 2024)
const statusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'verified': return { backgroundColor: '#d4edda', color: 'green' }
    case 'pending': return { backgroundColor: '#fff3cd', color: 'orange' }
    case 'rejected': return { backgroundColor: '#f8d7da', color: 'red' }
    default: return { backgroundColor: '#eee', color: '#333' }
  }
}

const statusBorder = (status) => {
  switch (status?.toLowerCase()) {
    case 'verified': return { borderLeft: '5px solid green' }
    case 'pending': return { borderLeft: '5px solid orange' }
    case 'rejected': return { borderLeft: '5px solid red' }
    default: return { borderLeft: '5px solid gray' }
  }
}

export default EmployeeViewTransactions

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
React Router Documentation. 2024. Link component and routing navigation. [online]. Available at: https://reactrouter.com/en/main [29 October 2025]
React Helmet Async Documentation. 2024. Managing document head with react-helmet-async. [online]. Available at: https://github.com/staylor/react-helmet-async [5 October 2025]
*/
