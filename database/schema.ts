import { SQLiteDatabase } from 'expo-sqlite';

const DATABASE_VERSION = 1;

export async function migrateDatabase(db: SQLiteDatabase) {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const versionRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = versionRow?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentVersion === 0) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS decisions (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS options (
        id TEXT PRIMARY KEY NOT NULL,
        decision_id TEXT NOT NULL,
        name TEXT NOT NULL,
        note TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (decision_id) REFERENCES decisions (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS criteria (
        id TEXT PRIMARY KEY NOT NULL,
        decision_id TEXT NOT NULL,
        name TEXT NOT NULL,
        weight INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (decision_id) REFERENCES decisions (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS ratings (
        id TEXT PRIMARY KEY NOT NULL,
        decision_id TEXT NOT NULL,
        option_id TEXT NOT NULL,
        criterion_id TEXT NOT NULL,
        value INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE (decision_id, option_id, criterion_id),
        FOREIGN KEY (decision_id) REFERENCES decisions (id) ON DELETE CASCADE,
        FOREIGN KEY (option_id) REFERENCES options (id) ON DELETE CASCADE,
        FOREIGN KEY (criterion_id) REFERENCES criteria (id) ON DELETE CASCADE
      );
    `);
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
