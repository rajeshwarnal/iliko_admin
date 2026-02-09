import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit, Trash2, Eye, Save, Loader2, X, BookOpen, Shield, HelpCircle } from 'lucide-react';

const API_BASE_URL = 'https://ilikoapi.duckdns.org/api/v1';

const AdminCMSPages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    type: 'terms',
    content: '',
    metaDescription: '',
    displayOrder: 0,
    isPublished: true
  });

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5Mzk3MDMzNjU4NDhmY2Q0YTBhN2Q3MSIsImlhdCI6MTc2NjE3MzcwNSwiZXhwIjoxNzY2Nzc4NTA1fQ.UQLM5gtvEs9fd8K5ziIk20HOPm7A_wvzPmj2_StpqvY';
  };

  // Fetch CMS pages
  const fetchPages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/cms/admin/all`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch CMS pages');
      
      const result = await response.json();
      console.log('CMS Pages API Response:', result);
      
      if (result.success && result.data && Array.isArray(result.data.pages)) {
        setPages(result.data.pages);
      } else {
        setPages([]);
      }
    } catch (err) {
      setError(err.message);
      setPages([]);
      console.error('Error fetching CMS pages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  // Get type icon and color
  const getTypeInfo = (type) => {
    const types = {
      terms: { icon: FileText, color: 'blue', label: 'Terms' },
      privacy: { icon: Shield, color: 'green', label: 'Privacy' },
      rules: { icon: BookOpen, color: 'purple', label: 'Rules' },
      help: { icon: HelpCircle, color: 'orange', label: 'Help' }
    };
    return types[type] || types.terms;
  };

  // Open create modal
  const openCreateModal = () => {
    setEditingPage(null);
    setFormData({
      title: '',
      slug: '',
      type: 'terms',
      content: '',
      metaDescription: '',
      displayOrder: 0,
      isPublished: true
    });
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (page) => {
    setEditingPage(page);
    setFormData({
      title: page.title || '',
      slug: page.slug || '',
      type: page.type || 'terms',
      content: page.content || '',
      metaDescription: page.metaDescription || '',
      displayOrder: page.displayOrder || 0,
      isPublished: page.isPublished !== false
    });
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingPage(null);
    setFormData({
      title: '',
      slug: '',
      type: 'terms',
      content: '',
      metaDescription: '',
      displayOrder: 0,
      isPublished: true
    });
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-generate slug from title
    if (name === 'title' && !editingPage) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  // Create CMS page
  const createPage = async () => {
    try {
      setSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/cms`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to create page');

      await fetchPages();
      closeModal();
      alert('Page created successfully!');
    } catch (err) {
      alert(`Error creating page: ${err.message}`);
      console.error('Error creating page:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Update CMS page
  const updatePage = async () => {
    try {
      setSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/cms/${editingPage._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to update page');

      await fetchPages();
      closeModal();
      alert('Page updated successfully!');
    } catch (err) {
      alert(`Error updating page: ${err.message}`);
      console.error('Error updating page:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete CMS page
  const deletePage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this page?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cms/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete page');

      await fetchPages();
      alert('Page deleted successfully!');
    } catch (err) {
      alert(`Error deleting page: ${err.message}`);
      console.error('Error deleting page:', err);
    }
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.slug || !formData.content) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingPage) {
      updatePage();
    } else {
      createPage();
    }
  };

  // Filter pages by type
  const filteredPages = selectedType === 'all' 
    ? pages 
    : pages.filter(p => p.type === selectedType);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading CMS pages...</p>
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
            onClick={fetchPages}
            className="mt-2 text-red-600 hover:text-red-700 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const stats = {
    total: pages.length,
    terms: pages.filter(p => p.type === 'terms').length,
    privacy: pages.filter(p => p.type === 'privacy').length,
    rules: pages.filter(p => p.type === 'rules').length,
    help: pages.filter(p => p.type === 'help').length,
    published: pages.filter(p => p.isPublished).length
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">CMS Pages</h1>
          <p className="text-gray-600 mt-1">Manage content pages</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Page
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="stat-card">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold mt-1">{stats.total}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-600">Terms</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.terms}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-600">Privacy</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.privacy}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-600">Rules</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{stats.rules}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-600">Help</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{stats.help}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-600">Published</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.published}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="card">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="input-field w-full md:w-64"
        >
          <option value="all">All Types</option>
          <option value="terms">Terms & Conditions</option>
          <option value="privacy">Privacy Policy</option>
          <option value="rules">Program Rules</option>
          <option value="help">Help & Support</option>
        </select>
      </div>

      {/* Pages List */}
      {filteredPages.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Pages Yet</h3>
          <p className="text-gray-600 mb-4">Create your first CMS page</p>
          <button onClick={openCreateModal} className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Page
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPages.map((page) => {
            const typeInfo = getTypeInfo(page.type);
            const Icon = typeInfo.icon;

            return (
              <div key={page._id} className="card hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 bg-${typeInfo.color}-100 rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 text-${typeInfo.color}-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{page.title}</h3>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium bg-${typeInfo.color}-100 text-${typeInfo.color}-700`}>
                          {typeInfo.label}
                        </span>
                        {page.isPublished && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Published
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Slug: /{page.slug}</p>
                      {page.metaDescription && (
                        <p className="text-sm text-gray-500 line-clamp-2">{page.metaDescription}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                        <span>Order: {page.displayOrder}</span>
                        <span>•</span>
                        <span>Version: {page.version}</span>
                        {page.lastUpdatedBy && (
                          <>
                            <span>•</span>
                            <span>By: {page.lastUpdatedBy.firstName} {page.lastUpdatedBy.lastName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button 
                      onClick={() => openEditModal(page)}
                      className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deletePage(page._id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPage ? 'Edit Page' : 'Create New Page'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Type and Published Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    required
                  >
                    <option value="terms">Terms & Conditions</option>
                    <option value="privacy">Privacy Policy</option>
                    <option value="rules">Program Rules</option>
                    <option value="help">Help & Support</option>
                  </select>
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

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  placeholder="e.g., Terms and Conditions"
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  placeholder="e.g., terms-and-conditions"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">URL path: /{formData.slug}</p>
              </div>

              {/* Meta Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  rows="2"
                  placeholder="Brief description for SEO"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content (HTML) *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="input-field w-full font-mono text-sm"
                  rows="15"
                  placeholder="<h1>Title</h1>&#10;<p>Content here...</p>"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Use HTML tags for formatting</p>
              </div>

              {/* Published Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                  Publish this page
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t">
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
                      {editingPage ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingPage ? 'Update Page' : 'Create Page'}
                    </>
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

export default AdminCMSPages;