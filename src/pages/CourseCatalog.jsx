import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import Navbar from '../components/common/Navbar';
import SEO from '../components/common/SEO';
import CourseEnrollModal from '../components/common/CourseEnrollModal';
import CourseTechThumbnail from '../components/common/CourseTechThumbnail';
import PageLoader from '../components/common/PageLoader';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { resolveCourseFee } from '../utils/feeUtils';
import {
  FaSearch,
  FaStar,
  FaBookOpen,
  FaGraduationCap,
  FaWhatsapp,
  FaTimes,
  FaArrowRight
} from 'react-icons/fa';
import './CourseCatalog.css';

export default function CourseCatalog() {
  const { courses, categories, batches, isHydrated, isLoading } = useData();
  const isDataLoading = (!isHydrated && isSupabaseConfigured) || (isLoading && isSupabaseConfigured);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all'); // all, free, paid
  const [selectedCourseType, setSelectedCourseType] = useState('all'); // all, cohort, elective
  const [sortBy, setSortBy] = useState('popular'); // popular, rating, price-low, price-high, newest
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState(null);

  // Filter courses
  const filteredCourses = (courses || []).filter((c) => {
    if (!c.isPublished || c.isApproved === false) return false;

    // Course type filter (Cohort vs Elective)
    if (selectedCourseType !== 'all') {
      const type = c.courseType || (c.isCohort ? 'cohort' : 'elective');
      if (type !== selectedCourseType) return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && c.categoryId !== selectedCategory) return false;

    // Price filter
    if (selectedType !== 'all') {
      const feeInfo = resolveCourseFee(c, batches);
      if (selectedType === 'free' && !feeInfo.isFree) return false;
      if (selectedType === 'paid' && feeInfo.isFree) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (c.title || '').toLowerCase().includes(q);
      const matchDesc = (c.description || '').toLowerCase().includes(q);
      const matchCategory = (c.categoryId || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCategory) return false;
    }

    return true;
  });

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'price-low') {
      return resolveCourseFee(a, batches).feeAmount - resolveCourseFee(b, batches).feeAmount;
    }
    if (sortBy === 'price-high') {
      return resolveCourseFee(b, batches).feeAmount - resolveCourseFee(a, batches).feeAmount;
    }
    if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    return (b.rating || 0) - (a.rating || 0); // top rated default
  });

  const allPublished = (courses || []).filter(c => c.isPublished && c.isApproved !== false);
  const cohortCount = allPublished.filter(c => c.courseType === 'cohort' || c.isCohort).length;
  const electiveCount = allPublished.filter(c => c.courseType !== 'cohort' && !c.isCohort).length;

  return (
    <div className="cl-marketplace-page">
      <SEO
        title="Curricula & Course Marketplace"
        description="Browse high-impact cohort bootcamps and specialized modular electives in Full Stack Web, Python, Data Analytics, and Software Engineering."
      />
      <Navbar />

      {/* Hero Header with Top-Notch Search Bar */}
      <section className="cl-marketplace-hero text-center">
        <div className="container max-w-7xl">
          <span className="cl-marketplace-badge">
            <span className="live-dot" /> Explore Curriculum Marketplace
          </span>

          <h1 className="cl-marketplace-title">
            Master High-Demand Software Skills
          </h1>

          {/* Top-Notch Floating Glassmorphic Search Bar */}
          <div className="cl-marketplace-search-container mx-auto">
            <div className="cl-marketplace-search-box">
              <div className="cl-marketplace-search-icon">
                <FaSearch size={18} />
              </div>
              <input
                type="text"
                className="cl-marketplace-search-input"
                placeholder="Search courses, technologies, DSA, Python, React, Data..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="cl-marketplace-search-clear"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  <FaTimes size={12} />
                </button>
              )}
              <span className="cl-marketplace-search-count d-none d-md-inline-flex">
                {sortedCourses.length} {sortedCourses.length === 1 ? 'course' : 'courses'}
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* Main Filter Toolbar & Course Grid */}
      <main className="container max-w-7xl py-3">
        {/* Course Cards Grid */}
        {isDataLoading ? (
          <PageLoader
            title="Loading Course Catalog..."
            message="Fetching verified courses, tracks, and live cohort schedules..."
          />
        ) : sortedCourses.length === 0 ? (
          <div className="text-center py-5 rounded-4 shadow-sm border" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
            <FaBookOpen className="text-muted fs-1 mb-3 opacity-50" />
            <h5 className="fw-bold" style={{ color: 'var(--text-primary)' }}>No matching courses found</h5>
            <p className="text-muted small mb-1">Try adjusting your keyword, resetting filters, or browsing our full list of courses.</p>
            <button
              type="button"
              className="btn btn-sm btn-success rounded-pill px-4 fw-bold"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedType('all');
                setSelectedCourseType('all');
              }}
            >
              Show All Courses
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {sortedCourses.map((c) => {
              const feeInfo = resolveCourseFee(c, batches);
              return (
                <div key={c.id} className="col-md-6 col-lg-4">
                  <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden cl-course-card">
                    {/* Technology Thumbnail & Badges */}
                    <div className="position-relative">
                      <CourseTechThumbnail
                        course={c}
                        category={categories?.find((cat) => cat.id === c.categoryId)}
                        height={190}
                      />
                      <div className="position-absolute top-0 start-0 m-3" style={{ zIndex: 3 }}>
                        <span
                          className="badge rounded-pill px-2.5 py-1.5 fw-semibold shadow-sm"
                          style={{
                            background: c.courseType === 'cohort' ? 'rgba(15, 23, 42, 0.85)' : 'rgba(21, 128, 61, 0.85)',
                            color: '#ffffff',
                            backdropFilter: 'blur(6px)',
                            WebkitBackdropFilter: 'blur(6px)',
                            fontSize: '0.72rem'
                          }}
                        >
                          {c.courseType === 'cohort' ? 'Cohort Program' : 'Elective Module'}
                        </span>
                      </div>
                      <span
                        className={`position-absolute top-0 end-0 m-3 badge rounded-pill px-3 py-1.5 font-bold shadow-sm ${feeInfo.isFree ? 'bg-success' : 'bg-primary'
                          }`}
                        style={{ fontSize: '0.75rem', zIndex: 3 }}
                      >
                        {feeInfo.feeFormatted}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="card-body p-4 d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span
                            className="badge rounded-pill px-2.5 py-1 fw-semibold"
                            style={{
                              background: 'var(--card-bg-alt, rgba(34, 197, 94, 0.12))',
                              color: 'var(--bs-primary)',
                              fontSize: '0.72rem'
                            }}
                          >
                            {c.categoryId?.replace('cat-', '').toUpperCase() || 'COURSE'}
                          </span>
                          <div className="d-flex align-items-center gap-1 text-warning fw-bold small" style={{ fontSize: '0.8rem' }}>
                            <FaStar /> {c.rating || 5.0}
                          </div>
                        </div>

                        <h5 className="card-title fw-bold mb-1" style={{ fontSize: '1.1rem' }}>
                          <Link to={`/courses/${c.slug || c.id}`} className="text-decoration-none" style={{ color: 'var(--text-primary)' }}>
                            {c.title}
                          </Link>
                        </h5>
                        <p className="card-text text-secondary small line-clamp-2" style={{ minHeight: '38px' }}>
                          {c.description}
                        </p>
                      </div>

                      <div>
                        <hr className="my-3 opacity-25" style={{ borderColor: 'var(--border-color)' }} />
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                            style={{
                              width: 28,
                              height: 28,
                              fontSize: '0.8rem',
                              background: 'rgba(var(--bs-primary-rgb, 21, 128, 61), 0.15)',
                              color: 'var(--bs-primary)'
                            }}
                          >
                            <FaGraduationCap size={13} />
                          </div>
                          <span className="small fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                            CodeLift Faculty
                          </span>
                        </div>

                        {/* Action Buttons: View Details & Direct WhatsApp Enrollment */}
                        <div className="d-flex gap-2">
                          <Link
                            to={`/courses/${c.slug || c.id}`}
                            className="btn btn-outline-success flex-grow-1 rounded-pill fw-bold btn-sm py-2 d-inline-flex align-items-center justify-content-center"
                            style={{ fontSize: '0.84rem', minHeight: '44px' }}
                          >
                            View Details
                          </Link>
                          <button
                            type="button"
                            className="btn btn-success rounded-pill fw-bold btn-sm px-3 py-2 d-inline-flex align-items-center justify-content-center gap-1.5 flex-shrink-0"
                            style={{
                              background: '#25D366',
                              borderColor: '#25D366',
                              color: '#ffffff',
                              fontSize: '0.84rem',
                              minHeight: '44px'
                            }}
                            onClick={() => setSelectedCourseForEnroll({ ...c, price: feeInfo.feeAmount, originalPrice: feeInfo.originalPrice, isFree: feeInfo.isFree })}
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
      </main>

      {/* Course Enrollment WhatsApp Modal */}
      {selectedCourseForEnroll && (
        <CourseEnrollModal
          course={selectedCourseForEnroll}
          show={Boolean(selectedCourseForEnroll)}
          onClose={() => setSelectedCourseForEnroll(null)}
        />
      )}
    </div>
  );
}
