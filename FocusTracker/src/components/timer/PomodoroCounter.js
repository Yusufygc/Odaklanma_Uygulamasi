// ==========================================
// components/timer/PomodoroCounter.js
// ==========================================
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const PomodoroCounter = ({ count }) => {
  if (count === 0) return null;

  return (
    <View style={styles.container}>
      <Ionicons name="checkmark-circle" size={20} color="#2ecc71" />
      <Text style={styles.text}>
        {count} Pomodoro Tamamlandı 🍅
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d4edda',
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#2ecc71',
  },
  text: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#155724',
  },
});