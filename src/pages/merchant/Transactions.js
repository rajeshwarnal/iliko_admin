import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Search, Download, Calendar, 
  ArrowUpRight, ArrowDownRight, Filter, Loader2, AlertCircle, RefreshCw
} from 'lucide-react';

const API_BASE_URL = 'https://ilikoapi.duckdns.org/api/v1';

const MerchantTransactions = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
    const [currencySymbol, setCurrencySymbol] = useState('₹'); // ✅ NEW: Dynamic currency

  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Get stored data
  const merchantId = localStorage.getItem('merchantId');
  const accessToken = localStorage.getItem('accessToken');


  const fetchCurrencySymbol = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/currency`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const result = await response.json();
      
      if (result.success && result.data?.currencySymbol) {
        setCurrencySymbol(result.data.currencySymbol);
      }
    } catch (error) {
      console.error('Error fetching currency:', error);
    }
  };

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      if (!merchantId || !accessToken) {
        throw new Error('Authentication required. Please login again.');
      }

      setLoading(true);
      setError('');
      await fetchCurrencySymbol();

      const response = await fetch(
        `${API_BASE_URL}/transactions/merchant/${merchantId}?page=1&limit=100`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const result = await response.json();
      
      if (result.success) {
        setTransactions(result.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load transactions');
      console.error('Transactions error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Filter transactions
  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = 
      txn.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.customer?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.customer?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || txn.type === filterType;
    return matchesSearch && matchesFilter;
  });

  // Calculate today's stats
  const getTodayStats = () => {
    const today = new Date().toDateString();
    const todayTxns = transactions.filter(txn => 
      new Date(txn.createdAt).toDateString() === today
    );

    const todayRevenue = todayTxns.reduce((sum, txn) => 
      sum + (txn.amount?.total || 0), 0
    );

    const todayPoints = todayTxns.reduce((sum, txn) => 
      sum + (txn.points?.earned || 0), 0
    );

    const avgTransaction = todayTxns.length > 0 ? todayRevenue / todayTxns.length : 0;

    return {
      transactions: todayTxns.length,
      revenue: todayRevenue,
      pointsAwarded: todayPoints,
      avgTransaction
    };
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Transactions</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchTransactions}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const todayStats = getTodayStats();

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">View and manage your transaction history</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchTransactions}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Today's Stats */}
   

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by transaction ID, customer name or email..."
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
            <option value="earn">Purchase (Earn)</option>
            <option value="redeem">Redeem</option>
          </select>
          <button className="btn-secondary flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date Range
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card">
        {filteredTransactions.length > 0 ? (
          <div className="space-y-3">
            {filteredTransactions.map((txn) => (
              <div 
                key={txn._id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 hover:bg-gray-50 rounded-lg border border-gray-100 transition-all cursor-pointer gap-4"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    txn.type === 'earn' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {txn.type === 'earn' ? (
                      <ArrowDownRight className="w-6 h-6 text-green-600" />
                    ) : (
                      <ArrowUpRight className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900 truncate">
                        {txn.customer?.fullName || 'Guest Customer'}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                        txn.type === 'earn' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {txn.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {txn.transactionId} • {formatDate(txn.createdAt)} at {formatTime(txn.createdAt)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {txn.payment?.method || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-gray-900 text-lg">
                    {txn.amount?.total > 0 ? `${currencySymbol}${txn.amount.total.toLocaleString()}` : '-'}
                  </p>
                  <p className={`text-sm font-medium ${
                    txn.type === 'earn' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {txn.type === 'earn' ? '+' : '-'}
                    {txn.type === 'earn' ? txn.points?.earned : txn.points?.redeemed} points
                  </p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    txn.status === 'completed' 
                      ? 'bg-green-100 text-green-700' 
                      : txn.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {txn.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No transactions found</p>
            <p className="text-sm text-gray-500 mt-1">
              {searchQuery || filterType !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Transactions will appear here once customers make purchases'
              }
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredTransactions.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 border-t border-gray-200 mt-4 gap-4">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{filteredTransactions.length}</span> of{' '}
              <span className="font-medium">{transactions.length}</span> transactions
            </p>
            <div className="flex gap-2">
              <button className="btn-secondary px-4 py-2 text-sm">Previous</button>
              <button className="btn-primary px-4 py-2 text-sm">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MerchantTransactions;