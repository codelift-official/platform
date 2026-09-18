import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { executePython, judgeProblem, getPyodide } from '../../services/pythonRunner';
import { useTheme } from '../../contexts/ThemeContext';
import { isDarkTheme } from '../../utils/themeUtils';
import { FiSun, FiMoon } from 'react-icons/fi';
import toast from 'react-hot-toast';
import {
  FaPlay,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaArrowRight,
  FaUndo,
  FaLightbulb,
  FaTerminal,
  FaLock,
  FaTrophy,
  FaHistory,
  FaSpinner,
  FaInfoCircle,
  FaCode
} from 'react-icons/fa';

export default function PythonIDE() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { 
    codingProblems = [], 
    codingAttempts = [], 
    submitCodingAttempt 
  } = useData();

  const studentId = auth?.studentId || auth?.user?.id || 'demo-student';

  // Theme support: Follow app theme (dark/light) with optional in-IDE toggle
  const { currentTheme } = useTheme();
  const appIsDark = isDarkTheme(currentTheme);
  const [editorThemeMode, setEditorThemeMode] = useState(null);
  const isDark = editorThemeMode !== null ? editorThemeMode === 'dark' : appIsDark;

  // Find current problem
  const problem = useMemo(() => {
    return codingProblems.find(p => p.id === problemId) || codingProblems[0];
  }, [codingProblems, problemId]);

  // Previous and Next problem navigation
  const sortedProblems = useMemo(() => {
    return [...codingProblems].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }, [codingProblems]);

  const currentIndex = sortedProblems.findIndex(p => p?.id === problem?.id);
  const prevProblem = currentIndex > 0 ? sortedProblems[currentIndex - 1] : null;
  const nextProblem = currentIndex < sortedProblems.length - 1 ? sortedProblems[currentIndex + 1] : null;

  // Student attempts on this problem
  const problemAttempts = useMemo(() => {
    return codingAttempts.filter(a => a.studentId === studentId && a.problemId === problem?.id);
  }, [codingAttempts, studentId, problem?.id]);

  const isAlreadySolved = useMemo(() => {
    return problemAttempts.some(a => a.passed);
  }, [problemAttempts]);

  // Code state (restore from last attempt if available, else starterCode)
  const [code, setCode] = useState('');
  useEffect(() => {
    if (problem) {
      const lastAttempt = problemAttempts[0];
      if (lastAttempt?.code) {
        setCode(lastAttempt.code);
      } else {
        setCode(problem.starterCode || '# Write your Python code here\n');
      }
    }
  }, [problem?.id]);

  // UI Tabs & State
  const [leftTab, setLeftTab] = useState('description'); // 'description' | 'tests' | 'hints' | 'history'
  const [consoleTab, setConsoleTab] = useState('tests'); // 'tests' | 'terminal'
  const [mobileTab, setMobileTab] = useState('editor'); // 'problem' | 'editor' | 'results'
  const [revealedHints, setRevealedHints] = useState({});
  const [isEngineLoading, setIsEngineLoading] = useState(false);
  const [engineStatusText, setEngineStatusText] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isJudging, setIsJudging] = useState(false);
  
  // Execution Outputs
  const [terminalOutput, setTerminalOutput] = useState('');
  const [testResults, setTestResults] = useState(null);

  const editorRef = useRef(null);

  // Quick symbol insertion on mobile editor
  const insertSymbol = (sym, cursorOffset = sym.length) => {
    const textarea = editorRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newCode = code.substring(0, start) + sym + code.substring(end);
    setCode(newCode);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + cursorOffset;
    }, 10);
  };

  // Tab key indent handler in textarea
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = editorRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Insert 4 spaces
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  // Reset to starter code
  const handleResetCode = () => {
    if (window.confirm('Reset code back to the original starter template?')) {
      setCode(problem?.starterCode || '');
      toast.success('Code reset to template');
    }
  };

  // Run Code (Free test run)
  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some Python code first!');
      return;
    }

    setIsRunning(true);
    setConsoleTab('terminal');
    setMobileTab('results');
    setTerminalOutput('Executing Python code...\n');

    try {
      setIsEngineLoading(true);
      setEngineStatusText('Loading Python runtime...');
      await getPyodide((msg) => setEngineStatusText(msg));
      setIsEngineLoading(false);

      // Provide sample input from the first visible test case if input() is used
      const sampleInput = problem.testCases?.[0]?.input || '';
      const res = await executePython(code, { stdin: sampleInput });
      if (res.success) {
        setTerminalOutput(res.stdout || '[Program executed successfully with no print output]');
        toast.success(`Ran in ${res.executionTime}ms`);
      } else {
        setTerminalOutput(`Execution Error:\n${res.stderr || res.error}`);
        toast.error('Execution encountered an error');
      }
    } catch (err) {
      setTerminalOutput(`Runtime Error: ${err.message}`);
      toast.error('Could not run Python');
    } finally {
      setIsRunning(false);
      setIsEngineLoading(false);
    }
  };

  // Submit and Judge (runs visible + hidden tests)
  const handleSubmitAndJudge = async () => {
    if (!code.trim()) {
      toast.error('Please write code before submitting!');
      return;
    }

    setIsJudging(true);
    setConsoleTab('tests');
    setMobileTab('results');
    setTestResults(null);

    try {
      setIsEngineLoading(true);
      setEngineStatusText('Warming up judge...');
      await getPyodide((msg) => setEngineStatusText(msg));
      setIsEngineLoading(false);

      const visibleTests = problem.testCases || [];
      const hiddenTests = problem.hiddenTestCases || [];

      const judgeOutcome = await judgeProblem({
        studentCode: code,
        visibleTestCases: visibleTests,
        hiddenTestCases: hiddenTests,
        starterCode: problem.starterCode || ''
      });

      setTestResults(judgeOutcome);

      const xpToAward = judgeOutcome.allPassed ? (problem.xp || 50) : 0;

      // Submit attempt
      submitCodingAttempt({
        studentId,
        problemId: problem.id,
        code,
        visibleResults: judgeOutcome.visibleResults,
        hiddenResults: judgeOutcome.hiddenResults,
        passed: judgeOutcome.allPassed,
        xpEarned: xpToAward
      });

      if (judgeOutcome.allPassed) {
        toast.success(`🎉 All tests passed! +${xpToAward} XP awarded!`, { duration: 5000 });
      } else {
        toast.error(`Some test cases failed (${judgeOutcome.visiblePassedCount}/${judgeOutcome.visibleTotalCount} visible passed)`);
      }
    } catch (err) {
      toast.error(`Judging error: ${err.message}`);
    } finally {
      setIsJudging(false);
      setIsEngineLoading(false);
    }
  };

  if (!problem) {
    return (
      <div className="text-center py-5">
        <h5>Problem not found</h5>
        <Link to="/student/arena" className="btn btn-primary mt-3">Return to Arena</Link>
      </div>
    );
  }

  const lineCount = code.split('\n').length;

  return (
    <div className="container-fluid px-0" style={{ minHeight: 'calc(100vh - 120px)' }}>
      {/* ── Top Header Navigation Bar ── */}
      <div 
        className="card border-0 rounded-4 mb-3 shadow-sm"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
      >
        <div className="card-body p-3">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            {/* Left: Back & Question Title */}
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <Link 
                to="/student/arena" 
                className="btn btn-sm btn-outline-secondary rounded-pill px-3 d-inline-flex align-items-center gap-1.5"
                style={{ fontSize: '0.82rem' }}
              >
                <FaArrowLeft /> Arena
              </Link>
              
              <span className="badge rounded-pill arena-badge-order">
                #{problem.orderIndex || 1}
              </span>

              <h5 className="fw-bold mb-0 text-truncate" style={{ color: 'var(--text-primary)', maxWidth: 420 }}>
                {problem.title}
              </h5>

              <span className="badge rounded-pill arena-badge-xp">
                +{problem.xp || 50} XP
              </span>

              {isAlreadySolved && (
                <span className="badge rounded-pill arena-badge-solved">
                  <FaCheckCircle className="me-1" /> Solved
                </span>
              )}
            </div>

            {/* Right: Prev / Next & Action Buttons */}
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <div className="btn-group btn-group-sm">
                <button 
                  className="btn btn-outline-secondary"
                  disabled={!prevProblem}
                  onClick={() => prevProblem && navigate(`/student/arena/${prevProblem.id}`)}
                  title={prevProblem ? `Prev: ${prevProblem.title}` : 'First problem'}
                >
                  <FaArrowLeft /> Prev
                </button>
                <button 
                  className="btn btn-outline-secondary"
                  disabled={!nextProblem}
                  onClick={() => nextProblem && navigate(`/student/arena/${nextProblem.id}`)}
                  title={nextProblem ? `Next: ${nextProblem.title}` : 'Last problem'}
                >
                  Next <FaArrowRight />
                </button>
              </div>

              <button
                className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 rounded-pill px-2.5"
                onClick={handleResetCode}
                title="Reset to starter code"
              >
                <FaUndo /> <span className="d-none d-sm-inline">Reset</span>
              </button>

              <button
                className="btn btn-sm btn-outline-primary d-none d-lg-inline-flex align-items-center gap-1.5 rounded-pill px-3"
                onClick={handleRunCode}
                disabled={isRunning || isJudging}
              >
                {isRunning ? <FaSpinner className="fa-spin" /> : <FaPlay />} Run
              </button>

              <button
                className="btn btn-sm btn-success d-none d-lg-inline-flex align-items-center gap-1.5 rounded-pill px-3.5 shadow-sm"
                onClick={handleSubmitAndJudge}
                disabled={isRunning || isJudging}
              >
                {isJudging ? <FaSpinner className="fa-spin" /> : <FaCheckCircle />} Submit & Judge
              </button>
            </div>
          </div>

          {/* Engine Loading Indicator */}
          {isEngineLoading && (
            <div className="mt-2 py-1 px-3 rounded-3 small text-info d-flex align-items-center gap-2" style={{ background: 'rgba(56, 189, 248, 0.08)' }}>
              <FaSpinner className="fa-spin" />
              <span>{engineStatusText || 'Initializing Python WebAssembly environment...'}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile View Mode Switcher (Visible on < 992px) ── */}
      <div className="arena-mobile-mode-switcher d-flex d-lg-none p-1 rounded-pill mb-3 shadow-sm">
        <button
          type="button"
          className={`arena-mobile-mode-btn flex-grow-1 ${mobileTab === 'problem' ? 'active' : ''}`}
          onClick={() => setMobileTab('problem')}
        >
          <FaInfoCircle className="me-1.5" /> Problem
        </button>
        <button
          type="button"
          className={`arena-mobile-mode-btn flex-grow-1 ${mobileTab === 'editor' ? 'active' : ''}`}
          onClick={() => setMobileTab('editor')}
        >
          <FaCode className="me-1.5" /> Editor
        </button>
        <button
          type="button"
          className={`arena-mobile-mode-btn flex-grow-1 ${mobileTab === 'results' ? 'active' : ''}`}
          onClick={() => setMobileTab('results')}
        >
          <FaTerminal className="me-1.5" /> Results
          {testResults && (
            <span
              className={`badge rounded-pill ms-1.5 ${testResults.allPassed ? 'bg-success' : 'bg-danger'}`}
              style={{ fontSize: '0.68rem' }}
            >
              {testResults.visiblePassedCount}/{testResults.visibleTotalCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Main Split View ── */}
      <div className="row g-3 pb-5 mb-4">
        {/* LEFT COLUMN: Problem Details, Hints, Visible Cases, Submissions */}
        <div className={`col-12 col-lg-5 flex-column ${mobileTab === 'problem' ? 'd-flex' : 'd-none d-lg-flex'}`}>
          <div 
            className="card border-0 rounded-4 shadow-sm h-100 d-flex flex-column"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', minHeight: 600 }}
          >
            {/* Tab header */}
            <div className="card-header bg-transparent border-bottom p-2 d-flex gap-1" style={{ borderColor: 'var(--border-color)' }}>
              <button
                className={`btn btn-sm rounded-pill px-3 fw-semibold arena-tab-btn ${leftTab === 'description' ? 'active' : ''}`}
                onClick={() => setLeftTab('description')}
                style={{ fontSize: '0.8rem' }}
              >
                Description
              </button>
              <button
                className={`btn btn-sm rounded-pill px-3 fw-semibold arena-tab-btn ${leftTab === 'tests' ? 'active' : ''}`}
                onClick={() => setLeftTab('tests')}
                style={{ fontSize: '0.8rem' }}
              >
                Test Cases ({(problem.testCases || []).length})
              </button>
              <button
                className={`btn btn-sm rounded-pill px-3 fw-semibold arena-tab-btn ${leftTab === 'hints' ? 'active' : ''}`}
                onClick={() => setLeftTab('hints')}
                style={{ fontSize: '0.8rem' }}
              >
                Hints ({(problem.hints || []).length})
              </button>
              <button
                className={`btn btn-sm rounded-pill px-3 fw-semibold arena-tab-btn ${leftTab === 'history' ? 'active' : ''}`}
                onClick={() => setLeftTab('history')}
                style={{ fontSize: '0.8rem' }}
              >
                History ({problemAttempts.length})
              </button>
            </div>

            {/* Tab Body */}
            <div className="card-body p-3.5 flex-grow-1 overflow-auto" style={{ maxHeight: 'calc(100vh - 240px)' }}>
              {leftTab === 'description' && (
                <div>
                  <h5 className="fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {problem.title}
                  </h5>
                  <div className="d-flex gap-2 mb-3">
                    <span className="badge rounded-pill arena-badge-category">
                      Category: {problem.category || 'Lists'}
                    </span>
                    <span className={`badge rounded-pill ${
                      (problem.difficulty || 'Easy').toLowerCase() === 'hard' 
                        ? 'arena-badge-hard' 
                        : (problem.difficulty || '').toLowerCase() === 'medium'
                        ? 'arena-badge-medium'
                        : 'arena-badge-easy'
                    }`}>
                      Difficulty: {problem.difficulty || 'Easy'}
                    </span>
                  </div>

                  <div 
                    className="p-3 rounded-3 mb-3"
                    style={{ 
                      background: 'var(--bg-body)', 
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6,
                      fontSize: '0.92rem'
                    }}
                  >
                    {problem.description}
                  </div>

                  <div className="card rounded-3 border-0 p-3 mb-3" style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
                    <div className="d-flex align-items-center gap-2 text-primary fw-bold small mb-1">
                      <FaInfoCircle />
                      <span>Judging Guidelines:</span>
                    </div>
                    <ul className="small text-secondary mb-0 ps-3" style={{ lineHeight: 1.6 }}>
                      <li>Outputs are evaluated from standard output (<code>print(...)</code>) or return values.</li>
                      <li>Inputs are fed automatically via standard input (<code>input()</code>) or variable declarations.</li>
                      <li>Visible tests evaluate basic examples shown in the test cases tab.</li>
                      <li>Hidden tests evaluate edge cases (empty inputs, zero, negatives, boundary limits).</li>
                      <li>Full score is unlocked when 100% of visible and hidden tests pass.</li>
                    </ul>
                  </div>
                </div>
              )}

              {leftTab === 'tests' && (
                <div>
                  <h6 className="fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>Visible Test Cases</h6>
                  <p className="small text-secondary mb-3">
                    These test cases will be evaluated when you run or submit your code.
                  </p>

                  {(problem.testCases || []).map((tc, idx) => (
                    <div 
                      key={idx} 
                      className="card border-0 rounded-3 mb-2.5 p-3"
                      style={{ background: 'var(--bg-body)', border: '1px solid var(--border-color)' }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="badge rounded-pill arena-badge-ready" style={{ fontSize: '0.75rem' }}>
                          Test Case #{idx + 1}
                        </span>
                      </div>
                      <div className="mb-2">
                        <div className="small text-secondary fw-semibold">Input / Context:</div>
                        <code className="d-block p-2 rounded-2 mt-1" style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: '0.84rem' }}>
                          {tc.input || 'Default initial list'}
                        </code>
                      </div>
                      <div>
                        <div className="small text-secondary fw-semibold">Expected Output:</div>
                        <code className="d-block p-2 rounded-2 mt-1 text-success fw-bold" style={{ background: 'var(--card-bg)', fontSize: '0.84rem' }}>
                          {tc.expected}
                        </code>
                      </div>
                    </div>
                  ))}

                  <div className="p-3 rounded-3 mt-3 d-flex align-items-center gap-2" style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <FaLock style={{ color: '#d97706' }} />
                    <span className="small" style={{ color: '#b45309' }}>
                      <strong>{(problem.hiddenTestCases || []).length} Hidden Test Cases:</strong> Evaluated during Submit to ensure your solution is robust.
                    </span>
                  </div>
                </div>
              )}

              {leftTab === 'hints' && (
                <div>
                  <h6 className="fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    <FaLightbulb className="text-warning me-1.5" /> Hints & Guidance
                  </h6>
                  <p className="small text-secondary mb-3">
                    Try solving without hints first to build interview problem-solving intuition!
                  </p>

                  {(!problem.hints || problem.hints.length === 0) ? (
                    <div className="text-muted small">No hints provided for this problem. You've got this!</div>
                  ) : (
                    problem.hints.map((hint, idx) => {
                      const isRevealed = Boolean(revealedHints[idx]);
                      return (
                        <div 
                          key={idx} 
                          className="card border-0 rounded-3 mb-2.5 p-3"
                          style={{ background: 'var(--bg-body)', border: '1px solid var(--border-color)' }}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-semibold small" style={{ color: 'var(--text-primary)' }}>
                              Hint {idx + 1}
                            </span>
                            {!isRevealed ? (
                              <button
                                className="btn btn-sm btn-outline-warning rounded-pill py-0 px-2.5"
                                style={{ fontSize: '0.75rem' }}
                                onClick={() => setRevealedHints(prev => ({ ...prev, [idx]: true }))}
                              >
                                Reveal Hint
                              </button>
                            ) : (
                              <span className="badge rounded-pill arena-badge-medium" style={{ fontSize: '0.72rem' }}>
                                Revealed
                              </span>
                            )}
                          </div>
                          {isRevealed && (
                            <div className="mt-2 text-secondary small pt-2 border-top" style={{ borderColor: 'var(--border-color)', lineHeight: 1.5 }}>
                              {hint}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {leftTab === 'history' && (
                <div>
                  <h6 className="fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>Submission History</h6>
                  {problemAttempts.length === 0 ? (
                    <div className="text-muted small py-3 text-center">No submissions yet for this problem.</div>
                  ) : (
                    problemAttempts.map((att, idx) => (
                      <div 
                        key={att.id || idx} 
                        className="card border-0 rounded-3 mb-2 p-2.5"
                        style={{ 
                          background: 'var(--bg-body)', 
                          border: att.passed ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)'
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            {att.passed ? (
                              <span className="badge rounded-pill arena-badge-solved me-2">Passed</span>
                            ) : (
                              <span className="badge rounded-pill arena-badge-hard me-2">Failed</span>
                            )}
                            <span className="small text-secondary">
                              {new Date(att.attemptedAt).toLocaleString()}
                            </span>
                          </div>
                          <button
                            className="btn btn-sm btn-link text-decoration-none p-0 small text-primary"
                            onClick={() => {
                              setCode(att.code);
                              toast.success('Code restored from this submission');
                            }}
                          >
                            Load Code
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Code Editor & Console/Judging Results */}
        <div className={`col-12 col-lg-7 flex-column ${mobileTab !== 'problem' ? 'd-flex' : 'd-none d-lg-flex'}`}>
          <div 
            className="card border-0 rounded-4 shadow-sm flex-grow-1 d-flex flex-column overflow-hidden"
            style={{
              background: isDark ? '#0b1120' : 'var(--card-bg, #ffffff)',
              border: isDark ? '1px solid #1e293b' : '1px solid var(--border-color, #e2e8f0)'
            }}
          >
            {/* Editor Top Toolbar */}
            <div 
              className={`px-3 py-2 justify-content-between align-items-center ${mobileTab === 'results' ? 'd-none d-lg-flex' : 'd-flex'}`}
              style={{
                background: isDark ? '#0f172a' : 'var(--card-bg-alt, #f8fafc)',
                borderBottom: isDark ? '1px solid #1e293b' : '1px solid var(--border-color, #e2e8f0)'
              }}
            >
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-success bg-opacity-20 text-success" style={{ fontSize: '0.75rem' }}>
                  Python 3 (Pyodide Wasm)
                </span>
                <span className="small text-muted d-none d-sm-inline" style={{ fontSize: '0.75rem' }}>
                  {lineCount} lines · Tab indents 4 spaces
                </span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-sm py-0.5 px-2 rounded-pill d-flex align-items-center gap-1 border"
                  style={{
                    fontSize: '0.72rem',
                    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    color: isDark ? '#cbd5e1' : '#475569',
                    borderColor: isDark ? '#334155' : '#cbd5e1'
                  }}
                  onClick={() => setEditorThemeMode(isDark ? 'light' : 'dark')}
                  title="Toggle editor theme mode"
                >
                  {isDark ? <FiSun size={11} className="text-warning" /> : <FiMoon size={11} className="text-primary" />}
                  <span>{isDark ? 'Dark' : 'Light'}</span>
                </button>
                <span className={`badge ${isDark ? 'bg-dark text-muted' : 'bg-light text-secondary border'}`} style={{ fontSize: '0.72rem' }}>UTF-8</span>
              </div>
            </div>

            {/* Mobile Python Quick Syntax Toolbar */}
            {mobileTab === 'editor' && (
              <div className="arena-mobile-quickbar d-flex d-lg-none border-bottom px-2 py-1.5" style={{ background: isDark ? '#0f172a' : '#f1f5f9', borderColor: 'var(--border-color)' }}>
                {[
                  { label: 'Tab', insert: '    ', offset: 4 },
                  { label: ':', insert: ':', offset: 1 },
                  { label: '( )', insert: '()', offset: 1 },
                  { label: '[ ]', insert: '[]', offset: 1 },
                  { label: '{ }', insert: '{}', offset: 1 },
                  { label: '" "', insert: '""', offset: 1 },
                  { label: "' '", insert: "''", offset: 1 },
                  { label: '=', insert: ' = ', offset: 3 },
                  { label: '+', insert: ' + ', offset: 3 },
                  { label: '-', insert: ' - ', offset: 3 },
                  { label: '*', insert: ' * ', offset: 3 },
                  { label: '#', insert: '# ', offset: 2 },
                  { label: '_', insert: '_', offset: 1 },
                  { label: 'def', insert: 'def ', offset: 4 },
                  { label: 'for', insert: 'for ', offset: 4 },
                  { label: 'in', insert: 'in ', offset: 3 },
                  { label: 'if', insert: 'if ', offset: 3 },
                  { label: 'print', insert: 'print()', offset: 6 },
                ].map((btn, bIdx) => (
                  <button
                    key={bIdx}
                    type="button"
                    className="arena-mobile-quick-key btn btn-sm py-1 px-2.5"
                    onClick={() => insertSymbol(btn.insert, btn.offset)}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            )}

            {/* Code Editor Area */}
            <div className={`position-relative flex-grow-1 ${mobileTab === 'results' ? 'd-none d-lg-block' : 'd-block'}`} style={{ minHeight: 320 }}>
              <textarea
                ref={editorRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                className="form-control border-0 font-monospace p-3"
                placeholder="# Write your Python code here..."
                style={{
                  background: isDark ? '#0b1120' : '#ffffff',
                  color: isDark ? '#e2e8f0' : '#0f172a',
                  fontSize: '0.94rem',
                  lineHeight: '1.6',
                  height: '100%',
                  minHeight: 320,
                  resize: 'vertical',
                  boxShadow: 'none',
                  outline: 'none',
                  fontFamily: '"Fira Code", "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace'
                }}
              />
            </div>

            {/* Bottom Panel: Test Results / Terminal */}
            <div className={`overflow-hidden ${mobileTab === 'editor' ? 'd-none d-lg-block' : 'd-block'}`} style={{
              background: isDark ? '#0f172a' : 'var(--card-bg-alt, #f8fafc)',
              borderTop: isDark ? '1px solid #1e293b' : '1px solid var(--border-color, #e2e8f0)'
            }}>
              {/* Console Tabs */}
              <div className="px-3 pt-2 d-flex justify-content-between align-items-center border-bottom" style={{ borderColor: isDark ? '#1e293b' : 'var(--border-color, #e2e8f0)' }}>
                <div className="d-flex gap-2">
                  <button
                    className={`btn btn-sm rounded-top-2 rounded-bottom-0 px-3 fw-semibold ${consoleTab === 'tests' ? 'btn-primary' : (isDark ? 'btn-dark text-muted' : 'btn-outline-secondary text-secondary')}`}
                    onClick={() => setConsoleTab('tests')}
                    style={{ fontSize: '0.8rem' }}
                  >
                    Judge & Test Results
                  </button>
                  <button
                    className={`btn btn-sm rounded-top-2 rounded-bottom-0 px-3 fw-semibold ${consoleTab === 'terminal' ? 'btn-primary' : (isDark ? 'btn-dark text-muted' : 'btn-outline-secondary text-secondary')}`}
                    onClick={() => setConsoleTab('terminal')}
                    style={{ fontSize: '0.8rem' }}
                  >
                    <FaTerminal className="me-1" /> Terminal Output
                  </button>
                </div>
              </div>

              {/* Console Body */}
              <div className="p-3" style={{ maxHeight: 260, overflowY: 'auto' }}>
                {consoleTab === 'terminal' && (
                  <pre 
                    className="font-monospace mb-0" 
                    style={{ 
                      color: isDark ? '#4ade80' : '#15803d', 
                      background: isDark ? 'transparent' : '#ffffff',
                      padding: isDark ? 0 : '12px',
                      borderRadius: '8px',
                      border: isDark ? 'none' : '1px solid var(--border-color, #e2e8f0)',
                      fontSize: '0.86rem', 
                      whiteSpace: 'pre-wrap', 
                      lineHeight: 1.5 
                    }}
                  >
                    {terminalOutput || 'No output yet. Click "Run" or "Submit & Judge" to execute your code.'}
                  </pre>
                )}

                {consoleTab === 'tests' && (
                  <div>
                    {!testResults ? (
                      <div className="text-center py-3 text-muted small">
                        Click <strong>"Submit & Judge"</strong> to run your code against all visible and hidden test cases.
                      </div>
                    ) : (
                      <div>
                        {/* Summary Header */}
                        <div className="d-flex justify-content-between align-items-center mb-3 p-2.5 rounded-3" style={{ background: testResults.allPassed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', border: testResults.allPassed ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)' }}>
                          <div className="d-flex align-items-center gap-2">
                            {testResults.allPassed ? (
                              <FaCheckCircle className="text-success fs-5" />
                            ) : (
                              <FaTimesCircle className="text-danger fs-5" />
                            )}
                            <div>
                              <span className="fw-bold" style={{ color: testResults.allPassed ? '#4ade80' : '#f87171' }}>
                                {testResults.allPassed ? 'All Test Cases Passed! Accepted.' : 'Solution Failed Some Test Cases'}
                              </span>
                              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                Visible: {testResults.visiblePassedCount}/{testResults.visibleTotalCount} Passed · Hidden: {testResults.hiddenPassedCount}/{testResults.hiddenTotalCount} Passed
                              </div>
                            </div>
                          </div>
                          {testResults.allPassed && (
                            <span className="badge bg-success rounded-pill px-3 py-1.5 fw-bold">
                              +{problem.xp || 50} XP EARNED
                            </span>
                          )}
                        </div>

                        {/* Visible test cards */}
                        <div className="row g-2">
                          {testResults.visibleResults.map((vr) => (
                            <div key={vr.testIndex} className="col-12">
                              <div 
                                className="p-2.5 rounded-3 font-monospace"
                                style={{
                                  background: vr.passed ? 'rgba(16, 185, 129, 0.06)' : 'rgba(239, 68, 68, 0.06)',
                                  border: vr.passed ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)',
                                  fontSize: '0.82rem'
                                }}
                              >
                                <div className="d-flex justify-content-between mb-1.5">
                                  <span className={vr.passed ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                                    {vr.passed ? '✓ Test Case #' + vr.testIndex + ' Passed' : '✗ Test Case #' + vr.testIndex + ' Failed'}
                                  </span>
                                  <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                                    {vr.executionTime}ms
                                  </span>
                                </div>
                                <div className="row g-2 text-muted" style={{ fontSize: '0.78rem' }}>
                                  <div className="col-6">
                                    <span className="text-secondary">Expected:</span>{' '}
                                    <span className="text-success">{vr.expected}</span>
                                  </div>
                                  <div className="col-6">
                                    <span className="text-secondary">Your Output:</span>{' '}
                                    <span className={vr.passed ? 'text-success' : 'text-danger fw-bold'}>
                                      {vr.actual || '(no output)'}
                                    </span>
                                  </div>
                                </div>
                                {vr.error && (
                                  <div className="mt-1 text-danger small">
                                    Error: {vr.error}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Hidden tests summary */}
                        <div className="mt-2.5 p-2.5 rounded-3 d-flex justify-content-between align-items-center" style={{ background: '#1e293b', border: '1px solid #334155', fontSize: '0.82rem' }}>
                          <div className="d-flex align-items-center gap-2 text-white-50">
                            <FaLock />
                            <span>Hidden Test Cases (Edge Cases):</span>
                          </div>
                          <div>
                            {testResults.hiddenPassedCount === testResults.hiddenTotalCount ? (
                              <span className="badge bg-success bg-opacity-25 text-success">
                                {testResults.hiddenPassedCount}/{testResults.hiddenTotalCount} Passed ✓
                              </span>
                            ) : (
                              <span className="badge bg-danger bg-opacity-25 text-danger">
                                {testResults.hiddenPassedCount}/{testResults.hiddenTotalCount} Passed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky Mobile Bottom Action Bar (Visible on < 992px) ── */}
      <div className="arena-sticky-bottom-bar d-flex d-lg-none align-items-center gap-2">
        <button
          type="button"
          className="btn btn-outline-primary rounded-pill fw-bold py-2 flex-grow-1 d-flex align-items-center justify-content-center gap-2"
          onClick={handleRunCode}
          disabled={isRunning || isJudging}
          style={{ minHeight: 44, fontSize: '0.88rem' }}
        >
          {isRunning ? <FaSpinner className="fa-spin" /> : <FaPlay size={12} />}
          <span>Run</span>
        </button>
        <button
          type="button"
          className="btn btn-success rounded-pill fw-bold py-2 flex-grow-1 d-flex align-items-center justify-content-center gap-2 shadow-sm"
          onClick={handleSubmitAndJudge}
          disabled={isRunning || isJudging}
          style={{ minHeight: 44, fontSize: '0.88rem' }}
        >
          {isJudging ? <FaSpinner className="fa-spin" /> : <FaCheckCircle size={14} />}
          <span>Submit & Judge</span>
        </button>
      </div>
    </div>
  );
}
