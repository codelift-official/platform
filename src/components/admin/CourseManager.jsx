import React, { useState, useMemo } from 'react';
import { Card, Table, Button, Badge, Modal, Form, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useData } from '../../contexts/DataContext';
import {
  FaBook,
  FaPlus,
  FaFileImport,
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaTrash,
  FaUsers,
  FaLayerGroup,
  FaChevronDown,
  FaChevronRight,
  FaEye,
  FaDownload
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import CourseImportModal from './CourseImportModal';
import CoursePreview from '../common/CoursePreview';

export default function CourseManager() {
  const {
    courses = [],
    batches = [],
    students = [],
    addCourse,
    updateCourse,
    deleteCourse,
    createCourseFromJSON
  } = useData();

  const [courseFilter, setCourseFilter] = useState('all'); // 'all' | 'elective' | 'cohort'

  const electiveCourses = useMemo(() => {
    return courses.filter(
      (c) => c.courseType === 'elective' || (!c.isCohort && c.courseType !== 'cohort')
    );
  }, [courses]);

  const cohortCourses = useMemo(() => {
    return courses.filter(
      (c) => c.courseType === 'cohort' || c.isCohort === true
    );
  }, [courses]);

  const displayedCourses = useMemo(() => {
    if (courseFilter === 'elective') return electiveCourses;
    if (courseFilter === 'cohort') return cohortCourses;
    return courses;
  }, [courses, courseFilter, electiveCourses, cohortCourses]);

  const [showImportModal, setShowImportModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [previewCourse, setPreviewCourse] = useState(null);

  const handleExportJSON = (course) => {
    try {
      const json = JSON.stringify(course, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(course.title || 'course').replace(/[^a-zA-Z0-9_-]/g, '_')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported "${course.title}" as JSON file.`);
    } catch (err) {
      toast.error('Failed to export course JSON');
    }
  };

  // Form State for Manual Course Creation
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [batchId, setBatchId] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setBatchId('');
    setIsPublished(true);
    setEditingCourse(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleOpenEdit = (course) => {
    setEditingCourse(course);
    setTitle(course.title);
    setDescription(course.description || '');
    setBatchId(course.batchId || '');
    setIsPublished(course.isPublished !== false);
    setShowCreateModal(true);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Course title is required');
      return;
    }

    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, {
          title,
          description,
          batchId,
          courseType: editingCourse.courseType || (editingCourse.isCohort ? 'cohort' : 'elective'),
          isPublished
        });
        toast.success('Course updated successfully.');
      } else {
        await addCourse({
          title,
          description,
          batchId,
          courseType: 'elective',
          isPublished,
          modules: [
            {
              id: `mod-${Date.now()}`,
              title: 'Module 1: Orientation & Fundamentals',
              topics: [
                {
                  id: `top-${Date.now()}`,
                  title: 'Introduction & Environment Setup',
                  contentMd: '# Welcome to the Course\n\nReview environment requirements and instructions.'
                }
              ]
            }
          ]
        });
        toast.success('New course created successfully.');
      }

      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      toast.error(err.message || 'Failed to save course');
    }
  };

  const handleDeleteCourse = async (id, courseTitle) => {
    if (window.confirm(`Are you sure you want to delete "${courseTitle}"? This cannot be undone.`)) {
      try {
        await deleteCourse(id);
        toast.success('Course deleted');
      } catch (err) {
        toast.error(err.message || 'Failed to delete course');
      }
    }
  };

  const handleTogglePublish = async (course) => {
    const updatedStatus = !course.isPublished;
    try {
      await updateCourse(course.id, { isPublished: updatedStatus });
      toast.success(updatedStatus ? 'Course published to students.' : 'Course moved to drafts.');
    } catch (err) {
      toast.error(err.message || 'Failed to update course publish status');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">

        <div className="d-flex flex-wrap gap-2">
          {/* JSON Importer Button */}
          <Button
            variant="outline-primary"
            onClick={() => setShowImportModal(true)}
            className="d-flex align-items-center gap-2 shadow-sm rounded-3"
          >
            <FaFileImport size={14} />
            <span className="d-none d-sm-inline">Import JSON</span>
            <span className="d-inline d-sm-none">Import</span>
          </Button>

          {/* Manual Create Button */}
          <Button
            variant="primary"
            onClick={handleOpenCreate}
            className="d-flex align-items-center gap-2 shadow-sm rounded-3"
          >
            <FaPlus size={14} />
            <span>Create Course</span>
          </Button>
        </div>
      </div>

      {/* Course Cards / Ledger */}
      <Card className="shadow-sm border rounded-3">
        <Card.Header className="bg-transparent py-3 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div className="fw-bold d-flex flex-wrap align-items-center gap-2">
            <span>Course Catalog ({displayedCourses.length})</span>
            <div className="btn-group btn-group-sm ms-md-2" role="group">
              <button
                type="button"
                className={`btn btn-sm ${courseFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setCourseFilter('all')}
              >
                All ({courses.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${courseFilter === 'elective' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setCourseFilter('elective')}
              >
                Electives ({electiveCourses.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${courseFilter === 'cohort' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setCourseFilter('cohort')}
              >
                Cohorts ({cohortCourses.length})
              </button>
            </div>
          </div>
          <Badge bg="primary">
            {displayedCourses.filter(c => c.isPublished !== false).length} Published
          </Badge>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover striped className="mb-0 align-middle">
              <thead>
                <tr>
                  <th style={{ width: '35%' }}>Course Title & Description</th>
                  <th>Assigned Cohort Batch</th>
                  <th>Curriculum</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedCourses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-muted">
                      No courses found. Click "Create Course" or "Import JSON" to add a program.
                    </td>
                  </tr>
                ) : (
                  displayedCourses.map((course) => {
                    const associatedBatches = batches.filter(b =>
                      b.id === course.batchId ||
                      (Array.isArray(course.batchIds) && course.batchIds.includes(b.id)) ||
                      (Array.isArray(b.courseIds) && b.courseIds.includes(course.id))
                    );
                    const isExpanded = expandedCourseId === course.id;
                    const totalTopics = course.modules?.reduce((acc, m) => acc + (m.topics?.length || 0), 0) || 0;
                    const totalQuizzes = course.modules?.reduce((acc, m) => {
                      const topicQ = m.topics?.reduce((tAcc, t) => tAcc + (t.quizQuestions?.length || 0), 0) || 0;
                      return acc + (topicQ > 0 ? topicQ : (m.quizQuestions?.length || 0));
                    }, 0) || 0;
                    const associatedBatchIds = associatedBatches.map(b => b.id);
                    const enrolledCount = students.filter(s => associatedBatchIds.includes(s.batchId)).length;
                    const isCohort = course.courseType === 'cohort' || course.isCohort === true;

                    return (
                      <React.Fragment key={course.id}>
                        <tr style={{ color: 'var(--text-primary)' }}>
                          <td>
                            <div className="fw-bold d-flex align-items-center gap-2 flex-wrap" style={{ color: 'var(--text-primary)' }}>
                              <button
                                type="button"
                                className="btn btn-sm btn-link p-0 text-muted"
                                onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                              >
                                {isExpanded ? <FaChevronDown size={11} /> : <FaChevronRight size={11} />}
                              </button>
                              <span>{course.title}</span>
                              {isCohort ? (
                                <Badge bg="info" className="border" style={{ fontSize: '0.68rem', fontWeight: 600 }}>Cohort</Badge>
                              ) : (
                                <Badge bg="secondary" className="border" style={{ fontSize: '0.68rem', fontWeight: 500 }}>Elective</Badge>
                              )}
                            </div>
                            <div className="text-muted small text-truncate" style={{ maxWidth: 360 }}>
                              {course.description || 'No description'}
                            </div>
                          </td>
                          <td>
                            {associatedBatches.length > 0 ? (
                              <div>
                                <div className="d-flex flex-wrap gap-1 mb-1">
                                  {associatedBatches.map(b => (
                                    <Badge key={b.id} className="border" style={{ background: 'var(--bg-body)', color: 'var(--text-primary)', borderColor: 'var(--border-color)', fontSize: '0.74rem' }}>
                                      {b.name}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="small text-muted">
                                  <FaUsers className="me-1" size={10} />
                                  {enrolledCount} active students
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted small fst-italic">Unassigned (No Batch Linked)</span>
                            )}
                          </td>
                          <td>
                            <div className="small fw-semibold" style={{ color: 'var(--text-primary)' }}>
                              {course.modules?.length || 0} Modules
                            </div>
                            <div className="text-muted small">
                              {totalTopics} Topics
                              {totalQuizzes > 0 && <span className="ms-1 text-success fw-medium">• {totalQuizzes} Tests</span>}
                            </div>
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleTogglePublish(course)}
                              className="btn btn-sm border-0 p-0"
                              title="Click to toggle publish status"
                            >
                              {course.isPublished !== false ? (
                                <Badge bg="success" className="d-inline-flex align-items-center gap-1">
                                  <FaCheckCircle size={10} /> Published
                                </Badge>
                              ) : (
                                <Badge bg="secondary" className="d-inline-flex align-items-center gap-1">
                                  <FaTimesCircle size={10} /> Draft
                                </Badge>
                              )}
                            </button>
                          </td>
                          <td className="text-end">
                            <div className="d-inline-flex align-items-center gap-1.5 flex-wrap justify-content-end">
                              <OverlayTrigger overlay={<Tooltip>Inspect & Preview Curriculum</Tooltip>}>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => setPreviewCourse(course)}
                                  className="d-inline-flex align-items-center justify-content-center rounded-2 p-1.5"
                                  style={{ width: 32, height: 32 }}
                                  aria-label="Preview Course"
                                >
                                  <FaEye size={12} />
                                </Button>
                              </OverlayTrigger>
                              <OverlayTrigger overlay={<Tooltip>Download Course as JSON</Tooltip>}>
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() => handleExportJSON(course)}
                                  className="d-inline-flex align-items-center justify-content-center rounded-2 p-1.5"
                                  style={{ width: 32, height: 32 }}
                                  aria-label="Export JSON"
                                >
                                  <FaDownload size={12} />
                                </Button>
                              </OverlayTrigger>
                              <OverlayTrigger overlay={<Tooltip>Edit Course Details</Tooltip>}>
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() => handleOpenEdit(course)}
                                  className="d-inline-flex align-items-center justify-content-center rounded-2 p-1.5"
                                  style={{ width: 32, height: 32 }}
                                  aria-label="Edit Course"
                                >
                                  <FaEdit size={12} />
                                </Button>
                              </OverlayTrigger>
                              <OverlayTrigger overlay={<Tooltip>Delete Course</Tooltip>}>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeleteCourse(course.id, course.title)}
                                  className="d-inline-flex align-items-center justify-content-center rounded-2 p-1.5"
                                  style={{ width: 32, height: 32 }}
                                  aria-label="Delete Course"
                                >
                                  <FaTrash size={12} />
                                </Button>
                              </OverlayTrigger>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Modules List Sub-Row */}
                        {isExpanded && (
                          <tr style={{ background: 'var(--bg-body)' }}>
                            <td colSpan={5} className="p-3">
                              <div className="p-3 rounded-3 border shadow-sm" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                                <h6 className="fw-bold small mb-2 brand-text d-flex align-items-center gap-1">
                                  <FaLayerGroup /> Modules Breakdown for "{course.title}"
                                </h6>
                                <div className="space-y-2">
                                  {course.modules?.map((mod, mi) => {
                                    const topicQ = mod.topics?.reduce((sum, t) => sum + (t.quizQuestions?.length || 0), 0) || 0;
                                    const mQuizCount = topicQ > 0 ? topicQ : (mod.quizQuestions?.length || 0);
                                    return (
                                      <div key={mod.id || mi} className="p-2.5 border rounded mb-2 d-flex justify-content-between align-items-center" style={{ background: 'var(--bg-body)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                                        <span className="fw-semibold small">
                                          {mi + 1}. {mod.title}
                                        </span>
                                        <div className="d-flex gap-1.5 align-items-center">
                                          <Badge bg="secondary" className="small">
                                            {mod.topics?.length || 0} topics
                                          </Badge>
                                          {mQuizCount > 0 && (
                                            <Badge bg="success" className="small">
                                              {mQuizCount} Qs
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Manual Create / Edit Course Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered size="lg">
        <Modal.Header closeButton style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
          <Modal.Title className="fs-5 fw-bold" style={{ color: 'var(--text-primary)' }}>
            {editingCourse ? 'Edit Course Program' : 'Create New Course Program'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveCourse}>
          <Modal.Body className="space-y-3" style={{ background: 'var(--card-bg)', color: 'var(--text-primary)' }}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Course Title</Form.Label>
              <Form.Control
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Python Full Stack Engineering"
                style={{ background: 'var(--bg-body)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Overview of the program, prerequisites, and learning objectives..."
                style={{ background: 'var(--bg-body)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              />
            </Form.Group>

            <Row className="g-3 mb-3">
              <Col md={8}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Associate Cohort Batch</Form.Label>
                  <Form.Select
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    style={{ background: 'var(--bg-body)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                  >
                    <option value="">-- Available to All Batches --</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4} className="d-flex align-items-end">
                <Form.Check
                  type="switch"
                  id="publish-switch"
                  label="Publish Immediately"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="fw-semibold small mb-2"
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
            <Button variant="secondary" size="sm" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingCourse ? 'Save Changes' : 'Create Course'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Full Course Preview Modal (Bug #4) */}
      <Modal show={!!previewCourse} onHide={() => setPreviewCourse(null)} fullscreen centered>
        <Modal.Header closeButton style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
          <Modal.Title className="fs-5 fw-bold d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <FaBook className="brand-text" />
            <span>Course Preview: {previewCourse?.title}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3 p-md-4" style={{ background: 'var(--bg-body)' }}>
          {previewCourse && (
            <CoursePreview
              course={previewCourse}
              isAdmin={true}
              onEditCourse={(c) => {
                setPreviewCourse(null);
                handleOpenEdit(c);
              }}
              onTogglePublish={(c) => handleTogglePublish(c)}
              onExportJSON={(c) => handleExportJSON(c)}
              onBack={() => setPreviewCourse(null)}
            />
          )}
        </Modal.Body>
      </Modal>

      {/* JSON Importer Modal */}
      <CourseImportModal
        show={showImportModal}
        onHide={() => setShowImportModal(false)}
        courses={courses}
        onImport={async (json, targetCourseId) => {
          try {
            const course = await createCourseFromJSON(json, targetCourseId);
            if (course) {
              toast.success(`Course "${course.title}" saved with ${course.modules?.length || 0} modules.`);
              return true;
            }
            return false;
          } catch (err) {
            toast.error(err.message || 'Failed to import course');
            throw err;
          }
        }}
      />
    </div>
  );
}
