import React from 'react';
import './PropertyGrid.css';

export default function PropertyGrid({ 
  properties = [], 
  loading, 
  error, 
  onPropertyClick,
  searchTerm = '',
  onClearSearch 
}) {
  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Price on Request';
    const num = Number(price);
    if (isNaN(num)) return 'Price on Request';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const safeProperties = Array.isArray(properties) ? properties : [];

  return (
    <section className="hs-grid-section">
      {/* Clean Aligned Header */}
      <div className="hs-grid-header">
        <div className="hs-grid-header-left">
          <span className="hs-grid-eyebrow">Curated Collection</span>
          <h2 className="hs-grid-title">Featured Listings</h2>
          {searchTerm && (
            <p style={{ color: '#666', fontSize: '0.88rem', marginTop: '6px', margin: 0 }}>
              Showing results for: <strong>"{searchTerm}"</strong>
            </p>
          )}
        </div>
        <p className="hs-grid-subtitle">
          Explore architectural residences available directly via HomeSpot verified database.
        </p>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="hs-property-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div className="hs-listing-card hs-skeleton-card" key={n}>
              <div className="hs-card-media hs-skeleton-box" />
              <div className="hs-card-body">
                <div className="hs-skeleton-line hs-w-70" />
                <div className="hs-skeleton-line hs-w-40" />
                <div className="hs-listing-footer" style={{ marginTop: '12px' }}>
                  <div className="hs-skeleton-line hs-w-30" style={{ margin: 0 }} />
                  <div className="hs-skeleton-btn" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="hs-grid-state">
          {error}
        </div>
      ) : safeProperties.length === 0 ? (
        <div 
          className="hs-grid-state"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            textAlign: 'center',
            gap: '12px'
          }}
        >
          <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f1e1c', margin: 0 }}>
            No properties found for your search.
          </p>
          <p style={{ color: '#777', fontSize: '0.88rem', margin: 0 }}>
            Try searching by a different city, locality, property type, or BHK.
          </p>
          {onClearSearch && (
            <button
              type="button"
              onClick={onClearSearch}
              style={{
                marginTop: '10px',
                background: '#1f1e1c',
                color: '#ffffff',
                border: 'none',
                borderRadius: '30px',
                padding: '9px 22px',
                fontSize: '0.84rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'opacity 0.2s ease'
              }}
            >
              Show All Residences
            </button>
          )}
        </div>
      ) : (
        <div className="hs-property-grid">
          {safeProperties.map((prop, index) => {
            const propId = prop.PropertyID ?? prop.id ?? prop.property_id ?? index;
            const title = prop.Title || prop.title || 'Architectural Residence';
            const location = prop.Location || prop.location || 'Location Unspecified';
            const bhk = prop.BHK ?? prop.bhk ?? '—';
            const propertyType = prop.PropertyType || prop.propertyType || prop.property_type || 'Residence';
            const area = prop.Area || prop.area;
            const price = prop.Price ?? prop.price;

            let imgSrc =
              'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80';

            const rawImg = prop.Image || prop.image;
            if (rawImg && rawImg.startsWith('http')) {
              imgSrc = rawImg;
            } else if (rawImg) {
              imgSrc = `http://192.168.1.6:5000/${rawImg.replace(/^\/+/, '')}`;
            }

            return (
              <div 
                className="hs-listing-card" 
                key={propId}
                onClick={() => onPropertyClick && onPropertyClick(propId)}
                style={{ cursor: 'pointer' }}
              >
                <div className="hs-card-media">
                  <img
                    src={imgSrc}
                    alt={title}
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <span className="hs-type-badge">
                    {propertyType}
                  </span>
                </div>

                <div className="hs-card-body">
                  <h3 className="hs-listing-name" title={title}>{title}</h3>
                  <div className="hs-listing-specs">
                    <span>📍 {location}</span>
                    <span>•</span>
                    <span>{bhk} BHK</span>
                    {area && (
                      <>
                        <span>•</span>
                        <span>{area} sq ft</span>
                      </>
                    )}
                  </div>

                  <div className="hs-listing-footer">
                    <span className="hs-listing-price">{formatPrice(price)}</span>
                    <button 
                      type="button" 
                      className="hs-card-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPropertyClick && onPropertyClick(propId);
                      }}
                    >
                      View Residence
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}