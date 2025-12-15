🎯 FocusTracker - Odaklanma ve Verimlilik AsistanıBSM 447 - Mobil Uygulama Geliştirme Dersi Dönem ProjesiDijital dikkat dağınıklığıyla mücadele etmek ve kişisel verimliliği artırmak için tasarlanmış kapsamlı bir mobil uygulama.📖 Proje HakkındaFocusTracker, Pomodoro tekniğini temel alarak kullanıcıların odaklanma sürelerini yönetmelerine, kategorize etmelerine ve detaylı grafiklerle analiz etmelerine olanak tanıyan bir React Native uygulamasıdır.Uygulamanın en belirgin özelliği **"Dikkat Dağınıklığı Takibi"**dir. Kullanıcı odaklanma seansı başlattığında, uygulama arka plana atılırsa (başka bir uygulamaya geçiş yapılırsa veya ana ekrana dönülürse), sayaç otomatik olarak durur ve bu durum bir "dağılma" olarak kaydedilir.✨ Temel Özellikler⏱️ Akıllı Zamanlayıcı: Çevresel ilerleme çubuğu (Circular/Box Progress) ile görselleştirilmiş, özelleştirilebilir odaklanma sayacı.🚫 Dikkat Dağınıklığı Algılama: AppState API kullanılarak kullanıcının uygulamadan çıkışları tespit edilir ve kaydedilir.📂 Kategori Yönetimi:Özel kategoriler oluşturma, düzenleme ve silme.Her kategoriye özel renk atama.Kategori bazlı istatistik takibi.📊 Detaylı Raporlar:Günlük, haftalık ve tüm zamanlar istatistikleri.Kategori dağılımını gösteren Pasta Grafikler.Haftalık performansı gösteren Çubuk Grafikler.🎨 Kişiselleştirme:Karanlık (Dark) ve Aydınlık (Light) mod desteği.Ayarlanabilir çalışma süreleri.🔒 Veri Bütünlüğü:Aktif seans sırasında kritik ayarların kilitlenmesi (Session Locking).SQLite ile tamamen yerel ve kalıcı veri saklama.📱 Ekran GörüntüleriAna Sayfa (Odaklan)Raporlar (İstatistik)Ayarlar & Kategori🛠️ Teknoloji YığınıBu proje aşağıdaki teknolojiler kullanılarak geliştirilmiştir:Framework: React Native (Expo SDK 52)Dil: JavaScript (ES6+)Veritabanı: expo-sqlite (Yerel Veritabanı)Navigasyon: react-native-navigation (Bottom Tabs)Grafikler: react-native-chart-kitDepolama: AsyncStorage (Ayarlar için)Vektör İkonlar: @expo/vector-icons📂 Proje Mimarisi ve Dosya YapısıProje, Feature-Based ve Clean Architecture prensiplerine uygun olarak modüler bir yapıda geliştirilmiştir.src/
├── components/          # Yeniden kullanılabilir UI bileşenleri
│   ├── category/        # Kategori seçimi ve yönetimi ile ilgili bileşenler
│   │   ├── CategoryButton.js
│   │   ├── CategoryManagementModal.js
│   │   └── CategorySelector.js
│   ├── common/          # Genel amaçlı butonlar, inputlar, renk seçiciler
│   ├── distraction/     # Dikkat dağılma uyarıları ve modalları
│   ├── reports/         # Grafik ve istatistik kartları
│   └── timer/           # Zamanlayıcı, progress bar ve kontrol butonları
│
├── context/             # Global state yönetimi (Context API)
│   ├── SessionContext.js # Aktif seans kilit durumu kontrolü
│   └── ThemeContext.js   # Tema (Dark/Light) yönetimi
│
├── hooks/               # Logic ve View ayrımı için Custom Hooks
│   ├── useAppState.js    # Uygulama arka plan/ön plan takibi
│   ├── useCategories.js  # Kategori CRUD işlemleri
│   ├── useSessionStats.js# Raporlama verilerinin hesaplanması
│   └── useTimer.js       # Zamanlayıcı mantığı
│
├── navigation/          # Sayfa yönlendirmeleri (Tab Navigator)
│   └── AppNavigator.js
│
├── screens/             # Ana uygulama ekranları
│   ├── HomeScreen.js     # Odaklanma/Sayaç ekranı
│   ├── ReportsScreen.js  # İstatistikler ekranı
│   └── SettingsScreen.js # Ayarlar ve yönetim ekranı
│
├── services/            # İş mantığı ve Veritabanı köprüsü
│   ├── CategoryService.js
│   ├── SessionService.js
│   ├── TimerService.js
│   └── NotificationService.js
│
├── styles/              # Global stiller, renk paletleri ve tipografi
│   ├── colors.js
│   ├── commonStyles.js
│   ├── spacing.js
│   └── typography.js
│
└── utils/               # Yardımcı fonksiyonlar ve sabitler
    ├── constants.js      # Sabit değerler (Süreler, mesajlar)
    ├── db.js             # SQLite veritabanı kurulum ve sorguları
    ├── timeFormatter.js  # Süre formatlama (mm:ss)
    └── validators.js     # Girdi doğrulama
