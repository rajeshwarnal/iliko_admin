import React, { useState, useEffect } from 'react';
import { 
  Store, Search, Filter, MoreVertical, Eye, 
  Edit, Trash2, CheckCircle, XCircle, MapPin, Phone, Mail,
  AlertCircle, Loader2, Check, X, RefreshCw
} from 'lucide-react';

const API_BASE_URL = 'https://ilikoapi.duckdns.org/api/v1';

const AdminMerchants = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [merchants, setMerchants] = useState([]);
  const [pendingMerchants, setPendingMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'pending'
  const [actionLoading, setActionLoading] = useState(null);

  // Get auth token from localStorage or context
  const getAuthToken = () => {
    // Replace with your actual token management
    return localStorage.getItem('authToken') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5Mzk3MDMzNjU4NDhmY2Q0YTBhN2Q3MSIsImlhdCI6MTc2NjE3MzcwNSwiZXhwIjoxNzY2Nzc4NTA1fQ.UQLM5gtvEs9fd8K5ziIk20HOPm7A_wvzPmj2_StpqvY';
  };

  // Fetch all merchants
  const fetchMerchants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/merchants/`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch merchants');
      
      const data = await response.json();
      
      if (data.success) {
        setMerchants(data.data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching merchants:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending merchants
  const fetchPendingMerchants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/merchants/pending`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch pending merchants');
      
      const data = await response.json();
      
      if (data.success) {
        setPendingMerchants(data.data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching pending merchants:', err);
    } finally {
      setLoading(false);
    }
  };

  // Approve merchant
  const approveMerchant = async (merchantId) => {
    try {
      setActionLoading(merchantId);
      
      const response = await fetch(`${API_BASE_URL}/merchants/${merchantId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to approve merchant');
      
      // Refresh the lists
      await fetchPendingMerchants();
      await fetchMerchants();
      
      alert('Merchant approved successfully!');
    } catch (err) {
      alert(`Error approving merchant: ${err.message}`);
      console.error('Error approving merchant:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Reject merchant
  const rejectMerchant = async (merchantId) => {
    try {
      setActionLoading(merchantId);
      
      const response = await fetch(`${API_BASE_URL}/merchants/${merchantId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to reject merchant');
      
      // Refresh the lists
      await fetchPendingMerchants();
      
      alert('Merchant rejected successfully!');
    } catch (err) {
      alert(`Error rejecting merchant: ${err.message}`);
      console.error('Error rejecting merchant:', err);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    if (activeTab === 'all') {
      fetchMerchants();
    } else {
      fetchPendingMerchants();
    }
  }, [activeTab]);

  const displayMerchants = activeTab === 'all' ? merchants : pendingMerchants;

  const filteredMerchants = displayMerchants.filter(merchant => {
    const searchText = searchQuery.toLowerCase();
    const matchesSearch = 
      merchant.businessName?.toLowerCase().includes(searchText) ||
      merchant.category?.toLowerCase().includes(searchText) ||
      merchant.owner?.fullName?.toLowerCase().includes(searchText) ||
      merchant.owner?.email?.toLowerCase().includes(searchText);
    
    const matchesFilter = filterStatus === 'all' || merchant.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const styles = {
      approved: 'bg-green-100 text-green-700 border-green-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
      inactive: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    
    const icons = {
      approved: CheckCircle,
      pending: Filter,
      rejected: XCircle,
      inactive: XCircle
    };
    
    const Icon = icons[status] || AlertCircle;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        <Icon className="w-3 h-3" />
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const getStatsFromMerchants = () => {
    const total = merchants.length;
    const approved = merchants.filter(m => m.status === 'approved').length;
    const pending = pendingMerchants.length;
    const inactive = merchants.filter(m => !m.isActive).length;
    
    return { total, approved, pending, inactive };
  };

  const stats = getStatsFromMerchants();

  if (loading && merchants.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading merchants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Merchants</h1>
          <p className="text-gray-600 mt-1">Manage all registered merchants</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => activeTab === 'all' ? fetchMerchants() : fetchPendingMerchants()}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Store className="w-4 h-4" />
            Add Merchant
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-medium">Error loading merchants</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button 
            onClick={() => activeTab === 'all' ? fetchMerchants() : fetchPendingMerchants()}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          All Merchants
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors relative ${
            activeTab === 'pending'
              ? 'border-yellow-600 text-yellow-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Pending Approvals
          {pendingMerchants.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">
              {pendingMerchants.length}
            </span>
          )}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Merchants</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Approved</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.approved}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Filter className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Inactive</p>
              <p className="text-2xl font-bold text-gray-600 mt-1">{stats.inactive}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search merchants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
          {activeTab === 'all' && (
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field w-full sm:w-48"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="inactive">Inactive</option>
            </select>
          )}
        </div>
      </div>

      {/* Merchants Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Merchant</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Contact</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Location</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                {activeTab === 'all' && (
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Performance</th>
                )}
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMerchants.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'all' ? 7 : 6} className="py-12 text-center text-gray-500">
                    No merchants found
                  </td>
                </tr>
              ) : (
                filteredMerchants.map((merchant) => (
                  <tr key={merchant._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {merchant.logo?.url ? (
                          <img 
                            src={merchant.logo.url} 
                            alt={merchant.businessName}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
                            {merchant.businessName?.charAt(0) || '?'}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{merchant.businessName}</p>
                          <p className="text-sm text-gray-500">{merchant.owner?.fullName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-700">{merchant.category}</span>
                      <p className="text-xs text-gray-500">{merchant.businessType}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate max-w-[200px]">{merchant.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          {merchant.phoneNumber}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        <div>
                          <p>{merchant.address?.city}</p>
                          <p className="text-xs text-gray-500">{merchant.address?.country}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(merchant.status)}
                      {!merchant.isActive && (
                        <span className="block mt-1 text-xs text-gray-500">Inactive</span>
                      )}
                    </td>
                    {activeTab === 'all' && (
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {merchant.stats?.totalTransactions || 0} txns
                          </p>
                          <p className="text-sm text-gray-500">
                            {merchant.stats?.totalCustomers || 0} customers
                          </p>
                          <p className="text-xs text-gray-500">
                            {merchant.stats?.totalPointsIssued || 0} pts issued
                          </p>
                        </div>
                      </td>
                    )}
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        {activeTab === 'pending' ? (
                          <>
                            <button 
                              onClick={() => approveMerchant(merchant._id)}
                              disabled={actionLoading === merchant._id}
                              className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              {actionLoading === merchant._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </button>
                            <button 
                              onClick={() => rejectMerchant(merchant._id)}
                              disabled={actionLoading === merchant._id}
                              className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="p-2 hover:bg-primary-50 rounded-lg text-primary-600 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">{filteredMerchants.length}</span> of{' '}
            <span className="font-medium">{displayMerchants.length}</span> merchants
          </p>
          <div className="flex gap-2">
            <button className="btn-secondary px-4 py-2 text-sm">Previous</button>
            <button className="btn-primary px-4 py-2 text-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMerchants;