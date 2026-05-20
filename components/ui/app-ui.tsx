import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import {
  Image,
  ImageStyle,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';

import { AppThemeValues, useAppTheme } from '@/constants/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const logoDark = require('../../assets/images/logo-dark.png');
const logoLight = require('../../assets/images/logo-light.png');

type AppLogoProps = {
  size?: number;
  style?: StyleProp<ImageStyle>;
};

export function AppLogo({ size = 52, style }: AppLogoProps) {
  const theme = useAppTheme();

  return (
    <Image
      accessibilityIgnoresInvertColors
      accessibilityLabel="Entscheidungsfilter Logo"
      resizeMode="contain"
      source={theme.isDark ? logoDark : logoLight}
      style={[{ height: size, width: size }, style]}
    />
  );
}

type AppButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type AppButtonProps = Omit<PressableProps, 'children' | 'disabled' | 'style'> & {
  title: string;
  icon?: IconName;
  variant?: AppButtonVariant;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({
  title,
  icon,
  variant = 'primary',
  disabled = false,
  onPress,
  accessibilityLabel,
  style,
  ...pressableProps
}: AppButtonProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const isPrimary = variant === 'primary';
  const textStyle = [
    styles.buttonText,
    isPrimary && styles.primaryButtonText,
    variant === 'danger' && styles.dangerButtonText,
    disabled && styles.disabledButtonText,
  ];

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      {...pressableProps}
      style={({ pressed }) => [
        styles.button,
        styles[`${variant}Button`],
        pressed && !disabled && styles[`${variant}ButtonPressed`],
        disabled && styles.disabledButton,
        style,
      ]}>
      {icon ? (
        <Ionicons
          color={isPrimary ? theme.colors.onPrimary : variant === 'danger' ? theme.colors.dangerStrong : theme.colors.textStrong}
          name={icon}
          size={18}
        />
      ) : null}
      <Text style={textStyle}>{title}</Text>
    </Pressable>
  );
}

type IconButtonProps = {
  icon: IconName;
  label: string;
  onPress?: () => void;
  variant?: 'ghost' | 'danger';
};

export function IconButton({ icon, label, onPress, variant = 'ghost' }: IconButtonProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const isDanger = variant === 'danger';

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        isDanger && styles.iconButtonDanger,
        pressed && styles.iconButtonPressed,
      ]}>
      <Ionicons
        color={isDanger ? theme.colors.dangerStrong : theme.colors.textSecondary}
        name={icon}
        size={20}
      />
    </Pressable>
  );
}

type AppCardProps = {
  children: ReactNode;
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AppCard({ children, elevated = false, style }: AppCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return <View style={[styles.card, elevated && styles.cardElevated, style]}>{children}</View>;
}

type AppInputProps = TextInputProps & {
  hasError?: boolean;
};

export function AppInput({ hasError = false, multiline, style, placeholderTextColor, ...props }: AppInputProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <TextInput
      multiline={multiline}
      placeholderTextColor={placeholderTextColor ?? theme.colors.textMuted}
      style={[styles.input, multiline && styles.textArea, hasError && styles.inputError, style]}
      textAlignVertical={multiline ? 'top' : undefined}
      {...props}
    />
  );
}

type SectionHeaderProps = {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
};

export function SectionHeader({ title, eyebrow, action }: SectionHeaderProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleGroup}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {action}
    </View>
  );
}

type EmptyStateProps = {
  icon: IconName;
  title: string;
  message?: string;
};

export function EmptyState({ icon, title, message }: EmptyStateProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <AppCard style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons color={theme.colors.primary} name={icon} size={24} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {message ? <Text style={styles.emptyText}>{message}</Text> : null}
    </AppCard>
  );
}

type StatPillProps = {
  label: string;
  value: string;
  icon?: IconName;
};

export function StatPill({ label, value, icon }: StatPillProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.statPill}>
      {icon ? <Ionicons color={theme.colors.textSecondary} name={icon} size={15} /> : null}
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const createStyles = (theme: AppThemeValues) => StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: theme.touch.min,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    minHeight: theme.touch.primary,
    ...theme.shadow.card,
  },
  primaryButtonPressed: {
    backgroundColor: theme.colors.primaryPressed,
    transform: [{ scale: 0.98 }],
  },
  secondaryButton: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primaryBorder,
    borderWidth: 1,
  },
  secondaryButtonPressed: {
    backgroundColor: theme.colors.primarySoftPressed,
  },
  ghostButton: {
    backgroundColor: theme.colors.surfaceTint,
    borderColor: theme.colors.borderSoft,
    borderWidth: 1,
  },
  ghostButtonPressed: {
    backgroundColor: theme.colors.surfacePressed,
  },
  dangerButton: {
    backgroundColor: theme.colors.dangerSoft,
    borderColor: theme.colors.dangerBorder,
    borderWidth: 1,
  },
  dangerButtonPressed: {
    backgroundColor: theme.colors.dangerSoftPressed,
  },
  disabledButton: {
    opacity: 0.62,
  },
  buttonText: {
    color: theme.colors.textStrong,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  primaryButtonText: {
    color: theme.colors.onPrimary,
    fontSize: 17,
  },
  dangerButtonText: {
    color: theme.colors.dangerStrong,
  },
  disabledButtonText: {
    opacity: 0.72,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceTint,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    height: theme.touch.min,
    justifyContent: 'center',
    width: theme.touch.min,
  },
  iconButtonDanger: {
    backgroundColor: theme.colors.dangerSoft,
    borderColor: theme.colors.dangerBorder,
  },
  iconButtonPressed: {
    backgroundColor: theme.colors.surfacePressed,
    transform: [{ scale: 0.96 }],
  },
  card: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: 16,
    ...theme.shadow.card,
  },
  cardElevated: {
    ...theme.shadow.elevated,
  },
  input: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    color: theme.colors.text,
    fontSize: 16,
    minHeight: 54,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  textArea: {
    minHeight: 104,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  sectionTitleGroup: {
    flex: 1,
    gap: 3,
  },
  eyebrow: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 21,
    fontWeight: '900',
  },
  emptyState: {
    alignItems: 'center',
    gap: 10,
    justifyContent: 'center',
    minHeight: 156,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.pill,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  emptyTitle: {
    color: theme.colors.textStrong,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  statPill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surfaceTint,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    minHeight: 34,
    paddingHorizontal: 11,
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  statValue: {
    color: theme.colors.textStrong,
    fontSize: 13,
    fontWeight: '900',
  },
});
