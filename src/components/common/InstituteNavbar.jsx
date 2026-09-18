import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaGraduationCap, FaUserGraduate } from 'react-icons/fa';
import { FiMenu, FiX } from 'react-icons/fi';

export default function InstituteNavbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [expanded,  setExpanded]  = useState(false);
  const [activeSec, setActiveSec] = useState('hero');
  const { pathname } = useLocation();

  /* ── Scroll & intersection tracking ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = ['hero', 'courses', 'contact'];
    const observers = sections.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSec(id); },
        { rootMargin: '-40% 0px -55% 0px' }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  const scrollToSection = (id) => {
    setExpanded(false);
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const navLinks = [
    { label: 'Home',    id: 'hero' },
    { label: 'Courses', id: 'courses' },
    { label: 'Contact', id: 'contact' },
  ];

  return (
    <nav className={`cl-navbar navbar navbar-expand-lg fixed-top py-2 ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        {/* Brand */}
        <Link to="/" className="navbar-brand cl-nav-brand d-flex align-items-center gap-2" onClick={() => setExpanded(false)}>
          <img
            src={`${import.meta.env.BASE_URL}logo.jpg`}
            alt="CodeLift"
            className="brand-logo"
            width={36}
            height={36}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="fw-bold fs-5 d-flex align-items-center">
            <span style={{ color: 'var(--text-primary)' }}>Code</span>
            <span className="cl-nav-brand-accent" style={{ color: 'var(--bs-primary)' }}>Li</span>
            <span style={{ color: 'var(--text-primary)' }}>ft</span>
          </span>
        </Link>

        {/* Hamburger */}
        <button
          className="navbar-toggler border-0 shadow-none d-lg-none d-flex align-items-center justify-content-center p-1"
          type="button"
          aria-expanded={expanded}
          aria-label="Toggle navigation"
          onClick={() => setExpanded(!expanded)}
          style={{ fontSize: '1.25rem', color: 'var(--bs-primary)' }}
        >
          {expanded ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        {/* Nav Links */}
        <div className={`collapse navbar-collapse ${expanded ? 'show' : ''}`}>
          <ul className="navbar-nav mx-auto gap-1">
            {navLinks.map(({ label, id }) => (
              <li className="nav-item" key={id}>
                <button
                  className={`nav-link cl-nav-link btn btn-link border-0 shadow-none ${activeSec === id ? 'active' : ''}`}
                  onClick={() => scrollToSection(id)}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>

          {/* Right Action: Student Portal */}
          <div className="d-flex gap-2 align-items-center mt-2 mt-lg-0">
            <Link
              to="/login"
              className="cl-nav-portal-btn"
              onClick={() => setExpanded(false)}
            >
              <FaUserGraduate style={{ fontSize: '0.78rem' }} />
              Student Portal
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
