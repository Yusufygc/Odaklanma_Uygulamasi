// ==========================================
// components/common/Button.js
// ==========================================
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  icon, 
  disabled = false,
  style,
  textStyle 
}) => {
  const buttonStyles = [
    styles.button,
    styles[variant],
    disabled && styles.disabled,
    style
  ];

  return (
    <TouchableOpacity 
      style={buttonStyles} 
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {icon && <Ionicons name={icon} size={20} color={styles[`${variant}Text`].color} />}
      <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  primary: {
    backgroundColor: '#4a90e2',
  },
  secondary: {
    backgroundColor: '#f0f0f0',
  },
  danger: {
    backgroundColor: '#e74c3c',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#fff',
  },
  secondaryText: {
    color: '#333',
  },
  dangerText: {
    color: '#fff',
  },
});