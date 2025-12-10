// ==========================================
// components/category/CategorySelector.js
// ==========================================
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { CategoryButton } from './CategoryButton';
import { IconButton } from '../common/IconButton';

export const CategorySelector = ({ 
  categories, 
  selectedCategory, 
  onSelect, 
  onManage,
  disabled = false 
}) => {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {categories.map((category) => (
          <CategoryButton
            key={category.id}
            category={category}
            isSelected={selectedCategory === category.name}
            onPress={onSelect}
            disabled={disabled}
          />
        ))}
      </ScrollView>
      
      <IconButton
        icon="settings-sharp"
        size={20}
        color={disabled ? '#ccc' : '#666'}
        onPress={onManage}
        disabled={disabled}
        style={styles.manageButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  manageButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginLeft: 5,
  },
});
