import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import toast from 'react-hot-toast';
import { FaCertificate, FaDownload, FaPrint, FaTimes, FaAward, FaShieldAlt } from 'react-icons/fa';
import { FiAward } from 'react-icons/fi';
import CertificateDocument from '../common/CertificateDocument';
import { getCertificateDesign, generateCertificatePDF, generateCertificatePNG } from '../../services/certificateUtils';

function CertificatePrintView({ cert, onClose }) {
  const { certificateTemplates = [], platformSettings = {} } = useData();
  const certRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const design = getCertificateDesign(cert, certificateTemplates, platformSettings);
  const studentName = cert.studentName || 'Student';
  const courseName = cert.courseName || cert.courseTitle || 'Full Stack Web Engineering';
  const certId = cert.certificateId || cert.id || 'CERT-2026-0001';

  const handleDownload = async () => {
    if (!certRef.current) return;
    setIsDownloading(true);
    try {
      await generateCertificatePDF(certRef.current, {
        studentName,
        courseName,
        certId,
        backgroundColor: design.bgType === 'solid' ? design.backgroundColor : design.gradientStart,
      });
      toast.success('Certificate PDF generated! Full-bleed A4 landscape downloaded.');
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to generate PDF: ' + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadPNG = async () => {
    if (!certRef.current) return;
    setIsDownloading(true);
    try {
      await generateCertificatePNG(certRef.current, {
        studentName,
        courseName,
        backgroundColor: design.bgType === 'solid' ? design.backgroundColor : design.gradientStart,
      });
      toast.success('Certificate image (PNG) downloaded in ultra high resolution!');
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to generate image: ' + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          background: 'var(--card-bg, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: 20,
          maxWidth: 900,
          width: '100%',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '94vh',
        }}
      >
        {/* Actions bar (Hidden in Print) */}
        <div
          style={{
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--card-bg)',
          }}
          className="no-print"
        >
          <div className="d-flex align-items-center gap-2">
            <FaAward style={{ color: design.accentColor, fontSize: '1.2rem' }} />
            <div>
              <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                Official Accreditation Certificate
              </span>
              <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                Full-Bleed A4 Landscape • 300 DPI High Resolution
              </div>
            </div>
          </div>

          <div className="d-flex gap-2 align-items-center">
            <button
              onClick={() => window.print()}
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1.5"
              title="Native browser print dialog"
            >
              <FaPrint /> Print
            </button>

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              style={{
                padding: '8px 18px',
                background: design.accentColor || 'var(--bs-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: 'inherit',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              <FaDownload /> {isDownloading ? 'Generating...' : 'Download PDF'}
            </button>

            <button
              onClick={handleDownloadPNG}
              disabled={isDownloading}
              className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1.5 fw-semibold"
              title="Download high-resolution image"
            >
              <FaDownload /> PNG
            </button>

            <button
              onClick={onClose}
              style={{
                padding: '8px 12px',
                background: 'var(--bg-body)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Certificate Display Area */}
        <div
          style={{
            padding: '28px',
            background: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          <div
            id="certificate-print"
            className="certificate-print-area shadow-2xl rounded-2 w-100"
            style={{ maxWidth: 820 }}
          >
            <CertificateDocument
              ref={certRef}
              design={design}
              studentName={studentName}
              courseName={courseName}
              certId={certId}
              issuedAt={cert.issuedAt}
              isInteractive={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudentCertificates() {
  const { auth } = useAuth();
  const { students = [], certificates = [], courses = [], certificateTemplates = [], batches = [], enrollments = [] } = useData();

  const student = students.find(s => s.id === auth?.studentId || s.legacyId === auth?.studentId || s.id === auth?.userId || s.email === auth?.email);
  const myCerts = certificates.filter(c =>
    (c.studentId === student?.id || (student?.legacyId && c.studentId === student?.legacyId)) &&
    !c.isRevoked &&
    (c.status === 'issued' || c.status === 'approved' || (c.isIssued && c.status !== 'pending' && c.status !== 'pending_approval'))
  );
  const [viewCert, setViewCert] = useState(null);

  // Use robust batch-aware & enrollment-aware lookup without phantom fallbacks
  const batch = batches?.find(b => b.id === student?.batchId);
  const myCourses = courses.filter(c => {
    if (c.isPublished === false) return false;

    // 1. Matched via student's batch
    let isBatchAssigned = false;
    if (student?.batchId) {
      if (Array.isArray(batch?.courseIds) && batch.courseIds.includes(c.id)) isBatchAssigned = true;
      if (c.batchId === student.batchId || (Array.isArray(c.batchIds) && c.batchIds.includes(student.batchId))) isBatchAssigned = true;
    }
    if (isBatchAssigned) return true;

    // 2. Direct student enrollment (APPROVED, ACTIVE, PAID, FREE)
    const isEnrolled = enrollments.some(
      e => (e.studentId === student?.id || e.studentId === auth?.studentId || e.student_id === student?.id || e.student_id === auth?.studentId) &&
        (e.courseId === c.id || e.courseId === c.slug || e.course_id === c.id || e.course_id === c.slug) &&
        ['APPROVED', 'ACTIVE', 'PAID', 'FREE'].includes(e.status)
    );
    if (isEnrolled) return true;

    return false;
  });

  // Strict check: if no courses are allotted to the batch, myCourse is strictly null
  const myCourse = myCourses.length > 0 ? myCourses[0] : null;

  const allTopics = myCourses.flatMap(c =>
    Array.isArray(c.modules) ? c.modules.flatMap(m => Array.isArray(m.topics) ? m.topics : []) : []
  );
  const completedTopics = allTopics.filter(t =>
    student?.progress?.[t.id] === 'completed' || student?.progress?.[t.id] === true || student?.quizAttempts?.[t.id]?.passed
  );
  const progress = allTopics.length ? Math.round((completedTopics.length / allTopics.length) * 100) : 0;
  const alreadyCertified = myCerts.some(c =>
    myCourses.some(mc => mc.title === c.courseName || mc.title === c.courseTitle)
  );
  const isPendingAdminIssuance = myCourses.length > 0 && progress === 100 && !alreadyCertified;

  return (
    <div>
      {/* Header */}
      <div className="mb-3">
        <h4 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>My Certificates</h4>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
          {myCerts.length} verified certificate(s) issued to your profile
        </p>
      </div>

      {/* Progress & Issuance Status Card - Only shown when student actually has allotted course(s) */}
      {myCourse && !alreadyCertified && (
        <div
          className="card border rounded-4 mb-3"
          style={{
            background: isPendingAdminIssuance ? 'linear-gradient(135deg, rgba(217, 119, 6, 0.12), rgba(217, 119, 6, 0.05))' : 'var(--card-bg)',
            borderColor: isPendingAdminIssuance ? 'rgba(217, 119, 6, 0.3)' : 'var(--border-color)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          }}
        >
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div style={{ flex: 1, minWidth: '260px' }}>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h6 style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 0 }}>
                    {myCourse.title}
                  </h6>
                  {isPendingAdminIssuance ? (
                    <span className="badge bg-warning text-dark border">
                      Awaiting Admin Issuance
                    </span>
                  ) : (
                    <span className="badge bg-primary">
                      {progress}% Completed
                    </span>
                  )}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 12 }}>
                  {isPendingAdminIssuance
                    ? 'Congratulations on completing 100% of your course curriculum! Your certificate has been submitted for administrative review and official credential issuance.'
                    : `Complete all topics to earn your official certificate. ${completedTopics.length}/${allTopics.length} topics done (${progress}%).`}
                </p>
                <div style={{ height: 8, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden', maxWidth: 420 }}>
                  <div
                    style={{
                      width: `${progress}%`,
                      height: '100%',
                      background: isPendingAdminIssuance ? '#D97706' : 'var(--bs-primary)',
                      borderRadius: 4,
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
              </div>

              {isPendingAdminIssuance && (
                <div className="p-3 rounded-3 border text-center shadow-sm" style={{ background: 'var(--card-bg)' }}>
                  <div className="small fw-bold text-muted text-uppercase mb-1">Status</div>
                  <div className="fw-bold text-warning d-flex align-items-center gap-1.5 justify-content-center">
                    <FaShieldAlt /> Under Academy Review
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Certificates List & Empty States */}
      {myCerts.length === 0 ? (
        myCourses.length === 0 ? (
          <div className="empty-state text-center p-5 rounded-4 border" style={{ background: 'var(--card-bg)' }}>
            <div className="mb-3">
              <FiAward size={48} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
            </div>
            <h5 className="fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {student?.batchId ? 'No Courses Allotted to Your Batch' : 'No Batch Assigned'}
            </h5>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto', fontSize: '0.875rem', lineHeight: 1.6 }}>
              {student?.batchId
                ? 'Your assigned batch currently does not have any active curriculum allotted. Once your academy administrators assign courses to your batch, your course progression and certificate eligibility will appear here.'
                : 'You are not currently enrolled in an active batch. Please contact academy administration for batch and course allocation.'}
            </p>
          </div>
        ) : (
          <div className="empty-state">
            <FiAward size={48} />
            <h3>No certificates issued yet</h3>
            <p>Complete all modules and topics in your curriculum. Once verified by your academy faculty, your credentials will appear here.</p>
          </div>
        )
      ) : (
        <div className="row g-4">
          {myCerts.map(cert => {
            const certDesign = getCertificateDesign(cert, certificateTemplates);
            const certAccent = certDesign.accentColor || '#15803D';

            return (
              <div key={cert.id} className="col-md-6">
                <div
                  className="card border rounded-4 h-100 shadow-sm transition overflow-hidden"
                  style={{
                    background: certDesign.bgStyle,
                    borderColor: certDesign.borderColor || 'var(--border-color)',
                    borderWidth: Math.min(certDesign.borderWidth, 3),
                    borderStyle: certDesign.borderStyle || 'solid',
                  }}
                >
                  <div className="card-body p-4 d-flex flex-column justify-content-between">
                    <div>
                      {certDesign.showRibbon && (
                        <div
                          style={{
                            background: certDesign.ribbonColor || certAccent,
                            color: '#fff',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            letterSpacing: '2px',
                            textAlign: 'center',
                            padding: '3px 0',
                            borderRadius: '4px',
                            marginBottom: '12px',
                            textTransform: 'uppercase',
                          }}
                        >
                          {certDesign.ribbonText}
                        </div>
                      )}

                      <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        <div className="mb-2"><FaAward size={36} className="text-primary" /></div>
                        <h6 style={{ fontWeight: 800, color: certDesign.isDark ? '#F1F5F9' : '#0F172A', marginBottom: 4 }}>
                          {cert.courseName}
                        </h6>
                        <p style={{ fontSize: '0.85rem', color: certDesign.isDark ? '#94A3B8' : '#64748B', marginBottom: 0 }}>
                          {cert.certTitle || certDesign.certTitle}
                        </p>
                      </div>

                      <div
                        className="rounded-3 p-3 mb-3 border"
                        style={{
                          background: certDesign.isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1.5" style={{ fontSize: '0.8rem' }}>
                          <span style={{ color: certDesign.isDark ? '#94A3B8' : '#64748B' }}>Credential ID</span>
                          <span style={{ fontWeight: 700, color: certAccent, fontFamily: 'monospace' }}>
                            {cert.certificateId}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center" style={{ fontSize: '0.8rem' }}>
                          <span style={{ color: certDesign.isDark ? '#94A3B8' : '#64748B' }}>Issued Date</span>
                          <span style={{ fontWeight: 600, color: certDesign.isDark ? '#F1F5F9' : '#0F172A' }}>
                            {new Date(cert.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex gap-2 mt-2">
                      <button
                        onClick={() => setViewCert(cert)}
                        style={{
                          flex: 1,
                          background: certAccent,
                          color: '#fff',
                          border: 'none',
                          borderRadius: 10,
                          padding: '11px',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                        }}
                      >
                        <FaDownload /> View & Download PDF (A4)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Print / Preview Modal */}
      {viewCert && <CertificatePrintView cert={viewCert} onClose={() => setViewCert(null)} />}
    </div>
  );
}
