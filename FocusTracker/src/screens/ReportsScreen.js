{/* hesaplamaları veritabanı katmanına taşıdık. Artık ReportsScreen.js sadece verileri gösteriyor.
Neden Bu Yapı Daha Profesyonel?
Bellek Dostu: Artık 10,000 kayıt olsa bile JavaScript tarafında sadece özet veri (yaklaşık 5-10 nesne) tutulur.

SQL Hızı: Veritabanı toplama işlemlerini milisaniyeler içinde yapar. 
JS tarafında döngü kurmak, veri büyüdükçe uygulamayı dondurur.

Temiz Kod: ReportsScreen artık mantık kurmuyor, sadece veri gösteriyor (View Layer). 
İş mantığı Hook katmanında, veri erişimi DB katmanında. Bu tam bir Clean Architecture örneği. */}


import React, { useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { STRINGS } from '../constants/strings'; // ✅ Import
import { useSessionStats } from '../hooks/useSessionStats';
import { StatCard } from '../components/reports/StatCard';
import { InsightCard } from '../components/reports/InsightCard';
import { ChartContainer } from '../components/reports/ChartContainer';
import { EmptyState } from '../components/reports/EmptyState';

const screenWidth = Dimensions.get("window").width;

export default function ReportsScreen() {
  // PeriodSelector'ı kaldırdık çünkü genel istatistiklere odaklandık
  // İstersen DB'ye "fetchWeekStats" gibi parametreli fonksiyon ekleyip geri getirebilirsin.

  const {
    stats,
    pieData,
    barData,
    mostProductive,
    loading,
    loadSessions,
  } = useSessionStats();

  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [loadSessions])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={styles.loadingText}>{STRINGS.common.loading}</Text>
      </View>
    );
  }

  const insights = [
    {
      icon: 'stats-chart',
      label: STRINGS.reports.insights.avgSession,
      value: `${Math.round(stats.avgDuration)} dk`,
    },
    {
      icon: 'trophy',
      label: STRINGS.reports.insights.mostProductive,
      value: mostProductive || STRINGS.reports.insights.notAvailable, // Fallback eklendi
    },
  ];
  //******************************************** */ ai ekledi
  const getMotivationMessage = () => {
    if (stats.totalDuration > 120) return STRINGS.reports.motivation.expert;
    else if (stats.totalDuration > 60) return STRINGS.reports.motivation.pro;
    else if (stats.totalDuration > 0) return STRINGS.reports.motivation.starter;
    return null;
  };
  const motivationMessage = getMotivationMessage();

  if (motivationMessage) {  
    insights.push({
      icon: 'heart',
      label: STRINGS.reports.insights.motivation,
      value: motivationMessage,
    });
  }
 //******************************************** */
  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.headerTitle}>{STRINGS.reports.title}</Text>

      {stats.totalSessions === 0 ? (
        <EmptyState 
           title={STRINGS.reports.empty.title}
           message={STRINGS.reports.empty.message}
        />
      ) : (
        <>
          <View style={styles.statsGrid}>
            <StatCard
              icon="today-outline"
              iconColor="#4a90e2"
              value={`${Math.round(stats.todayDuration)} dk`}
              label={STRINGS.reports.stats.today}
            />
            <StatCard
              icon="time-outline"
              iconColor="#2ecc71"
              value={`${Math.round(stats.totalDuration)} dk`}
              label={STRINGS.reports.stats.totalTime}
            />
            <StatCard
              icon="checkmark-circle-outline"
              iconColor="#9b59b6"
              value={stats.totalSessions}
              label={STRINGS.reports.stats.completed}
            />
            <StatCard
              icon="alert-circle-outline"
              iconColor="#e74c3c"
              value={stats.totalDistractions}
              label={STRINGS.reports.stats.distractions}
            />
          </View>

          <InsightCard insights={insights} />

          {pieData.length > 0 && (
            <ChartContainer title={STRINGS.reports.charts.categoryDist} icon="pie-chart">
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

          <ChartContainer title={STRINGS.reports.charts.weeklyActivity} icon="bar-chart">
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
});