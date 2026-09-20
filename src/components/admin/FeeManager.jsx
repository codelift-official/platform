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
  FaInfoCircle,
  FaCopy
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
  const {
    fees = [],
    students = [],
    batches = [],
    addFee,
    updateFee,
    deleteFee,
    sendEmail,
    sendBatchEmail,
    platformSettings
  } = useData();
  const recordFee = addFee; // Alias

  const [showRecordModal, setShowRecordModal] = useState(false);
  const [filterPendingOnly, setFilterPendingOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingFee, setEditingFee] = useState(null);
  const [deletingFee, setDeletingFee] = useState(null);
  const [activeNotification, setActiveNotification] = useState(null);

  // Batch Fee Reminder Modal State
  const [showBatchReminderModal, setShowBatchReminderModal] = useState(false);
  const [reminderBatchFilter, setReminderBatchFilter] = useState('');
  const [selectedReminderStudentIds, setSelectedReminderStudentIds] = useState([]);
  const [reminderDueDate, setReminderDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [reminderCustomNote, setReminderCustomNote] = useState('');
  const [isSendingBatchReminders, setIsSendingBatchReminders] = useState(false);
  const [batchReportModal, setBatchReportModal] = useState(null); // { sent: [], failed: [], skipped: [] }

  const [formStudentId, setFormStudentId] = useState('');
  const [modalStudentSearch, setModalStudentSearch] = useState('');
  const [modalBatchFilter, setModalBatchFilter] = useState('');
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

  // Students with calculated tuition dues
  const studentsWithDues = studentList.map((s) => {
    const b = batchList.find((batch) => batch.id === s.batchId);
    const totalFee = typeof b?.feeAmount === 'number' ? b.feeAmount : (Number(s.totalFee) || 0);
    const paid = feeList
      .filter((f) => (f.studentId === s.id || (s.legacyId && f.studentId === s.legacyId)) && f.status === 'PAID')
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
    const pending = Math.max(0, totalFee - paid);
    return {
      ...s,
      batchName: b?.name || 'Unassigned Cohort',
      totalFee,
      paidFee: paid,
      pendingFee: pending
    };
  });

  const filteredReminderStudents = studentsWithDues.filter((s) => {
    const matchesBatch = !reminderBatchFilter || s.batchId === reminderBatchFilter;
    return matchesBatch && s.pendingFee > 0;
  });

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
    // As per user architecture: Batch fee is the final fee for student view, not the course fee sum
    const finalFee = typeof b?.feeAmount === 'number' ? b.feeAmount : (Number(std.totalFee) || 0);
    const alreadyPaid = feeList
      .filter((f) => (f.studentId === studentId || (std.legacyId && f.studentId === std.legacyId)) && f.status === 'PAID')
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
    const pendingBalance = Math.max(0, finalFee - alreadyPaid);
    setFormAmount(pendingBalance > 0 ? String(pendingBalance) : String(finalFee || 5000));
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

    const targetStudent = studentList.find((s) => s.id === formStudentId);
    const targetBatch = batchList.find((b) => b.id === targetStudent?.batchId);

    const feePayload = {
      studentId: formStudentId,
      batchId: targetStudent?.batchId || null,
      amount: numAmount,
      paidAt: formDate || new Date().toISOString().split('T')[0],
      mode: formMode,
      status: formStatus,
      receiptNo: formReceiptNo || `REC-${Date.now().toString().slice(-6)}`,
      notes: formNotes
    };

    recordFee(feePayload);
    setShowRecordModal(false);

    // Calculate pending tuition balance after this payment
    const targetBatchFee = typeof targetBatch?.feeAmount === 'number' ? targetBatch.feeAmount : (Number(targetStudent?.totalFee) || 0);
    const targetPaid = feeList
      .filter((f) => (f.studentId === formStudentId || (targetStudent?.legacyId && f.studentId === targetStudent.legacyId)) && f.status === 'PAID')
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
    const remainingDue = Math.max(0, targetBatchFee - (targetPaid + numAmount));

    // Trigger EmailJS fee_collected receipt notification
    if (formStatus === 'PAID' && targetStudent?.email && sendEmail) {
      sendEmail('fee_collected', targetStudent, {
        student_name: targetStudent.name,
        student_email: targetStudent.email,
        amount_paid: `₹${numAmount.toLocaleString('en-IN')}`,
        receipt_no: feePayload.receiptNo,
        payment_mode: formMode,
        date: feePayload.paidAt,
        batch_name: targetBatch?.name || 'CodeLift Program',
        remaining_due: `₹${remainingDue.toLocaleString('en-IN')}`
      })
        .then((res) => {
          if (res?.success) toast.success('Payment recorded & receipt emailed to student! 📧');
        })
        .catch(() => {});
    }
  };

  // Selected student details helper
  const selectedStudent = studentList.find((s) => s.id === formStudentId);
  const selectedStudentBatch = batchList.find((b) => b.id === selectedStudent?.batchId);
  const selectedStudentPaid = selectedStudent
    ? feeList
      .filter((f) => (f.studentId === selectedStudent.id || (selectedStudent.legacyId && f.studentId === selectedStudent.legacyId)) && f.status === 'PAID')
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0)
    : 0;
  const selectedStudentTotal = selectedStudent
    ? (typeof selectedStudentBatch?.feeAmount === 'number' ? selectedStudentBatch.feeAmount : (Number(selectedStudent.totalFee) || 0))
    : 0;
  const selectedStudentPending = Math.max(0, selectedStudentTotal - selectedStudentPaid);

  const filteredModalStudents = studentList.filter((s) => {
    const matchesBatch = !modalBatchFilter || s.batchId === modalBatchFilter;
    const query = modalStudentSearch.toLowerCase().trim();
    const matchesSearch = !query ||
      s.name?.toLowerCase().includes(query) ||
      s.email?.toLowerCase().includes(query) ||
      s.id?.toLowerCase().includes(query);
    return matchesBatch && matchesSearch;
  });

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

  const handleToggleSelectAllReminders = () => {
    if (selectedReminderStudentIds.length === filteredReminderStudents.length) {
      setSelectedReminderStudentIds([]);
    } else {
      setSelectedReminderStudentIds(filteredReminderStudents.map((s) => s.id));
    }
  };

  const handleToggleStudentReminder = (studentId) => {
    setSelectedReminderStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const handleSendBatchReminders = async () => {
    const targets = filteredReminderStudents.filter((s) => selectedReminderStudentIds.includes(s.id));
    if (targets.length === 0) {
      toast.error('Please select at least one student with pending dues.');
      return;
    }

    setIsSendingBatchReminders(true);
    try {
      const selectedBatch = batchList.find((b) => b.id === reminderBatchFilter);
      const res = await sendBatchEmail('fee_reminder', targets, {
        batch_name: selectedBatch?.name || 'CodeLift Program',
        due_date: reminderDueDate || 'Immediate',
        payment_instructions: platformSettings?.paymentInstructions || 'UPI / Bank Transfer'
      });

      setShowBatchReminderModal(false);
      setBatchReportModal(res);
      if (res.sent.length > 0) {
        toast.success(`Fee reminders sent to ${res.sent.length} student(s)! 📧`);
      } else {
        toast.error('No emails sent. Please check EmailJS settings or monthly quota.');
      }
    } catch (err) {
      toast.error(`Batch send error: ${err.message}`);
    } finally {
      setIsSendingBatchReminders(false);
    }
  };

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
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <Button
            variant="outline-warning"
            onClick={() => {
              setShowBatchReminderModal(true);
              setSelectedReminderStudentIds(filteredReminderStudents.map((s) => s.id));
            }}
            className="d-flex align-items-center gap-2 shadow-sm px-3 py-2 rounded-3 text-dark fw-semibold"
          >
            <FaBell size={14} />
            <span>Send Fee Reminders</span>
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowRecordModal(true)}
            className="d-flex align-items-center gap-2 align-self-start align-self-sm-auto shadow-sm px-3 py-2 rounded-3"
          >
            <FaPlusCircle size={14} />
            <span>Record Payment</span>
          </Button>
        </div>
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

            {/* Student Filter & Search Bar */}
            <div className="row g-2 mb-3">
              <div className="col-md-7">
                <Form.Label className="small fw-semibold mb-1">Search Student</Form.Label>
                <InputGroup size="sm">
                  <InputGroup.Text style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                    <FaSearch size={11} className="text-muted" />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search by student name, email, or ID..."
                    value={modalStudentSearch}
                    onChange={(e) => setModalStudentSearch(e.target.value)}
                    style={{ background: 'var(--bg-body)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                  />
                </InputGroup>
              </div>
              <div className="col-md-5">
                <Form.Label className="small fw-semibold mb-1">Cohort Batch Filter</Form.Label>
                <Form.Select
                  size="sm"
                  value={modalBatchFilter}
                  onChange={(e) => setModalBatchFilter(e.target.value)}
                  style={{ background: 'var(--bg-body)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                >
                  <option value="">All Cohorts ({batchList.length})</option>
                  {batchList.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} (₹{Number(b.feeAmount || 0).toLocaleString('en-IN')})
                    </option>
                  ))}
                </Form.Select>
              </div>
            </div>

            {/* Student Dropdown */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">
                Select Enrolled Student * <span className="text-muted fw-normal">({filteredModalStudents.length} match)</span>
              </Form.Label>
              <Form.Select
                value={formStudentId}
                onChange={handleStudentChange}
                required
                style={{ background: 'var(--bg-body)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              >
                {filteredModalStudents.length === 0 ? (
                  <option value="">-- No matching students found --</option>
                ) : (
                  filteredModalStudents.map((s) => {
                    const b = batchList.find((batch) => batch.id === s.batchId);
                    return (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.email}) — {b?.name || 'No Cohort'}
                      </option>
                    );
                  })
                )}
              </Form.Select>
            </Form.Group>

            {/* Selected Student Financial Snapshot Banner */}
            {selectedStudent && (
              <div className="p-3 rounded-3 mb-3 border" style={{ background: 'var(--card-bg-alt, rgba(255,255,255,0.04))', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center gap-2 text-primary fw-semibold small">
                    <FaInfoCircle />
                    <span>Student Tuition Summary</span>
                  </div>
                  <Badge bg="info" className="border" style={{ fontSize: '0.72rem' }}>
                    Cohort: {selectedStudentBatch?.name || 'Unassigned'}
                  </Badge>
                </div>
                <div className="row g-2 small">
                  <div className="col-sm-4">
                    <span className="text-muted d-block">Batch Final Fee:</span>
                    <strong className="font-monospace">₹{selectedStudentTotal.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="col-sm-4">
                    <span className="text-muted d-block">Already Paid:</span>
                    <strong className="font-monospace text-success">₹{selectedStudentPaid.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="col-sm-4">
                    <span className="text-muted d-block">Pending Balance:</span>
                    <strong className={`font-monospace ${selectedStudentPending > 0 ? 'text-warning' : 'text-success'}`}>
                      ₹{selectedStudentPending.toLocaleString('en-IN')}
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

      {/* Batch Fee Reminder Modal */}
      <Modal
        show={showBatchReminderModal}
        onHide={() => setShowBatchReminderModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-bold d-flex align-items-center gap-2">
            <FaBell className="text-warning" />
            <span>Send Batch Fee Reminders via EmailJS</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <p className="text-muted small mb-3">
            Select the cohort batch and check the individual students who should receive a tuition fee reminder email. Only students with pending fee balances are listed.
          </p>

          <div className="row g-3 mb-3">
            <div className="col-12 col-md-6">
              <Form.Label className="fw-semibold small">Filter by Cohort Batch</Form.Label>
              <Form.Select
                size="sm"
                value={reminderBatchFilter}
                onChange={(e) => {
                  setReminderBatchFilter(e.target.value);
                  const updated = studentsWithDues.filter(
                    (s) => (!e.target.value || s.batchId === e.target.value) && s.pendingFee > 0
                  );
                  setSelectedReminderStudentIds(updated.map((s) => s.id));
                }}
              >
                <option value="">All Cohorts / Batches</option>
                {batchList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Form.Select>
            </div>

            <div className="col-12 col-md-6">
              <Form.Label className="fw-semibold small">Tuition Due Date</Form.Label>
              <Form.Control
                type="date"
                size="sm"
                value={reminderDueDate}
                onChange={(e) => setReminderDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="fw-bold small" style={{ color: 'var(--text-primary)' }}>
              Eligible Students with Outstanding Balance ({filteredReminderStudents.length})
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="link"
                size="sm"
                className="p-0 text-decoration-none fw-semibold"
                onClick={handleToggleSelectAllReminders}
              >
                {selectedReminderStudentIds.length === filteredReminderStudents.length
                  ? 'Deselect All'
                  : 'Select All'}
              </Button>
            </div>
          </div>

          {filteredReminderStudents.length === 0 ? (
            <div className="alert alert-success small mb-0">
              No students with pending tuition balances found in this batch! 🎉
            </div>
          ) : (
            <div
              className="border rounded-3 p-2 mb-3"
              style={{ maxHeight: 260, overflowY: 'auto', background: 'var(--card-bg-alt, rgba(0,0,0,0.02))' }}
            >
              {filteredReminderStudents.map((s) => {
                const isChecked = selectedReminderStudentIds.includes(s.id);
                return (
                  <div
                    key={s.id}
                    className="d-flex justify-content-between align-items-center p-2 border-bottom last-border-0"
                    style={{ fontSize: '0.875rem' }}
                  >
                    <div className="form-check d-flex align-items-center gap-2 mb-0">
                      <input
                        className="form-check-input mt-0"
                        type="checkbox"
                        id={`remind_st_${s.id}`}
                        checked={isChecked}
                        onChange={() => handleToggleStudentReminder(s.id)}
                      />
                      <label className="form-check-label ms-1" htmlFor={`remind_st_${s.id}`}>
                        <div className="fw-semibold text-dark">{s.name}</div>
                        <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                          {s.email} &bull; {s.batchName}
                        </div>
                      </label>
                    </div>

                    <div className="text-end">
                      <span className="badge bg-warning text-dark fw-bold">
                        ₹{s.pendingFee.toLocaleString('en-IN')} Due
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowBatchReminderModal(false)}>
            Cancel
          </Button>
          <Button
            variant="warning"
            size="sm"
            className="text-dark fw-bold"
            disabled={isSendingBatchReminders || selectedReminderStudentIds.length === 0}
            onClick={handleSendBatchReminders}
          >
            {isSendingBatchReminders
              ? 'Sending via EmailJS...'
              : `Send Reminders to Selected (${selectedReminderStudentIds.length})`}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Batch Email Delivery Report Modal */}
      <Modal show={Boolean(batchReportModal)} onHide={() => setBatchReportModal(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-bold">📧 Batch Email Delivery Report</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3 small">
          <div className="d-flex gap-3 mb-3">
            <div className="p-2 border rounded text-center flex-fill bg-light">
              <div className="fw-bold text-success" style={{ fontSize: '1.2rem' }}>
                {batchReportModal?.sent?.length || 0}
              </div>
              <div className="text-muted small">Delivered</div>
            </div>
            <div className="p-2 border rounded text-center flex-fill bg-light">
              <div className="fw-bold text-danger" style={{ fontSize: '1.2rem' }}>
                {batchReportModal?.failed?.length || 0}
              </div>
              <div className="text-muted small">Failed</div>
            </div>
            <div className="p-2 border rounded text-center flex-fill bg-light">
              <div className="fw-bold text-secondary" style={{ fontSize: '1.2rem' }}>
                {batchReportModal?.skipped?.length || 0}
              </div>
              <div className="text-muted small">Skipped</div>
            </div>
          </div>

          {batchReportModal?.failed?.length > 0 && (
            <div className="mb-3">
              <strong className="text-danger d-block mb-1">Failed Recipients:</strong>
              <div className="border rounded p-2 bg-light font-monospace small" style={{ maxHeight: 120, overflowY: 'auto' }}>
                {batchReportModal.failed.map((f, idx) => (
                  <div key={idx} className="text-danger">
                    {f.student?.name} ({f.student?.email}): {f.error}
                  </div>
                ))}
              </div>
              <Button
                variant="outline-secondary"
                size="sm"
                className="mt-2"
                onClick={() => {
                  const failedEmails = batchReportModal.failed.map((f) => f.student?.email).filter(Boolean).join(', ');
                  navigator.clipboard.writeText(failedEmails);
                  toast.success('Failed recipient emails copied to clipboard!');
                }}
              >
                <FaCopy className="me-1" /> Copy Failed Emails
              </Button>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" size="sm" onClick={() => setBatchReportModal(null)}>
            Done
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

