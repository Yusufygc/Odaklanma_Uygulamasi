import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { fetchSessions } from '../utils/db';

const screenWidth = Dimensions.get("window").width;

export default function ReportsScreen() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // 'week', 'month', 'all'

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    setLoading(true);
    const data = await fetchSessions();
    setSessions(data);
    setLoading(false);
  };

  // Tarih filtreleme yardımcı fonksiyonu
  const getFilteredSessions = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return sessions.filter(item => {
      const sessionDate = new Date(item.date);
      const sessionDay = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());
      
      if (selectedPeriod === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return sessionDay >= weekAgo;
      } else if (selectedPeriod === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return sessionDay >= monthAgo;
      }
      return true; // 'all'
    });
  };

  const filteredSessions = getFilteredSessions();

  // --- İSTATİSTİK HESAPLAMALARI ---

  // Toplam Odaklanma Süresi (Dakika)
  const totalDuration = filteredSessions.reduce((sum, item) => sum + item.duration, 0) / 60;

  // Toplam Dikkat Dağınıklığı
  const totalDistractions = filteredSessions.reduce((sum, item) => sum + item.distractions, 0);

  // Tamamlanan Seans Sayısı
  const totalSessions = filteredSessions.length;

  // Ortalama Odaklanma Süresi
  const avgDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;

  // Bugünkü Odaklanma Süresi
  const today = new Date();
  const todayStr = today.toDateString();
  const todayDuration = sessions
    .filter(item => new Date(item.date).toDateString() === todayStr)
    .reduce((sum, item) => sum + item.duration, 0) / 60;

  // En verimli kategori
  const getMostProductiveCategory = () => {
    if (filteredSessions.length === 0) return 'Henüz yok';
    
    const categoryData = {};
    filteredSessions.forEach(item => {
      if (categoryData[item.category]) {
        categoryData[item.category] += item.duration;
      } else {
        categoryData[item.category] = item.duration;
      }
    });

    const sorted = Object.entries(categoryData).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || 'Henüz yok';
  };

  // --- GRAFİK VERİLERİ ---

  // Pasta Grafik Verisi (Kategorilere Göre Dağılım)
  const getPieData = () => {
    if (filteredSessions.length === 0) return [];

    const categoryData = {};
    filteredSessions.forEach(item => {
      if (categoryData[item.category]) {
        categoryData[item.category] += item.duration;
      } else {
        categoryData[item.category] = item.duration;
      }
    });

    const colors = ["#e74c3c", "#f39c12", "#2ecc71", "#3498db", "#9b59b6", "#1abc9c", "#e67e22"];
    
    return Object.keys(categoryData).map((key, index) => ({
      name: key,
      population: Math.round(categoryData[key] / 60), // Dakikaya çevir
      color: colors[index % colors.length],
      legendFontColor: "#555",
      legendFontSize: 13
    }));
  };

  // Çubuk Grafik Verisi (Son 7 Günlük Aktivite)
  const getBarData = () => {
    const last7Days = [];
    const today = new Date();
    
    // Son 7 günü oluştur
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      last7Days.push({
        date: date.toDateString(),
        label: date.getDate().toString(),
        duration: 0
      });
    }

    // Her gün için süreleri topla
    sessions.forEach(item => {
      const sessionDate = new Date(item.date).toDateString();
      const dayData = last7Days.find(d => d.date === sessionDate);
      if (dayData) {
        dayData.duration += item.duration / 60;
      }
    });

    return {
      labels: last7Days.map(d => d.label),
      datasets: [{
        data: last7Days.map(d => Math.round(d.duration))
      }]
    };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
      </View>
    );
  }

  const pieData = getPieData();
  const barData = getBarData();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      <Text style={styles.headerTitle}>📊 Raporlar</Text>

      {/* Periyot Seçici */}
      <View style={styles.periodSelector}>
        {[
          { key: 'week', label: 'Bu Hafta' },
          { key: 'month', label: 'Bu Ay' },
          { key: 'all', label: 'Tümü' }
        ].map(period => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodButton,
              selectedPeriod === period.key && styles.periodButtonActive
            ]}
            onPress={() => setSelectedPeriod(period.key)}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === period.key && styles.periodButtonTextActive
            ]}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Özet Kartları */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="today-outline" size={24} color="#4a90e2" />
          <Text style={styles.statValue}>{Math.round(todayDuration)} dk</Text>
          <Text style={styles.statLabel}>Bugün</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="time-outline" size={24} color="#2ecc71" />
          <Text style={styles.statValue}>{Math.round(totalDuration)} dk</Text>
          <Text style={styles.statLabel}>Toplam Süre</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle-outline" size={24} color="#9b59b6" />
          <Text style={styles.statValue}>{totalSessions}</Text>
          <Text style={styles.statLabel}>Tamamlanan</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="alert-circle-outline" size={24} color="#e74c3c" />
          <Text style={styles.statValue}>{totalDistractions}</Text>
          <Text style={styles.statLabel}>Dağılma</Text>
        </View>
      </View>

      {/* Ek İstatistikler */}
      <View style={styles.insightCard}>
        <View style={styles.insightRow}>
          <Ionicons name="stats-chart" size={20} color="#666" />
          <Text style={styles.insightText}>
            Ortalama seans süresi: <Text style={styles.insightBold}>{Math.round(avgDuration)} dk</Text>
          </Text>
        </View>
        <View style={styles.insightRow}>
          <Ionicons name="trophy" size={20} color="#f39c12" />
          <Text style={styles.insightText}>
            En verimli kategori: <Text style={styles.insightBold}>{getMostProductiveCategory()}</Text>
          </Text>
        </View>
      </View>

      {sessions.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={64} color="#ccc" />
          <Text style={styles.emptyStateTitle}>Henüz veri yok</Text>
          <Text style={styles.emptyStateText}>
            İlk odaklanma seansını tamamlayarak raporlarını görmeye başla! 🚀
          </Text>
        </View>
      ) : (
        <>
          {/* Pasta Grafik */}
          {pieData.length > 0 && (
            <>
              <View style={styles.chartHeader}>
                <Ionicons name="pie-chart" size={20} color="#333" />
                <Text style={styles.chartTitle}>Kategori Dağılımı</Text>
              </View>
              <View style={styles.chartContainer}>
                <PieChart
                  data={pieData}
                  width={screenWidth - 40}
                  height={220}
                  chartConfig={chartConfig}
                  accessor={"population"}
                  backgroundColor={"transparent"}
                  paddingLeft={"15"}
                  absolute
                />
              </View>
            </>
          )}

          {/* Çubuk Grafik (Son 7 Gün) */}
          <View style={styles.chartHeader}>
            <Ionicons name="bar-chart" size={20} color="#333" />
            <Text style={styles.chartTitle}>Son 7 Günlük Aktivite</Text>
          </View>
          <View style={styles.chartContainer}>
            <BarChart
              data={barData}
              width={screenWidth - 40}
              height={220}
              yAxisLabel=""
              yAxisSuffix=" dk"
              chartConfig={chartConfig}
              verticalLabelRotation={0}
              style={styles.graphStyle}
              fromZero
            />
          </View>

          {/* Motivasyon Mesajı */}
          {totalDuration > 0 && (
            <View style={styles.motivationCard}>
              <Ionicons name="rocket" size={28} color="#4a90e2" />
              <Text style={styles.motivationText}>
                {totalDuration > 120
                  ? "Harika gidiyorsun! 🎉 Odaklanma konusunda gerçek bir profesyonelsin!"
                  : totalDuration > 60
                  ? "Süper! ⭐ Düzenli çalışman meyvelerini veriyor!"
                  : "İyi başlangıç! 💪 Devam et, her gün biraz daha ilerle!"}
              </Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.6,
  propsForBackgroundLines: {
    strokeDasharray: "",
    stroke: "#e3e3e3",
    strokeWidth: 1
  },
  propsForLabels: {
    fontSize: 12
  }
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa', 
    paddingTop: 50, 
    paddingHorizontal: 20 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#f8f9fa'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666'
  },
  headerTitle: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    color: '#333' 
  },
  
  // Periyot Seçici
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#4a90e2',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  periodButtonTextActive: {
    color: '#fff',
  },

  // İstatistik Kartları
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  statValue: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#333',
    marginTop: 8,
    marginBottom: 4
  },
  statLabel: { 
    fontSize: 13, 
    color: '#666',
    textAlign: 'center'
  },

  // İçgörü Kartı
  insightCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightText: {
    fontSize: 15,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
  insightBold: {
    fontWeight: 'bold',
    color: '#333',
  },

  // Grafik Stilleri
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  chartTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#333',
    marginLeft: 8
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    alignItems: 'center',
  },
  graphStyle: { 
    borderRadius: 16,
  },

  // Boş Durum
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Motivasyon Kartı
  motivationCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4a90e2',
  },
  motivationText: {
    flex: 1,
    fontSize: 15,
    color: '#1565c0',
    marginLeft: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
});