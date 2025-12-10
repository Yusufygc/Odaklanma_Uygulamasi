// ==========================================
// components/reports/EmptyState.js
// ==========================================
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const EmptyState = ({ 
  icon = 'calendar-outline', 
  title = 'Henüz veri yok',
  message = 'İlk odaklanma seansını tamamlayarak raporlarını görmeye başla! 🚀'
}) => {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color="#ccc" />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});