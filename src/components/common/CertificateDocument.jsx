import React, { forwardRef } from 'react';
import { FaShieldAlt, FaAward } from 'react-icons/fa';

/**
 * Reusable, pixel-perfect Certificate Document.
 * Supports A4 Landscape, A4 Portrait, and Letter dimensions.
 * Full support for custom canvas, borders, inner borders, ribbons, side ribbons, logos, seals,
 * and 9 independently customizable text elements with placeholder interpolation.
 */
const CertificateDocument = forwardRef(function CertificateDocument(
  {
    design = {},
    studentName = 'Student',
    courseName = '',
    certId = 'CERT-2026-0001',
    issuedAt = new Date().toISOString(),
    isInteractive = false,
    className = '',
    style = {},
  },
  ref
) {
  const {
    accentColor = '#15803D',
    paperSize = 'a4-landscape',
    padding = 28,
    bgType = 'gradient',
    backgroundColor = '#ffffff',
    gradientStart = '#f0fdf4',
    gradientEnd = '#ffffff',
    gradientAngle = 135,
    bgStyle,
    bgImage = '',
    fontFamily = 'Georgia, serif',
    borderStyle = 'double',
    borderWidth = 4,
    borderColor = '#15803D',
    borderRadius = 8,
    isDark = false,
    textColor,
    subtitleColor,
    showCorners = true,
    showBadge = true,
    badgeText = 'ACADEMIC EXCELLENCE',
    instituteName = '',
    signatoryName = '',
    signatoryTitle = '',
    certTitle = 'CERTIFICATE OF COMPLETION',
    emblemType = 'cap',
    signatureStyle = 'cursive',
    showWatermark = true,
    innerBorder = { enabled: false, style: 'solid', width: 2, color: '#15803D', offset: 12 },
    ribbon = { enabled: false, position: 'top-center', style: 'straight', color: '#15803D', text: 'VERIFIED CREDENTIAL', textColor: '#ffffff', textSize: 12 },
    sideRibbon = { enabled: false, position: 'left', color: '#15803D', text: 'CODELIFT ACADEMY' },
    logo = { enabled: false, url: '', size: 60, position: 'top-left' },
    seal = { enabled: true, image: '', size: 60, position: 'bottom-center' },
    elements = {},
  } = design;

  // Paper Aspect Ratios
  const aspectMap = {
    'a4-landscape': '297 / 210',
    'a4-portrait': '210 / 297',
    'letter': '11 / 8.5',
  };
  const resolvedAspectRatio = aspectMap[paperSize] || aspectMap['a4-landscape'];

  const emblemIcon = '🚀';

  const signatureFontMap = {
    cursive: "'Dancing Script', 'Brush Script MT', cursive",
    calligraphy: "'Great Vibes', 'Allura', cursive",
    modern: "'Caveat', 'Segoe Script', cursive",
    formal: "'Georgia', serif",
  };
  const signatureFont = signatureFontMap[signatureStyle] || signatureFontMap.cursive;

  const resolvedBg = bgStyle || (bgType === 'solid' ? backgroundColor : `linear-gradient(${gradientAngle}deg, ${gradientStart} 0%, ${gradientEnd} 100%)`);
  const resolvedTextColor = textColor || (isDark ? '#F8FAFC' : '#1E293B');
  const resolvedSubColor = subtitleColor || (isDark ? '#94A3B8' : '#64748B');

  const formattedDate = issuedAt
    ? new Date(issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  // Resolve display values: explicit props win, else pull from the design
  // snapshot, but never display a bare {{placeholder}} literally.
  const resolveName = (propVal, designVal) => {
    const v = propVal || designVal || '';
    return typeof v === 'string' && v.includes('{{') ? '' : v;
  };
  const liveSignatoryName = resolveName(signatoryName, design.signatoryName);
  const liveSignatoryTitle = resolveName(signatoryTitle, design.signatoryTitle);
  const liveInstituteName = resolveName(instituteName, design.instituteName);
  const liveCertTitle = resolveName(certTitle, design.certTitle);

  // Placeholder interpolation helper
  const interpolate = (text) => {
    if (typeof text !== 'string') return '';
    return text
      .replace(/\{\{studentName\}\}/g, studentName)
      .replace(/\{\{courseName\}\}/g, courseName)
      .replace(/\{\{date\}\}/g, formattedDate)
      .replace(/\{\{certificateId\}\}/g, certId)
      .replace(/\{\{signatoryName\}\}/g, liveSignatoryName)
      .replace(/\{\{signatoryTitle\}\}/g, liveSignatoryTitle);
  };

  // Helper to resolve element styles with fallbacks
  const getElemStyle = (elemKey, fallback = {}) => {
    const el = elements[elemKey] || {};
    return {
      fontFamily: el.fontFamily || fallback.fontFamily || fontFamily,
      fontSize: el.fontSize ? `${el.fontSize}px` : fallback.fontSize || '1rem',
      fontWeight: el.fontWeight || fallback.fontWeight || 600,
      fontStyle: el.fontStyle || fallback.fontStyle || 'normal',
      letterSpacing: el.letterSpacing !== undefined ? `${el.letterSpacing}px` : (fallback.letterSpacing || 'normal'),
      textAlign: el.textAlign || fallback.textAlign || 'center',
      color: el.color || fallback.color || resolvedTextColor,
      transform: (el.xOffset || el.yPosition)
        ? `translate(${el.xOffset || 0}px, ${el.yPosition || 0}px)`
        : undefined,
      display: el.visible === false ? 'none' : undefined,
    };
  };

  // Helper for ribbon styling by position
  const getRibbonStyle = () => {
    const pos = ribbon.position || 'top-center';
    const isDiagonal = ribbon.style === 'diagonal';
    const base = {
      position: 'absolute',
      background: ribbon.color || accentColor,
      color: ribbon.textColor || '#ffffff',
      fontSize: `${ribbon.textSize || 12}px`,
      fontWeight: 800,
      letterSpacing: '2px',
      textTransform: 'uppercase',
      fontFamily: 'Inter, system-ui, sans-serif',
      zIndex: 15,
      boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
    };

    if (pos === 'top-center') {
      return { ...base, top: 0, left: 0, right: 0, padding: '6px 0', textAlign: 'center' };
    }
    if (pos === 'bottom-center') {
      return { ...base, bottom: 0, left: 0, right: 0, padding: '6px 0', textAlign: 'center' };
    }
    if (pos === 'top-left') {
      if (isDiagonal) {
        return { ...base, top: 22, left: -40, width: 160, padding: '4px 0', textAlign: 'center', transform: 'rotate(-45deg)' };
      }
      return { ...base, top: 12, left: 16, padding: '4px 14px', borderRadius: 4 };
    }
    if (pos === 'top-right') {
      if (isDiagonal) {
        return { ...base, top: 22, right: -40, width: 160, padding: '4px 0', textAlign: 'center', transform: 'rotate(45deg)' };
      }
      return { ...base, top: 12, right: 16, padding: '4px 14px', borderRadius: 4 };
    }
    if (pos === 'bottom-left') {
      if (isDiagonal) {
        return { ...base, bottom: 22, left: -40, width: 160, padding: '4px 0', textAlign: 'center', transform: 'rotate(45deg)' };
      }
      return { ...base, bottom: 12, left: 16, padding: '4px 14px', borderRadius: 4 };
    }
    if (pos === 'bottom-right') {
      if (isDiagonal) {
        return { ...base, bottom: 22, right: -40, width: 160, padding: '4px 0', textAlign: 'center', transform: 'rotate(-45deg)' };
      }
      return { ...base, bottom: 12, right: 16, padding: '4px 14px', borderRadius: 4 };
    }
    if (pos === 'left-center') {
      return { ...base, top: '50%', left: 0, padding: '4px 14px', transform: 'translateY(-50%)', borderRadius: '0 4px 4px 0' };
    }
    if (pos === 'right-center') {
      return { ...base, top: '50%', right: 0, padding: '4px 14px', transform: 'translateY(-50%)', borderRadius: '4px 0 0 4px' };
    }
    return { ...base, top: 0, left: 0, right: 0, padding: '6px 0', textAlign: 'center' };
  };

  // Helper for logo positioning
  const getLogoStyle = () => {
    const pos = logo.position || 'top-left';
    const sz = logo.size || 60;
    const base = { position: 'absolute', zIndex: 12, maxWidth: sz, maxHeight: sz, objectFit: 'contain' };
    if (pos === 'top-left') return { ...base, top: 20, left: 24 };
    if (pos === 'top-center') return { ...base, top: 20, left: '50%', transform: 'translateX(-50%)' };
    if (pos === 'top-right') return { ...base, top: 20, right: 24 };
    if (pos === 'bottom-left') return { ...base, bottom: 20, left: 24 };
    if (pos === 'bottom-right') return { ...base, bottom: 20, right: 24 };
    return { ...base, top: 20, left: 24 };
  };

  return (
    <div
      ref={ref}
      className={`certificate-document ${className}`}
      style={{
        width: '100%',
        aspectRatio: resolvedAspectRatio,
        background: resolvedBg,
        backgroundImage: bgImage ? `url(${bgImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: resolvedTextColor,
        fontFamily: fontFamily,
        border: `${borderWidth}px ${borderStyle} ${borderColor}`,
        borderRadius: `${borderRadius}px`,
        padding: `${padding}px`,
        boxSizing: 'border-box',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        userSelect: isInteractive ? 'none' : 'text',
        ...style,
      }}
    >
      {/* Decorative Inner Border */}
      {innerBorder?.enabled && (
        <div
          style={{
            position: 'absolute',
            top: `${innerBorder.offset || 12}px`,
            left: `${innerBorder.offset || 12}px`,
            right: `${innerBorder.offset || 12}px`,
            bottom: `${innerBorder.offset || 12}px`,
            border: `${innerBorder.width || 2}px ${innerBorder.style || 'solid'} ${innerBorder.color || accentColor}`,
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
      )}

      {/* Decorative Side Ribbon */}
      {sideRibbon?.enabled && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            [sideRibbon.position === 'right' ? 'right' : 'left']: 0,
            width: 32,
            backgroundColor: sideRibbon.color || accentColor,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 14,
            writingMode: 'vertical-rl',
            transform: sideRibbon.position === 'right' ? 'rotate(180deg)' : 'none',
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            boxShadow: '0 0 10px rgba(0,0,0,0.15)',
          }}
        >
          {sideRibbon.text || 'CODELIFT ACADEMY'}
        </div>
      )}

      {/* Logo Overlay */}
      {logo?.enabled && logo?.url && (
        <img
          src={logo.url}
          alt="Certificate Logo"
          style={getLogoStyle()}
        />
      )}

      {/* Background Watermark */}
      {showWatermark && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '13rem',
            opacity: isDark ? 0.05 : 0.04,
            pointerEvents: 'none',
            userSelect: 'none',
            lineHeight: 1,
            zIndex: 0,
          }}
          aria-hidden="true"
        >
          {emblemIcon}
        </div>
      )}

      {/* Decorative Ribbon */}
      {ribbon?.enabled && (
        <div style={getRibbonStyle()}>
          {ribbon.text || 'VERIFIED CREDENTIAL'}
        </div>
      )}

      {/* Decorative Corner Brackets */}
      {showCorners && (
        <>
          <div
            style={{
              position: 'absolute',
              top: ribbon?.enabled && ribbon?.position === 'top-center' ? 26 : 14,
              left: 14,
              width: 32,
              height: 32,
              borderTop: `${Math.max(2, borderWidth)}px ${borderStyle} ${accentColor}`,
              borderLeft: `${Math.max(2, borderWidth)}px ${borderStyle} ${accentColor}`,
              opacity: 0.85,
              zIndex: 3,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: ribbon?.enabled && ribbon?.position === 'top-center' ? 26 : 14,
              right: 14,
              width: 32,
              height: 32,
              borderTop: `${Math.max(2, borderWidth)}px ${borderStyle} ${accentColor}`,
              borderRight: `${Math.max(2, borderWidth)}px ${borderStyle} ${accentColor}`,
              opacity: 0.85,
              zIndex: 3,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 14,
              left: 14,
              width: 32,
              height: 32,
              borderBottom: `${Math.max(2, borderWidth)}px ${borderStyle} ${accentColor}`,
              borderLeft: `${Math.max(2, borderWidth)}px ${borderStyle} ${accentColor}`,
              opacity: 0.85,
              zIndex: 3,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 14,
              right: 14,
              width: 32,
              height: 32,
              borderBottom: `${Math.max(2, borderWidth)}px ${borderStyle} ${accentColor}`,
              borderRight: `${Math.max(2, borderWidth)}px ${borderStyle} ${accentColor}`,
              opacity: 0.85,
              zIndex: 3,
            }}
          />
        </>
      )}

      {/* Top Header Section: Institute Name, Emblem & Title */}
      <div style={{ position: 'relative', zIndex: 4, marginTop: ribbon?.enabled && ribbon?.position === 'top-center' ? 12 : 0 }}>
        <div
          style={{
            color: accentColor,
            fontSize: '0.82rem',
            fontWeight: 800,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginBottom: 6,
            textAlign: elements?.title?.textAlign || 'center',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {liveInstituteName}
        </div>

        <div style={{ fontSize: '2.2rem', lineHeight: 1, marginBottom: 6, textAlign: elements?.title?.textAlign || 'center' }}>
          {emblemIcon}
        </div>

        {/* 1. TITLE Element */}
        <h1
          style={{
            margin: '0 0 8px 0',
            lineHeight: 1.2,
            textTransform: 'uppercase',
            ...getElemStyle('title', {
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '1.6rem',
              fontWeight: 800,
              color: isDark ? '#F1F5F9' : '#1E293B',
              textAlign: 'center'
            })
          }}
        >
          {interpolate(elements?.title?.content || liveCertTitle)}
        </h1>

        <div
          style={{
            width: 70,
            height: 2,
            backgroundColor: accentColor,
            margin: (elements?.title?.textAlign === 'left') ? '0' : (elements?.title?.textAlign === 'right') ? '0 0 0 auto' : '0 auto',
            opacity: 0.7,
          }}
        />
      </div>

      {/* Recipient & Achievement Section */}
      <div style={{ position: 'relative', zIndex: 4, margin: '8px 0' }}>
        {/* 2. SUBTITLE Element */}
        <p
          style={{
            margin: '0 0 4px 0',
            ...getElemStyle('subtitle', {
              fontSize: '0.92rem',
              color: resolvedSubColor,
              textAlign: 'center',
              fontWeight: 500,
            })
          }}
        >
          {interpolate(elements?.subtitle?.content || 'This is proudly presented to')}
        </p>

        {/* 3. STUDENT NAME Element */}
        <h2
          style={{
            margin: '0 0 6px 0',
            lineHeight: 1.2,
            ...getElemStyle('studentName', {
              fontSize: '2.2rem',
              fontWeight: 800,
              color: accentColor,
              textAlign: 'center',
            })
          }}
        >
          {interpolate(elements?.studentName?.content || studentName)}
        </h2>

        {/* 5. COMPLETION LINE Element */}
        <p
          style={{
            margin: '0 0 6px 0',
            ...getElemStyle('completionLine', {
              fontSize: '0.88rem',
              color: resolvedSubColor,
              textAlign: 'center',
              fontWeight: 400,
            })
          }}
        >
          {interpolate(elements?.completionLine?.content || 'for successfully completing all curriculum requirements, practical assessments, and capstone engineering projects for')}
        </p>

        {/* 4. COURSE NAME Element */}
        <h3
          style={{
            margin: '0 0 6px 0',
            lineHeight: 1.3,
            ...getElemStyle('courseName', {
              fontSize: '1.35rem',
              fontWeight: 700,
              color: isDark ? '#F1F5F9' : '#0F172A',
              textAlign: 'center',
            })
          }}
        >
          {interpolate(elements?.courseName?.content || courseName)}
        </h3>

        {showBadge && (
          <div
            style={{
              textAlign: elements?.courseName?.textAlign || 'center',
              marginTop: 4,
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 14px',
                borderRadius: 20,
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                border: `1px solid ${accentColor}44`,
                color: accentColor,
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '1px',
                fontFamily: 'Inter, system-ui, sans-serif',
                textTransform: 'uppercase',
              }}
            >
              <FaAward size={12} />
              <span>{badgeText}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Signatories & Verification Section */}
      <div
        style={{
          borderTop: `1px solid ${accentColor}33`,
          paddingTop: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: 16,
          position: 'relative',
          zIndex: 4,
        }}
      >
        {/* Left: 6. DATE Element */}
        <div style={{ flex: 1, textAlign: elements?.date?.textAlign || 'left' }}>
          <div
            style={{
              fontSize: '0.68rem',
              color: resolvedSubColor,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            Date of Issue
          </div>
          <div
            style={{
              ...getElemStyle('date', {
                fontSize: '0.88rem',
                fontWeight: 700,
                color: isDark ? '#F1F5F9' : '#0F172A',
                textAlign: 'left'
              })
            }}
          >
            {interpolate(elements?.date?.content || formattedDate)}
          </div>
        </div>

        {/* Center: Official Seal & 7. CERTIFICATE ID Element */}
        <div style={{ flex: 1, textAlign: elements?.certificateId?.textAlign || 'center' }}>
          {seal?.enabled && (
            <div style={{ marginBottom: 3 }}>
              {seal.image ? (
                <img
                  src={seal.image}
                  alt="Seal"
                  style={{
                    maxHeight: seal.size || 50,
                    maxWidth: seal.size || 50,
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: accentColor,
                    fontFamily: 'Inter, system-ui, sans-serif',
                  }}
                >
                  <FaShieldAlt size={14} />
                  <span>Official Credential</span>
                </div>
              )}
            </div>
          )}
          <div
            style={{
              ...getElemStyle('certificateId', {
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '1px',
                color: resolvedSubColor,
                textAlign: 'center'
              })
            }}
          >
            {interpolate(elements?.certificateId?.content || certId)}
          </div>
        </div>

        {/* Right: 8. SIGNATURE NAME & 9. SIGNATURE TITLE Elements */}
        <div style={{ flex: 1, textAlign: elements?.signatureName?.textAlign || 'right' }}>
          <div
            style={{
              lineHeight: 1.1,
              marginBottom: 3,
              ...getElemStyle('signatureName', {
                fontSize: '1.35rem',
                fontWeight: 600,
                color: accentColor,
                fontFamily: signatureFont,
                textAlign: 'right'
              })
            }}
          >
            {interpolate(elements?.signatureName?.content || liveSignatoryName)}
          </div>
          <div
            style={{
              width: 130,
              height: 1,
              backgroundColor: `${accentColor}44`,
              marginLeft: elements?.signatureName?.textAlign === 'center' ? 'auto' : elements?.signatureName?.textAlign === 'left' ? '0' : 'auto',
              marginRight: elements?.signatureName?.textAlign === 'center' ? 'auto' : '0',
              marginBottom: 3,
            }}
          />
          <div
            style={{
              ...getElemStyle('signatureTitle', {
                fontSize: '0.72rem',
                color: resolvedSubColor,
                fontFamily: 'Inter, system-ui, sans-serif',
                textAlign: 'right'
              })
            }}
          >
            {interpolate(elements?.signatureTitle?.content || liveSignatoryTitle)}
          </div>
        </div>
      </div>
    </div>
  );
});

export default CertificateDocument;
