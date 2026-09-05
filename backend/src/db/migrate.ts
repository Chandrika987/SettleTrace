import fs from 'fs';
import path from 'path';
import { pool } from '../config/db';

const runMigrations = async (): Promise<void> => {
  const client = await pool.connect();
  try {
    console.log('Starting PostgreSQL schema migrations...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const migrationsDir = path.resolve(process.cwd(), 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.error(`Migrations directory not found at ${migrationsDir}`);
      process.exit(1);
    }

    const files = fs.readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    const { rows: executedMigrations } = await client.query<{ name: string }>('SELECT name FROM schema_migrations;');
    const executedNames = new Set(executedMigrations.map((m) => m.name));

    for (const file of files) {
      if (!executedNames.has(file)) {
        console.log(`Executing migration: ${file}`);
        const sqlPath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');

        console.log(`Migration ${file} executed successfully.`);
      } else {
        console.log(`Migration ${file} already applied.`);
      }
    }

    console.log('All migrations completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

runMigrations();
