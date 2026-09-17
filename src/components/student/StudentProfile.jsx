import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { supabase } from '../../services/supabaseClient';
import toast from 'react-hot-toast';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiSave,
  FiX,
  FiCheckCircle,
  FiBook,
  FiAward,
  FiCalendar,
  FiShield,
  FiKey,
  FiLock,
  FiCheck
} from 'react-icons/fi';

export default function StudentProfile() {
  const { auth, updateAuthUser } = useAuth();
  const { students, batches, courses, assignments, submissions, certificates, updateStudent } = useData();
  const navigate = useNavigate();

  const student = Array.isArray(students) ? students.find(s => s?.id === auth?.studentId) : null;
  const batch = Array.isArray(batches) ? batches.find(b => b?.id === student?.batchId) : null;

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (student) {
      setName(student.name || '');
      setEmail(student.email || '');
      setPhone(student.phone || '');
    }
  }, [student]);

  if (!student) {
    return (
      <div className="text-center py-5" style={{ color: 'var(--text-secondary)' }}>
        <p>Student profile not found.</p>
        <Button variant="primary" size="sm" onClick={() => navigate('/student/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  // Academic stats
  const completedTopicsCount = Object.values(student.progress || {}).filter(v => v === 'completed').length;
  const studentSubmissions = Array.isArray(submissions) ? submissions.filter(s => s?.studentId === student.id) : [];
  const studentCerts = Array.isArray(certificates) ? certificates.filter(c => c?.studentId === student.id) : [];

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Full Name is required';
    if (!email.trim()) newErrors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    const updates = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim()
    };

    // Update in DataContext
    updateStudent(student.id, updates);

    // Update in AuthContext
    updateAuthUser(updates);

    setTimeout(() => {
      setIsSaving(false);
      toast.success('Profile updated successfully.');
    }, 200);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (!currentPassword) {
      setPasswordMsg({ type: 'danger', text: 'Please enter your current password.' });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({ type: 'danger', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'danger', text: 'New passwords do not match.' });
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error: verifyErr } = await supabase.auth.signInWithPassword({
        email: student.email,
        password: currentPassword
      });

      if (verifyErr) {
        throw new Error('Current password is incorrect.');
      }

      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateErr) throw updateErr;

      toast.success('Password changed successfully.');
      setPasswordMsg({ type: 'success', text: 'Password successfully updated!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('[StudentProfile] Password update failed:', err);
      setPasswordMsg({ type: 'danger', text: err.message || 'Failed to update password.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCancel = () => {
    navigate('/student/dashboard');
  };

  const initials = String(name || student?.name || 'ST')
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'ST';

  return (
    <div className="w-100" style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* ── Page Header ── */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            My Profile
          </h3>
          <p className="text-muted small mb-0">
            Manage your personal information, contact credentials, and view your academic enrollment.
          </p>
        </div>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={handleCancel}
          className="d-flex align-items-center gap-1.5 rounded-pill px-3"
        >
          <FiX size={14} />
          <span>Back to Dashboard</span>
        </Button>
      </div>

      <Row className="g-4">
        {/* ── Left Column: Identity & Academic Overview ── */}
        <Col lg={4}>
          {/* Identity Card */}
          <Card
            className="border rounded-4 shadow-sm mb-4 text-center"
            style={{
              background: 'var(--card-bg)',
              borderColor: 'var(--border-color)'
            }}
          >
            <Card.Body className="p-4">
              {/* Avatar Circle */}
              <div
                className="rounded-circle mx-auto d-flex align-items-center justify-content-center fw-bold shadow-sm mb-3"
                style={{
                  width: 80,
                  height: 80,
                  background: 'var(--bs-primary)',
                  color: '#ffffff',
                  fontSize: '1.8rem'
                }}
              >
                {initials}
              </div>

              <h5 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                {name || student.name}
              </h5>
              <div className="text-muted small mb-3">{email || student.email}</div>

              <div className="d-flex justify-content-center gap-2 mb-3">
                <Badge
                  style={{
                    backgroundColor: 'rgba(var(--bs-primary-rgb), 0.12)',
                    color: 'var(--bs-primary)',
                    border: '1px solid var(--border-color)'
                  }}
                  className="px-2.5 py-1.5"
                >
                  {batch ? batch.name : 'Unassigned Batch'}
                </Badge>
                <Badge bg={student.isActive !== false ? 'success' : 'danger'} className="px-2 py-1.5">
                  {student.isActive !== false ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="border-top pt-3 text-start small" style={{ borderColor: 'var(--border-color)' }}>

                <div className="d-flex justify-content-between py-1 text-muted">
                  <span>Enrolled Since:</span>
                  <span style={{ color: 'var(--text-primary)' }}>
                    {student.joinedAt ? new Date(student.joinedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="d-flex justify-content-between py-1 text-muted">
                  <span>Referral Code:</span>
                  <span className="font-monospace fw-bold" style={{ color: 'var(--bs-primary)' }}>
                    {student.referralCode || (student.id ? `LIFT-${String(student.id).slice(-4).toUpperCase()}` : `LIFT-${new Date().getFullYear()}`)}
                  </span>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Academic Snapshot Card */}
          <Card
            className="border rounded-4 shadow-sm"
            style={{
              background: 'var(--card-bg)',
              borderColor: 'var(--border-color)'
            }}
          >
            <Card.Header
              className="bg-transparent border-bottom py-3 fw-bold small text-uppercase"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
            >
              Academic Progress
            </Card.Header>
            <Card.Body className="p-3">
              <div className="d-flex align-items-center justify-content-between py-2 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
                <div className="d-flex align-items-center gap-2">
                  <FiBook className="text-primary" />
                  <span className="small" style={{ color: 'var(--text-primary)' }}>Topics Completed</span>
                </div>
                <span className="fw-bold small" style={{ color: 'var(--bs-primary)' }}>{completedTopicsCount}</span>
              </div>
              <div className="d-flex align-items-center justify-content-between py-2 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
                <div className="d-flex align-items-center gap-2">
                  <FiCheckCircle className="text-success" />
                  <span className="small" style={{ color: 'var(--text-primary)' }}>Assignments Submitted</span>
                </div>
                <span className="fw-bold small" style={{ color: 'var(--text-primary)' }}>{studentSubmissions.length}</span>
              </div>
              <div className="d-flex align-items-center justify-content-between py-2" style={{ borderColor: 'var(--border-color)' }}>
                <div className="d-flex align-items-center gap-2">
                  <FiAward className="text-warning" />
                  <span className="small" style={{ color: 'var(--text-primary)' }}>Certificates Issued</span>
                </div>
                <span className="fw-bold small" style={{ color: 'var(--text-primary)' }}>{studentCerts.length}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* ── Right Column: Edit Profile Form ── */}
        <Col lg={8}>
          <Card
            className="border rounded-4 shadow-sm"
            style={{
              background: 'var(--card-bg)',
              borderColor: 'var(--border-color)'
            }}
          >
            <Card.Header
              className="bg-transparent border-bottom py-3 d-flex align-items-center gap-2"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <FiUser style={{ color: 'var(--bs-primary)' }} />
              <span className="fw-bold" style={{ color: 'var(--text-primary)' }}>
                Edit Personal Details
              </span>
            </Card.Header>

            <Card.Body className="p-4">
              <Form onSubmit={handleSave}>
                {/* Full Name */}
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold" style={{ color: 'var(--text-primary)' }}>
                    Full Name <span className="text-danger">*</span>
                  </Form.Label>
                  <div className="input-group">
                    <span
                      className="input-group-text border"
                      style={{
                        background: 'var(--bg-body)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      <FiUser />
                    </span>
                    <Form.Control
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors({ ...errors, name: null });
                      }}
                      isInvalid={!!errors.name}
                      style={{
                        background: 'var(--bg-body)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)'
                      }}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.name}
                    </Form.Control.Feedback>
                  </div>
                </Form.Group>

                {/* Email Address */}
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold" style={{ color: 'var(--text-primary)' }}>
                    Email Address <span className="text-danger">*</span>
                  </Form.Label>
                  <div className="input-group">
                    <span
                      className="input-group-text border"
                      style={{
                        background: 'var(--bg-body)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      <FiMail />
                    </span>
                    <Form.Control
                      type="email"
                      placeholder="e.g. rahul@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: null });
                      }}
                      isInvalid={!!errors.email}
                      style={{
                        background: 'var(--bg-body)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)'
                      }}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </div>
                  <Form.Text className="text-muted small">
                    This email is used for notification receipts and course updates.
                  </Form.Text>
                </Form.Group>

                {/* Phone Number */}
                <Form.Group className="mb-4">
                  <Form.Label className="small fw-semibold" style={{ color: 'var(--text-primary)' }}>
                    Phone Number
                  </Form.Label>
                  <div className="input-group">
                    <span
                      className="input-group-text border"
                      style={{
                        background: 'var(--bg-body)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      <FiPhone />
                    </span>
                    <Form.Control
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{
                        background: 'var(--bg-body)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                  <Form.Text className="text-muted small">
                    Used for automated WhatsApp fee receipts and test alerts.
                  </Form.Text>
                </Form.Group>

                {/* Form Action Buttons */}
                <div className="d-flex align-items-center justify-content-end gap-2 pt-3 border-top" style={{ borderColor: 'var(--border-color)' }}>
                  <Button
                    variant="outline-secondary"
                    onClick={handleCancel}
                    className="rounded-pill px-4"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSaving}
                    className="d-flex align-items-center gap-2 rounded-pill px-4 shadow-sm"
                  >
                    <FiSave size={15} />
                    <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          {/* Password Change Card */}
          <Card
            className="border rounded-4 shadow-sm mt-4"
            style={{
              background: 'var(--card-bg)',
              borderColor: 'var(--border-color)'
            }}
          >
            <Card.Header
              className="bg-transparent border-bottom py-3 d-flex align-items-center gap-2 fw-bold"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            >
              <FiKey className="text-success" />
              <span>Change Account Password</span>
            </Card.Header>
            <Card.Body className="p-4">
              {passwordMsg.text && (
                <div className={`alert alert-${passwordMsg.type} py-2.5 px-3 small mb-3`}>
                  {passwordMsg.text}
                </div>
              )}

              <Form onSubmit={handlePasswordChange}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold" style={{ color: 'var(--text-primary)' }}>
                    Current Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    required
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={isChangingPassword}
                    style={{ background: 'var(--bg-body)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  />
                </Form.Group>

                <Row className="g-3 mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold" style={{ color: 'var(--text-primary)' }}>
                        New Password
                      </Form.Label>
                      <Form.Control
                        type="password"
                        required
                        minLength={6}
                        placeholder="Min 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={isChangingPassword}
                        style={{ background: 'var(--bg-body)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold" style={{ color: 'var(--text-primary)' }}>
                        Confirm New Password
                      </Form.Label>
                      <Form.Control
                        type="password"
                        required
                        minLength={6}
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isChangingPassword}
                        style={{ background: 'var(--bg-body)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-end">
                  <Button
                    type="submit"
                    variant="success"
                    disabled={isChangingPassword}
                    className="d-flex align-items-center gap-2 rounded-pill px-4 shadow-sm"
                  >
                    <FiCheck size={15} />
                    <span>{isChangingPassword ? 'Updating...' : 'Update Password'}</span>
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
