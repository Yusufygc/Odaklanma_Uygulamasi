// ==========================================
// utils/validators.js
// ==========================================
export const Validator = {
  isCategoryNameValid(name) {
    return name && name.trim().length > 0 && name.trim().length <= 30;
  },

  isTimeValid(seconds) {
    return seconds >= 0 && Number.isInteger(seconds);
  },

  isDurationInRange(seconds, min, max) {
    return seconds >= min && seconds <= max;
  },
};