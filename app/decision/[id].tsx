import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppCard, AppInput, EmptyState, IconButton, SectionHeader, StatPill } from '@/components/ui/app-ui';
import { AppThemeValues, useAppTheme } from '@/constants/theme';
import { useDecisions } from '@/contexts/decision-context';
import { CriterionWeight } from '@/types/decision';

const criterionWeights: CriterionWeight[] = [1, 2, 3];

export default function DecisionDetailScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    decisions,
    databaseError,
    isDatabaseReady,
    addOption,
    deleteOption,
    addCriterion,
    deleteCriterion,
  } = useDecisions();
  const insets = useSafeAreaInsets();
  const decision = decisions.find((currentDecision) => currentDecision.id === id);

  const [isOptionFormVisible, setIsOptionFormVisible] = useState(false);
  const [optionName, setOptionName] = useState('');
  const [optionNote, setOptionNote] = useState('');
  const [optionError, setOptionError] = useState('');
  const [isCriterionFormVisible, setIsCriterionFormVisible] = useState(false);
  const [criterionName, setCriterionName] = useState('');
  const [criterionWeight, setCriterionWeight] = useState<CriterionWeight>(2);
  const [criterionError, setCriterionError] = useState('');

  if (!isDatabaseReady) {
    return (
      <View style={styles.screen}>
        <View style={styles.messageContent}>
          <EmptyState icon="sync-outline" title="Entscheidung wird geladen" />
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
            message="Die lokale Datenbank konnte diesen Eintrag nicht laden."
          />
          <Link href="/" asChild>
            <AppButton icon="home-outline" title="Zur Startseite" />
          </Link>
        </View>
      </View>
    );
  }

  const handleAddOption = async () => {
    const trimmedName = optionName.trim();
    const trimmedNote = optionNote.trim();

    if (trimmedName.length === 0) {
      setOptionError('Bitte gib einen Namen für die Option ein.');
      return;
    }

    try {
      await addOption({
        decisionId: decision.id,
        name: trimmedName,
        note: trimmedNote,
      });
      setOptionName('');
      setOptionNote('');
      setOptionError('');
      setIsOptionFormVisible(false);
    } catch (error) {
      console.error('Failed to save option', error);
      setOptionError('Die Option konnte nicht gespeichert werden.');
    }
  };

  const handleAddCriterion = async () => {
    const trimmedName = criterionName.trim();

    if (trimmedName.length === 0) {
      setCriterionError('Bitte gib einen Namen für das Kriterium ein.');
      return;
    }

    try {
      await addCriterion({
        decisionId: decision.id,
        name: trimmedName,
        weight: criterionWeight,
      });
      setCriterionName('');
      setCriterionWeight(2);
      setCriterionError('');
      setIsCriterionFormVisible(false);
    } catch (error) {
      console.error('Failed to save criterion', error);
      setCriterionError('Das Kriterium konnte nicht gespeichert werden.');
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 120, 140) }]}
        keyboardShouldPersistTaps="handled">
        <AppCard elevated style={styles.heroCard}>
          <Text style={styles.kicker}>Entscheidung</Text>
          <Text style={styles.title}>{decision.title}</Text>
          {decision.description.length > 0 ? (
            <Text style={styles.description}>{decision.description}</Text>
          ) : null}
          <View style={styles.statsRow}>
            <StatPill icon="list-outline" label="Optionen" value={`${decision.options.length}`} emphasis />
            <StatPill icon="options-outline" label="Kriterien" value={`${decision.criteria.length}`} />
          </View>
        </AppCard>

        <View style={styles.section}>
          <SectionHeader
            action={
              <AppButton
                icon={isOptionFormVisible ? 'close' : 'add'}
                onPress={() => {
                  setIsOptionFormVisible((currentValue) => !currentValue);
                  setOptionError('');
                }}
                title={isOptionFormVisible ? 'Schließen' : 'Option'}
                variant="secondary"
              />
            }
            eyebrow="Vergleichen"
            title="Optionen"
          />

          {isOptionFormVisible ? (
            <AppCard style={styles.formCard}>
              <AppInput
                accessibilityLabel="Name der Option"
                hasError={optionError.length > 0}
                onChangeText={setOptionName}
                placeholder="Option"
                value={optionName}
              />
              <AppInput
                accessibilityLabel="Notiz optional"
                multiline
                onChangeText={setOptionNote}
                placeholder="Notiz optional"
                style={styles.compactTextArea}
                value={optionNote}
              />
              {optionError.length > 0 ? (
                <Text accessibilityRole="alert" style={styles.errorText}>
                  {optionError}
                </Text>
              ) : null}
              <AppButton icon="checkmark" onPress={handleAddOption} title="Speichern" />
            </AppCard>
          ) : null}

          {decision.options.length === 0 ? (
            <EmptyState
              icon="radio-button-off-outline"
              title="Noch keine Optionen"
              message="Füge Alternativen hinzu, die du gegeneinander bewerten willst."
            />
          ) : (
            <View style={styles.itemList}>
              {decision.options.map((option) => (
                <AppCard key={option.id} style={styles.itemCard}>
                  <View style={styles.itemIcon}>
                    <Ionicons color={theme.colors.primary} name="radio-button-on-outline" size={18} />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{option.name}</Text>
                    {option.note.length > 0 ? <Text style={styles.itemText}>{option.note}</Text> : null}
                  </View>
                  <IconButton
                    icon="trash-outline"
                    label={`Option ${option.name} löschen`}
                    onPress={() => {
                      deleteOption(decision.id, option.id).catch((error) => {
                        console.error('Failed to delete option', error);
                      });
                    }}
                    variant="danger"
                  />
                </AppCard>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader
            action={
              <AppButton
                icon={isCriterionFormVisible ? 'close' : 'add'}
                onPress={() => {
                  setIsCriterionFormVisible((currentValue) => !currentValue);
                  setCriterionError('');
                }}
                title={isCriterionFormVisible ? 'Schließen' : 'Kriterium'}
                variant="secondary"
              />
            }
            eyebrow="Bewerten"
            title="Kriterien"
          />

          {isCriterionFormVisible ? (
            <AppCard style={styles.formCard}>
              <AppInput
                accessibilityLabel="Name des Kriteriums"
                hasError={criterionError.length > 0}
                onChangeText={setCriterionName}
                placeholder="Kriterium"
                value={criterionName}
              />
              <View style={styles.weightGroup}>
                <Text style={styles.weightLabel}>Gewichtung</Text>
                <View style={styles.weightButtons}>
                  {criterionWeights.map((weight) => (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected: criterionWeight === weight }}
                      key={weight}
                      onPress={() => setCriterionWeight(weight)}
                      style={({ pressed }) => [
                        styles.weightButton,
                        criterionWeight === weight && styles.weightButtonSelected,
                        pressed && styles.weightButtonPressed,
                      ]}>
                      <Text
                        style={[
                          styles.weightButtonText,
                          criterionWeight === weight && styles.weightButtonTextSelected,
                        ]}>
                        {weight}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              {criterionError.length > 0 ? (
                <Text accessibilityRole="alert" style={styles.errorText}>
                  {criterionError}
                </Text>
              ) : null}
              <AppButton icon="checkmark" onPress={handleAddCriterion} title="Speichern" />
            </AppCard>
          ) : null}

          {decision.criteria.length === 0 ? (
            <EmptyState
              icon="speedometer-outline"
              title="Noch keine Kriterien"
              message="Lege fest, wonach die Optionen bewertet werden."
            />
          ) : (
            <View style={styles.itemList}>
              {decision.criteria.map((criterion) => (
                <AppCard key={criterion.id} style={styles.itemCard}>
                  <View style={styles.itemIcon}>
                    <Ionicons color={theme.colors.primary} name="speedometer-outline" size={18} />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{criterion.name}</Text>
                    <Text style={styles.itemText}>Gewichtung {criterion.weight}</Text>
                  </View>
                  <IconButton
                    icon="trash-outline"
                    label={`Kriterium ${criterion.name} löschen`}
                    onPress={() => {
                      deleteCriterion(decision.id, criterion.id).catch((error) => {
                        console.error('Failed to delete criterion', error);
                      });
                    }}
                    variant="danger"
                  />
                </AppCard>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.actionBar, { paddingBottom: Math.max(insets.bottom + 14, 30) }]}>
        <Link href={{ pathname: '/decision/[id]/ratings', params: { id: decision.id } }} asChild>
          <AppButton icon="analytics-outline" title="Bewerten" />
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
  content: {
    gap: 24,
    paddingHorizontal: theme.spacing.screenX,
    paddingTop: 32,
  },
  heroCard: {
    gap: 11,
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
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 36,
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    lineHeight: 23,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 2,
  },
  section: {
    gap: 12,
  },
  formCard: {
    gap: 12,
  },
  compactTextArea: {
    minHeight: 86,
  },
  errorText: {
    color: theme.colors.dangerStrong,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  itemList: {
    gap: 9,
  },
  itemCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  itemIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  itemContent: {
    flex: 1,
    gap: 3,
  },
  itemTitle: {
    color: theme.colors.textStrong,
    fontSize: 16,
    fontWeight: '900',
  },
  itemText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  weightGroup: {
    gap: 8,
  },
  weightLabel: {
    color: theme.colors.textStrong,
    fontSize: 14,
    fontWeight: '900',
  },
  weightButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  weightButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceTint,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: theme.touch.min,
  },
  weightButtonPressed: {
    backgroundColor: theme.colors.surfacePressed,
  },
  weightButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  weightButtonText: {
    color: theme.colors.textStrong,
    fontSize: 16,
    fontWeight: '900',
  },
  weightButtonTextSelected: {
    color: theme.colors.onPrimary,
  },
  actionBar: {
    backgroundColor: theme.colors.surface,
    borderTopColor: theme.colors.borderSoft,
    borderTopWidth: 1,
    paddingHorizontal: theme.spacing.screenX,
    paddingTop: 14,
    ...theme.shadow.footer,
  },
  messageContent: {
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.screenX,
  },
});
