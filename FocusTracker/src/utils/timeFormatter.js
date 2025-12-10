// ==========================================
// utils/timeFormatter.js
// ==========================================
export const TimeFormatter = {
  formatSeconds(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${this.padZero(mins)}:${this.padZero(secs)}`;
  },

  padZero(num) {
    return num < 10 ? `0${num}` : `${num}`;
  },

  secondsToMinutes(seconds) {
    return Math.round(seconds / 60);
  },

  minutesToSeconds(minutes) {
    return minutes * 60;
  },
};