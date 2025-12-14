import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../styles/colors';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSystemTheme, setIsSystemTheme] = useState(true);

  useEffect(() => {
    loadThemeSettings();
  }, []);

  useEffect(() => {
    if (isSystemTheme) {
      setIsDarkMode(systemScheme === 'dark');
    }
  }, [systemScheme, isSystemTheme]);

  const loadThemeSettings = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themePreference');
      if (savedTheme === 'dark') {
        setIsDarkMode(true);
        setIsSystemTheme(false);
      } else if (savedTheme === 'light') {
        setIsDarkMode(false);
        setIsSystemTheme(false);
      } else {
        setIsSystemTheme(true);
        setIsDarkMode(systemScheme === 'dark');
      }
    } catch (e) {
      console.log('Tema yükleme hatası', e);
    }
  };

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    setIsSystemTheme(false);
    await AsyncStorage.setItem('themePreference', newMode ? 'dark' : 'light');
  };

  const themeColors = {
    ...Colors,
    background: isDarkMode ? '#121212' : '#f8f9fa',
    card: isDarkMode ? '#1e1e1e' : '#ffffff',
    text: isDarkMode ? '#e0e0e0' : '#333333',
    textLight: isDarkMode ? '#aaaaaa' : '#666666',
    border: isDarkMode ? '#333333' : '#e0e0e0',
    primary: Colors.primary,
    success: Colors.success,
    error: Colors.error,
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, themeColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);