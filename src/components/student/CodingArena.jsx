import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import {
  FaCode,
  FaCheckCircle,
  FaPlay,
  FaTrophy,
  FaFire,
  FaSearch,
  FaFilter,
  FaArrowRight,
  FaLockOpen,
  FaLightbulb,
  FaRedo
} from 'react-icons/fa';

export default function CodingArena() {
  const { auth } = useAuth();
  const { codingProblems = [], codingAttempts = [] } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter attempts for current student
  const studentId = auth?.studentId || auth?.user?.id || 'demo-student';
  const myAttempts = useMemo(() => {
    return codingAttempts.filter(a => a.studentId === studentId);
  }, [codingAttempts, studentId]);

  // Compute problem completion map: problemId -> { solved: bool, attemptsCount: number, bestXp: number }
  const problemStatusMap = useMemo(() => {
    const map = {};
    codingProblems.forEach(p => {
      const attempts = myAttempts.filter(a => a.problemId === p.id);
      const solved = attempts.some(a => a.passed);
      const bestXp = attempts.reduce((max, a) => Math.max(max, a.xpEarned || 0), 0);
      map[p.id] = {
        solved,
        attemptsCount: attempts.length,
        bestXp: solved ? (p.xp || 50) : bestXp
      };
    });
    return map;
  }, [codingProblems, myAttempts]);

  // Overall Stats
  const totalProblems = codingProblems.length;
  const solvedCount = Object.values(problemStatusMap).filter(s => s.solved).length;
  const totalPossibleXp = codingProblems.reduce((sum, p) => sum + (p.xp || 50), 0);
  const earnedXp = Object.entries(problemStatusMap).reduce((sum, [pid, s]) => {
    if (s.solved) {
      const prob = codingProblems.find(p => p.id === pid);
      return sum + (prob?.xp || 50);
    }
    return sum;
  }, 0);
  const progressPercent = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

  // Filtered problems list
  const filteredProblems = useMemo(() => {
    return codingProblems
      .slice()
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
      .filter(p => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title?.toLowerCase().includes(q);
          const matchDesc = p.description?.toLowerCase().includes(q);
          const matchCat = p.category?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchCat) return false;
        }

        // Difficulty
        if (difficultyFilter !== 'ALL' && p.difficulty?.toUpperCase() !== difficultyFilter) {
          return false;
        }

        // Status
        const st = problemStatusMap[p.id];
        if (statusFilter === 'SOLVED' && !st?.solved) return false;
        if (statusFilter === 'ATTEMPTED' && (!st || st.attemptsCount === 0 || st.solved)) return false;
        if (statusFilter === 'UNSOLVED' && st?.solved) return false;

        return true;
      });
  }, [codingProblems, searchQuery, difficultyFilter, statusFilter, problemStatusMap]);

  const getDifficultyBadge = (diff) => {
    const d = (diff || 'Easy').toLowerCase();
    if (d === 'hard') {
      return <span className="badge rounded-pill arena-badge-hard px-2.5 py-1">Hard</span>;
    }
    if (d === 'medium') {
      return <span className="badge rounded-pill arena-badge-medium px-2.5 py-1">Medium</span>;
    }
    return <span className="badge rounded-pill arena-badge-easy px-2.5 py-1">Easy</span>;
  };

  return (
    <div className="container-fluid px-0">
      {/* ── Hero Banner & Journey Progress (100% Theme Adaptive) ── */}
      <div className="card border-0 rounded-4 mb-4 arena-hero-banner shadow-sm">
        <div className="card-body p-4 p-md-5">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <div className="arena-hero-badge mb-3">
                <FaCode style={{ color: 'var(--bs-primary)' }} />
                <span>CODING ROUND READINESS ARENA</span>
              </div>
              <h2 className="arena-hero-title mb-2">
                Python Lists & Logic Journey
              </h2>
              <p className="arena-hero-desc mb-4" style={{ maxWidth: 540 }}>
                20 structured coding challenges designed by your tutor. Write authentic Python code, pass visible and hidden test cases, and clear your coding rounds with confidence!
              </p>

              {/* Progress track */}
              <div style={{ maxWidth: 480 }}>
                <div className="d-flex justify-content-between small mb-2">
                  <span className="fw-semibold" style={{ color: 'var(--text-secondary)' }}>Overall Mastery</span>
                  <span className="fw-bold" style={{ color: 'var(--text-primary)' }}>
                    {solvedCount} of {totalProblems} Solved ({progressPercent}%)
                  </span>
                </div>
                <div className="arena-progress-track">
                  <div
                    style={{
                      height: '100%',
                      width: `${progressPercent}%`,
                      background: 'linear-gradient(90deg, var(--bs-primary, #10b981) 0%, #34d399 100%)',
                      borderRadius: 6,
                      transition: 'width 0.6s ease'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Stat Pill Cards */}
            <div className="col-lg-5">
              <div className="row g-3">
                <div className="col-6">
                  <div className="arena-stat-card">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <FaTrophy style={{ color: '#f59e0b' }} />
                      <span className="arena-stat-label">Total XP</span>
                    </div>
                    <div className="arena-stat-value">
                      {earnedXp} <span className="fs-6 fw-normal" style={{ color: 'var(--text-secondary)' }}>/ {totalPossibleXp}</span>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="arena-stat-card">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <FaCheckCircle style={{ color: '#10b981' }} />
                      <span className="arena-stat-label">Solved</span>
                    </div>
                    <div className="arena-stat-value">
                      {solvedCount} <span className="fs-6 fw-normal" style={{ color: 'var(--text-secondary)' }}>Problems</span>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="arena-stat-card">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <FaFire style={{ color: '#0ea5e9' }} />
                      <span className="arena-stat-label">Remaining</span>
                    </div>
                    <div className="arena-stat-value">
                      {Math.max(0, totalProblems - solvedCount)}
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="arena-stat-card">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <FaLockOpen style={{ color: '#8b5cf6' }} />
                      <span className="arena-stat-label">Mode</span>
                    </div>
                    <div className="fs-6 fw-bold" style={{ color: 'var(--text-primary)' }}>Open Access</div>
                    <div className="arena-stat-sub">Pick any question</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filters and Search ── */}
      <div className="card border-0 rounded-4 mb-4 shadow-sm" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search problem title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                    boxShadow: 'none'
                  }}
                />
              </div>
            </div>
            <div className="col-6 col-md-3">
              <select
                className="form-select"
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="ALL">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
            <div className="col-6 col-md-4">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="SOLVED">✅ Solved Only</option>
                <option value="ATTEMPTED">🔄 In Progress (Attempted)</option>
                <option value="UNSOLVED">⭕ Unsolved Only</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Problem Grid / Journey Cards ── */}
      {filteredProblems.length === 0 ? (
        <div className="text-center py-5 card border-0 rounded-4" style={{ background: 'var(--card-bg)' }}>
          <div className="fs-1 text-muted mb-2">🔍</div>
          <h5 className="fw-bold" style={{ color: 'var(--text-primary)' }}>No problems match your filters</h5>
          <p className="text-secondary small mb-3">Try resetting search keywords or changing the difficulty filter.</p>
          <div>
            <button
              className="btn btn-outline-success btn-sm rounded-pill px-3"
              onClick={() => { setSearchQuery(''); setDifficultyFilter('ALL'); setStatusFilter('ALL'); }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {filteredProblems.map((prob, idx) => {
            const st = problemStatusMap[prob.id] || { solved: false, attemptsCount: 0 };
            const isSolved = st.solved;
            const isAttempted = !isSolved && st.attemptsCount > 0;

            return (
              <div key={prob.id} className="col-12 col-md-6 col-xl-4">
                <div
                  className="card border-0 rounded-4 h-100 position-relative transition-all shadow-sm"
                  style={{
                    background: 'var(--card-bg)',
                    border: isSolved
                      ? '1px solid rgba(16, 185, 129, 0.4)'
                      : '1px solid var(--border-color)',
                    boxShadow: isSolved
                      ? '0 4px 18px rgba(16, 185, 129, 0.08)'
                      : '0 2px 10px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = isSolved ? '#10b981' : 'var(--bs-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = isSolved
                      ? 'rgba(16, 185, 129, 0.4)'
                      : 'var(--border-color)';
                  }}
                >
                  <div className="card-body p-3.5 d-flex flex-column">
                    {/* Top Row: Order Index badge & Status pill */}
                    <div className="d-flex justify-content-between align-items-center mb-2.5">
                      <div className="d-flex align-items-center gap-2">
                        <span
                          className={`badge rounded-pill arena-badge-order ${isSolved ? 'solved' : ''}`}
                        >
                          #{prob.orderIndex || idx + 1}
                        </span>
                        {getDifficultyBadge(prob.difficulty)}
                      </div>

                      <div className="d-flex align-items-center gap-1.5">
                        <span className="badge rounded-pill arena-badge-xp">
                          +{prob.xp || 50} XP
                        </span>
                        {isSolved ? (
                          <span className="badge rounded-pill arena-badge-solved">
                            <FaCheckCircle className="me-1" /> Solved
                          </span>
                        ) : isAttempted ? (
                          <span className="badge rounded-pill arena-badge-attempted">
                            <FaRedo className="me-1" /> {st.attemptsCount} Attempt{st.attemptsCount > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="badge rounded-pill arena-badge-ready">
                            Ready
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Problem Title */}
                    <h6 className="fw-bold mb-2 text-truncate" title={prob.title} style={{ color: 'var(--text-primary)', fontSize: '0.98rem' }}>
                      {prob.title}
                    </h6>

                    {/* Problem Description Snippet */}
                    <p
                      className="small text-secondary mb-3 flex-grow-1"
                      style={{
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        fontSize: '0.84rem'
                      }}
                    >
                      {prob.description}
                    </p>

                    {/* Card Footer: Test cases count & Launch IDE button */}
                    <div className="pt-2 border-top d-flex justify-content-between align-items-center" style={{ borderColor: 'var(--border-color)' }}>
                      <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                        <span>{(prob.testCases || []).length} visible</span>
                        <span className="mx-1.5">·</span>
                        <span>{(prob.hiddenTestCases || []).length} hidden tests</span>
                      </div>

                      <Link
                        to={`/student/arena/${prob.id}`}
                        className={`btn btn-sm rounded-pill px-3 fw-semibold d-inline-flex align-items-center gap-1.5 ${isSolved ? 'btn-outline-success' : 'btn-primary'
                          }`}
                        style={{ fontSize: '0.82rem' }}
                      >
                        {isSolved ? 'Review Code' : 'Open IDE'} <FaArrowRight style={{ fontSize: '0.72rem' }} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
