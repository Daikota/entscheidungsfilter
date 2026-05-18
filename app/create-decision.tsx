import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppTheme } from '@/constants/theme';
import { useDecisions } from '@/contexts/decision-context';
import { CriterionWeight } from '@/types/decision';

type DraftOption = {
  id: string;
  name: string;
  note: string;
};

type DraftCriterion = {
  id: string;
  name: string;
  weight: CriterionWeight;
};

const criterionWeights: CriterionWeight[] = [1, 2, 3];

const createDraftId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export default function CreateDecisionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addDecisionWithDetails } = useDecisions();
  const [title, setTitle] = useState('');
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);
  const [description, setDescription] = useState('');
  const [draftOptions, setDraftOptions] = useState<DraftOption[]>([]);
  const [optionName, setOptionName] = useState('');
  const [isOptionNoteVisible, setIsOptionNoteVisible] = useState(false);
  const [optionNote, setOptionNote] = useState('');
  const [draftCriteria, setDraftCriteria] = useState<DraftCriterion[]>([]);
  const [criterionName, setCriterionName] = useState('');
  const [criterionWeight, setCriterionWeight] = useState<CriterionWeight>(2);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const addDraftOption = () => {
    const trimmedName = optionName.trim();
    const trimmedNote = optionNote.trim();

    if (trimmedName.length === 0) {
      setFeedbackMessage('Bitte gib einen Namen für die Option ein.');
      return;
    }

    setDraftOptions((currentOptions) => [
      ...currentOptions,
      {
        id: createDraftId('draft-option'),
        name: trimmedName,
        note: trimmedNote,
      },
    ]);
    setOptionName('');
    setOptionNote('');
    setIsOptionNoteVisible(false);
    setFeedbackMessage('');
  };

  const addDraftCriterion = () => {
    const trimmedName = criterionName.trim();

    if (trimmedName.length === 0) {
      setFeedbackMessage('Bitte gib einen Namen für das Kriterium ein.');
      return;
    }

    setDraftCriteria((currentCriteria) => [
      ...currentCriteria,
      {
        id: createDraftId('draft-criterion'),
        name: trimmedName,
        weight: criterionWeight,
      },
    ]);
    setCriterionName('');
    setCriterionWeight(2);
    setFeedbackMessage('');
  };

  const getOptionsForSave = () => {
    const trimmedName = optionName.trim();
    const trimmedNote = optionNote.trim();

    if (trimmedName.length === 0) {
      return draftOptions;
    }

    return [
      ...draftOptions,
      {
        id: createDraftId('draft-option'),
        name: trimmedName,
        note: trimmedNote,
      },
    ];
  };

  const getCriteriaForSave = () => {
    const trimmedName = criterionName.trim();

    if (trimmedName.length === 0) {
      return draftCriteria;
    }

    return [
      ...draftCriteria,
      {
        id: createDraftId('draft-criterion'),
        name: trimmedName,
        weight: criterionWeight,
      },
    ];
  };

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (trimmedTitle.length === 0) {
      setFeedbackMessage('Bitte gib einen Titel ein.');
      return;
    }

    if (optionNote.trim().length > 0 && optionName.trim().length === 0) {
      setFeedbackMessage('Bitte gib einen Namen für die Option mit Notiz ein.');
      return;
    }

    setIsSaving(true);
    setFeedbackMessage('');

    try {
      const decision = await addDecisionWithDetails({
        title: trimmedTitle,
        description: trimmedDescription,
        options: getOptionsForSave().map((option) => ({
          name: option.name,
          note: option.note,
        })),
        criteria: getCriteriaForSave().map((criterion) => ({
          name: criterion.name,
          weight: criterion.weight,
        })),
      });

      router.replace({ pathname: '/decision/[id]', params: { id: decision.id } });
    } catch (error) {
      console.error('Failed to save decision workflow', error);
      setFeedbackMessage('Die Entscheidung konnte nicht gespeichert werden.');
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 120, 136) }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Neue Entscheidung</Text>
          <Text style={styles.subtitle}>Lege die Entscheidung samt ersten Optionen und Kriterien an.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Titel</Text>
          <TextInput
            accessibilityLabel="Titel der Entscheidung"
            onChangeText={setTitle}
            placeholder="Titel der Entscheidung"
            placeholderTextColor={AppTheme.colors.textMuted}
            style={[styles.input, feedbackMessage.length > 0 && title.trim().length === 0 && styles.inputError]}
            value={title}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>2. Beschreibung</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setIsDescriptionVisible((currentValue) => !currentValue)}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}>
              <Text style={styles.secondaryButtonText}>
                {isDescriptionVisible ? 'Ausblenden' : 'Beschreibung hinzufügen'}
              </Text>
            </Pressable>
          </View>
          {isDescriptionVisible ? (
            <TextInput
              accessibilityLabel="Beschreibung optional"
              multiline
              onChangeText={setDescription}
              placeholder="Beschreibung optional"
              placeholderTextColor={AppTheme.colors.textMuted}
              style={[styles.input, styles.textArea]}
              textAlignVertical="top"
              value={description}
            />
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Optionen</Text>
          <View style={styles.formCard}>
            <TextInput
              accessibilityLabel="Name der Option"
              onChangeText={setOptionName}
              placeholder="Name der Option"
              placeholderTextColor={AppTheme.colors.textMuted}
              style={styles.input}
              value={optionName}
            />
            {isOptionNoteVisible ? (
              <TextInput
                accessibilityLabel="Notiz zur Option optional"
                multiline
                onChangeText={setOptionNote}
                placeholder="Notiz optional"
                placeholderTextColor={AppTheme.colors.textMuted}
                style={[styles.input, styles.textAreaSmall]}
                textAlignVertical="top"
                value={optionNote}
              />
            ) : (
              <Pressable
                accessibilityRole="button"
                onPress={() => setIsOptionNoteVisible(true)}
                style={({ pressed }) => [styles.ghostButton, pressed && styles.ghostButtonPressed]}>
                <Text style={styles.ghostButtonText}>Notiz hinzufügen</Text>
              </Pressable>
            )}
            <Pressable
              accessibilityRole="button"
              onPress={addDraftOption}
              style={({ pressed }) => [styles.secondaryButtonWide, pressed && styles.secondaryButtonPressed]}>
              <Text style={styles.secondaryButtonText}>+ Option hinzufügen</Text>
            </Pressable>
          </View>

          {draftOptions.length > 0 ? (
            <View style={styles.itemList}>
              {draftOptions.map((option) => (
                <View key={option.id} style={styles.itemCard}>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{option.name}</Text>
                    {option.note.length > 0 ? <Text style={styles.itemText}>{option.note}</Text> : null}
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Option ${option.name} löschen`}
                    onPress={() =>
                      setDraftOptions((currentOptions) =>
                        currentOptions.filter((currentOption) => currentOption.id !== option.id)
                      )
                    }
                    style={({ pressed }) => [styles.deleteButton, pressed && styles.deleteButtonPressed]}>
                    <Text style={styles.deleteButtonText}>Löschen</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.helperText}>Du kannst Optionen jetzt oder später auf der Detailseite hinzufügen.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Kriterien</Text>
          <View style={styles.formCard}>
            <TextInput
              accessibilityLabel="Name des Kriteriums"
              onChangeText={setCriterionName}
              placeholder="Name des Kriteriums"
              placeholderTextColor={AppTheme.colors.textMuted}
              style={styles.input}
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
            <Pressable
              accessibilityRole="button"
              onPress={addDraftCriterion}
              style={({ pressed }) => [styles.secondaryButtonWide, pressed && styles.secondaryButtonPressed]}>
              <Text style={styles.secondaryButtonText}>+ Kriterium hinzufügen</Text>
            </Pressable>
          </View>

          {draftCriteria.length > 0 ? (
            <View style={styles.itemList}>
              {draftCriteria.map((criterion) => (
                <View key={criterion.id} style={styles.itemCard}>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{criterion.name}</Text>
                    <Text style={styles.itemText}>Gewichtung: {criterion.weight}</Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Kriterium ${criterion.name} löschen`}
                    onPress={() =>
                      setDraftCriteria((currentCriteria) =>
                        currentCriteria.filter((currentCriterion) => currentCriterion.id !== criterion.id)
                      )
                    }
                    style={({ pressed }) => [styles.deleteButton, pressed && styles.deleteButtonPressed]}>
                    <Text style={styles.deleteButtonText}>Löschen</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.helperText}>Kriterien lassen sich auch später ergänzen.</Text>
          )}

          {feedbackMessage.length > 0 ? (
            <Text accessibilityRole="alert" style={styles.errorText}>
              {feedbackMessage}
            </Text>
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.actionBar, { paddingBottom: Math.max(insets.bottom + 12, 28) }]}>
        <Pressable
          accessibilityState={{ disabled: isSaving }}
          disabled={isSaving}
          accessibilityRole="button"
          onPress={handleSave}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && !isSaving && styles.primaryButtonPressed,
            isSaving && styles.primaryButtonDisabled,
          ]}>
          <Text style={styles.primaryButtonText}>{isSaving ? 'Speichern...' : 'Entscheidung speichern'}</Text>
        </Pressable>
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
    gap: 28,
    paddingHorizontal: AppTheme.spacing.screenX,
    paddingTop: 32,
  },
  header: {
    gap: 8,
  },
  title: {
    color: AppTheme.colors.text,
    fontSize: 30,
    fontWeight: '700',
  },
  subtitle: {
    color: AppTheme.colors.textSecondary,
    fontSize: 16,
    lineHeight: 23,
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
    fontSize: 21,
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
    minHeight: 54,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputError: {
    borderColor: AppTheme.colors.danger,
  },
  textArea: {
    minHeight: 120,
  },
  textAreaSmall: {
    minHeight: 88,
  },
  helperText: {
    color: AppTheme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    color: AppTheme.colors.danger,
    fontSize: 15,
    lineHeight: 21,
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
  secondaryButtonWide: {
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
  ghostButton: {
    alignItems: 'center',
    borderColor: AppTheme.colors.border,
    borderRadius: AppTheme.radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: AppTheme.touch.min,
  },
  ghostButtonPressed: {
    backgroundColor: AppTheme.colors.surfaceMuted,
  },
  ghostButtonText: {
    color: AppTheme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
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
  primaryButtonDisabled: {
    backgroundColor: AppTheme.colors.primaryDisabled,
  },
  primaryButtonText: {
    color: AppTheme.colors.onPrimary,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
});
