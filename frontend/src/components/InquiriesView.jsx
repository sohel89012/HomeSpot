import React from 'react';
import './InquiriesView.css';

export default function InquiriesView({ isOpen, onClose, inquiries = [] }) {
  if (!isOpen) return null;

  return (
    <div className="hs-modal-backdrop" onClick={onClose}>
      <div className="hs-inquiries-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="hs-inquiries-header">
          <div>
            <span className="hs-inquiries-eyebrow">Client Console</span>
            <h2 className="hs-inquiries-title">My Inquiries & Viewings</h2>
          </div>
          <button type="button" className="hs-modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Inquiries List */}
        <div className="hs-inquiries-content">
          {inquiries.length === 0 ? (
            <div className="hs-inquiries-empty">
              <span className="hs-empty-icon">⌂</span>
              <h3>No Active Inquiries</h3>
              <p>You haven't requested any property consultations or viewing appointments yet.</p>
            </div>
          ) : (
            <div className="hs-inquiries-grid">
              {inquiries.map((inq, idx) => (
                <div className="hs-inquiry-item-card" key={idx}>
                  <div className="hs-inquiry-card-header">
                    <span className="hs-inquiry-status-pill">In Review</span>
                    <span className="hs-inquiry-timestamp">{inq.date || 'Recent Request'}</span>
                  </div>

                  <h3 className="hs-inquiry-prop-name">
                    {inq.propertyTitle || 'Architectural Residence'}
                  </h3>

                  <div className="hs-inquiry-body">
                    <span className="hs-inquiry-msg-label">Requested Message / Schedule</span>
                    <p className="hs-inquiry-quote">"{inq.message || 'Private site viewing request submitted'}"</p>
                  </div>

                  <div className="hs-inquiry-footer">
                    <span className="hs-agent-tag">Desk: Senior Architect Representative</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}