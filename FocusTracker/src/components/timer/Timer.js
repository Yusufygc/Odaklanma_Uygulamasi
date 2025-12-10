// ==========================================
// components/timer/Timer.js
// ==========================================
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TimerDisplay } from './TimerDisplay';
import { ProgressBar } from './ProgressBar';
import { TimerControls } from './TimerControls';

export const Timer = ({
  timeLeft,
  isActive,
  sessionType,
  progress,
  onToggle,
  onReset,
  status,
}) => {
  const isBreak = sessionType !== 'work';
  const progressColor = isBreak ? '#2ecc71' : '#4a90e2';

  return (
    <View style={styles.container}>
      <ProgressBar progress={progress} color={progressColor} />
      <TimerDisplay 
        timeLeft={timeLeft} 
        isBreak={isBreak} 
        status={status} 
      />
      <TimerControls
        isActive={isActive}
        onToggle={onToggle}
        onReset={onReset}
        isBreak={isBreak}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
});

export default Timer;
