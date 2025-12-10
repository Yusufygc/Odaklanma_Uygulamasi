// ==========================================
// services/SessionService.js
// ==========================================
import { addSession } from '../utils/db';
import { TIMER_DURATIONS, SESSION_TYPES, POMODORO_CYCLE } from '../utils/constants';

export const SessionService = {
  async saveSession(category, duration, distractions) {
    try {
      await addSession(category, duration, distractions);
      return true;
    } catch (error) {
      console.error('Session save error:', error);
      return false;
    }
  },

  calculateNextSessionType(completedPomodoros) {
    if (completedPomodoros % POMODORO_CYCLE === 0) {
      return SESSION_TYPES.LONG_BREAK;
    }
    return SESSION_TYPES.SHORT_BREAK;
  },

  getSessionDuration(sessionType) {
    switch (sessionType) {
      case SESSION_TYPES.WORK:
        return TIMER_DURATIONS.WORK;
      case SESSION_TYPES.SHORT_BREAK:
        return TIMER_DURATIONS.SHORT_BREAK;
      case SESSION_TYPES.LONG_BREAK:
        return TIMER_DURATIONS.LONG_BREAK;
      default:
        return TIMER_DURATIONS.WORK;
    }
  },

  getSessionTitle(sessionType) {
    const titles = {
      [SESSION_TYPES.WORK]: '🎯 Odaklan',
      [SESSION_TYPES.SHORT_BREAK]: '☕ Kısa Mola',
      [SESSION_TYPES.LONG_BREAK]: '🌟 Uzun Mola',
    };
    return titles[sessionType] || titles[SESSION_TYPES.WORK];
  },

  getSessionSubtitle(sessionType) {
    const subtitles = {
      [SESSION_TYPES.WORK]: 'Bir kategori seç ve başla',
      [SESSION_TYPES.SHORT_BREAK]: 'Dinlen ve enerji topla',
      [SESSION_TYPES.LONG_BREAK]: 'Dinlen ve enerji topla',
    };
    return subtitles[sessionType] || subtitles[SESSION_TYPES.WORK];
  },
};
