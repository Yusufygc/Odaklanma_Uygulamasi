// ==========================================
// screens/HomeScreen.js - FINAL (Category Between Timer & Controls)
// ==========================================
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { STRINGS } from '../constants/strings';

// Hooks
import { useTimer } from '../hooks/useTimer';
import { useAppState } from '../hooks/useAppState';
import { useCategories } from '../hooks/useCategories';
import { useTheme } from '../context/ThemeContext';

// Components
import { TimerDisplay } from '../components/timer/TimerDisplay';
import { BoxProgressBar } from '../components/timer/BoxProgressBar'; 
import { TimerControls } from '../components/timer/TimerControls';
import { PomodoroCounter } from '../components/timer/PomodoroCounter';
import { CategorySelector } from '../components/category/CategorySelector';
import { DistractionBadge } from '../components/distraction/DistractionBadge';
import { ResumeSessionModal } from '../components/distraction/ResumeSessionModal';
import { CategoryManagementModal } from '../components/category/CategoryManagementModal';
import { TimeAdjustmentModal } from '../components/timer/TimeAdjustmentModal';

// Services & Utils
import { SessionService } from '../services/SessionService';
import { NotificationService } from '../services/NotificationService';
import { SESSION_TYPES, TIMER_DURATIONS, VIBRATION_PATTERNS } from '../utils/constants';

