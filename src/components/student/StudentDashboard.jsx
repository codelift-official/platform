import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Link } from 'react-router-dom';
import { FaBook, FaClipboardList, FaFileAlt, FaMoneyBillWave, FaCertificate, FaArrowRight, FaCheckCircle, FaCopy, FaCode } from 'react-icons/fa';
import toast from 'react-hot-toast';

function progressPercent(student, courses, batch) {
  if (!courses || !courses.length) return 0;
  const batchCourses = courses.filter(c => {
    if (c.isPublished === false) return false;
    if (student?.batchId) {
      if (Array.isArray(batch?.courseIds) && batch.courseIds.includes(c.id)) return true;
      return c.batchId === student.batchId || c.batchIds?.includes(student.batchId);
    }
    return false;
  });
  const targetCourses = batchCourses.length > 0 ? batchCourses : courses.slice(0, 1);
  const allTopics = targetCourses.flatMap(c => Array.isArray(c.modules) ? c.modules.flatMap(m => m.topics || []) : []);
  if (!allTopics.length) return 0;
  const done = allTopics.filter(t => t?.id && (student?.progress?.[t.id] === 'completed' || student?.progress?.[t.id] === true || student?.quizAttempts?.[t.id]?.passed)).length;
  return Math.round((done / allTopics.length) * 100);
}

function StatCard({ icon, label, value, color, to }) {
  const content = (
    <div
      className="card border-0 rounded-4 h-100 dashboard-kpi-card"
      style={{ background: 'var(--card-bg)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', transition: 'all 0.2s ease', cursor: to ? 'pointer' : 'default' }}
      onMouseEnter={e => { if (to) e.currentTarget.style.transform = 'translateY(-3px)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
    >
      <div className="card-body p-3">
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontSize: '1.1rem', marginBottom: 10 }}>
          {icon}
        </div>
        <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color, lineHeight: 1, marginBottom: 4 }}>{value}</h3>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  );
  return to ? <Link to={to} style={{ textDecoration: 'none' }}>{content}</Link> : content;
}

