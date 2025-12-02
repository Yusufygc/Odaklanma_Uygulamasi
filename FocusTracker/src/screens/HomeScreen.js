import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Sabitler
const WORK_TIME = 25 * 60; // 25 dakika (saniye cinsinden)
const CATEGORIES = ["Ders Çalışma", "Kodlama", "Proje", "Kitap Okuma"];

export default function HomeScreen() {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Kodlama");

  // Sayaç Mantığı (Her saniye çalışır)
  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Süre bittiğinde durdur
      setIsActive(false);
      clearInterval(interval);
      Alert.alert("Tebrikler!", "Odaklanma seansını başarıyla tamamladın.");
    }

    return () => clearInterval(interval); // Temizlik (Cleanup)
  }, [isActive, timeLeft]);

  // Süreyi MM:SS formatına çeviren fonksiyon
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Buton Fonksiyonları
  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(WORK_TIME);
  };

  return (
    <View style={styles.container}>
      {/* Üst Başlık */}
      <View style={styles.header}>
        <Text style={styles.title}>Odaklan</Text>
        <Text style={styles.subtitle}>Bir kategori seç ve başla</Text>
      </View>

      {/* Kategori Seçimi (Yatay Kaydırma) */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map((cat, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryButton,
                selectedCategory === cat && styles.categoryButtonActive
              ]}
              onPress={() => !isActive && setSelectedCategory(cat)} // Sayaç çalışırken kategori değişmesin
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

      {/* Sayaç Göstergesi */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        <Text style={styles.statusText}>
            {isActive ? "Odaklanılıyor..." : "Hazır mısın?"}
        </Text>
      </View>

      {/* Kontrol Butonları */}
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
  categoryContainer: {
    height: 60,
    marginBottom: 30,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 10,
    justifyContent: 'center',
    height: 45,
  },
  categoryButtonActive: {
    backgroundColor: '#4a90e2', // Mavi aktif renk
  },
  categoryText: {
    color: '#333',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  timerText: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#333',
    fontVariant: ['tabular-nums'], // Sayıların titremesini önler
  },
  statusText: {
    fontSize: 18,
    color: '#888',
    marginTop: 10,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  mainButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Android gölge
    shadowColor: '#000', // iOS gölge
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  resetButton: {
    position: 'absolute',
    right: 40, // Sağ tarafa yasla
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  }
});