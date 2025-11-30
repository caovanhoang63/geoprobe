import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sqlite = new Database('geoprobe.db');
const db = drizzle(sqlite);

console.log('Running migrations...');

migrate(db, { migrationsFolder: join(__dirname, '../migrations') });

console.log('Migrations complete!');

sqlite.close();
