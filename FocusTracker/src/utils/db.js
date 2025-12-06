import * as SQLite from 'expo-sqlite';

let dbInstance = null;

const getDB = async () => {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('focustracker.db');
  }
  return dbInstance;
};

// 1. Tabloları Oluştur ve Varsayılan Verileri Ekle
export const initDB = async () => {
  try {
    const db = await getDB();
    
    // Oturumlar Tablosu
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT,
        date TEXT,
        duration INTEGER,
        distractions INTEGER
      );
    `);

    // Kategoriler Tablosu (YENİ)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE
      );
    `);

    // Varsayılan Kategorileri Kontrol Et ve Ekle
    const result = await db.getAllAsync('SELECT * FROM categories');
    if (result.length === 0) {
      await db.execAsync(`
        INSERT INTO categories (name) VALUES 
        ('Ders Çalışma'), 
        ('Kodlama'), 
        ('Kitap Okuma'), 
        ('Spor');
      `);
    }

    console.log('Veritabanı ve tablolar hazır.');
  } catch (error) {
    console.log('Tablo hatası:', error);
  }
};

// --- KATEGORİ İŞLEMLERİ (CRUD) ---

// Kategorileri Getir
export const getCategories = async () => {
  try {
    const db = await getDB();
    return await db.getAllAsync('SELECT * FROM categories ORDER BY id DESC');
  } catch (error) {
    console.log('Kategori çekme hatası:', error);
    return [];
  }
};

// Kategori Ekle
export const addCategory = async (name) => {
  try {
    const db = await getDB();
    await db.runAsync('INSERT INTO categories (name) VALUES (?)', name);
    return true;
  } catch (error) {
    console.log('Kategori ekleme hatası:', error);
    return false;
  }
};

// Kategori Sil
export const deleteCategory = async (id) => {
  try {
    const db = await getDB();
    await db.runAsync('DELETE FROM categories WHERE id = ?', id);
    return true;
  } catch (error) {
    console.log('Kategori silme hatası:', error);
    return false;
  }
};

// --- SEANS İŞLEMLERİ ---

export const addSession = async (category, duration, distractions) => {
  try {
    const db = await getDB();
    const date = new Date().toISOString();
    const result = await db.runAsync(
      'INSERT INTO sessions (category, date, duration, distractions) VALUES (?, ?, ?, ?)',
      category, date, duration, distractions
    );
    console.log("Kayıt başarılı, ID:", result.lastInsertRowId);
  } catch (error) {
    console.log('Veri ekleme hatası:', error);
  }
};

export const fetchSessions = async () => {
  try {
    const db = await getDB();
    return await db.getAllAsync('SELECT * FROM sessions ORDER BY id DESC');
  } catch (error) {
    return [];
  }
};