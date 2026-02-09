import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Database, DollarSign, Globe, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const API_BASE_URL = 'https://ilikoapi.duckdns.org/api/v1';

const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Settings state
  const [settings, setSettings] = useState({
    // Currency
    currencySymbol: '₹',
    
    // MFA & System
    pointsConversionRate: 25,
    appName: 'Loyalty Program',
    supportEmail: 'support@loyalty.com',
    pointsExpiryEnabled: false,
    pointsExpiryDays: 365
  });

  const accessToken = localStorage.getItem('accessToken');

  // Fetch all settings on mount
  useEffect(() => {
    fetchAllSettings();
  }, []);

  const fetchAllSettings = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch currency symbol
      const currencyResponse = await fetch(`${API_BASE_URL}/settings/currency`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const currencyResult = await currencyResponse.json();

      // Fetch system settings (MFA)
      const systemResponse = await fetch(`${API_BASE_URL}/globalsettings`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const systemResult = await systemResponse.json();

      // Update state with currency
      if (currencyResponse.ok && currencyResult.success) {
        setSettings(prev => ({
          ...prev,
          currencySymbol: currencyResult.data.currencySymbol
        }));
      }

      // Update state with system settings
      if (systemResponse.ok && systemResult.success) {
        const settingsMap = {};
        systemResult.data.settings.forEach(setting => {
          if (setting.settingKey === 'points_conversion_rate') {
            settingsMap.pointsConversionRate = setting.settingValue;
          } else if (setting.settingKey === 'app_name') {
            settingsMap.appName = setting.settingValue;
          } else if (setting.settingKey === 'support_email') {
            settingsMap.supportEmail = setting.settingValue;
          } else if (setting.settingKey === 'points_expiry_enabled') {
            settingsMap.pointsExpiryEnabled = setting.settingValue;
          } else if (setting.settingKey === 'points_expiry_days') {
            settingsMap.pointsExpiryDays = setting.settingValue;
          }
        });
        
        setSettings(prev => ({ ...prev, ...settingsMap }));
      }
    } catch (err) {
      console.error('Fetch settings error:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSystemSetting = async (key, value, description = '', category = 'general') => {
    try {
      const response = await fetch(`${API_BASE_URL}/globalsettings/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          value,
          description,
          category
        })
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update setting');
      }
      return true;
    } catch (err) {
      console.error('Update setting error:', err);
      throw err;
    }
  };

  const updateCurrencySymbol = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/currency`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          currencySymbol: settings.currencySymbol
        })
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update currency');
      }
      return true;
    } catch (err) {
      console.error('Update currency error:', err);
      throw err;
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Update Currency Symbol
      await updateCurrencySymbol();

      // Update MFA (Points Conversion Rate)
      await updateSystemSetting(
        'points_conversion_rate',
        parseFloat(settings.pointsConversionRate),
        'Currency conversion rate: 1 point = X rupees (MFA)',
        'currency'
      );

      // Update App Name
      await updateSystemSetting(
        'app_name',
        settings.appName,
        'Application name',
        'general'
      );

      // Update Support Email
      await updateSystemSetting(
        'support_email',
        settings.supportEmail,
        'Support email address',
        'general'
      );

      // Update Points Expiry Settings
      await updateSystemSetting(
        'points_expiry_enabled',
        settings.pointsExpiryEnabled,
        'Enable points expiry',
        'points'
      );

      await updateSystemSetting(
        'points_expiry_days',
        parseInt(settings.pointsExpiryDays),
        'Number of days before points expire',
        'points'
      );

      setSuccess('All settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInitializeSettings = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/globalsettings/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess('Default settings initialized successfully!');
        fetchAllSettings();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message || 'Failed to initialize settings');
      }
    } catch (err) {
      console.error('Initialize error:', err);
      setError('Failed to initialize settings');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !settings.pointsConversionRate) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <p className="text-gray-600 mt-1">Manage system preferences and configurations</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="card bg-green-50 border-green-200 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-800 font-medium">{success}</p>
        </div>
      )}

      {error && (
        <div className="card bg-red-50 border-red-200 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Currency Settings */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-600" />
              Currency Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Currency Symbol
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={settings.currencySymbol}
                    onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                    className="input-field w-32 text-center text-2xl font-bold"
                    placeholder="₹"
                    maxLength="5"
                  />
                 
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-2">Preview:</p>
                <div className="space-y-1 text-sm text-gray-700">
                  <p>• Customer Balance: <strong>{settings.currencySymbol}1,250</strong></p>
                  <p>• Transaction Amount: <strong>{settings.currencySymbol}500</strong></p>
                  <p>• Points Value: <strong>10 points = {settings.currencySymbol}{10 * parseFloat(settings.pointsConversionRate || 0)}</strong></p>
                </div>
              </div>
            </div>
          </div>

          {/* Points & MFA Settings */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary-600" />
              Points & Currency Configuration
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Points Conversion Rate (MFA - Multiplier Factor)
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">1 Point =</span>
                  <input
                    type="number"
                    value={settings.pointsConversionRate}
                    onChange={(e) => setSettings({ ...settings, pointsConversionRate: e.target.value })}
                    className="input-field w-32"
                    min="1"
                    step="0.01"
                  />
                  <span className="text-sm text-gray-600">{settings.currencySymbol}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Default: {settings.currencySymbol}25 per point. This affects how merchants are charged for points issued.
                </p>
              </div>

              <div className="bg-primary-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-2">Example Calculation:</p>
                <div className="space-y-1 text-sm text-gray-700">
                  <p>• Customer earns: <strong>10 points</strong></p>
                  <p>• Merchant charged: <strong>10 × {settings.currencySymbol}{settings.pointsConversionRate} = {settings.currencySymbol}{10 * parseFloat(settings.pointsConversionRate || 0)}</strong></p>
                </div>
              </div>

              {/* Points Expiry */}
              <div className="border-t pt-4">
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={settings.pointsExpiryEnabled}
                    onChange={(e) => setSettings({ ...settings, pointsExpiryEnabled: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="font-medium">Enable Points Expiry</span>
                </label>

                {settings.pointsExpiryEnabled && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Points Expiry Duration (Days)
                    </label>
                    <input
                      type="number"
                      value={settings.pointsExpiryDays}
                      onChange={(e) => setSettings({ ...settings, pointsExpiryDays: e.target.value })}
                      className="input-field"
                      min="1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Points will expire after this many days from the date they were earned.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* General Settings */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-primary-600" />
              General Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Application Name</label>
                <input
                  type="text"
                  value={settings.appName}
                  onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Support Email</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving All Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save All Settings
              </>
            )}
          </button>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Settings Display */}
          <div className="card bg-gradient-to-br from-purple-50 to-blue-50">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Current Configuration</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-600">Currency</p>
                <p className="text-3xl font-bold text-purple-600">{settings.currencySymbol}</p>
              </div>
              <div className="border-t border-purple-200 pt-3">
                <p className="text-xs text-gray-600">MFA Rate</p>
                <p className="text-3xl font-bold text-primary-600">
                  {settings.currencySymbol}{settings.pointsConversionRate}
                </p>
                <p className="text-xs text-gray-600 mt-1">per point</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button 
                onClick={fetchAllSettings}
                disabled={loading}
                className="w-full btn-secondary text-sm disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Refresh Settings'}
              </button>
              <button 
                onClick={handleInitializeSettings}
                disabled={loading}
                className="w-full btn-secondary text-sm disabled:opacity-50"
              >
                {loading ? 'Initializing...' : 'Initialize Defaults'}
              </button>
              <button className="w-full btn-secondary text-sm">
                Export Configuration
              </button>
            </div>
          </div>

          {/* Info Card */}
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">💡 Important</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Currency changes apply immediately</li>
              <li>• MFA affects future transactions only</li>
              <li>• Settings sync across all platforms</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;