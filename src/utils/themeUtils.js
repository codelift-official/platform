/**
 * Theme Definitions & Utilities for CodeLift
 * Pure JavaScript helpers for theme validation, aliases, and resolution.
 */

import { getCookie } from './cookieUtils.js';

export const THEMES = [
  { id: 'forest-green', name: 'Forest Green', color: '#15803D', accent: '#15803D', dark: false },
  { id: 'emerald', name: 'Emerald & White', color: '#059669', accent: '#059669', dark: false },
  { id: 'dark-green', name: 'Dark Green / Black', color: '#10B981', accent: '#10B981', dark: true },
  { id: 'navy-blue', name: 'Navy Blue', color: '#1E3A8A', accent: '#1E3A8A', dark: false },
  { id: 'indigo', name: 'Indigo & Gray', color: '#4338CA', accent: '#4338CA', dark: false },
  { id: 'teal', name: 'Teal', color: '#0D9488', accent: '#0D9488', dark: false },
  { id: 'amber', name: 'Warm Amber', color: '#D97706', accent: '#D97706', dark: false },
  { id: 'rose', name: 'Rose', color: '#BE123C', accent: '#BE123C', dark: false },
  { id: 'purple', name: 'Purple', color: '#6D28D9', accent: '#6D28D9', dark: false },
  { id: 'neutral', name: 'Neutral Gray', color: '#1F2937', accent: '#1F2937', dark: false },
  { id: 'dark-emerald', name: 'Dark Emerald', color: '#10B981', accent: '#10B981', dark: true },
  { id: 'dark-nebula', name: 'Nebula (Default)', color: '#8B5CF6', accent: '#8B5CF6', dark: true },
  { id: 'dark-carbon', name: 'Dark Carbon', color: '#6EE7B7', accent: '#6EE7B7', dark: true },
];

export const THEME_ALIASES = {
  'ocean-blue': 'navy-blue',
  'royal-indigo': 'indigo',
  'sunset-orange': 'amber',
  'rose-pink': 'rose',
  'amethyst-purple': 'purple',
  'teal-wave': 'teal',
  'crimson-red': 'dark-green',
  'graphite-grey': 'neutral',
  'midnight-emerald': 'dark-emerald',
  'nebula': 'dark-nebula',
  'nebula-night': 'dark-nebula',
  'carbon-black': 'dark-carbon',
};

export const DEFAULT_THEME = 'dark-nebula';
export const COOKIE_NAME = 'codelift_theme';
export const LS_KEY = 'codelift_theme';

/**
 * Validate and normalize a theme identifier to a supported canonical theme ID.
 * @param {string} themeId - The theme ID or alias
 * @returns {string|null} Canonical theme ID or null if unrecognized
 */
export function normalizeTheme(themeId) {
  if (!themeId || typeof themeId !== 'string') return null;
  if (THEMES.some((t) => t.id === themeId)) return themeId;
  if (THEME_ALIASES[themeId]) return THEME_ALIASES[themeId];
  return null;
}

/**
 * Resolve the initial active theme on application startup.
 * Priority order:
 * 1. Cookie ('codelift_theme')
 * 2. localStorage ('codelift_theme')
 * 3. Default ('dark-emerald')
 * @returns {string} The active theme ID
 */
export function resolveInitialTheme() {
  try {
    const fromCookie = normalizeTheme(getCookie(COOKIE_NAME));
    if (fromCookie) return fromCookie;

    if (typeof localStorage !== 'undefined') {
      const fromLS = normalizeTheme(localStorage.getItem(LS_KEY));
      if (fromLS) return fromLS;
    }
  } catch (e) {}

  return DEFAULT_THEME;
}

/**
 * Determine if a theme is a dark theme.
 * @param {string} themeId - The theme ID or alias
 * @returns {boolean}
 */
export function isDarkTheme(themeId) {
  if (!themeId) return false;
  const canonical = normalizeTheme(themeId) || themeId;
  const match = THEMES.find((t) => t.id === canonical);
  if (match && typeof match.dark === 'boolean') return match.dark;
  return canonical.includes('dark') || ['midnight-emerald', 'nebula-night', 'carbon-black'].includes(canonical);
}

/**
 * Apply the theme data attribute to document root elements.
 * @param {string} theme - The theme ID
 */
export function applyTheme(theme) {
  if (typeof document === 'undefined') return;
  const canonical = normalizeTheme(theme) || theme;
  const isDark = isDarkTheme(canonical);

  document.documentElement.setAttribute('data-theme', canonical);
  document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme-mode', isDark ? 'dark' : 'light');

  if (document.body) {
    document.body.setAttribute('data-theme', canonical);
    document.body.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
    document.body.setAttribute('data-theme-mode', isDark ? 'dark' : 'light');
  }
}
