import React, { useState } from 'react';
import { Table, Button, Badge, Modal, Form, Card, InputGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useData } from '../../contexts/DataContext';
import {
  FaUserPlus,
  FaEdit,
  FaUserSlash,
  FaUserCheck,
  FaFilter,
  FaSearch,
  FaUsers,
  FaKey,
  FaRupeeSign,
  FaWhatsapp,
  FaTags,
  FaShieldAlt,
  FaTicketAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaLock,
  FaUndo,
  FaCopy
} from 'react-icons/fa';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { supabase } from '../../services/supabaseClient';
import { buildAdminNotification, openAdminWhatsApp, buildWhatsAppUrl, ADMIN_WA } from '../../services/notificationService';

// Zod schema for student form validation
const studentSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please provide a valid email address'),
  phone: z.string().min(8, 'Phone number must be at least 8 digits'),
  batchId: z.string().min(1, 'Please select a batch')
});

export default function StudentManager() {
  const {
    students = [],
    batches = [],
    addStudent,
    updateStudent,
    toggleStudentActive,
    addFee,
    passwordResetRequests = [],
    resolvePasswordResetRequest,
    dismissPasswordResetRequest
  } = useData();

  const [selectedBatchFilter, setSelectedBatchFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // Quick Fee Payment Modal State
  const [feeModalStudent, setFeeModalStudent] = useState(null);
  const [quickFeeAmount, setQuickFeeAmount] = useState('15000');
  const [quickFeeMode, setQuickFeeMode] = useState('UPI');
  const [quickFeeStatus, setQuickFeeStatus] = useState('PAID');

  // Fee Concession / Structure Modal State
  const [feeEditStudent, setFeeEditStudent] = useState(null);
  const [feeBaseAmount, setFeeBaseAmount] = useState('45000');
  const [feeConcessionAmount, setFeeConcessionAmount] = useState('0');
  const [feeConcessionReason, setFeeConcessionReason] = useState('Referral Code');

  // Password Management State
  const [passwordEditStudent, setPasswordEditStudent] = useState(null);
  const [customPasswordInput, setCustomPasswordInput] = useState('');
  const [showCustomPassword, setShowCustomPassword] = useState(false);

  // Password Reset Complaints State
  const [showRequestsModal, setShowRequestsModal] = useState(false);

  const studentList = Array.isArray(students) ? students : [];
  const batchList = Array.isArray(batches) ? batches : [];
  // passwordResetRequests is derived from students with reset_requested === true (Supabase flag)
  const pendingResetRequests = passwordResetRequests.filter((r) => r.status === 'PENDING');

  // Form for Adding Student
  const {
    register: registerAdd,
    handleSubmit: handleAddSubmit,
    reset: resetAdd,
    formState: { errors: addErrors }
  } = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      batchId: batchList[0]?.id || ''
    }
  });

  // Form for Editing Student
  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    setValue: setEditValue,
    formState: { errors: editErrors }
  } = useForm({
    resolver: zodResolver(studentSchema)
  });

  const [justAddedStudent, setJustAddedStudent] = useState(null);

  const onAddSubmit = async (data) => {
    try {
      await addStudent(data);
      setJustAddedStudent(data);
      resetAdd();
      setShowAddModal(false);

      toast((t) => (
        <div className="d-flex align-items-center justify-content-between gap-3">
          <span>Student <strong>{data.name}</strong> added!</span>
          <Button
            variant="success"
            size="sm"
            className="d-inline-flex align-items-center gap-1 py-1 px-2.5 text-nowrap"
            onClick={() => {
              openAdminWhatsApp(
                buildAdminNotification('student_added', {
                  name: data.name,
                  email: data.email,
                })
              );
              toast.dismiss(t.id);
            }}
          >
            <FaWhatsapp size={14} />
            <span>Notify Admin</span>
          </Button>
        </div>
      ), { duration: 8000 });
    } catch (err) {
      toast.error(err.message || 'Failed to add student. Please try again.');
    }
  };

  const onStartEdit = (student) => {
    setEditingStudent(student);
    setEditValue('name', student.name);
    setEditValue('email', student.email);
    setEditValue('phone', student.phone || '');
    setEditValue('batchId', student.batchId);
  };

  const onEditSubmit = async (data) => {
    if (editingStudent) {
      try {
        await updateStudent(editingStudent.id, {
          name: data.name,
          phone: data.phone,
          batchId: data.batchId
        });
        toast.success(`Updated profile for ${data.name}!`);
        setEditingStudent(null);
      } catch (err) {
        toast.error(err.message || 'Failed to update student.');
      }
    }
  };

  // Open Fee Concession Modal
  const onStartFeeEdit = (student) => {
    const batch = batchList.find((b) => b.id === student.batchId);
    const standardFee = batch?.feeAmount || 45000;
    const base = student.baseFee || (Number(student.totalFee) > 0 ? Number(student.totalFee) + Number(student.concessionAmount || 0) : standardFee);
    const concession = student.concessionAmount || 0;

    setFeeEditStudent(student);
    setFeeBaseAmount(String(base));
    setFeeConcessionAmount(String(concession));
    setFeeConcessionReason(student.concessionReason || 'Referral Code');
  };

  const onSaveFeeConcession = (e) => {
    e.preventDefault();
    if (!feeEditStudent) return;

    const base = Math.max(0, Number(feeBaseAmount) || 0);
    const concession = Math.max(0, Number(feeConcessionAmount) || 0);
    const netPayable = Math.max(0, base - concession);
    const paid = Number(feeEditStudent.paidFee) || 0;
    const pendingBalance = Math.max(0, netPayable - paid);

    updateStudent(feeEditStudent.id, {
      baseFee: base,
      concessionAmount: concession,
      concessionReason: feeConcessionReason,
      totalFee: netPayable,
      feeStatus: pendingBalance <= 0 ? 'PAID' : (paid > 0 ? 'PARTIAL' : 'PENDING')
    });

    toast.success(`Tuition & concession saved for ${feeEditStudent.name}!`);
    setFeeEditStudent(null);
  };

  // Open Password Modal
  const onStartPasswordEdit = (student) => {
    setPasswordEditStudent(student);
    setCustomPasswordInput('');
    setShowCustomPassword(false);
  };

  // Reset Student Password to Default
  const handleResetToDefaultPassword = (student) => {
    if (!student) return;
    const defaultPwd = 'codelift123';
    updateStudent(student.id, {
      password: defaultPwd,
      reset_requested: false, // clear the flag
      isActive: true,
      status: 'ACTIVE'
    });

    toast.success(`Password reset to default "${defaultPwd}" for ${student.name}!`);

    // Offer WhatsApp confirmation
    const waText = `Hello ${student.name},\n\nWelcome to the CodeLift Student Portal!\n\nYour account has been set up successfully by the Administration. You can use the following details to log in:\n\nEmail: ${student.email}\nPassword: *${defaultPwd}*\n\nLogin URL: ${window.location.origin}/platform/login\n\nWe’re excited to have you with us. Happy learning!`;

    if (student.phone) {
      window.open(buildWhatsAppUrl(student.phone, waText), '_blank');
    }

    setPasswordEditStudent(null);
  };

  // Save Custom Password
  const handleSaveCustomPassword = (e) => {
    e.preventDefault();
    if (!passwordEditStudent) return;
    if (customPasswordInput.trim().length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    const newPwd = customPasswordInput.trim();
    updateStudent(passwordEditStudent.id, {
      password: newPwd,
      reset_requested: false, // clear the flag
      isActive: true,
      status: 'ACTIVE'
    });

    toast.success(`New password updated for ${passwordEditStudent.name}!`);

    if (passwordEditStudent.phone) {
      const waText = `Hello ${student.name},\n\nWelcome to the CodeLift Student Portal!\n\nYour account has been set up successfully by the Administration. You can use the following details to log in:\n\nEmail: ${student.email}\nPassword: *${defaultPwd}*\n\nLogin URL: ${window.location.origin}/platform/login\n\nWe’re excited to have you with us. Happy learning!`;
      window.open(buildWhatsAppUrl(passwordEditStudent.phone, waText), '_blank');
    }

    setPasswordEditStudent(null);
  };

  // Toggle Enable / Disable
  const handleToggleActive = (student) => {
    const willBeActive = !(student.isActive !== false && student.status !== 'SUSPENDED');
    toggleStudentActive(student.id);

    if (willBeActive) {
      toast.success(`Student account for ${student.name} activated! Access restored.`);
    } else {
      toast.error(`Student account for ${student.name} suspended! Login blocked.`);
    }
  };

  // Filter students based on batch selection and search term
  const filteredStudents = studentList.filter((s) => {
    if (!s) return false;
    const matchesBatch = selectedBatchFilter === 'ALL' || s.batchId === selectedBatchFilter;
    const nameStr = s.name || '';
    const emailStr = s.email || '';
    const phoneStr = s.phone || '';
    const matchesSearch =
      nameStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emailStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phoneStr.includes(searchTerm);
    return matchesBatch && matchesSearch;
  });

  return (
    <div>
      {/* Pending Password Reset Complaints Banner */}
      {pendingResetRequests.length > 0 && (
        <div className="alert alert-warning border-warning d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4 rounded-3 shadow-sm">
          <div className="d-flex align-items-center gap-2">
            <FaShieldAlt className="text-warning fs-5 flex-shrink-0" />
            <div>
              <strong>{pendingResetRequests.length} Password Reset Complaint{pendingResetRequests.length > 1 ? 's' : ''} Pending</strong>
              <div className="small text-muted">Students have raised official requests to reset their portal credentials to default.</div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Button
              variant="warning"
              size="sm"
              className="fw-bold d-inline-flex align-items-center gap-1.5 shadow-sm"
              onClick={() => setShowRequestsModal(true)}
            >
              <FaTicketAlt size={13} />
              <span>Review Complaints ({pendingResetRequests.length})</span>
            </Button>
          </div>
        </div>
      )}

      {/* Recently Added Student Notification Banner */}
      {justAddedStudent && (
        <div className="alert alert-success d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4 rounded-3 shadow-sm">
          <div className="d-flex align-items-center gap-2">
            <FaUserCheck className="text-success" />
            <span>
              Student <strong>{justAddedStudent.name}</strong> ({justAddedStudent.email}) successfully enrolled.
            </span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Button
              variant="success"
              size="sm"
              className="d-inline-flex align-items-center gap-1.5 fw-bold"
              onClick={() => {
                openAdminWhatsApp(
                  buildAdminNotification('student_added', {
                    name: justAddedStudent.name,
                    email: justAddedStudent.email,
                  })
                );
              }}
            >
              <FaWhatsapp size={15} />
              <span>Notify Admin on WhatsApp</span>
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              className="py-0 px-2"
              onClick={() => setJustAddedStudent(null)}
              title="Dismiss"
            >
              ✕
            </Button>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary, #171717)' }}>
            <FaUsers className="brand-text" />
            <span>Student Management</span>
          </h4>
        </div>
        <div className="d-flex align-items-center gap-2">
          {passwordResetRequests.length > 0 && (
            <Button
              variant="outline-warning"
              size="sm"
              onClick={() => setShowRequestsModal(true)}
              className="d-flex align-items-center gap-1.5 fw-semibold"
            >
              <FaTicketAlt size={13} />
              <span>Complaints Desk ({pendingResetRequests.length})</span>
            </Button>
          )}
          <Button
            variant="primary"
            onClick={() => {
              resetAdd({
                name: '',
                email: '',
                phone: '',
                batchId: batchList[0]?.id || ''
              });
              setShowAddModal(true);
            }}
            className="d-flex align-items-center gap-2 align-self-start align-self-sm-auto shadow-sm"
          >
            <FaUserPlus size={14} />
            <span>Add New Student</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="shadow-sm border mb-4 rounded-3">
        <Card.Body className="p-3">
          <div className="row g-3 align-items-center">
            {/* Filter by Batch Dropdown */}
            <div className="col-md-5 col-lg-4">
              <Form.Group className="d-flex align-items-center gap-2">
                <Form.Label className="small fw-semibold text-nowrap mb-0 d-flex align-items-center gap-1 text-muted">
                  <FaFilter size={12} />
                  <span>Batch:</span>
                </Form.Label>
                <Form.Select
                  size="sm"
                  value={selectedBatchFilter}
                  onChange={(e) => setSelectedBatchFilter(e.target.value)}
                  className="rounded-2"
                >
                  <option value="ALL">All Batches ({studentList.length} students)</option>
                  {batchList.map((b) => {
                    const count = studentList.filter((s) => s.batchId === b.id).length;
                    return (
                      <option key={b.id} value={b.id}>
                        {b.name} ({count})
                      </option>
                    );
                  })}
                </Form.Select>
              </Form.Group>
            </div>

            {/* Search Input */}
            <div className="col-md-7 col-lg-5 ms-auto">
              <InputGroup size="sm">
                <InputGroup.Text className="bg-light text-muted border-end-0">
                  <FaSearch size={12} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search student by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0"
                />
              </InputGroup>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Students Table */}
      <Card className="shadow-sm border rounded-3">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover striped className="mb-0 align-middle">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Email & Phone</th>
                  <th>Assigned Batch</th>
                  <th>Tuition & Concession</th>
                  <th>Account Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      No students found matching current filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((std) => {
                    const batch = batchList.find((b) => b.id === std.batchId);
                    const netTotal = Number(std.totalFee || batch?.feeAmount || 45000);
                    const concession = Number(std.concessionAmount) || 0;
                    const paid = Number(std.paidFee) || 0;
                    const pending = Math.max(0, netTotal - paid);
                    const isActive = std.isActive !== false && std.status !== 'SUSPENDED';

                    return (
                      <tr key={std.id}>
                        <td>
                          <div className="fw-semibold d-flex align-items-center gap-1.5" style={{ color: 'var(--text-primary, #171717)' }}>
                            {std.name}
                            {std.reset_requested && (
                              <OverlayTrigger overlay={<Tooltip>🔑 Password Reset Requested — click the key icon to resolve</Tooltip>}>
                                <span className="badge bg-warning text-dark fw-bold" style={{ fontSize: '0.65rem', verticalAlign: 'middle', cursor: 'pointer' }}
                                  onClick={() => onStartPasswordEdit(std)}>
                                  🔑 RESET REQ
                                </span>
                              </OverlayTrigger>
                            )}
                          </div>
                          <div className="text-muted font-monospace" style={{ fontSize: '0.72rem' }}>
                            ID: {std.id}
                          </div>
                        </td>
                        <td>
                          <div className="small" style={{ color: 'var(--text-primary, #171717)' }}>{std.email}</div>
                          <div className="small text-muted">{std.phone || 'No phone'}</div>
                        </td>
                        <td>
                          <Badge className="badge-theme px-2 py-1 fw-semibold">
                            {batch ? batch.name : std.batchId}
                          </Badge>
                        </td>
                        <td>
                          <div>
                            <span className="fw-bold text-dark" style={{ fontSize: '0.88rem' }}>
                              ₹{netTotal.toLocaleString()}
                            </span>
                            {concession > 0 && (
                              <Badge
                                bg="warning"
                                text="dark"
                                className="ms-1.5 small fw-semibold"
                                title={`Concession: ${std.concessionReason || 'Discount'}`}
                              >
                                -₹{concession.toLocaleString()} Concession
                              </Badge>
                            )}
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.74rem', marginTop: 2 }}>
                            Paid: <span className="text-success fw-semibold">₹{paid.toLocaleString()}</span>
                            <span className="mx-1">•</span>
                            Bal: <span className={pending > 0 ? 'text-danger fw-semibold' : 'text-success'}>₹{pending.toLocaleString()}</span>
                          </div>
                        </td>
                        <td>
                          <Badge
                            bg={isActive ? 'success' : 'danger'}
                            className="d-inline-flex align-items-center gap-1 px-2 py-1"
                          >
                            {isActive ? (
                              <>
                                <FaCheckCircle size={10} />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <FaTimesCircle size={10} />
                                <span>Suspended</span>
                              </>
                            )}
                          </Badge>
                        </td>
                        <td className="text-end">
                          <div className="d-inline-flex gap-1.5 align-items-center">
                            {/* Record Tuition Payment */}
                            <OverlayTrigger overlay={<Tooltip>Record tuition fee payment</Tooltip>}>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="d-inline-flex align-items-center justify-content-center rounded-2 p-1.5"
                                style={{ width: 32, height: 32 }}
                                onClick={() => {
                                  setFeeModalStudent(std);
                                  setQuickFeeAmount(pending > 0 ? String(pending) : '15000');
                                  setQuickFeeStatus('PAID');
                                  setQuickFeeMode('UPI');
                                }}
                                aria-label="Record tuition fee payment"
                              >
                                <FaRupeeSign size={12} />
                              </Button>
                            </OverlayTrigger>

                            {/* Edit Tuition & Concession */}
                            <OverlayTrigger overlay={<Tooltip>Edit Fees & Concession Scholarship</Tooltip>}>
                              <Button
                                variant="outline-info"
                                size="sm"
                                className="d-inline-flex align-items-center justify-content-center rounded-2 p-1.5"
                                style={{ width: 32, height: 32 }}
                                onClick={() => onStartFeeEdit(std)}
                                aria-label="Edit fee and concession"
                              >
                                <FaTags size={12} />
                              </Button>
                            </OverlayTrigger>

                            {/* Edit Student Profile */}
                            <OverlayTrigger overlay={<Tooltip>Edit student profile & batch</Tooltip>}>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                className="d-inline-flex align-items-center justify-content-center rounded-2 p-1.5"
                                style={{ width: 32, height: 32 }}
                                onClick={() => onStartEdit(std)}
                                aria-label="Edit student"
                              >
                                <FaEdit size={12} />
                              </Button>
                            </OverlayTrigger>

                            {/* Manage Password */}
                            <OverlayTrigger overlay={<Tooltip>Reset / Edit Student Password</Tooltip>}>
                              <Button
                                variant="outline-warning"
                                size="sm"
                                className="d-inline-flex align-items-center justify-content-center rounded-2 p-1.5"
                                style={{ width: 32, height: 32 }}
                                onClick={() => onStartPasswordEdit(std)}
                                aria-label="Reset or edit password"
                              >
                                <FaKey size={12} />
                              </Button>
                            </OverlayTrigger>

                            {/* Enable / Disable Access */}
                            <OverlayTrigger
                              overlay={
                                <Tooltip>
                                  {isActive ? 'Suspend account (Block login access)' : 'Activate account (Restore login access)'}
                                </Tooltip>
                              }
                            >
                              <Button
                                variant={isActive ? 'outline-danger' : 'outline-success'}
                                size="sm"
                                className="d-inline-flex align-items-center justify-content-center rounded-2 p-1.5"
                                style={{ width: 32, height: 32 }}
                                onClick={() => handleToggleActive(std)}
                                aria-label={isActive ? 'Deactivate student' : 'Activate student'}
                              >
                                {isActive ? <FaUserSlash size={12} /> : <FaUserCheck size={12} />}
                              </Button>
                            </OverlayTrigger>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Add Student Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5 fw-bold">Enroll New Student</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddSubmit(onAddSubmit)}>
          <Modal.Body className="space-y-3">
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Full Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Sumanth Kumar"
                {...registerAdd('name')}
                isInvalid={!!addErrors.name}
              />
              <Form.Control.Feedback type="invalid">
                {addErrors.name?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="student@example.com"
                {...registerAdd('email')}
                isInvalid={!!addErrors.email}
              />
              <Form.Control.Feedback type="invalid">
                {addErrors.email?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Phone Number</Form.Label>
              <Form.Control
                type="tel"
                placeholder="+91 98765 43210"
                {...registerAdd('phone')}
                isInvalid={!!addErrors.phone}
              />
              <Form.Control.Feedback type="invalid">
                {addErrors.phone?.message}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Mandatory Form.Select populated with existing Batches */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Select Batch (Mandatory)</Form.Label>
              <Form.Select
                {...registerAdd('batchId')}
                isInvalid={!!addErrors.batchId}
              >
                {batchList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} (Fee: ₹{(b.feeAmount || 0).toLocaleString()})
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {addErrors.batchId?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <div className="alert alert-info py-2 px-3 small d-flex align-items-center gap-2 mb-0">
              <FaInfoCircle className="text-primary flex-shrink-0" />
              <span>Default student portal password will be <strong><code>codelift123</code></strong>.</span>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Enroll Student
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal show={Boolean(editingStudent)} onHide={() => setEditingStudent(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5 fw-bold">Edit Student Details</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit(onEditSubmit)}>
          <Modal.Body className="space-y-3">
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Full Name</Form.Label>
              <Form.Control
                type="text"
                {...registerEdit('name')}
                isInvalid={!!editErrors.name}
              />
              <Form.Control.Feedback type="invalid">
                {editErrors.name?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Email Address (Read only)</Form.Label>
              <Form.Control
                type="email"
                disabled
                {...registerEdit('email')}
                className="bg-light"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Phone Number</Form.Label>
              <Form.Control
                type="tel"
                {...registerEdit('phone')}
                isInvalid={!!editErrors.phone}
              />
              <Form.Control.Feedback type="invalid">
                {editErrors.phone?.message}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Reassign Batch */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Reassign Batch</Form.Label>
              <Form.Select
                {...registerEdit('batchId')}
                isInvalid={!!editErrors.batchId}
              >
                {batchList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} (Fee: ₹{(b.feeAmount || 0).toLocaleString()})
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {editErrors.batchId?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={() => setEditingStudent(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Fees & Concession Modal */}
      <Modal show={Boolean(feeEditStudent)} onHide={() => setFeeEditStudent(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5 fw-bold d-flex align-items-center gap-2">
            <FaTags className="text-info" />
            <span>Edit Fees & Concession: {feeEditStudent?.name}</span>
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={onSaveFeeConcession}>
          <Modal.Body className="space-y-3">
            {/* Context Info */}
            <div className="p-3 bg-light rounded-3 mb-3 small border">
              <div><strong>Student:</strong> {feeEditStudent?.name} ({feeEditStudent?.email})</div>
              <div><strong>Batch:</strong> {batchList.find((b) => b.id === feeEditStudent?.batchId)?.name || 'Cohort'}</div>
              <div><strong>Standard Batch Fee:</strong> ₹{(batchList.find((b) => b.id === feeEditStudent?.batchId)?.feeAmount || 45000).toLocaleString()}</div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-sm-6">
                <Form.Label className="small fw-semibold">Base Course Fee (₹) *</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  required
                  value={feeBaseAmount}
                  onChange={(e) => setFeeBaseAmount(e.target.value)}
                />
              </div>

              <div className="col-sm-6">
                <Form.Label className="small fw-semibold">Concession / Discount (₹)</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={feeConcessionAmount}
                  onChange={(e) => setFeeConcessionAmount(e.target.value)}
                />
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">Concession Category / Reason</Form.Label>
              <Form.Select
                value={feeConcessionReason}
                onChange={(e) => setFeeConcessionReason(e.target.value)}
              >
                <option value="Referral Code">Referral Code</option>
                <option value="Personal / Need-Based">Personal / Need-Based</option>
                <option value="Merit Scholarship">Merit Scholarship</option>
                <option value="Early Bird / Promotional">Early Bird / Promotional</option>
                <option value="Other / Discretionary">Other / Discretionary</option>
              </Form.Select>
            </Form.Group>

            {/* Live Calculation Preview Card */}
            {(() => {
              const base = Number(feeBaseAmount) || 0;
              const disc = Number(feeConcessionAmount) || 0;
              const net = Math.max(0, base - disc);
              const paid = Number(feeEditStudent?.paidFee) || 0;
              const pending = Math.max(0, net - paid);

              return (
                <div className="p-3 rounded-3 border bg-white shadow-sm">
                  <div className="d-flex justify-content-between small text-muted mb-1">
                    <span>Base Tuition Fee:</span>
                    <span>₹{base.toLocaleString()}</span>
                  </div>
                  {disc > 0 && (
                    <div className="d-flex justify-content-between small text-warning mb-1">
                      <span>Concession Applied:</span>
                      <span>- ₹{disc.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="d-flex justify-content-between fw-bold border-top pt-1 mt-1">
                    <span>Net Payable Course Fee:</span>
                    <span className="text-primary fs-6">₹{net.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between small text-muted mt-1">
                    <span>Amount Already Paid:</span>
                    <span className="text-success fw-semibold">₹{paid.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between small border-top pt-1 mt-1">
                    <span>Pending Balance:</span>
                    <span className={pending > 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                      ₹{pending.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })()}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={() => setFeeEditStudent(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Fee & Concession
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit / Reset Student Password Modal */}
      <Modal show={Boolean(passwordEditStudent)} onHide={() => setPasswordEditStudent(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5 fw-bold d-flex align-items-center gap-2">
            <FaKey className="text-warning" />
            <span>Manage Password: {passwordEditStudent?.name}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="space-y-3">
          <div className="p-3 bg-light rounded-3 mb-3 small border">
            <div><strong>Student:</strong> {passwordEditStudent?.name}</div>
            <div><strong>Email:</strong> {passwordEditStudent?.email}</div>
            <div><strong>Phone:</strong> {passwordEditStudent?.phone || 'Not recorded'}</div>
            <div><strong>Status:</strong> {passwordEditStudent?.isActive !== false ? 'Active' : 'Suspended'}</div>
          </div>

          {/* Quick 1-Click Reset to Default */}
          <div className="p-3 rounded-3 border mb-3" style={{ backgroundColor: 'rgba(234, 179, 8, 0.08)' }}>
            <h6 className="fw-bold mb-1 d-flex align-items-center gap-2">
              <FaUndo className="text-warning" />
              <span>1-Click Reset to Default</span>
            </h6>
            <p className="text-muted small mb-3">
              Instantly resets this student's password to the platform standard default: <code>codelift123</code>.
            </p>
            <Button
              variant="warning"
              size="sm"
              className="fw-bold d-inline-flex align-items-center gap-2 w-100 justify-content-center py-2 shadow-sm"
              onClick={() => handleResetToDefaultPassword(passwordEditStudent)}
            >
              <FaLock size={13} />
              <span>Reset Password to "codelift123"</span>
            </Button>
          </div>

          {/* Or Set Custom Password */}
          <Form onSubmit={handleSaveCustomPassword}>
            <h6 className="fw-bold mb-2">Or Set Custom Password</h6>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">New Custom Password</Form.Label>
              <InputGroup size="sm">
                <Form.Control
                  type={showCustomPassword ? 'text' : 'password'}
                  placeholder="Enter new password (min 6 chars)"
                  value={customPasswordInput}
                  onChange={(e) => setCustomPasswordInput(e.target.value)}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowCustomPassword(!showCustomPassword)}
                  type="button"
                >
                  {showCustomPassword ? <FiEyeOff /> : <FiEye />}
                </Button>
              </InputGroup>
            </Form.Group>

            <Button
              variant="outline-primary"
              size="sm"
              type="submit"
              disabled={customPasswordInput.trim().length < 6}
              className="w-100 fw-semibold py-1.5"
            >
              Save Custom Password
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setPasswordEditStudent(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Password Reset Complaints Desk Modal */}
      <Modal
        show={showRequestsModal}
        onHide={() => setShowRequestsModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title className="fs-5 fw-bold d-flex align-items-center gap-2">
            <FaTicketAlt className="text-warning" />
            <span>Password Reset Complaints Desk</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {passwordResetRequests.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <FaShieldAlt size={40} className="mb-2 text-success opacity-50" />
              <h6>No Password Reset Complaints Registered</h6>
              <p className="small mb-0">When students raise a forgot password request on the login page, it will appear here.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {passwordResetRequests.map((req) => {
                const isPending = req.status === 'PENDING';
                const student = students.find(
                  (s) => (s.email || '').toLowerCase() === req.studentEmail.toLowerCase() || (req.studentId && s.id === req.studentId)
                );

                return (
                  <div
                    key={req.id}
                    className="p-3 rounded-3 border bg-light shadow-sm d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3"
                  >
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <Badge bg={isPending ? 'warning' : (req.status === 'RESOLVED' ? 'success' : 'secondary')} text={isPending ? 'dark' : 'white'} className="font-monospace">
                          {req.ticketId}
                        </Badge>
                        <Badge bg={isPending ? 'danger' : 'success'}>
                          {req.status}
                        </Badge>
                        <span className="text-muted small">
                          {new Date(req.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="fw-bold fs-6">{req.studentName}</div>
                      <div className="small text-muted">{req.studentEmail} • {req.studentPhone || 'No phone'}</div>
                      <div className="small mt-1 text-dark">
                        <strong>Complaint:</strong> {req.reason}
                      </div>
                    </div>

                    <div className="d-flex flex-wrap align-items-center gap-2 flex-shrink-0">
                      {isPending ? (
                        <>
                          <Button
                            variant="success"
                            size="sm"
                            className="d-inline-flex align-items-center gap-1.5 fw-bold shadow-sm"
                            onClick={() => {
                              // resolvePasswordResetRequest now takes studentId directly
                              resolvePasswordResetRequest(req.studentId, 'codelift123');
                              toast.success(`Password reset to codelift123 for ${req.studentName}!`);

                              // Send WhatsApp notification to student if phone available
                              const student = students.find((s) => s.id === req.studentId);
                              const targetPhone = req.studentPhone || student?.phone;
                              if (targetPhone) {
                                const waMsg = `Hello ${req.studentName},\n\nWelcome to the CodeLift Student Portal!\n\nYour account has been set up successfully by the Administration. You can use the following details to log in:\n\nEmail: ${req.studentEmail}\nPassword: codelift123\n\nLogin URL: ${window.location.origin}/platform/login\n\nWe’re excited to have you with us. Happy learning!`;
                                window.open(buildWhatsAppUrl(targetPhone, waMsg), '_blank');
                              }
                            }}
                          >
                            <FaUndo size={12} />
                            <span>Reset to Default (codelift123)</span>
                          </Button>

                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => {
                              dismissPasswordResetRequest(req.studentId);
                              toast('Request dismissed.', { icon: 'ℹ️' });
                            }}
                          >
                            Dismiss
                          </Button>
                        </>
                      ) : (
                        <div className="small text-success d-flex align-items-center gap-1">
                          <FaCheckCircle />
                          <span>Resolved</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowRequestsModal(false)}>
            Close Desk
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Quick Record Fee Modal */}
      <Modal show={Boolean(feeModalStudent)} onHide={() => setFeeModalStudent(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5 fw-bold d-flex align-items-center gap-2">
            <FaRupeeSign className="text-primary" />
            <span>Record Fee: {feeModalStudent?.name}</span>
          </Modal.Title>
        </Modal.Header>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            if (feeModalStudent && Number(quickFeeAmount) > 0) {
              addFee({
                studentId: feeModalStudent.id,
                amount: Number(quickFeeAmount),
                mode: quickFeeMode,
                status: quickFeeStatus,
                paidAt: new Date().toISOString().split('T')[0],
                receiptNo: `REC-${Date.now().toString().slice(-6)}`
              });
              setFeeModalStudent(null);
            }
          }}
        >
          <Modal.Body className="space-y-3">
            <div className="p-3 bg-light rounded-3 mb-3 small border">
              <div><strong>Student:</strong> {feeModalStudent?.name} ({feeModalStudent?.email})</div>
              <div><strong>Batch:</strong> {batchList.find((b) => b.id === feeModalStudent?.batchId)?.name || 'Cohort'}</div>
              <div className="mt-1">
                <span>Net Total Fee: <strong>₹{Number(feeModalStudent?.totalFee || 45000).toLocaleString()}</strong></span>
                <span className="ms-3">Paid: <strong className="text-success">₹{Number(feeModalStudent?.paidFee || 0).toLocaleString()}</strong></span>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Payment Amount (₹) *</Form.Label>
              <Form.Control
                type="number"
                min="1"
                required
                value={quickFeeAmount}
                onChange={(e) => setQuickFeeAmount(e.target.value)}
              />
            </Form.Group>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <Form.Label className="fw-semibold small">Tuition Status</Form.Label>
                <Form.Select
                  value={quickFeeStatus}
                  onChange={(e) => setQuickFeeStatus(e.target.value)}
                >
                  <option value="PAID">PAID</option>
                  <option value="PENDING">PENDING</option>
                </Form.Select>
              </div>

              <div className="col-md-6">
                <Form.Label className="fw-semibold small">Payment Mode</Form.Label>
                <Form.Select
                  value={quickFeeMode}
                  onChange={(e) => setQuickFeeMode(e.target.value)}
                >
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Cheque">Cheque</option>
                </Form.Select>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={() => setFeeModalStudent(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Payment
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

