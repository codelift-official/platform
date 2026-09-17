import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import toast from 'react-hot-toast';
import { FaUpload, FaTimes, FaCheckCircle, FaClock, FaStar, FaClipboardList } from 'react-icons/fa';
import { FiClipboard } from 'react-icons/fi';

function statusInfo(assignment, submission) {
  if (!submission) {
    const isOverdue = new Date(assignment.deadline) < new Date();
    return {
      label: isOverdue ? 'Overdue' : 'Not Submitted',
      color: isOverdue ? '#BE123C' : '#D97706',
      bg: isOverdue ? '#FEF2F2' : '#FFFBEB',
      border: isOverdue ? '#FECACA' : '#FDE68A',
      icon: <FaClock />,
    };
  }
  if (submission.grade !== null && submission.grade !== undefined) {
    return {
      label: `Graded: ${submission.grade}/${assignment.maxMarks}`,
      color: '#15803D',
      bg: '#F0FDF4',
      border: '#BBF7D0',
      icon: <FaStar />,
    };
  }
  return {
    label: 'Submitted',
    color: '#1D4ED8',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    icon: <FaCheckCircle />,
  };
}

export default function StudentAssignments() {
  const { auth } = useAuth();
  const { students, assignments, submissions, addSubmission, batches } = useData();

  const student = (students || []).find(s =>
    (auth?.studentId && (s.id === auth.studentId || s.legacyId === auth.studentId)) ||
    (auth?.id && (s.id === auth.id || s.legacyId === auth.id)) ||
    (auth?.userId && (s.id === auth.userId || s.legacyId === auth.userId)) ||
    (auth?.email && s.email?.toLowerCase() === auth.email?.toLowerCase())
  );

  const studentBatchIds = Array.from(new Set([
    student?.batchId,
    ...(batches || []).filter(b => b.studentIds?.includes(student?.id) || b.studentIds?.includes(student?.legacyId)).map(b => b.id)
  ].filter(Boolean)));

  const myAssignments = (assignments || [])
    .filter(a => {
      const allowed = [...(a.batchIds || []), ...(a.assignedBatchIds || []), ...(a.batchId ? [a.batchId] : [])];
      return studentBatchIds.some(bId => allowed.includes(bId));
    })
    .sort((a, b) => new Date(a.deadline || a.dueDate) - new Date(b.deadline || b.dueDate));

  const [submitModal, setSubmitModal] = useState(null);
  const [notes, setNotes] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [viewModal, setViewModal] = useState(null);

  const getSubmission = (assignmentId) =>
    (submissions || []).find(
      s => (s.studentId === student?.id || (student?.legacyId && s.studentId === student.legacyId)) && s.assignmentId === assignmentId
    );

  const handleSubmit = () => {
    if (!fileUrl.trim() && !notes.trim()) {
      toast.error('Please add a link or notes before submitting.');
      return;
    }
    const targetStudentId = student?.id || auth?.studentId || auth?.id || auth?.userId;
    addSubmission({
      studentId: targetStudentId,
      assignmentId: submitModal.id,
      fileUrls: fileUrl.trim() ? [fileUrl.trim()] : [],
      notes: notes.trim(),
    });
    setSubmitModal(null);
    setNotes('');
    setFileUrl('');
    toast.success('Assignment submitted successfully!');
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-3">
        <h4 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>My Assignments</h4>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
          {myAssignments.length} assignments in your batch · {myAssignments.filter(a => getSubmission(a.id)).length} submitted
        </p>
      </div>

      {myAssignments.length === 0 ? (
        <div className="empty-state">
          <FiClipboard size={48} />
          <h3>No assignments yet</h3>
          <p>Your instructor has not posted any assignments for your batch yet.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {myAssignments.map(assignment => {
            const sub = getSubmission(assignment.id);
            const status = statusInfo(assignment, sub);
            const daysLeft = Math.ceil((new Date(assignment.deadline) - new Date()) / (1000 * 60 * 60 * 24));
            const isOverdue = daysLeft < 0;

            return (
              <div
                key={assignment.id}
                className="card border rounded-4"
                style={{ background: 'var(--card-bg)', borderColor: sub ? status.border : 'var(--border-color)', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}
              >
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                    <div style={{ flex: 1 }}>
                      <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                        <h6 style={{ fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{assignment.title}</h6>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 10px', borderRadius: '50px', background: status.bg, color: status.color, border: `1px solid ${status.border}`, display: 'flex', alignItems: 'center', gap: 4 }}>
                          {status.icon} {status.label}
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 12, lineHeight: 1.6 }}>{assignment.description}</p>
                      <div className="d-flex gap-3 flex-wrap" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        <span>
                          <strong>Max Marks:</strong> {assignment.maxMarks}
                        </span>
                        <span style={{ color: isOverdue && !sub ? '#BE123C' : 'var(--text-secondary)' }}>
                          <strong>Deadline:</strong> {new Date(assignment.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {!sub && !isOverdue && ` (${daysLeft} days left)`}
                          {!sub && isOverdue && ' (Overdue)'}
                        </span>
                      </div>

                      {/* Submission feedback */}
                      {sub?.feedback && (
                        <div style={{ marginTop: 12, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '10px 14px' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803D', marginBottom: 3 }}>Mentor Feedback</div>
                          <p style={{ margin: 0, fontSize: '0.875rem', color: '#171717' }}>{sub.feedback}</p>
                        </div>
                      )}
                    </div>

                    <div className="d-flex gap-2 flex-wrap align-items-start">
                      {sub && (
                        <button
                          onClick={() => setViewModal({ assignment, sub })}
                          style={{ padding: '8px 14px', borderRadius: 9, border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                          View Submission
                        </button>
                      )}
                      {!sub && (
                        <button
                          onClick={() => { setSubmitModal(assignment); setNotes(''); setFileUrl(''); }}
                          style={{
                            padding: '9px 16px',
                            borderRadius: 9,
                            border: 'none',
                            background: isOverdue ? '#6B7280' : 'var(--bs-primary)',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <FaUpload style={{ fontSize: '0.75rem' }} /> {isOverdue ? 'Submit Late' : 'Submit'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submit Modal */}
      {submitModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setSubmitModal(null); }}
        >
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 32, maxWidth: 520, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', color: 'var(--text-primary)' }}>
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>Submit Assignment</h5>
                <p className="small mb-0 text-muted">{submitModal.title}</p>
              </div>
              <button onClick={() => setSubmitModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-secondary)' }}><FaTimes /></button>
            </div>

            <div className="mb-3">
              <label style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>GitHub / Drive Link</label>
              <input
                type="url"
                value={fileUrl}
                onChange={e => setFileUrl(e.target.value)}
                placeholder="https://github.com/yourusername/project"
                style={{ width: '100%', padding: '11px 14px', background: 'var(--bg-body)', color: 'var(--text-primary)', border: '2px solid var(--border-color)', borderRadius: 10, fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none' }}
                onFocus={e => { e.target.style.borderColor = 'var(--bs-primary)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border-color)'; }}
              />
            </div>
            <div className="mb-4">
              <label style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Notes / Comments</label>
              <textarea
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Describe your approach, challenges faced, or any notes for your mentor..."
                style={{ width: '100%', padding: '11px 14px', background: 'var(--bg-body)', color: 'var(--text-primary)', border: '2px solid var(--border-color)', borderRadius: 10, fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', resize: 'vertical' }}
                onFocus={e => { e.target.style.borderColor = 'var(--bs-primary)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border-color)'; }}
              />
            </div>
            <div className="d-flex gap-2">
              <button
                onClick={handleSubmit}
                style={{ flex: 1, background: 'var(--bs-primary)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.95rem' }}
                className="shadow-sm"
              >
                Submit Assignment →
              </button>
              <button
                onClick={() => setSubmitModal(null)}
                style={{ background: 'var(--bg-body)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '12px 20px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Submission Modal */}
      {viewModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setViewModal(null); }}
        >
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 32, maxWidth: 480, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', color: 'var(--text-primary)' }}>
            <div className="d-flex justify-content-between align-items-start mb-3">
              <h5 className="fw-bold" style={{ color: 'var(--text-primary)' }}>Submission Details</h5>
              <button onClick={() => setViewModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-secondary)' }}><FaTimes /></button>
            </div>
            <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--bs-primary)', marginBottom: 16 }}>{viewModal.assignment.title}</p>
            {viewModal.sub.fileUrls?.length > 0 && (
              <div className="mb-3">
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>SUBMISSION LINK</div>
                <a href={viewModal.sub.fileUrls[0]} target="_blank" rel="noreferrer" style={{ color: 'var(--bs-primary)', wordBreak: 'break-all', fontSize: '0.875rem' }}>{viewModal.sub.fileUrls[0]}</a>
              </div>
            )}
            {viewModal.sub.notes && (
              <div className="mb-3">
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>YOUR NOTES</div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{viewModal.sub.notes}</p>
              </div>
            )}
            {viewModal.sub.grade !== null && viewModal.sub.grade !== undefined && (
              <div style={{ background: 'rgba(var(--bs-primary-rgb), 0.08)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                <div style={{ fontWeight: 800, color: 'var(--bs-primary)', fontSize: '1.2rem' }}>
                  {viewModal.sub.grade}/{viewModal.assignment.maxMarks}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--bs-primary)' }}>Grade Received</div>
                {viewModal.sub.feedback && <p style={{ margin: '8px 0 0', fontSize: '0.875rem', color: 'var(--text-primary)' }}>{viewModal.sub.feedback}</p>}
              </div>
            )}
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Submitted on {new Date(viewModal.sub.submittedAt).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
