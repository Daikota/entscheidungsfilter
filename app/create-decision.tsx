import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useDecisions } from '@/contexts/decision-context';

export default function CreateDecisionScreen() {
  const router = useRouter();
  const { addDecision } = useDecisions();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (trimmedTitle.length === 0) {
      setFeedbackMessage('Bitte gib einen Titel ein.');
      return;
    }

    setIsSaving(true);
    setFeedbackMessage('');

    const decision = addDecision({
      title: trimmedTitle,
      description: trimmedDescription,
    });

    console.log('Created local decision', decision);

    setTimeout(() => {
      router.replace('/');
    }, 250);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Neue Entscheidung</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          accessibilityLabel="Titel der Entscheidung"
          onChangeText={setTitle}
          placeholder="Titel der Entscheidung"
          placeholderTextColor="#7B8794"
          style={[styles.input, feedbackMessage.length > 0 && styles.inputError]}
          value={title}
        />
        <TextInput
          accessibilityLabel="Beschreibung optional"
          multiline
          onChangeText={setDescription}
          placeholder="Beschreibung optional"
          placeholderTextColor="#7B8794"
          style={[styles.input, styles.textArea]}
          textAlignVertical="top"
          value={description}
        />

        {feedbackMessage.length > 0 ? (
          <Text accessibilityRole="alert" style={styles.errorText}>
            {feedbackMessage}
          </Text>
        ) : null}
      </View>

      <Pressable
        accessibilityState={{ disabled: isSaving }}
        disabled={isSaving}
        accessibilityRole="button"
        onPress={handleSave}
        style={({ pressed }) => [
          styles.button,
          pressed && !isSaving && styles.buttonPressed,
          isSaving && styles.buttonDisabled,
        ]}>
        <Text style={styles.buttonText}>{isSaving ? 'Speichern...' : 'Speichern'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    color: '#172033',
    fontSize: 30,
    fontWeight: '700',
  },
  form: {
    flex: 1,
    gap: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDE3EA',
    borderRadius: 8,
    borderWidth: 1,
    color: '#172033',
    fontSize: 17,
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputError: {
    borderColor: '#DC2626',
  },
  textArea: {
    minHeight: 120,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 15,
    lineHeight: 20,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 8,
    minHeight: 56,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  buttonPressed: {
    backgroundColor: '#1D4ED8',
  },
  buttonDisabled: {
    backgroundColor: '#8EA8E8',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
