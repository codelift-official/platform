import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaClipboardList,
  FaRedo
} from 'react-icons/fa';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

function fireConfetti() {
  try {
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, zIndex: 9999 });
  } catch {}
}

function CopyCodeButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (_) {}
  };
  return (
    <button
      type="button"
      className="btn btn-sm btn-outline-secondary py-0 px-2 rounded-pill"
      style={{ fontSize: '0.72rem' }}
      onClick={handleCopy}
      title="Copy code snippet"
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

export function renderQuizMarkdown(rawText) {
  if (!rawText || typeof rawText !== 'string') return rawText;

  // Split by fenced code blocks: ```[lang]\n...\n```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(rawText)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: rawText.slice(lastIndex, match.index) });
    }
    parts.push({
      type: 'code',
      lang: match[1] || 'python',
      content: match[2].trimEnd()
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < rawText.length) {
    parts.push({ type: 'text', content: rawText.slice(lastIndex) });
  }

  // Helper for inline markdown: `code`, **bold**, *italic*
  const renderInlineText = (text) => {
    if (!text) return null;
    const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return tokens.map((token, i) => {
      if (token.startsWith('`') && token.endsWith('`')) {
        return (
          <code key={i} className="quiz-inline-code">
            {token.slice(1, -1)}
          </code>
        );
      }
      if (token.startsWith('**') && token.endsWith('**')) {
        return <strong key={i}>{token.slice(2, -2)}</strong>;
      }
      if (token.startsWith('*') && token.endsWith('*')) {
        return <em key={i}>{token.slice(1, -1)}</em>;
      }
      return token;
    });
  };

  return (
    <div className="quiz-markdown-content">
      {parts.map((p, idx) => {
        if (p.type === 'code') {
          return (
            <div key={idx} className="quiz-code-card my-2.5 rounded-3 overflow-hidden border">
              <div className="quiz-code-header d-flex justify-content-between align-items-center px-3 py-1.5 small">
                <span className="font-monospace fw-semibold" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  {p.lang || 'code'}
                </span>
                <CopyCodeButton text={p.content} />
              </div>
              <pre className="quiz-code-pre p-3 mb-0 font-monospace">
                <code>{p.content}</code>
              </pre>
            </div>
          );
        }

        // Text part: split by lines
        const lines = p.content.split('\n');
        return (
          <div key={idx}>
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {renderInlineText(line)}
                {lIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export default function TopicQuiz({
  questions = [],
  topicTitle = '',
  topicId = '',
  savedAttempt = null,
  onSaveAttempt,
  isMandatory = false
}) {
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
    const correctVal = q.correct !== undefined ? q.correct : q.correctIndex;
    if (selectedAnswers[idx] === correctVal) correctCount++;
  });

  const percentage = Math.round((correctCount / questions.length) * 100);
  const isPassed = correctCount === questions.length;

  const getRating = (pct) => {
    if (pct === 100) return 'Grade A+ (Perfect)';
    return 'Retake Required';
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (answeredCount < questions.length) {
      const err = `Please answer all ${questions.length} questions before submitting (Answered ${answeredCount} of ${questions.length}).`;
      setValidationError(err);
      toast.error('Please answer all questions before submitting.');
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

    if (isPassed) {
      fireConfetti();
      toast.success(`Score: ${correctCount}/${questions.length} - Quiz Passed!`);
    } else {
      toast.error(`Score: ${correctCount}/${questions.length}. Please review and retake.`);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setValidationError('');
  };

  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div id="topic-assessment-section" className="card border rounded-4 shadow-sm mb-4 overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
      {/* Header */}
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
              <h6 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>Topic MCQ Assessment & Quiz</h6>
            </div>
            <span className="small text-muted">{questions.length} question{questions.length !== 1 ? 's' : ''} · 1 mark each</span>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          {isSubmitted ? (
            <span className={`badge rounded-pill px-3 py-1.5 ${isPassed ? 'bg-success text-white' : 'bg-danger text-white'}`}>
              {isPassed ? 'Passed' : 'Failed'}: {correctCount}/{questions.length}
            </span>
          ) : (
            <span className="badge bg-secondary bg-opacity-10 text-secondary border rounded-pill px-3 py-1.5">
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

        {/* Result banner */}
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
                  {isPassed ? 'Assessment Passed' : 'Assessment Incomplete'}
                </div>
                <div className="small">
                  Marks: <strong>{correctCount} / {questions.length}</strong>
                  {!isPassed && ' · Retake required to complete this topic'}
                </div>
              </div>
            </div>
            <button type="button" onClick={handleRetake} className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5 rounded-2 shadow-sm">
              <FaRedo size={12} />
              <span>Retake Quiz</span>
            </button>
          </div>
        )}

        {/* Question Cards */}
        <div className="d-flex flex-column gap-4">
          {questions.map((q, qIdx) => {
            const userSelectedOpt = selectedAnswers[qIdx];
            const isAnswered = userSelectedOpt !== undefined;
            const correctVal = q.correct !== undefined ? q.correct : q.correctIndex;
            const isCorrect = userSelectedOpt === correctVal;
            const isMissing = !isAnswered && validationError;

            return (
              <div
                key={q.id || qIdx}
                className="p-3.5 p-md-4 rounded-4 border"
                style={{
                  background: 'var(--bg-body)',
                  borderColor: isMissing ? '#ef4444' : 'var(--border-color)',
                  boxShadow: isMissing ? '0 0 0 1px #ef4444' : 'none'
                }}
              >
                {/* Question Header */}
                <div className="d-flex justify-content-between align-items-start gap-3 mb-3 pb-2 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="d-flex align-items-start gap-2.5 flex-grow-1">
                    <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-1 font-monospace" style={{ fontSize: '0.8rem' }}>
                      Q{qIdx + 1}
                    </span>
                    <div className="fw-semibold text-break flex-grow-1" style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      {renderQuizMarkdown(q.question || q.text)}
                    </div>
                  </div>
                  {isSubmitted && (
                    <span className={`badge rounded-pill px-2.5 py-1 ${isCorrect ? 'bg-success text-white' : 'bg-danger text-white'} flex-shrink-0`}>
                      {isCorrect ? '✓ 1 Mark' : '✗ 0 Marks'}
                    </span>
                  )}
                </div>

                {/* Option Choices */}
                <div className="d-flex flex-column gap-2 mt-2">
                  {q.options?.map((opt, optIdx) => {
                    const isSelected = userSelectedOpt === optIdx;
                    const isOptionCorrect = optIdx === correctVal;
                    const optText = typeof opt === 'string' ? opt : (opt.text || opt.label || JSON.stringify(opt));

                    let optStyle = {
                      background: 'var(--card-bg)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    };

                    if (isSelected && !isSubmitted) {
                      optStyle = {
                        background: 'rgba(var(--bs-primary-rgb), 0.08)',
                        borderColor: 'var(--bs-primary)',
                        color: 'var(--bs-primary)',
                        fontWeight: 600
                      };
                    }

                    if (isSubmitted) {
                      if (isOptionCorrect) {
                        optStyle = {
                          background: 'rgba(var(--bs-success-rgb, 22, 163, 74), 0.15)',
                          borderColor: 'var(--bs-success, #16a34a)',
                          color: 'var(--bs-success, #16a34a)',
                          fontWeight: 700
                        };
                      } else if (isSelected && !isOptionCorrect) {
                        optStyle = {
                          background: 'rgba(var(--bs-danger-rgb, 220, 38, 38), 0.15)',
                          borderColor: 'var(--bs-danger, #dc2626)',
                          color: 'var(--bs-danger, #dc2626)',
                          fontWeight: 600
                        };
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        disabled={isSubmitted}
                        onClick={() => {
                          setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
                          if (validationError) setValidationError('');
                        }}
                        className="btn text-start p-2.5 p-md-3 rounded-3 border d-flex align-items-center gap-2.5 transition-all w-100"
                        style={optStyle}
                      >
                        <span
                          className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0 font-monospace fw-bold"
                          style={{
                            width: 26,
                            height: 26,
                            fontSize: '0.78rem',
                            background: isSelected ? 'var(--bs-primary)' : 'var(--bg-body)',
                            color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                            border: '1px solid var(--border-color)'
                          }}
                        >
                          {LETTERS[optIdx] || optIdx + 1}
                        </span>
                        <span className="small flex-grow-1 text-break">{renderQuizMarkdown(optText)}</span>
                        {isSubmitted && isOptionCorrect && (
                          <FaCheckCircle className="text-success ms-auto flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation if submitted */}
                {isSubmitted && q.explanation && (
                  <div className="mt-3 p-2.5 rounded-3 border small" style={{ background: 'var(--card-bg-alt, rgba(0,0,0,0.02))', color: 'var(--text-secondary)' }}>
                    <strong className="d-block mb-1">💡 Explanation:</strong>
                    {renderQuizMarkdown(q.explanation)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        {!isSubmitted && (
          <div className="mt-4 pt-3 border-top d-flex justify-content-end" style={{ borderColor: 'var(--border-color)' }}>
            <Button
              variant="primary"
              onClick={handleSubmit}
              className="d-flex align-items-center gap-2 px-4 py-2 rounded-3 fw-bold shadow-sm"
            >
              <FaCheckCircle size={15} />
              <span>Submit & Check Score</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
