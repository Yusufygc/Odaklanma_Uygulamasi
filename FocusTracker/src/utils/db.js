import * as SQLite from 'expo-sqlite';

let dbInstance = null;

const getDB = async () => {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('focustracker.db');
  }
  return dbInstance;
};

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
    
    // Kategoriler tablosu (Önceki kodunla aynı)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE
      );
    `);
    
    // Varsayılan kategoriler (Önceki kodunla aynı)
    const result = await db.getAllAsync('SELECT * FROM categories');
    if (result.length === 0) {
      await db.execAsync(`
        INSERT INTO categories (name) VALUES 
        ('Ders Çalışma'), ('Kodlama'), ('Kitap Okuma'), ('Spor');
      `);
    }
    console.log('Veritabanı optimize edilmiş yapıyla hazır.');
  } catch (error) {
    console.log('Tablo hatası:', error);
  }
};

// --- KATEGORİ İŞLEMLERİ (Aynı Kalıyor) ---
export const getCategories = async () => {
  const db = await getDB();
  return await db.getAllAsync('SELECT * FROM categories ORDER BY id DESC');
};

export const addCategory = async (name) => {
  try {
    const db = await getDB();
    await db.runAsync('INSERT INTO categories (name) VALUES (?)', name);
    return true;
  } catch (error) { return false; }
};

export const deleteCategory = async (id) => {
  try {
    const db = await getDB();
    await db.runAsync('DELETE FROM categories WHERE id = ?', id);
    return true;
  } catch (error) { return false; }
};

// --- SEANS İŞLEMLERİ (Optimize Edildi) ---

// addSession fonksiyonunu bul ve bununla değiştir:
export const addSession = async (category, duration, distractions) => {
  try {
    const db = await getDB();
    const date = new Date().toISOString();
    
    // İşlem öncesi log
    console.log("💾 Veritabanına kayıt deneniyor:", { category, duration, date });

    const result = await db.runAsync(
      'INSERT INTO sessions (category, date, duration, distractions) VALUES (?, ?, ?, ?)',
      category, date, duration, distractions
    );
    
    // Başarı logu
    console.log("✅ Kayıt BAŞARILI. Yeni ID:", result.lastInsertRowId);
    return true; // Başarılı olduğunu dön
  } catch (error) {
    console.error('❌ Veri ekleme hatası:', error);
    return false; // Hata olduğunu dön
  }
};

// 🌟 YENİ: Tek seferde Tüm İstatistikleri Hesaplayan Fonksiyonlar

// 1. Genel Toplamlar (Tüm Zamanlar)
export const fetchTotalStats = async () => {
  const db = await getDB();
  // SQL SUM ve COUNT ile veritabanına hesaplatıyoruz
  const result = await db.getFirstAsync(`
    SELECT 
      COALESCE(SUM(duration), 0) as totalDuration,
      COALESCE(SUM(distractions), 0) as totalDistractions,
      COUNT(*) as totalSessions
    FROM sessions
  `);
  return result;
};

// 2. Bugünkü İstatistikler
export const fetchTodayStats = async () => {
  const db = await getDB();
  // Bugünün başlangıç tarihini ISO string olarak al (YYYY-MM-DD...)
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const dateString = startOfDay.toISOString();

  const result = await db.getFirstAsync(`
    SELECT COALESCE(SUM(duration), 0) as todayDuration
    FROM sessions 
    WHERE date >= ?
  `, [dateString]);
  
  return result?.todayDuration || 0;
};

// 3. Kategori Dağılımı (Pasta Grafik İçin)
export const fetchCategoryStats = async () => {
  const db = await getDB();
  // Kategorilere göre grupla ve süreye göre sırala
  return await db.getAllAsync(`
    SELECT category as name, SUM(duration) as totalDuration
    FROM sessions
    GROUP BY category
    ORDER BY totalDuration DESC
  `);
};

// 4. Son 7 Gün (Çubuk Grafik İçin)
export const fetchLast7DaysStats = async () => {
  const db = await getDB();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const dateString = sevenDaysAgo.toISOString();

  // Sadece son 7 günün verisini çekiyoruz (Binlerce kayıt yerine max 50-100 kayıt gelir)
  return await db.getAllAsync(`
    SELECT date, duration 
    FROM sessions 
    WHERE date >= ?
  `, [dateString]);
};