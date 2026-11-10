import { MONTH_NAMES } from './constants';

// ─── Currency ─────────────────────────────────────────────────────────────────
/**
 * Format a number as Bangladeshi Taka.
 * Matches the web app's ৳ prefix convention.
 */
export const formatCurrency = (amount = 0) => {
  const num = Number(amount) || 0;
  return `৳${num.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// ─── Dates ────────────────────────────────────────────────────────────────────
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const d   = new Date(dateStr);
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1)  return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24)  return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7)  return `${diffDay}d ago`;
  return formatDate(dateStr);
};

export const getMonthName = (month) => MONTH_NAMES[(month - 1) % 12] || '';

export const getCurrentMonthYear = () => {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
export const getInitials = (name = '') => {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');
};

// ─── Status helpers ───────────────────────────────────────────────────────────
export const capitalize = (str = '') => str.charAt(0).toUpperCase() + str.slice(1);

export const statusLabel = (status) => {
  const map = {
    open:         'Open',
    'in-progress':'In Progress',
    resolved:     'Resolved',
    closed:       'Closed',
    active:       'Active',
    inactive:     'Inactive',
    left:         'Left',
    occupied:     'Occupied',
    available:    'Available',
    maintenance:  'Maintenance',
  };
  return map[status] || capitalize(status);
};

// ─── Number ───────────────────────────────────────────────────────────────────
export const safeNumber = (val, fallback = 0) => {
  const n = Number(val);
  return isNaN(n) ? fallback : n;
};
