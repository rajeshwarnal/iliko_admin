import React, { useState, useEffect } from 'react';
import { Award, Plus, Edit, Trash2, TrendingUp, Users, Loader2, X, Upload } from 'lucide-react';

const API_BASE_URL = 'https://ilikoapi.duckdns.org/api/v1';

const AdminLoyaltyLevels = () => {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    minPoints: 0,
    maxPoints: '',
    color: '#000000',
    displayOrder: 0,
    benefits: ''
  });

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5Mzk3MDMzNjU4NDhmY2Q0YTBhN2Q3MSIsImlhdCI6MTc2NjE3MzcwNSwiZXhwIjoxNzY2Nzc4NTA1fQ.UQLM5gtvEs9fd8K5ziIk20HOPm7A_wvzPmj2_StpqvY';
  };

  // Fetch loyalty levels
  const fetchLevels = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/loyalty-levels`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch loyalty levels');
      
      const result = await response.json();
      console.log('Loyalty Levels API Response:', result);
      
      if (result.success && result.data && Array.isArray(result.data.levels)) {
        setLevels(result.data.levels);
      } else {
        setLevels([]);
      }
    } catch (err) {
      setError(err.message);
      setLevels([]);
      console.error('Error fetching loyalty levels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  // Handle image selection
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
    setEditingLevel(null);
    setFormData({
      name: '',
      description: '',
      minPoints: 0,
      maxPoints: '',
      color: '#000000',
      displayOrder: 0,
      benefits: ''
    });
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (level) => {
    setEditingLevel(level);
    setFormData({
      name: level.name || '',
      description: level.description || '',
      minPoints: level.minPoints || 0,
      maxPoints: level.maxPoints || '',
      color: level.color || '#000000',
      displayOrder: level.displayOrder || 0,
      benefits: Array.isArray(level.benefits) ? level.benefits.join('\n') : ''
    });
    setImageFile(null);
    setImagePreview(level.image?.url || null);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingLevel(null);
    setFormData({
      name: '',
      description: '',
      minPoints: 0,
      maxPoints: '',
      color: '#000000',
      displayOrder: 0,
      benefits: ''
    });
    setImageFile(null);
    setImagePreview(null);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Create loyalty level
  const createLevel = async () => {
    try {
      setSubmitting(true);

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      if (formData.description) formDataToSend.append('description', formData.description);
      formDataToSend.append('minPoints', formData.minPoints);
      if (formData.maxPoints) formDataToSend.append('maxPoints', formData.maxPoints);
      formDataToSend.append('color', formData.color);
      formDataToSend.append('displayOrder', formData.displayOrder);
      
      // Parse benefits from textarea (line by line)
      if (formData.benefits) {
        const benefitsArray = formData.benefits.split('\n').filter(b => b.trim());
        formDataToSend.append('benefits', JSON.stringify(benefitsArray));
      }
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      const response = await fetch(`${API_BASE_URL}/loyalty-levels`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: formDataToSend
      });

      if (!response.ok) throw new Error('Failed to create loyalty level');

      await fetchLevels();
      closeModal();
      alert('Loyalty level created successfully!');
    } catch (err) {
      alert(`Error creating loyalty level: ${err.message}`);
      console.error('Error creating loyalty level:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Update loyalty level
  const updateLevel = async () => {
    try {
      setSubmitting(true);

      // For update, use JSON if no image, FormData if image
      if (imageFile) {
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        if (formData.description) formDataToSend.append('description', formData.description);
        formDataToSend.append('minPoints', formData.minPoints);
        if (formData.maxPoints) formDataToSend.append('maxPoints', formData.maxPoints);
        formDataToSend.append('color', formData.color);
        formDataToSend.append('displayOrder', formData.displayOrder);
        
        if (formData.benefits) {
          const benefitsArray = formData.benefits.split('\n').filter(b => b.trim());
          formDataToSend.append('benefits', JSON.stringify(benefitsArray));
        }
        
        formDataToSend.append('image', imageFile);

        const response = await fetch(`${API_BASE_URL}/loyalty-levels/${editingLevel._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          },
          body: formDataToSend
        });

        if (!response.ok) throw new Error('Failed to update loyalty level');
      } else {
        // JSON update without image
        const updateData = {
          name: formData.name,
          description: formData.description,
          minPoints: parseInt(formData.minPoints),
          color: formData.color,
          displayOrder: parseInt(formData.displayOrder)
        };

        if (formData.maxPoints) {
          updateData.maxPoints = parseInt(formData.maxPoints);
        }

        if (formData.benefits) {
          const benefitsArray = formData.benefits.split('\n').filter(b => b.trim());
          updateData.benefits = benefitsArray;
        }

        const response = await fetch(`${API_BASE_URL}/loyalty-levels/${editingLevel._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });

        if (!response.ok) throw new Error('Failed to update loyalty level');
      }

      await fetchLevels();
      closeModal();
      alert('Loyalty level updated successfully!');
    } catch (err) {
      alert(`Error updating loyalty level: ${err.message}`);
      console.error('Error updating loyalty level:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete loyalty level
  const deleteLevel = async (id) => {
    if (!window.confirm('Are you sure you want to delete this loyalty level?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/loyalty-levels/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete loyalty level');

      await fetchLevels();
      alert('Loyalty level deleted successfully!');
    } catch (err) {
      alert(`Error deleting loyalty level: ${err.message}`);
      console.error('Error deleting loyalty level:', err);
    }
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      alert('Please enter a level name');
      return;
    }

    if (editingLevel) {
      updateLevel();
    } else {
      createLevel();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading loyalty levels...</p>
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
            onClick={fetchLevels}
            className="mt-2 text-red-600 hover:text-red-700 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalMembers = levels.reduce((sum, l) => sum + (l.totalCustomers || 0), 0);
  const highestTier = levels.length > 0 ? levels[levels.length - 1]?.name : 'N/A';

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Loyalty Levels</h1>
          <p className="text-gray-600 mt-1">Configure customer tiers</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Level
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Levels</p>
              <p className="text-2xl font-bold mt-1">{levels.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Members</p>
              <p className="text-2xl font-bold mt-1">{totalMembers.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Highest Tier</p>
              <p className="text-2xl font-bold mt-1">{highestTier}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Levels</p>
              <p className="text-2xl font-bold mt-1">{levels.filter(l => l.isActive).length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Levels Grid */}
      {levels.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Loyalty Levels Yet</h3>
          <p className="text-gray-600 mb-4">Create your first loyalty level to get started</p>
          <button onClick={openCreateModal} className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Level
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {levels.map(level => (
            <div 
              key={level._id} 
              className="card border-2 hover:shadow-lg transition-all" 
              style={{ borderColor: level.color + '40' }}
            >
              <div className="flex items-center gap-3 mb-4">
                {level.image?.url ? (
                  <img 
                    src={level.image.url} 
                    alt={level.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold text-white" 
                    style={{ backgroundColor: level.color }}
                  >
                    {level.name?.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold" style={{ color: level.color }}>{level.name}</h3>
                  <p className="text-xs text-gray-500">
                    {level.minPoints.toLocaleString()} - {level.maxPoints ? level.maxPoints.toLocaleString() : '∞'} pts
                  </p>
                </div>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Members</span>
                  <span className="font-bold">{(level.totalCustomers || 0).toLocaleString()}</span>
                </div>
              </div>

              {level.description && (
                <p className="text-sm text-gray-600 mb-4">{level.description}</p>
              )}

              {level.benefits && level.benefits.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold mb-2">Benefits:</p>
                  <ul className="space-y-1">
                    {level.benefits.map((benefit, i) => (
                      <li key={i} className="text-xs text-gray-600 flex gap-2">
                        <span className="text-green-500">✓</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <button 
                  onClick={() => openEditModal(level)}
                  className="flex-1 btn-secondary text-sm flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button 
                  onClick={() => deleteLevel(level._id)}
                  className="btn-secondary text-sm text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">
                {editingLevel ? 'Edit Loyalty Level' : 'Create New Loyalty Level'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Icon Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level Icon
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-24 h-24 object-cover rounded-full mx-auto"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-0 right-0 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Click to upload icon</span>
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

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  placeholder="e.g., Gold, Platinum"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  rows="2"
                  placeholder="Level description"
                />
              </div>

              {/* Points Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Points *
                  </label>
                  <input
                    type="number"
                    name="minPoints"
                    value={formData.minPoints}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Points
                  </label>
                  <input
                    type="number"
                    name="maxPoints"
                    value={formData.maxPoints}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </div>

              {/* Color and Display Order */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="input-field w-full h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    min="0"
                  />
                </div>
              </div>

              {/* Benefits */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Benefits (one per line)
                </label>
                <textarea
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  rows="4"
                  placeholder="2x points&#10;Free shipping&#10;Priority support"
                />
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
                      {editingLevel ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingLevel ? 'Update Level' : 'Create Level'
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

export default AdminLoyaltyLevels;