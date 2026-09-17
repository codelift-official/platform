import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Modal, Form, Card, Row, Col, InputGroup } from 'react-bootstrap';
import { useData } from '../../contexts/DataContext';
import {
  FaMoneyBillWave,
  FaPlusCircle,
  FaFilter,
  FaRupeeSign,
  FaHourglassHalf,
  FaUserCheck,
  FaEdit,
  FaTrashAlt,
  FaWhatsapp,
  FaBell,
  FaSearch,
  FaReceipt,
  FaInfoCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import NotificationModal from '../common/NotificationModal';
import {
  createFeeReceiptNotification,
  createFeeReminderNotification,
  buildAdminNotification,
  openAdminWhatsApp
} from '../../services/notificationService';

export default function FeeManager() {
  const { fees = [], students = [], batches = [], addFee, updateFee, deleteFee } = useData();
  const recordFee = addFee; // Alias

  const [showRecordModal, setShowRecordModal] = useState(false);
  const [filterPendingOnly, setFilterPendingOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingFee, setEditingFee] = useState(null);
  const [deletingFee, setDeletingFee] = useState(null);
  const [activeNotification, setActiveNotification] = useState(null);

  // Form state for Record Payment
  const [formStudentId, setFormStudentId] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formStatus, setFormStatus] = useState('PAID');
  const [formMode, setFormMode] = useState('UPI');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formReceiptNo, setFormReceiptNo] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Form state for Edit
  const [editAmount, setEditAmount] = useState('');
  const [editStatus, setEditStatus] = useState('PAID');
  const [editMode, setEditMode] = useState('UPI');
  const [editDate, setEditDate] = useState('');

  const feeList = Array.isArray(fees) ? fees : [];
  const studentList = Array.isArray(students) ? students : [];
  const batchList = Array.isArray(batches) ? batches : [];

  // Initialize record form when modal opens
  useEffect(() => {
    if (showRecordModal && studentList.length > 0) {
      const initialStudent = studentList.find((s) => s.id === formStudentId) || studentList[0];
      setFormStudentId(initialStudent.id);
      syncStudentAmounts(initialStudent.id);
      setFormDate(new Date().toISOString().split('T')[0]);
      setFormReceiptNo(`REC-${Date.now().toString().slice(-6)}`);
      setFormStatus('PAID');
      setFormMode('UPI');
      setFormNotes('');
      setFormError('');
    }
  }, [showRecordModal]);

  const syncStudentAmounts = (studentId) => {
    const std = studentList.find((s) => s.id === studentId);
    if (!std) return;
    const b = batchList.find((batch) => batch.id === std.batchId);
    const totalCourseFee = Number(std.totalFee) || b?.feeAmount || 45000;
    const alreadyPaid = feeList
      .filter((f) => f.studentId === studentId && f.status === 'PAID')
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
    const pendingBalance = Math.max(0, totalCourseFee - alreadyPaid);
    setFormAmount(pendingBalance > 0 ? String(pendingBalance) : String(b?.feeAmount || 25000));
  };

  const handleStudentChange = (e) => {
    const stdId = e.target.value;
    setFormStudentId(stdId);
    syncStudentAmounts(stdId);
  };

  const onRecordSubmit = (e) => {
    e.preventDefault();
    const numAmount = Number(formAmount);
    if (!formStudentId) {
      setFormError('Please select an enrolled student.');
      return;
    }
    if (!numAmount || numAmount <= 0) {
      setFormError('Please enter a valid tuition payment amount greater than 0.');
      return;
    }

    const feePayload = {
      studentId: formStudentId,
      amount: numAmount,
      paidAt: formDate || new Date().toISOString().split('T')[0],
      mode: formMode,
      status: formStatus,
      receiptNo: formReceiptNo || `REC-${Date.now().toString().slice(-6)}`,
      notes: formNotes
    };

    recordFee(feePayload);
    setShowRecordModal(false);

    const targetStudent = studentList.find((s) => s.id === formStudentId);
    const targetBatch = batchList.find((b) => b.id === targetStudent?.batchId);

    // Call Supabase Edge Function to email fee receipt (non-blocking)
    if (formStatus === 'PAID' && targetStudent?.email) {
      fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-fee-receipt`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentEmail: targetStudent.email,
            studentName: targetStudent.name,
            amount: numAmount,
            paidAt: feePayload.paidAt,
            mode: formMode,
            courseName: targetBatch?.name || targetStudent?.courseName || 'CodeLift Course',
          }),
        }
      )
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          toast.success('Payment recorded and receipt emailed');
        })
        .catch((err) => {
          console.error('Receipt email failed:', err);
          toast.success('Payment recorded'); // Don't block the flow on email failure
        });
    } else {
      toast.success('Payment recorded');
    }
  };

  // Selected student details helper
  const selectedStudent = studentList.find((s) => s.id === formStudentId);
  const selectedStudentBatch = batchList.find((b) => b.id === selectedStudent?.batchId);
  const selectedStudentPaid = selectedStudent
    ? feeList
      .filter((f) => f.studentId === selectedStudent.id && f.status === 'PAID')
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0)
    : 0;
  const selectedStudentTotal = selectedStudent
    ? Number(selectedStudent.totalFee) || selectedStudentBatch?.feeAmount || 45000
    : 0;
  const selectedStudentPending = Math.max(0, selectedStudentTotal - selectedStudentPaid);

  // Overview Metrics
  const totalCollected = feeList
    .filter((f) => f?.status === 'PAID')
    .reduce((sum, f) => sum + (Number(f?.amount) || 0), 0);

  const pendingAmount = feeList
    .filter((f) => f?.status === 'PENDING')
    .reduce((sum, f) => sum + (Number(f?.amount) || 0), 0);

  const totalStudents = studentList.length;

  const startEditFee = (fee) => {
    setEditingFee(fee);
    setEditAmount(String(fee.amount));
    setEditStatus(fee.status || 'PAID');
    setEditMode(fee.mode || 'UPI');
    setEditDate(fee.paidAt ? fee.paidAt.split('T')[0] : new Date().toISOString().split('T')[0]);
  };

  const saveEditFee = (e) => {
    e.preventDefault();
    if (editingFee && editAmount !== '') {
      updateFee(editingFee.id, {
        amount: Number(editAmount),
        status: editStatus,
        mode: editMode,
        paidAt: editDate
      });
      setEditingFee(null);
    }
  };

  const confirmDeleteFee = () => {
    if (deletingFee) {
      deleteFee(deletingFee.id);
      setDeletingFee(null);
    }
  };

  // Filter fees
  const displayedFees = feeList.filter((f) => {
    if (!f) return false;
    const matchesPending = filterPendingOnly ? f.status === 'PENDING' : true;
    if (!matchesPending) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const std = studentList.find((s) => s.id === f.studentId);
      const name = (std?.name || '').toLowerCase();
      const email = (std?.email || '').toLowerCase();
      const ref = (f.receiptNo || f.id || '').toLowerCase();
      const mode = (f.mode || '').toLowerCase();
      return name.includes(q) || email.includes(q) || ref.includes(q) || mode.includes(q);
    }

    return true;
  });

  return (
    <div>
      {/* Header bar */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary, #171717)' }}>
            <FaMoneyBillWave className="brand-text" />
            <span>Tuition & Fee Management</span>
          </h4>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowRecordModal(true)}
          className="d-flex align-items-center gap-2 align-self-start align-self-sm-auto shadow-sm px-3 py-2 rounded-3"
        >
          <FaPlusCircle size={14} />
          <span>Record Payment</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <Row className="g-3 mb-4">
        <Col sm={6} lg={4}>
          <Card className="border shadow-sm rounded-3">
            <Card.Body className="p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-uppercase small fw-bold text-muted">Total Collected</div>
                  <div className="fs-2 fw-bold my-1 font-monospace" style={{ color: 'var(--text-primary, #171717)' }}>
                    ₹{totalCollected.toLocaleString()}
                  </div>
                  <div className="small text-muted">Cleared student payments</div>
                </div>
                <div
                  className="rounded-3 p-3 d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: 'rgba(var(--bs-primary-rgb), 0.1)', color: 'var(--bs-primary)' }}
                >
                  <FaRupeeSign size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={6} lg={4}>
          <Card className="border shadow-sm rounded-3">
            <Card.Body className="p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-uppercase small fw-bold text-muted">Pending Invoices</div>
                  <div className="fs-2 fw-bold text-warning my-1 font-monospace">
                    ₹{pendingAmount.toLocaleString()}
                  </div>
                  <div className="small text-muted">Uncollected fee installments</div>
                </div>
                <div className="rounded-3 p-3 d-flex align-items-center justify-content-center bg-warning bg-opacity-10 text-warning">
                  <FaHourglassHalf size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={12} lg={4}>
          <Card className="border shadow-sm rounded-3">
            <Card.Body className="p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-uppercase small fw-bold text-muted">Enrolled Students</div>
                  <div className="fs-2 fw-bold my-1" style={{ color: 'var(--text-primary, #171717)' }}>
                    {totalStudents}
                  </div>
                  <div className="small text-muted">Active cohort participants</div>
                </div>
                <div
                  className="rounded-3 p-3 d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: 'rgba(var(--bs-primary-rgb), 0.1)', color: 'var(--bs-primary)' }}
                >
                  <FaUserCheck size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filter Toolbar & Fee Table */}
      <Card className="shadow-sm border rounded-3">
        <Card.Header className="bg-transparent py-3 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3" style={{ borderColor: 'var(--border-color, #e5e7eb)' }}>
          <div className="fw-bold d-flex align-items-center gap-2" style={{ color: 'var(--text-primary, #171717)' }}>
            <span>Payment Ledger ({displayedFees.length})</span>
            {filterPendingOnly && (
              <Badge bg="warning" text="dark" className="small">
                Pending Only
              </Badge>
            )}
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            {/* Search Input */}
            <InputGroup size="sm" style={{ maxWidth: '280px' }}>
              <InputGroup.Text className="bg-light text-muted border-end-0">
                <FaSearch size={12} />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search student, receipt, mode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-start-0"
              />
            </InputGroup>

            {/* Pending Only Toggle Filter */}
            <Button
              variant={filterPendingOnly ? 'warning' : 'outline-secondary'}
              size="sm"
              onClick={() => setFilterPendingOnly(!filterPendingOnly)}
              className="d-flex align-items-center gap-1.5"
            >
              <FaFilter size={11} />
              <span>{filterPendingOnly ? 'Show All' : 'Pending Only'}</span>
            </Button>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover striped className="mb-0 align-middle">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Amount</th>
                  <th>Payment Date</th>
                  <th>Mode</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedFees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      No fee records found for the active search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  displayedFees.map((fee) => {
                    const student = studentList.find((s) => s.id === fee.studentId);
                    const batch = batchList.find((b) => b.id === student?.batchId);

                    return (
                      <tr key={fee.id}>
                        <td>
                          <div className="fw-semibold" style={{ color: 'var(--text-primary, #171717)' }}>
                            {student?.name || 'Unknown Student'}
                          </div>
                          <div className="small text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
                            Ref: {fee.receiptNo || fee.id}
                            {batch ? ` • ${batch.name}` : ''}
                          </div>
                        </td>
                        <td className="fw-bold font-monospace" style={{ color: 'var(--text-primary, #171717)' }}>
                          ₹{Number(fee.amount)?.toLocaleString()}
                        </td>
                        <td className="small text-muted">
                          {fee.paidAt ? fee.paidAt.split('T')[0] : '—'}
                        </td>
                        <td>
                          <Badge bg="light" text="dark" className="border px-2 py-1">
                            {fee.mode || 'UPI'}
                          </Badge>
                        </td>
                        <td>
                          <Badge
                            bg={fee.status === 'PAID' ? 'success' : 'warning'}
                            text={fee.status === 'PAID' ? 'white' : 'dark'}
                            className="px-2 py-1"
                          >
                            {fee.status}
                          </Badge>
                        </td>
                        <td className="text-end">
                          <div className="d-inline-flex align-items-center gap-1">
                            {fee.status === 'PAID' && (
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => {
                                  openAdminWhatsApp(
                                    buildAdminNotification('fee_recorded', {
                                      studentName: student?.name || 'Student',
                                      amount: fee.amount,
                                      date: new Date(fee.paidAt || Date.now()).toLocaleDateString('en-IN'),
                                    })
                                  );
                                }}
                                className="d-inline-flex align-items-center gap-1"
                                title="Notify on WhatsApp"
                              >
                                <FaWhatsapp size={12} />
                                <span className="d-none d-md-inline">Notify on WhatsApp</span>
                              </Button>
                            )}
                            {fee.status === 'PAID' ? (
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => {
                                  const notif = createFeeReceiptNotification({ student, fee, batch });
                                  setActiveNotification(notif);
                                }}
                                className="d-inline-flex align-items-center gap-1"
                                title="Send official payment receipt via WhatsApp / Email"
                              >
                                <FaReceipt size={11} />
                                <span className="d-none d-md-inline">Receipt</span>
                              </Button>
                            ) : (
                              <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => {
                                  const notif = createFeeReminderNotification({
                                    student,
                                    pendingAmount: fee.amount,
                                    dueDate: fee.dueDate || fee.paidAt,
                                    batch
                                  });
                                  setActiveNotification(notif);
                                }}
                                className="d-inline-flex align-items-center gap-1 text-dark"
                                title="Send fee payment reminder via WhatsApp / Email"
                              >
                                <FaBell size={11} />
                                <span className="d-none d-md-inline">Remind</span>
                              </Button>
                            )}

                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => startEditFee(fee)}
                              className="d-inline-flex align-items-center gap-1"
                              title="Edit fee record or reconcile status"
                            >
                              <FaEdit size={11} />
                              <span>Edit</span>
                            </Button>

                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => setDeletingFee(fee)}
                              className="d-inline-flex align-items-center gap-1"
                              title="Delete fee record"
                            >
                              <FaTrashAlt size={11} />
                            </Button>
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

      {/* Record Payment Modal */}
      <Modal show={showRecordModal} onHide={() => setShowRecordModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="fs-5 fw-bold d-flex align-items-center gap-2">
            <FaReceipt className="text-primary" />
            <span>Record Tuition Fee Payment</span>
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={onRecordSubmit}>
          <Modal.Body className="space-y-3">
            {formError && (
              <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">
                {formError}
              </div>
            )}

            {/* Student Dropdown */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Select Enrolled Student *</Form.Label>
              <Form.Select
                value={formStudentId}
                onChange={handleStudentChange}
                required
              >
                {studentList.map((s) => {
                  const b = batchList.find((batch) => batch.id === s.batchId);
                  return (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.email}) — {b?.name || 'No Cohort'}
                    </option>
                  );
                })}
              </Form.Select>
            </Form.Group>

            {/* Selected Student Financial Snapshot Banner */}
            {selectedStudent && (
              <div className="p-3 rounded-3 mb-3 border" style={{ background: 'var(--card-bg-alt, rgba(255,255,255,0.04))', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                <div className="d-flex align-items-center gap-2 mb-2 text-primary fw-semibold small">
                  <FaInfoCircle />
                  <span>Student Tuition Summary</span>
                </div>
                <div className="row g-2 small">
                  <div className="col-sm-4">
                    <span className="text-muted d-block">Total Course Fee:</span>
                    <strong className="font-monospace">₹{selectedStudentTotal.toLocaleString()}</strong>
                  </div>
                  <div className="col-sm-4">
                    <span className="text-muted d-block">Already Paid:</span>
                    <strong className="font-monospace text-success">₹{selectedStudentPaid.toLocaleString()}</strong>
                  </div>
                  <div className="col-sm-4">
                    <span className="text-muted d-block">Pending Balance:</span>
                    <strong className={`font-monospace ${selectedStudentPending > 0 ? 'text-warning' : 'text-success'}`}>
                      ₹{selectedStudentPending.toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* Amount & Quick Presets */}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <Form.Label className="fw-semibold small">Payment Amount (₹) *</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  step="1"
                  required
                  placeholder="e.g. 15000"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                />
                {selectedStudentPending > 0 && (
                  <div className="d-flex gap-1.5 mt-1.5 flex-wrap">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="py-0 px-2"
                      style={{ fontSize: '0.72rem' }}
                      type="button"
                      onClick={() => setFormAmount(String(selectedStudentPending))}
                    >
                      Fill Pending (₹{selectedStudentPending.toLocaleString()})
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="py-0 px-2"
                      style={{ fontSize: '0.72rem' }}
                      type="button"
                      onClick={() => setFormAmount('10000')}
                    >
                      ₹10,000
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="py-0 px-2"
                      style={{ fontSize: '0.72rem' }}
                      type="button"
                      onClick={() => setFormAmount('15000')}
                    >
                      ₹15,000
                    </Button>
                  </div>
                )}
              </div>

              <div className="col-md-6">
                <Form.Label className="fw-semibold small">Tuition Status *</Form.Label>
                <Form.Select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                >
                  <option value="PAID">PAID (Payment Received & Cleared)</option>
                  <option value="PENDING">PENDING (Invoice Generated / Due)</option>
                </Form.Select>
              </div>
            </div>

            {/* Payment Mode & Date */}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <Form.Label className="fw-semibold small">Payment Mode</Form.Label>
                <Form.Select
                  value={formMode}
                  onChange={(e) => setFormMode(e.target.value)}
                >
                  <option value="UPI">UPI / QR Code</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT / IMPS)</option>
                  <option value="Cash">Cash Receipt</option>
                  <option value="Card">Debit / Credit Card</option>
                  <option value="Cheque">Cheque</option>
                </Form.Select>
              </div>

              <div className="col-md-6">
                <Form.Label className="fw-semibold small">Transaction Date *</Form.Label>
                <Form.Control
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
              </div>
            </div>

            {/* Receipt Number & Notes */}
            <div className="row g-3 mb-2">
              <div className="col-md-6">
                <Form.Label className="fw-semibold small">Receipt / UTR Reference No.</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. REC-123456 or UTR-987654"
                  value={formReceiptNo}
                  onChange={(e) => setFormReceiptNo(e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <Form.Label className="fw-semibold small">Internal Notes (Optional)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. Installment 1 of 2, verified via Google Pay"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={() => setShowRecordModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="px-3">
              Save Fee Record
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Fee Modal */}
      <Modal show={Boolean(editingFee)} onHide={() => setEditingFee(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5 fw-bold">Edit Fee Record</Modal.Title>
        </Modal.Header>
        <Form onSubmit={saveEditFee}>
          <Modal.Body className="space-y-3">
            <div className="p-3 bg-light rounded-3 mb-3 small">
              <strong>Student:</strong>{' '}
              {studentList.find((s) => s.id === editingFee?.studentId)?.name || 'Student'}
              <div className="text-muted font-monospace mt-1">Ref ID: {editingFee?.id}</div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Amount (₹) *</Form.Label>
              <Form.Control
                type="number"
                min="1"
                required
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
              />
            </Form.Group>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <Form.Label className="fw-semibold small">Tuition Status</Form.Label>
                <Form.Select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="PAID">PAID</option>
                  <option value="PENDING">PENDING</option>
                </Form.Select>
              </div>

              <div className="col-md-6">
                <Form.Label className="fw-semibold small">Payment Mode</Form.Label>
                <Form.Select
                  value={editMode}
                  onChange={(e) => setEditMode(e.target.value)}
                >
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Cheque">Cheque</option>
                </Form.Select>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Payment Date</Form.Label>
              <Form.Control
                type="date"
                required
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={() => setEditingFee(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Update Record
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Fee Confirmation Modal */}
      <Modal show={Boolean(deletingFee)} onHide={() => setDeletingFee(null)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-bold">Delete Fee Record</Modal.Title>
        </Modal.Header>
        <Modal.Body className="small">
          Are you sure you want to delete this payment record of <strong>₹{Number(deletingFee?.amount)?.toLocaleString()}</strong>? Student fee balances will be automatically recalculated.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setDeletingFee(null)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={confirmDeleteFee}>
            Delete Record
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Notification Preview & Dispatch Modal */}
      <NotificationModal
        show={Boolean(activeNotification)}
        onHide={() => setActiveNotification(null)}
        notification={activeNotification}
      />
    </div>
  );
}

