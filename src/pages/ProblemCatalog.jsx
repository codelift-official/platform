import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SEED_PROBLEMS } from '../data/problemsSeed';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/common/Navbar';
import SEO from '../components/common/SEO';
import {
  FaCode,
  FaCheckCircle,
  FaFire,
  FaTerminal,
  FaBolt,
  FaTrophy,
  FaUserGraduate
} from 'react-icons/fa';
import '../styles/ProblemArena.css';

export default function ProblemCatalog({ isStudentView = false }) {
  const { codingProblems = [], codingAttempts = [], problemAttempts = [] } = useData();
  const { auth, currentUser } = useAuth();

  const isStudent = isStudentView || auth?.role === 'student' || Boolean(auth?.studentId);
  const currentStudentId = auth?.studentId || currentUser?.id || auth?.user?.id;

  // Guest solved IDs from client-side storage (ephemeral to device/browser)
  const [guestSolvedIds] = useState(() => {
    try {
      const cached = localStorage.getItem('codelift_guest_solved_problems');
      return cached ? JSON.parse(cached) : [];
    } catch (_) {
      return [];
    }
  });

  // Solved problems resolution: authenticated student attempts vs guest client-side storage
  const solvedProblemIds = useMemo(() => {
    if (isStudent && currentStudentId) {
      const studentAttemptIds = new Set();
      (codingAttempts || []).forEach((a) => {
        if ((a.studentId === currentStudentId || a.studentId === auth?.email) && a.passed) {
          studentAttemptIds.add(a.problemId);
        }
      });
      (problemAttempts || []).forEach((a) => {
        if ((a.studentId === currentStudentId || a.studentId === auth?.email) && a.passed) {
          studentAttemptIds.add(a.problemId);
        }
      });
      return studentAttemptIds;
    }
    return new Set(guestSolvedIds);
  }, [isStudent, currentStudentId, codingAttempts, problemAttempts, guestSolvedIds, auth]);

  // Single Source of Truth: problems managed by Admin in DataContext (fallback to seed)
  const problemsList = useMemo(() => {
    const list = (codingProblems && codingProblems.length > 0) ? codingProblems : SEED_PROBLEMS;
    return [...list].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }, [codingProblems]);

  const getDifficultyClass = (diff) => {
    if (diff === 'Easy') return 'easy';
    if (diff === 'Medium') return 'medium';
    return 'hard';
  };

  // Stats calculation
  const totalProblems = problemsList.length;
  const solvedCount = solvedProblemIds.size;
  const totalUserXp = problemsList
    .filter((p) => solvedProblemIds.has(p.id))
    .reduce((acc, curr) => acc + (curr.xp || 50), 0);
  const totalXpAvailable = problemsList.reduce((acc, curr) => acc + (curr.xp || 50), 0);

  // Dynamic route target based on view context
  const getProblemUrl = (probId) => {
    return isStudentView ? `/student/arena/${probId}` : `/problems/${probId}`;
  };

  return (
    <div className={`cl-arena-page ${isStudentView ? 'cl-arena-student-embedded' : ''}`}>
      <SEO
        title="Python Problem Solving Arena"
        description="Master Python and problem solving with interactive coding challenges and instant test execution."
      />

      {/* Render Public Navbar strictly on public view */}
      {!isStudentView && <Navbar />}

      {/* Atmospheric Theme-Adaptive Hero Header */}
      <section className={`cl-arena-hero ${isStudentView ? 'py-4' : ''}`}>
        <div className="container max-w-7xl">
          <div className="row align-items-center g-4">
            <div className="col-lg-8 text-center text-lg-start d-flex flex-column align-items-center align-items-lg-start">
              <span className="cl-arena-badge">
                <span className="live-dot" /> {isStudent ? (
                  <span className="d-inline-flex align-items-center gap-1">
                    <FaUserGraduate /> Student Coding Arena
                  </span>
                ) : (
                  '50+ Real-World Coding Challenges'
                )}
              </span>
              <h1 className="cl-arena-title">Problem Solving Arena</h1>
              <p className="text-secondary small mb-0 mt-1">
                {isStudent
                  ? 'All problems are synchronized with your academic profile. Complete challenges to earn XP and showcase mastery.'
                  : 'Practice coding challenges in your browser. Progress is saved locally in guest mode.'}
              </p>
            </div>

            {/* Interactive Coder Progress Ribbon */}
            <div className="col-lg-4 d-flex justify-content-center justify-content-lg-end">
              <div
                className="d-flex align-items-center gap-3 p-3 rounded-4 shadow-sm border"
                style={{
                  background: 'color-mix(in srgb, var(--card-bg, #0f172a) 90%, transparent)',
                  borderColor: 'var(--border-color, rgba(255,255,255,0.1))'
                }}
              >
                <div className="text-center px-2">
                  <div className="fw-bold fs-5 text-success d-flex align-items-center justify-content-center gap-1">
                    <FaCheckCircle size={15} /> {solvedCount}/{totalProblems}
                  </div>
                  <div className="text-secondary" style={{ fontSize: '0.72rem' }}>Challenges Solved</div>
                </div>
                <div style={{ width: '1px', height: '32px', background: 'var(--border-color, rgba(255,255,255,0.1))' }} />
                <div className="text-center px-2">
                  <div className="fw-bold fs-5 text-warning d-flex align-items-center justify-content-center gap-1">
                    <FaBolt size={14} /> {totalUserXp}
                  </div>
                  <div className="text-secondary" style={{ fontSize: '0.72rem' }}>Total XP Earned</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="container max-w-7xl py-4 py-md-3">
        {problemsList.length === 0 ? (
          <div className="cl-arena-empty-state text-center py-5 rounded-4 shadow-sm border" style={{ background: 'var(--card-bg, #0f172a)', borderColor: 'var(--border-color, rgba(255,255,255,0.1))' }}>
            <FaCode className="text-secondary fs-1 mb-3 opacity-50" />
            <h5 className="fw-bold mb-2">No coding challenges available</h5>
            <p className="text-secondary small mb-3">
              Challenges will appear here once published by your instructor or platform administrator.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View (>= 768px) */}
            <div className="cl-arena-table-card d-none d-md-block">
              <div className="table-responsive">
                <table className="cl-arena-table align-middle">
                  <thead>
                    <tr>
                      <th className="ps-4">Status</th>
                      <th>Challenge Title</th>
                      <th>Domain</th>
                      <th>Difficulty</th>
                      <th>XP Reward</th>
                      <th className="text-end pe-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {problemsList.map((prob) => {
                      const isSolved = solvedProblemIds.has(prob.id);
                      return (
                        <tr key={prob.id}>
                          <td className="ps-4">
                            {isSolved ? (
                              <span className="cl-diff-badge easy">
                                <FaCheckCircle /> Solved
                              </span>
                            ) : (
                              <span className="cl-problem-category-tag opacity-75">
                                Unsolved
                              </span>
                            )}
                          </td>
                          <td>
                            <Link to={getProblemUrl(prob.id)} className="cl-problem-title-link">
                              {prob.title}
                            </Link>
                          </td>
                          <td>
                            <span className="cl-problem-category-tag">
                              {prob.category}
                            </span>
                          </td>
                          <td>
                            <span className={`cl-diff-badge ${getDifficultyClass(prob.difficulty)}`}>
                              {prob.difficulty}
                            </span>
                          </td>
                          <td>
                            <span className="cl-xp-pill">
                              <FaFire size={11} /> +{prob.xp || 50} XP
                            </span>
                          </td>
                          <td className="text-end pe-4">
                            <Link to={getProblemUrl(prob.id)} className="cl-btn-solve">
                              <FaTerminal size={12} /> {isSolved ? 'Review' : 'Solve'}
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards View (< 768px) */}
            <div className="cl-arena-mobile-list d-md-none">
              {problemsList.map((prob) => {
                const isSolved = solvedProblemIds.has(prob.id);
                return (
                  <div key={prob.id} className="cl-arena-mobile-card">
                    <div className="cl-arena-mobile-header">
                      <span className="cl-problem-category-tag">
                        {prob.category}
                      </span>
                      <span className={`cl-diff-badge ${getDifficultyClass(prob.difficulty)}`}>
                        {prob.difficulty}
                      </span>
                    </div>

                    <Link to={getProblemUrl(prob.id)} className="text-decoration-none">
                      <h5 className="cl-arena-mobile-title">{prob.title}</h5>
                    </Link>

                    <div className="d-flex align-items-center justify-content-between my-2">
                      <span className="cl-xp-pill">
                        <FaFire size={11} /> +{prob.xp || 50} XP
                      </span>
                      {isSolved ? (
                        <span className="cl-diff-badge easy">
                          <FaCheckCircle /> Solved
                        </span>
                      ) : (
                        <span className="text-secondary small font-monospace">
                          Ready to attempt
                        </span>
                      )}
                    </div>

                    <div className="cl-arena-mobile-footer">
                      <Link
                        to={getProblemUrl(prob.id)}
                        className={`btn w-100 rounded-pill fw-bold d-inline-flex align-items-center justify-content-center gap-2 ${
                          isSolved ? 'btn-outline-success' : 'btn-success'
                        }`}
                        style={{ minHeight: 44 }}
                      >
                        <FaTerminal /> {isSolved ? 'Review Solution' : 'Solve Challenge'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
