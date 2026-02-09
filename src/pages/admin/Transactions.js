import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Search, Filter, Download, 
  ArrowUpRight, ArrowDownRight, Loader2
} from 'lucide-react';

const API_BASE_URL = 'https://ilikoapi.duckdns.org/api/v1';

const AdminTransactions = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [currencySymbol, setCurrencySymbol] = useState('₹'); // ✅ NEW: Dynamic currency

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || localStorage.getItem('accessToken');
  };

  // ✅ NEW: Fetch currency symbol
  const fetchCurrencySymbol = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/currency`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const result = await response.json();
      
      if (result.success && result.data?.currencySymbol) {
        setCurrencySymbol(result.data.currencySymbol);
      }
    } catch (error) {
      console.error('Error fetching currency:', error);
    }
  };

  // ✅ UPDATED: Fetch transactions and currency
  const fetchTransactions = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch currency first
      await fetchCurrencySymbol();
      
      const response = await fetch(`${API_BASE_URL}/transactions?page=${page}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch transactions');
      
      const result = await response.json();
      
      if (result.success) {
        setTransactions(result.data);
        setPagination(result.pagination);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Filter transactions
  const filteredTransactions = transactions.filter(txn => {
    const customerName = txn.customer ? `${txn.customer.firstName} ${txn.customer.lastName}`.toLowerCase() : '';
    const merchantName = txn.merchant?.businessName?.toLowerCase() || '';
    const txnId = txn.transactionId?.toLowerCase() || '';
    const searchLower = searchQuery.toLowerCase();
    
    const matchesSearch = txnId.includes(searchLower) || 
                         customerName.includes(searchLower) || 
                         merchantName.includes(searchLower);
    const matchesFilter = filterType === 'all' || txn.type === filterType;
    return matchesSearch && matchesFilter;
  });

  // Calculate totals
  const totalAmount = filteredTransactions.reduce((sum, txn) => sum + (txn.amount?.total || 0), 0);
  const totalPoints = filteredTransactions.reduce((sum, txn) => {
    if (txn.type === 'earn') return sum + (txn.points?.earned || 0);
    if (txn.type === 'redeem') return sum + (txn.points?.redeemed || 0);
    return sum;
  }, 0);

  // Format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return { date: 'N/A', time: 'N/A' };
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  // ✅ UPDATED: Export to CSV with dynamic currency
  const exportToCSV = () => {
    const headers = ['Transaction ID', 'Customer', 'Merchant', 'Type', 'Amount', 'Points', 'Date', 'Status'];
    const csvData = filteredTransactions.map(txn => [
      txn.transactionId,
      txn.customer ? `${txn.customer.firstName} ${txn.customer.lastName}` : 'Guest',
      txn.merchant?.businessName || 'N/A',
      txn.type,
      `${currencySymbol}${txn.amount?.total || 0}`,
      txn.type === 'earn' ? txn.points?.earned : -txn.points?.redeemed,
      formatDateTime(txn.createdAt).date,
      txn.status
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-700 border-green-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      failed: 'bg-red-100 text-red-700 border-red-200'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    return type === 'earn' ? (
      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
        <ArrowDownRight className="w-4 h-4 text-green-600" />
      </div>
    ) : (
      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
        <ArrowUpRight className="w-4 h-4 text-red-600" />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Error: {error}</p>
          <button 
            onClick={() => fetchTransactions()}
            className="mt-2 text-red-600 hover:text-red-700 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">Monitor all transactions across the platform</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="btn-primary flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {filteredTransactions.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Amount</p>
              {/* ✅ UPDATED: Dynamic currency */}
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {currencySymbol}{totalAmount.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <ArrowDownRight className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Points</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalPoints.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by ID, customer, or merchant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field w-full md:w-48"
          >
            <option value="all">All Types</option>
            <option value="earn">Earn Points</option>
            <option value="redeem">Redeem Points</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Transaction</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Merchant</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Points</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date & Time</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => {
                  const { date, time } = formatDateTime(txn.createdAt);
                  const customerName = txn.customer 
                    ? `${txn.customer.firstName} ${txn.customer.lastName}` 
                    : 'Guest Customer';
                  
                  return (
                    <tr key={txn._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(txn.type)}
                          <div>
                            <p className="font-medium text-gray-900">{txn.transactionId}</p>
                            <p className="text-xs text-gray-500 capitalize">{txn.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-900">{customerName}</p>
                        {txn.customer?.email && (
                          <p className="text-xs text-gray-500">{txn.customer.email}</p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-900">{txn.merchant?.businessName || 'N/A'}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          txn.type === 'earn' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {txn.type === 'earn' ? 'Earn' : 'Redeem'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {/* ✅ UPDATED: Dynamic currency */}
                        <p className="font-medium text-gray-900">
                          {txn.amount?.total > 0 ? `${currencySymbol}${txn.amount.total}` : '-'}
                        </p>
                        {/* {txn.amount?.currency && (
                          <p className="text-xs text-gray-500">{txn.amount.currency}</p>
                        )} */}
                      </td>
                      <td className="py-4 px-4">
                        {txn.type === 'earn' ? (
                          <span className="font-medium text-green-600">
                            +{txn.points?.earned || 0}
                          </span>
                        ) : (
                          <span className="font-medium text-red-600">
                            -{txn.points?.redeemed || 0}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-sm text-gray-900">{date}</p>
                          <p className="text-xs text-gray-500">{time}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(txn.status)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">{filteredTransactions.length}</span> of{' '}
            <span className="font-medium">{pagination.total}</span> transactions
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => fetchTransactions(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="btn-secondary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button 
              onClick={() => fetchTransactions(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="btn-primary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTransactions;