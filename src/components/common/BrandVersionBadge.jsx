import React from 'react';
import { PLATFORM_VERSION, PLATFORM_VERSION_NUMBER } from '../../config/version';

/**
 * Standard dynamic brand version badge for CodeLift.
 * Renders: CodeLift Platform <dynamic_version> with styled `Li` in active primary theme color.
 * Eliminates duplication of "CodeLift" and prevents hardcoding of version numbers.
 */
export default function BrandVersionBadge({ className = '', style = {} }) {
  const dynamicSuffix = PLATFORM_VERSION
    ? PLATFORM_VERSION.replace(/^CodeLift\s*/i, '')
    : `Platform ${PLATFORM_VERSION_NUMBER || ''}`.trim();

  return (
    <span
      className={`badge rounded-pill ${className}`.trim()}
      style={{
        background: 'var(--card-bg-alt, rgba(0,0,0,0.04))',
        color: 'var(--text-secondary, #64748b)',
        border: '1px solid var(--border-color, #e2e8f0)',
        fontSize: '0.70rem',
        fontWeight: 600,
        letterSpacing: '0.01em',
        ...style
      }}
    >
      Code<span style={{ color: 'var(--bs-primary, #15803D)' }}>Li</span>ft {dynamicSuffix}
    </span>
  );
}
