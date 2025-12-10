// ==========================================
// components/distraction/DistractionBadge.js
// ==========================================
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const DistractionBadge = ({ count }) => {
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={20} color="#e74c3c" />
      <Text style={styles.text}>
        Dikkat Dağınıklığı: {count}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 12,
    backgroundColor: '#fff5f5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffcccc',
    minWidth: 200,
    justifyContent: 'center',
  },
  text: {
    marginLeft: 8,
    color: '#c0392b',
    fontWeight: '600',
    fontSize: 14,
  },
});
