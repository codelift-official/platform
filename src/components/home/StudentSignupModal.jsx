import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import {
  FiX, FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff,
  FiCheckCircle, FiCompass, FiArrowRight, FiInfo
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

/* â”€â”€â”€ Shared button styles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
              <p className="interest-modal-subtitle">
                Register now â€” our team will assign you to a batch and course shortly.
              </p>
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

              {/* Info note */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                background: 'rgba(21,128,61,0.06)',
                border: '1px solid rgba(21,128,61,0.18)',
                borderRadius: 10, padding: '11px 13px',
                fontSize: '0.82rem', color: 'var(--text-secondary, #64748b)', lineHeight: 1.55
              }}>
                <FiInfo size={15} style={{ flexShrink: 0, marginTop: 1, color: 'var(--bs-primary, #15803d)' }} />
                <span>
                  After registration, our admissions team will reach out to assign you to the right batch and course.
                </span>
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
        /* â”€â”€ Success State â”€â”€ */
        <>
          <div className="interest-modal-header">
            <div>
              <h3 className="interest-modal-title">Account Created</h3>
              <p className="interest-modal-subtitle">You are now part of the CodeLift family.</p>
            </div>
            <button type="button" className="interest-modal-close-btn" onClick={handleClose} aria-label="Close">
              <FiX size={20} />
            </button>
          </div>

          <div className="interest-modal-body">
            {/* Success icon */}
            <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 76, height: 76, borderRadius: '50%',
                background: 'rgba(21,128,61,0.1)', color: '#15803d', marginBottom: 14
              }}>
                <FiCheckCircle size={42} />
              </div>
              <h5 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                Welcome, {form.name.split(' ')[0]}!
              </h5>
              <p style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.875rem', margin: 0 }}>
                Your student account has been created successfully.
              </p>
            </div>

            {/* Next steps */}
            <div style={{
              background: 'rgba(21,128,61,0.05)',
              border: '1px solid rgba(21,128,61,0.15)',
              borderRadius: 12, padding: '14px 16px'
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 12, color: 'var(--text-primary)' }}>
                What happens next?
              </div>
              {[
                'Check your email â€” a welcome message from CodeLift is on its way.',
                'Our admissions team will review your registration and contact you.',
                'You will be assigned to the right batch based on your interest.',
                'Once assigned, you can log in and start learning.'
              ].map((txt, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  fontSize: '0.84rem', color: 'var(--text-secondary, #64748b)',
                  marginBottom: i < 3 ? 10 : 0
                }}>
                  <span style={{
                    flexShrink: 0, width: 20, height: 20, borderRadius: '50%',
                    background: '#15803d', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 700, marginTop: 1
                  }}>{i + 1}</span>
                  <span>{txt}</span>
                </div>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <button
              type="button"
              onClick={() => {
                const msg = `Hello CodeLift Team,\n\nI just created my student account.\n\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nInterested In: ${form.interest}\n\nPlease guide me on the next steps and batch assignment. Thank you!`;
                window.open(
                  `https://wa.me/${ADMIN_WA || '919834671940'}?text=${encodeURIComponent(msg)}`,
                  '_blank',
                  'noopener,noreferrer'
                );
              }}
              style={{
                width: '100%', padding: '11px 20px', borderRadius: 50,
                background: '#25D366', border: 'none', color: '#fff',
                fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, boxShadow: '0 4px 14px rgba(37,211,102,0.3)', transition: 'all 0.2s'
              }}
            >
              <FaWhatsapp size={17} />
              Contact Us on WhatsApp
            </button>
          </div>

          <div className="interest-modal-footer" style={{ justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)' }}>
              You can log in once your batch is assigned.
            </span>
            <button type="button" onClick={handleClose} style={primaryBtnStyle}>
              <FiArrowRight size={15} />
              Done
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

