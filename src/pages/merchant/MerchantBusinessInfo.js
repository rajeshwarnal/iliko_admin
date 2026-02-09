import React, { useState, useEffect } from 'react';
import { 
  Building, Mail, Phone, MapPin, Globe, Save, Upload, Calendar, 
  Clock, DollarSign, Tag, CheckCircle, Loader2, AlertCircle, RefreshCw 
} from 'lucide-react';

const API_BASE_URL = 'https://ilikoapi.duckdns.org/api/v1';

const MerchantBusinessInfo = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState('₹'); // ✅ NEW: Dynamic currency
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    email: '',
    phoneNumber: '',
    category: '',
    description: '',
    address: {
      city: '',
      state: '',
      country: 'India'
    },
    businessHours: {
      monday: { open: '09:00', close: '18:00', isOpen: true },
      tuesday: { open: '09:00', close: '18:00', isOpen: true },
      wednesday: { open: '09:00', close: '18:00', isOpen: true },
      thursday: { open: '09:00', close: '18:00', isOpen: true },
      friday: { open: '09:00', close: '18:00', isOpen: true },
      saturday: { open: '10:00', close: '16:00', isOpen: true },
      sunday: { open: '10:00', close: '16:00', isOpen: false }
    }
  });

  const [rewardPercentage, setRewardPercentage] = useState(5);
  const [merchantDetails, setMerchantDetails] = useState(null);

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

  // Fetch merchant data
  const fetchMerchantData = async () => {
    try {
      if (!merchantId || !accessToken) {
        throw new Error('Authentication required. Please login again.');
      }

      setLoading(true);
      setError('');
      await fetchCurrencySymbol();

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
        const merchant = merchantResult.data.merchant;
        setMerchantDetails(merchant);
        
        // Populate form data
        setFormData({
          businessName: merchant.businessName || '',
          businessType: merchant.businessType || '',
          email: merchant.email || '',
          phoneNumber: merchant.phoneNumber || '',
          category: merchant.category || '',
          description: merchant.description || '',
          address: {
            city: merchant.address?.city || '',
            state: merchant.address?.state || '',
            country: merchant.address?.country || 'India'
          },
          businessHours: merchant.businessHours || formData.businessHours
        });

        // Set reward percentage
        setRewardPercentage(merchant.pointsConfiguration?.rewardPercentage || 5);
      }

      // Fetch reward percentage
      const rewardResponse = await fetch(
        `${API_BASE_URL}/merchants/${merchantId}/rewards/percentage`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (rewardResponse.ok) {
        const rewardResult = await rewardResponse.json();
        if (rewardResult.success && rewardResult.data?.rewardPercentage) {
          setRewardPercentage(rewardResult.data.rewardPercentage);
        }
      }

    } catch (err) {
      setError(err.message || 'Failed to load merchant data');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update merchant data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Update merchant basic info
      const updateResponse = await fetch(
        `${API_BASE_URL}/merchants/${merchantId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            phoneNumber: formData.phoneNumber,
            description: formData.description,
            businessHours: formData.businessHours,
            // Note: Some fields like businessName, email might be restricted from updates
            // Only updating the fields that the API allows
          }),
        }
      );

      const updateResult = await updateResponse.json();

      if (!updateResponse.ok || !updateResult.success) {
        throw new Error(updateResult.message || 'Failed to update merchant info');
      }

      // Update reward percentage
      const rewardResponse = await fetch(
        `${API_BASE_URL}/merchants/${merchantId}/rewards/percentage`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            percentage: parseFloat(rewardPercentage)
          }),
        }
      );

      const rewardResult = await rewardResponse.json();

      if (!rewardResponse.ok || !rewardResult.success) {
        console.error('Failed to update reward percentage:', rewardResult.message);
      }

      // Show success message
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);

      // Refresh data
      fetchMerchantData();

    } catch (err) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested fields like address.city
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle business hours changes
  const handleBusinessHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: field === 'isOpen' ? value : value
        }
      }
    }));
  };

  // Initial data fetch
  useEffect(() => {
    fetchMerchantData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading business information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Information</h1>
          <p className="text-gray-600 mt-1">Manage your business profile and details</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-xl animate-scale-in">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Changes saved successfully!</span>
            </div>
          )}
          <button
            onClick={fetchMerchantData}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
              <p className="text-sm text-gray-600">Your business identity and contact details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Business Name
              </label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  className="input-field pl-12 bg-gray-50"
                  disabled
                  title="Business name cannot be changed"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Contact support to change business name</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Business Type
              </label>
              <input
                type="text"
                name="businessType"
                value={formData.businessType}
                className="input-field bg-gray-50"
                disabled
                title="Business type cannot be changed"
              />
              <p className="text-xs text-gray-500 mt-1">Contact support to change business type</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Business Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  className="input-field pl-12 bg-gray-50"
                  disabled
                  title="Email cannot be changed"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Contact support to change email</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="input-field pl-12"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Business Category
              </label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  className="input-field pl-12 bg-gray-50"
                  disabled
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Contact support to change category</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Business Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="input-field"
                placeholder="Describe your business..."
                required
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Business Address</h2>
              <p className="text-sm text-gray-600">Your physical location details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                className="input-field bg-gray-50"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Contact support to change address</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                State/Province
              </label>
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                className="input-field bg-gray-50"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                name="address.country"
                value={formData.address.country}
                className="input-field bg-gray-50"
                disabled
              />
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Business Hours</h2>
              <p className="text-sm text-gray-600">Set your operating hours for each day</p>
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries(formData.businessHours).map(([day, hours]) => (
              <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <label className="flex items-center gap-3 w-32">
                  <input
                    type="checkbox"
                    checked={hours.isOpen}
                    onChange={(e) => handleBusinessHoursChange(day, 'isOpen', e.target.checked)}
                    className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-sm font-semibold text-gray-900 capitalize">{day}</span>
                </label>
                
                {hours.isOpen ? (
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600 font-medium">Open:</label>
                      <input
                        type="time"
                        value={hours.open}
                        onChange={(e) => handleBusinessHoursChange(day, 'open', e.target.value)}
                        className="input-field py-2 px-3 text-sm"
                      />
                    </div>
                    <span className="text-gray-400">to</span>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600 font-medium">Close:</label>
                      <input
                        type="time"
                        value={hours.close}
                        onChange={(e) => handleBusinessHoursChange(day, 'close', e.target.value)}
                        className="input-field py-2 px-3 text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500 italic">Closed</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Loyalty Settings */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Loyalty Program Settings</h2>
              <p className="text-sm text-gray-600">Configure your rewards program</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reward Percentage *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={rewardPercentage}
                  onChange={(e) => setRewardPercentage(e.target.value)}
                  className="input-field pr-10"
                  min="1"
                  max="100"
                  required
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                  %
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Percentage of purchase amount converted to points
              </p>
            </div>

            <div className="md:col-span-2">
              <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg p-4 border border-primary-200">
                <h3 className="font-semibold text-gray-900 mb-2">How Rewards Work</h3>
                <div className="space-y-1 text-sm text-gray-700">
                  <p>• Customer spends {currencySymbol}100 → Earns {rewardPercentage} points (at {rewardPercentage}% rate)</p>
                  <p>• Points can be redeemed for discounts on future purchases</p>
                  <p>• Higher percentage = more generous rewards</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Status Info */}
        {merchantDetails && (
          <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                  merchantDetails.status === 'approved' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {merchantDetails.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
                <p className="text-lg font-bold text-gray-900">
                  {merchantDetails.stats?.totalTransactions || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Points Issued</p>
                <p className="text-lg font-bold text-gray-900">
                  {merchantDetails.stats?.totalPointsIssued || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Member Since</p>
                <p className="text-sm font-semibold text-gray-900">
                  {merchantDetails.createdAt 
                    ? new Date(merchantDetails.createdAt).toLocaleDateString() 
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <button 
            type="button" 
            onClick={fetchMerchantData}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Reset Changes
          </button>
          <button 
            type="submit" 
            disabled={saving}
            className="btn-primary flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MerchantBusinessInfo;