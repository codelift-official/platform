import React, { useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { Card, Button, Badge, Collapse } from 'react-bootstrap';
import { useData } from '../../contexts/DataContext';
import AnimatedScore from '../common/AnimatedScore';
import FloatingNumbers from '../common/FloatingNumbers';
import ConfettiCelebration from '../common/ConfettiCelebration';
import {
  FiCheckCircle,
  FiXCircle,
  FiArrowLeft,
  FiRotateCcw,
  FiChevronDown,
  FiChevronUp,
  FiAward,
  FiTrendingUp,
  FiHelpCircle
} from 'react-icons/fi';
import { FaStar, FaRegStar, FaSearch, FaTrophy, FaChartBar, FaBullseye } from 'react-icons/fa';

export default function ResultPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { testAttempts = [], tests = [] } = useData();

  const [showReview, setShowReview] = useState(false);

  // Find attempt — prefer context state (live), fall back to router navigation state
  // The router state is populated immediately on navigate() so there's no flash
  const attempt =
    testAttempts.find((a) => String(a.id) === String(attemptId)) ||
    (location.state?.attempt && String(location.state.attempt.id) === String(attemptId)
      ? location.state.attempt
      : null);
  const test = attempt ? tests.find((t) => String(t.id) === String(attempt.testId)) : null;

  if (!attempt) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5 min-vh-50 text-center">
        <div className="mb-3 text-muted"><FaSearch size={44} /></div>
        <h4 className="fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>Test Attempt Not Found</h4>
        <p className="text-muted mb-4">
          The requested test evaluation could not be located or has expired.
        </p>
        <Button
          variant="primary"
          onClick={() => navigate('/student/tests')}
          className="rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
        >
          <FiArrowLeft /> Back to Tests
        </Button>
      </div>
    );
  }

  const score = attempt.score || 0;
  const totalQuestions = attempt.totalQuestions || test?.questions?.length || 1;
  const percentage = attempt.percentage !== undefined
    ? attempt.percentage
    : Math.round((score / totalQuestions) * 100);

  const passingPercentage = test?.passingPercentage !== undefined
    ? test.passingPercentage
    : (attempt.passingPercentage !== undefined ? attempt.passingPercentage : 70);

  const passed = percentage >= passingPercentage;
  const needMore = Math.max(0, passingPercentage - percentage);
  const starCount = Math.min(5, Math.max(1, Math.round((score / totalQuestions) * 5)));

  return (
    <div className="position-relative pt-0 pb-3 px-2 px-md-3">
      {/* Party Popper celebration for passed scenario */}
      <ConfettiCelebration active={passed} />

      {/* Main Result Card */}
      <div className="mx-auto" style={{ maxWidth: '640px' }}>
        <Card
          className="border-0 shadow-lg rounded-5 overflow-hidden position-relative"
          style={{
            backgroundColor: 'var(--card-bg, #ffffff)',
            borderColor: passed ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.2)',
          }}
        >
          {/* Floating numbers particle effect */}
          <FloatingNumbers
            count={24}
            colors={passed ? ['#15803D', '#16A34A', '#22C55E', '#10B981'] : ['#D97706', '#EA580C', '#E11D48', '#6366F1']}
          />

          <Card.Body className="p-3 p-md-4 text-center position-relative" style={{ zIndex: 2 }}>
            {/* Top Celebration Icon */}
            <div className="mb-2 user-select-none d-flex justify-content-center">
              {passed ? <FaTrophy size={48} className="text-warning" /> : <FaChartBar size={48} className="text-primary" />}
            </div>

            {/* Pass / Fail Header Status */}
            {passed ? (
              <div>
                <Badge
                  bg="success"
                  className="px-3 py-1.5 fs-6 fw-bolder rounded-pill mb-2 shadow-sm text-uppercase tracking-wider"
                  style={{ letterSpacing: '0.05em' }}
                >
                  ASSESSMENT PASSED
                </Badge>
                <h4 className="fw-bolder mb-1" style={{ color: 'var(--text-primary, #171717)' }}>
                  Outstanding Work!
                </h4>
                <p className="text-muted small mb-2">
                  You successfully cleared the assessment for <strong>{test?.title || 'this test'}</strong>.
                </p>
              </div>
            ) : (
              <div>
                <Badge
                  bg="warning"
                  text="dark"
                  className="px-3 py-1.5 fs-6 fw-bolder rounded-pill mb-2 shadow-sm text-uppercase tracking-wider"
                  style={{ letterSpacing: '0.05em' }}
                >
                  Keep Going! You'll Get It Next Time!
                </Badge>
                <h4 className="fw-bolder mb-1" style={{ color: 'var(--text-primary, #171717)' }}>
                  Keep Practicing!
                </h4>
                <p className="text-muted small mb-2">
                  Assessment results for <strong>{test?.title || 'this test'}</strong>.
                </p>
              </div>
            )}

            {/* Circular / Animated Score Display */}
            <div
              className="my-2.5 py-2.5 px-4 rounded-4 mx-auto d-inline-flex flex-column align-items-center justify-content-center"
              style={{
                backgroundColor: passed ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.06)',
                border: `2px dashed ${passed ? '#22c55e' : '#f97316'}`,
                minWidth: '220px'
              }}
            >
              <div className="text-uppercase small fw-bold text-muted mb-0.5">
                Your Final Score
              </div>

              {/* Framer Motion Count-up score */}
              <AnimatedScore
                value={percentage}
                className={passed ? 'text-success' : 'text-warning'}
              />

              <div className="fw-bold fs-6 mt-0.5" style={{ color: 'var(--text-primary)' }}>
                {score} / {totalQuestions} Correct Answers
              </div>

              <div className="d-flex align-items-center gap-2 mt-1.5 pt-1.5 border-top w-100 justify-content-center small text-muted" style={{ fontSize: '0.78rem' }}>
                <span className="d-inline-flex align-items-center gap-1"><FaBullseye size={12} className="text-primary" /> Passing mark: <strong>{passingPercentage}%</strong></span>
                {!passed && needMore > 0 && (
                  <Badge bg="danger-subtle" className="text-danger border border-danger-subtle">
                    Need {needMore}% more
                  </Badge>
                )}
              </div>
            </div>

            {/* Stars Rating / Topic Mastery */}
            <div className="mb-3">
              <div className="d-flex justify-content-center gap-1.5 mb-1 fs-5 text-warning">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i}>
                    {i < starCount ? <FaStar /> : <FaRegStar className="opacity-50" />}
                  </span>
                ))}
              </div>
              <div className="small text-muted fw-semibold">
                {passed ? `Mastery Score: ${starCount}/5 Stars` : `Mastery Level: ${starCount}/5 Stars`}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex flex-wrap gap-2 justify-content-center mt-4 pt-2">
              {/* Review Answers Toggle */}
              <Button
                variant="outline-secondary"
                onClick={() => setShowReview(!showReview)}
                className="rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
              >
                <FaChartBar size={14} />
                <span>{showReview ? 'Hide Answers' : 'Review Answers'}</span>
                {showReview ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
              </Button>

              {/* Retake Button (if allowed) */}
              {test?.allowRetake && (
                <Button
                  variant="outline-primary"
                  onClick={() => navigate('/student/tests')}
                  className="rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
                >
                  <FiRotateCcw size={16} /> Retake Test
                </Button>
              )}

              {/* Go Back Button */}
              <Button
                variant="primary"
                onClick={() => navigate('/student/tests')}
                className="rounded-pill px-4 py-2 fw-bold d-inline-flex align-items-center gap-2 shadow-sm"
              >
                <FiArrowLeft size={16} /> Go Back to Tests
              </Button>
            </div>

            {/* Collapsible Answer Review Section */}
            <Collapse in={showReview}>
              <div className="mt-4 pt-4 border-top text-start">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>
                    Detailed Question Breakdown
                  </h6>
                  <Badge bg="secondary" className="px-2.5 py-1">
                    {score}/{totalQuestions} Correct
                  </Badge>
                </div>

                {test?.questions && test.questions.length > 0 ? (
                  <div className="d-flex flex-column gap-3">
                    {test.questions.map((q, idx) => {
                      const studentAnswer = attempt.answers ? attempt.answers[idx] : undefined;
                      const isCorrect = studentAnswer === q.correctAnswer;

                      return (
                        <div
                          key={q.id || idx}
                          className="p-3 rounded-3 border"
                          style={{
                            backgroundColor: isCorrect ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                            borderColor: isCorrect ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)'
                          }}
                        >
                          <div className="d-flex align-items-start gap-2 mb-2">
                            <span className="mt-1">
                              {isCorrect ? (
                                <FiCheckCircle className="text-success fs-5" />
                              ) : (
                                <FiXCircle className="text-danger fs-5" />
                              )}
                            </span>
                            <div className="fw-semibold small" style={{ color: 'var(--text-primary)' }}>
                              Q{idx + 1}. {q.text}
                            </div>
                          </div>

                          <div className="ps-4 small">
                            <div className="mb-1">
                              <span className="text-muted me-2">Your Answer:</span>
                              <span className={`fw-semibold ${isCorrect ? 'text-success' : 'text-danger'}`}>
                                {studentAnswer !== undefined && q.options[studentAnswer]
                                  ? q.options[studentAnswer]
                                  : 'Not answered'}
                              </span>
                            </div>
                            {!isCorrect && (
                              <div>
                                <span className="text-muted me-2">Correct Answer:</span>
                                <span className="text-success fw-bold">
                                  {q.options[q.correctAnswer]}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted small">
                    Question breakdown is not available for this legacy attempt.
                  </p>
                )}
              </div>
            </Collapse>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
