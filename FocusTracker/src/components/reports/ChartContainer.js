// ==========================================
// components/reports/ChartContainer.js
// ==========================================
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const ChartContainer = ({ title, icon, children }) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Ionicons name={icon} size={20} color="#333" />
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.container}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginLeft: 8,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    alignItems: 'center',
  },
});