import React, { useState } from 'react';
import { Table, Button, Badge, Modal, Form, Card, Tabs, Tab } from 'react-bootstrap';
import { useData } from '../../contexts/DataContext';
import {
  FaCode,
  FaPlus,
  FaEdit,
  FaTrash,
  FaUndo,
  FaLock,
  FaEye,
  FaLightbulb,
  FaTrophy,
  FaCheckCircle,
  FaSearch
} from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function ProblemManager() {
  const {
    codingProblems = [],
    addCodingProblem,
    updateCodingProblem,
    deleteCodingProblem,
    resetCodingProblemsToSeed
  } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProblemId, setEditingProblemId] = useState(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Lists');
  const [formDifficulty, setFormDifficulty] = useState('Easy');
  const [formOrderIndex, setFormOrderIndex] = useState(1);
  const [formXp, setFormXp] = useState(50);
  const [formDescription, setFormDescription] = useState('');
  const [formStarterCode, setFormStarterCode] = useState('');
  const [formHints, setFormHints] = useState(['']);
  const [formVisibleTests, setFormVisibleTests] = useState([{ input: '', expected: '' }]);
  const [formHiddenTests, setFormHiddenTests] = useState([{ input: '', expected: '', inject: '' }]);
  const [modalTab, setModalTab] = useState('details');

  const openAddModal = () => {
    setEditingProblemId(null);
    setFormTitle('');
    setFormCategory('Lists');
    setFormDifficulty('Easy');
    setFormOrderIndex(codingProblems.length + 1);
    setFormXp(50);
    setFormDescription('');
    setFormStarterCode('# Write your Python code here\n');
    setFormHints(['']);
    setFormVisibleTests([{ input: '', expected: '' }]);
    setFormHiddenTests([{ input: '', expected: '', inject: '' }]);
    setModalTab('details');
    setShowModal(true);
  };

  const openEditModal = (prob) => {
    setEditingProblemId(prob.id);
    setFormTitle(prob.title || '');
    setFormCategory(prob.category || 'Lists');
    setFormDifficulty(prob.difficulty || 'Easy');
    setFormOrderIndex(prob.orderIndex || 1);
    setFormXp(prob.xp || 50);
    setFormDescription(prob.description || '');
    setFormStarterCode(prob.starterCode || '');
    setFormHints(Array.isArray(prob.hints) && prob.hints.length ? [...prob.hints] : ['']);
    setFormVisibleTests(
      Array.isArray(prob.testCases) && prob.testCases.length
        ? prob.testCases.map(tc => ({ ...tc }))
        : [{ input: '', expected: '' }]
    );
    setFormHiddenTests(
      Array.isArray(prob.hiddenTestCases) && prob.hiddenTestCases.length
        ? prob.hiddenTestCases.map(tc => ({ ...tc }))
        : [{ input: '', expected: '', inject: '' }]
    );
    setModalTab('details');
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      toast.error('Problem title is required');
      return;
    }

    const cleanedHints = formHints.filter(h => h && h.trim());
    const cleanedVisible = formVisibleTests.filter(tc => tc.expected && tc.expected.trim());
    const cleanedHidden = formHiddenTests.filter(tc => tc.expected && tc.expected.trim());

    if (cleanedVisible.length === 0) {
      toast.error('At least one visible test case with expected output is required');
      return;
    }

    const payload = {
      title: formTitle.trim(),
      category: formCategory.trim() || 'Lists',
      difficulty: formDifficulty,
      orderIndex: Number(formOrderIndex) || 1,
      xp: Number(formXp) || 50,
      description: formDescription.trim(),
      starterCode: formStarterCode,
      hints: cleanedHints,
      testCases: cleanedVisible,
      hiddenTestCases: cleanedHidden
    };

    if (editingProblemId) {
      updateCodingProblem(editingProblemId, payload);
    } else {
      addCodingProblem(payload);
    }

    setShowModal(false);
  };

  const handleDelete = (prob) => {
    if (window.confirm(`Are you sure you want to delete "${prob.title}"?`)) {
      deleteCodingProblem(prob.id);
    }
  };

  const handleResetSeed = () => {
    if (window.confirm('Reset all coding problems to the 20 teacher list questions? Any custom questions added will be overwritten.')) {
      resetCodingProblemsToSeed();
    }
  };

  // Filtered problems list
  const filteredList = codingProblems
    .slice()
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
    .filter(p => {
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        p.title?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    });

  return (
    <div className="container-fluid px-0">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            <FaCode className="me-2 text-primary" /> Code Arena Problem Manager
          </h3>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            className="rounded-pill px-3.5 d-flex align-items-center gap-1.5"
            onClick={openAddModal}
          >
            <FaPlus /> Add New Problem
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-md-3">
          <Card className="border-0 rounded-4 shadow-sm" style={{ background: 'var(--card-bg)' }}>
            <Card.Body className="p-3">
              <div className="text-secondary small fw-semibold mb-1">Total Problems</div>
              <h3 className="fw-bold mb-0 text-primary">{codingProblems.length}</h3>
            </Card.Body>
          </Card>
        </div>
        <div className="col-12 col-sm-6 col-md-3">
          <Card className="border-0 rounded-4 shadow-sm" style={{ background: 'var(--card-bg)' }}>
            <Card.Body className="p-3">
              <div className="text-secondary small fw-semibold mb-1">Easy / Medium / Hard</div>
              <h4 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>
                <span className="text-success">{codingProblems.filter(p => (p.difficulty || 'Easy').toLowerCase() === 'easy').length}</span> /{' '}
                <span className="text-warning">{codingProblems.filter(p => (p.difficulty || '').toLowerCase() === 'medium').length}</span> /{' '}
                <span className="text-danger">{codingProblems.filter(p => (p.difficulty || '').toLowerCase() === 'hard').length}</span>
              </h4>
            </Card.Body>
          </Card>
        </div>
        <div className="col-12 col-sm-6 col-md-3">
          <Card className="border-0 rounded-4 shadow-sm" style={{ background: 'var(--card-bg)' }}>
            <Card.Body className="p-3">
              <div className="text-secondary small fw-semibold mb-1">Total XP Pool</div>
              <h3 className="fw-bold mb-0 text-warning">
                {codingProblems.reduce((sum, p) => sum + (p.xp || 50), 0)} XP
              </h3>
            </Card.Body>
          </Card>
        </div>
        <div className="col-12 col-sm-6 col-md-3">
          <Card className="border-0 rounded-4 shadow-sm" style={{ background: 'var(--card-bg)' }}>
            <Card.Body className="p-3">
              <div className="text-secondary small fw-semibold mb-1">Hidden Tests Guard</div>
              <h3 className="fw-bold mb-0 text-info">
                {codingProblems.reduce((sum, p) => sum + (p.hiddenTestCases?.length || 0), 0)} Tests
              </h3>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Filter and Search */}
      <Card className="border-0 rounded-4 shadow-sm mb-4" style={{ background: 'var(--card-bg)' }}>
        <Card.Body className="p-3">
          <div className="input-group">
            <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
              <FaSearch />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search problems by title, category, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
                boxShadow: 'none'
              }}
            />
          </div>
        </Card.Body>
      </Card>

      {/* Table of Problems */}
      <Card className="border-0 rounded-4 shadow-sm overflow-hidden" style={{ background: 'var(--card-bg)' }}>
        <div className="table-responsive">
          <Table hover className="align-middle mb-0" style={{ color: 'var(--text-primary)' }}>
            <thead style={{ background: 'var(--bg-body)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <tr>
                <th style={{ width: '60px' }}>#</th>
                <th>Title & Category</th>
                <th>Difficulty</th>
                <th>XP</th>
                <th>Test Cases</th>
                <th>Hints</th>
                <th className="text-end" style={{ width: '130px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No coding problems found. Click "Add New Problem" or "Reset to 20 Seed Questions".
                  </td>
                </tr>
              ) : (
                filteredList.map((prob, idx) => (
                  <tr key={prob.id}>
                    <td>
                      <span className="badge rounded-pill arena-badge-order">
                        {prob.orderIndex || idx + 1}
                      </span>
                    </td>
                    <td>
                      <div className="fw-bold text-truncate" style={{ maxWidth: 360 }} title={prob.title}>
                        {prob.title}
                      </div>
                      <div className="text-secondary small mt-0.5">
                        Category: <span className="badge rounded-pill arena-badge-category">{prob.category || 'Lists'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge rounded-pill ${(prob.difficulty || 'Easy').toLowerCase() === 'hard'
                        ? 'arena-badge-hard'
                        : (prob.difficulty || '').toLowerCase() === 'medium'
                          ? 'arena-badge-medium'
                          : 'arena-badge-easy'
                        }`}>
                        {prob.difficulty || 'Easy'}
                      </span>
                    </td>
                    <td>
                      <span className="badge rounded-pill arena-badge-xp">+{prob.xp || 50} XP</span>
                    </td>
                    <td>
                      <div className="small">
                        <span className="text-primary fw-semibold">{(prob.testCases || []).length} visible</span>
                        <span className="mx-1 text-muted">·</span>
                        <span className="text-muted"><FaLock style={{ fontSize: '0.7rem' }} /> {(prob.hiddenTestCases || []).length} hidden</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge rounded-pill arena-badge-attempted">
                        {(prob.hints || []).length} hint(s)
                      </span>
                    </td>
                    <td className="text-end">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-1 p-1 px-2 rounded-2"
                        onClick={() => openEditModal(prob)}
                        title="Edit Problem"
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="p-1 px-2 rounded-2"
                        onClick={() => handleDelete(prob)}
                        title="Delete Problem"
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* ── Add / Edit Modal ── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold fs-5">
              {editingProblemId ? 'Edit Problem' : 'Add New Problem'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-3.5">
            <Tabs activeKey={modalTab} onSelect={(k) => setModalTab(k)} className="mb-3">
              {/* Tab 1: Details */}
              <Tab eventKey="details" title="Details & Starter Code">
                <div className="row g-3">
                  <div className="col-md-8">
                    <Form.Group>
                      <Form.Label className="small fw-semibold">Problem Title *</Form.Label>
                      <Form.Control
                        type="text"
                        required
                        placeholder="e.g. Q21: Find Prime Numbers in a List"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-4">
                    <Form.Group>
                      <Form.Label className="small fw-semibold">Category</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g. Lists, Dictionaries, Loops"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-4">
                    <Form.Group>
                      <Form.Label className="small fw-semibold">Difficulty</Form.Label>
                      <Form.Select
                        value={formDifficulty}
                        onChange={(e) => setFormDifficulty(e.target.value)}
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </Form.Select>
                    </Form.Group>
                  </div>
                  <div className="col-md-4">
                    <Form.Group>
                      <Form.Label className="small fw-semibold">Order Index (#)</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        value={formOrderIndex}
                        onChange={(e) => setFormOrderIndex(e.target.value)}
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-4">
                    <Form.Group>
                      <Form.Label className="small fw-semibold">XP Reward</Form.Label>
                      <Form.Control
                        type="number"
                        min="10"
                        step="10"
                        value={formXp}
                        onChange={(e) => setFormXp(e.target.value)}
                      />
                    </Form.Group>
                  </div>
                  <div className="col-12">
                    <Form.Group>
                      <Form.Label className="small fw-semibold">Problem Description & Guidelines *</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        required
                        placeholder="Describe the task clearly, input format, output format, and examples..."
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                      />
                    </Form.Group>
                  </div>
                  <div className="col-12">
                    <Form.Group>
                      <Form.Label className="small fw-semibold">Starter Code (Initial Python Code)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        className="font-monospace"
                        placeholder="numbers = [1, 2, 3]&#10;# Write your solution here"
                        value={formStarterCode}
                        onChange={(e) => setFormStarterCode(e.target.value)}
                      />
                    </Form.Group>
                  </div>
                </div>
              </Tab>

              {/* Tab 2: Visible Tests */}
              <Tab eventKey="visibleTests" title={`Visible Tests (${formVisibleTests.length})`}>
                <p className="text-secondary small mb-3">
                  Visible test cases are shown to students with inputs and expected output to verify their implementation.
                </p>

                {formVisibleTests.map((tc, idx) => (
                  <div key={idx} className="p-3 mb-2.5 rounded-3 border" style={{ background: 'var(--bg-body)' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-semibold small">Visible Test #{idx + 1}</span>
                      {formVisibleTests.length > 1 && (
                        <Button
                          variant="link"
                          size="sm"
                          className="text-danger p-0 text-decoration-none small"
                          onClick={() => setFormVisibleTests(prev => prev.filter((_, i) => i !== idx))}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <Form.Label className="small text-muted mb-1">Input / Description</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="e.g. [1,2,3,4,5]"
                          value={tc.input}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormVisibleTests(prev => prev.map((t, i) => i === idx ? { ...t, input: val } : t));
                          }}
                        />
                      </div>
                      <div className="col-md-6">
                        <Form.Label className="small text-muted mb-1">Expected Output (Exact stdout) *</Form.Label>
                        <Form.Control
                          type="text"
                          required
                          placeholder="e.g. 15"
                          value={tc.expected}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormVisibleTests(prev => prev.map((t, i) => i === idx ? { ...t, expected: val } : t));
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline-primary"
                  size="sm"
                  className="rounded-pill"
                  onClick={() => setFormVisibleTests(prev => [...prev, { input: '', expected: '' }])}
                >
                  <FaPlus /> Add Visible Test Case
                </Button>
              </Tab>

              {/* Tab 3: Hidden Tests */}
              <Tab eventKey="hiddenTests" title={`🔒 Hidden Tests (${formHiddenTests.length})`}>
                <div className="p-2.5 rounded-3 mb-3 small d-flex align-items-center gap-2" style={{ background: 'rgba(245, 158, 11, 0.08)', color: '#b45309', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <FaLock />
                  <span>Hidden test cases prevent students from hardcoding output values. Only the pass/fail score is shown to students.</span>
                </div>

                {formHiddenTests.map((tc, idx) => (
                  <div key={idx} className="p-3 mb-2.5 rounded-3 border" style={{ background: 'var(--bg-body)' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-semibold small">🔒 Hidden Test #{idx + 1}</span>
                      {formHiddenTests.length > 1 && (
                        <Button
                          variant="link"
                          size="sm"
                          className="text-danger p-0 text-decoration-none small"
                          onClick={() => setFormHiddenTests(prev => prev.filter((_, i) => i !== idx))}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <Form.Label className="small text-muted mb-1">Test Case Label / Case Type</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="e.g. Edge case: all zeros"
                          value={tc.input}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormHiddenTests(prev => prev.map((t, i) => i === idx ? { ...t, input: val } : t));
                          }}
                        />
                      </div>
                      <div className="col-md-6">
                        <Form.Label className="small text-muted mb-1">Expected Output *</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="e.g. 0"
                          value={tc.expected}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormHiddenTests(prev => prev.map((t, i) => i === idx ? { ...t, expected: val } : t));
                          }}
                        />
                      </div>
                      <div className="col-12">
                        <Form.Label className="small text-muted mb-1">Injected Python Code (Overrides variables before student logic)</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          className="font-monospace"
                          placeholder="numbers = [0, 0, 0]&#10;sum = 0"
                          value={tc.inject || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormHiddenTests(prev => prev.map((t, i) => i === idx ? { ...t, inject: val } : t));
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline-warning"
                  size="sm"
                  className="rounded-pill"
                  onClick={() => setFormHiddenTests(prev => [...prev, { input: '', expected: '', inject: '' }])}
                >
                  <FaPlus /> Add Hidden Test Case
                </Button>
              </Tab>

              {/* Tab 4: Hints */}
              <Tab eventKey="hints" title={`Hints (${formHints.filter(h => h.trim()).length})`}>
                <p className="text-secondary small mb-3">
                  Progressive hints available to students on demand when they get stuck.
                </p>

                {formHints.map((hint, idx) => (
                  <div key={idx} className="d-flex gap-2 mb-2">
                    <Form.Control
                      type="text"
                      placeholder={`Hint ${idx + 1}`}
                      value={hint}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormHints(prev => prev.map((h, i) => i === idx ? val : h));
                      }}
                    />
                    {formHints.length > 1 && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => setFormHints(prev => prev.filter((_, i) => i !== idx))}
                      >
                        <FaTrash />
                      </Button>
                    )}
                  </div>
                ))}

                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="rounded-pill mt-2"
                  onClick={() => setFormHints(prev => [...prev, ''])}
                >
                  <FaPlus /> Add Another Hint
                </Button>
              </Tab>
            </Tabs>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingProblemId ? 'Update Problem' : 'Save Problem'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
