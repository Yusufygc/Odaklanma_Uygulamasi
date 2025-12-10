# 📋 Proje Refactoring İmplementasyon Rehberi

## 🎯 Genel Bakış

Bu rehber, mevcut monolitik kodunuzu clean code ve OOP prensiplerine göre yeniden yapılandırmanız için adım adım kılavuzdur.

---

## 📁 1. Klasör Yapısını Oluşturma

### Adım 1.1: Ana Klasörleri Oluşturun

```bash
src/
├── components/
├── hooks/
├── services/
├── utils/
├── screens/
└── styles/
```

### Adım 1.2: Alt Klasörleri Oluşturun

```bash
# Components alt klasörleri
src/components/
├── timer/
├── category/
├── distraction/
├── reports/
└── common/
```

---

## 📝 2. İmplementasyon Sırası (Önerilen)

### Hafta 1: Temel Altyapı

#### ✅ Gün 1-2: Utils ve Constants

1. **constants.js** oluşturun
   - Timer süreleri
   - Session tipleri
   - Uygulama sabitleri

2. **timeFormatter.js** oluşturun
   - Zaman formatlama fonksiyonları

3. **validators.js** oluşturun
   - Input validasyonları

**Test:** Fonksiyonları console.log ile test edin

---

#### ✅ Gün 3-4: Services Layer

1. **TimerService.js** oluşturun
2. **CategoryService.js** oluşturun
3. **SessionService.js** oluşturun
4. **NotificationService.js** oluşturun

**Test:** Her service'in metodlarını izole test edin

---

#### ✅ Gün 5-7: Styles System

1. **colors.js** - Renk paleti
2. **spacing.js** - Boşluk değerleri
3. **typography.js** - Yazı stilleri
4. **commonStyles.js** - Ortak stiller

**Test:** Bir test component'te stilleri kullanın

---

### Hafta 2: Hooks ve Common Components

#### ✅ Gün 1-2: Custom Hooks

1. **useTimer.js**
   ```javascript
   // Test: Timer başlat/durdur/reset
   ```

2. **useAppState.js**
   ```javascript
   // Test: Arka plan/ön plan geçişleri
   ```

3. **useCategories.js**
   ```javascript
   // Test: CRUD operasyonları
   ```

4. **useSessionStats.js**
   ```javascript
   // Test: İstatistik hesaplamaları
   ```

---

#### ✅ Gün 3-5: Common Components

1. **Button.js**
2. **IconButton.js**
3. **Input.js**
4. **Modal.js** (opsiyonel)

**Test:** Storybook benzeri bir test sayfası oluşturun

---

### Hafta 3: Feature Components

#### ✅ Timer Components

1. TimerDisplay.js
2. ProgressBar.js
3. TimerControls.js
4. PomodoroCounter.js
5. Timer.js (container)

**Test:** Her component'i izole test edin

---

#### ✅ Category Components

1. CategoryButton.js
2. CategorySelector.js
3. CategoryManagementModal.js

**Test:** Kategori ekleme/silme senaryoları

---

#### ✅ Distraction Components

1. DistractionBadge.js
2. ResumeSessionModal.js

**Test:** Modal açma/kapama

---

#### ✅ Reports Components

1. StatCard.js
2. PeriodSelector.js
3. InsightCard.js
4. ChartContainer.js
5. EmptyState.js

**Test:** Farklı veri setleriyle

---

### Hafta 4: Screen Refactoring

#### ✅ HomeScreen Refactoring

1. Mevcut HomeScreen.js'i backup alın
2. Yeni HomeScreen.js'i component'lerle oluşturun
3. State management'i hook'lara taşıyın
4. Tüm UI'ı component'lere bölün

**Test:** Tüm fonksiyonaliteyi test edin

---

#### ✅ ReportsScreen Refactoring

1. Mevcut ReportsScreen.js'i backup alın
2. Yeni ReportsScreen.js'i oluşturun
3. İstatistik hesaplamalarını hook'a taşıyın
4. Grafikleri component'lere bölün

