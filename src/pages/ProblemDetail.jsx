import React, { useState, useEffect, useRef, useMemo, Fragment } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { SEED_PROBLEMS } from '../data/problemsSeed';
import { getProblemDetails } from '../data/problemSolutions';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/common/Navbar';
import SEO from '../components/common/SEO';
import CodeEditor from '../components/common/CodeEditor';
import { runCode, warmupPyodide, isPythonCategory } from '../utils/codeRunner';
import {
  FaPlay,
  FaCheckCircle,
  FaTimesCircle,
  FaLightbulb,
  FaArrowLeft,
  FaCode,
  FaTerminal,
  FaFire,
  FaSpinner,
  FaExclamationTriangle,
  FaLock,
  FaUnlock,
  FaCopy,
  FaCheck,
  FaBookOpen,
  FaChevronRight,
  FaChevronLeft,
  FaChevronDown,
  FaRocket,
  FaColumns,
  FaTextWidth,
} from 'react-icons/fa';
import '../styles/ProblemArena.css';

// Legacy arena-qN codes map to the canonical problem at position N of the seed,
// so old links and saved attempts keep resolving after every reorder.
const LEGACY_ARENA_MAP = {
  'arena-q1': 'prob-hello-world',
  ...Object.fromEntries(
    SEED_PROBLEMS.map((problem, index) => [`arena-q${index + 1}`, problem.id])
  )
};

