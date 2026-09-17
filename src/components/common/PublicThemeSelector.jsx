import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { THEME_ALIASES } from '../../utils/themeUtils';
import { FiChevronDown, FiX } from 'react-icons/fi';
import './PublicThemeSelector.css';

const LIGHT_THEMES = [
  { id: 'forest-green', label: 'Forest Green', color: '#15803D' },
  { id: 'emerald', label: 'Emerald', color: '#059669' },
  { id: 'ocean-blue', label: 'Ocean Blue', color: '#0369A1' },
  { id: 'royal-indigo', label: 'Royal Indigo', color: '#4338CA' },
  { id: 'sunset-orange', label: 'Sunset Orange', color: '#EA580C' },
  { id: 'rose-pink', label: 'Rose Pink', color: '#E11D48' },
  { id: 'amethyst-purple', label: 'Amethyst', color: '#7C3AED' },
  { id: 'teal-wave', label: 'Teal Wave', color: '#0D9488' },
  { id: 'crimson-red', label: 'Crimson', color: '#DC2626' },
  { id: 'graphite-grey', label: 'Graphite', color: '#334155' },
];

const DARK_THEMES = [
  { id: 'midnight-emerald', label: 'Midnight Emerald', color: '#34D399' },
  { id: 'nebula-night', label: 'Nebula Night', color: '#A78BFA' },
  { id: 'carbon-black', label: 'Carbon Black', color: '#22D3EE' },
];

function isThemeMatch(currentTheme, targetId) {
  if (!currentTheme || !targetId) return false;
  if (currentTheme === targetId) return true;
  if (THEME_ALIASES && THEME_ALIASES[targetId] === currentTheme) return true;
  if (THEME_ALIASES && THEME_ALIASES[currentTheme] === targetId) return true;
  return false;
}

export default function PublicThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 992 : false
  );
  const ref = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && ref.current.contains(e.target)) return;
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  // Lock background scroll when bottom sheet is open on mobile
  useEffect(() => {
    if (open && isMobile) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open, isMobile]);

  const allThemes = [...LIGHT_THEMES, ...DARK_THEMES];
  const current = allThemes.find(t => isThemeMatch(theme, t.id)) || allThemes[0];
  const isDark = DARK_THEMES.some(t => isThemeMatch(theme, t.id)) || (theme && theme.startsWith('dark-'));

  const menuContent = (
    <div
      ref={menuRef}
      className={`public-theme-menu ${isMobile ? 'public-theme-bottom-sheet' : ''}`}
      role="menu"
    >
      {isMobile && (
        <div className="public-theme-sheet-header">
          <div className="public-theme-sheet-handle" />
          <div className="d-flex align-items-center justify-content-between w-100 px-2 pt-1 pb-2">
            <span className="fw-bold" style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
              Theme Preview
            </span>
            <button
              type="button"
              className="btn btn-sm btn-link p-1 text-decoration-none"
              style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', lineHeight: 1 }}
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <FiX />
            </button>
          </div>
        </div>
      )}

      <div className="public-theme-options-list">
        <div className="theme-group-label">Light Themes</div>
        {LIGHT_THEMES.map(t => (
          <button
            key={t.id}
            type="button"
            className={`theme-option ${isThemeMatch(theme, t.id) ? 'active' : ''}`}
            onClick={() => { setTheme(t.id); setOpen(false); }}
          >
            <span className="theme-dot" style={{ background: t.color }} />
            <span className="theme-label">{t.label}</span>
          </button>
        ))}

        <div className="theme-group-label mt-2">Dark Themes</div>
        {DARK_THEMES.map(t => (
          <button
            key={t.id}
            type="button"
            className={`theme-option ${isThemeMatch(theme, t.id) ? 'active' : ''}`}
            onClick={() => { setTheme(t.id); setOpen(false); }}
          >
            <span className="theme-dot" style={{ background: t.color }} />
            <span className="theme-label">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="public-theme-selector" ref={ref}>
      <button
        type="button"
        className="public-theme-trigger"
        onClick={() => setOpen(o => !o)}
        aria-label="Change theme"
        aria-expanded={open}
      >
        <span
          className="theme-dot"
          style={{ background: current?.color || '#15803D' }}
        />
        <FiChevronDown size={12} className="theme-chevron" />
      </button>

      {open && (
        isMobile && typeof document !== 'undefined' ? (
          createPortal(
            <div className="public-theme-portal-container">
              <div
                className="public-theme-backdrop"
                onClick={() => setOpen(false)}
                aria-hidden="true"
              />
              {menuContent}
            </div>,
            document.body
          )
        ) : (
          menuContent
        )
      )}
    </div>
  );
}
