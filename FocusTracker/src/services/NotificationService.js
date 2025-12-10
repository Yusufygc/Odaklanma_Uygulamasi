// ==========================================
// services/NotificationService.js
// ==========================================
import { Alert, Vibration } from 'react-native';
import { VIBRATION_PATTERNS } from '../utils/constants';

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
    this.showAlert('Başarılı! ✅', message, [
      { text: 'Tamam', onPress }
    ]);
  },

  showError(message) {
    this.showAlert('Hata', message, [{ text: 'Tamam' }]);
  },

  showConfirmation(title, message, onConfirm, onCancel) {
    this.showAlert(title, message, [
      { text: 'İptal', style: 'cancel', onPress: onCancel },
      { text: 'Onayla', style: 'destructive', onPress: onConfirm }
    ]);
  },

  showSessionComplete(completedPomodoros, onBreak, onContinue) {
    const isLongBreak = completedPomodoros % 4 === 0;
    
    if (isLongBreak) {
      this.showAlert(
        '🎉 Harika İş!',
        `${completedPomodoros}. Pomodoro'yu tamamladın! Uzun bir mola zamanı.`,
        [
          { text: 'Daha Sonra', style: 'cancel', onPress: onContinue },
          { text: 'Uzun Mola (15dk)', onPress: onBreak }
        ]
      );
    } else {
      this.showAlert(
        '✅ Tebrikler!',
        'Odaklanma seansını başarıyla tamamladın! Kısa bir mola ister misin?',
        [
          { text: 'Devam Et', style: 'cancel', onPress: onContinue },
          { text: 'Kısa Mola (5dk)', onPress: onBreak }
        ]
      );
    }
  },
};