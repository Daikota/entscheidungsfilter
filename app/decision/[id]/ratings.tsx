import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppCard, EmptyState, IconButton, SectionHeader } from '@/components/ui/app-ui';
import { AppThemeValues, useAppTheme } from '@/constants/theme';
import { useDecisions } from '@/contexts/decision-context';
import { RatingScore } from '@/types/decision';
import {
  calculateDecisionResults,
  getDecisionRatingProgress,
  getOptionRatingProgress,
} from '@/utils/decision-results';
import { canStartRating } from '@/utils/decision-validation';

const ratingScores: RatingScore[] = [1, 2, 3, 4, 5];

type NextRatingTarget = {
  optionId: string;
  optionName: string;
  criterionId: string;
  criterionName: string;
};

export default function DecisionRatingsScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { decisions, databaseError, isDatabaseReady, setRating } = useDecisions();
  const insets = useSafeAreaInsets();
  const decision = decisions.find((currentDecision) => currentDecision.id === id);
  const [screenError, setScreenError] = useState('');

  if (!isDatabaseReady) {
    return (
      <View style={styles.screen}>
        <View style={styles.messageContent}>
          <EmptyState icon="sync-outline" title="Bewertung wird geladen" />
        </View>
      </View>
    );
  }

  if (databaseError.length > 0) {
    return (
      <View style={styles.screen}>
        <View style={styles.messageContent}>
          <EmptyState icon="alert-circle-outline" title={databaseError} />
        </View>
      </View>
    );
  }

  if (decision === undefined) {
    return (
      <View style={styles.screen}>
        <View style={styles.messageContent}>
          <EmptyState
            icon="help-circle-outline"
            title="Entscheidung nicht gefunden"
            message="Dieser Eintrag ist nicht mehr verfügbar."
          />
          <Link href="/" asChild>
            <AppButton icon="home-outline" title="Zur Startseite" />
          </Link>
        </View>
      </View>
    );
  }

  const hasMissingSetup = !canStartRating(decision.options.length, decision.criteria.length);
  const results = hasMissingSetup ? [] : calculateDecisionResults(decision);
  const maxScore = results.length > 0 ? results[0].totalScore : 0;
  const ratingProgress = getDecisionRatingProgress(decision);
  const progressWidth = hasMissingSetup ? 0 : Math.max(ratingProgress.percentage, 4);
  const nextRatingTarget = hasMissingSetup
    ? null
    : decision.options.reduce<NextRatingTarget | null>((target, option) => {
        if (target !== null) {
          return target;
        }

        const criterion = decision.criteria.find(
          (currentCriterion) =>
            !decision.ratings.some(
              (rating) =>
                rating.optionId === option.id && rating.criterionId === currentCriterion.id
            )
        );

        if (criterion === undefined) {
          return null;
        }

        return {
          optionId: option.id,
          optionName: option.name,
          criterionId: criterion.id,
          criterionName: criterion.name,
        };
      }, null);
  const ratingOptions = nextRatingTarget
    ? [...decision.options].sort((firstOption, secondOption) => {
        if (firstOption.id === nextRatingTarget.optionId) {
          return -1;
        }

        if (secondOption.id === nextRatingTarget.optionId) {
          return 1;
        }

        return 0;
      })
    : decision.options;

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 34, 52) }]}
      style={styles.screen}>
      <AppCard elevated style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroTitleGroup}>
            <Text style={styles.kicker}>Analyse</Text>
            <Text style={styles.title}>Bewertung</Text>
          </View>
          <IconButton
            icon="create-outline"
            label="Entscheidung bearbeiten"
            onPress={() => router.push({ pathname: '/decision/[id]', params: { id: decision.id } })}
          />
        </View>
        <Text numberOfLines={2} style={styles.subtitle}>
          {decision.title}
        </Text>
        {!hasMissingSetup ? (
          <View style={styles.progressBox}>
            <View style={styles.progressTextRow}>
              <Text style={styles.progressText}>
                {ratingProgress.completed} von {ratingProgress.total} Bewertungen erledigt
              </Text>
              <Text style={styles.progressPercent}>{ratingProgress.percentage}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressWidth}%` }]} />
            </View>
            {nextRatingTarget ? (
              <View style={styles.nextStepBox}>
                <Ionicons color={theme.colors.primary} name="arrow-forward-circle-outline" size={18} />
                <Text style={styles.nextStepText}>
                  Als Nächstes: {nextRatingTarget.optionName} nach {nextRatingTarget.criterionName}
                </Text>
              </View>
            ) : (
              <View style={styles.nextStepBox}>
                <Ionicons color={theme.colors.primary} name="checkmark-circle-outline" size={18} />
                <Text style={styles.nextStepText}>Alle Bewertungen sind vollständig.</Text>
              </View>
            )}
          </View>
        ) : null}
      </AppCard>

      {screenError.length > 0 ? (
        <AppCard style={styles.errorBox}>
          <Text accessibilityRole="alert" style={styles.errorText}>
            {screenError}
          </Text>
        </AppCard>
      ) : null}

      {hasMissingSetup ? (
        <EmptyState
          icon="construct-outline"
          title="Noch nicht bereit"
          message="2 Optionen und 1 Kriterium nötig."
        />
      ) : (
        <>
          <View style={styles.section}>
            <SectionHeader
              eyebrow={ratingProgress.isComplete ? 'Komplett' : 'Offen'}
              title="Optionen bewerten"
            />
            <AppCard style={styles.scaleHint}>
              <Text style={styles.scaleHintText}>1 niedrig</Text>
              <View style={styles.scaleHintLine} />
              <Text style={styles.scaleHintText}>5 hoch</Text>
            </AppCard>
            {ratingOptions.map((option) => {
              const optionProgress = getOptionRatingProgress(decision, option.id);
              const ratingCriteria =
                nextRatingTarget?.optionId === option.id
                  ? [...decision.criteria].sort((firstCriterion, secondCriterion) => {
                      if (firstCriterion.id === nextRatingTarget.criterionId) {
                        return -1;
                      }

                      if (secondCriterion.id === nextRatingTarget.criterionId) {
                        return 1;
                      }

                      return 0;
                    })
                  : decision.criteria;

              return (
                <AppCard key={option.id} style={styles.optionCard}>
                  <View style={styles.optionHeader}>
                    <View style={styles.optionIcon}>
                      <Ionicons color={theme.colors.primary} name="cube-outline" size={19} />
                    </View>
                    <View style={styles.optionTitleGroup}>
                      <Text numberOfLines={2} style={styles.optionTitle}>{option.name}</Text>
                      <Text style={styles.optionProgressText}>
                        {optionProgress.completed}/{optionProgress.total} bewertet
                      </Text>
                    </View>
                    <View style={[styles.stateBadge, optionProgress.isComplete && styles.stateBadgeDone]}>
                      <Ionicons
                        color={optionProgress.isComplete ? theme.colors.onPrimary : theme.colors.warning}
                        name={optionProgress.isComplete ? 'checkmark' : 'ellipse-outline'}
                        size={14}
                      />
                      <Text
                        style={[
                          styles.stateBadgeText,
                          optionProgress.isComplete && styles.stateBadgeTextDone,
                        ]}>
                        {optionProgress.isComplete ? 'Fertig' : `${optionProgress.missing} offen`}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.criteriaList}>
                    {ratingCriteria.map((criterion) => {
                      const selectedRating = decision.ratings.find(
                        (rating) =>
                          rating.optionId === option.id && rating.criterionId === criterion.id
                      );
                      const isMissing = selectedRating === undefined;
                      const isNextTarget =
                        nextRatingTarget?.optionId === option.id &&
                        nextRatingTarget.criterionId === criterion.id;

                      return (
                        <View
                          key={criterion.id}
                          style={[
                            styles.ratingBlock,
                            isMissing && styles.ratingBlockMissing,
                            isNextTarget && styles.ratingBlockFocused,
                          ]}>
                          <View style={styles.ratingHeader}>
                            <View style={styles.criterionTextGroup}>
                              <Text numberOfLines={2} style={styles.criterionName}>{criterion.name}</Text>
                              <Text style={styles.weightText}>Gewicht {criterion.weight}</Text>
                            </View>
                            {isNextTarget ? (
                              <View style={styles.nextBadge}>
                                <Text style={styles.nextBadgeText}>Jetzt</Text>
                              </View>
                            ) : selectedRating ? (
                              <View style={styles.selectedBadge}>
                                <Text style={styles.selectedBadgeText}>{selectedRating.score}</Text>
                              </View>
                            ) : (
                              <View style={styles.missingBadge}>
                                <Text style={styles.missingBadgeText}>Fehlt</Text>
                              </View>
                            )}
                          </View>
                          <View style={styles.scoreButtons}>
                            {ratingScores.map((score) => {
                              const isSelected = selectedRating?.score === score;

                              return (
                                <Pressable
                                  accessibilityLabel={`${score} Punkte für ${option.name} bei ${criterion.name}`}
                                  accessibilityRole="button"
                                  accessibilityState={{ selected: isSelected }}
                                  key={score}
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
                                  style={({ pressed }) => [
                                    styles.scoreButton,
                                    isMissing && styles.scoreButtonMissing,
                                    isSelected && styles.scoreButtonSelected,
                                    pressed && styles.scoreButtonPressed,
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
                </AppCard>
              );
            })}
          </View>

          <View style={styles.section}>
            <SectionHeader
              eyebrow={ratingProgress.isComplete ? 'Ranking' : 'Vorläufig'}
              title="Ergebnis"
            />
            {!ratingProgress.isComplete ? (
              <AppCard style={styles.incompleteNotice}>
                <View style={styles.noticeIcon}>
                  <Ionicons color={theme.colors.warning} name="alert-circle-outline" size={19} />
                </View>
                <View style={styles.noticeTextGroup}>
                  <Text style={styles.noticeTitle}>Vorläufiges Ergebnis</Text>
                  <Text style={styles.noticeText}>{ratingProgress.missing} Bewertungen fehlen noch.</Text>
                </View>
              </AppCard>
            ) : null}
            <View style={styles.resultList}>
              {results.map((result) => {
                const widthPercent = maxScore > 0 ? Math.max((result.totalScore / maxScore) * 100, 8) : 8;
                return (
                  <AppCard
                    elevated={result.rank === 1}
                    key={result.optionId}
                    style={[styles.resultCard, result.rank === 1 && styles.bestResultCard]}>
                    {result.rank === 1 ? (
                      <View style={styles.recommendationBanner}>
                        <Ionicons color={theme.colors.onPrimary} name="trophy-outline" size={15} />
                        <Text style={styles.recommendationText}>
                          Wahrscheinlich deine beste Wahl
                        </Text>
                      </View>
                    ) : null}
                    <View style={styles.resultTopRow}>
                      <View style={[styles.resultRank, result.rank === 1 && styles.bestResultRank]}>
                        <Text style={[styles.resultRankText, result.rank === 1 && styles.bestResultRankText]}>
                          {result.rank === 1 ? 'Top' : `#${result.rank}`}
                        </Text>
                      </View>
                      <View style={styles.resultContent}>
                        <Text numberOfLines={2} style={styles.resultTitle}>{result.optionName}</Text>
                        <Text style={[styles.resultLabel, result.rank === 1 && styles.bestResultLabel]}>
                          {result.isComplete ? result.label : `${result.label} · ${result.missingRatings} offen`}
                        </Text>
                      </View>
                      <View style={styles.scoreBadge}>
                        <Text style={styles.resultScore}>{result.totalScore}</Text>
                        <Text style={styles.scoreCaption}>Punkte</Text>
                      </View>
                    </View>
                    <View style={styles.scoreTrack}>
                      <View style={[styles.scoreFill, { width: `${widthPercent}%` }]} />
                    </View>
                  </AppCard>
                );
              })}
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
  heroCard: {
    gap: 12,
  },
  heroTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  heroTitleGroup: {
    flex: 1,
    gap: 4,
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
    fontSize: 31,
    fontWeight: '900',
    lineHeight: 36,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    lineHeight: 22,
  },
  progressBox: {
    gap: 10,
  },
  progressTextRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  progressText: {
    color: theme.colors.textSecondary,
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
  },
  progressPercent: {
    color: theme.colors.textStrong,
    fontSize: 13,
    fontWeight: '900',
  },
  progressTrack: {
    backgroundColor: theme.colors.surfaceTint,
    borderRadius: theme.radius.pill,
    height: 9,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    height: '100%',
  },
  nextStepBox: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceTint,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    padding: 11,
  },
  nextStepText: {
    color: theme.colors.textStrong,
    flex: 1,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  section: {
    gap: 12,
  },
  scaleHint: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  scaleHintLine: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    flex: 1,
    height: 4,
  },
  scaleHintText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '900',
  },
  optionCard: {
    gap: 12,
  },
  optionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  optionIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.pill,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  optionTitleGroup: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    color: theme.colors.textStrong,
    fontSize: 18,
    fontWeight: '900',
  },
  optionProgressText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  stateBadge: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceTint,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    minHeight: 32,
    paddingHorizontal: 10,
  },
  stateBadgeDone: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  stateBadgeText: {
    color: theme.colors.warning,
    fontSize: 12,
    fontWeight: '900',
  },
  stateBadgeTextDone: {
    color: theme.colors.onPrimary,
  },
  criteriaList: {
    gap: 8,
  },
  ratingBlock: {
    backgroundColor: theme.colors.surfaceTint,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: 8,
    padding: 10,
  },
  ratingBlockMissing: {
    borderColor: theme.colors.primaryBorder,
  },
  ratingBlockFocused: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primaryBorder,
  },
  ratingHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  criterionTextGroup: {
    flex: 1,
    gap: 3,
  },
  criterionName: {
    color: theme.colors.textStrong,
    fontSize: 15,
    fontWeight: '900',
  },
  weightText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  selectedBadge: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  selectedBadgeText: {
    color: theme.colors.onPrimary,
    fontSize: 13,
    fontWeight: '900',
  },
  nextBadge: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    minHeight: 30,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  nextBadgeText: {
    color: theme.colors.onPrimary,
    fontSize: 12,
    fontWeight: '900',
  },
  missingBadge: {
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primaryBorder,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    minHeight: 30,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  missingBadgeText: {
    color: theme.colors.textStrong,
    fontSize: 12,
    fontWeight: '900',
  },
  scoreButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  scoreButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: theme.touch.min,
  },
  scoreButtonMissing: {
    borderColor: theme.colors.primaryBorder,
  },
  scoreButtonPressed: {
    backgroundColor: theme.colors.surfacePressed,
    transform: [{ scale: 0.97 }],
  },
  scoreButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    ...theme.shadow.card,
  },
  scoreButtonText: {
    color: theme.colors.textStrong,
    fontSize: 16,
    fontWeight: '900',
  },
  scoreButtonTextSelected: {
    color: theme.colors.onPrimary,
  },
  incompleteNotice: {
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primaryBorder,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  noticeIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.pill,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  noticeTextGroup: {
    flex: 1,
    gap: 2,
  },
  noticeTitle: {
    color: theme.colors.textStrong,
    fontSize: 15,
    fontWeight: '900',
  },
  noticeText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  resultList: {
    gap: 10,
  },
  resultCard: {
    gap: 12,
  },
  bestResultCard: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  recommendationBanner: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    flexDirection: 'row',
    gap: 6,
    minHeight: 32,
    paddingHorizontal: 12,
  },
  recommendationText: {
    color: theme.colors.onPrimary,
    fontSize: 12,
    fontWeight: '900',
  },
  resultTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  resultRank: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceTint,
    borderRadius: theme.radius.pill,
    height: 42,
    justifyContent: 'center',
    minWidth: 42,
    paddingHorizontal: 9,
  },
  bestResultRank: {
    backgroundColor: theme.colors.primary,
  },
  resultRankText: {
    color: theme.colors.textStrong,
    fontSize: 15,
    fontWeight: '900',
  },
  bestResultRankText: {
    color: theme.colors.onPrimary,
  },
  resultContent: {
    flex: 1,
    gap: 3,
  },
  resultTitle: {
    color: theme.colors.textStrong,
    fontSize: 17,
    fontWeight: '900',
  },
  resultLabel: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  bestResultLabel: {
    color: theme.colors.textStrong,
    fontWeight: '900',
  },
  scoreBadge: {
    alignItems: 'flex-end',
  },
  resultScore: {
    color: theme.colors.textStrong,
    fontSize: 23,
    fontWeight: '900',
  },
  scoreCaption: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },
  scoreTrack: {
    backgroundColor: theme.colors.surfaceTint,
    borderRadius: theme.radius.pill,
    height: 8,
    overflow: 'hidden',
  },
  scoreFill: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    height: '100%',
  },
  errorBox: {
    backgroundColor: theme.colors.dangerSoft,
    borderColor: theme.colors.dangerBorder,
  },
  errorText: {
    color: theme.colors.dangerStrong,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  messageContent: {
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.screenX,
  },
});
