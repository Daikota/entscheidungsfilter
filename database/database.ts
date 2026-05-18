import * as SQLite from 'expo-sqlite';

import { migrateDatabase } from '@/database/schema';

const DATABASE_NAME = 'entscheidungsfilter.db';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDatabase() {
  if (databasePromise === null) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME).then(async (db) => {
      await migrateDatabase(db);
      return db;
    });
  }

  return databasePromise;
}
