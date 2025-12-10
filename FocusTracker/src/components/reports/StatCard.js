// ==========================================
// components/reports/StatCard.js
// ==========================================
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const StatCard = ({ icon, iconColor, value, label }) => {
  return (
    <View style={styles.card}>
      <Ionicons name={icon} size={24} color={iconColor} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
});
