import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Lock, Building2, Bell, Check, Eye, EyeOff,
  Loader2, AlertCircle, RefreshCw, Shield
} from 'lucide-react';

const API_BASE_URL = 'https://ilikoapi.duckdns.org/api/v1';

const MerchantSettings = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Get stored data
  const accessToken = localStorage.getItem('accessToken');
  const merchantId = localStorage.getItem('merchantId');

  // Profile data
  const [userData, setUserData] = useState(null);
  const [merchantData, setMerchantData] = useState(null);

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    businessName: '',
    businessAddress: '',
  });

  // Password data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch user and merchant data
  const fetchProfileData = async () => {
    try {
      if (!accessToken) {
        throw new Error('Authentication required. Please login again.');
      }

      setLoading(true);
      setError('');

      // Fetch user profile
      const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch profile data');
      }

      const userResult = await userResponse.json();
      
      if (userResult.success) {
        const user = userResult.data.user;
        setUserData(user);
        
        // Set profile form data
        setProfile({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          businessName: '',
          businessAddress: '',
        });
      }

      // Fetch merchant data if available
      if (merchantId) {
        const merchantResponse = await fetch(
          `${API_BASE_URL}/merchants/${merchantId}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        if (merchantResponse.ok) {
          const merchantResult = await merchantResponse.json();
          if (merchantResult.success) {
            const merchant = merchantResult.data.merchant;
            setMerchantData(merchant);
            
            // Update profile with merchant data
            setProfile(prev => ({
              ...prev,
              businessName: merchant.businessName || '',
              businessAddress: `${merchant.address?.city || ''}, ${merchant.address?.state || ''}, ${merchant.address?.country || ''}`.trim(),
            }));
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load profile data');
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const updateProfile = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  // Update password field
  const updatePassword = (field, value) => {
    setPasswordData({ ...passwordData, [field]: value });
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phoneNumber: profile.phoneNumber,
          // Note: email might not be editable based on API restrictions
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update profile');
      }

      // Update localStorage
      const updatedUser = result.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setSuccessMessage('Profile updated successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Refresh data
      fetchProfileData();
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New password and confirmation do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }

    setChangingPassword(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to change password');
      }

      setSuccessMessage('Password changed successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchProfileData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account preferences</p>
        </div>
        <button
          onClick={fetchProfileData}
          className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3 animate-scale-in">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-medium">{successMessage}</span>
        </div>
      )}

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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Profile */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">User Profile</h2>
                <p className="text-sm text-gray-600">Update your personal information</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={profile.firstName}
                      onChange={(e) => updateProfile('firstName', e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => updateProfile('lastName', e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={profile.email}
                    className="input-field pl-10 bg-gray-50"
                    disabled
                    title="Email cannot be changed"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Contact support to change email</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={profile.phoneNumber}
                    onChange={(e) => updateProfile('phoneNumber', e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <button 
                onClick={handleSaveProfile}
                disabled={saving}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Business Info (Read-only) */}
          {merchantData && (
            <div className="card bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Business Information</h2>
                  <p className="text-sm text-gray-600">View your business details</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-white rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Business Name</label>
                  <p className="font-semibold text-gray-900">{profile.businessName}</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
                  <p className="font-semibold text-gray-900">{profile.businessAddress}</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                  <p className="font-semibold text-gray-900">{merchantData.category}</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                    merchantData.status === 'approved' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {merchantData.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Go to Business Info page to edit business details
              </p>
            </div>
          )}

          {/* Change Password */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
                <p className="text-sm text-gray-600">Update your password regularly for security</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => updatePassword('currentPassword', e.target.value)}
                    className="input-field pl-10 pr-12"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password *
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => updatePassword('newPassword', e.target.value)}
                    className="input-field pl-10"
                    placeholder="Enter new password"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters with uppercase, lowercase, number and special character
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => updatePassword('confirmPassword', e.target.value)}
                    className="input-field pl-10"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <button 
                onClick={handleChangePassword}
                disabled={changingPassword}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {changingPassword ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Changing Password...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Account Info */}
          <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-4">Account Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-blue-700 mb-1">Account Type</p>
                <p className="font-semibold text-blue-900">{userData?.role === 'merchant' ? 'Merchant' : 'Admin'}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700 mb-1">Account Status</p>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                  userData?.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {userData?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <p className="text-sm text-blue-700 mb-1">Member Since</p>
                <p className="font-semibold text-blue-900">
                  {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-700 mb-1">Last Login</p>
                <p className="font-semibold text-blue-900">
                  {userData?.lastLogin ? new Date(userData.lastLogin).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card sticky top-6">
            <h3 className="font-bold mb-4 text-gray-900">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full btn-primary"
              >
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
              <button 
                onClick={fetchProfileData}
                className="w-full btn-secondary"
              >
                Reload Data
              </button>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
            <h3 className="font-bold text-amber-900 mb-2">Need Help?</h3>
            <p className="text-sm text-amber-800 mb-4">
              Contact our support team for assistance with your account settings.
            </p>
            <button className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 font-medium transition-colors">
              Contact Support
            </button>
          </div>

          <div className="card bg-gradient-to-br from-red-50 to-rose-50 border border-red-200">
            <h3 className="font-bold text-red-900 mb-2">Danger Zone</h3>
            <p className="text-sm text-red-800 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-medium transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantSettings;