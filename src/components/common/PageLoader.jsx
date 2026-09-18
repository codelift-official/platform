import React from 'react';
import { FaCode } from 'react-icons/fa';

export default function PageLoader({
  title = 'Loading CodeLift...',
  message = 'Synchronizing real-time records and curriculum...',
  minHeight = '65vh',
  fullscreen = false
}) {
  const containerStyle = fullscreen
    ? {
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'var(--bg-body, #0f172a)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }
    : {
        minHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        width: '100%'
      };

  return (
    <div
      className="cl-page-loader-wrapper"
      style={containerStyle}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="cl-page-loader-card text-center d-flex flex-column align-items-center justify-content-center"
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '2.5rem 2rem',
          borderRadius: '24px',
          background: 'var(--card-bg, rgba(30, 41, 59, 0.7))',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
          boxShadow: 'var(--shadow-card, 0 12px 36px -8px rgba(0, 0, 0, 0.25))'
        }}
      >
        {/* Concentric Rotating Spinner with Central Logo */}
        <div
          className="cl-loader-spinner-box position-relative mb-4"
          style={{ width: '84px', height: '84px' }}
        >
          {/* Outer glowing ambient ring */}
          <div
            className="cl-loader-ambient-ring position-absolute"
            style={{
              inset: '-6px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(var(--bs-primary-rgb), 0.25) 0%, transparent 70%)',
              animation: 'cl-pulse 2s ease-in-out infinite'
            }}
          />

          {/* Outer rotating gradient spinner */}
          <div
            className="cl-loader-spinner position-absolute"
            style={{
              inset: 0,
              borderRadius: '50%',
              border: '3px solid transparent',
              borderTopColor: 'var(--bs-primary)',
              borderRightColor: 'rgba(var(--bs-primary-rgb), 0.35)',
              animation: 'cl-spin 0.9s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite'
            }}
          />

          {/* Inner counter-rotating ring for high-tech kinetic feel */}
          <div
            className="cl-loader-inner-ring position-absolute"
            style={{
              inset: '6px',
              borderRadius: '50%',
              border: '2px dashed rgba(var(--bs-primary-rgb), 0.4)',
              animation: 'cl-spin-reverse 2.4s linear infinite'
            }}
          />

          {/* Centered Brand Logo with gentle scale pulse */}
          <div
            className="position-absolute top-50 start-50 translate-middle d-flex align-items-center justify-content-center"
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              overflow: 'hidden',
              background: 'var(--bg-body, #0f172a)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              animation: 'cl-pulse 2s ease-in-out infinite'
            }}
          >
            <img
              src={`${import.meta.env.BASE_URL}logo.jpg`}
              alt="CodeLift"
              className="brand-logo"
              width={46}
              height={46}
              style={{
                objectFit: 'cover',
                borderRadius: '50%',
                display: 'block'
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.parentElement?.querySelector('.cl-loader-fallback-icon');
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <span
              className="cl-loader-fallback-icon"
              style={{
                display: 'none',
                color: 'var(--bs-primary)',
                fontSize: '18px',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FaCode />
            </span>
          </div>
        </div>

        {/* Title */}
        <h5
          className="fw-bold mb-2 tracking-tight"
          style={{
            color: 'var(--text-primary)',
            fontSize: '1.2rem',
            letterSpacing: '-0.02em',
            lineHeight: 1.3
          }}
        >
          {title}
        </h5>

        {/* Subtitle */}
        <p
          className="mb-3 px-2 text-muted"
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.88rem',
            lineHeight: 1.5,
            maxWidth: '320px'
          }}
        >
          {message}
        </p>

        {/* Shimmer Progress Track */}
        <div
          className="cl-loader-track mt-1"
          style={{
            width: '140px',
            height: '4px',
            borderRadius: '999px',
            background: 'rgba(var(--bs-primary-rgb), 0.15)',
            overflow: 'hidden',
            position: 'relative'
          }}
          aria-hidden="true"
        >
          <div
            className="cl-loader-shimmer"
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              width: '60%',
              borderRadius: '999px',
              background: 'linear-gradient(90deg, transparent, var(--bs-primary), transparent)',
              animation: 'cl-shimmer 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite'
            }}
          />
        </div>
      </div>
    </div>
  );
}
