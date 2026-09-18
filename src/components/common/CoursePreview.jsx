import React, { useState, useEffect, useRef } from 'react';
import { Card, Badge, Button, ProgressBar } from 'react-bootstrap';
import {
  FaChevronDown,
  FaChevronRight,
  FaCheckCircle,
  FaCircle,
  FaBook,
  FaClipboardList,
  FaDownload,
  FaEdit,
  FaArrowLeft,
  FaArrowRight,
  FaRedo,
  FaLock,
  FaCheck,
  FaStar,
  FaAward,
  FaExclamationTriangle,
  FaShieldAlt,
  FaTrophy,
  FaBookOpen
} from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

// ── Simple Markdown renderer with tables and code blocks ───────────────────────
function SimpleMarkdown({ content }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('```')) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre
          key={i}
          style={{
            background: '#0f172a',
            color: '#e2e8f0',
            borderRadius: 10,
            padding: '14px 16px',
            overflowX: 'auto',
            fontSize: '0.85rem',
            lineHeight: 1.6,
            margin: '14px 0',
            border: '1px solid var(--border-color, #334155)'
          }}
        >
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
    } else if (line.startsWith('# ')) {
      elements.push(<h1 key={i} style={{ fontWeight: 800, fontSize: '1.45rem', color: 'var(--text-primary)', marginBottom: 10, marginTop: 18 }}>{line.slice(2)}</h1>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 10, marginTop: 18 }}>{line.slice(3)}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: 8, marginTop: 14 }}>{line.slice(4)}</h3>);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5, paddingLeft: 6 }}>
          <span style={{ color: 'var(--bs-primary)', marginTop: 3, flexShrink: 0 }}>•</span>
          <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.65 }}>{renderInline(line.slice(2))}</span>
        </div>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\./)[1];
      elements.push(
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5, paddingLeft: 6 }}>
          <span style={{ color: 'var(--bs-primary)', fontWeight: 700, minWidth: 22, fontSize: '0.9rem' }}>{num}.</span>
          <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.65 }}>{renderInline(line.replace(/^\d+\.\s/, ''))}</span>
        </div>
      );
    } else if (line.startsWith('| ')) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        if (!lines[i].includes('---')) {
          rows.push(lines[i].split('|').filter(c => c.trim()).map(c => c.trim()));
        }
        i++;
      }
      elements.push(
        <div key={`table-${i}`} style={{ overflowX: 'auto', marginBottom: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr>
                {rows[0]?.map((h, hi) => (
                  <th key={hi} style={{ background: 'var(--bg-body)', color: 'var(--text-secondary)', padding: '10px 14px', textAlign: 'left', fontWeight: 700, borderBottom: '2px solid var(--border-color)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(1).map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ padding: '9px 14px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>{renderInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    } else if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="md-blockquote">
          {renderInline(line.slice(2))}
        </blockquote>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={i} style={{ height: 8 }} />);
    } else {
      elements.push(<p key={i} style={{ color: 'var(--text-primary)', lineHeight: 1.75, marginBottom: 10, fontSize: '0.9rem' }}>{renderInline(line)}</p>);
    }
    i++;
  }

  return <div>{elements}</div>;
}

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith('`') && p.endsWith('`')) return <code key={i} className="md-inline-code">{p.slice(1, -1)}</code>;
    return p;
  });
}

// ── Celebration Animations ───────────────────────
function fireConfetti() {
  const duration = 2500;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);

    const particleCount = 50 * (timeLeft / duration);
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    });
  }, 250);
}

function fireCelebration() {
  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, zIndex: 9999 });
  confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, zIndex: 9999 });
  confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, zIndex: 9999 });
}

