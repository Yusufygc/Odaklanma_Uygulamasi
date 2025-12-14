import React, { useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { STRINGS } from '../constants/strings';
import { useSessionStats } from '../hooks/useSessionStats';
import { useTheme } from '../context/ThemeContext'; // ✨ Tema
import { StatCard } from '../components/reports/StatCard';
import { InsightCard } from '../components/reports/InsightCard';
import { ChartContainer } from '../components/reports/ChartContainer';
import { EmptyState } from '../components/reports/EmptyState';

const screenWidth = Dimensions.get("window").width;

export default function ReportsScreen() {
  const { themeColors } = useTheme();
  const { stats, pieData, barData, mostProductive, loading, loadSessions } = useSessionStats();

  useFocusEffect(useCallback(() => { loadSessions(); }, [loadSessions]));
  const totalDuration = pieData.reduce((acc, current) => acc + current.population, 0);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={[styles.loadingText, { color: themeColors.textLight }]}>{STRINGS.common.loading}</Text>
      </View>
    );
  }

  const insights = [
    { icon: 'stats-chart', label: STRINGS.reports.insights.avgSession, value: `${Math.round(stats.avgDuration)} dk` },
    { icon: 'trophy', label: STRINGS.reports.insights.mostProductive, value: mostProductive || STRINGS.reports.insights.notAvailable },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]} contentContainerStyle={styles.contentContainer}>
      <Text style={[styles.headerTitle, { color: themeColors.text }]}>{STRINGS.reports.title}</Text>

      {stats.totalSessions === 0 ? (
        <EmptyState title={STRINGS.reports.empty.title} message={STRINGS.reports.empty.message} />
      ) : (
        <>
          <View style={styles.statsGrid}>
            <StatCard icon="today-outline" iconColor="#4a90e2" value={`${Math.round(stats.todayDuration)} dk`} label={STRINGS.reports.stats.today} />
            <StatCard icon="time-outline" iconColor="#2ecc71" value={`${Math.round(stats.totalDuration)} dk`} label={STRINGS.reports.stats.totalTime} />
            <StatCard icon="checkmark-circle-outline" iconColor="#9b59b6" value={stats.totalSessions} label={STRINGS.reports.stats.completed} />
            <StatCard icon="alert-circle-outline" iconColor="#e74c3c" value={stats.totalDistractions} label={STRINGS.reports.stats.distractions} />
          </View>

          <InsightCard insights={insights} />

          <ChartContainer title={STRINGS.reports.charts.categoryDist} icon="pie-chart">
            <View style={{ alignItems: 'center' }}>
              <PieChart
                data={pieData} width={screenWidth} height={240}
                chartConfig={{...chartConfig, color: (opacity = 1) => themeColors.primary }}
                accessor="population" backgroundColor="transparent" paddingLeft={screenWidth / 4} hasLegend={false} absolute={false}
              />
            </View>
            <View style={styles.legendContainer}>
              {pieData.map((item, index) => {
                const percentage = ((item.population / totalDuration) * 100).toFixed(1);
                return (
                  <View key={index} style={styles.legendItem}>
                    <View style={styles.legendLeft}>
                      <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                      <Text style={styles.legendText}>{item.name}</Text>
                    </View>
                    <View style={styles.legendRight}>
                      <Text style={styles.legendValue}>{Math.ceil(item.population / 60)} dk</Text>
                      <Text style={styles.legendPercentage}>%{percentage}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </ChartContainer>

          <ChartContainer title={STRINGS.reports.charts.weeklyActivity} icon="bar-chart">
            <BarChart
              data={barData} width={screenWidth - 40} height={220} yAxisLabel="" yAxisSuffix=" dk"
              chartConfig={{...chartConfig, backgroundGradientFrom: themeColors.card, backgroundGradientTo: themeColors.card, labelColor: () => themeColors.textLight}}
              verticalLabelRotation={0} style={styles.barChart} fromZero
            />
          </ChartContainer>
        </>
      )}
    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: "#fff", backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
  strokeWidth: 2, barPercentage: 0.6,
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, paddingHorizontal: 20 },
  contentContainer: { paddingBottom: 50 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16 },
  headerTitle: { fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  barChart: { borderRadius: 16 },
  legendContainer: { width: '100%', paddingHorizontal: 20, marginTop: 10 },
  legendItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  legendLeft: { flexDirection: 'row', alignItems: 'center' },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  legendText: { fontSize: 15, color: '#333', fontWeight: '500' },
  legendRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  legendValue: { fontSize: 14, color: '#666' },
  legendPercentage: { fontSize: 14, fontWeight: 'bold', color: '#333', minWidth: 45, textAlign: 'right' },
});