import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { DecisionProvider } from '@/contexts/decision-context';

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
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
        </Stack>
        <StatusBar style="dark" />
      </DecisionProvider>
    </ThemeProvider>
  );
}
