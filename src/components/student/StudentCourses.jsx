import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ProgressBar } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import {
  FaBook, FaGraduationCap, FaCheckCircle, FaAward, FaArrowLeft,
  FaArrowRight, FaPlay, FaListUl, FaCalendarAlt, FaCheck,
  FaRegFileAlt, FaClipboardList, FaBars, FaSearch, FaRegCircle,
  FaChevronRight, FaTimes, FaBookOpen, FaClipboard, FaLock
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import CurriculumNavigator from './CurriculumNavigator';
import TopicQuiz from '../common/TopicQuiz';
import CourseTechThumbnail from '../common/CourseTechThumbnail';
import '../../styles/CourseView.css';

// ══════════════════════════════════════════════════════════
// Enhanced Markdown Renderer with Copy-Code & Tables
// ══════════════════════════════════════════════════════════
function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code]);

  return (
    <div className="cv-code-block">
      <div className="cv-code-header">
        <span className="cv-code-lang">{lang || 'code'}</span>
        <button
          type="button"
          className={`cv-code-copy ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          aria-label="Copy code"
        >
          {copied ? <FaCheck size={10} /> : <FaClipboard size={10} />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className="cv-code-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function renderInline(text) {
  if (!text || typeof text !== 'string') return text;
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**') && p.length >= 4) {
      return <strong key={i}>{p.slice(2, -2)}</strong>;
    }
    if (p.startsWith('`') && p.endsWith('`') && p.length >= 2) {
      return <code key={i} className="md-inline-code">{p.slice(1, -1)}</code>;
    }
    if (p.startsWith('*') && p.endsWith('*') && p.length >= 2 && !p.startsWith('**')) {
      return <em key={i}>{p.slice(1, -1)}</em>;
    }
    return p;
  });
}

function LectureMarkdown({ content }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // ── Code Blocks ──────────────────────────────────────
    if (line.startsWith('```')) {
      const lang = line.replace(/^```/, '').trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <CodeBlock key={`code-${i}`} code={codeLines.join('\n')} lang={lang} />
      );
      i++;
      continue;
    }

    // ── Blockquote ───────────────────────────────────────
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="md-blockquote">
          {renderInline(line.slice(2))}
        </blockquote>
      );
      i++;
      continue;
    }

    // ── Markdown Tables ──────────────────────────────────
    if (line.includes('|') && lines[i + 1] && lines[i + 1].includes('|') && lines[i + 1].includes('-')) {
      const tableRows = [];
      while (i < lines.length && lines[i].includes('|')) {
        tableRows.push(lines[i]);
        i++;
      }
      const headerCols = tableRows[0].split('|').filter(c => c.trim().length > 0);
      const dataRows = tableRows.slice(2).map(r => r.split('|').filter(c => c.trim().length > 0));

      elements.push(
        <div key={`table-${i}`} className="cv-md-table-wrap">
          <table className="cv-md-table">
            <thead>
              <tr>{headerCols.map((col, ci) => <th key={ci}>{renderInline(col.trim())}</th>)}</tr>
            </thead>
            <tbody>
              {dataRows.map((row, ri) => (
                <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{renderInline(cell.trim())}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // ── Headings ─────────────────────────────────────────
    if (line.startsWith('# ')) {
      elements.push(<h1 className="cv-md-body" key={i} style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: 28, marginBottom: 12, color: 'var(--text-primary)' }}>{renderInline(line.slice(2))}</h1>);
      i++; continue;
    }
    if (line.startsWith('## ')) {
      elements.push(<h2 className="cv-md-body" key={i} style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: 24, marginBottom: 10, color: 'var(--text-primary)' }}>{renderInline(line.slice(3))}</h2>);
      i++; continue;
    }
    if (line.startsWith('### ')) {
      elements.push(<h3 className="cv-md-body" key={i} style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: 20, marginBottom: 8, color: 'var(--text-primary)' }}>{renderInline(line.slice(4))}</h3>);
      i++; continue;
    }

    // ── Lists ─────────────────────────────────────────────
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const items = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(lines[i].replace(/^[-*]\s+/, ''));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} style={{ paddingLeft: 20, marginBottom: 14 }}>
          {items.map((item, idx) => (
            <li key={idx} className="cv-md-body" style={{ marginBottom: 5, lineHeight: 1.65, color: 'var(--text-primary)' }}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} style={{ paddingLeft: 20, marginBottom: 14 }}>
          {items.map((item, idx) => (
            <li key={idx} className="cv-md-body" style={{ marginBottom: 5, lineHeight: 1.65, color: 'var(--text-primary)' }}>{renderInline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // ── Horizontal Rule ───────────────────────────────────
    if (line.match(/^[-*]{3,}$/)) {
      elements.push(<hr key={i} style={{ borderColor: 'var(--border-color)', margin: '20px 0' }} />);
      i++; continue;
    }

    // ── Paragraph ─────────────────────────────────────────
    if (line.trim().length > 0) {
      elements.push(
        <p key={i} className="cv-md-body" style={{ marginBottom: 14, lineHeight: 1.72, color: 'var(--text-primary)' }}>
          {renderInline(line)}
        </p>
      );
    }

    i++;
  }

  return <div className="cv-md-body">{elements}</div>;
}

// ══════════════════════════════════════════════════════════
// Main StudentCourses Component
// ══════════════════════════════════════════════════════════
export default function StudentCourses() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { auth } = useAuth();
  const { students = [], courses = [], batches = [], enrollments = [], markTopicComplete, saveQuizAttempt } = useData();

  const student = Array.isArray(students)
    ? students.find(s =>
        (auth?.studentId && (s.id === auth.studentId || s.legacyId === auth.studentId)) ||
        (auth?.id && (s.id === auth.id || s.legacyId === auth.id)) ||
        (auth?.userId && (s.id === auth.userId || s.legacyId === auth.userId)) ||
        (auth?.email && s.email?.toLowerCase() === auth.email?.toLowerCase())
      )
    : null;
  const batch = batches.find(b => b.id === student?.batchId);

  const allAvailableCourses = useMemo(() => {
    return courses.filter(c => {
      if (c.isPublished === false) return false;

      // 1. Matched via student's batch
      let isBatchAssigned = false;
      if (student?.batchId) {
        if (Array.isArray(batch?.courseIds) && batch.courseIds.includes(c.id)) isBatchAssigned = true;
        if (c.batchId === student.batchId || (Array.isArray(c.batchIds) && c.batchIds.includes(student.batchId))) isBatchAssigned = true;
      }
      if (isBatchAssigned) return true;

      // 2. Direct student enrollment (APPROVED, ACTIVE, PAID)
      const isEnrolled = enrollments.some(
        e => (e.studentId === student?.id || e.studentId === auth?.studentId || e.student_id === student?.id || e.student_id === auth?.studentId) &&
          (e.courseId === c.id || e.courseId === c.slug || e.course_id === c.id || e.course_id === c.slug) &&
          ['APPROVED', 'ACTIVE', 'PAID', 'FREE'].includes(e.status)
      );
      if (isEnrolled) return true;

      // 3. Elective or free courses — only show if student is enrolled (Bug 4 fix: prevent un-allotted electives from appearing)
      if ((c.courseType === 'elective' || c.isFree || !c.price || c.price === 0) && isEnrolled) return true;

      return false;
    });
  }, [courses, student, batch, enrollments, auth?.studentId]);

  const selectedCourseId = searchParams.get('id');
  const activeCourse = allAvailableCourses.find(c => c.id === selectedCourseId || c.slug === selectedCourseId) ||
    allAvailableCourses[0];

  // ── Navigator State ──────────────────────────────────────
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState(() => new Set([0]));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);

  const toggleSidebar = () => setIsSidebarHidden(prev => !prev);

  // ── Helper to save last topic ──
  const saveLastTopic = useCallback((courseId, mIdx, tIdx, topicId) => {
    if (!courseId) return;
    try {
      localStorage.setItem(`codelift_last_topic_${courseId}`, JSON.stringify({
        moduleIndex: mIdx,
        topicIndex: tIdx,
        topicId: topicId || ''
      }));
    } catch (_) {}
  }, []);

  const modules = activeCourse?.modules || [];
  const currentModule = modules[currentModuleIndex] || modules[0];
  const topics = currentModule?.topics || [];
  const currentTopic = topics[currentTopicIndex] || topics[0];

  useEffect(() => {
    if (!activeCourse) return;
    const courseId = activeCourse.id;
    const courseModules = activeCourse.modules || [];

    try {
      const saved = localStorage.getItem(`codelift_last_topic_${courseId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        const mIdx = typeof parsed.moduleIndex === 'number' ? parsed.moduleIndex : 0;
        const tIdx = typeof parsed.topicIndex === 'number' ? parsed.topicIndex : 0;
        if (courseModules[mIdx] && courseModules[mIdx].topics?.[tIdx]) {
          setCurrentModuleIndex(mIdx);
          setCurrentTopicIndex(tIdx);
          setExpandedSections(new Set([0, mIdx]));
          return;
        }
        if (parsed.topicId) {
          for (let m = 0; m < courseModules.length; m++) {
            const t = (courseModules[m].topics || []).findIndex(top => top.id === parsed.topicId);
            if (t !== -1) {
              setCurrentModuleIndex(m);
              setCurrentTopicIndex(t);
              setExpandedSections(new Set([0, m]));
              return;
            }
          }
        }
      }
    } catch (_) {}

    // Fallback: Check student.progress to find first incomplete topic
    if (student?.progress && courseModules.length > 0) {
      for (let m = 0; m < courseModules.length; m++) {
        const t = (courseModules[m].topics || []).findIndex(
          top => student.progress[top.id] !== 'completed' && student.progress[top.id] !== true
        );
        if (t !== -1) {
          setCurrentModuleIndex(m);
          setCurrentTopicIndex(t);
          setExpandedSections(new Set([0, m]));
          return;
        }
      }
    }

    setCurrentModuleIndex(0);
    setCurrentTopicIndex(0);
    setExpandedSections(new Set([0]));
    setMobileDrawerOpen(false);
  }, [selectedCourseId, activeCourse?.id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentModuleIndex, currentTopicIndex]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileDrawerOpen]);

  const getCourseStats = useCallback((course) => {
    const allTopics = (course.modules || []).flatMap(m => m.topics || []);
    const totalTopics = allTopics.length;
    const completedTopics = allTopics.filter(t =>
      student?.progress?.[t.id] === 'completed' ||
      student?.progress?.[t.id] === true ||
      student?.quizAttempts?.[t.id]?.passed
    ).length;
    const progressPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    return { totalModules: course.modules?.length || 0, totalTopics, completedTopics, progressPct };
  }, [student]);

  const activeStats = activeCourse ? getCourseStats(activeCourse) : { totalTopics: 0, completedTopics: 0, progressPct: 0, totalModules: 0 };

  // Flattened linear list of all topics in course
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

  const checkTopicCompleted = useCallback((topicId, hasQuiz) => {
    if (!topicId) return false;
    const isQuizPassed = Boolean(student?.quizAttempts?.[topicId]?.passed);
    const isProgressMarked = student?.progress?.[topicId] === 'completed' || student?.progress?.[topicId] === true;
    return hasQuiz ? isQuizPassed : (isProgressMarked || isQuizPassed);
  }, [student]);

  // Sequential unlocking: completed topics, active topic, and immediate next topic are unlocked
  const unlockedTopicIds = useMemo(() => {
    const unlocked = new Set();
    if (!Array.isArray(topicList) || topicList.length === 0) return unlocked;

    // First topic is always unlocked
    unlocked.add(topicList[0].id);

    // Any topic that is completed is always unlocked for free review
    topicList.forEach((item) => {
      const isDone =
        student?.progress?.[item.id] === 'completed' ||
        student?.progress?.[item.id] === true ||
        Boolean(student?.quizAttempts?.[item.id]?.passed);
      if (isDone) {
        unlocked.add(item.id);
      }
    });

    // Active lecture should never be locked
    if (currentTopic?.id) {
      unlocked.add(currentTopic.id);
    }

    // Linear sequential unlocking: completing topic i unlocks topic i + 1
    for (let i = 0; i < topicList.length - 1; i++) {
      const current = topicList[i];
      const next = topicList[i + 1];
      const isCurrentDone =
        student?.progress?.[current.id] === 'completed' ||
        student?.progress?.[current.id] === true ||
        Boolean(student?.quizAttempts?.[current.id]?.passed);

      if (isCurrentDone) {
        unlocked.add(next.id);
      }
    }

    return unlocked;
  }, [topicList, student?.progress, student?.quizAttempts, currentTopic?.id]);

  const currentHasQuiz = (Array.isArray(currentTopic?.quizQuestions) && currentTopic.quizQuestions.length > 0) ||
    (currentTopicIndex === (topics.length - 1) && Array.isArray(currentModule?.quizQuestions) && currentModule.quizQuestions.length > 0);

  const isCurrentTopicCompleted = currentTopic
    ? checkTopicCompleted(currentTopic.id, currentHasQuiz)
    : false;

  const handleSelectCourse = (courseId) => {
    setSearchParams({ id: courseId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCourses = () => setSearchParams({});

  const handleToggleSection = (mIdx) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(mIdx)) next.delete(mIdx); else next.add(mIdx);
      return next;
    });
  };

  const handleSelectLecture = (mIdx, tIdx) => {
    const targetTopic = modules[mIdx]?.topics?.[tIdx];
    if (targetTopic && !unlockedTopicIds.has(targetTopic.id)) {
      toast.error('Topic locked. Please complete previous topics and assessments first.');
      return;
    }
    setCurrentModuleIndex(mIdx);
    setCurrentTopicIndex(tIdx);
    setExpandedSections(prev => new Set([...prev, mIdx]));
    setMobileDrawerOpen(false);
    saveLastTopic(activeCourse?.id, mIdx, tIdx, targetTopic?.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isFirstLecture = currentModuleIndex === 0 && currentTopicIndex === 0;
  const isLastModule = currentModuleIndex === modules.length - 1;
  const isLastTopicInModule = currentTopicIndex === topics.length - 1;
  const isLastLecture = isLastModule && isLastTopicInModule;

  const handleCompleteCourse = (bypassQuizCheck = false) => {
    if (!currentTopic || !student || !activeCourse) return;
    const isTopicActuallyPassed = bypassQuizCheck || isCurrentTopicCompleted || Boolean(student?.quizAttempts?.[currentTopic.id]?.passed);
    if (currentHasQuiz && !isTopicActuallyPassed) {
      toast.error('Please complete and pass the quiz assessment to finish this course.');
      document.getElementById('topic-assessment-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    toast.dismiss();
    markTopicComplete(student.id, currentTopic.id, activeCourse.id);

    // Multi-burst party popper celebration!
    try {
      confetti({
        particleCount: 85,
        angle: 60,
        spread: 65,
        origin: { x: 0.05, y: 0.7 },
        colors: ['#22c55e', '#eab308', '#3b82f6', '#ec4899', '#f97316']
      });
      confetti({
        particleCount: 85,
        angle: 120,
        spread: 65,
        origin: { x: 0.95, y: 0.7 },
        colors: ['#22c55e', '#eab308', '#3b82f6', '#ec4899', '#f97316']
      });
      setTimeout(() => {
        try {
          confetti({
            particleCount: 120,
            spread: 100,
            origin: { y: 0.5 },
            colors: ['#22c55e', '#10b981', '#f59e0b', '#6366f1', '#ec4899']
          });
        } catch (_) {}
      }, 220);
    } catch (_) {}

    toast.success('🎉 Congratulations! You have completed the course!');

    // Trigger EmailJS course_completion notification
    if (student?.email && sendEmail) {
      sendEmail('course_completion', student, {
        student_name: student.name,
        student_email: student.email,
        course_title: activeCourse.title,
        completion_date: new Date().toLocaleDateString('en-IN')
      }).catch((e) => console.warn('[StudentCourses] course_completion email skipped:', e));
    }

    setTimeout(() => {
      navigate('/student/courses');
    }, 1400);
  };

  const handleNextLecture = () => {
    if (isLastLecture) {
      handleCompleteCourse();
      return;
    }

    // Gated progression: If current topic has an assessment quiz and is not completed, block advancing
    if (!isCurrentTopicCompleted) {
      if (currentHasQuiz) {
        toast.error('Please complete and pass the quiz assessment before proceeding to the next lecture.');
        document.getElementById('topic-assessment-section')?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      if (student && activeCourse && currentTopic) {
        markTopicComplete(student.id, currentTopic.id, activeCourse.id);
      }
    }

    let nextM = currentModuleIndex;
    let nextT = currentTopicIndex;

    if (currentTopicIndex < topics.length - 1) {
      nextT = currentTopicIndex + 1;
      setCurrentTopicIndex(nextT);
    } else {
      nextM = currentModuleIndex + 1;
      nextT = 0;
      setCurrentModuleIndex(nextM);
      setCurrentTopicIndex(0);
      setExpandedSections(prev => new Set([...prev, nextM]));
    }

    const nextTopicObj = modules[nextM]?.topics?.[nextT];
    saveLastTopic(activeCourse?.id, nextM, nextT, nextTopicObj?.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevLecture = () => {
    if (isFirstLecture) return;
    let prevM = currentModuleIndex;
    let prevT = currentTopicIndex;

    if (currentTopicIndex > 0) {
      prevT = currentTopicIndex - 1;
      setCurrentTopicIndex(prevT);
    } else {
      prevM = currentModuleIndex - 1;
      const prevTopics = modules[prevM]?.topics || [];
      prevT = Math.max(0, prevTopics.length - 1);
      setCurrentModuleIndex(prevM);
      setCurrentTopicIndex(prevT);
      setExpandedSections(prev => new Set([...prev, prevM]));
    }

    const prevTopicObj = modules[prevM]?.topics?.[prevT];
    saveLastTopic(activeCourse?.id, prevM, prevT, prevTopicObj?.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ══════════════════════════════════════════════════════════
  // VIEW 2 – LECTURE LEARNING VIEW
  // ══════════════════════════════════════════════════════════
  if (selectedCourseId) {
    if (!activeCourse) {
      return (
        <div className="cv-empty">
          <FaBook size={48} className="cv-empty-icon" />
          <div className="cv-empty-title">Course Not Available</div>
          <p className="cv-empty-text">This course is either unpublished or not assigned to your current batch.</p>
          <button onClick={handleBackToCourses} className="btn btn-primary d-inline-flex align-items-center gap-2 px-4 py-2 rounded-3">
            <FaArrowLeft size={13} /> Return to Courses
          </button>
        </div>
      );
    }

    const totalTopicsAll = modules.reduce((acc, m) => acc + (m.topics?.length || 0), 0);
    const currentTopicGlobal = modules
      .slice(0, currentModuleIndex)
      .reduce((acc, m) => acc + (m.topics?.length || 0), 0) + currentTopicIndex + 1;

    return (
      <div className="udemy-course-viewer" style={{ position: 'relative', minHeight: '100vh' }}>
        {/* ── Slim Top Progress Track ── */}
        <div className="cv-progress-track" aria-hidden="true">
          <div className="cv-progress-fill" style={{ width: `${activeStats.progressPct}%` }} />
        </div>

        {/* ── Top Bar ── */}
        <div className="cv-topbar">
          {/* Back */}
          <button
            type="button"
            className="cv-topbar-back"
            onClick={handleBackToCourses}
            aria-label="Back to My Courses"
          >
            <FaArrowLeft size={11} />
            <span>Courses</span>
          </button>

          {/* Course Info */}
          <div className="cv-topbar-info">
            <div className="cv-topbar-breadcrumb">
              Section {currentModuleIndex + 1} · Lecture {currentTopicIndex + 1}
            </div>
            <div className="cv-topbar-title">{activeCourse.title}</div>
          </div>

          {/* Actions */}
          <div className="cv-topbar-actions">
            {/* Progress Pill */}
            <div className="cv-progress-pill">
              <div className="cv-progress-pill-bar">
                <div className="cv-progress-pill-fill" style={{ width: `${activeStats.progressPct}%` }} />
              </div>
              <span>{activeStats.progressPct}%</span>
            </div>

            {/* Desktop sidebar toggle */}
            <button
              type="button"
              className="cv-curriculum-btn btn btn-sm btn-outline-secondary d-none d-lg-flex"
              onClick={toggleSidebar}
              title={isSidebarHidden ? 'Show Curriculum' : 'Hide Curriculum'}
            >
              <FaListUl size={12} />
              <span className="ms-1">{isSidebarHidden ? 'Syllabus' : 'Hide'}</span>
            </button>

            {/* Module test shortcut */}
            {(currentModule?.testId || currentModule?.test || currentModule?.hasTest) && (
              <button
                type="button"
                className="btn btn-sm btn-outline-primary d-none d-sm-flex align-items-center gap-1 rounded-pill px-3"
                onClick={() => navigate(currentModule?.testId ? `/student/tests?testId=${currentModule.testId}` : '/student/tests')}
              >
                <FaClipboardList size={11} />
                <span>Test</span>
              </button>
            )}

            {/* Mobile Drawer Trigger */}
            <button
              type="button"
              className="cv-curriculum-btn btn btn-sm btn-primary d-flex d-lg-none"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open curriculum"
            >
              <FaBars size={12} />
              <span className="ms-1">Curriculum</span>
              <span
                className="badge rounded-pill ms-1"
                style={{ background: 'rgba(255,255,255,0.25)', fontSize: '0.65rem', padding: '1px 5px' }}
              >
                {currentTopicGlobal}/{totalTopicsAll}
              </span>
            </button>
          </div>
        </div>

        {/* ── Main Layout ── */}
        <div className={`cv-layout ${isSidebarHidden ? 'sidebar-collapsed' : ''}`}>
          {/* Floating "Show Curriculum" FAB when desktop sidebar is hidden */}
          {isSidebarHidden && (
            <button type="button" className="cv-sidebar-show-fab d-none d-lg-flex" onClick={toggleSidebar}>
              <FaListUl size={13} />
              <span>Curriculum</span>
            </button>
          )}

          {/* ── Left: Lecture Content ── */}
          <div className="cv-content-panel">
            <div className="cv-lecture-card">
              {/* Header */}
              <div className="cv-lecture-header">
                <div className="cv-lecture-label">
                  Section {currentModuleIndex + 1} · {currentModule?.title} &nbsp;·&nbsp; Lecture {currentTopicIndex + 1}
                </div>
                <h2 className="cv-lecture-title">{currentTopic?.title || 'Lecture Content'}</h2>
              </div>

              {/* Body */}
              <div className="cv-lecture-body">
                <LectureMarkdown
                  content={currentTopic?.contentMd || currentTopic?.content_md || currentTopic?.description || 'No lecture content has been added yet.'}
                />

                {/* ── Topic MCQ Assessment & Quiz ── */}
                {(() => {
                  const isLastTopicInModule = currentTopicIndex === topics.length - 1;
                  const activeQuizQuestions = (Array.isArray(currentTopic?.quizQuestions) && currentTopic.quizQuestions.length > 0)
                    ? currentTopic.quizQuestions
                    : (isLastTopicInModule && Array.isArray(currentModule?.quizQuestions) && currentModule.quizQuestions.length > 0 ? currentModule.quizQuestions : []);

                  if (activeQuizQuestions.length === 0) return null;

                  return (
                    <div id="topic-assessment-section" className="mt-4 pt-3 border-top" style={{ borderColor: 'var(--border-color)' }}>
                      <TopicQuiz
                        questions={activeQuizQuestions}
                        topicTitle={currentTopic.title}
                        topicId={currentTopic.id}
                        savedAttempt={student?.quizAttempts?.[currentTopic.id]}
                        onSaveAttempt={(attemptData) => {
                          if (saveQuizAttempt) {
                            saveQuizAttempt({
                              studentId: student?.id,
                              courseId: activeCourse?.id,
                              topicId: currentTopic?.id,
                              ...attemptData
                            });
                          }
                          if (attemptData.passed && currentTopic?.id && markTopicComplete && student?.id && activeCourse?.id) {
                            markTopicComplete(student.id, currentTopic.id, activeCourse.id);
                            if (isLastLecture) {
                              handleCompleteCourse(true);
                            }
                          }
                        }}
                      />
                    </div>
                  );
                })()}

                {/* ── Desktop Inline Navigation ── */}
                <div className="cv-inline-nav">
                  <button
                    type="button"
                    className="btn btn-outline-secondary d-flex align-items-center gap-2 px-4 py-2 rounded-3"
                    onClick={handlePrevLecture}
                    disabled={isFirstLecture}
                  >
                    <FaArrowLeft size={12} /> Previous
                  </button>

                  <div className="d-flex align-items-center gap-2">
                    {isCurrentTopicCompleted ? (
                      <span
                        className="badge d-inline-flex align-items-center gap-1.5 px-3 py-2 rounded-3"
                        style={{
                          background: 'rgba(var(--bs-success-rgb, 22, 163, 74), 0.12)',
                          color: 'var(--bs-success, #16a34a)',
                          border: '1px solid rgba(var(--bs-success-rgb, 22, 163, 74), 0.3)',
                          fontSize: '0.85rem',
                          fontWeight: 600
                        }}
                      >
                        <FaCheckCircle size={13} />
                        <span>Completed</span>
                      </span>
                    ) : currentHasQuiz ? (
                      <span
                        className="badge d-inline-flex align-items-center gap-1.5 px-3 py-2 rounded-3"
                        style={{
                          background: 'rgba(234, 179, 8, 0.12)',
                          color: '#ca8a04',
                          border: '1px solid rgba(234, 179, 8, 0.3)',
                          fontSize: '0.85rem',
                          fontWeight: 600
                        }}
                      >
                        <FaLock size={12} />
                        <span>Assessment Incomplete</span>
                      </span>
                    ) : null}

                    {(currentModule?.testId || currentModule?.test || currentModule?.hasTest) && (
                      <button
                        type="button"
                        className="btn btn-outline-primary d-flex align-items-center gap-2 px-3 py-2 rounded-3"
                        onClick={() => navigate(currentModule?.testId ? `/student/tests?testId=${currentModule.testId}` : '/student/tests')}
                      >
                        <FaClipboardList size={13} /> Module Test
                      </button>
                    )}
                  </div>

                  {isLastLecture ? (
                    isCurrentTopicCompleted ? (
                      <button
                        type="button"
                        className="btn btn-success d-flex align-items-center gap-2 px-4 py-2 rounded-3"
                        onClick={() => navigate('/student/certificates')}
                      >
                        <FaAward size={13} /> View Certificate
                      </button>
                    ) : currentHasQuiz ? (
                      <button
                        type="button"
                        className="btn btn-warning text-dark fw-semibold d-flex align-items-center gap-2 px-4 py-2 rounded-3"
                        onClick={() => document.getElementById('topic-assessment-section')?.scrollIntoView({ behavior: 'smooth' })}
                      >
                        Complete Quiz Below <FaArrowRight size={12} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-success d-flex align-items-center gap-2 px-4 py-2 rounded-3 fw-bold"
                        onClick={handleCompleteCourse}
                      >
                        Finish Course <FaCheckCircle size={13} />
                      </button>
                    )
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-3"
                      onClick={handleNextLecture}
                    >
                      Next <FaArrowRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Desktop Curriculum Sidebar ── */}
          {!isSidebarHidden && (
            <aside className="cv-sidebar d-none d-lg-flex flex-column" aria-label="Course curriculum">
              <CurriculumNavigator
                course={activeCourse}
                modules={modules}
                currentModuleIndex={currentModuleIndex}
                currentTopicIndex={currentTopicIndex}
                expandedSections={expandedSections}
                onToggleSection={handleToggleSection}
                onSelectLecture={handleSelectLecture}
                studentProgress={student?.progress || {}}
                quizAttempts={student?.quizAttempts || {}}
                progressPct={activeStats.progressPct}
                isOpen={false}
                onClose={() => { }}
                unlockedTopicIds={unlockedTopicIds}
              />
            </aside>
          )}

          {/* ── Mobile Drawer ── */}
          {mobileDrawerOpen && (
            <>
              <div
                className="cv-drawer-backdrop d-lg-none"
                onClick={() => setMobileDrawerOpen(false)}
                aria-hidden="true"
              />
              <div
                className="cv-drawer d-lg-none"
                role="dialog"
                aria-modal="true"
                aria-label="Course curriculum navigator"
              >
                <CurriculumNavigator
                  course={activeCourse}
                  modules={modules}
                  currentModuleIndex={currentModuleIndex}
                  currentTopicIndex={currentTopicIndex}
                  expandedSections={expandedSections}
                  onToggleSection={handleToggleSection}
                  onSelectLecture={handleSelectLecture}
                  studentProgress={student?.progress || {}}
                  quizAttempts={student?.quizAttempts || {}}
                  progressPct={activeStats.progressPct}
                  isOpen={mobileDrawerOpen}
                  onClose={() => setMobileDrawerOpen(false)}
                  unlockedTopicIds={unlockedTopicIds}
                />
              </div>
            </>
          )}
        </div>

        {/* ── Mobile Sticky Bottom Dock ── */}
        <div className="cv-bottom-dock d-lg-none" role="navigation" aria-label="Lecture navigation">
          <button
            type="button"
            className="cv-dock-nav-btn"
            onClick={handlePrevLecture}
            disabled={isFirstLecture}
            aria-label="Previous lecture"
          >
            <FaArrowLeft size={12} />
            <span>Prev</span>
          </button>

          <div
            className={`cv-dock-complete-btn ${isCurrentTopicCompleted ? 'done' : ''}`}
            style={{ cursor: 'default' }}
          >
            <FaCheckCircle size={14} />
            <span>{isCurrentTopicCompleted ? 'Completed' : 'In Progress'}</span>
          </div>

          {isLastLecture ? (
            isCurrentTopicCompleted ? (
              <button
                type="button"
                className="cv-dock-nav-btn text-success fw-bold"
                onClick={() => navigate('/student/certificates')}
                aria-label="View Certificate"
              >
                <span>Cert</span>
                <FaAward size={12} />
              </button>
            ) : currentHasQuiz ? (
              <button
                type="button"
                className="cv-dock-nav-btn text-warning fw-bold"
                onClick={() => document.getElementById('topic-assessment-section')?.scrollIntoView({ behavior: 'smooth' })}
                aria-label="Complete Quiz"
              >
                <span>Quiz</span>
                <FaLock size={12} />
              </button>
            ) : (
              <button
                type="button"
                className="cv-dock-nav-btn text-success fw-bold"
                onClick={handleCompleteCourse}
                aria-label="Finish Course"
              >
                <span>Finish</span>
                <FaCheckCircle size={12} />
              </button>
            )
          ) : (
            <button
              type="button"
              className="cv-dock-nav-btn"
              onClick={handleNextLecture}
              aria-label="Next lecture"
            >
              <span>Next</span>
              <FaArrowRight size={12} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // VIEW 1 – MY COURSES HUB
  // ══════════════════════════════════════════════════════════
  return (
    <div className="student-courses-hub pb-5">
      {/* Header */}
      <div className="mb-4 d-flex align-items-center gap-2">
        <FaBook style={{ color: 'var(--bs-primary)', fontSize: '1.1rem' }} />
        <h4 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>My Courses</h4>
      </div>

      {allAvailableCourses.length === 0 ? (
        <div className="cv-empty">
          <FaBook size={48} className="cv-empty-icon" />
          <div className="cv-empty-title">No Courses Yet</div>
          <p className="cv-empty-text">Your cohort hasn't been assigned courses yet. Check back once your batch commences.</p>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-4">
          {allAvailableCourses.map(course => {
            const stats = getCourseStats(course);
            const isCompleted = stats.progressPct === 100;
            const hasStarted = stats.completedTopics > 0;

            return (
              <div key={course.id} className="col d-flex">
                <div className="cv-course-card w-100">
                  {/* Technology Icon Thumbnail */}
                  <CourseTechThumbnail
                    course={course}
                    height={160}
                    className="rounded-top-3"
                  />

                  {/* Body */}
                  <div className="cv-course-body">
                    {/* Badge row */}
                    <div className="cv-course-badge-row">
                      {isCompleted ? (
                        <span className="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill" style={{ fontSize: '0.72rem' }}>
                          <FaCheck size={9} /> Completed
                        </span>
                      ) : hasStarted ? (
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill" style={{ fontSize: '0.72rem' }}>
                          <FaPlay size={8} /> In Progress
                        </span>
                      ) : (
                        <span className="badge bg-secondary-subtle text-muted border border-secondary-subtle d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill" style={{ fontSize: '0.72rem' }}>
                          Not Started
                        </span>
                      )}
                    </div>

                    <h5 className="cv-course-title">{course.title}</h5>
                    <p className="cv-course-desc">{course.description}</p>

                    {/* Progress */}
                    <div className="cv-course-progress-row">
                      <div className="cv-course-progress-top">
                        <span className="cv-course-progress-label">Progress</span>
                        <span className="cv-course-progress-pct">{stats.progressPct}%</span>
                      </div>
                      <div className="cv-course-progress-bar">
                        <div className="cv-course-progress-fill" style={{ width: `${stats.progressPct}%` }} />
                      </div>
                      <div className="cv-course-progress-sub">
                        <span>{stats.completedTopics} of {stats.totalTopics} lectures</span>
                        <span>{stats.totalModules} sections</span>
                      </div>
                    </div>

                    {/* CTA */}
                    <button
                      type="button"
                      className="cv-course-action-btn"
                      onClick={() => handleSelectCourse(course.id)}
                    >
                      <FaPlay size={11} />
                      <span>{isCompleted ? 'Review Course' : hasStarted ? 'Continue Learning' : 'Start Course'}</span>
                    </button>
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
