import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // Sayfa her açıldığında veriyi yenilemek için
import { PieChart, BarChart } from 'react-native-chart-kit';
import { fetchSessions } from '../utils/db'; // Veritabanı fonksiyonumuz

const screenWidth = Dimensions.get("window").width;

export default function ReportsScreen() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sayfa her görüntülendiğinde verileri veritabanından çek
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const data = await fetchSessions();
    setSessions(data);
    setLoading(false);
  };

  // --- İSTATİSTİK HESAPLAMALARI ---

  // 1. Toplam Odaklanma Süresi (Dakika)
  const totalDuration = sessions.reduce((sum, item) => sum + item.duration, 0) / 60;

  // 2. Toplam Dikkat Dağınıklığı
  const totalDistractions = sessions.reduce((sum, item) => sum + item.distractions, 0);

  // 3. Bugünkü Odaklanma Süresi
  const todayDuration = sessions
    .filter(item => new Date(item.date).toDateString() === new Date().toDateString())
    .reduce((sum, item) => sum + item.duration, 0) / 60;

  // --- GRAFİK VERİLERİ ---

  // Pasta Grafik Verisi (Kategorilere Göre Dağılım)
  const getPieData = () => {
    const categoryData = {};
    sessions.forEach(item => {
      if (categoryData[item.category]) {
        categoryData[item.category] += item.duration;
      } else {
        categoryData[item.category] = item.duration;
      }
    });

    const colors = ["#e74c3c", "#f1c40f", "#2ecc71", "#3498db", "#9b59b6"];
    
    return Object.keys(categoryData).map((key, index) => ({
      name: key,
      population: Math.round(categoryData[key] / 60), // Dakikaya çevir
      color: colors[index % colors.length],
      legendFontColor: "#7F7F7F",
      legendFontSize: 12
    }));
  };

  // Çubuk Grafik Verisi (Son 7 Günlük Aktivite)
  // Basitlik için sadece bugünün verisini gösteriyoruz, geliştirebilirsin.
  const getBarData = () => {
    return {
      labels: ["Bugün"],
      datasets: [
        {
          data: [Math.round(todayDuration)]
        }
      ]
    };
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#4a90e2" /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      <Text style={styles.headerTitle}>Raporlar</Text>

      {/* Özet Kartları */}
      <View style={styles.statsContainer}>
        <View style={styles.card}>
            <Text style={styles.cardValue}>{Math.round(todayDuration)} dk</Text>
            <Text style={styles.cardLabel}>Bugün</Text>
        </View>
        <View style={styles.card}>
            <Text style={styles.cardValue}>{Math.round(totalDuration)} dk</Text>
            <Text style={styles.cardLabel}>Toplam</Text>
        </View>
        <View style={[styles.card, { borderRightWidth: 0 }]}>
            <Text style={[styles.cardValue, { color: '#e74c3c' }]}>{totalDistractions}</Text>
            <Text style={styles.cardLabel}>Dağılma</Text>
        </View>
      </View>

      {sessions.length === 0 ? (
        <Text style={styles.noDataText}>Henüz veri yok. Hadi çalışmaya başla!</Text>
      ) : (
        <>
          {/* Pasta Grafik */}
          <Text style={styles.chartTitle}>Kategori Dağılımı (Dakika)</Text>
          <PieChart
            data={getPieData()}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            absolute
          />

          {/* Çubuk Grafik (Basit) */}
          <Text style={styles.chartTitle}>Bugünkü Performans</Text>
          <BarChart
            data={getBarData()}
            width={screenWidth - 40}
            height={220}
            yAxisLabel=""
            yAxisSuffix=" dk"
            chartConfig={chartConfig}
            verticalLabelRotation={0}
            style={styles.graphStyle}
          />
        </>
      )}
    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2, 
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50, paddingHorizontal: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 30, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 20,
    justifyContent: 'space-between',
    marginBottom: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  card: { flex: 1, alignItems: 'center', borderRightWidth: 1, borderRightColor: '#e0e0e0' },
  cardValue: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  cardLabel: { fontSize: 14, color: '#666', marginTop: 5 },
  chartTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10, marginTop: 20, color: '#333' },
  graphStyle: { borderRadius: 16, marginVertical: 8 },
  noDataText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#999' }
});