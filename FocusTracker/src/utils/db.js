import * as SQLite from 'expo-sqlite';

// Veritabanı bağlantısını sağlayan yardımcı fonksiyon
let dbInstance = null;

const getDB = async () => {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('focustracker.db');
  }
  return dbInstance;
};

// 1. Tabloyu Oluştur
export const initDB = async () => {
  try {
    const db = await getDB();
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT,
        date TEXT,
        duration INTEGER,
        distractions INTEGER
      );
    `);
    console.log('Tablo başarıyla oluşturuldu.');
  } catch (error) {
    console.log('Tablo oluşturma hatası:', error);
  }
};

// 2. Yeni Seans Ekle
export const addSession = async (category, duration, distractions) => {
  try {
    const db = await getDB();
    const date = new Date().toISOString();
    
    // runAsync: Veri ekleme/silme işlemleri için kullanılır
    const result = await db.runAsync(
      'INSERT INTO sessions (category, date, duration, distractions) VALUES (?, ?, ?, ?)',
      category, date, duration, distractions
    );
    
    console.log("Kayıt başarılı, Son ID:", result.lastInsertRowId);
    return result.lastInsertRowId;
  } catch (error) {
    console.log('Veri ekleme hatası:', error);
  }
};

// 3. Tüm Verileri Çek
export const fetchSessions = async () => {
  try {
    const db = await getDB();
    // getAllAsync: Tüm satırları dizi olarak çeker
    const allRows = await db.getAllAsync('SELECT * FROM sessions ORDER BY id DESC');
    return allRows;
  } catch (error) {
    console.log('Veri çekme hatası:', error);
    return [];
  }
};