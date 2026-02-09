import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, Save, Tag, Percent, DollarSign, Calendar, Users, 
  AlertCircle, Sparkles, Upload, Image as ImageIcon, Loader2, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://ilikoapi.duckdns.org/api/v1';

const MerchantPromoCreate = () => {
  const navigate = useNavigate();

  // Get stored data
  const merchantId = localStorage.getItem('merchantId');
  const accessToken = localStorage.getItem('accessToken');


    const [currencySymbol, setCurrencySymbol] = useState('₹'); // ✅ NEW: Dynamic currency

  // State management
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    promoCode: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchaseAmount: '',
    validFrom: '',
    validUntil: '',
    termsAndConditions: '',
    perUserLimit: ''
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };


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

    useEffect(() => {
    fetchCurrencySymbol();
  }, []);

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  // Remove image
  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validation
    if (!formData.title || !formData.discountValue || !formData.validFrom || !formData.validUntil) {
      setError('Please fill in all required fields (Title, Discount Value, Valid From, Valid Until)');
      return;
    }

    if (!formData.discountType) {
      setError('Please select a discount type');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Create FormData for multipart/form-data
      const formDataToSend = new FormData();
      
      // Add image if selected
      if (image) {
        formDataToSend.append('image', image);
      }

      // Add all form fields
      formDataToSend.append('merchantId', merchantId);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('promoCode', formData.promoCode);
      formDataToSend.append('discountType', formData.discountType);
      formDataToSend.append('discountValue', parseFloat(formData.discountValue));
      
      if (formData.minPurchaseAmount) {
        formDataToSend.append('minPurchaseAmount', parseFloat(formData.minPurchaseAmount));
      }
      
      formDataToSend.append('validFrom', formData.validFrom);
      formDataToSend.append('validUntil', formData.validUntil);
      
      // Add terms as JSON array
      if (formData.termsAndConditions) {
        const termsArray = formData.termsAndConditions.split('\n').filter(t => t.trim());
        formDataToSend.append('termsAndConditions', JSON.stringify(termsArray));
      }

      // Add per user limit if specified
      if (formData.perUserLimit) {
        formDataToSend.append('perUserLimit', parseInt(formData.perUserLimit));
      }

      // Make API call
      const response = await fetch(`${API_BASE_URL}/promos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          // Don't set Content-Type - browser will set it with boundary for FormData
        },
        body: formDataToSend,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to create promo');
      }

      alert('Promo created successfully!');
      navigate('/merchant/promos');
    } catch (err) {
      setError(err.message || 'Failed to create promo. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Load template
  const loadTemplate = (template) => {
    switch (template) {
      case 'weekend':
        setFormData({
          ...formData,
          title: 'Weekend Special',
          description: '20% off on all items during weekends',
          promoCode: 'WEEKEND20',
          discountType: 'percentage',
          discountValue: '20',
          minPurchaseAmount: '500'
        });
        break;
      case 'newcustomer':
        setFormData({
          ...formData,
          title: 'New Customer Bonus',
          description: `${currencySymbol}100 off your first order`,
          promoCode: 'WELCOME100',
          discountType: 'fixed_amount',
          discountValue: '100',
          minPurchaseAmount: '500',
          perUserLimit: '1'
        });
        break;
      case 'points':
        setFormData({
          ...formData,
          title: 'Double Points Week',
          description: 'Earn 2x points on all purchases',
          promoCode: 'POINTS2X',
          discountType: 'points_multiplier',
          discountValue: '2',
          minPurchaseAmount: '300'
        });
        break;
      default:
        break;
    }
  };


  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/merchant/promos')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Create Promo</h1>
          <p className="text-gray-600 mt-1">Set up a new promotional offer</p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Create Promo
            </>
          )}
        </button>
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

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Promo Tips:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Create eye-catching titles that clearly communicate the benefit</li>
            <li>Set reasonable limits to prevent abuse while encouraging usage</li>
            <li>Time-limited offers create urgency and drive conversions</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Upload */}
          <div className="card">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary-600" />
              Promo Image
            </h2>
            <div className="space-y-4">
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Promo preview" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="promo-image"
                  />
                  <label htmlFor="promo-image" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-1">Click to upload promo image</p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="card">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-600" />
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Promo Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g., Weekend Special 20% Off"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe your promotional offer..."
                  rows="3"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Promo Code</label>
                <input
                  type="text"
                  value={formData.promoCode}
                  onChange={(e) => handleChange('promoCode', e.target.value.toUpperCase())}
                  placeholder="e.g., SAVE20"
                  className="input-field font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">Optional: Leave blank for auto-generated code</p>
              </div>
            </div>
          </div>

          {/* Discount Settings */}
          <div className="card">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Percent className="w-5 h-5 text-green-600" />
              Discount Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-3">
                  Discount Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => handleChange('discountType', 'percentage')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      formData.discountType === 'percentage'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Percent className={`w-6 h-6 mx-auto mb-2 ${
                      formData.discountType === 'percentage' ? 'text-primary-600' : 'text-gray-600'
                    }`} />
                    <p className="font-semibold text-sm">Percentage</p>
                    <p className="text-xs text-gray-600">% off</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('discountType', 'fixed_amount')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      formData.discountType === 'fixed_amount'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <DollarSign className={`w-6 h-6 mx-auto mb-2 ${
                      formData.discountType === 'fixed_amount' ? 'text-primary-600' : 'text-gray-600'
                    }`} />
                    <p className="font-semibold text-sm">Fixed</p>
                    <p className="text-xs text-gray-600">{currencySymbol} off</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('discountType', 'points_multiplier')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      formData.discountType === 'points_multiplier'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Sparkles className={`w-6 h-6 mx-auto mb-2 ${
                      formData.discountType === 'points_multiplier' ? 'text-primary-600' : 'text-gray-600'
                    }`} />
                    <p className="font-semibold text-sm">Points</p>
                    <p className="text-xs text-gray-600">x multiply</p>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Discount Value <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500 text-lg">
                    {formData.discountType === 'percentage' ? '%' : formData.discountType === 'fixed_amount' ? currencySymbol : 'x'}
                  </span>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => handleChange('discountValue', e.target.value)}
                    placeholder={formData.discountType === 'percentage' ? '20' : formData.discountType === 'fixed_amount' ? '100' : '2'}
                    className="input-field pl-10 text-lg font-bold"
                    min="0"
                    step={formData.discountType === 'fixed_amount' ? '1' : '0.1'}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Duration & Limits */}
          <div className="card">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Duration & Limits
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Valid From <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => handleChange('validFrom', e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Valid Until <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => handleChange('validUntil', e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Minimum Purchase ({currencySymbol})</label>
                <input
                  type="number"
                  value={formData.minPurchaseAmount}
                  onChange={(e) => handleChange('minPurchaseAmount', e.target.value)}
                  placeholder="0"
                  className="input-field"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Leave blank for no minimum</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Uses Per User</label>
                <input
                  type="number"
                  value={formData.perUserLimit}
                  onChange={(e) => handleChange('perUserLimit', e.target.value)}
                  placeholder="Unlimited"
                  className="input-field"
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">Leave blank for unlimited</p>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="card">
            <h2 className="text-lg font-bold mb-4">Terms & Conditions</h2>
            <textarea
              value={formData.termsAndConditions}
              onChange={(e) => handleChange('termsAndConditions', e.target.value)}
              placeholder="Enter terms and conditions (one per line)&#10;e.g.,&#10;Offer valid on selected items only&#10;Cannot be combined with other offers&#10;Valid for dine-in only"
              rows="4"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">Enter each term on a new line</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preview */}
          <div className="card bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Promo Preview
            </h3>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg mb-3" />
              )}
              <h4 className="font-bold text-lg mb-2">
                {formData.title || 'Your Promo Title'}
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                {formData.description || 'Your promo description will appear here'}
              </p>
              {formData.discountValue && (
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-lg text-center mb-4">
                  {/* ✅ UPDATED: Dynamic currency */}
                  <p className="text-3xl font-bold">
                    {formData.discountType === 'percentage' && `${formData.discountValue}%`}
                    {formData.discountType === 'fixed_amount' && `${currencySymbol}${formData.discountValue}`}
                    {formData.discountType === 'points_multiplier' && `${formData.discountValue}x`}
                  </p>
                  <p className="text-sm opacity-90">
                    {formData.discountType === 'points_multiplier' ? 'POINTS' : 'OFF'}
                  </p>
                </div>
              )}

              {formData.promoCode && (
                <div className="mb-4 text-center">
                  <span className="inline-block px-3 py-1 bg-gray-100 rounded text-sm font-mono font-bold">
                    {formData.promoCode}
                  </span>
                </div>
              )}
              <div className="space-y-2 text-sm">
                {formData.validFrom && formData.validUntil && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formData.validFrom} to {formData.validUntil}</span>
                  </div>
                )}
                {formData.minPurchaseAmount && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    {/* ✅ UPDATED: Dynamic currency */}
                    <span>Min. purchase: {currencySymbol}{formData.minPurchaseAmount}</span>
                  </div>
                )}
                {formData.perUserLimit && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>Limited to {formData.perUserLimit} uses per user</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Templates */}
          <div className="card">
            <h3 className="font-bold mb-3">Quick Templates</h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => loadTemplate('weekend')}
                className="w-full text-left p-3 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm transition-colors"
              >
                <p className="text-xs text-gray-600">20% off, min {currencySymbol}500</p>
                <p className="text-xs text-gray-600">20% off, min {currencySymbol}500</p>
              </button>
              <button
                type="button"
                onClick={() => loadTemplate('newcustomer')}
                className="w-full text-left p-3 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm transition-colors"
              >
                <p className="font-semibold">New Customer</p>
                <p className="text-xs text-gray-600">{currencySymbol}100 off, min {currencySymbol}500</p>
              </button>
              <button
                type="button"
                onClick={() => loadTemplate('points')}
                className="w-full text-left p-3 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm transition-colors"
              >
                <p className="font-semibold">Double Points</p>
                <p className="text-xs text-gray-600">2x points, min {currencySymbol}300</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantPromoCreate;