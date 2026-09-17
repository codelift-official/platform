import React, { useState } from 'react';
import { Table, Button, Badge, Modal, Form, Card } from 'react-bootstrap';
import { useData } from '../../contexts/DataContext';
import {
  FaClipboardList,
  FaPlus,
  FaTrash,
  FaQuestionCircle,
  FaBullseye
} from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function TestManager() {
  const { tests = [], batches = [], addTest, deleteTest } = useData();
  const createTest = addTest; // Alias for backward compat

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [passingPercentage, setPassingPercentage] = useState(70);
  const [allowRetake, setAllowRetake] = useState(false);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [questions, setQuestions] = useState([
    {
      id: `q-1`,
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    }
  ]);

  const handleDeleteTest = async (testId, testTitle) => {
    if (window.confirm(`Are you sure you want to delete test "${testTitle}"? This will permanently remove the test, all its questions, scheduled batch links, and student attempt submissions.`)) {
      setIsDeleting(true);
      try {
        await deleteTest(testId);
        toast.success('Test and all associated records deleted successfully.');
      } catch (err) {
        toast.error(err.message || 'Failed to delete test');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const testList = Array.isArray(tests) ? tests : [];
  const batchList = Array.isArray(batches) ? batches : [];

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: `q-${Date.now()}-${prev.length + 1}`,
        text: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      }
    ]);
  };

  const handleRemoveQuestion = (idx) => {
    if (questions.length > 1) {
      setQuestions((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleQuestionTextChange = (idx, text) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, text } : q))
    );
  };

  const handleOptionChange = (qIdx, optIdx, val) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const nextOpts = [...q.options];
        nextOpts[optIdx] = val;
        return { ...q, options: nextOpts };
      })
    );
  };

  const handleCorrectAnswerChange = (qIdx, answerIdx) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIdx ? { ...q, correctAnswer: Number(answerIdx) } : q))
    );
  };

  const handleBatchToggle = (batchId) => {
    setSelectedBatches((prev) =>
      prev.includes(batchId) ? prev.filter((id) => id !== batchId) : [...prev, batchId]
    );
  };

  const handleSaveTest = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Validate that questions have text and options
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].text.trim()) {
        alert(`Question ${i + 1} is missing question prompt.`);
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!questions[i].options[j]?.trim()) {
          alert(`Question ${i + 1} is missing Option ${String.fromCharCode(65 + j)}.`);
          return;
        }
      }
    }

    createTest({
      title,
      description,
      passingPercentage: Number(passingPercentage) || 70,
      allowRetake: Boolean(allowRetake),
      assignedBatchIds: selectedBatches.length > 0 ? selectedBatches : batchList.map((b) => b.id),
      questions
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setPassingPercentage(70);
    setAllowRetake(false);
    setSelectedBatches([]);
    setQuestions([
      {
        id: `q-1`,
        text: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      }
    ]);
    setShowModal(false);
  };

  return (
    <div>
      {/* Header bar */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary, #171717)' }}>
            <FaClipboardList className="brand-text" />
            <span>Test Management</span>
          </h4>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowModal(true)}
          className="d-flex align-items-center gap-2 align-self-start align-self-sm-auto shadow-sm"
        >
          <FaPlus size={12} />
          <span>Create New Test</span>
        </Button>
      </div>

      {/* Tests Table */}
      <Card className="shadow-sm border rounded-3" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover striped className="mb-0 align-middle">
              <thead>
                <tr>
                  <th>Test Title & Description</th>
                  <th>Questions</th>
                  <th>Passing %</th>
                  <th>Retake Policy</th>
                  <th>Assigned Batches</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {testList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      No assessment tests created yet. Click "Create New Test" to add one.
                    </td>
                  </tr>
                ) : (
                  testList.map((test) => (
                    <tr key={test.id} style={{ color: 'var(--text-primary)' }}>
                      <td>
                        <div className="fw-semibold" style={{ color: 'var(--text-primary, #171717)' }}>
                          {test.title}
                        </div>
                        <div className="small text-muted" style={{ maxWidth: 380 }}>
                          {test.description || 'No description provided.'}
                        </div>
                      </td>
                      <td>
                        <Badge className="border px-2.5 py-1.5 font-monospace" style={{ background: 'var(--bg-body)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
                          {test.questions?.length || 0} Questions
                        </Badge>
                      </td>
                      <td>
                        <Badge bg="success-subtle" className="text-success border border-success-subtle px-2.5 py-1.5 fw-bold">
                          {test.passingPercentage !== undefined ? test.passingPercentage : 70}%
                        </Badge>
                      </td>
                      <td>
                        {test.allowRetake ? (
                          <Badge bg="success" className="d-inline-flex align-items-center gap-1">
                            Retakes Allowed
                          </Badge>
                        ) : (
                          <Badge bg="secondary" className="d-inline-flex align-items-center gap-1">
                            Single Attempt
                          </Badge>
                        )}
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {test.assignedBatchIds?.map((bId) => {
                            const batch = batchList.find((b) => b.id === bId);
                            return (
                              <Badge key={bId} className="badge-theme small">
                                {batch ? batch.name : bId}
                              </Badge>
                            );
                          })}
                        </div>
                      </td>
                      <td className="text-end">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          disabled={isDeleting}
                          className="d-inline-flex align-items-center justify-content-center rounded-2 p-1.5"
                          style={{ width: 32, height: 32 }}
                          onClick={() => handleDeleteTest(test.id, test.title)}
                          title="Delete Test"
                          aria-label="Delete Test"
                        >
                          <FaTrash size={12} />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Create Test Modal with Dynamic Question Builder */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
          <Modal.Title className="fs-5 fw-bold" style={{ color: 'var(--text-primary)' }}>Build New Test Assessment</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveTest}>
          <Modal.Body className="space-y-4" style={{ background: 'var(--card-bg)', color: 'var(--text-primary)' }}>
            {/* Title */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Test Title</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="e.g. Asynchronous Microtask & Concurrency Assessment"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ background: 'var(--bg-body)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              />
            </Form.Group>

            {/* Description */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Brief summary of syllabus coverage..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ background: 'var(--bg-body)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              />
            </Form.Group>

            {/* Passing Percentage */}
            <Form.Group className="mb-3 p-3 rounded border" style={{ background: 'var(--bg-body)', borderColor: 'var(--border-color)' }}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <Form.Label className="fw-semibold small mb-0 d-flex align-items-center gap-1.5">
                  <FaBullseye size={13} className="text-primary" />
                  <span>Passing Percentage</span>
                </Form.Label>
                <Badge bg="success" className="px-3 py-1.5 rounded-pill fs-6 fw-bold">
                  {passingPercentage}%
                </Badge>
              </div>
              <div className="d-flex align-items-center gap-3">
                <Form.Range
                  min={0}
                  max={100}
                  step={1}
                  value={passingPercentage}
                  onChange={(e) => setPassingPercentage(Number(e.target.value))}
                  className="flex-grow-1"
                />
                <Form.Control
                  type="number"
                  min={0}
                  max={100}
                  value={passingPercentage}
                  onChange={(e) => setPassingPercentage(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                  style={{ width: '80px', background: 'var(--card-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                  className="text-center fw-bold rounded-2"
                />
              </div>
              <div className="text-muted small mt-1" style={{ fontSize: '0.75rem' }}>
                Students need to score at least this percentage to pass the test.
              </div>
            </Form.Group>

            {/* Retake Setting (Bug #9) */}
            <Form.Group className="mb-3 p-3 rounded border" style={{ background: 'var(--bg-body)', borderColor: 'var(--border-color)' }}>
              <Form.Check
                type="switch"
                id="allow-retake-switch"
                label="Allow Students to Retake Assessment"
                checked={allowRetake}
                onChange={(e) => setAllowRetake(e.target.checked)}
                className="fw-semibold small mb-1"
              />
              <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                When enabled, students can re-attempt the test multiple times. When disabled, only 1 attempt is allowed.
              </div>
            </Form.Group>

            {/* Batch Selection Checkboxes */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold small d-block">
                Assign to Cohorts (Select one or more):
              </Form.Label>
              <div className="d-flex flex-wrap gap-3 p-3 rounded border" style={{ background: 'var(--bg-body)', borderColor: 'var(--border-color)' }}>
                {batchList.map((b) => (
                  <Form.Check
                    key={b.id}
                    type="checkbox"
                    id={`test-batch-${b.id}`}
                    label={b.name}
                    checked={selectedBatches.includes(b.id)}
                    onChange={() => handleBatchToggle(b.id)}
                  />
                ))}
              </div>
            </Form.Group>

            {/* Dynamic Question Builder */}
            <div className="border-top pt-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                  <FaQuestionCircle className="brand-text" />
                  <span>Question Bank ({questions.length})</span>
                </h6>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={handleAddQuestion}
                  className="d-flex align-items-center gap-1"
                >
                  <FaPlus size={11} />
                  <span>Add Question</span>
                </Button>
              </div>

              <div className="space-y-3">
                {questions.map((q, qIdx) => (
                  <Card key={q.id} className="border rounded-3 mb-3" style={{ background: 'var(--bg-body)', borderColor: 'var(--border-color)' }}>
                    <Card.Header className="d-flex justify-content-between align-items-center py-2" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                      <span className="fw-bold small" style={{ color: 'var(--text-primary)' }}>Question #{qIdx + 1}</span>
                      {questions.length > 1 && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemoveQuestion(qIdx)}
                          className="p-1 px-2 text-danger rounded-2"
                        >
                          <FaTrash size={11} />
                        </Button>
                      )}
                    </Card.Header>
                    <Card.Body className="p-3">
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-semibold" style={{ color: 'var(--text-primary)' }}>Question Prompt</Form.Label>
                        <Form.Control
                          type="text"
                          required
                          placeholder={`Enter question ${qIdx + 1} statement...`}
                          value={q.text}
                          onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                          style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                        />
                      </Form.Group>

                      {/* 4 Options: A, B, C, D */}
                      <div className="row g-2 mb-3">
                        {['A', 'B', 'C', 'D'].map((letter, optIdx) => (
                          <div className="col-md-6" key={optIdx}>
                            <Form.Label className="small text-muted font-monospace">
                              Option {letter}:
                            </Form.Label>
                            <Form.Control
                              type="text"
                              required
                              placeholder={`Option ${letter} answer text`}
                              value={q.options[optIdx]}
                              onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                              style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Correct Answer Dropdown */}
                      <Form.Group>
                        <Form.Label className="small fw-semibold text-success">
                          Correct Answer Selection
                        </Form.Label>
                        <Form.Select
                          value={q.correctAnswer}
                          onChange={(e) => handleCorrectAnswerChange(qIdx, e.target.value)}
                          style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                        >
                          <option value={0}>Option A is Correct</option>
                          <option value={1}>Option B is Correct</option>
                          <option value={2}>Option C is Correct</option>
                          <option value={3}>Option D is Correct</option>
                        </Form.Select>
                      </Form.Group>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
            <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save and Publish Test
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
