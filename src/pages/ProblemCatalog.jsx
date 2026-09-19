import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEED_PROBLEMS } from '../data/problemsSeed';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/common/Navbar';
import SEO from '../components/common/SEO';
import {
  FaCode,
  FaSearch,
  FaTrophy,
  FaCheckCircle,
  FaFire,
  FaTerminal,
  FaTimes,
  FaLayerGroup,
  FaBolt,
  FaMedal
} from 'react-icons/fa';
import '../styles/ProblemArena.css';

export default function ProblemCatalog() {
  const { problemAttempts } = useData();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Solved problems set for currentUser
  const solvedProblemIds = new Set(
    (problemAttempts || [])
      .filter((pa) => pa.studentId === currentUser?.id && pa.passed)
      .map((pa) => pa.problemId)
  );

  const categories = ['All', 'Python', 'Data Structures', 'Algorithms', 'Web Dev', 'SQL', 'Flask'];

  const filteredProblems = SEED_PROBLEMS.filter((p) => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (selectedDifficulty !== 'All' && p.difficulty !== selectedDifficulty) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!p.title.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const getDifficultyClass = (diff) => {
    if (diff === 'Easy') return 'easy';
    if (diff === 'Medium') return 'medium';
    return 'hard';
  };

  // Stats calculation
  const totalProblems = SEED_PROBLEMS.length;
  const solvedCount = solvedProblemIds.size;
  const totalUserXp = SEED_PROBLEMS
    .filter((p) => solvedProblemIds.has(p.id))
    .reduce((acc, curr) => acc + (curr.xp || 50), 0);
  const totalXpAvailable = SEED_PROBLEMS.reduce((acc, curr) => acc + (curr.xp || 50), 0);

  // Leaderboard Calculation
  const leaderboardMap = {};
  (problemAttempts || []).forEach((pa) => {
    if (pa.passed) {
      const sid = pa.studentId || 'Anonymous';
      leaderboardMap[sid] = (leaderboardMap[sid] || 0) + (pa.score || 50);
    }
  });

  const leaderboardList = Object.entries(leaderboardMap)
    .map(([studentId, totalXp]) => ({ studentId, totalXp }))
    .sort((a, b) => b.totalXp - a.totalXp);

  return (
    <div className="cl-arena-page">
      <SEO
        title="50+ Coding & Problem Solving Challenges"
        description="Master Python, Data Structures, Algorithms, SQL, and Flask with 50+ interactive coding problems and test runners."
      />
      <Navbar />

      {/* Atmospheric Theme-Adaptive Hero Header */}
      <section className="cl-arena-hero">
        <div className="container max-w-7xl">
          <div className="row align-items-center g-4">
            <div className="col-lg-8 text-center text-lg-start d-flex flex-column align-items-center align-items-lg-start">
              <span className="cl-arena-badge">
                <span className="live-dot" /> 50+ Real-World Coding Challenges
              </span>
              <h1 className="cl-arena-title">Problem Solving Arena</h1>
            </div>
          </div>

        </div>
      </section>

      {/* Main Content Area */}
      <main className="container max-w-7xl py-4 py-md-3">


        {/* Empty State */}
        {filteredProblems.length === 0 ? (
          <div className="cl-arena-filters-card text-center py-5">
            <FaCode className="text-secondary fs-1 mb-3 opacity-50" />
            <h5 className="fw-bold mb-2">No matching coding challenges found</h5>
            <p className="text-secondary small mb-3">
              Try adjusting your search keywords or switching category filters.
            </p>
            <button
              type="button"
              className="btn btn-sm btn-outline-success rounded-pill px-4 fw-bold"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedDifficulty('All');
              }}
            >
              Show All Challenges
            </button>
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
                    {filteredProblems.map((prob) => {
                      const isSolved = solvedProblemIds.has(prob.id);
                      return (
                        <tr key={prob.id}>
                          <td className="ps-4">
                            {isSolved ? (
                              <span className="cl-diff-badge easy">
                                <FaCheckCircle /> Solved
                              </span>
                            ) : (
                              <span className="cl-problem-category-tag">
                                Unsolved
                              </span>
                            )}
                          </td>
                          <td>
                            <Link to={`/problems/${prob.id}`} className="cl-problem-title-link">
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
                              <FaFire size={11} /> +{prob.xp} XP
                            </span>
                          </td>
                          <td className="text-end pe-4">
                            <Link to={`/problems/${prob.id}`} className="cl-btn-solve">
                              <FaTerminal size={12} /> Solve
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
              {filteredProblems.map((prob) => {
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

                    <Link to={`/problems/${prob.id}`} className="text-decoration-none">
                      <h5 className="cl-arena-mobile-title">{prob.title}</h5>
                    </Link>

                    <div className="d-flex align-items-center justify-content-between my-2">
                      <span className="cl-xp-pill">
                        <FaFire size={11} /> +{prob.xp} XP
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
                        to={`/problems/${prob.id}`}
                        className="btn btn-success w-100 rounded-pill fw-bold d-inline-flex align-items-center justify-content-center gap-2"
                        style={{ minHeight: 44 }}
                      >
                        <FaTerminal /> Solve Challenge
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

