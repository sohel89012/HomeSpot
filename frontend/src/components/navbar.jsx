import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';

export default function Navbar({ 
  currentUser, 
  onLoginClick, 
  onLogout, 
  onProfileClick,
  onAddPropertyClick,
  currentView = 'home',
  onNavigate
}) {
  const [showPropDropdown, setShowPropDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobilePropAccordionOpen, setMobilePropAccordionOpen] = useState(false);

  const wrapperRef = useRef(null);

  const getDisplayName = () => {
    if (!currentUser) return '';
    if (currentUser.name) return currentUser.name.split(' ')[0];
    if (currentUser.email) return currentUser.email.split('@')[0];
    return 'User';
  };

  const isAdmin = 
    currentUser?.role?.toLowerCase() === 'admin' || 
    currentUser?.Role?.toLowerCase() === 'admin';

  // Close mobile drawer helper
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobilePropAccordionOpen(false);
  };

  // Close on outside tap or Escape key press (Active only when menu is open)
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleOutsideClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        closeMobileMenu();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeMobileMenu();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  // 1. Home / Logo click handler
  const handleHomeClick = (e) => {
    if (e) e.preventDefault();
    closeMobileMenu();
    if (onNavigate) onNavigate('home');
    if (currentView === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 2. All Properties click handler (scroll to listings)
  const handleAllPropertiesClick = () => {
    setShowPropDropdown(false);
    closeMobileMenu();
    if (currentView !== 'home' && onNavigate) {
      onNavigate('home');
      setTimeout(() => {
        const target = document.getElementById('listings') || document.getElementById('properties');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const target = document.getElementById('listings') || document.getElementById('properties');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 3. Property Management click handler (Admin only)
  const handlePropertyManagementClick = () => {
    setShowPropDropdown(false);
    closeMobileMenu();
    if (onNavigate) {
      onNavigate('admin-properties');
    }
  };

  return (
    <header className="hs-navbar-wrapper" ref={wrapperRef}>
      <nav className="hs-navbar" aria-label="Main Navigation">
        {/* Brand Logo with Image */}
        <div 
          className="hs-logo" 
          onClick={handleHomeClick}
        >
          <img 
            src="/Logo.png" 
            alt="HomeSpot Logo" 
            className="hs-logo-img" 
          />
          <span className="logo-text">HomeSpot</span>
        </div>

        {/* =========================================================
            DESKTOP NAVIGATION LINKS (Untouched original inline code)
            ========================================================= */}
        <ul className="hs-nav-links">
          <li>
            <a 
              href="#home" 
              onClick={handleHomeClick}
              className={currentView === 'home' ? 'active-nav-link' : ''}
            >
              Home
            </a>
          </li>
          
          {currentView === 'home' && (
            <li><a href="#about">About</a></li>
          )}

          {/* PROPERTIES HOVER DROPDOWN */}
          <li 
            className="hs-nav-item-dropdown"
            style={{ position: 'relative', display: 'inline-block' }}
            onMouseEnter={() => setShowPropDropdown(true)}
            onMouseLeave={() => setShowPropDropdown(false)}
          >
            <div
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                font: 'inherit',
                fontSize: '0.88rem',
                fontWeight: currentView === 'admin-properties' ? '700' : '500',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '10px 0'
              }}
            >
              <span>Properties</span>
              <span style={{ fontSize: '0.72rem' }}>▾</span>
            </div>

            {/* Dropdown Menu */}
            {showPropDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  background: '#ffffff',
                  border: '1px solid rgba(31, 30, 28, 0.12)',
                  borderRadius: '12px',
                  padding: '6px 0',
                  boxShadow: '0 10px 24px rgba(0, 0, 0, 0.1)',
                  zIndex: 250,
                  minWidth: '190px'
                }}
              >
                <button
                  type="button"
                  onClick={handleAllPropertiesClick}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    padding: '10px 16px',
                    fontSize: '0.84rem',
                    fontWeight: '500',
                    color: '#1f1e1c',
                    cursor: 'pointer',
                    transition: 'background 0.18s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f2eb')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  All Properties
                </button>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={handlePropertyManagementClick}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: currentView === 'admin-properties' ? '#f5f2eb' : 'none',
                      border: 'none',
                      padding: '10px 16px',
                      fontSize: '0.84rem',
                      fontWeight: '600',
                      color: '#1f1e1c',
                      cursor: 'pointer',
                      borderTop: '1px solid rgba(31, 30, 28, 0.08)',
                      transition: 'background 0.18s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f2eb')}
                    onMouseLeave={(e) => {
                      if (currentView !== 'admin-properties') {
                        e.currentTarget.style.background = 'none';
                      }
                    }}
                  >
                    Property Management
                  </button>
                )}
              </div>
            )}
          </li>

          {currentView === 'home' && (
            <li><a href="#contact">Contact</a></li>
          )}
        </ul>

        {/* =========================================================
            DESKTOP ACTIONS / AUTH AREA (Untouched original inline code)
            ========================================================= */}
        <div className="hs-nav-actions">
          {currentUser ? (
            <div className="hs-user-wrapper">
              {isAdmin && (
                <button
                  type="button"
                  onClick={onAddPropertyClick}
                  className="hs-add-prop-nav-btn"
                  style={{
                    background: '#1f1e1c',
                    color: '#ffffff',
                    border: '1px solid #1f1e1c',
                    borderRadius: '30px',
                    padding: '6px 14px',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ fontSize: '0.9rem', lineHeight: '1' }}>+</span>
                  <span className="hs-add-prop-nav-text">Add Property</span>
                </button>
              )}

              <button
                type="button"
                onClick={onProfileClick}
                className="hs-profile-shortcut-btn"
              >
                <span style={{ color: '#10b981', fontSize: '0.7rem' }}>●</span>
                <span>Hi, {getDisplayName()}</span>
              </button>

              <button 
                type="button" 
                className="hs-login-btn hs-signout-btn" 
                onClick={onLogout}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              type="button" 
              className="hs-login-btn" 
              onClick={onLoginClick}
            >
              Login
            </button>
          )}
        </div>

        {/* =========================================================
            MOBILE HAMBURGER TRIGGER (Visible strictly < 768px via CSS)
            ========================================================= */}
        <button
          type="button"
          className="hs-mobile-burger-btn"
          onClick={() => setMobileMenuOpen(prev => !prev)}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* =========================================================
          MOBILE EXPANDABLE MENU (Visible strictly < 768px via CSS)
          ========================================================= */}
      {mobileMenuOpen && (
        <div className="hs-mobile-nav-panel" role="dialog" aria-label="Mobile Navigation Drawer">
          <div className="hs-mobile-menu-inner">
            <a
              href="#home"
              onClick={handleHomeClick}
              className={`hs-mobile-link ${currentView === 'home' ? 'active-link' : ''}`}
            >
              Home
            </a>

            {currentView === 'home' && (
              <a
                href="#about"
                onClick={closeMobileMenu}
                className="hs-mobile-link"
              >
                About
              </a>
            )}

            {/* Mobile Accordion for Properties */}
            <div className="hs-mobile-accordion">
              <button
                type="button"
                className="hs-mobile-accordion-btn"
                onClick={() => setMobilePropAccordionOpen(prev => !prev)}
              >
                <span>Properties</span>
                <span className={`accordion-caret ${mobilePropAccordionOpen ? 'open' : ''}`}>▾</span>
              </button>

              {mobilePropAccordionOpen && (
                <div className="hs-mobile-subitems">
                  <button
                    type="button"
                    onClick={handleAllPropertiesClick}
                    className="hs-mobile-sublink"
                  >
                    All Properties
                  </button>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={handlePropertyManagementClick}
                      className={`hs-mobile-sublink ${currentView === 'admin-properties' ? 'active-link' : ''}`}
                    >
                      Property Management
                    </button>
                  )}
                </div>
              )}
            </div>

            {currentView === 'home' && (
              <a
                href="#contact"
                onClick={closeMobileMenu}
                className="hs-mobile-link"
              >
                Contact
              </a>
            )}

            <div className="hs-mobile-divider" />

            {/* User / Authentication Actions in Mobile Drawer */}
            {currentUser ? (
              <div className="hs-mobile-auth-group">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      closeMobileMenu();
                      onAddPropertyClick();
                    }}
                    className="hs-mobile-action-btn hs-m-add-btn"
                  >
                    + Add Property
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    onProfileClick();
                  }}
                  className="hs-mobile-action-btn hs-m-profile-btn"
                >
                  <span className="user-dot">●</span>
                  <span>Hi, {getDisplayName()}</span>
                </button>

                <button 
                  type="button" 
                  className="hs-mobile-action-btn hs-m-signout-btn" 
                  onClick={() => {
                    closeMobileMenu();
                    onLogout();
                  }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button 
                type="button" 
                className="hs-mobile-action-btn hs-m-login-btn" 
                onClick={() => {
                  closeMobileMenu();
                  onLoginClick();
                }}
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}