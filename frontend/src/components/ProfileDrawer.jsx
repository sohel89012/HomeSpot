import React, { useState, useEffect, useCallback } from 'react';
import './ProfileDrawer.css';

export default function ProfileDrawer({ 
  isOpen, 
  onClose, 
  currentUser, 
  onLogout,
  inquiries = [],
  onRefreshInquiries
}) {
  const [adminEnquiries, setAdminEnquiries] = useState([]);
  const [loadingAdminEnq, setLoadingAdminEnq] = useState(false);
  const [replyInputId, setReplyInputId] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replyFeedback, setReplyFeedback] = useState({ id: null, msg: '', error: false });

  const userRole = (currentUser?.role || currentUser?.Role || '').toString().toLowerCase().trim();
  const isAdmin = userRole === 'admin';

  // Fetch admin-level customer enquiries when drawer opens for admin
  const fetchAdminCustomerEnquiries = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token || !isAdmin) return;

    setLoadingAdminEnq(true);
    try {
      const res = await fetch('http://192.168.1.6:5000/admin/enquiries', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminEnquiries(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch admin enquiries:', err);
    } finally {
      setLoadingAdminEnq(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isOpen) {
      if (isAdmin) {
        fetchAdminCustomerEnquiries();
        setReplyInputId(null);
        setReplyMessage('');
        setReplyFeedback({ id: null, msg: '', error: false });
      } else if (onRefreshInquiries) {
        onRefreshInquiries();
      }
    }
  }, [isOpen, isAdmin, fetchAdminCustomerEnquiries, onRefreshInquiries]);

  if (!isOpen) return null;

  const getInitials = () => {
    if (currentUser?.name && currentUser.name.trim()) {
      return currentUser.name
        .trim()
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
    }
    if (currentUser?.email) {
      return currentUser.email[0].toUpperCase();
    }
    return 'U';
  };

  const handleSendReply = async (enquiryId) => {
    if (!replyMessage.trim()) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    setSubmittingReply(true);
    setReplyFeedback({ id: null, msg: '', error: false });

    try {
      const res = await fetch(`http://192.168.1.6:5000/admin/enquiries/${enquiryId}/reply`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reply: replyMessage.trim() })
      });

      if (!res.ok) {
        throw new Error('Failed to submit reply.');
      }

      setAdminEnquiries((prev) =>
        prev.map((item) =>
          item.EnquiryID === enquiryId ? { ...item, AdminReply: replyMessage.trim() } : item
        )
      );

      setReplyFeedback({ id: enquiryId, msg: 'Reply sent successfully!', error: false });
      setReplyInputId(null);
      setReplyMessage('');
    } catch (err) {
      setReplyFeedback({ id: enquiryId, msg: err.message || 'Error sending reply', error: true });
    } finally {
      setSubmittingReply(false);
    }
  };

  const activeInquiryList = isAdmin ? adminEnquiries : inquiries;
  const displayCount = activeInquiryList.length;

  return (
    <div className="hs-drawer-backdrop" onClick={onClose}>
      <aside className="hs-profile-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="hs-drawer-header">
          <span className="hs-drawer-eyebrow">
            {isAdmin ? 'Administrator Console' : 'Client Profile'}
          </span>
          <button type="button" className="hs-drawer-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* User Identity Card */}
        <div className="hs-user-card">
          <div className="hs-user-avatar">{getInitials()}</div>
          <div className="hs-user-info">
            <h3 className="hs-user-name">{currentUser?.name || 'User'}</h3>
            <p className="hs-user-email">{currentUser?.email || ''}</p>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="hs-drawer-metrics">
          <div className="hs-metric-box">
            <span className="metric-num">{displayCount}</span>
            <span className="metric-lbl">
              {isAdmin ? 'Customer Enquiries' : 'Inquiries'}
            </span>
          </div>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="hs-drawer-tabs">
          <button 
            type="button" 
            className="hs-tab-btn active"
          >
            {isAdmin 
              ? `Customer Enquiries (${displayCount})` 
              : `My Inquiries (${displayCount})`}
          </button>
        </div>

        {/* Content Body */}
        <div className="hs-drawer-body">
          <div className="hs-drawer-list">
            {isAdmin ? (
              /* ADMIN CUSTOMER ENQUIRIES VIEW */
              loadingAdminEnq ? (
                <div className="hs-drawer-empty">Loading customer inquiries...</div>
              ) : adminEnquiries.length === 0 ? (
                <div className="hs-drawer-empty">No customer inquiries submitted yet.</div>
              ) : (
                adminEnquiries.map((inq) => {
                  const hasReplied = Boolean(inq.AdminReply && inq.AdminReply.trim());
                  const formattedDate = inq.EnquiryDate || 'Recent';

                  return (
                    <div 
                      className="hs-inquiry-card" 
                      key={inq.EnquiryID}
                      style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}
                    >
                      <div className="inquiry-status-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span 
                          className="inquiry-badge"
                          style={{
                            background: hasReplied ? 'rgba(16, 185, 129, 0.12)' : 'rgba(234, 179, 8, 0.15)',
                            color: hasReplied ? '#059669' : '#b45309',
                            fontWeight: '600',
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '0.75rem'
                          }}
                        >
                          {hasReplied ? 'Replied' : 'In Review'}
                        </span>
                        <span className="inquiry-date" style={{ fontSize: '0.78rem', color: '#888' }}>
                          {formattedDate}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.84rem', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '6px' }}>
                        <strong style={{ color: '#1f1e1c' }}>Customer:</strong>{' '}
                        <span>{inq.UserName || 'Customer'}</span>{' '}
                        <span style={{ color: '#666' }}>({inq.Email})</span>
                      </div>

                      <div style={{ fontSize: '0.84rem' }}>
                        <strong style={{ color: '#1f1e1c' }}>Property:</strong>{' '}
                        <span>{inq.PropertyTitle || 'Residence'}</span>
                        {inq.PropertyLocation && (
                          <div style={{ color: '#777', fontSize: '0.78rem' }}>
                            📍 {inq.PropertyLocation}
                          </div>
                        )}
                      </div>

                      <div style={{ background: '#faf9f5', padding: '10px', borderRadius: '8px', marginTop: '4px' }}>
                        <strong style={{ fontSize: '0.78rem', color: '#888', display: 'block', marginBottom: '2px' }}>
                          Customer Message:
                        </strong>
                        <p style={{ margin: 0, fontSize: '0.86rem', color: '#2c2926', fontStyle: 'italic' }}>
                          "{inq.Message}"
                        </p>
                      </div>

                      {hasReplied && (
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '8px 10px', borderRadius: '8px' }}>
                          <strong style={{ fontSize: '0.75rem', color: '#15803d', display: 'block' }}>
                            Your Reply:
                          </strong>
                          <span style={{ fontSize: '0.83rem', color: '#166534' }}>{inq.AdminReply}</span>
                        </div>
                      )}

                      {replyFeedback.id === inq.EnquiryID && (
                        <div style={{ fontSize: '0.78rem', color: replyFeedback.error ? '#dc2626' : '#16a34a' }}>
                          {replyFeedback.msg}
                        </div>
                      )}

                      <div style={{ marginTop: '6px' }}>
                        {replyInputId === inq.EnquiryID ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                            <textarea
                              rows="2"
                              placeholder="Type your response to the customer..."
                              value={replyMessage}
                              onChange={(e) => setReplyMessage(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '8px',
                                border: '1px solid #ccc',
                                fontSize: '0.82rem',
                                boxSizing: 'border-box'
                              }}
                            />
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => handleSendReply(inq.EnquiryID)}
                                disabled={submittingReply || !replyMessage.trim()}
                                style={{
                                  background: '#1f1e1c',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '20px',
                                  padding: '5px 14px',
                                  fontSize: '0.78rem',
                                  cursor: 'pointer'
                                }}
                              >
                                {submittingReply ? 'Sending...' : 'Send Reply'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyInputId(null);
                                  setReplyMessage('');
                                }}
                                style={{
                                  background: 'transparent',
                                  border: '1px solid #ddd',
                                  borderRadius: '20px',
                                  padding: '5px 12px',
                                  fontSize: '0.78rem',
                                  cursor: 'pointer'
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setReplyInputId(inq.EnquiryID);
                              setReplyMessage(inq.AdminReply || '');
                            }}
                            style={{
                              background: '#1f1e1c',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '20px',
                              padding: '5px 14px',
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              width: 'fit-content'
                            }}
                          >
                            {hasReplied ? 'Edit Reply' : 'Reply'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              /* REGULAR CLIENT MY INQUIRIES VIEW */
              inquiries.length === 0 ? (
                <div className="hs-drawer-empty">No inquiries submitted yet.</div>
              ) : (
                inquiries.map((inq, idx) => (
                  <div className="hs-inquiry-card" key={idx} style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div className="inquiry-status-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span 
                        className="inquiry-badge"
                        style={{
                          background: inq.adminReply ? 'rgba(16, 185, 129, 0.12)' : 'rgba(234, 179, 8, 0.15)',
                          color: inq.adminReply ? '#059669' : '#b45309',
                          fontWeight: '600',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '0.75rem'
                        }}
                      >
                        {inq.adminReply ? 'Replied' : 'In Review'}
                      </span>
                      <span className="inquiry-date" style={{ fontSize: '0.78rem', color: '#888' }}>
                        {inq.date || 'Recent'}
                      </span>
                    </div>

                    <h4 className="inquiry-title" style={{ margin: '2px 0', fontSize: '0.92rem', color: '#1f1e1c' }}>
                      {inq.propertyTitle || 'Residence'}
                    </h4>

                    {inq.propertyLocation && (
                      <span style={{ fontSize: '0.78rem', color: '#777' }}>📍 {inq.propertyLocation}</span>
                    )}

                    <div style={{ background: '#faf9f5', padding: '8px 10px', borderRadius: '8px', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#888', display: 'block' }}>Your Query:</span>
                      <p style={{ margin: 0, fontSize: '0.84rem', color: '#2c2926', fontStyle: 'italic' }}>
                        "{inq.message || 'Property inquiry submitted'}"
                      </p>
                    </div>

                    {inq.adminReply && (
                      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '8px 10px', borderRadius: '8px', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: '600', display: 'block' }}>
                          Response from Developer:
                        </span>
                        <p style={{ margin: 0, fontSize: '0.84rem', color: '#166534' }}>
                          {inq.adminReply}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="hs-drawer-footer">
          <button 
            type="button" 
            className="hs-drawer-signout-btn" 
            onClick={() => {
              onLogout();
              onClose();
            }}
          >
            Terminate Session (Sign Out)
          </button>
        </div>
      </aside>
    </div>
  );
}