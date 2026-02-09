import React, { useEffect, useState } from 'react';
import { QrCode, Camera, Upload, Check, X, User, Award, Loader2, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const API_BASE_URL = 'http://192.168.31.224:3000/api/v1';

const MerchantQRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [amount, setAmount] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('₹'); // ✅ NEW: Dynamic currency

  // Get stored merchant data
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

  // ✅ NEW: Fetch currency on mount
  useEffect(() => {
    fetchCurrencySymbol();
  }, []);


  // Handle QR Code Scan
  const handleScan = async () => {
    if (!qrCode.trim()) {
      setError('Please enter a QR code');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/qr-payments/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          qrCode: qrCode.trim()
        })
      });

      const result = await response.json();
      console.log('Scan Result:', result);

      if (response.ok && result.success) {
        setScanResult(result.data);
        setError('');
      } else {
        setError(result.message || 'Failed to scan QR code');
        setScanResult(null);
      }
    } catch (err) {
      console.error('Scan error:', err);
      setError('Failed to scan QR code. Please try again.');
      setScanResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle Transaction
  const handleTransaction = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/qr-payments/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          customerId: scanResult.customer._id,
          amount: parseFloat(amount),
          merchantId: merchantId
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setScanResult(null);
          setAmount('');
          setQrCode('');
        }, 3000);
      } else {
        setError(result.message || 'Transaction failed');
      }
    } catch (err) {
      console.error('Transaction error:', err);
      setError('Transaction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">QR Scanner</h1>
        <p className="text-gray-600 mt-1">Scan customer QR codes to process transactions</p>
      </div>

      {/* Generate Mode - COMMENTED OUT FOR NOW */}
      {/* 
      <div className="card">
        <div className="grid grid-cols-2 gap-4">
          <button className="p-4 rounded-lg border-2 border-gray-200">
            <QrCode className="w-8 h-8 mx-auto mb-2 text-primary-600" />
            <p className="font-medium text-gray-900">Generate QR</p>
            <p className="text-sm text-gray-600 mt-1">Create a QR code for customers</p>
          </button>
        </div>
      </div>
      */}

      {/* Scan Mode */}
      <div className="grid md:grid-cols-2 gap-6">
        {!scanResult ? (
          <>
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Scan Customer QR</h2>
              
              {/* Error Display */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter QR Code
                  </label>
                  <input
                    type="text"
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    placeholder="Paste or enter QR code here"
                    className="input-field"
                    disabled={loading}
                  />
                </div>

                <button 
                  onClick={handleScan}
                  disabled={loading || !qrCode.trim()}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      Scan QR Code
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Ask for Customer QR</p>
                    <p className="text-sm text-gray-600">Request the customer to open their loyalty app</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Enter QR Code</p>
                    <p className="text-sm text-gray-600">Paste or type the QR code value</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Enter Amount</p>
                    <p className="text-sm text-gray-600">Input transaction amount and confirm</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 font-bold">4</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Complete Transaction</p>
                    <p className="text-sm text-gray-600">Process payment and award points</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Customer Info */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {scanResult.customer?.firstName?.charAt(0) || '?'}
                    {scanResult.customer?.lastName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {scanResult.customer?.firstName} {scanResult.customer?.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{scanResult.customer?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-primary-50 to-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Loyalty Points</p>
                    <p className="text-2xl font-bold text-primary-600">
                      {scanResult.loyaltyPoints || 0}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Phone</p>
                    <p className="text-lg font-bold text-green-600">
                      {scanResult.customer?.phoneNumber || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Form */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Process Transaction</h2>
              
              {/* Error Display */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {!showSuccess ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction Amount ({currencySymbol})
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="input-field text-lg"
                      autoFocus
                      disabled={loading}
                    />
                  </div>

                  <div className="bg-primary-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Points to Award</span>
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-primary-600" />
                        <span className="text-xl font-bold text-primary-600">
                          +{amount ? Math.floor(parseFloat(amount) * 0.1) : 0}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">10% cashback in loyalty points</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Current Points</span>
                      <span className="font-medium">{scanResult.loyaltyPoints || 0}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Points Earned</span>
                      <span className="font-medium text-green-600">
                        +{amount ? Math.floor(parseFloat(amount) * 0.1) : 0}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                      <span className="font-medium text-gray-900">New Balance</span>
                      <span className="font-bold text-primary-600">
                        {(scanResult.loyaltyPoints || 0) + (amount ? Math.floor(parseFloat(amount) * 0.1) : 0)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setScanResult(null);
                        setQrCode('');
                        setError('');
                      }}
                      disabled={loading}
                      className="btn-secondary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleTransaction}
                      disabled={!amount || parseFloat(amount) <= 0 || loading}
                      className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Complete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
                  <p className="text-gray-600 mb-4">Transaction completed successfully</p>
                  <div className="bg-green-50 p-4 rounded-lg inline-block">
                    <p className="text-sm text-gray-600 mb-1">Amount Charged</p>
                    <p className="text-3xl font-bold text-green-600">{currencySymbol}{amount}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      {Math.floor(parseFloat(amount) * 0.1)} points awarded
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MerchantQRScanner;