**Test:** Tüm raporları doğrulayın

---

## 🔍 3. Migration Checklist

### Pre-Migration

- [ ] Mevcut kodu Git'e commit edin
- [ ] Backup branch oluşturun
- [ ] Mevcut test case'leri kaydedin
- [ ] Kullanıcı akışlarını dokümante edin

### Migration

- [ ] Klasör yapısını oluşturun
- [ ] Utils dosyalarını oluşturun
- [ ] Service layer'ı oluşturun
- [ ] Custom hook'ları oluşturun
- [ ] Common component'leri oluşturun
- [ ] Feature component'leri oluşturun
- [ ] Screen'leri refactor edin

### Post-Migration

- [ ] Tüm fonksiyonaliteyi test edin
- [ ] Performance testi yapın
- [ ] Code review yapın
- [ ] Dokümantasyon güncelleyin

---

## 🧪 4. Test Stratejisi

### Unit Tests

```javascript
// Example: timeFormatter.test.js
describe('TimeFormatter', () => {
  test('formats seconds correctly', () => {
    expect(TimeFormatter.formatSeconds(125)).toBe('02:05');
  });
});
```

### Integration Tests

```javascript
// Example: useTimer.test.js
describe('useTimer', () => {
  test('timer counts down correctly', async () => {
    const { result } = renderHook(() => useTimer(60));
    act(() => result.current.start());
    // ... test logic
  });
});
```

### Component Tests

```javascript
// Example: Button.test.js
describe('Button', () => {
  test('renders correctly', () => {
    const { getByText } = render(
      <Button title="Test" onPress={() => {}} />
    );
    expect(getByText('Test')).toBeTruthy();
  });
});
```

---

## 📊 5. Progress Tracking

### Week 1 Progress
- [ ] Utils (25%)
- [ ] Services (25%)
- [ ] Styles (25%)
- [ ] Documentation (25%)

### Week 2 Progress
- [ ] Hooks (50%)
- [ ] Common Components (50%)

### Week 3 Progress
- [ ] Timer Components (25%)
- [ ] Category Components (25%)
- [ ] Distraction Components (25%)
- [ ] Reports Components (25%)

### Week 4 Progress
- [ ] HomeScreen (50%)
- [ ] ReportsScreen (50%)

---

## 🚨 6. Sık Karşılaşılan Sorunlar ve Çözümleri

### Sorun 1: Import Path'leri

```javascript
// ❌ Yanlış
import { Button } from './Button';

// ✅ Doğru
import { Button } from '../components/common/Button';
```

**Çözüm:** Relative path'leri dikkatli kullanın

---

### Sorun 2: Circular Dependencies

```javascript
// ❌ Yanlış
// A.js imports B.js
// B.js imports A.js

// ✅ Doğru
// Ortak kodu C.js'e taşıyın
// A.js ve B.js, C.js'i import etsin
```

---

### Sorun 3: Hook Rules

```javascript
// ❌ Yanlış
if (condition) {
  const timer = useTimer();
}

// ✅ Doğru
const timer = useTimer();
if (condition) {
  // Use timer
}
```

---

### Sorun 4: State Lifting

```javascript
// ❌ Yanlış: State child component'te
function Parent() {
  return <Child />;
}

function Child() {
  const [value, setValue] = useState('');
  // Parent bu değere erişemiyor
}

// ✅ Doğru: State parent'ta
function Parent() {
  const [value, setValue] = useState('');
  return <Child value={value} onChange={setValue} />;
}
```

---

## 💡 7. Best Practices

### Naming Conventions

```javascript
// Components: PascalCase
TimerDisplay.js

// Hooks: camelCase with 'use' prefix
useTimer.js

// Services: PascalCase with 'Service' suffix
TimerService.js

// Utils: camelCase
timeFormatter.js

// Constants: SCREAMING_SNAKE_CASE
const WORK_TIME = 25 * 60;
```

