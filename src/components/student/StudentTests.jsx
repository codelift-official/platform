import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import toast from 'react-hot-toast';
import { FaPlay, FaCheckCircle, FaFileAlt } from 'react-icons/fa';
import { FiX, FiCheck, FiAlertCircle, FiClipboard } from 'react-icons/fi';

function ScoreCircle({ score, total }) {
  const pct = total ? Math.round((score / total) * 100) : 0;
  const color = pct >= 80 ? '#15803D' : pct >= 60 ? '#D97706' : '#BE123C';
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 90,
        height: 90,
        borderRadius: '50%',
        background: `conic-gradient(${color} ${pct * 3.6}deg, var(--border-color) 0)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 10px',
      }}>
        <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'var(--card-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: '1.2rem', color, lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>/ {total}</span>
        </div>
      </div>
      <div style={{ fontWeight: 700, color, fontSize: '1rem' }}>{pct}%</div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
        {pct >= 80 ? 'Excellent!' : pct >= 60 ? 'Good job' : 'Keep practicing'}
      </div>
    </div>
  );
}

export default function StudentTests() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const testIdParam = searchParams.get('testId');
  const { auth } = useAuth();
  const { students, tests, testAttempts, submitTestAttempt, batches } = useData();

  const student = (students || []).find(s =>
    (auth?.studentId && (s.id === auth.studentId || s.legacyId === auth.studentId)) ||
    (auth?.id && (s.id === auth.id || s.legacyId === auth.id)) ||
    (auth?.userId && (s.id === auth.userId || s.legacyId === auth.userId)) ||
    (auth?.email && s.email?.toLowerCase() === auth.email?.toLowerCase())
  );

  const studentBatchIds = Array.from(new Set([
    student?.batchId,
    ...(batches || []).filter(b => b.studentIds?.includes(student?.id) || b.studentIds?.includes(student?.legacyId)).map(b => b.id)
  ].filter(Boolean)));

  const myTests = (tests || []).filter(t => {
    const assignedBatches = [...(t.assignedBatchIds || []), ...(t.batchIds || [])];
    const matchesBatch = studentBatchIds.some(bId => assignedBatches.includes(bId));
    const inBatchTestIds = (batches || []).some(b =>
      studentBatchIds.includes(b.id) && Array.isArray(b.testIds) && b.testIds.includes(t.id)
    );
    return matchesBatch || inBatchTestIds;
  });

  const [activeTest, setActiveTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  const startTest = (test) => {
    setActiveTest(test);
    setAnswers({});
    setSubmitted(false);
    setResult(null);
  };

  useEffect(() => {
    if (testIdParam && myTests.length > 0 && !activeTest) {
      const targetTest = myTests.find(t => t.id === testIdParam);
      if (targetTest) {
        startTest(targetTest);
      }
    }
  }, [testIdParam, myTests, activeTest]);

  const getAttempt = (testId) =>
    (testAttempts || [])
      .filter(a => (a.studentId === student?.id || (student?.legacyId && a.studentId === student.legacyId)) && a.testId === testId)
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];

  const handleAnswer = (qIndex, optIndex) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleSubmitTest = () => {
    if (!activeTest) return;
    const questions = activeTest.questions || [];
    if (questions.length === 0) {
      toast.error('This test has no questions to evaluate.');
      return;
    }
    const unanswered = questions.filter((_, i) => answers[i] === undefined);
    if (unanswered.length > 0) {
      toast.error(`Please answer all ${unanswered.length} remaining question(s).`);
      return;
    }
    const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.correctAnswer ? 1 : 0), 0);
    const passingPercentage = activeTest.passingPercentage !== undefined ? activeTest.passingPercentage : 70;
    const percentage = Math.round((score / questions.length) * 100);

    const targetStudentId = student?.id || auth?.studentId || auth?.id || auth?.userId;
    const targetBatchId = student?.batchId || studentBatchIds[0] || null;

    const attempt = submitTestAttempt({
      studentId: targetStudentId,
      testId: activeTest.id,
      batchId: targetBatchId,
      answers: questions.map((_, i) => answers[i]),
      score,
      totalQuestions: questions.length,
      percentage,
      passingPercentage,
    });

    toast.success(`Test submitted! Score: ${percentage}%`);
    setActiveTest(null);
    setSubmitted(false);
    navigate(`/student/test-result/${attempt.id}`, { state: { attempt } });
  };

  const answeredCount = Object.keys(answers).length;
  const totalQ = activeTest?.questions?.length || 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-3">
        <h4 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>My Tests</h4>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
          {myTests.length} tests available for your batch
        </p>
      </div>

      {/* Test List */}
      {!activeTest && (
        <>
          {myTests.length === 0 ? (
            <div className="empty-state">
              <FiClipboard size={48} />
              <h3>No tests assigned yet</h3>
              <p>Your instructor will assign tests as you progress through the course.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {myTests.map(test => {
                const attempt = getAttempt(test.id);
                const passPct = test.passingPercentage !== undefined ? test.passingPercentage : 70;
                const pct = attempt ? (attempt.percentage !== undefined ? attempt.percentage : Math.round((attempt.score / attempt.totalQuestions) * 100)) : null;
                const isPassed = pct !== null ? pct >= passPct : false;
                return (
                  <div
                    key={test.id}
                    className="card border rounded-4"
                    style={{ background: 'var(--card-bg)', borderColor: attempt ? (isPassed ? '#BBF7D0' : '#FED7AA') : 'var(--border-color)', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}
                  >
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                        <div style={{ flex: 1 }}>
                          <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                            <h6 style={{ fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{test.title}</h6>
                            {test.allowRetake ? (
                              <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill" style={{ fontSize: '0.72rem' }}>
                                Retakes Allowed
                              </span>
                            ) : (
                              <span className="badge bg-secondary-subtle text-secondary border rounded-pill" style={{ fontSize: '0.72rem' }}>
                                Single Attempt
                              </span>
                            )}
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill" style={{ fontSize: '0.72rem' }}>
                              Passing: {passPct}%
                            </span>
                            {attempt && (
                              <span className={`badge rounded-pill ${isPassed ? 'bg-success text-white' : 'bg-warning text-dark'}`} style={{ fontSize: '0.72rem' }}>
                                {isPassed ? 'Passed' : 'Needs Retake'}
                              </span>
                            )}
                          </div>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 12, lineHeight: 1.6 }}>{test.description}</p>
                          <div className="d-flex gap-3 align-items-center flex-wrap" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            <span><strong>{test.questions.length}</strong> questions</span>
                            {attempt && <span style={{ color: isPassed ? '#15803D' : '#D97706', fontWeight: 700 }}>Last score: {attempt.score}/{attempt.totalQuestions} ({pct}%)</span>}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          {attempt && (
                            <button
                              onClick={() => navigate(`/student/test-result/${attempt.id}`)}
                              className="btn btn-sm btn-outline-success rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-1.5"
                              style={{ fontSize: '0.85rem' }}
                            >
                              <span>View Result</span>
                            </button>
                          )}

                          {attempt && !test.allowRetake ? (
                            <div className="d-flex flex-column align-items-end gap-1">
                              <button
                                disabled
                                className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-2 fw-semibold"
                                style={{ opacity: 0.7, cursor: 'not-allowed', fontSize: '0.85rem' }}
                              >
                                Attempted
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startTest(test)}
                              style={{
                                padding: '9px 20px',
                                borderRadius: 50,
                                border: 'none',
                                background: 'var(--bs-primary)',
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                flexShrink: 0,
                              }}
                              className="shadow-sm"
                            >
                              <FaPlay style={{ fontSize: '0.7rem' }} /> {attempt ? 'Retake Test' : 'Start Test'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Active Test */}
      {activeTest && !submitted && (
        <div>
          {/* Test Header */}
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <div>
              <h5 style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>{activeTest.title}</h5>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {answeredCount}/{totalQ} answered
              </span>
            </div>
            <div className="d-flex align-items-center gap-3">
              <div style={{ height: 8, width: 120, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden', alignSelf: 'center' }}>
                <div style={{ width: `${(answeredCount / totalQ) * 100}%`, height: '100%', background: 'var(--bs-primary)', borderRadius: 4, transition: 'width 0.3s ease' }} />
              </div>

              {/* Redesigned Exit Button (Bug #8: rounded-pill, subtle, hover to red) */}
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to exit the test? Progress will not be saved.')) {
                    setActiveTest(null);
                  }
                }}
                className="btn btn-sm d-flex align-items-center gap-1.5 rounded-pill px-3 py-1.5 border"
                style={{
                  background: 'var(--card-bg)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ef4444';
                  e.currentTarget.style.borderColor = '#ef4444';
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.background = 'var(--card-bg)';
                }}
                title="Exit Assessment"
              >
                <FiX size={15} />
                <span>Exit</span>
              </button>
            </div>
          </div>

          {/* Questions */}
          <div className="d-flex flex-column gap-4 mb-4">
            {activeTest.questions.map((q, qi) => (
              <div
                key={q.id}
                className="card border rounded-4"
                style={{ background: 'var(--card-bg)', borderColor: answers[qi] !== undefined ? 'rgba(var(--bs-primary-rgb), 0.3)' : 'var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              >
                <div className="card-body p-4">
                  {/* Question Prompt with marker and generous spacing */}
                  <div className="d-flex align-items-start gap-3 mb-3">
                    <div className="quiz-q-marker">
                      Q{qi + 1}
                    </div>
                    <div className="quiz-q-text flex-grow-1">
                      {q.text}
                    </div>
                  </div>

                  {/* Option Choices */}
                  <div className="d-flex flex-column gap-2">
                    {q.options.map((opt, oi) => {
                      const isSelected = answers[qi] === oi;
                      return (
                        <button
                          key={oi}
                          type="button"
                          onClick={() => handleAnswer(qi, oi)}
                          className={`quiz-option-card ${isSelected ? 'selected' : ''}`}
                        >
                          <div className="quiz-opt-letter">
                            {'ABCD'[oi]}
                          </div>
                          <div className="quiz-opt-text">
                            {opt}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmitTest}
            style={{
              width: '100%',
              background: 'var(--bs-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '14px',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <FaCheckCircle /> Submit Test ({answeredCount}/{totalQ} answered)
          </button>
        </div>
      )}

      {/* Result Screen */}
      {activeTest && submitted && result && (
        <div className="card border-0 rounded-4" style={{ background: 'var(--card-bg)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', maxWidth: 600, margin: '0 auto' }}>
          <div className="card-body p-5 text-center">
            <h5 style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Test Complete!</h5>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 28 }}>{activeTest.title}</p>

            <ScoreCircle score={result.score} total={result.total} />

            <div className="d-flex gap-3 mt-5 align-items-center justify-content-center flex-wrap">
              <button
                onClick={() => setActiveTest(null)}
                style={{ flex: 1, minWidth: '160px', background: 'var(--bs-primary)', color: '#fff', border: 'none', borderRadius: 50, padding: '12px 24px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                className="shadow-sm"
              >
                Back to Tests
              </button>
              {activeTest.allowRetake ? (
                <button
                  onClick={() => startTest(activeTest)}
                  style={{ background: 'var(--bg-body)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: 50, padding: '12px 24px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Retake Test
                </button>
              ) : (
                <div className="small text-muted fst-italic">
                  (Single attempt evaluation · Retakes disabled)
                </div>
              )}
            </div>

            {/* Answer review */}
            <div style={{ marginTop: 28, textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Answer Review</div>
              {activeTest.questions.map((q, qi) => {
                const chosen = result.attempt.answers[qi];
                const correct = q.correctAnswer;
                const isRight = chosen === correct;
                return (
                  <div key={qi} style={{ padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isRight ? '#15803D' : '#BE123C' }}>{isRight ? '✓' : '✗'}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>Q{qi + 1}: {q.text}</span>
                    </div>
                    <div style={{ paddingLeft: 16, fontSize: '0.78rem' }}>
                      {!isRight && <div style={{ color: '#BE123C' }}>Your answer: {q.options[chosen] || 'Not answered'}</div>}
                      <div style={{ color: '#15803D', fontWeight: 600 }}>Correct: {q.options[correct]}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
