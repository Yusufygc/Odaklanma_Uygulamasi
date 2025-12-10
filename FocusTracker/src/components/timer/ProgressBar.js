// ==========================================
// components/timer/ProgressBar.js
// ==========================================
import React from 'react';
import { View, StyleSheet } from 'react-native';

export const ProgressBar = ({ progress, color = '#4a90e2' }) => {
  return (
    <View style={styles.container}>
      <View 
        style={[
          styles.bar, 
          { width: `${progress}%`, backgroundColor: color }
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
});