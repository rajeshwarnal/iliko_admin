import React, { useState } from 'react';
import { Gift, Save, TrendingUp, DollarSign, Percent, Award, Users, AlertCircle } from 'lucide-react';

const MerchantRewardSettings = () => {
  const [settings, setSettings] = useState({
    pointsEnabled: true,
    pointsPerDollar: 10,
    redeemRate: 100,
    redeemValue: 1,
    minPurchase: 5,
    maxRedeem: 50,
    birthdayBonus: 100,
    referralBonus: 50,
    welcomeBonus: 25
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Reward settings updated successfully!');
    }, 1500);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reward Settings</h1>
          <p className="text-gray-600 mt-1">Configure your loyalty program</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-green-800">
          <p className="font-semibold mb-1">Reward Program Benefits:</p>
          <p>A well-structured rewards program increases customer retention by up to 80% and encourages repeat visits.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Gift className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Points Program</h2>
              <p className="text-sm text-gray-600">Enable and configure customer rewards</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.pointsEnabled}
              onChange={(e) => handleChange('pointsEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {settings.pointsEnabled && (
          <div className="space-y-6 pt-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  Points Per Dollar Spent
                </label>
                <input
                  type="number"
                  value={settings.pointsPerDollar}
                  onChange={(e) => handleChange('pointsPerDollar', parseFloat(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  min="1"
                  step="1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Customer earns {settings.pointsPerDollar} points for every $1 spent
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-green-600" />
                  Minimum Purchase Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500">$</span>
                  <input
                    type="number"
                    value={settings.minPurchase}
                    onChange={(e) => handleChange('minPurchase', parseFloat(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    min="0"
                    step="0.01"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Minimum amount to earn points
                </p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Redemption Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-blue-900">
                    Points Needed for Redemption
                  </label>
                  <input
                    type="number"
                    value={settings.redeemRate}
                    onChange={(e) => handleChange('redeemRate', parseInt(e.target.value))}
                    className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-blue-900">
                    Redemption Value
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <input
                      type="number"
                      value={settings.redeemValue}
                      onChange={(e) => handleChange('redeemValue', parseFloat(e.target.value))}
                      className="w-full border border-blue-200 rounded-lg pl-8 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                <p className="text-sm font-medium text-blue-900">
                  {settings.redeemRate} points = ${settings.redeemValue} discount
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Maximum Points Redeemable Per Transaction
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={settings.maxRedeem}
                  onChange={(e) => handleChange('maxRedeem', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  min="0"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Maximum percentage of bill that can be paid with points
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Award className="w-6 h-6 text-orange-600" />
          Bonus Points
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Birthday Bonus</label>
            <input
              type="number"
              value={settings.birthdayBonus}
              onChange={(e) => handleChange('birthdayBonus', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              min="0"
            />
            <p className="text-xs text-gray-500 mt-1">Points given on customer's birthday</p>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Referral Bonus</label>
            <input
              type="number"
              value={settings.referralBonus}
              onChange={(e) => handleChange('referralBonus', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              min="0"
            />
            <p className="text-xs text-gray-500 mt-1">Points for successful referrals</p>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Welcome Bonus</label>
            <input
              type="number"
              value={settings.welcomeBonus}
              onChange={(e) => handleChange('welcomeBonus', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              min="0"
            />
            <p className="text-xs text-gray-500 mt-1">Points for new sign-ups</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-purple-600" />
          Rewards Calculator
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">$10 Purchase Earns</p>
            <p className="text-3xl font-bold text-purple-600">
              {(10 * settings.pointsPerDollar).toLocaleString()} pts
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">$50 Purchase Earns</p>
            <p className="text-3xl font-bold text-blue-600">
              {(50 * settings.pointsPerDollar).toLocaleString()} pts
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">$100 Purchase Earns</p>
            <p className="text-3xl font-bold text-green-600">
              {(100 * settings.pointsPerDollar).toLocaleString()} pts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantRewardSettings;