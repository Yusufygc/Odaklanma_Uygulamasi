import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { initDB } from './src/utils/db'; 

export default function App() {
  
  useEffect(() => {
    // initDB artık bir Promise döndürüyor
    initDB().then(() => console.log("Veritabanı hazır"));
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}