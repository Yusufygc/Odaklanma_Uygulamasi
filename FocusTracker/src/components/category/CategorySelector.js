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
        contentContainerStyle={styles.scrollContent}
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
      
      {/* ✨ İKON DEĞİŞTİ: Ayarlar yerine Ekle (+) */}
      <View style={styles.separator} />
      <IconButton
        icon="add" 
        size={24}
        color={disabled ? '#ccc' : '#4a90e2'}
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
    height: 56, // Biraz yükselttik
    backgroundColor: '#fff',
    borderRadius: 16, // Daha yuvarlak hatlar
    padding: 6,
    elevation: 4, // Gölge efekti
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    width: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  separator: {
    width: 1,
    height: '60%',
    backgroundColor: '#eee',
    marginHorizontal: 4,
  },
  manageButton: {
    padding: 8,
    borderRadius: 12,
    marginLeft: 2,
  },
});