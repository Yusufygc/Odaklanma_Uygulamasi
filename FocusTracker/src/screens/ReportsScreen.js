// ==========================================
// screens/ReportsScreen.js - REFACTORED
// ==========================================
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

// Hooks
import { useSessionStats } from '../hooks/useSessionStats';

// Components
import { StatCard } from '../components/reports/StatCard';
import { PeriodSelector } from '../components/reports/PeriodSelector';
import { InsightCard } from '../components/reports/InsightCard';
import { ChartContainer } from '../components/reports/ChartContainer';
import { EmptyState } from '../components/reports/EmptyState';

const screenWidth = Dimensions.get("window").width;

export default function ReportsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const {
    sessions,
    loading,
    loadSessions,
    getFilteredSessions,
    calculateStats,
    getMostProductiveCategory,
    getCategoryDistribution,
    getLast7DaysActivity,
  } = useSessionStats();

  // Sayfa her görüntülendiğinde verileri yükle
  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [loadSessions])
  );

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
      </View>
    );
  }

  // Filtrelenmiş veriler ve hesaplamalar
  const filteredSessions = getFilteredSessions(selectedPeriod);
  const stats = calculateStats(filteredSessions);
  const mostProductive = getMostProductiveCategory(filteredSessions);
  const pieData = getCategoryDistribution(filteredSessions);
  const barData = getLast7DaysActivity();

  // İçgörü verileri
  const insights = [
    {
      icon: 'stats-chart',
      label: 'Ortalama seans süresi',
      value: `${Math.round(stats.avgDuration)} dk`,
    },
    {
      icon: 'trophy',
      label: 'En verimli kategori',
      value: mostProductive,
    },
  ];

  // Motivasyon mesajı
  const getMotivationMessage = () => {
    if (stats.totalDuration > 120) {
      return "Harika gidiyorsun! 🎉 Odaklanma konusunda gerçek bir profesyonelsin!";
    } else if (stats.totalDuration > 60) {
      return "Süper! ⭐ Düzenli çalışman meyvelerini veriyor!";
    } else if (stats.totalDuration > 0) {
      return "İyi başlangıç! 💪 Devam et, her gün biraz daha ilerle!";
    }
    return null;
  };

  const motivationMessage = getMotivationMessage();

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.headerTitle}>📊 Raporlar</Text>

      {/* Periyot Seçici */}
      <PeriodSelector
        selectedPeriod={selectedPeriod}
        onSelectPeriod={setSelectedPeriod}
      />

      {sessions.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* İstatistik Kartları */}
          <View style={styles.statsGrid}>
            <StatCard
              icon="today-outline"
              iconColor="#4a90e2"
              value={`${Math.round(stats.todayDuration)} dk`}
              label="Bugün"
            />
            <StatCard
              icon="time-outline"
              iconColor="#2ecc71"
              value={`${Math.round(stats.totalDuration)} dk`}
              label="Toplam Süre"
            />
            <StatCard
              icon="checkmark-circle-outline"
              iconColor="#9b59b6"
              value={stats.totalSessions}
              label="Tamamlanan"
            />
            <StatCard
              icon="alert-circle-outline"
              iconColor="#e74c3c"
              value={stats.totalDistractions}
              label="Dağılma"
            />
          </View>

          {/* İçgörü Kartı */}
          <InsightCard insights={insights} />

          {/* Pasta Grafik - Kategori Dağılımı */}
          {pieData.length > 0 && (
            <ChartContainer title="Kategori Dağılımı" icon="pie-chart">
              <PieChart
                data={pieData}
                width={screenWidth - 40}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </ChartContainer>
          )}

          {/* Çubuk Grafik - Son 7 Gün */}
          <ChartContainer title="Son 7 Günlük Aktivite" icon="bar-chart">
            <BarChart
              data={barData}
              width={screenWidth - 40}
              height={220}
              yAxisLabel=""
              yAxisSuffix=" dk"
              chartConfig={chartConfig}
              verticalLabelRotation={0}
              style={styles.barChart}
              fromZero
            />
          </ChartContainer>

          {/* Motivasyon Kartı */}
          {motivationMessage && (
            <View style={styles.motivationCard}>
              <Text style={styles.motivationIcon}>🚀</Text>
              <Text style={styles.motivationText}>{motivationMessage}</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

// Grafik konfigürasyonu
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
    strokeWidth: 1,
  },
  propsForLabels: {
    fontSize: 12,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  contentContainer: {
    paddingBottom: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  barChart: {
    borderRadius: 16,
  },
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
  motivationIcon: {
    fontSize: 28,
    marginRight: 15,
  },
  motivationText: {
    flex: 1,
    fontSize: 15,
    color: '#1565c0',
    lineHeight: 22,
    fontWeight: '500',
  },
});
