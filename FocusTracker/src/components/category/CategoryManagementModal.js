import React, { useState, useEffect } from 'react';
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
import { IconButton } from '../common/IconButton';
import { ColorPicker } from '../common/ColorPicker'; // ✨ Yeni import
import { useTheme } from '../../context/ThemeContext';

export const CategoryManagementModal = ({
  visible,
  categories,
  onClose,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const { themeColors } = useTheme();
  const [inputValue, setInputValue] = useState('');
  const [selectedColor, setSelectedColor] = useState('#95a5a6'); // Varsayılan renk
  const [editingId, setEditingId] = useState(null);

  const isAddOnly = !onUpdate && !onDelete;

  useEffect(() => {
    if (!visible) {
      setInputValue('');
      setEditingId(null);
      setSelectedColor('#95a5a6'); // Sıfırla
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (inputValue.trim()) {
      let success = false;
      
      if (editingId) {
        if (onUpdate) {
          // ✨ Rengi de gönderiyoruz
          success = await onUpdate(editingId, inputValue.trim(), selectedColor);
        }
      } else {
        if (onAdd) {
          // ✨ Rengi de gönderiyoruz
          success = await onAdd(inputValue.trim(), selectedColor);
        }
      }

      if (success) {
        setInputValue('');
        setEditingId(null);
        setSelectedColor('#95a5a6');
      }
    }
  };

  const startEditing = (category) => {
    setInputValue(category.name);
    setEditingId(category.id);
    setSelectedColor(category.color || '#95a5a6'); // Mevcut rengi yükle
  };

  const cancelEditing = () => {
    setInputValue('');
    setEditingId(null);
    setSelectedColor('#95a5a6');
  };

  const renderCategoryItem = ({ item }) => (
    <View style={[styles.listItem, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
      <View style={styles.listItemLeft}>
        {/* ✨ İkon rengi artık kategorinin rengi */}
        <Ionicons name="pricetag" size={18} color={item.color || themeColors.primary} />
        <Text style={[styles.listItemText, { color: themeColors.text }]}>{item.name}</Text>
      </View>
      
      {!isAddOnly && (
        <View style={styles.actions}>
          {onUpdate && (
            <IconButton
              icon="pencil"
              size={20}
              color={themeColors.textLight}
              onPress={() => startEditing(item)}
            />
          )}
          {onDelete && (
            <IconButton
              icon="trash-outline"
              size={20}
              color={themeColors.error}
              onPress={() => onDelete(item.id, item.name)}
            />
          )}
        </View>
      )}
    </View>
  );

  const getTitle = () => {
    if (editingId) return '✏️ Kategoriyi Düzenle';
    if (isAddOnly) return '➕ Yeni Kategori Ekle';
    return '📝 Kategori Yönetimi';
  };

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
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
          <View style={[styles.content, { backgroundColor: themeColors.background }]} onStartShouldSetResponder={() => true}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: themeColors.text }]}>
                {getTitle()}
              </Text>
              <IconButton icon="close-circle" size={28} color={themeColors.textLight} onPress={onClose} />
            </View>

            <View style={styles.formContainer}>
                {/* ✨ Renk Seçici Eklendi */}
                <Text style={[styles.label, { color: themeColors.textLight }]}>Renk Seç:</Text>
                <ColorPicker 
                    selectedColor={selectedColor} 
                    onSelectColor={setSelectedColor} 
                />

                <View style={styles.inputContainer}>
                <TextInput
                    style={[
                    styles.input, 
                    { 
                        backgroundColor: themeColors.card, 
                        color: themeColors.text,
                        borderColor: editingId ? selectedColor : themeColors.border 
                    }
                    ]}
                    placeholder={editingId ? "Kategori adı..." : "Yeni kategori adı..."}
                    placeholderTextColor={themeColors.textLight}
                    value={inputValue}
                    onChangeText={setInputValue}
                    maxLength={30}
                    onSubmitEditing={handleSubmit}
                />
                
                {editingId ? (
                    <View style={styles.editActions}>
                    <IconButton icon="close" size={24} color={themeColors.error} onPress={cancelEditing} />
                    <IconButton icon="checkmark" size={24} color={themeColors.success} onPress={handleSubmit} />
                    </View>
                ) : (
                    <IconButton icon="add-circle" size={44} color={selectedColor || themeColors.success} onPress={handleSubmit} style={styles.addButton} />
                )}
                </View>
            </View>

            <FlatList
              data={categories}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderCategoryItem}
              contentContainerStyle={styles.listContent}
            />
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-end' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  content: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%', elevation: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold' },
  formContainer: { marginBottom: 10 },
  label: { fontSize: 12, marginBottom: 8, marginLeft: 4, fontWeight: '600' },
  inputContainer: { flexDirection: 'row', marginBottom: 20, gap: 10, alignItems: 'center' },
  input: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1.5, fontSize: 16 },
  addButton: { margin: 0, padding: 0 },
  editActions: { flexDirection: 'row', gap: 5 },
  listContent: { paddingBottom: 20 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, marginBottom: 8, borderRadius: 12, borderWidth: 1 },
  listItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  listItemText: { fontSize: 16, fontWeight: '500' },
  actions: { flexDirection: 'row' },
});