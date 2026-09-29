import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/navbar';
import HeroSearch from './components/HeroSearch';
import Philosophy from './components/Philosophy';
import InteriorShowcase from './components/InteriorShowcase';
import PropertyGrid from './components/PropertyGrid';
import ProjectSpotlight from './components/ProjectSpotlight';
import AdminPropertyListings from './components/AdminPropertyListings';
import LoginModal from './components/LoginModal';
import ProfileDrawer from './components/ProfileDrawer';
import InquiriesView from './components/InquiriesView';
import AddPropertyModal from './components/AddPropertyModal';
import ContactSection from './components/ContactSection';
import './App.css';

function App() {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Active view: 'home' | 'admin-properties'
  const [currentView, setCurrentView] = useState('home');

  // Spotlight active property state
  const [activeSpotlightId, setActiveSpotlightId] = useState(null);

  // Auth States
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  // Admin Add Property Modal State
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);

  // Profile Drawer State & Synced Inquiries
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isInquiriesViewOpen, setIsInquiriesViewOpen] = useState(false);
  const [userInquiries, setUserInquiries] = useState([]);

  // Details Modal States
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Enquiry Flow States
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [enquiryStatus, setEnquiryStatus] = useState({ loading: false, success: '', error: '' });

  // Logout Handler
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setUserInquiries([]);
    setIsProfileOpen(false);
    setIsInquiriesViewOpen(false);
    setIsAddPropertyOpen(false);
    setCurrentView('home');
  }, []);

  // 1. Fetch Logged-in User Profile using JWT Token
  const fetchUserProfile = useCallback(async (token, signal) => {
    if (!token) return;
    try {
      const res = await fetch('http://192.168.1.6:5000/profile', {
        method: 'GET',
        signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }

      if (!res.ok) return;

      const data = await res.json();
      const userEmail = data.Email || data.email || '';
      const rawName = data.name || (userEmail ? userEmail.split('@')[0].replace(/[._0-9]/g, ' ').trim() : 'User');
      const dynamicName = rawName 
        ? rawName.charAt(0).toUpperCase() + rawName.slice(1) 
        : 'Client';

      const userObject = {
        id: data.UserID || data.id,
        email: userEmail,
        name: dynamicName,
        role: data.Role || data.role || 'Client'
      };

      setCurrentUser(userObject);
      localStorage.setItem('user', JSON.stringify(userObject));
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Network error fetching profile:', err);
      }
    }
  }, [handleLogout]);

  // 2. Fetch User Inquiries from Backend (Synced with Admin Reply & Location)
  const fetchUserInquiries = useCallback(async (token, signal) => {
    const activeToken = token || localStorage.getItem('token');
    if (!activeToken) {
      setUserInquiries([]);
      return;
    }
    try {
      const res = await fetch('http://192.168.1.6:5000/enquiries', {
        method: 'GET',
        signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        const formatted = (Array.isArray(data) ? data : []).map(item => ({
          enquiryId: item.EnquiryID,
          propertyTitle: item.PropertyTitle || 'Architectural Residence',
          propertyLocation: item.PropertyLocation || '',
          date: item.EnquiryDate || 'Recent',
          message: item.Message || item.message || '',
          adminReply: item.AdminReply || null
        }));
        setUserInquiries(formatted);
      } else {
        setUserInquiries([]);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error loading enquiries:', err);
        setUserInquiries([]);
      }
    }
  }, []);

  // 3. User session reactive hook
  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem('token');

    if (token && currentUser) {
      fetchUserInquiries(token, controller.signal);
    } else if (!token) {
      setUserInquiries([]);
    }

    return () => controller.abort();
  }, [currentUser?.id, fetchUserInquiries]);

  // 4. Initial Auth token verification
  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile(token, controller.signal);
    }
    return () => controller.abort();
  }, [fetchUserProfile]);

  // 5. Fetch Properties from GET /properties
  const loadProperties = useCallback((signal) => {
    setLoading(true);
    setApiError(null);

    fetch('http://192.168.1.6:5000/properties', { signal })
      .then((res) => {
        if (!res.ok) throw new Error('Could not load properties from server.');
        return res.json();
      })
      .then((data) => {
        const propList = Array.isArray(data) ? data : data.properties || [];
        setProperties(propList);
        setFilteredProperties(propList);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Error fetching properties:', err);
          setApiError('Unable to fetch featured residences. Please ensure the backend is running.');
          setLoading(false);
        }
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadProperties(controller.signal);
    return () => controller.abort();
  }, [loadProperties]);

  // SMART HERO SEARCH FILTER
  const handleSearch = () => {
    const rawTerm = searchTerm.trim().toLowerCase();
    
    if (!rawTerm) {
      setFilteredProperties(properties);
      return;
    }

    const bhkNumberMatch = rawTerm.match(/\b([1-9])\s*(?:bhk|bedroom|bed)?\b/i);
    const extractedBhk = bhkNumberMatch ? bhkNumberMatch[1] : null;

    const filtered = properties.filter((p) => {
      const title = (p.Title || '').toLowerCase();
      const loc = (p.Location || '').toLowerCase();
      const type = (p.PropertyType || '').toLowerCase();
      const desc = (p.Description || '').toLowerCase();
      const priceStr = (p.Price !== undefined && p.Price !== null) ? String(p.Price).toLowerCase() : '';
      const bhkVal = (p.BHK !== undefined && p.BHK !== null) ? String(p.BHK).trim() : '';

      const matchesText = 
        title.includes(rawTerm) ||
        loc.includes(rawTerm) ||
        type.includes(rawTerm) ||
        desc.includes(rawTerm) ||
        priceStr.includes(rawTerm);

      const matchesBhk = extractedBhk 
        ? bhkVal === extractedBhk 
        : bhkVal === rawTerm || `${bhkVal} bhk`.includes(rawTerm);

      return matchesText || matchesBhk;
    });

    setFilteredProperties(filtered);

    setTimeout(() => {
      const target = document.getElementById('properties') || document.getElementById('listings');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (value.trim() === '') {
      setFilteredProperties(properties);
    }
  };

  // Open Property Details on Click
  const handlePropertyClick = async (propertyId) => {
    if (!propertyId && propertyId !== 0) return;

    const matched = properties.find(
      (p) => String(p.PropertyID || p.id || p.property_id) === String(propertyId)
    );

    if (matched) {
      setSelectedProperty(matched);
    } else {
      setDetailsLoading(true);
    }

    setShowEnquiryForm(false);
    setEnquiryMessage('');
    setEnquiryStatus({ loading: false, success: '', error: '' });

    try {
      const res = await fetch(`http://192.168.1.6:5000/properties/${propertyId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedProperty(data.property || data);
      }
    } catch (err) {
      console.warn("Using local listing data:", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Submit Enquiry with immediate state synchronization
  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      setEnquiryStatus({ loading: false, success: '', error: 'Please login to submit an enquiry.' });
      setIsLoginOpen(true);
      return;
    }

    setEnquiryStatus({ loading: true, success: '', error: '' });
    const propertyId = selectedProperty?.PropertyID ?? selectedProperty?.id;

    const payload = {
      PropertyID: parseInt(propertyId, 10),
      Message: enquiryMessage.trim(),
    };

    try {
      const res = await fetch('http://192.168.1.6:5000/enquiries', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const resData = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401) {
          handleLogout();
          setIsLoginOpen(true);
          throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error(resData.message || 'Could not submit enquiry. Please try again.');
      }

      await fetchUserInquiries(token);
      setEnquiryStatus({
        loading: false,
        success: 'Enquiry submitted successfully!',
        error: '',
      });
      setEnquiryMessage('');
    } catch (err) {
      setEnquiryStatus({
        loading: false,
        success: '',
        error: err.message || 'Something went wrong.',
      });
    }
  };

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

  // Role validation
  const userRole = (currentUser?.role || currentUser?.Role || '').toString().toLowerCase().trim();
  const isAdmin = userRole === 'admin';

  // State Navigation Switcher
  const handleNavigate = (view) => {
    if (view === 'admin-properties' && !isAdmin) {
      setCurrentView('home');
      return;
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="homespot-app">
      {/* Navigation */}
      <Navbar
        currentUser={currentUser}
        onLoginClick={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onProfileClick={() => {
          const token = localStorage.getItem('token');
          if (token) fetchUserInquiries(token);
          setIsProfileOpen(true);
        }}
        onAddPropertyClick={() => setIsAddPropertyOpen(true)}
        currentView={currentView}
        onNavigate={handleNavigate}
      />

      {/* VIEW 1: PUBLIC HOME VIEW */}
      {currentView === 'home' && (
        <main className="hs-home-view">
          <HeroSearch
            searchTerm={searchTerm}
            setSearchTerm={handleSearchChange}
            onSearch={handleSearch}
          />

          <Philosophy />
          <InteriorShowcase />

          {/* Public Featured Listings Grid */}
          <section id="properties">
            <PropertyGrid 
              properties={filteredProperties} 
              loading={loading}
              error={apiError}
              onPropertyClick={handlePropertyClick}
              searchTerm={searchTerm}
              onClearSearch={() => {
                setSearchTerm('');
                setFilteredProperties(properties);
              }}
            />
          </section>

          {/* Spotlight Carousel */}
          <ProjectSpotlight 
            properties={properties} 
            activeSpotlightId={activeSpotlightId}
            onExploreClick={handlePropertyClick}
          />

          {/* Public Contact Section */}
          <ContactSection />
        </main>
      )}

      {/* VIEW 2: SEPARATE ADMIN PROPERTY MANAGEMENT SCREEN */}
      {currentView === 'admin-properties' && isAdmin && (
        <main className="hs-admin-view" style={{ paddingTop: '100px', minHeight: '85vh' }}>
          <AdminPropertyListings
            properties={properties}
            loading={loading}
            error={apiError}
            onAddPropertyClick={() => setIsAddPropertyOpen(true)}
            onViewProperty={handlePropertyClick}
            onRefresh={() => loadProperties()}
          />
        </main>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={(userData, token) => {
          setIsLoginOpen(false);
          if (userData) {
            setCurrentUser(userData);
          }
          const activeToken = token || localStorage.getItem('token');
          if (activeToken) {
            fetchUserProfile(activeToken);
            fetchUserInquiries(activeToken);
          }
        }}
      />

      {/* Admin Add Property Modal */}
      <AddPropertyModal
        isOpen={isAddPropertyOpen}
        onClose={() => setIsAddPropertyOpen(false)}
        currentUser={currentUser}
        onPropertyAdded={() => loadProperties()}
      />

      {/* Profile Drawer */}
      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
        inquiries={userInquiries}
        onRefreshInquiries={() => {
          const token = localStorage.getItem('token');
          if (token) fetchUserInquiries(token);
        }}
        onOpenFullInquiries={() => {
          setIsProfileOpen(false);
          setIsInquiriesViewOpen(true);
        }}
      />

      {/* Full Inquiries View */}
      <InquiriesView
        isOpen={isInquiriesViewOpen}
        onClose={() => setIsInquiriesViewOpen(false)}
        inquiries={userInquiries}
      />

      {/* Property Details Modal */}
      {(selectedProperty || detailsLoading) && (
        <div className="hs-modal-backdrop" onClick={() => setSelectedProperty(null)}>
          <div className="hs-details-card" onClick={(e) => e.stopPropagation()}>
            <button 
              type="button" 
              className="hs-modal-close" 
              onClick={() => setSelectedProperty(null)}
              aria-label="Close details"
            >
              ✕
            </button>

            {detailsLoading ? (
              <div className="hs-status-text">Loading architectural details...</div>
            ) : selectedProperty && (
              <div className="hs-details-content">
                <div className="hs-details-media">
                  <img
                    src={
                      selectedProperty.Image && selectedProperty.Image.startsWith('http')
                        ? selectedProperty.Image
                        : selectedProperty.Image
                        ? `http://192.168.1.6:5000/${selectedProperty.Image.replace(/^\/+/, '')}`
                        : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
                    }
                    alt={selectedProperty.Title || 'Property Residence'}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80';
                    }}
                  />
                  <span className="type-pill">
                    {selectedProperty.PropertyType || 'Residence'}
                  </span>
                </div>

                <div className="hs-details-body">
                  {!showEnquiryForm ? (
                    <>
                      <span className="sub-tag">Architectural Residence</span>
                      <h2 className="hs-details-title">{selectedProperty.Title}</h2>
                      <p className="hs-details-loc">📍 {selectedProperty.Location}</p>

                      <div className="hs-details-meta">
                        <div className="hs-meta-box">
                          <span>Bedrooms</span>
                          <strong>{selectedProperty.BHK} BHK</strong>
                        </div>
                        <div className="hs-meta-box">
                          <span>Investment</span>
                          <strong>{formatPrice(selectedProperty.Price)}</strong>
                        </div>
                        {selectedProperty.Area && (
                          <div className="hs-meta-box">
                            <span>Area</span>
                            <strong>{selectedProperty.Area} sq ft</strong>
                          </div>
                        )}
                      </div>

                      <div className="hs-details-desc">
                        <h4>Description</h4>
                        <p>{selectedProperty.Description}</p>
                      </div>

                      <button 
                        type="button" 
                        className="hs-solid-pill-btn hs-w-full"
                        onClick={() => {
                          const token = localStorage.getItem('token');
                          if (!token) {
                            setIsLoginOpen(true);
                          } else {
                            setShowEnquiryForm(true);
                          }
                        }}
                      >
                        Contact Owner / Inquire
                      </button>
                    </>
                  ) : (
                    <form className="hs-enquiry-form" onSubmit={handleEnquirySubmit}>
                      <h4 className="hs-enquiry-heading">Direct Developer Enquiry</h4>
                      <div className="hs-enquiry-property-preview">
                        <p className="hs-enquiry-desc-snippet">{selectedProperty.Description}</p>
                      </div>

                      {enquiryStatus.success && <div className="hs-enquiry-success">{enquiryStatus.success}</div>}
                      {enquiryStatus.error && <div className="hs-enquiry-error">{enquiryStatus.error}</div>}

                      <div className="hs-input-group">
                        <label>Message</label>
                        <textarea
                          rows="4"
                          placeholder="Write your enquiry message here..."
                          value={enquiryMessage}
                          onChange={(e) => setEnquiryMessage(e.target.value)}
                          required
                        />
                      </div>

                      <div className="hs-enquiry-actions">
                        <button
                          type="submit"
                          className="hs-solid-pill-btn"
                          disabled={enquiryStatus.loading}
                        >
                          {enquiryStatus.loading ? 'Submitting...' : 'Submit Request'}
                        </button>
                        <button
                          type="button"
                          className="hs-cancel-btn"
                          onClick={() => {
                            setShowEnquiryForm(false);
                            setEnquiryStatus({ loading: false, success: '', error: '' });
                          }}
                        >
                          Back to Details
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;