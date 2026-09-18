import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/common/Navbar';
import SEO from '../components/common/SEO';
import CheckoutModal from '../components/common/CheckoutModal';
import InvoiceModal from '../components/common/InvoiceModal';
import CourseEnrollModal from '../components/common/CourseEnrollModal';
import CourseTechThumbnail from '../components/common/CourseTechThumbnail';
import toast from 'react-hot-toast';
import {
  FaStar, FaCheckCircle, FaBookOpen, FaLock,
  FaCertificate, FaAward, FaFileInvoice, FaGraduationCap,
  FaChevronDown, FaChevronUp, FaPlay, FaShieldAlt, FaClock, FaLayerGroup,
  FaWhatsapp
} from 'react-icons/fa';
import { resolveCourseFee } from '../utils/feeUtils';
import '../styles/CourseView.css';

export default function CourseDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { auth, currentUser } = useAuth();
  const { courses, categories, enrollments, payments, batches } = useData();

  const [showCheckout, setShowCheckout] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const heroRef = useRef(null);

  const course = courses.find(c => c.slug === slug || c.id === slug);
  const feeInfo = resolveCourseFee(course, batches);
  const courseForEnroll = course ? {
    ...course,
    price: feeInfo.feeAmount,
    originalPrice: feeInfo.originalPrice,
    isFree: feeInfo.isFree
  } : null;

  // Show sticky bar when hero action card scrolls out of view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, [course]);

  if (!course) {
    return (
      <div style={{ backgroundColor: 'var(--bg-body, #0f172a)', color: 'var(--text-primary)', minHeight: '100vh' }}>
        <Navbar />
        <div className="container text-center py-5">
          <h3>Course Not Found</h3>
          <p className="text-muted">The requested course does not exist or has been removed.</p>
          <Link to="/courses" className="btn btn-success rounded-pill px-4 fw-bold">Back to Marketplace</Link>
        </div>
      </div>
    );
  }

  const userEnrollment = currentUser
    ? enrollments.find(e => e.studentId === currentUser.id && e.courseId === course.id)
    : null;
  const userPayment = userEnrollment ? payments.find(p => p.enrollmentId === userEnrollment.id) : null;
  const isEnrolled = Boolean(userEnrollment && (userEnrollment.status === 'FREE' || userEnrollment.status === 'PAID'));
  const isPending = userEnrollment?.status === 'PENDING';

  const totalTopics = (course.modules || []).reduce((acc, m) => acc + (m.topics?.length || 0), 0);
  const totalDuration = (course.modules || []).reduce((acc, m) =>
    acc + (m.topics || []).reduce((ta, t) => ta + (t.durationMinutes || 7), 0), 0);
  const durationStr = totalDuration > 60
    ? `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`
    : `${totalDuration}m`;

  const handleEnrollClick = () => {
    setShowEnrollModal(true);
  };

  const EnrollCTA = () => (
    isEnrolled ? (
      <div>
        <div
          className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 mb-3"
          style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#16a34a', fontSize: '0.875rem', fontWeight: 700 }}
        >
          <FaCheckCircle size={14} /> You are enrolled in this course!
        </div>
        <button
          className="btn btn-success w-100 py-3 fw-bold rounded-3 d-flex align-items-center justify-content-center gap-2 mb-2"
          style={{ fontSize: '1rem' }}
          onClick={() => navigate('/student/courses')}
        >
          <FaPlay size={13} /> Go to My Courses
        </button>
        {userPayment && (
          <button
            className="btn btn-outline-secondary w-100 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
            onClick={() => setShowInvoice(true)}
          >
            <FaFileInvoice size={13} /> View Tax Receipt
          </button>
        )}
      </div>
    ) : isPending ? (
      <div
        className="px-3 py-3 rounded-3 text-center"
        style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#d97706', fontSize: '0.875rem', fontWeight: 700 }}
      >
        Payment Verification in Progress
      </div>
    ) : (
      <button
        className="btn btn-success btn-lg w-100 py-3 fw-bold rounded-3 shadow d-flex align-items-center justify-content-center gap-2"
        style={{
          fontSize: '1rem',
          background: 'linear-gradient(135deg, var(--bs-primary, #15803d) 0%, color-mix(in srgb, var(--bs-primary, #15803d) 80%, #000) 100%)',
          border: 'none',
          boxShadow: '0 6px 24px rgba(var(--bs-primary-rgb, 21,128,61), 0.35)'
        }}
        onClick={handleEnrollClick}
      >
        <FaWhatsapp size={19} />
        <span>{feeInfo.isFree ? 'Enroll on WhatsApp' : 'Enroll via WhatsApp'}</span>
      </button>
    )
  );

  return (
    <div style={{ backgroundColor: 'var(--bg-body, #0f172a)', color: 'var(--text-primary)', minHeight: '100vh' }}>
      <SEO title={course.title} description={course.description} />
      <Navbar />

      {/* ── Hero Header ──────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, var(--card-bg, #0f172a) 0%, color-mix(in srgb, var(--bs-primary, #15803d) 14%, var(--card-bg, #0f172a)) 50%, var(--card-bg, #0f172a) 100%)',
        color: 'var(--text-primary, #ffffff)',
        padding: '48px 0 40px',
        borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))'
      }}>
        <div className="container" style={{ maxWidth: 1200 }}>
          <div className="row g-4 align-items-center">
            {/* Left: Course Info */}
            <div className="col-lg-7">
              <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
                <span
                  className="badge px-3 py-2 rounded-pill fw-bold text-uppercase"
                  style={{
                    background: 'rgba(var(--bs-primary-rgb, 21,128,61), 0.12)',
                    color: 'var(--bs-primary, #15803d)',
                    border: '1px solid rgba(var(--bs-primary-rgb, 21,128,61), 0.3)',
                    fontSize: '0.72rem',
                    letterSpacing: '0.06em'
                  }}
                >
                  {feeInfo.feeFormatted ? `Fees: ${feeInfo.feeFormatted}` : (feeInfo.isFree ? 'Free Program' : `Fees: ₹${feeInfo.feeAmount}`)}
                </span>
                {course.courseType && (
                  <span
                    className="badge px-3 py-2 rounded-pill fw-bold text-uppercase"
                    style={{
                      background: 'rgba(var(--bs-info-rgb, 8,145,178), 0.12)',
                      color: 'var(--bs-info, #0891b2)',
                      border: '1px solid rgba(var(--bs-info-rgb, 8,145,178), 0.3)',
                      fontSize: '0.72rem',
                      letterSpacing: '0.06em'
                    }}
                  >
                    {course.courseType === 'cohort' ? 'Live Cohort Bootcamp' : 'Specialized Elective'}
                  </span>
                )}
              </div>

              <h1 className="fw-extrabold mb-3" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', lineHeight: 1.25, color: 'var(--text-primary)' }}>
                {course.title}
              </h1>
              <p className="mb-4" style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, maxWidth: 600 }}>
                {course.description}
              </p>

              {/* Stats Row */}
              <div className="d-flex flex-wrap align-items-center gap-3" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <div className="d-flex align-items-center gap-1">
                  <FaStar style={{ color: '#fbbf24' }} />
                  <strong style={{ color: '#fbbf24' }}>{course.rating || 5.0}</strong>
                  <span> rating</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                  <FaLayerGroup style={{ color: 'var(--bs-primary, #15803d)' }} />
                  <span><strong style={{ color: 'var(--text-primary)' }}>{course.modules?.length || 0}</strong> sections</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                  <FaBookOpen style={{ color: 'var(--bs-primary, #15803d)' }} />
                  <span><strong style={{ color: 'var(--text-primary)' }}>{totalTopics}</strong> lectures</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                  <FaClock style={{ color: '#f472b6' }} />
                  <span><strong style={{ color: 'var(--text-primary)' }}>{durationStr}</strong> total</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                  <FaCertificate style={{ color: 'var(--bs-primary, #15803d)' }} />
                  <span>Certificate Included</span>
                </div>
              </div>
            </div>

            {/* Right: Enrollment Card */}
            <div className="col-lg-5" ref={heroRef}>
              <div
                className="rounded-4 overflow-hidden shadow-lg"
                style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border-color)' }}
              >
                {/* Technology Icon Thumbnail */}
                <CourseTechThumbnail
                  course={course}
                  category={categories?.find((cat) => cat.id === course.categoryId)}
                  height={220}
                  className="rounded-top-4"
                />

                <div className="p-4">
                  <div className="mb-4 text-center">
                    <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--bs-primary, #15803d)' }}>
                      {feeInfo.feeFormatted}
                    </span>
                    {!feeInfo.isFree && feeInfo.originalPrice && feeInfo.originalPrice > feeInfo.feeAmount && (
                      <span className="ms-2 text-muted text-decoration-line-through small">₹{feeInfo.originalPrice.toLocaleString('en-IN')}</span>
                    )}
                  </div>

                  <EnrollCTA />

                  {/* Perks List */}
                  {!isEnrolled && !isPending && (
                    <ul className="list-unstyled mt-4 mb-0" style={{ fontSize: '0.83rem' }}>
                      {[
                        'Free Demo Class',
                        '3+ Real-World Projects',
                        'Project-Based Learning',
                        'GitHub Deployment',
                        'Verified Certificate',
                        'Expert Mentorship'
                      ].map((perk, i) => (
                        <li key={i} className="d-flex align-items-start gap-2 mb-2" style={{ color: 'var(--text-secondary)' }}>
                          <FaCheckCircle style={{ color: '#16a34a', marginTop: 2, flexShrink: 0 }} size={12} />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content ──────────────────────────────────────── */}
      <main className="container py-4 py-md-5" style={{ maxWidth: 1200, paddingBottom: isEnrolled ? undefined : '96px' }}>
        <div className="row g-4">
          {/* Curriculum Column */}
          <div className="col-lg-8">
            <div
              className="rounded-4 p-4 mb-4"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            >
              <h4 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                Course Curriculum
              </h4>
              <p className="text-muted small mb-4">
                {course.modules?.length || 0} sections &nbsp;·&nbsp; {totalTopics} lectures &nbsp;·&nbsp; {durationStr} total length
              </p>

              <div style={{ border: '1px solid var(--border-color)', borderRadius: 10, overflow: 'hidden' }}>
                {(course.modules || []).map((mod, idx) => (
                  <ModuleAccordion
                    key={mod.id || idx}
                    mod={mod}
                    idx={idx}
                    isEnrolled={isEnrolled}
                    navigate={navigate}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            {/* Mentorship Card */}
            <div
              className="rounded-4 p-4 mb-4"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            >
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <FaAward style={{ color: 'var(--bs-primary, #15803d)' }} /> Academy Mentorship
              </h5>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                  style={{ width: 52, height: 52, background: 'linear-gradient(135deg, var(--bs-primary, #15803d), color-mix(in srgb, var(--bs-primary, #15803d) 80%, #000))', fontSize: '1.2rem' }}
                >
                  <FaGraduationCap size={22} />
                </div>
                <div>
                  <div className="fw-bold" style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>CodeLift Institute Faculty</div>
                  <div className="text-muted small">support@codelift.dev</div>
                </div>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                {['Live Mentorship', 'Code Reviews', 'Verified Certificate', 'Job Assistance'].map((sk, i) => (
                  <span
                    key={i}
                    className="badge border px-2 py-1 rounded-pill"
                    style={{ background: 'rgba(var(--bs-primary-rgb, 21,128,61), 0.08)', color: 'var(--bs-primary, #15803d)', borderColor: 'rgba(var(--bs-primary-rgb, 21,128,61), 0.2)', fontSize: '0.73rem' }}
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Security Badge */}
            <div
              className="rounded-4 p-3 d-flex align-items-center gap-3"
              style={{ background: 'rgba(var(--bs-primary-rgb, 21,128,61), 0.06)', border: '1px solid rgba(var(--bs-primary-rgb, 21,128,61), 0.2)' }}
            >
              <FaShieldAlt style={{ color: 'var(--bs-primary, #15803d)', fontSize: '1.4rem', flexShrink: 0 }} />
              <div>
                <div className="fw-bold" style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>Secure Enrollment</div>
                <div className="text-muted" style={{ fontSize: '0.78rem', lineHeight: 1.5 }}>
                  All payments are manually verified by our admin team. Zero risk.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Mobile Sticky Enroll Bar ─────────────────────────── */}
      {!isEnrolled && !isPending && (
        <div className={`cd-sticky-enroll d-lg-none ${stickyVisible ? 'visible' : ''}`}>
          <div className="cd-sticky-price">
            {feeInfo.feeFormatted}
          </div>
          <button className="cd-sticky-enroll-btn" onClick={handleEnrollClick}>
            <FaWhatsapp size={18} />
            <span>{feeInfo.isFree ? 'Enroll on WhatsApp' : 'Enroll via WhatsApp'}</span>
          </button>
        </div>
      )}

      {/* Modals */}
      <CourseEnrollModal
        course={courseForEnroll}
        show={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        onPortalEnroll={() => {
          if (!currentUser) {
            navigate('/login');
          } else {
            setShowCheckout(true);
          }
        }}
      />
      {showCheckout && (
        <CheckoutModal course={courseForEnroll} onClose={() => setShowCheckout(false)} onSuccess={() => setShowCheckout(false)} />
      )}
      {showInvoice && (
        <InvoiceModal payment={userPayment} enrollment={userEnrollment} course={courseForEnroll} onClose={() => setShowInvoice(false)} />
      )}
    </div>
  );
}

// ── Module Accordion ──────────────────────────────────────────────
function ModuleAccordion({ mod, idx, isEnrolled, navigate }) {
  const [open, setOpen] = useState(idx === 0);

  return (
    <div style={{ borderBottom: idx < 99 ? '1px solid var(--border-color)' : 'none' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-100 text-start d-flex align-items-start gap-3 px-4 py-3 border-0"
        style={{
          background: open ? 'rgba(var(--bs-primary-rgb, 21,128,61), 0.04)' : 'var(--card-bg)',
          cursor: 'pointer',
          transition: 'background 0.18s'
        }}
      >
        <span style={{ marginTop: 3, color: 'var(--text-secondary)', flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <FaChevronDown size={12} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="fw-bold" style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: 2 }}>
            Module {idx + 1}: {mod.title}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            {mod.topics?.length || 0} lectures
          </div>
        </div>
      </button>

      {open && (
        <div style={{ background: 'var(--card-bg-alt, rgba(0,0,0,0.01))' }}>
          {(mod.topics || []).map(topic => (
            <div
              key={topic.id}
              className="d-flex align-items-center gap-3 px-4 py-3"
              style={{ borderTop: '1px solid var(--border-color)', minHeight: 52 }}
            >
              <span style={{ flexShrink: 0, color: isEnrolled ? 'var(--bs-primary, #15803d)' : 'var(--text-secondary)' }}>
                {isEnrolled ? <FaBookOpen size={13} /> : <FaLock size={11} />}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  className="fw-semibold"
                  style={{
                    fontSize: '0.85rem',
                    color: isEnrolled ? 'var(--text-primary)' : 'var(--text-secondary)',
                    cursor: isEnrolled ? 'pointer' : 'default',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                  onClick={() => isEnrolled && navigate('/student/courses')}
                >
                  {topic.title}
                </div>
                {topic.durationMinutes && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    {topic.durationMinutes} min
                  </div>
                )}
              </div>
              {isEnrolled && (
                <button
                  className="btn btn-sm btn-outline-success rounded-pill px-3 flex-shrink-0"
                  style={{ fontSize: '0.75rem', padding: '3px 12px' }}
                  onClick={() => navigate('/student/courses')}
                >
                  Open
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
