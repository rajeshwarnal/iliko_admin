import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Mail, Lock, Eye, EyeOff, Loader2, Store, Shield, Sparkles, 
  TrendingUp, User, Phone, Building, ArrowRight, ArrowLeft, 
  CheckCircle, MapPin, Clock, FileText, Image, Upload, X, AlertCircle
} from 'lucide-react';

const API_BASE_URL = 'https://ilikoapi.duckdns.org/api/v1';

const LoginModern = () => {
  // View states
  const [view, setView] = useState('login'); // 'login', 'register', 'merchant-setup'
  const [loginType, setLoginType] = useState('admin');
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Registration form state
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'admin'
  });
  
  // Merchant setup state (4-step process now includes media)
  const [merchantStep, setMerchantStep] = useState(1);
  const [merchantData, setMerchantData] = useState({
    // Step 1: Basic Business Info
    businessName: '',
    businessType: '',
    category: '',
    email: '',
    phoneNumber: '',
    // Step 2: Address
    address: {
      city: '',
      state: '',
      country: 'India'
    },
    // Step 3: Business Hours & Description
    description: '',
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
  
  // Media upload state (Step 4)
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [createdMerchantId, setCreatedMerchantId] = useState(null);
  
  // UI states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Auth context
  const { login: authLogin, setUser, setTokens } = useAuth();
  const navigate = useNavigate();
  
  // Store tokens temporarily for merchant setup
  const [tempAuthData, setTempAuthData] = useState(null);

  // ============ API CALLS ============
  
  // ✅ UPDATED: Login API with consistent token storage
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      const { user, tokens, business } = data.data;
      
      // Check merchant review status
      if (user.role === 'merchant' && business) {
        if (business.status === 'pending') {
          setError('Your merchant account is under review. Please wait for admin approval.');
          setLoading(false);
          return;
        }
        
        if (business.status === 'rejected') {
          setError('Your merchant account has been rejected. Please contact support.');
          setLoading(false);
          return;
        }
      }
      
      // ✅ FIXED: Store tokens with BOTH keys for compatibility
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('authToken', tokens.accessToken); // Backup key for compatibility
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('✅ Tokens stored successfully:', {
        accessToken: tokens.accessToken.substring(0, 20) + '...',
        authToken: tokens.accessToken.substring(0, 20) + '...',
        user: user.email
      });
      
      // For merchants, store business data and merchantId
      if (user.role === 'merchant' && business) {
        localStorage.setItem('merchant', JSON.stringify(business));
        localStorage.setItem('merchantId', business.businessId || business._id);
      }
      
      // Update auth context if available
      if (setUser) setUser(user);
      if (setTokens) setTokens(tokens);

      // Navigate based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'merchant') {
        navigate('/merchant/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Register API
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      // If merchant, need to login first then setup business
      if (registerData.role === 'merchant') {
        // Auto-login after registration
        const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: registerData.email,
            password: registerData.password,
          }),
        });

        const loginData = await loginResponse.json();

        if (!loginResponse.ok || !loginData.success) {
          throw new Error('Registration successful but auto-login failed. Please login manually.');
        }

        // Store auth data temporarily for merchant setup
        setTempAuthData(loginData.data);
        
        // Pre-fill merchant email
        setMerchantData(prev => ({
          ...prev,
          email: registerData.email
        }));
        
        // Move to merchant setup
        setView('merchant-setup');
        setSuccess('Account created! Now set up your business profile.');
      } else {
        // Admin registration - show success and switch to login
        setSuccess('Registration successful! Please login with your credentials.');
        setView('login');
        setEmail(registerData.email);
        setPassword('');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Merchant Business Setup API (Step 3 creates business)
  const handleMerchantSetup = async () => {
    setError('');
    setLoading(true);

    try {
      if (!tempAuthData?.tokens?.accessToken) {
        throw new Error('Authentication required. Please login again.');
      }

      const response = await fetch(`${API_BASE_URL}/merchants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempAuthData.tokens.accessToken}`,
        },
        body: JSON.stringify({
          businessName: merchantData.businessName,
          businessType: merchantData.businessType,
          category: merchantData.category,
          email: merchantData.email,
          phoneNumber: merchantData.phoneNumber,
          address: merchantData.address,
          description: merchantData.description,
          businessHours: merchantData.businessHours,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Business setup failed');
      }

      // Store merchant ID for media upload
      const merchantBusiness = data.data.merchant;
      setCreatedMerchantId(merchantBusiness._id);

      setSuccess('Business profile created! Now upload your logo and banner.');
      
      // Move to step 4 (media upload)
      setMerchantStep(4);
    } catch (err) {
      setError(err.message || 'Business setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle logo selection
  const handleLogoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file for logo');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Logo file size must be less than 5MB');
      return;
    }

    setLogoFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
    setError('');
  };

  // Handle banner selection
  const handleBannerSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file for banner');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Banner file size must be less than 10MB');
      return;
    }

    setBannerFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result);
    };
    reader.readAsDataURL(file);
    setError('');
  };

  // Complete merchant setup with media upload
  const handleCompleteSetup = async () => {
    if (!logoFile || !bannerFile) {
      setError('Please upload both logo and banner to continue');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Upload logo
      const logoFormData = new FormData();
      logoFormData.append('logo', logoFile);

      const logoResponse = await fetch(
        `${API_BASE_URL}/merchants/${createdMerchantId}/logo`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tempAuthData.tokens.accessToken}`,
          },
          body: logoFormData,
        }
      );

      if (!logoResponse.ok) {
        throw new Error('Failed to upload logo');
      }

      // Upload banner
      const bannerFormData = new FormData();
      bannerFormData.append('banner', bannerFile);

      const bannerResponse = await fetch(
        `${API_BASE_URL}/merchants/${createdMerchantId}/banner`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tempAuthData.tokens.accessToken}`,
          },
          body: bannerFormData,
        }
      );

      if (!bannerResponse.ok) {
        throw new Error('Failed to upload banner');
      }

      // Show review message instead of navigating
      setSuccess('Business setup complete! Your account is under review. Please wait for admin approval before accessing your dashboard. You will be redirected to login shortly...');
      
      // Clear stored auth data
      setTempAuthData(null);
      
      // Redirect to login after 5 seconds
      setTimeout(() => {
        setView('login');
        setSuccess('');
        setError('');
        setMerchantStep(1);
        setLogoFile(null);
        setBannerFile(null);
        setLogoPreview(null);
        setBannerPreview(null);
        setCreatedMerchantId(null);
      }, 5000);
    } catch (err) {
      setError(err.message || 'Failed to upload media. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ============ HELPER FUNCTIONS ============
  
  const fillDemoCredentials = (type) => {
    if (type === 'admin') {
      setEmail('admin@gmail.com');
      setPassword('Password123!');
      setLoginType('admin');
    } else {
      setEmail('lina.carson@starbucks.com');
      setPassword('StrongPass!2025');
      setLoginType('merchant');
    }
  };

  const handleRegisterInputChange = (field, value) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
  };

  const handleMerchantInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setMerchantData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setMerchantData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleBusinessHoursChange = (day, field, value) => {
    setMerchantData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: { ...prev.businessHours[day], [field]: value }
      }
    }));
  };

  const nextMerchantStep = () => {
    if (merchantStep < 3) {
      setMerchantStep(prev => prev + 1);
    } else if (merchantStep === 3) {
      handleMerchantSetup(); // Creates business and moves to step 4
    } else if (merchantStep === 4) {
      handleCompleteSetup(); // Uploads media and completes setup
    }
  };

  const prevMerchantStep = () => {
    if (merchantStep > 1) {
      setMerchantStep(prev => prev - 1);
    }
  };

  // ============ RENDER FUNCTIONS ============

  const renderLogin = () => (
    <div className="animate-scale-in">
      <div className="glass-panel p-8 lg:p-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
          <p className="text-gray-600">Choose your account type to continue</p>
        </div>

        {/* Demo Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            type="button"
            onClick={() => fillDemoCredentials('admin')}
            className={`group relative overflow-hidden p-4 rounded-2xl border-2 transition-all duration-300 ${
              loginType === 'admin'
                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg'
                : 'border-gray-200 hover:border-gray-300 bg-white/50'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-5 transition-opacity" />
            <Shield className={`w-6 h-6 mx-auto mb-2 transition-all ${
              loginType === 'admin' ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'
            }`} />
            <span className={`text-sm font-semibold block ${
              loginType === 'admin' ? 'text-blue-700' : 'text-gray-700'
            }`}>Admin Portal</span>
          </button>
          <button
            type="button"
            onClick={() => fillDemoCredentials('merchant')}
            className={`group relative overflow-hidden p-4 rounded-2xl border-2 transition-all duration-300 ${
              loginType === 'merchant'
                ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg'
                : 'border-gray-200 hover:border-gray-300 bg-white/50'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 opacity-0 group-hover:opacity-5 transition-opacity" />
            <Store className={`w-6 h-6 mx-auto mb-2 transition-all ${
              loginType === 'merchant' ? 'text-purple-600' : 'text-gray-500 group-hover:text-purple-600'
            }`} />
            <span className={`text-sm font-semibold block ${
              loginType === 'merchant' ? 'text-purple-700' : 'text-gray-700'
            }`}>Merchant Portal</span>
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Input */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-12"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-12 pr-12"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-rose-50 border-2 border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm animate-scale-in">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-emerald-50 border-2 border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm animate-scale-in">
              {success}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 text-base"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <TrendingUp className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => { setView('register'); setError(''); setSuccess(''); }}
              className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
            >
              Register here
            </button>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Demo Credentials
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-blue-100">
              <p className="font-bold text-blue-700 mb-1">👨‍💼 Admin</p>
              <p className="text-gray-600">admin@gmail.com</p>
              <p className="text-gray-600">Password123!</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-purple-100">
              <p className="font-bold text-purple-700 mb-1">🏪 Merchant</p>
              <p className="text-gray-600">lina.carson@starbucks.com</p>
              <p className="text-gray-600">StrongPass!2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRegister = () => (
    <div className="animate-scale-in">
      <div className="glass-panel p-8 lg:p-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-600">Join our loyalty platform</p>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => handleRegisterInputChange('role', 'admin')}
            className={`group relative overflow-hidden p-4 rounded-2xl border-2 transition-all duration-300 ${
              registerData.role === 'admin'
                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg'
                : 'border-gray-200 hover:border-gray-300 bg-white/50'
            }`}
          >
            <Shield className={`w-6 h-6 mx-auto mb-2 transition-all ${
              registerData.role === 'admin' ? 'text-blue-600' : 'text-gray-500'
            }`} />
            <span className={`text-sm font-semibold block ${
              registerData.role === 'admin' ? 'text-blue-700' : 'text-gray-700'
            }`}>Admin</span>
          </button>
          <button
            type="button"
            onClick={() => handleRegisterInputChange('role', 'merchant')}
            className={`group relative overflow-hidden p-4 rounded-2xl border-2 transition-all duration-300 ${
              registerData.role === 'merchant'
                ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg'
                : 'border-gray-200 hover:border-gray-300 bg-white/50'
            }`}
          >
            <Store className={`w-6 h-6 mx-auto mb-2 transition-all ${
              registerData.role === 'merchant' ? 'text-purple-600' : 'text-gray-500'
            }`} />
            <span className={`text-sm font-semibold block ${
              registerData.role === 'merchant' ? 'text-purple-700' : 'text-gray-700'
            }`}>Merchant</span>
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={registerData.firstName}
                  onChange={(e) => handleRegisterInputChange('firstName', e.target.value)}
                  className="input-field pl-12"
                  placeholder="First name"
                  required
                />
              </div>
            </div>
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={registerData.lastName}
                onChange={(e) => handleRegisterInputChange('lastName', e.target.value)}
                className="input-field"
                placeholder="Last name"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={registerData.email}
                onChange={(e) => handleRegisterInputChange('email', e.target.value)}
                className="input-field pl-12"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="tel"
                value={registerData.phoneNumber}
                onChange={(e) => handleRegisterInputChange('phoneNumber', e.target.value)}
                className="input-field pl-12"
                placeholder="+91 1234567890"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={registerData.password}
                onChange={(e) => handleRegisterInputChange('password', e.target.value)}
                className="input-field pl-12 pr-12"
                placeholder="Create a strong password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Must contain uppercase, lowercase, number and special character
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-rose-50 border-2 border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm animate-scale-in">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-emerald-50 border-2 border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm animate-scale-in">
              {success}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 text-base"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => { setView('login'); setError(''); setSuccess(''); }}
              className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );

  const renderMerchantSetup = () => (
    <div className="animate-scale-in">
      <div className="glass-panel p-8 lg:p-10 max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Business Setup</h2>
          <p className="text-gray-600">Complete your merchant profile</p>
        </div>

        {/* Progress Steps (now 4 steps) */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((step) => (
            <React.Fragment key={step}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  merchantStep >= step
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {merchantStep > step ? <CheckCircle className="w-5 h-5" /> : step}
              </div>
              {step < 4 && (
                <div
                  className={`w-12 h-1 rounded transition-all ${
                    merchantStep > step ? 'bg-purple-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-4">
          {merchantStep === 1 && (
            <>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-purple-600" />
                Business Information
              </h3>
              
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={merchantData.businessName}
                  onChange={(e) => handleMerchantInputChange('businessName', e.target.value)}
                  className="input-field"
                  placeholder="e.g., Starbucks Dubai Mall"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Type *
                  </label>
                  <input
                    type="text"
                    value={merchantData.businessType}
                    onChange={(e) => handleMerchantInputChange('businessType', e.target.value)}
                    className="input-field"
                    placeholder="e.g., Premium Coffeehouse"
                    required
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={merchantData.category}
                    onChange={(e) => handleMerchantInputChange('category', e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Cafe">Cafe</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Retail">Retail</option>
                    <option value="Grocery">Grocery</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Health & Beauty">Health & Beauty</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Services">Services</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={merchantData.email}
                    onChange={(e) => handleMerchantInputChange('email', e.target.value)}
                    className="input-field pl-12"
                    placeholder="business@email.com"
                    required
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Phone *
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={merchantData.phoneNumber}
                    onChange={(e) => handleMerchantInputChange('phoneNumber', e.target.value)}
                    className="input-field pl-12"
                    placeholder="+971 4 3600123"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {merchantStep === 2 && (
            <>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                Business Address
              </h3>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={merchantData.address.city}
                  onChange={(e) => handleMerchantInputChange('address.city', e.target.value)}
                  className="input-field"
                  placeholder="e.g., Dubai"
                  required
                />
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  State/Province *
                </label>
                <input
                  type="text"
                  value={merchantData.address.state}
                  onChange={(e) => handleMerchantInputChange('address.state', e.target.value)}
                  className="input-field"
                  placeholder="e.g., Dubai"
                  required
                />
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Country
                </label>
                <select
                  value={merchantData.address.country}
                  onChange={(e) => handleMerchantInputChange('address.country', e.target.value)}
                  className="input-field"
                >
                  <option value="India">India</option>
                  <option value="UAE">UAE</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>
            </>
          )}

          {merchantStep === 3 && (
            <>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                Business Hours & Description
              </h3>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Business Description
                </label>
                <textarea
                  value={merchantData.description}
                  onChange={(e) => handleMerchantInputChange('description', e.target.value)}
                  className="input-field min-h-[100px] resize-none"
                  placeholder="Describe your business..."
                  rows={3}
                />
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Business Hours
                </label>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                  {Object.entries(merchantData.businessHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <label className="flex items-center gap-2 w-28">
                        <input
                          type="checkbox"
                          checked={hours.isOpen}
                          onChange={(e) => handleBusinessHoursChange(day, 'isOpen', e.target.checked)}
                          className="w-4 h-4 text-purple-600 rounded"
                        />
                        <span className="text-sm font-medium capitalize">{day}</span>
                      </label>
                      {hours.isOpen && (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="time"
                            value={hours.open}
                            onChange={(e) => handleBusinessHoursChange(day, 'open', e.target.value)}
                            className="input-field py-1 px-2 text-sm"
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="time"
                            value={hours.close}
                            onChange={(e) => handleBusinessHoursChange(day, 'close', e.target.value)}
                            className="input-field py-1 px-2 text-sm"
                          />
                        </div>
                      )}
                      {!hours.isOpen && (
                        <span className="text-sm text-gray-400 italic">Closed</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Step 4 - Logo & Banner Upload */}
          {merchantStep === 4 && (
            <>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Image className="w-5 h-5 text-purple-600" />
                Logo & Banner
              </h3>

              {/* Logo Upload */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Logo * (Required)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gradient-to-br from-gray-50 to-gray-100 hover:border-purple-400 transition-colors">
                    {logoPreview ? (
                      <div className="relative inline-block">
                        <img 
                          src={logoPreview} 
                          alt="Logo Preview" 
                          className="w-32 h-32 object-cover mx-auto rounded-xl mb-4 shadow-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setLogoFile(null);
                            setLogoPreview(null);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 mx-auto rounded-xl mb-4 bg-gray-200 flex items-center justify-center">
                        <Image className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoSelect}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      {logoFile ? 'Change Logo' : 'Upload Logo'}
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Square format (500x500px recommended), Max 5MB
                    </p>
                  </div>
                </div>

                {/* Banner Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Banner * (Required)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gradient-to-br from-gray-50 to-gray-100 hover:border-purple-400 transition-colors">
                    {bannerPreview ? (
                      <div className="relative inline-block w-full">
                        <img 
                          src={bannerPreview} 
                          alt="Banner Preview" 
                          className="w-full h-40 object-cover rounded-xl mb-4 shadow-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setBannerFile(null);
                            setBannerPreview(null);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-40 mx-auto rounded-xl mb-4 bg-gray-200 flex items-center justify-center">
                        <Image className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerSelect}
                      className="hidden"
                      id="banner-upload"
                    />
                    <label
                      htmlFor="banner-upload"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      {bannerFile ? 'Change Banner' : 'Upload Banner'}
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Landscape format (1920x600px recommended), Max 10MB
                    </p>
                  </div>
                </div>

                {/* Image Guidelines */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-blue-900 mb-2">Image Guidelines</p>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Logo: Use your official business logo (square format preferred)</li>
                        <li>• Banner: Choose an image that represents your brand (landscape format)</li>
                        <li>• Both images are required to complete setup</li>
                        <li>• Images must be clear and professional</li>
                        <li>• Ensure images comply with content guidelines</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-rose-50 border-2 border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm animate-scale-in">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mt-4 bg-emerald-50 border-2 border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm animate-scale-in flex items-start gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-6">
          {merchantStep > 1 && merchantStep < 4 && (
            <button
              type="button"
              onClick={prevMerchantStep}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
          <button
            type="button"
            onClick={nextMerchantStep}
            disabled={loading || (merchantStep === 4 && (!logoFile || !bannerFile))}
            className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{merchantStep === 4 ? 'Completing...' : 'Setting up...'}</span>
              </>
            ) : merchantStep === 4 ? (
              <>
                <span>Complete Setup</span>
                <CheckCircle className="w-4 h-4" />
              </>
            ) : merchantStep === 3 ? (
              <>
                <span>Continue to Media</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Note about review */}
        <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-xs text-amber-700">
            <strong>Note:</strong> After completing setup, your business will be under review by our admin team. 
            You will receive a notification once your account is approved. This usually takes 24-48 hours.
          </p>
        </div>
      </div>
    </div>
  );

  // ============ MAIN RENDER ============

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Branding */}
          <div className="hidden lg:block animate-fade-in">
            <div className="glass-panel p-12">
              <div className="mb-8">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6 shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                  <span className="text-white font-semibold">Premium Loyalty System</span>
                </div>
                <h1 className="text-5xl font-bold mb-4 gradient-text">
                  {view === 'login' ? 'Welcome Back' : view === 'register' ? 'Join Us Today' : 'Setup Your Business'}
                </h1>
                <p className="text-xl text-gray-600">
                  {view === 'login' 
                    ? 'Manage your loyalty program with our advanced platform'
                    : view === 'register'
                    ? 'Create your account and start growing your business'
                    : 'Complete your business profile to get started'
                  }
                </p>
              </div>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 hover-lift">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1 text-gray-900">For Merchants</h3>
                    <p className="text-gray-600 text-sm">
                      Reward customers, track sales, and boost engagement with powerful analytics
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 hover-lift">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1 text-gray-900">For Administrators</h3>
                    <p className="text-gray-600 text-sm">
                      Oversee operations, manage merchants, and analyze platform performance
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8 pt-8 border-t border-gray-200/60">
                <div className="text-center">
                  <p className="text-3xl font-bold gradient-text">1K+</p>
                  <p className="text-sm text-gray-600">Active Merchants</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold gradient-text">50K+</p>
                  <p className="text-sm text-gray-600">Happy Customers</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold gradient-text">99.9%</p>
                  <p className="text-sm text-gray-600">Uptime</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Forms */}
          {view === 'login' && renderLogin()}
          {view === 'register' && renderRegister()}
          {view === 'merchant-setup' && renderMerchantSetup()}
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
        }
        .gradient-text {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .input-field {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 15px;
          transition: all 0.2s ease;
          background: white;
        }
        .input-field:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
        .btn-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          color: white;
          padding: 14px 24px;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
        }
        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .hover-lift {
          transition: transform 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-4px);
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default LoginModern;