import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import {
  FaSignInAlt,
  FaArrowLeft,
  FaEnvelope,
  FaLock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaWhatsapp,
  FaShieldAlt,
  FaPaperPlane,
  FaGraduationCap,
  FaBell
} from 'react-icons/fa';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import LoginRadar from '../components/common/LoginRadar';
import InterestFormModal from '../components/home/InterestFormModal';
import { supabase } from '../services/supabaseClient';
import { openAdminWhatsApp, buildAdminNotification } from '../services/notificationService';
import toast from 'react-hot-toast';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { loginStudent } = useAuth();
  const { students = [], createPasswordResetRequest, sendEmail } = useData();

  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Course Registration Modal State
  const [showInterestModal, setShowInterestModal] = useState(false);

  // Password Reset Modal State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [resetResult, setResetResult] = useState(null);

  const handleStudentLogin = async (e) => {
    if (e) e.preventDefault();
    if (!studentEmail.trim() || !studentPassword) {
      setErrorMsg('Please enter both your student email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const { data: adminCheck } = await supabase
        .from('users')
        .select('role')
        .eq('email', studentEmail.trim().toLowerCase())
        .maybeSingle();

      if (adminCheck && adminCheck.role === 'admin') {
        throw new Error('Admin accounts must log in via the administrator portal.');
      }

      await loginStudent({ email: studentEmail.trim(), password: studentPassword });
      toast.success('Welcome back to CodeLift! 🚀');
      navigate('/student/dashboard', { replace: true });
    } catch (err) {
      console.error('[StudentLogin] Error:', err);
      const msg = err.message?.includes('Invalid login credentials')
        ? 'Invalid email or password. Please try again or request a password reset below.'
        : err.message || 'Failed to sign in. Please verify your credentials.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenResetModal = () => {
    setResetEmail(studentEmail.trim());
    setResetDone(false);
    setResetResult(null);
    setShowResetModal(true);
  };

  const handleSubmitResetRequest = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      toast.error('Please provide your registered student email address.');
      return;
    }

    setResetLoading(true);
    try {
      const result = createPasswordResetRequest({ studentEmail: resetEmail.trim() });

      if (result.notFound) {
        toast.error('This email is not registered. Please contact admin directly on WhatsApp.');
        setResetLoading(false);
        return;
      }

      setResetResult(result);
      setResetDone(true);

      // Auto open WhatsApp to notify admin
      const waMsg = buildAdminNotification('password_reset_request', {
        ticketId: result.ticketId,
        name: result.studentName,
        email: result.studentEmail,
        phone: result.studentPhone || 'Not provided',
        reason: 'Forgot student portal password'
      });
      openAdminWhatsApp(waMsg);

      try {
        if (typeof sendEmail === 'function' && result.studentEmail) {
          sendEmail(
            'forgot_password',
            { name: result.studentName, email: result.studentEmail },
            {
              student_name: result.studentName || 'Student',
              student_email: result.studentEmail,
              ticket_id: result.ticketId
            }
          ).catch((err) => console.warn('[EmailJS] forgot_password email failed:', err));
        }
      } catch (emailErr) {
        console.warn('[EmailJS] forgot_password exception:', emailErr);
      }

      toast.success('Reset request submitted! Admin notified on WhatsApp. 🔑');
    } catch (err) {
      console.error('[ResetRequest] Error:', err);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="login-page login-page-wrapper">
      <Link to="/" className="login-back-link">
        <FaArrowLeft /> Back to Home
      </Link>

      <div className="login-grid-container">
        <div className="login-radar-col">
          <LoginRadar />
        </div>

        <div className="login-card-col">
          <div className="login-glass-card">
            <div className="login-brand-header">
              <div className="login-brand-logo">🚀 CodeLift</div>
              <div className="login-brand-sub">Student Learning Portal</div>
            </div>

            {errorMsg && (
              <div
                className="alert border-0 py-2 px-3 rounded-3 mb-3 small d-flex align-items-center gap-2"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  color: '#fca5a5',
                  border: '1px solid rgba(239, 68, 68, 0.25)'
                }}
              >
                <FaExclamationTriangle className="flex-shrink-0" />
                <div>{errorMsg}</div>
              </div>
            )}

            <form onSubmit={handleStudentLogin}>
              <div className="login-input-group">
                <label className="login-input-label">Student Email Address</label>
                <div className="login-input-wrapper">
                  <FaEnvelope className="login-input-icon" />
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck="false"
                    required
                    className="login-input"
                    placeholder="e.g. student@example.com"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="login-input-group" style={{ marginBottom: 12 }}>
                <label className="login-input-label">Password</label>
                <div className="login-input-wrapper">
                  <FaLock className="login-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    className="login-input"
                    placeholder="Enter your password"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div style={{ textAlign: 'right', marginBottom: 20 }}>
                <button
                  type="button"
                  onClick={handleOpenResetModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--bs-primary, #15803d)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    padding: '4px 0',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <FaShieldAlt size={12} />
                  <span>Forgot Password?</span>
                </button>
              </div>

              <button type="submit" disabled={isLoading} className="login-submit-btn w-100">
                {isLoading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <FaSignInAlt /> <span>Sign In to Student Portal</span>
                  </>
                )}
              </button>
            </form>

            {/* Need an Account Section */}
            <div className="login-register-card mt-4 pt-3 border-top" style={{ borderColor: 'var(--border-color)' }}>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setShowInterestModal(true)}
                  className="btn btn-outline-success w-100 py-2 d-inline-flex align-items-center justify-content-center gap-2 fw-semibold rounded-3"
                  style={{ minHeight: 42, fontSize: '0.84rem' }}
                >
                  <FaGraduationCap size={16} />
                  <span>Sign Up / Register for Cohort</span>
                </button>
              </div>

              <div className="mt-3 pt-2 text-center">
                <Link
                  to="/admin/login"
                  className="small fw-semibold text-decoration-none"
                  style={{ fontSize: '0.78rem', color: 'var(--bs-primary)' }}
                >
                  🔒 Institutional Administrator Portal →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Forgot Password Modal ─────────────────────────────────────── */}
      <Modal
        show={showResetModal}
        onHide={() => { setShowResetModal(false); setResetDone(false); }}
        centered
        dialogClassName="login-modal-dialog"
        contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
      >
        <Modal.Header
          closeButton
          style={{
            background: 'var(--card-bg, #ffffff)',
            borderColor: 'var(--border-color, #e2e8f0)',
            padding: '16px 20px'
          }}
        >
          <Modal.Title
            className="fs-5 fw-bold d-flex align-items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <FaShieldAlt className="text-warning" />
            <span>{resetDone ? 'Request Submitted!' : 'Forgot Password?'}</span>
          </Modal.Title>
        </Modal.Header>

        {!resetDone ? (
          /* ── Step 1: Confirm email & submit ── */
          <form onSubmit={handleSubmitResetRequest}>
            <Modal.Body className="p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
              <div
                className="rounded-3 p-3 mb-4 d-flex align-items-start gap-3"
                style={{
                  background: 'linear-gradient(135deg,rgba(234,179,8,.10),rgba(234,179,8,.04))',
                  border: '1px solid rgba(234,179,8,.25)'
                }}
              >
                <FaBell className="text-warning mt-1 flex-shrink-0" size={15} />
                <div style={{ color: 'var(--text-primary)' }}>
                  <div className="fw-semibold small mb-1">Simple &amp; Instant Reset</div>
                  <div className="small" style={{ color: 'var(--text-muted, #64748b)' }}>
                    Confirm your email below. Your admin will be notified instantly on WhatsApp and
                    will reset your password.
                  </div>
                </div>
              </div>

              <label className="small fw-semibold mb-1 d-block" style={{ color: 'var(--text-primary)' }}>
                Registered Student Email <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span
                  className="input-group-text"
                  style={{ background: 'var(--input-bg,#f8fafc)', borderColor: 'var(--border-color,#e2e8f0)' }}
                >
                  <FaEnvelope size={13} className="text-muted" />
                </span>
                <input
                  type="email"
                  required
                  className="form-control"
                  placeholder="your.email@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  style={{ borderColor: 'var(--border-color,#e2e8f0)', background: 'var(--input-bg,#ffffff)' }}
                />
              </div>

              <p className="mt-3 mb-0 small" style={{ color: 'var(--text-muted,#64748b)', fontSize: '0.74rem' }}>
                📱 WhatsApp will open automatically to alert your admin after you submit.
              </p>
            </Modal.Body>

            <Modal.Footer
              style={{
                background: 'var(--card-bg,#ffffff)',
                borderColor: 'var(--border-color,#e2e8f0)',
                padding: '12px 20px',
                gap: 8
              }}
            >
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowResetModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="warning"
                size="sm"
                type="submit"
                disabled={resetLoading}
                className="d-inline-flex align-items-center gap-2 fw-bold px-4"
                style={{ color: '#1a1a1a' }}
              >
                <FaPaperPlane size={12} />
                <span>{resetLoading ? 'Sending…' : 'Send Reset Request'}</span>
              </Button>
            </Modal.Footer>
          </form>
        ) : (
          /* ── Step 2: Success state ── */
          <div>
            <Modal.Body className="p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
              <div className="text-center mb-4">
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                  style={{ width: 72, height: 72, background: 'rgba(22,163,74,.12)', color: '#16a34a' }}
                >
                  <FaCheckCircle size={40} />
                </div>
                <h5 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Request Sent!
                </h5>
                <p className="text-muted small mb-0">
                  Admin notified on WhatsApp. Your password will be reset shortly.
                </p>
              </div>

              <div
                className="rounded-3 p-3 mb-3 small"
                style={{
                  background: 'linear-gradient(135deg,rgba(22,163,74,.08),rgba(22,163,74,.03))',
                  border: '1px solid rgba(22,163,74,.2)',
                  color: 'var(--text-primary)'
                }}
              >
                <div className="mb-1">
                  <span style={{ color: 'var(--text-muted,#64748b)' }}>Email: </span>
                  <strong>{resetResult?.studentEmail}</strong>
                </div>
                <div className="text-muted" style={{ fontSize: '0.74rem' }}>
                  ⏳ Check back in a few minutes after the admin confirms.
                </div>
              </div>

              <Button
                variant="success"
                className="w-100 py-2 d-inline-flex align-items-center justify-content-center gap-2 fw-bold rounded-3"
                style={{ backgroundColor: '#16a34a', borderColor: '#16a34a' }}
                onClick={() => {
                  if (resetResult) {
                    openAdminWhatsApp(
                      buildAdminNotification('password_reset_request', {
                        ticketId: resetResult.ticketId,
                        name: resetResult.studentName,
                        email: resetResult.studentEmail,
                        phone: resetResult.studentPhone || 'Not provided',
                        reason: 'Forgot student portal password'
                      })
                    );
                  }
                }}
              >
                <FaWhatsapp size={16} />
                <span>Ping Admin Again on WhatsApp</span>
              </Button>
            </Modal.Body>

            <Modal.Footer
              style={{
                background: 'var(--card-bg,#ffffff)',
                borderColor: 'var(--border-color,#e2e8f0)',
                padding: '12px 20px'
              }}
            >
              <Button
                variant="primary"
                size="sm"
                className="w-100 fw-semibold"
                onClick={() => { setShowResetModal(false); setResetDone(false); }}
              >
                Back to Login
              </Button>
            </Modal.Footer>
          </div>
        )}
      </Modal>

      {/* Course Registration / Sign Up Modal */}
      <InterestFormModal
        show={showInterestModal}
        onHide={() => setShowInterestModal(false)}
        title="🎓 Sign Up for Upcoming Cohort"
        subtitle="Fill in your details to register. Our admissions team will receive your info directly on WhatsApp."
        submitLabel="Send Details on WhatsApp"
      />
    </div>
  );
}
