import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, AppState, 
  Modal, TextInput, FlatList, KeyboardAvoidingView, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { addSession, getCategories, addCategory, deleteCategory } from '../utils/db'; 

const WORK_TIME = 25 * 60; 

export default function HomeScreen() {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [distractionCount, setDistractionCount] = useState(0);
  
  // Kategori Yönetimi State'leri
  const [categories, setCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const appState = useRef(AppState.currentState);

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
    if (newCategoryName.trim().length === 0) return;
    
    const success = await addCategory(newCategoryName.trim());
    if (success) {
      setNewCategoryName("");
      loadCategories(); // Listeyi yenile
    } else {
      Alert.alert("Hata", "Bu kategori zaten var veya eklenemedi.");
    }
  };

  // Kategori Silme Fonksiyonu
  const handleDeleteCategory = async (id) => {
    Alert.alert("Sil", "Bu kategoriyi silmek istediğine emin misin?", [
      { text: "İptal", style: "cancel" },
      { 
        text: "Sil", 
        style: "destructive", 
        onPress: async () => {
          await deleteCategory(id);
          loadCategories();
        } 
      }
    ]);
  };

  // AppState Listener (Dikkat Dağınıklığı)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
        if (isActive) {
          setIsActive(false);
          setDistractionCount(prev => prev + 1);
        }
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, [isActive]);

  // Sayaç Mantığı
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      clearInterval(interval);
      addSession(selectedCategory, WORK_TIME, distractionCount);
      Alert.alert("Tebrikler!", "Odaklanma seansını başarıyla tamamladın ve kaydedildi.");
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(WORK_TIME);
    setDistractionCount(0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Odaklan</Text>
        <Text style={styles.subtitle}>Bir kategori seç ve başla</Text>
      </View>

      {/* Kategori Seçimi Alanı */}
      <View style={styles.categoryRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryButton,
                selectedCategory === cat.name && styles.categoryButtonActive
              ]}
              onPress={() => !isActive && setSelectedCategory(cat.name)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === cat.name && styles.categoryTextActive
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Kategori Düzenleme Butonu (+ İkonu) */}
        <TouchableOpacity 
          style={styles.addCatButton} 
          onPress={() => setModalVisible(true)}
          disabled={isActive} // Sayaç çalışırken düzenleme yapılmasın
        >
          <Ionicons name="settings-sharp" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* SAYAÇ ARAYÜZÜ */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        <Text style={styles.statusText}>{isActive ? "Odaklanılıyor..." : "Hazır mısın?"}</Text>
        
        <View style={styles.distractionBadge}>
            <Ionicons name="alert-circle-outline" size={20} color="#e74c3c" />
            <Text style={styles.distractionText}>Dikkat Dağınıklığı: {distractionCount}</Text>
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.mainButton} onPress={() => setIsActive(!isActive)}>
            <Ionicons name={isActive ? "pause" : "play"} size={32} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetButton} onPress={resetTimer}>
            <Ionicons name="refresh" size={24} color="#333" />
        </TouchableOpacity>
      </View>

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
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kategorileri Düzenle</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Yeni Ekleme Input */}
            <View style={styles.inputContainer}>
              <TextInput 
                style={styles.input}
                placeholder="Yeni Kategori Adı..."
                value={newCategoryName}
                onChangeText={setNewCategoryName}
              />
              <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Mevcut Liste */}
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.listItem}>
                  <Text style={styles.listItemText}>{item.name}</Text>
                  <TouchableOpacity onPress={() => handleDeleteCategory(item.id)}>
                    <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50, paddingHorizontal: 20 },
  header: { marginBottom: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 5 },
  
  categoryRow: { flexDirection: 'row', alignItems: 'center', height: 50, marginBottom: 10 },
  categoryButton: {
    paddingHorizontal: 15, paddingVertical: 8, backgroundColor: '#f0f0f0',
    borderRadius: 20, marginRight: 8, justifyContent: 'center', height: 40
  },
  categoryButtonActive: { backgroundColor: '#4a90e2' },
  categoryText: { color: '#333', fontWeight: '600' },
  categoryTextActive: { color: '#fff' },
  addCatButton: { 
    padding: 8, backgroundColor: '#eee', borderRadius: 20, marginLeft: 5 
  },

  timerContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: 20 },
  timerText: { fontSize: 80, fontWeight: 'bold', color: '#333', fontVariant: ['tabular-nums'] },
  statusText: { fontSize: 18, color: '#888', marginTop: 10 },
  distractionBadge: {
    flexDirection: 'row', alignItems: 'center', marginTop: 20, padding: 10,
    backgroundColor: '#fff5f5', borderRadius: 10, borderWidth: 1, borderColor: '#ffcccc'
  },
  distractionText: { marginLeft: 5, color: '#c0392b', fontWeight: 'bold' },
  
  controlsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  mainButton: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#4a90e2',
    justifyContent: 'center', alignItems: 'center', elevation: 5, shadowOpacity: 0.3
  },
  resetButton: {
    position: 'absolute', right: 40, width: 50, height: 50,
    borderRadius: 25, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center'
  },

  // Modal Styles
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, height: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  inputContainer: { flexDirection: 'row', marginBottom: 20 },
  input: { 
    flex: 1, backgroundColor: '#f9f9f9', padding: 10, borderRadius: 10, 
    borderWidth: 1, borderColor: '#ddd', marginRight: 10 
  },
  addButton: { 
    backgroundColor: '#2ecc71', width: 50, borderRadius: 10, 
    justifyContent: 'center', alignItems: 'center' 
  },
  listItem: { 
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, 
    borderBottomWidth: 1, borderBottomColor: '#eee' 
  },
  listItemText: { fontSize: 16, color: '#333' }
});