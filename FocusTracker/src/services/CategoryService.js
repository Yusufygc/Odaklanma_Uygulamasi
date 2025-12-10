// ==========================================
// services/CategoryService.js
// ==========================================
import { getCategories, addCategory, deleteCategory } from '../utils/db';

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
      throw new Error('Invalid category name');
    }

    try {
      const success = await addCategory(name.trim());
      if (!success) {
        throw new Error('Category already exists');
      }
      return true;
    } catch (error) {
      console.error('Add category error:', error);
      throw error;
    }
  },

  async remove(id) {
    try {
      await deleteCategory(id);
      return true;
    } catch (error) {
      console.error('Delete category error:', error);
      throw error;
    }
  },

  canDelete(categories) {
    return categories.length > 1;
  },
};