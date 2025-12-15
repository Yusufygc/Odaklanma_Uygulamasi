import * as SQLite from 'expo-sqlite';

let dbInstance = null;

const getDB = async () => {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('focustracker.db');
  }
  return dbInstance;
};

// Renk paleti (Varsayılan atamalar için)
const DEFAULT_COLORS = {
  'Ders Çalışma': '#e74c3c', // Kırmızı
  'Kodlama': '#3498db',      // Mavi
  'Kitap Okuma': '#2ecc71',  // Yeşil
  'Spor': '#f39c12',         // Turuncu
  'default': '#95a5a6'       // Gri
};

export const initDB = async () => {
  try {
    const db = await getDB();
    
    // Sessions tablosu (Değişiklik yok)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT,
        date TEXT,
        duration INTEGER,
        distractions INTEGER
      );
    `);
    
    // Categories tablosu (Önceki hali)
    // NOT: SQLite 'ALTER TABLE ADD COLUMN' destekler ama 'IF NOT EXISTS' desteklemez.
    // Bu yüzden önce tabloyu oluşturuyoruz, sonra sütun kontrolü yapıyoruz.
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE
        -- color TEXT sütunu sonradan eklenecek
      );
    `);

    // 🛠️ MIGRATION: 'color' sütunu var mı kontrol et, yoksa ekle
    try {
      // Bir select sorgusu ile sütunun varlığını test ediyoruz
      await db.getFirstAsync('SELECT color FROM categories LIMIT 1');
    } catch (e) {
      console.log("🎨 'color' sütunu bulunamadı, ekleniyor...");
      await db.execAsync('ALTER TABLE categories ADD COLUMN color TEXT DEFAULT "#95a5a6"');
    }
    
    // Varsayılan kategoriler (Eğer hiç kategori yoksa)
    const result = await db.getAllAsync('SELECT * FROM categories');
    if (result.length === 0) {
      await db.execAsync(`
        INSERT INTO categories (name, color) VALUES 
        ('Ders Çalışma', '${DEFAULT_COLORS['Ders Çalışma']}'), 
        ('Kodlama', '${DEFAULT_COLORS['Kodlama']}'), 
        ('Kitap Okuma', '${DEFAULT_COLORS['Kitap Okuma']}'), 
        ('Spor', '${DEFAULT_COLORS['Spor']}');
      `);
    } else {
        // Mevcut kategorilerde renk yoksa güncelle (Migration sonrası temizlik)
        // Bu kısım opsiyoneldir ama eski verilerin renklenmesini sağlar
        for (let cat of result) {
            if (!cat.color || cat.color === '#95a5a6') {
                const newColor = DEFAULT_COLORS[cat.name] || DEFAULT_COLORS.default;
                await db.runAsync('UPDATE categories SET color = ? WHERE id = ?', [newColor, cat.id]);
            }
        }
    }

    console.log('Veritabanı optimize edilmiş yapıyla hazır.');
  } catch (error) {
    console.log('Tablo hatası:', error);
  }
};

// --- TEMİZLEME İŞLEMİ (YENİ) ---
export const clearAllData = async () => {
  try {
    const db = await getDB();
    // 1. Seansları Sil
    await db.runAsync('DELETE FROM sessions');
    
    // 2. Kategorileri Sil
    await db.runAsync('DELETE FROM categories');
    
    // 3. Varsayılan Kategorileri Geri Yükle
    await db.execAsync(`
        INSERT INTO categories (name, color) VALUES 
        ('Ders Çalışma', '${DEFAULT_COLORS['Ders Çalışma']}'), 
        ('Kodlama', '${DEFAULT_COLORS['Kodlama']}'), 
        ('Kitap Okuma', '${DEFAULT_COLORS['Kitap Okuma']}'), 
        ('Spor', '${DEFAULT_COLORS['Spor']}');
      `);

    console.log('🗑️ Veritabanı başarıyla sıfırlandı.');
    return true;
  } catch (error) {
    console.error('❌ Sıfırlama hatası:', error);
    return false;
  }
};


// --- KATEGORİ İŞLEMLERİ ---

