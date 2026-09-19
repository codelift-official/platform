import React, { useRef, useState } from 'react';
import { Modal, Button, Badge } from 'react-bootstrap';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { FaAward, FaPrint, FaShieldAlt, FaClock, FaDownload } from 'react-icons/fa';
import CertificateDocument from '../common/CertificateDocument';
import { getCertificateDesign, generateCertificatePDF } from '../../services/certificateUtils';
import toast from 'react-hot-toast';

export default function CertificateModal({ show, onHide }) {
  const { certificates = [], courses = [], certificateTemplates = [], platformSettings = {} } = useData();
  const { auth, currentStudent } = useAuth();
  const certRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const studentId = currentStudent?.id || auth?.studentId;
  const existingCert = certificates.find((c) =>
    (c.studentId === studentId || (currentStudent?.legacyId && c.studentId === currentStudent.legacyId)) &&
    !c.isRevoked &&
    (c.status === 'issued' || c.status === 'approved' || (c.isIssued && c.status !== 'pending' && c.status !== 'pending_approval'))
  );

  const design = getCertificateDesign(existingCert, certificateTemplates, platformSettings);
  const studentName = existingCert?.studentName || currentStudent?.name || 'Student';
  const courseName = existingCert?.courseName || existingCert?.courseTitle || 'Modern Full Stack Web Engineering';
  const certId = existingCert?.certificateId || existingCert?.id || 'CERT-2026-0001';

  const handleDownloadPDF = async () => {
    if (!certRef.current) return;
    setIsDownloading(true);
    try {
      await generateCertificatePDF(certRef.current, {
        studentName,
        courseName,
        certId,
        backgroundColor: design.bgType === 'solid' ? design.backgroundColor : design.gradientStart,
      });
      toast.success('Certificate downloaded successfully! (A4 Full Bleed)');
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to generate PDF: ' + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="xl">
      <Modal.Header closeButton style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
        <Modal.Title className="fs-5 fw-bold d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <FaAward style={{ color: design.accentColor || 'var(--bs-primary)' }} />
          <span>Official Accreditation Certificate</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4" style={{ background: 'var(--card-bg)' }}>
        {existingCert ? (
          <div className="d-flex flex-column align-items-center">
            {/* Live A4 Landscape Certificate Display */}
            <div
              className="certificate-print-area shadow-lg rounded-3 overflow-hidden w-100"
              style={{ maxWidth: '840px' }}
            >
              <CertificateDocument
                ref={certRef}
                design={design}
                studentName={studentName}
                courseName={courseName}
                certId={certId}
                issuedAt={existingCert.issuedAt}
                isInteractive={false}
              />
            </div>
          </div>
        ) : (
          /* Admin-Only Issuance Notice */
          <div className="text-center py-5">
            <FaClock className="text-warning display-3 mb-3" />
            <h5 className="fw-bold" style={{ color: 'var(--text-primary)' }}>
              Official Certificate Pending Admin Issuance
            </h5>
            <p className="text-muted small max-w-md mx-auto mb-4" style={{ maxWidth: 440 }}>
              Official CodeLift certificates are verified and issued exclusively by Academy Administrators after complete curriculum review and grading. Once your certificate is granted, it will appear here for instant preview and high-resolution PDF download.
            </p>
            <Badge bg="warning" text="dark" className="p-2 px-3 fw-semibold">
              <FaShieldAlt className="me-1" />
              Admin Authorization Required
            </Badge>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
        <Button variant="secondary" size="sm" onClick={onHide}>
          Close
        </Button>
        {existingCert && (
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => window.print()}
              className="d-flex align-items-center gap-1.5"
            >
              <FaPrint size={12} />
              <span>Print</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isDownloading}
              onClick={handleDownloadPDF}
              className="d-flex align-items-center gap-1.5 fw-bold"
              style={{ backgroundColor: design.accentColor, borderColor: design.accentColor }}
            >
              <FaDownload size={12} />
              <span>{isDownloading ? 'Generating PDF...' : 'Download Full-Bleed A4 PDF'}</span>
            </Button>
          </div>
        )}
      </Modal.Footer>
    </Modal>
  );
}
