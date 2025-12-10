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
      // Tüm sorguları paralel çalıştır (Performans için önemli)
      const [totalRes, todayRes, categoryRes, weeklyRawRes] = await Promise.all([
        fetchTotalStats(),
        fetchTodayStats(),
        fetchCategoryStats(),
        fetchLast7DaysStats()
      ]);

      // 1. Genel İstatistikleri Ayarla
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

      // 2. En Verimli Kategori ve Pasta Grafik Verisi
      if (categoryRes.length > 0) {
        setMostProductive(categoryRes[0].name);
        
        const colors = [
          "#e74c3c", "#f39c12", "#2ecc71", "#3498db", 
          "#9b59b6", "#1abc9c", "#e67e22"
        ];

        setPieData(categoryRes.map((item, index) => ({
          name: item.name,
          population: item.totalDuration, // ✅ Yeni (Saniye - Daha hassas yüzde hesaplar)
          color: colors[index % colors.length],
          legendFontColor: "#555",
          legendFontSize: 13,
        })));
      } else {
        setMostProductive('Henüz yok');
        setPieData([]);
      }

      // 3. Son 7 Gün Verisi (Bar Chart)
      // Veritabanından gelen ham veriyi günlere dağıtıyoruz
      const last7Days = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        last7Days.push({
          label: d.getDate().toString(), // Ayın günü (Örn: 27)
          fullDate: d.toDateString(),    // Eşleştirme için tam tarih
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
          data: last7Days.map(d => Math.ceil(d.duration)),//yuvarladık
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