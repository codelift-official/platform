import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ProgressBar } from 'react-bootstrap';
import {
  FaCheckCircle, FaPlay, FaRegCircle, FaChevronRight,
  FaTimes, FaSearch, FaLock
} from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function CurriculumNavigator({
  course,
  modules = [],
  currentModuleIndex = 0,
  currentTopicIndex = 0,
  expandedSections = new Set(),
  onToggleSection,
  onSelectLecture,
  studentProgress = {},
  quizAttempts = {},
  progressPct = 0,
  isOpen = false,
  onClose,
  unlockedTopicIds
}) {
  const activeLectureRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-scroll sidebar to active lecture on navigation change
  useEffect(() => {
    if (activeLectureRef.current) {
      activeLectureRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [currentModuleIndex, currentTopicIndex]);

  // Clear search when drawer closes
  useEffect(() => {
    if (!isOpen) setSearchQuery('');
  }, [isOpen]);

  // Flattened topic list to compute sequential unlocking
  const topicList = useMemo(() => {
    const list = [];
    modules.forEach((mod, mIdx) => {
      (mod.topics || []).forEach((top, tIdx) => {
        list.push({
          id: top.id,
          topic: top,
          mIdx,
          tIdx,
          hasQuiz: (Array.isArray(top.quizQuestions) && top.quizQuestions.length > 0) ||
            (tIdx === (mod.topics?.length - 1) && Array.isArray(mod.quizQuestions) && mod.quizQuestions.length > 0)
        });
      });
    });
    return list;
  }, [modules]);

  const effectiveUnlocked = useMemo(() => {
    if (unlockedTopicIds instanceof Set) return unlockedTopicIds;
    const unlocked = new Set();
    for (let i = 0; i < topicList.length; i++) {
      const item = topicList[i];
      if (i === 0) {
        unlocked.add(item.id);
      } else {
        const prev = topicList[i - 1];
        const isPassed = Boolean(quizAttempts[prev.id]?.passed);
        const isProgressMarked = studentProgress[prev.id] === 'completed' || studentProgress[prev.id] === true;
        const isPrevDone = prev.hasQuiz ? (isPassed || isProgressMarked) : (isProgressMarked || isPassed);
        if (unlocked.has(prev.id) && isPrevDone) {
          unlocked.add(item.id);
        } else {
          break;
        }
      }
    }
    return unlocked;
  }, [unlockedTopicIds, topicList, studentProgress, quizAttempts]);

  const getLectureStatus = (topic, mIdx, tIdx) => {
    const isCompleted =
      studentProgress[topic.id] === 'completed' ||
      studentProgress[topic.id] === true ||
      quizAttempts[topic.id]?.passed;
    if (isCompleted) return 'completed';
    if (mIdx === currentModuleIndex && tIdx === currentTopicIndex) return 'in-progress';
    if (!effectiveUnlocked.has(topic.id)) return 'locked';
    return 'not-started';
  };

  const getSectionStats = (module) => {
    const topics = module.topics || [];
    const completedCount = topics.filter(t =>
      studentProgress[t.id] === 'completed' ||
      studentProgress[t.id] === true ||
      quizAttempts[t.id]?.passed
    ).length;
    const totalMinutes = topics.reduce((acc, t) => acc + (t.durationMinutes || 7), 0);
    const durationStr = totalMinutes > 60
      ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
      : `${totalMinutes}m`;
    return {
      total: topics.length,
      completed: completedCount,
      isAllCompleted: topics.length > 0 && completedCount === topics.length,
      durationStr
    };
  };

  // Flatten and filter modules by search
  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return modules;
    const q = searchQuery.toLowerCase();
    return modules
      .map(module => ({
        ...module,
        topics: (module.topics || []).filter(t => t.title?.toLowerCase().includes(q))
      }))
      .filter(m => m.topics.length > 0 || m.title?.toLowerCase().includes(q));
  }, [modules, searchQuery]);

  // Auto-expand all filtered sections when searching
  const effectiveExpanded = useMemo(() => {
    if (!searchQuery.trim()) return expandedSections;
    return new Set(filteredModules.map((_, i) => i));
  }, [searchQuery, filteredModules, expandedSections]);

  const totalTopics = modules.reduce((acc, m) => acc + (m.topics?.length || 0), 0);
  const completedCount = modules.reduce((acc, m) =>
    acc + (m.topics || []).filter(t =>
      studentProgress[t.id] === 'completed' ||
      studentProgress[t.id] === true ||
      quizAttempts[t.id]?.passed
    ).length, 0);

  const content = (
    <div className="d-flex flex-column h-100">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="cv-nav-header">
        <div className="cv-nav-header-row">
          <span className="cv-nav-header-label">Course Content</span>
          {onClose && (
            <button
              type="button"
              className="cv-nav-close-btn d-lg-none"
              onClick={onClose}
              aria-label="Close curriculum"
            >
              <FaTimes size={13} />
            </button>
          )}
        </div>

        {/* Progress Summary */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {completedCount} of {totalTopics} lectures completed
            </span>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--bs-primary, #15803d)' }}>
              {progressPct}%
            </span>
          </div>
          <div style={{ height: 6, background: 'var(--border-color, rgba(128,128,128,0.2))', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, var(--bs-primary, #15803d) 0%, #22d3a5 100%)',
              borderRadius: 999,
              transition: 'width 0.6s ease'
            }} />
          </div>
        </div>

        {/* Search */}
        <div className="cv-nav-search">
          <FaSearch className="cv-nav-search-icon" size={11} />
          <input
            type="search"
            inputMode="search"
            className="cv-nav-search-input"
            placeholder="Search lectures…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Filter lectures"
          />
        </div>
      </div>

      {/* ── Scrollable List ─────────────────────────────── */}
      <div className="cv-nav-list">
        {filteredModules.length === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.83rem' }}>
            No lectures match your search.
          </div>
        ) : (
          filteredModules.map((module, mIdx) => {
            // Map back to original index for progress/status checks
            const originalMIdx = searchQuery.trim()
              ? modules.findIndex(m => m.id === module.id || m.title === module.title)
              : mIdx;

            const isExpanded = effectiveExpanded.has(mIdx);
            const isCurrentModule = originalMIdx === currentModuleIndex;
            const stats = getSectionStats(module);

            const isModuleLocked = (module.topics || []).length > 0 && !(module.topics || []).some(t => effectiveUnlocked.has(t.id));

            return (
              <div
                key={module.id || `section-${mIdx}`}
                style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)' }}
              >
                {/* Section Header */}
                <button
                  type="button"
                  className={`cv-section-btn ${isCurrentModule ? 'active' : ''}`}
                  style={{
                    backgroundColor: isCurrentModule
                      ? 'rgba(var(--bs-primary-rgb, 21, 128, 61), 0.05)'
                      : 'var(--card-bg, #fff)',
                    color: 'var(--text-primary)'
                  }}
                  onClick={() => onToggleSection && onToggleSection(mIdx)}
                  aria-expanded={isExpanded}
                >
                  <span className={`cv-section-chevron ${isExpanded ? 'open' : ''}`}>
                    <FaChevronRight size={10} />
                  </span>

                  <div className="cv-section-body">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 2 }}>
                      <span className="cv-section-title d-inline-flex align-items-center gap-1.5">
                        {isModuleLocked && <FaLock size={9} className="text-muted opacity-75 flex-shrink-0" />}
                        {originalMIdx + 1} {module.title}
                      </span>
                      {stats.isAllCompleted && (
                        <span className="cv-section-done-badge" title="Section completed">
                          <FaCheckCircle size={10} />
                        </span>
                      )}
                    </div>
                    <span className="cv-section-meta">
                      {stats.completed}/{stats.total} &nbsp;·&nbsp; {stats.durationStr}
                    </span>
                  </div>
                </button>

                {/* Lecture Rows */}
                {isExpanded && (
                  <div style={{ backgroundColor: 'var(--card-bg-alt, rgba(0,0,0,0.02))' }}>
                    {(module.topics || []).map((topic, tIdx) => {
                      const originalTIdx = searchQuery.trim()
                        ? (modules[originalMIdx]?.topics || []).findIndex(t => t.id === topic.id)
                        : tIdx;

                      const isCurrent = originalMIdx === currentModuleIndex && originalTIdx === currentTopicIndex;
                      const status = getLectureStatus(topic, originalMIdx, originalTIdx);
                      const isLocked = status === 'locked';

                      return (
                        <button
                          key={topic.id || `lec-${mIdx}-${tIdx}`}
                          ref={isCurrent ? activeLectureRef : null}
                          type="button"
                          className={`cv-lecture-row ${isCurrent ? 'active' : ''} ${isLocked ? 'opacity-50' : ''}`}
                          onClick={() => {
                            if (isLocked) {
                              toast.error('Topic locked. Complete previous topics and assessments first.');
                              return;
                            }
                            onSelectLecture && onSelectLecture(originalMIdx, originalTIdx);
                          }}
                          aria-current={isCurrent ? 'true' : undefined}
                          disabled={isLocked}
                          style={{ cursor: isLocked ? 'not-allowed' : 'pointer' }}
                        >
                          {/* Status Icon */}
                          <span className="cv-lec-icon">
                            {status === 'completed' ? (
                              <FaCheckCircle size={12} style={{ color: '#16a34a' }} />
                            ) : status === 'in-progress' ? (
                              <FaPlay size={9} style={{ color: 'var(--bs-primary, #15803d)' }} />
                            ) : status === 'locked' ? (
                              <FaLock size={10} style={{ color: 'var(--text-secondary)' }} />
                            ) : (
                              <FaRegCircle size={11} style={{ color: 'var(--text-secondary)' }} />
                            )}
                          </span>

                          {/* Title */}
                          <span className="cv-lec-title">
                            {originalTIdx + 1}. {topic.title}
                          </span>

                          {/* Quiz Indicator Badge */}
                          {(() => {
                            const qCount = (Array.isArray(topic.quizQuestions) && topic.quizQuestions.length > 0)
                              ? topic.quizQuestions.length
                              : (originalTIdx === module.topics?.length - 1 && Array.isArray(module.quizQuestions) ? module.quizQuestions.length : 0);
                            if (!qCount) return null;
                            const isPassed = quizAttempts[topic.id]?.passed;
                            return (
                              <span
                                className="badge rounded-pill ms-auto me-1 flex-shrink-0"
                                style={{
                                  fontSize: '0.65rem',
                                  background: isPassed ? 'rgba(var(--bs-success-rgb, 22, 163, 74), 0.16)' : 'rgba(var(--bs-primary-rgb, 21, 128, 61), 0.12)',
                                  color: isPassed ? 'var(--bs-success, #16a34a)' : 'var(--bs-primary)',
                                  border: '1px solid currentColor',
                                  fontWeight: 700
                                }}
                              >
                                {isPassed ? `✓ ${quizAttempts[topic.id]?.score}/${quizAttempts[topic.id]?.totalMarks}` : `Quiz`}
                              </span>
                            );
                          })()}

                          {/* Duration */}
                          {topic.durationMinutes && (
                            <span className="cv-lec-duration">{topic.durationMinutes}m</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  // Desktop sidebar – rendered by parent directly inside .cv-sidebar
  return (
    <>
      {/* Desktop: render inline content (parent wraps with .cv-sidebar) */}
      <div className="d-none d-lg-flex flex-column h-100" style={{ flex: 1 }}>
        {content}
      </div>

      {/* Mobile: rendered by parent into .cv-drawer — nothing else here */}
      <div className="d-flex d-lg-none flex-column h-100" style={{ flex: 1 }}>
        {content}
      </div>
    </>
  );
}
