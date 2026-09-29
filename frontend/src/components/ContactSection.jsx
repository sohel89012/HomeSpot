import React from 'react';
import './ContactSection.css';

export default function ContactSection() {
  const contactDetails = [
    {
      title: 'Direct Inquiries',
      value: 'contact@homespot.com',
      supporting: 'Mon-Sun • 9:00 AM - 8:00 PM IST',
      action: 'mailto:contact@homespot.com',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      )
    },
    {
      title: 'Private Client Desk',
      value: '+91 9315689778',
      supporting: 'Direct representative hotline',
      action: 'tel:+919315689778', // Entire card is wired to this telephone protocol
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      )
    },
    {
      title: 'Headquarters',
      value: 'Delhi, India',
      supporting: null,
      action: null,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      )
    }
  ];

  return (
    <section id="contact" className="hs-contact-section">
      <div className="hs-contact-header">
        <span className="hs-contact-eyebrow">Direct Advisory</span>
        <h2 className="hs-contact-title">Get in Touch</h2>
        <p className="hs-contact-desc">
          Have a question about a property? Reach out to the HomeSpot team.
        </p>
      </div>

      <div className="hs-contact-grid">
        {contactDetails.map((item, index) => {
          const content = (
            <>
              <div className="hs-contact-icon-box">
                {item.icon}
              </div>
              <div className="hs-contact-info">
                <span className="hs-contact-item-title">{item.title}</span>
                <span className="hs-contact-item-value">{item.value}</span>
                {item.supporting && (
                  <span className="hs-contact-item-supporting">{item.supporting}</span>
                )}
              </div>
            </>
          );

          return item.action ? (
            <a
              key={index}
              href={item.action}
              className="hs-contact-card hs-contact-card-clickable"
              aria-label={item.title}
            >
              {content}
            </a>
          ) : (
            <div key={index} className="hs-contact-card">
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}