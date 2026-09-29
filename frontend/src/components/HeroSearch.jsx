import React from 'react';
import './HeroSearch.css';

export default function HeroSearch({ searchTerm, setSearchTerm, onSearch }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <section className="hs-hero-section" id="home">
      <div className="hs-hero-card">
        {/* Background Image Layer */}
        <div className="hs-hero-bg">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80"
            alt="Luxury Architectural Home"
          />
        </div>

        {/* Overlay Content */}
        <div className="hs-hero-overlay">
          {/* Big Typography Header */}
          <div className="hs-hero-top">
            <h1 className="hs-hero-title">
              ABOVE<br />THE REST
            </h1>
          </div>

          {/* Subtitle & Search Bottom Bar */}
          <div className="hs-hero-footer">
            <div className="hs-hero-tagline">
              <p>LIVE IN A HOME THAT SPEAKS FOR ITSELF BEFORE YOU EVEN OPEN THE DOOR.</p>
            </div>

            <div className="hs-search-wrapper">
              <div className="hs-hero-search-box">
                <span className="hs-search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search by city, locality, or BHK..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  type="button"
                  className="hs-hero-search-btn"
                  onClick={onSearch}
                >
                  Search
                </button>
              </div>
            </div>

            {/* Right Side Stats Badge */}
            <div className="hs-hero-badge">
              <span className="badge-count">94+</span>
              <span className="badge-text">Exclusive Residences Available</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}