import fs from 'fs';
import path from 'path';
import { pool } from '../config/db';

const runSeed = async (): Promise<void> => {
  const client = await pool.connect();
  try {
    console.log('Starting seed execution...');
    const seedsDir = path.resolve(process.cwd(), 'seeds');
    if (!fs.existsSync(seedsDir)) {
      console.error(`Seeds directory not found at ${seedsDir}`);
      process.exit(1);
    }

    const files = fs.readdirSync(seedsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      console.log(`Applying seed file: ${file}`);
      const sqlPath = path.join(seedsDir, file);
      const sql = fs.readFileSync(sqlPath, 'utf8');

      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log(`Seed ${file} applied successfully.`);
    }

    console.log('Database seeding completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

runSeed();
