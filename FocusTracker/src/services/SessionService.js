// ==========================================
// services/SessionService.js
// ==========================================
import { addSession } from '../utils/db';
import { TIMER_DURATIONS, SESSION_TYPES, POMODORO_CYCLE } from '../utils/constants';
import { STRINGS } from '../constants/strings'; // ✅ Import Eklendi

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
      [SESSION_TYPES.WORK]: STRINGS.sessions.work.title,
      [SESSION_TYPES.SHORT_BREAK]: STRINGS.sessions.shortBreak.title,
      [SESSION_TYPES.LONG_BREAK]: STRINGS.sessions.longBreak.title,
    };
    return titles[sessionType] || titles[SESSION_TYPES.WORK];
  },

  getSessionSubtitle(sessionType) {
    const subtitles = {
      [SESSION_TYPES.WORK]: STRINGS.sessions.work.subtitle,
      [SESSION_TYPES.SHORT_BREAK]: STRINGS.sessions.shortBreak.subtitle,
      [SESSION_TYPES.LONG_BREAK]: STRINGS.sessions.longBreak.subtitle,
    };
    return subtitles[sessionType] || subtitles[SESSION_TYPES.WORK];
  },
};
