import React, { useState, useEffect } from 'react';
import { 
  Wallet, ArrowUpRight, ArrowDownRight, Plus, Download, DollarSign, 
  TrendingUp, Calendar, Filter, Loader2, AlertCircle, RefreshCw 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://ilikoapi.duckdns.org/api/v1';

const MerchantWallet = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [walletData, setWalletData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [merchantData, setMerchantData] = useState(null);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState('₹'); // ✅ NEW: Dynamic currency
  const navigate = useNavigate();

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



  // Fetch wallet and transaction data
  const fetchWalletData = async () => {
    try {
      if (!merchantId || !accessToken) {
        throw new Error('Authentication required. Please login again.');
      }

      setLoading(true);
      setError('');

      // ✅ Fetch currency first
      await fetchCurrencySymbol();

      // Fetch merchant data (includes wallet)
      const merchantResponse = await fetch(
        `${API_BASE_URL}/merchants/${merchantId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!merchantResponse.ok) {
        throw new Error('Failed to fetch merchant data');
      }

      const merchantResult = await merchantResponse.json();
      
      if (merchantResult.success) {
        const merchant = merchantResult.data.merchant;
        setMerchantData(merchant);
        setWalletData(merchant.loyaltyWallet);
      }

      // Fetch transactions
      const transactionsResponse = await fetch(
        `${API_BASE_URL}/transactions/merchant/${merchantId}?page=1&limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (transactionsResponse.ok) {
        const transactionsResult = await transactionsResponse.json();
        if (transactionsResult.success) {
          setTransactions(transactionsResult.data || []);
        }
      }

    } catch (err) {
      setError(err.message || 'Failed to load wallet data');
      console.error('Wallet error:', err);
    } finally {
      setLoading(false);
    }
  };


  // Handle wallet top-up
 const handleTopUp = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setTopUpLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/merchants/${merchantId}/wallet/topup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            amount: parseFloat(topUpAmount)
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Top-up failed');
      }

      alert(`Successfully added ${currencySymbol}${result.data.amountAdded.toLocaleString()} to your wallet!`);
      setShowTopUpModal(false);
      setTopUpAmount('');
      
      fetchWalletData();
    } catch (err) {
      alert(err.message || 'Failed to top up wallet');
    } finally {
      setTopUpLoading(false);
    }
  };


  // Calculate stats
  const getStats = () => {
    if (!transactions || transactions.length === 0) {
      return {
        totalCredits: 0,
        totalDebits: 0,
        thisMonth: 0,
        lastMonth: 0,
        avgTransaction: 0
      };
    }

    const now = new Date();
    const thisMonth = now.getMonth();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const thisYear = now.getFullYear();

    let totalCredits = 0;
    let totalDebits = 0;
    let thisMonthTotal = 0;
    let lastMonthTotal = 0;

    transactions.forEach(txn => {
      const txnDate = new Date(txn.createdAt);
      const amount = txn.amount?.total || 0;

      if (txn.type === 'earn') {
        totalCredits += amount;
      } else if (txn.type === 'redeem') {
        totalDebits += txn.points?.redeemed || 0;
      }

      if (txnDate.getMonth() === thisMonth && txnDate.getFullYear() === thisYear) {
        thisMonthTotal += amount;
      }
      if (txnDate.getMonth() === lastMonth && txnDate.getFullYear() === thisYear) {
        lastMonthTotal += amount;
      }
    });

    const avgTransaction = transactions.length > 0 ? totalCredits / transactions.length : 0;

    return {
      totalCredits,
      totalDebits,
      thisMonth: thisMonthTotal,
      lastMonth: lastMonthTotal,
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

  // Initial data fetch
  useEffect(() => {
    fetchWalletData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading wallet...</p>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Wallet</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchWalletData}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const balance = walletData?.balance || 0;
  const stats = getStats();

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
          <p className="text-gray-600 mt-1">Manage your merchant balance</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchWalletData}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowTopUpModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Top Up
          </button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Balance Card */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl shadow-lg p-6 text-white col-span-1 md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-primary-100 text-sm">Available Balance</p>
              <p className="text-4xl font-bold">{currencySymbol}{balance.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-primary-100 mb-4">
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
              walletData?.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
              {walletData?.isActive ? 'Active' : 'Inactive'}
            </span>
            {walletData?.lastTopupAt && (
              <span>Last top-up: {formatDate(walletData.lastTopupAt)}</span>
            )}
          </div>
          <div className="flex gap-4 mt-6">
            <button 
              onClick={() => setShowTopUpModal(true)}
              className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Top Up
            </button>
            <button className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <Download className="w-4 h-4" />
              Statement
            </button>
          </div>
        </div>

        {/* Credits/Debits */}
        <div className="space-y-4">
          <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 font-medium">Total Credits</span>
              <ArrowDownRight className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{currencySymbol}{stats.totalCredits.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">From transactions</p>
          </div>
          <div className="card bg-gradient-to-br from-red-50 to-rose-50 border border-red-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 font-medium">Total Debits</span>
              <ArrowUpRight className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.totalDebits.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Points redeemed</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">This Month</span>
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-gray-900">{currencySymbol}{stats.thisMonth.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Last Month</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-xl font-bold text-gray-900">{currencySymbol}{stats.lastMonth.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Avg Transaction</span>
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-xl font-bold text-gray-900">{currencySymbol}{Math.round(stats.avgTransaction).toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Transactions</span>
            <Filter className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-xl font-bold text-gray-900">{transactions.length}</p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
          <div className="flex gap-2">
            <button className="btn-secondary flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="btn-secondary flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Date & Time</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Customer</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">Points</th>
                  <th className="text-center p-4 text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn._id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="text-sm text-gray-900">{formatDate(txn.createdAt)}</div>
                      <div className="text-xs text-gray-500">{formatTime(txn.createdAt)}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-900">
                      {txn.customer?.fullName || 'Guest Customer'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {txn.type === 'earn' ? (
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <ArrowDownRight className="w-4 h-4 text-green-600" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <ArrowUpRight className="w-4 h-4 text-red-600" />
                          </div>
                        )}
                        <span className="text-sm capitalize">{txn.type}</span>
                      </div>
                    </td>
                    <td className={`p-4 text-right text-sm font-semibold ${
                      txn.type === 'earn' ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {txn.type === 'earn' ? '+' : ''}{currencySymbol}{(txn.amount?.total || 0).toLocaleString()}
                    </td>
                    <td className={`p-4 text-right text-sm font-semibold ${
                      txn.type === 'earn' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {txn.type === 'earn' ? '+' : '-'}{txn.type === 'earn' ? txn.points?.earned : txn.points?.redeemed}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        txn.status === 'completed' 
                          ? 'bg-green-100 text-green-700' 
                          : txn.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No transactions yet</p>
          </div>
        )}
      </div>

      {/* Top Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Top Up Wallet</h2>
              <button 
                onClick={() => setShowTopUpModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-600 mb-1">Current Balance</p>
                <p className="text-3xl font-bold text-gray-900">{currencySymbol}{balance.toLocaleString()}</p>
              </div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Enter Amount to Add
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                  placeholder="0"
                  min="1"
                />
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2 mt-4">
                {[1000, 5000, 10000, 50000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setTopUpAmount(amount.toString())}
                    className="py-2 px-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition-colors"
                  >
                    {currencySymbol}{amount.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowTopUpModal(false)}
                className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTopUp}
                disabled={topUpLoading || !topUpAmount || parseFloat(topUpAmount) <= 0}
                className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {topUpLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5" />
                    Add Funds
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantWallet;