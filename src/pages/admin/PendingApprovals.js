import React, { useState, useEffect } from 'react';
import { Clock, Check, X, Eye, Mail, Phone, MapPin, Loader2 } from 'lucide-react';

const API_BASE_URL = 'https://ilikoapi.duckdns.org/api/v1';

const AdminPendingApprovals = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Get auth token from localStorage or context
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5Mzk3MDMzNjU4NDhmY2Q0YTBhN2Q3MSIsImlhdCI6MTc2NjE3MzcwNSwiZXhwIjoxNzY2Nzc4NTA1fQ.UQLM5gtvEs9fd8K5ziIk20HOPm7A_wvzPmj2_StpqvY';
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
        setPending(data.data);
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
      
      // Refresh the list
      await fetchPendingMerchants();
      
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
      
      // Refresh the list
      await fetchPendingMerchants();
      
      alert('Merchant application rejected');
    } catch (err) {
      alert(`Error rejecting merchant: ${err.message}`);
      console.error('Error rejecting merchant:', err);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchPendingMerchants();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  };

  // Get document status
  const getDocumentStatus = (merchant) => {
    const hasLogo = merchant.logo?.url;
    const hasBanner = merchant.banner?.url;
    const hasDescription = merchant.description && merchant.description.length > 0;
    const hasAddress = merchant.address?.city && merchant.address?.country;
    
    const completedFields = [hasLogo, hasBanner, hasDescription, hasAddress].filter(Boolean).length;
    
    return completedFields === 4 ? 'Complete' : 'Incomplete';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading pending applications...</p>
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
            onClick={fetchPendingMerchants}
            className="mt-2 text-red-600 hover:text-red-700 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pending Merchant Approvals</h1>
          <p className="text-gray-600 mt-1">Review and approve new merchant applications</p>
        </div>
        <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-medium">
          {pending.length} Pending
        </span>
      </div>

      <div className="grid gap-4">
        {pending.map(merchant => (
          <div key={merchant._id} className="card hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    {merchant.businessName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{merchant.businessName}</h3>
                    <p className="text-sm text-gray-500">{merchant.owner?.fullName || 'N/A'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    getDocumentStatus(merchant) === 'Complete' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {getDocumentStatus(merchant)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      {merchant.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      {merchant.phoneNumber}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {merchant.address?.city}, {merchant.address?.country}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      Applied: {formatDate(merchant.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    {merchant.category}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <button className="btn-secondary flex items-center gap-2 whitespace-nowrap">
                  <Eye className="w-4 h-4" />
                  Review
                </button>
                <button 
                  onClick={() => approveMerchant(merchant._id)}
                  disabled={actionLoading === merchant._id}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === merchant._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Approve
                </button>
                <button 
                  onClick={() => rejectMerchant(merchant._id)}
                  disabled={actionLoading === merchant._id}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPendingApprovals;