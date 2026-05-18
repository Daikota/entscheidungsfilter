import { Link, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppThemeValues, useAppTheme } from '@/constants/theme';
import { useDecisions } from '@/contexts/decision-context';
import { RatingScore } from '@/types/decision';
import { calculateDecisionResults } from '@/utils/decision-results';

const ratingScores: RatingScore[] = [1, 2, 3, 4, 5];

export default function DecisionRatingsScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { decisions, databaseError, isDatabaseReady, setRating } = useDecisions();
  const insets = useSafeAreaInsets();
  const decision = decisions.find((currentDecision) => currentDecision.id === id);
  const [screenError, setScreenError] = useState('');

  if (!isDatabaseReady) {
    return (
      <View style={styles.screen}>
        <View style={styles.messageContent}>
          <Text style={styles.messageTitle}>Bewertung wird geladen</Text>
        </View>
      </View>
    );
  }

  if (databaseError.length > 0) {
    return (
      <View style={styles.screen}>
        <View style={styles.messageContent}>
          <Text style={styles.messageTitle}>{databaseError}</Text>
        </View>
      </View>
    );
  }

  if (decision === undefined) {
    return (
      <View style={styles.screen}>
        <View style={styles.messageContent}>
          <Text style={styles.messageTitle}>Entscheidung nicht gefunden</Text>
          <Text style={styles.messageText}>
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

  const hasMissingSetup = decision.options.length === 0 || decision.criteria.length === 0;
  const results = hasMissingSetup ? [] : calculateDecisionResults(decision);

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 32, 48) }]}
      style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Bewertung</Text>
        <Text style={styles.subtitle}>{decision.title}</Text>
      </View>
      {screenError.length > 0 ? (
        <View style={styles.errorBox}>
          <Text accessibilityRole="alert" style={styles.errorText}>
            {screenError}
          </Text>
        </View>
      ) : null}

      {hasMissingSetup ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Bewertung noch nicht möglich</Text>
          <Text style={styles.emptyText}>
            Füge mindestens eine Option und ein Kriterium hinzu, bevor du bewertest.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Punkte vergeben</Text>
            {decision.options.map((option) => (
              <View key={option.id} style={styles.optionCard}>
                <Text style={styles.optionTitle}>{option.name}</Text>
                <View style={styles.criteriaList}>
                  {decision.criteria.map((criterion) => {
                    const selectedRating = decision.ratings.find(
                      (rating) =>
                        rating.optionId === option.id && rating.criterionId === criterion.id
                    );

                    return (
                      <View key={criterion.id} style={styles.ratingRow}>
                        <View style={styles.ratingHeader}>
                          <Text style={styles.criterionName}>{criterion.name}</Text>
                          <Text style={styles.weightText}>Gewichtung {criterion.weight}</Text>
                        </View>
                        <View style={styles.scoreButtons}>
                          {ratingScores.map((score) => {
                            const isSelected = selectedRating?.score === score;

                            return (
                              <Pressable
                                key={score}
                                accessibilityRole="button"
                                accessibilityState={{ selected: isSelected }}
                                accessibilityLabel={`${score} Punkte für ${option.name} bei ${criterion.name}`}
                                onPress={() => {
                                  setRating({
                                    decisionId: decision.id,
                                    optionId: option.id,
                                    criterionId: criterion.id,
                                    score,
                                  })
                                    .then(() => setScreenError(''))
                                    .catch((error) => {
                                      console.error('Failed to save rating', error);
                                      setScreenError('Die Bewertung konnte nicht gespeichert werden.');
                                    });
                                }}
                                style={[
                                  styles.scoreButton,
                                  isSelected && styles.scoreButtonSelected,
                                ]}>
                                <Text
                                  style={[
                                    styles.scoreButtonText,
                                    isSelected && styles.scoreButtonTextSelected,
                                  ]}>
                                  {score}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ergebnis</Text>
            <View style={styles.resultList}>
              {results.map((result) => (
                <View
                  key={result.optionId}
                  style={[styles.resultCard, result.rank === 1 && styles.bestResultCard]}>
                  <View style={styles.resultRank}>
                    <Text style={styles.resultRankText}>{result.rank}</Text>
                  </View>
                  <View style={styles.resultContent}>
                    <Text style={styles.resultTitle}>{result.optionName}</Text>
                    <Text style={styles.resultLabel}>{result.label}</Text>
                  </View>
                  <Text style={styles.resultScore}>{result.totalScore}</Text>
                </View>
              ))}
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const createStyles = (theme: AppThemeValues) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  content: {
    gap: 24,
    paddingHorizontal: theme.spacing.screenX,
    paddingTop: 32,
  },
  header: {
    gap: 8,
  },
  title: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: '700',
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: 17,
    lineHeight: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  optionCard: {
    backgroundColor: theme.colors.surfaceRaised,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    gap: 16,
    padding: 16,
    ...theme.shadow.card,
  },
  optionTitle: {
    color: theme.colors.text,
    fontSize: 19,
    fontWeight: '700',
  },
  criteriaList: {
    gap: 14,
  },
  ratingRow: {
    gap: 10,
  },
  ratingHeader: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  criterionName: {
    color: theme.colors.textStrong,
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  weightText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  scoreButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  scoreButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceRaised,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: theme.touch.min,
  },
  scoreButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  scoreButtonText: {
    color: theme.colors.textStrong,
    fontSize: 16,
    fontWeight: '700',
  },
  scoreButtonTextSelected: {
    color: theme.colors.onPrimary,
  },
  resultList: {
    gap: 10,
  },
  resultCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceRaised,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    ...theme.shadow.card,
  },
  bestResultCard: {
    borderColor: theme.colors.primary,
  },
  resultRank: {
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.md,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  resultRankText: {
    color: theme.colors.info,
    fontSize: 18,
    fontWeight: '700',
  },
  resultContent: {
    flex: 1,
    gap: 4,
  },
  resultTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  resultLabel: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  resultScore: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceRaised,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    gap: 8,
    justifyContent: 'center',
    minHeight: 180,
    padding: 20,
  },
  errorBox: {
    backgroundColor: theme.colors.dangerSoft,
    borderColor: theme.colors.dangerBorder,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    padding: 14,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyTitle: {
    color: theme.colors.textStrong,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  messageContent: {
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.screenX,
  },
  messageTitle: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  messageText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    minHeight: theme.touch.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  primaryButtonPressed: {
    backgroundColor: theme.colors.primaryPressed,
  },
  primaryButtonText: {
    color: theme.colors.onPrimary,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
});
