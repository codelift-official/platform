import React, { useState, useMemo } from 'react';
import {
  Card, Badge, Button, Form, Table, Modal, Row, Col, InputGroup
} from 'react-bootstrap';
import { useData } from '../../contexts/DataContext';
import {
  FaClipboardList, FaFilter, FaDownload, FaEye, FaCheckCircle,
  FaTimesCircle, FaTrophy, FaUsers, FaPercentage, FaSearch
} from 'react-icons/fa';
import { FiAlertCircle } from 'react-icons/fi';

/* ── Score circle badge ─────────────────────────────────────────────────── */
function ScoreBadge({ score, total }) {
  const pct = total ? Math.round((score / total) * 100) : 0;
  const variant = pct >= 80 ? 'success' : pct >= 60 ? 'warning' : 'danger';
  return (
    <span className={`badge bg-${variant} fw-bold`} style={{ fontSize: '0.78rem' }}>
      {score}/{total} ({pct}%)
    </span>
  );
}

/* ── Stat card ──────────────────────────────────────────────────────────── */
function StatCard({ icon, label, value, color }) {
  return (
    <Card className="border rounded-3 shadow-sm" style={{ background: 'var(--card-bg)' }}>
      <Card.Body className="p-3 d-flex align-items-center gap-3">
        <span style={{
          width: 42, height: 42, borderRadius: 10,
          background: `${color}18`, color,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          {icon}
        </span>
        <div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>{label}</div>
        </div>
      </Card.Body>
    </Card>
  );
}

/* ── Answer review modal ────────────────────────────────────────────────── */
function AnswerModal({ show, onHide, attempt, test, student }) {
  if (!attempt || !test) return null;
  const questions = test.questions || [];
  const correct = questions.filter((q, i) => attempt.answers?.[i] === q.correctAnswer).length;
  const pct = questions.length ? Math.round((correct / questions.length) * 100) : 0;
  const scoreColor = pct >= 80 ? '#16a34a' : pct >= 60 ? '#D97706' : '#dc2626';

  return (
    <Modal show={show} onHide={onHide} size="lg" centered scrollable>
      <Modal.Header closeButton style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
        <Modal.Title className="fs-6 fw-bold d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <FaEye style={{ color: 'var(--bs-primary)' }} />
          Answer Review — {student?.name || 'Student'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ background: 'var(--card-bg)' }}>
        {/* Summary */}
        <div className="d-flex align-items-center gap-3 mb-4 p-3 rounded-3" style={{ background: 'var(--bg-body)', border: '1px solid var(--border-color)' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: `conic-gradient(${scoreColor} ${pct * 3.6}deg, var(--border-color) 0)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'var(--card-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: scoreColor, lineHeight: 1 }}>{pct}%</span>
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{test.title}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{student?.name} · Submitted {new Date(attempt.submittedAt).toLocaleString('en-IN')}</div>
            <div className="mt-1 d-flex gap-2">
              <Badge bg="success">{correct} Correct</Badge>
              <Badge bg="danger">{questions.length - correct} Wrong</Badge>
              <Badge bg={pct >= 60 ? 'success' : 'danger'} className="text-uppercase" style={{ letterSpacing: '0.5px' }}>
                {pct >= 60 ? 'PASS' : 'FAIL'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Per-question breakdown */}
        {questions.map((q, idx) => {
          const studentAnswer = attempt.answers?.[idx];
          const isCorrect = studentAnswer === q.correctAnswer;
          return (
            <div
              key={q.id || idx}
              className="mb-3 p-3 rounded-3"
              style={{
                border: `1px solid ${isCorrect ? '#16a34a44' : '#dc262644'}`,
                background: isCorrect ? 'rgba(22,163,74,0.04)' : 'rgba(220,38,38,0.04)'
              }}
            >
              <div className="d-flex align-items-start gap-2 mb-2">
                {isCorrect
                  ? <FaCheckCircle style={{ color: '#16a34a', marginTop: 2, flexShrink: 0 }} />
                  : <FaTimesCircle style={{ color: '#dc2626', marginTop: 2, flexShrink: 0 }} />
                }
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  Q{idx + 1}. {q.text}
                </div>
              </div>
              <div className="ps-4">
                {(q.options || []).map((opt, oi) => {
                  const isStudentChoice = studentAnswer === oi;
                  const isCorrectOpt = q.correctAnswer === oi;
                  let bg = 'transparent';
                  let border = '1px solid var(--border-color)';
                  let fontWeight = 400;
                  if (isCorrectOpt) { bg = 'rgba(22,163,74,0.1)'; border = '1px solid #16a34a88'; fontWeight = 600; }
                  if (isStudentChoice && !isCorrect) { bg = 'rgba(220,38,38,0.1)'; border = '1px solid #dc262688'; fontWeight = 600; }
                  return (
                    <div key={oi} className="d-flex align-items-center gap-2 mb-1 px-2 py-1 rounded-2"
                      style={{ background: bg, border, fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight }}>
                      <span style={{ minWidth: 18, textAlign: 'center', opacity: 0.6 }}>{String.fromCharCode(65 + oi)}.</span>
                      <span style={{ flex: 1 }}>{opt}</span>
                      {isStudentChoice && <span style={{ fontSize: '0.7rem', color: isCorrect ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
                        {isCorrect ? '✓ Your Answer' : '✗ Your Answer'}
                      </span>}
                      {isCorrectOpt && !isStudentChoice && <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 700 }}>✓ Correct</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </Modal.Body>
      <Modal.Footer style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
        <Button variant="secondary" size="sm" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

/* ── Main Page ──────────────────────────────────────────────────────────── */
export default function TestSubmissions() {
  const { tests = [], testAttempts = [], students = [], batches = [], getTestAttempts } = useData();

  /* Filter state */
  const [filterTestId, setFilterTestId] = useState('');
  const [filterBatchId, setFilterBatchId] = useState('');
  const [filterStudentSearch, setFilterStudentSearch] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  /* Answer modal state */
  const [reviewAttempt, setReviewAttempt] = useState(null);
  const [reviewTest, setReviewTest] = useState(null);
  const [reviewStudent, setReviewStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  /* Derive filtered attempts */
  const filtered = useMemo(() => {
    const filters = {
      testId: filterTestId || undefined,
      batchId: filterBatchId || undefined,
      dateFrom: filterDateFrom || undefined,
      dateTo: filterDateTo || undefined,
    };
    let result = getTestAttempts ? getTestAttempts(filters) : [...testAttempts];

    // Student name search (client side)
    if (filterStudentSearch.trim()) {
      const q = filterStudentSearch.toLowerCase();
      result = result.filter(a => {
        const s = students.find(s => s.id === a.studentId);
        return s?.name?.toLowerCase().includes(q) || s?.email?.toLowerCase().includes(q);
      });
    }
    return result.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  }, [filterTestId, filterBatchId, filterStudentSearch, filterDateFrom, filterDateTo, testAttempts, students, getTestAttempts]);

  /* Stats */
  const totalPassed = filtered.filter(a => a.totalQuestions && (a.score / a.totalQuestions) >= 0.6).length;
  const avgScore = filtered.length
    ? Math.round(filtered.reduce((sum, a) => sum + (a.totalQuestions ? (a.score / a.totalQuestions) * 100 : 0), 0) / filtered.length)
    : 0;

  /* Open answer review */
  const handleViewAnswers = (attempt) => {
    const test = tests.find(t => t.id === attempt.testId);
    const student = students.find(s => s.id === attempt.studentId);
    setReviewAttempt(attempt);
    setReviewTest(test);
    setReviewStudent(student);
    setShowModal(true);
  };

  /* CSV Export */
  const handleExportCSV = () => {
    const rows = [
      ['Student Name', 'Student Email', 'Test Title', 'Batch', 'Score', 'Total', 'Percentage', 'Status', 'Submitted At'],
      ...filtered.map(a => {
        const st = students.find(s => s.id === a.studentId);
        const test = tests.find(t => t.id === a.testId);
        const batch = batches.find(b => b.id === st?.batchId);
        const pct = a.totalQuestions ? Math.round((a.score / a.totalQuestions) * 100) : 0;
        return [
          st?.name || '', st?.email || '',
          test?.title || '', batch?.name || '',
          a.score, a.totalQuestions, `${pct}%`,
          pct >= 60 ? 'Pass' : 'Fail',
          new Date(a.submittedAt).toLocaleString('en-IN')
        ];
      })
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'test_submissions.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setFilterTestId(''); setFilterBatchId('');
    setFilterStudentSearch(''); setFilterDateFrom(''); setFilterDateTo('');
  };

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <FaClipboardList className="brand-text" />
            <span>Test Submissions</span>
          </h4>
        </div>
        <Button
          variant="outline-success"
          className="d-flex align-items-center gap-2 rounded-2 shadow-sm"
          onClick={handleExportCSV}
          disabled={filtered.length === 0}
        >
          <FaDownload size={13} />
          Export CSV
        </Button>
      </div>

      {/* ── Stats Row ── */}
      <Row className="g-3 mb-4">
        <Col xs={6} lg={3}>
          <StatCard icon={<FaClipboardList />} label="Total Submissions" value={filtered.length} color="#2563EB" />
        </Col>
        <Col xs={6} lg={3}>
          <StatCard icon={<FaTrophy />} label="Passed" value={totalPassed} color="#16a34a" />
        </Col>
        <Col xs={6} lg={3}>
          <StatCard icon={<FaPercentage />} label="Avg Score" value={`${avgScore}%`} color="#D97706" />
        </Col>
        <Col xs={6} lg={3}>
          <StatCard icon={<FaUsers />} label="Unique Students" value={new Set(filtered.map(a => a.studentId)).size} color="#7C3AED" />
        </Col>
      </Row>

      {/* ── Filters ── */}
      <Card className="border rounded-3 shadow-sm mb-4" style={{ background: 'var(--card-bg)' }}>
        <Card.Header className="bg-transparent py-3 border-bottom d-flex align-items-center justify-content-between">
          <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <FaFilter className="brand-text" size={13} /> Filters
          </h6>
          {(filterTestId || filterBatchId || filterStudentSearch || filterDateFrom || filterDateTo) && (
            <Button variant="link" size="sm" className="p-0 text-decoration-none text-danger fw-semibold" onClick={clearFilters}>
              Clear All
            </Button>
          )}
        </Card.Header>
        <Card.Body className="p-3">
          <Row className="g-3">
            <Col xs={12} sm={6} lg={3}>
              <Form.Label className="small fw-semibold mb-1">Test</Form.Label>
              <Form.Select size="sm" value={filterTestId} onChange={e => setFilterTestId(e.target.value)}>
                <option value="">All Tests</option>
                {tests.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </Form.Select>
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <Form.Label className="small fw-semibold mb-1">Batch</Form.Label>
              <Form.Select size="sm" value={filterBatchId} onChange={e => setFilterBatchId(e.target.value)}>
                <option value="">All Batches</option>
                {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </Form.Select>
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <Form.Label className="small fw-semibold mb-1">Student Search</Form.Label>
              <InputGroup size="sm">
                <InputGroup.Text style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                  <FaSearch size={11} style={{ color: 'var(--text-secondary)' }} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Name or email…"
                  value={filterStudentSearch}
                  onChange={e => setFilterStudentSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col xs={6} lg={1.5}>
              <Form.Label className="small fw-semibold mb-1">From Date</Form.Label>
              <Form.Control size="sm" type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} />
            </Col>
            <Col xs={6} lg={1.5}>
              <Form.Label className="small fw-semibold mb-1">To Date</Form.Label>
              <Form.Control size="sm" type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ── Table ── */}
      <Card className="border rounded-3 shadow-sm" style={{ background: 'var(--card-bg)' }}>
        <Card.Header className="bg-transparent py-3 border-bottom d-flex align-items-center justify-content-between">
          <h6 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>
            Submissions ({filtered.length})
          </h6>
        </Card.Header>
        <div className="table-responsive">
          {filtered.length === 0 ? (
            <div className="text-center py-5" style={{ color: 'var(--text-secondary)' }}>
              <FiAlertCircle size={36} style={{ opacity: 0.4, marginBottom: 12 }} />
              <p className="mb-0 small">No submissions match the current filters.</p>
            </div>
          ) : (
            <Table hover className="mb-0" style={{ color: 'var(--text-primary)' }}>
              <thead style={{ background: 'var(--bg-body)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>
                <tr>
                  <th className="px-3 py-2">Student</th>
                  <th className="px-3 py-2">Test</th>
                  <th className="px-3 py-2">Batch</th>
                  <th className="px-3 py-2">Score</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Submitted</th>
                  <th className="px-3 py-2 text-end">Action</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '0.875rem' }}>
                {filtered.map(attempt => {
                  const st = students.find(s => s.id === attempt.studentId);
                  const test = tests.find(t => t.id === attempt.testId);
                  const batch = batches.find(b => b.id === st?.batchId);
                  const pct = attempt.totalQuestions ? Math.round((attempt.score / attempt.totalQuestions) * 100) : 0;
                  const passed = pct >= 60;
                  return (
                    <tr key={attempt.id}>
                      <td className="px-3 py-2">
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{st?.name || '—'}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{st?.email || ''}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div style={{ fontWeight: 500 }}>{test?.title || attempt.testId}</div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="badge border" style={{ fontSize: '0.72rem', background: 'var(--card-bg-alt, rgba(255,255,255,0.05))', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
                          {batch?.name || '—'}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <ScoreBadge score={attempt.score} total={attempt.totalQuestions} />
                      </td>
                      <td className="px-3 py-2">
                        <Badge bg={passed ? 'success' : 'danger'} className="text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.5px' }}>
                          {passed ? 'PASS' : 'FAIL'}
                        </Badge>
                      </td>
                      <td className="px-3 py-2" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {new Date(attempt.submittedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-3 py-2 text-end">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="d-inline-flex align-items-center gap-1 rounded-2"
                          onClick={() => handleViewAnswers(attempt)}
                          disabled={!test}
                          title={!test ? 'Test data not available' : 'View detailed answers'}
                        >
                          <FaEye size={11} /> View Answers
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </div>
      </Card>

      {/* ── Answer Review Modal ── */}
      <AnswerModal
        show={showModal}
        onHide={() => setShowModal(false)}
        attempt={reviewAttempt}
        test={reviewTest}
        student={reviewStudent}
      />
    </div>
  );
}
