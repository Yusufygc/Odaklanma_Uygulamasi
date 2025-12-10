// ==========================================
// components/common/Input.js
// ==========================================
import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const Input = ({
  value,
  onChangeText,
  placeholder,
  label,
  icon,
  error,
  maxLength,
  keyboardType = 'default',
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  onSubmitEditing,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
        {icon && (
          <Ionicons 
            name={icon} 
            size={20} 
            color="#666" 
            style={styles.icon} 
          />
        )}
        
        <TextInput
          style={[
            styles.input,
            icon && styles.inputWithIcon,
            multiline && styles.inputMultiline,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          maxLength={maxLength}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onSubmitEditing={onSubmitEditing}
          {...props}
        />
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color="#e74c3c" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {maxLength && value && (
        <Text style={styles.counter}>
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  inputWrapperError: {
    borderColor: '#e74c3c',
  },
  icon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 15,
    color: '#333',
  },
  inputWithIcon: {
    paddingLeft: 8,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#e74c3c',
  },
  counter: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
});