/**
 * Design tokens matching the 11/38 Home web app color palette.
 * Used for StyleSheet objects where NativeWind classes aren't available.
 */
export const Colors = {
  // Brand gradients
  gradientPrimary: ['#7c3aed', '#2563eb'],
  gradientSuccess: ['#10b981', '#059669'],
  gradientDanger:  ['#f43f5e', '#dc2626'],
  gradientWarning: ['#f59e0b', '#d97706'],
  gradientAmber:   ['#f59e0b', '#ea580c'],

  // Dark mode surfaces (matches slate-950, slate-900, slate-800)
  dark: {
    bg:       '#0f0f23',
    surface:  '#13131f',
    card:     '#1e1e30',
    border:   'rgba(255,255,255,0.08)',
    text:     '#ffffff',
    textMuted:'#94a3b8',
    textDim:  '#64748b',
  },

  // Status colors
  status: {
    open:        { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b' },
    'in-progress':{ bg: 'rgba(59,130,246,0.12)', text: '#3b82f6' },
    resolved:    { bg: 'rgba(16,185,129,0.12)', text: '#10b981' },
    closed:      { bg: 'rgba(100,116,139,0.12)', text: '#64748b' },
    active:      { bg: 'rgba(16,185,129,0.12)', text: '#10b981' },
    occupied:    { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b' },
    available:   { bg: 'rgba(16,185,129,0.12)', text: '#10b981' },
    maintenance: { bg: 'rgba(244,63,94,0.12)',  text: '#f43f5e' },
    low:         { bg: 'rgba(16,185,129,0.12)', text: '#10b981' },
    medium:      { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b' },
    high:        { bg: 'rgba(244,63,94,0.12)',  text: '#f43f5e' },
    urgent:      { bg: 'rgba(236,72,153,0.12)', text: '#ec4899' },
  },

  // Priority/notice badge colors
  priority: {
    low:    { bg: 'rgba(16,185,129,0.15)', text: '#10b981' },
    medium: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
    high:   { bg: 'rgba(244,63,94,0.15)',  text: '#f43f5e' },
    urgent: { bg: 'rgba(236,72,153,0.15)', text: '#ec4899' },
  },
};

export default Colors;
