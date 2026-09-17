import React, { useState } from 'react';
import {
  FiSearch,
  FiMapPin,
  FiInstagram,
  FiMessageCircle,
  FiArrowUpRight,
  FiPhoneCall,
  FiMail,
  FiSend,
  FiClock
} from 'react-icons/fi';
import { FaWhatsapp as FaWhatsappIcon } from 'react-icons/fa';
import InterestFormModal from './InterestFormModal';
import './ContactHub.css';

export default function ContactHub() {
  const [showContactForm, setShowContactForm] = useState(false);

  return (
    <section id="contact" className="contact-hub-section pt-3 pt-md-4 pb-4 pb-md-5">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-3 mb-md-4">
          <div
            className="cl-section-label"
            style={{
              color: 'var(--bs-primary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              marginBottom: '8px',
            }}
          >
            Get In Touch
          </div>
          <h2
            className="fw-bold mb-2"
            style={{
              color: 'var(--text-primary)',
              fontSize: 'clamp(1.7rem, 3.5vw, 2.35rem)',
              lineHeight: 1.25,
            }}
          >
            Contact &amp; Campus Hub
          </h2>
        </div>

        {/* Unified Combined Contact & Social Hub */}
        <div className="contact-hub-wrapper">
          <div className="row g-4 align-items-stretch">
            {/* Left Column: Primary Interaction Hero Card */}
            <div className="col-lg-5 col-xl-5 d-flex">
              <div className="contact-hero-card w-100">
                <div className="contact-hero-top">
                  <div className="contact-live-pill">
                    <span className="live-dot" />
                    <span>Admissions &amp; Guidance Active</span>
                  </div>
                  <h3 className="contact-hero-title">
                    Interested in Joining CodeLift?
                  </h3>
                </div>

                <div className="contact-hero-action">
                  <button
                    type="button"
                    className="btn btn-hero-cta w-100"
                    onClick={() => setShowContactForm(true)}
                  >
                    <span>Request Callback / Syllabus</span>
                    <FiSend size={16} />
                  </button>
                </div>

                {/* Integrated Direct Contact Footnote */}
                <div className="contact-direct-strip">
                  <a href="tel:+919834671940" className="contact-direct-item">
                    <div className="direct-icon-circle">
                      <FiPhoneCall size={14} />
                    </div>
                    <div className="direct-text-group">
                      <span className="direct-label">Admissions Hotline</span>
                      <span className="direct-val">+91 98346 71940</span>
                    </div>
                  </a>
                  <a href="mailto:codelift.official@gmail.com" className="contact-direct-item">
                    <div className="direct-icon-circle">
                      <FiMail size={14} />
                    </div>
                    <div className="direct-text-group">
                      <span className="direct-label">Official Email</span>
                      <span className="direct-val">codelift.official@gmail.com</span>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: 2x2 Official Channel Cards Grid */}
            <div className="col-lg-7 col-xl-7 d-flex">
              <div className="contact-channels-grid w-100">
                {/* 1. Google Business */}
                <a
                  href="https://share.google/qZlZpyhvHoGCLU4aZ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="channel-tile tile-google"
                >
                  <div className="channel-tile-header">
                    <div className="channel-icon-box icon-google">
                      <FiSearch size={22} />
                    </div>
                    <span className="channel-arrow-badge">
                      <FiArrowUpRight size={16} />
                    </span>
                  </div>
                  <div className="channel-tile-body">
                    <h4 className="channel-title">Find Us on Google</h4>
                    <p className="channel-desc">
                      Read verified student reviews, ratings, and view campus photos.
                    </p>
                  </div>
                  <div className="channel-tile-footer">
                    <span className="channel-action-label">View Profile &amp; Reviews</span>
                  </div>
                </a>

                {/* 2. Visit Location */}
                <a
                  href="https://maps.app.goo.gl/GoQbaPXr3Gc5YvaB7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="channel-tile tile-location"
                >
                  <div className="channel-tile-header">
                    <div className="channel-icon-box icon-location">
                      <FiMapPin size={22} />
                    </div>
                    <span className="channel-arrow-badge">
                      <FiArrowUpRight size={16} />
                    </span>
                  </div>
                  <div className="channel-tile-body">
                    <h4 className="channel-title">Campus Location</h4>
                    <p className="channel-desc">
                      Plot 25, Gayatri Colony, Hazari Pahad, Nagpur
                    </p>
                  </div>
                  <div className="channel-tile-footer">
                    <span className="channel-action-label">Get Directions on Maps</span>
                  </div>
                </a>

                {/* 3. Instagram */}
                <a
                  href="https://www.instagram.com/codelift.official/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="channel-tile tile-instagram"
                >
                  <div className="channel-tile-header">
                    <div className="channel-icon-box icon-instagram">
                      <FiInstagram size={22} />
                    </div>
                    <span className="channel-arrow-badge">
                      <FiArrowUpRight size={16} />
                    </span>
                  </div>
                  <div className="channel-tile-body">
                    <h4 className="channel-title">Student Community</h4>
                    <p className="channel-desc">
                      Follow project demos, hackathons, and cohort announcements.
                    </p>
                  </div>
                  <div className="channel-tile-footer">
                    <span className="channel-action-label">Follow @codelift.official</span>
                  </div>
                </a>

                {/* 4. WhatsApp Direct */}
                <div className="channel-tile channel-tile-interactive tile-whatsapp">
                  <div className="channel-tile-header">
                    <div className="channel-icon-box icon-whatsapp">
                      <FaWhatsappIcon size={22} />
                    </div>
                    <span className="channel-badge-status">Instant Reply</span>
                  </div>
                  <div className="channel-tile-body">
                    <h4 className="channel-title">Admissions Desk</h4>
                    <p className="channel-desc">
                      Inquire about upcoming batch commencement dates, fees, and syllabus.
                    </p>
                  </div>
                  <div className="channel-tile-footer">
                    <a
                      href="https://wa.me/919834671940?text=Hello%20CodeLift%2C%20I%20would%20like%20to%20inquire%20about%20your%20training%20programs%2C%20curriculum%2C%20and%20admissions."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-channel-wa w-100 d-inline-flex align-items-center justify-content-center gap-2"
                      style={{ minHeight: 44 }}
                    >
                      <FaWhatsappIcon size={16} />
                      <span>Chat on WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      <InterestFormModal
        show={showContactForm}
        onHide={() => setShowContactForm(false)}
        title="Share Your Interest"
        subtitle="Fill in your details and connect with us directly on WhatsApp."
        submitLabel="Send on WhatsApp"
      />
    </section>
  );
}
