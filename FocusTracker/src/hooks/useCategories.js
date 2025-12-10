// ==========================================
// hooks/useCategories.js
// ==========================================
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

  const removeCategory = useCallback(async (id, name) => {
    if (!CategoryService.canDelete(categories)) {
      NotificationService.showError('En az bir kategori olmalı!');
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
    removeCategory,
  };
};