export default function HomeScreen() {
  const { themeColors } = useTheme();
  
  // ---------------- STATE YÖNETİMİ ----------------
  const [sessionType, setSessionType] = useState(SESSION_TYPES.WORK);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [distractionCount, setDistractionCount] = useState(0);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  
  // Modal Kontrolleri
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  
  // Durum Kontrolleri
  const [wasActiveBeforeBackground, setWasActiveBeforeBackground] = useState(false);
  const [showPomodoroBadge, setShowPomodoroBadge] = useState(false);
  const [workMinutes, setWorkMinutes] = useState(25);

  // ✨ YENİ: Timer kutusunun boyutlarını tutmak için state
  const [timerLayout, setTimerLayout] = useState({ width: 0, height: 0 });
  
  // Custom Hooks
  const { categories, loadCategories, addNewCategory, removeCategory } = useCategories();
  
  const onSessionCompleteRef = useRef(null);

  // Timer Hook
  const timer = useTimer(
    sessionType === SESSION_TYPES.WORK ? workMinutes * 60 : SessionService.getSessionDuration(sessionType),
    () => {
      if (onSessionCompleteRef.current) {
        onSessionCompleteRef.current();
      } else {
        console.error("❌ HATA: onSessionCompleteRef boş!");
      }
    }
  );

  
  // ---------------- LIFECYCLE ----------------

  useFocusEffect(
    useCallback(() => {
      loadCategories().then((cats) => {
        if (!selectedCategory && cats.length > 0) {
          setSelectedCategory(cats[0].name);
        }
      });
    }, [])
  );

  useAppState(
    () => {
      if (timer.isActive && sessionType === SESSION_TYPES.WORK) {
        setWasActiveBeforeBackground(true);
        timer.pause();
        setDistractionCount(prev => prev + 1);
        NotificationService.vibrate(VIBRATION_PATTERNS.DISTRACTION);
      }
    },
    () => {
      if (wasActiveBeforeBackground && !timer.isActive && timer.timeLeft > 0) {
        setShowResumeModal(true);
        setWasActiveBeforeBackground(false);
      }
    }
  );

  // ---------------- HANDLERS ----------------

  const handleUpdateDuration = (minutes) => {
    setWorkMinutes(minutes);
    setShowTimeModal(false);
    
    if (!timer.isActive && sessionType === SESSION_TYPES.WORK) {
      timer.reset(minutes * 60);
      
    }
  };

  const handleResetTimer = useCallback(() => {
    setSessionType(SESSION_TYPES.WORK);
    timer.reset(workMinutes * 60);
    setDistractionCount(0);
    setWasActiveBeforeBackground(false);
  }, [timer, workMinutes]);

  const handleStartBreak = useCallback((pomodoroCount) => {
    const breakType = SessionService.calculateNextSessionType(pomodoroCount);
    setSessionType(breakType);
    timer.reset(SessionService.getSessionDuration(breakType));
    setDistractionCount(0);
    timer.start();
  }, [timer]);

  const handleSessionComplete = useCallback(async () => {
    NotificationService.vibrate(VIBRATION_PATTERNS.COMPLETE);

    if (sessionType === SESSION_TYPES.WORK) {
      if (!selectedCategory) {
        NotificationService.showError("Kategori seçilmediği için kaydedilemedi.");
        return;
      }

      const success = await SessionService.saveSession(
        selectedCategory,
        workMinutes * 60,
        distractionCount
      );

      if (success) {
        const newCount = completedPomodoros + 1;
        setCompletedPomodoros(newCount);
        
        setShowPomodoroBadge(true);
        setTimeout(() => {
          setShowPomodoroBadge(false);
        }, 4000);
        
        NotificationService.showSessionComplete(
          newCount,
          () => handleStartBreak(newCount),
          () => handleResetTimer()
        );
      }
    } else {
      NotificationService.showAlert(
        STRINGS.home.alerts.breakOver,
        STRINGS.home.alerts.readyForWork,
        [
          { text: STRINGS.home.alerts.aBitMore, style: 'cancel' },
          { text: STRINGS.home.alerts.start, onPress: handleResetTimer }
        ]
      );
    }
  }, [sessionType, selectedCategory, distractionCount, completedPomodoros, handleStartBreak, handleResetTimer, workMinutes]);

  useEffect(() => {
    onSessionCompleteRef.current = handleSessionComplete;
  }, [handleSessionComplete]);

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

  // ---------------- RENDER ----------------

  const getStatusText = () => {
    if (timer.isActive) {
      return sessionType === SESSION_TYPES.WORK 
        ? STRINGS.home.status.focusing 
        : STRINGS.home.status.break;
    }
    return STRINGS.home.status.ready;
  };

  const isBreakMode = sessionType !== SESSION_TYPES.WORK;
  const progressColor = isBreakMode ? '#2ecc71' : themeColors.primary;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }, isBreakMode && styles.containerBreak]}>
      
      {/* 1. Başlık */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.text }]}>
          {SessionService.getSessionTitle(sessionType)}
        </Text>
        <Text style={[styles.subtitle, { color: themeColors.textLight }]}>
          {SessionService.getSessionSubtitle(sessionType)}
        </Text>
      </View>

      {/* 2. Rozet */}
      {showPomodoroBadge && (
        <PomodoroCounter count={completedPomodoros} />
      )}

 
      {/* 3. Timer Container (Büyük Beyaz Kutu) */}
      <View 
        style={[styles.timerContainer, { backgroundColor: themeColors.card }]}
        // ✨ YENİ: Kutunun boyutlarını al
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setTimerLayout({ width, height });
        }}
      >
        {/* ✨ YENİ: Çevresel Progress Bar (Kutunun etrafını sarar) */}
        <BoxProgressBar 
          progress={timer.getProgress()} 
          width={timerLayout.width} 
          height={timerLayout.height} 
          color={progressColor}
          borderRadius={20} // Container borderRadius ile aynı olmalı
        />
        
        <TouchableOpacity 
          onPress={() => !isBreakMode && !timer.isActive && setShowTimeModal(true)}
          activeOpacity={!isBreakMode && !timer.isActive ? 0.7 : 1}
        >
          <TimerDisplay
            timeLeft={timer.timeLeft}
            isBreak={isBreakMode}
            status={getStatusText()}
          />
          {!isBreakMode && !timer.isActive && (
            <Text style={[styles.editHint, { color: themeColors.primary }]}>⏱️ Değiştirmek için dokun</Text>
          )}
        </TouchableOpacity>


        {/* Dikkat Rozeti */}
        {!isBreakMode && <DistractionBadge count={distractionCount} />}
      </View>

      {/* 4. ✨ KATEGORİ SEÇİMİ (ARADA) */}
      {!isBreakMode && (
        <View style={styles.categoryWrapper}>
          <CategorySelector
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={handleCategorySelect}
            // Artık + butonuna basınca modal açılıyor
            onManage={() => setShowCategoryModal(true)} 
            disabled={timer.isActive|| timer.getProgress() > 0}
          />
        </View>
      )}

      {/* 5. Kontrol Butonları (Mavi Buton) */}
      <TimerControls
        isActive={timer.isActive}
        onToggle={handleToggleTimer}
        onReset={handleResetTimer}
        isBreak={isBreakMode}
      />

      {/* 6. Modallar */}
      <ResumeSessionModal
        visible={showResumeModal}
        timeLeft={timer.timeLeft}
        onResume={handleResumeSession}
        onStayPaused={handleStayPaused}
      />

      {/* ⚠️ ÖNEMLİ: Modal Sadece Ekleme Modunda Çağrılıyor (onDelete/onUpdate YOK) */}
      <CategoryManagementModal
        visible={showCategoryModal}
        categories={categories}
        onClose={() => setShowCategoryModal(false)}
        onAdd={addNewCategory}
      />

      <TimeAdjustmentModal 
        visible={showTimeModal}
        currentMinutes={workMinutes}
        onClose={() => setShowTimeModal(false)}
        onSave={handleUpdateDuration}
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
    marginVertical: 10, // Biraz daha sıkılaştırdık
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  editHint: {
    textAlign: 'center',
    fontSize: 12,
    color: '#4a90e2',
    marginTop: -5,
    marginBottom: 15,
    fontWeight: '600',
  },
  categoryWrapper: {
    marginBottom: 20, // Buton ile ara boşluk
    marginTop: 10,
    width: '100%',
  }
});