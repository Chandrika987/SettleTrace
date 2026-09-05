import { Pool, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('FATAL: DATABASE_URL environment variable is not defined.');
  process.exit(1);
}

export const pool = new Pool({
  connectionString,
});

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

export const query = async <T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> => {
  return pool.query<T>(text, params);
};

export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    const res = await pool.query('SELECT 1 as alive;');
    return res.rows[0]?.alive === 1;
  } catch (error) {
    console.error('Failed database connection check:', error);
    return false;
  }
};
