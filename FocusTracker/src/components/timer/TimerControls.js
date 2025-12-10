// ==========================================
// components/timer/TimerControls.js
// ==========================================
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const TimerControls = ({ 
  isActive, 
  onToggle, 
  onReset, 
  isBreak = false 
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.mainButton, isBreak && styles.mainButtonBreak]}
        onPress={onToggle}
      >
        <Ionicons name={isActive ? 'pause' : 'play'} size={32} color="white" />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.resetButton}
        onPress={onReset}
        disabled={isActive}
      >
        <Ionicons name="refresh" size={24} color={isActive ? '#ccc' : '#333'} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
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
});