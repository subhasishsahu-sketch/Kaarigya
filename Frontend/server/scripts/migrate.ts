#!/usr/bin/env tsx
// server/scripts/migrate.ts
// Runs all SQL migration files from server/db/migrations/ in order.
// Usage: npx tsx server/scripts/migrate.ts [--seed]

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, '..', 'db', 'migrations');
const SEEDS_DIR = path.join(__dirname, '..', 'db', 'seeds');

async function getClient(): Promise<pg.Client> {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT || '5432', 10),
    database: process.env.PG_DATABASE || 'kaarigya',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'postgres',
  });
  await client.connect();
  return client;
}

async function runSQLFile(client: pg.Client, filePath: string): Promise<void> {
  const sql = fs.readFileSync(filePath, 'utf8');
  console.log(`  → Executing: ${path.basename(filePath)}`);
  await client.query(sql);
  console.log(`  ✓ Done: ${path.basename(filePath)}`);
}

async function ensureMigrationsTable(client: pg.Client): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getAppliedMigrations(client: pg.Client): Promise<Set<string>> {
  const { rows } = await client.query<{ filename: string }>('SELECT filename FROM _migrations ORDER BY id');
  return new Set(rows.map(r => r.filename));
}

async function markMigrationApplied(client: pg.Client, filename: string): Promise<void> {
  await client.query('INSERT INTO _migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING', [filename]);
}

async function runMigrations(): Promise<void> {
  console.log('\n🗄️  Kaarigya — PostgreSQL Migration Runner');
  console.log('==========================================');

  const client = await getClient();
  console.log('✓ Connected to PostgreSQL database\n');

  try {
    await ensureMigrationsTable(client);
    const applied = await getAppliedMigrations(client);

    const migrationFiles = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort();

    if (migrationFiles.length === 0) {
      console.log('No migration files found.');
      return;
    }

    console.log(`📂 Found ${migrationFiles.length} migration file(s):\n`);

    let newCount = 0;
    for (const file of migrationFiles) {
      if (applied.has(file)) {
        console.log(`  ⏭  Skipping (already applied): ${file}`);
        continue;
      }
      await runSQLFile(client, path.join(MIGRATIONS_DIR, file));
      await markMigrationApplied(client, file);
      newCount++;
    }

    if (newCount === 0) {
      console.log('\n✅ Database is already up to date. No migrations applied.');
    } else {
      console.log(`\n✅ Successfully applied ${newCount} migration(s).`);
    }

    // Optionally run seeds
    if (process.argv.includes('--seed')) {
      console.log('\n🌱 Running seed data...\n');
      const seedFiles = fs
        .readdirSync(SEEDS_DIR)
        .filter(f => f.endsWith('.sql'))
        .sort();

      for (const file of seedFiles) {
        await runSQLFile(client, path.join(SEEDS_DIR, file));
      }
      console.log('\n✅ Seed data applied successfully.');
    }

  } catch (err: any) {
    console.error('\n❌ Migration failed:', err.message);
    if (err.detail) console.error('   Detail:', err.detail);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed.');
  }
}

runMigrations();
