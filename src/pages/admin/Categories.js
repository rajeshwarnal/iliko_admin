import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit, Trash2, Store, Loader2 } from 'lucide-react';

const API_BASE_URL = 'https://ilikoapi.duckdns.org/api/v1';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get auth token from localStorage or context
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5Mzk3MDMzNjU4NDhmY2Q0YTBhN2Q3MSIsImlhdCI6MTc2NjE3MzcwNSwiZXhwIjoxNzY2Nzc4NTA1fQ.UQLM5gtvEs9fd8K5ziIk20HOPm7A_wvzPmj2_StpqvY';
  };

  // Category color mapping
  const categoryColors = {
    'restaurant': '#ef4444',
    'cafe': '#8b5cf6',
    'retail': '#06b6d4',
    'fashion': '#ec4899',
    'electronics': '#10b981',
    'grocery': '#f59e0b',
    'pharmacy': '#14b8a6',
    'beauty-spa': '#f43f5e',
    'fitness': '#06b6d4',
    'entertainment': '#f59e0b',
    'travel': '#3b82f6',
    'education': '#8b5cf6',
    'healthcare': '#10b981',
    'automotive': '#64748b',
    'home-services': '#f97316',
    'others': '#6b7280'
  };

  // Category descriptions
  const categoryDescriptions = {
    'restaurant': 'Restaurants, dining, and food services',
    'cafe': 'Coffee shops, cafes, and tea houses',
    'retail': 'General retail stores and shopping',
    'fashion': 'Clothing, accessories, and fashion retail',
    'electronics': 'Tech stores, gadgets, and electronics',
    'grocery': 'Supermarkets and grocery stores',
    'pharmacy': 'Pharmacies and medical supplies',
    'beauty-spa': 'Beauty salons, spas, and wellness',
    'fitness': 'Gyms, fitness centers, and sports',
    'entertainment': 'Movies, gaming, and leisure activities',
    'travel': 'Travel agencies, hotels, and tourism',
    'education': 'Schools, training, and education services',
    'healthcare': 'Hospitals, clinics, and medical services',
    'automotive': 'Car services, dealers, and automotive',
    'home-services': 'Home repair, cleaning, and maintenance',
    'others': 'Other miscellaneous services'
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/merchants/categories`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch categories');
      
      const result = await response.json();
      
      if (result.success) {
        setCategories(result.data.categories);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Calculate stats
  const totalMerchants = categories.reduce((sum, cat) => sum + cat.merchantCount, 0);
  const largestCategory = categories.length > 0 
    ? categories.reduce((max, cat) => cat.merchantCount > max.merchantCount ? cat : max, categories[0])
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Error: {error}</p>
          <button 
            onClick={fetchCategories}
            className="mt-2 text-red-600 hover:text-red-700 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Merchant Categories</h1>
          <p className="text-gray-600 mt-1">Organize merchants by business type</p>
        </div>
        {/* <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Category
        </button> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Categories</p>
              <p className="text-2xl font-bold mt-1">{categories.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Tag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Merchants</p>
              <p className="text-2xl font-bold mt-1">{totalMerchants}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Largest Category</p>
              <p className="text-2xl font-bold mt-1">
                {largestCategory ? largestCategory.name : 'N/A'}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Tag className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => {
          const color = categoryColors[cat.id] || '#6b7280';
          const description = categoryDescriptions[cat.id] || 'Business category';
          
          return (
            <div 
              key={cat.id} 
              className="card hover:shadow-lg transition-all border-2" 
              style={{ borderColor: color + '30' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center text-3xl" 
                    style={{ backgroundColor: color + '20' }}
                  >
                    {cat.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{cat.name}</h3>
                    <p className="text-sm text-gray-600">{cat.merchantCount} merchants</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">{description}</p>
              {/* <div className="flex gap-2 pt-4 border-t">
                <button className="flex-1 btn-secondary text-sm flex items-center justify-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button className="btn-secondary text-sm text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div> */}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminCategories;