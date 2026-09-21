import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import {
  FiX, FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff,
  FiCheckCircle, FiCompass
} from 'react-icons/fi';
import { FaGraduationCap, FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useData } from '../../contexts/DataContext';
import { ADMIN_WA } from '../../services/notificationService';
import './InterestFormModal.css';

const INTERESTS = [
  'Full Stack Development',
  'Data Analytics',
  'Python Programming',
  'Both (Full Stack + Data)',
  'Not Sure Yet'
];

const primaryBtnStyle = {
  borderRadius: 50,
  padding: '10px 26px',
  fontWeight: 700,
  minHeight: 46,
  background: 'var(--bs-primary, #15803d)',
  borderColor: 'var(--bs-primary, #15803d)',
  color: '#fff',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  border: '1px solid var(--bs-primary, #15803d)',
  cursor: 'pointer',
  boxShadow: '0 4px 14px rgba(21,128,61,0.3)',
  transition: 'all 0.2s ease',
  fontSize: '0.9rem'
};

const toggleBtnStyle = {
  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--text-secondary, #64748b)', padding: 4, lineHeight: 1
};

export default function StudentSignupModal({ show, onHide }) {
  const { signupStudent } = useData();

  const [step, setStep] = useState('form'); // 'form' | 'success'
  const [isLoading, setIsLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    interest: 'Full Stack Development'
  });

  const [errors, setErrors] = useState({});

  const reset = () => {
    setForm({ name: '', email: '', phone: '', password: '', confirmPassword: '', interest: 'Full Stack Development' });
    setErrors({});
    setStep('form');
    setIsLoading(false);
    setShowPwd(false);
    setShowConfirm(false);
  };

  const handleClose = () => {
    reset();
    onHide();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      errs.name = 'Please enter your full name (at least 2 characters)';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      errs.email = 'Please enter a valid email address';
    if (!form.phone.trim() || form.phone.trim().length < 8)
      errs.phone = 'Please enter a valid phone number';
    if (!form.password || form.password.length < 8)
      errs.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error('Please fix the errors before continuing.');
      return;
    }
    setIsLoading(true);
    try {
      await signupStudent({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        interest: form.interest
      });
      setStep('success');
      toast.success('Account created! Welcome to CodeLift.');
    } catch (err) {
      console.error('[StudentSignupModal] Signup error:', err);
      const msg = err.message || 'Failed to create account. Please try again.';
      if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('registered')) {
        setErrors(prev => ({ ...prev, email: msg }));
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ RENDER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      dialogClassName="interest-modal-dialog"
      contentClassName="interest-modal-content"
    >
      {step === 'form' ? (
        <>
          {/* â”€â”€ Header â”€â”€ */}
          <div className="interest-modal-header">
            <div>
              <h3 className="interest-modal-title">
                <FaGraduationCap style={{ color: 'var(--bs-primary, #15803d)', marginRight: 8 }} />
                Create Your Student Account
              </h3>
            </div>
            <button type="button" className="interest-modal-close-btn" onClick={handleClose} aria-label="Close">
              <FiX size={20} />
            </button>
          </div>

          {/* â”€â”€ Form â”€â”€ */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="interest-modal-body">

              {/* Full Name */}
              <div className="interest-form-group">
                <label className="interest-form-label">
                  <FiUser className="label-icon" /> Full Name <span className="req">*</span>
                </label>
                <input
                  type="text" name="name" autoComplete="name" disabled={isLoading}
                  className={`interest-form-input${errors.name ? ' is-invalid' : ''}`}
                  placeholder="Enter your full name"
                  value={form.name} onChange={handleChange}
                />
                {errors.name && <div className="interest-field-error">{errors.name}</div>}
              </div>

              {/* Email */}
              <div className="interest-form-group">
                <label className="interest-form-label">
                  <FiMail className="label-icon" /> Email Address <span className="req">*</span>
                </label>
                <input
                  type="email" name="email" inputMode="email" autoComplete="email" disabled={isLoading}
                  className={`interest-form-input${errors.email ? ' is-invalid' : ''}`}
                  placeholder="you@example.com"
                  value={form.email} onChange={handleChange}
                />
                {errors.email && <div className="interest-field-error">{errors.email}</div>}
              </div>

              {/* Phone */}
              <div className="interest-form-group">
                <label className="interest-form-label">
                  <FiPhone className="label-icon" /> Phone Number <span className="req">*</span>
                </label>
                <input
                  type="tel" name="phone" inputMode="tel" autoComplete="tel" disabled={isLoading}
                  className={`interest-form-input${errors.phone ? ' is-invalid' : ''}`}
                  placeholder="10-digit mobile number"
                  value={form.phone} onChange={handleChange}
                />
                {errors.phone && <div className="interest-field-error">{errors.phone}</div>}
              </div>

              {/* Course Interest */}
              <div className="interest-form-group">
                <label className="interest-form-label">
                  <FiCompass className="label-icon" /> Interested In <span className="req">*</span>
                </label>
                <select
                  name="interest"
                  className="interest-form-select"
                  value={form.interest}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  {INTERESTS.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>

              {/* Password */}
              <div className="interest-form-group">
                <label className="interest-form-label">
                  <FiLock className="label-icon" /> Choose Password <span className="req">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPwd ? 'text' : 'password'} name="password"
                    autoComplete="new-password" disabled={isLoading}
                    className={`interest-form-input${errors.password ? ' is-invalid' : ''}`}
                    placeholder="Minimum 8 characters" style={{ paddingRight: 44 }}
                    value={form.password} onChange={handleChange}
                  />
                  <button type="button" onClick={() => setShowPwd(p => !p)}
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                    style={toggleBtnStyle}
                  >
                    {showPwd ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {errors.password && <div className="interest-field-error">{errors.password}</div>}
              </div>

              {/* Confirm Password */}
              <div className="interest-form-group">
                <label className="interest-form-label">
                  <FiLock className="label-icon" /> Confirm Password <span className="req">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirm ? 'text' : 'password'} name="confirmPassword"
                    autoComplete="new-password" disabled={isLoading}
                    className={`interest-form-input${errors.confirmPassword ? ' is-invalid' : ''}`}
                    placeholder="Re-enter your password" style={{ paddingRight: 44 }}
                    value={form.confirmPassword} onChange={handleChange}
                  />
                  <button type="button" onClick={() => setShowConfirm(p => !p)}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    style={toggleBtnStyle}
                  >
                    {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && <div className="interest-field-error">{errors.confirmPassword}</div>}
              </div>



            </div>

            {/* Footer */}
            <div className="interest-modal-footer">
              <button type="button" className="interest-cancel-btn btn" onClick={handleClose} disabled={isLoading}>
                Cancel
              </button>
              <button type="submit" disabled={isLoading} style={primaryBtnStyle}>
                {isLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                      style={{ width: 16, height: 16 }}
                    />
                    Creating Account&hellip;
                  </>
                ) : (
                  <>
                    <FaGraduationCap size={15} />
                    Create My Account
                  </>
                )}
              </button>
            </div>
          </form>
        </>
      ) : (
        /* ── Success State ── */
        <>
          <div className="interest-modal-header">
            <div>
              <h3 className="interest-modal-title">Account Created</h3>
            </div>
            <button type="button" className="interest-modal-close-btn" onClick={handleClose} aria-label="Close">
              <FiX size={20} />
            </button>
          </div>

          <div className="interest-modal-body">
            <div style={{ textAlign: 'center', padding: '20px 0 16px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 68, height: 68, borderRadius: '50%',
                background: 'rgba(21,128,61,0.1)', color: '#15803d', marginBottom: 14
              }}>
                <FiCheckCircle size={38} />
              </div>
              <p style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.9rem', margin: '0 0 4px' }}>
                Welcome, <strong>{form.name.split(' ')[0]}</strong>! Your account has been created.
              </p>
              <p style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.82rem', margin: '0 0 18px' }}>
                Contact admin to get allotted to a batch and start your journey.
              </p>
              <button
                type="button"
                onClick={() => {
                  const msg = `Hi CodeLift Team! I just signed up.%0A%0AName: ${encodeURIComponent(form.name)}%0AEmail: ${encodeURIComponent(form.email)}%0AInterest: ${encodeURIComponent(form.interest)}%0A%0APlease allot me to a batch to start my journey. Thank you!`;
                  window.open(`https://wa.me/${ADMIN_WA || '919834671940'}?text=${msg}`, '_blank', 'noopener,noreferrer');
                }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 22px', borderRadius: 50,
                  background: '#25D366', border: 'none', color: '#fff',
                  fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37,211,102,0.35)', transition: 'opacity 0.2s'
                }}
              >
                <FaWhatsapp size={17} />
                Message Admin on WhatsApp
              </button>
            </div>
          </div>

          <div className="interest-modal-footer" style={{ justifyContent: 'flex-end' }}>
            <button type="button" onClick={handleClose} style={primaryBtnStyle}>
              Done
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}


