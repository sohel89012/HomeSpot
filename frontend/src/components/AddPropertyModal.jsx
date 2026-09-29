import React, { useState } from 'react';
import './AddPropertyModal.css';

export default function AddPropertyModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  onPropertyAdded 
}) {
  const [formData, setFormData] = useState({
    Title: '',
    Location: '',
    Price: '',
    BHK: '',
    PropertyType: 'Apartment',
    Image: '',
    Description: ''
  });

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  // Safe Case-Insensitive Admin Gate
  const userRole = (currentUser?.role || currentUser?.Role || '').toString().toLowerCase().trim();
  const isAdmin = userRole === 'admin';

  if (!currentUser || !isAdmin) {
    return (
      <div className="hs-modal-backdrop" onClick={onClose}>
        <div className="hs-add-prop-modal" onClick={(e) => e.stopPropagation()}>
          <div className="hs-modal-header">
            <h3>Restricted Access</h3>
            <button type="button" className="hs-modal-close" onClick={onClose}>✕</button>
          </div>
          <p className="hs-form-error" style={{ margin: '20px 0' }}>
            Only an authenticated Administrator can publish new architectural listings.
          </p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Frontend Validations
    if (!formData.Title.trim()) {
      setFormError('Title is required.');
      return;
    }
    if (!formData.Location.trim()) {
      setFormError('Location is required.');
      return;
    }
    if (!formData.Price || isNaN(formData.Price) || Number(formData.Price) <= 0) {
      setFormError('Please enter a valid numeric investment price.');
      return;
    }
    if (!formData.BHK || isNaN(formData.BHK) || Number(formData.BHK) <= 0) {
      setFormError('Please enter a valid numeric BHK bedroom count.');
      return;
    }
    if (!formData.PropertyType.trim()) {
      setFormError('Property type is required.');
      return;
    }
    if (!formData.Image.trim()) {
      setFormError('Image URL is required.');
      return;
    }
    if (!formData.Description.trim()) {
      setFormError('Description is required.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setFormError('Authentication session not found. Please log in again.');
      return;
    }

    setSubmitting(true);

    const payload = {
      Title: formData.Title.trim(),
      Location: formData.Location.trim(),
      Price: Number(formData.Price),
      BHK: parseInt(formData.BHK, 10),
      PropertyType: formData.PropertyType.trim(),
      Description: formData.Description.trim(),
      Image: formData.Image.trim(),
      OwnerID: currentUser.id || currentUser.UserID
    };

    try {
      const res = await fetch('http://192.168.1.6:5000/properties', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Failed to publish property.');
      }

      setFormSuccess('Property added successfully!');
      
      // Reset form fields
      setFormData({
        Title: '',
        Location: '',
        Price: '',
        BHK: '',
        PropertyType: 'Apartment',
        Image: '',
        Description: ''
      });

      // Refresh listings
      if (onPropertyAdded) {
        onPropertyAdded();
      }

      // Smooth auto close after success feedback
      setTimeout(() => {
        setFormSuccess('');
        onClose();
      }, 1000);

    } catch (err) {
      setFormError(err.message || 'An error occurred while creating the listing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="hs-modal-backdrop" onClick={onClose}>
      <div className="hs-add-prop-modal" onClick={(e) => e.stopPropagation()}>
        <div className="hs-modal-header">
          <div>
            <span className="hs-modal-eyebrow">Admin Console</span>
            <h2 className="hs-modal-title">Add New Property</h2>
          </div>
          <button type="button" className="hs-modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {formSuccess && <div className="hs-form-success">{formSuccess}</div>}
        {formError && <div className="hs-form-error">{formError}</div>}

        <form className="hs-add-prop-form" onSubmit={handleSubmit}>
          <div className="hs-form-group">
            <label>Residence Title</label>
            <input
              type="text"
              name="Title"
              placeholder="e.g. 3 BHK Luxury Penthouse"
              value={formData.Title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="hs-form-row">
            <div className="hs-form-group">
              <label>Location</label>
              <input
                type="text"
                name="Location"
                placeholder="e.g. Mayur Vihar, Delhi"
                value={formData.Location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="hs-form-group">
              <label>Property Type</label>
              <select
                name="PropertyType"
                value={formData.PropertyType}
                onChange={handleChange}
                required
              >
                <option value="Flat">Flat</option>
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Studio Apartment">Studio Apartment</option>
                <option value="Penthouse">Penthouse</option>
              </select>
            </div>
          </div>

          <div className="hs-form-row">
            <div className="hs-form-group">
              <label>Investment Price (INR)</label>
              <input
                type="number"
                name="Price"
                placeholder="e.g. 18500000"
                value={formData.Price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="hs-form-group">
              <label>Bedrooms (BHK)</label>
              <input
                type="number"
                name="BHK"
                placeholder="e.g. 3"
                value={formData.BHK}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="hs-form-group">
            <label>Image URL</label>
            <input
              type="url"
              name="Image"
              placeholder="https://images.unsplash.com/..."
              value={formData.Image}
              onChange={handleChange}
              required
            />
          </div>

          <div className="hs-form-group">
            <label>Property Description</label>
            <textarea
              name="Description"
              rows="3"
              placeholder="Describe the architectural highlights, materials, layout, and lighting..."
              value={formData.Description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="hs-form-actions">
            <button
              type="submit"
              className="hs-solid-pill-btn"
              disabled={submitting}
            >
              {submitting ? 'Publishing Residence...' : 'Publish Property'}
            </button>
            <button
              type="button"
              className="hs-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}