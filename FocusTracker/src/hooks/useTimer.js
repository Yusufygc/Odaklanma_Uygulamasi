// ==========================================
// hooks/useTimer.js (Final + Debug Loglu)
// ==========================================
import { useState, useEffect, useRef, useCallback } from 'react';

export const useTimer = (initialDuration, onComplete) => {
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef(null);
  
  const onCompleteRef = useRef(onComplete);
  
  // onComplete değiştiğinde referansı güncelle
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // 1. SAYAÇ MANTIĞI
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  // 2. BİTİŞ MANTIĞI
  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      console.log("⏰ Timer Hook: Süre 0 oldu! Bitiş tetikleniyor...");
      
      // Önce fonksiyonu çağıralım (State güncellemesinden etkilenmemesi için)
      if (onCompleteRef.current) {
        console.log("👉 Timer Hook: Hedef fonksiyon çağrılıyor...");
        try {
          onCompleteRef.current();
        } catch (err) {
          console.error("❌ Timer Hook: Fonksiyon çalışırken hata:", err);
        }
      } else {
        console.error("❌ Timer Hook: HATA - onComplete fonksiyonu (handleSessionComplete) BULUNAMADI!");
      }

      // Sonra sayacı durduralım
      setIsActive(false);
    }
  }, [timeLeft, isActive]);

  const start = useCallback(() => {
    if (timeLeft === 0) setTimeLeft(initialDuration);
    setIsActive(true);
  }, [initialDuration, timeLeft]);

  const pause = useCallback(() => setIsActive(false), []);

  const reset = useCallback((duration = initialDuration) => {
    setIsActive(false);
    setTimeLeft(duration);
  }, [initialDuration]);

  const getProgress = () => {
    if (initialDuration === 0) return 0;
    return ((initialDuration - timeLeft) / initialDuration) * 100;
  };

  return { timeLeft, isActive, start, pause, reset, getProgress };
};