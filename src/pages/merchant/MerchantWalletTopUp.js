import React, { useState } from 'react';
import { CreditCard, Building2, Wallet, Check, ArrowLeft, Info } from 'lucide-react';

const MerchantWalletTopup = () => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);

  const quickAmounts = [50, 100, 250, 500, 1000];

  const handleTopup = () => {
    if (!amount || parseFloat(amount) < 10) {
      alert('Minimum top-up amount is $10');
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      alert('Top-up successful!');
      setAmount('');
    }, 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold">Top Up Wallet</h1>
          <p className="text-gray-600 mt-1">Add funds to your merchant account</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">Enter Amount</h2>
            <div className="relative mb-4">
              <span className="absolute left-4 top-4 text-gray-500 text-2xl">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full border-2 border-gray-300 rounded-lg pl-12 pr-4 py-4 text-3xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                min="10"
                step="0.01"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {quickAmounts.map(amt => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt.toString())}
                  className="px-6 py-2 border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 rounded-lg font-semibold transition-colors"
                >
                  ${amt}
                </button>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg flex gap-2">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900">
                Minimum top-up amount is $10. Funds will be available instantly.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">Payment Method</h2>
            <div className="space-y-3">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`w-full p-4 border-2 rounded-lg flex items-center gap-4 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  paymentMethod === 'card' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <CreditCard className={`w-6 h-6 ${
                    paymentMethod === 'card' ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold">Credit/Debit Card</p>
                  <p className="text-sm text-gray-600">Instant processing</p>
                </div>
                {paymentMethod === 'card' && (
                  <Check className="w-6 h-6 text-blue-600" />
                )}
              </button>

              <button
                onClick={() => setPaymentMethod('bank')}
                className={`w-full p-4 border-2 rounded-lg flex items-center gap-4 transition-all ${
                  paymentMethod === 'bank'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  paymentMethod === 'bank' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Building2 className={`w-6 h-6 ${
                    paymentMethod === 'bank' ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold">Bank Transfer</p>
                  <p className="text-sm text-gray-600">1-3 business days</p>
                </div>
                {paymentMethod === 'bank' && (
                  <Check className="w-6 h-6 text-blue-600" />
                )}
              </button>
            </div>
          </div>

          {paymentMethod === 'card' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-4">Card Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'bank' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-4">Bank Transfer Instructions</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span className="text-gray-600">Bank Name:</span>
                  <span className="font-semibold">Example Bank</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span className="text-gray-600">Account Name:</span>
                  <span className="font-semibold">Merchant Services Ltd</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span className="text-gray-600">Account Number:</span>
                  <span className="font-semibold">123456789012</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span className="text-gray-600">Routing Number:</span>
                  <span className="font-semibold">987654321</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span className="text-gray-600">Reference:</span>
                  <span className="font-semibold">MERCH-{Date.now().toString().slice(-6)}</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-900">
                Please include the reference number in your transfer description.
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold mb-4">Order Summary</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Top-up Amount</span>
                <span className="font-semibold">${amount || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processing Fee</span>
                <span className="font-semibold text-green-600">$0.00</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-bold">Total</span>
                <span className="font-bold text-xl">${amount || '0.00'}</span>
              </div>
            </div>
            <button
              onClick={handleTopup}
              disabled={!amount || parseFloat(amount) < 10 || processing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? 'Processing...' : 'Complete Top-up'}
            </button>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Current Balance</p>
                <p className="text-2xl font-bold">$1,703.50</p>
              </div>
            </div>
            {amount && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-1">New Balance</p>
                <p className="text-3xl font-bold text-green-600">
                  ${(1703.50 + parseFloat(amount || 0)).toFixed(2)}
                </p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold mb-2 text-sm">Secure Payment</h4>
            <p className="text-xs text-gray-600">
              Your payment information is encrypted and secure. We never store your card details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantWalletTopup;