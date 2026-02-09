import React, { useState, useEffect } from 'react';
import { Image, Plus, Edit, Trash2, Eye, EyeOff, Loader2, X, Upload } from 'lucide-react';

const API_BASE_URL = 'https://ilikoapi.duckdns.org/api/v1';

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    priority: 0,
    status: 'active'
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5Mzk3MDMzNjU4NDhmY2Q0YTBhN2Q3MSIsImlhdCI6MTc2NjE3MzcwNSwiZXhwIjoxNzY2Nzc4NTA1fQ.UQLM5gtvEs9fd8K5ziIk20HOPm7A_wvzPmj2_StpqvY';
  };

  // Fetch all banners
  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/banners`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch banners');
      
      const result = await response.json();
      console.log('Banners API Response:', result); // Debug log
      
      if (result.success && result.data && Array.isArray(result.data.banners)) {
        setBanners(result.data.banners);
      } else {
        setBanners([]);
      }
    } catch (err) {
      setError(err.message);
      setBanners([]);
      console.error('Error fetching banners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Open create modal
  const openCreateModal = () => {
    setEditingBanner(null);
    setFormData({
      priority: 0,
      status: 'active'
    });
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setFormData({
      priority: banner.displayOrder || 0,
      status: banner.isActive ? 'active' : 'inactive'
    });
    setImageFile(null);
    setImagePreview(banner.image?.url || null);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingBanner(null);
    setFormData({
      priority: 0,
      status: 'active'
    });
    setImageFile(null);
    setImagePreview(null);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Create banner
  const createBanner = async () => {
    try {
      setSubmitting(true);

      const formDataToSend = new FormData();
      formDataToSend.append('displayOrder', formData.priority);
      formDataToSend.append('isActive', formData.status === 'active');
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      const response = await fetch(`${API_BASE_URL}/banners`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: formDataToSend
      });

      if (!response.ok) throw new Error('Failed to create banner');

      await fetchBanners();
      closeModal();
      alert('Banner created successfully!');
    } catch (err) {
      alert(`Error creating banner: ${err.message}`);
      console.error('Error creating banner:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Update banner
  const updateBanner = async () => {
    try {
      setSubmitting(true);

      const formDataToSend = new FormData();
      formDataToSend.append('displayOrder', formData.priority);
      formDataToSend.append('isActive', formData.status === 'active');
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      const response = await fetch(`${API_BASE_URL}/banners/${editingBanner._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: formDataToSend
      });

      if (!response.ok) throw new Error('Failed to update banner');

      await fetchBanners();
      closeModal();
      alert('Banner updated successfully!');
    } catch (err) {
      alert(`Error updating banner: ${err.message}`);
      console.error('Error updating banner:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete banner
  const deleteBanner = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/banners/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete banner');

      await fetchBanners();
      alert('Banner deleted successfully!');
    } catch (err) {
      alert(`Error deleting banner: ${err.message}`);
      console.error('Error deleting banner:', err);
    }
  };

  // Toggle banner status
  const toggleStatus = async (banner) => {
    try {
      const newStatus = !banner.isActive;
      
      const formDataToSend = new FormData();
      formDataToSend.append('isActive', newStatus);

      const response = await fetch(`${API_BASE_URL}/banners/${banner._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: formDataToSend
      });

      if (!response.ok) throw new Error('Failed to update banner status');

      await fetchBanners();
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
      console.error('Error updating status:', err);
    }
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingBanner) {
      updateBanner();
    } else {
      createBanner();
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading banners...</p>
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
            onClick={fetchBanners}
            className="mt-2 text-red-600 hover:text-red-700 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Banners</h1>
          <p className="text-gray-600 mt-1">Manage promotional banners displayed across the platform</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Banner
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Banners</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{Array.isArray(banners) ? banners.length : 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Image className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {Array.isArray(banners) ? banners.filter(b => b.isActive).length : 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Inactive</p>
              <p className="text-2xl font-bold text-gray-600 mt-1">
                {Array.isArray(banners) ? banners.filter(b => !b.isActive).length : 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <EyeOff className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Banners List */}
      <div className="space-y-4">
        {!Array.isArray(banners) || banners.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Banners Yet</h3>
            <p className="text-gray-600 mb-4">Create your first banner to get started</p>
            <button 
              onClick={openCreateModal}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Banner
            </button>
          </div>
        ) : (
          banners.map((banner) => (
            <div key={banner._id} className="card hover:shadow-md transition-all">
              <div className="grid md:grid-cols-4 gap-6">
                {/* Banner Image */}
                <div className="md:col-span-1">
                  {banner.image?.url ? (
                    <img
                      src={banner.image.url}
                      alt={banner.title}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Image className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Banner Info */}
                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      banner.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {banner.displayOrder !== undefined && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        Order: {banner.displayOrder}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                    <span>Created: {formatDate(banner.createdAt)}</span>
                    {banner.createdBy && (
                      <>
                        <span>•</span>
                        <span>By: {banner.createdBy.firstName} {banner.createdBy.lastName}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="md:col-span-1 flex md:flex-col gap-2 md:items-end">
                  <button
                    onClick={() => toggleStatus(banner)}
                    className={`btn-secondary text-sm ${
                      banner.isActive ? 'bg-green-50 text-green-700' : ''
                    }`}
                    title={banner.isActive ? 'Set Inactive' : 'Set Active'}
                  >
                    {banner.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => openEditModal(banner)}
                    className="btn-secondary text-sm"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteBanner(banner._id)}
                    className="btn-secondary text-sm text-red-600 hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">
                {editingBanner ? 'Edit Banner' : 'Create New Banner'}
              </h2>
              <button 
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Image *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Click to upload banner image</span>
                      <span className="text-xs text-gray-500 mt-1">Recommended: 800x300px</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Display Order and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="input-field w-full"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {editingBanner ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingBanner ? 'Update Banner' : 'Create Banner'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBanners;