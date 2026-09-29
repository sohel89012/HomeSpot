import React from 'react';
import './Philosophy.css';

export default function Philosophy() {
  const scrollToSpotlight = (e) => {
    e.preventDefault();
    const el = document.getElementById('spotlight');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section className="hs-philosophy-section" id="about">
      {/* Left Column: Stats */}
      <div className="hs-phil-stats">
        <div className="hs-stat-item">
          <h3 className="hs-stat-number">12+</h3>
          <p className="hs-stat-label">Prime Locations Covered</p>
        </div>

        <div className="hs-stat-item">
          <h3 className="hs-stat-number">100%</h3>
          <p className="hs-stat-label">Verified Architectural Listings</p>
        </div>
      </div>

      {/* Right Column: Statement */}
      <div className="hs-phil-statement">
        <h2 className="hs-statement-heading">
          EVERY HOME WE CURATE IS A DIALOGUE BETWEEN BOLD ARCHITECTURE, PRECISION AND THE PERSON WHO DARES TO OWN IT.
          DARE MORE.
        </h2>

        <p className="hs-statement-description">
          HomeSpot connects modern buyers directly with genuine properties, uncompromised structural design, and verified authenticity without third-party noise.
        </p>
      </div>

      {/* Center Action Button -> Scrolls directly to Featured Spotlight */}
      <div className="hs-phil-btn-box">
        <button
          type="button"
          onClick={scrollToSpotlight}
          className="hs-statement-btn"
          
        >
          Explore Residences
        </button>
      </div>
    </section>
  );
}