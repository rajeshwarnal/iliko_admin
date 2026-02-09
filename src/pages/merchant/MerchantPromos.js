import React, { useState, useEffect } from 'react';
import { 
  Tag, Plus, Edit, Trash2, Eye, EyeOff, Calendar, Users, 
  TrendingUp, Percent, Loader2, AlertCircle, RefreshCw, Image as ImageIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://ilikoapi.duckdns.org/api/v1';

const MerchantPromos = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
    const [currencySymbol, setCurrencySymbol] = useState('₹'); // ✅ NEW: Dynamic currency

  const [promos, setPromos] = useState([]);
  const [merchantData, setMerchantData] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();


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




  // Get stored data
  const merchantId = localStorage.getItem('merchantId');
  const accessToken = localStorage.getItem('accessToken');

  // Fetch promos
  const fetchPromos = async () => {
    try {
      if (!merchantId || !accessToken) {
        throw new Error('Authentication required. Please login again.');
      }

      setLoading(true);
      setError('');
      await fetchCurrencySymbol();

      // Fetch merchant data (includes activePromos)
      const response = await fetch(
        `${API_BASE_URL}/merchants/${merchantId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch promos');
      }

      const result = await response.json();
      
      if (result.success) {
        const merchant = result.data.merchant;
        setMerchantData(merchant);
        setPromos(merchant.activePromos || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load promos');
      console.error('Promos error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete promo
  const deletePromo = async (promoId) => {
    if (!window.confirm('Are you sure you want to delete this promo?')) {
      return;
    }

    setDeletingId(promoId);
    try {
      const response = await fetch(
        `${API_BASE_URL}/promos/${promoId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to delete promo');
      }

      // Remove from local state
      setPromos(promos.filter(p => p._id !== promoId));
      alert('Promo deleted successfully!');
      
      // Refresh data
      fetchPromos();
    } catch (err) {
      alert(err.message || 'Failed to delete promo');
    } finally {
      setDeletingId(null);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchPromos();
  }, []);

  // Calculate stats
  const getStats = () => {
    const now = new Date();
    const activePromos = promos.filter(p => 
      p.validUntil && new Date(p.validUntil) > now
    ).length;

    const totalUsed = promos.reduce((sum, p) => sum + (p.usageCount || 0), 0);

    const avgDiscount = promos.length > 0
      ? promos.reduce((sum, p) => sum + (p.discountValue || 0), 0) / promos.length
      : 0;

    return {
      total: promos.length,
      active: activePromos,
      totalUsed,
      avgDiscount: Math.round(avgDiscount)
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

  // Check if promo is active
  const isPromoActive = (promo) => {
    const now = new Date();
    const validFrom = new Date(promo.validFrom);
    const validUntil = new Date(promo.validUntil);
    return now >= validFrom && now <= validUntil;
  };

  // Get days left
  const getDaysLeft = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading promos...</p>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Promos</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchPromos}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Promos</h1>
          <p className="text-gray-600 mt-1">Manage promotional offers</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchPromos}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button 
            onClick={() => navigate('/merchant/promos/create')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Promo
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Promos</span>
            <Tag className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Active Promos</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Redemptions</span>
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalUsed}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Avg. Discount</span>
            <Percent className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.avgDiscount}%</p>
        </div>
      </div>

      {/* Promos Grid */}
      {promos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promos.map(promo => {
            const active = isPromoActive(promo);
            const daysLeft = getDaysLeft(promo.validUntil);
            const maxUses = promo.usageLimit?.perUserLimit || null;
            const currentUses = promo.usageCount || 0;

            return (
              <div key={promo._id} className="card hover:shadow-lg transition-shadow overflow-hidden">
                {/* Promo Image */}
                {promo.image?.url && (
                  <div className="relative h-40 bg-gradient-to-r from-primary-100 to-purple-100">
                    <img 
                      src={promo.image.url} 
                      alt={promo.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      {active ? (
                        <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold">
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-500 text-white rounded-full text-xs font-semibold">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className={`p-6 ${!promo.image?.url ? 'border-l-4' : ''} ${active ? 'border-green-500' : 'border-gray-300'}`}>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-xl font-bold text-gray-900">{promo.title}</h3>
                        {!promo.image?.url && (
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            active 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {active ? 'Active' : 'Inactive'}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2">{promo.description}</p>
                    </div>
                  </div>

                  {/* Promo Code */}
                  {promo.promoCode && (
                    <div className="mb-4 inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-sm font-mono font-semibold">
                      <Tag className="w-3 h-3" />
                      {promo.promoCode}
                    </div>
                  )}

                  {/* Discount Value */}
                  <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Discount Value</span>
                                           <span className="text-2xl font-bold text-purple-600">
                        {promo.discountType === 'percentage' && `${promo.discountValue}%`}
                        {promo.discountType === 'fixed_amount' && `${currencySymbol}${promo.discountValue}`}
                        {promo.discountType === 'points_multiplier' && `${promo.discountValue}x Points`}
                      </span>

                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <span className="text-xs text-gray-600">Duration</span>
                      </div>
                      <p className="text-xs font-semibold text-gray-900">
                        {formatDate(promo.validFrom)}
                      </p>
                      <p className="text-xs text-gray-500">
                        to {formatDate(promo.validUntil)}
                      </p>
                      {daysLeft >= 0 && (
                        <p className="text-xs text-primary-600 font-medium mt-1">
                          {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                        </p>
                      )}
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-gray-600" />
                        <span className="text-xs text-gray-600">Usage</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {currentUses} / {maxUses || '∞'}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {maxUses && (
                    <div className="space-y-1 mb-4">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Progress</span>
                        <span>{Math.round((currentUses / maxUses) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min((currentUses / maxUses) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Min Purchase */}
                  {promo.minPurchaseAmount > 0 && (
                    <div className="p-2 bg-yellow-50 rounded text-xs text-yellow-800 mb-4">
                      Min. purchase: {currencySymbol}{promo.minPurchaseAmount.toLocaleString()}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/merchant/promos/edit/${promo._id}`)}
                      className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => deletePromo(promo._id)}
                      disabled={deletingId === promo._id}
                      className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deletingId === promo._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2 text-gray-900">No Promos Yet</h3>
          <p className="text-gray-600 mb-6">Create your first promotional offer to attract customers</p>
          <button 
            onClick={() => navigate('/merchant/promos/create')}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Your First Promo
          </button>
        </div>
      )}
    </div>
  );
};

export default MerchantPromos;