export const getCategories = async () => {
  const db = await getDB();
  return await db.getAllAsync('SELECT * FROM categories ORDER BY id DESC');
};

// ✨ YENİ: Renk parametresi eklendi
export const addCategory = async (name, color = '#95a5a6') => {
  try {
    const db = await getDB();
    await db.runAsync('INSERT INTO categories (name, color) VALUES (?, ?)', [name, color]);
    return true;
  } catch (error) { return false; }
};

// ✨ YENİ: Renk parametresi eklendi
export const updateCategoryInDB = async (id, newName, newColor) => {
  try {
    const db = await getDB();
    
    const oldCategory = await db.getFirstAsync('SELECT name FROM categories WHERE id = ?', [id]);
    if (!oldCategory) return false;
    const oldName = oldCategory.name;

    // Hem ismi hem rengi güncelle
    await db.runAsync(
        'UPDATE categories SET name = ?, color = ? WHERE id = ?', 
        [newName, newColor, id]
    );

    // Otomatik isim güncelleme (Geçmiş veriler için)
    await db.runAsync('UPDATE sessions SET category = ? WHERE category = ?', [newName, oldName]);

    console.log(`✅ Kategori güncellendi: "${oldName}" -> "${newName}" (${newColor})`);
    return true;
  } catch (error) {
    console.error("❌ Kategori güncelleme hatası:", error);
    return false; 
  }
};

export const deleteCategory = async (id) => {
  try {
    const db = await getDB();
    await db.runAsync('DELETE FROM categories WHERE id = ?', id);
    return true;
  } catch (error) { return false; }
};

// --- SEANS İŞLEMLERİ (Mevcut kodlarınız) ---
export const addSession = async (category, duration, distractions) => {
  try {
    const db = await getDB();
    const date = new Date().toISOString();
    
    console.log("💾 Veritabanına kayıt deneniyor:", { category, duration, date });

    const result = await db.runAsync(
      'INSERT INTO sessions (category, date, duration, distractions) VALUES (?, ?, ?, ?)',
      [category, date, duration, distractions]
    );
    //`expo-sqlite` kütüphanesinin yeni sürümlerinde (veya asenkron metodlarında) 
    // parametrelerin bir dizi (`[]`) içinde verilmesi zorunludur. 
    // Dizi dışında verildiğinde, Native modül parametreleri
    //  doğru ayrıştıramayıp `NullPointerException` fırlatabilir.
    console.log("✅ Kayıt BAŞARILI. Yeni ID:", result.lastInsertRowId);
    return true;
  } catch (error) {
    console.error('❌ Veri ekleme hatası:', error);
    return false;
  }
};

export const fetchTotalStats = async () => {
  const db = await getDB();
  return await db.getFirstAsync(`
    SELECT 
      COALESCE(SUM(duration), 0) as totalDuration,
      COALESCE(SUM(distractions), 0) as totalDistractions,
      COUNT(*) as totalSessions
    FROM sessions
  `);
};

export const fetchTodayStats = async () => {
  const db = await getDB();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const result = await db.getFirstAsync(`
    SELECT COALESCE(SUM(duration), 0) as todayDuration
    FROM sessions WHERE date >= ?
  `, [startOfDay.toISOString()]);
  return result?.todayDuration || 0;
};

// ✨ GÜNCELLENMİŞ FONKSİYON: Rengi de getiriyoruz (JOIN ile)
export const fetchCategoryStats = async () => {
  const db = await getDB();
  // Categories tablosuyla birleştirerek o kategorinin güncel rengini alıyoruz
  return await db.getAllAsync(`
    SELECT 
        s.category as name, 
        SUM(s.duration) as totalDuration,
        MAX(c.color) as color  -- Renk bilgisini al
    FROM sessions s
    LEFT JOIN categories c ON s.category = c.name
    GROUP BY s.category
    ORDER BY totalDuration DESC
  `);
};

export const fetchLast7DaysStats = async () => {
  const db = await getDB();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const dateString = sevenDaysAgo.toISOString();

  return await db.getAllAsync(`
    SELECT date, duration 
    FROM sessions 
    WHERE date >= ?
  `, [dateString]);
};