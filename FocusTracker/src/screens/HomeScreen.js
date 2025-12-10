// ==========================================
// screens/HomeScreen.js - FINAL FIX (Ref Proxy Pattern)
// ==========================================
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { STRINGS } from '../constants/strings';

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
  const [showPomodoroBadge, setShowPomodoroBadge] = useState(false); // ✨ YENİ

  // Custom Hooks
  const { categories, loadCategories, addNewCategory, removeCategory } = useCategories();
  
  // 🔗 1. ADIM: Fonksiyonu tutacak bir Ref oluştur (Köprü)
  const onSessionCompleteRef = useRef(null);

  // 🔗 2. ADIM: useTimer'a bu Ref'i çağıran bir 'Proxy' fonksiyon ver
  // Böylece timer tanımlanırken handleSessionComplete'in hazır olmasına gerek kalmaz.
  const timer = useTimer(
    SessionService.getSessionDuration(sessionType),
    () => {
      console.log("🔗 Timer bitti, Ref üzerinden fonksiyon çağrılıyor...");
      if (onSessionCompleteRef.current) {
        onSessionCompleteRef.current();
      } else {
        console.error("❌ HATA: onSessionCompleteRef boş!");
      }
    }
  );

  // Lifecycle - Load categories on mount
  useFocusEffect(
    useCallback(() => {
      loadCategories().then((cats) => {
        if (!selectedCategory && cats.length > 0) {
          setSelectedCategory(cats[0].name);
        }
      });
    }, [])
  );

  // AppState Management
  useAppState(
    () => handleAppBackground(),
    () => handleAppForeground()
  );

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

  // 📝 3. ADIM: Timer fonksiyonlarını tanımla (Artık 'timer' değişkeni tanımlı olduğu için kullanabiliriz)
  const handleResetTimer = useCallback(() => {
    setSessionType(SESSION_TYPES.WORK);
    timer.reset(TIMER_DURATIONS.WORK);
    setDistractionCount(0);
    setWasActiveBeforeBackground(false);
  }, [timer]); // timer bağımlılığı eklendi

  const handleStartBreak = useCallback((pomodoroCount) => {
    const breakType = SessionService.calculateNextSessionType(pomodoroCount);
    setSessionType(breakType);
    timer.reset(SessionService.getSessionDuration(breakType));
    setDistractionCount(0);
    timer.start();
  }, [timer]);

  // 📝 4. ADIM: Ana bitiş fonksiyonunu tanımla
  const handleSessionComplete = useCallback(async () => {
    console.log("🏁 HomeScreen: handleSessionComplete çalıştı!");

    NotificationService.vibrate(VIBRATION_PATTERNS.COMPLETE);

    if (sessionType === SESSION_TYPES.WORK) {
      if (!selectedCategory) {
        console.error("❌ Kategori yok");
        NotificationService.showError("Kategori seçilmediği için kaydedilemedi.");
        return;
      }

      console.log("💾 Kayıt başlatılıyor...");
      const success = await SessionService.saveSession(
        selectedCategory,
        TIMER_DURATIONS.WORK,
        distractionCount
      );

      if (success) {
        console.log("✅ Kayıt başarılı.");
        const newCount = completedPomodoros + 1;
        setCompletedPomodoros(newCount);

        // ✨ YENİ: Rozeti göster ve 4 saniye sonra gizle
        setShowPomodoroBadge(true);
        setTimeout(() => {
          setShowPomodoroBadge(false);
        }, 4000); // 4000 ms = 4 saniye
        
        NotificationService.showSessionComplete(
          newCount,
          () => handleStartBreak(newCount),
          () => handleResetTimer()
        );
      }
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
  }, [sessionType, selectedCategory, distractionCount, completedPomodoros, handleStartBreak, handleResetTimer]);

  // 🔗 5. ADIM: Ref'i en güncel fonksiyonla doldur
  useEffect(() => {
    onSessionCompleteRef.current = handleSessionComplete;
  }, [handleSessionComplete]);


  // ... Diğer handlerlar ...
  const handleToggleTimer = () => {
    if (!selectedCategory) {
      NotificationService.showAlert(STRINGS.common.warning, STRINGS.home.alerts.selectCategory);
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

  const getStatusText = () => {
    if (timer.isActive) {
      return sessionType === SESSION_TYPES.WORK 
        ? STRINGS.home.status.focusing 
        : STRINGS.home.status.break;
    }
    return STRINGS.home.status.ready;
  };

  const isBreakMode = sessionType !== SESSION_TYPES.WORK;
  const progressColor = isBreakMode ? '#2ecc71' : '#4a90e2';

  return (
    <View style={[styles.container, isBreakMode && styles.containerBreak]}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {SessionService.getSessionTitle(sessionType)}
        </Text>
        <Text style={styles.subtitle}>
          {SessionService.getSessionSubtitle(sessionType)}
        </Text>
      </View>

     {showPomodoroBadge && (
        <PomodoroCounter count={completedPomodoros} />
      )}

      {!isBreakMode && (
        <CategorySelector
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={handleCategorySelect}
          onManage={() => setShowCategoryModal(true)}
          disabled={timer.isActive}
        />
      )}

      <View style={styles.timerContainer}>
        <ProgressBar progress={timer.getProgress()} color={progressColor} />
        <TimerDisplay
          timeLeft={timer.timeLeft}
          isBreak={isBreakMode}
          status={getStatusText()}
        />
        {!isBreakMode && <DistractionBadge count={distractionCount} />}
      </View>

      <TimerControls
        isActive={timer.isActive}
        onToggle={handleToggleTimer}
        onReset={handleResetTimer}
        isBreak={isBreakMode}
      />

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