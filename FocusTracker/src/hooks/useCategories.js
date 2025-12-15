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
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ✨ GÜNCELLENDİ: color parametresi
  const addNewCategory = useCallback(async (name, color) => {
    try {
      await CategoryService.create(name, color);
      await loadCategories();
      NotificationService.showSuccess('Kategori eklendi');
      return true;
    } catch (error) {
      NotificationService.showError(error.message || 'Kategori eklenemedi');
      return false;
    }
  }, [loadCategories]);

  // ✨ GÜNCELLENDİ: color parametresi
  const updateCategory = useCallback(async (id, name, color) => {
    try {
      await CategoryService.update(id, name, color);
      await loadCategories();
      NotificationService.showSuccess('Kategori güncellendi');
      return true;
    } catch (error) {
      NotificationService.showError(error.message || 'Güncelleme hatası');
      return false;
    }
  }, [loadCategories]);

  const removeCategory = useCallback(async (id, name) => {
    if (categories.length <= 1) {
      NotificationService.showError('En az bir kategori kalmalı!');
      return false;
    }

    return new Promise((resolve) => {
      NotificationService.showConfirmation(
        'Kategori Sil',
        `"${name}" kategorisini silmek istediğine emin misin?`,
        async () => {
          try {
            await CategoryService.remove(id);
            await loadCategories();
            resolve(true);
          } catch (error) {
            console.error("❌ Silme Hatası:", error);
            NotificationService.showError('Kategori silinemedi');
            resolve(false);
          }
        },
        () => resolve(false)
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