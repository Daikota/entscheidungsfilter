import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppThemeValues, useAppTheme } from '@/constants/theme';
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
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { decisions, databaseError, isDatabaseReady } = useDecisions();
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

        {!isDatabaseReady ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Entscheidungen werden geladen</Text>
          </View>
        ) : databaseError.length > 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{databaseError}</Text>
          </View>
        ) : decisions.length === 0 ? (
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
                    <Text style={styles.metaText}>Optionen: {decision.options.length}</Text>
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

const createStyles = (theme: AppThemeValues) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  contentArea: {
    flex: 1,
  },
  content: {
    gap: 28,
    paddingBottom: 24,
    paddingHorizontal: theme.spacing.screenX,
    paddingTop: 56,
  },
  header: {
    gap: 12,
  },
  title: {
    color: theme.colors.text,
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: 17,
    lineHeight: 24,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceRaised,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 260,
    padding: 24,
  },
  emptyTitle: {
    color: theme.colors.textStrong,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  decisionList: {
    gap: 12,
    paddingBottom: 8,
  },
  decisionCard: {
    backgroundColor: theme.colors.surfaceRaised,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    gap: 12,
    minHeight: 96,
    padding: 16,
    ...theme.shadow.card,
  },
  decisionCardPressed: {
    backgroundColor: theme.colors.surfacePressed,
  },
  decisionTitle: {
    color: theme.colors.text,
    fontSize: 19,
    fontWeight: '700',
  },
  decisionMeta: {
    gap: 6,
  },
  metaText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  actionBar: {
    backgroundColor: theme.colors.surface,
    borderTopColor: theme.colors.borderSoft,
    borderTopWidth: 1,
    paddingHorizontal: theme.spacing.screenX,
    paddingTop: 16,
    ...theme.shadow.footer,
  },
  button: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    minHeight: 60,
    justifyContent: 'center',
    paddingHorizontal: 24,
    width: '100%',
  },
  buttonPressed: {
    backgroundColor: theme.colors.primaryPressed,
  },
  buttonText: {
    color: theme.colors.onPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
});
