import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Badge, Row, Col, Form, Modal, Table, Tabs, Tab, ButtonGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useData } from '../../contexts/DataContext';
import {
  FaCertificate,
  FaAward,
  FaCheckCircle,
  FaEye,
  FaShareAlt,
  FaPalette,
  FaPlus,
  FaPrint,
  FaSave,
  FaCheck,
  FaUsers,
  FaSlidersH,
  FaDownload,
  FaTrash,
  FaUndo,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaBold,
  FaItalic,
  FaSun,
  FaMoon,
  FaEdit,
  FaFont,
  FaVectorSquare,
  FaImage,
  FaShieldAlt,
  FaRibbon,
  FaCopy
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import NotificationModal from '../common/NotificationModal';
import CertificateDocument from '../common/CertificateDocument';
import {
  CERTIFICATE_FONTS,
  CERTIFICATE_BORDER_STYLES,
  CERTIFICATE_SIGNATURE_STYLES,
  DEFAULT_CERTIFICATE_ELEMENTS,
  getCertificateDesign,
  generateCertificatePDF
} from '../../services/certificateUtils';
import { createCertificateIssuedNotification } from '../../services/notificationService';
import './CertificateDesigner.css';

export default function CertificateDesigner() {
  const {
    students = [],
    batches = [],
    courses = [],
    certificates = [],
    certificateTemplates = [],
    issueCertificate,
    revokeCertificate,
    updateCertificateTemplate,
    addCertificateTemplate,
    setActiveCertificateTemplate,
    deleteCertificateTemplate
  } = useData();

  const previewRef = useRef(null);
  const modalCertRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [modalDownloading, setModalDownloading] = useState(false);

  // Active template selector
  const activeTemplateFromCtx = certificateTemplates.find(t => t.isActive) || certificateTemplates[0] || {};
  const [activeTemplateId, setActiveTemplateId] = useState(activeTemplateFromCtx.id || 'classic-emerald');

  // Preview student switcher ('sample' or student ID)
  const [previewStudentId, setPreviewStudentId] = useState('sample');
  // Modal to view & download an issued certificate from ledger
  const [viewCertModal, setViewCertModal] = useState(null);

  // Find the selected template object
  const currentTemplate = certificateTemplates.find(t => t.id === activeTemplateId) || activeTemplateFromCtx;

  // Active designer sub-tab: 'canvas' | 'borders' | 'ribbon' | 'elements' | 'logo'
  const [designerTab, setDesignerTab] = useState('canvas');

  // Active text element being edited in 'elements' tab
  const [activeElementKey, setActiveElementKey] = useState('title');

  // ── Template General Info ──
  const [templateName, setTemplateName] = useState('');
  const [instituteName, setInstituteName] = useState('');
  const [signatoryName, setSignatoryName] = useState('');
  const [signatoryTitle, setSignatoryTitle] = useState('');
  const [certTitle, setCertTitle] = useState('');

  // ── A. Canvas Settings ──
  const [paperSize, setPaperSize] = useState('a4-landscape');
  const [bgType, setBgType] = useState('gradient');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [gradientStart, setGradientStart] = useState('#f0fdf4');
  const [gradientEnd, setGradientEnd] = useState('#ffffff');
  const [gradientAngle, setGradientAngle] = useState(135);
  const [bgImage, setBgImage] = useState('');
  const [padding, setPadding] = useState(36);

  // ── B. Border Settings ──
  const [borderStyle, setBorderStyle] = useState('double');
  const [borderWidth, setBorderWidth] = useState(4);
  const [borderColor, setBorderColor] = useState('#15803D');
  const [borderRadius, setBorderRadius] = useState(8);
  const [innerBorderEnabled, setInnerBorderEnabled] = useState(false);
  const [innerBorderStyle, setInnerBorderStyle] = useState('solid');
  const [innerBorderWidth, setInnerBorderWidth] = useState(2);
  const [innerBorderColor, setInnerBorderColor] = useState('#15803D');
  const [innerBorderOffset, setInnerBorderOffset] = useState(12);

  // ── C. Ribbon & Seal Settings ──
  const [ribbonEnabled, setRibbonEnabled] = useState(false);
  const [ribbonPosition, setRibbonPosition] = useState('top-center');
  const [ribbonStyle, setRibbonStyle] = useState('straight');
  const [ribbonColor, setRibbonColor] = useState('#15803D');
  const [ribbonText, setRibbonText] = useState('VERIFIED CREDENTIAL');
  const [ribbonTextColor, setRibbonTextColor] = useState('#ffffff');
  const [ribbonTextSize, setRibbonTextSize] = useState(12);

  const [sideRibbonEnabled, setSideRibbonEnabled] = useState(false);
  const [sideRibbonPosition, setSideRibbonPosition] = useState('left');
  const [sideRibbonColor, setSideRibbonColor] = useState('#15803D');
  const [sideRibbonText, setSideRibbonText] = useState('CODELIFT ACADEMY');

  // ── E. Logo / Seal Settings ──
  const [logoEnabled, setLogoEnabled] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [logoSize, setLogoSize] = useState(60);
  const [logoPosition, setLogoPosition] = useState('top-left');

  const [sealEnabled, setSealEnabled] = useState(true);
  const [sealImage, setSealImage] = useState('');
  const [sealSize, setSealSize] = useState(60);
  const [sealPosition, setSealPosition] = useState('bottom-center');

  // ── D. 9 Text Elements State ──
  const [elements, setElements] = useState({ ...DEFAULT_CERTIFICATE_ELEMENTS });

  // Additional options
  const [accentColor, setAccentColor] = useState('#15803D');
  const [fontFamily, setFontFamily] = useState('Georgia, serif');
  const [isDark, setIsDark] = useState(false);
  const [showCorners, setShowCorners] = useState(true);
  const [showBadge, setShowBadge] = useState(true);
  const [badgeText, setBadgeText] = useState('ACADEMIC EXCELLENCE');
  const [showWatermark, setShowWatermark] = useState(true);
  const [signatureStyle, setSignatureStyle] = useState('cursive');

  // Modals state
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [showSaveAsModal, setShowSaveAsModal] = useState(false);
  const [saveAsName, setSaveAsName] = useState('');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedCourseName, setSelectedCourseName] = useState('');
  const [bulkBatchId, setBulkBatchId] = useState('');
  const [activeNotification, setActiveNotification] = useState(null);
  const [selectedEligibleStudentIds, setSelectedEligibleStudentIds] = useState([]);
  const [activeTab, setActiveTab] = useState('designer');

  // Synchronize form controls when active template switches
  useEffect(() => {
    if (currentTemplate) {
      setTemplateName(currentTemplate.name || '');
      setInstituteName(currentTemplate.instituteName || 'CodeLift Engineering Academy');
      setSignatoryName(currentTemplate.signatoryName || 'Vikram Nair');
      setSignatoryTitle(currentTemplate.signatoryTitle || 'Director of Academic Affairs');
      setCertTitle(currentTemplate.certTitle || 'CERTIFICATE OF COMPLETION');

      const d = currentTemplate.design || {};
      setAccentColor(d.accentColor || '#15803D');
      setPaperSize(d.paperSize || 'a4-landscape');
      setPadding(d.padding !== undefined ? Number(d.padding) : 36);

      setBgType(d.bgType || (d.bgStyle?.includes('linear-gradient') ? 'gradient' : 'solid'));
      setBackgroundColor(d.backgroundColor || '#ffffff');
      setGradientStart(d.gradientStart || '#f0fdf4');
      setGradientEnd(d.gradientEnd || '#ffffff');
      setGradientAngle(d.gradientAngle !== undefined ? Number(d.gradientAngle) : 135);
      setBgImage(d.bgImage || '');

      setBorderStyle(d.borderStyle || 'double');
      setBorderWidth(d.borderWidth !== undefined ? Number(d.borderWidth) : 4);
      setBorderColor(d.borderColor || d.accentColor || '#15803D');
      setBorderRadius(d.borderRadius !== undefined ? Number(d.borderRadius) : 8);

      const inBorder = d.innerBorder || {};
      setInnerBorderEnabled(Boolean(inBorder.enabled ?? d.innerBorderEnabled));
      setInnerBorderStyle(inBorder.style || d.innerBorderStyle || 'solid');
      setInnerBorderWidth(inBorder.width !== undefined ? Number(inBorder.width) : (d.innerBorderWidth !== undefined ? Number(d.innerBorderWidth) : 2));
      setInnerBorderColor(inBorder.color || d.innerBorderColor || d.accentColor || '#15803D');
      setInnerBorderOffset(inBorder.offset !== undefined ? Number(inBorder.offset) : (d.innerBorderOffset !== undefined ? Number(d.innerBorderOffset) : 12));

      const r = d.ribbon || {};
      setRibbonEnabled(Boolean(r.enabled ?? d.showRibbon));
      setRibbonPosition(r.position || d.ribbonPosition || 'top-center');
      setRibbonStyle(r.style || d.ribbonStyle || 'straight');
      setRibbonColor(r.color || d.ribbonColor || d.accentColor || '#15803D');
      setRibbonText(r.text || d.ribbonText || 'VERIFIED CREDENTIAL');
      setRibbonTextColor(r.textColor || d.ribbonTextColor || '#ffffff');
      setRibbonTextSize(r.textSize !== undefined ? Number(r.textSize) : (d.ribbonTextSize !== undefined ? Number(d.ribbonTextSize) : 12));

      const sr = d.sideRibbon || {};
      setSideRibbonEnabled(Boolean(sr.enabled ?? d.sideRibbonEnabled));
      setSideRibbonPosition(sr.position || d.sideRibbonPosition || 'left');
      setSideRibbonColor(sr.color || d.sideRibbonColor || d.accentColor || '#15803D');
      setSideRibbonText(sr.text || d.sideRibbonText || 'CODELIFT ACADEMY');

      const lg = d.logo || {};
      setLogoEnabled(Boolean(lg.enabled ?? d.logoEnabled));
      setLogoUrl(lg.url || d.logoUrl || '');
      setLogoSize(lg.size !== undefined ? Number(lg.size) : (d.logoSize !== undefined ? Number(d.logoSize) : 60));
      setLogoPosition(lg.position || d.logoPosition || 'top-left');

      const sl = d.seal || {};
      setSealEnabled(sl.enabled !== undefined ? Boolean(sl.enabled) : (d.sealEnabled !== undefined ? Boolean(d.sealEnabled) : true));
      setSealImage(sl.image || d.sealImage || '');
      setSealSize(sl.size !== undefined ? Number(sl.size) : (d.sealSize !== undefined ? Number(d.sealSize) : 60));
      setSealPosition(sl.position || d.sealPosition || 'bottom-center');

      setFontFamily(d.fontFamily || 'Georgia, serif');
      setIsDark(Boolean(d.isDark));
      setShowCorners(d.showCorners !== undefined ? Boolean(d.showCorners) : true);
      setShowBadge(d.showBadge !== undefined ? Boolean(d.showBadge) : true);
      setBadgeText(d.badgeText || 'ACADEMIC EXCELLENCE');
      setShowWatermark(d.showWatermark !== undefined ? Boolean(d.showWatermark) : true);
      setSignatureStyle(d.signatureStyle || currentTemplate.signatureStyle || 'cursive');

      // Populate elements with fallback defaults
      setElements({
        ...DEFAULT_CERTIFICATE_ELEMENTS,
        ...(d.elements || {}),
        title: {
          ...DEFAULT_CERTIFICATE_ELEMENTS.title,
          ...(d.elements?.title || {}),
          content: d.elements?.title?.content || currentTemplate.certTitle || 'CERTIFICATE OF COMPLETION'
        },
        signatureName: {
          ...DEFAULT_CERTIFICATE_ELEMENTS.signatureName,
          ...(d.elements?.signatureName || {}),
          content: d.elements?.signatureName?.content || currentTemplate.signatoryName || 'Vikram Nair'
        },
        signatureTitle: {
          ...DEFAULT_CERTIFICATE_ELEMENTS.signatureTitle,
          ...(d.elements?.signatureTitle || {}),
          content: d.elements?.signatureTitle?.content || currentTemplate.signatoryTitle || 'Director of Academic Affairs'
        }
      });
    }
  }, [activeTemplateId, currentTemplate?.id]);

  // Construct current live design object
  const liveDesign = {
    accentColor,
    paperSize,
    padding,
    bgType,
    backgroundColor,
    gradientStart,
    gradientEnd,
    gradientAngle,
    bgStyle: bgType === 'solid' ? backgroundColor : `linear-gradient(${gradientAngle}deg, ${gradientStart} 0%, ${gradientEnd} 100%)`,
    bgImage,
    fontFamily,
    borderStyle,
    borderWidth,
    borderColor,
    borderRadius,
    isDark,
    showCorners,
    showBadge,
    badgeText,
    showWatermark,
    signatureStyle,
    instituteName,
    signatoryName: elements.signatureName?.content || signatoryName,
    signatoryTitle: elements.signatureTitle?.content || signatoryTitle,
    certTitle: elements.title?.content || certTitle,
    innerBorder: {
      enabled: innerBorderEnabled,
      style: innerBorderStyle,
      width: innerBorderWidth,
      color: innerBorderColor,
      offset: innerBorderOffset
    },
    ribbon: {
      enabled: ribbonEnabled,
      position: ribbonPosition,
      style: ribbonStyle,
      color: ribbonColor,
      text: ribbonText,
      textColor: ribbonTextColor,
      textSize: ribbonTextSize
    },
    sideRibbon: {
      enabled: sideRibbonEnabled,
      position: sideRibbonPosition,
      color: sideRibbonColor,
      text: sideRibbonText
    },
    logo: {
      enabled: logoEnabled,
      url: logoUrl,
      size: logoSize,
      position: logoPosition
    },
    seal: {
      enabled: sealEnabled,
      image: sealImage,
      size: sealSize,
      position: sealPosition
    },
    elements
  };

  // 300ms Debounce for live preview updates
  const [debouncedDesign, setDebouncedDesign] = useState(liveDesign);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedDesign(liveDesign);
    }, 300);
    return () => clearTimeout(timer);
  }, [
    accentColor, paperSize, padding, bgType, backgroundColor, gradientStart, gradientEnd, gradientAngle, bgImage,
    fontFamily, borderStyle, borderWidth, borderColor, borderRadius, isDark, showCorners, showBadge, badgeText,
    showWatermark, signatureStyle, instituteName, signatoryName, signatoryTitle, certTitle,
    innerBorderEnabled, innerBorderStyle, innerBorderWidth, innerBorderColor, innerBorderOffset,
    ribbonEnabled, ribbonPosition, ribbonStyle, ribbonColor, ribbonText, ribbonTextColor, ribbonTextSize,
    sideRibbonEnabled, sideRibbonPosition, sideRibbonColor, sideRibbonText,
    logoEnabled, logoUrl, logoSize, logoPosition, sealEnabled, sealImage, sealSize, sealPosition, elements
  ]);

  // Handle image upload to base64
  const handleImageUpload = (file, setter) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setter(e.target.result);
      toast.success('Image loaded successfully');
    };
    reader.readAsDataURL(file);
  };

  // Helper to update individual text element property
  const updateElementProp = (key, prop, value) => {
    setElements(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [prop]: value
      }
    }));
  };

  // Save changes to current template
  const handleSaveTemplate = () => {
    if (!currentTemplate) return;
    updateCertificateTemplate(currentTemplate.id, {
      name: templateName,
      instituteName,
      signatoryName: elements.signatureName?.content || signatoryName,
      signatoryTitle: elements.signatureTitle?.content || signatoryTitle,
      certTitle: elements.title?.content || certTitle,
      emblemType: 'cap',
      signatureStyle,
      showWatermark,
      design: {
        ...liveDesign
      }
    });
    toast.success(`Template "${templateName}" saved successfully.`);
  };

  // Save as new template duplicate
  const handleSaveAsNew = () => {
    if (!saveAsName.trim()) {
      toast.error('Please enter a name for the new template');
      return;
    }
    const created = addCertificateTemplate({
      name: saveAsName.trim(),
      instituteName,
      signatoryName: elements.signatureName?.content || signatoryName,
      signatoryTitle: elements.signatureTitle?.content || signatoryTitle,
      certTitle: elements.title?.content || certTitle,
      isActive: false,
      design: {
        ...liveDesign
      }
    });
    setActiveTemplateId(created.id);
    setShowSaveAsModal(false);
    setSaveAsName('');
    toast.success(`New template "${created.name}" created.`);
  };

  // Set active default template
  const handleSetActive = (idToSet = currentTemplate?.id) => {
    if (!idToSet) return;
    setActiveCertificateTemplate(idToSet);
    toast.success(`Template set as active default.`);
  };

  // Delete template
  const handleDeleteTemplate = () => {
    if (certificateTemplates.length <= 1) {
      toast.error('Cannot delete the last remaining template.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete template "${templateName}"?`)) {
      deleteCertificateTemplate(currentTemplate.id);
      const remaining = certificateTemplates.filter(t => t.id !== currentTemplate.id);
      if (remaining.length > 0) {
        setActiveTemplateId(remaining[0].id);
      }
      toast.success('Template deleted.');
    }
  };

  // Resolve preview student data
  const previewStudent = previewStudentId !== 'sample' ? students.find(s => s.id === previewStudentId) : null;
  const previewCourse = previewStudent ? (courses.find(c => c.batchId === previewStudent.batchId) || courses[0]) : null;
  const previewCert = previewStudent ? certificates.find(c => c.studentId === previewStudent.id && !c.isRevoked) : null;

  const previewStudentName = previewStudent?.name || 'Rahul Sharma';
  const previewCourseName = previewCert?.courseName || previewCourse?.title || 'Modern Full Stack Web Engineering';
  const previewCertId = previewCert?.certificateId || 'CERT-2026-0001';
  const previewIssuedAt = previewCert?.issuedAt || new Date().toISOString();

  // Download sample PDF with live preview settings
  const handleDownloadSamplePDF = async () => {
    if (!previewRef.current) return;
    setIsDownloading(true);
    try {
      await generateCertificatePDF(previewRef.current, {
        studentName: previewStudentName,
        courseName: previewCourseName,
        certId: previewCertId,
        backgroundColor: bgType === 'solid' ? backgroundColor : gradientStart,
        paperSize: liveDesign.paperSize || 'a4-landscape'
      });
      toast.success('Sample PDF downloaded! Verified layout.');
    } catch (err) {
      console.error('PDF export error:', err);
      toast.error('Failed to export PDF: ' + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  // Download issued certificate from modal
  const handleModalDownloadPDF = async () => {
    if (!modalCertRef.current || !viewCertModal) return;
    setModalDownloading(true);
    try {
      const design = getCertificateDesign(viewCertModal, certificateTemplates);
      await generateCertificatePDF(modalCertRef.current, {
        studentName: viewCertModal.studentName,
        courseName: viewCertModal.courseName,
        certId: viewCertModal.certificateId,
        backgroundColor: design.bgType === 'solid' ? design.backgroundColor : design.gradientStart,
        paperSize: design.paperSize || 'a4-landscape'
      });
      toast.success('Certificate PDF downloaded.');
    } catch (err) {
      console.error('Modal download error:', err);
      toast.error('Failed to download PDF: ' + err.message);
    } finally {
      setModalDownloading(false);
    }
  };

  // Helper for referral code
  const getReferralCode = (name) => {
    const clean = (name || 'STUDENT').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4);
    return `LIFT-${clean}2026`;
  };

  // Single issue submission
  const handleSingleIssue = (e) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedCourseName) {
      toast.error('Please select both student and course');
      return;
    }
    const student = students.find(s => s.id === selectedStudentId);
    const newCert = issueCertificate(selectedStudentId, selectedCourseName, currentTemplate.id);
    toast.success(`Certificate issued to ${student?.name}.`);
    const refCode = getReferralCode(student?.name);
    const notif = createCertificateIssuedNotification({
      student,
      certificate: newCert,
      referralCode: refCode
    });
    setActiveNotification(notif);
    setShowIssueModal(false);
  };

  // Eligible students evaluation
  const eligibleRecords = students.map(st => {
    const studentBatch = batches.find(b => b.id === st.batchId);
    const course = courses.find(c => c.batchId === st.batchId) || courses[0];
    const allTopics = Array.isArray(course?.modules) ? course.modules.flatMap(m => Array.isArray(m.topics) ? m.topics : []) : [];
    const completedTopics = allTopics.filter(t => st?.progress?.[t.id] === 'completed' || st?.progress?.[t.id] === true || st?.quizAttempts?.[t.id]?.passed);
    const progressPct = allTopics.length ? Math.round((completedTopics.length / allTopics.length) * 100) : 0;
    const existingCert = certificates.find(c => (c.studentId === st.id || (st.legacyId && c.studentId === st.legacyId)) && c.courseName === course?.title && !c.isRevoked && (c.status === 'issued' || c.status === 'approved'));
    const isEligible = progressPct === 100 && !existingCert;

    return {
      student: st,
      batch: studentBatch,
      course,
      totalTopics: allTopics.length,
      completedTopics: completedTopics.length,
      progressPct,
      existingCert,
      isEligible
    };
  });

  const eligibleAwaitingList = eligibleRecords.filter(r => r.isEligible);

  const textElementLabels = {
    title: 'Title',
    subtitle: 'Subtitle',
    studentName: 'Student Name',
    courseName: 'Course Name',
    completionLine: 'Completion Line',
    date: 'Date of Issue',
    certificateId: 'Certificate ID',
    signatureName: 'Signature Name',
    signatureTitle: 'Signature Title'
  };

  const isCurrentActive = currentTemplate?.isActive;

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <FaCertificate style={{ color: 'var(--bs-primary)' }} />
            <span>Advanced Certificate Studio</span>
          </h4>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <Button
            variant="outline-primary"
            onClick={() => setShowSaveAsModal(true)}
            className="d-flex align-items-center gap-2 rounded-2"
          >
            <FaCopy size={12} />
            <span>Save As New</span>
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveTemplate}
            className="d-flex align-items-center gap-2 rounded-2"
          >
            <FaSave size={12} />
            <span>Save Template</span>
          </Button>
          <Button
            variant="outline-success"
            onClick={() => setShowIssueModal(true)}
            className="d-flex align-items-center gap-2 rounded-2"
          >
            <FaAward size={13} />
            <span>Issue Certificate</span>
          </Button>
        </div>
      </div>

      {/* Main Mode Tabs: Studio Editor vs Issued Ledger vs Eligible */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3 border-bottom"
      >
        <Tab eventKey="designer" title={<span><FaSlidersH className="me-1" /> Template Studio</span>} />
        <Tab eventKey="ledger" title={<span><FaCertificate className="me-1" /> Issued Ledger ({certificates.filter(c => !c.isRevoked).length})</span>} />
        <Tab eventKey="eligible" title={<span><FaUsers className="me-1" /> Eligible Students ({eligibleAwaitingList.length})</span>} />
      </Tabs>

      {/* ── 1. TEMPLATE STUDIO ── */}
      {activeTab === 'designer' && (
        <div className="cert-studio-layout mb-4">
          {/* LEFT: Controls Panel */}
          <div className="cert-controls-panel">
            {/* Template Selector & Meta */}
            <div className="cert-control-group bg-light-subtle">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <label className="small fw-bold text-uppercase tracking-wider text-muted mb-0">
                  Select Template
                </label>
                <div className="d-flex align-items-center gap-2">
                  {isCurrentActive ? (
                    <Badge bg="success" className="d-flex align-items-center gap-1">
                      <FaCheck size={10} /> Active
                    </Badge>
                  ) : (
                    <Button
                      variant="outline-success"
                      size="sm"
                      className="py-0 px-2 fw-semibold"
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => handleSetActive()}
                    >
                      Set Active
                    </Button>
                  )}
                  {certificateTemplates.length > 1 && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="py-0 px-2"
                      style={{ fontSize: '0.75rem' }}
                      title="Delete template"
                      onClick={handleDeleteTemplate}
                    >
                      <FaTrash size={10} />
                    </Button>
                  )}
                </div>
              </div>

              <Form.Select
                size="sm"
                value={activeTemplateId}
                onChange={(e) => setActiveTemplateId(e.target.value)}
                className="fw-bold mb-3"
              >
                {certificateTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} {t.isActive ? '★ (Active Default)' : ''}
                  </option>
                ))}
              </Form.Select>

              <Form.Group className="mb-0">
                <Form.Label className="small fw-semibold text-muted mb-1">Template Name</Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g. Modern Emerald Master"
                />
              </Form.Group>
            </div>

            {/* Quick Edit Bar with OverlayTrigger Tooltips */}
            <div className="p-2 border-bottom d-flex align-items-center justify-content-between bg-light-subtle">
              <span className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.5px' }}>
                Quick Edit:
              </span>
              <div className="d-flex gap-1">
                {[
                  { id: 'canvas', icon: <FaPalette size={13} />, tooltip: 'Canvas, Background & Padding' },
                  { id: 'borders', icon: <FaVectorSquare size={13} />, tooltip: 'Border & Inner Frame' },
                  { id: 'ribbon', icon: <FaRibbon size={13} />, tooltip: 'Ribbons & Security Banner' },
                  { id: 'elements', icon: <FaFont size={13} />, tooltip: 'Typography & Text Elements' },
                  { id: 'logo', icon: <FaImage size={13} />, tooltip: 'Logo & Official Seal' },
                ].map(item => (
                  <OverlayTrigger
                    key={item.id}
                    placement="top"
                    overlay={<Tooltip id={`tooltip-${item.id}`}>{item.tooltip}</Tooltip>}
                  >
                    <button
                      type="button"
                      className={`btn btn-sm ${designerTab === item.id ? 'btn-primary' : 'btn-outline-secondary'} py-1 px-2 border-0`}
                      onClick={() => setDesignerTab(item.id)}
                      style={{ fontSize: '0.75rem' }}
                    >
                      {item.icon}
                    </button>
                  </OverlayTrigger>
                ))}
              </div>
            </div>

            {/* Studio Sub-Navigation Tabs */}
            <div className="cert-subnav-tabs">
              {[
                { id: 'canvas', label: 'Canvas', icon: <FaPalette size={13} /> },
                { id: 'borders', label: 'Borders', icon: <FaVectorSquare size={13} /> },
                { id: 'ribbon', label: 'Ribbon & Seal', icon: <FaRibbon size={13} /> },
                { id: 'elements', label: 'Text Elements', icon: <FaFont size={13} /> },
                { id: 'logo', label: 'Logo & Seal', icon: <FaImage size={13} /> },
              ].map(t => (
                <button
                  key={t.id}
                  className={`cert-subnav-btn ${designerTab === t.id ? 'active' : ''}`}
                  onClick={() => setDesignerTab(t.id)}
                  type="button"
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* ── A. Canvas Settings ── */}
            {designerTab === 'canvas' && (
              <div>
                <div className="cert-control-group">
                  <Form.Label className="small fw-bold mb-1">Paper Size</Form.Label>
                  <Form.Select
                    size="sm"
                    value={paperSize}
                    onChange={(e) => setPaperSize(e.target.value)}
                  >
                    <option value="a4-landscape">A4 Landscape (297 × 210 mm)</option>
                    <option value="a4-portrait">A4 Portrait (210 × 297 mm)</option>
                    <option value="letter">Letter Landscape (11 × 8.5 in)</option>
                  </Form.Select>
                </div>

                <div className="cert-control-group">
                  <Form.Label className="small fw-bold mb-2">Background Style</Form.Label>
                  <div className="d-flex gap-2 mb-3">
                    <Button
                      size="sm"
                      variant={bgType === 'solid' ? 'primary' : 'outline-secondary'}
                      className="flex-fill"
                      onClick={() => setBgType('solid')}
                    >
                      Solid Colour
                    </Button>
                    <Button
                      size="sm"
                      variant={bgType === 'gradient' ? 'primary' : 'outline-secondary'}
                      className="flex-fill"
                      onClick={() => setBgType('gradient')}
                    >
                      Gradient
                    </Button>
                  </div>

                  {bgType === 'solid' ? (
                    <div className="d-flex align-items-center justify-content-between p-2 rounded-2 border">
                      <span className="small fw-semibold">Solid Background</span>
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="color"
                          className="cert-color-picker-input"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                        />
                        <code className="small">{backgroundColor}</code>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="d-flex align-items-center justify-content-between p-2 rounded-2 border">
                        <span className="small fw-semibold">Start Colour</span>
                        <div className="d-flex align-items-center gap-2">
                          <input
                            type="color"
                            className="cert-color-picker-input"
                            value={gradientStart}
                            onChange={(e) => setGradientStart(e.target.value)}
                          />
                          <code className="small">{gradientStart}</code>
                        </div>
                      </div>
                      <div className="d-flex align-items-center justify-content-between p-2 rounded-2 border mt-2">
                        <span className="small fw-semibold">End Colour</span>
                        <div className="d-flex align-items-center gap-2">
                          <input
                            type="color"
                            className="cert-color-picker-input"
                            value={gradientEnd}
                            onChange={(e) => setGradientEnd(e.target.value)}
                          />
                          <code className="small">{gradientEnd}</code>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="d-flex justify-content-between small fw-semibold mb-1">
                          <span>Gradient Angle</span>
                          <span className="cert-slider-val">{gradientAngle}°</span>
                        </div>
                        <Form.Range
                          min={0}
                          max={360}
                          value={gradientAngle}
                          onChange={(e) => setGradientAngle(Number(e.target.value))}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="cert-control-group">
                  <Form.Label className="small fw-bold mb-1">Background Image (Optional)</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    value={bgImage}
                    onChange={(e) => setBgImage(e.target.value)}
                    placeholder="Paste Image URL or upload below..."
                    className="mb-2"
                  />
                  <div className="d-flex gap-2">
                    <label className="btn btn-sm btn-outline-secondary flex-fill mb-0 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleImageUpload(e.target.files[0], setBgImage)}
                      />
                      Upload Image File
                    </label>
                    {bgImage && (
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => setBgImage('')}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>

                <div className="cert-control-group">
                  <div className="d-flex justify-content-between small fw-bold mb-1">
                    <span>Overall Padding</span>
                    <span className="cert-slider-val">{padding}px</span>
                  </div>
                  <Form.Range
                    min={0}
                    max={80}
                    value={padding}
                    onChange={(e) => setPadding(Number(e.target.value))}
                  />
                </div>
              </div>
            )}

            {/* ── B. Border Settings ── */}
            {designerTab === 'borders' && (
              <div>
                <div className="cert-control-group">
                  <Form.Label className="small fw-bold mb-1">Border Style</Form.Label>
                  <Form.Select
                    size="sm"
                    value={borderStyle}
                    onChange={(e) => setBorderStyle(e.target.value)}
                  >
                    <option value="solid">Solid Clean</option>
                    <option value="double">Double Luxury</option>
                    <option value="dashed">Dashed Modern</option>
                    <option value="dotted">Dotted Classical</option>
                  </Form.Select>
                </div>

                <div className="cert-control-group">
                  <div className="d-flex justify-content-between small fw-bold mb-1">
                    <span>Border Width</span>
                    <span className="cert-slider-val">{borderWidth}px</span>
                  </div>
                  <Form.Range
                    min={0}
                    max={20}
                    value={borderWidth}
                    onChange={(e) => setBorderWidth(Number(e.target.value))}
                  />
                </div>

                <div className="cert-control-group">
                  <div className="d-flex align-items-center justify-content-between p-2 rounded-2 border">
                    <span className="small fw-semibold">Border Colour</span>
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="color"
                        className="cert-color-picker-input"
                        value={borderColor}
                        onChange={(e) => setBorderColor(e.target.value)}
                      />
                      <code className="small">{borderColor}</code>
                    </div>
                  </div>
                </div>

                <div className="cert-control-group">
                  <div className="d-flex justify-content-between small fw-bold mb-1">
                    <span>Border Radius</span>
                    <span className="cert-slider-val">{borderRadius}px</span>
                  </div>
                  <Form.Range
                    min={0}
                    max={40}
                    value={borderRadius}
                    onChange={(e) => setBorderRadius(Number(e.target.value))}
                  />
                </div>

                {/* Inner Border Toggle & Controls */}
                <div className="cert-control-group bg-light-subtle">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                      <div className="fw-bold small">Inner Decorative Border</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>Second internal framing border</div>
                    </div>
                    <Form.Check
                      type="switch"
                      checked={innerBorderEnabled}
                      onChange={(e) => setInnerBorderEnabled(e.target.checked)}
                    />
                  </div>

                  {innerBorderEnabled && (
                    <div className="space-y-3">
                      <div>
                        <Form.Label className="small fw-semibold mb-1">Inner Style</Form.Label>
                        <Form.Select
                          size="sm"
                          value={innerBorderStyle}
                          onChange={(e) => setInnerBorderStyle(e.target.value)}
                        >
                          <option value="solid">Solid</option>
                          <option value="double">Double</option>
                          <option value="dashed">Dashed</option>
                          <option value="dotted">Dotted</option>
                        </Form.Select>
                      </div>

                      <div className="mt-2">
                        <div className="d-flex justify-content-between small fw-semibold mb-1">
                          <span>Inner Width</span>
                          <span className="cert-slider-val">{innerBorderWidth}px</span>
                        </div>
                        <Form.Range
                          min={0}
                          max={10}
                          value={innerBorderWidth}
                          onChange={(e) => setInnerBorderWidth(Number(e.target.value))}
                        />
                      </div>

                      <div className="d-flex align-items-center justify-content-between p-2 rounded-2 border mt-2">
                        <span className="small fw-semibold">Inner Colour</span>
                        <div className="d-flex align-items-center gap-2">
                          <input
                            type="color"
                            className="cert-color-picker-input"
                            value={innerBorderColor}
                            onChange={(e) => setInnerBorderColor(e.target.value)}
                          />
                          <code className="small">{innerBorderColor}</code>
                        </div>
                      </div>

                      <div className="mt-2">
                        <div className="d-flex justify-content-between small fw-semibold mb-1">
                          <span>Inner Offset</span>
                          <span className="cert-slider-val">{innerBorderOffset}px</span>
                        </div>
                        <Form.Range
                          min={2}
                          max={40}
                          value={innerBorderOffset}
                          onChange={(e) => setInnerBorderOffset(Number(e.target.value))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── C. Ribbon & Seal Settings ── */}
            {designerTab === 'ribbon' && (
              <div>
                {/* Horizontal / Corner Ribbon */}
                <div className="cert-control-group">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                      <div className="fw-bold small">Ribbon Header / Badge</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>Corner or center decorative banner</div>
                    </div>
                    <Form.Check
                      type="switch"
                      checked={ribbonEnabled}
                      onChange={(e) => setRibbonEnabled(e.target.checked)}
                    />
                  </div>

                  {ribbonEnabled && (
                    <div className="space-y-3">
                      <div>
                        <Form.Label className="small fw-semibold mb-1">Position</Form.Label>
                        <Form.Select
                          size="sm"
                          value={ribbonPosition}
                          onChange={(e) => setRibbonPosition(e.target.value)}
                        >
                          <option value="top-center">Top Center (Full Banner)</option>
                          <option value="bottom-center">Bottom Center (Full Banner)</option>
                          <option value="top-left">Top Left Corner</option>
                          <option value="top-right">Top Right Corner</option>
                          <option value="bottom-left">Bottom Left Corner</option>
                          <option value="bottom-right">Bottom Right Corner</option>
                          <option value="left-center">Left Edge Center</option>
                          <option value="right-center">Right Edge Center</option>
                        </Form.Select>
                      </div>

                      <div className="mt-2">
                        <Form.Label className="small fw-semibold mb-1">Ribbon Style</Form.Label>
                        <Form.Select
                          size="sm"
                          value={ribbonStyle}
                          onChange={(e) => setRibbonStyle(e.target.value)}
                        >
                          <option value="straight">Straight</option>
                          <option value="diagonal">Diagonal Corner</option>
                          <option value="curved">Curved Badge</option>
                        </Form.Select>
                      </div>

                      <div className="mt-2">
                        <Form.Label className="small fw-semibold mb-1">Ribbon Text</Form.Label>
                        <Form.Control
                          size="sm"
                          type="text"
                          value={ribbonText}
                          onChange={(e) => setRibbonText(e.target.value)}
                        />
                      </div>

                      <div className="d-flex align-items-center justify-content-between p-2 rounded-2 border mt-2">
                        <span className="small fw-semibold">Ribbon Colour</span>
                        <input
                          type="color"
                          className="cert-color-picker-input"
                          value={ribbonColor}
                          onChange={(e) => setRibbonColor(e.target.value)}
                        />
                      </div>

                      <div className="d-flex align-items-center justify-content-between p-2 rounded-2 border mt-2">
                        <span className="small fw-semibold">Text Colour</span>
                        <input
                          type="color"
                          className="cert-color-picker-input"
                          value={ribbonTextColor}
                          onChange={(e) => setRibbonTextColor(e.target.value)}
                        />
                      </div>

                      <div className="mt-2">
                        <div className="d-flex justify-content-between small fw-semibold mb-1">
                          <span>Text Size</span>
                          <span className="cert-slider-val">{ribbonTextSize}px</span>
                        </div>
                        <Form.Range
                          min={8}
                          max={24}
                          value={ribbonTextSize}
                          onChange={(e) => setRibbonTextSize(Number(e.target.value))}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Side Ribbon */}
                <div className="cert-control-group bg-light-subtle">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                      <div className="fw-bold small">Side Ribbon Strip</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>Full-height vertical edge ribbon</div>
                    </div>
                    <Form.Check
                      type="switch"
                      checked={sideRibbonEnabled}
                      onChange={(e) => setSideRibbonEnabled(e.target.checked)}
                    />
                  </div>

                  {sideRibbonEnabled && (
                    <div className="space-y-3">
                      <div>
                        <Form.Label className="small fw-semibold mb-1">Side Position</Form.Label>
                        <Form.Select
                          size="sm"
                          value={sideRibbonPosition}
                          onChange={(e) => setSideRibbonPosition(e.target.value)}
                        >
                          <option value="left">Left Edge</option>
                          <option value="right">Right Edge</option>
                        </Form.Select>
                      </div>

                      <div className="mt-2">
                        <Form.Label className="small fw-semibold mb-1">Side Ribbon Text</Form.Label>
                        <Form.Control
                          size="sm"
                          type="text"
                          value={sideRibbonText}
                          onChange={(e) => setSideRibbonText(e.target.value)}
                        />
                      </div>

                      <div className="d-flex align-items-center justify-content-between p-2 rounded-2 border mt-2">
                        <span className="small fw-semibold">Ribbon Colour</span>
                        <input
                          type="color"
                          className="cert-color-picker-input"
                          value={sideRibbonColor}
                          onChange={(e) => setSideRibbonColor(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── D. Text Element Editor (per element) ── */}
            {designerTab === 'elements' && (
              <div>
                {/* Element Picker */}
                <div className="cert-control-group">
                  <Form.Label className="small fw-bold mb-1">Select Text Element to Edit</Form.Label>
                  <Form.Select
                    size="sm"
                    value={activeElementKey}
                    onChange={(e) => setActiveElementKey(e.target.value)}
                    className="fw-bold"
                  >
                    {Object.keys(textElementLabels).map(key => (
                      <option key={key} value={key}>
                        {textElementLabels[key]}
                      </option>
                    ))}
                  </Form.Select>
                </div>

                {/* Controls for Active Element */}
                {(() => {
                  const el = elements[activeElementKey] || DEFAULT_CERTIFICATE_ELEMENTS[activeElementKey] || {};
                  return (
                    <div className="space-y-0">
                      {/* Visibility Toggle */}
                      <div className="cert-control-group d-flex align-items-center justify-content-between">
                        <span className="small fw-bold">Element Visible</span>
                        <Form.Check
                          type="switch"
                          checked={el.visible !== false}
                          onChange={(e) => updateElementProp(activeElementKey, 'visible', e.target.checked)}
                        />
                      </div>

                      {/* Content with Placeholders */}
                      <div className="cert-control-group">
                        <Form.Label className="small fw-bold mb-1">Content / Template Text</Form.Label>
                        <Form.Control
                          size="sm"
                          type="text"
                          value={el.content || ''}
                          onChange={(e) => updateElementProp(activeElementKey, 'content', e.target.value)}
                          placeholder="Enter text..."
                          className="mb-2"
                        />
                        <div className="d-flex flex-wrap gap-1 align-items-center">
                          <span className="small text-muted me-1" style={{ fontSize: '0.72rem' }}>Tags:</span>
                          {['{{studentName}}', '{{courseName}}', '{{date}}', '{{certificateId}}'].map(tag => (
                            <span
                              key={tag}
                              className="cert-placeholder-tag"
                              onClick={() => {
                                const current = el.content || '';
                                updateElementProp(activeElementKey, 'content', current ? `${current} ${tag}` : tag);
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Typography Controls */}
                      <div className="cert-control-group">
                        <Form.Label className="small fw-bold mb-1">Font Family</Form.Label>
                        <Form.Select
                          size="sm"
                          value={el.fontFamily || 'Georgia, serif'}
                          onChange={(e) => updateElementProp(activeElementKey, 'fontFamily', e.target.value)}
                          className="mb-3"
                        >
                          {CERTIFICATE_FONTS.map(f => (
                            <option key={f.id} value={f.value}>
                              {f.name}
                            </option>
                          ))}
                        </Form.Select>

                        <div className="d-flex justify-content-between small fw-bold mb-1">
                          <span>Font Size</span>
                          <span className="cert-slider-val">{el.fontSize || 16}px</span>
                        </div>
                        <Form.Range
                          min={10}
                          max={72}
                          value={el.fontSize || 16}
                          onChange={(e) => updateElementProp(activeElementKey, 'fontSize', Number(e.target.value))}
                          className="mb-3"
                        />

                        <div className="row g-2 mb-3">
                          <div className="col-6">
                            <Form.Label className="small fw-semibold mb-1">Font Weight</Form.Label>
                            <ButtonGroup size="sm" className="w-100">
                              {[400, 500, 600, 700].map(w => (
                                <Button
                                  key={w}
                                  variant={Number(el.fontWeight) === w ? 'primary' : 'outline-secondary'}
                                  onClick={() => updateElementProp(activeElementKey, 'fontWeight', w)}
                                  className="px-1"
                                >
                                  {w}
                                </Button>
                              ))}
                            </ButtonGroup>
                          </div>
                          <div className="col-6">
                            <Form.Label className="small fw-semibold mb-1">Font Style</Form.Label>
                            <ButtonGroup size="sm" className="w-100">
                              <Button
                                variant={el.fontStyle === 'normal' || !el.fontStyle ? 'primary' : 'outline-secondary'}
                                onClick={() => updateElementProp(activeElementKey, 'fontStyle', 'normal')}
                              >
                                Normal
                              </Button>
                              <Button
                                variant={el.fontStyle === 'italic' ? 'primary' : 'outline-secondary'}
                                onClick={() => updateElementProp(activeElementKey, 'fontStyle', 'italic')}
                              >
                                Italic
                              </Button>
                            </ButtonGroup>
                          </div>
                        </div>

                        <div className="d-flex justify-content-between small fw-bold mb-1">
                          <span>Letter Spacing</span>
                          <span className="cert-slider-val">{el.letterSpacing || 0}px</span>
                        </div>
                        <Form.Range
                          min={0}
                          max={10}
                          value={el.letterSpacing || 0}
                          onChange={(e) => updateElementProp(activeElementKey, 'letterSpacing', Number(e.target.value))}
                        />
                      </div>

                      {/* Alignment & Colour */}
                      <div className="cert-control-group">
                        <Form.Label className="small fw-bold mb-1">Text Alignment</Form.Label>
                        <div className="cert-align-btn-group mb-3">
                          {[
                            { align: 'left', icon: <FaAlignLeft size={12} />, label: 'Left' },
                            { align: 'center', icon: <FaAlignCenter size={12} />, label: 'Center' },
                            { align: 'right', icon: <FaAlignRight size={12} />, label: 'Right' },
                          ].map(a => (
                            <button
                              key={a.align}
                              type="button"
                              className={`cert-align-btn ${el.textAlign === a.align ? 'active' : ''}`}
                              onClick={() => updateElementProp(activeElementKey, 'textAlign', a.align)}
                            >
                              {a.icon}
                              <span>{a.label}</span>
                            </button>
                          ))}
                        </div>

                        <div className="d-flex align-items-center justify-content-between p-2 rounded-2 border">
                          <span className="small fw-semibold">Text Colour</span>
                          <div className="d-flex align-items-center gap-2">
                            <input
                              type="color"
                              className="cert-color-picker-input"
                              value={el.color || '#1e293b'}
                              onChange={(e) => updateElementProp(activeElementKey, 'color', e.target.value)}
                            />
                            <code className="small">{el.color || '#1e293b'}</code>
                          </div>
                        </div>
                      </div>

                      {/* Position Sliders */}
                      <div className="cert-control-group">
                        <div className="d-flex justify-content-between small fw-bold mb-1">
                          <span>Y Position Offset</span>
                          <span className="cert-slider-val">{el.yPosition || 0}px</span>
                        </div>
                        <Form.Range
                          min={-50}
                          max={100}
                          value={el.yPosition || 0}
                          onChange={(e) => updateElementProp(activeElementKey, 'yPosition', Number(e.target.value))}
                          className="mb-3"
                        />

                        <div className="d-flex justify-content-between small fw-bold mb-1">
                          <span>X Position Offset</span>
                          <span className="cert-slider-val">{el.xOffset || 0}px</span>
                        </div>
                        <Form.Range
                          min={-100}
                          max={100}
                          value={el.xOffset || 0}
                          onChange={(e) => updateElementProp(activeElementKey, 'xOffset', Number(e.target.value))}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ── E. Logo & Seal Settings ── */}
            {designerTab === 'logo' && (
              <div>
                {/* Logo */}
                <div className="cert-control-group">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                      <div className="fw-bold small">Academy Logo</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>Corner or top institutional mark</div>
                    </div>
                    <Form.Check
                      type="switch"
                      checked={logoEnabled}
                      onChange={(e) => setLogoEnabled(e.target.checked)}
                    />
                  </div>

                  {logoEnabled && (
                    <div className="space-y-3">
                      <div>
                        <Form.Label className="small fw-semibold mb-1">Logo URL</Form.Label>
                        <Form.Control
                          size="sm"
                          type="text"
                          value={logoUrl}
                          onChange={(e) => setLogoUrl(e.target.value)}
                          placeholder="Paste Logo Image URL or upload..."
                          className="mb-2"
                        />
                        <label className="btn btn-sm btn-outline-secondary w-100 cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => handleImageUpload(e.target.files[0], setLogoUrl)}
                          />
                          Upload Logo File
                        </label>
                      </div>

                      <div className="mt-2">
                        <div className="d-flex justify-content-between small fw-semibold mb-1">
                          <span>Logo Size</span>
                          <span className="cert-slider-val">{logoSize}px</span>
                        </div>
                        <Form.Range
                          min={40}
                          max={200}
                          value={logoSize}
                          onChange={(e) => setLogoSize(Number(e.target.value))}
                        />
                      </div>

                      <div className="mt-2">
                        <Form.Label className="small fw-semibold mb-1">Position</Form.Label>
                        <Form.Select
                          size="sm"
                          value={logoPosition}
                          onChange={(e) => setLogoPosition(e.target.value)}
                        >
                          <option value="top-left">Top Left</option>
                          <option value="top-center">Top Center</option>
                          <option value="top-right">Top Right</option>
                          <option value="bottom-left">Bottom Left</option>
                          <option value="bottom-right">Bottom Right</option>
                        </Form.Select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Seal */}
                <div className="cert-control-group bg-light-subtle">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                      <div className="fw-bold small">Official Seal / Security Mark</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>Gold badge or custom verification seal</div>
                    </div>
                    <Form.Check
                      type="switch"
                      checked={sealEnabled}
                      onChange={(e) => setSealEnabled(e.target.checked)}
                    />
                  </div>

                  {sealEnabled && (
                    <div className="space-y-3">
                      <div>
                        <Form.Label className="small fw-semibold mb-1">Seal Image (Optional URL)</Form.Label>
                        <Form.Control
                          size="sm"
                          type="text"
                          value={sealImage}
                          onChange={(e) => setSealImage(e.target.value)}
                          placeholder="Defaults to gold credential emblem"
                          className="mb-2"
                        />
                        <label className="btn btn-sm btn-outline-secondary w-100 cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => handleImageUpload(e.target.files[0], setSealImage)}
                          />
                          Upload Seal File
                        </label>
                      </div>

                      <div className="mt-2">
                        <div className="d-flex justify-content-between small fw-semibold mb-1">
                          <span>Seal Size</span>
                          <span className="cert-slider-val">{sealSize}px</span>
                        </div>
                        <Form.Range
                          min={40}
                          max={200}
                          value={sealSize}
                          onChange={(e) => setSealSize(Number(e.target.value))}
                        />
                      </div>

                      <div className="mt-2">
                        <Form.Label className="small fw-semibold mb-1">Position</Form.Label>
                        <Form.Select
                          size="sm"
                          value={sealPosition}
                          onChange={(e) => setSealPosition(e.target.value)}
                        >
                          <option value="bottom-center">Bottom Center</option>
                          <option value="bottom-left">Bottom Left</option>
                          <option value="bottom-right">Bottom Right</option>
                          <option value="top-left">Top Left</option>
                          <option value="top-right">Top Right</option>
                        </Form.Select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Live Preview Panel */}
          <div className="cert-preview-panel">
            <div className="p-3 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-2 bg-light-subtle">
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-primary-subtle text-primary fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>
                  Live Canvas
                </span>
                <span className="small text-muted">
                  A4 Frame (~800×565px) • 300ms Debounce
                </span>
              </div>

              <div className="d-flex align-items-center gap-2">
                <Form.Select
                  size="sm"
                  style={{ width: 'auto', minWidth: 170 }}
                  value={previewStudentId}
                  onChange={(e) => setPreviewStudentId(e.target.value)}
                >
                  <option value="sample">Rahul Sharma (Sample)</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                  ))}
                </Form.Select>

                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={handleDownloadSamplePDF}
                  disabled={isDownloading}
                  className="d-flex align-items-center gap-1.5"
                >
                  <FaDownload size={11} />
                  <span>{isDownloading ? 'Generating...' : 'Download Sample PDF'}</span>
                </Button>
              </div>
            </div>

            {/* Scrollable Container with Scaled Canvas Wrapper */}
            <div className="cert-canvas-container">
              <div className="cert-canvas-wrapper">
                <CertificateDocument
                  ref={previewRef}
                  design={debouncedDesign}
                  studentName={previewStudentName}
                  courseName={previewCourseName}
                  certId={previewCertId}
                  issuedAt={previewIssuedAt}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. ISSUED CERTIFICATES LEDGER TAB ── */}
      {activeTab === 'ledger' && (
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
          <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h5 className="fw-bold mb-0">Issued Certificates Ledger</h5>
              <small className="text-muted">Historical certificates retain their snapshotted designs upon issuance.</small>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowIssueModal(true)}
              className="d-flex align-items-center gap-1.5 rounded-pill px-3"
            >
              <FaPlus size={11} />
              <span>Issue New Credential</span>
            </Button>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead className="bg-light-subtle text-muted text-uppercase small">
                  <tr>
                    <th className="ps-4">Certificate ID</th>
                    <th>Student</th>
                    <th>Course / Program</th>
                    <th>Issued Date</th>
                    <th>Status</th>
                    <th className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-5 text-muted">
                        No certificates issued yet. Use the designer to issue credentials to students.
                      </td>
                    </tr>
                  ) : (
                    certificates.map(cert => (
                      <tr key={cert.id}>
                        <td className="ps-4 font-monospace fw-bold small text-primary">
                          {cert.certificateId}
                        </td>
                        <td className="fw-semibold">{cert.studentName}</td>
                        <td>{cert.courseName}</td>
                        <td className="small text-muted">
                          {new Date(cert.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td>
                          {cert.isRevoked ? (
                            <Badge bg="danger">Revoked</Badge>
                          ) : (
                            <Badge bg="success">Valid / Verified</Badge>
                          )}
                        </td>
                        <td className="text-end pe-4">
                          <div className="d-flex justify-content-end gap-2">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => setViewCertModal(cert)}
                              title="Inspect & Download Certificate"
                            >
                              <FaEye size={12} />
                            </Button>
                            {!cert.isRevoked && (
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => {
                                  if (window.confirm(`Revoke certificate ${cert.certificateId}?`)) {
                                    revokeCertificate(cert.id);
                                    toast.success('Certificate revoked.');
                                  }
                                }}
                                title="Revoke Certificate"
                              >
                                Revoke
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* ── 3. ELIGIBLE STUDENTS TAB ── */}
      {activeTab === 'eligible' && (
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
          <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h5 className="fw-bold mb-0">Students Eligible for Certification</h5>
              <small className="text-muted">Students who have achieved 100% course completion and have no existing active certificate.</small>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead className="bg-light-subtle text-muted text-uppercase small">
                  <tr>
                    <th className="ps-4">Student</th>
                    <th>Batch</th>
                    <th>Program</th>
                    <th>Progress</th>
                    <th className="text-end pe-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {eligibleAwaitingList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-5 text-muted">
                        No students currently awaiting certificate issuance.
                      </td>
                    </tr>
                  ) : (
                    eligibleAwaitingList.map(rec => (
                      <tr key={rec.student.id}>
                        <td className="ps-4">
                          <div className="fw-bold">{rec.student.name}</div>
                          <div className="small text-muted">{rec.student.email}</div>
                        </td>
                        <td>{rec.batch?.name || 'Assigned Cohort'}</td>
                        <td>{rec.course?.title || 'Course'}</td>
                        <td>
                          <Badge bg="success">100% Complete</Badge>
                        </td>
                        <td className="text-end pe-4">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => {
                              issueCertificate(rec.student.id, rec.course.title, currentTemplate.id);
                              toast.success(`Issued certificate to ${rec.student.name}`);
                            }}
                          >
                            Issue Now
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* ── MODAL: SAVE AS NEW TEMPLATE ── */}
      <Modal show={showSaveAsModal} onHide={() => setShowSaveAsModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h6 fw-bold mb-0">Save Template As New</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label className="small fw-semibold">New Template Name</Form.Label>
            <Form.Control
              type="text"
              value={saveAsName}
              onChange={(e) => setSaveAsName(e.target.value)}
              placeholder="e.g. Modern Sapphire Distinction"
              autoFocus
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowSaveAsModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSaveAsNew}>
            Save As New
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── MODAL: DIRECT CERTIFICATE ISSUE ── */}
      <Modal show={showIssueModal} onHide={() => setShowIssueModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h6 fw-bold mb-0">Direct Certificate Issuance</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSingleIssue}>
          <Modal.Body className="space-y-3">
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">Select Student</Form.Label>
              <Form.Select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                required
              >
                <option value="">-- Choose Student --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">Course / Program</Form.Label>
              <Form.Control
                type="text"
                value={selectedCourseName}
                onChange={(e) => setSelectedCourseName(e.target.value)}
                placeholder="e.g. Full-Stack Web Development"
                required
              />
            </Form.Group>

            <div className="p-3 bg-light-subtle rounded-3 small">
              <strong>Template Applied:</strong> {currentTemplate.name}
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                The active template design will be permanently snapshotted into this certificate.
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={() => setShowIssueModal(false)}>
              Cancel
            </Button>
            <Button variant="success" size="sm" type="submit">
              Issue Certificate
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ── MODAL: VIEW & DOWNLOAD ISSUED CERTIFICATE ── */}
      <Modal
        show={Boolean(viewCertModal)}
        onHide={() => setViewCertModal(null)}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="h6 fw-bold mb-0">
            Certificate Credential: {viewCertModal?.certificateId}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 d-flex justify-content-center bg-dark-subtle">
          {viewCertModal && (
            <div style={{ maxWidth: 840, width: '100%' }}>
              <CertificateDocument
                ref={modalCertRef}
                design={getCertificateDesign(viewCertModal, certificateTemplates)}
                studentName={viewCertModal.studentName}
                courseName={viewCertModal.courseName}
                certId={viewCertModal.certificateId}
                issuedAt={viewCertModal.issuedAt}
              />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <span className="small text-muted">
            Snapshotted template: {viewCertModal?.instituteName || 'CodeLift Academy'}
          </span>
          <div className="d-flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setViewCertModal(null)}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleModalDownloadPDF}
              disabled={modalDownloading}
              className="d-flex align-items-center gap-1.5"
            >
              <FaDownload size={12} />
              <span>{modalDownloading ? 'Downloading...' : 'Download Full-Bleed PDF'}</span>
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Notification Modal for newly issued certificate */}
      {activeNotification && (
        <NotificationModal
          notification={activeNotification}
          onClose={() => setActiveNotification(null)}
        />
      )}
    </div>
  );
}
