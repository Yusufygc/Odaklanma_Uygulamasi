// ==========================================
// screens/HomeScreen.js - REFACTORED
// ==========================================
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native'; // ✅ Text eklendi
import { useFocusEffect } from '@react-navigation/native';

// Hooks
import { useTimer } from '../hooks/useTimer';
import { useAppState } from '../hooks/useAppState';
import { useCategories } from '../hooks/useCategories';

// Components
import { TimerDisplay } from '../components/timer/TimerDisplay';
import { ProgressBar } from '../components/timer/ProgressBar';
import { TimerControls } from '../components/timer/TimerControls';
import { PomodoroCounter } from '../components/timer/PomodoroCounter';
import { CategorySelector } from '../components/category/CategorySelector';
import { DistractionBadge } from '../components/distraction/DistractionBadge';
import { ResumeSessionModal } from '../components/distraction/ResumeSessionModal';
import { CategoryManagementModal } from '../components/category/CategoryManagementModal';

// Services & Utils
import { SessionService } from '../services/SessionService';
import { NotificationService } from '../services/NotificationService';
import { SESSION_TYPES, TIMER_DURATIONS, VIBRATION_PATTERNS } from '../utils/constants';

export default function HomeScreen() {
  // State Management
  const [sessionType, setSessionType] = useState(SESSION_TYPES.WORK);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [distractionCount, setDistractionCount] = useState(0);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [wasActiveBeforeBackground, setWasActiveBeforeBackground] = useState(false);

  // Custom Hooks
  const { categories, loadCategories, addNewCategory, removeCategory } = useCategories();
  
  const timer = useTimer(
    SessionService.getSessionDuration(sessionType),
    handleSessionComplete
  );

  // Lifecycle - Load categories on mount
  useFocusEffect(
    React.useCallback(() => {
      loadCategories().then((cats) => {
        if (!selectedCategory && cats.length > 0) {
          setSelectedCategory(cats[0].name);
        }
      });
    }, [])
  );

  // AppState Management - Handle app going to background/foreground
  useAppState(
    // onBackground callback
    () => handleAppBackground(),
    // onForeground callback
    () => handleAppForeground()
  );

  // Handlers
  const handleAppBackground = () => {
    if (timer.isActive && sessionType === SESSION_TYPES.WORK) {
      setWasActiveBeforeBackground(true);
      timer.pause();
      setDistractionCount(prev => prev + 1);
      NotificationService.vibrate(VIBRATION_PATTERNS.DISTRACTION);
    }
  };

  const handleAppForeground = () => {
    if (wasActiveBeforeBackground && !timer.isActive && timer.timeLeft > 0) {
      setShowResumeModal(true);
      setWasActiveBeforeBackground(false);
    }
  };

  const handleSessionComplete = async () => {
    NotificationService.vibrate(VIBRATION_PATTERNS.COMPLETE);

    if (sessionType === SESSION_TYPES.WORK) {
      await SessionService.saveSession(
        selectedCategory,
        TIMER_DURATIONS.WORK,
        distractionCount
      );

      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);

      NotificationService.showSessionComplete(
        newCount,
        () => handleStartBreak(newCount),
        () => handleResetTimer()
      );
    } else {
      NotificationService.showAlert(
        '⏰ Mola Bitti!',
        'Tekrar çalışmaya hazır mısın?',
        [
          { text: 'Biraz Daha', style: 'cancel' },
          { text: 'Başla!', onPress: handleResetTimer }
        ]
      );
    }
  };

  const handleStartBreak = (pomodoroCount) => {
    const breakType = SessionService.calculateNextSessionType(pomodoroCount);
    setSessionType(breakType);
    timer.reset(SessionService.getSessionDuration(breakType));
    setDistractionCount(0);
    timer.start();
  };

  const handleResetTimer = () => {
    setSessionType(SESSION_TYPES.WORK);
    timer.reset(TIMER_DURATIONS.WORK);
    setDistractionCount(0);
    setWasActiveBeforeBackground(false);
  };

  const handleToggleTimer = () => {
    if (!selectedCategory) {
      NotificationService.showAlert('Uyarı', 'Lütfen önce bir kategori seç!');
      return;
    }
    
    if (timer.isActive) {
      timer.pause();
    } else {
      timer.start();
    }
  };

  const handleCategorySelect = (category) => {
    if (!timer.isActive) {
      setSelectedCategory(category.name);
    }
  };

  const handleResumeSession = () => {
    setShowResumeModal(false);
    timer.start();
  };

  const handleStayPaused = () => {
    setShowResumeModal(false);
  };

  // Render helpers
  const getStatusText = () => {
    if (timer.isActive) {
      return sessionType === SESSION_TYPES.WORK 
        ? "Odaklanılıyor... 🎯" 
        : "Mola veriyor... ☕";
    }
    return "Hazır mısın? 💪";
  };

  const isBreakMode = sessionType !== SESSION_TYPES.WORK;
  const progressColor = isBreakMode ? '#2ecc71' : '#4a90e2';

  return (
    <View style={[styles.container, isBreakMode && styles.containerBreak]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {SessionService.getSessionTitle(sessionType)}
        </Text>
        <Text style={styles.subtitle}>
          {SessionService.getSessionSubtitle(sessionType)}
        </Text>
      </View>

      {/* Pomodoro Counter */}
      <PomodoroCounter count={completedPomodoros} />

      {/* Category Selector - Only in work mode */}
      {!isBreakMode && (
        <CategorySelector
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={handleCategorySelect}
          onManage={() => setShowCategoryModal(true)}
          disabled={timer.isActive}
        />
      )}

      {/* Timer Container */}
      <View style={styles.timerContainer}>
        <ProgressBar progress={timer.getProgress()} color={progressColor} />
        <TimerDisplay
          timeLeft={timer.timeLeft}
          isBreak={isBreakMode}
          status={getStatusText()}
        />
        {!isBreakMode && <DistractionBadge count={distractionCount} />}
      </View>

      {/* Timer Controls */}
      <TimerControls
        isActive={timer.isActive}
        onToggle={handleToggleTimer}
        onReset={handleResetTimer}
        isBreak={isBreakMode}
      />

      {/* Modals */}
      <ResumeSessionModal
        visible={showResumeModal}
        timeLeft={timer.timeLeft}
        onResume={handleResumeSession}
        onStayPaused={handleStayPaused}
      />

      <CategoryManagementModal
        visible={showCategoryModal}
        categories={categories}
        onClose={() => setShowCategoryModal(false)}
        onAdd={addNewCategory}
        onDelete={removeCategory}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  containerBreak: {
    backgroundColor: '#e8f5e9',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
});