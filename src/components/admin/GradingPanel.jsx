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
  FaExternalLinkAlt,
  FaFileCode,
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
      maxMarks: 10
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
                    const student = students.find((s) => s.id === sub.studentId);
                    const asgn = assignments.find((a) => a.id === sub.assignmentId);

                    return (
                      <tr key={sub.id}>
                        <td>
                          <div className="fw-semibold text-dark">{student?.name || sub.studentId}</div>
                          <div className="small text-muted">{student?.email}</div>
                        </td>
                        <td>
                          <div className="small fw-semibold">{asgn?.title || sub.assignmentId}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            Max Marks: {asgn?.maxMarks || 10}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-1.5 text-primary small">
                            <FaFileCode />
                            <span>{sub.fileUrls?.[0]?.split('/').pop() || 'submission.js'}</span>
                          </div>
                        </td>
                        <td className="small text-muted">{sub.submittedAt}</td>
                        <td>
                          {sub.grade !== null ? (
                            <Badge bg="success" className="px-2 py-1">
                              Graded: {sub.grade}/{asgn?.maxMarks || 10}
                            </Badge>
                          ) : (
                            <Badge bg="warning" text="dark" className="px-2 py-1">
                              Needs Review
                            </Badge>
                          )}
                        </td>
                        <td className="text-end">
                          <div className="d-inline-flex align-items-center gap-1">
                            {sub.grade !== null && (
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
                              variant={sub.grade !== null ? 'outline-secondary' : 'primary'}
                              size="sm"
                              onClick={() => {
                                setGradingSub(sub);
                                setGradeInput(sub.grade !== null ? sub.grade : '');
                                setFeedbackInput(sub.feedback || '');
                              }}
                              className="d-inline-flex align-items-center gap-1"
                            >
                              <FaPen size={11} />
                              <span>{sub.grade !== null ? 'Edit Grade' : 'Grade'}</span>
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
      <Modal show={Boolean(gradingSub)} onHide={() => setGradingSub(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5 fw-bold">Grade Student Submission</Modal.Title>
        </Modal.Header>
        <Form onSubmit={onPublishGrade}>
          <Modal.Body className="space-y-3">
            <div className="p-3 rounded mb-3 small border" style={{ background: 'var(--card-bg-alt, rgba(255,255,255,0.04))', borderColor: 'var(--border-color)' }}>
              <div>
                <strong>Student:</strong>{' '}
                {students.find((s) => s.id === gradingSub?.studentId)?.name || gradingSub?.studentId}
              </div>
              <div>
                <strong>Assignment:</strong>{' '}
                {assignments.find((a) => a.id === gradingSub?.assignmentId)?.title}
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">
                Marks Awarded (out of {assignments.find((a) => a.id === gradingSub?.assignmentId)?.maxMarks || 10})
              </Form.Label>
              <Form.Control
                type="number"
                min="0"
                max={assignments.find((a) => a.id === gradingSub?.assignmentId)?.maxMarks || 10}
                required
                value={gradeInput}
                onChange={(e) => setGradeInput(e.target.value)}
                placeholder="e.g. 9"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Qualitative Feedback</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                required
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                placeholder="Provide constructive feedback regarding code structure, edge cases, and performance..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={() => setGradingSub(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Publish Grade
            </Button>
          </Modal.Footer>
        </Form>
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
