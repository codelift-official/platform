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


              <div className="d-flex flex-wrap gap-3 align-items-center justify-content-center justify-content-lg-start">
                <button
                  type="button"
                  className={`btn rounded-pill px-4 fw-bold d-inline-flex align-items-center gap-2 ${showLeaderboard ? 'btn-warning text-dark' : 'btn-outline-light'
                    }`}
                  onClick={() => setShowLeaderboard(!showLeaderboard)}
                  style={{ minHeight: 44 }}
                >
                  <FaTrophy /> {showLeaderboard ? 'Close Leaderboard' : 'View Leaderboard'}
                </button>
                {filteredProblems.length > 0 && (
                  <Link
                    to={`/problems/${filteredProblems[0].id}`}
                    className="btn btn-success rounded-pill px-4 fw-bold d-inline-flex align-items-center gap-2"
                    style={{ minHeight: 44 }}
                  >
                    <FaTerminal /> Solve Next Challenge
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Coder Progress Ribbon */}
          <div className="cl-arena-stats-strip">
            <div className="cl-arena-stat-card">
              <div className="cl-stat-icon-wrap primary">
                <FaCode />
              </div>
              <div>
                <div className="cl-stat-number">{totalProblems}</div>
                <div className="cl-stat-label">Total Challenges</div>
              </div>
            </div>

            <div className="cl-arena-stat-card">
              <div className="cl-stat-icon-wrap success">
                <FaCheckCircle />
              </div>
              <div>
                <div className="cl-stat-number">{solvedCount}</div>
                <div className="cl-stat-label">Solved by You</div>
              </div>
            </div>

            <div className="cl-arena-stat-card">
              <div className="cl-stat-icon-wrap warning">
                <FaBolt />
              </div>
              <div>
                <div className="cl-stat-number">{totalUserXp} XP</div>
                <div className="cl-stat-label">XP Earned ({totalXpAvailable} Max)</div>
              </div>
            </div>

            <div className="cl-arena-stat-card">
              <div className="cl-stat-icon-wrap purple">
                <FaLayerGroup />
              </div>
              <div>
                <div className="cl-stat-number">{categories.length - 1}</div>
                <div className="cl-stat-label">Skill Domains</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="container max-w-7xl py-4 py-md-5">
        {/* Leaderboard Drawer */}
        {showLeaderboard && (
          <div className="cl-arena-filters-card mb-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2 text-warning">
                <FaTrophy /> Top XP Leaderboard
              </h5>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary rounded-pill"
                onClick={() => setShowLeaderboard(false)}
              >
                Close
              </button>
            </div>
            {leaderboardList.length === 0 ? (
              <p className="text-secondary small mb-0">No solved problems recorded yet. Be the first to reach the leaderboard!</p>
            ) : (
              <div className="table-responsive">
                <table className="cl-arena-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Coder ID</th>
                      <th className="text-end">Total XP Earned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardList.slice(0, 10).map((item, idx) => (
                      <tr key={item.studentId}>
                        <td className="fw-bold">
                          {idx === 0 ? (
                            <span className="text-warning d-flex align-items-center gap-1">
                              <FaMedal /> 1st Place
                            </span>
                          ) : idx === 1 ? (
                            <span className="text-light d-flex align-items-center gap-1">
                              <FaMedal /> 2nd Place
                            </span>
                          ) : idx === 2 ? (
                            <span className="text-warning-emphasis d-flex align-items-center gap-1">
                              <FaMedal /> 3rd Place
                            </span>
                          ) : (
                            `#${idx + 1}`
                          )}
                        </td>
                        <td className="fw-semibold">{item.studentId}</td>
                        <td className="text-end fw-bold text-success">+{item.totalXp} XP</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Filter & Search Strip */}
        <div className="cl-arena-filters-card">
          <div className="row g-3 align-items-center">
            {/* Search Input */}
            <div className="col-12 col-md-5 col-lg-4">
              <div className="cl-arena-search-box">
                <FaSearch className="text-secondary me-2 flex-shrink-0" />
                <input
                  type="text"
                  className="cl-arena-search-input"
                  placeholder="Search challenges (e.g. palindrome, SQL, tree)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="btn btn-link p-0 text-secondary"
                    onClick={() => setSearchQuery('')}
                    title="Clear search"
                  >
                    <FaTimes size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills (Scrollable on mobile) */}
            <div className="col-12 col-md-7 col-lg-6">
              <div className="d-flex gap-2 cl-category-pills-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`cl-category-pill ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Select */}
            <div className="col-12 col-lg-2 text-lg-end">
              <select
                className="form-select form-select-sm rounded-pill"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--card-bg-alt, #0f172a) 80%, transparent)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        {/* Challenge Results Count */}
        <div className="d-flex justify-content-between align-items-center mb-3 px-1">
          <span className="text-secondary small fw-semibold">
            Showing <strong className="text-light">{filteredProblems.length}</strong> of {SEED_PROBLEMS.length} challenges
          </span>
          {(searchQuery || selectedCategory !== 'All' || selectedDifficulty !== 'All') && (
            <button
              type="button"
              className="btn btn-link p-0 text-danger small fw-semibold text-decoration-none d-flex align-items-center gap-1"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedDifficulty('All');
              }}
            >
              <FaTimes size={11} /> Reset Filters
            </button>
          )}
        </div>

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

