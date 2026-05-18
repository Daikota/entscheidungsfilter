import { Link, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDecisions } from '@/contexts/decision-context';
import { CriterionWeight } from '@/types/decision';

const criterionWeights: CriterionWeight[] = [1, 2, 3];

export default function DecisionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    decisions,
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

  const handleAddOption = () => {
    const trimmedName = optionName.trim();
    const trimmedNote = optionNote.trim();

    if (trimmedName.length === 0) {
      setOptionError('Bitte gib einen Namen für die Option ein.');
      return;
    }

    addOption({
      decisionId: decision.id,
      name: trimmedName,
      note: trimmedNote,
    });
    setOptionName('');
    setOptionNote('');
    setOptionError('');
    setIsOptionFormVisible(false);
  };

  const handleAddCriterion = () => {
    const trimmedName = criterionName.trim();

    if (trimmedName.length === 0) {
      setCriterionError('Bitte gib einen Namen für das Kriterium ein.');
      return;
    }

    addCriterion({
      decisionId: decision.id,
      name: trimmedName,
      weight: criterionWeight,
    });
    setCriterionName('');
    setCriterionWeight(2);
    setCriterionError('');
    setIsCriterionFormVisible(false);
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
                placeholderTextColor="#7B8794"
                style={[styles.input, optionError.length > 0 && styles.inputError]}
                value={optionName}
              />
              <TextInput
                accessibilityLabel="Notiz optional"
                multiline
                onChangeText={setOptionNote}
                placeholder="Notiz optional"
                placeholderTextColor="#7B8794"
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
                    onPress={() => deleteOption(decision.id, option.id)}
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
                placeholderTextColor="#7B8794"
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
                    onPress={() => deleteCriterion(decision.id, criterion.id)}
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
        <Pressable
          accessibilityRole="button"
          onPress={() => undefined}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}>
          <Text style={styles.primaryButtonText}>Bewertung starten / Ergebnisse anzeigen</Text>
        </Pressable>
      </View>
    </View>
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
    gap: 12,
  },
  title: {
    color: '#172033',
    fontSize: 30,
    fontWeight: '700',
  },
  description: {
    color: '#4D5A6D',
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
    color: '#172033',
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDE3EA',
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDE3EA',
    borderRadius: 8,
    borderWidth: 1,
    color: '#172033',
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputError: {
    borderColor: '#DC2626',
  },
  textArea: {
    minHeight: 96,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#DDE3EA',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    justifyContent: 'center',
    minHeight: 132,
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
  itemList: {
    gap: 10,
  },
  itemCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#DDE3EA',
    borderRadius: 8,
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
    color: '#172033',
    fontSize: 17,
    fontWeight: '700',
  },
  itemText: {
    color: '#4D5A6D',
    fontSize: 14,
    lineHeight: 20,
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
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#EAF1FF',
    borderColor: '#BCD0FF',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
  },
  secondaryButtonPressed: {
    backgroundColor: '#DCE8FF',
  },
  secondaryButtonText: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    borderColor: '#FECDD3',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
  },
  deleteButtonPressed: {
    backgroundColor: '#FFE4E6',
  },
  deleteButtonText: {
    color: '#BE123C',
    fontSize: 14,
    fontWeight: '700',
  },
  weightGroup: {
    gap: 8,
  },
  weightLabel: {
    color: '#2D3748',
    fontSize: 15,
    fontWeight: '700',
  },
  weightButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  weightButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#DDE3EA',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  weightButtonSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  weightButtonText: {
    color: '#2D3748',
    fontSize: 16,
    fontWeight: '700',
  },
  weightButtonTextSelected: {
    color: '#FFFFFF',
  },
  actionBar: {
    backgroundColor: '#F7F8FA',
    borderTopColor: '#E6EBF1',
    borderTopWidth: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  notFoundContent: {
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  notFoundTitle: {
    color: '#172033',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  notFoundText: {
    color: '#4D5A6D',
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
  },
});
