// ==========================================
// services/NotificationService.js
// ==========================================
import { Alert, Vibration } from 'react-native';
import { VIBRATION_PATTERNS } from '../utils/constants';
import { STRINGS } from '../constants/strings'; // ✅ Import

export const NotificationService = {
  vibrate(pattern = VIBRATION_PATTERNS.SHORT) {
    if (Array.isArray(pattern)) {
      Vibration.vibrate(pattern);
    } else {
      Vibration.vibrate(pattern);
    }
  },

  showAlert(title, message, buttons = []) {
    Alert.alert(title, message, buttons);
  },

  showSuccess(message, onPress) {
    this.showAlert(STRINGS.common.success, message, [
      { text: STRINGS.common.ok, onPress }
    ]);
  },

  showError(message) {
    this.showAlert(STRINGS.common.error, message, [{ text: STRINGS.common.ok }]);
  },

  showConfirmation(title, message, onConfirm, onCancel) {
    this.showAlert(title, message, [
      { text: STRINGS.common.cancel, style: 'cancel', onPress: onCancel },
      { text: STRINGS.common.confirm, style: 'destructive', onPress: onConfirm }
    ]);
  },

  showSessionComplete(completedPomodoros, onBreak, onContinue) {
    const isLongBreak = completedPomodoros % 4 === 0;
    
    if (isLongBreak) {
      this.showAlert(
        STRINGS.notifications.greatJob,
        STRINGS.notifications.longBreakMsg(completedPomodoros), // ✅ Dinamik String
        [
          { text: STRINGS.notifications.buttons.later, style: 'cancel', onPress: onContinue },
          { text: STRINGS.notifications.buttons.longBreak, onPress: onBreak }
        ]
      );
    } else {
      this.showAlert(
        STRINGS.notifications.congrats,
        STRINGS.notifications.shortBreakMsg,
        [
          { text: STRINGS.notifications.buttons.continue, style: 'cancel', onPress: onContinue },
          { text: STRINGS.notifications.buttons.shortBreak, onPress: onBreak }
        ]
      );
    }
  },
};