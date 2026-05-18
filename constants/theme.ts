/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform, useColorScheme } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#FEFDFF';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#FEFDFF',
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

export const AppColorSchemes = {
  light: {
    surface: '#FEFDFF',
    surfaceRaised: '#8EB1C7',
    surfacePressed: '#7EA4BC',
    surfaceMuted: '#F6F1EA',
    surfaceElevated: '#FFFFFF',
    surfaceTint: '#EAF2F7',
    text: '#1F2430',
    textSecondary: '#4A5565',
    textMuted: '#6B7280',
    textStrong: '#101623',
    border: '#779FB6',
    borderSoft: '#E5EDF2',
    primary: '#EE8434',
    primaryPressed: '#D96F22',
    primaryDisabled: '#E9B384',
    primarySoft: '#FFF1E7',
    primarySoftPressed: '#FFE3CC',
    primaryBorder: '#F6B278',
    onPrimary: '#1F2430',
    danger: '#A4343A',
    dangerStrong: '#7F1D1D',
    dangerSoft: '#F8E8E8',
    dangerSoftPressed: '#F2D4D4',
    dangerBorder: '#E7B5B8',
    success: '#2F7D59',
    warning: '#A66A18',
    info: '#2F5F7D',
  },
  dark: {
    surface: '#2C2B3C',
    surfaceRaised: '#403F4C',
    surfacePressed: '#4B4A59',
    surfaceMuted: '#353447',
    surfaceElevated: '#464554',
    surfaceTint: '#363548',
    text: '#FEFDFF',
    textSecondary: '#D7D3DF',
    textMuted: '#B8B2C2',
    textStrong: '#FEFDFF',
    border: '#565465',
    borderSoft: '#494757',
    primary: '#EE8434',
    primaryPressed: '#F39A56',
    primaryDisabled: '#8E654F',
    primarySoft: '#563B2D',
    primarySoftPressed: '#664532',
    primaryBorder: '#A86235',
    onPrimary: '#211F2B',
    danger: '#F2A4A8',
    dangerStrong: '#FFD2D5',
    dangerSoft: '#56313A',
    dangerSoftPressed: '#633844',
    dangerBorder: '#8D4C56',
    success: '#8BDDB8',
    warning: '#F6C86A',
    info: '#A9C8DD',
  },
} as const;

export const AppTheme = {
  isDark: false,
  colors: AppColorSchemes.light,
  darkColors: AppColorSchemes.dark,
  spacing: {
    screenX: 24,
    sectionGap: 24,
    itemGap: 12,
    fieldGap: 12,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 18,
    xl: 24,
    pill: 999,
  },
  touch: {
    min: 48,
    primary: 56,
  },
  shadow: {
    card: {
      shadowColor: '#1F2430',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 2,
    },
    elevated: {
      shadowColor: '#1F2430',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.12,
      shadowRadius: 18,
      elevation: 5,
    },
    footer: {
      shadowColor: '#1F2430',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 8,
    },
  },
};

type AppColorTokens = Record<keyof typeof AppColorSchemes.light, string>;

export type AppThemeValues = Omit<typeof AppTheme, 'colors' | 'darkColors'> & {
  colors: AppColorTokens;
  darkColors: AppColorTokens;
};

export function getAppTheme(colorScheme: 'light' | 'dark' | null | undefined): AppThemeValues {
  const isDark = colorScheme === 'dark';

  return {
    ...AppTheme,
    isDark,
    colors: isDark ? AppColorSchemes.dark : AppColorSchemes.light,
  };
}

export function useAppTheme() {
  return getAppTheme(useColorScheme());
}

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
