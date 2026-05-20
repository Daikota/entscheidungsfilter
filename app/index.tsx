import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppThemeValues, useAppTheme } from '@/constants/theme';
import { useDecisions } from '@/contexts/decision-context';
import { AppButton, AppCard, AppLogo, EmptyState, IconButton, StatPill } from '@/components/ui/app-ui';

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
  const router = useRouter();
  const { decisions, databaseError, isDatabaseReady } = useDecisions();
  const insets = useSafeAreaInsets();
  const footerBottomPadding = Math.max(insets.bottom + 14, 30);
  const readyDecisionCount = decisions.filter(
    (decision) => decision.options.length >= 2 && decision.criteria.length >= 1
  ).length;
  const sortedDecisions = [...decisions].sort(
    (firstDecision, secondDecision) =>
      new Date(secondDecision.updatedAt).getTime() - new Date(firstDecision.updatedAt).getTime()
  );

  return (
    <View style={styles.screen}>
      <ScrollView
        alwaysBounceVertical={false}
        contentContainerStyle={styles.content}
        style={styles.contentArea}>
        <View style={styles.hero}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroLogo}>
              <AppLogo size={52} />
            </View>
            <IconButton
              icon="settings-outline"
              label="Einstellungen öffnen"
              onPress={() => router.push('/settings')}
            />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.kicker}>Decision Studio</Text>
            <Text style={styles.title}>Entscheidungen klarer machen.</Text>
            <Text style={styles.subtitle}>
              Vergleiche Optionen mit Kriterien und sieh sofort, was vorne liegt.
            </Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <StatPill icon="layers-outline" label="Aktiv" value={`${decisions.length}`} />
          <StatPill icon="checkmark-circle-outline" label="Bewertbar" value={`${readyDecisionCount}`} />
        </View>

        {!isDatabaseReady ? (
          <EmptyState icon="sync-outline" title="Lade Entscheidungen" />
        ) : databaseError.length > 0 ? (
          <EmptyState icon="alert-circle-outline" title={databaseError} />
        ) : decisions.length === 0 ? (
          <EmptyState
            icon="compass-outline"
            title="Noch nichts zu vergleichen"
            message="Starte mit Optionen und Kriterien."
          />
        ) : (
          <View style={styles.decisionList}>
            {sortedDecisions.map((decision, index) => {
              const isDecisionRateable = decision.options.length >= 2 && decision.criteria.length >= 1;

              return (
                <Pressable
                  accessibilityLabel={`Entscheidung ${decision.title} öffnen`}
                  accessibilityRole="button"
                  key={decision.id}
                  onPress={() => router.push({ pathname: '/decision/[id]/ratings', params: { id: decision.id } })}
                  style={({ pressed }) => [
                    styles.decisionPressable,
                    pressed && styles.decisionPressablePressed,
                  ]}>
                  <AppCard elevated={index === 0} style={[styles.decisionCard, index === 0 && styles.focusDecisionCard]}>
                    {index === 0 ? (
                      <View style={styles.focusBadge}>
                        <Ionicons color={theme.colors.onPrimary} name="play-forward" size={13} />
                        <Text style={styles.focusBadgeText}>
                          {isDecisionRateable ? 'Weiter bewerten' : 'Weiter aufbauen'}
                        </Text>
                      </View>
                    ) : null}
                    <View style={styles.cardTopRow}>
                      <View style={styles.cardTitleGroup}>
                        <Text numberOfLines={2} style={styles.decisionTitle}>
                          {decision.title}
                        </Text>
                      </View>
                      <View style={styles.cardArrow}>
                        <Ionicons color={theme.colors.textSecondary} name="chevron-forward" size={20} />
                      </View>
                    </View>
                    <View style={styles.cardMetaRow}>
                      <StatPill icon="list-outline" label="Optionen" value={`${decision.options.length}`} />
                      <StatPill
                        icon="time-outline"
                        label="Geändert"
                        value={formatDateTime(decision.updatedAt).split(',')[0]}
                      />
                    </View>
                  </AppCard>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={[styles.actionBar, { paddingBottom: footerBottomPadding }]}>
        <AppButton
          icon="add"
          onPress={() => router.push('/create-decision')}
          style={styles.actionButton}
          title="Neue Entscheidung"
        />
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
    gap: 18,
    paddingBottom: 24,
    paddingHorizontal: theme.spacing.screenX,
    paddingTop: 42,
  },
  hero: {
    gap: 18,
    paddingTop: 2,
  },
  heroTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroLogo: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  heroText: {
    gap: 7,
  },
  kicker: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: theme.colors.textStrong,
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 37,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    lineHeight: 23,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  decisionList: {
    gap: 12,
    paddingBottom: 8,
  },
  decisionPressable: {
    borderRadius: theme.radius.lg,
  },
  decisionPressablePressed: {
    transform: [{ scale: 0.985 }],
  },
  decisionCard: {
    gap: 14,
  },
  focusDecisionCard: {
    borderColor: theme.colors.primaryBorder,
  },
  focusBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    flexDirection: 'row',
    gap: 6,
    minHeight: 30,
    paddingHorizontal: 11,
  },
  focusBadgeText: {
    color: theme.colors.onPrimary,
    fontSize: 12,
    fontWeight: '900',
  },
  cardTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  cardTitleGroup: {
    flex: 1,
  },
  decisionTitle: {
    color: theme.colors.textStrong,
    fontSize: 19,
    fontWeight: '900',
    lineHeight: 24,
  },
  cardArrow: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceTint,
    borderRadius: theme.radius.pill,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  cardMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionBar: {
    backgroundColor: theme.colors.surface,
    borderTopColor: theme.colors.borderSoft,
    borderTopWidth: 1,
    paddingHorizontal: theme.spacing.screenX,
    paddingTop: 14,
    ...theme.shadow.footer,
  },
  actionButton: {
    width: '100%',
  },
});
