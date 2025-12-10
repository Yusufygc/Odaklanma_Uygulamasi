// ==========================================
// hooks/useAppState.js
// ==========================================
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

export const useAppState = (onBackground, onForeground) => {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
        onBackground?.();
      }
      else if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        onForeground?.();
      }

      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [onBackground, onForeground]);
};