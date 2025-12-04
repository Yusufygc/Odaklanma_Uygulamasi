import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, AppState } from 'react-native';
import { addSession } from '../utils/db';
import { Ionicons } from '@expo/vector-icons';

// Sabitler
const WORK_TIME = 10; 
const CATEGORIES = ["Ders Çalışma", "Kodlama", "Proje", "Kitap Okuma"];

export default function HomeScreen() {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Kodlama");
  const [distractionCount, setDistractionCount] = useState(0); // Yeni: Dikkat dağınıklığı sayacı

  // AppState takibi için referans
  const appState = useRef(AppState.currentState);

  // 1. DİKKAT DAĞINIKLIĞI TAKİBİ (AppState Listener)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      
      // Eğer uygulama arka plana atılırsa (Background) ve sayaç çalışıyorsa
      if (
        appState.current.match(/active/) && 
        nextAppState.match(/inactive|background/)
      ) {
        if (isActive) {
          setIsActive(false); // Sayacı durdur
          setDistractionCount(prev => prev + 1); // Dikkat dağınıklığını artır
        }
      }

      // Eğer uygulama tekrar açılırsa (Active)
      if (
        appState.current.match(/inactive|background/) && 
        nextAppState === 'active'
      ) {
        // İsteğe bağlı: Kullanıcı geri döndüğünde uyarı verebiliriz
        Alert.alert("Tekrar Hoşgeldin!", "Dikkatin dağıldı, odaklanmaya devam et!");
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isActive]); // isActive değiştiğinde listener güncellenir

  // 2. SAYAÇ MANTIĞI
  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      clearInterval(interval);
      
      // ESKİ KOD BUYDU (Bunu Siliyoruz):
      // addSession(selectedCategory, WORK_TIME, distractionCount, () => {
      //    console.log("Seans veritabanına kaydedildi.");
      // });

      // YENİ KOD BU OLMALI:
      addSession(selectedCategory, WORK_TIME, distractionCount);
      
      Alert.alert("Tebrikler!", "Odaklanma seansını başarıyla tamamladın ve kaydedildi.");
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Zaman Formatlama
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(WORK_TIME);
    setDistractionCount(0); // Sıfırlayınca dağılma sayısını da sıfırla
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Odaklan</Text>
        <Text style={styles.subtitle}>Bir kategori seç ve başla</Text>
      </View>

      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map((cat, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryButton,
                selectedCategory === cat && styles.categoryButtonActive
              ]}
              onPress={() => !isActive && setSelectedCategory(cat)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === cat && styles.categoryTextActive
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        <Text style={styles.statusText}>
            {isActive ? "Odaklanılıyor..." : "Sayaç Durduruldu"}
        </Text>
        
        {/* Yeni: Dikkat Dağınıklığı Göstergesi */}
        <View style={styles.distractionBadge}>
            <Ionicons name="alert-circle-outline" size={20} color="#e74c3c" />
            <Text style={styles.distractionText}>
                Dikkat Dağınıklığı: {distractionCount}
            </Text>
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.mainButton} onPress={toggleTimer}>
            <Ionicons name={isActive ? "pause" : "play"} size={32} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.resetButton} onPress={resetTimer}>
            <Ionicons name="refresh" size={24} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: { marginBottom: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 5 },
  categoryContainer: { height: 60, marginBottom: 10 },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 10,
    justifyContent: 'center',
    height: 45,
  },
  categoryButtonActive: { backgroundColor: '#4a90e2' },
  categoryText: { color: '#333', fontWeight: '600' },
  categoryTextActive: { color: '#fff' },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  timerText: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#333',
    fontVariant: ['tabular-nums'],
  },
  statusText: { fontSize: 18, color: '#888', marginTop: 10 },
  distractionBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 20,
      padding: 10,
      backgroundColor: '#fff5f5',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#ffcccc'
  },
  distractionText: {
      marginLeft: 5,
      color: '#c0392b',
      fontWeight: 'bold'
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  mainButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  resetButton: {
    position: 'absolute',
    right: 40,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  }
});