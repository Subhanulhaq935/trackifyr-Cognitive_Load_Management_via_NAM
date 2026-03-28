import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSessionTokenFromRequest, SESSION_COOKIE_NAME } from '@/lib/auth-session'

export const runtime = 'nodejs'

export async function POST(request) {
  const token = await getSessionTokenFromRequest(request)

  try {
    if (token) {
      await query(`DELETE FROM sessions WHERE token = $1`, [token])
    }
  } catch {
    // Even if session deletion fails, still clear cookie.
  }

  const res = NextResponse.json({ success: true })
  res.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  })
  return res
}

