// ==========================================
// components/category/CategoryManagementModal.js
// ==========================================
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../common/Button';
import { IconButton } from '../common/IconButton';

export const CategoryManagementModal = ({
  visible,
  categories,
  onClose,
  onAdd,
  onDelete,
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAdd = async () => {
    if (newCategoryName.trim()) {
      const success = await onAdd(newCategoryName.trim());
      if (success) {
        setNewCategoryName('');
      }
    }
  };

  const renderCategoryItem = ({ item }) => (
    <View style={styles.listItem}>
      <View style={styles.listItemLeft}>
        <Ionicons name="pricetag" size={18} color="#4a90e2" />
        <Text style={styles.listItemText}>{item.name}</Text>
      </View>
      <IconButton
        icon="trash-outline"
        size={22}
        color="#e74c3c"
        onPress={() => onDelete(item.id, item.name)}
      />
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <View
            style={styles.content}
            onStartShouldSetResponder={() => true}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>📝 Kategorileri Düzenle</Text>
              <IconButton
                icon="close-circle"
                size={28}
                color="#666"
                onPress={onClose}
              />
            </View>

            {/* Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Yeni kategori adı girin..."
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                maxLength={30}
                onSubmitEditing={handleAdd}
              />
              <IconButton
                icon="add-circle"
                size={28}
                color="#fff"
                onPress={handleAdd}
                style={styles.addButton}
              />
            </View>

            {/* List */}
            {categories.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="folder-open-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>Henüz kategori yok</Text>
              </View>
            ) : (
              <FlatList
                data={categories}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderCategoryItem}
                contentContainerStyle={styles.listContent}
              />
            )}
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '75%',
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    fontSize: 15,
  },
  addButton: {
    backgroundColor: '#2ecc71',
    width: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  listContent: {
    paddingBottom: 20,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#fafafa',
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  listItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
  },
});
