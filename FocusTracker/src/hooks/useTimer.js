// ==========================================
// hooks/useTimer.js
// ==========================================
import { useState, useEffect, useRef } from 'react';

export const useTimer = (initialDuration, onComplete) => {
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsActive(false);
      onComplete?.();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, timeLeft, onComplete]);

  const start = () => setIsActive(true);
  const pause = () => setIsActive(false);
  const reset = (duration = initialDuration) => {
    setIsActive(false);
    setTimeLeft(duration);
  };

  const getProgress = () => {
    return ((initialDuration - timeLeft) / initialDuration) * 100;
  };

  return {
    timeLeft,
    isActive,
    start,
    pause,
    reset,
    getProgress,
  };
};