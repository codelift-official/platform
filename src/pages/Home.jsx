import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowRight,
  FaGraduationCap,
  FaBookOpen,
  FaWhatsapp,
  FaCheckCircle,
  FaCode,
  FaDatabase,
  FaChartBar,
  FaTerminal,
  FaTrophy,
  FaFire,
} from 'react-icons/fa';
import { SiPython, SiReact, SiPostgresql, SiFastapi, SiJavascript } from 'react-icons/si';
import Navbar from '../components/common/Navbar';
import HomeRadar from '../components/common/HomeRadar';
import RadarRings from '../components/common/RadarRings';
import ContactHub from '../components/home/ContactHub';
import FloatingWhatsApp from '../components/common/FloatingWhatsApp';
import CourseEnrollModal from '../components/common/CourseEnrollModal';
import PageLoader from '../components/common/PageLoader';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { useData } from '../contexts/DataContext';
import { resolveCourseFee } from '../utils/feeUtils';
import { resolveCourseTech } from '../components/common/CourseTechThumbnail';
import '../styles/HomeElevated.css';

/* ─── Helpers ──────────────────────────────────────────────────────── */

/** Resolve a tech icon + colour class from the course category / title */
function getCourseIconMeta(course) {
  const tech = resolveCourseTech(course);
  const IconComponent = tech.Icon;
  return { icon: <IconComponent />, boxClass: tech.boxClass };
}

// ─── Code Arena Preview Problems (shown on Home page) ──────────────────────

export const ARENA_PREVIEW_PROBLEMS = [
  {
    id: 'prob-hello-world',
    title: 'Hello World Generator',
    difficulty: 'Easy',
    diffClass: 'easy',
    xp: 20,
    category: 'Python',
    desc: 'Write a function that returns a greeting string. Perfect first challenge for Python beginners.',
  },
  {
    id: 'prob-two-sum',
    title: 'Two Sum Problem',
    difficulty: 'Medium',
    diffClass: 'medium',
    xp: 50,
    category: 'Data Structures',
    desc: 'Classic interview problem — find two indices that sum to a target using a hash map in O(N).',
  },
  {
    id: 'prob-binary-search',
    title: 'Binary Search Algorithm',
    difficulty: 'Medium',
    diffClass: 'medium',
    xp: 60,
    category: 'Algorithms',
    desc: 'Implement binary search on a sorted array. Foundational algorithm with O(log N) complexity.',
  },
];

