import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import toast from 'react-hot-toast';
import { FaCogs, FaSave, FaPercentage, FaQrcode } from 'react-icons/fa';

export default function PlatformSettings() {
  const { platformSettings, updatePlatformSettings } = useData();

  const [revenueSplit, setRevenueSplit] = useState(platformSettings?.revenueSplit || 70);
  const [paymentInstructions, setPaymentInstructions] = useState(
    platformSettings?.paymentInstructions || 'UPI: codelift@upi | Bank Transfer: HDFC Bank A/C 98765432101, IFSC: HDFC0001234'
  );
  const [instituteName, setInstituteName] = useState(platformSettings?.instituteName || 'CodeLift Engineering Academy');
  const [signatoryName, setSignatoryName] = useState(platformSettings?.signatoryName || 'Ashish Kumar');
  const [signatoryTitle, setSignatoryTitle] = useState(platformSettings?.signatoryTitle || 'Director of Academic Affairs');
  const [featureFlags, setFeatureFlags] = useState(
    platformSettings?.featureFlags || {
      marketplaceEnabled: true,
      problemSolvingEnabled: true,
      autoCertificates: false
    }
  );

  const handleSave = (e) => {
    e.preventDefault();
    updatePlatformSettings({
      revenueSplit: Number(revenueSplit),
      paymentInstructions,
      instituteName,
      signatoryName,
      signatoryTitle,
      featureFlags
    });
    toast.success('Platform settings & configurations updated!');
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4">
      <h4 className="fw-bold mb-4 d-flex align-items-center gap-2">
        <FaCogs className="text-success" /> Platform Settings & Feature Flags
      </h4>

      <form onSubmit={handleSave}>
        {/* Payment Instructions */}
        <div className="mb-4 p-3 rounded-3 border" style={{ background: 'var(--card-bg-alt, rgba(255,255,255,0.04))', borderColor: 'var(--border-color)' }}>
          <h6 className="fw-bold mb-2 d-flex align-items-center gap-2">
            <FaQrcode /> Manual Payment Details (UPI / Bank Transfer)
          </h6>
          <p className="text-muted small">This message is displayed to students during course checkout.</p>
          <textarea
            className="form-control"
            rows={3}
            value={paymentInstructions}
            onChange={(e) => setPaymentInstructions(e.target.value)}
          ></textarea>
        </div>

        {/* Institute & Certificate Signatory Settings */}
        <div className="mb-4 p-3 rounded-3 border" style={{ background: 'var(--card-bg-alt, rgba(255,255,255,0.04))', borderColor: 'var(--border-color)' }}>
          <h6 className="fw-bold mb-2 d-flex align-items-center gap-2">
            🎓 Academy & Certificate Credentials
          </h6>
          <p className="text-muted small">These values are dynamically rendered on official student certificates upon issuance.</p>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold text-muted">Academy / Institute Name</label>
              <input
                type="text"
                className="form-control"
                value={instituteName}
                onChange={(e) => setInstituteName(e.target.value)}
                placeholder="CodeLift Engineering Academy"
              />
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label small fw-semibold text-muted">Lead Instructor / Signatory</label>
              <input
                type="text"
                className="form-control"
                value={signatoryName}
                onChange={(e) => setSignatoryName(e.target.value)}
                placeholder="Ashish Kumar"
              />
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label small fw-semibold text-muted">Signatory Title</label>
              <input
                type="text"
                className="form-control"
                value={signatoryTitle}
                onChange={(e) => setSignatoryTitle(e.target.value)}
                placeholder="Director of Academic Affairs"
              />
            </div>
          </div>
        </div>

        {/* Feature Flags */}
        <div className="mb-4 p-3 rounded-3 border" style={{ background: 'var(--card-bg-alt, rgba(255,255,255,0.04))', borderColor: 'var(--border-color)' }}>
          <h6 className="fw-bold mb-3">Feature Flags & System Toggles</h6>
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

        <button type="submit" className="btn btn-success rounded-pill px-5 py-2 font-bold shadow-sm">
          <FaSave className="me-2" /> Save Platform Settings
        </button>
      </form>
    </div>
  );
}
