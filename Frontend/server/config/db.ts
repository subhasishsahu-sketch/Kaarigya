// server/config/db.ts
// PostgreSQL Connection Pool — wraps pg.Pool for use across all service modules.
// Reads DATABASE_URL from environment. Falls back to individual PG_* vars for local dev.

import pg from 'pg';
import { env } from './env';

const { Pool } = pg;

let pool: pg.Pool | null = null;

/**
 * Returns the shared PostgreSQL connection pool.
 * Creates it on first call. Safe to call multiple times.
 */
export function getPool(): pg.Pool | null {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  const host = process.env.PG_HOST || 'localhost';
  const port = parseInt(process.env.PG_PORT || '5432', 10);
  const database = process.env.PG_DATABASE || 'kaarigya';
  const user = process.env.PG_USER || 'postgres';
  const password = process.env.PG_PASSWORD || 'postgres';

  try {
    pool = new Pool(
      connectionString
        ? { connectionString, ssl: connectionString.includes('sslmode=require') ? { rejectUnauthorized: false } : false }
        : { host, port, database, user, password }
    );

    pool.on('error', (err: Error) => {
      console.error('[DB] Unexpected pool error:', err.message);
    });

    console.log('[DB] PostgreSQL connection pool initialized.');
  } catch (err) {
    console.warn('[DB] Could not initialize PostgreSQL pool:', err);
    pool = null;
  }

  return pool;
}

/**
 * Execute a parameterized SQL query.
 * Returns the full pg.QueryResult so callers can inspect .rows, .rowCount, etc.
 */
export async function query<T extends pg.QueryResultRow = any>(
  sql: string,
  params?: any[]
): Promise<pg.QueryResult<T>> {
  const p = getPool();
  if (!p) throw new Error('[DB] PostgreSQL pool is not available. Check DATABASE_URL or PG_* env vars.');
  return p.query<T>(sql, params);
}

/**
 * Acquire a dedicated client for multi-statement transactions.
 * Caller MUST release the client when done: client.release()
 */
export async function getClient(): Promise<pg.PoolClient> {
  const p = getPool();
  if (!p) throw new Error('[DB] PostgreSQL pool is not available.');
  return p.connect();
}

/**
 * Convenience wrapper for running multiple statements inside a single transaction.
 * Automatically commits or rolls back.
 */
export async function withTransaction<T>(
  fn: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export { pg };
