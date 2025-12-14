import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { initDB } from './src/utils/db'; 
import { ThemeProvider } from './src/context/ThemeContext'; 

export default function App() {
  useEffect(() => {
    initDB().then(() => console.log("Veritabanı hazır"));
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}