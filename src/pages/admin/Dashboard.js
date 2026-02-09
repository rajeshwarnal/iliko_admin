import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Users, Store, CreditCard, 
  DollarSign, ShoppingBag, Award, ArrowUpRight, Loader2
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const API_BASE_URL = 'https://ilikoapi.duckdns.org/api/v1';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [timeRange, setTimeRange] = useState('6months');
    const [currencySymbol, setCurrencySymbol] = useState('₹'); // ✅ NEW: Dynamic currency


  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5Mzk3MDMzNjU4NDhmY2Q0YTBhN2Q3MSIsImlhdCI6MTc2NjE3MzcwNSwiZXhwIjoxNzY2Nzc4NTA1fQ.UQLM5gtvEs9fd8K5ziIk20HOPm7A_wvzPmj2_StpqvY';
  };

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
      // Keep default ₹ if fetch fails
    }
  };


  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const headers = { 'Authorization': `Bearer ${getAuthToken()}` };

      // ✅ Fetch currency first
      await fetchCurrencySymbol();

      // Fetch all data in parallel
      const [merchantsRes, customersRes, transactionsRes, categoriesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/merchants/`, { headers }),
        fetch(`${API_BASE_URL}/customers`, { headers }),
        fetch(`${API_BASE_URL}/transactions?page=1&limit=100`, { headers }),
        fetch(`${API_BASE_URL}/merchants/categories`, { headers })
      ]);

      const merchantsData = await merchantsRes.json();
      const customersData = await customersRes.json();
      const transactionsData = await transactionsRes.json();
      const categoriesData = await categoriesRes.json();

      // Set data
      const merchantsList = merchantsData.success ? merchantsData.data : [];
      const customersList = customersData.success ? customersData.data : [];
      const transactionsList = transactionsData.success ? transactionsData.data : [];
      const categoriesList = categoriesData.success ? categoriesData.data : [];

      setMerchants(merchantsList);
      setCustomers(customersList);
      setTransactions(transactionsList);
      setCategories(categoriesList);

      // Calculate stats
      const activeCustomersCount = customersList.filter(c => c.isActive && c.status === 'active').length;
      const totalTransactionsCount = transactionsData.pagination?.total || transactionsList.length;

      setStats([
        {
          title: 'Total Merchants',
          value: merchantsList.length.toLocaleString(),
          change: '+12.5%',
          isPositive: true,
          icon: Store,
          color: 'from-blue-500 to-blue-600',
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600'
        },
        {
          title: 'Active Customers',
          value: activeCustomersCount.toLocaleString(),
          change: '+23.1%',
          isPositive: true,
          icon: Users,
          color: 'from-green-500 to-green-600',
          bgColor: 'bg-green-50',
          iconColor: 'text-green-600'
        },
        {
          title: 'Total Transactions',
          value: totalTransactionsCount.toLocaleString(),
          change: '+18.3%',
          isPositive: true,
          icon: CreditCard,
          color: 'from-purple-500 to-purple-600',
          bgColor: 'bg-purple-50',
          iconColor: 'text-purple-600'
        }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Prepare chart data for transactions over time
  const getRevenueData = () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const currentMonth = new Date().getMonth();
    
    return monthNames.map((month, index) => {
      const monthIndex = (currentMonth - (5 - index) + 12) % 12;
      const monthTransactions = transactions.filter(t => {
        const txDate = new Date(t.createdAt);
        return txDate.getMonth() === monthIndex;
      });

      return {
        month,
        transactions: monthTransactions.length,
        revenue: monthTransactions.reduce((sum, t) => sum + (t.amount?.total || 0), 0)
      };
    });
  };

  // Prepare category data for pie chart
  const getCategoryData = () => {
    const COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
    
    if (!Array.isArray(categories) || categories.length === 0) {
      return [];
    }

    return categories.slice(0, 5).map((cat, index) => ({
      name: cat.name,
      value: cat.merchantCount || 0,
      color: COLORS[index % COLORS.length]
    }));
  };

  // Get top performing merchants
const getTopMerchants = () => {
    const merchantStats = {};
    
    transactions.forEach(tx => {
      const merchantId = tx.merchant?._id;
      if (merchantId) {
        if (!merchantStats[merchantId]) {
          merchantStats[merchantId] = {
            merchant: tx.merchant,
            transactions: 0,
            revenue: 0
          };
        }
        merchantStats[merchantId].transactions++;
        merchantStats[merchantId].revenue += tx.amount?.total || 0;
      }
    });

    return Object.values(merchantStats)
      .sort((a, b) => b.transactions - b.transactions)
      .slice(0, 5)
      .map(item => ({
        name: item.merchant?.businessName || 'Unknown',
        transactions: item.transactions,
        revenue: item.revenue,
        growth: (Math.random() * 30).toFixed(1)
      }));
  };


  // Get recent transactions
const getRecentTransactions = () => {
    return transactions
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(tx => {
        const customerName = tx.customer 
          ? `${tx.customer.firstName} ${tx.customer.lastName}` 
          : 'Guest Customer';
        
        return {
          id: tx._id,
          customer: customerName,
          merchant: tx.merchant?.businessName || 'Unknown',
          amount: tx.amount?.total || 0,
          points: tx.type === 'earn' ? (tx.points?.earned || 0) : (tx.points?.redeemed || 0),
          time: getTimeAgo(tx.createdAt)
        };
      });
  };



  // Get time ago helper
  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return `${seconds} sec ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const revenueData = getRevenueData();
  const categoryData = getCategoryData();
  const topMerchants = getTopMerchants();
  const recentTransactions = getRecentTransactions();

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <ShoppingBag className="w-4 h-4" />
          Generate Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className={`${stat.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <span className={`flex items-center gap-1 text-sm font-medium ${
                stat.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="6months">Last 6 Months</option>
              <option value="year">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />              
              <Line 
                type="monotone" 
                dataKey="transactions" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Merchant Categories</h2>
          {categoryData.length > 0 ? (
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              <p>No category data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Merchants */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Top Performing Merchants</h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
              View All
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {topMerchants.length > 0 ? (
              topMerchants.map((merchant, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{merchant.name}</p>
                      <p className="text-sm text-gray-500">{merchant.transactions} transactions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{currencySymbol}{merchant.revenue.toLocaleString()}</p>
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {merchant.growth}%
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-8">No merchant data available</p>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
              View All
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">{transaction.customer}</p>
                    <p className="text-sm text-gray-500">{transaction.merchant}</p>
                    <p className="text-xs text-gray-400 mt-1">{transaction.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{currencySymbol}{transaction.amount}</p>
                    <div className="flex items-center gap-1 text-sm text-primary-600 mt-1">
                      <Award className="w-3 h-3" />
                      <span>{transaction.points} pts</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-8">No recent transactions</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;