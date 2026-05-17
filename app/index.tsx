import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Entscheidungsfilter</Text>
        <Text style={styles.subtitle}>
          Erstelle deine erste Entscheidung, um Optionen und Kriterien zu bewerten.
        </Text>
      </View>

      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Noch keine Entscheidungen</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => undefined}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
        <Text style={styles.buttonText}>Neue Entscheidung</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: {
    gap: 12,
    marginBottom: 40,
  },
  title: {
    color: '#172033',
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    color: '#4D5A6D',
    fontSize: 17,
    lineHeight: 24,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#DDE3EA',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    marginBottom: 24,
    padding: 24,
  },
  emptyTitle: {
    color: '#2D3748',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 8,
    minHeight: 56,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  buttonPressed: {
    backgroundColor: '#1D4ED8',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
