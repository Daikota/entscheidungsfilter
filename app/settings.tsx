import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AppButton, AppCard, AppLogo, SectionHeader, StatPill } from '@/components/ui/app-ui';
import { AppThemeValues, ThemePreference, useAppTheme } from '@/constants/theme';
import { useDecisions } from '@/contexts/decision-context';

const appVersion = Constants.expoConfig?.version ?? '1.0.1';

const themeOptions: { value: ThemePreference; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
  { value: 'dark', label: 'Dunkel', icon: 'moon-outline' },
  { value: 'light', label: 'Hell', icon: 'sunny-outline' },
];

export default function SettingsScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { decisions, deleteAllData } = useDecisions();
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDeleteAllData = async () => {
    setIsDeleting(true);
    setDeleteError('');

    try {
      await deleteAllData();
      router.replace('/');
    } catch (error) {
      console.error('Failed to delete all local app data', error);
      setDeleteError('Konnte nicht gelöscht werden.');
      setIsDeleting(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 32, 56) }]}
      style={styles.screen}>
      <AppCard elevated style={styles.heroCard}>
        <View style={styles.heroLogo}>
          <AppLogo size={52} />
        </View>
        <View style={styles.heroText}>
          <Text style={styles.kicker}>App</Text>
          <Text style={styles.title}>Entscheidungsfilter</Text>
          <View style={styles.pillRow}>
            <StatPill icon="pricetag-outline" label="Version" value={appVersion} />
            <StatPill icon="phone-portrait-outline" label="Speicher" value="Lokal" />
          </View>
        </View>
      </AppCard>

      <View style={styles.section}>
        <SectionHeader eyebrow="Theme" title="Darstellung" />
        <View style={styles.themeControl}>
          {themeOptions.map((option) => {
            const isSelected = theme.preference === option.value;

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                key={option.value}
                onPress={() => {
                  theme.setPreference(option.value).catch((error) => {
                    console.error('Failed to update theme preference', error);
                  });
                }}
                style={({ pressed }) => [
                  styles.themeOption,
                  isSelected && styles.themeOptionSelected,
                  pressed && styles.themeOptionPressed,
                ]}>
                <Ionicons
                  color={isSelected ? theme.colors.onPrimary : theme.colors.textSecondary}
                  name={option.icon}
                  size={17}
                />
                <Text style={[styles.themeOptionText, isSelected && styles.themeOptionTextSelected]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader eyebrow="Daten" title="Lokaler Speicher" />
        <AppCard style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons color={theme.colors.primary} name="lock-closed-outline" size={19} />
          </View>
          <View style={styles.infoTextGroup}>
            <Text style={styles.infoTitle}>Nur auf diesem Gerät</Text>
            <Text style={styles.infoText}>Entscheidungen und Bewertungen bleiben auf diesem Gerät.</Text>
          </View>
        </AppCard>
      </View>

      <View style={styles.section}>
        <SectionHeader eyebrow="Verwalten" title="Daten löschen" />
        {isConfirmVisible ? (
          <AppCard style={styles.dangerCard}>
            <View style={styles.dangerHeader}>
              <View style={styles.dangerIcon}>
                <Ionicons color={theme.colors.dangerStrong} name="trash-outline" size={20} />
              </View>
              <View style={styles.dangerTextGroup}>
                <Text style={styles.dangerTitle}>Alle Daten löschen?</Text>
                <Text style={styles.dangerText}>{decisions.length} Entscheidungen werden gelöscht.</Text>
              </View>
            </View>
            {deleteError.length > 0 ? (
              <Text accessibilityRole="alert" style={styles.errorText}>
                {deleteError}
              </Text>
            ) : null}
            <View style={styles.actions}>
              <AppButton
                disabled={isDeleting}
                icon="close"
                onPress={() => {
                  setIsConfirmVisible(false);
                  setDeleteError('');
                }}
                title="Abbrechen"
                variant="ghost"
              />
              <AppButton
                disabled={isDeleting}
                icon="trash-outline"
                onPress={handleDeleteAllData}
                title={isDeleting ? 'Löscht...' : 'Löschen'}
                variant="danger"
              />
            </View>
          </AppCard>
        ) : (
          <AppButton
            icon="trash-outline"
            onPress={() => setIsConfirmVisible(true)}
            title="Alle Daten löschen"
            variant="danger"
          />
        )}
      </View>
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
    gap: 16,
  },
  heroLogo: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  heroText: {
    gap: 8,
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
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  section: {
    gap: 12,
  },
  themeControl: {
    backgroundColor: theme.colors.surfaceTint,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    padding: 5,
  },
  themeOption: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: theme.touch.min,
    paddingHorizontal: 8,
  },
  themeOptionPressed: {
    backgroundColor: theme.colors.surfacePressed,
  },
  themeOptionSelected: {
    backgroundColor: theme.colors.primary,
  },
  themeOptionText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '900',
  },
  themeOptionTextSelected: {
    color: theme.colors.onPrimary,
  },
  infoCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  infoIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.pill,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  infoTextGroup: {
    flex: 1,
    gap: 3,
  },
  infoTitle: {
    color: theme.colors.textStrong,
    fontSize: 16,
    fontWeight: '900',
  },
  infoText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  dangerCard: {
    backgroundColor: theme.colors.dangerSoft,
    borderColor: theme.colors.dangerBorder,
    gap: 12,
  },
  dangerHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  dangerIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.dangerSoftPressed,
    borderRadius: theme.radius.pill,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  dangerTextGroup: {
    flex: 1,
    gap: 3,
  },
  dangerTitle: {
    color: theme.colors.dangerStrong,
    fontSize: 16,
    fontWeight: '900',
  },
  dangerText: {
    color: theme.colors.dangerStrong,
    fontSize: 13,
    lineHeight: 18,
  },
  errorText: {
    color: theme.colors.dangerStrong,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-end',
  },
});
