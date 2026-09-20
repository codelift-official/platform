import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PublicThemeSelector from '../components/common/PublicThemeSelector';
import BrandVersionBadge from '../components/common/BrandVersionBadge';
import { FiLock, FiUser, FiEye, FiEyeOff, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Login.css';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Please enter both administrator username and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      await loginAdmin({ username: username.trim(), password });
      toast.success('Welcome back, Administrator!');
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      console.error('[AdminLogin] Authentication failure:', err);
      setErrorMsg(err.message || 'Invalid administrator credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex flex-column align-items-center justify-content-center p-3 position-relative"
      style={{
        backgroundColor: 'var(--bg-body, #ffffff)',
        color: 'var(--text-primary, #0f172a)',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
      }}
    >
      {/* Top Controls: Back link & Theme switcher */}
      <div className="position-absolute top-0 start-0 end-0 p-3 p-md-4 d-flex justify-content-between align-items-center" style={{ zIndex: 10 }}>
        <Link
          to="/"
          className="btn btn-sm d-inline-flex align-items-center gap-2 rounded-pill px-3 py-2 text-decoration-none shadow-sm"
          style={{
            background: 'var(--card-bg, #ffffff)',
            color: 'var(--text-secondary, #64748b)',
            border: '1px solid var(--border-color, #e2e8f0)',
            fontSize: '0.84rem',
            fontWeight: 600
          }}
        >
          <FiArrowLeft size={14} />
          <span>Home / Student Portal</span>
        </Link>

        {/* Proper Dropdown Theme selector */}
        <div className="d-flex align-items-center gap-2">
          <PublicThemeSelector />
        </div>
      </div>

      {/* Centered Login Card Container */}
      <div className="w-100 my-auto py-5" style={{ maxWidth: '460px', zIndex: 5 }}>
        {/* Login Card with Brand Header inside */}
        <div
          className="card border rounded-4 shadow-lg p-4 p-md-5"
          style={{
            background: 'color-mix(in srgb, var(--card-bg, #ffffff) 88%, transparent)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderColor: 'color-mix(in srgb, var(--bs-primary, #15803d) 25%, var(--border-color, #e2e8f0))',
            boxShadow: '0 20px 50px rgba(0,0,0,0.08)'
          }}
        >
          {/* Brand Header Inside Form */}
          <div className="text-center mb-4 d-flex flex-column align-items-center login-brand-header">
            <Link
              to="/"
              className="d-inline-flex align-items-center justify-content-center gap-2 text-decoration-none mb-1 login-brand-link"
            >
              <img
                src={`${import.meta.env.BASE_URL}brand.png`}
                alt="CodeLift"
                className="brand-logo"
                width={48}
                height={48}
                onError={(e) => {
                  if (!e.currentTarget.src.includes('logo.jpg')) {
                    e.currentTarget.src = `${import.meta.env.BASE_URL}logo.jpg?v=2`;
                  } else if (!e.currentTarget.src.includes('logo.png')) {
                    e.currentTarget.src = `${import.meta.env.BASE_URL}logo.png?v=2`;
                  } else {
                    e.currentTarget.style.display = 'none';
                  }
                }}
              />
              <span className="brand-text fw-extrabold d-flex align-items-center" style={{ fontSize: '1.75rem' }}>
                <span style={{ color: 'var(--text-primary)' }}>Code</span>
                <span className="brand-text-accent" style={{ color: 'var(--bs-primary, #15803D)' }}>Li</span>
                <span style={{ color: 'var(--text-primary)' }}>ft</span>
                <span
                  className="ms-2 badge rounded-pill"
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    background: 'color-mix(in srgb, var(--bs-primary, #15803d) 14%, transparent)',
                    color: 'var(--bs-primary, #15803d)',
                    border: '1px solid color-mix(in srgb, var(--bs-primary, #15803d) 30%, transparent)',
                    padding: '4px 8px',
                    verticalAlign: 'middle'
                  }}
                >
                  ADMIN
                </span>
              </span>
            </Link>
            <div className="login-brand-sub">Restricted Institutional Administrator Portal</div>
          </div>

          {errorMsg && (
            <div
              className="alert border-0 py-2.5 px-3 rounded-3 mb-4 small d-flex align-items-center gap-2"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                color: '#dc2626',
                border: '1px solid rgba(239, 68, 68, 0.25)'
              }}
              role="alert"
            >
              <span>⚠️</span>
              <div className="fw-medium">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Username Input */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-uppercase tracking-wider" style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.74rem' }}>
                Administrator Username
              </label>
              <div className="input-group">
                <span
                  className="input-group-text border"
                  style={{
                    backgroundColor: 'var(--bg-body, #f8fafc)',
                    borderColor: 'var(--border-color, #e2e8f0)',
                    color: 'var(--text-secondary, #64748b)'
                  }}
                >
                  <FiUser />
                </span>
                <input
                  type="text"
                  autoFocus
                  required
                  autoComplete="username"
                  className="form-control border"
                  style={{
                    backgroundColor: 'var(--card-bg, #ffffff)',
                    borderColor: 'var(--border-color, #e2e8f0)',
                    color: 'var(--text-primary, #0f172a)',
                    boxShadow: 'none',
                    padding: '0.72rem 1rem'
                  }}
                  placeholder="e.g. rishabh"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-4">
              <label className="form-label small fw-semibold text-uppercase tracking-wider" style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.74rem' }}>
                Password
              </label>
              <div className="input-group">
                <span
                  className="input-group-text border"
                  style={{
                    backgroundColor: 'var(--bg-body, #f8fafc)',
                    borderColor: 'var(--border-color, #e2e8f0)',
                    color: 'var(--text-secondary, #64748b)'
                  }}
                >
                  <FiLock />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  className="form-control border"
                  style={{
                    backgroundColor: 'var(--card-bg, #ffffff)',
                    borderColor: 'var(--border-color, #e2e8f0)',
                    color: 'var(--text-primary, #0f172a)',
                    boxShadow: 'none',
                    padding: '0.72rem 1rem'
                  }}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="input-group-text border"
                  style={{
                    backgroundColor: 'var(--bg-body, #f8fafc)',
                    borderColor: 'var(--border-color, #e2e8f0)',
                    color: 'var(--text-secondary, #64748b)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-success w-100 py-2.5 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
              style={{
                background: 'linear-gradient(135deg, var(--bs-primary, #15803d) 0%, color-mix(in srgb, var(--bs-primary, #15803d) 85%, #000) 100%)',
                borderColor: 'var(--bs-primary, #15803d)',
                color: '#ffffff',
                boxShadow: '0 4px 14px color-mix(in srgb, var(--bs-primary, #15803d) 30%, transparent)'
              }}
            >
              {isLoading ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <span>Sign In as Administrator</span>
                  <FiArrowRight />
                </>
              )}
            </button>
          </form>

          {/* Footer note & Platform Version */}
          <div className="mt-4 pt-3 border-top text-center" style={{ borderColor: 'var(--border-color, #e2e8f0)' }}>
            <div className="small mb-2" style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.74rem' }}>
              🔒 Protected by 256-bit encrypted security definer RPC
            </div>
            <BrandVersionBadge />
          </div>
        </div>
      </div>
    </div>
  );
}
