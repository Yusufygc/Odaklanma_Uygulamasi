// ==========================================
// components/timer/TimerDisplay.js
// ==========================================
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TimeFormatter } from '../../utils/timeFormatter';

export const TimerDisplay = ({ timeLeft, isBreak = false, status }) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.time, isBreak && styles.timeBreak]}>
        {TimeFormatter.formatSeconds(timeLeft)}
      </Text>
      <Text style={styles.status}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  time: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#333',
    fontVariant: ['tabular-nums'],
    letterSpacing: 4,
  },
  timeBreak: {
    color: '#2ecc71',
  },
  status: {
    fontSize: 18,
    color: '#888',
    marginTop: 10,
    fontWeight: '500',
  },
});