export default function Home() {

  const { courses, batches, isHydrated, isLoading } = useData();
  const isDataLoading = (!isHydrated && isSupabaseConfigured) || (isLoading && isSupabaseConfigured);
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState(null);
  const [selectedCohortTrack, setSelectedCohortTrack] = useState('all');

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 72;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth',
      });
    }
  };

  // Strictly published programs
  const allCohorts = (courses || []).filter(
    (c) =>
      c.isPublished !== false &&
      c.isApproved !== false
  );

  // Filter by selected track
  const filteredCohorts = allCohorts.filter((c) => {
    if (selectedCohortTrack === 'all') return true;
    const cat = (c.categoryId || '').toLowerCase();
    const title = (c.title || '').toLowerCase();
    if (selectedCohortTrack === 'web') return cat.includes('web') || title.includes('full') || title.includes('react');
    if (selectedCohortTrack === 'python') return cat.includes('python') || title.includes('python') || title.includes('ai');
    if (selectedCohortTrack === 'data') return cat.includes('data') || title.includes('data') || title.includes('sql');
    return true;
  });

  return (
    <>
      {/* 1. NAVBAR */}
      <Navbar />

      {/* 2. HERO SECTION */}
      <section id="hero" className="cl-hero hero-section">
        {/* Ambient orbs — CSS-only, theme-adaptive */}
        <div className="cl-hero-orb cl-hero-orb-1" aria-hidden="true" />
        <div className="cl-hero-orb cl-hero-orb-2" aria-hidden="true" />

        <HomeRadar />
        <div className="container hero-content">
          <div className="row align-items-center g-4 g-lg-5">
            <div className="col-lg-7 col-xl-6">
              {/* Trust badge */}
              <div className="cl-hero-trust-badge mb-2 mb-md-3">
                <span className="live-dot" />
                <span>Admissions Open <span className="badge-dash">–</span> {new Date().getFullYear()} Courses</span>
              </div>

              <h1 className="mb-3 mb-md-4 learn-build-grow">
                Learn{' '}
                <span className="highlight">
                  — Build —
                </span>{' '}
                Grow
              </h1>

              {/* Mobile Radar Showcase */}
              <div className="col-12 d-lg-none mt-3 mb-3">
                <div className="cl-mobile-radar-card">
                  <div className="cl-mobile-radar-header">
                    <span className="cl-mobile-radar-badge">
                      <span className="live-dot" /> Live Tech Stack
                    </span>
                    <span className="cl-mobile-radar-hint">Interactive Skills Radar</span>
                  </div>
                  <div className="cl-mobile-radar-viewport">
                    <RadarRings showLabels={true} nucleusSize="sm" />
                  </div>
                  <div className="cl-mobile-radar-caption">
                    Skills you'll build at CodeLift.
                  </div>
                </div>
              </div>

              <div className="d-none d-lg-flex flex-wrap gap-3 cl-hero-cta-group">
                <button className="btn-explore" onClick={() => scrollTo('courses')}>
                  Explore Courses <FaArrowRight style={{ fontSize: '0.8rem' }} />
                </button>
                <Link to="/problems" className="btn btn-outline-success rounded-pill px-4 fw-bold d-inline-flex align-items-center gap-2" style={{ textDecoration: 'none' }}>
                  <FaTerminal size={13} /> Code Arena
                </Link>
              </div>
            </div>

            {/* Right side — radar occupies visually on desktop */}
            <div className="col-lg-5 col-xl-6 d-none d-lg-block" />

          </div>
        </div>
      </section>

      {/* 3. COURSES SECTION (COHORTS ONLY) */}
      <section id="courses" className="pt-2 pb-4 pb-md-5" style={{ background: 'var(--bg-body)' }}>
        <div className="container pb-2 pb-md-4">
          {/* Section Header */}
          <div className="text-center mb-3 mb-md-4">
            <div className="cl-eyebrow" style={{ color: 'var(--bs-primary)' }}>Flagship Programs</div>
            <h2 className="cl-section-title fw-bold mb-2">Live Courses</h2>
            <p className="cl-section-sub mx-auto mb-4" style={{ maxWidth: '600px' }}>
              Master high-impact skills with live problem
              solving, production deployments, and career placement guidance.
            </p>

            {/* Quick Track Filter Pills */}
            {/* <div className="cl-cohort-filter-pills">
              {[
                { id: 'all', label: `All Courses (${allCohorts.length})` },
                { id: 'web', label: 'Full-Stack Web' },
                { id: 'python', label: 'Python & AI' },
                { id: 'data', label: 'Data Analytics' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  className={`cl-cohort-filter-pill ${selectedCohortTrack === pill.id ? 'active' : ''}`}
                  onClick={() => setSelectedCohortTrack(pill.id)}
                >
                  {pill.label}
                </button>
              ))}
            </div> */}
          </div>

          {/* Courses Grid */}
          {isDataLoading ? (
            <PageLoader
              title="Loading Cohorts..."
              message="Fetching live cohort schedules and curriculum modules..."
              minHeight="260px"
            />
          ) : filteredCohorts.length === 0 ? (
            <div
              className="text-center py-5 rounded-4 border"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
            >
              <FaBookOpen className="text-muted fs-1 mb-3 opacity-50" />
              <h5 className="fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {selectedCohortTrack === 'all' ? 'No active courses available' : 'No active cohorts for this track'}
              </h5>
              <p className="mb-3" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {selectedCohortTrack === 'all'
                  ? 'New Courses and curriculum modules are currently being prepared. Check back soon or speak with an advisor!'
                  : 'Explore all available courses or check back for upcoming batch dates.'}
              </p>
              <button
                type="button"
                className="btn btn-outline-success rounded-pill px-4 fw-bold btn-sm"
                onClick={() => setSelectedCohortTrack('all')}
              >
                View All Courses
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {filteredCohorts.map((c, idx) => {
                const { icon, boxClass } = getCourseIconMeta(c);
                const feeInfo = resolveCourseFee(c, batches);
                const isFree = feeInfo.isFree;
                const tags = Array.isArray(c.tags) ? c.tags.slice(0, 4) : [];
                const catLabel = c.categoryId
                  ? c.categoryId.replace('cat-', '').replace(/-/g, ' ').toUpperCase()
                  : 'COHORT';

                return (
                  <div key={c.id} className="col-md-6 col-lg-4">
                    <div className="cl-cohort-card-elevated" style={{ animationDelay: `${idx * 0.06}s` }}>

                      {/* ── Icon header ── */}
                      <div className="cl-cohort-header">
                        <div className={`cl-tech-icon-box ${boxClass}`}>{icon}</div>
                        <div className="cl-cohort-header-badges">
                          <span className="cl-badge-live">
                            <span className="live-dot" /> Live
                          </span>
                          <span className={`cl-badge-price ${isFree ? 'free' : 'paid'}`}>
                            {feeInfo.feeFormatted}
                          </span>
                        </div>
                      </div>

                      {/* ── Body ── */}
                      <div className="cl-cohort-body">
                        <div>
                          {/* Category */}
                          <div className="cl-cohort-meta-row mb-2">
                            <span className="cl-course-category-tag">{catLabel}</span>
                          </div>

                          {/* Title */}
                          <h5 className="cl-cohort-title mb-2">
                            <Link
                              to={`/courses/${c.slug || c.id}`}
                              className="text-decoration-none"
                              style={{ color: 'inherit' }}
                            >
                              {c.title}
                            </Link>
                          </h5>

                          {/* Tech tags */}
                          {tags.length > 0 && (
                            <div className="cl-tech-tags mb-3">
                              {tags.map((tag) => (
                                <span key={tag} className="cl-tech-tag">{tag}</span>
                              ))}
                            </div>
                          )}

                          {/* Feature bullets */}
                          <ul className="cl-cohort-feature-bullets">
                            <li className="cl-cohort-feature-bullet">
                              <FaCheckCircle size={11} /> 1-on-1 Mentor Code Reviews
                            </li>
                            <li className="cl-cohort-feature-bullet">
                              <FaCheckCircle size={11} /> Production Capstone Project
                            </li>
                            <li className="cl-cohort-feature-bullet">
                              <FaCheckCircle size={11} /> Verified Certificate of Mastery
                            </li>
                          </ul>
                        </div>

                        {/* CTA buttons */}
                        <div>
                          <hr className="cl-cohort-divider mb-3" />
                          <div className="cl-cohort-cta-row">
                            <Link
                              to={`/courses/${c.slug || c.id}`}
                              className="cl-btn-curriculum"
                            >
                              Curriculum
                            </Link>
                            <button
                              type="button"
                              className="cl-btn-enroll"
                              onClick={() => {
                                Object.assign(c, { price: feeInfo.price, isFree: feeInfo.isFree });
                                setSelectedCourseForEnroll(c);
                              }}
                              title="Enroll via WhatsApp"
                            >
                              <FaWhatsapp size={15} />
                              <span>Enroll</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 3b. CODE ARENA SPOTLIGHT */}
      <section id="code-arena" className="cl-arena-spotlight-section">
        {/* Ambient decoration */}
        <div className="cl-arena-spot-orb orb-1" aria-hidden="true" />
        <div className="cl-arena-spot-orb orb-2" aria-hidden="true" />

        <div className="container pt-4 pb-4">
          {/* Header */}
          <div className="row align-items-center g-4 g-lg-5 mb-5">
            <div className="col-lg-6 text-center text-lg-start d-flex flex-column align-items-center align-items-lg-start">
              <div className="cl-eyebrow" style={{ color: 'var(--bs-primary)' }}>Interactive Learning</div>
              <h2 className="cl-section-title fw-bold mb-3">
                Code{' '}
                <span style={{ color: 'var(--bs-primary)' }}>Arena</span>
              </h2>

              {/* Stats row */}
              <div className="cl-arena-spot-stats justify-content-center justify-content-lg-start">
                <div className="cl-arena-spot-stat">
                  <span className="cl-arena-spot-stat-num">50+</span>
                  <span className="cl-arena-spot-stat-label">Coding Challenges</span>
                </div>
                <div className="cl-arena-spot-stat-divider" />
                <div className="cl-arena-spot-stat">
                  <span className="cl-arena-spot-stat-num">6</span>
                  <span className="cl-arena-spot-stat-label">Skill Domains</span>
                </div>
                <div className="cl-arena-spot-stat-divider" />
                <div className="cl-arena-spot-stat">
                  <span className="cl-arena-spot-stat-num">Live IDE</span>
                  <span className="cl-arena-spot-stat-label">Instant Test</span>
                </div>
              </div>

              <Link
                to="/problems"
                id="home-arena-cta"
                className="cl-arena-spot-cta align-self-center align-self-lg-start"
              >
                Enter the Arena
                <FaArrowRight size={13} style={{ marginLeft: 4 }} />
              </Link>
            </div>

            {/* Animated Code Preview Terminal */}
            <div className="col-lg-6">
              <div className="cl-arena-terminal-preview">
                <div className="cl-terminal-titlebar">
                  <div className="cl-ide-dot close" />
                  <div className="cl-ide-dot minimize" />
                  <div className="cl-ide-dot maximize" />
                  <span className="cl-terminal-filename">solution.py</span>
                </div>
                <div className="cl-terminal-body">
                  <pre className="cl-terminal-code" aria-label="Code example">
                    <span className="ct-kw">def </span><span className="ct-fn">two_sum</span><span className="ct-op">(</span><span className="ct-arg">nums</span><span className="ct-op">, </span><span className="ct-arg">target</span><span className="ct-op">):</span>{`
`}    <span className="ct-cm"># O(N) hash-map solution</span>{`
`}    <span className="ct-kw">seen </span><span className="ct-op">= </span><span className="ct-op">{`{}`}</span>{`
`}    <span className="ct-kw">for </span><span className="ct-arg">i</span><span className="ct-op">, </span><span className="ct-arg">n </span><span className="ct-kw">in </span><span className="ct-fn">enumerate</span><span className="ct-op">(</span><span className="ct-arg">nums</span><span className="ct-op">):</span>{`
`}        <span className="ct-arg">diff </span><span className="ct-op">= </span><span className="ct-arg">target </span><span className="ct-op">- </span><span className="ct-arg">n</span>{`
`}        <span className="ct-kw">if </span><span className="ct-arg">diff </span><span className="ct-kw">in </span><span className="ct-arg">seen</span><span className="ct-op">:</span>{`
`}            <span className="ct-kw">return </span><span className="ct-op">[</span><span className="ct-arg">seen</span><span className="ct-op">[</span><span className="ct-arg">diff</span><span className="ct-op">], </span><span className="ct-arg">i</span><span className="ct-op">]</span>{`
`}        <span className="ct-arg">seen</span><span className="ct-op">[</span><span className="ct-arg">n</span><span className="ct-op">] = </span><span className="ct-arg">i</span>
                  </pre>
                  {/* Test results preview */}
                  <div className="cl-terminal-results">
                    <div className="cl-tr-header">
                      <FaTerminal size={11} style={{ color: 'var(--bs-primary)' }} />
                      <span>Test Results</span>
                      <span className="cl-tr-badge">2 / 2 Passed</span>
                    </div>
                    <div className="cl-tr-row pass">
                      <FaCheckCircle size={12} className="cl-tr-icon" />
                      <div className="cl-tr-detail">
                        <span className="cl-tr-label">Input:</span> two_sum([2,7,11,15], 9)
                        <span className="cl-tr-sep">→</span>
                        <span className="cl-tr-exp">Expected: [0, 1]</span>
                        <span className="cl-tr-act pass">Actual: [0, 1]</span>
                      </div>
                    </div>
                    <div className="cl-tr-row pass">
                      <FaCheckCircle size={12} className="cl-tr-icon" />
                      <div className="cl-tr-detail">
                        <span className="cl-tr-label">Input:</span> two_sum([3,2,4], 6)
                        <span className="cl-tr-sep">→</span>
                        <span className="cl-tr-exp">Expected: [1, 2]</span>
                        <span className="cl-tr-act pass">Actual: [1, 2]</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. CONTACT & SOCIAL HUB */}
      <ContactHub />

      {/* MINIMAL FOOTER */}
      <footer
        className="py-4 text-center border-top"
        style={{
          borderColor: 'var(--border-color, rgba(255,255,255,0.1))',
          background: 'var(--card-bg, transparent)',
        }}
      >
        <div className="container">
          <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            © {new Date().getFullYear()} Code<span style={{ color: 'var(--bs-primary, #15803D)' }}>Li</span>ft
          </p>
        </div>
      </footer>

      {/* Course Enrollment WhatsApp Modal */}
      {selectedCourseForEnroll && (
        <CourseEnrollModal
          course={selectedCourseForEnroll}
          show={Boolean(selectedCourseForEnroll)}
          onClose={() => setSelectedCourseForEnroll(null)}
        />
      )}

      {/* FLOATING WHATSAPP BUTTON */}
      <FloatingWhatsApp />
    </>
  );
}
