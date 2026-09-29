import React, { useState, useMemo } from 'react';
import './AdminPropertyListings.css';

export default function AdminPropertyListings({
  properties = [],
  loading = false,
  error = null,
  onAddPropertyClick,
  onViewProperty,
  onRefresh,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Edit Modal State
  const [editingProperty, setEditingProperty] = useState(null);

  const [editFormData, setEditFormData] = useState({
    Title: '',
    Location: '',
    Price: '',
    BHK: '',
    PropertyType: '',
    Image: '',
    Description: '',
    OwnerID: '',
  });

  const [updateLoading, setUpdateLoading] = useState(false);

  const [toastMessage, setToastMessage] = useState({
    type: '',
    text: '',
  });

  // Delete Dialog State
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Currency Formatter
  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Price on Request';
    const num = Number(price);
    if (isNaN(num)) return price;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Toast Helper
  const triggerToast = (type, text) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage({ type: '', text: '' });
    }, 3500);
  };

  // Frontend Filter
  const filteredProperties = useMemo(() => {
    return (Array.isArray(properties) ? properties : []).filter((prop) => {
      const term = searchTerm.trim().toLowerCase();
      const title = (prop.Title || prop.title || '').toLowerCase();
      const loc = (prop.Location || prop.location || '').toLowerCase();
      const type = (prop.PropertyType || prop.propertyType || '').toLowerCase();

      const matchesSearch =
        !term ||
        title.includes(term) ||
        loc.includes(term) ||
        type.includes(term);

      const matchesType =
        typeFilter === 'All' ||
        type === typeFilter.toLowerCase();

      return matchesSearch && matchesType;
    });
  }, [properties, searchTerm, typeFilter]);

  // Open Edit Form Modal with Pre-filled Data
  const handleOpenEdit = (prop) => {
    setEditingProperty(prop);

    setEditFormData({
      Title: prop.Title || prop.title || '',
      Location: prop.Location || prop.location || '',
      Price: prop.Price ?? prop.price ?? '',
      BHK: prop.BHK ?? prop.bhk ?? '',
      PropertyType: prop.PropertyType || prop.propertyType || '',
      Image: prop.Image || prop.image || '',
      Description: prop.Description || prop.description || '',
      OwnerID: prop.OwnerID ?? prop.owner_id ?? prop.UserID ?? '',
    });
  };

  // Edit Input Change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // PUT /properties/<property_id>
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const propId = editingProperty?.PropertyID ?? editingProperty?.id;

    if (!token) {
      triggerToast('error', 'Session expired. Please log in.');
      return;
    }

    if (!propId) {
      triggerToast('error', 'Property ID is missing.');
      return;
    }

    setUpdateLoading(true);

    try {
      const res = await fetch(
        `http://192.168.1.6:5000/properties/${propId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            Title: editFormData.Title,
            Location: editFormData.Location,
            Price: Number(editFormData.Price),
            BHK: Number(editFormData.BHK),
            PropertyType: editFormData.PropertyType,
            Image: editFormData.Image,
            Description: editFormData.Description,
            OwnerID: editFormData.OwnerID || undefined,
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Unable to update property.');
      }

      setEditingProperty(null);
      triggerToast('success', 'Property specifications updated successfully.');

      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      triggerToast('error', err.message || 'Failed to update property.');
    } finally {
      setUpdateLoading(false);
    }
  };

  // DELETE /properties/<property_id>
  const handleConfirmDelete = async () => {
    const token = localStorage.getItem('token');

    if (!token || !deleteTargetId) {
      return;
    }

    setDeleteLoading(true);

    try {
      const res = await fetch(
        `http://192.168.1.6:5000/properties/${deleteTargetId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Unable to delete property.');
      }

      setDeleteTargetId(null);
      triggerToast('success', 'Property permanently deleted.');

      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      triggerToast('error', err.message || 'Failed to delete property.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <section id="admin-listings" className="hs-admin-panel">
      {/* Toast Notification */}
      {toastMessage.text && (
        <div className={`hs-admin-toast ${toastMessage.type}`}>
          {toastMessage.text}
        </div>
      )}

      {/* Page Header */}
      <div className="hs-admin-head">
        <div className="hs-admin-head-left">
          <span className="hs-admin-eyebrow">PORTFOLIO CONTROL</span>
          <h2 className="hs-admin-title">PROPERTY MANAGEMENT</h2>
          <p className="hs-admin-subtitle">Manage all properties listed on HomeSpot</p>
        </div>

        <button
          type="button"
          className="hs-admin-pill-btn"
          onClick={onAddPropertyClick}
        >
          + Add Property
        </button>
      </div>

      {/* Summary / Filter Toolbar */}
      <div className="hs-admin-toolbar">
        <div className="hs-admin-count-box">
          <span className="hs-admin-count-label">ALL PROPERTIES</span>
          <strong className="hs-admin-count-value">
            {properties.length < 10 ? `0${properties.length}` : properties.length}
          </strong>
        </div>

        <div className="hs-admin-filters">
          <div className="hs-admin-search-wrapper">
            <span className="hs-admin-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search properties by title, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="hs-admin-search-input"
            />
          </div>

          <div className="hs-admin-select-wrapper">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="hs-admin-type-select"
            >
              <option value="All">All Types</option>
              <option value="Flat">Flat</option>
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Villa">Villa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Property List Container */}
      <div className="hs-admin-table-wrapper">
        {loading ? (
          <div className="hs-admin-state-message">Loading properties...</div>
        ) : error ? (
          <div className="hs-admin-state-message hs-error-state">
            Unable to load properties. Please try again.
          </div>
        ) : properties.length === 0 ? (
          <div className="hs-admin-state-message">No properties found.</div>
        ) : filteredProperties.length === 0 ? (
          <div className="hs-admin-state-message">No matching properties found.</div>
        ) : (
          <div className="hs-admin-table-scroll">
            <div className="hs-admin-table">
              <div className="hs-table-header-row">
                <div className="hs-th col-prop">Property</div>
                <div className="hs-th col-loc">Location</div>
                <div className="hs-th col-details">Details</div>
                <div className="hs-th col-price">Price</div>
                <div className="hs-th col-actions">Actions</div>
              </div>

              <div className="hs-table-body">
                {filteredProperties.map((prop) => {
                  const propId = prop.PropertyID ?? prop.id;

                  let imgSrc =
                    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80';

                  const rawImg = prop.Image || prop.image;
                  if (rawImg && rawImg.startsWith('http')) {
                    imgSrc = rawImg;
                  } else if (rawImg) {
                    imgSrc = `http://192.168.1.6:5000/${rawImg.replace(/^\/+/, '')}`;
                  }

                  const title = prop.Title || prop.title || 'Untitled Residence';
                  const pType = prop.PropertyType || prop.propertyType || 'Residence';
                  const loc = prop.Location || prop.location || 'Location Unspecified';
                  const bhk = prop.BHK ?? prop.bhk ?? '—';
                  const price = prop.Price ?? prop.price ?? 0;

                  return (
                    <div key={propId} className="hs-table-row">
                      {/* Property */}
                      <div className="hs-td col-prop">
                        <div className="hs-thumb-box">
                          <img
                            src={imgSrc}
                            alt={title}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                        </div>
                        <div className="hs-prop-titles">
                          <span className="hs-prop-main-title">{title}</span>
                          <span className="hs-prop-sub-type">{pType}</span>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="hs-td col-loc">
                        <span className="hs-cell-value">{loc}</span>
                      </div>

                      {/* Details */}
                      <div className="hs-td col-details">
                        <span className="hs-cell-tag">{bhk} BHK</span>
                      </div>

                      {/* Price */}
                      <div className="hs-td col-price">
                        <span className="hs-price-text">{formatPrice(price)}</span>
                      </div>

                      {/* Actions */}
                      <div className="hs-td col-actions">
                        <button
                          type="button"
                          className="hs-act-btn hs-btn-view"
                          onClick={() => onViewProperty && onViewProperty(propId)}
                        >
                          View
                        </button>

                        <button
                          type="button"
                          className="hs-act-btn hs-btn-edit"
                          onClick={() => handleOpenEdit(prop)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="hs-act-btn hs-btn-delete"
                          onClick={() => setDeleteTargetId(propId)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Property Modal */}
      {editingProperty && (
        <div className="hs-modal-backdrop" onClick={() => setEditingProperty(null)}>
          <div className="hs-admin-edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hs-edit-modal-head">
              <div>
                <span className="hs-admin-eyebrow">UPDATE RECORD</span>
                <h3>Edit Property Specifications</h3>
              </div>
              <button
                type="button"
                className="hs-modal-close"
                onClick={() => setEditingProperty(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="hs-edit-form">
              <div className="hs-form-row">
                <div className="hs-input-group">
                  <label>Title</label>
                  <input
                    type="text"
                    name="Title"
                    value={editFormData.Title}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="hs-input-group">
                  <label>Location</label>
                  <input
                    type="text"
                    name="Location"
                    value={editFormData.Location}
                    onChange={handleEditChange}
                    required
                  />
                </div>
              </div>

              <div className="hs-form-row grid-3">
                <div className="hs-input-group">
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    name="Price"
                    value={editFormData.Price}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="hs-input-group">
                  <label>BHK</label>
                  <input
                    type="number"
                    name="BHK"
                    value={editFormData.BHK}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="hs-input-group">
                  <label>Property Type</label>
                  <select
                    name="PropertyType"
                    value={editFormData.PropertyType}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="">Select type</option>
                    <option value="Flat">Flat</option>
                    <option value="Apartment">Apartment</option>
                    <option value="House">House</option>
                    <option value="Villa">Villa</option>
                  </select>
                </div>
              </div>

              <div className="hs-input-group">
                <label>Image URL</label>
                <input
                  type="text"
                  name="Image"
                  placeholder="https://images.unsplash.com/..."
                  value={editFormData.Image}
                  onChange={handleEditChange}
                />
              </div>

              <div className="hs-input-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  name="Description"
                  value={editFormData.Description}
                  onChange={handleEditChange}
                />
              </div>

              <div className="hs-edit-actions">
                <button
                  type="submit"
                  className="hs-admin-pill-btn"
                  disabled={updateLoading}
                >
                  {updateLoading ? 'Saving...' : 'Save Changes'}
                </button>

                <button
                  type="button"
                  className="hs-cancel-btn"
                  onClick={() => setEditingProperty(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTargetId && (
        <div className="hs-modal-backdrop" onClick={() => setDeleteTargetId(null)}>
          <div className="hs-delete-dialog" onClick={(e) => e.stopPropagation()}>
            <span className="hs-dialog-tag">WARNING</span>
            <h4>Confirm Deletion</h4>
            <p>Are you sure you want to delete this property?</p>

            <div className="hs-dialog-actions">
              <button
                type="button"
                className="hs-delete-confirm-btn"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>

              <button
                type="button"
                className="hs-cancel-btn"
                onClick={() => setDeleteTargetId(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}