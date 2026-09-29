import React, { useState } from 'react';
import './LoginModal.css';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const resetFields = () => {
    setFullName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccessMsg('');
  };

  const handleToggleMode = (signUpMode) => {
    setIsSignUp(signUpMode);
    setError('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      setLoading(true);

      try {
        const response = await fetch('http://192.168.1.6:5000/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: fullName.trim(),
            Email: email.trim(),
            Password: password,
            Role: 'Client',
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || 'Registration failed. Please try again.'
          );
        }

        setSuccessMsg('Account created successfully! Please log in.');
        resetFields();
        setIsSignUp(false);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);

      try {
        const response = await fetch('http://192.168.1.6:5000/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            Email: email.trim(),
            Password: password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || 'Login failed. Please check credentials.'
          );
        }

        // 1. Save Token to localStorage immediately
        if (data.token) {
          localStorage.setItem('token', data.token);
        }

        // 2. Prepare full user object from backend response or fallback safely
        const resolvedUser = {
          id: data.user?.id || data.user?.UserID || data.UserID || null,
          name: data.user?.name || data.name || email.trim().split('@')[0],
          email: data.user?.email || data.user?.Email || email.trim(),
          role: data.user?.role || data.user?.Role || 'Client',
        };

        // 3. Save User to localStorage immediately
        localStorage.setItem('user', JSON.stringify(resolvedUser));

        // 4. Send full user object and token to App.jsx for instantaneous UI update
        if (onLoginSuccess) {
          onLoginSuccess(resolvedUser, data.token);
        }

        resetFields();
        onClose();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="hs-modal-backdrop" onClick={onClose}>
      <div
        className="hs-login-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="hs-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="hs-login-header">
          <span className="hs-login-badge">
            {isSignUp ? 'New Registration' : 'Account Access'}
          </span>

          <h2 className="hs-login-title">
            {isSignUp ? 'Create an Account' : 'Welcome to HomeSpot'}
          </h2>

          <p className="hs-login-sub">
            {isSignUp
              ? 'Join HomeSpot to browse, shortlist, and acquire residences.'
              : 'Sign in to manage residences, shortlists, and enquiries.'}
          </p>
        </div>

        {error && <div className="hs-login-error">{error}</div>}
        {successMsg && <div className="hs-login-success">{successMsg}</div>}

        <form className="hs-login-form" onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="hs-input-group">
              <label htmlFor="hs-fullname">Full Name</label>
              <input
                id="hs-fullname"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="hs-input-group">
            <label htmlFor="hs-email">Email Address</label>
            <input
              id="hs-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="hs-input-group">
            <label htmlFor="hs-password">Password</label>
            <input
              id="hs-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isSignUp && (
            <div className="hs-input-group">
              <label htmlFor="hs-confirm-password">Confirm Password</label>
              <input
                id="hs-confirm-password"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          <div className="hs-auth-btn-group">
            {!isSignUp ? (
              <>
                <button
                  type="submit"
                  className="hs-submit-login-btn hs-primary-btn"
                  disabled={loading}
                >
                  {loading ? 'Authenticating...' : 'Login'}
                </button>

                <button
                  type="button"
                  className="hs-submit-login-btn hs-secondary-btn"
                  onClick={() => handleToggleMode(true)}
                  disabled={loading}
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                <button
                  type="submit"
                  className="hs-submit-login-btn hs-primary-btn"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </button>

                <button
                  type="button"
                  className="hs-submit-login-btn hs-secondary-btn"
                  onClick={() => handleToggleMode(false)}
                  disabled={loading}
                >
                  Already have an account? Login
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}