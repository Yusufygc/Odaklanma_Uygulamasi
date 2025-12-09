import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet } from 'react-native';

// Ekranlarımızı import ediyoruz
import HomeScreen from '../screens/HomeScreen';
import ReportsScreen from '../screens/ReportsScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Odaklan') {
              iconName = focused ? 'timer' : 'timer-outline';
            } else if (route.name === 'Raporlar') {
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#4a90e2', // Modern mavi
          tabBarInactiveTintColor: '#8e8e93', // iOS gri
          headerShown: false, // Header'ı kaldır, her ekranda kendi başlığı var
          tabBarStyle: {
            height: Platform.OS === 'ios' ? 88 : 60,
            paddingBottom: Platform.OS === 'ios' ? 20 : 8,
            paddingTop: 8,
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: '#e5e5e5',
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginBottom: Platform.OS === 'ios' ? 0 : 4,
          },
          tabBarIconStyle: {
            marginTop: Platform.OS === 'ios' ? 0 : 4,
          },
          tabBarHideOnKeyboard: true, // Klavye açıkken tab bar'ı gizle
        })}
      >
        <Tab.Screen 
          name="Odaklan" 
          component={HomeScreen}
          options={{
            tabBarBadge: null, // Badge eklenebilir (örn: aktif seans varsa)
          }}
        />
        <Tab.Screen 
          name="Raporlar" 
          component={ReportsScreen}
          options={{
            tabBarBadge: null, // Badge eklenebilir (örn: yeni başarı)
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}