---

### File Organization

```javascript
// Her dosya şu sırayı takip etmeli:
// 1. Imports
// 2. Constants (varsa)
// 3. Main component/function/class
// 4. Helper functions (varsa)
// 5. Styles
// 6. Exports
```

---

### Component Structure

```javascript
// 1. Props destructuring
export const MyComponent = ({ prop1, prop2 }) => {
  
  // 2. Hooks
  const [state, setState] = useState();
  
  // 3. Event handlers
  const handleClick = () => {};
  
  // 4. Render helpers
  const renderItem = () => {};
  
  // 5. Return JSX
  return <View>...</View>;
};

// 6. Styles
const styles = StyleSheet.create({});
```

---

## 📚 8. Önerilen Kaynaklar

### Kitaplar
- Clean Code - Robert C. Martin
- Refactoring - Martin Fowler
- Design Patterns - Gang of Four

### Online
- React Documentation
- React Native Documentation
- Kent C. Dodds Blog
- Dan Abramov Blog

---

## 🎓 9. Takım İçin Eğitim Planı

### Hafta 1: Teori
- Clean Code prensipleri
- SOLID prensipleri
- Component composition

### Hafta 2: Pratik
- Kod örnekleri inceleme
- Pair programming
- Code review practice

### Hafta 3: Implementation
- Gerçek proje üzerinde çalışma
- Mentörlük
- Q&A sessions

---

## ✅ 10. Final Checklist

### Code Quality
- [ ] Her component tek sorumluluk prensibi
- [ ] DRY prensibi uygulandı
- [ ] KISS prensibi uygulandı
- [ ] Anlamlı değişken isimleri
- [ ] Yorum satırları gerektiğinde eklendi

### Performance
- [ ] Gereksiz re-render'lar önlendi
- [ ] useMemo/useCallback kullanıldı
- [ ] Lazy loading uygulandı (gerekirse)

### Testing
- [ ] Unit testler yazıldı
- [ ] Integration testler yazıldı
- [ ] E2E testler yazıldı (opsiyonel)

### Documentation
- [ ] README güncellendi
- [ ] Component dokümantasyonu eklendi
- [ ] API dokümantasyonu eklendi
- [ ] Deployment guide hazırlandı

---

## 🚀 11. Deployment

### Pre-Deployment
1. Tüm testleri çalıştırın
2. Build alın
3. Staging'de test edin
4. Performance metrikleri kontrol edin

### Deployment
1. Production'a deploy edin
2. Smoke test yapın
3. Monitoring'i kontrol edin
4. Rollback planını hazır bulundurun

### Post-Deployment
1. Kullanıcı geri bildirimlerini toplayın
2. Bug'ları önceliklendirin
3. Performans metriklerini izleyin
4. Ekibi bilgilendirin

---

## 📞 12. Destek ve İletişim

### Sorular İçin
- Takım lead'i ile görüşün
- Documentation'ı kontrol edin
- Stack Overflow'da arayın

### Geri Bildirim
- Code review'larda yapıcı olun
- İyileştirme önerileri sunun
- Başarıları kutlayın

---

## 🎉 Tebrikler!

Bu rehberi takip ederek kodunuzu profesyonel, sürdürülebilir ve ölçeklenebilir bir yapıya kavuşturacaksınız. 

**Unutmayın:** Refactoring bir yolculuktur, bir hedef değil. Sürekli iyileştirme yapın!

---

## 📈 Başarı Metrikleri

Refactoring'in başarısını şu metriklerle ölçün:

- ✅ Code review süresi: %40 azalma
- ✅ Bug fix süresi: %50 azalma
- ✅ New feature development: %30 hızlanma
- ✅ Developer satisfaction: %60 artış
- ✅ Test coverage: %0 → %80+
- ✅ Code duplication: %40 → %5

**Hedef:** Tüm metriklerde iyileşme!

---

*Son güncelleme: 2025*
*Versiyon: 1.0*