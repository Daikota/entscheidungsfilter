import { getDatabase } from './database';

const themePreferenceKey = 'themePreference';

type ThemePreference = 'system' | 'dark' | 'light';

type AppSettingRow = {
  value: string;
};

const isThemePreference = (value: string | undefined): value is ThemePreference =>
  value === 'system' || value === 'dark' || value === 'light';

export async function loadThemePreferenceFromDatabase(): Promise<ThemePreference> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<AppSettingRow>(
    'SELECT value FROM app_settings WHERE key = ?',
    themePreferenceKey
  );

  return isThemePreference(row?.value) ? row.value : 'system';
}

export async function saveThemePreferenceToDatabase(preference: ThemePreference) {
  const db = await getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO app_settings (key, value, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT (key)
     DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    themePreferenceKey,
    preference,
    now
  );
}
