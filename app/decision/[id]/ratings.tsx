import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDecisions } from '@/contexts/decision-context';
import { RatingScore } from '@/types/decision';
import { calculateDecisionResults } from '@/utils/decision-results';

const ratingScores: RatingScore[] = [1, 2, 3, 4, 5];

export default function DecisionRatingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { decisions, setRating } = useDecisions();
  const insets = useSafeAreaInsets();
  const decision = decisions.find((currentDecision) => currentDecision.id === id);

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
                                onPress={() =>
                                  setRating({
                                    decisionId: decision.id,
                                    optionId: option.id,
                                    criterionId: criterion.id,
                                    score,
                                  })
                                }
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
    gap: 8,
  },
  title: {
    color: '#172033',
    fontSize: 30,
    fontWeight: '700',
  },
  subtitle: {
    color: '#4D5A6D',
    fontSize: 17,
    lineHeight: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: '#172033',
    fontSize: 22,
    fontWeight: '700',
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDE3EA',
    borderRadius: 8,
    borderWidth: 1,
    gap: 16,
    padding: 16,
  },
  optionTitle: {
    color: '#172033',
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
    color: '#2D3748',
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  weightText: {
    color: '#4D5A6D',
    fontSize: 14,
  },
  scoreButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  scoreButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#DDE3EA',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  scoreButtonSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  scoreButtonText: {
    color: '#2D3748',
    fontSize: 16,
    fontWeight: '700',
  },
  scoreButtonTextSelected: {
    color: '#FFFFFF',
  },
  resultList: {
    gap: 10,
  },
  resultCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#DDE3EA',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  bestResultCard: {
    borderColor: '#2563EB',
  },
  resultRank: {
    alignItems: 'center',
    backgroundColor: '#EAF1FF',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  resultRankText: {
    color: '#1D4ED8',
    fontSize: 18,
    fontWeight: '700',
  },
  resultContent: {
    flex: 1,
    gap: 4,
  },
  resultTitle: {
    color: '#172033',
    fontSize: 17,
    fontWeight: '700',
  },
  resultLabel: {
    color: '#4D5A6D',
    fontSize: 14,
  },
  resultScore: {
    color: '#172033',
    fontSize: 20,
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
    minHeight: 180,
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
  messageContent: {
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  messageTitle: {
    color: '#172033',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  messageText: {
    color: '#4D5A6D',
    fontSize: 16,
    lineHeight: 23,
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
});
