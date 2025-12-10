// ==========================================
// components/category/CategoryButton.js
// ==========================================
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export const CategoryButton = ({ 
  category, 
  isSelected, 
  onPress, 
  disabled = false 
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isSelected && styles.buttonActive,
        disabled && styles.disabled
      ]}
      onPress={() => onPress(category)}
      disabled={disabled}
    >
      <Text style={[
        styles.text,
        isSelected && styles.textActive
      ]}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 8,
    height: 38,
    justifyContent: 'center',
  },
  buttonActive: {
    backgroundColor: '#4a90e2',
    elevation: 3,
    shadowColor: '#4a90e2',
    shadowOpacity: 0.3,
  },
  text: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
  textActive: {
    color: '#fff',
  },
  disabled: {
    opacity: 0.6,
  },
});
