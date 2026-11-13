/**
 * Centralized Theme & Design Tokens for Dorm Solution
 * Premium Dark-Green Color Palette
 *
 * Primary Palette:
 * - Forest Green:  #064e3b (Deeper surfaces, rich containers, borders)
 * - Emerald Green: #059669 (Primary buttons, strong highlights, focus states)
 * - Primary Green: #10b981 (Brand primary, active states, key accents)
 * - Mint Green:    #34d399 (Text highlights, active icon tints, glowing pills)
 * - Soft Mint:     #a7f3d0 (Subtle badge tints, delicate accents)
 * - Dark BG:       #0f172a (Deep slate dark background)
 * - Dark Surface:  #1e293b (Slate dark surface / cards)
 */

export const Colors = {
  // Brand gradients
  gradientPrimary: ['#059669', '#10b981'],
  gradientForest:  ['#064e3b', '#059669'],
  gradientMint:    ['#10b981', '#34d399'],
  gradientSuccess: ['#10b981', '#059669'],
  gradientDanger:  ['#f43f5e', '#dc2626'],
  gradientWarning: ['#f59e0b', '#d97706'],
  gradientAmber:   ['#f59e0b', '#ea580c'],

  // Core brand green tokens
  primary: {
    forest:   '#064e3b',
    emerald:  '#059669',
    main:     '#10b981',
    mint:     '#34d399',
    softMint: '#a7f3d0',
    light:    '#d1fae5',
  },

  // Dark mode surfaces (Dark Background: #0f172a, Dark Surface: #1e293b)
  dark: {
    bg:        '#0f172a',
    surface:   '#1e293b',
    card:      '#1e293b',
    cardAlt:   '#162032',
    border:    'rgba(255, 255, 255, 0.08)',
    borderGreen: 'rgba(16, 185, 129, 0.25)',
    text:      '#f8fafc',
    textMuted: '#94a3b8',
    textDim:   '#64748b',
  },

  // Interactive & Accent Tokens
  accent: {
    primary:   '#10b981',
    primaryActive: '#059669',
    activeGlow: 'rgba(16, 185, 129, 0.15)',
    badgeBg:   'rgba(16, 185, 129, 0.12)',
    badgeText: '#34d399',
  },

  // Status colors
  status: {
    open:         { bg: 'rgba(245, 158, 11, 0.12)', text: '#f59e0b' },
    'in-progress':{ bg: 'rgba(16, 185, 129, 0.12)', text: '#10b981' },
    resolved:     { bg: 'rgba(16, 185, 129, 0.12)', text: '#10b981' },
    closed:       { bg: 'rgba(100, 116, 139, 0.12)', text: '#64748b' },
    active:       { bg: 'rgba(16, 185, 129, 0.12)', text: '#10b981' },
    occupied:     { bg: 'rgba(245, 158, 11, 0.12)', text: '#f59e0b' },
    available:    { bg: 'rgba(16, 185, 129, 0.12)', text: '#10b981' },
    maintenance:  { bg: 'rgba(244, 63, 94, 0.12)',   text: '#f43f5e' },
    low:          { bg: 'rgba(16, 185, 129, 0.12)', text: '#10b981' },
    medium:       { bg: 'rgba(245, 158, 11, 0.12)', text: '#f59e0b' },
    high:         { bg: 'rgba(244, 63, 94, 0.12)',   text: '#f43f5e' },
    urgent:       { bg: 'rgba(244, 63, 94, 0.15)',   text: '#f43f5e' },
  },

  // Priority badge tokens
  priority: {
    low:    { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399' },
    medium: { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' },
    high:   { bg: 'rgba(244, 63, 94, 0.15)',  text: '#f43f5e' },
    urgent: { bg: 'rgba(244, 63, 94, 0.2)',   text: '#f43f5e' },
  },
};

export default Colors;
