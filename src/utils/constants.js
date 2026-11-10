// ─── Query Keys ─────────────────────────────────────────────────────────────
export const QUERY_KEYS = {
  AUTH_ME:           ['auth', 'me'],
  DASHBOARD_MEMBER:  ['dashboard', 'member'],
  DASHBOARD_MANAGER: ['dashboard', 'manager'],
  COMMUNITY:         ['dashboard', 'community'],
  MY_PROFILE:        ['members', 'me'],
  MY_COMPLAINTS:     ['complaints', 'my'],
  COMPLAINTS_ALL:    ['complaints', 'all'],
  MY_MEALS:          ['meals', 'my'],
  MEAL_SUMMARY:      ['meals', 'summary'],
  WEEKLY_PLAN:       ['meals', 'weekly-plan'],
  NOTICES:           ['notices'],
  NOTIFICATIONS:     ['notifications'],
  ROOMS:             ['rooms'],
  MY_ROOM:           ['rooms', 'my'],
  MEMBERS:           ['members'],
  PAYMENTS:          ['payments'],
  EXPENSES:          ['expenses'],
  SETTINGS:          ['settings'],
  MARKET_TODAY:      ['market', 'today'],
  MARKET_UPCOMING:   ['market', 'upcoming'],
  MARKET_ME:         ['market', 'me'],
  MARKET_STATS:      ['market', 'stats'],
};

// ─── Complaint Types ──────────────────────────────────────────────────────────
export const COMPLAINT_TYPES = [
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'service',     label: 'Service' },
  { value: 'food',        label: 'Food' },
  { value: 'noise',       label: 'Noise' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'plumbing',    label: 'Plumbing' },
  { value: 'other',       label: 'Other' },
];

export const COMPLAINT_PRIORITIES = [
  { value: 'low',    label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high',   label: 'High' },
];

export const COMPLAINT_STATUSES = [
  { value: 'open',        label: 'Open' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'resolved',    label: 'Resolved' },
  { value: 'closed',      label: 'Closed' },
];

// ─── Roles ───────────────────────────────────────────────────────────────────
export const ROLES = {
  MANAGER: 'manager',
  MEMBER:  'member',
};

// ─── Days of week ─────────────────────────────────────────────────────────────
export const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

export const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
