// ==========================================
// services/TimerService.js - FIXED
// ==========================================
// Class'ı kaldırıp utility object'e çevirdik
export const TimerService = {
  interval: null,

  start(callback) {
    if (this.interval) {
      this.stop();
    }
    this.interval = setInterval(callback, 1000);
  },

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  },

  isRunning() {
    return this.interval !== null;
  },

  reset() {
    this.stop();
  },
};