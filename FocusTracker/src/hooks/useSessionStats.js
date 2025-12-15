// hooks/useSessionStats.js
import { useState, useCallback } from 'react';
import { 
  fetchTotalStats, 
  fetchTodayStats, 
  fetchCategoryStats, 
  fetchLast7DaysStats 
} from '../utils/db';

export const useSessionStats = () => {
  const [stats, setStats] = useState({
    totalDuration: 0,
    totalDistractions: 0,
    totalSessions: 0,
    todayDuration: 0,
    avgDuration: 0,
  });
  
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState({ labels: [], datasets: [{ data: [] }] });
  const [mostProductive, setMostProductive] = useState('Henüz yok');
  const [loading, setLoading] = useState(true);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const [totalRes, todayRes, categoryRes, weeklyRawRes] = await Promise.all([
        fetchTotalStats(),
        fetchTodayStats(),
        fetchCategoryStats(),
        fetchLast7DaysStats()
      ]);

      const avgDur = totalRes.totalSessions > 0 
        ? totalRes.totalDuration / totalRes.totalSessions 
        : 0;

      setStats({
        totalDuration: Math.ceil(totalRes.totalDuration / 60),
        totalDistractions: totalRes.totalDistractions,
        totalSessions: totalRes.totalSessions,
        todayDuration: Math.ceil(todayRes / 60),
        avgDuration: Math.ceil(avgDur / 60),
      });

      if (categoryRes.length > 0) {
        setMostProductive(categoryRes[0].name);
        
        // Silinen kategoriler için kullanılacak Gri Renk
        const DELETED_CATEGORY_COLOR = "#bdc3c7"; 

        setPieData(categoryRes.map((item, index) => ({
          name: item.name,
          population: item.totalDuration,
          // ✨ DÜZELTME: Veritabanından renk geliyorsa (mevcut kategori) onu kullan, 
          // gelmiyorsa (silinmiş kategori) gri yap.
          color: item.color || DELETED_CATEGORY_COLOR, 
          legendFontColor: "#555",
          legendFontSize: 13,
        })));
      } else {
        setMostProductive('Henüz yok');
        setPieData([]);
      }

      // Son 7 Gün Verisi (Bar Chart)
      const last7Days = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        last7Days.push({
          label: d.getDate().toString(),
          fullDate: d.toDateString(),
          duration: 0
        });
      }

      weeklyRawRes.forEach(item => {
        const itemDate = new Date(item.date).toDateString();
        const foundDay = last7Days.find(d => d.fullDate === itemDate);
        if (foundDay) {
          foundDay.duration += item.duration / 60;
        }
      });

      setBarData({
        labels: last7Days.map(d => d.label),
        datasets: [{
          data: last7Days.map(d => Math.ceil(d.duration)),
        }],
      });

    } catch (error) {
      console.error('İstatistik yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stats,
    pieData,
    barData,
    mostProductive,
    loading,
    loadSessions,
  };
};