// ── Rated Topic MCQ Assessment & Quiz Component (MANDATORY & RATED) ───────────────────────
function TopicQuiz({ questions = [], topicTitle = '', topicId = '', savedAttempt = null, onSaveAttempt, isMandatory = true }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Preload saved attempt if exists
  useEffect(() => {
    if (savedAttempt && savedAttempt.answers) {
      const answersObj = Array.isArray(savedAttempt.answers)
        ? savedAttempt.answers.reduce((acc, ans, idx) => ({ ...acc, [idx]: ans }), {})
        : savedAttempt.answers;
      setSelectedAnswers(answersObj);
      setIsSubmitted(true);
      setValidationError('');
    } else {
      setSelectedAnswers({});
      setIsSubmitted(false);
      setValidationError('');
    }
  }, [topicId, savedAttempt]);

  if (!Array.isArray(questions) || questions.length === 0) return null;

  const answeredCount = Object.keys(selectedAnswers).length;
  let correctCount = 0;
  questions.forEach((q, idx) => {
    if (selectedAnswers[idx] === q.correct) correctCount++;
  });

  const percentage = Math.round((correctCount / questions.length) * 100);
  const isPassed = percentage >= 75;

  const getRating = (pct) => {
    if (pct === 100) return 'Grade A+ (Perfect Score)';
    if (pct >= 85) return 'Grade A (Exceptional)';
    if (pct >= 75) return 'Grade B+ (Passed)';
    if (pct >= 50) return 'Grade C (Average - Retake Recommended)';
    return 'Grade F (Failed - Retake Required)';
  };

  const handleSubmit = () => {
    // Validation: Require all questions to be answered
    if (answeredCount < questions.length) {
      setValidationError(`Please answer all ${questions.length} questions before submitting (Answered ${answeredCount} of ${questions.length}).`);
      toast.error(`Please answer all questions before submitting.`, { duration: 3000 });
      return;
    }

    setValidationError('');
    setIsSubmitted(true);

    const rating = getRating(percentage);

    if (onSaveAttempt) {
      onSaveAttempt({
        topicId,
        answers: Object.keys(selectedAnswers).map(k => selectedAnswers[k]),
        score: correctCount,
        totalMarks: questions.length,
        passed: isPassed,
        rating
      });
    }

    if (percentage === 100) {
      fireConfetti();
      toast.success(`Perfect score! ${correctCount}/${questions.length} (100%) - Topic Test Passed!`, { duration: 3000 });
    } else if (isPassed) {
      toast.success(`Test Passed! Score: ${correctCount}/${questions.length} (${percentage}%)`, { duration: 3000 });
    } else {
      toast.error(`Score: ${correctCount}/${questions.length} (${percentage}%). Passing mark is 75%. Please review and retake.`, { duration: 3000 });
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setValidationError('');
  };

  return (
    <div id="topic-assessment-section" className="card border rounded-4 shadow-sm mb-4 overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
      {/* Header with Clean Chips & Assessment Overview */}
      <div className="card-header p-3.5 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2" style={{ background: 'var(--bg-body)', borderColor: 'var(--border-color)' }}>
        <div className="d-flex align-items-center gap-2.5">
          <div
            className="p-2 rounded-3 d-flex align-items-center justify-content-center"
            style={{ background: 'rgba(var(--bs-primary-rgb, 21, 128, 61), 0.12)', color: 'var(--bs-primary)' }}
          >
            <FaClipboardList size={18} />
          </div>
          <div>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <h6 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>Topic MCQ Assessment</h6>
              {isMandatory && (
                <span className="clean-chip clean-chip-warning">
                  Mandatory (75% to Pass)
                </span>
              )}
            </div>
            <span className="small text-muted">{questions.length} question{questions.length !== 1 ? 's' : ''} · 1 mark each ({questions.length} Total Marks)</span>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          {isSubmitted ? (
            <span className={`clean-chip ${isPassed ? 'clean-chip-success' : 'clean-chip-warning'} px-3 py-1.5 fs-6`}>
              {isPassed ? 'Passed' : 'Failed'}: {correctCount}/{questions.length} Marks ({percentage}%)
            </span>
          ) : (
            <span className="clean-chip">
              {answeredCount}/{questions.length} Answered
            </span>
          )}
        </div>
      </div>

      <div className="card-body p-4">
        {validationError && (
          <div className="alert alert-danger py-2.5 px-3 small d-flex align-items-center gap-2 mb-3 rounded-3">
            <FaExclamationTriangle className="flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Result & Rating Banner */}
        {isSubmitted && (
          <div className={`alert ${isPassed ? 'alert-success' : 'alert-danger'} d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4 rounded-3 p-3 shadow-sm`}>
            <div className="d-flex align-items-center gap-2.5">
              {isPassed ? (
                <FaCheckCircle size={24} className="text-success flex-shrink-0" />
              ) : (
                <FaExclamationTriangle size={24} className="text-danger flex-shrink-0" />
              )}
              <div>
                <div className="fw-bold fs-6">
                  {isPassed ? 'Assessment Passed! Requirement Satisfied' : 'Passing Mark Not Met (Minimum 75% Required)'}
                </div>
                <div className="small">
                  Marks: <strong>{correctCount} / {questions.length}</strong> · {getRating(percentage)}
                </div>
              </div>
            </div>
            <Button variant="outline-dark" size="sm" onClick={handleRetake} className="d-flex align-items-center gap-1.5 rounded-2 shadow-sm">
              <FaRedo size={12} />
              <span>Retake Test</span>
            </Button>
          </div>
        )}

        {/* Question Cards with generous spacing and modern options layout */}
        <div className="d-flex flex-column gap-4">
          {questions.map((q, qIdx) => {
            const userSelectedOpt = selectedAnswers[qIdx];
            const isAnswered = userSelectedOpt !== undefined;
            const isCorrect = userSelectedOpt === q.correct;
            const isMissing = !isAnswered && validationError;

            return (
              <div
                key={qIdx}
                className="p-4 rounded-4 border"
                style={{
                  background: 'var(--bg-body)',
                  borderColor: isMissing ? '#ef4444' : 'var(--border-color)',
                  boxShadow: isMissing ? '0 0 0 1px #ef4444' : 'none'
                }}
              >
                {/* Question Header with generous gap and dedicated marker */}
                <div className="d-flex justify-content-between align-items-start gap-3 mb-3 pb-3 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="d-flex align-items-start gap-3 flex-grow-1">
                    <div className="quiz-q-marker">
                      Q{qIdx + 1}
                    </div>
                    <div className="quiz-q-text">
                      {q.text}
                    </div>
                  </div>
                  {isSubmitted && (
                    <span className={`clean-chip ${isCorrect ? 'clean-chip-success' : 'clean-chip-warning'} flex-shrink-0 mt-1`}>
                      {isCorrect ? '1 Mark' : '0 Marks'}
                    </span>
                  )}
                </div>

                {/* Option Choices with generous spacing and dedicated option letter pills */}
                <div className="d-flex flex-column gap-2 mt-3">
                  {q.options?.map((opt, optIdx) => {
                    const isSelected = userSelectedOpt === optIdx;
                    const isOptionCorrect = optIdx === q.correct;

                    let cardClass = 'quiz-option-card';
                    if (isSelected) cardClass += ' selected';
                    if (isSubmitted) {
                      if (isOptionCorrect) cardClass += ' border-success text-success bg-success-subtle';
                      else if (isSelected && !isOptionCorrect) cardClass += ' border-danger text-danger bg-danger-subtle';
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        disabled={isSubmitted}
                        onClick={() => {
                          setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
                          setValidationError('');
                        }}
                        className={cardClass}
                      >
                        <div className="quiz-opt-letter">
                          {String.fromCharCode(65 + optIdx)}
                        </div>
                        <div className="quiz-opt-text">
                          {opt}
                        </div>
                        {isSubmitted && isOptionCorrect && (
                          <span className="clean-chip clean-chip-success ms-2 flex-shrink-0">
                            Correct
                          </span>
                        )}
                        {isSubmitted && isSelected && !isOptionCorrect && (
                          <span className="clean-chip clean-chip-warning ms-2 flex-shrink-0" style={{ color: '#dc2626', background: 'rgba(239, 68, 68, 0.1)' }}>
                            Your Choice
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Bottom Bar */}
        <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center flex-wrap gap-2" style={{ borderColor: 'var(--border-color)' }}>
          <span className="small text-muted">
            {answeredCount} of {questions.length} questions answered
          </span>
          <div className="d-flex gap-2">
            {isSubmitted ? (
              <Button variant="outline-primary" size="sm" onClick={handleRetake} className="d-flex align-items-center gap-1.5 rounded-2">
                <FaRedo size={12} />
                <span>Retake Test</span>
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                disabled={answeredCount === 0}
                className="d-flex align-items-center gap-1.5 rounded-2 fw-semibold shadow-sm"
              >
                <FaCheckCircle size={13} />
                <span>Submit & Calculate Marks</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CoursePreview({
  course,
  isAdmin = false,
  hideHeaderBanner = false,
  studentId,
  studentProgress = {},
  quizAttempts = {},
  onMarkComplete,
  onSaveQuizAttempt,
  onEditCourse,
  onTogglePublish,
  onExportJSON,
  onTakeTest,
  onBack,
  availableCourses = [],
  onSelectCourse
}) {
  const modules = Array.isArray(course?.modules) ? course.modules : [];
  const allTopics = modules.flatMap(m => Array.isArray(m?.topics) ? m.topics : []);

  // Module Menu / Curriculum View is hidden by default for distraction-free reading
  const [isModuleMenuOpen, setIsModuleMenuOpen] = useState(false);
  const [expandedModuleId, setExpandedModuleId] = useState(modules[0]?.id || null);
  const [activeTopicId, setActiveTopicId] = useState(allTopics[0]?.id || null);
  const contentRef = useRef(null);

  // Safely compute active module & topic indices
  const foundModuleIndex = modules.findIndex(m => Array.isArray(m?.topics) && m.topics.some(t => t?.id === activeTopicId));
  const currentModuleIndex = foundModuleIndex >= 0 ? foundModuleIndex : 0;
  const currentModule = modules[currentModuleIndex] || modules[0] || null;
  const activeTopic = allTopics.find(t => t?.id === activeTopicId) || (Array.isArray(currentModule?.topics) ? currentModule.topics[0] : null) || allTopics[0] || null;

  const currentTopicIndexInModule = Array.isArray(currentModule?.topics) ? currentModule.topics.findIndex(t => t?.id === activeTopic?.id) : -1;
  const isFirstTopicInModule = currentTopicIndexInModule === 0;
  const isLastTopicInModule = Array.isArray(currentModule?.topics) ? currentTopicIndexInModule === (currentModule.topics.length - 1) : true;
  const isLastModule = currentModuleIndex === modules.length - 1;
  const isFirstModule = currentModuleIndex === 0;

  // Check mandatory quiz status for active topic (supports topic-level or module capstone)
  const isLastTopicInCurrentModule = currentModule?.topics?.length > 0 && currentModule.topics[currentModule.topics.length - 1]?.id === activeTopic?.id;
  const activeQuizQuestions = (Array.isArray(activeTopic?.quizQuestions) && activeTopic.quizQuestions.length > 0)
    ? activeTopic.quizQuestions
    : (isLastTopicInCurrentModule && Array.isArray(currentModule?.quizQuestions) && currentModule.quizQuestions.length > 0 ? currentModule.quizQuestions : []);
  const hasQuiz = activeQuizQuestions.length > 0;
  const currentAttempt = activeTopic?.id ? quizAttempts?.[activeTopic.id] : null;
  const isQuizPassed = Boolean(currentAttempt?.passed);
  const isTopicCompleted = Boolean(
    studentProgress?.[activeTopic?.id] === 'completed' ||
    studentProgress?.[activeTopic?.id] === true ||
    (hasQuiz && isQuizPassed)
  );

  // Total course quiz questions & marks earned calculation
  const totalCourseQuizQuestions = allTopics.reduce(
    (sum, t) => sum + (Array.isArray(t?.quizQuestions) ? t.quizQuestions.length : 0),
    0
  );

  const totalMarksEarned = allTopics.reduce((sum, t) => {
    const attempt = quizAttempts?.[t?.id];
    return sum + (Number(attempt?.score) || 0);
  }, 0);

  const overallScorePercent = totalCourseQuizQuestions > 0
    ? Math.round((totalMarksEarned / totalCourseQuizQuestions) * 100)
    : 0;

  // Completed topics count (Topic with test requires passed test; pure reading topic requires mark complete)
  const completedCount = allTopics.filter((t) => {
    const hasQ = Array.isArray(t?.quizQuestions) && t.quizQuestions.length > 0;
    const isPassed = Boolean(quizAttempts?.[t?.id]?.passed);
    const isDone = studentProgress?.[t?.id] === 'completed' || studentProgress?.[t?.id] === true;
    return hasQ ? isPassed : isDone;
  }).length;

  const progressPercent = allTopics.length ? Math.round((completedCount / allTopics.length) * 100) : 0;

  // Sync when course changes or modules/topics hydrate
  useEffect(() => {
    if (modules.length > 0) {
      if (!expandedModuleId || !modules.some(m => m.id === expandedModuleId)) {
        setExpandedModuleId(modules[0].id);
      }
      if (!activeTopicId || !allTopics.some(t => t.id === activeTopicId)) {
        setActiveTopicId(allTopics[0]?.id || modules[0]?.topics?.[0]?.id || null);
      }
    }
  }, [course?.id, modules.length, allTopics.length]);

  // Scroll to top of content when active topic or module changes (with safe header offset)
  useEffect(() => {
    if (contentRef.current) {
      const yOffset = -90;
      const y = contentRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  }, [activeTopicId, currentModuleIndex]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowLeft' && !(isFirstModule && isFirstTopicInModule)) {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowRight' && !(isLastModule && isLastTopicInModule)) {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setIsModuleMenuOpen(open => !open);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeTopicId, isFirstModule, isFirstTopicInModule, isLastModule, isLastTopicInModule, hasQuiz, isQuizPassed, isAdmin]);

  if (!course) {
    return (
      <div className="text-center py-5" style={{ color: 'var(--text-secondary)' }}>
        <FaBook style={{ fontSize: '3rem', marginBottom: 16, opacity: 0.4 }} />
        <p>No course selected for preview.</p>
        {onBack && (
          <Button variant="outline-secondary" size="sm" onClick={onBack}>
            Back
          </Button>
        )}
      </div>
    );
  }

  // Navigation handlers with MANDATORY TEST enforcement
  const handlePrevious = () => {
    if (!isFirstTopicInModule) {
      const prevTopic = currentModule?.topics?.[currentTopicIndexInModule - 1];
      if (prevTopic?.id) setActiveTopicId(prevTopic.id);
    } else if (!isFirstModule) {
      const prevModule = modules[currentModuleIndex - 1];
      if (prevModule) {
        setExpandedModuleId(prevModule.id);
        const prevTopic = Array.isArray(prevModule.topics) ? prevModule.topics[prevModule.topics.length - 1] : null;
        if (prevTopic?.id) setActiveTopicId(prevTopic.id);
      }
    }
  };

  const handleNext = () => {
    // MANDATORY TEST CHECK:
    // If active topic has a quiz and user is a student who has not passed it:
    if (!isAdmin && hasQuiz && !isQuizPassed) {
      toast.error(
        'Please pass the topic assessment test before proceeding.',
        { duration: 3000 }
      );
      const quizSection = document.getElementById('topic-assessment-section');
      if (quizSection) {
        quizSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    // Mark current topic completed if no quiz or quiz passed
    if (onMarkComplete && activeTopic?.id) {
      onMarkComplete(activeTopic.id);
    }

    if (isLastTopicInModule) {
      // Module completion celebration
      fireCelebration();
      toast.success(`Module Complete: "${currentModule?.title || 'Module'}"!`, {
        duration: 3000,
      });

      if (!isLastModule) {
        const nextModule = modules[currentModuleIndex + 1];
        if (nextModule) {
          setExpandedModuleId(nextModule.id);
          const nextTopic = Array.isArray(nextModule.topics) ? nextModule.topics[0] : null;
          if (nextTopic?.id) setActiveTopicId(nextTopic.id);
        }
      } else {
        fireConfetti();
        toast.success('Congratulations! You completed all modules in this course!', {
          duration: 3000,
        });
      }
    } else {
      const nextTopic = currentModule?.topics?.[currentTopicIndexInModule + 1];
      if (nextTopic?.id) setActiveTopicId(nextTopic.id);
    }
  };

  // Reusable Curriculum Accordion for both Desktop Docked Sidebar and Mobile Drawer
  const renderCurriculumAccordion = (isMobile = false) => (
    <div className="curriculum-accordion-list">
      {modules.map((mod, mIdx) => {
        const isExpanded = expandedModuleId === mod.id;
        const modTopics = mod.topics || [];
        const modQuizCount = modTopics.reduce((sum, t) => sum + (t.quizQuestions?.length || 0), 0);
        const topicsDone = modTopics.filter((t) => {
          const hasQ = Array.isArray(t?.quizQuestions) && t.quizQuestions.length > 0;
          const isPassed = quizAttempts?.[t?.id]?.passed || (quizAttempts?.[t?.id]?.percentage >= 75);
          const isDone = studentProgress[t.id] === 'completed' || studentProgress[t.id] === true;
          return hasQ ? isPassed : isDone;
        }).length;
        const isModComplete = topicsDone === modTopics.length && modTopics.length > 0;

        return (
          <div
            key={mod.id || mIdx}
            className={`mb-2 rounded-3 border module-card ${isModComplete ? 'completed' : ''} ${isExpanded ? 'active' : ''}`}
            style={{
              background: 'var(--card-bg)',
              borderColor: isExpanded ? 'var(--bs-primary)' : 'var(--border-color)',
              overflow: 'hidden'
            }}
          >
            {/* Module Header Button */}
            <button
              type="button"
              onClick={() => setExpandedModuleId(isExpanded ? null : mod.id)}
              className="w-100 text-start p-2.5 border-0 d-flex align-items-center justify-content-between gap-2"
              style={{
                background: isExpanded ? 'var(--bg-body)' : 'transparent',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'background 0.2s ease'
              }}
            >
              <div className="d-flex align-items-center gap-2 overflow-hidden">
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: isModComplete ? '#10b981' : isExpanded ? 'var(--bs-primary)' : 'var(--border-color)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    flexShrink: 0
                  }}
                >
                  {mIdx + 1}
                </div>
                <span
                  className="small fw-semibold text-truncate"
                  style={{
                    color: isExpanded ? 'var(--bs-primary)' : 'var(--text-primary)',
                    fontSize: '0.82rem'
                  }}
                >
                  {mod.title}
                </span>
              </div>
              <div className="d-flex align-items-center gap-1.5 flex-shrink-0">
                <span className="small text-muted fw-semibold" style={{ fontSize: '0.74rem' }}>
                  {topicsDone}/{modTopics.length}
                </span>
                {isExpanded ? <FiChevronLeft size={14} /> : <FiChevronRight size={14} />}
              </div>
            </button>

            {/* Topics List inside Module */}
            {isExpanded && (
              <div className="px-2 pb-2 pt-1 border-top" style={{ borderColor: 'var(--border-color)' }}>
                {modTopics.map((top, tIdx) => {
                  const isActive = activeTopic?.id === top.id;
                  const topHasQuiz = Array.isArray(top.quizQuestions) && top.quizQuestions.length > 0;
                  const topAttempt = quizAttempts?.[top.id];
                  const topQuizPassed = Boolean(topAttempt?.passed || (topAttempt?.percentage >= 75));
                  const isDone = topHasQuiz
                    ? topQuizPassed
                    : Boolean(studentProgress[top.id] === 'completed' || studentProgress[top.id] === true);

                  return (
                    <button
                      key={top.id || tIdx}
                      type="button"
                      onClick={() => {
                        setActiveTopicId(top.id);
                        if (isMobile) {
                          setIsModuleMenuOpen(false);
                        }
                      }}
                      className={`w-100 text-start px-2.5 py-1.5 my-0.5 border-0 rounded-2 topic-item ${isActive ? 'active-topic' : ''} ${isDone ? 'completed-topic' : ''}`}
                      style={{
                        borderLeft: isActive ? '3px solid var(--bs-primary)' : '3px solid transparent',
                        background: isActive ? 'rgba(var(--bs-primary-rgb, 21, 128, 61), 0.08)' : 'transparent',
                        fontFamily: 'inherit',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between flex-grow-1 overflow-hidden">
                        <div className="d-flex align-items-center gap-2 text-truncate me-1">
                          {isDone ? (
                            <FaCheckCircle style={{ color: '#10b981', fontSize: '0.82rem', flexShrink: 0 }} />
                          ) : (
                            <FaCircle style={{ color: 'var(--border-color)', fontSize: '0.65rem', flexShrink: 0 }} />
                          )}
                          <span
                            className="small text-truncate"
                            style={{
                              fontWeight: isActive ? 700 : 500,
                              color: isActive ? 'var(--bs-primary)' : 'var(--text-primary)',
                              fontSize: '0.8rem'
                            }}
                          >
                            {top.title}
                          </span>
                        </div>

                        {/* Test status indicator */}
                        {topHasQuiz && (
                          <span
                            className={`small fw-semibold flex-shrink-0 ms-1 ${topQuizPassed ? 'text-success' : 'text-warning'
                              }`}
                            style={{ fontSize: '0.7rem' }}
                            title={topQuizPassed ? `Test Passed (${topAttempt?.score}/${topAttempt?.totalMarks})` : 'Mandatory test required'}
                          >
                            {topQuizPassed ? `✓ ${topAttempt?.score}/${topAttempt?.totalMarks}` : `Test (${top.quizQuestions.length})`}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}

                {/* Module Test CTA if linked */}
                {mod.testId && onTakeTest && (
                  <div className="p-1 mt-1 border-top" style={{ borderColor: 'var(--border-color)' }}>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => onTakeTest(mod.testId)}
                      className="w-100 d-flex align-items-center justify-content-center gap-1.5 rounded-2 py-1"
                      style={{ fontSize: '0.72rem' }}
                    >
                      <FaClipboardList size={11} />
                      <span>Take Module Test</span>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="w-100 course-preview position-relative">
      {/* ── Top Header Banner (Optional in embedded reader) ── */}
      {!hideHeaderBanner && (
        <div
          className="card border rounded-4 mb-4 shadow-sm"
          style={{
            background: 'var(--card-bg)',
            borderColor: 'var(--border-color)',
            overflow: 'hidden'
          }}
        >
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
              <div>
                <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                  <span className="clean-chip clean-chip-primary">
                    <FaBook size={11} />
                    <span>{modules.length} Modules</span>
                  </span>
                  <span className="clean-chip">
                    <FaBookOpen size={11} />
                    <span>{allTopics.length} Topics</span>
                  </span>
                  {totalCourseQuizQuestions > 0 && (
                    <span className="clean-chip clean-chip-warning">
                      <FaAward size={11} />
                      <span>{totalCourseQuizQuestions} Assessment Questions</span>
                    </span>
                  )}
                  {course.batchId && (
                    <span className="clean-chip">
                      Cohort: {course.batchId}
                    </span>
                  )}
                </div>

                <h4 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {course.title}
                </h4>
                <p className="mb-0 text-muted small" style={{ maxWidth: '820px', lineHeight: 1.5 }}>
                  {course.description || 'No course overview provided.'}
                </p>
              </div>

              {/* Action buttons */}
              <div className="d-flex align-items-center gap-2 flex-wrap">
                {isAdmin && onTogglePublish && (
                  <Button
                    variant={course.isPublished !== false ? "outline-warning" : "outline-success"}
                    size="sm"
                    onClick={() => onTogglePublish(course)}
                    className="rounded-2"
                  >
                    {course.isPublished !== false ? 'Unpublish' : 'Publish'}
                  </Button>
                )}
                {isAdmin && onEditCourse && (
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => onEditCourse(course)}
                    className="d-flex align-items-center gap-1.5 rounded-2"
                  >
                    <FaEdit size={12} />
                    <span>Edit</span>
                  </Button>
                )}
                {onExportJSON && (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => onExportJSON(course)}
                    className="d-flex align-items-center gap-1.5 rounded-2"
                    title="Download full course as JSON"
                  >
                    <FaDownload size={12} />
                    <span>Download JSON</span>
                  </Button>
                )}
                {onBack && (
                  <Button variant="secondary" size="sm" onClick={onBack} className="rounded-2">
                    Back
                  </Button>
                )}
              </div>
            </div>

            {/* Dual Student Progress Bars (Topic Completion & Assessment Marks) */}
            {!isAdmin && (
              <div className="mt-4 pt-3 border-top" style={{ borderColor: 'var(--border-color)' }}>
                <div className="row g-3">
                  {/* 1. Topics Completed Progress */}
                  <div className="col-12 col-md-6">
                    <div className="d-flex justify-content-between align-items-center mb-1.5 small">
                      <span className="fw-semibold d-flex align-items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                        <FaBook className="text-primary" size={13} />
                        <span>Curriculum Topics Completed</span>
                      </span>
                      <span className="fw-bold" style={{ color: 'var(--bs-primary)' }}>
                        {completedCount} of {allTopics.length} ({progressPercent}%)
                      </span>
                    </div>
                    <ProgressBar
                      now={progressPercent}
                      variant={progressPercent === 100 ? 'success' : 'primary'}
                      style={{ height: '8px', borderRadius: '6px', background: 'var(--bg-body)' }}
                    />
                  </div>

                  {/* 2. Assessment Marks Earned */}
                  <div className="col-12 col-md-6">
                    <div className="d-flex justify-content-between align-items-center mb-1.5 small">
                      <span className="fw-semibold d-flex align-items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                        <FaTrophy className="text-warning" size={13} />
                        <span>Assessment Marks Earned</span>
                      </span>
                      <span className="fw-bold" style={{ color: overallScorePercent >= 75 ? '#10b981' : '#f59e0b' }}>
                        {totalMarksEarned} / {totalCourseQuizQuestions} Marks ({overallScorePercent}%)
                      </span>
                    </div>
                    <ProgressBar
                      now={overallScorePercent}
                      variant={overallScorePercent >= 75 ? 'success' : 'warning'}
                      style={{ height: '8px', borderRadius: '6px', background: 'var(--bg-body)' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Slide-in Curriculum Drawer (Mobile / Small Screens) ── */}
      {isModuleMenuOpen && (
        <div
          className="curriculum-drawer-backdrop"
          onClick={() => setIsModuleMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(3px)',
            zIndex: 1050,
            display: 'flex',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div
            className="curriculum-drawer-panel shadow-lg h-100 d-flex flex-column"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '380px',
              background: 'var(--card-bg)',
              borderRight: '1px solid var(--border-color)',
              zIndex: 1060,
              animation: 'slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              overflow: 'hidden'
            }}
          >
            {/* Drawer Header with Close Button */}
            <div
              className="p-3.5 border-bottom d-flex align-items-center justify-content-between"
              style={{
                borderColor: 'var(--border-color)',
                background: 'var(--bg-body)'
              }}
            >
              <div>
                <span
                  className="fw-bold small text-uppercase"
                  style={{
                    color: 'var(--text-secondary)',
                    letterSpacing: '0.7px',
                    fontSize: '0.72rem'
                  }}
                >
                  Course Curriculum
                </span>
                <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                  {modules.length} Modules • {allTopics.length} Topics
                </div>
              </div>

              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setIsModuleMenuOpen(false)}
                className="rounded-pill d-flex align-items-center gap-1.5 px-3 py-1 shadow-sm"
                style={{ fontSize: '0.75rem', fontWeight: 600 }}
                title="Close Curriculum Drawer"
              >
                <span>✕ Close</span>
              </Button>
            </div>

            {/* Modules Accordion Content */}
            <div className="p-2.5 overflow-y-auto flex-grow-1" style={{ maxHeight: 'calc(100vh - 72px)' }}>
              {renderCurriculumAccordion(true)}
            </div>
          </div>
        </div>
      )}

      {/* ── Main Layout: 2-Column Responsive Workspace (Docked Sidebar on Desktop, Zero Overlap) ── */}
      <div className="row g-4 align-items-start">
        {/* Left Column: Docked Curriculum Sidebar (Desktop ≥ 992px) */}
        <div className="col-lg-4 col-xl-3 d-none d-lg-block">
          <div className="course-curriculum-sidebar p-3 shadow-sm mb-4">
            {/* Top row: All Courses and Switcher */}
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2.5 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
              {onBack && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={onBack}
                  className="d-flex align-items-center gap-1.5 rounded-pill px-2.5 py-1 fw-semibold border shadow-xs"
                  style={{ fontSize: '0.78rem', background: 'var(--card-bg)' }}
                  title="Return to My Courses"
                >
                  <FaArrowLeft size={11} />
                  <span>All Courses</span>
                </Button>
              )}
              {availableCourses && availableCourses.length > 1 && onSelectCourse && (
                <select
                  className="form-select form-select-sm rounded-pill px-2 py-1"
                  value={course.id}
                  onChange={(e) => onSelectCourse(e.target.value)}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    maxWidth: '140px',
                    background: 'var(--bg-body)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)'
                  }}
                  title="Switch Course"
                >
                  {availableCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Curriculum Header */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="fw-bold small text-uppercase" style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', letterSpacing: '0.6px' }}>
                  Curriculum
                </span>
                <span className="badge rounded-pill bg-light text-secondary border px-2 py-0.5" style={{ fontSize: '0.7rem' }}>
                  {modules.length} Modules • {allTopics.length} Topics
                </span>
              </div>
              {!isAdmin && (
                <ProgressBar
                  now={progressPercent}
                  variant={progressPercent === 100 ? 'success' : 'primary'}
                  style={{ height: '6px', borderRadius: '4px', background: 'var(--bg-body)' }}
                />
              )}
            </div>

            {/* Modules List */}
            {renderCurriculumAccordion(false)}
          </div>
        </div>

        {/* Right Column: Topic Reader Workspace */}
        <div className="col-12 col-lg-8 col-xl-9">

          {activeTopic ? (
            <div
              ref={contentRef}
              className="card border rounded-4 shadow-sm course-content-area"
              style={{
                background: 'var(--card-bg)',
                borderColor: 'var(--border-color)'
              }}
            >
              <div className="card-body p-4 p-md-5">
                {/* Topic Header with completion status */}
                <div className="d-flex justify-content-between align-items-start mb-4 pb-3 border-bottom flex-wrap gap-2" style={{ borderColor: 'var(--border-color)' }}>
                  <div>
                    <div className="small text-muted mb-1">
                      {currentModule?.title}
                    </div>
                    <h5 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                      {activeTopic.title}
                    </h5>

                    <div className="d-flex align-items-center gap-2 mt-2 flex-wrap">
                      {isTopicCompleted ? (
                        <span className="clean-chip clean-chip-success">
                          <FaCheckCircle size={11} />
                          <span>Topic Completed</span>
                        </span>
                      ) : (
                        <span className="clean-chip">
                          <span>In Progress</span>
                        </span>
                      )}

                      {hasQuiz && (
                        isQuizPassed ? (
                          <span className="clean-chip clean-chip-success">
                            <FaAward size={11} />
                            <span>Test Passed ({currentAttempt?.score}/{currentAttempt?.totalMarks} Marks)</span>
                          </span>
                        ) : (
                          <span className="clean-chip clean-chip-warning">
                            <FaLock size={10} />
                            <span>Assessment Required</span>
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Markdown Study Notes */}
                <div className="topic-markdown-content mb-4">
                  <SimpleMarkdown content={activeTopic.contentMd || activeTopic.content_md || activeTopic.content || ''} />
                </div>

                {/* ── Topic MCQ Assessment & Practice Questions (MANDATORY & RATED) ── */}
                {hasQuiz && (
                  <TopicQuiz
                    questions={activeQuizQuestions}
                    topicTitle={activeTopic.title}
                    topicId={activeTopic.id}
                    savedAttempt={currentAttempt}
                    isMandatory={true}
                    onSaveAttempt={(attemptData) => {
                      if (onSaveQuizAttempt) {
                        onSaveQuizAttempt(attemptData);
                      }
                      if (attemptData.passed && onMarkComplete && activeTopic.id) {
                        onMarkComplete(activeTopic.id);
                      }
                    }}
                  />
                )}

                {/* ── Navigation Bottom Bar with Mandatory Test Protection ── */}
                <div
                  className="pt-4 mt-4 border-top d-flex justify-content-between align-items-center flex-wrap gap-3"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <Button
                    variant="outline-secondary"
                    size="lg"
                    onClick={handlePrevious}
                    disabled={isFirstModule && isFirstTopicInModule}
                    className="d-flex align-items-center gap-2 rounded-3 px-4 py-2 nav-btn shadow-sm"
                    style={{
                      fontWeight: 600,
                      minWidth: '140px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <FaArrowLeft size={14} />
                    <span>Previous</span>
                  </Button>

                  <div className="text-center">
                    <div className="small text-muted mb-0.5">
                      Module {currentModuleIndex + 1} of {modules.length}
                    </div>
                    <div className="fw-bold" style={{ color: 'var(--bs-primary)', fontSize: '0.88rem' }}>
                      Topic {currentTopicIndexInModule + 1} of {currentModule?.topics?.length || 0}
                    </div>
                  </div>

                  <Button
                    variant={!isAdmin && hasQuiz && !isQuizPassed ? "outline-warning" : "primary"}
                    size="lg"
                    onClick={handleNext}
                    className="d-flex align-items-center gap-2 rounded-3 px-4 py-2 shadow-sm nav-btn"
                    style={{
                      fontWeight: 600,
                      minWidth: '160px',
                      transition: 'all 0.2s ease'
                    }}
                    title={!isAdmin && hasQuiz && !isQuizPassed ? "You must take and pass the test (Score >= 75%) before proceeding" : "Advance to next chapter"}
                  >
                    {!isAdmin && hasQuiz && !isQuizPassed ? (
                      <>
                        <FaLock size={13} />
                        <span>Pass Test to Unlock</span>
                      </>
                    ) : (
                      <>
                        <span>{isLastTopicInModule ? (isLastModule ? 'Finish Course' : 'Next Module') : 'Next Topic'}</span>
                        <FaArrowRight size={14} />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="card border rounded-4 shadow-sm p-5 text-center"
              style={{
                background: 'var(--card-bg)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-secondary)'
              }}
            >
              <FaBookOpen style={{ fontSize: '2.8rem', marginBottom: 16, color: 'var(--bs-primary)', opacity: 0.6 }} />
              <h5 className="fw-bold" style={{ color: 'var(--text-primary)' }}>
                Select a Topic
              </h5>
              <p className="small mb-0">Choose a topic from the curriculum menu to start learning and taking assessments.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
