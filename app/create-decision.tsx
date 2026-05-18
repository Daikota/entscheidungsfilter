import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function CreateDecisionScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'error' | 'success' | null>(null);

  const handleSave = () => {
    if (title.trim().length === 0) {
      setFeedbackType('error');
      setFeedbackMessage('Bitte gib einen Titel ein.');
      return;
    }

    setFeedbackType('success');
    setFeedbackMessage('Entscheidung ist bereit. Speicherung folgt in einer späteren Version.');
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
          style={[styles.input, feedbackType === 'error' && styles.inputError]}
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
          <Text
            accessibilityRole="alert"
            style={feedbackType === 'error' ? styles.errorText : styles.successText}>
            {feedbackMessage}
          </Text>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={handleSave}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
        <Text style={styles.buttonText}>Speichern</Text>
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
  successText: {
    color: '#047857',
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
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
