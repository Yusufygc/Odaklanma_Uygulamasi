import { useState, useCallback } from 'react';
import { CategoryService } from '../services/CategoryService';
import { NotificationService } from '../services/NotificationService';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await CategoryService.fetchAll();
      setCategories(data);
      return data;
    } catch (error) {
      NotificationService.showError('Kategoriler yüklenemedi');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const addNewCategory = useCallback(async (name) => {
    try {
      await CategoryService.create(name);
      await loadCategories();
      NotificationService.showSuccess('Kategori eklendi');
      return true;
    } catch (error) {
      NotificationService.showError(error.message || 'Kategori eklenemedi');
      return false;
    }
  }, [loadCategories]);

  // ✨ GÜNCELLENDİ: Artık eski ismi (oldName) de alıyor
  // Ancak db.js'deki updateCategoryInDB fonksiyonumuz şu an ID üzerinden eski ismi
  // kendisi bulduğu için (SELECT ile) buraya oldName parametresini eklemek ZORUNLU DEĞİL.
  // Yine de UI tarafında veya ileride lazım olabilir diye standart yapıyı koruyalım.
  // Şimdilik sadece ID ve yeni isim ile çalışması yeterli, çünkü DB katmanımız akıllı.
  
  const updateCategory = useCallback(async (id, name) => {
    try {
      // Servis katmanı üzerinden DB'ye gidiyor
      // DB katmanı ID'den eski ismi bulup sessions tablosunu güncelliyor
      await CategoryService.update(id, name);
      await loadCategories();
      NotificationService.showSuccess('Kategori güncellendi');
      return true;
    } catch (error) {
      NotificationService.showError(error.message || 'Güncelleme hatası');
      return false;
    }
  }, [loadCategories]);

  // 🛠️ DÜZELTME: Silme Fonksiyonu
  const removeCategory = useCallback(async (id, name) => {
    // 1. Kontrol: En az 1 kategori kalmalı
    if (categories.length <= 1) { // Eğer 1 veya daha az varsa silme
      NotificationService.showError('En az bir kategori kalmalı!');
      return false;
    }

    // 2. Onay Penceresi ve İşlem
    return new Promise((resolve) => {
      NotificationService.showConfirmation(
        'Kategori Sil',
        `"${name}" kategorisini silmek istediğine emin misin?`,
        async () => {
          try {
            console.log(`🗑️ Siliniyor: ID=${id}, Name=${name}`); // Log ekledik
            await CategoryService.remove(id);
            await loadCategories(); // Listeyi yenile
            resolve(true);
          } catch (error) {
            console.error("❌ Silme Hatası:", error);
            NotificationService.showError('Kategori silinemedi');
            resolve(false);
          }
        },
        () => resolve(false) // İptal edilirse
      );
    });
  }, [categories, loadCategories]);

  return {
    categories,
    loading,
    loadCategories,
    addNewCategory,
    updateCategory,
    removeCategory,
  };
};