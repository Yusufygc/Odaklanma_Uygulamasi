// ==========================================
// utils/constants.js
// ==========================================
export const TIMER_DURATIONS = {
  WORK: 60,
  SHORT_BREAK: 5 * 60,
  LONG_BREAK: 15 * 60,
};

export const SESSION_TYPES = {
  WORK: 'work',
  SHORT_BREAK: 'short-break',
  LONG_BREAK: 'long-break',
};

export const APP_STATES = {
  ACTIVE: 'active',
  BACKGROUND: 'background',
  INACTIVE: 'inactive',
};

export const POMODORO_CYCLE = 4;

export const VIBRATION_PATTERNS = {
  SHORT: 200,
  COMPLETE: [500, 200, 500],
  DISTRACTION: 200,
};

export const MIN_DISTRACTION_TIME = 2000;