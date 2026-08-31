import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import BookmarksScreen from '../screens/BookmarksScreen';
import SettingsScreen from '../screens/SettingsScreen';

import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';

const Tab = createBottomTabNavigator();

const ICONS = {
  Home: ['home', 'home-outline'],
  Bookmarks: ['bookmark', 'bookmark-outline'],
  Settings: ['settings', 'settings-outline'],
};

export default function BottomTabs() {
  const { colors } = useTheme();
  const { t } = useSettings();

  const labels = {
    Home: t('home'),
    Bookmarks: t('bookmarks'),
    Settings: t('settings'),
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingTop: 6,
          paddingBottom: Platform.OS === 'ios' ? 26 : 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarLabel: labels[route.name],
        tabBarIcon: ({ focused, color, size }) => {
          const [active, inactive] = ICONS[route.name];
          return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Bookmarks" component={BookmarksScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
