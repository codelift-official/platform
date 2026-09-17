import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, Form, Card, Badge, Alert } from 'react-bootstrap';
import {
  FaFileImport,
  FaCheck,
  FaExclamationTriangle,
  FaEye,
  FaCopy,
  FaCode,
  FaUpload,
  FaChevronDown,
  FaChevronUp,
  FaQuestionCircle,
  FaLayerGroup
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const COURSE_JSON_TEMPLATE = {
  title: "Course Title",
  description: "Course description",
  isPublished: true,
  modules: [
    {
      title: "Module 1",
      topics: [
        {
          title: "Topic 1",
          contentMd: "# Topic content...",
          quizQuestions: [
            {
              text: "Question?",
              options: ["A", "B", "C", "D"],
              correct: 0
            }
          ]
        }
      ]
    }
  ]
};

const TEMPLATE_STRING = JSON.stringify(COURSE_JSON_TEMPLATE, null, 2);

export default function CourseImportModal({ show, onHide, onImport, courses = [] }) {
  const [jsonInput, setJsonInput] = useState('');
  const [preview, setPreview] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importMode, setImportMode] = useState('create'); // 'create' | 'update'
  const [targetCourseId, setTargetCourseId] = useState('');
  const [showModuleDetails, setShowModuleDetails] = useState(false);
  const fileInputRef = useRef(null);

  // Auto-detect matching existing course when preview changes
  useEffect(() => {
    if (preview && Array.isArray(courses) && courses.length > 0) {
      const match = courses.find(
        (c) =>
          (preview.id && c.id === preview.id) ||
          (preview.title && c.title?.trim().toLowerCase() === preview.title?.trim().toLowerCase())
      );
      if (match) {
        setImportMode('update');
        setTargetCourseId(match.id);
      }
    }
  }, [preview, courses]);

  const validateJSONPayload = (rawString) => {
    if (!rawString || !rawString.trim()) {
      throw new Error('Please paste your course JSON payload or upload a .json file.');
    }

    let parsed;
    try {
      parsed = JSON.parse(rawString);
    } catch (err) {
      throw new Error(`Invalid JSON syntax: ${err.message}`);
    }

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error('Root course payload must be a JSON object {...}');
    }

    if (!parsed.title || typeof parsed.title !== 'string' || !parsed.title.trim()) {
      throw new Error('Missing required field: "title" (must be a non-empty string)');
    }

    if (!parsed.modules || !Array.isArray(parsed.modules)) {
      throw new Error('Invalid type: "modules" must be an array of module objects');
    }

    if (parsed.modules.length === 0) {
      throw new Error('Course must contain at least 1 module in the "modules" array');
    }

    for (let mIdx = 0; mIdx < parsed.modules.length; mIdx++) {
      const mod = parsed.modules[mIdx];
      const modNum = mIdx + 1;

      if (!mod || typeof mod !== 'object') {
        throw new Error(`Module ${modNum} must be a valid JSON object`);
      }

      if (!mod.title || typeof mod.title !== 'string' || !mod.title.trim()) {
        throw new Error(`Module ${modNum} is missing a required string "title"`);
      }

      if (!mod.topics || !Array.isArray(mod.topics)) {
        throw new Error(`Module ${modNum} ("${mod.title}") must have a "topics" array`);
      }

      if (mod.topics.length === 0) {
        throw new Error(`Module ${modNum} ("${mod.title}") must contain at least 1 topic`);
      }

      for (let tIdx = 0; tIdx < mod.topics.length; tIdx++) {
        const top = mod.topics[tIdx];
        const topNum = tIdx + 1;

        if (!top || typeof top !== 'object') {
          throw new Error(`Topic ${topNum} in Module "${mod.title}" must be an object`);
        }

        if (!top.title || typeof top.title !== 'string' || !top.title.trim()) {
          throw new Error(`Topic ${topNum} in Module "${mod.title}" is missing a required string "title"`);
        }
      }
    }

    return parsed;
  };

  const handlePreview = () => {
    try {
      const parsed = validateJSONPayload(jsonInput);
      setPreview(parsed);
      setValidationError('');
      toast.success(`Valid Course JSON: ${parsed.modules.length} Modules detected!`);
    } catch (err) {
      setValidationError(err.message);
      setPreview(null);
      toast.error(err.message);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setJsonInput(content);
        try {
          const parsed = validateJSONPayload(content);
          setPreview(parsed);
          setValidationError('');
          toast.success(`Uploaded "${file.name}" successfully (${parsed.modules?.length || 0} modules)!`);
        } catch (err) {
          setValidationError(err.message);
          setPreview(null);
          toast.error('File uploaded with validation issues: ' + err.message);
        }
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read selected file');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImport = () => {
    let payload = preview;
    if (!payload) {
      try {
        payload = validateJSONPayload(jsonInput);
        setPreview(payload);
        setValidationError('');
      } catch (err) {
        setValidationError(err.message);
        toast.error(err.message);
        return;
      }
    }

    setIsImporting(true);
    setTimeout(async () => {
      try {
        const targetId = importMode === 'update' && targetCourseId ? targetCourseId : null;
        const result = await onImport(jsonInput, targetId);
        if (result) {
          setJsonInput('');
          setPreview(null);
          setValidationError('');
          onHide();
        }
      } catch (err) {
        setValidationError(err.message || 'Import failed');
        toast.error('Import failed: ' + (err.message || String(err)));
      } finally {
        setIsImporting(false);
      }
    }, 50);
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(TEMPLATE_STRING);
    toast.success('JSON Template copied to clipboard!');
  };

  const handleLoadSample = () => {
    setJsonInput(TEMPLATE_STRING);
    setValidationError('');
    setPreview(null);
    toast.success('Loaded sample template into editor!');
  };

  const totalTopics = preview?.modules?.reduce((acc, m) => acc + (m.topics?.length || 0), 0) || 0;
  const totalQuizzes = preview?.modules?.reduce(
    (acc, m) => acc + (m.topics?.reduce((tAcc, t) => tAcc + (t.quizQuestions?.length || 0), 0) || 0),
    0
  ) || 0;

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Header closeButton style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
          <Modal.Title className="fs-5 fw-bold d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <FaFileImport className="brand-text" />
            <span>Import Course from JSON</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4" style={{ background: 'var(--card-bg)', color: 'var(--text-primary)' }}>
          {/* Top Actions: File Upload, View Template, Load Sample */}
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <p className="text-muted small mb-0">
              Upload a course <code>.json</code> file or paste JSON payload with modules, topics, and quiz tests.
            </p>
            <div className="d-flex gap-2 flex-wrap">
              <input
                type="file"
                ref={fileInputRef}
                accept=".json,application/json"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="d-flex align-items-center gap-1.5 shadow-sm rounded-2"
                style={{ fontSize: '0.8rem' }}
              >
                <FaUpload />
                <span>Upload .JSON File</span>
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowTemplateModal(true)}
                className="d-flex align-items-center gap-1.5 shadow-sm rounded-2"
                style={{ fontSize: '0.8rem' }}
              >
                <FaCode />
                <span>View Template</span>
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleLoadSample}
                className="d-flex align-items-center gap-1.5 shadow-sm rounded-2"
                style={{ fontSize: '0.8rem' }}
              >
                <span>Sample</span>
              </Button>
            </div>
          </div>

          {validationError && (
            <Alert variant="danger" className="py-2.5 px-3 small d-flex align-items-center gap-2 border-danger-subtle rounded-3 mb-3">
              <FaExclamationTriangle className="flex-shrink-0" />
              <span>{validationError}</span>
            </Alert>
          )}

          {/* Import Mode Selector: Create New vs Update Existing */}
          {courses.length > 0 && (
            <div className="p-3 mb-3 rounded-3 border" style={{ background: 'var(--bg-body)', borderColor: 'var(--border-color)' }}>
              <div className="fw-semibold small mb-2" style={{ color: 'var(--text-primary)' }}>
                Import Action
              </div>
              <div className="d-flex flex-wrap gap-4 mb-2">
                <Form.Check
                  type="radio"
                  id="import-mode-create"
                  name="importMode"
                  label="Create as a new course"
                  checked={importMode === 'create'}
                  onChange={() => setImportMode('create')}
                  className="small fw-medium"
                />
                <Form.Check
                  type="radio"
                  id="import-mode-update"
                  name="importMode"
                  label="Update / Replace existing course"
                  checked={importMode === 'update'}
                  onChange={() => {
                    setImportMode('update');
                    if (!targetCourseId && courses[0]) setTargetCourseId(courses[0].id);
                  }}
                  className="small fw-medium"
                />
              </div>

              {importMode === 'update' && (
                <div className="mt-2">
                  <Form.Select
                    size="sm"
                    value={targetCourseId}
                    onChange={(e) => setTargetCourseId(e.target.value)}
                    className="rounded-2"
                    style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                  >
                    <option value="">-- Select course to update / overwrite --</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.id}) — Currently {c.modules?.length || 0} modules
                      </option>
                    ))}
                  </Form.Select>
                  <div className="small text-muted mt-1">
                    Note: The selected course's curriculum modules and tests will be updated with this imported JSON.
                  </div>
                </div>
              )}
            </div>
          )}

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small d-flex justify-content-between align-items-center" style={{ color: 'var(--text-primary)' }}>
              <span>Course JSON Payload</span>
              <span className="text-muted fw-normal" style={{ fontSize: '0.75rem' }}>
                Strict JSON format required
              </span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={9}
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                setValidationError('');
              }}
              placeholder={TEMPLATE_STRING}
              className="font-monospace small rounded-3"
              style={{
                fontSize: '0.82rem',
                backgroundColor: 'var(--bg-body)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-color)',
                lineHeight: 1.5
              }}
            />
          </Form.Group>

          {/* Validation & Preview Card */}
          {preview && (
            <Card className="mb-3 border-success shadow-sm rounded-3 overflow-hidden" style={{ background: 'var(--card-bg)' }}>
              <Card.Header className="bg-success bg-opacity-10 py-2 border-success d-flex justify-content-between align-items-center">
                <span className="fw-bold text-success small d-flex align-items-center gap-1">
                  <FaCheck /> Ready to Import
                </span>
                <Badge bg="success">
                  {preview.isPublished !== false ? 'Published' : 'Draft'}
                </Badge>
              </Card.Header>
              <Card.Body className="p-3">
                <h6 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>{preview.title}</h6>
                <p className="text-muted small mb-2">{preview.description || 'No description provided'}</p>
                
                <div className="d-flex gap-2 flex-wrap mb-2">
                  <Badge bg="primary">{preview.modules?.length || 0} Modules</Badge>
                  <Badge bg="secondary">{totalTopics} Topics</Badge>
                  <Badge bg="info">{totalQuizzes} Test / Quiz Questions</Badge>
                  {importMode === 'update' && targetCourseId && (
                    <Badge bg="warning" text="dark">
                      Overwriting Course: {courses.find((c) => c.id === targetCourseId)?.title || targetCourseId}
                    </Badge>
                  )}
                </div>

                {/* Collapsible Module & Test Breakdown */}
                <div className="mt-3 pt-2 border-top" style={{ borderColor: 'var(--border-color)' }}>
                  <button
                    type="button"
                    onClick={() => setShowModuleDetails(!showModuleDetails)}
                    className="btn btn-sm btn-link p-0 text-decoration-none d-flex align-items-center gap-1 small fw-semibold"
                    style={{ color: 'var(--bs-primary)' }}
                  >
                    <FaLayerGroup size={11} />
                    <span>{showModuleDetails ? 'Hide' : 'Inspect All'} {preview.modules?.length || 0} Modules & Quizzes</span>
                    {showModuleDetails ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                  </button>

                  {showModuleDetails && (
                    <div className="mt-2 space-y-1.5" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                      {preview.modules?.map((m, mIdx) => {
                        const mQuizCount = m.topics?.reduce((sum, t) => sum + (t.quizQuestions?.length || 0), 0) || 0;
                        return (
                          <div
                            key={mIdx}
                            className="p-2 rounded-2 border d-flex justify-content-between align-items-center small"
                            style={{ background: 'var(--bg-body)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                          >
                            <span className="fw-medium text-truncate" style={{ maxWidth: '340px' }}>
                              {mIdx + 1}. {m.title}
                            </span>
                            <div className="d-flex gap-1.5 flex-shrink-0">
                              <span className="badge bg-secondary" style={{ fontSize: '0.7rem' }}>
                                {m.topics?.length || 0} topics
                              </span>
                              {mQuizCount > 0 && (
                                <span className="badge bg-success" style={{ fontSize: '0.7rem' }}>
                                  {mQuizCount} Qs
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          )}

          <div className="d-flex justify-content-end gap-2 pt-2 border-top" style={{ borderColor: 'var(--border-color)' }}>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handlePreview}
              disabled={isImporting}
              className="d-flex align-items-center gap-1 rounded-2"
            >
              <FaEye />
              <span>Validate & Preview</span>
            </Button>
            <Button
              variant="success"
              size="sm"
              onClick={handleImport}
              disabled={!jsonInput.trim() || isImporting}
              className="d-flex align-items-center gap-1.5 fw-bold rounded-2 shadow-sm"
            >
              {isImporting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                  <span>Importing Modules...</span>
                </>
              ) : (
                <>
                  <FaFileImport />
                  <span>{importMode === 'update' ? 'Update Existing Course' : 'Create Course from JSON'}</span>
                </>
              )}
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Sub-Modal: JSON Schema Template Viewer */}
      <Modal show={showTemplateModal} onHide={() => setShowTemplateModal(false)} size="lg" centered>
        <Modal.Header closeButton style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
          <Modal.Title className="fs-6 fw-bold d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <FaCode className="brand-text" />
            <span>Course JSON Schema Template</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4" style={{ background: 'var(--card-bg)', color: 'var(--text-primary)' }}>
          <p className="text-muted small mb-3">
            Copy the reference structure below to create your custom course with nested modules, topics, and optional quizzes.
          </p>
          <div className="position-relative mb-3">
            <pre
              className="p-3 rounded-3 font-monospace small"
              style={{
                backgroundColor: 'var(--bg-body)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                maxHeight: '380px',
                overflowY: 'auto',
                fontSize: '0.8rem',
                lineHeight: 1.55
              }}
            >
              <code>{TEMPLATE_STRING}</code>
            </pre>
          </div>
          <div className="d-flex justify-content-between align-items-center pt-2 border-top" style={{ borderColor: 'var(--border-color)' }}>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={handleCopyTemplate}
              className="d-flex align-items-center gap-1.5 rounded-2"
            >
              <FaCopy />
              <span>Copy Template JSON</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setJsonInput(TEMPLATE_STRING);
                setShowTemplateModal(false);
                toast.success('Template loaded into editor!');
              }}
              className="rounded-2"
            >
              Use This Template
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
