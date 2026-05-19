import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppCard, AppInput, EmptyState, IconButton, SectionHeader, StatPill } from '@/components/ui/app-ui';
import { AppThemeValues, useAppTheme } from '@/constants/theme';
import { useDecisions } from '@/contexts/decision-context';
import { CriterionWeight } from '@/types/decision';
import { canStartRating, hasDuplicateName } from '@/utils/decision-validation';

const criterionWeights: CriterionWeight[] = [1, 2, 3];

export default function DecisionDetailScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    decisions,
    databaseError,
    isDatabaseReady,
    addOption,
    updateDecision,
    deleteDecision,
    updateOption,
    deleteOption,
    addCriterion,
    updateCriterion,
    deleteCriterion,
  } = useDecisions();
  const insets = useSafeAreaInsets();
  const decision = decisions.find((currentDecision) => currentDecision.id === id);

  const [isDecisionEditVisible, setIsDecisionEditVisible] = useState(false);
  const [editDecisionTitle, setEditDecisionTitle] = useState('');
  const [editDecisionDescription, setEditDecisionDescription] = useState('');
  const [decisionError, setDecisionError] = useState('');
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [ratingStartError, setRatingStartError] = useState('');
  const [isOptionFormVisible, setIsOptionFormVisible] = useState(false);
  const [optionName, setOptionName] = useState('');
  const [optionNote, setOptionNote] = useState('');
  const [optionError, setOptionError] = useState('');
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [editOptionName, setEditOptionName] = useState('');
  const [editOptionNote, setEditOptionNote] = useState('');
  const [editOptionError, setEditOptionError] = useState('');
  const [isCriterionFormVisible, setIsCriterionFormVisible] = useState(false);
  const [criterionName, setCriterionName] = useState('');
  const [criterionWeight, setCriterionWeight] = useState<CriterionWeight>(2);
  const [criterionError, setCriterionError] = useState('');
  const [editingCriterionId, setEditingCriterionId] = useState<string | null>(null);
  const [editCriterionName, setEditCriterionName] = useState('');
  const [editCriterionWeight, setEditCriterionWeight] = useState<CriterionWeight>(2);
  const [editCriterionError, setEditCriterionError] = useState('');

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
            message="Dieser Eintrag ist nicht mehr verfügbar."
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
      setOptionError('Optionsname fehlt.');
      return;
    }

    if (hasDuplicateName(trimmedName, decision.options.map((option) => option.name))) {
      setOptionError('Option gibt es schon.');
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
    } catch (error) {
      console.error('Failed to save option', error);
      setOptionError('Die Option konnte nicht gespeichert werden.');
    }
  };

  const openDecisionEdit = () => {
    setEditDecisionTitle(decision.title);
    setEditDecisionDescription(decision.description);
    setDecisionError('');
    setIsDecisionEditVisible(true);
  };

  const handleUpdateDecision = async () => {
    const trimmedTitle = editDecisionTitle.trim();
    const trimmedDescription = editDecisionDescription.trim();

    if (trimmedTitle.length === 0) {
      setDecisionError('Titel fehlt.');
      return;
    }

    try {
      await updateDecision({
        decisionId: decision.id,
        title: trimmedTitle,
        description: trimmedDescription,
      });
      setDecisionError('');
      setIsDecisionEditVisible(false);
    } catch (error) {
      console.error('Failed to update decision', error);
      setDecisionError('Die Entscheidung konnte nicht gespeichert werden.');
    }
  };

  const handleDeleteDecision = async () => {
    setIsDeleting(true);
    setDeleteError('');

    try {
      await deleteDecision(decision.id);
      router.replace('/');
    } catch (error) {
      console.error('Failed to delete decision', error);
      setDeleteError('Konnte nicht gelöscht werden.');
      setIsDeleting(false);
    }
  };

  const openOptionEdit = (optionId: string, name: string, note: string) => {
    setEditingOptionId(optionId);
    setEditOptionName(name);
    setEditOptionNote(note);
    setEditOptionError('');
  };

  const handleUpdateOption = async () => {
    if (editingOptionId === null) {
      return;
    }

    const trimmedName = editOptionName.trim();
    const trimmedNote = editOptionNote.trim();

    if (trimmedName.length === 0) {
      setEditOptionError('Optionsname fehlt.');
      return;
    }

    const currentOption = decision.options.find((option) => option.id === editingOptionId);

    if (
      hasDuplicateName(
        trimmedName,
        decision.options.map((option) => option.name),
        currentOption?.name
      )
    ) {
      setEditOptionError('Option gibt es schon.');
      return;
    }

    try {
      await updateOption({
        decisionId: decision.id,
        optionId: editingOptionId,
        name: trimmedName,
        note: trimmedNote,
      });
      setEditingOptionId(null);
      setEditOptionError('');
    } catch (error) {
      console.error('Failed to update option', error);
      setEditOptionError('Die Option konnte nicht gespeichert werden.');
    }
  };

  const handleAddCriterion = async () => {
    const trimmedName = criterionName.trim();

    if (trimmedName.length === 0) {
      setCriterionError('Kriterienname fehlt.');
      return;
    }

    if (hasDuplicateName(trimmedName, decision.criteria.map((criterion) => criterion.name))) {
      setCriterionError('Kriterium gibt es schon.');
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
    } catch (error) {
      console.error('Failed to save criterion', error);
      setCriterionError('Das Kriterium konnte nicht gespeichert werden.');
    }
  };

  const openCriterionEdit = (criterionId: string, name: string, weight: CriterionWeight) => {
    setEditingCriterionId(criterionId);
    setEditCriterionName(name);
    setEditCriterionWeight(weight);
    setEditCriterionError('');
  };

  const handleUpdateCriterion = async () => {
    if (editingCriterionId === null) {
      return;
    }

    const trimmedName = editCriterionName.trim();

    if (trimmedName.length === 0) {
      setEditCriterionError('Kriterienname fehlt.');
      return;
    }

    const currentCriterion = decision.criteria.find(
      (criterion) => criterion.id === editingCriterionId
    );

    if (
      hasDuplicateName(
        trimmedName,
        decision.criteria.map((criterion) => criterion.name),
        currentCriterion?.name
      )
    ) {
      setEditCriterionError('Kriterium gibt es schon.');
      return;
    }

    try {
      await updateCriterion({
        decisionId: decision.id,
        criterionId: editingCriterionId,
        name: trimmedName,
        weight: editCriterionWeight,
      });
      setEditingCriterionId(null);
      setEditCriterionError('');
    } catch (error) {
      console.error('Failed to update criterion', error);
      setEditCriterionError('Das Kriterium konnte nicht gespeichert werden.');
    }
  };

  const handleStartRating = () => {
    if (!canStartRating(decision.options.length, decision.criteria.length)) {
      setRatingStartError('Mindestens 2 Optionen und 1 Kriterium.');
      return;
    }

    setRatingStartError('');
    router.push({ pathname: '/decision/[id]/ratings', params: { id: decision.id } });
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 120, 140) }]}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled">
        <AppCard elevated style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroTitleGroup}>
              <Text style={styles.kicker}>Entscheidung</Text>
              <Text style={styles.title}>{decision.title}</Text>
            </View>
            <IconButton
              icon={isDecisionEditVisible ? 'close' : 'create-outline'}
              label={isDecisionEditVisible ? 'Bearbeiten schließen' : 'Entscheidung bearbeiten'}
              onPress={() => {
                if (isDecisionEditVisible) {
                  setIsDecisionEditVisible(false);
                  setDecisionError('');
                } else {
                  openDecisionEdit();
                }
              }}
            />
          </View>
          {decision.description.length > 0 ? (
            <Text style={styles.description}>{decision.description}</Text>
          ) : null}
          {isDecisionEditVisible ? (
            <View style={styles.editPanel}>
              <AppInput
                accessibilityLabel="Entscheidungstitel bearbeiten"
                hasError={decisionError.length > 0 && editDecisionTitle.trim().length === 0}
                onChangeText={setEditDecisionTitle}
                onSubmitEditing={handleUpdateDecision}
                placeholder="Titel"
                returnKeyType="done"
                value={editDecisionTitle}
              />
              <AppInput
                accessibilityLabel="Beschreibung bearbeiten"
                multiline
                onChangeText={setEditDecisionDescription}
                placeholder="Beschreibung optional"
                style={styles.compactTextArea}
                value={editDecisionDescription}
              />
              {decisionError.length > 0 ? (
                <Text accessibilityRole="alert" style={styles.errorText}>
                  {decisionError}
                </Text>
              ) : null}
              <View style={styles.editActions}>
                <AppButton
                  icon="close"
                  onPress={() => {
                    setIsDecisionEditVisible(false);
                    setDecisionError('');
                  }}
                  title="Abbrechen"
                  variant="ghost"
                />
                <AppButton icon="checkmark" onPress={handleUpdateDecision} title="Sichern" />
              </View>
            </View>
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
                blurOnSubmit={false}
                hasError={optionError.length > 0}
                onChangeText={setOptionName}
                onSubmitEditing={handleAddOption}
                placeholder="Option"
                returnKeyType="done"
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
              message="Füge Alternativen für den Vergleich hinzu."
            />
          ) : (
            <View style={styles.itemList}>
              {decision.options.map((option) => (
                <AppCard key={option.id} style={styles.itemCard}>
                  {editingOptionId === option.id ? (
                    <View style={styles.inlineEdit}>
                      <AppInput
                        accessibilityLabel="Optionsname bearbeiten"
                        hasError={editOptionError.length > 0 && editOptionName.trim().length === 0}
                        onChangeText={setEditOptionName}
                        onSubmitEditing={handleUpdateOption}
                        placeholder="Option"
                        returnKeyType="done"
                        value={editOptionName}
                      />
                      <AppInput
                        accessibilityLabel="Optionsnotiz bearbeiten"
                        multiline
                        onChangeText={setEditOptionNote}
                        placeholder="Notiz optional"
                        style={styles.compactTextArea}
                        value={editOptionNote}
                      />
                      {editOptionError.length > 0 ? (
                        <Text accessibilityRole="alert" style={styles.errorText}>
                          {editOptionError}
                        </Text>
                      ) : null}
                      <View style={styles.editActions}>
                        <AppButton
                          icon="close"
                          onPress={() => {
                            setEditingOptionId(null);
                            setEditOptionError('');
                          }}
                          title="Abbrechen"
                          variant="ghost"
                        />
                        <AppButton icon="checkmark" onPress={handleUpdateOption} title="Sichern" />
                      </View>
                    </View>
                  ) : (
                    <>
                      <View style={styles.itemIcon}>
                        <Ionicons color={theme.colors.primary} name="radio-button-on-outline" size={18} />
                      </View>
                      <View style={styles.itemContent}>
                        <Text numberOfLines={2} style={styles.itemTitle}>{option.name}</Text>
                        {option.note.length > 0 ? <Text style={styles.itemText}>{option.note}</Text> : null}
                      </View>
                      <View style={styles.itemActions}>
                        <IconButton
                          icon="create-outline"
                          label={`Option ${option.name} bearbeiten`}
                          onPress={() => openOptionEdit(option.id, option.name, option.note)}
                        />
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
                      </View>
                    </>
                  )}
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
                blurOnSubmit={false}
                hasError={criterionError.length > 0}
                onChangeText={setCriterionName}
                onSubmitEditing={handleAddCriterion}
                placeholder="Kriterium"
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
              message="Lege fest, woran du bewertest."
            />
          ) : (
            <View style={styles.itemList}>
              {decision.criteria.map((criterion) => (
                <AppCard key={criterion.id} style={styles.itemCard}>
                  {editingCriterionId === criterion.id ? (
                    <View style={styles.inlineEdit}>
                      <AppInput
                        accessibilityLabel="Kriteriumsname bearbeiten"
                        hasError={editCriterionError.length > 0 && editCriterionName.trim().length === 0}
                        onChangeText={setEditCriterionName}
                        onSubmitEditing={handleUpdateCriterion}
                        placeholder="Kriterium"
                        returnKeyType="done"
                        value={editCriterionName}
                      />
                      <View style={styles.weightGroup}>
                        <Text style={styles.weightLabel}>Gewichtung</Text>
                        <View style={styles.weightButtons}>
                          {criterionWeights.map((weight) => (
                            <Pressable
                              accessibilityRole="button"
                              accessibilityState={{ selected: editCriterionWeight === weight }}
                              key={weight}
                              onPress={() => setEditCriterionWeight(weight)}
                              style={({ pressed }) => [
                                styles.weightButton,
                                editCriterionWeight === weight && styles.weightButtonSelected,
                                pressed && styles.weightButtonPressed,
                              ]}>
                              <Text
                                style={[
                                  styles.weightButtonText,
                                  editCriterionWeight === weight && styles.weightButtonTextSelected,
                                ]}>
                                {weight}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      </View>
                      {editCriterionError.length > 0 ? (
                        <Text accessibilityRole="alert" style={styles.errorText}>
                          {editCriterionError}
                        </Text>
                      ) : null}
                      <View style={styles.editActions}>
                        <AppButton
                          icon="close"
                          onPress={() => {
                            setEditingCriterionId(null);
                            setEditCriterionError('');
                          }}
                          title="Abbrechen"
                          variant="ghost"
                        />
                        <AppButton icon="checkmark" onPress={handleUpdateCriterion} title="Sichern" />
                      </View>
                    </View>
                  ) : (
                    <>
                      <View style={styles.itemIcon}>
                        <Ionicons color={theme.colors.primary} name="speedometer-outline" size={18} />
                      </View>
                      <View style={styles.itemContent}>
                        <Text numberOfLines={2} style={styles.itemTitle}>{criterion.name}</Text>
                        <Text style={styles.itemText}>Gewichtung {criterion.weight}</Text>
                      </View>
                      <View style={styles.itemActions}>
                        <IconButton
                          icon="create-outline"
                          label={`Kriterium ${criterion.name} bearbeiten`}
                          onPress={() => openCriterionEdit(criterion.id, criterion.name, criterion.weight)}
                        />
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
                      </View>
                    </>
                  )}
                </AppCard>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader eyebrow="Verwalten" title="Entfernen" />
          {isDeleteConfirmVisible ? (
            <AppCard style={styles.deletePanel}>
              <View style={styles.deleteHeader}>
                <View style={styles.deleteIcon}>
                  <Ionicons color={theme.colors.dangerStrong} name="trash-outline" size={20} />
                </View>
                <View style={styles.deleteCopy}>
                  <Text style={styles.deleteTitle}>Entscheidung löschen?</Text>
                  <Text style={styles.deleteText}>Alle zugehörigen Daten werden entfernt.</Text>
                </View>
              </View>
              {deleteError.length > 0 ? (
                <Text accessibilityRole="alert" style={styles.errorText}>
                  {deleteError}
                </Text>
              ) : null}
              <View style={styles.editActions}>
                <AppButton
                  disabled={isDeleting}
                  icon="close"
                  onPress={() => {
                    setIsDeleteConfirmVisible(false);
                    setDeleteError('');
                  }}
                  title="Abbrechen"
                  variant="ghost"
                />
                <AppButton
                  disabled={isDeleting}
                  icon="trash-outline"
                  onPress={handleDeleteDecision}
                  title={isDeleting ? 'Löscht...' : 'Löschen'}
                  variant="danger"
                />
              </View>
            </AppCard>
          ) : (
            <AppButton
              icon="trash-outline"
              onPress={() => {
                setIsDeleteConfirmVisible(true);
                setDeleteError('');
              }}
              title="Entscheidung löschen"
              variant="danger"
            />
          )}
        </View>
      </ScrollView>

      <View style={[styles.actionBar, { paddingBottom: Math.max(insets.bottom + 14, 30) }]}>
        {ratingStartError.length > 0 ? (
          <Text accessibilityRole="alert" style={styles.actionErrorText}>
            {ratingStartError}
          </Text>
        ) : null}
        <AppButton icon="analytics-outline" onPress={handleStartRating} title="Bewerten" />
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
  heroTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  heroTitleGroup: {
    flex: 1,
    gap: 6,
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
  editPanel: {
    backgroundColor: theme.colors.surfaceTint,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: 12,
    padding: 12,
  },
  editActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-end',
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
  inlineEdit: {
    flex: 1,
    gap: 12,
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
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  deletePanel: {
    backgroundColor: theme.colors.dangerSoft,
    borderColor: theme.colors.dangerBorder,
    gap: 12,
  },
  deleteHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  deleteIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.dangerSoftPressed,
    borderRadius: theme.radius.pill,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  deleteCopy: {
    flex: 1,
    gap: 3,
  },
  deleteTitle: {
    color: theme.colors.dangerStrong,
    fontSize: 16,
    fontWeight: '900',
  },
  deleteText: {
    color: theme.colors.dangerStrong,
    fontSize: 13,
    lineHeight: 18,
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
    gap: 10,
    paddingHorizontal: theme.spacing.screenX,
    paddingTop: 14,
    ...theme.shadow.footer,
  },
  actionErrorText: {
    color: theme.colors.dangerStrong,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  messageContent: {
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.screenX,
  },
});
