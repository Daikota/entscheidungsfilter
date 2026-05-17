import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function CreateDecisionScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Neue Entscheidung</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          accessibilityLabel="Titel der Entscheidung"
          placeholder="Titel der Entscheidung"
          placeholderTextColor="#7B8794"
          style={styles.input}
        />
        <TextInput
          accessibilityLabel="Beschreibung optional"
          multiline
          placeholder="Beschreibung optional"
          placeholderTextColor="#7B8794"
          style={[styles.input, styles.textArea]}
          textAlignVertical="top"
        />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => undefined}
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
  textArea: {
    minHeight: 120,
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
