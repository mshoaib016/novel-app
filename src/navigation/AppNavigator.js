import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BottomTabs from './BottomTabs';
import NovelDetailsScreen from '../screens/NovelDetailsScreen';
import ReaderScreen from '../screens/ReaderScreen';
import CategoryScreen from '../screens/CategoryScreen';
import SearchScreen from '../screens/SearchScreen';
import InfoScreen from '../screens/InfoScreen';
import ContactUsScreen from '../screens/ContactUsScreen';
import ReportProblemScreen from '../screens/ReportProblemScreen';

import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { colors, isDark } = useTheme();

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
      notification: colors.accent,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Tabs" component={BottomTabs} />
        <Stack.Screen name="NovelDetails" component={NovelDetailsScreen} />
        <Stack.Screen
          name="Reader"
          component={ReaderScreen}
          options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
        />
        <Stack.Screen name="Category" component={CategoryScreen} />
        <Stack.Screen name="Search" component={SearchScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="Info" component={InfoScreen} />
        <Stack.Screen name="ContactUs" component={ContactUsScreen} />
        <Stack.Screen name="ReportProblem" component={ReportProblemScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
