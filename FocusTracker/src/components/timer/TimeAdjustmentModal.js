// ==========================================
// src/components/timer/TimeAdjustmentModal.js
// ==========================================
import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 1'den başlayıp 5'er 5'er 180'e kadar giden dizi oluşturucu
const generateTimeOptions = () => {
  const options = [1]; // 1. dakika özel
  for (let i = 5; i <= 180; i += 5) {
    options.push(i);
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();
const ITEM_HEIGHT = 50; // Her bir liste elemanının yüksekliği

export const TimeAdjustmentModal = ({ visible, currentMinutes, onClose, onSave }) => {
  const [selectedTime, setSelectedTime] = useState(currentMinutes);
  const flatListRef = useRef(null);

  // Modal her açıldığında seçili süreyi güncelle
  useEffect(() => {
    if (visible) {
      setSelectedTime(currentMinutes);
      
      // Listeyi seçili elemana kaydır (Hafif gecikmeli çünkü render olması lazım)
      setTimeout(() => {
        const index = TIME_OPTIONS.indexOf(currentMinutes);
        if (index !== -1 && flatListRef.current) {
          flatListRef.current.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.5, // Ortala
          });
        }
      }, 300);
    }
  }, [visible, currentMinutes]);

  const handleSave = () => {
    onSave(selectedTime);
  };

  const renderItem = ({ item }) => {
    const isSelected = item === selectedTime;
    return (
      <TouchableOpacity
        style={[styles.timeOption, isSelected && styles.timeOptionSelected]}
        onPress={() => setSelectedTime(item)}
      >
        <Text style={[styles.timeText, isSelected && styles.timeTextSelected]}>
          {item} dk
        </Text>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color="#fff" style={styles.checkIcon} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIconBg}>
              <Ionicons name="time" size={24} color="#4a90e2" />
            </View>
            <Text style={styles.title}>Süre Seçimi</Text>
            <Text style={styles.subtitle}>Odaklanma sürenizi belirleyin</Text>
          </View>

          {/* Scrollable List */}
          <View style={styles.listContainer}>
            <FlatList
              ref={flatListRef}
              data={TIME_OPTIONS}
              keyExtractor={(item) => item.toString()}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              getItemLayout={(data, index) => ({
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
                index,
              })}
              initialNumToRender={10}
            />
          </View>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={onClose}>
              <Text style={styles.cancelText}>İptal</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.saveBtn]} onPress={handleSave}>
              <Text style={styles.saveText}>Seç ({selectedTime} dk)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '100%',
    maxWidth: 340,
    maxHeight: '80%', // Ekranın %80'inden fazla yer kaplamasın
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
    zIndex: 1,
  },
  headerIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eef6fc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  listContainer: {
    height: 300, // Listenin görünür yüksekliği
    backgroundColor: '#f8f9fa',
  },
  timeOption: {
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
  },
  timeOptionSelected: {
    backgroundColor: '#4a90e2',
  },
  timeText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
  },
  timeTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  checkIcon: {
    position: 'absolute',
    right: 16,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#f5f5f5',
  },
  saveBtn: {
    backgroundColor: '#4a90e2',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});