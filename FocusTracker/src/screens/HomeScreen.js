import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, AppState, 
  Modal, TextInput, FlatList, KeyboardAvoidingView, Platform, Vibration 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { addSession, getCategories, addCategory, deleteCategory } from '../utils/db'; 

const WORK_TIME = 25 * 60; 
const SHORT_BREAK = 5 * 60;
const LONG_BREAK = 15 * 60;

export default function HomeScreen() {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [distractionCount, setDistractionCount] = useState(0);
  const [sessionType, setSessionType] = useState('work'); // 'work', 'short-break', 'long-break'
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [showResumeModal, setShowResumeModal] = useState(false);
  
  // Kategori Yönetimi State'leri
  const [categories, setCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const appState = useRef(AppState.currentState);
  const wasActiveBeforeBackground = useRef(false);

  // Sayfa açıldığında kategorileri yükle
  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [])
  );

  const loadCategories = async () => {
    const data = await getCategories();
    setCategories(data);
    // Eğer hiç seçili kategori yoksa ve veri geldiyse ilkini seç
    if (selectedCategory === "" && data.length > 0) {
      setSelectedCategory(data[0].name);
    }
  };

  // Yeni Kategori Ekleme Fonksiyonu
  const handleAddCategory = async () => {
    if (newCategoryName.trim().length === 0) {
      Alert.alert("Uyarı", "Lütfen bir kategori adı girin.");
      return;
    }
    
    const success = await addCategory(newCategoryName.trim());
    if (success) {
      setNewCategoryName("");
      loadCategories();
      Alert.alert("Başarılı! ✅", "Kategori eklendi.");
    } else {
      Alert.alert("Hata", "Bu kategori zaten var veya eklenemedi.");
    }
  };

  // Kategori Silme Fonksiyonu
  const handleDeleteCategory = async (id, categoryName) => {
    // Son kategoriyi silmeye çalışıyorsa engelle
    if (categories.length <= 1) {
      Alert.alert("Uyarı", "En az bir kategori olmalı!");
      return;
    }

    Alert.alert(
      "Kategori Sil", 
      `"${categoryName}" kategorisini silmek istediğine emin misin?`, 
      [
        { text: "İptal", style: "cancel" },
        { 
          text: "Sil", 
          style: "destructive", 
          onPress: async () => {
            await deleteCategory(id);
            // Eğer silinen kategori seçili idiyse, ilk kategoriyi seç
            if (selectedCategory === categoryName) {
              const remainingCats = categories.filter(c => c.id !== id);
              if (remainingCats.length > 0) {
                setSelectedCategory(remainingCats[0].name);
              }
            }
            loadCategories();
          } 
        }
      ]
    );
  };

  // AppState Listener - Dikkat Dağınıklığı Takibi
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      // Uygulama arka plana gidiyorsa (active -> background/inactive)
      if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
        // Eğer sayaç çalışıyorsa, duraklat ve dikkat dağınıklığı say
        if (isActive) {
          wasActiveBeforeBackground.current = true;
          setIsActive(false); // Sayacı duraklat
          setDistractionCount(prev => prev + 1); // Dikkat dağınıklığı say
          Vibration.vibrate(200);
          console.log("Uygulama arka plana gitti - Sayaç duraklatıldı, dikkat dağınıklığı kaydedildi");
        }
      } 
      // Uygulama ön plana geliyorsa (background/inactive -> active)
      else if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // Eğer sayaç duraklatılmışsa ve daha önce aktifse, kullanıcıya sor
        if (wasActiveBeforeBackground.current && !isActive && timeLeft > 0) {
          setShowResumeModal(true);
          wasActiveBeforeBackground.current = false;
        }
      }
      
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [isActive, timeLeft]);

  // Sayacı devam ettir
  const handleResume = () => {
    setShowResumeModal(false);
    setIsActive(true);
  };

  // Sayacı duraklatılmış bırak
  const handleStayPaused = () => {
    setShowResumeModal(false);
  };

  // Sayaç Mantığı
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      clearInterval(interval);
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, sessionType]);

  // Seans tamamlandığında
  const handleSessionComplete = () => {
    Vibration.vibrate([500, 200, 500]);

    if (sessionType === 'work') {
      // Çalışma seansı bitti
      addSession(selectedCategory, WORK_TIME, distractionCount);
      const newPomodoroCount = completedPomodoros + 1;
      setCompletedPomodoros(newPomodoroCount);

      // Her 4 pomodoro'da bir uzun mola
      if (newPomodoroCount % 4 === 0) {
        Alert.alert(
          "🎉 Harika İş!", 
          `${newPomodoroCount}. Pomodoro'yu tamamladın! Uzun bir mola zamanı.`,
          [
            { text: "Daha Sonra", style: "cancel", onPress: resetTimer },
            { 
              text: "Uzun Mola (15dk)", 
              onPress: () => startBreak('long-break')
            }
          ]
        );
      } else {
        Alert.alert(
          "✅ Tebrikler!", 
          "Odaklanma seansını başarıyla tamamladın! Kısa bir mola ister misin?",
          [
            { text: "Devam Et", style: "cancel", onPress: resetTimer },
            { 
              text: "Kısa Mola (5dk)", 
              onPress: () => startBreak('short-break')
            }
          ]
        );
      }
    } else {
      // Mola bitti
      Alert.alert(
        "⏰ Mola Bitti!", 
        "Tekrar çalışmaya hazır mısın?",
        [
          { text: "Biraz Daha", style: "cancel" },
          { text: "Başla!", onPress: resetTimer }
        ]
      );
    }
  };

  // Mola başlat
  const startBreak = (type) => {
    setSessionType(type);
    setTimeLeft(type === 'short-break' ? SHORT_BREAK : LONG_BREAK);
    setDistractionCount(0);
    setIsActive(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const resetTimer = () => {
    setIsActive(false);
    setSessionType('work');
    setTimeLeft(WORK_TIME);
    setDistractionCount(0);
    wasActiveBeforeBackground.current = false;
  };

  // İlerleme yüzdesi
  const getProgress = () => {
    const total = sessionType === 'work' ? WORK_TIME : 
                  sessionType === 'short-break' ? SHORT_BREAK : LONG_BREAK;
    return ((total - timeLeft) / total) * 100;
  };

  // Kategori seçili değilse başlatma
  const handleStartPause = () => {
    if (!selectedCategory) {
      Alert.alert("Uyarı", "Lütfen önce bir kategori seç!");
      return;
    }
    setIsActive(!isActive);
  };

  return (
    <View style={[styles.container, sessionType !== 'work' && styles.containerBreak]}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {sessionType === 'work' ? '🎯 Odaklan' : 
           sessionType === 'short-break' ? '☕ Kısa Mola' : '🌟 Uzun Mola'}
        </Text>
        <Text style={styles.subtitle}>
          {sessionType === 'work' ? 'Bir kategori seç ve başla' : 'Dinlen ve enerji topla'}
        </Text>
      </View>

      {/* Pomodoro Sayacı */}
      {completedPomodoros > 0 && (
        <View style={styles.pomodoroCounter}>
          <Ionicons name="checkmark-circle" size={20} color="#2ecc71" />
          <Text style={styles.pomodoroText}>
            {completedPomodoros} Pomodoro Tamamlandı 🍅
          </Text>
        </View>
      )}

      {/* Kategori Seçimi Alanı - Sadece work modunda */}
      {sessionType === 'work' && (
        <View style={styles.categoryRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
            {categories.length === 0 ? (
              <Text style={styles.noCategoryText}>Kategori ekle...</Text>
            ) : (
              categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === cat.name && styles.categoryButtonActive
                  ]}
                  onPress={() => !isActive && setSelectedCategory(cat.name)}
                  disabled={isActive}
                >
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === cat.name && styles.categoryTextActive
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
          
          <TouchableOpacity 
            style={[styles.addCatButton, isActive && styles.addCatButtonDisabled]} 
            onPress={() => setModalVisible(true)}
            disabled={isActive}
          >
            <Ionicons name="settings-sharp" size={20} color={isActive ? "#ccc" : "#666"} />
          </TouchableOpacity>
        </View>
      )}

      {/* SAYAÇ ARAYÜZÜ */}
      <View style={styles.timerContainer}>
        {/* İlerleme Çemberi */}
        <View style={styles.progressCircle}>
          <View style={[styles.progressBar, { 
            width: `${getProgress()}%`,
            backgroundColor: sessionType === 'work' ? '#4a90e2' : '#2ecc71'
          }]} />
        </View>

        <Text style={[
          styles.timerText,
          sessionType !== 'work' && styles.timerTextBreak
        ]}>
          {formatTime(timeLeft)}
        </Text>
        
        <Text style={styles.statusText}>
          {isActive ? (sessionType === 'work' ? "Odaklanılıyor... 🎯" : "Mola veriyor... ☕") : "Hazır mısın? 💪"}
        </Text>
        
        {/* Dikkat Dağınıklığı Badge - Sadece work modunda */}
        {sessionType === 'work' && (
          <View style={styles.distractionBadge}>
            <Ionicons name="alert-circle-outline" size={20} color="#e74c3c" />
            <Text style={styles.distractionText}>
              Dikkat Dağınıklığı: {distractionCount}
            </Text>
          </View>
        )}
      </View>

      {/* Kontrol Butonları */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={[
            styles.mainButton,
            sessionType !== 'work' && styles.mainButtonBreak
          ]} 
          onPress={handleStartPause}
        >
          <Ionicons name={isActive ? "pause" : "play"} size={32} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.resetButton} 
          onPress={resetTimer}
          disabled={isActive}
        >
          <Ionicons name="refresh" size={24} color={isActive ? "#ccc" : "#333"} />
        </TouchableOpacity>
      </View>

      {/* Hızlı Mola Butonları */}
      {!isActive && sessionType === 'work' && completedPomodoros > 0 && (
        <View style={styles.quickBreakButtons}>
          <TouchableOpacity 
            style={styles.quickBreakButton}
            onPress={() => startBreak('short-break')}
          >
            <Ionicons name="cafe" size={18} color="#3498db" />
            <Text style={styles.quickBreakText}>Kısa Mola</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickBreakButton}
            onPress={() => startBreak('long-break')}
          >
            <Ionicons name="bed" size={18} color="#9b59b6" />
            <Text style={styles.quickBreakText}>Uzun Mola</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* DEVAM ET MODALI - Uygulamaya geri dönüldüğünde */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showResumeModal}
        onRequestClose={() => setShowResumeModal(false)}
      >
        <View style={styles.resumeModalContainer}>
          <View style={styles.resumeModalContent}>
            <Ionicons name="pause-circle" size={64} color="#4a90e2" />
            <Text style={styles.resumeModalTitle}>Sayaç Duraklatıldı</Text>
            <Text style={styles.resumeModalSubtitle}>
              Uygulamadan ayrıldığın için sayaç otomatik olarak duraklatıldı.
            </Text>
            <Text style={styles.resumeModalInfo}>
              Kalan süre: {formatTime(timeLeft)}
            </Text>
            
            <View style={styles.resumeModalButtons}>
              <TouchableOpacity 
                style={styles.resumeButton}
                onPress={handleResume}
              >
                <Ionicons name="play" size={20} color="white" />
                <Text style={styles.resumeButtonText}>Devam Et</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.pauseButton}
                onPress={handleStayPaused}
              >
                <Ionicons name="pause" size={20} color="#666" />
                <Text style={styles.pauseButtonText}>Duraklatılmış Kalsın</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.distractionNote}>
              💡 Dikkat dağınıklığı sayacına eklendi
            </Text>
          </View>
        </View>
      </Modal>

      {/* KATEGORİ YÖNETİM MODALI */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <View 
              style={styles.modalContent}
              onStartShouldSetResponder={() => true}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>📝 Kategorileri Düzenle</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close-circle" size={28} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Yeni Ekleme Input */}
              <View style={styles.inputContainer}>
                <TextInput 
                  style={styles.input}
                  placeholder="Yeni kategori adı girin..."
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  maxLength={30}
                  onSubmitEditing={handleAddCategory}
                />
                <TouchableOpacity 
                  style={styles.addButton} 
                  onPress={handleAddCategory}
                >
                  <Ionicons name="add-circle" size={28} color="white" />
                </TouchableOpacity>
              </View>

              {/* Mevcut Liste */}
              {categories.length === 0 ? (
                <View style={styles.emptyCategory}>
                  <Ionicons name="folder-open-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyCategoryText}>Henüz kategori yok</Text>
                </View>
              ) : (
                <FlatList
                  data={categories}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.listItem}>
                      <View style={styles.listItemLeft}>
                        <Ionicons name="pricetag" size={18} color="#4a90e2" />
                        <Text style={styles.listItemText}>{item.name}</Text>
                      </View>
                      <TouchableOpacity 
                        onPress={() => handleDeleteCategory(item.id, item.name)}
                        style={styles.deleteButton}
                      >
                        <Ionicons name="trash-outline" size={22} color="#e74c3c" />
                      </TouchableOpacity>
                    </View>
                  )}
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
              )}
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa', 
    paddingTop: 50, 
    paddingHorizontal: 20 
  },
  containerBreak: {
    backgroundColor: '#e8f5e9',
  },
  header: { marginBottom: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 5 },
  
  pomodoroCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d4edda',
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#2ecc71',
  },
  pomodoroText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#155724',
  },

  categoryRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    height: 50, 
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  noCategoryText: {
    fontSize: 14,
    color: '#999',
    paddingHorizontal: 15,
    fontStyle: 'italic',
  },
  categoryButton: {
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    backgroundColor: '#f0f0f0',
    borderRadius: 20, 
    marginRight: 8, 
    justifyContent: 'center', 
    height: 38
  },
  categoryButtonActive: { 
    backgroundColor: '#4a90e2',
    elevation: 3,
    shadowColor: '#4a90e2',
    shadowOpacity: 0.3,
  },
  categoryText: { color: '#333', fontWeight: '600', fontSize: 14 },
  categoryTextActive: { color: '#fff' },
  addCatButton: { 
    padding: 10, 
    backgroundColor: '#f0f0f0', 
    borderRadius: 20, 
    marginLeft: 5 
  },
  addCatButtonDisabled: {
    backgroundColor: '#e0e0e0',
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
  progressCircle: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  timerText: { 
    fontSize: 72, 
    fontWeight: 'bold', 
    color: '#333', 
    fontVariant: ['tabular-nums'],
    letterSpacing: 4,
  },
  timerTextBreak: {
    color: '#2ecc71',
  },
  statusText: { 
    fontSize: 18, 
    color: '#888', 
    marginTop: 10,
    fontWeight: '500',
  },
  distractionBadge: {
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 20, 
    padding: 12,
    backgroundColor: '#fff5f5', 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#ffcccc',
    minWidth: 200,
    justifyContent: 'center',
  },
  distractionText: { 
    marginLeft: 8, 
    color: '#c0392b', 
    fontWeight: '600',
    fontSize: 14,
  },
  
  controlsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 20 
  },
  mainButton: {
    width: 85, 
    height: 85, 
    borderRadius: 42.5, 
    backgroundColor: '#4a90e2',
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 8, 
    shadowColor: '#4a90e2',
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  mainButtonBreak: {
    backgroundColor: '#2ecc71',
    shadowColor: '#2ecc71',
  },
  resetButton: {
    position: 'absolute', 
    right: 40, 
    width: 55, 
    height: 55,
    borderRadius: 27.5, 
    backgroundColor: '#fff', 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },

  quickBreakButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginTop: 20,
  },
  quickBreakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    gap: 8,
  },
  quickBreakText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  // Devam Et Modal Styles
  resumeModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resumeModalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    elevation: 10,
  },
  resumeModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  resumeModalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  resumeModalInfo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4a90e2',
    marginBottom: 24,
  },
  resumeModalButtons: {
    width: '100%',
    gap: 12,
  },
  resumeButton: {
    flexDirection: 'row',
    backgroundColor: '#4a90e2',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 3,
  },
  resumeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pauseButton: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pauseButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  distractionNote: {
    marginTop: 20,
    fontSize: 13,
    color: '#e74c3c',
    fontStyle: 'italic',
  },

  // Modal Styles
  modalContainer: { 
    flex: 1, 
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: { 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    padding: 24, 
    maxHeight: '75%',
    elevation: 10,
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 24 
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: { 
    flexDirection: 'row', 
    marginBottom: 24,
    gap: 10,
  },
  input: { 
    flex: 1, 
    backgroundColor: '#f8f9fa', 
    padding: 14, 
    borderRadius: 12, 
    borderWidth: 1.5, 
    borderColor: '#e0e0e0',
    fontSize: 15,
  },
  addButton: { 
    backgroundColor: '#2ecc71', 
    width: 50, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 2,
  },
  emptyCategory: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyCategoryText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
  },
  listItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: 16, 
    paddingHorizontal: 12,
    borderBottomWidth: 1, 
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fafafa',
    marginBottom: 8,
    borderRadius: 10,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  listItemText: { 
    fontSize: 16, 
    color: '#333',
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
  },
});