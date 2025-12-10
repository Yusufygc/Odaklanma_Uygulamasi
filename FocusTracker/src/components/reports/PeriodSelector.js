// ==========================================
// components/reports/PeriodSelector.js
// ==========================================
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const PERIODS = [
  { key: 'week', label: 'Bu Hafta' },
  { key: 'month', label: 'Bu Ay' },
  { key: 'all', label: 'Tümü' },
];

export const PeriodSelector = ({ selectedPeriod, onSelectPeriod }) => {
  return (
    <View style={styles.container}>
      {PERIODS.map(period => (
        <TouchableOpacity
          key={period.key}
          style={[
            styles.button,
            selectedPeriod === period.key && styles.buttonActive,
          ]}
          onPress={() => onSelectPeriod(period.key)}
        >
          <Text
            style={[
              styles.buttonText,
              selectedPeriod === period.key && styles.buttonTextActive,
            ]}
          >
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonActive: {
    backgroundColor: '#4a90e2',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  buttonTextActive: {
    color: '#fff',
  },
});