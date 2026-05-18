import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { useAppTheme } from '@/constants/theme';
import { DecisionProvider } from '@/contexts/decision-context';

export default function RootLayout() {
  const appTheme = useAppTheme();
  const navigationTheme = {
    ...DefaultTheme,
    dark: appTheme.isDark,
    colors: {
      ...DefaultTheme.colors,
      background: appTheme.colors.surface,
      border: appTheme.colors.borderSoft,
      card: appTheme.colors.surfaceRaised,
      primary: appTheme.colors.primary,
      text: appTheme.colors.text,
    },
  };

  return (
    <SafeAreaProvider>
      <ThemeProvider value={navigationTheme}>
        <DecisionProvider>
          <Stack>
            <Stack.Screen
              name="index"
              options={{
                headerShown: false,
                title: 'Entscheidungsfilter',
              }}
            />
            <Stack.Screen
              name="create-decision"
              options={{
                headerShadowVisible: false,
                headerStyle: { backgroundColor: appTheme.colors.surface },
                headerTintColor: appTheme.colors.textStrong,
                title: 'Neue Entscheidung',
              }}
            />
            <Stack.Screen
              name="settings"
              options={{
                headerShadowVisible: false,
                headerStyle: { backgroundColor: appTheme.colors.surface },
                headerTintColor: appTheme.colors.textStrong,
                title: 'Einstellungen',
              }}
            />
            <Stack.Screen
              name="decision/[id]"
              options={{
                headerShadowVisible: false,
                headerStyle: { backgroundColor: appTheme.colors.surface },
                headerTintColor: appTheme.colors.textStrong,
                title: 'Entscheidung',
              }}
            />
            <Stack.Screen
              name="decision/[id]/ratings"
              options={{
                headerShadowVisible: false,
                headerStyle: { backgroundColor: appTheme.colors.surface },
                headerTintColor: appTheme.colors.textStrong,
                title: 'Bewertung',
              }}
            />
          </Stack>
          <StatusBar style={appTheme.isDark ? 'light' : 'dark'} />
        </DecisionProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