export default function StudentDashboard() {
  const { auth } = useAuth();
  const {
    students,
    batches,
    completedBatches = [],
    assignments,
    submissions,
    testAttempts,
    certificates,
    courses,
    enrollments = [],
    codingProblems = [],
    codingAttempts = [],
    problemAttempts = [],
    getBatchHistory
  } = useData();

  const student = Array.isArray(students)
    ? students.find(s =>
      (auth?.studentId && (s.id === auth.studentId || s.legacyId === auth.studentId)) ||
      (auth?.id && (s.id === auth.id || s.legacyId === auth.id)) ||
      (auth?.userId && (s.id === auth.userId || s.legacyId === auth.userId)) ||
      (auth?.email && s.email?.toLowerCase() === auth.email?.toLowerCase())
    )
    : null;

  const studentBatchIds = Array.from(new Set([
    student?.batchId,
    ...(batches || []).filter(b => b.studentIds?.includes(student?.id) || b.studentIds?.includes(student?.legacyId)).map(b => b.id)
  ].filter(Boolean)));

  const batch = Array.isArray(batches) ? batches.find(b => studentBatchIds.includes(b.id)) : null;
  const historyBatches = getBatchHistory ? getBatchHistory(student?.id) : [];

  const batchCourses = Array.isArray(courses)
    ? courses.filter(c => {
      if (c.isPublished === false) return false;
      let isBatchAssigned = false;
      if (studentBatchIds.length > 0) {
        if (Array.isArray(batch?.courseIds) && batch.courseIds.includes(c.id)) isBatchAssigned = true;
        if (studentBatchIds.includes(c.batchId) || studentBatchIds.some(bId => c.batchIds?.includes(bId))) isBatchAssigned = true;
      }
      if (isBatchAssigned) return true;

      // Check student enrollment for elective courses
      const isEnrolled = (enrollments || []).some(
        e => (e.studentId === student?.id || e.studentId === auth?.studentId || e.student_id === student?.id || e.student_id === auth?.studentId) &&
          (e.courseId === c.id || e.courseId === c.slug || e.course_id === c.id || e.course_id === c.slug) &&
          ['APPROVED', 'ACTIVE', 'PAID'].includes(e.status)
      );
      return isEnrolled;
    })
    : [];
  const activeCourses = batchCourses;
  const allTopics = activeCourses.flatMap(c => (c.modules || []).flatMap(m => Array.isArray(m?.topics) ? m.topics : []));
  const completedTopics = allTopics.filter(t => t?.id && (student?.progress?.[t.id] === 'completed' || student?.progress?.[t.id] === true || student?.quizAttempts?.[t.id]?.passed));

  const myAssignments = Array.isArray(assignments)
    ? assignments.filter(a => {
      const allowed = [...(a?.batchIds || []), ...(a?.assignedBatchIds || []), ...(a?.batchId ? [a.batchId] : [])];
      return studentBatchIds.some(bId => allowed.includes(bId));
    })
    : [];
  const mySubmissions = Array.isArray(submissions)
    ? submissions.filter(s => s?.studentId === student?.id || (student?.legacyId && s?.studentId === student?.legacyId))
    : [];
  const myAttempts = Array.isArray(testAttempts)
    ? testAttempts.filter(a => a?.studentId === student?.id || (student?.legacyId && a?.studentId === student?.legacyId))
    : [];
  const myCerts = Array.isArray(certificates)
    ? certificates.filter(c => c?.studentId === student?.id || (student?.legacyId && c?.studentId === student?.legacyId))
    : [];

  const myCodingAttempts = Array.isArray(codingAttempts)
    ? codingAttempts.filter(a => a?.studentId === student?.id || (student?.legacyId && a?.studentId === student?.legacyId) || (student?.email && a?.studentId === student?.email))
    : [];
  const myProblemAttempts = Array.isArray(problemAttempts)
    ? problemAttempts.filter(a => a?.studentId === student?.id || (student?.legacyId && a?.studentId === student?.legacyId) || (student?.email && a?.studentId === student?.email))
    : [];
  const solvedCodingProblems = (codingProblems || []).filter(p =>
    myCodingAttempts.some(a => a.problemId === p.id && a.passed) ||
    myProblemAttempts.some(a => a.problemId === p.id && a.passed)
  );

  const progress = allTopics.length > 0
    ? Math.round((completedTopics.length / allTopics.length) * 100)
    : progressPercent(student, courses, batch);

  // Upcoming deadlines
  const upcoming = myAssignments
    .filter(a => {
      const sub = mySubmissions.find(s => s?.assignmentId === a?.id);
      return !sub && a?.deadline && new Date(a.deadline) > new Date();
    })
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 3);

  const pastDeadline = myAssignments.filter(a => {
    const sub = mySubmissions.find(s => s?.assignmentId === a?.id);
    return !sub && a?.deadline && new Date(a.deadline) < new Date();
  });

  return (
    <div>
      {/* Welcome */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--bs-primary) 0%, #166534 100%)',
          borderRadius: 20,
          padding: '24px 28px',
          color: '#fff',
          marginBottom: 16,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -60, right: 60, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.75, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <h3 style={{ fontWeight: 800, marginBottom: 6, fontSize: '1.5rem' }}>
            Welcome back, {student?.name ? student.name.split(' ')[0] : 'Student'}!
            {student?.isGraduated && (
              <span className="badge bg-warning text-dark fs-6 ms-2 align-middle">
                Graduated Alumni
              </span>
            )}
          </h3>
          <p style={{ opacity: 0.85, marginBottom: 20, fontSize: '0.92rem' }}>
            {student?.isGraduated && !batch ? (
              <span>Congratulations! You have completed your cohort program at CodeLift. Your records and certificates are preserved below.</span>
            ) : (
              <span>You're enrolled in <strong>{batch?.name || 'your batch'}</strong>. Keep up the great work!</span>
            )}
          </p>
          {/* Progress bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', opacity: 0.85, marginBottom: 6 }}>
              <span>{batchCourses.length > 1 ? `Curriculum Progress (${batchCourses.length} Cohort Courses)` : 'Curriculum Progress'}</span>
              <span>{completedTopics.length}/{allTopics.length} topics · {progress}%</span>
            </div>
            <div style={{ height: 10, background: 'rgba(255,255,255,0.2)', borderRadius: 5, overflow: 'hidden' }}>
              <div
                style={{ height: '100%', width: `${progress}%`, background: '#fff', borderRadius: 5, transition: 'width 1s ease' }}
              />
            </div>
            {batchCourses.length > 1 && (
              <div className="d-flex gap-2 mt-2 flex-wrap">
                {batchCourses.map((bc) => (
                  <Link
                    key={bc.id}
                    to={`/student/courses?id=${bc.id}`}
                    className="badge text-decoration-none px-2.5 py-1 rounded-pill"
                    style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.73rem' }}
                  >
                    {bc.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="dashboard-kpi-grid row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg">
          <StatCard icon={<FaClipboardList />} label="Total Assignments" value={myAssignments.length} color="#15803D" to="/student/assignments" />
        </div>
        <div className="col-12 col-sm-6 col-lg">
          <StatCard icon={<FaCheckCircle />} label="Submitted" value={mySubmissions.length} color="#1d4ed8" to="/student/assignments" />
        </div>
        <div className="col-12 col-sm-6 col-lg">
          <StatCard icon={<FaCode />} label="Code Arena Solved" value={`${solvedCodingProblems.length}/${codingProblems.length}`} color="#059669" to="/student/arena" />
        </div>
        <div className="col-12 col-sm-6 col-lg">
          <StatCard icon={<FaFileAlt />} label="Tests Taken" value={myAttempts.length} color="#6d28d9" to="/student/tests" />
        </div>
        <div className="col-12 col-sm-6 col-lg">
          <StatCard icon={<FaCertificate />} label="Certificates" value={myCerts.length} color="#d97706" to="/student/certificates" />
        </div>
      </div>

      {/* ── Refer & Earn Section ── */}

      {/* ── Completed Cohorts History Section (If Graduated / Completed Batch) ── */}
      {(student?.isGraduated || historyBatches.length > 0 || (student?.completedBatchIds || []).length > 0) && (
        <div className="card border-0 rounded-4 mb-4 shadow-sm" style={{ background: 'var(--card-bg)' }}>
          <div className="card-body p-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="p-2 rounded-3 bg-success bg-opacity-10 text-success d-inline-flex">
                <FaCertificate size={18} />
              </span>
              <h6 className="fw-bold mb-0" style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>
                Completed Cohort History & Credentials
              </h6>
            </div>
            <div className="row g-3">
              {historyBatches.length > 0 ? (
                historyBatches.map(cb => (
                  <div key={cb.id} className="col-md-6">
                    <div className="p-3 rounded-3 border" style={{ background: 'var(--bg-body)', borderColor: 'var(--border-color)' }}>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <div className="fw-bold" style={{ color: 'var(--text-primary)' }}>{cb.name}</div>
                          <div className="small text-muted">Completed {new Date(cb.completedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</div>
                        </div>
                        <span className="badge bg-success">Graduated</span>
                      </div>
                      <div className="d-flex gap-2 mt-2">
                        <Link to="/student/courses" className="btn btn-sm btn-outline-primary rounded-2 py-1 px-2" style={{ fontSize: '0.75rem' }}>
                          View Materials
                        </Link>
                        <Link to="/student/certificates" className="btn btn-sm btn-outline-success rounded-2 py-1 px-2" style={{ fontSize: '0.75rem' }}>
                          View Certificate
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12">
                  <div className="p-3 rounded-3 border text-muted small" style={{ background: 'var(--bg-body)', borderColor: 'var(--border-color)' }}>
                    Completed batch history snapshot saved. Explore certificates in your portal.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="row g-4">
        {/* Upcoming Deadlines */}
        <div className="col-lg-6">
          <div className="card border-0 rounded-4 h-100" style={{ background: 'var(--card-bg)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <div className="card-body p-4">
              <h6 style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16, fontSize: '0.95rem' }}>
                Upcoming Deadlines
              </h6>
              {upcoming.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px 0', fontSize: '0.875rem' }}>
                  All caught up! No pending assignments.
                </div>
              ) : (
                upcoming.map(a => {
                  const daysLeft = Math.ceil((new Date(a.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: daysLeft <= 2 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, color: daysLeft <= 2 ? '#ef4444' : 'var(--bs-primary)', flexShrink: 0 }}>
                        {daysLeft}d
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Due {new Date(a.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              {pastDeadline.length > 0 && (
                <div style={{ marginTop: 8, fontSize: '0.78rem', color: '#BE123C', fontWeight: 600 }}>
                  {pastDeadline.length} overdue assignment(s) — check your assignments page.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="col-lg-6">
          <div className="card border-0 rounded-4 h-100" style={{ background: 'var(--card-bg)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <div className="card-body p-4">
              <h6 style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16, fontSize: '0.95rem' }}>
                Quick Access
              </h6>
              <div className="d-flex flex-column gap-2">
                {[
                  { to: '/student/courses', icon: <FaBook />, label: 'Continue Learning', sub: `${progress}% complete`, color: '#15803D' },
                  { to: '/student/arena', icon: <FaCode />, label: 'Code Arena', sub: `${solvedCodingProblems.length}/${codingProblems.length} solved`, color: '#059669' },
                  { to: '/student/assignments', icon: <FaClipboardList />, label: 'View Assignments', sub: `${Math.max(0, myAssignments.length - mySubmissions.length)} pending`, color: '#1d4ed8' },
                  { to: '/student/tests', icon: <FaFileAlt />, label: 'Take a Test', sub: `${myAttempts.length} completed`, color: '#6d28d9' },
                  { to: '/student/certificates', icon: <FaCertificate />, label: 'My Certificates', sub: `${myCerts.length} earned`, color: '#d97706' },
                ].map(({ to, icon, label, sub, color }) => (
                  <Link
                    key={to}
                    to={to}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, background: 'var(--bg-body)', border: '1px solid var(--border-color)', textDecoration: 'none', transition: 'all 0.2s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = `${color}08`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'var(--bg-body)'; }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontSize: '0.95rem' }}>
                      {icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{sub}</div>
                    </div>
                    <FaArrowRight style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
