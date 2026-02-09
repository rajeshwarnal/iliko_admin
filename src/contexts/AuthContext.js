import React, { createContext, useContext, useState, useEffect } from 'react';

const API_BASE_URL = 'https://ilikoapi.duckdns.org/api/v1';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [merchant, setMerchant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data on mount
    const storedUser = localStorage.getItem('user');
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    const storedMerchant = localStorage.getItem('merchant');
    
    if (storedUser && storedAccessToken) {
      try {
        setUser(JSON.parse(storedUser));
        setTokens({
          accessToken: storedAccessToken,
          refreshToken: storedRefreshToken
        });
        if (storedMerchant) {
          setMerchant(JSON.parse(storedMerchant));
        }
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        // Clear corrupted data
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('merchant');
      }
    }
    setLoading(false);
  }, []);

  // Login with real API
  const login = async (email, password) => {
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

      const { user: userData, tokens: tokenData } = data.data;
      
      // Store auth data in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('accessToken', tokenData.accessToken);
      localStorage.setItem('refreshToken', tokenData.refreshToken);
      
      // Update state
      setUser(userData);
      setTokens(tokenData);
      
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Register with real API
  const register = async (registerData) => {
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

      return data.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  // Create merchant profile
  const createMerchant = async (merchantData) => {
    try {
      const accessToken = tokens?.accessToken || localStorage.getItem('accessToken');
      
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/merchants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(merchantData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Merchant creation failed');
      }

      // Store merchant data
      localStorage.setItem('merchant', JSON.stringify(data.data.merchant));
      setMerchant(data.data.merchant);
      
      return data.data.merchant;
    } catch (error) {
      console.error('Create merchant error:', error);
      throw error;
    }
  };

  // Refresh token
  const refreshAccessToken = async () => {
    try {
      const refreshToken = tokens?.refreshToken || localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Token refresh failed');
      }

      const newTokens = data.data.tokens;
      
      // Update stored tokens
      localStorage.setItem('accessToken', newTokens.accessToken);
      localStorage.setItem('refreshToken', newTokens.refreshToken);
      setTokens(newTokens);
      
      return newTokens;
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, logout user
      logout();
      throw error;
    }
  };

  // Logout
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('merchant');
    
    // Clear state
    setUser(null);
    setTokens(null);
    setMerchant(null);
  };

  // Get current access token
  const getAccessToken = () => {
    return tokens?.accessToken || localStorage.getItem('accessToken');
  };

  // Check if token is expired (basic check)
  const isTokenExpired = (token) => {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expiry;
    } catch {
      return true;
    }
  };

  // Update user data
  const updateUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // Update merchant data
  const updateMerchant = (merchantData) => {
    localStorage.setItem('merchant', JSON.stringify(merchantData));
    setMerchant(merchantData);
  };

  const value = {
    // State
    user,
    tokens,
    merchant,
    loading,
    
    // Computed
    isAuthenticated: !!user && !!tokens?.accessToken,
    isAdmin: user?.role === 'admin',
    isMerchant: user?.role === 'merchant',
    
    // Methods
    login,
    register,
    logout,
    createMerchant,
    refreshAccessToken,
    getAccessToken,
    isTokenExpired,
    
    // Setters (for direct updates from components)
    setUser: updateUser,
    setTokens,
    setMerchant: updateMerchant,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;