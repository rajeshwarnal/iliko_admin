import React, { useState, useEffect } from 'react';
import { Users, Search, Download, Mail, Phone, MapPin, Award, TrendingUp, Loader2 } from 'lucide-react';

const API_BASE_URL = 'https://ilikoapi.duckdns.org/api/v1';

const AdminCustomers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get auth token from localStorage
  const getAuthToken = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    return token;
  };

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getAuthToken();
      
      console.log('Fetching customers with token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch(`${API_BASE_URL}/customers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);

      if (response.status === 401) {
        // Token expired or invalid
        console.error('401 Unauthorized - Token is invalid or expired');
        localStorage.removeItem('authToken');
        throw new Error('Your session has expired. Please log in again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.message || `Failed to fetch customers (${response.status})`);
      }
      
      const result = await response.json();
      console.log('API Response:', result);
      
      if (result.success) {
        setCustomers(result.data);
      } else {
        throw new Error(result.message || 'Failed to load customers');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching customers:', err);
      
      // If authentication error, redirect to login
      if (err.message.includes('session has expired') || err.message.includes('No authentication token')) {
        // Redirect to login page after a short delay
        setTimeout(() => {
          window.location.href = '/login'; // Update this to your login route
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer => {
    const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
    const searchLower = searchQuery.toLowerCase();
    return fullName.includes(searchLower) || customer.email.toLowerCase().includes(searchLower);
  });

  // Calculate tier based on some logic (you can adjust this)
  const calculateTier = (customer) => {
    // Since API doesn't provide tier, we can calculate based on activity
    // This is a placeholder logic - adjust based on your business rules
    const accountAge = new Date() - new Date(customer.createdAt);
    const daysOld = accountAge / (1000 * 60 * 60 * 24);
    
    if (daysOld > 180) return 'Platinum';
    if (daysOld > 90) return 'Gold';
    if (daysOld > 30) return 'Silver';
    return 'Bronze';
  };

  const getTierBadge = (tier) => {
    const styles = {
      Platinum: 'bg-purple-100 text-purple-700 border-purple-200',
      Gold: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      Silver: 'bg-gray-100 text-gray-700 border-gray-200',
      Bronze: 'bg-orange-100 text-orange-700 border-orange-200'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${styles[tier]}`}>
        {tier}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Status', 'Join Date', 'Last Login'];
    const csvData = customers.map(c => [
      `${c.firstName} ${c.lastName}`,
      c.email,
      c.phoneNumber,
      c.status,
      formatDate(c.createdAt),
      formatDate(c.lastLogin)
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Customers</h3>
          <p className="text-red-700 mb-4">{error}</p>
          {!error.includes('session has expired') && !error.includes('No authentication token') ? (
            <button 
              onClick={fetchCustomers}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
            >
              Try Again
            </button>
          ) : (
            <p className="text-red-600 text-sm">Redirecting to login page...</p>
          )}
        </div>
      </div>
    );
  }

  // Calculate stats
  const activeCustomers = customers.filter(c => c.status === 'active' && c.isActive).length;
  const totalPoints = 0; // API doesn't provide points yet
  const totalSpent = 0; // API doesn't provide spending data yet

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">Manage all registered customers</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="btn-primary flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export List
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{customers.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {activeCustomers}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Email Verified</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {customers.filter(c => c.isEmailVerified).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Phone Verified</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {customers.filter(c => c.isPhoneVerified).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Phone className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Contact</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tier</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Verification</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Login Provider</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Last Login</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-500">
                    No customers found
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => {
                  const tier = calculateTier(customer);
                  const fullName = `${customer.firstName} ${customer.lastName}`;
                  
                  return (
                    <tr key={customer._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                            {customer.firstName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{fullName}</p>
                            <p className="text-sm text-gray-500">Joined {formatDate(customer.createdAt)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-3 h-3" />
                            {customer.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-3 h-3" />
                            {customer.phoneNumber}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-3 h-3" />
                            {customer.address?.country || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getTierBadge(tier)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs">
                            {customer.isEmailVerified ? (
                              <span className="text-green-600 flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                Email
                              </span>
                            ) : (
                              <span className="text-gray-400">Email</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            {customer.isPhoneVerified ? (
                              <span className="text-green-600 flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                Phone
                              </span>
                            ) : (
                              <span className="text-gray-400">Phone</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                          {customer.loginProvider}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-700">{formatDate(customer.lastLogin)}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          customer.status === 'active' && customer.isActive
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {customer.status === 'active' && customer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Info */}
        <div className="px-4 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">{filteredCustomers.length}</span> of{' '}
            <span className="font-medium">{customers.length}</span> customers
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomers;