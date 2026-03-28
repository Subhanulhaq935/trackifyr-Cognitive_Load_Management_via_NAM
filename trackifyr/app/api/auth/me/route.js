import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSessionTokenFromRequest } from '@/lib/auth-session'

export const runtime = 'nodejs'

export async function GET(request) {
  try {
    const token = await getSessionTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ success: false }, { status: 401 })
    }

    // Ensure tables exist (first-time dev safety).
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'Student',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `)

    await query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `)

    const result = await query(
      `
      SELECT
        u.id,
        u.full_name,
        u.email,
        u.role
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token = $1 AND s.expires_at > now()
      LIMIT 1
    `,
      [token],
    )

    const user = result.rows[0]
    if (!user) {
      return NextResponse.json({ success: false }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
    })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

