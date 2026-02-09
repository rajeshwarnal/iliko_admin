import React, { useState, useEffect } from 'react';
import { 
  Wallet, Users, TrendingUp, Award, DollarSign, 
  Clock, QrCode, Gift, ArrowUpRight, Eye, Loader2,
  AlertCircle, RefreshCw
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const API_BASE_URL = 'https://ilikoapi.duckdns.org/api/v1';

const MerchantDashboard = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [merchantDetails, setMerchantDetails] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
    const [currencySymbol, setCurrencySymbol] = useState('₹'); // ✅ NEW: Dynamic currency

  const [refreshing, setRefreshing] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpLoading, setTopUpLoading] = useState(false);

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

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      if (!merchantId || !accessToken) {
        throw new Error('Authentication required. Please login again.');
      }

      setLoading(true);
      setError('');
      await fetchCurrencySymbol();

      // Fetch dashboard data
      const dashboardResponse = await fetch(
        `${API_BASE_URL}/merchants/${merchantId}/dashboard`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!dashboardResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const dashboardResult = await dashboardResponse.json();
      if (dashboardResult.success) {
        setDashboardData(dashboardResult.data.dashboard);
        setWalletBalance(dashboardResult.data.dashboard?.wallet?.balance || 0);
      }

      // Fetch merchant details
      const merchantResponse = await fetch(
        `${API_BASE_URL}/merchants/${merchantId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!merchantResponse.ok) {
        throw new Error('Failed to fetch merchant details');
      }

      const merchantResult = await merchantResponse.json();
      if (merchantResult.success) {
        setMerchantDetails(merchantResult.data.merchant);
      }

      // Fetch transactions
      const transactionsResponse = await fetch(
        `${API_BASE_URL}/transactions/merchant/${merchantId}?page=1&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!transactionsResponse.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const transactionsResult = await transactionsResponse.json();
      if (transactionsResult.success) {
        setTransactions(transactionsResult.data || []);
      }

      // Fetch receipts
      const receiptsResponse = await fetch(
        `${API_BASE_URL}/receipts/merchant/${merchantId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!receiptsResponse.ok) {
        throw new Error('Failed to fetch receipts');
      }

      const receiptsResult = await receiptsResponse.json();
      if (receiptsResult.success) {
        setReceipts(receiptsResult.data || []);
      }

      // Fetch latest wallet balance
      const walletResponse = await fetch(
        `${API_BASE_URL}/wallet`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (walletResponse.ok) {
        const walletResult = await walletResponse.json();
        if (walletResult.success) {
          // Customer wallet is different from merchant wallet
          // We'll use the merchant wallet from dashboard
          console.log('Customer wallet:', walletResult.data.wallet);
        }
      }

    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
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

      setWalletBalance(result.data.wallet.balance);
      
      if (dashboardData) {
        setDashboardData({
          ...dashboardData,
          wallet: result.data.wallet
        });
      }

      alert(`Successfully added ${currencySymbol}${result.data.amountAdded.toLocaleString()} to your wallet!`);
      setShowTopUpModal(false);
      setTopUpAmount('');
      
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to top up wallet');
    } finally {
      setTopUpLoading(false);
    }
  };


  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Calculate stats from real data
const getStats = () => {
    if (!dashboardData) return [];

    const { stats } = dashboardData;
    
    return [
      {
        title: 'Wallet Balance',
        value: `${currencySymbol}${walletBalance?.toLocaleString() || 0}`,
        change: dashboardData.wallet?.isActive ? 'Active' : 'Inactive',
        icon: Wallet,
        color: 'from-emerald-500 to-emerald-600',
        bgColor: 'bg-emerald-50',
        iconColor: 'text-emerald-600'
      },
      {
        title: 'Total Customers',
        value: stats?.totalCustomers?.toLocaleString() || '0',
        change: 'All time',
        icon: Users,
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-600'
      },
      {
        title: 'Total Transactions',
        value: stats?.totalTransactions?.toLocaleString() || '0',
        change: 'All time',
        icon: TrendingUp,
        color: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-50',
        iconColor: 'text-purple-600'
      },
      {
        title: 'Points Awarded',
        value: stats?.totalPointsIssued?.toLocaleString() || '0',
        change: `${stats?.totalPointsRedeemed || 0} redeemed`,
        icon: Award,
        color: 'from-orange-500 to-orange-600',
        bgColor: 'bg-orange-50',
        iconColor: 'text-orange-600'
      }
    ];
  };



  // Process transactions for charts
  const getWeeklyData = () => {
    if (!transactions || transactions.length === 0) {
      return [
        { day: 'Mon', transactions: 0, revenue: 0 },
        { day: 'Tue', transactions: 0, revenue: 0 },
        { day: 'Wed', transactions: 0, revenue: 0 },
        { day: 'Thu', transactions: 0, revenue: 0 },
        { day: 'Fri', transactions: 0, revenue: 0 },
        { day: 'Sat', transactions: 0, revenue: 0 },
        { day: 'Sun', transactions: 0, revenue: 0 }
      ];
    }

    // Group transactions by day
    const dayMap = { 0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat' };
    const weekData = {
      'Mon': { transactions: 0, revenue: 0 },
      'Tue': { transactions: 0, revenue: 0 },
      'Wed': { transactions: 0, revenue: 0 },
      'Thu': { transactions: 0, revenue: 0 },
      'Fri': { transactions: 0, revenue: 0 },
      'Sat': { transactions: 0, revenue: 0 },
      'Sun': { transactions: 0, revenue: 0 }
    };

    transactions.forEach(txn => {
      const date = new Date(txn.createdAt);
      const dayName = dayMap[date.getDay()];
      if (weekData[dayName]) {
        weekData[dayName].transactions += 1;
        weekData[dayName].revenue += txn.amount?.total || 0;
      }
    });

    return Object.keys(weekData).map(day => ({
      day,
      transactions: weekData[day].transactions,
      revenue: weekData[day].revenue
    }));
  };

  // Get recent transactions
  const getRecentTransactions = () => {
    if (!transactions || transactions.length === 0) return [];
    
    return transactions.slice(0, 5).map(txn => ({
      id: txn.transactionId,
      customer: txn.customer?.fullName || 'Guest Customer',
      amount: txn.amount?.total || 0,
      points: txn.type === 'redeem' 
        ? -(txn.points?.redeemed || 0) 
        : (txn.points?.earned || 0),
      time: formatTime(txn.createdAt),
      type: txn.type,
      status: txn.status
    }));
  };

  // Format time helper
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Get active promos
  const getActivePromos = () => {
    if (!merchantDetails?.activePromos) return [];
    
    return merchantDetails.activePromos.map(promo => {
      const validUntil = new Date(promo.validUntil);
      const now = new Date();
      const daysLeft = Math.ceil((validUntil - now) / (1000 * 60 * 60 * 24));
      
      return {
        title: promo.title,
        description: promo.description,
        promoCode: promo.promoCode,
        image: promo.image?.url,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        minPurchaseAmount: promo.minPurchaseAmount || 0,
        redemptions: promo.usageCount || 0,
        active: promo.validUntil ? new Date(promo.validUntil) > now : false,
        expiry: daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left` : 'Expired'
      };
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={handleRefresh}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const stats = getStats();
  const weeklyData = getWeeklyData();
  const recentTransactions = getRecentTransactions();
  const activePromos = getActivePromos();
  const businessName = dashboardData?.business?.businessName || 'Merchant';

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="card bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, {businessName}! ☕</h1>
            <p className="text-primary-100">
              You have <span className="font-semibold">{dashboardData?.stats?.totalTransactions || 0} total transactions</span>. Keep up the great work!
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-white text-primary-700 px-6 py-2.5 rounded-lg font-medium hover:bg-primary-50 transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button 
              onClick={() => setShowTopUpModal(true)}
              className="bg-white/20 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-white/30 transition-all flex items-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              Top Up
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className={`${stat.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Performance */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Revenue Overview</h2>
            <select className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>Last 7 Days</option>
              <option>This Month</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [`${currencySymbol}${value}`, 'Revenue']}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#0ea5e9" 
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Transactions */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Transaction Count</h2>
            <select className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>Last 7 Days</option>
              <option>This Month</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [value, 'Transactions']}
              />
              <Bar dataKey="transactions" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables and Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
              View All
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          
          {recentTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Transaction ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Points</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((txn, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-gray-900">{txn.id}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700">{txn.customer}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-gray-900">{currencySymbol}{txn.amount}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-sm font-medium ${
                          txn.type === 'redeem' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {txn.points > 0 ? '+' : ''}{txn.points}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-500">{txn.time}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No transactions yet</p>
            </div>
          )}
        </div>

        {/* Quick Actions & Active Promos */}
        <div className="space-y-6">
          {/* Active Promos */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Active Promos</h2>
              <Gift className="w-5 h-5 text-primary-600" />
            </div>
            
            {activePromos.length > 0 ? (
              <div className="space-y-3">
                {activePromos.map((promo, index) => (
                  <div key={index} className="overflow-hidden rounded-lg border border-primary-100 bg-white hover:shadow-md transition-shadow">
                    {/* Promo Image */}
                    {promo.image && (
                      <div className="relative h-32 bg-gradient-to-r from-primary-100 to-purple-100">
                        <img 
                          src={promo.image} 
                          alt={promo.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Promo Details */}
                    <div className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm mb-1">{promo.title}</p>
                          {promo.description && (
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">{promo.description}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Promo Code */}
                      {promo.promoCode && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-mono font-semibold mb-2">
                          <Gift className="w-3 h-3" />
                          {promo.promoCode}
                        </div>
                      )}
                      
                      {/* Discount Info */}
                      <div className="flex items-center gap-2 mb-2">
                        {promo.discountType === 'percentage' && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">
                            {promo.discountValue}% OFF
                          </span>
                        )}
                        {promo.discountType === 'fixed_amount' && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">
                            {currencySymbol}{promo.discountValue} OFF
                          </span>
                        )}
                        {promo.discountType === 'points_multiplier' && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-semibold">
                            {promo.discountValue}x Points
                          </span>
                        )}
                        {promo.minPurchaseAmount > 0 && (
                          <span className="text-xs text-gray-500">
                            Min: {currencySymbol}{promo.minPurchaseAmount}
                          </span>
                        )}
                      </div>
                      
                      {/* Stats */}
                      <div className="flex items-center justify-between text-xs border-t border-gray-100 pt-2">
                        <span className="text-gray-600">
                          {promo.redemptions} redemption{promo.redemptions !== 1 ? 's' : ''}
                        </span>
                        <span className={`font-medium ${promo.active ? 'text-primary-600' : 'text-red-600'}`}>
                          {promo.expiry}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <button className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors">
                  + Create New Promo
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Gift className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-gray-500 mb-3">No active promotions</p>
                <button className="w-full py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors">
                  Create Your First Promo
                </button>
              </div>
            )}
          </div>

          {/* Business Info */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Info</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Reward Rate</span>
                <span className="text-sm font-semibold text-gray-900">
                  {dashboardData?.pointsConfiguration?.rewardPercentage || 0}%
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`text-sm font-semibold px-2 py-1 rounded ${
                  dashboardData?.business?.status === 'approved' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {dashboardData?.business?.status || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Location</span>
                <span className="text-sm font-semibold text-gray-900">
                  {dashboardData?.business?.address?.city || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Receipts Section */}
      {receipts.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Scanned Receipts</h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
              View All
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {receipts.slice(0, 6).map((receipt, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                {/* Receipt Image */}
                <div className="relative h-40 bg-gray-100">
                  <img 
                    src={receipt.receiptImage?.url} 
                    alt={`Receipt ${receipt.receiptId}`}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${
                    receipt.status === 'completed' 
                      ? 'bg-green-500 text-white' 
                      : receipt.status === 'pending'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {receipt.status}
                  </div>
                </div>
                
                {/* Receipt Details */}
                <div className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">
                        {receipt.billDetails?.billNumber || receipt.receiptId}
                      </p>
                      <p className="font-semibold text-gray-900">
                        {currencySymbol}{receipt.billDetails?.totalAmount?.toLocaleString() || 0}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-primary-600 font-semibold">
                        +{receipt.rewards?.pointsEarned || 0} pts
                      </p>
                      <p className="text-xs text-gray-500">
                        {receipt.rewards?.percentage || 0}%
                      </p>
                    </div>
                  </div>
                  
                  {receipt.customer && (
                    <p className="text-xs text-gray-600 mb-2">
                      {receipt.customer.firstName} {receipt.customer.lastName}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-2">
                    <span>{formatTime(receipt.createdAt)}</span>
                    <span className={`${
                      receipt.verification?.status === 'verified' 
                        ? 'text-green-600' 
                        : 'text-yellow-600'
                    }`}>
                      {receipt.verification?.status || 'pending'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                <p className="text-3xl font-bold text-gray-900">{currencySymbol}{walletBalance?.toLocaleString() || 0}</p>
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

export default MerchantDashboard;