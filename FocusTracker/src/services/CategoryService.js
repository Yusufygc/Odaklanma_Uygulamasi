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

  async create(name) {
    if (!name || name.trim().length === 0 || name.trim().length > 30) {
      throw new Error('Geçersiz kategori adı');
    }
    try {
      const success = await addCategory(name.trim());
      if (!success) throw new Error('Bu kategori zaten var');
      return true;
    } catch (error) {
      throw error;
    }
  },

  // ✨ YENİ: Güncelleme Servisi
  async update(id, name) {
    if (!name || name.trim().length === 0 || name.trim().length > 30) {
      throw new Error('Geçersiz kategori adı');
    }
    try {
      // updateCategoryInDB fonksiyonu artık arka planda her şeyi hallediyor
      const success = await updateCategoryInDB(id, name.trim());
      if (!success) throw new Error('Güncelleme başarısız');
      return true;
    } catch (error) {
      throw error;
    }
  },

  async remove(id) {
    try {
      const success = await deleteCategory(id);
      if (!success) throw new Error('Veritabanından silinemedi'); // Hata fırlat
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Bu fonksiyonu Hook içinde kullanıyoruz artık, ama burada kalması zarar vermez
  canDelete(categories) {
    return categories.length > 1;
  },
};