// Renders `` `inline code` `` segments in problem descriptions as styled chips
// instead of leaking raw backticks into the question text.
function renderInlineCode(text) {
  if (!text) return text;
  const parts = String(text).split(/(`[^`]+`)/g);
  if (parts.length === 1) return text;
  return parts.map((part, index) =>
    part.length > 2 && part.startsWith('`') && part.endsWith('`')
      ? (
        <code key={index} className="cl-inline-code">
          {part.slice(1, -1)}
        </code>
      )
      : <Fragment key={index}>{part}</Fragment>
  );
}

export default function ProblemDetail() {
  const { id, problemId } = useParams();
  const currentId = id || problemId;
  const location = useLocation();
  const isStudentRoute = location.pathname.startsWith('/student');
  const arenaHomeUrl = isStudentRoute ? '/student/arena' : '/problems';
  const getProblemUrl = (probId) => (isStudentRoute ? `/student/arena/${probId}` : `/problems/${probId}`);

  const { currentUser, auth } = useAuth();
  const studentId = auth?.studentId || currentUser?.id || auth?.user?.id || (currentUser?.role === 'student' ? currentUser?.id : null);
  const isStudent = isStudentRoute || auth?.role === 'student' || currentUser?.role === 'student' || Boolean(studentId);

  const {
    codingProblems = [],
    codingAttempts = [],
    problemAttempts = [],
    recordProblemAttempt,
    submitCodingAttempt
  } = useData();

  const activeProblemList = useMemo(() => {
    return (codingProblems && codingProblems.length > 0) ? codingProblems : SEED_PROBLEMS;
  }, [codingProblems]);

  // Canonical ID resolution: smoothly map legacy arena-q* to high-quality SEED_PROBLEMS
  const canonicalId = useMemo(() => {
    if (!currentId) return 'prob-hello-world';
    if (LEGACY_ARENA_MAP[currentId]) return LEGACY_ARENA_MAP[currentId];
    if (currentId.startsWith('arena-q')) {
      const num = parseInt(currentId.replace('arena-q', ''), 10);
      if (!isNaN(num) && num > 0 && num <= SEED_PROBLEMS.length) {
        return SEED_PROBLEMS[num - 1].id;
      }
      return 'prob-hello-world';
    }
    return currentId;
  }, [currentId]);

  const problem = useMemo(() => {
    return (
      activeProblemList.find((p) => p.id === canonicalId) ||
      SEED_PROBLEMS.find((p) => p.id === canonicalId) ||
      activeProblemList.find((p) => p.id === currentId) ||
      SEED_PROBLEMS.find((p) => p.id === currentId) ||
      activeProblemList[0] ||
      SEED_PROBLEMS[0]
    );
  }, [activeProblemList, canonicalId, currentId]);

  const currentIndex = activeProblemList.findIndex((p) => p?.id === problem?.id);
  const prevProblem = currentIndex > 0 ? activeProblemList[currentIndex - 1] : null;
  const nextProblem =
    currentIndex >= 0 && currentIndex < activeProblemList.length - 1
      ? activeProblemList[currentIndex + 1]
      : null;

  // Enrich with LeetCode-tier detailed specification, structured examples & editorial
  const detail = useMemo(() => (problem ? getProblemDetails(problem) : null), [problem]);

  // Initial code resolution: student-specific saved code or attempts -> guest storage -> starterCode
  const getStoredCode = (prob) => {
    if (!prob) return '';
    try {
      if (studentId) {
        const studentCode =
          localStorage.getItem(`codelift_student_code_${studentId}_${prob.id}`) ||
          (currentId && localStorage.getItem(`codelift_student_code_${studentId}_${currentId}`));
        if (studentCode) return studentCode;

        const attempt =
          (codingAttempts || []).find((a) => (a.studentId === studentId || a.studentId === auth?.email) && (a.problemId === prob.id || a.problemId === currentId)) ||
          (problemAttempts || []).find((a) => (a.studentId === studentId || a.studentId === auth?.email) && (a.problemId === prob.id || a.problemId === currentId));
        if (attempt?.code || attempt?.codeSubmitted) {
          return attempt.code || attempt.codeSubmitted;
        }
      }
      const guestCode =
        localStorage.getItem(`codelift_guest_code_${prob.id}`) ||
        (currentId && localStorage.getItem(`codelift_guest_code_${currentId}`));
      if (guestCode) return guestCode;
    } catch (_) {}
    return prob.starterCode || '';
  };

  const [code, setCode] = useState(() => getStoredCode(problem));
  const [activeTab, setActiveTab] = useState('description'); // 'description' | 'solution' | 'hints' | 'tests'
  const [revealedSolution, setRevealedSolution] = useState(false);
  const [revealedHints, setRevealedHints] = useState({});
  const [solutionCopied, setSolutionCopied] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [executionMode, setExecutionMode] = useState(null);
  const [pyodideStatus, setPyodideStatus] = useState('idle'); // 'idle' | 'loading' | 'ready' | 'error'
  const pyodideToastRef = useRef(null);
  const editorRef = useRef(null);
  const [arenaView, setArenaView] = useState('split'); // 'split' | 'read' | 'code' (mobile focus modes)
  const [wrapEnabled, setWrapEnabled] = useState(false);

  // When a new problem loads, always start scrolled to the top of the page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentId]);

  // Update code and reset tabs when problem or student changes
  useEffect(() => {
    if (problem) {
      setCode(getStoredCode(problem));
      setTestResults(null);
      setExecutionMode(null);
      setRevealedSolution(false);
      setRevealedHints({});
      setActiveTab('description');
      setArenaView('split');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (problem && !id) {
      setCode(getStoredCode(problem));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId, studentId]);

  // Handle user code edit with differentiated student vs guest persistence
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    try {
      if (studentId) {
        localStorage.setItem(`codelift_student_code_${studentId}_${problem.id}`, newCode);
        if (currentId && currentId !== problem.id) {
          localStorage.setItem(`codelift_student_code_${studentId}_${currentId}`, newCode);
        }
      } else {
        localStorage.setItem(`codelift_guest_code_${problem.id}`, newCode);
        if (currentId && currentId !== problem.id) {
          localStorage.setItem(`codelift_guest_code_${currentId}`, newCode);
        }
      }
    } catch (_) {}
  };

  // Reset to starter code handler
  const resetCode = () => {
    if (!problem) return;
    try {
      if (studentId) {
        localStorage.removeItem(`codelift_student_code_${studentId}_${problem.id}`);
        if (currentId) localStorage.removeItem(`codelift_student_code_${studentId}_${currentId}`);
      }
      localStorage.removeItem(`codelift_guest_code_${problem.id}`);
      if (currentId) localStorage.removeItem(`codelift_guest_code_${currentId}`);
    } catch (_) {}
    setCode(problem.starterCode || '');
    setTestResults(null);
    toast.success('Code reset to starter template.', { duration: 1500 });
  };

  // Warm up Pyodide in background when page loads (Python problems)
  useEffect(() => {
    if (problem && isPythonCategory(problem.category)) {
      setPyodideStatus('loading');
      warmupPyodide();
      const probe = setInterval(() => {
        if (window.__pyodideLoaded) {
          setPyodideStatus('ready');
          clearInterval(probe);
        }
      }, 800);
      setTimeout(() => clearInterval(probe), 30000);
    }
  }, [problem]);

  // Keyboard shortcut: Ctrl+Enter to Run Solution
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isRunning) runSolution();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, isRunning]);

  if (!problem || !detail) {
    return (
      <div className="cl-arena-page">
        <Navbar />
        <div className="container text-center py-5">
          <h3 className="fw-bold mb-3">Problem Challenge Not Found</h3>
          <p className="text-secondary mb-4">
            The challenge you requested does not exist or may have been updated.
          </p>
          <Link to="/problems" className="btn btn-success rounded-pill px-4 fw-bold">
            Back to Problems Arena
          </Link>
        </div>
      </div>
    );
  }

  // ── Real Code Execution ──────────────────────────────────────────────────
  const runSolution = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setTestResults(null);

    if (isPythonCategory(problem.category) && pyodideStatus !== 'ready') {
      pyodideToastRef.current = toast.loading('Starting Python runtime…', {
        id: 'pyodide-load',
        duration: Infinity,
      });
    }

    try {
      const { results, executionMode: mode } = await runCode(
        code,
        problem.testCases,
        problem.category
      );

      toast.dismiss('pyodide-load');
      if (pyodideToastRef.current) pyodideToastRef.current = null;

      setTestResults(results);
      setExecutionMode(mode);
      setPyodideStatus('ready');

      const allPassed = results.every((r) => r.passed);
      const passCount = results.filter((r) => r.passed).length;

      if (allPassed) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.65 }
          });
        } catch (_) {}

        if (isStudent && studentId) {
          try {
            localStorage.setItem(`codelift_student_code_${studentId}_${problem.id}`, code);
            if (currentId) localStorage.setItem(`codelift_student_code_${studentId}_${currentId}`, code);
          } catch (_) {}

          if (recordProblemAttempt) {
            recordProblemAttempt({
              studentId,
              problemId: problem.id,
              codeSubmitted: code,
              passed: true,
              score: problem.xp || 50,
              testResults: results,
              hintsUsed: Object.keys(revealedHints).length,
            });
            if (currentId && currentId !== problem.id) {
              recordProblemAttempt({
                studentId,
                problemId: currentId,
                codeSubmitted: code,
                passed: true,
                score: problem.xp || 50,
                testResults: results,
                hintsUsed: Object.keys(revealedHints).length,
              });
            }
          }
          if (submitCodingAttempt) {
            submitCodingAttempt({
              studentId,
              problemId: problem.id,
              code,
              visibleResults: results,
              passed: true,
              xpEarned: problem.xp || 50
            });
            if (currentId && currentId !== problem.id) {
              submitCodingAttempt({
                studentId,
                problemId: currentId,
                code,
                visibleResults: results,
                passed: true,
                xpEarned: problem.xp || 50
              });
            }
          }
          toast.success(`🎉 All ${results.length} test cases passed! +${problem.xp || 50} XP saved to your profile!`, {
            duration: 4000,
          });
        } else {
          // Guest user: save ONLY in client-side storage, no server/database calls
          try {
            const cached = localStorage.getItem('codelift_guest_solved_problems');
            const list = cached ? JSON.parse(cached) : [];
            if (!list.includes(problem.id)) {
              list.push(problem.id);
            }
            if (currentId && !list.includes(currentId)) {
              list.push(currentId);
            }
            localStorage.setItem('codelift_guest_solved_problems', JSON.stringify(list));
            localStorage.setItem(`codelift_guest_code_${problem.id}`, code);
            if (currentId) localStorage.setItem(`codelift_guest_code_${currentId}`, code);
          } catch (_) {}

          toast.success(`🎉 All ${results.length} test cases passed! (Guest session saved locally in browser)`, {
            duration: 4500,
          });
        }
      } else {
        if (isStudent && studentId) {
          if (recordProblemAttempt) {
            recordProblemAttempt({
              studentId,
              problemId: problem.id,
              codeSubmitted: code,
              passed: false,
              score: 0,
              testResults: results,
              hintsUsed: Object.keys(revealedHints).length,
            });
          }
          if (submitCodingAttempt) {
            submitCodingAttempt({
              studentId,
              problemId: problem.id,
              code,
              visibleResults: results,
              passed: false,
              xpEarned: 0
            });
          }
        }
        toast.error(`${passCount}/${results.length} passed — review your output below.`, {
          duration: 3000,
        });
      }
    } catch (err) {
      toast.dismiss('pyodide-load');
      setPyodideStatus('error');
      toast.error('Execution error — check console for details.');
      console.error('[CodeArena] Execution error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const loadSolutionIntoEditor = () => {
    if (detail?.editorial?.solutionCode) {
      handleCodeChange(detail.editorial.solutionCode);
      toast.success('Official solution loaded into editor! You can now run or edit it.', {
        icon: '⚡',
        duration: 3000,
      });
    }
  };

  const copySolutionToClipboard = () => {
    if (detail?.editorial?.solutionCode) {
      navigator.clipboard.writeText(detail.editorial.solutionCode);
      setSolutionCopied(true);
      toast.success('Solution copied to clipboard!');
      setTimeout(() => setSolutionCopied(false), 2000);
    }
  };

  const toggleHint = (idx) => {
    setRevealedHints((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const getDifficultyClass = (diff) => {
    if (diff === 'Easy') return 'easy';
    if (diff === 'Medium') return 'medium';
    return 'hard';
  };

  const getLanguageFromCategory = () => 'python';
  const language = 'python';

  // Compute solved status for current student or guest
  const isProblemSolved = useMemo(() => {
    if (isStudent && studentId) {
      const inCoding = (codingAttempts || []).some(
        (a) => (a.studentId === studentId || a.studentId === auth?.email) && (a.problemId === problem?.id || a.problemId === currentId) && a.passed
      );
      const inProblem = (problemAttempts || []).some(
        (a) => (a.studentId === studentId || a.studentId === auth?.email) && (a.problemId === problem?.id || a.problemId === currentId) && a.passed
      );
      return inCoding || inProblem;
    }
    try {
      const cached = localStorage.getItem('codelift_guest_solved_problems');
      const list = cached ? JSON.parse(cached) : [];
      return list.includes(problem?.id) || (currentId && list.includes(currentId));
    } catch (_) {
      return false;
    }
  }, [isStudent, studentId, codingAttempts, problemAttempts, problem?.id, currentId, auth?.email]);

  return (
    <div className={`cl-arena-page ${isStudentRoute ? 'cl-arena-student-embedded' : ''}`}>
      <SEO
        title={`${problem.title} — Problem Solving Arena`}
        description={detail.description || problem.description}
      />
      {!isStudentRoute && <Navbar />}

      <main className="container-fluid max-w-7xl py-4 px-3 px-md-4">
        {/* Navigation Breadcrumb & Controls */}
        <div className="cl-arena-topbar d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Link
              to={arenaHomeUrl}
              className="cl-back-link"
              title="Back to Code Arena"
            >
              <FaArrowLeft /> Code Arena
            </Link>

            {/* Prev / Next navigation */}
            <div className="d-flex align-items-center gap-1">
              <Link
                to={prevProblem ? getProblemUrl(prevProblem.id) : '#'}
                className={`cl-problem-nav-link ${!prevProblem ? 'disabled' : ''}`}
                title={prevProblem ? `Previous: ${prevProblem.title}` : 'First problem'}
              >
                <FaChevronLeft size={10} /> Prev
              </Link>
              <span className="cl-count-pill font-monospace" title={`Problem ${currentIndex + 1} of ${activeProblemList.length}`}>
                {currentIndex + 1} / {activeProblemList.length}
              </span>
              <Link
                to={nextProblem ? getProblemUrl(nextProblem.id) : '#'}
                className={`cl-problem-nav-link ${!nextProblem ? 'disabled' : ''}`}
                title={nextProblem ? `Next: ${nextProblem.title}` : 'Last problem'}
              >
                Next <FaChevronRight size={10} />
              </Link>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap cl-arena-topbar-pills">
            <span className="cl-problem-category-tag">{problem.category}</span>
            <span className={`cl-diff-badge ${getDifficultyClass(problem.difficulty)}`}>
              {problem.difficulty}
            </span>
            <span className="cl-xp-pill">
              <FaFire size={11} /> +{problem.xp} XP
            </span>
            {isProblemSolved && (
              <span
                className="cl-solved-pill"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#10b981',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '9999px'
                }}
              >
                <FaCheckCircle size={12} /> Solved
              </span>
            )}

            {/* Pyodide status indicator */}
            {isPythonCategory(problem.category) && (
              <span
                className={`cl-runtime-badge ${
                  pyodideStatus === 'ready'
                    ? 'ready'
                    : pyodideStatus === 'error'
                    ? 'error'
                    : 'loading'
                }`}
                title={
                  pyodideStatus === 'ready'
                    ? 'Python runtime ready'
                    : pyodideStatus === 'error'
                    ? 'Python runtime failed to load'
                    : 'Loading Python runtime…'
                }
              >
                {pyodideStatus === 'ready' ? (
                  '🐍 Python Ready'
                ) : pyodideStatus === 'error' ? (
                  '⚠ Runtime Error'
                ) : (
                  <>
                    <FaSpinner className="cl-spin-icon" size={10} /> Loading Python…
                  </>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Mobile Arena View Switcher — hide question or go full-screen IDE */}
        <div className="arena-mobile-switch-wrap d-lg-none">
          <div className="arena-mobile-mode-switcher" role="group" aria-label="Arena view mode">
            <button
              type="button"
              className={`arena-mobile-mode-btn ${arenaView === 'split' ? 'active' : ''}`}
              onClick={() => setArenaView('split')}
              title="Split view: question + editor"
            >
              <FaColumns size={11} /> Split
            </button>
            <button
              type="button"
              className={`arena-mobile-mode-btn ${arenaView === 'read' ? 'active' : ''}`}
              onClick={() => setArenaView('read')}
              title="Focus on the question text only"
            >
              <FaBookOpen size={11} /> Question
            </button>
            <button
              type="button"
              className={`arena-mobile-mode-btn ${arenaView === 'code' ? 'active' : ''}`}
              onClick={() => setArenaView('code')}
              title="Full-screen coding editor"
            >
              <FaCode size={11} /> Code
            </button>
          </div>
        </div>

        {/* Mobile quick-symbol bar while in full-screen code mode */}
        {arenaView === 'code' && (
          <div className="arena-mobile-quickbar d-lg-none" aria-label="Quick code symbols">
            {['(', ')', '[', ']', '{', '}', '=', '==', '!=', ':', ',', "'", '"', '_'].map((key) => (
              <button
                key={key}
                type="button"
                className="arena-mobile-quick-key"
                onClick={() => editorRef.current?.insert(key)}
                aria-label={`Insert ${key}`}
              >
                {key}
              </button>
            ))}
          </div>
        )}

        <div className="row g-4 align-items-start">
          {/* ── Left Panel: Problem Statement, Solution, Hints & Tests ── */}
          <div className={`col-lg-5 cl-arena-left-col ${arenaView === 'code' ? 'd-none d-lg-block' : ''}`}>
            <div className="cl-arena-filters-card cl-arena-detail-card d-flex flex-column mb-0">
              {/* Tab Navigation Header */}
              <div className="cl-arena-tabs-header">
                <button
                  type="button"
                  id="tab-btn-description"
                  className={`cl-arena-tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                  onClick={() => setActiveTab('description')}
                >
                  <FaBookOpen size={13} /> Description
                </button>
                <button
                  type="button"
                  id="tab-btn-solution"
                  className={`cl-arena-tab-btn ${activeTab === 'solution' ? 'active' : ''}`}
                  onClick={() => setActiveTab('solution')}
                >
                  {revealedSolution ? <FaUnlock size={13} className="text-warning" /> : <FaLock size={12} />}
                  Editorial &amp; Solution
                  {revealedSolution && (
                    <span className="cl-tab-badge bg-warning text-dark">Unlocked</span>
                  )}
                </button>
                <button
                  type="button"
                  id="tab-btn-hints"
                  className={`cl-arena-tab-btn ${activeTab === 'hints' ? 'active' : ''}`}
                  onClick={() => setActiveTab('hints')}
                >
                  <FaLightbulb size={13} /> Hints ({detail.hints?.length || 0})
                </button>
                <button
                  type="button"
                  id="tab-btn-tests"
                  className={`cl-arena-tab-btn ${activeTab === 'tests' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tests')}
                >
                  <FaTerminal size={12} /> Test Cases
                  {testResults && (
                    <span
                      className={`cl-tab-badge ${
                        testResults.every((r) => r.passed) ? 'bg-success text-white' : 'bg-danger text-white'
                      }`}
                    >
                      {testResults.filter((r) => r.passed).length}/{testResults.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Scrollable Tab Content Container */}
              <div className="cl-arena-tab-scroll-pane">
                {/* Tab 1: Description Panel */}
                {activeTab === 'description' && (
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
                    <h3
                      className="fw-extrabold mb-0"
                      style={{ color: 'var(--text-primary)', letterSpacing: '-0.3px' }}
                    >
                      {detail.title}
                    </h3>
                  </div>

                  {/* Topic Tags */}
                  {detail.tags && detail.tags.length > 0 && (
                    <div className="d-flex flex-wrap gap-1 mb-3">
                      {detail.tags.map((tag, idx) => (
                        <span key={idx} className="cl-tag-pill">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Narrative Description */}
                  <p
                    className="text-secondary mb-4"
                    style={{ lineHeight: '1.75', fontSize: '0.95rem' }}
                  >
                    {renderInlineCode(detail.description)}
                  </p>

                  {/* Input / Output Format Specifications */}
                  {detail.inputFormat && (
                    <div className="cl-spec-box">
                      <div className="cl-spec-label">Input Format</div>
                      <div style={{ color: 'var(--text-primary)' }}>{detail.inputFormat}</div>
                    </div>
                  )}

                  {detail.outputFormat && (
                    <div className="cl-spec-box">
                      <div className="cl-spec-label">Output Format</div>
                      <div style={{ color: 'var(--text-primary)' }}>{detail.outputFormat}</div>
                    </div>
                  )}

                  {/* Structured Examples with Step-by-Step Explanations */}
                  <h6
                    className="fw-bold mb-3 d-flex align-items-center gap-2 mt-4"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <FaCode size={13} className="text-success" /> Examples &amp; Detailed Walkthrough:
                  </h6>

                  <div className="mb-4">
                    {(detail.examples || []).map((ex, idx) => (
                      <div key={idx} className="cl-example-card">
                        <div className="cl-example-title">
                          <span>Example {idx + 1}</span>
                        </div>
                        <div className="cl-example-io-row">
                          <span className="cl-example-io-label in">Input:</span>
                          <span className="cl-example-io-val">{ex.input}</span>
                        </div>
                        <div className="cl-example-io-row">
                          <span className="cl-example-io-label out">Output:</span>
                          <span className="cl-example-io-val text-success">{ex.output}</span>
                        </div>
                        {ex.explanation && (
                          <div className="cl-example-explanation">
                            <div className="cl-example-explanation-title">Explanation</div>
                            <div>{renderInlineCode(ex.explanation)}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Algorithmic Constraints */}
                  {detail.constraints && detail.constraints.length > 0 && (
                    <>
                      <h6
                        className="fw-bold mb-2 d-flex align-items-center gap-2"
                        style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}
                      >
                        Constraints:
                      </h6>
                      <div className="cl-constraints-box">
                        <ul className="cl-constraints-list">
                          {detail.constraints.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Tab 2: Editorial & Official Solution Panel */}
              {activeTab === 'solution' && (
                <div className="flex-grow-1">
                  {!revealedSolution ? (
                    <div className="cl-solution-gate-card">
                      <div className="cl-solution-gate-icon">
                        <FaLock />
                      </div>
                      <h4 className="cl-solution-gate-title">Official Editorial &amp; Solution</h4>
                      <p className="cl-solution-gate-desc">
                        Problem-solving skills grow strongest when you brainstorm and test your own
                        approach first! If you are stuck or want to inspect the optimal reference
                        implementation, unlock the solution below.
                      </p>
                      <button
                        type="button"
                        id="cl-unlock-solution-btn"
                        className="btn btn-success rounded-pill px-4 py-2 fw-bold d-inline-flex align-items-center gap-2"
                        onClick={() => setRevealedSolution(true)}
                      >
                        <FaUnlock size={13} /> Unlock Official Solution
                      </button>
                    </div>
                  ) : (
                    <div className="cl-solution-unlocked-card">
                      <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-secondary border-opacity-25">
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-3 py-2 fw-bold rounded-pill">
                            ✓ Solution Unlocked
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1"
                          onClick={() => setRevealedSolution(false)}
                          title="Hide solution to practice clean"
                        >
                          <FaLock size={10} className="me-1" /> Re-lock
                        </button>
                      </div>

                      {/* Intuition & Approach */}
                      {detail.editorial?.intuition && (
                        <div className="cl-editorial-section">
                          <h6 className="cl-editorial-heading">
                            <FaLightbulb className="text-warning" /> Approach &amp; Intuition
                          </h6>
                          <div className="cl-editorial-prose">{detail.editorial.intuition}</div>
                        </div>
                      )}

                      {/* Step-by-step Algorithm */}
                      {detail.editorial?.algorithm && detail.editorial.algorithm.length > 0 && (
                        <div className="cl-editorial-section">
                          <h6 className="cl-editorial-heading">
                            <FaRocket className="text-primary" /> Step-by-Step Algorithm
                          </h6>
                          <div className="d-flex flex-column gap-1">
                            {detail.editorial.algorithm.map((step, idx) => (
                              <div key={idx} className="cl-algorithm-step-item">
                                {step}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Complexity Analysis Cards */}
                      <div className="cl-editorial-section">
                        <h6 className="cl-editorial-heading">Complexity Analysis</h6>
                        <div className="cl-complexity-grid">
                          <div className="cl-complexity-card">
                            <div className="cl-complexity-header">Time Complexity</div>
                            <div className="cl-complexity-val">
                              {detail.editorial?.timeComplexity || 'O(N)'}
                            </div>
                            <div className="cl-complexity-desc">
                              {detail.editorial?.complexityExplanation ||
                                'Optimal single-pass or bounded operational complexity.'}
                            </div>
                          </div>

                          <div className="cl-complexity-card">
                            <div className="cl-complexity-header">Space Complexity</div>
                            <div className="cl-complexity-val">
                              {detail.editorial?.spaceComplexity || 'O(1)'}
                            </div>
                            <div className="cl-complexity-desc">
                              Auxiliary memory allocated during execution.
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Reference Model Solution Code */}
                      <div className="cl-editorial-section">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <h6 className="cl-editorial-heading mb-0">
                            <FaCode className="text-success" /> Reference Solution
                          </h6>
                          <div className="d-flex align-items-center gap-2">
                            <button
                              type="button"
                              id="cl-copy-solution-btn"
                              className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-bold d-inline-flex align-items-center gap-1"
                              onClick={copySolutionToClipboard}
                              title="Copy code to clipboard"
                            >
                              {solutionCopied ? (
                                <>
                                  <FaCheck size={11} className="text-success" /> Copied!
                                </>
                              ) : (
                                <>
                                  <FaCopy size={11} /> Copy Code
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              id="cl-load-solution-btn"
                              className="btn btn-success btn-sm rounded-pill px-3 fw-bold d-inline-flex align-items-center gap-1"
                              onClick={loadSolutionIntoEditor}
                              title="Load official solution directly into the interactive editor"
                            >
                              ⚡ Load into Editor
                            </button>
                          </div>
                        </div>

                        <div className="cl-model-code-box">
                          <div className="cl-model-code-header">
                            <span className="font-monospace small text-secondary">
                              solution.{language === 'sql' ? 'sql' : language === 'javascript' ? 'js' : 'py'}
                            </span>
                            <span className="badge bg-dark text-secondary border border-secondary border-opacity-25 font-monospace">
                              Optimal
                            </span>
                          </div>
                          <pre className="cl-model-code-content">
                            {detail.editorial?.solutionCode || problem.starterCode}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Progressive Hints Panel */}
              {activeTab === 'hints' && (
                <div className="flex-grow-1">
                  <div className="mb-3">
                    <h6 className="fw-bold" style={{ color: 'var(--text-primary)' }}>
                      Progressive Problem Hints
                    </h6>
                    <p className="text-secondary small">
                      Need a push in the right direction? Reveal hints incrementally to keep your
                      mental momentum going without spoiling the solution.
                    </p>
                  </div>

                  <div className="d-flex flex-column gap-2">
                    {(detail.hints || []).map((hint, idx) => {
                      const isRevealed = !!revealedHints[idx];
                      return (
                        <div key={idx} className="cl-progressive-hint-card">
                          <button
                            type="button"
                            className="cl-progressive-hint-trigger"
                            onClick={() => toggleHint(idx)}
                          >
                            <span className="d-flex align-items-center gap-2">
                              <FaLightbulb
                                className={isRevealed ? 'text-warning' : 'text-secondary'}
                                size={13}
                              />
                              <span>Hint {idx + 1}</span>
                            </span>
                            <span className="text-secondary small d-flex align-items-center gap-1">
                              {isRevealed ? 'Hide' : 'Reveal'}
                              <FaChevronDown
                                size={10}
                                style={{
                                  transform: isRevealed ? 'rotate(180deg)' : 'rotate(0deg)',
                                  transition: 'transform 0.2s ease',
                                }}
                              />
                            </span>
                          </button>
                          {isRevealed && (
                            <div className="cl-progressive-hint-body">
                              {renderInlineCode(hint)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 4: Test Cases & Execution Results Panel */}
              {activeTab === 'tests' && (
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h6 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>
                      Verification Test Cases
                    </h6>
                    {testResults && (
                      <span
                        className={`badge rounded-pill fw-bold px-3 py-1 ${
                          testResults.every((r) => r.passed)
                            ? 'bg-success'
                            : testResults.some((r) => r.passed)
                            ? 'bg-warning text-dark'
                            : 'bg-danger'
                        }`}
                      >
                        {testResults.filter((r) => r.passed).length} / {testResults.length} Passed
                      </span>
                    )}
                  </div>

                  {testResults ? (
                    <div className="d-flex flex-column gap-2">
                      {testResults.map((res, idx) => (
                        <div
                          key={idx}
                          className="cl-test-case-card"
                          style={{
                            background: res.passed
                              ? 'rgba(16, 185, 129, 0.07)'
                              : 'rgba(239, 68, 68, 0.07)',
                            borderColor: res.passed
                              ? 'rgba(16, 185, 129, 0.3)'
                              : 'rgba(239, 68, 68, 0.3)',
                          }}
                        >
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span
                              className="font-monospace"
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                color: 'var(--text-secondary, #64748b)',
                              }}
                            >
                              Test Case #{idx + 1}
                            </span>
                            {res.passed ? (
                              <span className="cl-result-badge pass">
                                <FaCheckCircle size={12} /> PASS
                              </span>
                            ) : (
                              <span className="cl-result-badge fail">
                                <FaTimesCircle size={12} /> FAIL
                              </span>
                            )}
                          </div>
                          <div className="cl-result-row">
                            <span className="cl-result-label input">Input</span>
                            <code className="cl-result-value">{res.input}</code>
                          </div>
                          <div className="cl-result-row">
                            <span className="cl-result-label expected">Expected</span>
                            <code className="cl-result-value text-success">{res.expected}</code>
                          </div>
                          <div className="cl-result-row">
                            <span className="cl-result-label actual">Actual</span>
                            <code
                              className={`cl-result-value ${
                                res.passed ? 'text-success' : 'text-danger'
                              }`}
                            >
                              {res.actual}
                            </code>
                          </div>
                          {res.errorMsg && (
                            <div className="cl-result-error mt-2">
                              <FaExclamationTriangle size={11} />
                              <span>{res.errorMsg}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      <p className="text-secondary small mb-3">
                        Run your code using the Run button or <kbd className="bg-dark text-light">Ctrl+Enter</kbd> to see real execution results against these test cases:
                      </p>
                      {problem.testCases.map((tc, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-3 font-monospace small"
                          style={{
                            background:
                              'color-mix(in srgb, var(--card-bg-alt, #0f172a) 80%, transparent)',
                            border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
                            color: 'var(--text-primary)',
                          }}
                        >
                          <div className="mb-1">
                            <strong
                              className="text-secondary"
                              style={{
                                fontSize: '0.72rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                              }}
                            >
                              Test {idx + 1} Input:
                            </strong>{' '}
                            <span style={{ color: '#a5f3fc' }}>{tc.input}</span>
                          </div>
                          <div>
                            <strong
                              className="text-warning opacity-90"
                              style={{
                                fontSize: '0.72rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                              }}
                            >
                              Expected:
                            </strong>{' '}
                            <span style={{ color: '#86efac' }}>{tc.expected}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              </div>
            </div>
          </div>

          {/* ── Right Panel: Interactive Code Playground ── */}
          <div className={`col-lg-7 cl-arena-ide-col ${arenaView === 'read' ? 'd-none d-lg-block' : ''} ${arenaView === 'code' ? 'cl-arena-ide-fullscreen' : ''}`}>
            <div className="cl-ide-frame">
              {/* macOS Terminal Window Chrome Header */}
              <div className="cl-ide-header">
                <div className="cl-ide-dots">
                  <div className="cl-ide-dot close" />
                  <div className="cl-ide-dot minimize" />
                  <div className="cl-ide-dot maximize" />
                  <span className="ms-2 font-monospace small text-secondary">
                    solution.{language === 'sql' ? 'sql' : language === 'javascript' ? 'js' : 'py'}
                  </span>
                </div>

                <div className="d-flex align-items-center gap-2">
                  {/* Font Size & Word Wrap controls (visible on all screens) */}
                  <div className="d-flex align-items-center gap-1 me-2">
                    <button
                      type="button"
                      className="cl-arena-btn-icon"
                      onClick={() => setFontSize((s) => Math.max(12, s - 1))}
                      title="Decrease Editor Font Size"
                    >
                      A-
                    </button>
                    <span className="cl-font-size-label" aria-live="polite">{fontSize}</span>
                    <button
                      type="button"
                      className="cl-arena-btn-icon"
                      onClick={() => setFontSize((s) => Math.min(20, s + 1))}
                      title="Increase Editor Font Size"
                    >
                      A+
                    </button>
                    <button
                      type="button"
                      className={`cl-arena-btn-icon ${wrapEnabled ? 'active' : ''}`}
                      onClick={() => setWrapEnabled((w) => !w)}
                      title={wrapEnabled ? 'Disable word wrap' : 'Enable word wrap'}
                    >
                      <FaTextWidth size={12} />
                    </button>
                  </div>

                  <span className="d-none d-md-inline small text-secondary font-monospace me-2">
                    Ctrl + Enter to run
                  </span>

                  {/* Reset to starter code */}
                  <button
                    type="button"
                    id="cl-reset-code-btn"
                    className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-bold d-inline-flex align-items-center gap-1"
                    onClick={resetCode}
                    disabled={isRunning}
                    title="Reset to starter code"
                    style={{ minHeight: 38, fontSize: '0.78rem' }}
                  >
                    ↺ Reset
                  </button>

                  {/* Run & Submit button */}
                  <button
                    type="button"
                    id="cl-run-submit-btn"
                    className="btn btn-success btn-sm rounded-pill px-4 fw-bold d-inline-flex align-items-center gap-2"
                    onClick={runSolution}
                    disabled={isRunning}
                    style={{ minHeight: 38 }}
                  >
                    {isRunning ? (
                      <>
                        <FaSpinner className="fa-spin" /> Running…
                      </>
                    ) : (
                      <>
                        <FaPlay size={11} /> Run &amp; Submit
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* ── Smart Code Editor ── */}
              <div className="cl-ide-editor-area" style={{ padding: 0 }}>
                <CodeEditor
                  editorRef={editorRef}
                  value={code}
                  onChange={handleCodeChange}
                  language={language}
                  minRows={16}
                  fontSize={fontSize}
                  wrap={wrapEnabled}
                />
              </div>

              {/* ── Direct Execution Results Drawer under Editor ── */}
              {testResults && (
                <div
                  className="cl-test-results-panel"
                >
                  <div className="d-flex align-items-center justify-content-between mb-3 px-4 pt-4">
                    <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                      <FaTerminal className="text-success" /> Live Test Results
                      {executionMode && executionMode !== 'pyodide' && (
                        <span
                          className="cl-exec-mode-badge"
                          title={`Execution mode: ${executionMode}`}
                        >
                          {executionMode === 'sql-pattern'
                            ? 'SQL Pattern Check'
                            : 'Conceptual Check'}
                        </span>
                      )}
                    </h6>
                    <div className="d-flex align-items-center gap-2">
                      <span
                        className={`badge rounded-pill fw-bold px-3 py-1 ${
                          testResults.every((r) => r.passed)
                            ? 'bg-success'
                            : testResults.some((r) => r.passed)
                            ? 'bg-warning text-dark'
                            : 'bg-danger'
                        }`}
                      >
                        {testResults.filter((r) => r.passed).length} / {testResults.length} Passed
                      </span>
                    </div>
                  </div>

                  <div className="d-flex flex-column gap-2 px-4 pb-4">
                    {testResults.map((res, idx) => (
                      <div
                        key={idx}
                        id={`test-result-${idx}`}
                        className="cl-test-case-card"
                        style={{
                          background: res.passed
                            ? 'rgba(16, 185, 129, 0.07)'
                            : 'rgba(239, 68, 68, 0.07)',
                          borderColor: res.passed
                            ? 'rgba(16, 185, 129, 0.3)'
                            : 'rgba(239, 68, 68, 0.3)',
                        }}
                      >
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span
                            className="font-monospace"
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.6px',
                              color: 'var(--text-secondary, #64748b)',
                            }}
                          >
                            Test Case #{idx + 1}
                          </span>
                          {res.passed ? (
                            <span className="cl-result-badge pass">
                              <FaCheckCircle size={12} /> PASS
                            </span>
                          ) : (
                            <span className="cl-result-badge fail">
                              <FaTimesCircle size={12} /> FAIL
                            </span>
                          )}
                        </div>

                        <div className="cl-result-row">
                          <span className="cl-result-label input">Input</span>
                          <code className="cl-result-value">{res.input}</code>
                        </div>

                        <div className="cl-result-row">
                          <span className="cl-result-label expected">Expected</span>
                          <code className="cl-result-value text-success">{res.expected}</code>
                        </div>

                        <div className="cl-result-row">
                          <span className="cl-result-label actual">Actual</span>
                          <code
                            className={`cl-result-value ${
                              res.passed ? 'text-success' : 'text-danger'
                            }`}
                          >
                            {res.actual}
                          </code>
                        </div>

                        {res.errorMsg && (
                          <div className="cl-result-error mt-2">
                            <FaExclamationTriangle size={11} />
                            <span>{res.errorMsg}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
