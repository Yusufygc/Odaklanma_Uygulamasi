import { getCategories, addCategory, deleteCategory, updateCategoryInDB } from '../utils/db';

export const CategoryService = {
  async fetchAll() {
    try {
      return await getCategories();
    } catch (error) {
      console.error('Fetch categories error:', error);
      return [];
    }
  },

  // ✨ GÜNCELLENDİ: Renk parametresi eklendi
  async create(name, color) {
    if (!name || name.trim().length === 0 || name.trim().length > 30) {
      throw new Error('Geçersiz kategori adı');
    }
    try {
      const success = await addCategory(name.trim(), color);
      if (!success) throw new Error('Bu kategori zaten var');
      return true;
    } catch (error) {
      throw error;
    }
  },

  // ✨ GÜNCELLENDİ: Renk parametresi eklendi
  async update(id, name, color) {
    if (!name || name.trim().length === 0 || name.trim().length > 30) {
      throw new Error('Geçersiz kategori adı');
    }
    try {
      const success = await updateCategoryInDB(id, name.trim(), color);
      if (!success) throw new Error('Güncelleme başarısız');
      return true;
    } catch (error) {
      throw error;
    }
  },

  async remove(id) {
    try {
      const success = await deleteCategory(id);
      if (!success) throw new Error('Veritabanından silinemedi');
      return true;
    } catch (error) {
      throw error;
    }
  },

  canDelete(categories) {
    return categories.length > 1;
  },
};