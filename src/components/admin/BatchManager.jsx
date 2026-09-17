import React, { useState } from 'react';
import { Table, Button, Badge, Modal, Form, Alert, Card, Nav, ProgressBar } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useData } from '../../contexts/DataContext';
import {
  FaPlus,
  FaArchive,
  FaCheckCircle,
  FaLayerGroup,
  FaExclamationTriangle,
  FaGraduationCap,
  FaCheck,
  FaExclamationCircle,
  FaEdit,
  FaUsers,
  FaBook,
  FaFileAlt,
  FaCogs,
  FaUserPlus,
  FaUnlink,
  FaLink,
  FaTrash,
  FaSearch,
  FaCalendarAlt,
  FaRupeeSign,
  FaClipboardList
} from 'react-icons/fa';
import toast from 'react-hot-toast';

// Zod validation schema for Batch creation & editing
const batchSchema = z.object({
  name: z.string().min(3, 'Batch name must be at least 3 characters'),
  description: z.string().optional(),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1 student'),
  feeAmount: z.coerce.number().min(0, 'Fee must be 0 or greater'),
  startDate: z.string().min(1, 'Start date is required')
});

export default function BatchManager() {
  const {
    batches = [],
    students = [],
    fees = [],
    assignments = [],
    submissions = [],
    tests = [],
    testAttempts = [],
    courses = [],
    addBatch,
    updateBatch,
    deleteBatch,
    toggleBatchActive,
    markBatchComplete,
    cleanupBatch,
    updateCourse,
    updateTest,
    addTest,
    addStudent,
    updateStudent,
    attachCourseToBatch,
    detachCourseFromBatch,
    assignTestToBatch,
    unassignTestFromBatch,
    assignStudentToBatch,
    removeStudentFromBatch
  } = useData();

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [archiveWarning, setArchiveWarning] = useState(null);
  const [completionModalBatch, setCompletionModalBatch] = useState(null);
  const [cleanupModalBatch, setCleanupModalBatch] = useState(null);
  const [deleteModalBatch, setDeleteModalBatch] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'ARCHIVED' | 'COMPLETED'

  // Batch Operations Hub state
  const [hubBatch, setHubBatch] = useState(null);
  const [hubActiveTab, setHubActiveTab] = useState('students'); // 'students' | 'courses' | 'tests' | 'settings'

  // Sub-forms inside Hub
  const [showEnrollNewStudentForm, setShowEnrollNewStudentForm] = useState(false);
  const [newStudentData, setNewStudentData] = useState({ name: '', email: '', phone: '' });
  const [selectedExistingStudentId, setSelectedExistingStudentId] = useState('');
  const [selectedCourseToAttach, setSelectedCourseToAttach] = useState('');
  const [selectedTestToAssign, setSelectedTestToAssign] = useState('');

  // Quick Test Creator in Hub
  const [showCreateTestForm, setShowCreateTestForm] = useState(false);
  const [newTestData, setNewTestData] = useState({ title: '', description: '', passingPercentage: 70, allowRetake: true });

  // Batch Creation Form
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: createErrors }
  } = useForm({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      name: '',
      description: '',
      capacity: 10,
      feeAmount: 3000,
      startDate: new Date().toISOString().split('T')[0]
    }
  });

  // Batch Edit Form
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: editErrors }
  } = useForm({
    resolver: zodResolver(batchSchema)
  });

  // Synchronize current hubBatch with latest batches state
  const currentBatch = batches.find((b) => b.id === hubBatch?.id) || hubBatch;

  // Helpers to get entities associated with a batch
  const getBatchCourses = (batch) => {
    if (!batch) return [];
    return courses.filter(
      (c) =>
        c.batchId === batch.id ||
        (Array.isArray(c.batchIds) && c.batchIds.includes(batch.id)) ||
        (Array.isArray(batch.courseIds) && batch.courseIds.includes(c.id))
    );
  };

  const getBatchTests = (batch) => {
    if (!batch) return [];
    return tests.filter(
      (t) =>
        (Array.isArray(t.assignedBatchIds) && t.assignedBatchIds.includes(batch.id)) ||
        (Array.isArray(t.batchIds) && t.batchIds.includes(batch.id)) ||
        (Array.isArray(batch.testIds) && batch.testIds.includes(t.id))
    );
  };

  const getBatchStudents = (batch) => {
    if (!batch) return [];
    return students.filter((s) => s.batchId === batch.id);
  };

  // Open Hub Modal
  const handleOpenHub = (batch, tab = 'students') => {
    setHubBatch(batch);
    setHubActiveTab(tab);
    setShowEnrollNewStudentForm(false);
    setShowCreateTestForm(false);
    setSelectedExistingStudentId('');
    setSelectedCourseToAttach('');
    setSelectedTestToAssign('');
    resetEdit({
      name: batch.name || '',
      description: batch.description || '',
      capacity: batch.capacity || 30,
      feeAmount: batch.feeAmount || 5000,
      startDate: batch.startDate || new Date().toISOString().split('T')[0]
    });
  };

  // Create Batch Submit
  const onSubmitCreate = (formData) => {
    addBatch(formData);
    toast.success(`Batch "${formData.name}" created successfully.`);
    resetCreate();
    setShowCreateModal(false);
  };

  // Edit Batch Submit
  const onSubmitEdit = (formData) => {
    if (!currentBatch) return;
    updateBatch(currentBatch.id, formData);
    toast.success('Batch details updated successfully.');
  };

  // Archive / Toggle
  const handleToggleClick = (batch) => {
    const enrolledStudents = (students || []).filter((s) => s.batchId === batch.id && s.isActive !== false);
    if (batch.isActive && enrolledStudents.length > 0) {
      setArchiveWarning({
        batch,
        studentCount: enrolledStudents.length
      });
    } else {
      if (typeof toggleBatchActive === 'function') {
        toggleBatchActive(batch.id);
      } else if (typeof updateBatch === 'function') {
        updateBatch(batch.id, { isActive: !batch.isActive });
        toast.success(`Batch ${!batch.isActive ? 'activated' : 'archived'} successfully.`);
      }
    }
  };

  const confirmArchive = () => {
    if (archiveWarning) {
      if (typeof toggleBatchActive === 'function') {
        toggleBatchActive(archiveWarning.batch.id);
      } else if (typeof updateBatch === 'function') {
        updateBatch(archiveWarning.batch.id, { isActive: !archiveWarning.batch.isActive });
        toast.success(`Batch ${!archiveWarning.batch.isActive ? 'activated' : 'archived'} successfully.`);
      }
      setArchiveWarning(null);
    }
  };

  // ─── HUB ACTIONS: STUDENTS ──────────────────────────────────────────────────
  const handleEnrollNewStudent = (e) => {
    e.preventDefault();
    if (!newStudentData.name.trim() || !newStudentData.email.trim()) {
      toast.error('Please provide student name and email.');
      return;
    }

    addStudent({
      name: newStudentData.name.trim(),
      email: newStudentData.email.trim().toLowerCase(),
      phone: newStudentData.phone?.trim() || '',
      batchId: currentBatch.id,
      feeAmount: currentBatch.feeAmount || 0,
      paidFee: 0,
      feeStatus: 'Pending',
      enrolledDate: new Date().toISOString().split('T')[0],
      progress: {}
    });

    toast.success(`Student "${newStudentData.name}" enrolled into ${currentBatch.name}.`);
    setNewStudentData({ name: '', email: '', phone: '' });
    setShowEnrollNewStudentForm(false);
  };

  const handleAssignExistingStudent = () => {
    if (!selectedExistingStudentId) {
      toast.error('Please select a student to assign.');
      return;
    }
    const studentToAssign = students.find((s) => s.id === selectedExistingStudentId);
    assignStudentToBatch(selectedExistingStudentId, currentBatch.id);
    toast.success(`Student "${studentToAssign?.name || 'Selected'}" moved into ${currentBatch.name}.`);
    setSelectedExistingStudentId('');
  };

  const handleRemoveStudentFromBatch = (studentId, studentName) => {
    if (window.confirm(`Are you sure you want to remove "${studentName}" from ${currentBatch.name}? They will become an unassigned student.`)) {
      removeStudentFromBatch(studentId);
      toast.success(`Student "${studentName}" unassigned from batch.`);
    }
  };

  // ─── HUB ACTIONS: COURSES ───────────────────────────────────────────────────
  const handleAttachCourse = () => {
    if (!selectedCourseToAttach) {
      toast.error('Please select a course to attach.');
      return;
    }
    const courseToAttach = courses.find((c) => c.id === selectedCourseToAttach);
    if (!courseToAttach) return;

    attachCourseToBatch(courseToAttach.id, currentBatch.id);
    toast.success(`Course "${courseToAttach.title}" attached to ${currentBatch.name}.`);
    setSelectedCourseToAttach('');
  };

  const handleDetachCourse = (courseId, courseTitle) => {
    if (window.confirm(`Remove course "${courseTitle}" from this batch? Students will no longer see it in cohort curriculum.`)) {
      detachCourseFromBatch(courseId, currentBatch.id);
      toast.success(`Course "${courseTitle}" detached from batch.`);
    }
  };

  // ─── HUB ACTIONS: TESTS ─────────────────────────────────────────────────────
  const handleAssignTest = () => {
    if (!selectedTestToAssign) {
      toast.error('Please select a test to assign.');
      return;
    }
    const testToAssign = tests.find((t) => t.id === selectedTestToAssign);
    if (!testToAssign) return;

    assignTestToBatch(testToAssign.id, currentBatch.id);
    toast.success(`Test "${testToAssign.title}" assigned to ${currentBatch.name}.`);
    setSelectedTestToAssign('');
  };

  const handleUnassignTest = (testId, testTitle) => {
    if (window.confirm(`Unassign test "${testTitle}" from ${currentBatch.name}?`)) {
      unassignTestFromBatch(testId, currentBatch.id);
      toast.success(`Test "${testTitle}" unassigned from batch.`);
    }
  };

  const handleCreateTestForBatch = (e) => {
    e.preventDefault();
    if (!newTestData.title.trim()) {
      toast.error('Please enter a test title.');
      return;
    }

    addTest({
      title: newTestData.title.trim(),
      description: newTestData.description.trim(),
      passingPercentage: Number(newTestData.passingPercentage) || 70,
      allowRetake: Boolean(newTestData.allowRetake),
      assignedBatchIds: [currentBatch.id],
      questions: []
    });

    toast.success(`New test "${newTestData.title}" created & assigned to ${currentBatch.name}.`);
    setNewTestData({ title: '', description: '', passingPercentage: 70, allowRetake: true });
    setShowCreateTestForm(false);
  };

  return (
    <div className="space-y-4 pb-5">
      {/* Top Header Bar */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <FaLayerGroup className="text-primary" />
            <span>Batch & Cohort Operations Hub</span>
          </h4>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          className="d-flex align-items-center gap-2 align-self-start align-self-sm-auto shadow-sm rounded-pill px-3.5 py-2"
          style={{ fontSize: '0.9rem', fontWeight: 600 }}
        >
          <FaPlus size={12} />
          <span>Create New Cohort</span>
        </Button>
      </div>

      {/* Search & Status Filter Toolbar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
        {/* Search Input */}
        <div className="input-group" style={{ maxWidth: 360 }}>
          <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
            <FaSearch size={13} />
          </span>
          <Form.Control
            type="text"
            placeholder="Search cohorts by name, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-start-0 ps-0 shadow-none"
            style={{ fontSize: '0.88rem' }}
          />
          {searchQuery && (
            <button
              className="btn btn-sm btn-outline-secondary border-start-0"
              onClick={() => setSearchQuery('')}
              type="button"
            >
              ×
            </button>
          )}
        </div>

        {/* Status Filter Pills */}
        <div className="d-flex gap-1.5 p-1 rounded-pill border bg-body" style={{ borderColor: 'var(--border-color)' }}>
          {[
            { id: 'ALL', label: 'All', count: batches.length },
            { id: 'ACTIVE', label: 'Active', count: batches.filter((b) => b.isActive && !b.isCompleted).length },
            { id: 'ARCHIVED', label: 'Archived', count: batches.filter((b) => !b.isActive).length },
            { id: 'COMPLETED', label: 'Completed', count: batches.filter((b) => b.isCompleted).length }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={`btn btn-sm rounded-pill px-3 py-1 d-flex align-items-center gap-1.5 border-0 fw-semibold ${filterStatus === tab.id ? 'btn-primary text-white shadow-sm' : 'text-muted bg-transparent'
                }`}
              style={{ fontSize: '0.8rem' }}
            >
              <span>{tab.label}</span>
              <span className={`badge rounded-pill ${filterStatus === tab.id ? 'bg-white text-primary' : 'bg-secondary bg-opacity-25 text-body'}`} style={{ fontSize: '0.7rem' }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Batches Table Card */}
      <Card className="shadow-sm border rounded-4 overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead style={{ background: 'var(--bg-body)' }}>
                <tr className="small text-uppercase text-muted" style={{ letterSpacing: '0.5px' }}>
                  <th>Cohort & Curriculum</th>
                  <th>Enrollment</th>
                  <th>Tuition & Schedule</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const filteredBatches = batches.filter((b) => {
                    if (filterStatus === 'ACTIVE' && (!b.isActive || b.isCompleted)) return false;
                    if (filterStatus === 'ARCHIVED' && b.isActive) return false;
                    if (filterStatus === 'COMPLETED' && !b.isCompleted) return false;
                    if (searchQuery.trim()) {
                      const q = searchQuery.toLowerCase();
                      const matchName = (b.name || '').toLowerCase().includes(q);
                      const matchDesc = (b.description || '').toLowerCase().includes(q);
                      if (!matchName && !matchDesc) return false;
                    }
                    return true;
                  });

                  if (filteredBatches.length === 0) {
                    return (
                      <tr>
                        <td colSpan={5} className="text-center py-5 text-muted">
                          <FaLayerGroup size={32} className="text-muted opacity-50 mb-2" />
                          <div className="fw-semibold">No batches found matching criteria</div>
                          <div className="small">Try adjusting your search query or status filter.</div>
                        </td>
                      </tr>
                    );
                  }

                  return filteredBatches.map((batch) => {
                    const enrolledStudents = getBatchStudents(batch);
                    const enrolledCount = enrolledStudents.length;
                    const attachedCourses = getBatchCourses(batch);
                    const assignedTests = getBatchTests(batch);
                    const capacityPct = Math.min(100, Math.round((enrolledCount / (batch.capacity || 1)) * 100));

                    return (
                      <tr key={batch.id}>
                        {/* Cohort & Curriculum */}
                        <td style={{ minWidth: 220 }}>
                          <div className="fw-bold" style={{ color: 'var(--text-primary)', fontSize: '0.93rem' }}>
                            {batch.name}
                          </div>
                          {batch.description && (
                            <div className="text-muted small text-truncate" style={{ maxWidth: 260, fontSize: '0.78rem' }}>
                              {batch.description}
                            </div>
                          )}
                          <div className="d-flex align-items-center gap-2 mt-1">
                            <button
                              type="button"
                              onClick={() => handleOpenHub(batch, 'courses')}
                              className="btn btn-sm p-0 text-primary border-0 d-inline-flex align-items-center gap-1"
                              style={{ fontSize: '0.75rem' }}
                              title="Click to manage courses"
                            >
                              <FaBook size={10} />
                              <span>{attachedCourses.length} Courses</span>
                            </button>
                            <span className="text-muted small">•</span>
                            <button
                              type="button"
                              onClick={() => handleOpenHub(batch, 'tests')}
                              className="btn btn-sm p-0 text-info border-0 d-inline-flex align-items-center gap-1"
                              style={{ fontSize: '0.75rem' }}
                              title="Click to manage tests"
                            >
                              <FaFileAlt size={10} />
                              <span>{assignedTests.length} Tests</span>
                            </button>
                          </div>
                        </td>

                        {/* Enrollment */}
                        <td style={{ minWidth: 160 }}>
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="small fw-semibold" style={{ fontSize: '0.78rem' }}>
                              {enrolledCount} / {batch.capacity} Students
                            </span>
                            <span
                              className={`badge rounded-pill ${enrolledCount >= batch.capacity
                                ? 'bg-danger-subtle text-danger border border-danger-subtle'
                                : enrolledCount > 0
                                  ? 'bg-primary-subtle text-primary border border-primary-subtle'
                                  : 'bg-light text-muted border'
                                }`}
                              style={{ fontSize: '0.68rem' }}
                            >
                              {capacityPct}% Full
                            </span>
                          </div>
                          <div className="progress rounded-pill" style={{ height: 6, background: 'var(--bg-body)' }}>
                            <div
                              className={`progress-bar rounded-pill ${enrolledCount >= batch.capacity ? 'bg-danger' : 'bg-primary'}`}
                              style={{ width: `${capacityPct}%` }}
                            />
                          </div>
                        </td>

                        {/* Tuition & Schedule */}
                        <td>
                          <div className="fw-bold font-monospace" style={{ color: '#16a34a', fontSize: '0.92rem' }}>
                            ₹{batch.feeAmount?.toLocaleString()}
                          </div>
                          <div className="small text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.76rem' }}>
                            <FaCalendarAlt size={10} />
                            <span>Starts: {batch.startDate || 'Immediate'}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td>
                          {batch.isCompleted ? (
                            <Badge bg="info" className="text-dark rounded-pill px-2.5 py-1">
                              Completed
                            </Badge>
                          ) : (
                            <Badge
                              bg={batch.isActive ? 'success' : 'secondary'}
                              className="rounded-pill px-2.5 py-1"
                            >
                              {batch.isActive ? 'Active' : 'Archived'}
                            </Badge>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="text-end">
                          <div className="d-inline-flex gap-1.5 align-items-center justify-content-end flex-wrap">
                            {/* Manage Hub Button */}
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleOpenHub(batch, 'students')}
                              className="d-inline-flex align-items-center gap-1.5 rounded-pill px-3 shadow-sm"
                              style={{ fontSize: '0.82rem', fontWeight: 600 }}
                              title="Manage Students, Courses, Tests & Settings"
                            >
                              <FaCogs size={12} />
                              <span>Manage</span>
                            </Button>

                            {/* Quick Edit */}
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handleOpenHub(batch, 'settings')}
                              className="rounded-pill px-2.5"
                              title="Edit Batch Settings"
                            >
                              <FaEdit size={11} />
                            </Button>

                            {/* Mark Complete */}
                            {batch.isActive && !batch.isCompleted && (
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => setCompletionModalBatch(batch)}
                                className="rounded-pill px-2.5"
                                title="Mark cohort complete"
                              >
                                <FaGraduationCap size={12} />
                              </Button>
                            )}

                            {/* Archive / Activate */}
                            <Button
                              variant={batch.isActive ? 'outline-warning' : 'outline-success'}
                              size="sm"
                              onClick={() => handleToggleClick(batch)}
                              className="rounded-pill px-2.5"
                              title={batch.isActive ? 'Archive cohort' : 'Activate cohort'}
                            >
                              {batch.isActive ? <FaArchive size={11} /> : <FaCheckCircle size={11} />}
                            </Button>

                            {/* Delete Batch */}
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => setDeleteModalBatch(batch)}
                              className="rounded-pill px-2.5"
                              title="Delete this cohort"
                            >
                              <FaTrash size={11} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* BATCH OPERATIONS HUB MODAL (Students, Courses, Tests, Settings) */}
      {currentBatch && (
        <Modal
          show={Boolean(hubBatch)}
          onHide={() => setHubBatch(null)}
          size="xl"
          centered
          className="batch-hub-modal"
        >
          <Modal.Header closeButton style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
            <div className="d-flex align-items-center gap-2.5">
              <span className="p-2.5 rounded-3 bg-primary bg-opacity-10 text-primary d-inline-flex">
                <FaLayerGroup size={20} />
              </span>
              <div>
                <Modal.Title className="fs-5 fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>
                  {currentBatch.name} · Operations Hub
                </Modal.Title>
                <span className="small text-muted">
                  Batch ID: <code className="text-muted">{currentBatch.id}</code> · Started: {currentBatch.startDate}
                </span>
              </div>
            </div>
          </Modal.Header>

          <Modal.Body className="p-0" style={{ background: 'var(--card-bg)' }}>
            {/* Hub Navigation Tabs */}
            <div className="border-bottom px-4 pt-3" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-body)' }}>
              <Nav variant="tabs" activeKey={hubActiveTab} onSelect={(k) => setHubActiveTab(k || 'students')} className="border-0">
                <Nav.Item>
                  <Nav.Link eventKey="students" className="d-flex align-items-center gap-2 fw-semibold">
                    <FaUsers size={13} />
                    <span>Enrolled Students</span>
                    <Badge bg="primary" pill className="ms-1">
                      {getBatchStudents(currentBatch).length}
                    </Badge>
                  </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                  <Nav.Link eventKey="courses" className="d-flex align-items-center gap-2 fw-semibold">
                    <FaBook size={13} />
                    <span>Attached Courses</span>
                    <Badge bg="success" pill className="ms-1">
                      {getBatchCourses(currentBatch).length}
                    </Badge>
                  </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                  <Nav.Link eventKey="tests" className="d-flex align-items-center gap-2 fw-semibold">
                    <FaFileAlt size={13} />
                    <span>Assigned Tests</span>
                    <Badge bg="info" pill className="ms-1 text-dark">
                      {getBatchTests(currentBatch).length}
                    </Badge>
                  </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                  <Nav.Link eventKey="settings" className="d-flex align-items-center gap-2 fw-semibold">
                    <FaCogs size={13} />
                    <span>Batch Settings & Edit</span>
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </div>

            {/* Tab Contents */}
            <div className="p-4" style={{ minHeight: '380px' }}>
              {/* ────────────────────────────────────────────────────────────── */}
              {/* TAB 1: ENROLLED STUDENTS                                      */}
              {/* ────────────────────────────────────────────────────────────── */}
              {hubActiveTab === 'students' && (() => {
                const batchStudents = getBatchStudents(currentBatch);
                const unassignedStudents = students.filter((s) => s.batchId !== currentBatch.id && s.isActive !== false);
                const attachedCourses = getBatchCourses(currentBatch);
                const allCohortTopics = attachedCourses.flatMap((c) => (c.modules || []).flatMap((m) => m.topics || []));

                return (
                  <div>
                    {/* Capacity Alert & Quick Actions Bar */}
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 p-3 rounded-3 border mb-4" style={{ background: 'var(--bg-body)', borderColor: 'var(--border-color)' }}>
                      <div>
                        <div className="fw-bold small mb-1" style={{ color: 'var(--text-primary)' }}>
                          Cohort Capacity: {batchStudents.length} / {currentBatch.capacity} Students Enrolled
                        </div>
                        <div className="small text-muted" style={{ fontSize: '0.78rem' }}>
                          {currentBatch.capacity - batchStudents.length > 0
                            ? `${currentBatch.capacity - batchStudents.length} seats available for new student enrollments.`
                            : 'Cohort capacity reached.'}
                        </div>
                      </div>

                      <div className="d-flex gap-2 flex-wrap">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setShowEnrollNewStudentForm(!showEnrollNewStudentForm)}
                          className="d-inline-flex align-items-center gap-1.5 rounded-pill px-3 shadow-sm"
                        >
                          <FaUserPlus size={12} />
                          <span>{showEnrollNewStudentForm ? 'Hide Form' : 'Enroll New Student'}</span>
                        </Button>
                      </div>
                    </div>

                    {/* Inline Form: Enroll New Student */}
                    {showEnrollNewStudentForm && (
                      <Card className="border p-3 mb-4 rounded-3 shadow-sm" style={{ background: 'var(--card-bg)', borderColor: 'var(--bs-primary)' }}>
                        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--bs-primary)' }}>
                          <FaUserPlus />
                          <span>Enroll New Student Directly into {currentBatch.name}</span>
                        </h6>
                        <Form onSubmit={handleEnrollNewStudent}>
                          <div className="row g-3">
                            <div className="col-md-4">
                              <Form.Label className="small fw-semibold">Full Name *</Form.Label>
                              <Form.Control
                                size="sm"
                                placeholder="e.g. John Doe"
                                value={newStudentData.name}
                                onChange={(e) => setNewStudentData({ ...newStudentData, name: e.target.value })}
                                required
                              />
                            </div>
                            <div className="col-md-4">
                              <Form.Label className="small fw-semibold">Email Address *</Form.Label>
                              <Form.Control
                                size="sm"
                                type="email"
                                placeholder="john@example.com"
                                value={newStudentData.email}
                                onChange={(e) => setNewStudentData({ ...newStudentData, email: e.target.value })}
                                required
                              />
                            </div>
                            <div className="col-md-4">
                              <Form.Label className="small fw-semibold">Phone (Optional)</Form.Label>
                              <Form.Control
                                size="sm"
                                placeholder="+91 9876543210"
                                value={newStudentData.phone}
                                onChange={(e) => setNewStudentData({ ...newStudentData, phone: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="d-flex justify-content-end gap-2 mt-3">
                            <Button variant="secondary" size="sm" onClick={() => setShowEnrollNewStudentForm(false)}>
                              Cancel
                            </Button>
                            <Button variant="primary" size="sm" type="submit">
                              Enroll Student
                            </Button>
                          </div>
                        </Form>
                      </Card>
                    )}

                    {/* Assign Existing Student Toolbar */}
                    {unassignedStudents.length > 0 && (
                      <div className="p-3 rounded-3 border mb-4 d-flex flex-column flex-sm-row align-items-sm-center gap-2.5" style={{ background: 'var(--bg-body)', borderColor: 'var(--border-color)' }}>
                        <span className="small fw-semibold text-muted d-flex align-items-center gap-1.5 flex-shrink-0">
                          <FaLink size={12} className="text-primary" />
                          <span>Assign Existing Student:</span>
                        </span>
                        <Form.Select
                          size="sm"
                          value={selectedExistingStudentId}
                          onChange={(e) => setSelectedExistingStudentId(e.target.value)}
                          className="rounded-3"
                          style={{ maxWidth: 380 }}
                        >
                          <option value="">-- Choose a student to transfer into this batch --</option>
                          {unassignedStudents.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.email}) {s.batchId ? `[Current: ${s.batchId}]` : '[Unassigned]'}
                            </option>
                          ))}
                        </Form.Select>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={handleAssignExistingStudent}
                          disabled={!selectedExistingStudentId}
                          className="rounded-pill px-3"
                        >
                          Transfer to Batch
                        </Button>
                      </div>
                    )}

                    {/* Students List Table */}
                    {batchStudents.length === 0 ? (
                      <div className="text-center py-5 border rounded-3" style={{ background: 'var(--bg-body)' }}>
                        <FaUsers size={36} className="text-muted opacity-40 mb-2" />
                        <h6 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>No Students Enrolled Yet</h6>
                        <p className="small text-muted mb-3">Enroll new candidates or assign existing students to this cohort.</p>
                        <Button variant="primary" size="sm" onClick={() => setShowEnrollNewStudentForm(true)} className="rounded-pill">
                          <FaUserPlus size={11} className="me-1" />
                          <span>Enroll First Student</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="table-responsive border rounded-3">
                        <Table hover className="mb-0 align-middle">
                          <thead style={{ background: 'var(--bg-body)' }}>
                            <tr className="small text-uppercase" style={{ fontSize: '0.74rem' }}>
                              <th>Student Name</th>
                              <th>Contact</th>
                              <th>Curriculum Progress</th>
                              <th>Tuition Status</th>
                              <th>Enrolled Date</th>
                              <th className="text-end">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {batchStudents.map((st) => {
                              // Compute topic progress across this batch's courses
                              const completedTopics = allCohortTopics.filter(
                                (t) => st.progress?.[t.id] === 'completed' || st.progress?.[t.id] === true || st.quizAttempts?.[t.id]?.passed
                              ).length;
                              const progressPct = allCohortTopics.length > 0
                                ? Math.round((completedTopics / allCohortTopics.length) * 100)
                                : 0;

                              return (
                                <tr key={st.id}>
                                  <td>
                                    <div className="fw-bold" style={{ color: 'var(--text-primary)' }}>{st.name}</div>
                                    <div className="text-muted small" style={{ fontSize: '0.74rem' }}>ID: {st.id}</div>
                                  </td>
                                  <td className="small">
                                    <div>{st.email}</div>
                                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{st.phone || '—'}</div>
                                  </td>
                                  <td style={{ minWidth: 150 }}>
                                    <div className="d-flex justify-content-between align-items-center mb-1 small">
                                      <span>{completedTopics}/{allCohortTopics.length} topics</span>
                                      <span className="fw-bold text-primary">{progressPct}%</span>
                                    </div>
                                    <div className="progress rounded-pill" style={{ height: 6 }}>
                                      <div className="progress-bar bg-success" style={{ width: `${progressPct}%` }} />
                                    </div>
                                  </td>
                                  <td>
                                    <Badge
                                      bg={st.feeStatus === 'Paid' ? 'success' : 'warning'}
                                      text={st.feeStatus === 'Paid' ? 'white' : 'dark'}
                                      className="rounded-pill px-2 py-1"
                                    >
                                      {st.feeStatus || 'Pending'}
                                    </Badge>
                                  </td>
                                  <td className="small text-muted">{st.enrolledDate || '—'}</td>
                                  <td className="text-end">
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      onClick={() => handleRemoveStudentFromBatch(st.id, st.name)}
                                      className="d-inline-flex align-items-center gap-1 rounded-pill px-2.5"
                                      title="Remove student from this batch"
                                    >
                                      <FaUnlink size={11} />
                                      <span>Remove</span>
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ────────────────────────────────────────────────────────────── */}
              {/* TAB 2: ATTACHED COURSES                                       */}
              {/* ────────────────────────────────────────────────────────────── */}
              {hubActiveTab === 'courses' && (() => {
                const batchCourses = getBatchCourses(currentBatch);
                const unattachedCourses = courses.filter(
                  (c) => !batchCourses.some((bc) => bc.id === c.id)
                );

                return (
                  <div>
                    {/* Header info */}
                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 p-3 rounded-3 border mb-4" style={{ background: 'var(--bg-body)', borderColor: 'var(--border-color)' }}>
                      <div>
                        <h6 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                          Assigned Cohort Curriculum ({batchCourses.length} Courses)
                        </h6>
                        <span className="small text-muted">
                          All courses attached here are automatically available in the student portal curriculum for this batch.
                        </span>
                      </div>
                    </div>

                    {/* Attach Course from Catalog Toolbar */}
                    <div className="p-3 rounded-3 border mb-4 d-flex flex-column flex-sm-row align-items-sm-center gap-2.5" style={{ background: 'var(--bg-body)', borderColor: 'var(--border-color)' }}>
                      <span className="small fw-semibold text-muted d-flex align-items-center gap-1.5 flex-shrink-0">
                        <FaLink size={12} className="text-success" />
                        <span>Attach Course from Catalog:</span>
                      </span>
                      <Form.Select
                        size="sm"
                        value={selectedCourseToAttach}
                        onChange={(e) => setSelectedCourseToAttach(e.target.value)}
                        className="rounded-3"
                        style={{ maxWidth: 420 }}
                        disabled={unattachedCourses.length === 0}
                      >
                        <option value="">
                          {unattachedCourses.length === 0 ? '-- All available courses already attached --' : '-- Select a course to attach to this cohort --'}
                        </option>
                        {unattachedCourses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title} ({c.modules?.length || 0} modules)
                          </option>
                        ))}
                      </Form.Select>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={handleAttachCourse}
                        disabled={!selectedCourseToAttach}
                        className="rounded-pill px-3 fw-semibold"
                      >
                        + Attach to Batch
                      </Button>
                    </div>

                    {/* Attached Courses List */}
                    {batchCourses.length === 0 ? (
                      <div className="text-center py-5 border rounded-3" style={{ background: 'var(--bg-body)' }}>
                        <FaBook size={36} className="text-muted opacity-40 mb-2" />
                        <h6 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>No Courses Attached to this Batch</h6>
                        <p className="small text-muted mb-0">Use the selector above to attach training courses from your catalog.</p>
                      </div>
                    ) : (
                      <div className="row g-3">
                        {batchCourses.map((c) => {
                          const topicsCount = (c.modules || []).flatMap((m) => m.topics || []).length;
                          const quizzesCount = (c.modules || []).flatMap((m) => m.topics || []).reduce(
                            (sum, t) => sum + (t.quizQuestions?.length || 0),
                            0
                          );

                          return (
                            <div key={c.id} className="col-md-6">
                              <div className="card p-3 rounded-3 border h-100 shadow-sm" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                                <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                                  <div>
                                    <h6 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>{c.title}</h6>
                                    <span className="small text-muted text-truncate d-block" style={{ maxWidth: 340 }}>
                                      {c.description || 'Cohort curriculum course'}
                                    </span>
                                  </div>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleDetachCourse(c.id, c.title)}
                                    className="rounded-pill px-2.5 py-1 text-nowrap"
                                    title="Detach from batch"
                                  >
                                    <FaUnlink size={11} className="me-1" />
                                    <span>Detach</span>
                                  </Button>
                                </div>

                                <div className="d-flex align-items-center gap-3 mt-auto pt-2 border-top small text-muted" style={{ borderColor: 'var(--border-color)', fontSize: '0.78rem' }}>
                                  <span><strong>{c.modules?.length || 0}</strong> Modules</span>
                                  <span><strong>{topicsCount}</strong> Topics</span>
                                  {quizzesCount > 0 && <span><strong>{quizzesCount}</strong> Quizzes</span>}
                                  <span className="ms-auto badge bg-success-subtle text-success border border-success-subtle rounded-pill">
                                    Assigned
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ────────────────────────────────────────────────────────────── */}
              {/* TAB 3: ASSIGNED TESTS                                         */}
              {/* ────────────────────────────────────────────────────────────── */}
              {hubActiveTab === 'tests' && (() => {
                const batchTests = getBatchTests(currentBatch);
                const unassignedTests = tests.filter(
                  (t) => !batchTests.some((bt) => bt.id === t.id)
                );

                return (
                  <div>
                    {/* Header info */}
                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 p-3 rounded-3 border mb-4" style={{ background: 'var(--bg-body)', borderColor: 'var(--border-color)' }}>
                      <div>
                        <h6 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                          Assigned Assessments & Tests ({batchTests.length} Tests)
                        </h6>
                        <span className="small text-muted">
                          Enrolled students will have access to these tests in their test assessment center.
                        </span>
                      </div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => setShowCreateTestForm(!showCreateTestForm)}
                        className="rounded-pill px-3"
                      >
                        <FaPlus size={11} className="me-1" />
                        <span>{showCreateTestForm ? 'Hide Form' : 'Quick Create Test'}</span>
                      </Button>
                    </div>

                    {/* Quick Create Test Form */}
                    {showCreateTestForm && (
                      <Card className="border p-3 mb-4 rounded-3 shadow-sm" style={{ background: 'var(--card-bg)', borderColor: 'var(--bs-primary)' }}>
                        <h6 className="fw-bold mb-3 text-primary d-flex align-items-center gap-2">
                          <FaClipboardList />
                          <span>Create New Assessment Directly for {currentBatch.name}</span>
                        </h6>
                        <Form onSubmit={handleCreateTestForBatch}>
                          <div className="row g-3">
                            <div className="col-md-6">
                              <Form.Label className="small fw-semibold">Test Title *</Form.Label>
                              <Form.Control
                                size="sm"
                                placeholder="e.g. Python Fundamentals Final Benchmark"
                                value={newTestData.title}
                                onChange={(e) => setNewTestData({ ...newTestData, title: e.target.value })}
                                required
                              />
                            </div>
                            <div className="col-md-6">
                              <Form.Label className="small fw-semibold">Passing Score (%)</Form.Label>
                              <Form.Control
                                size="sm"
                                type="number"
                                min="1"
                                max="100"
                                value={newTestData.passingPercentage}
                                onChange={(e) => setNewTestData({ ...newTestData, passingPercentage: e.target.value })}
                              />
                            </div>
                            <div className="col-12">
                              <Form.Label className="small fw-semibold">Description</Form.Label>
                              <Form.Control
                                size="sm"
                                placeholder="Instructions or overview for students taking this test..."
                                value={newTestData.description}
                                onChange={(e) => setNewTestData({ ...newTestData, description: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="d-flex justify-content-end gap-2 mt-3">
                            <Button variant="secondary" size="sm" onClick={() => setShowCreateTestForm(false)}>
                              Cancel
                            </Button>
                            <Button variant="primary" size="sm" type="submit">
                              Save & Assign Test
                            </Button>
                          </div>
                        </Form>
                      </Card>
                    )}

                    {/* Assign Existing Test Toolbar */}
                    <div className="p-3 rounded-3 border mb-4 d-flex flex-column flex-sm-row align-items-sm-center gap-2.5" style={{ background: 'var(--bg-body)', borderColor: 'var(--border-color)' }}>
                      <span className="small fw-semibold text-muted d-flex align-items-center gap-1.5 flex-shrink-0">
                        <FaLink size={12} className="text-info" />
                        <span>Assign Test from Catalog:</span>
                      </span>
                      <Form.Select
                        size="sm"
                        value={selectedTestToAssign}
                        onChange={(e) => setSelectedTestToAssign(e.target.value)}
                        className="rounded-3"
                        style={{ maxWidth: 420 }}
                        disabled={unassignedTests.length === 0}
                      >
                        <option value="">
                          {unassignedTests.length === 0 ? '-- All available tests already assigned --' : '-- Select a test to assign to this batch --'}
                        </option>
                        {unassignedTests.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.title} ({t.questions?.length || 0} questions · Pass: {t.passingPercentage || 70}%)
                          </option>
                        ))}
                      </Form.Select>
                      <Button
                        variant="info"
                        size="sm"
                        onClick={handleAssignTest}
                        disabled={!selectedTestToAssign}
                        className="rounded-pill px-3 fw-semibold text-dark"
                      >
                        + Assign to Batch
                      </Button>
                    </div>

                    {/* Assigned Tests List */}
                    {batchTests.length === 0 ? (
                      <div className="text-center py-5 border rounded-3" style={{ background: 'var(--bg-body)' }}>
                        <FaFileAlt size={36} className="text-muted opacity-40 mb-2" />
                        <h6 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>No Tests Assigned to this Batch</h6>
                        <p className="small text-muted mb-0">Select an existing test or create a new assessment for this cohort.</p>
                      </div>
                    ) : (
                      <div className="row g-3">
                        {batchTests.map((t) => (
                          <div key={t.id} className="col-md-6">
                            <div className="card p-3 rounded-3 border h-100 shadow-sm" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                              <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                                <div>
                                  <h6 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>{t.title}</h6>
                                  <span className="small text-muted text-truncate d-block" style={{ maxWidth: 340 }}>
                                    {t.description || 'Cohort assessment'}
                                  </span>
                                </div>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleUnassignTest(t.id, t.title)}
                                  className="rounded-pill px-2.5 py-1 text-nowrap"
                                  title="Unassign from batch"
                                >
                                  <FaUnlink size={11} className="me-1" />
                                  <span>Unassign</span>
                                </Button>
                              </div>

                              <div className="d-flex align-items-center gap-3 mt-auto pt-2 border-top small text-muted" style={{ borderColor: 'var(--border-color)', fontSize: '0.78rem' }}>
                                <span><strong>{t.questions?.length || 0}</strong> Questions</span>
                                <span>Pass: <strong>{t.passingPercentage || 70}%</strong></span>
                                <span>{t.allowRetake ? 'Retakes Allowed' : 'Single Attempt'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ────────────────────────────────────────────────────────────── */}
              {/* TAB 4: BATCH SETTINGS & EDIT                                  */}
              {/* ────────────────────────────────────────────────────────────── */}
              {hubActiveTab === 'settings' && (
                <div style={{ maxWidth: '650px' }}>
                  <h6 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                    Edit Cohort Configuration & Pricing
                  </h6>
                  <Form onSubmit={handleSubmitEdit(onSubmitEdit)}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-semibold">Cohort / Batch Name *</Form.Label>
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
                      <Form.Label className="small fw-semibold">Cohort Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        {...registerEdit('description')}
                      />
                    </Form.Group>

                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <Form.Label className="small fw-semibold">Student Capacity *</Form.Label>
                        <Form.Control
                          type="number"
                          min="1"
                          {...registerEdit('capacity')}
                          isInvalid={!!editErrors.capacity}
                        />
                        <Form.Control.Feedback type="invalid">
                          {editErrors.capacity?.message}
                        </Form.Control.Feedback>
                      </div>

                      <div className="col-md-6">
                        <Form.Label className="small fw-semibold">Tuition Fee (₹) *</Form.Label>
                        <Form.Control
                          type="number"
                          min="0"
                          {...registerEdit('feeAmount')}
                          isInvalid={!!editErrors.feeAmount}
                        />
                        <Form.Control.Feedback type="invalid">
                          {editErrors.feeAmount?.message}
                        </Form.Control.Feedback>
                      </div>
                    </div>

                    <Form.Group className="mb-4">
                      <Form.Label className="small fw-semibold">Cohort Start Date *</Form.Label>
                      <Form.Control
                        type="date"
                        {...registerEdit('startDate')}
                        isInvalid={!!editErrors.startDate}
                      />
                      <Form.Control.Feedback type="invalid">
                        {editErrors.startDate?.message}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 pt-2">
                      <div className="d-flex gap-2">
                        <Button
                          variant={currentBatch.isActive ? 'outline-warning' : 'outline-success'}
                          size="sm"
                          onClick={() => handleToggleClick(currentBatch)}
                          className="rounded-pill px-3"
                        >
                          {currentBatch.isActive ? 'Archive Cohort' : 'Activate Cohort'}
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => setDeleteModalBatch(currentBatch)}
                          className="rounded-pill px-3 d-flex align-items-center gap-1.5"
                        >
                          <FaTrash size={11} />
                          <span>Delete Batch</span>
                        </Button>
                      </div>

                      <Button variant="primary" type="submit" className="rounded-pill px-4 shadow-sm fw-semibold">
                        Save Batch Updates
                      </Button>
                    </div>
                  </Form>
                </div>
              )}
            </div>
          </Modal.Body>

          <Modal.Footer style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
            <Button variant="secondary" size="sm" onClick={() => setHubBatch(null)} className="rounded-pill px-3">
              Close Hub
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* CREATE BATCH MODAL */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
        <Modal.Header closeButton style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
          <Modal.Title className="fs-5 fw-bold" style={{ color: 'var(--text-primary)' }}>Create New Batch Cohort</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitCreate(onSubmitCreate)}>
          <Modal.Body className="space-y-3" style={{ background: 'var(--card-bg)' }}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Batch Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Full Stack Python Dev (Evening Batch)"
                {...registerCreate('name')}
                isInvalid={!!createErrors.name}
              />
              <Form.Control.Feedback type="invalid">
                {createErrors.name?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Cohort description, timing details, or syllabus scope..."
                {...registerCreate('description')}
              />
            </Form.Group>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <Form.Label className="fw-semibold small">Student Capacity</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  {...registerCreate('capacity')}
                  isInvalid={!!createErrors.capacity}
                />
                <Form.Control.Feedback type="invalid">
                  {createErrors.capacity?.message}
                </Form.Control.Feedback>
              </div>

              <div className="col-md-6">
                <Form.Label className="fw-semibold small">Tuition Fee (₹)</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  {...registerCreate('feeAmount')}
                  isInvalid={!!createErrors.feeAmount}
                />
                <Form.Control.Feedback type="invalid">
                  {createErrors.feeAmount?.message}
                </Form.Control.Feedback>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Cohort Start Date</Form.Label>
              <Form.Control
                type="date"
                {...registerCreate('startDate')}
                isInvalid={!!createErrors.startDate}
              />
              <Form.Control.Feedback type="invalid">
                {createErrors.startDate?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
            <Button variant="secondary" size="sm" onClick={() => setShowCreateModal(false)} className="rounded-pill">
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="rounded-pill px-3 fw-semibold">
              Save Cohort
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ARCHIVE WARNING MODAL */}
      <Modal show={Boolean(archiveWarning)} onHide={() => setArchiveWarning(null)} centered>
        <Modal.Header closeButton className="bg-warning bg-opacity-10">
          <Modal.Title className="fs-5 fw-bold text-warning-emphasis d-flex align-items-center gap-2">
            <FaExclamationTriangle className="text-warning" />
            <span>Warning: Active Students Enrolled</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-2">
            The batch <strong>"{archiveWarning?.batch.name}"</strong> currently has{' '}
            <strong className="text-danger">{archiveWarning?.studentCount} active students</strong> enrolled.
          </p>
          <p className="text-muted small mb-0">
            Archiving this batch will mark it inactive. Are you sure you want to proceed?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setArchiveWarning(null)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={confirmArchive}>
            Yes, Archive Batch
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MARK BATCH COMPLETE CONFIRMATION MODAL */}
      {completionModalBatch && (() => {
        const batchStudents = students.filter((s) => s.batchId === completionModalBatch.id);
        const studentIds = batchStudents.map((s) => s.id);

        const pendingFeeStudents = batchStudents.filter((s) => {
          const sFees = fees.filter((f) => f.studentId === s.id);
          return sFees.some((f) => f.status === 'PENDING') || sFees.length === 0;
        });

        const batchAssignments = assignments.filter(
          (a) => Array.isArray(a.batchIds) && a.batchIds.includes(completionModalBatch.id)
        );
        const totalSubmissionsNeeded = batchAssignments.length * batchStudents.length;
        const completedSubmissionsCount = submissions.filter((sub) => studentIds.includes(sub.studentId)).length;

        const batchTests = getBatchTests(completionModalBatch);
        const totalTestsNeeded = batchTests.length * batchStudents.length;
        const completedTestsCount = testAttempts.filter((ta) => studentIds.includes(ta.studentId)).length;

        const handleConfirmCompletion = async () => {
          const batchToComplete = completionModalBatch;
          if (markBatchComplete) {
            await markBatchComplete(batchToComplete.id);
            toast.success(`Batch "${batchToComplete.name}" completed & snapshot archived.`);
          }
          setCompletionModalBatch(null);
          // Prompt option to clean up activity data
          setCleanupModalBatch(batchToComplete);
          setDeleteConfirmText('');
        };

        return (
          <Modal show={true} onHide={() => setCompletionModalBatch(null)} size="lg" centered>
            <Modal.Header closeButton style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
              <Modal.Title className="fs-5 fw-bold d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <span className="p-2 rounded-3 bg-success bg-opacity-10 text-success d-inline-flex">
                  <FaGraduationCap size={20} />
                </span>
                <span>Mark Batch as Complete?</span>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ background: 'var(--card-bg)' }}>
              <div className="mb-3">
                <h5 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {completionModalBatch.name}
                </h5>
                <p className="text-muted small mb-0">
                  {completionModalBatch.description || 'Cohort completion audit & student graduation snapshot.'}
                </p>
              </div>

              {/* Stat summary cards */}
              <div className="row g-3 mb-4">
                <div className="col-sm-6 col-md-3">
                  <div className="p-3 rounded-3 border h-100" style={{ background: 'var(--bg-body)', borderColor: 'var(--border-color)' }}>
                    <div className="small text-muted fw-semibold mb-1">Enrolled Students</div>
                    <div className="fs-4 fw-bold text-primary">{batchStudents.length}</div>
                    <div className="small text-muted" style={{ fontSize: '0.75rem' }}>Active cohort size</div>
                  </div>
                </div>

                <div className="col-sm-6 col-md-3">
                  <div className="p-3 rounded-3 border h-100" style={{ background: 'var(--bg-body)', borderColor: 'var(--border-color)' }}>
                    <div className="small text-muted fw-semibold mb-1">Assignments</div>
                    <div className="fs-4 fw-bold text-success">
                      {completedSubmissionsCount} / {totalSubmissionsNeeded || batchAssignments.length}
                    </div>
                    <div className="small text-muted" style={{ fontSize: '0.75rem' }}>Submissions filed</div>
                  </div>
                </div>

                <div className="col-sm-6 col-md-3">
                  <div className="p-3 rounded-3 border h-100" style={{ background: 'var(--bg-body)', borderColor: 'var(--border-color)' }}>
                    <div className="small text-muted fw-semibold mb-1">Tests Completed</div>
                    <div className="fs-4 fw-bold text-info">
                      {completedTestsCount} / {totalTestsNeeded || batchTests.length}
                    </div>
                    <div className="small text-muted" style={{ fontSize: '0.75rem' }}>Attempts logged</div>
                  </div>
                </div>

                <div className="col-sm-6 col-md-3">
                  <div className="p-3 rounded-3 border h-100" style={{ background: 'var(--bg-body)', borderColor: 'var(--border-color)' }}>
                    <div className="small text-muted fw-semibold mb-1">Pending Fees</div>
                    <div className={`fs-4 fw-bold ${pendingFeeStudents.length > 0 ? 'text-warning' : 'text-success'}`}>
                      {pendingFeeStudents.length} <small className="fs-6 text-muted">students</small>
                    </div>
                    <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                      {pendingFeeStudents.length > 0 ? 'Unpaid dues exist' : 'All fees cleared'}
                    </div>
                  </div>
                </div>
              </div>

              {pendingFeeStudents.length > 0 && (
                <Alert variant="warning" className="d-flex align-items-start gap-2 mb-3">
                  <FaExclamationCircle className="mt-1 flex-shrink-0" />
                  <div>
                    <strong>Pending Tuition Alert:</strong> {pendingFeeStudents.length} student(s) ({pendingFeeStudents.map((s) => s.name).join(', ')}) still have unpaid or pending tuition fees. Completing the batch will archive their profile.
                  </div>
                </Alert>
              )}

              <Alert variant="info" className="d-flex align-items-start gap-2 mb-0">
                <FaGraduationCap className="mt-1 flex-shrink-0" />
                <div className="small">
                  <strong>Graduation Action:</strong> Completing this batch will transition all <strong>{batchStudents.length}</strong> active students to <strong>"Graduated / Alumni"</strong> status, moving them to Previous Students. Historical assignment grades, test scores, and issued certificates will be permanently archived.
                </div>
              </Alert>
            </Modal.Body>
            <Modal.Footer style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
              <Button variant="secondary" size="sm" onClick={() => setCompletionModalBatch(null)}>
                Cancel
              </Button>
              <Button variant="success" size="sm" onClick={handleConfirmCompletion} className="d-flex align-items-center gap-1.5 fw-semibold px-3">
                <FaCheck size={12} />
                <span>Confirm & Mark Complete</span>
              </Button>
            </Modal.Footer>
          </Modal>
        );
      })()}

      {/* BATCH ACTIVITY CLEANUP & PURGE CONFIRMATION MODAL */}
      {cleanupModalBatch && (
        <Modal
          show={true}
          onHide={() => !isCleaningUp && setCleanupModalBatch(null)}
          centered
          size="md"
        >
          <Modal.Header closeButton={!isCleaningUp} style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
            <Modal.Title className="fs-5 fw-bold d-flex align-items-center gap-2 text-danger">
              <span className="p-2 rounded-3 bg-danger bg-opacity-10 text-danger d-inline-flex">
                <FaTrash size={18} />
              </span>
              <span>Purge & Clean Up Batch Activity</span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ background: 'var(--card-bg)' }}>
            <p className="text-muted small mb-3">
              You are about to purge transient activity for batch <strong>{cleanupModalBatch.name}</strong>.
            </p>

            <div className="p-3 rounded-3 border mb-3 bg-danger bg-opacity-10 border-danger border-opacity-25">
              <div className="fw-bold text-danger small mb-1.5 d-flex align-items-center gap-1.5">
                <FaExclamationTriangle size={14} />
                <span>The following data will be permanently removed:</span>
              </div>
              <ul className="mb-0 small text-danger ps-3" style={{ fontSize: '0.82rem' }}>
                <li>All student uploaded assignment files from storage</li>
                <li>Batch assignment submission records</li>
                <li>Batch test attempt histories & logs</li>
                <li>Batch assignments and test allocations</li>
                <li>The batch record itself</li>
              </ul>
            </div>

            <div className="p-3 rounded-3 border mb-3 bg-success bg-opacity-10 border-success border-opacity-25">
              <div className="fw-bold text-success small mb-1.5 d-flex align-items-center gap-1.5">
                <FaCheckCircle size={14} />
                <span>The following data will NEVER be deleted:</span>
              </div>
              <ul className="mb-0 small text-success ps-3" style={{ fontSize: '0.82rem' }}>
                <li>Student accounts (transferred to Alumni / Previous Students)</li>
                <li>Student course progression & module completions</li>
                <li>All fee records, invoices & payment transactions</li>
                <li>All issued certificates & verification records</li>
                <li>The batch graduation audit snapshot in completed batches</li>
              </ul>
            </div>

            <Form.Group className="mb-2">
              <Form.Label className="small fw-semibold text-muted">
                Type <span className="text-danger fw-bold font-monospace">DELETE</span> to confirm purge:
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="DELETE"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                disabled={isCleaningUp}
                className="font-monospace"
                autoFocus
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
            <Button
              variant="secondary"
              size="sm"
              disabled={isCleaningUp}
              onClick={() => setCleanupModalBatch(null)}
            >
              Keep Activity / Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={deleteConfirmText !== 'DELETE' || isCleaningUp}
              onClick={async () => {
                try {
                  setIsCleaningUp(true);
                  await cleanupBatch(cleanupModalBatch.id);
                  toast.success(`Batch activity for "${cleanupModalBatch.name}" purged successfully.`);
                  setCleanupModalBatch(null);
                  setDeleteConfirmText('');
                } catch (err) {
                  toast.error('Failed to cleanup batch: ' + (err.message || 'Unknown error'));
                } finally {
                  setIsCleaningUp(false);
                }
              }}
              className="d-flex align-items-center gap-1.5 fw-semibold px-3"
            >
              {isCleaningUp ? (
                <span>Purging...</span>
              ) : (
                <>
                  <FaTrash size={12} />
                  <span>Purge Batch Activity</span>
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* DIRECT DELETE BATCH MODAL */}
      {deleteModalBatch && (() => {
        const enrolledStudents = getBatchStudents(deleteModalBatch);
        const attachedCourses = getBatchCourses(deleteModalBatch);
        const assignedTests = getBatchTests(deleteModalBatch);

        const handleConfirmDelete = async () => {
          try {
            setIsDeleting(true);
            await deleteBatch(deleteModalBatch.id);
            toast.success(`Batch "${deleteModalBatch.name}" deleted successfully.`);
            setDeleteModalBatch(null);
            if (hubBatch?.id === deleteModalBatch.id) {
              setHubBatch(null);
            }
          } catch (err) {
            toast.error('Failed to delete batch: ' + (err.message || 'Unknown error'));
          } finally {
            setIsDeleting(false);
          }
        };

        return (
          <Modal show={true} onHide={() => !isDeleting && setDeleteModalBatch(null)} centered>
            <Modal.Header closeButton style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
              <Modal.Title className="fs-5 fw-bold text-danger d-flex align-items-center gap-2">
                <FaTrash size={16} />
                <span>Delete Batch Cohort</span>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ background: 'var(--card-bg)' }}>
              <p className="mb-2">
                Are you sure you want to delete the batch cohort <strong>"{deleteModalBatch.name}"</strong>?
              </p>

              {enrolledStudents.length > 0 ? (
                <Alert variant="warning" className="small mb-3">
                  <strong>Notice:</strong> <strong>{enrolledStudents.length} student(s)</strong> are currently assigned to this batch.
                  Deleting this batch will safely unassign them so they become unassigned students.
                  <strong> Student accounts, payments, and learning progress will NOT be deleted.</strong>
                </Alert>
              ) : (
                <p className="small text-muted mb-3">
                  This batch currently has no active enrolled students and can be safely deleted.
                </p>
              )}

              <div className="p-2.5 rounded-3 border mb-2 bg-light small text-muted">
                <div>• {attachedCourses.length} course link(s) will be unlinked</div>
                <div>• {assignedTests.length} benchmark test assignment(s) will be detached</div>
                <div>• The batch cohort record will be permanently removed</div>
              </div>
            </Modal.Body>
            <Modal.Footer style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
              <Button
                variant="secondary"
                size="sm"
                disabled={isDeleting}
                onClick={() => setDeleteModalBatch(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="d-flex align-items-center gap-1.5 fw-semibold px-3"
              >
                {isDeleting ? 'Deleting...' : (
                  <>
                    <FaTrash size={12} />
                    <span>Yes, Delete Batch</span>
                  </>
                )}
              </Button>
            </Modal.Footer>
          </Modal>
        );
      })()}
    </div>
  );
}