Klasörlerin Görevlericomponents/: Sadece arayüz (UI) çizen, iş mantığından (business logic) mümkün olduğunca arındırılmış "akılsız" bileşenlerdir.screens/: Bileşenleri bir araya getiren, hook'ları kullanan ve kullanıcı ile etkileşime geçen ana sayfalardır.services/: Veritabanı (db.js) ile iletişim kuran, ham veriyi işleyen katmandır. UI'dan tamamen bağımsızdır.hooks/: Servisleri kullanarak veriyi çeken, state'i yöneten ve UI'a hazır veri sunan katmandır.context/: Uygulamanın genelini ilgilendiren (Tema rengi, Seans kilit durumu) verilerin tutulduğu yerdir.utils/: Veritabanı bağlantısı (db.js) ve yardımcı araçların bulunduğu yerdir.💾 Veritabanı ŞemasıUygulama yerel SQLite veritabanı kullanır ve iki ana tablodan oluşur:categories Tablosu:id: INTEGER (PK)name: TEXT (Benzersiz)color: TEXT (Hex kodu)sessions Tablosu:id: INTEGER (PK)category: TEXT (Kategori Adı)date: TEXT (ISO Date String)duration: INTEGER (Saniye cinsinden)distractions: INTEGER (Dağılma sayısı)Not: Kategori silinse bile, veri bütünlüğünü korumak adına sessions tablosundaki geçmiş kayıtlar silinmez, rengi griye döner.🚀 Kurulum ve ÇalıştırmaProjeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin:Depoyu Klonlayın:git clone [https://github.com/KULLANICI_ADINIZ/focus-tracker.git](https://github.com/KULLANICI_ADINIZ/focus-tracker.git)
cd focus-tracker
Bağımlılıkları Yükleyin:npm install
# veya
yarn install
Uygulamayı Başlatın:npx expo start -c
Test Edin:Expo Go uygulamasını telefonunuza indirin.Terminalde çıkan QR kodu taratın.🤝 Katkıda BulunmaBu bir dönem projesi olduğu için şu an dışarıdan katkıya kapalıdır. Ancak fork alıp geliştirebilirsiniz.📄 LisansBu proje MIT lisansı ile lisanslanmıştır.

graph TD
    Start((Başlangıç)) --> Init[Veritabanı Başlatma<br/>(initDB)]
    Init --> ThemeCheck[Tema Tercihlerini Yükle<br/>(AsyncStorage)]
    ThemeCheck --> Navigator{Tab Navigator}

    %% --- 1. ANA SAYFA AKIŞI ---
    Navigator -->|Odaklan Tab| Home[Ana Sayfa<br/>(HomeScreen)]
    Home --> UserAction{Kullanıcı Eylemi}
    
    UserAction -->|Süreye Tıkla| TimeModal[Süre Ayarlama Modalı]
    TimeModal --> UpdateTime[Süreyi Güncelle]
    UpdateTime --> Home

    UserAction -->|Kategori Seç| CatSelect[Kategori Seçimi]
    CatSelect --> Home

    UserAction -->|Kategori Ekle (+)| CatAdd[Kategori Ekleme Modalı]
    CatAdd --> SaveCat[Yeni Kategoriyi Kaydet]
    SaveCat --> Home

    UserAction -->|Başlat Butonu| TimerStart[Sayaç Başlatılır<br/>(useTimer)]
    
    TimerStart --> AppStateCheck{Uygulama Durumu<br/>(useAppState)}
    
    AppStateCheck -->|Arka Plana Geçti| Distraction[Dikkat Dağılma Algılandı]
    Distraction --> PauseTimer[Sayacı Duraklat]
    Distraction --> IncDistraction[Dağılma Sayacını Artır]
    IncDistraction --> ResumeModal[Devam Etme Modalı]
    ResumeModal -->|Devam Et| TimerStart
    ResumeModal -->|Duraklat| PauseState[Duraklatıldı]

    AppStateCheck -->|Aktif| Counting[Geri Sayım Devam Ediyor]
    
    Counting --> TimeCheck{Süre = 0?}
    TimeCheck -->|Hayır| Counting
    TimeCheck -->|Evet| Finish[Seans Tamamlandı]
    
    Finish --> DBSave[(Veritabanına Kaydet<br/>sessions tablosu)]
    DBSave --> PomoInc[Pomodoro Sayacını Artır]
    PomoInc --> BreakCheck{Döngü Tamamlandı mı?<br/>(4 Pomodoro)}
    BreakCheck -->|Evet| LongBreak[Uzun Mola Öner]
    BreakCheck -->|Hayır| ShortBreak[Kısa Mola Öner]
    
    LongBreak --> BreakMode[Mola Moduna Geç]
    ShortBreak --> BreakMode
    BreakMode --> SkipBreak{Molayı Atla?}
    SkipBreak -->|Evet| Home
    SkipBreak -->|Hayır| TimerStart

    %% --- 2. RAPORLAR AKIŞI ---
    Navigator -->|Raporlar Tab| Reports[Raporlar Sayfası<br/>(ReportsScreen)]
    Reports --> DBFetch[(Verileri Çek<br/>useSessionStats)]
    
    DBFetch --> ProcessData[İstatistikleri Hesapla]
    ProcessData --> CalcCharts[Grafik Verilerini Hazırla]
    
    CalcCharts --> RenderUI[Görselleştirme]
    RenderUI --> PieChart[Pasta Grafik<br/>(Kategori Dağılımı)]
    RenderUI --> BarChart[Çubuk Grafik<br/>(Haftalık Aktivite)]
    RenderUI --> StatCards[İstatistik Kartları]

    %% --- 3. AYARLAR AKIŞI ---
    Navigator -->|Ayarlar Tab| Settings[Ayarlar Sayfası<br/>(SettingsScreen)]
    
    Settings --> ThemeAction{Görünüm Ayarı}
    ThemeAction -->|Değiştir| ToggleTheme[Tema Değiştir<br/>(Dark/Light)]
    ToggleTheme --> SavePref[Tercihi Kaydet]

    Settings --> ManageAction{Yönetim İşlemleri}
    ManageAction --> CheckSession{Aktif Seans Var mı?<br/>(SessionContext)}
    
    CheckSession -->|Evet (Kilitli)| BlockAction[İşlemi Engelle & Uyarı Ver]
    
    CheckSession -->|Hayır (Müsait)| AllowAction[İşleme İzin Ver]
    
    AllowAction --> CRUDCat[Kategori Yönetimi]
    CRUDCat -->|Ekle/Düzenle/Sil| DBUpdate[(Veritabanı Güncelle)]
    
    AllowAction --> ClearData[Verileri Temizle]
    ClearData --> DBWipe[(Tüm Tabloları Sil & Sıfırla)]