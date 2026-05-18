/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const AppTheme = {
  colors: {
    surface: '#F7F8FA',
    surfaceRaised: '#FFFFFF',
    surfacePressed: '#EEF4FF',
    surfaceMuted: '#F1F5F9',
    text: '#172033',
    textSecondary: '#4D5A6D',
    textMuted: '#7B8794',
    textStrong: '#2D3748',
    border: '#DDE3EA',
    borderSoft: '#E6EBF1',
    primary: '#2563EB',
    primaryPressed: '#1D4ED8',
    primaryDisabled: '#8EA8E8',
    primarySoft: '#EAF1FF',
    primarySoftPressed: '#DCE8FF',
    primaryBorder: '#BCD0FF',
    onPrimary: '#FFFFFF',
    danger: '#B91C1C',
    dangerStrong: '#BE123C',
    dangerSoft: '#FFF1F2',
    dangerSoftPressed: '#FFE4E6',
    dangerBorder: '#FECDD3',
    success: '#047857',
    warning: '#B45309',
    info: '#1D4ED8',
  },
  darkColors: {
    surface: '#111827',
    surfaceRaised: '#1F2937',
    surfacePressed: '#24324A',
    surfaceMuted: '#182233',
    text: '#F3F4F6',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    textStrong: '#FFFFFF',
    border: '#334155',
    borderSoft: '#253244',
    primary: '#60A5FA',
    primaryPressed: '#3B82F6',
    primaryDisabled: '#355D93',
    primarySoft: '#172A46',
    primarySoftPressed: '#1D365A',
    primaryBorder: '#315985',
    onPrimary: '#0F172A',
    danger: '#FCA5A5',
    dangerStrong: '#F87171',
    dangerSoft: '#3B171C',
    dangerSoftPressed: '#4A1D24',
    dangerBorder: '#7F1D1D',
    success: '#6EE7B7',
    warning: '#FCD34D',
    info: '#93C5FD',
  },
  spacing: {
    screenX: 24,
    sectionGap: 24,
    itemGap: 12,
    fieldGap: 12,
  },
  radius: {
    sm: 8,
  },
  touch: {
    min: 48,
    primary: 56,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
