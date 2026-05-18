import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDecisions } from '@/contexts/decision-context';

const formatDateTime = (value: string) => {
  const date = new Date(value);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}.${month}.${year}, ${hours}:${minutes}`;
};

export default function HomeScreen() {
  const { decisions } = useDecisions();
  const insets = useSafeAreaInsets();
  const footerBottomPadding = Math.max(insets.bottom + 12, 28);

  return (
    <View style={styles.screen}>
      <ScrollView
        alwaysBounceVertical={false}
        contentContainerStyle={styles.content}
        style={styles.contentArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Entscheidungsfilter</Text>
          <Text style={styles.subtitle}>
            Erstelle deine erste Entscheidung, um Optionen und Kriterien zu bewerten.
          </Text>
        </View>

        {decisions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Noch keine Entscheidungen</Text>
          </View>
        ) : (
          <View style={styles.decisionList}>
            {decisions.map((decision) => (
              <Link
                key={decision.id}
                href={{ pathname: '/decision/[id]', params: { id: decision.id } }}
                asChild>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Entscheidung ${decision.title} öffnen`}
                  style={({ pressed }) => [
                    styles.decisionCard,
                    pressed && styles.decisionCardPressed,
                  ]}>
                  <Text style={styles.decisionTitle}>{decision.title}</Text>
                  <View style={styles.decisionMeta}>
                    <Text style={styles.metaText}>Optionen: 0</Text>
                    <Text style={styles.metaText}>
                      Erstellt: {formatDateTime(decision.createdAt)}
                    </Text>
                    <Text style={styles.metaText}>
                      Zuletzt bearbeitet: {formatDateTime(decision.updatedAt)}
                    </Text>
                  </View>
                </Pressable>
              </Link>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={[styles.actionBar, { paddingBottom: footerBottomPadding }]}>
        <Link href="/create-decision" asChild>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
            <Text style={styles.buttonText}>Neue Entscheidung</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  contentArea: {
    flex: 1,
  },
  content: {
    gap: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
    paddingTop: 56,
  },
  header: {
    gap: 12,
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
    justifyContent: 'center',
    minHeight: 260,
    padding: 24,
  },
  emptyTitle: {
    color: '#2D3748',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  decisionList: {
    gap: 12,
    paddingBottom: 8,
  },
  decisionCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDE3EA',
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  decisionCardPressed: {
    backgroundColor: '#EEF4FF',
  },
  decisionTitle: {
    color: '#172033',
    fontSize: 19,
    fontWeight: '700',
  },
  decisionMeta: {
    gap: 6,
  },
  metaText: {
    color: '#4D5A6D',
    fontSize: 14,
    lineHeight: 20,
  },
  actionBar: {
    backgroundColor: '#F7F8FA',
    borderTopColor: '#E6EBF1',
    borderTopWidth: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 8,
    minHeight: 60,
    justifyContent: 'center',
    paddingHorizontal: 24,
    width: '100%',
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
