import React, { useState } from 'react';
import { Table, Button, Badge, Modal, Form, Card, Row, Col, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useData } from '../../contexts/DataContext';
import {
  FaClipboardCheck,
  FaPlus,
  FaPen,
  FaEye,
  FaExternalLinkAlt,
  FaFileCode,
  FaGithub,
  FaGoogleDrive,
  FaWhatsapp,
  FaPaperPlane,
  FaTrash
} from 'react-icons/fa';
import NotificationModal from '../common/NotificationModal';
import {
  createAssignmentResultNotification,
  createAssignmentPublishedNotification
} from '../../services/notificationService';

// Zod schema for new assignment
const assignmentSchema = z.object({
  title: z.string().min(3, 'Assignment title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  deadline: z.string().min(1, 'Deadline date is required'),
  maxMarks: z.coerce.number().min(1, 'Max marks must be at least 1')
});

export default function GradingPanel() {
  const { assignments = [], submissions = [], students = [], batches = [], addAssignment, deleteAssignment, gradeSubmission } = useData();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBatches, setSelectedBatches] = useState([]);

  // Submission Viewer State
  const [viewingSub, setViewingSub] = useState(null);

  // Grading Modal State
  const [gradingSub, setGradingSub] = useState(null);
  const [gradeInput, setGradeInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [activeNotification, setActiveNotification] = useState(null);
  const [deletingAssignmentId, setDeletingAssignmentId] = useState(null);

  const handleDeleteAssignment = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete assignment "${title}"? This will permanently remove all associated student submissions.`)) {
      try {
        setDeletingAssignmentId(id);
        await deleteAssignment(id);
      } catch (err) {
        console.error('[GradingPanel] Error deleting assignment:', err);
      } finally {
        setDeletingAssignmentId(null);
      }
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: '',
      description: '',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      maxMarks: 100
    }
  });

  const onAssignmentSubmit = (data) => {
    addAssignment({
      ...data,
      batchIds: selectedBatches.length > 0 ? selectedBatches : batches.map((b) => b.id)
    });
    reset();
    setSelectedBatches([]);
    setShowCreateModal(false);
  };

  const handleBatchCheckbox = (batchId) => {
    setSelectedBatches((prev) =>
      prev.includes(batchId) ? prev.filter((id) => id !== batchId) : [...prev, batchId]
    );
  };

  const onPublishGrade = (e) => {
    e.preventDefault();
    if (gradingSub && gradeInput !== '') {
      gradeSubmission(gradingSub.id, gradeInput, feedbackInput);
      setGradingSub(null);
      setGradeInput('');
      setFeedbackInput('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <FaClipboardCheck className="text-primary" />
            <span>Assignments & Grading Queue</span>
          </h4>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          className="d-flex align-items-center gap-2 align-self-start align-self-sm-auto shadow-sm"
        >
          <FaPlus size={12} />
          <span>Create New Assignment</span>
        </Button>
      </div>

      {/* Submissions Grading Queue Table */}
      <Card className="shadow-sm border-0 mb-4 rounded-3">
        <Card.Header className="py-3 border-0" style={{ background: 'var(--card-bg)' }}>
          <h6 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>
            Student Submission Queue ({submissions.length})
          </h6>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover striped className="mb-0 align-middle">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Assignment</th>
                  <th>Submitted Asset</th>
                  <th>Date</th>
                  <th>Grade</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      No submissions waiting in queue.
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => {
                    const student = students.find((s) => s.id === sub.studentId || (s.legacyId && s.legacyId === sub.studentId));
                    const asgn = assignments.find((a) => a.id === sub.assignmentId || a.id === sub.assignment_id || (a.legacyId && a.legacyId === sub.assignmentId));
                    const maxMarks = Number(asgn?.maxMarks || asgn?.max_marks || asgn?.maxScore || 100);
                    const firstUrl = sub.fileUrls?.[0] || '';
                    const isGithub = firstUrl.toLowerCase().includes('github.com');
                    const isDrive = firstUrl.toLowerCase().includes('drive.google.com');

                    return (
                      <tr key={sub.id}>
                        <td>
                          <div className="fw-semibold text-dark">{student?.name || sub.studentId}</div>
                          <div className="small text-muted">{student?.email}</div>
                        </td>
                        <td>
                          <div className="small fw-semibold">{asgn?.title || sub.assignmentId}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            Max Marks: {maxMarks}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex flex-column gap-1">
                            {firstUrl ? (
                              <a
                                href={firstUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="d-inline-flex align-items-center gap-1.5 text-primary small text-decoration-none fw-semibold"
                                title={`Open: ${firstUrl}`}
                              >
                                {isGithub ? (
                                  <FaGithub size={13} className="text-dark flex-shrink-0" />
                                ) : isDrive ? (
                                  <FaGoogleDrive size={13} className="text-warning flex-shrink-0" />
                                ) : (
                                  <FaExternalLinkAlt size={11} className="flex-shrink-0" />
                                )}
                                <span className="text-truncate" style={{ maxWidth: 160 }}>
                                  {isGithub ? 'GitHub Repo' : isDrive ? 'Google Drive' : (firstUrl.split('/').pop() || 'Open Link')}
                                </span>
                              </a>
                            ) : (
                              <div className="d-flex align-items-center gap-1.5 text-muted small">
                                <FaFileCode />
                                <span>No link attached</span>
                              </div>
                            )}
                            {sub.notes && (
                              <span
                                className="badge bg-secondary bg-opacity-10 text-secondary border px-1.5 py-0.5 rounded text-truncate text-start"
                                style={{ maxWidth: 180, fontSize: '0.7rem' }}
                                title={sub.notes}
                              >
                                📝 {sub.notes}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="small text-muted">{sub.submittedAt || sub.createdAt || 'Recent'}</td>
                        <td>
                          {sub.grade !== null && sub.grade !== undefined ? (
                            <Badge bg="success" className="px-2 py-1">
                              Graded: {sub.grade}/{maxMarks}
                            </Badge>
                          ) : (
                            <Badge bg="warning" text="dark" className="px-2 py-1">
                              Needs Review
                            </Badge>
                          )}
                        </td>
                        <td className="text-end">
                          <div className="d-inline-flex align-items-center gap-1">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => setViewingSub(sub)}
                              className="d-inline-flex align-items-center gap-1"
                              title="View full submission notes and asset links"
                            >
                              <FaEye size={12} />
                              <span className="d-none d-lg-inline">View</span>
                            </Button>

                            {sub.grade !== null && sub.grade !== undefined && (
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => {
                                  const notif = createAssignmentResultNotification({
                                    student,
                                    assignment: asgn,
                                    submission: sub
                                  });
                                  setActiveNotification(notif);
                                }}
                                className="d-inline-flex align-items-center gap-1"
                                title="Send grade & feedback via WhatsApp / Email"
                              >
                                <FaWhatsapp size={12} />
                                <span className="d-none d-md-inline">Notify</span>
                              </Button>
                            )}

                            <Button
                              variant={sub.grade !== null && sub.grade !== undefined ? 'outline-secondary' : 'primary'}
                              size="sm"
                              onClick={() => {
                                setGradingSub(sub);
                                setGradeInput(sub.grade !== null && sub.grade !== undefined ? sub.grade : '');
                                setFeedbackInput(sub.feedback || '');
                              }}
                              className="d-inline-flex align-items-center gap-1"
                            >
                              <FaPen size={11} />
                              <span>{sub.grade !== null && sub.grade !== undefined ? 'Edit Grade' : 'Grade'}</span>
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

      {/* Published Assignments Overview */}
      <Card className="shadow-sm border-0 rounded-3">
        <Card.Header className="py-3 border-0" style={{ background: 'var(--card-bg)' }}>
          <h6 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>Active Coursework Assignments</h6>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Target Batches</th>
                  <th>Deadline</th>
                  <th>Max Marks</th>
                  <th>Submissions</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((asgn) => {
                  const subCount = submissions.filter((s) => s.assignmentId === asgn.id).length;
                  return (
                    <tr key={asgn.id}>
                      <td className="fw-semibold" style={{ color: 'var(--text-primary)' }}>{asgn.title}</td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {asgn.batchIds?.map((bId) => {
                            const b = batches.find((batch) => batch.id === bId);
                            return (
                              <Badge key={bId} bg="info" text="dark" className="small">
                                {b ? b.name : bId}
                              </Badge>
                            );
                          })}
                        </div>
                      </td>
                      <td className="small text-muted">{asgn.deadline}</td>
                      <td className="fw-bold">{asgn.maxMarks} pts</td>
                      <td>
                        <Badge bg="light" text="dark" className="border">
                          {subCount} submitted
                        </Badge>
                      </td>
                      <td className="text-end">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          disabled={deletingAssignmentId === asgn.id}
                          onClick={() => handleDeleteAssignment(asgn.id, asgn.title)}
                          title="Delete assignment"
                          className="d-inline-flex align-items-center gap-1"
                        >
                          {deletingAssignmentId === asgn.id ? (
                            <>
                              <Spinner size="sm" animation="border" style={{ width: 12, height: 12 }} />
                              <span>Deleting...</span>
                            </>
                          ) : (
                            <>
                              <FaTrash size={12} />
                              <span>Delete</span>
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Create Assignment Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="fs-5 fw-bold">Create New Assignment</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(onAssignmentSubmit)}>
          <Modal.Body className="space-y-3">
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Assignment Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Assignment 4: State Machine Redux Engine"
                {...register('title')}
                isInvalid={!!errors.title}
              />
              <Form.Control.Feedback type="invalid">
                {errors.title?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Description & Instructions</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Detail technical requirements, expected inputs/outputs, and submission format..."
                {...register('description')}
                isInvalid={!!errors.description}
              />
              <Form.Control.Feedback type="invalid">
                {errors.description?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <Form.Label className="fw-semibold small">Submission Deadline</Form.Label>
                <Form.Control
                  type="date"
                  {...register('deadline')}
                  isInvalid={!!errors.deadline}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.deadline?.message}
                </Form.Control.Feedback>
              </div>

              <div className="col-md-6">
                <Form.Label className="fw-semibold small">Max Marks</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  {...register('maxMarks')}
                  isInvalid={!!errors.maxMarks}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.maxMarks?.message}
                </Form.Control.Feedback>
              </div>
            </div>

            {/* Target Batches Checkboxes */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small d-block">
                Assign to Cohorts (Select one or more):
              </Form.Label>
              <div className="d-flex flex-wrap gap-3 p-3 rounded border" style={{ background: 'var(--card-bg-alt, rgba(255,255,255,0.04))', borderColor: 'var(--border-color)' }}>
                {batches.map((b) => (
                  <Form.Check
                    key={b.id}
                    type="checkbox"
                    id={`batch-chk-${b.id}`}
                    label={b.name}
                    checked={selectedBatches.includes(b.id)}
                    onChange={() => handleBatchCheckbox(b.id)}
                  />
                ))}
              </div>
              <Form.Text className="text-muted">
                If none selected, assignment defaults to all active cohorts.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Publish Assignment
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Grade Submission Modal */}
      <Modal show={Boolean(gradingSub)} onHide={() => setGradingSub(null)} centered size="lg">
        <Modal.Header closeButton style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
          <Modal.Title className="fs-5 fw-bold" style={{ color: 'var(--text-primary)' }}>Grade Student Submission</Modal.Title>
        </Modal.Header>
        {(() => {
          const activeStudent = students.find((s) => s.id === gradingSub?.studentId || (s.legacyId && s.legacyId === gradingSub?.studentId));
          const activeAsgn = assignments.find((a) => a.id === gradingSub?.assignmentId || a.id === gradingSub?.assignment_id || (a.legacyId && a.legacyId === gradingSub?.assignmentId));
          const activeMaxMarks = Number(activeAsgn?.maxMarks || activeAsgn?.max_marks || activeAsgn?.maxScore || 100);
          const firstUrl = gradingSub?.fileUrls?.[0] || '';
          const isGithub = firstUrl.toLowerCase().includes('github.com');
          const isDrive = firstUrl.toLowerCase().includes('drive.google.com');

          return (
            <Form onSubmit={onPublishGrade}>
              <Modal.Body className="space-y-3" style={{ background: 'var(--card-bg)', color: 'var(--text-primary)' }}>
                {/* Meta details */}
                <div className="p-3 rounded mb-3 small border" style={{ background: 'var(--bg-body)', borderColor: 'var(--border-color)' }}>
                  <div className="d-flex justify-content-between flex-wrap gap-2 mb-2 pb-2 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
                    <div>
                      <strong>Student:</strong> {activeStudent?.name || gradingSub?.studentId}{' '}
                      <span className="text-muted">({activeStudent?.email || 'No email'})</span>
                    </div>
                    <div>
                      <Badge bg="secondary" className="font-monospace">Max Marks: {activeMaxMarks}</Badge>
                    </div>
                  </div>
                  <div>
                    <strong>Assignment:</strong> {activeAsgn?.title || gradingSub?.assignmentId}
                  </div>
                </div>

                {/* Submission Links & Notes */}
                <div className="p-3 rounded mb-3 border" style={{ background: 'var(--bg-body)', borderColor: 'var(--border-color)' }}>
                  <div className="fw-semibold small mb-2 d-flex align-items-center gap-1.5">
                    <FaFileCode className="text-primary" />
                    <span>Submitted Project Asset / Links</span>
                  </div>
                  {firstUrl ? (
                    <div className="d-flex flex-wrap gap-2 mb-2">
                      <a
                        href={firstUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-2 rounded-2"
                      >
                        {isGithub ? <FaGithub size={14} /> : isDrive ? <FaGoogleDrive size={14} className="text-warning" /> : <FaExternalLinkAlt size={12} />}
                        <span>Open {isGithub ? 'GitHub Repository' : isDrive ? 'Google Drive Link' : 'Submitted Link'}</span>
                        <FaExternalLinkAlt size={10} />
                      </a>
                    </div>
                  ) : (
                    <p className="small text-muted mb-2">No external project link provided.</p>
                  )}

                  {gradingSub?.notes && (
                    <div className="mt-2 pt-2 border-top" style={{ borderColor: 'var(--border-color)' }}>
                      <span className="fw-semibold small text-muted d-block mb-1">Student Notes / Comments:</span>
                      <div className="p-2.5 rounded bg-dark bg-opacity-10 small font-monospace" style={{ whiteSpace: 'pre-wrap' }}>
                        {gradingSub.notes}
                      </div>
                    </div>
                  )}
                </div>

                {/* Grade Input */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">
                    Marks Awarded (out of {activeMaxMarks})
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    max={activeMaxMarks}
                    step="any"
                    required
                    value={gradeInput}
                    onChange={(e) => setGradeInput(e.target.value)}
                    placeholder={`Enter marks between 0 and ${activeMaxMarks}`}
                    style={{ background: 'var(--bg-body)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                  />
                  <div className="small text-muted mt-1">
                    Grading is dynamic up to the assignment maximum of {activeMaxMarks} marks.
                  </div>
                </Form.Group>

                {/* Feedback Input */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Qualitative Feedback</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    required
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    placeholder="Provide constructive feedback regarding code structure, edge cases, and performance..."
                    style={{ background: 'var(--bg-body)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                  />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                <Button variant="secondary" size="sm" onClick={() => setGradingSub(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Publish Grade
                </Button>
              </Modal.Footer>
            </Form>
          );
        })()}
      </Modal>

      {/* View Submission Details Modal (Bug #5) */}
      <Modal show={Boolean(viewingSub)} onHide={() => setViewingSub(null)} centered size="lg">
        <Modal.Header closeButton style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
          <Modal.Title className="fs-5 fw-bold d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <FaEye className="text-primary" />
            <span>Student Submission Details</span>
          </Modal.Title>
        </Modal.Header>
        {(() => {
          const student = students.find((s) => s.id === viewingSub?.studentId || (s.legacyId && s.legacyId === viewingSub?.studentId));
          const asgn = assignments.find((a) => a.id === viewingSub?.assignmentId || a.id === viewingSub?.assignment_id || (a.legacyId && a.legacyId === viewingSub?.assignmentId));
          const batch = batches.find((b) => b.id === student?.batchId);
          const maxMarks = Number(asgn?.maxMarks || asgn?.max_marks || asgn?.maxScore || 100);
          const firstUrl = viewingSub?.fileUrls?.[0] || '';
          const isGithub = firstUrl.toLowerCase().includes('github.com');
          const isDrive = firstUrl.toLowerCase().includes('drive.google.com');

          return (
            <Modal.Body className="space-y-4" style={{ background: 'var(--card-bg)', color: 'var(--text-primary)' }}>
              {/* Top Overview Grid */}
              <div className="row g-3">
                <div className="col-sm-6">
                  <div className="p-3 rounded border h-100" style={{ background: 'var(--bg-body)', borderColor: 'var(--border-color)' }}>
                    <span className="text-muted small d-block mb-1">Student Details</span>
                    <h6 className="fw-bold mb-0">{student?.name || viewingSub?.studentId}</h6>
                    <div className="small text-muted">{student?.email || 'No email'}</div>
                    <div className="small mt-1">
                      <Badge bg="info" text="dark">{batch?.name || 'Assigned Cohort'}</Badge>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="p-3 rounded border h-100" style={{ background: 'var(--bg-body)', borderColor: 'var(--border-color)' }}>
                    <span className="text-muted small d-block mb-1">Assignment Details</span>
                    <h6 className="fw-bold mb-0">{asgn?.title || viewingSub?.assignmentId}</h6>
                    <div className="small text-muted">Max Marks: {maxMarks} pts</div>
                    <div className="small text-muted">Deadline: {asgn?.deadline || 'Flexible'}</div>
                  </div>
                </div>
              </div>

              {/* Submitted Links */}
              <div className="p-3 rounded border" style={{ background: 'var(--bg-body)', borderColor: 'var(--border-color)' }}>
                <h6 className="fw-bold mb-2 small d-flex align-items-center gap-2">
                  <FaFileCode className="text-primary" />
                  <span>Submitted Asset & Repository Links</span>
                </h6>
                {Array.isArray(viewingSub?.fileUrls) && viewingSub.fileUrls.length > 0 ? (
                  <div className="d-flex flex-column gap-2">
                    {viewingSub.fileUrls.map((url, idx) => {
                      const isGh = url.toLowerCase().includes('github.com');
                      const isDr = url.toLowerCase().includes('drive.google.com');
                      return (
                        <div key={idx} className="d-flex align-items-center justify-content-between p-2 rounded border gap-2" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                          <div className="d-flex align-items-center gap-2 text-truncate">
                            {isGh ? <FaGithub size={16} /> : isDr ? <FaGoogleDrive size={16} className="text-warning" /> : <FaExternalLinkAlt size={14} />}
                            <span className="small text-truncate font-monospace">{url}</span>
                          </div>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1.5 flex-shrink-0"
                          >
                            <span>Open</span>
                            <FaExternalLinkAlt size={10} />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="small text-muted mb-0">No links were attached to this submission.</p>
                )}
              </div>

              {/* Notes & Comments */}
              <div className="p-3 rounded border" style={{ background: 'var(--bg-body)', borderColor: 'var(--border-color)' }}>
                <h6 className="fw-bold mb-2 small">Student Notes & Comments</h6>
                {viewingSub?.notes ? (
                  <div className="p-3 rounded font-monospace small" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', whiteSpace: 'pre-wrap' }}>
                    {viewingSub.notes}
                  </div>
                ) : (
                  <p className="small text-muted mb-0 fst-italic">No additional notes or comments provided by student.</p>
                )}
              </div>

              {/* Current Grade & Status */}
              <div className="p-3 rounded border d-flex justify-content-between align-items-center flex-wrap gap-2" style={{ background: 'var(--bg-body)', borderColor: 'var(--border-color)' }}>
                <div>
                  <span className="small text-muted d-block">Submission Status</span>
                  {viewingSub?.grade !== null && viewingSub?.grade !== undefined ? (
                    <div className="d-flex align-items-center gap-2 mt-1">
                      <Badge bg="success" className="px-2.5 py-1.5 fs-6">
                        Grade: {viewingSub.grade} / {maxMarks}
                      </Badge>
                      {viewingSub.feedback && (
                        <span className="small text-muted">Feedback: "{viewingSub.feedback}"</span>
                      )}
                    </div>
                  ) : (
                    <Badge bg="warning" text="dark" className="px-2.5 py-1.5 mt-1">
                      Needs Review / Ungraded
                    </Badge>
                  )}
                </div>
                <div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setGradingSub(viewingSub);
                      setGradeInput(viewingSub?.grade !== null && viewingSub?.grade !== undefined ? viewingSub.grade : '');
                      setFeedbackInput(viewingSub?.feedback || '');
                      setViewingSub(null);
                    }}
                    className="d-inline-flex align-items-center gap-1.5"
                  >
                    <FaPen size={11} />
                    <span>{viewingSub?.grade !== null && viewingSub?.grade !== undefined ? 'Edit Grade' : 'Grade Submission'}</span>
                  </Button>
                </div>
              </div>
            </Modal.Body>
          );
        })()}
        <Modal.Footer style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
          <Button variant="secondary" size="sm" onClick={() => setViewingSub(null)}>
            Close
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
