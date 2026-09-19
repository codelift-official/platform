import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import toast from 'react-hot-toast';
import {
  FaCogs,
  FaSave,
  FaQrcode,
  FaEnvelope,
  FaPaperPlane,
  FaShieldAlt,
  FaCopy,
  FaCheck,
  FaInfoCircle,
  FaExclamationTriangle,
  FaSyncAlt,
  FaChevronDown,
  FaChevronUp,
  FaGraduationCap,
  FaSlidersH
} from 'react-icons/fa';
import {
  MONTHLY_EMAIL_QUOTA,
  QUOTA_WARNING_THRESHOLD,
  QUOTA_BLOCK_THRESHOLD,
  DEFAULT_EMAIL_TEMPLATES,
  getMonthlyEmailUsage,
  testEmailConfiguration
} from '../../services/emailService';

export default function PlatformSettings() {
  const { platformSettings, updatePlatformSettings } = useData();

  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'email_config' | 'email_templates'

  // General Platform Settings State
  const [revenueSplit, setRevenueSplit] = useState(platformSettings?.revenueSplit || 100);
  const [paymentInstructions, setPaymentInstructions] = useState(
    platformSettings?.paymentInstructions || 'UPI: codelift@upi | Bank Transfer: HDFC Bank A/C 98765432101, IFSC: HDFC0001234'
  );
  const [instituteName, setInstituteName] = useState(platformSettings?.instituteName || '');
  const [signatoryName, setSignatoryName] = useState(platformSettings?.signatoryName || '');
  const [signatoryTitle, setSignatoryTitle] = useState(platformSettings?.signatoryTitle || '');
  const [featureFlags, setFeatureFlags] = useState(
    platformSettings?.featureFlags || {
      marketplaceEnabled: true,
      problemSolvingEnabled: true,
      autoCertificates: false
    }
  );

  // EmailJS Engine State
  const initialEmailSettings = platformSettings?.emailSettings || {
    enabled: false,
    serviceId: '',
    templateId: '',
    publicKey: '',
    supportEmail: 'support@codelift.dev',
    emailEventTemplates: DEFAULT_EMAIL_TEMPLATES
  };

  const [emailEnabled, setEmailEnabled] = useState(Boolean(initialEmailSettings.enabled));
  const [serviceId, setServiceId] = useState(initialEmailSettings.serviceId || '');
  const [templateId, setTemplateId] = useState(initialEmailSettings.templateId || '');
  const [publicKey, setPublicKey] = useState(initialEmailSettings.publicKey || '');
  const [supportEmail, setSupportEmail] = useState(initialEmailSettings.supportEmail || 'support@codelift.dev');

  // Per-Event Templates Dictionary State
  const [eventTemplates, setEventTemplates] = useState(() => {
    const existing = initialEmailSettings.emailEventTemplates || {};
    const merged = {};
    Object.keys(DEFAULT_EMAIL_TEMPLATES).forEach((evtKey) => {
      merged[evtKey] = {
        ...DEFAULT_EMAIL_TEMPLATES[evtKey],
        ...(existing[evtKey] || {})
      };
    });
    return merged;
  });

  // UI state for EmailJS tabs
  const [monthlyUsage, setMonthlyUsage] = useState(0);
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all'); // 'all' | 'transactional' | 'bulk'
  const [expandedEvent, setExpandedEvent] = useState(null);

  // Universal HTML template to copy into EmailJS dashboard
  const UNIVERSAL_HTML_CODE = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; color: #1e293b; border-radius: 12px; border: 1px solid #e2e8f0;">
  <div style="padding-bottom: 16px; margin-bottom: 20px; border-bottom: 2px solid #15803d;">
    <h2 style="margin: 0; color: #15803d; font-size: 20px;">{{heading}}</h2>
  </div>
  <p style="font-size: 15px; margin-bottom: 16px;">Hi <strong>{{to_name}}</strong>,</p>
  <div style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 24px; white-space: pre-line;">
{{message}}
  </div>
  <div style="text-align: center; margin-bottom: 24px;">
    <a href="{{action_url}}" style="display: inline-block; padding: 12px 28px; background: #15803d; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px;">
      {{action_text}}
    </a>
  </div>
  <div style="padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.5;">
    <p style="margin: 0 0 4px 0;">Best regards,<br><strong>{{platform_name}}</strong></p>
    <p style="margin: 8px 0 0 0; font-size: 11px; color: #94a3b8;">You received this automated notification regarding your enrollment and student portal activities.</p>
  </div>
</div>`;

  // Fetch monthly quota count
  const refreshQuotaCount = async () => {
    setIsLoadingUsage(true);
    try {
      const count = await getMonthlyEmailUsage();
      setMonthlyUsage(count);
    } catch (_) {
    } finally {
      setIsLoadingUsage(false);
    }
  };

  useEffect(() => {
    refreshQuotaCount();
  }, []);

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(UNIVERSAL_HTML_CODE);
    setCopiedTemplate(true);
    toast.success('Universal EmailJS HTML Template copied to clipboard!');
    setTimeout(() => setCopiedTemplate(false), 3000);
  };

  const handleTestEmail = async () => {
    if (!testEmailAddress || !testEmailAddress.includes('@')) {
      toast.error('Please enter a valid recipient email address for the test.');
      return;
    }
    if (!serviceId || !templateId || !publicKey) {
      toast.error('Please fill in Service ID, Template ID, and Public Key first.');
      return;
    }

    setIsSendingTest(true);
    try {
      const currentSettings = {
        enabled: true,
        serviceId: serviceId.trim(),
        templateId: templateId.trim(),
        publicKey: publicKey.trim(),
        supportEmail: supportEmail.trim(),
        instituteName: instituteName || 'CodeLift Academy'
      };

      const result = await testEmailConfiguration(testEmailAddress.trim(), currentSettings);
      if (result.success) {
        toast.success(`Test email sent successfully to ${testEmailAddress}! 🚀`);
        refreshQuotaCount();
      } else {
        toast.error(`Test failed: ${result.error || result.reason}`);
      }
    } catch (err) {
      toast.error(`EmailJS error: ${err.message}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleToggleEvent = (evtKey) => {
    setEventTemplates((prev) => ({
      ...prev,
      [evtKey]: {
        ...prev[evtKey],
        enabled: !prev[evtKey]?.enabled
      }
    }));
  };

  const handleTemplateFieldChange = (evtKey, field, value) => {
    setEventTemplates((prev) => ({
      ...prev,
      [evtKey]: {
        ...prev[evtKey],
        [field]: value
      }
    }));
  };

  const handleResetTemplate = (evtKey) => {
    setEventTemplates((prev) => ({
      ...prev,
      [evtKey]: {
        ...DEFAULT_EMAIL_TEMPLATES[evtKey]
      }
    }));
    toast.success(`Reset "${DEFAULT_EMAIL_TEMPLATES[evtKey]?.label}" to default template`);
  };

  const handleInsertTag = (evtKey, field, tag) => {
    const currentVal = eventTemplates[evtKey]?.[field] || '';
    handleTemplateFieldChange(evtKey, field, `${currentVal} {{${tag}}}`);
  };

  const handleSaveAll = (e) => {
    if (e) e.preventDefault();

    const updatedEmailSettings = {
      enabled: Boolean(emailEnabled),
      serviceId: serviceId.trim(),
      templateId: templateId.trim(),
      publicKey: publicKey.trim(),
      supportEmail: supportEmail.trim(),
      emailEventTemplates: eventTemplates
    };

    updatePlatformSettings({
      revenueSplit: Number(revenueSplit),
      paymentInstructions,
      instituteName,
      signatoryName,
      signatoryTitle,
      featureFlags,
      emailSettings: updatedEmailSettings
    });

    toast.success('All platform configurations and email templates saved!');
  };

  // Quota Metrics
  const remainingEmails = Math.max(0, MONTHLY_EMAIL_QUOTA - monthlyUsage);
  const quotaPercentage = Math.min(100, Math.round((monthlyUsage / MONTHLY_EMAIL_QUOTA) * 100));
  const isWarning = monthlyUsage >= QUOTA_WARNING_THRESHOLD;
  const isBlocked = monthlyUsage >= QUOTA_BLOCK_THRESHOLD;

  // Filtered Event List
  const eventKeys = Object.keys(eventTemplates).filter((key) => {
    if (filterCategory === 'transactional') return !eventTemplates[key]?.isBulk;
    if (filterCategory === 'bulk') return Boolean(eventTemplates[key]?.isBulk);
    return true;
  });

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4" style={{ background: 'var(--card-bg, #fff)' }}>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 border-bottom pb-3">
        <div>
          <h4 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <FaCogs className="text-success" /> Platform Settings & Notification Engine
          </h4>
          <p className="text-muted small mb-0">
            Configure institute credentials, EmailJS notifications, monthly quota controls, and dynamic event templates.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          className="btn btn-success rounded-pill px-4 py-2 font-bold shadow-sm d-flex align-items-center gap-2"
        >
          <FaSave /> Save Changes
        </button>
      </div>

      {/* Tabs Navigation */}
      <ul className="nav nav-pills gap-2 mb-4 p-1 rounded-3" style={{ background: 'var(--card-bg-alt, rgba(0,0,0,0.03))' }}>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link rounded-3 fw-semibold px-3 py-2 d-flex align-items-center gap-2 ${activeTab === 'general' ? 'active bg-success text-white' : 'text-secondary'}`}
            onClick={() => setActiveTab('general')}
          >
            <FaGraduationCap /> Academy & General
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link rounded-3 fw-semibold px-3 py-2 d-flex align-items-center gap-2 ${activeTab === 'email_config' ? 'active bg-success text-white' : 'text-secondary'}`}
            onClick={() => setActiveTab('email_config')}
          >
            <FaEnvelope /> EmailJS Engine & Quota
            {isBlocked ? (
              <span className="badge bg-danger rounded-pill">Blocked</span>
            ) : isWarning ? (
              <span className="badge bg-warning text-dark rounded-pill">80% Used</span>
            ) : null}
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link rounded-3 fw-semibold px-3 py-2 d-flex align-items-center gap-2 ${activeTab === 'email_templates' ? 'active bg-success text-white' : 'text-secondary'}`}
            onClick={() => setActiveTab('email_templates')}
          >
            <FaSlidersH /> Event Toggles & Templates ({Object.keys(eventTemplates).length})
          </button>
        </li>
      </ul>

      {/* TAB 1: GENERAL & ACADEMY SETTINGS */}
      {activeTab === 'general' && (
        <div>
          {/* Payment Instructions */}
          <div className="mb-4 p-3 rounded-3 border" style={{ background: 'var(--card-bg-alt, rgba(255,255,255,0.04))', borderColor: 'var(--border-color)' }}>
            <h6 className="fw-bold mb-2 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <FaQrcode className="text-success" /> Manual Tuition Payment Details (UPI / Bank Transfer)
            </h6>
            <p className="text-muted small mb-2">This payment guidance is displayed on student fee invoices, WhatsApp checkout, and fee reminder emails.</p>
            <textarea
              className="form-control"
              rows={3}
              value={paymentInstructions}
              onChange={(e) => setPaymentInstructions(e.target.value)}
            ></textarea>
          </div>

          {/* Institute & Certificate Signatory Settings */}
          <div className="mb-4 p-3 rounded-3 border" style={{ background: 'var(--card-bg-alt, rgba(255,255,255,0.04))', borderColor: 'var(--border-color)' }}>
            <h6 className="fw-bold mb-2 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              🎓 Academy & Certificate Credentials
            </h6>
            <p className="text-muted small mb-3">These values are automatically bound to student certificates upon graduation and used in email sender signatures.</p>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-muted">Academy / Institute Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={instituteName}
                  onChange={(e) => setInstituteName(e.target.value)}
                  placeholder="e.g. CodeLift Engineering Academy"
                />
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label small fw-semibold text-muted">Lead Instructor / Signatory</label>
                <input
                  type="text"
                  className="form-control"
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  placeholder="e.g. Dr. A. Kumar"
                />
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label small fw-semibold text-muted">Signatory Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={signatoryTitle}
                  onChange={(e) => setSignatoryTitle(e.target.value)}
                  placeholder="e.g. Director of Academic Affairs"
                />
              </div>
            </div>
          </div>

          {/* Feature Flags */}
          <div className="mb-4 p-3 rounded-3 border" style={{ background: 'var(--card-bg-alt, rgba(255,255,255,0.04))', borderColor: 'var(--border-color)' }}>
            <h6 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>Platform Feature Flags</h6>
            <div className="form-check form-switch mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="flagMarketplace"
                checked={featureFlags.marketplaceEnabled}
                onChange={(e) => setFeatureFlags({ ...featureFlags, marketplaceEnabled: e.target.checked })}
              />
              <label className="form-check-label font-semibold" htmlFor="flagMarketplace">
                Enable Public Course Marketplace
              </label>
            </div>
            <div className="form-check form-switch mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="flagProblemSolving"
                checked={featureFlags.problemSolvingEnabled}
                onChange={(e) => setFeatureFlags({ ...featureFlags, problemSolvingEnabled: e.target.checked })}
              />
              <label className="form-check-label font-semibold" htmlFor="flagProblemSolving">
                Enable Problem Solving Module (50+ Challenges)
              </label>
            </div>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="flagAutoCert"
                checked={featureFlags.autoCertificates}
                onChange={(e) => setFeatureFlags({ ...featureFlags, autoCertificates: e.target.checked })}
              />
              <label className="form-check-label font-semibold" htmlFor="flagAutoCert">
                Auto-generate Certificates on 100% Course Progress
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EMAILJS ENGINE CONFIGURATION & QUOTA */}
      {activeTab === 'email_config' && (
        <div>
          {/* Monthly Quota Widget */}
          <div className="card mb-4 border rounded-3 p-3" style={{ background: isBlocked ? 'rgba(239, 68, 68, 0.08)' : isWarning ? 'rgba(245, 158, 11, 0.08)' : 'rgba(34, 197, 94, 0.08)' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center gap-2">
                <FaEnvelope className={isBlocked ? 'text-danger' : isWarning ? 'text-warning' : 'text-success'} />
                <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                  EmailJS Monthly Quota (Free Tier: 200 emails / month)
                </strong>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 rounded-pill"
                onClick={refreshQuotaCount}
                disabled={isLoadingUsage}
              >
                <FaSyncAlt className={isLoadingUsage ? 'fa-spin' : ''} size={11} /> Refresh
              </button>
            </div>

            <div className="progress mb-2" style={{ height: 10 }}>
              <div
                className={`progress-bar ${isBlocked ? 'bg-danger' : isWarning ? 'bg-warning' : 'bg-success'}`}
                role="progressbar"
                style={{ width: `${quotaPercentage}%` }}
                aria-valuenow={monthlyUsage}
                aria-valuemin="0"
                aria-valuemax={MONTHLY_EMAIL_QUOTA}
              ></div>
            </div>

            <div className="d-flex justify-content-between align-items-center small">
              <span className="fw-bold" style={{ color: 'var(--text-primary)' }}>
                📧 Dispatched this month: {monthlyUsage} / {MONTHLY_EMAIL_QUOTA} ({quotaPercentage}%)
              </span>
              <span className={isBlocked ? 'text-danger fw-bold' : isWarning ? 'text-warning fw-bold' : 'text-muted'}>
                {isBlocked ? '⚠️ Monthly quota exhausted (95%+). Bulk sends blocked.' : isWarning ? `⚠️ Low quota: ${remainingEmails} emails left` : `✅ ${remainingEmails} emails remaining`}
              </span>
            </div>
          </div>

          {/* Domain Restriction Security Notice */}
          <div className="alert alert-warning d-flex align-items-start gap-3 rounded-3 mb-4" style={{ fontSize: '0.875rem' }}>
            <FaShieldAlt className="text-warning mt-1 flex-shrink-0" size={20} />
            <div>
              <strong className="d-block mb-1">Mandatory Security Step: Domain Origin Restriction</strong>
              EmailJS operates in the browser using your public key. To prevent third parties from abusing your credentials, you <strong>must</strong> restrict access in your EmailJS dashboard:
              <ol className="mb-1 mt-1 ps-3">
                <li>Log in to <strong>emailjs.com</strong> → <strong>Account</strong> → <strong>Security</strong></li>
                <li>Under <strong>Allowed Origins</strong>, add:
                  <code className="mx-1 bg-white px-1 py-0.5 border rounded">https://codelift-official.github.io</code> and
                  <code className="mx-1 bg-white px-1 py-0.5 border rounded">http://localhost:5173</code>
                </li>
                <li>Enable <strong>"Restrict to allowed origins"</strong> and click <strong>Save</strong>.</li>
              </ol>
            </div>
          </div>

          {/* Setup Guide Accordion */}
          <div className="border rounded-3 mb-4 overflow-hidden">
            <button
              type="button"
              className="w-100 p-3 text-start border-0 d-flex justify-content-between align-items-center fw-bold"
              style={{ background: 'var(--card-bg-alt, rgba(0,0,0,0.03))', color: 'var(--text-primary)' }}
              onClick={() => setShowInstructions(!showInstructions)}
            >
              <span className="d-flex align-items-center gap-2">
                <FaInfoCircle className="text-primary" /> Step-by-Step EmailJS Setup Guide (Universal 1-Template System)
              </span>
              {showInstructions ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {showInstructions && (
              <div className="p-3 border-top" style={{ fontSize: '0.875rem', background: 'var(--card-bg)' }}>
                <p className="text-muted mb-3">
                  Because EmailJS's free tier limits accounts to 2 templates, CodeLift uses an industry-standard <strong>Universal Dynamic Template Pattern</strong>. You only need to create <strong>1 single template</strong> in your EmailJS dashboard!
                </p>

                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <div className="p-3 border rounded-3 h-100">
                      <strong>Step 1: Create Email Service</strong>
                      <p className="small text-muted mb-0 mt-1">
                        Go to <strong>Email Services</strong> → <strong>Add New Service</strong> → select <strong>Gmail</strong> (or your SMTP). Note your <code>Service ID</code> (e.g., <code>service_xxxx</code>).
                      </p>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="p-3 border rounded-3 h-100">
                      <strong>Step 2: Copy Public Key</strong>
                      <p className="small text-muted mb-0 mt-1">
                        Go to <strong>Account</strong> → <strong>API Keys</strong>. Copy your <code>Public Key</code> (e.g., <code>user_xxxx</code>).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 border rounded-3 mb-3 bg-light text-dark">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong>Step 3: Create Universal Email Template</strong>
                    <button
                      type="button"
                      onClick={handleCopyTemplate}
                      className="btn btn-sm btn-dark d-flex align-items-center gap-1"
                    >
                      {copiedTemplate ? <FaCheck className="text-success" /> : <FaCopy />}
                      <span>{copiedTemplate ? 'Copied HTML!' : 'Copy HTML Template'}</span>
                    </button>
                  </div>
                  <p className="small text-muted mb-2">
                    In <strong>Email Templates</strong> → <strong>Create New Template</strong>:
                    <br />
                    • Set <strong>Subject</strong>: <code>&#123;&#123;subject&#125;&#125;</code>
                    <br />
                    • Set <strong>To Email</strong>: <code>&#123;&#123;to_email&#125;&#125;</code>
                    <br />
                    • Set <strong>To Name</strong>: <code>&#123;&#123;to_name&#125;&#125;</code>
                    <br />
                    • Switch Content to <strong>HTML source code</strong> and paste the copied snippet below.
                  </p>
                  <textarea
                    className="form-control font-monospace small"
                    rows={4}
                    readOnly
                    value={UNIVERSAL_HTML_CODE}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Credentials Form */}
          <div className="p-3 rounded-3 border mb-4" style={{ background: 'var(--card-bg-alt, rgba(255,255,255,0.04))' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <FaEnvelope className="text-success" /> EmailJS API Credentials
              </h6>
              <div className="form-check form-switch mb-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="toggleEmailService"
                  checked={emailEnabled}
                  onChange={(e) => setEmailEnabled(e.target.checked)}
                />
                <label className="form-check-label fw-bold small" htmlFor="toggleEmailService">
                  {emailEnabled ? 'Automated Emails ENABLED' : 'Automated Emails DISABLED'}
                </label>
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold text-muted">EmailJS Service ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  placeholder="e.g. service_xxxxxxx"
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold text-muted">EmailJS Template ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  placeholder="e.g. template_xxxxxxx"
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold text-muted">EmailJS Public Key</label>
                <input
                  type="text"
                  className="form-control"
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                  placeholder="e.g. user_xxxxxxx"
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-muted">Reply-To / Support Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="support@codelift.dev"
                />
              </div>
            </div>

            {/* Test Email Section */}
            <div className="border-top pt-3 mt-3">
              <label className="form-label small fw-semibold text-muted">Send Live Test Email to Verify Credentials</label>
              <div className="input-group" style={{ maxWidth: 500 }}>
                <input
                  type="email"
                  className="form-control"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  placeholder="Enter your personal email to test"
                />
                <button
                  type="button"
                  onClick={handleTestEmail}
                  disabled={isSendingTest || !serviceId || !templateId || !publicKey}
                  className="btn btn-outline-success d-flex align-items-center gap-2"
                >
                  <FaPaperPlane />
                  <span>{isSendingTest ? 'Sending...' : 'Send Test'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PER-EVENT TOGGLES & TEMPLATES */}
      {activeTab === 'email_templates' && (
        <div>
          {/* Category Filter Pills & Quota Advice */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
            <div className="btn-group btn-group-sm">
              <button
                type="button"
                className={`btn ${filterCategory === 'all' ? 'btn-success' : 'btn-outline-secondary'}`}
                onClick={() => setFilterCategory('all')}
              >
                All Events ({Object.keys(eventTemplates).length})
              </button>
              <button
                type="button"
                className={`btn ${filterCategory === 'transactional' ? 'btn-success' : 'btn-outline-secondary'}`}
                onClick={() => setFilterCategory('transactional')}
              >
                Transactional (Single-Student)
              </button>
              <button
                type="button"
                className={`btn ${filterCategory === 'bulk' ? 'btn-success' : 'btn-outline-secondary'}`}
                onClick={() => setFilterCategory('bulk')}
              >
                Bulk (Cohort-Wide / Quota Intensive)
              </button>
            </div>

            <span className="small text-muted">
              Click on any event below to customize subject, message text, and button link.
            </span>
          </div>

          {/* Event Templates List */}
          <div className="d-flex flex-column gap-3">
            {eventKeys.map((evtKey) => {
              const tmpl = eventTemplates[evtKey] || DEFAULT_EMAIL_TEMPLATES[evtKey];
              const isExpanded = expandedEvent === evtKey;
              const isBulk = Boolean(tmpl.isBulk);

              return (
                <div
                  key={evtKey}
                  className="border rounded-3 p-3"
                  style={{
                    background: tmpl.enabled ? 'var(--card-bg)' : 'var(--card-bg-alt, rgba(0,0,0,0.02))',
                    opacity: tmpl.enabled ? 1 : 0.75
                  }}
                >
                  {/* Event Header Row */}
                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
                    <div className="d-flex align-items-center gap-2">
                      <div className="form-check form-switch mb-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`toggle_${evtKey}`}
                          checked={Boolean(tmpl.enabled)}
                          onChange={() => handleToggleEvent(evtKey)}
                        />
                      </div>
                      <div>
                        <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                          {tmpl.label || evtKey}
                        </strong>
                        <span className="ms-2 font-monospace text-muted small">({evtKey})</span>
                        {isBulk ? (
                          <span className="badge bg-warning text-dark ms-2" style={{ fontSize: '0.68rem' }}>
                            Bulk Send
                          </span>
                        ) : (
                          <span className="badge bg-light text-secondary border ms-2" style={{ fontSize: '0.68rem' }}>
                            Transactional
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 rounded-pill px-3"
                        onClick={() => setExpandedEvent(isExpanded ? null : evtKey)}
                      >
                        <span>{isExpanded ? 'Collapse' : 'Customize Template'}</span>
                        {isExpanded ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Template Editor */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-top">
                      <div className="row g-3 mb-3">
                        <div className="col-12 col-md-6">
                          <label className="form-label small fw-semibold text-muted">Email Subject Line</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={tmpl.subject || ''}
                            onChange={(e) => handleTemplateFieldChange(evtKey, 'subject', e.target.value)}
                          />
                        </div>
                        <div className="col-12 col-md-6">
                          <label className="form-label small fw-semibold text-muted">Heading (Top of Email)</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={tmpl.heading || ''}
                            onChange={(e) => handleTemplateFieldChange(evtKey, 'heading', e.target.value)}
                          />
                        </div>
                        <div className="col-12">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <label className="form-label small fw-semibold text-muted mb-0">Message Body</label>
                            <span className="small text-muted" style={{ fontSize: '0.75rem' }}>
                              Available variables: click to insert
                            </span>
                          </div>

                          {/* Variable Tag Badges */}
                          <div className="d-flex flex-wrap gap-1 mb-2">
                            {[
                              'student_name', 'student_email', 'batch_name', 'course_title',
                              'test_title', 'score', 'percentage', 'assignment_title',
                              'marks', 'max_marks', 'due_amount', 'amount_paid',
                              'receipt_no', 'certificate_id', 'platform_name'
                            ].map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                className="badge bg-light text-dark border px-2 py-1 text-decoration-none"
                                style={{ cursor: 'pointer', fontSize: '0.72rem' }}
                                onClick={() => handleInsertTag(evtKey, 'body', tag)}
                                title={`Click to insert {{${tag}}}`}
                              >
                                + {`{{${tag}}}`}
                              </button>
                            ))}
                          </div>

                          <textarea
                            className="form-control form-control-sm font-monospace"
                            rows={4}
                            value={tmpl.body || ''}
                            onChange={(e) => handleTemplateFieldChange(evtKey, 'body', e.target.value)}
                          ></textarea>
                        </div>

                        <div className="col-12 col-md-6">
                          <label className="form-label small fw-semibold text-muted">Action Button Text</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={tmpl.actionText || ''}
                            onChange={(e) => handleTemplateFieldChange(evtKey, 'actionText', e.target.value)}
                          />
                        </div>
                        <div className="col-12 col-md-6">
                          <label className="form-label small fw-semibold text-muted">Action URL (Link)</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={tmpl.actionUrl || ''}
                            onChange={(e) => handleTemplateFieldChange(evtKey, 'actionUrl', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="d-flex justify-content-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleResetTemplate(evtKey)}
                        >
                          Reset to Default
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
