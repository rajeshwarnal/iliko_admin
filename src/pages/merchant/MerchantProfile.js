import React, { useState, useEffect } from 'react';
import { Upload, Image, X, Check, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

const API_BASE_URL = 'https://ilikoapi.duckdns.org/api/v1';

const MerchantProfileMedia = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [logo, setLogo] = useState(null);
  const [banner, setBanner] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  // Get stored data
  const merchantId = localStorage.getItem('merchantId');
  const accessToken = localStorage.getItem('accessToken');

  // Fetch merchant media
  const fetchMerchantMedia = async () => {
    try {
      if (!merchantId || !accessToken) {
        throw new Error('Authentication required. Please login again.');
      }

      setLoading(true);
      setError('');

      const response = await fetch(
        `${API_BASE_URL}/merchants/${merchantId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch merchant data');
      }

      const result = await response.json();
      
      if (result.success) {
        const merchant = result.data.merchant;
        
        // Set logo and banner from API
        if (merchant.logo?.url) {
          setLogo(merchant.logo.url);
          setLogoPreview(merchant.logo.url);
        }
        
        if (merchant.banner?.url) {
          setBanner(merchant.banner.url);
          setBannerPreview(merchant.banner.url);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load media');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Upload logo
  const handleLogoUpload = async (file) => {
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      setError('Logo file size must be less than 5MB');
      return;
    }

    setUploadingLogo(true);
    setError('');

    try {
      // Create form data
      const formData = new FormData();
      formData.append('logo', file);

      // Upload to API
      const response = await fetch(
        `${API_BASE_URL}/merchants/${merchantId}/logo`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to upload logo');
      }

      // Update logo
      const newLogoUrl = result.data?.merchant?.logo?.url || result.data?.logo?.url;
      if (newLogoUrl) {
        setLogo(newLogoUrl);
        setLogoPreview(newLogoUrl);
      }

      // Show success message
      setSuccessMessage('Logo uploaded successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // Refresh data
      fetchMerchantMedia();
    } catch (err) {
      setError(err.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  // Upload banner
  const handleBannerUpload = async (file) => {
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      setError('Banner file size must be less than 10MB');
      return;
    }

    setUploadingBanner(true);
    setError('');

    try {
      // Create form data
      const formData = new FormData();
      formData.append('banner', file);

      // Upload to API
      const response = await fetch(
        `${API_BASE_URL}/merchants/${merchantId}/banner`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to upload banner');
      }

      // Update banner
      const newBannerUrl = result.data?.merchant?.banner?.url || result.data?.banner?.url;
      if (newBannerUrl) {
        setBanner(newBannerUrl);
        setBannerPreview(newBannerUrl);
      }

      // Show success message
      setSuccessMessage('Banner uploaded successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // Refresh data
      fetchMerchantMedia();
    } catch (err) {
      setError(err.message || 'Failed to upload banner');
    } finally {
      setUploadingBanner(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (type) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Show preview
        const reader = new FileReader();
        reader.onload = (event) => {
          if (type === 'logo') {
            setLogoPreview(event.target.result);
          } else {
            setBannerPreview(event.target.result);
          }
        };
        reader.readAsDataURL(file);

        // Upload file
        if (type === 'logo') {
          handleLogoUpload(file);
        } else {
          handleBannerUpload(file);
        }
      }
    };
    input.click();
  };

  // Initial data fetch
  useEffect(() => {
    fetchMerchantMedia();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading media...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Logo & Banner</h1>
          <p className="text-gray-600 mt-1">Manage your business visual identity</p>
        </div>
        <button 
          onClick={fetchMerchantMedia}
          className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3 animate-scale-in">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
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

      <div className="card space-y-8">
        {/* Logo Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Image className="w-6 h-6 text-primary-600" />
            Business Logo
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gradient-to-br from-gray-50 to-gray-100 hover:border-primary-400 transition-colors">
                {logoPreview ? (
                  <div className="relative inline-block">
                    <img 
                      src={logoPreview} 
                      alt="Logo" 
                      className="w-48 h-48 object-cover mx-auto rounded-xl mb-4 shadow-lg"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200x200?text=Logo+Not+Found';
                      }}
                    />
                    {uploadingLogo && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-48 h-48 mx-auto rounded-xl mb-4 bg-gray-200 flex items-center justify-center">
                    <Image className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                <button 
                  onClick={() => handleFileSelect('logo')}
                  disabled={uploadingLogo}
                  className="btn-primary flex items-center gap-2 mx-auto"
                >
                  {uploadingLogo ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload New Logo
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-blue-900 mb-2">Logo Guidelines</p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Recommended size: 500x500 pixels</li>
                      <li>• Square format works best</li>
                      <li>• Maximum file size: 5MB</li>
                      <li>• Formats: JPG, PNG, or WebP</li>
                      <li>• Use high contrast for visibility</li>
                      <li>• Transparent background recommended</li>
                    </ul>
                  </div>
                </div>
              </div>
              {logo && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Current Logo URL:</p>
                  <p className="text-xs text-gray-800 font-mono break-all">{logo}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Banner Section */}
        <div className="pt-6 border-t border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Image className="w-6 h-6 text-primary-600" />
            Banner Image
          </h2>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-gray-100 hover:border-primary-400 transition-colors">
              {bannerPreview ? (
                <div className="relative">
                  <img 
                    src={bannerPreview} 
                    alt="Banner" 
                    className="w-full h-64 object-cover rounded-xl mb-4 shadow-lg"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/1200x400?text=Banner+Not+Found';
                    }}
                  />
                  {uploadingBanner && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-64 rounded-xl mb-4 bg-gray-200 flex items-center justify-center">
                  <Image className="w-16 h-16 text-gray-400" />
                </div>
              )}
              <button 
                onClick={() => handleFileSelect('banner')}
                disabled={uploadingBanner}
                className="btn-primary flex items-center gap-2 mx-auto"
              >
                {uploadingBanner ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload New Banner
                  </>
                )}
              </button>
            </div>
            
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-purple-900 mb-2">Banner Guidelines</p>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• Recommended size: 1920x600 pixels</li>
                    <li>• Aspect ratio: 16:5 or similar landscape</li>
                    <li>• Maximum file size: 10MB</li>
                    <li>• Formats: JPG, PNG, or WebP</li>
                    <li>• This appears on your merchant profile page</li>
                    <li>• Ensure important content is centered</li>
                  </ul>
                </div>
              </div>
            </div>

            {banner && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Current Banner URL:</p>
                <p className="text-xs text-gray-800 font-mono break-all">{banner}</p>
              </div>
            )}
          </div>
        </div>

        {/* Preview Section */}
        <div className="pt-6 border-t border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Preview</h2>
          <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-lg">
            {/* Banner Preview */}
            <div className="relative h-48 bg-gradient-to-r from-gray-200 to-gray-300">
              {bannerPreview && (
                <img 
                  src={bannerPreview} 
                  alt="Banner Preview" 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            {/* Logo Overlay */}
            <div className="relative px-6 pb-6">
              <div className="flex items-end gap-4 -mt-16">
                <div className="w-32 h-32 rounded-xl border-4 border-white bg-white shadow-xl overflow-hidden flex-shrink-0">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Logo Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Image className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="pb-2">
                  <h3 className="text-2xl font-bold text-gray-900">Your Business Name</h3>
                  <p className="text-gray-600">This is how your profile will appear to customers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
          <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <Check className="w-5 h-5" />
            Best Practices
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Use your official business logo for consistency</li>
            <li>• Choose a banner that represents your brand</li>
            <li>• Ensure images are clear and professional</li>
            <li>• Test how images look on different devices</li>
          </ul>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
          <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Important Notes
          </h3>
          <ul className="text-sm text-purple-800 space-y-2">
            <li>• Images are automatically optimized after upload</li>
            <li>• Changes take effect immediately</li>
            <li>• Keep backup copies of original images</li>
            <li>• Images must comply with content guidelines</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MerchantProfileMedia;