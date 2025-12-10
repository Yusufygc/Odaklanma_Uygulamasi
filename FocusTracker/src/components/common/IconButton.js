// ==========================================
// components/common/IconButton.js
// ==========================================
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const IconButton = ({ 
  icon, 
  size = 24, 
  color = '#333', 
  onPress, 
  disabled = false,
  style 
}) => {
  return (
    <TouchableOpacity 
      style={[styles.button, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.6}
    >
      <Ionicons name={icon} size={size} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 8,
  },
  disabled: {
    opacity: 0.5,
  },
});