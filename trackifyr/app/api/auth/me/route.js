import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSessionTokenFromRequest } from '@/lib/auth-session'
import { ensureUsersTable } from '@/lib/usersSchema'

export const runtime = 'nodejs'

export async function GET(request) {
  try {
    const token = await getSessionTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ success: false }, { status: 401 })
    }

    await ensureUsersTable()

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
        u.email
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
      },
    })
  } catch (err) {
    console.error('[auth/me]', err)
    const detail =
      process.env.NODE_ENV === 'development' && err && typeof err.message === 'string'
        ? err.message
        : 'Server error'
    return NextResponse.json({ success: false, error: detail }, { status: 500 })
  }
}

