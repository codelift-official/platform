import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { FiUser, FiLogOut, FiSettings, FiChevronDown } from 'react-icons/fi';
import { FaPalette } from 'react-icons/fa';

export default function ProfileDropdown() {
  const { auth, currentUser, logout, isAdmin } = useAuth();
  const { students } = useData();
  const navigate = useNavigate();

  // If student, get live student record from DataContext so updates reflect immediately
  const liveStudent = !isAdmin && auth?.studentId && Array.isArray(students)
    ? students.find(s => s?.id === auth.studentId)
    : null;

  const displayName = isAdmin
    ? 'Administrator'
    : (liveStudent?.name || currentUser?.name || auth?.studentName || 'Student');

  const displayEmail = isAdmin
    ? 'admin@codelift.dev'
    : (liveStudent?.email || currentUser?.email || auth?.email || 'student@codelift.dev');

  const initials = String(displayName || 'U')
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  const editProfilePath = isAdmin ? '/admin/profile' : '/student/profile';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Dropdown align="end">
      <Dropdown.Toggle
        as="button"
        id="profile-dropdown-toggle"
        className="btn d-flex align-items-center gap-2 p-1 px-2 border rounded-pill shadow-sm"
        style={{
          background: 'var(--card-bg)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        {/* Avatar Circle */}
        <div
          className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
          style={{
            width: 32,
            height: 32,
            background: isAdmin ? 'var(--cl-green, #15803D)' : 'var(--bs-primary)',
            color: '#ffffff',
            fontSize: '0.8rem',
            flexShrink: 0
          }}
        >
          {initials}
        </div>

        {/* User First Name */}
        <span
          className="d-none d-md-inline small fw-semibold text-truncate"
          style={{ maxWidth: 120, color: 'var(--text-primary)' }}
        >
          {String(displayName || 'User').split(' ')[0]}
        </span>

      </Dropdown.Toggle>

      <Dropdown.Menu
        className="shadow-lg border py-2"
        style={{
          background: 'var(--card-bg)',
          borderColor: 'var(--border-color)',
          minWidth: 230,
          borderRadius: 12,
          zIndex: 1100
        }}
      >
        {/* User Info Header */}
        <div className="px-3 py-2 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
          <div className="fw-bold small text-truncate" style={{ color: 'var(--text-primary)' }}>
            {displayName}
          </div>
          <span
            className="badge mt-1 text-uppercase"
            style={{
              fontSize: '0.65rem',
              letterSpacing: '0.5px',
              backgroundColor: isAdmin ? 'rgba(21, 128, 61, 0.15)' : 'rgba(var(--bs-primary-rgb), 0.15)',
              color: isAdmin ? '#15803D' : 'var(--bs-primary)'
            }}
          >
            {isAdmin ? 'Administrator' : 'Student'}
          </span>
        </div>

        {/* Edit Profile Link */}
        <Dropdown.Item
          as={Link}
          to={editProfilePath}
          className="d-flex align-items-center gap-2 py-2 small fw-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          <FiUser size={15} style={{ color: 'var(--bs-primary)' }} />
          <span>Edit Profile</span>
        </Dropdown.Item>

        {/* Theme & Appearance (Available to both Admin and Student) */}
        <Dropdown.Item
          as={Link}
          to={isAdmin ? '/admin/appearance' : '/student/appearance'}
          className="d-flex align-items-center gap-2 py-2 small fw-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          <FaPalette size={14} style={{ color: 'var(--bs-primary)' }} />
          <span>Theme & Appearance</span>
        </Dropdown.Item>

        <Dropdown.Divider style={{ borderColor: 'var(--border-color)' }} />

        {/* Logout */}
        <Dropdown.Item
          onClick={handleLogout}
          className="d-flex align-items-center gap-2 py-2 small fw-semibold text-danger"
        >
          <FiLogOut size={15} />
          <span>Logout</span>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}
