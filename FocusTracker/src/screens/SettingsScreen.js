import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSession } from '../context/SessionContext'; // ✨ Yeni import
import { useCategories } from '../hooks/useCategories';
import { CategoryManagementModal } from '../components/category/CategoryManagementModal';
import { clearAllData } from '../utils/db'; 

export default function SettingsScreen() {
  const { isDarkMode, toggleTheme, themeColors } = useTheme();
  const { isSessionLocked } = useSession(); // ✨ Seans kilit durumunu al
  const { categories, loadCategories, addNewCategory, updateCategory, removeCategory } = useCategories();
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [])
  );

  // Seans aktifken işlem yapılmasını engelleyen yardımcı fonksiyon
  const checkSessionStatus = (callback) => {
    if (isSessionLocked) {
      Alert.alert(
        "İşlem Engellendi 🚫",
        "Aktif veya duraklatılmış bir odaklanma seansınız var. Ayarları değiştirmek için önce seansı bitirmeli veya sıfırlamalısınız."
      );
    } else {
      callback();
    }
  };

  const handleClearData = () => {
    checkSessionStatus(() => {
      Alert.alert(
        "Dikkat! ⚠️",
        "Tüm odaklanma geçmişiniz ve kategorileriniz silinip fabrika ayarlarına dönülecek. Bu işlem geri alınamaz. Emin misiniz?",
        [
          { text: "İptal", style: "cancel" },
          { 
            text: "Evet, Sil", 
            style: "destructive",
            onPress: async () => {
              const success = await clearAllData();
              if (success) {
                await loadCategories(); 
                Alert.alert("Başarılı", "Tüm veriler temizlendi. Tertemiz bir sayfa açtınız! ✨");
              } else {
                Alert.alert("Hata", "Veriler temizlenirken bir sorun oluştu.");
              }
            }
          }
        ]
      );
    });
  };

  const SettingsSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: themeColors.textLight }]}>{title}</Text>
      <View style={[styles.sectionContent, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
        {children}
      </View>
    </View>
  );

  const SettingsItem = ({ icon, label, value, onPress, isSwitch, switchValue, onSwitchChange, color, textColor }) => (
    <TouchableOpacity 
      style={[styles.item, { borderBottomColor: themeColors.border }]} 
      onPress={onPress}
      disabled={isSwitch}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: color || themeColors.primary }]}>
          <Ionicons name={icon} size={20} color="#fff" />
        </View>
        <Text style={[styles.itemText, { color: textColor || themeColors.text }]}>{label}</Text>
      </View>
      
      {isSwitch ? (
        <Switch
          trackColor={{ false: "#767577", true: themeColors.primary }}
          thumbColor={"#f4f3f4"}
          onValueChange={onSwitchChange}
          value={switchValue}
        />
      ) : (
        <View style={styles.itemRight}>
          {value && <Text style={[styles.itemValue, { color: themeColors.textLight }]}>{value}</Text>}
          <Ionicons name="chevron-forward" size={20} color={themeColors.textLight} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>Ayarlar</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SettingsSection title="Görünüm">
          <SettingsItem
            icon={isDarkMode ? "moon" : "sunny"}
            label="Karanlık Mod"
            isSwitch
            switchValue={isDarkMode}
            onSwitchChange={toggleTheme}
            color={isDarkMode ? "#9b59b6" : "#f39c12"}
          />
        </SettingsSection>

        <SettingsSection title="Yönetim">
          <SettingsItem
            icon="list"
            label="Kategorileri Düzenle"
            value={`${categories.length} Kategori`}
            // ✨ checkSessionStatus ile korumaya aldık
            onPress={() => checkSessionStatus(() => setShowCategoryModal(true))}
            color="#4a90e2"
          />
        </SettingsSection>

        <SettingsSection title="Veri Yönetimi">
          <SettingsItem
            icon="trash-bin"
            label="Verilerimi Temizle"
            onPress={handleClearData} // ✨ İçinde checkSessionStatus var
            color="#e74c3c"
            textColor="#e74c3c"
          />
        </SettingsSection>

        <SettingsSection title="Hakkında">
          <SettingsItem
            icon="information-circle"
            label="Versiyon"
            value="1.0.0"
            onPress={() => {}}
            color="#2ecc71"
          />
        </SettingsSection>

        <Text style={[styles.footerText, { color: themeColors.textLight }]}>Focus Tracker © 2025</Text>
      </ScrollView>

      <CategoryManagementModal
        visible={showCategoryModal}
        categories={categories}
        onClose={() => setShowCategoryModal(false)}
        onAdd={addNewCategory}
        onUpdate={updateCategory}
        onDelete={removeCategory}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 34, fontWeight: 'bold' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4, textTransform: 'uppercase' },
  sectionContent: { borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: 1 },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  itemText: { fontSize: 16, fontWeight: '500' },
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemValue: { fontSize: 14 },
  footerText: { textAlign: 'center', fontSize: 12, marginTop: 20 },
});