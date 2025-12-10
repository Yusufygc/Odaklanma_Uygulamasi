// ==========================================
// screens/HomeScreen.js - FINAL & COMPLETE
// ==========================================
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
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
import { TimeAdjustmentModal } from '../components/timer/TimeAdjustmentModal';

// Services & Utils
import { SessionService } from '../services/SessionService';
import { NotificationService } from '../services/NotificationService';
import { SESSION_TYPES, TIMER_DURATIONS, VIBRATION_PATTERNS } from '../utils/constants';

export default function HomeScreen() {
  // ---------------- STATE YÖNETİMİ ----------------
  const [sessionType, setSessionType] = useState(SESSION_TYPES.WORK);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [distractionCount, setDistractionCount] = useState(0);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  
  // Modal Kontrolleri
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false); // ⏱️ Yeni Süre Modalı

  // Durum Kontrolleri
  const [wasActiveBeforeBackground, setWasActiveBeforeBackground] = useState(false);
  const [showPomodoroBadge, setShowPomodoroBadge] = useState(false); // 🏅 Başarı Rozeti

  // Ayarlar
  const [workMinutes, setWorkMinutes] = useState(25); // ⚙️ Varsayılan Çalışma Süresi

  // Custom Hooks
  const { categories, loadCategories, addNewCategory, removeCategory } = useCategories();
  
  // ---------------- REF PROXY (Döngüsel Bağımlılık Çözümü) ----------------
  const onSessionCompleteRef = useRef(null);

  // Timer Hook Başlatma
  const timer = useTimer(
    sessionType === SESSION_TYPES.WORK ? workMinutes * 60 : SessionService.getSessionDuration(sessionType),
    () => {
      console.log("🔗 Timer bitti, Ref üzerinden fonksiyon çağrılıyor...");
      if (onSessionCompleteRef.current) {
        onSessionCompleteRef.current();
      } else {
        console.error("❌ HATA: onSessionCompleteRef boş!");
      }
    }
  );

  // ---------------- LIFECYCLE & APP STATE ----------------

  // Ekran odaklandığında kategorileri yükle
  useFocusEffect(
    useCallback(() => {
      loadCategories().then((cats) => {
        if (!selectedCategory && cats.length > 0) {
          setSelectedCategory(cats[0].name);
        }
      });
    }, [])
  );

  // Uygulama Arka Plana Geçince / Öne Gelince
  useAppState(
    // onBackground
    () => {
      if (timer.isActive && sessionType === SESSION_TYPES.WORK) {
        setWasActiveBeforeBackground(true);
        timer.pause();
        setDistractionCount(prev => prev + 1);
        NotificationService.vibrate(VIBRATION_PATTERNS.DISTRACTION);
      }
    },
    // onForeground
    () => {
      if (wasActiveBeforeBackground && !timer.isActive && timer.timeLeft > 0) {
        setShowResumeModal(true);
        setWasActiveBeforeBackground(false);
      }
    }
  );

  // ---------------- HANDLERS (İş Mantığı) ----------------

  // Süre Güncelleme (Modal'dan gelen)
  const handleUpdateDuration = (minutes) => {
    setWorkMinutes(minutes);
    setShowTimeModal(false);
    
    // Eğer şu an "Odaklan" modundaysak ve sayaç çalışmıyorsa, süreyi hemen güncelle
    if (!timer.isActive && sessionType === SESSION_TYPES.WORK) {
      timer.reset(minutes * 60);
      NotificationService.showSuccess(`Süre ${minutes} dk olarak ayarlandı`);
    }
  };

  // Timer Sıfırlama
  const handleResetTimer = useCallback(() => {
    setSessionType(SESSION_TYPES.WORK);
    timer.reset(workMinutes * 60); // Dinamik süreyi kullan
    setDistractionCount(0);
    setWasActiveBeforeBackground(false);
  }, [timer, workMinutes]);

  // Mola Başlatma
  const handleStartBreak = useCallback((pomodoroCount) => {
    const breakType = SessionService.calculateNextSessionType(pomodoroCount);
    setSessionType(breakType);
    timer.reset(SessionService.getSessionDuration(breakType));
    setDistractionCount(0);
    timer.start();
  }, [timer]);

  // SEANS BİTİŞİ (Ana Fonksiyon)
  const handleSessionComplete = useCallback(async () => {
    console.log("🏁 HomeScreen: handleSessionComplete çalıştı!");

    NotificationService.vibrate(VIBRATION_PATTERNS.COMPLETE);

    if (sessionType === SESSION_TYPES.WORK) {
      if (!selectedCategory) {
        console.error("❌ Kategori yok");
        NotificationService.showError("Kategori seçilmediği için kaydedilemedi.");
        return;
      }

      console.log(`💾 Kayıt Başlıyor: Kategori=${selectedCategory}, Süre=${workMinutes}dk`);
      
      // Veritabanına kaydet
      const success = await SessionService.saveSession(
        selectedCategory,
        workMinutes * 60, // Dinamik süreyi saniye olarak gönder
        distractionCount
      );

      if (success) {
        console.log("✅ Kayıt başarılı.");
        const newCount = completedPomodoros + 1;
        setCompletedPomodoros(newCount);
        
        // ✨ Rozeti Göster ve 4sn sonra Gizle
        setShowPomodoroBadge(true);
        setTimeout(() => {
          setShowPomodoroBadge(false);
        }, 4000);
        
        // Kullanıcıya Bildir
        NotificationService.showSessionComplete(
          newCount,
          () => handleStartBreak(newCount), // Molaya geç
          () => handleResetTimer()          // Veya bitir
        );
      }
    } else {
      // Mola Bitişi
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

  // Ref'i güncelle (Her render'da en güncel fonksiyonu tutsun)
  useEffect(() => {
    onSessionCompleteRef.current = handleSessionComplete;
  }, [handleSessionComplete]);

  // Timer Başlat/Durdur
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

  // Kategori Seçimi
  const handleCategorySelect = (category) => {
    if (!timer.isActive) {
      setSelectedCategory(category.name);
    }
  };

  // Modal İşlemleri
  const handleResumeSession = () => {
    setShowResumeModal(false);
    timer.start();
  };

  const handleStayPaused = () => {
    setShowResumeModal(false);
  };

  // ---------------- RENDER HELPERS ----------------

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

  // ---------------- JSX RETURN ----------------

  return (
    <View style={[styles.container, isBreakMode && styles.containerBreak]}>
      {/* 1. Başlık Alanı */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {SessionService.getSessionTitle(sessionType)}
        </Text>
        <Text style={styles.subtitle}>
          {SessionService.getSessionSubtitle(sessionType)}
        </Text>
      </View>

      {/* 2. Başarı Rozeti (Sadece true olduğunda görünür) */}
      {showPomodoroBadge && (
        <PomodoroCounter count={completedPomodoros} />
      )}

      {/* 3. Kategori Seçici (Sadece iş modunda görünür) */}
      {!isBreakMode && (
        <CategorySelector
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={handleCategorySelect}
          onManage={() => setShowCategoryModal(true)}
          disabled={timer.isActive}
        />
      )}

      {/* 4. Sayaç Alanı (Tıklanabilir) */}
      <View style={styles.timerContainer}>
        <ProgressBar progress={timer.getProgress()} color={progressColor} />
        
        <TouchableOpacity 
          onPress={() => !isBreakMode && !timer.isActive && setShowTimeModal(true)}
          activeOpacity={!isBreakMode && !timer.isActive ? 0.7 : 1}
        >
          <TimerDisplay
            timeLeft={timer.timeLeft}
            isBreak={isBreakMode}
            status={getStatusText()}
          />
          {/* Kullanıcıya ipucu ver (Sadece dururken ve iş modunda) */}
          {!isBreakMode && !timer.isActive && (
            <Text style={styles.editHint}>⏱️ Değiştirmek için dokun</Text>
          )}
        </TouchableOpacity>

        {!isBreakMode && <DistractionBadge count={distractionCount} />}
      </View>

      {/* 5. Kontrol Butonları */}
      <TimerControls
        isActive={timer.isActive}
        onToggle={handleToggleTimer}
        onReset={handleResetTimer}
        isBreak={isBreakMode}
      />

      {/* 6. Modallar */}
      
      {/* Otomatik Duraklatma Modalı */}
      <ResumeSessionModal
        visible={showResumeModal}
        timeLeft={timer.timeLeft}
        onResume={handleResumeSession}
        onStayPaused={handleStayPaused}
      />

      {/* Kategori Yönetim Modalı */}
      <CategoryManagementModal
        visible={showCategoryModal}
        categories={categories}
        onClose={() => setShowCategoryModal(false)}
        onAdd={addNewCategory}
        onDelete={removeCategory}
      />

      {/* Süre Ayarlama Modalı (YENİ) */}
      <TimeAdjustmentModal 
        visible={showTimeModal}
        currentMinutes={workMinutes}
        onClose={() => setShowTimeModal(false)}
        onSave={handleUpdateDuration}
      />
    </View>
  );
}

// ---------------- STYLES ----------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  containerBreak: {
    backgroundColor: '#e8f5e9', // Mola modunda yeşilimsi arka plan
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
  editHint: {
    textAlign: 'center',
    fontSize: 12,
    color: '#4a90e2',
    marginTop: -5,
    marginBottom: 5,
    fontWeight: '600',
  }
});