// ==========================================
// components/reports/InsightCard.js
// ==========================================
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const InsightCard = ({ insights }) => {
  return (
    <View style={styles.container}>
      {insights.map((insight, index) => (
        <View key={index} style={styles.row}>
          <Ionicons name={insight.icon} size={20} color="#666" />
          <Text style={styles.text}>
            {insight.label}: <Text style={styles.value}>{insight.value}</Text>
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  text: {
    fontSize: 15,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
  value: {
    fontWeight: 'bold',
    color: '#333',
  },
});
