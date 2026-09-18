import React, { useState, useEffect } from 'react';
import { Navbar, Container, Button } from 'react-bootstrap';
import { Link, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ProfileDropdown from './ProfileDropdown';
import { ADMIN_NAV_ITEMS } from '../../config/navigation';
import { FaCode } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function Layout({
  items = ADMIN_NAV_ITEMS,
  title = 'CodeLift Admin',
  brandIcon = <FaCode className="brand-text" size={16} />,
  brandLink = '/admin/dashboard',
  children
}) {
  const hasItems = Array.isArray(items) && items.length > 0;

  // Single source of truth for sidebar open state
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 992);
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 992);

  // Monitor window resize to switch between desktop and mobile modes
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 992;
      setIsDesktop(desktop);
      if (desktop) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-body, #F8FAFC)' }}>

      {/* ── Top Navbar ── */}
      <Navbar className="navbar border-bottom sticky-top py-2 px-3 shadow-sm" style={{ zIndex: 1050 }}>
        <Container fluid className="px-md-3">
          <div className="d-flex align-items-center gap-2">
            <Navbar.Brand as={Link} to={brandLink} className="d-flex align-items-center gap-2 m-0 ms-1">
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
              <span className="brand-text fw-bold fs-5 d-flex align-items-center gap-2">
                {brandIcon && (
                  <span
                    className="p-1.5 rounded-3 border d-inline-flex align-items-center justify-content-center"
                    style={{ backgroundColor: 'rgba(var(--bs-primary-rgb), 0.1)' }}
                  >
                    {brandIcon}
                  </span>
                )}
                <span>{title}</span>
              </span>
            </Navbar.Brand>

            {/* Mobile-only toggle button so mobile users can open the offscreen drawer */}
            {hasItems && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setIsSidebarOpen((open) => !open)}
                className="d-lg-none d-flex align-items-center justify-content-center p-1 px-2 border rounded-2"
                title={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                style={{ width: '44px', height: '44px' }}
              >
                {isSidebarOpen ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
              </Button>
            )}
          </div>

          {/* Right side controls */}
          <div className="d-flex align-items-center gap-2">
            <ProfileDropdown />
          </div>
        </Container>
      </Navbar>

      {/* ── Body Layout ── */}
      <div className="d-flex flex-grow-1 position-relative" style={{ minHeight: 'calc(100vh - 57px)' }}>
        {/* Reusable Sidebar: only rendered if the page has sidebar items */}
        {hasItems && (
          <Sidebar
            items={items}
            title={title}
            brandIcon={brandIcon}
            isOpen={isSidebarOpen}
            onToggle={setIsSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            isDesktop={isDesktop}
          />
        )}

        {/* ── Main content pane ── */}
        <main
          className="flex-grow-1 px-3 px-md-4 pt-2 pt-md-3 pb-4"
          style={{
            maxWidth: '100%',
            overflowX: 'clip',
            minWidth: 0
          }}
        >
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
