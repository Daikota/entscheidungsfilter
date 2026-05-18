import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppCard, AppInput, IconButton, SectionHeader, StatPill } from '@/components/ui/app-ui';
import { AppThemeValues, useAppTheme } from '@/constants/theme';
import { useDecisions } from '@/contexts/decision-context';
import { CriterionWeight } from '@/types/decision';
import { hasDuplicateName, hasDuplicateNameInList } from '@/utils/decision-validation';

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
  const theme = useAppTheme();
  const styles = createStyles(theme);
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
      setFeedbackMessage('Optionsname fehlt.');
      return;
    }

    if (hasDuplicateName(trimmedName, draftOptions.map((option) => option.name))) {
      setFeedbackMessage('Option gibt es schon.');
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
      setFeedbackMessage('Kriterienname fehlt.');
      return;
    }

    if (hasDuplicateName(trimmedName, draftCriteria.map((criterion) => criterion.name))) {
      setFeedbackMessage('Kriterium gibt es schon.');
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
      setFeedbackMessage('Titel fehlt.');
      return;
    }

    if (optionNote.trim().length > 0 && optionName.trim().length === 0) {
      setFeedbackMessage('Optionsname fehlt.');
      return;
    }

    const optionsForSave = getOptionsForSave();
    const criteriaForSave = getCriteriaForSave();

    if (hasDuplicateNameInList(optionsForSave.map((option) => option.name))) {
      setFeedbackMessage('Optionen doppelt.');
      return;
    }

    if (hasDuplicateNameInList(criteriaForSave.map((criterion) => criterion.name))) {
      setFeedbackMessage('Kriterien doppelt.');
      return;
    }

    setIsSaving(true);
    setFeedbackMessage('');

    try {
      const decision = await addDecisionWithDetails({
        title: trimmedTitle,
        description: trimmedDescription,
        options: optionsForSave.map((option) => ({
          name: option.name,
          note: option.note,
        })),
        criteria: criteriaForSave.map((criterion) => ({
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
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 118, 138) }]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.kicker}>Neuer Vergleich</Text>
          <Text style={styles.title}>Alles Wichtige in einem Schritt.</Text>
          <View style={styles.progressRow}>
            <StatPill icon="git-compare-outline" label="Optionen" value={`${draftOptions.length}`} />
            <StatPill icon="options-outline" label="Kriterien" value={`${draftCriteria.length}`} />
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader eyebrow="Pflicht" title="Worum geht es?" />
          <AppInput
            accessibilityLabel="Titel der Entscheidung"
            hasError={feedbackMessage.length > 0 && title.trim().length === 0}
            onChangeText={setTitle}
            placeholder="z. B. Neuer Laptop"
            returnKeyType="next"
            value={title}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader
            action={
              <AppButton
                icon={isDescriptionVisible ? 'remove' : 'add'}
                onPress={() => setIsDescriptionVisible((currentValue) => !currentValue)}
                title={isDescriptionVisible ? 'Weniger' : 'Beschreibung'}
                variant="ghost"
              />
            }
            eyebrow="Optional"
            title="Kontext"
          />
          {isDescriptionVisible ? (
            <AppInput
              accessibilityLabel="Beschreibung optional"
              multiline
              onChangeText={setDescription}
              placeholder="Was ist wichtig, bevor du bewertest?"
              value={description}
            />
          ) : null}
        </View>

        <View style={styles.section}>
          <SectionHeader eyebrow="Sammeln" title="Optionen" />
          <AppCard style={styles.formCard}>
            <AppInput
              accessibilityLabel="Name der Option"
              blurOnSubmit={false}
              onChangeText={setOptionName}
              onSubmitEditing={addDraftOption}
              placeholder="Option hinzufügen"
              returnKeyType="done"
              value={optionName}
            />
            {isOptionNoteVisible ? (
              <AppInput
                accessibilityLabel="Notiz zur Option optional"
                multiline
                onChangeText={setOptionNote}
                placeholder="Notiz optional"
                style={styles.compactTextArea}
                value={optionNote}
              />
            ) : (
              <AppButton
                icon="document-text-outline"
                onPress={() => setIsOptionNoteVisible(true)}
                title="Notiz"
                variant="ghost"
              />
            )}
            <AppButton icon="add" onPress={addDraftOption} title="Option übernehmen" variant="secondary" />
          </AppCard>

          {draftOptions.length > 0 ? (
            <View style={styles.itemList}>
              {draftOptions.map((option) => (
                <AppCard key={option.id} style={styles.itemCard}>
                  <View style={styles.itemIcon}>
                    <Ionicons color={theme.colors.primary} name="radio-button-on-outline" size={18} />
                  </View>
                  <View style={styles.itemContent}>
                    <Text numberOfLines={2} style={styles.itemTitle}>{option.name}</Text>
                    {option.note.length > 0 ? <Text style={styles.itemText}>{option.note}</Text> : null}
                  </View>
                  <IconButton
                    icon="trash-outline"
                    label={`Option ${option.name} löschen`}
                    onPress={() =>
                      setDraftOptions((currentOptions) =>
                        currentOptions.filter((currentOption) => currentOption.id !== option.id)
                      )
                    }
                    variant="danger"
                  />
                </AppCard>
              ))}
            </View>
          ) : (
            <Text style={styles.helperText}>Optionen kannst du auch später ergänzen.</Text>
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader eyebrow="Bewerten nach" title="Kriterien" />
          <AppCard style={styles.formCard}>
            <AppInput
              accessibilityLabel="Name des Kriteriums"
              blurOnSubmit={false}
              onChangeText={setCriterionName}
              onSubmitEditing={addDraftCriterion}
              placeholder="Kriterium hinzufügen"
              returnKeyType="done"
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
            <AppButton icon="add" onPress={addDraftCriterion} title="Kriterium übernehmen" variant="secondary" />
          </AppCard>

          {draftCriteria.length > 0 ? (
            <View style={styles.itemList}>
              {draftCriteria.map((criterion) => (
                <AppCard key={criterion.id} style={styles.itemCard}>
                  <View style={styles.itemIcon}>
                    <Ionicons color={theme.colors.primary} name="speedometer-outline" size={18} />
                  </View>
                  <View style={styles.itemContent}>
                    <Text numberOfLines={2} style={styles.itemTitle}>{criterion.name}</Text>
                    <Text style={styles.itemText}>Gewichtung {criterion.weight}</Text>
                  </View>
                  <IconButton
                    icon="trash-outline"
                    label={`Kriterium ${criterion.name} löschen`}
                    onPress={() =>
                      setDraftCriteria((currentCriteria) =>
                        currentCriteria.filter((currentCriterion) => currentCriterion.id !== criterion.id)
                      )
                    }
                    variant="danger"
                  />
                </AppCard>
              ))}
            </View>
          ) : (
            <Text style={styles.helperText}>Kriterien bestimmen später die Ergebnisqualität.</Text>
          )}

          {feedbackMessage.length > 0 ? (
            <Text accessibilityRole="alert" style={styles.errorText}>
              {feedbackMessage}
            </Text>
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.actionBar, { paddingBottom: Math.max(insets.bottom + 14, 30) }]}>
        <AppButton
          disabled={isSaving}
          icon="checkmark"
          onPress={handleSave}
          style={styles.saveButton}
          title={isSaving ? 'Speichere...' : 'Entscheidung speichern'}
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
  content: {
    gap: 24,
    paddingHorizontal: theme.spacing.screenX,
    paddingTop: 32,
  },
  header: {
    gap: 10,
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
  progressRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
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
  helperText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    color: theme.colors.dangerStrong,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
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
  saveButton: {
    width: '100%',
  },
});
