import { query } from '@/lib/db'

/** Ensures users table exists without role column (drops legacy `role` if present). */
export async function ensureUsersTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `)
  await query(`ALTER TABLE users DROP COLUMN IF EXISTS role;`)
}
