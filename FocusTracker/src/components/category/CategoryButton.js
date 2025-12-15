import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export const CategoryButton = ({ 
  category, 
  isSelected, 
  onPress, 
  disabled = false 
}) => {
  // Kategorinin kendi rengini kullan, yoksa varsayılan
  const activeColor = category.color || '#4a90e2';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        // Seçili ise arka planı kategorinin kendi rengi yap
        isSelected && { backgroundColor: activeColor },
        disabled && styles.disabled
      ]}
      onPress={() => onPress(category)}
      disabled={disabled}
    >
      <Text style={[
        styles.text,
        isSelected && styles.textActive,
        // Seçili DEĞİLSE metni kategorinin renginde yap
        !isSelected && { color: activeColor }
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
    backgroundColor: '#f5f5f5', // Pasif arka plan rengi
    borderRadius: 20,
    marginRight: 8,
    height: 38,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  text: {
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