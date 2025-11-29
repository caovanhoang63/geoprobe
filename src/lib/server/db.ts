import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema';

const DATABASE_URL = process.env.DATABASE_URL || 'file:./data.db';

const sqlite = new Database(DATABASE_URL.replace('file:', ''));
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });

try {
	migrate(db, { migrationsFolder: './migrations' });
	console.log('[Database] Initialized with WAL mode and foreign keys enabled');
} catch (error) {
	console.error('[Database] Migration failed:', error);
	throw error;
}