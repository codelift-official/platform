import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button, Modal, Form, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FiChevronLeft, FiChevronRight, FiX, FiLock } from 'react-icons/fi';
import { ADMIN_NAV_ITEMS, STUDENT_NAV_ITEMS } from '../../config/navigation';
import { useAuth } from '../../contexts/AuthContext';
import BrandVersionBadge from './BrandVersionBadge';
import { supabase } from '../../services/supabaseClient';
import toast from 'react-hot-toast';

// Re-export navigation configs for backward compatibility
export { ADMIN_NAV_ITEMS, STUDENT_NAV_ITEMS };

/**
 * Reusable, responsive Sidebar component
 * Features:
 * 1. Open and close toggle button is located INSIDE the sidebar.
 * 2. When collapsed, menu icons remain visible and clickable to navigate to their respective pages.
 * 3. Works seamlessly for both Admin and Student portals.
 * 4. Active item selection is preserved across collapse and expand.
 * 5. Mobile overlay drawer automatically closes upon item selection.
 * 6. Completely decoupled from page-specific content or business logic.
 */
export default function Sidebar({
  items,
  isOpen: controlledIsOpen,
  onToggle,
  onClose,
  onItemClick,
  title = '',
  brandIcon = null,
  collapsedWidth = 68,
  expandedWidth = 260,
  isDesktop: controlledIsDesktop,
  className = '',
  style = {}
}) {
  const navigate = useNavigate();
  const { auth, currentUser } = useAuth();

  // Fees password prompt state
  const [showFeesModal, setShowFeesModal] = useState(false);
  const [feesPassword, setFeesPassword] = useState('');
  const [isVerifyingFees, setIsVerifyingFees] = useState(false);
  const [feesError, setFeesError] = useState('');
  const [pendingFeesItem, setPendingFeesItem] = useState(null);

  const FEES_TIMEOUT_MS = 15 * 60 * 1000; // 15-minute cache

  const isFeesUnlocked = () => {
    try {
      const timestamp = sessionStorage.getItem('fees_unlocked');
      if (!timestamp) return false;
      const elapsed = Date.now() - parseInt(timestamp, 10);
      return elapsed < FEES_TIMEOUT_MS;
    } catch {
      return false;
    }
  };

  const handleVerifyFeesPassword = async (e) => {
    e.preventDefault();
    if (!feesPassword) return;

    setIsVerifyingFees(true);
    setFeesError('');

    try {
      const email = auth?.email || currentUser?.email || 'codelift.official@gmail.com';
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: feesPassword
      });

      if (error) {
        throw new Error('Incorrect administrator password.');
      }

      sessionStorage.setItem('fees_unlocked', Date.now().toString());
      setShowFeesModal(false);
      setFeesPassword('');
      toast.success('Fee records unlocked for 15 minutes.');

      const target = pendingFeesItem?.to || pendingFeesItem?.route || '/admin/fees';
      navigate(target);
    } catch (err) {
      setFeesError(err.message || 'Authentication failed.');
    } finally {
      setIsVerifyingFees(false);
    }
  };

  // If a page has no sidebar items, do not render the sidebar
  if (!items || items.length === 0) {
    return null;
  }

  // Internal responsive state fallback if isDesktop is not controlled
  const [internalIsDesktop, setInternalIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 992
  );

  useEffect(() => {
    if (typeof controlledIsDesktop === 'boolean') return;

    const handleResize = () => {
      setInternalIsDesktop(window.innerWidth >= 992);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [controlledIsDesktop]);

  const isDesktop = typeof controlledIsDesktop === 'boolean' ? controlledIsDesktop : internalIsDesktop;

  // Uncontrolled vs controlled open state
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const isOpen = typeof controlledIsOpen === 'boolean' ? controlledIsOpen : internalIsOpen;

  const handleToggle = () => {
    if (onToggle) {
      onToggle((prev) => !prev);
    } else {
      setInternalIsOpen((prev) => !prev);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (onToggle) {
      onToggle(false);
    } else {
      setInternalIsOpen(false);
    }
  };

  const handleItemSelect = (item, e) => {
    const targetPath = item.to || item.route || item.path || '';
    const isAdmin = auth?.role === 'admin' || auth?.isAdmin;

    // Only prompt for admin fees, never for students
    if (isAdmin && (targetPath === '/admin/fees' || targetPath.includes('/admin/fees'))) {
      if (!isFeesUnlocked()) {
        if (e && e.preventDefault) e.preventDefault();
        setPendingFeesItem(item);
        setFeesError('');
        setFeesPassword('');
        setShowFeesModal(true);
        return;
      }
    }

    if (item.onClick) {
      item.onClick(e);
    }
    if (onItemClick) {
      onItemClick(item, e);
    }
    // On mobile, selecting an item automatically closes the sidebar
    if (!isDesktop) {
      handleClose();
    }
  };

  const cWidth = typeof collapsedWidth === 'number' ? `${collapsedWidth}px` : collapsedWidth;
  const eWidth = typeof expandedWidth === 'number' ? `${expandedWidth}px` : expandedWidth;

  const renderFeesModal = () => (
    <Modal
      show={showFeesModal}
      onHide={() => setShowFeesModal(false)}
      centered
      contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
    >
      <Modal.Header closeButton style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
        <Modal.Title className="fs-5 fw-bold d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <FiLock className="text-warning" />
          <span>Restricted Financial Section</span>
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleVerifyFeesPassword}>
        <Modal.Body className="p-4" style={{ background: 'var(--card-bg)' }}>
          {feesError && (
            <Alert variant="danger" className="py-2.5 px-3 small mb-3">
              {feesError}
            </Alert>
          )}
          <Form.Group>
            <Form.Label className="small fw-semibold" style={{ color: 'var(--text-primary)' }}>
              Administrator Password
            </Form.Label>
            <Form.Control
              type="password"
              autoFocus
              required
              placeholder="Enter admin password to unlock"
              value={feesPassword}
              onChange={(e) => setFeesPassword(e.target.value)}
              disabled={isVerifyingFees}
              style={{ background: 'var(--bg-body)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
          <Button variant="secondary" size="sm" onClick={() => setShowFeesModal(false)}>
            Cancel
          </Button>
          <Button
            variant="success"
            size="sm"
            type="submit"
            disabled={isVerifyingFees}
            className="fw-semibold px-3"
          >
            {isVerifyingFees ? 'Verifying...' : 'Unlock Fees'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );

  /* ─────────────────────────────────────────────────────────────
     1. DESKTOP MODE (>= 992px)
     - Open/close toggle button is inside the sidebar header.
     - Expanded: full width (260px) with icons, labels, badges, and collapse button.
     - Collapsed: narrow strip (68px) with expand button at top, and ALL menu
       icons visible below it, clickable to navigate to their respective pages.
     - Active item is clearly preserved and highlighted in both states.
  ────────────────────────────────────────────────────────────── */
  if (isDesktop) {
    return (
      <>
        <aside
          className={`sidebar d-none d-lg-flex flex-column flex-shrink-0 border-end ${className}`}
          style={{
            width: isOpen ? eWidth : cWidth,
            transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            backgroundColor: 'var(--card-bg, #ffffff)',
            borderColor: 'var(--border-color, #e5e7eb)',
            overflowX: 'hidden',
            position: 'sticky',
            top: '57px',
            height: 'calc(100vh - 57px)',
            alignSelf: 'flex-start',
            boxSizing: 'border-box',
            zIndex: 100,
            ...style
          }}
          aria-label={title || 'Sidebar Navigation'}
        >
          {/* ── COLLAPSED DESKTOP STATE ── */}
          {!isOpen ? (
            <div
              className="d-flex flex-column align-items-center h-100 w-100"
              style={{ width: cWidth }}
            >
              {/* Expand Toggle Button inside the sidebar */}
              <div
                className="d-flex align-items-center justify-content-center w-100 border-bottom flex-shrink-0"
                style={{
                  height: '56px',
                  borderColor: 'var(--border-color, #e5e7eb)'
                }}
              >
                <OverlayTrigger
                  placement="right"
                  delay={{ show: 200, hide: 50 }}
                  overlay={<Tooltip id="tooltip-expand-sidebar">Expand sidebar</Tooltip>}
                >
                  <button
                    type="button"
                    onClick={handleToggle}
                    className="sidebar-toggle-btn"
                    aria-label="Expand sidebar"
                    style={{ width: '34px', height: '34px' }}
                  >
                    <FiChevronRight size={16} />
                  </button>
                </OverlayTrigger>
              </div>

              {/* Menu Icons Visible & Clickable in Collapsed State with Sleek Tooltips */}
              <nav className="sidebar-collapsed-nav d-flex flex-column align-items-center gap-2 py-3 flex-grow-1 w-100" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
                {items.map((item, index) => {
                  const targetPath = item.to || item.route;
                  const itemKey = item.id || targetPath || `collapsed-nav-${index}`;
                  const iconElement = typeof item.icon === 'function' ? React.createElement(item.icon) : item.icon;

                  if (targetPath) {
                    return (
                      <OverlayTrigger
                        key={itemKey}
                        placement="right"
                        delay={{ show: 100, hide: 50 }}
                        overlay={<Tooltip id={`tooltip-${itemKey}`}>{item.label}</Tooltip>}
                      >
                        <NavLink
                          to={targetPath}
                          onClick={(e) => handleItemSelect(item, e)}
                          className={({ isActive }) =>
                            `sidebar-nav-item sidebar-collapsed-item d-flex align-items-center justify-content-center transition-all ${isActive ? 'active' : ''}`
                          }
                          style={{
                            width: '42px',
                            height: '42px',
                            fontSize: '1.2rem',
                            flexShrink: 0
                          }}
                        >
                          <span className="d-inline-flex align-items-center justify-content-center">
                            {iconElement}
                          </span>
                          {item.badge && (
                            <span
                              className="position-absolute top-0 end-0 translate-middle p-1 bg-danger border border-light rounded-circle"
                              style={{ width: '8px', height: '8px', marginTop: '6px', marginRight: '6px' }}
                            />
                          )}
                        </NavLink>
                      </OverlayTrigger>
                    );
                  }

                  const isItemActive = Boolean(item.isActive);
                  return (
                    <OverlayTrigger
                      key={itemKey}
                      placement="right"
                      delay={{ show: 100, hide: 50 }}
                      overlay={<Tooltip id={`tooltip-${itemKey}`}>{item.label}</Tooltip>}
                    >
                      <button
                        type="button"
                        onClick={(e) => handleItemSelect(item, e)}
                        className={`sidebar-nav-item sidebar-collapsed-item btn d-flex align-items-center justify-content-center border-0 p-0 transition-all ${isItemActive ? 'active' : ''}`}
                        style={{
                          width: '42px',
                          height: '42px',
                          fontSize: '1.2rem',
                          flexShrink: 0
                        }}
                      >
                        <span className="d-inline-flex align-items-center justify-content-center">
                          {iconElement}
                        </span>
                        {item.badge && (
                          <span
                            className="position-absolute top-0 end-0 translate-middle p-1 bg-danger border border-light rounded-circle"
                            style={{ width: '8px', height: '8px', marginTop: '6px', marginRight: '6px' }}
                          />
                        )}
                      </button>
                    </OverlayTrigger>
                  );
                })}
              </nav>
            </div>
          ) : (
            /* ── EXPANDED DESKTOP STATE ── */
            <div
              className="d-flex flex-column h-100"
              style={{ width: eWidth, minWidth: eWidth }}
            >
              {/* Sidebar Header with Collapse Button inside the sidebar */}
              <div
                className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom flex-shrink-0"
                style={{
                  height: '56px',
                  borderColor: 'var(--border-color, #e5e7eb)'
                }}
              >
                <span
                  className="small fw-bold text-uppercase text-secondary tracking-wider"
                  style={{ fontSize: '0.78rem', letterSpacing: '0.05em' }}
                >
                  Navigation
                </span>

                {/* Collapse Toggle Button inside the sidebar */}
                <OverlayTrigger
                  placement="right"
                  delay={{ show: 200, hide: 50 }}
                  overlay={<Tooltip id="tooltip-collapse-sidebar">Collapse sidebar</Tooltip>}
                >
                  <button
                    type="button"
                    onClick={handleToggle}
                    className="sidebar-toggle-btn"
                    aria-label="Collapse sidebar"
                    style={{ width: '32px', height: '32px' }}
                  >
                    <FiChevronLeft size={16} />
                  </button>
                </OverlayTrigger>
              </div>

              {/* Navigation Items (Icons + Labels, Selected item preserved) */}
              <nav className="d-flex flex-column gap-1 p-2 flex-grow-1 overflow-y-auto">
                {items.map((item, index) => {
                  const targetPath = item.to || item.route;
                  const itemKey = item.id || targetPath || `expanded-nav-${index}`;
                  const iconElement = typeof item.icon === 'function' ? React.createElement(item.icon) : item.icon;

                  if (targetPath) {
                    return (
                      <NavLink
                        key={itemKey}
                        to={targetPath}
                        onClick={(e) => handleItemSelect(item, e)}
                        className={({ isActive }) =>
                          `sidebar-nav-item nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 fw-semibold transition-all ${isActive ? 'active' : ''}`
                        }
                      >
                        {iconElement && (
                          <span className="d-inline-flex align-items-center flex-shrink-0 fs-5">
                            {iconElement}
                          </span>
                        )}
                        <span className="text-truncate flex-grow-1">{item.label}</span>
                        {item.badge && (
                          <span className="badge rounded-pill ms-auto" style={{ background: 'var(--card-bg-alt, rgba(255,255,255,0.08))', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  }

                  const isItemActive = Boolean(item.isActive);
                  return (
                    <button
                      key={itemKey}
                      type="button"
                      onClick={(e) => handleItemSelect(item, e)}
                      className={`sidebar-nav-item btn d-flex align-items-center gap-3 px-3 py-2 rounded-3 fw-semibold border-0 text-start w-100 transition-all ${isItemActive ? 'active' : ''}`}
                    >
                      {iconElement && (
                        <span className="d-inline-flex align-items-center flex-shrink-0 fs-5">
                          {iconElement}
                        </span>
                      )}
                      <span className="text-truncate flex-grow-1">{item.label}</span>
                      {item.badge && (
                        <span className="badge rounded-pill ms-auto" style={{ background: 'var(--card-bg-alt, rgba(255,255,255,0.08))', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
              <div className="p-2 border-top text-center mt-auto flex-shrink-0" style={{ borderColor: 'var(--border-color)' }}>
                <BrandVersionBadge />
              </div>
            </div>
          )}
        </aside>
        {renderFeesModal()}
      </>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     2. MOBILE / TABLET MODE (< 992px)
     - Slide-in Drawer with Backdrop
     - Automatically closes when any item is selected
  ────────────────────────────────────────────────────────────── */
  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100 d-lg-none"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1060,
          backdropFilter: 'blur(3px)'
        }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`sidebar sidebar-drawer position-fixed top-0 start-0 h-100 shadow-lg d-flex flex-column d-lg-none ${className}`}
        style={{
          width: eWidth,
          maxWidth: '85vw',
          zIndex: 1070,
          backgroundColor: 'var(--card-bg, #ffffff)',
          borderRight: '1px solid var(--border-color, #e5e7eb)',
          overflowY: 'auto',
          ...style
        }}
        aria-label={title || 'Mobile Sidebar Navigation'}
      >
        {/* Mobile Header with Close Button inside the sidebar */}
        <div
          className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom flex-shrink-0"
          style={{ borderColor: 'var(--border-color, #e5e7eb)' }}
        >
          <div className="d-flex align-items-center gap-2 text-truncate me-2">
            {brandIcon && (
              <span
                className="p-1.5 rounded-2 d-inline-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  backgroundColor: 'rgba(var(--bs-primary-rgb), 0.1)',
                  color: 'var(--bs-primary)'
                }}
              >
                {brandIcon}
              </span>
            )}
            <span
              className="fw-bold text-truncate"
              style={{ fontSize: '1rem', color: 'var(--text-primary, #171717)' }}
            >
              {title || 'Navigation'}
            </span>
          </div>

          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleClose}
            className="d-flex align-items-center justify-content-center p-1 border rounded-2"
            title="Close sidebar"
            aria-label="Close sidebar"
            style={{ width: '44px', height: '44px' }}
          >
            <FiX size={20} />
          </Button>
        </div>

        {/* Navigation Items (Auto-close on click) */}
        <nav className="d-flex flex-column gap-1 p-3 flex-grow-1 overflow-y-auto">
          {items.map((item, index) => {
            const targetPath = item.to || item.route;
            const itemKey = item.id || targetPath || `mobile-nav-item-${index}`;
            const iconElement = typeof item.icon === 'function' ? React.createElement(item.icon) : item.icon;

            if (targetPath) {
              return (
                <NavLink
                  key={itemKey}
                  to={targetPath}
                  onClick={(e) => handleItemSelect(item, e)}
                  className={({ isActive }) =>
                    `sidebar-nav-item nav-link d-flex align-items-center gap-3 px-3 py-2.5 rounded-3 fw-semibold transition-all ${isActive ? 'active' : ''}`
                  }
                >
                  {iconElement && (
                    <span className="d-inline-flex align-items-center flex-shrink-0 fs-5">
                      {iconElement}
                    </span>
                  )}
                  <span className="text-truncate flex-grow-1">{item.label}</span>
                  {item.badge && (
                    <span className="badge rounded-pill ms-auto" style={{ background: 'var(--card-bg-alt, rgba(255,255,255,0.08))', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            }

            const isItemActive = Boolean(item.isActive);
            return (
              <button
                key={itemKey}
                type="button"
                onClick={(e) => handleItemSelect(item, e)}
                className={`sidebar-nav-item btn d-flex align-items-center gap-3 px-3 py-2.5 rounded-3 fw-semibold border-0 text-start w-100 transition-all ${isItemActive ? 'active' : ''}`}
              >
                {iconElement && (
                  <span className="d-inline-flex align-items-center flex-shrink-0 fs-5">
                    {iconElement}
                  </span>
                )}
                <span className="text-truncate flex-grow-1">{item.label}</span>
                {item.badge && (
                  <span className="badge rounded-pill ms-auto" style={{ background: 'var(--card-bg-alt, rgba(255,255,255,0.08))', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="p-2 border-top text-center mt-auto flex-shrink-0" style={{ borderColor: 'var(--border-color)' }}>
          <BrandVersionBadge />
        </div>
      </aside>
      {renderFeesModal()}
    </>
  );
}
