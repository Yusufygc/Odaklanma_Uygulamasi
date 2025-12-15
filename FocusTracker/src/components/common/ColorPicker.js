import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = [
  '#e74c3c', // Kırmızı
  '#e67e22', // Turuncu
  '#f1c40f', // Sarı
  '#2ecc71', // Yeşil
  '#1abc9c', // Turkuaz
  '#3498db', // Mavi
  '#9b59b6', // Mor
  '#34495e', // Lacivert
  '#95a5a6', // Gri
  '#7f8c8d', // Koyu Gri
];

export const ColorPicker = ({ selectedColor, onSelectColor }) => {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorCircle, 
              { backgroundColor: color },
              selectedColor === color && styles.selected
            ]}
            onPress={() => onSelectColor(color)}
          >
            {selectedColor === color && (
              <Ionicons name="checkmark" size={16} color="#fff" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: '#333', // Seçili olanın etrafında halka
    transform: [{ scale: 1.1 }],
  },
});