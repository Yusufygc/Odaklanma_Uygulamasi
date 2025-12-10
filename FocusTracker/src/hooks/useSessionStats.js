// ==========================================
// hooks/useSessionStats.js
// ==========================================
import { useState, useCallback } from 'react';
import { fetchSessions } from '../utils/db';

export const useSessionStats = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSessions();
      setSessions(data);
    } catch (error) {
      console.error('Load sessions error:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getFilteredSessions = useCallback((period) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return sessions.filter(item => {
      const sessionDate = new Date(item.date);
      const sessionDay = new Date(
        sessionDate.getFullYear(),
        sessionDate.getMonth(),
        sessionDate.getDate()
      );

      switch (period) {
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return sessionDay >= weekAgo;
        
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return sessionDay >= monthAgo;
        
        case 'all':
        default:
          return true;
      }
    });
  }, [sessions]);

  const calculateStats = useCallback((filteredSessions) => {
    const totalDuration = filteredSessions.reduce(
      (sum, item) => sum + item.duration, 
      0
    ) / 60;

    const totalDistractions = filteredSessions.reduce(
      (sum, item) => sum + item.distractions, 
      0
    );

    const totalSessions = filteredSessions.length;

    const avgDuration = totalSessions > 0 
      ? totalDuration / totalSessions 
      : 0;

    const today = new Date().toDateString();
    const todayDuration = sessions
      .filter(item => new Date(item.date).toDateString() === today)
      .reduce((sum, item) => sum + item.duration, 0) / 60;

    return {
      totalDuration,
      totalDistractions,
      totalSessions,
      avgDuration,
      todayDuration,
    };
  }, [sessions]);

  const getMostProductiveCategory = useCallback((filteredSessions) => {
    if (filteredSessions.length === 0) return 'Henüz yok';

    const categoryData = {};
    filteredSessions.forEach(item => {
      categoryData[item.category] = (categoryData[item.category] || 0) + item.duration;
    });

    const sorted = Object.entries(categoryData).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || 'Henüz yok';
  }, []);

  const getCategoryDistribution = useCallback((filteredSessions) => {
    const categoryData = {};
    
    filteredSessions.forEach(item => {
      categoryData[item.category] = (categoryData[item.category] || 0) + item.duration;
    });

    const colors = [
      "#e74c3c", "#f39c12", "#2ecc71", "#3498db", 
      "#9b59b6", "#1abc9c", "#e67e22"
    ];

    return Object.keys(categoryData).map((key, index) => ({
      name: key,
      population: Math.round(categoryData[key] / 60),
      color: colors[index % colors.length],
      legendFontColor: "#555",
      legendFontSize: 13,
    }));
  }, []);

  const getLast7DaysActivity = useCallback(() => {
    const last7Days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      last7Days.push({
        date: date.toDateString(),
        label: date.getDate().toString(),
        duration: 0,
      });
    }

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
        data: last7Days.map(d => Math.round(d.duration)),
      }],
    };
  }, [sessions]);

  return {
    sessions,
    loading,
    loadSessions,
    getFilteredSessions,
    calculateStats,
    getMostProductiveCategory,
    getCategoryDistribution,
    getLast7DaysActivity,
  };
};
