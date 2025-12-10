// ==========================================
// src/constants/strings.js
// ==========================================
export const STRINGS = {
  common: {
    ok: 'Tamam',
    cancel: 'İptal',
    confirm: 'Onayla',
    error: 'Hata',
    success: 'Başarılı! ✅',
    warning: 'Uyarı',
    loading: 'Veriler yükleniyor...',
  },
  home: {
    status: {
      focusing: 'Odaklanılıyor... 🎯',
      break: 'Mola veriyor... ☕',
      ready: 'Hazır mısın? 💪',
    },
    alerts: {
      selectCategory: 'Lütfen önce bir kategori seç!',
      breakOver: '⏰ Mola Bitti!',
      readyForWork: 'Tekrar çalışmaya hazır mısın?',
      start: 'Başla!',
      aBitMore: 'Biraz Daha',
    },
    timer: {
      pomodoroCompleted: 'Pomodoro Tamamlandı 🍅',
    }
  },
  reports: {
    title: '📊 Raporlar',
    periods: {
      week: 'Bu Hafta',
      month: 'Bu Ay',
      all: 'Tümü',
    },
    stats: {
      today: 'Bugün',
      totalTime: 'Toplam Süre',
      completed: 'Tamamlanan',
      distractions: 'Dağılma',
    },
    insights: {
      avgSession: 'Ortalama seans süresi',
      mostProductive: 'En verimli kategori',
      notAvailable: 'Henüz yok',
    },
    charts: {
      categoryDist: 'Kategori Dağılımı',
      weeklyActivity: 'Son 7 Günlük Aktivite',
    },
    empty: {
      title: 'Henüz veri yok',
      message: 'İlk odaklanma seansını tamamlayarak raporlarını görmeye başla! 🚀',
    },
    motivation: {
      expert: 'Harika gidiyorsun! 🎉 Odaklanma konusunda gerçek bir profesyonelsin!',
      pro: 'Süper! ⭐ Düzenli çalışman meyvelerini veriyor!',
      starter: 'İyi başlangıç! 💪 Devam et, her gün biraz daha ilerle!',
    },
  },
  sessions: {
    work: {
      title: '🎯 Odaklan',
      subtitle: 'Bir kategori seç ve başla',
    },
    shortBreak: {
      title: '☕ Kısa Mola',
      subtitle: 'Dinlen ve enerji topla',
    },
    longBreak: {
      title: '🌟 Uzun Mola',
      subtitle: 'Dinlen ve enerji topla',
    },
  },
  modals: {
    resume: {
      title: 'Sayaç Duraklatıldı',
      message: 'Uygulamadan ayrıldığın için sayaç otomatik olarak duraklatıldı.',
      continue: 'Devam Et',
      stayPaused: 'Duraklatılmış Kalsın',
      note: '💡 Dikkat dağınıklığı sayacına eklendi',
    },
    category: {
      title: '📝 Kategorileri Düzenle',
      placeholder: 'Yeni kategori adı girin...',
      add: 'Ekle',
      empty: 'Henüz kategori yok',
      deleteTitle: 'Kategori Sil',
      deleteMessage: (name) => `"${name}" kategorisini silmek istediğine emin misin?`, // Fonksiyonel string örneği
      minCategoryError: 'En az bir kategori olmalı!',
    },
  },
  notifications: {
    success: 'Başarılı! ✅',
    distraction: 'Dikkat Dağınıklığı:',
    greatJob: '🎉 Harika İş!',
    congrats: '✅ Tebrikler!',
    longBreakMsg: (count) => `${count}. Pomodoro'yu tamamladın! Uzun bir mola zamanı.`,
    shortBreakMsg: 'Odaklanma seansını başarıyla tamamladın! Kısa bir mola ister misin?',
    buttons: {
      later: 'Daha Sonra',
      longBreak: 'Uzun Mola (15dk)',
      shortBreak: 'Kısa Mola (5dk)',
      continue: 'Devam Et',
    }
  },
};