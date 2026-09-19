import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FiX, FiSend, FiUser, FiMail, FiPhone, FiCompass, FiMessageSquare } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useData } from '../../contexts/DataContext';
import { ADMIN_WA as SERVICE_ADMIN_WA } from '../../services/notificationService';
import './InterestFormModal.css';

const ADMIN_WA = SERVICE_ADMIN_WA || '919834671940';

export default function InterestFormModal({
  show,
  onHide,
  title = '🎓 Sign Up for Upcoming Cohort',
  subtitle = 'Fill in your details to register. Our admissions team will connect with you directly on WhatsApp.',
  submitLabel = 'Submit Details on WhatsApp'
}) {
  const { sendEmail } = useData();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    interest: 'Full Stack Development',
    message: '',
  });

  const [errors, setErrors] = useState({});

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      phone: '',
      interest: 'Full Stack Development',
      message: '',
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validatePhone = (rawPhone) => {
    // Strip spaces, hyphens, and parenthesis
    const cleaned = rawPhone.replace(/[\s\-\(\)]/g, '');
    // Check 10-digit Indian mobile number or with +91 / 91 / 0 prefix
    const phoneRegex = /^(?:\+?91|0)?[6-9]\d{9}$/;
    return {
      isValid: phoneRegex.test(cleaned),
      cleanedPhone: cleaned.startsWith('+91')
        ? cleaned
        : cleaned.startsWith('91') && cleaned.length === 12
        ? `+${cleaned}`
        : cleaned.startsWith('0') && cleaned.length === 11
        ? `+91${cleaned.slice(1)}`
        : `+91${cleaned}`,
    };
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!form.name.trim()) {
      newErrors.name = 'Please enter your full name';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Please enter your email address';
    } else if (!validateEmail(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'Please enter your 10-digit mobile number';
    } else {
      const { isValid } = validatePhone(form.phone);
      if (!isValid) {
        newErrors.phone = 'Please enter a valid 10-digit Indian mobile number (starts with 6-9)';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fill in all required fields properly');
      return;
    }

    // Format WhatsApp message with all filled details
    const { cleanedPhone } = validatePhone(form.phone);
    const message = `Hello CodeLift Admissions,

I would like to sign up / register for upcoming cohorts at CodeLift.

📋 Registration / Application Details:
• Full Name: ${form.name.trim()}
• Email Address: ${form.email.trim()}
• Phone Number: ${cleanedPhone}
• Course / Track: ${form.interest}
${form.message.trim() ? `• Notes / Questions: ${form.message.trim()}\n` : ''}
Please share upcoming batch schedules, syllabus details, and enrollment steps.

Thank you!`;

    const waUrl = `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    try {
      if (typeof sendEmail === 'function') {
        sendEmail(
          'signup_request',
          { name: form.name.trim(), email: form.email.trim() },
          {
            student_name: form.name.trim(),
            course_title: form.interest,
            phone: cleanedPhone
          }
        ).catch((err) => console.warn('[EmailJS] signup_request email failed:', err));
      }
    } catch (e) {
      console.warn('[EmailJS] signup_request notification failed:', e);
    }

    toast.success('Opening WhatsApp with your details...');
    handleClose();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      dialogClassName="interest-modal-dialog"
      contentClassName="interest-modal-content"
    >
      <div className="interest-modal-header">
        <div>
          <h3 className="interest-modal-title">{title}</h3>
          <p className="interest-modal-subtitle">{subtitle}</p>
        </div>
        <button
          type="button"
          className="interest-modal-close-btn"
          onClick={handleClose}
          aria-label="Close dialog"
        >
          <FiX size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="interest-modal-form" noValidate>
        <div className="interest-modal-body">
          {/* Full Name */}
          <div className="interest-form-group">
            <label className="interest-form-label">
              <FiUser className="label-icon" /> Full Name <span className="req">*</span>
            </label>
            <input
              type="text"
              name="name"
              className={`interest-form-input ${errors.name ? 'is-invalid' : ''}`}
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              required
            />
            {errors.name && <div className="interest-field-error">{errors.name}</div>}
          </div>

          {/* Email */}
          <div className="interest-form-group">
            <label className="interest-form-label">
              <FiMail className="label-icon" /> Email Address <span className="req">*</span>
            </label>
            <input
              type="email"
              name="email"
              inputMode="email"
              autoComplete="email"
              className={`interest-form-input ${errors.email ? 'is-invalid' : ''}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
            {errors.email && <div className="interest-field-error">{errors.email}</div>}
          </div>

          {/* Phone */}
          <div className="interest-form-group">
            <label className="interest-form-label">
              <FiPhone className="label-icon" /> Phone Number <span className="req">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              inputMode="tel"
              autoComplete="tel"
              className={`interest-form-input ${errors.phone ? 'is-invalid' : ''}`}
              placeholder="10-digit mobile number"
              value={form.phone}
              onChange={handleChange}
              required
            />
            {errors.phone && <div className="interest-field-error">{errors.phone}</div>}
          </div>

          {/* Interest */}
          <div className="interest-form-group">
            <label className="interest-form-label">
              <FiCompass className="label-icon" /> Interested In <span className="req">*</span>
            </label>
            <select
              name="interest"
              className="interest-form-select"
              value={form.interest}
              onChange={handleChange}
              required
            >
              <option value="Full Stack Development">Full Stack Development</option>
              <option value="Data Analytics">Data Analytics</option>
              <option value="Both">Both</option>
              <option value="Not Sure">Not Sure</option>
            </select>
          </div>

          {/* Message (Optional) */}
          <div className="interest-form-group">
            <label className="interest-form-label">
              <FiMessageSquare className="label-icon" /> Message (optional)
            </label>
            <textarea
              name="message"
              rows={3}
              className="interest-form-textarea"
              placeholder="Tell us what you're looking for (optional)"
              value={form.message}
              onChange={handleChange}
              maxLength={500}
            />
          </div>
        </div>

        <div className="interest-modal-footer">
          <Button
            type="button"
            variant="outline-secondary"
            className="interest-cancel-btn"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button type="submit" className="interest-submit-btn">
            <FaWhatsapp size={17} /> {submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
