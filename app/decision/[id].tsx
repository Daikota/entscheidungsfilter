import { Link, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppTheme } from '@/constants/theme';
import { useDecisions } from '@/contexts/decision-context';
import { CriterionWeight } from '@/types/decision';

const criterionWeights: CriterionWeight[] = [1, 2, 3];

export default function DecisionDetailScreen() {
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
        <View style={styles.notFoundContent}>
          <Text style={styles.notFoundTitle}>Entscheidung wird geladen</Text>
        </View>
      </View>
    );
  }

  if (databaseError.length > 0) {
    return (
      <View style={styles.screen}>
        <View style={styles.notFoundContent}>
          <Text style={styles.notFoundTitle}>{databaseError}</Text>
        </View>
      </View>
    );
  }

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
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 120, 136) }]}>
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
              onPress={() => {
                setIsOptionFormVisible((currentValue) => !currentValue);
                setOptionError('');
              }}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}>
              <Text style={styles.secondaryButtonText}>
                {isOptionFormVisible ? 'Abbrechen' : 'Option hinzufügen'}
              </Text>
            </Pressable>
          </View>

          {isOptionFormVisible ? (
            <View style={styles.formCard}>
              <TextInput
                accessibilityLabel="Name der Option"
                onChangeText={setOptionName}
                placeholder="Name der Option"
                placeholderTextColor={AppTheme.colors.textMuted}
                style={[styles.input, optionError.length > 0 && styles.inputError]}
                value={optionName}
              />
              <TextInput
                accessibilityLabel="Notiz optional"
                multiline
                onChangeText={setOptionNote}
                placeholder="Notiz optional"
                placeholderTextColor={AppTheme.colors.textMuted}
                style={[styles.input, styles.textArea]}
                textAlignVertical="top"
                value={optionNote}
              />
              {optionError.length > 0 ? (
                <Text accessibilityRole="alert" style={styles.errorText}>
                  {optionError}
                </Text>
              ) : null}
              <Pressable
                accessibilityRole="button"
                onPress={handleAddOption}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}>
                <Text style={styles.primaryButtonText}>Option speichern</Text>
              </Pressable>
            </View>
          ) : null}

          {decision.options.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Noch keine Optionen</Text>
              <Text style={styles.emptyText}>Füge Optionen hinzu, zwischen denen du entscheiden willst.</Text>
            </View>
          ) : (
            <View style={styles.itemList}>
              {decision.options.map((option) => (
                <View key={option.id} style={styles.itemCard}>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{option.name}</Text>
                    {option.note.length > 0 ? <Text style={styles.itemText}>{option.note}</Text> : null}
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Option ${option.name} löschen`}
                    onPress={() => {
                      deleteOption(decision.id, option.id).catch((error) => {
                        console.error('Failed to delete option', error);
                      });
                    }}
                    style={({ pressed }) => [styles.deleteButton, pressed && styles.deleteButtonPressed]}>
                    <Text style={styles.deleteButtonText}>Löschen</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Kriterien</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setIsCriterionFormVisible((currentValue) => !currentValue);
                setCriterionError('');
              }}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}>
              <Text style={styles.secondaryButtonText}>
                {isCriterionFormVisible ? 'Abbrechen' : 'Kriterium hinzufügen'}
              </Text>
            </Pressable>
          </View>

          {isCriterionFormVisible ? (
            <View style={styles.formCard}>
              <TextInput
                accessibilityLabel="Name des Kriteriums"
                onChangeText={setCriterionName}
                placeholder="Name des Kriteriums"
                placeholderTextColor={AppTheme.colors.textMuted}
                style={[styles.input, criterionError.length > 0 && styles.inputError]}
                value={criterionName}
              />
              <View style={styles.weightGroup}>
                <Text style={styles.weightLabel}>Gewichtung</Text>
                <View style={styles.weightButtons}>
                  {criterionWeights.map((weight) => (
                    <Pressable
                      key={weight}
                      accessibilityRole="button"
                      accessibilityState={{ selected: criterionWeight === weight }}
                      onPress={() => setCriterionWeight(weight)}
                      style={[
                        styles.weightButton,
                        criterionWeight === weight && styles.weightButtonSelected,
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
              <Pressable
                accessibilityRole="button"
                onPress={handleAddCriterion}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}>
                <Text style={styles.primaryButtonText}>Kriterium speichern</Text>
              </Pressable>
            </View>
          ) : null}

          {decision.criteria.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Noch keine Kriterien</Text>
              <Text style={styles.emptyText}>Füge Kriterien hinzu, nach denen du bewerten willst.</Text>
            </View>
          ) : (
            <View style={styles.itemList}>
              {decision.criteria.map((criterion) => (
                <View key={criterion.id} style={styles.itemCard}>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{criterion.name}</Text>
                    <Text style={styles.itemText}>Gewichtung: {criterion.weight}</Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Kriterium ${criterion.name} löschen`}
                    onPress={() => {
                      deleteCriterion(decision.id, criterion.id).catch((error) => {
                        console.error('Failed to delete criterion', error);
                      });
                    }}
                    style={({ pressed }) => [styles.deleteButton, pressed && styles.deleteButtonPressed]}>
                    <Text style={styles.deleteButtonText}>Löschen</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.actionBar, { paddingBottom: Math.max(insets.bottom + 12, 28) }]}>
        <Link href={{ pathname: '/decision/[id]/ratings', params: { id: decision.id } }} asChild>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}>
            <Text style={styles.primaryButtonText}>Bewertung starten / Ergebnisse anzeigen</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppTheme.colors.surface,
  },
  content: {
    gap: 24,
    paddingHorizontal: AppTheme.spacing.screenX,
    paddingTop: 32,
  },
  header: {
    gap: 12,
  },
  title: {
    color: AppTheme.colors.text,
    fontSize: 30,
    fontWeight: '700',
  },
  description: {
    color: AppTheme.colors.textSecondary,
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
    color: AppTheme.colors.text,
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: AppTheme.colors.surfaceRaised,
    borderColor: AppTheme.colors.border,
    borderRadius: AppTheme.radius.sm,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  input: {
    backgroundColor: AppTheme.colors.surfaceRaised,
    borderColor: AppTheme.colors.border,
    borderRadius: AppTheme.radius.sm,
    borderWidth: 1,
    color: AppTheme.colors.text,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputError: {
    borderColor: AppTheme.colors.danger,
  },
  textArea: {
    minHeight: 96,
  },
  errorText: {
    color: AppTheme.colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: AppTheme.colors.surfaceRaised,
    borderColor: AppTheme.colors.border,
    borderRadius: AppTheme.radius.sm,
    borderWidth: 1,
    gap: 8,
    justifyContent: 'center',
    minHeight: 132,
    padding: 20,
  },
  emptyTitle: {
    color: AppTheme.colors.textStrong,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyText: {
    color: AppTheme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  itemList: {
    gap: 10,
  },
  itemCard: {
    alignItems: 'center',
    backgroundColor: AppTheme.colors.surfaceRaised,
    borderColor: AppTheme.colors.border,
    borderRadius: AppTheme.radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  itemContent: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    color: AppTheme.colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  itemText: {
    color: AppTheme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: AppTheme.colors.primary,
    borderRadius: AppTheme.radius.sm,
    justifyContent: 'center',
    minHeight: AppTheme.touch.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  primaryButtonPressed: {
    backgroundColor: AppTheme.colors.primaryPressed,
  },
  primaryButtonText: {
    color: AppTheme.colors.onPrimary,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: AppTheme.colors.primarySoft,
    borderColor: AppTheme.colors.primaryBorder,
    borderRadius: AppTheme.radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: AppTheme.touch.min,
    paddingHorizontal: 12,
  },
  secondaryButtonPressed: {
    backgroundColor: AppTheme.colors.primarySoftPressed,
  },
  secondaryButtonText: {
    color: AppTheme.colors.info,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: AppTheme.colors.dangerSoft,
    borderColor: AppTheme.colors.dangerBorder,
    borderRadius: AppTheme.radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: AppTheme.touch.min,
    paddingHorizontal: 12,
  },
  deleteButtonPressed: {
    backgroundColor: AppTheme.colors.dangerSoftPressed,
  },
  deleteButtonText: {
    color: AppTheme.colors.dangerStrong,
    fontSize: 14,
    fontWeight: '700',
  },
  weightGroup: {
    gap: 8,
  },
  weightLabel: {
    color: AppTheme.colors.textStrong,
    fontSize: 15,
    fontWeight: '700',
  },
  weightButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  weightButton: {
    alignItems: 'center',
    backgroundColor: AppTheme.colors.surfaceRaised,
    borderColor: AppTheme.colors.border,
    borderRadius: AppTheme.radius.sm,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: AppTheme.touch.min,
  },
  weightButtonSelected: {
    backgroundColor: AppTheme.colors.primary,
    borderColor: AppTheme.colors.primary,
  },
  weightButtonText: {
    color: AppTheme.colors.textStrong,
    fontSize: 16,
    fontWeight: '700',
  },
  weightButtonTextSelected: {
    color: AppTheme.colors.onPrimary,
  },
  actionBar: {
    backgroundColor: AppTheme.colors.surface,
    borderTopColor: AppTheme.colors.borderSoft,
    borderTopWidth: 1,
    paddingHorizontal: AppTheme.spacing.screenX,
    paddingTop: 16,
  },
  notFoundContent: {
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    paddingHorizontal: AppTheme.spacing.screenX,
  },
  notFoundTitle: {
    color: AppTheme.colors.text,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  notFoundText: {
    color: AppTheme.colors.textSecondary,
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
  },
});
