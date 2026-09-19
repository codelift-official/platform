import React, { useState } from 'react';
import {
  FaWhatsapp,
  FaCheckCircle,
  FaGraduationCap,
  FaBookOpen,
  FaCertificate,
  FaUserGraduate,
  FaTimes,
  FaArrowRight
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import './CourseEnrollModal.css';

export default function CourseEnrollModal({ course, show, onClose, onPortalEnroll }) {
  const { currentUser } = useAuth();
  const { sendEmail } = useData();

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [batchPref, setBatchPref] = useState('Upcoming Weekday Batch (Mon - Fri)');
  const [submitted, setSubmitted] = useState(false);

  if (!show || !course) return null;

  const isCohort = course.courseType === 'cohort' || course.isCohort === true;
  const isFree = course.isFree || course.price === 0;
  const priceDisplay = isFree ? 'FREE' : `₹${course.price}`;

  const handleWhatsAppRedirect = (e) => {
    e.preventDefault();

    const learnerName = name.trim() || currentUser?.name || 'Applicant';
    const learnerPhone = phone.trim() ? `\nContact Number: ${phone.trim()}` : '';

    const message = `Hello CodeLift Admissions,

I am writing to inquire about enrollment in the following program:

Program: ${course.title} (${isCohort ? 'Live Cohort Bootcamp' : 'Specialized Elective'})
Tuition Fee: ${priceDisplay}
Applicant Name: ${learnerName}${learnerPhone}
Preferred Schedule: ${batchPref}

Please provide the upcoming batch commencement dates, curriculum details, and the enrollment procedure.

Thank you.`;

    const encoded = encodeURIComponent(message);
    const waUrl = `https://wa.me/919834671940?text=${encoded}`;

    // Open WhatsApp in new tab
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    try {
      if (typeof sendEmail === 'function' && (currentUser?.email || currentUser?.username)) {
        sendEmail(
          'signup_request',
          { name: learnerName, email: currentUser?.email || '' },
          {
            student_name: learnerName,
            course_title: course?.title || 'Program',
            phone: phone.trim() || 'WhatsApp Inquiry'
          }
        ).catch((err) => console.warn('[EmailJS] signup_request email failed:', err));
      }
    } catch (err) {
      console.warn('[EmailJS] course enrollment notification failed:', err);
    }

    setSubmitted(true);
  };

  return (
    <div className="cl-enroll-modal-backdrop" onClick={onClose}>
      <div className="cl-enroll-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="cl-enroll-modal-close" onClick={onClose} aria-label="Close modal">
          <FaTimes size={16} />
        </button>

        {/* Modal Header */}
        <div className="cl-enroll-modal-header">
          <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
            <span className="badge rounded-pill cl-enroll-type-badge">
              {isCohort ? 'Live Cohort Bootcamp' : 'Specialized Elective'}
            </span>
            <span className="badge rounded-pill cl-enroll-live-badge">
              <span className="live-dot" /> Admissions Open
            </span>
          </div>

          <h3 className="cl-enroll-modal-title">{course.title}</h3>
          <p className="cl-enroll-modal-subtitle">
            Connect directly with CodeLift instructors on WhatsApp to confirm your batch seat and syllabus.
          </p>

          <div className="cl-enroll-price-strip">
            <div>
              <span className="cl-enroll-price-label">Program Fee:</span>
              <span className="cl-enroll-price-val">{priceDisplay}</span>
              {course.originalPrice && course.originalPrice > course.price && (
                <span className="cl-enroll-price-orig">₹{course.originalPrice}</span>
              )}
            </div>
            <div className="cl-enroll-badge-perk">
              <FaCertificate size={13} /> Verified Certificate
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="cl-enroll-modal-body">
          {submitted ? (
            <div className="cl-enroll-success-box text-center py-4">
              <div className="cl-enroll-success-icon">
                <FaCheckCircle size={42} />
              </div>
              <h4 className="fw-bold mt-3 mb-2" style={{ color: 'var(--text-primary)' }}>
                Connecting to WhatsApp...
              </h4>
              <p className="text-secondary small mb-3">
                Your pre-composed enrollment inquiry was opened in WhatsApp. Our lead instructor will guide you through batch timings and portal access.
              </p>
              <div className="d-flex gap-2 justify-content-center flex-wrap">
                <button
                  type="button"
                  className="btn btn-outline-success rounded-pill px-4 fw-bold btn-sm"
                  onClick={handleWhatsAppRedirect}
                >
                  <FaWhatsapp size={14} className="me-1" /> Re-open WhatsApp Chat
                </button>
                <button
                  type="button"
                  className="btn btn-secondary rounded-pill px-4 fw-bold btn-sm"
                  onClick={onClose}
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleWhatsAppRedirect}>
              {/* Program Highlights */}
              <div className="cl-enroll-perks-grid mb-3">
                <div className="cl-enroll-perk-item">
                  <FaGraduationCap className="text-success" size={14} />
                  <span>1-on-1 Faculty Mentorship</span>
                </div>
                <div className="cl-enroll-perk-item">
                  <FaBookOpen className="text-primary" size={14} />
                  <span>Production Code Reviews</span>
                </div>
                <div className="cl-enroll-perk-item">
                  <FaCertificate className="text-warning" size={14} />
                  <span>Industry-Grade Certificate</span>
                </div>
                <div className="cl-enroll-perk-item">
                  <FaUserGraduate className="text-info" size={14} />
                  <span>Placement Assistance</span>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="mb-3">
                <label className="form-label cl-enroll-label">Your Name</label>
                <input
                  type="text"
                  required
                  className="form-control cl-enroll-input"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-12 col-md-6">
                  <label className="form-label cl-enroll-label">Phone / WhatsApp (Optional)</label>
                  <input
                    type="tel"
                    className="form-control cl-enroll-input"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label cl-enroll-label">Preferred Batch Schedule</label>
                  <select
                    className="form-select cl-enroll-input"
                    value={batchPref}
                    onChange={(e) => setBatchPref(e.target.value)}
                  >
                    <option value="Upcoming Weekday Batch (Mon - Fri)">Upcoming Weekday Batch</option>
                    <option value="Upcoming Weekend Batch (Sat - Sun)">Upcoming Weekend Batch</option>
                    <option value="Need Syllabus & Fee Concession Details">Request Syllabus & Fees</option>
                    <option value="Flexible / Need Counseling">General Counseling</option>
                  </select>
                </div>
              </div>

              {/* Primary WhatsApp Action */}
              <button
                type="submit"
                className="btn cl-enroll-wa-btn w-100 py-3 fw-bold mb-2"
              >
                <FaWhatsapp size={20} />
                <span>Continue Enrollment on WhatsApp</span>
                <FaArrowRight size={14} className="ms-1" />
              </button>

              <div className="text-center">
                <small className="text-secondary" style={{ fontSize: '0.76rem' }}>
                  Direct connection with CodeLift Academic Admissions • Official Onboarding
                </small>
              </div>

              {/* Secondary Option: Self-enroll in Portal if available */}
              {onPortalEnroll && (
                <div className="text-center mt-3 pt-3 border-top" style={{ borderColor: 'var(--border-color)' }}>
                  <button
                    type="button"
                    className="btn btn-link p-0 text-decoration-none small fw-semibold"
                    style={{ color: 'var(--bs-primary)', fontSize: '0.82rem' }}
                    onClick={() => {
                      onClose();
                      onPortalEnroll();
                    }}
                  >
                    Prefer platform direct checkout? Enroll in Student Portal &rarr;
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
