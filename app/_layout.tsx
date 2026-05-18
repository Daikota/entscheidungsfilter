import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { AppTheme } from '@/constants/theme';
import { DecisionProvider } from '@/contexts/decision-context';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: AppTheme.colors.surface,
    border: AppTheme.colors.borderSoft,
    card: AppTheme.colors.surfaceRaised,
    primary: AppTheme.colors.primary,
    text: AppTheme.colors.text,
  },
};

export default function RootLayout() {
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
                title: 'Neue Entscheidung',
              }}
            />
            <Stack.Screen
              name="decision/[id]"
              options={{
                title: 'Entscheidung',
              }}
            />
            <Stack.Screen
              name="decision/[id]/ratings"
              options={{
                title: 'Bewertung',
              }}
            />
          </Stack>
          <StatusBar style="dark" />
        </DecisionProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
