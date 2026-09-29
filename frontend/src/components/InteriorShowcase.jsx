import React from 'react';
import './InteriorShowcase.css';

export default function InteriorShowcase() {
  const showcaseItems = [
    {
      title: "Private Library",
      desc: "Custom walnut joinery with expansive floor-to-ceiling reading bays.",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Private Theater",
      desc: "Acoustic fabric panelling with integrated ambient warm recessed lighting.",
      image: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "The Living Room",
      desc: "Curved panoramic glass opening directly towards horizon vistas.",
      image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    
   // 👇 id="properties" yahan add karein
    <section id="properties" className="hs-showcase-section">
      <div className="hs-showcase-grid">
        {showcaseItems.map((item, idx) => (
          <div className="hs-showcase-card" key={idx}>
            <div className="hs-showcase-img-wrap">
              <img src={item.image} alt={item.title} />
            </div>
            <div className="hs-showcase-info">
              <h3 className="hs-showcase-title">{item.title}</h3>
              <p className="hs-showcase-desc">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}