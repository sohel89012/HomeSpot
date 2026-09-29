import React, { useState } from 'react';
import './ProjectSpotlight.css';

export default function ProjectSpotlight({ properties = [], onExploreClick }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!properties || properties.length === 0) {
    return null;
  }

  const current = properties[currentIndex] || properties[0];
  const targetId = current.PropertyID || current.id || current.property_id;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % properties.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? properties.length - 1 : prev - 1));
  };

  const formatIndex = (index) => {
    return index < 9 ? `0${index + 1}` : `${index + 1}`;
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Contact for Price';
    const num = Number(price);
    if (isNaN(num)) return price;
    return `₹ ${num.toLocaleString('en-IN')}`;
  };

  const handleExploreAction = () => {
    if (onExploreClick) {
      onExploreClick(targetId);
    } else {
      const target = document.getElementById('listings');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Safe image resolver: avoids requesting non-existent local files on Flask root
  const resolveSpotlightImage = (img) => {
    const fallback =
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80';

    if (!img) return fallback;

    if (img.startsWith('http://') || img.startsWith('https://')) {
      return img;
    }

    // If it's a known non-existent local filename, avoid 404 by returning safe fallback
    if (
      img.includes('apartment.jpg') ||
      img.includes('luxury-flat.jpg') ||
      !img.includes('/')
    ) {
      return fallback;
    }

    return `http://192.168.1.6:5000/${img.replace(/^\/+/, '')}`;
  };

  return (
    <section id="spotlight" className="hs-spotlight-section">
      {/* Left Column: Project Editorial Details */}
      <div className="hs-spotlight-info">
        <span className="hs-spotlight-label">Featured Spotlight</span>
        <div className="hs-spotlight-counter">{formatIndex(currentIndex)}</div>

        <h2 className="hs-spotlight-title">{current.Title}</h2>
        <p className="hs-spotlight-location">📍 {current.Location}</p>

        <p className="hs-spotlight-description">
          {current.Description ||
            "Designed with sweeping curves and earth-tone finishes that seamlessly blend into the surrounding natural topography."}
        </p>

        <div className="hs-spotlight-meta-grid">
          <div className="meta-item">
            <span className="meta-label">Configuration</span>
            <span className="meta-value">{current.BHK} BHK</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Property Type</span>
            <span className="meta-value">{current.PropertyType || 'Residence'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Price</span>
            <span className="meta-value">{formatPrice(current.Price)}</span>
          </div>
        </div>

        {/* Explore Residence Action Button */}
        <button
          type="button"
          className="hs-spotlight-cta"
          onClick={handleExploreAction}
        >
          Explore Residence
        </button>
      </div>

      {/* Right Column: Visual Stage & Carousel Arrows */}
      <div className="hs-spotlight-visual">
        <div className="hs-spotlight-frame">
          <img
            src={resolveSpotlightImage(current.Image)}
            alt={current.Title || 'Spotlight Residence'}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80';
            }}
          />
        </div>

        <div className="hs-spotlight-controls">
          <div className="hs-spotlight-indicator">
            {formatIndex(currentIndex)} / {formatIndex(properties.length - 1)}
          </div>
          <div className="hs-spotlight-arrow-group">
            <button
              type="button"
              className="hs-arrow-btn"
              onClick={handlePrev}
              aria-label="Previous property"
            >
              ←
            </button>
            <button
              type="button"
              className="hs-arrow-btn"
              onClick={handleNext}
              aria-label="Next property"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}