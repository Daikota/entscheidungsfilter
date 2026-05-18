import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDecisions } from '@/contexts/decision-context';

export default function DecisionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { decisions } = useDecisions();
  const insets = useSafeAreaInsets();
  const decision = decisions.find((currentDecision) => currentDecision.id === id);

  if (decision === undefined) {
    return (
      <View style={styles.screen}>
        <View style={styles.notFoundContent}>
          <Text style={styles.notFoundTitle}>Entscheidung nicht gefunden</Text>
          <Text style={styles.notFoundText}>
            Diese Entscheidung ist nur im lokalen App-Zustand vorhanden und kann nach einem Neustart
            verschwinden.
          </Text>
          <Link href="/" asChild>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}>
              <Text style={styles.primaryButtonText}>Zur Startseite</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 32, 48) }]}
      style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>{decision.title}</Text>
        {decision.description.length > 0 ? (
          <Text style={styles.description}>{decision.description}</Text>
        ) : null}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Optionen</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => undefined}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}>
            <Text style={styles.secondaryButtonText}>Option hinzufügen</Text>
          </Pressable>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Noch keine Optionen</Text>
          <Text style={styles.emptyText}>Optionen werden in einer späteren Version ergänzt.</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Kriterien</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => undefined}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}>
            <Text style={styles.secondaryButtonText}>Kriterium hinzufügen</Text>
          </Pressable>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Noch keine Kriterien</Text>
          <Text style={styles.emptyText}>Kriterien werden in einer späteren Version ergänzt.</Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => undefined}
        style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}>
        <Text style={styles.primaryButtonText}>Bewertung starten / Ergebnisse anzeigen</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  content: {
    gap: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  header: {
    gap: 12,
  },
  title: {
    color: '#172033',
    fontSize: 30,
    fontWeight: '700',
  },
  description: {
    color: '#4D5A6D',
    fontSize: 17,
    lineHeight: 24,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#172033',
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#DDE3EA',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    justifyContent: 'center',
    minHeight: 132,
    padding: 20,
  },
  emptyTitle: {
    color: '#2D3748',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyText: {
    color: '#4D5A6D',
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  primaryButtonPressed: {
    backgroundColor: '#1D4ED8',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#EAF1FF',
    borderColor: '#BCD0FF',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
  },
  secondaryButtonPressed: {
    backgroundColor: '#DCE8FF',
  },
  secondaryButtonText: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  notFoundContent: {
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  notFoundTitle: {
    color: '#172033',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  notFoundText: {
    color: '#4D5A6D',
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
  },
});
